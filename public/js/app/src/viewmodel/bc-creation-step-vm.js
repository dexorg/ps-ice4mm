/**
 * Copyright Digital Engagement Xperience 2017-2019
 */


/**
 *
 * @param {object} args
 * @param {number} args.stepNumber - current ordered number of the step (starts at 1)
 * @param {boolean} [args.completed=false]
 * @param {boolean} [args.allowSkip=false]
 * @param {number} args.templateName
 * @param {Function} [args.validationCheck=function(){return true}] - if present then function will return true/false based. If not specified then a default function will be supplied that returns true.
 * @param {string} [args.validationErrorMessage] - only shows if validationCheck returns false on click
 * @param {Function} [args.onDone=function(){}] - runs when function is done (not skipped)
 * @param {Function} [args.onBefore=function(){}] - runs before step is started
 * @param {Function} [args.onCanel=function(){}] - runs when cancel is clicked
 * @param {string} args.title
 * @param {string} args.subTitle
 * @param {boolean} [args.showToggle=false]
 * @param {ko.observable} args.currentStepNumber - passed in from parent
 * @param {ko.observable} args.showListView - passed in from parent to control look for listing all
 * @param {Object.<string,ko.observable|ko.observableArray>} inputFields - injecy  key-value pairs for input fields that step may use
 * @param {object} args.parent - pass in bc-creation-vm.  ideally should remove
 * @constructor
 */
dexit.app.ice.BCCreationStepVM = function (args) {
    var self = this;


    self.sectionStart = (args.sectionStart ? ko.observable(args.sectionStart) : ko.observable(false));
    self.section = (args.section ?  ko.observable(args.section) : ko.observable());

    //reference to parent's (bc-creation-vm) current step number
    self.currentStepNumber = args.currentStepNumber;

    self.showListView = args.showListView;
    self.templateName = ko.observable(args.templateName);

    self.inputFields = args.inputFields || {};

    self.stepNumber = ko.observable(args.stepNumber);
    self.title = ko.observable(args.title);

    self.showToggle = (args.showToggle ? ko.observable(args.showToggle) : ko.observable(false));

    self.completed = (args.completed ? ko.observable(args.completed) : ko.observable(false));

    if (args.subTitle) {
        self.subTitle = ko.observable(self.stepNumber() + '.1 ' + args.subTitle);
    }else {
        self.subTitle = ko.observable('');
    }

    self.allowSkip = (args.allowSkip ? ko.observable(args.allowSkip) : ko.observable(false));

    self.hideEdit = ko.observable(false);
    if (args && args.hideEdit) {
        self.hideEdit(true);
    }


    // self.editEnabled = ko.pureComputed(function () {
    //     return (self.isEditable && self.currentStepNumber() !== 0 && )
    // });

    self.isEditing = ko.observable(false);


    self.isStarted = ko.pureComputed(function(){
        return (self.completed() && self.currentStepNumber() > self.stepNumber());
    });

    self.isActive = ko.pureComputed(function(){
        return (self.currentStepNumber() === self.stepNumber());
    });

    self.isCompleted = ko.pureComputed(function(){
        //return (self.currentStepNumber() > self.stepNumber());
        return (self.completed());
    });


    self.isEditable = ko.pureComputed(function(){
        return self.completed() && (self.currentStepNumber() !== self.stepNumber());
    });

    var defaultValidationFn = function () {
        return true;
    };
    self.validationCheck = (args && args.validationCheck && _.isFunction(args.validationCheck) ? args.validationCheck : defaultValidationFn);
    var msg = (args && args.validationErrorMessage ? args.validationErrorMessage : '');
    self.validationErrorMessage = ko.observable(msg);
    self.showValidationError = ko.observable(false);


    var noOp = function () {
    };
    self.onDone =(args && args.onDone && _.isFunction(args.onDone) ? args.onDone : noOp);

    self.onBefore =(args && args.onBefore && _.isFunction(args.onBefore) ? args.onBefore : noOp);

    self.onCancel = (args && args.onCancel && _.isFunction(args.onCancel) ? args.onCancel : noOp);

    //called when in update mode to populate
    self.onUpdateLoad =(args && args.onUpdateLoad && _.isFunction(args.onUpdateLoad) ? args.onUpdateLoad : noOp);

    /**
     * Determines which css class to have added based on:
     * -active
     * -in-active but not completed  (css class: 'disabled')
     * -in-active but completed (css class: 'complete')
     * -list view
     */
    self.stepStatusClass = ko.pureComputed(function () {
        var val = '';
        if (self.isActive()){
            return val;
        }
        if (self.completed()) {
            val += 'complete';
            //if all steps completed, summary view mode
            // if (self.showListView()) {
            //     val += ' list-view';
            // }
            return val;
        }
        if (!self.isStarted() ) {
            val += 'disabled';
        }

        return val;
    });


    self.cancel = function () {
        self.isEditing(false);
        self.completed(true);
        self.showValidationError(false);
        //self.currentStepNumber(0); //go back to first step on cancel
    };





};
