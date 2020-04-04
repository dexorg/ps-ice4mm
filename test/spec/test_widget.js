/**
 * Copyright Digital Engagement Xperiance
 * Date: 26/11/14
 * @author Ali Hussain
 * @description
 */

/*global _, ko */

(function () {
    'use strict';

    //window.alert = function(){};
    var should = chai.should();
    //var assert = chai.assert;
    var expect = chai.expect;

    var ice4mBCs = '[{"name": "Merchandising", "bctype":["MerchandisingCampaign"]}]';
    describe('delete widget', function() {
        var vmForDeleteWidget, businessConceptInstance, theArgs, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            this.clock = sinon.useFakeTimers(); // sinon fake timer
            businessConceptInstance = new dexit.test.Course();
            theArgs= {repo: 'dev', userId: '122', bucket:'newOne', currentRole: 'test', userRoles: 'professor', ice4mBCs:ice4mBCs};
            vmForDeleteWidget = new dexit.app.ice.edu.Main(theArgs);
            sandbox.stub(vmForDeleteWidget,'showBCInstances');
            //ignore loading of reports
            sandbox.stub(vmForDeleteWidget,'loadDashboardReports');
            vmForDeleteWidget.init();
            businessConceptInstance.mainVM = vmForDeleteWidget;
        });
        afterEach( function() {
            this.clock.restore();
            sandbox.restore();
        });

        it('un-assign from container before delete', function(done) {
            var stub1 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'deleteSCPatterns');
            var stub2 = sandbox.stub(dexit.app.ice.integration.scm, 'unassignFromContainer');
            var stub3 = sandbox.stub(dexit.app.ice.integration.scm, 'deleteSC');
            var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'deleteBCInstance');
            stub1.callsArgWith(2, null, true);
            stub2.callsArgWith(3, true, null);
            stub3.callsArgWith(2, null, true);
            stub4.callsArgWith(1, null, true);

            vmForDeleteWidget.deleteWidget(businessConceptInstance.widgets()[0], businessConceptInstance);
            expect(stub1.calledBefore(stub2)).to.be.true;
            done();
        });

        it('successfully remove widget without related engagement sc', function(done) {
            var widgetId =  'bd35b5fc-5f15-49d9-9b10-0d508c98386f';
            var firstLength = businessConceptInstance.widgets().length;
            var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'deleteSCPatterns');
            var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'unassignFromContainer');
            var stub2 = sandbox.stub(dexit.app.ice.integration.scm, 'deleteSC');
            var stub3 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC').yields(null,{id:widgetId, property: {'class':'foo'}});

            var stub4 = sandbox.stub(dexit.app.ice.integration.bcp,'deleteBCInstance').yields();


            stub0.callsArgWith(2, null, true);
            stub1.callsArgWith(3, true, null);
            stub2.callsArgWith(2, null, true);

            vmForDeleteWidget.deleteWidget(businessConceptInstance.widgets()[0], businessConceptInstance);
            this.clock.tick(2000); // // Tick the clock forward 2000ms
            var secondLength = businessConceptInstance.widgets().length;
            secondLength.should.equal(firstLength-1);
            stub4.should.have.been.calledOnce;
            stub4.should.have.been.calledWith({id:'bd35b5fc-5f15-49d9-9b10-0d508c98386f', type:'foo'});
            stub3.should.have.been.calledOnce;
            stub3.should.have.been.calledWith(sinon.match.any,widgetId);

            done();
        });

        //This test is related to the workaround in ps-ice of engagment pattern execution
        it('remove widget with related engagement sc', function(done) {
            var firstLength = businessConceptInstance.widgets().length;
            var widgetId =  'bd35b5fc-5f15-49d9-9b10-0d508c98386f';
            var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'deleteSCPatterns');
            var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'unassignFromContainer');
            var stub2 = sandbox.stub(dexit.app.ice.integration.scm, 'deleteSC');

            var stub3 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC').yields(null,{id:widgetId, property: {'class':'foo', 'related_engagement_sc':'relatedId'}});
            var stub4 = sandbox.stub(dexit.app.ice.integration.bcp,'deleteBCInstance').yields();

            stub0.callsArgWith(2, null, true);
            stub1.callsArgWith(3, true, null);
            stub2.callsArgWith(2, null, true);
            vmForDeleteWidget.deleteWidget(businessConceptInstance.widgets()[0], businessConceptInstance);
            this.clock.tick(2000); // // Tick the clock forward 2000ms
            var secondLength = businessConceptInstance.widgets().length;
            secondLength.should.equal(firstLength-1);

            stub4.should.have.been.calledOnce;
            stub4.should.have.been.calledWith({id:widgetId, type:'foo'});
            stub3.should.have.been.calledOnce;
            stub3.should.have.been.calledWith(sinon.match.any,widgetId);
            stub2.should.have.been.calledOnce;
            stub2.should.have.been.calledWith(sinon.match.any,'relatedId');

            done();
        });
        it('remove widget with related engagement sc - unassignFromContainer return error', function(done) {
            var firstLength = businessConceptInstance.widgets().length;
            var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'deleteSCPatterns');
            var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'unassignFromContainer');
            stub0.callsArgWith(2, null, true);
            stub1.callsArgWith(3, null, true);
            vmForDeleteWidget.deleteWidget(businessConceptInstance.widgets()[0], businessConceptInstance);
            this.clock.tick(2000); // // Tick the clock forward 2000ms
            var secondLength = businessConceptInstance.widgets().length;
            secondLength.should.equal(firstLength);
            expect(stub1.calledOnce);
            done();
        });

    });


    describe('create widget', function() {
        var vmForTheWidget, businessConceptInstance, theArgs, businessConceptInstanceVM;
        var sandbox;
        $('body').append('<div class=\'add-course-wrapper\'><h3 class=\'course-group\'>Course Lessons:</h3></div>');
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            sandbox.useFakeTimers();
            businessConceptInstance = new dexit.test.Course();
            theArgs= {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'test', userRoles: 'professor', ice4mBCs:ice4mBCs};
            vmForTheWidget = new dexit.app.ice.edu.Main(theArgs);

            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,[]);
            sandbox.stub(vmForTheWidget,'showBCInstances');
            //ignore loading of reports
            //sandbox.stub(vmForTheWidget,'loadDashboardReports');
            vmForTheWidget.init();
            vmForTheWidget.currBCDef({
                singular: 'eService',
                plural: 'eServices',
                'sctype': 'object',
                'bctype': 'eService',
                report:{
                    widgetReport:[
                        {'role':'test','seSInstanceId':'EREC','level':'EPA','definition':[{'metricId':272, 'name':'total_recharge_users_per_pattern', 'icon':'fa fa-user-plus'},{'metricId':252, 'name':'total_recharge_count_per_pattern', 'icon':'fa fa-tags'},{'metricId':262, 'name':'total_recharge_amount_per_pattern', 'icon':'fa fa-usd'}]}
                    ]
                }});
            businessConceptInstanceVM = new dexit.app.ice.edu.BCInstanceVM(businessConceptInstance.container, vmForTheWidget);
        });
        afterEach( function() {
            // Restore all the things made through the sandbox
            sandbox.restore();
        });

        it('prepare widget creation modal', function(done) {
            vmForTheWidget.selectedCourse({courseVM: businessConceptInstanceVM});
            sandbox.stub(dpa_VM,'init');
            var stubToCheckToken = sandbox.stub(dexit.app.ice.integration.token, 'checkToken');
            vmForTheWidget.prepareCreationModal('lecture', 'create');
            expect(stubToCheckToken.calledOnce).to.be.true;

            dpa_VM.init.should.have.been.called;
            done();
        });
        it('prepare widget creation modal - no operation', function(done) {
            vmForTheWidget.selectedCourse({courseVM: businessConceptInstanceVM});
            sandbox.stub(dpa_VM,'init');
            var stubToCheckToken = sandbox.stub(dexit.app.ice.integration.token, 'checkToken');
            vmForTheWidget.prepareCreationModal('lecture');
            expect(stubToCheckToken.calledOnce).to.be.true;

            dpa_VM.init.should.have.been.called;
            done();
        });

        it.skip('create a widget that represent an engagement plan', function(done) {
            dpa_VM.generatedStructure([{}]);
            vmForTheWidget.selectedCourse({courseVM: businessConceptInstanceVM});
            businessConceptInstanceVM.widgets(businessConceptInstance.widgets());
            businessConceptInstanceVM.businessConceptInstance.property.code = 'EREC';
            var firstLength = businessConceptInstance.widgets().length;
            var stubToCreateBC = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
            var stubToRetrieveBC = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
            var stubToAssignSC = sandbox.stub(dexit.app.ice.integration.scm, 'assignToContainer');
            var stubCreatePropertyMM = sandbox.stub(vmForTheWidget.bcAuthVM, 'createPropertyAsMM');
            var stubToRetrieveEPs = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
            var stubGenerateEP = sandbox.stub(vmForTheWidget.engagementBuilderVM, 'generateEP').yields(null,{});
            var stubGetReportRelationship = sandbox.stub(vmForTheWidget, 'getReportRelationship');
            var stubRetrieveWidgetReport = sandbox.stub(businessConceptInstanceVM, 'retrieveWidgetReport');
            var stubhandleChosenTouchpoints = sandbox.stub(businessConceptInstanceVM, 'handleChosenTouchpoints');
            sandbox.stub(dpa_VM,'init');

            businessConceptInstanceVM.chosenTouchpoints().push({'tpId':'123', 'channelType':'ucc', 'tpType': 'ucc'});
            stubToCreateBC.callsArgWith(1, null, {'id':'123'});
            stubToRetrieveBC.callsArgWith(1, null, dexit.test.smartcontent);
            stubToAssignSC.callsArgWith(3, true, null);
            stubCreatePropertyMM.callsArgWith(1, {});

            stubToRetrieveEPs.callsArgWith(2, null, [{id:'ep1'}, {id:'ep2'}]);
            stubGetReportRelationship.onCall(0).returns({refData:{definition:{}}});
            stubRetrieveWidgetReport.callsArgWith(2, {});
            stubhandleChosenTouchpoints.callsArgWith(1, [{id: '123', type: 'ucc', link: 'https://testlink'}]);
            businessConceptInstanceVM.creatingNewWidget('lecture', 'static', function(){});
            var secondLength = businessConceptInstance.widgets().length;
            secondLength.should.equal(firstLength+1);
            stubGenerateEP.should.have.been.calledOnce;
            done();
        });
    });

    describe('list widgets', function() {
        var vmForTheWidget, businessConceptInstance, theArgs, businessConceptInstanceVM;
        var sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            sandbox.useFakeTimers();
            businessConceptInstance = new dexit.test.Course();
            theArgs= {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'test', userRoles: 'professor', epTemplate: JSON.stringify(dexit.testEP)};
            vmForTheWidget = new dexit.app.ice.edu.Main(theArgs);
            vmForTheWidget.currBCDef({
                singular: 'eService',
                plural: 'eServices',
                sctype: 'container'});
            businessConceptInstanceVM = new dexit.app.ice.edu.BCInstanceVM(businessConceptInstance.container, vmForTheWidget);
        });
        afterEach( function() {
            // Restore all the things made through the sandbox
            sandbox.restore();
        });

        it.skip('list the widgets of a certain course', function(done) {
            businessConceptInstanceVM.widgets(businessConceptInstance.widgets());
            var firstLength = businessConceptInstance.widgets().length;
            var stubToListLectures = sandbox.stub(dexit.app.ice.edu.integration.courseManagement, 'listLectures');
            var stubToRetrieveLectureDetails = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, 'retrieveLectureDetails');
            stubToListLectures.callsArgWith(1, null, {touchpoints: [{tpType:'twitter', tpURL:'twitterTest.com'}, {tpType:'facebook', tpURL:'facebookTest.com'}], lectures: [{id:'123', property:{name:'a',type:'eService'}}, {id:'456', property:{name:'b',type:'eService'}}, {id:'789', property:{name:'c',type:'course_edu'}}]});
            stubToRetrieveLectureDetails.callsArgWith(1, null, {ePatterns: [{id:'123', pattern: {}}], isPatternActive: true, engagementMetrics: {total_likes: 5, total_shares: 5, total_comments: 5}});
            businessConceptInstanceVM.retrieveContainerInfo(businessConceptInstance.container);
            expect(stubToListLectures.calledOnce).to.be.true;
            expect(stubToListLectures.calledWith(businessConceptInstance.container.id)).to.be.true;
            var secondLength = businessConceptInstance.widgets().length;
            secondLength.should.equal(firstLength+2);
            done();
        });
    });

    describe('sorting widgets', function() {
        var vmForTheWidget, businessConceptInstance, theArgs, businessConceptInstanceVM;
        beforeEach( function() {
            businessConceptInstance = new dexit.test.Course();
            theArgs= {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'test', userRoles: 'professor', epTemplate: JSON.stringify(dexit.testEP)};
            vmForTheWidget = new dexit.app.ice.edu.Main(theArgs);
            businessConceptInstanceVM = new dexit.app.ice.edu.BCInstanceVM(businessConceptInstance.container, vmForTheWidget);
        });
        it('sorts widgets alphabetically', function(done) {
            businessConceptInstanceVM.widgets(businessConceptInstance.widgets());
            businessConceptInstanceVM.sortWidgets();
            businessConceptInstanceVM.widgets()[0].sc().property.name.should.equal('lecture 1');
            done();
        });

    });
})();
