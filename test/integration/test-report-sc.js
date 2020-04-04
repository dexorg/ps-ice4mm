/**
 * Copyright Digital Engagement Xperience 2015
 * Created by ali on 14/06/15.
 */


var should = require('chai').should();
var _ = require('underscore');

// module under test
var ReportEngine = require('dex-http-client').reportEngine;

var config = {
    reportEngine: {
        host: 'http://report-engine.dexit.co',
        port: '80'
    }
};

describe('ReportEngine', function () {

    var token = 'token1';
    var repo = 'dexit';
    var data = {
        name: 'Report of Students Name',
        class: 'report'
    };

    var theReport; // The report to be created

    it('should create report SC', function (done) {
        var reportEngine = new ReportEngine(config);
        reportEngine.createReportSC(token, repo, data, function (err, reportSC) {
            should.not.exist(err);
            if(reportSC) {
                theReport = reportSC;
            }
            done();
        });
    });

    it('should retrieve report SC', function (done) {
        var reportEngine = new ReportEngine(config);
        reportEngine.getReportSC(token, repo, theReport.id, function (err, reportSC) {
            should.not.exist(err);
            done();
        });
    });

    it('should delete report SC', function (done) {
        var reportEngine = new ReportEngine(config);
        reportEngine.deleteReportSC(token, repo, theReport.id, function (err) {
            should.not.exist(err);
            done();
        });
    });

});
