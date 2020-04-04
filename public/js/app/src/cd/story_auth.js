/**
 * @copyright Digital Engagement Xperience 2017
 *
 */
/* global grapesjs, dexit, _, async, joint, dpa_VM */


/**
 * @typedef {object} LayoutInfo
 * @param {string} layoutId - layout identifier (TODO remove layoutId there is no bound observable)
 * @param {string} layoutId - layout identifier (TODO remove layoutId there is no bound observable)
 * @param {string} id - layout identifier  (same as layoutId)
 * @param {string} thumbnail - icon path to svg
 * @param {string} layoutMarkup - html markup for layout
 * @param {string} templateCss - comma seperated string of css to load for template editing
 * @param {string[]} regions - region list
 */

/**
 * @typedef {object} TPsAndLayout
 * @property {object} touchpoint
 * @property {LayoutInfo[]} layouts
 */


/**
 *
 * VM for Content Design
 */
var storyboard_VM = {



    /**
     * @type {ko.observableArray<TPsAndLayouts>}
     */
    availableTPsAndLayouts: ko.observableArray(),
    mode: ko.observable(),//mode can be one of: 'layout', 'allocation', 'design'
    editor: null,
    currentEP:null,
    currentSC:null,
    showEditScreen: ko.observable(false),

    //toggles display of layout selection modal
    selectLayoutModalVisible:ko.observable(),

    //toggles display (and behaviour of CD)
    externalCMSMode: ko.observable(false),
    /**
     * has tpId and icon
     */
    selectedTouchpoint: ko.observable(),

    availableLayouts: ko.observableArray(),

    layoutSelectionMode: ko.observable('layout'),

    availableTemplateLayouts: ko.pureComputed(function() {

        var layoutMode = storyboard_VM.layoutSelectionMode();
        var group = '';
        if (layoutMode.indexOf('-') > -1 ) {
            group = layoutMode.split('-')[1];
        }


        return ko.utils.arrayFilter(storyboard_VM.availableLayouts(), function (val) {

            if (val && val.layoutId && group) {

                var prefix = val.layoutId.split('-')[0];
                return (prefix === group && val && val.isTemplate);
            } else {
                return (val && val.isTemplate);
            }

        });



    }),

    availableRawLayouts: ko.pureComputed(function () {
        return ko.utils.arrayFilter(storyboard_VM.availableLayouts(), function (val) {
            return (val && !val.isTemplate);
        });
    }),
    //used to hold the selected layout from the modal
    tempSelectedLayout: ko.observable(),


    enableSendForApproval: ko.pureComputed(function () {
        //should only be enabled when
        return true;
    }),

    showLayoutSelection: function(data, data2){
        //set selected TP
        storyboard_VM.availableLayouts([]);
        storyboard_VM.selectedTouchpoint(data.touchpoint);
        var found = storyboard_VM.availableTPsAndLayouts().find(function(val){
            return (val.touchpoint && val.touchpoint.tpId  === storyboard_VM.selectedTouchpoint().tpId);
        });
        var layouts = (found ? found.layouts : []);
        storyboard_VM.availableLayouts(layouts);
        storyboard_VM.layoutSelectionWarning('');

        // storyboard_VM.mode('layout');
        // storyboard_VM.showEditScreen(true);
        storyboard_VM.selectLayoutModalVisible(true);
    },
    layoutSelectionWarning: ko.observable(),
    containsPlaceholderMultimedia: ko.pureComputed(function () {
        return (storyboard_VM.placeholderElemAndMultimedia() && storyboard_VM.placeholderElemAndMultimedia().length > 0);
    }),
    placeholderElemAndMultimedia: ko.observableArray([]),
    showPlaceholderSelection: ko.observable(false),
    availableMultimedia: ko.observableArray([]),

    availableImages: ko.observable([]),
    availableVideos: ko.observable([]),
    availableDocuments: ko.observable([]),

    showSetMultimediaPlaceholders:function(){
        storyboard_VM.showPlaceholderSelection(true);
    },

    _loadProgramModel: function(ppId, ppObj, callback) {
        if (ppId) {
            var resource = '/plan-diagram/' + ppId;
            var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
            restStrategy.retrieve(function (err, result) {
                if (err) {
                    alert('could not find diagram:' + ppId);
                    return callback(err);
                }
                var epObject = campaignPlannerVm.parsePPObjectSafely(result.data);

                callback(null, epObject);
            });
        } else {
            if (_.isString(ppObj)) {
                // eslint-disable-next-line no-undef
                ppObj = campaignPlannerVm.parsePPObjectSafely(ppObj);
            }
            callback(null,ppObj);
        }
    },

    saveAllocationForMultimediaPlaceholders: function(){

        var pending = _.find(storyboard_VM.placeholderElemAndMultimedia(), function(val) {
            var va = val.selectedMM();
            return (!va);
        });
        if (pending){
            alert('make sure all placeholder multimedia is replaced');
            return;
        }


        storyboard_VM.showPlaceholderSelection(false);
        debugger;
        var toUpdate = _.map(storyboard_VM.placeholderElemAndMultimedia(), function (val) {
            return {
                elementId: val.id,
                mmValue: val.selectedMM().url,
                mmType: (val.selectedMM().type || val.selectedMM().mediaType),
                mmId: val.selectedMM().id
            }
        });

        //add tag for mm to campaign

        var graph = new joint.dia.Graph();
        storyboard_VM.loadEPUIObject(storyboard_VM.epGraph, graph);




        //get the tag for program and campaign
        var appTags = [];

        //if the campaign has a tag, find if from the modal
        //TODO: save tag with EP
        var foundMMTag = null;
        var ppObjStr = storyboard_VM.bcInstanceVM.businessConceptInstance.property.ppObject;
        var ppId = storyboard_VM.bcInstanceVM.businessConceptInstance.property.ppId;


        storyboard_VM._loadProgramModel(ppId, ppObjStr, function(err, obj) {



            if (obj || !err) {

                //now find campaign and tag

                _.each(obj.cells, function (cell) {
                    if (cell.definition && cell.definition.approved
                        && storyboard_VM.currentEP
                        && cell.definition.data && cell.definition.data.mmTag
                        && cell.definition.epId && cell.definition.epId == storyboard_VM.currentEP.id
                        && cell.definition.epRevision && cell.definition.epRevision == storyboard_VM.currentEP.revision) {
                        //update the scId and epId and epRevision
                        foundMMTag = cell.definition.data.mmTag;
                    }
                });
            }

            if (foundMMTag) {
                appTags.push(foundMMTag);
            }



            if (storyboard_VM.currentSC.property && storyboard_VM.currentSC.property.mmTag) {
                appTags.push(storyboard_VM.currentSC.property.mmTag);
            }





            if (storyboard_VM.bcInstanceVM.mmTag()) {
                appTags.push(storyboard_VM.bcInstanceVM.mmTag());
            }


            var scMultimediaToUpdate = [];

            _.each(toUpdate, function (val) {

                var tags =  appTags.concat([val.mmType]);


                dexit.app.ice.integration.filemanagement.addAppTagsByFileName(val.mmId,tags, function (err) {
                    if (err) {
                        debugger; //likely tag already exists
                    }
                    //done
                    console.log('done adding tag');

                });


                //replace in EP
                _.each(storyboard_VM.currentEP.pattern.element, function(element) {
                    if (element.id === val.elementId) {

                        //scId, typeRef, typeId, newValue, mmType
                        var item = dexit.scm.cd.integration.util.parseElementReference(element);
                        //now for
                        item.newValue = val.mmValue;
                        item.mmType = val.mmType;
                        scMultimediaToUpdate.push(item);
                    }
                });

                _.each(graph.getCells(), function(cell) {
                    if (cell.id === val.elementId &&
                        cell.attributes.elementType  &&
                        cell.attributes.elementType==='multimedia' &&
                        cell.attributes.multiMediaList &&
                        cell.attributes.multiMediaList().length > 0 &&
                        cell.attributes.multiMediaList()[0].value()) {

                        var mmList = cell.attributes.multiMediaList();
                        mmList[0].value(val.mmValue);
                        cell.attributes.multiMediaList(mmList);
                    }
                });
            });
            debugger;
            storyboard_VM.saveEPUIObjectAndMM(graph,scMultimediaToUpdate, function (err) {
                if (err) {
                    console.error('probleam saving updates');
                }
                storyboard_VM.placeholderElemAndMultimedia([]);
            });

            //finally clear


        });
    },

    previewUrl:ko.observable(''),

    showFullPreview: function(data, social) {

        if (social) {
            var preview = 'social-preview/' + '?ep=' + storyboard_VM.currentEP.id + '-' + storyboard_VM.currentEP.revision + '&tp=' + data.touchpoint.tpId;
            window.open(preview, '_blank');
        }else {

            var url = storyboard_VM.previewUrl() + '?ep=' + storyboard_VM.currentEP.id + '-' + storyboard_VM.currentEP.revision + '&lid=' + data.layout.id + '&tp=' + data.touchpoint.tpId;
            window.open(url, '_blank');
        }
    },

    makeLayoutSelection: function() {


        var selectedLayout = storyboard_VM.tempSelectedLayout();
        if (!selectedLayout) {
            storyboard_VM.layoutSelectionWarning('You must select one layout');
            return;
        }
        storyboard_VM.selectedLayout(selectedLayout);

        //var tpAndLayouts = storyboard_VM.currentEP.pattern.tp;

        //set selectedLayout

        storyboard_VM.selectLayoutModalVisible(false);
        var args = {
            touchpoint:storyboard_VM.selectedTouchpoint(),
            layouts: storyboard_VM.availableLayouts(),
            mode: selectedLayout.isTemplate ? 'template' : 'allocation' //for templates set to special template mode
        };
        if (selectedLayout.id !== 'custom-layout') {
            args.layout = selectedLayout;
        }

        if (selectedLayout.custom) {

            storyboard_VM.mode('layout');
            storyboard_VM.withCustomLayout(args);

        } else {

            storyboard_VM.edit(args, selectedLayout.id);
        }
    },

    /**
     * @see {LayoutInfo} in ps-ice from dexit.app.ice.integration.tpm.retrieveLayoutsForTP
     */
    selectedLayout: ko.observable(),
    edit_mode: false,
    repo:null,
    epSchemaVersion: 1,


    /**
     * Variables for EP preview
     */
    epGraph:null,
    epPaper:null,

    /**
     * @typedef {object} LayoutInfo
     * @param {string} layoutId - layout identifier (TODO remove layoutId there is no bound observable)
     * @param {string} id - layout identifier
     * @param {string} thumbnail - icon path to svg
     * @param {string} layoutMarkup - html markup for layout
     * @param {string[]} regions - region list
     */


    selectedLayoutId: ko.observable(),

    //old set selectedLayout
    // /**
    //  * User selects layout for TP.
    //  * @param {object} element - HTML DOM element
    //  * @param {LayoutInfo} data - contains layout data
    //  * @param {object} parent -
    //  */
    // setSelectedLayout: function (element, data, parent) {
    //     //TODO: approach from original EPA implementation, there must be a better way to add/remove highlight
    //     //if new selected layout, add tpId as class name
    //     element.classList.add(parent.touchpoint.tpId);
    //     // element.classList.add(parent.tp);
    //     $('.'+parent.touchpoint.tpId).removeClass('selected-product');
    //     //new structure of tp&layout
    //     var layout = {id: data.id, regions:data.regions, layoutMarkup: data.layoutMarkup, layoutId: data.layoutId, thumbnail: data.thumbnail};
    //     var existingSelected = _.find(storyboard_VM.availableTPsAndLayouts(), function(val) {
    //         return (val.touchpoint.tpId === parent.touchpoint.tpId);
    //     });
    //
    //     //extra check but unlikely it will ever be undefined since loading this far will always have touchpoint
    //     if (existingSelected) {
    //
    //         //update in currentEP
    //         var val = storyboard_VM.currentEP.pattern.tp || [];
    //         _.each(val, function (tpAndLayout) {
    //             var touchpointId = tpAndLayout.touchpoint;
    //             if (existingSelected.touchpoint.tpId === touchpointId) {
    //                 tpAndLayout.layout = layout;
    //             }
    //         });
    //     }
    //     element.classList.add('selected-product');
    //
    // },
    groupedElements: ko.observableArray([]),


    // setSelectedLayouts: function () {
       //
       // //var found = _.find(storyboard_VM.availableTPsAndLayouts());
       //  _.each(storyboard_VM.availableTPsAndLayouts(), function (val) {
       //
       //  });
       //
       //
       //  //new structure of tp&layout
       //  var layout = {id: data.id, regions:data.regions, layoutMarkup: data.layoutMarkup, layoutId: data.layoutId, thumbnail: data.thumbnail};
       //  var existingSelected = _.find(storyboard_VM.availableTPsAndLayouts(), function(val) {
       //      return (val.touchpoint.tpId === parent.touchpoint.tpId);
       //  });
       //
       //  //extra check but unlikely it will ever be undefined since loading this far will always have touchpoint
       //  if (existingSelected) {
       //
       //      //update in currentEP
       //      var val = storyboard_VM.currentEP.pattern.tp || [];
       //      _.each(val, function (tpAndLayout) {
       //          var touchpointId = tpAndLayout.touchpoint;
       //          if (existingSelected.touchpoint.tpId === touchpointId) {
       //              tpAndLayout.layout = layout;
       //          }
       //      });
       //  }
       //  element.classList.add('selected-product');
    //
    // },




    //
    // /**
    //  * Highlights the Layout icon by inspecting storyboard_VM.currentEP.pattern.tp
    //  * @param {object} el - html element
    //  * @param {object} layout - current layout data
    //  * @parem {object} parent - parent data
    //  * @parem {object} parent.touchpoint - touchpoint
    //  * @parem {object} parent.tpId - touchpoint id
    //  * @parem {object[]} parent.layouts
    //  */
    // highlightLayout: function(el, layout, parent) {
    //     var currentElement = el[1];
    //
    //     //add tpId as class for single select
    //     currentElement.classList.add(parent.touchpoint.tpId);
    //
    //     var tps = storyboard_VM.currentEP.pattern.tp || [];
    //     var found = _.find(tps, function(val) {
    //         return (val.touchpoint === parent.touchpoint.tpId  && val.layout && val.layout.id === layout.id);
    //     });
    //     if (found) {
    //         currentElement.classList.add('selected-product');
    //     }
    // },

    /**
     * Loads EP and sets schema version.
     * Sets epSchemaVersion
     * @param {string} epId
     * @param callback - returns error if issue retrieving EP
     */
    loadEP: function (epId, revision, callback) {
        dexit.app.ice.integration.engagementpattern.retrieve(epId, revision, function(err, ep) {
            if (err) {
                console.error('could not retrieve EP');
                return callback(err);
            }
            storyboard_VM.currentEP = ep;
            storyboard_VM.epSchemaVersion = ep.pattern.epSchemaVersion || 1;


            //filter for only visible elements in pattern
            var flowElements = dexit.scm.cd.integration.util.findFlowElements(ep.pattern);

            storyboard_VM._shortIdEPMapping = dexit.scm.cd.integration.util.generateShortIdForEachElement(flowElements);
            callback();
        });
    },
    _shortIdEPMapping: [],

    findShortId: function(elementId) {
        var mapped = storyboard_VM._shortIdEPMapping || [];
        var match =  _.find(mapped, function(val) {
            return (val.id && val.id === elementId);
        });
        return (match && match.shortId ? match.shortId : null);
    },

    findLongId: function(shortId) {
        var mapped = storyboard_VM._shortIdEPMapping || [];
        var match =  _.find(mapped, function(val) {
            return (val.shortId && val.shortId == shortId);
        });
        return (match && match.id ? match.id : null);
    },


    /**
     * @typedef {object} Block
     * @property {string} id
     * @property {string} label
     * @property {object} attributes
     * @property {object|string} content
     */


    /**
     * @callback storyboard_VM~buildElementBlocksCallback
     * @param {Error} err - if an error occurs then no blocks are returned
     * @param {object[]} blocks - list of blocks and identifier
     * @param {string} blocks[].id - identifer derived from ep element id
     * @param {Block} blocks[].block - block
     */

    /**
     * Builds blocks to be shown in side editor
     * @param {object} ep - engagement pattern
     * @param blockManager - grapesjs block manager
     * @param {storyboard_VM~buildElementBlocksCallback} callback
     */
    buildElementBlockForUI: function (ep,blockManager, callback) {

        var elements = dexit.scm.cd.integration.util.findFlowElements(ep.pattern);
        async.map(elements, function (element, doneElement) {
            //locate appropriate html template
            var id = element.id + '-id';
            var shortId = storyboard_VM.findShortId(element.id);

            //resolve references and build content
            dexit.scm.cd.integration.util.generateBlock(storyboard_VM.repo, element, storyboard_VM.currentSC, shortId, function (err, block) {
                if (err) {
                    console.log('problem adding block for element:' + element.id);
                    doneElement(err);
                }else if (block) {
                    doneElement(null, {id:id, block:block});
                } else {
                    doneElement();
                }
            });
        }, function(err, blocks){
            if (err) {
                return callback(err);
            }
            //only objects in array so remove any non-object value (falsy)
            callback(null, _.compact(blocks));
        });
    },


    /**
     * clear all blocks and load ones from EP
     */
    setupBlocksForTemplate: function (editor, callback) {
        var blockManager = editor.BlockManager;

        //clear all existing blocks
        blockManager.getAll().reset([]);


        //add the ones we want
        storyboard_VM.buildElementBlockForUI(storyboard_VM.currentEP,blockManager, function(err, blocks) {
            if (err) {
                return callback(err);
            }


            debugger;
            async.map(blocks, function (block, cb) {
                //now update all of the blocks with design view

                //find ep element
                var element = _.find(storyboard_VM.currentEP.pattern.element, function (val) {
                    return (val.id === block.block.attributes['element-id']);
                });

                var shortId = block.block.attributes['short-id'];

                dexit.scm.cd.integration.util.generateDesignViewElement(storyboard_VM.repo, element, storyboard_VM.currentSC, shortId, function (err, toAdd) {

                    if (toAdd) {
                        //if i
                        if (toAdd.type === 'image' || toAdd.type === 'video' ) {
                            block.block.content = toAdd;
                        }else if (toAdd.type === 'text') {
                            block.block.content = toAdd;
                        }else {
                            block.block.content.html = toAdd.content;
                        }

                        //make sure 'active is set
                        block.block.activate = true;

                        //reset some of the values
                        //block.block.content.type = 'ep-element';
                        block.block.content.badgable = true;
                        block.block.content.draggable = true;
                        block.block.content.removable = true;
                        block.block.content.hightlightable = true;


                    }
                    cb(null, block);
                });
            }, function(err, mappedBlocks) {
                _.each(mappedBlocks, function(element) {
                    blockManager.add(element.id, element.block);
                });

                //show blocks panel by default
                editor.Panels.getButton('views', 'open-blocks').set('active', true);

                //not great but pass blocks back for now for rendered template to be added to edit mode in html
                callback(null,blocks);
            });




        });

    },


    /**
     * clear all blocks and load ones from EP
     */
    setupBlocks: function (editor, callback) {
        var blockManager = editor.BlockManager;

        //clear all existing blocks
        blockManager.getAll().reset([]);

        //add the ones we want
        storyboard_VM.buildElementBlockForUI(storyboard_VM.currentEP,blockManager, function(err, blocks) {
            if (err) {
                return callback(err);
            }

            _.each(blocks, function(element) {
                blockManager.add(element.id, element.block);
            });

            //show blocks panel by default
            editor.Panels.getButton('views', 'open-blocks').set('active', true);



            //not great but pass blocks back for now for rendered template to be added to edit mode in html
            callback(null,blocks);
        });

    },

    goToDesign: function(selectedTPAndLayout){
        storyboard_VM.showEditScreen(true);
        storyboard_VM.design(selectedTPAndLayout.touchpoint, selectedTPAndLayout.layout.id);
    },

    saveAndGoToDesign: function() {
        storyboard_VM.save(function(err, result) {
            if (err) {
                //TODO
                alert('error!');
            }else {
                storyboard_VM.showEditScreen(true);
                var touchpoint = storyboard_VM.selectedTouchpoint();
                var layoutId = storyboard_VM.selectedLayoutId();

                storyboard_VM.design(touchpoint, layoutId);
            }
        });
    },


    /**
     * Removes any regions in the allocation that are not in the pattern
     * Note: happens when cloning and deleting an element
     * @private
     */
    _cleanRegionsAndElementAllocations: function() {

        var ep = storyboard_VM.currentEP.pattern;
        var currentElementIds = _.map(ep.element, 'id');
        _.each(ep.tp, function (tpAndLayout) {
            var touchpointId = tpAndLayout.touchpoint;
            var layout = tpAndLayout.layout;


            if (storyboard_VM.selectedTouchpoint().tpId === touchpointId && layout.id === storyboard_VM.selectedLayout().id) {


                //go through object of key-[value] : {regionRef:[elementId]}
                //val, key, obj
                var updated = _.mapValues(layout.regions, function (elementIds,regionRef, obj) {

                    var filtered = _.filter(elementIds, function (elementId) {
                        return (currentElementIds.indexOf(elementId) !== -1);
                    });
                    return filtered;
                });
                layout.regions = updated;



            }
        });
    },

    save: function (callback) {


        var mode = storyboard_VM.mode();
        if (!mode) {
            return callback(new Error('mode must be set for save'));
        }


        //remove any allocations that do not have current engagement pattern element ids
        storyboard_VM._cleanRegionsAndElementAllocations();


        async.auto({
            extractText: function(cb) {
                debugger;
                if (mode === 'design') {


                    var textChanges = storyboard_VM._extractTextForElements();

                    storyboard_VM._updateTextForElements(storyboard_VM.currentSC, storyboard_VM.currentEP, textChanges, cb);
                    //update for changes

                }else {
                    cb();
                }

            },
            updateState: function (cb) {
                //TODO:  if mode() === 'design', make sure to save the design updates
                if (mode === 'design') {

                    //before save: try to save style of any visible
                    var styles = storyboard_VM._extractElementStyles();
                    _.extend(storyboard_VM._elementStyles, styles);

                    //find current TPlayout
                    _.each(storyboard_VM.currentEP.pattern.tp, function (tpAndLayout) {
                        var touchpointId = tpAndLayout.touchpoint;
                        var layout = tpAndLayout.layout;
                        if (storyboard_VM.selectedTouchpoint().tpId === touchpointId && layout.id === storyboard_VM.selectedLayout().id) {
                            //set element style
                            layout.elementStyle = storyboard_VM._elementStyles;
                            storyboard_VM.selectedLayout(layout);
                        }
                    });


                    //update available
                    _.each(storyboard_VM.availableTPsAndLayouts(), function(val) {
                        if (val.touchpoint.tpId === storyboard_VM.selectedTouchpoint().tpId) {
                            //update layout
                            val.layout = storyboard_VM.selectedLayout();
                        }
                    });

                    cb();

                } else if (mode === 'allocation') {

                    //update available
                    _.each(storyboard_VM.availableTPsAndLayouts(), function(val) {
                        if (val.touchpoint.tpId === storyboard_VM.selectedTouchpoint().tpId) {
                            //update layout
                            val.layout = storyboard_VM.selectedLayout();
                        }
                    });
                    cb();

                } else if (mode === 'template') {
                    //for template need to resave the layout

                    debugger;
                    //update available

                    storyboard_VM.saveTemplateLayout(function (err, layoutId) {

                        _.each(storyboard_VM.availableTPsAndLayouts(), function(val) {
                            if (val.touchpoint.tpId === storyboard_VM.selectedTouchpoint().tpId) {
                                //update layout
                                val.layout = storyboard_VM.selectedLayout();
                            }
                        });

                        cb(null, layoutId); //
                    });
                }
            }

        }, function (err, results) {
            var id = storyboard_VM.currentEP.id;
            var revision = storyboard_VM.currentEP.revision;
            dexit.app.ice.integration.engagementpattern.update(id, revision, storyboard_VM.currentEP, function(res){
                storyboard_VM.showEditScreen(false);
                if(res){
                    console.log('Ep is updated');
                    storyboard_VM.onEpUpdate(storyboard_VM.currentEP);
                    callback(null,storyboard_VM.currentEP);
                } else {
                    console.error('Cannot update engagement pattern');
                    callback(new Error('problem updating pattern'));
                }


            });
        });

    },


    /* Updates local copy of engagement pattern element by removing specified element from any region reference
    * @param {object} args
    * @param {string} args.elementId - engagement
    * @param {string} [args.presentationRef] - future possibility
    */
    removeEPElementDraft: function(args) {
        if (!storyboard_VM.currentEP) {
            return;
        }
        var ep = storyboard_VM.currentEP;
        //update TP -> layout region reference with element id
        //add new reference
        _.each(ep.pattern.tp, function (tpAndLayout) {
            var touchpointId = tpAndLayout.touchpoint;
            var layout = tpAndLayout.layout;
            if (storyboard_VM.selectedTouchpoint().tpId === touchpointId && layout.id === storyboard_VM.selectedLayout().id) {

                //remove old element ref from any existing region
                var regions = tpAndLayout.layout.regions;
                _.each(regions, function (value, key, index) {
                    if (!value) {
                        value = [];
                    }

                    var matchIndex = value.indexOf(args.elementId);
                    if (matchIndex > -1) {
                        value.splice(matchIndex,1);
                    }

                });

                //now add element
                var arr = tpAndLayout.layout.regions[args.regionRef] || [];
                tpAndLayout.layout.regions[args.regionRef] = arr;
            }
        });

    },


    /**
     *
     * Updates local copy of engagement pattern element
     * @param {object} args
     * @param {string} args.elementId - engagement
     * @param {string} [args.regionRef] - region reference within layout
     * @param {string} [args.presentationRef] - for update presentation style
     * @param {object} [args.presentationRefArgs] - to augment the presentationRef
     */
    updateEPElementDraft: function (args) {
        if (!storyboard_VM.currentEP) {
            return;
        }
        var ep = storyboard_VM.currentEP;
        //version 2
        if (ep.pattern.epSchemaVersion && ep.pattern.epSchemaVersion === 2) {
            //update TP -> layout region reference with element id
            //add new reference
            _.each(ep.pattern.tp, function (tpAndLayout) {
                var touchpointId = tpAndLayout.touchpoint;
                var layout = tpAndLayout.layout;
                if (storyboard_VM.selectedTouchpoint().tpId === touchpointId && layout.id === storyboard_VM.selectedLayout().id) {



                    if (args.regionRef) {
                        //remove old element ref from any existing region
                        var regions = tpAndLayout.layout.regions;
                        _.each(regions, function (value, key, index) {
                            if (!value) {
                                value = [];
                            }

                            var matchIndex = value.indexOf(args.elementId);
                            if (matchIndex > -1) {
                                value.splice(matchIndex, 1);
                            }

                        });

                        //now add element
                        var arr = tpAndLayout.layout.regions[args.regionRef] || [];
                        arr.push(args.elementId);
                        tpAndLayout.layout.regions[args.regionRef] = arr;

                    }

                    //optional - update any presentation reference for element
                    if (args.presentationRef) {
                        var preArr = tpAndLayout.presentationRef || {};
                        preArr[args.elementId] = args.presentationRef;
                        tpAndLayout.presentationRef = preArr;
                    }

                    if (args.presentationRefArgs) {
                        var argsArr = tpAndLayout.presentationRefArgs || {};
                        argsArr[args.elementId] = args.presentationRefArgs;
                        tpAndLayout.presentationRefArgs = argsArr;
                    }

                }
            });
        } else { //backwards compatibility
            //update matching region reference based on elementId
            _.each(ep.pattern.element, function (element) {
                if (element.id === args.elementId) {
                    element.regionRef = args.regionRef;
                }
            });
        }
    },

    /**
     * Load any external styles required here
     * Adding most of ICE4M ones here
     */
    loadExternalCSS: function () {
        //bootstrap css
        var dc = storyboard_VM.editor.getComponents();
        dc.add('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css" crossorigin="anonymous" />');
        dc.add('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.min.css" integrity="sha256-iWTx/iC9IoKaoSKD5+WVFef8ZYNIgQ4AxVpMbBw2hig=" crossorigin="anonymous" />');
        dc.add('<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">');
        // dc.add('<link rel="stylesheet" href="style/widget.css" type="text/css">');
        dc.add('<link id="main-styles" href="//releases.dexit.co/dex-css-master/master/ice4m_main.css" rel="stylesheet">');
        // dc.add('<link id="main-styles" href="/style/ice4m_main.css" rel="stylesheet">');
        // dc.add('<link href="/ice4m/style/default.css" rel="stylesheet">');
        // dc.add('<link href="/ice4m/style/ice4m.css" rel="stylesheet">');
        dc.add('<link href="/ice4m/style/legacy.css" rel="stylesheet">');


        //Note: kind of a hackish way to again override position of html-element
        //required to enable removal from
        // dc.add('<style type="text/css">.html-element { position: relative !important;} .ep-item.e-service { max-height: 100px }</style>');

        // temp -> for dev only
        //dc.add('<link rel="stylesheet" href="style/ice4e_main.css" type="text/css">');
    },

    getExternalCSS: function() {
        return [
            'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.min.css',
            // 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
            'https://releases.dexit.co/dex-css-master/0.3.0/ice4m_main.css',
            '/ice4m/style/legacy.css'
        ];

    },
    getPresetTemplateCSS:function() {
        return ['/ice4m/style/gjs-predefined.css', '/ice4m/style/gjs-template.css','/ice4m/style/gjs-allocation.css'];
    },


    loadAllocationStyle: function(touchpoint) {
        var dc = storyboard_VM.editor.getComponents();
        // dc.add('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css" crossorigin="anonymous" />');
        // dc.add('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.min.css" integrity="sha256-iWTx/iC9IoKaoSKD5+WVFef8ZYNIgQ4AxVpMbBw2hig=" crossorigin="anonymous" />');
        // dc.add('<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">');
        // dc.add('<link rel="stylesheet" href="style/widget.css" type="text/css">');
        // dc.add('<link id="main-styles" href="//d1u5d67v4f0unu.cloudfront.net/dex-css-master/master/ice4m_main.css" rel="stylesheet">');
        // // dc.add('<link id="main-styles" href="/style/ice4m_main.css" rel="stylesheet">');
        // dc.add('<link href="/ice4m/style/default.css" rel="stylesheet">');
        // dc.add('<link href="/ice4m/style/ice4m.css" rel="stylesheet">');
        //Note: kind of a hackish way to again override position of html-element
        //required to enable removal from
        //dc.add('<link href="/ice4m/style/gjs-predefined.css" rel="stylesheet">');
        // div[element-id] {
        //     display: inline-block;
        // }
        dc.add('<style type="text/css">div > div[element-id] { display: inline-block;} </style>');
        dc.add('<style type="text/css">.html-element { position: relative !important;} .ep-item.e-service { max-height: 100px }  .e-service > img { max-width:60px; max-height:60px }  </style>');

        //TODO: quick workaround to hide text from template
        if (touchpoint && touchpoint.channelType && touchpoint.channelType === 'email') {
            // dc.add('<link href="/ice4m/style/ice4m.css" rel="stylesheet">');
            dc.add('<link href="/ice4m/style/gjs-editor-mjml.css" rel="stylesheet">');
        }

    },


    loadPresetTemplateCSS: function(){
        var dc = storyboard_VM.editor.getComponents();
        dc.add('<link href="/ice4m/style/gjs-predefined.css" rel="stylesheet">');
    },


    dragTarget:null,
    dragBlock:null,

    // No longer works with html5 drag and drop in grapesJS
    // /**
    //  * When user start to drag element from block manager
    //  * @param e
    //  */
    // handleBlockDragMove: function(e,e2) {
    //     //debugger;
    //     if (!e) {
    //         return;
    //     }
    //     storyboard_VM.dragTarget = e.toElement;
    // },

    /**
     * Disables the specific block from being dragged
     * @param elementId
     */
    disableBlockDrag: function(id) {
        //update bloock
        var block = storyboard_VM.editor.BlockManager.get(id);
        if (!block) {
            console.error('problem disabling block that was allocated %s',id);
        }

        var attributes = _.extend({}, block.get('attributes'));
        var attributesClass = attributes.class || '';
        //attributes.class = attributesClass + ' disabled-block';
        attributes.class = attributesClass + ' allocated';

        //check and update class, update
        storyboard_VM.editor.BlockManager.get(id).set({attributes: attributes});
        storyboard_VM.editor.BlockManager.render();
    },



    handleBlockDragStopTemplate:  function (dt, component) {
        debugger;
        if (!(component.attributes && component.attributes.attributes && component.attributes.attributes['element-id'])) {
            return;
        }



        if (!storyboard_VM.componentTarget) {
            return;
        }


        if (!storyboard_VM.dragTarget) {
            return;
        }



        //get style/classes from dragTarget
        // var cssClasses = storyboard_VM.dragTarget.classList.toString();
        //
        //
        // var existingCssClasses = component.getClasses().toString();
        //
        //
        // var classToSet = (existingCssClasses  ?  existingCssClasses + ' ' + cssClasses : cssClasses);
        // component.setClass(classToSet);

        // if (component.attributes.class) {
        //     component.attributes.class = component.attributes.class + ' ' + cssClasses;
        // }else {
        //     component.attributes.class = cssClasses;
        // }


        var region = storyboard_VM.componentTarget.parent;
        debugger;


        //so if region is an image than want to replace srg attribute
        var regionType  = region.getAttributes()['data-gjs-type'];



        var model = region.view.model

        if (regionType === 'data-region-img') {
            //replace the srg from the image with this one
          //  region.setAttributes({'src': component.get('src')});

            //region.set('src',component.get('src'))
            model.set('src',component.get('src'));

            //for image replacement, it is important to remove the dropped component model, otherwise another is added
            component.remove()
            //add element-id as child
            // var elementId = storyboard_VM.dragBlock;
            // var epElements = region.getAttributes('epElements');
            // epElements.unshift(elementId);

        }else if (regionType === 'data-region-text') {

            var cType = component.get('type');
            // region.set('content',component.get('content'))
            //region.setAttributes({'content': component.get('content')});
            if (cType !== 'text') {
                model.set('content', component.get('content'));
            }
            //add element-id as child
            //var elementId = storyboard_VM.dragBlock;
            // var epElements = region.getAttributes('epElements');
            // epElements.unshift(elementId);


        }else {
            //just append inside

            //TODO: should clear out other visible elements

            //TODO: when the campaign is dropped (intelligence), the inner html becomes [object Object]


            //var html = region.get('html');


            //FIXME: the campaign intelligence are not being rendered correctly when toHTML is called (their contents are gone)
            //region.toHTML();


            //add element-id as child
            // var elementId = storyboard_VM.dragBlock;
            // var epElements = region.getAttributes('epElements');
            // epElements.unshift(elementId);
        }


        region.defaults.epElements.unshift(storyboard_VM.dragBlock);  //top ine should always be renderd

        debugger;
        //var region = placeholderComp.closest('div.region-container');
        var regionRef = region.getAttributes()['data-region'];

        if (!regionRef) {
            if (region.view && region.view.attr && region.view.attr['data-region']) {
                regionRef = region.view.attr['data-region'];
            }
        }

        //only call when matching
        if (regionRef && storyboard_VM.dragBlock) {
            var elementId = storyboard_VM.dragBlock;

            var args = {
                elementId: elementId,
                regionRef: regionRef
            };
            storyboard_VM.updateEPElementDraft(args);
            var id = elementId +'-id';
            storyboard_VM.disableBlockDrag(id);
        }

        //Replace all data-placeholder's content with the template

       // placeholderComp.replaceWith(component);
        //placeholderComp.replaceWith(storyboard_VM.dragTarget);
        //
        // //now associate
        // if (templatePlaceholder && storyboard_VM.dragBlock) {
        //     //now to replace it and get the parent
        //     debugger;
        //
        //
        // }
        //clear dragTarget and dragBlock regardless
        storyboard_VM.dragTarget = null;
        storyboard_VM.dragBlock = null;
        storyboard_VM.componentTarget = null;
    },


    /**
     * After user drops element being dragged
     * @param {DataTransfer} e
     * @param dragTarget
     */
    handleBlockDragStop: function (dt, component) {
        if (!component.attributes || !component.attributes.type || component.attributes.type !== 'ep-element') {
            return;

        }

        if (!storyboard_VM.dragTarget) {
            return;
        }

        //now associate
        var regionRef = storyboard_VM.dragTarget.getAttribute('data-region');


        var templatePlaceholder = storyboard_VM.dragTarget.getAttribute('data-placeholder');


        if (templatePlaceholder && storyboard_VM.dragBlock) {
            //now to replace it and get the parent
            debugger;


        }



        //only call when
        if (regionRef && storyboard_VM.dragBlock) {
            var elementId = storyboard_VM.dragBlock;

            var args = {
                elementId: elementId,
                regionRef: regionRef
            };
            storyboard_VM.updateEPElementDraft(args);
            var id = elementId +'-id';
            storyboard_VM.disableBlockDrag(id);

        }

        //clear dragTarget and dragBlock regardless
        storyboard_VM.dragTarget = null;
        storyboard_VM.dragBlock = null;
    },



    //
    // /**
    //  * Grabs EP element identifier for current block being dragged and dropped
    //  * @param target
    //  * @param modelToDrop
    //  * @param warns
    //  */
    // handleComponentDragStopBefore: function (target, modelToDrop, warns) {
    //     //save reference only if dragging and dropping an EP element
    //     // if (modelToDrop && modelToDrop.getAttribute('element-id')) {
    //     if (modelToDrop && modelToDrop.attributes && modelToDrop.attributes['element-id']) {
    //         storyboard_VM.dragBlock = modelToDrop.attributes['element-id'];
    //         storyboard_VM.componentTarget = target; //required for template dragging
    //         storyboard_VM.dragBlockModel = modelToDrop;
    //         //storyboard_VM.dragComponent = modelToDrop;
    //     }
    // },


    /**
     * Grabs EP element identifier for current block being dragged and dropped
     * @param {object} args
     * @param args.target
     * @param args.modelToDrop
     * @param args.warns
     */
    handleComponentDragStopBefore: function (args) {
        debugger;
        var target = args.targetCollection;
        var modelToDrop = args.modelToDrop;
        var warns = args.warns;
        //save reference only if dragging and dropping an EP element
        // if (modelToDrop && modelToDrop.getAttribute('element-id')) {
        if (modelToDrop && modelToDrop.attributes && modelToDrop.attributes['element-id']) {
            storyboard_VM.dragBlock = modelToDrop.attributes['element-id'];
            storyboard_VM.componentTarget = target; //required for template dragging
            storyboard_VM.dragBlockModel = modelToDrop;
            //storyboard_VM.dragComponent = modelToDrop;
        }
    },


    populateDevicePanel: function () {
        //configure devices and 3 icons to show up: TODO: should consider device part of TP
        var cmdm = storyboard_VM.editor.Commands;
        cmdm.add('set-device-desktop', {
            run: function(editor) {
                editor.setDevice('Desktop');
            }
        });
        cmdm.add('set-device-tablet', {
            run: function(editor) {
                editor.setDevice('Tablet');
            }
        });
        cmdm.add('set-device-mobile', {
            run: function(editor) {
                editor.setDevice('Mobile portrait');
            }
        });

        var pnm = storyboard_VM.editor.Panels;
        storyboard_VM.editor.getConfig().showDevices = 0;
        var devicePanel = pnm.addPanel({ id: 'devices-c'});
        var deviceBtns = devicePanel.get('buttons');
        deviceBtns.add([{
            id: 'deviceDesktop',
            command: 'set-device-desktop',
            className: 'fa fa-desktop',
            attributes: {title: 'Desktop'},
            active: 1
        },{
            id: 'deviceTablet',
            command: 'set-device-tablet',
            className: 'fa fa-tablet',
            attributes: {title: 'Tablet'}
        },{
            id: 'deviceMobile',
            command: 'set-device-mobile',
            className: 'fa fa-mobile',
            attributes: {title: 'Mobile'}
        }]);
        //make sure changes are shown
        pnm.render();
    },

    /**
     *
     * @param layoutContent
     * @return {string}
     */
    loadHTML: function (layoutContent) {
        //FIXME: Sort of working hack for adding wrapper around layout.  Need to pad divs in layout content so content can be dragged in them
        //return '<div style="padding-top: 30px" class="container"><div class="row">'+layoutContent+'</div></div>';
        //return '<div style="padding-top: 30px">'+layoutContent+'</div>';
        // return '<div style="padding-top: 30px">'+layoutContent+'</div>';
        return '<div>'+layoutContent+'</div>';
    },

    loadHTMLTemplate: function (layoutContent) {
        //FIXME: Sort of working hack for adding wrapper around layout.  Need to pad divs in layout content so content can be dragged in them
        //return '<div style="padding-top: 30px" class="container"><div class="row">'+layoutContent+'</div></div>';
        //return '<div style="padding-top: 30px">'+layoutContent+'</div>';
        return '<div>'+layoutContent+'</div>';
    },

    _elementStyles:{},

    updateDesignViewHTML: function(epElements) {


        /**
         * Find a component as child of current component
         * @param {string} regionId
         * @param {object} component
         * @returns {object|null} returns a grapesJS component (if found).  If nothing found return falsy value
         */
        function findComponent(regionId, component) {
            var found = component.find('div[data-region="'+regionId+'"');
            //Note: assume only one component will be found in array as regionId should be unique per div
            return (found && found.length > 0 ? found[0] : null);
        }

        if (!epElements || epElements.length < 1) {
            return;
        }

        var ep = storyboard_VM.currentEP;

        var domComponents =  storyboard_VM.editor.DomComponents;
        var wrapperChildren = domComponents.getComponents();


        //before change: try to save style of any visible
        var styles = storyboard_VM._extractElementStyles();
        _.extend(storyboard_VM._elementStyles, styles);


        //var layout = storyboard_VM.selectedLayout();

        // var baseHTML = layout.layoutMarkup;
        // var content = storyboard_VM.loadHTML(baseHTML);
        // storyboard_VM.editor.setComponents(content);
        // if (!layout.custom) {
        //     storyboard_VM.loadExternalCSS();
        // }
        // storyboard_VM.editor.render();


        //find ep.pattern.tp -> layout -> regions


        _.each(ep.pattern.tp, function (tpAndLayout) {
            var touchpointId = tpAndLayout.touchpoint;
            var layout = tpAndLayout.layout;

            if (storyboard_VM.selectedTouchpoint().tpId === touchpointId && layout.id === storyboard_VM.selectedLayout().id) {






                //go through object of key-[value] : {regionRef:[elementId]}
                _.each(layout.regions, function (elementIds,regionRef) {

                    _.each(elementIds, function (elementId) {
                        //check if elementId is in list of selected
                        var foundElement = _.find(epElements, {id: elementId});
                        if (foundElement) {
                            var shortId = storyboard_VM.findShortId(elementId);

                            var existingElementStyle = (layout.elementStyle && layout.elementStyle[elementId] ? layout.elementStyle[elementId] : '');

                            wrapperChildren.each(function (comp, index) {
                                var foundRegion = findComponent(regionRef, comp);
                                if (foundRegion) {
                                    //clear region
                                    foundRegion.get('components').set('');

                                    //add existing style(s)t

                                    dexit.scm.cd.integration.util.generateDesignViewElement(storyboard_VM.repo,foundElement,storyboard_VM.currentSC,shortId,function (err, toAdd) {

                                        if (err) {
                                            //TODO: skip
                                            console.error('could not add component:',{elementId: elementId});
                                        }
                                        if (toAdd) {
                                            if (existingElementStyle) {
                                                debugger;
                                                toAdd.style = existingElementStyle;
                                            }
                                            debugger;

                                            foundRegion.get('components').add(toAdd);
                                        }

                                    });
                                }
                            });
                        }
                    });


                });


            }
        });


        //get html to show for each epElement;

        //add to region tho
    },

    /**
     * Updates view of GrapesJS canvas based on existing elements assigned to layout for EP
     * Note: must be called after canvas is rendered
     * @param ep
     * @param blocks
     */
    updateHTML: function(ep, blocks){

        function findBlock(elementId) {
            var result = _.find(blocks, function (block) {
                return (block.id.indexOf(elementId) > -1);
            });
            return result;
        }

        /**
         * Find a component as child of current component
         * @param {string} regionId
         * @param {object} component
         * @returns {object|null} returns a grapesJS component (if found).  If nothing found return falsy value
         */
        function findComponent(regionId, component) {
            var found = component.find('div[data-region="'+regionId+'"');
            //Note: assume only one component will be found in array as regionId should be unique per div
            return (found && found.length > 0 ? found[0] : null);
        }

        var domComponents =  storyboard_VM.editor.DomComponents;
        var wrapperChildren = domComponents.getComponents();
        if (storyboard_VM.epSchemaVersion === 1) { //deprecated

            //update matching region reference based on elementId
            _.each(ep.pattern.element, function (element) {
                var regionRef = element.regionRef;
                var elementId = element.id;

                var block = findBlock(elementId);

                if (block) {

                    wrapperChildren.each(function (comp) {
                        var found = findComponent(regionRef, comp);
                        if (found) {
                            var toAdd = _.extend({
                                attributes: {
                                    'element-id': elementId,
                                    copyable: false
                                }
                            }, block.block.content);
                            found.get('components').add(toAdd);

                        }
                    });
                }
            });
        }else { //assume version 2

            _.each(ep.tp, function (tpAndLayout) {
                var touchpointId = tpAndLayout.touchpoint;
                var layout = tpAndLayout.layout;


                if (storyboard_VM.selectedTouchpoint().tpId === touchpointId && layout.id === storyboard_VM.selectedLayout().id) {
                    //go through object of key-[value] : {regionRef:[elementId]}
                    _.each(layout.regions, function (elementIds,regionRef) {

                        _.each(elementIds, function (elementId) {
                            var block = findBlock(elementId);


                            if (block) {

                                wrapperChildren.each(function (comp, index) {
                                    var found = findComponent(regionRef, comp);
                                    if (found) {
                                        //block.block.content contains componentType and html
                                        var toAdd = _.extend({
                                            attributes: {
                                                'element-id': elementId,
                                                copyable: false
                                            }
                                        }, block.block.content);
                                        found.get('components').add(toAdd);
                                        //also disable block:
                                        var id = elementId + '-id';
                                        storyboard_VM.disableBlockDrag(id);
                                    }
                                });
                            }else {
                                console.warn('the element %s does not exist in the current version of the pattern',elementId);
                            }
                        });


                    });


                }
            });

        }
    },

    _loadCMSConfig: function(cmsMode, callback) {
        var resource = '/cms-config/' + encodeURIComponent(cmsMode) ;
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(callback);
    },

    onEpUpdate:function (updatedEP) {
        // debugger;
        // args.mainVM.selectedWidget().ePatterns([updatedEP]);
    },
    reloadCard: function() {
        debugger;
        if (storyboard_VM.mainVM) {

            //TODO: fix consistency for mainVM.selectedWidget and bcInstanceVM.selectedCard

            var bcInstanceVM = storyboard_VM.mainVM.selectedCourse().courseVM;
            var selected = bcInstanceVM.selectedCard();
            if (!selected) {
                selected = storyboard_VM.mainVM.selectedWidget();
            }
            if (selected) {
                selected.sc(storyboard_VM.currentSC);
            }else {
                console.warn('could not update UI...needs refresh');
            }

        }
    },

    currentName: ko.observable(''),
    bcInstanceVM: null,
    mmModalVisible: ko.observable(false),
    mmManagementVM: ko.observable(),
    mmManagementSelectedMM:  null,
    mmManagementSelectionRow: -1,
    saveTags: function() {
        var mmVM= storyboard_VM.mmManagementVM(); //.saveTags();

        debugger;

        var ids = mmVM.selectedItems();
        var id = (ids && ids.length > 0 ? ids[0] : null);
        //get the selected item from allItems
        var found = _.find(mmVM.allItems(), function(item) {
            return (item.fileType !== 'folder' && item.id ===  id);
        });
        if (!found) {
            //skip
            alert('you did not select valid multimedia');

        }else {

            //storyboard_VM.mmManagementSelectedMM(id);

            //get the current row and update
            var mmPlaceholderIndex = ko.utils.unwrapObservable(storyboard_VM.mmManagementSelectionRow);

            var row = storyboard_VM.placeholderElemAndMultimedia()[mmPlaceholderIndex];
            debugger;
            row.selectedMM(found);


            storyboard_VM.closeMMModal(ids);




        }



        // debugger;
        // var ids = self.selectedItems();
        // //add tags
        //
        // async.each(ids, function (val, cb) {
        //     var found = _.find(self.allItems(), function(item) {
        //         return (item.fileType !== 'folder' && item.id ===  val);
        //     });
        //     if (!found) {
        //         //skip
        //         return cb();
        //     }
        //     var tags = self.tagsToAdd.concat([found.mediaType]);
        //     dexit.app.ice.integration.filemanagement.addAppTagsByFileName(val,tags, function (err) {
        //         //done
        //         console.log('done adding tag');
        //         cb();
        //     });
        //
        // }, function () {
        //
        //     if (self.closeFn) {
        //         self.closeFn(ids);
        //     }
        // });





        //call mmManagementVM.saveTags
    },
    showMMModal: function(data, index) {
        debugger;

        storyboard_VM.mmManagementSelectionRow = ko.utils.unwrapObservable(index);


        //TODO: filter on file type

        if (!storyboard_VM.mmManagementVM()) {
            var mmVm = new dexit.app.ice.MMManagement({
                baseFolder: 'ice4m',
                fileTypeRestrictions: storyboard_VM.mainVM.fileTypeRestrictions(),
                closeFn: storyboard_VM.closeMMModal,
                mainVM: storyboard_VM.mainVM
            });
            //add app tag(s) for current campaign and current program
            mmVm.tagsToAdd = [];

            storyboard_VM.mmManagementVM(mmVm);


        }
        storyboard_VM.mmManagementVM().selectedItems([]);
        storyboard_VM.mmManagementVM().load('/');
        storyboard_VM.mmModalVisible(true);


    },
    closeMMModal: function() {

        //take the id


        //update the selected to the id

        storyboard_VM.mmModalVisible(false);

        //now add this to the current selectedMM

        //these are the added files


    },

    // availableImages: ko.observable([]),
    // availableVideos: ko.observable([]),
    // availableDocuments: ko.observable([]),
    /**
     * Initializes the CD view model with all the available Touchpoints and layouts
     * @param {object} args
     * @param {string} args.epId
     * @param {object} args.scId
     * @param {object} args.repo
     * @param {object} args.epObject - ep UI object passed in from EPA
     * @param {string} [args.cmsMode='internal'] - used to set the loading of the CMS to use for the CD
     * @param {object[]} tps - array of initialized TP objects passed from application (there is an existing assumption there is only one channel type per tp here)
     * @param {object[]} tps[].tpId - touchpoint identifier
     * @param {object[]} tps[].channelType - channel type
     * @param {object[]} tps[].icon -  icon name
     * @param {object} args.availableMM - 3 arrays of available: images, documents and videos
     * @param callback - optionally returns an error
     */
    //{tpId: tp.tpId, tpType: tp.tpType, tpURL: tempURL, channelType: tp.channelType}
    init: function (args, callback) {
        if (!args || !args.epId) {
            return callback(new Error('Validation: epId is required'));
        }
        if (!args.scId) {
            return callback(new Error('Validation: scId is required'));
        }
        if (!args.repo) {
            return callback(new Error('Validation: repo is required'));
        }
        if (!args.tps || args.tps.length < 1) {
            return callback(new Error('Validation: tps is required'));
        }
        if (args.mainVM) {
            storyboard_VM.mainVM = args.mainVM;
        }

        var epId = args.epId;
        var epRevision = args.epRevision;
        var scId = args.scId;
        var repo = args.repo;
        storyboard_VM.epGraph = args.epObject;
        storyboard_VM.repo = repo;
        storyboard_VM.bcInstanceVM = args.bcInstanceVM;

        storyboard_VM.showPlaceholderSelection(false);

        debugger;
        var mmArr = [];
        if (args.availableMM && args.availableMM.video) {
            var vids = _.map(args.availableMM.video, function(val){
                return {type: 'video', url:val, key: val.substring(val.lastIndexOf('/') +1)}
            });
            storyboard_VM.availableVideos(vids);
            mmArr = mmArr.concat(vids);
        }

        if (args.availableMM && args.availableMM.image) {
            var imgs = _.map(args.availableMM.image, function(val){
                return {type: 'image', url:val, key: val.substring(val.lastIndexOf('/') +1)}
            });
            storyboard_VM.availableImages(imgs);
            mmArr = mmArr.concat(imgs);
        }
        if (args.availableMM && args.availableMM.document) {

            var docs = _.map(args.availableMM.document, function(val){
                return {type: 'document', url:val, key: val.substring(val.lastIndexOf('/') +1)}
            });
            storyboard_VM.availableDocuments(docs);
            mmArr = mmArr.concat(docs);
            //storyboard_VM.availableMultimedia(storyboard_VM.availableMultimedia().concat(docs));
        }
        storyboard_VM.availableMultimedia(mmArr);


        //FIXME
        var cmsMode = args.cmsMode || 'external-wch';

        async.auto({
            loadEP: function (cb) { //load Engagement pattern
                storyboard_VM.loadEP(epId, epRevision, function (err) {
                    if (err) {
                        console.error('could not load EP');
                        return cb(err);
                    }
                    storyboard_VM.currentName(storyboard_VM.currentEP.pattern.name);
                    cb();
                });
            },
            checkForPlaceholders: ['loadEP', function(cb) {
                storyboard_VM.placeholderElemAndMultimedia([]);
                var placeholdersMultimedia = [];

                dexit.epm.epa.integration.prepareShapes();
                var graph = new joint.dia.Graph();
                storyboard_VM.loadEPUIObject(storyboard_VM.epGraph, graph);


                _.each(graph.getCells(), function(cell) {
                    var placeholder = false;
                    var type = 'image';
                    if (cell.attributes &&
                        cell.attributes.elementType  &&
                        cell.attributes.elementType==='multimedia' &&
                        cell.attributes.multiMediaList &&
                        cell.attributes.multiMediaList().length > 0 &&
                        cell.attributes.multiMediaList()[0].value() &&
                        (cell.attributes.multiMediaList()[0].value().indexOf('placeholder-image.svg') > -1 || cell.attributes.multiMediaList()[0].value().indexOf('placeholder-video.mp4') > -1 )) {
                        placeholder = true;
                        type = cell.attributes.multiMediaList()[0].type;
                    }
                    if (placeholder) {
                        placeholdersMultimedia.push({type: type, id: cell.id, attributes:cell.attributes, placeHolderImage: cell.attributes.multiMediaList()[0].value(), selectedMM: ko.observable() });
                    }

                });

                storyboard_VM.placeholderElemAndMultimedia(placeholdersMultimedia);

                cb();
                // _.each(storyboard_VM.currentEP.pattern.element, function(element) {
                //     // if(element.patternComponents && element.patternComponents.type && element.patternComponents.type === 'multimedia'){
                //     //
                //     //     var mmList = ko.utils.unwrapObservable(element.multiMediaList);
                //     //
                //     // });
                // });
            }],
            loadSC: function (cb) { //load sc
                dexit.scm.dcm.integration.sc.retrieveSC(repo, scId, function(err, data) {
                    if (err) {
                        //TODO: handle error
                        console.error('could not retrieve sc');
                        return cb(err);
                    }
                    storyboard_VM.currentSC = data;
                    cb();
                });
            },
            loadLayouts: ['loadEP', function (cb, result) {

                var tpAndLayouts = storyboard_VM.currentEP.pattern.tp;

                var res = [];
                async.each(storyboard_VM.currentEP.pattern.touchpoints, function (tpId, done) {
                    var tp = _.find(args.tps, {tpId: tpId});
                    var containsCustom = false;
                    var params = {
                        touchpointId: tp.tpId,
                        channelTypeId: tp.channelTypeId
                    };
                    dexit.app.ice.integration.tpm.retrieveLayoutsForTP(params, function (err, result) {
                        if (err){
                            return done(err);
                        }

                        var toAdd = result || [];
                        //find in pattern.tp where this layout should go, and add layout details
                        var found = _.find(tpAndLayouts, {touchpoint: tpId});
                        if (found) {

                            var selectedLayout = null;
                            var selectedLayoutId = null;
                            if (found.layout && !_.isEmpty(found.layout)) {
                                selectedLayout = found.layout;
                                selectedLayoutId = found.layout.id;

                            }

                            var isCustom = (found.layout && found.layout.custom ? true: false);
                            if (isCustom) {
                                toAdd.push(found.layout);
                                containsCustom = true;
                            }

                            if (!containsCustom && tp.channelType && (tp.channelType.toLowerCase() === 'ucc' || tp.channelType.toLowerCase() === 'bcc')) {
                                toAdd.push({id: 'custom-layout', text: 'custom', custom:true});
                            }

                            res.push({touchpoint: tp, layouts: toAdd, layout:selectedLayout, selectedLayoutId:ko.observable(selectedLayoutId)});
                        }
                        done();


                    });
                }, function (err) {
                    if (err) {
                        return cb(err);
                    }
                    //add custom to list with an id of 'custom-layout'
                    //var tpAndLayouts = storyboard_VM.currentEP.pattern.tp;

                    //process the res to enable skipping steps
                    //if: res.touchpoint.channelType !== 'ucc' || res.touchpoint.channelType !== 'ucc' ||   res[x].layouts
                    debugger;

                    async.map(res, function (val, doneMap) {
                        if (val.touchpoint.channelType === 'ucc' || val.touchpoint.channelType === 'bcc') {
                            return doneMap(null,val);
                        }else {
                            //TODO:handle case where tp has no layout
                            if (val.layouts.length < 1) {
                                debugger;

                                return doneMap(new Error('no layout available for TP'));

                            }



                            if (val.layouts.length > 1) {
                                return doneMap(null,val);
                            }




                            //for touchpoints with only one layout just auto select it
                            val.layout = val.layouts[0];
                            val.selectedLayoutId(val.layout.id);

                            //add layout to currentEP
                            var found = _.find(storyboard_VM.currentEP.pattern.tp, function (val2) {
                                return (val2.touchpoint === val.touchpoint.tpId);
                            });
                            //if not already set
                            if (!found.layout || _.isEmpty(found.layout)) {
                                found.layout = val.layout;

                                var regions = found.layout.regions;
                                if (_.isString(regions)) { //convert from '1,2' to ['1','2']
                                    //convert to object,
                                    regions = regions.split(',');
                                }
                                if (_.isArray(regions)) { //convert from ['1','2'] to {'1': [], '2': []}
                                    var arr = {};
                                    for (var i = 0; i < regions.length; i++) {
                                        arr[regions[i]] = [];
                                    }
                                    found.layout.regions = arr;
                                }
                                var id = storyboard_VM.currentEP.id;
                                var revision = storyboard_VM.currentEP.revision;
                                dexit.app.ice.integration.engagementpattern.update(id, revision, storyboard_VM.currentEP, function (res) {
                                    if (res) {
                                        console.log('Ep is updated');
                                        storyboard_VM.onEpUpdate(storyboard_VM.currentEP);
                                    } else {
                                        console.error('Cannot update engagement pattern');
                                    }

                                    doneMap(null,val);

                                });
                            } else {
                                doneMap(null, val);
                            }

                        }
                    }, function (err, resp) {
                        //set TPs and layouts
                        storyboard_VM.availableTPsAndLayouts(resp);
                        cb(null,tpAndLayouts);
                    });


                });
            }],
            //whether to use internal (Grapejs or external cms)
            cmsConfig: ['loadEP', 'loadLayouts', function(cb) {
                storyboard_VM._loadCMSConfig(cmsMode, function (err, config) {
                    if (err){
                        console.error('could not load valid configuration for cms');
                        return cb(err);
                    }
                    if (config.mode === 'external') {
                        storyboard_VM.externalCMSMode(true);
                        var params = _.extend(config, {ep: storyboard_VM.currentEP});



                        if (args.mainVM) {

                            //add callback onEpUpdate
                            params.onEpUpdate = function (updatedEP) {
                                args.mainVM.selectedWidget().ePatterns([updatedEP]);
                            };
                            //QH: for issue with observable not refeshing
                            params.onEPSaveDone = function () {
                                debugger;
                                storyboard_VM.init(args, function(err) {
                                    if (err) {
                                        console.log('problem re-initializing');
                                    }
                                });
                            };

                        }

                        // storyboard_VM.cmsShellVM = new dexit.scm.cd.HsCMSShell(params);
                        storyboard_VM.cmsShellVM = new dexit.scm.cd[config.params.moduleName](params);
                        storyboard_VM.cmsShellVM.init();
                    }else {
                        storyboard_VM.externalCMSMode(false);
                        if (args.mainVM) {
                            storyboard_VM.onEpUpdate = function (updatedEP) {
                                args.mainVM.selectedWidget().ePatterns([updatedEP]);
                            };
                        }
                    }
                    cb();


                });
            }]
        }, function (err) {
            callback(err);

        });
    },
    showPatternThumbnail: function(){
        // debugger;
        // //show thumbnail view of the pattern during storyboard creation
        // if (dexit.epm.epa.integration.graph) {
        //     dexit.epm.epa.integration.graph.clear();
        // }else {
        //     dexit.epm.epa.integration.graph = new joint.dia.Graph();
        // }
        //
        // var graph = dexit.epm.epa.integration.graph;
        //
        //
        //
        // // var workArea =$('#pattern-preview-area');
        // //
        // // var inserted = $(workArea).append('<div id="preview-paper" class="paper"></div>');
        // // var paper = $(workArea).children('#preview-paper');
        // //
        //
        // //
        // // storyboard_VM.epPaper = new joint.dia.Paper({
        // //     el: paper,
        // //     width: paper.width(),
        // //     height: paper.height(),
        // //     gridSize: 1,
        // //     model: graph,
        // //     // mark interactive as false
        // //     interactive: false
        // // });
        //
        //
        // //make sure custom shapes are available
        // dexit.epm.epa.integration.prepareShapes();
        // //load
        // dexit.epm.epa.integration.loadEPUIObject(storyboard_VM.epGraph);
        //
        // storyboard_VM.epPaper.setOrigin(0, 0);
        // storyboard_VM.epPaper.scaleContentToFit();
        // storyboard_VM.epPaper.fitToContent();
        //
        //
        // storyboard_VM.epPaper.on('blank:pointerclick', function () {
        //     storyboard_VM.showEPModal(storyboard_VM.epGraph);
        // });

        // var rect = dpa_VM.patternPaper.el.getBoundingClientRect();
        // dpa_VM.patternPaper.setDimensions(rect.width, rect.height);
        // dpa_VM.patternPaper.scaleContentToFit({minScaleX: 0.3, minScaleY: 0.3, maxScaleX: 1 , maxScaleY: 1});

    },

    saveEPUIObjectAndMM: function(graph, updatedMM, callback) {
        var toSave = dexit.epm.epa.integration.graphObjToJSON(graph);
        debugger;
        async.auto({
            retrieveSC: function(cb) {
                dexit.scm.dcm.integration.sc.retrieveSC(storyboard_VM.repo, storyboard_VM.currentSC.id, cb);
            },
            updateEPUIObj: ['retrieveSC',function (cb, result) {

                var sc = result.retrieveSC;
                sc.property.epObject = toSave;

                // var changes = [
                //     {op: 'replace', path: '/property/epObject', value: toSave}
                // ];
                var params = {
                    type: (storyboard_VM.currentSC.property.class || storyboard_VM.currentSC.property.type),
                    id: storyboard_VM.currentSC.id,
                    // version: storyboard_VM.currentSC.property.version,
                    // changes: changes
                };
                dexit.scm.dcm.integration.sc.updateSC(storyboard_VM.repo, sc.id,  sc.property, function(err){
                //dexit.app.ice.integration.bcp.updateBCInstance(params,function (err, resp) {
                    if (err) {
                        return cb(err);
                    }
                    storyboard_VM.currentSC.property.version = sc.property.version;
                    storyboard_VM.currentSC.property.epObject = toSave;
                    try {
                        storyboard_VM.epGraph = JSON.parse(toSave.replace(/(?:\r\n|\r|\n)/g, '\\n'));
                    } catch (err) {
                        console.error('error occurs when parsing the EP Object from SC property: ' + err);
                    }


                    //storyboard_VM.epGraph = toSave// graph.getCells();

                    dexit.app.ice.integration.bcp.invalidateCacheForBCInstance({
                        type: params.type,
                        id: params.id
                    }, function (err) {
                        cb();
                    });
                });
            }],
            updateSC: ['updateEPUIObj', function (cb, result) {

                //TODO: this place will need to be updated when removing the SC for EP

                var sc = storyboard_VM.currentSC;
                //scId, typeRef, theTypeId, newValue, mmType
                async.each(updatedMM, function (val, done) {
                    if (val.scId === sc.id) {

                        if (val.theTypeId.indexOf('#') === -1) {
                            return cb(new Error('only new EP multimedia format is supported'));
                        }
                        var ids = val.theTypeId.split('#');

                        var type = ids[1];
                        var id = ids[0];

                        //mmType
                        if (val.mmType === 'video') {
                            var match = _.find(sc.video, function (item) {
                                return (item.id === id)
                            });
                            if (match) {
                                match.property.location = val.newValue;

                                //update mm directly
                                dexit.scm.dcm.integration.sc.updateVideoMultimedia(storyboard_VM.repo, match.id, val.scId, match.property, function(err) {
                                    cb();
                                });
                            }else {
                                cb();
                            }

                        }else if (val.mmType === 'image') {
                            var match = _.find(sc.image, function (item) {
                                return (item.id === id)
                            });
                            if (match) {
                                match.property.location = val.newValue;

                                //update mm directly
                                dexit.scm.dcm.integration.sc.updateImageMultimedia(storyboard_VM.repo, match.id, val.scId, match.property, function(err) {
                                    cb();
                                });
                            }else {
                                cb();
                            }
                        }else if (val.mmType === 'document') {
                            var match = _.find(sc.text, function (item) {
                                return (item.id === id)
                            });
                            if (match) {
                                match.property.location = val.newValue;
                                //update mm directly
                                dexit.scm.dcm.integration.sc.updateTextMultimedia(storyboard_VM.repo, match.id, val.scId, match.property, function (err) {
                                    cb();
                                });
                            }else {
                                cb();
                            }
                        }else {
                            console.warn('saveEPUIObjectAndMM: unhandled multimedia type' + val.mmType)
                            cb();
                        }


                    }else {
                        debugger;
                        console.warn('saveEPUIObjectAndMM: different sc no handled');
                    }


                }, function (err) {
                    if (err){
                        return cb(err);
                    }
                    //update the current sc
                    dexit.scm.dcm.integration.sc.retrieveSC(storyboard_VM.repo, storyboard_VM.currentSC.id, function(err, data) {
                        if (err) {
                            //TODO: handle error
                            console.error('saveEPUIObjectAndMM: could not retrieve sc');
                            return cb(err);
                        }
                        storyboard_VM.currentSC = data;
                        cb();
                    });


                });
            }]
        }, function (err) {
            if (!err) {
                debugger;
                storyboard_VM.onEpUpdate(storyboard_VM.currentEP);
                storyboard_VM.reloadCard();
            }
            callback();

        })


    },

    /**
     * TODO: rewrite so existing state so passed epObject is not mutated
     * @param epObject
     */
    loadEPUIObject: function (epObject, graph) {
        var cells = [];

        var handleEPElement = function(element){
            var tempEPEntry = _.cloneDeep(element);
            if(element.startEvent){
                tempEPEntry.startEvent = element.startEvent;
            }
            tempEPEntry.validComponent = ko.observable(element.validComponent);
            if(element.patternComponents && element.patternComponents.type && element.patternComponents.type === 'multimedia'){

                var mmList = ko.utils.unwrapObservable(element.multiMediaList);

                tempEPEntry.multiMediaList = ko.observableArray(mmList);


                _.each(mmList, function(multiMedia, index){
                    tempEPEntry.multiMediaList()[index].value = ko.observable(ko.utils.unwrapObservable(multiMedia.value));
                    var label = multiMedia.label || multiMedia.value;
                    tempEPEntry.multiMediaList()[index].label = ko.observable(label);
                });
                cells.push(tempEPEntry);


            }else if(element.patternComponents && element.patternComponents.type && element.patternComponents.type === 'behaviour'){
                if(element.elementType === 'survey' || element.elementType === 'questionnaire'){
                    //tempEPEntry.multiMediaList = ko.observableArray(element.multiMediaList);
                    //questionComponents is not an observable variable since it saves values captured from Alpaca form
                    //tempEPEntry.questionComponents = element.questionComponents;
                    tempEPEntry.setupInputs = element.setupInputs;
                    cells.push(tempEPEntry);

                }else{
                    //for other behaviours
                    cells.push(tempEPEntry);
                }
            }else{
                cells.push(tempEPEntry);
            }
        };

        //parse each ep object cell for any observables
        _.each(epObject.cells, handleEPElement);



        graph.clear();
        graph.fromJSON({cells: cells});
    },
    showEPModal: function (epObj) {

        if (_.isString(epObj)) {
            epObj = JSON.parse(epObj);
        }
        var graph = new joint.dia.Graph();
        var modalPaper = null;
        //show modal
        //$('#epPreviewModal').modal({});

        $('#epPreviewModal').modal('show');

        $('#epPreviewModal').on('shown.bs.modal', function(event){

            //init papee
            //var popoverData = $(event.target).data();


            var workArea =$('#modal-pattern-preview-area');
            if ($(workArea).children('#large-preview-paper').length > 0) {
                return;
            }



            var inserted = $(workArea).append('<div id="large-preview-paper" class="paper"></div>');
            var paper = $(workArea).children('#large-preview-paper');



            modalPaper = new joint.dia.Paper({
                el: paper,
                width: paper.width(),
                height: paper.height(),
                gridSize: 1,
                model: graph,
                // mark interactive as false
                interactive: false
            });




            //for each cell int he graph (where not a link, find a short id and append it
            //var shortId = storyboard_VM.findShortId(element.id);

            async.each(epObj.cells, function(cell, cb) {
                if (cell.type && cell.type === 'epa.HTMLElement') {
                    //get element from pattern

                    var placeholder = false;
                    var placeholderLabel = '';
                    var mmValue =  (cell &&
                        cell.elementType  &&
                        cell.elementType ==='multimedia' &&
                        cell.multiMediaList &&
                        cell.multiMediaList.length > 0 ? ko.utils.unwrapObservable(cell.multiMediaList[0].value): null );


                    if (mmValue && (mmValue.indexOf('placeholder-image.svg') > -1 || mmValue.indexOf('placeholder-video.mp4') > -1 )) {
                        placeholder = true;
                        placeholderLabel = cell.placeholderName || 'No label was set';

                    }

                    var elements = dexit.scm.cd.integration.util.findFlowElements(storyboard_VM.currentEP.pattern);

                    var element = _.find(elements, function (val) {
                        return ((cell.id.indexOf(val.id) !== -1) || (val.id.indexOf(cell.id) !== -1));
                    });
                    if (placeholder) {
                        element.isPlaceholder = true;
                        element.placeholderLabel = placeholderLabel;
                    }

                    //var shortId = storyboard_VM.findShortId(cell.id);
                    var shortId = storyboard_VM.findShortId(element.id);


                    dexit.scm.cd.integration.util.generateBlock(storyboard_VM.repo, element, storyboard_VM.currentSC, shortId, function (err, block) {
                        if (err) {
                            return cb();//skip
                        }

                        if (!block) {
                            //for BR
                            //QH: for BR
                            if (element.type === 'decision') {
                                cell.template = cell.template.replace('User Defined Business Rule', shortId + ':User Defined Business Rule');
                                cell.template = cell.template.replace('Survey Business Rule', shortId + ':Survey Business Rule');
                            }


                        } else {
                            //QH: for survey BR
                            if (cell.template.indexOf('Survey Business Rule') !== -1) {
                                cell.template =  cell.template.replace('Survey Business Rule', shortId + ':Survey Business Rule');
                            }else {
                                //want block.content.html
                                cell.template = block.content.html;
                            }
                        }
                        cb();
                    });
                } else {
                    cb();
                }
            }, function (err) {
                // //make sure custom shapes are available
                dexit.epm.epa.integration.prepareShapes();
                storyboard_VM.loadEPUIObject(epObj,graph);


                modalPaper.setOrigin(0, 0);
                modalPaper.scaleContentToFit();
                modalPaper.fitToContent();
            });





        });
        $('#epPreviewModal').on('hide.bs.modal', function(event){
            if (graph) {
                graph.clear();
            }
            if (modalPaper) {
                modalPaper.remove();
                modalPaper = null;
            }
            var workArea =$('#modal-pattern-preview-area');
            var paper = $(workArea).children('#large-preview-paper');
            paper.remove();

        });


    },

    _generateWithRegionIds: function(htmlString, attributeName) {
        var toParse =  '<div id="wrapper">' + htmlString + '</div>';
        var count = 1;
        var ids = [];
        var obj = $.parseHTML(toParse);
        $(obj)
            .find('div[id!="wrapper"]')
            .each(function(){
                $(this).attr(attributeName, 'r'+count);
                ids.push('r' + count);
                count++;
            });


        return {
            // htmlString: $(obj).find('div[id="wrapper"]').html(),
            htmlString: $(obj).html(),
            regions: ids
        };
    },


    /**
     * Extracts the region identifiers
     * Limitations: attribute cannot be shared/mixed and regions must be div
     * @param {string} htmlString
     * @private
     */
    _extractRegionIds: function(htmlString, attributeName) {


        //need to wrap in root node for jquery find
        var toParse =  '<div>' + htmlString + '</div>';

        var ids = [];
        var mapped = $($.parseHTML(toParse)).find('div['+attributeName+']').each(function(){ ids.push(this.id);  });

        return ids;
    },


    /**
     * Extracts the region identifiers (where data-region=x)
     * Limitations: attribute cannot be shared/mixed and regions must be div
     * @param {string} htmlString
     * @private
     */
    _extractRegions: function(htmlString, attributeName) {

        attributeName = attributeName || 'data-region';

        //need to wrap in root node for jquery find
        var toParse =  '<div>' + htmlString + '</div>';

        var ids = [];
        $($.parseHTML(toParse)).find('div['+attributeName+']').each(function(){ ids.push( $(this).attr(attributeName));});

        return ids;
    },

    saveEnabled: ko.pureComputed(function () {

        var enabled = ( !!(storyboard_VM.mode() && (storyboard_VM.mode() === 'allocation' || storyboard_VM.mode() === 'design' || storyboard_VM.mode() === 'template')));
        return enabled;
    }),

    _saveLayoutFromHtml: function(regionIds, htmlString, inlineCss, cssLinks, callback) {

    },

    saveCustomLayout: function() {
        //take layout

        var html = storyboard_VM.editor.getHtml();
        var css = storyboard_VM.editor.getCss();


        //TODO: utility function for generating id
        var id = dpa_VM.generateId();
        var layoutId = 'cust-'+id;


        //TODO: extract regions based on id field


        //assumption: all regions correspond to id field set for a div
        var ids = storyboard_VM._extractRegionIds(html,'data-region'); //first try to extract them
        // if (!ids || ids.length < 1) { //fallback to using id field
        //     ids = storyboard_VM._extractRegionIds(html,'id');
        // }

        //fallback to generating them
        if (!ids || ids.length < 1) {
            var generate = storyboard_VM._generateWithRegionIds(html,'data-region');
            ids = generate.regions;
            html = generate.htmlString;
        }



        var combined = html + '\n' + '<style>'+css+'</style>';
        var toSave = {
            content: btoa(combined),
            regions: ids,
            container: 'merch-container',
        };


        var layoutStruc = {
            layoutId: layoutId,
            id: layoutId,
            custom: true,
            layoutMarkup: combined, //TOOD: would be good to NOT add layoutMarkup to EP as it blows up size of EP
            regions: toSave.regions,
            thumbnail: ''
        };

        async.auto({
            saveLayout: function (cb) {
                //saves layout through lm
                dexit.app.ice.integration.layoutmanagement.updateLayout(layoutId,toSave,cb);
            },
            updateEPWithLayout: ['saveLayout',function (cb) {
                var epId = storyboard_VM.currentEP.id;
                var revision = storyboard_VM.currentEP.revision;


                var currentTpId = storyboard_VM.selectedTouchpoint().tpId;

                //update layout in currentEP variable
                var val = storyboard_VM.currentEP.pattern.tp || [];
                _.each(val, function (tpAndLayout) {
                    var touchpointId = tpAndLayout.touchpoint;
                    if (currentTpId === touchpointId) {
                        tpAndLayout.layout = layoutStruc; //add layout note here
                        //TODO: remove layoutStruct, thumbnail etc
                    }

                    //now also update availableTPsAndLayouts


                });
                _.each(storyboard_VM.availableTPsAndLayouts(), function(available) {
                    if (currentTpId === available.touchpoint.tpId) {
                        available.layout = layoutStruc;
                    }
                });

                //save changes to current EP
                dexit.app.ice.integration.engagementpattern.update(epId, revision, storyboard_VM.currentEP, function(res) {
                    if (res) {
                        storyboard_VM.onEpUpdate(storyboard_VM.currentEP);
                        console.log('Ep is updated with custom layout');
                    } else {
                        console.error('Cannot update engagement pattern to add custom layout');
                    }
                    cb(null, storyboard_VM.currentEP);
                });
            }]
        }, function(err, results) {

            storyboard_VM.selectedLayout(layoutStruc);
            storyboard_VM.selectedLayoutId(layoutStruc.id);

            var data = {
                touchpoint: storyboard_VM.selectedTouchpoint(),
                mode: 'allocation'
            };
            storyboard_VM.edit(data, storyboard_VM.selectedLayoutId());

        });

    },


    saveTemplateLayout: function(callback) {
        //take layout
        debugger;

        //to get the current html
        var htmlUpdated = storyboard_VM.editor.getHtml();


        //this is the original html, this will be used with the contents stripped when sending to the channel
        var html = storyboard_VM._originalHTMLTemplateLayout;


        debugger;
        //if any css changes
        var css = storyboard_VM.editor.getCss();


        //TODO: utility function for generating id
        var id = dpa_VM.generateId();
        var layoutId = 'cust-'+id;
        var templateLayoutId = 'tem-' + id;


        var editMode = (storyboard_VM.selectedLayout().editing ? true : false);
        if (editMode) {
            layoutId = storyboard_VM.selectedLayout().id;
            templateLayoutId = storyboard_VM.selectedLayout.modTemplate;
        }


        //TODO: extract regions based on id field


        //assumption: all regions correspond to id field set
        //var ids = storyboard_VM._extractRegions(html,'data-region'); //first try to extract them
        //sames ids
        var ids = Object.keys(storyboard_VM.selectedLayout().regions);

        // if (!ids || ids.length < 1) { //fallback to using id field
        //     ids = storyboard_VM._extractRegionIds(html,'id');
        // }

        //fallback to generating them
        if (!ids || ids.length < 1) {
            var generate = storyboard_VM._generateWithRegionIds(html,'data-region');
            ids = generate.regions;
            html = generate.htmlString;
        }
        //get layoutId
        var templateId = storyboard_VM.selectedLayoutId();

        //in edit mode, get the templateId from storyboard_VM.selectedLayout().baseTemplate
        if (editMode) {
            templateId = storyboard_VM.selectedLayout().baseTemplate;
        }


        //this is the HTML to use in the editor
        var templateCombined = htmlUpdated + '\n' + '<style>'+css+'</style>';
        //now also want to remove any [Object Object] just
        //templateCombined = templateCombined.split('[object Object]').join('')




        debugger;

        //also need to get the "template" without anything in the regions (clear then)
        var htmlToStr =  storyboard_VM._originalHTMLTemplateLayout;//html;//storyboard_VM.editor.getHtml();
        // var htmlToStr = html;
        var body = $($.parseHTML('<div>'+htmlToStr+'</div>'));

        $('[data-region]', body).each(function (index, item) {
            var regionId =  $(item).attr('data-region');
            //if this is a div with a data-region attribute, clear its children
            if (regionId) {
                //add divthis.
                //remove children of span
                $(item).empty();
            }
        });
        debugger;

        //this is the HTML to use in the presentation
        var htmlToSave = $(body).html().trim() + '\n' + '<style>'+css+'</style>';

        //var htmlToSave = storyboard_VM._originalHTMLTemplateLayout + '\n' + '<style>'+css+'</style>';

        var toSave = {
            content: btoa(htmlToSave),
            modTemplate: templateLayoutId,
            regions: ids,
            container: 'merch-container',
        };


        var toSaveTemplate = {
            content: btoa(templateCombined),
            baseTemplate: templateId,
            regions: ids,
            derivedLayout: layoutId
        };

        if (storyboard_VM.selectedLayout().js) {
            toSave.js =storyboard_VM.selectedLayout().js;
            toSaveTemplate.js = storyboard_VM.selectedLayout().js;
        }
        if (storyboard_VM.selectedLayout().css) {
            toSave.css = storyboard_VM.selectedLayout().css;
            toSaveTemplate.css = storyboard_VM.selectedLayout().css;
        }



        var layoutStruc = {
            layoutId: layoutId,
            id: layoutId,
            baseTemplate: templateId,
            modTemplate: templateLayoutId,
            custom: true,
            layoutMarkup: htmlToSave, //TOOD: would be good to NOT add layoutMarkup to EP as it blows up size of EP
            regions: toSave.regions,
            thumbnail: ''
        };
        debugger;

        async.auto({
            saveTemplateEditorLayout: function(cb) {

                dexit.app.ice.integration.layoutmanagement.updateLayout(templateLayoutId,toSaveTemplate,cb);
            },
            saveLayout: ['saveTemplateEditorLayout',function (cb, results) {
                //saves layout through lm
                dexit.app.ice.integration.layoutmanagement.updateLayout(layoutId,toSave,cb);
            }],
            updateEPWithLayout: ['saveLayout',function (cb, results) {
                var epId = storyboard_VM.currentEP.id;
                var revision = storyboard_VM.currentEP.revision;


                var currentTpId = storyboard_VM.selectedTouchpoint().tpId;

                //update layout in currentEP variable
                var val = storyboard_VM.currentEP.pattern.tp || [];
                _.each(val, function (tpAndLayout) {
                    var touchpointId = tpAndLayout.touchpoint;
                    if (currentTpId === touchpointId) {
                        //copy over old allocation from template
                        layoutStruc.regions = tpAndLayout.layout.regions;

                        tpAndLayout.layout = layoutStruc; //add layout note here


                        //TODO: remove layoutStruct, thumbnail etc
                    }

                    //now also update availableTPsAndLayouts


                });
                _.each(storyboard_VM.availableTPsAndLayouts(), function(available) {
                    if (currentTpId === available.touchpoint.tpId) {
                        available.layout = layoutStruc;
                    }
                });
                cb();


                // //save changes to current EP
                // dexit.app.ice.integration.engagementpattern.update(epId, revision, storyboard_VM.currentEP, function(res) {
                //     if (res) {
                //         storyboard_VM.onEpUpdate(storyboard_VM.currentEP);
                //         console.log('Ep is updated with custom layout');
                //     } else {
                //         console.error('Cannot update engagement pattern to add custom layout');
                //     }
                //     cb(null, storyboard_VM.currentEP);
                // });
            }]
        }, function(err, results) {

            storyboard_VM.selectedLayout(layoutStruc);
            storyboard_VM.selectedLayoutId(layoutStruc.id);

            // var data = {
            //     touchpoint: storyboard_VM.selectedTouchpoint(),
            // };
            callback(null, layoutId);



            // storyboard_VM.mode('allocation');
            // storyboard_VM.edit(data, storyboard_VM.selectedLayoutId());

        });

    },




    previewVisible: ko.pureComputed(function () {
        if (!storyboard_VM.mode()) {
            return false;
        }
        if (storyboard_VM.mode() === 'layout') {
            return false;
        }
        if (storyboard_VM.mode() === 'allocation') {
            return true;
        }

        if (storyboard_VM.mode() === 'design') {
            return true;
        }

        if (storyboard_VM.mode() === 'template') {
            return true;
        }

    }),


    editorModeTitle: ko.pureComputed(function(){
        if (!storyboard_VM.mode()) {
            return '';
        }

        if (storyboard_VM.mode() === 'layout') {
            return 'Layout Creation';
        }
        if (storyboard_VM.mode() === 'allocation') {
            return 'Allocation';
        }

        if (storyboard_VM.mode() === 'design') {
            return 'Design';
        }

        if (storyboard_VM.mode() === 'template') {
            return 'Template driven';
        }

    }),
    /**
     * Cr eate a new custom layout (or used the saved one)
     * Perform CD for select TP and a new layout
     * @param {object} data
     * @param {object} data.touchpoint
     * @param {string} data.touchpoint.tpId
     * @param {string} data.touchpoint.icon
     * @param {object} [data.layout] -only set if already created
     */
    withCustomLayout: function(data) {

        storyboard_VM.mode('layout');

        //for layout: look in storyboard_VM.currentEP.pattern.tp  (find where .touchpoint ===  data.touchpoint.tpId)
        storyboard_VM.edit_mode =false;

        // var found = _.find(storyboard_VM.currentEP.pattern.tp, function (val) {
        //     return (val.touchpoint === data.touchpoint.tpId);
        // });
        var editMode = false;
        // //prepare regions
        // var regions = found.layout.regions;
        // if (_.isString(regions)) { //convert from '1,2' to ['1','2']
        //     //convert to object,
        //     regions = regions.split(',');
        // }
        // if (_.isArray(regions)) { //convert from ['1','2'] to {'1': [], '2': []}
        //     var arr = {};
        //     for(var i=0;i<regions.length;i++) {
        //         arr[regions[i]] = [];
        //     }
        //     found.layout.regions = arr;
        // } else {
        //     //otherwise an object  {'1': [], '2': ['a']}
        //     editMode = _.find(found.layout.regions, function (value) {
        //         return (value && value.length > 0);
        //     });
        // }

        var args = {
            touchpoint: data.touchpoint,
            layoutMode: 'create',
            sc: storyboard_VM.currentSC,
            ep: storyboard_VM.currentEP
        };
        if (data.layout) {
            args.layout = data.layout;
        }

        if (editMode) {
            storyboard_VM.edit_mode = true;
        }
        //make screen visible
        storyboard_VM.showEditScreen(true);



        storyboard_VM.instantiateLayoutCreationView(args, function (err) {
            if (err) {
                //TODO:handle error
                console.log('problem loading CD edit view for layout');
            }
        });

    },


    // /**
    //  * Perform CD for select TP and layout based on selection
    //  * @param {object} data
    //  * @param {ko.observable<string>} data.selectedLayoutId - selected layout id  (if value === 'custom-layout' then proceed to layout creation)
    //  * @param {object} data.touchpoint
    //  * @param {string} data.touchpoint.tpId
    //  * @param {string} data.touchpoint.icon
    //  * @param {string} data.touchpoint.channelTypeId
    //  * @param {LayoutInfo[]} data.layouts
    //  */
    // configure: function(data, selected) {
    //
    //     var selectedLayoutId = data.selectedLayoutId();
    //
    //     if (selectedLayoutId === 'custom-layout') {
    //         storyboard_VM.withCustomLayout(data);
    //     } else {
    //         storyboard_VM.mode('allocation');
    //
    //         storyboard_VM.edit(data, selectedLayoutId);
    //     }
    //
    // },

    /*


    * @param {object} touchpoint
    * @param {string} touchpoint.icon
    * @param {string} touchpoint.channelTypeId
    * @param {string} selectedLayoutId - selected layout id
    */
    design: function(touchpoint, selectedLayoutId) {
        debugger;
        storyboard_VM.mode('design');
        storyboard_VM.selectedLayoutId(selectedLayoutId);
        storyboard_VM.selectedTouchpoint(touchpoint);
        //for layout: look in storyboard_VM.currentEP.pattern.tp  (find where .touchpoint ===  data.touchpoint.tpId)
        var found = _.find(storyboard_VM.currentEP.pattern.tp, function (val) {
            return (val.touchpoint === touchpoint.tpId);
        });
        //var editMode = false;

        //if empty then no layout info has been added, so allocation has not been done
        if (!found || !found.layout || _.isEmpty(found.layout)) {
            console.error('no layout!!!!');
            return;
        }

        var args = {
            touchpoint: touchpoint,
            layout: found.layout,
            sc: storyboard_VM.currentSC,
            ep: storyboard_VM.currentEP
        };

        //if (editMode) {
            storyboard_VM.edit_mode = true;
        //}

        //make screen visible
        storyboard_VM.showEditScreen(true);
        storyboard_VM.instantiateDesignView(args, function (err) {
            if (err) {
                //TODO:handle error
                console.log('problem loading CD edit view for layout');
            }
        });

    },


    /**
     *
     * Perform CD allocation for TP and layout based on selection
     * @param {object} data
     * @param {object} data.touchpoint
     * @param {string} data.touchpoint.tpId
     * @param {string} data.touchpoint.icon
     * @param {string} data.touchpoint.channelType
     * @param {LayoutInfo[]} data.layouts
     * @param {mode='allocation'} data.mode - The editor mode can optionally be passed in but defaults to 'allocation'
     * @param {string} selectedLayoutId - layout identifier
     *
     */
    editEmail: function(data, selectedLayoutId) {

        var editorMode= data.mode || 'allocation';


        if (data.layout && data.layout.modTemplate) {
            editorMode = 'template';
        }




    },



    /**
     *
     * Perform CD allocation for TP and layout based on selection
     * @param {object} data
     * @param {object} data.touchpoint
     * @param {string} data.touchpoint.tpId
     * @param {string} data.touchpoint.icon
     * @param {LayoutInfo[]} data.layouts
     * @param {mode='allocation'} data.mode - The editor mode can optionally be passed in but defaults to 'allocation'
     * @param {string} selectedLayoutId - layout identifier
     *
     */
    edit: function (data, selectedLayoutId) {


        var editorMode= data.mode || 'allocation';


        if (data.layout && data.layout.modTemplate) {
            editorMode = 'template';
        }



        storyboard_VM.mode(editorMode);
        storyboard_VM.selectedLayoutId(selectedLayoutId);
        storyboard_VM.edit_mode =false;


        //for layout: look in storyboard_VM.currentEP.pattern.tp  (find where .touchpoint ===  data.touchpoint.tpId)
        var found = _.find(storyboard_VM.currentEP.pattern.tp, function (val) {
            return (val.touchpoint === data.touchpoint.tpId);
        });
        var editMode = false;


        //case 1: found.layout.id === selectedLayoutId (pre-existing layout was selected again)
        if (found.layout && found.layout.id && found.layout.id === selectedLayoutId) {
            console.log('do nothing');
        }else {  //case 2: !found.layout || found.layout.id !== selectedLayoutId (new layout selection, should update storyboard_VM.currentEP.pattern.tp.layout
            var layout = _.find(data.layouts, function (val) {
                return (val.id === selectedLayoutId);
            });
            if (!layout) {
                console.error('no layout!!!!');
                return;
                //TODO: show user error
            }
            found.layout = layout;
        }

        //
        //
        // //if empty then no layout info has been added, check data.layouts for match
        // if (!found.layout || _.isEmpty(found.layout)) {
        //     var layout = _.find(data.layouts, function (val) {
        //         return (val.id === selectedLayoutId);
        //     });
        //
        //     if (!layout) {
        //         console.error('no layout!!!!');
        //         return;
        //         //TODO: show user error
        //     }
        //     found.layout = layout;
        // }
        //prepare region formats
        var regions = found.layout.regions;
        if (_.isString(regions)) { //convert from '1,2' to ['1','2']
            //convert to object,
            regions = regions.split(',');
        }
        if (_.isArray(regions)) { //convert from ['1','2'] to {'1': [], '2': []}
            var arr = {};
            for(var i=0;i<regions.length;i++) {
                arr[regions[i]] = [];
            }
            found.layout.regions = arr;
        } else {
            //otherwise an object  {'1': [], '2': ['a']}
            editMode = _.find(found.layout.regions, function (value) {
                return (value && value.length > 0);
            });
        }

        var args = {
            touchpoint: data.touchpoint,
            layout: found.layout,
            sc: storyboard_VM.currentSC,
            ep: storyboard_VM.currentEP,
            mode: editorMode
        };

        if (editMode) {
            storyboard_VM.edit_mode = true;
        }

        //make screen visible
        storyboard_VM.showEditScreen(true);


        if (editorMode && editorMode === 'template') {

            if (editMode) {
                //load the modTemplate
                dexit.app.ice.integration.layoutmanagement.retrieveLayout(found.layout.modTemplate, function (err, layout) {
                    if (err) {
                        alert('could not load layout for editing.  Please select a new one.');
                        return;
                    }

                    //replace layout content with the one from the mod tempalte
                    args.layout.modTemplateContent = atob(layout.content);
                    args.layout.layoutMarkup = args.layout.modTemplateContent;
                    args.layout.editing = true;

                    storyboard_VM.instantiateTemplateView(args, function (err) {
                        if (err) {
                            //TODO:handle error
                            console.log('problem loading CD edit view for layout');
                        }
                    });

                });



            } else {


                storyboard_VM.instantiateTemplateView(args, function (err) {
                    if (err) {
                        //TODO:handle error
                        console.log('problem loading CD edit view for layout');
                    }
                });

            }
        }else {


            storyboard_VM.instantiateView(args, function (err) {
                if (err) {
                    //TODO:handle error
                    console.log('problem loading CD edit view for layout');
                }
            });
        }

    },


    hideEditView: function() {
        storyboard_VM.showEditScreen(false);
        $('#gjs').empty();
    },




    /**
     * Show layout creation/editor
     * @param {object} args
     * @param {object} args.touchpoint
     * @param {object} args.layout
     * @param callback
     * @returns {*}
     */
    instantiateLayoutCreationView: function(args, callback) {
        //validation
        if (!args || !args.ep) {
            return callback(new Error('Validation: ep is required'));
        }
        if (!args.sc) {
            return callback(new Error('Validation: sc is required'));
        }
        if (!args.touchpoint) {
            return callback(new Error('Validation: touchpoint is required'));
        }


        var touchpoint = args.touchpoint;
        var layoutContent = '';

        if (args.layout) {
            layoutContent = args.layout.layoutMarkup;
            storyboard_VM.selectedLayout(args.layout);
            storyboard_VM.selectedLayoutId(args.layout.id);
        } else {
            layoutContent = storyboard_VM.loadHTML(layoutContent);
        }
        //set current TP and layout
        storyboard_VM.selectedTouchpoint(touchpoint);
        storyboard_VM.currentEP = args.ep;
        //prepare layour joint js editor html view
        var content = layoutContent;//storyboard_VM.loadHTML(layoutContent);

        //FIXME: ignoring error
        var style = '';
        //initialize editor
        storyboard_VM.editor = grapesjs.init({
            storageManager: {type: 'none'},
            container : '#gjs',
            fromElement: 0,
            components: content,
            style:style,
            showDevices:0,
            devicePreviewMode:1,
            //plugins: ['gjs-blocks-basic'],
            plugins: ['gjs-preset-webpage'],
            pluginsOpts: {
                // 'gjs-blocks-basic': {
                //     blocks: ['column1', 'column2', 'column3', 'column3-7'], //add blocks for layouot creation only
                // }
                'gjs-preset-webpage': {
                    blocks: [], //add blocks for layouot creation only
                    modalImportLabel:'Paste your HTML and CSS (inside a style tag) combined into here generated by your external tool',
                    modalImportContent:'<div class="row">\n' +
                    '</div>\n' +
                    '<style>\n' +
                    '</style>',
                    blocksBasicOpts: {
                        blocks: ['column1', 'column2', 'column3', 'column3-7'], //add blocks for layouot creation only
                        flexGrid: true
                    },
                    navbarOpts:false,
                    countdownOpts:false,
                    formsOpts:false,
                    exportOpts:false,
                    aviaryOpts:false,
                    filestackOpts:false
                }
            }
        });
        var pn = storyboard_VM.editor.Panels;
        //set border outline as active
        pn.getButton('options', 'sw-visibility').set('active', 1);

        //add import button for


        //add device sizing
        //storyboard_VM.populateDevicePanel();

    },
    selectedEPElements: ko.observableArray(),
    availableEPElements: ko.observableArray(),

    updateDesignView: function(){

        //update view based on elements

        //selected Ids
        var selectedIds = storyboard_VM.selectedEPElements();


        var selected = _.filter(storyboard_VM.availableEPElements(), function(val) {
           return (selectedIds.indexOf(val.id) !== -1);
        });


        storyboard_VM.updateDesignViewHTML(selected);
        //now go an redraw editor with only these elements

        var pn = storyboard_VM.editor.Panels;
        //set border outline as active
        pn.getButton('options', 'sw-visibility').set('active', 1);

    },

    _extractElementStyles: function() {

        var elementToStyle = {};


        // function add(elementId,) {
        //     elementToStyle
        // }



        var checkComp = function (component) {
            if (component) {

                var atts = component.getAttributes();
                var elementId = (atts && atts['element-id'] ? atts['element-id'] : null);

                if (elementId) {
                    //get any classes that do not start with gjs and any styles
                    //check for styles
                    var styles = component.getStyle();
                    if (styles && !_.isEmpty(styles)) {
                        elementToStyle[elementId] = styles;
                    }

                }
            }


            var comsArr = component.get('components');
            if (comsArr) {
                comsArr.each(function (c) {
                    checkComp(c);
                });
            }
        };
        // //make base-layout not removable
        var compsArr = storyboard_VM.editor.DomComponents.getComponents();

        compsArr.each(function(c) {
            checkComp(c);
        });




        return elementToStyle;


    },


    _updateTextForElements: function(sc, ep, replacements, callback) {
        if (!replacements || _.isEmpty(replacements)) {
            return callback();
        }


        var cb = _.after(Object.keys(replacements).length, function () {
            callback();
        });

        _.each(replacements, function (value, key) {
            //get element definition
            var element =_.find(ep.pattern.element, {id:key});
            if (!element) {
                console.warn('update: no matching element for key:'+key);
                return cb();
            }

            var elementRef = dexit.scm.cd.integration.util.parseElementReference(element);
            if (elementRef.typeRef === 'layout') {
                //resolve mm from layout
                dexit.scm.cd.integration.util.resolveMM(sc, elementRef, function (err, mmRes) {
                //dexit.scm.cd.integration.util.resolveMMFromLayout(sc, elementRef.theTypeId,function (err, mmRes) {
                    if (err || (mmRes.text.length < 1)) {
                        return cb(); //error
                    }
                    var mm = mmRes.text[0];
                    var toUpdateProp =mm.property;
                    //need to escape content??

                    //no need to update so skip this element
                    if (toUpdateProp.content === value) {
                        return cb();
                    }


                    toUpdateProp.content = value;
                    dexit.app.ice.integration.scm.updateTextMultimedia(storyboard_VM.repo,toUpdateProp,sc.id,mm.id, function (err, res) {
                        cb();
                    });
                });
            }else {
                //TODO
                cb();
            }
        });

        // async.eachOf(replacements, function (value, key, cb) {
        //
        //
        // }, callback);


    },


    _extractTextForElements: function() {

        var replacements = {};


        var checkComp = function (component) {
            if (component) {

                var atts = component.getAttributes();
                var elementId = (atts && atts['element-id'] ? atts['element-id'] : null);

                var isText = (component.attributes && component.attributes.type && component.attributes.type === 'text' ? true: false );

                if (elementId && isText) {
                    //get any classes that do not start with gjs and any styles
                    //check for styles
                    var str = component.toHTML();
                    //strip outer div
                    var newStr = $($.parseHTML(str)).html();

                    //check old and new


                    replacements[elementId] = newStr;
                }
            }


            var comsArr = component.get('components');
            if (comsArr) {
                comsArr.each(function (c) {
                    checkComp(c);
                });
            }
        };
        // //make base-layout not removable
        var compsArr = storyboard_VM.editor.DomComponents.getComponents();

        compsArr.each(function(c) {
            checkComp(c);
        });




        return replacements;


    },


    _makeRegionsNonSelectable: function(){
        var updateComp = function (component) {
            if (component) {
                component.set({removable: false, badgable:false, copyable:false, styleable:false});


                //for component without attribute 'data-region'  make it non-selectable, non-highlightable
                var atts = component.getAttributes();
                var isRegion = (atts && atts['data-region'] ? true : false);
                var isPlaceholder = (atts && atts['data-placeholder'] ? true : false);
                if (isRegion) {
                    component.set(
                        {
                            styleable:false,
                            highlightable : false,
                            droppable: false
                        });
                }
                if (isPlaceholder) {
                    component.set({
                        removable:true,
                        highlightable: true
                    });
                }

            }



            var comsArr = component.get('components');
            if (comsArr) {
                comsArr.each(function (c) {
                    updateComp(c);
                });
            }
        };
        // //make base-layout not removable
        var compsArr = storyboard_VM.editor.DomComponents.getComponents();

        compsArr.each(function(c) {
            updateComp(c);
        });


        //add custom component types
        dexit.scm.cd.integration.util.addEPComponentType(storyboard_VM.editor.DomComponents, storyboard_VM);
        //storyboard_VM.editor.render();

        storyboard_VM.editor.DomComponents.getWrapper().set({
            droppable: false,
            removable: false,
            draggable: false,
            styleable:false,
            badgable : false,
            highlightable : false,
            copyable : false,
            resizable : false,
            editable : false
        });
    },

    instantiateDesignView: function(args, callback) {
        //validation
        if (!args || !args.ep) {
            return callback(new Error('Validation: ep is required'));
        }
        if (!args.sc) {
            return callback(new Error('Validation: sc is required'));
        }
        if (!args.touchpoint) {
            return callback(new Error('Validation: touchpoint is required'));
        }
        if (!args.layout || !args.layout.layoutMarkup) {
            return callback(new Error('Validation: valid layout is required'));
        }

        var touchpoint = args.touchpoint;
        var layout = args.layout;
        var layoutContent = (args && args.layout && args.layout.layoutMarkup ? args.layout.layoutMarkup : '');


        //$('#gjs').empty();



        //set current TP and layout
        storyboard_VM.selectedTouchpoint(touchpoint);
        storyboard_VM.selectedLayout(layout);
        storyboard_VM.currentEP = args.ep;
        //prepare layour joint js editor html view
        var content = storyboard_VM.loadHTML(layoutContent);

        //FIXME: ignoring error
        var style = '';

        storyboard_VM._initGrapeJSEditor('design',layout,touchpoint);

        storyboard_VM.groupedElements([]);
        storyboard_VM.selectedEPElements([]);


        storyboard_VM._makeRegionsNonSelectable();

        //available EP elements from visible ones
        var flowElements = dexit.scm.cd.integration.util.findFlowElements(storyboard_VM.currentEP.pattern);

        //add short id to all elements for display
        var elements = _.map(flowElements, function (val) {
            var toReturn = _.extend({},val);
            toReturn.label = storyboard_VM.findShortId(toReturn.id) + ':' + (toReturn.name || toReturn.description);
            return toReturn;
        });


        //move selected into grouping by region
        var groups = [];

        var found = _.find(storyboard_VM.currentEP.pattern.tp, {touchpoint: storyboard_VM.selectedTouchpoint().tpId });


        if (!found) {

            //error none
        }else {


            async.each(flowElements, function(foundElement, cb){
                var shortId = storyboard_VM.findShortId(foundElement.id);
                dexit.scm.cd.integration.util.generateDesignViewElement(storyboard_VM.repo,foundElement,storyboard_VM.currentSC,shortId,function (err, toAdd) {
                    if (err) {
                        return cb();//skip
                    }
                    _.extend(foundElement,{'design':toAdd});
                    cb();
                });
            }, function () {

                var regions = found.layout.regions;

                _.each(regions, function (value, key, index) {

                    if (key !== 'undefined') {
                        // var groupVM = new MultiGroupVM();
                        if (!value) {
                            value = [];
                        }

                        var group = {label: ko.observable(key), children: ko.observableArray([])};
                        var elements = _.map(value, function (val) {
                            var toReturn = _.find(flowElements, {id: val});
                            if (!toReturn) {
                                console.warn('id:'+val + 'is not present in flowElements');
                                return; //TODO: figure it why val is not in the flowElements
                            }
                            if (found) {
                                var label = storyboard_VM.findShortId(toReturn.id) + ':' + (toReturn.name || toReturn.description);
                                if (toReturn.design) {
                                    label = toReturn.design.label;
                                }

                                //if url then go until last /
                                if (label.indexOf('/')) {
                                    label = storyboard_VM.findShortId(toReturn.id) + ':' + label.split('/').pop();
                                }

                                toReturn.label = label;
                                return toReturn;
                            }
                        });
                        //remove any blanks
                        elements = _.compact(elements);
                        group.children(elements);

                        //don't add region groups that have no children
                        if (elements && elements.length > 0) {
                            storyboard_VM.groupedElements.push(group);
                        }
                    }

                });
                storyboard_VM.availableEPElements(elements);
            });


        }



        //customize icons for device preview buttons
        //storyboard_VM.populateDevicePanel();


        //always call set css
        storyboard_VM.loadExternalCSS();
        if (!layout.custom) { //for existing layouts there is a hack to load css for them

            storyboard_VM.loadPresetTemplateCSS();

        }
        setTimeout(function(){
            callback();
        }, 1500);



        // //TODO: find better way to find out if layout has been rendered into editor
        // setTimeout(function () {
        //
        //
        //
        //     if (storyboard_VM.edit_mode) {
        //         // load content based on EP regional references? not sure if this is the right spot
        //
        //         // storyboard_VM.updateHTML(storyboard_VM.currentEP.pattern, blocks);
        //     }
        //     callback();
        // }, 1500);



        //
        // storyboard_VM.setupBlocks(storyboard_VM.editor, function(err, blocks) {
        //     if (err) {
        //         console.error('cannot load blocks due to error');
        //         //TODO: handle error
        //
        //         return callback(err);
        //     }
        //
        //     //always call set css
        //     storyboard_VM.loadExternalCSS();
        //
        //
        //     //TODO: find better way to find out if layout has been rendered into editor
        //     setTimeout(function () {
        //
        //
        //
        //         if (storyboard_VM.edit_mode) {
        //             // load content based on EP regional references? not sure if this is the right spot
        //
        //             storyboard_VM.updateHTML(storyboard_VM.currentEP.pattern, blocks);
        //         }
        //         callback();
        //     }, 1500);
        //
        //     //in edit mode: put elements placed within into
        //
        // });

    },
    _initGrapeJSEditor: function(editorMode, layout,touchpoint) {

        //FIXME: ignoring error
        var style = '';
        var layoutContent = (layout.layoutMarkup ? layout.layoutMarkup : '');
        var mode = (editorMode || 'edit');

        if (touchpoint.channelType === 'email') {


            if (mode === 'allocation') {

                //for email make sure the text is transparent for markup text blocks
                style='color:transparent;';

                storyboard_VM.editor = grapesjs.init({
                    clearOnRender: true,
                    height: '100%',
                    //storageManager:{ autoload: 0 },
                    storageManager: {type: 'none'},
                    container: '#gjs',
                    fromElement: false,
                    components: layoutContent,
                    style: style,
                    showDevices: 0,
                    devicePreviewMode: 1,
                    plugins: ['grapesjs-mjml'], //, 'gjs-plugin-ckeditor'],
                    pluginsOpts: {
                        // 'gjs-plugin-ckeditor': {
                        //     position: 'center',
                        //     options: {
                        //         startupFocus: true,
                        //         extraAllowedContent: '*(*);*{*}', // Allows any class and any inline style
                        //         allowedContent: true, // Disable auto-formatting, class removing, etc.
                        //         enterMode: CKEDITOR.ENTER_BR,
                        //         extraPlugins: 'sharedspace,justify,colorbutton,panelbutton,font',
                        //         toolbar: [
                        //             { name: 'styles', items: ['Font', 'FontSize' ] },
                        //             ['Bold', 'Italic', 'Underline', 'Strike'],
                        //             {name: 'paragraph', items : [ 'NumberedList', 'BulletedList']},
                        //             {name: 'links', items: ['Link', 'Unlink']},
                        //             {name: 'colors', items: [ 'TextColor', 'BGColor' ]},
                        //         ],
                        //     }
                        // }
                    },
                });
            } else if (mode === 'design') {
                var settings = {
                    height: '100%',
                    clearOnRender: true,
                    storageManager: {type: 'none'},
                    container: '#gjs',
                    fromElement: false,
                    components: layoutContent,
                    // style:style,
                    showDevices: 0,
                    devicePreviewMode: 1,
                    // Show the Style Manager on component change
                    //showStylesOnChange: 1,
                    //styleManager: styleM
                    plugins: ['grapesjs-mjml'], //, 'gjs-plugin-ckeditor'],
                    pluginsOpts: {}
                };

                storyboard_VM.editor = grapesjs.init(settings);

            }
        }else {

            var content = storyboard_VM.loadHTML(layoutContent);
            if (mode === 'allocation') {
                //prepare layout joint js editor html view

                //initialize editor
                storyboard_VM.editor = grapesjs.init({
                    storageManager: {type: 'none'},
                    container: '#gjs',
                    fromElement: false,
                    components: content,
                    style: style,
                    showDevices: 0,
                    autorender: 0,
                    devicePreviewMode: 1,
                    plugins: ['grapesjs-ep-elements-plugin']
                });
            }else if (mode ==='design') {
                storyboard_VM.editor = grapesjs.init({
                    storageManager: {type: 'none'},
                    container : '#gjs',
                    fromElement: false,
                    components: content,
                    // style:style,
                    showDevices:0,
                    devicePreviewMode:1,
                    // Show the Style Manager on component change
                    //showStylesOnChange: 1,
                    //styleManager: styleM
                    plugins: ['gjs-preset-webpage'],
                    pluginsOpts: {
                        // 'gjs-blocks-basic': {
                        //     blocks: ['column1', 'column2', 'column3', 'column3-7'], //add blocks for layouot creation only
                        // }
                        'gjs-preset-webpage': {
                            blocks: [], //add blocks for layouot creation only
                            modalImportLabel:'Paste your HTML and CSS (inside a style tag) combined into here generated by your external tool',
                            modalImportContent:'<div class="row">\n' +
                                '</div>\n' +
                                '<style>\n' +
                                '</style>',
                            blocksBasicOpts: false,
                            navbarOpts:false,
                            countdownOpts:false,
                            formsOpts:false,
                            exportOpts:false,
                            aviaryOpts:false,
                            filestackOpts:false
                        }
                    }
                    // styleManager: {
                    //     sectors: customStyleManagerSectors
                    // }
                });
            }
        }
    },

    /**
     * Call to initialize for showing CD in
     * @param {object} args
     * @param {object} args.touchpoint
     * @param {string} args.touchpoint.tpId
     * @param {string} args.touchpoint.icon
     * @param {object} args.layout
     * @param {string} args.layout.layoutMarkup
     * @param {string} args.layout.id
     * @param {object} args.layout.regions - in format of key being region identifier and value being an array of element identifiers ie. {1:['a'],2:['c','d']}
     * @param {string} args.layout.id
     * @param {string} [args.mode='allocation'] - mode to instantiate this in
     * @param callback - optionally returns an error
     */
    instantiateView: function(args, callback) {
        debugger;
        var editorMode = (args.mode ? args.mode : 'allocation');

        //validation
        if (!args || !args.ep) {
            return callback(new Error('Validation: ep is required'));
        }
        if (!args.sc) {
            return callback(new Error('Validation: sc is required'));
        }
        if (!args.touchpoint) {
            return callback(new Error('Validation: touchpoint is required'));
        }
        if (!args.layout || !args.layout.layoutMarkup) {
            return callback(new Error('Validation: valid layout is required'));
        }

        var touchpoint = args.touchpoint;
        var layout = args.layout;


        //set current TP and layout
        storyboard_VM.selectedTouchpoint(touchpoint);
        storyboard_VM.selectedLayout(layout);
        storyboard_VM.currentEP = args.ep;

        debugger;
        storyboard_VM._initGrapeJSEditor(editorMode, layout,touchpoint);

        //
        // //initialize editor
        // storyboard_VM.editor = grapesjs.init({
        //     storageManager: {type: 'none'},
        //     container : '#gjs',
        //     fromElement: false,
        //     components: content,
        //     style:style,
        //     showDevices:0,
        //     devicePreviewMode:1
        // });




        //TODO: consolidate with _makeRegionsNonSelectable
        var updateComp = function (component, insidePlaceholder) {
            if (!component) {
                return;
            }




            //for component without attribute 'data-region'  make it non-selectable, non-highlightable
            var atts = component.getAttributes();
            var isRegion = (atts && atts['data-region'] ? true : false);
            var isPlaceholder = (atts && atts['data-placeholder'] ? true : false);
            if (!isRegion) {
                component.set({removable: false, badgable: false, copyable: false, selectable:false});
                component.set({
                    editable: false,
                    highlightable: false,
                    droppable: false
                });


                if (insidePlaceholder) {
                    component.set({
                        removable: true
                    });
                }

            } else {
                // debugger;
                // if (editorMode === 'template') {
                //     component.set({
                //         highlightable: true,
                //         droppable: false //only allow droppable to replace current element
                //     });
                // }else {
                    component.set({

                        removable: false,
                        copyable: false,
                        badgable: false,
                        highlightable: true,
                        droppable: true,
                        //type: 'default'
                    });
                // }

            }

            // if (editorMode === 'template') {
            //     if (isPlaceholder) {
            //         component.set({
            //             type: 'default',
            //             removable: true,
            //             highlightable: true,
            //             droppable: true
            //         });
            //     }
            // }

            var inside = (isPlaceholder || insidePlaceholder);


            var comsArr = component.get('components');
            if (comsArr) {
                comsArr.each(function (c) {
                    updateComp(c, inside);
                });
            }



        };
        // //make base-layout not removable
        var compsArr = storyboard_VM.editor.DomComponents.getComponents();




        compsArr.each(function(c) {
            updateComp(c);
        });

        //add custom component types
        // Workaround: for MjMl generation make sure the element has selectable overridden
        var selectable= (touchpoint && touchpoint.channelType && touchpoint.channelType === 'email' ? true: false);

        dexit.scm.cd.integration.util.addEPComponentType(storyboard_VM.editor.DomComponents, storyboard_VM, selectable);
        storyboard_VM.editor.render();


        storyboard_VM.editor.DomComponents.getWrapper().set({
            droppable: false,
            removable: false,
            draggable: false,
            badgable : false,
            highlightable : false,
            copyable : false,
            resizable : false,
            editable : false
        });

        //add listeners for drag and drop
        // storyboard_VM.editor.on('block:drag:move', storyboard_VM.handleBlockDragMove);
        //
        // storyboard_VM.editor.on('block:drag:stop', storyboard_VM.handleBlockDragStop);

        // storyboard_VM.editor.on('block:drag:move', storyboard_VM.handleBlockDragMove);



        // storyboard_VM.editor.on('canvas:dragover', storyboard_VM.handleBlockDragMove);



        storyboard_VM.editor.on('canvas:drop', storyboard_VM.handleBlockDragStop); //maps well for updating on drop


        // storyboard_VM.editor.on('component:dragEnd:before', storyboard_VM.handleComponentDragStopBefore);
        storyboard_VM.editor.on('sorter:drag:end', storyboard_VM.handleComponentDragStopBefore);

        //     function (target, modelToDrop, warns) {
        //     console.log('sorter:drag:end', target, modelToDrop, warns);
        // });

        // storyboard_VM.editor.on('sorter:drag:start', function (target, modelToDrop, warns) {
        //     console.log('sorter:drag:start target:%o modelToDrop:%o', target, modelToDrop, warns);
        // });

        // storyboard_VM.editor.on('canvas:drop', function (dt, currentComp) {
        //     console.log('canvas drop', dt, currentComp);
        // });


        storyboard_VM.editor.on('canvas:dragover', function (dt, currentComp) {

            storyboard_VM.dragTarget = dt.target;

            console.log('canvas dragover dt:%o currentComp:%o', dt.target, currentComp);

        });
        storyboard_VM.editor.on('canvas:dragenter', function(dt, currentComp) {

            console.log('canvas dragenter dt:%o currentComp:%o', dt, currentComp);
        });
        //
        // storyboard_VM.editor.on('canvas:dragdata', function(e, e2) {
        //
        //     console.log('canvas dragdata dt:%o currentComp:%o', e, e2);
        //
        // });
        //
        // storyboard_VM.editor.on('component:remove', function(selectedComponent, e) {
        //     //find in block manager and re-enable
        //
        //
        // });



        // storyboard_VM.editor.on('component:add', function(model, e) {
        //  //  debugger;
        // });

        storyboard_VM.selectedComponent = null;

        storyboard_VM.editor.on('component:selected', function(model, val, options) {
            console.log('selected component:');
            storyboard_VM.selectedComponent = model;

        });

        storyboard_VM.editor.on('component:update', function(component) {

            //on update of trait for presentationRef
            if (component.changed && component.changed.attributes && component.changed.attributes.presentationRef) {
                debugger;

                var elementId = component.attributes.attributes['element-id'];
                var args = {
                    elementId: elementId,
                    presentationRef: component.changed.attributes.presentationRef
                };
                storyboard_VM.updateEPElementDraft(args);

                console.log('presentationRef changed!', component);
            }


            if (component.changed && component.changed['model-iconLink'] && component.changed['model-iconLink'].length > 5) {


                var imageUrl = component.changed['model-iconLink'];
                var eId = component.attributes.attributes['element-id'];
                var params = {
                    elementId: eId,
                    //presentationRef:component.changed.attributes.presentationRef
                    presentationRefArgs: {
                        iconLink:imageUrl
                    }
                };

                storyboard_VM.updateEPElementDraft(params);

                console.log('presentationRef changed!', component);
            }
        });

        storyboard_VM.editor.on('run:tlb-delete', function(selectedComponents, event) {

            //fix issue with delete from canvas not releasing the block on the menu
            var selectedComponent = (selectedComponents && selectedComponents.length > 0 ? selectedComponents[0] : null);

            //re-enable in side menu and update EP draft
            if (selectedComponent && selectedComponent.attributes.type
                && selectedComponent.attributes.type === 'ep-element'
                && selectedComponent.attributes.attributes && selectedComponent.attributes.attributes['element-id']) {


                var elementId = selectedComponent.attributes.attributes['element-id'];

                //remove from draft EP
                storyboard_VM.removeEPElementDraft({elementId:elementId});

                //find in block manager and re-enable
                //update block

                var id = elementId + '-id';
                var block = storyboard_VM.editor.BlockManager.get(id);
                if (!block) {
                    console.error('problem re-enabling block that was previously allocated %s', elementId);
                }

                var attributes = _.extend({}, block.get('attributes'));
                var attributesClass = attributes.class || '';
                //attributes.class = attributesClass + ' disabled-block';
                attributes.class = attributesClass.replace(' allocated', '');

                //check and update class, update
                storyboard_VM.editor.BlockManager.get(id).set({attributes: attributes});
                storyboard_VM.editor.BlockManager.render();

            }

            console.log('delete was run');
        });


        //customize icons for device preview buttons
        storyboard_VM.populateDevicePanel();
        storyboard_VM.setupBlocks(storyboard_VM.editor, function(err, blocks) {
            if (err) {
                console.error('cannot load blocks due to error');
                //TODO: handle error

                return callback(err);
            }

            storyboard_VM.loadAllocationStyle(touchpoint);
            storyboard_VM.loadExternalCSS();
            //always call set css for non custom layout
            if (!layout.custom) {
                storyboard_VM.loadPresetTemplateCSS();


            } else {

            }


            //TODO: find better way to find out if layout has been rendered into editor
            setTimeout(function () {



                if (storyboard_VM.edit_mode) {
                    // load content based on EP regional references? not sure if this is the right spot

                    storyboard_VM.updateHTML(storyboard_VM.currentEP.pattern, blocks);
                }
                callback();
            }, 1500);

            //in edit mode: put elements placed within into


        });




    },


    _behaviourImageUrl:'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/behavior_template.png',
    _intelligenceImageUrl:'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/intelligence_template.png',
    _documentImageUrl:'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/mm_doc_template.png',

    _originalHTMLTemplateLayout:'',
    _templateRegions: [],
    /**
     * Call to initialize for showing CD in
     * @param {object} args
     * @param {object} args.touchpoint
     * @param {string} args.touchpoint.tpId
     * @param {string} args.touchpoint.icon
     * @param {object} args.layout
     * @param {string} args.layout.layoutMarkup
     * @param {string} args.layout.id
     * @param {object} args.layout.regions - in format of key being region identifier and value being an array of element identifiers ie. {1:['a'],2:['c','d']}
     * @param {string} args.layout.id
     * @param {string} [args.mode='allocation'] - mode to instantiate this in
     * @param callback - optionally returns an error
     */
    instantiateTemplateView: function(args, callback) {

        var editorMode = (args.mode ? args.mode : 'allocation');

        //validation
        if (!args || !args.ep) {
            return callback(new Error('Validation: ep is required'));
        }
        if (!args.sc) {
            return callback(new Error('Validation: sc is required'));
        }
        if (!args.touchpoint) {
            return callback(new Error('Validation: touchpoint is required'));
        }
        if (!args.layout || !args.layout.layoutMarkup) {
            return callback(new Error('Validation: valid layout is required'));
        }

        var touchpoint = args.touchpoint;
        var layout = args.layout;
        var layoutContent = (args && args.layout && args.layout.layoutMarkup ? args.layout.layoutMarkup : '');

        //set current TP and layout
        storyboard_VM.selectedTouchpoint(touchpoint);
        storyboard_VM.selectedLayout(layout);
        storyboard_VM.currentEP = args.ep;
        //prepare layour joint js editor html view
        var content = storyboard_VM.loadHTMLTemplate(layoutContent);

        //FIXME: ignoring error
        var style = '';

        var externalCss = storyboard_VM.getExternalCSS().concat(storyboard_VM.getPresetTemplateCSS());

        var externalCssForTemplate = (layout.templateCss ?  layout.templateCss.split(',') : '');

        var otherCSS = (layout.css ?  layout.css.split(',') : '');


        if (otherCSS) {
            externalCss = externalCss.concat(otherCSS);
        }


        externalCss = externalCss.concat(externalCssForTemplate);


        debugger;

        //initialize editor
        storyboard_VM.editor = grapesjs.init({
            storageManager: {type: 'none'},
            container : '#gjs',
            fromElement: false,
            components: content,
            style:style,
            showDevices:0,
            autorender: 0,
            devicePreviewMode:1,
            // allowScripts: 1,
            canvas: {
                styles: externalCss
            },
            styleManager: { sectors:
                [{
                    name: 'General',
                    buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
                    properties:[{
                        name: 'Alignment',
                        property: 'float',
                        type: 'radio',
                        defaults: 'none',
                        list: [
                            { value: 'none', className: 'fa fa-times'},
                            { value: 'left', className: 'fa fa-align-left'},
                            { value: 'right', className: 'fa fa-align-right'}
                        ],
                    }, { property: 'position', type: 'select'}
                    ],
                },
                {
                    name: 'Typography',
                    open: false,
                    buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
                    properties:[
                        { name: 'Font', property: 'font-family'},
                        { name: 'Weight', property: 'font-weight'},
                        { name:  'Font color', property: 'color'},
                        {
                            property: 'text-align',
                            type: 'radio',
                            defaults: 'left',
                            list: [
                                { value : 'left',  name : 'Left',    className: 'fa fa-align-left'},
                                { value : 'center',  name : 'Center',  className: 'fa fa-align-center' },
                                { value : 'right',   name : 'Right',   className: 'fa fa-align-right'},
                                { value : 'justify', name : 'Justify',   className: 'fa fa-align-justify'}
                            ],
                        },{
                            property: 'text-decoration',
                            type: 'radio',
                            defaults: 'none',
                            list: [
                                { value: 'none', name: 'None', className: 'fa fa-times'},
                                { value: 'underline', name: 'underline', className: 'fa fa-underline' },
                                { value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough'}
                            ],
                        },{
                            property: 'text-shadow',
                            properties: [
                                { name: 'X position', property: 'text-shadow-h'},
                                { name: 'Y position', property: 'text-shadow-v'},
                                { name: 'Blur', property: 'text-shadow-blur'},
                                { name: 'Color', property: 'text-shadow-color'}
                            ],
                        }],
                },{
                    name: 'Decorations',
                    open: false,
                    buildProps: ['opacity', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
                    properties: [{
                        type: 'slider',
                        property: 'opacity',
                        defaults: 1,
                        step: 0.01,
                        max: 1,
                        min:0,
                    },{
                        property: 'border-radius',
                        properties  : [
                            { name: 'Top', property: 'border-top-left-radius'},
                            { name: 'Right', property: 'border-top-right-radius'},
                            { name: 'Bottom', property: 'border-bottom-left-radius'},
                            { name: 'Left', property: 'border-bottom-right-radius'}
                        ],
                    },{
                        property: 'box-shadow',
                        properties: [
                            { name: 'X position', property: 'box-shadow-h'},
                            { name: 'Y position', property: 'box-shadow-v'},
                            { name: 'Blur', property: 'box-shadow-blur'},
                            { name: 'Spread', property: 'box-shadow-spread'},
                            { name: 'Color', property: 'box-shadow-color'},
                            { name: 'Shadow type', property: 'box-shadow-type'}
                        ],
                    },{
                        property: 'background',
                        properties: [
                            { name: 'Image', property: 'background-image'},
                            { name: 'Repeat', property:   'background-repeat'},
                            { name: 'Position', property: 'background-position'},
                            { name: 'Attachment', property: 'background-attachment'},
                            { name: 'Size', property: 'background-size'}
                        ],
                    },]
                }]
            },
            plugins: ['grapesjs-ep-elements-plugin']
        });


        const commands = storyboard_VM.editor.Commands;

        commands.add('open-ep-region-selection', (editor, sender, opts) => {
            debugger;
            const modal = editor.Modal;
            const epElements = opts.target.defaults.epElements;

            const blocks = storyboard_VM.currentBlocks;


            //build html to show
            //


            console.log(blocks);
            //const amContainer = am.getContainer();
            const title = opts.modalTitle || '';
            const types = opts.types;
            const accept = opts.accept;
            modal.open({
                title: title,
                content: '<div></div>'
            });

        });

        //TODO: consolidate with _makeRegionsNonSelectable
        var updateComp = function (component, insidePlaceholder) {
            if (!component) {
                return;
            }


            //
            //
            //for component without attribute 'data-region'  make it non-selectable, non-highlightable
            var atts = component.getAttributes();
            var isRegion = (atts && atts['data-region'] ? true : false);

            //
            // var isElement = (atts && atts['element-id'] ? true : false);
            //
            // var isPlaceholder = (atts && atts['data-placeholder'] ? true : false);
            //

            if (!isRegion) {
                //component.set({removable: false, badgable: false, copyable: false});
                component.set({
                    editable: false,
                    badgable:false,
                    removable: true,
                    copyable: false,
                    highlightable: false,
                    droppable: false,
                    selectable: true
                });

                //
                // if (insidePlaceholder) {
                //     component.set({
                //         removable: true
                //     });
                // }
                //
                // if (isElement) {
                //     component.set({
                //         removable: true
                //     });
                // }

            } else {
                component.set({
                    removable: false,
                    copyable: false
                })
                 // debugger;
                // component.set({
                //     highlightable: true,
                //     droppable: true
                //     //droppable: false //only allow droppable to replace current element
                // });
            //
            //
            }
            //
            // if (editorMode === 'template') {
            //     if (isPlaceholder) {
            //         component.set({
            //             type: 'default',
            //             removable: true,
            //             highlightable: true,
            //             droppable: true
            //         });
            //     }
            // }
            //
            // var inside = (isPlaceholder || insidePlaceholder);
            //
            //
            var comsArr = component.get('components');
            if (comsArr) {
                comsArr.each(function (c) {
                    updateComp(c);
                });
            }
            //


        };

        //add custom component types
        debugger;

        //dexit.scm.cd.integration.util.addRegionTemplateComponentType(storyboard_VM.editor.DomComponents, storyboard_VM);

        dexit.scm.cd.integration.util.addEPComponentType(storyboard_VM.editor.DomComponents, storyboard_VM);



        storyboard_VM.editor.render();



        //make backup of original html
        storyboard_VM._originalHTMLTemplateLayout = storyboard_VM.editor.getHtml();

        // //make base-layout not removable
        var compsArr = storyboard_VM.editor.DomComponents.getComponents();

        compsArr.each(function(c) {
            updateComp(c);
        });
        debugger;

        storyboard_VM.editor.DomComponents.getWrapper().set({
            droppable: false,
            removable: false,
            draggable: false,
            badgable : false,
            highlightable : false,
            copyable : false,
            resizable : false,
            editable : false
        });

        //add listeners for drag and drop


        storyboard_VM.editor.on('block:drag:stop', function (model) {
            debugger;
        });
        storyboard_VM.editor.on('canvas:drop', storyboard_VM.handleBlockDragStopTemplate); //maps well for updating on drop


        storyboard_VM.editor.on('sorter:drag:end', storyboard_VM.handleComponentDragStopBefore);



        storyboard_VM.editor.on('canvas:dragover', function (dt, currentComp) {

            storyboard_VM.dragTarget = dt.target;

            console.log('canvas dragover dt:%o currentComp:%o', dt.target, currentComp);

        });
        storyboard_VM.editor.on('canvas:dragenter', function(dt, currentComp) {

            console.log('canvas dragenter dt:%o currentComp:%o', dt, currentComp);
        });


        storyboard_VM.selectedComponent = null;

        storyboard_VM.editor.on('component:selected', function(model, val, options) {
            console.log('selected component:');
            storyboard_VM.selectedComponent = model;

        });

        storyboard_VM.editor.on('component:update', function(component) {

            //on update of trait for presentationRef
            if (component.changed && component.changed.attributes && component.changed.attributes.presentationRef) {
                debugger;

                var elementId = component.attributes.attributes['element-id'];
                var args = {
                    elementId: elementId,
                    presentationRef: component.changed.attributes.presentationRef
                };
                storyboard_VM.updateEPElementDraft(args);

                console.log('presentationRef changed!', component);
            }


            if (component.changed && component.changed['model-iconLink'] && component.changed['model-iconLink'].length > 5) {
                debugger;

                var imageUrl = component.changed['model-iconLink'];
                var eId = component.attributes.attributes['element-id'];
                var params = {
                    elementId: eId,
                    //presentationRef:component.changed.attributes.presentationRef
                    presentationRefArgs: {
                        iconLink:imageUrl
                    }
                };

                storyboard_VM.updateEPElementDraft(params);

                console.log('presentationRef changed!', component);
            }
        });

        storyboard_VM.editor.on('run:tlb-delete', function(selectedComponent, event, arg3) {

            function runDeleteOnSelected(selectedComponent) {
                var type = selectedComponent.get('type');

                debugger;
                //do not delete it, reset the placeholder, and remove ep element references
                if (type === 'data-region-img') {


                    //if there is nothing allocated skip
                    if (selectedComponent.defaults.epElements.length === 0) {
                        return;
                    }


                    //remove reference do not remove element

                    //remove the top epElementId and re-enable block
                    var elementId = selectedComponent.defaults.epElements.shift();


                    if (selectedComponent.defaults.epElements.length === 0) {
                        selectedComponent.set('src','https://s3.us-east.cloud-object-storage.appdomain.cloud/dex-resource/layouts/dexitco-bcc-mobile-menu2/images/400x240.png');
                    }


                    debugger;
                    //re-enable in side menu and update EP draft
                    //remove from draft EP
                    storyboard_VM.removeEPElementDraft({elementId: elementId});

                    //find in block manager and re-enable
                    //update block

                    var id = elementId + '-id';
                    var block = storyboard_VM.editor.BlockManager.get(id);
                    if (!block) {
                        console.error('problem re-enabling block that was previously allocated %s', elementId);
                    }

                    var attributes = _.extend({}, block.get('attributes'));
                    var attributesClass = attributes.class || '';
                    //attributes.class = attributesClass + ' disabled-block';
                    attributes.class = attributesClass.replace(' allocated', '');

                    //check and update class, update
                    storyboard_VM.editor.BlockManager.get(id).set({attributes: attributes});
                    storyboard_VM.editor.BlockManager.render();



                } else {

                    //re-enable in side menu and update EP draft
                    if (selectedComponent && selectedComponent.attributes
                        && selectedComponent.attributes.attributes && selectedComponent.attributes.attributes['element-id']) {


                        var elementId = selectedComponent.attributes.attributes['element-id'];

                        //remove from draft EP
                        storyboard_VM.removeEPElementDraft({elementId: elementId});

                        //find in block manager and re-enable
                        //update block

                        var id = elementId + '-id';
                        var block = storyboard_VM.editor.BlockManager.get(id);
                        if (!block) {
                            console.error('problem re-enabling block that was previously allocated %s', elementId);
                        }

                        var attributes = _.extend({}, block.get('attributes'));
                        var attributesClass = attributes.class || '';
                        //attributes.class = attributesClass + ' disabled-block';
                        attributes.class = attributesClass.replace(' allocated', '');

                        //check and update class, update
                        storyboard_VM.editor.BlockManager.get(id).set({attributes: attributes});
                        storyboard_VM.editor.BlockManager.render();

                    }
                }
            }

            if (!selectedComponent)  {
                return;
            }


            if (_.isArray(selectedComponent)) {
                _.each(selectedComponent, function (comp) {
                    runDeleteOnSelected(comp);
                });

            } else {
                runDeleteOnSelected(selectedComponent);
            }

            console.log('delete was run for template');
        });


        //customize icons for device preview buttons
        storyboard_VM.populateDevicePanel();
        storyboard_VM.setupBlocksForTemplate(storyboard_VM.editor, function(err, blocks) {
            if (err) {
                console.error('cannot load blocks due to error');
                //TODO: handle error

                return callback(err);
            }
            storyboard_VM.currentBlocks = blocks;


            //
            // //storyboard_VM.loadAllocationStyle();
            // storyboard_VM.loadExternalCSS();
            // //always call set css for non custom layout
            // if (!layout.custom) {
            //     storyboard_VM.loadPresetTemplateCSS();
            //
            //
            // } else {
            //
            // }


            //TODO: find better way to find out if layout has been rendered into editor
            setTimeout(function () {



                if (storyboard_VM.edit_mode) {
                    // load content based on EP regional references? not sure if this is the right spot
                    debugger;

                    //editing a template already save an intermediate html so no need to update HTML
                    //just need to disable allocated from (currentEP.pattern.tp[tpId].layout
                    _.each(storyboard_VM.currentEP.pattern.tp, function (tpAndLayout) {
                        var touchpointId = tpAndLayout.touchpoint;
                        var layout = tpAndLayout.layout;
                        if (storyboard_VM.selectedTouchpoint().tpId === touchpointId && layout.id === storyboard_VM.selectedLayout().id) {
                            //go through object of key-[value] : {regionRef:[elementId]}
                            _.each(layout.regions, function (elementIds,regionRef) {

                                _.each(elementIds, function (elementId) {
                                    var id = elementId + '-id';
                                    storyboard_VM.disableBlockDrag(id);
                                });
                            });
                        }
                    });
                }
                callback();
            }, 1500);

        });




    }
};
