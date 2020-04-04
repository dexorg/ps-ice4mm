/**
 * Created by ali on 17/03/16.
 */

/*jslint node: true */
'use strict';

// third party modules
var _ = require('underscore');
// DEX modules
var tokenAuth = require('dex-authentication').token.authenticator;
var LectureManager = require('../libs/lectureManager');
var generalUtils = require('ps-ice').generalUtils;
/**
 * Create handler for questionnaire API requests.
 * @param {object} app: app express module
 * @param {object} config system configuration
 * @param {object} [authenticator] optional request authenticator
 * @return {*} router
 */
module.exports = function (app, config, authenticator) {

    //TODO(AH), due to a limitation in dex authentication, an authorization cannot be the same for routes being called from outside services, and routes being called from within the applicaiton
    // through ajax calls (hence by providing a session), issue SL-30
    var auth = tokenAuth.create(config);  //ensure that this auth uses token authenticator
    var appAuth = authenticator; //these routes uses app authenticator


    var mocks = arguments[2] || {}; // hidden argument allowing unit tests to inject dependencies
    var manager = mocks.LectureManager || new LectureManager(config);

    app.post('/lecture', auth.ensureAuthenticated, function (req, res, next) {
        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);
        if (req.query.lectureId) {
            //sharing lecture if id is given
            manager.ShareLecture(req, token, repo, req.query.lectureId, req.body, function(err, data){
                if (err) {
                    next(err);
                } else {
                    res.status(200).send(data);
                }
            });
        } else {
            manager.AuthorLecture(token, repo, req.body, function(err, data){
                if (err) {
                    next(err);
                } else {
                    res.status(200).send(data);
                }
            });
        }
    });



    app.get('/lecture/:lectureId', appAuth.ensureAuthenticated, function (req, res, next) {
        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);
        manager.RetrieveLectureDetails(token, repo, req.params.lectureId, function(err, data){
            if (err) {
                next(err);
            } else {
                res.status(200).send(data);
            }
        });

    });
    app.post('/lecture/:lectureId/intelligence', appAuth.ensureAuthenticated, function (req, res, next) {
        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);
        var params = {
            parentId: req.params.lectureId,
            repo: repo,
            type: req.body.type
        };
        manager.AddIntelligenceToLecture(token, params, req.body, function(err, data){
            if (err) {
                next(err);
            } else {
                res.status(200).send(data);
            }
        });
    });

    app.delete('/lecture/:lectureId/intelligence/:intelligenceId', appAuth.ensureAuthenticated, function (req, res, next) {
        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);
        //parameters to be used
        var params = {
            id: req.params.intelligenceId,
            parentId: req.params.lectureId,
            repo: repo,
            type: req.query.type
        };
        manager.DeleteIntelligenceFromLecture(token, params, function(err, data){
            if (err) {
                next(err);
            } else {
                res.status(200).send(data);
            }
        });
    });

    app.post('/lecture/:lectureId/touchpoint/:touchpointType/link', appAuth.ensureAuthenticated, function (req, res, next) {
        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);

        var touchpoint = {
            url: req.body.link,
            type: req.params.touchpointType,
            id: req.body.id
        };
        manager.RetrieveLectureLink(token, repo, req.params.lectureId, touchpoint, function(err, data){
            if (err) {
                next(err);
            } else {
                res.status(200).send(data);
            }
        });

    });

};
