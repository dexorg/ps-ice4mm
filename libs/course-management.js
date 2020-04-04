/**
 * Copyright Digital Engagement Xperience 2014-2017
 */

//TODO: migrate to BCs from Course

/*jslint node: true */
'use strict';
var _ = require('underscore');
var http = require('http');
var async = require('async');
var moment = require('moment');
var utils = require('dex-http-client').utils;
var SCContainerClient = require('icep-scm').scClient.scContainer;
var EngagementPatternBuilder = require('ps-ice').engPatternBuilder;
var MetricsClient = require('ps-ice').metricsClient;
var errors = require('dex-errors');
var TpmUtilsV2 = require('ps-ice').tpmUtilsV2;
var logger = require('dex-logger');

function CourseManagement(config) {
    var mocks = arguments[1] || {};

    this.config = config;
    this.scContainer = new SCContainerClient(config);
    this.tpmUtils = mocks.tpmUtilsV2 || new TpmUtilsV2(config);
    this.epBuilder = new EngagementPatternBuilder(config);
    this.metricsClient = new MetricsClient(config);
}


/**
 * list lectures in student portal: for student portal, we only list the lectures that are shared and active.
 * @param token used in retriving and udpating function
 * @param touchpoints  touchpoint Ids of a course
 * @param callback
 */
CourseManagement.prototype.listCourseTouchpoints = function(token, touchpoints, callback) {
    var self = this;
    var arrayOfTouchpoints = [];

    var tps = [];
    if (touchpoints && _.isString(touchpoints)) {
        tps = [touchpoints];
    }
    if (touchpoints && _.isArray(touchpoints)) {
        tps = touchpoints;
    }

    var toReturn = [];
    async.each(tps, function (touchpoint, done) {
        //split out prefix separated by ':' or just touchpoint identifier
        var tpId = touchpoint.split(':')[1]?touchpoint.split(':')[1]:touchpoint;
        self.tpmUtils.retrieveFormattedChannelsFromTP(token, tpId, function (err, result) {
            if (err) {
                logger.error('cannot retrieve tp',{tpId:tpId, error:err});
                return done(err);
            }
            result = result || [];
            toReturn = toReturn.concat(result);
            done();
        });
    }, function (err) {
        if (err) {
            return callback(err);
        }
        callback(null,toReturn);
    });
};

/**
 * Return SC with only id and property, and 'links' added for touchpoints
 * @param lectures
 * @param touchpoints
 * @returns {object[]}
 * @private
 */
CourseManagement.prototype._returnLectureWithTouchpointLinks = function(lectures, touchpoints) {

    var links = _.map(touchpoints, function(touchpoint){
        return {type:touchpoint.tpType, link:touchpoint.tpURL, id: touchpoint.tpId};
    });

    return _.map(lectures, function (lecture) {

        var lec = _.pick(lecture, 'id', 'property');
        lec.links = links;
        return lec;
    });
};

/**
 * Filter lis of SC to only return 'active' (where SC has active engagement pattern
 * @param {string} token - access token
 * @param {object} lectures - lectures
 * @param callback
 * @private
 */
CourseManagement.prototype._filterActive = function (token, repo, lectures, callback) {
    var self = this;
    //only return active lectures
    async.filter(lectures, function (lecture, doneFilter) {
        var scParams = {
            scRepo: repo,
            scId: lecture.id,
            extended:true
        };
        //TODO: limit these calls and do them in batches instead, if a lecture has 100 pattern, with 1000s of users, then this will cause loadd on icep-ep
        self.epBuilder.retrieveSCPatternList(token, scParams, function(err, patterns) {
            if (err) {
                return doneFilter(err);
            }

            var isLectureActive = _.some(patterns, function (ep) {
                if (ep && ep.isActive) {
                    if ((ep.pattern.start === 'now' || (moment(ep.pattern.start).isBefore(moment()))) &&
                        (!ep.pattern.end || ep.pattern.end === 'never' || (moment(ep.pattern.end).isAfter(moment())))) {
                        return true;
                    }
                }
            });

            doneFilter(null,isLectureActive);
        });
    }, callback);

};


/**
 * list lectures in student portal: for student portal, we only list the lectures that are shared and active.
 * This is essentially the exact same as listCourseLectures except it filters the ones with 'active' EPs
 * @param {string} token - access token
 * @param {string} repo - SC repository
 * @param {string} courseId - SC id
 * @param callback
 */
CourseManagement.prototype.listCourseSharedLectures = function(token, repo, courseId, callback) {
    var self = this;
    self.listCourseLectures(token, repo, courseId, function (err, results) {
        if (err) {
            return callback(err);
        }
        var lectures = results.lectures || [];
        self._filterActive(token, repo, lectures, function (err,filtered) {
            if (err) {
                return callback(err);
            }
            callback(null, {course: results.course, touchpoints: results.touchpoints, lectures: filtered});
        });
    });
};

/**
 * list lectures in student portal: for prof portal,
 * @param {string} token - tenant access token
 * @param {string} repo  - required for retrieving concept
 * @param {string} bciId - Business Concept instance Id (SC id)
 * @param callback - returns err or object with keys: {course, touchpoints, lectures}
 */
CourseManagement.prototype.listCourseLectures = function(token, repo, courseId, callback) {
    var self = this;
    async.auto({
        retrieveCourse: function(done) {
            var args = {
                sort: '-date',
                shallow: 'true'
            };
            self.scContainer.retrieveWithArgs(token, repo, courseId, args, done);
        },
        retrieveCourseTouchpoints: ['retrieveCourse', function(results, done) {
            if(results.retrieveCourse && results.retrieveCourse.property && results.retrieveCourse.property.touchpoints) {
                self.listCourseTouchpoints(token, results.retrieveCourse.property.touchpoints, done);
            } else {
                //no touchpoints skip
                done(null,[]);
            }
        }],
        retrieveLectures: ['retrieveCourse', 'retrieveCourseTouchpoints', function(results, done) {

            var args = {
                sort: '-date',
                shallow: 'true'
            };
            //TODO: Add pagination, currenlty, only the first 100 lectures are retrieved.
            self.scContainer.listSubResource(token, repo, results.retrieveCourse.id, 'smartcontentobject', args, function(err, lectures){
                if(err) {
                    done(err);
                } else {
                    lectures = lectures || [];
                    //filtered to only return property and id and links
                    var result = self._returnLectureWithTouchpointLinks(lectures,results.retrieveCourseTouchpoints);
                    done(null,result);
                }
            });
        }]
    }, function(err, results){
        if(err) {
            callback(err);
        }
        else {
            if(results && results.retrieveCourse && results.retrieveCourseTouchpoints && results.retrieveLectures) {
                callback(null, {course: results.retrieveCourse, touchpoints: results.retrieveCourseTouchpoints, lectures: results.retrieveLectures});
            }else {
                callback(null, {});
            }
        }
    });
};


/**
 * updateProperty: ability to update property of course
 * @param {string} token - tenant access token
 * @param {string} repo  - required for retrieving concept
 * @param {string} courseId
 * @param data: {version:string,propertyData:[]} array with property items need to be udpate and the version info
 * @param callback
 */
CourseManagement.prototype.updateProperty = function(token, repo, courseId, data, callback) {
    var self = this;
    self.scContainer.partialUpdateSCProperty(token, repo, courseId, data,callback);
};

module.exports = CourseManagement;
