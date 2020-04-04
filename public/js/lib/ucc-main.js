var uccLib = (function(){
	var uccContainer = document.querySelector('.ucc-container'),
		qsLink, iconHolder, newVidEl, newImageEl, eventType, qsViewed = false;

	// empty UCC DOM container
	function emptyContainer() {
		var uccContainer = document.querySelector('.ucc-container');

		if(uccContainer && uccContainer.firstChild) {
			while (uccContainer.firstChild) {
				uccContainer.removeChild(uccContainer.firstChild);
			}
		}

		ko.cleanNode(uccContainer);
	}

	function parseMedia(epAsset, callback) {
		// need to unsubscribe each time element is returned so that the uccVM doesn't subscribe multiple times and cause breakeage in the VM at runtime (known issue)
		PubSub.unsubscribe(uccVM.token);

		var parsedMM = {};

		// find the next element
		switch(epAsset.nextElement[0].type) {
			case 'behaviour':
				uccVM.nextElement('behaviour');
				uccVM.nextElementType(epAsset.nextElement[0].property.resource);
                //FIXME: workaround to add reference to SC
                if (epAsset.nextElement[0].property.isAssignedTo) {
                    var val = epAsset.nextElement[0].property.isAssignedTo.split('/');
                    uccVM.currentSCId(val[val.length-1]);
                }
				if(epAsset.nextElement[0].property.resource === "questionnaire"){
						uccVM.nextElementIcon('fa-question-circle');
						uccVM.textIconWrapper('qs-text-only');
				}else if(epAsset.nextElement[0].property.resource.indexOf("charge") > -1){
						uccVM.nextElementIcon('fa-bolt');
						uccVM.textIconWrapper('rc-text-only');
				}else if(epAsset.nextElement[0].property.resource.indexOf("order") > -1){
						uccVM.nextElementIcon('fa-money');
						uccVM.textIconWrapper('eo-text-only');
				}else if(epAsset.nextElement[0].property.resource.indexOf("voucher") > -1){
						uccVM.nextElementIcon('fa-book');
						uccVM.textIconWrapper('ev-text-only');
				}else if(epAsset.nextElement[0].property.resource === "chat"){
						uccVM.nextElementIcon('fa-comment');
						uccVM.textIconWrapper('ct-text-only');
				}
				break;

			case 'multimedia':
				uccVM.nextElement('multimedia');
				uccVM.nextElementIcon('multimedia'); // createAssets will reference this
				break;

			case "end":
				uccVM.nextElementIsEnd(true);
				uccVM.nextElement(null);
				break;

			default:
				uccVM.nextElementIsEnd(null);
				uccVM.nextElement(null);
				break;
		}

		// if there's no multimedia, then it's a behaviour and should just pop the link (whatever it is) in a new window
		if (!epAsset.multimedia && epAsset.url && epAsset.url.trim() !== '' && epAsset.url !== null) {

			uccVM.mediaType('behaviour');

			uccVM.behURL(epAsset.url);
			uccVM.fetchURL(epAsset.url);

			// temp - scroll content over so that the rest of the vm works
			document.querySelector('.course-home').classList.remove('hidden');
			if(document.querySelector('.round-ucc-button:not(.course-home)')){
					uccVM.scrollContent(document.querySelector('.round-ucc-button:not(.course-home)'));
			}

			return;
		}

		emptyContainer();
		uccVM.mediaType(null);

		// handle the media type here => pass to createAssets in uccVM
		if (epAsset.multimedia.video && epAsset.multimedia.video.length > 0) {
			uccVM.mediaType("video");
			parsedMM.mediaType = "video";
			parsedMM.mediaPath = epAsset.multimedia.video[0].property.location;

			if (uccVM.epaType === "default") {
				uccVM.outcomeType = epAsset.multimedia.video[0].property.tag.split('-')[1];
			}
		} else if (epAsset.multimedia.image && epAsset.multimedia.image.length > 0) {
			uccVM.mediaType("image");
			parsedMM.mediaType = "image";
			parsedMM.mediaPath = epAsset.multimedia.image[0].property.location;

			if (uccVM.epaType === "default") {
				uccVM.outcomeType = epAsset.multimedia.image[0].property.tag.split('-')[1];
			}
		}

		parsedMM.mediaLinks = [];

		if(epAsset.multimedia.text && epAsset.multimedia.text.length>0) {

			_.each(epAsset.multimedia.text, function(text){
				if(text.property.tag.indexOf('mm-text')>-1) {
					parsedMM.mediaText = text.property.content;

					if (uccVM.epaType === "default") {
						uccVM.outcomeType = text.property.tag.split('-')[1];
					}
				}

				if(text.property.tag.indexOf('mm-links')>-1) {
					var linkArray = [text.property.content.split(': ')[0], text.property.content.split(': ')[1]];
					parsedMM.mediaLinks.push(linkArray);

					if (uccVM.epaType === "default") {
						uccVM.outcomeType = text.property.tag.split('-')[1];
					}
				}
			});
		}

		if (uccVM.mediaType() === null && parsedMM.mediaLinks.length > 0) {
			uccVM.mediaType('links');

		} else if (uccVM.mediaType() === null && parsedMM.mediaLinks.length === 0) {
			uccVM.mediaType('text');
		}

		uccVM.createAssets(parsedMM);

		if (callback) {
			callback();
		}
	}

	function show(body, callback) {
		parseMedia(body);

		uccVM.token = PubSub.subscribe('showNext', function(msg, data){
			callback();
		});
	}

	function setErrorStatus(err) {
		console.error(err);
	}

	// make methods public
	return {
		findMedia : parseMedia,
		show: show,
		setErrorStatus: setErrorStatus,
		emptyContainer : emptyContainer
	};
})();

var uccVM = {
	lectureTitle : ko.observable(),
	mediaType : ko.observable(),
	mediaSource : ko.observable(),
	currentlyViewing : ko.observable('home'),
	behWindow : null,
	behURL : ko.observable(null),
	viewingLecture : ko.observable(false),
	resizeOnLoad : ko.observable(false),
	outcomeType : 1,
	token : null,
	user: {},
	epaType : 'default',
	statusMessage : ko.observable('Loading content, please wait...'),
	statusIcon : ko.observable('fa fa-spinner fa-pulse'),
	nextElement : ko.observable(null),
	nextElementType : ko.observable(null),
	nextElementIcon : ko.observable(null),
	nextElementIsEnd : ko.observable(false),
	textIconWrapper : ko.observable(null),
    currentSCId : ko.observable(null),


	handleVideoEnded : function(mmEl) {
		if (uccVM.mediaType() == "video") {
			mmEl.controls = false;
			mmEl.currentTime = 0;
			$(mmEl.nextElementSibling).css('top', "-" + $(mmEl).height() + "px");
			mmEl.nextElementSibling.classList.add('animate-down');
		}
	},

	showEndedScreen : function() {
		if ($('.content-scroller').height() === 0) {
			$('.content-scroller').height('250px');
		}

		$('.ucc-preloader').css('height', '240px');

		uccVM.statusIcon('fa fa-check-circle lesson-complete');
        //maybe some words of wisdom
		uccVM.statusMessage(' ');

        setTimeout(uccVM.preloadReset, 2500);
	},

	preloadReset: function() {
		var preloaderScreen = $('.ucc-preloader');

		uccVM.scrollContent(document.querySelector('.course-home'));
		uccVM.resetVM();

		preloaderScreen.removeClass('show-ucc-preloader');

		uccVM.statusMessage('Loading content, please wait...');
		uccVM.statusIcon('fa fa-spinner fa-pulse');
	},

	resetVM : function() {
		uccVM.mediaType(null);
		uccVM.mediaSource(null);
		uccVM.currentlyViewing('home');
		uccVM.behWindow = null;
		uccVM.viewingLecture(false);
		uccVM.resizeOnLoad(false);
		uccVM.lectureTitle('');
		uccVM.outcomeType = 1;
	},

	// TODO => combine 2 url functions into one, if possible

	fetchBehURL : function(element, data) {
		uccVM.behWindow = window.open('', '_blank');
		uccVM.behWindow.document.write('<i style="color: #999; font-family: arial, helvetica, sans-serif">Loading, please wait...</i>');

		if (uccVM.behURL() !== null) {
			uccVM.popQuiz(uccVM.behURL());
		} else {
			PubSub.publish('showNext', {});
		}
	},

	fetchURL : function(url) {
		if (uccVM.behWindow === null) {
			uccVM.behWindow = window.open('', '_blank');
			uccVM.behWindow.document.write('<i style="color: #999; font-family: arial, helvetica, sans-serif">Loading, please wait...</i>');

			uccVM.popQuiz(url, null);
		} else {
			uccVM.popQuiz(url, null);
		}
	},

	// end of todo task

	fetchNextElement : function() {
		$('.ucc-preloader').height($('.content-scroller').height() - 10 + "px");
		document.querySelector('.ucc-preloader').classList.add('show-ucc-preloader');

		uccLib.emptyContainer();

		PubSub.publish('showNext', {});
	},

	scrollContent : function(element, callback) {
		var targetUl = $('.content-scroller'),
			slideWidth = targetUl.parent().width(),
			animTarget = targetUl.find('li').first(),
			animTargetHeight;

		if (uccVM.currentlyViewing() == 'home') {
			if (element.classList.contains('course-home')) { return; }
			else {
				targetUl.css('height', animTargetHeight + "px");
				uccVM.resizeLecturePanel();
				targetUl.animate({
					left: - slideWidth
				}, 750, function() {
					animTarget.appendTo(targetUl);
					targetUl.css('left', '');
					uccVM.currentlyViewing('ucc');
					//uccVM.resizeLecturePanel();
				});
			}
		} else if (uccVM.currentlyViewing() == 'ucc') {
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
					uccVM.currentlyViewing('home');
					document.querySelector('.course-home').classList.add('hidden');
					uccLib.emptyContainer();
					uccVM.resetVM();
					$('.ucc-channel-icon').removeClass('ucc-lecture-active');
					dexit.device.sdk.unloadEngagementPattern(function() {
						console.log('from UCC');
					});
				});
			}
		}
	},

	popQuiz : function(targetURL, prevViewed) {
		//FIXME: passing user object is just a temp solution, need to fix issues in ps-questionnaire service
		var userObject = Base64.encode(JSON.stringify(uccVM.user));
		var newTargetURL = targetURL+'?object='+	userObject;
        if (uccVM.currentSCId()) {
            newTargetURL = newTargetURL + "&reference="+uccVM.currentSCId();
        }

		uccVM.behWindow.location.href = newTargetURL;
	},

	handleQuizSubmission : function(e) {
		if (e.data.message != "clicked") { return; }

		uccVM.behURL(null);

		$('.ucc-preloader').height($('.content-scroller').height() - 10 + "px");
		document.querySelector('.ucc-preloader').classList.add('show-ucc-preloader');

		// if nextElement is end, show lesson ended message else get the next element
		if (uccVM.nextElementIsEnd() === true) {
			// show end screen (as a separate function)
			console.log('should show end screen');
			uccVM.showEndedScreen();
		} else {
			PubSub.publish('showNext', {});
		}

		uccVM.behWindow.close();
		uccVM.behWindow = null;
	},

	// reset ep elements to view again
	replayMedia : function() {
		if (uccVM.mediaType() === "video") {
			var theVideo = document.querySelector('.ucc-container video');
			theVideo.controls = true;
			$(theVideo.nextElementSibling).css('top', "-" + $(theVideo).height() + "px");
			theVideo.nextElementSibling.classList.remove('animate-down');
			theVideo.play();
		}
	},

	// add event handling to MM types
	addEPEvents : function(targetEl, targetMedia, callback) {

		if (targetMedia === "video"){
			targetEl.addEventListener("ended", function() { uccVM.handleVideoEnded(targetEl); }, false);
			targetEl.addEventListener("canplay", uccVM.showNavControls, false);
		}

		if (targetMedia === "image") {
			targetEl.addEventListener("load", uccVM.showNavControls, false);
		}

		if (callback) {
			callback();
		}
	},

	showNavControls : function() {
		if (uccVM.resizeOnLoad() === true) {
			uccVM.resizeLecturePanel();
			return;
		}
		// turn scroller controls on, slide lecture content in
		document.querySelector('.course-home').classList.remove('hidden');
		document.querySelector('.ucc-preloader').classList.remove('show-ucc-preloader');
		if(document.querySelector('.round-ucc-button:not(.course-home)')){
				uccVM.scrollContent(document.querySelector('.round-ucc-button:not(.course-home)'));
		}
	},

	resizeLecturePanel : function(callback) {
		var newHeight;

		// temp fix for empty behaviour content

		if ($('.ucc-container').height() === 0) {
			newHeight = "275px";
		} else {
			newHeight = $('.ucc-container').parent().height()  + "px"; //'auto';
		}

		setTimeout(function() {
			$('.content-scroller').css('height', newHeight);
			document.querySelector('.ucc-preloader').classList.remove('show-ucc-preloader');
		}, 250);


		if (callback) {
			callback();
		}
	},

	removeEPEvents : function(targetEl, targetMedia, callback) {
		var eventType = (targetMedia === "video") ? "ended" : "click";

		targetEl.removeEventListener(eventType, function() { uccLib.doFollowUp(targetEl); }, false);

		if (callback) {
			callback();
		}
	},

	createLB : function() {
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
	},

	popLightBox :  function(el) {
		var videoExists = document.querySelector('.ucc-container video');

		if (videoExists) { videoExists.pause(); }

		var mediapath = el.dataset.resource,
			mediatype = mediapath.substring(mediapath.lastIndexOf('.')),
			lightbox = document.querySelector('.ucc-lightbox-wrapper'),
			lboxHeader = document.querySelector('.ucc-lb-header'),
			lbClose = lightbox.querySelector('button'),
			lboxiFrame = lightbox.querySelector('iframe');

		lbClose.addEventListener('click', function() { uccVM.closeLB(lightbox); }, false);
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
	},

	closeLB : function(lbox) {
		console.log('called close lb');
		lbox.parentNode.classList.remove('show-lightbox');
		lbox.querySelector('iframe').src = "";
		document.body.classList.remove('no-scroll');
	},

	// execute pattern based on parsed SC object from SDK

	createAssets : function(multimedia) {

		var mainContainer = document.querySelector('.ucc-container'),
			mmDiv = document.createElement('div'), mmDiv2 = document.createElement('div'),
			mmDiv3 = document.createElement('div'),
			interStitial = document.createElement('div'),
			behContainer;

		// scaffolding for grid system
		mmDiv.classList.add('col-sm-6', 'media-div');
		mmDiv2.classList.add('col-sm-6');
		mmDiv3.classList.add('col-sm-12');

		// add containers to UCC element
		mainContainer.appendChild(mmDiv);
		mainContainer.appendChild(mmDiv2);
		mainContainer.appendChild(mmDiv3);

		// create MM wrapper
		var mediaWrapper = document.createElement('div');

		mediaWrapper.classList.add('ucc-media-wrapper');

		mmDiv.appendChild(mediaWrapper);

		// TODO => create generic link holder for next element (behaviour or multimedia)

		if (uccVM.nextElement() !== null) {
			var anchorWrapper = document.createElement('div'),
				nextElIcon = document.createElement('i'),
				nextElText = document.createElement('p');

			if (uccVM.nextElement() === "behaviour") {
				switch(uccVM.nextElementIcon().split("-")[1]){
					case 'question':
							nextElText.innerHTML = "Go to Questionnaire";
							break;
					case 'bolt':
							nextElText.innerHTML = "Go to eRecharge";
							break;
					case 'comment':
							nextElText.innerHTML = "Go to chatroom";
							break;
					case 'money':
							nextElText.innerHTML = "Go to eOrder";
							break;
					case 'book':
							nextElText.innerHTML = "Go to eVoucher";
							break;
				}
				nextElIcon.classList.add('fa', uccVM.nextElementIcon());
				anchorWrapper.dataset.bind = "click: uccVM.fetchBehURL.bind($data, $element)";

			} else if (uccVM.nextElement() === 'multimedia') {
				var secondIcon = document.createElement('i');

				nextElText.innerHTML = "Next";
				nextElIcon.classList.add('glyphicon', 'glyphicon-film');
				secondIcon.classList.add('glyphicon', 'glyphicon-picture');
				anchorWrapper.dataset.bind = "click: uccVM.fetchNextElement";

				anchorWrapper.appendChild(secondIcon);
			}

			nextElIcon.classList.add('text-center', 'ucc-qs-icon', 'ucc-chat-icon');

			anchorWrapper.appendChild(nextElIcon);
			anchorWrapper.appendChild(nextElText);
			anchorWrapper.classList.add('ucc-qs-link', 'ucc-chat-imageonly', uccVM.textIconWrapper());

			behContainer = anchorWrapper;

			if (uccVM.mediaType() === "image") {
				mmDiv.appendChild(anchorWrapper);
			} //else {
				//mmDiv2.appendChild(anchorWrapper);
			//}
		}

		// all stuff related to the interstitial => after the MM is done playing / a click etc
		if (uccVM.mediaType() == 'video') {
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
			replayLink.dataset.bind = "click: uccVM.replayMedia";

			followUpOptions.appendChild(replayLink);

			if (uccVM.nextElement() !== null) {
				var nextElLink = document.createElement('li');

				behContainer.classList.remove('ucc-chat-imageonly', uccVM.textIconWrapper());
				nextElLink.classList.add(uccVM.textIconWrapper());

				nextElLink.appendChild(behContainer);
				followUpOptions.appendChild(nextElLink);

			}

			interStitial.appendChild(followUpOptions);
			interStitial.classList.add('ucc-show-qs', 'text-center');

			mmDiv.style.overflow = "hidden";
		}

		// parse mm object and create required elements
		if (multimedia.mediaType == 'video') {
			var newVid = document.createElement('video');
			newVid.src = multimedia.mediaPath;
			newVid.controls = true;
			//newVid.autoplay = true;
			newVid.classList.add('img-responsive');

			uccVM.addEPEvents(newVid, "video", function() {
				mediaWrapper.appendChild(newVid);
				mediaWrapper.appendChild(interStitial);
			});
		}

		if (multimedia.mediaType == 'image') {
			mmDiv.querySelector('.ucc-media-wrapper').classList.add('image-only');

			var newImg = document.createElement('img');
			newImg.src = multimedia.mediaPath;
			newImg.classList.add('img-responsive');

			uccVM.addEPEvents(newImg, "image", function() {
				mediaWrapper.appendChild(newImg);
			});
		}

		// append lecture title
		var mmHeading = document.createElement('h3');
		mmHeading.classList.add('ucc-mm-heading', 'follow-up-text');

		// check for positive or negative result, apply styles accordingly
		if (uccVM.outcomeType == "5") {
			mmHeading.classList.add('ucc-positive-outcome');
		} else if (uccVM.outcomeType == "6") {
			mmHeading.classList.add('ucc-negative-outcome');
		}

		//FIXME: hide title
		mmHeading.dataset.bind = "text:uccVM.lectureTitle";

		if (uccVM.mediaType() == "text") {
			mmDiv.appendChild(mmHeading);			
		} else {
			mmDiv3.appendChild(mmHeading);
		}

		if (multimedia.mediaText) {
			var targetDiv = (uccVM.mediaType() == "text") ? mmDiv : mmDiv3;
			var mmText = document.createElement('p');

			mmText.classList.add('ucc-media-text');
			var mmTextValue = document.createTextNode(multimedia.mediaText);
			mmText.appendChild(mmTextValue);
			targetDiv.appendChild(mmText);
		}

		if (multimedia.mediaLinks && multimedia.mediaLinks.length > 0) {
			var linksContainer = document.createElement('div');
			linksContainer.classList.add('ucc-links-wrapper');

			var targetDiv = (uccVM.mediaType() == "links") ? mmDiv : mmDiv2;
			targetDiv.appendChild(linksContainer);

			var linksHeading = document.createElement('h3');
		 	linksHeading.classList.add('ucc-mm-heading', 'ucc-links-heading');

		 	linksHeadingText = document.createTextNode("Additional Resources");
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
				linkItem.dataset.bind = "click: function() { uccVM.popLightBox($element); }";
				linkList.appendChild(linkItem);
			});

			linksContainer.appendChild(linkList);
		}

		if (uccVM.mediaType() === 'text' || uccVM.mediaType() === 'links') {
			if (uccVM.nextElement() !== null) {
				behContainer.classList.add('ucc-beh-textonly', uccVM.textIconWrapper());
				mmDiv.appendChild(behContainer);
			}

			uccVM.showNavControls();
			// if (behContainer) {
			// 	behContainer.classList.add('force-left');
			// }
		}

		ko.applyBindings(uccVM, document.querySelector(".ucc-container"));
		window.addEventListener('message', uccVM.handleQuizSubmission); // this line might be redundant
	}
};

uccVM.createLB();

window.addEventListener('message', uccVM.handleQuizSubmission); 