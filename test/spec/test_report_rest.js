/**
 * Copyright Digital Engagement Xperience 2016
 */

(function() {
    var expect = chai.expect;
    'use strict';
    describe('report client integration', function() {

        beforeEach(function() {
            sinon.stub(jQuery, "ajax", function (options) {
                var dfd = $.Deferred();
                if (options.success) {
                    dfd.done(options.success({}, 'success'));
                }
                if (options.error) dfd.fail(options.error);
                dfd.success = dfd.done;
                dfd.error = dfd.fail;
                return dfd;
            });
        });

        afterEach(function() {
            jQuery.ajax.restore();
        });

        it('List Intelligence Instances of Report SC', function(done) {
            dexit.app.ice.edu.integration.report.listIntelligenceInstances('ds1', 'table1', 'rowsABC','queryA', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/report/intelligence/ds1/table1/rowsABC?query=queryA"}));
            done();
        });

        it('Retrieve Report Layout', function(done) {
            dexit.app.ice.edu.integration.report.retrieveLayout('layoutId', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/report/layout/layoutId"}));
            done();
        });

        it('Create Conceptual intel of report', function(done) {
            dexit.app.ice.edu.integration.report.intelligence.conceptual.create('repo1', 'reportId1', {}, sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "repo1/report/reportId1/intelligence/conceptual/"}));
            done();
        });

        it('Create Informational intel of report', function(done) {
            dexit.app.ice.edu.integration.report.intelligence.informational.create('repo1', 'conceptId', {}, sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "repo1/report/intelligence/conceptual/conceptId/informational/"}));
            done();
        });

        it('Delete Conceptual intel of report', function(done) {
            dexit.app.ice.edu.integration.report.intelligence.conceptual.delete('repo1', 'reportId', 'conceptId', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "repo1/report/reportId/intelligence/conceptual/conceptId"}));
            done();
        });

        it('List Reports', function(done) {
            dexit.app.ice.edu.integration.report.listReports('repo1', 'type1', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "repo1/smartcontent/?type=type1"}));
            done();
        });

    });
})();
