module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: ['build']
            },
            npm: {
                src: ['node_modules']
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
        express: {
            server: {
                options: {
                    port: process.env.PORT,
                    hostname: process.env.IP,
                    bases: 'build'
                }
            }
        },
        easymock: {
            api1: {
                options: {
                    port: 8081,
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
                            "/user/:userid/inbox/:messageid"]
                    }
                }
            }
//            api2: {
//                options: {
//                    port: 30010,
//                    path: 'build/api2-easymock',
//                    
//                }
//            },
        },
        stubby: {
            api1: {
                options: {
                    location:'0.0.0.0',
                    // set false for console output
                    mute: false,
                    // required to make response file relative to config file
                    relativeFilesPath: true,
                    watch: 'build/stubby/config.json',
                    // port to run mocks on
                    stubs: 8081,
                    //tls: 8081,
                    admin: 8082
                },
                files: [
                    {
                        src: ['build/stubby/config.json']
                    }
                ]
            }
            /* additiona mock api servers can be added here with different ports */

        },
        /** Issues with proxy in non-hosted execution. Not needed anyway, we allow mulitple ports!*/
        proxy: {
            proxy1: {
                options: {
                    port: process.env.PORT | 8080,
                    host: process.env.IP | '0.0.0.0',
                    router: {
                        // provide our mock server as a path on the primary port - 
                        // for environments such as cloud9 that only expose one port
                        '0.0.0.0/__/proxy/api/': 'http://localhost:30000',
                        // the main application 
                        '0.0.0.0/': 'http://localhost:8000'
                    },
                    target: {
                        host:"0.0.0.0",
                        port:"8000"
                    }
                }
            }
        }, 
        /**/
        watch: {
            files: ['<%= jshint.files %>', 'src/**/*.html', 'src/css/**/*', 'src/articles/**/*', 'src/easymock/**/*', 'src/stubby/**/*'],
            tasks: ['jshint' /*, 'qunit'*/, 'jsonlint', 'copy:build']
        }
    });

    /******************************************
     * Load Grunt Tasks
     ******************************************/

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    grunt.registerTask('default', ['jshint' /*, 'qunit', 'concat', 'uglify'*/, 'copy']);
    grunt.registerTask('dev-easymock', ['default', 'easymock', 'express', /*'proxy',*/ 'watch']);
    grunt.registerTask('dev-stubby', ['default', 'stubby', 'express', /*'proxy',*/ 'watch']);
    grunt.registerTask('devc9', ['default', 'concurrent:c9']);

};