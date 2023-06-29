const jwt1 = require('jsonwebtoken');
const jwtKey1 = 'jianghengkey';
// 验证 Token 的中间件函数
function verifyToken(req, res, next) {
    // 从请求头中获取 Token
    const token = req.headers.authorization;
    console.log(token)
    // 检查 Token 是否存在
    if (!token || token == '') {
        return res.status(401).json({ message: 'Token not provided' });
    }
    else {
        // 验证 Token

        let decoded = '';
        let verifyP=new Promise((resolve,reject)=>{
            jwt1.verify(token, jwtKey1, (err, payload) => {
                if (err) {
                    reject(false)
                } else {
                    resolve(payload)
                }
            })
        })
        verifyP.then(resp=>{
            console.log('验证成功');
            next();
        }).catch(err=>{
            res.send({
                msg:'登录状态已过期,请重新登录',
                state:3
            })
        })
    }

}

module.exports = verifyToken;