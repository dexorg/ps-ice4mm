/**
 * @copyright Digital Engagement Xperience 2016-2017
 * @description unit tests for bcAuthoringVM
 */

/*global _, ko, dexit, chai */

(function () {
    'use strict';

    var should = chai.Should();

    var ice4mBCs = '[{"name": "Merchandising", "bctype":["MerchandisingCampaign"]}]';

    var mockDcmManagement = {
        createMultimedia: function(mmType, value, name, scId, callback) {}
    };

    var mockMainVM = {
        selectedSC: function (data) {},
        repo: 'test',
        functionality:'ice4mm',
        selectedCourse: function () {

        },
        userProfile: function () {
            return {
                attributes: {
                    firstname: 'test',
                    lastname: 'test'
                }
            };
        }
    };

    describe('BC Auth', function () {
        var theCourse, bcAuthVM, sandbox, epTest;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theCourse = new dexit.test.Course();
            epTest = '{"McQ Questionnaire":[{"id":"post_questionnaire","name":"post_questionnaire","resource":"questionnaire","path_template":"/questionnaire","action":"POST","args":[":title=:title",":description=:description",":allowAnonymous=:allowAnonymous",":prompt=:prompt",":type=:type",":options=:options"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"title":":title","description":":description","allowAnonymous":":allowAnonymous","questions":[{"prompt":":prompt","type":":type","options":":options"}]}},{"id":"get_questionnaire","name":"get_questionnaire","resource":"questionnaire","path_template":"/questionnaire/:questionnaire_id","action":"GET","args":[":questionnaire_id=:questionnaire_id"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"questionnaire_id":": questionnaire_id"}},{"id":"delete_questionnaire","name":"delete_questionnaire","resource":"questionnaire","path_template":"/questionnaire/:questionnaire_id","action":"DELETE","args":[":questionnaire_id=:questionnaire_id"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"questionnaire_id":": questionnaire_id"}},{"id":"questionnaire-count","name":"questionnaire-count","resource":"questionnaire","path_template":"/questionnaire/:questionnaire_id/count","action":"GET","args":[":questionnaire_id=:questionnaire_id"],"location":"870dd9bb-cff1-49a9-a44f-b30e71c6f36b","type":"service","body":{"questionnaire_id":":questionnaire_id"}}],"Multiple Choice":[{"id":"multipleChoiceFeedback_device","name":"multipleChoiceFeedback","resource":"multipleChoiceFeedback","action":"multipleChoiceFeedback","context":"Device","args":["question","options"],"location":"ee4e5b54-07fe-4e87-8df5-7c88a338b2ea","type":"service"}]}';
            bcAuthVM = new dexit.app.ice.edu.bcAuthoring.BCAuthoringVM({mainVM: mockMainVM, dcmManagement:mockDcmManagement});
        });
        afterEach( function() {
            sandbox.restore();
        });

        describe('Capture Layout', function() {


            it('should fail if unable to create new layout', function(done){

                var sc = _.clone(dexit.test.smartcontent);

                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.layout, 'create');
                var stub3 = sandbox.stub(bcAuthVM, 'generateLayout').returns('');
                bcAuthVM.propertyTextValue = ko.observableArray(['title']);
                var dynamicEPAStructure = [{multiMediaList: ko.observableArray([{type:'image',value:ko.observable('https://s3.amazonaws.com/tenant.dexitco.dexit.co/bat-supe4.jpg')}]), 'componentIndex':0,elementType:'multimedia','imageCounter':1,'videoCounter':0,'textCounter':0,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia'}},
                    {'componentIndex':1,'elementType':'questionnaire','patternComponents':{'id':2,'type':'behaviour','layout':'<texarea data-mm-tag="mm-question-200">question</textarea><textarea data-mm-tag="mm-choices-0">a1</textarea><textarea data-mm-tag="mm-choices-1">a2</textarea>'},'answerCounter':2,'questionComponents':{}},
                    {'componentIndex':2,'elementType':'chat','patternComponents':{'id':3,'type':'behaviour','layout':''},'chatComponents':{}}];
                stub1.callsArgWith(3, true, null);
                bcAuthVM.captureDynamicLayout(sc, dynamicEPAStructure, {id:'test-uuid'}, 'ucc', null, function (err, layout) {
                    should.exist(err);
                    should.not.exist(layout);

                    stub1.should.have.been.calledOnce;
                    //would be good to have some verification on correct body being generated
                    stub1.should.have.been.calledWith(mockMainVM.repo,sinon.match.object,sc.id);
                    done();
                });

            });

            it('should be successful', function(done){
                var sc = _.clone(dexit.test.smartcontent);

                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.layout, 'create');
                var stub3 = sandbox.stub(bcAuthVM, 'generateLayout');
                bcAuthVM.propertyTextValue(['title']);
                var dynamicEPAStructure = [{'multiMediaList': ko.observableArray([{'type':'image','value':ko.observable('https://s3.amazonaws.com/tenant.dexitco.dexit.co/bat-supe4.jpg')}]), 'componentIndex':0,'elementType':'multimedia','imageCounter':1,'videoCounter':0,'textCounter':0,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia','layout':'<img src="https://s3.amazonaws.com/tenant.dexitco.dexit.co/bat-supe4.jpg" alt="element mm" data-mm-tag="ep-1-mm-image-0">'}},
                    {'componentIndex':1,'elementType':'questionnaire','patternComponents':{'id':2,'type':'behaviour','layout':'<texarea data-mm-tag="mm-question-200">question</textarea><textarea data-mm-tag="mm-choices-0">a1</textarea><textarea data-mm-tag="mm-choices-1">a2</textarea>'},'answerCounter':2,'questionComponents':{}},
                    {'componentIndex':2,'elementType':'chat','patternComponents':{'id':3,'type':'behaviour','layout':''},'chatComponents':{}}];
                stub1.callsArgWith(3, null, []);
                bcAuthVM.captureDynamicLayout(sc, dynamicEPAStructure, {id:'test-uuid'}, 'ucc', null, function (err, layout) {
                    should.not.exist(err);
                    should.exist(layout);

                    stub1.should.have.been.calledOnce;
                    //would be good to have some test addEntry function when element type is multimediaverification on correct body being generated
                    stub1.should.have.been.calledWith(mockMainVM.repo,sinon.match.object,sc.id);

                    done();
                });
            });

            it('should fail if unable to update existing layout', function(done){
                var sc = _.clone(dexit.test.smartcontent);
                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.layout, 'create');
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.layoutmanagement, 'updateLayout').yields(new Error('uh oh'));
                bcAuthVM.propertyTextValue(['title']);
                var dynamicEPAStructure = [{'multiMediaList': ko.observableArray([{'type':'image','value':'https://s3.amazonaws.com/tenant.dexitco.dexit.co/bat-supe4.jpg'}]), 'componentIndex':0,'elementType':'multimedia','imageCounter':1,'videoCounter':0,'textCounter':0,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia','layout':'<img src="https://s3.amazonaws.com/tenant.dexitco.dexit.co/bat-supe4.jpg" alt="element mm" data-mm-tag="ep-1-mm-image-0">'}},
                    {'componentIndex':1,'elementType':'questionnaire','patternComponents':{'id':2,'type':'behaviour','layout':'<texarea data-mm-tag="mm-question-200">question</textarea><textarea data-mm-tag="mm-choices-0">a1</textarea><textarea data-mm-tag="mm-choices-1">a2</textarea>'},'answerCounter':2,'questionComponents':{}},
                    {'componentIndex':2,'elementType':'chat','patternComponents':{'id':3,'type':'behaviour','layout':''},'chatComponents':{}}];

                bcAuthVM.captureDynamicLayout(sc, dynamicEPAStructure, {id:1}, 'ucc', '1', function (err, layout) {
                    should.exist(err);
                    should.not.exist(layout);

                    stub1.should.not.have.been.called;
                    stub2.should.have.been.calledOnce;
                    stub2.should.have.been.calledWith('1',sinon.match.object.and(sinon.match.has('content')));
                    done();

                });
            });

            it('should be successful updating existing layout', function(done){
                var sc = _.clone(dexit.test.smartcontent);

                var stub1 = sandbox.stub(dexit.scm.dcm.integration.sc.layout, 'create');
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.layoutmanagement, 'updateLayout').yields(null,[]);

                bcAuthVM.propertyTextValue(['title']);
                var dynamicEPAStructure = [{'multiMediaList': ko.observableArray([{'type':'image','value':'https://s3.amazonaws.com/tenant.dexitco.dexit.co/bat-supe4.jpg'}]), 'componentIndex':0,'elementType':'multimedia','imageCounter':1,'videoCounter':0,'textCounter':0,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia','layout':'<img src="https://s3.amazonaws.com/tenant.dexitco.dexit.co/bat-supe4.jpg" alt="element mm" data-mm-tag="ep-1-mm-image-0">'}},
                    {'componentIndex':1,'elementType':'questionnaire','patternComponents':{'id':2,'type':'behaviour','layout':'<texarea data-mm-tag="mm-question-200">question</textarea><textarea data-mm-tag="mm-choices-0">a1</textarea><textarea data-mm-tag="mm-choices-1">a2</textarea>'},'answerCounter':2,'questionComponents':{}},
                    {'componentIndex':2,'elementType':'chat','patternComponents':{'id':3,'type':'behaviour','layout':''},'chatComponents':{}}];
                bcAuthVM.captureDynamicLayout(sc, dynamicEPAStructure, {id:1}, 'ucc', '1', function (err, layout) {
                    should.not.exist(err);
                    should.exist(layout);

                    stub1.should.not.have.been.called;
                    stub2.should.have.been.calledOnce;
                    stub2.should.have.been.calledWith('1',sinon.match.object.and(sinon.match.has('content')));

                    done();

                });
            });
        });


        describe('Validate Title', function () {

            it('should set true for valid and unique title (for edit)', function () {
                //setup
                var selectedCourse = {
                    courseVM: {
                        tempCards: function () {
                            return [
                                {
                                    sc: function () {
                                        return {
                                            property: {
                                                'name':'a'
                                            }
                                        };
                                    }
                                }
                            ];
                        }
                    }
                };
                var selectedWidget = {name: ko.observable('name')};
                var modalOperation = 'Edit';
                var dummyElement = {
                    value:'expected',
                    classList: {
                        remove: function (val) {

                        },
                        add: function (val) {

                        }
                    },
                    parentNode: {
                        classList: {
                            remove: function (val) {

                            },
                            add: function (val) {

                            }
                        }
                    }
                };

                sandbox.stub(dpa_VM,'validTitle');
                bcAuthVM.validateTitle(dummyElement,selectedCourse,selectedWidget,modalOperation);

                dpa_VM.validTitle.should.have.been.calledOnce;

                var result = bcAuthVM.validTitle();
                result.should.be.true;
            });



            it('should set true if same title is set (for edit)', function () {
                //setup
                var selectedCourse = {
                    courseVM: {
                        tempCards: function () {
                            return [
                                {
                                    sc: function () {
                                        return {
                                            property: {
                                                'name':'a'
                                            }
                                        };
                                    }
                                }
                            ];
                        }
                    }
                };
                var selectedWidget = {name: ko.observable('expected')};
                var modalOperation = 'Edit';
                var dummyElement = {
                    value:'expected',
                    classList: {
                        remove: function (val) {

                        },
                        add: function (val) {

                        }
                    },
                    parentNode: {
                        classList: {
                            remove: function (val) {

                            },
                            add: function (val) {

                            }
                        }
                    }
                };

                sandbox.stub(dpa_VM,'validTitle');
                bcAuthVM.validateTitle(dummyElement,selectedCourse,selectedWidget,modalOperation);

                dpa_VM.validTitle.should.have.been.calledOnce;
                dpa_VM.validTitle.should.have.been.calledWith(true);

                var result = bcAuthVM.validTitle();
                result.should.be.true;
            });


            it('should set false if title name already taken(for create)', function () {
                //setup
                var selectedCourse = {
                    courseVM: {
                        tempCards: function () {
                            return [
                                {
                                    sc: function () {
                                        return {
                                            property: {
                                                'name':'taken'
                                            }
                                        };
                                    }
                                }
                            ];
                        }
                    }
                };
                var selectedWidgetName = 'name';
                var modalOperation = 'Create';
                var dummyElement = {
                    value:'taken',
                    classList: {
                        remove: function (val) {

                        },
                        add: function (val) {

                        }
                    },
                    parentNode: {
                        classList: {
                            remove: function (val) {

                            },
                            add: function (val) {

                            }
                        }
                    }
                };
                sandbox.stub(dpa_VM,'validTitle');
                bcAuthVM.validateTitle(dummyElement,selectedCourse,selectedWidgetName,modalOperation);
                dpa_VM.validTitle.should.have.been.calledOnce;
                dpa_VM.validTitle.should.have.been.calledWith(false);
                var result = bcAuthVM.validTitle();
                result.should.be.false;
            });

        });

    });

})();
