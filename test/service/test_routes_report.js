/**
 * Copyright Digital Engagement Xperience
 * Date: 22/06/15
 * @author Ali Hussain
 * @description
 */


//test helper methods
var chai = require('chai');
var should = chai.should();
var nock = require('nock');
var sinon = require('sinon');
var request = require('supertest');
var logger = require("dex-logger");
var express = require('express');
var errors = require('dex-errors');
var bodyParser = require('body-parser');

var config = {
    kb: {
        host: 'localhost',
        port: 80
    },
    lm:{
        host:"dx-daily.lm.com",
        port:80,
        ssl:false
    },
    courseAdmin: {
        host: 'localhost',
        port: 80
    },
    profileUser: {
        host: 'localhost',
        port: 80
    },
    security : {
        oauth2: {
            authorizationURL: 'auth',
            tokenURL: 'token',
            clientID: 'client',
            clientSecret: 'secret'
        }
    },
    scp: {
        repository: 'dev',
        host:'scc-latest.herokuapp.com',
        port:80
    }
};


describe('report_manager', function () {


    var mockTokenUtil = {
        getSystemAuthToken: function (callback) {
            callback(null, 'token');
        }
    };

    var dummyAuthenticator = {
        ensureAuthenticated: function (req, res, next) {
            next();
        },
        getAccessToken: function (req) {
            return 'token'
        }
    };

    var app;

    before(function () {
        app = express();
        app.use(bodyParser.json());
        require('../../routes/routes_report.js')(app, config, mockTokenUtil,dummyAuthenticator);
        app.use(errors.handler.rest);
    });




    var dataResult = {
        headers: ["school_id", "school_name", "school_description"],
        rows: [
            ["2", "Engineering", "engineering school"]
        ]
    };

    var ds = {};
    var datastore = {schema: '123'};
    var schemadata = {records:[{name:'a'}]};


    afterEach( function() {
        nock.cleanAll();
    });

    it('retrieve intelligence without schema ', function (done) {

        // nock setup for retrieving a datastore
        nock('http://' + config.kb.host + ':' + config.kb.port)
            .get('/access/stores/test1')
            .reply(200, ds);

        request(app)
            .get('/report/intelligence/test1')
            .set('Accept', 'application/json')
            //.expect(200)
            .end( function(error, res) {
                should.not.exist(error);
                done();
            });
    });

    it('list intelligence with schema ', function (done) {

        // nock setup for retrieving a datastore
        nock('http://' + config.kb.host + ':' + config.kb.port)
            .get('/access/stores/test1')
            .reply(200, datastore);
        // nock setup for retrieve schema
        nock('http://' + config.kb.host + ':' + config.kb.port)
            .get('/dataschema/'+datastore.schema)
            .reply(200, schemadata);

        request(app)
            .get('/report/intelligence/test1')
            .set('Accept', 'application/json')
            .expect(200)
            .end( function(error, res) {
                should.not.exist(error);
                done();
            });
    });

    it('failed to list intelligence schema ', function (done) {

        // nock setup for error retrieving a datastore
        nock('http://' + config.kb.host + ':' + config.kb.port)
            .get('/access/stores/test2')
            .reply(500);

        request(app)
            .get('/report/intelligence/')
            .set('Accept', 'application/json')
            .expect(500)
            .end( function(error, res) {
                should.exist(error);
                done();
            });
    });

    it('Retrieve list of instance data with empty schema', function (done){

        // nock setup for retrieving a instance data
        nock('http://' + config.kb.host + ':' + config.kb.port)
            .post('/access/stores/test1/query')
            .reply(200, {});


        request(app)
            .get('/report/intelligence/test1/t1/*')
            .set('Accept', 'application/json')
            .expect(200)
            .end( function(error, res) {
                should.not.exist(error);
                done();
            });
    });

    it('Retrieve list of instance data with filled schema', function (done){

        // nock setup for retrieving a instance data
        nock('http://' + config.kb.host + ':' + config.kb.port)
            .post('/access/stores/test1/query')
            .reply(200, {result: dataResult});


        request(app)
            .get('/report/intelligence/test1/t1/*')
            .set('Accept', 'application/json')
            .expect(200)
            .end( function(error, res) {
                should.not.exist(error);
                done();
            });
    });

    it('failed to retrive list of instance data', function (done){
        // nock setup for retrieving a instance data
        nock('http://' + config.kb.host + ':' + config.kb.port)
            .post('/access/stores/test1/query')
            .reply(500);


        request(app)
            .get('/report/intelligence/test1/t1/*')
            .set('Accept', 'application/json')
            .expect(500)
            .end( function(error, res) {
                should.not.exist(error);
                done();
            });
    });

    it('Retrieve a layout', function (done){
        // nock setup for retrieving a layout
        nock('http://' + config.lm.host + ':' + config.lm.port)
            .get('/layout/l1')
            .reply(200, {});


        request(app)
            .get('/report/layout/l1')
            .set('Accept', 'application/json')
            .expect(200)
            .end( function(error, res) {
                should.not.exist(error);
                done();
            });
    });

    it('Failed to retrieve a layout', function (done){


        // nock setup for retrieving a layout
        nock('http://' + config.lm.host + ':' + config.lm.port)
            .get('/layout/l1')
            .reply(500);


        request(app)
            .get('/report/layout/l1')
            .set('Accept', 'application/json')
            .expect(500)
            .end( function(error, res) {
                should.not.exist(error);
                done();
            });
    });



});
