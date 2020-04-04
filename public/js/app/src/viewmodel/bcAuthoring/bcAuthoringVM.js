/**
 * Copyright Digital Engagement Xperience 2015-2017
 * Date: 09/12/15
 * @author Ali Hussain / Trevor Van Rys / Xinyu Yun
 * @description bc Authoring view model, this is specific to the bc authoring UI that exist in ICE4E.
 */

/**
 *
 * @param {object} args
 * @param {object} args.mainVM
 * @param {object} args.dcmManagement
 * @param {dexit.epm.EPIntegration} args.epIntegration
 * @constructor
 */
dexit.app.ice.edu.bcAuthoring.BCAuthoringVM = function (args) {

    var bcAuthVM = this;
    var mainVM = args.mainVM;
    var dcmManagement = args.dcmManagement;

    var noOp = function () {};
    //run to mixin functionality for BCAuthoringVM
    dexit.app.ice.edu.bcAuthoring.AddingBCElementsVM({mainVM: mainVM, bcAuthVM: bcAuthVM, dcmManagement:dcmManagement});
    dexit.app.ice.edu.bcAuthoring.RetrievingBCElementsVM({mainVM: mainVM, bcAuthVM: bcAuthVM, dcmManagement:dcmManagement});
    dexit.app.ice.edu.bcAuthoring.EditingBCElementsVM({mainVM: mainVM, bcAuthVM: bcAuthVM});

    bcAuthVM.epIntegration = args.epIntegration || new dexit.epm.EPIntegration();


    // bcAuthVM.imageEPurl = ko.observableArray([ko.observable()]);
    // bcAuthVM.videoEPurl = ko.observableArray([ko.observable()]);
    // bcAuthVM.mmEPurl = ko.observableArray([ko.observable()]);
    // bcAuthVM.mmTextEPAdded = ko.observableArray([ko.observable()]);
    // bcAuthVM.mmTextEP = ko.observableArray([ko.observable()]);
    // bcAuthVM.mmTextAdded = ko.observable(false);
    // bcAuthVM.linksAddedEP = ko.observableArray([ko.observableArray()]);
    bcAuthVM.validTitle = ko.observable(false);

    // bcAuthVM.mmImageList = ko.observable();
    // bcAuthVM.mmVideoList = ko.observable();
    // bcAuthVM.mmDocList = ko.observable();


    // bcAuthVM.fileTypeRestrictions = ko.observable({
    //     validMediaTypes : '.jpg,.png,.gif,.mp4,.jpeg,.bmp',
    //     validDocumentTypes : '.ppt,.pptx,.pot,.pps,.pptm,.potx,.potm,.ppam,.ppsx,.ppsm,.sldx,.sldm,.txt,.zip,.pdf,.doc,.dot,.docx,.docm,.dotx,.dotm,.docb,.xls,.xlt,.xlm,.xlsx,.xlsm,.xltx,.xltm,.xlsb,.xla,.xlam,.xll,.xlw,.pub'
    // });

    bcAuthVM.propertyTextValue = ko.observableArray(['']); //TODO: should be populated based on BC's properties

    /**
     *
     * Make sure duplicate is not taken
     * TODO: look at moving this to a better place
     * @param {object} element - input element
     * @param {object} selectedBC  - bcInstanceVM should provide "is unique name function"
     * @param {object} selectedBC.courseVM
     * @param {ko.observableArray} selectedBC.courseVM.tempCards
     * @param {object} selectedCard
     * @param {string} modalOperation - ie. "Edit"
     */
    bcAuthVM.validateTitle = function(element, selectedBC, selectedCard, modalOperation) {
        var uniqueName,
            epList = selectedBC.courseVM.tempCards();

        /*-When editing the lecture, the same title will be considered as valid
            even if you just click the title area or remove spaces and it is also not case-sensitive.
          -if you change the title, it will go to else loop to check the duplicated title as the "creat" scenario*/
        if ((modalOperation && modalOperation.toLowerCase()==='edit') &&
            (selectedCard.name().toLowerCase().trim().replace(/\s(?=\s)/g,'') === element.value.toLowerCase().trim().replace(/\s(?=\s)/g,''))) {
            uniqueName = true;
        }
        else {
            if(epList.length>0) {
                for (var i=0, len = epList.length; i<len; i++ ) {
                    /*compare lecture title with lowercase, spaces trimed and replacing multiple spaces between words to singe space*/
                    if (epList[i].sc().property.name.toLowerCase().trim().replace(/\s(?=\s)/g,'') === element.value.toLowerCase().trim().replace(/\s(?=\s)/g,'')) {
                        element.classList.add('warning-class');
                        element.parentNode.classList.add('validate-error');
                        uniqueName = false;
                        break;
                    } else {
                        element.classList.remove('warning-class');
                        element.parentNode.classList.remove('validate-error');
                        uniqueName = true;
                    }
                }
            } else {
                element.classList.remove('warning-class');
                element.parentNode.classList.remove('validate-error');
                uniqueName = true;
            }
        }

        bcAuthVM.validTitle(element.value !== '' && element.value !== undefined && uniqueName);

        dpa_VM.validTitle(bcAuthVM.validTitle());

    };

    bcAuthVM.closePreloader = function() {
        // should close preloader if an error occurs
        $('.widget-preloader').addClass('hidden');
    };

    /**
     *genarate html layout with specific id tag
     *
     * @param {array} mmList - MultiMedia List with type and value
     * @param {string} id - explicit tag id from EP
     */
    bcAuthVM.generateLayout = function(mmList, tagId) {
        var layout = '';
        _.each(mmList, function(item, index) {

            var value = ko.utils.unwrapObservable(item.value);
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
        });
        return layout;
    };

    /**
     *Generate layout in dynamic epType
     *
     * @param {object} sc - SC object
     * @param {object[]} dynamicEPAStructure - contains layout contents for each element
     * @param {object} element - EP multimedia element
     * @param {string} epType - Currently used to differentiate between UCC-based and for other channels (values either "ucc" or "general")
     * @param {string} [existingLayoutId] - if passed,  (consider an edit operation), the passed existing layout will be updated
     * @param callback - callback function.
     */
    bcAuthVM.captureDynamicLayout = function (sc, dynamicEPAStructure, element, epType, existingLayoutId, callback) {

        callback = callback || noOp;

        //add the lecture title in dynamic layout from bcAuthVM.propertyTextValue()[0]
        var layoutHTML = '';
        var title = bcAuthVM.propertyTextValue()[0];
        var hasMcQ = false, hasChat = false;


        //TODO: epType is deprecated and should be removed
        // if(epType === 'general'){
        //
        //     if(title && title!=='' ){ //do not add title as part of layout for bcc
        //         layoutHTML = '<div><span data-mm-tag="property-mm-1" data-type="text">' + title +'</span> </div>';
        //     }
        //
        //
        //     async.each(dynamicEPAStructure, function(epUIElement){
        //         var mmList = ko.utils.unwrapObservable(epUIElement.multiMediaList);
        //         if(mmList){
        //             layoutHTML += bcAuthVM.generateLayout(mmList, element.id);
        //         }
        //
        //         if(epUIElement.subType === 'questionnaire'){
        //             hasMcQ = true;
        //         }else if(epUIElement.subType === 'chat'){
        //             hasChat = true;
        //         }
        //     });
        //     layoutHTML =  '<div id="layout-element-1">' + layoutHTML + '</div>';
        //     //if the dynamic EP contains questionnaire and/or chat
        //     if(hasMcQ){
        //         layoutHTML = layoutHTML+'<span data-mm-tag="mm-questionnaire" data-type="text">'+bcAuthVM.questionnaireString+'</span>';
        //     }
        //     if(hasChat){
        //         layoutHTML = layoutHTML+'<span data-mm-tag="mm-chatroom" data-type="text">'+bcAuthVM.chatroomString+'</span>';
        //     }
        // } else {
        //do not need create the decision follow-up MM here since it is already captured in UI jointJS cells
        //for ucc/bcc pass current MM element layout
        var currElement = _.find(dynamicEPAStructure, {id: element.id});
        if(currElement && currElement.multiMediaList){
            var mmList = ko.utils.unwrapObservable(currElement.multiMediaList);
            layoutHTML += bcAuthVM.generateLayout(mmList, element.id);
        }

        // }

        //if the dynamic EP contains chat
        layoutHTML = layoutHTML.replace(/textarea/g, 'span');
        var customizedLayout = '<html><body>' + layoutHTML + '</body></html>';
        // Encode the layout
        var encodedLayout = Base64.encode(customizedLayout);
        var body = {
            content: encodedLayout
        };

        var captureLayoutResponse = function(layout) {
            callback(null,layout);
        };
        if(existingLayoutId) {
            dexit.scm.dcm.integration.layoutmanagement.updateLayout(existingLayoutId, body, function(err, res){
                if (err) {
                    console.error('captureLayout','Cannot update layout: ' + JSON.stringify(err));
                    callback(err);
                }
                else {
                    captureLayoutResponse(existingLayoutId);
                }
            });
        }
        else {
            dexit.scm.dcm.integration.sc.layout.create(mainVM.repo, body, sc.id, function (err, res) {
                if (err) {
                    console.error('captureLayout','Cannot create layout: %o',err);
                    callback(err);
                }
                else {
                    captureLayoutResponse(res);
                }
            });
        }
    };

    bcAuthVM.clearFields = function () {
        if ($('.drop-here-icon')) {
            $('.drop-here-icon').removeClass('hide-dropzone');
        }
        if($('.segment-report-selection')){
            $('.segment-report-selection').removeClass('selected-product');
        }

        if (dpa_VM) {
            //TODO: clean up  (should really just call a function in dpa_VM which handles which fields should be reset
            dpa_VM.generatedStructure([]);
            // dpa_VM.counter = 0;
            dpa_VM.currentElement(null);
            dpa_VM.editingItem(false);
            dpa_VM.retrievedObjects = [];
            dpa_VM.referredIntelligence(null);
            $('.flex-text-add ').removeClass('flex-expand-text box-animate box-animate-backward');
        }

        var contentTitle = $('.content-title');

        if(contentTitle.parent().hasClass('validate-error')) {
            contentTitle.parent().removeClass('validate-error');
        }
        contentTitle.attr('placeholder', 'Lecture title (required)');
        bcAuthVM.propertyTextValue(['']);
        // mainVM.engagementBuilderVM.engagementEnabled(false);
        // mainVM.engagementBuilderVM.decisionValue('');
        mainVM.selectedBehaviour({});
        mainVM.selectedCourse().courseVM.chosenTouchpoints([]);
        bcAuthVM.validTitle(false);
        mainVM.selectedCourse().courseVM.epAuthoringState('pattern');
        mainVM.timer('2');
    };

    bcAuthVM.sortTextMM = function(data, tag) {
        data.text.sort(function(a,b){
            var aTag = parseInt(a.property.tag.split(tag)[1]);
            var bTag = parseInt(b.property.tag.split(tag)[1]);
            return aTag - bTag;
        });
    };


};
