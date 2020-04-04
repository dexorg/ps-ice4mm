/**
 * Copyright Digital Engagement Xperience 2019
 */
/*jslint node: true */
'use strict';

const express = require('express');
const logFormatter = require('dex-logger').logFormatter;
const resource = 'tp-allocator';
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
        id:'id',
        tenant:'tenant',
        tp_id: 'tpId',
        source_ep_id: 'sourceEpId',
        source_ep_revision: 'sourceEpRevision',
        display_ep_id: 'epId',
        display_ep_revision: 'epRevision',
        dynamic_placeholder: 'dynamicPlaceholder',
        segment: 'segment',
        created_at: 'createdAt'
    };

    const ds = config.tpAllocatorDatastore;
    const dao = new KBSqlDao(config, ds , 'campaign_dynamic_allocation', mapping);

    const availableSegments = ['A','B','C'];

    const scClient = new ScContainer(config);

    router.put('/:id',  auth.ensureAuthenticated, (req, res, next) => {



        let logger = logFormatter(resource,'set');
        //look up
        let revision = req.query.epRevision || 'latest';
        let tpId = req.query.touchpoint;
        let id = req.params.id;
        let tenant = req.tenant;


        let data = req.body;
        if (!data || data.length < 1) {
            return next(new errors.Validation('must support data'));
        }

        logger.debug('called',{data: data, tenant:tenant, sourceEpId: id, tpId:tpId});
        debugger;

        let toInsert = [];


        _.each(availableSegments, (segment) => {

            let mapped = _.map(data, (item) => {
                return {
                    tenant: tenant,
                    tpId: tpId,
                    sourceEpId: id,
                    sourceEpRevision: revision || 'latest',
                    epId: ( item.campaign.id || item.campaign.campaign.id) ,
                    epRevision:  item.campaign.revision || 'latest',
                    dynamicPlaceholder: item.dynamicPlaceholder || item.elementTag,
                    segment: segment,
                    score: 0  //random score from 1 to 10
                };
            });
            toInsert = toInsert.concat(mapped);
        });
        //



        let deleteFilter = {
            tenant: tenant,
            tpId: tpId,
            sourceEpId: id,
            sourceEpRevision: revision,
        };

        async.auto({
            token: function (cb) {
                sysTokenUtil.getSystemAuthToken(cb);
            },
            removeOld: ['token',function (result, cb) {
                dao.delete(result.token, deleteFilter, cb);
            }],
            insertNew: ['removeOld',function (result, cb) {
                dao.insert(result.token, toInsert,cb);
            }]
        }, function (err) {

            res.status(204).send();
        });



    });

    router.get('/',  auth.ensureAuthenticated, (req, res, next) => {

        let logger = logFormatter(resource,'list-available-campaigns');
        var tpId = req.query.touchpoint;
        logger.debug('called', {tpId: tpId});

        var token = auth.getAccessToken(req);
        var tenant = auth.getTenant(req);
        var repo = generalUtils.tenant2Repo(tenant);
        //sc client
        var args = {
            filter: {ls:'touchpoints', rs:'Store:'+tpId}
        };

        //retrieve touchpoint BC
        scClient.list(token,repo,args,function (err, data) {
            if (err) {
                return next(new errors.HttpStatus(500, 'problem retrieving BC'));
            }
            if (data && data.length > 0) {
                res.status(200).send(data[0]);
            }else {
                return next(new errors.NotFound('No TP available'));
            }
            //let bcId = data.id;
            //now get all associated

        });



    });


    router.get('/:id', auth.ensureAuthenticated, (req, res, next) => {
        //get allocations
        let logger = logFormatter(resource,'get');
        let id = req.params.id;
        logger.debug('called', {id: id});

        let revision = req.query.epRevision || 'latest';
        let tenant = req.tenant;

        let tpId = req.query.touchpoint;


        let filter = {
            tpId: tpId,
            sourceEpId: id,
            sourceEpRevision: revision,
            tenant: tenant
        };

        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                return next(err);
            }
            dao.select(token, filter, (err, data) => {
                if (err) {
                    return next(err);
                }


                res.status(200).send(data);

            });



        });



    });

    return router;


};
