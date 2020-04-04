/**
 * Copyright Digital Engagement Xperience Inc 2018
 */
/* global dexit, async, ko */


dexit.app.ice.MMManagement = function (params) {
    var self = this;

    self.tagsToAdd =  [];
    self.closeFn = params.closeFn;

    self.mainVM = params.mainVM;

    self.fileTypeRestrictions = ko.observable(params.fileTypeRestrictions);

    self.baseFolder = (params && params.baseFolder ? ko.observable(params.baseFolder) : ko.observable('/'));


    self.selectedFolderId = ko.observable('');
    self.pendingFolderId = ko.observable('');


    //current Path
    self.path = ko.observableArray();


    //all file information items
    self.allItems = ko.observableArray();


    self.saveTags =function(){
        debugger;
        var ids = self.selectedItems();
        //add tags

        async.each(ids, function (val, cb) {
            var found = _.find(self.allItems(), function(item) {
                return (item.fileType !== 'folder' && item.id ===  val);
            });
            if (!found) {
                //skip
                return cb();
            }
            var tags = self.tagsToAdd.concat([found.mediaType]);
            dexit.app.ice.integration.filemanagement.addAppTagsByFileName(val,tags, function (err) {
                //done
                console.log('done adding tag');
                cb();
            });

        }, function () {

            if (self.closeFn) {
                self.closeFn(self.selectedItems());
            }
        });

    };


    self.reload = function(){
        //self.allItems([]);
        self.load(self.baseFolder(), true);
    };
    var extRegex = /(?:\.([^.]+))?$/;


    self.init = function(path) {
        self.selectedItems([]);
        self.load(path);

    };


    self.load = function(path, ignoreBasePath) {


        if (path === '/') {
            path = '';
        }
        if (!ignoreBasePath) {
            self.path( self.baseFolder() + '/'+ path);
        }


        //self.baseFolder(path);

        debugger;

        dexit.app.ice.integration.filemanagement.listByPath(self.path(), function (err, data) {
            if (err) {
                //show error?
            }else {
               var files = _.reject(data.files, function (val) {
                   return (val.Key === self.path());
               });
               var folders = _.reject(data.folders, function (val) {
                   return (val.Prefix  === self.path());
               });
               var toAdd = _.map(folders, function (val) {
                   var displayName = val.Prefix.replace(self.path(), '');
                   return {
                       id:val.Prefix,
                       fileName: displayName,
                       size: '-',
                       dateCreated: '-',
                       fileType: 'folder'
                   }
               });
                debugger;
                var toAddFiles = _.map(files, function (val) {
                    var displayName = val.Key.replace(self.path(), '');
                    var extension = extRegex.exec(val.Key);
                    var imageTypes = self.fileTypeRestrictions().validImageTypes || '';
                    var videoTypes = self.fileTypeRestrictions().validVideoTypes || '';
                    var mediaType = 'document';
                    if (extension && extension.length > 0 && imageTypes && imageTypes.indexOf(extension[0]) !== -1) {
                        mediaType = 'image';
                    } else if (extension && extension.length > 0 && videoTypes && videoTypes.indexOf(extension[0]) !== -1) {
                        mediaType = 'video';
                    }

                    return {
                        id: val.Key,
                        fileName: displayName,
                        size: val.Size,
                        dateCreated: '-',
                        fileType: 'file',
                        url: val.url,
                        mediaType: mediaType
                    };
                });


                var finalList = toAdd.concat(toAddFiles);

               //self.allCurrentFolderItems(toAdd);
               self.allItems(finalList);

            }

        });


        //list files for base folder
        //dexit.app.ice.integration.filemanagement.listFiles9
    };

    self.previousPath = ko.observable('');

    self.clickItem = function(data) {
        debugger;

        //go into to folder
        if (data && data.fileType && data.fileType === 'folder') {
            self.previousPath(self.path());
            var newPath = (self.path() + data.fileName).replace('//','/');
            self.path(newPath);
            //var aa = self.baseFolder() + '/' + self.path() + '/' + data.fileName;
            self.load(newPath, true);
        }
    };



    self.toParentFolder = function() {
        debugger;

        //ignore when in root baseFolder
        if (self.baseFolder() === self.path() || (self.baseFolder() +'/') === self.path()) {
            return;
        }


        //var previous = self.previousPath();
        var currentPath = self.path();

        //remove the currentPath from Previous
        //remove last index of /
        var last = currentPath.lastIndexOf('/');

        var arr = currentPath.split('/');
        arr.pop();

        if (last === (currentPath.length -1)) {
            arr.pop();
        }
        var newPath = arr.join('/');
        self.path(newPath + '/');
        self.load(newPath,true);




    };


    self.currentFolderFileCount = ko.pureComputed(function () {
        return self.allItems().length;
    });



    self.pendingItems = ko.observableArray();


    self.selectedItems = ko.observableArray();


    self.addFolder = function () {
        var folderId = self.pendingFolderId();

        debugger;

        //absolute path
        var path = (self.path() + '/' + folderId).replace('//','/');

        if (path.lastIndexOf('/') !== (path.length -1)) {
            //append /
            path = path + '/'
        }

        //check folder is not in currentList
        var dupe = _.find(self.allItems(), function (val) {
            return (val.fileType && val.fileType === 'folder' && val.id === path);
        });
        if (dupe) {
            alert('Folder already exists');
            return;
        }
        dexit.app.ice.integration.filemanagement.addFolder(path,function (err) {
            //fileManager add folder
            debugger;
            if (!err) {
                //go into folder
                self.pendingFolderId('');
                //new path
                self.path(path);
                //refresh current list
                self.load(self.path(), true);
            }
        });


    };

    self.fileName = ko.observable();

    var noOp = function(){};

    self.allowedFile = ko.observable();

    self.filesUploadCallback = function (fileUploadId, callback) {
        callback = callback || noOp;
        // if(self.mmDefinePermission()){
        debugger;
        var fileName = self.fileName();
        var path = self.path();
        var tags = [];
        dexit.app.ice.integration.filemanagement.filev2(fileName, tags, fileUploadId, path, function(err, response) {
            if (err) {
                console.log('File is not uploaded');
            }
            else {
                //reload multimedia for BC
                console.log('mm loaded');
                self.load(self.path(),true);
               // self.mainVM.loadMMForBC(tags,callback);
            }
        });
        // }else{
        //     self.mainVM.fmVM.uploadFile(fileUploadId);
        // }

    };

    /**
     * Uploads a file, and adds tags for it
     * (called from mainVM.filesUploadCallback)
     * @param {string} uploadTagId
     */
    // self.uploadFile = function(uploadTagId) {
    //
    //     var fileName, validExt, validFileSize, uploadTargetElement;
    //     //check BCInstancePage is opened or not.
    //     if(args.showBCInstancePage() === false) {
    //         return;
    //     }else{
    //         uploadTargetElement  = $('#' + uploadTagId);
    //     }
    //     if(args && args.fileName()) {
    //         fileName = args.fileName();
    //     } else if(args && args.engagementBuilderVM && args.engagementBuilderVM.fileName()){
    //         fileName = args.engagementBuilderVM.fileName();
    //     }
    //     if (fileName && fileName !== '') {
    //         if (uploadTargetElement && uploadTargetElement.get(0)) {
    //             // check for valid filetype (extension?) here depending on where file is being uploaded from, return if it's not an accepted type or if it's too large
    //             validExt = (self.uploadedMediaFileTypes.indexOf(fileName.substring(fileName.lastIndexOf('.')).toLowerCase()) !== -1);
    //             if (uploadTargetElement.get(0).files[0] && uploadTargetElement.get(0).files[0].size)
    //             {
    //                 validFileSize = (uploadTargetElement.get(0).files[0].size < self.allowedFileSize);
    //                 self.allowedFile(validExt && validFileSize);
    //             }
    //         }
    //         // end file check
    //         //Handle invalid file.
    //         var uploadErrorPanel = $('.upload-error');
    //         var offSets = uploadTargetElement.parents('.select-media-type').offset();
    //         // if the file type is not valid, exit and notify user
    //         if (self.allowedFile() === false) {
    //             // find the input that triggered the upload, turn on the upload error warning
    //             if (!validExt) {
    //                 uploadErrorPanel.find('h5').text(self.errorMessages.wrongFileType);
    //                 uploadErrorPanel.find('h6 i').text('File type not supported. Please try another.');
    //             } else if (!validFileSize) {
    //                 uploadErrorPanel.find('h5').text(self.errorMessages.wrongFileSize);
    //                 uploadErrorPanel.find('h6 i').text('( Max file size: '+self.maxFileSizeMb+'Mb )');
    //             }
    //             var scrolled = $('.createLectureModal').scrollTop();
    //             var windowScrolled = $(window).scrollTop();
    //             uploadErrorPanel.css('top', ((scrolled - 100 + offSets.top) - windowScrolled) + 'px');
    //             uploadErrorPanel.addClass('show-error-panel');
    //             uploadTargetElement.parent('form').get(0).reset();
    //             return;
    //         }
    //         //upload file
    //         var uploadId;
    //         if (uploadTagId) {
    //             uploadId = uploadTagId;
    //         } else {
    //             console.error('MM upload Id is not found');
    //         }
    //         //TODO: better handling on what tags to include should be passed in parameter
    //         if(args.selectedCourse() && args.selectedCourse().courseVM){
    //             var tag = self.tagPrefix + ':'+args.selectedCourse().courseVM.businessConceptInstance.id;
    //             if(self.fileTags().indexOf(tag)===-1) {
    //                 self.fileTags.push(tag);
    //             }
    //         }
    //         dexit.app.ice.integration.filemanagement.file(fileName, self.fileTags(), uploadId, function(err, response) {
    //             if (err) {
    //                 console.log('File is not uploaded');
    //             }
    //             else {
    //                 //reload multimedia for BC
    //                 if (args.selectedCourse() && args.selectedCourse().courseVM) {
    //                     args.selectedCourse().courseVM.reloadMultimediaForBC();
    //                 }
    //             }
    //         });
    //
    //     }
    // };





};
