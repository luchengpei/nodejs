var express = require('express');
var router = express.Router();
const crypto=require('crypto')
const emailjs=require('emailjs')
const validator=require('validator')
const fs=require('fs')
const path=require('path')
const emailjsServer= emailjs.server.connect({
    user:'wait_you_tqy@qq.com',
    password:'vshmbkgnrivgfjfe',
    host:'smtp.qq.com',
    ssl:true
})
/* GET home page. */
router.get('/', function(req, res, next) {
    // console.log(req.db)
    // res.end('ok')
});



//后台管理接口
router.post('/api/users/manager',function(req,res){
    const {query,body,db,session}=req
   // console.log(body)
    let {request}=query
    let {account,email,phone,password}=body
    if(request=='adduser'){
        let  error={}
        if(account){
            if(account.length<4||account.length>13){
                error['account']='账号格式不正确 '
            }
        }else{
            error['account']='账号必填'
        }
        if(email){
            if(!validator.isEmail(email)){
                error['email']='邮箱 格式不正确'
            }
        }else{
            error['email']='邮箱 必填'
        }
        if(phone){
            if(!validator.isMobilePhone(phone,'zh-CN'))[
                error['phone']='手机格式不正确'
            ]
        }else{
            error['phone']='手机必填 '
        }
        if(password){

        }else{
            error['password']='密码必填' 
        }
        if(Object.keys(error).length>0){
            console.log(111)
            res.status=200
            res.json({
                code:0, 	
                error:error, 
                message:`添加失败，参数不正确，必填 参数不能为空 ！`,
                data:{}  
            })
        }else{
            console.log('进来')
            db.collection('users').find({
                $or:[
                   {account:account},
                   {email:email},
                //    {role:role} ,
                   {phone:phone},
                ]
            },function(err,data){
                if(data.length>0){
                    data.map(k=>{
                        if(k.account==account){
                            error['accoount']='该 账号已被使用'
                        }
                        if(k.email==email){
                            error['email']='该邮箱已被 使用'
                        }
                        if(k.phone==phone){
                            error['phone']='该手机已被使用'
                        }
                    })
                    res.status=500
                    res.json({
                        code:0, 	
                        error:error, 
                        message:`添加失败，参数不正确！`,
                        data:{ } 
                    })
                }else{
                    //console.log(5201314)
                    let pawd=crypto.createHash('md5').update(password).digest('hex')
                    if(account=='admin'){
                        db.collection('users').insert({
                            account:account,
                            email:email,
                            role:0,
                            phone:phone,
                            password:pawd,
                            creart_time:new Date()
                        },(err,result)=>{
                            // console.log('ok')
                            // console.log(result)
                           //console.log(result.ops[0].password)
                           delete result.ops[0].password
                           res.status=200
                            res.json({
                                code:1, 	
                                error:null, 
                                message:`添加成功` ,
                                data:result
                            })
                        })
                    }else{
                        db.collection('users').insert({
                            account:account,
                            email:email,
                            role:1,
                            phone:phone,
                            password:pawd
                        },(err,data)=>{
                            
                            delete data.ops[0].password
                            
                            res.status=200
                            res.json({
                                code:1, 	
                                error:null, 
                                message:`添加成功` ,
                                data:data
                            })
                        })
                    }
                }
            })
        }
    }
    //删除 接口   
    if(request=='rmuser'){
        const {body,session,db}=req
        const{where}=body
        let error={}
        //console.log(where)
        let addition={}
        if(!where){
            error['where']='条件不能为空'
        }
        if(Object.keys(error).length>0){
            res.status=200
            res.json({
                code:0,
                error:error,
                message:'条件异常 ',
                data:{}
            })
        }else{
        //    console.log(db)
        //console.log(addition)
        if(validator.isEmail(where)){
            addition['email']=where
        }else if(validator.isMobilePhone(where,'zh-CN')){
            addition['phone']=where
        }else{
            addition['account']=where
        }
          db.collection('users').find(addition,function(err,data){
             // console.log(data)
              if(data.length>0){
                //   console.log('不存在？')
                    db.collection('users').remove(addition,function(err,data){
                        res.status=200
                        res.json({
                            code:1,
                            error:null,
                            message:'删除成功 ',
                            data:data
                        })
                        console.log(data)
                    })
              }else{
                res.json({
                    code:0,
                    error:'条件不存在',
                    message:'条件不存在 ',
                    data:{}
                })
                return
              }
          })
        }
    }
    //修改接口  判断考虑多了  。。。
    if(request=='uptuser'){
        // console.log(111)
        const{body,db}=req
        const{where,data}=body
        let error={}
        let addition={}
    //         if(!validator.isEmail(where)||!validator.isMobilePhone(where,'zh-CN')){
    //             error['email']='邮箱格式不正确'
    //         }else if(where.length<4||where.length>16){
    //             error['account']='账号长度 不正确'
    //         }
      
    //    else{
    //         error['where']='条件不能为空'
    //    }
        if(!where){
            error['where']='条件不能为空'
        }
       if(!typeof data==JSON){
            error['data']='参数不正确'
       }
       if(Object.keys(error).length>0){
           res.status=500
           res.json({
               code:0,
                error:error,
                message:'更新失败，参数类型不正确',
                data:{}
           })
       }else{
           //console.log(963288)
           if(validator.isEmail(where)){
               addition['email']=where
           }else if(validator.isMobilePhone(where,'zh-CN')){
               addition['phone']=where
           }else{
               addition['account']=where
           }
       }
       //console.log(addition)
       db.collection('users').find(addition,function(err,result){
          // console.log(result)
           if(result.length>0){
                db.collection('users')
                    .update(addition,{$set:{account:data}},(err,result)=>{
                        if(err)throw err
                        //console.log(result)
                        // return
                        if(result.length>0){
                            let  pswd=result.ops[0].password
                            if(pswd){
                                delete result.ops[0].password
                            }
                        }
                        res.status=200
                            res.json({
                                code:1,
                                error:null,
                                message:'更新数据成功',
                                data:result
                            })
                })
           }else{
               res.json({
                code:0,
                error:'更新失败，该用户不存在',
                message:'更新失败，该用户不存在',
                data:{}
               })
           }
       })

    }
    //查询接口  判断考虑多了  。。。
    if(request=='fduser'){
        const{body,db}=req
        const{where,limit,page,sort}=body
        let error={}
        let addition={}
        // console.log(body)
        // if(where){
        //     if(!validator.isEmail(where)){
        //         error['email']='email邮箱格式不正确'
        //     }
        //     if(!validator.isMobilePhone(where,'zh-CN')){
        //         error['phone']='手机格式不正确'
        //     }
        //     if(where.length<4||where.length>16){
        //         error['account']='账号格式不正确'
        //     }
        // }
        if(!where){
            error['where']='条件不能 为空'
        }
        if(limit){
            if(isNaN(limit)){
                error['limit']='limit类型不正确'
            }else if(Number(limit<0||Number(limit)>100)){
                error['limit']='查询条件参数不正确'
            }
        }
        if(page){
            if(isNaN(page)){
                error['page']='page类型不正确'
            }else if(Number(page)<0){
                error['page']='page条件参数 不正确'
            }
        }
        // if(!sort){
        //     sort=1
        // }
        if(Object.keys(error).length>0){
            res.json({
                code:0, 	// 1代表成功
                error:error,
                message:'查询失败,条件参数不正确',
                data:{}
            })
        }else{
            //console.log(505)
            if(validator.isEmail(where)){
                addition['email']=where
            }else if(validator.isMobilePhone(where,'zh-CN')){
                addition['phone']=where
            }else{
                addition['account']=where
            }
        }
        // console.log(addition)
        db.collection('users').find(addition,function(err,data){
            if(data.length>0){
               // console.log('have data')
                db.collection('users').find(addition)
                    .limit(Number(limit)||100)
                    .skip(Number(page)||0*Number(limit))
                    .sort({
                        _id:sort||1
                    },function(err,data){
                        res.status=200
                        res.json({
                            code:1,
                            error:null,
                            message:'查询 成功 ',
                            data:data
                        })
                    })
            }else{
                res.status=500
                res.json({
                    code:0, 	// 1代表成功
                    error:null,
                    message:'查询失败，没有数据',
                    data:{}
                })
            }
        })
    }
})


//发送邮箱验证码
router.get('/sendEmailcode',function(req,res){
    const{query,db}=req
    const {email}=query
   // console.log(query.email)
    let error={}
    if(email){
        if(!validator.isEmail(email)){
            error['email']='邮箱 格式不正确'
        }
    }else{
        error['email']='邮箱不能为空'
    }
    if(Object.keys(error).length>0){
        res.status=500
        res.json({
            code:0,
            error:error,
            message:'发送 失败 ',
            data:{}
        })
        return
    }else{
        // console.log(email)
        // console.log(req.db)
        //console.log(444)
        db.collection('users').find({email},function(err,data){
            //console.log('没进来')
           // if(err) throw err
            if(data.length>0){
               // console.log(666)
                data.map(k=>{
                    if(k.email==email){
                        error['email']="该邮箱已被使用"
                    }
                    res.json({
                        code:0, 	// 1代表成功
                        error:error, 
                        message:`发送失败 ！`,
                        data:{ }  // 失败没有data
                    })
                })
                return
            }else{
                function creatCode(length){
                    let emailCode=''
                    for(let i=0;i<length;i++){
                        emailCode+=Math.floor(Math.random()*10)
                    }
                    return emailCode
                }
                req.session.emaillCode=creatCode(4)
                console.log(creatCode(4))
               // console.log(333)
                emailjsServer.send({
                    text:` 三阶段考试 验证码${req.session.emaillCode}!`,
                    from:'wait_you_tqy@qq.com',
                    to:email,
                    subject:'腰间盘突出的同学，请不要太突出 ！'
                },function(err,message){
                    if(err)throw err
                    res.status=200
                    res.json({
                        status:1,
                        msg:'发送成功',
                        
                    })
                })
            }
        })
    }
    

})

//注册账号接口
router.post('/api/users',function(req,res){
        const {query,body,db,session}=req
        const{request}=query
        let{account,email,valid,phone,password}=body
        //console.log(valid)
       // console.log(req.body)
        if(request=='register'){
            let error={}
                if(account){
                    if(account.length<6||account.length>12){
                        error['account']='账号长度不正确'
                    }
                } else{
                    error['account']='账号不能为空'
                }
                if(email){
                    if(!validator.isEmail(email)){
                        error['email']='邮箱格式不正确'
                    }
                }else{
                    error['email']='邮箱 不能为空'
                }
                if(valid){
                    if(!valid.length==4||valid.length<3||valid.length>4){
                        error['valid']='邮箱验证码长度不正确'
                    }
                }else{
                    error['valid']='邮箱验证码 不能为空'
                }
                if(phone){
                    if(!validator.isMobilePhone(phone,'zh-CN')){
                        error['phone']='手机 号码 格式不正确'
                    }
                }else{
                    error['phone']='手机号码 不能为空'
                }
                if(password){ 
                   
                    if(password.length<6||password.length>14){
                        error['password']='密码长度不正确'
                        console.log(password)
                    }
                }else{
                  error['password']='密码 不能 为空'
                }
                //前面条件都通过 查询 注册到数据库
                if(Object.keys(error).length>0){
                    // console.log(789)
                    res.status=500
                        res.json({
                            code:0, 	// 1代表成功
                            error:error, 
                            message:`注册失败，参数不正确！`,
                            data:{ }  // 失败没有data
                        })
                        return
                }else{
                    //console.log('comein')
                    db.collection('users').find({
                        $or:[
                           {'account':account},
                           {'phone':phone},
                           {'email':email}
                        ]
                    },function(err,data){
                        //let error={}
                        //console.log('aaaaa')
                        //console.log(data)
                        // if(err) throw err;
                       // return
                        if(data.length>0){
                            // console.log(111)
                            data.map(k=>{
                                if(k.account==account){
                                    error['account']='该账号已被注册'
                                }
                                if(k.phone==phone){
                                    error['phone']='该手机已被使用'
                                }
                                if(k.email==email){
                                    error['email']='该邮箱已被使用'
                                }
                            })
                           // res.setHeader('Content-Type','JSON')
                           res.status=500
                            res.json({
                                code:0, 	// 1代表成功
                                error:error,
                                message:`注册失败，该用户已被注册！`,
                                data:{}  // 失败没有data
                            })
                        }else{
                         //   console.log('进来啊')
                           if(req.session.emaillCode==valid){
                               console.log('code')
                            let pawd=crypto.createHash('md5').update(password).digest('hex')
                            db.collection('users').insert({
                                account:account,
                                phone:phone,
                                email:email,
                                password:pawd
                            },err=>{
                                if(err) throw err
                                res.status=200
                                res.json({
                                    code:1, 	// 1代表成功
                                    error:{}, // error 为空对象
                                    message:`注册成功`, // 消息输出
                                    data:{
                                        
                                    }
                                })
                            })
                               
                        }else{
                            // console.log(987)
                            
                           res.json({
                            code:0, 	// 1代表成功
                            error:'邮箱验证码不正确，注册 失败', // error 为空对象
                            message:`邮箱验证码不正确，注册 失败`, // 消息输出
                           })
                        }
                          
                         
                            
                        }
                    })
                }
        }
        //登陆接口 
        if(request=='login'){
            let error={}
            const{body,session}=req
            const{account,password}=body
          //  console.log(body)
            if(account){
                if(account.length<4||account.length>12){
                    error['account']='账号长度 不正确 '
                }
            }else{
                error['account']='账号不能为空'
            }
            if(password){
                if(password.length<6||password.length>16){
                    error['password']='密码长度不正确'
                }
            }else{
                error['password']='密码不能为空'
            }
            if(Object.keys(error).length>0){
                //console.log('kong')
                res.status=500
                res.json({
                    code:0, 	// 1代表成功
                    error:error, 
                    message:`登录失败，参数不正确！`,
                    data:{ }  // 失败没有data
                })
                // return
            }else{
                // console.log(111)
                let format={}
                if(validator.isEmail(account)){
                    format['email']=account
                }else if(validator.isMobilePhone(account,'zh-CN')){
                    format['phone']=account
                }else{
                    format['account']=account
                }
               // console.log(format)
                const pawd=crypto.createHash('md5').update(password).digest('hex')
                db.collection('users').find(format,function(err,data){
                    if(data.length>0){
                        if(pawd==data[0].password){
                             req.session.status=data[0]
                            delete data[0].password
                            res.status=200
                            res.json({
                                code:1, 	// 1代表成功
                                error:null, // error 为空对象
                                message:`登录成功`, // 消息输出
                                data:[...data], 
                            })
                        }else{
                            res.json({
                                code:1, 	// 1代表成功
                                error:'密码不正确', // error 为空对象
                                message:`密码不正确 `, // 消息输出
                                data:{},
                            })
                        }
                    }else{
                        // res.status(500).send()
                        res.status=404
                        res.json({
                            code:2, 	// 1代表成功
                            error:'登陆失败，没有该账号', 
                            message:`登陆失败，没有该账号！`,
                            data:{ }  // 失败没有data
                        })
                    }
                })
            }
        }
        

        //存登陆信息接口 
        router.post('/checklogin',function(req,res,next){
            res.json(req.session.status)
        })
        //res.end('ok')
})

//找回密码
router.post('/api/reset',function(req,res){
    
    const{query,body,db,session}=req
    const {email}=body
    console.log(body)
    if(query.request=='password'){
        let error={}
        if(email){
            if(!validator.isEmail(email)){
                error['email']='邮箱格式不正确'
            }
        }else{
            error['email']='邮箱不能为空'
        }
        if(Object.keys(error).length>0){
            res.status=500
            res.json({
                code:0, 	// 1代表成功
                error:error,
                message:`发送失败` ,
                data:{}
            })
        }else{
            db.collection('users').find({email},function(err,data){
                if(data.length>0){
                    res.status=500
                    res.json({
                        code:0, 	// 1代表成功
                        error:'该邮箱已被 使用',
                        message:`发送失败 该邮箱已被 使用` ,// 消息输出
                        data:{}
                    })
                }else{
                    function creatCode(len){
                        let randomCode=''
                        for(let i=0;i<len;i++){
                            randomCode +=Math.floor(Math.random()*10)
                        }
                        return randomCode
                    }
                    req.session.emailCode=creatCode(4)
                    //console.log(req.session.emailCode)
                    emailjsServer.send({
                        text:` 找回密码验证${req.session.emailCode}!`,
                            from:'wait_you_tqy@qq.com',
                            to:body.email,
                            subject:'辅助找回密码 ！'
                        },function(err,message){
                            console.log(req.session.emailCode)
                            setTimeout(function(){
                                    req.session.emailCode=null
                            },300000)
                            if(err)throw err
                            res.status=200
                            res.json({
                               code:1,
                               error:null,
                               message:'发送成功',
                                data:message
                            })
                    }) 
                }
            })
        }
    }

})
//第四个 接口 上传用户头像
router.post('/api/upload',function(req,res){
    const{query,body,db,session,files}=req
    const{_id,email,phone}=body
    const {request}=query
    // console.log(files[0])
    let pic=files[0].mimetype
    // console.log(pic)
    // return
    if(request=='avatar'){
        if(!req.session.status){
            res.status=500
            res.json({
                code:0,
                error:'该用户未登录',
                message:'上传失败 ，该用户 未登录',
                data:{}
            })
            return
        }
        let addition={}
        let error={}
        if(_id){
            if(_id.length<4||_id.length>12){
                error['_id']='用户id长度不正确'
            }
        }else{
            error['_id']='用户 id不能为空'
        }
        if(email){
            if(!validator.isEmail(email)){
                error['email']='用户邮箱格式不正确'
            }
        }else{
            error['email']='用户邮箱不能 为空'
        }
        if(phone){
            if(!validator.isMobilePhone(phone,'zh-CN')){
                error['phone']='用户手机号码格式不正确'
            }
        }else{
            error['phone']='用户手机不能为空'
        }
        if(!pic){
                error['pic']='图片不能为空'
        }else if(pic){
           if(!pic.mimetype=='image/jpeg'){
               error['pic']='图片格式不正确'
           }
        }
        
        if(Object.keys(error).length>0){
            res.status=500
            res.json({
                code:0,
                error:error,
                message:'上传失败 ，参数不正确',
                data:{}
            })
        }else{
            let  t=new Date().getSeconds()
            let extname=path.extname(req.files[0].originalname)
            let filename =crypto.createHash('md5')
                .update(req.files[0].originalname+t)
                .digest('hex')+extname
            let filepath=path.join(__dirname,'..','public','img',filename)
            let urlpath=path.join('img',filename)
            // console.log(urlpath)
            // console.log(filename)
            // console.log(filepath)
            //  return
            fs.writeFile(filepath,req.files[0].buffer,err=>{
                if(err) throw err
                db.collection('users').insert({
                    originalname:req.files[0].originalname,
                    mimetype:req.files[0].mimetype,
                    size:req.files[0].size,
                    uri:urlpath,
                    path:filepath
                },(err,data)=>{
                    if(err)  throw err
                    res.status=200
                    res.json({
                        code:1,
                        error:null,
                        message:'上传成功',
                        data:data.ops[0].uri
                    })
                })
            })

        }
    }


})
// router.post('/check',function(req,res){
//     console.log(req.session.emailCode)
//     res.send(req.session.emailCode)
// })
module.exports = router;
