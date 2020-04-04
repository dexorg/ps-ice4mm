/**
 * Copyright Digital Engagement Xperience 2016
 */

(function() {
    var expect = chai.expect;
    'use strict';
    describe('course-tp client integration', function() {

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

        it('Retrieve Course List', function(done) {
            dexit.app.ice.edu.integration.course.touchpoint.deleteTP('tpId', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/course/touchpoint/tpId"}));
            done();
        });

    });
})();
