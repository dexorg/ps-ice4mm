/**
 * Copyright Digital Engagement Xperience 2016-2017
 * Date: 15/01/15
 * @author Xinyu Yun
 * @description for unit test for bc-instance-vm.js
 */

/*global ko */

(function () {
    'use strict';
    //window.alert = function(){};
    var should = chai.should();
    //var assert = chai.assert;
    var expect = chai.expect;

    describe.skip('bc-instance-vm', function() {
        var mainVM, viewModel, testBCi, theArgs;
        var sandbox;
        var ice4mBCs = [{'name': 'Merchandising', 'bctype':['MerchandisingCampaign']}];

        beforeEach(function () {
            var ice4mBCs =[{'name': 'Merchandising', 'bctype':['MerchandisingCampaign']}];
            sandbox = sinon.sandbox.create();
            testBCi = new dexit.test.Course();
            theArgs = {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                allowAddTouchpoint:'true',
                bucket: 'newOne',
                currentRole: 'salesManager',
                userRoles:'productManager,marketingDirector,marketingManager,executive,subscriber,wholesaler,retailer,salesManager',
                tpChannelTypes: {
                    'twitter': {
                        'name': 'twitter',
                        'channelTypeId': '59055',
                        'icon': 'fa fa-twitter-square',
                        'color': '#4099FF',
                        'helpUrl': 'https://grouptweet.com/blog/how-to-create-a-group-twitter-account-using-grouptweet',
                        'urlRegex': '(?:https?:\\/\\/)?(?:www\\.)?twitter\\.com\\/(?:#!\\/)?@?([^\\/\\?\\s]*)(\\/lists\\/)(\\d{1,19})$'
                    },
                    'facebook': {
                        'name': 'facebook',
                        'channelTypeId': '59054',
                        'icon': 'fa fa-facebook-square',
                        'color': '#3b5998',
                        'helpUrl': 'https://www.facebook.com/help/167970719931213?helpref=about_content',
                        'urlRegex': '(?:(?:http|https):\\/\\/)?(?:www.)?facebook.com\\/(?:(?:\\w)*#!\\/)?(?:pages\\/)?(?:[?\\w\\-]*\\/)?(?:profile.php\\?id=(?=\\d.*))?([\\w\\-]*)?'
                    }
                },
                associatedBCDefinitions:{reports:{
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
                }}
            };

            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,ice4mBCs);

            mainVM = new dexit.app.ice.edu.Main(theArgs);
            expect(mainVM.currentRole()).to.be.eql('salesManager');
            //mainVM.init();
            mainVM.thereAreWidgets = ko.observable('loading content, please wait...');
            mainVM.widgetClassName = ko.observable('fa fa-spinner fa-pulse');
            mainVM.currBCDef = ko.observable({bctype: 'testBCType'});
            viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);


        });
        afterEach(function () {
            sandbox.restore();
        });

        describe('init', function () {
            //test init()
            it('should load successfully for salesManager role', function (done) {
                testBCi = new dexit.test.Course();

                sandbox.stub(mainVM, 'currentRole').returns('salesManager');
                var viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                mainVM.currentRole().indexOf('admin').should.be.eql(-1);
                mainVM.currentRole().should.contain('salesManager');
                should.exist(testBCi.container.property.description);
                should.exist(testBCi.container.property.code);
                viewModel.assetsLoaded = false;
                var stub = sandbox.stub(mainVM, 'loadMMForBC');
                stub.callsArgWith(1, {});
                var spy = sandbox.spy(viewModel, 'hideLoader');
                //fake lectures loaded call
                viewModel.init({currentPortal: 'manager'}, function (err) {
                    should.not.exist(err);
                    viewModel.should.have.property('assetsLoaded', true);
                    stub.should.have.been.calledOnce;
                    done();
                });

            });

            //test init()
            it.skip('should log error for manager role if loadMMForBC fails and lectures not loaded (lecturesLoaded)', function (done) {
                testBCi = new dexit.test.Course();

                theArgs = {
                    user: JSON.stringify({
                        id: '123',
                        tenant: 'dexit.co',
                        name: 'test@dexit.co',
                        attributes: {firstName: 'test', lastName: 'user'}
                    }),
                    bucket: 'newOne',
                    currentRole: 'salesManager',
                    userRoles: 'salesManager',
                    epTemplate: JSON.stringify(dexit.testEP)
                };
                mainVM = new dexit.app.ice.edu.Main(theArgs);
                mainVM.currBCDef = ko.observable({bctype: 'testBCType'});
                viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                mainVM.currentRole().should.contain('salesManager');
                mainVM.currPortal().should.be.eql('manager');
                should.exist(testBCi.container.property.description);
                should.exist(testBCi.container.property.code);
                viewModel.assetsLoaded = false;

                var stub = sandbox.stub(mainVM, 'loadMMForBC');
                stub.callsArgWith(1, {});
                var stub2 = sandbox.stub(viewModel, 'retrieveBCInstanceInfo').yields(new Error('error'));
                var spy = sandbox.spy(viewModel, 'hideLoader');
                var spy2 = sandbox.spy(console, 'error');
                //fake lectures loaded call
                viewModel.init({currentPortal: 'manager'}, function (err) {
                    viewModel.should.have.property('assetsLoaded', true);
                    stub.should.have.been.calledOnce;
                    spy.should.not.have.been.called;
                    spy2.should.have.been.called; //will be called 3 or two times depending on parallel operation
                    done();
                });

            });

            //test init()
            it('should load director role and not try to load touchpoints if none', function (done) {

                testBCi = new dexit.test.Course();
                theArgs = {
                    user: JSON.stringify({
                        id: '123',
                        tenant: 'dexit.co',
                        name: 'test@dexit.co',
                        attributes: {firstName: 'test', lastName: 'user'}
                    }),
                    bucket: 'newOne',
                    currentRole: 'productManager',
                    userRoles: 'productManager',
                    epTemplate: JSON.stringify(dexit.testEP)
                };
                mainVM = new dexit.app.ice.edu.Main(theArgs);
                viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                mainVM.currentRole().indexOf('admin').should.be.eql(-1);
                mainVM.currentRole().should.contain('productManager');
                should.exist(testBCi.container.property.description);
                should.exist(testBCi.container.property.code);
                viewModel.assetsLoaded = false;

                var stub = sandbox.stub(viewModel, 'populateTouchpointsOfBCi').yields({});
                //fake lectures loaded call
                viewModel.init({currentPortal: 'director'}, function (err) {
                    stub.should.not.have.been.calledOnce;
                    done();
                });

            });

        });
        describe('retrieveBCInstanceInfo', function () {
            it('retrieve the BC instance info from bcRelationships', function(done) {
                testBCi = new dexit.test.Course();
                mainVM.currBCDef({bctype:'merchidisingCampaign'});
                mainVM.currentRole('salesManager');
                var BCiViewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                testBCi.container.bcRelationships = [{ref:'reports', refData:{role:'salesManager', name:'test', bcType:'merchidisingCampaign'}, label:'manage'}];
                testBCi.container.property.aud_seg_role = 'subscriber';

                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.courseManagement, 'listLectures')
                    .yields(null, {touchpoints:[{tpId:'testID',tpType:'twitter', tpURL:'www.twitter.com/list/123',channelType:'twitter'},{tpId:'testID',tpType:'UCC', tpURL:'',channelType:'ucc'}],
                        lectures:[{property:{type: 'merchidisingCampaign'}}]

                    });
                BCiViewModel.retrieveBCInstanceInfo(testBCi.container, function (err) {
                    // BCiViewModel.associatedReports().length.should.be.eql(1);
                    // BCiViewModel.associatedSegments().length.should.be.eql(1);
                    stub1.should.have.been.calledOnce;
                    done();
                });

            });
            //FIXME: re-write test
            it.skip('retrieve the sub BC instance from main BCi bcRelationships', function(done) {
                testBCi = new dexit.test.Course();
                theArgs = {user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}), bucket:'newOne', currentRole: 'salesManager', userRoles: 'salesManager', thirdPartyUserId: 'thirdPartyUserId'};
                mainVM.currBCDef({bctype:'merchidisingCampaign'});
                var BCiViewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                testBCi.container.bcRelationships = [{ref:'reports', refData:{role:'salesManager', name:'test', bcType:'merchidisingCampaign'}, label:'manage'}];
                testBCi.container.property.aud_seg_role = 'subscriber';

                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.courseManagement, 'listLectures')
                    .yields(null, {touchpoints:[{tpId:'testID',tpType:'twitter', tpURL:'www.twitter.com/list/123',channelType:'twitter'},{tpId:'testID',tpType:'UCC', tpURL:'',channelType:'ucc'}],
                        lectures:[{id: 'testId', property:{type: 'merchidisingCampaign'}}]});
                var stub2 = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, 'retrieveLectureDetails')
                    .yields(null, {ePatterns:[{isActive:true}], isPatternActive: true, patternStart: 'start', patternEnd: 'end'});
                var stub3 = sandbox.stub(BCiViewModel, 'retrieveEPWidgetReports').yields(null,[]);
                // var stub4 = sandbox.stub(mainVM, 'getReportRelationship').returns({refData:{definition:{}}});

                BCiViewModel.retrieveBCInstanceInfo(testBCi.container, function (err) {
                    stub1.should.have.been.calledOnce;
                    stub2.should.have.been.calledOnce;
                    stub3.should.have.been.calledOnce;
                    // stub4.should.have.been.calledOnce;
                    done();
                });

            });
        });

        describe('loadMMForBC', function(){

            it('success', function(done){
                testBCi = new dexit.test.Course();

                viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, 'findFileDetailsByTag');
                viewModel.imageMM([]);
                viewModel.videoMM([]);
                viewModel.docMM([]);
                stub1.callsArgWith(1,false, [{key:'aKey', url:'firstFile', tags: ['image', 'video', 'audio', 'document', 'lecture', 'tutorial', 'quiz']}]);
                viewModel.loadMMForBC(function(err){
                    should.not.exist(err);
                    expect(stub1.called).to.be.true;
                    expect(viewModel.imageMM().length).equal(1);
                    expect(viewModel.videoMM().length).equal(1);
                    expect(viewModel.docMM().length).equal(1);
                    done();
                });
            });
            it('failed - error retrieving tags', function(done){
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, 'findFileDetailsByTag');
                viewModel.imageMM([]);
                viewModel.videoMM([]);
                viewModel.docMM([]);
                stub1.callsArgWith(1,'error', null);
                viewModel.loadMMForBC(function(err){
                    should.exist(err);
                    expect(stub1.called).to.be.true;
                    expect(viewModel.imageMM().length).equal(0);
                    done();
                });
            });
            it('retrieveCourseMM - no file tags', function(done){
                var stub1 = sinon.stub(dexit.app.ice.integration.filemanagement, 'findFileDetailsByTag');
                viewModel.imageMM([]);
                viewModel.videoMM([]);
                viewModel.docMM([]);
                stub1.callsArgWith(1,false,false);
                viewModel.loadMMForBC(function(err){
                    should.not.exist(err);
                    expect(stub1.called).to.be.true;
                    done();
                    dexit.app.ice.integration.filemanagement.findFileDetailsByTag.restore();
                });
            });

        });

        describe('populateTouchpointsOfBCi', function(done){
            it('success retrieving single touchpoint', function(done) {
                testBCi = new dexit.test.Course();

                theArgs = {user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}), bucket:'newOne', currentRole: 'admin', userRoles: 'admin', epTemplate: JSON.stringify(dexit.testEP),thirdPartyUserId: 'thirdPartyUserId'};
                mainVM = new dexit.app.ice.edu.Main(theArgs);
                viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                viewModel.groupURL = ko.observableArray([]);
                viewModel.businessConceptInstance.property = {};
                viewModel.businessConceptInstance.property.touchpoints = '123';
                var retrieveChannelInstanceFromTP = sandbox.stub(dexit.app.ice.integration.tpm,'retrieveChannelInstanceFromTP');
                var channelCategorization = sandbox.stub(dexit.app.ice.integration.contentManager,'retrieveContainer');
                retrieveChannelInstanceFromTP.callsArgWith(1, null, ['1']);
                channelCategorization.callsArgWith(1, null, 'twitter');
                viewModel.populateTouchpointsOfBCi(viewModel.businessConceptInstance, function(){
                    viewModel.tpm().length.should.equal(1);
                    done();
                });

            });
            it('success retrieving multiple touchpoints', function(done) {
                testBCi = new dexit.test.Course();
                theArgs = {user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}), bucket:'newOne', currentRole: 'admin', userRoles: 'admin', epTemplate: JSON.stringify(dexit.testEP),thirdPartyUserId: 'thirdPartyUserId'};
                mainVM = new dexit.app.ice.edu.Main(theArgs);
                viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                viewModel.groupURL = ko.observableArray([]);
                viewModel.businessConceptInstance.property = {};
                viewModel.businessConceptInstance.property.touchpoints = ['123','234'];
                var retrieveChannelInstanceFromTP = sandbox.stub(dexit.app.ice.integration.tpm,'retrieveChannelInstanceFromTP');
                var channelCategorization = sandbox.stub(dexit.app.ice.integration.contentManager,'retrieveContainer');
                retrieveChannelInstanceFromTP.callsArgWith(1, null, ['1']);
                channelCategorization.callsArgWith(1, null, 'twitter');
                viewModel.populateTouchpointsOfBCi(viewModel.businessConceptInstance, function () {
                });
                viewModel.tpm().length.should.equal(2);
                done();
            });
        });

        describe('courseVM: edit properties', function(){


            it('saveOfficeHours', function(){
                $('body').append('<div><textarea class=\'office-hours-text\'</div>'+
                    '<div><textarea class=\'course-description-text\'</div>');
                $('.office-hours-text').text('9am-5pm');
                mainVM.selectedCourse({courseVM:viewModel});
                $('.office-hours-text').on('click', function(data) { viewModel.saveOfficeHours(mainVM); });
                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.courseManagement,'updateProperty');
                stub1.callsArgWith(2,true,null);
                $('.office-hours-text').trigger('click');
                expect(viewModel.editOfficeHours()).to.be.false;
                $('.office-hours-text').text('10am-5pm');
                stub1.callsArgWith(2,null,'');
                $('.office-hours-text').trigger('click');
                expect(viewModel.officeHoursValue()).to.be.eql('10am-5pm');
                viewModel.editOfficeHours(true);
                viewModel.cancelChangingOfficeHours();
                expect(viewModel.editOfficeHours()).to.be.false;
                viewModel.setCDEditable();
                expect(viewModel.editCourseDescription()).to.be.true;
                viewModel.cancelCDEditable();
                expect(viewModel.editCourseDescription()).to.be.false;
                $('.course-description-text').text('test description');
                $('.course-description-text').on('click', function(data) { viewModel.saveCourseDescription(mainVM); });
                stub1.callsArgWith(3,true,null);
                $('.course-description-text').trigger('click');
                expect(viewModel.editCourseDescription()).to.be.false;
            });
            it('saveCoursedescription', function(){
                $('body').append('<div><textarea class=\'course-description-text\'</div>');
                mainVM.selectedCourse({courseVM:viewModel});
                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.courseManagement,'updateProperty');
                $('.course-description-text').text('test description');
                $('.course-description-text').on('click', function(data) { viewModel.saveCourseDescription(mainVM); });
                stub1.callsArgWith(2,true,null);
                $('.course-description-text').trigger('click');
                expect(viewModel.editCourseDescription()).to.be.false;
                stub1.callsArgWith(2,null,'');
                $('.course-description-text').trigger('click');
                expect(viewModel.courseDescriptionValue()).to.be.eql('test description');
            });
        });

        describe('courseVM: Touchpoint Management', function(){
            describe('createTouchpoint', function() {
                it('should be successful for a new touchpoint (with current special case for facebook group)', function(done){

                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('facebook');
                    mainVM.touchpointTypes({'facebook': {'channelTypeId': '123'}});
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});
                    viewModel.pendingChannelUrl('https://www.facebook.com/groups/203146426721234/');
                    sandbox.stub(dexit.app.ice.edu.integration.fbgroup,'createGroup').yields(null,{'result':'tpId'});
                    sandbox.stub(viewModel, 'addTouchpointToBC');
                    viewModel.selectedTPType = mainVM.selectedTPType();
                    viewModel.createTouchpoint();
                    dexit.app.ice.edu.integration.fbgroup.createGroup.should.have.been.calledOnce;
                    dexit.app.ice.edu.integration.fbgroup.createGroup.should.have.been.calledWith(
                        {
                            groupURL:'https://www.facebook.com/groups/203146426721234/',
                            name:sinon.match.string,
                            channelType:'facebook',
                            channelTypeId:'123'
                        });
                    viewModel.addTouchpointToBC.should.have.been.calledOnce;
                    viewModel.addTouchpointToBC.should.have.been.calledWith({bcType:'test',touchpointId:'tpId'});
                    done();
                });

                it('should be failed for a new touchpoint (with current special case for facebook group) since error happens when create touchpoint', function(done){

                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    var stub1 = sandbox.stub(viewModel, 'addTouchpointToBC');
                    mainVM.selectedTPType('facebook');
                    mainVM.touchpointTypes({'facebook': {'channelTypeId': '123'}});
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});
                    viewModel.pendingChannelUrl('https://www.facebook.com/groups/203146426721234/');
                    sandbox.stub(dexit.app.ice.edu.integration.fbgroup,'createGroup').yields(true, null);
                    viewModel.selectedTPType = mainVM.selectedTPType();
                    viewModel.createTouchpoint();
                    dexit.app.ice.edu.integration.fbgroup.createGroup.should.have.been.calledWith(
                        {
                            groupURL:'https://www.facebook.com/groups/203146426721234/',
                            name:sinon.match.string,
                            channelType:'facebook',
                            channelTypeId:'123'
                        });
                    expect(stub1.called).to.be.false;
                    done();
                });


                it('should be successful for a new touchpoint (with current special case for twitter)', function(done){

                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    mainVM.tpList = [{tpId: 'tpId', tpName: 'name'}];
                    mainVM.selectedTP('name');
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});
                    sandbox.stub(viewModel, 'addTouchpointToBC');
                    viewModel.selectedTPType = mainVM.selectedTPType();
                    viewModel.selectedTP = mainVM.selectedTP();
                    viewModel.createTouchpoint();
                    viewModel.addTouchpointToBC.should.have.been.calledOnce;
                    viewModel.addTouchpointToBC.should.have.been.calledWith({bcType:'test',touchpointId:'tpId'});
                    done();
                });

                it('should be successful when assign touchpoint for UCC', function(done) {
                    var stub1 = sandbox.stub(viewModel, 'addTouchpointToBC');
                    var stub2 = sandbox.stub(viewModel, 'clearPendingTouchpoint');
                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('ucc');
                    mainVM.touchpointTypes({'ucc': {'channelTypeId': '2345'}});
                    mainVM.tpList = [{'tpName' : 'testTPName', 'tpId' : '123456'}];
                    mainVM.selectedTP('testTPName');
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});
                    stub1.callsArgWith(1, null, {});
                    viewModel.selectedTPType = mainVM.selectedTPType();
                    viewModel.selectedTP = mainVM.selectedTP();
                    viewModel.createTouchpoint();
                    expect(stub2.called).to.be.true;
                    done();
                });

                it('should fail when if add touchpoint to BC failed', function(done) {
                    var stub1 = sandbox.stub(viewModel, 'addTouchpointToBC');
                    var stub2 = sandbox.stub(viewModel, 'clearPendingTouchpoint');
                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('ucc');
                    mainVM.touchpointTypes({'ucc': {'channelTypeId': '2345'}});
                    mainVM.tpList = [{'tpName' : 'testTPName', 'tpId' : '123456'}];
                    mainVM.selectedTP('testTPName');
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});
                    stub1.callsArgWith(1, true, null);
                    viewModel.selectedTPType = mainVM.selectedTPType();
                    viewModel.selectedTP = mainVM.selectedTP();
                    viewModel.createTouchpoint();
                    expect(stub2.called).to.be.false;
                    done();
                });

                it('should fail if no channel type selected', function(done) {
                    var spy1 = sandbox.spy(viewModel,'_getCurrentBCDefinition');
                    mainVM.selectedTPType(null);
                    mainVM.selectedCourse({courseVM:viewModel});
                    viewModel.selectedTPType = mainVM.selectedTPType();
                    viewModel.createTouchpoint();
                    expect(spy1.called).to.be.false;
                    done();
                });
            });

            describe('Unassign touchpoint from business concept', function () {
                it('should be successful removing existing touchpoint when there are multiple', function () {
                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    mainVM.selectedCourse({courseVM:viewModel});

                    viewModel.businessConceptInstance.property = {
                        touchpoints:['ep:111','ep:222']
                    };

                    sandbox.stub(dexit.app.ice.integration.scm.container,'update').yields();

                    sandbox.stub(viewModel, 'init');

                    viewModel.removeTPAssociation('111', function (err) {
                        should.not.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledOnce;
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledWith(
                            sinon.match.any,
                            testBCi.container.id,
                            sinon.match.object.and(sinon.match.has('touchpoints', sinon.match(function (value){
                                return (value && value.indexOf('test:ep111') === -1);
                            }))));
                        done();
                    });
                });

                it('should be successful removing existing touchpoint when there are multiple', function () {
                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    mainVM.selectedCourse({courseVM:viewModel});

                    viewModel.businessConceptInstance.property = {
                        touchpoints:['ep:111','ep:222']
                    };

                    sandbox.stub(dexit.app.ice.integration.scm.container,'update').yields();

                    sandbox.stub(viewModel, 'init');

                    viewModel.removeTPAssociation('111', function (err) {
                        should.not.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledOnce;
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledWith(
                            sinon.match.any,
                            testBCi.container.id,
                            sinon.match.object.and(sinon.match.has('touchpoints', sinon.match(function (value){
                                return (value && value.indexOf('test:ep111') === -1);
                            }))));
                        done();
                    });
                });


                it('should be successful removing existing touchpoint when there is only one', function () {
                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    mainVM.selectedCourse({courseVM:viewModel});

                    viewModel.businessConceptInstance.property = {
                        touchpoints:'ep:111'
                    };

                    sandbox.stub(dexit.app.ice.integration.scm.container,'update').yields();

                    sandbox.stub(viewModel, 'init');

                    viewModel.removeTPAssociation('111', function (err) {
                        should.not.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledOnce;
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledWith(
                            sinon.match.any,
                            testBCi.container.id,
                            sinon.match.object.and(!sinon.match.has('touchpoints')));
                        done();
                    });
                });

                it('should not try removing existing touchpoints when supplied id does not match when there is only one', function () {
                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    mainVM.selectedCourse({courseVM:viewModel});

                    viewModel.businessConceptInstance.property = {
                        touchpoints:'ep:111'
                    };

                    sandbox.stub(dexit.app.ice.integration.scm.container,'update').yields();

                    sandbox.stub(viewModel, 'init');

                    viewModel.removeTPAssociation('no-match', function (err) {
                        should.not.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledOnce;
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledWith(
                            sinon.match.any,
                            testBCi.container.id,
                            sinon.match.object.and(sinon.match.has('touchpoints', sinon.match(function (value){
                                return (value && value.indexOf('test:ep111') === -1);
                            }))));
                        done();
                    });
                });

            });

            describe('Add touchpoint to business concept', function () {

                it('should return validation error if missing required parameter: touchpointId', function(done) {

                    sandbox.spy(dexit.app.ice.integration.scm.container,'update');

                    viewModel.addTouchpointToBC({}, function (err) {
                        should.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.not.have.been.called;
                        done();
                    });
                });

                it('should be successful adding touchpoint', function(done){

                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});

                    viewModel.pendingChannelUrl('https://twitter.com/iceuniversity/2798533681');


                    sandbox.stub(dexit.app.ice.integration.scm.container,'update').yields();

                    sandbox.stub(viewModel, 'init');

                    viewModel.addTouchpointToBC({bcType:'test',touchpointId:'tpId'}, function (err) {
                        should.not.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledOnce;
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledWith(
                            sinon.match.any,
                            testBCi.container.id,
                            sinon.match.object.and(sinon.match.has('touchpoints', sinon.match(function (value){
                                return (value && value.indexOf('test:tpId') != -1);
                            }))));
                        done();
                    });
                });


                it('should be successful adding touchpoint with no existing touchpoint', function(done){

                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});

                    viewModel.pendingChannelUrl('https://twitter.com/iceuniversity/2798533681');


                    sandbox.stub(dexit.app.ice.integration.scm.container,'update').yields();

                    sandbox.stub(viewModel, 'init');

                    viewModel.businessConceptInstance.property.touchpoints = '';

                    viewModel.addTouchpointToBC({bcType:'test',touchpointId:'tpId'}, function (err) {
                        should.not.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledOnce;
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledWith(
                            sinon.match.any,
                            testBCi.container.id,
                            sinon.match.object.and(sinon.match.has('touchpoints', sinon.match(function (value){
                                return (value && value.indexOf('test:tpId') != -1);
                            }))));
                        done();
                    });
                });

                it('should be successful adding touchpoint with one existing touchpoint', function(done){

                    sandbox.stub(viewModel,'_getCurrentBCDefinition').returns({bctype:'test'});
                    mainVM.selectedTPType('twitter');
                    mainVM.touchpointTypes({'twitter': {'channelTypeId': '1234'}});
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM:viewModel});

                    viewModel.pendingChannelUrl('https://twitter.com/iceuniversity/2798533681');


                    sandbox.stub(dexit.app.ice.integration.scm.container,'update').yields();

                    sandbox.stub(viewModel, 'init');

                    viewModel.businessConceptInstance.property.touchpoints = 'tp:1';

                    viewModel.addTouchpointToBC({bcType:'test',touchpointId:'tpId'}, function (err) {
                        should.not.exist(err);
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledOnce;
                        dexit.app.ice.integration.scm.container.update.should.have.been.calledWith(
                            sinon.match.any,
                            testBCi.container.id,
                            sinon.match.object.and(sinon.match.has('touchpoints', sinon.match(function (value){
                                return (value && value.indexOf('test:tpId') != -1);
                            }))));
                        done();
                    });
                });


            });

            describe('validation of channel url', function() {

                beforeEach(function () {
                    sandbox.stub(viewModel, '_setInvalidTouchpointUI');
                    sandbox.stub(viewModel, '_setValidTouchpointUI');
                    viewModel.pendingChannelUrl(null);
                    viewModel.validTPURL(false);
                });

                it('should validate url with regex and no duplicate', function () {
                    var event = {type: 'keyup'};
                    mainVM.selectedTPType('facebook');
                    mainVM.touchpointTypes({'facebook': {'urlRegex': '.'}});
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM: viewModel});
                    var element = {
                        value: 'https://www.facebook.com/groups/203146426721234/'
                    };
                    viewModel.validateTP(element, event);
                    expect(viewModel.validTPURL()).to.be.ok;
                    expect(viewModel.pendingChannelUrl()).to.equal('https://www.facebook.com/groups/203146426721234/');

                    viewModel._setValidTouchpointUI.should.have.been.calledTwice;
                    viewModel._setValidTouchpointUI.should.have.been.calledWith(element, 'pending');
                    viewModel._setValidTouchpointUI.should.have.been.calledWith(element);
                    viewModel._setInvalidTouchpointUI.should.not.have.been.called;
                });


                it('should not validate with url failing regex', function () {
                    var event = {type: 'keyup'};
                    mainVM.selectedTPType('facebook');
                    mainVM.touchpointTypes({'facebook': {'urlRegex':'(?:(?:http|https):\\/\\/)?(?:www.)?facebook.com\\/(?:(?:\\w)*#!\\/)?(?:pages\\/)?(?:[?\\w\\-]*\\/)?(?:profile.php\\?id=(?=\\d.*))?([\\w\\-]*)?'}});
                    viewModel.tpm([]);
                    mainVM.selectedCourse({courseVM: viewModel});
                    var element = {
                        value: 'https://www.notgood.com/groups/203146426721234/'
                    };
                    viewModel.validateTP(element, event);
                    expect(viewModel.validTPURL()).to.not.be.ok;
                    viewModel._setValidTouchpointUI.should.not.have.been.called;

                    //call for invalid url
                    viewModel._setInvalidTouchpointUI.should.have.been.calledOnce;
                    viewModel._setInvalidTouchpointUI.should.have.been.calledWith(element, 'Must be a valid facebook URL');

                });


                it('should not validate duplicate url', function () {

                    var event = {type: 'keyup'};
                    mainVM.selectedTPType('facebook');
                    mainVM.touchpointTypes({'facebook': {'urlRegex': '.'}});
                    viewModel.tpm([{tpURL: 'https://www.facebook.com/groups/203146426721234/'}]);
                    mainVM.selectedCourse({courseVM: viewModel});

                    mainVM.selectedCourse({courseVM: viewModel});
                    var element = {
                        value: 'https://www.facebook.com/groups/203146426721234/'
                    };

                    viewModel.validateTP(element, event);
                    expect(viewModel.validTPURL()).to.not.be.ok;

                    //first call for valid url
                    viewModel._setValidTouchpointUI.should.have.been.calledOnce;
                    viewModel._setValidTouchpointUI.should.have.been.calledWith(element, 'pending');

                    //second call for duplicate
                    viewModel._setInvalidTouchpointUI.should.have.been.calledOnce;
                    viewModel._setInvalidTouchpointUI.should.have.been.calledWith(element, 'Must be a unique facebook URL');

                });

            });
        });

        describe('updating Course test', function(){
            it('reloadMultimediaForBC - success', function(done){
                var stub1 = sandbox.stub(viewModel,'loadMMForBC');
                viewModel.imageMM([1]);
                viewModel.videoMM([1]);
                viewModel.docMM([1]);
                viewModel.reloadMultimediaForBC();
                stub1.should.have.been.calledOnce;
                expect(viewModel.imageMM().length).equal(0);
                expect(viewModel.videoMM().length).equal(0);
                expect(viewModel.docMM().length).equal(0);
                done();
            });
        });

        describe('Channel categorization test', function(done){
            var viewModel, testBCi;
            beforeEach(function () {
                testBCi = new dexit.test.Course();
                mainVM.thereAreWidgets = ko.observable('loading content, please wait...');
                mainVM.widgetClassName = ko.observable('fa fa-spinner fa-pulse');
                viewModel = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
            });


            it('Facebook Channel categorization test when user is the member of the facebook group', function(done){
                var elementChannel = {url: 'groups/facebook/test', type: 'facebook'};
                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup, 'retrieveMembers');
                stub1.callsArgWith(1, null, {member: ''});
                mainVM.currentRole('student');
                viewModel._channelCategorization(elementChannel, function(err, socialType){
                    should.exist(elementChannel.url);
                    socialType.should.equal('Facebook');
                }
                );
                done();
            });

            it('Facebook Channel categorization test when user is not the member of the facebook group', function(done){
                var elementChannel = {url: 'groups/facebook/test', type: 'facebook'};
                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup, 'retrieveMembers');
                stub1.callsArgWith(1, null, null);
                mainVM.currentRole('student');
                viewModel._channelCategorization(elementChannel, function(err, socialType){
                    should.exist(elementChannel.url);
                    socialType.should.equal('Facebook');
                }
                );
                done();
            });
            it('Facebook Channel categorization test when user is not student', function(done){
                var elementChannel = {url: 'groups/facebook/test', type: 'facebook'};
                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup, 'retrieveMembers');
                stub1.callsArgWith(1, null, null);
                mainVM.currentRole('professor');
                viewModel._channelCategorization(elementChannel, function(err, socialType){
                    should.exist(elementChannel.url);
                    socialType.should.equal('Facebook');
                }
                );
                done();
            });

            it('Twitter Channel categorization test', function(done){
                var elementChannel = {url: 'groups/twitter/test', type: 'twitter'};
                viewModel._channelCategorization(elementChannel, function(err, socialType){
                    should.exist(elementChannel.url);
                    socialType.should.equal('Twitter');
                }
                );

                done();
            });

            it('UCC Channel categorization test', function(done){
                var elementChannel = {url: 'groups/ucc/test', type: 'ucc'};
                mainVM.currentRole('student');
                viewModel._channelCategorization(elementChannel, function(err, socialType){
                    should.exist(elementChannel.url);
                    socialType.should.equal('UCC');
                    done();
                });

            });

            it('Tumblr Channel categorization test', function(done){
                var elementChannel = {url: 'groups/tumblr/test', type: 'tumblr'};
                viewModel._channelCategorization(elementChannel, function(err, socialType){
                    should.exist(elementChannel.url);
                    socialType.should.equal('Tumblr');
                }
                );

                done();
            });
        });

        describe('Widget Reports', function () {
            var bcInstanceVM, testBCi, theArgs;

            beforeEach(function () {
                testBCi = new dexit.test.Course();
                mainVM.currBCDef({'bctype':'Campaign'});
                mainVM.thereAreWidgets = ko.observable('loading content, please wait...');
                mainVM.widgetClassName = ko.observable('fa fa-spinner fa-pulse');
                bcInstanceVM = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
            });


            describe('build widget reports (without data)', function () {

                it('should be successful', function () {
                    var intel = [
                        {id:'a', property:{'presentation_name':'shares', 'presentation_icon':'fa fa-share-alt'}},
                        {id:'b', property:{'presentation_name':'likes', 'presentation_icon':'fa fa-thumbs-up'}}
                    ];
                    var bcInstanceId = '112345';

                    var result = bcInstanceVM.buildWidgetReport(bcInstanceId,intel);
                    should.exist(result);
                    result.should.be.an('Array').with.lengthOf(2);
                    result.should.deep.property('[0].icon','fa fa-share-alt');
                    result.should.deep.property('[0].name','shares');
                    //observable
                    result.should.deep.property('[0].value').that.is.a('function');

                    result.should.deep.property('[1].icon','fa fa-thumbs-up');
                    result.should.deep.property('[1].name','likes');
                    //observable
                    result.should.deep.property('[1].value').that.is.a('function');
                });
            });

            describe('showWidgetReport', function () {
                it('should be successful', function () {
                    var widgetReportDef = [
                        {'metricId': 112, 'name': 'shares', 'icon': 'fa fa-share-alt'}
                    ];

                    sandbox.stub(bcInstanceVM,'buildWidgetReport').returns([{'name':'shares', 'icon':'fa fa-share-alt', value:ko.observable(' ')}]);
                    sandbox.spy(bcInstanceVM,'widgetReport');
                    var bcInstanceId = '112345';
                    bcInstanceVM.showWidgetReport(bcInstanceId,widgetReportDef);
                    bcInstanceVM.widgetReport.should.have.been.calledOnce;
                    bcInstanceVM.buildWidgetReport.should.have.been.calledOnce;
                });
            });

            //TODO: replace test with retrieveEPWidgetReports
            // describe('retrieveWidgetReport', function () {
            //     it('should be successful', function (done) {
            //         var widgetReportDef = [
            //             {id:'a', property:{'presentation_name':'shares', 'presentation_icon':'fa fa-share-alt', definition:{'metricId':112}}}
            //         ];
            //         var data = [{'metric_value':'77'}];
            //         sandbox.stub(dexit.app.ice.integration.bcp,'retrieveBCInstanceMetricData').yields(null,data);
            //         sandbox.stub(bcInstanceVM,'buildWidgetReport').returns([{name:'shares',icon:'fa fa-share-alt',value:ko.observable('0')}]);
            //
            //         var bcInstanceId = '112345';
            //         bcInstanceVM.retrieveWidgetReport(bcInstanceId,widgetReportDef,function (res) {
            //             should.exist(res);
            //             dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData.should.have.been.calledWith({'id':'112345','type':'Campaign','metricId':112});
            //             done();
            //         });
            //
            //     });
            // });


            describe('set data for initialized widget reports', function () {
                it('should be fail if prerequisite has not been met (buildWidgetReport has not been run)', function (done) {
                    var widgetReportDef = [
                        {'metricId': 112, 'name': 'shares', 'icon': 'fa fa-share-alt'},
                        {'metricId': 102, 'name': 'likes', 'icon': 'fa fa-thumbs-up'}
                    ];
                    var bcInstanceId = '112345';
                    bcInstanceVM.widgetReport([]);

                    bcInstanceVM.setWidgetReportData(bcInstanceId, widgetReportDef, function (result) {
                        should.not.exist(result);
                        done();
                    });
                });
                it('should be successful in setting value field', function (done) {

                    var widgetReportDef = [
                        {id:'a', property:{'presentation_name':'shares', 'presentation_icon':'fa fa-share-alt', definition:{'metricId':112}}},
                        {id:'b', property:{'presentation_name':'likes', 'presentation_icon':'fa fa-thumbs-up', definition:{'metricId':102}}}
                    ];
                    //set widget report observable before-hand
                    bcInstanceVM.widgetReport(
                        [
                            {'name':'shares', 'icon':'fa fa-share-alt', value:ko.observable(' ')},
                            {'name':'likes', 'icon':'fa fa-thumbs-up', value:ko.observable(' ')}
                        ]);
                    var data = [{'metric_value':'77'}];
                    sandbox.stub(dexit.app.ice.integration.bcp,'retrieveBCInstanceMetricData').yields(null,data);

                    var bcInstanceId = '112345';
                    bcInstanceVM.setWidgetReportData(bcInstanceId,widgetReportDef, function (result) {
                        should.exist(result);
                        //verify observable has value set
                        var outcome = bcInstanceVM.widgetReport();
                        outcome.should.be.an('array').with.lengthOf(2);
                        outcome.should.be.an('Array').with.lengthOf(2);
                        outcome.should.deep.property('[0].icon','fa fa-share-alt');
                        outcome.should.deep.property('[0].name','shares');
                        //observable
                        outcome.should.deep.property('[0].value').that.is.a('function');
                        outcome[0].value().should.equal('77');

                        outcome.should.deep.property('[1].icon','fa fa-thumbs-up');
                        outcome.should.deep.property('[1].name','likes');
                        //observable
                        outcome.should.deep.property('[1].value').that.is.a('function');
                        outcome[1].value().should.equal('77');

                        dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData.should.have.been.calledWith({'id':'112345','type':'Campaign','metricId':112});
                        dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData.should.have.been.calledWith({'id':'112345','type':'Campaign','metricId':102});

                        done();
                    });
                });

            });

        });

        describe('Touchpoint selection for EPA', function () {
            var bcInstanceVM, testBCi;

            beforeEach(function () {
                testBCi = new dexit.test.Course();
                mainVM.currBCDef({'bctype':'Campaign'});
                mainVM.thereAreWidgets = ko.observable('loading content, please wait...');
                mainVM.widgetClassName = ko.observable('fa fa-spinner fa-pulse');
                bcInstanceVM = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
            });

            describe('addTPEptChoice', function () {
                it('should successfully add selection when none was made', function(){
                    var dummyElement = {
                        classList: {
                            add: function () {

                            }
                        }
                    };
                    //var dpa_VM = {};
                    var tpData = {'tpId':'89659faa-0b59-45ad-a312-d447d2644f8b','tpType':'Facebook','tpURL':'https://www.facebook.com/groups/1641965212719903/','channelType':'facebook'};
                    sandbox.spy(dummyElement.classList,'add');
                    bcInstanceVM.addTPEptChoice(dummyElement, tpData);
                    dummyElement.classList.add.should.have.been.calledWith('selected-product');


                });
            });
        });

        describe('Edit intelligence show for widget', function () {
            describe('Clicking edit button on widget should', function(){
                var bcInstanceVM;
                before(function () {
                    testBCi = new dexit.test.Course();
                    bcInstanceVM = new dexit.app.ice.edu.BCInstanceVM(testBCi.container, mainVM);
                });

                it('should toggle edit from false to true', function () {
                    bcInstanceVM.widgetIntelligenceEditingMode(false);
                    bcInstanceVM.widgetIntelligenceEditingMode().should.be.false;
                    bcInstanceVM.toggleWidgetIntelligenceEditMode();
                    bcInstanceVM.widgetIntelligenceEditingMode().should.be.true;
                });

                it('should toggle edit from true to fasle', function () {
                    bcInstanceVM.widgetIntelligenceEditingMode(true);
                    bcInstanceVM.widgetIntelligenceEditingMode().should.be.true;
                    bcInstanceVM.toggleWidgetIntelligenceEditMode();
                    bcInstanceVM.widgetIntelligenceEditingMode().should.be.false;

                });
            });
        });

    });
})();
