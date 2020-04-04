/**
 * Copyright Digital Engagement Xperience
 * Date: 29/07/15
 * @author Ali Hussain
 * @description
 */

dexit.app.ice.edu.FileManagerVM.Widget = function (args) {

    var fmWidgetVM = this;
    fmWidgetVM.viewState = ko.observable('fa fa-expand');
    fmWidgetVM.currentStyle = ko.computed(function() {
        return fmWidgetVM.viewState() === "fa fa-expand" ? "fa fa-compress" : "fa fa-expand";
    });
    fmWidgetVM.aGroup =  args.aGroup;
};
