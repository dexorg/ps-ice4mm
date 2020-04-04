/**
 * Copyright Digital Engagement Xperience 2016
 */

(function() {
    var expect = chai.expect;
    'use strict';
    describe('fg-groups client integration', function() {

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

        it('Create FB Group', function(done) {
            dexit.app.ice.edu.integration.fbgroup.createGroup({}, sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/facebook/group/"}));
            done();
        });

        it('addCourseChannels', function(done) {
            dexit.app.ice.edu.integration.fbgroup.addCourseChannels('courseId', 'channelURL', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/course"}));
            done();
        });

        it('Retrieve Members', function(done) {
            dexit.app.ice.edu.integration.fbgroup.retrieveMembers('groupId', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/facebook/group/groupId/members"}));
            done();
        });
        it('Retrieve All Members', function(done) {
            dexit.app.ice.edu.integration.fbgroup.retrieveAllMembers('groupId', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/facebook/group/groupId/allmembers"}));
            done();
        });
        it('storeUserGroupAuth', function(done) {
            dexit.app.ice.edu.integration.fbgroup.storeUserGroup('groupId', sinon.spy());
            expect(jQuery.ajax.calledWithMatch({ url: "/facebook/usergroup"}));
            done();
        });



    });
})();
