/**
 * Copyright Digital Engagement Xperience 2016-2017
 * @description For running the ice4m webapp
 */
/*jslint node: true */
'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('dex-logger');
var errors = require('dex-errors');
var Facebook = require('tpe-facebook-integration');
var securitySetup = require('dex-app-security').securitySetup;
var http = require('https');
var fs = require('fs');
var path = require('path');
var auth = require('dex-authentication');
var SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
/* DEX Modules */
var configFactory = require('dex-config').configFactory;
var myConfig = require('./config');
var environment = process.env.CONFIG_ENV || 'latest';
var monitorSetup = require('dex-app-monitor').monitorSetup;
var appId = 'ice4m';
var BehaviourManager = require('icep-scm').behaviourMng;
var BcAppIntegration = require('ps-ice').bcAppIntegration;


global.debug = (process.env.DEBUG_MODE === 'true') || false;

/*
 ===============================================================
 Express App Setup
 ===============================================================
 */
var app = module.exports = express();
//favicon middleware early to avoid log pollution
app.use(favicon(__dirname + '/public/assets/icon/favicon.ico'));


// configuration factory returns configuration object asynchronously
// do the remainder of process setup in the callback
configFactory.get(environment, myConfig, function (err, config) {

    if (err) {
        logger.error('Could not get configuration:', err);
        throw err;
    }

    var certOptions = {
        key: fs.readFileSync(__dirname + '/local_certs/server.key'),
        cert: fs.readFileSync(__dirname +'/local_certs/server.crt')
    };

    //for websockets must have access to http server so server listener for 'upgrade' event is available
    var server = http.createServer(certOptions,app);

    // setup security
    securitySetup(app, config);
    //setup monitor
    monitorSetup(app);

    var systemTokenUtil = new SystemTokenUtil(config);

    //trust proxy: is used to allow application to work with a reversed proxy infront of it, so that x-forwarded-* headers
    // are correctly picked up by passport and applied during the authentication with 3rd party identify providers such as Facebook.
    app.set('trust proxy', function (ip) {
        logger.info('resource: trust proxy action: set data: ip='+ip );
        if (ip === config.proxyIP) return true; // trusted IP
        else return false;
    });

    var fb = new Facebook(config);

    //add dex-app-monitor
    monitorSetup(app);

    // OpenAM client & server authentication related setup
    require('dex-authentication').session.authSetup(app, config);

    var appApiAuth = require('dex-authentication').authenticator.appApi(config);
    var serviceAuth = require('dex-authentication').authenticator.serviceApi(config);

    //proxy route, move it here since http-proxy has issue with body-parser

    //TODO: switch back to using from sc-playback when changes land there
    app.use('/proxy', require('./routes/routes-platform-proxy')(config, server, appApiAuth, {}, systemTokenUtil,app));
    //app.use('/proxy', require('sc-playback').routePlatformProxy(config, server, appApiAuth, {}, systemTokenUtil));

    app.use(express.json({limit:'500kb'}));
    app.use(express.urlencoded({extended:false}));

    if (config.security && config.security.personMode) {
        require('dex-authentication').routes.loginPerson(app, config);
        require('dex-authentication').routes.loginPersonFacebook(app, config);

    }else {
        require('dex-authentication').routes.login(app, config);
        require('dex-authentication').routes.loginFacebook(app, config);
    }

    require('dex-authentication').routes.authFacebook(app, config);
    require('ss-user-management').routes.userRegistration(app, config);

    var processport = process.env.PORT || 5050;


    var localBCDef;
    if(config.localBCDefinition === 'true'){
        var bcDefPath = __dirname+'/views/business-concept/default.json';
        localBCDef = JSON.parse(fs.readFileSync( bcDefPath, 'utf8' ));
    }


    //setup BC App integration for BCMM, if localDBDef is locally configured use that always
    var bcAppIntegration = new BcAppIntegration(config,localBCDef);

    //Routes related to serving up HTML Content
    require('./routes/routes_html')(app, express, config, bcAppIntegration);
    require('./routes/routes_settings')(app, express, config);
    require('./routes/routes_report')(app, config, systemTokenUtil);
    require('./routes/routes_lecture_manager')(app, config, appApiAuth);
    require('./routes/routes_course_management')(app, config, appApiAuth);
    //set valid intelligence types
    var validIntelTypes;
    if (config.scm.validIntelligenceTypes) {
        validIntelTypes = config.scm.validIntelligenceTypes.split(',');
    }
    require('icep-scm').routesSCMRepo (app, config, appApiAuth, validIntelTypes);

    var newBm = new BehaviourManager(config);
    require('icep-scm').routesManagement(app, config, appApiAuth, null, newBm);
    require('icep-scm').routesLayoutManagement (app, config, null, appApiAuth);
    require('ps-ice').routesMultimediamanagement(app, config, appApiAuth);
    require('ps-ice').routesTPMV2 (app, config, appApiAuth, appId);
    require('ps-ice').routesUPM (app, config, appApiAuth);
    require('ps-ice').routesKB (app, config, appApiAuth);
    require('ps-ice').routesBehaviourManager (app, config);
    require('ps-ice').routesApplicationBehaviour(app, config, serviceAuth);

    //pass in app, config, <sc-persist>, <tpmClient>, <behaviourClient> - null to auto-init
    require('ps-ice').routesFeedback(app, config, null, null, null, appApiAuth);
    require('ps-ice').routesEngagement(app, config, appApiAuth, serviceAuth);
    require('ps-ice').routesMetrics(app, config, null, appApiAuth);
    require('ps-ice').routesAssets(app, config, appApiAuth);
    require('ps-ice').routesToken(app, config, appApiAuth);
    require('ps-ice').routesBcGroups(app, config, systemTokenUtil);
    require('ps-ice').routesFbGroupsV2(app, fb, config, systemTokenUtil);
    require('ps-ice').routesBCM(app, config, appApiAuth);
    require('ps-ice').routesBCP(app, config, appApiAuth, null, bcAppIntegration);
    require('ps-ice').routesEPt(app, config, appApiAuth);

    require('ps-ice').routesRolesWFManager(app, config, appApiAuth);
    app.use('/', require('ps-epm').routesMetrics(config, null, appApiAuth));
    app.use('/ept-source', require('ps-epm').routesEptSource(config, null, appApiAuth));
    app.use('/ept', require('ps-epm').routesEptDef(config, null, appApiAuth));

    app.use('/wf',require('./routes/routes-wf')());


    app.use('/',require('./routes/routes-cms-integration')(config));

    app.use('/tp-allocator',require('./routes/routes-tp-allocator')(config, appApiAuth));

    // app.use('/facebook/pages', appApiAuth.ensureAuthenticated, function (req, res, next) {
    //     debugger;
    //     var fbUser = req.user;
    //
    //     fb.getPagesList()
    //
    // })

    if (process.env.ENABLE_COGNOS_DASHBOARD) {
        app.use('/api/dde/', require('./routes/routes-cognos')(config));

        if (process.env.PROXY_DDE_REQUESTS && process.env.PROXY_DDE_REQUESTS == 'true') {
            const daasProxy = require('./libs/cognos/data-proxy');
            app.use(daasProxy(config.cognos.dde_base_url));


        }

    }





    app.use(errors.catchAll.notFound);
    app.use(errors.handler.rest);
    app.use(errors.handler.ui);

    // start server
    server.listen(processport);

    //Print out the port on startup
    console.log('Port: ' + processport);
});
