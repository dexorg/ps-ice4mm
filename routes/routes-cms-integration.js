/**
 * Copyright Digital Engagement Xperience 2018
 */


const express = require('express');
const https = require('https');
const _ = require('underscore');
const utils = require('dex-http-client').utils;
const logFormatter = require('dex-logger').logFormatter;
const errors = require('dex-errors');
const request = require('request');
const urlParser = require('url');
const formUrlEncoded = require('form-urlencoded');
const async = require('async');
const uuidv4 = require('uuid/v4');
const cloudscraper = require('cloudscraper');
if (process.env.LOGGING_LEVEL && process.env.LOGGING_LEVEL.toLowerCase() === 'debug') {
    require('request-debug')(request);
}

const wchUtils = require('../libs/cms-integration/ibm-wch-integration');

const COS = require('ibm-cos-sdk');
const URL = require('url');


module.exports = function (config) {

    var router = express.Router();


    function getUrl(multimediaURL) {

        try {
            let url =  URL.parse(multimediaURL);
            return url;
        }catch (e) {
            return e;
        }
    }



    router.get('/cms-config', function (req, res, next) {

        //TODO: get from tenant configuration
        let cmsConfig = config.cms;
        let result = {
            supportedModes: cmsConfig.supportedModes
        };
        //send configuration
        res.status(200).send(result);

    });

    router.get('/cms-config/:name', function (req, res, next) {

        let cmsConfig = config.cms;
        let cmsConfigName = req.params.name;
        let found = _.find(cmsConfig.modes, {name:cmsConfigName});

        if (found) {
            let result = {
                params: found.params,
                mode: found.mode
            };
            //send configuration
            res.status(200).send(result);
        }else {
            next(new errors.NotFound('Invalid options'));
        }

    });

    var getIBMWCHToken = function (cmsConfig, callback) {
        let authUrl = cmsConfig.integration.wchUrl + '/login/v1/basicauth';


        //turn on cookies and store for this request only
        let j = request.jar();
        let options = {
            jar: j,
            auth: {
                user:cmsConfig.integration.wchUserName,
                pass: cmsConfig.integration.wchPassword
            }
        };

        request.post(authUrl, options, function(error, response, body) {
            if (error) {
                return callback(new errors.Validation('Misconfiguration of integration'));
            }

            callback(null,j.getCookies(authUrl));

        });

    };

    var getIBMWCHPreviewSiteToken = function (cmsConfig, callback) {
        //let authUrl = cmsConfig.integration.wchPreviewUrl +  '/api/1a63c84f-0593-4e6c-9bbb-99472fcec8d6' +  '/login/v1/basicauth';
        //let authUrl = cmsConfig.integration.wchPreviewUrl +  '/api' +  '/login/v1/basicauth';
        let authUrl = cmsConfig.integration.wchPreviewAuthUrl;


        //turn on cookies and store for this request only
        let j = request.jar();
        let options = {
            jar: j,
            auth: {
                user:cmsConfig.integration.wchUserName,
                pass: cmsConfig.integration.wchPassword
            }
        };

        request.get(authUrl, options, function(error, response, body) {
            if (error) {
                return callback(new errors.Validation('Misconfiguration of integration'));
            }

            callback(null,j.getCookies(authUrl));

        });

    };


    // var getIBMIdentityToken = function(cmsConfig, callback) {
    //
    //     let authUrl = '';
    //
    //
    //     try {
    //         authUrl = urlParser.parse(cmsConfig.integration.tokenUrl);
    //     } catch (e) {
    //     }
    //     if (!authUrl) {
    //         return callback(new errors.HttpStatus(500, 'Misconfiguration of integration'))
    //     }
    //     var body = formUrlEncoded({
    //         grant_type: cmsConfig.integration.tokenGrantType,
    //         apikey:cmsConfig.integration.apikey
    //     });
    //
    //     var options = {
    //         host: authUrl.host,
    //         port: authUrl.port,
    //         path: authUrl.path,
    //         method: 'POST',
    //         headers: {'Content-Type': 'application/x-www-form-urlencoded','Accept':'application/json'},
    //         msgbody: body
    //     };
    //     options.headers['Content-Length'] = Buffer.byteLength(body);
    //
    //     utils.executeRequest(https, options, false, function (err, result) {
    //         if (err) {
    //             callback(err);
    //         } else {
    //             callback(null, result.access_token);
    //         }
    //     });
    //
    // };

    var getAccessToken = function(cmsConfig, callback) {
        //TODO: generalize
        if (cmsConfig.integration.requiresTokenExchange) {
            getIBMWCHToken(cmsConfig, function(err, res) {
                if (err) {
                    return callback(err);
                }
                callback(null, {wchHub:res});
            });
        }else {
            callback(null, cmsConfig.integration.apiKey);
        }
    };

    var resolveIntegrationConfigurationDetails = function (req, res, next) {
        var integrationMode = req.body.integrationName;

        let foundConfig = _.find(config.cms.modes, function (val) {
            return (val.params.name.indexOf(integrationMode) !== -1);
        });

        if (!foundConfig) {
            return next(new errors.Validation('integrationName is required'));
        }
        //add configuration to request

        req.integrationConfig = foundConfig;

        getAccessToken(foundConfig, function (err, token) {
            if (err) {
                return next(err);
            }
            req.integrationToken = token;
            next();
        });
    };



    //QH: handling is different for ep-info
    function handleFilesIBMCOS(integrationToken, foundConfig, requestPath, fileInfo, logger) {

        const cos = new COS.S3(foundConfig.integration.cos);

        async.each(fileInfo, function (item, cb) {
            cos.putObject({
                Bucket: item.bucketName || 'wch-dex-integration',
                Key: item.fileName,
                Body: item.fileData,
                ContentType: item.contentType
            }, cb);
        }, function (err) {
            if (err) {
                logger.error('problem uploading files', {err:err, files:fileInfo, fn: 'handleFilesIBMCOS'});
            }
        });



    }


    /**
     * QH: for file upload, handle specific case
     * @param {string|object} integrationToken
     * @param {object} foundConfig
     * @param {string} requestPath - TODO: NOT USED
     * @param {object[]} fileInfo
     * @param {string} fileInfo[].file_paths
     * @param {string} fileInfo[].fileUrl
     * @param {string} fileInfo[].elementId
     // * @param {string} fileInfo[].folder_id
     // * @param {string} fileInfo[].folder_names /
     *
     */
    function handleFilesWatson(integrationToken, foundConfig, requestPath, fileInfo, logger) {

        //var postUrl = 'https://' +foundConfig.integration.host + ':'+ foundConfig.integration.port + requestPath;
        //var postUrl = 'https://' +foundConfig.integration.host + ':'+ foundConfig.integration.port + '/filemanager/api/v2/files';
        // var postUrl = 'https://' +foundConfig.integration.host + ':'+ foundConfig.integration.port + '/filemanager/api/v2/files';
        var postUrl = foundConfig.integration.wchUrl;
        //for each item in fileInfo, then update
        let authUrl = foundConfig.integration.wchUrl + '/login/v1/basicauth';
        let wchDomain = foundConfig.integration.wchDomain;
        async.each(fileInfo, function (item, cb) {


            let multimediaURL = item.fileUrl;

            //skip for text
            if (!multimediaURL) {
                return cb();
            }

            if (multimediaURL.indexOf('http') === -1 && multimediaURL.startsWith('/img/')) {
                multimediaURL = multimediaURL.replace('/img/','https://s3.amazonaws.com/resource.dexit.co/images/ice4m/');
            }
            let fileName = item.fileName;
            var cookieJar = request.jar();

            integrationToken.wchHub.forEach((x) => {
                cookieJar.setCookie(x,authUrl);
            });
            // integrationToken.wchHub.split(';').forEach((x) => {
            //     cookieJar.setCookie(request.cookie(x),wchDomain);
            // });


            var assetData = {
                //id: item.elementId,
                name: fileName,
                path: item.filePath,
                // resource: uuidv4(),
                //status: 'draft',
                tags: {  values: [ 'sc' ] },
            };

            var formData = {
                filename: fileName, // if you need to change the file name
                resource: request.get(multimediaURL),
                data: JSON.stringify(assetData)
                //.field('files',multimediaURL, {attachment:true})
            };


            var options = { method: 'POST',
                jar: cookieJar,
                url: postUrl +'/authoring/v1/assets',
                qs: {   // md5: 'string',
                    // fields: 'undefined',
                    //include: 'undefined',
                    // analyze: 'false',
                    // autocurate: 'true'
                },
                headers:{
                    'Content-Type':'multipart/form-data',
                    'Accept': 'application/json'
                },
                formData: formData
            };
            request(options, function (error, response, body) {
                if (error) {
                    logger.error('problem uploading file', {
                        err: error,
                        fileName: fileName,
                        multimediaURL: multimediaURL
                    });
                }


                try {
                    if (_.isString(body)) {
                        body = JSON.parse(body);
                    }
                    //correlate the the response pf the asset id to the element id from the pattern
                    _.extend(body, {elementId: item.elementId});

                    logger.debug('upload sucesss',{result:body});

                    cb(null, body);
                    return;
                }catch(e) {
                    logger.error('could not process body', {body:body});
                    cb(new errors.HttpStatus(500, 'Could not process body'));
                }
            });
        }, function (err) {
            if (err) {
                logger.error('problem uploading files', {err:err, files:fileInfo});

            }
        });

    };

    /**
     * QH: for file upload, handle specific case
     * @param {string} integrationToken
     * @param {object} foundConfig
     * @param {string} requestPath - TODO: NOT USED
     * @param {object[]} fileInfo
     * @param {string} fileInfo[].file_paths
     * @param {string} fileInfo[].fileUrl
     * @param {string} fileInfo[].folder_id
     * @param {string} fileInfo[].folder_names
     *
     */
    function handleFilesHubspot(integrationToken, foundConfig, requestPath, fileInfo, logger) {

        //var postUrl = 'https://' +foundConfig.integration.host + ':'+ foundConfig.integration.port + requestPath;
        //var postUrl = 'https://' +foundConfig.integration.host + ':'+ foundConfig.integration.port + '/filemanager/api/v2/files';
        // var postUrl = 'https://' +foundConfig.integration.host + ':'+ foundConfig.integration.port + '/filemanager/api/v2/files';
        var postUrl = 'https://' +foundConfig.integration.host + '/filemanager/api/v2/files';
        //for each item in fileInfo, then update
        async.each(fileInfo, function (item, cb) {


            let multimediaURL = item.fileUrl;

            //skip for text
            if (!multimediaURL) {
                return cb();
            }

            if (multimediaURL.indexOf('http') === -1 && multimediaURL.startsWith('/img/')) {
                multimediaURL = multimediaURL.replace('/img/','https://s3.amazonaws.com/resource.dexit.co/images/ice4m/');
            }


            //var multimediaSplitter = multimediaURL.split('.');
            //var ext = multimediaSplitter[multimediaSplitter.length - 1];
            let fileName = item.file_names;
            //let fPath = + '/'+item.folder_paths + '/'

            //request.get(fileName)



            var formData = {
                file_names: item.file_names, // if you need to change the file name
                folder_paths: item.folder_paths, // if you need to change the file name
                //folder_id:item.folder_id // if you need to change the file name
                files: request.get(multimediaURL)
                //.field('files',multimediaURL, {attachment:true})
            };

            request({
                method:'POST',
                url:postUrl,
                headers:{
                    'Content-Type':'multipart/form-data',
                    'Accept': 'application/json'
                },
                qs:{
                    'hapikey':integrationToken,
                    'portal':foundConfig.integration.portalId,
                    'overwrite':'true' // if you want to overwrite the file when it already exists
                    //'hidden':'false' // if you want the file to be visible in the File Manager
                },
                formData: formData
            }, function (err, response, body) {
                if (err) {
                    logger.error('problem uploading file',{err:err, fileName:fileName, multimediaURL:multimediaURL});
                }else {
                    logger.debug(response.statusCode);
                }
                cb();
            });

        }, function (err) {
            if (err) {
                logger.error('problem uploading files', {err:err, files:fileInfo});

            }
        });

    };

    function parseJSONResponseBody(body) {
        if (_.isString(body)) {
            try {
                return JSON.parse(body);
            }catch (e) {
                return {};
            }
        }else {
            return body;
        }
    }

    router.post('/external-cms/request', resolveIntegrationConfigurationDetails, function (req, res, next) {
        let logger = logFormatter('external-cms','integration-request');

        var callback = function (err, resp) {
            if (err) {
                
                return next(err);
            }
            res.status(200).send(resp);
        };


        var handleFiles = function(integrationToken, foundConfig, requestPath, fileInfo) {
            // if (!foundConfig.integration.mmUploadModule) {
            //     logger.error('No integration module for mmUpload...files cannot be uploaded',{name: foundConfig.name});
            //     return callback(new errors.HttpStatus(500, 'misconfiguration: No integration module for upload'));
            // }
            //QH
            if (foundConfig.name === 'external-HubSpotCOS') {
                handleFilesHubspot(integrationToken,foundConfig, requestPath, fileInfo,logger);
            } else if (foundConfig.name === 'external-wch') {
                if (fileInfo.length > 0 && fileInfo[0].api && fileInfo[0].api === 'cos') {
                    handleFilesIBMCOS(integrationToken, foundConfig, requestPath, fileInfo, logger);
                } else {
                    handleFilesWatson(integrationToken, foundConfig, requestPath, fileInfo, logger);
                }

            }else {
                logger.error('No integration module for upload...files cannot be uploaded',{name: foundConfig.name});
                return callback(new errors.HttpStatus(500, 'misconfiguration: No integration module for upload'));
            }

            //improvement: use an async identifier to indicate work is pending for file upload, ice4m webUI can poll for completion
            //callback is immediate to avoid timeout on Heroku
            callback(null, {'result':'success'});


        };


        //from middleware above
        var foundConfig = req.integrationConfig;
        var integrationToken = req.integrationToken;

        var requestType = req.body.type; //get, put, post, delete or file_upload
        var requestPath = req.body.path;
        var requestBody = req.body.body;

        var headers = req.body.headers || {};


        //QH: add to query string for hubspot only
        if (foundConfig.name && foundConfig.name === 'external-HubSpotCOS') {
            //var authQuery = 'hapikey=' + foundConfig.integration.apiKey + '&portal=' + foundConfig.integration.portalId;
            var authQuery = 'hapikey=' + integrationToken + '&portal=' + foundConfig.integration.portalId;
            if (requestPath.indexOf('?') === -1) {
                requestPath = requestPath + '?' + authQuery;
            } else {
                requestPath = requestPath + '&' + authQuery;
            }
        }

        logger.info('requesting', {path: requestPath});
        var defaultHeaders =  {'Accept': 'application/json'};

        //QH
        if (requestType.toUpperCase() === 'FILE_UPLOAD') {
            handleFiles(integrationToken, foundConfig, requestPath, requestBody, callback);
            //Timeout occurs?
        //QH
        } else if (requestType.toUpperCase() === 'HTML_DOWNLOAD') {


            if (foundConfig.name === 'external-wch') {


                getIBMWCHPreviewSiteToken(foundConfig, function (err, cookies) {
                    if (err) {
                        return next(err);
                    }
                    //debugger;

                    //let authUrl = foundConfig.integration.wchPreviewUrl +  '/api/1a63c84f-0593-4e6c-9bbb-99472fcec8d6' +  '/login/v1/basicauth';
                    let authUrl = foundConfig.integration.wchPreviewAuthUrl;
                    //let authUrl = foundConfig.integration.wchPreviewUrl + '/login/v1/basicauth';
                    let cookieJar = request.jar();
                    cookies.forEach((x) => {
                        cookieJar.setCookie(x, authUrl);
                    });

                    let cookieStr = cookieJar.getCookieString(authUrl);

                    wchUtils.crawlPreviewPage(requestBody, cookieStr, cookies, function (err, result) {
                        if (err) {
                            return next(err);
                        }
                        //debugger;
                        result = result || '';

                        res.status(200).send(result.trim());

                    });

                });

            }else {


                //debugger;
                let downloadOptions = {
                    url: requestBody.redirect_url,
                    method: 'GET'
                };
                if (downloadOptions.url.indexOf('http') !== 0) {
                    downloadOptions.url = foundConfig.integration.protocol + foundConfig.integration.host + requestBody.redirect_url
                }
                if (foundConfig.name === 'external-wch') {
                    let authUrl = foundConfig.integration.wchUrl + '/login/v1/basicauth';
                    let cookieJar = request.jar();
                    integrationToken.wchHub.forEach((x) => {
                        cookieJar.setCookie(x, authUrl);
                    });
                    downloadOptions.jar = cookieJar;
                }


                cloudscraper.request(downloadOptions, function (error, response, body) {
                    if (error) {
                        //TODO: cloudflare blocks request, so user will manually need to paste in page source
                        res.status(500).send('error');
                        logger.error('Error occurred', {error: error});
                    } else {
                        logger.debug('response', {body: body});
                        res.status(200).send(body);
                    }
                });

            }

        } else {




            var options = {
                uri: foundConfig.integration.protocol + foundConfig.integration.host + requestPath,
                method: requestType.toUpperCase(),
                headers: _.extend(defaultHeaders, headers)
            };



            // var options = {
            //     host: foundConfig.integration.host,
            //     port: foundConfig.integration.port || 443,
            //     path: requestPath,
            //     method: requestType.toUpperCase(),
            //     headers: _.extend(defaultHeaders, headers)
            // };
            //HTML_DOWNLOAD

            //QH: attach cookie
            if (foundConfig.name && foundConfig.name === 'external-wch') {
                let authUrl = foundConfig.integration.wchUrl + '/login/v1/basicauth';
                var cookieJar = request.jar();
                integrationToken.wchHub.forEach((x) => {
                    cookieJar.setCookie(x,authUrl);
                });
                options.jar =  cookieJar;
            }

            if (requestBody && !_.isEmpty(requestBody) && !options.headers['Content-Type']) {
                options.headers['Content-Type'] = 'application/json';
                //var sBody = JSON.stringify(requestBody);
                options.json = true;
                //options.headers['Content-Length'] = Buffer.byteLength(sBody);
                options.body = requestBody;
            }

            request(options, function (err, response, body) {
                if (err) {
                    return callback(err);
                }



                callback(null,parseJSONResponseBody(body));
            });

            // //Create the request
            // var httpReq = https.request(options, function (res) {
            //     utils.handleResponse(res, callback, false);
            // });
            // //End the request
            // httpReq.on('error', function (e) {
            //     utils.handleRequestError(e, callback);
            // });
            //
            // if (requestBody && !_.isEmpty(requestBody)) {
            //     httpReq.end(sBody);
            // } else {
            //     httpReq.end();
            // }
        }

    });



    // router.get('/bc-def', function (req, res, next) {
    //     res.type('js');
    //     res.status(200).send('var BC_DEF_WORKFLOW ='+DEFAULT_EPA_WORKFLOW);
    // });
    //

    return router;


};
