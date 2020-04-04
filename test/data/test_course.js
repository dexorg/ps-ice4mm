
var theContainer = {
    assignable: [
        'smartcontentcontainer',
        'smartcontent'
    ],
    url: 'http://scc.latest.dexit.co/repos/dev/smartcontent/container/59d4063f-0c81-4670-be9b-3ff002aea000',
    id: '59d4063f-0c81-4670-be9b-3ff002aea000',
    kind: 'smartcontent#container',
    property: {
        class: 'User defined',
        name: 'User Business Concept Container',
        code: 'cs1',
        description: 'description',
        touchpoints: [],
        mmTag: 'tag'
    },
    smartcontentobject: [
        {
            assignable: [
                'smartcontentcontainer',
                'smartcontent'
            ],
            url: 'http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f',
            id: 'bd35b5fc-5f15-49d9-9b10-0d508c98386f',
            kind: 'smartcontent#object',
            property: {
                class: 'service',
                name: 'test1'
            }
        },
        {
            assignable: [
                'smartcontentcontainer',
                'smartcontent'
            ],
            url: 'http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f',
            id: 'bd35b5fc-5f15-49d9-9b10-0d508c98386f',
            kind: 'smartcontent#object',
            property: {
                class: 'service',
                name: 'test2'
            }
        },
        {
            assignable: [
                'smartcontentcontainer',
                'smartcontent'
            ],
            url: 'http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f',
            id: 'bd35b5fc-5f15-49d9-9b10-0d508c98386f',
            kind: 'smartcontent#object',
            property: {
                class: 'service',
                name: 'test3'
            }
        }
    ]
};
dexit.test.Course = function () {
    this.container = theContainer;
    this.businessConceptInstance = theContainer;
    this.groupID = ko.observableArray([]);
    this.groupsOfACourse = ko.observableArray([]);
    this.tpm = ko.observableArray([]);
    this.selectedMMType = ko.observable('image');
    this.selectedSCType = ko.observable('lecture');
    var widget1 = new dexit.test.Widget();
    var widget2 = new dexit.test.Widget2();
    var widget3 = new dexit.test.Widget3();
    this.widgets = ko.observableArray([widget1, widget2, widget3]);
    this.creatingNewWidget = function() {};
    this.reloadMultimediaForBC = function() {};
    this.chosenTouchpoints = ko.observableArray([]);
    this.handleChosenTouchpoints = function() {};
    this.retrieveTouchpointsDetailsOfBCi = function() {};
    this.alltps = ko.observableArray([]);
    this.associatedSegments = ko.observable();
    this.availableLayouts = ko.observableArray([{
        tp:'1111',
        layoutId:'seservice',
        thumbnail: 'http://resource.dexit.co/images/layout/bcc-seservice.png',
        layoutRegions: {
            'a': 'Main left',
            'b': 'Main Right'
        }
    }]);
    this.selectedLayout = ko.observable({
        tp:'1111',
        layoutId:'seservice',
        thumbnail: 'http://resource.dexit.co/images/layout/bcc-seservice.png',
        layoutRegions: {
            'a': 'Main left',
            'b': 'Main Right'
        }
    });

};
