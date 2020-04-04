/**
 * @copyright Digital Engagement Xperience 2017
 * Created by fateh on 11/10/17.
 */
/* global chai, dexit, sinon  */


(function () {
    'use strict';
    var should = chai.should();
    var expect = chai.expect;

    describe('portalVM', function () {

        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });
        afterEach(function () {
            sandbox.restore();
        });
        describe('_populateBehaviours', function () {

            var theArgs, mainVM, portalVM;
            beforeEach(function () {
                theArgs = {
                    ice4mBCs: '[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]',
                    repo: 'dev',
                    userId: '122',
                    user: JSON.stringify({id: '1', tenant: 'testing.dexit.co'}),
                    bucket: 'newOne',
                    currentRole: 'salesManager',
                    userRoles: 'salesManager',
                    epTemplate: JSON.stringify(dexit.testEP)
                };
                mainVM = new dexit.app.ice.edu.Main(theArgs);
                portalVM = new dexit.app.ice.edu.portal(theArgs, mainVM);
            });

            var bcSetting = {
                role: 'salesManager', definition: {
                    definitions: {
                        behaviour: [{
                            name: 'service',
                            tab: 'eService',
                            define: {
                                roles: ['productManager'],
                                type: 'API',
                                request: 'dexit.app.ice.integration.behaviour.list'
                            },
                            manage: {roles: ['salesManager'], local: true},
                            view: {roles: ['salesManager']}
                        }],
                        businessRule: [{
                            name: 'businessRule',
                            define: {roles: ['productManager']}
                        }],
                        intelligence: [{name: 'metric', view: {roles: ['salesManager']}}]
                    }
                }
            };
            var result = {property: {'args': [':Accept=:Accept', ':user=:user', ':discount_rate=:discount_rate'],
                    'ds': {
                        'id': '0845d5b0-db37-4d3b-8d9b-bc69118e0317',
                        'serviceId': '27201eb0-3112-44d5-a744-ee4b238463f6',
                        'description': 'evoucher',
                        'setup': {},
                        'uiElements': {
                            'filter': 'retailer',
                            'icon_type': 'null',
                            'image_name': 'service_voucher.png',
                            'render_color': '#fdc624 !important',
                            'render_text': 'eVoucher',
                            'rule_type': 'simple',
                            'subtype': 'evoucher'
                        }
                    },
                    'display': {
                        'icon': 'fa-book',
                        'icon_text': 'eVoucher',
                        'icon_text_wrapper': 'ev-text-only',
                        'mode': 'inline',
                        'render_color': '#fdc624'
                    }}};




            it('should set behaviours behaviours', function () {
                var stub = sandbox.stub(dexit.app.ice.integration.bcp, 'listBCBehaviours').yields(null,[result]);
                var bcIns = {
                    id:'aaaaa'
                };
                var dummyVM = {
                    existingBehaviours: ko.observableArray()
                };
                var behaviourDef = bcSetting.definition.definitions.behaviour;


                portalVM._populateBehaviours(dummyVM,bcIns,behaviourDef, bcSetting);

                dummyVM.existingBehaviours().should.have.lengthOf(1);
                stub.should.have.been.calledOnce;


            });



        });

        describe('_listBCInstances', function () {
            var theArgs, mainVM, portalVM;
            beforeEach(function () {
                theArgs = {
                    ice4mBCs: '[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]',
                    repo: 'dev',
                    userId: '122',
                    user: JSON.stringify({id: '1', tenant: 'testing.dexit.co'}),
                    bucket: 'newOne',
                    currentRole: 'salesManager',
                    userRoles: 'salesManager',
                    epTemplate: JSON.stringify(dexit.testEP)
                };
                mainVM = new dexit.app.ice.edu.Main(theArgs);
                portalVM = new dexit.app.ice.edu.portal(theArgs, mainVM);
                sandbox.stub(portalVM,'_populateTouchpoints');
                sandbox.stub(portalVM,'_populateBehaviours');
                mainVM.repo = 'dexitco';

                //mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
                //  theCourse = new dexit.test.Course();
                //theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);
                //mainVM.selectedCourse({courseVM:theCourse});
            });

            it('Should list BC Instances by current role and bc type', function (done) {
                var bcSetting = {
                    role: 'salesManager', definition: {
                        definitions: {
                            behaviour: [{
                                name: 'service',
                                tab: 'eService',
                                define: {
                                    roles: ['productManager'],
                                    type: 'API',
                                    request: 'dexit.app.ice.integration.behaviour.list'
                                },
                                manage: {roles: ['salesManager'], local: true},
                                view: {roles: ['salesManager']}
                            }],
                            businessRule: [{
                                name: 'businessRule',
                                define: {roles: ['productManager']}
                            }],
                            intelligence: [{name: 'metric', view: {roles: ['salesManager']}}]
                        }
                    }
                };


                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole');
                var stub3 = sandbox.stub(mainVM, 'setWidgetReport');
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub1.callsArgWith(1, null, [{'bci_id':'1'}]);
                stub2.callsArgWith(1, null, 'sdsdsdd');


                portalVM._listBCInstances(bcSetting, function (err, res) {
                    should.exist(res);
                    expect(stub1.calledOnce).to.be.true;
                    expect(stub2.called).to.be.true;
                    done();
                });

            });
            it('Should handle an error when failed to load BC instances! ', function (done) {
                var bcSetting = {
                    role: 'salesManager', definition: {
                        definitions: {
                            behaviour: [{
                                name: 'service',
                                tab: 'eService',
                                define: {
                                    roles: ['productManager'],
                                    type: 'API',
                                    request: 'dexit.app.ice.integration.behaviour.list'
                                },
                                manage: {roles: ['salesManager'], local: true},
                                view: {roles: ['salesManager']}
                            }],
                            businessRule: [{
                                name: 'businessRule',
                                define: {roles: ['productManager']}
                            }],
                            intelligence: [{name: 'metric', view: {roles: ['salesManager']}}]

                        }
                    }
                };
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole').yields( new Error('error'));
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');


                portalVM._listBCInstances(bcSetting, function (err) {
                    should.exist(err);
                    stub1.should.have.been.called;
                    stub2.should.not.have.been.called;
                    done();
                });

            });
            it('Should return error when failed to retrieve BC instances', function (done) {
                var bcSetting = {
                    role: 'salesManager', definition: {
                        definitions: {
                            behaviour: [{
                                name: 'service',
                                tab: 'eService',
                                define: {
                                    roles: ['productManager'],
                                    type: 'API',
                                    request: 'dexit.app.ice.integration.behaviour.list'
                                },
                                manage: {roles: ['salesManager'], local: true},
                                view: {roles: ['salesManager']}
                            }],
                            businessRule: [{
                                name: 'businessRule',
                                define: {roles: ['productManager']}
                            }],
                            intelligence: [{name: 'metric', view: {roles: ['salesManager']}}]
                        }
                    }
                };

                var property = {ds: {id: ''}, display: '', eptName: ''};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole').yields(null,[{bci_id:'1'}]);
                var stub3 = sandbox.stub(mainVM, 'setWidgetReport');
                // var stub4 = sandbox.stub(dexit.app.ice.integration.bcp,'listBCBehaviours');
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance').yields(new Error('uh oh'));
                portalVM._listBCInstances(bcSetting, function (err) {
                    should.exist(true);
                    expect(stub1.called).to.be.true;
                    expect(stub2.called).to.be.true;
                    done();
                });

            });
            it('Should chose the path failed to load BC instances! when error is true ', function (done) {
                var bcSetting = {
                    role: 'salesManager', definition: {
                        definitions: {
                            behaviour: [{
                                name: 'service',
                                tab: 'eService',
                                define: {
                                    roles: ['productManager'],
                                    type: 'API',
                                    request: 'dexit.app.ice.integration.behaviour.list'
                                },
                                manage: {roles: ['salesManager'], local: true},
                                view: {roles: ['salesManager']}
                            }],
                            businessRule: [{
                                name: 'businessRule',
                                define: {roles: ['productManager']}
                            }],
                            intelligence: [{name: 'metric', view: {roles: ['salesManager']}}]

                        }
                    }
                };
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole').yields(new Error('noooo'));
                stub1.callsArgWith(1, true, null);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');;
                var stub3 = sandbox.stub(mainVM, 'setWidgetReport');


                portalVM._listBCInstances(bcSetting, function (err, res) {
                    should.exist(err);
                    expect(stub1.calledOnce).to.be.true;
                    expect(stub2.called).to.be.false;
                    done();
                });

            });
            it('Should chose the path of can not retrieve BC instances! when error is true', function (done) {
                var bcSetting = {
                    role: 'salesManager', definition: {
                        definitions: {
                            behaviour: [{
                                name: 'service',
                                tab: 'eService',
                                define: {
                                    roles: ['productManager'],
                                    type: 'API',
                                    request: 'dexit.app.ice.integration.behaviour.list'
                                },
                                manage: {roles: ['salesManager'], local: true},
                                view: {roles: ['salesManager']}
                            }],
                            businessRule: [{
                                name: 'businessRule',
                                define: {roles: ['productManager']}
                            }],
                            intelligence: [{name: 'metric', view: {roles: ['salesManager']}}]
                        }
                    }
                };

                var property = {ds: {id: ''}, display: '', eptName: ''};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole').yields(null,[{bci_id:'a'}]);
                var stub3 = sandbox.stub(mainVM, 'setWidgetReport');
                // var stub4 = sandbox.stub(dexit.app.ice.integration.bcp,'listBCBehaviours');
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance').yields(new Error('uh oh'));
                portalVM._listBCInstances(bcSetting, function (err, res) {
                    should.exist(err);
                    stub1.should.have.been.calledOnce;
                    stub2.should.have.been.calledOnce;
                    done();
                });



            });
            it('Should chose the path of list BC behaviours successful', function (done) {
                var bcSetting = {
                    role: 'salesManager', definition: {
                        definitions: {
                            behaviour: [{
                                name: 'service',
                                tab: 'eService',
                                define: {
                                    roles: ['productManager'],
                                    type: 'API',
                                    request: 'dexit.app.ice.integration.behaviour.list'
                                },
                                manage: {roles: ['salesManager'], local: true},
                                view: {roles: ['salesManager']}
                            }],
                            businessRule: [{
                                name: 'businessRule',
                                define: {roles: ['productManager']}
                            }],
                            intelligence: [{name: 'metric', view: {roles: ['salesManager']}}]
                        }
                    }
                };

                var property = {ds: {id: ''}, display: '', eptName: ''};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole');
                var stub3 = sandbox.stub(mainVM, 'setWidgetReport');
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub1.callsArgWith(1, null, [{bci_id:'a'}]);
                stub2.callsArgWith(1, null, {id:'a', property: { 'name':'test'}});
              //  stub4.callsArgWith(1, null, []);


                portalVM._listBCInstances(bcSetting, function () {
                    expect(stub1.calledOnce).to.be.true;
                    expect(stub2.called).to.be.true;
                    expect(portalVM._populateBehaviours.called).to.be.true;
                    done();
                });

            });
        });



    });

})();
