/**
 * Copyright Digital Engagement Xperiance
 * Date: 16/10/14
 * @author Ali Hussain
 * @description
 */
/* global moment */

dexit.app.ice.edu.ScheduleVM = function (args) {

    var scheduleVM = this;
    //Start date-time
    scheduleVM.startdatetime = ko.observable();
    //End date-time
    scheduleVM.enddatetime = ko.observable();

    scheduleVM.minDate = moment().add(-1, 'days');

    scheduleVM.scheduleSDT = ko.observable();
    scheduleVM.scheduleEDT = ko.observable();

    scheduleVM.now = ko.observable(moment().format());

    scheduleVM.init = function () {
        scheduleVM.startdatetime(moment());
        scheduleVM.enddatetime(moment());
        scheduleVM.scheduleSDT(scheduleVM.now());
        scheduleVM.scheduleEDT('');
    };

    scheduleVM.changeSDT = function(){
        if(scheduleVM.startdatetime()) {
            scheduleVM.scheduleSDT(scheduleVM.startdatetime());
        }
    };
    scheduleVM.changeEDT = function(){
        if(scheduleVM.enddatetime()) {
            scheduleVM.scheduleEDT(scheduleVM.enddatetime());
        }
    };
};
