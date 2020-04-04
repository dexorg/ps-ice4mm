/*global module:false */
/*global require:false */


module.exports = function (grunt) {

    /** load grunt tasks */
    require('load-grunt-tasks')(grunt, {pattern: 'grunt-*'});

    /** configure grunt */
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['results', 'qmreports'],
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            client : {
                src: [
                    'public/js/app/src/namespace.js',
                    'public/js/app/src/epa/epa-ui-shapes.js',
                    'public/js/app/src/cd/story-auth-integration.js',
                    'public/js/app/src/cd/story_auth.js',
                    'public/js/app/src/cd/cd-cms-shell-hs.js',
                    'public/js/app/src/cd/cd-cms-shell-wch.js',
                    'public/js/app/src/epa/epa_auth.js',
                    'public/js/app/src/epa/epm-integration.js',
                    'public/js/app/src/epa/epa-item-edit.js',
                    'public/js/app/src/epa/paged-items-vm.js',
                    'public/js/app/src/integration/course_tp_rest.js',
                    'public/js/app/src/integration/fb_group_rest.js',
                    'public/js/app/src/integration/course_groups_rest.js',
                    'public/js/app/src/integration/course_management_rest.js',
                    'public/js/app/src/integration/report_rest.js',
                    'public/js/app/src/integration/lecture_manager_rest.js',
                    'public/js/app/src/integration/role-management-rest.js',
                    'public/js/app/src/integration/cached-integration.js',
                    'public/js/app/src/component/components.js',
                    'public/js/app/src/viewmodel/fileManagerVM.js',
                    'public/js/app/src/viewmodel/fileManagerWidgetVM.js',
                    'public/js/app/src/viewmodel/scheduleVM.js',
                    'public/js/app/src/viewmodel/bc-instance-vm.js',
                    'public/js/app/src/viewmodel/bcAuthoring/addingBCElementsVM.js',
                    'public/js/app/src/viewmodel/bcAuthoring/retrievingBCElementsVM.js',
                    'public/js/app/src/viewmodel/bcAuthoring/editingBCElementsVM.js',
                    'public/js/app/src/viewmodel/bcAuthoring/bcAuthoringVM.js',
                    'public/js/app/src/viewmodel/main.js',
                    'public/js/app/src/viewmodel/kpi-report-vm.js',
                    'public/js/app/src/component/reportEngine.js',
                    'public/js/app/src/viewmodel/portal-vm.js',
                    'public/js/app/src/viewmodel/bc-creation-step-vm.js',
                    'public/js/app/src/viewmodel/bc-creation-vm.js',
                    'public/js/app/src/viewmodel/campaign-planner-vm.js',
                    'public/js/app/src/viewmodel/campaign-creation-vm.js',
                    'public/js/app/src/em/em-vm.js',
                    'public/js/app/src/rm/role-mng-vm.js',
                    'public/js/app/src/viewmodel/cc-ed-creation.js',
                    'public/js/app/src/viewmodel/ep/ep-card-vm.js',
                    'public/js/app/src/viewmodel/ep/ep-stage-vm.js',
                    'public/js/app/src/viewmodel/ep/ep-timeline-vm.js',
                    'public/js/app/src/viewmodel/ep/ep-performance-vm.js',
                    'public/js/app/src/viewmodel/ep/ep-performance-vm-cognos.js',
                    'public/js/app/src/viewmodel/ep/ep-analysis-vm.js',
                    'public/js/app/src/brm/brm-vm.js',
                    'public/js/app/src/intelligence/intelligence-configuration-vm.js',
                    'public/js/app/src/scm/mm-management.js',
                    'public/js/app/src/viewmodel/mm-tags-vm.js',
                    'public/js/app/src/ko-utils.js'
                ],
                dest: 'public/js/app/build/<%= pkg.name %>.js'
            }
        },
        removelogging: {
            dist: {
                src: 'public/js/app/build/<%= pkg.name %>.js',
                dest: 'public/js/app/build/<%= pkg.name %>.nologging.js',
                options: {
                    // see below for options. this is optional.
                }
            }
        },
        uglify: {
            options :{
                preamble: '<%= banner %>',
                preserveComments:'some',
                compress: {
                    global_defs : {
                        'DEBUG': false
                    }
                }
            },

            dist: {
                src: 'public/js/app/build/<%= pkg.name %>.nologging.js',
                dest: 'public/js/app/build/<%= pkg.name %>.min.js'
            }
        },
        mkdir: {
            results: {
                options: {
                    create: ['results']
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: ['spec'],
                    require: 'coverage/blanket'
                },
                src: ['test/service/*.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'results/coverage-' + grunt.option('build-number') + '.html'
                },
                src: ['test/service/*.js']
            },
            integration: {
                options: {
                    reporter: 'spec',
                    require: 'coverage/blanket'
                },
                src: ['test/integration/*.js']
            }
        },
        blanket_mocha: {
            test: {
                src: ['test/index.html'],
                options: {
                    threshold: 30,
                    log: true,
                    logErrors: true,
                    modulePattern: '(.*)/public/js/app/build/ps-ice4mm.js',
                    timeout: 10000,
                    run: true
                }
            }
        },
        dexQmReports: {
            nodeTest: {
                src: ['test/service/*.js']
            },
            clientTest: {
                src: [
                    'test/spec/*.js'
                ],
                tgt: 'public/js/app/build/<%= pkg.name %>.js',
                libs: [
                    'test/lib/async/lib/async.js',
                    'test/lib/jquery/dist/jquery.min.js',
                    'test/lib/lodash/dist/lodash.min.js',
                    'test/lib/knockout/dist/knockout.js',
                    'test/lib/sockjs-client/dist/sockjs.min.js',
                    'test/lib/moment/min/moment.min.js',
                    'test/lib/pubsub-js/src/pubsub.js',
                    'test/lib/bootstrap/index.js',
                    'test/lib/ps-dcm/index.js',
                    'test/lib/ps-ice/index.js',
                    'test/lib/ps-ucc/index.js',
                    'test/lib/ps-bcc/index.js',
                    'test/lib/chai/chai.js',
                    'test/lib/sinon/index.js',
                    'test/lib/sinon-chai/lib/sinon-chai.js',
                    'test/lib/knockout-sortable/build/knockout-sortable.min.js',
                    'test/lib/sc-playback/index.js',
                    'test/lib/dex-sdk/index.js',
                    'test/lib/tinycolor/dist/tinycolor-min.js',
                    'test/lib/backbone/backbone-min.js',
                    'test/lib/jointjs/dist/joint.js',
                    'test/lib/grapesjs/index.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/ajv/5.5.2/ajv.min.js',
                    'test/lib/lscache/lscache.min.js'
                ],
                helpers: [
                    'test/data/test_widget.js',
                    'test/data/test_course.js',
                    'test/data/test_sc.js',
                    'test/data/test_sc_with_intel.js',
                    'test/data/test_gradable_sc.js',
                    'test/data/test_ep.js',
                    'test/data/test-sc-epm.js',
                    'test/data/jointjs-samples.js'
                ],
                polyfills: 'test/scripts/polyfill.js'
            },
            include: ['public/js/app/src/**/*.js'],
            exclude: [
                'test/**',
                'public/js/app/build/**',
                'public/js/lib/**',
                'public/ice4m/css/bootstrap-datetimepicker.min.css',
                'api-docs/**',
                'results/**'
            ]
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commit: true,
                commitMessage: 'Release version v%VERSION% - bump. - by Jenkins',
                commitFiles: ['package.json', 'bower.json'],
                createTag: false,
                push: true,
                pushTo: 'origin',
                gitDescriptionOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },
        compass: {
            dist: {
                options: {
                    sassDir: 'public/sass_base',
                    cssDir: 'public/assets/css'
                }
            }
        },
        watch: {
            css: {
                files: [
                    // this watch task is for development only => work inside of the dex-css-master project and compile the changes to ice4e. This should minimize the instances of multiple changes to css file(s) overwriting existing fixes or removing them from the production file. the first path would have to be updated to point to wherever the developer decides to install the working version of dex-css-master project.
                    '/home/trevor/Documents/dex-css-master/*/**.scss',
                    // 'node_modules/dex-css-master/**/*.scss',
                    'public/sass_base/ice4e_main.scss'
                ],
                tasks: ['compass'],
                options: {
                    nospawn: true
                }
            },
            livereload : {
                files : ['public/assets/css/*'],
                options : {
                    livereload: true
                }
            }

        }
    });

    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    /* register all grunt tasks */
    grunt.registerTask('watchCSS', 'watch:css');
    grunt.registerTask('test', 'mochaTest:test' );
    grunt.registerTask('coverage', ['mkdir:results', 'mochaTest:test', 'mochaTest:coverage', 'blanket_mocha'] );
    grunt.registerTask('integration', ['mochaTest:integration']);
    grunt.registerTask('default', ['concat', 'removelogging', 'uglify']);
};
