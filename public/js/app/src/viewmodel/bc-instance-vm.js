/**
 * Copyright Digital Engagement Xperience 2014-2017
 * @description Viewmodel for Engagement Plans of Business Concept
 */
/* global storyboard_VM, dexit, joint, dpa_VM, campaignPlannerVm */


/**
 *
 * @param {object} businessConceptInstance - Business concept instance
 * @param {object} mainVM - reference to the main view model
 * @param {ko.observable} currBCDef
 * @constructor
 */
//TODO => do we really need console.error for things like widget metric data? Is there a better way to track these things, as in many cases these are not actually errors
//

dexit.app.ice.edu.BCInstanceVM = function(businessConceptInstance, mainVM) {

    var noOp = function() {};
    var sccVM = this;
    sccVM.mainVM = mainVM;

    var epIntegration = mainVM.epIntegration;
    var bcAuthVM = mainVM.bcAuthVM;

    sccVM.timelineVM = new dexit.app.ice.EPTimelineVM({parentVM:sccVM});


    sccVM.dynamicCampaign = ko.observableArray();
    sccVM.dynamicCampaignSelectionVisible = ko.observable(false);
    sccVM.availableProgramsAndCampaigns = ko.observableArray([]);

    sccVM.bsb = {
        view: ko.observable(false),
        create: ko.observable(false),
        delete: ko.observable(false),
        clone:ko.observable(false),
        planning:ko.observable(false),
        configure: ko.observable(false),
        allocator: ko.observable(false),
        dynamicCampaign: ko.observable(true), //FIXME
        wf: {

        }
    };

    sccVM.enableDynamicCampaign = ko.pureComputed(function () {
        return (sccVM.bsb && sccVM.bsb.dynamicCampaign() && sccVM.bsb.dynamicCampaign() === true);
    });


    sccVM.enableAllocator = ko.pureComputed(function () {
        return (sccVM.bsb.allocator() && sccVM.bsb.allocator() === true);

    });



    var performanceDashboardMode = (mainVM && mainVM.performanceDashboardMode ? mainVM.performanceDashboardMode : 'default');

    if (performanceDashboardMode === 'cognos') {
        sccVM.performanceVM = new dexit.app.ice.EPPerformanceVM2({parentVM:sccVM, ccEDCreateVM: sccVM.mainVM.ccEDCreateVM});
    }else {
        sccVM.performanceVM = new dexit.app.ice.EPPerformanceVM({parentVM:sccVM, ccEDCreateVM: sccVM.mainVM.ccEDCreateVM});
    }

    sccVM.analysisVM = new dexit.app.ice.EPAnalysisVM({parentVM:sccVM});

    // will be set elsewhere and populated here per EP
    sccVM.uccActive = ko.observable(false);

    sccVM.epAuthoringState = ko.observable('pattern');

    sccVM.previousName = ko.observable('');

    //TODO: non static
    sccVM.gFolderId =  ko.observable('1fWn2z0NKyN-05JkUhkl860Lq6pzu1Xkk');

    // sccVM.iframeLink = ko.pureComputed(function () {
    //     if (sccVM.creativeBriefLink()) {
    //         return sccVM.creativeBriefLink();
    //     }  else {
    //         //return 'https://drive.google.com/drive/u/1/folders/?'
    //
    //     }
    // });

    sccVM.iframeFolderLink = ko.pureComputed(function () {
        return 'https://drive.google.com/embeddedfolderview?id=' + sccVM.gFolderId() + '#list';
    });

    sccVM.windowFolderLink = ko.pureComputed(function () {
        return 'https://drive.google.com/drive/u/1/folders/' + sccVM.gFolderId();
    });

    sccVM.createProgramPlan = ko.observable(false);


    sccVM.showPlannerView = ko.pureComputed(function() {
        var planningEnabled = sccVM.bsb && sccVM.bsb.planning();
        return planningEnabled && sccVM.createProgramPlan();
    });


    sccVM.goToPlanningReview = function(selectedCard) {


        var ep = selectedCard.ePatterns()[0];

        var params = {
            callingVM: sccVM,
            scId: sccVM.businessConceptInstance.id,
            ppObject : sccVM.businessConceptInstance.property.ppObject || '',
            ppId: sccVM.businessConceptInstance.property.ppId || '',
            mainVM: sccVM.mainVM,
            mode: 'review',
            selected: {
                epId: ep.id,
                epRevision: ep.revision,
                scId: selectedCard.sc().id //to highlight
            }
            // repo: .repo,
        };

        sccVM.selectedCard(selectedCard);
        sccVM.createProgramPlan(true);

        sccVM.mainVM.createEngagementPlan(false);
        //
        // var resource = '/tp-allocator/' + encodeURIComponent(ep.id) + '?touchpoint='+encodeURIComponent(tp);
        // var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        // restStrategy.update(values, function (err) {
        //
        //


        campaignPlannerVm.init(params);


    };

    sccVM.goToProgramPlan = function(   ){
        var params = {
            callingVM: sccVM,
            scId: sccVM.businessConceptInstance.id,
            ppObject : sccVM.businessConceptInstance.property.ppObject || '',
            ppId: sccVM.businessConceptInstance.property.ppId || '',
            mainVM: sccVM.mainVM
            // repo: .repo,
        };

        mainVM.createEngagementPlan(false);
        sccVM.createProgramPlan(true);


        //
        // var resource = '/tp-allocator/' + encodeURIComponent(ep.id) + '?touchpoint='+encodeURIComponent(tp);
        // var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        // restStrategy.update(values, function (err) {
        //
        //
        //
        campaignPlannerVm.init(params);
        //
        // });




        // sccVM.mainVM.createEngagementPlan(false);

    };
    sccVM.closeProgramPlan = function(){
        sccVM.createProgramPlan(false);

        //remove loading icon
        sccVM.hideLoader();
    };

    /**
     * Holds the configured stages for tenant
     */
    sccVM.stages = ko.observableArray();

    /**
     * Holds the VM for the stages for tenant
     */
    sccVM.stageVMs = ko.observableArray();


    sccVM.orderedStageVMs = ko.pureComputed(function () {

        var res = _.sortBy(sccVM.stageVMs(), function(val) {
            return (val.displayOrder ? val.displayOrder: 0);
        });

        return res;
    });

    sccVM.groupedVMs = ko.pureComputed(function () {
        var res = [];

        var sorted = sccVM.orderedStageVMs();

        var item = {};

        _.each(sorted, function (val, index) {

            var name = val.name() || '';

            if (name === 'epa'){
                item.inProgress = ko.observable(val);
            }
            switch (name) {
                case 'epa':
                    item = {};
                    item.title = ko.observable('Create');
                    item.inProgress = val;
                    break;
                case 'epa_approval':
                    item.approval = val;
                    res.push(item);
                    item = {};
                    break;
                case 'cd':
                    item = {};
                    item.title = ko.observable('Design');
                    item.inProgress = val;
                    break;
                case 'cd_approval':
                    item.approval = val;

                    // item.count = ko.pureComputed(function () {
                    //     item.approval.
                    // });


                    res.push(item);
                    item = {};
                    break;
                case 'scheduling':
                    item = {};
                    item.single = val;
                    res.push(item);
                    item = {};
                    break;
                case 'published':
                    item = {};
                    item.single = val;
                    res.push(item);
                    item = {};
                    break;
                default:
                    console.log('not handled');
            }
        });

        /**
         *
         *
         * 'epa',
         'epa_approval',
         'cd',
         'cd_approval',
         'scheduling',
         'published'
         */




        return res;
    });


    sccVM.tempCards = ko.observableArray();

    //default fot subcampaign
    sccVM.selectedSection = ko.observable('subcampaign');

    /**
     * Populate list based on stages
     */
    sccVM.populateStages = function() {



        // var data =  [
        //     'epa',
        //     'epa_approval',
        //     'cd',
        //     'cd_approval',
        //     'scheduling',
        //     'published'
        // ];
        //
        // var toPopulate = _.map(data, function(name) {
        //     return _.find(ACTIVITIES, {name:name});
        // });
        var toPopulate = _.map(EPA_WF_STAGES, function(name) {
            return _.find(EPA_WF, {name:name});
        });


        sccVM.stages(toPopulate);

        var stageVMs = _.map(sccVM.stages(), function(stageDefinition) {
            var stageArgs = {
                stageDefinition: stageDefinition,
            };
            return new dexit.app.ice.EPStageVM(stageArgs);
        });
        sccVM.stageVMs(stageVMs);

    };

    sccVM.cardColourPickerVisible = ko.observable(false);


    sccVM.showEPCardColourPicker = function(selected){


        sccVM.selectedCard(selected);

        var existingColour = selected.cardColour();

        sccVM.pendingCardColour(existingColour);

        //self.selectedCourse(data);
        sccVM.cardColourPickerVisible(true);

    };

    sccVM.updateEPCardColour = function(){
        if (!sccVM.selectedCard()){
            return;
        }
        sccVM.selectedCard().updateBCCardColour(sccVM.pendingCardColour());
    };
    sccVM.permissionsLoaded =  ko.observable(false);


    sccVM._preparePermissions = function() {

        //optimize: if permissions already loaded then skip
        if (sccVM.permissionsLoaded()) {
            return true;
        }




        //use EPA_WF_STAGES to add possible permissions
        var keys = {};

        _.each(EPA_WF_STAGES, function (val) {
            keys[val] = ko.observable(false);
        });
        sccVM.bsb.wf = keys;




        //fill in permissions for Campaigns
        var bcName = mainVM.currSubBCType();
        var role = mainVM.currentRole();
        dexit.app.ice.integration.bcm.retrieveBCPermissionByRole(bcName, role, function(err, bcPermission) {
            if (err) {
                console.log('error in BC permission retrieval:' + err);

                //if there is no permission then cannot view

                mainVM.portalVM.childLinkPermission(false);
            } else {
                var permissions = bcPermission.permission || [];
                _.each(sccVM.bsb, function (value, key) {
                    if (key === 'wf') {
                        _.each(value, function (wfValue, wfKey) {
                            if (permissions.indexOf(wfKey) !== -1) {
                                //sccVM.bsb.wf[wfKey] = ko.observable(true);
                                sccVM.bsb.wf[wfKey](true);// = ko.observable(true);
                            }
                        });
                    } else {
                        if (permissions.indexOf(key) !== -1) {
                            //sccVM.bsb[key] = ko.observable(true);
                            sccVM.bsb[key](true);
                        }
                    }
                });

            }

            sccVM.permissionsLoaded(true);
            return true;
        });





    };





    sccVM.campaignDetailsModalVisible = ko.observable(false);

    sccVM.showCampaignDetails = function(){
        sccVM.campaignDetailsModalVisible(true);
    };


    sccVM.deleteEPModalVisible = ko.observable(false);
    sccVM.copyEPModalVisible = ko.observable(false);
    sccVM.showDeleteEPModal = function(selected){
        sccVM.selectedCard(selected);
        sccVM.deleteEPModalVisible(true);
    };
    sccVM.showEPCopyModal = function(selected){
        sccVM.selectedCard(selected);
        sccVM.copyEPModalVisible(true);
    };

    sccVM.scheduleEPModalVisible = ko.observable(false);

    sccVM.selectedStartDate = ko.observable();
    sccVM.selectedStartTime = ko.observable();
    sccVM.timeZone = ko.observable(Intl.DateTimeFormat().resolvedOptions().timeZone);
    sccVM.selectedEndDate = ko.observable();
    sccVM.selectedEndTime = ko.observable();
    sccVM.startDateOptions = {
        dateFormat: 'yy-mm-dd'
    };
    sccVM.endDateOptions = {
        dateFormat: 'yy-mm-dd'
    };

    sccVM.creativeBriefModalVisible = ko.observable(false);
    sccVM.creativeBriefLink = ko.observable('');



    sccVM.programBriefModalVisible = ko.observable(false);

    sccVM.programBriefLink = ko.observable('');


    sccVM.touchpointCampaignAllocatorVisible = ko.observable(false);
    sccVM.allocationRegion = ko.observableArray();
    sccVM.isPrimaryAllocation = ko.observable(false);




    sccVM.createTPCampaignForAllocator = function(name, callback) {
        debugger;
        //create EP with single layout
        var type = sccVM.bcName;
        mainVM.bcAuthVM.propertyTextValue([name]);
        var touchpoints = _.map(sccVM.tpm(), 'tpId');
        var emptyEP = new joint.dia.Graph();
        var emptyEPObj= {cells:[]};
        var theName = mainVM.bcAuthVM.propertyTextValue()[0] || '';
        var params_create = {
            repo: mainVM.repo,
            sctype: mainVM.currBCDef().sctype,
            type: type,
            property: {
                name: theName,
                type: type,
                mainScId: sccVM.businessConceptInstance.id,
                epObject: dexit.epm.epa.integration.graphObjToJSON(emptyEP),  //serialize kouckout EP object and save as JSON in SC object's property
                decObject: null,
                referredIntelligence: null
            }
        };
        dexit.app.ice.integration.bcp.createBCInstance(params_create, function(err, res) {
            if (err) {
                console.error('Cannot create content');
                callback('could not create content');
            } else {
                var params_retrieve = {
                    type: type,
                    id: res.id
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(params_retrieve, function(err, data) {
                    if (err) {
                        console.error('Cannot retrieve content: ' + res.id);
                        callback('could not create content');
                    } else {
                        var property = data.property;

                        // // insert some logic here to make user have the ability to select TPs.
                        // _.each(sccVM.chosenTouchpoints(), function(element) {
                        //     touchpoints.push(element.tpId);
                        // });
                        // store touchpoints id to SC so they can be retrieved when needed.
                        property.touchpoints = touchpoints;
                        dexit.scm.dcm.integration.sc.updateSC(mainVM.repo, data.id, property, function(err){
                            if(err){
                                console.error('fail to store touchpoints to SC' + err);
                            }else{
                                var allTPs = [];
                                sccVM.retrieveTouchpointsDetailsOfBCi(data, function(tpsFromsc) {
                                    allTPs = _.union(sccVM.tpm(), tpsFromsc);
                                    sccVM.alltps(_.uniqBy(allTPs, 'tpId'));
                                });
                            }
                        });

                        //TODO: remove creation of title as part of pattern when schedule for facebook/twitter is retired
                        mainVM.bcAuthVM.createPropertyAsMM(data, function() {
                            var epUItype = 'jointJS';
                            var epUIObject =  emptyEP.toJSON();
                            var tps = touchpoints;

                            //prepare object expected
                            var touchpointsAndLayouts = _.map(tps, function (tpId) {
                                return {touchpoint: tpId, layout: { }, tpParams: { 'allImplictEpts': true}};
                            });

                            var params = {
                                repo: mainVM.repo,
                                data: data, //not currently used,

                                //only need the id in array
                                touchpoints: tps,
                                operation: 'create',
                                epStructure:{
                                    // new UI structure
                                    type: epUItype,
                                    epUIStructure: epUIObject,
                                    // decisionElements: dpa_VM.decisionElements(),
                                    intelligenceElements: []
                                },
                                mainScId: sccVM.businessConceptInstance.id,
                                touchpointsAndLayouts: touchpointsAndLayouts

                            };

                            epIntegration.generateEP(params, bcAuthVM, function(err,ep) {
                                if (err || !ep) {
                                    //do not continue if a problem
                                    //should consolidate and clean-up createBCInstance
                                    return callback(new Error('problem creating EP'));
                                }

                                dexit.app.ice.integration.scm.assignToContainer(mainVM.repo, data.id, sccVM.businessConceptInstance.id, function(response, err) {
                                    dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(mainVM.repo, data.id, function(err, res) {
                                        if (err) {
                                            console.error('Cannot retrieve engagement pattern');
                                        } else if (res && res.length > 0) {
                                            //var currWidgetReportDef = mainVM.getReportRelationship(sccVM.businessConceptInstance, mainVM.currSubBCType());
                                            sccVM.handleChosenTouchpoints(data, function(tpList) {
                                                //skip data on new widget since nothing will be in it yet
                                                var epId = null;
                                                sccVM.retrieveEPWidgetReports({bcInstanceId:sccVM.businessConceptInstance.id,epId:epId}, function (err, widgetReport) {
                                                    if (err) {
                                                        //ignore
                                                        widgetReport = [];
                                                    }
                                                    var card= new dexit.app.ice.EPCardVM({
                                                        sc: data,
                                                        parentVM: sccVM,
                                                        container: sccVM.businessConceptInstance,
                                                        mainVM: mainVM,
                                                        name: data.property.name,
                                                        ePatterns: res,
                                                        widgetReport: widgetReport,
                                                        chosenTPs: tpList,
                                                        // currentStage:  currentStage,
                                                        wf: sccVM.stages()
                                                    });
                                                    card.setCreativeBrief(sccVM.creativeBriefLink());
                                                    sccVM.tempCards.push(card);
                                                    sccVM.addCardsIntoStages(card);

                                                    //
                                                    // sccVM.widgets.unshift(
                                                    //     new dexit.app.ice.edu.EPWidgetVM({
                                                    //         sc: data,
                                                    //         container: sccVM.businessConceptInstance,
                                                    //         mainVM: mainVM,
                                                    //         ePatterns: res,
                                                    //         widgetReport: widgetReport,
                                                    //         chosenTPs: tpList
                                                    //     }));
                                                    sccVM.selectedCard(card);
                                                    mainVM.selectedWidget(card);




                                                    if (additionalParams) {
                                                        if (additionalParams.start_date || additionalParams.end_date) {
                                                            card.updateSchedule(additionalParams.start_date, additionalParams.end_date);
                                                        }
                                                        setTimeout(function(){
                                                            if (additionalParams.cmsConfiguration) {
                                                                card.setCmsConfiguration(additionalParams.cmsConfiguration);
                                                            }
                                                        }, 500);
                                                    }
                                                    //For this one (since externally called, add invalidation)

                                                    sccVM._appendToCampaignList(data);


                                                    callback(null, {sc: data, ep: res});
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            }
        });








    };

    sccVM.saveDynamicCampaignAllocation = function() {
        debugger;

        var card = sccVM.selectedCard();

        var choices = sccVM.dynamicCampaign();

        var ep = (card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0] : null);

        if (!ep) {
            alert('cannot save with empty ep');
            return;
        }
        var tp = ep.pattern.touchpoints[0];


        var values = [];
        _.each(choices, function(val) {
            // _.each(val.selectedCampaigns(), function(campaign) {
            //     values.push({
            //         campaign: campaign,
            //         dynamicPlaceholder: val.dynamicPlaceholder
            //     });
            // });


            _.each(val.selectedCampaignIds(), function(id) {

                //mappedProgCamps.push({'name':'logout',program:'reserved',campaign: {id: '111114'}});

                _.each(val.mappedProgCamps, function(entry) {
                    if (entry && entry.campaign && entry.campaign.id === id) {
                        values.push({
                            campaign: entry,
                            dynamicPlaceholder: val.dynamicPlaceholder
                        });
                    }
                });

            });

        });

        debugger;
        //save
        var resource = '/campaign-dynamic/' + encodeURIComponent(ep.id) + '?touchpoint='+encodeURIComponent(tp);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.update(values, function (err) {
            if (err) {
                //TODO
                console.log('error saving');
            }
            sccVM.dynamicCampaignSelectionVisible(false);
            //check if there is a primary then update this EP with the primary flag

        });
    };


    sccVM.saveTouchpointCampaignAllocation = function() {


        var card = sccVM.selectedCard();

        var choices = sccVM.allocationRegion();

        var values = _.map(choices, function(val) {
            return {
                program: val.selectedProgram(),
                campaign: val.selectedCampaign(),
                elementId: val.elementId,
                region: val.region
            };
        });
        var ep = (card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0] : null);

        if (!ep) {
            alert('cannot save to empty ep');
            return;
        }
//        var tp = ep.pattern.touchpoints[0];


        var tps = ep.pattern.touchpoints;


        var primary = true;

        //save
        var resource = '/tp-allocator/' + encodeURIComponent(ep.id) + '?touchpoint='+encodeURIComponent(tps);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.update(values, function (err) {
            if (err) {
                //TODO
                console.log('error saving');
            }
            //check if there is a primary then update this EP with the primary flag
            if (primary) {
                //update TP with primaryAllocationFlag
                var instance = sccVM.businessConceptInstance;
                var type = instance.property.type || instance.property.class;

                var changes = [
                    {op:'replace', path:'/property/primary_tp_ep_id', value: ep.id}
                ];
                var params = {
                    type: type,
                    id: instance.id,
                    version: instance.property.version,
                    changes: changes
                };

                sccVM._updateBCInstance(params, function (err) {
                    if (err) {
                        //
                    }else {
                        instance.property.primary_tp_ep_id = ep.id;
                    }


                    sccVM.touchpointCampaignAllocatorVisible(false);
                    //sccVM.mainVM.refreshCards();
                });

            }


        });

    };



    sccVM.toAllocatorTitle = ko.observable('');
    sccVM.tpAllocatorLayout = ko.observable();

    sccVM._loadAvailableProgramsAndCampaigns = function(tpId, callback) {
        var relationships = sccVM.bcRelationships;

        var filteredRel = _.filter(relationships, function (val) {
            return (val.ref && val.ref ==='MerchandisingCampaign' && val.navigable && val.navigable === true);
        });

        //add current
        filteredRel.push({refId:sccVM.businessConceptInstance.id});

        //TODO: once extra SC is removed for EP, update this logic
        //TODO: move all to service for efficiency and maintainability
        async.auto({
            retrieveForTp: function (cb) {
                async.map(filteredRel, function (rel, done) {
                    dexit.app.ice.edu.integration.courseManagement.listSharedLectures(rel.refId, function (err, data) {
                        if (err) {
                            console.error('problem retrieving associated BCs...skipping for refId:%s ,err:%o', rel.refId, err);
                            return done();
                        }
                        var tps = (data && data.touchpoints ? data.touchpoints : []);
                        var matchingTp = _.some(tps, function (tp) {

                            if (tpId) {
                                return (tp.tpId === tpId);
                            } else {
                                return (tp.channelType && tp.channelType === 'ucc');
                            }


                        });

                        //skip if campaign is not setup for BCC
                        if (!matchingTp) {
                            return done();
                        }

                        async.map(data.lectures, function(bci, doneEP) {
                            dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(sccVM.mainVM.repo, bci.id, function (err, res) {
                                if (err) {
                                    console.error('Cannot retrieve engagement pattern');
                                    bci.ep = [];
                                    return doneEP(null, bci);
                                }

                                //make sure to only add the ones with matching TP
                                if (res && res.length > 0 && res[0].pattern && res[0].pattern.touchpoints && _.indexOf(res[0].pattern.touchpoints, tpId) !== -1) {
                                    bci.ep = res;
                                    doneEP(null, bci);
                                }else {
                                    //otherwise skip
                                    doneEP();
                                }




                            });
                        }, function (err, res) {
                            if (err) {
                                console.log('error:%o',err);
                            }
                            var eps = res || [];
                            data.lectures = _.compact(eps);
                            done(null,data);
                        });
                    });
                }, function(err, res) {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, _.compact(res));
                });
            },
            build: ['retrieveForTp',function(cb, results) { //for each BC
                var res = results.retrieveForTp;


                var updated = _.map(res, function (item) {

                    var name = item.course.property.name;
                    var mapped = _.map(item.lectures, function (ep) {
                        if (ep.ep && ep.ep.length > 0) {
                            return {
                                name: ep.property.name,
                                id: ep.ep[0].id,
                                scId: ep.id,
                                intelId: 'fixme', //TODO: should reference sc element
                                type: 'intelligence',
                                subType: 'engagement-pattern',
                                subtype: 'engagement-pattern',
                                renderType:'flex-intelligence',
                                src: ep.ep[0].id,
                                // iconType: uiElements.icon_type,
                                renderText: ep.property.name
                            };
                        } else  {
                            return null;
                        }
                    });
                    //remove any null entries
                    var epEntries = _.compact(mapped);


                    // //add entry for dynamic
                    // epEntries.unshift({
                    //     name: 'Latest for ' +name,
                    //     id: item.course.id + 'ep:' + 'latest',
                    //     scId: item.course.id,
                    //     intelId: '{{ep.latest}}', //TODO: should reference sc element
                    //     type: 'intelligence',
                    //     subType: 'engagement-pattern',
                    //     subtype: 'engagement-pattern',
                    //     renderType:'flex-intelligence',
                    //     src: '{{sc:'+item.course.id + ':intelligence:<engagement-pattern>latest(date)}}',
                    //     // iconType: uiElements.icon_type,
                    //     renderText: 'Latest for ' +name
                    // });

                    return {
                        title: name,
                        items: epEntries
                    };

                });

                cb(null,updated);

            }]
        }, function (err, results) {
            if (err) {
                debugger;
                console.log('error retrieving _loadAvailableProgramsAndCampaigns');
                return callback(null,[]);
            }
            var res = results.build;

            // //add in EPs from current
            // //get info from loaded Vms for cards
            // var currItems = _.map(sccVM.tempCards(), function(card) {
            //     var ep = (card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0] :null);
            //     if (ep) {
            //         return {
            //             name: card.name(),
            //             id: ep.id,
            //             scId: card.sc().id,
            //             intelId: 'fixme', //TODO: should reference sc element
            //             type: 'intelligence',
            //             subType: 'engagement-pattern',
            //             subtype: 'engagement-pattern',
            //             renderType: 'flex-intelligence',
            //             src: ep.id,
            //             // iconType: uiElements.icon_type,
            //             renderText: card.name()
            //         };
            //     }else
            //     {
            //         return null;
            //     }
            // });
            // currItems = _.compact(currItems);
            // var curr = {
            //     title: sccVM.businessConceptInstance.property.name,
            //     items: currItems || []
            // };
            // res.push(curr);

            callback(null, res);
        });

    };


    sccVM._loadAvailableProgramsAndCampaignsForTP = function(tpId, callback) {


        //get BC where TP is "Store:tpId


        //
        // var relationships = sccVM.bcRelationships;
        //
        // var filteredRel = _.filter(relationships, function (val) {
        //     return (val.ref && val.ref ==='MerchandisingCampaign' && val.navigable && val.navigable === true);
        // });
        //
        //

        //TODO: once extra SC is removed for EP, update this logic
        //TODO: move all to service for efficiency and maintainability
        async.auto({
            retrieveBCTP: function(cb) {

                var resource = '/campaign-dynamic/?touchpoint='+encodeURIComponent(tpId);
                var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);

                restStrategy.list(function(err, tpBC) {
                    debugger;
                    if (err) {
                        return cb(err);
                    }

                    if (!_.isArray(tpBC.property.bcRelationships)) {
                        tpBC.property.bcRelationships = [tpBC.property.bcRelationships]
                    }

                    var relationships = _.map(tpBC.property.bcRelationships, function(item) {
                        return JSON.parse(item);
                    });


                    //locat e TP
                    var filteredRel = _.filter(relationships, function (val) {
                        return (val.ref && val.ref ==='MerchandisingCampaign' && val.navigable && val.navigable === true);
                    });

                    cb(null, filteredRel);

                });

            },
            retrieveForTp: ['retrieveBCTP',function (cb, results) {
                var filteredRel = results.retrieveBCTP;
                async.map(filteredRel, function (rel, done) {
                    dexit.app.ice.edu.integration.courseManagement.listLectures(rel.refId, function (err, data) {
                        if (err) {
                            console.error('problem retrieving associated BCs...skipping for refId:%s ,err:%o', rel.refId, err);
                            return done();
                        }
                        var tps = (data && data.touchpoints ? data.touchpoints : []);
                        var matchingTp = _.some(tps, function (tp) {

                            if (tpId) {
                                return (tp.tpId === tpId);
                            } else {
                                return (tp.channelType && tp.channelType === 'ucc');
                            }


                        });

                        //skip if campaign is not setup for BCC
                        if (!matchingTp) {
                            return done();
                        }

                        async.map(data.lectures, function(bci, doneEP) {
                            dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(sccVM.mainVM.repo, bci.id, function (err, res) {
                                if (err) {
                                    console.error('Cannot retrieve engagement pattern');
                                    bci.ep = [];
                                    return doneEP(null, bci);
                                }

                                //make sure to only add the ones with matching TP
                                if (res && res.length > 0 && res[0].pattern && res[0].pattern.touchpoints && _.indexOf(res[0].pattern.touchpoints, tpId) !== -1) {
                                    bci.ep = res;
                                    doneEP(null, bci);
                                }else {
                                    //otherwise skip
                                    doneEP();
                                }




                            });
                        }, function (err, res) {
                            if (err) {
                                console.log('error:%o',err);
                            }
                            var eps = res || [];
                            data.lectures = _.compact(eps);
                            done(null,data);
                        });
                    });
                }, function(err, res) {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, _.compact(res));
                });
            }],
            build: ['retrieveForTp',function(cb, results) { //for each BC
                var res = results.retrieveForTp;


                var updated = _.map(res, function (item) {

                    var name = item.course.property.name;
                    var mapped = _.map(item.lectures, function (ep) {
                        if (ep.ep && ep.ep.length > 0) {
                            return {
                                name: ep.property.name,
                                id: ep.ep[0].id,
                                scId: ep.id,
                                intelId: 'fixme', //TODO: should reference sc element
                                type: 'intelligence',
                                subType: 'engagement-pattern',
                                subtype: 'engagement-pattern',
                                renderType:'flex-intelligence',
                                src: ep.ep[0].id,
                                // iconType: uiElements.icon_type,
                                renderText: ep.property.name
                            };
                        } else  {
                            return null;
                        }
                    });
                    //remove any null entries
                    var epEntries = _.compact(mapped);


                    // //add entry for dynamic
                    // epEntries.unshift({
                    //     name: 'Latest for ' +name,
                    //     id: item.course.id + 'ep:' + 'latest',
                    //     scId: item.course.id,
                    //     intelId: '{{ep.latest}}', //TODO: should reference sc element
                    //     type: 'intelligence',
                    //     subType: 'engagement-pattern',
                    //     subtype: 'engagement-pattern',
                    //     renderType:'flex-intelligence',
                    //     src: '{{sc:'+item.course.id + ':intelligence:<engagement-pattern>latest(date)}}',
                    //     // iconType: uiElements.icon_type,
                    //     renderText: 'Latest for ' +name
                    // });

                    return {
                        title: name,
                        items: epEntries
                    };

                });

                cb(null,updated);

            }]
        }, function (err, results) {
            if (err) {
                return;
            }
            var res = results.build;

            // //add in EPs from current
            // //get info from loaded Vms for cards
            // var currItems = _.map(sccVM.tempCards(), function(card) {
            //     var ep = (card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0] :null);
            //     if (ep) {
            //         return {
            //             name: card.name(),
            //             id: ep.id,
            //             scId: card.sc().id,
            //             intelId: 'fixme', //TODO: should reference sc element
            //             type: 'intelligence',
            //             subType: 'engagement-pattern',
            //             subtype: 'engagement-pattern',
            //             renderType: 'flex-intelligence',
            //             src: ep.id,
            //             // iconType: uiElements.icon_type,
            //             renderText: card.name()
            //         };
            //     }else
            //     {
            //         return null;
            //     }
            // });
            // currItems = _.compact(currItems);
            // var curr = {
            //     title: sccVM.businessConceptInstance.property.name,
            //     items: currItems || []
            // };
            // res.push(curr);

            callback(null, res);
        });

    };

    sccVM.showTouchpointCampaignAllocatorModal = function(selected) {

        if (selected.selectedWidget) {
            sccVM.selectedCard(selected.selectedWidget());
        }else { //if selected is not mainVM;
            sccVM.selectedCard(selected);
        }

        //sccVM.selectedCard(selected);


        //populate

        sccVM.allocationRegion([]);

        var ep = (sccVM.selectedCard().ePatterns() && sccVM.selectedCard().ePatterns().length > 0 ? sccVM.selectedCard().ePatterns()[0] : null);

        if (!ep || !ep.pattern || !ep.pattern.touchpoints) {
            alert('You must save the Campaign First');
            return;
        }


        //check if current Touchpoint Engagement Plan is the primary one for  allocation
        var primaryEP = (sccVM.businessConceptInstance.property && sccVM.businessConceptInstance.property.primary_tp_ep_id ?  sccVM.businessConceptInstance.property.primary_tp_ep_id : null);
        var isPrimary = ((primaryEP && primaryEP === ep.id ) ? true : false );
        sccVM.isPrimaryAllocation(isPrimary);

        //only on for TP EP
        var layout = ep.pattern.tp[0].layout;
        sccVM.tpAllocatorLayout(layout);

        var name = sccVM.businessConceptInstance.property.name + (ep.pattern && ep.pattern.name ?  ' ' +ep.pattern.name : '');

        sccVM.toAllocatorTitle(name);

        //var tpId =  (sccVM.tpm() && sccVM.tpm().length > 0 ? sccVM.tpm()[0].tpId : '');


        var tpId = (ep.pattern.touchpoints && ep.pattern.touchpoints ?  ep.pattern.touchpoints[0] : '');


        async.auto({
            loadAvailable: function(cb) {
                sccVM._loadAvailableProgramsAndCampaigns(tpId, function (err, progsCamps) {
                    cb(err, progsCamps);
                });
            },
            loadAvailableAllocations: function(cb) {

                //filter to only the allocated elements
                var allocated = _.filter(ep.pattern.element, function(element) {
                    return (element && element.type === 'intelligence'  && element.subType && element.subType === 'dynamic-ept-params');
                });

                var allocatedIds = _.map(allocated, 'id');


                //now look in layout.regions
                var match = [];

                _.each(layout.regions, function(elementIds, regionId) {

                    _.each(elementIds, function(elementId) {
                        if (allocatedIds.indexOf(elementId) !== -1) {
                            match.push({name: regionId, region: regionId, elementId: elementId});
                        }
                    });

                });
                cb(null, match);
            },
            loadExistingAllocations: ['loadAvailableAllocations',function(cb, result) {
                var tp = ep.pattern.touchpoints[0];
                //save
                var resource = '/tp-allocator/' + encodeURIComponent(ep.id) + '?touchpoint='+encodeURIComponent(tp);
                var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
                restStrategy.retrieve(function (err, result) {

                    if (err) {
                        return cb(err);
                    }
                    var toReturn = _.groupBy(result,'region'); //group by region

                    cb(null,toReturn);

                });



            }]

        }, function(err, results) {

            var availProgCamps = results.loadAvailable || [];
            var existing = results.loadExistingAllocations || {};


            var output = _.map(results.loadAvailableAllocations, function(allocation) {
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

                var saved = (existing[toRet.region] && existing[toRet.region].length > 0 ?  existing[toRet.region][0] : null);

                //existing
                if (toRet.region && saved) {

                    _.each(availProgCamps, function (item) {
                        var items = item.items || [];
                        var found = _.find(items, function(it){
                            return (it.id === saved.epId);
                        });
                        if (found) {
                            toRet.selectedProgram(item.title);
                            toRet.selectedCampaign(found);
                        }
                    });
                }
                toRet.availableCampaigns =  ko.pureComputed(function() {
                    var program = toRet.selectedProgram();

                    //now look in availProgCamps
                    var campaigns = _.find(toRet.availProgCamps, {title:program});
                    return (campaigns && campaigns.items ? campaigns.items : []);
                });  //ko.observableArray([]);

                return toRet;

            });
            sccVM.allocationRegion(output);

            $('.modal-loading').addClass('hidden');

        });

        sccVM.touchpointCampaignAllocatorVisible(true);
        $('.modal-loading').removeClass('hidden');


    };



    sccVM.showDynamicCampaignSelectionModal = function(selected) {
        if (selected.selectedWidget) {
            sccVM.selectedCard(selected.selectedWidget());
        }else { //if selected is not mainVM;
            sccVM.selectedCard(selected);
        }

        //populate

        debugger;
        sccVM.dynamicCampaign([]);

        var ep = (sccVM.selectedCard().ePatterns() && sccVM.selectedCard().ePatterns().length > 0 ? sccVM.selectedCard().ePatterns()[0] : null);

        if (!ep) {
            alert('cannot allocate empty ep');
            return;
        }


        //check if current Touchpoint Engagement Plan is the primary one for  allocation
        // var primaryEP = (sccVM.businessConceptInstance.property && sccVM.businessConceptInstance.property.primary_tp_ep_id ?  sccVM.businessConceptInstance.property.primary_tp_ep_id : null);
        // var isPrimary = ((primaryEP && primaryEP === ep.id ) ? true : false );
        // sccVM.isPrimaryAllocation(isPrimary);

        //only on for TP EP
        //var layout = ep.pattern.tp[0].layout;
        //sccVM.tpAllocatorLayout(layout);
        //ep.pattern.elements;

        debugger;


        var name = sccVM.businessConceptInstance.property.name + (ep.pattern && ep.pattern.name ?  ' ' +ep.pattern.name : '');
        debugger;
        sccVM.toAllocatorTitle(name);

        var tpId =  (sccVM.selectedCard() && sccVM.selectedCard().chosenTPs() && sccVM.selectedCard().chosenTPs()[0] ? sccVM.selectedCard().chosenTPs()[0].id : '');
        async.auto({
            loadAvailable: function(cb) {
                sccVM._loadAvailableProgramsAndCampaignsForTP(tpId, function (err, progsCamps) {
                    cb(err, progsCamps);
                });
            },
            loadAvailableAllocations: function(cb) {
                debugger;

                //filter to only the allocated elements
                var allocated = _.filter(ep.pattern.element, function(element) {
                    return (element && element.type === 'intelligence'  && element.subType && element.subType === 'dynamic-ept-params' && (element.args && element.args.type === 'campaign_dynamic') );
                });

                var match = _.map(allocated, 'args.tag');


                // //now look in layout.regions
                // var match = [];

                // _.each(layout.regions, function(elementIds, regionId) {
                //
                //     _.each(elementIds, function(elementId) {
                //         if (allocatedIds.indexOf(elementId) !== -1) {
                //             match.push({name: regionId, region: regionId, elementId: elementId});
                //         }
                //     });
                //
                // });
                cb(null, match);
            },
            loadExistingAllocations: ['loadAvailableAllocations',function(cb, result) {

                var tp = ep.pattern.touchpoints[0];
                //save
                var resource = '/campaign-dynamic/' + encodeURIComponent(ep.id) + '?touchpoint='+encodeURIComponent(tp);
                var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
                restStrategy.retrieve(function (err, result) {

                    if (err) {
                        return cb(err);
                    }
                    var toReturn = _.groupBy(result,'dynamicPlaceholder'); //group by region

                    cb(null,toReturn);

                });



            }]

        }, function(err, results) {


            var availProgCamps = results.loadAvailable || [];

            //filter out any empty availProgCamps.items
            var filteredAvailable = [];
            _.each(availProgCamps, function(item) {
                //only add if it has items
                if (item && item.items && item.items.length > 0) {
                    var uniq = _.uniqBy(item.items, 'id');

                    filteredAvailable.push({'title':item.title, items: uniq});
                }
            })






            debugger;
            var mappedProgCamps = [];
            _.each(filteredAvailable, function(entry) {
                _.each(entry.items, function(campaign) {
                    mappedProgCamps.push({'name': entry.title + '-' + campaign.name, 'program': entry.title, campaign: campaign, id:campaign.id});
                });
            });


            mappedProgCamps.push({'name':'logout',program:'reserved',campaign: {id: '111114'},id: '111114'});
            mappedProgCamps.push({'name':'settings',program:'reserved',campaign: {id: '111115'},id: '111115'});
            mappedProgCamps.push({'name':'help',program:'reserved',campaign: {id: '111116'},id: '111116'});
            mappedProgCamps.push({'name':'partners',program:'reserved',campaign: {id: '111117'},id: '111117'});


            //sccVM.availableProgramsAndCampaigns(availProgCamps);

            var existing = results.loadExistingAllocations || {};


            var output = _.map(results.loadAvailableAllocations, function(allocation) {
                //var availPrograms = ko.observableArray(_.map(availProgCamps, 'title'));
                var toRet = {
                    availProgCamps: filteredAvailable,
                    mappedProgCamps: mappedProgCamps,
                    //name: allocation //allocation.name,
                    dynamicPlaceholder:  allocation || '',//allocation.elementTag || '',
                    selectedCampaignIds: ko.observableArray([])
                    //elementId: allocation.elementId || '',
                    //region: allocation.region || '',
                    // availablePrograms: availProgCamps,
                    //selectedProgramCampaigns: ko.observableArray([]),
                    // selectedProgram: ko.observable(),
                    // selectedCampaign: ko.observable()
                    //selectedCampaigns: ko.observableArray([])

                };
                debugger;

                // var saved = false;
                var saved = (existing[toRet.dynamicPlaceholder] && existing[toRet.dynamicPlaceholder].length > 0 ?  existing[toRet.dynamicPlaceholder][0] : null);

                //existing
                if (toRet.dynamicPlaceholder && saved) {

                    var selectedCampaigns = [];
                    var selectedCampaignIds = [];

                    _.each(availProgCamps, function (item) {
                        var items = item.items || [];
                        var found = _.find(items, function(it){
                            return (it.id === saved.epId);
                        });
                        if (found) {
                            debugger;
                            selectedCampaignIds.push(found.id);
                            ////toRet.selectedProgramCampaigns.push({program:item.title, campaign:found});
                            //selectedCampaigns.push({program:item.title, name:item.title + '-' + found.name, campaign:found});
                            // selectedCampaigns.push({program:item.title, name:item.title + '-' + found.name, campaign:found});
                            // toRet.selectedProgram(item.title);
                            // toRet.selectedCampaign(found);
                        }
                    });
                    toRet.selectedCampaignIds(selectedCampaignIds);
                    // toRet.selectedProgramCampaigns = ko.observableArray(selectedCampaigns);
                    // toRet.selectedCampaigns = ko.observableArray(selectedCampaigns);


                }
                toRet.availableCampaigns =  ko.pureComputed(function() {
                    var program = toRet.selectedProgram();

                    //now look in availProgCamps
                    var campaigns = _.find(toRet.filteredAvailable, {title:program});
                    return (campaigns && campaigns.items ? campaigns.items : []);
                });  //ko.observableArray([]);

                return toRet;

            });
            sccVM.dynamicCampaign([]);
            sccVM.dynamicCampaign(output);

            $('.modal-loading').addClass('hidden');

        });

        sccVM.dynamicCampaignSelectionVisible(true);
        $('.modal-loading').removeClass('hidden');


    };





    sccVM.saveCreativeBriefProgram = function() {

        var instance = sccVM.businessConceptInstance;
        var type = instance.property.type || instance.property.class;

        var val =  sccVM.programBriefLink();
        var changes = [
            {op:'replace', path:'/property/_briefLink', value: val}
        ];
        var params = {
            type: type,
            id: instance.id,
            version: instance.property.version,
            changes: changes
        };

        sccVM._updateBCInstance(params, function(err,res) {
            if (err) {
                //warn saving
                alert('could not save brief link');
                sccVM.programBriefModalVisible(false);
                campaignPlannerVm.programBriefModalVisible(false);

            } else {
                instance.property._briefLink = sccVM.programBriefLink();
                sccVM.programBriefModalVisible(false);
                campaignPlannerVm.programBriefModalVisible(false);
            }



        });
    };

    sccVM.saveCreativeBrief = function() {

        if (mainVM.selectedWidget()) {
            mainVM.selectedWidget().creativeBrief(sccVM.creativeBriefLink());
            mainVM.selectedWidget().setCreativeBrief(sccVM.creativeBriefLink());
            sccVM.creativeBriefLink('');

        } else { //before the create or send for approval has been clicked there is no selectedWidget
            //do not clear link, it will be used later during creation

        }
        sccVM.creativeBriefModalVisible(false);
    };


    sccVM.showCreativeBriefProgram = function() {
        sccVM.briefLevel = 'program';

        //set to configured folder
        sccVM.gFolderId(mainVM.creativeBriefFolderId);

        sccVM.creativeBriefLink('');

        if (sccVM.businessConceptInstance.property._briefLink && !_.isEmpty(sccVM.businessConceptInstance.property._briefLink)) {
            sccVM.creativeBriefLink(sccVM.businessConceptInstance.property._briefLink);
        }
        sccVM.programBriefModalVisible(true);
    };


    sccVM.showCreativeBrief = function() {


        var epWidget = mainVM.selectedWidget();

        //set to configured folder
        sccVM.gFolderId(mainVM.creativeBriefFolderId);

        if (!epWidget) { //in creation no widget, just show brief as is again
            sccVM.creativeBriefModalVisible(true);
        }else {

            sccVM.creativeBriefLink('');
            if (epWidget.creativeBrief() && !_.isEmpty(epWidget.creativeBrief())) {
                sccVM.creativeBriefLink(epWidget.creativeBrief());
            }
            sccVM.creativeBriefModalVisible(true);

        }
    };
    sccVM.cmsCampaignConfigurationModalVisible = ko.observable(false);
    sccVM.cmsCampaignConfiguration = ko.observable();

    sccVM.showCMSCampaignConfigureModal = function(selected) {
        mainVM.selectedWidget(selected);
        sccVM.selectedCard(selected);
        //selected.
        sccVM.cmsCampaignConfiguration(selected.cmsConfiguration());
        sccVM.cmsCampaignConfigurationModalVisible(true);
    };

    sccVM.saveCmsCampaignConfiguration = function() {
        var card = sccVM.selectedCard();
        var choice = sccVM.cmsCampaignConfiguration();
        card.setCmsConfiguration(choice);
        sccVM.cmsCampaignConfigurationModalVisible(false);
    };

    sccVM.showScheduleModal = function(selected){
        if (selected.currentActivity() === 'published') {
            return; //skip click
        }
        sccVM.selectedCard(selected);

        //set selectedStartDate, selectedStartTime, selectedStart to show in modal
        if (selected.scheduleVM.scheduleSDT()) {

            var sDate = moment(selected.scheduleVM.scheduleSDT(),moment.ISO_8601);
            sccVM.selectedStartDate(sDate.toDate());
            var startTime = sDate.format('HH:mm');
            sccVM.selectedStartTime(startTime);
        }
        if (selected.scheduleVM.scheduleEDT() && selected.scheduleVM.scheduleEDT() !== 'never') {
            var eDate = moment(selected.scheduleVM.scheduleEDT(),moment.ISO_8601);

            sccVM.selectedEndDate(eDate.toDate());
            var endTime = eDate.format('HH:mm');
            sccVM.selectedEndTime(endTime);
        }
        sccVM.scheduleEPModalVisible(true);
    };
    sccVM.saveSchedule = function() {
        sccVM.scheduleEPModalVisible(false);
        var selected = sccVM.selectedCard();

        var startDate = sccVM.selectedStartDate();
        var startTime = sccVM.selectedStartTime();

        var endDate = sccVM.selectedEndDate();
        var endTime = sccVM.selectedEndTime();


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


        selected.scheduleVM.startdatetime(startDateTime);
        selected.scheduleVM.changeSDT();

        if (endDate) {
            //build end date (js Date object)
            var endDateTime = moment(endDate);
            if (endTime) {
                var eM = moment(endTime, 'HH:mm');
                endDateTime.hour(eM.hour());
                endDateTime.minutes(eM.minutes());
            }
            selected.scheduleVM.enddatetime(endDateTime);
            selected.scheduleVM.changeEDT();

        }
        selected.scheduleSet(true);

        //save state
        selected._updateState(selected.currentActivity());


        //
        // sccVM.mainVM.shareEP(selected.chosenTPs(),selected,function() {
        //    //TODO: handle error
        // });

        //selected.scheduleVM
    };


    /**
     * Toggles the showing of title when in "Preview" mode
     * @member {ko.observable}
     */
    sccVM.uccPreviewMode = ko.observable(false);

    sccVM.businessConceptInstance = businessConceptInstance;


    sccVM.scheduleSet = ko.observable(false);

    sccVM.startDate = (businessConceptInstance.property.start_date ? businessConceptInstance.property.start_date : '');
    sccVM.endDate = (businessConceptInstance.property.end_date ? businessConceptInstance.property.end_date : '');

    if (sccVM.startDate || sccVM.endDate) {
        sccVM.scheduleSet(true);
    }



    /**
     * @typedef {object} BCiRelationship
     * @property {string} [label]
     * @property  {string} ref - BC of relationship (ie. MerchandisingCampaign)
     * @property {object} [refData] - non-standard property (name contain property called 'name' of BCi)
     * @property {refId} refId - BCi reference (identifier)
     * @property {type} type - relationship type (ie. 'association')
     * @property {boolean} navigable - whether relationship can be visited from current BCi
     */


    /**
     *
     * @type {Array<BCiRelationship>}
     */
    sccVM.bcRelationships = (businessConceptInstance && businessConceptInstance.bcRelationships ? businessConceptInstance.bcRelationships : []);
    sccVM.entityRelationships = (businessConceptInstance && businessConceptInstance.entityRelationships ? businessConceptInstance.entityRelationships : []);



    var tag = (sccVM.businessConceptInstance.property && sccVM.businessConceptInstance.property.mmTag ? sccVM.businessConceptInstance.property.mmTag:  (mainVM.currBCDef && mainVM.currBCDef() && mainVM.currBCDef().bctype ?  mainVM.currBCDef().bctype:'default') );
    sccVM.mmTag = ko.observable(tag);

    var cardColour = (businessConceptInstance && businessConceptInstance.property &&  businessConceptInstance.property.presentation_card_colour ? '#' + businessConceptInstance.property.presentation_card_colour : '#FFFFFF');

    sccVM.cardColour = ko.observable(cardColour);
    sccVM.pendingCardColour = ko.observable('');



    //TODO
    // /**
    //  * Set BC definition (won't change)
    //  */
    // sccVM.bcDef = mainVM.currBCDef();
    // sccVM.bcName = mainVM.currBCDef().bctype;
    //

    sccVM.updateBCRelationships = ko.observable(false);


    /**
     * For displaying BC relationships (showing the concept and the name)
     */
    sccVM.displayedBCRelationships = ko.pureComputed(function () {

        var s = sccVM.updateBCRelationships();
        // //necessary for filtering out invalid relationships
        // var filtered = _.filter(,function (bcRelationship) {
        //     return (bcRelationship && bcRelationship.refId !== 'fakeId' && bcRelationship.refData && bcRelationship.refData.name);
        // });


        //now organize into an object of 'bcType':[ bcName, bcName]
        var mapped = _
            .chain(sccVM.bcRelationships)
            .filter(function (bcRelationship) {
                return (bcRelationship && bcRelationship.refId !== 'fakeId' && bcRelationship.refData && bcRelationship.refData.name);
            })
            .map(function(bcRelationship){
                var ref = (bcRelationship.ref && bcRelationship.ref.toLowerCase() ==='product' ? 'Offer' : bcRelationship.ref);
                return {ref:ref, name:bcRelationship.refData.name};
            })
            .groupBy('ref')
            .value();


        var newArr = Object.keys(mapped).map(function(i) {

            var val = _.map(mapped[i],'name');
            return {
                id: i,
                names: val
            };
        });

        return newArr;

        // var toReturn = {};
        // _.each(filtered, function(bcRelationship) {
        //     //fixme: change BC name
        //     var ref = (bcRelationship.ref && bcRelationship.ref.toLowerCase() ==='product' ? 'Offer' : bcRelationship.ref)
        //
        //     if (!toReturn[ref]) {
        //         toReturn[ref] = [];
        //     }
        //     toReturn[ref].push(bcRelationship.refData.name);
        // });
        // return toReturn;

        // return ko.utils.arrayMap(filtered,function (bcRelationship) {
        //     //fixme: change BC name
        //     var ref = (bcRelationship.ref && bcRelationship.ref.toLowerCase() ==='product' ? 'Offer' : bcRelationship.ref);
        //     return ref + ':' + bcRelationship.refData.name;
        // });
    });


    sccVM.ecTPIntel = ko.observableArray([
        {
            id:1,
            name:'Other TPs of same channel type',
            value:2
        },
        {
            id:2,
            name:'Most Used Behaviour for TP',
            value:'0845d5b0-db37-4d3b-8d9b-bc69118e0317'
        }

    ]);




    sccVM.widgets = ko.observableArray();
    //to save all shared lectures
    sccVM.stu_SharedWidgets = ko.observableArray();

    sccVM.noCourseDescription = 'Click on edit icon to add a course description.';
    sccVM.noStudentCourseDescription = 'There is no description for this course.';
    sccVM.noOfficeHours = 'Click on edit icon to add office hours';


    sccVM.behavioursToAdd = ko.observableArray([]);

    sccVM.existingBehaviours = ko.observableArray([]);


    sccVM.behavioursLoading = false;



    sccVM.existingBRs = ko.observableArray([]);
    sccVM.servicesEditingMode = ko.observable(false);

    //ICEMM-231: show assocated information for campaign
    //sccVM.associatedProduct = ko.observableArray([]);
    sccVM.associatedBehaviours = ko.observableArray([]);
    sccVM.associatedSegments = ko.observableArray([]);
    sccVM.associatedReports = ko.observableArray([]);
    //ICEMM-242
    sccVM.availableSegmentReports = ko.observableArray([]);
    //ICEMM-307
    sccVM.availableUserProfile = ko.observableArray([]);

    /**
     * Touchpoint info object
     * @typedef {object} GroupURL
     * @property {string} groupType - channel type (ie. twitter)
     * @property {string} url - channel url (assumption of one channel instance per touchpoint was made)
     * @property {string} name - prefix given to it (ie. Lecture) but not sure what it is used for
     */
    /**
     * Holds array of touchpoint info objects with structure
     * @member {GroupURL[]} groupURL
     */
    sccVM.groupURL = ko.observableArray([]);

    /**
     * Holds array of touchpoint info objects with structure
     * @typedef {object} TPInfo
     * @property {string} [name] - name
     * @property {string} tpId - touchpoint identifier
     * @property {string} tpType - channel type (ie. twitter)
     * @property {string} tpUrl - channel url (assumption of one channel instance per touchpoint was made)
     * @property {string} channelType - define channel.
     */
    /**
     * Holds array of touchpoint info objects with structure
     * @member {TPInfo[]} tpm
     */
    sccVM.tpm = ko.observableArray([]);

    /**
     * Holds array of touchpoint info objects with structure
     * @member {TPInfo[]} tpm
     */
    sccVM.alltps = ko.observableArray([]);

    sccVM.tempTPObject = ko.observableArray([]);
    //check the tp array to enable the sub BCi creation
    sccVM.enablesSubBCCreation = ko.computed(function() {
        return (sccVM.tpm() && sccVM.tpm().length > 0);
    });
    sccVM.validateTPMessage = ko.observable('Please add touchpoint firstly!');


    /**
     * Computed for show comma separated list of touchpoint names
     */
    sccVM.tpsTitle = ko.pureComputed(function(){
        var tps = _.map(sccVM.tpm(), 'name');
        return tps.join(', ');
    });

    /**
     * Holds channel url when creating touchpoint
     * @member {string} pendingChannelUrl
     */
    sccVM.pendingChannelUrl = ko.observable();
    //for enabling/disabling submit button
    sccVM.validTPURL = ko.observable(false);
    //the list of chosen touch points
    sccVM.chosenTouchpoints = ko.observableArray([]);


    //TODO: remove groupId
    sccVM.groupID = ko.observableArray([]);
    sccVM.member = ko.observable(false);

    sccVM.editOfficeHours = ko.observable(false);
    sccVM.editCourseDescription = ko.observable(false);

    sccVM.officeHoursValue = ko.observable('');
    sccVM.courseDescriptionValue = ko.observable('');
    sccVM.hasHours = ko.observable(false);

    sccVM.selectedMMType = ko.observable('image');


    sccVM.assetsLoaded = false;

    sccVM.activeLecture = null;
    //save the version from property
    sccVM.version = ko.observable();


    /**
     * Add options for data collection for Epts
     * Note: in practice this will not be called until sccVM.chosenTouchpoints() has been populated
     * @param {object} element - html element
     * @param {TPInfo} tpData
     */
    sccVM.addTPEptChoice = function(element, tpData) {
        element.classList.add('selected-product');
        var existing = _.find(sccVM.chosenTouchpoints(), {tpId: tpData.tpId});
        if (existing) {
            existing.tpParams = { 'allImplictEpts': true};
        }
    };


    /**
     * Toggles the ability to edit services
     * @param {object} data
     */
    sccVM.activateEditServices = function() {
        sccVM.servicesEditingMode(!sccVM.servicesEditingMode());
    };



    sccVM.iconPickerVM = ko.observable();

    // for editing widget intelligence
    sccVM.widgetIntelligenceEditingMode = ko.observable(false);
    sccVM.availableWidgetIntelligence = ko.observableArray([]);
    sccVM.selectedWidgetIntelligence = ko.observableArray([]);

    sccVM.enableSaveWidgetIntelligence = ko.pureComputed(function () {
        return (sccVM.chosenWidgetIntelligence1() && //sccVM.chosenWidgetIntelligence1Icon() &&
            sccVM.chosenWidgetIntelligence2() &&  //sccVM.chosenWidgetIntelligence2Icon() &&
            sccVM.chosenWidgetIntelligence3()); //&&  sccVM.chosenWidgetIntelligence3Icon());
    });

    sccVM.chosenWidgetIntelligence1 = ko.observable();
    sccVM.chosenWidgetIntelligence1Icon = ko.observable();
    sccVM.chosenWidgetIntelligence2 = ko.observable();
    sccVM.chosenWidgetIntelligence2Icon = ko.observable();
    sccVM.chosenWidgetIntelligence3 = ko.observable();
    sccVM.chosenWidgetIntelligence3Icon = ko.observable();


    sccVM.availableWidgetIntelligence1Filtered = ko.pureComputed(function () {
        return ko.utils.arrayFilter(sccVM.availableWidgetIntelligence(), function (val) {
            if (sccVM.chosenWidgetIntelligence2() && sccVM.chosenWidgetIntelligence2().id === val.id ){
                return false;
            }else if (sccVM.chosenWidgetIntelligence3() && sccVM.chosenWidgetIntelligence3().id === val.id ){
                return false;
            } else {
                return true;
            }
        });
    });


    sccVM.availableWidgetIntelligence2Filtered = ko.pureComputed(function () {
        return ko.utils.arrayFilter(sccVM.availableWidgetIntelligence(), function (val) {
            if (sccVM.chosenWidgetIntelligence1() && sccVM.chosenWidgetIntelligence1().id === val.id ){
                return false;
            }else if (sccVM.chosenWidgetIntelligence3() && sccVM.chosenWidgetIntelligence3().id === val.id ){
                return false;
            } else {
                return true;
            }
        });
    });


    /**
     * Prepare the behaviours for the EPA, view templates etc
     */
    sccVM.prepareBehaviours = function() {

        if (sccVM.behavioursLoading === true) {
            //wait

            setTimeout(function () {
                sccVM.prepareBehaviours();
            }, 1000);

        } else if (sccVM.behavioursLoading === false && sccVM.existingBehaviours() && sccVM.existingBehaviours().length > 0) {
            //get accociated Behaviours
            var associatedBehaviours = _.filter(sccVM.existingBehaviours(), function(beh){return !beh.isBR;});
            if (associatedBehaviours && associatedBehaviours.length > 0) {
                sccVM.associatedBehaviours([]);
                _.each(associatedBehaviours, function(beh) {
                    //ICEMM-290: set topLevelComponents from behaviour related uiElement to replace ePt classes
                    var uiElements = beh.ds.uiElements;
                    var ele = {
                        type: 'behaviour',
                        subType: uiElements.subtype ||  uiElements.subType,
                        iconType: uiElements.icon_type,
                        renderText: uiElements.render_text,
                        ruleType: uiElements.rule_type,
                        renderColor: uiElements.render_color,
                        imageName: uiElements.image_name,
                        scId: beh.scId,
                        behId: beh.behId,
                        ds: beh.ds,
                        parameters: beh.parameters
                    };
                    if (beh.output_parameters) {
                        ele.output_parameters = beh.output_parameters;
                    }
                    dpa_VM.topLevelComponents.push(ele);
                    sccVM.associatedBehaviours.push(uiElements.render_text);
                });
                dpa_VM.buildTemplates(dpa_VM.topLevelComponents());

            } else {
                console.log('associated eServices not found!');
            }
            var currentBRs = _.filter(sccVM.existingBehaviours(), function(beh){return beh.isBR;});

            //also push in User defined BR
            var userDefinedBR = {
                eptName: 'Business Rule',
                type: 'br',
                subType: 'br',
                iconType: 'fa fa-cogs',
                renderText: 'User Defined Business Rule',
                ruleType: 'complex',
                // renderType:'br',
                isBR: true
            };
            dpa_VM.topLevelComponents.push(userDefinedBR);
            dpa_VM.buildTemplates(dpa_VM.topLevelComponents());

            if(currentBRs && currentBRs.length > 0){
                _.each(currentBRs, function(businessRule, index){
                    var brEl = {
                        eptName: 'Business Rule',
                        type: 'behaviour',
                        subType: businessRule.display.icon_text.indexOf('Survey')>-1?'questionnaire':businessRule.display.icon_text,
                        iconType: 'fa fa-cogs',
                        renderText: businessRule.display.icon_text,
                        ruleType: 'complex',
                        scId: businessRule.scId,
                        behId: businessRule.behId,
                        behRef: businessRule.ds.id,
                        ds: businessRule.ds,
                        display: businessRule.display,
                        isBR: true
                    };
                    dpa_VM.topLevelComponents.push(brEl);
                });
                dpa_VM.buildTemplates(dpa_VM.topLevelComponents());
            } else {
                console.log('associated business rule not found!');
            }
        }
    };



    /**
     * Save intelligence for presentation, and set it for widget presentation, and set it for intelligence
     * @param {string} currentRole - role of user
     */
    sccVM.saveWidgetIntelligence = function (currentRole) {

        sccVM.chosenWidgetIntelligence1Icon(sccVM.iconPickerVM().chosen1Icon());
        sccVM.chosenWidgetIntelligence2Icon(sccVM.iconPickerVM().chosen2Icon());
        sccVM.chosenWidgetIntelligence3Icon(sccVM.iconPickerVM().chosen3Icon());

        //hardcoded for now
        var intelType = 'engagementmetric';
        var bciId = sccVM.businessConceptInstance.id;
        var bcName = mainVM.currBCDef().bctype;


        function updateIntel(intelligenceId, intelType, intelProp, done) {

            var params = {
                id:bciId,
                type: bcName,
                intelType: intelType,
                intelId: intelligenceId,
                data: intelProp
            };

            dexit.app.ice.integration.bcp.updateBCIntelligence(params, function (err, res) {
                if (err) {
                    console.log('failed to create report intelligence' + err);
                }
                done();
            });
        }

        if (!currentRole) {
            console.warn('must provide role');
            return;
        }

        if (!sccVM.chosenWidgetIntelligence1() || !sccVM.chosenWidgetIntelligence2() || !sccVM.chosenWidgetIntelligence3()) {
            console.warn('must fill in all choices');
            return;
        }

        //build selected intelligence
        var selectedWidgetIntelligence = [
            sccVM.chosenWidgetIntelligence1(),
            sccVM.chosenWidgetIntelligence2(),
            sccVM.chosenWidgetIntelligence3()
        ];


        //for role, untag others for presentation, and tag new ones for role
        async.auto({
            untagRole: function (cb) {
                var availableIntel = sccVM.availableWidgetIntelligence();
                async.each(availableIntel, function (selected, done) {
                    var role = (selected.property && selected.property.role ? selected.property.role : '');

                    //role might be an array or string
                    if (_.isArray(role)) {
                        console.log('TODO: role is an array...handle case of sharing');
                        return;
                    }
                    if (role && role === currentRole) {
                        //remove
                        var updated = _.omit(selected.property,'role');
                        updateIntel(selected.id,intelType,updated, done);
                    }else {
                        done(); //skip
                    }
                }, cb);
            },
            tagRole: ['untagRole',function (cb) {
                //set all attributes
                selectedWidgetIntelligence[0].property.role = currentRole;
                selectedWidgetIntelligence[0].property.presentation_icon =sccVM.chosenWidgetIntelligence1Icon();
                selectedWidgetIntelligence[0].property.presentation_name = selectedWidgetIntelligence[0].property.definition.metricName;
                selectedWidgetIntelligence[1].property.role = currentRole;
                selectedWidgetIntelligence[1].property.presentation_icon =sccVM.chosenWidgetIntelligence2Icon();
                selectedWidgetIntelligence[1].property.presentation_name = selectedWidgetIntelligence[1].property.definition.metricName;
                selectedWidgetIntelligence[2].property.role = currentRole;
                selectedWidgetIntelligence[2].property.presentation_icon =sccVM.chosenWidgetIntelligence3Icon();
                selectedWidgetIntelligence[2].property.presentation_name = selectedWidgetIntelligence[2].property.definition.metricName;

                async.each(selectedWidgetIntelligence, function (selected, done) {
                    selected.property.present_bcwidget = true;
                    updateIntel(selected.id,intelType,selected.property, done);

                }, cb);
            }]
        }, function (err) { //ignoring any errors for now
            //done
            console.log('done saving intel');

            sccVM.widgetIntelligenceEditingMode(false);
            //hide pop-over
            setTimeout(function () {
                $('.popover').popover('hide');
                //refresh page
                mainVM.setWidgetReport(sccVM);
            },2000);
        });

    };


    /**
     * Toggles whether selection of intelligence to present in widget
     */
    sccVM.toggleWidgetIntelligenceEditMode = function() {

        if (!sccVM.iconPickerVM()) {
            sccVM.iconPickerVM = ko.observable(new dexit.app.ice.edu.components.CSSIconPickerVM({prefix:'fa '}));
        }

        sccVM.widgetIntelligenceEditingMode(!sccVM.widgetIntelligenceEditingMode());

        if (sccVM.widgetIntelligenceEditingMode() === true) {
            var intel = sccVM.businessConceptInstance.intelligence || [];

            var available = _.filter(intel, function(it) {
                return ((it.kind && it.kind.indexOf('engagementmetric') !== -1) || (it.property && it.property.isEngagementMetric));
            });
            sccVM.availableWidgetIntelligence(available);

            var role = mainVM.currentRole();

            var existingIntel = _.filter(intel, function (it) {
                return (it.property && it.property.role === role && it.property.present_bcwidget);
            });

            if (existingIntel && existingIntel.length > 0) {
                //set choosen for  if there

                sccVM.chosenWidgetIntelligence1(existingIntel[0]);
                sccVM.chosenWidgetIntelligence1Icon(existingIntel[0].property.presentation_icon);
                sccVM.chosenWidgetIntelligence2(existingIntel[1]);
                sccVM.chosenWidgetIntelligence2Icon(existingIntel[1].property.presentation_icon);
                sccVM.chosenWidgetIntelligence3(existingIntel[2]);
                sccVM.chosenWidgetIntelligence3Icon(existingIntel[2].property.presentation_icon);

                sccVM.iconPickerVM().chosen1Icon(sccVM.chosenWidgetIntelligence1Icon());
                sccVM.iconPickerVM().chosen2Icon(sccVM.chosenWidgetIntelligence2Icon());
                sccVM.iconPickerVM().chosen3Icon(sccVM.chosenWidgetIntelligence3Icon());

            }

        }

    };


    sccVM.widgetReport = ko.observableArray([]);
    sccVM.filteredWidgetReport = ko.pureComputed(function () {
        var maxSize = 2;
        var toReturn = [];
        _.each(sccVM.widgetReport(), function(val, index) {
            if (index <= (maxSize-1)){
                toReturn.push(val);
            }
        });
        return toReturn;
    });

    sccVM.handleChosenTouchpoints = function(bc, callback) {
        var chosenTPTempedList = [];
        if(bc){
            sccVM.retrieveTouchpointsDetailsOfBCi(bc, function(res) {
                if(res){
                    chosenTPTempedList = res.map(function (tp) {
                        return {
                            type: tp.tpType,
                            link: tp.tpURL,
                            id: tp.tpId,
                            name: tp.name,
                            channelType: tp.channelType
                        };
                    });
                    callback(chosenTPTempedList);
                }else{
                    console.log('cannot retrieve touchpoint details');
                    callback([]);
                }
            });
        }else{
            console.error('no bc passed');
            callback([]);
        }
    };
    /**
     * Show widget intelligence
     * @param {string} bcInstanceId
     * @param {object[]} intelligence
     */
    sccVM.showWidgetReport = function(bcInstanceId, intelligence) {
        var tempWidgetReport = sccVM.buildWidgetReport(bcInstanceId, intelligence);
        sccVM.widgetReport(tempWidgetReport);
    };

    /**
     *
     * @param {string} bcInstanceId
     * @param {object[]} intelligence
     * @return {Array}
     */
    sccVM.buildWidgetReport = function(bcInstanceId, intelligence) {
        //populate with icon and dummy data
        var tempWidgetReport = [];
        _.each(intelligence, function(widgetMetric) {
            var prop = widgetMetric.property || {};
            var metricObj = {
                icon: prop.presentation_icon,
                name: prop.presentation_name || prop.definition.metricName,
                value: ko.observable('0')
            };
            metricObj.label = metricObj.name.replace(/_/g,' ');
            tempWidgetReport.push(metricObj);
        });

        return tempWidgetReport;
    };

    sccVM.setWidgetReportData = function(bcInstanceId, listOfWidgetMetrics, callback) {
        callback = callback || noOp;

        var tempWidgetReports = sccVM.widgetReport();
        if (!tempWidgetReports || tempWidgetReports.length < 1) {
            return callback();
        }

        var allMetrics = _.after(listOfWidgetMetrics.length, function() {
            sccVM.widgetReport(tempWidgetReports);
            callback(tempWidgetReports);

        });

        _.each(listOfWidgetMetrics, function(widgetMetric, index) {
            var metricId = widgetMetric.property.definition.metricId;
            var params = {id: bcInstanceId, type: mainVM.currBCDef().bctype, metricId: metricId};
            dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(params, function(err, data) {
                if (err) {
                    console.error('err=' + JSON.stringify(err));
                } else {
                    //only modify data if data present
                    if (data && data.length > 0 && data[0].metric_value) {
                        tempWidgetReports[index].value(data[0].metric_value);
                    }
                }
                allMetrics();
            });
        });
    };

    /**
     * Update the BC instance and update the local version reference
     * @param params
     * @param callback
     * @private
     */
    sccVM._updateBCInstance = function(params, callback) {
        callback = callback || noOp;
        dexit.app.ice.integration.bcp.updateBCInstance(params, function (err, resp) {
            if (err) {
                //
            }else {
                sccVM.businessConceptInstance.property.version = resp.version;
            }
            callback(err);
        });

        //campaignPlannerVm.callingVM.businessConceptInstance.property.version = resp.version;
    };

    sccVM.updateBCCardColour = function(){

        var instance = sccVM.businessConceptInstance;
        var type = instance.property.type || instance.property.class;


        var pending = sccVM.pendingCardColour();
        sccVM.cardColour(pending);

        var val = sccVM.cardColour().replace('#','');
        var changes = [
            {op:'replace', path:'/property/presentation_card_colour', value: val}
        ];
        var params = {
            type: type,
            id: instance.id,
            version: instance.property.version,
            changes: changes
        };
        sccVM._updateBCInstance (params, function (err) {

            if (sccVM.mainVM) {
                sccVM.mainVM.cardColourPickerVisible(false);
                sccVM.mainVM.refreshCards();
            }
        });

    };


    /**
     *
     * @param {object} params
     * @param {string} bcInstanceId - bc instance id (for campaign)
     * @param {string} [epId] - engagement pattern id (will skip loading data if not set)
     * @param callback
     */
    sccVM.retrieveEPWidgetReports = function (params, callback) {
        var currentRole = mainVM.currentRole();
        var intel = sccVM.retrievePresentationMetrics(currentRole);
        if (intel.length < 1) {
            console.log('nothing to show since no metrics are configured');
            return callback(null,[]);
        }

        //populate with icon and dummy data
        var tempWidgetReport = [];
        _.each(intel, function(widgetMetric) {
            var prop = widgetMetric.property || {};
            var metricObj = {
                metricId: prop.definition.metricId,
                icon: prop.presentation_icon,
                name: prop.presentation_name || prop.definition.metricName,
                value: ko.observable('0')
            };
            metricObj.label = metricObj.name.replace(/_/g,' ');
            tempWidgetReport.push(metricObj);
        });

        //if no ep id then it is not published yet, so don't check for data
        if (!params.epId) {
            console.log('ignoring data since no ep exists yet');
            return callback(null,tempWidgetReport);
        }

        async.map(tempWidgetReport, function (item, cb) {
            var metricId = item.metricId;
            var queryParams = {
                epId: params.epId,
                bcInstanceId: params.bcInstanceId
            };
            var type = sccVM.businessConceptInstance.property.type || sccVM.businessConceptInstance.property.class;
            var args = {id: params.bcInstanceId, type: type, metricId: metricId, queryParams:queryParams};

            dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(args, function(err, data) {
                if (err) {
                    console.warn('err=' + JSON.stringify(err));
                    cb(null,item);
                } else {
                    //only modify data if data present
                    if (data && data.length > 0 && data[0].metric_value) {
                        item.value(data[0].metric_value);
                    }
                    return cb(null,item);
                }
            });
        }, function (err, vals) {
            if (err) {
                console.log('error retrieving data');
                return callback(null,tempWidgetReport);
            }
            return callback(null,vals);
        });

    };


    /**
     * Retrieves which metrics to present by role
     * @param {string} role
     * @return {Array} - metrics to show
     */
    sccVM.retrievePresentationMetrics = function (role) {
        var bcIns = sccVM.businessConceptInstance;
        var intel = _.filter(bcIns.intelligence, function (it) {
            return (it.kind.indexOf('engagementmetric') !== -1 && it.property && it.property.role === role && it.property.present_bcwidget);
        });
        return intel;
    };


    // /**
    //  * Retrieves and sets data for widget reports for each EP widget
    //  * @param bcInstanceId
    //  * @param intel - list of intelligence
    //  * @param callback
    //  */
    // sccVM.retrieveWidgetReport = function(bcInstanceId, intel, callback) {
    //
    //     var tempWidgetReports = sccVM.buildWidgetReport(bcInstanceId, intel);
    //
    //
    //     var allMetrics = _.after(intel.length, function() {
    //         sccVM.widgetReport(tempWidgetReports);
    //         if (callback) {
    //             callback(tempWidgetReports);
    //         }
    //     });
    //
    //     var forEachWidgetMetric = function(widgetMetric, index) {
    //
    //         var metricId = widgetMetric.property.definition.metricId;
    //         var params = {id: bcInstanceId, type: mainVM.currBCDef().bctype, metricId: metricId};
    //         var queryParams = {
    //             bcInstanceId: bcInstanceId,
    //             parentBCInstanceId: parentBCInstanceId
    //         };
    //
    //         dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(params, function(err, data) {
    //             if (err) {
    //                 console.warn('err=' + JSON.stringify(err));
    //             } else {
    //                 //only modify data if data present
    //                 if (data && data.length > 0 && data[0].metric_value) {
    //                     tempWidgetReports[index].value(data[0].metric_value);
    //                 }
    //             }
    //             allMetrics();
    //         });
    //     };
    //
    //     _.each(intel, forEachWidgetMetric);
    //
    // };
    sccVM.goToSubcampaigns = function(skipLoader) {
        sccVM.selectedSection('subcampaign');
        if (skipLoader) { //if page was already loaded then hide
            sccVM.hideLoader();
        }
    };

    sccVM.goToTimeline = function() {
        sccVM.selectedSection('timeline');
        sccVM.timelineVM.init();
    };

    sccVM.goToPerformance = function() {
        sccVM.selectedSection('performance');
        sccVM.performanceVM.load();
    };


    sccVM.goToAnalysis = function() {
        sccVM.selectedSection('analysis');
        sccVM.analysisVM.load();
    };

    sccVM.availableCmsConfigurationModes = ko.observableArray([]);

    sccVM.populateCmsConfigurationModes = function() {
        var resource = '/cms-config';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, config) {
            if (err || (!config && !config.supportedModes)) {
                console.warn('could not retrieve cms configuration...defaulting to internal');
                sccVM.availableCmsConfigurationModes([{id:'internal',name:'GrapesJS'}]);
            }else {
                sccVM.availableCmsConfigurationModes(config.supportedModes);
            }
        });
    };


    /**
     *
     * @param {object} args  - initialization arguments
     * @param {string} [args.reloadBCi=false]  - reload the current view
     * @param {string} [args.partialReloadBCi=false]  - partially update the current view
     * @param callback
     */
    sccVM.init = function(args, callback) {
        //check the callback function
        callback = callback || noOp;

        var reloadBCi = (args && args.reloadBCi ? true: false);

        var partialReloadBCi = (args && args.partialReloadBCi ? true: false);

        if (reloadBCi) {
            //invalidate cache,

            var bciId = sccVM.businessConceptInstance.id;
            var bcName = mainVM.currBCType();
            dexit.app.ice.integration.bcp.invalidateCacheForBCInstance({
                type: bcName,
                id: bciId
            }, function () {
                //load bc instance,
                dexit.app.ice.integration.bcp.retrieveBCInstance({
                    type: bcName,
                    id: bciId
                }, function (err, businessConceptInstance) {
                    sccVM.businessConceptInstance = businessConceptInstance;
                    //call init again
                    var newArgs = _.omit(args,'reloadBCi');
                    sccVM.init(newArgs, callback);
                });

            });
        } else if (partialReloadBCi) {
            //TODO: make  the invalidation/update consistent
            var scToAdd = args.reloadParam;

            var existingSC = (sccVM.businessConceptInstance.smartcontentobject ? sccVM.businessConceptInstance.smartcontentobject : []);
            existingSC.push(scToAdd);

            var newArgs = _.omit(args,['partialReloadBCi','reloadParam']);
            sccVM.init(newArgs, callback);

            var bciId = sccVM.businessConceptInstance.id;
            var bcName = mainVM.currBCType();

            dexit.app.ice.integration.bcp.invalidateCacheForBCInstance({
                type: bcName,
                id: bciId
            }, function () {
                // //load bc instance,
                // dexit.app.ice.integration.bcp.retrieveBCInstance({
                //     type: bcName,
                //     id: bciId
                // }, function (err, businessConceptInstance) {
                //
                //     sccVM.businessConceptInstance = businessConceptInstance;
                // });
            });


        } else {


            //by default show subcampaigns
            sccVM.goToSubcampaigns();

            //TODO: clean-up all old references to currentPortal
            //var currentPortal = (args && args.currentPortal ? args.currentPortal : '');

            // clear widget and group URLs before initialization - since list is loaded in entirety inside this function
            sccVM.widgets([]);

            //clear stages and temp cards
            sccVM.stages([]);
            sccVM.populateStages();
            sccVM.tempCards([]);

            sccVM.groupURL([]);
            sccVM.stu_SharedWidgets([]);
            sccVM.tpm([]);
            sccVM.alltps([]);
            sccVM.tempTPObject([]);

            //this is already called from portalVM on load
            //sccVM._preparePermissions();

            if (sccVM.bsb.planning()) {
                sccVM.createProgramPlan(true);
                // sccVM.goToProgramPlan();
            }


            sccVM.populateCmsConfigurationModes();

            var currentPortal = 'manager';
            switch (currentPortal) {
                case 'manager':
                    sccVM.assetsLoaded = false;   //reset the variable before making the call to import third party assets
                    mainVM.fmVM = new dexit.app.ice.edu.FileManagerVM(mainVM);
                    //Replacing \n with <br> to show new lines in html
                    if (sccVM.businessConceptInstance.property && sccVM.businessConceptInstance.property.description) {
                        sccVM.businessConceptInstance.property.description = sccVM.businessConceptInstance.property.description.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }

                    var mmTag = (sccVM.businessConceptInstance.property && sccVM.businessConceptInstance.property.mmTag ? sccVM.businessConceptInstance.property.mmTag : mainVM.currBCDef().bctype);

                    async.parallel({
                        loadAssets: function (cb) {
                            //retrieve multimedia
                            //pass MM from BC definition to sccVM
                            mainVM.loadMMForBC(mmTag, function () {
                                if (mainVM.imageMM() && mainVM.imageMM().length > 0) {
                                    sccVM.imageMM(mainVM.imageMM());
                                }
                                if (mainVM.videoMM() && mainVM.videoMM().length > 0) {
                                    sccVM.videoMM(mainVM.videoMM());
                                }

                                if (mainVM.docMM() && mainVM.docMM().length > 0) {
                                    sccVM.docMM(mainVM.docMM());
                                }
                                sccVM.assetsLoaded = true;
                                cb();
                            });
                        },
                        loadBCInstanceInfo: function (cb) {
                            // if (sccVM.businessConceptInstance.property.setupNeeded) {

                            // if (sccVM.bsb.planning()) {
                            //     sccVM.createProgramPlan(true);
                            // }
                            // }

                            mainVM.showFlashLoading('loading content, please wait...');
                            sccVM.retrieveBCInstanceInfo(sccVM.businessConceptInstance, cb);
                            // }
                        }
                    }, function (err) {


                        if (sccVM.bsb.planning()) {
                            //sccVM.createProgramPlan(true);
                            sccVM.goToProgramPlan();
                        }


                        // if (sccVM.businessConceptInstance.property.setupNeeded) {
                        // if (sccVM.bsb.planning()) {

                            //always shoe program plan by default
                            // sccVM.goToProgramPlan();

                        // }

                        // }
                        callback();
                    });
                    break;
                case 'director':
                    if (sccVM.businessConceptInstance.property && sccVM.businessConceptInstance.property.touchpoints && sccVM.businessConceptInstance.property.touchpoints.length > 0) {
                        sccVM.populateTouchpointsOfBCi(sccVM.businessConceptInstance, function () {
                            callback();
                        });
                    } else {
                        callback();
                    }
                    break;
                default:
                    console.log('currPortal not handled');
                    callback();
            }

        }

    };


    sccVM._retrieveChannelInstanceFromTP = function(tpId, callback) {

        var cacheTime = 10;
        dexit.app.ice.edu.integration.tp.retrieveChannelInstanceFromTPCached(tpId, cacheTime, callback);

    };

    /**
     * Assumes on channel instance per touchpoint
     * (Called from mainVM when loading widgets there: TODO: better initialization flow)
     * TODO: Move to Service side, currently only used in admin portal and fix name inconsistency here
     * Note: assumption of one channel per TP
     * @param {object} bc - business concept
     * @param callback
     */
    sccVM.retrieveTouchpointsDetailsOfBCi = function(bc, callback){
        var result = [];
        var tps = [];
        if (bc.property.touchpoints && _.isString(bc.property.touchpoints)) {
            tps = [bc.property.touchpoints];
        }
        if (bc.property.touchpoints && _.isArray(bc.property.touchpoints)) {
            tps = bc.property.touchpoints;
        }

        //go through all touchpoints
        async.each(tps, function(tpElement, cb) {

            //optionally split off touchpoint id from a prefix ie.  "something:idgoeshere"
            var tpId = tpElement.split(':')[1] ? tpElement.split(':')[1] : tpElement;
            var tpPrefix = tpElement.split(':')[0] ? tpElement.split(':')[0] : '';

            //retrieve channel
            sccVM._retrieveChannelInstanceFromTP(tpId, function(err, channelData) {

                //dexit.app.ice.integration.tpm.retrieveChannelInstanceFromTP(tpId, function(err, channelData) {
                if (err) {
                    return cb();
                }
                channelData = channelData || [];

                async.each(channelData, function(elementChannel, done) {
                    //TODO: remove this extra hard-coding here and only address specific cases (ie. twitter)
                    sccVM._channelCategorization(elementChannel, function(err, socialType) {
                        if (socialType) {

                            var url;
                            //for twitter, its a special case where the url to be included in the course as a touchpoint should include twitter account name and id (to be able to post),
                            //but when accessing that twitter account, you should only use the twitter account name
                            if (socialType.toLowerCase().indexOf('twitter') > -1) {
                                url = elementChannel.url.split('/lists/')[0];
                            } else {
                                url = elementChannel.url;
                            }
                            result.push({
                                name: elementChannel.name,
                                channelTypeId:elementChannel.channelTypeId,
                                tpId: tpId,
                                tpType: socialType,
                                tpURL: url,
                                channelType: socialType.toLowerCase()
                            });
                        }
                        done();
                    });
                }, cb);
            });

        }, function(){
            callback(result);
        });
    };
    sccVM.populateTouchpoints = function(callback) {
        callback = callback || noOp;
        sccVM.populateTouchpointsOfBCi(sccVM.businessConceptInstance, callback);
    };

    sccVM.populateTouchpointsOfBCi = function (bc, callback) {
        callback = callback || noOp;
        sccVM.retrieveTouchpointsDetailsOfBCi(bc, function(res) {
            //sccVM.tpm([]);
            res = res || [];
            var mapped = _.map(res, function(tp) {
                return {
                    name: tp.name,
                    tpId: tp.tpId,
                    tpType: tp.tpType,
                    tpURL: tp.tpURL,
                    channelType: tp.channelType,
                    channelTypeId: tp.channelTypeId
                };
            });
            sccVM.tpm(mapped);
            callback();
        });
    };


    sccVM.reloadMultimediaForBC = function() {
        sccVM.imageMM.removeAll();
        sccVM.videoMM.removeAll();
        sccVM.audioMM.removeAll();
        sccVM.docMM.removeAll();
        sccVM.loadMMForBC(function(err) {
            if (err) {
                console.error('Could not retrieve course MM');
            }
        });
    };

    sccVM.showLoader = function(message) {
        var msg = message || 'loading content, please wait...';
        mainVM.showFlashLoading(msg);
        $('.campaign-action-loader').removeClass('hidden');

    };


    //function used to show the loader after lectures are being loaded.
    sccVM.hideLoader = function() {
        sccVM.bcInstancesLoaded(true);
        $('.campaign-action-loader').addClass('hidden');
        $('#lecturePanels').removeClass('initial-hide');

        $('[data-toggle="tooltip"]').tooltip();
    };

    // turn on the home and lecture buttons for UCC channel
    //
    sccVM.hideControls = ko.observable(true);

    // sccVM.showUCCLecture = function(data, vm, el, role) {
        // $('.content-scroller').removeClass('hidden');
        //
        //
        //
        // // reset bccLib
        // bccLib.setUser({id: mainVM.user.id, name: mainVM.user.name});
        // bccLib.resetAll();
        // bccLib.emptyContainer();
        //
        // // reset any active course icons
        // $('.ucc-channel-icon').removeClass('ucc-lecture-active');
        //
        // // add highlight to this course icon
        // if (el) {
        //     el.classList.add('ucc-lecture-active');
        // }
        //
        // var $scroller = $('.content-scroller');
        // $scroller.css('height', $scroller.height() + 'px' );
        // $('.ucc-preloader').height($scroller.height() - 20 + 'px').addClass('show-ucc-preloader');
        //
        //
        // //override container for preview can work
        // bccLib.setContainerOverride('preview-container');
        //
        //
        // $('.quickstats-container').removeClass('show-quickstats');
        // sccVM.uccPreviewMode(true);
        // mainVM.executeEP(vm.sc());

    // };

    sccVM.showDBMetrics = function() {
        $('.quickstats-container').addClass('show-quickstats');
    };


    //-- Begin variables for multimedia ==//

    sccVM.imageMM = ko.observableArray();
    sccVM.videoMM = ko.observableArray();
    sccVM.audioMM = ko.observableArray();
    sccVM.docMM = ko.observableArray();

    sccVM.noImagesAvailable = ko.computed(function() {
        return (sccVM.imageMM() && sccVM.imageMM().length === 0);
    });

    sccVM.noVideoAvailable = ko.computed(function() {
        return (sccVM.videoMM() && sccVM.videoMM().length === 0);
    });

    sccVM.noDocumentsAvailable = ko.computed(function() {
        return (sccVM.docMM() && sccVM.docMM().length === 0);
    });

    // -- End variables for multimedia -- //

    /**
     * Finds multimedia associated with this
     * @param callback
     */
    sccVM.loadMMForBC = function(callback) {
        callback = callback || noOp;


        //find the files associated with this course.
        if (!sccVM.businessConceptInstance || !sccVM.businessConceptInstance.id) {
            console.error('cannot load mm');
            return callback(new Error('vm not properly initialized: bci missing'));
        }


        var tag =  (sccVM.businessConceptInstance.property && sccVM.businessConceptInstance.property.mmTag ? sccVM.businessConceptInstance.property.mmTag: mainVM.currBCDef().bctype);

        //var bciId = sccVM.businessConceptInstance.id;
        //var tag = 'bci:'+bciId;

        //TODO: determine all "tags" we want:  for now its only BCi identifier, it could be "related"
        async.auto({
            getTags: function (done) {
                dexit.app.ice.integration.filemanagement.findFileDetailsByTag(tag, done);
            },
            populateFiles: ['getTags', function (done, result) {
                //populate
                var files =  result.getTags || [];
                async.each(files, function (fileInfo, cbFiles) {
                    var tags = fileInfo.tags || [];
                    async.each(tags, function (fileTag, cbTags) {
                        switch (fileTag) {
                            case 'image':
                                sccVM.imageMM.push(fileInfo.url);
                                break;
                            case 'video':
                                sccVM.videoMM.push(fileInfo.url);
                                break;
                            case 'audio':
                                sccVM.audioMM.push(fileInfo.url);
                                break;
                            case 'document':
                                sccVM.docMM.push(fileInfo.url);
                                break;
                        }
                        cbTags();
                    }, cbFiles);
                }, done);
            }]
        }, function (err,results) {
            if (err) {
                console.error('could not load files for BCi');
            }
            callback(err);
        });
    };


    /**
     * Removes the temp new group details, resets VM / view
     * @param {string} group - is a reference to the current temporary new group being created
     */
    sccVM.removeGroup = function() {

        mainVM.selectedTPType(null);

        mainVM.addingTouchPoint(false);

        mainVM.tpList = [];
        mainVM.tpNameList([]);
        mainVM.selectedTP(null);
    };

    sccVM.clearPendingTouchpoint = function() {
        sccVM.pendingChannelUrl(null);
        mainVM.selectedTPType(null);
        mainVM.addingTouchPoint(false);
        sccVM.validTPURL(false);
        mainVM.tpList = [];
        mainVM.tpNameList([]);
        mainVM.selectedTP(null);
    };

    /**
     * Sets TP creation UI validation: invalid and message
     * Should be a better way to decouple this
     * @param {object} element - html element reference
     * @param {string} validationWarningMessage
     * @private
     */


    sccVM._setInvalidTouchpointUI = function(element, validationWarningMessage) {

        element.classList.add('warning-class');
        element.parentNode.classList.add('tp-validate-error');
        element.parentNode.dataset.validationwarning = validationWarningMessage;
    };

    /**
     * Sets TP creation UI validation: invalid and message
     * Should be a better way to decouple this
     * @param {object} element - html element reference
     * @param {string} [message]
     * @private
     */
    sccVM._setValidTouchpointUI = function(element, message) {
        element.classList.remove('warning-class');
        element.parentNode.classList.remove('tp-validate-error');
        if (message) {
            element.parentNode.dataset.validationwarning = 'pending';
        }

    };

    /**
     * Validates the selected touchpoint request
     * (For now is only the channel url and if that is duplicate)
     * @param element
     * @param event
     */
    sccVM.validateTP = function(element, event) {


        function setInvalid(message) {
            sccVM.validTPURL(false);
            sccVM._setInvalidTouchpointUI(element, message);
        }

        function setValid() {
            sccVM.validTPURL(true);
            sccVM._setValidTouchpointUI(element, 'pending');
        }

        // catch false event and quit
        if (!event || event.type === 'click') {
            return;
        }

        // check to see if the url is valid at all
        var url = element.value;

        //return immediately if no input
        if (!url || url.length < 1) {
            return;
        }
        var selectedTPType = mainVM.selectedTPType();
        if (!selectedTPType) {
            console.warn('cannot validate url without selecting a channel type');
            return;
        }

        var regexStr = mainVM.touchpointTypes()[selectedTPType].urlRegex;
        var regex = new RegExp(regexStr);
        //if url matches regex supplied for channel type then its value
        if (!regex.test(url)) {
            setInvalid('Must be a valid ' + selectedTPType + ' URL');
            return;
        } else {
            setValid();
            //set url so it an be used by createTouchpoint
            sccVM.pendingChannelUrl(url);
        }

        //check for duplicates and ignore case since its a url
        var isDuplicate = _.findIndex(sccVM.tpm(), function(tp) {
            return tp.tpURL.trim().toLowerCase() === element.value.trim().toLowerCase();
        });

        //Since the url of facebook page is converted, therefore, do another check for facebook page
        var fbPages = _.filter(sccVM.tpm(), function(tp) {
            return tp.tpURL.indexOf('pages') > -1;
        });

        // compare the facebook page id
        var isfbPageDulicate = _.findIndex(fbPages, function(tp) {
            var tpArrayLength = tp.tpURL.trim().split('/').length;
            var elementArrayLength = element.value.trim().toLowerCase().split('//')[1].split('/')[1].split('-').length;
            return tp.tpURL.trim().toLowerCase().split('/')[ tpArrayLength - 2] === element.value.trim().toLowerCase().split('//')[1].split('/')[1].split('-')[elementArrayLength - 1];
        });

        if (isDuplicate !== -1 || isfbPageDulicate !== -1) {
            sccVM.validTPURL(false);
            setInvalid('Must be a unique ' + selectedTPType + ' URL');
            return;
        } else {
            sccVM._setValidTouchpointUI(element);
        }

        sccVM.validTPURL(element.value !== '' && element.value !== undefined && isDuplicate === -1);

    };
    /**
     * If the channel type is UCC,the url of the channels will be set, so the validation of the input url can be skipped .
     * (For now is only the channel url and if that is duplicate)
     * @param element
     * @param event
     */
    sccVM.skipValidation = function(element, event) {
        // catch false event and quit
        if (!event || event.type !== 'click') {
            return;
        }

        var selectedTPType = mainVM.selectedTPType();
        if (selectedTPType !== null) {
            sccVM.validTPURL(true);
        }

    };
    sccVM._getCurrentBCDefinition = function() {
        return mainVM.currBCDef();
    };
    sccVM.selectedTPType = mainVM.selectedTPType() ? mainVM.selectedTPType() : null;
    sccVM.selectedTP = mainVM.selectedTP() ? mainVM.selectedTP() : null;
    /**
     * Creates a touchpoint from the specified element (assumption of single channel right now and no setting for device categories)
     */
    sccVM.createTouchpoint = function(callback) {
        callback = callback || noOp;
        var selectedTouchpoint;

        function handleCreateTP(bcType, err, response) {
            if (err) {
                //TODO: should be a message that creating the touchpoint failed for the user
                console.error('could not create touchpoint');
                return;
            }
            sccVM.addTouchpointToBC({bcType: bcType, touchpointId: response.result}, function(){

                //reset and close popover
                sccVM.clearPendingTouchpoint();
                $('.sNav .popover').popover('hide');
                callback();
            });

        }

        function handleAssignTP(err, response) {
            if (err) {
                //TODO: should be a message showing that assigning the touchpoint failed for the user
                console.error('could not assign touchpoint');
                return;
            } else {
                console.log(JSON.stringify(response));
            }
            //reset and close popover
            sccVM.clearPendingTouchpoint();
            $('.sNav .popover').popover('hide');
            callback();

        }
        var channelType = sccVM.selectedTPType;
        if (!channelType) {
            console.error('channel type must be selected');
            return;
        }        //should be a better way to reference bc
        var bcType = sccVM._getCurrentBCDefinition().bctype;

        //TODO: should review naming or allow user to set a name
        //if channelAuth setting is true, FB channel will get auth before generating the TP&channel instance
        //if the channel type is UCC, assign UCC touchpoint to BCI.
        //otherwise, all groups will be handled as same process
        if (channelType === 'ucc' || channelType === 'twitter') {
            selectedTouchpoint = _.find(mainVM.tpList, {tpName: sccVM.selectedTP});
            sccVM.addTouchpointToBC({bcType: bcType, touchpointId: selectedTouchpoint.tpId}, handleAssignTP);
        } else {
            var channelTypeId = mainVM.touchpointTypes()[channelType].channelTypeId;
            var url = sccVM.pendingChannelUrl();
            // convert facebook page url
            if(url.trim().toLowerCase().indexOf('facebook') > -1 && url.trim().toLowerCase().indexOf('pages') === -1 && url.trim().toLowerCase().indexOf('groups') === -1){
                var arrayLength = url.trim().split('//')[1].split('/')[1].split('-').length;
                var protocalType = url.trim().split('//')[0];
                var domainofURL = url.trim().split('//')[1].split('/')[0];
                var pageId = url.trim().split('//')[1].split('/')[1].split('-')[arrayLength - 1];
                var userName = url.trim().split('//')[1].split('/')[1].split('-' + pageId)[0];
                url = protocalType + '//' + domainofURL + '/' + 'pages' + '/' + userName + '/' + pageId + '/';
            }
            var body = {
                groupURL: url.trim(), // groupID is storing the entire url.
                name: 'ice4m:' + sccVM.businessConceptInstance.property.code + '-' + bcType,
                channelType: channelType,
                channelTypeId: channelTypeId
            };
            var cb = _.partial(handleCreateTP, bcType);
            //TODO: when add facebook touchpoint but the channel is not authorised, the touchpoint will be created, but the facebook group will not be created.
            if (mainVM.channelAuth() === 'true' && url.toLowerCase().indexOf('groups/') > -1 && channelType.toLowerCase() === 'facebook') {
                //TODO: unify facebook group creation and other touchpoints
                dexit.app.ice.edu.integration.fbgroup.createGroup(body, cb);
            } else {
                dexit.app.ice.integration.tpm.createTouchpoint(body, cb);
            }
        }
    };


    /**
     * Creates a touchpoint from the specified element through explicit parameters
     * (assumption of single channel right now and no setting for device categories)
     */
    sccVM.createTouchpointExplicit = function(params, callback) {
        callback = callback || noOp;
        var selectedTouchpoint;


        function handleCreateTP(bcType, err, response) {
            if (err) {
                //TODO: should be a message that creating the touchpoint failed for the user
                console.error('could not create touchpoint');
                return;
            }
            sccVM.addTouchpointToBC({bcType: bcType, touchpointId: response.result}, function(){

                //reset and close popover
                sccVM.clearPendingTouchpoint();
                $('.sNav .popover').popover('hide');
                callback();
            });

        }

        function handleAssignTP(err, response) {
            if (err) {
                //TODO: should be a message showing that assigning the touchpoint failed for the user
                console.error('could not assign touchpoint');
                return;
            } else {
                console.log(JSON.stringify(response));
            }
            //reset and close popover
            sccVM.clearPendingTouchpoint();
            $('.sNav .popover').popover('hide');
            callback();

        }


        var channelType = params.channelType;
        if (!channelType) {
            console.error('channel type must be selected');
            return;
        }        //should be a better way to reference bc


        var bcType = sccVM._getCurrentBCDefinition().bctype;

        //TODO: should review naming or allow user to set a name
        //if channelAuth setting is true, FB channel will get auth before generating the TP&channel instance
        //if the channel type is UCC, assign UCC touchpoint to BCI.
        //otherwise, all groups will be handled as same process
        if (channelType === 'ucc' || channelType === 'twitter') {
            selectedTouchpoint = _.find(mainVM.tpList, {tpName: sccVM.selectedTP});
            sccVM.addTouchpointToBC({bcType: bcType, touchpointId: selectedTouchpoint.tpId}, handleAssignTP);
        } else {
            var channelTypeId = mainVM.touchpointTypes()[channelType].channelTypeId;
            var url = sccVM.pendingChannelUrl();
            // convert facebook page url
            if(url.trim().toLowerCase().indexOf('facebook') > -1 && url.trim().toLowerCase().indexOf('pages') === -1 && url.trim().toLowerCase().indexOf('groups') === -1){
                var arrayLength = url.trim().split('//')[1].split('/')[1].split('-').length;
                var protocalType = url.trim().split('//')[0];
                var domainofURL = url.trim().split('//')[1].split('/')[0];
                var pageId = url.trim().split('//')[1].split('/')[1].split('-')[arrayLength - 1];
                var userName = url.trim().split('//')[1].split('/')[1].split('-' + pageId)[0];
                url = protocalType + '//' + domainofURL + '/' + 'pages' + '/' + userName + '/' + pageId + '/';
            }
            var body = {
                groupURL: url.trim(), // groupID is storing the entire url.
                name: 'ice4m:' + sccVM.businessConceptInstance.property.code + '-' + bcType,
                channelType: channelType,
                channelTypeId: channelTypeId
            };
            var cb = _.partial(handleCreateTP, bcType);
            //TODO: when add facebook touchpoint but the channel is not authorised, the touchpoint will be created, but the facebook group will not be created.
            if (mainVM.channelAuth() === 'true' && url.toLowerCase().indexOf('groups/') > -1 && channelType.toLowerCase() === 'facebook') {
                //TODO: unify facebook group creation and other touchpoints
                dexit.app.ice.edu.integration.fbgroup.createGroup(body, cb);
            } else {
                dexit.app.ice.integration.tpm.createTouchpoint(body, cb);
            }
        }
    };



    /**
     * Add the specified touchpoint to the BC
     * @param {object} params
     * @param {string} params.touchpointId
     * @param {string} [params.bcType]
     */
    sccVM.addTouchpointToBC = function(params, callback) {
        callback = callback || noOp;


        if (!params || !params.touchpointId) {
            return callback(new Error('params.touchpointId is required'));
        }

        //prepare to update, still prefixing it with a bc type but seems to be ignored everywhere
        var val = (params.bcType ? (params.bcType + ':' + params.touchpointId) : params.touchpointId );
        //touchpoints should already be an array on load to avoid a mess like  this
        if (_.isArray(sccVM.businessConceptInstance.property.touchpoints)) {
            sccVM.businessConceptInstance.property.touchpoints.push(val);
        } else {
            var tempTP = _.clone(sccVM.businessConceptInstance.property.touchpoints);
            sccVM.businessConceptInstance.property.touchpoints = [];
            if (tempTP) {
                sccVM.businessConceptInstance.property.touchpoints.push(tempTP);
            }
            sccVM.businessConceptInstance.property.touchpoints.push(val);
        }

        var handleUpdateContainer = function(err) {
            if (err) {
                callback(err);
                //setError(course);
            }
            else {
                //should be better way to refresh touchpoint list only
                sccVM.init({currentPortal: mainVM.currPortal(), reloadBCi: true}, function() {
                    sccVM.validateTPMessage('');
                });
                callback();
            }
        };
        // update the container
        dexit.app.ice.integration.scm.container.update(mainVM.repo, sccVM.businessConceptInstance.id, sccVM.businessConceptInstance.property, handleUpdateContainer);
    };

    /**
     * [removeTPAssociation description]
     * @param  {object} specific touchpoint ref is passed in via function invocation
     * @return {array} if there is a collection of touchpoints, this is the filtered result of the touchpoint disassociation
     */
    sccVM.removeTPAssociation = function(touchpoint) {
        var property = sccVM.businessConceptInstance.property;
        property.touchpoints = property.touchpoints || [];
        if(_.isArray(property.touchpoints)) {
            // find and remove the touchpoint from touchpoints array
            property.touchpoints = _.reject(property.touchpoints, function(tpoint) {
                var tpId = tpoint.split(':')[1]?tpoint.split(':')[1]:tpoint;
                return (tpId === touchpoint.tpId);
            });
        } else {

            //make sure we are deleting the right one
            var tpId = property.touchpoints.split(':')[1]?property.touchpoints.split(':')[1]:property.touchpoints;
            if (tpId === touchpoint.tpId) {
                // there's only one, so nuke the whole touchpoints property
                delete property.touchpoints;
            }

        }

        var handleUpdateContainer = function(err) {
            if (err) {
                console.log('could not remove touchpoint: ', err);
            }
            else {
                //should be better way to refresh touchpoint list only
                sccVM.init({currentPortal: mainVM.currPortal(), reloadBCi:true}, function() {
                    sccVM.validateTPMessage('');
                });
            }
        };
        // update the container
        dexit.app.ice.integration.scm.container.update(mainVM.repo, sccVM.businessConceptInstance.id, sccVM.businessConceptInstance.property, handleUpdateContainer);
    };

    /**
     * Only called by sccVM.retrieveTouchpointsOfCourse
     * @param elementChannel
     * @param callback
     * @private
     */
    sccVM._channelCategorization = function(elementChannel, callback) {
        var socialType = '';
        if (elementChannel.type && elementChannel.type.indexOf('facebook') > -1) {
            socialType = 'Facebook';
            callback(null, socialType);

        }
        else if (elementChannel.type && elementChannel.type.indexOf('tumblr') > -1) {
            socialType = 'Tumblr';
            callback(null, socialType);
        }
        else if (elementChannel.type && elementChannel.type.indexOf('twitter') > -1) {
            socialType = 'Twitter';
            // comment out for now, since twitter notification feature is not used currently.
            //sccVM.twitterNotification(true);
            callback(null, socialType);
        }
        else if (elementChannel.type && elementChannel.type.indexOf('ucc') > -1) {
            socialType = 'UCC';
            callback(null, socialType);
        }
        else {
            //socialType = 'Mobile';
            //remove legacy 'Mobile';
            socialType = elementChannel.type;
            callback(null, socialType);
        }
    };
    // TODO -> make this work!
    //This function sort the array of widgets alphabetically based on the smart content name.
    sccVM.sortWidgets = function() {
        sccVM.widgets.sort(function(a, b) {
            if ((a && a.sc() && a.sc().property && a.sc().property.name) && (b && b.sc() && b.sc().property && b.sc().property.name)) {
                var aTag = parseInt(a.sc().property.name.split(/[ _]/)[1]);
                var bTag = parseInt(b.sc().property.name.split(/[ _]/)[1]);
                if (aTag < bTag) return -1;
                if (aTag > bTag) return 1;
                return 0;
            }
            else {
                return 0;
            }
        });
    };

    sccVM.accessLectureLink = function(lectureId, touchpoint) {
        var tabWindow = window.open('', '_blank');
        tabWindow.document.write('<i style="color: #999; font-family: arial, helvetica, sans-serif">Loading page, please wait...</i>');
        dexit.app.ice.edu.integration.lectureManager.accessLectureLink(lectureId, touchpoint, function(err, res) {
            if (err) {
                console.error('Cannot open link');
            } else {
                tabWindow.location.href = res.linkURL;
            }
        });
    };

    //Recursive function that take the first 6 lectures of the array of lectures, and retrieve their details (ie ePatterns and eMetrics)
    //Note: when we splice an array, the spliced elements get removed from the array, so array of size 12, then splice(0,6) will keep array of size 6
    function retrieveLecturesDetails(lectures, done) {
        if (lectures.length > 0) {
            var incrementBy = 6; // constant variable to indicate the increments for each call, we want to receive 6 lectures at a time.
            var arrLect = lectures.splice(0, incrementBy);  // always splice from the begging of the array till the incrementBy value
            async.each(arrLect, function(lecture, doneList) {
                if (lecture && lecture.id) {
                    dexit.app.ice.edu.integration.lectureManager.retrieveLectureDetails(lecture.id, function(err, res) {
                        if (err){
                            console.log('retrieveBCInstanceInfo: problem retrieving details');
                            //TODO: handle error
                        }
                        var indexOfLecture = arrLect.indexOf(lecture);

                        arrLect[indexOfLecture].ePatterns = res.ePatterns;
                        arrLect[indexOfLecture].isPatternActive = res.isPatternActive;
                        if (res.patternStart) {
                            arrLect[indexOfLecture].patternStart = res.patternStart;
                        }
                        if (res.patternEnd) {
                            arrLect[indexOfLecture].patternEnd = res.patternEnd;
                        }
                        doneList();
                    });
                }
            }, function(err) {
                retrieveLecturesDetails(lectures, done);
                done(arrLect);
            });
        } else {
            done();
        }

    }


    sccVM.retrieveStageDefinition = function(name) {
        return _.find(sccVM.stages(), {name:name});
    };

    sccVM.moveCardToStage = function(stageName, cardVM) {

        //delete from previous
        _.each(sccVM.stageVMs(), function(stageVM){
            stageVM.cards.remove(function(item) {
                return (item.id === cardVM.id);
            });
        });

        //add to new
        var found = _.find(sccVM.stageVMs(), function(stageVM) {
            return (stageVM.name() === stageName);
        });
        if (found) {
            found.cards.push(cardVM);
        }


    };


    sccVM.numberOfSubcampaigns = ko.pureComputed(function(){
        return sccVM.tempCards().length + ' Subcampaigns';
    });

    sccVM.numberPublished = ko.pureComputed(function(){
        var stageVM = _.find(sccVM.stageVMs(),  function(item) {
            return (item.name() && item.name() === 'published');
        });
        return (stageVM ?  stageVM.cards().length : 0 );
    });

    sccVM.numberScheduled = ko.pureComputed(function(){

        var stageVM = _.find(sccVM.stageVMs(),  function(item) {
            return (item.name() && item.name() === 'scheduling');
        });
        return (stageVM ?  stageVM.cards().length : 0 );
    });

    sccVM.timelineSettingsModalVisible = ko.observable();


    sccVM.showTimelineSettings = function() {
        sccVM.timelineSettingsModalVisible(true);
    };
    sccVM.bcInstancesLoaded = ko.observable();


    /**
     * Should retrieve All BC objects, touchpoints, attributes and metrics related to current passed BC container instance
     * (replaces the retrieveContainerInfo function for retrieving BCs and Engagement Plans)
     * (Called from sccVM.init for currentPortal == 'manager')
     * FIXME: cannot listen for completion of initializeSDK due to internal structure, code needs to be refactored
     * @param {object} containerElement - smartcontentcontainer instance
     * @param {string} containerElement.id - smartcontentcontainer id
     * @param callback
     */
    sccVM.retrieveBCInstanceInfo = function(containerElement, callback) {
        callback = callback || noOp;
        sccVM.populateTouchpoints(function() {
            sccVM.alltps(sccVM.tpm());
            sccVM.validateTPMessage('');
        });

        //1.check container's attributes
        sccVM.tempCards([]);
        //2.retrieve all sub BC objects
        var scs = (containerElement.smartcontentobject && containerElement.smartcontentobject.length > 0 ? containerElement.smartcontentobject : []);

        var eps = _.filter(scs, function(item) {
            return (item.property && item.property.type && item.property.type.indexOf('EngagementPlan') !== -1 );
        });

        if (eps.length < 1) {
            mainVM.showFlashInformation('Nothing to load. Please create a '+mainVM.currBCDef().singular);
            $('.iconHover').removeClass('hidden');
            sccVM.assetsLoaded = true;
            sccVM.hideLoader();
            return callback();
        }


        var showWidgets = _.after(eps.length, function() {
            sccVM.hideLoader();
        });

        retrieveLecturesDetails(eps, function(lects) {
            lects = lects || [];

            async.map(lects, function(lecture, cb) {

                var currentStage = (lecture.ePatterns &&
                lecture.ePatterns.length > 0 &&
                lecture.ePatterns[0].pattern &&
                lecture.ePatterns[0].pattern._currentActivity ?
                    lecture.ePatterns[0].pattern._currentActivity : sccVM.stages()[0].name);



                async.auto({
                    loadTPs: function(done){
                        sccVM.handleChosenTouchpoints(lecture, function(tpList) {
                            done(null,tpList);
                        });
                    },
                    loadIntelligenceToPresent: function(done) {

                        //disable intel inside campaign fornow
                        done(null,[]);
                        //only retrieve if intelligence should be shown for stage
                        // var stageDef = sccVM.retrieveStageDefinition(currentStage);

                        // if (!stageDef.presentIntelligence) {
                        //     return done(null,[]);
                        // }
                        //
                        // var epId = (lecture.ePatterns && lecture.ePatterns.length > 0 ? lecture.ePatterns[0].id : null);
                        // sccVM.retrieveEPWidgetReports({bcInstanceId:sccVM.businessConceptInstance.id,epId:epId}, function (err, data) {
                        //     if (err) {
                        //         //ignore
                        //         data = [];
                        //     }
                        //     done(null,data);
                        // });
                    }
                }, function(err, res) {
                    if (err) {
                        return cb(err);
                    }
                    var toReturn = new dexit.app.ice.EPCardVM({
                        sc: {
                            id: lecture.id,
                            property: lecture.property,
                            touchpoints: sccVM.tpm()
                        },
                        parentVM: sccVM,
                        container: containerElement,
                        mainVM: mainVM,
                        name: lecture.property.name,
                        ePatterns: lecture.ePatterns,
                        isPatternActive: lecture.isActive,
                        widgetReport: res.loadIntelligenceToPresent,
                        chosenTPs: res.loadTPs,
                        currentStage:  currentStage,
                        wf: sccVM.stages()
                    });
                    showWidgets();
                    cb(null,toReturn);
                });
            }, function(err, result) {
                if (err) {
                    //show error
                }
                result = result || [];
                var con =  sccVM.tempCards().concat(result);
                sccVM.tempCards(con);
                //sort into stages
                sccVM.addCardsIntoStages(result);
            });
        });
        callback();


        // dexit.app.ice.edu.integration.courseManagement.listLectures(containerElement.id, function(err, res){
        //     if(err) {
        //         console.error('Cannot retrieve container: '+containerElement.id);
        //         //TODO: fix for case of no BCis
        //         mainVM.showFlashWarning('Cannot retrieve content. Please contact admin.');
        //         return callback();
        //     } else if(res) {
        //         //2.1 retrieve all Touchpoints and save in groupURL
        //         sccVM.tempTPObject([]);
        //         //var tempURL;
        //
        //
        //
        //
        //         // _.each(res.touchpoints, function(tp) {
        //         //     tempURL = tp.tpURL;
        //         //     if (tp.tpType) {
        //         //         if (tp.tpType.toLowerCase() === 'twitter') {
        //         //             //for twitter, its a special case where the url to be included in the course as a touchpoint should include twitter account name and id (to be able to post),
        //         //             //but when accessing that twitter account, you should only use the twitter account name
        //         //             tempURL = tp.tpURL.split('/lists/')[0];
        //         //             // comment out for now, since twitter notification feature is not used currently.
        //         //             //sccVM.twitterNotification(true);
        //         //         }
        //         //         var tpObj = {name:(tp.name || tp.channelType),  tpId: tp.tpId, tpType: tp.tpType, tpURL: tempURL, channelType: tp.channelType,channelTypeId: tp.channelTypeId};
        //         //
        //         //         //TODO: unify 3 different observables
        //         //         sccVM.tpm.push(tpObj);
        //         //         sccVM.alltps.push(tpObj);
        //         //         sccVM.validateTPMessage('');
        //         //         //need to change object's property names to pass to accessLectureLink
        //         //         sccVM.tempTPObject.push({
        //         //             type: tp.tpType,
        //         //             link: tempURL,
        //         //             id: tp.tpId,
        //         //             channelTypeId:tp.channelTypeId,
        //         //             channelType: tp.channelType
        //         //         });
        //         //         // if (tp.channelType.toLowerCase() === 'ucc') {
        //         //         //     sccVM.uccActive(true);
        //         //         //     mainVM.initializeSDK(tp.tpURL, function() {
        //         //         //     });
        //         //         // }
        //         //     } else {
        //         //         console.error('TP type can not be identified!');
        //         //     }
        //         //
        //         // });
        //
        //         if (res && res.lectures && res.lectures.length > 0) {
        //             //2.2 retrieve all BC objects('EngagementPlans') and save in widgets
        //             var showWidgets = _.after(res.lectures.length, function() {
        //                 sccVM.hideLoader();
        //             });
        //             //TODO: revise to only load EngagementPatterns later on
        //             retrieveLecturesDetails(res.lectures, function(lects) {
        //                 lects = lects || [];
        //
        //                 async.map(lects, function(lecture, cb) {
        //
        //                     var currentStage = (lecture.ePatterns &&
        //                     lecture.ePatterns.length > 0 &&
        //                     lecture.ePatterns[0].pattern &&
        //                     lecture.ePatterns[0].pattern._currentActivity ?
        //                         lecture.ePatterns[0].pattern._currentActivity : sccVM.stages()[0].name);
        //
        //
        //
        //                     async.auto({
        //                         loadTPs: function(done){
        //                             sccVM.handleChosenTouchpoints(lecture, function(tpList) {
        //                                 done(null,tpList);
        //                             });
        //                         },
        //                         loadIntelligenceToPresent: function(done) {
        //
        //                             //disable intel inside campaign fornow
        //                             done(null,[]);
        //                             //only retrieve if intelligence should be shown for stage
        //                             // var stageDef = sccVM.retrieveStageDefinition(currentStage);
        //
        //                             // if (!stageDef.presentIntelligence) {
        //                             //     return done(null,[]);
        //                             // }
        //                             //
        //                             // var epId = (lecture.ePatterns && lecture.ePatterns.length > 0 ? lecture.ePatterns[0].id : null);
        //                             // sccVM.retrieveEPWidgetReports({bcInstanceId:sccVM.businessConceptInstance.id,epId:epId}, function (err, data) {
        //                             //     if (err) {
        //                             //         //ignore
        //                             //         data = [];
        //                             //     }
        //                             //     done(null,data);
        //                             // });
        //                         }
        //                     }, function(err, res) {
        //                         if (err) {
        //                             return cb(err);
        //                         }
        //                         var toReturn = new dexit.app.ice.EPCardVM({
        //                             sc: {
        //                                 id: lecture.id,
        //                                 property: lecture.property,
        //                                 touchpoints: sccVM.tpm()
        //                             },
        //                             parentVM: sccVM,
        //                             container: containerElement,
        //                             mainVM: mainVM,
        //                             name: lecture.property.name,
        //                             ePatterns: lecture.ePatterns,
        //                             isPatternActive: lecture.isActive,
        //                             widgetReport: res.loadIntelligenceToPresent,
        //                             chosenTPs: res.loadTPs,
        //                             currentStage:  currentStage,
        //                             wf: sccVM.stages()
        //                         });
        //                         showWidgets();
        //                         cb(null,toReturn);
        //                     });
        //                 }, function(err, result) {
        //                     if (err) {
        //                         //show error
        //                     }
        //                     result = result || [];
        //                     var con =  sccVM.tempCards().concat(result);
        //
        //                     sccVM.tempCards(con);
        //
        //                     //sort into stages
        //                     sccVM.addCardsIntoStages(result);
        //
        //                     //sort all cards into stages
        //
        //
        //                     //show
        //                     //sccVM.hideLoader();
        //
        //                 });
        //             });
        //         }else{
        //             mainVM.showFlashInformation('Nothing to load. Please create a '+mainVM.currBCDef().singular);
        //             $('.iconHover').removeClass('hidden');
        //             sccVM.assetsLoaded = true;
        //             sccVM.hideLoader();
        //         }
        //
        //     }else {
        //         mainVM.showFlashInformation('Please create a touchpoint to proceed.');
        //         $('.iconHover').removeClass('hidden');
        //         sccVM.assetsLoaded = true;
        //         sccVM.hideLoader();
        //     }
        //     callback();
        // });
    };

    /**
     * Puts cardVMs into stages
     * TODO: optimize
     * @param {dexit.app.ice.EPCardVM[]} cardVMs
     */
    sccVM.addCardsIntoStages = function(cardVMs) {
        if (!_.isArray(cardVMs)) {
            cardVMs = [cardVMs];
        }
        var stageVMs =sccVM.stageVMs();
        _.each(cardVMs, function(cardVM) {
            var cardStageName = cardVM.currentActivity();
            _.each(stageVMs, function(stageVM) {
                if (stageVM.name() === cardStageName){
                    stageVM.cards.push(cardVM);
                }
            });
        });
    };

    sccVM.selectedCard = ko.observable();
    sccVM.selectedCardName = ko.pureComputed(function(){
        if (sccVM.selectedCard()) {
            return sccVM.selectedCard().name();
        } else {
            return '';
        }
    });
    sccVM.enableEPCopy = ko.observable(true);

    sccVM.findCard = function(args) {
        var card = ko.utils.arrayFirst(sccVM.tempCards(), function (card) {
            return (args && card.sc() && card.sc().id && card.sc().id === args.scId);
        });
        return card;
    };

    sccVM.findCardByEp = function(args) {
        var found = ko.utils.arrayFirst(sccVM.tempCards(), function (card) {
            return (args && args.epId && args.epRevision && card.ePatterns() && card.ePatterns().length > 0
                && card.ePatterns()[0] && card.ePatterns()[0].id == args.epId
                && card.ePatterns()[0].revision && card.ePatterns()[0].revision ==  args.epRevision);
            // return (args && card.sc() && card.sc().id && card.sc().id === args.scId);
        });
        return found;
    };

    sccVM.copySelectedEP = function(args, callback) {
        var card = ko.utils.arrayFirst(sccVM.tempCards(), function (card) {
            return (card.sc() && card.sc().id && card.sc().id === args.scId);
        });
        if (card) {
            sccVM.selectedCard(card);
            sccVM.createNewVersionOfEP(args.name, callback);

        }else {
            callback();
        }

    };


    sccVM.createNewVersionOfEPDefaultName = function() {
        var selectedCard = sccVM.selectedCard();
        var name = selectedCard.name() + ' new';
        sccVM.createNewVersionOfEP(name);
    };

    //used
    sccVM.createNewVersionOfEP = function (name, callback) {



        callback = callback || noOp;

        var selectedCard = sccVM.selectedCard();
        var newName = name || (selectedCard.name() + ' new');

        //hide the modal
        sccVM.copyEPModalVisible(false);


        //show the loader
        sccVM.showLoader('Cloning...please wait');


        if (sccVM.enableEPCopy() !== true) {
            return callback();
        }

        sccVM.enableEPCopy(false);
        var ep = selectedCard.ePatterns()[0];
        ep.pattern._currentActivity = 'epa';
        var params = {
            data: selectedCard.sc(),
            newName: newName,
            existingPattern:ep,
            repo: mainVM.repo,
            type: mainVM.currBCDef().bctype,
            parentId: sccVM.businessConceptInstance.id
        };
        epIntegration.copyEPToNewVersion(params, mainVM.bcAuthVM, function (err, result) {
            if (err) {
                console.error('error cloning ep %o', err);
                return callback(err);
            }
            sccVM.enableEPCopy(true);


            //result = {sc: object, ep: object}

            //update the BC with the new Campaign, invalidate the Program in the background


            //TODO: prepare the widget and insert it

            // sccVM._appendToCampaignList(result.sc);

            // callback(err, result);

            //

            var currentStage = sccVM.stages()[0].name;



            //var epId = result.ep[0].id;



            sccVM.handleChosenTouchpoints(result.sc, function(tpList) {
                //no reports on widget so no point in trying to retrieve them now
                // sccVM.retrieveEPWidgetReports({bcInstanceId:sccVM.businessConceptInstance.id,epId:epId}, function (err, widgetReport) {
                //
                //
                //
                // });_

                var widgetReport = [];
                var card = new dexit.app.ice.EPCardVM({
                    // sc: {
                    //     id: result.sc.id,
                    //     property: result.sc.property,
                    //     touchpoints: sccVM.tpm()
                    // },
                    sc: result.sc,
                    parentVM: sccVM,
                    container: sccVM.businessConceptInstance,
                    mainVM: mainVM,
                    name: newName,
                    ePatterns: result.ep,
                    isPatternActive: false,
                    widgetReport: widgetReport,
                    chosenTPs: tpList,
                    currentStage:  currentStage,
                    wf: sccVM.stages()
                });

                card.setCreativeBrief(sccVM.creativeBriefLink());
                sccVM.tempCards.push(card);
                sccVM.addCardsIntoStages(card);

                //
                // sccVM.widgets.unshift(
                //     new dexit.app.ice.edu.EPWidgetVM({
                //         sc: data,
                //         container: sccVM.businessConceptInstance,
                //         mainVM: mainVM,
                //         ePatterns: res,
                //         widgetReport: widgetReport,
                //         chosenTPs: tpList
                //     }));
                sccVM.selectedCard(card);
                mainVM.selectedWidget(card);

                sccVM._appendToCampaignList(result.sc);


                sccVM.hideLoader();

                callback(null,result);
            });






            // sccVM.init({currentPortal: mainVM.currPortal(), partialReloadBCi:true, reloadParam: result.sc  }, function() {
            //     console.log('done');
            //
            //     //sccVM.hideLoader();
            //
            //     callback(err,result);
            //
            // });


            // sccVM._appendToCampaignList(result);
            // sccVM.init({currentPortal: mainVM.currPortal(), partialReloadBCi:true, }, function() {
            //     console.log('done');
            //     sccVM.hideLoader();
            // })


        });

    };


    sccVM._appendToCampaignList = function(SCToAdd, callback) {

        var cb = callback || noOp;
        var existingSC = (sccVM.businessConceptInstance.smartcontentobject ? sccVM.businessConceptInstance.smartcontentobject : []);
        existingSC.push(SCToAdd);

        //invalid cache for program to make sure this shows up in the list next time
        var bciId = sccVM.businessConceptInstance.id;
        var bcName = mainVM.currBCType();

        dexit.app.ice.integration.bcp.invalidateCacheForBCInstance({
            type: bcName,
            id: bciId
        }, function () {
            cb();
        });
    };

    /**
     *
     * @param card
     * @param additionalParams
     */
    sccVM.addAdditionalParamsToCampaignCard = function(card, additionalParams) {
        if (additionalParams && card) {
            if (additionalParams.start_date || additionalParams.end_date) {
                card.updateSchedule(additionalParams.start_date, additionalParams.end_date);
            }
            setTimeout(function(){
                if (additionalParams.cmsConfiguration) {
                    card.setCmsConfiguration(additionalParams.cmsConfiguration);
                }
            }, 500);

            setTimeout(function () {
                if (additionalParams.mmIcon || additionalParams.iconText) {
                    var icon = additionalParams.mmIcon || '';
                    var iconText = additionalParams.iconText || '';
                    card.setIcon(icon, iconText);
                }
            }, 400);


        }
    }

    sccVM.addAdditionalParamsToCampaign = function(args, additionalParams) {

        var card = ko.utils.arrayFirst(sccVM.tempCards(), function (card) {
            return (card.sc() && card.sc().id && card.sc().id === args.scId);
        });

        if (card && additionalParams) {
            sccVM.addAdditionalParamsToCampaignCard(card, additionalParams);
        }
        //F
    };

    sccVM.deleteSelectedCampaign = function(args, callback) {


        var card = ko.utils.arrayFirst(sccVM.tempCards(), function (card) {
            return (card.sc() && card.sc().id && card.sc().id === args.scId);
        });
        if (card) {
            sccVM.selectedCard(card);
            sccVM.deleteEP();

        }
        callback();
        // _.each(sccVM.stageVMs(), function(stageVM){
        //     stageVM.cards.each(function(card){
        //     //     return (card.id === id);
        //         var scId = card.sc().id;
        //
        //     });
        // });
        // if (foundCard) {
        //
        //     //set selectedCard
        //     sccVM.deleteEP();
        //
        // }

    };


    sccVM.deleteEP = function() {

        sccVM.deleteEPModalVisible(false);
        var scId = sccVM.selectedCard().sc().id;
        var id = sccVM.selectedCard().id;
        sccVM.mainVM.deleteWidget(sccVM.selectedCard(),sccVM);

        sccVM.tempCards.remove(function(card){
            return (card.id === id);
        });

        _.each(sccVM.stageVMs(), function(stageVM){
            stageVM.cards.remove(function(card){
                return (card.id === id);
            });
        });

        //remove EP from smartcontentObject
        var containerElement = sccVM.businessConceptInstance;

        var scs = (containerElement.smartcontentobject && containerElement.smartcontentobject.length > 0 ? containerElement.smartcontentobject : []);

        var removedSCs = _.reject(scs, function (item) {
            return (item.id === scId);
        });

        sccVM.businessConceptInstance.smartcontentobject = removedSCs;


        //invalidate cache
        var bciId = sccVM.businessConceptInstance.id;
        var bcName = mainVM.currBCType();
        dexit.app.ice.integration.bcp.invalidateCacheForBCInstance({
            type: bcName,
            id: bciId
        }, function () {
        });



        //sccVM.mainVM$root.deleteWidget.bind('', $data, $root.selectedCourse().courseVM)
    };

    /**
     * Creates a new empty EP and card for it
     * @param {string} name
     * @param {string} bcTypeValue
     * @param {object} additionalParams
     * @param {string} [additionalParams.start_date]
     * @param {string} [additionalParams.end_date]
     * @param {string} [additionalParams.cmsConfiguration]
     * @param {string} [additionalParams.mmIcon]
     * @param callback - returns (err, {sc: data, ep: res} )
     */
    sccVM.creatingNewWidgetEmpty = function(name, bcTypeValue, additionalParams, callback) {
        var type = bcTypeValue || sccVM.bcName;
        mainVM.bcAuthVM.propertyTextValue([name]);
        var touchpoints = [];
        var emptyEP = new joint.dia.Graph();
        var emptyEPObj= {cells:[]};
        var theName = mainVM.bcAuthVM.propertyTextValue()[0] || '';
        var params_create = {
            repo: mainVM.repo,
            sctype: mainVM.currBCDef().sctype,
            type: type,
            property: {
                name: theName,
                type: type,
                mainScId: sccVM.businessConceptInstance.id,
                epObject: dexit.epm.epa.integration.graphObjToJSON(emptyEP),  //serialize kouckout EP object and save as JSON in SC object's property
                decObject: null,
                referredIntelligence: null
            }
        };


        // //save decision object
        // if (dpa_VM.decisionElements().length > 0) {
        //     params_create.property.decObject = ko.toJSON(dpa_VM.decisionElements());
        // }
        //TODO: remove when intelligence is same as another element
        if (dpa_VM.referredIntelligence()){
            params_create.property.referredIntelligence = ko.toJSON(dpa_VM.referredIntelligence());
        }
        dexit.app.ice.integration.bcp.createBCInstance(params_create, function(err, res) {
            if (err) {
                console.error('Cannot create content');
                callback('could not create content');
            } else {
                var params_retrieve = {
                    type: type,
                    id: res.id
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(params_retrieve, function(err, data) {
                    if (err) {
                        console.error('Cannot retrieve content: ' + res.id);
                        callback('could not create content');
                    } else {
                        var property = data.property;

                        // // insert some logic here to make user have the ability to select TPs.
                        // _.each(sccVM.chosenTouchpoints(), function(element) {
                        //     touchpoints.push(element.tpId);
                        // });
                        // store touchpoints id to SC so they can be retrieved when needed.
                        property.touchpoints = touchpoints;
                        dexit.scm.dcm.integration.sc.updateSC(mainVM.repo, data.id, property, function(err){
                            if(err){
                                console.error('fail to store touchpoints to SC' + err);
                            }else{
                                var allTPs = [];
                                sccVM.retrieveTouchpointsDetailsOfBCi(data, function(tpsFromsc) {
                                    allTPs = _.union(sccVM.tpm(), tpsFromsc);
                                    sccVM.alltps(_.uniqBy(allTPs, 'tpId'));
                                });
                            }
                        });

                        //TODO: remove creation of title as part of pattern when schedule for facebook/twitter is retired
                        mainVM.bcAuthVM.createPropertyAsMM(data, function() {
                            var epUItype = 'jointJS';
                            var epUIObject =  emptyEP.toJSON();
                            var tps = touchpoints;

                            //prepare object expected
                            var touchpointsAndLayouts = _.map(tps, function (tpId) {
                                return {touchpoint: tpId, layout: { }, tpParams: { 'allImplictEpts': true}};
                            });

                            var params = {
                                repo: mainVM.repo,
                                data: data, //not currently used,

                                //only need the id in array
                                touchpoints: tps,
                                operation: 'create',
                                epStructure:{
                                    // new UI structure
                                    type: epUItype,
                                    epUIStructure: epUIObject,
                                    // decisionElements: dpa_VM.decisionElements(),
                                    intelligenceElements: []
                                },
                                mainScId: sccVM.businessConceptInstance.id,
                                touchpointsAndLayouts: touchpointsAndLayouts

                            };

                            epIntegration.generateEP(params, bcAuthVM, function(err,ep) {
                                if (err || !ep) {
                                    //do not continue if a problem
                                    //should consolidate and clean-up createBCInstance
                                    return callback(new Error('problem creating EP'));
                                }

                                dexit.app.ice.integration.scm.assignToContainer(mainVM.repo, data.id, sccVM.businessConceptInstance.id, function(response, err) {
                                    dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(mainVM.repo, data.id, function(err, res) {
                                        if (err) {
                                            console.error('Cannot retrieve engagement pattern');
                                        } else if (res && res.length > 0) {
                                            //var currWidgetReportDef = mainVM.getReportRelationship(sccVM.businessConceptInstance, mainVM.currSubBCType());
                                            sccVM.handleChosenTouchpoints(data, function(tpList) {
                                                //skip data on new widget since nothing will be in it yet
                                                var epId = null;
                                                sccVM.retrieveEPWidgetReports({bcInstanceId:sccVM.businessConceptInstance.id,epId:epId}, function (err, widgetReport) {
                                                    if (err) {
                                                        //ignore
                                                        widgetReport = [];
                                                    }
                                                    var card= new dexit.app.ice.EPCardVM({
                                                        sc: data,
                                                        parentVM: sccVM,
                                                        container: sccVM.businessConceptInstance,
                                                        mainVM: mainVM,
                                                        name: data.property.name,
                                                        ePatterns: res,
                                                        widgetReport: widgetReport,
                                                        chosenTPs: tpList,
                                                        // currentStage:  currentStage,
                                                        wf: sccVM.stages()
                                                    });
                                                    card.setCreativeBrief(sccVM.creativeBriefLink());
                                                    sccVM.tempCards.push(card);
                                                    sccVM.addCardsIntoStages(card);

                                                    //
                                                    // sccVM.widgets.unshift(
                                                    //     new dexit.app.ice.edu.EPWidgetVM({
                                                    //         sc: data,
                                                    //         container: sccVM.businessConceptInstance,
                                                    //         mainVM: mainVM,
                                                    //         ePatterns: res,
                                                    //         widgetReport: widgetReport,
                                                    //         chosenTPs: tpList
                                                    //     }));
                                                    sccVM.selectedCard(card);
                                                    mainVM.selectedWidget(card);


                                                    sccVM.addAdditionalParamsToCampaignCard(card, additionalParams);


                                                    //For this one (since externally called, add invalidation)

                                                    sccVM._appendToCampaignList(data);


                                                    callback(null, {sc: data, ep: res});
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            }
        });
    };

    /**
     * TODO: just create EP instead of BC holding
     * @param {string} [typeValue=sccVM.bcName] - bc type name
     * @param callback
     */
    sccVM.creatingNewWidget = function(bcTypeValue, callback) {
        var type = bcTypeValue || sccVM.bcName;
        var theName = mainVM.bcAuthVM.propertyTextValue()[0] || '';
        var params_create = {
            repo: mainVM.repo,
            sctype: mainVM.currBCDef().sctype,
            type: type,
            property: {
                name: theName,
                type: type,
                mainScId: sccVM.businessConceptInstance.id,
                epObject: dexit.epm.epa.integration.graphToJSON(), //serialize kouckout EP object and save as JSON in SC object's property
                decObject: null,
                referredIntelligence: null
            }
        };
        // //save decision object
        // if (dpa_VM.decisionElements().length > 0) {
        //     params_create.property.decObject = ko.toJSON(dpa_VM.decisionElements());
        // }
        //TODO: remove when intelligence is same as another element
        if (dpa_VM.referredIntelligence()){
            params_create.property.referredIntelligence = ko.toJSON(dpa_VM.referredIntelligence());
        }
        dexit.app.ice.integration.bcp.createBCInstance(params_create, function(err, res) {
            if (err) {
                console.error('Cannot create content');
                callback('could not create content');
            } else {
                var params_retrieve = {
                    type: type,
                    id: res.id
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(params_retrieve, function(err, data) {
                    if (err) {
                        console.error('Cannot retrieve content: ' + res.id);
                        callback('could not create content');
                    } else {
                        var property = data.property;

                        var touchpoints = dpa_VM.selectedTouchpoints();

                        // // insert some logic here to make user have the ability to select TPs.
                        // _.each(sccVM.chosenTouchpoints(), function(element) {
                        //     touchpoints.push(element.tpId);
                        // });
                        // store touchpoints id to SC so they can be retrieved when needed.
                        property.touchpoints = touchpoints;
                        dexit.scm.dcm.integration.sc.updateSC(mainVM.repo, data.id, property, function(err){
                            if(err){
                                console.error('fail to store touchpoints to SC' + err);
                            }else{
                                var allTPs = [];
                                sccVM.retrieveTouchpointsDetailsOfBCi(data, function(tpsFromsc) {
                                    allTPs = _.union(sccVM.tpm(), tpsFromsc);
                                    sccVM.alltps(_.uniqBy(allTPs, 'tpId'));
                                });
                            }
                        });

                        //TODO: remove creation of title as part of pattern when schedule for facebook/twitter is retired
                        mainVM.bcAuthVM.createPropertyAsMM(data, function() {
                            var epUItype = 'jointJS';
                            var epUIObject = dexit.epm.epa.integration.graph.toJSON();
                            var tps = dpa_VM.selectedTouchpoints();

                            //prepare object expected
                            var touchpointsAndLayouts = _.map(tps, function (tpId) {
                                return {touchpoint: tpId, layout: { }, tpParams: { 'allImplictEpts': true}};
                            });

                            var params = {
                                repo: mainVM.repo,
                                data: data, //not currently used,

                                //only need the id in array
                                touchpoints: tps,
                                operation: 'create',
                                epStructure:{
                                    // new UI structure
                                    type: epUItype,
                                    epUIStructure: epUIObject,
                                    // decisionElements: dpa_VM.decisionElements(),
                                    intelligenceElements: dpa_VM.referredIntelligence()
                                },
                                mainScId: sccVM.businessConceptInstance.id,
                                touchpointsAndLayouts: touchpointsAndLayouts

                            };

                            epIntegration.generateEP(params, bcAuthVM, function(err,ep) {
                                if (err || !ep) {
                                    //do not continue if a problem
                                    //should consolidate and clean-up createBCInstance
                                    return callback(new Error('problem creating EP'));
                                }

                                dexit.app.ice.integration.scm.assignToContainer(mainVM.repo, data.id, sccVM.businessConceptInstance.id, function(response, err) {
                                    dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(mainVM.repo, data.id, function(err, res) {
                                        if (err) {
                                            console.error('Cannot retrieve engagement pattern');
                                        } else if (res && res.length > 0) {
                                            //var currWidgetReportDef = mainVM.getReportRelationship(sccVM.businessConceptInstance, mainVM.currSubBCType());
                                            sccVM.handleChosenTouchpoints(data, function(tpList) {
                                                //skip data on new widget since nothing will be in it yet
                                                var epId = null;
                                                sccVM.retrieveEPWidgetReports({bcInstanceId:sccVM.businessConceptInstance.id,epId:epId}, function (err, widgetReport) {
                                                    if (err) {
                                                        //ignore
                                                        widgetReport = [];
                                                    }
                                                    var card= new dexit.app.ice.EPCardVM({
                                                        sc: data,
                                                        parentVM: sccVM,
                                                        container: sccVM.businessConceptInstance,
                                                        mainVM: mainVM,
                                                        name: data.property.name,
                                                        ePatterns: res,
                                                        widgetReport: widgetReport,
                                                        chosenTPs: tpList,
                                                        // currentStage:  currentStage,
                                                        wf: sccVM.stages()
                                                    });
                                                    card.setCreativeBrief(sccVM.creativeBriefLink());
                                                    sccVM.tempCards.push(card);
                                                    sccVM.addCardsIntoStages(card);

                                                    //
                                                    // sccVM.widgets.unshift(
                                                    //     new dexit.app.ice.edu.EPWidgetVM({
                                                    //         sc: data,
                                                    //         container: sccVM.businessConceptInstance,
                                                    //         mainVM: mainVM,
                                                    //         ePatterns: res,
                                                    //         widgetReport: widgetReport,
                                                    //         chosenTPs: tpList
                                                    //     }));
                                                    sccVM.selectedCard(card);
                                                    mainVM.selectedWidget(card);

                                                    callback(null, {sc: data, ep: res});
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            }
        });
    };

    sccVM.setOOEditable = function() {
        sccVM.editOfficeHours(true);
        var $officeHours = $('.office-hours-text');
        $officeHours.attr('contenteditable', true).focus();
        $officeHours.addClass('editing');
    };

    sccVM.cancelOOEditable = function() {
        sccVM.editOfficeHours(false);
        var $officeHours = $('.office-hours-text');
        $officeHours.attr('contenteditable', false).blur();
        $officeHours.text(sccVM.officeHoursValue());
        $officeHours.removeClass('editing');
    };

    /**
     saveOfficeHours takes text entered in the Office Hours field, checks if it's empty, and either
     uses the string as the office hours or, if it's empty, sets a generic message.
     */

    sccVM.saveOfficeHours = function(data) {
        var officeHoursText = $('.office-hours-text'), newHours;

        newHours = (officeHoursText.text().length === 0) ? null : officeHoursText.text();

        officeHoursText.attr('contenteditable', false).blur();
        officeHoursText.removeClass('editing');

        function handleUpdateContainer(err) {
            sccVM.editOfficeHours(false);
            if (err) {
                console.log('Could not update container');
            }
            else {
                if (newHours === null) {
                    officeHoursText.text('Click on edit icon to add hours');
                } else {
                    sccVM.officeHoursValue(newHours);
                    officeHoursText.text(newHours);
                }
            }
        }

        var updateProperty = {
            'version': sccVM.version(),
            'propertyData': [{'officehours': newHours}]
        };

        dexit.app.ice.edu.integration.courseManagement.updateProperty(sccVM.businessConceptInstance.id, updateProperty, handleUpdateContainer);
    };

    sccVM.cancelChangingOfficeHours = function() {
        sccVM.editOfficeHours(false);
    };

    sccVM.setCDEditable = function() {
        sccVM.editCourseDescription(true);
        var $descriptionText = $('.course-description-text');
        $descriptionText.attr('contenteditable', true).focus();
        $descriptionText.addClass('editing');
    };

    sccVM.cancelCDEditable = function() {
        sccVM.editCourseDescription(false);
        var $descriptionText = $('.course-description-text');
        $descriptionText.attr('contenteditable', false).blur();
        $descriptionText.text(sccVM.courseDescriptionValue());
        $descriptionText.removeClass('editing');
    };

    /**
     saveCourseDescription takes text entered in the Course Descriptoin field, checks if it's empty, and either
     uses the string as the course description or, if it's empty, sets a generic message as the description.
     */

    sccVM.saveCourseDescription = function(data) {
        var courseDescription = $('.course-description-text'), newText;

        newText = (courseDescription.text().length === 0) ? null : courseDescription.text();

        courseDescription.attr('contenteditable', false).blur();
        courseDescription.removeClass('editing');

        function handleUpdateContainer(err) {
            sccVM.editCourseDescription(false);
            if (err) {
                console.log('Could not update container');
            }
            else {
                if (newText === null) {
                    courseDescription.text('Click on edit icon to add a course description.');
                } else {
                    sccVM.courseDescriptionValue(newText);
                    $('.course-description-text').removeClass('editing');
                    courseDescription.text(newText);
                }
            }
        }

        var updateProperty = {
            'version': sccVM.version(),
            'propertyData': [{'description': newText}]
        };
        dexit.app.ice.edu.integration.courseManagement.updateProperty(sccVM.businessConceptInstance.id, updateProperty, handleUpdateContainer);

    };



    sccVM.showEPABoard = function(operation) {
        mainVM.showSmallSidebar();
        mainVM.createEngagementPlan(true);
        sccVM.epAuthoringState('pattern');
        var intelligence = (sccVM.businessConceptInstance && sccVM.businessConceptInstance.intelligence ? sccVM.businessConceptInstance.intelligence : []);

        if (ko.utils.unwrapObservable(mainVM.currBCType) === 'Store') {
            dpa_VM.showCampaignSelection(true);
        }else {
            dpa_VM.showCampaignSelection(false);
        }

        var mmTag = sccVM.mmTag();



        dpa_VM.init({mmTag: mmTag, currentOperation: operation,touchpoints: sccVM.alltps(), callingVM: sccVM, intelligence:intelligence});




    };


    /**
     *
     *  TODO: clean-up jquery mess in VM
     * @param {string} mode - action coming from UI (ie: 'create')
     * @param data
     * @param {boolean} [sendForApproval]
     */
    sccVM.createOrEditPattern = function(mode, data, sendForApproval) {

        //mark approved
        function moveToApproval(card) {
            card.perform('done');
        }


        if (dpa_VM.validation.validateGraph() !== true) {
            alert('You must fill in a valid pattern including: setting up eServices and Business Rules');
            return;
        }


        var bcName = mainVM.currBCDef().bctype;

        if (mode === 'create') {
            $('.widget-preloader').removeClass('hidden');

            sccVM.creatingNewWidget(bcName, function(err, result) {
                if (err) {
                    console.log('could not create widget');
                    // TODO => add a warning message to UI here


                    $('.widget-preloader-text').text('Could not create card. Please contact administration.');
                    $('.clear-error-message').removeClass('hidden');

                } else {
                    $('.hideMedia, .add-text-display').addClass('areaHidden');
                    $('.widget-preloader').addClass('hidden');
                    $('.clear-error-message').addClass('hidden');
                    $('.courses-loading').remove();
                    $('#lecturePanels').removeClass('initial-hide');
                    mainVM.closeEngagementPlanCreate();


                    if (sendForApproval) {
                        var card = mainVM.selectedWidget();
                        moveToApproval(card);
                    }



                    sccVM._appendToCampaignList(result.sc);
                    sccVM.hideLoader();

                    //
                    // sccVM.init({currentPortal: mainVM.currPortal(), partialReloadBCi:true, reloadParam: result  }, function() {
                    //     console.log('done');
                    //
                    //     sccVM.hideLoader();
                    //
                    // });


                }
            });
        } else if (mode === 'edit') {


            //TODO: there is an issue with consistency between selectedCard and selectedWidget, selectedWidget is usually correct here
            // if (sccVM.selectedCard().id !== mainVM.selectedWidget().id) {
            //     sccVM.selectedCard(mainVM.selectedWidget());
            // }
            sccVM.selectedCard(mainVM.selectedWidget());


            var oldCard = ( ko.utils.unwrapObservable(sccVM.selectedCard) ? ko.utils.unwrapObservable(sccVM.selectedCard) :  ko.utils.unwrapObservable(mainVM.selectedWidget));


            $('.widget-preloader').removeClass('hidden');
            mainVM.bcAuthVM.editBCElements(data, mainVM.selectedWidget(), function(err, updatedCard) {
                if (err) {
                    $('.widget-preloader-text').text('Could not update card. Please contact administration.');
                    $('.clear-error-message').removeClass('hidden');
                } else {
                    $('.hideMedia, .add-text-dispaly').addClass('areaHidden');
                    $('.createLectureModal').modal('hide');
                    $('.widget-preloader').addClass('hidden');
                    $('.clear-error-message').addClass('hidden');
                    mainVM.closeEngagementPlanCreate();

                    var oldScId = (oldCard.sc().id);
                    var oldEp = (oldCard.ePatterns() && oldCard.ePatterns().length ? oldCard.ePatterns()[0] : null);

                    var newScId = updatedCard.sc().id;
                    var newEp = (updatedCard.ePatterns() && updatedCard.ePatterns().length ? updatedCard.ePatterns()[0] : null);


                    //FIXME: do not delete and remake the SC everything


                    //also update the ppObject with the updated scId, epId, and epRevision;
                    // var obj = sccVM.businessConceptInstance.property.ppObject;
                    // if (_.isString(obj)) {
                    //     obj = campaignPlannerVm.parsePPObjectSafely(obj);
                    //     if (obj instanceof Error) {
                    //         alert('cannot update plan');
                    //     }
                    //     _.each(obj.cells, function(cell) {
                    //         if (cell.definition && cell.definition.approved && cell.definition.epId == oldEp.id && cell.definition.epRevision == oldEp.epRevision) {
                    //             //update the scId and epId and epRevision
                    //             cell.definition.epId = newEp.id;
                    //             cell.definition.epRevision = newEp.revision;
                    //             cell.definition.scId = newScId;
                    //         }
                    //     });
                    //
                    //
                    //
                    // }
                    //update the bc and invalidate the cache

                    //copy over any old configurations from the old card
                    if (oldCard.scheduleSet()){
                        if (oldCard.scheduleVM.scheduleSDT()) {

                            if (!_.isString(oldCard.scheduleVM.scheduleSDT())) {

                                var startDate = oldCard.scheduleVM.scheduleSDT().toISOString();
                            }else {
                                var startDate = oldCard.scheduleVM.scheduleSDT();
                            }
                        }
                        if (oldCard.scheduleVM.scheduleEDT()) {
                            if (!_.isString(oldCard.scheduleVM.scheduleEDT())) {
                                var endDate = oldCard.scheduleVM.scheduleEDT().toISOString();
                            }else {
                                var endDate = oldCard.scheduleVM.scheduleEDT();
                            }
                        }
                        updatedCard.updateSchedule(startDate, endDate);
                    }
                    setTimeout(function(){
                        if (oldCard.cmsConfiguration()) {
                            updatedCard.setCmsConfiguration(oldCard.cmsConfiguration());
                        }

                        // setTimeout(function() {
                        //     if (oldCard.getPatternEndingConfiguration()) {
                        //         updatedCard.setPatternEndingConfiguration(oldCard.getPatternEndingConfiguration());
                        //     }
                        // }, 500);
                    }, 500);




                    //update card in tempCard and stages;
                    mainVM.selectedWidget(updatedCard);
                    sccVM.selectedCard(updatedCard);

                    var oldLocation = ko.utils.arrayFirst(sccVM.tempCards(), function (item) {
                        return (item.id === updatedCard.id);
                    });

                    sccVM.tempCards.replace(oldLocation, updatedCard);

                    //update card in stage it is present
                    _.each(sccVM.stageVMs(), function (stageVM) {
                        var match = ko.utils.arrayFirst(stageVM.cards(), function(stageCard) {
                            return (stageCard.id === updatedCard.id);
                        });
                        if (match) {
                            stageVM.cards.replace(match,updatedCard);
                        }
                    });

                    if (sendForApproval) {
                        moveToApproval(updatedCard);
                    }

                }

            });
        } else {
            //TODO:does anything even reach here?

            // if (self.selectedWidget()) {
            //     var widget = self.selectedWidget();
            //     widget.perform('done');
            // }
            mainVM.closeEngagementPlanCreate();
        }

    };


    sccVM.updatePatternWithRegions = function() {

        storyboard_VM.save(function (err, updatedEP) {
            if (err) {
                //TODO:should handle error
            }else {
                //update selected widget's reference for pattern
                sccVM.mainVM.selectedWidget().ePatterns([updatedEP]);
            }
            storyboard_VM.hideEditView();
        });
    };


    sccVM.configureEnd = function(data) {
        debugger;

        //get all the ep elements

        var cells = dpa_VM.graph.getCells();
        var elements =
            _.chain(cells)
                .filter(function (cell) {
                    return (cell.attributes && cell.attributes.type === 'epa.HTMLElement');
                })
                .map(function (cell) {
                    debugger;
                    var name = cell.id;
                    if (cell.attributes.elementType === 'multimedia') {
                        name = cell.attributes.multiMediaList()[0].label();
                        if (!name) {
                            var val = cell.attributes.multiMediaList()[0].value();
                            name = val.substring(val.lastIndexOf('/') +1);
                        }
                    } else if (cell.attributes.elementType === 'behaviour') {
                        name = cell.attributes.behRef.renderText;
                    } else if (cell.attributes.elementType === 'intelligence') {
                        if (cell.attributes.subType && cell.attributes.subType === 'engagement-pattern') {
                            name = cell.attributes.name;
                        } else if (cell.attributes.subType && cell.attributes.subType === 'dynamic-ept') {
                            name = cell.attributes.name;
                        } else {
                            console.log('unhandled case:' + cell.id);
                            debugger;
                        }
                    }
                    return {
                        id: cell.id,
                        name: name
                    };
                }).value();
        sccVM.availableElements(elements);


        var selected = sccVM.mainVM.selectedWidget();
        var existingConfig = selected.getPatternEndingConfiguration();
        if (existingConfig) {
            var selectedConfig = _.find(sccVM.availableEndingCondition() , {id: existingConfig.endId })
            sccVM.selectedEndingCondition(selectedConfig);
            if (selectedConfig === 'element_done_path') {
                var id = (selectedConfig.params && selectedConfig.params.id ? selectedConfig.params.id: '');
                var selectedEndingConditionOption = _.find(sccVM.availableElements(), {id: id});
                sccVM.selectedEndingConditionOption(selectedEndingConditionOption);
            }
        }

        //     //find potential obstacles (all except current element)
        //     var obstacles = _.filter(cells, function (elem) {
        //         return (elem.id !== cell.id && elem.type === 'epa.HTMLElement');
        //     });


        sccVM.configureEndModalVisible(true);
        //show configuration modal
    };
    sccVM.availableElements = ko.observableArray([]);

    sccVM.selectedEndingConditionOption = ko.observableArray();
    sccVM.availableEndingCondition = ko.observableArray([
        {
            id: 'and_path',
            name: 'All Done (default)',
            description: 'All Paths are completed'
        },
        {
            id: 'element_done_path',
            name: 'Element Done',
            description: 'Specific Path is done connected to the end'
        }
        // {
        //     id: 'element_done_path',
        //     name: 'Element Done',
        //     description: 'Specific Path is done connected to the end'
        // },

    ]);
    sccVM.selectedEndingCondition = ko.observable();
    sccVM.pendingEndingCondition = ko.observable();


    sccVM.saveConfigureEnd = function() {
        debugger;


        var selectedEndingType = (sccVM.selectedEndingCondition() && sccVM.selectedEndingCondition().id);


        if (selectedEndingType && selectedEndingType === 'element_done_path') {
            var selectedEndingConditionOption = sccVM.selectedEndingConditionOption();

        }else {
            //nothing to do as this is the default
        }

        //find the widget and
        var selected = sccVM.mainVM.selectedWidget();
        var params = (selectedEndingConditionOption ?  {id: selectedEndingConditionOption.id } : {});
        selected.setPatternEndingConfiguration({
            endId: selectedEndingType || 'and_path', //default
            params:params
        });
        //
        sccVM.configureEndModalVisible(false);

        //add the selectedEndingCondition to the EP

    };
    sccVM.configureEndModalVisible = ko.observable(false);

    /**
     * Show preview (non-editable) of EP based on UI object
     * Should be called only when container (div with class pattern-preview) is visible
     * @param {object} args
     */
    sccVM.instantiatePatternThumbnail = function(args) {
        // show thumbnail view of the pattern during storyboard creation
        if (dexit.epm.epa.integration.graph) {
            dexit.epm.epa.integration.graph.clear();
        }else {
            dexit.epm.epa.integration.graph = new joint.dia.Graph();
        }

        var graph = dexit.epm.epa.integration.graph;

        // dpa_VM.patternPaper = new joint.dia.Paper({
        //     el: $('.pattern-preview'),
        //     width: $('.pattern-preview').width(),
        //     height: $('.pattern-preview').height(),
        //     gridSize: 1,
        //     model: graph,
        //     // mark interactive as false
        //     interactive : false
        // });
        // //make sure custom shapes are available
        // dexit.epm.epa.integration.prepareShapes();
        // //load
        // dexit.epm.epa.integration.loadEPUIObject(args.epObject);

    };

    //TODO: move here from mainVM
    // /**
    //  * Wraps calling storyboard storyboard_VM
    //  * TODO: check, do not think this is being run
    //  * @param {object} args
    //  * @param {string} args.scId
    //  * @param {string} args.epId - engagement pattern identifier
    //  * @param {object} args.epObject - ep UI object passed in from EPA
    //  * @param {object} args.repo - repository
    //  * @param callback
    //  */
    // sccVM.instantiateStoryView = function(args, callback) {
    //     callback = callback || noOp;
    //
    //     //grab icon for tp to pass in
    //     // var tpId = args.touchpoint;
    //     args.tps = _.map(sccVM.tpm(), function(tp) {
    //         var icon = mainVM.touchpointTypes()[tp.channelType].icon;
    //         tp.icon = icon;
    //         return tp;
    //     });
    //
    //     // initialize the storyboard API
    //     storyboard_VM.init(args, function(err) {
    //         if (err) {
    //             console.log('problem loading content design');
    //             //TODO: handle error, pass back above this for handling what to show to user
    //             return callback(err);
    //         }
    //         //show view
    //         sccVM.epAuthoringState('story');
    //
    //         //load thumbnail view
    //         sccVM.instantiatePatternThumbnail(args);
    //         callback();
    //     });
    //
    //
    //     //
    //     $('.widget-preloader').addClass('hidden');
    //     $('.clear-error-message').addClass('hidden');
    //     $('.courses-loading').remove();
    // };


    /**
     *
     * @param {boolean} approved - if approved true
     * @param {string} [message] - optional message - TODO
     */
    sccVM.approveStep = function(approved, message) {

        var approval = (approved && approved === true ? true : false);

        var epWidget  = mainVM.selectedWidget();
        epWidget.approval(approval);
        epWidget.perform('done');

        //hide loader as it shows here
        sccVM.hideLoader();

        //For CD
        mainVM.closeEngagementPlanCreate();
        mainVM.bcAuthVM.clearFields();

    };
};
