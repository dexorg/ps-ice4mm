/**
 * Copyright Digital Engagement Xperiance
 * Date: 09/02/15
 * @author Ali
 * @description
 */


dexit.app.ice.edu.integration.course = {};
dexit.app.ice.edu.integration.course.touchpoint = {};
dexit.app.ice.edu.integration.course.touchpoint.deleteTP = function (id, callback) {
    'use strict';
    var course_resource = '/touchpoint/'+id,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(course_resource);
    restStrategy.destroy(callback);
};
