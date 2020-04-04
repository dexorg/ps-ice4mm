/**
 * Copyright Digital Engagement Xperience 2017
 */


/**
 *
 * @param {object} args
 * @param {object} args.item - item being edited
 * @param {boolean} [args.serviceSetup=false] -
 * @param {boolean} [args.serviceInput=false] -
 * @param {boolean} [args.transition=false] -
 * @param {boolean} [args.triggerSetup=false] -
 * @param {boolean} [args.handlerSetup=false] -
 * @param {boolean} [args.brIntelligenceSetup=false]
 * @param {boolean} [args.tagSetup=false]
 * @param {string[]} [args.availableEventGens=['Timer','Click']]
 * @param {object} args.element
 * @param {object[]} args.availableIntelligence
 *
 * @constructor
 */
dexit.epm.epa.EditItemVM = function (args) {
    var self = this;

    self.element = args.element;
    //default tab
    self.selectedOption = ko.observable('transition');

    //service setup
    self.serviceSetup =  (args.serviceSetup ? ko.observable(true) : ko.observable(false));
    self.showServiceSetup = function () {
        self.selectedOption('configure');
    };

    // self.triggerSetup =  (args.triggerSetup ? ko.observable(true) : ko.observable(false));
    // self.showTriggerSetup = function () {
    //     self.selectedOption('trigger');
    // };

    self.handlerSetup =  (args.handlerSetup ? ko.observable(true) : ko.observable(false));
    self.showHandlerSetup = function () {
        self.selectedOption('eventHandler');
    };

    //tagging setup
    self.tagSetup =  (args.tagSetup ? ko.observable(true) : ko.observable(false));
    self.showTagSetup = function () {
        self.selectedOption('tagging');
    };


    //placeholder setup
    self.placeholderSetup =  (args.placeholderSetup ? ko.observable(true) : ko.observable(false));
    self.showPlaceholderSetup = function () {
        self.selectedOption('placeholder');
    };

    if (args.placeholderSetup && self.element.model.attributes.elementType && self.element.model.attributes.elementType === 'multimedia') {

    }


    self.availableTags = ko.observableArray([]);

    // if (args.tagSetup && self.element.model.attributes.elementType && self.element.model.attributes.elementType === 'multimedia') {
    //     var mm = self.element.model.attributes.multiMediaList();
    //     if (mm && mm.length > 0) {
    //         var mmFile = mm[0].value();
    //
    //         var split  = mmFile.split('/');
    //         var index = _.findIndex(split, function (val) {
    //             return (val && (val.indexOf('tenant.')!== -1));
    //         });
    //
    //         //rejoin starting at index
    //         var filePath = split.splice(index+1).join('/');
    //
    //         debugger;
    //         var regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    //         dexit.app.ice.integration.filemanagement.findByFile(filePath, function (err, fileInfo) {
    //             if (err || fileInfo.length < 1) {
    //                 console.warn('could not retrieve file info');
    //             }else {
    //                 var tags = _.map(fileInfo, function (val) {
    //                     return val.tag;
    //                 });
    //                 //filter any tags that are uuid
    //                 var filtered = _.filter(tags, function (val) {
    //                     return (!regexUUID.test(val));
    //                 })
    //
    //                 self.availableTags(filtered);
    //             }
    //         });
    //
    //     }
    // }


    //service input selection
    self.serviceInput =  (args.serviceInput ? ko.observable(true) : ko.observable(false));
    self.showServiceInput = function () {
        self.selectedOption('input');
    };

    //transition selection
    self.transition = (args.transition ?  ko.observable(true) : ko.observable(false));
    self.showTransition = function () {
        self.selectedOption('transition');
    };



    //BR intelligence setup
    self.brIntelligenceSetup = (args.brIntelligenceSetup ?  ko.observable(true) : ko.observable(false));
    self.showBRIntelligenceSetup= function () {
        self.selectedOption('brIntelligenceSetup');
    };
    self.availableIntelligence = ko.observableArray();
    self.selectedIntelligence = ko.observable();


    self.dataTypes = ['number','text'];

    self.ruleComparatorsDetails = ko.observableArray([
        {id:'==', dataTypes:['number']},
        {id:'!=', dataTypes:['number']},
        {id:'!=~', dataTypes:['string']},
        {id:'=~', dataTypes:['string']},
        {id:'>=', dataTypes:['number']},
        {id:'<', dataTypes:['number']}

    ]);

    self.selectedTag = ko.observable();
    self.selectedId = ko.observable(dpa_VM.generateId());

    //self.ruleComparators = ko.observableArray(['==','!=','=~','>=','<']);
    self.selectedComparator1 = ko.observable();
    // self.selectedComparator2 = ko.observable();
    self.intelligenceAttributes = ko.computed(function () {
        if (!self.selectedIntelligence()) {
            return [];
        }else {
            var found = _.find(self.availableIntelligence(), function (val) {
                return val.intelId === self.selectedIntelligence();
            });
            if (found) {
                return found.fields;
            }else {
                return [];
            }
        }
    });

    self.selectedIntelligenceAttribute1 = ko.observable();
    self.selectedIntelligenceAttribute2 = ko.observable();

    self.selectedIntelligenceValue1 = ko.observable();
    self.selectedIntelligenceValue2 = ko.observable();


    if (args.availableIntelligence) {
        self.availableIntelligence(args.availableIntelligence);
    }

    self._getOpposingComparator = function (comp) {
        switch(comp) {
            case '==':
                return '!=';
            case '!=':
                return '==';
            case '=~':
                return '!=~';
            case '!=~':
                return '=~';
            case '>=':
                return '<';
            case '<':
                return '>=';
        }
    };


    self.ruleComparators = ko.computed(function () {
        function getDataType(dt) {

            if (_.isArray(dt)) {
                //remove null
                var f = _.find(dt, function (val) {
                    return (val !== null && val !== '"null"');
                });
                return f.replace(/"/g,'');
            }else {
                return dt;
            }
        }

        var fieldName = self.selectedIntelligenceAttribute1();
        if (!fieldName) {
            return [];
        }
        var found = _.find(self.availableIntelligence(), function (val) {
            return val.intelId === self.selectedIntelligence();
        });


        if (found) {
            var val =  _.find(found.fields, {'name': fieldName });

            //var fieldType = (found.fields);
            var filtered = ko.utils.arrayFilter(self.ruleComparatorsDetails(), function (item) {
                var dt = getDataType(val.dataType);
                return (item.dataTypes && (item.dataTypes.indexOf(dt) !== -1));
            });
            return _.map(filtered, 'id');
        }else  {
            return [];
        }


    });

    self.getIfElseBRInfo = function () {
        var comparator = self.selectedComparator1();
        var path1 = {ls:self.selectedIntelligenceAttribute1(), comparator:comparator, rs:self.selectedIntelligenceValue1()};

        //path 2: calculate opposite
        var path2 = {ls:self.selectedIntelligenceAttribute1(), comparator:self._getOpposingComparator(comparator), rs:self.selectedIntelligenceValue1()};

        var found = _.find(self.availableIntelligence(), function (val) {
            return val.intelId === self.selectedIntelligence();
        });

        //if !found then BR is incomplete
        if (!found) {
            return {
                isValid: false,
                intelligence: self.selectedIntelligence(),
                pathConditions: [ path1, path2 ],
                kind:'if-else'
            };
        }

        return {
            isValid: true,
            scId: found.scId,
            intelligence: self.selectedIntelligence(),
            pathConditions: [ path1, path2 ],
            kind:'if-else'
        };

    };
    self.loadBRInfo = function (info) {
        self.selectedIntelligence(info.intelligence);
        var path1 = info.pathConditions[0];
        self.selectedIntelligenceAttribute1(path1.ls);
        self.selectedComparator1(path1.comparator);
        self.selectedIntelligenceValue1(path1.rs);
    };


    if (self.element && self.element.model && self.element.model.attributes && self.element.model.attributes.setupBR) {
        self.loadBRInfo(self.element.model.attributes.setupBR);
    }

    self.selectedVideoElement = ko.observable();
    self.selectedVideoEvent = ko.observable();
    //self.availableVideoEvents = ko.observableArray(['percent played', 'start', 'end', 'seek', 'play', 'pause', 'volumeChange', 'error', 'enter fullscreen','exit fullscreen']);

    self.availableVideoEventHandler = ko.observableArray(['played', 'status']);
    self.selectedVideoEventHandler = ko.observable();
    self.selectedVideoEventElement = ko.observable();
    self.selectedVideoEventPlayedValue = ko.observable();


    self.videoEventValue = ko.observable('');

    self.eventTime = ko.observable('');
    self.selectedTimeUnit = ko.observable('');
    self.timeUnits = ko.observableArray(['seconds','minutes']);
    self.availableEventGens = (args.availableEventGens ? ko.observableArray(args.availableEventGens) :ko.observableArray(['Click', 'Timer']));
    self.selectedEvent = ko.observable('Click');

    self.availableVideoEvents = ko.observableArray(['None', 'Video'])


    self.placeholderName = ko.observable('');
    self.placeholderDescription = ko.observable('');

    if (self.element && self.element.model &&
        self.element.model.attributes) {
        var elementAttributes = self.element.model.attributes;

        if (elementAttributes.inEvent &&
            elementAttributes.inEvent.events && elementAttributes.inEvent.events.length > 0) {
            //load existing choice
            var value = self.element.model.attributes.inEvent.events[0];
            self.selectedEvent(value.name);
            if (value.args && !_.isEmpty(value.args)) {
                if (value.args.unit) {
                    self.selectedTimeUnit(value.args.unit);
                    self.eventTime(value.args.value);
                } else {
                    self.selectedVideoElement(value.args.elementId);
                    self.selectedVideoEvent(value.args.event);
                    self.videoEventValue(value.args.value);
                }
            }
        }
        if (elementAttributes.eventHandler && !_.isEmpty(elementAttributes.eventHandler)) {
            self.selectedVideoEventHandler(elementAttributes.eventHandler.name);
            self.selectedVideoEventElement(elementAttributes.eventHandler.elementId);
            self.selectedVideoEventPlayedValue(elementAttributes.eventHandler.value);
        }

        if (elementAttributes.placeholderName) {
            self.placeholderName(elementAttributes.placeholderName);
        }
        if (elementAttributes.placeholderDescription) {
            self.placeholderDescription(elementAttributes.placeholderDescription);
        }

    }




    if (self.element && self.element.model && self.element.model.attributes && self.element.model.attributes.elementTag) {
        self.selectedTag(self.element.model.attributes.elementTag);
    }



    self.deleteItem = function (element) {
        element.model.remove();
    };

    self.save = function (element) {
        if (self.handlerSetup() === true) {
            if (self.selectedVideoEventHandler() && self.selectedVideoEventElement() && self.selectedVideoEventPlayedValue()) {
                var valH = {
                    name: self.selectedVideoEventHandler(),
                    elementId: self.selectedVideoEventElement(),
                    value: self.selectedVideoEventPlayedValue()
                };

                element.model.attributes.eventHandler = valH;
            }
        }

        if (self.transition() === true) {
            //self.element
            var val =  {
                name:self.selectedEvent()
            };
            if (self.selectedEvent() === 'Timer') {
                val.args = {
                    value: self.eventTime(),
                    unit: self.selectedTimeUnit()
                };
            } else {
                val.args = {};
            }

            if (self.selectedEvent() === 'Video') {
                val.args = {
                    elementId: self.selectedVideoElement(),
                    event: self.selectedVideoEvent(),
                    value: self.videoEventValue()
                };
            }


            element.model.attributes.inEvent = {
                events: [val]
            };
        }
        if (self.serviceInput() === true) {
            var value = $('#elementInputForm').alpaca().getValue();
            element.model.attributes.elementInput = value;
        }
        if (self.serviceSetup() === true) {
            var valS = $('#behaviour_setupForm').alpaca().getValue();
            element.model.attributes.setupInputs = valS;
        }

        if (self.brIntelligenceSetup() === true) {
            element.model.attributes.setupBR = self.getIfElseBRInfo();
        }


        if (self.tagSetup() === true) {
            element.model.attributes.elementTag = self.selectedTag();
        }
        if (self.placeholderSetup() === true) {
            var mmList = element.model.attributes.multiMediaList();
            if (mmList.length > 0) {
                var mm = mmList[0];
                var pName = self.placeholderName() || '';
                mm.label(pName);
                element.model.attributes.multiMediaList([mm]);
                element.model.attributes.placeholderName = pName;
                element.model.attributes.placeholderDescription = self.placeholderDescription() || '';


                //this also requires a re-draw the template is html that is rendered
                var newRender =  dexit.epm.epa.integration.renderTemplate(element.model.attributes.renderType,element.model.attributes);
                element.model.attributes.template = newRender;
                debugger;

                //trick re-render template, is there a better way?
                element.template = newRender;
                element.render();



            }
        }


    };



};
