
const express = require('express');
const rp = require('request-promise');
const logFormatter = require('dex-logger').logFormatter;

module.exports = function (config) {
    var router = express.Router();
    const conf = config.cognos;
    const dde_client_id = config.cognos.dde_client_id;
    const dde_client_secret = config.cognos.dde_client_secret;

    router.get('/session', function(request, response) {
        console.log(dde_client_id);
        var options = {
            method: 'POST',
            uri: conf.dde_session_uri,
            headers: {
                'Authorization': 'Basic ' + new Buffer(dde_client_id + ':' + dde_client_secret).toString('base64'),
                'content-type': 'application/json'
            },
            body: {
                'expiresIn': 3600,
                webDomain: conf.web_domain
                //"webDomain": "http://localhost:3000" // for local testing
                //"webDomain": "https://{app-name}.mybluemix.net" // for deployment
            },
            json: true // Automatically stringifies the body to JSON
        };

        rp(options)
            .then(function (parsedBody) {
                // POST succeeded...
                console.log('post suceeded');
                console.log(JSON.stringify(parsedBody));
                response.send(parsedBody);
            })
            .catch(function (err) {
                // POST failed...
                console.log('post failed!');
                console.log(JSON.stringify(err));
                response.send(err);
            });

    });
    return router;

};
