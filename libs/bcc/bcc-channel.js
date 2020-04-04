/**
 * Created by shawn on 2017-04-27.
 */

var generalUtils = require('ps-ice').generalUtils;
var UserInformation = require('../libs/user-info');
var errors = require('dex-errors');
var logFormatter = require('dex-logger').logFormatter;
var KbSqlDao = require('dex-dao').kb.SqlDao;


/**
 * BCC Aware channel
 * @param config
 * @param def
 * @constructor
 */
function BccChannel(config, def) {
    if (!config) {
        throw new errors.Config('missing required configuration');
    }

    var mocks = arguments[2] || {};
    this.userInfo = mocks.userInfo || new UserInformation(config);
    this.dataStore = config.bcc.dataStore;
    var map = {
        id: 'id',             // stored as int - unique, auto-generated
        bci_id: 'bciId', // stored as
        tenant: 'tenant',            // stored as string
        bc: 'bc',            // stored as string
        bci_data: 'data',       //stored as string
        update_time: 'updateTime',    // store as int
        channel: 'channel'
    };
    this.dao = mocks.bccDao || new KbSqlDao(config, this.dataStore, 'bcc_bc', map);
}



BccChannel.prototype._resolveUserInfo = function (req,callback) {
    var tenantConfig = req.user._tenantConfig;

    var roleManagerConfiguration = {
        roleManager: tenantConfig.roleManager,
        rolesMapping: tenantConfig.rolesMapping,
        services: tenantConfig.services || {}
    };
    this.userInfo.getInfo(req, token, roleManagerConfiguration, cb);
};


/**
 * Save content in channel
 * @param {object} params
 * @param callback
 */
BccChannel.prototype.postContent = function (params,callback) {
    var self = this;

    //TODO: extract EP, layout(s), seperate SC structure
    self._persist(params.token,params.data, function (err, data) {
        if (err) {
            return callback(err);
        }
        callback({"id":data.result});
    });
};

/**
 *
 * @param {string} params
 * @param {object} params
 * @param callback
 * @private
 */
BccChannel.prototype._persist = function (token,params,callback) {
    var self = this;
    self.dao.insert(token,params,callback);
};


/**
 *
 * @type {BccChannel}
 */
module.exports = BccChannel;

