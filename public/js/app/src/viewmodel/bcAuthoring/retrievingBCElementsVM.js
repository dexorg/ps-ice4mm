/**
 * Copyright Digital Engagement Xperience 2015-2017
 * @description Related to dealing with BC for EP Authoring
 */

dexit.app.ice.edu.bcAuthoring.RetrievingBCElementsVM = function (args) {
    var mainVM = args.mainVM;
    var bcAuthVM = args.bcAuthVM;
    var dcmManagement = args.dcmManagement;

    /**
     * Returns parsed object or Error
     * @param data
     * @return {object|Error}
     */
    function parseEPObjectSafely(data) {
        try{
            var epObject = JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, '\\n'));
            return epObject;
        }catch(err){
            console.error('could not parse epObject');
            return new Error('error occurs when parsing the EP Object from SC property: ' + err);
        }
    }


    //TODO: refactor as this is really about loading EP
    bcAuthVM.retrieveBCElements = function(widget, index) {
        if(widget && widget.ePatterns() && widget.ePatterns().length > 0) {
            //take the uccEP as template to show, if no uccEP, pick the first ePattern
            var uccEP = _.find(widget.ePatterns(), function(ePattern){return ePattern.pattern.type === 'ucc';});
            var retrievedEP;
            if (uccEP) {
                retrievedEP = uccEP.pattern;
            } else{
                retrievedEP = widget.ePatterns()[0].pattern;
            }
            bcAuthVM.ePatterns = widget.ePatterns();

            //used in editBCElements for finding old widget
            //bcAuthVM.widgetIndex = index;
            mainVM.selectedWidget(widget);


            //TODO: why is this called twice (here and below)?
            mainVM.prepareCreationModal('lecture', mainVM.modalOperation(), null);
            /*-- when editing the lecture, set validTitle to be true initally to make sure the save buttion available by default*/
            bcAuthVM.validTitle(true);

            async.auto({
                retrieveTPs: function(done){
                    mainVM.selectedCourse().courseVM.retrieveTouchpointsDetailsOfBCi(widget.sc(), function(res) {
                        if(res){
                            var allTPs = [];
                            allTPs = _.union(mainVM.selectedCourse().courseVM.tpm(), res);
                            mainVM.selectedCourse().courseVM.alltps(_.uniqBy(allTPs,'tpId'));
                            done(null,res);
                        }else{
                            console.log('cannot retrieve tp details from BCI');
                            done();
                        }
                    });
                },prepareEPObject:['retrieveTPs', function(done, result){
                    dexit.scm.dcm.integration.sc.retrieveSC(mainVM.repo, widget.sc().id, function(err, data){
                        if (err) {
                            //TODO: handle error
                            console.error('could not retrieve sc');
                            return done(err);
                        }
                        //send in sc data, so pattern can be loaded
                        //mainVM.prepareCreationModal('lecture', mainVM.modalOperation(), data);


                        //TODO: remove call
                        mainVM.selectedSC(data);


                        bcAuthVM.retrievePropertyAsMM(data, function(textFields){
                            bcAuthVM.propertyTextValue(textFields);

                            var epObject;
                            if(data.property.epObject){
                                epObject = parseEPObjectSafely(data.property.epObject);
                                if (epObject instanceof Error) {
                                    return done(epObject);
                                }
                            }

                            mainVM.showSmallSidebar();
                            mainVM.createEngagementPlan(true);
                            mainVM.selectedCourse().courseVM.epAuthoringState('pattern');

                            var selectedTPs = _.map(result.retrieveTPs, function (val) {
                                return val.tpId;
                            });
                            var intelligence = (mainVM.selectedCourse().courseVM.businessConceptInstance && mainVM.selectedCourse().courseVM.businessConceptInstance.intelligence ? mainVM.selectedCourse().courseVM.businessConceptInstance.intelligence : []);


                            if (ko.utils.unwrapObservable(mainVM.currBCType) === 'Store') {
                                dpa_VM.showCampaignSelection(true);
                            }else {
                                dpa_VM.showCampaignSelection(false);
                            }

                            debugger;
                            var sccVM = mainVM.selectedCourse().courseVM;
                            var mmTag = sccVM.mmTag() || '';


                            var obj = sccVM.businessConceptInstance.property.ppObject;
                            if (obj) {
                                if (_.isString(obj)) {
                                    // eslint-disable-next-line no-undef
                                    obj = campaignPlannerVm.parsePPObjectSafely(obj);
                                }
                                //now find campaign and tag
                                var found = null;
                                if (obj && obj.cells) {
                                    _.each(obj.cells, function (cell) {
                                        if (cell.definition && cell.definition.approved
                                            && widget.ePatterns()
                                            && widget.ePatterns().length > 0
                                            && cell.definition.data && cell.definition.data.mmTag
                                            && cell.definition.epId && cell.definition.epId == widget.ePatterns()[0].id
                                            && cell.definition.epRevision && cell.definition.epRevision == widget.ePatterns()[0].revision) {
                                            //update the scId and epId and epRevision
                                            mmTag = cell.definition.data.mmTag;
                                        }
                                    });
                                }
                            }

                            dpa_VM.init({
                                mmTag: mmTag,
                                currentOperation: mainVM.modalOperation(),
                                touchpoints: mainVM.selectedCourse().courseVM.alltps(),
                                selectedTouchpoints: selectedTPs,
                                intelligence: intelligence,
                                callingVM: mainVM.selectedCourse().courseVM,
                                epUIObject: epObject
                            });
                            dpa_VM.validTitle(true);


                            if(epObject && !_.isEmpty(epObject)) {
                                //TODO: check if needed
                                //     //check if there is any decision element, parse the decObject and save it into dpa_VM.decisionElements
                                //     if(data.property.decObject && data.property.decObject != 'null'){
                                //         var decObject = JSON.parse(data.property.decObject.replace(/(?:\r\n|\r|\n)/g, '\\n'));
                                //         bcAuthVM.generateVMDecElement(decObject);
                                //     }
                                //     //check if there is any inteligence element, parse the referredIntelligence and save it into dpa_VM.referredIntelligence
                                //     if(data.property.referredIntelligence && data.property.referredIntelligence != '[]'){
                                //         dpa_VM.referredIntelligence(JSON.parse(data.property.referredIntelligence));
                                //     }
                                //     done();
                                done();
                            }else {
                                done(new Error('ep object not found!'));
                            }
                        });
                    });
                }]
            },function(err, result){
                if(result){
                    // set valid title to true for epa VM (dpa_VM)
                    dpa_VM.validTitle(true);

                }else{
                    console.error(err);
                }

            });

        }
        else {
            console.error('pattern does not exist for this widget.');
        }

    };

    // /***
    //  * @param {object} decObject - list of decision objects retrieved from SC property
    //  * This function will check each element from decObject and set the observable value for path1/path2 decObject
    //  * after the setting, the update object will be pushed into dpa_VM.decisionElements, which will be used for EP viewing and editing
    //  */
    // bcAuthVM.generateVMDecElement = function(decObject){
    //     var handleDecObject = function(element, index){
    //         var tempDecElement = element;
    //         //if retreved decelement does not exist, pushed into dpa_VM.decisionElements()
    //         var theDec = _.find(dpa_VM.decisionElements(), {decRef: tempDecElement.decRef});
    //         if(!theDec){
    //             element.validComponent = ko.observable(element.validComponent);
    //             //TODO=>this part should be dynamic to support multiple paths
    //             async.parallel({
    //                 path1: function(cb){
    //                     if(element.path1.multiMediaList && element.path1.multiMediaList.length > 0){
    //                         var tempMM = element.path1.multiMediaList;
    //                         tempDecElement.path1.multiMediaList = ko.observableArray(element.path1.multiMediaList);
    //                         var allMM = _.after(tempMM.length, cb);
    //                         _.each(tempMM, function(multiMedia, index){
    //                             tempDecElement.path1.multiMediaList()[index].value = ko.observable(multiMedia.value);
    //                             allMM();
    //                         });
    //                     }else{
    //                         cb();
    //                     }
    //                 },
    //                 path2: function(cb){
    //                     if(element.path2.multiMediaList && element.path2.multiMediaList.length > 0){
    //                         var tempMM = element.path2.multiMediaList;
    //                         tempDecElement.path2.multiMediaList = ko.observableArray(element.path2.multiMediaList);
    //                         var allMM = _.after(tempMM.length, cb);
    //                         _.each(tempMM, function(multiMedia, index){
    //                             tempDecElement.path2.multiMediaList()[index].value = ko.observable(multiMedia.value);
    //                             allMM();
    //                         });
    //                     }else{
    //                         cb();
    //                     }
    //                 }
    //             },function(err, results){
    //                 dpa_VM.decisionElements().push(tempDecElement);
    //             });
    //         }else{
    //             console.log('the decision element exists in dpa_VM');
    //         }
    //
    //     };
    //     //parse each dec object then saved in dpm_VM.decisionElements()
    //     _.each(decObject, handleDecObject);
    // };

    bcAuthVM.retrievePropertyAsMM = function(data, callback) {
        bcAuthVM.sortTextMM(data, 'property-mm-');
        var forEachText = function(textMM, index, list) {
            var theIndex = parseInt(textMM.property.tag.split('property-mm-')[1]);
            if(theIndex<100) {
                textFields[theIndex-1] = textMM.property.content || ''; // put empty string if textMM content does not exist.
            }
        };
        var textFields = ['', ''];
        _.each(data.text, forEachText);
        callback(textFields);

    };

    // bcAuthVM.retrieveMultiMedia = function(data, epElement, callback) {
    //     var retrievedObjectIndex;
    //     // if we're using the flex EPA, create a MM component
    //     if (mainVM.modalOperation()!=='Create') {
    //         dpa_VM.retrievedObjects.push(dpa_VM.addEntry('multimedia'));
    //         retrievedObjectIndex = dpa_VM.retrievedObjects.length - 1;
    //     }
    //     //why is this called?
    //     mainVM.stopVideo();
    //     var theLayout;
    //     //TODO:remove
    //     mainVM.selectedSC(data);
    //
    //     theLayout = 'defaultEngagement';
    //     async.series([
    //         function retrieveImagesMM(done) {
    //             async.each(data.image, function (image, cb) {
    //                 if (image && image.property && image.property.tag && image.property.tag.indexOf('ep-' + epElement.id) > -1) {
    //                     // push into flexEPA, if it exists
    //                     //epatternType that !== 'dynamic' is deprecated
    //                     if (mainVM.modalOperation()!=='Create') {
    //                     // if (mainVM.epatternType() === 'dynamic' && mainVM.modalOperation()!=='Create') {
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].multiMediaList().push({type: 'image', value: ko.observable(image.property.location)});
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].imageCounter++;
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].patternComponents.layout += '<img src="' + image.property.location + '" alt="element mm" data-mm-tag="'+ image.property.tag + '">';
    //                         cb();
    //                     } else {
    //                         console.warn('skipping')
    //                         cb();
    //                     }
    //
    //                 } else {
    //                     cb();
    //                 }
    //             }, done);
    //         },
    //         function retrieveVideosMM(done) {
    //             async.each(data.video, function (video, cb) {
    //                 if (video && video.property && video.property.tag && video.property.tag.indexOf('ep-' + epElement.id) > -1) {
    //                     if (mainVM.epatternType() === 'dynamic' && mainVM.modalOperation()!=='Create') {
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].multiMediaList().push({type: 'video', value:  ko.observable(video.property.location)});
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].videoCounter++;
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].patternComponents.layout += '<video controls ><source data-mm-tag="' +video.property.tag+ '" src="' + video.property.location + '" type="video/mp4"/>';
    //                         cb();
    //                     } else {
    //                         bcAuthVM.videoEPurl()[epElement.id](video.property.location);
    //                         bcAuthVM.mmEPurl()[epElement.id](video.property.location);
    //                         cb();
    //                     }
    //                 } else {
    //                     cb();
    //                 }
    //             }, done);
    //         },
    //         function retrieveTextMM(done) {
    //             var additionalTextAreas = document.querySelectorAll('.add-text-display');
    //
    //             async.each(data.text, function (text, cb) {
    //                 if (text && text.property && text.property.tag && text.property.tag.indexOf('ep-' + epElement.id+'-mm-text-') > -1) {
    //                     if (mainVM.epatternType() === 'dynamic' && mainVM.modalOperation()!=='Create') {
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].multiMediaList().push({type: 'text', value:  ko.observable(text.property.content)});
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].textCounter++;
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].patternComponents.layout += '<textarea data-type="text" data-mm-tag="' + text.property.tag + '">' + text.property.content + '</textarea>';
    //                         cb();
    //                     } else {
    //                         bcAuthVM.mmTextEP()[epElement.id](text.property.content);
    //                         bcAuthVM.mmTextEPAdded()[epElement.id](true);
    //                         // update UI to show first text if it's hidden
    //                         if (epElement.id === '1' && mainVM.modalOperation() === 'Edit') {
    //                             additionalTextAreas[0].classList.remove('areaHidden');
    //                         }
    //                         cb();
    //                     }
    //                 } else {
    //                     cb();
    //                 }
    //             }, done);
    //         },
    //         function retrieveLinksMM(done) {
    //             async.each(data.text, function (text, cb) {
    //                 if (text && text.property && text.property.tag && text.property.tag.indexOf('ep-' + epElement.id + '-mm-links-') > -1) {
    //                     if (mainVM.epatternType() === 'dynamic' && mainVM.modalOperation()!=='Create') {
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].multiMediaList().push({type: 'link', value: ko.observable(text.property.content.split(': ')[1])});
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].linksCounter++;
    //                         dpa_VM.retrievedObjects[retrievedObjectIndex].patternComponents.layout += '<span data-type="text" data-mm-tag="' + text.property.tag + '">' + text.property.content.split(': ')[1] + '</span>';
    //                         cb();
    //                     }else{
    //                         var theName = ko.observable(text.property.content.split(': ')[0]);
    //                         var theLink = ko.observable(text.property.content.split(': ')[1]);
    //                         bcAuthVM.linksAddedEP()[epElement.id].push({
    //                             theCounter: parseInt(text.property.tag.split('mm-links-')[1]),
    //                             theName: theName,
    //                             theLink: theLink
    //                         }
    //                         );
    //                         cb();
    //                     }
    //                 } else {
    //                     cb();
    //                 }
    //             }, done);
    //         }
    //     ], callback);
    //
    // };

    // bcAuthVM.retrieveBehaviour = function(data, epElement, callback) {
    //     var retrievedObjectIndex;
    //     var fillAnswers = function(answers, cb) {
    //         var afterAllChoices = _.after(answers.length, function(){
    //             console.log('after all choices fired');
    //             cb();
    //         });
    //
    //         var forEachChoice = function (aChoice, index, list) {
    //             // answers are sent to the channel as Answer1: xxx, Answer2: xxx, etc so here we parse only the actual answer
    //             var questionChoice;
    //
    //             if (aChoice.split(':')[1]) {
    //                 questionChoice = aChoice.split(':')[1];
    //             } else {
    //                 questionChoice = aChoice;
    //             }
    //
    //             dpa_VM.retrievedObjects[retrievedObjectIndex].questionComponents.answers()[dpa_VM.retrievedObjects[retrievedObjectIndex].answerCounter] = {theChoice:ko.observable(questionChoice)};
    //             dpa_VM.retrievedObjects[retrievedObjectIndex].answerCounter++;
    //             afterAllChoices();
    //
    //         };
    //         _.each(answers, forEachChoice);
    //     };
    //
    //     if(mainVM.modalOperation()!=='Create'){
    //         // if we're using the flex EPA, create a Beh component
    //         var allBehaviours = _.after(data.behaviour.length, function(){
    //             if(callback){
    //                 callback();
    //             }
    //         });
    //         var forEachBehaviour = function(beh, index, list) {
    //             if(beh.scope==='user'){
    //                 if(beh.property.name.indexOf('create_chat_room')>-1 && epElement.subType === 'chat') {
    //                     dpa_VM.retrievedObjects.push(dpa_VM.addEntry('behaviour','chat','chat'));
    //                     retrievedObjectIndex = dpa_VM.retrievedObjects.length - 1;
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.chatRoomName(epElement.args[':name']);
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.chatRoomSlug(epElement.args[':slug']);
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.chatRoomDesc(epElement.args[':description']);
    //                     allBehaviours();
    //
    //                 }else if(beh.property.name.indexOf('createDiscussionRooms')>-1 && epElement.subType === 'groupchat') {
    //                     dpa_VM.retrievedObjects.push(dpa_VM.addEntry('behaviour','groupchat','groupchat'));
    //                     retrievedObjectIndex = dpa_VM.retrievedObjects.length - 1;
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.chatRoomName(epElement.args[':name']);
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.chatRoomSlug(epElement.args[':slug']);
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.chatRoomDesc(epElement.args[':description']);
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.passWord(epElement.args[':password']);
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.numberOfRooms(epElement.args[':numberOfRooms']);
    //                     dpa_VM.retrievedObjects[retrievedObjectIndex].chatComponents.users(epElement.args[':users']);
    //                     allBehaviours();
    //
    //                 }else if((beh.property.name.indexOf('post_url')>-1 && epElement.subType.indexOf('recharge')>-1)
    //                     ||(beh.property.name.indexOf('post_eorder')>-1 && epElement.subType.indexOf('order')>-1)
    //                     ||(beh.property.name.indexOf('post_evoucher')>-1 && epElement.subType.indexOf('voucher')>-1)) {
    //                     dpa_VM.retrievedObjects.push(dpa_VM.addEntry('behaviour',epElement.subType,epElement.subType));
    //                     retrievedObjectIndex = dpa_VM.retrievedObjects.length - 1;
    //                     allBehaviours();
    //
    //                 }else if(beh.property.name.indexOf('get_questionnaire')>-1 && (epElement.subType === 'questionnaire' || epElement.subType === 'survey')){
    //                     if(epElement.subType === 'questionnaire'){
    //                         dpa_VM.retrievedObjects.push(dpa_VM.addEntry('behaviour','questionnaire','questionnaire'));
    //                     }else{
    //                         dpa_VM.retrievedObjects.push(dpa_VM.addEntry('behaviour','survey','survey'));
    //                     }
    //
    //                     retrievedObjectIndex = dpa_VM.retrievedObjects.length - 1;
    //                     var behExecution = {
    //                         'behaviourId': beh.id,
    //                         'path':{':questionnaire_id':epElement.args[':questionnaire_id']}
    //
    //                     };
    //                     dexit.app.ice.integration.behaviour.execute(data.id, behExecution, function(err, response){
    //                         if(err) {
    //                             console.error('Cannot create questionnaire');
    //                             allBehaviours();
    //
    //                         } else {
    //                             if(response.questions[0]) {
    //                                 dpa_VM.retrievedObjects[retrievedObjectIndex].questionComponents.question(response.questions[0].prompt);
    //                                 var allChoices = response.questions[0].options;  //answers are split by ',' transferred back
    //                                 fillAnswers(allChoices, allBehaviours);
    //                             }
    //                         }
    //                     });
    //                 }else{
    //                     allBehaviours();
    //                 }
    //             }else{
    //                 allBehaviours();
    //             }
    //         };
    //         _.each(data.behaviour, forEachBehaviour);
    //     }
    // };

};
