/**
 * Copyright Digital Enagement Xperience 2015
 * Created by  Ali on 2015-10-29.
 * @description this module contains user information, such as roles, wfs, tasks, etc.
 */

var logFormatter = require('dex-logger').logFormatter,
    errors = require('dex-errors'),
    async = require('async'),
    _ = require('underscore');
var RolesWFManager = require('ps-ice').rolesWFManager;

/**
 * User Information helper
 * @param {object} config - configuration object
 * @param {RolesWFManager} [rolesWfManager] - role and workflow manager (useful to specify for testing)
 * @constructor
 */
function UserInfo(config, rolesWFManager, roleManagers) {
    var logger = logFormatter('userInfo','initialization of userInfo');
    if (!config) {
        logger.error('cannot initalize, configuration is undefined');
        throw new errors.Config('UserInfo configuration is undefined');
    }
    let rolesManagers = roleManagers || {};
    this.rolesWFManager =  rolesWFManager || new RolesWFManager(config, rolesManagers);
}
/**
 * @callback UserInfo~GetInfoCallback
 * @param {Error} err - error
 * @param {object} resp - User Info response
 * @param {string[]} resp.roles - array of available roles for user
 * @param {string} resp.currentRole -  current role for user
 * @param {string[]} resp.userTasks - array of available tasks for user
 */

/**
 * get user roles from roleManager in ps-ice
 * @param {object} req - req object from session.
 * @param {string} token - access token.
 * @param {object} rmConfig - rolemanagement tenant configuration.
 * @param {UserInfo~GetInfoCallback} callback - object containing user roles, current role, and tasks
 */
UserInfo.prototype.getInfo = function (req, token, tenant, rmConfig, callback) {
    var logger = logFormatter('UserInfo', 'get');
    if (!req) {
        logger.error('req is undefined');
        return callback(new errors.Validation('req is undefined'));
    }
    var self = this;
    var userTasks = [];
    var roles = [];
    self.rolesWFManager.retrieveRoles(req.user, token, rmConfig, function(err, user){
        if (err) {
            logger.warn('problem retrieving roles, assuming empty:'+err.message,{error:err});
        }
        roles = (user && user.roles ? user.roles : []);

        var currentRole = self.rolesWFManager.retrieveCurrentRole(req, roles);

        callback(null, {roles: roles, currentRole: currentRole, tasks: userTasks});
    });

};

/**
 *
 * @type {UserInfo}
 */
module.exports = UserInfo;
