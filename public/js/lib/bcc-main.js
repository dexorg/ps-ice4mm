/**
* Copyright Digital Engagement Xperience 2017
*/
/*jslint browser: true */
/*jslint devel: true */
/*jslint nomen: true */
/*global, dexit, PubSub, _, $ */

var bccLib = (function(){

    var token, user, patternContainer;

    /**
     * empty UCC DOM container
     * @param containerId
     */
    function emptyContainer() {
        //remove all
        _.each(regionMap, function (value, key) {
            value.emptyContainer();
        });
    }

    function prepareMasterContainer(container, layout) {
        // TODO => pass the container reference from the epObject (should be unique)
        patternContainer = document.querySelector('#' + container); // || document.querySelector('.consumer-row');

        // recieves the layout ref from sc-playback and renders the container to be used (finds the pattern container and renders the structure including the internal region references);
        patternContainer.innerHTML = layout;
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
     */
    function parseMedia(bccVM, epAsset) {
        var parsedMM = {};

        var nextElementType = (epAsset.nextElement && epAsset.nextElement.length > 0 && epAsset.nextElement[0].type ? epAsset.nextElement[0].type : "");
        // find the next element


        //FIXME: this logic should be mostly removed, behaviour should come on show (not on click)
        switch(nextElementType) {
            case 'behaviour':
                bccVM.nextElement('behaviour');
                bccVM.nextElementType(epAsset.nextElement[0].property.resource);
                //FIXME: workaround to add reference to SC
                if (epAsset.nextElement[0].property.isAssignedTo) {
                    var val = epAsset.nextElement[0].property.isAssignedTo.split('/');
                    bccVM.currentSCId(val[val.length-1]);
                }

                var display = {};

                if (epAsset.nextElement[0].property.display) {
                    try {
                        if (_.isString(epAsset.nextElement[0].property.display)) {
                            display = JSON.parse(epAsset.nextElement[0].property.display);
                        } else { //safeguard against future changes of this being an object already
                            display = epAsset.nextElement[0].property.display;
                        }
                    } catch (e) { 
                        console.error(e);
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

            case "end":
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
                mode: ( epAsset.display && epAsset.display.mode ? epAsset.display.mode : 'window')
            };

            //bccVM.emptyContainer();
            bccVM.showBehaviour(params);

            return;
        }

        //FIXME: intelligence should be passed in but nothing is received from sc-playback so just skip for now
        if (!epAsset.multimedia) {
            return;
        }

        //bccVM.emptyContainer();
        bccVM.mediaType(null);

        // handle the media type here => pass to createAssets in bccVM
        if (epAsset.multimedia.video && epAsset.multimedia.video.length > 0) {
            bccVM.mediaType("video");
            parsedMM.mediaType = "video";
            parsedMM.mediaPath = epAsset.multimedia.video[0].property.location;
        } else if (epAsset.multimedia.image && epAsset.multimedia.image.length > 0) {
            bccVM.mediaType("image");
            parsedMM.mediaType = "image";
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

        bccVM.createAssets(parsedMM, patternContainer, epAsset.regionRef);
    }

    //region to bccVM mapping  (layout + ":" + regionRef) -> bccVM
    //FIXME: hardcoded bccVM references
    var regionMap = {};


    function handleQuizSubmission(e) {
        //FIXME: call all bc
        _.each(regionMap, function (value, key) {
            value.handleQuizSubmission(e);
        });
    }
    
    function show(body, callback) {
        //temp:if layout does not have region for now default to 2 fo
        //var regionRef = body.regionRef || '2';
        //var layoutRef = body.layoutRef || '';

        //find if there is player to handle region
        var bccVM = regionMap[patternContainer];

        //if not initailize
        if (!bccVM) {
            //var container = getRegion(regionRef);
            bccVM = new dexit.BccVM({container:patternContainer});
            regionMap[patternContainer] = bccVM;
        }

        // need to unsubscribe each time element is returned so that the bccVM doesn't subscribe multiple times and cause breakeage in the VM at runtime (known issue)
        PubSub.unsubscribe(token);

        if(body.multimedia){
            parseMedia(bccVM, body);      
        }else if(body.intelligence){
            //trigger the intelligence referred function to draw the report
            body.intelligence.showFunc();
        }

        token = PubSub.subscribe('showNext', function(msg, data){
            callback();
        });
    }

    function setErrorStatus(err) {
        console.error(err);
    }

    function resetAll() {
        _.each(regionMap, function (value, key) {
            value.resetVM();
        });
        //FIX: find a better way to clear/reference layoutRegions for multiple executing patterns
        regionMap = {};
    }
    var user = {};
    function setUser(val) {
        user = val;
    }
    function getUser() {
        return user;
    }

    function fetchNextElement(containerId) {

        //find if there is player to handle region
        var bccVM = regionMap[containerId];
        if (!bccVM) {
            console.log('no bccVM');
            return;
        }

        try {
        $('.ucc-preloader').height($('.content-scroller').height() - 10 + "px");
        document.querySelector('.ucc-preloader').classList.add('show-ucc-preloader');
        }catch (e) {}
        //bccVM.emptyContainer();

        PubSub.publish('showNext', {});
    }

    // reset ep elements to view again
    // function replayMedia(container) {
    //     //find if there is player to handle region
    //     // var bccVM = regionMap[containerId];
    //     // if (!bccVM) {
    //     //     console.log('no bccVM');
    //     //     return;
    //     // }
    //     bccVM.replayMedia(container);
    //     debugger;
    // }

    // function popLightBox(el, containerId) {
    //     //find if there is player to handle region
    //     var bccVM = regionMap[containerId];
    //     if (!bccVM) {
    //         console.log('no bccVM');
    //         return;
    //     }
    //     bccVM.popLightBox(el);
    // }

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
        prepareMasterContainer : prepareMasterContainer
    };
})();

window.addEventListener('message', bccLib.handleQuizSubmission);

dexit.BccVM = function (params) {
    var self = this;
    var bccVM = this;

    //self.regionId = params.regionId;
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

    self.handleVideoEnded = function(mmEl) {
        if (bccVM.mediaType() == "video") {
            mmEl.controls = false;
            mmEl.currentTime = 0;
            $(mmEl.nextElementSibling).css('top', "-" + $(mmEl).height() + "px");
            mmEl.nextElementSibling.classList.add('animate-down');
        }
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
     *
     * @param {object} params
     * @param {string} params.url
     * @param {string} [params.display.mode=window] - open in new window (other option is 'container')
     */
    self.showBehaviour = function(params) {
        var mode = (params && params.mode ? params.mode : 'window');
        var newTargetURL = bccVM.prepareUrl(params.url);

        if (mode === 'window') {
            bccVM.showBehaviourInNewWindow(newTargetURL);
        }else {

            bccVM.showBehaviourInIframe(newTargetURL);
        }
    };
    /**
     * add iframe, and populate
     * @param {string} url
     */
    self.showBehaviourInIframe = function (url) {
        var iframe = document.createElement('iframe');
        iframe.src = url;

        //FIXME: iframe height and width
        //should size iframe to container
        iframe.height = "600px";
        iframe.width = "100%";
        iframe.style.border = 'none';

        //add to container
        self.container.appendChild(iframe);

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

    self.scrollContent = function(element, callback) {
        var targetUl = $('.content-scroller'),
            slideWidth = targetUl.parent().width(),
            animTarget = targetUl.find('li').first(),
            animTargetHeight;

        if (bccVM.currentlyViewing() == 'home') {
            if (element.classList.contains('course-home')) { return; }
            else {
                targetUl.css('height', animTargetHeight + "px");
                bccVM.resizeLecturePanel();
                targetUl.animate({
                    left: - slideWidth
                }, 750, function() {
                    animTarget.appendTo(targetUl);
                    targetUl.css('left', '');
                    bccVM.currentlyViewing('ucc');
                });
            }
        } else if (bccVM.currentlyViewing() == 'ucc') {
            if (!element.classList.contains('course-home')) {
                $('.content-scroller').height($('.ucc-container').parent().height() + "px");
                return;
            }
            else {
                animTarget = $('.content-scroller > li').last();
                animTarget.prependTo(targetUl);
                targetUl.css('left', -slideWidth);
                animTargetHeight = $('.content-scroller > li').first().height();
                targetUl.css('height', animTargetHeight + "px");

                targetUl.animate({
                    left: 0
                }, 750, function() {
                    targetUl.css('left', '');
                    bccVM.currentlyViewing('home');
                    document.querySelector('.course-home').classList.add('hidden');
                    //TODO: adjust
                    uccLib.emptyContainer();
                    bccVM.resetVM();
                    $('.ucc-channel-icon').removeClass('ucc-lecture-active');
                    dexit.device.sdk.unloadEngagementPattern(function() {
                        console.log('from UCC');
                    });
                });
            }
        }
    };

    /**
     * FIXME: passing user object is just a temp solution, need to fix issues in ps-questionnaire service
     * @param targetURL
     * @return {*}
     */
    self.prepareUrl = function (targetURL) {
        //FIXME: passing user object is just a temp solution, need to fix issues in ps-questionnaire service
        var userObject = Base64.encode(JSON.stringify(bccLib.getUser()));
        var newTargetURL = targetURL+'?object='+    userObject;
        if (bccVM.currentSCId()) {
            newTargetURL = newTargetURL + "&reference="+bccVM.currentSCId();
        }
        return newTargetURL;


    };

    self.handleQuizSubmission = function(e) {
        if (e.data.message != "clicked") { return; }

        bccVM.behURL(null);

        $('.ucc-preloader').height($('.content-scroller').height() - 10 + "px");
        document.querySelector('.ucc-preloader').classList.add('show-ucc-preloader');

        // if nextElement is end, show lesson ended message else get the next element
        if (bccVM.nextElementIsEnd() === true) {
            // show end screen (as a separate function)
            console.log('should show end screen');
            bccVM.showEndedScreen();
        } else {
            PubSub.publish('showNext', {});
        }
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
        $(theVideo.nextElementSibling).css('top', "-" + $(theVideo).height() + "px");
        theVideo.nextElementSibling.classList.remove('animate-down');
        theVideo.play();
    };

    // add event handling to MM types
    self.addEPEvents = function(targetEl, targetMedia, callback) {
        if (targetMedia === "video"){
            targetEl.addEventListener("ended", function() { bccVM.handleVideoEnded(targetEl); }, false);
            targetEl.addEventListener("canplay", bccVM.showNavControls, false);
        }

        if (targetMedia === "image") {
            targetEl.addEventListener("load", bccVM.showNavControls, false);
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

        try {
            if(document.querySelector('.round-ucc-button:not(.course-home)')){
                bccVM.scrollContent(document.querySelector('.round-ucc-button:not(.course-home)'));
            }
        } catch(e) {}
    };

    self.resizeLecturePanel = function() {
        var newHeight;

        // temp fix for empty behaviour content
        if ($(self.container).height() === 0) {
            newHeight = "275px";
        } else {
            newHeight = $(self.container).parent().height()  + "px";
        }

        setTimeout(function() {
            $('.content-scroller').css('height', newHeight);
            document.querySelector('.ucc-preloader').classList.remove('show-ucc-preloader');
        }, 250);

    };

    self.removeEPEvents = function(targetEl, targetMedia, callback) {
        var eventType = (targetMedia === "video") ? "ended" : "click";

        targetEl.removeEventListener(eventType, function() { uccLib.doFollowUp(targetEl); }, false);

        if (callback) {
            callback();
        }
    };

    //not sure where LB stuff should go
    self.createLB = function() {
        var lightBox = document.createElement('div'),
            lightBoxWrapper = document.createElement('div'),
            lightBoxMMPreviewer = document.createElement('iframe'),
            lightBoxClose = document.createElement('button'),
            lightBoxHeader = document.createElement('h3'),
            lightBoxHeaderText = document.createTextNode('Lecture Link: AFI Tool Kit');

        lightBoxHeader.classList.add('ucc-lb-header');
        lightBox.classList.add('ucc-lightbox');
        lightBoxWrapper.classList.add('ucc-lightbox-wrapper');
        lightBoxHeader.appendChild(lightBoxHeaderText);

        lightBoxMMPreviewer.classList.add('ucc-lbox-mmpreview');
        lightBoxClose.classList.add('btn', 'btn-primary', 'pull-right');
        lightBoxClose.innerHTML = "Close Lightbox";

        lightBoxWrapper.appendChild(lightBoxClose);
        lightBoxWrapper.appendChild(lightBoxHeader);
        lightBoxWrapper.appendChild(lightBoxMMPreviewer);

        lightBox.appendChild(lightBoxWrapper);

        document.body.appendChild(lightBox);
    };

    self.popLightBox = function(el) {
        var videoExists = container.querySelector('video');

        if (videoExists) { videoExists.pause(); }

        var mediapath = el.dataset.resource,
            mediatype = mediapath.substring(mediapath.lastIndexOf('.')),
            lightbox = document.querySelector('.ucc-lightbox-wrapper'),
            lboxHeader = document.querySelector('.ucc-lb-header'),
            lbClose = lightbox.querySelector('button'),
            lboxiFrame = lightbox.querySelector('iframe');

        lbClose.addEventListener('click', function() { bccVM.closeLB(lightbox); }, false);
        lboxHeader.firstChild.nodeValue = "Lecture Link: " + el.querySelector('span').innerHTML;

        if (mediatype == ".pdf") {
            // use the google doc viewer inside of an iframe here (or maybe an object tag?)
            lboxiFrame.src = mediapath;
            window.scrollTo(0, 0);
            lightbox.parentNode.classList.add('show-lightbox');
            document.body.classList.add('no-scroll');
        } else {
            var forceDownload = document.createElement('a');

            forceDownload.setAttribute("href", mediapath);
            forceDownload.setAttribute("download", mediapath.substring(mediapath.lastIndexOf('/')));
            forceDownload.click();
        }
    };

    self.closeLB = function(lbox) {
        console.log('called close lb');
        lbox.parentNode.classList.remove('show-lightbox');
        lbox.querySelector('iframe').src = "";
        document.body.classList.remove('no-scroll');
    };

    /**
     * execute pattern based on parsed SC object from SDK
     * @param {object} multimedia
     * @param {object} mainContainer - div container (document) reference
     */
    self.createAssets = function(multimedia, container, region) {
        var mainContainer = self.container || container, 
            targetRegion = mainContainer.querySelector('[data-region="' + region + '"]'),
            interStitial = document.createElement('div');
        
        // need to update most of the following functions to include references to the region each element 
        // is supposed to be rendered into

        // TODO => create generic link holder for next element (behaviour or multimedia)
        if (bccVM.nextElement() !== null) {
            var anchorWrapper = document.createElement('div'),
                nextElIcon = document.createElement('i'),
                nextElText = document.createElement('p');

            if (bccVM.nextElement() === "behaviour") {
                //set text based on behaviour definition
                nextElText.innerHTML = bccVM.nextElementText();

                nextElIcon.classList.add('fa', bccVM.nextElementIcon());
                anchorWrapper.addEventListener('click', function() { bccLib.fetchNextElement(targetRegion); }, false);


            } else if (bccVM.nextElement() === 'multimedia') {
                var secondIcon = document.createElement('i');

                nextElText.innerHTML = "Next";
                nextElIcon.classList.add('glyphicon', 'glyphicon-film');
                secondIcon.classList.add('glyphicon', 'glyphicon-picture');
                anchorWrapper.addEventListener('click', function() { bccLib.fetchNextElement(targetRegion); }, false);

                anchorWrapper.appendChild(secondIcon);
            }

            nextElIcon.classList.add('text-center', 'ucc-qs-icon', 'ucc-chat-icon');

            anchorWrapper.appendChild(nextElIcon);
            anchorWrapper.appendChild(nextElText);
            anchorWrapper.classList.add('ucc-qs-link', 'ucc-chat-imageonly', bccVM.textIconWrapper());

            behContainer = anchorWrapper;

            if (bccVM.mediaType() === "image") {
                targetRegion.appendChild(anchorWrapper);
            }
        }

        // all stuff related to the interstitial => after the MM is done playing / a click etc
        if (bccVM.mediaType() == 'video') {
            var followUpOptions = document.createElement('ul'),
                replayLink = document.createElement('li'),
                replayIconHolder = document.createElement('div'),
                followUpReplayIcon = document.createElement('i'),
                followUpReplayText = document.createElement('p');

            followUpReplayText.innerHTML = 'Replay Video';

            followUpOptions.classList.add('list-unstyled', 'list-inline');
            followUpReplayIcon.classList.add('fa', 'fa-repeat', 'ucc-replay-icon');

            // add controls - replay
            replayIconHolder.appendChild(followUpReplayIcon);
            replayLink.appendChild(replayIconHolder);
            replayLink.appendChild(followUpReplayText);
            replayLink.addEventListener('click', function() { bccVM.replayMedia(targetRegion); }, false)

            followUpOptions.appendChild(replayLink);

            if (bccVM.nextElement() !== null) {
                var nextElLink = document.createElement('li');

                behContainer.classList.remove('ucc-chat-imageonly', bccVM.textIconWrapper());
                nextElLink.classList.add(bccVM.textIconWrapper());

                nextElLink.appendChild(behContainer);
                followUpOptions.appendChild(nextElLink);

            }

            interStitial.appendChild(followUpOptions);
            interStitial.classList.add('ucc-show-qs', 'text-center');

            targetRegion.style.overflow = "hidden";
        }

        // parse mm object and create required elements
        if (multimedia.mediaType == 'video') {
            var newVid = document.createElement('video');
            newVid.src = multimedia.mediaPath;
            newVid.controls = true;
            newVid.autoplay = true;
            newVid.classList.add('img-responsive');

            bccVM.addEPEvents(newVid, "video", function() {
                targetRegion.appendChild(newVid);
                targetRegion.appendChild(interStitial);
            });
        }

        if (multimedia.mediaType == 'image') {
            targetRegion.classList.add('image-only');

            var newImg = document.createElement('img');
            newImg.src = multimedia.mediaPath;
            newImg.classList.add('img-responsive');

            bccVM.addEPEvents(newImg, "image", function() {
                targetRegion.appendChild(newImg);
            });
        }

        // append lecture title
        var mmHeading = document.createElement('h3');
        mmHeading.classList.add('ucc-mm-heading', 'follow-up-text');

        //FIXME: hide title
        mmHeading.innerHTML = bccVM.lectureTitle();

        if (bccVM.mediaType() == "text") {
            targetRegion.appendChild(mmHeading);
        } else {
            targetRegion.appendChild(mmHeading);
        }

        if (multimedia.mediaText) {
            var mmText = document.createElement('p');

            mmText.classList.add('ucc-media-text');
            var mmTextValue = document.createTextNode(multimedia.mediaText);
            mmText.appendChild(mmTextValue);
            targetRegion.appendChild(mmText);
        }

        if (multimedia.mediaLinks && multimedia.mediaLinks.length > 0) {
            var linksContainer = document.createElement('div');
            linksContainer.classList.add('ucc-links-wrapper');

            targetRegion.appendChild(linksContainer);

            var linksHeading = document.createElement('h3');
            linksHeading.classList.add('ucc-mm-heading', 'ucc-links-heading');

            var linksHeadingText = document.createTextNode("Additional Resources");
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
                //linkItem.dataset.bind = "click: function() { bccLib.popLightBox($element,"+self.regionId+"); }";
                linkItem.addEventListener("click", function() { bccVM.popLightBox(this); }, false);
                linkList.appendChild(linkItem);
            });

            linksContainer.appendChild(linkList);
        }

        if (bccVM.mediaType() === 'text' || bccVM.mediaType() === 'links') {
            if (bccVM.nextElement() !== null) {
                behContainer.classList.add('ucc-beh-textonly', bccVM.textIconWrapper());
                targetRegion.appendChild(behContainer);
            }

            bccVM.showNavControls();
        }
    }
};
