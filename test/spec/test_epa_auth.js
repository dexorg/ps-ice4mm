/**
 * Copyright Digital Engagement Xperiance
 * Date: 19/09/16
 * @author Yu Zhao
 * @description
 */
/*global dpa_VM, ko, dexit, sinon */

(function () {
    'use strict';

    var should = chai.should();
    var expect = chai.expect;

    describe('Test epa_auth', function () {
        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });
        afterEach(function () {
            sandbox.restore();
        });

        it('test the ability to return element type', function (done) {
            var temp = {
                elementType: 'div'
            };
            dpa_VM.templateType(temp);
            done();
        });

        it('test addEntry function when element type is multimedia', function (done) {
            var stub1 = sandbox.stub(dpa_VM, 'updateLayoutProperty');
            dpa_VM.addEntry('multimedia', 'chat', 'a-video', '');
            expect(stub1.called).to.be.true;
            done();
        });

        it('test addEntry function when element type is behavior and sub type is chat', function (done) {
            dpa_VM.addEntry('behaviour', 'chat');
            done();
        });

        it('test addEntry function when element type is behavior and sub type is questionnaire', function (done) {
            dpa_VM.addEntry('behaviour', 'questionnaire');
            done();
        });

        it('test addEntry function when element type is behavior and sub type is groupchat', function (done) {
            var spy1 = sandbox.spy(dpa_VM, 'addEntry');
            dpa_VM.addEntry('behaviour', 'groupchat');
            expect(spy1.returnValues[0].subType).to.eql('groupchat');
            expect(spy1.returnValues[0].elementType).to.eql('behaviour');
            done();
        });

        it('test addEntry function when element type is behavior and sub type is recharge', function (done) {
            var spy1 = sandbox.spy(dpa_VM, 'addEntry');
            dpa_VM.addEntry('behaviour', 'recharge');
            expect(spy1.returnValues[0].subType).to.eql('recharge');
            expect(spy1.returnValues[0].elementType).to.eql('behaviour');
            done();
        });

        it('test addEntry function when element type is behavior and sub type is evoucher', function (done) {
            var spy1 = sandbox.spy(dpa_VM, 'addEntry');
            dpa_VM.addEntry('behaviour', 'evoucher');
            expect(spy1.returnValues[0].subType).to.eql('evoucher');
            expect(spy1.returnValues[0].elementType).to.eql('behaviour');
            done();
        });

        it('test addEntry function when element type is behavior and sub type is eorder', function (done) {
            var spy1 = sandbox.spy(dpa_VM, 'addEntry');
            dpa_VM.addEntry('behaviour', 'eorder');
            expect(spy1.returnValues[0].subType).to.eql('eorder');
            expect(spy1.returnValues[0].elementType).to.eql('behaviour');
            done();
        });

        it('test addEntry function when element type is decision', function (done) {
            dpa_VM.addEntry('decision');
            done();
        });


        it.skip('the ability to handle add entry', function (done) {
            $(document.body).append('<button id = \'btn1\' class = \'ep-auth-container\' data-toggle = \'popover\'></button><i class=\'fa fa-trash remove-decision\' data-toggle = \'popover\'></i><i class=\'fa fa-trash remove-rule\' data-toggle = \'popover\'></i>');
            $('#btn1').popover();
            var testElement = {
                'componentIndex': 2,
                'elementType': 'questionnaire',
                'renderType': 'questionnaire',
                'patternComponents': {
                    'id': 3,
                    'type': 'behaviour',
                    'layout': '<texarea data-mm-tag=\'mm-question-200\'>test1</textarea><textarea data-mm-tag=\'mm-choices-0\'>test2</textarea><textarea data-mm-tag=\'mm-choices-1\'>test3</textarea>'
                },
                'answerCounter': 2,
                'questionComponents': {},
                'decRef': null
            };
            var stub1 = sandbox.stub(ko, 'applyBindings');
            dpa_VM.afterAddHandler(testElement);
            expect(stub1.calledTwice).to.be.true;
            done();
        });


        it('test getUsersPerRoom function-- groupChat', function (done) {
            $(document.body).append('<textarea id=\'chatUserPerRoom\' class=\'flex-textarea chat-input chat-users-per-room\' type=\'text\'></textarea><span class=\'pull-right number-users\'></span>');
            var testData = {
                chatComponents: {
                    chatRoomName: ko.observable(),
                    chatRoomDesc: ko.observable(),
                    numberOfRooms: ko.observable(2),
                    passWord: ko.observable(),
                    users: ko.observableArray(['email1', 'email2', 'email3', 'email4'])

                },
                elementType: 'groupchat'
            };
            var element = document.querySelector('.chat-users-per-room');
            dpa_VM.getUsersPerRoom(element, testData);
            expect(element.nextElementSibling.innerHTML).to.be.eql('(2 users per room)');
            done();
        });

        it('test removeItem function', function (done) {
            $(document.body).append('<div class = \'drop-here paper ko_container ui-sortable\'><div class = \'beh-element-wrapper text-center\' style = \'position: relative; left: 0px; top: 0px;\'></div><div class = \'mm-element-wrapper text-center\' style = \'position: relative; left: 30px; top: 30px;\'></div></div>');
            var testItem = document.querySelector('.beh-element-wrapper');

            dpa_VM.removeItem(testItem);

            done();
        });


        it('test removeEntry function', function (done) {

            var testEntry = {
                componentIndex: 1, elementTynComponents: {}, validComponent: function () {
                }
            };
            dpa_VM.counter = 1;
            dpa_VM.removeEntry(testEntry);
            expect(dpa_VM.counter).to.be.eql(0);

            done();
        });


        it.skip('test editEntry function', function (done) {
            var testEntry = 'abc';
            dpa_VM.editEntry(testEntry);
            expect(dpa_VM.currentElement().length).to.be.above(0);
            done();
        });

        it('test updateLayoutProperty function when multimedia type is image', function (done) {
            var testEntry = {
                componentIndex: 2,
                elementType: 'multimedia',
                imageCounter: 2,
                linksCounter: 0,
                multiMediaList: ko.observableArray([{type: 'image', value: ko.observable('https://bat-supe3.jpg')}]),
                patternComponents: {id: 3, layout: '', type: 'multimedia'},
                textCounter: 0,
                validComponent: ko.observable(),
                videoCounter: 0
            };
            dpa_VM.updateLayoutProperty(testEntry);
            done();
        });

        it('test updateLayoutProperty function when multimedia type is video', function (done) {
            var testEntry = {
                componentIndex: 2,
                elementType: 'multimedia',
                imageCounter: 2,
                linksCounter: 0,
                multiMediaList: ko.observableArray([{type: 'video', value: ko.observable('https://testvideo')}]),
                patternComponents: {id: 3, layout: '', type: 'multimedia'},
                textCounter: 0,
                validComponent: ko.observable(),
                videoCounter: 0
            };
            dpa_VM.updateLayoutProperty(testEntry);
            done();
        });

        it('test updateLayoutProperty function when multimedia type is link', function (done) {
            var testEntry = {
                componentIndex: 2,
                elementType: 'multimedia',
                imageCounter: 2,
                linksCounter: 0,
                multiMediaList: ko.observableArray([{type: 'link', value: ko.observable('https://testlink')}]),
                patternComponents: {id: 3, layout: '', type: 'multimedia'},
                textCounter: 0,
                validComponent: ko.observable(),
                videoCounter: 0
            };
            dpa_VM.updateLayoutProperty(testEntry);
            done();
        });

        it('test updateLayoutProperty function when multimedia type is text', function (done) {
            var testEntry = {
                componentIndex: 2,
                elementType: 'multimedia',
                imageCounter: 2,
                linksCounter: 0,
                multiMediaList: ko.observableArray([{type: 'text', value: ko.observable('https://testtext')}]),
                patternComponents: {id: 3, layout: '', type: 'multimedia'},
                textCounter: 0,
                validComponent: ko.observable(),
                videoCounter: 0
            };
            dpa_VM.updateLayoutProperty(testEntry);
            done();
        });


        it('test allowDragOver function', function (done) {
            $(document.body).append('<img alt=\'select image\' src=\'https://testimg.jpg\' data-bind=\'event: { dragstart: dpa_VM.dragStarted.bind($data, $parent, $element) }, attr:{src: $data}\'>');
            var testimg = document.querySelector('img');
            dpa_VM.allowDragOver(testimg, {
                preventDefault: function () {
                }
            });
            done();
        });


        it('allowDrop -  allow drop the dragged element', function(done){
            /* created by SE  03/27/2017
             Functional & Structural unit testing
             Description: To enable dropping off the element after DragOver. it sets drop to Ture
             */
            var testEntry=false;
            testEntry=dpa_VM.allowDrop();
            expect(testEntry).to.be.true;
            done();

        });



        // describe('targetPopover', function() {
        //     it('Should be successful to retrieve reference when target entry', function(done) {
        //         var data_test = {
        //                 'componentIndex': 0,
        //                 'elementType': 'questionnaire',
        //                 'renderType': 'questionnaire',
        //                 'patternComponents': {
        //                     'id': 1,
        //                     'type': 'behaviour',
        //                     'layout': ''
        //                 },
        //                 'answerCounter': 0,
        //                 'questionComponents': {},
        //                 decRef: 'ref'
        //             },
        //             class_test = 'qs',
        //             element_test = {},
        //             event_test = {},
        //             decision_test = {
        //                 decRef: 'ref',
        //
        //                 path1: {
        //                     patternComponents: {
        //                         id: dpa_VM.currentElement().componentIndex + 4,
        //                         layout: ''
        //                     },
        //                     behaviourReference: ko.observable('reference'),
        //                     imageCounter: 0,
        //                     videoCounter: 0,
        //                     textCounter: 0,
        //                     linksCounter: 0,
        //                     multiMediaList: ko.observableArray([])
        //                 },
        //
        //                 path2: {
        //                     patternComponents: {
        //                         id: dpa_VM.currentElement().componentIndex + 5,
        //                         layout: ''
        //                     },
        //
        //                     imageCounter: 0,
        //                     videoCounter: 0,
        //                     textCounter: 0,
        //                     linksCounter: 0,
        //                     multiMediaList: ko.observableArray([])
        //                 },
        //
        //                 selectedAnswer: ko.observable('test1')
        //             };
        //         var stub1 = sandbox.stub(dpa_VM, 'generateRandomSlug');
        //         var stub2 = sandbox.stub(dpa_VM, 'generateDecision');
        //
        //         dpa_VM.decisionElements().push(decision_test);
        //         dpa_VM.targetPopover(class_test, data_test, event_test, element_test);
        //         expect(dpa_VM.editingDecision()).to.eql.true;
        //         expect(dpa_VM.addingDecision()).to.eql.true;
        //         expect(stub1.called).to.be.false;
        //         expect(stub2.called).to.be.false;
        //
        //         done();
        //     });
        //     it('Should be successful to create reference when target entry', function(done) {
        //         var data_test = {
        //                 'componentIndex': 0,
        //                 'elementType': 'questionnaire',
        //                 'renderType': 'questionnaire',
        //                 'patternComponents': {
        //                     'id': 1,
        //                     'type': 'behaviour',
        //                     'layout': ''
        //                 },
        //                 'answerCounter': 0,
        //                 'questionComponents': {}
        //             },
        //             class_test = 'qs',
        //             element_test = {},
        //             event_test = {},
        //             decision_test = {
        //                 decRef: 'ref',
        //
        //                 path1: {
        //                     patternComponents: {
        //                         id: dpa_VM.currentElement().componentIndex + 4,
        //                         layout: ''
        //                     },
        //                     behaviourReference: ko.observable('reference'),
        //                     imageCounter: 0,
        //                     videoCounter: 0,
        //                     textCounter: 0,
        //                     linksCounter: 0,
        //                     multiMediaList: ko.observableArray([])
        //                 },
        //
        //                 path2: {
        //                     patternComponents: {
        //                         id: dpa_VM.currentElement().componentIndex + 5,
        //                         layout: ''
        //                     },
        //
        //                     imageCounter: 0,
        //                     videoCounter: 0,
        //                     textCounter: 0,
        //                     linksCounter: 0,
        //                     multiMediaList: ko.observableArray([])
        //                 },
        //
        //                 selectedAnswer: ko.observable('test1')
        //             };
        //         var stub1 = sandbox.stub(dpa_VM, 'generateRandomSlug');
        //         var stub2 = sandbox.stub(dpa_VM, 'generateDecision');
        //
        //         dpa_VM.decisionElements().push(decision_test);
        //         dpa_VM.targetPopover(class_test, data_test, event_test, element_test);
        //         expect(dpa_VM.editingDecision()).to.eql.false;
        //         expect(dpa_VM.addingDecision()).to.eql.false;
        //         expect(stub1.called).to.be.true;
        //         expect(stub2.called).to.be.true;
        //
        //         done();
        //     });
        // });

        describe('editTextInWindow', function() {
            it('Should be able to edit text', function(done) {
                dpa_VM.editTextInWindow('test text', 'path1');
                expect(dpa_VM.editingDecisionText()).to.be.true;
                done();
            });
        });
        describe('showTextReference', function() {
            it('ability to show text reference', function(done) {
                $('body').append('<div id=\'path1\' class=\'asset-ref showAsset\'><p>test</p>></div>');
                dpa_VM.showTextReference('test text', 'path1');
                $('.asset-ref-txt').should.exist;
                $('.asset-ref-sample').should.exist;
                $('.asset-ref-edit').should.exist;
                $('.asset-ref-label').should.exist;
                $('div#path1').hasClass('flex-txt-wrapper').should.eql(true);
                $('div#path1').hasClass('showAsset').should.eql(true);
                done();
            });
        });
        describe('addFromEdit',function() {
            it.skip('ability to add entry when edit text', function(done) {
                $('body').append('<ul class=\'flex-element-list\'></ul>>');
                dpa_VM.newEditEntry = {
                    'type': 'text'
                };
                dpa_VM.currentElement().multiMediaList = [];
                var stub1 = sandbox.stub(dpa_VM, 'updateLayoutProperty');
                dpa_VM.addFromEdit();
                expect(dpa_VM.currentElement().multiMediaList.length).should.increase;
                expect(stub1.called).to.be.true;
                done();
            });
        });

        // unit test cases
        //dropToInputScreen
        // done by KB Sept 22
        //w13
        // describe ('dropToInputScreen',function() {
        //     it('valid item & valid event', function(done) {
        //         // test input
        //         var item={templateType:'testemplateType',subtype:'testsubtype',renderType:'testrenderType',src:'testsrc',isBR:'testisBR'};
        //         var event={clientX:'testX',clientY:'testY'};
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function() {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function() {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns({element:'test'});
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         expect(stub1.called).to.be.true;
        //         expect(stub2.called).to.be.true;
        //         expect (stub1.calledOnce);
        //         expect(stub1.args[0][0]).is.equal('testemplateType');
        //         expect(stub1.args[0][1]).is.equal('testsubtype');
        //         expect(stub1.args[0][2]).is.equal('testrenderType');
        //         expect(stub1.args[0][3]).is.equal('testsrc');
        //         expect(stub1.args[0][4]).is.equal('testisBR');
        //
        //         expect (stub2.calledOnce);
        //         expect(stub2.args[0][0].x).is.equal('testX');
        //         expect(stub2.args[0][0].y).is.equal('testY');
        //
        //
        //
        //         expect (stub3.calledOnce);
        //         expect(stub3.args[0][0].localpoint).is.equal('test');
        //         expect(stub3.args[0][1].result).is.equal('test');
        //         //expect(stub3.args[0][1].localpoint).is.equal("test");
        //
        //
        //         expect(dpa_VM.currentItem).is.not.null;
        //         expect(dpa_VM.currentItem.element).is.equal('test');
        //         expect (stub4.calledOnce);
        //         expect(stub4.args[0][0].element).is.equal('test');
        //         done();
        //     });
        //     // this test is failed
        //     it('valid item & invalid event (null)', function() {
        //         // test input
        //         var item={templateType:'testemplateType',subtype:'testsubtype',renderType:'testrenderType',src:'testsrc',isBR:'testisBR'};
        //         var event=null;
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function() {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function() {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns({element:'test'});
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         //no event then exit
        //         expect(stub1.called).to.be.false;
        //         expect(stub2.called).to.be.false;
        //         expect(stub3.called).to.be.false;
        //         expect(stub4.called).to.be.false;
        //     });
        //     it('valid item & invalid event (empty) for dropToInputScreen', function(done) {
        //         // test input
        //         var item={templateType:'testemplateType',subtype:'testsubtype',renderType:'testrenderType',src:'testsrc',isBR:'testisBR'};
        //         var event={};
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function()
        //         {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function()
        //         {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns({element:'test'});
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         expect(stub1.called).to.be.true;
        //         expect(stub2.called).to.be.true;
        //         expect (stub1.calledOnce);
        //         expect(stub1.args[0][0]).is.equal('testemplateType');
        //         expect(stub1.args[0][1]).is.equal('testsubtype');
        //         expect(stub1.args[0][2]).is.equal('testrenderType');
        //         expect(stub1.args[0][3]).is.equal('testsrc');
        //         expect(stub1.args[0][4]).is.equal('testisBR');
        //
        //         expect (stub2.calledOnce);
        //         expect(stub2.args[0][0].x).is.undefined;
        //         expect(stub2.args[0][0].y).is.undefined;
        //
        //
        //
        //         expect (stub3.calledOnce);
        //         expect(stub3.args[0][0].localpoint).is.equal('test');
        //         expect(stub3.args[0][1].result).is.equal('test');
        //         //expect(stub3.args[0][1].localpoint).is.equal("test");
        //
        //
        //         expect(dpa_VM.currentItem).is.not.null;
        //         expect(dpa_VM.currentItem.element).is.equal('test');
        //         expect (stub4.calledOnce);
        //         expect(stub4.args[0][0].element).is.equal('test');
        //         done();
        //     });
        //     it('valid item & event with null properties', function(done) {
        //         // test input
        //         var item={templateType:'testemplateType',subtype:'testsubtype',renderType:'testrenderType',src:'testsrc',isBR:'testisBR'};
        //         var event={clientX:null,clientY:null};
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function()
        //         {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function()
        //         {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns({element:'test'});
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         expect(stub1.called).to.be.true;
        //         expect(stub2.called).to.be.true;
        //         expect (stub1.calledOnce);
        //         expect(stub1.args[0][0]).is.equal('testemplateType');
        //         expect(stub1.args[0][1]).is.equal('testsubtype');
        //         expect(stub1.args[0][2]).is.equal('testrenderType');
        //         expect(stub1.args[0][3]).is.equal('testsrc');
        //         expect(stub1.args[0][4]).is.equal('testisBR');
        //
        //         expect (stub2.calledOnce);
        //         expect(stub2.args[0][0].x).is.null;
        //         expect(stub2.args[0][0].y).is.null;
        //
        //
        //
        //         expect (stub3.calledOnce);
        //         expect(stub3.args[0][0].localpoint).is.equal('test');
        //         expect(stub3.args[0][1].result).is.equal('test');
        //         //expect(stub3.args[0][1].localpoint).is.equal("test");
        //
        //
        //         expect(dpa_VM.currentItem).is.not.null;
        //         expect(dpa_VM.currentItem.element).is.equal('test');
        //         expect (stub4.calledOnce);
        //         expect(stub4.args[0][0].element).is.equal('test');
        //         done();
        //     });
        //     // this test is failed
        //     it('invalid item (null) & valid event', function(done) {
        //         // test input
        //         var item=null;
        //         var event={clientX:'testX',clientY:'testY'};
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function()
        //         {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function()
        //         {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns({element:'test'});
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         //should exit on invalid input
        //         expect(stub1.called).to.be.false;
        //         expect(stub2.called).to.be.false;
        //         expect(stub3.called).to.be.false;
        //         expect(stub4.called).to.be.false;
        //         done();
        //     });
        //     it('empty item & valid event', function(done) {
        //         // test input
        //         var item={};
        //         var event={clientX:'testX',clientY:'testY'};
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function()
        //         {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function()
        //         {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns({element:'test'});
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         expect(stub1.called).to.be.true;
        //         expect(stub2.called).to.be.true;
        //         expect (stub1.calledOnce);
        //         expect(stub1.args[0][0]).is.equal(undefined);
        //         expect(stub1.args[0][1]).is.equal(undefined);
        //         expect(stub1.args[0][2]).is.equal(undefined);
        //         expect(stub1.args[0][3]).is.equal(undefined);
        //         expect(stub1.args[0][4]).is.equal(undefined);
        //
        //         expect (stub2.calledOnce);
        //         expect(stub2.args[0][0].x).is.equal('testX');
        //         expect(stub2.args[0][0].y).is.equal('testY');
        //
        //
        //
        //         expect (stub3.calledOnce);
        //         expect(stub3.args[0][0].localpoint).is.equal('test');
        //         expect(stub3.args[0][1].result).is.equal('test');
        //         //expect(stub3.args[0][1].localpoint).is.equal("test");
        //
        //
        //         expect(dpa_VM.currentItem).is.not.null;
        //         expect(dpa_VM.currentItem.element).is.equal('test');
        //         expect (stub4.calledOnce);
        //         expect(stub4.args[0][0].element).is.equal('test');
        //         done();
        //     });
        //     it('item with null properties & valid event', function(done) {
        //         // test input
        //         var item={templateType:null,subtype:null,renderType:null,src:null,isBR:null};
        //
        //         var event={clientX:'testX',clientY:'testY'};
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function()
        //         {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function()
        //         {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns({element:'test'});
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         expect(stub1.called).to.be.true;
        //         expect(stub2.called).to.be.true;
        //         expect (stub1.calledOnce);
        //         expect(stub1.args[0][0]).is.equal(null);
        //         expect(stub1.args[0][1]).is.equal(null);
        //         expect(stub1.args[0][2]).is.equal(null);
        //         expect(stub1.args[0][3]).is.equal(null);
        //         expect(stub1.args[0][4]).is.equal(null);
        //
        //         expect (stub2.calledOnce);
        //         expect(stub2.args[0][0].x).is.equal('testX');
        //         expect(stub2.args[0][0].y).is.equal('testY');
        //
        //
        //
        //         expect (stub3.calledOnce);
        //         expect(stub3.args[0][0].localpoint).is.equal('test');
        //         expect(stub3.args[0][1].result).is.equal('test');
        //         //expect(stub3.args[0][1].localpoint).is.equal("test");
        //
        //
        //         expect(dpa_VM.currentItem).is.not.null;
        //         expect(dpa_VM.currentItem.element).is.equal('test');
        //         expect (stub4.calledOnce);
        //         expect(stub4.args[0][0].element).is.equal('test');
        //         done();
        //     });
        //     it('Error returned element for dropToInputScreen', function(done) {
        //         // test input
        //         var item={templateType:'testemplateType',subtype:'testsubtype',renderType:'testrenderType',src:'testsrc',isBR:'testisBR'};
        //         var event={clientX:'testX',clientY:'testY'};
        //         dpa_VM.patternPaper={};
        //         dpa_VM.patternPaper.clientToLocalPoint=function()
        //         {};
        //         dpa_VM.graph={};
        //         dpa_VM.graph.addCell=function()
        //         {};
        //         // Test objects assertions
        //
        //         expect (dpa_VM).to.be.not.null;
        //         expect (dpa_VM.addEntry).to.be.not.null;
        //         expect (dexit.epm.epa.integration.createElement).to.be.not.null;
        //         expect (dpa_VM.patternPaper).not.to.be.null;
        //         expect (dpa_VM.graph).not.to.be.null;
        //
        //         // stubs & spies
        //
        //         var stub1 = sandbox.stub(dpa_VM, 'addEntry');
        //         var stub2=sandbox.stub(dpa_VM.patternPaper,'clientToLocalPoint');
        //
        //         var stub3=sandbox.stub(dexit.epm.epa.integration,'createElement');
        //         var stub4=sandbox.stub(dpa_VM.graph,'addCell');
        //
        //         stub1.onCall(0).returns({result:'test'});
        //         stub2.onCall(0).returns({localpoint:'test'});
        //         stub3.onCall(0).returns(new Error);
        //         dpa_VM.dropToInputScreen(item,event,{});
        //         expect(stub1.called).to.be.true;
        //         expect(stub2.called).to.be.true;
        //         expect (stub1.calledOnce);
        //         expect(stub1.args[0][0]).is.equal('testemplateType');
        //         expect(stub1.args[0][1]).is.equal('testsubtype');
        //         expect(stub1.args[0][2]).is.equal('testrenderType');
        //         expect(stub1.args[0][3]).is.equal('testsrc');
        //         expect(stub1.args[0][4]).is.equal('testisBR');
        //
        //         expect (stub2.calledOnce);
        //         expect(stub2.args[0][0].x).is.equal('testX');
        //         expect(stub2.args[0][0].y).is.equal('testY');
        //
        //
        //
        //         expect (stub3.calledOnce);
        //         expect(stub3.args[0][0].localpoint).is.equal('test');
        //         expect(stub3.args[0][1].result).is.equal('test');
        //
        //
        //
        //
        //         expect (stub4.calledOnce).is.false;
        //         //expect(stub4.args[0][0].element).is.equal("test");
        //         done();
        //     });
        //
        // });


    });
})();
