/* initialize test data */
if (!dexit) {
    var dexit = {};
}
dexit.test = {};

var theSC1 =
{
    "url": "http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f",
    "id": "bd35b5fc-5f15-49d9-9b10-0d508c98386f",
    "kind": "smartcontent#object",
    "property": {
        "name": "lecture 2",
        "class": "sc",
        "related_engagement_sc": "123",
        "type": "lecture"
    },
    "behaviour": [],
    "aevent": [],
    "presentation": [],
    "decision": [],
    "intelligence": [],
    "text": [],
    "textinput": [],
    "link": [],
    "audio": [],
    "image": [],
    "animation": [],
    "video": []
};
var theSC2 =
{
    "url": "http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f",
    "id": "bd35b5fc-5f15-49d9-9b10-0d508c98386f",
    "kind": "smartcontent#object",
    "property": {
        "name": "lecture 1",
        "class": "sc",
        "related_engagement_sc": "123"
    },
    "behaviour": [],
    "aevent": [],
    "presentation": [],
    "decision": [],
    "intelligence": [],
    "text": [],
    "textinput": [],
    "link": [],
    "audio": [],
    "image": [],
    "animation": [],
    "video": []
};
var theSC3 =
{
    "url": "http://scc.latest.dexit.co/repos/dev/smartcontent/object/bd35b5fc-5f15-49d9-9b10-0d508c98386f",
    "id": "bd35b5fc-5f15-49d9-9b10-0d508c98386f",
    "kind": "smartcontent#object",
    "property": {
        "name": "lecture 3",
        "class": "sc",
        "related_engagement_sc": "123"
    },
    "behaviour": [],
    "aevent": [],
    "presentation": [],
    "decision": [],
    "intelligence": [],
    "text": [],
    "textinput": [],
    "link": [],
    "audio": [],
    "image": [],
    "animation": [],
    "video": []
};

dexit.test.Widget = function () {
    this.sc = ko.observable(theSC1);
    this.ePatterns = ko.observableArray([{id: 'ep1', pattern: {start: '2016-01-19T16:37:28.051Z', end: '2018-01-19T16:37:28.051Z', element: [{type_id:'123'}]}}]);
    this.name = ko.observable(theSC1.property.name);
    this.isPatternActive = ko.observable(false);
    this.isTouchpointAdded = ko.observable();

};

dexit.test.Widget2 = function () {
    this.sc = ko.observable(theSC2);
    this.ePatterns = ko.observableArray([{id: 'ep1', pattern: {start: '2016-01-19T16:37:28.051Z', end: '2018-01-19T16:37:28.051Z', element: [{type_id:'123'}]}}]);
    this.name = ko.observable(theSC2.property.name);
    this.isPatternActive = ko.observable(false);
    this.isTouchpointAdded = ko.observable();

};

dexit.test.Widget3 = function () {
    this.sc = ko.observable(theSC3);
    this.ePatterns = ko.observableArray([{id: 'ep1', pattern: {start: '2016-01-19T16:37:28.051Z', end: '2018-01-19T16:37:28.051Z', element: [{type_id:'123'}]}}]);
    this.name = ko.observable(theSC3.property.name);
    this.isPatternActive = ko.observable(false);
    this.isTouchpointAdded = ko.observable();
};
