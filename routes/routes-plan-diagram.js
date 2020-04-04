/**
 * Copyright Digital Engagement Xperience 2019
 */
/*jslint node: true */
'use strict';

const express = require('express');
const logFormatter = require('dex-logger').logFormatter;
const resource = 'ep-ui-editor';
const KBSqlDao = require('dex-dao').kb.SqlDao;
const SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
const errors = require('dex-errors');
const async = require('async');
const _ = require('underscore');
const ScContainer = require('icep-scm').scClient.scContainer;
const generalUtils = require('ps-ice').generalUtils;

module.exports = function (config, auth) {

    const router = express.Router();


    const sysTokenUtil = new SystemTokenUtil(config);
    let mapping = {
        ep_ui_data_id:'id',
        title:'title',
        data:'data',
        data_type:'dataType',
        modified_time:'modifiedAt',
        tenant:'tenant',
    };

    let mappingBkp = {
        ep_ui_data_id:'id',
        title:'title',
        data:'data',
        data_type:'dataType',
        insert_time:'insertAt',
        tenant:'tenant',
    };

    const ds = config.tpAllocatorDatastore;
    const dao = new KBSqlDao(config, ds , 'ep_ui_data', mapping);

    const bkpDao = new KBSqlDao(config, ds , 'ep_ui_data_backup', mappingBkp);

    const logBkp = logFormatter(resource,'backup');

    function _insertBackup(token, insert) {

        logBkp.debug('run');


        let id = insert.id  || 'missing'
        bkpDao.insert(token,[insert],function(err, data) {
            if (err) {
                logBkp.error('error writing backup', {uiId: id });
            }
            logBkp.debug('success');
        });
    }



    router.put('/:id',  auth.ensureAuthenticated, (req, res, next) => {

        debugger;
        let logger = logFormatter(resource,'set');
        //look up
        let id = req.params.id;

        let dataType = req.query.dataType || 'jointjs';
        let tenant = req.tenant;
        let data = req.body;
        if (!data || !data.data) {
            return next(new errors.Validation('must support data'));
        }
        let title = data.title || '';

        logger.debug('called',{data: data, tenant:tenant, diagramId: id, dataType:dataType});
        debugger;


        var dataStr = '{}';
        if (!_.isString(data.data)) {
            try {
                dataStr = JSON.stringify(data.data);
            }catch(e) {
                logger.error('invalid data', {data:data.data});
                debugger;
            }
        } else {
            dataStr = data.data;
        }

        let toInsert = {
            tenant: tenant,
            title: title,
            data: dataStr,
            dataType:dataType,
            id: id
        };


        let queryFilter = {
            tenant: tenant,
            id: id
        };
        async.auto({
            token: function (cb) {
                sysTokenUtil.getSystemAuthToken(cb);
            },
            exists: ['token',function (result, cb) {
                dao.select(result.token, queryFilter, cb);
            }],
            insert: ['token','exists',function (result, cb) {
                if (result.exists && result.exists.length > 0) {
                    dao.update(result.token, queryFilter, toInsert,cb);
                }else {
                    dao.insert(result.token, [toInsert],cb);
                }
            }],
        }, function (err, results) {

            _insertBackup(results.token, toInsert);

            if (err) {
                return next(err);
            }
            res.status(200).send({id:id});
        });

    });


    router.get('/:id', auth.ensureAuthenticated, (req, res, next) => {
        //get allocations
        let logger = logFormatter(resource,'get');
        let id = req.params.id;
        logger.debug('called', {id: id});
        let tenant = req.tenant;



        let filter = {
            tenant: tenant,
            id: id,
        };

        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                return next(err);
            }
            dao.select(token, filter, (err, data) => {
                if (err) {
                    return next(err);
                }

                let resp =  (data && data.length > 0 ? data[0]: null);
                if (!resp) {
                    return next(new errors.NotFound('no diagram found'));
                }


                let result = {
                    id: resp.id,
                    dataType: resp.dataType,
                    title: resp.title || '',
                    modifiedAt: resp.modifiedAt,
                    data: resp.data
                };

                res.status(200).send(result);

            });
        });
    });
    return router;
};
