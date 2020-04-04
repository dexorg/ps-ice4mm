/**
 * @copyright Digital Engagement Xperience 2018
 *
 */

/* global storyboard_VM, dexit */

dexit.scm.cd.HsCMSShell = function (args) {


    var self = this;
    var params = args.params || {};

    //set CMS tool
    self.name = (params.name ? ko.observable(params.name): ko.observable('HubSpotCOS'));

    //integration type: 'external', embedded
    self.integrationType = 'external';

    self.externalUrl = (params.url ? ko.observable(params.url) : ko.observable(''));

    self.integrationParams = {
        hubDbTable: (params.tableId ? params.tableId : '849569' )//'elements'
    };
    self.allocationSetup = ko.observable(false);

    self.currentTpAndLayout = ko.observable({});
    self.currentPreviewUrl = null;
    self.pageIdSetupVisible = ko.observable(false);
    self.selectedPageId = ko.observable('');

    //called whenever EP is updated to make sure changes propogate
    self.onEpUpdate = args.onEpUpdate || function(updatedEP) {};
    self.onEPSaveDone = args.onEPSaveDone || function() {};

    self.iframeSrc = ko.observable('');
    self.showExternalIdModal = function(tpAndLayout) {
        self.pageIdSetupVisible(true);
        self.currentTpAndLayout(tpAndLayout);
        debugger;
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

    };



    self.saveExternalIdFinish = function() {


        //update pattern at this point based on mapping
        self._updateEP(function (err) {
            if (err) {
                alert('problem saving');
            }

            self.hideExternalIdModal();
        });

        //close and mark completed


    };
    self.pageDetailsCache = null;

    self.saveExternalId = function() {


        var pageId = self.selectedPageId();
        var currentTPandLayout = self.currentTpAndLayout().touchpoint;


        var pageDetails = '/content/api/v2/pages/'+pageId;
        self._makeRequest('GET',pageDetails,null,function (err, pageDetails) {
            if (err || !pageDetails) {
                alert('Invalid page Id...check and try again');
                return;
            }

            //build preview URL
            var previewUrl = pageDetails.absolute_url + '?hs_preview='+encodeURIComponent(pageDetails.preview_key+'-'+pageId);
            self.pageDetailsCache = pageDetails;
            self.currentPreviewUrl = previewUrl;


            var bod = {
                content_id:pageId,
                redirect_url: previewUrl,
                password:'password'
            };
            debugger;
            var path = pageDetails.absolute_url.slice(0,pageDetails.absolute_url.indexOf('/-temporary-slug')) + '/_hcms/protected/auth';

            //TODO: parsing of response
            self._makeRequest('HTML_DOWNLOAD',path,bod, function(resp, content) {
                if (resp.status !== 200) {
                    alert('Invalid or inaccessible preview url...check and try again');
                    return;
                }

                var htmlString = resp.responseText;

                // if (err && ) {
                //     alert('Invalid or inaccessible preview url...check and try again');
                //     return;
                // }
                self.parseExternalContentForAllocation(htmlString,currentTPandLayout);
            });
        });

    };


    self.hideExternalIdModal = function() {
        self.pageIdSetupVisible(false);
        self.selectedPageId('');
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
            content: btoa(combined),
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



    //
    //
    // self._saveCustomLayout = function(currentTpId, regions, htmlString, inlineCss, cssLinks, callback) {
    //
    //
    //     var scripts = _.reduce(cssLinks, function (memo, item) {
    //         return memo + '<link rel="stylesheet" type="text/css" href="'+item+'"/>';
    //     },'');
    //
    //     var combined = htmlString + '\n' + scripts + '\n' + '<style>'+inlineCss+'</style>';
    //
    //     var toSave = {
    //         content: btoa(combined),
    //         regions: regions,
    //         container: 'merch-container',
    //     };
    //
    //
    //     var id = dpa_VM.generateId();
    //     var layoutId = 'chs-'+id;
    //
    //     var layoutStruc = {
    //         layoutId: layoutId,
    //         id: layoutId,
    //         _hs_pid:self.selectedPageId(),
    //         custom: true,
    //         layoutMarkup: combined,
    //         regions: toSave.regions,
    //         thumbnail: ''
    //     };
    //
    //
    //     async.auto({
    //         saveLayout: function (cb) {
    //             //saves layout through lm
    //             dexit.app.ice.integration.layoutmanagement.updateLayout(layoutId,toSave,cb);
    //         },
    //         updateEPWithLayout: ['saveLayout',function (cb) {
    //             var epId = storyboard_VM.currentEP.id;
    //             var revision = storyboard_VM.currentEP.revision;
    //
    //
    //             //update layout in currentEP variable
    //             var val = storyboard_VM.currentEP.pattern.tp || [];
    //             _.each(val, function (tpAndLayout) {
    //                 var touchpointId = tpAndLayout.touchpoint;
    //                 if (currentTpId === touchpointId) {
    //                     tpAndLayout.layout = layoutStruc; //add layout note here
    //                 }
    //
    //                 //now also update availableTPsAndLayouts
    //
    //
    //             });
    //             _.each(storyboard_VM.availableTPsAndLayouts(), function(available) {
    //                 if (currentTpId === available.touchpoint.tpId) {
    //                     available.layout = layoutStruc;
    //                 }
    //             });
    //
    //             //save changes to current EP
    //             dexit.app.ice.integration.engagementpattern.update(epId, revision, storyboard_VM.currentEP, function(res) {
    //                 if (res) {
    //                     console.log('Ep is updated with custom layout');
    //                 } else {
    //                     console.error('Cannot update engagement pattern to add custom layout');
    //                 }
    //                 cb();
    //             });
    //         }]
    //     }, function(err, results) {
    //
    //         storyboard_VM.selectedLayout(layoutStruc);
    //         storyboard_VM.selectedLayoutId(layoutStruc.id);
    //
    //         callback(null, layoutStruc);
    //
    //     });
    //
    // };


    /**
     * @typedef {Object} TPInfo
     * @property {object} modToElement
     * @property {object} elementToMod -
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


    self._prepareRegionsAndTemplate = function(bodyStr, pageDetails, tpId) {


        /**
         *
         * @param node - parsed html node form jquery
         * @returns {object} src, cssTxt, shortId, longId
         */
        function getNodeInfo(node) {
            //for video or image
            var src = (node && node.length > 0 && node[0].src ? node[0].src : null);

            //get child
            if (src) {
                return {
                    shortId: src.split('/').pop().split('__')[0],
                    cssText: node[0].style.cssText,
                };
            }else {
                var child = $('img, video',node);
                src = (child && child.length > 0 && child[0].src ? child[0].src : null);

                if (src) {

                    return {
                        shortId: src.split('/').pop().split('__')[0],
                        cssText: node[0].style.cssText,
                    };


                }else { //for text
                    //match inside pattern $$number$$. ie. $$1$$
                    var regex = /\$\$(\d+)\$\$/mg;


                    var html = node.outerHTML();
                    var match = regex.exec(html);
                    if (match !== null && match.length > 1) {
                        return {
                            shortId: match[1],
                            replacementText:  html.replace(match[0],''), //replace code
                            cssText: node[0].style.cssText //extract styles
                        };
                    }else {
                        console.warn('no matching element for extraction');
                    }


                }





            }

        }

        //wrap in div for later
        var body = $($.parseHTML('<div>'+bodyStr+'</div>'));

        //key of module id and array the widget in its and shortId
        var modToElement = {

        };

        //for each element, what region it is in (mod is same a region name)
        var elementToMod = {
        };
        var elementStyles = {

        };

        var elementTextToReplace = {

        };




        var containers = pageDetails.widget_containers;
        _.each(containers, function (containerValue, containerKey) {
            _.each(containerValue.widgets, function (val, key) {
                //find all widgets of type "ep_rt"
                if (val && val.label === 'ep_rt') {
                    var elements = val.body.engagement_element;

                    _.each(elements, function (element) {

                        var node = $($.parseHTML(element));


                        //check if this is a div with nested video or image

                        //TODO: text element
                        var info = getNodeInfo(node);

                        var shortId = info.shortId;
                        var longId = storyboard_VM.findLongId(shortId);

                        var cssText = info.cssText;

                        var props = _.compact(cssText.split(';'));
                        var styles = {};
                        _.each(props, function (val) {
                            var split = val.split(':');
                            var key = split[0].trim();
                            var value = split[1].trim();
                            styles[key] = value;
                        }) ;


                        if (info.replacementText) {
                            elementTextToReplace[longId] = info.replacementText;
                        }



                        //extract any inline styles
                        // var styles = _.pickBy(node[0].style, function (value, key, obj) {
                        //    return (_.isString(key) && value && value.length > 0);
                        // });
                        elementStyles[longId] = styles;
                        //figure out elementId
                        //get elementId
                        //var longId =

                        if (!modToElement[containerKey]) {
                            modToElement[containerKey] = [];
                        }
                        modToElement[containerKey].push({src:element, shortId:shortId});
                        elementToMod[longId] = containerKey;

                    });
                }

            });
        });

        if (!self.tpInfo[tpId]) {
            self.tpInfo[tpId] = {
                modToElement: {},
                elementToMod: {},
                elementStyles: {}
            };
        }
        _.extend(self.tpInfo[tpId].modToElement, modToElement);
        _.extend(self.tpInfo[tpId].elementToMod, elementToMod);
        _.extend(self.tpInfo[tpId].elementStyles, elementStyles);

        //update each span
        var regions = [];
        $('span', body).each(function (index, item) {

            var id = $(item).attr('id');

            var regionId =  $(item).attr('data-region');
            if (!regionId) {
                //remove extra text that is not text
                if (id) {
                    id = id.replace('hs_cos_wrapper_', '');

                    regions.push(id);
                    //assume name of module is data-region (should be unique)
                    $(item).attr('data-region', id);
                }

            }else {
                //if data-region was already set in template, ignore...otherwise try to use
                regions.push(regionId);
            }
            //add divthis.
            //remove children of span
            $(item).empty();


        });



        //processed body

        var toReturn =  {
            regions:regions,
            html:$(body).html().trim(),
            elementTextToReplace: elementTextToReplace
        };

        return toReturn;
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
        debugger;

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

    /**
     * Parse hubspot content and build allocation
     * @param {string} contentStr
     * @param {object} currentTPAndLayout
     * @param {string} currentTPAndLayout.tpId - touchpoint id
     */
    self.parseExternalContentForAllocation = function(contentStr, currentTPAndLayout) {

        //parse html and determine regions



        var tpId = currentTPAndLayout.tpId;

        //extract any inline styles
        var inlineCSS = extractCSS.extract(contentStr,{extractIds:false, extractStyles:true, extractAnonStyle:true, extractClasses:true,});

        var parser= new DOMParser();
        //parse string to doc
        var htmlDoc= parser.parseFromString(contentStr,'text/html');
        //only interested in "body" (for what goes in div) and "head" (for css link)
        var body = $('body',htmlDoc);
        var head = $('head',htmlDoc);

        var cssLinks = [];

        $('link[rel=stylesheet]', head).each(function () {
            cssLinks.push( this.href );
        });

        //remove all script tags from body
        $('script', body).remove();


        //add inline styles
        // $(body).prepend('<script>'+inlineCSS+'</script>');



        //convert back to string
        var bodyRemoved = $(body).html();
        //self._parseBody(bodyRemoved,self.pageDetailsCache, tpId);

        var result = self._prepareRegionsAndTemplate(bodyRemoved,self.pageDetailsCache, tpId);

        //for currentTP

        async.auto({
            //update any text to be replaced
            updateText: function (cb) {
                self._updateTextForElements(storyboard_VM.currentSC, self.ep, result.elementTextToReplace, cb);
            },
            saveLayout: ['updateText', function (cb, results) {
                //if layout was already saved can skip
                self.setLayout(tpId,result.regions,result.html,inlineCSS,cssLinks, self.tpInfo[tpId].elementStyles, function (err, layoutStruc) {
                    if (err) {
                        alert('could not save layout. Try again later');
                        return cb();
                    }


                    //based on parsing,
                    _.each(self.tpInfo[tpId].elementToMod,function (value, key) {
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


        var folderId = (self.ep.pattern._cms_hsfid ? self.ep.pattern._cms_hsfid : null);
        //if folderId is present - assume that EP is already setup on Hubspot
        if (folderId) {
            self.allocationSetup(true);
        }
        // self.loadBlocks(self.ep,false, function (err) {
        //
        // });


    };


    self.tableScan = ko.observable(false);

    self.initializeHubDBIntegration = function() {

    };



    // self._populateElementsToHubDB = function(items, touchpoint, callback) {
    //
    //
    //     var tpId = touchpoint.tpId;
    //     //insert/update table
    //
    //     var table = self.integrationParams.hubDbTable;
    //
    //
    //
    //
    //     async.auto({
    //         tableDetails: function(cb) {
    //             var tableDetails = '/hubdb/api/v2/tables/'+table;
    //             self._makeRequest('GET',tableDetails,null,function (err, existing) {
    //                 if (err) {
    //                     return cb(err);
    //                 }
    //                 cb(null,existing);
    //
    //             });
    //         },
    //         findExisting: function (cb) {
    //             //check if exists in table (query all with match ep_id,
    //             var query = 'ep_id__eq='+encodeURIComponent(self.ep.id)+'&tp_id__eq='+encodeURIComponent(tpId);
    //             var listByEPAndTP = '/hubdb/api/v2/tables/'+table+'/rows' + (query ?  '?' + query : '');
    //             self._makeRequest('GET',listByEPAndTP,null,function (err, existing) {
    //                 if (err) {
    //                     return cb(err);
    //                 }
    //                 cb(null,existing);
    //
    //             });
    //         },
    //         updateRows: ['findExisting', function (cb, result) {
    //             if (result.findExisting.objects.length < 1 ) {
    //                 return cb();
    //             }
    //
    //             async.each(result.findExisting.objects, function (obj, doneRow) {
    //                 //delete rows
    //                 var rowId = obj.id;
    //                 //if result length is same as items then skip (then update?), otherwise insert
    //                 var baseResource = '/hubdb/api/v2/tables/'+table+'/rows/'+rowId;
    //                 self._makeRequest('DELETE',baseResource,null,function (err) {
    //                     if (err && !(err.status && err.status == 200)) {
    //                         //response of 200 with no body will return an error, so workaround that by skipping it
    //                         return doneRow(err);
    //                     }
    //                     doneRow();
    //
    //                 });
    //             }, function(err) {
    //                 cb(err);
    //             });
    //         }],
    //         insertNewRows: ['findExisting', 'updateRows', 'tableDetails',function (cb, result) {
    //             //if result length is same as items then skip (then update?), otherwise insert
    //             var tableDetails = result.tableDetails;
    //
    //
    //             var baseResource = '/hubdb/api/v2/tables/'+table+'/rows';
    //
    //             async.each(items, function (obj, doneRow) {
    //
    //                 var type = obj.type;
    //                 if (obj.type === 'multimedia') {
    //                     type = obj.design.type;
    //                 }
    //
    //                 var title = obj.design.title || obj.design.label;
    //                 //if url then shorten it
    //                 if (title.indexOf('/') !== -1) {
    //                     title =  obj.shortId + ":" +  title.split('/').pop();
    //                 }
    //
    //                 var template = self._getTemplate(type, obj) || '<span>Problem resolving template</span>';
    //                 var data = {
    //
    //                     ep_name:self.ep.pattern.name || '',
    //                     name:title,
    //                     tp_id:touchpoint.tpId,
    //                     ep_id:self.ep.id,
    //                     // preview_image:'', //TODO: render
    //                     element_id: obj.id,
    //                     ex_cid:self.ep.pattern.mainScId,
    //                     short_id: ''+obj.shortId,
    //                     template:template,
    //                     element_type: type //can be image, video, document, intelligence, behaviour
    //
    //                 };
    //                 var mappedColumns = {
    //
    //                 };
    //                 _.each(data, function (val, key) {
    //                     var mappedKey =  String(self._getTableColumnId(key,tableDetails));
    //                     mappedColumns[''+mappedKey] = val;
    //                 });
    //
    //
    //                 self._makeRequest('POST',baseResource,{ values: mappedColumns},function (err, existing) {
    //                     if (err) {
    //                         return doneRow(err);
    //                     }
    //                     console.log(existing);
    //                 });
    //                 doneRow();
    //             }, function (err) {
    //                 cb(err);
    //             });
    //
    //
    //         }]
    //     }, function (err, results) {
    //         //now ready
    //         callback(err);
    //     });
    // };


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
    self.loadBlocks = function (ep, populateHS, callback) {

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

            if (populateHS) {
                self._populateElementsToHubSpot(merged, callback);
            }else {
                callback();
            }


            // async.each(storyboard_VM.availableTPsAndLayouts(), function (val, cb) {
            //     // self._populateElementsToHubDB(merged,val.touchpoint, cb);
            //
            //     self._populateElementsToHubSpot(merged,val.touchpoint, cb);
            // }, function (err, popRes) {
            //     if (err) {
            //         console.error(err);
            //     }
            //     callback(err);
            // });

        });


        // async.map(elements, function (element, doneElement) {
        //     var shortId =storyboard_VM.findShortId(element.id);
        //     self._generateBlock(storyboard_VM.repo, element, storyboard_VM.currentSC, shortId, function (err, block) {
        //         if (err) {
        //             return doneElement(err);
        //         }
        //         doneElement(null,{id:element.id, block:block});
        //     });
        // }, function (err, blocks) {
        //     //load blocks
        //
        //     var toPopulate = _.compact(blocks);
        //
        //
        // });

        //populate hubspot

        //for each
        //(repo, element, sc, shortId, callback)


    };

    self._behaviourImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/behavior_template.png';
    self._intelligenceImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/intelligence_template.png';
    self._documentImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/mm_doc_template.png';


    /**
     * Returns the base64 encoded data for an image (restricted to png, gif and jpg)
     * @param url
     * @param callback
     * @return {*}
     * @private
     */
    self._getBase64ImageFromUrl = function(url, callback) {
        var imageType = '';
        if (url.indexOf('.jpg') !== -1) {
            imageType =  'image/png';
        }
        if (url.indexOf('.png') !== -1) {
            imageType =  'image/jpg';
        }
        if (url.indexOf('.gif') !== -1) {
            imageType =  'image/gif';
        }

        if (!imageType) {
            return callback(new Error('Unrecognized image'));
        }

        var img = new Image();
        img.src = url;
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL(imageType);
            var toReturn = dataURL.replace(/^data:image\/(png|jpg|gif);base64,/, '');

            callback(null,toReturn);
        };
    };


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
     * @param {object} items.design
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
    self._populateElementsToHubSpot = function(items, callback) {

        var folderId = (self.ep.pattern._cms_hsfid ? self.ep.pattern._cms_hsfid : null);


        async.auto({
            createFolder:function (cb) {
                if (folderId) {
                    return cb(null,{id:folderId});
                }
                //build file list
                //create folder
                var baseResource = '/filemanager/api/v2/folders';
                var reqBody = {
                    'name': self._getFolderNameForCampaign()
                };

                self._makeRequest('POST',baseResource,reqBody,function (err, existing) {
                    if (err) {
                        return cb(err);
                    }
                    console.log(existing);

                    //update ep with folder id
                    self.ep.pattern._cms_hsfid = existing.id;
                    storyboard_VM.currentEP = self.ep;
                    self._updateEP(function (err) {
                        if (err) {
                            return cb(err);
                        }
                        cb(null,existing);
                    });
                });
            },
            prepareFiles: ['createFolder',function (cb, result) {

                //file_names
                //files
                //folder_paths
                //folder_id
                var folderId = result.createFolder.id;

                var folder_paths = self._getFolderNameForCampaign();
                var mapped = _.map(items, function (item) {
                    var type = item.type;
                    if (item.type === 'multimedia') {
                        type = item.design.type;
                    }
                    var title = item.design.title || item.design.label;
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

                    var fileItem = {
                        file_names: title, //new name
                        folder_id: folderId,
                        fileUrl: self._getFileUrlForItem(type,item),
                        folder_paths: folder_paths
                    };
                    return fileItem;
                });

                cb(null,mapped);

            }],
            uploadFiles: ['createFolder', 'prepareFiles',function (cb, results) {
                //var createFolder = results.createFolder;

                var basePath = '/filemanager/api/v2/files';

                var path = basePath + '?hidden=false';

                //file_names
                //files
                //folder_paths
                //folder_id

                self._makeRequest('FILE_UPLOAD',path,results.prepareFiles,function (err, existing) {
                    if (err) {
                        return cb(err);
                    }
                    console.log(existing);
                    cb();
                });

            }]

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
