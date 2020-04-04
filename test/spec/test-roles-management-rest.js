/**
 * @copyright Digital Engagement Xperience 2017
 * @description Role Management integration
 */


(function () {
    'use strict';

    var should = chai.should();

    /*
     * Tests related to role-management-rest
     */
    describe('listRolesForApp', function () {
        var server;

        before(function () {
            server = sinon.fakeServer.create();
        });

        after(function () {
            server.restore();
        });

        it('should successfully list using default appId', function (done) {
            server.respondWith('GET', '/application/ice4m/role', [
                200, {'Content-Type': 'application/json'}, JSON.stringify(['rolea', 'roleb'])]);

            dexit.app.ice.edu.integration.rm.listRolesForApp(null, function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.should.deep.equal(['rolea', 'roleb']);
                done();
            });
            server.respond();
        });

    });
})();
