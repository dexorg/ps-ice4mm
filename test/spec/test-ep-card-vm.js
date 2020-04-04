/**
 * Copyright Digital Engagement Xperience 2017-2018
 * @description tests for VM for EP Widget
 */
/* global dexit, chai, sinon, ko */

(function () {
    'use strict';
    var theArgs;
    var expect = chai.expect;
    var should = chai.should();

    describe('Engagement Plan Widget VM', function () {
        var mockMainVM = {
            viewOnlyModal: function () {
            },
            modalOperation: function () {
            },
            bcAuthVM: {
                retrieveBCElements: function () {

                }
            },
            selectedCourse: ko.observable()
        };


        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            theArgs = {
                repo: 'dev', userId: '122', bucket: 'newOne', currentRole: 'test',
                userRoles: 'professor', epTemplate: JSON.stringify(dexit.testEP)
            };

        });

        afterEach(function () {
            sandbox.restore();
        });


        describe('constructor', function () {
            it('should initialize with passed in activity ', function () {
                var args = {
                    currentStage: 'cd'
                };

                var w = new dexit.app.ice.EPCardVM(args);
                should.exist(w);
                w.currentActivity().should.equal(args.currentStage);
            });
            it('should initialize with passed in widgetReport ', function () {
                var args = {
                    widgetReport: 'widgetReport'
                };

                var w = new dexit.app.ice.EPCardVM(args);
                should.exist(w);
                w.widgetReport().should.equal(args.widgetReport);
            });
            it('should initialize with passed in chosenTPs ', function () {
                var args = {
                    chosenTPs: 'chosenTPs'
                };

                var w = new dexit.app.ice.EPCardVM(args);
                should.exist(w);
                w.currentActivityName();
                w.chosenTPs().should.equal(args.chosenTPs);
            });


            it('Action is not = Done ', function () {
                var args = {
                    chosenTPs: 'chosenTPs'
                };

                var w = new dexit.app.ice.EPCardVM(args);
                should.exist(w);
                w.currentActivityName();
                w.chosenTPs().should.equal(args.chosenTPs);
            });

        });

        describe('perform transition from one state to another', function () {

            var sampleWf = [
                {
                    name: 'epa',
                    iconClass: 'fa fa-edit',
                    actions: {
                        default: {
                            run: function (wVM) {
                                wVM.mainVM.viewOnlyModal(false);
                                wVM.mainVM.modalOperation('edit');
                                //TODO: redo how load EP and save/edit are done, too much state shared in bcAuthVM
                                wVM.mainVM.bcAuthVM.retrieveBCElements(wVM, wVM._findWidgetIndex());
                            }
                        }
                    }
                },
                {
                    name: 'cd',
                    iconClass: 'fa fa-picture-o',
                    actions: {
                        default: {
                            run: function (wVM) {
                                wVM.mainVM.viewOnlyModal(false);
                                wVM.mainVM.modalOperation('edit');
                                wVM.mainVM.selectedWidget(wVM);
                                wVM.mainVM.viewStoryElements(wVM);
                            }
                        }
                    }

                },
                {
                    name: 'scheduling',
                    actions: {
                        default: {
                            run: function(wVM) {
                                wVM.expandWidget();
                            }
                        }
                    },
                    iconClass: 'fa fa-share-alt'
                },
                {
                    name: 'published',
                    actions: {
                        default: {
                            run: function (wVM) {
                                wVM.expandWidget();
                            }
                        },
                        done: {
                            run: function () {
                                console.log('at end');
                            }
                        }
                    },
                    iconClass: 'fa fa-share',
                    paths: []
                }
            ];

            it ('based on wf, start EPA', function () {

                sandbox.spy(mockMainVM, 'viewOnlyModal');
                sandbox.spy(mockMainVM, 'modalOperation');
                sandbox.spy(mockMainVM.bcAuthVM, 'retrieveBCElements');


                var args = {
                    currentActivity: 'epa',
                    mainVM: mockMainVM,
                    wf: sampleWf
                };
                var w = new dexit.app.ice.EPCardVM(args);

                sandbox.stub(w,'_findWidgetIndex').returns(0);


                //setup
                w.isTouchpointAdded(true);

                w.perform('start');
                w.currentActivity().should.equal('epa');
                w._findWidgetIndex.should.have.been.not.calledOnce;
                mockMainVM.viewOnlyModal.should.have.not.been.calledOnce;
                mockMainVM.modalOperation.should.have.not.been.calledOnce;
                mockMainVM.bcAuthVM.retrieveBCElements.should.have.not.been.calledOnce;
            });


            it ('on done activity, should call next', function () {
                var args = {
                    currentActivity: 'epa',
                    mainVM: mockMainVM,
                    wf: sampleWf
                };
                var w = new dexit.app.ice.EPCardVM(args);
                //setup

                sandbox.stub(w,'navigateActivity');
                w.isTouchpointAdded(true);
                w.perform('done');

                w.navigateActivity.should.have.been.calledWith('epa');

            });


        });

        describe('WF for EP new variables', function () {

            it('Set widget Report from args', function () {

                var args = {
                    sc: {
                        id: 'wwf007',
                        property: 'test',
                        touchpoints: []
                    },

                    container: 'swsa',
                    mainVM: 'lolo',
                    name: 'bolt',
                    ePatterns: [{isActive: true}],
                    isPatternActive: true,
                    widgetReport: [{'metric_value': '77'}],
                    chosenTPs: [{tpId: 'tpId', tpName: 'name'}]
                };

                var x = new dexit.app.ice.edu.ScheduleVM(theArgs);
                sandbox.spy(x, 'init');

                x.resetSchedule;
                dexit.app.ice.EPCardVM.widgetReport = ko.observableArray([{pattern: {start: 'later'}}]);
                dexit.app.ice.EPCardVM(args);
            });

            it('Set widget Report from args = Null', function () {

                var args = {};

                dexit.app.ice.EPCardVM(args);
            });

            it('Set touchpoints property of the SC', function () {

                var args = {
                    sc: {
                        id: 'wwf007',
                        property: {
                            touchpoints: ['ep:111']
                        }
                    },

                    container: 'swsa',
                    mainVM: 'lolo',
                    name: 'bolt',
                    ePatterns: [{isActive: true}],
                    isPatternActive: true,
                    widgetReport: [{'metric_value': '77'}],
                    chosenTPs: [{tpId: 'tpId', tpName: 'name'}]
                };
                dexit.app.ice.EPCardVM(args);
            });

            it('Reset Schedule', function () {
                var args = {
                    sc: {
                        id: 'wwf007',
                        property: {
                            name: 'Ali',
                            touchpoints: ['ep:111']
                        }
                    },

                    container: 'swsa',
                    mainVM: 'lolo',
                    name: 'bolt',
                    ePatterns: [{pattern: {end: 'now'}}],
                    isPatternActive: true,
                    widgetReport: [{'metric_value': '77'}],
                    chosenTPs: [{tpId: 'tpId', tpName: 'name'}]
                };

                var test = new dexit.app.ice.EPCardVM(args);
                var AFS = sinon.stub(test.scheduleVM, 'init');
                test.resetSchedule();
                expect(AFS.calledOnce).to.be.true;
                dexit.app.ice.EPCardVM(args);
            });


            it('Part #5', function () {
                var args = {
                    sc: {
                        id: 'wwf007',
                        property: {
                            touchpoints: ['ep:111'],
                        }
                    },

                    container: 'swsa',
                    mainVM: 'lolo',
                    name: 'bolt',
                    ePatterns: [{pattern: {end: 'later'}}],
                    isPatternActive: true,
                    widgetReport: [{'metric_value': '77'}],
                    chosenTPs: [{tpId: 'tpId', tpName: 'name'}]
                };

                dexit.app.ice.EPCardVM.ePatterns = ko.observableArray([{pattern: {start: 'later'}}]);
                dexit.app.ice.EPCardVM(args);
            });

            it('Retrieve start dates from engagement pattern to show in the UI', function () {
                var args = {
                    sc: {
                        id: 'wwf007',
                        property: {
                            touchpoints: ['ep:111']
                        }
                    },

                    container: 'swsa',
                    mainVM: 'lolo',
                    name: 'bolt',
                    ePatterns: [{pattern: {end: 'later'}}],
                    isPatternActive: true,
                    widgetReport: [{'metric_value': '77'}],
                    chosenTPs: [{tpId: 'tpId', tpName: 'name'}]
                };

                dexit.app.ice.EPCardVM.ePatterns = ko.observableArray([{pattern: {start: 'later'}}]);
                dexit.app.ice.EPCardVM(args);

            });
        });
    });
    describe ('Engagement Plan Widget VM: "Perform" function', function () {


        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();

        });

        afterEach(function () {
            sandbox.restore();
        });

        it('TC1 : path=run, ref=vm, to cover decision "if (! action)"= false. ', function () {
            var args = {
                currentActivity: 'epa'
            };
            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_path = 'run';
            var Tem_ref = vm;
            vm.perform(Tem_path, Tem_ref);

        });
        it('TC2 : path=run, ref=vm, to cover decision "if (! activity)"= false. ', function () {
            var args = {
                currentActivity: 'epa'
            };
            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_path = 'run';
            var Tem_ref = vm;
            vm.perform(Tem_path, Tem_ref);

        });
        it('TC3 : path=run, ref=vm, to cover decision "if (! actionSelected)"= false. ', function () {
            var args = {
                currentActivity: 'epa'
            };
            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_path = 'run';
            var Tem_ref = vm;
            vm.perform(Tem_path, Tem_ref);

        });
        it('TC4 : path=run, ref=vm, to cover decision "if ( action=="done")"= false. ', function () {
            var args = {
                currentActivity: 'epa'
            };
            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_path = 'run';
            var Tem_ref = vm;
            vm.perform(Tem_path, Tem_ref);

        });
        it('TC5 : path=done, ref=vm, activites="", to cover decision "if (! action)"= true.. ', function () {
            var args = {
                currentActivity: 'epa',
                wf: ''
            };

            var vm = new dexit.app.ice.EPCardVM(args);
            vm._loadWf('');
            var Tem_path = 'done';
            var Tem_ref = vm;
            vm.perform(Tem_path, Tem_ref);

        });
        it('TC6 : with action=" ", to cover when there is no activity.', function () {
            var args = {
                currentActivity: 'epa',

            };

            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_path = '';
            var Tem_ref = vm;
            vm.perform(Tem_path, Tem_ref);

        });
        it('TC7 : without activity. ', function () {
            var args = {
                currentActivity: 'epa'

            };
            var vm = new dexit.app.ice.EPCardVM(args);
            var wf = [];

            var vm = new dexit.app.ice.EPCardVM(args);
            vm.currentActivity('epa');
            var Tem_path = 'action';
            var Tem_ref = vm;
            vm._loadWf(wf);
            vm.perform(Tem_path, Tem_ref);
        });
        it('TC8 : without done action, there is no actionselected ', function () {
            sandbox.restore();

            var args = {
                currentActivity: 'epa',


            };
            var arg = [
                {
                    name: 'epa',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.showApprovalEPA();
                            }
                        }

                    },
                    iconClass: 'fa fa-check-square-o'
                }

            ];

            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_path = 'done';
            var Tem_ref = vm;
            vm._loadWf(arg);
            vm.perform(Tem_path, Tem_ref);

        });

    });
    describe ('Engagement Plan Widget VM: navigation of the Activity', function () {


        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();

        });

        afterEach(function () {
            sandbox.restore();
        });
        it('TC1: VALIDATE ACTIVITY EXIST AND set next activities ', function () {
            var args = {
                currentActivity: 'epa'
            };

            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_current = vm.currentActivity();
            var Tem_direction = null;

            vm.navigateActivity(Tem_current, Tem_direction);
        });
        it('TC2: Check the direction in case of forward ', function () {
            var args = {
                currentActivity: 'epa'
            };
            var arg = [
                {
                    name: 'epa',
                    iconClass: 'fa fa-edit',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.mainVM.viewOnlyModal(false);
                                vm.mainVM.modalOperation('edit');
                                //TODO: redo how load EP and save/edit are done, too much state shared in bcAuthVM
                                vm.mainVM.bcAuthVM.retrieveBCElements(vm, vm._findWidgetIndex());
                            }
                        },
                        done: {}
                    },

                    paths: [
                        {
                            name: 'done',
                            to: 'epa_approval'
                        }
                    ]
                },
                {
                    name: 'epa_approval',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.showApprovalEPA();
                            }
                        },
                        done: {
                            run: function (vm) {
                                var direction = (vm.approval() && vm.approval() === false ? 'forward' : 'back');
                                vm.navigateActivity(vm.currentActivity(), direction);
                            }
                        }
                    },
                    iconClass: 'fa fa-check-square-o'
                },
                {
                    name: 'cd',
                    iconClass: 'fa fa-picture-o',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.mainVM.viewOnlyModal(false);
                                vm.mainVM.modalOperation('edit');
                                vm.mainVM.selectedWidget(vm);
                                vm.mainVM.viewStoryElements(vm);
                            }
                        }
                    }

                },
                {
                    name: 'cd_approval',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.showApproval(true);
                            }
                        },
                        done: {
                            run: function (vm) {
                                var direction = (vm.approval() && vm.approval() === false ? 'forward' : 'back');
                                vm.navigateActivity(vm.currentActivity(), direction);
                            }
                        }
                    },
                    iconClass: 'fa fa-check-square-o'
                },
                {
                    name: 'scheduling',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.expandWidget();
                            }
                        }
                    },
                    iconClass: 'fa fa-share-alt'
                },
                {
                    name: 'published',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.expandWidget();
                            }
                        },
                        done: {
                            run: function () {
                                console.log('at end');
                            }
                        }
                    },
                    iconClass: 'fa fa-share',
                    paths: []
                }
            ];
            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_current = vm.currentActivity();
            var Tem_direction = 'forward';
            // var next = calculateIndex(currentActivityIndex, 'backward');
            vm._loadWf(arg);
            var stub1 = sinon.stub(vm, 'approval').returns(true);
            vm.navigateActivity(Tem_current, Tem_direction);
        });


        it('TC3: Check the direction in case of backward ', function () {
            var args = {
                currentActivity: 'epa',
            };
            var arg = [
                {
                    name: 'epa',
                    iconClass: 'fa fa-edit',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.mainVM.viewOnlyModal(false);
                                vm.mainVM.modalOperation('edit');
                                //TODO: redo how load EP and save/edit are done, too much state shared in bcAuthVM
                                vm.mainVM.bcAuthVM.retrieveBCElements(vm, vm._findWidgetIndex());
                            }
                        },
                        done: {
                            done: function (vm) {
                                vm.currentActivity('epa_approval');
                            }
                        }
                    },

                    paths: [
                        {
                            name: 'done',
                            to: 'epa_approval'
                        }
                    ]
                },
                {
                    name: 'epa_approval',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.showApprovalEPA();
                            }
                        },
                        done: {
                            run: function (vm) {
                                var direction = (vm.approval() && vm.approval() === true ? 'forward' : 'back');
                                vm.navigateActivity(vm.currentActivity(), direction);
                            }
                        }
                    },
                    iconClass: 'fa fa-check-square-o'
                },
                {
                    name: 'cd',
                    iconClass: 'fa fa-picture-o',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.mainVM.viewOnlyModal(false);
                                vm.mainVM.modalOperation('edit');
                                vm.mainVM.selectedWidget(vm);
                                vm.mainVM.viewStoryElements(vm);
                            }
                        }
                    }

                },
                {
                    name: 'cd_approval',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.showApproval(true);
                            }
                        },
                        done: {
                            run: function (vm) {
                                var direction = (vm.approval() && vm.approval() === true ? 'forward' : 'back');
                                vm.navigateActivity(vm.currentActivity(), direction);
                            }
                        }
                    },
                    iconClass: 'fa fa-check-square-o'
                },
                {
                    name: 'scheduling',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.expandWidget();
                            }
                        }
                    },
                    iconClass: 'fa fa-share-alt'
                },
                {
                    name: 'published',
                    actions: {
                        default: {
                            run: function (vm) {
                                vm.expandWidget();
                            }
                        },
                        done: {
                            run: function () {
                                console.log('at end');
                            }
                        }
                    },
                    iconClass: 'fa fa-share',
                    paths: []
                }
            ];
            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_current = vm.currentActivity();
            var Tem_direction = 'backward';
            // var next = calculateIndex(currentActivityIndex, 'backward');
            vm._loadWf(arg);
            vm.navigateActivity(Tem_current, Tem_direction);

            vm.currentActivity().should.equal('epa');



        });

        it('TC4: validate and set next activities ', function () {
            var args = {
                currentActivity: 'epa'
            };
            var arg = [];
            var vm = new dexit.app.ice.EPCardVM(args);
            var Tem_current = vm.currentActivity();
            var Tem_direction = 'backward';
            // var next = calculateIndex(currentActivityIndex, 'backward');
            vm._loadWf(arg);
            var stub1 = sinon.stub(vm, 'approval').returns(true);
            vm.navigateActivity(Tem_current, Tem_direction);
            vm.currentActivity().should.equal('epa');
        });
    });
})();
