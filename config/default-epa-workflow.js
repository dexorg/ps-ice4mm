/**
 * Copyright Digital Engagement Xperience 2018
 */


var EPA_WF_STAGES = [
    'epa',
    'epa_approval',
    'cd',
    'cd_approval',
    'scheduling',
    'published'
];


var EPA_WF = [
    {
        name: 'epa',
        label:'Creation',
        displayOrder: 1,
        permission: 'epa',
        iconClass: 'fa fa-edit',
        actions: {
            default: {
                label:'EP',
                run: function (wVM) {
                    //show the EPA screen
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
        label:'Approval',
        displayOrder: 2,
        permission: 'approval',
        actions: {
            default: {
                label:'Approve',
                run: function (wVM) {
                    //show the EPA screen with approval
                    wVM.mainVM.viewOnlyModal(false);
                    wVM.mainVM.modalOperation('approval');
                    //TODO: redo how load EP and save/edit are done, too much state shared in bcAuthVM
                    wVM.mainVM.bcAuthVM.retrieveBCElements(wVM, wVM._findWidgetIndex());
                }
            },
            done: {
                run: function(wVM) {
                    var direction = (wVM.approval() && wVM.approval() === true ? 'forward': 'backward');
                    wVM.navigateActivity(wVM.currentActivity(),direction);
                    wVM.mainVM.closeEngagementPlanCreate();
                    wVM.mainVM.bcAuthVM.clearFields();
                }
            }
        },
        iconClass: 'fa fa-check-square-o'
    },
    {
        name: 'cd',
        label:'Design',
        displayOrder: 3,
        permission: 'cd',
        iconClass: 'fa fa-picture-o',
        actions: {
            default: {
                label:'Design',
                run: function (wVM) {
                    //show the CD screen
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
        label:'Approval',
        displayOrder: 4,
        permission: 'approval',
        iconClass: 'fa fa-check-square-o',
        actions: {
            default: {
                label:'Approve',
                run: function (wVM) {
                    //show the CD approval screen
                    wVM.mainVM.showSmallSidebar();
                    wVM.mainVM.viewOnlyModal(false);
                    wVM.mainVM.modalOperation('approval');
                    wVM.mainVM.selectedWidget(wVM);
                    wVM.mainVM.viewStoryElements(wVM);

                }
            },
            done: {
                run: function(wVM) {
                    var direction = (wVM.approval() && wVM.approval() === true ? 'forward': 'backward');
                    wVM.navigateActivity(wVM.currentActivity(),direction);

                    // // var direction = (wVM.approval() && wVM.approval() === true ? 'forward': 'backward');
                    // var direction = null;
                    // wVM.navigateActivity(wVM.currentActivity(),direction);
                }
            }
        }
    },
    {
        name: 'scheduling',
        //label:'Scheduling',
        label:'Publish',
        displayOrder: 5,
        permission: 'scheduling',
        iconClass: 'fa fa-share-alt',
        actions: {
            default: {
                label:'Publish',
                run: function(wVM) {

                    if (wVM.scheduleSet()) {
                        wVM.mainVM.selectedWidget(wVM);
                        wVM.mainVM.viewPublishConfiguration(wVM);

                        //show the confirmation screen


                        // wVM.mainVM.shareEP(wVM.chosenTPs(), wVM, function () {
                        //     //TODO: handle error
                        // });
                    }else {
                        //wVM.saveSchedule();
                    }
                }
            }
        }

    },
    {
        name: 'published',
        label:'Published',
        displayOrder: 6,
        permission: 'any',
        iconClass: 'fa fa-share',
        presentIntelligence:false,
        actions: {
            default: {
                run: function (wVM) {
                    console.log('todo:show preview');
                    //wVM.expandWidget();
                }
            },
            done: {
                run: function (wVM) {
                    //wVM._updateState(wVM.currentActivity());
                    console.log('at end');
                }
            }
        },
        paths: []
    }
];
