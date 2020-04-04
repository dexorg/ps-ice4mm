/**
 * Copyright Digital Engagement Xperience 2018
 */

//TODO: load from tenant config
var DEFAULT_EPA_WORKFLOW = `[
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
                run: function(wVM) {
                    var direction = (wVM.approval() && wVM.approval() === true ? 'forward': 'backward');
                    wVM.navigateActivity(wVM.currentActivity(),direction);
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
                run: function(wVM) {
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
]`;

// var DEFAULT_BC_DEF_WORKFLOW =
// if (bcName && bcName === 'MerchandisingCampaign') {
//     return [
//         {
//             title:'Name of the Campaign',
//             subTitle:'',
//             completed: false,
//             templateName:'createBCiNameTempl',
//             showToggle: false,
//             inputFields: {
//                 bcName: ko.observable()
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.bcName(stepVM.inputFields.bcName());
//             },
//             validationCheck: function(bccVM, stepVM) {
//                 if (stepVM.inputFields.bcName() && stepVM.inputFields.bcName().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
//                     return true;
//                 }
//             },
//             validationErrorMessage: 'You must specify a unique campaign name that is at least 2 characters long',
//             onUpdateLoad: function (bccVM, stepVM) {
//                 stepVM.inputFields.bcName(bccVM.bcName());
//             },
//             onCancel: function(bccVM, stepVM) {
//                 //reset name
//                 stepVM.inputFields.bcName(bccVM.bcName());
//             }
//         },
//         {
//             title: 'Describe the Campaign',
//             subTitle: '',
//             completed: false,
//             templateName: 'createBCiDescriptionTempl',
//             showToggle: false,
//             inputFields: {
//                 bcDescription: ko.observable()
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.bcDescription(stepVM.inputFields.bcDescription());
//             },
//
//             onUpdateLoad: function (bccVM, stepVM) {
//                 stepVM.inputFields.bcDescription(bccVM.bcDescription());
//             },
//             onCancel: function(bccVM, stepVM) {
//                 //reset name
//                 stepVM.inputFields.bcDescription(bccVM.bcDescription());
//             }
//         },
//         {
//             title:'Offer',
//             subTitle:'Select an offer',
//             completed: false,
//             templateName:'createBCiOfferTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedAssociatedBC: ko.observable()
//             },
//             onDone: function (bccVM, stepVM) {
//
//                 var selection = stepVM.inputFields.selectedAssociatedBC();
//                 bccVM.selectedAssociatedBC(selection);
//                 bccVM.behavioursFromAssociatedBC(selection.associatedBehaviours);
//                 bccVM.brsFromAssociatedBC(selection.associatedBRs);
//             },
//             validationCheck: function(bccVM, stepVM) {
//                 if (stepVM.inputFields.selectedAssociatedBC()) {
//                     return true;
//                 }
//             },
//             validationErrorMessage: 'You must select one offer',
//             onUpdateLoad: function (bccVM, stepVM) {
//                 var selection = bccVM.selectedAssociatedBC();
//                 var beh = (selection && selection.associatedBehaviours ? selection.associatedBehaviours : []);
//                 var br = (selection && selection.associatedBRs ? selection.associatedBRs : []);
//                 stepVM.inputFields.selectedAssociatedBC(selection);
//                 bccVM.behavioursFromAssociatedBC(beh);
//                 bccVM.brsFromAssociatedBC(br);
//             },
//             onCancel: function(bccVM, stepVM) {
//                 var selection = bccVM.selectedAssociatedBC();
//                 var beh = (selection && selection.associatedBehaviours ? selection.associatedBehaviours : []);
//                 var br = (selection && selection.associatedBRs ? selection.associatedBRs : []);
//                 stepVM.inputFields.selectedAssociatedBC(selection);
//                 bccVM.behavioursFromAssociatedBC(beh);
//                 bccVM.brsFromAssociatedBC(br);
//
//             }
//         },
//         {
//             title:'eServices',
//             subTitle:'Select one or more eServices',
//             completed: false,
//             templateName:'createBCiBehavioursTempl',
//             showToggle: false,
//             allowSkip:false,
//             inputFields: {
//                 selectedBehaviours: ko.observableArray(),
//                 availableBehaviours: ko.observableArray()
//             },
//             onDone: function (bccVM, stepVM) {
//                 //behaviourIds
//                 var behaviours = stepVM.inputFields.selectedBehaviours();
//                 if (behaviours.length < 1) {
//                     return;
//                 }
//                 var behaviourObjs = _.filter(bccVM.allBehaviours(), function(beh) {
//                     return (behaviours.indexOf(beh.name) !== -1);
//                 });
//                 bccVM.selectedBehaviours(behaviourObjs);
//             },
//             onBefore: function (bccVM, stepVM) {
//                 //available behaviours to select are filtered based on offer
//                 var toFilter = ko.utils.unwrapObservable(bccVM.behavioursFromAssociatedBC);
//                 var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
//                 var filtered = _.differenceWith(allB, toFilter, function (val, val2) {
//                     return (val && val2 && val.ds.id === val2.ds.id);
//                 });
//                 stepVM.inputFields.availableBehaviours(filtered);
//
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 var selection = bccVM.selectedBehaviours();
//
//                 var ids = _.map(selection,function (beh) {
//                     return beh.name;
//                 });
//
//                 stepVM.inputFields.selectedBehaviours(ids);
//             }
//         },
//         {
//             title:'Touchpoints',
//             subTitle:'Select a touchpoint',
//             completed: false,
//             templateName:'createBCiTouchpointsTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedTouchpoints: ko.observableArray(),
//                 showAddTouchpoint: ko.observable(false),
//                 selectedChannelType: ko.observable(),
//                 selectedChannelTypeId: ko.observable(),
//                 pendingChannelUrl: ko.observable(),
//                 pendingTouchpointName: ko.observable(),
//                 saveSelectedExistingTP: function (self, tpInfo) {
//                     var found = _.find(self.inputFields.selectedTouchpoints(), function(val) {
//                         return (val.tpInfo && val.tpInfo.tpId === tpInfo.tpId);
//                     });
//                     if (!found) {
//                         self.inputFields.selectedTouchpoints.push({tpInfo: tpInfo, channelType: tpInfo.tpType});
//                     }
//                 },
//                 saveSelectedTP: function(self) {
//                     self.inputFields.selectedTouchpoints.push({channelType: self.inputFields.selectedChannelType(), channelTypeId: self.inputFields.selectedChannelTypeId(), channelUrl: self.inputFields.pendingChannelUrl(), name: self.inputFields.pendingTouchpointName()});
//                 },
//                 removeSelectedTP: function(self, info) {
//                     self.inputFields.selectedTouchpoints.remove(function(tp) {
//                         if (info.tpInfo) {
//                             return (tp.tpInfo.tpId === info.tpInfo.tpId);
//                         }else {
//                             var url1 = ko.utils.unwrapObservable(tp.channelUrl);
//                             var url2 = ko.utils.unwrapObservable(info.channelUrl);
//                             return (url1 === url2);
//                         }
//                     });
//                 }
//             },
//             validationCheck: function(bccVM, stepVM) {
//                 return (stepVM.inputFields.selectedTouchpoints && stepVM.inputFields.selectedTouchpoints().length > 0);
//             },
//             validationErrorMessage: 'You must use atleast one touchpoint',
//             onDone: function (bccVM, stepVM) {
//                 bccVM.tpsFromBCDef(ko.utils.unwrapObservable(stepVM.inputFields.selectedTouchpoints));
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 //load selected
//                 stepVM.inputFields.selectedTouchpoints(ko.utils.unwrapObservable(bccVM.tpsFromBCDef));
//             }
//
//         },
//         {
//             title:'Multimedia',
//             subTitle:'Upload one or more image, video or audio file',
//             completed: false,
//             allowSkip:false,
//             templateName:'createBCiMultimediaTempl',
//             showToggle: false,
//             inputFields: {
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 bccVM.mainVM.loadMMForBC([bccVM.mmTag]);
//             }
//         },
//         {
//             title:'Business Intelligence',
//             subTitle:'Select one or more business intelligence',
//             completed: false,
//             allowSkip:false,
//             templateName:'createBCiBusinessIntelTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedBI: ko.observableArray()
//             },
//             onDone: function (bccVM, stepVM) {
//                 var bi = stepVM.inputFields.selectedBI();
//                 if (bi.length < 1) {
//                     bccVM.selectedBI([]);
//                     return;
//                 }
//                 var selectedObj = _.filter(bccVM.allBusinessIntelligence(), function (i) {
//                     return (bi.indexOf(i.name) !== -1);
//                 });
//                 bccVM.selectedBI(selectedObj);
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 //load selected
//                 var ids = _.map(bccVM.selectedBI(), function (selection) {
//                     return selection.name;
//                 });
//                 stepVM.inputFields.selectedBI(ids);
//             }
//         },
//         {
//             title:'Business Rules',
//             subTitle:'Select one or more business rules',
//             completed: false,
//             templateName:'createBCiBusinessRulesTempl',
//             showToggle: false,
//             allowSkip:false,
//             inputFields: {
//                 selectedBRs: ko.observableArray([])
//             },
//             onDone: function (bccVM, stepVM) {
//                 var brs = stepVM.inputFields.selectedBRs();
//                 if (brs.length < 1) { //none selected
//                     bccVM.selectedBRs([]);
//                     return;
//                 }
//                 var brObjs = _.filter(bccVM.allBRs(), function(br) {
//                     return (brs.indexOf(br.behRef) !== -1);
//                 });
//                 brObjs = brObjs || [];
//                 bccVM.selectedBRs(brObjs);
//             },
//             onBefore: function (bccVM) {
//                 //set available BRs for behaviours
//                 bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
//                 var brs = bccVM.selectedBRs() || [];
//                 var brIds = _.map(brs, function (val) {
//                     return val.behRef;
//                 });
//                 stepVM.inputFields.selectedBRs(brIds);
//             }
//         },
//         {
//             title:'Metrics',
//             subTitle:'Select one or more metrics',
//             completed: false,
//             templateName:'createBCiMetricsTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedMetricIds: ko.observableArray([])
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
//             },
//             onBefore: function (bccVM) {
//                 //load metrics for behaviours from offer and selected ones
//                 var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
//                 var arrUnique = _.uniqWith(arr, function (val, val2) {
//                     return val.ds.id === val2.ds.id;
//                 });
//                 bccVM.getMetricsByBehNew(arrUnique);
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//
//                 var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
//
//                 var arrUnique = _.uniqWith(arr, function (val, val2) {
//                     return val.ds.id === val2.ds.id;
//                 });
//
//
//                 bccVM.getMetricsByBehNew(arrUnique);
//
//                 stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
//             }
//         }
//
//     ];
// } else if (bcName && (bcName === 'Product' || bcName === 'Offer')) {
//     return [
//         {
//             title: 'Name of the Offer',
//             subTitle: '',
//             completed: false,
//             templateName: 'createBCiNameTempl',
//             showToggle: false,
//             inputFields: {
//                 bcName: ko.observable()
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.bcName(stepVM.inputFields.bcName());
//             },
//             validationCheck: function (bccVM, stepVM) {
//                 if (stepVM.inputFields.bcName() && stepVM.inputFields.bcName().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
//                     return true;
//                 }
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 stepVM.inputFields.bcName(bccVM.bcName());
//             },
//             validationErrorMessage: 'You must specify a unique offer name that is at least 2 characters long',
//             onCancel: function(bccVM, stepVM) {
//                 //reset name
//                 stepVM.inputFields.bcName(bccVM.bcName());
//             }
//         },
//         {
//             title: 'Describe the Offer',
//             subTitle: '',
//             completed: false,
//             templateName: 'createBCiDescriptionTempl',
//             showToggle: false,
//             inputFields: {
//                 bcDescription: ko.observable()
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.bcDescription(stepVM.inputFields.bcDescription());
//             },
//             // validationCheck: function (bccVM, stepVM) {
//             //     if (stepVM.inputFields.bcDescription() && stepVM.inputFields.bcDescription().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
//             //         return true;
//             //     }
//             // },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 stepVM.inputFields.bcDescription(bccVM.bcDescription());
//             },
//             // validationErrorMessage: 'You must specify a unique offer name that is at least 2 characters long',
//             onCancel: function(bccVM, stepVM) {
//                 //reset name
//                 stepVM.inputFields.bcDescription(bccVM.bcDescription());
//             }
//         },
//         {
//             title: 'eServices',
//             subTitle: 'Select one or more eServices',
//             completed: false,
//             templateName: 'createBCiBehavioursTempl',
//             showToggle: false,
//             allowSkip: false,
//             inputFields: {
//                 selectedBehaviours: ko.observableArray(),
//                 availableBehaviours: ko.observableArray()
//             },
//             onDone: function (bccVM, stepVM) {
//                 //behaviourIds
//                 var behaviours = stepVM.inputFields.selectedBehaviours();
//                 if (behaviours.length < 1) {
//                     return;
//                 }
//                 var behaviourObjs = _.filter(bccVM.allBehaviours(), function (beh) {
//                     return (behaviours.indexOf(beh.name) !== -1);
//                 });
//                 bccVM.selectedBehaviours(behaviourObjs);
//             },
//             onBefore: function (bccVM, stepVM) {
//                 //available behaviours to select are filtered based on offer
//                 var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
//                 stepVM.inputFields.availableBehaviours(allB);
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 var selection = bccVM.selectedBehaviours();
//
//                 var ids = _.map(selection,function (beh) {
//                     return beh.name;
//                 });
//
//                 stepVM.inputFields.selectedBehaviours(ids);
//             }
//         },
//         // {
//         //     title:'Multimedia',
//         //     subTitle:'Upload one or more image, video or audio file',
//         //     completed: false,
//         //     allowSkip:true,
//         //     templateName:'createBCiMultimediaTempl',
//         //     showToggle: false,
//         //     inputFields: {
//         //     }
//         // },
//         {
//             title:'Business Rules',
//             subTitle:'Select one or more business rules',
//             completed: false,
//             templateName:'createBCiBusinessRulesTempl',
//             showToggle: false,
//             allowSkip:false,
//             inputFields: {
//                 selectedBRs: ko.observableArray([])
//             },
//             onDone: function (bccVM, stepVM) {
//                 var brs = stepVM.inputFields.selectedBRs();
//                 if (brs.length < 1) { //none selected
//                     bccVM.selectedBRs([]);
//                     return;
//                 }
//                 var brObjs = _.filter(bccVM.allBRs(), function(br) {
//                     return (brs.indexOf(br.behRef) !== -1);
//                 });
//                 brObjs = brObjs || [];
//                 bccVM.selectedBRs(brObjs);
//             },
//             onBefore: function (bccVM) {
//                 //set available BRs for behaviours
//                 bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
//                 var brs = bccVM.selectedBRs() || [];
//                 var brIds = _.map(brs, function (val) {
//                     return val.behRef;
//                 });
//                 stepVM.inputFields.selectedBRs(brIds);
//             }
//         },
//         {
//             title: 'Metrics',
//             subTitle: 'Select one or more metrics',
//             completed: false,
//             templateName: 'createBCiMetricsTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedMetricIds: ko.observableArray([])
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
//             },
//             onBefore: function (bccVM) {
//                 //load metrics
//                 bccVM.getMetricsByBehNew(bccVM.selectedBehaviours());
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//
//                 var arr = bccVM.selectedBehaviours() || [];
//
//                 bccVM.getMetricsByBehNew(arr);
//
//                 stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
//             }
//         }
//
//     ];
// } else if (bcName && bcName === 'MarketingCampaign') {
//     return [
//         {
//             title: 'Name of the Campaign',
//             subTitle: '',
//             completed: false,
//             templateName: 'createBCiNameTempl',
//             showToggle: false,
//             inputFields: {
//                 bcName: ko.observable()
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.bcName(stepVM.inputFields.bcName());
//             },
//             validationCheck: function (bccVM, stepVM) {
//                 if (stepVM.inputFields.bcName() && stepVM.inputFields.bcName().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
//                     return true;
//                 }
//             },
//             validationErrorMessage: 'You must specify a unique campaign name that is at least 2 characters long'
//         },
//         {
//             title: 'eServices',
//             subTitle: 'Select one or more eServices',
//             completed: false,
//             templateName: 'createBCiBehavioursTempl',
//             showToggle: false,
//             allowSkip: false,
//             inputFields: {
//                 selectedBehaviours: ko.observableArray(),
//                 availableBehaviours: ko.observableArray()
//             },
//             onDone: function (bccVM, stepVM) {
//                 //behaviourIds
//                 var behaviours = stepVM.inputFields.selectedBehaviours();
//                 if (behaviours.length < 1) {
//                     return;
//                 }
//                 var behaviourObjs = _.filter(bccVM.allBehaviours(), function (beh) {
//                     return (behaviours.indexOf(beh.name) !== -1);
//                 });
//                 bccVM.selectedBehaviours(behaviourObjs);
//             },
//             onBefore: function (bccVM, stepVM) {
//                 //available behaviours to select are filtered based on offer
//                 var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
//                 stepVM.inputFields.availableBehaviours(allB);
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 var selection = bccVM.selectedBehaviours();
//
//                 var ids = _.map(selection, function (beh) {
//                     return beh.name;
//                 });
//
//                 stepVM.inputFields.selectedBehaviours(ids);
//             }
//         },
//         {
//             title: 'Touchpoints',
//             subTitle: 'Select a touchpoint',
//             completed: false,
//             templateName: 'createBCiTouchpointsTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedTouchpoints: ko.observableArray(),
//                 showAddTouchpoint: ko.observable(false),
//                 selectedChannelType: ko.observable(),
//                 selectedChannelTypeId: ko.observable(),
//                 pendingChannelUrl: ko.observable(),
//                 pendingTouchpointName: ko.observable(),
//                 saveSelectedExistingTP: function (self, tpInfo) {
//                     var found = _.find(self.inputFields.selectedTouchpoints(), function (val) {
//                         return (val.tpInfo && val.tpInfo.tpId === tpInfo.tpId);
//                     });
//                     if (!found) {
//                         self.inputFields.selectedTouchpoints.push({tpInfo: tpInfo, channelType: tpInfo.tpType});
//                     }
//                 },
//                 saveSelectedTP: function (self) {
//                     self.inputFields.selectedTouchpoints.push({
//                         channelType: self.inputFields.selectedChannelType(),
//                         channelTypeId: self.inputFields.selectedChannelTypeId(),
//                         channelUrl: self.inputFields.pendingChannelUrl(),
//                         name: self.inputFields.pendingTouchpointName()
//                     });
//                 },
//                 removeSelectedTP: function (self, info) {
//                     self.inputFields.selectedTouchpoints.remove(function (tp) {
//                         if (info.tpInfo) {
//                             return (tp.tpInfo.tpId === info.tpInfo.tpId);
//                         } else {
//                             return (tp.channelUrl() == info.channelUrl());
//                         }
//                     });
//                 }
//             },
//             validationCheck: function (bccVM, stepVM) {
//                 return (stepVM.inputFields.selectedTouchpoints && stepVM.inputFields.selectedTouchpoints().length > 0);
//             },
//             validationErrorMessage: 'You must use atleast one touchpoint',
//             onDone: function (bccVM, stepVM) {
//                 self.tpsFromBCDef(stepVM.inputFields.selectedTouchpoints());
//             }
//         },
//         {
//             title: 'Multimedia',
//             subTitle: 'Upload one or more image, video or audio file',
//             completed: false,
//             allowSkip: false,
//             templateName: 'createBCiMultimediaTempl',
//             showToggle: false,
//             inputFields: {}
//         },
//         {
//             title: 'Business Intelligence',
//             subTitle: 'Select one or more business intelligence',
//             completed: false,
//             allowSkip: false,
//             templateName: 'createBCiBusinessIntelTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedBI: ko.observableArray()
//             },
//             onDone: function (bccVM, stepVM) {
//                 var bi = stepVM.inputFields.selectedBI();
//                 if (bi.length < 1) {
//                     bccVM.selectedBI([]);
//                     return;
//                 }
//                 var selectedObj = _.filter(bccVM.allBusinessIntelligence(), function (i) {
//                     return (bi.indexOf(i.name) !== -1);
//                 });
//                 bccVM.selectedBI(selectedObj);
//             },
//             onUpdateLoad: function (bccVM, stepVM) {
//                 //load selected
//                 var ids = _.map(bccVM.selectedBI(), function (selection) {
//                     return selection.name;
//                 });
//                 stepVM.inputFields.selectedBI(ids);
//             }
//         },
//         {
//             title: 'Business Rules',
//             subTitle: 'Select one or more business rules',
//             completed: false,
//             templateName: 'createBCiBusinessRulesTempl',
//             showToggle: false,
//             allowSkip: false,
//             inputFields: {
//                 selectedBRs: ko.observableArray([])
//             },
//             onDone: function (bccVM, stepVM) {
//                 var brs = stepVM.inputFields.selectedBRs();
//                 if (brs.length < 1) { //none selected
//                     bccVM.selectedBRs([]);
//                     return;
//                 }
//                 var brObjs = _.filter(bccVM.allBRs, function (br) {
//                     return (brs.indexOf(br.behRef) !== -1);
//                 });
//                 bccVM.selectedBRs(brObjs);
//             },
//             onBefore: function (bccVM) {
//                 //set available BRs for behaviours
//                 bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
//             }
//         },
//         {
//             title: 'Metrics',
//             subTitle: 'Select one or more metrics',
//             completed: false,
//             templateName: 'createBCiMetricsTempl',
//             showToggle: false,
//             inputFields: {
//                 selectedMetricIds: ko.observableArray([])
//             },
//             onDone: function (bccVM, stepVM) {
//                 bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
//             },
//             onBefore: function (bccVM) {
//                 //load metrics
//                 bccVM.getMetricsByBehNew(bccVM.selectedBehaviours());
//             }
//         }
//     ];
//
// }
//


module.exports = {
    epa: DEFAULT_EPA_WORKFLOW
    // bcDef: DEFAULT_BC_DEF_WORKFLOW
};
