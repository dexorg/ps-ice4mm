/**
 * Copyright Digital Engagement Xperiance
 * Date: 09/09/14
 * @author Ali Hussain
 * @description
 */

/*jslint node: true */
'use strict';

var _ = require('underscore');
var CourseManagement = require('../libs/course-management');
var appApiAuth = require('dex-authentication').authenticator.appApi;
var SCMContainer = require('icep-scm').scClient.scContainer;
var errors = require('dex-errors');
var logger = require('dex-logger');
var generalUtils = require('ps-ice').generalUtils;


module.exports = function (app, config, authenticator) {

    var auth = authenticator || appApiAuth(config);
    ///hidden parameter for dependency injection by unit tests, mocks will be passed in only in the testing file, where
    // this route is called with mocks as the last parameter.
    var mocks = arguments[3] || {};
    var courseManagementClient = mocks.courseManagementClient || new CourseManagement(config);
    var scmContainerClient = new SCMContainer(config);
    app.patch('/course/:courseId', auth.ensureAuthenticated, function (req, res, next) {

        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);
        var courseId = req.params.courseId;
        var body = req.body;


        courseManagementClient.updateProperty(token, repo, courseId, body, function(err, result){
            if (err) {
                next(err);
            } else if(!result){
            //after successful udpate the response would be (null,null)
                res.status(200).send({'result':'update successfully'});
            }else{
                res.status(200).send(result);
            }
        });
    });
    app.get('/course/:courseId/lectures', auth.ensureAuthenticated, function (req, res, next) {
        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);

        var cb = _.partial(generalUtils.handleHttpResult, logger, 200, res, next);

        if(req.query && req.query.shared) {
            courseManagementClient.listCourseSharedLectures(token, repo, req.params.courseId, cb);
        } else {
            courseManagementClient.listCourseLectures(token, repo, req.params.courseId, cb);
        }
    });

};
