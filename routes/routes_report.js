/**
 * Copyright Digital Engagement Xperiance
 * Date: 22/06/15
 * @author Ali Hussain
 * @description
 */


const _ = require('underscore');
const http = require('http');
//const ReportIntelligence = require('../libs/reportManager/reportIntelligence');
//const ReportLayout = require('../libs/reportManager/reportLayout');
const appApiAuth = require('dex-authentication').authenticator.appApi;
const errors = require('dex-errors');
const async = require('async');
const generalUtils = require('ps-ice').generalUtils;

var GenericHTTPClient = require('dex-http-client').generic;
const logFormatter = require('dex-logger').logFormatter;
const KBSqlDao = require('dex-dao').kb.SqlDao;
/**
 *
 * @param {object} app - express app reference
 * @param {config} config - configuration (Required for ReportIntelligence, ReportLayout, and appApiAuth)
 * @param {object} systemTokenUtil - system token utility
 * @param {object} [authenticator=appApiAuth(config)] - authenticator implementing function ensureAuthenticated and getAccessToken
 */
module.exports = function (app, config, systemTokenUtil, authenticator) {
    'use strict';

    var auth = authenticator || appApiAuth(config);
    //var reportIntelligence = new ReportIntelligence(config);
    //var reportLayout = new ReportLayout(config);

    var mocks = arguments[4] || {};


    // /**
    //  * Retrieve list of reporting intelligence
    //  */
    // app.get('/report/intelligence/:database', auth.ensureAuthenticated, function (req, res, next) {
    //
    //     var handleResponse = function(err, data) {
    //         if (err) {
    //             next(err);
    //         }else {
    //             res.status(200).send(data);
    //         }
    //     };
    //
    //     var token = auth.getAccessToken(req);
    //     var database = req.params.database;
    //     reportIntelligence.listIntelligence(database, token, handleResponse);
    // });
    // /**
    //  * Retrieve list of instance data
    //  */
    // app.get('/report/intelligence/:database/:table/:rows', auth.ensureAuthenticated, function (req, res, next) {
    //
    //     async.waterfall(
    //         [
    //             function listIntelligenceData(done) {
    //                 var token = auth.getAccessToken(req);
    //                 var database = req.params.database;
    //                 var table = req.params.table;
    //                 var rows = req.params.rows;
    //                 var query=req.query.query || 'select '+rows +'from '+table;
    //                 var page = req.query.page || 100;
    //                 var limit = req.query.limit || 0;
    //                 reportIntelligence.listIntelligenceData(database, table, rows, query, page, limit, token, done);
    //             },
    //             function getSchemaRows(data, done) {
    //                 var elements = [];
    //                 if(data.result && data.result.rows) {
    //                     var dataObj = data.result;
    //                     var element = {};
    //                     async.each(data.result.rows, function(row, callback) {
    //                         element = {};
    //                         var allRows = _.after(row.length, function(){
    //                             elements.push(element);
    //                             callback();
    //
    //                         });
    //                         function forEachRow(eachRow, indexR, list) {
    //                             element[dataObj.headers[indexR]]= row[indexR];
    //                             allRows();
    //
    //                         }
    //                         _.each(row, forEachRow);
    //                     },
    //                     function(err){
    //                         // if any of the file processing produced an error, err would equal that error
    //                         if( err ) {
    //                             next(err);
    //                         } else {
    //                             res.status(200).send(elements);
    //                         }
    //                     });
    //
    //                 }
    //                 else {
    //                     res.status(200).send(data);
    //
    //                 }
    //             }
    //         ], function(err, result){
    //             next(err, result);
    //         }
    //     );
    // });
    //
    //
    // /**
    //  * Retrieve Layout
    //  */
    // app.get('/report/layout/:id/', auth.ensureAuthenticated, function (req, res, next) {
    //
    //     var handleResponse = function (err, data) {
    //         if (err) {
    //             next(err);
    //         }else {
    //             res.status(200).send(data);
    //         }
    //     };
    //     var id = req.params.id;
    //     reportLayout.retrieveLayout(id, handleResponse);
    // });
    //
    // /**
    //  * Create conceptual intelligene
    //  */
    // app.post('/:repo/report/:id/intelligence/conceptual/', auth.ensureAuthenticated, function (req, res, next) {
    //
    //     var handleResponse = function (err, data) {
    //         if (err) {
    //             next(err);
    //         }else {
    //             res.status(200).send(data);
    //         }
    //     };
    //     var reportId = req.params.id;
    //     var repo = req.params.repo;
    //     var body = req.body;
    //     var token = auth.getAccessToken(req);
    //     reportIntelligence.createConceptualIntelligence(token, repo, reportId, body, handleResponse);
    // });
    //
    // /**
    //  * Create informational intelligence
    //  */
    // app.post('/:repo/report/intelligence/conceptual/:conceptualId/informational/', auth.ensureAuthenticated, function (req, res, next) {
    //
    //     var handleResponse = function (err, data) {
    //         if (err) {
    //             next(err);
    //         }else {
    //             res.status(200).send(data);
    //         }
    //     };
    //     var conceptId = req.params.conceptualId;
    //     var repo = req.params.repo;
    //     var body = req.body;
    //     var token = auth.getAccessToken(req);
    //     reportIntelligence.createInformationalIntelligence(token, repo, conceptId, body, handleResponse);
    // });
    //
    // /**
    //  * delete conceptual intelligence with all its informational intelligence as well
    //  */
    // app.delete('/:repo/report/:id/intelligence/conceptual/:conceptualId', auth.ensureAuthenticated, function (req, res, next) {
    //
    //     var handleResponse = function (err, data) {
    //         if (err) {
    //             next(err);
    //         }else {
    //             res.status(200).send(data);
    //         }
    //     };
    //     var reportId = req.params.id;
    //     var conceptId = req.params.conceptualId;
    //     var repo = req.params.repo;
    //     var token = auth.getAccessToken(req);
    //     reportIntelligence.deleteConceptuallIntelligence(token, repo, reportId, conceptId, handleResponse);
    // });
    //
    //

    /**
     * Retrieve list of analysis  intelligence
     */
    app.post('/analysis-report', auth.ensureAuthenticated, function (req, res, next) {

        var handleResponse = function(err, data) {
            if (err) {
                next(err);
            }else {
                res.status(200).send(data);
            }
        };

        var token = auth.getAccessToken(req);

        var analysisClient = new GenericHTTPClient ('brain-latest.herokuapp.com', 80, false, '/re/resolve');
        analysisClient.createWithFullResponse(token, req.body, handleResponse);

    });

    /**
     * Generates a report link to turnilo
     */
    app.post('/report-link', auth.ensureAuthenticated, function (req, res, next) {

        var handleResponse = function(err, data) {
            if (err) {
                next(err);
            }else {
                res.status(200).send(data);
            }
        };
        var token = auth.getAccessToken(req);
        var client = new GenericHTTPClient ('intelligence-turnilo.herokuapp.com', 80, false, '/mkurl');

        client.createWithFullResponse(token, req.body, handleResponse);

    });

    const ds = config.rae.datastore;

    let mapping= {
        id:'id',
        tenant:'tenant',
        name:'name',
        bc_type:'bcType',
        bci_id: 'bciId',
        classification:'classification',
        intel_type:'intelType',
        intel_location:'location',
        intel_definition:'definition',
        modified_time:'modifiedTime',
        created_time:'createdTime'
    };
    let bcIntelDao = mocks.bcIntelDao || new KBSqlDao(config, ds , 'bc_def_intel', mapping);



    function formatBCIntelOutgoing(val) {
        var dat =  _.omit(val, 'tenant');
        if (_.isString(dat.definition)) {
            dat.definition = generalUtils.parseJSONSafely(val.definition);
        }
        return dat;
    }

    /**
     * Get available intelligence by bcId
     */
    app.get('/bc-available-intelligence', auth.ensureAuthenticated, function (req, res, next) {

        let logger = logFormatter('bc-available-intelligence','retrieve');
        let tenant = req.tenant;

        if (!req.query.bci_id) {
            return next(new errors.Validation('missing required parameter'));
        }

        systemTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                logger.error('could not acquire system token');
                return next(err);

            }
            let filter = {
                tenant: tenant,
                bciId: req.query.bci_id
            };
            bcIntelDao.select(token, filter, (err, data) => {
                if (err) {
                    logger.error('could not retrieve data');
                    return next(err);
                }
                var toReturn = _.map(data, formatBCIntelOutgoing);
                res.status(200).send(toReturn);
            });
        });
    });

    /**
     * Add intelligence intelligence for performance report
     */
    app.post('/bc-available-intelligence', auth.ensureAuthenticated, function (req, res, next) {

        let logger = logFormatter('bc-available-intelligence','add');
        let tenant = req.tenant;

        let params = req.body;

        if (!params.bciId) {
            return next(new errors.Validation('BCi Id required'));
        }

        systemTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                logger.error('could not acquire system token');
                return next(err);
            }
            if (params.definition && _.isObject(params.definition)) {
                params.definition = JSON.stringify(params.definition);
            }
            let items = [];
            items.push( _.extend(params, {tenant:tenant}) );
            bcIntelDao.insert(token,items, function (err, data) {
                if (err) {
                    return next(err);
                }
                let toReturn = (data && data.length > 0 ? data[0] : null);
                if (!toReturn){
                    return next(new errors.HttpStatus(500, 'Problem adding intelligence'));
                }
                res.status(200).send(toReturn);
            });
        });
    });

    /**
     * Remove available intelligence intelligence for performance report
     */
    app.delete('/bc-available-intelligence', auth.ensureAuthenticated, function (req, res, next) {

        let logger = logFormatter('bc-available-intelligence','add');
        let tenant = req.tenant;
        let ids = req.body;



        //let bciId = req.query.bci_id

        systemTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                logger.error('could not acquire system token');
                return next(err);
            }

            async.each(ids, function (id, cb) {
                let filter = {
                    id: id,
                    tenant: tenant
                }
                bcIntelDao.delete(token,filter, function (err) {
                    if (err) {
                        return cb(err);
                    }
                    cb(err);
                });

            }, function (err) {
                if (err){
                    return next(new errors.HttpStatus(500, 'Problem removing intelligence'));
                }
                res.status(200).send({count:ids.length});
            });

        });
    });


    let iconMapping = {
        id:'id',
        tenant:'tenant',
        ep_id: 'epId',
        ep_revision: 'epRevision',
        icon_link: 'icon',
        display_text: 'iconText',
        created_at: 'createdAt'
    };

    const dsIcon = config.tpAllocatorDatastore;
    const daoIcon = new KBSqlDao(config, dsIcon , 'campaign_icon', iconMapping);



    app.put('/campaign-icon/:id', auth.ensureAuthenticated, function (req, res, next) {

        let logger = logFormatter('campaign-icon', 'set');
        let tenant = req.tenant;

        let epId = req.params.id;
        let params = req.body;
        if (!params) {
            return next(new errors.Validation('missing icon or icon text'));
        }

        if (!(params.icon || params.text)) {
            return next(new errors.Validation('missing icon or icon text'));
        }

        systemTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                return next(err);
            }
            let toInsert = {
                tenant: tenant,
                epId: epId,
                icon: (params.icon || ''),
                iconText: (params.text || '')
            };

            daoIcon.delete(token, {tenant: tenant, epId: epId}, (errR) => {
                if (errR) {
                   logger.warn('could not remove existing',errR);
                }

                daoIcon.insert(token,[toInsert], (err1) => {
                    if (err1) {
                        return next(err);
                    }
                    res.status(204).send();

                });
            });




        })



    });


};
