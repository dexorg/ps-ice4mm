/**
 * Copyright Digital Engagement Xperiance
 * Date: 02/09/14
 * @author Ali Hussain
 * @description
 */
/*jslint node: true */

'use strict';

/** load application UI templates */
const uiTemplates = require('../views/templates');

const Mustache = require('mustache');
const _ = require('underscore');
const async = require('async');
const pageAuth = require('dex-authentication').authenticator.page;
const loggerFormatter = require('dex-logger').logFormatter;
const UserInformation = require('../libs/user-info');
const fs = require('fs');
const errors = require('dex-errors');
const appId = 'ice4m';

const tenantEPAWfSRIhash = 'xIiH/RmAXgbf7PGa7jBEvXge6tom9Da3tE15ND0PsPcv7gu9Fz5ocWwUxa6cYTG9';

const Ice4mRoleManager = require('../libs/role-manager');
const SocialPreview = require('../libs/social-preview/social-preview');

//only 'resource' would be root html page here
var logger = loggerFormatter('root-html-page','retrieve');

module.exports = function (app, express, config, bcAppIntegration) {
    var localBCDef;
    if(config.localBCDefinition === 'true'){
        var bcDefPath = __dirname+'/../views/business-concept/default.json';
        localBCDef = JSON.parse(fs.readFileSync( bcDefPath, 'utf8' ));
    }

    var rm = new Ice4mRoleManager(config);
    var auth = pageAuth(config);
    var userInfo = new UserInformation(config, null, {ice4m: rm });

    app.use('/style', express.static(config.assetsResource + '/css'));
    app.use('/images', express.static(config.assetsResource + '/images'));
    app.use('/img', express.static(config.assetsResource + '/images'));
    app.use('/html', express.static(config.assetsResource + '/html'));
    app.use('/js/lib', express.static('public/js/lib'));
    app.use('/js/app', express.static('public/js/app/build'));

    app.use(config.ice4m.assets_prefix+'/style', express.static('public/ice4m/css'));

    //app.use('/social-preview', express.static('public/preview'));
    app.use('/social-preview/css', express.static('public/preview/css'));
    app.use('/social-preview/images', express.static('public/preview/images'));
    app.use('/social-preview/svg', express.static('public/preview/svg'));

    //can be uncommented for development
    //app.use(config.ucc.assets_prefix+'/style', express.static('node_modules/ps-ucc/public/assets/css'));



    var getSdkConfig = function (config) {
        return {
            scpUrl: '/proxy/scp',
            sbUrl: '/proxy/sb',
            cbUrl: '/proxy/cb',
            ebUrl: '/proxy/eb',
            tpmUrl: '/proxy/tpm/',
            lpmUrl: '/proxy/lpm',
            epmUrl: '/proxy/ep',
            upmUrl: '/proxy/upm/user/',
            presentationUrl: '/proxy/scprm',
            dexSdkMode: config.scpm.dexSdkMode,
            fetchOnLoad: config.scpm.fetchOnLoad,
            epEventId: config.scpm.epEventId,
            epEventKey: config.scpm.epEventKey,
            monitorEventId: config.scpm.monitorEventId,
            monitorEventKey: config.scpm.monitorEventKey
        };
    };


    var getRoleBCMapping = function (tenant, currentRole, bcMenuMapping, callback) {

        bcAppIntegration.listRoleBCSystemBehaviours(tenant, {applicationId:appId, role: currentRole}, (err, listing) => {
            //listing contains role, bcType,
            if (err) {
                //TODO: handler error
                return callback(err);
            }
            //filter down listing
            var filteredListing = _.filter(listing, function (item) {
                return (item.name === 'view' || item.name.indexOf('view_')>-1) ;
            });
            var mappedFilter = _.map(filteredListing, 'bcType');


            //now filter all menu items based on role for bcType
            //for all 'view' permissions, show the menu item

            var filteredMenu = _.filter(bcMenuMapping,function (it) {
                var bcTypeArr = it.bctype;
                var match = false;



                _.each(bcTypeArr, function (val) {
                    //TODO: fix insane legacy structure
                    if (_.isString(val)) {
                        //for ['flat']
                        if (mappedFilter.indexOf(val) > -1) {

                            //for system then need to check the name matches the
                            if (it.system) {
                                if ( _.find(filteredListing, {name: it.requiredPermission})) {
                                    match = true;
                                }
                            }else {

                                match = true;
                            }
                        }
                    } else {
                        //for nested [{bc: { .. } ]
                        _.each(val, function (value, keyBc) {
                            if (mappedFilter.indexOf(keyBc) > -1) {
                                match = true;
                            }
                        });
                    }

                });


                return match;
            });
            return callback(null,filteredMenu);

        });
    };


    var showManagerPortal = function(data, params, tenantAppConfig, rolesBcMapping) {
        var bcInstancePage = {};
        data.channelAuth = 'true';

        if(tenantAppConfig.channelAuth !== undefined && tenantAppConfig.channelAuth === 'false'){
            data.channelAuth = tenantAppConfig.channelAuth;
        }
        if(tenantAppConfig.allowAddTouchpoint){
            data.allowAddTouchpoint = tenantAppConfig.allowAddTouchpoint;
        }

        //dynamic epa
        params.engagement = uiTemplates.flexEpa;
        params.storyboard = uiTemplates.storyboardView;
        params.campaignPlanner = uiTemplates.campaignPlanner;
        //ICEMM-158: add EPt templates in classpage
        params.EPtTemplates = Mustache.render(uiTemplates.ice4mEPtTemplates, {'epaElementToolbar': uiTemplates.epaElementToolbar, 'epaElementToolbarInt': uiTemplates.epaElementToolbarInt});

        data.fbAppID = config.fb.clientID;

        //get availabel BCs mapping relations and labels
        data.bcLabels = JSON.stringify(rolesBcMapping);
        //ICEMM-166
        data.reports = JSON.stringify(tenantAppConfig.reports);


        //render Campaign page
        params.campaignPage = Mustache.render(uiTemplates.campaignPage, params);

        //render bc instance list
        params.bcInsListNew = Mustache.render(uiTemplates.ice4mBCInsListNew, params);
        //render EM mng page
        params.emPage = Mustache.render(uiTemplates.emPage, params);
        //render role mng page
        params.rmPage = Mustache.render(uiTemplates.rmPage, params);
        //render dynamic intel configuration page
        params.dynamicIntelPage = Mustache.render(uiTemplates.dynamicIntelPage, params);

        params.tagsPage = Mustache.render(uiTemplates.tagsPage, params);


        //render bc instance create template
        params.bc_ins_create = uiTemplates.ice4mBCInsCreate;
        params.bc_ins_delete = uiTemplates.ice4mBCInsDelete;
        data.touchpointPopover = uiTemplates.touchpointPopover;
        //params.bcWidgets = uiTemplates.ice4mBCWidgets;
        //data.bcInstancePage = Mustache.render(uiTemplates.ice4mBcInstancePage, bcInstancePage);
        var sdkConfig = getSdkConfig(config);
        data.sdkRequiredServices = JSON.stringify(sdkConfig);

    };
    // var showSubscriberPortal = function(data, params, tenantAppConfig) {
    //     data.newBCModel = config.newBCModel;
    //     var studentclasspage = {};
    //     //Need to stringify the object because mustache will convert it to string
    //     var sdkConfig = getSdkConfig(config);
    //     data.sdkRequiredServices = JSON.stringify(sdkConfig);
    //     params.bcKpiReports = uiTemplates.ice4mBcKpiReports;
    //     //get BC mapping relations and labels
    //     var roleBcMapping = tenantAppConfig.role_bc_Mapping[data.currentRole];
    //     data.bcLabels = JSON.stringify(roleBcMapping);
    //
    //     //make sure reports do not throw an error on JSON.parse
    //     data.reports = '{}';
    //
    //     //ICEMM-166
    //     params.reports = JSON.stringify(tenantAppConfig.reports);
    //     //promotion player
    //     params.player = uiTemplates.promotionPlayer;
    //     data.merchandisingChannelWidget = uiTemplates.merchandisingChannelWidget;
    //
    //     data.bccChannelUrl = (tenantAppConfig.ice4m && tenantAppConfig.ice4m.bccChannelUrl ? tenantAppConfig.ice4m.bccChannelUrl: config.bcc.channelUrl);
    //
    // };

    /**
     * Return filtered object of user data (from req.user)
     * @param {object} user - user session object
     */
    var getUserDataForPage = function (user, tenant) {
        //remove private fields by name (but might more maintainable as a whitelist needed/allowed attributes)
        var userData = _.omit(user,'_tenant','_tenantConfig','_json','_refreshTokenAt','provider');
        //make sure tenant fields is set as it is used from ui
        userData.tenant = tenant;
        return JSON.stringify(userData);
    };

    app.get('/', auth.ensureAuthenticated, function (req, res) {
        var tenantAppConfig = {};
        var defaultTheme = require('../views/themes/default.json');
        var roleManagerConfiguration = {};
        var tenant = auth.getTenant(req);
        var token = auth.getAccessToken(req);
        //ICEMM-156: check if local BC definition file was loaded,
        //if so, override the req.user._tenantConfig
        if(localBCDef){
            req.user._tenantConfig.role_bc_Mapping = localBCDef.role_bc_Mapping;
            req.user._tenantConfig.bc_definition = localBCDef.bc_definition;
            //ICEMM-166 reports instances definition
            req.user._tenantConfig.reports = {reports: localBCDef.reports};
            req.user._tenantConfig.ice4m = localBCDef.ice4m;
            req.user._tenantConfig.bc_permissions = localBCDef.bc_permissions;
        } else{
            //ICEMM-166 reports instances definition from tenant config
            if(!_.has(req.user._tenantConfig.reports, 'reports')){
                req.user._tenantConfig.reports = {reports: req.user._tenantConfig.reports};
            }
        }

        // wrapper for callbacks to ignore (and log) error and continue
        function ignoreError(callback) {
            return _.wrap(callback, function (cb, err, result) {
                if (err) {
                    logger.error(err);
                    cb();
                } else {
                    cb(null, result);
                }
            });
        }

        async.auto({
            //req.user already get tenant configuration(theme), do not need to retrieve theme file again
            userInfo: function (next) {
                //ICEMM-156: pass tenantConfig from req.user to tenantAppConfig
                if (req.user._tenantConfig) {
                    tenantAppConfig = req.user._tenantConfig;

                } else {
                    tenantAppConfig = defaultTheme; // if cannot load tenant config from remote location, then use default config for fallback.
                }
                roleManagerConfiguration = {
                    roleManager: 'ice4m',//tenantAppConfig.roleManager,
                    //rolesMapping: tenantAppConfig.rolesMapping,
                    services: tenantAppConfig.services || {}
                };
                userInfo.getInfo(req, token, tenant, roleManagerConfiguration, ignoreError(next));
            },
            bcMenuForRole: ['userInfo', function (result, next) {
                let userInfo = result.userInfo || {};

                let role = userInfo.currentRole || '';


                if (!role) {
                    //send a missing configuration to the browser
                    next();
                }else {


                    let menuMapping = tenantAppConfig.bc_menu_mapping || [];
                    getRoleBCMapping(tenant, role, menuMapping, (err, data) => {
                        if (err) {
                            //TODO: log error
                            return next(null, []);
                        }
                        next(null, data);
                    });
                }

            }]
        }, function (err, results) {
            var userInfo = results.userInfo || {};
            var roleBcMapping = results.bcMenuForRole || [];
            var data = {};
            var scriptsData = {};
            var pageData;
            var scriptsHTML;
            var assetsData = {};
            var html;

            pageData= {};  //store data to be rendered into html page through mustache
            data.tpChannelTypes = JSON.stringify(tenantAppConfig.tenantChannels);

            data.creativeBriefFolderId = (tenantAppConfig.ice4m && tenantAppConfig.ice4m.creativeBriefFolderId ? tenantAppConfig.ice4m.creativeBriefFolderId: '');

            data.ice4mURL = config.ice4mURL;

            let brLink = (tenantAppConfig.ice4m && tenantAppConfig.ice4m.brLink ? tenantAppConfig.ice4m.brLink : config.brLink);

            data.brLink = brLink;

            data.bccPreviewUrl = config.bcc.previewUrl;

            data.user = getUserDataForPage(req.user,tenant);
            //set sidebar,navbar, logo as part of the portal
            data.tenantLogo = tenantAppConfig.logo;

            if (tenantAppConfig.hasOwnStyles && tenantAppConfig.hasOwnStyles  === 'true') {
                assetsData.tenantStyle = tenantAppConfig.ice4m.stylePath;
            }

            data.sidebar = uiTemplates.sidebar;
            //data.navbar = Mustache.render(uiTemplates.navbar, data);
            req.user.isNotFirstLoad = true;
            if (req.user.facebookProfile) {
                data.fbUserID = req.user.facebookProfile.id;
            }

            data.roles = userInfo.roles;
            data.tasks = userInfo.tasks;
            data.bccPlayerTemplate = uiTemplates.bccPlayerTemplate;
            //optionally, still allow a default role by app configuration (but not by default)
            if (!userInfo.currentRole && config.defaultRole) {
                data.currentRole = config.defaultRole;
            }else {
                data.currentRole = userInfo.currentRole;
            }

            //for cognos-based reports
            data.performanceDashboardMode = (config.cognos && config.cognos.enabled ? 'cognos' : 'default');


            if (data.currentRole) {
                showManagerPortal(data, pageData, tenantAppConfig, roleBcMapping);
                data.ice4mdashboard = Mustache.render(uiTemplates.ice4mdashboardProducer, pageData);
            } else {
                data.ice4mdashboard = Mustache.render(uiTemplates.ice4mdashboardError, pageData);
                logger.warn('current user has no configured and/or recognizable current role',{tenant:tenant});
            }


            // if (data.currentRole && (data.currentRole.indexOf('productManager') > -1||data.currentRole.indexOf('marketingDirector') > -1)) {
            //     showDirectorPortal(data, pageData, tenantAppConfig);
            //     data.ice4mdashboard = Mustache.render(uiTemplates.ice4mdashboardProducer, pageData);
            // }
            // else if (data.currentRole && (data.currentRole.indexOf('executive') > -1||data.currentRole.indexOf('salesManager') > -1||data.currentRole.indexOf('marketingManager') > -1)) {
            //     showManagerPortal(data, pageData, tenantAppConfig);
            //     data.ice4mdashboard = Mustache.render(uiTemplates.ice4mdashboardProducer, pageData);
            // }
            // else if (data.currentRole && (data.currentRole.indexOf('subscriber') > -1||data.currentRole.indexOf('wholesaler') > -1||data.currentRole.indexOf('retailer') > -1)) {
            //     showSubscriberPortal(data, pageData, tenantAppConfig);
            //     data.ice4mdashboard = Mustache.render(uiTemplates.ice4mdashboardConsumer, pageData);
            // } else {
            //     data.ice4mdashboard = Mustache.render(uiTemplates.ice4mdashboardError, pageData);
            //     logger.warn('current user has no configured and/or recognizable current role',{tenant:tenant});
            // }
            //
            //data.epaWorkflow = DEFAULT_EPA_WORKFLOW;


            scriptsData.SDK_CLIENT_LIB = config.sdk.clientLib;
            scriptsData.DCM_CLIENT_LIB = config.dcm.clientLib;
            scriptsData.ICE_CLIENT_LIB = config.ice.clientLib;
            scriptsData.ICE4M_CLIENT_LIB = config.ice4m.clientLib;
            scriptsData.UCC_CLIENT_LIB = config.ucc.clientLib;
            scriptsData.BCC_CLIENT_LIB = config.bcc.clientLib;
            scriptsData.ICE4M_Assets_Prefix = config.ice4m.assets_prefix;
            scriptsHTML = Mustache.render(uiTemplates.scripts, scriptsData);
            data.userProfileId = req.user.id;
            data.functionality = 'ice-edu'; //needed?

            data.bcInstanceCard = uiTemplates.bcInstanceCard;

            //css reference
            assetsData.ICE4M_CSS_LIB = config.ice4m.cssLib;

            //old ICE4M assets references
            assetsData.ICE4M_Assets_Prefix = config.ice4m.assets_prefix;
            assetsData.UCC_Assets_Prefix = config.ucc.assets_prefix;
            data.header = Mustache.render(uiTemplates.header, assetsData);
            data.scripts = scriptsHTML;
            /*(XY)
            1.set the tenant-based communication bucket*/
            data.bucket = tenantAppConfig.commBucket;
            /*the original bucket.ice has been removed from config.js since it is not tenant-based
            2.Here using the tenant-based bucket path to initialize 'config.bucket.ice'
              which will be used for communication file uploading (ps-ice/routes/routes_multimediamanagement.js) */
            config.bucket = {};
            config.bucket.ice = tenantAppConfig.commBucket; //why is this here??
            data.securedSchedule = config.securedSchedule;
            data.footer = uiTemplates.footer;
            html = Mustache.render(uiTemplates.global, data);
            res.send(html);

        });

    });

    /**
     * Social Preview management (generation, queuing and caching of social (3rd party) channel-based
     * @type {SocialPreviewHelper}
     */
    const socialPreview = new SocialPreview(config);
    /**
     * Prepares a preview for the EP and TP combination (for 3rd party channels).  If the preview is not ready then it will display
     * a loading page that refreshes on a configured interval
     * @param {object} req
     * @param {object} req.query
     * @param {string} req.query.ep - Engagement Pattern identifier, along with an optional revision (revision defaults to 'latest')
     * @param {string} req.query.tp - Touchpoint identifier (must be a touchpoint of the specified ep)
     */
    app.get('/social-preview', auth.ensureAuthenticated, function (req, res, next) {

        let epId = req.query.ep;
        let epParams = epId.split('-');
        let epRevision = 'latest';
        if (epParams.length > 1) {
            epRevision = epParams[1];
            epId = epParams[0];
        }
        let tpId = req.query.tp;


        if (!epId || !tpId) {
            return next(new errors.Validation('cannot load without required parameters'));
        }
        //needed??
        let executionParameters = {};


        //queues up a request to create a preview (since creating a preview may take a while)
        socialPreview.queueableReq({forceActive: true, engagementPatternId: epId, engagementPatternRevision:epRevision, currentTouchpoint:tpId, tenant: req.tenant, executionParameters:executionParameters}, function (err, data) {
            if (err) {
                //this is likely to be returns if the preview is attempted on a bcc-based touchpoint or there is an issue with the EP itself
                return next(new errors.HttpStatus(500, 'There was a problem preparing the preview...please check your EP:'+err.message));
            }


            if (data && data.ready) {
                let result = data.data;
                let resultData = result.data || [];
                //convert some more to simplify for mustache-based template
                let toRender = _.map(resultData, function (item) {
                    let val = {};
                    if (item.title && item.title.kind && item.title.kind === 'multimediabody#text') {
                        val.text = item.title.property.content;
                    }
                    if (item.media && item.media.kind && item.media.kind === 'multimediabody#image') {
                        val.image = item.media.property.location;
                    }
                    if (item.media && item.media.kind && item.media.kind === 'multimediabody#video') {
                        val.video = item.media.property.location;
                    }
                    if (item.media && item.media.kind && item.media.kind === 'multimediabody#link') {
                        val.link = item.media.property.location;
                    }
                    return val;
                });

                if (toRender.length < 1) {
                    return next(new errors.HttpStatus(500,'Invalid EP: Nothing to render for preview'));
                }

                if (uiTemplates && uiTemplates[result.previewName]) {

                    //based on tp, pick the render
                    let html = Mustache.render(uiTemplates[result.previewName], {item: toRender});
                    res.status(200).send(html);
                }else {
                    next(new errors.HttpStatus(500,'Invalid configuration: No preview is setup for the current touchpoint'));
                }
            } else { //preview is not yet ready

                let checkInterval = (config.socialPreview && config.socialPreview.clientResultCheckInterval ? config.socialPreview.clientResultCheckInterval : 5000);
                let html = Mustache.render(uiTemplates.pendingPreview, {checkInterval: checkInterval});
                res.status(200).send(html);
            }
        });
    });


    app.get('/report-viewer', auth.ensureAuthenticated, function (req, res, next) {
        let reportId = req.query.id;
        let tenant = req.tenant;


    });

};
