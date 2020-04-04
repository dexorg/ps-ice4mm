/**
 * Copyright Digital Engagement Xperiance
 * Date: 03/08/16
 * @author Xinyu
 * @description
 */

dexit.app.ice.edu.integration.courseManagement = {};
dexit.app.ice.edu.integration.courseManagement.updateProperty = function (courseId, updateProperty, callback) {
    'use strict';
    var course_resource = '/course/'+courseId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(course_resource);
    restStrategy.partialUpdate(updateProperty, callback);
};
dexit.app.ice.edu.integration.courseManagement.listSharedLectures = function (courseId, callback) {
    'use strict';
    var course_resource = '/course/'+courseId+'/lectures?shared=true',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(course_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.edu.integration.courseManagement.listLectures = function (courseId, callback) {
    'use strict';
    var course_resource = '/course/'+courseId+'/lectures',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(course_resource);
    restStrategy.retrieve(callback);
};
