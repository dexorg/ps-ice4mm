/**
 * Copyright Digital Engagement Xperiance
 * Date: 01/04/16
 * @author Ali Hussain
 * @description
 */

dexit.app.ice.edu.integration.lectureManager = {};
dexit.app.ice.edu.integration.lectureManager.addIntelligence = function (lectureId, data, callback) {
    'use strict';
    var lecture_manager_resource = '/lecture/'+lectureId+'/intelligence',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(lecture_manager_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.edu.integration.lectureManager.deleteIntelligence = function (lectureId, intelligenceId, type, callback) {
    'use strict';
    var lecture_manager_resource = '/lecture/'+lectureId+'/intelligence/'+intelligenceId+'?type='+type,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(lecture_manager_resource);
    restStrategy.destroy(callback);
};
dexit.app.ice.edu.integration.lectureManager.accessLectureLink = function (lectureId, data, callback) {
    'use strict';
    var lecture_manager_resource = '/lecture/'+lectureId+'/touchpoint/'+data.type+'/link',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(lecture_manager_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.edu.integration.lectureManager.retrieveLectureDetails = function (lectureId, callback) {
    'use strict';
    var lecture_manager_resource = '/lecture/'+lectureId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(lecture_manager_resource);
    restStrategy.retrieve(callback);
};

