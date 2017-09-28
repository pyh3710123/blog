module.exports = function(grunt) {
    // 加载插件
    [
        'grunt-contrib-copy',//拷贝插件
        'grunt-contrib-concat',//拼接插件
        'grunt-contrib-cssmin',//css压缩插件
        'grunt-contrib-uglify', //js压缩插件
        'grunt-contrib-csslint',//css报错插件
        'grunt-contrib-jshint', //js报错插件
        'grunt-contrib-watch',//监控插件
        'grunt-contrib-imagemin',//图片压缩插件
        'grunt-contrib-less'//less编译安装
    ].forEach(function (task) {
        grunt.loadNpmTasks(task);
    });

    // 配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    //copy bootstrap
                    {
                        expand: true,
                        cwd: 'bower_components/bootstrap/',
                        src: ['dist/fonts/*','dist/css/bootstrap.min.css','dist/js/bootstrap.min.js'],
                        dest: 'public/vendor/bootstrap/'
                    },
                    //copy jquery
                    {
                        expand: true, flatten: true,
                        src: ['bower_components/jquery/dist/jquery.min.js'],
                        dest: 'public/vendor/jquery/dist/',
                        filter: 'isFile'
                    },
                    //copy animate.css
                    {
                        expand: true, flatten: true,
                        src: ['bower_components/animate.css/animate.min.css'],
                        dest: 'public/vendor/animate.css',
                        filter: 'isFile'
                    },
                    //copy dataTables
                    {
                        expand: true, flatten: true,
                        src: ['bower_components/datatables.net/js/jquery.dataTables.min.js'],
                        dest: 'public/vendor/datatables.net/js/',
                        filter: 'isFile'
                    },
                    //copy dataTablesnet-bs
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-bs/',
                        src: ['css/dataTables.bootstrap.min.css','js/dataTables.bootstrap.min.js'],
                        dest: 'public/vendor/datatables.net-bs/'

                    },
                    //copy Highcharts
                    {
                        expand: true,
                        cwd: 'bower_components/highcharts/',
                        src: ['*.*','adapters/*','css/*','js/**/*','lib/*','modules/*','themes/*'],
                        dest: 'public/vendor/highcharts/'

                    },
                    //copy animate.css
                    {
                        expand: true, flatten: true,
                        src: ['bower_components/animate.css/animate.min.css'],
                        dest: 'public/vendor/animate.css/',
                        filter: 'isFile'
                    },
                    // copy jquery ui
                    {
                        expand: true,
                        cwd: 'bower_components/jquery-ui/',
                        src: ['**/jquery-ui.min.js','themes/base/jquery-ui.min.css','themes/base/images/*.*'],
                        dest: 'public/vendor/jquery-ui/'
                    },
                    // copy validator
                    {
                        expand: true,
                        cwd: 'node_modules/validator/',
                        src: ['**/validator.min.js'],
                        dest: 'public/vendor/validator/'
                    }
                ]
            }
        },
        //将Less文件编译成Css文件
        less: {
            development: {
                files: {
                    'less/main.css': 'less/main.less'
                }
            }
        },
        //合并 CSS 文件
        concat: {
            css: {
                src: ['public/stylesheets/*.css'],
                /* 根据目录下文件情况配置 */
                dest: 'public/stylesheets/dist/<%= pkg.name %>.css'
            },
            scripts: {
                src: ['public/javascripts/*.js'],
                /* 根据目录下文件情况配置 */
                dest: 'public/javascripts/dist/<%= pkg.name %>.js'
            }
        },
        //压缩Style CSS文件为 .min.css
        cssmin: {
            options: {
                // 移除 CSS 文件中的所有注释
                keepSpecialComments: 0
            },
            minify: {
                expand: true,
                cwd: 'public/stylesheets/dist/',
                src: ['bootstrap-obj.css'],
                dest: 'public/stylesheets/dist/',
                ext: '.min.css'
            }
        },
        // 最小化、混淆、合并 JavaScript 文件
        uglify: {
            build: {
                //src: 'src/<%= pkg.name %>.js',
                src: 'public/javascripts/dist/<%= pkg.name %>.js',
                dest: 'public/javascripts/dist/<%= pkg.name %>.min.js'
            }
        },
        //检查javascript语法
        jshint: {
            all: ['Gruntfile.js',
                'public/javascripts/*.js'
            ]
        },
        //检查Style CSS 语法
        csslint: {
            src: ['public/stylesheets/*.css']
        },
        //压缩优化图片大小
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 3
                },
                files: [
                    {
                        expand: true,
                        cwd: 'public/images/',
                        src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                        dest: 'public/images/' // 优化后的图片保存位置，默认覆盖
                    }
                ]
            }
        },
//监控CSS和js文件的变化，只要有修改就检查语法
        watch: {
            css: {
                files: 'public/stylesheets/*.css',
                tasks: ['csslint'],
                options: {
                    //livereload: true,
                    spawn: false
                }
            },
            scripts: {
                files: 'public/javascripts/*.js',
                tasks: ['jshint'],
                options: {
                    spawn: false
                }
            }
        }

    });
    // 默认任务
};