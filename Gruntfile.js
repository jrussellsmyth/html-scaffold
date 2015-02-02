module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: ['build']
            },
            node: {
                src:['node_modules']
            }
        },
        // concat: {
        //   options: {
        //     separator: ';'
        //   },
        //   dist: {
        //     src: ['src/**/*.js'],
        //     dest: 'dist/<%= pkg.name %>.js'
        //   }
        // },
        // uglify: {
        //   options: {
        //     banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        //   },
        //   dist: {
        //     files: {
        //       'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        //     }
        //   }
        // },
        // qunit: {
        //   files: ['test/**/*.html']
        // },
        jshint: {
            files: ['Gruntfile.js', 'src/js/*.js', 'test/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        jsonlint: {
            easymock: {
                src: ['src/mock-services/**/*.json']
            },
            stubby: {
                src: ['src/stubby/**/*.json']
            }
        },
        copy: {
            build: {
                files: [{
                        expand: true,
                        dest: 'build',
                        cwd: 'src',
                        src: [
                            'js/**/*', 
                            'lib/**/*', 
                            'articles/**/*', 
                            'easymock/**/*', 
                            'stubby/**/*'
                        ]
                    }, {
                        expand: true,
                        dest: 'build',
                        cwd: 'src/html',
                        src: [
                            '**/*.html'
                        ]
                    }, {
                        expand: true,
                        dest: 'build/styles',
                        cwd: 'src/css',
                        src: [
                            '**/*.css'
                        ]
                    }]
            }
        },
        // using for local server only
        divshot: {
            cloud9: {
                options: {
                    //
                    gzip: true,
                    root: 'build',
                    // cloud 9 configuration
                    port: process.env.PORT,
                    hostname: process.env.IP,
                    // end cloud 9 configuration
                    cache_control: {
                        "/articles/**/*": 31536000,
                        "/lib/**/*": 31536000,
                        '/**/*': 'no-cache, no-store, must-revalidate'
                    }
                }
            },
            local: {
                options: {
                    //
                    keepAlive:false,
                    gzip: true,
                    root: 'build',
                    port: 8080,
                    //hostname: process.env.IP,
                    cache_control: {
                        "/cacheforever/**/*": 31536000,
                        '/**/*': 'no-cache, no-store, must-revalidate'
                    }
                }
            }
        },
        easymock: {
            api1: {
                options: {
                    port: 30000,
                    path: 'build/easymock',
                    /* 
                     * can use any configuration documented here
                     * https://github.com/cyberagent/node-easymock#configjson
                     */
                    config: {
                        cors: true,
                        /* for fixed lag */
//                        "simulated-lag": 1000,
                        /* for random lag between min and max */
                        "simulated-lag-min": 100,
                        "simulated-lag-max": 1000,
                        /*
                         * a handfull of demo routed messages
                         * will also serve all files directly
                         */
                        routes: [
                            "/user/:userid",
                            "/user/:userid/profile",
                            "/user/:userid/inbox/:messageid"],
                    }
                }
            },
//            api2: {
//                options: {
//                    port: 30010,
//                    path: 'build/api2-easymock',
//                    
//                }
//            },
        },
        stubby:{
            api1:{
                options:{
                    // set false for console output
                    mute:true,
                    // required to make response file relative to config file
                    relativeFilesPath:true,
                    watch:'build/stubby/config.json',
                    // port to run mocks on
                    stubs: 30000,
                    tls:30443,
                    admin:30001
                },
                files:[ 
                    {
                       src:['build/stubby/config.json']
                    }
                ]
            }
            /* additiona mock api servers can be added here with different ports */

        },
        concurrent: {
            c9: {
                tasks: ['watch', 'divshot:cloud9'],
                options: {
                    logConcurrentOutput: true
                }
            },
            dev: {
                tasks: ['watch', 'divshot:local'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>', 'src/**/*.html', 'src/css/**/*', 'src/articles/**/*', 'src/easymock/**/*','src/stubby/**/*'],
            tasks: ['jshint' /*, 'qunit'*/, 'jsonlint', 'copy:build']
        }
    });
    
    /******************************************
     * Load Grunt Tasks
     ******************************************/
    
    
    grunt.loadNpmTasks('grunt-contrib-copy');
    //   grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //   grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //   grunt.loadNpmTasks('grunt-contrib-concat');
    //   grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.loadNpmTasks('grunt-jsonlint');

    // for "dev" target - run server and watch
    grunt.loadNpmTasks('grunt-concurrent');
    // for local server - need to create grunt-superstatic and replace this
    grunt.loadNpmTasks('grunt-divshot');

    grunt.loadNpmTasks('grunt-contrib-clean');

    /*
     * A Mock Server
     */
    grunt.loadNpmTasks('grunt-easymock');
    grunt.loadNpmTasks('grunt-stubby');
    /* 
     * for debugging grunt tasks 
     */
    grunt.loadNpmTasks(('grunt-debug-task'));

    grunt.registerTask('default', ['jshint' /*, 'qunit', 'concat', 'uglify'*/, 'copy']);
    grunt.registerTask('dev-easymock', ['default','easymock', 'divshot:local', 'watch']);
    grunt.registerTask('dev-stubby', ['default','stubby', 'divshot:local', 'watch']);
    grunt.registerTask('devc9', ['default', 'concurrent:c9']);
 
};