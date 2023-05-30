const express = require('express');

const router = express.Router();
const { createDynamicTable, getTableList, sequelize } = require('../models/index');
const profile_model = require('../models/profile');

router.post('/', async (req, res) => {
    const profiles = req.body;
    let count = 0;
  
    try {
        const tableList = await getTableList();
  
    for (let file_num = 0; file_num < profiles.length; file_num++) {
        const tableName = profiles[file_num][0][0].toLowerCase();
  
        if (tableList.includes(tableName)) {
          console.log("이미 존재하는 파일입니다");
          continue;
        }

        await createDynamicTable(profiles[file_num]);
        count++;
    }
        if(count===0){
            res.json({ status: 'success', message: `저장 가능한 파일이 존재하지 않습니다.` });
        }else if(count==profiles.length){
            res.json({ status: 'success', message: `${count}개의 프로파일이 정상적으로 저장되었습니다.` });
        }else{
            res.json({ status: 'success', message: `중복된 이름의 파일을 제외한 ${count}개의 프로파일이 저장되었습니다.` });
        }


    } catch (error) {
        console.error('오류가 발생하였습니다:', error);
        res.json({ status: 'error', message: '오류가 발생하였습니다.' });
    }
});

router.get('/', async (req,res)=>{
    const tableList = await getTableList();
    res.json(tableList);
});

router.get('/data/:tableName', async (req,res)=>{
    try{
        const {tableName} = req.params;

        const tableList = await getTableList();
        if(!tableList.includes(tableName)){
            return res.status(404).json({error:'존재하지 않는 파일입니다.'});
        }
        
        profile_model.initiate(sequelize, tableName);

        const datas = await profile_model.findAll();
        
        const tesks = await profile_model.findAll({
            attributes: [sequelize.fn('DISTINCT', sequelize.col('core')), 'core'],
        });
        //console.log(core);

        const cores = await profile_model.findAll({
            attributes: [sequelize.fn('DISTINCT', sequelize.col('tesk')), 'tesk'],
        });
        //console.log(tesk);

        res.json({datas: datas, cores : cores, tesks : tesks});
    }catch(error){
        console.error('데이터 조회 오류', error);
    }
});

router.get('/coredata/:tableName/:core', async(req,res)=>{

    const { tableName, core } = req.params;
    console.log('core.');

    profile_model.initiate(sequelize, tableName);

    const data = await profile_model.findAll({
        attributes: ['tesk', 'usaged'],
        where: {
            core: core,
        }
    });
    res.json(data);
});

router.get('/teskdata/:tableName/:tesk', async(req,res)=>{
    const { tableName, tesk } = req.params;
    console.log('tesk.');

    profile_model.initiate(sequelize, tableName);

    const data = await profile_model.findAll({
        attributes: ['core', 'usaged'],
        where: {
            tesk: tesk,
        }
    });
    res.json(data);
});

module.exports = router;