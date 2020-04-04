/**
 * Copyright Digital Engagement Xperience 2018
 */



const DEFAULT_EPA_WORKFLOW = require('../config/workflow').epa;

const express = require('express');
const sessionUtil = require('dex-authentication').util.sessionUtil;
const fs = require('fs');

//load
const workflowConfigPath = __dirname+'/../config/default-epa-workflow.js';
const file = fs.readFileSync(workflowConfigPath, 'utf8');




module.exports = function (config, bcAppIntegration) {

    var router = express.Router();

    router.get('/epa', function (req, res, next) {

        //proxy wf from tenant configured location or return default file

        //res.type('js');
        //sendfile seems slow...why
//        res.sendFile('default-epa-workflow.js',{root: './config/'});

        res.status(200).send(file);

        //res.status(200).send('var EPA_WORKFLOW ='+DEFAULT_EPA_WORKFLOW);
    });

    router.post('/epa/step/:name/check', function (req, res, next) {
        //check if the user can
        //proxy wf from tenant configured location or return default file



        //check if user has permission for step

        var currentRole =sessionUtil.getUserSettings(req, 'role');


        //get permissions for role


        var stepName = req.params.name;

        //get current role of user



        //req.user




        //res.type('js');
        res.sendFile('default-epa-workflow.js',{root: './config/'});

        //res.status(200).send('var EPA_WORKFLOW ='+DEFAULT_EPA_WORKFLOW);
    });


    // router.get('/bc-def', function (req, res, next) {
    //     res.type('js');
    //     res.status(200).send('var BC_DEF_WORKFLOW ='+DEFAULT_EPA_WORKFLOW);
    // });
    //

    return router;
};
