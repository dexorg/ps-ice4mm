/**
 * Copyright Digital Engagement Xperience 2015
 * Created by  shawn on 2015-07-20.
 * @description
 */
/*jslint node: true */
"use strict";


var http = require('http'),
    https = require('https'),
    express = require('express'),
    httpProxy = require('http-proxy'),
    errors = require('dex-errors'),
    logger = require('dex-logger'),
    URL = require('url'),
    qs = require('querystring'),
    _ = require('underscore'),
    LocalSystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;


/**
 *
 * @param {object} config - Configuration
 * @param {object} config.scpm - Configuration for SCPM
 * @param {string} config.scpm.enableProxy - If set, then this will enable the proxy
 * @param {object} config.scpm.proxy - Configuration for proxy for platform   (proxy configuration is set with 'prefix':'service') )
 * @param {object} server - node http server object
 * @param {object} uiAuth - SessionAuthentication
 * @param {object} instanceMrg - embedded instance manager
 * @param {object} mySystemTokenUntil -- Get system token for retrieving user profile
 */
module.exports = function(config,server,uiAuth, instanceMgr,mySystemTokenUntil,app) {

    mySystemTokenUntil = mySystemTokenUntil || new LocalSystemTokenUtil(config);

    if (!config || !config.scpm) {
        throw new errors.Config("Missing config and/or config.scpm");
    }

    //in Node 0.12 the maxSockets per origin is set to infinity (which config has as the default), an additional configuration point has been added if this needs to be tuned
    var agent = new http.Agent({ maxSockets: config.scpm.proxyMaxSockets });
    var httpsAgent = new https.Agent({ maxSockets: config.scpm.proxyMaxSockets });
    //Note: need to explicitly specify the http agent otherwise http-proxy always changes the keep-alive (required for websocket) to 'closed'
    var proxy = httpProxy.createProxyServer({changeOrigin:true,prependPath:true,ignorePath:true, agent: agent, ws:true});
    var httpsProxy = httpProxy.createProxyServer(
        {
            changeOrigin:true,
            prependPath:true,
            ignorePath:true,
            agent: httpsAgent,
            ws:true
        }
    );


    var router = express.Router();


    /**
     * Help to proxy websocket connections:
     * Note: this requires the use of server for the http 'upgrade' event
     */
    server.on('upgrade', function (req, socket, head) {
        var ssl;
        if (config.scpm.enableProxy && config.scpm.proxy && config.scpm.proxy.eb) {
            var proxyConfig = config.eb;
            ssl = (proxyConfig.ssl ? true: null);
        }
        //pass along to express middleware so it can add token etc from session
        var mod = (ssl) ? https : http;
        var res = new mod.ServerResponse(req);
        res.assignSocket(socket);
        res._head = new Buffer(head);
        head.copy(res._head);
        app(req, res);

    });




    proxy.on('proxyReqWs', function(proxyReq, req, socket, options, head) {
        logger.trace('action:proxyReqWs, resource:platform_proxy, message:logging request going through websocket proxy',{url:req.url, proxyReqPath:proxyReq.path});
    });

    /**
     * Useful for debugging or later on if the response needs to be modified before going back to the requester
     */
    proxy.on('proxyRes', function (proxyRes, req, res) {
        //TODO (AH): TPM set cookies in the response body, so after sdk makes calls to tpm, the session changes, and all other calls are not successfull
        // this need to be fixed in tpm TPM-209, then we can remove this condition
        // clearing the cookie can also be disabled if config.clearCookie is false
        if(config.scpm.clearCookie && proxyRes.headers['set-cookie']) {
            delete proxyRes.headers['set-cookie'];
        }
        //trace all requests going back through proxy to requestor
        logger.trace('action:proxyResponse, resource:platform_proxy, message:logging request going through proxy', {headers: proxyRes.headers});
    });
    function handleQuery(proxyReq, req) {

        var key = req.proxyKey;
        if (key && key === 'eb' && config.scpm.proxy.eb) {
            if (req.proxyAccessToken) {
                req.query.token = req.proxyAccessToken;
                logger.debug('handleQuery:adding req.proxyAccessToken to req.query');
            } else {
                logger.warn('handleQuery:no req.proxyAccessToken found');
            }
        }

        //make sure any query string parameters are also passed through
        if (req.query && !_.isEmpty(req.query)) {
            proxyReq.path = proxyReq.path + '?' + qs.stringify(req.query);
        }
    }

    /**
     * Used to make sure that the path being used matches perfectly (including if there is a trailing or no trailing /)
     */
    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        handleQuery(proxyReq,req);
        //trace all requests going through proxy
        logger.trace('action:proxyRequest, resource:platform_proxy, message:logging request going through proxy', {headers: proxyReq.headers, query:req.query,proxyReqPath:proxyReq.path});
    });

    //The following is useful for debugging connection issues for websockets
    proxy.on('open', function (proxySocket) {
        // listen for messages coming FROM the target here using proxySocket.on('data', function(data){})
        logger.trace('Client open');
    });

    proxy.on('close', function (req, socket, head) {
        // view disconnected websocket connections
        logger.trace('Client disconnected');
    });

    httpsProxy.on('proxyReq', function(proxyReq, req, res, options) {
        proxyReq.path = req.overridePath;
        handleQuery(proxyReq,req);
        //trace all requests going through proxy
        logger.trace('action:httpsProxyRequest, resource:platform_proxy, message:logging request going through proxy', {headers: proxyReq.headers, proxyReqPath:proxyReq.path});
    });
    //The following is useful for debugging connection issues
    httpsProxy.on('open', function (proxySocket) {
        // listen for messages coming FROM the target here
        logger.trace('httpsProxy client open');
    });

    httpsProxy.on('close', function (req, socket, head) {
        // view disconnected websocket connections
        logger.trace('httpsProxy client disconnected');
    });
    /**
     * Gets the proxy key (ie.  from 'cb/aaaaa' or 'cb' it will return cb
     * @param {string} path - The path of the request for this route
     * @returns {string} - The proxy key string
     */
    function getProxyKey(path) {
        //remove leading /
        path = path.replace('/','');
        //get string between up to first '/'
        var ind = path.indexOf("/");
        if (ind > -1) {
            return path.substr(0, ind);
        }else {
            return path;
        }
    }


    function getTargetUrl(proxyConfig) {
        return ( (proxyConfig.ssl) ? 'https' : 'http' ) + "://" + proxyConfig.host + ":" + proxyConfig.port + (proxyConfig.path ? proxyConfig.path : "");
    }

    /**
     * Setup and proxy the request to the platform service
     * @param {string} authToken - The access token
     * @param {object} req - Request object
     * @param {object} res - Response object to be sent back
     * @param {function} next - Function for express to continue
     */
    function setupProxy(authToken,req, res, next) {
        var baseUrl = req.baseUrl; //get the base url (mount path) so it can be removed from the prefix
        var path = req.path;  //get path so key for proxy can be if (if found, otherwise this will igore it)
        var proxyKey = getProxyKey(path);
        var tokentype;
        //look-up in config based on matching key, if there is no access token then request will not go through
        if (authToken && proxyKey && config.scpm.proxy && config.scpm.proxy[proxyKey]) {
            var configEntry = config.scpm.proxy[proxyKey].config;
            var proxyConfig = config[configEntry];
            /**
             * Note: proxy configuration is setup in the following structure:
             * {  sb: { config:  "sb" } } (where sb is the key and "sb" configuration location in config file)
             */


            //Used to make sure that the path being used matches perfectly (including if there is a trailing or no trailing /)
            var appendPath = path.replace('/'+proxyKey, '');

            //the path to use in the request to the underlying service
            var url = getTargetUrl(proxyConfig) + appendPath;
            req.proxyKey = proxyKey;


            req.headers.Authorization = 'Bearer ' + authToken;
            tokentype = config.scpm.proxy[proxyKey].tokentype;
            if(proxyConfig.ssl) {
                executeProxyWeb(httpsProxy, proxyWeb);
            }else {
                executeProxyWeb(proxy, proxyWeb);
            }
        } else {
            next(); //pass on, nothing to do here
        }
        //need system token for retrieving user profile
        function executeProxyWeb(myproxy,callback){
            if (tokentype && tokentype === "system") {
                mySystemTokenUntil.getSystemAuthToken(function (err, clientToken) {
                    if(err){
                        return next(err);
                    }
                    req.headers.Authorization = 'Bearer ' + clientToken;
                    callback(myproxy);
                });
            }
            else{
                callback(myproxy);
            }
        }

        function proxyWeb(myproxy){
            myproxy.web(req, res, {target: url}, function (e) {
                //error happened likely due to internal configuration;
                logger.error("action:proxy service, resource:" + proxyKey + ", message:Problem occurred at the target resource at path:"+req.path, {error: e});
                logger.error(e.stack);
                next(e); //pass error to error middleware
            });
        }
    }



    function proxyInstance(referer, req,res,next) {
        var url = URL.parse(referer);
        var query = qs.parse(url.query);
        instanceMgr.authenticateInstance(query.key, function (err, result) {
            if (err) {
                return next(err);
            } else {
                var token = result.accessToken;
                req.proxyAccessToken = token;
                setupProxy(token,req,res,next);
            }
        });
    }

    /**
     * For instance key:
     * Proxy all requests from the mount point to the configured services (in the platform)
     *
     */
    router.all('/*',function (req, res, next) {
        //check it referer is key=xxxx that would point to instance key
        var referer =  req.headers.Referer || req.headers.referer;
        if (config.scpm.enableProxy && referer && referer.indexOf('key=') != -1) {
            proxyInstance(referer,req,res,next);
        }else {
            next();
        }
    });


    /**
     * For sessions:
     * Proxy all requests from the mount point to the configured services (in the platform)
     */
    router.all('/*', uiAuth.ensureAuthenticated, function (req, res, next) {

        if (config.scpm.enableProxy) {
            var token = uiAuth.getAccessToken(req);
            req.proxyAccessToken = token;
            setupProxy(token, req, res, next);
        } else {
            next();
        }
    });

    /**
     * Called from socket upgrade and only run if eq.headers.upgrade === websocket
     */
    app.use('/proxy/eb/*', function (req, res, next) {
        if (config.scpm.proxy && config.scpm.proxy.eb && config.scpm.enableProxy && req.headers && req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket' ) {
            var token = uiAuth.getAccessToken(req);
            logger.trace('/proxy/eb/*', {uiAuthToken:token});
            req.proxyAccessToken = token;
            var path = req.originalUrl;
            //var proxyKey = "eb";
            req.proxyKey = "eb";
            //EB is the only one dealing with websockets
            // if (config.scpm.enableProxy && ) {
            logger.debug('************* upgrade ws *************');
            var proxyConfig = config.eb;
            //for websockets it will be ws or wss for protocol
            //the path to use in the request to the underlying service
            //var appendPath = path.replace('/'+proxyKey, '');
            var appendPath = path.replace('/proxy/eb','');
            req.overridePath =  appendPath;

            //make sure url is full path
            var url = getTargetUrl(proxyConfig) + appendPath;


            if (config.scpm.proxy.eb && req.proxyAccessToken) {
                req.query.token = req.proxyAccessToken;
            } else {
                logger.warn('skipping adding token: no req.proxyAccessToken found ');
            }

            //make sure any query string parameters are also passed through to url
            if (req.query && !_.isEmpty(req.query)) {
                url = url + '?' + qs.stringify(req.query);
            }

            var socket = res.socket;
            var head = new Buffer(res._head);
            res._head.copy(head);

            //proxy the websocket
            proxy.ws(req, socket, head, {target: url}, function(e) {
                logger.error("problem with ws request:"+e.message,{error:e});
                if (!socket.destroyed) { //if client didn't cancel then try to close socket, otherwise it will already be closed later
                    try {
                        socket.close();
                    }catch(e){
                        logger.trace('socket destroyed',{error:e});
                    }
                }
            });
            return true;
            // }
        } else {
            next();
        }
    });


    return router;

};
