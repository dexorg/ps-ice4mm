/**
 * Copyright Digital Engagement Xperience 2015 - 2016
 * Date: 22/06/15
 * @author Ali Hussain
 * @description this component contains the ability to manage report intelligence
 */


var _ = require('underscore');
var KB = require('dex-http-client').kb;
var SCIntelligenceClient = require('icep-scm').scClient.scIntelligence;
var async = require('async');

function ReportIntelligence(config) {
    this.config = config;
    this.kbClient = new KB(this.config);
    this.scIntelligence = new SCIntelligenceClient(config);
}

/**
 *
 * @param {string} datastore - db name
 * @param {string} token - system token
 * @param {ReportIntelligence~listIntelligenceCallback} callback
 */
ReportIntelligence.prototype.listIntelligence = function(datastore, token, callback) {
    var self = this;
    async.waterfall(
        [
            function getDataStore(done) {
                self.kbClient.getDSAuth(token, datastore, done);
            },
            function getSchema(data, done) {
                /* KB return nothing for schemas which don't exist */
                if (!data || !data.schema || data.schema==='') {
                    /* return empty records as workaround */
                    data = { id: datastore, name: datastore, records: [] };
                    done(null, data);
                }
                else {
                    self.kbClient.getSchemaAuth(token, data.schema, done);
                }
            },
            function getSchemaRecords (schema, done) {
                if (schema) {
                    /* returned data is an object representing schema; transform to array of table names */
                    var tableNameList = _.map(schema.records, function(record,idx) {
                        return [record.name];
                    });
                    done(null, tableNameList);
                }
                else {
                    done();
                }
            }
        ], function(err, result){
            callback(err, result);
        }
    );
};

/**
 *
 * @param {string} datastore - db name
 * @param {string} table - table name
 * @param {string} rows - set query column name, * by default
 * @param {object} query - sql query, default: 'select '+rows +'from '+table;
 * @param {number} page - query page, 100 by default
 * @param {number} limit - query count limit, 0 by default
 * @param {string} token - system token
 * @param {ReportIntelligence~listIntelligenceDataCallback} callback
 */
ReportIntelligence.prototype.listIntelligenceData = function(datastore, table, rows, query, page, limit, token, callback) {
    var self = this;
    self.kbClient.executeQueryAuth(token, query, {"query":'query'}, datastore, page, limit, callback);
};

/**
 *
 * @param {string} token - system token
 * @param {string} repo - tenant
 * @param {string} scId - smartcontent id for current report
 * @param {object} body - {name: string, location: string}
 * @param {ReportIntelligence~createConceptualIntelligenceCallback} callback
 */
ReportIntelligence.prototype.createConceptualIntelligence = function(token, repo, scId, body, callback) {
    var self = this;
    self.scIntelligence.createConceptualIntelligence(token, repo, scId, body, callback);

};

/**
 *
 * @param {string} token - system token
 * @param {string} repo - tenant
 * @param {string} scId - smartcontent id for current report
 * @param {object} body - {name: string, location: string}
 * @param {ReportIntelligence~createConceptualIntelligenceCallback} callback
 */
ReportIntelligence.prototype.createInformationalIntelligence = function(token, repo, conceptId, body, callback) {
    var self = this;
    self.scIntelligence.createInformationalIntelligence(token, repo, conceptId, body, callback);

};

/**
 *
 * @param {string} token - system token
 * @param {string} repo - tenant
 * @param {string} scId - smartcontent id for current report
 * @param {string} conceptId - intelligence id
 * @param {ReportIntelligence~createConceptualIntelligenceCallback} callback
 */
ReportIntelligence.prototype.deleteConceptuallIntelligence = function(token, repo, scId, conceptId, callback) {
    var self = this;
    self.scIntelligence.retrieveConceptualIntelligence(token, repo, conceptId, function(err, concept) {
        if(err) {
            callback(err);
        }
        else {
            if(concept.information && concept.information.length>0) {
                async.each(concept.information, function (information, done) {
                    self.scIntelligence.deleteInformationalIntelligence(token, repo, conceptId, information.id, done);

                }, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        self.scIntelligence.deleteConceptualIntelligence(token, repo, scId, conceptId, function (err, res) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
            }
            else {
                self.scIntelligence.deleteConceptualIntelligence(token, repo, scId, conceptId, function(err, res) {
                    if(err) {
                        callback(err);
                    }
                    else {
                        callback();
                    }
                });
            }
        }
    });


};
module.exports = ReportIntelligence;
