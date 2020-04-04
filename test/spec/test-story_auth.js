/**
 * @copyright Digital Engagement Xperience Inc 2018
 */
/* global storyboard_VM, chai, sinon, dexit */


(function () {
    'use strict';
    var should = chai.should();

    var dummyGrapes = {
        DomComponents: {
            getComponents: function() {
                return [];
            }
        }
    };

    describe.skip('Story-auth', function() {
        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create({useFakeTimers:true});
            // sandbox.stub(grapesjs,'init').returns(dummyGrapes);
        });
        afterEach(function () {
            sandbox.restore();
        });

        describe('instantiateView', function () {


            it('success (without error)', function (done) {
                var args = {
                    ep: {pattern: '203162'},
                    sc: '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                    touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                    layout: {
                        layoutMarkup: '<div class="col-sm-6 media-div" data-region="1"></div>\r\n<div class="col-sm-6" data-region="2"></div>\r\n<div class="col-sm-12" data-region="3"></div>'
                    },
                    repo: 'dexitco'
                };




                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                s1.selectedTouchpoint(args.touchpoint);
                s1.selectedLayout(args.layout);
                s1.currentEP = args.ep;
                var stub6 = sandbox.stub(s1, 'updateHTML');
                var s2 = sandbox.stub(s1, 'setupBlocks').yields(null, null);
                s1.edit_mode = false;
                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.not.exist(err);
                    stub5.should.have.been.called;
                    stub6.should.not.have.been.called;
                    done();
                });
                sandbox.clock.tick(2000);
            });

            it('success for editMode===true (without error)', function (done) {
                var args = {
                    ep: {pattern: '203162'},
                    sc: '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                    touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                    layout: {
                        layoutMarkup: '<div class="col-sm-6 media-div" data-region="1"></div>\r\n<div class="col-sm-6" data-region="2"></div>\r\n<div class="col-sm-12" data-region="3"></div>'
                    },
                    repo: 'dexitco'
                };


                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                s1.selectedTouchpoint(args.touchpoint);
                s1.selectedLayout(args.layout);
                s1.currentEP = args.ep;
                var stub6 = sandbox.stub(s1, 'updateHTML');
                var s2 = sandbox.stub(s1, 'setupBlocks').yields(null, null);
                s1.edit_mode = true;
                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.not.exist(err);
                    stub5.should.have.been.called;
                    stub6.should.have.been.called;
                    done();

                });
                sandbox.clock.tick(2000);
            });


            it('fails to instantiateView with setupBlocks returning error  ', function (done) {
                var args = {
                    ep: {pattern: '203162'},
                    sc: '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                    touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                    layout: {
                        layoutMarkup: '<div class="col-sm-6 media-div" data-region="1"></div>\r\n<div class="col-sm-6" data-region="2"></div>\r\n<div class="col-sm-12" data-region="3"></div>'
                    },
                    repo: 'dexitco'
                };
                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                var s2 = sandbox.stub(s1, 'setupBlocks').yields('test', null);
                s1.edit_mode = false;
                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.exist(err);
                    stub5.should.have.been.not.called;
                    done();
                });


            });
            it('fails to instantiateView with setupBlocks returning error error and callback=null', function (done) {
                var args = {
                    ep: {pattern: '203162'},
                    sc: '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                    touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                    layout: {
                        layoutMarkup: '<div class="col-sm-6 media-div" data-region="1"></div>\r\n<div class="col-sm-6" data-region="2"></div>\r\n<div class="col-sm-12" data-region="3"></div>'
                    },
                    repo: 'dexitco'
                };
                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                var s2 = sandbox.stub(s1, 'setupBlocks').yields('error');
                s1.edit_mode = false;

                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.exist(err);
                    stub5.should.have.been.not.called;
                    done();

                });


            });
            it('fails to instantiateView with args={}', function (done) {
                var args = {};
                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                var s2 = sandbox.stub(s1, 'setupBlocks').yields('test', null);
                s1.edit_mode = false;

                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.exist(err);
                    stub5.should.have.been.not.called;
                    done();
                });

            });
            it('fails to instantiateView with args.ep={}', function (done) {
                var args = {
                    ep: '',
                    sc: '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                    touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                    layout: {
                        layoutMarkup: '<div class="col-sm-6 media-div" data-region="1"></div>\r\n<div class="col-sm-6" data-region="2"></div>\r\n<div class="col-sm-12" data-region="3"></div>'
                    },
                    repo: 'dexitco'
                };
                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                var s2 = sandbox.stub(s1, 'setupBlocks').yields('test', null);
                s1.edit_mode = false;

                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.exist(err);
                    stub5.should.have.been.not.called;
                    done();
                });

            });
            it('fails to instantiateView with args.sc={}', function (done) {
                var args = {
                    ep: {pattern: '203162'},
                    sc: '',
                    touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                    layout: {
                        layoutMarkup: '<div class="col-sm-6 media-div" data-region="1"></div>\r\n<div class="col-sm-6" data-region="2"></div>\r\n<div class="col-sm-12" data-region="3"></div>'
                    },
                    repo: 'dexitco'
                };
                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                var s2 = sandbox.stub(s1, 'setupBlocks').yields('test', null);
                s1.edit_mode = false;

                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.exist(err);
                    stub5.should.have.been.not.called;
                    done();
                });

            });
            it('fails to instantiateView with args.touchpoint={}', function (done) {
                var args = {
                    ep: {pattern: '203162'},
                    sc: '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                    touchpoint: '',
                    layout: {
                        layoutMarkup: '<div class="col-sm-6 media-div" data-region="1"></div>\r\n<div class="col-sm-6" data-region="2"></div>\r\n<div class="col-sm-12" data-region="3"></div>'
                    },
                    repo: 'dexitco'
                };
                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                var s2 = sandbox.stub(s1, 'setupBlocks').yields('test', null);
                s1.edit_mode = false;

                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.exist(err);
                    stub5.should.have.been.not.called;
                    done();
                });


            });
            it('fails to instantiateView with args.layout={}', function (done) {
                var args = {
                    ep: {pattern: '203162'},
                    sc: '2cdaf0c8-4bef-43e6-80d3-3deaf9a9bdab',
                    touchpoint: '46261b44-cce1-42c9-b806-9c3db01dfc27-2',
                    layout: {},
                    repo: 'dexitco'
                };
                var stub3 = sandbox.stub(dexit.scm.cd.integration.util, 'addEPComponentType');
                var s1 = storyboard_VM;
                var s2 = sandbox.stub(s1, 'setupBlocks').yields(null, null);
                var stub6 = sandbox.stub(s1, 'updateHTML');
                s1.edit_mode = false;

                var stub5 = sandbox.stub(s1, 'loadExternalCSS');
                s1.instantiateView(args, function (err) {
                    should.exist(err);
                    stub5.should.not.have.been.called;
                    done();
                });

            });
        });

        describe('loadEP', function(){
            it.skip('should succssfully load EP', function (done) {
                var pattern = {id: 'ep1', pattern: {epSchemaVersion: 2}};

                sandbox.stub(dexit.app.ice.integration.engagementpattern,'retrieve').yields(null,pattern);

                storyboard_VM.loadEP('ep1', function(err) {
                    should.not.exist(err);
                    should.exist(storyboard_VM.currentEP);
                    pattern.should.equal(storyboard_VM.currentEP);
                    should.exist(storyboard_VM.epSchemaVersion);
                    storyboard_VM.epSchemaVersion.should.equal(2);
                    dexit.app.ice.integration.engagementpattern.retrieve.should.have.been.calledWith('ep1');
                    done();
                });
            });

            it('should return on error loading', function (done) {
                var pattern = {id: 'ep1', pattern: '203162', epSchemaVersion: 2};

                sandbox.stub(dexit.app.ice.integration.engagementpattern,'retrieve').yields(new Error('uh oh'));

                storyboard_VM.loadEP('ep1', function(err, res) {
                    should.exist(err);
                    dexit.app.ice.integration.engagementpattern.retrieve.should.have.been.calledWith('ep1');
                    done();
                });
            });
        });

        //FIXME: tests are timing out
        describe.skip('save EP', function(){
            it('should succssfully save for mode=allocation ', function (done) {
                var pattern = {id: 'ep1', revision: '1', pattern:{ epSchemaVersion: 2}};

                var res = { status: 200};
                sandbox.stub(dexit.app.ice.integration.engagementpattern,'update').yields(res);
                sandbox.stub(storyboard_VM, 'mode').returns('allocation');

                storyboard_VM.currentEP = pattern;

                storyboard_VM.save(function(err, resp) {
                    should.not.exist(err);
                    should.exist(resp);
                    resp.should.deep.equal(pattern);
                    dexit.app.ice.integration.engagementpattern.update.should.have.been.calledWith('ep1', '1', pattern);
                    done();
                });
            });

            it('should return on error updating for mode=allocation', function (done) {
                var pattern = {id: 'ep1', revision: '1', pattern: {epSchemaVersion: 2}};

                var res = { status: 200};
                sandbox.stub(dexit.app.ice.integration.engagementpattern,'update').yields();
                sandbox.stub(storyboard_VM, 'mode').returns('allocation');

                storyboard_VM.currentEP = pattern;

                storyboard_VM.save(function(err, resp) {
                    should.exist(err);
                    should.not.exist(resp);
                    dexit.app.ice.integration.engagementpattern.update.should.have.been.calledWith('ep1', '1', pattern);
                    done();
                });
            });
        });


    });
})();
