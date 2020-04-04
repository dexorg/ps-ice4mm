/**
 * @copyright Digital Engagement Xperience Inc
 * Created by shawn on 2017-06-15.
 */
/* global dexit, joint */
if (!dexit.epm) {
    dexit.epm = {};
}

if (!dexit.epm.epa) {
    dexit.epm.epa = {};
}



dexit.epm.epa.integration = {

    graph:null,


    clear: function () {
        graph = null;
    },

    prepareShapes: function() {

        if (!joint) {
            console.error('jointjs has not yet been loaded');
            return;
        }


        if (joint.shapes.epa) {
            console.log('joint.shapes.epa has already been loaded');
            return;
        }

        joint.shapes.epa = {};



        joint.shapes.epa.HTMLElement = joint.shapes.basic.Rect.extend({
            defaults: joint.util.deepSupplement({
                type: 'epa.HTMLElement',
                attrs: {
                    rect: { stroke: 'none', 'fill-opacity': 0 }
                },
                groups: {
                    'in': {
                        attrs: {
                            '.port-body': {
                                fill: '#16A085',
                                magnet: 'passive',
                                r: 5
                            }
                        }
                    },
                    'out': {
                        attrs: {
                            '.port-body': {
                                fill: '#E74C3C',
                                r: 5
                            }
                        }
                    }
                }
            }, joint.shapes.basic.Rect.prototype.defaults)
        });
        joint.shapes.epa.HTMLElementView = joint.dia.ElementView.extend({

            template: [
                '<div class="html-element">',
                '<label></label>',
                '<span>I am placeholder html</span>', '<br/>',
                '</div>'
            ].join(''),
            scale:1, //used to help scale svg and html: TODO: update this based on this.paper event 'scale'
            setupPopover: function () {
                // if  (this.popover) {
                //     return;
                // }

                var self = this;
                var serviceInput = (this.model.attributes && this.model.attributes.behRef && this.model.attributes.behRef.parameters ? true : false);
                var serviceSetup = (this.model.attributes.behRef && this.model.attributes.behRef.ds && this.model.attributes.behRef.ds.setup && this.model.attributes.behRef.ds.setup.init ? true : false);
                // var brIntelSetup = (this.model.attributes && this.model.attributes.isBR ? true : false);
                var brIntelSetup = (this.model.attributes && this.model.attributes.elementType  && this.model.attributes.elementType==='br' ? true : false);


                var tagSetup = (this.model.attributes && this.model.attributes.elementType  && this.model.attributes.elementType==='intelligence' ? true : false);
                debugger;
                var placeholderSetup = false;
                if (this.model.attributes &&
                    this.model.attributes.elementType  &&
                    this.model.attributes.elementType==='multimedia' &&
                    this.model.attributes.multiMediaList &&
                    this.model.attributes.multiMediaList().length > 0 &&
                    this.model.attributes.multiMediaList()[0].value() &&
                    (this.model.attributes.multiMediaList()[0].value().indexOf('placeholder-image.svg') > -1 || this.model.attributes.multiMediaList()[0].value().indexOf('placeholder-video.mp4') > -1 )) {
                    placeholderSetup = true;
                }

                var args = {
                    serviceInput: serviceInput,
                    transition: true,
                    serviceSetup: serviceSetup,
                    element:self,
                    placeholderSetup:placeholderSetup,
                    brIntelligenceSetup: brIntelSetup,
                    //tagSetup: tagSetup
                    tagSetup:tagSetup
                };

                if (brIntelSetup) {
                    //populate available intelligence
                    //TODO: populdate with intelligence output from behaviours too
                    args.availableIntelligence = dpa_VM.availableBI.concat(dpa_VM.getTemporaryIntelligence());
                    //check for any intelligence from ept source
                }

                var eventGens = dpa_VM.defaultEventGens().concat(dpa_VM.availableEventGens());
                args.availableEventGens = eventGens;


                args.handlerSetup = true;


                dpa_VM.getAvailableVideoTransitions(args.element);
                dpa_VM.getAvailableVideoEvents(args.element);
                var params = new dexit.epm.epa.EditItemVM(args);

                var $element = this.$box;
                var content =  '<!-- ko template: { name: template, if: data, data: data } --><!-- /ko -->';
                this.popover = this.$box.popover({
                    html: true,
                    content:content,
                    placement:'auto right',
                    trigger:'manual',
                    container: 'body'  //otherwise popover can be cutoff
                });
                // Begin messy popover code to habe knockout work with dynamic added
                $element.on('shown.bs.popover', function (event) {

                    var data = params;//dataAtts;//cellView.model.attributes;
                    var popoverData = $(event.target).data();
                    var popoverEl = popoverData['bs.popover'].$tip;
                    var options = popoverData['bs.popover'].options || {};
                    var button = $(event.target);

                    ko.cleanNode(popoverEl[0]);
                    if (data) {
                        ko.applyBindings({template: 'itemSelectionTemplate', data: data}, popoverEl[0]);
                    }
                    else {
                        ko.applyBindings(dpa_VM, popoverEl[0]);
                    }

                    //fill in service setup and input
                    self._renderInputSchema();
                    self._renderSetupForm();



                    popoverEl.find('a[data-action="delete-element"]').click(function() {
                        button.popover('destroy');
                        data.deleteItem(self);
                    });
                    popoverEl.find('button[data-action="save-element"]').click(function() {
                        button.popover('destroy');
                        data.save(self);
                    });

                    //determine placement
                    var popoverMethods = popoverData['bs.popover'];
                    var offset = popoverMethods.getCalculatedOffset(options.placement || 'right', popoverMethods.getPosition(), popoverEl.outerWidth(), popoverEl.outerHeight());
                    popoverMethods.applyPlacement(offset, options.placement || 'right');

                });

                ko.utils.domNodeDisposal.addDisposeCallback($element[0], function () {
                    $element.popover('destroy');
                });
            },
            init: function () {
                //replace template
                this.template = [this.model.attributes.template].join('');
                this.listenTo(this.model, 'change', this.updateBox);
                // this.listenTo(this.model, 'remove', this.removeBox);

                this.popover = null;



            },

            onRender: function () {
                if (this.$box) this.$box.remove();
                var boxMarkup = joint.util.template(this.template)();
                var $box = this.$box = $(boxMarkup);

                // if(this.model.attributes.renderType === 'flex-text'){
                //     //TODO: issue needs to be fixed that text editing is not working(replaced by jointJS click event)
                //     var editTextB = $box.find('.flex-beh-edit.flex-text-edit');
                //     if(editTextB[0]){
                //         editTextB.on('click', _.bind(function(evt){
                //             dpa_VM.currentElement(this.attributes);
                //             dpa_VM.newEditEntry = { type: 'text', value: ko.observable(this.attributes.multiMediaList()[0].value()) };
                //             dpa_VM.addFromEdit();
                //         }, this.model));
                //     }
                // }

                this.listenTo(this.paper, 'scale', this.updateBox);
                this.listenTo(this.paper, 'translate', this.updateBox);

                $box.appendTo(this.paper.el);
                this.updateBox();


                return this;
            },


            _renderSetupForm: function () {
                var currElement = this.model;
                if (!currElement.attributes.behRef || !currElement.attributes.behRef.ds || !currElement.attributes.behRef.ds.setup || !currElement.attributes.behRef.ds.setup.init) {
                    //no setup required
                    return;
                }


                //for setup that is external, render a link that opens a new window

                var setupSchema = (currElement.attributes.behRef.ds.setup.init && currElement.attributes.behRef.ds.setup.init.schemaTemplate ? currElement.attributes.behRef.ds.setup.init.schemaTemplate : null);


                if (!setupSchema) {
                    //error service is not configured correctly for setup
                    $('#behaviour_setupForm').text('Error eService is not setup correctly and will not be usable');
                    return;
                }
                var data = currElement.attributes.setupInputs || {};
                var view = (data && !_.isEmpty(data) ? 'bootstrap-edit' : 'bootstrap-create');
                //look up different setup form by subtype
                //var setupForm = $('#'+this.attributes.behRef.subtype+'_setupForm');
                var setupForm = $('#behaviour_setupForm');

                var options = {
                    'data': data,
                    'view': view
                };
                if (setupSchema && setupSchema.options) {
                    options.options = setupSchema.options;
                }
                if (setupSchema && setupSchema.schema) {
                    options.schema = setupSchema.schema;
                } else  {
                    options.schema = setupSchema;
                }


                var formOptions = {
                    'form': {
                        'buttons': {
                            'save': {
                                'title': 'Save',
                                'click': function() {
                                    var value = this.getValue();
                                    currElement.attributes.setupInputs = value;
                                    //setupForm.modal('toggle');
                                }}
                            // 'close':{
                            //     'title': 'Close',
                            //     'click': function() {
                            //         setupForm.modal('toggle');
                            //     }
                            // }
                        }
                    }
                };
                //_.extend(options.options,formOptions);

                setupForm.alpaca(options);


            },
            _renderInputSchema: function () {
                debugger;
                var inputSchema = (this.model.attributes && this.model.attributes.behRef && this.model.attributes.behRef.parameters ? this.model.attributes.behRef.parameters : null);
                if (!inputSchema) {
                    //skip if no input schema
                    return;
                }
                var data = this.model.attributes.elementInput || {};
                var view = (data && !_.isEmpty(data) ? 'bootstrap-edit' : 'bootstrap-create');
                //look up different setup form by subtype
                //var setupForm = $('#'+this.attributes.behRef.subtype+'_setupForm');
                var setupForm = $('#elementInputForm');

                var options = {
                    'data': data,
                    'view': view
                    //setup droppable: commeneted out dropdown is used
                    // 'postRender': function (form) {
                    //     //loop through all input forms and make them droppable
                    //     form.getFieldEl().find('.alpaca-container-item').each(function (i, item) {
                    //         $(item).droppable({
                    //             'greedy': true,
                    //             'tolerance': 'pointer',
                    //             'drop': function (event, ui) {
                    //
                    //                 var draggable = $(ui.draggable);
                    //                 //get item to add
                    //
                    //                 var itemTemp = ko.utils.domData.get(ui.draggable[0], 'ko_dragItem');
                    //
                    //                 //set to source field to intelligence reference
                    //                 $(this).find('input').val(itemTemp.src);
                    //
                    //             }
                    //             // 'over': function (event, ui ) {
                    //             //     $(event.target).addClass('dropzone-hover');
                    //             // },
                    //             // 'out': function (event, ui) {
                    //             //     $(event.target).removeClass('dropzone-hover');
                    //             // }
                    //         });
                    //         //make div droppable
                    //         //
                    //         // var containerEl = this;
                    //         // $(containerEl).children('.alpaca-container-item').each(function() {
                    //         //     $(this).after("<div class='dropzone'></div>");
                    //         // });
                    //
                    //     });
                    // }
                };

                var val = [];
                _.each(dpa_VM.availableBI, function (intel) {
                    _.each(intel.fields, function (field) {
                        val.push({
                            value: intel.intelId + '.' + intel.name + '.' + field.name,
                            text: intel.name + '-' + field.name
                        });
                    });
                });

                //FIXME: filter should be decided when configuring eService
                if (this.model.attributes.behRef.renderText === 'eVoucher') {
                    val = _.filter(val, function (it) {
                        return (it.value.indexOf('user.discount') !== -1);
                    });
                }


                if (inputSchema.schema) {
                    options.schema = inputSchema.schema;
                }else  {
                    options.schema = inputSchema;
                }

                //TODO: better way to prepare input
                //for properties of "number" need to change to "string"
                _.each(options.schema.properties, function (val) {
                    if (val.type && val.type === 'number') {
                        val.type = 'string';
                    }
                });


                if (inputSchema.options) {
                    options.options = inputSchema.options;
                }else {


                    options.options = {
                        fields: {
                            'discount_rate': {
                                type: 'select',
                                label: 'Select Discount Rate Input',
                                //dataSource: dpa_VM.getAvailableIntelligence,
                                dataSource:val,
                                validate: false
                            }
                        }
                    };
                }

                //handle any buttons and JS that is attached

                if (options.options && options.options.form && options.options.form.buttons) {
                    _.each(options.options.form.buttons, function(value, key) {
                        if (value && value.click && _.isString(value && value.click)) {
                            //must trust defintions
                            //TODO: security sandbox
                            var fn = new Function(value.click);
                            options.options.form.buttons[key].click = fn;

                        }
                    });
                }

                setupForm.alpaca(options);
            },

            /**
             *
             * @param {object} args
             * @param {object} args.transition
             * @param {object} args.input
             * @param {object} args.configure
             */
            showEditPopover: function() {
                //var self = this;
                this.setupPopover();
                this.$box.popover('show');
            },
            hideEditPopover: function() {
                // if (this.$box.popover) {
                //     this.$box.popover('hide');
                // }
            },
            updateBox: function () {
                if (!this.paper) return;
                //TODO: update for supporting paper size scaling
                // Set the position and the size of the box so that it covers the JointJS element
                // (taking the paper transformations into account).
                var bbox = this.getBBox({useModelGeometry: true});
                var scale = V(this.paper.viewport).scale();

                //TODO: resize any html should go here: look to multiply by this.scale



                this.$box.css({
                    transform: 'scale(' + scale.sx + ',' + scale.sy + ')',
                    transformOrigin: '0 0',
                    width: bbox.width / scale.sx,
                    height: bbox.height / scale.sy,
                    left: bbox.x,
                    top: bbox.y
                });

                // var bbox = this.model.getBBox();
                // // Example of updating the HTML with a data stored in the cell model.
                // // this.$box.find('label').text(this.model.get('label'));
                // // this.$box.find('span').text(this.model.get('select'));
                // this.$box.css({
                //     width: bbox.width,
                //     height: bbox.height,
                //     left: bbox.x,
                //     top: bbox.y,
                //     transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
                // });
            },

            onRemove: function () {

                //if decision then make sure it is removed
                dpa_VM.removeEntry(this.model.attributes);
                //remove from view
                this.$box.remove();

            }
        });

        joint.shapes.epa.StartElement = joint.shapes.devs.Model.extend({
            markup: '<g class="rotatable"><text class="label"/><g class="scalable"><circle/></g><g class="outPorts"/></g>',
            //TODO: inject label
            defaults: joint.util.deepSupplement({
                size: {
                    width: 8,
                    height: 8
                },
                type:'epa.StartElement',
                attrs: {
                    circle: {
                        transform: 'translate(20, 20)',
                        r: 8,
                        fill: '#CCC'
                    },
                    '.label': { text: 'Start', fill:'#6D6D6D', 'text-anchor':'middle'},
                    text: {  'y': '-3em' }

                },
                outPorts: ['start'],
                groups: {
                    'start': {
                        attrs: {
                            '.port-body': {
                                fill: '#CCC'
                            }
                        }
                    }
                }
            }, joint.shapes.devs.Model.prototype.defaults),
            setLabel: function (str) {
                this.attr('.label/text',str);
            }
        });

        joint.shapes.epa.EndElement = joint.shapes.devs.Model.extend({
            markup: '<g class="rotatable"><g class="scalable"><circle/></g><text class="label"/><g class="inPorts"/></g>',

            defaults: joint.util.deepSupplement({

                type: 'epa.EndElement',
                size: { width: 8, height: 8 },
                attrs: {
                    circle: {
                        transform: 'translate(20, 20)',
                        r: 8,
                        fill: '#CCC'
                    },
                    '.label': { text: 'End', fill:'#6D6D6D', 'text-anchor':'middle'},
                    text: {  'y': '-3em' }

                },
                inPorts: ['end'],
                groups: {
                    'end': {
                        attrs: {
                            '.port-body': {
                                fill: '#CCC',
                                magnet: 'passive'
                            }
                        },
                        position: 'left'
                    }
                }
            },  joint.shapes.devs.Model.prototype.defaults),
            setLabel: function (str) {
                this.attr('.label/text',str);
            }
        });

        joint.shapes.epa.FlowConnector = joint.dia.Link.extend({
            defaults: joint.util.deepSupplement({
                type: 'epa.FlowConnector',
                source: { selector: '.card' }, target: { selector: '.card' },
                router: { name: 'manhattan' },
                connector: { name: 'rounded' },
                attrs: { '.connection': { stroke: '#8c8c8c', 'stroke-width': 1 },
                    '.marker-target': { fill: '#CCC' }
                },
                z: -1
            },joint.dia.Link.prototype.defaults)
        });

    },

    createElement: function (position,params) {

        if (params.patternComponents.type === 'multimedia') {

            //TODO: consider moving all html elements to SVG ones later
            //grab html of script
            var templateMM =  dexit.epm.epa.integration.renderTemplate(params.renderType,params);
            return dexit.epm.epa.integration.createHTMLElement(position, templateMM, params);

        }else if (params.patternComponents.type === 'behaviour') {
            if(params.isBR && params.subType === 'recharge'){
                params.renderType = 'erecharge-br';
            }
            var templateBeh =  dexit.epm.epa.integration.renderTemplate(params.renderType,params);


            if (params.isBR) {
                return dexit.epm.epa.integration.createBRHTMLElement(position, templateBeh, params);
            }else {
                return dexit.epm.epa.integration.createHTMLElement(position, templateBeh, params);
            }

        } else if (params.patternComponents.type === 'intelligence') {
            var templateIntel =  dexit.epm.epa.integration.renderTemplate('flex-intelligence',params);
            return dexit.epm.epa.integration.createHTMLElement(position, templateIntel, params);
        } else if (params.patternComponents.type === 'br') {
            var templateBeh =  dexit.epm.epa.integration.renderTemplate(params.renderType,params);
            return dexit.epm.epa.integration.createBRHTMLElement(position, templateBeh, params);

        }


        return new Error('could not draw element');
    },

    createStartElement: function (position) {
        var element =  new joint.shapes.epa.StartElement({
            position: position
        });
        return element;

    },

    /**
     *
     * Renders a knockout template (in-memory) before attaching to page
     * @return {*}
     */
    renderTemplate: function (templateName,data) {
        // create temporary container for rendered html
        var temp = $('<div>');
        // apply "template" binding to div with specified data
        ko.applyBindingsToNode(temp[0], { template: { name: templateName, data: data } });
        // save inner html of temporary div
        var html = temp.html();
        // cleanup temporary node and return the result
        temp.remove();
        return html;
    },

    createEndElement: function (position) {
        var element =  new joint.shapes.epa.EndElement({
            position: position
        });
        return element;
    },

    createHTMLElement: function (position, template, params) {
        params = params || {};


        //render html
        var element = new joint.shapes.epa.HTMLElement(_.extend(params,{
            template:template,
            position:position,
            size: {
                width: 100,
                height: 64
            },
            ports: {
                groups: {
                    'in': {
                        position: {
                            name: 'left'
                        },
                        attrs: {
                            '.port-body': {
                                magnet: 'passive',
                                r: 6
                            }
                        }
                    },
                    'out': {
                        position: {
                            name: 'right'
                        },
                        attrs: {
                            '.port-body': {
                                // fill: '#E74C3C',
                                r:6,
                                magnet:true
                            }
                        }
                    }
                }
            }
        }));

        // element.on('change:position', function (data) {
        //     var position = element.get('position');
        //     console.log('element changed position(x,y):'+position.x + ','+position.y);
        // });

        element.addPort({
            // z:100, //does not seem to matter for html custom element
            label: {
                position: {
                    name: 'left',
                    args: {}
                }
            },
            group: 'in',
            args: {
            },
            attrs: { text: { text: 'in' }, circle: { magnet:'passive',r:6 }}
        });

        element.addPort({
            // z:100,
            magnet: true,
            label: {
                position: {
                    name: 'right',
                    args: {}
                }
            },
            group: 'out',
            args: {},
            attrs: { text: { text: 'out' }, circle: { magnet:true, r:6 }}
        });

        return element;


    },
    createBRHTMLElement: function (position, template, params) {
        params = params || {};


        //render html
        var element = new joint.shapes.epa.HTMLElement(_.extend(params,{
            template:template,
            position:position,
            size: {
                width: 100,
                height: 64
            },
            ports: {
                groups: {
                    'in': {
                        position: {
                            name: 'left'
                        },
                        attrs: {
                            '.port-body': {
                                magnet: 'passive',
                                r: 5
                            }
                        }
                    },
                    'out': {
                        position: {
                            name: 'right'
                        },
                        attrs: {
                            '.port-body': {
                                // fill: '#E74C3C',
                                r:5,
                                magnet:true
                            }
                        }
                    }
                }
            }
        }));

        // element.on('change:position', function (data) {
        //     var position = element.get('position');
        //     console.log('element changed position(x,y):'+position.x + ','+position.y);
        // });

        element.addPort({
            label: {
                position: {
                    name: 'left',
                    args: {}
                }
            },
            group: 'in',
            args: {
            },
            attrs: { text: { text: 'in' }, circle: { magnet:'passive' }}
        });

        element.addPort({
            magnet: true,
            label: {
                position: {
                    name: 'right',
                    args: {}
                }
            },
            group: 'out',
            args: {},
            attrs: { text: { text: 'path1' }, circle: { magnet:true }}
        });
        element.addPort({
            magnet: true,
            label: {
                position: {
                    name: 'right',
                    args: {}
                }
            },
            group: 'out',
            args: {},
            attrs: { text: { text: 'path2' }, circle: { magnet:true }}
        });

        return element;


    },


    //TODO: figure out what to do with this going forward
    // createImageElement: function (position,src, params) {
    //     params = params || {};
    //
    //     var element = new joint.shapes.epa.ImageElementModel(_.extend(params,{
    //         attrs: {
    //             image: {
    //                 'xlink:href': src,
    //                 width: 150,
    //                 height: 100,
    //                 'ref-x': .5,
    //                 'ref-y': .5,
    //                 ref: 'rect',
    //                 'x-alignment': 'middle',
    //                 'y-alignment': 'middle'
    //             }
    //         },
    //         position:position,
    //         size: {
    //             width: 150,
    //             height: 100
    //         },
    //         inPorts: ['in'],
    //         outPorts: ['out']
    //     }));
    //
    //     element.on('change:position', function (data) {
    //         var position = element.get('position');
    //         console.log('element changed position(x,y):'+position.x + ','+position.y);
    //     });
    //
    //     return element;
    // },


    /**
     * TODO: rewrite so existing state so passed epObject is not mutated
     * @param epObject
     */
    loadEPUIObject: function (epObject) {
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



        dexit.epm.epa.integration.clearGraph();
        dexit.epm.epa.integration.graph.fromJSON({cells: cells});
    },

    graphToJSON: function () {
        return dexit.epm.epa.integration.graphObjToJSON(dexit.epm.epa.integration.graph);
    },
    graphObjToJSON: function (graphObj) {
        var data;
        try {
            //get JSON from jointjs graph and also handles any observables through ko util
            //remove any '\"' sequences from string (html templates have them appended)
            data = ko.toJSON(graphObj.toJSON());
            //Also need to convert all '\\"' to '\' since html string template is adding extra
            data = data.replace(/(\\")/g,'\'');
        }catch (e) {
            console.log('could not convert to json');
        }


        return data;
    },
    clearGraph: function () {
        if (dexit.epm.epa.integration.graph) {
            dexit.epm.epa.integration.graph.clear();
        }else {
            dexit.epm.epa.integration.graph = new joint.dia.Graph();
        }
    }

};
