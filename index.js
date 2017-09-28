//{{---------引入相关依赖模块(库)部分
var express = require('express');//引入express模块
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var credentials = require('./credentials.js');
var index=require('./routes/index');
var users = require('./routes/user');
var blogs=require('./routes/blog');
//---------引入相关依赖模块(库)部分}}
//{{---实例化（将相关依赖模块实例化）部分
var app = express();//实例化一个express函数
//---实例化（将相关依赖模块实例化）部分}}
//{{---设置环境变量部分
app.set('port', process.env.PORT || 3009);//设置端口号3009
//---设置环境变量部分}}
//{{---调中间件部分
// cookie-parser configuration
app.use(require('cookie-parser')(credentials.cookieSecret));
// express-session configuration
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));
// database configuration MongoDB数据库连接设置
var mongoose = require('mongoose');
var options = {
    server: {
        socketOptions: { keepAlive: 1 }//为1和为true 表示长连接
    }
};
switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}
//设置handlebars 视图引擎及视图目录和视图文件扩展名
var handlebars = require('express-handlebars') 
    .create({
        defaultLayout: 'main', // 设置默认布局为main
        extname: '.hbs', // 设置模板引擎文件后缀为.hbs
        //创建一个Handlebars 辅助函数，让它给出一个到静态资源的链接：
        helpers: {
            static: function(name) {  //
                return require('./lib/static.js').map(name);
            },
            section: function(name, options){    //设置段落
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));//=====>双下划綫 全局变量
app.use(express.static(__dirname + '/public'));//===>use 使用 创建中间间
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    if (!res.locals.partials)  res.locals.partials = {};
    res.locals.partials.discountContext = {
        locations: [{product: 'book', price: '99.00'}]
    };
    var Loginname='';
    if(req.session.loginName){
        Loginname =req.session.loginName;
    }
    res.locals.partials.navigationContext = {
        locations: [{Loginname:Loginname,phone:req.session.phone}]
    };
    next();
});




app.use('/', index); //====>路由中间间调用
app.use('/users', users);
app.use('/blog', blogs);
/*=================*/
//渲染页面

app.get('/404',function (req,res) {
    res.render('404');
});
app.get('/500',function (req,res) {
    res.render('500');
});
/*=================*/
//---调中间件部分}}
//{{------定制错误部分
// 定制404 页面（所有的确404错误，都是找不到页面或
// 文件或路由错误---原因有两个，1、用户访问时在浏览
// 器中输入错误，2、开发者引用文件或路由错误）
// 定制404 页面
app.use(function(req, res){   //调用use是使用中间溅
    res.type('text/html');
    res.status(404);
    res.send(' <span style="color:red">404 - Not Found</span>');
});
// 定制500 页面
app.use(function(err, req, res, next){  //如果一个中间溅多余2个意思参数，第一个是err第二个是请求第三个是响应 第四个是next
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});
//-----定制错误部分}}
//{{---启动服务器部分
app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});
//---启动服务器部分}}
