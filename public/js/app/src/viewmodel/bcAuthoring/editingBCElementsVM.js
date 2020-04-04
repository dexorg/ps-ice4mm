/**
 * Copyright Digital Engagement Xperiance
 * Date: 11/12/15
 * @author Ali Hussain
 * @description This function focus on updating elements of the BC (currently SC).
 */

dexit.app.ice.edu.bcAuthoring.EditingBCElementsVM = function (args) {
    var bcAuthVM = args.bcAuthVM;
    var mainVM = args.mainVM;

    //Edit functionality is mainly removes all aspects of the content, then create new ones, and update the engagement pattern

    /**
     *
     * @param data
     * @param {dexit.app.ice.EPCardVM} selectedCard
     * @param callback
     */
    bcAuthVM.editBCElements = function(data, selectedCard, callback) {
        var selectedSC = mainVM.selectedSC();
        //if this is a revision, then try to preserve the allocations already done
        var originalScData = selectedCard.sc();
        var allTPs = [];
        var tps = dpa_VM.selectedTouchpoints() || [];

        var originalEPData = (selectedCard.ePatterns() && selectedCard.ePatterns().length > 0 ? selectedCard.ePatterns()[0] : null);

        var originalEPAllocations = (originalEPData && originalEPData.pattern && originalEPData.pattern.tp ? originalEPData.pattern.tp : []);


        var originalEndConfiguration = (selectedCard.getPatternEndingConfiguration() || null);

        //better way? figure out diff of changes, then apply


        bcAuthVM._deleteBCElements(selectedSC, function() {
            var property = selectedSC.property;
            property.name = bcAuthVM.propertyTextValue()[0];
            //set update EP object into property as well
            property.epObject = dexit.epm.epa.integration.graphToJSON();
            property.touchpoints = dpa_VM.selectedTouchpoints();
            // if(dpa_VM.decisionElements().length > 0){
            //     property.decObject = ko.toJSON(dpa_VM.decisionElements());
            // }
            if(dpa_VM.referredIntelligence().length > 0){
                property.referredIntelligence = ko.toJSON(dpa_VM.referredIntelligence());
            }
            dexit.scm.dcm.integration.sc.updateSC(mainVM.repo, selectedSC.id, property, function(err, res){
                if(err){
                    console.error('error when update SC' + err);
                    callback(new Error('could not update EngPlan'));
                }else{
                    dexit.scm.dcm.integration.sc.retrieveSC(mainVM.repo, selectedSC.id, function(err, data){
                        if(err){
                            console.error('error when retrieve SC' + err);
                            callback(new Error('could not retrieve EngPlan'));
                        }else{
                            var isTPAdded;
                            if(data.property.touchpoints && data.property.touchpoints.length > 0){
                                isTPAdded = true;
                            }else{
                                isTPAdded = false;
                            }
                            mainVM.selectedCourse().courseVM.retrieveTouchpointsDetailsOfBCi(originalScData,function(tpsFromSC) {
                                allTPs = _.union(mainVM.selectedCourse().courseVM.tpm(), tpsFromSC);
                                mainVM.selectedCourse().courseVM.alltps(_.uniqBy(allTPs, 'tpId'));
                                console.log(mainVM.selectedCourse().courseVM.alltps());
                            });
                            bcAuthVM.createPropertyAsMM(selectedSC, function() {
                                var epUItype = 'jointJS';
                                //prepare object expected
                                var touchpointsAndLayouts = _.map(tps, function (tpId) {
                                    return {touchpoint: tpId, layout: { }, tpParams: { 'allImplictEpts': true}};
                                });
                                if (originalEPAllocations && originalEPAllocations.length > 0) {
                                    touchpointsAndLayouts = _.filter(originalEPAllocations, function (val) {
                                        return (val && val.touchpoint && tps.indexOf(val.touchpoint) !== -1);
                                    });
                                }



                                var params = {
                                    repo: mainVM.repo,
                                    data: data,
                                    touchpoints: tps,
                                    operation: 'edit',
                                    mainScId: mainVM.selectedCourse().courseVM.businessConceptInstance.id,
                                    epStructure: {
                                        type: epUItype,
                                        epUIStructure: dexit.epm.epa.integration.graph.toJSON(),
                                        // decisionElements: dpa_VM.decisionElements(),
                                        intelligenceElements: dpa_VM.referredIntelligence()
                                    },
                                    touchpointsAndLayouts: touchpointsAndLayouts,
                                    existingPattern: (bcAuthVM.ePatterns && bcAuthVM.ePatterns.length > 0 ? bcAuthVM.ePatterns[0] : null)
                                };

                                //updates existing EP
                                bcAuthVM.epIntegration.generateEP(params, bcAuthVM, function(err, ep){
                                    if (err || !ep) {
                                        //do not continue if a problem
                                        //should consolidate and clean-up createBCInstance
                                        return callback(new Error('problem updating EP'));
                                    }

                                    //now update old card with update values
                                    selectedCard.name(bcAuthVM.propertyTextValue()[0]);
                                    selectedCard.ePatterns(ep);
                                    selectedCard.sc(data);
                                    selectedCard.isTouchpointAdded(isTPAdded);
                                    mainVM.selectedCourse().courseVM.handleChosenTouchpoints(data, function(tpList) {
                                        selectedCard.chosenTPs(tpList);
                                    });
                                    debugger;
                                    if (originalEndConfiguration) {
                                        selectedCard.setPatternEndingConfiguration(originalEndConfiguration);
                                    }



                                    //returns the updated card
                                    callback(null, selectedCard);

                                    //
                                    // var oldWidget = ko.observable(mainVM.selectedCourse().courseVM.widgets()[bcAuthVM.widgetIndex]);
                                    // var newWidget = ko.observable(oldWidget());
                                    // newWidget().name(bcAuthVM.propertyTextValue()[0]);
                                    // mainVM.selectedWidget().name(bcAuthVM.propertyTextValue()[0]);
                                    // newWidget().ePatterns(ep);
                                    // newWidget().sc(data);
                                    // newWidget().isTouchpointAdded(isTPAdded);
                                    // mainVM.selectedCourse().courseVM.handleChosenTouchpoints(data, function(tpList) {
                                    //     newWidget().chosenTPs(tpList);
                                    // });
                                    // mainVM.selectedCourse().courseVM.widgets.replace(oldWidget(), newWidget());
                                    // callback();
                                });
                            });
                        }
                    });
                }
            });
        });
    };

    /**
     * Called by edit to remove existing
     * @param sc
     * @param callback
     * @private
     */
    bcAuthVM._deleteBCElements = function(sc, callback) {
        async.series([
            function removeLayout(done) {
                async.each(sc.layout, function(layout, cbLayout){
                    dexit.app.ice.integration.layoutmanagement.deleteLayout(mainVM.repo, sc.id, layout.id, function(err){
                        if(err) {
                            console.log('Cannot remove layout: '+layout.id);
                        }
                        cbLayout();
                    });
                }, done);
            },
            function removeBehaviour(done) {
                async.each(sc.behaviour, function(beh, cbBeh){
                    if(beh && beh.scope && beh.scope ==='user') {
                        dexit.scm.dcm.integration.sc.behaviour.remove(mainVM.repo, beh.id, sc.id, null, function(err){
                            if(err) {
                                console.log('Cannot remove behaviour: '+beh.id);
                            }
                            cbBeh();
                        });
                    } else {
                        cbBeh();
                    }
                }, done);
            },
            function removeDecision (done) {
                async.each(sc.decision, function(decision, cbDecision){
                    dexit.scm.dcm.integration.sc.decision.remove(mainVM.repo, decision.id, sc.id, function(err){
                        if(err) {
                            console.log('Cannot remove decision: '+decision.id);
                        }
                        cbDecision();
                    });
                }, done);
            },
            function removeIntelligence (done) {
                async.each(sc.intelligence, function(intelligence, cbIntel){
                    if(intelligence.kind && intelligence.kind.indexOf('service')>-1) {
                        dexit.app.ice.edu.integration.lectureManager.deleteIntelligence(sc.id, intelligence.id, intelligence.kind.split('#')[1], function(err){
                            if(err) {
                                console.log('Cannot remove intelligence: '+intelligence.id);
                            }
                            cbIntel();
                        });
                    } else {
                        cbIntel();
                    }
                }, done);

            },
            function removeTextMM(done) {
                async.each(sc.text, function(text, cbText){
                    dexit.scm.dcm.integration.sc.removeTextMultimedia(mainVM.repo, text.id, sc.id, 'smartcontentobject', function(err){
                        if(err) {
                            console.log('Cannot remove text: '+text.id);
                        }
                        cbText();
                    });
                }, done);
            },
            function removeImageMM(done) {
                async.each(sc.image, function(image, cbImage){
                    dexit.scm.dcm.integration.sc.removeImageMultimedia(mainVM.repo, image.id, sc.id, 'smartcontentobject', function(err){
                        if(err) {
                            console.log('Cannot remove image: '+image.id);
                        }
                        cbImage();
                    });
                }, done);
            },
            function removeVideoMM(done) {
                async.each(sc.video, function(video, cbVideo){
                    dexit.scm.dcm.integration.sc.removeVideoMultimedia(mainVM.repo, video.id, sc.id, 'smartcontentobject', function(err){
                        if(err) {
                            console.log('Cannot remove video: '+video.id);
                        }
                        cbVideo();
                    });
                }, done);
            }], callback);
    };

};
