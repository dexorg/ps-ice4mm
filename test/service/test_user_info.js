/**
 * Copyright Digital Engagement Xperience 2015
 * @description file to test userInfo component
 */


//test helper methods
var chai = require('chai');
var should = chai.should();
var UserInfo = require('../../libs/user-info');
var errors = require('dex-errors');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var _ = require('underscore');
var config = _.clone(require('../../config'));
var RolesWFManager = require('ps-ice').rolesWFManager;



config.kb = {
    host: 'localhost'
};
config.profileUser = {
    host: 'localhost'
};
config.aws = {
};
config.sb = {
    host: 'localhost',
    port: 80,
    ssl: false
};
config.rae = {
    wf: {
        host: 'localhost',
        port: 80,
        ssl: false
    },
    rm: {
        host: 'localhost',
        port: 80,
        ssl: false
    }
};



describe('user info', function () {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe('constructor', function () {

        it('should throw error on missing config', function (done) {
            (function () {
                new UserInfo(null)
            }).should.throw(errors.Config);
            done();
        });
        it('should create User Info on valid config', function (done) {
            var manager = new UserInfo(config);
            should.exist(manager);
            done();
        });
    });

    describe('getInfo', function () {

        it('should return error on missing req', function (done) {
            var manager = new UserInfo(config);
            manager.getInfo(null, 'token', {}, function(err, result){
                should.exist(err);
                done();
            })
        });

        it('should fallback to empty if error retrieving roles', function (done) {

            var rwfMgr = new RolesWFManager(config);
            sandbox.stub(rwfMgr,'retrieveRoles').yields(new Error('error'));
            sandbox.spy(rwfMgr,'retrieveCurrentRole');

            var manager = new UserInfo(config,rwfMgr);
            var req= {'user':{'me':'1'}};
           // mockRWFMgr.retrieveCurrentRole.returns('c');
            manager.getInfo(req, 'token', {}, function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.should.have.property('currentRole',undefined);
                result.should.have.property('roles').that.is.instanceOf(Array).with.lengthOf(0);
                result.should.have.property('tasks').that.is.instanceOf(Array).with.lengthOf(0);
                rwfMgr.retrieveRoles.should.have.been.calledOnce;
                rwfMgr.retrieveRoles.should.have.been.calledWith(req.user,'token',{});
                rwfMgr.retrieveCurrentRole.should.have.been.calledOnce;
                rwfMgr.retrieveCurrentRole.should.have.been.calledWith(req,[]);
                done();
            });
        });

        it('should return user info with multiple available roles', function (done) {

            var mockRWFMgr = sinon.stub(new RolesWFManager(config));
            mockRWFMgr.retrieveRoles.yields(null,{roles: ['a', 'b', 'c']});
            mockRWFMgr.retrieveCurrentRole.returns('c');

            var manager = new UserInfo(config,mockRWFMgr);
            var req= {'user':{'me':'1'}};
            manager.getInfo(req, 'token', {}, function(err, result){
                should.not.exist(err);
                result.should.have.property('currentRole','c');
                result.should.have.property('roles').that.is.instanceOf(Array).with.lengthOf(3).with.members(['a', 'b', 'c']);
                result.should.have.property('tasks').that.is.instanceOf(Array).with.lengthOf(0);
                mockRWFMgr.retrieveRoles.should.have.been.calledOnce;
                mockRWFMgr.retrieveRoles.should.have.been.calledWith(req.user,'token',{});
                mockRWFMgr.retrieveCurrentRole.should.have.been.calledOnce;
                mockRWFMgr.retrieveCurrentRole.should.have.been.calledWith(req,['a','b','c']);
                done();
            });
        });
    });
});
