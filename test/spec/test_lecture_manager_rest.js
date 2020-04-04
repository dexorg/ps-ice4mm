/**
 * Copyright Digital Engagement Xperience 2016
 */

(function() {
    var expect = chai.expect;
    'use strict';
    describe('lecture-manager client integration', function() {

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

        it('Add Intelligence', function(done) {
            dexit.app.ice.edu.integration.lectureManager.addIntelligence('lectureId1', {}, sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/lecture/lectureId1/intelligence"}));
            done();
        });

        it('Delete Intelligence', function(done) {
            dexit.app.ice.edu.integration.lectureManager.deleteIntelligence('lectureId1', 'intelligenceId', 'intelType', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/lecture/lectureId1/intelligence/intelligenceId'&type=intelType"}));
            done();
        });

        it('access LectureLink', function(done) {
            dexit.app.ice.edu.integration.lectureManager.accessLectureLink('lectureId1', {type:'type'}, sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/lecture/lectureId1/touchpoint/type/link"}));
            done();
        });

        it('retrieve Lecture Details', function(done) {
            dexit.app.ice.edu.integration.lectureManager.retrieveLectureDetails('lectureId1', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/lecture/lectureId1"}));
            done();
        });
    });
})();
