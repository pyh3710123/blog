var express = require('express');//引入express 模块  导入依赖
var svgCaptcha = require('svg-captcha');
var router = express.Router();//

router.get('/', function(req, res,next){
    res.render('home');
});
router.get('/about', function(req, res,next){
    res.render('about');
});
router.get('/contact', function(req, res,next){
    res.render('contact');
});
router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    res.set('Content-Type', 'image/svg+xml');
    res.status(200).send(captcha.data);
});

module.exports = router;//输出模块

