/**
 * @copyright Digital Engagement Xperience 2019
 *
 */
/* global dexit, _ */

/**
 *
 * @param {object} [args]
 * @constructor
 */
dexit.app.ice.BRManagementVM = function (args) {
    var self = this;
    var noOp = function () {};


    var params = args || {};

    self.brLink = ko.observable(params.brLink);


    self.listAvailBusinessRules = function (params, callback) {

    };

    self.listAssignedBusinessRules = function (params, callback) {

    };



};
