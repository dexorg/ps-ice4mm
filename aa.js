/*jslint browser: true */
/*jslint devel: true */
/*jslint nomen: true */
/* global dexit, PubSub, _, $, videojs */

if (!dexit) {
    var dexit = {};
}

bccLib = (function(){

    var token, overrideContainer;

    var layoutcontainerMap = {};

    /**
     * Allow to override container for all layouts (useful for testing?)
     */
    function setContainerOverride(containerId) {
        overrideContainer = containerId;
    }

    /**
     * empty UCC DOM container
     * @param containerId
     */
    function emptyContainer() {
        //remove all
        _.each(regionMap, function (value, key) {
            value.emptyContainer();
        });
        layoutcontainerMap = {};
    }


    /**
     * empty UCC DOM container
     * @param containerId
     */
    function emptyContainers() {
        //remove all
        _.each(layoutcontainerMap, function(value, layoutId) {
            var regionMap = (value && value.regionMap ?  value.regionMap : {});
            _.each(regionMap, function (value, key) {
                value.emptyContainer();
            });
        });
        layoutcontainerMap = {};
    }

    function prepareMasterContainer(layoutId, container, layoutHtml) {



        var containerVal = overrideContainer || container;

        if (!containerVal) {
            throw new Error('Layout must have a container');
        }

        if (!layoutcontainerMap[layoutId]){
            layoutcontainerMap[layoutId] = {};
        }
        // TODO => pass the container reference from the epObject (should be unique)
        layoutcontainerMap[layoutId].patternContainer= document.querySelector('#' + containerVal);
        if (layoutcontainerMap[layoutId].patternContainer) {
            $(layoutcontainerMap[layoutId].patternContainer).empty();
        }

        // recieves the layout ref from sc-playback and renders the container to be used (finds the pattern container and renders the structure including the internal region references);
        layoutcontainerMap[layoutId].patternContainer.innerHTML = layoutHtml;

    }

    /**
     * Find container - fallback t
     * @param {string} regionId
     * @return {*|jQuery|HTMLElement}
     */
    function getRegion(regionId) {
        var selectionStr = '[data-region="' + regionId +'"]';
        var region = document.querySelector(selectionStr);
        //try using div id if fails
        if (!region) {
            region = document.querySelector('#'+regionId);
        }
        return region;
    }

    /**
     *
     * @param {object} uccContainer - reference to document element
     * @param {object} epAsset - to display
     * @param {object} [epAsset.presentationStyle] - styles to attach
     * @param {string} referenceId - id reference to track element
     */
    function parseMedia(bccVM, epAsset, referenceId) {
        var parsedMM = {};

        var nextElementType = (epAsset.nextElement && epAsset.nextElement.length > 0 && epAsset.nextElement[0].type ? epAsset.nextElement[0].type : '');
        // find the next element


        //FIXME: this logic should be mostly removed, behaviour should come on show (not on click)
        switch(nextElementType) {
            case 'behaviour':
                bccVM.nextElement('behaviour');
                bccVM.nextElementType(epAsset.nextElement[0].property.resource);
                //FIXME: workaround to add reference to SC
                // if (epAsset.nextElement[0].property.isAssignedTo) {
                //     var val = epAsset.nextElement[0].property.isAssignedTo.split('/');
                //     bccVM.currentSCId(val[val.length-1]);
                // }

                var display = {};

                if (epAsset.nextElement[0].property.display) {
                    try {
                        if (_.isString(epAsset.nextElement[0].property.display)) {
                            display = JSON.parse(epAsset.nextElement[0].property.display);
                        } else { //safeguard against future changes of this being an object already
                            display = epAsset.nextElement[0].property.display;
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                }
                //select icon from behavior
                if (display.icon) {
                    bccVM.nextElementIcon(display.icon);
                } else {  //if none then pick a default
                    bccVM.nextElementIcon('fa-bullseye');
                }
                //select text to show with icon from behavior
                if (display.icon_text_wrapper) {
                    bccVM.nextElementText(display.icon_text);
                } else {  //if none then pick a default value
                    bccVM.nextElementText('Next');
                }
                //select style for text icon wrapping from behavior
                if (display.icon_text_wrapper) {
                    bccVM.textIconWrapper(display.icon_text_wrapper);
                }
                break;

            case 'multimedia':
                bccVM.nextElement('multimedia');
                bccVM.nextElementIcon('multimedia'); // createAssets will reference this
                break;

            case 'end':
                bccVM.nextElementIsEnd(true);
                bccVM.nextElement(null);
                break;

            default:
                bccVM.nextElementIsEnd(null);
                bccVM.nextElement(null);
                break;
        }

        // if there's no multimedia, then it's a behaviour and should just pop the link (whatever it is) in a new window
        if (!epAsset.multimedia && epAsset.url && epAsset.url.trim() !== '' && epAsset.url !== null) {

            bccVM.mediaType('behaviour');
            bccVM.behURL(epAsset.url);

            var params = {
                url: epAsset.url,
                regionRef: epAsset.regionRef,
                mode: ( epAsset.presentation && epAsset.presentation.mode ? epAsset.presentation.mode : 'window')
            };

            //bccVM.emptyContainer();
            bccVM.showBehaviour(params,referenceId);

            return;
        }

        //FIXME: intelligence should be passed in but nothing is received from sc-playback so just skip for now
        if (!epAsset.multimedia) {
            return;
        }

        bccVM.mediaType(null);

        // handle the media type here => pass to createAssets in bccVM
        if (epAsset.multimedia.video && epAsset.multimedia.video.length > 0) {
            bccVM.mediaType('video');
            parsedMM.mediaType = 'video';
            parsedMM.mediaPath = epAsset.multimedia.video[0].property.location;
            parsedMM.currentElement = epAsset.currentElement;
        } else if (epAsset.multimedia.image && epAsset.multimedia.image.length > 0) {
            bccVM.mediaType('image');
            parsedMM.mediaType = 'image';
            parsedMM.mediaPath = epAsset.multimedia.image[0].property.location;
        }

        parsedMM.mediaLinks = [];

        if(epAsset.multimedia.text && epAsset.multimedia.text.length>0) {

            _.each(epAsset.multimedia.text, function(text){
                if(text.property.tag.indexOf('mm-text')>-1) {
                    parsedMM.mediaText = text.property.content;
                }

                if(text.property.tag.indexOf('mm-links')>-1) {
                    var linkArray = [text.property.content.split(': ')[0], text.property.content.split(': ')[1]];
                    parsedMM.mediaLinks.push(linkArray);
                }
            });
        }

        if (bccVM.mediaType() === null && parsedMM.mediaLinks.length > 0) {
            bccVM.mediaType('links');

        } else if (bccVM.mediaType() === null && parsedMM.mediaLinks.length === 0) {
            bccVM.mediaType('text');
        }

        bccVM.createAssets(parsedMM, epAsset.regionRef, referenceId, epAsset.presentationStyle);
    }

    //region to bccVM mapping  (layout + ":" + regionRef) -> bccVM
    //FIXME: hardcoded bccVM references
    var regionMap = {};

    var behaviourMessageMap = {};

    var callbackMap = {};


    function setBehaviourMessageMap(key, val) {
        behaviourMessageMap[key] = val;
    }


    function postMessageListener(e) {

        //ignore anything not from click message
        if (!e.data.message || e.data.message != 'clicked') { return; }


        //look up callback back based on origin
        //fixme: need better way since if behaviours have same origin this will mess up
        var originMessage = behaviourMessageMap[e.origin];
        if (originMessage) {
            try {
                //remove from map
                delete behaviourMessageMap[e.origin];
            }catch (ex) {

            }

            //look up callbackMap based on container
            fetchNextElement(originMessage);
            //FIXME: call all bc
            _.each(regionMap, function (value, key) {
                value.handleQuizSubmission(e);
            });
        }

    }


    function generateId() {
        var uniqid = Date.now();
        return uniqid;
    }

    function handleShowNext(msg, data) {
        if (data && data.referenceId) {
            var cbFn = callbackMap[data.referenceId];
            if (cbFn) {


                try {
                    cbFn.call();
                } catch(ex) {
                    delete callbackMap[data.referenceId];
                }

                //remove from callback map?

            }
        }
    }


    token = PubSub.subscribe('showNext', handleShowNext);


    function showIntelligence(bccVM,body,referenceId) {


        //trigger the intelligence referred function to draw the report
        //resolve region
        var regionRef = body.regionRef;
        var targetRegion = bccVM.container.querySelector('[data-region="' + regionRef + '"]');


        //clear previous before adding
        $(targetRegion).empty();

        if (body.intelligence.renderInfo) {


            _.each(body.intelligence.renderInfo, function (renderReport, index) {
                if (renderReport.dom) {
                    targetRegion.appendChild(renderReport.dom);
                }
                if (renderReport.showFunc) {
                    if (renderReport.option) {
                        renderReport.showFunc.setOption(renderReport.option);
                        setTimeout(function() {
                            renderReport.showFunc.resize({width:'auto'});
                        }, 10);

                    }
                    else {
                        renderReport.showFunc();

                    }
                    targetRegion.addEventListener('click', function() { fetchNextElement(referenceId); }, false);
                }
            });
        } else if (body.intelligence.presentation) {


            var newDiv = document.createElement('div');

            $(newDiv).append(body.intelligence.presentation.html);
            var listener = function() {
                var msg = {op: 'dexit.ep.show',  hasError: (false), data: { element:body, scId: bccVM.currentSCId()} };
                window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            };
            newDiv.addEventListener('click', listener, false);
            //newDiv.addEventListener('click', function() { PubSub.publish('dexit.ep.show',{ element:body, scId: bccVM.currentSCId()}); }, false);
            $(newDiv).css({'cursor':'pointer'});
            targetRegion.appendChild(newDiv);

        } else {
            console.warn('unhandled presentation for intelligence');
            fetchNextElement(referenceId);
        }



    }

    /**
     *
     * @param layoutRef
     * @param epId
     * @param overrideContainer
     * @returns {string}
     */
    function resolveAbsoluteLayoutId(layoutRef, epId, overrideContainer) {
        if (!overrideContainer){
            return epId + '@' + layoutRef;
        }else {
            return epId + '@' + layoutRef + '@' + overrideContainer;
        }
    }
    function show(id, body, callback) {

        debugger;
        if (_.isString(body)) {
            try{
                debugger;
                body = JSON.parse(body);
            }catch(e){
                console.log('error parsing body:'+body);
            }
        }

        //wrap callbacks with an id ref
        showMe(body, function (err) {
            var msg = {id: id, hasError: (err ? true : false),  error:err};
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        })
    }

    function showMe(body, callback) {

        var layoutRef = resolveAbsoluteLayoutId(body.layoutRef, body.epId, body.overrideContainer);



        //find if there is player to the dom container (for the layout);
        var match = layoutcontainerMap[layoutRef];

        if (!match) {
            return callback(Error('layout container was not recognized'))
        }


        //generate an id so showNext can be correlated
        var referenceId = generateId();
        callbackMap[referenceId] =  callback;




        var bccVM = match.bccVM;

        //if not initailize
        if (!bccVM) {
            bccVM = new dexit.BccVM({container:match.patternContainer, ref:layoutRef, layoutId:body.layoutRef});

            layoutcontainerMap[layoutRef].bccVM = bccVM;
        }
        if (body && body.epId) {
            bccVM.currentEpId(body.epId);
        }
        if (body && body.scId) {
            bccVM.currentSCId(body.scId);
        }

        if (body && body.overrideScId) {
            bccVM.currentSCId(body.overrideScId);
        }

        if(body.multimedia){
            parseMedia(bccVM, body, referenceId);
        }else if(body.intelligence){
            showIntelligence(bccVM,body,referenceId);
        } else  if (body && body.url) { //quick fix for showing behaviour
            parseMedia(bccVM, body, referenceId);
        }
    }

    function setErrorStatus(err) {
        console.warn(err);
    }

    function resetAll() {

        //remove all
        _.each(layoutcontainerMap, function(value, layoutId) {
            var regionMap = (value && value.regionMap ?  value.regionMap : {});
            _.each(regionMap, function (value, key) {
                value.emptyContainer();
            });
        });
        //TODO: find a better way to clear/reference layoutRegions for multiple executing patterns
        layoutcontainerMap = {};
        //remove override
        overrideContainer = null;
    }
    var user = {};
    var scId = {};
    function setUser(val) {
        user = val;
    }
    function getUser() {
        return user;
    }
    function overrideScId(val) {
        scId = val;
    }

    function getOverridenScId() {
        return scId;
    }



    //not sure where LB stuff should go
    function createLB() {
        var lightBox = document.createElement('div'),
            lightBoxWrapper = document.createElement('div'),
            lightBoxMMPreviewer = document.createElement('iframe'),
            lightBoxClose = document.createElement('button'),
            lightBoxHeader = document.createElement('h3'),
            lightBoxHeaderText = document.createTextNode('Link: AFI Tool Kit');

        lightBoxHeader.classList.add('ucc-lb-header');
        lightBox.classList.add('ucc-lightbox');
        lightBoxWrapper.classList.add('ucc-lightbox-wrapper');
        lightBoxHeader.appendChild(lightBoxHeaderText);

        lightBoxMMPreviewer.classList.add('ucc-lbox-mmpreview');
        lightBoxClose.classList.add('btn', 'btn-primary', 'pull-right');
        lightBoxClose.innerHTML = 'Close Lightbox';

        lightBoxWrapper.appendChild(lightBoxClose);
        lightBoxWrapper.appendChild(lightBoxHeader);
        lightBoxWrapper.appendChild(lightBoxMMPreviewer);

        lightBox.appendChild(lightBoxWrapper);

        document.body.appendChild(lightBox);
    }

    //not sure where LB stuff should go
    function createBehaviourLB(lbId) {
        var lightBox = document.createElement('div'),
            lightBoxWrapper = document.createElement('div'),
            lightBoxMMPreviewer = document.createElement('iframe'),
            lightBoxClose = document.createElement('button'),
            lightBoxHeader = document.createElement('h3');
        //lightBoxHeaderText = document.createTextNode('Link: AFI Tool Kit');


        //set the id
        lightBox.setAttribute('id',lbId);
        lightBoxHeader.classList.add('ucc-lb-header');
        lightBox.classList.add('ucc-lightbox');
        lightBoxWrapper.classList.add('ucc-lightbox-wrapper');
        lightBoxWrapper.setAttribute('style','display:inline');
        //lightBoxHeader.appendChild(lightBoxHeaderText);

        lightBoxMMPreviewer.classList.add('ucc-lbox-mmpreview');
        lightBoxClose.classList.add('btn', 'btn-primary', 'pull-right');
        lightBoxClose.innerHTML = 'Close Lightbox';

        lightBoxWrapper.appendChild(lightBoxClose);
        lightBoxWrapper.appendChild(lightBoxHeader);
        lightBoxWrapper.appendChild(lightBoxMMPreviewer);

        lightBox.appendChild(lightBoxWrapper);
        document.body.appendChild(lightBox);
        return lightBox;
    }

    // function popLightBox = function(bccVM,el) {
    //
    // }



    function fetchNextElement(referenceId) {
        //TODO: comment out for now
        // //find if there is player to handle region
        // var bccVM = regionMap[containerId];
        // if (!bccVM) {
        //     console.log('no bccVM');
        //     return;
        // }
        //
        // try {
        //     $('.ucc-preloader').height($('.content-scroller').height() - 10 + "px");
        //     document.querySelector('.ucc-preloader').classList.add('show-ucc-preloader');
        // }catch (e) {}
        // //bccVM.emptyContainer();

        PubSub.publish('showNext', {referenceId: referenceId});
    }

    // make methods public
    return {
        findMedia : parseMedia,
        show: show,
        setErrorStatus: setErrorStatus,
        emptyContainer : emptyContainer,
        resetAll: resetAll,
        setUser: setUser,
        getUser: getUser,
        fetchNextElement: fetchNextElement,
        prepareMasterContainer : prepareMasterContainer,
        setContainerOverride: setContainerOverride,
        postMessageListener: postMessageListener,
        setBehaviourMessageMap: setBehaviourMessageMap,
        createLB: createLB,
        createBehaviourLB: createBehaviourLB,
        setScId: overrideScId,
        getScId: getOverridenScId
    };
})();



dexit.BccVM = function (params) {
    var self = this;
    var bccVM = this;

    self.layoutId = params.layoutId;
    self.container = params.container;
    self.behPresentation = ko.observable('window');
    self.lectureTitle = ko.observable();
    self.mediaType = ko.observable();
    self.mediaSource = ko.observable();
    self.currentlyViewing = ko.observable('home');
    self.behWindow = null;
    self.behURL = ko.observable(null);
    self.viewingLecture = ko.observable(false);
    self.resizeOnLoad = ko.observable(false);
    self.outcomeType = 1;
    self.user = {};
    self.epaType = 'default';
    self.statusMessage = ko.observable('Loading content, please wait...');
    self.statusIcon = ko.observable('fa fa-spinner fa-pulse');
    self.nextElement = ko.observable(null);
    self.nextElementType = ko.observable(null);
    self.nextElementIcon = ko.observable(null);
    self.nextElementText = ko.observable(null);
    self.nextElementIsEnd = ko.observable(false);
    self.textIconWrapper = ko.observable(null);
    self.currentSCId = ko.observable(null);
    self.currentEpId = ko.observable(null);


    // TODO => empty regions only, not the whole container
    self.emptyContainer = function() {
        if(self.container && self.container.firstChild) {
            while (self.container.firstChild) {
                self.container.removeChild(self.container.firstChild);
            }
        }

        try {
            ko.cleanNode(self.container);
        } catch (e) {
            console.log('could not clean node');
        }
    };

    self.handleVideoEnded = function(mmEl,referenceId) {
        bccLib.fetchNextElement(referenceId);



        //Temp: hide for now
        // if (bccVM.mediaType() == "video") {
        //     mmEl.controls = false;
        //     mmEl.currentTime = 0;
        //     $(mmEl.nextElementSibling).css('top', "-" + $(mmEl).height() + "px");
        //     mmEl.nextElementSibling.classList.add('animate-down');
        // }
    };

    self.showEndedScreen = function() {
        if ($('.content-scroller').height() === 0) {
            $('.content-scroller').height('250px');
        }

        $('.ucc-preloader').css('height', '240px');

        bccVM.statusIcon('fa fa-check-circle lesson-complete');
        //maybe some words of wisdom
        bccVM.statusMessage('Congrats! You finished this module.');

        setTimeout(bccVM.preloadReset, 1500);
    };

    self.preloadReset = function() {
        var preloaderScreen = $('.ucc-preloader');

        bccVM.resetVM();

        preloaderScreen.removeClass('show-ucc-preloader');

        bccVM.statusMessage('Loading content, please wait...');
        bccVM.statusIcon('fa fa-spinner fa-pulse');
    };

    self.resetVM = function() {
        bccVM.mediaType(null);
        bccVM.mediaSource(null);
        bccVM.currentlyViewing('home');
        bccVM.behWindow = null;
        bccVM.viewingLecture(false);
        bccVM.resizeOnLoad(false);
        bccVM.lectureTitle('');
        bccVM.outcomeType = 1;
    };

    /**
     * dom reference
     */
    self.clearDiv = function (node) {

        if(node && node.firstChild) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        }
    };



    self.getRegion = function (regionRef) {
        var mainContainer = self.container;
        return mainContainer.querySelector('[data-region="' + regionRef + '"]');
    };

    /**
     *
     * @param {object} params
     * @param {string} params.url
     * @param {string} [params.mode=window] - open in new window (other option is 'container')
     */
    self.showBehaviour = function(params, referenceId) {
        var mode = (params && params.mode ? params.mode : 'window');
        var newTargetURL = bccVM.prepareUrl(params.url);


        //FIXME: get origin only since it is only part accessible for cross-origin
        var myAnchor = $('<a />');
        myAnchor.attr('href', newTargetURL);
        var a = myAnchor[0];



        switch (mode) {
            case 'window':
                //add listener reference id so it is known how to handle 'done'
                bccLib.setBehaviourMessageMap(a.origin,referenceId);
                bccVM.showBehaviourInNewWindow(newTargetURL);
                break;
            case 'inline':
                //add listener reference id so it is known how to handle 'done'
                bccLib.setBehaviourMessageMap(a.origin,referenceId);
                bccVM.showBehaviourInIframe(newTargetURL, self.getRegion(params.regionRef));
                break;
            case 'popover':
                //TODO: use behaviour message map to allow two ways: close lightbox or service sends signal and close LB automatically
                bccVM.showBehaviourInIframePopover(newTargetURL, referenceId);
                break;
        }
    };
    /**
     * add iframe, and populate
     * @param {string} url
     * @param {object} domRef - dom element
     */
    self.showBehaviourInIframe = function (url, domElement) {


        var iframeWrapper = document.createElement('div');
        iframeWrapper.classList.add('embed-responsive');
        iframeWrapper.classList.add('embed-responsive-4by3');
        var iframe = document.createElement('iframe');
        iframe.src = url;

        //FIXME: iframe height and width
        //should size iframe to container
        //iframe.height = '350px';
        //iframe.width = '100%';
        iframe.style.border = 'none';
        iframe.classList.add('embed-responsive-item');

        //empty previous for it
        self.clearDiv(domElement);
        //add to container
        iframeWrapper.appendChild(iframe);
        domElement.appendChild(iframeWrapper);
    };

    /**
     * add iframe, and populate
     * @param {string} url
     * @param {string} referenceId - dom element
     */
    self.showBehaviourInIframePopover = function (url, referenceId) {
        var domId = 'id_'+referenceId;
        //create the LB for behaviour
        var lightboxWrapper = bccLib.createBehaviourLB(domId);


        var lightbox = lightboxWrapper.querySelector('.ucc-lightbox-wrapper'),
            //lboxHeader = document.querySelector('.ucc-lb-header'), //skip header
            lbClose = lightbox.querySelector('button'),
            lboxiFrame = lightbox.querySelector('iframe');

        //when closing lightbox, fetch next, and move LB wrapper
        lbClose.addEventListener('click', function() { bccVM.closeBehaviourLB(lightbox, lightboxWrapper, domId); bccLib.fetchNextElement(referenceId); }, false);

        //set to iframe src
        lboxiFrame.src = url;

        window.scrollTo(0, 0);
        lightbox.parentNode.classList.add('show-lightbox');
        document.body.classList.add('no-scroll');

    };

    /**
     * Open Url in new window
     * @param url
     */
    self.showBehaviourInNewWindow = function(url) {

        if (bccVM.behWindow === null) {
            bccVM.behWindow = window.open('', '_blank');
            bccVM.behWindow.document.write('<i style="color: #999; font-family: arial, helvetica, sans-serif">Loading, please wait...</i>');
        }

        bccVM.behWindow.location.href = url;

    };


    /**
     * FIXME: passing user object is just a temp solution, need to fix issues in ps-questionnaire service
     * @param targetURL
     * @return {*}
     */
    self.prepareUrl = function (targetURL) {
        //FIXME: passing user object is just a temp solution, need to fix issues in ps-questionnaire service
        var userObject = Base64.encode(JSON.stringify(bccLib.getUser()));
        var newTargetURL = targetURL+ (targetURL.indexOf('?') > -1 ? '&':'?') + 'object='+    userObject;
        if (bccVM.currentSCId()) {
            newTargetURL = newTargetURL + '&parent_reference_id='+bccVM.currentSCId();
        }
        if (bccVM.currentEpId()){
            newTargetURL = newTargetURL + '&reference='+bccVM.currentEpId();
        }
        return newTargetURL;


    };

    self.handleQuizSubmission = function(e) {
        if (e.data.message != 'clicked') { return; }

        bccVM.behURL(null);

        $('.ucc-preloader').height($('.content-scroller').height() - 10 + 'px');
        //TODO:commented out since throwing undefined error
        //document.querySelector('.ucc-preloader').classList.add('show-ucc-preloader');

        //TODO: comment out for now
        // if nextElement is end, show lesson ended message else get the next element
        // if (bccVM.nextElementIsEnd() === true) {
        //     // show end screen (as a separate function)
        //     console.log('should show end screen');
        //     bccVM.showEndedScreen();
        // } else {
        //     PubSub.publish('showNext', {});
        // }
        // PubSub.publish('showNext', {});



        if (bccVM.behWindow) {
            bccVM.behWindow.close();
            bccVM.behWindow = null;
        } else {
            //for iframe empty container
            //self.emptyContainer();
        }
    };

    // reset ep elements to view again
    self.replayMedia = function(container) {
        var theVideo = container.querySelector('video');

        theVideo.controls = true;
        $(theVideo.nextElementSibling).css('top', '-' + $(theVideo).height() + 'px');
        theVideo.nextElementSibling.classList.remove('animate-down');
        theVideo.play();
    };

    // add event handling to MM types
    self.addEPEvents = function(targetEl, targetMedia, referenceId, callback) {
        if (targetMedia === 'video'){
            //targetEl.addEventListener('ended', function() { bccVM.handleVideoEnded(targetEl, referenceId); }, false);
            //targetEl.addEventListener('canplay', bccVM.showNavControls, false);
        }

        if (targetMedia === 'image') {
            targetEl.addEventListener('load', bccVM.showNavControls, false);

            targetEl.addEventListener('click', function() { bccLib.fetchNextElement(referenceId); }, false);
            $(targetEl).css({'cursor':'pointer'});
        }

        if (targetMedia === 'text') {
            targetEl.addEventListener('load', bccVM.showNavControls, false);

            targetEl.addEventListener('click', function() { bccLib.fetchNextElement(referenceId); }, false);
            $(targetEl).css({'cursor':'pointer'});
        }



        if (callback) {
            callback();
        }
    };

    self.showNavControls = function() {
        if (bccVM.resizeOnLoad() === true) {
            bccVM.resizeLecturePanel();
            return;
        }
        // turn scroller controls on, slide lecture content in
        try {
            document.querySelector('.course-home').classList.remove('hidden');
        } catch (e) {}

        try {
            document.querySelector('.ucc-preloader').classList.remove('show-ucc-preloader');
        } catch (e) {}
    };

    self.resizeLecturePanel = function() {
        var newHeight;

        // temp fix for empty behaviour content
        if ($(self.container).height() === 0) {
            newHeight = '275px';
        } else {
            newHeight = $(self.container).parent().height()  + 'px';
        }

        setTimeout(function() {
            $('.content-scroller').css('height', newHeight);
            document.querySelector('.ucc-preloader').classList.remove('show-ucc-preloader');
        }, 250);

    };

    // self.removeEPEvents = function(targetEl, targetMedia, callback) {
    //     var eventType = (targetMedia === 'video') ? 'ended' : 'click';
    //
    //     targetEl.removeEventListener(eventType, function() { uccLib.doFollowUp(targetEl); }, false);
    //
    //     if (callback) {
    //         callback();
    //     }
    // };


    self.popLightBox = function(el, referenceId) {
        //var mainContainer = self.container || container;

        //  var videoExists = mainContainer.querySelector('video');

        //  if (videoExists) { videoExists.pause(); }

        var mediapath = el.dataset.resource,
            mediatype = mediapath.substring(mediapath.lastIndexOf('.')),
            lightbox = document.querySelector('.ucc-lightbox-wrapper'),
            lboxHeader = document.querySelector('.ucc-lb-header'),
            lbClose = lightbox.querySelector('button'),
            lboxiFrame = lightbox.querySelector('iframe');

        //when closing, fetch next
        lbClose.addEventListener('click', function() { bccVM.closeLB(lightbox); bccLib.fetchNextElement(referenceId);  }, false);
        lboxHeader.firstChild.nodeValue = 'Link: ' + el.querySelector('span').innerHTML;

        if (mediatype == '.pdf') {
            // use the google doc viewer inside of an iframe here (or maybe an object tag?)
            lboxiFrame.src = mediapath;
            window.scrollTo(0, 0);
            lightbox.parentNode.classList.add('show-lightbox');
            document.body.classList.add('no-scroll');


            bccVM.addEPEvents(lbClose,'text',referenceId);

        } else {
            var forceDownload = document.createElement('a');

            forceDownload.setAttribute('href', mediapath);
            forceDownload.setAttribute('download', mediapath.substring(mediapath.lastIndexOf('/')));
            forceDownload.click();
            bccLib.fetchNextElement(referenceId);

        }
    };

    self.closeLB = function(lbox) {
        console.log('called close lb');
        lbox.parentNode.classList.remove('show-lightbox');
        lbox.querySelector('iframe').src = '';
        document.body.classList.remove('no-scroll');

    };

    self.closeBehaviourLB = function(lbox, lightboxWrapper, referenceId) {
        console.log('called close lb');
        lbox.parentNode.classList.remove('show-lightbox');
        lbox.querySelector('iframe').src = '';
        document.body.classList.remove('no-scroll');




        lightboxWrapper.remove();



    };


    self._sendVideoEvent = function(multimedia, eventName, eventData) {

    };

    /**
     * execute pattern based on parsed SC object from SDK
     * @param {object} multimedia
     * @param {object} mainContainer - div container (document) reference
     */
    self.createAssets = function(multimedia, region, referenceId, presentationStyle) {
        var mainContainer = self.container,
            targetRegion = mainContainer.querySelector('[data-region="' + region + '"]'),
            interStitial = document.createElement('div');

        // need to update most of the following functions to include references to the region each element
        // is supposed to be rendered into
        self.clearDiv(targetRegion);
        // TODO => create generic link holder for next element (behaviour or multimedia)
        if (bccVM.nextElement() !== null) {
            var anchorWrapper = document.createElement('div');
            // nextElIcon = document.createElement('i'),
            // nextElText = document.createElement('p');

            if (bccVM.nextElement() === 'behaviour') {
                //set text based on behaviour definition
                // nextElText.innerHTML = bccVM.nextElementText();

                // nextElIcon.classList.add('fa', bccVM.nextElementIcon());
                anchorWrapper.addEventListener('click', function() { bccLib.fetchNextElement(referenceId); }, false);


            } else if (bccVM.nextElement() === 'multimedia') {
                // var secondIcon = document.createElement('i');

                // nextElText.innerHTML = "Next";
                // nextElIcon.classList.add('glyphicon', 'glyphicon-film');
                // secondIcon.classList.add('glyphicon', 'glyphicon-picture');
                anchorWrapper.addEventListener('click', function() { bccLib.fetchNextElement(referenceId); }, false);

                // anchorWrapper.appendChild(secondIcon);
            }

            // nextElIcon.classList.add('text-center', 'ucc-qs-icon', 'ucc-chat-icon');

            // anchorWrapper.appendChild(nextElIcon);
            // anchorWrapper.appendChild(nextElText);
            // anchorWrapper.classList.add('ucc-qs-link', 'ucc-chat-imageonly', bccVM.textIconWrapper());

            var behContainer = anchorWrapper;

            //if (bccVM.mediaType() === "image") {
            //    targetRegion.appendChild(anchorWrapper);
            //}
        }

        // all stuff related to the interstitial => after the MM is done playing / a click etc
        if (bccVM.mediaType() == 'video') {
            // var followUpOptions = document.createElement('ul'),
            //     replayLink = document.createElement('li'),
            //     replayIconHolder = document.createElement('div'),
            //     followUpReplayIcon = document.createElement('i'),
            //     followUpReplayText = document.createElement('p');

            //TODO: fix video overlay control positioning.  for now comment out
            // followUpReplayText.innerHTML = 'Replay Video';
            //
            // followUpOptions.classList.add('list-unstyled', 'list-inline');
            // followUpReplayIcon.classList.add('fa', 'fa-repeat', 'ucc-replay-icon');
            //
            // // add controls - replay
            // replayIconHolder.appendChild(followUpReplayIcon);
            // replayLink.appendChild(replayIconHolder);
            // replayLink.appendChild(followUpReplayText);
            // replayLink.addEventListener('click', function() { bccVM.replayMedia(targetRegion); }, false)
            //
            // followUpOptions.appendChild(replayLink);
            //
            // if (bccVM.nextElement() !== null) {
            //     var nextElLink = document.createElement('li');
            //
            //     // behContainer.classList.remove('ucc-chat-imageonly', bccVM.textIconWrapper());
            //     nextElLink.classList.add(bccVM.textIconWrapper());
            //
            //     nextElLink.appendChild(behContainer);
            //     followUpOptions.appendChild(nextElLink);
            //
            // }
            //
            // interStitial.appendChild(followUpOptions);
            // interStitial.classList.add('ucc-show-qs', 'text-center');

            targetRegion.style.overflow = 'hidden';
        }

        // parse mm object and create required elements
        if (multimedia.mediaType == 'video') {
            var newVid = document.createElement('video');
            var id = bccVM.currentSCId() + ':' + bccVM.currentEpId();

            //TODO:handle multiple sources: for now assumes mp4 but could be more later
            var dataSetupOptions = {
                aspectRatio: '16:9',
                controls: true,
                preload: 'auto',
                sources: [{
                    src: multimedia.mediaPath,
                    type: 'video/mp4'
                }]
            };
            // $(newVid).attr({'data-setup':dataSetupOptions});
            newVid.id = 'id_'+ referenceId;
            // newVid.src = ;
            // newVid.controls = true;
            // newVid.autoplay = true;
            //newVid.classList.add('img-responsive');
            // newVid.classList.add('video-js');
            // newVid.classList.add('vjs-default-skin');

            //bccVM.addEPEvents(newVid, 'video', referenceId, function() {
            if (presentationStyle) {
                $(newVid).css(presentationStyle);
            }

            targetRegion.appendChild(newVid);
            targetRegion.appendChild(interStitial);

            //add video-js
            var player = videojs('id_' +referenceId, dataSetupOptions);


            //for all eventCallback

            //TODO
            // var pluginParams = {
            //     url:'/bcc/video',
            //     referenceId:id,
            //     video: multimedia.mediaPath,
            //     playReference:'id_' +referenceId,
            //     deviceId: dexit.scp.device.resolution.touchpoint.deviceId,
            //     eventsToTrack:['percentsPlayed', 'start', 'end', 'seek', 'play', 'pause', 'volumeChange', 'error', 'fullscreen'],
            //     eventsHandler: function (name, data) {
            //         //todo: now can tap into these events, so look at video and see what events are exposed
            //         var dat = {elementId: multimedia.currentElement.id, event:name, data: data};
            //         console.log(dat);
            //         PubSub.publish('video.event', dat);
            //
            //     }
            // };

            player.ready(function () {
                //initialize player options
                this.addClass('video-js');
                this.addClass('vjs-default-skin');
                //TODO
                //this.ga(pluginParams);
                this.play();
            });

            player.on('ended', function() {
                bccVM.handleVideoEnded(null,referenceId);
                this.dispose();
            });
        }

        if (multimedia.mediaType == 'image') {
            debugger;

            //if targetRegion is already an image node then replace it
            if (targetRegion.nodeName === 'IMG') {
                targetRegion.src =  multimedia.mediaPath;

                if (presentationStyle) {

                    //also add visibility:visible
                    //$(targetRegion).css(presentationStyle + ';visbility:visible');
                    //        $(targetRegion).css('visibility','visible')
                    //$(targetRegion).css(presentationStyle);

                }
                bccVM.addEPEvents(targetRegion, 'image', referenceId, function() {
                    $(targetRegion).css('visibility','visible');
                });

            }else {

                targetRegion.classList.add('image-only');

                var newImg = document.createElement('img');
                newImg.src = multimedia.mediaPath;
                newImg.classList.add('img-responsive');

                if (presentationStyle) {
                    $(newImg).css(presentationStyle);
                }

                bccVM.addEPEvents(newImg, 'image', referenceId, function() {
                    targetRegion.appendChild(newImg);
                });
            }
        }

        // append lecture title
        var mmHeading = document.createElement('h3');
        mmHeading.classList.add('ucc-mm-heading', 'follow-up-text');

        if (multimedia.mediaText) {
            var mmText;
            //if it contains html then wrap in div no h3
            if (multimedia.mediaText.indexOf('<') !== -1) {
                mmText = document.createElement('div');
                $(mmText).append(multimedia.mediaText);
            }else {
                mmText = document.createElement('h3');
                mmText.classList.add('brandable-header-text');
                var mmTextValue = document.createTextNode(multimedia.mediaText);
                mmText.appendChild(mmTextValue);
            }

            //var mmText = document.createElement('h3');
            if (presentationStyle) {
                $(mmText).css(presentationStyle);
            }

            if (targetRegion.nodeName === 'SPAN') {
                $(targetRegion).css('visibility','visible');
            }

            // }else {
            targetRegion.appendChild(mmText);
            bccVM.addEPEvents(targetRegion, 'text', referenceId);



            // }
        }

        if (multimedia.mediaLinks && multimedia.mediaLinks.length > 0) {
            var linksContainer = document.createElement('div');
            linksContainer.classList.add('ucc-links-wrapper');

            var mmText = document.createElement('h3');
            if (presentationStyle) {
                $(linksContainer).css(presentationStyle);
            }
            //var targetDiv = (bccVM.mediaType() == 'links') ? mmDiv : mmDiv2;
            //targetDiv.appendChild(linksContainer);
            targetRegion.appendChild(linksContainer);

            var linksHeading = document.createElement('h3');
            linksHeading.classList.add('ucc-mm-heading', 'ucc-links-heading');

            var linksHeadingText = document.createTextNode('Documents');
            linksHeading.appendChild(linksHeadingText);
            linksContainer.appendChild(linksHeading);

            var linkList = document.createElement('ul');
            linkList.classList.add('list-unstyled', 'ucc-links');

            [].forEach.call(multimedia.mediaLinks, function(link){
                var linkItem = document.createElement('li');
                var linkName = document.createElement('span');
                var linkText = document.createTextNode(link[0]);
                var lBoxIcon = document.createElement('i');

                lBoxIcon.classList.add('fa', 'ucc-links-link');

                if (link[1].substring(link[1].lastIndexOf('.')) !== '.pdf') {
                    lBoxIcon.classList.add('fa-cloud-download');
                } else {
                    lBoxIcon.classList.add('fa-external-link-square');
                }

                linkName.appendChild(linkText);
                linkItem.appendChild(lBoxIcon);
                linkItem.appendChild(linkName);

                linkItem.dataset.resource = link[1];
                //linkItem.
                linkItem.addEventListener('click', function() { bccVM.popLightBox(linkItem, referenceId); }, false);
                //linkItem.dataset.bind = 'click: function() { bccVM.popLightBox($element); }';
                linkList.appendChild(linkItem);
            });

            linksContainer.appendChild(linkList);
        }

    };
};

document.addEventListener('DOMContentLoaded', function () {
    bccLib.createLB();
    window.addEventListener('message', bccLib.postMessageListener, false);


});


// Create Base64 Object
var Base64 = {


    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },


    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}

