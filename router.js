const express2 = require('express');
const jwt2 = require('jsonwebtoken');
const jwtKey2 = 'jianghengkey';//私钥 随便写 
const router = express2.Router();
const fs = require('fs');
const verifyToken =require ('./verify');
const mysql = require('mysql');
const { resolve } = require('path');
const path = require('path');
const api = 'http://127.0.0.1:8090/';
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'jianghenging',
    database: 'yiyuan_ch'
})
// let sqlstr2 = "insert into news(title,date,mainimg,html,imglist) values(?,?,?,?,?)";
// let data2={title:'test',subtime:'123457777777777',mainImg:'http://127.0.0.1:8082/20230213T084543025Z442270.jpg',htmlMsg:'test',imgList:'test'};
// db.query(sqlstr2, [data2.title, data2.subtime, data2.mainImg, data2.htmlMsg, data2.imgList], (err, results) => {
//     if(err){
//         console.log(err.message)
//     }else{
//         if (results.affectedRows === 1) {
//             console.log('新闻发布成功') 
//         }
//         else {
//             console.log('新闻发布失败')
//         }
//     }

// })

router.post('/updatepwd',verifyToken,(req,res)=>{
    let data=req.body;
    // 先查询当前密码是否正确
    console.log(data);
    let sqlstr1="select userpwd from users where username=?";
    let sqlstr2="update users set userpwd=? where username=?";
    if(data!='' && data != null){
        db.query(sqlstr1,[data.username],(err,results)=>{
            if(err){
                return res.send({state:1,message:err.message})
            }else{
                let pwd=results[0].userpwd;
                
                if(data.pwdnow==pwd){
                  db.query(sqlstr2,[data.newpwd,data.username],(err,results)=>{
                    if(err){
                        return res.send({state:1,message:err.message})
                    }else{
                        if(results.affectedRows===1){
                            res.send({state:0,message:'密码修改成功'})
                        }
                        else{
                            res.send({state:1,message:'密码修改失败，请联系管理员'})
                        }
                    }
                  })  
                }
            }
        })
    }
})
// 更新新闻数据
router.post('/updatenews', verifyToken,async (req, res) => {
    let data = req.body;
    let sqlstr = "update news set title=?, date=?, mainimg=?, html=?, imglist=? where id=? ";
    if (data != '' && data != null) {
        data.subtime = parseInt(data.subtime);
        console.log(data);
        db.query(sqlstr, [data.title, data.subtime, data.mainimg, data.htmlMsg, data.imgList,data.id], (err, results) => {
            if (err) {
                console.log(err.message)
            } else {
                if (results.affectedRows === 1) {
                    res.send({ state: 0, message: '新闻修改成功' })
                }
                else {
                    res.send({ state: 1, message: '新闻修改失败,请联系管理员处理' })
                }
            }

        })
    }
})
// 删除新闻
router.post('/delnews',verifyToken,(req,res)=>{
    let data=req.body;
    let sqlstr='delete from news where id=?'
    if(data.id){
        console.log(data);
        delImg(data.imglist,data.mainimg);
        db.query(sqlstr,[data.id],(err,results)=>{
            if(err){
                return  res.send({ state: 1, message:err.message })
            }
            if(results.affectedRows===1){
                res.send({ state: 0, message:'数据删除成功' })
            }

        })
    }
})
// 删除相关图片
function delImg(imglist,mainimg){
    let pathArr=imglist.split(',');
    console.log(pathArr);
    pathArr.forEach((item,index)=>{
        fs.unlink('./upload/'+item,(err)=>{
            if(err){
                return console.log(err.message)
            }
            console.log('删除成功')
        })
    })
    console.log(mainimg);
    let mainimg2=mainimg.split('/');
    let mainimg3=mainimg2[mainimg2.length-1];
    console.log(mainimg3);
    fs.unlink('./upload/'+mainimg3,(err)=>{
        if(err){
            return console.log(err.message)
        }
        console.log('删除主图成功')
    })
}

// 新增新闻
router.post('/addnews',verifyToken,(req, res) => {
    let data = req.body;
    let sqlstr = "insert into news(title,date,mainimg,html,imglist) values(?,?,?,?,?)";
    if (data != '' && data != null) {
        data.subtime = parseInt(data.subtime);
        db.query(sqlstr, [data.title, data.subtime, data.mainImg, data.htmlMsg, data.imgList], (err, results) => {
            if (err) {
                res.send({ state: 1, message:err.message })
            } else {
                if (results.affectedRows === 1) {
                    res.send({ state: 0, message: '新闻发布成功' })
                }
                else {
                    res.send({ state: 1, message: '新闻发布失败,请联系管理员处理' })
                }
            }

        })
    }
})
// 图片上传
router.post('/uploadimg', verifyToken,async (req, res) => {
    let imgData = req.body.file;
    let base64Data = imgData.replace(/^data:image\/jpeg;base64,/, "");
    let dataBuffer = new Buffer.from(base64Data, 'base64');
    let fileName = getRandomFileName() + '.jpg';
    let body = {
        state: 0,
        message: '',
        imgUrl: '',
        imgName: fileName
    }
    fs.writeFile('./upload/' + fileName, dataBuffer, function (err) {
        if (err) {
            body.state = 1;
            body.message = '文件上传失败';
            body.imgUrl = '';
            return res.send(body);
        }
        else {
            body.state = 0;
            body.message = '文件上传成功';
            body.imgUrl = `${api}${fileName}`;
            res.send(body);
        }
    })
})
function getRandomFileName() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    var random = ("" + Math.random()).substring(2, 8);
    var random_number = timestamp + random;
    return random_number;
}
// let str3="select * from news";
// db.query(str3,(err,results)=>{
// 	if(err){
// 		console.log(err.message)
// 	}
// 	else{
// 		console.log(results)
// 	}
// })
// 登录
router.post('/login', (req, res) => {
    const query = req.body;
    if (query == '' || query == null) {
        res.send({
            state: 1,
            message: '登录失败，请检查用户名以及密码是否输入正确',
            data: query
        })
    } else {
        let sqlstr = "select * from users where username=? and userpwd=?"
        db.query(sqlstr, [query.username, query.userpwd], (err, results) => {
            if (err) {
                res.send({
                    state: 1,
                    message: '数据库链接异常，请联系工作人员'
                })
                return console.log(err.message)
            } else {
                if (results.length > 0) {
                    let username = query.username;
                    jwt2.sign({ username }, jwtKey2, { expiresIn: '86400s' }, (err, token) => {
                        res.send({
                            state: 0,
                            message: '登录成功',
                            token: token
                        })
                    })

                } else {
                    res.send({
                        state: 1,
                        message: '登录失败，请检查用户名以及密码是否输入正确',
                        data: query
                    })
                }
            }
        })
    }
})
// let sqlstr = "select id,title,date,mainimg,html from news";
// db.query(sqlstr, (err, results) => {
//     if (err) {
//         return console.log(err.message)
//     } else {
//         let dataArr = [];
//         results.forEach((item, index) => {
//             dataArr.push(item)
//         })
//        console.log(dataArr);
//     }
// })
// 获取指定新闻
router.get('/getnews',(req,res)=>{
    let query=req.query;
    let sqlstr='select * from news where id=?';
    console.log(query.newsid);
    if(query.newsid){
        db.query(sqlstr,[query.newsid],(err,results)=>{
            if (err) {
                return res.send({state: 1,message: '获取数据失败' })
            } else {
                console.log(results);
                res.send({state:0,message:'数据请求成功',data:results[0]})
            }
        })
    }
})
//获取新闻列表
router.get('/getnewslist',verifyToken, (req, res) => {
    let query = req.query;
    let sqlstr = "select id,title,date,mainimg,html,imglist from news order by id asc";
    db.query(sqlstr, (err, results) => {
        if (err) {
            return  res.send({
                state: 1,
                message: '加载数据失败，请联系管理员处理'
            })
        } else {
            let dataArr = [];
            results.forEach((item, index) => {
                dataArr.push(item)
            })
            res.send({state:0,message:'数据请求成功',data:dataArr})
        }
    })
})
//检测用户token
// router.get('/checkuserstate', (req, res) => {
//     let headers = req.headers;
//     const token = headers.Authorization;
//     jwt2.verify(token, jwtKey2, (err, payload) => {
//         if (err) {
//             res.send({
//                 state: 3,
//                 message: '用户验证已失效，请重新登录'
//             })
//         } else {
//             res.send({
//                 state: 0,
//                 message: '用户验证成功',
//                 data: payload
//             })
//         }
//     })
// })
module.exports = router;