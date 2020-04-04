/**
 * Copyright Digital Engagement Xperiance 2015
 */

/*global ko, dexit, chai, sinon */

(function () {
    'use strict';

    var should = chai.should();
    var expect = chai.expect;

    /*
     * Tests related to main view model
     */
    describe('Main view model (main.js)', function() {
        var mainVM;
        var theArgs;
        $('body').append('<textarea class=\'textAreaBox3\' placeholder=\'Answer...\' data-type=\'text\'></textarea>');
        $('body').append('<div id=\'layout-element-5\' placeholder=\'Answer...\' ><div class = \'link-container\'><input value=\'\' placeholder=\'\'></div></div>');

        beforeEach( function() {
            theArgs= {activeComponents:{},
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'test', userRoles: 'professor', epTemplate: JSON.stringify(dexit.testEP)};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currentRole('professor');
        });


        var fakeCourseVM = function (id) {
            return {
                container : {
                    id: 'courseid_'+id,
                    property : {
                        name : 'code' + id
                    }
                },
                courseAggregateFeedback : function () {
                    return { total_likes:1,
                        total_shares:1,
                        total_comments:1
                    };
                }
            };
        };

        var fakeCourseVMUndef = function(id) {
            return {
                container : {
                    id: 'courseid'+id,
                    property : {
                        name : 'code' + id
                    }
                },
                courseAggregateFeedback : function () {
                    return { total_likes:null,
                        total_shares:undefined,
                        total_comments:0
                    };
                }
            };
        };

    });

    describe('init', function () {
        var theCourse, theArgs, mainVM, theVMAddGroup,sandbox;
        $('body').append('<div class=\'add-course-wrapper\'><h3 class=\'course-group\'>Course Lessons:</h3></div>');
        var ice4mBCs = [{'name':'Merchandising','bctype':[{'eService':{'bctype':['eServiceInstance']}}]},{'name':'Marketing','bctype':[{'Campaign':{'bctype':['Promotion']}}]}];


        beforeEach( function() {



            sandbox = sinon.sandbox.create();
            theCourse = new dexit.test.Course();
            theArgs= {repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', epTemplate: JSON.stringify(dexit.testEP)};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            theVMAddGroup = new dexit.app.ice.edu.Main(theArgs);
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, theVMAddGroup);
            mainVM.selectedCourse({courseVM:theCourse});
            var stub3 = sandbox.stub(mainVM, 'showBCInstances');


            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,ice4mBCs);

            mainVM.currBCDef({'singular': 'SeService','reports': {
                'widgetReport':[
                    {'role':'executive','definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-tags'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'}]},
                    {'role':'salesManager','definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-tags'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'}]},
                    {'role':'productManager','definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-bolt'}]}
                ],
                'kpiReport':[
                    {'role': 'executive', 'definition':{'metricRef':[], 'name':'SeService Penetration REPORT', 'column': [{type:'string', name:'eService'},{type:'number', name:'Revenue'}], 'data':[['SeService Revenue', 184],['Traditional Revenue', 65],['Others', 10]]}},
                    {'role': 'salesManager', 'definition':{'metricRef':[], 'name':'Sales Manager eService KPI REPORT', 'column': [{type:'string', name:'Planned'},{type:'number', name:'Achieved'}], 'data':[['eService-Planned', 50],['eService-Achieved', 65]]}},
                    {'role': 'productManager', 'definition':{'metricRef':[], 'name':'Revenue Summary - SeService Recharge', 'column': [{type:'string', name:'Planned'},{type:'number', name:'Achieved'}], 'data':[['SeService-Recharge1', 100],['SeService-Recharge2', 65]]}}
                ],
                'dashboardReport':[
                    {'role': 'executive', 'definition':{'metrics':['', 'Goal', 'Actural'], 'name':'SeService Achievement REPORT', 'data1':['Total Revenue', 500, 880],'data2':['Total Recharge', 1660, 1120]}},
                    {'role': 'salesManager', 'definition':{'metrics':['', 'Planned', 'Achieved'], 'name':'SeService Achievement REPORT', 'data1':['social channel', 1170, 460],'data2':['traditional channel', 1660, 1120]}},
                    {'role': 'productManager', 'definition':{'metrics':['', 'Planned', 'Achieved'], 'name':'SeService Achievement REPORT', 'data1':['social channel', 1170, 460],'data2':['traditional channel', 1660, 1120]}}
                ]
            }});

        });
        afterEach( function() {
            sandbox.restore();
        });

        it('main.js - handleListMyServicesResponse', function (done) {
            var stub1 = sandbox.stub(dexit.app.ice.integration.profile.user, 'retrieve');
            var stub3 = sandbox.stub(dexit.scm.dcm.integration.tenant,'listMyServices');
            stub1.callsArgWith(0,null,{id:'123', name: 'tester@dexit.co' });
            stub3.callsArgWith(1,null,[{type:'service'}]);
            mainVM.userProfile = ko.observable();
            mainVM.init();
            expect(mainVM.ice4eBehaviours.length).to.be.eql(0);
            done();

        });

        it('main.js - prepareCreationModal', function (done) {
            mainVM.init();

            sandbox.stub(dpa_VM,'init');

            var stub1 = sandbox.stub(dexit.app.ice.integration.token,'checkToken');
            //check token with error
            stub1.callsArgWith(0,true,null);
            mainVM.prepareCreationModal('campaign','create',null);
            expect(mainVM.selectedBehaviour()).to.not.be.eql('');
            expect(mainVM.modalOperation()).to.be.eql('create');
            mainVM.viewOnlyModal(true);
            mainVM.prepareCreationModal('campaign','create',null);
            dpa_VM.init;
            done();

        });
    });

    describe('init', function () {
        var theCourse, theArgs, mainVM, theVMAddGroup, sandbox, server;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            server = sinon.fakeServer.create();
        });
        afterEach(function () {
            server.restore();
            sandbox.restore();

        });

        it('for role subscriber: should fail loading if could not load BCs for unknown role', function(done){
            theCourse = new dexit.test.Course();
            theArgs = {
                repo: 'dev',
                userId: '122',
                bucket: 'newOne',
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                currentRole: 'unknown',
                userRoles: 'unknown',
                ice4mBCs: ''
            };
            sandbox.stub(dexit.app.ice.edu.components,'register');



            mainVM = new dexit.app.ice.edu.Main(theArgs);

            sandbox.spy(mainVM,'availableBC');
            sandbox.spy(mainVM,'showBCInstances');
            //ignore loading of reports
            sandbox.stub(mainVM,'loadDashboardReports');

            theVMAddGroup = new dexit.app.ice.edu.Main(theArgs);
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, theVMAddGroup);
            mainVM.selectedCourse({courseVM: theCourse});

            mainVM.init();
            expect(mainVM.userProfile().id).to.equal('123');

            dexit.app.ice.edu.components.register.should.have.been.called;
            mainVM.availableBC.should.not.have.been.called;
            mainVM.showBCInstances.should.not.have.been.called;
            done();
        });




        it('for no current role, it should display an error and exit loading', function(done){

            theCourse = new dexit.test.Course();
            theArgs = {
                userId: '123',
                bucket: 'newOne',
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                currentRole: '',
                userRoles: '',
                ice4mBCs: '[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]'
            };

            sandbox.stub(dexit.app.ice.edu.components,'register');

            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole');


            mainVM = new dexit.app.ice.edu.Main(theArgs);
            theVMAddGroup = new dexit.app.ice.edu.Main(theArgs);
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, theVMAddGroup);
            mainVM.selectedCourse({courseVM: theCourse});


            sandbox.stub(mainVM,'showFlashWarning');

            sandbox.spy(mainVM, 'showBCInstances');
            mainVM.init();

            should.exist(mainVM.userProfile());
            should.exist(mainVM.repo);
            mainVM.repo.should.equal('dexitco');

            mainVM.userProfile().should.have.property('id','123');
            mainVM.userProfile().should.have.property('name','test@dexit.co');
            mainVM.userProfile().should.have.property('attributes');


            //should have called to displayed warning message
            mainVM.showFlashWarning.should.have.been.calledOnce;
            mainVM.showFlashWarning.should.have.been.calledWith('There seems to be an issue with the configuration of your user account. Please contact your administrator.');

            dexit.app.ice.integration.bcm.retrieveBCMappingByRole.should.not.have.been.called;
            mainVM.showBCInstances.should.not.have.been.called;

            done();

        });


        it('for no args.user.id, should display an error and exit loading', function(done){

            theCourse = new dexit.test.Course();
            theArgs = {
                userId: '123',
                bucket: 'newOne',
                user: JSON.stringify({tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                currentRole: 'role',
                userRoles: 'role',
                ice4mBCs: '[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]'
            };

            sandbox.stub(dexit.app.ice.edu.components,'register');

            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole');


            mainVM = new dexit.app.ice.edu.Main(theArgs);
            theVMAddGroup = new dexit.app.ice.edu.Main(theArgs);
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, theVMAddGroup);
            mainVM.selectedCourse({courseVM: theCourse});


            sandbox.stub(mainVM,'showFlashWarning');


            sandbox.spy(mainVM, 'showBCInstances');
            mainVM.init();

            should.not.exist(mainVM.repo);
            should.not.exist(mainVM.userId);


            //should have called to displayed warning message
            mainVM.showFlashWarning.should.have.been.calledOnce;
            mainVM.showFlashWarning.should.have.been.calledWith('There seems to be an issue with the configuration of your user account. Please contact your administrator.');

            dexit.app.ice.integration.bcm.retrieveBCMappingByRole.should.not.have.been.called;
            mainVM.showBCInstances.should.not.have.been.called;
            done();

        });

        it('for no args.user.tenant, should display an error and exit loading', function(done){

            theCourse = new dexit.test.Course();
            theArgs = {
                userId: '123',
                bucket: 'newOne',
                user: JSON.stringify({id:'123',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                currentRole: 'role',
                userRoles: 'role',
                ice4mBCs: '[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]'
            };

            sandbox.stub(dexit.app.ice.edu.components,'register');

            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole');


            mainVM = new dexit.app.ice.edu.Main(theArgs);
            theVMAddGroup = new dexit.app.ice.edu.Main(theArgs);
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, theVMAddGroup);
            mainVM.selectedCourse({courseVM: theCourse});


            sandbox.stub(mainVM,'showFlashWarning');

            sandbox.spy(mainVM, 'showBCInstances');
            mainVM.init();

            should.not.exist(mainVM.repo);
            should.not.exist(mainVM.userId);
            should.not.exist(mainVM.tenant);


            //should have called to displayed warning message
            mainVM.showFlashWarning.should.have.been.calledOnce;
            mainVM.showFlashWarning.should.have.been.calledWith('There seems to be an issue with the configuration of your user account. Please contact your administrator.');

            dexit.app.ice.integration.bcm.retrieveBCMappingByRole.should.not.have.been.called;
            mainVM.showBCInstances.should.not.have.been.called;
            done();

        });


        it('for no args.user, should display an error and exit loading', function(done){

            theCourse = new dexit.test.Course();
            theArgs = {
                userId: '123',
                bucket: 'newOne',
                user: '',
                currentRole: 'role',
                userRoles: 'role',
                ice4mBCs: '[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]'
            };

            sandbox.stub(dexit.app.ice.edu.components,'register');

            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole');


            mainVM = new dexit.app.ice.edu.Main(theArgs);
            theVMAddGroup = new dexit.app.ice.edu.Main(theArgs);
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, theVMAddGroup);
            mainVM.selectedCourse({courseVM: theCourse});


            sandbox.stub(mainVM,'showFlashWarning');

            sandbox.spy(mainVM, 'showBCInstances');
            mainVM.init();

            should.not.exist(mainVM.repo);
            should.not.exist(mainVM.userId);
            should.not.exist(mainVM.tenant);


            //should have called to displayed warning message
            mainVM.showFlashWarning.should.have.been.calledOnce;
            mainVM.showFlashWarning.should.have.been.calledWith('There seems to be an issue with the configuration of your user account. Please contact your administrator.');

            dexit.app.ice.integration.bcm.retrieveBCMappingByRole.should.not.have.been.called;
            mainVM.showBCInstances.should.not.have.been.called;
            done();

        });

    });





    describe('Flash Messages', function () {
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            theCourse = new dexit.test.Course();
            theArgs = {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket: 'newOne',
                currentRole: 'professor',
                userRoles: 'professor',
                epTemplate: JSON.stringify(dexit.testEP)
            };
            mainVM = new dexit.app.ice.edu.Main(theArgs);
        });
        afterEach(function () {
            sandbox.restore();
        });

        it('should show warning message', function () {
            sandbox.stub(mainVM,'widgetClassName');
            sandbox.stub(mainVM,'thereAreWidgets');

            mainVM.showFlashWarning('message');
            //specific css that should be set
            mainVM.widgetClassName.should.have.been.calledWith('fa fa-exclamation-triangle no-content');
            mainVM.thereAreWidgets.should.have.been.calledWith('message');

        });

        it('should show loading message', function () {
            sandbox.stub(mainVM,'widgetClassName');
            sandbox.stub(mainVM,'thereAreWidgets');

            mainVM.showFlashLoading('message');
            //specific css that should be set
            mainVM.widgetClassName.should.have.been.calledWith('fa fa-spinner fa-pulse');
            mainVM.thereAreWidgets.should.have.been.calledWith('message');

        });

        it('should show information message', function () {
            sandbox.stub(mainVM,'widgetClassName');
            sandbox.stub(mainVM,'thereAreWidgets');

            mainVM.showFlashInformation('message');
            //specific css that should be set
            mainVM.widgetClassName.should.have.been.calledWith('fa fa-info-circle');
            mainVM.thereAreWidgets.should.have.been.calledWith('message');

        });

    });


    // describe('initializePromoRegion', function () {
    //     var sandbox, server;
    //
    //     var theArgs= {
    //         user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
    //         bucket:'newOne', currentRole: 'subscriber',
    //         userRoles: 'subscriber',
    //         sdkRequiredServices: {
    //             scpUrl: '/proxy/scp',
    //             sbUrl: '/proxy/sb',
    //             cbUrl: '/proxy/cb',
    //             ebUrl: '/proxy/eb',
    //             tpmUrl: '/proxy/tpm/',
    //             lpmUrl: '/proxy/lpm',
    //             epmUrl: '/proxy/ep',
    //             upmUrl: '/proxy/upm/user/',
    //             presentationUrl: '/proxy/scprm',
    //             dexSdkMode: 'EP',
    //             fetchOnLoad: false,
    //             epEventId: 'epEventId',
    //             epEventKey: 'epEventKey'
    //         }
    //     };
    //
    //     beforeEach( function() {
    //         server = sinon.fakeServer.create();
    //         sandbox = sinon.sandbox.create();
    //     });
    //     afterEach(function () {
    //         server.restore();
    //         sandbox.restore();
    //     });
    //
    //     it('should handle loading no EP', function (done) {
    //         var tpId = 'test2';
    //         server.respondWith('GET', '/playback?touchpoint='+tpId,
    //             [404,{'Content-Type': 'application/json'}, JSON.stringify({message:'not found'})]);
    //         var mainVM = new dexit.app.ice.edu.Main(theArgs);
    //
    //
    //         sandbox.spy(dexit.device.sdk, 'loadEngagementPattern');
    //         sandbox.spy(mainVM,'_removeInitialHideByElementId');
    //
    //         mainVM.initializePromoRegion(tpId, function (err) {
    //             should.not.exist();
    //             mainVM.promoActive().should.be.false;
    //             mainVM._removeInitialHideByElementId.should.not.have.been.called;
    //             dexit.device.sdk.loadEngagementPattern.should.not.have.been.called;
    //             done();
    //         });
    //
    //         server.respond();
    //
    //     });
    //
    //     it('should successfully load', function (done) {
    //         var mainVM = new dexit.app.ice.edu.Main(theArgs);
    //         var tpId = 'test';
    //
    //
    //         server.respondWith('GET', '/playback?touchpoint='+tpId,
    //             [200,{'Content-Type': 'application/json'}, JSON.stringify({id:'1234567890'})]);
    //
    //
    //         sandbox.stub(dexit.device.sdk, 'loadEngagementPattern').yields();
    //         sandbox.stub(mainVM,'_removeInitialHideByElementId');
    //
    //         mainVM.initializePromoRegion(tpId, function (err) {
    //             should.not.exist(err);
    //             mainVM.promoActive().should.be.true;
    //             mainVM._removeInitialHideByElementId.should.have.been.calledOnce;
    //             mainVM._removeInitialHideByElementId.should.have.been.calledWith('promotionChannelPanel');
    //             dexit.device.sdk.loadEngagementPattern.should.have.been.calledOnce;
    //             dexit.device.sdk.loadEngagementPattern.should.have.been.calledWith('1234567890');
    //             done();
    //         });
    //
    //         server.respond();
    //     });
    //
    //     it('should return error if problem loading EP', function (done) {
    //         var mainVM = new dexit.app.ice.edu.Main(theArgs);
    //         var tpId = 'test';
    //
    //
    //         server.respondWith('GET', '/playback?touchpoint='+tpId,
    //             [200,{'Content-Type': 'application/json'}, JSON.stringify({id:'12345678901'})]);
    //
    //
    //         sandbox.stub(dexit.device.sdk, 'loadEngagementPattern').yields(new Error('uh oh'));
    //         sandbox.stub(mainVM,'_removeInitialHideByElementId');
    //
    //         mainVM.initializePromoRegion(tpId, function (err) {
    //             should.exist(err);
    //             mainVM.promoActive().should.be.true;
    //             mainVM._removeInitialHideByElementId.should.have.been.calledOnce;
    //             mainVM._removeInitialHideByElementId.should.have.been.calledWith('promotionChannelPanel');
    //             dexit.device.sdk.loadEngagementPattern.should.have.been.calledOnce;
    //             dexit.device.sdk.loadEngagementPattern.should.have.been.calledWith('12345678901');
    //             done();
    //         });
    //
    //         server.respond();
    //     });
    //
    // });


    // describe('initializeSDK', function () {
    //     var theCourse, sandbox,
    //         ice4mBCs = [{'name':'Merchandising','bctype':[{'eService':{'bctype':['eServiceInstance']}}]},{'name':'Marketing','bctype':[{'Campaign':{'bctype':['Promotion']}}]}];
    //     beforeEach( function() {
    //         sandbox = sinon.sandbox.create();
    //         theCourse = new dexit.test.Course();
    //
    //         sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,ice4mBCs);
    //
    //     });
    //     afterEach(function () {
    //         sandbox.restore();
    //     });
    //     it('should successfully load SDK', function (done) {
    //         var theArgs= {
    //             user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
    //             bucket:'newOne', currentRole: 'salesManager',
    //             userRoles: 'subscriber',
    //             sdkRequiredServices: {
    //                 scpUrl: '/proxy/scp',
    //                 sbUrl: '/proxy/sb',
    //                 cbUrl: '/proxy/cb',
    //                 ebUrl: '/proxy/eb',
    //                 tpmUrl: '/proxy/tpm/',
    //                 lpmUrl: '/proxy/lpm',
    //                 epmUrl: '/proxy/ep',
    //                 upmUrl: '/proxy/upm/user/',
    //                 presentationUrl: '/proxy/scprm',
    //                 dexSdkMode: 'EP',
    //                 fetchOnLoad: false,
    //                 epEventId: 'epEventId',
    //                 epEventKey: 'epEventKey'
    //             }
    //         };
    //         var mainVM = new dexit.app.ice.edu.Main(theArgs);
    //         sandbox.stub(mainVM, 'showBCInstances');
    //         //ignore loading of reports
    //         sandbox.stub(mainVM,'loadDashboardReports');
    //         mainVM.init();
    //
    //         var expected = {
    //             scpUrl: '/proxy/scp',
    //             sbUrl: '/proxy/sb',
    //             cbUrl: '/proxy/cb',
    //             ebUrl: '/proxy/eb',
    //             tpmUrl: '/proxy/tpm/',
    //             lpmUrl: '/proxy/lpm',
    //             epmUrl: '/proxy/ep',
    //             upmUrl: '/proxy/upm/user/',
    //             presentationUrl: '/proxy/scprm',
    //             dexSdkMode: 'EP',
    //             fetchOnLoad: false,
    //             channelUrlResolutionFunction: sinon.match.func,
    //             userResolutionFunction: sinon.match.func,
    //             repository: 'dexitco',
    //             reportEngine: mainVM
    //         };
    //
    //
    //         sandbox.stub(dexit.device.sdk, 'getTouchpoint').returns({'touchpoint':'tp1'});
    //         sandbox.stub(dexit.device.sdk, 'initialize').yields();
    //         sandbox.stub(dexit.scp.scpm, 'Initialization').yields(null,'resp');
    //
    //
    //         var channelUrl = 'test-me.dexit.co/customer-portal';
    //
    //         mainVM.initializeSDK(channelUrl, function (err) {
    //             should.not.exist(err);
    //             dexit.device.sdk.initialize.should.have.been.calledOnce;
    //             dexit.device.sdk.initialize.should.have.been.calledWith(expected);
    //             dexit.scp.scpm.Initialization.should.have.been.calledOnce;
    //             dexit.scp.scpm.Initialization.should.have.been.calledWith(expected,bccLib);
    //
    //
    //             var isInitialized = mainVM.sdkInitialized;
    //             isInitialized.should.be.true;
    //             mainVM.playbackInitialized.should.equal('resp');
    //             done();
    //         });
    //
    //     });
    //
    //
    //     it('should return error if missing required configuration', function (done) {
    //
    //         var theArgs= {repo: 'dev', userId: '122',
    //             user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
    //             bucket:'newOne', currentRole: 'professor',
    //             userRoles: 'subscriber'
    //         };
    //         var mainVM = new dexit.app.ice.edu.Main(theArgs);
    //         sandbox.stub(mainVM, 'showBCInstances');
    //         //ignore loading of reports
    //         sandbox.stub(mainVM,'loadDashboardReports');
    //         mainVM.init();
    //
    //         var channelUrl = 'ps-ice4mm.herokuapp.com/customer-portal';
    //
    //         sandbox.stub(dexit.device.sdk, 'initialize').yields();
    //         sandbox.stub(dexit.scp.scpm, 'Initialization').yields();
    //
    //         mainVM.initializeSDK(channelUrl, function (err) {
    //             should.exist(err);
    //             dexit.device.sdk.initialize.should.not.have.been.called;
    //             dexit.scp.scpm.Initialization.should.not.have.been.called;
    //             done();
    //         });
    //
    //     });
    //
    //
    //     it('should successfully load SDK and skip initializing playback if already done', function (done) {
    //         var theArgs= {repo: 'dev', userId: '122',
    //             user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
    //             bucket:'newOne', currentRole: 'professor',
    //             userRoles: 'subscriber',
    //             sdkRequiredServices: {
    //                 scpUrl: '/proxy/scp',
    //                 sbUrl: '/proxy/sb',
    //                 cbUrl: '/proxy/cb',
    //                 ebUrl: '/proxy/eb',
    //                 tpmUrl: '/proxy/tpm/',
    //                 lpmUrl: '/proxy/lpm',
    //                 epmUrl: '/proxy/ep',
    //                 upmUrl: '/proxy/upm/user/',
    //                 presentationUrl: '/proxy/scprm',
    //                 dexSdkMode: 'EP',
    //                 fetchOnLoad: false,
    //                 epEventId: 'epEventId',
    //                 epEventKey: 'epEventKey'
    //             }
    //         };
    //         var mainVM = new dexit.app.ice.edu.Main(theArgs);
    //         sandbox.stub(mainVM, 'showBCInstances');
    //         //ignore loading of reports
    //         sandbox.stub(mainVM,'loadDashboardReports');
    //         mainVM.init();
    //
    //         var expected = {
    //             scpUrl: '/proxy/scp',
    //             sbUrl: '/proxy/sb',
    //             cbUrl: '/proxy/cb',
    //             ebUrl: '/proxy/eb',
    //             tpmUrl: '/proxy/tpm/',
    //             lpmUrl: '/proxy/lpm',
    //             epmUrl: '/proxy/ep',
    //             upmUrl: '/proxy/upm/user/',
    //             presentationUrl: '/proxy/scprm',
    //             dexSdkMode: 'EP',
    //             fetchOnLoad: false,
    //             channelUrlResolutionFunction: sinon.match.func,
    //             userResolutionFunction: sinon.match.func,
    //             repository: 'dexitco',
    //             reportEngine: mainVM
    //         };
    //
    //         sandbox.stub(dexit.device.sdk, 'initialize').yields();
    //         sandbox.spy(dexit.scp.scpm, 'Initialization');
    //
    //
    //         var channelUrl = 'test-me.dexit.co/customer-portal';
    //
    //         mainVM.playbackInitialized = 'resp';
    //
    //         mainVM.initializeSDK(channelUrl, function (err) {
    //             should.not.exist(err);
    //             dexit.device.sdk.initialize.should.have.been.calledOnce;
    //             dexit.device.sdk.initialize.should.have.been.calledWith(expected);
    //             dexit.scp.scpm.Initialization.should.not.have.been.called;
    //             var isInitialized = mainVM.sdkInitialized;
    //             isInitialized.should.be.true;
    //             mainVM.playbackInitialized.should.equal('resp');
    //             done();
    //         });
    //
    //     });
    //
    //
    //     it('should successfully unload SDK if already initialized and re-initialize SDK and skip initializing playback if already done', function (done) {
    //         var theArgs= {repo: 'dev', userId: '122',
    //             user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
    //             bucket:'newOne', currentRole: 'professor',
    //             userRoles: 'subscriber',
    //             sdkRequiredServices: {
    //                 scpUrl: '/proxy/scp',
    //                 sbUrl: '/proxy/sb',
    //                 cbUrl: '/proxy/cb',
    //                 ebUrl: '/proxy/eb',
    //                 tpmUrl: '/proxy/tpm/',
    //                 lpmUrl: '/proxy/lpm',
    //                 epmUrl: '/proxy/ep',
    //                 upmUrl: '/proxy/upm/user/',
    //                 presentationUrl: '/proxy/scprm',
    //                 dexSdkMode: 'EP',
    //                 fetchOnLoad: false,
    //                 epEventId: 'epEventId',
    //                 epEventKey: 'epEventKey'
    //             }
    //         };
    //         var mainVM = new dexit.app.ice.edu.Main(theArgs);
    //         sandbox.stub(mainVM, 'showBCInstances');
    //         //ignore loading of reports
    //         sandbox.stub(mainVM,'loadDashboardReports');
    //         mainVM.init();
    //
    //         var expected = {
    //             scpUrl: '/proxy/scp',
    //             sbUrl: '/proxy/sb',
    //             cbUrl: '/proxy/cb',
    //             ebUrl: '/proxy/eb',
    //             tpmUrl: '/proxy/tpm/',
    //             lpmUrl: '/proxy/lpm',
    //             epmUrl: '/proxy/ep',
    //             upmUrl: '/proxy/upm/user/',
    //             presentationUrl: '/proxy/scprm',
    //             dexSdkMode: 'EP',
    //             fetchOnLoad: false,
    //             channelUrlResolutionFunction: sinon.match.func,
    //             userResolutionFunction: sinon.match.func,
    //             repository: 'dexitco',
    //             reportEngine: mainVM
    //         };
    //
    //         sandbox.stub(dexit.device.sdk, 'unload').yields();
    //         sandbox.stub(dexit.device.sdk, 'initialize').yields();
    //         sandbox.stub(dexit.scp.scpm, 'Initialization').yields(null,'resp');
    //
    //
    //         var channelUrl = 'test-me.dexit.co/customer-portal';
    //
    //         mainVM.playbackInitialized = 'resp';
    //         mainVM.sdkInitialized = true;
    //
    //         mainVM.initializeSDK(channelUrl, function (err) {
    //             should.not.exist(err);
    //             dexit.device.sdk.unload.should.have.been.calledOnce;
    //
    //             dexit.device.sdk.initialize.should.have.been.calledOnce;
    //             dexit.device.sdk.initialize.should.have.been.calledWith(expected);
    //             dexit.scp.scpm.Initialization.should.not.have.been.called;
    //             var isInitialized = mainVM.sdkInitialized;
    //             isInitialized.should.be.true;
    //             mainVM.playbackInitialized.should.equal('resp');
    //             done();
    //         });
    //
    //     });
    //
    //
    // });

    describe('tpTypeSelected', function() {
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theCourse = new dexit.test.Course();
            theArgs= {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'professor', userRoles: 'professor', epTemplate: JSON.stringify(dexit.testEP)};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
        });
        afterEach(function () {
            sandbox.restore();
        });

        it('Should be successful to add tp by selecting tp', function(done) {
            var selectedChannelType = 'ucc';
            var fakeTPList = [{'tpName': 'testTP', 'tpId': '1234'}];
            var stub1 = sandbox.stub(dexit.app.ice.integration.tpm, 'findPreconfiguredTPs');
            theCourse.associatedSegments('subscriber');
            mainVM.currBCType('MerchandisingCampaign');
            mainVM.selectedCourse({courseVM: theCourse});
            stub1.callsArgWith(1, null, fakeTPList);
            mainVM.tpTypeSelected(selectedChannelType);
            expect(mainVM.tpList[0].tpName).to.eql('testTP');
            expect(mainVM.tpList[0].tpId).to.eql('1234');
            expect(mainVM.tpNameList().length).to.eql(1);
            done();
        });

        it('fail to retrieve the selected touchpoint', function(done) {
            var fakeTPList = [{'tpName': 'testTP', 'tpId': '1234'}];
            var stub1 = sandbox.stub(dexit.app.ice.integration.tpm, 'findPreconfiguredTPs');
            theCourse.associatedSegments('subscriber');
            mainVM.currBCType('MerchandisingCampaign');
            mainVM.selectedCourse({courseVM: theCourse});
            stub1.callsArgWith(1, true, null);
            mainVM.tpTypeSelected();
            expect(mainVM.tpList.length).to.eql(0);
            expect(mainVM.tpNameList().length).to.eql(0);
            done();
        });

    });

    describe('Manage BCi relationships', function() {
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theArgs= {ice4mBCs:'[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', epTemplate: JSON.stringify(dexit.testEP)};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
        });
        afterEach(function () {
            sandbox.restore();
        });

    });
    describe('Define BCi', function() {
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theArgs= {ice4mBCs:'[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', epTemplate: JSON.stringify(dexit.testEP)};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
            theCourse = new dexit.test.Course();
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);
            mainVM.selectedCourse({courseVM:theCourse});
        });
        afterEach(function () {
            sandbox.restore();
        });

        // it('Should add assoicated reports by metrics from engagement point', function(done) {
        //     mainVM.currentRole('salesManager');
        //     mainVM.currBCDef({bctype:'merchandisingCampain'});
        //     sandbox.stub(mainVM, 'getAssociatedBCIns').returns([{definition:[{metricId:123}]}]);
        //
        //     mainVM.prepareReportsByMetrics('testEPtId',['123','111']);
        //     expect(mainVM.currentAssociatedEptWidgetReport.length).to.be.eql(1);
        //     expect(mainVM.eptReportMapping[0].eptId).to.be.eql('testEPtId');
        //     expect(mainVM.widgetReportList().length).to.be.eql(1);
        //     done();
        // });



        it('Should get report relationship by bcType', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcIns = {bcRelationships:[{type:'association', ref:'reports', refData:{role:'salesManager', bcType:'merchandisingCampain'}}],property:{bcRelationships:JSON.stringify({type:'association', ref:'reports', role:'salesManager', bcType:'merchandisingCampain'})}};

            var reportRelationship = mainVM.getReportRelationship(bcIns,'merchandisingCampain');
            reportRelationship.should.be.eql({type:'association', ref:'reports', refData:{role:'salesManager', bcType:'merchandisingCampain'}});
            done();
        });

        it('Should set widget report by getting report relationship', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;
            bcInsVM.businessConceptInstance.property.bcRelationships = [{refData:{definition:[]} , type:'association', ref:'reports', role:'salesManager', bcType:'merchandisingCampain'}];
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData');
            mainVM.setWidgetReport(bcInsVM);

            stub2.should.not.have.been.calledOnce;
            stub3.should.not.have.been.calledOnce;
            done();
        });


        it('Should get associated products when defining campaign', function(done) {
            mainVM.currentRole('salesManager');
            var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole')
                .yields(null, [{bci_id:'testProductId'}]);
            var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance')
                .yields(null, {id:'testProductId', property:{name:'testProduct', class:'product', associatedeServices:[]}});
            sandbox.stub(dexit.app.ice.integration.bcp,'listBCBehaviours').yields(null,[]);
            mainVM.getAssociatedProductIns('data');
            stub1.should.have.been.calledOnce;
            stub2.should.have.been.calledOnce;
            done();
        });

        it('Should get associated BCi(reports)', function(done) {
            theArgs= {ice4mBCs:'[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', epTemplate: JSON.stringify(dexit.testEP)};
            theArgs.associatedBCDefinitions = {reports: {widgetReport:[{role:'salesManager',bcType:'MerchandisingCampaign'}],
                kpiReport:[{role:'salesManager',bcType:'Merchandising'}],
                dashboardReport:[{role:'salesManager',bcType:'Merchandising'}]}};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({name:'Merchandising'});
            mainVM.currentRole('salesManager');
            mainVM.currBCType('MerchandisingCampaign');
            var returned;
            var params = {};
            mainVM.getAssociatedBCIns(params);
            var params = {associatedBCName:'reports'};
            mainVM.getAssociatedBCIns(params);
            var params = {associatedBCName:'reports', subBCType: 'widgetReport', bcType: 'MerchandisingCampaign'};
            expect(mainVM.getAssociatedBCIns(params)).to.be.eql([{role:'salesManager',bcType:'MerchandisingCampaign'}]);
            var params = {associatedBCName:'reports', subBCType: 'kpiReport'};
            expect(mainVM.getAssociatedBCIns(params)).to.be.eql([{role:'salesManager',bcType:'Merchandising'}]);
            var params = {associatedBCName:'reports', subBCType: 'dashboardReport'};
            expect(mainVM.getAssociatedBCIns(params)).to.be.eql({role:'salesManager',bcType:'Merchandising'});
            done();
        });


    });

    // mainVM.listBCInstances no longer is used - tests should be migrated for portalVM._listBCInstances
    // describe('List BCi', function() {
    //     var theCourse, theArgs, mainVM, sandbox;
    //     beforeEach( function() {
    //         sandbox = sinon.sandbox.create();
    //         theArgs= {ice4mBCs:'[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', epTemplate: JSON.stringify(dexit.testEP)};
    //         mainVM = new dexit.app.ice.edu.Main(theArgs);
    //         mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
    //         theCourse = new dexit.test.Course();
    //         theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);
    //         mainVM.selectedCourse({courseVM:theCourse});
    //     });
    //     afterEach(function () {
    //         sandbox.restore();
    //     });
    //     it('Should list BC Instances by current role and bc type', function(done) {
    //         mainVM.currentRole('salesManager');
    //         mainVM.currBCType('merchandisingCampaign');
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole');
    //         stub1.callsArgWith(1, null, [{bci_id: 'test_BCid'}]);
    //         var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
    //         stub2.callsArgWith(1, null, {property: {associatedeServices: JSON.stringify({id: 'serviceId'})}});
    //         mainVM.listBCInstances();
    //         expect(stub1.calledOnce).to.be.true;
    //         expect(stub2.calledOnce).to.be.true;
    //         done();
    //     });
    //     it('Should show flash info if BCi retrieval failed', function(done) {
    //         mainVM.currentRole('salesManager');
    //         mainVM.currBCType('merchandisingCampaign');
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCiFromEntityRelationshipByRole');
    //         stub1.callsArgWith(1, true, null);
    //         var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
    //         mainVM.listBCInstances();
    //         expect(stub1.calledOnce).to.be.true;
    //         expect(stub2.calledOnce).to.be.false;
    //         expect(mainVM.thereAreWidgets()).to.be.eql('failed to load '+mainVM.currBCType().plural+'!');
    //         done();
    //     });
    // });

    // test unit ICEMM-339 - addBCInstance
    // done by KB sept 28 2017
    describe('addBCInstance unit test', function() {
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();

            var ice4mBCs = [{'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]}];
            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,ice4mBCs);

            theArgs= {ice4mBCs:JSON.stringify(ice4mBCs),
                repo: 'dev', user: JSON.stringify({id:'122', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', epTemplate: JSON.stringify(dexit.testEP),
                associatedBCDefinitions:{reports: {
                    'intelligenceReport': [{'role':'subscriber',
                        'definition': {
                            'data': [
                                {'label':'Balance', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1170}},
                                {'label':'Minutes', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}},
                                {'label':'data', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}}],
                            'presentation':[
                                {'label':['Balance'], 'type': 'bar', 'title': 'current Usage'},
                                {'label':['Minutes'], 'type': 'pie', 'title': 'current Usage'},
                                {'label':['data'], 'type': 'pie', 'title': 'current Usage'}]
                        }
                    },
                    {'role':'retailer',
                        'definition': {
                            'data': [
                                {'label':'Balance', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1170}},
                                {'label':'Minutes', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}},
                                {'label':'data', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}}],
                            'presentation':[
                                {'label':['Balance'], 'type': 'bar', 'title': 'current Usage'},
                                {'label':['Minutes'], 'type': 'pie', 'title': 'current Usage'},
                                {'label':['data'], 'type': 'pie', 'title': 'current Usage'}]
                        }
                    }],
                    'segmentReport':[{'role':'subscriber','name':'1-subscriber-report', 'definition':[{'metricId':282, 'icon':'fa fa-bolt'},{'metricId':292, 'icon':'fa fa-hourglass-half'},{'metricId':302, 'icon':'fa fa-usd'}]},
                        {'role':'retailer','name':'1-retailer-report', 'definition':[{'metricId':312, 'icon':'fa fa-shopping-cart'},{'metricId':322, 'icon':'fa fa-hourglass-half'},{'metricId':332, 'icon':'fa fa-usd'}]},
                        {'role':'wholesaler','name':'1-wholesaler-report', 'definition':[{'metricId':342, 'icon':'fa fa-shopping-cart'},{'metricId':352, 'icon':'fa fa-usd'},{'metricId':362, 'icon':'fa fa-percent'}]},
                        {'role':'subscriber','name':'2-subscriber-report', 'definition':[{'metricId':282, 'icon':'fa fa-bolt'},{'metricId':292, 'icon':'fa fa-hourglass-half'},{'metricId':302, 'icon':'fa fa-usd'}]},
                        {'role':'retailer','name':'2-retailer-report', 'definition':[{'metricId':312, 'icon':'fa fa-shopping-cart'},{'metricId':322, 'icon':'fa fa-hourglass-half'},{'metricId':332, 'icon':'fa fa-usd'}]},
                        {'role':'wholesaler','name':'2-wholesaler-report', 'definition':[{'metricId':342, 'icon':'fa fa-shopping-cart'},{'metricId':352, 'icon':'fa fa-usd'},{'metricId':362, 'icon':'fa fa-percent'}]}],
                    'widgetReport':[
                        {'role':'salesManager','bcType':'MerchandisingCampaign','name':'widgetReport for EREC','seSInstanceId':'EREC','level':'dashboard',
                            'definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-tags'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'}]},
                        {'role':'salesManager','bcType':'MerchandisingCampaign','name':'widgetReport for EVOU','seSInstanceId':'EVOU','level':'dashboard',
                            'definition':[{'metricId':182, 'name':'total_orders_processed', 'icon':'fa fa-shopping-cart'},{'metricId':192, 'name':'total_dollars_retail', 'icon':'fa fa-usd'},{'metricId':202, 'name':'total_dealers', 'icon':'fa fa-user-plus'}]},
                        {'role':'salesManager','bcType':'MerchandisingCampaign','name':'widgetReport for EORD','seSInstanceId':'EORD','level':'dashboard',
                            'definition':[{'metricId':142, 'name':'total_orders', 'icon':'fa fa-shopping-cart'},{'metricId':242, 'name':'total_dollars', 'icon':'fa fa-usd'},{'metricId':132, 'name':'average_commission', 'icon':'fa fa-percent'}]},
                        {'role':'salesManager','bcType':'EngagementPlan','name':'widgetReport for EREC','seSInstanceId':'EREC','level':'EPA',
                            'definition':[{'metricId':272, 'name':'total_recharge_users_per_pattern', 'icon':'fa fa-user-plus'},{'metricId':252, 'name':'total_recharge_count_per_pattern', 'icon':'fa fa-tags'},{'metricId':262, 'name':'total_recharge_amount_per_pattern', 'icon':'fa fa-usd'}]},
                        {'role':'salesManager','bcType':'EngagementPlan','name':'widgetReport for EVOU','seSInstanceId':'EVOU','level':'EPA',
                            'definition':[{'metricId':212, 'name':'total_orders_processed_per_pattern', 'icon':'fa fa-shopping-cart'},{'metricId':222, 'name':'total_dollars_retail_per_pattern', 'icon':'fa fa-usd'},{'metricId':232, 'name':'total_dealers_per_pattern', 'icon':'fa fa-user-plus'}]},
                        {'role':'salesManager','bcType':'EngagementPlan','name':'widgetReport for EORD','seSInstanceId':'EORD','level':'EPA',
                            'definition':[{'metricId':162, 'name':'total_orders_per_pattern', 'icon':'fa fa-shopping-cart'},{'metricId':172, 'name':'total_dollars_per_pattern', 'icon':'fa fa-usd'},{'metricId':152, 'name':'average_commission_per_pattern', 'icon':'fa fa-percent'}]},
                        {'role':'productManager','bcType':'Product','name':'widgetReport for EREC','seSInstanceId':'EREC','level':'dashboard',
                            'definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-bolt'}]},
                        {'role':'productManager','bcType':'Product','name':'widgetReport for EVOU','seSInstanceId':'EVOU','level':'dashboard',
                            'definition':[{'metricId':182, 'name':'total_orders_processed', 'icon':'fa fa-shopping-cart'},{'metricId':192, 'name':'total_dollars_retail', 'icon':'fa fa-usd'},{'metricId':202, 'name':'total_dealers', 'icon':'fa fa-user-plus'}]},
                        {'role':'productManager','bcType':'Product','name':'widgetReport for EORD','seSInstanceId':'EORD','level':'dashboard',
                            'definition':[{'metricId':142, 'name':'total_orders', 'icon':'fa fa-shopping-cart'},{'metricId':242, 'name':'total_dollars', 'icon':'fa fa-usd'},{'metricId':132, 'name':'average_commission', 'icon':'fa fa-percent'}]},
                        {'role':'subscriber','bcType':'MerchandisingCampaign','seSInstanceId':'EREC','level':'dashboard',
                            'definition':[{'metricId':282, 'name':'total_recharges_for_user', 'icon':'fa fa-bolt'},{'metricId':292, 'name':'total_minutes_for_user', 'icon':'fa fa-hourglass-half'},{'metricId':302, 'name':'total_dollars_for_user', 'icon':'fa fa-usd'}]},
                        {'role':'retailer','bcType':'MerchandisingCampaign','seSInstanceId':'EVOU','level':'dashboard',
                            'definition':[{'metricId':312, 'name':'total_recharge_for_retailer', 'icon':'fa fa-shopping-cart'},{'metricId':322, 'name':'total_minutes_for_retailer', 'icon':'fa fa-hourglass-half'},{'metricId':332, 'name':'total_dollars_for_retailer', 'icon':'fa fa-usd'}]},
                        {'role':'wholesaler','bcType':'MerchandisingCampaign','seSInstanceId':'EORD','level':'dashboard',
                            'definition':[{'metricId':342, 'name':'total_purchases_for_wholesaler', 'icon':'fa fa-shopping-cart'},{'metricId':352, 'name':'total_dollers_spent_for_wholesaler', 'icon':'fa fa-usd'},{'metricId':362, 'name':'average_commission_for_wholesaler', 'icon':'fa fa-percent'}]},
                        {'role':'marketingManager','bcType':'MarketingCampaign','name':'Report for ECAM','seSInstanceId':'ECAM','level':'dashboard',
                            'definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'marketingManager','bcType':'MarketingCampaign','name':'Report for MSOC','seSInstanceId':'MSOC','level':'dashboard',
                            'definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'marketingManager','bcType':'Promotion','name':'Promotion Report for ECAM','seSInstanceId':'ECAM','level':'EPA',
                            'definition':[{'metricId':22, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':32, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':52, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'marketingDirector','seSInstanceId':'ECAM','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'marketingDirector','seSInstanceId':'MSOC','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'marketingDirector','seSInstanceId':'MSUB','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'marketingDirector','seSInstanceId':'MWS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'marketingDirector','seSInstanceId':'MRS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'executive','seSInstanceId':'EREC','level':'dashboard','definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-tags'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'}]},
                        {'role':'executive','seSInstanceId':'EVOU','level':'dashboard','definition':[{'metricId':182, 'name':'total_orders_processed', 'icon':'fa fa-shopping-cart'},{'metricId':192, 'name':'total_dollars_retail', 'icon':'fa fa-usd'},{'metricId':202, 'name':'total_dealers', 'icon':'fa fa-user-plus'}]},
                        {'role':'executive','seSInstanceId':'EORD','level':'dashboard','definition':[{'metricId':142, 'name':'total_orders', 'icon':'fa fa-shopping-cart'},{'metricId':242, 'name':'total_dollars', 'icon':'fa fa-usd'},{'metricId':132, 'name':'average_commission', 'icon':'fa fa-percent'}]},
                        {'role':'executive','seSInstanceId':'ECAM','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'executive','seSInstanceId':'MSOC','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'executive','seSInstanceId':'MWS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'executive','seSInstanceId':'MRS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                        {'role':'executive','seSInstanceId':'MSUB','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]}
                    ],
                    'kpiReport':[
                        {'role': 'salesManager', 'bcType': 'Merchandising', 'name':'Sales Manager eService KPI Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eOrder Revenue'},{'type':'number', 'name':'eVoucher Revenue'},{'type':'number', 'name':'eRecharge Revenue'}],
                                'data':[['2016-Q1', 62, 182, 82],['2016-Q2', 62, 182, 82],['2016-Q3', 62, 182, 82],['2016-Q4', 62, 182, 82]]}},
                        {'role': 'salesManager', 'bcType': 'Merchandising', 'name':'Sales Manager eService KPI Report 2',
                            'definition':{
                                'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eOrder Revenue'},{'type':'number', 'name':'eVoucher Revenue'},{'type':'number', 'name':'eRecharge Revenue'}],
                                'data':[['2016-Q1', 62, 182, 82],['2016-Q2', 62, 182, 82],['2016-Q3', 62, 182, 82],['2016-Q4', 62, 182, 82]]}},
                        {'role': 'productManager', 'bcType': 'Product', 'name':'Revenue Summary - SeService Recharge',
                            'definition':{
                                'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'Regular'},{'type':'number', 'name':'Special'}],
                                'data':[['Smart eOrder', 62, 82], ['Smart eVoucher', 62, 82], ['Smart eRecharge', 62, 82]]}},
                        {'role': 'subscriber', 'bcType': 'Merchandising', 'name':'My eRecharge Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'remained'},{'type':'number', 'name':'total_redeemed'}],
                                'data':[['current balance', 62, 182]]}},
                        {'role': 'wholesaler', 'bcType': 'Merchandising', 'name':'My eOrder Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eOrder'}],
                                'data':[['Smart eOrder: Purchases', 62],['Smart eOrder: Sales', 182],['Smart eOrder: Commissions', 82]]}},
                        {'role': 'retailer', 'bcType': 'Merchandising', 'name':'My eVoucher Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eVoucher'}],
                                'data':[['Smart eVoucher: Regular', 182],['Smart eVoucher: Special',82]]}},
                        {'role': 'executive',  'bcType': 'Merchandising', 'name':'SeService Penetration Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'eService'},{'type':'number', 'name':'Revenue'}],
                                'data':[['SeService Revenue', 62],['Traditional Revenue', 182],['Others', 82]]}},
                        {'role': 'executive', 'bcType': 'Marketing', 'name':'Engagement KPI Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'Total'},{'type':'number', 'name':'Engagement Metrics'}],
                                'data':[['Retention', 82],['Development', 62],['Acquisition', 182]]}},
                        {'role': 'marketingDirector', 'bcType': 'Marketing', 'name':'Engagement KPI Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'Total'},{'type':'number', 'name':'Engagement Metrics'}],
                                'data':[['Conversation', 282],['Applause', 202],['Amplification', 322],['Consumption',342]]}},
                        {'role': 'marketingManager', 'bcType': 'Marketing', 'name':'Engagement KPI Report',
                            'definition':{
                                'column': [{'type':'string', 'name':'Total'},{'type':'number', 'name':'Engagement Metrics'}],
                                'data':[['Conversation', 62],['Applause', 82],['Amplification', 182],['Consumption',202]]}}
                    ],
                    'dashboardReport':[
                        {'role': 'executive', 'bcType': 'Merchandising', 'name':'SeService Achievement REPORT',
                            'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                                'column':['', 'Goal', 'Actual'],
                                'data':[['Total eOrder', 62, 82],['Total eVoucher', 182, 202],['Total eRecharge', 322, 342]]}},
                        {'role': 'salesManager', 'bcType':'Merchandising', 'name':'SeService Achievement REPORT',
                            'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                                'column':['', 'Planned', 'Achieved'],
                                'data':[['social channel', 1170, 460],['traditional channel', 1660, 1120]]}},
                        {'role': 'productManager', 'bcType':'Merchandising', 'name':'SeService Achievement REPORT',
                            'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                                'column':['', 'Planned', 'Achieved'],
                                'data':[['social channel', 1170, 460],['traditional channel', 1660, 1120]]}},
                        {'role': 'executive', 'bcType':'Marketing',
                            'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                                'column':['', 'Sales', 'Profit'],
                                'data':[['Standard', 1170, 460],['online Promotion', 1660, 1120]]}},
                        {'role': 'marketingManager', 'bcType':'Marketing',
                            'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                                'column':['', 'Planned', 'Achieved'],
                                'data':[['Standard', 1170, 460],['online Promotion', 1660, 1120]]}}
                    ]
                }}};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
            theCourse = new dexit.test.Course();
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);
            mainVM.selectedCourse({courseVM:theCourse});
            mainVM.currBCDef({
                'singular': 'Product',
                'plural': 'Products',
                'sctype': 'container',
                'bctype': 'Product',
                'metrics': [62,72,82,132,142,182,192,202,242,252,262,272,282,292,302,312,322,332,342,352,362],
                'associatedRoles': ['salesManager', 'marketingManager'],
                'bcAttributes':[
                    {'role':'salesManager', 'properties':[{'name':'Business Objective', 'value':'Increase 20% revenue in this quater.'},{'name':'Business Strategy', 'value':'Use two recharge services'},{'name':'Comments', 'value':''}]},
                    {'role':'executive', 'properties':[{'name':'Business Objective', 'value':'Increase 20% revenue in this quater.'},{'name':'Business Strategy', 'value':'Use two recharge services'},{'name':'Comments', 'value':''}]}
                ],
                'relationships':{
                    'bcRelationships': [
                        {'type': 'association', 'ref': 'MerchandisingCampaign'},
                        {'type': 'association', 'ref': 'reports'},
                        {'type': 'association', 'ref': 'kpiReport'}
                    ],
                    'entityRelationships': [
                        {'type':'association', 'ref': 'Roles',
                            'define': {'roles':['salesManager'], 'type':'value', 'value':['subscriber', 'wholesaler', 'retailer']}}
                    ]
                },
                'definition':{
                    '$schema': 'http://json-schema.org/draft-04/schema#',
                    'type': 'object',
                    'properties': {
                        'name': {
                            'type': 'string'
                        },
                        'description': {
                            'type': 'string'
                        },
                        'class': {
                            'type': 'string',
                            'default': 'Product'
                        }
                    },
                    'required': [
                        'name',
                        'class'
                    ]
                }
            });
            $('body').append('<div class=\'create-preload\'></div>');

        });
        afterEach(function () {
            sandbox.restore();
        });


    });


    describe('instantiateStoryView', function(){

        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theArgs= {ice4mBCs:'[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager'};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
            theCourse = new dexit.test.Course();
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);

            mainVM.selectedCourse({courseVM:theCourse});
        });
        afterEach(function () {
            sandbox.restore();
        });
        it('should load successfully', function (done) {

            sandbox.stub(mainVM,'instantiatePatternThumbnail').returns();
            mainVM.touchpointTypes({'foo':{'icon':'icon'}});
            mainVM.selectedCourse().courseVM.tpm([{tpId:'46261b44-cce1-42c9-b806-9c3db01dfc27-2', channelType:'foo'}]);

            sandbox.stub(storyboard_VM,'init').yields();

            sandbox.spy(theCourse,'epAuthoringState');

            var params = {
                'scId': '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                'epId': '203162',
                'repo': 'dexitco',
                'epObject':{
                    'cells':[]
                }
            };

            var expected = {
                'scId': '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                'epId': '203162',
                'repo': 'dexitco',
                'epObject':{
                    'cells':[]
                },
                tps: [{tpId:'46261b44-cce1-42c9-b806-9c3db01dfc27-2', channelType:'foo', icon:'icon'}],
                mainVM: mainVM
            };
            mainVM.instantiateStoryView(params, function (err) {
                should.not.exist(err);

                storyboard_VM.init.should.have.been.calledOnce;
                storyboard_VM.init.should.have.been.calledWith(expected);
                theCourse.epAuthoringState.should.have.been.calledWith('story');
                //comment out for now
                // mainVM.instantiatePatternThumbnail.should.have.been.calledOnce;
                // mainVM.instantiatePatternThumbnail.should.have.been.calledWith(expected)
                done();
            });
        });

        it('should return underlying error from storyboard_VM', function (done) {

            sandbox.stub(mainVM,'instantiatePatternThumbnail').returns();

            mainVM.touchpointTypes({'foo':{'icon':'icon'}});
            mainVM.selectedCourse().courseVM.tpm([{tpId:'46261b44-cce1-42c9-b806-9c3db01dfc27-2', channelType:'foo'}]);

            sandbox.stub(storyboard_VM,'init').yields(new Error('uh oh'));

            sandbox.spy(theCourse,'epAuthoringState');

            var params = {
                'scId': '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                'epId': '203162',
                'repo': 'dexitco',
                'epObject':{
                    'cells':[]
                },
                tps: [{tpId:'46261b44-cce1-42c9-b806-9c3db01dfc27-2', channelType:'foo'}]
            };

            var expected = {
                'scId': '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                'epId': '203162',
                'repo': 'dexitco',
                'epObject':{
                    'cells':[]
                },
                tps: [{tpId:'46261b44-cce1-42c9-b806-9c3db01dfc27-2', channelType:'foo', icon:'icon'}],
                mainVM: mainVM
            };
            mainVM.instantiateStoryView(params, function (err) {
                should.exist(err);
                storyboard_VM.init.should.have.been.calledOnce;
                storyboard_VM.init.should.have.been.calledWith(expected);
                theCourse.epAuthoringState.should.not.have.been.called;
                mainVM.instantiatePatternThumbnail.should.not.have.been.called;
                done();
            });
        });

    });


    describe('Navigation', function(){
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theArgs= {ice4mBCs:'[{"name":"ProgramGroup","id":"d7b05541-f64d-46a0-a428-9da37d0fc9c6",bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager'};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({'name': 'ProgramGroup', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
            // theCourse = new dexit.test.Course();
            // theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);

            // mainVM.selectedCourse({courseVM:theCourse});
        });


        it('should load performance section', function(){

            mainVM.currentParentBCType('ProgramGroup');
            mainVM.currentRole('manager');

            sandbox.stub(mainVM.performanceVM,'init');
            sandbox.stub(mainVM.performanceVM,'load');

            mainVM.goToPerformance();

            mainVM.performanceVM.init.should.have.been.calledOnce;
            mainVM.performanceVM.init.should.have.been.calledWith({
                bcId:'d7b05541-f64d-46a0-a428-9da37d0fc9c6',
                bcType:'ProgramGroup',
                role:'manager'
            });
            mainVM.performanceVM.load.should.have.been.calledOnce;

        });
    });


    //TODO: rewrite and move to test file ep-performance-vm
    describe.skip('saveDashboardIntelligence', function() {
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theArgs= {ice4mBCs:'[{"name":"Merchandising","id":"d7b05541-f64d-46a0-a428-9da37d0fc9c6",bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager'};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
            theCourse = new dexit.test.Course();
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);

            mainVM.selectedCourse({courseVM:theCourse});
        });
        afterEach(function () {
            sandbox.restore();
        });

        var available = [
            {'name':'newOne',
                'definition':{'intelType':'concept','column':[{'type':'string','name':'datePurchased'},{'type':'number','name':'amount'}]}},
            {'name':'existingOne','location':'simulator_erecharge',
                'definition':{'intelType':'concept','column':[{'type':'string','name':'datePurchased'},{'type':'number','name':'amount'}]}}

        ];
        var bcId = 'd7b05541-f64d-46a0-a428-9da37d0fc9c6';

        it('should add new intelligence, no existing dashboard intelligence for role', function(done) {
            var clock = sandbox.useFakeTimers();
            var bcData = {
                property: {
                    'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6',
                    'version':'def'
                },
                intelligence: []
            };

            mainVM.currentParentBCName = 'Merchandising';
            mainVM.showDashboard(true);
            mainVM.selectedDashboardIntelligence(['newOne']);
            mainVM.availableDashboardIntelligence(available);


            sandbox.stub(dexit.app.ice.integration.bcp,'retrieveBCInstance').yields(null,bcData);
            sandbox.stub(dexit.app.ice.integration.bcp,'updateBCInstance').yields();
            sandbox.stub(mainVM,'loadDashboardReports');


            //test
            mainVM.saveDashboardIntelligence('test');
            clock.tick(10);

            dexit.app.ice.integration.bcp.retrieveBCInstance.should.have.been.calledOnce;
            dexit.app.ice.integration.bcp.retrieveBCInstance.should.have.been.calledWith({
                id: bcId,
                type: 'Merchandising',
                queryParams:{ },
            });
            dexit.app.ice.integration.bcp.updateBCInstance.should.have.been.calledOnce;

            dexit.app.ice.integration.bcp.updateBCInstance.should.have.been.calledWith({
                'type':'Merchandising',
                'id':bcId,
                'version':'def',
                'changes':[
                    {op:'add', path:'/intelligence/', value:
                            [{'role':'test','present_eng_report':true,'name':'newOne', 'definition':{'intelType':'concept','column':[{'type':'string','name':'datePurchased'},{'type':'number','name':'amount'}]}}]}
                ]});
            mainVM.loadDashboardReports.should.have.been.calledOnce;

            done();
        });


        it('should remove unselected intelligence (with existing dashboard intelligence for role)', function(done) {
            var clock = sandbox.useFakeTimers();
            var bcData = {
                property: {
                    'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6',
                    'version':'def'
                },
                intelligence: [{
                    id:'123',
                    property: {
                        present_eng_report:true,
                        role:'test',
                        name:'newOne'
                    }
                }]
            };

            mainVM.currentParentBCName = 'Merchandising';
            mainVM.showDashboard(true);
            mainVM.selectedDashboardIntelligence([]);
            mainVM.availableDashboardIntelligence(available);


            sandbox.stub(dexit.app.ice.integration.bcp,'retrieveBCInstance').yields(null,bcData);
            sandbox.stub(dexit.app.ice.integration.bcp,'updateBCInstance').yields();
            sandbox.stub(mainVM,'loadDashboardReports');


            //test
            mainVM.saveDashboardIntelligence('test');
            clock.tick(10);

            dexit.app.ice.integration.bcp.retrieveBCInstance.should.have.been.calledOnce;
            dexit.app.ice.integration.bcp.retrieveBCInstance.should.have.been.calledWith({
                id: bcId,
                type: 'Merchandising',
                queryParams:{ },
            });
            dexit.app.ice.integration.bcp.updateBCInstance.should.have.been.calledOnce;

            dexit.app.ice.integration.bcp.updateBCInstance.should.have.been.calledWith({
                'type':'Merchandising',
                'id':bcId,
                'version':'def',
                'changes':[
                    {op:'remove', path:'/intelligence/', value:
                            [{role:'test',present_eng_report:true,name:'newOne',id:'123'}]}
                ]});
            mainVM.loadDashboardReports.should.have.been.calledOnce;

            done();
        });


        it('should have no changes with no selected intelligence and no existing existing dashboard intelligence matching for role)', function(done) {
            var clock = sandbox.useFakeTimers();
            var bcData = {
                property: {
                    'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6',
                    'version':'def'
                },
                intelligence: [{
                    id:'123',
                    property: {
                        present_eng_report:true,
                        role:'notMyRole',
                        name:'newOne'
                    }
                }]
            };

            mainVM.currentParentBCName = 'Merchandising';
            mainVM.showDashboard(true);
            mainVM.selectedDashboardIntelligence([]);
            mainVM.availableDashboardIntelligence(available);


            sandbox.stub(dexit.app.ice.integration.bcp,'retrieveBCInstance').yields(null,bcData);
            sandbox.stub(dexit.app.ice.integration.bcp,'updateBCInstance').yields();
            sandbox.stub(mainVM,'loadDashboardReports');


            //test
            mainVM.saveDashboardIntelligence('test');
            clock.tick(10);

            dexit.app.ice.integration.bcp.retrieveBCInstance.should.have.been.calledOnce;
            dexit.app.ice.integration.bcp.retrieveBCInstance.should.have.been.calledWith({
                id: bcId,
                type: 'Merchandising',
                queryParams:{ },
            });
            dexit.app.ice.integration.bcp.updateBCInstance.should.not.have.been.calledOnce;
            mainVM.loadDashboardReports.should.have.been.calledOnce;

            done();
        });


    });



    // -------  created by KB/FA OCT 19
    // -------   unit test for setwidgetreport


    describe('setWidgetReport', function() {
        var theCourse, theArgs, mainVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theArgs= {ice4mBCs:'[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]', repo: 'dev', userId: '122', user: JSON.stringify({id:'1', tenant:'testing.dexit.co'}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', epTemplate: JSON.stringify(dexit.testEP)};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.currBCRoleMapping({'name': 'Merchandising', 'id':'d7b05541-f64d-46a0-a428-9da37d0fc9c6', 'bctype':[{'MerchandisingCampaign': {'bctype': ['EngagementPlan']}}]});
            theCourse = new dexit.test.Course();
            theCourse = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mainVM);
            mainVM.selectedCourse({courseVM:theCourse});
        });
        afterEach(function () {
            sandbox.restore();
        });

        // 1. Functional test
        it('valid behaviour for setwidgetreport', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;
            bcInsVM.businessConceptInstance.intelligence=[{id:'test1', kind:'intelligence#engagementmetric', property:{present_bcwidget: true, role:'salesManager'}},{id:'test2',kind:'intelligence#engagementmetric', property:{present_bcwidget: true, role:'salesManager'}}];
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData').yields();
            mainVM.setWidgetReport(bcInsVM);

            stub2.should.have.been.calledOnce;
            stub3.should.have.been.calledOnce;
            done();
        });

        // 2.Functional test
        it('invalid behaviour for setwidgetreport bcVM input =null', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData');
            mainVM.setWidgetReport(null);

            stub2.should.not.have.been.calledOnce;
            stub3.should.not.have.been.calledOnce;

            done();
        });

        // 3.Functional test


        it('invalid behaviour for setwidgetreport bcVM input =\'TEST\'', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;
            bcInsVM.businessConceptInstance.property.bcRelationships = [{refData:{definition:[]} , type:'association', ref:'reports', role:'salesManager', bcType:'merchandisingCampain'}];
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData');
            mainVM.setWidgetReport('TEST');

            stub2.should.not.have.been.calledOnce;
            stub3.should.not.have.been.calledOnce;

            done();
        });

        // 4.Functional test


        it('invalid behaviour for setwidgetreport bcVM input ={}', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;
            bcInsVM.businessConceptInstance.property.bcRelationships = [{refData:{definition:[]} , type:'association', ref:'reports', role:'salesManager', bcType:'merchandisingCampain'}];
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData');
            mainVM.setWidgetReport({});

            stub2.should.not.have.been.calledOnce;
            stub3.should.not.have.been.calledOnce;

            done();
        });

        // 5.Functional test


        it('invalid behaviour for setwidgetreport bcVM input ={businessConceptInstance:123}', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;
            bcInsVM.businessConceptInstance.property.bcRelationships = [{refData:{definition:[]} , type:'association', ref:'reports', role:'salesManager', bcType:'merchandisingCampain'}];
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData');
            mainVM.setWidgetReport({businessConceptInstance:123});
            stub2.should.not.have.been.calledOnce;
            stub3.should.not.have.been.calledOnce;

            done();
        });

        // 6.Functional test

        it('invalid: missing role for intel', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;
            bcInsVM.businessConceptInstance.intelligence=[{id:'test1', kind:'intelligence#engagementmetric', property:{}},{id:'test2',kind:'intelligence#engagementmetric', property:{}}];
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData');
            mainVM.setWidgetReport(bcInsVM);

            stub2.should.not.have.been.called;
            stub3.should.not.have.been.called;
            done();
        });


        // 1.Structural test

        it('invalid: missing property.present_bcwidget', function(done) {
            mainVM.currentRole('salesManager');
            mainVM.currBCDef({bctype:'merchandisingCampain'});
            var bcInsVM = mainVM.selectedCourse().courseVM;

            bcInsVM.businessConceptInstance.intelligence=[{id:'test1', kind:'intelligence#engagementmetric', property:{role:'salesManager'}},{id:'test2',kind:'intelligence#engagementmetric', property:{role:'salesManager'}}];
            var stub2 = sandbox.stub(bcInsVM, 'showWidgetReport');
            var stub3 = sandbox.stub(bcInsVM, 'setWidgetReportData');
            mainVM.setWidgetReport(bcInsVM);
            stub2.should.not.have.been.called;
            stub3.should.not.have.been.called;
            done();
        });

        // 3.Structural test


    });

//------------------------------ created by KB/FA OCT 19


})();
