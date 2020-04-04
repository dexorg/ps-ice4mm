/**
 * Copyright Digital Engagement Xperience 2016
 * @description file to test course admin client component
 */


//test helper methods
var chai = require('chai');
var should = require('chai').should();
var CourseManagement = require('../../libs/course-management');
var tpmClient = require('dex-http-client').tpm;
var errors = require('dex-errors');
var logger = require('dex-logger');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var _ = require('underscore');
var config = {
    scp: {
        host: 'localhost',
        port: 80,
        ssl: 'https'
    },
    tpm: {
        host:'localhost',
        defaultDeviceCategory: '101'
    },
    ep: {
        host: 'localhost',
        port: 80
    },
    templates: {
        host: 'localhost',
        port: 80
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
    },
    security: {
        disabled:true
    }
};
describe('course management client', function () {

    var sandbox;
    var mgr;

    beforeEach(function () {
        mgr = new CourseManagement(config);
        sandbox = sinon.sandbox.create();
        sandbox.stub(mgr.scContainer);
        sandbox.stub(mgr.tpmUtils);
        sandbox.stub(mgr.epBuilder);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('course management - propertyUpdate', function () {
        it('office hours update return error', function (done) {
            mgr.scContainer.partialUpdateSCProperty.yields('error');
            mgr.updateProperty('token','repo','courseId',
                {version:'testversion',propertyData:[{officehours:'test'}]},
                function(err, result){
                    should.exist(err);
                    done();
                });
        });

        it('office hours update return without error', function (done) {
            mgr.scContainer.partialUpdateSCProperty.yields(null, {});
            mgr.updateProperty('token','repo','courseId',
                {version:'testversion',propertyData:[{officehours:'test'}]},
                function(err, result){
                    should.not.exist(err);
                    done();
                });
        });
    });

    describe('course management - listCourseTouchpoints', function () {
        it('success - retrieve one touchpoint', function (done) {
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.listCourseTouchpoints('token','Lecture:12345',
                function(err, result){
                    should.not.exist(err);
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.be.calledOnce;
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.calledWith('token', '12345', function(){});
                    done();
                });
        });

        it('success - list array of touchpoints', function (done) {
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.listCourseTouchpoints('token',['Lecture:12345'],
                function(err, result){
                    should.not.exist(err);
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.be.calledOnce;
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.calledWith('token', '12345', function(){});
                    done();
                });
        });

        it('error - list touchpoints', function (done) {
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields('err');
            mgr.listCourseTouchpoints('token',['Lecture:12345'],
                function(err, result){
                    should.exist(err);
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.be.calledOnce;
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.calledWith('token', '12345', function(){});
                    done();
                });
        });
    });

    describe('course management - listSharedLectures', function () {
        it('success - list shared lectures', function (done) {
            mgr.scContainer.retrieveWithArgs.yields(null, {id: 'courseId', property: {touchpoints: 'Lecture:123'}, smartcontentobject: []});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scContainer.listSubResource.yields(null, [{id: 'scId', property: {name: 'abas'}}]);
            mgr.epBuilder.retrieveSCPatternList.yields(null, [{id:'222', isActive: true, pattern: {start: 'now', end:'never', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}}]);
            mgr.listCourseSharedLectures('token','dexitco', 'courseId', function(err, result){
                should.not.exist(err);
                mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.have.been.calledOnce;
                mgr.scContainer.retrieveWithArgs.should.have.been.calledWith('token','dexitco', 'courseId',{sort: '-date', shallow: 'true'});
                mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.have.been.calledWith('token', '123');
                mgr.scContainer.listSubResource.should.have.been.calledWith('token', 'dexitco', 'courseId');
                mgr.epBuilder.retrieveSCPatternList.should.have.been.calledWith('token', {scRepo:'dexitco', scId:'scId',extended:true});
                done();
            });
        });
        it('success - no shared lectures - return empty list', function (done) {
            mgr.scContainer.retrieveWithArgs.yields(null, {id: 'courseId', property: {touchpoints: 'Lecture:123'}, smartcontentobject: []});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scContainer.listSubResource.yields(null, [{id: 'scId', property: {name: 'abas'}}]);
            mgr.epBuilder.retrieveSCPatternList.yields(null, [{id:'222', isActive: false, pattern: {start: 'now', end:'never', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}}]);
            mgr.listCourseSharedLectures('token','dexitco', 'courseId', function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.should.have.property('lectures').that.is.an('Array').with.lengthOf(0);
                mgr.scContainer.retrieveWithArgs.should.have.been.calledWith('token','dexitco', 'courseId',{sort: '-date', shallow: 'true'});
                mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.have.been.calledOnce;
                mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.have.been.calledWith('token', '123');
                mgr.scContainer.listSubResource.should.have.been.calledWith('token', 'dexitco', 'courseId');
                mgr.epBuilder.retrieveSCPatternList.should.have.been.calledWith('token', {scRepo:'dexitco', scId:'scId', extended:true});
                done();
            });
        });
        it('error - list shared lectures - cannot retrieve course', function (done) {
            mgr.scContainer.retrieveWithArgs.yields('error');
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scContainer.listSubResource.yields(null, [{id: 'scId', property: {name: 'abas'}}]);
            mgr.epBuilder.retrieveSCPatternList.yields(null, [{id:'222', isActive: true, pattern: {start: 'now', end:'never', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}}]);
            mgr.listCourseSharedLectures('token','dexitco', 'courseId',
                function(err, result){
                    should.exist(err);
                    mgr.scContainer.retrieveWithArgs.should.be.calledOnce;
                    mgr.scContainer.retrieveWithArgs.should.have.been.calledWith('token','dexitco', 'courseId',{sort: '-date', shallow: 'true'});
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.not.be.called;
                    mgr.epBuilder.retrieveSCPatternList.should.be.notCalled;
                    mgr.scContainer.listSubResource.should.be.notCalled;
                    done();
                });
        });
        it('error - list shared lectures - cannot retrieve lectures', function (done) {
            mgr.scContainer.retrieveWithArgs.yields(null, {id: 'courseId', property: {touchpoints: 'Lecture:123'}, smartcontentobject: []});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scContainer.listSubResource.yields('error');
            mgr.epBuilder.retrieveSCPatternList.yields(null, [{id:'222', isActive: true, pattern: {start: 'now', end:'never', touchpoints: ['123'], element:[{type_id:'123'}], connection: [{from:'start', to:'1'}, {from:'1', to:'2'}]}}]);
            mgr.listCourseSharedLectures('token','dexitco', 'courseId',
                function(err, result){
                    should.exist(err);
                    mgr.scContainer.retrieveWithArgs.should.be.calledOnce;
                    mgr.scContainer.retrieveWithArgs.should.have.been.calledWith('token','dexitco', 'courseId',{sort: '-date', shallow: 'true'});
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.be.calledOnce;
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.calledWith('token', '123');
                    mgr.epBuilder.retrieveSCPatternList.should.be.notCalled;
                    mgr.scContainer.listSubResource.should.be.calledOnce;
                    mgr.scContainer.listSubResource.calledWith('token', 'dexitco', 'courseId');
                    done();
                });
        });
    });

    describe('course management - listLectures', function () {
        it('success - list lectures', function (done) {
            mgr.scContainer.retrieveWithArgs.yields(null, {id: 'courseId', property: {touchpoints: 'Lecture:123'}, smartcontentobject: []});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scContainer.listSubResource.yields(null, [{id: 'scId', property: {name: 'abas'}}]);
            mgr.listCourseLectures('token','dexitco', 'courseId',
                function(err, result){
                    should.not.exist(err);
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.be.calledOnce;
                    mgr.scContainer.retrieveWithArgs.calledWith('courseId');
                    mgr.tpmUtils.retrieveFormattedChannelsFromTP.calledWith('token', '123');
                    mgr.scContainer.listSubResource.calledWith('token', 'dexitco', 'courseId');
                    result.lectures[0].id.should.equal('scId');
                    done();
                });
        });


        it.skip('success - course has no touchpoints, just return empty listing', function (done) {
            mgr.scContainer.retrieveWithArgs.yields(null, {id: 'courseId', property: {}, smartcontentobject: []});
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scContainer.listSubResource.yields(null, [{id: 'scId', property: {name: 'abas'}}]);
            mgr.listCourseLectures('token','dexitco', 'courseId', function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.should.deep.equal({course: {
                    id: 'courseId',
                    property: {},
                    smartcontentobject: []
                }, touchpoints: [], lectures: []});

                mgr.scContainer.retrieveWithArgs.should.be.calledOnce;
                mgr.scContainer.retrieveWithArgs.yields(null, {id: 'courseId', property: {touchpoints: 'Lecture:123'}, smartcontentobject: []});
                mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.not.have.been.called;
                mgr.scContainer.listSubResource.should.be.notCalled;
                done();
            });
        });


        it('error - list lectures - cannot retrieve course', function (done) {
            mgr.scContainer.retrieveWithArgs.yields('error');
            mgr.tpmUtils.retrieveFormattedChannelsFromTP.yields(null, {tpId: 'tp1', tpType: 'facebook', tpURL: 'www.facebook.com/123'});
            mgr.scContainer.listSubResource.yields(null, [{id: 'scId', property: {name: 'abas'}}]);
            mgr.listCourseLectures('token','dexitco', 'courseId', function(err, result){
                should.exist(err);
                should.not.exist(result);
                mgr.scContainer.retrieveWithArgs.should.be.calledOnce;
                mgr.scContainer.retrieveWithArgs.yields(null, {id: 'courseId', property: {touchpoints: 'Lecture:123'}, smartcontentobject: []});
                mgr.tpmUtils.retrieveFormattedChannelsFromTP.should.not.have.been.called;
                mgr.scContainer.listSubResource.should.be.notCalled;
                done();
            });
        });
    });





});
