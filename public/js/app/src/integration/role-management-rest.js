/**
 * @copyright Digital Engagement Xperience 2017
 * @description Role Management integration
 */

dexit.app.ice.edu.integration.rm = {};
/**
 * @callback ListRolesCallback
 * @param {object} [err] - if error
 * @param {string[]} data, list of roles
 */
/**
 *
 * @param {object} params
 * @param {object} [params.appId=ice4m]
 * @param {ListRolesCallback} callback
 */
dexit.app.ice.edu.integration.rm.listRolesForApp = function (params, callback) {
    'use strict';

    var appId = (params && params.appId ? params.appId : 'ice4m');

    var resource = '/application/'+appId+'/role',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

