/**
 * @copyright Digital Engagement Xperience 2018
 * Viewmodel for EPA
 *
 */
/*global joint, dexit,  */


var campaignPlannerVm = {


    graph:null,
    patternPaper: null,
    pagedCampaigns: ko.observableArray([]),
    activeCampaignPagedItemVM: ko.observable(0),
    createCampaignModalVisible: ko.observable(false),

    pendingCampaignName: ko.observable(''),
    toggleSaveDiagramOnly: ko.observable(false),
    callingVM: null,

    /**
     * Holds the pending campaigns to remove (Each entry of the array is data is from model.attributes.definition)
     */
    toDelete:[],
    campaignWfVisible: ko.observable(false),
    campaignCreationVM: ko.observable(),

    buildMenuTemplates: function() {

    },

    enableSaveButton:  ko.observable(true),

    parsePPObjectSafely: function(data) {
        try{
            var epObject = JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, '\\n'));
            return epObject;
        }catch(err){
            console.error('could not parse epObject');
            return new Error('error occurs when parsing the EP Object from SC property: ' + err);
        }
    },
    loadDiagram: function(id){
        ///pp-obj/
    },
    creativeBriefLink: ko.observable(),
    creativeBriefModalVisible: ko.observable(false),
    selectedCampaignModelId: ko.observable(),
    programBriefModalVisible:ko.observable(false),

    showCreativeBriefProgram: function(){
        campaignPlannerVm.programBriefModalVisible(true);
    },

    saveCreativeBrief: function() {


        var id = campaignPlannerVm.selectedCampaignModelId();
        var cells = campaignPlannerVm.graph.getCells();
        //find potential obstacles (all except current element)
        _.each(cells, function (elem) {
            if (elem.id === id){

                //elem.attributes.definition = _.extend(elem.attributes.definition, data);
                elem.attributes.definition.creativeBriefLink = campaignPlannerVm.creativeBriefLink();
            }
        });

        campaignPlannerVm.creativeBriefModalVisible(false);
        campaignPlannerVm.creativeBriefLink();
    },
    menuVisible: ko.observable(false),
    mode: ko.observable('planning'),
    toggleMenu: function(command) {
        var menu = document.querySelector(".menu-planner");
        menu.style.display = command === "show" ? "block" : "none";
        campaignPlannerVm.menuVisible(!campaignPlannerVm.menuVisible());
    },
    setPosition: ({ top, left }) => {
        var menu = document.querySelector(".menu-planner");
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        campaignPlannerVm.toggleMenu('show');
    },

    showFullPreview: function(def) {

        debugger;
        //look up card
        var found = campaignPlannerVm.callingVM.findCardByEp({epId: def.epId, epRevision: def.epRevision});

        //now find tp info
        if (found && found.ePatterns() && found.ePatterns().length > 0) {

            var tps = found.chosenTPs();
            var tpAndLayouts = found.ePatterns()[0].pattern.tp;

            //FIXME: only showing first TP
            var tpAndLayout = (tpAndLayouts && tpAndLayouts.length > 0 ? tpAndLayouts[0] : null);

            if (!tpAndLayout) {
                return;
            }

            var tp = _.find(tps, {id: tpAndLayout.touchpoint});


            var bccPreview = (tp.type && (tp.type.toLowerCase() === 'ucc' || (tp.type.toLowerCase() === 'bcc')));
            if (bccPreview) {
                var url = campaignPlannerVm.mainVM.previewUrl + '?ep=' + def.epId + '-' + def.epRevision + '&lid=' + tpAndLayout.layout.id + '&tp=' + tp.id;
                window.open(url, '_blank');
            } else { //social
                var preview = 'social-preview/' + '?ep=' + storyboard_VM.currentEP.id + '-' + storyboard_VM.currentEP.revision + '&tp=' + tp.id;
                window.open(preview, '_blank');
            }
        }



        debugger;

    },
    showPublish: ko.observable(false),
    showDynamicCampaign: ko.observable(false),
    showTPAllocator: ko.observable(false),

    init: function (args) {
        campaignPlannerVm.toDelete = [];
        campaignPlannerVm.menuVisible(false);

        campaignPlannerVm.mainVM = args.mainVM;

        //campaignPlannerVm.loadDiagram();


        campaignPlannerVm.clearPaper();
        //init graph and paper
        campaignPlannerVm.prepareShapes();

        campaignPlannerVm.callingVM =  args.callingVM;

        campaignPlannerVm.buildMenuTemplates();
        //prepare TPs



        //if (campaignPlannerVm.showCampaignSelection()) {
        campaignPlannerVm.initCampaigns();
        // } else {
        //     campaignPlannerVm.pagedCampaigns([]);
        // }

        if (args && args.mode && args.mode === 'review') {
            campaignPlannerVm.mode('review');
        }else {
            campaignPlannerVm.mode('planning')
        }


        var parentBcType = campaignPlannerVm.mainVM.currBCType();
        //set the  BC def
        dexit.app.ice.integration.bcm.retrieveBCDefinitionByName(parentBcType, function(err, bcDef) {
            if (err) {
                alert('could not initialize.  Try again later');
            }
            campaignPlannerVm.parentBCDef = bcDef;

        });





        //if editing then should load (or have loaded the graph object for the pattern being edited
        //campaignPlannerVm.graph = dexit.epm.epa.integration.graph;


        //prepare UI
        var workArea =$('#pp-work-area');

        var inserted = $(workArea).append('<div id="paperPP" class="drop-here paper"></div>');
        var paper = $(workArea).children('#paperPP');

        if (!campaignPlannerVm.patternPaper) {

            campaignPlannerVm.patternPaper = new joint.dia.Paper({
                el: paper,
                width: paper.width(),
                height: paper.height(),
                gridSize: 1,
                model: campaignPlannerVm.graph,
                linkPinning: false, //do not allow dangling links
                restrictTranslate: true,
                interactive: {vertexAdd: false},
                multiLinks: false, //do not allow multiple links for same source/destination
                //clickThreshold: 30,  //does not seem to work as expected
                //moveThreshold: 2, //does not seem to work as expected
                // validateMagnet: function (cellView, magnet) {
                //     // Note that this is the default behaviour. Just showing it here for reference.
                //     // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
                //     return (magnet.getAttribute('magnet') !== 'passive');
                // },
                defaultLink: new joint.shapes.cp.ArrowConnector(),
                validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {

                    //prevent link back to self
                    if (cellViewS && cellViewT && cellViewS.model.id === cellViewT.model.id) {
                        return false;
                    }else {
                        return true;
                    }
                },
                //     // Prevent linking back into input port
                //     if (magnetS && magnetS.getAttribute('port-group') === 'in') {
                //         return false;
                //     }
                //     // Prevent linking from output ports to input ports within one element.
                //     if (cellViewS === cellViewT) {
                //         return false;
                //     }
                //     // Prevent linking to output ports.
                //     if (magnetT && magnetT.getAttribute('port-group') !== 'in') {
                //         return false;
                //     }
                //
                //     //else return true if everything else has passed
                //     return true;
                //
                // },
                // Enable marking available cells & magnets
                // markAvailable: true,
                snapLinks: {radius: 60}
            });

            campaignPlannerVm.graph.on('add', function (cell) {
                console.log('New cell with id ' + cell.id + ' added to the graph.');
            });

            campaignPlannerVm.patternPaper.on('element:deleteButton:pointerdown', function(elementView, evt) {
                evt.stopPropagation(); // stop any further actions with the element view (e.g. dragging)
                var model = elementView.model;

                campaignPlannerVm.deleteCampaign({model: model});
            });



            campaignPlannerVm.patternPaper.on('element:brief:pointerdown', function(elementView, evt) {

                evt.stopPropagation(); // stop any further actions with the element view (e.g. dragging)
                var model = elementView.model;

                campaignPlannerVm.selectedCampaignModelId(model.id);

                campaignPlannerVm.creativeBriefModalVisible(true);
                //campaignPlannerVm.saveCreativeBrief(model);


                //campaignPlannerVm.deleteCampaign({model: model});
            });



            campaignPlannerVm.patternPaper.on('element:define:pointerdown', function (elementView) {
                if (elementView && elementView.model && !elementView.model.existing) {
                    var currentElement = elementView.model;
                    campaignPlannerVm.showCampaignWfUpdate(currentElement);
                }
            });


            campaignPlannerVm.patternPaper.on('element:menu:pointerdown', function(elementView, evt) {

                evt.stopPropagation(); // stop any further actions with the element view (e.g. dragging)
                var model = elementView.model;
                var isPublished = model.attributes.definition.showPublish;


                var def = model.attributes.definition;
                var card = campaignPlannerVm.callingVM.findCard(def);
                if (card && card.showDynamicCampaign()) {
                    campaignPlannerVm.showDynamicCampaign(true);
                }else {
                    campaignPlannerVm.showDynamicCampaign(false);
                }

                if (card && card.showTPAllocator()) {
                    campaignPlannerVm.showTPAllocator(true);
                }else {
                    campaignPlannerVm.showTPAllocator(false);
                }


                if (isPublished) {
                    campaignPlannerVm.showPublish(true);
                } else {
                    campaignPlannerVm.showPublish(false);
                }

                var pos = elementView.model.get('position');
                var bbox = elementView.getBBox();
                var clientPos = campaignPlannerVm.patternPaper.localToPagePoint(pos.x, pos.y);
                console.log(clientPos);

                var leftOffset = Math.floor(bbox.width * 0.8);
                var topOffset = -6;//Math.floor(bbox.height * 0.8);


                campaignPlannerVm.setPosition({left: clientPos.x + leftOffset, top: clientPos.y + topOffset });


                var listener = function(e) {

                    if (e && e.target && e.target.className && e.target.className === 'menu-option') {

                        if (e.target.id === 'planner-menu-option-delete') {

                            campaignPlannerVm.deleteCampaign({model: model});

                        } else if (e.target.id === 'planner-menu-option-clone') {

                            campaignPlannerVm.cloneCampaign({model: model});
                        } else if (e.target.id === 'planner-menu-option-preview') {
                            var def = model.attributes.definition;
                            //TODO: pick more than the first TP
                            debugger;
                            campaignPlannerVm.showFullPreview(def);

                        } else if (e.target.id === 'planner-menu-option-publish') {
                            debugger;

                            var def = model.attributes.definition;
                            var card = campaignPlannerVm.callingVM.findCard(def);

                            if (card && card.currentActivity() && card.currentActivity() === 'scheduling') {
                                campaignPlannerVm.mainVM.shareEP(card.chosenTPs(), card, function () {
                                    //TODO: handle error
                                    campaignPlannerVm.close();
                                });
                            }
                        } else if (e.target.id === 'planner-menu-option-dynamic-campaign') {


                            var def = model.attributes.definition;
                            var card = campaignPlannerVm.callingVM.findCard(def);

                            if (card && card.showDynamicCampaign()) {
                                campaignPlannerVm.callingVM.showDynamicCampaignSelectionModal(card);
                            } else {
                                alert('no dynamic campaigns available');
                            }
                        } else if (e.target.id === 'planner-menu-option-region-allocator') {
                            debugger;

                            var def = model.attributes.definition;
                            var card = campaignPlannerVm.callingVM.findCard(def);

                            if (card && card.showTPAllocator()) {
                                campaignPlannerVm.callingVM.showTouchpointCampaignAllocatorModal(card);
                                //showDynamicCampaignSelectionModal(card);
                            } else {
                                alert('no regions available');
                            }
                        }


                        if(campaignPlannerVm.menuVisible()) {
                            campaignPlannerVm.toggleMenu("hide");
                            campaignPlannerVm.showPublish(false);
                        }

                    } else {
                        if(campaignPlannerVm.menuVisible()) {
                            campaignPlannerVm.toggleMenu("hide");
                        }
                    }

                    window.removeEventListener('click',listener);
                };

                //add event listenter for anywhere except menu
                setTimeout( () => {
                    window.removeEventListener('click',listener);
                    //window.removeEventListener('click',listener)
                    window.addEventListener("click", listener);


                },200);

            });



        }
        debugger;
        if (args.ppId) {
            campaignPlannerVm.loadPPUIObjectById(args.ppId);
        }else {

            if (args.ppObject && _.isString(args.ppObject)) {

                args.ppObject = campaignPlannerVm.parsePPObjectSafely(args.ppObject);
                if (args.ppObject instanceof Error) {
                    alert('failed to load existing plan');
                }

            }

            //if existing diagram then load
            if (args.ppObject && !_.isEmpty(args.ppObject)) {
                campaignPlannerVm.loadPPUIObject(args.ppObject);


            }

        }

        campaignPlannerVm.resizeGraph();
        window.addEventListener('resize', _.debounce(function() { campaignPlannerVm.resizeGraph(); },200), false);


        campaignPlannerVm.enableSaveButton(true);
    },

    clear: function () {
        campaignPlannerVm.clearGraph();
    },

    clearPaper: function () {
        //clear graph
        campaignPlannerVm.clearGraph();
        //clear paper
        if (campaignPlannerVm.patternPaper) {
            campaignPlannerVm.patternPaper.remove();
            campaignPlannerVm.patternPaper = null;

        }
    },


    /**
     *
     * @param {object} args
     * @param {string} args.parentBciId - parent BC id
     * @param {string} args.parentBc - parent BC Type
     * @param {string} args.id - epId
     * @param {string} args.name
     * @param {string} args.renderText
     * @param {string} args.renderType
     * @param {string} args.scId
     * @param {string} args.src - epId
     * @param {string} args.subType
     * @param {string} args.subtype - same as subType
     * @param {string} args.type - intelligence
     *
     *
     *
     * id: "231202"
     intelId: "fixme"
     name: "overlay simple"
     renderText: "overlay simple"
     renderType: "flex-intelligence"
     scId: "a8887f05-9771-48f5-8042-3ccb75f38ca0"
     src: "231202"
     subType: "engagement-pattern"
     subtype: "engagement-pattern"
     type: "intelligence"
     *
     */
    addItem: function(args) {
        campaignPlannerVm.addCampaign(args,true);
    },
    prepareShapes: function() {

        if (joint.shapes.cp){
            return;
        }

        // joint.dia.Element.define('planner.Campaign', {
        //     size: { width: 180, height: 70 },
        //     attrs: {
        //         rect: { width: 170, height: 60},
        //         body: {
        //             refWidth: '100%',
        //             refHeight: '100%',
        //             strokeWidth: 2,
        //             fill: '#FFFFFF',
        //             stroke: 'none',
        //             rx: 10, ry: 10
        //         },
        //         parent: {
        //             textAnchor: 'middle',
        //             fontWeight: '800',
        //             fontFamily: 'Courier New', 'font-size': 14,
        //         },
        //         label: {
        //             textVerticalAnchor: 'middle',
        //             textAnchor: 'end',
        //             refX: '50%',
        //             refY: '50%',
        //             fontSize: 14,
        //             fontWeight: '800',
        //             fontFamily: 'Courier New', 'font-size': 14
        //         },
        //         deleteButton: {
        //             cursor: 'pointer',
        //             ref: 'deleteButtonLabel',
        //             refWidth: '150%',
        //             refHeight: '150%',
        //             refX: '-25%',
        //             refY: '-25%'
        //         },
        //         deleteButtonLabel: {
        //             pointerEvents: 'none',
        //             refX: '100%',
        //             refY: 0,
        //             fontColor: 'red',
        //             textAnchor: 'middle',
        //             textVerticalAnchor: 'middle'
        //         }
        //     }
        // }, {
        //     markup: [{
        //         tagName: 'rect',
        //         selector: 'body',
        //     }, {
        //         tagName: 'text',
        //         selector: 'parent'
        //     }, {
        //         tagName: 'text',
        //         selector: 'label'
        //     }, {
        //         tagName: 'rect',
        //         selector: 'deleteButton'
        //     }, {
        //         tagName: 'text',
        //         selector: 'deleteButtonLabel'
        //     }]
        //     //markup: '<g class="rotatable"><g class="scalable"><rect class="card"/></g><text class="rank"/><text class="name"/></g>',
        // });


        //before adding menu
        // joint.dia.Element.define('planner.Campaign', {
        //     size: { width: 225, height: 110 },
        //     attrs: {
        //         rect: {
        //             width: 215,
        //             height: 100,
        //             'fill': '#FFFFFF',
        //             'color':'#000000'},
        //         body: {
        //             refWidth: '100%',
        //             refHeight: '100%',
        //             strokeWidth: 1,
        //             fill: '#FFFFFF',
        //             stroke: '#000000',
        //             rx: 5, ry: 5,
        //             filter: {
        //                 name: 'dropShadow',
        //                 args: {
        //                     dx: 1,
        //                     dy: 1,
        //                     blur: 1
        //                 }
        //             }
        //         },
        //         label: {
        //             textVerticalAnchor: 'middle',
        //             // textAnchor: 'start',
        //             refX: '10%',
        //             refY: '20%',
        //             fontSize: 16,
        //             fontWeight: '800',
        //             color:'black',
        //             'z-index':10,
        //             fontFamily: 'Oxygen', 'font-size': 16
        //         },
        //         editButton: {
        //             cursor: 'pointer',
        //             ref: 'editButtonLabel',
        //             fill:'#6D6D6D',
        //             rx: 3, ry: 3,
        //             width: 45,
        //             height: 20,
        //             refX: -10,
        //             refY: -2
        //         },
        //         editButtonLabel: {
        //             pointerEvents: 'none',
        //             refX: '45%',
        //             refY: '81%',
        //             fontSize: 16,
        //             //color:'#ff000b',
        //             //fill:'#ff000b'
        //             fill:'#ffffff'
        //             // fill:'#ff000b'
        //         },
        //         briefButton: {
        //             cursor: 'pointer',
        //             ref: 'briefButtonLabel',
        //             fill:'#6D6D6D',
        //             width: 45,
        //             height: 20,
        //             rx: 3, ry: 3,
        //             refX: -10,
        //             refY: -2
        //             //refX: '75%',
        //             //refY: '90%'
        //         },
        //         briefButtonLabel: {
        //             pointerEvents: 'none',
        //             refX: '75%',
        //             refY: '81%',
        //             fontSize: 16,
        //             fill:'#ffffff'
        //             //fill:'#ff000b'
        //         },
        //         deleteButton: {
        //             cursor: 'pointer',
        //             ref: 'deleteButtonLabel',
        //             //width: 10,
        //             //height:10
        //             refWidth: '110%',
        //             refHeight: '110%',
        //             refX: '1%',
        //             refY: '0%'
        //         },
        //         deleteButtonLabel: {
        //             pointerEvents: 'none',
        //             width:20,
        //             height:20,
        //             'xlink:href': '/images/trash_icon.png',
        //             opacity: 0.7,
        //             refX: '90%',
        //             //refX: '90%',
        //             refY: '10%',
        //             //d:'M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z'
        //             // fontColor: 'red',
        //             // textAnchor: 'middle',
        //             // textVerticalAnchor: 'middle'
        //         }
        //     }
        // }, {
        //     markup: [{
        //         tagName: 'rect',
        //         selector: 'body',
        //     }, {
        //         tagName: 'text',
        //         selector: 'label'
        //     }, {
        //         tagName: 'rect',
        //         selector: 'deleteButton'
        //     }, {
        //         tagName: 'image',
        //         selector: 'deleteButtonLabel'
        //     }, {
        //         tagName: 'rect',
        //         selector: 'editButton'
        //     }, {
        //         tagName: 'text',
        //         selector: 'editButtonLabel'
        //     }, {
        //         tagName: 'rect',
        //         selector: 'briefButton'
        //     }, {
        //         tagName: 'text',
        //         selector: 'briefButtonLabel'
        //     } ]
        //     //markup: '<g class="rotatable"><g class="scalable"><rect class="card"/></g><text class="rank"/><text class="name"/></g>',
        // });
        joint.dia.Element.define('planner.Campaign', {
            size: { width: 225, height: 110 },
            attrs: {
                rect: {
                    width: 215,
                    height: 100,
                    'fill': '#FFFFFF',
                    'color':'#000000'},
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    strokeWidth: 1,
                    fill: '#FFFFFF',
                    stroke: '#000000',
                    rx: 5, ry: 5,
                    filter: {
                        name: 'dropShadow',
                        args: {
                            dx: 1,
                            dy: 1,
                            blur: 1
                        }
                    }
                },
                menuTop: {
                    cursor: 'pointer',
                    rx:10,
                    ry:10,
                    fill: '#e4e5dc',
                    ref: 'rect',
                    refX: '95%',
                    //refX: '90%',
                    refY: '10%',
                },
                e1: {
                    ref: 'menuTop',
                    cx:1,
                    cy:1,
                    rx:2,
                    ry:2,
                    refX: '5',
                    refY: '40%',
                    // fill: '#FF0000'
                    fill:'#000000'
                },
                e2: {
                    ref: 'menuTop',
                    cx:4,
                    cy:1,
                    rx:2,
                    ry:2,
                    refX: '6',
                    refY: '40%',
                    //fill: '#008000'
                    fill:'#000000'
                },
                e3: {
                    ref: 'menuTop',
                    cx:7,
                    cy:1,
                    rx:2,
                    ry:2,
                    refX: '7',
                    refY: '40%',
                    fill:'#000000'
                },
                label: {
                    textVerticalAnchor: 'middle',
                    // textAnchor: 'start',
                    refX: '10%',
                    refY: '20%',
                    fontSize: 16,
                    fontWeight: '800',
                    color:'black',
                    'z-index':10,
                    fontFamily: 'Oxygen', 'font-size': 16
                },
                editButton: {
                    cursor: 'pointer',
                    ref: 'editButtonLabel',
                    fill:'#6D6D6D',
                    rx: 3, ry: 3,
                    width: 45,
                    height: 20,
                    refX: -10,
                    refY: -2
                },
                editButtonLabel: {
                    pointerEvents: 'none',
                    refX: '45%',
                    refY: '81%',
                    fontSize: 16,
                    //color:'#ff000b',
                    //fill:'#ff000b'
                    fill:'#ffffff'
                    // fill:'#ff000b'
                },
                briefButton: {
                    cursor: 'pointer',
                    ref: 'briefButtonLabel',
                    fill:'#6D6D6D',
                    width: 45,
                    height: 20,
                    rx: 3, ry: 3,
                    refX: -10,
                    refY: -2
                    //refX: '75%',
                    //refY: '90%'
                },
                briefButtonLabel: {
                    pointerEvents: 'none',
                    refX: '75%',
                    refY: '81%',
                    fontSize: 16,
                    fill:'#ffffff'
                    //fill:'#ff000b'
                },
                deleteButton: {
                    // cursor: 'pointer',
                    ref: 'deleteButtonLabel',
                    //width: 10,
                    //height:10
                    refWidth: '110%',
                    refHeight: '110%',
                    refX: '1%',
                    refY: '100%'
                },
                deleteButtonLabel: {
                    pointerEvents: 'none',
                    width:20,
                    height:20,
                    //'xlink:href': '/images/trash_icon.png',
                    opacity: 0.7,
                    refX: '00%',
                    //refX: '90%',
                    refY: '10%',
                    //d:'M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z'
                    // fontColor: 'red',
                    // textAnchor: 'middle',
                    // textVerticalAnchor: 'middle'
                }
            }
        }, {
            markup: [{
                tagName: 'rect',
                selector: 'body',
            }, {
                tagName: 'text',
                selector: 'label'
            }, {
                tagName: 'rect',
                selector: 'deleteButton'
            }, {
                tagName: 'image',
                selector: 'deleteButtonLabel'
            }, {
                tagName: 'rect',
                selector: 'editButton'
            }, {
                tagName: 'text',
                selector: 'editButtonLabel'
            }, {
                tagName: 'rect',
                selector: 'briefButton'
            }, {
                tagName: 'text',
                selector: 'briefButtonLabel'
            },
                {
                    tagName: 'ellipse',
                    selector: 'menuTop',
                },
                {
                    tagName: 'ellipse',
                    selector: 'e1',
                },
                {
                    tagName: 'ellipse',
                    selector: 'e2',
                },
                {
                    tagName: 'ellipse',
                    selector: 'e3',
                }
            ]
            //markup: '<g class="rotatable"><g class="scalable"><rect class="card"/></g><text class="rank"/><text class="name"/></g>',
        });


        //
        // joint.dia.Element.define('planner.Campaign3', {
        //     size: { width: 180, height: 70 },
        //     attrs: {
        //         rect: { width: 170, height: 60},
        //         body: {
        //             refWidth: '100%',
        //             refHeight: '100%',
        //             strokeWidth: 2,
        //             fill: '#FFFFFF',
        //             stroke: 'none',
        //             rx: 10, ry: 10
        //         },
        //         parent: {
        //             textAnchor: 'middle',
        //             fontWeight: '800',
        //             fontFamily: 'Courier New', 'font-size': 14,
        //         },
        //         label: {
        //             textVerticalAnchor: 'middle',
        //             textAnchor: 'end',
        //             refX: '50%',
        //             refY: '50%',
        //             fontSize: 14,
        //             fontWeight: '800',
        //             fontFamily: 'Courier New', 'font-size': 14
        //         },
        //         deleteButton: {
        //             cursor: 'pointer',
        //             ref: 'deleteButtonLabel',
        //             refWidth: '150%',
        //             refHeight: '150%',
        //             refX: '-25%',
        //             refY: '-25%'
        //         },
        //         deleteButtonLabel: {
        //             pointerEvents: 'none',
        //             refX: '100%',
        //             refY: 0,
        //             fontColor: 'red',
        //             textAnchor: 'middle',
        //             textVerticalAnchor: 'middle'
        //         }
        //     }
        // }, {
        //     markup: [{
        //         tagName: 'rect',
        //         selector: 'body',
        //     }, {
        //         tagName: 'text',
        //         selector: 'parent'
        //     }, {
        //         tagName: 'text',
        //         selector: 'label'
        //     }, {
        //         tagName: 'rect',
        //         selector: 'deleteButton'
        //     }, {
        //         tagName: 'text',
        //         selector: 'deleteButtonLabel'
        //     }]
        //     //markup: '<g class="rotatable"><g class="scalable"><rect class="card"/></g><text class="rank"/><text class="name"/></g>',
        // });


        joint.dia.Element.define('planner.Campaign2', {
            size: { width: 400,height: 150 },
            attrs: {
                '.st0': {
                    'fill': '#4C7BBE',
                    'color':'#FFFFFF'
                },
                '.st1': {
                    'fill': '#FFFFFF',
                    cursor: 'pointer'
                },
                '.st2': {
                    'font-family': 'OpenSans-SemiBold'
                },
                '.st3': {
                    'font-size': '24px'
                },
                '.st4': {
                    'fill': '#FFFFFF',
                    'stroke': '#BED8F1',
                    'stroke-width': '2',
                    'stroke-miterlimit': '10'
                },
                '.st5': {
                    'font-family': 'OpenSans-ExtraBold'
                },
                '.st6': {
                    'font-size': '18px'
                },
                '.st7': {
                    'display': 'none',
                    'fill': '#919191'
                },
                '.st8': {
                    'fill': '#505354'
                },
                '.st9': {
                    'font-family': 'OpenSans-Bold'
                },
                '.st10': {
                    'font-size': '10px'
                },
                '.st11': {
                    'display': 'none',
                    'fill': '#FFFFFF'
                },
                '.st12': {
                    'font-size': '37px'
                },
                '.st13': {
                    'display': 'none'
                },
                '.st14': {
                    'display': 'inline'
                },
                '.st15': {
                    'fill': 'none',
                    'stroke': '#D1E5F6',
                    'stroke-miterlimit': '10'
                },
                '#close_x5F_button': {
                    cursor: 'pointer'
                },
                '#assign_x5F_edit': {
                    cursor: 'pointer'
                },
                '#plus_x5F_icon': {
                    cursor: 'pointer'
                }



                // rect: { width: 170, height: 60},
                // body: {
                //     refWidth: '100%',
                //     refHeight: '100%',
                //     strokeWidth: 2,
                //     fill: '#FFFFFF',
                //     stroke: 'none',
                //     rx: 10, ry: 10
                // },
                // parent: {
                //     textAnchor: 'middle',
                //     fontWeight: '800',
                //     fontFamily: 'Courier New', 'font-size': 14,
                // },
                // label: {
                //     textVerticalAnchor: 'middle',
                //     textAnchor: 'end',
                //     refX: '50%',
                //     refY: '50%',
                //     fontSize: 14,
                //     fontWeight: '800',
                //     fontFamily: 'Courier New', 'font-size': 14
                // },
                // deleteButton: {
                //     cursor: 'pointer',
                //     ref: 'deleteButtonLabel',
                //     refWidth: '150%',
                //     refHeight: '150%',
                //     refX: '-25%',
                //     refY: '-25%'
                // },
                // deleteButtonLabel: {
                //     pointerEvents: 'none',
                //     refX: '100%',
                //     refY: 0,
                //     fontColor: 'red',
                //     textAnchor: 'middle',
                //     textVerticalAnchor: 'middle'
                // }
            }
        }, {
            // markup: [{
            //     tagName: 'rect',
            //     selector: 'body',
            // }, {
            //     tagName: 'text',
            //     selector: 'parent'
            // }, {
            //     tagName: 'text',
            //     selector: 'label'
            // }, {
            //     tagName: 'rect',
            //     selector: 'deleteButton'
            // }, {
            //     tagName: 'text',
            //     selector: 'deleteButtonLabel'
            // }]
            markup: '<g id="background">\n' +
            '\t<path class="st0" d="M375.3,210.9c0,6.6-5.4,12-12,12H32.6c-6.6,0-12-5.4-12-12V39.1c0-6.6,5.4-12,12-12h342.7"/>\n' +
            '</g>\n' +
            '<g id="campaign_x5F_name">\n' +
            '\t<text id="label" joint-selector="label" transform="matrix(1 0 0 1 101.97 98.7085)" class="st1 st2 st3">Campaign Name</text>\n' +
            '</g>\n' +
            '<g id="close_x5F_button">\n' +
            '\t<circle event="element:deleteButton:pointerdown" joint-selector="deleteButton" class="st4" cx="374.4" cy="27.2" r="13.9"/>\n' +
            '\t<text joint-selector="deleteButtonLabel" transform="matrix(1 0 0 1 368.4736 32.9578)" class="st0 st5 st6">x</text>\n' +
            '</g>\n' +
            '<g id="progress_x5F_bar">\n' +
            '\t<rect id="percentage_backing" x="58.7" y="192.8" class="st1" width="278.3" height="15.9"/>\n' +
            '\t<rect id="percentage_par" x="58.7" y="192.8" class="st7" width="66.1" height="15.9"/>\n' +
            '\t<text transform="matrix(1 0 0 1 65.3561 204.476)" class="st8 st9 st10">0%</text>\n' +
            '\t<text transform="matrix(1 0 0 1 65.3561 204.476)" class="st11 st9 st10">0%</text>\n' +
            '</g>\n' +
            '<g id="assign_x5F_edit">\n' +
            '\t<circle event="element:define:pointerdown" id="circle_1_" class="st1" cx="163.2" cy="153.4" r="20.9"/>\n' +
            '\t<text id="plus_x5F_icon" transform="matrix(1 0 0 1 152.7635 166.8769)" class="st0 st5 st12">+</text>\n' +
            '\t<g id="pencil" class="st13">\n' +
            '\t\t<g id="create" class="st14">\n' +
            '\t\t\t<path class="st0" d="M152.2,160.3v5h5l14.5-14.6l-5-5L152.2,160.3z M175.4,146.9c0.5-0.5,0.5-1.3,0-1.8l-3-3\n' +
            '\t\t\t\tc-0.5-0.5-1.3-0.5-1.8,0l-2.4,2.4l5,5L175.4,146.9z"/>\n' +
            '\t\t</g>\n' +
            '\t</g>\n' +
            '</g>\n' +
            '<g id="brief">\n' +
            '\t<circle joint-selector="brief" event="element:brief:pointerdown" id="circle" class="st1" cx="231.2" cy="153.4" r="20.9"/>\n' +
            '\t<g id="upload" class="st13">\n' +
            '\t\t<g class="st14">\n' +
            '\t\t\t<g>\n' +
            '\t\t\t\t<path class="st0" d="M231.1,140.3l-4.8,4.8c-0.5,0.5-0.4,0.8,0.3,0.8h2.7l0,5.8c0,1,0.8,1.8,1.8,1.8l0,0c1,0,1.8-0.8,1.8-1.8\n' +
            '\t\t\t\t\tl0-5.8h2.7c0.7,0,0.8-0.3,0.3-0.8L231.1,140.3z"/>\n' +
            '\t\t\t\t<path class="st0" d="M241.5,152h-2.7c-0.3,0-0.5,0.2-0.5,0.5v8.1h-14.2v-8.1c0-0.3-0.2-0.5-0.5-0.5h-2.7c-0.3,0-0.5,0.2-0.5,0.5\n' +
            '\t\t\t\t\tv9.3c0,1.4,1.1,2.5,2.5,2.5h16.4c1.4,0,2.5-1.1,2.5-2.5v-9.3C241.9,152.2,241.7,152,241.5,152z"/>\n' +
            '\t\t\t</g>\n' +
            '\t\t</g>\n' +
            '\t</g>\n' +
            '\t<path id="brief_1_" class="st0" d="M238,141.3h-13.8c-1.3,0-2.3,1-2.3,2.3v19.7c0,1.3,1,2.3,2.3,2.3H238c1.3,0,2.3-1,2.3-2.3v-19.7\n' +
            '\t\tC240.3,142.4,239.3,141.3,238,141.3z M238.7,163.4c0,0.4-0.3,0.7-0.7,0.7h-13.8c-0.4,0-0.7-0.3-0.7-0.7v-19.7\n' +
            '\t\tc0-0.4,0.3-0.7,0.7-0.7H238c0.4,0,0.7,0.3,0.7,0.7V163.4z"/>\n' +
            '\t<line class="st15" x1="225.2" y1="146.5" x2="237.3" y2="146.5"/>\n' +
            '\t<line class="st15" x1="225.2" y1="149.5" x2="237.3" y2="149.5"/>\n' +
            '\t<line class="st15" x1="225.2" y1="152.5" x2="237.3" y2="152.5"/>\n' +
            '\t<line class="st15" x1="225.2" y1="155.5" x2="237.3" y2="155.5"/>\n' +
            '\t<line class="st15" x1="225.2" y1="158.5" x2="237.3" y2="158.5"/>\n' +
            '\t<g id="mag">\n' +
            '\t\t<g>\n' +
            '\t\t\t<path class="st0" d="M234.6,149.1c0-2.4-2-4.4-4.4-4.4c-2.4,0-4.4,2-4.4,4.4c0,2.4,2,4.4,4.4,4.4\n' +
            '\t\t\t\tC232.6,153.6,234.6,151.6,234.6,149.1z M230.1,152.4c-1.8,0-3.3-1.5-3.3-3.3c0-1.8,1.5-3.3,3.3-3.3c1.8,0,3.3,1.5,3.3,3.3\n' +
            '\t\t\t\tC233.4,151,232,152.4,230.1,152.4z"/>\n' +
            '\t\t\t<path class="st0" d="M237.2,154.6l-2.7-2.7c-0.4,0.6-0.9,1.2-1.6,1.6l2.7,2.7c0.4,0.4,1.1,0.4,1.6,0\n' +
            '\t\t\t\tC237.6,155.7,237.6,155,237.2,154.6z"/>\n' +
            '\t\t</g>\n' +
            '\t</g>\n' +
            '</g>',
        });


        joint.dia.Link.define('cp.ArrowConnector', {
            router: { name: 'manhattan' },
            attrs: {
                line: {
                    connection: true,
                    stroke: '#333333',
                    strokeWidth: 2,
                    strokeLinejoin: 'round',
                    targetMarker: {
                        'type': 'path',
                        'd': 'M 10 -5 0 0 10 5 z'
                    }
                },
                wrapper: {
                    connection: true,
                    strokeWidth: 10,
                    strokeLinejoin: 'round'
                }
            }
        }, {
            markup: [{
                tagName: 'path',
                selector: 'wrapper',
                attributes: {
                    'fill': 'none',
                    'cursor': 'pointer',
                    'stroke': 'transparent'
                }
            }, {
                tagName: 'path',
                selector: 'line',
                attributes: {
                    'fill': 'none',
                }
            }]
        });

        // joint.shapes.cp = {};
        //
        // joint.shapes.cp.ArrowConnector = joint.dia.Link.extend({
        //     defaults: joint.util.deepSupplement({
        //         type: 'epa.FlowConnector',
        //         source: { selector: '.card' }, target: { selector: '.card' },
        //
        //         connector: { name: 'rounded' },
        //         attrs: { '.connection': { stroke: '#8c8c8c', 'stroke-width': 1 },
        //             '.marker-target': { fill: '#CCC' }
        //         },
        //         z: -1
        //     },joint.dia.Link.prototype.defaults)
        // });
    },



    showCreateCampaignModal: function() {
        campaignPlannerVm.pendingCampaignName('');
        //campaignPlannerVm
        campaignPlannerVm.createCampaignModalVisible(true);
    },


    addNewCampaign: function() {
        //show popover and get name
        var name = campaignPlannerVm.pendingCampaignName();


        var parent = {
            name: campaignPlannerVm.callingVM.businessConceptInstance.property.name,
            id: campaignPlannerVm.callingVM.businessConceptInstance.id,
            bc: campaignPlannerVm.callingVM.businessConceptInstance.property.class || campaignPlannerVm.callingVM.businessConceptInstance.property.type
        };


        campaignPlannerVm.pendingCampaignName('');
        var params = {
            name: name,
            parent:parent
        };
        campaignPlannerVm.addCampaign(params);
    },


    /**
     *
     * @param {object} args
     * @param {string} args.name - name of the Campaign
     * @param {string} args.name - name of the Campaign
     * @param {object} args.parent
     * @param {string} args.parent.name - Name of the program
     * @param {string} args.parent.bc - Business Concept (ie. "program")
     * @param {string} args.parent.id - identifier for BCi (same as SC id)
     * @param {boolean} [existing=falsey]
     */
    addCampaign: function(args, existing) {

        var position =  {
            x: 20,
            y: 20
        };
        var params = {
            name: args.name,
            parent: args.parent,
            tempId: joint.util.uuid()
        };
        if (existing) {
            params.scId  = args.scId;
            params.bc = args.bc;
            params.epId = args.epId;
            params.existing = true;
            campaignPlannerVm.createElement(position,params);
        }else {

            campaignPlannerVm.createElement(position,params);

            // campaignPlannerVm.showCampaignWf(params);
        }

    },
    showCampaignWfUpdate: function(model) {
        var def = model.attributes.definition;

        var params = {
            id: model.id,
            name: def.name,
            parent: def.parent,
            existingData: def.data || {}
        };

        var mode = 'create';


        if (def.data && def.data.pending || def.data.approved) {
            mode = 'edit';
        }

        if (def.existing) {
            mode = 'edit';
        }

        campaignPlannerVm.showCampaignWf(params, mode);
    },


    showCampaignWf: function(args, mode) {


        var edit = (mode && mode === 'edit' ? true : false);

        //args include:
        //name: args.name,
        //             parent: args.parent (name, id, bc
        //             tempId: joint.util.uuid()


        var mainVM = campaignPlannerVm.mainVM;
        var params = {
            mainVM:mainVM,
            currBCDef: mainVM.currBCDef(),
            parentParams: args.parent,
            parentBCDef: campaignPlannerVm.parentBCDef,
            name: args.name,
            existingData: (args.existingData || null),
            callingVM: campaignPlannerVm,
            parentVM: campaignPlannerVm.callingVM, //used?
            mode: (edit ? 'edit' : 'create'),
            associatedBCDefinitions: mainVM.associatedBCDefinitions,
            parentBCName: ko.utils.unwrapObservable(mainVM.currentParentBCName),
            permissions: {
                //fixme
                behDefinePermission: ko.observable(true),
                brDefinePermission: ko.observable(true),
                metricDefinePermission:ko.observable(true),
                // segmentReportDefinePermission: ko.observable(true),
                userProfileDefinePermission: ko.observable(true),
                associatedBCDefinePermission:ko.observable(true),
                associatedEntityDefinePermission: ko.observable(true),
                tpDefinePermission: ko.observable(true),
                mmDefinePermission: ko.observable(true)
            }
        };
        if (args.id){
            params.existingId = args.id;
        }

        // if (!campaignPlannerVm.campaignCreationVM()) {

        //}
        campaignPlannerVm.campaignCreationVM(new dexit.app.ice.CampaignCreationVM(params));




        if (!edit) {
            campaignPlannerVm.campaignCreationVM().showCreate();
        }else {
            campaignPlannerVm.campaignCreationVM().showUpdate();
        }
        campaignPlannerVm.campaignWfVisible(true);
        //campaignPlannerVm.createElement(position,params);
    },
    hideWf: function() {

        //grab changes
        campaignPlannerVm.campaignCreationVM().clear();
        campaignPlannerVm.campaignWfVisible(false);
    },
    cloneCampaign: function(args) {
        //get attributes for changes
        var model = args.model;
        var def = model.attributes.definition;
        var currentBCParentId = campaignPlannerVm.callingVM.businessConceptInstance.id;

        //make a deep copy of the model
        var newModel = model.clone({deep:true});
        if (_.isArray(newModel)) {
            newModel = newModel[0];
        }
        newModel.attributes.definition.name = newModel.attributes.definition.name + ' new';
        newModel.attributes.attrs.label.text = newModel.attributes.definition.name;
        //move it to the right a bit
        newModel.attributes.position.x = newModel.attributes.position.x + 40;
        //make sure it appears above the old one
        newModel.attributes.z = newModel.attributes.z + 1;


        //update the position to be over 50 points

        //make a copy of the EP later, then updated it during the creation/deletion configuration
        if (def.existing && def.parent && def.parent.id === currentBCParentId) {
            //now modify existing and make a copy
            //set selected  card

            newModel.attributes.definition.existing = false;
            newModel.attributes.definition.clonedNeedsCreation = true;
            newModel.attributes.definition.approved = false;
            newModel.attributes.definition.data.pending = def.data.approved;
            try {
                //remove old approved data to force save and approval of campaign changes
                delete newModel.attributes.definition.data.approved;
            }catch (e) {
                debugger;
            }

            campaignPlannerVm.graph.addCell(newModel);

            // campaignPlannerVm.callingVM.copySelectedEP(def, function (err, result) {
            //     if (err || !result) {
            //         alert('could not clone');
            //     }else {
            //
            //         //make sure to update the existing
            //         //newModel.attributes.definition.existing = true;
            //
            //         newModel.attributes.definition.scId = result.sc.id;
            //         newModel.attributes.definition.epRevision = result.ep[0].revision;
            //
            //         //newModel.attributes.definition.bc = params.bc;
            //         //newModel.attributes.definition.epId = params.epId;
            //         campaignPlannerVm.graph.addCell(newModel);
            //         //also add to exiting
            //         var params = {};
            //         if (def.data && def.data.approved) {
            //             var val = def.data.approved;
            //             // var params = {};
            //             if (val.start_date) {
            //                 params.start_date = val.start_date;
            //             }
            //             if (val.end_date) {
            //                 params.end_date = val.end_date;
            //             }
            //             if (val.cmsConfiguration) {
            //                 params.cmsConfiguration = val.cmsConfiguration;
            //             }
            //         }
            //         if (params && !_.isEmpty(params)) {
            //             campaignPlannerVm.callingVM.addAdditionalParamsToCampaign({scId: result.sc.id}, params);
            //         }
            //     }
            // });
            //



        } else {
            //just add a copy of the model
            campaignPlannerVm.graph.addCell(newModel);
        }

    },

    deleteCampaign: function(args) {
        //get attributes for changes
        var model = args.model;

        //properties
        // name, parent(bc, id, name)
        // existing, scId, bc, epId
        var def = model.attributes.definition;
        var currentBCParentId = campaignPlannerVm.callingVM.businessConceptInstance.id;

        //add to list of campaigns to remove (only if existing, otherwise only exists in the diagram)
        if (def.existing && def.parent && def.parent.id === currentBCParentId) {
            //add to changes
            campaignPlannerVm.toDelete.push(def);
        }
        //remove from diagram
        model.remove();
    },

    /**
     * Forces the render of jointjs element
     * @param {joint.dia.Element} elem - the element that has been updated but needs to be re-rendered
     */
    renderElement: function(elem) {
        //make sure the paper is visible, otherwise the view will become distored
        if (!campaignPlannerVm.campaignWfVisible()) {
            var view = campaignPlannerVm.patternPaper.findViewByModel(elem);
            view.render();

        }else {
            //wait until canvas is visible
            setTimeout(function () {
                campaignPlannerVm.renderElement(elem);
            }, 200)
        }
    },



    updateElementData: function(id, data) {
        if (id) {
            var cells = campaignPlannerVm.graph.getElements();
            //find potential obstacles (all except current element)
            _.each(cells, function (elem) {
                if (elem.id === id){

                    elem.attributes.definition = _.extend(elem.attributes.definition, data);
                    elem.attributes.attrs.label.text = elem.attributes.definition.name;

                    console.log('updated element');
                    //if still visiable wait
                    campaignPlannerVm.renderElement(elem);


                }
            });
            //also save diagram
            campaignPlannerVm.saveDiagram(function (err) {
                if (err) {
                    console.log('error: %o',err);
                    alert('error saving diagram');
                }
            });



        }




    },


    /**
     *
     * @param {object} position
     * @param {number} position.x - x coordinate
     * @param {number} position.y - y coordinate
     * @param {object} params
     * @param {string} params.name - name of campaign
     * @param {object} params.parent - parent BC
     */
    createElement: function (position,params) {

        var name = params.name;
        var parentName = (params.parent && params.parent.name ? params.parent.name : ''); //optional

        var campaignData = (params.data || {});


        var background = params.background || '#c2ede0';


        // var cell = new joint.shapes.planner.Campaign2({
        var cell = new joint.shapes.planner.Campaign({
            position: position,
            attrs: {
                body: {
                    // fill: background
                },
                // '.card': { fill: background},
                // //image: { 'xlink:href': 'images/'+ image, opacity: 0.7 },
                // '.parent': { text: parentName, fill: textColor, 'word-spacing': '-5px', 'letter-spacing': 0},
                // '.name': { text: name, fill: textColor, 'font-size': 13, 'font-family': 'Arial', 'letter-spacing': 0 },
                label: {
                    text: name,
                    // fill: textColor,
                    'font-size': 16, fontFamily:'Oxygen','letter-spacing': 0,
                    //color:'#000000',
                    //fill:'red'
                },
                // '#label': {
                //     text: name
                // },
                // parent: {
                //     ext: parentName, fill: textColor, 'word-spacing': '-5px', 'letter-spacing': 0
                // },
                deleteButton: {
                    event: 'element:deleteButton:pointerdown',
                    fill: 'white',
                    stroke: 'none',
                    strokeWidth: 2
                },
                editButtonLabel: {
                    //fill: 'white',
                    text: 'edit',
                    'font-size': 14, fontFamily:'Oxygen','letter-spacing': 0,
                    color:'#000000'
                },
                editButton: {
                    event: 'element:define:pointerdown',
                },
                menuTop: {
                    event: 'element:menu:pointerdown'
                },
                briefButton: {
                    event: 'element:brief:pointerdown',
                },
                briefButtonLabel: {

                    //fill: 'white',
                    'font-size': 14, fontFamily:'Oxygen', 'letter-spacing': 0,
                    color:'#000000',
                    text: 'brief',
                },
                deleteButtonLabel: {
                    color:'black',
                    fill:'#FFFFFF'
                }
            },
            ports: {
                groups: {
                    left: {position: 'left'},
                    right: {position: 'right'},
                    top: {position: 'top'},
                    bottom: {position: 'bottom'}
                }
            }
        });

        cell.addPort({ group: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#505050', 'stroke-width': 1, fill: '#ffffff' } } });
        cell.addPort({ group: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#505050', 'stroke-width': 1, fill: '#ffffff' } } });

        cell.attributes.definition = {
            parent: params.parent,
            name: name,
            data: campaignData
        };
        if (params.existing) {
            cell.attributes.definition.existing = params.existing;
            cell.attributes.definition.scId = params.scId;
            cell.attributes.definition.bc = params.bc;
            cell.attributes.definition.epId = params.epId;
        }




        campaignPlannerVm.graph.addCell(cell);
        return cell;
    },



    initCampaigns: function () {
        campaignPlannerVm.pagedCampaigns([]);
        campaignPlannerVm.activeCampaignPagedItemVM(0);

        var relationships = campaignPlannerVm.callingVM.bcRelationships;

        var filteredRel = _.filter(relationships, function (val) {
            return (val.ref && val.ref ==='MerchandisingCampaign' && val.navigable && val.navigable === true);
        });

        //TODO: once extra SC is removed for EP, update this logic
        //TODO: move all to service for efficiency and maintainability
        async.auto({
            retrieveForTp: function (cb) {
                async.map(filteredRel, function (rel, done) {

                    var parentBC = rel.ref;
                    var parentBCi = rel.refId;

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
                            dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(campaignPlannerVm.callingVM.mainVM.repo, bci.id, function (err, res) {
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
                            data.parent = {
                                bc: parentBC,
                                id: parentBCi,
                                name: data.course.property.name
                            };
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
                                bc: ep.property.class || ep.property.type,
                                intelId: 'fixme', //TODO: should reference sc element
                                type: 'intelligence',
                                subType: 'engagement-pattern',
                                subtype: 'engagement-pattern',
                                renderType:'flex-intelligence',
                                src: ep.ep[0].id,
                                // iconType: uiElements.icon_type,
                                renderText: ep.property.name,
                                parent: item.parent
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

            //add in EPs from current
            //get info from loaded Vms for cards
            var currItems = _.map(campaignPlannerVm.callingVM.tempCards(), function(card) {
                var ep = (card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0] :null);
                if (ep) {
                    return {
                        name: card.name(),
                        id: ep.id,
                        bc: card.sc().property.class || card.sc().property.type,
                        scId: card.sc().id,
                        intelId: 'fixme', //TODO: should reference sc element
                        type: 'intelligence',
                        subType: 'engagement-pattern',
                        subtype: 'engagement-pattern',
                        renderType: 'flex-intelligence',
                        src: ep.id,
                        // iconType: uiElements.icon_type,
                        renderText: card.name(),
                        parent: {
                            name: campaignPlannerVm.callingVM.businessConceptInstance.property.name,
                            id: campaignPlannerVm.callingVM.businessConceptInstance.id,
                            bc: campaignPlannerVm.callingVM.businessConceptInstance.property.class || campaignPlannerVm.callingVM.businessConceptInstance.property.type
                        }
                    };
                }else
                {
                    return null;
                }
            });
            currItems = _.compact(currItems);
            var curr = {
                title: campaignPlannerVm.callingVM.businessConceptInstance.property.name,
                items: currItems || []
            };
            res.push(curr);



            _.each(res, function (bci) {
                var paged = new dexit.epm.epa.PagedItemVM();
                paged.loadItems(bci);
                campaignPlannerVm.pagedCampaigns.push(paged);
            });


        });

    },




    close: function () {
        // campaignPlannerVm.clearPaper();
        campaignPlannerVm.callingVM.closeProgramPlan();

        //campaignPlannerVm.close();

    },


    refreshDiagram: function() {
        //get all campaigns

        // var bciId = campaignPlannerVm.callingVM.businessConceptInstance.id;
        // var bcName = campaignPlannerVm.callingVM.mainVM.currBCType();
        //

        //TODO: use api call consistent between bc-instance-vm and here

        var campaignCards = campaignPlannerVm.callingVM.tempCards();

        var diagramElements = _.map(campaignCards, function (card) {

            var epId = ( card.ePatterns() && card.ePatterns().length > 0 ? card.ePatterns()[0].id : '');
            var bc = (card.sc().property.type || card.sc().property.class);
            return {
                parent: {
                    name: campaignPlannerVm.callingVM.businessConceptInstance.property.name,
                    id: campaignPlannerVm.callingVM.businessConceptInstance.id,
                    bc: campaignPlannerVm.callingVM.businessConceptInstance.property.class || campaignPlannerVm.callingVM.businessConceptInstance.property.type
                },
                existing: true,
                name: card.sc().property.name,
                scId: card.sc().id,
                bc: bc,
                epId: epId
            };
        });

        //TODO: find and keep any other linked diagrams
        //clear digraam and re-add
        campaignPlannerVm.clearGraph();



        var x = 20;
        var y = 10;

        //180 is width of shape and another 100 for space inbetween
        var spacing = (180 + 100);
        var maxX = campaignPlannerVm.patternPaper.getArea().width - 50;

        _.each(diagramElements, function (args) {

            var position = {
                x: x,
                y: y
            };
            var params = {
                name: args.name,
                parent: args.parent,
                scId:args.scId,
                bc:args.bc,
                epId: args.epId,
                existing: true
            };

            campaignPlannerVm.createElement(position,params);

            x = x + spacing;
            if (x > maxX) {
                x = 10;
                y = y + 180;
            }
        });




        //   var parent = {
        //             name: campaignPlannerVm.callingVM.businessConceptInstance.property.name,
        //             id: campaignPlannerVm.callingVM.businessConceptInstance.id,
        //             bc: campaignPlannerVm.callingVM.businessConceptInstance.property.class || campaignPlannerVm.callingVM.businessConceptInstance.property.type
        //         };
        //
        //   *  cell.attributes.definition = {
        //             parent: parent,
        //             name: name
        //         };
        //              if (params.existing) {
        //             cell.attributes.definition.existing = params.existing;
        //             cell.attributes.definition.scId = params.scId;
        //             cell.attributes.definition.bc = params.bc;
        //             cell.attributes.definition.epId = params.epId;
        //         }
        // dexit.app.ice.integration.bcp.retrieveBCInstance({
        //     type: bcName,
        //     id: bciId
        // }, function (err, bc) {
        //     if (err) {
        //         console.error('cannot retrieve program');
        //         return;
        //     }
        //     var containerElement = sccVM.businessConceptInstance;
        //     var scs = (containerElement.smartcontentobject && containerElement.smartcontentobject.length > 0 ? containerElement.smartcontentobject : []);
        //
        //     //now get all campaigns
        //






        // });
        //get
    },

    addCampaignToProgram: function(val) {

        var bcName = campaignPlannerVm.callingVM.mainVM.currBCDef().bctype || campaignPlannerVm.callingVM.bcName;

        campaignPlannerVm.callingVM.creatingNewWidgetEmpty(val.name,bcName, function (err, resp) {
            if (err) {
                console.warn('could not create campaign:'+val.name);
            }

            //TODO: add all the elments to the existing program



        });


    },


    /**
     * Resizes the paper based on the dimensions available (bind this to window resize event)
     */
    resizeGraph: function() {
        if ( campaignPlannerVm.graph &&  campaignPlannerVm.patternPaper) {
            //use outside container dimensions, not the paper dimenions
            //var rect = dpa_VM.patternPaper.el.getBoundingClientRect();
            var workArea =$('#pp-work-area');
            var width = workArea.width() - 5;
            var height = workArea.height() - 5;
            campaignPlannerVm.patternPaper.setDimensions(width, height);
            campaignPlannerVm.patternPaper.scaleContentToFit({padding:10, minScaleX: 0.3, minScaleY: 0.3, maxScaleX: 1 , maxScaleY: 1, preserveAspectRatio:true});
            // dpa_VM.patternPaper.scaleContentToFit({padding:20, preserveAspectRatio:true});
            //need to reset origin for some reason or else the origin looks to be based on the absolute page height instead of the offset where
            //the paper is
            campaignPlannerVm.patternPaper.setOrigin(0,0);
        }
    },


    /**
     * Saves the diagram only
     */
    saveDiagram: function(callback) {
        debugger;
        callback = callback || (function() {});
        var ppOb = campaignPlannerVm.graphToJSON();

        var previousId = campaignPlannerVm.callingVM.businessConceptInstance.property.ppId;
        var hasPPObject = (campaignPlannerVm.callingVM.businessConceptInstance.property.ppObject ? true : false);

        var id = (previousId ? previousId : joint.util.uuid());



        async.auto({
            save: function (cb) {
                var resource = '/plan-diagram/' + id;
                var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);

                var data = {
                    dataType:'jointjs',
                    data: ppOb
                };
                restStrategy.update(data,function (err, result) {
                    cb(err);
                });
            },
            updateProgramPPObject: ['save', function(cb, results) {
                if (!previousId) {
                    //clear the previous value
                    var changes = [
                        {op: 'replace', path: '/property/ppId', value: id}
                    ];
                    if (hasPPObject) {
                        changes.push({op: 'replace', path: '/property/ppObject', value: '{}'});
                    }

                    var params = {
                        type: campaignPlannerVm.callingVM.businessConceptInstance.property.class,
                        id: campaignPlannerVm.callingVM.businessConceptInstance.id,
                        version: campaignPlannerVm.callingVM.businessConceptInstance.property.version,
                        changes: changes
                    };
                    // dexit.app.ice.integration.bcp.updateBCInstance(params, cb);
                    //
                    // var params = {
                    //
                    // }


                    dexit.app.ice.integration.bcp.updateBCInstance(params, function (err, resp) {
                        if (err) {
                            cb(err);
                        } else {
                            //update version locally
                            campaignPlannerVm.callingVM.businessConceptInstance.property.version = resp.version;
                            if (hasPPObject) {
                                campaignPlannerVm.callingVM.businessConceptInstance.property.ppObject = '{}';
                            }
                            campaignPlannerVm.callingVM.businessConceptInstance.property.ppId = id;
                            dexit.app.ice.integration.bcp.invalidateCacheForBCInstance({
                                type: params.type,
                                id: params.id
                            }, function (err) {

                            });


                            cb();

                        }
                    });


                }else {
                    cb();
                }
            }]
        }, function(err, results) {
            callback(err);
        });
    },


    generateChangeList: function() {

        var toCreate = [];

        var stillRequiresApproval = [];


        var toDelete = campaignPlannerVm.toDelete;

        var cells = campaignPlannerVm.graph.getCells();
        //find potential obstacles (all except current element)

        _.each(cells, function (elem) {
            if (elem.attributes && elem.attributes.type === 'planner.Campaign'  && elem.attributes.definition
                && !elem.attributes.definition.existing) {
                //only allow approved campaigns to be created
                if (elem.attributes.definition.approved) {
                    var data ={
                        id: elem.id,
                        name: elem.attributes.definition.name,
                        data: elem.attributes.definition.data.approved,
                        mmTag: elem.attributes.definition.data.mmTag
                    };
                    if (elem.attributes.definition.clonedNeedsCreation) {
                        data.source = {scId: elem.attributes.definition.scId};
                        data.fromClone = true;
                    }
                    toCreate.push(data);
                    //only after saving the campaign successfully should it be marked as existing...
                    //    elem.attributes.definition.existing = true;
                }else {
                    stillRequiresApproval.push({name: elem.attributes.definition.name, id:elem.id});
                }
            }
        });


        var changes = {
            toDelete: toDelete,
            toCreate: toCreate,
            requiresApproval: stillRequiresApproval
        };


        return changes;
    },

    confirmChangesModalVisible: ko.observable(false),




    pendingDeleteChanges: ko.observableArray([]),
    pendingCreateChanges: ko.observableArray([]),
    pendingApproval: ko.observableArray([]),


    showConfirmChangesModal: function() {
        campaignPlannerVm.confirmChangesModalVisible(true);
    },

    enableSaveChanges: ko.observable(true),
    // enableSaveChanges:ko.pureComputed(function () {
    //     var changes = campaignPlannerVm.pendingChanges();
    //     return (changes.toDelete.length > 0 || changes.toCreate.length > 0);
    // }),


    save: function(){


        var changes = campaignPlannerVm.generateChangeList();
        campaignPlannerVm.pendingCreateChanges(changes.toCreate);
        campaignPlannerVm.pendingDeleteChanges(changes.toDelete);
        campaignPlannerVm.pendingApproval(changes.requiresApproval);

        if (changes.toDelete.length < 1 && changes.toCreate.length < 1) {
            //save only diagram
            campaignPlannerVm.enableSaveButton(false);
            campaignPlannerVm.saveDiagram(function () {
                campaignPlannerVm.enableSaveButton(true);
            });
        }else {
            campaignPlannerVm.showConfirmChangesModal();
        }
    },


    /**
     * Saves the plan, creates any campaigns, removes any campaigns, saves the diagram
     */
    saveChanges: function() {

        campaignPlannerVm.enableSavePlanButton(false);
        campaignPlannerVm.enableSaveButton(false);
        //to create


        //1: extract all changes
        //2: save all the changes
        //3: update the diagram state
        //4: save the diagram
        var pendingChanges = campaignPlannerVm.generateChangeList();


        var toCreate = pendingChanges.toCreate;
        var toDelete = pendingChanges.toDelete;


        setTimeout(function() {
            campaignPlannerVm.confirmChangesModalVisible(false);
        }, 1000);

        async.auto({
            addCampaignData:function (done) {
                campaignPlannerVm.addCampaignDataToProgram(toCreate, function (err, results) {
                    done(err);
                });
            },
            addCampaigns: ['addCampaignData',function(done, results) {
                var update = [];
                if (toCreate.length > 0) {


                    var bcName = campaignPlannerVm.callingVM.mainVM.currBCDef().bctype || campaignPlannerVm.callingVM.bcName;


                    //also need to add any additional items to only campaign start_date, end_date,cmsConfiguration



                    async.each(toCreate, function (val, cb) {

                        //if this is a cloned campaign, try to copy existing element, otherwise create new
                        if (val.fromClone) {
                            //TODO: for now using scId, later should switch to epId and revision
                            var args = {
                                scId: val.source.scId,
                                name: val.name
                            };
                            debugger;
                            campaignPlannerVm.callingVM.copySelectedEP(args, function (err, resp) {
                                if (err || !resp) {
                                    alert('could not clone');
                                }else {



                                    update.push({name: val.name, id: val.id, created: resp});


                                    //make sure to update the existing
                                    //newModel.attributes.definition.existing = true;
                                    //
                                    // newModel.attributes.definition.scId = result.sc.id;
                                    // newModel.attributes.definition.epRevision = result.ep[0].revision;
                                    //
                                    // //newModel.attributes.definition.bc = params.bc;
                                    // //newModel.attributes.definition.epId = params.epId;
                                    // campaignPlannerVm.graph.addCell(newModel);
                                    //also add to exiting
                                    var params = {};
                                    if (val.data) {
                                        // var params = {};
                                        if (val.data.start_date) {
                                            params.start_date = val.data.start_date;
                                        }
                                        if (val.data.end_date) {
                                            params.end_date = val.data.end_date;
                                        }
                                        if (val.data.cmsConfiguration) {
                                            params.cmsConfiguration = val.data.cmsConfiguration;
                                        }

                                        if (val.data.mmIcon) {
                                            params.mmIcon = val.data.mmIcon;
                                        }
                                        if (val.data.iconText) {
                                            params.iconText = val.data.iconText;
                                        }

                                    }
                                    if (params && !_.isEmpty(params)) {
                                        campaignPlannerVm.callingVM.addAdditionalParamsToCampaign({scId: resp.sc.id}, params);
                                    }

                                    //proceed
                                    cb();

                                }
                            });
                            //
                        } else {
                            var params = {};
                            if (val.data.start_date) {
                                params.start_date = val.data.start_date;
                            }
                            if (val.data.end_date) {
                                params.end_date = val.data.end_date;
                            }
                            if (val.data.cmsConfiguration) {
                                params.cmsConfiguration = val.data.cmsConfiguration;
                            }

                            if (val.data.mmIcon) {
                                params.mmIcon = val.data.mmIcon;
                            }
                            if (val.data.iconText) {
                                params.iconText = val.data.iconText;
                            }


                            campaignPlannerVm.callingVM.creatingNewWidgetEmpty(val.name, bcName, params, function (err, resp) {

                                if (err) {
                                    console.warn('could not create campaign:' + val.name);
                                } else {
                                    update.push({name: val.name, id: val.id, created: resp});

                                }
                                //now add the campaign Id to the program....
                                cb();
                            });
                        }
                    }, function (err) {

                        done(null,update);
                    });

                } else {
                    done(null, []);
                }
            }],
            deleteCampaigns: function (done) {
                if (toDelete.length > 0) {
                    //var bcName = campaignPlannerVm.callingVM.mainVM.currBCDef().bctype || campaignPlannerVm.callingVM.bcName;
                    async.each(campaignPlannerVm.toDelete, function (val, cb) {
                        campaignPlannerVm.callingVM.deleteSelectedCampaign(val, function (err, resp) {
                            if (err) {
                                console.warn('could not create campaign:'+val.name);
                            }
                            cb();
                        });
                    }, function (err) {
                        campaignPlannerVm.toDelete = [];
                        done();
                    });
                } else {
                    done();
                }
            },
            updateDiagram: ['addCampaigns',function (done, results) {
                var updatedRefs = results.addCampaigns || [];
                var cells = campaignPlannerVm.graph.getCells();
                _.each(updatedRefs, function (val) {
                    //each update has name, id (model id), and created (the returned reference

                    var item = _.find(cells, function (elem) {
                        return (elem.attributes && elem.attributes.type === 'planner.Campaign' && elem.id === val.id);
                    });
                    if (item) {
                        item.attributes.definition.existing = true;
                        item.attributes.definition.scId = val.created.sc.id;
                        //item.attributes.definition.bc = params.bc;
                        item.attributes.definition.epId = val.created.ep[0].id;
                        item.attributes.definition.epRevision = val.created.ep[0].revision;
                    }
                });

                campaignPlannerVm.saveDiagram(done);

            }]
        }, function (err) {

            campaignPlannerVm.enableSavePlanButton(true);

            if (!err) {
                campaignPlannerVm.callingVM.init({});
                campaignPlannerVm.callingVM.prepareBehaviours();
            }
            campaignPlannerVm.enableSaveButton(true);



        });







        //if not only saving the diagram
        //1: extract all the campaigns to create
        // var cells = campaignPlannerVm.graph.getCells();
        // //find potential obstacles (all except current element)
        //
        // _.each(cells, function (elem) {
        //     if (elem.attributes && elem.attributes.type === 'planner.Campaign'  && elem.attributes.definition
        //     && !elem.attributes.definition.existing) {
        //         if (elem.attributes.definition.approved) {
        //             toCreate.push({name: elem.attributes.definition.name, data:elem.attributes.definition.data.approved, mmTag:elem.attributes.definition.data.mmTag});
        //
        //
        //          //only after saving the campaign successfully should it be marked as existing...
        //         //    elem.attributes.definition.existing = true;
        //         }
        //     }
        // });

        /**
             *
             *  cell.attributes.definition = {
            parent: parent,
            name: name
        };
             if (params.existing) {
            cell.attributes.definition.existing = params.existing;
            cell.attributes.definition.scId = params.scId;
            cell.attributes.definition.bc = params.bc;
            cell.attributes.definition.epId = params.epId;
        }
             */



        // var ppOb = campaignPlannerVm.graphToJSON();
        //
        // var changes = [
        //     {op: 'replace', path: '/property/ppObject', value: ppOb}
        // ];
        // var params = {
        //     type: campaignPlannerVm.callingVM.businessConceptInstance.property.class,
        //     id: campaignPlannerVm.callingVM.businessConceptInstance.id,
        //     version: campaignPlannerVm.callingVM.businessConceptInstance.property.version,
        //     changes: changes
        // };
        // // dexit.app.ice.integration.bcp.updateBCInstance(params, cb);
        // //
        // // var params = {
        // //
        // // }
        //
        //
        // dexit.app.ice.integration.bcp.updateBCInstance(params,function (err, resp) {
        //     if (err) {
        //         alert('Problem saving...Please try again');
        //     }else {
        //         //update version locally
        //         campaignPlannerVm.callingVM.businessConceptInstance.property.version = resp.version;
        //         campaignPlannerVm.callingVM.businessConceptInstance.property.ppObject = ppOb;
        //
        //         dexit.app.ice.integration.bcp.invalidateCacheForBCInstance({
        //             type: params.type,
        //             id: params.id
        //         }, function (err) {
        //
        //         });
        //
        //
        //         if (campaignPlannerVm.toggleSaveDiagramOnly()) {
        //             //add diagram to BC
        //             //campaignPlannerVm.callingVM.businessConceptInstance.propertyIsEnumerable()
        //             //campaignPlannerVm.clearPaper();
        //             campaignPlannerVm.enableSaveButton(true);
        //             //campaignPlannerVm.close();
        //
        //         } else {
        //             async.auto({
        //                 addData: function(done){
        //                     //after create, need to generate saveChanges to add these to the BC
        //
        //                     campaignPlannerVm.addCampaignDataToProgram(toCreate, function (err) {
        //                         done(err);
        //                     });
        //                 },
        //                 create: ['addData',function (done, result) {
        //                     //create campaigns
        //                     if (toCreate.length > 0) {
        //
        //
        //                         var bcName = campaignPlannerVm.callingVM.mainVM.currBCDef().bctype || campaignPlannerVm.callingVM.bcName;
        //
        //                         async.each(toCreate, function (val, cb) {
        //                             campaignPlannerVm.callingVM.creatingNewWidgetEmpty(val.name,bcName, function (err, resp) {
        //                                 if (err) {
        //                                     console.warn('could not create campaign:'+val.name);
        //                                 }
        //
        //                                 //now add the campaign Id to the program....
        //                                 cb();
        //                             });
        //                         }, function (err) {
        //
        //                             done();
        //                         });
        //
        //                     } else {
        //                         done();
        //                     }
        //                 }],
        //                 delete: ['addData',function (done) {
        //                     //delete campaigns
        //
        //                     if (campaignPlannerVm.toDelete.length > 0) {
        //                         //var bcName = campaignPlannerVm.callingVM.mainVM.currBCDef().bctype || campaignPlannerVm.callingVM.bcName;
        //                         async.each(campaignPlannerVm.toDelete, function (val, cb) {
        //                             campaignPlannerVm.callingVM.deleteSelectedCampaign(val, function (err, resp) {
        //                                 if (err) {
        //                                     console.warn('could not create campaign:'+val.name);
        //                                 }
        //                                 cb();
        //                             });
        //                         }, function (err) {
        //                             campaignPlannerVm.toDelete = [];
        //                             done();
        //                         });
        //
        //                     } else {
        //                         done();
        //                     }
        //                 }]
        //             }, function (err) {
        //                 if (!err) {
        //                     campaignPlannerVm.callingVM.init({});
        //
        //                     campaignPlannerVm.callingVM.prepareBehaviours();
        //
        //                 }
        //
        //                 campaignPlannerVm.enableSaveButton(true);
        //                 //campaignPlannerVm.close();
        //
        //             });
        //
        //         }
        //     }
        // });


    },


    addCampaignDataToProgram: function(campaigns, callback) {
        var toAdd = campaigns || [];

        if (toAdd.length < 1) {
            return callback(); //nothing to updated
        }
        var bciId = campaignPlannerVm.callingVM.businessConceptInstance.id;

        var bcName = campaignPlannerVm.callingVM.businessConceptInstance.property.type || campaignPlannerVm.callingVM.businessConceptInstance.property.class;

        dexit.app.ice.integration.bcp.retrieveBCInstance({
            type: bcName,
            id: bciId
        }, function (err, bc) {
            if (err) {
                alert('cannot update program');
                return callback(err);
            }
            var changes = campaignPlannerVm.generateCampaignChangeList(toAdd,bc);


            campaignPlannerVm.updateBCInstance(bc, changes, campaigns, callback);

        });

    },
    updateBCInstance: function(bc, changes, campaigns, callback) {


        var campaignMMTags = _.map(campaigns, function (val) {
            return (val.mmTag);
        });

        var mainBCMMTag = bc.property.mmTag;
        if (!mainBCMMTag) {
            console.warn('multimedia will not set due to missing tag in BC');
        }

        //FIXME: requires adjustment to treat all changes equally.  TPs are treated specially
        async.auto({
            touchpointsToCreate: function (cb) {
                cb();
                // var tps = self.tpsFromBCDef() || [];
                //
                // async.map(tps, function (tpParams, done) {
                //     if (tpParams && tpParams.tpInfo) {
                //         //skip add for ones already existing
                //         return done(null,tpParams.tpInfo.tpId);
                //     }
                //     self._createTouchpoint(tpParams,done);
                // }, function (err, resp) {
                //     if (err) {
                //         console.error('could not create tp');
                //         return cb(err);
                //     }
                //     cb(null,resp);
                //
                // });
            },
            multimediaTags: function (cb) {

                //multimedia changes
                //QuickFix: for all campaigns[].data.mmTag, load all the mm
                //and for each add tag for the BC

                var files = [];
                async.each(campaignMMTags, function (mmTag, done) {
                    dexit.app.ice.integration.filemanagement.findFileDetailsByTag(mmTag, function (err, tags) {
                        //for each file found add in the unique values across all campaigns to the list
                        if (tags) {
                            _.each(tags, function (fileInfo) {
                                if (fileInfo.key && files.indexOf(fileInfo.key) === -1) {
                                    files.push(fileInfo.key);
                                }
                            });
                        }
                        //ignore error
                        done();


                    });

                }, function (err) {
                    if (err) {
                        //ignore, no error
                    }
                    async.each(files, function (file, doneFile) {
                        dexit.app.ice.integration.filemanagement.addAppTagsByFileName(file, [mainBCMMTag], function () {
                            //ignore any errors, such as duplicate tags
                            doneFile();
                        });
                    }, function (err) {
                        cb();
                    });

                });
            },
            change: ['touchpointsToCreate', 'multimediaTags',function(cb,result) {

                // //re-calculate changes for TPs created here again
                // if (self.originalTpsFromBCDef && self.tpsFromBCDef()) {
                //     var tps = result.touchpointsToCreate || [];
                //     var updatedTPs = _.map(tps, function (touchpointId) {
                //         return  self.currBCType + ':' + touchpointId;
                //     }) || [];
                //     var ind = _.findIndex(changes, {'path': '/property/touchpoints'});
                //     if (ind !== -1) {
                //         //update changes to send for TP
                //         changes[ind] = {op: 'replace', path: '/property/touchpoints', value: updatedTPs};
                //     }
                // }


                //QH: remove mm tag changes here
                var filteredChanges = _.filter(changes, function(val) {
                    return (!val.skip);
                });

                var bciId = campaignPlannerVm.callingVM.businessConceptInstance.id;

                var bcName = campaignPlannerVm.callingVM.businessConceptInstance.property.type || campaignPlannerVm.callingVM.businessConceptInstance.property.class;


                var params = {
                    type: bcName,
                    id: bciId,
                    version: bc.property.version,
                    changes: filteredChanges
                };
                dexit.app.ice.integration.bcp.updateBCInstance(params, cb);
            }],
            retrieveBCInstance: ['change', function (cb, result) {

                var bciId = campaignPlannerVm.callingVM.businessConceptInstance.id;

                var bcName = campaignPlannerVm.callingVM.businessConceptInstance.property.type || campaignPlannerVm.callingVM.businessConceptInstance.property.class;


                var params = {
                    id: bciId,
                    type: bcName
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(params,cb);
            }],
            //TODO: move BCVM instantiation elsewhere
            replaceBCiViewModel: ['change', 'retrieveBCInstance', function (next, result) {
                var updatedBC = result.retrieveBCInstance;

                // var bcId = self.bcId;
                // //remove old one
                // mainVM.listOfBcInstances.remove(function (item) {
                //     return (item.courseVM && item.courseVM.businessConceptInstance.id === bcId);
                // });
                //
                // //the updated BCi needs a new VM
                // var bcVM = new dexit.app.ice.edu.BCInstanceVM(result.retrieveBCInstance, mainVM);
                // if (self.availableBehaviourList && self.availableBehaviourList.length > 0) {
                //     bcVM.existingBehaviours(self.availableBehaviourList);
                // }
                //TODO: fix loading of behaviour list
                //  campaignPlannerVm.callingVM.existingBehaviours()
                campaignPlannerVm.callingVM.businessConceptInstance = updatedBC;

                //tODO: reinit

                // mainVM.listOfBcInstances.unshift({
                //     courseVM: bcVM
                // });
                // next(null, bcVM);
                next();
            }]
        }, function (err,results) {
            if (err) {
                //TODO: handle version conflict
                console.log('error updating bc');
            } else {


                var bcInfo = results.retrieveBCInstance;
                //clear existing behaviours
                var existing = campaignPlannerVm.callingVM.existingBehaviours();

                campaignPlannerVm.callingVM.existingBehaviours([]);

                var behs = [];
                _.each(bcInfo.behaviour, function(beh) {

                    var exists = _.find(existing, {behId: beh.id});

                    if (beh.property.ds && _.isString(beh.property.ds)){
                        try {
                            beh.property.ds = JSON.parse(beh.property.ds);
                        }catch(e){}
                    }

                    if (beh.property.display && _.isString(beh.property.display)){
                        try {
                            beh.property.display = JSON.parse(beh.property.display);
                        }catch(e){}
                    }

                    if(beh.property.ds && beh.property.display && !exists){
                        //work around for BR display name
                        if(beh.property.eptName){
                            beh.property.display.icon_text = beh.property.display.icon_text +' '+ beh.property.eptName;
                        }

                        var toPush = _.clone(beh.property);
                        var val = (toPush.isAssignedTo ? toPush.isAssignedTo.split('/') : []);
                        var scId = (val && val.length > 0 ? val[val.length-1] : bcInfo.id);
                        var toMerge = {
                            behId: beh.id,
                            scId: scId,
                            ds: beh.property.ds,
                            display: beh.property.display,
                            isBR: beh.property.eptName ? true: false,
                            behaviour:beh.property
                        };
                        toPush = _.extend(toPush,toMerge);

                        behs.push(toPush);

                    } else{
                        console.log('digital service not found for this behaviour ' + beh.id);
                    }
                });

                //clear for EPA
                dpa_VM.topLevelComponents([]);
                campaignPlannerVm.callingVM.associatedBehaviours([]);

                var newList = existing.concat(behs);
                campaignPlannerVm.callingVM.existingBehaviours(newList);



            }
            callback();
        });
    },
    enableSavePlanButton: ko.observable(true),


    generateCampaignChangeList: function(campaigns,bc) {

        //for each campaign get the following for def.data.approved
        // behaviours, bi, brs, metrics, touchpoints
        var type = campaignPlannerVm.callingVM.businessConceptInstance.property.type || campaignPlannerVm.callingVM.businessConceptInstance.property.class;

        var behaviours = [];
        var bi = [];
        var brs = [];
        var metrics = [];
        var touchpoints = [];


        _.each(campaigns, function (data) {
            var campaign = data.data;

            behaviours = behaviours.concat(campaign.behaviours);
            bi = bi.concat(campaign.bi);
            brs = brs.concat(campaign.brs);
            metrics = metrics.concat(campaign.metrics);
            touchpoints = touchpoints.concat(campaign.touchpoints);
        });

        //TODO: remove any duplicates based on bc


        var existingBehaviours = _.chain(bc.behaviour)
            .reject(function (val) {
                return (val.property.isBR);
            })
            .filter(function(behaviour){
                return (behaviour.property && behaviour.property.ds);
            })
            .map(function (behaviour) {
                if (behaviour && behaviour.property.ds && _.isString(behaviour.property.ds)) {
                    try {
                        behaviour.property.ds = JSON.parse(behaviour.property.ds);
                    }catch(e){}
                }
                return behaviour;
            })
            .value();

        var existingBRs = _.chain(bc.behaviour)
            .filter(function (val) {
                return (val.property.isBR);
            })
            .filter(function(behaviour){
                return (behaviour.property && behaviour.property.ds);
            })
            .map(function (behaviour) {
                if (behaviour && behaviour.property.ds && _.isString(behaviour.property.ds)) {
                    try {
                        behaviour.property.ds = JSON.parse(behaviour.property.ds);
                    }catch(e){}
                }
                return behaviour;
            })
            .value();



        var existingBI = _.chain(bc.intelligence)
            .map(function(val) {
                if (val.property && val.property.definition && _.isString(val.property.definition)){
                    val.property.definition = JSON.parse(val.property.definition);
                }
                return val;
            })
            .filter(function (val) {
                return (val.property && val.property.definition && val.property.definition.schema);
            })
            .value();


        var existingTPs = bc.property.touchpoints;
        if (_.isString(existingTPs)) {
            existingTPs = [existingTPs];
            existingTPs = _.compact(existingTPs);
        }


        var existingMetrics = bc.property.metrics;
        if (_.isString(existingMetrics)){
            existingMetrics = [existingMetrics];
        }

        metrics = _.reject(metrics, function (val) {
            return _.find(existingMetrics, function (metric) {
                return (metric && metric.metricId && val == metric.metricId);
            });
        });

        touchpoints = _.reject(touchpoints, function (val) {
            return _.find(existingTPs, function (tp) {
                var id = tp.split(':');
                var tpId = (id && id.length > 1 ? id[1] : tp);
                return (val.tpInfo && val.tpInfo.tpId && val.tpInfo.tpId === tpId);
            });
        });
        behaviours = _.reject(behaviours, function (val) {
            return _.find(existingBehaviours, function (beh) {
                return (beh.property.ds.id ===  val.ds.id);
            });
        });


        brs = _.reject(brs, function (val) {
            return _.find(existingBRs, function (beh) {
                return (beh.property && beh.property.ds && beh.property.ds.id ===  val.ds.id);
            });
        });
        bi = _.reject(bi, function (val) {
            return _.find(existingBI, function (bi) {
                return (bi.property.definition && bi.property.definition.schema && val.schema.id ===  bi.property.definition.schema.id);
            });
        });




        var changes = [];

        if (bi.length > 0) {
            var mappedBI = _.map(bi, function(val){
                return {
                    definition: val,
                    id: undefined
                };
            });
            changes = changes.concat({op: 'add', path: '/intelligence/', value: mappedBI});
        }

        if (brs.length > 0 ) {
            changes = changes.concat({op: 'add', path: '/behaviour/', value: brs});
        }

        if (behaviours.length > 0) {
            changes = changes.concat({op: 'add', path: '/behaviour/', value: behaviours});
        }

        //changes = changes.concat(behaviourChanges);

        if (metrics.length > 0) {
            // var metricChanges
            //     = _.map(metrics, function (val) {
            //     return {op:'add', path:'/metrics/', value:val};
            // });
            //workaround for metric pro
            var metricIds= _.map(metrics, function (val) {
                return val.metricId;
            });
            changes.push({op:'replace', path:'/property/metrics', value:metricIds});
        }




        if (touchpoints.length > 0) {

            var tpIds = _.map(touchpoints, function (touchpoint) {
                return type + ':' + touchpoint.tpInfo.tpId;
            });


            var tps = _.compact(tpIds.concat(existingTPs));

            //add the existing tps to the new one


            if (tps.length > 0) {
                changes.push({op: 'replace', path: '/property/touchpoints', value: tps});
            }

        }




        return changes;



        //remove any duplicates

        // behaviours = _.uniqBy(behaviours, function (item) {
        //
        // });






    },



    /**
     * TODO: rewrite so existing state so passed epObject is not mutated
     * @param epObject
     */
    loadPPUIObject: function (epObject) {

        var mode = campaignPlannerVm.mode();

        var cells = [];

        var handleElement = function(element){
            var tempEPEntry = _.cloneDeep(element);

            if (mode === 'review') {
                //find and add stage
                var epId = tempEPEntry.definition.epId;
                var epRevision = tempEPEntry.definition.epRevision || 1;
                var card  = null;
                if (epId) {
                    card = campaignPlannerVm.callingVM.findCardByEp({epId: epId, epRevision: epRevision});

                }else {
                    var scId = tempEPEntry.definition.scId;
                    card = campaignPlannerVm.callingVM.findCard({scId: scId});
                }
                if (card && card.currentActivity() === 'scheduling') {
                    tempEPEntry.definition.showPublish = true;
                }else {
                    tempEPEntry.definition.showPublish = false;
                }
            }


            cells.push(tempEPEntry);
        };

        //parse each ep object cell for any observables
        _.each(epObject.cells, handleElement);

        //TODO: check for any existing (ie. previously created ones)




        campaignPlannerVm.clearGraph();
        campaignPlannerVm.graph.fromJSON({cells:cells});



    },

    loadPPUIObjectById: function (ppId) {


        var resource = '/plan-diagram/' + ppId;
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, result) {
            if (err) {
                alert('could not find diagram:' + ppId);
                return;
            }

            //for compatability
            campaignPlannerVm.callingVM.businessConceptInstance.property.ppObject = result.data;
            var epObject = campaignPlannerVm.parsePPObjectSafely(result.data);



;
            var mode = campaignPlannerVm.mode();

            var cells = [];

            var handleElement = function(element){
                var tempEPEntry = _.cloneDeep(element);

                if (mode === 'review') {
                    //find and add stage

                    if (element && element.type === 'planner.Campaign') {

                        var epId = tempEPEntry.definition.epId;
                        var epRevision = tempEPEntry.definition.epRevision || 1;
                        var card = null;
                        if (epId) {
                            card = campaignPlannerVm.callingVM.findCardByEp({epId: epId, epRevision: epRevision});

                        } else {
                            var scId = tempEPEntry.definition.scId;
                            card = campaignPlannerVm.callingVM.findCard({scId: scId});
                        }
                        if (card && card.currentActivity() === 'scheduling') {
                            tempEPEntry.definition.showPublish = true;
                        } else {
                            tempEPEntry.definition.showPublish = false;
                        }
                    }
                }


                cells.push(tempEPEntry);
            };

            //parse each ep object cell for any observables
            _.each(epObject.cells, handleElement);

            //TODO: check for any existing (ie. previously created ones)





            campaignPlannerVm.clearGraph();
            campaignPlannerVm.graph.fromJSON({cells:cells});



        });
    },

    graphToJSON: function () {
        return dexit.epm.epa.integration.graphObjToJSON(campaignPlannerVm.graph);
    },
    // graphObjToJSON: function (graphObj) {
    //     var data;
    //     try {
    //         //get JSON from jointjs graph and also handles any observables through ko util
    //         //remove any '\"' sequences from string (html templates have them appended)
    //         data = ko.toJSON(graphObj.toJSON());
    //         //Also need to convert all '\\"' to '\' since html string template is adding extra
    //         data = data.replace(/(\\")/g,'\'');
    //     }catch (e) {
    //         console.log('could not convert to json');
    //     }
    //
    //
    //     return data;
    // },
    clearGraph: function () {
        if (campaignPlannerVm.graph) {
            campaignPlannerVm.graph.clear();
        }else {
            campaignPlannerVm.graph = new joint.dia.Graph();
        }
    }





};
