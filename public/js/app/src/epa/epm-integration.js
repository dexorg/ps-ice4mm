/**
 * Copyright Digital Engagement Xperience 2017
 */
/* global async, dexit */

/**
 *
 * @constructor
 */
dexit.epm.EPIntegration = function () {

    var self = this;



    self._findMultimediaId = function (sc, dynamicEPAStructure, element, callback) {

        var tagId = element.id;
        var currElement = _.find(dynamicEPAStructure, {id: element.id});
        if(currElement && currElement.multiMediaList){
            var mmList = ko.utils.unwrapObservable(currElement.multiMediaList);
            //assume one level
            var item = mmList[0];




            // _.each(mmList, function(item) {
            var value = ko.utils.unwrapObservable(item.value);
            var layout = '';
            switch (item.type) {
                case 'video':


                    layout += '<video controls><source data-mm-tag=\'ep-' + tagId + '-mm-video-' + index + '\' src=\'' + value + '\' type=\'video/mp4\'/></video>';
                    break;

                case 'image':
                    layout += '<img src=\'' + value + '\' alt=\'element mm\' data-mm-tag=\'ep-' + tagId + '-mm-image-' + index + '\'>';
                    break;

                case 'link':
                    layout += '<span data-type=\'text\' data-mm-tag=\'ep-' + tagId + '-mm-links-' + (index+100) + '\'>' + value + '</span>';
                    break;

                case 'text':
                    layout += '<textarea data-type=\'text\' data-mm-tag=\'ep-' + tagId + '-mm-text-' + index + '\'>' + value + '</textarea>';
                    break;
            }






            // });


            //layoutHTML += bcAuthVM.generateLayout(mmList, element.id);
        }

    };

    /**
     * @callback GenerateEPCallback
     * @param {Error} [error] - if any error occurs
     * @param {object[]} result - engagement patterns
     */

    /**
     * Generate Engagement Pattern for dynamic
     *
     * @param {object} params
     * @param {object} params.data - SC object
     * @param {object} params.data.property - object
     * @param {string} params.data.property.name - name of EP
     * @param {string} params.repo
     * @param {object[]} params.touchpoints - TP objects  - TP identifier
     * @param {object[]} params.touchpointsAndLayouts - TP and corresponding layout object
     * @param {string} params.touchpointsAndLayouts[].touchpoint - TP identifier
     * @param {object} params.touchpointsAndLayouts[].layout - layout information for touchpoint
     * @param {string} params.touchpointsAndLayouts[].layout.id - layout identifier
     * @param {string|string[]|object} params.touchpointsAndLayouts[].layout.regions - region information
     * @param {string} params.operation - 'create' or 'edit'
     * @param {object} params.epStructure - passed in from integration from specific tool used to visually author EP
     * @param {string} [params.epStructure.type] - if 'jointJS' then use new parser
     * @param {object} params.epStructure.epUIStructure
     * @param {object} [params.epStructure.decisionElements] - legacy
     * @param {object} [params.epStructure.intelligenceElements] - legacy
     * @param {object} params.epUIStructure - passed in from a tool integrated to create an EP
     * @param {string} params.mainScId - workaround to pass in what SC should own the EP (since seperate SC is created as an intermediary)
     * @param {object} params.bcAuthVM - reference to bcAuthVM
     * @param {function} params.bcAuthVM.createMultiMedia
     * @param {function} params.bcAuthVM.captureDynamicLayout
     * @param {function} params.bcAuthVM.createDecision
     * @param {object} [params.existingPattern] -required when operation==='edit'
     * @param {object} [params.parentPattern] - required when operation is clone
     * @param {string} [params.parentPattern.id] - required when operation is clone
     * @param {string} [params.parentPattern.revision] - required when operation is clone
     * @param {GenerateEPCallback} callback
     */
    self.generateEP = function(params, bcAuthVM, callback) {
        if (!bcAuthVM) {
            return callback(new Error('missing required parameter: bcAuthVM'));
        }
        var repo = params.repo;
        var scData = params.data;
        var mainScId = params.mainScId;
        var touchpoints =params.touchpoints;
        var operation = (params && params.operation ? params.operation : null);


        var epName = (scData.property && scData.property.name ? scData.property.name : 'None');

        if (!operation) {
            return callback(new Error('missing required parameter: params.operation'));
        }

        var oldEP = ( params && params.existingPattern ? params.existingPattern : null);

        var parentEP = ( params && params.parentPattern ? params.parentPattern : null);

        if (operation === 'edit' && !oldEP) {
            return callback(new Error('missing existing EP for operation: edit'));
        }

        if (operation === 'clone' && !parentEP) {
            return callback(new Error('missing parent EP for operation: clone'));
        }


        var epUIStructure = params.epStructure.epUIStructure;
        var type = params.epStructure.type;

        //version to distinguish when parsing for execution
        var epVersion = (params.touchpointsAndLayouts ? 2 : 1);

        var epElementReferences = [];

        async.auto({
            //prepare engagement pattern based on structure passed in
            structureEP: function (doneStructureEP) {
                var req = {
                    epUIStructure: epUIStructure,
                    type: type,
                    // decisionElements: params.epStructure.decisionElements,
                    intelligenceElements: params.epStructure.intelligenceElements,
                    epSchemaVersion: epVersion,
                    touchpoints: touchpoints,
                    tp: params.touchpointsAndLayouts || []

                };
                dexit.app.ice.integration.engagementpattern.structureEP(req, function (err, result) {
                    if (err) {
                        console.error('Cannot parse provided pattern');
                        return doneStructureEP(err);
                    }
                    doneStructureEP(null, result);
                });
            },
            //creates additional object and its elements as currently required, in the future most of this block should not be required
            authorBC: function (doneBC) {
                var uiElementsToAuth;
                //TODO: workaround for handling an intelligence with presentation (ie. report)
                if (type && type === 'jointJS') {
                    uiElementsToAuth = _.chain(epUIStructure.cells)
                        .filter(function (val) {
                            return (val.elementType);
                        })
                        .reject(function (cell) {
                            return (cell.subType && cell.subType === 'report');
                        }).value();
                } else {
                    uiElementsToAuth = epUIStructure;
                }
                if (uiElementsToAuth.length < 1) {
                    return doneBC();
                }

                async.each(uiElementsToAuth, function (uiElement, cbEachBCElement) {
                    var behElement = {id: '', type_id: '', args: {}};
                    var intelElement = {id: '', type_id: ''};

                    var mmElement = {id: '', type_id: ''};

                    if (uiElement.elementType && uiElement.elementType === 'multimedia') {
                        //TODO: simplify mmObject from array to object and remove obseravable from here
                        var mmObject = null;
                        var mmIndex = uiElement.id;
                        //make sure an array (really should not be an array
                        mmObject = ko.utils.unwrapObservable(uiElement.multiMediaList);


                        var mm = (mmObject && mmObject.length > 0 && mmObject[0] ?  mmObject[0] : null );
                        if (!mm) {
                            //What does an error mean here if multimedia is empty
                            console.error('mm is empty!');
                            return cbEachBCElement(new Error('multimedia is missing'));
                        }

                        debugger;
                        bcAuthVM.createMultiMedia(scData, mmIndex, mmObject, function (err, response) {
                            if (err) {
                                //What does an error mean here if multimedia cannot be created?
                                console.error(err);
                                return cbEachBCElement(err);
                            }
                            mmElement.id = mmIndex;
                            mmElement.type_id  = 'sc:' + scData.id + ':multimedia:' + response.id + '#' + mm.type; // + layout.id;

                            epElementReferences.push(mmElement);
                            cbEachBCElement();
                        });

                    } else if (uiElement.elementType && uiElement.elementType === 'behaviour') {
                        var eptName = uiElement.elementType;
                        //FIXME: should not be renaming specific one
                        if (eptName.indexOf('recharge') > -1) {
                            eptName = 'e' + eptName;
                        } else if (eptName.indexOf('questionnaire') > -1) {
                            eptName = 'Survey';
                        }
                        //FIXME: not supporting story 4 for good enough
                        //ICEMM-291 set behaviour reference from passed digital service data
                        if (uiElement.behRef && uiElement.behRef.ds && uiElement.behRef.ds.setup.init) {
                            //prepare inputs for service setup
                            var params = {
                                dsId: uiElement.behRef.ds.id,
                                body: {
                                    'setupAction': 'init',
                                    'data': uiElement.setupInputs
                                }
                            };

                            dexit.app.ice.integration.behaviour.setup(params, function (err, res) {
                                if (err) {
                                    console.log(err);
                                    //FIXME: should return error here and inform user
                                } else {
                                    //ICEMM-295: survey beh
                                    if (uiElement.behRef && uiElement.behRef.behId) {
                                        behElement.id = uiElement.id;
                                        behElement.type_id = 'sc:' + uiElement.behRef.scId + ':behaviour:' + uiElement.behRef.behId;
                                    }
                                    behElement.args = {':questionnaire_id': res.id};

                                    epElementReferences.push(behElement);
                                    if (uiElement.isBR) {
                                        //change when above is general: need to correlate questionnaire id to UI element referenced below
                                        uiElement.decisionParameters = {'key': res.id};
                                        //find the output from listOfBehaviourResources, then create the intelligence for linking the BR
                                        //FIXME: property should be from ds definition
                                        var property = {
                                            operationName: 'get_response',
                                            serviceId: '870dd9bb-cff1-49a9-a44f-b30e71c6f36b',
                                            type: 'service-operation',
                                            args: ['questionnaire_id=id', 'userId=userId']
                                        };

                                        dexit.app.ice.edu.integration.lectureManager.addIntelligence(scData.id, property, function (err, res) {
                                            intelElement.id = uiElement.id + '_biz_rule_intelligence';
                                            if (err) {
                                                console.error('could not add intelligence to BC');
                                                return cbEachBCElement(err);
                                            } else {
                                                intelElement.type_id = 'sc:' + scData.id + ':intelligence:' + res.id;
                                            }
                                            epElementReferences.push(intelElement);
                                            cbEachBCElement();
                                        });
                                    } else {
                                        cbEachBCElement();
                                    }
                                }
                            });
                        } else {

                            //for standard behaviours
                            if (uiElement.behRef && uiElement.behRef.behId) {
                                behElement.id = uiElement.id;
                                behElement.type_id = 'sc:' + uiElement.behRef.scId + ':behaviour:' + uiElement.behRef.behId;
                            }
                            if (uiElement.behRef && uiElement.behRef.args) {
                                behElement.args = uiElement.behRef.args;
                            }
                            //for dynamic behaviours
                            if (uiElement.behRef && uiElement.behRef.subType && uiElement.behRef.subType === 'dynamic-behaviour') {
                                behElement.id = uiElement.id;
                                behElement.type_id = 'sc:' + uiElement.behRef.scId + ':behaviour:' + uiElement.behRef.src;
                                behElement.args = {src: uiElement.behRef.src};
                            }

                            epElementReferences.push(behElement);
                            cbEachBCElement();
                        }
                    } else if(uiElement.elementType && uiElement.elementType === 'br') {
                        if (uiElement.setupBR) {
                            //change when above is general: need to correlate to key for data
                            //uiElement.decisionParameters = {'key': res.id};
                            //find the output from listOfBehaviourResources, then create the intelligence for linking the BR
                            var scIdForIntel = uiElement.setupBR.scId || scData.id;

                            var id = uiElement.setupBR.intelligence;
                            //replace : with '_'
                            if (id && id.indexOf('temp:') !== -1) {
                                id = 'temp-' + id.split(':')[1];
                            }

                            var it = {type_id :'sc:' + scIdForIntel + ':intelligence:' + id, id: uiElement.id + '_biz_rule_intelligence'};
                            epElementReferences.push(it);
                            cbEachBCElement();
                        } else {

                            cbEachBCElement();
                        }
                    }else {
                        cbEachBCElement();
                    }
                }, doneBC);
            },
            retrieveBC: ['authorBC', function (cb, result) {
                // var args = {
                //     id: scData.id,
                //     type: bcAuthVM.mainVM.currBCDef().bctype,
                // };
                // dexit.app.ice.integration.bcp.retrieveBCInstance(args,cb);
                cb();
            }],
            authorEPsElements: ['structureEP', 'retrieveBC','authorBC', function (doneAuthEPEls, result) {
                var ep = result.structureEP;
                //var sc = result.retrieveBC;

                async.each(ep.element, function (element, cbEachElement) {
                    if (element.type && element.type === 'multimedia') {
                        // var mmUIElements;
                        // if (type && type === 'jointJS') {
                        //     mmUIElements = _.filter(epUIStructure.cells, function (cell) {
                        //         return (cell.elementType === 'multimedia');
                        //     });
                        // } else {
                        //     mmUIElements = epUIStructure;
                        // }

                        // var mmObject = null;
                        // var mmIndex = uiElement.id;

                        var elementRef = _.find(epElementReferences, {id: element.id});
                        element.id = elementRef.id;
                        element.type_id = elementRef.type_id;


                    //     //make sure an array (really should not be an array
                    //     mmObject = ko.utils.unwrapObservable(uiElement.multiMediaList);
                    //
                    //
                    //     var mm = (mmObject && mmObject.length > 0 && mmObject[0] ?  mmObject[0] : null );
                    //     if (!mm) {
                    //         //What does an error mean here if multimedia is empty
                    //         console.error('mm is empty!');
                    //         return cbEachBCElement(new Error('multimedia is missing'));
                    //     }
                    //
                    //     // if (operation === 'create') {
                    //     //     debugger;
                    //     //     bcAuthVM.captureDynamicLayout(scData, mmUIElements, element, 'ucc', null, function (err, layout) {
                    //     //         if (err) {
                    //     //             console.error(err);
                    //     //             return cbEachElement(err);
                    //     //         } else {
                    //     //             element.type_id = 'sc:' + scData.id + ':layout:' + layout.id;
                    //     //         }
                    //     //         cbEachElement();
                    //     //     });
                    //     // } else {
                    //     //     //FIXME: in editing mode, the previouse layout id can not be retrieved and passed to new EP generated,
                    //     //     //by default the first EP in widget.ePatterns() will be retrieved to display in UI
                    //     //     var existingLayoutId = element.type_id.split(':')[3];
                    //     //     bcAuthVM.captureDynamicLayout(scData, epUIStructure.cells, element, 'ucc', existingLayoutId, function (err, layout) {
                    //     //         if (err) {
                    //     //             console.error(err);
                    //     //             return cbEachElement(err);
                    //     //         } else {
                    //     //             element.type_id = 'sc:' + scData.id + ':layout:' + layout.id;
                    //     //         }
                    //     //         cbEachElement();
                    //     //     });
                    //     // }
                        cbEachElement();
                    } else if (element.type && element.type === 'behaviour') {
                        //find the beh reference from epElementReferences
                        var elementRef = _.find(epElementReferences, {id: element.id});
                        if (elementRef && elementRef.type_id) {
                            element.type_id = elementRef.type_id;
                            if (elementRef.args && !_.isEmpty(elementRef.args)) {
                                _.extend(element.args, elementRef.args);
                            }
                        }
                        cbEachElement();

                    } else if (element.type && element.type === 'decision') {
                        var bizRuleElement = _.find(epUIStructure.cells, {id: element.id.split('_')[0]});
                        //If intelligence Element exist in the pattern, then create it, and create decision element after it, otherwise, just create the decision element
                        var intelligenceElement = _.find(ep.element, {
                            type: 'intelligence',
                            id: element.id.split('_')[0] + '_biz_rule_intelligence'
                        });
                        if (intelligenceElement) {
                            //loop up the created intelligence reference
                            var intelligence = _.find(epElementReferences, {id: intelligenceElement.id});
                            if (intelligence) {

                                //FIXME: coupling of business rule
                                intelligenceElement.type_id = intelligence.type_id;
                                var scIntelligneceId = intelligence.type_id.split(':')[3];
                                var scIntelligenceScId = intelligence.type_id.split(':')[1];

                                if (bizRuleElement.elementType === 'br') {
                                    bcAuthVM.createIfElseBR(scData,element,bizRuleElement.setupBR,scIntelligneceId,scIntelligenceScId,function (decision) {
                                        if (decision) {
                                            element.type_id = decision;

                                            element.args = element.args || {};
                                            //also mixin decision args
                                        }
                                        //should handle error
                                        cbEachElement();
                                    });
                                }else {

                                    bcAuthVM.createDecision(scData, element, {
                                        intelligence: scIntelligneceId,
                                        bussnessRule: bizRuleElement
                                    }, function (decision) {
                                        if (decision) {
                                            element.type_id = decision;

                                            element.args = element.args || {};
                                            //also mixin decision args
                                            element.args = _.extend(element.args, bizRuleElement.decisionParameters);
                                        }
                                        cbEachElement();
                                    });
                                }
                            } else {
                                console.log('intelligence reference from epElementReferences not found!');
                                cbEachElement();
                            }
                        } else {
                            cbEachElement();
                        }
                    } else if (element.type && element.type === 'intelligence') {
                        if (element.subType && (element.subType === 'engagement-pattern'|| element.subType === 'dynamic-ept' || element.subType === 'dynamic-ept-params') ) {


                            //find intelligenceId
                            var elementUIRef = _.find(epUIStructure.cells, {id:element.id});

                            element.type_id = 'sc:' +  elementUIRef.intelRef.scId +  ':intelligence:' + elementUIRef.intelRef.intelId;
                            element.name = elementUIRef.intelRef.name;
                            element.description = elementUIRef.intelRef.name;


                            //add any params from dynamic to args for execution
                            if (elementUIRef.intelRef && elementUIRef.intelRef.executionParams) {

                                if (elementUIRef.intelRef.executionParams.tag && elementUIRef.elementTag) {
                                    elementUIRef.intelRef.executionParams.tag = elementUIRef.elementTag;
                                }


                                element.args = _.extend(element.args,elementUIRef.intelRef.executionParams);
                                //default to embedded mode
                                debugger;


                                element.presentationRef = elementUIRef.intelRef.presentation || 'embedded';


                            } else {
                                var args = {};
                                if (elementUIRef.intelRef.src.indexOf('latest') !== -1) {
                                    args.epId = elementUIRef.intelRef.src;
                                } else {
                                    args.epId = elementUIRef.intelRef.id;
                                }

                                element.args = _.extend(element.args,args);
                            }


                            //element.args = _.extend(element.args, {epId:elementUIRef.intelRef.id});
                            cbEachElement();

                        }else {
                            cbEachElement();
                        }
                    } else {
                        console.warn('skipping: %o', element);
                        cbEachElement();
                    }
                }, function (err) {
                    if (err) {
                        doneAuthEPEls(err);
                    }else {
                        doneAuthEPEls(null,ep);
                    }
                });

            }],
            authEPTemp: ['authorEPsElements',function (done, result) {
                var ep = result.authorEPsElements;
                ep.mainScId = mainScId;
                ep.name = epName; //set the name here

                switch (operation) {
                    case 'create':
                        self._epAuthoring(ep, scData, repo, 'store', null, null,done);
                        break;
                    case 'clone':
                        self._epAuthoring(ep, scData, repo, 'clone', parentEP.id, parentEP.revision,done);
                        break;
                    case 'edit':
                        self._epAuthoring(ep, scData, repo, 'update', oldEP.id, oldEP.revision, done);
                        break;
                    default:
                        return done(new Error('unrecognized operation'));
                        //very unlikel to  ever reach here
                }

            }],
            retrievePatterns: ['authEPTemp', function (done) {
                //TODO: only retrieve new/updated EP

                dexit.app.ice.integration.engagementpattern.retrieveSCPatterns(repo, scData.id, function (err, res) {
                    if (err) {
                        console.error('Cannot retrieve engagement pattern');
                        done();
                    } else if (res && res.length > 0) {
                        done(null,res);
                    } else  {
                        console.error('Cannot find any engagement patterns');
                        done();
                    }
                });
            }]
        }, function(err, results){
            if (err) {
                console.log('there was a problem creating the EP');
                callback(err);
            }
            callback(null,results.retrievePatterns);
        });

    };

    /**
     * @callback {epAuthoringCallback}
     * @param {Error} [err] - if error occurs
     * @param {number} data - pattern id (on success)
     */


    /**
     * Generate Engagement Pattern for dynamic
     *
     * @param {object} ePattern - parsed EP object
     * @param {object} sc - SC object
     * @param {string} repo - repo
     * @param {string} operation - create/edit
     * @param {string} patternId - passed id for update/clone
     * @param {string} revision - passed id for update/clone
     * @param {epAuthoringCallback} callback
     */
    self._epAuthoring = function(ePattern, sc, repo, operation, patternId, revision, callback) {
        if(ePattern) { //&& ePattern.element && ePattern.element.length>0) {
            if(operation==='store') {
                var body = {
                    scId: sc.id,
                    repo: repo,
                    pattern: ePattern
                };
                dexit.app.ice.integration.engagementpattern.store(body, function (err, res) {
                    if (err) {
                        console.error('Cannot store engagement pattern');
                        callback(err);
                    } else {
                        console.log('Ep is created: ' + res);
                        callback(null, res);
                    }

                });
            }else if(operation==='clone') {
                var bodyClone = {
                    scId: sc.id,
                    repo: repo,
                    pattern: ePattern,
                    parentEPId: patternId,
                    parentEPRevision: revision
                };
                dexit.app.ice.integration.engagementpattern.clone(bodyClone, function(err, res){
                    if(err){
                        console.error('Cannot store engagement pattern');
                        callback(err);
                    } else {
                        console.log('Ep is created: '+res);
                        callback(null, res);
                    }

                });
            } else if(operation==='update' && patternId) {
                var epBody = {
                    scId: sc.id,
                    repo: repo,
                    pattern: ePattern
                };
                revision = revision || '1';
                dexit.app.ice.integration.engagementpattern.update(patternId, revision, epBody, function(res){
                    if(res){
                        console.log('Ep is updated: '+patternId);
                        callback(null, patternId);
                    } else {
                        console.error('Cannot update engagement pattern');
                        callback(new Error('Cannot update engagement pattern'));
                    }
                });
            } else  {
                callback(new Error('Unrecognized option'));
            }
        } else{
            console.log('element not found in EP！');
            callback(new Error('Pattern has no elements'));
        }

    };


    /**
     * Creates a new version of an existing EP
     * @param {object} params
     *
     * @param {object} params.data - SC object for the EngagementPlan
     * @param {string} params.newName - name for new version
     * @param {object} params.existingPattern - engagement pattrn
     * @param {string} params.parentId
     * @param callback
     */
    self.copyEPToNewVersion = function(params, bcAuthVM, callback) {

        //copy
        if (!params || !params.data) {
            return callback(new Error('missing required parameter: data'));
        }

        var epUItype = 'jointJS';
        bcAuthVM.propertyTextValue([params.newName]);

        // if (_.isString(params.data.property.touchpoints)) {
        //
        // }
        //
        //
        // var tpIds = _.map(params.data.property.touchpoints, function (val) {
        //     if _.isString()
        //     return val.id;
        // });



        var copySC = _.cloneDeep(params.data);

        var parentName = copySC.property.name;






        // copySC.property.touchpoints = tpIds;

        var tpIds = (_.isString(copySC.property.touchpoints) ? [copySC.property.touchpoints] : copySC.property.touchpoints);


        //clean
        var epUIObj = JSON.parse(params.data.property.epObject.replace(/(?:\r\n|\r|\n)/g, '\\n'));


        copySC.property.name = params.newName;
        var existingPattern = params.existingPattern;

        //when we remove extra BC, then update these steps
        async.auto({
            createEngPlanSC: function (cb) {
                //remove 'version' and 'isAssignedTo', 'date', 'date_modified'
                var filteredProp = _.omit(copySC.property,['isAssignedTo','version','date','date_modified']);

                var params_create = {
                    property: filteredProp,
                    type: params.type
                };
                copySC.property.name = params.newName;
                dexit.app.ice.integration.bcp.createBCInstance(params_create, cb);
            },
            createMM: ['createEngPlanSC',function (cb, result) {
                bcAuthVM.createPropertyAsMM(result.createEngPlanSC,cb);
            }],
            createSCElements: ['createEngPlanSC',function (cb, result) {
                // var newScId = result.createEngPlanSC.id;
                // var oldSC = params.data;
                //
                // var oldIdToNewId ={};
                // async.auto({
                //     image: function cb() {
                //         async.each()
                //     },
                //     video: function cb() {
                //
                //     },
                //     text: function cb() {
                //
                //     },
                //     intelligence: function cb() {
                //
                //     },
                //     decision: function cb() {
                //
                //     },
                // }, function (err) {
                //     cb(err,oldIdToNewId);
                // });
                cb();

            }],
            updateEPUIObj: function (cb) {
                //parse each ep object cell for any observables
                async.map(epUIObj.cells, function (element, done) {

                    if (element.patternComponents && element.patternComponents.type && element.patternComponents.type === 'behaviour') {
                        //need to change behRef id

                        var oldSCId =  params.data.id;

                        if (element.behRef && element.behRef.scId && element.behRef.scId === oldSCId) {
                            //TODOmake copy of behaviour
                        }


                        return done(null,element);
                        //find old behaviour
                    }

                    if (element.elementType === 'multimedia') {


                    }

                    //otherwise leave as-is
                    // if (element.type == 'epa.startElement' || element.type === 'epa.endElement' || element.type === 'epa.FlowConnector') {
                    done(null,element);
                }, function (err, mapped) {
                    if (err) {
                        return cb(err);
                    }

                    var graph = new joint.dia.Graph();
                    graph.fromJSON({cells: mapped});
                    var json = dexit.epm.epa.integration.graphObjToJSON(graph);

                    cb(null,json);
                });

            },
            retrieveBC: ['createEngPlanSC', 'createSCElements', 'createMM', function (cb, result) {
                var args = {
                    id: result.createEngPlanSC.id,
                    type: params.type
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(args,cb);
            }],
            updateBC: ['retrieveBC', function (cb, result) {
                var sc = result.retrieveBC;
                var prop = sc.property;
                prop.epObject = result.updateEPUIObj;
                //TODO: use update BC
                dexit.scm.dcm.integration.sc.updateSC(params.repo, sc.id, prop, cb);

            }],
            createEP: ['createEngPlanSC', 'createSCElements', 'retrieveBC','updateEPUIObj', 'updateBC',function (cb, result) {
                var epUIObj = result.updateEPUIObj;

                var sc = result.createEngPlanSC;
                var tps = existingPattern.pattern.touchpoints;
                //prepare object expected

                // var touchpointsAndLayouts = _.map(tps, function (tpId) {
                //     return {touchpoint: tpId, layout: { }, tpParams: { 'allImplictEpts': true}};
                // });

                var  touchpointsAndLayouts = existingPattern.pattern.tp;


                var args = {
                    repo: params.repo,
                    data: sc,
                    touchpoints: tps,
                    operation: 'clone',
                    epStructure: {
                        type: epUItype,
                        epUIStructure: JSON.parse(epUIObj),
                        // decisionElements: copySC.property.decisionElements,
                        intelligenceElements: copySC.property.intelligenceElements
                    },
                    parentPattern: {
                        id: existingPattern.id,
                        revision: existingPattern.revision
                    },
                    touchpointsAndLayouts: touchpointsAndLayouts,
                    mainScId: params.parentId,
                };

                self.generateEP(args, bcAuthVM, function(err, ep) {
                    if (err || !ep) {
                        //do not continue if a problem
                        //should consolidate and clean-up createBCInstance
                        return cb(new Error('problem updating EP'));
                    }

                    cb(null,ep);
                });

            }],
            //FIXME: should be done by BC api
            assignToContainer: ['createEngPlanSC','createEP',function (cb, results) {
                dexit.app.ice.integration.scm.assignToContainer(params.repo, results.createEngPlanSC.id, params.parentId, function(response, err) {
                    cb();
                });
            }],
            retrieveEPSC: ['assignToContainer', function (cb, result) {
                var args = {
                    id: result.createEngPlanSC.id,
                    type: params.type
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(args,cb);
            }]
        }, function (err, results) {
            debugger;
            if (err) {
                return callback(err);
            }else {
                callback(null,{sc: results.retrieveEPSC, ep: results.createEP});
            }

            //callback(err);
        });

    };
};
