/**
 * @copyright Digital Engagement Experience Inc 2019
 **/

const KBClient = require('dex-http-client').kb;
const errors = require('dex-errors');
const SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
const _ = require('underscore');

class ICE4MRoleManager {
    constructor(options) {
        if (!options || !options.rae || !options.rae.datastore) {
            return new errors.Config('missing options.rae.datastore');
        }
        this.systemTokenUtil = new SystemTokenUtil(options);
        this.kb = new KBClient(options);
        this.ds = options.rae.datastore;
        this.appId = 'ice4m';

    }

    /**
     *
     * @param token
     * @param {object} user
     * @param callback
     */
    listRoles(token, user, callback) {

        this.systemTokenUtil.getSystemAuthToken((err, sysToken) => {
            if (err) {
                return callback(err);
            }
            let query = 'Select role from user_role where app_id=? AND user=? AND tenant=?';
            let qParams = [this.appId,user.user,user.tenant];
            this.kb.executeQueryAuth(sysToken,query, qParams, this.ds,null,null, (dErr, data) => {
                if (dErr) {
                    return callback(err);
                }
                var result = this.kb.parseResult(data.result);
                var roles = _.map(result, 'role');
                callback(null, roles);
            });
        });

    }


}

module.exports = ICE4MRoleManager;


