/**
 * Copyright Digital Engagement Xperiance
 * Date: 09/09/14
 * @author Ali Hussain
 * @description
 */

dexit.app.ice.edu.integration.fbgroup = {};
dexit.app.ice.edu.integration.fbgroup.createGroup = function (data, callback) {
    'use strict';
    var fb_group_resource = '/facebook/group/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fb_group_resource);
    restStrategy.create(data, callback);
};
//Are we supposed to be using this because POST /course searches for courses
dexit.app.ice.edu.integration.fbgroup.addCourseChannels = function (courseId, channelUrl, callback) {
    'use strict';
    var course_resource = '/course',
        data = { course: courseId, channelUrl: channelUrl},
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(course_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.edu.integration.fbgroup.retrieveMembers = function (id, callback) {
    'use strict';
    var fb_group_resource = '/facebook/group/'+id+'/members',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fb_group_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.edu.integration.fbgroup.retrieveAllMembers = function (id, callback) {
    'use strict';
    var fb_group_resource = '/facebook/group/'+id+'/allmembers',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fb_group_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.edu.integration.fbgroup.storeUserGroup = function (data, callback) {
    'use strict';
    var fb_group_resource = '/facebook/usergroup/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fb_group_resource);
    restStrategy.create(data, callback);
};
