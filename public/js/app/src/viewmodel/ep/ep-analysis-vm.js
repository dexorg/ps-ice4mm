/**
 * Copyright Digital Engagement Xperience 2018
 * @description VM for managing performance reports
*/

/* global dexit, ko, async, joint */

/**
 *
 * @param {dexit.app.ice.edu.BCInstanceVM} args.parentVM
 * @param {dexit.app.ice.ccEDCreateVM} [args.ccEDCreateVM]
 * @constructor
 */
dexit.app.ice.EPAnalysisVM = function (args) {
    var self = this;
    var noOp = function() {};
    var parentVM = args.parentVM;

    self.epUIContainerId = '#pattern-preview-area';

    self.graph = null;
    self.previewPaper = null;

    function parseEPObjectSafely(data) {
        try{
            var epObject = JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, '\\n'));
            return epObject;
        }catch(err){
            console.error('could not parse epObject');
            return new Error('error occurs when parsing the EP Object from SC property: ' + err);
        }
    }





    self.loadEPUI = function(epObject) {


        var graph = self.graph;

        graph = graph || new joint.dia.Graph();
        self.graph = graph;
        var workArea =$(self.epUIContainerId);
        if ($(workArea).children('#large-preview-paper').length > 0) {
            return;
        }

        var inserted = $(workArea).append('<div id="large-preview-paper" class="paper"></div>');
        var paper = $(workArea).children('#large-preview-paper');


        self.previewPaper = new joint.dia.Paper({
            el: paper,
            width: paper.width(),
            height: paper.height(),
            gridSize: 1,
            model: self.graph,
            // mark interactive as false
            interactive: false
        });

        // //make sure custom shapes are available
        dexit.epm.epa.integration.prepareShapes();
        self.loadEPUIObject(epObject,graph);
        self.previewPaper .setOrigin(0, 0);
        self.previewPaper .scaleContentToFit();
        self.previewPaper .fitToContent();

    };

    self.clearEPUI = function() {
        var graph = self.graph;
        if (graph) {
            graph.clear();
        }
        if (self.previewPaper) {
            self.previewPaper.remove();
            self.previewPaper = null;
        }
        var workArea =$('#modal-pattern-preview-area');
        var paper = $(workArea).children('#large-preview-paper');
        paper.remove();

    };

    self.loadEPUIObject = function(epObject, graph) {
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
    };


    self.title = ko.observable('Select a campaign and the kind of analysis you want to perform');
    self.analysisDataLoaded = ko.observable(false);
    self.pathAnalysisData = ko.observable();


    self.analysisSettingModalVisible = ko.observable(false);

    self.showAnalysisSection = ko.observable(false);


    self.originalEPUIObject = null;

    self.showAnalysisReport = function() {
        self.analysisDataLoaded(false);
        self.showAnalysisSection(true);

        var selectedId = self.selectedBCId();
        var selectedObj = _.find(self.availableCampaignList(), function (val) {
            return val.bcId === selectedId;
        });
        if (!selectedObj) {
            console.warn('no available campaign');
            return;
        }

        var data = selectedObj.sc;


        if(data.property.epObject){
            var epObject = parseEPObjectSafely(data.property.epObject);
            if (epObject instanceof Error) {
                console.error('could not load EP UI obj');
                return;
            }
            self.originalEPUIObject = epObject;

            self.clearEPUI();

            self.loadEPUI(epObject);


            self.loadAnalysisData(selectedObj);
            //next step is to load data
        }

        //self.tempSelectedDashboardIntelligence(self.selectedDashboardIntelligence());
        //self.analysisSettingModalVisible(true);
    };


    self.currentPathTitle = ko.observable('');

    self.loadData = function(id,callback) {
        'use strict';
        var resource = '/analysis-report';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.create({epId:id,type:'path'},function (err, data) {
            if (err){
                return callback(err);
            }

            //ICEMM-951: QH only return top 5 and show percentage
            var maxSize = 5;

            //get total
            var total = _.reduce(data, function(memo, item){
                return memo + item.value;
            },0);

            if(data.length > maxSize){
                data = data.slice(0,maxSize)
            }

            var toReturn = _.map(data, function (val) {
                return {
                    path: val.path,
                    name: val.name,
                    value: val.value,
                    percentage: Math.floor((val.value/total) * 100) + '%'
                };
            });


            callback(null,toReturn);
        });
    };

    self.loadAnalysisData = function(selectedObj){

        self.analysisDataLoaded(false);
        var epId = selectedObj.epId;


        self.loadData(epId, function(err, data) {
            if (err) {
                return;
            }

            self.pathAnalysisData(data);
            self.analysisDataLoaded(true);
        });

    };



    function findLink(links, currentId, otherIds) {

        return _.filter(links, function (val) {
            var source = val.getSourceElement();
            var target = val.getTargetElement();


            if (target.attributes.type === 'epa.EndElement') {
                return false;
            }

            //if source is start element, then assume path for matching
            if (source && source.get('type') && source.get('type') === 'epa.StartElement') {
                return (target && target.id === currentId);
            }else {
                if ((source && source.id === currentId) && target && target.id) {
                    return (otherIds.indexOf(target.id) !== -1);
                } else if (target && target.id === currentId && source && source.id) {
                    return (otherIds.indexOf(source.id) !== -1);
                }else {
                    return false;
                }


                // if ((source && source.id === currentId) ||  (target && target.id === currentId)) {
                //
                // }
            }
            //case element from start


            //return ((source && source.id === currentId) ||  (target && target.id === currentId));
        });
    }

    self.showPath = function(data) {
        self.currentPathTitle('');
        //reload EPUI
        self.clearEPUI();
        self.loadEPUI(self.originalEPUIObject);
        setTimeout(function () {

            var path = data.path;
            var links = self.graph.getLinks();
            self.currentPathTitle('Showing for Path '+data.name);

            _.each(path, function(nodeId) {
                //find link
                var cell = self.graph.getCell(nodeId);

                var found = findLink(links,nodeId, _.without(path,nodeId));
                if (found && found.length > 0) {
                    _.each(found, function (val) {
                        val.attr('.connection/stroke', '#157689');
                        val.attr('.connection/stroke-width', 8);
                    });

                }


            });
        },500);





    };
    self.availableColours = ["#FFFFFF", "#acffbf", "#434bff", "#fbff08", "#00ffff", "#FF00EE"];

    self.selectedBCId = ko.observable();
    self.availableAnalysisOptions = ko.observableArray([
        {name: 'Path Analysis', id:'path'}
    ]);
    self.selectedAnalysisOption = ko.observable();

    self.enableLoadAnalysisReport = ko.pureComputed(function () {
        return (self.selectedAnalysisOption() && self.selectedBCId() ? true: false);
    });



    /**
     * List of the 'published' campaigns
     */
    self.availableCampaignList = ko.pureComputed(function () {
        var sccVM = parentVM;
        var stageVM = _.find(sccVM.stageVMs(),  function(item) {
            return (item.name() && item.name() === 'published')
        });
        if (!stageVM) {
            return [];
        }
        //TODO: do not just use the cardVMs

        return _.map(stageVM.cards(), function (val) {
            return {
                name: val.name(),
                sc: val.sc(), //get epUIObject from here
                bcId: val.sc().id,
                epId: val.ePatterns()[0].id,
                epRevision: (val.ePatterns()[0].revision || 1)
            }
        });
    });

    // self.title = ko.pureComputed(function(){
    //     return 'Select  ' + self.selectedDashboardIntelligence().length +'/' + self.availableDashboardIntelligence().length +' Reports';
    // });




    self.init = function(args){
        // self.bcId = args.bcId;
        // self.bcType = args.bcType;
        // self.role = args.role;
    };



    self.load = function() {
        // var bcId,bcType, currentRole;
        // if (parentVM) {
        //     bcId = parentVM.businessConceptInstance.id;
        //     bcType = parentVM.mainVM.currBCType();
        //     currentRole = parentVM.mainVM.currentRole();
        // } else {
        //     bcId = self.bcId;
        //     bcType = self.bcType;
        //     currentRole = self.role;
        // }


        // self.loadAvailableEngReports(bcType,function() {
        //     //load after available
        //     self.loadAnalysisReports(bcId, bcType, currentRole);
        // });

    };




};
