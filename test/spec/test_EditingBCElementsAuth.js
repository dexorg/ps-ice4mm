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


    describe("bc Auth - Editing", function() {
        var mainVM, bcAuthVM, editingBCVM, addingBCVM, theCourse, theArgs, editingBCArgs, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theCourse = new dexit.test.Course();
            theArgs= {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'test', userRoles: 'professor',
                ice4mBCs: '[{"name":"Merchandising","bctype":[{"eService":{"bctype":["eServiceInstance"]}}]},{"name":"Marketing","bctype":[{"Campaign":{"bctype":["Promotion"]}}]}]'
            };
            mainVM = new dexit.app.ice.edu.Main(theArgs);
            sandbox.stub(dexit.app.ice.integration.bcm,'retrieveBCMappingByRole').yields(null,[]);
            sandbox.stub(mainVM,'showBCInstances');
            //ignore loading of reports
            sandbox.stub(mainVM,'loadDashboardReports');
            mainVM.init();
            bcAuthVM = new dexit.app.ice.edu.bcAuthoring.BCAuthoringVM({mainVM: mainVM});

        });
        afterEach( function() {
            sandbox.restore();
        });

        describe('editBCElements', function() {
            it.skip('edit bc elements', function(done) {

                var sc = _.clone(dexit.test.smartcontent);
                sc.layout = [];
                bcAuthVM.propertyTextValue(['titleTest']);
                bcAuthVM.widgetIndex = 1;
                mainVM.selectedSC(sc);
                mainVM.selectedCourse({courseVM: theCourse});
                mainVM.selectedWidget(mainVM.selectedCourse().courseVM.widgets()[0]);
                mainVM.selectedCourse().courseVM.chosenTouchpoints([]);
                var expectedLayout = {'layoutId':'main'};
                mainVM.selectedCourse().courseVM.selectedLayout(expectedLayout);
                var stub1 = sandbox.stub(bcAuthVM, "deleteBCElements");
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc, "updateSC");
                var stub3 = sandbox.stub(bcAuthVM, "createPropertyAsMM");
                var stub4 = sandbox.stub(mainVM.engagementBuilderVM, "generateEP").yields(null,true);
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "retrieveSC");
                var stub6 = sandbox.stub(mainVM.selectedCourse().courseVM, "retrieveTouchpointsDetailsOfBCi");
                mainVM.selectedCourse().courseVM.chosenTouchpoints().push({'tpId':'123', 'tpType':'ucc', 'channelType': 'ucc'});
                stub1.callsArgWith(1, null, true);
                stub2.callsArgWith(3, null, true);
                stub3.callsArgWith(1, null, true);
                stub5.callsArgWith(2, null, sc);
                stub6.callsArgWith(1, true);

                var epUI = [{
                    componentIndex: 1, elementTypeComponents: {}, validComponent: function () {
                    }
                }];

                var stub7 = sandbox.stub(dpa_VM, "generatedStructure").returns(epUI);
                var stub8 = sandbox.stub(dpa_VM, "referredIntelligence").returns([]);

                bcAuthVM.editBCElements(sc, function(ep){
                    expect(stub1.called).to.be.true;
                    expect(stub2.called).to.be.true;
                    expect(stub3.called).to.be.true;


                    stub7.should.have.been.calledTwice;
                    stub4.should.have.been.calledOnce;
                    stub4.should.have.been.calledWith({
                        data:sc,
                        touchpoints:[{'tpId':'123', 'tpType':'ucc', 'channelType': 'ucc'}],
                        epUIStructure:epUI,
                        operation:'edit',
                        layout:expectedLayout,
                        referredIntelligence: []
                    });

                    done();
                });


            });
        });

        describe('deleteBCElements', function() {
            it('delete all elements successfully', function(done) {
                var sc = _.clone(dexit.test.smartcontent);

                bcAuthVM.propertyTextValue(['titleTest']);
                var stub1 = sandbox.stub(dexit.app.ice.integration.layoutmanagement, "deleteLayout");
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.behaviour, "remove");
                var stub3 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, "remove");
                var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeTextMultimedia");
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeImageMultimedia");
                var stub6 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeVideoMultimedia");
                var stub7 = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, "deleteIntelligence");
                stub1.callsArgWith(3, null, true);
                stub2.callsArgWith(4, null, true);
                stub3.callsArgWith(3, null, true);
                stub4.callsArgWith(4, null, true);
                stub5.callsArgWith(4, null, true);
                stub6.callsArgWith(4, null, true);
                stub7.callsArgWith(3, null, true);
                sc.behaviour = [{'id': '1', 'scope': 'user'}];
                sc.decision = [{'id': '1'}, {'id': '2'}];
                sc.intelligence = [{'id': '1', kind: 'intel#service-operation'}];
                sc.layout = [{"id":'7'}];
                bcAuthVM._deleteBCElements(sc, function(){});
                expect(stub1.called).to.be.true;
                expect(stub2.calledWith(mainVM.repo, sc.behaviour[0].id, sc.id)).to.be.true;
                expect(stub3.calledWith(mainVM.repo, sc.decision[0].id, sc.id)).to.be.true;
                expect(stub4.calledWith(mainVM.repo, sc.text[0].id, sc.id)).to.be.true;
                expect(stub5.calledWith(mainVM.repo, sc.image[0].id, sc.id)).to.be.true;
                expect(stub5.calledWith(mainVM.repo, sc.video[0].id, sc.id)).to.be.true;
                expect(stub7.calledWith(sc.id, sc.intelligence[0].id, sc.intelligence[0].kind.split('#')[1])).to.be.true;
                done();

            });

            it('delete all elements successfully - no user behaviour and no user intelligence', function(done) {
                var sc = _.clone(dexit.test.smartcontent);

                bcAuthVM.propertyTextValue(['titleTest']);
                var stub1 = sandbox.stub(dexit.app.ice.integration.layoutmanagement, "deleteLayout");
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.behaviour, "remove");
                var stub3 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, "remove");
                var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeTextMultimedia");
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeImageMultimedia");
                var stub6 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeVideoMultimedia");
                var stub7 = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, "deleteIntelligence");
                stub1.callsArgWith(3, null, true);
                stub2.callsArgWith(4, null, true);
                stub3.callsArgWith(3, null, true);
                stub4.callsArgWith(4, null, true);
                stub5.callsArgWith(4, null, true);
                stub6.callsArgWith(4, null, true);
                stub7.callsArgWith(3, null, true);
                sc.behaviour = [{'id': '1'}];
                sc.decision = [{'id': '1'}, {'id': '2'}];
                sc.intelligence = [{'id': '1', kind: 'intel#engagementpoints'}];
                sc.layout = [{'id':'77'}];
                bcAuthVM._deleteBCElements(sc, function(){});
                expect(stub1.called).to.be.true;
                expect(stub2.notCalled).to.be.true;
                expect(stub7.notCalled).to.be.true;
                done();

            });

            it('deleting layout failed', function(done) {
                var sc = _.clone(dexit.test.smartcontent);

                bcAuthVM.propertyTextValue(['titleTest']);
                var stub1 = sandbox.stub(dexit.app.ice.integration.layoutmanagement, "deleteLayout").yields(new Error('uh oh'));
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.behaviour, "remove");
                var stub3 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, "remove");
                var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeTextMultimedia");
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeImageMultimedia");
                var stub6 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeVideoMultimedia");
                stub2.callsArgWith(4, null, true);
                stub3.callsArgWith(3, null, true);
                stub4.callsArgWith(4, null, true);
                stub5.callsArgWith(4, null, true);
                stub6.callsArgWith(4, null, true);
                sc.behaviour = [{'id': '1', 'scope': 'user'}];
                sc.decision = [{'id': '1'}, {'id': '2'}];
                sc.layout = [{'id':'77'}];
                bcAuthVM._deleteBCElements(sc, function(){});
                expect(stub1.called).to.be.true;
                done();

            });

            it('deleting behaviour failed', function(done) {
                var sc = _.clone(dexit.test.smartcontent);
                bcAuthVM.propertyTextValue(['titleTest']);
                var stub1 = sandbox.stub(dexit.app.ice.integration.layoutmanagement, "deleteLayout");
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.behaviour, "remove");
                var stub3 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, "remove");
                var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeTextMultimedia");
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeImageMultimedia");
                var stub6 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeVideoMultimedia");
                stub1.callsArgWith(3, null, true);
                stub2.callsArgWith(4, true, null);
                stub3.callsArgWith(3, null, true);
                stub4.callsArgWith(4, null, true);
                stub5.callsArgWith(4, null, true);
                stub6.callsArgWith(4, null, true);
                sc.behaviour = [{'id': '1', 'scope': 'user'}];
                sc.decision = [{'id': '1'}, {'id': '2'}];
                sc.layout = [{'id':'77'}];
                bcAuthVM._deleteBCElements(sc, function(){});
                expect(stub2.called).to.be.true;
                done();

            });

            it('deleting decision failed', function(done) {
                var sc = _.clone(dexit.test.smartcontent);
                bcAuthVM.propertyTextValue(['titleTest']);
                var stub1 = sandbox.stub(dexit.app.ice.integration.layoutmanagement, "deleteLayout");
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.behaviour, "remove");
                var stub3 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, "remove");
                var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeTextMultimedia");
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeImageMultimedia");
                var stub6 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeVideoMultimedia");
                stub1.callsArgWith(3, null, true);
                stub2.callsArgWith(4, null, true);
                stub3.callsArgWith(3, true, null);
                stub4.callsArgWith(4, null, true);
                stub5.callsArgWith(4, null, true);
                stub6.callsArgWith(4, null, true);
                sc.behaviour = [{'id': '1', 'scope': 'user'}];
                sc.decision = [{'id': '1'}, {'id': '2'}];
                sc.layout = [{'id':'77'}];
                bcAuthVM._deleteBCElements(sc, function(){});
                expect(stub3.called).to.be.true;
                done();

            });

            it('deleting intelligence failed', function(done) {
                var sc = _.clone(dexit.test.smartcontent);
                bcAuthVM.propertyTextValue(['titleTest']);
                var stub1 = sandbox.stub(dexit.app.ice.integration.layoutmanagement, "deleteLayout");
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.behaviour, "remove");
                var stub3 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, "remove");
                var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeTextMultimedia");
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeImageMultimedia");
                var stub6 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeVideoMultimedia");
                var stub7 = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, "deleteIntelligence");
                stub1.callsArgWith(3, null, true);
                stub2.callsArgWith(4, null, true);
                stub3.callsArgWith(3, null, true);
                stub4.callsArgWith(4, null, true);
                stub5.callsArgWith(4, null, true);
                stub6.callsArgWith(4, null, true);
                stub7.callsArgWith(3, true, null);
                sc.behaviour = [{'id': '1', 'scope': 'user'}];
                sc.decision = [{'id': '1'}, {'id': '2'}];
                sc.intelligence = [{'id': '1', kind: 'intel#service-operation'}];
                sc.layout = [{'id':'77'}];
                bcAuthVM._deleteBCElements(sc, function(){});
                expect(stub7.called).to.be.true;
                done();

            });

            it('deleting text, image and video failed', function(done) {
                var sc = _.clone(dexit.test.smartcontent);
                bcAuthVM.propertyTextValue(['titleTest']);
                var stub1 = sandbox.stub(dexit.app.ice.integration.layoutmanagement, "deleteLayout");
                var stub2 = sandbox.stub(dexit.scm.dcm.integration.sc.behaviour, "remove");
                var stub3 = sandbox.stub(dexit.scm.dcm.integration.sc.decision, "remove");
                var stub4 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeTextMultimedia");
                var stub5 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeImageMultimedia");
                var stub6 = sandbox.stub(dexit.scm.dcm.integration.sc, "removeVideoMultimedia");
                var stub7 = sandbox.stub(dexit.app.ice.edu.integration.lectureManager, "deleteIntelligence");
                stub1.callsArgWith(3, null, true);
                stub2.callsArgWith(4, null, true);
                stub3.callsArgWith(3, null, true);
                stub4.callsArgWith(4, true, null);
                stub5.callsArgWith(4, true, null);
                stub6.callsArgWith(4, true, null);
                stub7.callsArgWith(3, null, true);
                sc.behaviour = [{'id': '1', 'scope': 'user'}];
                sc.decision = [{'id': '1'}, {'id': '2'}];
                sc.intelligence = [{'id': '1', kind: 'intel#service-operation'}];
                sc.layout = [{'id':'77'}];
                bcAuthVM._deleteBCElements(sc, function(){});
                expect(stub4.called).to.be.true;
                expect(stub5.called).to.be.true;
                expect(stub6.called).to.be.true;
                done();

            });
        });

    });

})();
