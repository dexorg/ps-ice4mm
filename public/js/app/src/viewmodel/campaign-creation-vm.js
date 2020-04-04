/**
 * Copyright Digital Engagement Xperience 2019
 *
 */
/* global async, dexit, moment */

/**
 * View model for creating or updating a Campaign instance
 * @param {object} args
 * @param {string} [args.mode='create] - 'create' or 'update' mode
 * @param {string} [args.bcId] - id
 * @param {object} args.mainVM
 * @param {object} args.callingVM
 * @param {string} args.parentBCName - parent BC holding the BC Type being created
 * @param {object} args.associatedBCDefinitions
 * @param {ko.observable<string>} args.mainVM.currentRole - user's current role
 * @param {ko.observable<string>} args.mainVM.listOfBCInstances - BC instances including viewModel for each
 * @param {ko.observable<string>} args.mainVM.tpTypes - configured list for app
 * @param {object} args.currBCDef
 * @param {object} args.permissions
 * @param {ko.observableArray} [args.permissions.behDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.brDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.metricDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.segmentReportDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.userProfileDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.associatedBCDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.associatedEntityDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.tpDefinePermission=ko.observable(false)]
 * @param {ko.observableArray} [args.permissions.mmDefinePermission=ko.observable(false)]
 * @constructor
 */
dexit.app.ice.CampaignCreationVM = function (args) {
    var self = this;

    if (!args || !args.mainVM) {
        throw new Error('args.mainVM required');
    }
    if (!args.callingVM) {
        throw new Error('args.callingVM required');
    }

    if (!args.currBCDef || !args.currBCDef.bctype) {
        throw new Error('args.currBCDef required');
    }

    if (args.existingData) {
        self.bcStructure = args.existingData;
    }
    if (args.existingId) {
        self.existingId = args.existingId;
    }


    //once approved you cannot save it anymore
    self.approved = ko.observable(false);
    if (args.existingData && args.existingData.approved) {
        self.approved(true);
    }


    if (args.parentBCDef) {
        self.parentBCDef = args.parentBCDef;
    }


    self.campaignName = ko.observable('');
    self.bcName = ko.observable('');

    if (args.name) {
        //self.campaignName(args.name);
        self.bcName(args.name);
    }


    if (args.parentParams) {
        self.parentParams = args.parentParams;
    }

    if (args.parentVM) {
        self.parentVM = args.parentVM;
    }

    if (args.parentBCName) {
        self.parentBCiName = ko.observable(args.parentBCName);
    } else {
        //TODO: error
        self.parentBCiName = ko.observable('Merchandising');
    }

    self.loaded = ko.observable(false);
    self.loadCss = ko.pureComputed(function () {
        if (self.loaded() === true) {
            return 'hidden';
        } else {
            return 'loading';
        }
    });

    self.MMModalVisible = ko.observable(false);
    self.iconModalVisible = ko.observable(false);


    self.showIconModal = function() {
        debugger;

        self.mmManagementIconsVM.load('/');
        self.iconModalVisible(true);
        //TODO
    };

    self.showMMModal = function(){

        self.mmManagementVM.load('/');
        self.MMModalVisible(true);
    };



    self.closeIconModal = function(selection) {
        debugger;
        self.iconChanges = true;
        self.iconModalVisible(false);

        if (selection && selection.length < 1) {
            alert('Warning you did not select an icon');
            return;
        }
        var key = selection[0];

        //find url,
        var mm = _.find(self.mmManagementIconsVM.allItems(), function(item) {
            return (item.fileType == 'file' && item.id === key);
        })

        if (!mm) {
            alert('Warning you did not select an icon');
            return;
        }

        self.mmIcon(mm.url);
        mainVM.mmIcon(mm.url);


        //build from key


    };

    self.closeMMModal = function(){
        self.mmChanges = true;
        self.MMModalVisible(false);
        //reload mm and tags on any file upload
        self.mainVM.loadMMForBC([self.mmTag], function () {
            self.selectedMMAndTags = self.prepareTags(self.availableTags(), mainVM.fileTags());
            self.originalSelectedMMAndTags = _.cloneDeep(self.selectedMMAndTags);
        });


        // mainVM.loadMMForBC(self.mmTag, function () {
        //     //load existing mm tags
        //     self.populateAvailableUserMMTags(function () {
        //         //assign mm;
        //         self.selectedMMAndTags = self.prepareTags(self.availableTags(), mainVM.fileTags());
        //     });
        //
        // });

    };
    self.mmChanges = false;


    self.mmManagementVM = new dexit.app.ice.MMManagement({
        baseFolder: 'ice4m',
        fileTypeRestrictions: args.mainVM.fileTypeRestrictions(),
        closeFn: self.closeMMModal,
        mainVM:args.mainVM
    });


    self.mmManagementIconsVM = new dexit.app.ice.MMManagement({
        baseFolder: 'ice4m',
        fileTypeRestrictions: args.mainVM.fileTypeRestrictions(),
        closeFn: self.closeIconModal,
        mainVM:args.mainVM
    });




    self.enableCreate = ko.observable(true);

    var editMode = (args && args.mode && args.mode === 'edit' ? true: false);
    self.editMode = ko.observable(editMode);
    self.bcId = args.bcId;
    self.existingBC = null;

    self.currBCDef = ko.observable(args.currBCDef);
    self.currBCType = args.currBCDef.bctype;

    var mainVM = args.mainVM;
    this.mainVM = mainVM;
    var permissions = args.permissions || {};
    self.behDefinePermission = permissions.behDefinePermission || ko.observable(false);
    self.brDefinePermission = self.brDefinePermission || ko.observable(false);
    self.metricDefinePermission = permissions.metricDefinePermission || ko.observable(false);
    self.kpiDefinePermission = permissions.kpiDefinePermission || ko.observable(false);
    self.segmentReportDefinePermission = permissions.segmentReportDefinePermission || ko.observable(false);
    self.userProfileDefinePermission = permissions.userProfileDefinePermission || ko.observable(false);
    self.associatedBCDefinePermission = permissions.associatedBCDefinePermission || ko.observable(false);
    self.associatedEntityDefinePermission = permissions.associatedEntityDefinePermission || ko.observable(false);
    self.tpDefinePermission = permissions.tpDefinePermission || ko.observable(false);
    self.mmDefinePermission = permissions.mmDefinePermission || ko.observable(false);



    self.associatedBCs = ko.observableArray([]);
    self.associatedRoles = ko.observableArray([]);

    self.availableBehaviourList = [];


    self.availableCmsConfigurationModes = ko.observableArray([]);


    //--- Begin fields used for adding BC ---//
    self.selectedBRs = ko.observableArray([]);
    //self.bcName = ko.observable(null);
    self.bcDescription = ko.observable(null);
    self.selectedBehaviours = ko.observableArray([]);
    self.tpsFromBCDef = ko.observableArray([]);
    self.selectedMetrics = [];
    //self.selectedAssociatedBC = ko.observable();
    self.selectedAssociatedBCs = ko.observableArray([]);
    self.selectedAssociatedMMBCIds = ko.observableArray([]);
    self.selectedBizObjectives = [];


    self.selectedObjectives = [];


    //holds available metrics for BC
    self.availableMetricsForBC = ko.observableArray([]);


    self.selectedAssociatedOffer = ko.pureComputed(function(){
        var selection = _.find(self.selectedAssociatedBCs(),  function(val) {
            return val.type && (val.type === 'Product' || val.type === 'Offer');
        });
        return selection;

    });

    self.selectedBI = ko.observableArray([]);

    self.selectedMMAndTags = ko.observableArray([]);


    //-- End fields used for adding BC ---//


    //--- Begin fields used for updating BC ---//
    self.originalSelectedBRs = [];
    self.originalBcName = null;
    self.originalSelectedBehaviours = [];
    self.originalTpsFromBCDef = [];
    self.originalSelectedMetrics = [];
    self.originalSelectedBizObjectives = [];

    self.originalSelectedObjectives = [];

    //self.originalSelectedAssociatedBC = [];
    self.originalSelectedAssociatedBCs = [];
    self.originalSelectedAssociatedMMBCIds = [];
    self.originalSelectedBI = [];
    self.originalSelectedMMAndTags = [];
    //-- End fields used for updating BC ---//
    self.mmTags = [];


    self.mmIcon = ko.observable()

    self.behavioursFromAssociatedBC = ko.observableArray([]);
    self.brsFromAssociatedBC = ko.observableArray([]);


    self.existingTPs = ko.observableArray([]);
    self.existingBCCTPs = ko.observableArray([]);

    self.availableWidgetIntelligence = ko.observable([]);
    self.allBehaviours = ko.observableArray([]);
    self.allBRs = ko.observableArray([]);
    self.allMetrics = ko.observableArray([]);
    self.allBusinessIntelligence = ko.observableArray([]);

    self.allMetricsForWidget = ko.observableArray([]);

    self.allBehEpt = [];
    self.placeholderValue =ko.observable('');


    self.currentStepNumber = ko.observable(1);

    self.showSummaryView = ko.observable(false);
    self.stepsVM = ko.observableArray([]);


    self.changesMade = ko.observable(false);



    self.availableTags = ko.observableArray([]);


    self.appTags = ['image','video','document','Programs'];


    self.iconText = ko.observable();

    self.startDate = ko.observable();
    self.endDate = ko.observable();
    self.selectedCmsCampaignConfiguration = ko.observable();






    self.populateAvailableUserMMTags = function(callback) {
        callback = callback || function(){};
        self._loadUserAvailableUserMMTags(function (err, result) {
            if (err) {
                console.log('could not load available mm tags %o', err);
            }else {
                self.availableTags(result);
            }
            callback();

        });
    };

    /**
     * Prepare tags
     */
    self.prepareTags = function(availableUserTags, mmAndTags) {

        return _.map(mmAndTags, function (mm) {
            //key, tags, url

            var tags = _.filter(mm.tags, function (tag) {
                return (availableUserTags.indexOf(tag)>-1);
            });

            return {
                key:mm.key,
                tags: tags,
                url: mm.url
            };
        });


    };

    self._loadUserAvailableUserMMTags = function(callback) {

        var resource = '/file-tag?tagType=user';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, result) {
            if (err) {
                return callback(err);
            }
            var resp = result || [];
            //make sure appTags are not present
            var appTags = self.appTags.concat([self.mmTag]);

            var toReturn = _.reject(resp, function (it) {
                return (appTags.indexOf(it) !== -1);
            });
            callback(null, toReturn);
        });
    };


    /**
     * Use to toggle notification for showing an information message that more options are available
     * TODO: logic to flash this on screen
     */
    self.showNotificationForEditAdd = ko.observable(false);




    self._resolveSteps = function(bcName, mode) {

        //if (mode && mode === 'create') {
            return self._resolveStepsCreate(bcName);
        // }else if (mode && mode === 'update') {
        //     return self._resolveStepsUpdate(bcName);
        // }else {
        //     return new Error('invalid mode parameters');
        // }



    };


    self.populateCmsConfigurationModes = function() {
        var resource = '/cms-config';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, config) {
            if (err || (!config && !config.supportedModes)) {
                console.warn('could not retrieve cms configuration...defaulting to internal');
                self.availableCmsConfigurationModes([{id:'internal',name:'GrapesJS'}]);
            }else {
                self.availableCmsConfigurationModes(config.supportedModes);
            }
        });
    };


    self._resolveStepsCreate = function(bcName) {

        if (bcName && bcName === 'Store') {
            return [
                {
                    title:'Name of the Channel',
                    subTitle:'',
                    completed: false,
                    templateName:'createBCiNameTempl',
                    showToggle: false,
                    inputFields: {
                        bcName: ko.observable()
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.bcName(stepVM.inputFields.bcName());
                    },
                    validationCheck: function(bccVM, stepVM) {
                        if (stepVM.inputFields.bcName() && stepVM.inputFields.bcName().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
                            return true;
                        }
                    },
                    validationErrorMessage: 'You must specify a unique name that is at least 2 characters long',
                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.bcName(bccVM.bcName());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.bcName(bccVM.bcName());
                    }
                },
                {
                    title: 'Describe the Channel',
                    subTitle: '',
                    completed: false,
                    templateName: 'createBCiDescriptionTempl',
                    showToggle: false,
                    inputFields: {
                        bcDescription: ko.observable()
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.bcDescription(stepVM.inputFields.bcDescription());
                    },

                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.bcDescription(bccVM.bcDescription());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.bcDescription(bccVM.bcDescription());
                    }
                },
                // {
                //     title: 'Select Behaviour for the Channel',
                //     subTitle: '',
                //     completed: false,
                //     templateName: 'createBCiTPNatureTempl',
                //     showToggle: false,
                //     inputFields: {
                //         selectedMode: ko.observable()
                //     },
                //     onDone: function (bccVM, stepVM) {
                //         bccVM.bcDescription(stepVM.inputFields.bcDescription());
                //     },
                //
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         stepVM.inputFields.bcDescription(bccVM.bcDescription());
                //     },
                //     onCancel: function(bccVM, stepVM) {
                //         //reset name
                //         stepVM.inputFields.bcDescription(bccVM.bcDescription());
                //     }
                // },
                {
                    title:'Programs',
                    subTitle:'Select Programs',
                    completed: false,
                    templateName:'createBCiSelectMultipleBCsTempl',
                    showToggle: false,
                    inputFields: {
                        selectedAssociatedBCs: ko.observableArray(),
                        availableAssociatedBCs: ko.observableArray(),
                        description: ko.observable()
                    },
                    onBefore: function (bccVM, stepVM) {
                        //available BCs to select
                        var toFilter = ko.utils.unwrapObservable(bccVM.associatedBCs);
                        var filtered = _.filter(toFilter, {'type': 'MerchandisingCampaign'});
                        stepVM.inputFields.availableAssociatedBCs(filtered);

                    },
                    // validationCheck: function(bccVM, stepVM) {
                    //     return true;
                    //     // if (stepVM.inputFields.selectedAssociatedBCs().length > 0) {
                    //     //     return true;
                    //     // }
                    // },
                    //  validationErrorMessage: 'You must select at least one campaign',
                    onCancel: function(bccVM, stepVM) {
                        var toFilter = ko.utils.unwrapObservable(bccVM.selectedAssociatedBCs);
                        var selection = _.filter(toFilter, {'type': 'MerchandisingCampaign'});

                        // var beh = (selection && selection.associatedBehaviours ? selection.associatedBehaviours : []);
                        // var br = (selection && selection.associatedBRs ? selection.associatedBRs : []);
                        stepVM.inputFields.selectedAssociatedBCs(_.map(selection, 'id'));
                        // bccVM.behavioursFromAssociatedBC(beh);
                        // bccVM.brsFromAssociatedBC(br);

                    },
                    onDone: function (bccVM, stepVM) {
                        //behaviourIds
                        var bcs = stepVM.inputFields.selectedAssociatedBCs();
                        // iff (bcs.length < 1) {
                        //     return;
                        // }

                        var bcObjs = _.filter(stepVM.inputFields.availableAssociatedBCs(), function (b) {
                            return (bcs.indexOf(b.id) !== -1);
                        });

                        var toFilter = ko.utils.unwrapObservable(bccVM.selectedAssociatedBCs);
                        var filtered = _.reject(toFilter, {'type': 'MerchandisingCampaign'});

                        //combine all types together
                        var objs = filtered.concat(bcObjs);


                        bccVM.selectedAssociatedBCs(objs);
                    },
                    onUpdateLoad: function (bccVM, stepVM) {

                        var toFilter = ko.utils.unwrapObservable(bccVM.selectedAssociatedBCs);
                        var selection = _.filter(toFilter, {'type': 'MerchandisingCampaign'});


                        var ids = _.map(selection, function (beh) {
                            return beh.id;
                        });
                        //stepVM.inputFields.availableAssociatedBCs(bccVM.availableAssociatedBCs);
                        stepVM.inputFields.selectedAssociatedBCs(ids);
                    }
                },
                {
                    title:'Channel',
                    subTitle:'Configure Channel',
                    completed: false,
                    templateName:'createBCCChannelTempl',
                    showToggle: false,
                    inputFields: {
                        selectedTouchpoints: ko.observableArray(),
                        selectedChannelType: ko.observable(),
                        selectedChannelTypeId: ko.observable(),
                        pendingChannelUrl: ko.observable(),
                        disableInput: ko.observable(false)
                        // saveSelectedTP: function(self) {
                        //     self.inputFields.selectedTouchpoints.push({channelType: self.inputFields.selectedChannelType(), channelTypeId: self.inputFields.selectedChannelTypeId(), channelUrl: self.inputFields.pendingChannelUrl(), name: self.inputFields.pendingTouchpointName()});
                        // }
                    },
                    // onBefore: function (bccVM, stepVM) {
                    //     //available BCs to select
                    //
                    //
                    //     var toFilter = ko.utils.unwrapObservable(bccVM.associatedBCs);
                    //     var filtered = _.filter(toFilter, {'type': 'MerchandisingCampaign'});
                    //     stepVM.inputFields.availableAssociatedBCs(filtered);
                    //
                    // },
                    validationCheck: function(bccVM, stepVM) {
                        return (stepVM.inputFields.pendingChannelUrl() && stepVM.inputFields.pendingChannelUrl().length > 0);
                    },
                    validationErrorMessage: 'You must enter a valid channel url',
                    onDone: function (bccVM, stepVM) {


                        //if an update then just ignore
                        if (stepVM.inputFields.disableInput() !== true) {

                            //grab channel type for bcc (which is ucc still)
                            var channelType = 'ucc';
                            var channelTypeId = bccVM.mainVM.touchpointTypes()[channelType].channelTypeId;


                            //load channel types, id etc, take name from BC name
                            stepVM.inputFields.selectedTouchpoints.push({
                                channelType: channelType,
                                channelTypeId: channelTypeId,
                                channelUrl: stepVM.inputFields.pendingChannelUrl(),
                                name: bccVM.bcName()
                            });

                            bccVM.tpsFromBCDef(ko.utils.unwrapObservable(stepVM.inputFields.selectedTouchpoints));
                        }
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        //load selected
                        //load selected
                        var tps = ko.utils.unwrapObservable(bccVM.tpsFromBCDef);
                        if (tps.length > 0 && tps[0].tpInfo) {
                            stepVM.inputFields.pendingChannelUrl(tps[0].tpInfo.tpURL);
                            stepVM.inputFields.disableInput(true);
                        }
                    }

                },
                // {
                //     title:'eServices',
                //     subTitle:'Select one or more eServices',
                //     completed: false,
                //     templateName:'createBCiBehavioursTempl',
                //     showToggle: false,
                //     allowSkip:false,
                //     inputFields: {
                //         selectedBehaviours: ko.observableArray(),
                //         availableBehaviours: ko.observableArray()
                //     },
                //     onDone: function (bccVM, stepVM) {
                //         //behaviourIds
                //         var behaviours = stepVM.inputFields.selectedBehaviours();
                //         if (behaviours.length < 1) {
                //             return;
                //         }
                //         var behaviourObjs = _.filter(bccVM.allBehaviours(), function(beh) {
                //             return (behaviours.indexOf(beh.name) !== -1);
                //         });
                //         bccVM.selectedBehaviours(behaviourObjs);
                //     },
                //     onBefore: function (bccVM, stepVM) {
                //         //available behaviours to select are filtered based on offer
                //         var toFilter = ko.utils.unwrapObservable(bccVM.behavioursFromAssociatedBC);
                //         var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
                //         var filtered = _.differenceWith(allB, toFilter, function (val, val2) {
                //             return (val && val2 && val.ds.id === val2.ds.id);
                //         });
                //         stepVM.inputFields.availableBehaviours(filtered);
                //
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         var selection = bccVM.selectedBehaviours();
                //
                //         var ids = _.map(selection,function (beh) {
                //             return beh.name;
                //         });
                //
                //         stepVM.inputFields.selectedBehaviours(ids);
                //     }
                // },
                // {
                //     title:'Multimedia',
                //     subTitle:'Upload one or more image, video or audio file',
                //     completed: false,
                //     allowSkip:false,
                //     templateName:'createBCiMultimediaTempl',
                //     showToggle: false,
                //     inputFields: {
                //         videoMM:ko.observableArray([]),
                //         imageMM:ko.observableArray([]),
                //         docMM:ko.observableArray([])
                //     },
                //     onBefore: function (bccVM, stepVM) {
                //         //bccVM.mmManagementVM.load('/');
                //         //tags already loaded as part of mm
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         // bccVM.mainVM.loadMMForBC([bccVM.mmTag]);
                //     }
                // },
                // {
                //     title:'Multimedia Tagging',
                //     subTitle:'Select zero or more tags for your multimedia',
                //     completed: false,
                //     allowSkip:false,
                //     templateName:'tagBCiMultimediaTempl',
                //     showToggle: false,
                //     inputFields: {
                //         availableFilesAndTags: ko.observableArray([]),
                //         selectedFilesAndTags: ko.observableArray([]),
                //         availableMM: ko.observableArray([])
                //     },
                //     onBefore: function (bccVM, stepVM) {
                //
                //         stepVM.inputFields.availableFilesAndTags(bccVM.selectedMMAndTags);
                //         stepVM.inputFields.availableMM([]);
                //         var arr  = [];
                //
                //         _.each(bccVM.mainVM.videoMM(), function (val) {
                //
                //
                //             var selectedTags = _
                //                 .chain(stepVM.inputFields.availableFilesAndTags())
                //                 .filter(function (av) {
                //                     return (av.url === val);
                //                 })
                //                 .head()
                //                 .at('tags')
                //                 .flatten()
                //                 .filter(function (tagVal) {
                //                     return (bccVM.availableTags().indexOf(tagVal) > -1);
                //                 })
                //                 .value();
                //
                //
                //             var key = _
                //                 .chain(stepVM.inputFields.availableFilesAndTags())
                //                 .filter(function (av) {
                //                     return (av.url === val);
                //                 })
                //                 .head()
                //                 .at('key')
                //                 .head()
                //                 .value();
                //
                //             arr.push({type:ko.observable('Video'), key:key, fileName:ko.observable(val),selectedTags:ko.observableArray(selectedTags)});
                //         });
                //
                //         _.each(bccVM.mainVM.imageMM(), function (val) {
                //             var selectedTags = _
                //                 .chain(stepVM.inputFields.availableFilesAndTags())
                //                 .filter(function (av) {
                //                     return (av.url === val);
                //                 })
                //                 .head()
                //                 .at('tags')
                //                 .flatten()
                //                 .filter(function (tagVal) {
                //                     return (bccVM.availableTags().indexOf(tagVal) > -1);
                //                 })
                //                 .value();
                //
                //             var key = _
                //                 .chain(stepVM.inputFields.availableFilesAndTags())
                //                 .filter(function (av) {
                //                     return (av.url === val);
                //                 })
                //                 .head()
                //                 .at('key')
                //                 .head()
                //                 .value();
                //
                //             arr.push({type:ko.observable('Image'), key:key, fileName:ko.observable(val),selectedTags:ko.observableArray(selectedTags)});
                //         });
                //
                //         _.each(bccVM.mainVM.docMM(), function (val) {
                //             var selectedTags = _
                //                 .chain(stepVM.inputFields.availableFilesAndTags())
                //                 .filter(function (av) {
                //                     return (av.url === val);
                //                 })
                //                 .head()
                //                 .at('tags')
                //                 .flatten()
                //                 .filter(function (tagVal) {
                //                     return (bccVM.availableTags().indexOf(tagVal) > -1);
                //                 })
                //                 .value();
                //
                //             var key = _
                //                 .chain(stepVM.inputFields.availableFilesAndTags())
                //                 .filter(function (av) {
                //                     return (av.url === val);
                //                 })
                //                 .head()
                //                 .at('key')
                //                 .head()
                //                 .value();
                //
                //             arr.push({type:ko.observable('Document'), key:key, fileName:ko.observable(val), selectedTags:ko.observableArray(selectedTags)});
                //         });
                //
                //         stepVM.inputFields.availableMM(arr);
                //
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         //update and create are treated the same as the user defined MM tags are independent of the BC
                //     },
                //     onDone: function (bccVM, stepVM) {
                //         //map (type,key,fileName,selectedTags) -> (key, url, tags)
                //         //not to filter out app tags in originalMMandTags
                //         var mapped = _.map(stepVM.inputFields.availableMM(), function (val) {
                //             return {
                //                 key:val.key,
                //                 url: val.fileName(),
                //                 tags: val.selectedTags() || []
                //             };
                //         });
                //         bccVM.selectedMMAndTags = mapped;
                //     }
                // },
                // {
                //     title:'Business Intelligence',
                //     subTitle:'Select one or more business intelligence',
                //     completed: false,
                //     allowSkip:false,
                //     templateName:'createBCiBusinessIntelTempl',
                //     showToggle: false,
                //     inputFields: {
                //         selectedBI: ko.observableArray()
                //     },
                //     onDone: function (bccVM, stepVM) {
                //         var bi = stepVM.inputFields.selectedBI();
                //         if (bi.length < 1) {
                //             bccVM.selectedBI([]);
                //             return;
                //         }
                //         var selectedObj = _.filter(bccVM.allBusinessIntelligence(), function (i) {
                //             return (bi.indexOf(i.name) !== -1);
                //         });
                //         bccVM.selectedBI(selectedObj);
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         //load selected
                //         var ids = _.map(bccVM.selectedBI(), function (selection) {
                //             return selection.name;
                //         });
                //         stepVM.inputFields.selectedBI(ids);
                //     }
                // },
                // {
                //     title:'Business Rules',
                //     subTitle:'Select one or more business rules',
                //     completed: false,
                //     templateName:'createBCiBusinessRulesTempl',
                //     showToggle: false,
                //     allowSkip:false,
                //     inputFields: {
                //         selectedBRs: ko.observableArray([])
                //     },
                //     onDone: function (bccVM, stepVM) {
                //         var brs = stepVM.inputFields.selectedBRs();
                //         if (brs.length < 1) { //none selected
                //             bccVM.selectedBRs([]);
                //             return;
                //         }
                //         var brObjs = _.filter(bccVM.allBRs(), function(br) {
                //             return (brs.indexOf(br.behRef) !== -1);
                //         });
                //         brObjs = brObjs || [];
                //         bccVM.selectedBRs(brObjs);
                //     },
                //     onBefore: function (bccVM) {
                //         //set available BRs for behaviours
                //         bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
                //         var brs = bccVM.selectedBRs() || [];
                //         var brIds = _.map(brs, function (val) {
                //             return val.behRef;
                //         });
                //         stepVM.inputFields.selectedBRs(brIds);
                //     }
                // },
                // {
                //     title:'Metrics',
                //     subTitle:'Select one or more metrics',
                //     completed: false,
                //     templateName:'createBCiMetricsTempl',
                //     showToggle: false,
                //     inputFields: {
                //         selectedMetricIds: ko.observableArray([])
                //     },
                //     onDone: function (bccVM, stepVM) {
                //         bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
                //     },
                //     onBefore: function (bccVM) {
                //         //load metrics for behaviours from offer and selected ones
                //         var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                //         var arrUnique = _.uniqWith(arr, function (val, val2) {
                //             return val.ds.id === val2.ds.id;
                //         });
                //         bccVM.getMetricsByBehAndChan(arrUnique);
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //
                //         var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                //
                //         var arrUnique = _.uniqWith(arr, function (val, val2) {
                //             return val.ds.id === val2.ds.id;
                //         });
                //
                //
                //         bccVM.getMetricsByBehAndChan(arrUnique);
                //
                //         stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
                //     }
                // }

            ];
        } else if (bcName && bcName === 'EngagementPlan') {
            return [
                {
                    title:'Name of the Campaign',
                    subTitle:'',
                    completed: false,
                    templateName:'createBCiNameTempl',
                    showToggle: false,
                    inputFields: {
                        bcName: ko.observable('')
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.bcName(stepVM.inputFields.bcName());
                    },
                    validationCheck: function(bccVM, stepVM) {
                        if (stepVM.inputFields.bcName() && stepVM.inputFields.bcName().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
                            return true;
                        }
                    },
                    onBefore: function(bccVM, stepVM) {
                        debugger;
                        stepVM.inputFields.bcName(bccVM.bcName());
                    },
                    validationErrorMessage: 'You must specify a unique name that is at least 2 characters long',
                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.bcName(bccVM.bcName());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.bcName(bccVM.bcName());
                    }
                },
                {
                    title: 'Describe the Campaign',
                    subTitle: '',
                    completed: false,
                    templateName: 'createBCiDescriptionTempl',
                    showToggle: false,
                    inputFields: {
                        bcDescription: ko.observable()
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.bcDescription(stepVM.inputFields.bcDescription());
                    },

                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.bcDescription(bccVM.bcDescription());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.bcDescription(bccVM.bcDescription());
                    }
                },
                {
                    title:'eServices',
                    subTitle:'Select one or more eServices',
                    completed: false,
                    templateName:'createBCiBehavioursTempl',
                    showToggle: false,
                    allowSkip:false,
                    inputFields: {
                        selectedBehaviours: ko.observableArray(),
                        availableBehaviours: ko.observableArray()
                    },
                    onDone: function (bccVM, stepVM) {
                        //behaviourIds
                        var behaviours = stepVM.inputFields.selectedBehaviours();
                        if (behaviours.length < 1) {
                            return;
                        }
                        var behaviourObjs = _.filter(bccVM.allBehaviours(), function(beh) {
                            return (behaviours.indexOf(beh.name) !== -1);
                        });
                        bccVM.selectedBehaviours(behaviourObjs);
                    },
                    onBefore: function (bccVM, stepVM) {

                        //available behaviours to select are filtered based on offer
                        var toFilter = ko.utils.unwrapObservable(bccVM.behavioursFromAssociatedBC);
                        var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
                        var filtered = _.differenceWith(allB, toFilter, function (val, val2) {
                            return (val && val2 && val.ds.id === val2.ds.id);
                        });
                        stepVM.inputFields.availableBehaviours(filtered);

                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        var selection = bccVM.selectedBehaviours();

                        var ids = _.map(selection,function (beh) {
                            return beh.name;
                        });

                        stepVM.inputFields.selectedBehaviours(ids);
                    }
                },
                {
                    title:'Touchpoints',
                    subTitle:'Select a touchpoint',
                    completed: false,
                    templateName:'createBCiTouchpointsTempl',
                    showToggle: false,
                    inputFields: {
                        selectedBCCTouchpoints: ko.observableArray(),
                        //for non-bcc
                        selectedTouchpoints: ko.observableArray(),
                        showAddTouchpoint: ko.observable(false),
                        selectedChannelType: ko.observable(),
                        selectedChannelTypeId: ko.observable(),
                        pendingChannelUrl: ko.observable(),
                        showChannelAuthorization: ko.observable(false),
                        selectedChannelTypeObj: ko.observable(),
                        pendingTouchpointName: ko.observable(),
                        availableBCCEnabled: ko.observableArray([]),
                        channelAuthorizationUrl: ko.observable(),
                        availableChannelList: ko.observableArray([]),
                        showAddNewTouchpoint: function(self, channelTypeInfo) {

                            self.inputFields.pendingChannelUrl('');
                            self.inputFields.pendingTouchpointName('');

                            self.inputFields.selectedChannelType(channelTypeInfo.name);

                            self.inputFields.selectedChannelTypeObj(channelTypeInfo);
                            self.inputFields.selectedChannelTypeId(channelTypeInfo.channelTypeId);

                            //if (channelTypeInfo.showAuthorization) {
                            if (channelTypeInfo.requiresAuthorization) {
                                self.inputFields.showChannelAuthorization(true);
                            }
                            self.inputFields.showAddTouchpoint(true);

                        },
                        showAuthorizationWindow: function(stepVM, authUrl) {


                            //callback code to verify the window was the one opened from here
                            var cbCode = joint.util.uuid();

                            var cb = function() {

                                //get pages
                                var resultStr = $('#tpAuthResult').val();


                                try {
                                    var result = JSON.parse(resultStr);
                                    var list = _.map(result, function(val){
                                        var res = val;
                                        res.channelUrl = res.channelUrl.replace(' ', '');
                                        return res;
                                    });
                                    stepVM.inputFields.availableChannelList(list);
                                }catch (e) {
                                }
                            };
                            //append
                            if (authUrl.indexOf('?') > 0) {
                                authUrl = authUrl + '&cbCode='+cbCode;
                            }else {
                                authUrl =  authUrl +'?cbCode='+cbCode;
                            }

                            var options = {path: authUrl, windowOptions: 'location=0,status=0,width=800,height=400', callback:cb};

                            var oauthWindow   = window.open(options.path, 'Connect', options.windowOptions);
                            var oauthInterval = window.setInterval(function(){
                                if(oauthWindow) {
                                    if (oauthWindow.closed) {

                                        clearInterval(oauthInterval);
                                        cb();

                                    }
                                }
                            }, 1000);
                        },
                        saveSelectedExistingBCCTP: function (self, tpInfo) {
                            var found = _.find(self.inputFields.selectedBCCTouchpoints(), function(val) {
                                return (val.bcc && val.tpInfo && val.tpInfo.tpId === tpInfo.tpId);
                            });
                            if (!found) {
                                self.inputFields.selectedTouchpoints.push({tpInfo: tpInfo, channelType: tpInfo.tpType});
                            }
                        },
                        saveSelectedExistingTP: function (self, tpInfo) {
                            var found = _.find(self.inputFields.selectedTouchpoints(), function(val) {
                                return (val.tpInfo && val.tpInfo.tpId === tpInfo.tpId);
                            });
                            if (!found) {
                                self.inputFields.selectedTouchpoints.push({tpInfo: tpInfo, channelType: tpInfo.tpType});
                            }
                        },
                        saveSelectedTP: function(self) {
                            self.inputFields.selectedTouchpoints.push({channelType: self.inputFields.selectedChannelType(), channelTypeId: self.inputFields.selectedChannelTypeId(), channelUrl: self.inputFields.pendingChannelUrl(), name: self.inputFields.pendingTouchpointName()});
                        },
                        removeSelectedTP: function(self, info) {
                            self.inputFields.selectedTouchpoints.remove(function(tp) {
                                if (info.tpInfo) {
                                    return (tp.tpInfo.tpId === info.tpInfo.tpId);
                                }else {
                                    var url1 = ko.utils.unwrapObservable(tp.channelUrl);
                                    var url2 = ko.utils.unwrapObservable(info.channelUrl);
                                    return (url1 === url2);
                                }
                            });
                        }
                    },
                    onBefore: function(bccVM, stepVM) {

                        //load channel types based on the configuration
                        //get authorization url

                        var available = _.map(bccVM.mainVM.touchpointKeys(), function (id) {
                            return bccVM.mainVM.touchpointTypes()[id];
                        });

                        var availableBCCEnabled = _.reject(available, function (item) {
                            return (item.name === 'ucc' || item.name === 'bcc');
                        });

                        async.map(availableBCCEnabled, function (item, cb) {
                            dexit.app.ice.integration.tpm.retrieveChannelType(item.channelTypeId, function (err, data) {
                                if (err) {
                                    return cb(err);
                                }
                                cb(null,_.extend(item, {'extendedInfo':data}));
                            });
                        }, function (err, result) {
                            if (err) {
                                //TODO:
                                alert('Error loading the available BCC Enabled Touchpoints');
                            }else {


                                stepVM.inputFields.availableBCCEnabled(result);
                                //stepVM.inputFields.channelTypesInfo(result);
                            }

                        });
                    },
                    validationCheck: function(bccVM, stepVM) {
                        return (stepVM.inputFields.selectedTouchpoints && stepVM.inputFields.selectedTouchpoints().length > 0);
                    },
                    validationErrorMessage: 'You must use atleast one touchpoint',
                    onDone: function (bccVM, stepVM) {
                        bccVM.tpsFromBCDef(ko.utils.unwrapObservable(stepVM.inputFields.selectedTouchpoints));
                    },
                    onUpdateLoad: function (bccVM, stepVM) {

                        stepVM.inputFields.showChannelAuthorization(false);
                        //load selected
                        stepVM.inputFields.selectedTouchpoints(ko.utils.unwrapObservable(bccVM.tpsFromBCDef));
                    }

                },
                {
                    title:'Multimedia',
                    subTitle:'Upload one or more image, video or audio file',
                    completed: false,
                    allowSkip:false,
                    templateName:'createBCiMultimediaTempl',
                    showToggle: false,
                    inputFields: {
                        videoMM:ko.observableArray([]),
                        imageMM:ko.observableArray([]),
                        docMM:ko.observableArray([])
                    },
                    onBefore: function (bccVM, stepVM) {

                        //bccVM.mmManagementVM.load('/');
                        //tags already loaded as part of mm
                    },
                    onUpdateLoad: function (bccVM, stepVM) {

                        // bccVM.mainVM.loadMMForBC([bccVM.mmTag]);
                    }
                },
                {
                    title:'Business Intelligence',
                    subTitle:'Select one or more business intelligence',
                    completed: false,
                    allowSkip:false,
                    templateName:'createBCiBusinessIntelTempl',
                    showToggle: false,
                    inputFields: {
                        selectedBI: ko.observableArray()
                    },
                    onDone: function (bccVM, stepVM) {
                        var bi = stepVM.inputFields.selectedBI();
                        if (bi.length < 1) {
                            bccVM.selectedBI([]);
                            return;
                        }
                        var selectedObj = _.filter(bccVM.allBusinessIntelligence(), function (i) {
                            return (bi.indexOf(i.name) !== -1);
                        });
                        bccVM.selectedBI(selectedObj);
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        //load selected
                        var ids = _.map(bccVM.selectedBI(), function (selection) {
                            return selection.name;
                        });
                        stepVM.inputFields.selectedBI(ids);
                    }
                },
                {
                    title:'Business Rules',
                    subTitle:'Select one or more business rules',
                    completed: false,
                    templateName:'createBCiBusinessRulesTempl',
                    showToggle: false,
                    allowSkip:false,
                    inputFields: {
                        selectedBRs: ko.observableArray([])
                    },
                    onDone: function (bccVM, stepVM) {
                        var brs = stepVM.inputFields.selectedBRs();
                        if (brs.length < 1) { //none selected
                            bccVM.selectedBRs([]);
                            return;
                        }
                        var brObjs = _.filter(bccVM.allBRs(), function(br) {
                            return (brs.indexOf(br.behRef) !== -1);
                        });
                        brObjs = brObjs || [];
                        bccVM.selectedBRs(brObjs);
                    },
                    onBefore: function (bccVM) {
                        //set available BRs for behaviours
                        bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
                        var brs = bccVM.selectedBRs() || [];
                        var brIds = _.map(brs, function (val) {
                            return val.behRef;
                        });
                        stepVM.inputFields.selectedBRs(brIds);
                    }
                },
                {
                    title:'Metrics',
                    subTitle:'Select one or more metrics',
                    completed: false,
                    templateName:'createBCiMetricsTempl',
                    showToggle: false,
                    inputFields: {
                        selectedMetricIds: ko.observableArray([])
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
                    },
                    onBefore: function (bccVM) {

                        //load metrics for behaviours from offer and selected ones
                        var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                        var arrUnique = _.uniqWith(arr, function (val, val2) {
                            return val.ds.id === val2.ds.id;
                        });
                        bccVM.getMetricsByBehAndChan(arrUnique);
                    },
                    onUpdateLoad: function (bccVM, stepVM) {


                        var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());

                        var arrUnique = _.uniqWith(arr, function (val, val2) {
                            return val.ds.id === val2.ds.id;
                        });
                        bccVM.getMetricsByBehAndChan(arrUnique);
                        stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
                    }
                },
                {
                    title:'Schedule',
                    subTitle:'Select a start and end date',
                    completed: false,
                    templateName:'createBCiSchedulePeriodTempl',
                    showToggle: false,
                    inputFields: {
                        scheduleModalVisible: ko.observable(false),
                        startDate: ko.observable(),
                        endDate: ko.observable(),
                        selectedStartTime: ko.observable(),
                        selectedEndTime: ko.observable(),
                        selectedStartDate: ko.observable(),
                        selectedEndDate: ko.observable(),
                        startDateOptions: {
                            dateFormat: 'yy-mm-dd'
                        },
                        endDateOptions: {
                            dateFormat: 'yy-mm-dd'
                        },
                        timeZone: ko.observable(Intl.DateTimeFormat().resolvedOptions().timeZone),
                        showScheduleModal: function(stepVM, bccVM) {
                            //set selectedStartDate, selectedStartTime, selectedStart to show in modal
                            if (stepVM.inputFields.startDate()) {

                                var sDate = moment(stepVM.inputFields.startDate(),moment.ISO_8601);
                                stepVM.inputFields.selectedStartDate(sDate.toDate());
                                var startTime = sDate.format('HH:mm');
                                stepVM.inputFields.selectedStartTime(startTime);
                            }
                            if (stepVM.inputFields.endDate() && stepVM.inputFields.endDate() !== 'never') {
                                var eDate = moment(stepVM.inputFields.endDate(),moment.ISO_8601);

                                stepVM.inputFields.selectedEndDate(eDate.toDate());
                                var endTime = eDate.format('HH:mm');
                                stepVM.inputFields.selectedEndTime(endTime);
                            }
                            stepVM.inputFields.scheduleModalVisible(true);
                        },
                        saveSchedule: function(stepVM) {
                            var startDate = stepVM.inputFields.selectedStartDate();
                            var startTime = stepVM.inputFields.selectedStartTime();

                            var endDate = stepVM.inputFields.selectedEndDate();
                            var endTime = stepVM.inputFields.selectedEndTime();


                            var startDateTime = null;

                            if (!startDate) { //default to right now
                                startDateTime = moment();
                            } else {
                                //build start date (js Date object)
                                startDateTime = moment(startDate);
                                if (startTime) {
                                    var sM = moment(startTime, 'HH:mm');

                                    startDateTime.hour(sM.hours());
                                    startDateTime.minutes(sM.minutes());
                                }


                            }
                            stepVM.inputFields.startDate(startDateTime);

                            if (endDate) {
                                //build end date (js Date object)
                                var endDateTime = moment(endDate);
                                if (endTime) {
                                    var eM = moment(endTime, 'HH:mm');
                                    endDateTime.hour(eM.hour());
                                    endDateTime.minutes(eM.minutes());
                                }
                                stepVM.inputFields.endDate(endDateTime);
                            }


                            stepVM.inputFields.scheduleModalVisible(false);

                        }
                    },
                    onDone: function (bccVM, stepVM) {

                        bccVM.startDate(stepVM.inputFields.startDate());
                        bccVM.endDate(stepVM.inputFields.endDate());
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.startDate(bccVM.startDate());
                        stepVM.inputFields.endDate(bccVM.endDate());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.startDate(bccVM.startDate());
                        stepVM.inputFields.endDate(bccVM.endDate());
                    }
                },
                {
                    title:'Configure CMS',
                    subTitle:'Select one from the list',
                    completed: false,
                    templateName:'campaignSelectCMSTempl',
                    showToggle: false,
                    inputFields: {
                        availableCmsConfigurationModes: ko.observableArray([]),
                        selectedCmsCampaignConfiguration: ko.observable(),
                    },
                    onBefore: function (bccVM, stepVM) {
                        //set available BRs for behaviours
                        stepVM.inputFields.availableCmsConfigurationModes(bccVM.availableCmsConfigurationModes());
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.selectedCmsCampaignConfiguration(stepVM.inputFields.selectedCmsCampaignConfiguration());
                    },
                    onUpdateLoad: function (bccVM, stepVM) {

                        stepVM.inputFields.selectedCmsCampaignConfiguration(bccVM.selectedCmsCampaignConfiguration());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.selectedCmsCampaignConfiguration(bccVM.selectedCmsCampaignConfiguration());
                    }
                },
                {
                    title:'Icon',
                    subTitle:'Select an image file',
                    completed: false,
                    allowSkip:true,
                    templateName:'setIconMultimediaTempl',
                    showToggle: false,
                    inputFields: {
                        iconMM: ko.observable(),
                        iconText: ko.observable(),
                        removeIcon: function (bccVM, iconUrl) {

                        }
                    },
                    onDone: function (bccVM, stepVM) {
                        if (stepVM.inputFields.iconText()) {
                            bccVM.iconText(stepVM.inputFields.iconText());
                        }
                    },
                    onBefore: function (bccVM, stepVM) {

                        //bccVM.mmManagementVM.load('/');
                        //tags already loaded as part of mm
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.iconText(bccVM.iconText());
                        // bccVM.mainVM.loadMMForBC([bccVM.mmTag]);
                    }
                }
                // {
                //     title:'Business Objectives',
                //     subTitle:'Define one or more objectives',
                //     completed: false,
                //     templateName:'createBCiBizObjTempl',
                //     showToggle: false,
                //     inputFields: {
                //         selectedMetrics: ko.observableArray([]),
                //         bizObjectives: ko.observableArray([]), //object array with items that are selectedThreshold, selectedMetric
                //         addBizObj: function(stepVM) {
                //             stepVM.inputFields.bizObjectives.push({
                //                 selectedThreshold: '',
                //                 selectedMetric: ''
                //             });
                //         },
                //         removeObjective: function(item, stepVM) {
                //             stepVM.inputFields.bizObjectives.remove(item);
                //         }
                //     },
                //     onDone: function (bccVM, stepVM) {
                //
                //         var completed = _.filter(stepVM.inputFields.bizObjectives(), function (val) {
                //             return (val.selectedThreshold && val.selectedMetric);
                //         });
                //         bccVM.selectedBizObjectives = completed;
                //     },
                //     onBefore: function (bccVM, stepVM) {
                //         bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //
                //             var result = res || [];
                //             stepVM.inputFields.selectedMetrics(result);
                //         })
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         var objectives = bccVM.selectedBizObjectives;
                //         stepVM.inputFields.bizObjectives(objectives);
                //
                //         bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //             var result = res || [];
                //             stepVM.inputFields.selectedMetrics(result);
                //         });
                //         // var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                //         //
                //         // var arrUnique = _.uniqWith(arr, function (val, val2) {
                //         //     return val.ds.id === val2.ds.id;
                //         // });
                //         // bccVM.getMetricsByBehAndChan(arrUnique);
                //         // stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
                //     }
                // },
                // {
                //     title:'Objectives',
                //     subTitle:'Define one or more objectives',
                //     completed: false,
                //     templateName:'createBCiObjTempl',
                //     showToggle: false,
                //     inputFields: {
                //         bizObjectives: ko.observableArray([]), //object array with items that are name, description, value
                //         addObjective: function(stepVM) {
                //             stepVM.inputFields.bizObjectives.push({
                //                 name: '',
                //                 description: '',
                //                 value: ''
                //             });
                //         },
                //         removeObjective: function(item, stepVM) {
                //             stepVM.inputFields.bizObjectives.remove(item);
                //         }
                //     },
                //     onDone: function (bccVM, stepVM) {
                //
                //         var completed = _.filter(stepVM.inputFields.bizObjectives(), function (val) {
                //             return (val.name && val.description && val.value);
                //         });
                //         bccVM.selectedBizObjectives = completed;
                //     },
                //     onBefore: function (bccVM, stepVM) {
                //         // bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //         //
                //         //     var result = res || [];
                //         //     stepVM.inputFields.selectedMetrics(result);
                //         // })
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         var objectives = bccVM.selectedObjectives;
                //         stepVM.inputFields.bizObjectives(objectives);
                //
                //         // bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //         //     var result = res || [];
                //         //     stepVM.inputFields.selectedMetrics(result);
                //         // });
                //         // var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                //         //
                //         // var arrUnique = _.uniqWith(arr, function (val, val2) {
                //         //     return val.ds.id === val2.ds.id;
                //         // });
                //         // bccVM.getMetricsByBehAndChan(arrUnique);
                //         // stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
                //     }
                // },

            ];
        } else if (bcName && bcName === 'StoreEngagementPlan') {
            return [
                {
                    title:'Name of the Campaign',
                    subTitle:'',
                    completed: false,
                    templateName:'createBCiNameTempl',
                    showToggle: false,
                    inputFields: {
                        bcName: ko.observable('')
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.bcName(stepVM.inputFields.bcName());
                    },
                    validationCheck: function(bccVM, stepVM) {
                        if (stepVM.inputFields.bcName() && stepVM.inputFields.bcName().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
                            return true;
                        }
                    },
                    onBefore: function(bccVM, stepVM) {
                        debugger;
                        stepVM.inputFields.bcName(bccVM.bcName());
                    },
                    validationErrorMessage: 'You must specify a unique name that is at least 2 characters long',
                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.bcName(bccVM.bcName());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.bcName(bccVM.bcName());
                    }
                },
                {
                    title: 'Describe the Campaign',
                    subTitle: '',
                    completed: false,
                    templateName: 'createBCiDescriptionTempl',
                    showToggle: false,
                    inputFields: {
                        bcDescription: ko.observable()
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.bcDescription(stepVM.inputFields.bcDescription());
                    },

                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.bcDescription(bccVM.bcDescription());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.bcDescription(bccVM.bcDescription());
                    }
                },
                {
                    title:'eServices',
                    subTitle:'Select one or more eServices',
                    completed: false,
                    templateName:'createBCiBehavioursTempl',
                    showToggle: false,
                    allowSkip:false,
                    inputFields: {
                        selectedBehaviours: ko.observableArray(),
                        availableBehaviours: ko.observableArray()
                    },
                    onDone: function (bccVM, stepVM) {
                        //behaviourIds
                        var behaviours = stepVM.inputFields.selectedBehaviours();
                        if (behaviours.length < 1) {
                            return;
                        }
                        var behaviourObjs = _.filter(bccVM.allBehaviours(), function(beh) {
                            return (behaviours.indexOf(beh.name) !== -1);
                        });
                        bccVM.selectedBehaviours(behaviourObjs);
                    },
                    onBefore: function (bccVM, stepVM) {

                        //available behaviours to select are filtered based on offer
                        var toFilter = ko.utils.unwrapObservable(bccVM.behavioursFromAssociatedBC);
                        var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
                        var filtered = _.differenceWith(allB, toFilter, function (val, val2) {
                            return (val && val2 && val.ds.id === val2.ds.id);
                        });
                        stepVM.inputFields.availableBehaviours(filtered);

                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        var selection = bccVM.selectedBehaviours();

                        var ids = _.map(selection,function (beh) {
                            return beh.name;
                        });

                        stepVM.inputFields.selectedBehaviours(ids);
                    }
                },
                {
                    title:'Multimedia',
                    subTitle:'Upload one or more image, video or audio file',
                    completed: false,
                    allowSkip:false,
                    templateName:'createBCiMultimediaTempl',
                    showToggle: false,
                    inputFields: {
                        videoMM:ko.observableArray([]),
                        imageMM:ko.observableArray([]),
                        docMM:ko.observableArray([])
                    },
                    onBefore: function (bccVM, stepVM) {

                        //bccVM.mmManagementVM.load('/');
                        //tags already loaded as part of mm
                    },
                    onUpdateLoad: function (bccVM, stepVM) {

                        // bccVM.mainVM.loadMMForBC([bccVM.mmTag]);
                    }
                },
                {
                    title:'Business Intelligence',
                    subTitle:'Select one or more business intelligence',
                    completed: false,
                    allowSkip:false,
                    templateName:'createBCiBusinessIntelTempl',
                    showToggle: false,
                    inputFields: {
                        selectedBI: ko.observableArray()
                    },
                    onDone: function (bccVM, stepVM) {
                        var bi = stepVM.inputFields.selectedBI();
                        if (bi.length < 1) {
                            bccVM.selectedBI([]);
                            return;
                        }
                        var selectedObj = _.filter(bccVM.allBusinessIntelligence(), function (i) {
                            return (bi.indexOf(i.name) !== -1);
                        });
                        bccVM.selectedBI(selectedObj);
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        //load selected
                        var ids = _.map(bccVM.selectedBI(), function (selection) {
                            return selection.name;
                        });
                        stepVM.inputFields.selectedBI(ids);
                    }
                },
                {
                    title:'Business Rules',
                    subTitle:'Select one or more business rules',
                    completed: false,
                    templateName:'createBCiBusinessRulesTempl',
                    showToggle: false,
                    allowSkip:false,
                    inputFields: {
                        selectedBRs: ko.observableArray([])
                    },
                    onDone: function (bccVM, stepVM) {
                        var brs = stepVM.inputFields.selectedBRs();
                        if (brs.length < 1) { //none selected
                            bccVM.selectedBRs([]);
                            return;
                        }
                        var brObjs = _.filter(bccVM.allBRs(), function(br) {
                            return (brs.indexOf(br.behRef) !== -1);
                        });
                        brObjs = brObjs || [];
                        bccVM.selectedBRs(brObjs);
                    },
                    onBefore: function (bccVM) {
                        //set available BRs for behaviours
                        bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
                        var brs = bccVM.selectedBRs() || [];
                        var brIds = _.map(brs, function (val) {
                            return val.behRef;
                        });
                        stepVM.inputFields.selectedBRs(brIds);
                    }
                },
                {
                    title:'Metrics',
                    subTitle:'Select one or more metrics',
                    completed: false,
                    templateName:'createBCiMetricsTempl',
                    showToggle: false,
                    inputFields: {
                        selectedMetricIds: ko.observableArray([])
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
                    },
                    onBefore: function (bccVM) {

                        //load metrics for behaviours from offer and selected ones
                        var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                        var arrUnique = _.uniqWith(arr, function (val, val2) {
                            return val.ds.id === val2.ds.id;
                        });
                        bccVM.getMetricsByBehAndChan(arrUnique);
                    },
                    onUpdateLoad: function (bccVM, stepVM) {


                        var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());

                        var arrUnique = _.uniqWith(arr, function (val, val2) {
                            return val.ds.id === val2.ds.id;
                        });
                        bccVM.getMetricsByBehAndChan(arrUnique);
                        stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
                    }
                },
                {
                    title:'Schedule',
                    subTitle:'Select a start and end date',
                    completed: false,
                    templateName:'createBCiSchedulePeriodTempl',
                    showToggle: false,
                    inputFields: {
                        scheduleModalVisible: ko.observable(false),
                        startDate: ko.observable(),
                        endDate: ko.observable(),
                        selectedStartTime: ko.observable(),
                        selectedEndTime: ko.observable(),
                        selectedStartDate: ko.observable(),
                        selectedEndDate: ko.observable(),
                        startDateOptions: {
                            dateFormat: 'yy-mm-dd'
                        },
                        endDateOptions: {
                            dateFormat: 'yy-mm-dd'
                        },
                        timeZone: ko.observable(Intl.DateTimeFormat().resolvedOptions().timeZone),
                        showScheduleModal: function(stepVM, bccVM) {
                            //set selectedStartDate, selectedStartTime, selectedStart to show in modal
                            if (stepVM.inputFields.startDate()) {

                                var sDate = moment(stepVM.inputFields.startDate(),moment.ISO_8601);
                                stepVM.inputFields.selectedStartDate(sDate.toDate());
                                var startTime = sDate.format('HH:mm');
                                stepVM.inputFields.selectedStartTime(startTime);
                            }
                            if (stepVM.inputFields.endDate() && stepVM.inputFields.endDate() !== 'never') {
                                var eDate = moment(stepVM.inputFields.endDate(),moment.ISO_8601);

                                stepVM.inputFields.selectedEndDate(eDate.toDate());
                                var endTime = eDate.format('HH:mm');
                                stepVM.inputFields.selectedEndTime(endTime);
                            }
                            stepVM.inputFields.scheduleModalVisible(true);
                        },
                        saveSchedule: function(stepVM) {
                            var startDate = stepVM.inputFields.selectedStartDate();
                            var startTime = stepVM.inputFields.selectedStartTime();

                            var endDate = stepVM.inputFields.selectedEndDate();
                            var endTime = stepVM.inputFields.selectedEndTime();


                            var startDateTime = null;

                            if (!startDate) { //default to right now
                                startDateTime = moment();
                            } else {
                                //build start date (js Date object)
                                startDateTime = moment(startDate);
                                if (startTime) {
                                    var sM = moment(startTime, 'HH:mm');

                                    startDateTime.hour(sM.hours());
                                    startDateTime.minutes(sM.minutes());
                                }


                            }
                            stepVM.inputFields.startDate(startDateTime);

                            if (endDate) {
                                //build end date (js Date object)
                                var endDateTime = moment(endDate);
                                if (endTime) {
                                    var eM = moment(endTime, 'HH:mm');
                                    endDateTime.hour(eM.hour());
                                    endDateTime.minutes(eM.minutes());
                                }
                                stepVM.inputFields.endDate(endDateTime);
                            }


                            stepVM.inputFields.scheduleModalVisible(false);

                        }
                    },
                    onDone: function (bccVM, stepVM) {

                        bccVM.startDate(stepVM.inputFields.startDate());
                        bccVM.endDate(stepVM.inputFields.endDate());
                    },
                    onUpdateLoad: function (bccVM, stepVM) {
                        stepVM.inputFields.startDate(bccVM.startDate());
                        stepVM.inputFields.endDate(bccVM.endDate());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.startDate(bccVM.startDate());
                        stepVM.inputFields.endDate(bccVM.endDate());
                    }
                },
                {
                    title:'Configure CMS',
                    subTitle:'Select one from the list',
                    completed: false,
                    templateName:'campaignSelectCMSTempl',
                    showToggle: false,
                    inputFields: {
                        availableCmsConfigurationModes: ko.observableArray([]),
                        selectedCmsCampaignConfiguration: ko.observable(),
                    },
                    onBefore: function (bccVM, stepVM) {
                        //set available BRs for behaviours
                        stepVM.inputFields.availableCmsConfigurationModes(bccVM.availableCmsConfigurationModes());
                    },
                    onDone: function (bccVM, stepVM) {
                        bccVM.selectedCmsCampaignConfiguration(stepVM.inputFields.selectedCmsCampaignConfiguration());
                    },
                    onUpdateLoad: function (bccVM, stepVM) {

                        stepVM.inputFields.selectedCmsCampaignConfiguration(bccVM.selectedCmsCampaignConfiguration());
                    },
                    onCancel: function(bccVM, stepVM) {
                        //reset name
                        stepVM.inputFields.selectedCmsCampaignConfiguration(bccVM.selectedCmsCampaignConfiguration());
                    }
                }
                // {
                //     title:'Business Objectives',
                //     subTitle:'Define one or more objectives',
                //     completed: false,
                //     templateName:'createBCiBizObjTempl',
                //     showToggle: false,
                //     inputFields: {
                //         selectedMetrics: ko.observableArray([]),
                //         bizObjectives: ko.observableArray([]), //object array with items that are selectedThreshold, selectedMetric
                //         addBizObj: function(stepVM) {
                //             stepVM.inputFields.bizObjectives.push({
                //                 selectedThreshold: '',
                //                 selectedMetric: ''
                //             });
                //         },
                //         removeObjective: function(item, stepVM) {
                //             stepVM.inputFields.bizObjectives.remove(item);
                //         }
                //     },
                //     onDone: function (bccVM, stepVM) {
                //
                //         var completed = _.filter(stepVM.inputFields.bizObjectives(), function (val) {
                //             return (val.selectedThreshold && val.selectedMetric);
                //         });
                //         bccVM.selectedBizObjectives = completed;
                //     },
                //     onBefore: function (bccVM, stepVM) {
                //         bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //
                //             var result = res || [];
                //             stepVM.inputFields.selectedMetrics(result);
                //         })
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         var objectives = bccVM.selectedBizObjectives;
                //         stepVM.inputFields.bizObjectives(objectives);
                //
                //         bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //             var result = res || [];
                //             stepVM.inputFields.selectedMetrics(result);
                //         });
                //         // var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                //         //
                //         // var arrUnique = _.uniqWith(arr, function (val, val2) {
                //         //     return val.ds.id === val2.ds.id;
                //         // });
                //         // bccVM.getMetricsByBehAndChan(arrUnique);
                //         // stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
                //     }
                // },
                // {
                //     title:'Objectives',
                //     subTitle:'Define one or more objectives',
                //     completed: false,
                //     templateName:'createBCiObjTempl',
                //     showToggle: false,
                //     inputFields: {
                //         bizObjectives: ko.observableArray([]), //object array with items that are name, description, value
                //         addObjective: function(stepVM) {
                //             stepVM.inputFields.bizObjectives.push({
                //                 name: '',
                //                 description: '',
                //                 value: ''
                //             });
                //         },
                //         removeObjective: function(item, stepVM) {
                //             stepVM.inputFields.bizObjectives.remove(item);
                //         }
                //     },
                //     onDone: function (bccVM, stepVM) {
                //
                //         var completed = _.filter(stepVM.inputFields.bizObjectives(), function (val) {
                //             return (val.name && val.description && val.value);
                //         });
                //         bccVM.selectedBizObjectives = completed;
                //     },
                //     onBefore: function (bccVM, stepVM) {
                //         // bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //         //
                //         //     var result = res || [];
                //         //     stepVM.inputFields.selectedMetrics(result);
                //         // })
                //     },
                //     onUpdateLoad: function (bccVM, stepVM) {
                //         var objectives = bccVM.selectedObjectives;
                //         stepVM.inputFields.bizObjectives(objectives);
                //
                //         // bccVM.retrieveMetricDetails(bccVM.selectedMetrics, function (err, res) {
                //         //     var result = res || [];
                //         //     stepVM.inputFields.selectedMetrics(result);
                //         // });
                //         // var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
                //         //
                //         // var arrUnique = _.uniqWith(arr, function (val, val2) {
                //         //     return val.ds.id === val2.ds.id;
                //         // });
                //         // bccVM.getMetricsByBehAndChan(arrUnique);
                //         // stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
                //     }
                // },

            ];
        } else {
            return new Error('No workflow is configured for the BC');
        }
    };

    // self._resolveStepsUpdate = function(bcName) {
    //
    //     if (bcName && bcName === 'StoreEngagementPlan') {
    //         return [
    //             {
    //                 title:'Name of the Channel',
    //                 subTitle:'',
    //                 completed: false,
    //                 templateName:'createBCiNameTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     bcName: ko.observable()
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     bccVM.bcName(stepVM.inputFields.bcName());
    //                 },
    //                 validationCheck: function(bccVM, stepVM) {
    //                     if (stepVM.inputFields.bcName() && stepVM.inputFields.bcName().trim().length > 1 && (!bccVM.checkDuplicateName(stepVM.inputFields.bcName()))) {
    //                         return true;
    //                     }
    //                 },
    //                 validationErrorMessage: 'You must specify a unique campaign name that is at least 2 characters long',
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     stepVM.inputFields.bcName(bccVM.bcName());
    //                 },
    //                 onCancel: function(bccVM, stepVM) {
    //                     //reset name
    //                     stepVM.inputFields.bcName(bccVM.bcName());
    //                 }
    //             },
    //             {
    //                 title: 'Describe the Channel',
    //                 subTitle: '',
    //                 completed: false,
    //                 templateName: 'createBCiDescriptionTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     bcDescription: ko.observable()
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     bccVM.bcDescription(stepVM.inputFields.bcDescription());
    //                 },
    //
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     stepVM.inputFields.bcDescription(bccVM.bcDescription());
    //                 },
    //                 onCancel: function(bccVM, stepVM) {
    //                     //reset name
    //                     stepVM.inputFields.bcDescription(bccVM.bcDescription());
    //                 }
    //             },
    //             // {
    //             //     title: 'Select Behaviour for the Channel',
    //             //     subTitle: '',
    //             //     completed: false,
    //             //     templateName: 'createBCiTPNatureTempl',
    //             //     showToggle: false,
    //             //     inputFields: {
    //             //         selectedMode: ko.observable()
    //             //     },
    //             //     onDone: function (bccVM, stepVM) {
    //             //         bccVM.bcDescription(stepVM.inputFields.bcDescription());
    //             //     },
    //             //
    //             //     onUpdateLoad: function (bccVM, stepVM) {
    //             //         stepVM.inputFields.bcDescription(bccVM.bcDescription());
    //             //     },
    //             //     onCancel: function(bccVM, stepVM) {
    //             //         //reset name
    //             //         stepVM.inputFields.bcDescription(bccVM.bcDescription());
    //             //     }
    //             // },
    //             {
    //                 title:'Programs',
    //                 subTitle:'Select Programs',
    //                 completed: false,
    //                 templateName:'createBCiSelectMultipleBCsTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     selectedAssociatedBCs: ko.observableArray(),
    //                     availableAssociatedBCs: ko.observableArray(),
    //                     description: ko.observable()
    //                 },
    //                 onBefore: function (bccVM, stepVM) {
    //                     //available BCs to select
    //                     var toFilter = ko.utils.unwrapObservable(bccVM.associatedBCs);
    //                     var filtered = _.filter(toFilter, {'type': 'MerchandisingCampaign'});
    //                     stepVM.inputFields.availableAssociatedBCs(filtered);
    //
    //                 },
    //                 // validationCheck: function(bccVM, stepVM) {
    //                 //     return true;
    //                 //     // if (stepVM.inputFields.selectedAssociatedBCs().length > 0) {
    //                 //     //     return true;
    //                 //     // }
    //                 // },
    //                 //  validationErrorMessage: 'You must select at least one campaign',
    //                 onCancel: function(bccVM, stepVM) {
    //                     var toFilter = ko.utils.unwrapObservable(bccVM.selectedAssociatedBCs);
    //                     var selection = _.filter(toFilter, {'type': 'MerchandisingCampaign'});
    //
    //                     // var beh = (selection && selection.associatedBehaviours ? selection.associatedBehaviours : []);
    //                     // var br = (selection && selection.associatedBRs ? selection.associatedBRs : []);
    //                     stepVM.inputFields.selectedAssociatedBCs(_.map(selection, 'id'));
    //                     // bccVM.behavioursFromAssociatedBC(beh);
    //                     // bccVM.brsFromAssociatedBC(br);
    //
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     //behaviourIds
    //                     var bcs = stepVM.inputFields.selectedAssociatedBCs();
    //                     // if (bcs.length < 1) {
    //                     //     return;
    //                     // }
    //
    //                     var bcObjs = _.filter(stepVM.inputFields.availableAssociatedBCs(), function (b) {
    //                         return (bcs.indexOf(b.id) !== -1);
    //                     });
    //
    //                     var toFilter = ko.utils.unwrapObservable(bccVM.selectedAssociatedBCs);
    //                     var filtered = _.reject(toFilter, {'type': 'MerchandisingCampaign'});
    //
    //                     //combine all types together
    //                     var objs = filtered.concat(bcObjs);
    //
    //
    //                     bccVM.selectedAssociatedBCs(objs);
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //
    //                     var toFilter = ko.utils.unwrapObservable(bccVM.selectedAssociatedBCs);
    //                     var selection = _.filter(toFilter, {'type': 'MerchandisingCampaign'});
    //
    //
    //                     var ids = _.map(selection, function (beh) {
    //                         return beh.id;
    //                     });
    //                     //stepVM.inputFields.availableAssociatedBCs(bccVM.availableAssociatedBCs);
    //                     stepVM.inputFields.selectedAssociatedBCs(ids);
    //                 }
    //             },
    //             {
    //                 title:'Channel',
    //                 subTitle:'Configure Channel',
    //                 completed: false,
    //                 templateName:'createBCCChannelTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     selectedTouchpoints: ko.observableArray(),
    //                     selectedChannelType: ko.observable(),
    //                     selectedChannelTypeId: ko.observable(),
    //                     pendingChannelUrl: ko.observable(),
    //                     disableInput: ko.observable(false)
    //                     // saveSelectedTP: function(self) {
    //                     //     self.inputFields.selectedTouchpoints.push({channelType: self.inputFields.selectedChannelType(), channelTypeId: self.inputFields.selectedChannelTypeId(), channelUrl: self.inputFields.pendingChannelUrl(), name: self.inputFields.pendingTouchpointName()});
    //                     // }
    //                 },
    //                 // onBefore: function (bccVM, stepVM) {
    //                 //     //available BCs to select
    //                 //
    //                 //
    //                 //     var toFilter = ko.utils.unwrapObservable(bccVM.associatedBCs);
    //                 //     var filtered = _.filter(toFilter, {'type': 'MerchandisingCampaign'});
    //                 //     stepVM.inputFields.availableAssociatedBCs(filtered);
    //                 //
    //                 // },
    //                 validationCheck: function(bccVM, stepVM) {
    //                     return (stepVM.inputFields.pendingChannelUrl() && stepVM.inputFields.pendingChannelUrl().length > 0);
    //                 },
    //                 validationErrorMessage: 'You must enter a valid channel url',
    //                 onDone: function (bccVM, stepVM) {
    //
    //
    //                     //if an update then just ignore
    //                     if (stepVM.inputFields.disableInput() !== true) {
    //
    //                         //grab channel type for bcc (which is ucc still)
    //                         var channelType = 'ucc';
    //                         var channelTypeId = bccVM.mainVM.touchpointTypes()[channelType].channelTypeId;
    //
    //
    //                         //load channel types, id etc, take name from BC name
    //                         stepVM.inputFields.selectedTouchpoints.push({
    //                             channelType: channelType,
    //                             channelTypeId: channelTypeId,
    //                             channelUrl: stepVM.inputFields.pendingChannelUrl(),
    //                             name: bccVM.bcName()
    //                         });
    //
    //                         bccVM.tpsFromBCDef(ko.utils.unwrapObservable(stepVM.inputFields.selectedTouchpoints));
    //                     }
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     //load selected
    //                     //load selected
    //                     var tps = ko.utils.unwrapObservable(bccVM.tpsFromBCDef);
    //                     if (tps.length > 0 && tps[0].tpInfo) {
    //                         stepVM.inputFields.pendingChannelUrl(tps[0].tpInfo.tpURL);
    //                         stepVM.inputFields.disableInput(true);
    //                     }
    //                 }
    //
    //             },
    //             {
    //                 title:'eServices',
    //                 subTitle:'Select one or more eServices',
    //                 completed: false,
    //                 templateName:'createBCiBehavioursTempl',
    //                 showToggle: false,
    //                 allowSkip:false,
    //                 inputFields: {
    //                     selectedBehaviours: ko.observableArray(),
    //                     availableBehaviours: ko.observableArray()
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     //behaviourIds
    //                     var behaviours = stepVM.inputFields.selectedBehaviours();
    //                     if (behaviours.length < 1) {
    //                         return;
    //                     }
    //                     var behaviourObjs = _.filter(bccVM.allBehaviours(), function(beh) {
    //                         return (behaviours.indexOf(beh.name) !== -1);
    //                     });
    //                     bccVM.selectedBehaviours(behaviourObjs);
    //                 },
    //                 onBefore: function (bccVM, stepVM) {
    //                     //available behaviours to select are filtered based on offer
    //                     var toFilter = ko.utils.unwrapObservable(bccVM.behavioursFromAssociatedBC);
    //                     var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
    //                     var filtered = _.differenceWith(allB, toFilter, function (val, val2) {
    //                         return (val && val2 && val.ds.id === val2.ds.id);
    //                     });
    //                     stepVM.inputFields.availableBehaviours(filtered);
    //
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     var selection = bccVM.selectedBehaviours();
    //
    //                     var ids = _.map(selection,function (beh) {
    //                         return beh.name;
    //                     });
    //
    //                     stepVM.inputFields.selectedBehaviours(ids);
    //                 }
    //             },
    //             {
    //                 title:'Multimedia',
    //                 subTitle:'Upload one or more image, video or audio file',
    //                 completed: false,
    //                 allowSkip:false,
    //                 templateName:'createBCiMultimediaTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     videoMM:ko.observableArray([]),
    //                     imageMM:ko.observableArray([]),
    //                     docMM:ko.observableArray([])
    //                 },
    //                 onBefore: function (bccVM, stepVM) {
    //                     //bccVM.mmManagementVM.load('/');
    //                     //tags already loaded as part of mm
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     // bccVM.mainVM.loadMMForBC([bccVM.mmTag]);
    //                 }
    //             },
    //             {
    //                 title:'Multimedia Tagging',
    //                 subTitle:'Select zero or more tags for your multimedia',
    //                 completed: false,
    //                 allowSkip:false,
    //                 templateName:'tagBCiMultimediaTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     availableFilesAndTags: ko.observableArray([]),
    //                     selectedFilesAndTags: ko.observableArray([]),
    //                     availableMM: ko.observableArray([])
    //                 },
    //                 onBefore: function (bccVM, stepVM) {
    //
    //                     stepVM.inputFields.availableFilesAndTags(bccVM.selectedMMAndTags);
    //                     stepVM.inputFields.availableMM([]);
    //                     var arr  = [];
    //
    //                     _.each(bccVM.mainVM.videoMM(), function (val) {
    //
    //
    //                         var selectedTags = _
    //                             .chain(stepVM.inputFields.availableFilesAndTags())
    //                             .filter(function (av) {
    //                                 return (av.url === val);
    //                             })
    //                             .head()
    //                             .at('tags')
    //                             .flatten()
    //                             .filter(function (tagVal) {
    //                                 return (bccVM.availableTags().indexOf(tagVal) > -1);
    //                             })
    //                             .value();
    //
    //
    //                         var key = _
    //                             .chain(stepVM.inputFields.availableFilesAndTags())
    //                             .filter(function (av) {
    //                                 return (av.url === val);
    //                             })
    //                             .head()
    //                             .at('key')
    //                             .head()
    //                             .value();
    //
    //                         arr.push({type:ko.observable('Video'), key:key, fileName:ko.observable(val),selectedTags:ko.observableArray(selectedTags)});
    //                     });
    //
    //                     _.each(bccVM.mainVM.imageMM(), function (val) {
    //                         var selectedTags = _
    //                             .chain(stepVM.inputFields.availableFilesAndTags())
    //                             .filter(function (av) {
    //                                 return (av.url === val);
    //                             })
    //                             .head()
    //                             .at('tags')
    //                             .flatten()
    //                             .filter(function (tagVal) {
    //                                 return (bccVM.availableTags().indexOf(tagVal) > -1);
    //                             })
    //                             .value();
    //
    //                         var key = _
    //                             .chain(stepVM.inputFields.availableFilesAndTags())
    //                             .filter(function (av) {
    //                                 return (av.url === val);
    //                             })
    //                             .head()
    //                             .at('key')
    //                             .head()
    //                             .value();
    //
    //                         arr.push({type:ko.observable('Image'), key:key, fileName:ko.observable(val),selectedTags:ko.observableArray(selectedTags)});
    //                     });
    //
    //                     _.each(bccVM.mainVM.docMM(), function (val) {
    //                         var selectedTags = _
    //                             .chain(stepVM.inputFields.availableFilesAndTags())
    //                             .filter(function (av) {
    //                                 return (av.url === val);
    //                             })
    //                             .head()
    //                             .at('tags')
    //                             .flatten()
    //                             .filter(function (tagVal) {
    //                                 return (bccVM.availableTags().indexOf(tagVal) > -1);
    //                             })
    //                             .value();
    //
    //                         var key = _
    //                             .chain(stepVM.inputFields.availableFilesAndTags())
    //                             .filter(function (av) {
    //                                 return (av.url === val);
    //                             })
    //                             .head()
    //                             .at('key')
    //                             .head()
    //                             .value();
    //
    //                         arr.push({type:ko.observable('Document'), key:key, fileName:ko.observable(val), selectedTags:ko.observableArray(selectedTags)});
    //                     });
    //
    //                     stepVM.inputFields.availableMM(arr);
    //
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     //update and create are treated the same as the user defined MM tags are independent of the BC
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     //map (type,key,fileName,selectedTags) -> (key, url, tags)
    //                     //not to filter out app tags in originalMMandTags
    //                     var mapped = _.map(stepVM.inputFields.availableMM(), function (val) {
    //                         return {
    //                             key:val.key,
    //                             url: val.fileName(),
    //                             tags: val.selectedTags() || []
    //                         };
    //                     });
    //                     bccVM.selectedMMAndTags = mapped;
    //                 }
    //             },
    //             {
    //                 title:'Business Intelligence',
    //                 subTitle:'Select one or more business intelligence',
    //                 completed: false,
    //                 allowSkip:false,
    //                 templateName:'createBCiBusinessIntelTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     selectedBI: ko.observableArray()
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     var bi = stepVM.inputFields.selectedBI();
    //                     if (bi.length < 1) {
    //                         bccVM.selectedBI([]);
    //                         return;
    //                     }
    //                     var selectedObj = _.filter(bccVM.allBusinessIntelligence(), function (i) {
    //                         return (bi.indexOf(i.name) !== -1);
    //                     });
    //                     bccVM.selectedBI(selectedObj);
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     //load selected
    //                     var ids = _.map(bccVM.selectedBI(), function (selection) {
    //                         return selection.name;
    //                     });
    //                     stepVM.inputFields.selectedBI(ids);
    //                 }
    //             },
    //             {
    //                 title:'Business Rules',
    //                 subTitle:'Select one or more business rules',
    //                 completed: false,
    //                 templateName:'createBCiBusinessRulesTempl',
    //                 showToggle: false,
    //                 allowSkip:false,
    //                 inputFields: {
    //                     selectedBRs: ko.observableArray([])
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     var brs = stepVM.inputFields.selectedBRs();
    //                     if (brs.length < 1) { //none selected
    //                         bccVM.selectedBRs([]);
    //                         return;
    //                     }
    //                     var brObjs = _.filter(bccVM.allBRs(), function(br) {
    //                         return (brs.indexOf(br.behRef) !== -1);
    //                     });
    //                     brObjs = brObjs || [];
    //                     bccVM.selectedBRs(brObjs);
    //                 },
    //                 onBefore: function (bccVM) {
    //                     //set available BRs for behaviours
    //                     bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
    //                     var brs = bccVM.selectedBRs() || [];
    //                     var brIds = _.map(brs, function (val) {
    //                         return val.behRef;
    //                     });
    //                     stepVM.inputFields.selectedBRs(brIds);
    //                 }
    //             },
    //             // {
    //             //     title:'Metrics',
    //             //     subTitle:'Select one or more metrics',
    //             //     completed: false,
    //             //     templateName:'createBCiMetricsTempl',
    //             //     showToggle: false,
    //             //     inputFields: {
    //             //         selectedMetricIds: ko.observableArray([])
    //             //     },
    //             //     onDone: function (bccVM, stepVM) {
    //             //         bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
    //             //     },
    //             //     onBefore: function (bccVM) {
    //             //         //load metrics for behaviours from offer and selected ones
    //             //         var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
    //             //         var arrUnique = _.uniqWith(arr, function (val, val2) {
    //             //             return val.ds.id === val2.ds.id;
    //             //         });
    //             //         bccVM.getMetricsByBehAndChan(arrUnique);
    //             //     },
    //             //     onUpdateLoad: function (bccVM, stepVM) {
    //             //
    //             //         var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
    //             //
    //             //         var arrUnique = _.uniqWith(arr, function (val, val2) {
    //             //             return val.ds.id === val2.ds.id;
    //             //         });
    //             //
    //             //
    //             //         bccVM.getMetricsByBehAndChan(arrUnique);
    //             //
    //             //         stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
    //             //     }
    //             // }
    //
    //         ];
    //     } else if (bcName && bcName === 'EngagementPlan') {
    //         return [
    //             {
    //                 title: 'Describe the Campaign',
    //                 subTitle: '',
    //                 completed: false,
    //                 templateName: 'createBCiDescriptionTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     bcDescription: ko.observable()
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     bccVM.bcDescription(stepVM.inputFields.bcDescription());
    //                 },
    //
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     stepVM.inputFields.bcDescription(bccVM.bcDescription());
    //                 },
    //                 onCancel: function(bccVM, stepVM) {
    //                     //reset name
    //                     stepVM.inputFields.bcDescription(bccVM.bcDescription());
    //                 }
    //             },
    //             {
    //                 title:'eServices',
    //                 subTitle:'Select one or more eServices',
    //                 completed: false,
    //                 templateName:'createBCiBehavioursTempl',
    //                 showToggle: false,
    //                 allowSkip:false,
    //                 inputFields: {
    //                     selectedBehaviours: ko.observableArray(),
    //                     availableBehaviours: ko.observableArray()
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     //behaviourIds
    //                     var behaviours = stepVM.inputFields.selectedBehaviours();
    //                     if (behaviours.length < 1) {
    //                         return;
    //                     }
    //                     var behaviourObjs = _.filter(bccVM.allBehaviours(), function(beh) {
    //                         return (behaviours.indexOf(beh.name) !== -1);
    //                     });
    //                     bccVM.selectedBehaviours(behaviourObjs);
    //                 },
    //                 onBefore: function (bccVM, stepVM) {
    //                     //available behaviours to select are filtered based on offer
    //                     var toFilter = ko.utils.unwrapObservable(bccVM.behavioursFromAssociatedBC);
    //                     var allB = ko.utils.unwrapObservable(bccVM.allBehaviours);
    //                     var filtered = _.differenceWith(allB, toFilter, function (val, val2) {
    //                         return (val && val2 && val.ds.id === val2.ds.id);
    //                     });
    //                     stepVM.inputFields.availableBehaviours(filtered);
    //
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     var selection = bccVM.selectedBehaviours();
    //
    //                     var ids = _.map(selection,function (beh) {
    //                         return beh.name;
    //                     });
    //
    //                     stepVM.inputFields.selectedBehaviours(ids);
    //                 }
    //             },
    //             {
    //                 title:'Touchpoints',
    //                 subTitle:'Select a touchpoint',
    //                 completed: false,
    //                 templateName:'createBCiTouchpointsTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     selectedBCCTouchpoints: ko.observableArray(),
    //                     //for non-bcc
    //                     selectedTouchpoints: ko.observableArray(),
    //                     showAddTouchpoint: ko.observable(false),
    //                     selectedChannelType: ko.observable(),
    //                     selectedChannelTypeId: ko.observable(),
    //                     pendingChannelUrl: ko.observable(),
    //                     showChannelAuthorization: ko.observable(false),
    //                     selectedChannelTypeObj: ko.observable(),
    //                     pendingTouchpointName: ko.observable(),
    //                     availableBCCEnabled: ko.observableArray([]),
    //                     channelAuthorizationUrl: ko.observable(),
    //                     availableChannelList: ko.observableArray([]),
    //                     showAddNewTouchpoint: function(self, channelTypeInfo) {
    //
    //                         self.inputFields.pendingChannelUrl('');
    //                         self.inputFields.pendingTouchpointName('');
    //
    //                         self.inputFields.selectedChannelType(channelTypeInfo.name);
    //
    //                         self.inputFields.selectedChannelTypeObj(channelTypeInfo);
    //                         self.inputFields.selectedChannelTypeId(channelTypeInfo.channelTypeId);
    //
    //                         //if (channelTypeInfo.showAuthorization) {
    //                         if (channelTypeInfo.requiresAuthorization) {
    //                             self.inputFields.showChannelAuthorization(true);
    //                         }
    //                         self.inputFields.showAddTouchpoint(true);
    //
    //                     },
    //                     showAuthorizationWindow: function(stepVM, authUrl) {
    //
    //
    //                         //callback code to verify the window was the one opened from here
    //                         var cbCode = joint.util.uuid();
    //
    //                         var cb = function() {
    //
    //                             //get pages
    //                             var resultStr = $('#tpAuthResult').val();
    //
    //
    //                             try {
    //                                 var result = JSON.parse(resultStr);
    //                                 var list = _.map(result, function(val){
    //                                     var res = val;
    //                                     res.channelUrl = res.channelUrl.replace(' ', '');
    //                                     return res;
    //                                 });
    //                                 stepVM.inputFields.availableChannelList(list);
    //                             }catch (e) {
    //                             }
    //                         };
    //                         //append
    //                         if (authUrl.indexOf('?') > 0) {
    //                             authUrl = authUrl + '&cbCode='+cbCode;
    //                         }else {
    //                             authUrl =  authUrl +'?cbCode='+cbCode;
    //                         }
    //
    //                         var options = {path: authUrl, windowOptions: 'location=0,status=0,width=800,height=400', callback:cb};
    //
    //                         var oauthWindow   = window.open(options.path, 'Connect', options.windowOptions);
    //                         var oauthInterval = window.setInterval(function(){
    //                             if(oauthWindow) {
    //                                 if (oauthWindow.closed) {
    //
    //                                     clearInterval(oauthInterval);
    //                                     cb();
    //
    //                                 }
    //                             }
    //                         }, 1000);
    //                     },
    //                     saveSelectedExistingBCCTP: function (self, tpInfo) {
    //                         var found = _.find(self.inputFields.selectedBCCTouchpoints(), function(val) {
    //                             return (val.bcc && val.tpInfo && val.tpInfo.tpId === tpInfo.tpId);
    //                         });
    //                         if (!found) {
    //                             self.inputFields.selectedTouchpoints.push({tpInfo: tpInfo, channelType: tpInfo.tpType});
    //                         }
    //                     },
    //                     saveSelectedExistingTP: function (self, tpInfo) {
    //                         var found = _.find(self.inputFields.selectedTouchpoints(), function(val) {
    //                             return (val.tpInfo && val.tpInfo.tpId === tpInfo.tpId);
    //                         });
    //                         if (!found) {
    //                             self.inputFields.selectedTouchpoints.push({tpInfo: tpInfo, channelType: tpInfo.tpType});
    //                         }
    //                     },
    //                     saveSelectedTP: function(self) {
    //                         self.inputFields.selectedTouchpoints.push({channelType: self.inputFields.selectedChannelType(), channelTypeId: self.inputFields.selectedChannelTypeId(), channelUrl: self.inputFields.pendingChannelUrl(), name: self.inputFields.pendingTouchpointName()});
    //                     },
    //                     removeSelectedTP: function(self, info) {
    //                         self.inputFields.selectedTouchpoints.remove(function(tp) {
    //                             if (info.tpInfo) {
    //                                 return (tp.tpInfo.tpId === info.tpInfo.tpId);
    //                             }else {
    //                                 var url1 = ko.utils.unwrapObservable(tp.channelUrl);
    //                                 var url2 = ko.utils.unwrapObservable(info.channelUrl);
    //                                 return (url1 === url2);
    //                             }
    //                         });
    //                     }
    //                 },
    //                 onBefore: function(bccVM, stepVM) {
    //
    //                     //load channel types based on the configuration
    //                     //get authorization url
    //
    //                     var available = _.map(bccVM.mainVM.touchpointKeys(), function (id) {
    //                         return bccVM.mainVM.touchpointTypes()[id];
    //                     });
    //
    //                     var availableBCCEnabled = _.reject(available, function (item) {
    //                         return (item.name === 'ucc' || item.name === 'bcc');
    //                     });
    //
    //                     async.map(availableBCCEnabled, function (item, cb) {
    //                         dexit.app.ice.integration.tpm.retrieveChannelType(item.channelTypeId, function (err, data) {
    //                             if (err) {
    //                                 return cb(err);
    //                             }
    //                             cb(null,_.extend(item, {'extendedInfo':data}));
    //                         });
    //                     }, function (err, result) {
    //                         if (err) {
    //                             //TODO:
    //                             alert('Error loading the available BCC Enabled Touchpoints');
    //                         }else {
    //
    //
    //                             stepVM.inputFields.availableBCCEnabled(result);
    //                             //stepVM.inputFields.channelTypesInfo(result);
    //                         }
    //
    //                     });
    //                 },
    //                 validationCheck: function(bccVM, stepVM) {
    //                     return (stepVM.inputFields.selectedTouchpoints && stepVM.inputFields.selectedTouchpoints().length > 0);
    //                 },
    //                 validationErrorMessage: 'You must use atleast one touchpoint',
    //                 onDone: function (bccVM, stepVM) {
    //                     bccVM.tpsFromBCDef(ko.utils.unwrapObservable(stepVM.inputFields.selectedTouchpoints));
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //
    //                     stepVM.inputFields.showChannelAuthorization(false);
    //                     //load selected
    //                     stepVM.inputFields.selectedTouchpoints(ko.utils.unwrapObservable(bccVM.tpsFromBCDef));
    //                 }
    //
    //             },
    //             {
    //                 title:'Multimedia',
    //                 subTitle:'Upload one or more image, video or audio file',
    //                 completed: false,
    //                 allowSkip:false,
    //                 templateName:'createBCiMultimediaTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     videoMM:ko.observableArray([]),
    //                     imageMM:ko.observableArray([]),
    //                     docMM:ko.observableArray([])
    //                 },
    //                 onBefore: function (bccVM, stepVM) {
    //                     //bccVM.mmManagementVM.load('/');
    //                     //tags already loaded as part of mm
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     // bccVM.mainVM.loadMMForBC([bccVM.mmTag]);
    //                 }
    //             },
    //             {
    //                 title:'Business Intelligence',
    //                 subTitle:'Select one or more business intelligence',
    //                 completed: false,
    //                 allowSkip:false,
    //                 templateName:'createBCiBusinessIntelTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     selectedBI: ko.observableArray()
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     var bi = stepVM.inputFields.selectedBI();
    //                     if (bi.length < 1) {
    //                         bccVM.selectedBI([]);
    //                         return;
    //                     }
    //                     var selectedObj = _.filter(bccVM.allBusinessIntelligence(), function (i) {
    //                         return (bi.indexOf(i.name) !== -1);
    //                     });
    //                     bccVM.selectedBI(selectedObj);
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     //load selected
    //                     var ids = _.map(bccVM.selectedBI(), function (selection) {
    //                         return selection.name;
    //                     });
    //                     stepVM.inputFields.selectedBI(ids);
    //                 }
    //             },
    //             {
    //                 title:'Business Rules',
    //                 subTitle:'Select one or more business rules',
    //                 completed: false,
    //                 templateName:'createBCiBusinessRulesTempl',
    //                 showToggle: false,
    //                 allowSkip:false,
    //                 inputFields: {
    //                     selectedBRs: ko.observableArray([])
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     var brs = stepVM.inputFields.selectedBRs();
    //                     if (brs.length < 1) { //none selected
    //                         bccVM.selectedBRs([]);
    //                         return;
    //                     }
    //                     var brObjs = _.filter(bccVM.allBRs(), function(br) {
    //                         return (brs.indexOf(br.behRef) !== -1);
    //                     });
    //                     brObjs = brObjs || [];
    //                     bccVM.selectedBRs(brObjs);
    //                 },
    //                 onBefore: function (bccVM) {
    //                     //set available BRs for behaviours
    //                     bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //                     bccVM.allBRs(bccVM.getBRsByBeh(bccVM.allBehaviours()));
    //                     var brs = bccVM.selectedBRs() || [];
    //                     var brIds = _.map(brs, function (val) {
    //                         return val.behRef;
    //                     });
    //                     stepVM.inputFields.selectedBRs(brIds);
    //                 }
    //             },
    //             {
    //                 title:'Metrics',
    //                 subTitle:'Select one or more metrics',
    //                 completed: false,
    //                 templateName:'createBCiMetricsTempl',
    //                 showToggle: false,
    //                 inputFields: {
    //                     selectedMetricIds: ko.observableArray([])
    //                 },
    //                 onDone: function (bccVM, stepVM) {
    //                     bccVM.selectedMetrics = stepVM.inputFields.selectedMetricIds();
    //                 },
    //                 onBefore: function (bccVM) {
    //
    //                     //load metrics for behaviours from offer and selected ones
    //                     var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
    //                     var arrUnique = _.uniqWith(arr, function (val, val2) {
    //                         return val.ds.id === val2.ds.id;
    //                     });
    //                     bccVM.getMetricsByBehAndChan(arrUnique);
    //                 },
    //                 onUpdateLoad: function (bccVM, stepVM) {
    //
    //                     var arr = bccVM.selectedBehaviours().concat(bccVM.behavioursFromAssociatedBC());
    //
    //                     var arrUnique = _.uniqWith(arr, function (val, val2) {
    //                         return val.ds.id === val2.ds.id;
    //                     });
    //                     bccVM.getMetricsByBehAndChan(arrUnique);
    //                     stepVM.inputFields.selectedMetricIds(bccVM.selectedMetrics);
    //                 }
    //             }
    //         ];
    //
    //     } else {
    //         return new Error('No workflow is configured for the BC');
    //     }
    // };


    /**
     * builds steps
     * @param {string} [mode]
     * @private
     */
    self._populateSteps = function (mode) {
        debugger;

        var steps = self._resolveSteps(self.currBCType, mode);
        if (steps instanceof Error) {
            self.hideCreate();
            return;
        }

        var hideEdit = (self.approved() ? true : false);

        var stepsVM = steps.map(function (step, index) {
            var params = {
                stepNumber: (index+1),
                currentStepNumber: self.currentStepNumber,
                showListView: self.showSummaryView,
                title:step.title,
                hideEdit: hideEdit,
                allowSkip: step.allowSkip || false,
                subTitle: step.subTitle,
                completed:step.completed,
                templateName:step.templateName,
                showToggle: step.showToggle,
                inputFields: step.inputFields || {},
                validationCheck: step.validationCheck,
                validationErrorMessage: step.validationErrorMessage,
                onDone: step.onDone,
                onBefore: step.onBefore,
                onUpdateLoad: step.onUpdateLoad,
                onCancel: step.onCancel
            };
            return new dexit.app.ice.BCCreationStepVM(params);
        });

        self.stepsVM(stepsVM);


    };

    self.cancelStep = function (stepData) {
        var currNum = self.currentStepNumber();
        var currStep = self.stepsVM()[currNum-1];
        currStep.cancel();
        // currStep.onCancel(self, currStep);

        currStep.onUpdateLoad(self,currStep);

        //go back to first step on cancel
        self.currentStepNumber(0);

    };

    /**
     *
     * @param {objectt} stepData
     * @param {boolean} [skip=false]
     */
    self.nextStep = function(stepData, skip) {




        var currNum = self.currentStepNumber();
        //step number starts at 1 and array starts at 0
        var currStep = self.stepsVM()[currNum-1];
        //validate step
        var pass = (skip ? true : currStep.validationCheck(self, currStep));
        if (!pass) {
            currStep.showValidationError(true);
            return;
        }
        currStep.showValidationError(false);
        //run any onDone functions for current ste

        if (!skip) {
            currStep.onDone(self, currStep);
        }
        currStep.completed(true);
        currStep.isEditing(false);

        var stepCount = self.stepsVM().length;

        var newNumber = (currNum +1);

        if (currNum < stepCount) {
            var newStep = self.stepsVM()[newNumber-1];
            newStep.onBefore(self,newStep);
            self.currentStepNumber((currNum +1));
        }else {
            self.currentStepNumber((currNum +1));
            self.showSummaryView(true);


            if (self.editMode() ===  true) {
                var changes = self.calculateChanges();
                if (changes.length > 0) {
                    self.changesMade(true);
                    self.changes = changes;
                }
            }

        }
        self.showNotificationForEditAdd(false);

    };



    //calculate changes
    function calculateChangesArr(original, updated, path, comparator, skip) {
        var chs = [];
        var removed = _.differenceWith(original,updated, comparator);
        var added = _.differenceWith(updated, original,comparator);
        if (removed && removed.length > 0) {
            var rem = {op:'remove', path:path, value:removed};
            if (skip) {
                rem.skip = true;
            }
            chs.push(rem);

        }
        if (added && added.length > 0) {
            var add = {op:'add', path:path, value:added};
            if (skip) {
                add.skip = true;
            }
            chs.push(add);
        }
        return chs;

    }


    self.calculateChanges = function () {

        var changes = [];
        var metricsChanged = false;

        //calculate changes
        if (self.originalBcName && self.originalBcName !== self.bcName() ) {
            changes.push({op:'replace', path:'/property/name', value:self.bcName()});
        }

        if (self.originalIconText && self.originalIconText !== self.iconText() ) {
            changes.push({op:'replace', path:'/property/iconText', value:self.iconText()});
        }

        //calculate changes
        if (self.originalBcDescription && self.originalBcDescription !== self.bcDescription() ) {
            changes.push({op:'replace', path:'/property/description', value:self.bcDescription()});
        }



        if (self.originalStartDate && self.startDate() &&  !self.startDate().isSame(self.originalStartDate)) {
            changes.push({op:'replace', path:'/start-date', value:self.startDate()});
            debugger;
        }
        if (!self.originalStartDate && self.startDate()) {
            changes.push({op:'replace', path:'/start-date', value:self.startDate()});
        }


        //change for date to include:
        // 1. if no start start was not set but now it is set,
        // 2. if start date canges
        // 3. if start date was set but now is not (cannot be done by UI so skipping)
        if (self.originalEndDate && self.endDate() &&  !self.endDate().isSame(self.originalEndDate)) {
            changes.push({op:'replace', path:'/end-date', value:self.endDate()});
            debugger;
        }
        if (!self.originalEndDate && self.endDate()) {
            changes.push({op:'replace', path:'/end-date', value:self.endDate()});
        }


        if (self.originalCmsCampaignConfiguration && self.selectedCmsCampaignConfiguration() && self.originalCmsCampaignConfiguration !== self.selectedCmsCampaignConfiguration()) {
            changes.push({op:'replace', path:'/cms-configuration', value:self.selectedCmsCampaignConfiguration()});
        }

        var behComparator = function (val,val2) {
            return (val && val2 && val.ds.id === val2.ds.id);
        };
        if (self.originalSelectedBRs && self.selectedBRs()) {

            changes = changes.concat(calculateChangesArr(self.originalSelectedBRs,self.selectedBRs(),'/behaviour/',behComparator));
        }


        if (self.originalSelectedBehaviours && self.selectedBehaviours()) {
            changes = changes.concat(calculateChangesArr(self.originalSelectedBehaviours,self.selectedBehaviours(),'/behaviour/',behComparator));
        }

        if (self.originalSelectedMetrics && self.selectedMetrics) {
            var metricComparator = function (val,val2) {
                return val && val2 && (val == val2);
            };
            var metricChanges = calculateChangesArr(self.originalSelectedMetrics,self.selectedMetrics,'/metrics/',metricComparator);
            if (metricChanges && metricChanges.length > 0) {
                changes = changes.concat(metricChanges);
                metricsChanged = true;
            }
        }
        //workaround for property:
        if (self.originalSelectedMetrics && self.selectedMetrics && metricsChanged) {
            changes.push({op:'replace', path:'/property/metrics', value:self.selectedMetrics});
        }


        if (self.selectedObjectives && self.originalSelectedObjectives) {
            var boCmparator = function (val1, val2) {
                return (val1 && val2 && val1.name == val2.name && val1.description == val2.description && val1.value == val2.value);
            };
            var objChanges = calculateChangesArr(self.originalSelectedObjectives, self.selectedObjectives, '/property/objectives', boCmparator);
            if (objChanges && objChanges.length > 0){
                changes.push({
                    op:'replace',
                    path:'/property/objectives',
                    value: self.selectedObjectives
                });
            }
        }


        if (self.selectedBizObjectives && self.originalSelectedBizObjectives) {
            var boCmparator = function (val1, val2) {
                return (val1 && val2 && val1.selectedMetric == val2.selectedMetric && val1.selectedThreshold == val1.selectedThreshold)
            };
            var bizObjChanges = calculateChangesArr(self.originalSelectedBizObjectives, self.selectedBizObjectives, '/property/biz_objectives', boCmparator);
            if (bizObjChanges && bizObjChanges.length > 0){
                changes.push({
                    op:'replace',
                    path:'/property/biz_objectives',
                    value: self.selectedBizObjectives
                });
            }
        }


        if (self.originalSelectedAssociatedMMBCIds && self.selectedAssociatedMMBCIds()) {

            var idsComparator = function (val,val2) {
                return val && val2 && (val == val2);
            };

            var mmBCChanges = calculateChangesArr(self.originalSelectedAssociatedMMBCIds,self.selectedAssociatedMMBCIds(),'/property/associated_mm_bcid',idsComparator);

            if (mmBCChanges && mmBCChanges.length > 0) {
                changes.push({
                    op: 'replace',
                    path: '/property/associated_mm_bcid',
                    value: self.selectedAssociatedMMBCIds()
                });

            }

        }

        // if (self.originalSelectedAssociatedBCs && self.selectedAssociatedBCs()) {
        //
        //     var associatedBcsComparator = function (val,val2) {
        //         return (val.refId === val2.refId);
        //     };
        //
        //     //use constraints from bcDef
        //     var bcDef = self.currBCDef();
        //     var bcRelationshipsDef = (bcDef && bcDef.relationships && bcDef.relationships.bcRelationships ? bcDef.relationships.bcRelationships : []);
        //     //original
        //     var origRels = _.map(self.originalSelectedAssociatedBCs, function(val) {
        //         var relationshipDef = _.find(bcRelationshipsDef, {ref:val.type});
        //         return {
        //             type: 'association',
        //             ref: val.type,
        //             refId: val.id,
        //             refData: {name: val.name},
        //             navigable: true,
        //             label: 'view',
        //             constraints: (relationshipDef && relationshipDef.constraints ? relationshipDef.constraints : {})
        //         };
        //     });
        //     var updatedRels = _.map(self.selectedAssociatedBCs(), function(val) {
        //         var relationshipDef = _.find(bcRelationshipsDef, {ref:val.type});
        //         return {
        //             type: 'association',
        //             ref: val.type,
        //             refId: val.id,
        //             refData: {name: val.name},
        //             navigable: true,
        //             label: 'view',
        //             constraints: (relationshipDef && relationshipDef.constraints ? relationshipDef.constraints : {})
        //         };
        //     });
        //     changes = changes.concat(calculateChangesArr(origRels,updatedRels,'/bcRelationship/',associatedBcsComparator));
        // }





        // if (self.originalSelectedAssociatedBC && self.selectedAssociatedBC()) {
        //
        //     var associatedBcComparator = function (val,val2) {
        //         return (val.refId === val2.refId);
        //     };
        //     //original:
        //     var origRel = [{
        //         type: 'association',
        //         ref: self.originalSelectedAssociatedBC.type,
        //         refId: self.originalSelectedAssociatedBC.id,
        //         refData: {name: self.originalSelectedAssociatedBC.name},
        //         navigable:true,
        //         label: 'view'
        //     }];
        //     var updatedRel = [{
        //         type: 'association',
        //         ref:  self.selectedAssociatedBC().type,
        //         refId:  self.selectedAssociatedBC().id,
        //         refData: {name: self.selectedAssociatedBC().name},
        //         navigable:true,
        //         label: 'view'
        //     }];
        //
        //     changes = changes.concat(calculateChangesArr(origRel,updatedRel,'/bcRelationship/',associatedBcComparator));
        // }


        //re-calculate changes for TPs created here again
        if (self.originalTpsFromBCDef && self.tpsFromBCDef()) {

            var tps = _.map(self.tpsFromBCDef(), function(info){
                if (info.tpInfo) {
                    return info.tpInfo.tpId;
                }else {
                    return '*' +ko.utils.unwrapObservable(info.channelUrl);
                }
            });
            var updatedTPs = _.map(tps, function (touchpointId) {
                return  self.currBCType + ':' + touchpointId;
            }) || [];

            var origTPs = _.map(self.originalTpsFromBCDef, function (touchpoint) {
                return  self.currBCType + ':' + touchpoint.tpInfo.tpId;
            }) || [];

            var tpComparator = function (val,val2) {
                return (val === val2);
            };
            var tpChanges = calculateChangesArr(origTPs,updatedTPs, '/property/touchpoints',tpComparator);
            if (tpChanges.length > 0) {
                changes.push({op: 'replace', path: '/property/touchpoints', value: updatedTPs});
            }
        }



        if (self.originalSelectedBI &&  self.selectedBI()) {
            var intelComparator = function (val,val2) {
                return (val && val2 && val.definition && val.definition.name && val2.definition.name && val.definition.name === val2.definition.name);
            };

            //need to update structure so 'definition' field holds values
            var origBI = _.map(self.originalSelectedBI, function (val) {
                return {
                    definition: _.omit(val,'id'),
                    id: val.id
                };
            });
            var selectedBI = _.map(self.selectedBI(), function (val) {
                return {
                    definition: _.omit(val,'id'),
                    id: val.id
                };
            });
            changes = changes.concat(calculateChangesArr(origBI,selectedBI,'/intelligence/', intelComparator));
        }


        var flattenTags = function (arr) {
            var toReturn = [];
            _.each(arr, function (item) {
                //key, url, tags
                _.each(item.tags, function (tag) {
                    toReturn.push(item.key + '##' + tag);
                });
            });
            return toReturn;
        };



        if (self.originalSelectedMMAndTags &&  self.selectedMMAndTags) {
            var tagsComparator = function (val,val2) {
                return (val === val2);
                //return val && val.tags && val2 && val2.tags && _.difference(val.tags, val2.tags);
            };

            //squish to flat array orkey#tagName
            var origTagMM = flattenTags(self.originalSelectedMMAndTags);
            var updatedTagMM = flattenTags(self.selectedMMAndTags);

            var mmTagsChangeList = calculateChangesArr(origTagMM,updatedTagMM,'/mm-tags/', tagsComparator, true);
            //var mmTagsRemoved = calculateChangesArr(updatedTagMM,origTagMM,'/mm-tags/', tagsComparator, true);

            // there are 2 arrays, one for add and one for remove
            var mmTagsChanged = _.map(mmTagsChangeList, function (mmTagChange) {

                //skip
                if (mmTagChange.value.length < 1) {
                    return mmTagChange;
                }
                //unflatten "FILE##TAG",
                var fileToTag = {

                };
                _.each(mmTagChange.value, function (val) {
                    var s = val.split('##');
                    if (!fileToTag[s[0]]) {
                        fileToTag[s[0]] = [];
                    }
                    fileToTag[s[0]].push(s[1]);
                });
                var result = Object.keys(fileToTag).map(function(key) {
                    return {
                        key: key,
                        tags: fileToTag[key]
                    };
                });

                return _.extend(mmTagChange, {value:result});
            });
            changes = changes.concat(mmTagsChanged);
        }


        //self.originalSelectedAssociatedBC = self.selectedAssociatedBC();
        self.originalSelectedBI = self.selectedBI();


        return changes;
    };

    /**
     *
     * @param {number} stepNumber = current step user wishes to edit
     */
    self.editStep = function(stepNumber) {
        var stepCount = self.stepsVM().length;
        var currNumber = self.currentStepNumber();


        if (self.editMode()) {
            if (currNumber > 0 && currNumber < stepCount) {
                return; //cannot edit, there is already a step being edited
            }
        } else {
            //step numbers start at 1, can only edit previous step
            if (currNumber < stepCount && currNumber > 0 && stepNumber < currNumber) {
                var currStep = self.stepsVM()[currNumber-1];
                currStep.completed(false);
                currStep.isEditing(false);
            }


        }


        //unmark current step as active

        //
        // if (currNumber < stepCount && currNumber > 0) { //step numbers start at 1
        //     var currStep = self.stepsVM()[currNumber-1];
        //     if (self.editMode()) {
        //         currStep.completed(true);
        //     }else {
        //         currStep.completed(false);
        //     }
        //     currStep.isEditing(false);
        // }

        //TODO: should be in onBefore
        //self.showNotificationForEditAdd(true);

        self.currentStepNumber(stepNumber);

        var step = self.stepsVM()[stepNumber-1];
        step.onBefore(self,step);
        step.isEditing(true);


        // var currNum = self.currentStepNumber();
        // var stepCount = self.stepsVM().length;
        //
        // if (currNum < stepCount) {
        //     self.currentStepNumber((currNum +1));
        // }
    };


    /**
     * Retrieves the associated BCs from Def
     * calls mainVM.getAssociatedProductIns to get any associated BCs and their sharable elements (for now only behaviours)
     * @param {object} bcDef - see self.currBCDef
     * @param {string} role
     */
    self._getAssociatedBCs = function (bcDef, role, callback) {
        callback = callback || function(){};

        var bcRelationships = (bcDef && bcDef.relationships && bcDef.relationships.bcRelationships ? bcDef.relationships.bcRelationships : []);

        var match = _.filter(bcRelationships, function (rel) {
            //match navigable for "true" and true
            return (rel.type === 'association' && rel.navigable && (rel.navigable === true || rel.navigable == 'true'));
        });


        //skip if no associated BCs
        if (match.length <1 ) {
            return callback();
        }


        var allBCIns = _.after(match.length, function () {
            callback();
        });


        //check all if
        _.each(match, function (val) {
            var params = {
                type: val.ref,
                role: role,
                constraints: val.constraints || {}
            };
            //retrieves associated behaviours
            mainVM.getAssociatedProductIns(params, function (err, result) {
                if (err) {
                    console.log('skipping error');
                }
                //on update exclude current BC from associated BCs available for selection
                if (self.bcId) {
                    result = _.reject(result, {'id':self.bcId});
                }
                //concat into array
                self.associatedBCs.push.apply(self.associatedBCs, result);
                allBCIns();
            });
        });


        //calls
    };

    self.tempMMTag = 'temp';



    self.clear = function () {

        self.startDate('');
        self.endDate('');


        self.iconText('');
        self.bcName('');
        self.bcDescription('');
        self.associatedBCs([]);
        //self.widgetIntelligence([]);
        self.allMetrics([]);
        self.allBehaviours([]);
        self.allBRs([]);
        self.selectedBehaviours([]);
        self.behavioursFromAssociatedBC([]);
        self.selectedBRs([]);
        self.allWidgetReport = [];
        self.selectedMetrics = [];
        self.allBehEpt = [];
        self.allBusinessIntelligence([]);
        self.placeholderValue('');
        self.selectedUserProfile = null;
        self.selectedSelectedSegReport = null;
        self.selectedWidgetIntelligence =[];
        self.selectedSubWidgetIntelligence =[];
        self.availableWidgetIntelligence([]);
        self.tpsFromBCDef([]);
        self.brsFromAssociatedBC([]);
        self.existingTPs([]);
        self.existingBCCTPs([]);
        self.selectedBI([]);
        self.selectedMMAndTags = [];
        //self.selectedBCsByType = {};
    };


    self._getAssociatedRolesByBCDef = function(bcDef){
        var roleRelationship = _.find(bcDef.relationships.entityRelationships, {type:'association', ref: 'Roles'});
        if(roleRelationship && roleRelationship.define){
            return roleRelationship.define.value;
        } else {
            return;
        }
    };

    self.hideCreate = function () {
        self.bcName(null);
        mainVM.hideCreate();
    };

    self.populateBehaviours = function() {

        //replace dexit.app.ice.integration.behaviour.list

        //use parent BC (Program, TP)
        var name = self.parentParams.bc;

        dexit.app.ice.integration.bcm.retrieveBCDefinitionBehaviours(name,{application:'ice4m',detailed:true}, function (err, result) {
            if (err) {
                console.log('could not retrieve services');
            }
            self.allBehaviours(result);
        });
    };

    self.showCreate = function () {
        self.clear();

        if (args.name) {
            self.bcName(args.name);
        }
        self.populateCmsConfigurationModes();


        self._populateSteps('create');

        $('.create-campaign-wrapper').addClass('show-create-campaign');
        self.currentStepNumber(1);
        debugger;
        //make sure to call onBefore
        var firstStep = self.stepsVM()[0];
        firstStep.onBefore(self,firstStep);

        //generate new random tag and add this to BCi

        //need tag for parent BC


        //add tag for the specific campaign

        mainVM.mmIcon('');
        self.mmIcon('');
        self.mmTag = joint.util.uuid();
        mainVM.currentMMTag = self.mmTag;
        self.mmManagementVM.tagsToAdd = [self.mmTag];
        self.mmManagementIconsVM.tagsToAdd = [self.mmTag];

        self.iconText('');


        mainVM.loadMMForBC(self.mmTag, function () {
            //load existing mm tags

            self.populateAvailableUserMMTags(function () {
                //assign mm;
                self.selectedMMAndTags = self.prepareTags(self.availableTags(), mainVM.fileTags());
                //tags for MM are independent of BC
                self.originalSelectedMMAndTags =  _.cloneDeep(self.selectedMMAndTags);

            });

        });

        // self.populateAvailableUserMMTags(function () {
        //
        // });

        // self.placeholderValue('Enter a name for your ' + self.currBCDef().singular);
        // $('.create-campaign-wrapper').addClass('show-create-campaign');
        if (self.behDefinePermission()) {
            self.populateBehaviours();
        }
        if (self.associatedBCDefinePermission()) {


            self._getAssociatedBCs(self.parentBCDef, mainVM.currentRole());
        }

        //populate metrics associated to BC
        self.populateAvailableBCMetrics();
        if (self.metricDefinePermission()) {
            dexit.app.ice.integration.metrics.listBehEpts(function (err, res) {
                if (err) {
                    console.log('failed to list metrics_ept!');
                } else {
                    self.allBehEpt = res;
                }
            });
        }




        self._retrieveAvailableBI(function (err, availableBI) {
            if (!err && availableBI) {
                self.allBusinessIntelligence(availableBI);
            }

        });

        //
        // //TODO: intelligence available should be dynamic
        // //TODO: add intelligence placeholder(s) - ie. for Biz Objective
        // if (self.userProfileDefinePermission()) {
        //     self.allBusinessIntelligence.push({name: 'user profile', schema: {id: 'userprofile'}});
        // }
        // //add intelligence for recommended
        // self.allBusinessIntelligence.push({name: 'recommendation profile', schema: {id: 'recommendedprofile'}});
        //
        //
        // self.allBusinessIntelligence.push({name: 'dynamic ept', schema: {id: 'dynamicept'}});
        // self.allBusinessIntelligence.push({name: 'user crm', schema: {id: 'usercontact'}});


        //TODO: generalize all BIs
        // if (self.segmentReportDefinePermission()) {
        //     self.allBusinessIntelligence.push({name: 'segment report'});
        // }

        if (self.kpiDefinePermission()) {
            //ICEMM-294: match metrics to existing widget report

            //self.widgetIntelligence([]);

            //var param = {associatedBCName: 'reports', subBCType: 'widgetReport', bcType: self.currBCDef().bctype};
            //self.allWidgetReport = self.getAssociatedBCIns(param);
        }
        // if (self.mmDefinePermission()) {
        //     //load existing MM by BC level
        //     mainVM.loadMMForBC(self.mmTag, function () {
        //         self.selectedMMAndTags = mainVM.fileTags();
        //     });
        // }
        if (self.tpDefinePermission()) {
            self.tpsFromBCDef([]);
        }

        //load existing TPs configured, may take a bit of time, if order of stes

        //fixme: to speed up load
        if (self.currBCType && (self.currBCType !== 'Store')) {
            self._loadExistingTPs();
        }

        self.loaded(true);

    };


    /**
     * Loads the available BCC touchpoints
     * @private
     */
    self._loadAvailableBCCTPs = function (callback) {
        //FIXME: dynamic
        var bcType = 'Store';

        async.auto({
            available:function(cb) {
                var params = {
                    type: bcType,
                    role: self.mainVM.currentRole()
                };
                dexit.app.ice.integration.bcp.retrieveBCiFromEntityRelationshipByRole(params, function (err, res) {
                    if (err) {
                        console.error('failed to load BC instances! ' + err);
                        return cb(err);

                    }
                    res = res || [];
                    var mapped = _.map(res,'bci_id');
                    cb(null, mapped);
                });
            },
            retrieve: ['available', function(cb, result) {

                async.map(result.available, function(bciId, done) {
                    var params_retrieve = {
                        repo: self.mainVM.repo,//should decoupled
                        type: bcType, //fixme
                        id: bciId
                    };

                    dexit.app.ice.integration.bcp.retrieveBCInstance(params_retrieve, function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        //for backward compatability/skip bad records
                        if (!res.property || !res.property.touchpoints) {
                            return done();
                        }
                        var touchpoint = res.property.touchpoints;
                        var tpId = touchpoint.split(':')[1]?touchpoint.split(':')[1]:touchpoint;
                        //retrieve TP info
                        //for res.touchpoints

                        dexit.app.ice.edu.integration.tp.retrieveChannelInstanceFromTPCached(tpId, null, function (err, data) {
                            if (err) {
                                return done(err);
                            }
                            //skip on bad data
                            if (data && data.length < 1) {
                                return done();
                            }
                            //assumes only one
                            var tp = data[0];

                            var r = {
                                tpName: res.property.name,
                                tpId: tpId,
                                tpType: tp.type,
                                tpURL: tp.url,
                                channelType: tp.type,
                                channelTypeId: tp.channelTypeId,
                                bcc: {
                                    id: res.id,
                                    type:bcType
                                }
                            };
                            done(null,r);
                        });
                    });
                }, function (err, tps) {
                    if (err) {
                        return cb(err);
                    }
                    cb(null,_.compact(tps));

                });

            }]
        }, function(err,res) {
            if (err) {
                console.error('could not retrieve any BCC Tps');
                return callback(err);
            }
            var data = res.retrieve || [];
            callback(null,data);
        });
    };


    self._loadExistingTPs = function () {
        var existing = [];

        var types = mainVM.touchpointTypes();
        var touchpointKeys = mainVM.touchpointKeys();

        async.each(touchpointKeys, function (key, cb) {
            var val = types[key];
            var params = {
                tpType: val.name,
                segment: 'all',
                bcType: self.currBCType || ''
            };
            dexit.app.ice.integration.tpm.findPreconfiguredTPs (params, function (err, data) {
                if (err) {
                    return cb(err);
                }
                existing = existing.concat(data);

                cb();
            });
        }, function (err) {
            if (err) {
                console.error('could not retrieve touchpoints');
            }

            //filter out any predefined bcc touchpoints
            self.existingTPs(_.reject(existing, {tpType:'ucc'}));
            //also load BCC ones
            //TODO: this assumes 'Store' is name of BCC BC
            if (self.currBCType !== 'Store') {
                self._loadAvailableBCCTPs(function(err, bccTps) {
                    if (err) {
                        //ignore error
                        return;
                    }
                    self.existingBCCTPs(bccTps);
                });
            }
        });
    };

    self._retrieveAvailableBI = function(callback) {
        var resource = '/bc-creation/available-bi';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(callback);
    };

    //code commented for removal
    // self.highlightSelection = function (selection, selectionType) {
    //
    //     if (selectionType === 'businessIntelligence' && selection && selection.name.indexOf('user profile') > -1) {
    //         //TODO? create sc intelligence for selected profile in defining BC?
    //         if (!self.selectedUserProfile) {
    //             self.selectedBI.push(selection);
    //             self.selectedUserProfile = selection;
    //         } else {
    //             self.selectedUserProfile = null;
    //             var r = _.filter(self.selectedBI(), function (val) {
    //                 return (val.name.indexOf('user profile') > -1);
    //             });
    //             self.selectedBI(r);
    //         }
    //     } else if (selectionType === 'businessIntelligence' && selection && selection.name.indexOf('segment report') > -1) {
    //         //TODO? create sc intelligence for selected profile in defining BC?
    //         if (!self.selectedSegmentReport) {
    //             self.selectedBI.push(selection);
    //             self.selectedSegmentReport = selection;
    //         } else {
    //             self.selectedSegmentReport = null;
    //             var r2 = _.filter(self.selectedBI(), function (val) {
    //                 return (val.name.indexOf('segment report') > -1);
    //             });
    //             self.selectedBI(r2);
    //         }
    //     }
    //
    //     event.currentTarget.classList.toggle('active');
    //
    // };

    /**
     *
     * @param {string} name - name to check
     * @private
     */
    self.checkDuplicateName = function (name) {
        /*
         validate if the new campaign name is duplicated with current BC instance list*/
        var bcInsList = mainVM.listOfBcInstances();
        var isDuplicated = _.find(bcInsList, function (instance) {
            return (name === instance.courseVM.businessConceptInstance.property.name);
        });
        return (isDuplicated ? true : false);
    };


    self.removeMMFromBC = function(fileName, mmType, bcFileTag) {
        var baseFolder = self.mmManagementVM.baseFolder() || '';
        self.mainVM.removeMMFromBC(fileName, mmType, bcFileTag, baseFolder);


    };

    self.loadValues = function () {
        if (self.behDefinePermission()) {
            self.populateBehaviours();
        }
        // if (self.associatedBCDefinePermission()) {
        //     self._getAssociatedBCs(self.currBCDef(), mainVM.currentRole());
        // }
        if (self.metricDefinePermission()) {
            dexit.app.ice.integration.metrics.listBehEpts(function (err, res) {
                if (err) {
                    console.log('failed to list metrics_ept!');
                } else {
                    self.allBehEpt = res;
                }
            });
        }



        self._retrieveAvailableBI(function (err, availableBI) {
            if (!err && availableBI) {
                self.allBusinessIntelligence(availableBI);
            }
        });
        //TODO: intelligence available should be dynamic
        //TODO: add intelligence placeholder(s) - ie. for Biz Objective
        // if (self.userProfileDefinePermission()) {
        //     self.allBusinessIntelligence.push({name: 'user profile', schema: {id: 'userprofile'}});
        // }
        // self.allBusinessIntelligence.push({name: 'recommendation profile', schema: {id: 'recommendedprofile'}});
        // self.allBusinessIntelligence.push({name: 'dynamic ept', schema: {id: 'dynamicept'}});
        // self.allBusinessIntelligence.push({name: 'user crm', schema: {id: 'usercontact'}});


        if (self.segmentReportDefinePermission()) {
            // self.allBusinessIntelligence.push({name: 'segment report'});
        }

        //load existing TPs configured, may take a bit of time, if order of stes
        self._loadExistingTPs();




    };


    /**
     *
     */
    self.showUpdate = function() {



        function mapBehs(behs) {

            var mapped = _.map(behs, function (val) {
                if (val.property.ds && _.isString(val.property.ds)) {
                    try {
                        val.property.ds = JSON.parse(val.property.ds);
                    }catch(e){}
                }
                if (val.property.display && _.isString(val.property.display)) {
                    try {
                        val.property.display = JSON.parse(val.property.display);
                    }catch(e1){}
                }
                val.property.behId = val.id;
                val.property.scId = self.bcId;
                return val.property;
            });
            return mapped;
        }


        self.clear();
        self.changes = [];

        if (args.name) {
            self.bcName(args.name);
        }


        self.populateCmsConfigurationModes();

        self.changesMade(false);
        //load bc
        self.loadValues();


        //self.bcStructure.pending = self.existingBcStructure || {};

        var description = self.bcStructure.pending.description || '';

        self.bcDescription(description);


        var iconText = self.bcStructure.pending.iconText || '';
        if (iconText) {
            self.iconText(iconText);
        }

        var dateStart = self.bcStructure.pending.start_date;
        var dateEnd = self.bcStructure.pending.end_date;
        if (dateStart) {
            if (_.isString(dateStart)) {
                self.startDate(moment(dateStart, moment.ISO_8601));
            }else {
                self.startDate(dateStart);
            }
        }
        if (dateEnd){
            if (_.isString(dateEnd)) {
                self.endDate(moment(dateEnd, moment.ISO_8601));
            }else {
                self.endDate(dateEnd);
            }
        }


        if (self.bcStructure.pending.cmsConfiguration) {
            self.selectedCmsCampaignConfiguration(self.bcStructure.pending.cmsConfiguration);
        }

        //make sure tags are loading to save;
        self.mmTag = self.bcStructure.mmTag;



        mainVM.currentMMTag = self.mmTag;

        mainVM.loadMMForBC(self.mmTag, function () {
            //TODO: is this all nedeed
            self.selectedMMAndTags = self.prepareTags([], mainVM.fileTags());
            //tags for MM are independent of BC
            self.originalSelectedMMAndTags =  _.cloneDeep(self.selectedMMAndTags);


        });
        // self.mmManagementVM.tagsToAdd = [self.mmTag];

        async.auto({
            loadBC: function (cb) {

                cb(null, self.bcStructure.pending);
            },
            loadBehaviours: ['loadBC', function (cb, result) {

                var data = result.loadBC;
                var behs = data.behaviours || [];

                self.selectedBehaviours(behs);

                cb(null,behs);
            }],
            loadBI: ['loadBC',function (cb, result) {
                var data = result.loadBC;

                var mapped = data.bi || [];
                self.selectedBI(mapped);

                cb();
            }],
            loadMetrics: ['loadBC', function (cb, result) {
                debugger;
                var data = result.loadBC;
                //TODO: load from data.intelligence
                //self.selectedMetrics = data.metrics || [];
                var metrics = data.metrics || [];
                self.selectedMetrics = _.map(metrics, function (val) {
                    return (''+val);
                });


                self.populateAvailableBCMetrics(cb);
            }],
            loadBRs: ['loadBC','loadBehaviours',function (cb, result) {
                var data = result.loadBC;

                var brs = data.brs || [];
                self.selectedBRs(brs);

                cb();
            }],
            loadMM: ['loadBC', function(cb, result) {
                var data = result.loadBC;

                self.mmIcon(data.mmIcon);
                self.iconText(data.iconText);
                mainVM.mmIcon(data.mmIcon);

               cb();


            }],
            loadTPs: ['loadBC', function (cb, result) {

                var data = result.loadBC;

                self.tpsFromBCDef(data.touchpoints);
                cb();
            }]
        }, function (err, results) {
            var data = results.loadBC;

            mainVM.currentMMTag = self.mmTag;


            self.mmManagementVM.tagsToAdd = [self.mmTag];
            self.mmManagementIconsVM.tagsToAdd = [self.mmTag];

            debugger;




            // var bo = data.property.biz_objectives;
            // if (bo) {
            //     //parse
            //     if (!_.isArray(bo)) {
            //         bo = [bo];
            //     }
            //     bo = _.map(bo, function(val) {
            //         if (_.isString(val)) {
            //             try {
            //                 val = JSON.parse(val);
            //                 return val;
            //             }catch(e){
            //             }
            //         }
            //     });
            //
            //     //TODO:fix
            //
            //
            //
            //     //check if data is good
            //     if (bo && _.isArray(bo) && bo.length > 0 && bo[0].selectedMetric) {
            //
            //         self.selectedBizObjectives = bo;
            //     }else {
            //         self.selectedBizObjectives = [];
            //     }
            //
            //     //prepare bixObjectives
            //     //self.selectedBizObjectives
            // }


            //load associted bcs

            // var selectedAssociatedMMBCs = data.property.associated_mm_bcid || [];
            // //make sure it is an array
            // if (!_.isArray(selectedAssociatedMMBCs)) {
            //     selectedAssociatedMMBCs = [selectedAssociatedMMBCs];
            // }
           // self.selectedAssociatedMMBCIds(selectedAssociatedMMBCs);

            //load wf for BCi

            self._populateSteps('update');
            //fill in any data
            _.each(self.stepsVM(), function(step) {
                step.onUpdateLoad(self,step);
                step.completed(true);
                //put in listview
            });
            var stepNum = self.stepsVM().length +1;
            self.currentStepNumber(stepNum);



            //set all original valure to track

            self.orginalSelectedBizObjectives =  self.selectedBizObjectives || [];


            self.originalSelectedObjectives = self.selectedObjectives || [];

            self.originalBcName = self.bcName();
            self.originalBcDescription = self.bcDescription();
            self.originalSelectedBRs = self.selectedBRs() || [];
            self.originalSelectedBehaviours = self.selectedBehaviours() || [];
            var tps = ko.utils.unwrapObservable(self.tpsFromBCDef);
            self.originalTpsFromBCDef = (tps && tps.length > 0 ? tps.slice() : []);
            self.originalSelectedMetrics = (self.selectedMetrics && self.selectedMetrics.length > 0 ? self.selectedMetrics.slice(): []);
            self.originalSelectedAssociatedBCs = self.selectedAssociatedBCs();
            self.originalSelectedAssociatedMMBCIds = self.selectedAssociatedMMBCIds() || [];
            self.originalSelectedBI = self.selectedBI() || [];
            self.originalSelectedMMAndTags = (self.selectedMMAndTags && self.selectedMMAndTags.length > 0 ?  _.cloneDeep(self.selectedMMAndTags) : []);



            self.originalStartDate = self.startDate() || '';
            self.originalEndDate = self.endDate() || '';

            self.originalIconText = self.iconText() || '';


            self.originalCmsCampaignConfiguration = self.selectedCmsCampaignConfiguration() || '';


            self.loaded(true);

        });
    };


    /**
     *
     */
    self.updateBCInstance = function () {


        debugger;

        //existing data is at self.bcStructure
        //
        var changes = self.changes || [];
        // //now disable button
        self.changesMade(false);
        self.addCampaign();


        //Just replace everything




        //
        // //FIXME: requires adjustment to treat all changes equally.  TPs are treated specially
        // async.auto({
        //     touchpointsToCreate: function (cb) {
        //         var tps = self.tpsFromBCDef() || [];
        //
        //         async.map(tps, function (tpParams, done) {
        //             if (tpParams && tpParams.tpInfo) {
        //                 //skip add for ones already existing
        //                 return done(null,tpParams.tpInfo.tpId);
        //             }
        //             self._createTouchpoint(tpParams,done);
        //         }, function (err, resp) {
        //             if (err) {
        //                 console.error('could not create tp');
        //                 return cb(err);
        //             }
        //             cb(null,resp);
        //
        //         });
        //     },
        //     change: ['touchpointsToCreate',function(cb,result) {
        //
        //         //re-calculate changes for TPs created here again
        //         if (self.originalTpsFromBCDef && self.tpsFromBCDef()) {
        //             var tps = result.touchpointsToCreate || [];
        //             var updatedTPs = _.map(tps, function (touchpointId) {
        //                 return  self.currBCType + ':' + touchpointId;
        //             }) || [];
        //             var ind = _.findIndex(changes, {'path': '/property/touchpoints'});
        //             if (ind !== -1) {
        //                 //update changes to send for TP
        //                 changes[ind] = {op: 'replace', path: '/property/touchpoints', value: updatedTPs};
        //             }
        //         }
        //
        //
        //         //QH: remove mm tag changes here
        //         var filteredChanges = _.filter(changes, function(val) {
        //             return (!val.skip);
        //         });
        //
        //         var params = {
        //             type: self.currBCType,
        //             id: self.bcId,
        //             version: self.existingBC.property.version,
        //             changes: filteredChanges
        //         };
        //         dexit.app.ice.integration.bcp.updateBCInstance(params, cb);
        //     }],
        //     retrieveBCInstance: ['change', function (cb, result) {
        //         var params = {
        //             id: self.bcId,
        //             type: self.currBCType
        //         };
        //         dexit.app.ice.integration.bcp.retrieveBCInstance(params,cb);
        //     }],
        //     //TODO: move BCVM instantiation elsewhere
        //     replaceBCiViewModel: ['change', 'retrieveBCInstance', function (next, result) {
        //         var bcId = self.bcId;
        //         //remove old one
        //         mainVM.listOfBcInstances.remove(function (item) {
        //             return (item.courseVM && item.courseVM.businessConceptInstance.id === bcId);
        //         });
        //
        //         //the updated BCi needs a new VM
        //         var bcVM = new dexit.app.ice.edu.BCInstanceVM(result.retrieveBCInstance, mainVM);
        //         if (self.availableBehaviourList && self.availableBehaviourList.length > 0) {
        //             bcVM.existingBehaviours(self.availableBehaviourList);
        //         }
        //         mainVM.listOfBcInstances.unshift({
        //             courseVM: bcVM
        //         });
        //         next(null, bcVM);
        //     }]
        // }, function (err) {
        //     if (err) {
        //         //TODO: handle version conflict
        //         console.log('error updating bc');
        //     } else {
        //         //add the selected services after retrieval?
        //         mainVM.selectedBCIns(mainVM.listOfBcInstances()[0]);
        //         mainVM.setWidgetReport(mainVM.listOfBcInstances()[0].courseVM);
        //     }
        //     self.hideCreate();
        // });
    };


    self.approveCampaign = function () {
        debugger;

        if (!self.bcStructure.pending) {
            return;
        }
        self.bcStructure.approved = self.bcStructure.pending;




        args.callingVM.hideWf();
        args.callingVM.updateElementData(self.existingId,{approved:true, data: self.bcStructure});

    };




    /**
     * Creates a new campaign Instance based on values from form
     * TODO: move all logic (except observables required for VM) to service
     */
    self.addCampaign = function () {

        if (!self.bcStructure) {
            self.bcStructure = {};
        }

        if (!self.bcStructure.pending) {
            self.bcStructure.pending = {};
        }


        self.bcStructure.mmTag = self.mmTag;





        self.bcStructure.pending.description = self.bcDescription() || '';

        self.enableCreate(false); //disable so cannot double click, TODO: add spinner
        var metrics = self.selectedMetrics || [];

        metrics = _.map(metrics, function (val) {
            return (parseInt(val));
        });


        var tps = self.tpsFromBCDef() || [];

        self.bcStructure.pending.touchpoints = tps;


        self.bcStructure.pending.metrics = metrics;


        if (self.selectedCmsCampaignConfiguration()) {
            self.bcStructure.pending.cmsConfiguration = self.selectedCmsCampaignConfiguration();
        }



        if (self.startDate()) {
            if (_.isString(self.startDate())) {
                self.bcStructure.pending.start_date = self.startDate();
            }else {
                self.bcStructure.pending.start_date = self.startDate().format();
            }

        }

        if (self.endDate()) {
            if (_.isString(self.endDate())) {
                self.bcStructure.pending.end_date = self.endDate();
            }else {
                self.bcStructure.pending.end_date = self.endDate().format();
            }
        }




        if (!self.bcStructure.pending.behaviours) {
            self.bcStructure.pending.behaviours = [];
        }
        var behs = self.selectedBehaviours() || [];
        self.bcStructure.pending.behaviours = behs;

        var selectedBRs = self.selectedBRs() || [];
        self.bcStructure.pending.brs = selectedBRs;

        self.bcStructure.pending.bi = self.selectedBI() || [];


        //pending icon
        var icon = self.mmIcon();
        var iconText = self.iconText();

        if (icon) {
            self.bcStructure.pending.mmIcon = icon;
        }
        if (iconText) {
            self.bcStructure.pending.iconText = iconText;
        }


        var params = {
            name: self.bcName(),
            parent: self.parentParams,
            data: self.bcStructure
        };


        args.callingVM.hideWf();

        //update element
        args.callingVM.updateElementData(self.existingId, params);
        //args.callingVM.createElement(position, params);


    };


    // self.behavioursRendered = function(elements, data) {
    //     if ($('.serv-container.eService-section').children().length === self.allBehaviours().length) {
    //         $('.hide-services').removeClass('hide-services');
    //         $('.products-preloader').remove();
    //     }
    // };
    //
    // self.productsRendered = function(elements, data) {
    //     if ($('.prod-container').children().length === self.associatedBCs().length) {
    //         $('.initial-hide').removeClass('initial-hide');
    //         $('.products-preloader').remove();
    //     }
    // };


    /**
     * Loads the selected metrics related to the behaviour Epts.
     * Loads the possible metrics by the selected touchpoints. Should search combination of channels and devices
     * Note: only find by channel type supported for now
     *
     * @param {object[]} [selectedBehs=[]]
     * @param {object[]} [selectedTouchpoints=[]]
     */
    self.getMetricsByBehAndChan = function(selectedBehs, selectedTouchpoints){

        selectedTouchpoints = selectedTouchpoints || [];
        selectedBehs = selectedBehs || [];
        self.availableMetricsByBehaviours([]);



        if(self.allBehEpt.length < 1) {
            return; //skip if no available Epts configured with behaviours
        }


        //find behaviours and available epts for them (one to zero or more )
        var behAndEpt =_.map(selectedBehs, function (selectedBeh) {
            var id = selectedBeh.ds.id;
            var matchedEpts = _.filter(self.allBehEpt, function(behEpt){
                return behEpt.behaviourId === id;
            });

            return {
                behaviour: _.clone(selectedBeh),
                matchedEptIds: matchedEpts
            };
        });

        var allMetricIds = [];
        async.auto({

            findMetricIdsForEpt: function (cb) {
                //for each behavior and is epts, find metrics
                async.map(behAndEpt, function (val, next) {
                    var behaviour = val.behaviour;
                    var matchedEptIds = val.matchedEptIds;
                    var matched = [];
                    async.each(matchedEptIds, function (matchedEpt, done) {
                        dexit.app.ice.integration.metrics.retrieveMetricsByEptId({eptId: matchedEpt.engagementPointId}, function(err, result){
                            if (err) {
                                console.warn('skipping matching ept to metric likely due to a configuration error');
                                return done();
                            }
                            var metricIds =_.map(result,function (val) {
                                return val.metricId;
                            });
                            allMetricIds = allMetricIds.concat(metricIds);
                            matched = matched.concat(metricIds);
                            done();

                        });
                    }, function () { //ignoring error
                        //work around duplicates coming back from service
                        var ids = _.uniq(matched);
                        next(null,{
                            behaviour: behaviour,
                            matchedEptIds:matchedEptIds,
                            matchedMetricIds: ids
                        });
                    });

                }, function (err, result) {
                    if (err) {
                        console.log('error retrieving Epts for behaviour'); //skip
                    }
                    result = result || [];
                    cb(null,result);
                });
            },
            metrics: ['findMetricIdsForEpt', function (cb) {

                //remove duplicates from allMetricIds;
                var ids = _.uniq(allMetricIds);

                async.map(ids, function (metricId, done) {
                    dexit.app.ice.integration.metrics.retrieveMetricsById(metricId, function(err, returnedMetric){
                        if (err){
                            //skip
                            console.error('metric:'+metricId + ' can not be retrieved');
                            done();
                        }
                        done(null,returnedMetric);
                    });
                }, function(err, res) {
                    //skipped error above so ignore handling
                    cb(null,res);
                });
            }],
            buildBehMetricObj: ['findMetricIdsForEpt','metrics',function (cb, result) {
                var metricsObj = result.metrics;
                var data = result.findMetricIdsForEpt;

                var res = _.map(data, function (item) {
                    var metrics = _.map(item.matchedMetricIds, function (metricId) {
                        return _.find(metricsObj, function (metric) {
                            return (metric.metricId === metricId);
                        });
                    });
                    return {
                        behaviourId: item.behaviour.ds.id,
                        behaviourName: item.behaviour.display.icon_text,
                        metrics: ko.observableArray(metrics)
                    };
                    //var behAndMetrics = new  BehavioursAndMetrics(item.behaviours);
                    //return behAndMetrics;
                });
                cb(null,res);
            }]
        }, function (err, result) {
            if (result && result.buildBehMetricObj) {
                self.availableMetricsByBehaviours(result.buildBehMetricObj);

            }

            //otherwise map from object to array
            /**
             * @example {'behaviour':{'ds': {'id':'a'} },'metrics':[]}  to [{behaviour:{'ds': {'id':'a'} }, 'metrics':[]}]
             */

        });



        //finally mark any metrics

        //
        //
        //
        // // self.allMetrics([]);
        // _.each(selectedBehs, function(selectedBeh){
        //     var dsId = selectedBeh.ds.id;
        //     //find matches
        //     var matchedEpts = _.filter(self.allBehEpt, function(behEpt){
        //         return behEpt.behaviourId === selectedBeh.ds.id;
        //     });
        //
        //     if(matchedEpts && matchedEpts.length > 0){
        //         _.each(matchedEpts, function(matchedEpt, index){
        //             dexit.app.ice.integration.metrics.retrieveMetricsByEptId({eptId: matchedEpt.engagementPointId}, function(err, result){
        //                 if(result && result.length > 0){
        //                     _.each(result, function(metricEpt, index){
        //                         dexit.app.ice.integration.metrics.retrieveMetricsById(metricEpt.metricId, function(err, returnedMetric){
        //
        //
        //                             var value = self.availableMetricsByBehaviours()
        //
        //                             self.allMetrics.push(returnedMetric);
        //                         });
        //                     });
        //                 }
        //
        //             });
        //         });
        //     }
        // });

    };


    /**
     * Retrieves the metric definitions based on the identifiers
     * Note: instead of errors, it trims the results
     * @param {string[]} metricIds
     * @param callback
     */
    self.retrieveMetricDetails = function(metricIds, callback) {
        metricIds = metricIds || [];
        async.map(metricIds, function(metricId, cb){
            dexit.app.ice.integration.metrics.retrieveMetricsById(metricId, function(err, def) {
                if (err) {
                    return cb();
                }
                cb(null,def);
            });
        }, function(err, result) {
            if (err) {
                console.warn('error loading available metrics for BC');
            }
            result = result || [];
            callback(null, _.compact(result));

        });
    };

    self.populateAvailableBCMetrics = function(cb) {
        var callback = cb || function(){};


        var def = self.parentBCDef;

        var metricIds = (def && def.availableBCMetrics ? def.availableBCMetrics : []);


        async.map(metricIds, function(metricId, cb){
            dexit.app.ice.integration.metrics.retrieveMetricsById(metricId, cb);
        }, function(err, result) {
            if (err) {
                console.warn('error loading available metrics for BC');
            }
            result = result || [];
            self.availableMetricsForBC(result);
            callback();

        });

    };


    self.availableMetricsByBehaviours  = ko.observableArray([]);

    //
    // //ICEMM-298: get BRs by selected behaviours
    /**
     *
     * @param behs
     * @return {Array}
     */
    self.getBRsByBeh = function(behs){


        var mapped = _.map(behs, function (beh) {
            if (beh.property) {
                return beh.property;
            } else {
                return beh;
            }
        });
        var brs = [];
        _.each(mapped, function(beh){
            if(beh.ds.uiElements.rule_type === 'complex'){
                var br = _.extend({
                    eptName: 'Business Rule',
                    ruleType: 'complex',
                    subType: beh.display.icon_text==='Survey'?'questionnaire':beh.display.icon_text,
                    iconType: 'fa fa-cogs',
                    renderText: beh.display.icon_text+' Business Rule',
                    isBR: true,
                    behRef: beh.ds.id
                }, beh);
                brs.push(br);

                // brs.push({
                //     eptName: 'Business Rule',
                //     type: 'behaviour',
                //     subtype: beh.display.icon_text==='Survey'?'questionnaire':beh.display.icon_text,
                //     iconType: 'fa fa-cogs',
                //     renderText: beh.display.icon_text+' Business Rule',
                //     ruleType: 'complex',
                //     scId: beh.scId || '',
                //     behId: beh.behId || '',
                //     behRef: beh.ds.id,
                //     ds: beh.ds,
                //     isBR: true,
                //     display: beh.display //need this diaplay field?
                // });
            }
        });
        return brs;
    };
    //



    /**
     * Creates a touchpoint
     * TODO: move to service
     * @param {object} params
     * @param {string} params.channelType
     * @param {string} params.channelTypeId
     * @param {string} params.channelUrl
     * @param {string} params.name
     * @param callback - returns error or touchpointId
     */
    self._createTouchpoint = function(params, callback) {
        callback = callback || function () {
        };

        function handleCreateTP(err, response) {
            if (err) {
                console.error('could not create touchpoint');
                return callback(err);
            }
            callback(null, response.result);
        }

        if (!params || !params.channelTypeId || !params.channelType) {
            return callback(new Error('missing channelTypeId or channelType'));
        }


        //if channelAuth setting is true, FB channel will get auth before generating the TP&channel instance
        //if the channel type is UCC, assign UCC touchpoint to BCI.
        //otherwise, all groups will be handled as same process
        var name = params.name || (channelType + 'for ' + self.bcName());
        var channelType = params.channelType;
        var channelTypeId = params.channelTypeId;
        var url = params.channelUrl;

        // convert facebook page url
        if (url.trim().toLowerCase().indexOf('facebook') > -1 && url.trim().toLowerCase().indexOf('pages') === -1 && url.trim().toLowerCase().indexOf('groups') === -1) {
            var arrayLength = url.trim().split('//')[1].split('/')[1].split('-').length;
            var protocalType = url.trim().split('//')[0];
            var domainofURL = url.trim().split('//')[1].split('/')[0];
            var pageId = url.trim().split('//')[1].split('/')[1].split('-')[arrayLength - 1];
            var userName = url.trim().split('//')[1].split('/')[1].split('-' + pageId)[0];
            url = protocalType + '//' + domainofURL + '/' + 'pages' + '/' + userName + '/' + pageId + '/';
        }
        var body = {
            groupURL: url.trim(), // groupID is storing the entire url.
            name: name,
            channelType: channelType,
            channelTypeId: channelTypeId
        };
        //TODO: when add facebook touchpoint but the channel is not authorised, the touchpoint will be created, but the facebook group will not be created.
        if (mainVM.channelAuth() === 'true' && url.toLowerCase().indexOf('groups/') > -1 && channelType.toLowerCase() === 'facebook') {
            //TODO: unify facebook group creation and other touchpoints
            dexit.app.ice.edu.integration.fbgroup.createGroup(body, handleCreateTP);
        } else {
            dexit.app.ice.integration.tpm.createTouchpoint(body, handleCreateTP);
        }

    };



};


