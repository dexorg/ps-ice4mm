/**
 * @copyright Digital Engagement Xperience 2018
 *
 */

/* global storyboard_VM, dexit, extractCSS */

dexit.scm.cd.WchCMSShell = function (args) {


    var self = this;
    var params = args.params || {};

    //set CMS tool
    self.name = (params.name ? ko.observable(params.name): ko.observable('wch'));

    //integration type: 'external', embedded
    self.integrationType = 'external';

    self.externalUrl = (params.url ? ko.observable(params.url) : ko.observable(''));

    self.integrationParams = {
    };
    self.allocationSetup = ko.observable(false);

    self.currentTpAndLayout = ko.observable({});
    self.currentPreviewUrl = null;
    self.pageIdSetupVisible = ko.observable(false);
    self.selectedPageId = ko.observable('');

    //called whenever EP is updated to make sure changes propogate
    self.onEpUpdate = args.onEpUpdate || function(updatedEP) {};


    self.onEPSaveDone = args.onEPSaveDone || function() {};



    self.previewUrl = (params.page && params.page.wchPreviewUrl || '');
    self.pageContentTypeId = (params.page && params.page.contentTypeId ? params.page.contentTypeId : '');
    self.pageLayoutId = (params.page && params.page.layoutId ? params.page.layoutId : '');
    self.tenantId = params.tenantId || '';

    self.wchSitesPath = params.wchSitesPath;

    self.iframeSrc = ko.observable('');


    self.bucketName = params.bucketName || 'wch-dex-integration';


    self.showFullPreviewButton = ko.observable(false);

    self.showExternalIdModal = function(tpAndLayout) {
        self.pageIdSetupVisible(true);
        self.currentTpAndLayout(tpAndLayout);
        self.iframeSrc('');

        var currentTpId = tpAndLayout.touchpoint.tpId;
        var val = self.ep.pattern.tp || [];
        var found = _.find(val, function (tpAndLayout) {
            return (tpAndLayout.touchpoint === currentTpId && tpAndLayout.layout && !_.isEmpty(tpAndLayout.layout));
        });
        if (found && found.layout && found.layout.externalId) {
            self.selectedPageId(found.externalId);
        }else {
            self.selectedPageId('');
        }
        if (self.ep.pattern._cms_pid) {
            self.selectedPageId(self.ep.pattern._cms_pid);
        }
    };



    self.saveExternalIdFinish = function() {

        if (!self.selectedPageId()) {
            alert('you must have a page id');
            return;
        }
        var currentTPandLayout = self.currentTpAndLayout();

        if (!currentTPandLayout.layout) {
            alert('you must click the save button above to extract the layout');
            return;
        }

        //update pattern at this point based on mapping
        self._updateEP(function (err) {
            if (err) {
                alert('problem saving');
            } else {
                self.showFullPreviewButton(true);
            }

            //update storyboardVM.availableTPsAndLayouts


            self.hideExternalIdModal();

        });

        //close and mark completed


    };
    self.pageDetailsCache = null;

    self.saveExternalId = function() {


        var pageId = self.selectedPageId();
        var currentTPandLayout = self.currentTpAndLayout().touchpoint;

        //var pageDetails = '/api/authoring/v1/sites/default/pages/'+pageId;
        var pageDetailsPath = '/api/'+self.tenantId+'/authoring/v1/sites/default/pages/'+pageId;
        self._makeRequest('GET',pageDetailsPath,null,function (err, pageDetails) {
            if (err || !pageDetails) {
                alert('Invalid page Id...check and try again');
                return;
            }
            console.log(pageDetails);
            //get content info from pageDetails.contentId
            var contentId = pageDetails.contentId;
            var contentIdPath = '/api/'+self.tenantId+'/authoring/v1/content/'+contentId + ':'+pageDetails.contentStatus;
            self._makeRequest('GET',contentIdPath,null,function (err, contentDetails) {
                if (err || !contentDetails) {
                    alert('Invalid page...check and try again');
                    return;
                }
                console.log(contentDetails);

                //build preview URL
                var previewUrl =  '/'+self.tenantId+'/campaign-'+self.ep.id + '-' + self.ep.revision + '?x-ibm-x-preview=true';
                // pageDetails.absolute_url + '?hs_preview=' + encodeURIComponent(pageDetails.preview_key + '-' + pageId);
                self.pageDetailsCache = pageDetails;
                self.currentPreviewUrl = previewUrl;
                var basePreviewUrl =  self.previewUrl || 'https://my14-preview.digitalexperience.ibm.com';


                var bod = {
                    baseUrl: basePreviewUrl,
                    redirect_url: previewUrl,
                    username: '{{wchUserName}}', //since login is required
                    password: '{{wchPassword}}'
                };


                var path =   '/'+self.tenantId+'/campaign-'+self.ep.id + '-' + self.ep.revision;


                //self.iframeSrc(baseUrlpreviewUrl);




                //TODO: parsing of response
                self._makeRequest('HTML_DOWNLOAD', path, bod, function (resp, content) {

                    if (resp.status !== 200) {
                        alert('Invalid or inaccessible preview url...check and try again');
                        return;
                    }

                    var htmlString = resp.responseText;

                    // if (err && ) {
                    //     alert('Invalid or inaccessible preview url...check and try again');
                    //     return;
                    // }
                    self.parseExternalContentForAllocation(contentDetails, htmlString, currentTPandLayout);
                });
            });
        });

    };


    self.hideExternalIdModal = function() {
        self.pageIdSetupVisible(false);
        self.selectedPageId('');
        debugger;
        //re-initialize view
        self.onEPSaveDone();


    };



    self.allocationSetupButtonText = ko.pureComputed(function () {
        if (!self.allocationSetup()) {
            return 'Click to proceed with Setup';
        }else {
            return 'Setup Complete (Click to re-initialize)';
        }
    });

    self.ep = args.ep;


    //layout creator
    self.showLayoutCreator = function(){
        //open up hubspot
    };


    /**
     * check if layout was already created, then just want to update
     * @param currentTpId
     * @return {string}
     * @private
     */
    self._getLayoutId = function(currentTpId) {
        var val = self.ep.pattern.tp || [];
        var found = _.find(val, function (tpAndLayout) {
            return (tpAndLayout.touchpoint === currentTpId && tpAndLayout.layout && !_.isEmpty(tpAndLayout.layout));
        });

        return (found && found.layout && found.layout.id ? found.layout.id : 'exths-' + dpa_VM.generateId());
    };

    self._getLayout = function(currentTpId){
        var val = self.ep.pattern.tp || [];
        var found = _.find(val, function (tpAndLayout) {
            return (tpAndLayout.touchpoint === currentTpId && tpAndLayout.layout && !_.isEmpty(tpAndLayout.layout));
        });

        return (found && found.layout && !_.isEmpty(found.layout) ? found.layout : null);
    };

    //load layout
    self.setLayout = function(currentTpId, regions, htmlString, inlineCss, cssLinks, elementStyles, callback) {
        var layoutId =  self._getLayoutId(currentTpId);


        var existingLayout = self._getLayout(currentTpId);

        var scripts = _.reduce(cssLinks, function (memo, item) {
            return memo + '<link rel="stylesheet" type="text/css" href="'+item+'"/>';
        },'');

        var combined = htmlString + '\n' + scripts + '\n' + '<style>'+inlineCss+'</style>';

        var toSave = {
            content: Base64.encode(combined), //btoa(combined),
            externalId:self.selectedPageId(),
            externalCMS:self.name(),
            custom: true,
            regions: regions,
            container: 'merch-container',
        };

        var layoutRegions = existingLayout ? existingLayout.regions : regions;


        //convert from array to  object   regions: { regionId: []  }
        if (_.isArray(layoutRegions)) {
            var arr = {};
            for(var i=0;i<layoutRegions.length;i++) {
                arr[regions[i]] = [];
            }
            layoutRegions = arr;
        }


        var layoutStruc = {
            layoutId: layoutId,
            externalId:self.selectedPageId(),
            externalCMS:self.name(),
            id: layoutId,
            custom: true,
            layoutMarkup: combined,
            regions: layoutRegions,
            thumbnail: ''
        };
        async.auto({
            saveLayout: function (cb) {
                //saves layout through lm
                dexit.app.ice.integration.layoutmanagement.updateLayout(layoutId,toSave,cb);
            },
            updateEPWithLayout: ['saveLayout',function (cb) {
                var epId = self.ep.id;
                var revision = self.ep.revision;

                //update layout in currentEP variable
                var val = self.ep.pattern.tp || [];
                _.each(val, function (tpAndLayout) {
                    var touchpointId = tpAndLayout.touchpoint;
                    if (currentTpId === touchpointId) {
                        tpAndLayout.layout = layoutStruc; //add layout note here
                    }
                    if (elementStyles) {
                        if (!tpAndLayout.elementStyle) {
                            tpAndLayout.elementStyle = {};
                        }
                        _.extend(tpAndLayout.elementStyle,elementStyles);
                    }
                    //now also update availableTPsAndLayouts


                });
                //update available
                _.each(storyboard_VM.availableTPsAndLayouts(), function(available) {
                    if (currentTpId === available.touchpoint.tpId) {
                        available.layout = layoutStruc;
                    }
                });
                self._updateEP(function(err) {
                    if (err) {
                        cb(err, self.ep);
                    }
                    cb(null, self.ep);
                });
            }]
        }, function(err, results) {
            //update available array with layout reference
            storyboard_VM.selectedLayout(layoutStruc);
            storyboard_VM.selectedLayoutId(layoutStruc.id);

            callback(err, layoutStruc);
        });
    };



    /**
     * @typedef {Object} TPInfo
     * @property {object} elementToRegion -
     * @property {object} elementStyles - holds styles for all elements
     */

    /**
     *
     * @type {TPInfo}
     */
    self.tpInfo = {};


    /**
     *
     * Updates local copy of engagement pattern element
     * @param {object} args
     * @param {string} args.elementId - engagement
     * @param {string} [args.regionRef] - region reference within layout
     * @param {string} [args.presentationRef] - for update presentation style
     * @param {object} [args.presentationRefArgs] - to augment the presentationRef (styles)
     */
    self.updateEPElementDraft = function (args, tpId) {
        if (!self.ep) {
            return;
        }
        var currentLayout = self.currentTpAndLayout().layout;

        var ep = self.ep;
        //version 2

        //update TP -> layout region reference with element id
        //add new reference
        _.each(ep.pattern.tp, function (tpAndLayout) {
            var touchpointId = tpAndLayout.touchpoint;
            var layout = tpAndLayout.layout;

            if (tpId === touchpointId && layout.id === currentLayout.id) {

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

    };


    self._prepareRegionsAndTemplate = function(bodyStr, pageDetails, tpId, callback) {


        //wrap in div for later
        var body = $($.parseHTML('<div>'+bodyStr+'</div>'));


        //for each element, what region it is in
        var elementStyles = {
        };

        self._extractRegionsFromContentDetails(pageDetails, function (err, resultRegions) {
            if (err) {
                callback();
            }
            if (!self.tpInfo[tpId]) {
                self.tpInfo[tpId] = {
                    //      modToElement: {},
                    elementToRegion: {},
                    elementStyles: {}
                };
            }
            //_.extend(self.tpInfo[tpId].modToElement, resultRegions.modToElement);
            _.extend(self.tpInfo[tpId].elementToRegion, resultRegions.elementToRegion);
            _.extend(self.tpInfo[tpId].elementStyles, elementStyles);

            //update each div
            var regions = [];
            $('div', body).each(function (index, item) {
                var regionId =  $(item).attr('data-region');
                //if this is a div with a data-region attribute, clear its children
                if (regionId) {
                    //add divthis.
                    //remove children of span
                    $(item).empty();
                }
            });



            //processed body

            var toReturn =  {
                regions:resultRegions.regions,
                html:$(body).html().trim(),
                elementTextToReplace: resultRegions.elementTextToReplace || {}
            };

            callback(null, toReturn);
        });

    };
    /**
     *
     * @param {Object.<string,string>} replacements - where key is the element identifier and value is the text to replace it
     * @param callback
     * @private
     */
    self._updateTextForElements = function(sc, ep, replacements, callback) {
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
                // dexit.scm.cd.integration.util.resolveMMFromLayout(sc, elementRef.theTypeId,function (err, mmRes) {
                    if (err || (mmRes.text.length < 1)) {
                        return cb(); //error
                    }
                    var mm = mmRes.text[0];
                    var toUpdateProp =mm.property;
                    //need to escape content??
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


    };

    self.contentRegionTypeId = params.contentRegionTypeId || 'b80c0121-21d4-437b-904f-3ecd66df0566';

    self._extractRegionsFromContentDetails = function(contentDetails, callback){



        function resolveAsset(regionId, assetId, done) {
            var basePath = '/api/'+self.tenantId+'/authoring/v1/assets/';
            self._makeRequest('GET',basePath + assetId, null,function (err, assetInfo) {
                if (err) {
                    console.log('error resolving asset...skipping');
                    return done();
                }
                //from assetInfo.name, the elementId can be resolve
                var shortId = assetInfo.name.split('__')[0];
                var longId = storyboard_VM.findLongId(shortId);

                elementToRegion[longId] = regionId;
                done();
            });
        }


        var regionsArr = [];

        _.each(contentDetails.elements, function (value, key) {
            //only save the keys for each element that is a region
            //value["typeRef"].id"  "b80c0121-21d4-437b-904f-3ecd66df0566" for ContentRegion
            if (value && value.typeRef && value.typeRef.id && value.typeRef.id === self.contentRegionTypeId){
                regionsArr.push(key);
            }
        });

        //now for each region build the mapping from region ->  element
        //element -> style?  later on

        //for each element, what region it is in (e)
        var elementToRegion = {
        };

        var elementTextToReplace = {
        };

        self.loadBlocks(self.ep, false, function (err, blocks) {


            async.each(regionsArr, function (regionId, done) {

                var region = contentDetails.elements[regionId];
                if (region && region.value) {
                    //for image look up image information

                    async.auto({
                        image: function (cb) {
                            if (region.value.image && region.value.image.values && region.value.image.values.length > 0) {
                                async.each(region.value.image.values, function (imgVal, eachCb) {
                                    resolveAsset(regionId, imgVal.asset.id, eachCb);
                                }, cb);
                            } else {
                                cb();
                            }
                        },
                        video: function (cb) {
                            if (region.value.video && region.value.video.values && region.value.video.values.length > 0) {
                                async.each(region.value.video.values, function (assetVal, eachCb) {
                                    resolveAsset(regionId, assetVal.asset.id, eachCb);
                                }, cb);
                            } else {
                                cb();
                            }
                        },
                        text: function (cb) {
                            if (region.value.text && region.value.text.values && region.value.text.values.length > 0) {
                                async.each(region.value.text.values, function (assetVal, eachCb) {
                                    //resolveAsset(regionId,assetVal.asset.id,eachCb);
                                    if (assetVal) {
                                        //take

                                        //find shortId: match first occurance of #:  ie.  3:
                                        var match = assetVal.match(/((\d)+(\:))/gm);

                                        ////now split text and ':'
                                        if (match.length > 0) {

                                            var shortId = match[0].replace(':', '');

                                            //remove prefix from what will be saved
                                            var stripped =  assetVal.replace(match[0],'');



                                            var foundBlock = _.find(blocks, function (block) {
                                                if (block.type === 'multimedia' || block.type === 'intelligence') {
                                                    //match string or number
                                                    return (block.shortId == shortId);
                                                }
                                            });
                                            if (foundBlock) {

                                                //split the name
                                                var shortIdent = foundBlock.shortId;
                                                var longId = storyboard_VM.findLongId(shortIdent);
                                                if (!longId) {
                                                    console.warn('no longId was resolved for shortId:%s for region:%s', shortId, regionId);
                                                }
                                                elementToRegion[longId] = regionId;

                                                //strip identifier for text to be saved/used
                                                elementTextToReplace[longId] = assetVal.replace(match[0],'');

                                            } else {
                                                console.log('warning could not find text block');
                                            }
                                        }else {
                                            console.warn('no match for text: %s',assetVal);
                                        }
                                    }
                                    eachCb();

                                }, cb);
                            } else {
                                cb();
                            }
                        },
                        sctext: function (cb) {
                            if (region.value.sctext && region.value.sctext.values && region.value.sctext.values.length > 0) {
                                async.each(region.value.sctext.values, function (assetVal, eachCb) {
                                    //resolveAsset(regionId,assetVal.asset.id,eachCb);
                                    if (assetVal && assetVal.elementid && assetVal.elementid.value) {
                                        var foundBlock = _.find(blocks, function (block) {
                                            return (block.id === assetVal.elementid.value);
                                        });

                                        if (foundBlock) {

                                            //split the name
                                            var longId = assetVal.elementid.value;

                                            elementToRegion[longId] = regionId;
                                            elementTextToReplace[longId] = assetVal.text.value;

                                        } else {
                                            console.log('warning could not find text block');
                                        }
                                    }
                                    eachCb();

                                }, cb);
                            } else {
                                cb();
                            }
                        },
                        eservice: function (cb) {
                            if (region.value.eservice && region.value.eservice.values && region.value.eservice.values.length > 0) {
                                async.each(region.value.eservice.values, function (assetVal, eachCb) {
                                    if (assetVal.name && assetVal.name.value) {
                                        //split the name
                                        var shortId = assetVal.name.value.split(':')[0];
                                        var longId = storyboard_VM.findLongId(shortId);
                                        elementToRegion[longId] = regionId;
                                    }
                                    eachCb();
                                }, cb);
                            } else {
                                cb();
                            }
                        },
                        intelligence: function (cb) {
                            if (region.value.intelligence && region.value.intelligence.values && region.value.intelligence.values.length > 0) {
                                async.each(region.value.intelligence.values, function (assetVal, eachCb) {
                                    if (assetVal.name && assetVal.name.value) {
                                        //split the name
                                        var shortId = assetVal.name.value.split(':')[0];
                                        var longId = storyboard_VM.findLongId(shortId);
                                        elementToRegion[longId] = regionId;
                                    }
                                    eachCb();
                                }, cb);
                            } else {
                                cb();
                            }

                        }
                    }, function (err) {
                        done();
                    });
                } else {
                    done();
                }
                //now get all under value:   value.image, value.intelligence, value.video, value.text, value.eservice
            }, function (err) {
                callback(null, {
                    regions: regionsArr,
                    elementToRegion: elementToRegion,
                    elementTextToReplace: elementTextToReplace
                });
            });


        });


    };

    /**
     * Parse hubspot content and build allocation
     * @param {object} contentDetails - watson content details for page
     * @param {object} contentDetails.elements
     * @param {string} contentStr
     * @param {object} currentTPAndLayout
     * @param {string} currentTPAndLayout.tpId - touchpoint id
     */
    self.parseExternalContentForAllocation = function(contentDetails, contentStr, currentTPAndLayout) {


        var tpId = currentTPAndLayout.tpId;

        //extract any inline styles
        //var inlineCSS = extractCSS.extract(contentStr,{extractIds:false, extractStyles:true, extractAnonStyle:true, extractClasses:true,});;
        var parser= new DOMParser();
        //parse string to doc
        var htmlDoc= parser.parseFromString(contentStr,'text/html');
        //only interested in "body" (for what goes in div) and "head" (for css link)
        var body = $('body',htmlDoc);
        var head = $('head',htmlDoc);

        var cssLinks = [];

        var styles = '';

        $('link[rel=stylesheet]', head).each(function () {
            cssLinks.push( this.href );
        });

        $('style', head).each(function () {
            styles = styles + ( this.textContent || '' );
        });

        //remove all script tags from body
        $('script', body).remove();


        //add inline styles
        // $(body).prepend('<script>'+inlineCSS+'</script>');



        //convert back to string
        var bodyRemoved = $(body).html();
        //self._parseBody(bodyRemoved,self.pageDetailsCache, tpId);



        //for currentTP

        async.auto({
            prepare: function(cb) {
                self._prepareRegionsAndTemplate(bodyRemoved,contentDetails, tpId, cb);
            },
            //update any text to be replaced
            updateText: ['prepare',function (cb, results) {
                var result  = results.prepare;
                self._updateTextForElements(storyboard_VM.currentSC, self.ep, result.elementTextToReplace, cb);
            }],
            saveLayout: ['updateText', 'prepare', function (cb, results) {
                //if layout was already saved can skip
                var result = results.prepare;
                self.setLayout(tpId,result.regions,result.html,styles,cssLinks, self.tpInfo[tpId].elementStyles, function (err, layoutStruc) {
                // self.setLayout(tpId,result.regions,result.html,inlineCSS,cssLinks, self.tpInfo[tpId].elementStyles, function (err, layoutStruc) {
                    if (err) {
                        alert('could not save layout. Try again later');
                        return cb();
                    }


                    //based on parsing,
                    _.each(self.tpInfo[tpId].elementToRegion,function (value, key) {
                        var params = {
                            elementId: key,
                            regionRef: value
                        };
                        // if (self.tpInfo[tpId].elementStyles && self.tpInfo[tpId].elementStyles[params.elementId]) {
                        //     params.presentationRefArgs =  self.tpInfo[tpId].elementStyles[params.elementId];
                        // }
                        self.updateEPElementDraft(params, tpId);
                    });

                    cb();



                });
            }]

        }, function (err, result) {
            console.log('done');
            alert('you can click complete');
        });



        //bodyRemoved will be saved as the template

        //update html with regions

        //scan html for elements with data-element-id inside each region
        //load into     self.ep.tp
        //save into layout

        //storyboard_VM.stor
        /**
         * tp: [{touchpoint:tpId, layout:layoutIdToSave, regions:{rId:["elementId","elementId"]}}
         */
    };


    self._getTemplate = function(itemType, item) {

        if (itemType === 'image') {
            return '<img src="'+item.design.src+'" alt="element mm" data-mm-tag="ep-dynamic-mm-0">';
        }
        if (itemType === 'video') {
            return '<video controls><source data-mm-tag=\'ep-dynamic-mm-0\' src=\''+item.design.src+'\' type=\'video/mp4\'/></video>';
        }

        if (itemType === 'document') {
            return '<a href="'+item.design.src+'"</a>';
        }

        if (itemType === 'behaviour') {
            return item.design.content;
        }

        if (itemType === 'intelligence') {
            return '<span>Placeholder for intelligence:'+item.design.label+'</span>';
        }


    };

    self._getFileUrlForItem = function(itemType, item) {

        if (itemType === 'image') {
            return item.design.src;
            // return '<img src="'+item.design.src+'" alt="element mm" data-mm-tag="ep-dynamic-mm-0">';
        }
        if (itemType === 'video') {
            return item.design.src;
            // return '<video controls><source data-mm-tag=\'ep-dynamic-mm-0\' src=\''+item.design.src+'\' type=\'video/mp4\'/></video>';
        }

        if (itemType === 'document') {
            return self._documentImageUrl;

            // return '<a href="'+item.design.src+'"</a>';
        }

        if (itemType === 'behaviour') {
            return self._behaviourImageUrl;
            // return item.design.content;
        }

        if (itemType === 'intelligence') {
            return self._intelligenceImageUrl;
            // return '<span>Placeholder for intelligence:'+item.design.label+'</span>';
        }


    };

    self._getTableColumnId = function(columnName, tableDetails) {
        var columns = (tableDetails && tableDetails.columns ?  tableDetails.columns : []);
        var match = _.find(columns, function (val) {
            return val.name.toLowerCase() === columnName.toLowerCase();
        });
        return (match && match.id ? String(match.id) : 'error');

    };


    self.init = function() {


        var fileId = (self.ep.pattern._cms_fid ? self.ep.pattern._cms_fid : null);
        var pageId = (self.ep.pattern._cms_pid ? self.ep.pattern._cms_pid : null);
        //if folderId is present - assume that EP is already setup on Hubspot
        if (fileId && pageId) {
            self.allocationSetup(true);
        }
        // self.loadBlocks(self.ep,false, function (err) {
        //
        // });


    };


    self._makeRequest = function(methodType, path, requestBody, callback) {


        var resource = '/external-cms/request';
        var data  = {
            type: methodType,
            path: path,
            integrationName: self.name()
        };
        if (requestBody) {
            data.body = requestBody;
        }

        var dataType = (methodType && methodType === 'HTML_DOWNLOAD' ? 'html' : 'json' );


        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource, null,dataType);
        restStrategy.create(data, callback);
    };


    self._generateBlock = function(repo, element, currentSC, shortId, callback) {
        dexit.scm.cd.integration.util.generateBlock(repo, element, currentSC, shortId, callback);
    };


    //load blocks for tool (if applicable)
    self.loadBlocks = function (ep, populateCMS, callback) {

        //only send elements that are visibly presented to user
        var elements = dexit.scm.cd.integration.util.findFlowElements(ep.pattern);


        async.auto({
            blocks:function (cb) {
                async.map(elements, function (element, doneElement) {
                    var shortId =storyboard_VM.findShortId(element.id);
                    self._generateBlock(storyboard_VM.repo, element, storyboard_VM.currentSC, shortId, function (err, block) {
                        if (err) {
                            return doneElement(err);
                        }
                        if (!block) {
                            //skip
                            doneElement();
                        }else {
                            doneElement(null, {id: element.id, shortId: shortId, block: block});
                        }
                    });
                }, function (err, blocks) {
                    //load blocks
                    if (err) {
                        return cb(err);
                    }
                    var toPopulate = _.compact(blocks);
                    cb(null,toPopulate);
                });
            },
            designs: ['blocks',function (cb, result) {
                async.map(elements, function (element, doneElement) {
                    var shortId =storyboard_VM.findShortId(element.id);
                    dexit.scm.cd.integration.util.generateDesignViewElement(storyboard_VM.repo,element,storyboard_VM.currentSC,shortId,function (err, toAdd) {
                        if (err) {
                            return doneElement(err);
                        }
                        if (!toAdd) {
                            //skip
                            doneElement();
                        }else {
                            debugger;
                            if (element.type && element.type == 'multimedia') {
                                if (toAdd.src && toAdd.src.indexOf('http') === -1 && toAdd.src.startsWith('/img/')) {
                                    toAdd.src = toAdd.src.replace('/img/','https://s3.amazonaws.com/resource.dexit.co/images/ice4m/');

                                }

                            }



                            doneElement(null,{id:element.id, design:toAdd});
                        }
                    });
                }, function (err, blocks) {
                    //load blocks
                    if (err) {
                        return cb(err);
                    }
                    var toPopulate = _.compact(blocks);
                    cb(null,toPopulate);
                });
            }]
        }, function (err, results) {
            if (err) {
                return callback(err);
            }

            //merge blocks
            var blocks = results.blocks || [];
            var designs = results.designs || [];
            var merged = [];

            _.each(blocks, function (blockVal) {

                var id = blockVal.id;
                var shortId = blockVal.shortId;
                var foundElement = _.find(ep.pattern.element, function (element) {
                    return (element.id === id);
                });
                var block = blockVal.block;
                _.each(designs, function (designVal) {
                    var designId = designVal.id;
                    var design = designVal.design;
                    if (id === designId) {
                        var toAdd = _.extend({shortId: shortId}, foundElement);
                        _.extend(toAdd, {'design':design,'block':block});
                        merged.push(toAdd);
                    }
                });
            });

            if (populateCMS) {
                self._populateElementsWatsonContentHub(merged, callback);
            }else {
                callback(null,merged);
            }

        });

    };

    self._behaviourImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/behavior_template.png';
    self._intelligenceImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/intelligence_template.png';
    self._documentImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/mm_doc_template.png';



    self._getFolderNameForCampaign = function() {
        return self.ep.pattern.name + '__' + self.ep.id + '__' +self.ep.revision;
    };



    self._updateEP = function(callback) {
        var epId = self.ep.id;
        var revision = self.ep.revision;
        dexit.app.ice.integration.engagementpattern.update(epId, revision, self.ep, function(res) {
            if (res) {
                console.log('Ep is updated with custom layout');

                //need to update selectedWidget using registered callback
                self.onEpUpdate(self.ep);

                callback();
            } else {
                console.error('Cannot update engagement pattern to add custom layout');
                callback(new Error('Cannot update'));
            }
        });
    };

    /**
     *
     * @param {object[]} items
     * @param {object} items[].design
     * @param {object} items[].block
     * @param {object} items[].design
     * @param {string} items[].name
     * @param {string} items[].shortId
     * @param {string} items[].type
     * @param {string} items[].subType
     * @param {string} items[].type_id
     * @param {string} items[].id
     * @param callback
     * @private
     */
    self._populateElementsWatsonContentHub = function(items, callback) {


        var integrationFileId = (self.ep.pattern._cms_fid ? self.ep.pattern._cms_fid : null);
        var pageId = (self.ep.pattern._cms_pid ? self.ep.pattern._cms_pid : null);


        var fileName = 'ep-info-'+self.ep.id + '-' + self.ep.revision +'.json';


        var prepareFiles = function(items) {
            //var folder_paths = self._getFolderNameForCampaign();
            var mapped = _.map(items, function (item) {
                var type = item.type;
                if (item.type === 'multimedia') {
                    type = item.design.type;
                }
                var title = item.design.title || item.design.label;


                //make sure

                //if url then shorten it
                if (title.indexOf('/') !== -1) {
                    title = item.shortId + '__' + ( title.split('/').pop() );
                } else {

                    //for ones that are not mm, then add png ending
                    if (title.indexOf('.') === -1) {
                        //add default ext
                        title = title + '.png';
                    }
                }
                //replace : with __
                title = title.replace(item.shortId +':', item.shortId+'__');


                debugger;
                var fileName = title;
                //QH make sure file name, FIXME
                if (item.subType == 'intelligence' && item.type && title.indexOf('user.') !== -1) {
                    fileName = title + '.png';
                }


                var fileItem = {
                    fileName: fileName, //new name
                    filePath: '/dxdamn/'+self.ep.id + '-' + self.ep.revision + '/'+fileName,
                    elementId: item.id,
                    fileUrl: self._getFileUrlForItem(type,item)
                    // folder_paths: folder_paths
                };
                return fileItem;
            });

            return mapped;
        };

        var prepareEPInfo = function (items, preparedFiles) {
            var mappedBlocked = _.map(items, function (item) {

                var found = _.find(preparedFiles, function (prepared) {
                    return (prepared.elementId == item.id);
                });
                if (found) {
                    item.cosFileName = found.fileName;
                    item.cosFilePath = found.filePath;
                }
                return item;
            });
            //prepare in file to be uploaded to IBM
            var epInfoFile = {
                blocks:mappedBlocked,
                epId: self.ep.id,
                epRevision: self.ep.revision,
            };

            return epInfoFile;
        };


        var preparedFiles = prepareFiles(items);
        var epFileInfo = prepareEPInfo(items, preparedFiles);

        async.auto({
            uploadFiles: function (cb, results) {
                if (integrationFileId) {
                    return cb();
                }
                var basePath = '{wch}/authoring/v1/assets';


                //file_names
                //files
                //folder_paths
                //folder_id

                self._makeRequest('FILE_UPLOAD',basePath,preparedFiles,function (err, existing) {
                    if (err) {
                        return cb(err);
                    }
                    console.log(existing);
                    cb(null,existing);
                });

            },
            uploadEPInfo: ['uploadFiles', function (cb, results) {
                if (integrationFileId) {
                    return cb();
                }

                var basePath = '/wch-dex-integration';

                var body = [{
                    fileName: fileName,
                    bucketName: self.bucketName,
                    contentType: 'application/json',
                    api: 'cos',
                    fileData: JSON.stringify(epFileInfo)
                }];
                //file_names
                //files
                //folder_paths
                //folder_id

                self._makeRequest('FILE_UPLOAD',basePath,body,function (err, existing) {
                    if (err) {
                        return cb(err);
                    }
                    console.log(existing);
                    self.ep.pattern._cms_fid = fileName;
                    storyboard_VM.currentEP = self.ep;
                    self._updateEP(function (err) {
                        if (err) {
                            console.error('could not update ep with fileIntegration reference');
                            return cb(err);
                        }
                        cb(null,existing);
                    });
                });

            }],
            createPage: ['uploadEPInfo', 'uploadFiles', function(cb, results) {
                if (pageId) {
                    return cb(null,{id:pageId});
                }
                var basePath = '/api/'+self.tenantId+'/authoring/v1/sites/default/pages';

                var body = {
                    'name': self.ep.pattern.name + ' ('+self.ep.id+'-'+self.ep.revision+')',
                    'hideFromNavigation': true,
                    'segment': 'campaign-'+self.ep.id + '-' + self.ep.revision,
                    'layoutId':  self.pageLayoutId,
                    'description': 'do not change page name',
                    'contentTypeId': self.pageContentTypeId,  //'fc13c787-9488-43a7-b1d9-f65a6ede1260', //TODO: make configurable
                    'title': self.ep.pattern.name + ' ('+self.ep.id+'-'+self.ep.revision+')',
                    'parentId': '',
                    // 'route': '',
                    'kind': ['landing-page'] //TODO: make configurable
                };
                self._makeRequest('POST',basePath,body,function (err, existing) {
                    if (err) {
                        return cb(err);
                    }
                    console.log(existing);
                    self.ep.pattern._cms_pid = existing.id;
                    self.selectedPageId(existing.id);
                    storyboard_VM.currentEP = self.ep;
                    self._updateEP(function (err) {
                        if (err) {
                            return cb(err);
                        }
                        cb(null,existing);
                    });
                });

            }],
            // uploadFiles: ['createFolder', 'prepareFiles',function (cb, results) {
            //     //var createFolder = results.createFolder;
            //
            //     var basePath = '/filemanager/api/v2/files';
            //
            //     var path = basePath + '?hidden=false';
            //
            //     //file_names
            //     //files
            //     //folder_paths
            //     //folder_id
            //
            //     self._makeRequest('FILE_UPLOAD',path,results.prepareFiles,function (err, existing) {
            //         if (err) {
            //             return cb(err);
            //         }
            //         console.log(existing);
            //         cb();
            //     });
            //
            // }]

        }, function (err, results) {
            callback();
        });




    };


    self.markTPDone = function(tpAndLayout) {
        self.showExternalIdModal(tpAndLayout);
    };

    //allocation
    self.showAllocation = function () {

        //prepare allocation (set blocks)
        self.loadBlocks(self.ep, true, function (err) {

            if (!err) {
                self.allocationSetup(true);
                //alert('loaded...go to hubspot');
            }


            //loaded
        });

        //render link to take to tool

        //take to hubspot page directly

    };


    //designer
    self.showDesign = function () {
        //take to hubspot page directly
        console.log('already done in CMS');
        //l

    };

};
