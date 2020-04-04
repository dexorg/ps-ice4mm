/**
 * Copyright Digital Engagement Xperience
 * Date: 04/03/15
 * @author Ali Hussain
 * @description File Manager VM
 */

/**
 * File Management View Model
 * @param {object} args - Arguments passed into VM
 * @param {ko.observable} args.showBCInstancePage - observable (boolean)
 * @param {ko.observable} args.currentRole - knockout observable
 * @param {ko.observable} args.listOfCourses - observable
 * @param {ko.observable} args.fileName - observable
 * @param {object} args.engagementBuilderVM
 * @param {ko.observable} args.engagementBuilderVM.fileName - observable (string)
 * @param {ko.observable} args.selectedCourse - observable for current BC instance that is being displayed
 * @param {object} args.selectedCourse().courseVM - CourseVM
 * @param {object} args.selectedCourse().courseVM.businessConceptInstance - Reference to business concept instance variable
 * @param {object} args.selectedCourse().courseVM.businessConceptInstance.property - Property object
 * @param {object} args.selectedCourse().courseVM.businessConceptInstance.id - unique identifier
 * @param {string} args.tenant - The tenant identifier
 * @param {string} [args.tagPrefix=bci] - default tag prefix
 * @param {object} [args.fileConfig] - holds information for how file handling should be done (ie. file types or max size)
 * @param {string[]} [args.fileConfig.allowedFileTypes=['.ppt', '.pptx', '.pot', '.pps', '.pptm', '.potx', '.potm', '.ppam', '.ppsx', '.ppsm', '.sldx', '.sldm', '.txt', '.zip', '.pdf', '.doc', '.dot', '.docx', '.docm', '.dotx', '.dotm', '.docb', '.xls', '.xlt', '.xlm', '.xlsx', '.xlsm', '.xltx', '.xltm', '.xlsb', '.xla', '.xlam', '.xll', '.xlw', '.pub', '.bmp', '.jpg', '.jpeg', '.png', '.gif', '.mp4']]
 * @param {number} [args.fileConfig.allowedFileSize=524288000] - max allowed upload size (500 megs)
 *
 * @constructor
 */
dexit.app.ice.edu.FileManagerVM = function (args) {

    var fmVM = this;
    /**
     * prefix for tagging files that will be used during file upload
     * @type {string}
     */
    fmVM.tagPrefix = args.tagPrefix || 'bci';

    //TODO => move allowedMediaFileTypes and allowedFileSize to configuration
    //
    fmVM.uploadedMediaFileTypes = ( (args.fileConfig && args.fileConfig.allowedFileTypes) ? args.fileConfig.allowedFileTypes : ['.ppt', '.pptx', '.pot', '.pps', '.pptm', '.potx', '.potm', '.ppam', '.ppsx', '.ppsm', '.sldx', '.sldm', '.txt', '.zip', '.pdf', '.doc', '.dot', '.docx', '.docm', '.dotx', '.dotm', '.docb', '.xls', '.xlt', '.xlm', '.xlsx', '.xlsm', '.xltx', '.xltm', '.xlsb', '.xla', '.xlam', '.xll', '.xlw', '.pub', '.bmp', '.jpg', '.jpeg', '.png', '.gif', '.mp4']);
    fmVM.allowedFileSize = ((args.fileConfig && args.fileConfig.allowedFileSize) ? args.fileConfig.allowedFileSize : 524288000);
    fmVM.maxFileSizeMb = ((fmVM.allowedFileSize/1024)/1024).toFixed(4);

    /**
     * Error messages for size or type
     * @type {{wrongFileType: string, wrongFileSize: string}}
     */
    fmVM.errorMessages = {
        wrongFileType : 'File type not supported. Please choose a supported format.',
        wrongFileSize : 'File is too large. Please optimize and try again.'
    };

    /**
     * If file is allowed to be uploaded
     * @instance
     * @returns {true|false}
     */
    fmVM.allowedFile = ko.observable();

    /**
     * array of current file tags
     * TODO: do we need tags for bc besides bci:id?
     * @instance
     */
    fmVM.fileTags = ko.observableArray(['ice4m']);


    /**
     * Uploads a file, and adds tags for it
     * (called from engagementBuilderVM.filesUploadCallback and mainVM.filesUploadCallback)
     * @param {string} uploadTagId
     */
    fmVM.uploadFile = function(uploadTagId) {

        var fileName, validExt, validFileSize, uploadTargetElement;
        //check BCInstancePage is opened or not.
        if(args.showBCInstancePage() === false) {
            return;
        }else{
            uploadTargetElement  = $('#' + uploadTagId);
        }
        if(args && args.fileName()) {
            fileName = args.fileName();
        } else if(args && args.engagementBuilderVM && args.engagementBuilderVM.fileName()){
            fileName = args.engagementBuilderVM.fileName();
        }
        if (fileName && fileName !== '') {
            if (uploadTargetElement && uploadTargetElement.get(0)) {
                // check for valid filetype (extension?) here depending on where file is being uploaded from, return if it's not an accepted type or if it's too large
                validExt = (fmVM.uploadedMediaFileTypes.indexOf(fileName.substring(fileName.lastIndexOf('.')).toLowerCase()) !== -1);
                if (uploadTargetElement.get(0).files[0] && uploadTargetElement.get(0).files[0].size)
                {
                    validFileSize = (uploadTargetElement.get(0).files[0].size < fmVM.allowedFileSize);
                    fmVM.allowedFile(validExt && validFileSize);
                }
            }
            // end file check
            //Handle invalid file.
            var uploadErrorPanel = $('.upload-error');
            var offSets = uploadTargetElement.parents('.select-media-type').offset();
            // if the file type is not valid, exit and notify user
            if (fmVM.allowedFile() === false) {
                // find the input that triggered the upload, turn on the upload error warning
                if (!validExt) {
                    uploadErrorPanel.find('h5').text(fmVM.errorMessages.wrongFileType);
                    uploadErrorPanel.find('h6 i').text('File type not supported. Please try another.');
                } else if (!validFileSize) {
                    uploadErrorPanel.find('h5').text(fmVM.errorMessages.wrongFileSize);
                    uploadErrorPanel.find('h6 i').text('( Max file size: '+fmVM.maxFileSizeMb+'Mb )');
                }
                var scrolled = $('.createLectureModal').scrollTop();
                var windowScrolled = $(window).scrollTop();
                uploadErrorPanel.css('top', ((scrolled - 100 + offSets.top) - windowScrolled) + 'px');
                uploadErrorPanel.addClass('show-error-panel');
                uploadTargetElement.parent('form').get(0).reset();
                return;
            }
            //upload file
            var uploadId;
            if (uploadTagId) {
                uploadId = uploadTagId;
            } else {
                console.error('MM upload Id is not found');
            }
            //TODO: better handling on what tags to include should be passed in parameter
            if(args.selectedCourse() && args.selectedCourse().courseVM){
                var tag = fmVM.tagPrefix + ':'+args.selectedCourse().courseVM.businessConceptInstance.id;
                if(fmVM.fileTags().indexOf(tag)===-1) {
                    fmVM.fileTags.push(tag);
                }
            }
            dexit.app.ice.integration.filemanagement.file(fileName, fmVM.fileTags(), uploadId, function(err, response) {
                if (err) {
                    console.log('File is not uploaded');
                }
                else {
                    //reload multimedia for BC
                    if (args.selectedCourse() && args.selectedCourse().courseVM) {
                        args.selectedCourse().courseVM.reloadMultimediaForBC();
                    }
                }
            });

        }
    };

    /**
     * Removes the selected multimedia
     * (Called from ice4m-dashboard-producer.html)
     * @param {object} file
     * @param {object} file.key
     */
    fmVM.deleteMM = function(file) {
        function handleDeleteFileResponse (err) {
            if(err) {
                console.log('File could not be deleted');
            }
        }

        dexit.app.ice.integration.filemanagement.deleteFile(file.key,  handleDeleteFileResponse);

    };
};
