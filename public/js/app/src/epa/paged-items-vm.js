/**
 * Copyright Digital Engagement Xperience 2017
 */

/**
 *
 * @param {Array} chunks
 * @param {number} index - index for this page
 * @param {ko.observable} currentPage - reference to current active page
 * @constructor
 */
dexit.epm.epa.PageItem = function (chunks, index, currentPage) {
    var self = this;
    self.page = index;
    self.currentPage = currentPage;
    self.chunks = ko.observableArray(chunks);
    self.getPageClass = ko.computed(function () {
        return (self.page == self.currentPage()) ? 'active' : '';
    });

};


dexit.epm.epa.PagedItemVM = function () {
    var self = this;

    /**
     *
     * @param {object} args
     * @param {object} args.items
     * @param {string} [args.title]
     * @param {number} [args.pageSize=8]
     * @param {number} [args.chunkSize=2] - grouping for items in a page
     * @param {string} [args.template] - template for each item
     */
    self.loadItems = function (args) {
        var items = (args && args.items ? args.items : []);
        var title = (args && args.title ?  args.title : '');

        var template = (args && args.template ?  args.template : '');
        self.template(template);
        self.title(title);

        self.items(items);

        var pageSize = (args && args.pageSize ? args.pageSize : 8);
        self.pageSize(pageSize);

        var pageCount = Math.ceil(items.length / pageSize);


        var chunkSize = (args && args.chunkSize ? args.chunkSize : 2);

        //build pages
        for (var i=0;i< pageCount; i++) {
            var currentPage = i;
            //items for current page i
            var pageData = self.items().slice(currentPage * self.pageSize(), (currentPage * self.pageSize()) + self.pageSize());

            //partition into chunks
            var chunks = _.chunk(pageData,chunkSize);
            self.pages.push(new dexit.epm.epa.PageItem(chunks,currentPage,self.currentPage));
        }

    };
    self.template = ko.observable();

    self.title = ko.observable();

    self.items = ko.observableArray();

    self.pages = ko.observableArray();

    self.currentPage = ko.observable(0);
    self.pageSize = ko.observable(8);

    self.pageCount = ko.computed(function(){
        if(self.pageSize()){
            return Math.ceil(self.items().length / self.pageSize());
        }else{
            return 1;
        }
    });

    /**
     * Returns css if page is active or not
     */
    self.getPageClass = function(page) {
        return ko.computed(function () {
            return (page == self.currentPage()) ? 'active' : '';
        },self);
    };


    self.goToNextPage = function () {
        var page = self.currentPage();
        if (page < (self.pageCount() -1) ) {
            self.currentPage(page+1);
        }

    };

    self.goToPreviousPage = function () {
        var page = self.currentPage();
        if (page > 0) {
            self.currentPage(page-1);
        }

    };


};
