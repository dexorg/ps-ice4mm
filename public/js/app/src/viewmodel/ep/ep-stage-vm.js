/**
 * Copyright Digital Engagement Xperience 2018
 * @description VM for each stage
 */

/* global dexit, ko */

/**
 *
 * @param {object} args
 * @param {object} args.stageDefinition - definition for the stage
 * @constructor
 */
dexit.app.ice.EPStageVM = function (args) {
    var self = this;

    var stageDefinition = args.stageDefinition;
    self.displayOrder = stageDefinition.displayOrder;
    self.name = ko.observable(stageDefinition.name);
    self.label = ko.observable(stageDefinition.label);
    self.collapsed = ko.observable(false);

    self.isLoaded = ko.observable(false);


    /**
     * Holds an array of cards
     * @member {ko.observableArray<EPCard>} cards
     */
    self.cards = ko.observableArray();


    /**
     * Required for visually splitting up the expired and non-expired
     * Note: card.expired is only relevant during 'published' stage
     */
    self.expiredCards = ko.pureComputed(function(){
        var res = ko.utils.arrayFilter(self.cards(), function(val) {
            return (val.expired());
        });
        return res;
    });


    /**
     * Shows all non expired cards in published stage
     * Note: card.expired is only relevant during 'published' stage
     */
    self.activeCards = ko.pureComputed(function(){
        var res = ko.utils.arrayFilter(self.cards(), function(val) {
            return (!val.expired());
        });
        return res;
    });



    self.numberOfCards = ko.pureComputed(function () {
        return self.cards().length;
    });

    /**
     * Sets by which field to order the cards
     * @member {ko.observable<string>} orderBy
     */
    self.orderBy = ko.observable();
    self.sortOrder = ko.observable('DESC');

    /**
     * Sets the value of the cards
     * @param {object[]} val
     */
    self.setCards = function (val) {
        self.cards(val);
    };


    /**
     * Re-orders the cards (sets the order)
     * @param {object} params
     * @param {name} params.field - field to sort by
     * @param {string} [params.sortOrder='DESC'] - Either ASC for ascending or DESC for descending
     */
    self.orderCards = function(params) {
        var order = (params.sortOrder ? params.sortOrder : 'DESC');
        self.sortOrder(order);
        self.orderBy(params.field);

    };

    self.columnIcon = ko.pureComputed(function () {
       if (self.collapsed()) {
           return 'fa-plus fa';
       } else {
           return 'fa-minus fa';
       }
    });

    self.toggleCollapse = function() {
        var toggle = (self.collapsed() && self.collapsed() === true ? false: true);
        self.collapsed(toggle);
    };

    self.styleClass = ko.pureComputed(function () {
        if (self.collapsed()) {
            //commented out since broken
            //return 'collapsed';
        }else if (self.name() && self.name() === 'published') {
            return 'published';
        } else {
            return '';
        }
    });


};
