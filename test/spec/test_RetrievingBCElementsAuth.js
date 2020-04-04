/**
 * Copyright Digital Engagement Xperiance
 * Date: 26/11/14
 * @author Ali Hussain
 * @description
 */

/*global _, ko */

(function () {
    'use strict';


    var should = chai.should();
    var expect = chai.expect;

    describe('bc Auth - Retrieve', function() {
        var mainVM, bcAuthVM, retrievingBCVM, theCourse, theArgs, retrievingBCArgs, epTest,sandbox,testCourse;

        var ice4mBCs = [{'name':'Merchandising','bctype':[{'eService':{'bctype':['eServiceInstance']}}]},{'name':'Marketing','bctype':[{'Campaign':{'bctype':['Promotion']}}]}];

        $(document.body).append('<select class=\'form-control answerForm\'><option value>/answer1</option></select>');
        beforeEach( function() {
            this.clock = sinon.useFakeTimers(); // sinon fake timer
            sandbox = sinon.sandbox.create();
            epTest = '{"McQ Questionnaire":[{"id":"post_questionnaire","name":"post_questionnaire","resource":"questionnaire","path_template":"/questionnaire","action":"POST","args":[":title=:title",":description=:description",":allowAnonymous=:allowAnonymous",":prompt=:prompt",":type=:type",":options=:options"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"title":":title","description":":description","allowAnonymous":":allowAnonymous","questions":[{"prompt":":prompt","type":":type","options":":options"}]}},{"id":"get_questionnaire","name":"get_questionnaire","resource":"questionnaire","path_template":"/questionnaire/:questionnaire_id","action":"GET","args":[":questionnaire_id=:questionnaire_id"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"questionnaire_id":": questionnaire_id"}},{"id":"delete_questionnaire","name":"delete_questionnaire","resource":"questionnaire","path_template":"/questionnaire/:questionnaire_id","action":"DELETE","args":[":questionnaire_id=:questionnaire_id"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"questionnaire_id":": questionnaire_id"}},{"id":"questionnaire-count","name":"questionnaire-count","resource":"questionnaire","path_template":"/questionnaire/:questionnaire_id/count","action":"GET","args":[":questionnaire_id=:questionnaire_id"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"questionnaire_id":":questionnaire_id"}}],"Multiple Choice":[{"id":"multipleChoiceFeedback_device","name":"multipleChoiceFeedback","resource":"multipleChoiceFeedback","action":"multipleChoiceFeedback","context":"Device","args":["question","options"],"location":"ee4e5b54-07fe-4e87-8df5-7c88a338b2ea","type":"service"}]}';
            theArgs= {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'test', userRoles: 'professor'
            };
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            mainVM.bcAuthVM = new dexit.app.ice.edu.bcAuthoring.BCAuthoringVM({mainVM: mainVM});
            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,ice4mBCs);

            sandbox.stub(mainVM,'showBCInstances');
            //ignore loading of reports
            sandbox.stub(mainVM,'loadDashboardReports');

            mainVM.init();

            testCourse = new dexit.test.Course();
            theCourse = new dexit.app.ice.edu.BCInstanceVM(testCourse.container, mainVM);
        });
        afterEach( function() {
            this.clock.restore();
            sandbox.restore();
        });

        it('retrieve BCElements when there is only one pattern', function(done){
            var theSC2 =
            {
                'url': 'http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f',
                'id': 'bd35b5fc-5f15-49d9-9b10-0d508c98386f',
                'kind': 'smartcontent#object',
                'property': {
                    'name': 'lecture 1',
                    'class': 'sc',
                    'related_engagement_sc': '123'
                },
                'behaviour': [],
                'aevent': [],
                'presentation': [],
                'decision': [],
                'intelligence': [],
                'text': [],
                'textinput': [],
                'link': [],
                'audio': [],
                'image': [],
                'animation': [],
                'video': []
            };
            var widget = {
                sc: ko.observable(theSC2),
                ePatterns: ko.observableArray([{id: 'ep1', pattern: {start: '2016-01-19T16:37:28.051Z', end: '2018-01-19T16:37:28.051Z', element: [{type_id:'123'}], connection: [{},{},{properties:{wait:ko.observable('2')}}]}}]),
                name: ko.observable(theSC2.property.name),
                isPatternActive: ko.observable(false)
            };
            var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc, 'retrieveSC');
            var stub2 = sandbox.stub(mainVM.bcAuthVM, 'retrievePropertyAsMM');
            var stub3 = sandbox.stub(mainVM, 'prepareCreationModal');
            sandbox.stub(dpa_VM,'init');
            mainVM.selectedCourse({courseVM: theCourse});
            stub1.callsArgWith(2, null, {property:{type:'lecture'}});
            stub2.callsArgWith(1,['titleTest', 'descriptionTest']);
            mainVM.bcAuthVM.retrieveBCElements(widget, 1);
            expect(stub3.called).to.be.true;
            dpa_VM.init.should.have.been.called;
            done();
        });

        it('retrieve BCElements when there are more than one pattern', function(done){
            $('body').append('<div data-tpid=\'testTPID\'><img src=\'iconLink\'><div data-intelid=\'testIntelId\'></div>');
            var theSC2 =
            {
                'url': 'http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f',
                'id': 'bd35b5fc-5f15-49d9-9b10-0d508c98386f',
                'kind': 'smartcontent#object',
                'property': {
                    'name': 'lecture 1',
                    'class': 'sc',
                    'related_engagement_sc': '123'
                },
                'behaviour': [],
                'aevent': [],
                'presentation': [],
                'decision': [],
                'intelligence': [],
                'text': [],
                'textinput': [],
                'link': [],
                'audio': [],
                'image': [],
                'animation': [],
                'video': []
            };
            var widget = {
                sc: ko.observable(theSC2),
                ePatterns: ko.observableArray([{id: 'ep1', pattern: {type: 'ucc', start: '2016-01-19T16:37:28.051Z', end: '2018-01-19T16:37:28.051Z', element: [{type_id:'1',type: 'multimedia'}, {type_id:'2',type: 'behaviour'}], connection: [{},{},{properties:{wait:ko.observable('2')}}]}},
                    {id: 'ep2', pattern: {type: 'general', start: '2016-01-19T16:37:28.051Z', end: '2018-01-19T16:37:28.051Z', element: [{type_id:'123'}], connection: [{},{},{properties:{wait:ko.observable('2')}}]}}]),
                name: ko.observable(theSC2.property.name),
                isPatternActive: ko.observable(false)
            };


            //mainVM.modalOperation('edit');
            mainVM.selectedCourse({courseVM: theCourse});
            var stub1 = sandbox.stub(mainVM, 'prepareCreationModal');
            var stub2 = sandbox.stub(mainVM.selectedCourse().courseVM, 'retrieveTouchpointsDetailsOfBCi');
            var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, 'retrieveSC');
            var stub5 = sandbox.stub(mainVM.bcAuthVM, 'retrievePropertyAsMM');
            sandbox.stub(dpa_VM,'init');
            stub2.callsArgWith(1, [{tpId:'testTPID'}]);
            var epObject = {
                calls: [{id:'id1',layoutRef:'main'}],
                layout: ['main']
            };



            stub4.callsArgWith(2, null, {property:{type:'lecture',epObject:JSON.stringify(epObject),
                decObject:JSON.stringify({}), referredIntelligence: JSON.stringify([{intelId:'testIntelId'}])}});
            stub5.callsArgWith(1,['titleTest', 'descriptionTest']);
            mainVM.bcAuthVM.retrieveBCElements(widget, 1);
            expect(stub1.called).to.be.true;
            expect(stub2.calledOnce).to.be.true;
            expect(stub4.calledOnce).to.be.true;
            expect(stub5.calledOnce).to.be.true;
            dpa_VM.init.should.have.been.called;
            done();
        });

        it('retrieve BCElements without pattern', function(done){
            var widget = {
                ePatterns: ko.observableArray([])
            };
            mainVM.bcAuthVM.retrieveBCElements(widget, 1);
            done();
        });

        it('retrieve BCElements without pattern', function(done){
            var widget = {
                ePatterns: ko.observableArray([])
            };
            mainVM.bcAuthVM.retrieveBCElements(widget, 1);
            done();
        });



        it('retrieve propertyMM', function(done) {
            mainVM.bcAuthVM.propertyTextValue(['titleTest', 'descriptionTest']);
            var text = [{
                'url': 'http://scc.latest.dexit.co/repos/latest/multimediabody/textbody/55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'id': '55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'kind': 'multimediabody#text',
                'property': {
                    'content': 'new one',
                    'tag': 'property-mm-102',
                    'class': '',
                    'identity': '',
                    'context': 'device',
                    'name': 'testing123'
                }

            }];
            mainVM.bcAuthVM.retrievePropertyAsMM({text:text}, function(data){
                expect(data.length=3);
                done();
            });


        });

        it('retrieve propertyMM when text content does not exist', function(done) {
            mainVM.bcAuthVM.propertyTextValue(['titleTest', 'descriptionTest']);
            var text = [{
                'url': 'http://scc.latest.dexit.co/repos/latest/multimediabody/textbody/55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'id': '55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'kind': 'multimediabody#text',
                'property': {
                    'content': 'new one',
                    'tag': 'property-mm-96',
                    'class': '',
                    'identity': '',
                    'context': 'device',
                    'name': 'testing123'
                }

            }];
            mainVM.bcAuthVM.retrievePropertyAsMM({text:text}, function(data){
                expect(data.length=3);
                done();
            });


        });


        it.skip('retrieve questionnaire behaviour--dynamic pattern--execute behaviour successfully', function(done) {
            var element = {type_id:'0', args: [],subType: 'questionnaire'};
            mainVM.modalOperation('edit');
            var stub1 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
            var stub2 = sandbox.stub(dpa_VM, 'redrawLines');
            var behaviour = [{
                'url': 'http://scc.latest.dexit.co/repos/latest/multimediabody/textbody/55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'id': '55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'kind': 'multimediabody#text',
                'scope': 'user',
                'property': {
                    'condition': '/intelligence:answer1#operation:>=#value:5',
                    'name': 'get_questionnaire',
                    'resource': 'questionnaire',
                    args: ['questoin1', 'a,b']
                }

            }];
            stub1.callsArgWith(2, null, {questions:[{options:['a','b'], prompt: 'tq'}]});
            mainVM.selectedEPoint = ko.observable('Multiple Choice');
            mainVM.engagementPoints = JSON.parse(epTest);
            mainVM.ice4eEngagmentBehaviours([{'name':'multipleChoice', 'args': ['question','answer'], 'action':'asking'}]);
            mainVM.bcAuthVM.retrieveBehaviour({behaviour:behaviour}, element, function(){});
            expect(stub2.called).to.be.true;
            done();
        });

        it.skip('retrieve questionnaire behaviour--dynamic pattern--execute behaviour failed', function(done) {
            var element = {type_id:'0', args: [],subType: 'questionnaire'};

            mainVM.modalOperation('edit');
            var stub1 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
            var stub2 = sandbox.stub(dpa_VM, 'redrawLines');
            var behaviour = [{
                'url': 'http://scc.latest.dexit.co/repos/latest/multimediabody/textbody/55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'id': '55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'kind': 'multimediabody#text',
                'scope': 'user',
                'property': {
                    'condition': '/intelligence:answer1#operation:>=#value:5',
                    'name': 'get_questionnaire',
                    'resource': 'questionnaire',
                    args: ['questoin1', 'a,b']
                }

            }];
            stub1.callsArgWith(2, true, null);
            mainVM.selectedEPoint = ko.observable('Multiple Choice');
            mainVM.engagementPoints = JSON.parse(epTest);
            mainVM.ice4eEngagmentBehaviours([{'name':'multipleChoice', 'args': ['question','answer'], 'action':'asking'}]);
            mainVM.bcAuthVM.retrieveBehaviour({behaviour:behaviour}, element, function(){});
            expect(stub2.called).to.be.false;
            done();
        });

        it.skip('retrieve chat behaviour--dynamic pattern--execute behaviour failed', function(done) {
            var element = {type_id:'0', args: {name: 'a', slug: 'b', description: 'c'},subType: 'chat'};

            mainVM.modalOperation('edit');
            var stub1 = sandbox.stub(dexit.app.ice.integration.behaviour, 'execute');
            var behaviour = [{
                'url': 'http://scc.latest.dexit.co/repos/latest/multimediabody/textbody/55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'id': '55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'kind': 'multimediabody#text',
                'scope': 'user',
                'property': {
                    'condition': '/intelligence:answer1#operation:>=#value:5',
                    'name': 'create_chat_room',
                    'resource': 'questionnaire',
                    args: ['questoin1', 'a,b']
                }

            }];
            stub1.callsArgWith(2, true, null);
            mainVM.selectedEPoint = ko.observable('Multiple Choice');
            mainVM.engagementPoints = JSON.parse(epTest);
            mainVM.ice4eEngagmentBehaviours([{'name':'multipleChoice', 'args': ['question','answer'], 'action':'asking'}]);
            mainVM.bcAuthVM.retrieveBehaviour({behaviour:behaviour}, element, function(){});
            done();
        });

        it.skip('retrieve behaviour when user is not defined--dynamic pattern', function(done) {
            var element = {type_id:'0', args: {name: 'a', slug: 'b', description: 'c'},subType: 'chat'};
            mainVM.modalOperation('edit');
            var behaviour = [{
                'url': 'http://scc.latest.dexit.co/repos/latest/multimediabody/textbody/55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'id': '55d33a0d-6d74-4980-a4a7-f37f1035885e',
                'kind': 'multimediabody#text',
                'scope': 'beauty',
                'property': {
                    'condition': '/intelligence:answer1#operation:>=#value:5',
                    'name': 'create_chat_room',
                    'resource': 'questionnaire',
                    args: ['questoin1', 'a,b']
                }

            }];
            mainVM.bcAuthVM.retrieveBehaviour({behaviour:behaviour}, element, function(){});
            done();
        });

    });

})();
