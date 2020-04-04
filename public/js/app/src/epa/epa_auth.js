/**
 * @copyright Digital Engagement Xperience 2016-2017
 * Viewmodel for EPA
 *
 */
/*global joint, dexit, Ajv */


var dpa_VM = {

    droppedElementType : ko.observable(),
    counter : 0,
    currentItem : null,
    generatedStructure : ko.observableArray(), //TODO: remove all refernces as this is for old EPA
    referredIntelligence : ko.observableArray(),
    validTitle : ko.observable(false),
    currentElement : ko.observable(null),
    editingItem : ko.observable(false),
    addingDecision : ko.observable(false),
    ePoints : ko.observableArray(),
    topLevelComponents : ko.observableArray([]),
    retrievedObjects : [],
    newEditEntry : null,
    enableSaveText : ko.observable(false),
    currentCourseStudents : ko.observableArray([]),
    decisionTemplate : ko.observable('create_decision'),
    mainVM : null, // this will be assigned at runtime as a ref to main.js (for now a reference to the entire VM is passed in)
    callingVM: null, //this will be assigned at runtime during call to init (must implement observables for mm)
    eptTemplates : [],
    menuTemplates : [], //holds templates for beh, brs
    //for input
    showInputScreen: ko.observable(false),
    intelligenceElements: ko.observableArray([]),

    // decision-related properties
    draggedBehaviour : null,
    draggedElement : null,
    currentDecision : null,
    currentPath : null,
    editingDecision : ko.observable(false),
    matchAnswer : ko.observable(false),
    addingBehToDecision : ko.observable(false),
    disableAddMM : ko.observable(false),
    disableAddService : ko.observable(false),
    answerSelected : ko.observable(false),
    hideNextStep : ko.observable(false),
    editingDecisionText : ko.observable(false),

    //TODO: check the link exists or not, since the qmreports will not have this link reference during the building
    //need a better way to set this link with id=main-styles into client-test.html in qmreports task.
    eptSheet : document.querySelector('#main-styles') ? document.querySelector('#main-styles').sheet: '',


    // holds available touchpoints
    availableTouchpoints: ko.observableArray(),
    selectedTouchpointsText: ko.pureComputed(function(){
        return dpa_VM.selectedTouchpoints().length + ' selected touchpoints';
    }),
    // holds the selected touchpoint identifiers from the current touchpoint selection
    selectedTouchpoints : ko.observableArray(),

    dsToCategory: [],

    //holds behaviours
    availableBehaviours: ko.observableArray(),
    pagedBehaviours: ko.observableArray(),
    //ICEMM-1018 - pagedBehaviours: requires changing to array
    // pagedBehaviours: ko.observable(),
    activePagedBehaviourItemVM: ko.observable(),

    pagedBRs: ko.observable(),
    pagedBI: ko.observableArray(),
    pagedDI: ko.observableArray(),


    pagedMM: ko.observableArray(),
    textInput: ko.observable(''),
    pagedCampaigns: ko.observableArray(),

    patternPaper : null,
    graph: null,
    allowDrop:ko.observable(true),


    currentOperation: ko.observable(),

    resizeGraph: function() {
        if (dexit.epm.epa.integration.graph && dpa_VM.patternPaper) {
            //use outside container dimensions, not the paper dimenions
            //var rect = dpa_VM.patternPaper.el.getBoundingClientRect();
            var workArea =$('#ep-work-area');
            var width = workArea.width() - 5;
            var height = workArea.height() - 5;
            dpa_VM.patternPaper.setDimensions(width, height);
            dpa_VM.patternPaper.scaleContentToFit({padding:10, minScaleX: 0.3, minScaleY: 0.3, maxScaleX: 1 , maxScaleY: 1, preserveAspectRatio:true});
            // dpa_VM.patternPaper.scaleContentToFit({padding:20, preserveAspectRatio:true});
            //need to reset origin for some reason or else the origin looks to be based on the absolute page height instead of the offset where
            //the paper is
            dpa_VM.patternPaper.setOrigin(0,0);
        }
    },

    addEvent: ko.observable(false),
    transitEvents: ko.observableArray(['Timer','Click']),
    selectedEvent: ko.observable(),
    eventTime: ko.observable(),
    timeOptions: ko.observableArray(['s','ms','m']),
    selectedTime: ko.observable(),



    initBehaviours: function(behaviours) {
        //initialize behaviours

        //OLD way - no categories
        // var paged = new dexit.epm.epa.PagedItemVM();
        // paged.loadItems({items:behaviours});
        // dpa_VM.pagedBehaviours(paged);


        //new Way - categories
        dpa_VM.pagedBehaviours([]);
        dpa_VM.activePagedBehaviourItemVM(0);



        var mappedBeh = _.map(behaviours, function (beh) {
            var found = _.find(dpa_VM.dsToCategory, function (val) {
                return (val.dsId == beh.ds.id);
            });
            if (!found) {
                beh.title = 'misc';
            } else {
                beh.title = found.category;
            }
            return beh;
        });

        // var paged = _.map(categories, function (category) {
        //
        //     _.each(behaviours, function () {
        //
        //     })
        //
        // });

        var groupedBehaviours = _.chain(mappedBeh)
            .groupBy('title')
            .toPairs()
            .map(function(currentItem) {
                return _.zipObject(['title', 'items'], currentItem);
            })
            .value();
        //group is title, items

        _.each(groupedBehaviours, function (bci) {
            var paged = new dexit.epm.epa.PagedItemVM();
            paged.loadItems(bci);
            dpa_VM.pagedBehaviours.push(paged);
        });

        // paged.loadItems({items:behaviours});



        debugger;
        //add system behaviours

        // var scId = dpa_VM.callingVM.businessConceptInstance.id;
        //
        // var clearBeh = {
        //     'type': 'behaviour',
        //     'subType': 'clear',
        //     'iconType': 'fa fa-eraser',
        //     'renderText': 'Clear Region',
        //     'scId': scId,
        //     'behId': 'system_behaviour_clear_region',
        //     // 'ds': {
        //     //     'id': '8f545a35-e3cc-429c-8fd5-dd6f9ba59249',
        //     //     'serviceId': '870dd9bb-cff1-49a9-a44f-b30e71c6f36b',
        //     //     'description': 'clear',
        //     //     'setup': {},
        //     //     'uiElements': {
        //     //         'icon_type': 'fa fa-eraser',
        //     //         'render_text': 'Clear',
        //     //         'subtype': 'clear'
        //     //     }
        //     // },
        //     'title': 'system'
        // }
        //
        // // var sysBehs = {
        // //     title:'system',
        // //     items:[clearBeh]
        // // }
        // var pagedSys= new dexit.epm.epa.PagedItemVM();
        // pagedSys.loadItems(sysBehs);
        // dpa_VM.pagedBehaviours.push(pagedSys);





        //build an array of
        //{
        //  title: name,
        //  items: epEntries
        //};



    },
    initBusinessRules: function(brs) {
        //initalize behaviours for pag
        var paged = new dexit.epm.epa.PagedItemVM();
        paged.loadItems({items:brs});
        dpa_VM.pagedBRs(paged);
    },
    activeBIPagedItemVM: ko.observable(0),
    activeDIPagedItemVM: ko.observable(0),
    activeCampaignPagedItemVM: ko.observable(0),
    showCampaignSelection: ko.observable(false),

    availableBI:[],

    // _addReservedCampaign: function(item) {
    //
    //     //get current bc id
    //
    //     var entries = [{
    //         name: 'Latest for ' +name,
    //         id: item.course.id + 'ep:' + 'latest',
    //         scId: item.course.id,
    //         intelId: '{{ep.reserved}}', //TODO: should reference sc element
    //         type: 'intelligence',
    //         subType: 'engagement-pattern',
    //         subtype: 'engagement-pattern',
    //         renderType:'flex-intelligence',
    //         src: '{{sc:'+item.course.id + ':intelligence:<engagement-pattern>reserved}}',
    //         // iconType: uiElements.icon_type,
    //         renderText: 'Reserved Campaigns'
    //     }];
    //     return {
    //         title: 'Reserved',
    //         items: entries
    //     };
    // },

    _loadCampaigns: function(callback) {

        var relationships = dpa_VM.callingVM.bcRelationships;

        var filteredRel = _.filter(relationships, function (val) {
            return (val.ref && val.ref ==='MerchandisingCampaign' && val.navigable && val.navigable === true);
        });
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
                            return (tp.channelType && tp.channelType === 'ucc');
                        });

                        //skip if campaign is not setup for BCC
                        if (!matchingTp) {
                            return done();
                        }

                        async.map(data.lectures, function(bci, doneEP) {
                            dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(dpa_VM.callingVM.mainVM.repo, bci.id, function (err, res) {
                                if (err) {
                                    console.error('Cannot retrieve engagement pattern');
                                    bci.ep = [];
                                    return doneEP(null, bci);
                                }
                                bci.ep = res;
                                doneEP(null, bci);
                            });
                        }, function (err, res) {
                            if (err) {
                                console.log('error:%o',err);
                            }
                            data.lectures = res || [];
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


                    //add entry for dynamic
                    epEntries.unshift({
                        name: 'Latest for ' +name,
                        id: item.course.id + 'ep:' + 'latest',
                        scId: item.course.id,
                        intelId: '{{ep.latest}}', //TODO: should reference sc element
                        type: 'intelligence',
                        subType: 'engagement-pattern',
                        subtype: 'engagement-pattern',
                        renderType:'flex-intelligence',
                        src: '{{sc:'+item.course.id + ':intelligence:<engagement-pattern>latest(date)}}',
                        // iconType: uiElements.icon_type,
                        renderText: 'Latest for ' +name
                    });

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

            //add in EPs from current
            //get info from loaded Vms for cards
            var currItems = _.map(dpa_VM.callingVM.tempCards(), function(card) {
                var ep = (card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0] :null);
                if (ep) {
                    return {
                        name: card.name(),
                        id: ep.id,
                        scId: card.sc().id,
                        intelId: 'fixme', //TODO: should reference sc element
                        type: 'intelligence',
                        subType: 'engagement-pattern',
                        subtype: 'engagement-pattern',
                        renderType: 'flex-intelligence',
                        src: ep.id,
                        // iconType: uiElements.icon_type,
                        renderText: card.name()
                    };
                }else
                {
                    return null;
                }
            });
            currItems = _.compact(currItems);
            var curr = {
                title: dpa_VM.callingVM.businessConceptInstance.property.name,
                items: currItems || []
            };
            res.push(curr);

            callback(null, res);
        });

    },


    initCampaigns: function () {
        dpa_VM.pagedCampaigns([]);
        dpa_VM.activeCampaignPagedItemVM(0);
        // var relationships = dpa_VM.callingVM.bcRelationships;
        //
        // var filteredRel = _.filter(relationships, function (val) {
        //     return (val.ref && val.ref ==='MerchandisingCampaign' && val.navigable && val.navigable === true);
        // });
        // //TODO: once extra SC is removed for EP, update this logic
        // //TODO: move all to service for efficiency and maintainability
        // async.auto({
        //     retrieveForTp: function (cb) {
        //         async.map(filteredRel, function (rel, done) {
        //             dexit.app.ice.edu.integration.courseManagement.listSharedLectures(rel.refId, function (err, data) {
        //                 if (err) {
        //                     console.error('problem retrieving associated BCs...skipping for refId:%s ,err:%o', rel.refId, err);
        //                     return done();
        //                 }
        //                 var tps = (data && data.touchpoints ? data.touchpoints : []);
        //                 var matchingTp = _.some(tps, function (tp) {
        //                     return (tp.channelType && tp.channelType === 'ucc');
        //                 });
        //
        //                 //skip if campaign is not setup for BCC
        //                 if (!matchingTp) {
        //                     return done();
        //                 }
        //
        //                 async.map(data.lectures, function(bci, doneEP) {
        //                     dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(dpa_VM.callingVM.mainVM.repo, bci.id, function (err, res) {
        //                         if (err) {
        //                             console.error('Cannot retrieve engagement pattern');
        //                             bci.ep = [];
        //                             return doneEP(null, bci);
        //                         }
        //                         bci.ep = res;
        //                         doneEP(null, bci);
        //                     });
        //                 }, function (err, res) {
        //                     if (err) {
        //                         console.log('error:%o',err);
        //                     }
        //                     data.lectures = res || [];
        //                     done(null,data);
        //                 });
        //             });
        //         }, function(err, res) {
        //             if (err) {
        //                 return cb(err);
        //             }
        //             cb(null, _.compact(res));
        //         });
        //     },
        //     build: ['retrieveForTp',function(cb, results) { //for each BC
        //         var res = results.retrieveForTp;
        //
        //
        //         var updated = _.map(res, function (item) {
        //
        //             var name = item.course.property.name;
        //             var mapped = _.map(item.lectures, function (ep) {
        //                 if (ep.ep && ep.ep.length > 0) {
        //                     return {
        //                         name: ep.property.name,
        //                         id: ep.ep[0].id,
        //                         scId: ep.id,
        //                         intelId: 'fixme', //TODO: should reference sc element
        //                         type: 'intelligence',
        //                         subType: 'engagement-pattern',
        //                         subtype: 'engagement-pattern',
        //                         renderType:'flex-intelligence',
        //                         src: ep.ep[0].id,
        //                         // iconType: uiElements.icon_type,
        //                         renderText: ep.property.name
        //                     };
        //                 } else  {
        //                     return null;
        //                 }
        //             });
        //             //remove any null entries
        //             var epEntries = _.compact(mapped);
        //
        //
        //             //add entry for dynamic
        //             epEntries.unshift({
        //                 name: 'Latest for ' +name,
        //                 id: item.course.id + 'ep:' + 'latest',
        //                 scId: item.course.id,
        //                 intelId: '{{ep.latest}}', //TODO: should reference sc element
        //                 type: 'intelligence',
        //                 subType: 'engagement-pattern',
        //                 subtype: 'engagement-pattern',
        //                 renderType:'flex-intelligence',
        //                 src: '{{sc:'+item.course.id + ':intelligence:<engagement-pattern>latest(date)}}',
        //                 // iconType: uiElements.icon_type,
        //                 renderText: 'Latest for ' +name
        //             });
        //
        //             return {
        //                 title: name,
        //                 items: epEntries
        //             };
        //
        //         });
        //
        //         cb(null,updated);
        //
        //     }]
        // }, function (err, results) {
        //     if (err) {
        //         return;
        //     }
        //     var res = results.build;
        //
        //     //add in EPs from current
        //     //get info from loaded Vms for cards
        //     var currItems = _.map(dpa_VM.callingVM.tempCards(), function(card) {
        //         var ep = (card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0] :null);
        //         if (ep) {
        //             return {
        //                 name: card.name(),
        //                 id: ep.id,
        //                 scId: card.sc().id,
        //                 intelId: 'fixme', //TODO: should reference sc element
        //                 type: 'intelligence',
        //                 subType: 'engagement-pattern',
        //                 subtype: 'engagement-pattern',
        //                 renderType: 'flex-intelligence',
        //                 src: ep.id,
        //                 // iconType: uiElements.icon_type,
        //                 renderText: card.name()
        //             };
        //         }else
        //         {
        //             return null;
        //         }
        //     });
        //     currItems = _.compact(currItems);
        //     var curr = {
        //         title: dpa_VM.callingVM.businessConceptInstance.property.name,
        //         items: currItems || []
        //     };
        //     res.push(curr);
        //
        //
        //
        //     // //add special registered campaigns only
        //     // var registeredCampaignsOnly = {
        //     //     title: 'Registered Campaigns',
        //     //     items: [
        //     //         {
        //     //             name: 'registered',
        //     //             id: ep.id,
        //     //             scId: card.sc().id,
        //     //             intelId: 'fixme', //TODO: should reference sc element
        //     //             type: 'intelligence',
        //     //             subType: 'engagement-pattern',
        //     //             subtype: 'engagement-pattern',
        //     //             renderType: 'flex-intelligence',
        //     //             src: ep.id,
        //     //             // iconType: uiElements.icon_type,
        //     //             renderText: card.name()
        //     //         }
        //     //     ]
        //     // };
        //
        //
        //
        //
        //
        //     _.each(res, function (bci) {
        //         var paged = new dexit.epm.epa.PagedItemVM();
        //         paged.loadItems(bci);
        //         dpa_VM.pagedCampaigns.push(paged);
        //     });
        //
        //
        // });

        dpa_VM._loadCampaigns(function (err, res) {
            if (err) {
                //TODO
            }
            _.each(res, function (bci) {
                var paged = new dexit.epm.epa.PagedItemVM();
                paged.loadItems(bci);
                dpa_VM.pagedCampaigns.push(paged);
            });

            var paged2 = new dexit.epm.epa.PagedItemVM();

            //add special system campaigns only
            var systemCampaigns = {
                title: 'System',
                items: [
                    {
                        name: 'logout',
                        id: '111114',
                        scId: dpa_VM.callingVM.businessConceptInstance.id,
                        intelId: 'fixme', //TODO: should reference sc element
                        type: 'intelligence',
                        subType: 'engagement-pattern',
                        subtype: 'engagement-pattern',
                        renderType: 'flex-intelligence',
                        src: '111114',
                        renderText: 'system logout'
                    },
                    {
                        name: 'settings',
                        id: '111115',
                        scId: dpa_VM.callingVM.businessConceptInstance.id,
                        intelId: 'fixme', //TODO: should reference sc element
                        type: 'intelligence',
                        subType: 'engagement-pattern',
                        subtype: 'engagement-pattern',
                        renderType: 'flex-intelligence',
                        src: '111114',
                        renderText: 'system settings'
                    },
                    {
                        name: 'help',
                        id: '111116',
                        scId: dpa_VM.callingVM.businessConceptInstance.id,
                        intelId: 'fixme', //TODO: should reference sc element
                        type: 'intelligence',
                        subType: 'engagement-pattern',
                        subtype: 'engagement-pattern',
                        renderType: 'flex-intelligence',
                        src: '111116',
                        renderText: 'system settings'
                    },
                    {
                        name: 'partners',
                        id: '111117',
                        scId: dpa_VM.callingVM.businessConceptInstance.id,
                        intelId: 'fixme', //TODO: should reference sc element
                        type: 'intelligence',
                        subType: 'engagement-pattern',
                        subtype: 'engagement-pattern',
                        renderType: 'flex-intelligence',
                        src: '111117',
                        renderText: 'system settings'
                    }
                ]
            };
            paged2.loadItems(systemCampaigns);
            dpa_VM.pagedCampaigns.push(paged2);




        });

    },

    initIntelligence: function(intels){
        //categorize


        //debugger;
        //filter intels
        var resource = '/bc-creation/available-bi';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, result) {
            if (result) {

                // let nameCat = _.map(result, function(val){
                //     return {
                //         name: val.name,
                //         subType: val.subType,
                //         defaultKey: val.defaultKey
                //     };
                // });

                var fil = _.chain(intels)
                    .reject(function (val) {
                        return val.kind === 'intelligence#engagementmetric';
                    })
                    .map(function (val) {
                        if (val.property && val.property.definition && _.isString(val.property.definition)){
                            val.property.definition = JSON.parse(val.property.definition);
                        }
                        return val;
                    })
                    .filter(function (val) {
                        return (val.property.definition && val.property.definition.schema && val.property.definition.schema.id);
                    })
                    .uniqBy('property.definition.name')
                    .map(function(val) { //add missing info

                        if (!val.property.definition.category) {
                            //add extra information
                            var found = _.find(result, {name:val.property.definition.name});
                            if (found){
                                val.property.definition.category = found.category;
                                if (found.defaultKey){
                                    val.property.definition.defaultKey = found.defaultKey;
                                }
                                if (found.label) {
                                    val.property.definition.label = found.label;
                                }

                            }
                        }
                        return val;
                    })
                    .value();


                //augment intelligence




                dpa_VM.initIntelligenceBI(_.filter(fil, function(val){
                    return (val.property.definition.category && val.property.definition.category === 'bi');
                }));
                dpa_VM.initIntelligenceDI(_.filter(fil, function(val){
                    return (val.property.definition.category && val.property.definition.category === 'dynamic');
                }));
            }
        });


    },
    /**
     *
     * @param {object} intels - SC intelligence
     */
    initIntelligenceDI: function(intels) {

        dpa_VM.pagedDI([]);

        dpa_VM.availableDI = [];

        //filter out ems




        dpa_VM.activeDIPagedItemVM(0);

        async.each(intels, function (intel, cb) {
            //load s
            var val = intel.property.isAssignedTo.split('/');
            var scId = (val && val.length > 0 ? val[val.length-1] : '');




            dexit.app.ice.integration.kb.schema.retrieveById(intel.property.definition.schema.id, function (err, res) {
                if (err) {
                    console.error('failed to load schema for :'+intel.property.definition.schema.id);
                    //skip
                    return cb();
                }
                _.each(res.records, function (record) {
                    var items = [];
                    var paged = new dexit.epm.epa.PagedItemVM();
                    dpa_VM.availableDI.push({scId: scId, intelId:intel.id, name:record.name,fields:record.fields});
                    _.each(record.fields, function (field) {

                        //default to text
                        if (!field.doc) {
                            field.doc = 'text';
                        }


                        if (field.doc.startsWith('behaviour')) {
                            var ele = {
                                type: 'behaviour',
                                //subtype: 'flex-intelligence',
                                subtype: 'dynamic-behaviour',
                                subType: 'dynamic-behaviour',
                                renderType:'dynamic-behaviour',
                                src: '{{' + record.name + '.' + field.name + '}}',
                                // iconType: uiElements.icon_type,
                                renderText: field.name,
                                name:field.name,
                                scId: scId,
                                dataType:field.type
                            };
                            items.push(ele);

                        }else if (field.doc.startsWith('intelligence')) {

                            var split = field.doc.split('@@');

                            field.type = 'intelligence';
                            field.dataType = field.type;
                            field.src = '{{' + record.name + '.' + field.name + '}}';
                            field.subType = split[1];
                            field.presentation = split[2];
                            field.renderType = 'flex-intelligence';

                            field.scId = scId;

                            if (field.subType === 'engagement-pattern') {
                                field.renderText = field.name;
                                field.intelId = '{{ep.recommended}}';
                            } else if (field.subType === 'dynamic-ept') {
                                field.intelId = '{{ept.dynamic}}';
                                field.renderText = field.name;
                            } else if (field.subType === 'dynamic-ept-params') { //TODO: expand, allow parameters
                                field.intelId = '{{ept.dynamic}}';
                                field.renderText = field.name;



                                field.presentation = 'embedded'; //default
                                field.executionParams = {
                                    type: 'tpAllocation'
                                };

                                if (split.length > 3) {
                                    field.executionParams.type = split[3];
                                    field.executionParams.tag = '{{elementTag}}';
                                    field.presentation = 'default';
                                }




                            } else {
                                field.intelId = intel.id;
                            }
                            items.push(field);
                        } else {
                            /**
                             * item - template type and subtype are passed in as arguments
                             * @param {string} type - used to build item to be added (type of SC element)
                             * @param {string} subtype - used to determine template to render when renderType is not selected
                             * @param {string} [renderType] - used to determine template to render (not included for behaviour or BR)
                             * @param {boolean} [isBR]
                             */
                            field.dataType = field.type;
                            field.type = 'multimedia';
                            if (field.doc.startsWith('image')) {
                                field.renderType = 'dynamic-image';

                                //var icon = field.doc.split(':'); //'/img/'
                            }
                            if (field.doc.startsWith('text')) {
                                field.renderType = 'dynamic-text';
                            }
                            if (field.doc.startsWith('video')) {
                                field.renderType = 'dynamic-video';
                            }
                            field.src = '{{' + record.name + '.' + field.name + '}}';
                            field.subType = 'intelligence';
                            field.subtype = 'intelligence';

                            items.push(field);
                        }


                    });
                    paged.loadItems({title:record.name, items:items});
                    dpa_VM.pagedDI.push(paged);
                });
                cb();
            });
        }, function () {
            console.log('loaded intelligence menu for EPA');
        });




        //load PagedItemVM for each group of intelligence
        //var paged = new dexit.epm.epa.PagedItemVM();
        //paged.loadItems({items:intels});

    },
    initIntelligenceBI: function(intels) {
        dpa_VM.pagedBI([]);
        dpa_VM.availableBI = [];

        //filter out ems

        dpa_VM.activeBIPagedItemVM(0);

        async.each(intels, function (intel, cb) {
            //load s
            var val = intel.property.isAssignedTo.split('/');
            var scId = (val && val.length > 0 ? val[val.length-1] : '');
            dexit.app.ice.integration.kb.schema.retrieveById(intel.property.definition.schema.id, function (err, res) {
                if (err) {
                    console.error('failed to load schema for :'+intel.property.definition.schema.id);
                    //skip
                    return cb();
                }
                _.each(res.records, function (record) {
                    var items = [];
                    var paged = new dexit.epm.epa.PagedItemVM();
                    dpa_VM.availableBI.push({scId: scId, intelId:intel.id, name:record.name,fields:record.fields});
                    _.each(record.fields, function (field) {

                        //default to text
                        if (!field.doc) {
                            field.doc = 'text';
                        }
                        if (field.doc.startsWith('behaviour')) {
                            var ele = {
                                type: 'behaviour',
                                //subtype: 'flex-intelligence',
                                subtype: 'dynamic-behaviour',
                                subType: 'dynamic-behaviour',
                                renderType:'dynamic-behaviour',
                                src: '{{' + record.name + '.' + field.name + '}}',
                                // iconType: uiElements.icon_type,
                                renderText: field.name,
                                name:field.name,
                                scId: scId,
                                dataType:field.type
                            };
                            items.push(ele);

                        }else if (field.doc.startsWith('intelligence')) {
                            field.type = 'intelligence';
                            field.dataType = field.type;
                            field.src = '{{' + record.name + '.' + field.name + '}}';
                            field.subType = field.doc.split('@@')[1];
                            field.presentation = field.doc.split('@@')[2];
                            field.renderType = 'flex-intelligence';

                            field.scId = scId;

                            if (field.subType === 'engagement-pattern') {
                                field.renderText = field.name;
                                field.intelId = '{{ep.recommended}}';
                            } else if (field.subType === 'dynamic-ept') {
                                field.intelId = '{{ept.dynamic}}';
                                field.renderText = field.name;
                            } else if (field.subType === 'dynamic-ept-params') { //TODO: expand, allow parameters
                                field.intelId = '{{ept.dynamic}}';
                                field.renderText = field.name;
                                field.presentation = 'embedded'; //default
                                field.executionParams = {
                                    type: 'tpAllocation'
                                };

                            } else {
                                field.intelId = intel.id;
                            }
                            items.push(field);
                        } else {
                            /**
                             * item - template type and subtype are passed in as arguments
                             * @param {string} type - used to build item to be added (type of SC element)
                             * @param {string} subtype - used to determine template to render when renderType is not selected
                             * @param {string} [renderType] - used to determine template to render (not included for behaviour or BR)
                             * @param {boolean} [isBR]
                             */
                            field.dataType = field.type;
                            field.type = 'multimedia';
                            if (field.doc.startsWith('image')) {
                                field.renderType = 'dynamic-image';

                                //var icon = field.doc.split(':'); //'/img/'

                            }
                            if (field.doc.startsWith('text')) {
                                field.renderType = 'dynamic-text';
                            }
                            if (field.doc.startsWith('video')) {
                                field.renderType = 'dynamic-video';
                            }
                            field.src = '{{' + record.name + '.' + field.name + '}}';
                            field.subType = 'intelligence';
                            field.subtype = 'intelligence';

                            field.intelRef = intel;

                            items.push(field);
                        }


                    });
                    paged.loadItems({title:record.name, items:items});
                    dpa_VM.pagedBI.push(paged);
                });
                cb();
            });
        }, function () {
            console.log('loaded intelligence menu for EPA');
        });




        //load PagedItemVM for each group of intelligence
        //var paged = new dexit.epm.epa.PagedItemVM();
        //paged.loadItems({items:intels});

    },

    activeMMPagedItemVM: ko.observable(0),

    initMM: function (mmTag) {

        //need to make sure multimedia is reloaded for campaign
        dpa_VM.mainVM.loadMMForBC(mmTag, function () {
            dpa_VM.pagedMM([]);
            dpa_VM.activeMMPagedItemVM(0);
            //for video and images

            var photos = new dexit.epm.epa.PagedItemVM();
            var videos = new dexit.epm.epa.PagedItemVM();
            var docs = new dexit.epm.epa.PagedItemVM();


            var photoItems = dpa_VM.mainVM.imageMM();

            //add placeholder
            if (photoItems.indexOf('/img/placeholder-image.svg') === -1) {
                photoItems.push('/img/placeholder-image.svg');
            }
            photos.loadItems({title:'Photos', template:'imageItemPopoverTemplate', items:photoItems});


            var videosItems = dpa_VM.mainVM.videoMM();
            //videosItems.unshift('upload');
            //add placeholder
            if (videosItems.indexOf('/img/placeholder-video.mp4') === -1) {
                videosItems.push('/img/placeholder-video.mp4');
            }
            videos.loadItems({title:'Videos', template:'videoItemPopoverTemplate', items:videosItems});


            var docItems = dpa_VM.mainVM.docMM();
            docs.loadItems({title:'Documents', template:'docItemPopoverTemplate', items:docItems});





            dpa_VM.pagedMM.push(photos);
            dpa_VM.pagedMM.push(videos);
            dpa_VM.pagedMM.push(docs);

        });




        //for images
    },

    clearPaper: function () {
        //clear graph
        dexit.epm.epa.integration.clearGraph();
        //clear paper
        if (dpa_VM.patternPaper) {
            dpa_VM.patternPaper.remove();
            dpa_VM.patternPaper = null;

        }
    },
    /**
     * prepare vm
     * @param {object} args
     * @param {TPInfo[]} args.touchpoints - available touchpoints
     * @param {string[]} [args.selectedTouchpoints=[]] - selected TP ids
     * @param {string} [args.currentOperation='create'] - current operation in EPA: may include: 'create','edit','requires_approval','view_only'
     * @param {object} args.callingVM - reference to calling VM
     * @param {ko.observable} args.callingVM.imageMM - reference to calling VM's observable holding mm
     * @param {ko.observable} args.callingVM.videoMM - reference to calling VM  observable holding mm
     * @param {string} [args.mmTag] - app tag for selective loading of multimedia
     * @param {object} [args.epUIObject] - load specified EP UI object if present
     */
    init: function (args) {

        dpa_VM.clearPaper();
        //init graph and paper
        dexit.epm.epa.integration.prepareShapes();

        dpa_VM.callingVM =  args.callingVM;

        dpa_VM.buildMenuTemplates();
        //prepare TPs
        var tps = (args && args.touchpoints ? args.touchpoints : []);
        dpa_VM.availableTouchpoints(tps);
        var selectedTouchpoints = (args && args.selectedTouchpoints ? args.selectedTouchpoints : []);
        dpa_VM.selectedTouchpoints(selectedTouchpoints);

        var operation = (args && args.currentOperation ?  args.currentOperation : 'create');
        dpa_VM.currentOperation(operation);

        if (operation !== 'create') {
            dpa_VM.validTitle(true);
        }


        //if (dpa_VM.showCampaignSelection()) {
        dpa_VM.initCampaigns();
        // } else {
        //     dpa_VM.pagedCampaigns([]);
        // }


        //Behaviours
        //var behaviours = (args && args.behaviours ? args.behaviours : []);
        var behaviours = _.filter(dpa_VM.topLevelComponents(), function(val) { return (val.type === 'behaviour' && !val.isBR); });

        dpa_VM.initBehaviours(behaviours);
        //BRs
        var brs = _.filter(dpa_VM.topLevelComponents(), function(val) { return (val.isBR); });
        dpa_VM.initBusinessRules(brs);

        dpa_VM.initMM(args.mmTag);

        var intelligence = (args && args.intelligence ? args.intelligence : []);
        dpa_VM.initIntelligence(intelligence);



        //if editing then should load (or have loaded the graph object for the pattern being edited
        dpa_VM.graph = dexit.epm.epa.integration.graph;


        //prepare UI
        var workArea =$('#ep-work-area');

        var inserted = $(workArea).append('<div id="paper" class="drop-here paper"></div>');
        var paper = $(workArea).children('#paper');

        if (!dpa_VM.patternPaper) {

            dpa_VM.patternPaper = new joint.dia.Paper({
                el: paper,
                // width: '100%', // paper.width(),
                // height: '100%',//paper.height(),
                width: workArea.width() - 5,
                height: workArea.height() - 5,
                gridSize: 1,
                model: dpa_VM.graph,
                linkPinning: false, //do not allow dangling links
                restrictTranslate: true,
                interactive: {vertexAdd: false},
                multiLinks: false, //do not allow multiple links for same source/destination
                clickThreshold:6,
                // clickThreshold: 10,  //does not seem to work as expected
                // clickThreshold: 1,  //does not seem to work as expected
                // moveThreshold: 2, //does not seem to work as expected
                validateMagnet: function (cellView, magnet) {
                    // Note that this is the default behaviour. Just showing it here for reference.
                    // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
                    return (magnet.getAttribute('magnet') !== 'passive');
                },
                defaultLink: new joint.shapes.epa.FlowConnector(),
                validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                    // Prevent linking back into input port
                    if (magnetS && magnetS.getAttribute('port-group') === 'in') {
                        return false;
                    }
                    // Prevent linking from output ports to input ports within one element.
                    if (cellViewS === cellViewT) {
                        return false;
                    }
                    // Prevent linking to output ports.
                    if (magnetT && magnetT.getAttribute('port-group') !== 'in') {
                        return false;
                    }

                    //else return true if everything else has passed
                    return true;

                },
                // Enable marking available cells & magnets
                markAvailable: true,
                snapLinks: {radius: 60}
            });


            /*joint js cell element click events*/
            //
            /**
             *
             * Note: on moving any element hide popover
             */
            dpa_VM.patternPaper.on('cell:pointermove', function (cellView, evt, x, y) {
                console.log('cell:pointermove');
                dpa_VM.hideElementPopover();


                // better solution when/if jointjs prevents pointerclick from happening right after pointermove
                //clickThreshhold and moveThreshold do not seem to work as expected

                // if (!dpa_VM.ignoreClickAfterMove) {
                //
                //     dpa_VM.ignoreClickAfterMove = true;
                //
                //     setTimeout(function () {
                //         console.log('unsetting ignore click')
                //         dpa_VM.ignoreClickAfterMove = false;
                //     }, 500);
                // }
            });



            //TODO:pointerclick is not firing at all with jointjs 2.2.1, switched to pointerup
            //on click show pop-over menu (ie. deletion, select transitions,
            // dpa_VM.patternPaper.on('element:pointerclick', function (cellView, evt, x, y) {
            //     debugger;
            //     console.log('cell:pointerclick was triggered');
            //
            //
            //     console.log('cell:pointerclick: ignoreClickAfterMove:'+dpa_VM.ignoreClickAfterMove);
            //
            //
            //
            //     //hide previous
            //     //dpa_VM.hideElementTools();
            //     if (cellView && typeof cellView.hideEditPopover === 'function') {
            //         cellView.hideEditPopover();
            //     }
            //
            //     //
            //     // var params = {
            //     //     transition: true,
            //     //     configure: true
            //     // };
            //     // //figure out current cell
            //     // var inputSchema = (this.model.attributes && this.model.attributes.behRef && this.model.attributes.behRef.parameters ? this.model.attributes.behRef.parameters : null);
            //     // if (inputSchema) {
            //     //     params.input = true;
            //     // }
            //     //show edit popover for current element
            //     if (cellView && typeof cellView.showEditPopover === 'function') {
            //
            //         if (dpa_VM.ignoreClickAfterMove) {
            //             console.log('click ignored after move');
            //             return;
            //         }
            //
            //         cellView.showEditPopover();
            //     }
            //
            // });


            //TODO: workaround issue with jointjs 2.2.1 not firing cell:pointerclick (evt.target is undefined so event is guarded)

            dpa_VM.patternPaper.on('element:pointerdown',function (elementlView, evt, x, y) {
                console.log('element:pointerdown was triggered: x:%s y:%s',x,y);
            });

            dpa_VM.patternPaper.on('element:pointerup',function (cellView, evt, x, y) {
                console.log('element:pointerup was triggered: x:%s y:%s',x,y);
                //dragEnd
                var key = '__' + this.cid + '__';
                var mouseMoved = evt.data[key].mousemoved;

                // Trigger event only if mouse has not moved.
                if (mouseMoved <= dpa_VM.patternPaper.options.clickThreshold) {
                    //hide previous
                    if (cellView && typeof cellView.hideEditPopover === 'function') {
                        cellView.hideEditPopover();
                    }

                    //
                    // var params = {
                    //     transition: true,
                    //     configure: true
                    // };
                    // //figure out current cell
                    // var inputSchema = (this.model.attributes && this.model.attributes.behRef && this.model.attributes.behRef.parameters ? this.model.attributes.behRef.parameters : null);
                    // if (inputSchema) {
                    //     params.input = true;
                    // }
                    //show edit popover for current element
                    if (cellView && typeof cellView.showEditPopover === 'function') {

                        // if (dpa_VM.ignoreClickAfterMove) {
                        //     console.log('click ignored after move');
                        //     return;
                        // }
                        cellView.showEditPopover();
                    }
                }




            });


            dpa_VM.graph.on('add', function (cell) {
                console.log('New cell with id ' + cell.id + ' added to the graph.');
            });
            //on click in blank area hide popover

            dpa_VM.patternPaper.on('blank:pointerclick', function () {
                //hide previous
                dpa_VM.hideElementPopover();
            });




            /**
             * On movement of Element make sure any connectors do not overlap others
             * TODO: look at alternative approach to optimize
             */
            // dpa_VM.graph.on('change:position', function(cell) {
            //
            //     if (cell.type !== 'epa.HTMLElement') {
            //         return;
            //     }
            //
            //     var cells = dpa_VM.graph.getCells();
            //     //find potential obstacles (all except current element)
            //     var obstacles = _.filter(cells, function (elem) {
            //         return (elem.id !== cell.id && elem.type === 'epa.HTMLElement');
            //     });
            //
            //     //filter all links, go through each link
            //     var links = _.filter(cell, function (val) {
            //         return (val.type === 'epa.FlowConnector');
            //     });
            //
            //     var pap  = dpa_VM.patternPaper;
            //     _.each(links, function (link) {
            //         // has an obstacle been moved? Then reroute the link.
            //         if (_.contains(obstacles, cell)) {
            //             pap.findViewByModel(link).update();
            //         }
            //     });
            // });



        }



        if (args.epUIObject && !_.isEmpty(args.epUIObject)) {
            dexit.epm.epa.integration.loadEPUIObject(args.epUIObject);
        }




        if (dpa_VM.graph && dpa_VM.graph.getCells().length < 2) {
            //dpa_VM.patternPaper.on('cell:pointerdblclick', function (cellView, evt, x, y) {});
            var middle = dpa_VM.patternPaper.getArea().height / 2;
            //add start and end element(s) to page
            var start = dexit.epm.epa.integration.createStartElement({x: 20, y: middle});
            var endW = dpa_VM.patternPaper.getArea().width - 50;
            var end = dexit.epm.epa.integration.createEndElement({x: endW, y: middle});
            dpa_VM.graph.addCell(start);
            dpa_VM.graph.addCell(end);
        }

        dpa_VM.resizeGraph();
    },


    hideElementPopover: function() {
        var div = $('.ep-item');
        if (div && div.popover && div.length > 0) {
            div.each(function(index, elementDiv) {
                if ($(elementDiv).data('bs.popover')) { //only proceed if div exists
                    try {
                        $(elementDiv).popover('destroy');
                    } catch (e) {
                        console.error('problem hiding popover likely due to error in bootstrap itself');
                    }
                }
            });

        }
    },
    // getAvailableIntelligence: function (callback) {
    //     var val = [];
    //     _.each(dpa_VM.availableBI, function (intel) {
    //         _.each(intel.fields, function (field) {
    //             val.push({value:intel.intelId + ':' + intel.name + ':' + field.name,text:intel.name + ' - ' + field.name});
    //         });
    //     });
    //     callback(val);
    //
    //     //return dpa_VM.availableBI;
    // },

    /**
     * Returns available temporary intelligence for EP
     * @returns {Array}
     */
    getTemporaryIntelligence: function () {
        if (!dpa_VM.graph) {
            return [];
        }
        var graph = JSON.parse(dexit.epm.epa.integration.graphToJSON());
        var intels = [];
        var executeElements = _.filter(graph.cells, function(cell){
            return (cell.elementType && cell.type.indexOf('Element') > -1);
        });

        _.each(executeElements, function (cell) {
            if (cell.elementType === 'behaviour'){
                //look for input
                if (cell.behRef && cell.behRef.output_parameters) {
                    var op = cell.behRef.output_parameters;
                    //intelligence id starts with "temp-": + element id
                    var fields = _.map(op.schema.properties, function (val, key) {
                        return {'name':key, dataType:val.type};
                    });
                    intels.push({intelId:'temp-'+cell.id, name:cell.behRef.ds.description, fields:fields});
                }
            }
        });
        return intels;


    },

    //-- for input screen for dropping intelligence
    openElementConfig: function (currElement) {
        var inputSchema = (currElement && currElement.attributes.behRef && currElement.attributes.behRef.parameters ? currElement.attributes.behRef.parameters : null);

        if (!inputSchema) {
            console.warn('behaviour has no inputs');
            return;
        }

        //cofigure form
        var setupForm = $('#elementInputForm');
        setupForm.empty();
        dpa_VM.showInputScreen(true);
        setupForm.alpaca({
            'schema': inputSchema,
            'options': {
                'form': {
                    'buttons': {
                        'save': {
                            'title': 'Save',
                            'click': function() {
                                var value = this.getValue();
                                currElement.attributes.property = currElement.attributes.property || {};
                                _.extend(currElement.attributes.property, value);
                                dpa_VM.hideInputScreen();
                                //remove form
                                setupForm.alpaca('destroy');

                            }},
                        'close':{
                            'title': 'Close',
                            'click': function() {
                                dpa_VM.hideInputScreen();
                                setupForm.alpaca('destroy');
                            }
                        }
                    }
                }
            },
            //setup droppable
            'postRender': function (form) {

            //loop through all input forms and make them droppable
                form.getFieldEl().find('.alpaca-container-item').each(function(i, item) {
                    $(item).droppable({
                        'greedy':true,
                        'tolerance': 'pointer',
                        'drop': function( event, ui ) {

                            var draggable = $(ui.draggable);
                            //get item to add

                            var itemTemp =  ko.utils.domData.get(ui.draggable[0], 'ko_dragItem');

                            //set to source field to intelligence reference
                            $(this).find('input').val(itemTemp.src);

                        }
                        // 'over': function (event, ui ) {
                        //     $(event.target).addClass('dropzone-hover');
                        // },
                        // 'out': function (event, ui) {
                        //     $(event.target).removeClass('dropzone-hover');
                        // }
                    });
                //make div droppable
                //
                // var containerEl = this;
                // $(containerEl).children('.alpaca-container-item').each(function() {
                //     $(this).after("<div class='dropzone'></div>");
                // });

                });



            }
        });
    },



    hideInputScreen: function () {
        dpa_VM.showInputScreen(false);
    },
    // /**
    //  * Handles drop event for droppable input element
    //  * @param {object} item - template type and subtype are passed in as arguments via the draggable binding in the flex_epa view
    //  * @param {object} event
    //  * @param {object} ui
    //  */
    // dropToInputScreen: function (item, event, ui){
    //     if (!event || !item) {
    //         console.warn('no item or event');
    //         return;
    //     }
    //
    //     var result = dpa_VM.addEntry(item.templateType, item.subtype, item.renderType, item.src, item.isBR);
    //
    //     //get coordinate for paper
    //     var localPoint = dpa_VM.patternPaper.clientToLocalPoint({ x: event.clientX, y: event.clientY });
    //     //add element to page
    //     var element = dexit.epm.epa.integration.createElement(localPoint,result);
    //
    //     if (element instanceof Error){
    //         return;
    //     }
    //     dpa_VM.currentItem = element;
    //     dpa_VM.graph.addCell(element);
    //
    // },

    // /**
    //  * adds directed link between 2 jointjs elements
    //  * @param source
    //  * @param target
    //  * @param label
    //  * @param vertices
    //  * @return {*}
    //  */
    // linkElements: function (source, target, label, vertices) {
    //
    //     var graph = dexit.epm.epa.integration.graph;
    //     var cell = new joint.shapes.fsa.Arrow({
    //         source: { id: source.id },
    //         target: { id: target.id },
    //         labels: [{ position: .5, attrs: { text: { text: label || '', 'font-weight': 'bold' } } }],
    //         vertices: vertices || []
    //     });
    //     graph.addCell(cell);
    //     return cell;
    // },




    // generate CSS rules for each engagement point (simple services to start)
    /**
     * [addEptRules description]
     * @param {style sheet} sheet => main ICE4M style sheet
     * @param {string} selector => the current ept name
     * @param {css rules} rules => a list of all the rules in the css doc
     * @param {number} index => where the rules are being added (beginning or end of the sheet - default is end)
     */
    addEptRules : function(sheet, selector, rules, index) {
        if('insertRule' in sheet) {
            sheet.insertRule(selector + '{' + rules + '}', index);
        }
        else if('addRule' in sheet) {
            sheet.addRule(selector, rules, index);
        }
    },

    buildTemplates: function(items) {
        _.each(items, function(component) {
            // check to see if this template exists already
            if (dpa_VM.eptTemplates.indexOf(component.subType) >-1) {
                return;
            } else {
                // generate template
                //holds e-service or business-r or business-i, or image
                var cssClass ='';
                if (component.type === 'behaviour') {
                    if (component.eptName && component.eptName ==='Business Rule') {//BR
                        cssClass = 'business-r';
                    }else {
                        cssClass = 'e-service';
                    }
                }
                if (component.type === 'br') {
                    cssClass = 'business-r';
                }

                var eptWrapper = document.createElement('script');
                var eptTemplate ='<div class="ep-item ' + cssClass + ' draggable-item html-element">';

                // TODO => this needs to be updated to reflect the changes in the view. can't base switch on specific ept type
                if (component.iconType === 'null') {
                    var imageString = '<img class="voucher-large" src="images/' + component.imageName + '" alt="large voucher image">';

                    eptTemplate += imageString + '<div><span data-bind="text:$data.prefix"></span>' + component.renderText + '</div></div>';
                } else {

                    if (component.eptName && component.eptName ==='Business Rule') {//BR
                        eptTemplate += '<i class="' + component.iconType + '" aria-hidden="true"></i><span data-bind="text:$data.prefix"></span><div>'+component.renderText+'</div></div>';
                    }else {

                        eptTemplate += '<i class="' + component.iconType + '" aria-hidden="true"></i><div><span data-bind="text:$data.prefix"></span>' + component.renderText + '</div></div>';
                    }
                }

                eptWrapper.type = 'text/html';
                eptWrapper.id = component.subType;
                eptWrapper.innerHTML = eptTemplate;

                // generate styles
                if (component.subType && component.renderColor) {
                    dpa_VM.addEptRules(dpa_VM.eptSheet, '.' + component.subType + '-wrapper, .ep-components .' + component.subType + ', .asset-ref .' + component.subType, 'background-color:' + component.renderColor +'; border: 2px solid ' + tinycolor(component.renderColor.split(' ')[0]).darken(12).toString() + ' !important;', 1);

                    dpa_VM.addEptRules(dpa_VM.eptSheet, '.' + component.subType + '-wrapper .delete-button', 'background-color:' + tinycolor(component.renderColor.split(' ')[0]).darken(12).toString() +' !important;', 1);

                    // add jquery ui draggable classes
                    dpa_VM.addEptRules(dpa_VM.eptSheet, '.' + component.subType + '.ui-draggable-dragging', 'background-color:' + component.renderColor + '; border: 2px solid ' + tinycolor(component.renderColor.split(' ')[0]).darken(12).toString() + ' !important;',  1);
                }

                document.body.append(eptWrapper);

                dpa_VM.eptTemplates.push(component.subType);
            }
        });
    },




    buildMenuTemplates: function() {

        var items = dpa_VM.topLevelComponents();


        _.each(items, function(component) {

            var id = component.subType + '-menu';

            // check to see if this template exists already
            if (dpa_VM.menuTemplates.indexOf(id) >-1) {
                return;
            } else {
                // generate template
                //holds e-service or business-r
                var cssClass ='';
                if (component.type === 'behaviour') {
                    if (component.eptName && component.eptName ==='Business Rule') {//BR
                        cssClass = 'business-r';
                    }else {
                        cssClass = 'e-service';
                    }
                } else if (component.type === 'br') {
                    cssClass = 'business-r';
                }

                var eptWrapper = document.createElement('script');
                //Adding click here as template binding
                //TODO: clean-up/simplify template building (as special ones are not needed anymore since those are attributes)
                var eptTemplate ='<div class="ep-item ' + cssClass + '">';

                // TODO => this needs to be updated to reflect the changes in the view. can't base switch on specific ept type
                if (component.iconType === 'null') {
                    var imageString = '<img class="voucher-large" src="images/' + component.imageName + '" alt="image" aria-hidden="true">';

                    eptTemplate += imageString + '<div>' + component.renderText + '</div></div>';
                } else {

                    // if (component.eptName && component.eptName ==='Business Rule') {//BR
                    //     eptTemplate += '<i class="' + component.iconType + '" aria-hidden="true"></i><div>Business Rule</div></div>';
                    // } else {
                    eptTemplate += '<i class="' + component.iconType + '" aria-hidden="true"></i><div>' + component.renderText + '</div></div>';
                    // }
                }

                eptWrapper.type = 'text/html';
                eptWrapper.id = id;
                eptWrapper.innerHTML = eptTemplate;

                document.body.append(eptWrapper);

                dpa_VM.menuTemplates.push(id);
            }
        });
    },



    //
    // /**
    //  * generate dynamic UI elements based on the dragged service. this also generates styles based on the color assigned in the engagement point class. There is some processing for unique cases (should revisit these to make them conform to a standard)git
    //  */
    // buildTemplatesOld: function() {
    //
    //     _.each(dpa_VM.topLevelComponents(), function(component) {
    //         // check to see if this template exists already
    //         if (dpa_VM.eptTemplates.indexOf(component.subtype) >-1) {
    //             return;
    //         } else {
    //             // generate template
    //             var eptWrapper = document.createElement('script'),
    //                 eptTemplate = '<div class=\'beh-element-wrapper text-center ' + component.subtype + '-wrapper html-element\'>';
    //
    //
    //             // TODO => this needs to be updated to reflect the changes in the view. can't base switch on specific ept type
    //             if (component.iconType === 'null') {
    //                 var imageString = '<img class="voucher-large" src="images/' + component.imageName + '" alt="large voucher image">';
    //
    //                 eptTemplate += imageString + '<span class=\'beh-edit-message\'>' + component.renderText + '</span></div>';
    //             } else {
    //                 eptTemplate += '<i class=\'beh-main-icon ' + component.iconType + '\'></i><span class=\'beh-edit-message\'>' + component.renderText + '</span></div>';
    //             }
    //
    //             eptWrapper.type = 'text/html';
    //             eptWrapper.id = component.subtype;
    //             eptWrapper.innerHTML = eptTemplate;
    //
    //             // generate styles
    //             if (component.subtype && component.renderColor) {
    //                 dpa_VM.addEptRules(dpa_VM.eptSheet, '.' + component.subtype + '-wrapper, .ep-components .' + component.subtype + ', .asset-ref .' + component.subtype, 'background-color:' + component.renderColor +'; border: 2px solid ' + tinycolor(component.renderColor.split(' ')[0]).darken(12).toString() + ' !important;', 1);
    //
    //                 dpa_VM.addEptRules(dpa_VM.eptSheet, '.' + component.subtype + '-wrapper .delete-button', 'background-color:' + tinycolor(component.renderColor.split(' ')[0]).darken(12).toString() +' !important;', 1);
    //
    //                 // add jquery ui draggable classes
    //                 dpa_VM.addEptRules(dpa_VM.eptSheet, '.' + component.subtype + '.ui-draggable-dragging', 'background-color:' + component.renderColor + '; border: 2px solid ' + tinycolor(component.renderColor.split(' ')[0]).darken(12).toString() + ' !important;',  1);
    //             }
    //
    //             document.body.append(eptWrapper);
    //
    //             dpa_VM.eptTemplates.push(component.subtype);
    //         }
    //     });
    // },

    templateType : function(template) {
        // looks at the type property of each component and returns it as a reference for which html template to use (templates are in the class page view)
        return template.renderType;
    },


    /**
     *
     * @param {object} entry
     * @param {string} entry.type - element type ("multimedia", "behaviour", "intelligence")
     * @param {string} entry.subType - grouping for "behaviour" IE "evoucher" or "evoucher2" (TODO: remove and migrate to renderType)
     * @param {string} entry.[renderType] - used for picking render template
     * @param {string} entry.[src] - present for multimedia
     * @param {string} entry.[label] - present for type === 'multimedia' and subType ==='intelligence'
     * @param {boolean} [isBR]
     */
    prepareEntry : function(entry) {

        var elType = entry.type;
        var newObject,
            newPatternComponents = {
                type : elType,
                layout : '',
                inEvent: {events: []}
            };

        var subType = entry.subType || entry.subtype;
        var rendType = entry.renderType || subType;
        var isBR = entry.isBR;


        if (elType === 'multimedia') {
            newObject = {
                validComponent : ko.observable(false),
                elementType : elType,
                renderType : rendType,
                subType:subType,
                patternComponents : newPatternComponents,
                multiMediaList: ko.observableArray([])
            };

            // parse the type
            var mmtype = '';
            var mmSrc = entry.src;

            if (rendType && subType === 'intelligence') {
                mmtype = mmtype = rendType.split('-')[1];
                var placeholder = '';
                if (mmtype === 'video') {
                    placeholder = '/img/face_icon.png';
                } else if (mmtype === 'image') {
                    //hacky way to customize image : fixme does not work
                    if (entry.name && entry.name === 'accountUsage') {
                        placeholder = '/img/pie-chart.png';
                    } else if (entry.name && entry.name === 'picture') {
                        placeholder = '/img/userprofilepic.jpg';
                    } else {
                        placeholder = '/img/face_icon.png';
                    }
                } else {
                    placeholder = entry.name;
                }
                if (entry.intelRef) {
                    newObject.intelRef = entry.intelRef;
                    newObject.copyIntel = true;
                }


                newObject.multiMediaList.push({ type: mmtype, label:ko.observable(entry.name), placeholder: placeholder, value: ko.observable(mmSrc)});

            } else if (rendType && rendType.split('-')[1]){
                mmtype = rendType.split('-')[1];
                //var label = mmSrc.split('/').pop();
                //newObject.multiMediaList.push({ type: mmtype, label: ko.observable(label), value: ko.observable(mmSrc)});
                newObject.multiMediaList.push({ type: mmtype, label:ko.observable(), value: ko.observable(mmSrc)});
            }

            dpa_VM.updateLayoutProperty(newObject);

        } else if (elType === 'behaviour') {
            newObject = {
                validComponent : ko.observable(true),
                subType: subType,
                elementType : elType,
                renderType : rendType,
                patternComponents : newPatternComponents,
                isBR: isBR,
                behRef: entry,
                setupInputs: {}
            };
        } else if (elType === 'intelligence') {
            if(subType === 'report'){ //fixme
                newObject = {
                    validComponent : ko.observable(true),
                    elementType : elType,
                    subType: subType,
                    renderType : rendType,
                    patternComponents : newPatternComponents,
                    reportComponents: entry.src,
                    name:entry.name,
                    intelRef: entry
                };
                dpa_VM.referredIntelligence.push(entry.src);
            } else if (subType === 'engagement-pattern' || subType === 'dynamic-ept' || subType === 'dynamic-ept-params')  {
                newObject = {
                    validComponent : ko.observable(true),
                    elementType : elType,
                    subType: subType,
                    elementTag: '',
                    renderType : rendType,
                    patternComponents : newPatternComponents,
                    intelRef: entry,
                    name: entry.name
                };
            } else {
                console.warn('unrecognized intelligence element:%s', subType);
            }
        } else if (elType === 'br') {
            newObject = {
                validComponent : ko.observable(true),
                subType: subType,
                elementType : elType,
                renderType : rendType,
                patternComponents : newPatternComponents,
                isBR: isBR,
                behRef: entry,
                setupInputs: {}
            };
        }
        return newObject;

    },

    /**
     *
     * @param {string} elType - template type ("multimedia", "behaviour", "intelligence")
     * @param {string} subType - grouping for "behaviour" IE "evoucher" or "evoucher2" (TODO: remove and migrate to renderType)
     * @param {string} rendType - used for type of multimedia or behaviour subtype
     * @param {string|object} mmSrc - link to multimedia, for behaviour this is definition of behaviour
     * @param {boolean} isBR - flag if BR
     * @return {*} - TODO: return type(s) should be documented
     */
    addEntry : function(elType, subType, rendType, mmSrc, isBR) {
        var newObject,
            newPatternComponents = {
                id : '',
                type : elType,
                layout : '',
                inEvent: {events: []}
            };


        if (elType === 'multimedia') {
            newObject = {
                validComponent : ko.observable(false),
                elementType : elType,
                renderType : rendType,
                subType:subType,
                patternComponents : newPatternComponents,
                multiMediaList: ko.observableArray([])
            };

            // parse the type
            var mmtype = '';

            if (subType === 'intelligence' && rendType) {
                mmtype = mmtype = rendType.split('-')[1];

                newObject.multiMediaList.push({ type: mmtype, label:ko.observable(), value: ko.observable('/img/face_icon.png')});

            } else if (rendType && rendType.split('-')[1]){
                mmtype = rendType.split('-')[1];
                var label = mmSrc.split('/').pop();
                newObject.multiMediaList.push({ type: mmtype, label: ko.observable(label), value: ko.observable(mmSrc)});
            }

            dpa_VM.updateLayoutProperty(newObject);

        } else if (elType === 'behaviour') {
            newObject = {
                validComponent : ko.observable(true),
                subType: subType,
                elementType : elType,
                renderType : rendType,
                patternComponents : newPatternComponents,
                isBR: isBR,
                behRef: mmSrc,
                setupInputs: {}
            };
        } else if (elType === 'intelligence') {
            if(subType === 'report'){
                newObject = {
                    validComponent : ko.observable(true),
                    elementType : elType,
                    subType: subType,
                    renderType : rendType,
                    patternComponents : newPatternComponents,
                    reportComponents: mmSrc
                };
                dpa_VM.referredIntelligence.push(mmSrc);
            }
        }

        return newObject;
    },


    /**
     * Generates an id (uuid based)
     *
     */
    generateId: function () {
        //depends on uuid function in dex-sdk
        return joint.util.uuid();
    },


    // targetPopover : function(newClass, data, event, element) {
    //     dpa_VM.currentElement(data);
    //
    //     setTimeout(function() {
    //         $('.ep-auth-container .popover').addClass(newClass + '-popper');
    //
    //         if (element) {
    //             $('.ep-auth-container .popover').addClass('dec-popover');
    //         }
    //     }, 50);
    //
    //     // generate unique identifier for qs service using the Date object, push an object into the decision array
    //     if (newClass === 'qs' && element) {
    //
    //         // set a reference to the current EP element
    //         dpa_VM.currentElement(data);
    //
    //         // check for an existing related decision element
    //         if (data.decRef) {
    //             var decEl = _.find(dpa_VM.decisionElements(), {decRef : data.decRef});
    //             if (decEl) {
    //                 dpa_VM.editingDecision(true);
    //                 dpa_VM.addingDecision(true);
    //                 // populate decision element
    //                 dpa_VM.currentDecision = decEl;
    //
    //                 if (decEl.selectedAnswer() !== null) {
    //                     dpa_VM.matchAnswer(decEl.selectedAnswer());
    //                     dpa_VM.answerSelected(true);
    //                 }
    //
    //             }
    //         } else {
    //             var decisionReference = dpa_VM.generateRandomSlug() + '_' + new Date().getMilliseconds();
    //
    //             data.decRef = decisionReference;
    //             dpa_VM.generateDecision(decisionReference);
    //         }
    //     }
    // },

    // ---- begin business rule specific functions ------ //



    // generateDecision : function(reference) {
    //     dpa_VM.addingDecision(true);
    //
    //     dpa_VM.decisionElements.push({
    //         decRef : reference,
    //
    //         path1 : {
    //             patternComponents : {
    //                 id :   dpa_VM.generateId(),
    //                 layout : ''
    //             },
    //
    //             imageCounter : 0,
    //             videoCounter : 0,
    //             textCounter : 0,
    //             linksCounter : 0,
    //             multiMediaList: ko.observableArray([])
    //         },
    //
    //         path2 : {
    //             patternComponents : {
    //                 id : dpa_VM.generateId(),
    //                 layout : ''
    //             },
    //
    //             imageCounter : 0,
    //             videoCounter : 0,
    //             textCounter : 0,
    //             linksCounter : 0,
    //             multiMediaList: ko.observableArray([])
    //         },
    //
    //         selectedAnswer : ko.observable(null)
    //     });
    //
    //     dpa_VM.currentDecision = _.find(dpa_VM.decisionElements(), { decRef : reference });
    // },

    closePopover : function() {
        $('.popover').popover('destroy');
    },


    editTextInWindow : function(text, path) {
        // open text panel and edit the text? or do this another way

        dpa_VM.currentPath = path;
        $('.flex-text-add').trigger('focus').val(text);

        dpa_VM.editingDecisionText(true);
    },

    showTextReference : function(text, path) {
        // populate placeholder with text element
        var assetPath = (path === 'path1') ? 0 : 1;

        var textIcon, editButton, editLabel, editText,
            targetDiv = document.querySelectorAll('.asset-ref')[assetPath];

        targetDiv.classList.remove('showAsset');

        // create elements needed to display text stuff
        textIcon = document.createElement('i');
        textIcon.classList.add('fa', 'fa-font', 'flex-doc-icon', 'asset-ref-txt');

        // create text preview
        editText = document.createElement('p');
        editText.innerHTML = text.substring(0, 48) + '...';
        editText.classList.add('flex-text-sample', 'asset-ref-sample');

        // create edit button
        editButton = document.createElement('i');
        editButton.classList.add('fa', 'fa-edit', 'flex-beh-edit', 'asset-txt-edit');

        editButton.addEventListener('click', function() { dpa_VM.editTextInWindow(text, path); }, false);

        // add edit label
        editLabel = document.createElement('span');
        editLabel.innerHTML = 'Edit Details';
        editLabel.classList.add('beh-edit-message', 'txt-edit-message', 'asset-ref-label');

        // replace the reference icon
        if (targetDiv) {
            while (targetDiv.firstChild) {
                targetDiv.removeChild(targetDiv.firstChild);
            }

            targetDiv.classList.add('flex-txt-wrapper');
            targetDiv.appendChild(textIcon);
            targetDiv.appendChild(editText);
            targetDiv.appendChild(editButton);
            targetDiv.appendChild(editLabel);
            targetDiv.classList.add('showAsset');
        }
    },


    // ---- end business rule specific functions ------ //

    // /**
    //  * Adds additional multimedia to the current element
    //  */
    // addFromEdit : function() {
    //     var editingPanelList = document.querySelector('.flex-element-list');
    //
    //     //add to current element
    //     dpa_VM.currentElement().multiMediaList.push(dpa_VM.newEditEntry);
    //
    //     dpa_VM.updateLayoutProperty(dpa_VM.currentElement());
    //
    //     editingPanelList.scrollTop = editingPanelList.scrollHeight;
    // },

    getUsersPerRoom : function(element, data) {
        // return users / rooms
        var tempNumberOfUsers = data.chatComponents.users().length, numUsers;

        numUsers = tempNumberOfUsers / data.chatComponents.numberOfRooms();
        numUsers = numUsers < 0 ? 1 : Math.ceil(numUsers);

        element.nextElementSibling.innerHTML = '(' + numUsers + ' users per room)';
    },

    /**
     *
     * @param {object} item - template type and subtype are passed in as arguments
     * @param {string} type - used to build item to be added (type of SC element)
     * @param {string} subtype - used to determine template to render when renderType is not selected
     * @param {string} [renderType] - used to determine template to render (not included for behaviour or BR)
     * @param {boolean} [isBR]
     *
     */
    addItem: function(item) {

        if (!item) {
            console.warn('no item');
            return;
        }

        // var renderType = item.renderType || item.subtype;
        // var src;
        // if (item.type === 'behaviour') {
        //     src = item;
        // }else {
        //     src = item.src;
        // }

        var result = dpa_VM.prepareEntry(item);

        // var result = dpa_VM.addEntry(item.type, item.subtype, renderType, src, item.isBR);


        //determine x,y to add element
        var localPoint = dpa_VM._determineAddElementCoordinates();
        var element = dexit.epm.epa.integration.createElement(localPoint,result);

        if (element instanceof Error){
            return;
        }
        dpa_VM.currentItem = element;
        dpa_VM.graph.addCell(element);

    },

    _determineAddElementCoordinates: function() {
        return { x: 10, y: 10 };
    },

    afterAddHandler : function(el, index, item) {

        dpa_VM.currentItem = el;
        // dpa_VM.counter ++;
        //
        // // try to add binding handler here
        // $('.ep-auth-container').popover().off('shown.bs.popover').on('shown.bs.popover', function() {
        //     var removeDec = document.querySelector('.remove-decision'),
        //         removeRule = document.querySelector('.remove-rule');
        //
        //     if (removeDec) {
        //         ko.applyBindings(dpa_VM, removeDec);
        //
        //         // readjust top offset because somehow it's breaking with dynamic positioning
        //         removeDec.parentNode.parentNode.style.top = Math.floor(parseFloat(removeDec.parentNode.parentNode.style.top) + 143) + 'px';
        //
        //         setTimeout(function() {
        //             removeDec.parentNode.parentNode.classList.remove('dec-popover');
        //         }, 500);
        //
        //     }
        //
        //     if (removeRule) {
        //         ko.applyBindings(dpa_VM, removeRule);
        //     }
        // });
    },

    trackMoved : function() {

    },


    removeItem : function(node, index, item) {

        // handle removing item from DOM
        $(node).remove();
    },

    redrawLines : function() {

    },

    removeEntry : function(entry) {
        $('.popover').popover('hide');

        if (dpa_VM.counter > 0) {
            dpa_VM.counter --;
        }
    },

    // //build / struture object for export
    // updateEntry : function(entry) {
    //     // handle dropping an image or video on a mm component
    //     if (dpa_VM.droppedElementType() === 'img' || dpa_VM.droppedElementType() === 'video') {
    //
    //         entry.multiMediaList.push({
    //             type: event.dataTransfer.getData('mediatype'),
    //             value: ko.observable(event.dataTransfer.getData('src'))
    //         });
    //
    //         dpa_VM.updateLayoutProperty(entry);
    //
    //     }
    // },
    availableVideoTransitions: ko.observableArray([]),


    getAvailableVideoTransitions: function (element) {
        var elementId = element.model.attributes.id;
        var graph = dexit.epm.epa.integration.graph;

        var toShow = [];


        _.each(graph.getElements(), function (entry) {
            //skip current
            if(entry.id !== elementId){
                var isVideo = (entry.attributes.multiMediaList && entry.attributes.multiMediaList() && entry.attributes.multiMediaList().length > 0 && entry.attributes.multiMediaList()[0].type === 'video');
                if (isVideo) {
                    var videoElementId = entry.attributes.id;
                    var name = entry.attributes.multiMediaList()[0].type;
                    var label = entry.attributes.multiMediaList()[0].label();
                    toShow.push({elementId:videoElementId, label:label, name:name, events:['percent played', 'start', 'end', 'seek', 'play', 'pause', 'volumeChange', 'error', 'enter fullscreen','exit fullscreen']});
                }


                //if a eService with events
                if (entry.attributes && entry.attributes.behRef) {
                    var elemId = entry.attributes.id;
                    var behId = (entry.attributes.behRef.behId || entry.attributes.behRef.ds.id);
                    //toShow.push({elementId:behId, label:entry.attributes.behRef.renderText, name:'Behaviour', events:['once']});
                    toShow.push({elementId:elemId, label:entry.attributes.behRef.renderText, name:'Behaviour', events:['submit','complete']});
                   // toShow.push({elementId:behId, label:entry.attributes.behRef.renderText, name:'Behaviour', events:['once']});
                }



            }
        });
        dpa_VM.availableVideoTransitions(toShow);
    },
    availableVideoEvents: ko.observableArray([]),
    availableTimes: ko.observableArray([5,10,15,20,25,30,35,40,45,50,55,60]),
    getAvailableVideoEvents: function (element) {
        var elementId = element.model.attributes.id;
        var graph = dexit.epm.epa.integration.graph;

        var toShow = [];
        var times = [5,10,15,20,25,30,35,40,45,50,55,60];


        _.each(graph.getElements(), function (entry) {
            //skip current
            if(entry.id !== elementId){

                debugger;

                var isVideo = (entry.attributes.multiMediaList && entry.attributes.multiMediaList() && entry.attributes.multiMediaList().length > 0 && entry.attributes.multiMediaList()[0].type === 'video');
                if (isVideo) {
                    var events = entry.attributes.events || times;
                    var videoElementId = entry.attributes.id;
                    var name = 'played';
                    var label = entry.attributes.multiMediaList()[0].label();
                    toShow.push({elementId:videoElementId, label:label, name:name, events:events});
                }

                //if a eService with events
                if (entry.attributes && entry.attributes.behRef) {
                    var behId = (entry.attributes.behRef.behId || entry.attributes.behRef.ds.id);
                    var elemId = entry.attributes.id;
                    toShow.push({elementId:elemId, label:'status', name:'status', events:['submit','complete']});
                    //toShow.push({elementId:behId, label:'status', name:'status', events:['submit','complete']});
                    //toShow.push({elementId:behId, label:'complete', name:'complete', events:['once']});
                }

            }
        });

        dpa_VM.availableVideoEvents(toShow);
    },


    defaultEventGens: ko.observableArray(['Timer','Click']),
    //available event generators
    availableEventGens: ko.observableArray(['Video']),

    /**
     * Hide select transition screen
     */
    hideTransitionScreen : function() {
        dpa_VM.addEvent(false);
        dpa_VM.selectedEvent();
    },
    /**
     * Show select transition screen
     */
    openTransitionScreen: function(currElement){
        dpa_VM.selectedEvent();
        dpa_VM.eventTime();
        dpa_VM.editEntry(currElement.attributes);
    },
    setEvent: function(){
        //find the next element and update the time to element property
        var elementId = dpa_VM.currentElement().id;
        var graph = dexit.epm.epa.integration.graph;
        _.each(graph.getElements(), function (entry) {
            if(entry.id === elementId){
                var currInEvent = {source: dpa_VM.selectedEvent()};
                switch (currInEvent.source) {
                    case 'Timer':
                        currInEvent.name = 'timer';
                        currInEvent.args = dpa_VM.eventTime()+dpa_VM.selectedTime();
                        break;
                    case 'Click':
                        currInEvent.name = 'bcc.click';
                        currInEvent.args = {};
                        break;

                }
                //just push latest event
                entry.attributes.patternComponents.inEvent.events = [currInEvent];
            }
        });

        dpa_VM.hideTransitionScreen();

    },
    editEntry : function(entry, type) {
        var targetEl;
        //open event page
        targetEl  = document.querySelector('.component-contents-reveal');
        dpa_VM.currentElement(entry);
        dpa_VM.addEvent(true);
    },

    openAnimDone : function(el, event) {
        // remove hidden class from element
        el.querySelector('.flex-edit-drop').classList.add('flex-drop-reveal');
        el.removeEventListener('transitionend', function() { dpa_VM.openAnimDone(el); }, false);
    },

    // edit MM components (editing mode in the UI) => entry refers to the corresponding property in the object's MM array
    // updateCurrentItem : function(entry, event) {
    //
    //     event = (event.dataTransfer === undefined) ? event.originalEvent : event;
    //
    //     var mediaType = event.dataTransfer.getData('mediatype'),
    //         mm = event.currentTarget.querySelector('.flex-edit-item'),
    //         mmName = event.currentTarget.nextElementSibling.firstChild;
    //
    //     // update underlying object
    //     entry.type = mediaType;
    //     entry.value(event.dataTransfer.getData('src'));
    //
    //     // updating MM => image or video
    //     if (mediaType === 'image') {
    //         if (mm.nodeName.toLowerCase() === 'img') {
    //             mm.src = entry.value();
    //         } else {
    //             var newImgEl = document.createElement('img');
    //
    //             newImgEl.src = entry.value();
    //             newImgEl.alt = 'lecture asset';
    //             newImgEl.classList.add('flex-edit-item');
    //
    //             event.currentTarget.replaceChild(newImgEl, mm);
    //         }
    //
    //         mmName.nodeValue = entry.value().substring(entry.value().lastIndexOf('/') + 1);
    //
    //     } else if (mediaType === 'video') {
    //         if (mm.nodeName.toLowerCase() === 'video') {
    //             mm.querySelector('source').src = entry.value();
    //             mm.load();
    //         } else {
    //             var newVideoEl = document.createElement('video'),
    //                 vidSource = document.createElement('source');
    //
    //             vidSource.src = entry.value();
    //             newVideoEl.appendChild(vidSource);
    //             newVideoEl.load();
    //             newVideoEl.controls = true;
    //             newVideoEl.classList.add('flex-edit-item');
    //
    //             event.currentTarget.replaceChild(newVideoEl, mm);
    //         }
    //
    //         mmName.nodeValue = entry.value().substring(entry.value().lastIndexOf('/') + 1);
    //
    //     } else if (mediaType === 'link') {
    //         if (mm.firstElementChild.nodeName.toLowerCase() === 'img') {
    //             entry.value(event.dataTransfer.getData('src'));
    //             mmName.nodeValue = entry.value().substring(entry.value().lastIndexOf('/') + 1);
    //         } else {
    //             //pop some kind of alert here? can't drop a link on a non-link element
    //             return;
    //         }
    //     }
    //
    //     dpa_VM.checkTemplate(dpa_VM.currentElement());
    //     dpa_VM.updateLayoutProperty(dpa_VM.currentElement());
    // },
    updateLayoutProperty : function(entry) {
        entry.imageCounter = entry.videoCounter = entry.textCounter = entry.linksCounter = 0;
        entry.patternComponents.layout = '';
        // build html layout property
        _.each(entry.multiMediaList(), function(item) {

            switch (item.type) {
                case 'video':
                    entry.patternComponents.layout += '<video controls><source data-mm-tag=\'ep-' + entry.patternComponents.id + '-mm-video-' + entry.videoCounter + '\' src=\'' + item.value() + '\' type=\'video/mp4\'/></video>';
                    entry.videoCounter ++;
                    break;

                case 'image':
                    entry.patternComponents.layout += '<img src=\'' + item.value() + '\' alt=\'element mm\' data-mm-tag=\'ep-' + entry.patternComponents.id + '-mm-image-' + entry.imageCounter + '\'>';
                    entry.imageCounter ++;
                    break;

                case 'link':
                    entry.patternComponents.layout += '<span data-type=\'text\' data-mm-tag=\'ep-' + entry.patternComponents.id + '-mm-links-' + (entry.linksCounter+100) + '\'>' + item.value() + '</span>';
                    entry.linksCounter ++;
                    break;

                case 'text':
                    entry.patternComponents.layout += '<textarea data-type=\'text\' data-mm-tag=\'ep-' + entry.patternComponents.id + '-mm-text-' + entry.textCounter + '\'>' + item.value() + '</textarea>';
                    entry.textCounter ++;
                    break;
            }
        });
    },
    editTextBlock : function(data, event) {
        data.value(event.currentTarget.value);
    },
    addTextAsMM : function() {
        var textToAdd = dpa_VM.textInput();
        var textObject;
        // var textToAdd = $('.flex-text-add').val(), textObject;

        if (textToAdd.trim() === '') { return; }

        // if (dpa_VM.editingDecisionText() === true) {
        //     dpa_VM.currentDecision[dpa_VM.currentPath].multiMediaList()[0].value(textToAdd);
        //     dpa_VM.closeTextBlock();
        //     dpa_VM.editingDecisionText(false);
        //     $('#' + dpa_VM.currentPath).find('p').text(textToAdd.substring(0, 48) + '...');
        //     return;
        // }

        if (dpa_VM.editingItem() === true) {
            dpa_VM.newEditEntry = { type: 'text', value: ko.observable(textToAdd) };
            dpa_VM.addFromEdit();
        } else {
            // if this is a new element, then pass it through addEntry
            textObject = dpa_VM.addEntry('multimedia', null, 'flex-text', textToAdd);

            // add the new text element and draw connector lines
            var localPoint = {x:100, y:100};
            var element = dexit.epm.epa.integration.createElement(localPoint,textObject);

            if (element instanceof Error){
                return;
            }
            dpa_VM.currentItem = element;
            var graph = dexit.epm.epa.integration.graph;
            graph.addCell(element);


        }
        dpa_VM.textInput('');
        // close the text panel
        //dpa_VM.closeTextBlock();
    },
    dragStarted : function(data, event, element, parent) {

        if (dpa_VM.addingDecision() === true) {
            dpa_VM.draggedBehaviour = data;
            dpa_VM.draggedElement = element;
        }

        event = (event.dataTransfer === undefined) ? event.originalEvent : event;

        if (element.dataset.vidsrc) {
            event.dataTransfer.setData('src', element.dataset.vidsrc);
            event.dataTransfer.setData('mediatype', 'video');
            dpa_VM.droppedElementType('video');

            if (dpa_VM.editingItem() === true) {
                dpa_VM.newEditEntry = { type: 'video', value: ko.observable(element.dataset.vidsrc) };
            }
        } else if (element.dataset.docsrc) {
            event.dataTransfer.setData('mediatype', 'link');
            event.dataTransfer.setData('src', element.dataset.docsrc);
            dpa_VM.droppedElementType('img');


            if (dpa_VM.editingItem() === true) {
                dpa_VM.newEditEntry = { type: 'link', value: ko.observable(element.dataset.docsrc) };
            }
        } else {
            event.dataTransfer.setData('mediatype', 'image');
            event.dataTransfer.setData('src', element.src);
            dpa_VM.droppedElementType('img');

            if (dpa_VM.editingItem() === true) {
                dpa_VM.newEditEntry = { type: 'image', value: ko.observable(element.src) };
            }
        }
        return true;
    },
    allowDragOver : function(data, event) {
        event.preventDefault();
    },
    generateRandomSlug : function() {
        // generate a random string for the slug => needs to be unique
        return (Math.random().toString(36).substring(2, 10)); //no duplicates in a test set of 1 million;
    },
    hidePopover : function(targetPopover, event) {
        if (!targetPopover) {
            targetPopover = $(event.currentTarget).parents('.popover');
        }

        setTimeout(function() {
            targetPopover.popover('hide');
        }, 750);
    },
    endedFunction : function() {
        // clear panel content here, stop all videos if playing
        _.each(document.querySelectorAll('video'), function(video) {
            video.pause();
            video.currentTime = 0;
        });

        this.removeEventListener('transitionend', dpa_VM.endedFunction, false);
    },
    hideContent : function() {
        var targetEl  = document.querySelector('.component-contents-reveal');

        targetEl.querySelector('.flex-edit-drop').classList.remove('flex-drop-reveal');

        targetEl.addEventListener('transitionend', dpa_VM.endedFunction, false);
        dpa_VM.editingItem(false);
    },
    // validation scripts: TODO
    validation : {


        /**
         *
         * @param {object} setupInputs
         * @param {object} setupConfig
         * @param {object} setupConfig.init
         * @param {object} setupConfig.init.schemaTemplate
         */
        validateBehaviourWithSetup: function (setupInputs, setupConfig) {
            if (setupConfig && setupConfig.init && setupConfig.init.hasUI && setupConfig.init.hasUI == true) {

                return true;
            }
            if(_.isEmpty(setupInputs)) {
                return false;
            }
            var setupSchema = (setupConfig.init.schemaTemplate && setupConfig.init.schemaTemplate.schema ? setupConfig.init.schemaTemplate.schema : setupConfig.init.schemaTemplate);
            var ajv = new Ajv({validateSchema:false});
            var valid = ajv.validate(setupSchema, setupInputs);
            if (!valid) {
                console.log(ajv.errors);
            }
            return valid;
        },

        validateGraph: function () {
            if (dpa_VM.graph && dpa_VM.graph.getCells().length > 2) {
                var cells = dpa_VM.graph.getCells();
                //check all cells and find first bad one
                var filtered = _.filter(cells, function (cell) {
                    if (cell.attributes && cell.attributes.type !== 'epa.HTMLElement') {
                        return true;
                    } else if (cell.attributes && cell.attributes.behRef && cell.attributes.behRef.ds && cell.attributes.behRef.ds.setup && cell.attributes.behRef.ds.setup.init && !_.isEmpty(cell.attributes.behRef.ds.setup.init)) {
                        //ch

                        return dpa_VM.validation.validateBehaviourWithSetup(cell.attributes.setupInputs,cell.attributes.behRef.ds.setup);
                    } else if (cell.attributes && cell.attributes.elementType && cell.attributes.elementType === 'br' && cell.attributes.setupBR) {

                        return cell.attributes.setupBR.isValid;
                    } else {
                        return true;
                    }
                });
                return (filtered && filtered.length === cells.length);
            } else {
                return false;
            }

        }
        // validateTouchpoints: function() {
        //     if (dpa_VM.selectedTouchpoints().length > 0) {
        //         return true;
        //     }
        //     return false;
        // },
        // make sure there's at least one type of multimedia in the element
        // validateMM : function(element) {
        //     // could rework this to return the observable with an expression as its value
        //     if (element.multiMediaList().length > 0) {
        //         element.validComponent(true);
        //     } else {
        //         element.validComponent(false);
        //     }
        //     return element.validComponent();
        // },

    },

    // relayout: function() {
    //     if (dpa_VM.patternPaper) {
    //         dpa_VM.patternPaper.scaleContentToFit();
    //     }
    // }

};


// enable or disable the create button => as long as each element is valid, then from the UI side the pattern can be created
dpa_VM.enableDynamicButton = ko.computed(function() {

    //FIXME: element.validComponent() is coming back undefined sometimes
    // var results = _.filter(dpa_VM.generatedStructure(), function(element) {
    // 	return element.validComponent() === false;
    // });


    if (dpa_VM.selectedTouchpoints().length > 0 && dpa_VM.validTitle() === true) {
        return true;
    }

    //(XY):remove the dynamic object checking, should find a new way to verify the structure
    //var results = 0;
    //return (dpa_VM.selectedTouchpoints().length > 0 && dpa_VM.validTitle() === true && dpa_VM.validation.validateGraph() === true);
});

// ko.bindingHandlers.sortable.options.over = function(event, ui) {
//     if (ui.helper.context.nodeName.toLowerCase() === 'img') {
//         ui.sender.find('img').last().width(88);
//     }
// };

window.addEventListener('resize', _.debounce(function() { dpa_VM.resizeGraph(); },200), false);
