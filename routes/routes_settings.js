/**
 * Copyright Digital Engagement Xperience 2014-2019
 * Date: 02/09/14
 */
/*jslint node: true */
'use strict';

const AccountManagerClient = require('dex-http-client').accountManagement;
const pageAuth = require('dex-authentication').authenticator.page;
const sessionUtil = require('dex-authentication').util.sessionUtil;
const SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
const KBSqlDao = require('dex-dao').kb.SqlDao;
const errors = require('dex-errors');
const logger = require('dex-logger');
const KB = require('dex-http-client').kb;
const _ = require('underscore');
const CubeMng = require('../libs/intelligence/cube-integration');
const DynamicIntelConfig = require('../libs/intelligence/dynamic-configuration');

module.exports = function (app, express, config) {

    let auth = pageAuth(config);
    let amClient = new AccountManagerClient(config);


    app.use('/style', express.static(config.assetsResource + '/css'));
    app.use('/images', express.static(config.assetsResource + '/images'));
    app.use('/img', express.static(config.assetsResource + '/images'));
    app.use('/js/lib', express.static('public/js/lib'));
    app.use('/js/app', express.static('public/js/app/build'));


    app.get('/user_setting/:role', auth.ensureAuthenticated, function (req, res) {
        if (req.params.role) {
            req.session = sessionUtil.storeUserSettings(req, 'role', req.params.role);
            res.redirect('/');
        }
    });


    let sysTokenUtil = new SystemTokenUtil(config);
    let mappingAvailableBI = {
        id: 'id',
        tenant: 'tenant',
        name: 'name',
        schema_id: 'schema',
        bc_type: 'bc',
        category: 'category',
        label: 'label',
        default_key: 'defaultKey'
    };

    let dsRae = config.rae.datastore;
    let mappingAvailableBIDao = new KBSqlDao(config, dsRae, 'bc_available_bi', mappingAvailableBI);

    /**
     * QH: for adding available BI to be configurable through environment
     * TODO: move to integration later
     */
    app.get('/bc-creation/available-bi', auth.ensureAuthenticated, function (req, res, next) {


        /**
         * [
         {"name": "user profile", "schema": {"id": "userprofile"}},
         {"name": "recommendation profile", "schema": {"id": "recommendedprofile"}},
         {"name": "dynamic ept", "schema": {"id": "dynamicept"}},
         {"name": "user crm", "schema": {"id": "usercontact"}}
         ]

         */

        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                //logger.error('could not acquire system token');
                return next(new errors.HttpStatus(500, 'internal server error'));
            }
            let filter = {
                tenant: req.tenant
            };

            if (req.query.bc_type) {
                filter.bc = req.query.bc_type;
            }
            mappingAvailableBIDao.select(token,filter, (err, data) =>{
                if (err) {
                    return next(err);
                }
                let filtered = data.map(val => {
                    return {
                        name: val.name,
                        schema: { id: val.schema },
                        bc: val.bc,
                        category: val.category,
                        label: val.label,
                        defaultKey: val.defaultKey
                    };
                });
                res.status(200).send(filtered);
            });
        });

        // let val = (config && config.availableBI ? config.availableBI : []);
        // res.status(200).send(val);
    });



    let mappingBehaviourCat = {
        id: 'id',
        tenant: 'tenant',
        ds_id: 'dsId',
        category: 'category'
    };

    let ds = config.sb.digitalServiceStore;
    let mappingBehaviourCatDao = new KBSqlDao(config, ds, 'category_digital_service', mappingBehaviourCat);

    /**
     * TODO: move to integration later
     */
    app.get('/available-ds-category', auth.ensureAuthenticated, function (req, res) {

        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                logger.error('could not acquire system token');
                res.status(500).send('error');
            }
            let filter = {
                tenant: req.tenant
            };
            mappingBehaviourCatDao.select(token, filter, (err, data) => {
                if (err) {
                    res.status(500).send('error');
                    return;
                } else {
                    let filtered = data.map(val => {
                        return {
                            dsId: val.dsId,
                            category: val.category
                        };
                    });
                    res.status(200).send(filtered);
                }
            });

        });


    });


    const kbClient = new KB(config);


    /**
     * Get all app (ice4m) users that are business role
     * TODO: move to integration later
     */
    app.get('/app/user', auth.ensureAuthenticated, function (req, res, next) {
        let app = 'ice4m';
        let tenant = auth.getTenant(req);

        let ds = config.rae.datastore;
        let bizRole = 'biz';


        //TODO: move
        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                return next(err);
            }
            let query = 'SELECT DISTINCT user from app_role_user where app_id=? AND tenant=? and role=?';
            let qParams = [app, tenant, bizRole];
            kbClient.executeQueryAuth(token, query, qParams, ds, null, null, (dErr, data) => {
                if (dErr) {
                    return next(dErr);
                }
                var result = kbClient.parseResult(data.result);
                var list = _.map(result, 'user');
                res.status(200).send(list);
            });
        });

        // amClient.listAccountUsers(token, tenant,(err, data) =>{
        //     if (err) {
        //         return next(err);
        //     }
        //     res.status(200).send(data);
        // });


    });

    const cubeMng = new CubeMng(config);

    /**
     * post cube creation request
     * TODO: move to cube integration later
     */
    app.post('/cube', auth.ensureAuthenticated, function (req, res, next) {
        let tenant = req.tenant;
        let params = req.body || {};
        cubeMng.add(tenant, params).then((data) => {
            return res.status(200).send(data);
        }).catch((err) => {
            return next(err);
        });

    });

    /**
     * Get available cube request
     * TODO: move to cube integration later
     */
    app.get('/cube', auth.ensureAuthenticated, function (req, res, next) {
        let tenant = req.tenant;
        let params = req.query || {}; //TODO: add pagination

        cubeMng.list(tenant, params).then((data) => {
            return res.status(200).send(data);
        }).catch((err) => {
            return next(err);
        });
    });

    /**
     * Get available business rules
     * TODO: move to integration later
     */
    app.get('/external-brm/:spaceId', auth.ensureAuthenticated, function (req, res, next) {
        let app = 'ice4m';
        let tenant = auth.getTenant(req);

        let ds = config.rae.datastore;
        let space = spaceId;


        //get base URL
    });

    const dynamicIntel = new DynamicIntelConfig(config);

    app.get('/intelligence/available-intelligence', function (req, res, next) {
        let val = (config && config.availableBI ? config.availableBI : []);
        res.status(200).send(val);
    });
    app.get('/dyn-intelligence', auth.ensureAuthenticated, function (req, res, next) {

        let params = req.body || {};
        dynamicIntel.list(req.tenant,params).then((resp) => {
            res.status(200).send(resp);
        }).catch((err)=> {
            next(err);
        });

    });

    app.put('/dyn-intelligence/:name/configuration', auth.ensureAuthenticated,function (req, res, next) {

        if (req.params.name !== 'dynamic') {
            return next(new errors.Validation('unsupported type'));

        }

        let params = req.body;
        params.name = req.param.name;

        dynamicIntel.set(req.tenant,req.body).then((resp) => {
            res.status(200).send(resp);
        }).catch((err)=> {
            next(err);
        });



    });


    app.get('/dyn-intelligence/:name/configuration', auth.ensureAuthenticated, function (req, res, next) {


        if (req.params.name.indexOf('dynamic') === -1) {
            return next(new errors.Validation('unsupported type'));

        }
        dynamicIntel.get(req.tenant,req.body).then((resp) => {
            res.status(200).send(resp);
        }).catch((err)=> {
            next(err);
        });



    });

    app.get('/dyn-intelligence-config', auth.ensureAuthenticated, function (req, res, next) {

        let val = (config && config.learning ? config.learning : {});
        res.status(200).send(val);

    });



    let mappingTagClient = {
        id: 'id',
        tenant: 'tenant',
        tag_type: 'type',
        tag: 'tag',
        'date_created': 'created'
    };

    let dsTags = config.fm.tagsDataStore;
    let mappingTagDao = new KBSqlDao(config, dsTags, 'file_tag_name', mappingTagClient);




    app.post('/user-tag', auth.ensureAuthenticated, function (req, res, next) {

        const dateCreated = Math.floor( Date.now() / 1000);

        let tag = (req.body && req.body.tag);



        if (!tag){
            return next(new errors.Validation('tag name missing'));
        }
        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                //logger.error('could not acquire system token');
                return next(new errors.HttpStatus(500, 'internal server error'));
            }
            let data = [{
                tenant: req.tenant,
                created: dateCreated,
                tag: tag,
                type: 'user',
            }];


            /**
             * id: 'id',
             tenant: 'tenant',
             tag_type: 'type',
             tag: 'tag',
             'date_created': 'created'
             };
             */

            mappingTagDao.insert(token,data, (err) =>{
                if (err) {
                    return next(err);
                }
                res.status(204).send();
            });
        });

    });





    let mappingPlanDiagram = {
        id: 'id',
        tenant: 'tenant',
        diagram_data: 'data',
        diagram_type:'type',
        bci_id: 'bciId'
    };

    let dsPPObj = config.epmEm.datastore;
    let mappingPlanDiagramDao = new KBSqlDao(config, dsPPObj, 'plain_diagram', mappingPlanDiagram);

    app.get('/pp-obj/:id', auth.ensureAuthenticated, function (req, res, next) {
        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                //logger.error('could not acquire system token');
                return next(new errors.HttpStatus(500, 'internal server error'));
            }


            let filter = {tenant: req.tenant, bciId: req.params.id};

            mappingTagDao.select(token,filter , (err, result) => {
                if (err) {
                    return next(err);
                }
                var data = (result && result.length > 0 ? result[0] : null);
                if (!data) {
                    return next(new errors.NotFound('not found'));
                }
                res.status(200).send(data.data);


            });
        });

    });


    app.put('/pp-obj/:id', auth.ensureAuthenticated, function (req, res, next) {

        const dateCreated = Math.floor( Date.now() / 1000);
        let params = req.body;

        if (!params){
            return next(new errors.Validation('params missing'));
        }
        sysTokenUtil.getSystemAuthToken((err, token) => {
            if (err) {
                //logger.error('could not acquire system token');
                return next(new errors.HttpStatus(500, 'internal server error'));
            }



            let filter = {tenant:req.tenant, bciId:req.params.id};

            mappingTagDao.select(token, filter, (err, result) => {
                if (err){
                    return next(err);
                }
                var data = (result && result.length > 0 ? result[0] : null);
                if (data) {
                    //do insert

                    mappingPlanDiagramDao.update(token,filter, {data: req.body}, (err, res) => {
                        if (err){
                            return next(err);
                        }

                        res.status(204).send();

                    })


                }else {
                    //do update
                    let toInsert = [{
                        tenant:req.tenant,
                        bciId: req.params.id,
                        data:  req.body,
                        type: 'jointjs'
                    }];


                    mappingPlanDiagramDao.insert(token,toInsert, (err) =>{
                        if (err) {
                            return next(err);
                        }
                        res.status(204).send();
                    });
                }



            });

        });

    });



};
