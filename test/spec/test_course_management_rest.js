/**
 * Copyright Digital Engagement Xperience 2016
 */

(function() {
    var expect = chai.expect;
    'use strict';
    describe('course management', function() {

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

        it('Update Course Property', function(done) {
            dexit.app.ice.edu.integration.courseManagement.updateProperty('repo', 'courseId', 'updateProperty',sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "repo/course/courseId"}));
            done();
        });

        it('list Shared Lectures', function(done) {
            dexit.app.ice.edu.integration.courseManagement.listSharedLectures('courseId',sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/course/courseId/lectures?shared=true"}));
            done();
        });

    });
})();
