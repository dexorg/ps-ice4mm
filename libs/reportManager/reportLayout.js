/**
 * Copyright Digital Engagement Xperience
 * Date: 25/06/15
 * @author Ali Hussain
 * @description manage the reports layout
 */


var http = require('http');
var _ = require('underscore');
var LM = require('dex-http-client').lm;

function ReportLayout(config) {
    this.config = config;
    this.lmClient = new LM(this.config);
}

ReportLayout.prototype.retrieveLayout = function(layoutId, callback) {
    this.lmClient.retrieveLayout(layoutId, function (err, data) {
        if(err){
            callback(err, null);
        }
        else {
            callback(null, data);
        }
    });

};


module.exports = ReportLayout;