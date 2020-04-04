/**
 * Copyright Digital Engagement Xperiance 2014-2017
 * @description Main ICE4M view model
 */
/* global _, joint, dexit, storyboard_VM, dpa_VM, ko, async */
/**
 *
 * Main ICE4M VM
 * @param {object} args
 * @param {object} args.user - user object
 * @param {string} args.currentRole -  current (or default) roles to use
 * @param {string} args.bucket - multimedia bucket url
 * @param {string} args.securedSchedule - **unused?
 * @param {string} args.enableBehaviour - (should be a boolean) used by EngagementVM but always seems to be set true regardless
 * @param {string} args.userRoles - comma seperated list of role names
 * @param {string} args.fbUserID - Facebook user identifier
 * @param {string} args.fbAppID - Facebook app identifier
 * @param {string} args.cannedReportsDB - Canned reports datastore
 * @param {string} args.cannedReportsTable = Canned reports table
 * @param {string} args.ice4mURL - ICE4M url to include in message when creating twitter notification
 * @param {string} args.channelAuth - Configuration flag for using old operation combining the FB group member
 * @param {Object.<string, TpChannelType>} args.tpChannelTypes - available channel types for creating touchpoints
 * @param {string} args.allowAddTouchpoint - checking, user group authoring and touchpoint creation (should be a boolean)
 * @param {object} args.ice4mBCs - BC labels for menu
 * @param {object} args.previewUrl - BC labels for menu
 * @param {string} args.brLink - business rule engine ui link
 * @param {object} args.associatedBCDefinitions
 * @param {string} [args.performanceDashboardMode='default']
 * @constructor
 */
dexit.app.ice.edu.Main = function(args) {
    'use strict';
    var self = this;
    var noOp = function() {
    };

    self.creativeBriefFolderId = args.creativeBriefFolderId || '';

    self.bccChannelUrl = args.bccChannelUrl || 'ps-ice4mm.herokuapp.com/customer-portal';

    //make sure components are registered
    dexit.app.ice.edu.components.register();

    //merchandising channel variables
    self.merchandisingChannelBCi = ko.observableArray([]);
    self.showMerchandisingPlayer = ko.observable(false);


    self.previewUrl = args.previewUrl;

    //flag for fixing flickering of elements that require ko to be loaded to toggle visibility
    self.isKOLoaded = ko.observable(true);

    self.userProfile = ko.observable();
    self.currentRole = ko.observable(args.currentRole);
    self.currentYear = ko.observable(new Date().getFullYear());
    self.bcLabel = ko.observable();

    //promotion channel variables
    self.promoActive = ko.observable(false);
    self.promoId = ko.observable();

    //for BC Creation and update
    self.bcCreationVM = ko.observable();


    self.performanceDashboardMode = args.performanceDashboardMode || 'default';


    self.currentPage = ko.observable('');

    self.goToMerchandisingLayout = function(data) {
        //make sure user is set for uccVM before execution
    };


    /*TODO move spinner related classes to overall approach, including ones in courseVM and mainVM
     */
    //these will be called in reportWidgetVM.generateReport()
    self.spinner = {
        CSS_SPINNER_CLASS_ON: 'fa fa-spinner fa-pulse fa-2x',
        CSS_SPINNER_CLASS_OFF_ERROR: 'fa fa-exclamation-triangle no-content fa-2x',
        CSS_SPINNER_CLASS_REPORT: 'fa fa-table'
    };
    /*initialize spinner class*/
    self.spinnerClassName = ko.observable(self.spinner.CSS_SPINNER_CLASS_ON);


    self.showCreatePreloader = function() {
        document.querySelector('.create-preload').classList.add('show-create-preloader');
    };
    self.currentAssociatedEptWidgetReport = [];
    self.eptReportMapping = [];


    // self.prepareReportsByMetrics = function(eptId, metricsList, callback){
    //     //check the callback function
    //     callback = callback || noOp;
    //     //get all possible reports
    //     var param = {associatedBCName: 'reports', subBCType: 'widgetReport', bcType: self.currBCDef().bctype};
    //     var allWidgetReportList = self.getAssociatedBCIns(param);
    //     var assocatedWidgetReportList = [];
    //     if(_.isArray(allWidgetReportList) && allWidgetReportList.length > 0){
    //         var allReports = _.after(allWidgetReportList.length, function(){
    //             //render uniq list to UI
    //             self.eptReportMapping.push({eptId: eptId, reports: assocatedWidgetReportList});
    //             self.widgetReportList(_.uniq(self.currentAssociatedEptWidgetReport));
    //         });
    //         _.each(allWidgetReportList, function(report, index){
    //             var metricIds = _.map(report.definition, 'metricId');
    //             var hasSameMetric = false;
    //             //check metricsLit to return report definitions that contains same metrics
    //             _.each(metricsList, function(metric, index){
    //                 if(_.includes(metricIds, parseInt(metric))){
    //                     hasSameMetric = true;
    //                 }
    //             });
    //             if(hasSameMetric){
    //                 //save all reports with metrics association, may have duplicates
    //                 assocatedWidgetReportList.push(allWidgetReportList[index]);
    //                 self.currentAssociatedEptWidgetReport.push(allWidgetReportList[index]);
    //             }
    //             allReports();
    //         });
    //     }else{
    //         console.log('reports definition not found for type =' + param.subBCType +' bcType=' + parma.bcType);
    //     }
    //
    // };

    //TODO: remove, moved to bc instance
    self.updatePatternWithRegions = function() {

        storyboard_VM.save(function (err, updatedEP) {
            if (err) {
                //TODO:should handle error
            }else {
                //update selected widget's reference for pattern
                self.selectedWidget().ePatterns([updatedEP]);
            }
            storyboard_VM.hideEditView();
        });
    };

    self.viewPublishConfiguration = function(selectedCard) {
        //go to planning
        //selectedCard

        if (selectedCard.parentVM.businessConceptInstance && (selectedCard.parentVM.businessConceptInstance.property.ppObject || selectedCard.parentVM.businessConceptInstance.property.ppId)) {

            selectedCard.parentVM.goToPlanningReview(selectedCard);
        }else {
            //QH: revert to old behaviour
            self.shareEP(selectedCard.chosenTPs(), selectedCard, function () {
                //TODO: handle error
            });


        }

    };

    self.viewStoryElements = function(data) {
        // set the story view and load the canvas / side elements
        var selectedLayout;
        storyboard_VM.edit_mode = true;
        self.createEngagementPlan(true);
        // //FIXME: capture layout by new schema
        self.currentStoryViewParams = {
            scId: data.sc().id,
            epId: data.ePatterns()[0].id,
            epRevision: data.ePatterns()[0].revision || '1',
            epObject : data.sc().property.epObject,
            repo: self.repo,
            cmsMode: data.cmsConfiguration() ||  'internal' //set to WCH for demo  // 'internal' //internal is the default if nothing is set
        };
        var params = _.extend(self.currentStoryViewParams, {});
        try {
            params.epObject = JSON.parse(params.epObject.replace(/(?:\r\n|\r|\n)/g, '\\n'));
        } catch (err) {
            console.error('error occurs when parsing the EP Object from SC property: ' + err);
        }

        self.instantiateStoryView(params, function (err) {
            if (err) {
                self.showFlashWarning('An error occurred loading the CD. Please contact your system administrator.');
            }
        });

    };

    self.selectedRoles = []; //set the entityRelationships with role to BCi
    self.selectedeServices = [];
    self.engagementPoints = [];
    self.selectedBehaviours = [];
    self.selectedBRs = [];
    self.selectedUserProfile = null;
    self.selectedSegmentReport = null;


    /**
     * Array holding available metrics used during creation
     */
    self.allMetrics = ko.observableArray();


    self.widgetReportList = ko.observableArray([]);
    self.widgetReportListforSubBC = ko.observableArray([]);
    /*(XY)decouple this part out from setWidgetReport() so that it is able to reused in courseVM to get
     * {object} bcIns - smartcontentcontainer
     * {string} bcType - match the bcType in bcRelationships
     */
    self.getReportRelationship = function(bcIns, bcType){
        var reportRelationship;
        //find the report association for current role
        if(bcIns.bcRelationships && bcIns.bcRelationships.length > 0){
            _.each(bcIns.bcRelationships, function(bcRelationship, index) {
                if (_.isMatch(bcRelationship,{type: 'association', ref: 'reports'}) &&
                    bcRelationship.refData && bcRelationship.refData.role === self.currentRole() &&
                    bcRelationship.refData.bcType === (bcType ? bcType :self.currBCType())) {
                    reportRelationship = bcRelationship;
                }
            });
        }

        return reportRelationship;
    };
    /*(XY)check and filter the report association to get the accordant report defintiion from businessConceptInstance.property,bcRelationships
     * {object} bcVM - courseVM instance
     * {object} bcVM.businessConceptInstance - sc businessConceptInstance information
     */
    self.setWidgetReport = function(bcVM){
        //ICEMM_184: check BCi's report association from bcRelationships
        // (KB) this exception handlig if  bcVM is passed equal to NULL or businessConceptInstance is passed equal to NULL
        if (!bcVM || !bcVM.businessConceptInstance) {
            console.log('missing bcVM or bcVM.businessConceptInstance');
            return;
        }

        var bcIns = bcVM.businessConceptInstance;

        var currentRole = self.currentRole();
        var intel = _.filter(bcIns.intelligence, function (it) {
            return (it.kind.indexOf('engagementmetric') !== -1 && it.property && it.property.role === currentRole && it.property.present_bcwidget);
        });
        if (intel.length < 1) {
            console.log('nothing to show');
            return;
        }

        bcVM.showWidgetReport(bcIns.id, intel);
        //populate data
        //todo: log any errors
        bcVM.setWidgetReportData(bcIns.id, intel, function() {});

    };
    self.behDefinePermission = ko.observable(false);
    self.brDefinePermission = ko.observable(false);
    self.metricDefinePermission = ko.observable(false);
    self.kpiDefinePermission = ko.observable(false);
    self.segmentReportDefinePermission = ko.observable(false);
    self.userProfileDefinePermission = ko.observable(false);
    self.associatedBCDefinePermission = ko.observable(false);
    self.associatedEntityDefinePermission = ko.observable(false);
    self.tpDefinePermission = ko.observable(false);
    self.mmDefinePermission = ko.observable(false);
    //move the mm observable from courseVM to mainVM
    self.imageMM = ko.observableArray();
    self.videoMM = ko.observableArray();
    self.audioMM = ko.observableArray();
    self.docMM = ko.observableArray();

    //hackisk way
    self.mmIcon = ko.observable();

    self.noImagesAvailable = ko.computed(function() {
        return (self.imageMM() && self.imageMM().length === 0);
    });

    self.noVideoAvailable = ko.computed(function() {
        return (self.videoMM() && self.videoMM().length === 0);
    });

    self.noDocumentsAvailable = ko.computed(function() {
        return (self.docMM() && self.docMM().length === 0);
    });

    self.placeholderValue = ko.observable();
    self.allWidgetReport = [];

    /**
     * Metrics that can be selected for
     */
    self.allMetricsForWidget = ko.observableArray([]);

    self.allBehEpt = [];
    self.allBusinessIntelligence = ko.observableArray();

    self._getAssociatedRolesByBCDef = function(bcDef){
        var roleRelationship = _.find(bcDef.relationships.entityRelationships, {type:'association', ref: 'Roles'});
        if(roleRelationship && roleRelationship.define){
            return roleRelationship.define.value;
        } else {
            return;
        }
    };

    self.ccEDCreateVM = new dexit.app.ice.CCEDCreateVM();

    //for main page make sure to set flag for all metrics
    self.ccEDCreateVM.showAllMetrics = true;

    if (self.performanceDashboardMode && self.performanceDashboardMode === 'cognos') {
        self.performanceVM = new dexit.app.ice.EPPerformanceVM2({ccEDCreateVM:self.ccEDCreateVM});
    }else {
        self.performanceVM = new dexit.app.ice.EPPerformanceVM({ccEDCreateVM:self.ccEDCreateVM});
    }

    self.showBCCreationPage = ko.observable(false);

    self.showBCUpdatePage = ko.observable(false);


    self.showCreateCampaign = function() {

        //Check to see if the user's token is still valid, if not, then the usr will be redirect to login page
        dexit.app.ice.integration.token.checkToken(function(err) {
            if (err) {
                console.log('User token is invalid');
            }
            var params = {
                mainVM:self,
                currBCDef: self.currBCDef(),
                associatedBCDefinitions: args.associatedBCDefinitions,
                parentBCName: ko.utils.unwrapObservable(self.currentParentBCName),
                permissions: {
                    behDefinePermission: self.behDefinePermission,
                    brDefinePermission: self.brDefinePermission,
                    metricDefinePermission:self.metricDefinePermission,
                    segmentReportDefinePermission: self.segmentReportDefinePermission,
                    userProfileDefinePermission: self.userProfileDefinePermission,
                    associatedBCDefinePermission: self.associatedBCDefinePermission,
                    associatedEntityDefinePermission: self.associatedEntityDefinePermission,
                    tpDefinePermission: self.tpDefinePermission,
                    mmDefinePermission: self.mmDefinePermission
                }
            };
            self.bcCreationVM(new dexit.app.ice.BCCreationVM(params));
            self.showSmallSidebar();
            self.bcCreationVM().showCreate();
            self.showBCCreationPage(true);
        });

    };

    self.refreshCards = function(){

        var index = _.findIndex(self.availableBC(), function(val) {
            if (val.bctype && val.bctype.length > 0) {
                if (_.isString(val.bctype[0])) {
                    return (val.bctype.indexOf(self.currBCType()) > -1);
                }else {
                    return val.bctype[0][self.currBCType()];
                }
            }
            //return val.bcType && val.bcType.length > 0 && val.bcType[0][self.currBCType()];
        });

        var ind = (index !== -1 ? index : 0);

        self.showBCInstances(self.availableBC()[ind]);
    };

    self.hideCreate = function() {
        // self.showLargeSidebar();


        self.showBCCreationPage(false);
        //$('.create-campaign-wrapper').removeClass('show-create-campaign');
        self.bcName(null);
        //  $('.product-wrapper').removeClass('selected-product');
        // document.querySelector('.create-preload').classList.remove('show-create-preloader');
        //reload

        //set for currBC
        var index = _.findIndex(self.availableBC(), function(val) {
            if (val.bctype && val.bctype.length > 0) {
                if (_.isString(val.bctype[0])) {
                    return (val.bctype.indexOf(self.currBCType()) > -1);
                }else {
                    return val.bctype[0][self.currBCType()];
                }
            }
            //return val.bcType && val.bcType.length > 0 && val.bcType[0][self.currBCType()];
        });

        var ind = (index !== -1 ? index : 0);

        self.showBCInstances(self.availableBC()[ind]);

    };

    self.availableColours = ['#FFFFFF', '#acffbf', '#434bff', '#fbff08', '#00ffff', '#FF00EE'];

    function generateExtraColours(){
        var startRow = ['#FFFFFF', '#acffbf', '#434bff', '#fbff08', '#00ffff', '#FF00EE'];
        var rows = [];
        var numRows = 3;
        var i;
        var j;
        for (i=0; i < numRows; i++) {
            var row = [];

            for (j=0;j<startRow.length;j++) {

                row.push(tinycolor(startRow[j]).lighten(i*15).toString());
            }
            rows = rows.concat(row);
        }
        return startRow.concat(rows);
    }
    self.extraColours = generateExtraColours();



    self.cardColourPickerVisible = ko.observable(false);

    self.showCardColourPicker = function(data){

        self.selectedCourse(data);
        var existingColour = self.selectedCourse().courseVM.cardColour();

        //set a pending colour
        self.selectedCourse().courseVM.pendingCardColour(existingColour);

        self.cardColourPickerVisible(true);

    };




    //available
    //return tinycolor(sccVM.cardColour()).darken(3).toString();

    //self.color = ko.observable('#FFFFFF');

    self.updateBCCardColour = function(bcInstanceVM){


        var instance = bcInstanceVM.businessConceptInstance;
        var type = instance.property.type || instance.property.class;

        var val = bcInstanceVM.cardColour().replace('#','');
        var changes = [
            {op:'replace', path:'/property/presentation_card_colour', value: val}
        ];
        var params = {
            type: type,
            id: instance.id,
            version: instance.property.version,
            changes: changes
        };
        dexit.app.ice.integration.bcp.updateBCInstance(params, function (err) {
            if (err) {
                //
            }

            var index = _.findIndex(self.availableBC(), function(val) {
                if (val.bctype && val.bctype.length > 0) {
                    if (_.isString(val.bctype[0])) {
                        return (val.bctype.indexOf(self.currBCType()) > -1);
                    }else {
                        return val.bctype[0][self.currBCType()];
                    }
                }
                //return val.bcType && val.bcType.length > 0 && val.bcType[0][self.currBCType()];
            });

            var ind = (index !== -1 ? index : 0);

            self.showBCInstances(self.availableBC()[ind]);

        });

    };




    self.availableBehaviourList = [];

    self.showAlert = ko.observable(false);
    self.alerts = ko.observable({'message': '', 'priority': ''});

    /**
     * Authorizes any facebook groups for a BC
     * Note: Assumes one facebook group
     * @param course
     */
    self.authCourse = function(course) {
        //retrieve all members and store the token to FB group
        var groupURLs = course.courseVM.groupURL();
        var FB_group_id;

        self.selectedSC(course.courseVM.businessConceptInstance);
        /*
         * Display an alert at the end of processing this 'share' click
         */
        var endOfAuth = function(alertObject) {
            self.alerts(alertObject);
            self.showAlert(true);

            setTimeout(function() {
                self.showAlert(false);
            }, 3000);
        };
        _.each(groupURLs, function(groupURL) {
            if (groupURL.groupType.toLowerCase().indexOf('facebook') > -1) {
                FB_group_id = groupURL.url.split('groups/')[1].split('/')[0];
            }
        });

        function handleRetrieveMembers(err, members) {
            var body = {
                groupID: FB_group_id,
                members: []
            };
            if (members && members.length > 0) {
                body.members = members;
                dexit.app.ice.edu.integration.fbgroup.storeUserGroup(body, function(response) {
                    if (response.status != 200) {
                        console.log('facebook usergroup authorization failed!');
                        if (response.responseText && response.responseText !== '') {
                            endOfAuth({'message': response.responseText.message, 'priority': 'error'});
                        } else {
                            endOfAuth({'message': 'facebook usergroup authorization failed!', 'priority': 'error'});
                        }

                    } else {
                        console.log('facebook usergroup authorization success!');
                        endOfAuth({'message': 'facebook usergroup authorization success!', 'priority': 'success'});
                    }
                });
            }
            else {
                console.log('fail to retrieve group members!');
                endOfAuth({'message': 'fail to retrieve group members!', 'priority': 'error'});
            }
        }

        if (FB_group_id) {
            dexit.app.ice.edu.integration.fbgroup.retrieveAllMembers(FB_group_id, handleRetrieveMembers);
        } else {
            endOfAuth({'message': 'No available facebook usergroup to authorize!', 'priority': 'error'});
        }
    };

    self.showUpdateBCInstancePage = function (bcInstance) {
        self.selectedCourse(bcInstance);
        var instanceId = bcInstance.courseVM.businessConceptInstance.id;
        //Check to see if the user's token is still valid, if not, then the usr will be redirect to login page
        dexit.app.ice.integration.token.checkToken(function(err) {
            if (err) {
                console.log('User token is invalid');
            }

            var params = {
                bcId: instanceId,
                mode:'edit',
                mainVM: self,
                currBCDef: self.currBCDef(),
                associatedBCDefinitions: args.associatedBCDefinitions,
                parentBCName: ko.utils.unwrapObservable(self.currentParentBCName),
                permissions: {
                    behDefinePermission: self.behDefinePermission,
                    brDefinePermission: self.brDefinePermission,
                    metricDefinePermission:self.metricDefinePermission,
                    segmentReportDefinePermission: self.segmentReportDefinePermission,
                    userProfileDefinePermission: self.userProfileDefinePermission,
                    associatedBCDefinePermission: self.associatedBCDefinePermission,
                    associatedEntityDefinePermission: self.associatedEntityDefinePermission,
                    tpDefinePermission: self.tpDefinePermission,
                    mmDefinePermission: self.mmDefinePermission
                }
            };

            self.bcCreationVM(new dexit.app.ice.BCCreationVM(params));
            self.showSmallSidebar();
            self.bcCreationVM().showUpdate();
            self.showBCCreationPage(true);
        });



    };

    self.deleteBCModalVisible = ko.observable(false);

    self.showDeleteBCInstanceModal = function(data) {
        self.selectedCourse(data);
        self.deleteBCModalVisible(true);
    };


    self.deleteBCInstanceFromModal = function(){
        var bcInstance = self.selectedCourse();
        self.deleteBCInstance(bcInstance);
    };

    //TODO: need reconsider the scenario for BCi deleting, do we need user know the error for failed to delete tp and sc container?
    //      or just need to remove the role_bc relationships then deal with the deeply deleting from backend
    self.deleteBCInstance = function(bcInstance) {
        var deleteDOM = $('#deleteElement');
        deleteDOM.toggleClass('active', true);
        var instance = bcInstance.courseVM.businessConceptInstance;
        var touchpoints = bcInstance.courseVM.tpm();

        function handleDeleteContainer(err, result) {

            if (err) {
                console.log('failed to delete BC Instance with' + err);
                // deleteDOM.toggleClass('active', false);
                // deleteDOM.append('<span style="color: red">Failed !!!</span>');
                // setTimeout(function() {
                //     $('.popover').popover('hide');
                // }, 2000);
            }

            //RRM-7 remove BCi entity relationships
            var params = {
                type: self.currBCType(),
                id: instance.id
            };
            dexit.app.ice.integration.bcp.removeBCiFromEntityRelationshipById(params, function(err, res){
                if(err){
                    console.log('failed to remove BCi entity relationships for '+ instance.id);
                    deleteDOM.toggleClass('active', false);
                    deleteDOM.append('<span style="color: red">Failed !!!</span>');
                    setTimeout(function() {
                        self.deleteBCModalVisible(false);
                        //$('.popover').popover('hide');
                    }, 2000);
                }
                //remove from list anyway.
                deleteDOM.toggleClass('active', false);
                // deleteDOM.append('<span style="color: green">Success !!!</span>');
                setTimeout(function() {
                    self.listOfBcInstances.remove(bcInstance);
                    self.deleteBCModalVisible(false)
                }, 2000);
            });
        }

        var allTPs = _.after(touchpoints.length, function() {
            dexit.app.ice.integration.bcp.deleteBCInstance(params, handleDeleteContainer);
        });

        function forEachTPs(tp, index, list) {
            function handleDeleteTouchpoint(err, tpResult) {
                if (err) {
                    console.log('Touchpoint cannot be removed.');
                    allTPs();
                }
                else {
                    allTPs();
                }
            }
            if(tp.channelType !== 'ucc' && tp.channelType !== 'mobile' && tp.channelType !== 'twitter'){
                dexit.app.ice.edu.integration.course.touchpoint.deleteTP(tp.tpId, handleDeleteTouchpoint);
            }else{
                //skip deleting the ucc TP
                allTPs();
            }

        }
        //ICEMM-240: remove bcRelationships from assoicated BCi
        //filter report relatioships since they do not have real refIds
        var validBcRelationships = _.filter(instance.bcRelationships, function(BcRelationship){return BcRelationship.ref !== 'reports';});
        if(validBcRelationships && validBcRelationships.length > 0){
            var params_bcRelationships = {
                type: self.currBCType(),
                id: instance.id,
                bcRelationships: validBcRelationships
            };
            dexit.app.ice.integration.bcp.removeRelationshipsFromBCi(params_bcRelationships, function(err, res){
                if(res){
                    var params = {
                        type: self.currBCType(),
                        id: instance.id

                    };
                    if (touchpoints.length > 0) {
                        _.each(touchpoints, forEachTPs);
                    }
                    else {
                        dexit.app.ice.integration.bcp.deleteBCInstance(params, handleDeleteContainer);
                    }
                }else{
                    console.log('failed to remove BC relationships! '+ err);
                }
            });
        } else {
            var params = {
                repo: self.repo,
                type: self.currBCType(),
                id: instance.id

            };
            if (touchpoints.length > 0) {
                _.each(touchpoints, forEachTPs);
            }
            else {
                dexit.app.ice.integration.bcp.deleteBCInstance(params, handleDeleteContainer);
            }
        }

    };

    self.addTouchpoint = function(bcIns) {
        self.selectedCourse(bcIns);
    };
    //end of ICEMM-161
    self.notificationMessages = ko.observableArray();

    self.showNotifications = function() {

        return false;
    };

    self.reportPermission = {
        edit: self.currentRole().indexOf('report-manager') > 1,
        view: self.currentRole().indexOf('report-viewer') > 1 || self.currentRole().indexOf('report-manager') > 1,
        first: self.currentRole().split('-')[0]
    };


    //TODO: remove selectedEPoint is used to locate and get the survey ePt for survey and business rule in createBehaviour and createSurveyBehaviour
    //should create different ePts to support different behaviour then use their own eptName to match ePt
    // self.selectedEPoint = ko.observable('Survey');

    self.listOfSCWidgets = ko.observableArray([]);
    self.feedbackSelected = ko.observable(false);

    // -- Start Flash Message Functionality -- //
    self.thereAreWidgets = ko.observable('Loading content, please wait...');
    self.widgetClassName = ko.observable('fa fa-spinner fa-pulse');

    /**
     * Show a warning/error message
     * @param {string} message - text to show
     */
    self.showFlashWarning = function(message) {
        self.widgetClassName('fa fa-exclamation-triangle no-content');
        self.thereAreWidgets(message);
    };

    /**
     * Show a loading message
     * @param {string} message - text to show
     */
    self.showFlashLoading = function(message) {
        self.widgetClassName('fa fa-spinner fa-pulse');
        self.thereAreWidgets(message);
    };

    /**
     * Show an information message
     * @param {string} message - text to show
     */
    self.showFlashInformation = function(message) {
        self.widgetClassName('fa fa-info-circle');
        self.thereAreWidgets(message);
    };
    // -- Flash Message Functionality -- //

    self.toggle = function() {
        self.feedbackSelected(!self.feedbackSelected());
    };

    // self.showAlertStrip = function(targetStrip) {
    //     $('.alert').removeClass('show-alert-strip');
    //
    //     var currentStrip = document.querySelector(targetStrip);
    //
    //     currentStrip.classList.add('show-alert-strip');
    //
    //     var logoutClose = currentStrip.querySelector('.logout-buttons .btn-danger');
    //     logoutClose.addEventListener('click', self.hideAlertStrip, false);
    //
    //     return false;
    // };
    //
    // self.hideAlertStrip = function() {
    //     $(this).parents('.alert-strip').removeClass('show-alert-strip');
    //
    //     this.removeEventListener('click', self.hideAlertStrip, false);
    // };

    self.logIframeLoaded = function() {

    };


    self.touchpointTypes = ko.observable();
    self.touchpointKeys = ko.observableArray([]);


    // retrieve tp channel types
    self.allowAddTouchpoint = (args.allowAddTouchpoint && args.allowAddTouchpoint === 'true');
    if (self.allowAddTouchpoint && args.tpChannelTypes) {
        self.touchpointTypes(args.tpChannelTypes);
        self.touchpointKeys(_.keys(self.touchpointTypes()));
    }

    // //check current user role in currentRole()
    // self.currPortal = ko.pureComputed(function() {
    //     if (self.currentRole().indexOf('salesManager') > -1 || self.currentRole().indexOf('marketingManager') > -1 || self.currentRole().indexOf('executive') > -1) {
    //         return 'manager';
    //     } else if (self.currentRole().indexOf('productManager') > -1 || self.currentRole().indexOf('marketingDirector') > -1) {
    //         return 'director';
    //     } else {
    //         return 'unknown';
    //     }
    // });
    self.currPortal = ko.observable('manager');

    /**
     * @typedef {object} BCInstanceVMItem
     * @property {number} counter
     * @property {dexit.app.ice.edu.BCInstanceVM}
     */
    /**
     * Holds a list of BC instance VMs
     * @type {ko.observableArray.<BCInstanceVMItem>}
     */
    self.listOfBcInstances = ko.observableArray();
    /**
     * Holds label for parent BC
     * @type {observable}
     */
    self.currentParentBCName = ko.observable('');
    /**
     * Holds type for parent BC (can be different than label
     * @type {observable}
     */
    self.currentParentBCType = ko.observable('');


    // self.engagementEnabled = ko.observable(false);
    self.enableWidgetCreation = ko.observable(false);
    self.fileName = ko.observable(); // storing file name from local storage
    self.uploadImagesID = ko.observable('uploadImages');
    self.uploadVideosID = ko.observable();
    self.uploadFilesID = ko.observable();
    self.mmURL = ko.observable('/images/default.png');
    self.imageURL = ko.observable();
    self.videoURL = ko.observable();
    self.docURL = ko.observable();
    self.createEngagementPlan = ko.observable(false);
    self.functionality = 'my-ice';
    // engagement totals
    self.timer = ko.observable('2');
    // testing temp role
    self.tempRole = 'marketer';
    self.addingTouchPoint = ko.observable(false);
    self.ice4mURL = args.ice4mURL;    //stores the application url (ie ice4m.dexit.co based on the app configuration)

    self.fileTags = ko.observableArray([]);
    /**
     * Finds multimedia associated with this
     * @param callback
     */
    self.loadMMForBC = function(tags, callback) {
        self.imageMM.removeAll();
        self.videoMM.removeAll();
        self.docMM.removeAll();
        callback = callback || noOp;

        //TODO: determine all "tags" we want:  for now its only BCi identifier, it could be "related"
        async.auto({
            getTags: function (done) {
                dexit.app.ice.integration.filemanagement.findFileDetailsByTag(tags, done);
            },
            populateFiles: ['getTags', function (done, result) {
                //populate
                var files =  result.getTags || [];
                self.fileTags(files);
                async.each(files, function (fileInfo, cbFiles) {
                    var tags = fileInfo.tags || [];
                    async.each(tags, function (fileTag, cbTags) {
                        switch (fileTag) {
                            case 'image':
                                self.imageMM.push(fileInfo.url);
                                break;
                            case 'video':
                                self.videoMM.push(fileInfo.url);
                                break;
                            case 'audio':
                                self.audioMM.push(fileInfo.url);
                                break;
                            case 'document':
                                self.docMM.push(fileInfo.url);
                                break;
                        }
                        cbTags();
                    }, cbFiles);
                }, done);
            }]
        }, function (err) {
            if (err) {
                console.error('could not load files for BCi');
            }
            callback(err);
        });
    };
    self.currentMMTag = 'default';
    self.filesUploadCallback = function(uploadId, mmTag, callback) {
        callback = callback || noOp;
        if(self.mmDefinePermission()){
            var fileName = self.fileName(), tags = [];
            var tag = mmTag || self.currentMMTag;
            tags.push(tag);
            dexit.app.ice.integration.filemanagement.file(fileName, tags, uploadId, function(err, response) {
                if (err) {
                    console.log('File is not uploaded');
                }
                else {
                    //reload multimedia for BC
                    self.loadMMForBC(tags,callback);
                }
            });
        }else{
            self.fmVM.uploadFile(uploadId);
        }

    };

    self.log = function(functionName, msg) {
        console.log('MainVM:' + functionName + ':' + msg);
    };


    //observable for channelAuth setting, default is true unless set in args.channelAuth
    self.channelAuth = ((args.channelAuth && args.channelAuth === 'false') ? ko.observable('false') : ko.observable('true'));

    self.timeValue = ko.observable();
    self.selectedBehaviour = ko.observable();
    self.enableOptions = ko.observable(false);


    self.showDashboard = ko.observable(true);
    self.showBCInstancePage = ko.observable(false);
    self.listOfTouchpoints = [];
    self.selectedSC = ko.observable();
    //set if the profile tab should be visible
    self.viewProfile = ko.observable(false);
    self.roles = [];
    self.roles = args.userRoles.split(',');
    self.selectedRole = ko.observable();
    self.ice4eBehaviours = [];


    //allowed file extensions for application
    self.fileTypeRestrictions = ko.observable({
        validImageTypes : '.jpg,.png,.gif,.jpeg,.bmp',
        validVideoTypes : '.mp4',
        validMediaTypes : '.jpg,.png,.gif,.mp4,.jpeg,.bmp',
        validDocumentTypes : '.ppt,.pptx,.pot,.pps,.pptm,.potx,.potm,.ppam,.ppsx,.ppsm,.sldx,.sldm,.txt,.zip,.pdf,.doc,.dot,.docx,.docm,.dotx,.dotm,.docb,.xls,.xlt,.xlm,.xlsx,.xlsm,.xltx,.xltm,.xlsb,.xla,.xlam,.xll,.xlw,.pub'
    });

    self.validFileTypes = ko.pureComputed(function () {
        return [self.fileTypeRestrictions().validMediaTypes, self.fileTypeRestrictions().validDocumentTypes].join(',');
    });

    //option to show touchpoint section in BC object page
    self.showTouchpoint = ko.observable(false);


    //option to show Engagement metric management
    self.showEMPage = ko.observable(false);
    self.emVM = ko.observable();

    //option to show Dynamic Intel Configuratio
    self.showIntelConfigurePage = ko.observable(false);
    self.intelConfigVM = ko.observable();


    //options to show MM tag management Page
    self.showTagsPage = ko.observable(false);
    self.mmTagVM = ko.observable();

    self.currentStoryViewParams = null;
    self.layoutStack = [];


    /**
     * TODO: remove (moved to bc-instance-vm)
     * Wraps calling storyboard storyboard_VM
     * @param {object} args
     * @param {string} args.scId
     * @param {string} args.epId - engagement pattern identifier
     * @param {object} args.epObject - ep UI object passed in from EPA
     * @param {object} args.repo - repository
     * @param callback
     */
    self.instantiateStoryView = function(args, callback) {
        callback = callback || noOp;
        storyboard_VM.previewUrl(self.previewUrl);

        //grab icon for tp to pass in
        // var tpId = args.touchpoint;
        args.tps = _.map(self.selectedCourse().courseVM.tpm(), function(tp) {
            var icon = self.touchpointTypes()[tp.channelType].icon;
            tp.icon = icon;
            return tp;
        });


        //QH: passing reference to main for selectedWidget
        args.mainVM = self;

        self.createEngagementPlan(false);
        // initialize the storyboard API


        //pass in the available multimedia

        //make sure /img/placeholder-xx are not inclided
        args.availableMM = {
            image: _.reject(self.imageMM(), function(val){ return val.indexOf('/img/placeholder-') > -1 }),
            video: _.reject(self.videoMM(), function(val){ return val.indexOf('/img/placeholder-') > -1 }),
            document: _.reject(self.docMM(), function(val){ return val.indexOf('/img/placeholder-') > -1 })
        };
        args.bcInstanceVM = self.selectedCourse().courseVM;

        storyboard_VM.init(args, function(err) {
            if (err) {
                console.log('problem loading content design');
                //TODO: handle error, pass back above this for handling what to show to user
                return callback(err);
            }
            //show view
            self.selectedCourse().courseVM.epAuthoringState('story');
            self.createEngagementPlan(true);

            //load thumbnail view
            //self.instantiatePatternThumbnail(args);
            callback();
        });


        //
        $('.widget-preloader').addClass('hidden');
        $('.clear-error-message').addClass('hidden');
        $('.courses-loading').remove();


    };

    // /**
    //  * //TODO: remove (moved to bc-instance-vm)
    //  * Show preview (non-editable) of EP based on UI object
    //  * Should be called only when container (div with class pattern-preview) is visible
    //  * @param {object} args
    //  */
    // self.instantiatePatternThumbnail = function(args) {
    //     //show thumbnail view of the pattern during storyboard creation
    //     if (dexit.epm.epa.integration.graph) {
    //         dexit.epm.epa.integration.graph.clear();
    //     }else {
    //         dexit.epm.epa.integration.graph = new joint.dia.Graph();
    //     }
    //
    //     var graph = dexit.epm.epa.integration.graph;
    //
    //
    //
    //     var workArea =$('#pattern-preview-area');
    //
    //     var inserted = $(workArea).append('<div id="preview-paper" class="drop-here paper"></div>');
    //     var paper = $(workArea).children('#preview-paper');
    //
    //
    //     var previewPaper = new joint.dia.Paper({
    //         el: paper,
    //         width: paper.width(),
    //         height: paper.height(),
    //         gridSize: 1,
    //         model: graph,
    //         // mark interactive as false
    //         interactive: false
    //     });
    //
    //     //make sure custom shapes are available
    //     dexit.epm.epa.integration.prepareShapes();
    //     //load
    //     dexit.epm.epa.integration.loadEPUIObject(args.epObject);
    //
    // };


    //ice4mm
    self.availableBC = ko.observableArray([]);
    self.currBCRoleMapping = ko.observable();
    self.currBCType = ko.observable();
    self.currSubBCType = ko.observable();
    self.currBCDef = ko.observable();
    self.currentBCInsList = ko.observable([]);

    self.bcloaded = ko.observable(false);

    self.enableLoadKPIReport = ko.observable(false);


    self.showBCInstancesFromLP = function(index) {

        var avail = self.availableBC()[ko.unwrap(index)];
        self.showLandingScreen(false);
        self.showBCInstances(avail);
    };


    self.showBCInstanceDefineFromLP = function(index) {

        var bcConfig = self.availableBC()[ko.unwrap(index)];
        self.showLandingScreen(false);
        self.showBCInstances(bcConfig);
        self.showCreateCampaign();
    };

    /**
     * set current selected BC and show BC instances
     * @param {object} bcConfig - bc setting from config file
     */
    self.showBCInstances = function(bcConfig) {
        self.showBCCreationPage(false);
        //$('.create-campaign-wrapper').removeClass('show-create-campaign');
        self.bcName(null);

        self.showTagsPage(false);
        self.showEMPage(false);
        self.showRMPage(false);
        self.showBRPage(false);
        self.showTouchpoint(false);
        self.showBRPage(false);
        self.showIntelConfigurePage(false);
        // self.showLargeSidebar();
        self.currentParentBCName(bcConfig.label);
        self.currentParentBCType(bcConfig.name);
        //set current BC and definition
        self.currBCRoleMapping(bcConfig);

        self.showDashboard(true);
        self.goToMyBCs();
        self.portalVM = new dexit.app.ice.edu.portal(args, self);
        self.portalVM.showProducerPortal(bcConfig, function(err) {
            // _.each(self.listOfBcInstances, function(val) {
            //     self.setWidgetReport(val.courseVM);
            // })
        });

    };
    self.goToEMPage = function () {
        self.showTagsPage(false);
        self.showLandingScreen(false);
        self.showTouchpoint(false);
        self.showDashboard(false);
        self.showBCInstancePage(false);
        self.showRMPage(false);
        self.showBRPage(false);
        self.showIntelConfigurePage(false);


        if (!self.emVM()) {
            self.emVM(new dexit.app.ice.EngagementMetricVM());
        }



        self.currentPage('em');

        //TODO: show navigation

        // self.showLargeSidebar();
        self.showEMPage(true);
        self.emVM().goToList();
    };


    self.goToTagsPage = function () {
        self.showEMPage(false);
        self.showLandingScreen(false);
        self.showTouchpoint(false);
        self.showDashboard(false);
        self.showBCInstancePage(false);
        self.showRMPage(false);
        self.showBRPage(false);
        self.showIntelConfigurePage(false);


        if (!self.mmTagVM()) {
            self.mmTagVM(new dexit.app.ice.MMTagsVM());
        }



        self.currentPage('tag');

        //TODO: show navigation

        // self.showLargeSidebar();
        self.showTagsPage(true);
        self.mmTagVM().goToList();
    };


    self.goToIntelConfigurePage = function () {
        self.showTagsPage(false);
        self.showLandingScreen(false);
        self.showTouchpoint(false);
        self.showDashboard(false);
        self.showBCInstancePage(false);
        self.showRMPage(false);
        self.showBRPage(false);
        self.showEMPage(false);


        if (!self.intelConfigVM()) {
            self.intelConfigVM(new dexit.app.ice.IntelligenceConfigurationVM());
        }



        self.currentPage('em');

        //TODO: show navigation

        // self.showLargeSidebar();
        self.showIntelConfigurePage(true);
        self.intelConfigVM().goToList();
    };



    self.goToBRPage = function () {
        self.showTagsPage(false);
        self.showLandingScreen(false);
        self.showTouchpoint(false);
        self.showDashboard(false);
        self.showBCInstancePage(false);
        self.showRMPage(false);
        self.showEMPage(false);
        self.showIntelConfigurePage(false);

        self.currentPage('em');

        var params = {
            brLink: ko.utils.unwrapObservable(self.brLink)
        };
        if (!self.brMngVM()) {
            self.brMngVM(new dexit.app.ice.BRManagementVM(params));
        }


        // self.showLargeSidebar();
        self.showBRPage(true);

        //self.emVM().goToList();
    };




    self.showRMPage = ko.observable(false);
    self.roleMngVM = ko.observable();


    self.showBRPage = ko.observable(false);
    self.brMngVM = ko.observable();


    /**
     * Show the role manage
     */
    self.goToRoleManagementPage = function() {
        self.showLandingScreen(false);
        self.showLandingScreen(false);
        self.showTouchpoint(false);
        self.showDashboard(false);
        self.showBCInstancePage(false);
        self.showEMPage(false);
        self.showBRPage(false);

        if (!self.roleMngVM()) {
            self.roleMngVM(new dexit.app.ice.RoleManagementVM());
            self.roleMngVM().init();
        }

        //TODO: show navigation

        // self.showLargeSidebar();
        self.showRMPage(true);
        self.roleMngVM().goToList();
    };


    self.widgetReport = ko.observableArray([]);

    //associate product instance and/or roles to merchandising/marketing
    self.bcName = ko.observable(null);
    self.productList = ko.observableArray([]);
    self.associatedRoles = ko.observableArray([]);


    //
    self.saveTouchpointCampaignAllocation = function(params) {




        var bcVM = self.selectedTPBCi;



        //var card = sccVM.selectedCard();

        var choices = self.allocationRegion();

        var values = _.map(choices, function(val) {
            return {
                program: val.selectedProgram(),
                campaign: val.selectedCampaign(),
                elementId: val.elementId,
                region: val.region
            };
        });



        var ep = self.allocationEP();

        if (!ep) {
            alert('cannot save to empty ep');
            return;
        }
        var tp = ep.pattern.touchpoints[0];

        var primary = true;

        //save
        var resource = '/tp-allocator/' + encodeURIComponent(ep.id) + '?touchpoint='+encodeURIComponent(tp);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.update(values, function (err) {
            if (err) {
                //TODO
                console.log('error saving');
            }
            //self.refreshCards();

            self.touchpointCampaignAllocatorVisible(false);

        });

    };
    self.isPrimaryAllocation = ko.observable(false);
    self.tpAllocatorLayout = ko.observable();
    self.touchpointCampaignTitle = ko.observable('');
    self.allocationRegion = ko.observable('');
    self.allocationEP = ko.observable();
    self.selectedTPBCi = null;

    self.showTouchpointCampaignAllocatorModal = function(selected) {

        self.allocationRegion();
        self.tpAllocatorLayout();
        self.allocationEP();

        var bcVM = (selected && selected.courseVM ? selected.courseVM : null);

        self.selectedTPBCi = bcVM;
        if (!bcVM) {
            console.log('missing required parameter');
            return;
        }
        //{layout: tpAllocatorLayout, name: touchpointCampaignTitle,  allocationRegion: allocationRegion  }

        //check if the current TP has any engagement patterns (if it does not then one needs to be created
        if (bcVM.businessConceptInstance.smartcontentobject && bcVM.businessConceptInstance.smartcontentobject.length < 1) {
            bcVM.createTPCampaignForAllocator('default campaign', function (err) {
                if (err) {
                    console.log('erro creating campaignr %o',err);
                    alert('failed to find campaign for allocation');
                }else {
                    //call this function again
                    self.showTouchpointCampaignAllocatorModal(selected);
                }
            })


        }else {


            //check if current Touchpoint Engagement Plan is the primary one for  allocation
            var primaryEP = (bcVM.businessConceptInstance.property && bcVM.businessConceptInstance.property.primary_tp_ep_id ? bcVM.businessConceptInstance.property.primary_tp_ep_id : null);
            if (!primaryEP) {
                alert('No primary EP has been configured.  Please go and create one first');
                return;
            }
            self.isPrimaryAllocation(true);
            //load primary EP
            dexit.app.ice.integration.engagementpattern.retrieve(primaryEP, 'latest', function (err, ep) {
                if (err) {
                    return;
                }

                self.allocationEP(ep);

                var name = bcVM.businessConceptInstance.property.name + (ep.pattern && ep.pattern.name ? ' ' + ep.pattern.name : '');
                self.touchpointCampaignTitle(name);

                //only on for TP EP
                var layout = ep.pattern.tp[0].layout;
                var tpId = (ep.pattern.touchpoints && ep.pattern.touchpoints.length > 0 ? ep.pattern.touchpoints[0] : '');


                self.tpAllocatorLayout(layout);

                async.auto({
                    loadAvailable: function (cb) {
                        bcVM._loadAvailableProgramsAndCampaigns(tpId, function (err, progsCamps) {
                            cb(err, progsCamps);
                        });
                    },
                    loadAvailableAllocations: function (cb) {

                        //filter to only the allocated elements
                        var allocated = _.filter(ep.pattern.element, function (element) {
                            return (element && element.type === 'intelligence' && element.subType && element.subType === 'dynamic-ept-params');
                        });

                        var allocatedIds = _.map(allocated, 'id');


                        //now look in layout.regions
                        var match = [];

                        _.each(layout.regions, function (elementIds, regionId) {

                            _.each(elementIds, function (elementId) {
                                if (allocatedIds.indexOf(elementId) !== -1) {
                                    match.push({name: regionId, region: regionId, elementId: elementId});
                                }
                            });

                        });
                        cb(null, match);
                    },
                    loadExistingAllocations: ['loadAvailableAllocations', function (cb, result) {
                        var tp = ep.pattern.touchpoints[0];
                        //save
                        var resource = '/tp-allocator/' + encodeURIComponent(ep.id) + '?touchpoint=' + encodeURIComponent(tp);
                        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
                        restStrategy.retrieve(function (err, result) {

                            if (err) {
                                return cb(err);
                            }
                            var toReturn = _.groupBy(result, 'region'); //group by region

                            cb(null, toReturn);

                        });


                    }]

                }, function (err, results) {

                    var availProgCamps = results.loadAvailable || [];
                    var existing = results.loadExistingAllocations || {};


                    var output = _.map(results.loadAvailableAllocations, function (allocation) {
                        var availPrograms = ko.observableArray(_.map(availProgCamps, 'title'));
                        var toRet = {
                            availProgCamps: availProgCamps,
                            name: allocation.name,
                            elementId: allocation.elementId || '',
                            region: allocation.region || '',
                            availablePrograms: availPrograms,
                            selectedProgram: ko.observable(),
                            selectedCampaign: ko.observable()

                        };

                        var saved = (existing[toRet.region] && existing[toRet.region].length > 0 ? existing[toRet.region][0] : null);

                        //existing
                        if (toRet.region && saved) {

                            _.each(availProgCamps, function (item) {
                                var items = item.items || [];
                                var found = _.find(items, function (it) {
                                    return (it.id === saved.epId);
                                });
                                if (found) {
                                    toRet.selectedProgram(item.title);
                                    toRet.selectedCampaign(found);
                                }
                            });
                        }
                        toRet.availableCampaigns = ko.pureComputed(function () {
                            var program = toRet.selectedProgram();

                            //now look in availProgCamps
                            var campaigns = _.find(toRet.availProgCamps, {title: program});
                            return (campaigns && campaigns.items ? campaigns.items : []);
                        });  //ko.observableArray([]);

                        return toRet;

                    });
                    self.allocationRegion(output);

                    $('.modal-loading').addClass('hidden');

                });

                self.touchpointCampaignAllocatorVisible(true);
                $('.modal-loading').removeClass('hidden');


            });
            //location ep


        }


    };

    self.touchpointCampaignAllocatorVisible = ko.observable(false);


    /**
     * @typedef AssociatedBC
     * @property {string} id
     * @property {string} name
     * @property {string} type
     * @property {object[]} associatedBehaviours
     * @property {object[]} associatedBRs
     */

    /**
     * @callback MainVM~AssociatedBCCallback
     * @param {Error} [err]
     * @param {Error} [AssociatedBC]
     */

    /**
     * Retrieves array of of Associated BC instances of specified type
     * @param {object} args
     * @param {string} args.type - BC type (ie. 'offer')
     * @param {string} args.role - current role name
     * @param {object} [args.constraints={}] - any constraints on retrieving data
     * @param {boolean} [args.constraints.excludeBehaviours=false] - if set, then do not try to retrieve behaviours
     * @param {MainVM~AssociatedBCCallback} callback -
     */
    self.getAssociatedProductIns = function(args, callback) {
        callback = callback || noOp;
        var excludeBehaviours = (args.constraints && args.constraints.excludeBehaviours  && args.constraints.excludeBehaviours === true ? true:false);
        //RRM-7 check Role BCi relationships to get all product type instances
        var params = {
            type: args.type,
            role: args.role
        };
        var list = [];
        //check if user can retrieve it (returns ids of matching bci)
        dexit.app.ice.integration.bcp.retrieveBCiFromEntityRelationshipByRole(params, function(err,res){
            if (err) {
                //self.productList(list);
                return callback(err); //may include not found

            }
            res = res || [];

            async.each(res, function(bcInstanceId, done) {
                var params_retrieve = {
                    repo: self.repo,
                    type: args.type,
                    id: bcInstanceId.bci_id
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(params_retrieve, function (err, bcIns) {
                    if (err) {
                        console.log('can not retrieve BC instances!');
                        done();
                    } else {

                        if (excludeBehaviours) {
                            list.push({
                                id: bcIns.id,
                                name: bcIns.property.name,
                                type: bcIns.property.class || bcIns.property.type,
                                description: bcIns.property.description || '',
                                associatedBehaviours: [],
                                associatedBRs: []
                            });
                            done();
                        }else {


                            //get associated behaviours
                            var params = {
                                id: bcIns.id,
                                type: bcIns.property.class,
                                filterArgs: {
                                    tag: 'sc',
                                    local: false
                                }
                            };
                            dexit.app.ice.integration.bcp.listBCBehaviours(params, function(err, result){
                                if(err){
                                    console.log('can not retrieve related behaviours!');
                                    done();
                                }else {
                                    var currBehaviours = [];
                                    var currBRS = [];
                                    _.each(result, function(beh){
                                        if(beh.property.ds && beh.property.display){
                                            var behObj = {
                                                scId: bcIns.id,
                                                behId: beh.id,
                                                ds: beh.property.ds,
                                                display: beh.property.display, //could use to display icon in list
                                                behaviour: beh.property
                                            };
                                            if(beh.property.eptName && beh.property.eptName === 'Business Rule'){
                                                currBRS.push(behObj);
                                            } else {
                                                currBehaviours.push(behObj);
                                            }


                                        } else {
                                            //check the beh digital service data
                                            console.log('ds/display for this behaviour not found!');
                                        }


                                    });
                                    list.push({
                                        id: bcIns.id,
                                        name: bcIns.property.name,
                                        type: bcIns.property.class || bcIns.property.type,
                                        description: bcIns.property.description || '',
                                        associatedBehaviours: currBehaviours,
                                        associatedBRs: currBRS
                                    });
                                }
                                done();
                            });

                        }
                    }
                });
            }, function(){
                if(list.length === 0){
                    console.log('no related instances associated with current role: '+ self.currentRole());
                }
                self.productList(list);
                callback(null,list);
            });
        });
    };


    self.getAssociatedBCInfo = function(args, callback) {
        callback = callback || noOp;
        var excludeBehaviours = (args.constraints && args.constraints.excludeBehaviours  && args.constraints.excludeBehaviours === true ? true:false);
        //RRM-7 check Role BCi relationships to get all product type instances
        var params = {
            type: args.type,
            role: args.role
        };
        var list = [];
        //check if user can retrieve it (returns ids of matching bci)
        dexit.app.ice.integration.bcp.retrieveBCiFromEntityRelationshipByRole(params, function(err,res){
            if (err) {
                //self.productList(list);
                return callback(err); //may include not found

            }
            res = res || [];

            async.each(res, function(bcInstanceId, done) {
                var params_retrieve = {
                    repo: self.repo,
                    type: args.type,
                    id: bcInstanceId.bci_id
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(params_retrieve, function (err, bcIns) {
                    if (err) {
                        console.log('can not retrieve BC instances!');
                        done();
                    } else {

                        if (excludeBehaviours) {
                            list.push({
                                id: bcIns.id,
                                name: bcIns.property.name,
                                type: bcIns.property.class || bcIns.property.type,
                                description: bcIns.property.description || '',
                                associatedBehaviours: [],
                                associatedBRs: []
                            });
                            done();
                        }else {


                            //get associated behaviours
                            var params = {
                                id: bcIns.id,
                                type: bcIns.property.class,
                                filterArgs: {
                                    tag: 'sc',
                                    local: false
                                }
                            };
                            dexit.app.ice.integration.bcp.listBCBehaviours(params, function(err, result){
                                if(err){
                                    console.log('can not retrieve related behaviours!');
                                    done();
                                }else {
                                    var currBehaviours = [];
                                    var currBRS = [];
                                    _.each(result, function(beh){
                                        if(beh.property.ds && beh.property.display){
                                            var behObj = {
                                                scId: bcIns.id,
                                                behId: beh.id,
                                                ds: beh.property.ds,
                                                display: beh.property.display, //could use to display icon in list
                                                behaviour: beh.property
                                            };
                                            if(beh.property.eptName && beh.property.eptName === 'Business Rule'){
                                                currBRS.push(behObj);
                                            } else {
                                                currBehaviours.push(behObj);
                                            }


                                        } else {
                                            //check the beh digital service data
                                            console.log('ds/display for this behaviour not found!');
                                        }


                                    });
                                    list.push({
                                        id: bcIns.id,
                                        name: bcIns.property.name,
                                        type: bcIns.property.class || bcIns.property.type,
                                        description: bcIns.property.description || '',
                                        associatedBehaviours: currBehaviours,
                                        associatedBRs: currBRS
                                    });
                                }
                                done();
                            });

                        }
                    }
                });
            }, function(){
                if(list.length === 0){
                    console.log('no related instances associated with current role: '+ self.currentRole());
                }
                self.productList(list);
                callback(null,list);
            });
        });
    };





    self.selectedDashboardIntelligence = ko.observableArray();
    self.availableDashboardIntelligence = ko.observableArray();

    /**
     * Updates intelligence to be presented on dashboard
     * @param {string} role - role to associated with intelligence to present
     * *** migrated to dexit.app.ice.EPPerformanceVM
     */
    self.saveDashboardIntelligence = function (role) {
        //migrated to dexit.app.ice.EPPerformanceVM
    };

    //self.engIntelligence = ko.observableArray();
    // self.kpiReportVMs = ko.observableArray();

    self.toggleCharts = function() {

        $('.chart-wrapper').toggleClass('show-chart');

    };

    self.loadDashboardReports = function () {
        //migrated to dexit.app.ice.EPPerformanceVM

    };

    //FIXME:
    self.associatedBCDefinitions = args.associatedBCDefinitions;



    self.selectedBCIns = ko.observable();
    self.eServices = ko.observableArray([]);


    self.allBehaviours = ko.observableArray();
    self.allBRs = ko.observableArray();


    /*
     * get associated BC instance
     * @param {object} params
     * @param {string} params.associatedBCName - associated BC ref from current BC Definition - eg: "reports"
     * @param {string} params.subBCType - associated BC ref from current BC Definition - eg: "widgetReport"
     * @param {string} params.instanceId - current BC instance Id(code) - eg: "EVOU"
     * @param {string} params.level - indicates which page level these metrics are associated - eg: "dashboard"/"EPA"
     * @return
     */
    self.getAssociatedBCIns = function(params) {
        if (!params.associatedBCName) {
            console.log('associated BC Name not found in parameters!');
            return;
        }
        if (!params.subBCType) {
            console.log('sub BC type not found in parameters!');
            return;
        }
        //ICEMM-166
        var associatedBCInstances = args.associatedBCDefinitions[params.associatedBCName];

        if (!associatedBCInstances) {
            console.log('associatedBC ' + params.associatedBCName + ' not found!');
            return;
        }
        var returnedBCIns;
        switch (params.subBCType) {
            case 'widgetReport':
                returnedBCIns = _.filter(associatedBCInstances.widgetReport, function(widgetReport){
                    return ((widgetReport.role === self.currentRole()) && (widgetReport.bcType === params.bcType));
                });
                break;
            case 'kpiReport':
                returnedBCIns = _.filter(associatedBCInstances.kpiReport, function(kpiReport){
                    return(kpiReport.role === self.currentRole() && kpiReport.bcType === self.currBCRoleMapping().name);
                });
                break;
            case 'dashboardReport':
                returnedBCIns = _.find(associatedBCInstances.dashboardReport, {
                    role: self.currentRole(),
                    bcType: self.currBCRoleMapping().name //get bc reference from application level
                });
                break;
        }
        return returnedBCIns;
    };

    /*
     * check entityRelationship to valid if current user should see this BCi
     * @param {object} entityRelationship
     * @param {string} entityRelationship.refId - userId / roleName
     * @param {string} entityRelationship.ref - user / role
     * @return boolean
     */
    var checkBCEntityRelationship = function(entityRelationship) {
        return (entityRelationship.refId === self.userId || entityRelationship.refId === self.currentRole());
    };

    /**
     *
     * @param {string} userInfo - stringified object that should contain id, tenant
     * @return {Error|object} returns error or user information
     */
    function initializeUser(userInfo) {
        if (!userInfo) {
            return new Error('The required user information could not be found!');
        }
        //check if valid user or return error
        try {
            var result = JSON.parse(userInfo);
            if (!result.id || !result.tenant) {
                return new Error('The required user information could not be found!');
            }
            return result;

        } catch (err) {
            return new Error('The required user information could not be found!');
        }
    }
    self.enableSaveDashboardIntelligence = ko.observable(true);

    self.kpiReports = ko.observableArray([]);
    self.selectedKPIReport = ko.observable();

    self.showLandingScreen = ko.observable(true);
    self.configLoaded = ko.observable(false);



    self.showEMMenu = ko.observable(false);
    self.showRMMenu = ko.observable(false);
    self.showBRMenu = ko.observable(false);
    self.showIntelConfigMenu = ko.observable(false);
    self.showTagMenu = ko.observable(false);


    /*
     * replace init() function for ice4mm
     * set available BCs from config file
     * get BC instances list from first available BC
     */
    self.init = function() {

        self.log('init', 'start');
        // load logout modal content
        //$('#logoutModal').load('/logout');

        //initialize user information
        var userInfo = (args && args.user ? args.user : '{}');
        self.user = initializeUser(userInfo);

        if (self.user instanceof Error) {
            self.log('user-initialization',self.user.message);
            self.showFlashWarning('There seems to be an issue with the configuration of your user account. Please contact your administrator.');
            return;
        }
        self.userId = self.user.id;
        self.tenant = self.user.tenant;
        self.repo = self.tenant.replace(/[\/.]/g, ''); // strips out the '.'  and '/' from domain to use as repo
        //todo: change variable name
        self.userProfile(_.pick(self.user, ['name', 'attributes', 'id']));

        if (!self.roles || !self.currentRole()) {
            self.log('init','error:user has no roles configured');
            self.showFlashWarning('There seems to be an issue with the configuration of your user account. Please contact your administrator.');
            return;
        }
        var index = self.roles.indexOf(self.currentRole());
        if (index > -1) {
            self.roles.splice(index, 1);
        }

        //show or hide the profiles option depending if user has more than one possible role (used for supporting switching between roles)
        if (self.roles && self.roles.length > 0) {
            self.viewProfile(true);
        }
        // pass a reference to the ep auth VM
        if (dpa_VM) {
            dpa_VM.mainVM = self;
        }

        args.functionality = 'ice4mm';
        args.notificationMessages = self.notificationMessages;



        self.bucketURL = args.bucket;

        self.epIntegration = new dexit.epm.EPIntegration();
        //dcm functionality for creating multimedia
        self.dcmManagement = new dexit.scm.dcm.ManagementVM(self.repo, self.userId);
        self.bcAuthVM = new dexit.app.ice.edu.bcAuthoring.BCAuthoringVM({
            mainVM: self,
            dcmManagement: self.dcmManagement,
            epIntegration: self.epIntegration
        });



        var brLink = args.brLink || '';
        self.brLink = ko.observable(brLink);
        self.brScreenValue = ko.observable('brms');

        //set menu with availableBC
        if (args.ice4mBCs) {
            try {
                var bcs = JSON.parse(args.ice4mBCs);


                var userDefined = _.filter(bcs, function(item) { return !item.system; });
                var systemDefined = _.filter(bcs, function(item) { return item.system; });


                //todo: filter at server
                var showEMMenu = _.find(systemDefined, {'label':'Metric'});
                var showRMMenu = _.find(systemDefined, {'label':'Role Mng'});
                var showBRMenu = _.find(systemDefined, {'label':'BR Mng'});
                var showTMMenu = _.find(systemDefined, {'label':'Tags'});
                var showIntelConfigMenu = _.find(systemDefined, {'label':'Dynamic Intel'});
                self.showEMMenu(showEMMenu);
                self.showRMMenu(showRMMenu);
                self.showBRMenu(showBRMenu);
                self.showTagMenu(showTMMenu);
                self.showIntelConfigMenu(showIntelConfigMenu);
                self.availableBC(userDefined);



                //load permissions for availableBC
                self._loadPermissionsForAvailableBCs(userDefined,self.currentRole());


                //self.showLandingScreen(true);
                self.configLoaded(true);

                //set first one as default BC to show
                //self.showBCInstances(self.availableBC()[0]);
            }catch (e) {
                console.error('failed to load');
            }
        } else {
            //TODO: remove

            dexit.app.ice.integration.bcm.retrieveBCMappingByRole(args.currentRole, function (err, bcMapping) {
                if (err) {
                    console.log('error to find BC Mapping info by role ' + err);
                } else {
                    self.availableBC(bcMapping);
                    //set first one as default BC to show
                    self.showBCInstances(self.availableBC()[0]);

                }
            });

        }

    };
    self.bcPermissionsLoaded = ko.observable(false);
    self.bcAndPermissions = ko.observableArray([]);

    self._loadPermissionsForAvailableBCs = function(userDefs, role){
        var result = [];
        async.map(userDefs,function(item, cb){
            var bcType= (item.bctype && _.isArray(item.bctype) ? item.bctype[0] : item.bctype);
            if (_.isObject(bcType)){
                bcType = Object.keys(bcType)[0];
            }
            dexit.app.ice.integration.bcm.retrieveBCPermissionByRole(bcType, role, function(err, bcPermission) {
                if (err) {
                    console.log('error in BC permission retrieval:' + err);
                    //result.push({});
                    //cb(new Error(err));
                } else {
                    //cb(null, bcPermission);
                    cb(null,_.extend({parentId: item.id, label:item.label},bcPermission));
                }
               // cb();
            });

        }, function(err, result) {
            var res = result || [];
            self.bcAndPermissions(res);
            self.bcPermissionsLoaded(true);
        });

    };

    //was used in touchpoint-popover
    // self.toggleTPInfo = function(el, data) {
    //     $('.add-tp-help').toggleClass('show-tp-help');
    //
    //     if (el.classList.contains('fa-question-circle')) {
    //         el.classList.remove('fa-question-circle');
    //         el.classList.add('fa-minus-circle');
    //     } else {
    //         el.classList.add('fa-question-circle');
    //         el.classList.remove('fa-minus-circle');
    //     }
    // };

    self.selectedTPType = ko.observable(null);
    self.tpList = [];
    self.tpNameList = ko.observableArray([]);
    self.selectedTP = ko.observable(null);
    self.pendingChannelUrl = ko.observable();
    self.tpsFromBCDef = [];

    self.saveSelectedTP = function() {
        if(self.selectedTP()){
            self.tpsFromBCDef.push({type: self.selectedTPType(), tpInfo: self.selectedTP()});
        } else if(self.pendingChannelUrl()){
            self.tpsFromBCDef.push({type: self.selectedTPType(), tpInfo: self.pendingChannelUrl()});
        }
        self.resetTpType();
    };

    self.tpTypeSelected = function(data) {
        self.selectedTPType(data);
        var argstoSend = {
            tpType: self.selectedTPType || '',
            segment: self.selectedCourse() ? self.selectedCourse().courseVM.associatedSegments() : 'all',
            bcType: self.currBCType() || ''
        };
        var handleRetrievedTps = function(err, res) {

            var forEachTP = function(element, index, list) {
                if (element.tpName !== null && element.tpId !== null) {
                    self.tpNameList.push(element.tpName);
                } else {
                    console.log('touch point id missed or touch point name missed');
                }
            };

            if (err) {
                console.log('touch points cannot be retrieved');
            } else {
                self.tpList = res;
                _.each(self.tpList, forEachTP);
            }
        };

        if (self.selectedTPType() !== null) {
            dexit.app.ice.integration.tpm.findPreconfiguredTPs (argstoSend, handleRetrievedTps);
        } else {
            console.log('channel type is not defined!');
        }

        $('.add-tp-steps').css('left', '-400px');
    };

    self.resetTpType = function(data) {
        var questionIcon = document.querySelector('.more-tp-info');

        self.selectedTPType(null);
        //self.tpList = [];
        self.tpNameList([]);
        self.selectedTP(null);
        $('.add-tp-steps').css('left', '0');

        if (questionIcon && questionIcon.classList.contains('fa-minus-circle')) {
            questionIcon.classList.add('fa-question-circle');
            questionIcon.classList.remove('fa-minus-circle');

            $('.add-tp-help').toggleClass('show-tp-help');
        }

        $('.tp-url-input').removeClass('tp-validate-error');
        $('.tp-url-input input').removeClass('warning-class').val('');

    };

    self.openTouchpointWindow = function(url) {
        if (url.indexOf('ps-ucc') > -1) {
            return false;
        } else {
            var tpWindow = window.open(url, 'tpwindow');
        }
    };

    self.setNavHighlight = function(element) {
        $('.sNav li').removeClass('sNavActive');

        element.classList.add('sNavActive');
    };

    self.closePopover = function() {
        $('.popover').popover('destroy');
    };

    self.selectSC = function(data) {
        if (data) {
            self.selectedSC(data.sc());

        }
    };

    self.selectedWidget = ko.observable();
    self.modalOperation = ko.observable('Create');

    self.prepareCreationModal = function(scType, operation, data) {
        self.bcAuthVM.clearFields();
        var op = (operation || '');
        dpa_VM.referredIntelligence([]);
        if(operation === 'create'){
            $('.flex-report').removeClass('selected-product');
        }
        // close the info window if it's open
        $('.content-scroller').addClass('hidden');

        //Check to see if the user's token is still valid, if not, then the usr will be redirect to login page
        dexit.app.ice.integration.token.checkToken(function(err) {
            if (err) {
                console.log('User token is invalid');
            }
        });

        if ($('.courses-loading')) {
            $('.courses-loading').remove();
        }
        self.modalOperation(operation);



        //show epa
        if (!op || (op !== 'edit' && op !== 'approval')) {
            self.selectedCourse().courseVM.showEPABoard(op);
        }
    };


    self.smallSideBar = ko.observable(true);


    self.toggleSidebar = function() {
        if (self.smallSideBar()) {
            self.showLargeSidebar();
        }else {
            self.showSmallSidebar();
        }
    };


    self.showSmallSidebar = function () {
        self.smallSideBar(true);
    };

    self.showLargeSidebar = function () {
        self.smallSideBar(false);
    };

    self.selectedSection = ko.observable('mybcs');

    self.goToMyBCs = function() {
        self.selectedSection('mybcs');
    };


    /**
     * Loads and shows the enagement performance reports section
     */
    self.goToPerformance = function() {
        self.showLandingScreen(false)

        self.selectedSection('performance');
        self.performanceVM.init({
            bcId: self.currBCRoleMapping().id,
            bcType: ko.utils.unwrapObservable(self.currentParentBCType),
            role: self.currentRole()
        });
        self.performanceVM.load();
    };


    self.deletedSC = ko.observable();

    self.deleteWidget = function(widget, courseVM) {
        var deleteDOM = '#deleteElement';
        $(deleteDOM).toggleClass('active', true);
        var tempSC;

        function handleRemoveWidget(error, response) {
            if (error && error.status !== 504) { //FIXME: ignore 504
                $(deleteDOM).toggleClass('active', false);
                $(deleteDOM).append('<span style="color: red">Failed !!!</span>');
                setTimeout(function() {
                    $('.popover').popover('hide');
                }, 2000);
            }
            else {

                //In engagement pattern execution workaround (in ps-ice), one a new sc is created for the follow up eng points, then its id is stored in the lecture property
                // as releated_engagement_sc. Here, we are removing this related sc whenever a lecture is deleted.
                if (tempSC && tempSC.property && tempSC.property.related_engagement_sc) {
                    dexit.app.ice.integration.scm.deleteSC(self.repo, tempSC.property.related_engagement_sc, function(err, data) {
                        if (err) {
                            console.error('Related engagement sc cannot be removed');
                        }
                    });
                }
                setTimeout(function() {
                    courseVM.widgets.remove(widget);
                    //TODO: re-write delete
                    if (courseVM.mainVM && courseVM.mainVM.createEngagementPlan() === true) {
                        courseVM.mainVM.closeEngagementPlanCreate();
                        courseVM.mainVM.bcAuthVM.clearFields();

                    }
                }, 500);
            }
        }

        function handleSCUnAssignment(data, err) {
            if (err) {
                self.log('deleteWidget', 'Cannot un-assign from container');
                $(deleteDOM).toggleClass('active', false);
                $(deleteDOM).append('<span style="color: red">Failed !!!</span>');
                setTimeout(function() {
                    $('.popover').popover('hide');
                }, 2000);
            }
            if(data) {
                //TODO: should be referring to BC
                dexit.app.ice.integration.scm.retrieveSC(self.repo, widget.sc().id, function(err, res) {
                    if (err) {
                        console.error('Cannot retrieve widget.');
                    } else {
                        tempSC = res; // store the sc to be deleted temporary.
                        //Should have bc reference here but using class as workaround until this is restructured
                        var type = res.property.class || res.property.type;
                        dexit.app.ice.integration.bcp.deleteBCInstance({id:widget.sc().id, type:type},handleRemoveWidget);
                    }
                });
            }
        }

        dexit.app.ice.integration.engagementpattern.deleteSCPatterns(self.repo, widget.sc().id, function(err, res) {
            if (err) {
                console.error('could not delete engagement patterns of sc: ' + widget.sc().id);
                $(deleteDOM).toggleClass('active', false);
                $(deleteDOM).append('<span style="color: red">Failed !!!</span>');
                setTimeout(function() {
                    $('.popover').popover('hide');
                }, 2000);
            } else {
                dexit.app.ice.integration.scm.unassignFromContainer(self.repo, widget.sc().id, courseVM.businessConceptInstance.id, handleSCUnAssignment);
            }
        });

    };

    self.quizMMStartingTag = 200; // number of tags for quiz text, tags are used for layout.
    // 200 is for the question 200+ is for the quiz answer choices


    self.addAEvent = function(behaviour, callback) {
        var forEachAEvent = function(aevent, index, list) {
            if (aevent.property.type === 'click' && aevent.property.global === 'false') {
                self.dcmManagement.addAEvent(behaviour, aevent, function(err, aevent) {
                    if (err) {
                        self.log('addAEvent', 'Could not assign aevent');
                    }
                });
            }
        };
        if (behaviour) {
            _.each(self.dcmManagement.aeObjectsList, forEachAEvent);
        }
        callback();
    };

    self.selectedCourse = ko.observable();




    self.getArrLen = function(inArr) {
        if (inArr && _.isArray(inArr)) {
            return inArr.length;
        }
        return 0;
    };


    self.showAlert = ko.observable(false);

    self.alerts = ko.observable({'message': '', 'priority': ''});

    /**
     * TODO: move logic to bc-instance-vm or utility function, decouple ui manipulation from logic
     * @param {object[]} tp - list of Touchpoints for EP with extended filds
     * @param {string[]} tp[].channelType - channel type for channel instances part of TP (assumes all are the same channel type)
     * @param {string[]} tp[].link - url for channel
     * @param {string[]} tp[].type - old field holding similar value to channel type (do not use)
     * @param theWidget
     * @param callback
     */
    self.shareEP = function(tp, theWidget, callback) {
        callback = callback || noOp;

        /*
        * Display an alert at the end of processing this 'share' click
        */
        var endOfDeployment = function(alertObject) {
            self.alerts(alertObject);
            self.showAlert(true);
            // re-enable button disabled during 'share' function call
            $(shareIdDOM).toggleClass('active', false);
            $(shareIdDOM).attr('disabled', false);
            setTimeout(function() {
                self.showAlert(false);
            }, 3000);
        };

        //validation
        if (!tp || tp.length < 1) {
            endOfDeployment({
                'message': 'Could not be shared. Please choose the channels you want to share to.',
                'priority': 'error'
            });
            return;
        }
        if (!theWidget || !theWidget.ePatterns() || theWidget.ePatterns().length < 1) {
            endOfDeployment({
                'message': 'Could not be shared. Please create an Engagement Plan first!',
                'priority': 'error'
            });
            return;
        }


        var shareIdDOM = '#shareButton' + theWidget.sc().id;
        // disable button until 'endOfDeployment' function is called.
        $(shareIdDOM).toggleClass('active', true);
        $(shareIdDOM).attr('disabled', true);

        var checkedTouchpoints = [];
        var widget = {};
        widget.sc = ko.observable(theWidget.sc());
        widget.id = theWidget.id;
        //widget.index = _.indexOf(self.selectedCourse().courseVM.widgets(), theWidget);
        widget.ePatterns = ko.observableArray(theWidget.ePatterns());
        self.selectSC(widget);
        self.selectedWidget(theWidget);
        var behaviourId;
        //assumption here is one pattern for each EP widgt
        var sharedPattern = theWidget.ePatterns()[0]; //pattern to be shared - should just make a simple observabl



        //update schedule details to show to user
        var updateScheduleVM = function(err) {
            if (err) {
                endOfDeployment({
                    'message': 'Unable to share during specified time!',
                    'priority': 'error'
                });
                return;
            }

            //grab value and update times
            var existing = ko.utils.arrayFirst(self.selectedCourse().courseVM.tempCards(), function(val) {
                return (val.id === widget.id);
            });


            // var indexOf =


            existing.isPatternActive(true);
            if (sharedPattern && sharedPattern.pattern && moment(sharedPattern.pattern.start).isAfter(moment())) {
                existing.scheduleVM.scheduleSDT(moment(sharedPattern.pattern.start).format());
            } else {
                existing.scheduleVM.scheduleSDT(moment().format());
            }
            if (self.selectedWidget().scheduleVM.scheduleEDT() !== '') {
                existing.scheduleVM.scheduleEDT(self.selectedWidget().scheduleVM.scheduleEDT());
            }
            existing.perform('done');
        };

        //update time schedule aspects of EP
        var updateEPSchedule = function() {

            sharedPattern.pattern.start = self.selectedWidget().scheduleVM.scheduleSDT();
            if (self.selectedWidget().scheduleVM.scheduleEDT() !== '') {
                sharedPattern.pattern.end = self.selectedWidget().scheduleVM.scheduleEDT();
            }
            var patternObject = {
                pattern: sharedPattern.pattern,
                scId: self.selectedSC().id,
                repo: self.repo
            };
            dexit.app.ice.integration.engagementpattern.update(sharedPattern.id, sharedPattern.revision, patternObject, function(res) {
                var err;
                if (res.status !== 200) {
                    err = 'error';
                }
                if (err) {
                    self.log('share', 'failed to update pattern with scheduled time');
                    endOfDeployment({'message': 'failed to update pattern with time!', 'priority': 'error'});
                    return;
                }
                self.log('share', 'ep updated with start date and end date');

                //now share
                var object = {
                    scId: self.selectedSC().id,
                    fillInParams:true
                };
                dexit.app.ice.integration.engagementpattern.builder(sharedPattern.id, sharedPattern.revision,  object, updateScheduleVM);
            });
        };



        var allTPs = _.after(tp.length, function() {
            //Note: not sure what this is for
            if (theWidget.sc().image && theWidget.sc().image[0]) {
                self.mmURL(theWidget.sc().image[0].property.location);
            }
            //all valid touchpoints for sharing
            if (checkedTouchpoints && checkedTouchpoints.length > 0) {
                updateEPSchedule();
            }else {
                endOfDeployment({'message': 'Unable to share on any touchpoints!', 'priority': 'error'});
            }
        });

        //Any TP specific handling is put here (ie. logic for facebook group check)
        _.each(tp, function(element) {

            var handleRetrieveFBMembers = function(err, member) {
                var body = {
                    groupID: element.link.split('groups/')[1].split('/')[0],
                    members: []
                };
                if (member) {
                    body.members.push(member);
                    dexit.app.ice.edu.integration.fbgroup.storeUserGroup(body, function (response) {
                        if (response.status !== 200) {
                            var message = (response.responseText && response.responseText !== '' ? response.responseText : 'facebook usergroup authorization failed!');
                            endOfDeployment({'message': message, 'priority': 'error'});
                            return;
                        } else {
                            checkedTouchpoints.push(element.id);
                            allTPs();
                        }
                    });
                }
                else {
                    //short circuit and display error
                    endOfDeployment({
                        'message': 'you are not the member of current facebook group!',
                        'priority': 'error'
                    });
                    return;
                }
            };

            //for facebook group need to make sure user is a member and channelAuth is 'false'
            if (element.channelType.indexOf('facebook') > -1 && element.link.indexOf('groups/') > -1 && self.channelAuth() === 'false') {
                //check the facebook auth here!
                //1. check if the current user is a member of the FB group, if he is not a member yet, notify the user and block the sharing
                //2.if he is already in group, grand the auth
                var groupID = element.link.split('groups/')[1].split('/')[0];
                dexit.app.ice.edu.integration.fbgroup.retrieveMembers(groupID, handleRetrieveFBMembers);
            } else {
                checkedTouchpoints.push(element.id);
                allTPs();
            }

        });

    };

    // TODO - the next 2 functions should be combined into 1 to provide some user feedback for loading of assets
    self.coursePanelsRendered = function(elements, data) {
        if ($('.bc-panel').children().length === self.listOfBcInstances().length) {
            $('.courses-loading').addClass('hidden');
            $('.initial-hide').removeClass('initial-hide');

            // instantiate tool tips
            $('[data-toggle="tooltip"]').tooltip();
        }
    };

    self.lecturePanelsRendered = function(elements, data) {
        $('.courses-loading').remove();
        $('.initial-hide').removeClass('initial-hide');
        $('.iconHover').removeClass('hidden');

        // instantiate tool tips
        $('[data-toggle="tooltip"]').tooltip();
    };

    self.productsRendered = function(elements, data) {
        if ($('.prod-container').children().length === self.productList().length) {
            $('.initial-hide').removeClass('initial-hide');
            $('.products-preloader').remove();
        }
    };

    self.servicesRendered = function(elements, data) {
        if ($('.serv-container.eService-section').children().length === self.eServices().length) {
            $('.hide-services').removeClass('hide-services');
            $('.products-preloader').remove();
        }
    };
    self.behavioursRendered = function(elements, data) {
        if ($('.serv-container.eService-section').children().length === self.allBehaviours().length) {
            $('.hide-services').removeClass('hide-services');
            $('.products-preloader').remove();
        }
    };

    // self.selectedCourseToRegister = ko.observable();

    self.stopVideo = function() {
        $('video').trigger('pause');
    };

    /**
     * Called on closing
     */
    self.closeEngagementPlanCreate = function() {
        //$('.popover').popover('hide');
        self.createEngagementPlan(false);
        //call clean-up
        //dpa_VM.clearPaper();
        //window.removeEventListener('resize', dpa_VM.redrawLines, false);

        $('html, body').animate({scrollTop: 0}, 'slow');
        self.showSmallSidebar();


        if (self.selectedCourse().courseVM) {
            setTimeout(function(){
                self.selectedCourse().courseVM.hideLoader();
            }, 1000);
        }

        //self.showLargeSidebar();

    };



    self.viewOnlyModal = ko.observable(false);


    self.returnToDashboard = function() {
        self.log('returnToDashboard', 'start.');

        //reset uccVM if it is active
        // if (self.showBCInstancePage() === true && self.selectedCourse().courseVM.uccActive()) {
        //     // bccLib.resetAll();
        //     // bccLib.emptyContainer();
        // }
        // self.showLargeSidebar();
        self.showEMPage(false);
        self.showDashboard(true);
        $(window).scrollTop(0);
        $('.courses-loading').removeClass('hidden');
        self.showBCInstancePage(false);

        self.showFlashLoading('loading content, please wait...');
        //self.groupsNotLoaded(true);
        self.createEngagementPlan(false);

        //self.loadDashboardReports();
    };

    self.categoryDS = [];

    self._loadDSCategoryMapping = function() {
        //list available DS and add group by 'category'


        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy('/available-ds-category');
        restStrategy.retrieve(function (err, data) {
            if (err) {
                console.log('problem loading categories');
            } else {

                //QH: pass in directly
                self.categoryDS = data;
                dpa_VM.dsToCategory = data;



            }
        });

    };
    self.tpCampaignCreationVM = ko.observable();
    self.campaignWfVisible = ko.observable(false);
    self.hideWf = function() {
        self.campaignWfVisible(false);
    };
    self.updateElementData = function(id, data){
        debugger;
    };

    self.goToSubBCInstanceCreation = function(bcIns) {
        debugger;
        if (bcIns && bcIns.courseVM) {
            //show campaign creation

            //check if existing campaign exists, so show update instead
            var args = {
                parentParams: {
                    bc: self.currBCType()
                }
            };

            var mode = 'create';

            if (bcIns.courseVM.businessConceptInstance.smartcontentobject && bcIns.courseVM.businessConceptInstance.smartcontentobject.length > 0) {
                self.goToBCInstance(bcIns);
            } else {

                dexit.app.ice.integration.bcm.retrieveBCDefinitionByName(self.currSubBCType(), function (err, bcDef) {
                    if (err) {
                        alert('could not load.');
                        debugger;
                    } else {

                        var edit = (mode && mode === 'edit' ? true : false);
                        var params = {
                            mainVM: self,
                            currBCDef: bcDef,
                            parentParams: args.parentParams,
                            parentBCDef: self.currBCDef(),
                            callingVM: self,
                            name: 'Replace Me',
                            existingData: (args.existingData || null),
                            // parentVM: campaignPlannerVm.callingVM,
                            mode: (edit ? 'edit' : 'create'),
                            associatedBCDefinitions: self.associatedBCDefinitions,
                            parentBCName: ko.utils.unwrapObservable(self.currentParentBCName),
                            permissions: {
                                //fixme
                                behDefinePermission: ko.observable(true),
                                brDefinePermission: ko.observable(true),
                                metricDefinePermission: ko.observable(true),
                                // segmentReportDefinePermission: ko.observable(true),
                                userProfileDefinePermission: ko.observable(true),
                                associatedBCDefinePermission: ko.observable(true),
                                associatedEntityDefinePermission: ko.observable(true),
                                tpDefinePermission: ko.observable(true),
                                mmDefinePermission: ko.observable(true)
                            }
                        };
                        if (args.id) {
                            params.existingId = args.id;
                        }

                        // if (!campaignPlannerVm.campaignCreationVM()) {

                        //}
                        self.tpCampaignCreationVM(new dexit.app.ice.CampaignCreationVM(params));
                        if (!edit) {
                            self.tpCampaignCreationVM().showCreate();
                        } else {
                            self.tpCampaignCreationVM().showUpdate();
                        }
                        self.campaignWfVisible(true);

                    }
                });
            }
        }
    };

    /*
     * go to sub BC instances page from dashboard page
     * @param {object} bcIns - BCi selected on dashboard page
     */
    self.goToBCInstance = function(bcIns) {
        self.showLandingScreen(false);
        //make sure that EPA view is hideen
        self.createEngagementPlan(false);

        self.engagementPoints = [];
        dpa_VM.topLevelComponents([]);

        if (!bcIns) {
            console.log('no BC instance passed as parameter.');
        } else {
            self.selectedCourse(bcIns);

            //set name to show up under "back to ..."
            var index = _.findIndex(self.availableBC(), function(val) {
                return val.bctype && self.currBCType() && val.bctype.length > 0 && val.bctype[0][self.currBCType()];
            });
            var ind = (index !== -1 ? index : 0);
            self.selectedCourse().courseVM.previousName(self.availableBC()[ind].label);
            self._loadDSCategoryMapping();

            self.showTouchpoint(true);
            dexit.app.ice.integration.bcm.retrieveBCDefinitionByName(self.currSubBCType(), function(err, bcDef) {
                if (err) {
                    console.log('error in BC definition retrieval:' + err);
                } else {
                    self.currBCDef(bcDef);
                }
            });

            //ICEMM-242: set report type intelligences
            var reportIntelligences = _.filter(bcIns.courseVM.businessConceptInstance.intelligence, function(reportIntel){return reportIntel.kind === 'intelligence#report';});
            _.each(reportIntelligences, function(reportIntel){
                bcIns.courseVM.availableSegmentReports.push({scId: bcIns.courseVM.businessConceptInstance.id, intelId: reportIntel.id,
                    reportDefinition: JSON.parse(reportIntel.property.definition)});
            });
            //ICEMM-307: set user profile as business intelligence
            var userProfileIntelligence = _.find(bcIns.courseVM.businessConceptInstance.intelligence, function(userProfile){
                return userProfile.property.definition && _.isString(userProfile.property.definition) && (userProfile.property.definition !== '[object Object]') && JSON.parse(userProfile.property.definition).name === 'user profile';
            });
            if(userProfileIntelligence){
                dexit.app.ice.integration.kb.schema.retrieveById(JSON.parse(userProfileIntelligence.property.definition).schema.id, function(err, res){
                    if(err){
                        console.log('failed to list user profile!');
                    } else{
                        bcIns.courseVM.availableUserProfile.push({scId: bcIns.courseVM.businessConceptInstance.id, intelId: userProfileIntelligence.id, records: res.records});
                    }
                });
            }

            var initArgs = {currentPortal: self.currPortal()};
            //if view permission
            //load assert from BC level and initial sub bc VM


            self.enableLoadKPIReport(false);
            self.showDashboard(false);
            self.showBCInstancePage(true);

            bcIns.courseVM.init(initArgs);
            bcIns.courseVM.prepareBehaviours();


        }


        //hides sidebar
        self.showSmallSidebar();
        $(window).scrollTop(0);


    };




    //What is this used for?
    // self.tempBindScroll = function() {
    //     $('.scrollable').bind('mousewheel DOMMouseScroll', function(e) {
    //         var e0 = e.originalEvent,
    //             delta = e0.wheelDelta || -e0.detail;
    //
    //         this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
    //         e.preventDefault();
    //     });
    // };

    //-- BEGIN variables and functions for DEX-SDK ==//

    // /**
    //  * Holds flag if playback has been initialized
    //  * @type {boolean}
    //  */
    // self.playbackInitialized = null;
    //
    // /**
    //  * Holds flag if dex-sdk has been initialized
    //  * @type {boolean}
    //  */
    // self.sdkInitialized = false;
    //
    // /**
    //  * Initialize sdk using provided configuration and sets variables self.sdkInitialized and self.playbackInitialized
    //  * @param {object} self - reference of this
    //  * @param {boolean} self.playbackInitialized - marks that playback is initialized
    //  * @param {boolean} self.sdkInitialized - marks that sdk is initialized
    //  * @param {object} sdkConfig - configuration for sdk
    //  * @param callback
    //  */
    // function runInitialize(self, sdkConfig, callback) {
    //
    //     dexit.device.sdk.initialize(sdkConfig, function(err) {
    //         if (err) {
    //             console.error('could not init sdk');
    //         }
    //         self.sdkInitialized = true;
    //         if (!self.playbackInitialized) {
    //             dexit.scp.scpm.Initialization(sdkConfig, bccLib, function(err, res) {
    //                 if (err) {
    //                     console.error('could not register player');
    //                 } else {
    //                     self.playbackInitialized = res;
    //                 }
    //                 callback();
    //             });
    //         } else {
    //             callback();
    //         }
    //     });
    // }


    /**
     * Load SDK
     * @param {string} channelUrl - channel URL
     * @param callback
     */
    // self.initializeSDK = function(channelUrl, callback) {
    //     /* set config */
    //     if (!args.sdkRequiredServices) {
    //         return callback(new Error('missing configuration. Cannot load sdk'));
    //     }
    //
    //     //don't load in push mode
    //     var sdkConfig = _.omit(args.sdkRequiredServices, ['epEventId', 'epEventKey']);
    //     sdkConfig.channelUrlResolutionFunction = function() {
    //         return channelUrl;
    //     };
    //     sdkConfig.userResolutionFunction = function() {
    //         return self.user.id;
    //     };
    //     sdkConfig.repository = self.repo;
    //     //RE-4 pass mainVM in sdkConfig
    //     if(!sdkConfig.reportEngine){
    //         sdkConfig.reportEngine = self;//TODO: should be an independent module
    //     }
    //     if (self.sdkInitialized) {
    //         //unload previous SDK and initialize agian.
    //         dexit.device.sdk.unload(function(err) {
    //             if (err) {
    //                 console.log('warning error unloading');
    //             }
    //             runInitialize(self, sdkConfig, callback);
    //         });
    //     } else {
    //         runInitialize(self, sdkConfig, callback);
    //     }
    // };

    self.cannotExecute = ko.observable(false);

    self.executeEP = function(sc) {
        var patternId; //currently we execute a lecture at the client side through passing its pattern Id to sdk.
        if (sc && sc.id) {
            async.waterfall(
                [
                    function retrieveLecture(doneRetrieve) {
                        dexit.app.ice.integration.scm.retrieveSC(self.repo, sc.id, doneRetrieve);
                    },
                    function retrieveEngagementPatterns(sc, done) {
                        if (sc && sc.intelligence) {
                            async.each(sc.intelligence, function(intel, cb) {
                                if (intel && intel.kind.indexOf('engagementpattern') > -1 && intel.property && intel.property.location) {
                                    var revision = intel.property.revision || '1';
                                    dexit.app.ice.integration.engagementpattern.retrieve(intel.property.location, revision, function(err, ep) {
                                        if (ep && ep.pattern && ep.pattern.type.indexOf('ucc') > -1) {
                                            patternId = ep.id;
                                        }
                                        cb();
                                    });
                                } else {
                                    cb();
                                }
                            }, done);
                        } else {
                            done();
                        }
                    }
                ], function() {
                    if (patternId) {
                        self.cannotExecute(false);
                        //load the pattern
                        dexit.device.sdk.unloadEngagementPattern(function(err) {
                            if (err) {
                                console.log('warning:error unloading pattern. It may be safe to ignore this message');
                            }
                            dexit.device.sdk.loadEngagementPattern(patternId, function(err) {
                                if (err) {
                                    //could not load engagement pattern
                                    //due to not found, not active etc.
                                    console.log('warning:error loading pattern');
                                }
                            });
                        });
                    } else {
                        // reset any active course icons
                        $('.ucc-channel-icon').removeClass('ucc-lecture-active');
                        document.querySelector('.ucc-preloader').classList.remove('show-ucc-preloader');
                        self.cannotExecute(true);
                    }
                }
            );
        }
    };

    //ICEMM-248: this function will be called from sc-playback as 'report engine' plugin
    /**
     * get sc and intelligence relation to report, then pass report definition to kpiReportVM to render the report
     * @param scId: smart content id from EP element scId
     * @param intelId: intelligence id from EP element typeId
     * @param divId: indicate the div(should be the region id) to render the report
     */
    self.prepareReportByEPIntelligence = function(scId, intelId, callback) {
        //var reportDef; //currently we execute a lecture at the client side through passing its pattern Id to sdk.
        if (scId && intelId) {
            async.auto({
                retrieveSC: function(cb) {
                    dexit.app.ice.integration.scm.retrieveSC(self.repo, scId, cb);
                },
                retrieveIntelligence:['retrieveSC', function(cb, result) {
                    if (result && result.retrieveSC && result.retrieveSC.intelligence) {

                        var found = _.find(result.retrieveSC.intelligence, function(intel) {
                            return (intel && intel.kind.indexOf('intelligence') > -1 && intel.id ===  intelId);

                        });

                        var reportDef = JSON.parse(found.property.definition);
                        cb(null,reportDef);
                    } else {
                        cb(new Error('failed to retrieve sc intelligence!'));
                    }
                }],
                prepareReportEngine:['retrieveIntelligence',function(cb, result) {
                    if(result && result.retrieveIntelligence){

                        var args = {reportTool: 'eCharts', reportDef: result.retrieveIntelligence.definition};
                        self.reportEngine = new dexit.app.ice.reportEngine(args, function(err, res){
                            if(err){
                                cb(new Error('failed to initialize report engine!'));
                            } else {
                                cb(null, {renderInfo: res});
                            }

                        });

                    } else {
                        cb(new Error('failed to retrieve report definition!'));
                    }
                }]
            }, function(err, result) {
                if(err){
                    callback(err);
                } else {
                    var returnedStructure = {intelligence:{type:'report', renderInfo: result.prepareReportEngine.renderInfo}};
                    callback(null, returnedStructure);
                    //self.kpiReportVM.loadReport();
                }
            });
        }
    };
    //-- END variables and functions for DEX-SDK ==//


    //-- BEGIN functions for consumer portal ==//

    /**
     * Removes initial-hide from document element by id (jQuery free)
     * @param {string} id - element id
     * @private
     */
    self._removeInitialHideByElementId = function (id) {
        try {
            document.getElementById(id).classList.remove('initial-hide');
        }catch (e){
        }
    };

    /**
     *
     * @param {string} fileName
     * @param {string} mmType
     * @param {string} bcFileTag
     * @param {string} [baseFolder]
     */
    self.removeMMFromBC = function (fileName, mmType, bcFileTag, baseFolder) {

        if (!fileName || !mmType || !bcFileTag) {
            return; //skip on empty
        }

        //remove from observables
        switch (mmType) {
            case 'document':
                self.docMM.remove(function (val) {
                    return (val && val === fileName);
                });
                break;
            case 'image':
                self.videoMM.remove(function (val) {
                    return (val && val === fileName);
                });
                break;
            case 'video':
                self.videoMM.remove(function (val) {
                    return (val && val === fileName);
                });
                break;
            default:
                console.warn('unrecognized file type %s for removeMM',mmType);
        }
        //remove tag

        //this is full file path, keep only name
        var fileKey = ( (fileName.indexOf('/') > -1 ) ? fileName.split('/').pop() : fileName);
        if (baseFolder && fileName.indexOf(baseFolder) > -1) {
            fileKey = baseFolder + '/' + fileKey;
        }


        dexit.app.ice.integration.filemanagement.removeAppTagsByFileName(fileKey,[bcFileTag], function(err) {
            if (err) {
                console.warn('problem removing file %s',fileKey);
            }
        });
    };


    /**
     * Removes the multimedia file and clear its reference in observable array
     * @param {string} fileName
     * @param {string} mmType
     */
    self.removeMM = function (fileName, mmType) {
        if (!fileName) {
            return; //skip on empty
        }
        switch (mmType) {
            case 'document':
                self.docMM.remove(function (val) {
                    return (val && val === fileName);
                });
                break;
            case 'image':
                self.imageMM.remove(function (val) {
                    return (val && val === fileName);
                });
                break;
            case 'video':
                self.videoMM.remove(function (val) {
                    return (val && val === fileName);
                });
                break;
            default:
                console.warn('unrecognized file type %s for removeMM',mmType);
        }


        //this is full file path, keep only name
        var fileKey = ( (fileName.indexOf('/') > -1 ) ? fileName.split('/').pop() : fileName);
        //remove from observable tags

        //remove file
        dexit.app.ice.integration.filemanagement.deleteFile(fileKey,  function(err) {
            if (err) {
                console.warn('problem removing file %s',fileKey);
            }

        });

        //remove from observable


    };


};
