/**
 * Copyright Digital Engagement Xperience 2016
 * @description  this moduel is testing the scMultimedia component
 */


//test helper methods

var lectureManager = require('../../libs/lectureManager');
var tpmClient = require('dex-http-client').tpm;
var errors = require('dex-errors');
var sinon = require('sinon');
var chai = require("chai");
var should = chai.should();
var _ = require('underscore');


var config = {
    scp: {
        host: "localhost",
        port: 80,
        ssl: 'https'
    },
    lm: {
        host:"dx-daily.lm.com",
        port:80,
        ssl: false
    },
    ep: {
        host: 'localhost',
        port: 80
    },
    templates: {
        host: 'localhost',
        port: 80
    },
    security: {
        oauth2: {
            authorizationURL: 'localhost/auth',
            tokenURL: 'localhost/token'
        }
    },
    profileUser: {
        host: 'localhost'
    },
    tpm: {
        host:'localhost',
        defaultDeviceCategory: '101'
    },
    scPersistInstance: {
        datastore: 'sc_instance',
        datastoreType: 'cassandra',
        cassandra : {
            contactPoints: ['testPoint'],
            keyspace: 'sc_data_test'
        }
    },
    engagementDb: {
        datastore: 'test_db'
    },
    kb: {
        host: 'localhost',
        port: 80
    },
    epmEm: {
        datastore:'aa'
    }
};



describe('Lecture Manager', function () {

    var sandbox;
    var mgr;
    var aTPMClient;

    beforeEach(function () {
        mgr = new lectureManager(config);
        var aTPMClient = new tpmClient(config);
        sandbox = sinon.sandbox.create();
        sandbox.stub(mgr.scmObjectClient);
        sandbox.stub(mgr.scmContainerClient);
        sandbox.stub(mgr.scmMultimediaClient);
        sandbox.stub(mgr.scmIntelligenceClient);
        sandbox.stub(mgr.scmLayoutClient);
        sandbox.stub(mgr.scBehaviour);
        sandbox.stub(mgr.epBuilder);
        sandbox.stub(mgr.metricsClient);
        sandbox.stub(mgr.upmClient);
        sandbox.stub(mgr.systemTokenUtil);
        sandbox.stub(mgr.tpmUtils);
        sandbox.stub(mgr.sc.scm.intelligence);
        sandbox.stub(aTPMClient);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('constructor', function () {
        it('should create manager', function () {
            var m = new lectureManager(config);
            should.exist(m);
        });

        it('should throw error on missing config', function () {
            (function () {
                new lectureManager();
            }).should.throw(errors.Config);
        });
    });


    describe('Create Lecture', function () {

        it('should create a lecture', function (done) {
            mgr.scmObjectClient.create.yields(null, {id:'12345'});
            mgr.createLecture('token', 'repo', 'courseId', {}, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.id.should.equal('12345');
                mgr.scmObjectClient.create.should.be.calledOnce;
                done();
            });
        });

        it('should handle error', function (done) {
            mgr.scmObjectClient.create.yields('err');
            mgr.createLecture('token', 'repo', 'courseId', {}, function (err, result) {
                should.exist(err);
                mgr.scmObjectClient.create.should.be.calledOnce;
                done();
            });
        });


        it('should check for valid input - token', function (done) {
            mgr.createLecture(null, 'repo', 'courseId', {}, function (err, result) {
                should.exist(err);
                mgr.scmObjectClient.create.should.be.notCalled;
                done();
            });
        });

        it('should check for valid input - repo', function (done) {
            mgr.createLecture('repo', null, 'courseId', {}, function (err, result) {
                should.exist(err);
                mgr.scmObjectClient.create.should.be.notCalled;
                done();
            });
        });

        it('should check for valid input - courseId', function (done) {
            mgr.createLecture('token', 'repo', null, {}, function (err, result) {
                should.exist(err);
                mgr.scmObjectClient.create.should.be.notCalled;
                done();
            });
        });

        it('should check for valid input - body', function (done) {
            mgr.createLecture('token', 'repo', 'courseId', null, function (err, result) {
                should.exist(err);
                mgr.scmObjectClient.create.should.be.notCalled;
                done();
            });
        });

    });

    describe('Add Multimedia to Lecture', function () {

        it('should Add a multimedia', function (done) {
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.AddMultimediaToLecture('token', 'repo', 'lectureId', {}, 'type1', function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.id.should.equal('mm-12345');
                mgr.scmMultimediaClient.createMultimediaResource.should.be.calledOnce;
                done();
            });
        });
        it('should handle error', function (done) {
            mgr.scmMultimediaClient.createMultimediaResource.yields('err');
            mgr.AddMultimediaToLecture('token', 'repo', 'lectureId', {}, 'type1', function (err, result) {
                should.exist(err);
                mgr.scmMultimediaClient.createMultimediaResource.should.be.calledOnce;
                done();
            });
        });
        it('should check for valid input - token', function (done) {
            mgr.AddMultimediaToLecture(null, 'repo', 'lectureid', {}, 'type1', function (err, result) {
                should.exist(err);
                mgr.scmMultimediaClient.createMultimediaResource.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - repo', function (done) {
            mgr.AddMultimediaToLecture('token', null, 'lectureId', {}, 'type1', function (err, result) {
                should.exist(err);
                mgr.scmMultimediaClient.createMultimediaResource.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - lectureId', function (done) {
            mgr.AddMultimediaToLecture('token', 'repo', null, {}, 'type1', function (err, result) {
                should.exist(err);
                mgr.scmMultimediaClient.createMultimediaResource.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - body', function (done) {
            mgr.AddMultimediaToLecture('token', 'repo', 'lectureId', null, 'type1', function (err, result) {
                should.exist(err);
                mgr.scmMultimediaClient.createMultimediaResource.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - type', function (done) {
            mgr.AddMultimediaToLecture('token', 'repo', 'lectureId', {}, null, function (err, result) {
                should.exist(err);
                mgr.scmMultimediaClient.createMultimediaResource.should.be.notCalled;
                done();
            });
        });

    });

    describe('Add Layout to Lecture', function () {

        it('should Add a lecture layout', function (done) {
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.AddLayoutToLecture('token', 'repo', 'lectureId', {name:'a'}, [{"type": ["image"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.png"}, {"type": ["video"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.mp4"}, {"type": ["document"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.pdf"}], 'lecture', 'tester', function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.id.should.equal('100');
                mgr.scmLayoutClient.create.should.be.calledOnce;
                done();
            });
        });
        it('should Add a notification layout', function (done) {
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.AddLayoutToLecture('token', 'repo', 'lectureId', {name:'a'}, [{"type": ["image"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.png"}], 'notification', 'tester', function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.id.should.equal('100');
                mgr.scmLayoutClient.create.should.be.calledOnce;
                done();
            });
        });
        it('should handle error', function (done) {
            mgr.scmLayoutClient.create.yields('err');
            mgr.AddLayoutToLecture('token', 'repo', 'lectureId', {name:'a'}, [{"type": ["image"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.png"}], 'lecture', 'tester', function (err, result) {
                should.exist(err);
                mgr.scmLayoutClient.create.should.be.calledOnce;
                done();
            });
        });
        it('should check for valid input - token', function (done) {
            mgr.AddLayoutToLecture(null, 'repo', 'lectureId', {name:'a'}, [{"type": ["image"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.png"}], 'lecture', 'tester', function (err, result) {
                should.exist(err);
                mgr.scmLayoutClient.create.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - repo', function (done) {
            mgr.AddLayoutToLecture('token', null, 'lectureId', {name:'a'}, [{"type": ["image"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.png"}], 'lecture', 'tester', function (err, result) {
                should.exist(err);
                mgr.scmLayoutClient.create.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - lectureId', function (done) {
            mgr.AddLayoutToLecture('token', 'repo', null, {name:'a'}, [{"type": ["image"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.png"}], 'lecture', 'tester', function (err, result) {
                should.exist(err);
                mgr.scmLayoutClient.create.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - body', function (done) {
            mgr.AddLayoutToLecture('token', 'repo', 'lectureId', null, [{"type": ["image"], "name": "yellowFile", "url": "http://dexit.co/GaberOwn.png"}], 'lecture', 'tester', function (err, result) {
                should.exist(err);
                mgr.scmLayoutClient.create.should.be.notCalled;
                done();
            });
        });
    });

    describe('Author EP', function () {

        it('should Author EP', function (done) {
            mgr.epBuilder.storePattern.yields(null, {id:'222'});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.AuthorEP('token', 'repo', 'lectureId', {touchpoints: ['123'], element: [{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}, function (err, result) {
                should.not.exist(err);
                mgr.epBuilder.storePattern.should.be.calledOnce;
                done();
            });
        });
        it('should check for valid input - token', function (done) {
            mgr.AuthorEP(null, 'repo', 'lectureid', {}, function (err, result) {
                should.exist(err);
                mgr.epBuilder.storePattern.should.not.have.been.called;
                done();
            });
        });
        it('should check for valid input - repo', function (done) {
            mgr.AuthorEP('token', null, 'lectureId', {}, function (err, result) {
                should.exist(err);
                mgr.epBuilder.storePattern.should.not.have.been.called;
                done();
            });
        });
        it('should check for valid input - lectureId', function (done) {
            mgr.AuthorEP('token', 'repo', null, {}, function (err, result) {
                should.exist(err);
                mgr.epBuilder.storePattern.should.not.have.been.called;
                done();
            });
        });
        it('should check for valid input - pattern', function (done) {
            mgr.AuthorEP('token', 'repo', 'lectureId', null, function (err, result) {
                should.exist(err);
                mgr.epBuilder.storePattern.should.not.have.been.called;
                done();
            });
        });
    });

    describe('Author Lecture', function () {

        it('should Author Lecture with image and links', function (done) {
            mgr.scmContainerClient.list.yields(null, [{id:'1', property: {touchpoints: ['123', '231']}}]);
            mgr.scmObjectClient.create.yields(null, {id:'lecId111'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.epBuilder.listTemplates.yields(null, [{id:'222', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}]);
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.epBuilder.storePattern.yields(null, {id:'222'});
            mgr.AuthorLecture('token', 'repo', {
                "courseId": "Latest101",
                "name": "apiCreatedLecutre-ah-1",
                "mm": [{
                    "tags": ["image"],
                    "key": "yellowFile",
                    "url": "https://s3.amazonaws.com/tenant.dexitedu.dexit.co/GaberOwn.png"
                }, {
                    "tags": ["document"],
                    "key": "metrics.pdf",
                    "url": "https://s3.amazonaws.com/tenant.dexitedu.dexit.co/metrics.pdf"
                }]
            }, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.lectureId.should.equal('lecId111');
                mgr.scmContainerClient.list.should.be.calledOnce;
                mgr.epBuilder.listTemplates.should.be.calledOnce;
                done();
            });
        });
        it('should Author Lecture with video and links', function (done) {
            mgr.scmContainerClient.list.yields(null, [{id:'1', property: {touchpoints: '231'}}]);
            mgr.scmObjectClient.create.yields(null, {id:'lecId111'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.epBuilder.listTemplates.yields(null, [{id:'222', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}]);
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.epBuilder.storePattern.yields(null, {id:'222'});
            mgr.AuthorLecture('token', 'repo', {
                "courseId": "Latest101",
                "name": "apiCreatedLecutre-ah-1",
                "mm": [{
                    "tags": ["video"],
                    "key": "yellowFile",
                    "url": "https://s3.amazonaws.com/tenant.dexitedu.dexit.co/GaberOwn.mp4"
                },{
                    "tags": ["document"],
                    "key": "metrics.pdf",
                    "url": "https://s3.amazonaws.com/tenant.dexitedu.dexit.co/metrics.pdf"
                }]
            }, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.lectureId.should.equal('lecId111');
                mgr.scmContainerClient.list.should.be.calledOnce;
                mgr.epBuilder.listTemplates.should.be.calledOnce;
                done();
            });
        });
        it('should Author Lecture failes if it cannot retrieve EPtemplate', function (done) {
            mgr.scmContainerClient.list.yields(null, [{id:'1', property: {touchpoints: '231'}}]);
            mgr.scmObjectClient.create.yields(null, {id:'lecId111'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.epBuilder.listTemplates.yields('err');
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.epBuilder.storePattern.yields(null, {id:'222'});
            mgr.AuthorLecture('token', 'repo', {
                "courseId": "Latest101",
                "name": "apiCreatedLecutre-ah-1",
                "mm": [{
                    "tags": ["video"],
                    "key": "yellowFile",
                    "url": "https://s3.amazonaws.com/tenant.dexitedu.dexit.co/GaberOwn.mp4"
                },{
                    "tags": ["document"],
                    "key": "metrics.pdf",
                    "url": "https://s3.amazonaws.com/tenant.dexitedu.dexit.co/metrics.pdf"
                }]
            }, function (err, result) {
                should.exist(err);
                done();
            });
        });
        it('should check for valid input - token', function (done) {
            mgr.AuthorLecture(null, 'repo', {}, function (err, result) {
                should.exist(err);
                mgr.epBuilder.listTemplates.should.not.have.been.called;
                done();
            });
        });
        it('should check for valid input - repo', function (done) {
            mgr.AuthorLecture('token', null, {}, function (err, result) {
                should.exist(err);
                mgr.epBuilder.listTemplates.should.not.have.been.called;
                done();
            });
        });
        it('should check for valid input - body', function (done) {
            mgr.AuthorLecture('token', 'repo', null, function (err, result) {
                should.exist(err);
                mgr.epBuilder.storePattern.should.not.have.been.called;
                mgr.epBuilder.listTemplates.should.not.have.been.called;
                done();
            });
        });
    });

    describe('Share Lecture', function () {

        it('should Share Lecture to facebook with now and never as start and end date', function (done) {
            mgr.systemTokenUtil.getSystemAuthToken.yields(null, 'sysToken');
            mgr.upmClient.listNetworks.yields(null, [{id:'1', name: 'facebook', network_user: '321'}]);
            mgr.scmObjectClient.retrieve.yields(null, {id:'lecId111', intelligence: [{kind:'engagementpattern', property: {location:'ep1'}}]});
            mgr.epBuilder.retrievePattern.yields(null, [{id:'222', touchpoints: ['123'], type: 'general', element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}]);
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scBehaviour.execute.yields(null, {id:'schId123'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.epBuilder.activatePattern.yields(null, 'activated');
            mgr.ShareLecture('req', 'token', 'repo', 'lect123', {
                "name": "apiCreatedLecutre-ah-1",
                "user": {
                    "id": "5061",
                    "attributes": {"firstName":"Carol", "lastName":"Zamo"}
                }
            }, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                done();
            });
        });
        it('should Share Lecture to facebook with specific start and end Dates', function (done) {
            mgr.systemTokenUtil.getSystemAuthToken.yields(null, 'sysToken');
            mgr.upmClient.listNetworks.yields(null, [{id:'1', name: 'facebook', network_user: '321'}]);
            mgr.scmObjectClient.retrieve.yields(null, {id:'lecId111', intelligence: [{kind:'engagementpattern', property: {location:'ep1'}}]});
            mgr.epBuilder.retrievePattern.yields(null, {id:'222', pattern: {touchpoints: ['123'], type: 'general', element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scBehaviour.execute.yields(null, {id:'schId123'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.epBuilder.activatePattern.yields(null, 'activated');
            mgr.ShareLecture('req', 'token', 'repo', 'lect123', {
                "name": "apiCreatedLecutre-ah-1",
                "startDate": "2016-03-21",
                "endDate": "2016-03-22",
                "user": {
                    "id": "5061",
                    "attributes": {"firstName":"Carol", "lastName":"Zamo"}
                }
            }, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                done();
            });
        });
        it('should Share Lecture to twitter with now and never as start and end date', function (done) {
            mgr.systemTokenUtil.getSystemAuthToken.yields(null, 'sysToken');
            mgr.upmClient.listNetworks.yields(null, [{id:'1', name: 'facebook', network_user: '321'}]);
            mgr.scmObjectClient.retrieve.yields(null, {id:'lecId111', intelligence: [{kind:'engagementpattern', property: {location:'ep1'}}]});
            mgr.epBuilder.retrievePattern.yields(null, {id:'222', pattern: {touchpoints: ['123'], type: 'general', element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'twitter', tpURL: 'www.twitter.com/123'});
            mgr.scBehaviour.execute.yields(null, {id: 'schId123'});
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.epBuilder.activatePattern.yields(null, 'activated');
            mgr.ShareLecture('req', 'token', 'repo', 'lect123', {
                "name": "apiCreatedLecutre-ah-1",
                "user": {
                    "id": "5061",
                    "attributes": {"firstName":"Carol", "lastName":"Zamo"}
                }
            }, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                done();
            });
        });
        it('should Share Lecture to twitter with specific start and end date', function (done) {
            mgr.systemTokenUtil.getSystemAuthToken.yields(null, 'sysToken');
            mgr.upmClient.listNetworks.yields(null, [{id:'1', name: 'facebook', network_user: '321'}]);
            mgr.scmObjectClient.retrieve.yields(null, {id:'lecId111', intelligence: [{kind:'engagementpattern', property: {location:'ep1'}}]});
            mgr.epBuilder.retrievePattern.yields(null, [{id:'222', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}]);
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'twitter', tpURL: 'www.twitter.com/123'});
            mgr.scBehaviour.execute.yields(null, {id: 'schId123'});
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.epBuilder.activatePattern.yields(null, 'activated');
            mgr.ShareLecture('req', 'token', 'repo', 'lect123', {
                "name": "apiCreatedLecutre-ah-1",
                "startDate": "2016-03-21",
                "endDate": "2016-03-22",
                "user": {
                    "id": "5061",
                    "attributes": {"firstName":"Carol", "lastName":"Zamo"}
                }
            }, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                done();
            });
        });
        it('should Share Lecture to facebook - fails cannot retrieve user networks', function (done) {
            mgr.systemTokenUtil.getSystemAuthToken.yields(null, 'sysToken');
            mgr.upmClient.listNetworks.yields('err');
            mgr.scmObjectClient.retrieve.yields(null, {id:'lecId111', intelligence: [{kind:'engagementpattern', property: {location:'ep1'}}]});
            mgr.epBuilder.retrievePattern.yields(null, [{id:'222', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}]);
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'twitter', tpURL: 'www.twitter.com/123'});
            mgr.scBehaviour.execute.yields(null, {id: 'schId123'});
            mgr.scmLayoutClient.create.yields(null, {id:'100'});
            mgr.scmMultimediaClient.createMultimediaResource.yields(null, {id:'mm-12345'});
            mgr.epBuilder.activatePattern.yields(null, 'activated');
            mgr.ShareLecture('req', 'token', 'repo', 'lect123', {
                "name": "apiCreatedLecutre-ah-1",
                "user": {
                    "id": "5061",
                    "attributes": {"firstName":"Carol", "lastName":"Zamo"}
                }
            }, function (err, result) {
                should.exist(err);
                done();
            });
        });
        it('should check for valid input - repo', function (done) {
            mgr.ShareLecture('req', 'token', null, 'lectureId', {}, function (err, result) {
                should.exist(err);
                done();
            });
        });
        it('should check for valid input - lectureId', function (done) {
            mgr.ShareLecture('req', 'token', 'repo', null, {}, function (err, result) {
                should.exist(err);
                done();
            });
        });
        it('should check for valid input - body', function (done) {
            mgr.ShareLecture('req', 'token', 'repo', 'lectureId', null, function (err, result) {
                should.exist(err);
                done();
            });
        });
    });

    describe('Add Intelligence to Lecture', function () {

        it('should Add an intelligence', function (done) {
            mgr.scmIntelligenceClient.createIntelligenceResource.yields(null, {id:'12345'});
            mgr.AddIntelligenceToLecture('token', {repo: 'dexitco', parentId: 'lect1', type:'serviceIntel'}, {}, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.id.should.equal('12345');
                mgr.scmIntelligenceClient.createIntelligenceResource.should.be.calledOnce;
                done();
            });
        });
        it('should handle error', function (done) {
            mgr.scmIntelligenceClient.createIntelligenceResource.yields('err');
            mgr.AddIntelligenceToLecture('token', {repo: 'dexitco', parentId: 'lect1', type:'serviceIntel'}, {}, function (err, result) {
                should.exist(err);
                mgr.scmIntelligenceClient.createIntelligenceResource.should.be.calledOnce;
                done();
            });
        });
        it('should check for valid input - token', function (done) {
            mgr.AddIntelligenceToLecture(null, {}, {}, function (err, result) {
                should.exist(err);
                mgr.scmIntelligenceClient.createIntelligenceResource.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - params', function (done) {
            mgr.AddIntelligenceToLecture('token', null, {}, function (err, result) {
                should.exist(err);
                mgr.scmIntelligenceClient.createIntelligenceResource.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - body', function (done) {
            mgr.AddIntelligenceToLecture('token', {} , null, function (err, result) {
                should.exist(err);
                mgr.scmIntelligenceClient.createIntelligenceResource.should.be.notCalled;
                done();
            });
        });
    });

    describe('Delete Intelligence to Lecture', function () {

        it('should Add an intelligence', function (done) {
            mgr.scmIntelligenceClient.deleteIntelligenceResource.yields(null, null);
            mgr.DeleteIntelligenceFromLecture('token', {repo: 'dexitco', parentId: 'lect1', type:'serviceIntel'}, function (err, result) {
                should.not.exist(err);
                mgr.scmIntelligenceClient.deleteIntelligenceResource.should.be.calledOnce;
                done();
            });
        });
        it('should handle error', function (done) {
            mgr.scmIntelligenceClient.deleteIntelligenceResource.yields('err');
            mgr.DeleteIntelligenceFromLecture('token', {repo: 'dexitco', parentId: 'lect1', type:'serviceIntel'}, function (err, result) {
                should.exist(err);
                mgr.scmIntelligenceClient.deleteIntelligenceResource.should.be.calledOnce;
                done();
            });
        });
        it('should check for valid input - token', function (done) {
            mgr.DeleteIntelligenceFromLecture(null, {}, function (err, result) {
                should.exist(err);
                mgr.scmIntelligenceClient.deleteIntelligenceResource.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - params', function (done) {
            mgr.DeleteIntelligenceFromLecture('token', null, function (err, result) {
                should.exist(err);
                mgr.scmIntelligenceClient.deleteIntelligenceResource.should.be.notCalled;
                done();
            });
        });
    });

    describe('Retrieve Lecture Link', function () {

        it('should retrieve link', function (done) {
            mgr.sc.scm.intelligence.retrieveDataFromRepo.yields(null, [{data: {data: {postId: '122_123'}}}]);
            mgr.RetrieveLectureLink('token', 'dexitco', 'lectureId', {id: 'tpId', url: 'test.com/', type: 'facebook'}, function (err, result) {
                should.not.exist(err);
                should.exist(result);
                result.linkURL.should.equal('test.com/123');
                mgr.sc.scm.intelligence.retrieveDataFromRepo.should.be.calledOnce;
                done();
            });
        });
        it('should handle error', function (done) {
            mgr.sc.scm.intelligence.retrieveDataFromRepo.yields('err');
            mgr.RetrieveLectureLink('token', 'dexitco', 'lectureId', {id: 'tpId', url: 'test.com/', type: 'facebook'}, function (err, result) {
                should.exist(err);
                mgr.sc.scm.intelligence.retrieveDataFromRepo.should.be.calledOnce;
                done();
            });
        });
        it('should check for valid input - token', function (done) {
            mgr.RetrieveLectureLink(null, 'dexitco', 'lectureId', {id: 'tpId', url: 'test.com/', type: 'facebook'}, function (err, result) {
                should.exist(err);
                mgr.sc.scm.intelligence.retrieveDataFromRepo.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - repo', function (done) {
            mgr.RetrieveLectureLink('token', null, 'lectureId', {id: 'tpId', url: 'test.com/', type: 'facebook'}, function (err, result) {
                should.exist(err);
                mgr.sc.scm.intelligence.retrieveDataFromRepo.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - lectureId', function (done) {
            mgr.RetrieveLectureLink('token', 'repo', null, {id: 'tpId', url: 'test.com/', type: 'facebook'}, function (err, result) {
                should.exist(err);
                mgr.sc.scm.intelligence.retrieveDataFromRepo.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - touchpoint', function (done) {
            mgr.RetrieveLectureLink('token', 'repo', 'lecture1', null, function (err, result) {
                should.exist(err);
                mgr.sc.scm.intelligence.retrieveDataFromRepo.should.be.notCalled;
                done();
            });
        });


    });


    describe('lecture management - retrieve lecture details', function () {
        it('should check for valid input - token', function (done) {
            mgr.RetrieveLectureDetails(null, 'dexitco', 'lectureId', function (err, result) {
                should.exist(err);
                mgr.epBuilder.retrieveSCPatternList.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - repo', function (done) {
            mgr.RetrieveLectureDetails('token', null, 'lectureId', function (err, result) {
                should.exist(err);
                mgr.epBuilder.retrieveSCPatternList.should.be.notCalled;
                done();
            });
        });
        it('should check for valid input - lectureId', function (done) {
            mgr.RetrieveLectureDetails('token', 'repo', null, function (err, result) {
                should.exist(err);
                mgr.epBuilder.retrieveSCPatternList.should.be.notCalled;
                done();
            });
        });
        it('success - retrieve lecture details', function (done) {
            mgr.epBuilder.retrieveSCPatternList.yields(null, [{id:'222', isActive: true, pattern: {start: 'today', end:'tomorrow', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}}]);
            mgr.RetrieveLectureDetails('token','dexitco', 'lectureId',
                function(err, result){
                    should.not.exist(err);
                    mgr.epBuilder.retrieveSCPatternList.calledWith('token', {scRepo:'dexitco', scId:'scId'});
                    mgr.epBuilder.retrieveSCPatternList.should.be.calledOnce;
                    result.isPatternActive.should.equal(true);
                    done();
                });
        });
        it('success - retrieve lecture details but without engagement patterns', function (done) {
            mgr.epBuilder.retrieveSCPatternList.yields(null, []);
            mgr.RetrieveLectureDetails('token','dexitco', 'lectureId',
                function(err, result){
                    should.not.exist(err);
                    mgr.epBuilder.retrieveSCPatternList.calledWith('token', {scRepo:'dexitco', scId:'scId'});
                    mgr.epBuilder.retrieveSCPatternList.should.be.calledOnce;
                    done();
                });
        });
        it('should return error when retrieveSCPatternList returns an error', function (done) {
            mgr.epBuilder.retrieveSCPatternList.yields(new Error('error'));
            mgr.RetrieveLectureDetails('token','dexitco', 'lectureId',
                function(err, result){
                    should.exist(err);
                    mgr.epBuilder.retrieveSCPatternList.calledWith('token', {scRepo:'dexitco', scId:'scId'});
                    done();
                });
        });

    });



});
