/**
 * Copyright Digital Engagement Xperience 2017
 */
/*global chai, sinon, ko, dexit */

(function () {
    'use strict';

    var should = chai.should();
    var expect = chai.expect;

    describe.skip('epm-integration', function () {
        var sandbox, epmInt;


        var selectedSC = _.clone(dexit.test.scForEPM);

        var repo = 'test';
        var touchpointsAndLayouts = [{touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2', layout: { }, tpParams: { 'allImplictEpts': true}}];

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            epmInt = new dexit.epm.EPIntegration();
        });
        afterEach(function () {
            sandbox.restore();
        });


        describe('generateEP', function () {
            var mockBCAuthVM = {
                createMultiMedia: function(){},
                captureDynamicLayout: function(){},
                createDecision: function(){},
                ePatterns: []
            };




            it('should return error when missing required parameter:operation', function (done) {
                var params = {
                    repo: repo,
                    data: selectedSC,
                    touchpoints: ['46261b44-cce1-42c9-b806-9c3db01dfc27-2'],
                    epStructure: {
                        type: 'jointJS',
                        epUIStructure: {},
                        intelligenceElements: []
                    },
                    mainScId:'aaaaaaa',
                    touchpointsAndLayouts: touchpointsAndLayouts
                };



                epmInt.generateEP(params,mockBCAuthVM,function (error, ep) {
                    should.not.exist(ep);
                    should.exist(error);



                    done();
                });

            });


            it('should return error with invalid parameters: operation==edit but missing existingPattern', function (done) {
                var params = {
                    repo: repo,
                    data: selectedSC,
                    touchpoints: ['a'],
                    operation: 'edit',
                    epStructure: {
                        type: 'jointJS',
                        epUIStructure: {},
                        intelligenceElements: []
                    },
                    mainScId:'aaaaaaa',
                    touchpointsAndLayouts: touchpointsAndLayouts
                };



                epmInt.generateEP(params,mockBCAuthVM,function (error, ep) {
                    should.not.exist(ep);
                    should.exist(error);

                    done();
                });

            });



            it('should create new pattern (image and text)', function (done) {

                var epUIStructure = _.clone(dexit.test.jointjs.withImageAndText);

                var mmMatch = [{type:'image', value: ko.observable('https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg"')}];
                var mmMatch2 = [{type:'text', value:ko.observable('aaaa')}];

                epUIStructure.cells[6].multiMediaList = ko.observableArray(mmMatch);
                epUIStructure.cells[7].multiMediaList = ko.observableArray(mmMatch2);

                var structureEP = {
                    'start': 'now',
                    'end': 'never',
                    'epSchemaVersion': 2,
                    'element': [{
                        'id': '2d45df1c-cf92-413b-984e-57f9e7d62277',
                        'type': 'multimedia',
                        'subType': 'multimedia',
                        'type_id': '',
                        'args': {},
                        'presentationRef': 'default',
                        'description': '',
                        'inEvent': {
                            'events': []
                        }
                    }, {
                        'id': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
                        'type': 'multimedia',
                        'subType': 'multimedia',
                        'type_id': '',
                        'args': {},
                        'presentationRef': 'default',
                        'description': '',
                        'inEvent': {
                            'events': []
                        }
                    }],
                    'connection': [{
                        'name': 'start',
                        'from': 'start',
                        'to': '2d45df1c-cf92-413b-984e-57f9e7d62277',
                        'type': 'flow',
                        'properties': {
                            'wait': ''
                        }
                    }, {
                        'name': 'epa.FlowConnector-1',
                        'from': '2d45df1c-cf92-413b-984e-57f9e7d62277',
                        'to': 'end',
                        'type': 'flow',
                        'properties': {
                            'wait': ''
                        }
                    }, {
                        'name': 'start',
                        'from': 'start',
                        'to': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
                        'type': 'flow',
                        'properties': {
                            'wait': ''
                        }
                    }, {
                        'name': 'epa.FlowConnector-3',
                        'from': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
                        'to': 'end',
                        'type': 'flow',
                        'properties': {
                            'wait': ''
                        }
                    }],
                    'touchpoints': ['46261b44-cce1-42c9-b806-9c3db01dfc27-2'],
                    'tp': [{
                        'touchpoint': '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                        'layout': {}
                    }]
                };

                var expectedEP = {
                    'start': 'now',
                    'end': 'never',
                    'epSchemaVersion': 2,
                    'mainScId':'aaaaaaa',
                    'name':selectedSC.property.name,
                    'element': [{
                        'id': '2d45df1c-cf92-413b-984e-57f9e7d62277',
                        'type': 'multimedia',
                        'subType': 'multimedia',
                        'type_id': 'sc:2e0c8e39-a7e4-40dd-9999-30b48d00dcc9:layout:e8ea6072-19ef-4329-93f2-c1641b81f538',
                        'args': {},
                        'presentationRef': 'default',
                        'description': '',
                        'inEvent': {'events': []}
                    }, {
                        'id': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
                        'type': 'multimedia',
                        'subType': 'multimedia',
                        'type_id': 'sc:2e0c8e39-a7e4-40dd-9999-30b48d00dcc9:layout:19f4d22d-9a34-478d-ad2a-7ef3d147e2fa',
                        'args': {},
                        'presentationRef': 'default',
                        'description': '',
                        'inEvent': {'events': []}
                    }],
                    'connection': [{
                        'name': 'start',
                        'from': 'start',
                        'to': '2d45df1c-cf92-413b-984e-57f9e7d62277',
                        'type': 'flow',
                        'properties': {'wait': ''}
                    }, {
                        'name': 'epa.FlowConnector-1',
                        'from': '2d45df1c-cf92-413b-984e-57f9e7d62277',
                        'to': 'end',
                        'type': 'flow',
                        'properties': {'wait': ''}
                    }, {
                        'name': 'start',
                        'from': 'start',
                        'to': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
                        'type': 'flow',
                        'properties': {'wait': ''}
                    }, {
                        'name': 'epa.FlowConnector-3',
                        'from': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
                        'to': 'end',
                        'type': 'flow',
                        'properties': {'wait': ''}
                    }],
                    'touchpoints': ['46261b44-cce1-42c9-b806-9c3db01dfc27-2'],
                    'tp': [{'touchpoint': '46261b44-cce1-42c9-b806-9c3db01dfc27-2', 'layout': {}}]
                };

                var params = {
                    repo: repo,
                    data: selectedSC,
                    touchpoints: ['46261b44-cce1-42c9-b806-9c3db01dfc27-2'],
                    operation: 'create',
                    epStructure: {
                        type: 'jointJS',
                        epUIStructure: epUIStructure,
                        intelligenceElements: []
                    },
                    mainScId:'aaaaaaa',
                    touchpointsAndLayouts: touchpointsAndLayouts
                };


                sandbox.stub(dexit.app.ice.integration.engagementpattern,'structureEP').yields(null,structureEP);

                var mmStub = sandbox.stub(mockBCAuthVM,'createMultiMedia');
                mmStub.yields(null,'');

                var stubCapture = sandbox.stub(mockBCAuthVM,'captureDynamicLayout');
                stubCapture.onCall(0).yields(null,{'content':'PGh0bWw+PGJvZHk+PGltZyBzcmM9J2h0dHBzOi8vczMuYW1hem9uYXdzLmNvbS90ZW5hbnQuZGV4aXRjby5kZXhpdC5jby9Qcm9tb3Rpb24yLmpwZycgYWx0PSdlbGVtZW50IG1tJyBkYXRhLW1tLXRhZz0nZXAtMmQ0NWRmMWMtY2Y5Mi00MTNiLTk4NGUtNTdmOWU3ZDYyMjc3LW1tLWltYWdlLTAnPjwvYm9keT48L2h0bWw+',
                    'id':'e8ea6072-19ef-4329-93f2-c1641b81f538'});
                stubCapture.onCall(1).yields(null,{'content':'PGh0bWw+PGJvZHk+PHNwYW4gZGF0YS10eXBlPSd0ZXh0JyBkYXRhLW1tLXRhZz0nZXAtOTczNWQwMjAtMWRiMi00M2Q1LWFkNTQtYWE4NmIwZTRjMmUzLW1tLXRleHQtMCc+YWFhYTwvc3Bhbj48L2JvZHk+PC9odG1sPg==',
                    'id':'19f4d22d-9a34-478d-ad2a-7ef3d147e2fa'});


                sandbox.stub(epmInt,'_epAuthoring').yields(null,206112);

                var expectedResult = [{id:'206112',isActive:false,isStarted:false,pattern:expectedEP}];
                sandbox.stub(dexit.app.ice.integration.engagementpattern,'retrieveSCPatterns').yields(null,expectedResult);

                epmInt.generateEP(params,mockBCAuthVM,function (error, ep) {

                    should.not.exist(error);
                    should.exist(ep);
                    ep.should.deep.equal(expectedResult);


                    dexit.app.ice.integration.engagementpattern.structureEP.should.have.been.calledWith({
                        epUIStructure: epUIStructure,
                        type: 'jointJS',
                        epSchemaVersion: 2,
                        touchpoints: ['46261b44-cce1-42c9-b806-9c3db01dfc27-2'],
                        intelligenceElements: [],
                        tp:touchpointsAndLayouts
                    });


                    mockBCAuthVM.createMultiMedia.should.have.been.calledTwice;
                    mockBCAuthVM.createMultiMedia.should.have.been.calledWith(selectedSC,
                        '2d45df1c-cf92-413b-984e-57f9e7d62277',
                        mmMatch);
                    mockBCAuthVM.createMultiMedia.should.have.been.calledWith(selectedSC,
                        '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
                        mmMatch2);



                    //FIXME: match for arguments 1 and 2 not workig as expected
                    // mockBCAuthVM.captureDynamicLayout.should.have.been.calledWith(selectedSC,
                    //     //mm elements from epUIStructure
                    //     sinon.match.array,
                    //     // [{'type':'epa.HTMLElement','groups':{'in':{'attrs':{'.port-body':{'fill':'#16A085','magnet':'passive','r':5}}},'out':{'attrs':{'.port-body':{'fill':'#E74C3C','r':5}}}},'position':{'x':453,'y':201},'size':{'width':100,'height':64},'angle':0,'componentIndex':0,'elementType':'multimedia','renderType':'flex-image','imageCounter':1,'videoCounter':0,'textCounter':0,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia','layout':'<img src=\'https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg\' alt=\'element mm\' data-mm-tag=\'ep-1-mm-image-0\'>','inEvent':{'events':[]}},'template':'\n    <div class="ep-item image html-element">\n        <img data-bind="attr: { src: $data.multiMediaList()[0].value() }" alt="selected image" src="https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg">\n        <div class="img-desc" data-bind="text:$data.multiMediaList()[0].value().split(\'/\').pop()">Promotion2.jpg</div>\n    </div>\n','ports':{'groups':{'in':{'position':{'name':'left'},'attrs':{'.port-body':{'magnet':'passive','r':6}}},'out':{'position':{'name':'right'},'attrs':{'.port-body':{'r':6,'magnet':true}}}},'items':[{'label':{'position':{'name':'left','args':{}}},'group':'in','args':{},'attrs':{'text':{'text':'in'},'circle':{'magnet':'passive','r':6}},'id':'462c876a-3d84-426b-aeb3-b3f5dcebe704'},{'magnet':true,'label':{'position':{'name':'right','args':{}}},'group':'out','args':{},'attrs':{'text':{'text':'out'},'circle':{'magnet':true,'r':6}},'id':'d7718e9a-83e0-4dd8-a77b-b1eafa2acaf7'}]},'id':'2d45df1c-cf92-413b-984e-57f9e7d62277','z':3,'attrs':{}},{'type':'epa.HTMLElement','groups':{'in':{'attrs':{'.port-body':{'fill':'#16A085','magnet':'passive','r':5}}},'out':{'attrs':{'.port-body':{'fill':'#E74C3C','r':5}}}},'position':{'x':435,'y':78},'size':{'width':100,'height':64},'angle':0,'componentIndex':0,'elementType':'multimedia','renderType':'flex-text','imageCounter':0,'videoCounter':0,'textCounter':1,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia','layout':'<textarea data-type=\'text\' data-mm-tag=\'ep-1-mm-text-0\'>aaaa</textarea>','inEvent':{'events':[]}},'template':'\n    <div style="position: absolute; top: 10px; left: 340px" class="ep-item multimedia draggable-item html-element">\n        <div class="ep-edit"><i class="fa fa-pencil" data-bind="click: dpa_VM.editEntry"></i></div>\n        <i class="fa fa-font" aria-hidden="true"></i>\n        <div data-bind="text:  $data.multiMediaList()[0].value().substring(0, 15) + \'...\'">aaaa...</div>\n        <div class="connect top"></div>\n        <div class="connect right"></div>\n        <div class="connect left"></div>\n        <div class="connect bottom"></div>\n    </div>\n\n','ports':{'groups':{'in':{'position':{'name':'left'},'attrs':{'.port-body':{'magnet':'passive','r':6}}},'out':{'position':{'name':'right'},'attrs':{'.port-body':{'r':6,'magnet':true}}}},'items':[{'label':{'position':{'name':'left','args':{}}},'group':'in','args':{},'attrs':{'text':{'text':'in'},'circle':{'magnet':'passive','r':6}},'id':'1b67ea6e-f168-4d5d-89c1-a1ecc164de8c'},{'magnet':true,'label':{'position':{'name':'right','args':{}}},'group':'out','args':{},'attrs':{'text':{'text':'out'},'circle':{'magnet':true,'r':6}},'id':'32e2817b-f08a-4e9c-b3fb-e9c27367153a'}]},'id':'9735d020-1db2-43d5-ad54-aa86b0e4c2e3','z':4,'attrs':{}}],
                    //     {'id':'2d45df1c-cf92-413b-984e-57f9e7d62277','type':'multimedia','subType':'multimedia','type_id':'','args':{},'presentationRef':'default','description':'','inEvent':{'events':[]}},
                    //     'ucc', null);
                    // mockBCAuthVM.captureDynamicLayout.should.have.been.calledWith(selectedSC,
                    //     //mm elements from epUIStructure
                    //     sinon.match.array,
                    //     //[{'type':'epa.HTMLElement','groups':{'in':{'attrs':{'.port-body':{'fill':'#16A085','magnet':'passive','r':5}}},'out':{'attrs':{'.port-body':{'fill':'#E74C3C','r':5}}}},'position':{'x':453,'y':201},'size':{'width':100,'height':64},'angle':0,'componentIndex':0,'elementType':'multimedia','renderType':'flex-image','imageCounter':1,'videoCounter':0,'textCounter':0,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia','layout':'<img src=\'https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg\' alt=\'element mm\' data-mm-tag=\'ep-1-mm-image-0\'>','inEvent':{'events':[]}},'template':'\n    <div class="ep-item image html-element">\n        <img data-bind="attr: { src: $data.multiMediaList()[0].value() }" alt="selected image" src="https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg">\n        <div class="img-desc" data-bind="text:$data.multiMediaList()[0].value().split(\'/\').pop()">Promotion2.jpg</div>\n    </div>\n','ports':{'groups':{'in':{'position':{'name':'left'},'attrs':{'.port-body':{'magnet':'passive','r':6}}},'out':{'position':{'name':'right'},'attrs':{'.port-body':{'r':6,'magnet':true}}}},'items':[{'label':{'position':{'name':'left','args':{}}},'group':'in','args':{},'attrs':{'text':{'text':'in'},'circle':{'magnet':'passive','r':6}},'id':'462c876a-3d84-426b-aeb3-b3f5dcebe704'},{'magnet':true,'label':{'position':{'name':'right','args':{}}},'group':'out','args':{},'attrs':{'text':{'text':'out'},'circle':{'magnet':true,'r':6}},'id':'d7718e9a-83e0-4dd8-a77b-b1eafa2acaf7'}]},'id':'2d45df1c-cf92-413b-984e-57f9e7d62277','z':3,'attrs':{}},{'type':'epa.HTMLElement','groups':{'in':{'attrs':{'.port-body':{'fill':'#16A085','magnet':'passive','r':5}}},'out':{'attrs':{'.port-body':{'fill':'#E74C3C','r':5}}}},'position':{'x':435,'y':78},'size':{'width':100,'height':64},'angle':0,'componentIndex':0,'elementType':'multimedia','renderType':'flex-text','imageCounter':0,'videoCounter':0,'textCounter':1,'linksCounter':0,'patternComponents':{'id':1,'type':'multimedia','layout':'<textarea data-type=\'text\' data-mm-tag=\'ep-1-mm-text-0\'>aaaa</textarea>','inEvent':{'events':[]}},'template':'\n    <div style="position: absolute; top: 10px; left: 340px" class="ep-item multimedia draggable-item html-element">\n        <div class="ep-edit"><i class="fa fa-pencil" data-bind="click: dpa_VM.editEntry"></i></div>\n        <i class="fa fa-font" aria-hidden="true"></i>\n        <div data-bind="text:  $data.multiMediaList()[0].value().substring(0, 15) + \'...\'">aaaa...</div>\n        <div class="connect top"></div>\n        <div class="connect right"></div>\n        <div class="connect left"></div>\n        <div class="connect bottom"></div>\n    </div>\n\n','ports':{'groups':{'in':{'position':{'name':'left'},'attrs':{'.port-body':{'magnet':'passive','r':6}}},'out':{'position':{'name':'right'},'attrs':{'.port-body':{'r':6,'magnet':true}}}},'items':[{'label':{'position':{'name':'left','args':{}}},'group':'in','args':{},'attrs':{'text':{'text':'in'},'circle':{'magnet':'passive','r':6}},'id':'1b67ea6e-f168-4d5d-89c1-a1ecc164de8c'},{'magnet':true,'label':{'position':{'name':'right','args':{}}},'group':'out','args':{},'attrs':{'text':{'text':'out'},'circle':{'magnet':true,'r':6}},'id':'32e2817b-f08a-4e9c-b3fb-e9c27367153a'}]},'id':'9735d020-1db2-43d5-ad54-aa86b0e4c2e3','z':4,'attrs':{}}],
                    //     {'id':'9735d020-1db2-43d5-ad54-aa86b0e4c2e3','type':'multimedia','subType':'multimedia','type_id':'','args':{},'presentationRef':'default','description':'','inEvent':{'events':[]}},
                    //     'ucc', null);


                    mockBCAuthVM.captureDynamicLayout.should.have.been.calledWith(selectedSC,
                        //mm elements from epUIStructure
                        sinon.match.array,
                        sinon.match.object,
                        'ucc');
                    mockBCAuthVM.captureDynamicLayout.should.have.been.calledWith(selectedSC,
                        //mm elements from epUIStructure
                        sinon.match.array,
                        sinon.match.object,
                        'ucc');




                    epmInt._epAuthoring.should.have.been.calledWith(expectedEP,selectedSC,repo,'store',null);


                    dexit.app.ice.integration.engagementpattern.retrieveSCPatterns.should.have.been.calledWith(repo,selectedSC.id);

                    done();
                });

            });

            // TODO:
            // it('should update existing pattern', function () {
            //
            //
            // });


        });


        describe('Private functions', function () {


            describe('EP Authoring', function () {



                it('Author Engagament Pattern - Storing', function (done) {

                    var epData = _.clone(dexit.testEP);
                    var sc = _.clone(dexit.test.smartcontent);

                    var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'store');
                    stub0.callsArgWith(1, null, true);

                    epmInt._epAuthoring(epData, sc, 'dexitco', 'store', null, function(){});
                    expect(stub0.calledOnce);
                    expect(stub0.calledWith({sc:dexit.test.smartcontent.id, repo: 'dexitco', pattern: epmInt.ePattern}));
                    done();
                });

                it('Author Engagament Pattern - Storing - only 1 element', function (done) {

                    var epData = {id: '1', connection: [{'name': 'first', 'from': '1', 'to': '2', properties: {wait: 0}}, {'name': 'first', 'from': '2', 'to': '3', properties: {wait: 0}}], element:[{id: '1', type: 'multimedia', type_id:'sc:123:layout:1'}]};
                    var sc = _.clone(dexit.test.smartcontent);
                    var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'store');
                    stub0.callsArgWith(1, null, true);
                    epmInt._epAuthoring(epData, sc, 'dexitco', 'store', null, function(){});
                    expect(stub0.calledOnce);
                    expect(stub0.calledWith({sc:sc.id, repo: 'dexitco', pattern: epmInt.ePattern}));
                    done();
                });

                it('Author Engagement Pattern - Storing - only 5 elements (one -positive- follow up is filled in) ', function (done) {

                    var sc = _.clone(dexit.test.smartcontent);
                    var epData = {id: '1',
                        connection: [
                            {'name': 'first', 'from': 'start', 'to': '1', properties: {wait: 0}},
                            {'name': 'first', 'from': '1', 'to': '2', properties: {wait: 0}},
                            {'name': 'first', 'from': '2', 'to': '3', properties: {wait: 0}},
                            {'name': 'first', 'from': '3', 'to': '4', properties: {wait: 0}},
                            {'name': 'first', 'from': '4', 'to': '5', properties: {wait: 0}},
                            {'name': 'first', 'from': '4', 'to': '6', properties: {wait: 0}},
                            {'name': 'first', 'from': '5', 'to': 'end', properties: {wait: 0}},
                            {'name': 'first', 'from': '6', 'to': 'end', properties: {wait: 0}}],
                        element:[
                            {id: '1', type: 'multimedia', type_id:'sc:123:layout:1'},
                            {id: '2', type: 'behaviour', type_id:'sc:123:behav:1'},
                            {id: '3', type: 'decision', type_id:'sc:123:dec:1'},
                            {id: '4', type: 'intelligence', type_id:'sc:123:intel:1'},
                            {id: '5', type: 'multimedia', type_id:'sc:123:layout:1'}
                        ]};


                    var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'store');
                    stub0.callsArgWith(1, null, true);

                    // epmInt.engagementEnabled(true);
                    epmInt._epAuthoring(epData, sc, 'dexitco', 'store', null, function(){});
                    expect(stub0.calledOnce);
                    expect(stub0.calledWith({sc:sc.id, repo: 'dexitco', pattern: epmInt.ePattern}));
                    done();
                });
                it('Author Engagament Pattern - Storing - only 5 elements (one -negative- follow up is filled in) ', function (done) {

                    var sc = _.clone(dexit.test.smartcontent);
                    var epData = {id: '1',
                        connection: [
                            {'name': 'first', 'from': 'start', 'to': '1', properties: {wait: 0}},
                            {'name': 'first', 'from': '1', 'to': '2', properties: {wait: 0}},
                            {'name': 'first', 'from': '2', 'to': '3', properties: {wait: 0}},
                            {'name': 'first', 'from': '3', 'to': '4', properties: {wait: 0}},
                            {'name': 'first', 'from': '4', 'to': '5', properties: {wait: 0}},
                            {'name': 'first', 'from': '4', 'to': '6', properties: {wait: 0}},
                            {'name': 'first', 'from': '5', 'to': 'end', properties: {wait: 0}},
                            {'name': 'first', 'from': '6', 'to': 'end', properties: {wait: 0}}],
                        element:[
                            {id: '1', type: 'multimedia', type_id:'sc:123:layout:1'},
                            {id: '2', type: 'behaviour', type_id:'sc:123:behav:1'},
                            {id: '3', type: 'decision', type_id:['sc:123:dec:1']},
                            {id: '4', type: 'intelligence', type_id:'sc:123:intel:1'},
                            {id: '6', type: 'multimedia', type_id:'sc:123:layout:1'}
                        ]};

                    var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'store');
                    stub0.callsArgWith(1, null, true);

                    // epmInt.engagementEnabled(true);
                    epmInt._epAuthoring(epData, sc, 'dexitco', 'store', null, function(){});
                    expect(stub0.calledOnce);
                    expect(stub0.calledWith({sc:sc.id, repo: 'dexitco', pattern: epData}));
                    done();
                });

                it('Author Engagament Pattern - Updating', function (done) {

                    var sc = _.clone(dexit.test.smartcontent);
                    var epData = {id: '1', connection: [{properties: {wait: 0}}, {properties: {wait: 0}}, {properties: {wait: 2}}], element:[{id: '1', type: 'multimedia'}, {id: '2', type: 'behaviour'}, {id: '3', type: 'decision'}]};

                    var stub0 = sandbox.stub(dexit.app.ice.integration.engagementpattern, 'update');
                    stub0.callsArgWith(2, null, true);

                    // epmInt.engagementEnabled(true);
                    epmInt._epAuthoring(epData, sc, 'dexitco', 'update', '111', function(){});
                    expect(stub0.calledOnce);
                    expect(stub0.calledWith({sc:sc.id, repo: 'dexitco', pattern: epData}));
                    done();
                });
            });

        });


    });
})();
