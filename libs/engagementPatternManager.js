/**
 * Copyright Digital Engagement Xperience
 * Date: 05/11/15
 * @author Ali Hussain
 * @description this components manages engagement patterns through integrating with ps-ice
 */

var http = require('http');
var _ = require('underscore');
var async = require('async');
var EngagementPatternBuilder = require('ps-ice').engPatternBuilder;

function EngagementPatternManager(config) {
    this.config = config;
    this.epb = new EngagementPatternBuilder(this.config);
}

EngagementPatternManager.prototype.listTemplates = function(callback) {

    var self = this;
    self.epb.listTemplates(function(err, templates){
        if(err) {
            callback(err);
        }else{
            callback(null, templates);
        }
    });

};

module.exports = EngagementPatternManager;