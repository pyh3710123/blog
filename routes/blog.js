var express = require('express');//引入express 模块  导入依赖
var mongoose = require('mongoose'); //引入mongo user Schema
var blogModel = require('../models/blog.js');
var userModel = require('../models/users.js');


var router=express.Router();

router.get('/',function (req,res,next) {
      res.render('blog/blog');
})

router.post('/comment',function (req,res) {
    console.log(req.body);
    var data;
    var num=req.body.comment;
    num++;
    comment={};
    comment.comment=req.body.content;
    comment.phone=req.body.phone;
    blogModel.update({_id:req.body.id},
        {$push:{commentText:comment,
            update:true}},
        {upsert:false,multi:false})
        .exec(function (err,blogs) {
            if(err){
               console.log(err)
            }else {
                data={
                    code:1,
                    url:'/blog/list'
                };
                blogModel.update({_id:req.body.id},
                    {$set:{comment:num,
                        update:true}},
                    {upsert:false,multi:false}).exec(function (err,blogs) {
                    if(err){
                        console.log(err)
                    }else {
                    }
                });
               return  res.redirect('/blog/list');
            }
        });
    
})
router.get('/login/:sn',function (req,res,next){
    var url=req.url.split('/');
    var _id=url[2];
    blogModel.find({'_id':_id},function (err,blogs) {
        if(err){
            cosole.log(err)
        }else {
            userModel.find({'_id':blogs[0].author_id},function (err,users) {
                if(err){
                    cosole.log(err)
                }else {
                    data={
                        user:users,
                        blog:blogs
                    }

                    res.render('blog/login',data);
                }
            })
        }
    })
     
})

router.post('/detailed',function (req,res,next) {
    blogModel.find({'_id':req.body._id},function (err,blogs) {
        if(err){
            cosole.log(err)
        }else {
            userModel.find({},function (err,users) {
                if(err){
                    cosole.log(err)
                }else {
                    data={
                        user:users,
                        blog:blogs,
                        url:'blog/login/'+req.body._id
                    }

                    res.send(data);
                }
            })

        }
    })
})
router.post('/del',delBlog);
function delBlog(req,res) {
    console.log(req.body)
    blogModel.remove({'_id':req.body._id},function (err,blogs) {
        if(err){
            console.log(err)
        }else {
            data = {code: 1,
                url:'/blog/list-sn'};
            return res.send(data);
        }
    })

}
router.post('/add',addBlog);
function addBlog(req,res) {
    console.log(req.session.author)
    var data;
    var user = new blogModel({author_id:req.body.author});
    user.set('title',req.body.title);
    user.set('content', req.body.content);
    user.set('author_id',req.session.author);
    user.set('like',"0");
    user.set('hate',"0");
    user.set('comment',"0");
    user.save(function(err) {
        if (err){
            console.log(err);
            return res.redirect('/');
        } else {
            //Unable to send email: Invalid login - 535
            //http://service.mail.qq.com/cgi-bin/help?subtype=1&&id=28&&no=1001256
            data = {code: 1,
                url:'/blog/list-sn'};
            req.session.author=req.body.author;
            return res.send(data);

        }
    });

}
router.post('/like',function (req,res) {
    
    blogModel.update({_id:req.body._id},
        {$set:{like:req.body.like,
            update:true}},
        {upsert:false,multi:false}).exec(function (err,blogs) {
        if(err){
            console.log(err)
        }else {
          var  data={};
            data.like=req.body.like;

        }
        return res.send(data)
    });

})
router.post('/hate',function (req,res) {
    blogModel.update({_id:req.body._id},
        {$set:{hate:req.body.hate,
            update:true}},
        {upsert:false,multi:false}).exec(function (err,blogs) {
        if(err){
            console.log(err)
        }else {
            var  data={};
            data.hate=req.body.hate;

        }

        return res.send(data)
    });

});
router.get('/list',function (req,res,next) {
    var data;
    blogModel.find({},function (err,blogs) {
        if(err){
            cosole.log(err)
        }else {
          blogs.map(function (item) {
                userModel.find({},function (err,users) {
                     var phones=[];
                     var tt={};
                     tt.session=req.session.phone;
                     phones.push(tt);
                     console.log(users,phones);
                     data={
                     user:users,
                     blog:blogs,
                     phone:phones
                     };
                     res.render('blog/list',data);

                });
            })

        }
    })
});
router.get('/list-sn/:sn',function (req,res,next) {
      var url=req.url.split('/');
      var phone=url[2]
            userModel.find({'phone':phone},function (err,users) {
                if(err){
                    cosole.log(err)
                }else {

                    blogModel.find({'author_id':users[0]._id},function (err,blogs) {
                        if(err){
                            cosole.log(err)
                        }else {
                            data={
                                user:users,
                                blog:blogs
                            }
                            res.render('blog/list-sn',data);
                        }
                    })
                }
            })
    });




module.exports = router;