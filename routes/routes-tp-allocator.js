/**
 * Copyright Digital Engagement Xperience 2014-2017
 * Date: 02/09/14
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

module.exports = function (config, auth) {

    const router = express.Router();


    const sysTokenUtil = new SystemTokenUtil(config);
    let mapping = {
        id:'id',
        tenant:'tenant',
        tp_id: 'tpId',
        tp_ep_id: 'tpEpId',
        tp_ep_revision: 'tpEpRevision',
        display_ep_id: 'epId',
        display_ep_revision: 'epRevision',
        ep_region_allocation: 'region',
        display_ep_element_id_allocation: 'tpEpElementId',
        created_at: 'createdAt'
    };

    const ds = config.tpAllocatorDatastore;
    const dao = new KBSqlDao(config, ds , 'tp_allocation', mapping);


    router.put('/:id',  auth.ensureAuthenticated, (req, res, next) => {

        let logger = logFormatter(resource,'set');
        //look up
        let revision = req.query.epRevision || 'latest';
        //for multiple tps
        let tpIds = req.query.touchpoint.split(',');

        let id = req.params.id;
        let tenant = req.tenant;


        let data = req.body;
        if (!data || data.length < 1) {
            return new errors.Validation('must support data');
        }

        logger.debug('called',{data: data, tenant:tenant, tpEpId: id, tpId:tpIds});


        let toInsert  = [];
        let toDelete =  [];

        _.each(tpIds, (tpId)=> {

            let items = _.map(data, (item) => {
                return {
                    tenant: tenant,
                    tpId: tpId,
                    tpEpId: id,
                    tpEpRevision: revision,
                    epId: item.campaign.id,
                    epRevision: 'latest',
                    region: item.region,
                    tpEpElementId: item.elementId
                };
            });

            toInsert = toInsert.concat(items);
            toDelete.push({
                tenant: tenant,
                tpId: tpId,
                tpEpId: id,
                tpEpRevision: revision,
            });
        });

        // let toInsert = _.map(data, (item) => {
        //     return {
        //         tenant: tenant,
        //         tpId: tpId,
        //         tpEpId: id,
        //         tpEpRevision: revision,
        //         epId: item.campaign.id,
        //         epRevision: 'latest',
        //         region: item.region,
        //         tpEpElementId: item.elementId
        //     };
        // });
        //
        // let deleteFilter = {
        //     tenant: tenant,
        //     tpId: tpId,
        //     tpEpId: id,
        //     tpEpRevision: revision,
        // };

        async.auto({
            token: function (cb) {
                sysTokenUtil.getSystemAuthToken(cb);
            },
            removeOld: ['token',function (result, cb) {
                async.each(toDelete, function(deleteFilter, done) {
                    dao.delete(result.token, deleteFilter, done);
                }, cb);
            }],
            insertNew: ['removeOld',function (result, cb) {
                dao.insert(result.token, toInsert,cb);
            }]
        }, function (err) {

            res.status(204).send();
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
            tpEpId: id,
            epRevision: revision,
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
