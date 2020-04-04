/**
 * @copyright Digital Engagement Xperience 2015-2017
 * @description test for sharing (mainVM)
 */

/*global _, ko, dexit, sinon, chai */

(function () {
    'use strict';

    var should = chai.should();
    var expect = chai.expect;
    var ice4mBCs = [{'name': 'Merchandising', 'id':'abc', 'bctype':['MerchandisingCampaign']}];

    //FIXME
    // describe.skip('MainVM - Share EP', function() {
    //     var theVM, theCourse; //epmInt;
    //     var sandbox;
    //
    //     beforeEach(function() {
    //         sandbox = sinon.sandbox.create();
    //         var theArgs= {
    //             user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
    //             bucket:'newOne', currentRole: 'test', userRoles: 'professor'};
    //         theVM = new dexit.app.ice.edu.Main(theArgs);
    //         //epmInt = new dexit.epm.EPIntegration();
    //
    //         // eVM = new dexit.app.ice.edu.engagementBuilderVM({mainVM: theVM});
    //         //theVM.epIntegration = eVM;
    //         sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,ice4mBCs);
    //         sandbox.stub(theVM,'showBCInstances');
    //         theVM.init();
    //         theVM.selectedSC(_.clone(dexit.test.smartcontent));
    //         theCourse = new dexit.test.Course();
    //
    //     });
    //
    //     afterEach(function () {
    //         sandbox.restore();
    //     });
    //
    //     it('successfully schedule an Engagement pattern', function(done) {
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC');
    //         var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.schedule, 'list');
    //         var stub3 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
    //         var stub4 = sandbox.stub(theVM.epIntegration, '_epAuthoring');
    //         var stub5 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
    //         var tp = [{id: 'aaa', type: 'ucc', link: 'https://www.facebook.com/groups/203146426721234/', channelType:'ucc'}];
    //
    //
    //         //ps-ice returns an error object instead of no content
    //         sandbox.stub(dexit.app.ice.integration.engagementpattern,'update').yields({status:200});
    //         sandbox.stub(dexit.app.ice.integration.engagementpattern,'builder').yields();
    //
    //
    //         var aSC = _.clone(dexit.test.smartcontent);
    //
    //         var pattern = {id: 'ep1', pattern: {element: [{type_id:'sc:1:layout:123'}]}};
    //
    //         aSC.layout = [];
    //         aSC.layout[0] = {id:'123'};
    //         var theWidget = {perform: function(){}, scheduleVM: new dexit.app.ice.edu.ScheduleVM(), sc: ko.observable(aSC), viewState: ko.observable('fa fa-compress'),  sendTwitterNotification: ko.observable(false), isPatternActive: ko.observable(false),
    //             ePatterns: ko.observableArray([pattern])};
    //         theCourse.widgets().push(theWidget);
    //         theVM.selectedCourse({courseVM: theCourse});
    //         theVM.selectedWidget(theWidget);
    //         stub1.callsArgWith(2, null, aSC);
    //         stub2.callsArgWith(2, null, []);
    //         stub3.callsArgWith(2, {}, null);
    //         stub4.callsArgWith(5, null);
    //         stub5.callsArgWith(2, null, [{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'general', connection:[]}}] );
    //         theVM.shareEP(tp, theWidget, function() {
    //             expect(stub1.calledBefore(stub3)).to.be.true;
    //
    //
    //             dexit.app.ice.integration.engagementpattern.update.should.have.been.calledOnce;
    //             dexit.app.ice.integration.engagementpattern.update.should.have.been.calledWith(pattern.id,pattern);
    //
    //             var expectedPatternObject = {
    //                 pattern: pattern.pattern,
    //                 scId: aSC.id,
    //                 repo: 'dev'
    //             };
    //             dexit.app.ice.integration.engagementpattern.update.should.have.been.calledWith('ep1',expectedPatternObject);
    //             var expectedObj = {
    //                 scId: aSC.id,
    //                 fillInParams:true
    //             };
    //             dexit.app.ice.integration.engagementpattern.builder.should.have.been.calledWith('ep1',expectedObj);
    //
    //         });
    //         aSC.behaviour=[];
    //         done();
    //     });
    //
    //
    //     it('should not proceed if missing required parameter: theWidget or theWidget.ePatterns() is empty', function(done) {
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC');
    //         var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.schedule, 'list');
    //         var stub3 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
    //         //var stub4 = sandbox.stub(theVM.epIntegration, '_epAuthoring');
    //         var stub5 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
    //
    //         sandbox.spy(dexit.app.ice.integration.engagementpattern,'update');
    //         sandbox.spy(dexit.app.ice.integration.engagementpattern,'builder');
    //
    //
    //         var aSC = _.clone(dexit.test.smartcontent);
    //         var tp = [{id: 'aaa', type: 'ucc', link: 'https://www.facebook.com/groups/203146426721234/', channelType:'ucc'}];
    //
    //
    //         aSC.layout = [];
    //         aSC.layout[0] = {id:'123'};
    //         var theWidget = {scheduleVM: new dexit.app.ice.edu.ScheduleVM(), sc: ko.observable(aSC), viewState: ko.observable('fa fa-compress'),  sendTwitterNotification: ko.observable(false), isPatternActive: ko.observable(false),
    //         ePatterns: ko.observableArray([])};
    //         theCourse.widgets().push(theWidget);
    //         theVM.selectedCourse({courseVM: theCourse});
    //         theVM.selectedWidget(theWidget);
    //         stub1.callsArgWith(2, null, aSC);
    //         stub2.callsArgWith(2, null, []);
    //         stub3.callsArgWith(2, {}, null);
    //
    //         stub5.callsArgWith(2, null, [{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'general', connection:[]}}] );
    //         theVM.shareEP(tp, theWidget, function() {
    //
    //             stub1.should.not.have.been.called;
    //             stub3.should.not.have.been.called;
    //
    //
    //             dexit.app.ice.integration.engagementpattern.update.should.not.have.been.called;
    //             dexit.app.ice.integration.engagementpattern.builder.should.not.have.been.called;
    //
    //         });
    //         aSC.behaviour=[];
    //         done();
    //     });
    //
    //
    //     it('should not proceed if missing required parameter: tp', function(done) {
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC');
    //         var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.schedule, 'list');
    //         var stub3 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
    //         var stub4 = sandbox.stub(theVM.epIntegration, '_epAuthoring');
    //         var stub5 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
    //
    //         sandbox.spy(dexit.app.ice.integration.engagementpattern,'update');
    //         sandbox.spy(dexit.app.ice.integration.engagementpattern,'builder');
    //
    //
    //         var aSC = _.clone(dexit.test.smartcontent);
    //
    //         var pattern = {id: 'ep1', pattern: {element: [{type_id:'sc:1:layout:123'}]}};
    //
    //         aSC.layout = [];
    //         aSC.layout[0] = {id:'123'};
    //         var theWidget = {scheduleVM: new dexit.app.ice.edu.ScheduleVM(), sc: ko.observable(aSC), viewState: ko.observable('fa fa-compress'),  sendTwitterNotification: ko.observable(false), isPatternActive: ko.observable(false),
    //             ePatterns: ko.observableArray([pattern])};
    //         theCourse.widgets().push(theWidget);
    //         theVM.selectedCourse({courseVM: theCourse});
    //         theVM.selectedWidget(theWidget);
    //         stub1.callsArgWith(2, null, aSC);
    //         stub2.callsArgWith(2, null, []);
    //         stub3.callsArgWith(2, {}, null);
    //         stub4.callsArgWith(5, null);
    //         stub5.callsArgWith(2, null, [{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'general', connection:[]}}] );
    //         theVM.shareEP([], theWidget, function() {
    //
    //             stub1.should.not.have.been.called;
    //             stub3.should.not.have.been.called;
    //
    //
    //             dexit.app.ice.integration.engagementpattern.update.should.not.have.been.calledOnce;
    //             dexit.app.ice.integration.engagementpattern.builder.should.not.have.been.calledOnce;
    //
    //         });
    //         aSC.behaviour=[];
    //         done();
    //     });
    //
    //
    //     it('create schedule successfully with UCC and FB Auth - not a FB group member', function(done) {
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC');
    //         var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.schedule, 'list');
    //         var stub3 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
    //         var stub4 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup, 'retrieveMembers');
    //         var stub5 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup,'storeUserGroup');
    //         var stub6 = sandbox.stub(theVM.epIntegration, '_epAuthoring');
    //         var stub7 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
    //         var tp = [{id: 'aaa', type: 'ucc', link: 'https://www.facebook.com/groups/203146426721234/', channelType:'ucc'}];
    //
    //         sandbox.stub(dexit.app.ice.integration.engagementpattern,'update').yields({status:200});
    //         var aSC = _.clone(dexit.test.smartcontent);
    //         var generatedStructure = [{
    //             componentIndex: 1, elementTynComponents: {}, validComponent: function () {
    //             }
    //         }];
    //         var parsedObject = JSON.stringify(generatedStructure);
    //         aSC.property.epObject = parsedObject;
    //         aSC.layout = [];
    //         aSC.layout[0] = {id:'123'};
    //         var pattern = {id: 'ep1', pattern: {element: [{type_id:'sc:1:layout:123'}]}};
    //         var theWidget = {scheduleVM: new dexit.app.ice.edu.ScheduleVM(), sc: ko.observable(aSC), viewState: ko.observable('fa fa-compress'),  sendTwitterNotification: ko.observable(false), isPatternActive: ko.observable(false), ePatterns: ko.observableArray([pattern])};
    //         theCourse.widgets().push(theWidget);
    //         theVM.selectedCourse({courseVM: theCourse});
    //         theVM.selectedWidget(theWidget);
    //         theVM.channelAuth('false');
    //         stub1.callsArgWith(2, null, aSC);
    //         stub2.callsArgWith(2, null, []);
    //         stub3.callsArgWith(2, {}, null);
    //         stub4.callsArgWith(1, null, null);
    //         stub6.callsArgWith(5, null);
    //         stub7.callsArgWith(2, null, [{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'general', connection:[]}}] );
    //         theVM.shareEP(tp, theWidget, function() {
    //             expect(stub4.called).to.be.true;
    //             expect(stub5.called).to.be.false;
    //             expect(stub1.called).to.be.false;
    //             dexit.app.ice.integration.engagementpattern.update.should.have.been.calledOnce;
    //             dexit.app.ice.integration.engagementpattern.update.should.have.been.calledWith(pattern.id,pattern);
    //
    //         });
    //
    //         done();
    //     });
    //     it('create schedule successfully with FB Auth - a FB group auth failed', function(done) {
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC');
    //         var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.schedule, 'list');
    //         var stub3 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
    //         var stub4 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup, 'retrieveMembers');
    //         var stub5 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup,'storeUserGroup');
    //         var stub6 = sandbox.stub(theVM.epIntegration, '_epAuthoring');
    //         var stub7 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
    //         var tp = [{id: 'aaa', type: 'ucc', link: 'https://www.facebook.com/groups/203146426721234/', channelType:'ucc'}];
    //
    //         var aSC = _.clone(dexit.test.smartcontent);
    //         var generatedStructure = [{
    //             componentIndex: 1, elementTynComponents: {}, validComponent: function () {
    //             }
    //         }];
    //         var parsedObject = JSON.stringify(generatedStructure);
    //         aSC.property.epObject = parsedObject;
    //         aSC.layout = [];
    //         aSC.layout[0] = {id:'123'};
    //         var theWidget = {scheduleVM: new dexit.app.ice.edu.ScheduleVM(), sc: ko.observable(aSC), viewState: ko.observable('fa fa-compress'),  sendTwitterNotification: ko.observable(false), isPatternActive: ko.observable(false), ePatterns: ko.observableArray([{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'ucc', connection:[]}}])};
    //         theCourse.widgets().push(theWidget);
    //         theVM.selectedCourse({courseVM: theCourse});
    //         theVM.selectedWidget(theWidget);
    //         theVM.channelAuth('false');
    //         stub1.callsArgWith(2, null, aSC);
    //         stub2.callsArgWith(2, null, []);
    //         stub3.callsArgWith(2, {}, null);
    //         stub4.callsArgWith(1, null, 'member');
    //         stub5.callsArgWith(1,{status: 400});
    //         stub6.callsArgWith(5, null);
    //         stub7.callsArgWith(2, null, [{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'general', connection:[]}}] );
    //         theVM.shareEP(tp, theWidget, function() {
    //             expect(stub4.called).to.be.true;
    //             expect(stub5.called).to.be.true;
    //             expect(stub1.called).to.be.false;
    //         });
    //
    //         done();
    //     });
    //     it('create schedule successfully with FB Auth - a FB group auth failed with error message', function(done) {
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC');
    //         var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.schedule, 'list');
    //         var stub3 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
    //         var stub4 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup, 'retrieveMembers');
    //         var stub5 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup,'storeUserGroup');
    //         var stub6 = sandbox.stub(theVM.epIntegration, '_epAuthoring');
    //         var stub7 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
    //         var tp = [{id: 'aaa', type: 'ucc', link: 'https://www.facebook.com/groups/203146426721234/', channelType:'ucc'}];
    //
    //         var aSC = _.clone(dexit.test.smartcontent);
    //         var generatedStructure = [{
    //             componentIndex: 1, elementTynComponents: {}, validComponent: function () {
    //             }
    //         }];
    //         var parsedObject = JSON.stringify(generatedStructure);
    //         aSC.property.epObject = parsedObject;
    //         aSC.layout = [];
    //         aSC.layout[0] = {id:'123'};
    //         var theWidget = {scheduleVM: new dexit.app.ice.edu.ScheduleVM(), sc: ko.observable(aSC), viewState: ko.observable('fa fa-compress'),  sendTwitterNotification: ko.observable(false), isPatternActive: ko.observable(false), ePatterns: ko.observableArray([{id: 'ep1', pattern: {element: [{type_id:'sc:1:layout:123'}]}}])};
    //         theCourse.widgets().push(theWidget);
    //         theVM.selectedCourse({courseVM: theCourse});
    //         theVM.selectedWidget(theWidget);
    //         theVM.channelAuth('false');
    //         stub1.callsArgWith(2, null, aSC);
    //         stub2.callsArgWith(2, null, []);
    //         stub3.callsArgWith(2, {}, null);
    //         stub4.callsArgWith(1, null, 'member');
    //         stub5.callsArgWith(1,{status: 400, responseText:{message: 'error message'}});
    //         stub6.callsArgWith(5, null);
    //         stub7.callsArgWith(2, null, [{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'general', connection:[]}}] );
    //         theVM.shareEP(tp, theWidget, function() {
    //             expect(stub4.called).to.be.true;
    //             expect(stub5.called).to.be.true;
    //             expect(stub1.called).to.be.false;
    //         });
    //
    //         done();
    //     });
    //     it('create schedule successfully - already a FB group member and group auth', function(done) {
    //         var stub1 = sandbox.stub(dexit.app.ice.integration.scm, 'retrieveSC');
    //         var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.schedule, 'list');
    //         var stub3 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
    //         var stub4 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup, 'retrieveMembers');
    //         var stub5 = sandbox.stub(dexit.app.ice.edu.integration.fbgroup,'storeUserGroup');
    //         var stub6 = sandbox.stub(theVM.epIntegration, '_epAuthoring');
    //         var stub7 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'retrieveSCPatterns');
    //         var tp = [{id: 'aaa', type: 'ucc', link: 'https://www.facebook.com/groups/203146426721234/', channelType:'ucc'}];
    //
    //         var aSC = _.clone(dexit.test.smartcontent);
    //         var generatedStructure = [{
    //             componentIndex: 1, elementTynComponents: {}, validComponent: function () {
    //             }
    //         }];
    //         var parsedObject = JSON.stringify(generatedStructure);
    //         aSC.property.epObject = parsedObject;
    //         aSC.layout = [];
    //         aSC.layout[0] = {id:'123'};
    //         var theWidget = {scheduleVM: new dexit.app.ice.edu.ScheduleVM(), sc: ko.observable(aSC), viewState: ko.observable('fa fa-compress'),  sendTwitterNotification: ko.observable(false), isPatternActive: ko.observable(false), ePatterns: ko.observableArray([{id: 'ep1', pattern: {element: [{type_id:'sc:1:layout:123'}]}}])};
    //         theCourse.widgets().push(theWidget);
    //         theVM.selectedCourse({courseVM: theCourse});
    //         theVM.selectedWidget(theWidget);
    //         theVM.channelAuth('false');
    //         stub1.callsArgWith(2, null, aSC);
    //         stub2.callsArgWith(2, null, []);
    //         stub3.callsArgWith(2, {}, null);
    //         stub4.callsArgWith(1, null, 'member');
    //         stub5.callsArgWith(1,{status: 200});
    //         stub6.callsArgWith(5, null);
    //         stub7.callsArgWith(2, null, [{id: 'ep1', pattern: {element: [{type_id:'123'},{type:'behaviour', subType:'chat', args:{name:'name',slug:'slug',description:'desc'}, type_id:'123'}], type:'general', connection:[]}}] );
    //         theVM.shareEP(tp, theWidget, function() {
    //             expect(stub4.called).to.be.true;
    //             expect(stub5.called).to.be.true;
    //             expect(stub1.calledBefore(stub3)).to.be.true;
    //         });
    //
    //         //expect(stub3.calledWith(aSC.id, sinon.match.any, sinon.match.any)).to.be.true;
    //         done();
    //     });
    //
    //
    // });
})();
