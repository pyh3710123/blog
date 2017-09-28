var express = require('express');//引入express 模块  导入依赖
var mongoose = require('mongoose'); //引入mongo user Schema
var validator = require('validator');
var formidable = require('formidable');
var pubfun    = require('../lib/common.model.js');
var userModel = require('../models/users.js');
var credentials = require('../credentials.js');
/*var emailService = require('../lib/email.js')(credentials);*/
var fs = require('fs');
const  AVATAR_UPLOAD_FOLDER = '/avatar/';
var router = express.Router();//

/*创建路由*/
router.get('/list',getUsers);
function getUsers(req,res,next) {
    userModel.find({},function (err,users) {
       if(err){
           res.send(err);
       }
        else{
        res.render('users/list',{data:users});
       }
    });
}
router.get('/sign-out', function(req, res,next){
    req.session.loginName=null;
    req.session.phone=null;
    return  res.redirect('/');
});
router.get('/profile',getProfile);
function getProfile(req,res,next){
    userModel.find(
        {'phone':req.session.phone,
        }
        ,function (err,users) {
            if(err)
            {
                console.log(err);
            }else {
                //console.log(users);
                if(users.length>0)
                {
                    var context = {};
                    var now         = new Date();
                    context.phone   = req.body.phone;
                    context.year    = now.getFullYear();
                    context.month   = now.getMonth();
                    context.timestr = Date.now();
                    context.user    = users[0];
                    console.log(users[0]._id)
                    req.session.author=users[0]._id;
                    res.render('users/profile',context);
                }
            }

        });

}
router.post('/upload-profile/:phone/:year/:month/:timestr',uploadProfile)
//更新个人俏像
function updateProfilePicture (phone,imgpath) {
    var data = {};
    userModel.update({phone:phone},
        {$set:{picture:imgpath,
            update:true}},
        {upsert:false,multi:false}).exec(function (err,users) {
        if(err){
            data = {msg: 'Update failure for '+ phone,code:'0'};
        }else {

            data = {msg: 'Update successful for '+ phone,code:'1'};
        }

    });
}
function uploadProfile(req,res) {
    console.log(req.body);
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');

        var extName = '';  //后缀名
        switch (files.photo.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        console.log(files);
        //req.params.timestr
        var newPath = 'public/avatar_2/'+req.params.timestr+"."+extName;
        fs.renameSync(files.photo.path, newPath);  //重命名
        //console.log(files.photo.path+"-----"+files.photo.name +"###"+ extName +"==="+req.params.year);
        //console.log('received fields:');
        var imgpath='/avatar_2/'+req.params.timestr+"."+extName;
        updateProfilePicture (req.params.phone,imgpath);

        //var data = {imgpath:imgpath};
        return  res.redirect('/users/profile?imgpath='+imgpath);
        // return  res.send(data);

    });
}
router.post('/profile-save' ,profileSave);
function profileSave(req,res,next){
    var data = {};
    userModel.update({phone:req.body.phone},
        {$set:{username:req.body.username,
            realname:req.body.realname,
            /*nicname:req.body.nicname,*/
            gender:req.body.gender,
            email:req.body.email,
             age:req.body.age,
           /* address:req.body.address,*/
            update:true}},
        {upsert:false,multi:false})
        .exec(function (err,users) {
            if(err){
                data = {msg: 'Update failure for '+ req.body.phone +"==="+err,
                    code:0};
            }else {
                req.session.loginName=req.body.realname;
                data = {msg: 'Update successful for '+ req.body.phone,
                    code:1 ,
                    url:'/blog/list-sn/'+req.body.phone};
              /*  emailService.send(
                    req.body.email,
                    'Thank you for signup!',
                    '<h3>Dear customer friend</h3>Thank you for signup my site!');*/
            }
            console.log(data)
            return res.send(data);
        });


}
















router.post('/check-phone',function(req,res,next){
    var data ;
    userModel.find()
        .where('phone')
        .equals(req.body.phone)
        .select('phone')
        .exec(function (err,users) {
            var context = {
                users: users.map(function(user){
                    return {
                        phone: user.phone,
                    };
                })
            };
            if(context.users.length>0)
            {
                console.log("ssss")
                data = {errorMsg: 'phone number' +req.body.phone +'已经存在,请另输入一个'};
            }
            return res.send(data);
        });

});

router.post('/sign-in',signIn)
   function signIn(req,res,next){
       var data;
       if(req.session.captcha.toLowerCase()!== req.body.captcha.toLowerCase()){
           data = {captchaErrorMsg: '请检查码证码是否正确！'};
           return res.send(data);
       }
       userModel.find({'phone':req.body.phone,'hashed_password':pubfun.hashPW(req.body.password)},function (err,users) {
           if(err){
              console.log(err);
           }
           else{
               if(users.length>0){
                   console.log(req.body,"sdasd");
                   req.session.phone=users[0].phone;
                   req.session.loginName=users[0].realname;
                   data={
                       url:'/blog/list-sn/'+req.body.phone,
                       users:users
                   }
                   res.send(data)
               }
          /*  data={
                   code:1,
                   url:'users/profile',
                   data:context
               }
               res.send(data);*/
           }

       });
   }
router.post('/sign-up', signUp);
function signUp(req, res, next) {
    var data;
    if(req.session.captcha.toLowerCase() !== req.body.captcha.toLowerCase())
    {
        data = {captchaErrorMsg: '请检查码证码是否正确！'};
        return res.send(data);
    }
    var errMsg = checkSignUp(req, res);
    if (errMsg.length > 0) {
        return res.send(errMsg);
    }
    var user = new userModel({phone:req.body.phone});
    user.set('hashed_password',pubfun.hashPW(req.body.password));
    user.set('email', req.body.email);
    user.set('age', req.body.age);
    user.save(function(err) {
        if (err){
            console.log(err);
            return res.redirect('/');
        } else {
            //Unable to send email: Invalid login - 535
            //http://service.mail.qq.com/cgi-bin/help?subtype=1&&id=28&&no=1001256
           /* emailService.send(req.body.email,'Thank you for signup!','<h3>Dear customer friend</h3>Thank you for signup my site!');*/
            data = {code: 1,
                url:'/users/profile'};
            console.log(req.body,"hahah")
            req.session.phone=req.body.phone;
            return res.send(data);

        }
    });
}
function checkSignUp(req, res) {
    var errMsg = '';
    if(!validator.isLength(req.body.password,{min:6,max:8})){
        errMsg += '你的两次密码不相等';
    }
    if (!validator.isMobilePhone(req.body.phone, 'zh-CN')) {
        errMsg += '你的电话不正确';
    }
    if (req.body.password !== req.body.password1) {
        errMsg += '你的两次密码不相等';
    }

    return errMsg;
}


module.exports = router;//输出模signUp块