/**
 * Created by ali on 19/03/15.
 */

/**
 * Copyright Digital Enagement Xperience 2015
 * Created by Ali on 03/04/16.
 */

/*jslint node: true */
'use strict';

// third party modules
var _ = require('underscore');
var async = require('async');
var moment = require('moment');
// DEX modules
var errors = require('dex-errors');
var logger = require('dex-logger');
var scObject = require('icep-scm').scClient.scObject;
var scContainer = require('icep-scm').scClient.scContainer;
var scMultimedia = require('icep-scm').scClient.scMultimedia;
var scIntelligence = require('icep-scm').scClient.scIntelligence;
var scLayout = require('icep-scm').scClient.scLayout;
var SCClient = require('dex-http-client').scc;
var EngagementPatternBuilder = require('ps-ice').engPatternBuilder;
var BehaviourManager = require('ps-ice').behaviourManager;
var UserProfileClient = require('dex-http-client').userProfile;
var SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
var MetricsClient = require('ps-ice').metricsClient;

var TpmUtilsV2 = require('ps-ice').tpmUtilsV2;
/**
 * Class for managing lectures.
 *
 * @param {object} config - system configuration
 * @constructor
 */
function LectureManager(config) {

    var mocks = arguments[1] || {};

    this.config = config;
    this.scmObjectClient = new scObject(config);
    this.scmContainerClient = new scContainer(config);
    this.scmMultimediaClient = new scMultimedia(config);
    this.scmIntelligenceClient = new scIntelligence(config);
    this.sc = new SCClient(config);
    this.scmLayoutClient = new scLayout(config);
    this.scBehaviour = new BehaviourManager(config);
    this.epBuilder = new EngagementPatternBuilder(config);
    this.upmClient = new UserProfileClient(config);
    this.systemTokenUtil = new SystemTokenUtil(config);
    this.tpmUtils =  mocks.tpmUtilsV2 || new TpmUtilsV2(config);
    this.metricsClient = new MetricsClient(config);
}

/**
 * Create a lecture
 *
 * @param {string} courseId - the id of the course this lecture to be created under
 * @param {string} token - access token
 * @param {string} repo - scp repository
 * @param {object} body - body used to create lecture
 * @param callback: callback function.
 */


LectureManager.prototype.createLecture = function (token, repo, courseId, body, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!courseId) {
        logger.error('courseId is not defined');
        return callback(new errors.Validation('course id is undefined'));
    }

    if (!body) {
        logger.error('lecture data is not defined');
        return callback(new errors.Validation('lecture data is undefined'));
    }

    self.scmObjectClient.create(token, repo, body, courseId, callback);
};

/**
 * Add multimedia to a lecture (includes creating the content, assign all MMs and create the layout.
 *
 * @param {string} lectureId - the id of the lecture the multimedia will be added to
 * @param {string} token - access token
 * @param {string} repo - scp repository
 * @param {object} body - body used to create lecture
 * @param {string} mmType - type of mulitmedia (ie image, video, text, etc)
 * @param callback: callback function.
 */


LectureManager.prototype.AddMultimediaToLecture = function (token, repo, lectureId, body, mmType, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!lectureId) {
        logger.error('courseId is not defined');
        return callback(new errors.Validation('course id is undefined'));
    }
    if (!body) {
        logger.error('multimedia data is not defined');
        return callback(new errors.Validation('multimedia data is undefined'));
    }
    if (!mmType) {
        logger.error('multimedia type is not defined');
        return callback(new errors.Validation('multimedia type is undefined'));
    }

    var params = {
        parentId: lectureId,
        repo: repo,
        type: mmType
    };
    self.scmMultimediaClient.createMultimediaResource(token, params, body, callback);
};

/**
 * Add Intelligence to a lecture.
 *
 * @param {string} token - access token
 * @param {object} params - params to create intelligence (ie, repo, type, etc)
 * @param {object} body - body used to create lecture
 * @param callback: callback function.
 */


LectureManager.prototype.AddIntelligenceToLecture = function (token, params, body, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!params) {
        logger.error('intelligence params is not defined');
        return callback(new errors.Validation('intelligence parameters is undefined'));
    }
    if (!body) {
        logger.error('intelligence data is not defined');
        return callback(new errors.Validation('intelligence data is undefined'));
    }
    //TODO (AH) Find a better way to use the schema to be part of the intelligence.
    body.schema = self.config.intelligenceSchema || {};
    body.schemaType = 'http://json-schema.org/draft-04/schema#';
    if(params.type) {
        self.scmIntelligenceClient.addValidType(params.type);
    }
    self.scmIntelligenceClient.createIntelligenceResource(token, params, body, callback);
};

/**
 * Delete Intelligence from a lecture.
 *
 * @param {string} token - access token
 * @param {object} params - params to create intelligence (ie, repo, type, parentId, etc)
 * @param callback: callback function.
 */


LectureManager.prototype.DeleteIntelligenceFromLecture = function (token, params, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!params) {
        logger.error('intelligence params is not defined');
        return callback(new errors.Validation('intelligence params is undefined'));
    }
    if(params.type) {
        self.scmIntelligenceClient.addValidType(params.type);
    }
    self.scmIntelligenceClient.deleteIntelligenceResource(token, params, callback);
};

/**
 * Add layout to a lecture (includes creating the content, assign all MMs and create the layout.
 *
 * @param {string} lectureId - the id of the lecture the multimedia will be added to
 * @param {string} token - access token
 * @param {string} repo - scp repository
 * @param {object} body - body used to create lecture
 * @param callback: callback function.
 */


LectureManager.prototype.AddLayoutToLecture = function (token, repo, lectureId, body, mmList, layoutType, username, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!lectureId) {
        logger.error('courseId is not defined');
        return callback(new errors.Validation('course id is undefined'));
    }

    if (!body || !body.name) {
        logger.error('required layout data is not defined');
        return callback(new errors.Validation('layout data is undefined'));
    }

    var layoutBody = {
        content: generateLayout(body.name, mmList, layoutType, username, self.config)
    };

    self.scmLayoutClient.create(token, repo, lectureId, layoutBody, callback);
};

LectureManager.prototype.AuthorEP = function (token, repo, lectureId, pattern, callback) {

    var self = this;

    var ePattern;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!lectureId) {
        logger.error('courseId is not defined');
        return callback(new errors.Validation('course id is undefined'));
    }
    if(!pattern) {
        logger.error('pattern is not defined');
        return callback(new errors.Validation('pattern is undefined'));
    }

    //TODO: clone/pass objects around in less hacky way
    ePattern = JSON.parse(JSON.stringify(pattern));  //cloning object into engagementBuilderVM.ePattern
    ePattern.element = [];
    ePattern.connection = [];
    ePattern.connection[0] = (JSON.parse(JSON.stringify(pattern.connection[0])));
    ePattern.connection[1] = (JSON.parse(JSON.stringify(pattern.connection[1])));
    ePattern.connection[1].to = 'end';
    var touchpoints = pattern.touchpoints;
    var generalTPs = [], uccTPs = [];

    async.each(touchpoints, function (touchpoint, doneList) {
        self.tpmUtils.retrieveFormattedChannelsFromTP(token, touchpoint, function(err, tp) {
            if(tp.tpType && tp.tpType.toLowerCase().indexOf('ucc')>-1) {
                uccTPs.push(tp.tpId);
            } else {
                generalTPs.push(tp.tpId);
            }
            doneList();
        });
    }, function(){
        if(pattern.element && pattern.element.length>0) {
            var allElements = _.after(pattern.element.length, function () {
                async.waterfall(
                    [
                        function createEPforGeneral(next) {
                            if (generalTPs && generalTPs.length > 0) {
                                ePattern.touchpoint = generalTPs;
                                ePattern.type = 'general';
                                var generalBody = {
                                    scId: lectureId,
                                    scRepo: repo,
                                    pattern: ePattern
                                };
                                self.epBuilder.storePattern(token, ePattern, generalBody, next);
                            } else {
                                next();
                            }
                        }, function createEPforUCC(res, next) {
                            if (uccTPs && uccTPs.length > 0) {
                                ePattern.touchpoint = generalTPs;
                                ePattern.type = 'ucc';
                                var uccBody = {
                                    scId: lectureId,
                                    scRepo: repo,
                                    pattern: ePattern
                                };
                                self.epBuilder.storePattern(token, ePattern, uccBody, next);
                            } else {
                                next();
                            }
                        }
                    ], callback);
            });
            var forEachElement = function (element, index, list) {
                if (element && element.type_id !== '') {
                    ePattern.element.push(element);
                }
                allElements();
            };
            _.each(pattern.element, forEachElement);
        } else {
            callback();
        }
    });

};


/**
 * Author lecture (includes creating the content, assign all MMs, creating the layout and finally authoring the EP (default ep for now).
 *
 * @param {string} token - access token
 * @param {string} repo - scp repository
 * @param {object} body - body used to create lecture
 * @param callback: callback function.
 *
 */

LectureManager.prototype.AuthorLecture = function (token, repo, body, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!body || !body.courseId || !body.name) {
        logger.error('required body is not defined');
        return callback(new errors.Validation('body is undefined'));
    }

    async.auto({
        retrieveCourse: function(next) {
            var args = {
                filter: {ls:'code', rs:body.courseId}
            };

            logger.info('resource: course action: retrieve data: ', args.filter);
            self.scmContainerClient.list(token, repo, args, function(err, courseList){
                if(err){
                    logger.error('resource: course action: retrieve response error: ', err);
                    next(err);
                }else if(courseList && courseList.length > 0){
                    next(null, courseList);
                }else{
                    logger.error('resource: course: action: retrieve response data: ',
                        {'courseListLength': courseList.length, 'courseId': args.filter.rs} );
                    var courseRetrieveError = new Error('courseList is empty');
                    next(courseRetrieveError);
                }
            });
        },
        retrieveEPtemplate: function(next) {
            self.epBuilder.listTemplates(function(err, templates) {
                if (err) {
                    logger.error('cannot retrieve epTemplate');
                    next(err);
                } else {
                    //TODO (AH): Currently we are only using one engagement pattern template, hence using templates[0]
                    var epTemplate = JSON.stringify(templates[0]);
                    next(null, epTemplate);
                }
            });
        },
        createLecture: ['retrieveCourse', function(results, next) {
            var scBody =  {name: body.name, type: 'lecture'};

            logger.info('resource: lecture action: create check data: ', results);
            //need to retrieve first element of the array, bc only one course should have that course code
            if ( results.retrieveCourse && results.retrieveCourse[0] && results.retrieveCourse[0].id ) {
                logger.info('resource: lecture action: create data: ', scBody);
                self.createLecture(token, repo, results.retrieveCourse[0].id, scBody, next);
            } else {
                var lectureError = new Error('missing required information to create lecture');

                next(lectureError);
            }
        }],
        filteredMMList: function(next) {
            filterMultimedia(body.mm, next);
        },
        addMultimedia: ['createLecture', 'filteredMMList', function(results, next) {
            var mmList = results.filteredMMList;
            var counter = 0;
            var dataName = {
                name: body.name,
                content: body.name,
                tag: 'property-mm-1',
                location:''
            };
            self.AddMultimediaToLecture(token, repo, results.createLecture.id, dataName, 'text', function (err, res){
                if(err) {
                    logger.error('Cannot create mm');
                }
            });
            async.each(mmList, function (mm, doneList) {
                if(mm.type.indexOf('image')>-1) {
                    var dataImage = {
                        name: mm.key,
                        content: '',
                        tag: 'ep-1-mm-image-0',
                        location:mm.url
                    };
                    self.AddMultimediaToLecture(token, repo, results.createLecture.id, dataImage, 'image', doneList);
                } else if(mm.type.indexOf('video')>-1) {
                    var dataVideo = {
                        name: mm.key,
                        content: '',
                        tag: 'ep-1-mm-video-0',
                        location:mm.url
                    };
                    self.AddMultimediaToLecture(token, repo, results.createLecture.id, dataVideo, 'video', doneList);
                } else if(mm.type.indexOf('text')>-1 || mm.type.indexOf('document')>-1) {
                    var dataText = {
                        name: mm.key,
                        content: mm.key+': '+mm.url,
                        tag: 'ep-1-mm-links-'+counter,
                        location:mm.url
                    };
                    counter++;
                    self.AddMultimediaToLecture(token, repo, results.createLecture.id, dataText, 'text', doneList);
                }
            }, next);
        }],
        addLayout: ['createLecture', 'filteredMMList', 'addMultimedia', function(results, next) {
            self.AddLayoutToLecture(token, repo, results.createLecture.id, body, results.filteredMMList, 'lecture', null, next);
        }],
        addEPattern: ['retrieveCourse', 'retrieveEPtemplate', 'createLecture', 'addMultimedia', 'addLayout', function(results, next) {
            var pattern = JSON.parse(results.retrieveEPtemplate);
            var tpArrays = [];
            //if touchpoints are more than one, they got stored as an array in the course properties, otherwise, if its just one, it gets stored as a string
            //therefore, we need to check if touchpoints are stored as arrays in the course properties
            if(results.retrieveCourse[0].property.touchpoints instanceof Array) {
                _.each(results.retrieveCourse[0].property.touchpoints, function (tpId) {
                    tpArrays.push(tpId.split(':')[1]);
                });
            }else if(results.retrieveCourse[0].property.touchpoints instanceof Array === false) {
                tpArrays.push(results.retrieveCourse[0].property.touchpoints.split(':')[1]);
            } else {
                logger.info('this course does not have any touchpoints assigned to it');
            }
            pattern.touchpoints = tpArrays;
            if(pattern && pattern.element[0]) {
                pattern.element[0].type_id = 'sc:'+results.createLecture.id+':layout:'+results.addLayout.id;
            }
            self.AuthorEP(token, repo, results.createLecture.id, pattern, next);
        }]
    }, function(err, results){
        if(err) {
            callback(err);
        } else {
            if(results.createLecture && results.createLecture.id) {
                callback(null, {'lectureId': results.createLecture.id});
            } else {
                callback(null, {});
            }
        }
    });
};


LectureManager.prototype.ShareLecture = function (req, token, repo, lectureId, body, callback) {

    var self = this;

    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!lectureId) {
        logger.error('lectureId is not defined');
        return callback(new errors.Validation('lecture id is undefined'));
    }
    if(!body || !body.user || !body.user.id) {
        logger.error('user is not defined');
        return callback(new errors.Validation('user id is undefined'));
    }

    var userfullname;
    if(body.user.attributes && body.user.attributes.firstName && body.user.attributes.lastName) {
        userfullname = body.user.attributes.firstName + ' '+body.user.attributes.lastName;
    } else {
        userfullname = 'prof';
    }

    async.auto({
        retrieveSocialUserId: function(next) {
            self.systemTokenUtil.getSystemAuthToken(function(err, sysToken) {
                if (err) {
                    next(err);
                }
                else {
                    self.upmClient.setAccessToken(sysToken);
                    self.upmClient.listNetworks(body.user.id, function (err, networks) {
                        if (err) {
                            logger.error('Cannot retrieve user networks');
                            next(err);
                        } else {
                            var userFBId = '';
                            //TODO: Find the specific fbId assigned to the fbApp, now, we assume each user has only one facebook network
                            var facebookNetwork = _.findWhere(networks, {name: 'facebook'});
                            if (facebookNetwork) {
                                userFBId = facebookNetwork.network_user;
                            } else {
                                logger.error('User does not have a facebook network');
                            }
                            next(null, userFBId);
                        }
                    });
                }
            });
        },
        retrieveLecture: function(next) {
            self.scmObjectClient.retrieve(token, repo, lectureId, next);
        },
        retrieveEPoint: ['retrieveLecture', function(results, next) {
            var epId;
            var ePatterns = [];
            async.each(results.retrieveLecture.intelligence, function (intel, doneList) {
                if(intel && intel.kind.indexOf('engagementpattern')>-1) {
                    if(intel.property && intel.property.location) {
                        epId = intel.property.location;
                        self.epBuilder.retrievePattern(token, epId, function(err, ep){
                            if(ep) {
                                ePatterns.push(ep);
                            }
                            doneList();
                        });
                    } else {
                        doneList();
                    }
                } else {
                    doneList();
                }
            }, function(err, res){
                if(ePatterns && (ePatterns.length>0)) {
                    next(null, ePatterns);
                } else {
                    next(new errors.Validation('engagement point is undefined in lecture: '+lectureId));
                }
            });
        }],
        retrieveTouchpointDetails: ['retrieveEPoint', function(results, next) {
            var listOfTouchpoints =  {lectureTPs: {ids:[], urls: []}, notificationTPs: {ids: [], urls:[]}}; //touchpoints are divided either as lecture TPs or notification TPs
            if(results.retrieveEPoint) {
                async.each(results.retrieveEPoint, function (ep, doneAllEPs) {
                    if(ep && ep.pattern && ep.pattern.type.indexOf('general')>-1) {
                        async.each(ep.pattern.touchpoints, function (touchpoint, doneList) {
                            self.tpmUtils.retrieveFormattedChannelsFromTP(token, touchpoint, function(err, tp){
                                if(err) {
                                    logger.error('cannot retrieve touchpoint channels for tp: '+touchpoint);
                                } else {
                                    if(tp.tpType && tp.tpType.toLowerCase().indexOf('twitter')>-1) {
                                        listOfTouchpoints.notificationTPs.ids.push(tp.tpId);
                                        listOfTouchpoints.notificationTPs.urls.push(tp.tpURL);
                                    }else {
                                        listOfTouchpoints.lectureTPs.ids.push(tp.tpId);
                                        listOfTouchpoints.lectureTPs.urls.push(tp.tpURL);
                                    }
                                }
                                doneList();
                            });
                        }, function(err, res){
                            doneAllEPs(err, listOfTouchpoints);
                        });
                    } else {
                        doneAllEPs(null, listOfTouchpoints); //return empty touchpoitns;
                    }
                }, function(err, res){
                    next(err, listOfTouchpoints);
                });
            } else {
                next(null, listOfTouchpoints); //return empty touchpoitns;
            }
        }],
        createLectureSchedule: ['retrieveSocialUserId', 'retrieveLecture', 'retrieveEPoint', 'retrieveTouchpointDetails', function(results, next) {
            if(results.retrieveTouchpointDetails && results.retrieveTouchpointDetails.lectureTPs && results.retrieveTouchpointDetails.lectureTPs.ids && results.retrieveTouchpointDetails.lectureTPs.ids.length>0) {
                var parameters = [];
                _.each(results.retrieveEPoint, function(ep) {
                    if (ep && ep.pattern && ep.pattern.type.indexOf('general') > -1) {
                        if(ep.pattern.element[0]) {
                            parameters.push({'key': 'layout', 'value': ep.pattern.element[0].type_id.split(':')[3]});
                        }
                    }
                });

                if(results.retrieveSocialUserId && results.retrieveSocialUserId!=='') {
                    var userIds = {
                        facebook: {
                            id: results.retrieveSocialUserId
                        }
                    };
                    parameters.push({'key': 'user', 'value': JSON.stringify(userIds)});
                } else {
                    logger.info('User does not fbUserId, lecture cannot be shared to facebook');
                }
                parameters.push({'key': 'application', 'value': ''});  // value to be filled by behaviour manager at server side (in ps-ice)
                var scheduledContent = [
                    {id: lectureId, parameters: parameters}
                ];
                var startDate;
                if(body.startDate) {
                    startDate = body.startDate;
                } else {
                    startDate = moment().format();
                }
                var schedule  = {
                    startDate: startDate,
                    contentRepo: repo,
                    timeSlots: [],
                    touchpoints: results.retrieveTouchpointDetails.lectureTPs.ids,
                    scheduledContent: scheduledContent
                };
                // If end date is not specified, then it should be not added to schedule
                if(body.endDate) {
                    schedule.endDate = body.endDate;
                }
                var behaviourId = 'system_behaviour_create_schedule';
                var scheduleBody = {body: schedule};
                var theBody = {schedule: scheduleBody, behaviourId: behaviourId, scId: lectureId};
                self.scBehaviour.execute(req, token, repo, lectureId, theBody, self.config, next);
            } else {
                next();
            }
        }],
        createNotificationSchedule: ['retrieveLecture', 'retrieveEPoint', 'retrieveTouchpointDetails', function(results, next) {
            if(results.retrieveTouchpointDetails && results.retrieveTouchpointDetails.notificationTPs && results.retrieveTouchpointDetails.notificationTPs.ids && results.retrieveTouchpointDetails.notificationTPs.ids.length>0) {
                self.AddLayoutToLecture(token, repo, lectureId, body, null, 'notification', userfullname, function(err, layout){
                    if(err) {
                        next(err);
                    } else {
                        var notificationString = userfullname+' shared lecture '+body.name+', please view it at '+self.config.ice4mURL;
                        var dataName = {
                            name: notificationString,
                            content: notificationString,
                            tag: 'mm-notificationText',
                            location:''
                        };
                        self.AddMultimediaToLecture(token, repo, lectureId, dataName, 'text', function (err, res){
                            if(err) {
                                next(err);
                            } else {
                                var parameters = [];
                                parameters.push({'key': 'layout', 'value': layout.id});
                                var scheduledContent = [
                                    {id: lectureId, parameters: parameters}
                                ];
                                var startDate;
                                if(body.startDate) {
                                    startDate = body.startDate;
                                } else {
                                    startDate = moment().format();
                                }
                                var schedule  = {
                                    startDate: startDate,
                                    contentRepo: repo,
                                    timeSlots: [],
                                    touchpoints: results.retrieveTouchpointDetails.notificationTPs.ids,
                                    scheduledContent: scheduledContent
                                };
                                // If end date is not specified, then it should be not added to schedule
                                if(body.endDate) {
                                    schedule.endDate = body.endDate;
                                }
                                var behaviourId = 'system_behaviour_create_schedule';
                                var scheduleBody = {body: schedule};
                                var theBody = {schedule: scheduleBody, behaviourId: behaviourId, scId: lectureId};
                                self.scBehaviour.execute(req, token, repo, lectureId, theBody, self.config, next);
                            }
                        });
                    }
                });
            } else {
                next();
            }
        }],
        activatePattern: ['retrieveEPoint', 'retrieveTouchpointDetails', 'createLectureSchedule', function(results, next) {
            async.each(results.retrieveEPoint, function (pattern, doneList) {
                self.epBuilder.activatePattern(token, pattern.id, doneList);
            }, function(err, res){
                next();
            });
        }]
    }, function(err, results){
        if(err) {
            callback(err);
        } else {
            var scheduleIds = [];
            if(results.createLectureSchedule && results.createLectureSchedule.id) {
                scheduleIds.push({
                    scheduleId: results.createLectureSchedule.id,
                    urls: results.retrieveTouchpointDetails.lectureTPs.urls
                });
            }
            if(results.createNotificationSchedule && results.createNotificationSchedule.id) {
                scheduleIds.push({
                    scheduleId: results.createNotificationSchedule.id,
                    urls: results.retrieveTouchpointDetails.notificationTPs.urls
                });
            }
            callback(null, {'scheuleIds': scheduleIds});
        }
    });
};


//helper to filter multimedia

function filterMultimedia (resourceFiles, callback) {
    var filesList = [];
    var docs =[], imageOrVideo = {}; // currently ice4e supports only 1 image or 1 video file
    async.each(resourceFiles, function(file, cb) {
        if(file && file.tags) {
            async.each(file.tags, function(fileTag, cbTags) {
                switch(fileTag) {
                    case 'image':
                        imageOrVideo = {key: file.key, url: file.url, type: fileTag};
                        break;
                    case 'video':
                        imageOrVideo = {key: file.key, url: file.url, type: fileTag};
                        break;
                    case 'document':
                        docs.push({key: file.key, url: file.url, type: fileTag});
                        break;
                }
                cbTags();
            });
        } cb();
    }, function(){
        //copying elements of these arrays into filesList array, for images, we are only considered with one image at this stage instead of arrays of images
        if(imageOrVideo && imageOrVideo.key) {
            filesList.push(imageOrVideo);
        }
        _.each(docs, function(doc){
            filesList.push(doc);
        });
        callback(null, filesList);
    });
}

//helper to generate layout
function generateLayout (name, mm, type, username, config){
    var customizedLayout;
    if(type==='notification') {
        var notificationString = username+' shared lecture '+name+', please view it at '+config.ice4mURL;
        customizedLayout = '<html><body><span data-mm-tag="mm-notificationText" data-type="text">'+notificationString+'</span></body></html>';
    } else {
        var layoutText = '', counter=0;
        if(name) {
            layoutText = layoutText+'<span data-mm-tag="property-mm-1" data-type="text"></span>';
        }
        _.each(mm, function(multimedia, index, list){
            if(multimedia && multimedia.type) {
                if (multimedia.type.indexOf('text')>-1 || multimedia.type.indexOf('document')>-1) {
                    var spanVariable = 'ep-1-mm-links-'+counter+' data-type="text"';
                    layoutText = layoutText+'<span data-mm-tag='+spanVariable+'></span>';
                    counter++;
                } else if(multimedia.type.indexOf('image')>-1) {
                    var imageSpanVariable = 'ep-1-mm-image-0';
                    var imageLocation = multimedia.url;
                    layoutText = layoutText+'<img class="eduImage" data-mm-tag='+imageSpanVariable+' ><source src='+imageLocation+'></img>';
                } else if(multimedia.type.indexOf('video')>-1) {
                    var videoSpanVariable = 'ep-1-mm-video-0';
                    var videoLocation = multimedia.url;
                    layoutText = layoutText+'<video autoplay controls class="eduImage" data-mm-tag='+videoSpanVariable+' ><source src='+videoLocation+'></video>';
                }
            }
        });
        customizedLayout='<html><body>'+layoutText+'</body></html>';
    }
    // Return encoded layout
    return new Buffer(customizedLayout).toString('base64');

}

/**
 * Add layout to a lecture (includes creating the content, assign all MMs and create the layout.
 *
 * @param {string} lectureId - the id of the lecture the multimedia will be added to
 * @param {string} token - access token
 * @param {string} repo - scp repository
 * @param {object} touchpoint - touchpoint body
 * @param callback: callback function.
 */


LectureManager.prototype.RetrieveLectureLink = function (token, repo, lectureId, touchpoint, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!lectureId) {
        logger.error('courseId is not defined');
        return callback(new errors.Validation('course id is undefined'));
    }

    if (!touchpoint || !touchpoint.id || !touchpoint.url || !touchpoint.type) {
        logger.error('required touchpoint data is not defined');
        return callback(new errors.Validation('touchpoint data is undefined'));
    }


    var filter = {key: 'touchpoint', id: touchpoint.id};
    self.sc.setAccessToken(token).scm.intelligence.retrieveDataFromRepo(lectureId, repo, 'persistence', filter, function(err, data){
        var linkId = '';
        //NOTE: data is an array of one element, currently we have only one post for each lecture in each touchpoint.
        if(data && data[0] && data[0].data && data[0].data.data && data[0].data.data.postId) {
            //build facebook page preview url
            if(touchpoint.url.indexOf('/pages') > -1) {
                linkId = data[0].data.data.postId;
                callback(err, {linkURL: 'https://www.facebook.com/' + linkId});
                //build twitter preview url
            } else if(touchpoint.type.toLowerCase() === 'twitter'){
                linkId = data[0].data.data.postId;
                callback(err, {linkURL: touchpoint.url+'/status/'+linkId});
            } else {
                // build facebook group preview url
                linkId = data[0].data.data.postId.split('_')[1];
                callback(err, {linkURL: touchpoint.url+linkId});
            }
        } else {
            callback(err);
        }
    });
};

/**
 * Retrieve Lecture details (engagement patterns and metrics).
 *
 * @param {string} lectureId - the id of the lecture the multimedia will be added to
 * @param {string} token - access token
 * @param {string} repo - scp repository
 * @param callback: callback function.
 */


LectureManager.prototype.RetrieveLectureDetails = function (token, repo, lectureId, callback) {

    var self = this;

    // validate inputs
    if (!token) {
        logger.error('token is undefined');
        return callback(new errors.Validation('token is undefined'));
    }
    if (!repo) {
        logger.error('repo is undefined');
        return callback(new errors.Validation('repo is undefined'));
    }
    if (!lectureId) {
        logger.error('courseId is not defined');
        return callback(new errors.Validation('lecture id is undefined'));
    }

    var scParams = {
        scRepo: repo,
        scId: lectureId,
        extended:true
    };
    async.auto({
        retrieveEngagementPatterns: function (done) {
            self.epBuilder.retrieveSCPatternList(token, scParams, done);
        }
    }, function(err, res){
        if(err) {
            callback(err);
        }else {
            var lectureData = {};
            if(res && res.retrieveEngagementPatterns) {
                //Note: currently all engagement patters of a lecture get shared at the same time hence the all get active together with the same start and end date, so to indicate
                //whether a lecture is shared and the time it was shared, its enough to look at the properties of the first engagement pattern.
                if(res.retrieveEngagementPatterns[0]) {
                    lectureData.ePatterns = res.retrieveEngagementPatterns;
                    lectureData.isPatternActive = res.retrieveEngagementPatterns[0].isActive;
                    if(res.retrieveEngagementPatterns[0].pattern && res.retrieveEngagementPatterns[0].pattern.start && res.retrieveEngagementPatterns[0].pattern.start!=='now') {
                        lectureData.patternStart = res.retrieveEngagementPatterns[0].pattern.start;
                    }
                    if(res.retrieveEngagementPatterns[0].pattern && res.retrieveEngagementPatterns[0].pattern.end && res.retrieveEngagementPatterns[0].pattern.end!=='never') {
                        lectureData.patternEnd = res.retrieveEngagementPatterns[0].pattern.end;
                    }
                }

            }
            callback(null, lectureData);
        }
    });

};
module.exports = LectureManager;
