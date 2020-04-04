/**
 * Copyright Digital Engagement Xperience 2017
 * @description VM for EP Card
 */


/**
 * @typedef {object} EPActivityAction
 * @property {Function} run - Takes one argument (reference to vm for this card)
 */

/**
 * EP Activity Definition holds configuration and functions for the activity
 * @typedef {object} EPActivity
 * @property {string} name - unique name for activity
 * @property {string} label - to display
 * @property {string} [permission] - permission required to run the functions
 * @property {object<string,EPActivityAction} actions - named list of actions.  Examples are 'done' and 'run'
 */

/**
 *
 * @param {object} args
 * @param {object} args.sc
 * @param {object} args.sc.id
 * @param {object} args.sc.touchpoints
 * @param {object} args.container
 * @param {object} args.name
 * @param {object} args.ePatterns
 * @param {object} args.isPatternActive
 * @param {object} args.widgetReport
 * @param {object} args.chosenTPs
 * @param {object} args.parentVM
 * @param {object} args.mainVM
 * @param {EPActivity[]} args.wf - Definition object for activity
 * @param {string} args.currentStage
 * @constructor
 */
dexit.app.ice.EPCardVM = function (args) {
    var mainVM = args.mainVM;

    var wVM = this;
    wVM.mainVM = mainVM;
    wVM.sc = ko.observable();
    if (args && args.sc) {
        wVM.sc(args.sc);
    }
    wVM.parentVM = args.parentVM;

    //set widgetReport from args
    wVM.widgetReport = ko.observableArray([]);
    if (args && args.widgetReport) {
        wVM.widgetReport(args.widgetReport);
    }


    wVM.filteredWidgetReport = ko.pureComputed(function () {
        var maxSize = 2;
        var toReturn = [];
        _.each(wVM.widgetReport(), function(val, index) {
            if (index <= (maxSize-1)){
                toReturn.push(val);
            }
        });
        return toReturn;
    });


    wVM.ePatterns = ko.observableArray();
    wVM.isPatternActive = ko.observable(false);


    wVM.chosenTPs = ko.observableArray([]);
    wVM.isTouchpointAdded = ko.observable();
    if (args && args.chosenTPs) {
        wVM.chosenTPs(args.chosenTPs);
    } else {
        console.log('chosenTP is empty');
    }

    /**
     * Computed for show comma separated list of touchpoint names
     */
    wVM.chosenTPsTitle = ko.pureComputed(function () {
        var tps = _.map(wVM.chosenTPs(), 'name');
        return tps.join(', ');
    });


    /**
     * If card is collapsed
     */
    wVM.collapsed = ko.observable();


    wVM._generateId = function () {
        var id = dpa_VM.generateRandomSlug();
        return id;
    };

    //generate random id,  Note: this identifier is not persistent TODO: remove dependency for uuid function
    wVM.id = wVM._generateId();


    var ACTIVITIES = [
        {
            name: 'epa',
            permission: 'epa',
            iconClass: 'fa fa-edit',
            actions: {
                default: {
                    run: function (wVM) {
                        dpa_VM.currentOperation('edit');
                        wVM.mainVM.viewOnlyModal(false);
                        wVM.mainVM.modalOperation('edit');
                        //TODO: redo how load EP and save/edit are done, too much state shared in bcAuthVM
                        wVM.mainVM.bcAuthVM.retrieveBCElements(wVM, wVM._findWidgetIndex());
                    }
                }
            }
        },
        {
            name: 'epa_approval',
            permission: 'approval',
            actions: {
                default: {
                    run: function (wVM) {
                        wVM.mainVM.viewOnlyModal(false);
                        wVM.mainVM.modalOperation('approval');
                        //TODO: redo how load EP and save/edit are done, too much state shared in bcAuthVM
                        wVM.mainVM.bcAuthVM.retrieveBCElements(wVM, wVM._findWidgetIndex());
                    }
                },
                done: {
                    run: function (wVM) {
                        var direction = (wVM.approval() && wVM.approval() === true ? 'forward' : 'backward');
                        wVM.navigateActivity(wVM.currentActivity(), direction);
                        wVM.mainVM.closeEngagementPlanCreate();
                        wVM.mainVM.bcAuthVM.clearFields();
                    }
                }
            },
            iconClass: 'fa fa-check-square-o'
        },
        {
            name: 'cd',
            permission: 'cd',
            iconClass: 'fa fa-picture-o',
            actions: {
                default: {
                    run: function (wVM) {
                        wVM.mainVM.showSmallSidebar();
                        wVM.mainVM.viewOnlyModal(false);
                        wVM.mainVM.modalOperation('edit');
                        wVM.mainVM.selectedWidget(wVM);
                        wVM.mainVM.viewStoryElements(wVM);
                    }
                }
            }

        },
        {
            name: 'cd_approval',
            permission: 'approval',
            actions: {
                default: {
                    run: function (wVM) {
                        wVM.mainVM.showSmallSidebar();
                        wVM.mainVM.viewOnlyModal(false);
                        wVM.mainVM.modalOperation('approval');
                        wVM.mainVM.selectedWidget(wVM);
                        wVM.mainVM.viewStoryElements(wVM);

                    }
                },
                done: {
                    run: function (wVM) {
                        var direction = (wVM.approval() && wVM.approval() === true ? 'forward' : 'backward');
                        wVM.navigateActivity(wVM.currentActivity(), direction);
                        // // var direction = (wVM.approval() && wVM.approval() === true ? 'forward': 'backward');
                        // var direction = null;
                        // wVM.navigateActivity(wVM.currentActivity(),direction);
                    }
                }
            },
            iconClass: 'fa fa-check-square-o'
        },
        {
            name: 'scheduling',
            permission: 'scheduling',
            actions: {
                default: {
                    run: function (wVM) {
                        wVM.expandWidget();
                    }
                }
            },
            iconClass: 'fa fa-share-alt'
        },
        {
            name: 'published',
            permission: 'any',
            actions: {
                default: {
                    run: function (wVM) {
                        wVM.expandWidget();
                    }
                },
                done: {
                    run: function () {
                        console.log('at end');
                    }
                }
            },
            iconClass: 'fa fa-share',
            paths: []
        }
    ];


    var activities = {};


    /**
     *
     * @param {object} wf  (SEE activities for an example and default)
     * @private
     */
    wVM._loadWf = function (wf) {
        if (!wf) {
            activities = ACTIVITIES;
        } else {
            activities = wf;
        }
    };
    wVM.scheduleSet = ko.observable(false);


    wVM.showScheduleButton = ko.pureComputed(function () {
        //scheduleSet
        if (wVM.currentActivity() && (wVM.currentActivity() === 'scheduling') && wVM.scheduleSet() === false) {
            return true;
        } else {
            return false;
        }

    });


    //load Wf
    wVM._loadWf(args.wf);

    //current activity
    wVM.currentActivity = ko.observable('epa');

    if (args && args.currentStage) {
        wVM.currentActivity(args.currentStage);
    }
    //
    // if (args && args.currentActivity) {
    //     wVM.currentActivity(args.currentActivity);
    // }
    //


    wVM.moveStage = function (name) {
        wVM.parentVM.moveCardToStage(name, wVM);
    };


    wVM.currentActivityName = ko.computed(function () {
        return '' + wVM.currentActivity();
    });
    //add icons for showing
    // var icons = [];
    // _.each(activities, function (val) {
    //     var obj = {
    //         name: val.name,
    //         iconClass: val.iconClass,
    //         run: val.run
    //     };
    //     icons.push(obj);
    // });
    // wVM.icons = ko.observableArray(icons);


    // wVM.currentIcon = ko.computed(function () {
    //     return ko.utils.arrayFirst(wVM.icons(), function (item) {
    //         return (item.name && item.name === wVM.currentActivity());
    //     });
    // });

    wVM.cmsConfiguration = ko.observable();


    wVM.setCmsConfiguration = function(value) {
        wVM.cmsConfiguration(value);
        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];
            ep.pattern._cmsConfiguration = value;
            wVM._updatePattern(ep);
        }
    };
    wVM.mmIcon = ko.observable();
    wVM.iconText = ko.observable();

    wVM.setIcon = function(value, text) {
        debugger;
        wVM.mmIcon(value);
        wVM.iconText(text);
        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];
            ep.pattern._mmIcon = value;
            ep.pattern._iconText = text;
            wVM._updatePattern(ep);

            var resource = '/campaign-icon/' + encodeURIComponent(ep.id);
            var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
            restStrategy.update({icon:value, text:text}, function (err) {
                if (err) {
                    //TODO
                    console.log('error saving');
                }
                //check if there is a primary then update this EP with the primary flag
            });


        }
    };


    wVM.showDynamicCampaign = ko.pureComputed(function () {
        var name = 'dynamicCampaign';
        var allowedWfStages = ['epa_approval','cd','cd_approval','scheduling', 'published'];
        var currentActivity = wVM.currentActivity();
        var inCurrentActivity = (allowedWfStages.indexOf(currentActivity) !== -1 ? true : false);
        var hasPermission = (wVM.parentVM.bsb && wVM.parentVM.bsb && wVM.parentVM.bsb[name] && wVM.parentVM.bsb[name]() == true);

        if (inCurrentActivity && hasPermission && wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];

            //also check there are dynamic campaign elements
            var allocated = _.filter(ep.pattern.element, function(element) {
                return (element && element.type === 'intelligence'  && element.subType && element.subType === 'dynamic-ept-params');
            });
            return (ep.pattern && ep.pattern.tp && ep.pattern.tp.length > 0 && ep.pattern.tp[0].layout && allocated.length > 0);
        }
    });







    wVM.showTPAllocator = ko.pureComputed(function () {
        //if e
        var name = 'allocator';
        var allowedWfStages = ['cd','cd_approval','scheduling', 'published'];
        var currentActivity = wVM.currentActivity();

        var inCurrentActivity = (allowedWfStages.indexOf(currentActivity) !== -1 ? true : false);

        var hasPermission = (wVM.parentVM.bsb && wVM.parentVM.bsb && wVM.parentVM.bsb[name] && wVM.parentVM.bsb[name]() == true);

        if (inCurrentActivity && hasPermission && wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];


            var allocated = _.filter(ep.pattern.element, function(element) {
                return (element && element.type === 'intelligence'  && element.subType && element.subType === 'dynamic-ept-params');
            });
            return (ep.pattern && ep.pattern.tp && ep.pattern.tp.length > 0 && ep.pattern.tp[0].layout && allocated.length > 0);

        }
    });

    wVM.showCMSConfiguration = ko.pureComputed(function () {
        if (wVM.currentActivity() && (wVM.currentActivity() === 'published' || wVM.currentActivity() === 'scheduling' || wVM.currentActivity() === 'cd_approval')) {
            return false;
        } else {
            return true;
        }
    });



    wVM.creativeBrief = ko.observable();

    wVM.setCreativeBrief = function(creativeBrief) {
        wVM.creativeBrief(creativeBrief);
        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];
            ep.pattern._creativeBrief = creativeBrief;

            wVM._updatePattern(ep);
        }
    };

    wVM.getPatternEndingConfiguration = function() {
        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];
            return ep.pattern.endConfiguration;
        }
    };

    wVM.setPatternEndingConfiguration = function(endingConfiguration) {
        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];
            ep.pattern.endConfiguration = endingConfiguration;
            wVM._updatePattern(ep);
        }
    };

    wVM._updatePattern = function(ep) {
        if (ep) {
            wVM.ePatterns([ep]);
            //update EP
            dexit.app.ice.integration.engagementpattern.update(ep.id, ep.revision, ep, function (res) {
                if (res) {
                    console.log('Ep is updated');
                    //now move card
                } else {
                    console.error('Cannot update');
                }
            });
        }
    };


    wVM._updateState = function (activityName) {

        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];
            ep.pattern._scheduleSet = wVM.scheduleSet();
            ep.pattern._currentActivity = activityName;
            wVM.moveStage(activityName);


            //update EP
            dexit.app.ice.integration.engagementpattern.update(ep.id, ep.revision, ep, function (res) {
                if (res) {
                    console.log('Ep is updated');
                    //now move card
                } else {
                    console.error('Cannot update');
                }
            });
        }
    };

    wVM.updateSchedule = function(startDateTime, endDateTime) {

        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            var ep = wVM.ePatterns()[0];
            if (startDateTime) {
                ep.pattern.startDate = startDateTime;
                wVM.scheduleVM.startdatetime(moment(startDateTime,moment.ISO_8601));
                wVM.scheduleVM.changeSDT();
                ep.pattern.start = startDateTime;
                ep.pattern._scheduleSet = true;
                wVM.scheduleSet(true);
            }else {
                ep.pattern.start = 'now';
            }

            if (endDateTime) {
                ep.pattern.endDate = endDateTime;
                wVM.scheduleVM.enddatetime(moment(endDateTime,moment.ISO_8601));
                wVM.scheduleVM.changeEDT();
                ep.pattern.end = endDateTime;
                ep.pattern._scheduleSet = true;
                wVM.scheduleSet(true);

            }else {
                ep.pattern.end = 'never';
            }



            wVM._updatePattern(ep);
        }








    };


    wVM.displayFullPreviewPopover = function() {


        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {


            var tps = wVM.chosenTPs();
            var tpAndLayouts = wVM.ePatterns()[0].pattern.tp;
            var epId = wVM.ePatterns()[0].id;
            var epRevision = wVM.ePatterns()[0].revision;


            //FIXME: only showing first TP
            var tpAndLayout = (tpAndLayouts && tpAndLayouts.length > 0 ? tpAndLayouts[0] : null);

            if (!tpAndLayout) {
                return;
            }

            var tp = _.find(tps, {id: tpAndLayout.touchpoint});


            var bccPreview = (tp.type && (tp.type.toLowerCase() === 'ucc' || (tp.type.toLowerCase() === 'bcc')));
            if (bccPreview) {

                var url = wVM.mainVM.previewUrl + '?ep=' + epId + '-' + epRevision + '&lid=' + tpAndLayout.layout.id + '&tp=' + tp.id;
                window.open(url, '_blank');
            } else { //social
                var preview = 'social-preview/' + '?ep=' + epId + '-' + epRevision + '&tp=' + tp.id;
                window.open(preview, '_blank');
            }


        }
    };


    /**
     * Moves state of current activity to the next
     * @param {string} current - current activity name
     * @param {string} [direction=forward] - forward or back
     */
    wVM.navigateActivity = function (current, direction) {

        function calculateIndex(val, dir) {
            if (dir && dir === 'backward') {
                return (val - 1);
            } else {
                return (val + 1);
            }
        }

        //find activity def
        var currentActivityIndex = _.findIndex(activities, function (activity) {
            return (activity && activity.name === current);
        });

        //check if valid
        if (currentActivityIndex === -1) {
            console.warn('current activity not found');
            return;
        }

        //set next activities
        var next = calculateIndex(currentActivityIndex, direction);

        if ((next !== -1) && (activities.length - 1) >= (next)) {
            var nextActivity = (activities[next]);
            wVM.currentActivity(nextActivity.name);
        }
        //change
        wVM._updateState(wVM.currentActivity());
    };


    /**
     * Only here to support passing in widget index, better to remove
     * @private
     */
    wVM._findWidgetIndex = function () {
        var widgets = mainVM.selectedCourse().courseVM.widgets();
        var ind = widgets.indexOf(wVM);
        return ind;
    };

    wVM.performActionVisible = ko.pureComputed(function () {
        var name = wVM.currentActivity() || '';
        var isNotPublished = (name && name !== 'published' ? true : false);
        var hasPermission = (wVM.parentVM.bsb && wVM.parentVM.bsb.wf && wVM.parentVM.bsb.wf[name] && wVM.parentVM.bsb.wf[name]() == true);
        return (isNotPublished && hasPermission);
    });

    wVM.performActionLabel = ko.pureComputed(function () {
        var current = wVM.currentActivity();

        var activity = _.find(activities, function (activity) {
            return (activity && activity.name === current);
        });
        var action = 'default';

        var actionSelected = (activity.actions && activity.actions[action] ? activity.actions[action] : null);
        if (!actionSelected) {
            return '';
        }
        return (actionSelected.label || 'view')



    });



    wVM.performAllocatorVisible = ko.pureComputed(function() {

        var name = 'allocator';
        //var isNotEPA = (name && name !== 'epa' ? true : false);
        var hasPermission = (wVM.parentVM.bsb && wVM.parentVM.bsb.wf && wVM.parentVM.bsb.wf[name] && wVM.parentVM.bsb.wf[name]() == true);
        return hasPermission;
    });

    /**
     * Completes the current activity and proceeds to next.
     * In future, will integrate with external process engine
     * @param {string} path - action
     * @param {object} [ref=wVM] - optional reference
     */
    wVM.perform = function (path, ref) {

        var action = (path ? path.toLowerCase() : '');
        var toPass = ref || wVM;
        if (!action) {
            console.warn('no action');
            return;
        }
        var current = wVM.currentActivity();

        var activity = _.find(activities, function (activity) {
            return (activity && activity.name === current);
        });

        if (!activity) {
            console.error('No such activity found. Likely a misconfiguration');
            return;
        }

        var actionSelected = (activity.actions && activity.actions[action] ? activity.actions[action] : null);

        if (actionSelected && actionSelected.run) {
            actionSelected.run(toPass);
        } else {
            if (action === 'done') {
                wVM.navigateActivity(current);
            }
        }


    };


    wVM.showPerformance = ko.pureComputed(function () {
        return wVM.currentActivity() === 'published';
    });


    wVM.scheduleVM = new dexit.app.ice.edu.ScheduleVM();
    wVM.scheduleVM.init();

    wVM.resetSchedule = function () {
        wVM.scheduleVM.init();
    };

    wVM.showSchedule = ko.pureComputed(function () {
        if (wVM.currentActivity() && (wVM.currentActivity() === 'published' || wVM.currentActivity() === 'scheduling')) {
            return true;
        } else {
            if (wVM.scheduleSet()){
                return true;
            }else {
                return false;
            }
        }
    });



    /**
     *  Returns true or false depending if card is in 'published' state and the end time is greater than the current time
     */
    wVM.expired = ko.pureComputed(function () {
        if (wVM.currentActivity() && wVM.currentActivity() === 'published' && wVM.scheduleVM && wVM.scheduleVM.scheduleEDT()) {

            var dateTime = wVM.scheduleVM.scheduleEDT();
            var now = moment();
            if (_.isString(dateTime)) {
                dateTime = moment(wVM.scheduleVM.scheduleEDT(), moment.ISO_8601);
            }
            var expiredValue = dateTime.isBefore(now);
            return expiredValue;

        } else { //for 'never' it will never expire
            return false;
        }
    });


    wVM.displayedStartDate = ko.pureComputed(function () {
        if (wVM.scheduleVM && wVM.scheduleVM.scheduleSDT()) {
            if (!_.isString(wVM.scheduleVM.scheduleSDT())) {
                return wVM.scheduleVM.scheduleSDT().format('MMM Do YYYY, h:mm a ZZ');
            } else {
                return moment(wVM.scheduleVM.scheduleSDT(), moment.ISO_8601).format('MMM Do YYYY, h:mm a ZZ');
            }
        } else {
            return 'now';
        }
    });

    wVM.displayedEndDate = ko.pureComputed(function () {
        if (wVM.scheduleVM && wVM.scheduleVM.scheduleEDT()) {
            if (wVM.scheduleVM && wVM.scheduleVM.scheduleEDT() && !_.isString(wVM.scheduleVM.scheduleEDT())) {
                return wVM.scheduleVM.scheduleEDT().format('MMM Do YYYY, h:mm a');
            } else {
                return moment(wVM.scheduleVM.scheduleEDT(), moment.ISO_8601).format('MMM Do YYYY, h:mm a');
            }
        } else {
            return 'never';
        }
    });


    //TODO: should only be on pattern so no need for an array, assume first here
    if (args && args.ePatterns && args.ePatterns.length > 0) {
        if (args.sc.property.touchpoints && args.sc.property.touchpoints.length > 0) {
            wVM.isTouchpointAdded(true);
        }else {

            wVM.isTouchpointAdded(false);
        }
        wVM.ePatterns(args.ePatterns);
        wVM.isPatternActive(wVM.ePatterns()[0].isActive);
        //Retrieve start/end dates from enagement pattern to show in the UI for the existing widgets.

        if (wVM.ePatterns()[0].pattern && wVM.ePatterns()[0].pattern.start && wVM.ePatterns()[0].pattern.start !== 'now') {
            wVM.scheduleVM.scheduleSDT(moment(wVM.ePatterns()[0].pattern.start, moment.ISO_8601));
        }
        if (wVM.ePatterns()[0].pattern && wVM.ePatterns()[0].pattern.end && wVM.ePatterns()[0].pattern.end !== 'never') {
            wVM.scheduleVM.scheduleEDT(moment(wVM.ePatterns()[0].pattern.end, moment.ISO_8601));
        }

        if (wVM.ePatterns()[0].pattern && wVM.ePatterns()[0].pattern._currentActivity && _.isString(wVM.ePatterns()[0].pattern._currentActivity)) {
            wVM.currentActivity(wVM.ePatterns()[0].pattern._currentActivity);
        }

        if (wVM.ePatterns()[0].pattern && wVM.ePatterns()[0].pattern._creativeBrief && _.isString(wVM.ePatterns()[0].pattern._creativeBrief)) {
            wVM.creativeBrief(wVM.ePatterns()[0].pattern._creativeBrief);
        }

        if (wVM.ePatterns()[0].pattern && wVM.ePatterns()[0].pattern._cmsConfiguration && _.isString(wVM.ePatterns()[0].pattern._cmsConfiguration)) {
            wVM.cmsConfiguration(wVM.ePatterns()[0].pattern._cmsConfiguration);
        }


        var scheduleSet = (wVM.ePatterns()[0].pattern && wVM.ePatterns()[0].pattern._scheduleSet ? true : false);

        //fix for previously published EPs to show date
        if (wVM.currentActivity() && wVM.currentActivity() === 'published') {
            scheduleSet = true;
        }
        wVM.scheduleSet(scheduleSet);


    }

    // wVM.viewState = ko.observable('fa fa-compress');

    if (args && args.sc && args.sc.property && args.sc.property.name) {
        wVM.name = ko.observable(args.sc.property.name);
    } else {
        wVM.name  = ko.observable('');
    }

    wVM.showApproval = ko.observable(false);
    wVM.approval = ko.observable(true);


    wVM.isRevision = ko.pureComputed(function () {

        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {

            var ep = wVM.ePatterns()[0];
            return (ep.extended && ep.extended.parentRevision);

            //return (ep.revision && ep.revision !== 1);

        }else {
            return false;
        }
        //return wVM.ep.revision
    });


    wVM.extendedInfo = ko.pureComputed(function () {

        var currentRevision = wVM.ePatterns()[0].revision;
        var txt = 'campaign revision:'+currentRevision + ' ';

        if (wVM.isRevision() && wVM.ePatterns()[0].extended) {
            var parentName = wVM.ePatterns()[0].extended.parentName || '';
            var parentRevision = wVM.ePatterns()[0].extended.parentRevision|| '';
            return txt + 'cloned from:'+ parentName + ' with revision:'+parentRevision;

        }else {
            return '';
        }

    });


    var cardColour = (wVM.ePatterns() && wVM.ePatterns().length > 0 && wVM.ePatterns()[0].pattern && wVM.ePatterns()[0].pattern._card_colour ?  '#' + wVM.ePatterns()[0].pattern._card_colour : '#FFFFFF');

    wVM.cardColour = ko.observable(cardColour);


    /**
     * Updates the existing card colour
     * @param colour
     */
    wVM.updateBCCardColour = function (colour) {




        if (wVM.ePatterns() && wVM.ePatterns().length > 0) {
            wVM.cardColour(colour);
            var val = wVM.cardColour().replace('#', '');


            var ep = wVM.ePatterns()[0];
            ep.pattern._card_colour = val;

            wVM._updatePattern(ep);
        }

        //
        // var instance = wVM.sc();
        // var type = instance.property.type || instance.property.class;
        //
        //
        //
        //
        //
        // var changes = [
        //     {op: 'replace', path: '/property/presentation_card_colour', value: val}
        // ];
        // var params = {
        //     type: type,
        //     id: instance.id,
        //     // version: instance.property.version,
        //     // changes: changes
        // };
        //
        //
        // //Cache is the SC for this campaign is out of sync with the pattern.
        // //Workaround: retrieve the full sc and update it, making sure to update all "properties"
        // dexit.app.ice.integration.bcp.retrieveBCInstance(params, function (err, data) {
        //     if (err) {
        //         return;
        //     }
        //     var version = data.property.version;
        //
        //     var updateParams = {
        //         type: type,
        //         id: instance.id,
        //         version: version,
        //         changes: changes
        //     };
        //
        //     dexit.app.ice.integration.bcp.updateBCInstance(updateParams, function (err, resp) {
        //         if (err){
        //             alert('could not update...please refresh and try again');
        //             return;
        //         }
        //         var sc = wVM.sc();
        //         sc.property.presentation_card_colour = val;
        //         sc.property.version = resp.version;
        //         wVM.sc(sc);
        //     });
        //
        //
        // });



        // wVM.parentVM._updateBCInstance(params, function (err) {
        //     if (err) {
        //     }
        // });

    };

    // wVM.approvalDisplay = ko.computed(function () {
    //     return wVM.showApproval() !== true ? 'hide-widget-content' : 'show-widget-content';
    // });

    // wVM.currentStyle = ko.computed(function() {
    //     return wVM.viewState() === 'fa fa-share-alt' ? 'fa fa-compress' : 'fa fa-share-alt';
    // });


    // wVM.expandWidget = function() {
    //     wVM.viewState((wVM.viewState() === 'fa fa-share-alt') ? 'fa fa-compress' : 'fa fa-share-alt');
    //
    //     if (wVM.viewState() === 'fa fa-compress') { $('.popover').popover('hide'); }
    // };

    // wVM.scheduleDisplay = ko.computed(function() {
    //     return wVM.viewState() === 'fa fa-compress' ? 'hide-widget-content' : 'show-widget-content';
    // });
};
