/**
 * Copyright Digital Engagement Xperience 2014-2017
 * @description tests for bcAuthoring/addingBCElementsVM
 */

/*global _, ko, chai, dexit, dpa_VM, sinon */

(function () {
    'use strict';


    var should = chai.should();
    var expect = chai.expect;

    var mockDcmManagement = {
        createMultimedia: function(mmType, value, name, scId, callback) {}
    };

    var mockMainVM = {
        selectedSC: function (data) {},
        repo: 'test',
        functionality:'ice4mm',
        quizQuestion: ko.observable('Testing Question ?'),
        quizChoices: ko.observable([]),
        userProfile: function () {
            return {
                attributes: {
                    firstname: 'test',
                    lastname: 'test'
                }
            };
        },
        currBCDef: ko.observable({bctype:'m'}),
        selectedCourse: ko.observable(),
        stopVideo: function () {

        },
        selectedTPType: ko.observable(),
        selectedTP: ko.observable()
    };

    describe('bc Auth - Create', function() {
        var mainVM, bcAuthVM, addingBCVM, theCourse, theArgs, addingBCArgs, epTest, theCourseVM, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            this.clock = sinon.useFakeTimers(); // sinon fake timer
            theCourse = new dexit.test.Course();
            bcAuthVM = new dexit.app.ice.edu.bcAuthoring.BCAuthoringVM({mainVM: mockMainVM, dcmManagement:mockDcmManagement});
            epTest = '[{"location":"27201eb0-3112-44d5-a744-ee4b238463f6","resources":[{"args":[":user=:user"],"input_parameters":{"user":"string#required#noDefault"},"output_parameters":{"name":"string"},"resource":"evoucher","context":"cloud","name":"post_evoucher","action":"POST","id":"post_evoucher","raml":"true","body":{"name":":user"},"type":"service","path_template":"/evoucher","location":"27201eb0-3112-44d5-a744-ee4b238463f6"}],"eptId":"0845d5b0-db37-4d3b-8d9b-bc69118e0317","name":"evoucher","uiElements":{"filter":"retailer","rule_type":"simple","subtype":"evoucher","render_text":"eVoucher","icon_type":"fa fa-id-card"},"type":"service"},{"location":"27201eb0-3112-44d5-a744-ee4b238463f6","resources":[{"args":[":user=:user"],"input_parameters":{"user":"string#required#noDefault"},"output_parameters":{"name":"string"},"resource":"charge","context":"cloud","name":"post_url","action":"POST","id":"post_url","raml":"true","body":{"name":":user"},"type":"service","path_template":"/url","location":"27201eb0-3112-44d5-a744-ee4b238463f6"}],"eptId":"24f43db0-0372-4623-875c-7aae669e022d","name":"erecharge","uiElements":{"filter":"subscriber","rule_type":"simple","subtype":"recharge","render_text":"Recharge","icon_type":"fa fa-bolt"},"type":"service"},{"location":"27201eb0-3112-44d5-a744-ee4b238463f6","resources":[{"args":[":user=:user"],"input_parameters":{"user":"string#required#noDefault"},"output_parameters":{"name":"string"},"resource":"evoucher2","context":"cloud","name":"post_evoucher2","action":"POST","id":"post_evoucher2","raml":"true","body":{"name":":user"},"type":"service","path_template":"/evoucher2","location":"27201eb0-3112-44d5-a744-ee4b238463f6"}],"eptId":"31f0cda7-0357-4b7e-8aa0-1a5ef1174dbd","name":"evoucher2","uiElements":{"filter":"retailer","rule_type":"simple","subtype":"evoucher2","render_text":"special","icon_type":"fa fa-tags"},"type":"service"},{"location":"27201eb0-3112-44d5-a744-ee4b238463f6","resources":[{"args":[":user=:user"],"input_parameters":{"user":"string#required#noDefault"},"output_parameters":{"name":"string"},"resource":"charge","context":"cloud","name":"post_url2","action":"POST","id":"post_url2","raml":"true","body":{"name":":user"},"type":"service","path_template":"/url2","location":"27201eb0-3112-44d5-a744-ee4b238463f6"}],"eptId":"4f6a6bec-f4a6-4cd2-bb4e-f3a467f2581d","name":"erecharge2","uiElements":{"filter":"subscriber","rule_type":"simple","subtype":"recharge2","render_text":"Special","icon_type":"fa fa-tags"},"type":"service"},{"location":"27201eb0-3112-44d5-a744-ee4b238463f6","resources":[{"args":[":user=:user"],"input_parameters":{"user":"string#required#noDefault"},"output_parameters":{"name":"string"},"resource":"eorder2","context":"cloud","name":"post_eorder2","action":"POST","id":"post_eorder2","raml":"true","body":{"name":":user"},"type":"service","path_template":"/eorder2","location":"27201eb0-3112-44d5-a744-ee4b238463f6"}],"eptId":"5aba0908-084e-4082-bae1-b35b80a01e9d","name":"eorder2","uiElements":{"filter":"wholesaler","rule_type":"simple","subtype":"eOrder2","render_text":"special","icon_type":"fa fa-shopping-cart"},"type":"service"},{"location":"4c64d634-490a-4aaa-bc5f-03aa5fa236f2","resources":[{"body":{"service_id":":service_id","operation":":operation","Authorization":":Authorization","description":":description","name":":name","slug":":slug"},"chatroom_operation":"createRoom","args":[":Authorization=:Authorization",":slug=:slug",":name=:name",":description=:description",":service_id=:service_id",":operation=:operation"],"output_parameters":{"url":"string"},"resource":"rooms","type":"service","chat_service_id":"8584d979-f355-4207-8b3b-d23acf715567","input_parameters":{"service_id":"string#required#noDefault","operation":"string#required#noDefault","Authorization":"string#required#noDefault","description":"string#required#noDefault","name":"string#required#noDefault","slug":"string#required#noDefault"},"id":"create_chat_room","name":"create_chat_room","action":"POST","context":"cloud","path_template":"/engagementPoint/chatservice","location":"4c64d634-490a-4aaa-bc5f-03aa5fa236f2"},{"id":"get_chat_room_url","body":{"Authorization":":Authorization","description":":description","name":":name","slug":":slug","url":":url"},"args":[":Authorization=:Authorization",":slug=:slug",":name=:name",":description=:description",":url=:url"],"name":"get_chat_room_url","resource":"rooms","output_parameters":{"description":"string","name":"string","slug":"string","url":"string"},"context":"cloud","action":"POST","type":"service","input_parameters":{"Authorization":"string#required#noDefault","description":"string#required#noDefault","name":"string#required#noDefault","slug":"string#required#noDefault","url":"string#required#noDefault"},"path_template":"/engagementPoint/chaturl","location":"4c64d634-490a-4aaa-bc5f-03aa5fa236f2"}],"eptId":"656e7fc4-b85d-42aa-94fa-77c182139488","name":"Lets Chat","type":"service"},{"location":"91037685-af3c-4357-808a-efa36f48a212","resources":[{"body":{"operation":":operation","Authorization":":Authorization","serviceId":":serviceId","description":":description","name":":name","slug":":slug"},"chatroom_operation":"createRoom","args":[":Authorization=:Authorization",":slug=:slug",":name=:name",":description=:description",":serviceId=:serviceId",":operation=:operation"],"output_parameters":{"url":"string"},"resource":"rooms","type":"service","chat_service_id":"8584d979-f355-4207-8b3b-d23acf715567","input_parameters":{"operation":"string#required#noDefault","Authorization":"string#required#noDefault","serviceId":"string#required#noDefault","description":"string#required#noDefault","name":"string#required#noDefault","slug":"string#required#noDefault"},"id":"create_chat_room","name":"createRoom","action":"POST","context":"cloud","path_template":"/chatservice","location":"91037685-af3c-4357-808a-efa36f48a212"},{"id":"get_chat_room_url","body":{"Authorization":":Authorization","description":":description","name":":name","slug":":slug","url":":url"},"args":[":Authorization=:Authorization",":slug=:slug",":name=:name",":description=:description",":url=:url"],"name":"getRoomURL","resource":"rooms","output_parameters":{"description":"string","name":"string","slug":"string","url":"string"},"context":"cloud","action":"POST","type":"service","input_parameters":{"Authorization":"string#required#noDefault","description":"string#required#noDefault","name":"string#required#noDefault","slug":"string#required#noDefault","url":"string#required#noDefault"},"path_template":"/chaturl","location":"91037685-af3c-4357-808a-efa36f48a212"},{"body":{"users":":users","Authorization":":Authorization","serviceId":":serviceId","usersPerRoom":":usersPerRoom","description":":description","name":":name","slug":":slug","hasPassword":":hasPassword","password":":password","private":":private"},"args":[":Authorization=:Authorization",":slug=:slug",":name=:name",":description=:description",":serviceId=:serviceId",":private=:private",":usersPerRoom=:usersPerRoom",":users=:users",":hasPassword=:hasPassword",":password=:password"],"output_parameters":{"id":"string"},"resource":"rooms","type":"service","chat_service_id":"309e61fe-f6dd-4ee8-afdc-9a219a016c9b","input_parameters":{"users":"list#required#noDefault","Authorization":"string#noDefault","serviceId":"string#required#noDefault","usersPerRoom":"string#required#noDefault","description":"string#noDefault","name":"string#required#noDefault","slug":"string#required#noDefault","hasPassword":"string#noDefault","password":"string#noDefault","private":"string#noDefault"},"id":"create_discussion_rooms","raml":true,"name":"createDiscussionRooms","action":"POST","context":"cloud","path_template":"/groupchat","location":"91037685-af3c-4357-808a-efa36f48a212"},{"id":"get_discussion_group_url","body":{"id":":id","serviceId":":serviceId","user":":user"},"args":[":id=:id",":serviceId=:serviceId",":user=:user"],"name":"getDiscussionGroupURL","resource":"rooms","output_parameters":{"url":"string"},"context":"cloud","action":"POST","type":"service","input_parameters":{"id":"string#required#noDefault","serviceId":"string#required#noDefault","user":"string#required#noDefault"},"chat_service_id":"309e61fe-f6dd-4ee8-afdc-9a219a016c9b","path_template":"/groupchaturl","location":"91037685-af3c-4357-808a-efa36f48a212"}],"eptId":"89fcbfc1-f76d-4409-acc5-0a8f48b923c3","name":"Lets Discuss","type":"service"},{"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","resources":[{"id":"post_questionnaire","body":{"title":":title","allowAnonymous":":allowAnonymous","description":":description","questions":[{"prompt":":prompt","type":":type","options":":options"}]},"args":[":title=:title",":description=:description",":allowAnonymous=:allowAnonymous",":prompt=:prompt",":type=:type",":options=:options"],"name":"post_questionnaire","resource":"questionnaire","context":"cloud","action":"POST","path_template":"/questionnaire","location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service"},{"id":"get_questionnaire","body":{"questionnaire_id":": questionnaire_id"},"args":[":questionnaire_id=:questionnaire_id"],"name":"get_questionnaire","resource":"questionnaire","context":"cloud","action":"GET","path_template":"/questionnaire/:questionnaire_id","location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service"},{"id":"delete_questionnaire","body":{"questionnaire_id":": questionnaire_id"},"args":[":questionnaire_id=:questionnaire_id"],"name":"delete_questionnaire","resource":"questionnaire","context":"cloud","action":"DELETE","path_template":"/questionnaire/:questionnaire_id","location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service"},{"id":"questionnaire-count","body":{"questionnaire_id":":questionnaire_id"},"args":[":questionnaire_id=:questionnaire_id"],"name":"questionnaire-count","resource":"questionnaire","context":"cloud","action":"GET","path_template":"/questionnaire/:questionnaire_id/count","location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service"}],"eptId":"8f545a35-e3cc-429c-8fd5-dd6f9ba59249","name":"McQ Questionnaire","uiElements":{"filter":"all","rule_type":"complex","subtype":"questionnaire","render_text":"Business Rule","icon_type":"fa fa-cogs"},"type":"service"},{"location":"27201eb0-3112-44d5-a744-ee4b238463f6","resources":[{"args":[":user=:user"],"input_parameters":{"user":"string#required#noDefault"},"output_parameters":{"name":"string"},"resource":"eorder","context":"cloud","name":"post_eorder","action":"POST","id":"post_eorder","raml":"true","body":{"name":":user"},"type":"service","path_template":"/eorder","location":"27201eb0-3112-44d5-a744-ee4b238463f6"}],"eptId":"c7183504-38d2-46a5-a789-a491c7173e38","name":"eorder","uiElements":{"filter":"wholesaler","rule_type":"simple","subtype":"eOrder","render_text":"eOrder","icon_type":"fa fa-money"},"type":"service"}]';
            theCourseVM = new dexit.app.ice.edu.BCInstanceVM(theCourse.container, mockMainVM);
        });
        afterEach( function() {
            sandbox.restore();
            this.clock.restore();

        });





        it('create propertyMM', function(done) {

            var stub1 = sandbox.stub(mockDcmManagement, 'createMultimedia');
            stub1.callsArgWith(4, null, true);
            bcAuthVM.propertyTextValue(['titleTest', 'descriptionTest']);
            bcAuthVM.createPropertyAsMM(dexit.test.smartcontent, function(){});
            expect(stub1.calledTwice).to.be.true;

            done();

        });

        //TODO: add more tests, there were no tests for dynamic EPA for create decision

        describe('create decision', function () {

            it('should successfully create if questionnaire', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:['0'], args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);



                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviour', subType:'questionnaire', setupInputs: {answers: [2]}}
                };

                var expectedFirstDecision = {
                    'name': 'decision for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]==2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:==#value:1'
                };

                var expectedSecondDecision = {
                    'name': 'opposing decisions for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]!=2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:!=#value:1'
                };

                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.calledTwice;
                    stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
            it('should successfully create if No decision element found in ep', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:['0'], args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);



                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviour', subType:'questionnaire', setupInputs: {answers: [0]}}
                };

                var expectedFirstDecision = {
                    'name': 'decision for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]==2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:==#value:1'
                };

                var expectedSecondDecision = {
                    'name': 'opposing decisions for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]!=2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:!=#value:1'
                };

                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.not.calledOnce;
                    //stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    // stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
            it('should successfully create if recharge', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:'1', args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);



                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviouor', subType:'recharge'}
                };





                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.calledTwice;
                    // stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    //stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
            it('should successfully create if recharge', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:'', args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);



                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviouor', subType:'recharge'}
                };





                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.calledTwice;
                    // stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    //stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
            it('should successfully create if type_id instanceof Array === fals', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:'1', args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);



                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviour', subType:'questionnaire', setupInputs: {answers:[2]}}
                };

                var expectedFirstDecision = {
                    'name': 'decision for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]==2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:==#value:1'
                };



                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.calledOnce;
                    // stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    //stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
            it('should successfully create if selectedOp >=', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:['0'], args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);



                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviour', subType:'questionnaire', setupInputs: {answers: [2]}}
                };

                var expectedFirstDecision = {
                    'name': 'decision for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]==2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:==#value:1'
                };

                var expectedSecondDecision = {
                    'name': 'opposing decisions for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]!=2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:!=#value:1'
                };

                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.calledTwice;
                    stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
            it('should successfully create if selectedOp <=', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:['0'], args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);



                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviour', subType:'questionnaire', setupInputs: {answers: [2]}}
                };

                var expectedFirstDecision = {
                    'name': 'decision for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]==2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:==#value:1'
                };

                var expectedSecondDecision = {
                    'name': 'opposing decisions for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]!=2',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:2#operation:!=#value:1'
                };

                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.calledTwice;
                    stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
            it('should successfully create if selectedOp ==', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                var decRef = {
                    decRef:'1123',
                    path1 : {
                        patternComponents : {
                            id : 4,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    path2 : {
                        patternComponents : {
                            id : 5,
                            layout : ''
                        },

                        imageCounter : 0,
                        videoCounter : 0,
                        textCounter : 0,
                        linksCounter : 0,
                        multiMediaList: ko.observableArray([])
                    },

                    selectedAnswer : ko.observable('2')
                };

                var element = {type_id:['0','1'], args: { decRef:'1123' }};

                // sandbox.stub(dpa_VM,'decisionElements').returns([decRef]);


                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, 'create');
                stub1.yields({responseText: 'text'},{responseText: 'text'});
                var params = {
                    intelligence: '1',
                    bussnessRule: {elementType: 'behaviour', subType:'questionnaire', setupInputs: {answers: [0]}}
                };

                var expectedFirstDecision = {
                    'name': 'decision for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]<=0',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:1#operation:<=#value:1'
                };

                var expectedSecondDecision = {
                    'name': 'opposing decisions for ep',
                    'location': 'sc:'+sc.id+'/intelligence:1/id=key',
                    'context': 'service',
                    'actionType': 'not-used',
                    'action': '',
                    'arguments': 'key',
                    'condition': 'intel.responses[0].answers[0]>0',
                    'workaroundcondition': '#sc:'+sc.id+'/intelligence:1#operation:>#value:1'
                };

                bcAuthVM.createDecision(sc, element, params, function(){
                    stub1.should.have.been.not.called;
                    //stub1.getCall(0).should.have.calledWith(mockMainVM.repo,expectedFirstDecision,sc.id);
                    // stub1.getCall(1).should.have.calledWith(mockMainVM.repo,expectedSecondDecision,sc.id);
                    done();
                });

            });
        });
        describe('create Intelligence', function () {
            it('fails', function(done) {
                var element = {type_id:'0'};
                //mockMainVM.selectedEPoint = ko.observable('McQ Questionnaire');
                mockMainVM.engagementPoints = JSON.parse(epTest);
                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, 'addIntelligence');
                stub1.callsArgWith(2, 'intelID');
                bcAuthVM.createIntelligence(dexit.test.smartcontent, element, function(){});
                expect(stub1.calledOnce).to.be.true;

                done();

            });
            it('successful', function(done) {
                var element = {type_id:'0'};
                // mockMainVM.selectedEPoint = ko.observable('McQ Questionnaire');
                mockMainVM.engagementPoints = JSON.parse(epTest);
                var stub1 = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, 'addIntelligence');
                stub1.callsArgWith(2, null, 'intelID');
                bcAuthVM.createIntelligence(dexit.test.smartcontent, element, function(){});
                expect(stub1.calledOnce).to.be.true;
                done();

            });
        });


        it('create image MultiMedia with dynamic MM object', function(done) {
            var element = {id: '1', type_id:'0'};
            var stub1 = sandbox.stub(mockDcmManagement, 'createMultimedia');
            stub1.callsArgWith(4, null, true);
            var dynamicMMObject = [{type: 'image', value: ko.observable('testUrl1')},{type: 'image', value: ko.observable('testUrl2')},{type: 'image', value: ko.observable('testUrl3')}];
            bcAuthVM.createMultiMedia(dexit.test.smartcontent, element.id, dynamicMMObject, function(){});
            expect(stub1.callCount).to.be.eql(3);

            done();

        });
        it('create video MultiMedia with dynamic MM object', function(done) {
            var element = {id: '1', type_id:'0'};
            var stub1 = sandbox.stub(mockDcmManagement, 'createMultimedia');
            var dynamicMMObject = [{type: 'image', value: ko.observable('testUrl1')},{type: 'image', value: ko.observable('testUrl2')},{type: 'image', value: ko.observable('testUrl3')}];
            stub1.callsArgWith(4, null);
            bcAuthVM.createMultiMedia(dexit.test.smartcontent, element.id, dynamicMMObject, function(){});
            expect(stub1.callCount).to.be.eql(3);

            done();

        });

        it('create text MultiMedia with dynamic MM object', function(done) {
            var element = {id: '1', type_id:'0'};
            var stub1 = sandbox.stub(mockDcmManagement, 'createMultimedia');
            var dynamicMMObject = [{type: 'image', value: ko.observable('testUrl1')},{type: 'image', value: ko.observable('testUrl2')},{type: 'image', value: ko.observable('testUrl3')}];
            stub1.callsArgWith(4, null);
            bcAuthVM.createMultiMedia(dexit.test.smartcontent, element.id, dynamicMMObject, function(){});
            expect(stub1.callCount).to.be.eql(3);

            done();

        });

        it('create links MultiMedia with dynamic MM object', function(done) {
            var element = {id: '1', type_id:'0'};
            var stub1 = sandbox.stub(mockDcmManagement, 'createMultimedia');
            var dynamicMMObject = [{type: 'link', value: ko.observable('https://s3.amazonaws.com/tenant.dexitco.dexit.co/AFIBasicsHandbook.pdf')},{type: 'link', value: ko.observable('https://s3.amazonaws.com/tenant.dexitco.dexit.co/Handbook.pdf')}];
            stub1.callsArgWith(4, null);
            bcAuthVM.createMultiMedia(dexit.test.smartcontent, element.id, dynamicMMObject, function(){});
            expect(stub1.callCount).to.be.eql(2);

            done();

        });

        describe('createBehaviorForBCi', function () {

            it('should return error for missing parameter: id', function (done) {

                var behReq = {
                    'a':'a',
                    'items': ['a','b']
                };


                var params = {
                    type: 'Merch',
                    behaviourReq: behReq
                };
                var spy = sandbox.spy(dexit.app.ice.integration.bcp,'createBCBehaviour');

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    spy.should.not.have.been.called;
                    should.not.exist(result);
                    should.exist(err);
                    done();
                });
            });

            it('should return error for missing parameter:params.behReq', function (done) {

                var params = {
                    id: 'id',
                    type: 'Merch'
                };
                var spy = sandbox.spy(dexit.app.ice.integration.bcp,'createBCBehaviour');

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    spy.should.not.have.been.called;
                    should.not.exist(result);
                    should.exist(err);
                    done();
                });
            });

            it('should return error for missing parameter: type ', function (done) {

                var behReq = {
                    'a':'a',
                    'items': ['a','b']
                };
                var params = {
                    id: 'id',
                    behaviourReq: behReq
                };
                var spy = sandbox.spy(dexit.app.ice.integration.bcp,'createBCBehaviour');

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    spy.should.not.have.been.called;
                    should.not.exist(result);
                    should.exist(err);
                    done();
                });
            });



            it('should handle properties with arrays (of objects)', function (done) {

                var behReq = {
                    'a':'a',
                    'items': [{'id':1},{'id':2}]
                };

                var params = {
                    id: 'id',
                    type: 'smartcontentcontainer',
                    behaviourReq: behReq
                };
                var stub = sandbox.stub(dexit.app.ice.integration.bcp,'createBCBehaviour').yields(null,{'id':'id'});

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    stub.should.have.been.calledOnce;
                    stub.should.have.been.calledWith(params);
                    should.not.exist(err);
                    should.exist(result);
                    done();
                });
            });

            it('should handle properties with arrays (of strings)', function (done) {

                var behReq = {
                    'a':'a',
                    'items': ['a','b']
                };


                var params = {
                    id: 'id',
                    type: 'smartcontentcontainer',
                    behaviourReq: behReq
                };
                var stub = sandbox.stub(dexit.app.ice.integration.bcp,'createBCBehaviour').yields(null,{'id':'id'});

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    stub.should.have.been.calledOnce;
                    stub.should.have.been.calledWith(params);
                    should.not.exist(err);
                    should.exist(result);
                    done();
                });
            });


            it('should handle properties of objects (non-arrays)', function (done) {
                var behReq = {
                    item:'a',
                    body: {'id':1}
                };

                var params = {
                    id: 'id',
                    type: 'smartcontentcontainer',
                    behaviourReq: behReq
                };
                var stub = sandbox.stub(dexit.app.ice.integration.bcp,'createBCBehaviour').yields(null,{'id':'id'});

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    stub.should.have.been.calledOnce;
                    stub.should.have.been.calledWith(params);
                    should.not.exist(err);
                    should.exist(result);
                    done();
                });
            });

            it('should handle pass through strings', function (done) {
                var behReq = {
                    'item':'a',
                    'other':'b'
                };
                var params = {
                    id: 'id',
                    type: 'smartcontentcontainer',
                    behaviourReq: behReq
                };
                var stub = sandbox.stub(dexit.app.ice.integration.bcp,'createBCBehaviour').yields(null,{'id':'id'});

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    stub.should.have.been.calledOnce;
                    stub.should.have.been.calledWith(params);
                    should.not.exist(err);
                    should.exist(result);
                    done();
                });
            });

            it('should return error if request fails', function (done) {
                var behReq = {
                    'item':'a',
                    'other':'b'
                };
                var params = {
                    id: 'id',
                    type: 'smartcontentcontainer',
                    behaviourReq: behReq
                };
                var stub = sandbox.stub(dexit.app.ice.integration.bcp,'createBCBehaviour').yields(true,null);

                bcAuthVM.createBehaviorForBCi(params, function (err, result) {
                    stub.should.have.been.calledOnce;
                    stub.should.have.been.calledWith(params);
                    should.exist(err);
                    should.not.exist(result);
                    done();
                });
            });



        });


    });

})();
