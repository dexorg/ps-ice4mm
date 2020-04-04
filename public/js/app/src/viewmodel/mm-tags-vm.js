/**
 * @copyright Digital Engagement Xperience 2017-2019
 *
 */
/* global dexit, _ */

/**
 *
 * @param {object} [args]
 * @constructor
 */
dexit.app.ice.MMTagsVM = function (args) {
    var self = this;



    self.showAddTagModal = function() {
        self.createTagModalVisible(true);
    };

    self.createTagModalVisible = ko.observable(false);

    self.selectedSection = ko.observable('list')
    /**
     * @field {ko.observableArray<EM>}
     */
    self.tags = ko.observableArray([]);


    self.availableMM = ko.observableArray([]);
    self.originalAvailableMM = [];

    self.pendingTagName = ko.observable('');

    /**
     * Show List View
     */
    self.goToList = function () {
        self.selectedSection('list');
        self.clearCreate();
        self.listTags();
    };


    self.clearCreate = function() {
        self.saving(false);
        self.pendingTagName('');
        self.saving(false);
    };

    /**
     * Show Assignment View
     */
    self.goToAssign = function () {
        self.saving(false);
        self.selectedSection('assign');
        self.nameFilter('');
        self.availableMM([]);
        self.typeSelected(false);
        self.originalAvailableMM = [];

    };

    self.addTag = function() {

        if (self.saving()){
            //guard already saving
            return;
        }

        var tag = self.pendingTagName();


        if (!tag){
            alert('You must enter a name');
            return;
        }
        self.saving(true);

        var body = {
            tag:tag
        };

        var resource = '/user-tag';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.create(body, function (err) {
            if (!err) {
                //add tag to current list
                if (self.tags().indexOf(self.pendingTagName()) === -1){
                    self.tags.unshift(self.pendingTagName());
                }
            }
            //hide modal
            self.clearCreate();
            self.createTagModalVisible(false);




        });

    };

    self.nameFilter = ko.observable('');
    self.tagFilter = ko.observable('');
    self.typeSelected = ko.observable(false);

    self.filteredTags = ko.pureComputed(function () {
        if (!self.tagFilter()){
            return self.tags();
        }



        var filter = self.tagFilter().toLowerCase();
        return _.filter(self.tags(), function(val) {
            return (val && val.toLowerCase().startsWith(filter));
        });

    });


    /**
     * Prepare tags and files
     */
    self.prepareTags = function(availableUserTags, mmAndTags) {

        return _.map(mmAndTags, function (mm) {
            //key, tags, url

            var tags = _.filter(mm.tags, function (tag) {
                return (availableUserTags.indexOf(tag)>-1);
            });

            return {
                key:mm.key,
                tags: tags,
                url: mm.url
            };
        });


    };

    self._isUUID = function(val){
        if (!val){
            return false;
        }
        var regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(val);
    };

    self.tagFilter = ko.observable('');
    self.baseTags = ko.observable(['image','video','document']);
    self.typeFilter = ko.observable();

    // self.filteredAssignmentRows = ko.pureComputed( function() {
    //     var nameFilter = self.nameFilter() || '';
    //
    //     if (nameFilter) {
    //         return _.filter(self.availableMM(), function (val) {
    //             var file = val.fileName().substring(val.fileName().lastIndexOf('/') + 1);
    //             return (file && file.toLowerCase().indexOf(self.nameFilter()) !== -1);
    //         });
    //     } else {
    //         return self.availableMM();
    //     }
    // });

    //     read: function() {
    //         var nameFilter = self.nameFilter() || '';
    //
    //         if (nameFilter) {
    //             return _.filter(self.availableMM(), function (val) {
    //                 var file = val.fileName().substring(val.fileName().lastIndexOf('/') + 1);
    //                 return (file && file.toLowerCase().indexOf(nameFilter) !== -1);
    //             });
    //         } else {
    //             return self.availableMM();
    //         }
    //     },
    //     write: function(value){
    //         //find index and update
    //         var oldLocation = ko.utils.arrayFirst(self.availableMM(), function (item) {
    //             return (item.url === value.url);
    //         });
    //
    //         self.availableMM.replace(oldLocation, value);
    //     },
    //     owner: self
    // });

    self.saving =  ko.observable(false);

    self.showFilteredAssignment = function(){

        //var baseTags = self.baseTags();
        if (self.typeFilter() && self.typeFilter().length > 0) {

            self.availableMM([]);
            self.originalAvailableMM = [];
            self.loadAvailableMM(self.typeFilter());

        }else {
            //show warning to selected
            console.log('nothing to filter')

        }
    };


    /**
     * Load all the available multimedia.
     */
    self.loadAvailableMM = function(val){

        var mm = [];

        if (!val){
            return;
        }

        var tags = [val];


        async.each(tags, function(tag, done){
            dexit.app.ice.integration.filemanagement.findFileDetailsByTag(tag, function (err, result) {
                if (err){
                    console.warn('could not load mm for %s',tag);
                }
                //result object array -> { key: string, url: string, tags: string[] }
                if (result && result.length > 0) {

                    var output = _.map(result, function(item) {
                        //filter out any tags that are not in self.tags()
                        var selectedTags = _.filter(item.tags, function (val) {
                            if (!val){
                                return false;
                            }else if (val === tag) {
                                return false;
                            }else if (self._isUUID(val)){
                                return false;
                            }else {
                                return true;
                            }
                        });


                        return {
                            type: ko.observable(tag),
                            key: item.key,
                            fileName: ko.observable(item.url),
                            selectedTags: ko.observableArray(selectedTags)
                        };

                    });
                    mm = mm.concat(output);
                    done();
                }else {
                    done();
                }

            });
        }, function (err) {
            if (err) {
                console.warn('error');
            }
            self.availableMM(mm);
            self.originalAvailableMM  =  _.map(self.availableMM(),function(item) {
                return {
                    type: ko.observable(ko.utils.unwrapObservable(item.tag)),
                    key: item.key,
                    fileName: ko.observable(ko.utils.unwrapObservable(item.url)),
                    selectedTags: ko.observableArray(ko.utils.unwrapObservable(item.selectedTags))
                };
            });

            self.typeSelected(true);


        });
    };

    /**
     * List the user defined tags
     */
    self.listTags = function () {

        var resource = '/file-tag?tagType=user';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, result) {
            if (err) {
                console.log('no available tags')
                return;
            }
            var resp = result || [];

            self.tags(resp);
        });


    };

    var flattenTags = function (arr) {
        var toReturn = [];
        _.each(arr, function (item) {
            //key, url, tags
            _.each(ko.utils.unwrapObservable(item.selectedTags), function (tag) {
                toReturn.push(item.key + '##' + tag);
            });
        });
        return toReturn;
    };
    //calculate changes
    var calculateChangesArr = function(original, updated, path, comparator, skip) {
        var chs = [];
        var removed = _.differenceWith(original,updated, comparator);
        var added = _.differenceWith(updated, original,comparator);
        if (removed && removed.length > 0) {
            var rem = {op:'remove', path:path, value:removed};
            if (skip) {
                rem.skip = true;
            }
            chs.push(rem);

        }
        if (added && added.length > 0) {
            var add = {op:'add', path:path, value:added};
            if (skip) {
                add.skip = true;
            }
            chs.push(add);
        }
        return chs;

    };

    var tagsComparator = function (val,val2) {
        return (val === val2);
        //return val && val.tags && val2 && val2.tags && _.difference(val.tags, val2.tags);
    };


    self.saveTagsAssignment = function () {

        var tagChanges = self.calculateChanges();


        if (!tagChanges){
            console.log('there are no change');
            return;
        }
        self.saving(true);


        async.each(tagChanges, function (val, done) {
            var op = val.op;
            switch (op) {
                case 'add':
                    async.each(val.value, function(toAdd, doneAdd) {
                        dexit.app.ice.integration.filemanagement.addUserTagsByFileName(toAdd.key, toAdd.tags, function (err) {
                            doneAdd();
                        });
                    }, done);

                    break;
                case 'remove':
                    async.each(val.value, function(toRemove, doneRemove) {
                        dexit.app.ice.integration.filemanagement.removeUserTagsByFileName(toRemove.key, toRemove.tags, function (err) {
                            doneRemove();
                        });
                    }, done);
                    break;
                default:
                    console.warn('unhandled operation for save mm tag changes');
                    done();
            }
        }, function(err) {

            //reload
            self.showFilteredAssignment();
            self.saving(false);
        });

    };

    self.calculateChanges = function() {


        var nameFilter = self.nameFilter() || '';
        var updatedMM = [];
        if (nameFilter) {
            updatedMM  =  _.filter(self.availableMM(), function (val) {
                var file = val.fileName().substring(val.fileName().lastIndexOf('/') + 1);
                return (file && file.toLowerCase().indexOf(nameFilter) !== -1);
            });
        }else {
            updatedMM = self.availableMM();
        }


        var orig = _.filter(self.originalAvailableMM, function (val) {
            return (val && _.find(updatedMM, {key: val.key}));
            //
            // if (nameFilter) {
            //     var file = val.fileName().substring(val.fileName().lastIndexOf('/') + 1);
            //     return (file && file.toLowerCase().indexOf(nameFilter) !== -1);
            // }else {
            //     return true;
            // }



            //return _.find(self.filteredAssignmentRows(), {key: val.key});
        });


        var original =flattenTags(orig);
        var updated = flattenTags(updatedMM);


        var mmTagsChangeList = calculateChangesArr(original,updated,'/mm-tags/', tagsComparator, true);

        // there are 2 arrays, one for add and one for remove
        var mmTagsChanged = _.map(mmTagsChangeList, function (mmTagChange) {

            //skip
            if (mmTagChange.value.length < 1) {
                return mmTagChange;
            }
            //unflatten "FILE##TAG",
            var fileToTag = {

            };
            _.each(mmTagChange.value, function (val) {
                var s = val.split('##');
                if (!fileToTag[s[0]]) {
                    fileToTag[s[0]] = [];
                }
                fileToTag[s[0]].push(s[1]);
            });
            var result = Object.keys(fileToTag).map(function(key) {
                return {
                    key: key,
                    tags: fileToTag[key]
                };
            });

            return _.extend(mmTagChange, {value:result});
        });
        return mmTagsChanged;
    };


};

