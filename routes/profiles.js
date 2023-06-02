const express = require('express');

const router = express.Router();
const { createDynamicTable, getTableList, sequelize, dropTable } = require('../models/index');
const profile_model = require('../models/profile');

router.post('/', async (req, res) => {
    const profiles = req.body;
    let count = 0;
  
    try {
        const tableList = await getTableList();
  
    for (let file_num = 0; file_num < profiles.length; file_num++) {
        profiles[file_num][0][0] = profiles[file_num][0][0].toLowerCase().slice(0,-4);
  
        if (tableList.includes(profiles[file_num][0][0])) {
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
        
        const tasks = await profile_model.findAll({
            attributes: [sequelize.fn('DISTINCT', sequelize.col('core')), 'core'],
        });

        const cores = await profile_model.findAll({
            attributes: [sequelize.fn('DISTINCT', sequelize.col('task')), 'task'],
        });
        
        res.json({datas: datas, cores : cores, tasks : tasks});
    }catch(error){
        console.error('데이터 조회 오류', error);
    }
});

router.delete('/drop/:tableName', async(req,res)=>{
    try{
        const {tableName} = req.params;
        dropTable(tableName);
        res.json({state:'success'});
    }catch(error){
        res.json({state:'error'});
    }
});

router.get('/coredata/:tableName/:core', async(req,res)=>{

    const { tableName, core } = req.params;

    profile_model.initiate(sequelize, tableName);

    const data = await profile_model.findAll({
        attributes: [
          'task',
          [sequelize.fn('max', sequelize.col('usaged')), 'max_usaged'],
          [sequelize.fn('min', sequelize.col('usaged')), 'min_usaged'],
          [sequelize.fn('avg', sequelize.col('usaged')), 'avg_usaged']
        ],
        where: {
          core: core
        },
        group: ['task']
      });

    res.json(data);
});

router.get('/taskdata/:tableName/:task', async(req,res)=>{
    const { tableName, task } = req.params;

    profile_model.initiate(sequelize, tableName);


    const data = await profile_model.findAll({
        attributes: [
          'core',
          [sequelize.fn('max', sequelize.col('usaged')), 'max_usaged'],
          [sequelize.fn('min', sequelize.col('usaged')), 'min_usaged'],
          [sequelize.fn('avg', sequelize.col('usaged')), 'avg_usaged']
        ],
        where: {
          task: task,
        },
        group: ['core']
      });

    res.json(data);
});

module.exports = router;