/**
 * Copyright Digital Engagement Xperiance
 * Date: 25/06/15
 * @author Ali Hussain
 * @description integration layer to integrate with report routes in ice4e
 */

dexit.app.ice.edu.integration.report = {};
dexit.app.ice.edu.integration.report.listReports = function (repo, type, callback) {
    'use strict';
    var report_resource = repo+'/smartcontent/?type='+type,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(report_resource);
    restStrategy.list(callback);
};
dexit.app.ice.edu.integration.report.listIntelligenceInstances = function (datastore, table, rows, query, callback) {
    'use strict';
    var report_resource = '/report/intelligence/'+datastore+'/'+table+'/'+rows;
    if(query) {
        report_resource += '?query='+query;
    }
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(report_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.edu.integration.report.retrieveLayout = function (id, callback) {
    'use strict';
    var report_resource = '/report/layout/'+id,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(report_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.edu.integration.report.intelligence = {};
dexit.app.ice.edu.integration.report.intelligence.conceptual = {};
dexit.app.ice.edu.integration.report.intelligence.informational = {};
dexit.app.ice.edu.integration.report.intelligence.conceptual.create = function (repo, id, body, callback) {
    'use strict';
    var report_resource = repo+'/report/'+id+'/intelligence/conceptual/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(report_resource);
    restStrategy.create(body, callback);
};
dexit.app.ice.edu.integration.report.intelligence.informational.create = function (repo, conceptId, body, callback) {
    'use strict';
    var report_resource = repo+'/report/intelligence/conceptual/'+conceptId+'/informational/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(report_resource);
    restStrategy.create(body, callback);
};
dexit.app.ice.edu.integration.report.intelligence.conceptual.delete = function (repo, id, conceptId, callback) {
    'use strict';
    var report_resource = repo+'/report/'+id+'/intelligence/conceptual/'+conceptId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(report_resource);
    restStrategy.destroy(callback);
};
