const express = require('express');

const router = express.Router();
const { getTableList } = require('../models/index');

router.get('/', async (req,res)=>{
    getTableList()
        .then((tableList) => {
            console.log('테이블 리스트:', tableList);
            res.render('index', {tableList});
        })
        .catch((error) => {
        console.error('테이블 리스트 조회 중 오류가 발생하였습니다:', error);
        });
});

module.exports = router;