/**
 * Copyright Digital Engagement Xperiance
 * Date: 11/12/15
 * @author Ali Hussain
 * @description This function focus on adding elements to the BC (currently SC).
 */

dexit.app.ice.edu.bcAuthoring = {};
dexit.app.ice.edu.bcAuthoring.AddingBCElementsVM = function (args) {

    var noOp = function () {
    };

    var mainVM = args.mainVM;
    var dcmManagement = args.dcmManagement;
    var bcAuthVM = args.bcAuthVM;

    bcAuthVM.questionnaireId = '';



    /**
     * TODO: this logic should just move to dexit.app.ice.integration.bcp.createBCBehaviour
     * Isolate any behaviour creation quirks (some removed)
     * Limitations: Only goes one level of depth
     * @param {string} params.bciId
     * @param {string} params.bcType
     * @param {object} params.body
     * @param callback
     */
    bcAuthVM.createBehaviorForBCi = function (params, callback) {

        if (!params.behaviourReq) {
            return callback(new Error('behaviour body is required'));
        }

        if (!params.id) {
            return callback(new Error('bciId is required'));
        }

        if(!params.type){
            return callback(new Error('bc type is required'));
        }

        dexit.app.ice.integration.bcp.createBCBehaviour(params, function (err, behaviour) {
            if (err) {
                console.log('Could not create behaviour');
                return callback(err);
            }
            callback(null, behaviour);
        });
    };


    bcAuthVM.createIfElseBR = function (sc, element, brSetup, intel, scId, callback) {


        /**
         * Creates the condition statement for numbers or strings
         * Constraints of rule engine utilized will not allow conditions mixing control characters and operators.
         * This will make sure strings are captured correctly. And also that number comparisons are saved in the correct format expected.
         * @param {string} condition - left side of condition
         * @param {string} operator - operator (ie. ==)
         * @param {string/number} decisionChoice - decision value
         * @returns {*} - returns in either format: con > 2 or con === /^never again&/
         */
        function prepareDecisionChoice(condition, operator, decisionChoice) {
            var leftWrap = '';
            var rightWrap = '';
            //if a string compare wrap decision choice for BR engine due to its handling of certain characters
            if (['!=~','=~'].indexOf(operator) > -1) {
                leftWrap = '/^';
                rightWrap = '$/';
            }

            return 'intel.'+condition + operator + leftWrap + decisionChoice + rightWrap;
        }

        //2 cases for intel: temporary intel (intelligence element with id containing temp) or from BI (so intelligence element alreay exists)
        var c1= brSetup.pathConditions[0];
        var c2= brSetup.pathConditions[1];


        var ifDec = {
            name: 'decision for ep (if)',
            location: 'sc:' + scId + '/intelligence:' + brSetup.intelligence + '/id=key',
            context: 'service',
            actionType: 'not-used',
            action: '',
            arguments: 'key',
            condition: prepareDecisionChoice(c1.ls, c1.comparator, c1.rs)
        };

        var elseDec =  {
            name: 'decision for ep (else)',
            location: 'sc:' + scId + '/intelligence:' + brSetup.intelligence + '/id=key',
            context: 'service',
            actionType: 'not-used',
            action: '',
            arguments: 'key',
            condition: prepareDecisionChoice(c2.ls, c2.comparator, c2.rs)
        };

        var decisionArray = [];

        //TODO:fix rest strategy or service to return json. This should be returning (err, result) but is returning err with decision id
        dexit.scm.dcm.integration.sc.decision.create(mainVM.repo, ifDec, sc.id, function (decision) {
            decisionArray.push('sc:' + sc.id + ':decision:' + decision.responseText);

            dexit.scm.dcm.integration.sc.decision.create(mainVM.repo, elseDec, sc.id, function (decision2) {
                decisionArray.push('sc:' + sc.id + ':decision:' + decision2.responseText);
                callback(decisionArray);
            });


        });



    };

    /**
     * Create Decision
     * @param {object} sc - smart content object
     * @param {object} element - engagement pattern element
     * @param {string/string[]} element.type_id - SC supports only production rules. if the ep contains a decision with if-then=else-then type_id is an array
     * @param {object} params - parameters to pass
     * @param {string} params.intelligence - intelligence identifier reference
     * @param {object} params.bussnessRule - from uiElement
     * @param {object} [params.bussnessRule.decisionParameters] - optional parameters to mix in
     * @param callback
     * @returns {*}
     */
    bcAuthVM.createDecision = function (sc, element, params, callback) {

        var bizRuleElement = params.bussnessRule;

        /**
         * Returns only if the passed in number or string is actually a number
         * @param {*} item - passed in value
         * @returns {number} - returns the value only if it is a number
         */
        function returnIfNumber(item) {
            var val = Number(item);
            if (!_.isNaN(val)) {
                return val;
            }
        }

        /**
         * Creates the condition statement for numbers or strings
         * Constraints of rule engine utilized will not allow conditions mixing control characters and operators.
         * This will make sure strings are captured correctly. And also that number comparisons are saved in the correct format expected.
         * @param {string} condition - left side of condition
         * @param {string} operator - operator (ie. ==)
         * @param {string/number} decisionChoice - decision value
         * @returns {*} - returns in either format: con > 2 or con === /^never again&/
         */
        function prepareDecisionChoice(condition, operator, decisionChoice) {
            if (returnIfNumber(decisionChoice)) {
                return condition + operator + decisionChoice;
            } else { //otherwise treat as string
                //use regex to make sure any special characters are considered (",' etc) instead of single quotes due to rule engine handling of control characters (", ' [, ] etc)
                //this will match from start of string to end of string the value (decision choice)

                //TODO: move logic out of ICE4E related to the structure of the decision ICEEDU-1192
                var op = '=~';
                if (operator === '!=') {
                    op = '!=~';
                } else if (operator === '==') {
                    op = '=~';
                }
                return condition + op + '/^' + decisionChoice + '$/';
            }
        }


        function getOpposingOperator(selectedOp) {

            var oppositeOp = '';
            switch(selectedOp) {
                case '>=':
                    oppositeOp = '<';
                    break;
                case '<=':
                    oppositeOp = '>';
                    break;
                case '==':
                    oppositeOp = '!=';
                    break;
                default:
                    console.warn('no suitable operation found');
            }

            return oppositeOp;
        }

        var decisionBody;
        var decisionChoice;
        var decisionArray = [];
        if(bizRuleElement){
            if(bizRuleElement.subType && bizRuleElement.subType === 'questionnaire'){
                decisionChoice = bizRuleElement.setupInputs.answers[0]; //FIXME
                //decisionChoice = bizRuleElement.questionComponents.answers[0];

                // var currentDecision = _.find(dpa_VM.decisionElements(), {decRef: element.args.decRef});
                // decisionChoice = currentDecision.selectedAnswer();

                //TODO: currently hardcoded, should to be able to select operation
                var selectedOp = '>=';
                //Platform supports only if-then decisions, if the ep contains a decsion with if-then=else-then (ep decision element contains array type_id).
                if (element && element.type_id && element.type_id instanceof Array) {
                    if (decisionChoice) {
                        selectedOp = '==';
                        decisionBody = {
                            name: 'decision for ep',
                            location: 'sc:' + sc.id + '/intelligence:' + params.intelligence + '/id=key',
                            context: 'service',
                            actionType: 'not-used',
                            action: '',
                            arguments: 'key',
                            condition: prepareDecisionChoice('intel.responses[0].answers[0]', selectedOp, decisionChoice),
                            workaroundcondition: '#sc:' + sc.id + '/' + 'intelligence:' + decisionChoice + '#operation:' + selectedOp + '#value:1'
                        };

                        dexit.scm.dcm.integration.sc.decision.create(mainVM.repo, decisionBody, sc.id, function (decision) {
                            decisionArray.push('sc:' + sc.id + ':decision:' + decision.responseText);
                            var oppositeOp =  getOpposingOperator(selectedOp);
                            decisionBody = {
                                name: 'opposing decisions for ep',
                                location: 'sc:' + sc.id + '/intelligence:' + params.intelligence + '/id=key',
                                context: 'service',
                                actionType: 'not-used',
                                action: '',
                                arguments: 'key',
                                condition: prepareDecisionChoice('intel.responses[0].answers[0]', oppositeOp, decisionChoice),
                                workaroundcondition: '#sc:' + sc.id + '/' + 'intelligence:' + decisionChoice + '#operation:' + oppositeOp + '#value:1'
                            };

                            //TODO:fix rest strategy or service to return json. This should be returning (err, result) but is returning err with decision id
                            dexit.scm.dcm.integration.sc.decision.create(mainVM.repo, decisionBody, sc.id, function (decision) {
                                decisionArray.push('sc:' + sc.id + ':decision:' + decision.responseText);
                                callback(decisionArray);
                            });
                        });
                    } else {
                        return callback(decisionArray);
                    }
                } else if (element && element.type_id && (element.type_id instanceof Array === false)) {
                    //TODO: add some code documentation on this block
                    if (decisionChoice) {
                        decisionBody = {
                            name: 'decision for ep',
                            location: 'sc:' + sc.id + '/intelligence:' + params.intelligence + '/id=key',
                            context: 'service',
                            actionType: 'not-used',
                            action: '',
                            arguments: 'key',
                            condition: prepareDecisionChoice('intel.responses[0].answers[0]', '==', decisionChoice),
                            workaroundcondition: '#sc:' + sc.id + '/' + 'intelligence:' + decisionChoice + '#operation:' + selectedOp + '#value:1'
                        };
                        dexit.scm.dcm.integration.sc.decision.create(mainVM.repo, decisionBody, sc.id, function (decision) {
                            callback('sc:' + sc.id + ':decision:' + decision.responseText);
                        });
                    } else {
                        console.error('No decision element found in ep');
                        return callback(decisionArray);
                    }
                }
            } else if(bizRuleElement.subType && bizRuleElement.subType.indexOf('recharge') > -1){
                var selectedOp = '>=';
                decisionBody = {
                    name: 'decision for ep',
                    location: 'sc:' + sc.id + '/intelligence:' + params.intelligence + '/id=key',
                    context: 'service',
                    actionType: 'not-used',
                    action: '',
                    arguments: 'key',
                    condition: prepareDecisionChoice('intel.amountCharged', selectedOp, 40)
                };
                dexit.scm.dcm.integration.sc.decision.create(mainVM.repo, decisionBody, sc.id, function (decision) {
                    decisionArray.push('sc:' + sc.id + ':decision:' + decision.responseText);
                    var oppositeOp =  getOpposingOperator(selectedOp);
                    decisionBody = {
                        name: 'opposing decisions for ep',
                        location: 'sc:' + sc.id + '/intelligence:' + params.intelligence + '/id=key',
                        context: 'service',
                        actionType: 'not-used',
                        action: '',
                        arguments: 'key',
                        condition: prepareDecisionChoice('intel.amountCharged', oppositeOp, 40),
                    };

                    //TODO:fix rest strategy or service to return json. This should be returning (err, result) but is returning err with decision id
                    dexit.scm.dcm.integration.sc.decision.create(mainVM.repo, decisionBody, sc.id, function (decision) {
                        decisionArray.push('sc:' + sc.id + ':decision:' + decision.responseText);
                        callback(decisionArray);
                    });
                });
            }

        } else {
            console.error('No decision element found in ep');
            return callback(decisionArray);
        }
    };


    bcAuthVM.createIntelligence = function (sc, property, callback) {

        dexit.app.ice.edu.integration.lectureManager.addIntelligence(sc.id, property, function (err, res) {
            if (err) {
                console.error('could not add intelligence to BC');
                callback();
            } else {
                callback(res.id);
            }
        });
    };


    /**
     * Create behaviour that does not have any extra inputs considered for setup
     * @param {object} params
     * @param {object} params.element
     * @param {array}  params.behaviours
     * @param callback  - of convention (err, result)
     */
    bcAuthVM.createICE4MBehaviour = function (sc, params, callback) {
        callback = callback || noOp;
        mainVM.selectedSC(sc);
        var behaviourId;
        var rechargeBehaviourList = params.behaviours;
        var allBehaviours = _.after(rechargeBehaviourList.length, function () {
            callback(null, {id: behaviourId, args: {':user': '{{user.firstName}}'}});
        });
        var forEachBehaviour = function (beh) {

            bcAuthVM.createBehaviorForBCi(beh, sc.id, function (err, behaviour) {
                if (err) {
                    console.log('Could not create behaviour');
                    allBehaviours();
                }
                else {
                    behaviour.uuid = behaviour.id;
                    //FIXME: do not re-assign id to uuid and should not need to check beh.id
                    if (beh.id.toLowerCase().indexOf('post_url') > -1 ||
                        beh.id.toLowerCase().indexOf('post_eorder') > -1 ||
                        beh.id.toLowerCase().indexOf('post_evoucher') > -1 ||
                        beh.id.toLowerCase().indexOf('post_pay') > -1 ||
                        beh.id.toLowerCase().indexOf('post_link') > -1) {
                        //this behaviour will be consumed in SDK
                        behaviourId = behaviour.id;
                    }
                    allBehaviours();
                }
            });
        };
        if (rechargeBehaviourList && rechargeBehaviourList.length > 0) {
            _.each(rechargeBehaviourList, forEachBehaviour);
        } else {
            console.error('Engagement Point behaviour resources not found!');
            callback(new Error('Engagement Point behaviour resources not found!'));
        }

    };



    // /**
    //  *
    //  * TODO: remove
    //  * Creates behaviour entry
    //  * @param sc
    //  * @param params.element: UI Element of behaviours
    //  * @param params.behaviours : resources from ept definition
    //  * @param callback - of convention (result)
    //  * TODO: error,result not returned here for structure - inconsistent with others
    //  *
    //  */
    // bcAuthVM.createBehaviour = function(sc, params, callback) {
    //     var currentElement = params.element;
    //     var listOfBehaviours = params.behaviours;
    //     //assuming all the other services are handled here
    //     bcAuthVM.createICE4MBehaviour(sc, params, callback);
    //
    //
    //
    // };

    bcAuthVM.createPropertyAsMM = function (sc, callback) {
        var allTextParameters = _.after(bcAuthVM.propertyTextValue().length, function () {
            callback();
        });
        var forEachTextValue = function (element, index, list) {
            if (element !== '') {
                var tagNum = index + 1;
                bcAuthVM.createMultimediaObj('text', element, 'property-mm-' + tagNum, sc.id, function (err) {
                    allTextParameters();
                });
            }
            else {
                allTextParameters();

            }
        };
        _.each(bcAuthVM.propertyTextValue(), forEachTextValue);
    };
    /*
     object: array of objects to indecate the MM type and URL
     [{type:'video', value:'url.test'},
     {type:'video', value:'url2.test'},
     {type:'image', value:'imageurl.test'},
     {type:'text', value:'this is sample text'},
     {type:'links', value:'linkURL'}]
     */
    /**
     * TODO: copied from DCM, fix and revise
     * @param sc
     * @param elementId
     * @param mmObject
     * @param callback
     */
    bcAuthVM.createMultiMedia = function (sc, elementId, mmObject, callback) {
        //why is this called here?
        mainVM.stopVideo();


        //object = [
        // {type:'video', value:'url.test'},
        // {type:'video', value:'url2.test'},
        // {type:'image', value:'imageurl.test'},
        // {type:'text', value:'this is sample text'},
        // {type:'links', value:'linkURL'}]

        //TODO: remove selectedSC
        mainVM.selectedSC(sc);


        var data = {};
        var err2;

        //parse the objects to {image:[url1,url2], video:[url1,url2], text:['text1','text2'], links:[link1,link2]}
        var multiMediaList = {image: [], video: [], text: [], links: []};
        if (mmObject !== null) {
            _.each(mmObject, function (element) {
                if (element.type === 'image') {
                    multiMediaList.image.push(ko.utils.unwrapObservable(element.value));
                } else if (element.type === 'video') {
                    multiMediaList.video.push(ko.utils.unwrapObservable(element.value));
                } else if (element.type === 'text') {
                    multiMediaList.text.push(ko.utils.unwrapObservable(element.value));
                } else if (element.type === 'link') {
                    multiMediaList.links.push(ko.utils.unwrapObservable(element.value));
                }else {
                    //not account for
                    debugger;
                }
            });
        }


        async.series([
            function createImagesMM(done) {

                //MM passed from Dynamic EP
                if (multiMediaList.image.length > 0) {
                    var allImages = _.after(multiMediaList.image.length, function () {
                        done();
                    });
                    var forEachImage = function (imageURL, index, list) {
                        bcAuthVM.createMultimediaObj('image', imageURL, 'ep-' + elementId + '-mm-image-' + index, sc.id, function (err, resp) {
                            if (err) {
                                err2 = err;
                            }else {
                                data = resp;
                            }
                            allImages();
                        });

                    };
                    _.each(multiMediaList.image, forEachImage);
                } else {
                    done();
                }

            },
            function createVideosMM(done) {

                //MM passed from Dynamic EP
                if (multiMediaList.video.length > 0) {
                    var allVideos = _.after(multiMediaList.video.length, done);
                    var forEachVideo = function (videoURL, index, list) {
                        //get video name from url without the file extension
                        var name = videoURL.match(/([\w\d_-]*)\.?[^\\\/]*$/i)[1];
                        bcAuthVM.createMultimediaObj('video', videoURL, 'ep-' + elementId + '-mm-video-' + index, sc.id, {name: name}, function (err,resp) {
                            if (err) {
                                err2 = err;
                            } else {
                                data = resp;
                            }
                            allVideos();
                        });
                    };
                    _.each(multiMediaList.video, forEachVideo);
                } else {
                    done();
                }


            },
            function createTextMM(done) {

                //MM passed from Dynamic EP
                if (multiMediaList.text.length > 0) {
                    var allTexts = _.after(multiMediaList.text.length, done);
                    var forEachText = function (text, index, list) {
                        bcAuthVM.createMultimediaObj('text', text, 'ep-' + elementId + '-mm-text-' + index, sc.id, function (err,resp) {
                            if (err) {
                                err2 = err;
                            } else {
                                data = resp;
                            }
                            allTexts();
                        });
                    };
                    _.each(multiMediaList.text, forEachText);
                } else {
                    done();
                }
            },
            function createLinksMM(done) {
                var linksList = [];
                var textValue, tagNum, elementIndex;

                if (multiMediaList.links.length > 0) {
                    var allLinks = _.after(multiMediaList.links.length, done);
                    _.each(multiMediaList.links, function (linkElement, index, list) {
                        if (linkElement) {
                            //get the document name from link url
                            var linkName = linkElement.split('/').pop();
                            textValue = linkName + ': ' + linkElement;
                            tagNum = index + 100;
                            bcAuthVM.createMultimediaObj('text', textValue, 'ep-' + elementId + '-mm-links-' + tagNum, sc.id, function (err,resp) {
                                if (err) {
                                    err2 = err;
                                }else {
                                    data = resp;
                                }
                                allLinks();
                            });
                        } else {
                            allLinks();
                        }
                    });
                } else {
                    done();
                }
            }
        ], function (err, result) {
            if (err) {
                return callback(err);
            }

            if (err2) {
                return callback(err2);
            }

            callback(null, data);
        });
    };


    bcAuthVM.createMultimediaObj = function (type, param, tag, scId, params, callback) {
        //TODO:  this method should be put on priority to update in myice, ice, and ice-edu
        //for backwards compatability since params added
        if (arguments && arguments.length === 5) {
            if (_.isFunction(params)) {
                callback = params;
                params = {};
            }
        }

        var data, concept;
        var newId = '';
        var ptype = 'smartcontentobject';
        var theTag = '';

        if (type === 'image') {
            if (tag){
                theTag= tag;
            }
            else {
                theTag = 'mm-0';
            }
            data = {

                name: 'dcmIMage',
                context: 'device',
                identity: '',
                class: '',
                tag: theTag,
                location:param,
                alt:'',
                ismap:'false',
                usemap:'false',
                width:'',
                height:''
            };

        } else if (type === 'text') {

            if (tag){
                theTag= tag;
            }
            else {
                theTag = 'mm-1';
            }
            data = {

                name: param,
                content: param,
                context: 'device',
                identity: '',
                class: '',
                tag: theTag,
                location:'',
                disabled:'false',
                readonly:'false'
            };

        }

        else if (type === 'video') {

            if (tag){
                theTag= tag;
            }
            else {
                theTag = 'mm-2';
            }
            data = {

                name: params.name || 'dcmVideo',
                context: 'device',
                identity: '',
                class: '',
                location:param,
                autoplay:'true',
                controls:'true',
                tag: theTag,
                loop: 'true',
                muted:'true',
                poster:'true',
                preload:'',
                width:'',
                height:''

            };

        }

        //Handle the response for creating the object
        function handleCreateResponse(err, result) {
            //Error
            if(err) {
                console.log('Error creating specified concept! Please try again later!');
                callback(err);
            }
            //Success
            else {
                callback(null, result);
            }
        }//END handleCreateResposne


        //Create the new Multimedia Object
        if(type === 'image') {
            dexit.scm.dcm.integration.sc.createImageMultimedia(mainVM.repo, data, scId, handleCreateResponse);
        } else if(type === 'text') {
            dexit.scm.dcm.integration.sc.createTextMultimedia(mainVM.repo, data, scId, handleCreateResponse);
        } else if(type === 'video') {
            dexit.scm.dcm.integration.sc.createVideoMultimedia(mainVM.repo, data, scId, handleCreateResponse);
        } else {
            return callback(new Error('invalid mm'));
        }
    };




};
