/**
 * @copyright Digital Engagement Xperience 2019
 */

const SocialLayoutResolver = require('./social-layout-resolver');
const logFormatter = require('dex-logger').logFormatter;
const epParser = require('sc-scem-tpc').scem.epParsr;
const EM = require('sc-scem-tpc').scem.executionManager;
const EPHandler = require('sc-scem-tpc').epHandler;
const PM = require('sc-scem-tpc').pe.presentationManager;
const RESOURCE_NAME = 'SocialPreviewHelper';
const errors = require('dex-errors');
const async = require('async');
const SCClient = require('dex-http-client').scc;
const TouchpointIntegration = require('sc-scem-tpc').tpe.tpIntegration;
const SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
const generalUtils = require('ps-ice').generalUtils;
const _ = require('lodash');

const NodeCache = require( 'node-cache' );


class SocialPreviewHelper {
    constructor(config){
        const self = this;
        const logger = logFormatter(RESOURCE_NAME,'constructor');
        this.config = config;
        this.socialLayoutResolver = new SocialLayoutResolver();
        this.epParser = new epParser();


        this.cacheTTL = (config.socialPreview && config.socialPreview.cacheTTL ? config.socialPreview.cacheTTL : 300000);


        this.scClient = new SCClient(config);
        this.touchpointIntegration = new TouchpointIntegration(config);
        this.systemTokenUtil = new SystemTokenUtil(config);

        this.pending = [];
        this.cache = new NodeCache();


        this.previewCache = {};


        let dummyChannelPlugin = {
            deliver: function (params, toDeliver, callback) {
                logger.info('delivered', {params:params, toDeliver:toDeliver});

                var deliver = (toDeliver && toDeliver.length > 0 ? toDeliver[0] : null);

                if (deliver) {

                    var key = params.tenant + '#' + params.epId + '#' + params.touchpoint;
                    if (!self.previewCache[key]) {
                        self.previewCache[key] = [];
                    }
                    self.previewCache[key].push(deliver);
                }

                callback(null, {params:params, toDeliver:toDeliver});
            }
        };




        this.dummyChannelPluginCache = {
            getPluginForChannel: function (tenant, token, channel, callback) {
                callback(null,dummyChannelPlugin);
            }

        };

        let dummySCPersist = {};
        let dummyTimerManager = {
            on: function (msg, data) {},
            createEndTimer: function (params) {}
        };
        let dummyStateStorage = {
            init: function () {},
            setElementStateInfo: function () {}
        };

        let dummyUrlManager = {
            prepareBehaviourUrl: function (params, callback) {
                if (!params.url) {
                    return callback(new errors.Validation('missing url'));
                }
                callback(null,params.url);
            }
        };

        this.pm = new PM(config, this.dummyChannelPluginCache,dummyUrlManager);
        this.executionManager = new EM(config,dummySCPersist,this.pm,dummyTimerManager,null, dummyStateStorage);
        //this.executionManager = new EM(config);

    }


    /**
     * Queues up a preview rendering request
     * @param {object} params
     * @param callback
     * @returns {*}
     */
    queueableReq(params, callback) {
        const logger = logFormatter(RESOURCE_NAME,'queue');


        let key = params.tenant + '#' + params.engagementPatternId + '#' +params.engagementPatternRevision + '#' + params.currentTouchpoint;

        let data = this.cache.get(key);
        if (data) {
            if (data.failure) {
                return callback(new errors.HttpStatus(500, 'Could not render preview. Please check that the EP is valid'));
            }else {
                return callback(null, {ready: true, data: data});
            }
        }

        if (this.pending.indexOf(key) > -1) {
            //request was already make the client wait!
            return callback(null, {ready: false});
        }

        this.pending.push(key);
        //preview is not ready, send back to refresh


        this.prepare(params, (err, result) => {
            if (err) {
                //TODO: handle error loading the preview:
                logger.error('failed to prepare preview', {error:err, key: key});

                this.cache.set(key, {failure: true}, this.cacheTTL);

            }else {
                //add to cache
                var success = this.cache.set(key, result, this.cacheTTL);
                logger.debug('preview was successfully cached:', {status:success, key: key, result:result});
            }

            //remove from pending regardless of result
            let ind = this.pending.indexOf(key);

            if (ind > -1) {
                this.pending.splice(ind,1);
            }

        });
        callback(null, {ready: false});
    }


    /**
     *
     * @param params
     * @param callback
     */
    prepare(params, callback){
        const logger = logFormatter(RESOURCE_NAME,'prepare');
        let epHandler = new EPHandler(this.config);

        epHandler.on('error', (msg, data) => {
            logger.error('could not load EP',{error:msg, data: data});
            return callback(new errors.HttpStatus(500,'unable to load'));
        });

        epHandler.on('pattern loaded', (eg) => {

            let errorHappend = false;
            this._execute(eg, (err) => {
                if (err) {
                    logger.error('error executing ep to create preview',{error:err});
                    errorHappend = true;
                    return callback(err);
                }
                this.executionManager.once('ep done', (execution) => {

                    //get from preview cache
                    let key = params.tenant + '#' + params.engagementPatternId + '#' + params.currentTouchpoint;
                    let items = this.previewCache[key];
                    let toReturn = this.renderPreviews(items);
                    try {
                        delete this.previewCache[key];
                    }catch (e) {
                    }
                    //TODO: preview file name comes from channel configuration
                    let previewName = (execution.currentExecution.touchpoint.channel.channelType.params && execution.currentExecution.touchpoint.channel.channelType.params.previewTemplateName ? execution.currentExecution.touchpoint.channel.channelType.params.previewTemplateName: '');
                    if (!previewName) {
                        return callback(new errors.Config('No preview is configured for the selected channel'));
                    }
                    callback(null, {data: toReturn, previewName:previewName});
                });
            });


        });

        epHandler.loadEngagementPatternById(params);

    }



    _execute(currentExecutionPattern, callback) {
        const self = this;
        const logger = logFormatter(RESOURCE_NAME, '_execute');
        let tenant = currentExecutionPattern.tenant;
        let currentTouchpoint = currentExecutionPattern.currentTouchpoint;
        let eg = currentExecutionPattern.ep;

        if (!eg.scReferences) {
            return callback(new errors.HttpStatus(500, 'EP is incomplete/invalid'));
        }

        async.auto({
            tenantToken: function (cb) {
                self.systemTokenUtil.getTenantAuthToken(tenant,cb);
            },
            touchpoint: ['tenantToken',function (results, cb) {
                self.touchpointIntegration.resolveTP(tenant, currentTouchpoint, cb);
            }],
            resolveSC: ['tenantToken', function (results, cb) {
                async.map(eg.scReferences, function(id, done) {
                    self.scClient.setAccessToken(results.tenantToken).scObject.retrieveFromRepo(id, generalUtils.tenant2Repo(tenant), done);
                }, cb);
            }],
            execute: ['touchpoint', 'resolveSC', function (results, cb) {

                async.each(results.touchpoint.channels, function (channel, done) {

                    //build touchpoint structure to pass in
                    let touchpoint = _.extend({},results.touchpoint);
                    touchpoint = _.omit(touchpoint,'channels');
                    touchpoint.channel = channel;

                    let params = {
                        tenant:tenant,
                        touchpoint:touchpoint,
                        eg:eg,
                        //element: TODO support resuming execution
                        sc:results.resolveSC //array of SC
                    };

                    logger.debug('executing',{tenant:tenant, touchpointId:currentTouchpoint, channelId:touchpoint.channel_id, epId:eg.id});
                    self.executionManager.start(params);
                    done();
                }, function (err) {
                    if (err) {
                        logger.error('Warning: problem executing pattern');
                    }else {
                        logger.info('execution is done, unloading', {
                            tenant: tenant,
                            touchpointId: currentTouchpoint,
                            epId: eg.id
                        });
                    }
                    cb();
                });
            }]
        }, function (err, results) {
            callback(err);
        });

    }


    renderPreviews(items) {
        let it = items || [];
        const logger = logFormatter(RESOURCE_NAME,'renderPreviews');
        var toReturn = [];
        it.forEach((item) => {
            let preparedItem = this.socialLayoutResolver.createSocialLayout(item);
            if (preparedItem instanceof Error) {
                logger.error('could not create layour for item',{item:item, error:preparedItem});
            }else {
                toReturn.push(preparedItem);
            }
        });
        return toReturn;
    }
}


/**
 *
 * @type {TwitterPreviewHelper}
 */
module.exports = SocialPreviewHelper;
