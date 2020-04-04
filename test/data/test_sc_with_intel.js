/* initialize test data */
if (!dexit) {
    var dexit = {};
}
if(!dexit.test) {
    dexit.test = {};
}

dexit.test.smartcontent_with_intel = {
    "assignable": [
        "smartcontentcontainer",
        "smartcontent"
    ],
    "url": "http://scc.latest.dexit.co/repos/anucedugh/smartcontent/object/220816a5-49dc-490f-9598-6bd7cc4465cc",
    "id": "220816a5-49dc-490f-9598-6bd7cc4465cc",
    "kind": "smartcontent#object",
    "property": {
        "version": "76922120-edd0-413b-b9d3-a6ec8a8c0c1a",
        "description": "this report shows the list of courses within a school",
        "type": "registered_students_in_department",
        "class": "report",
        "name": "LOCAL_1210_A"
    },
    "behaviour": [
        {
            "scope": "user",
            "url": "http://scc.latest.dexit.co/repos/anucedugh/behaviour/5358d274-5bbc-4e5c-8214-b90a487193dd",
            "id": "5358d274-5bbc-4e5c-8214-b90a487193dd",
            "kind": "smartcontent#behaviour",
            "property": {
                "isAssignedTo": "http://dexit.co/smartcontent/220816a5-49dc-490f-9598-6bd7cc4465cc",
                "args": "",
                "context": "cloud",
                "type": "service",
                "action": "POST",
                "method": "POST",
                "name": "Retrieve Report with params",
                "body": "",
                "location": "219f6afb-aa6c-45a7-83be-f061a34f9ae1",
                "path_template": "/:name",
                "version": "d42fa882-81b0-4dd6-adf6-74240d63afba"
            }
        },
        {
            "scope": "user",
            "url": "http://scc.latest.dexit.co/repos/anucedugh/behaviour/cef0e4cd-ac56-463b-8dc6-e6a0d6c28ab6",
            "id": "cef0e4cd-ac56-463b-8dc6-e6a0d6c28ab6",
            "kind": "smartcontent#behaviour",
            "property": {
                "isAssignedTo": "http://dexit.co/smartcontent/220816a5-49dc-490f-9598-6bd7cc4465cc",
                "args": "",
                "context": "cloud",
                "type": "service",
                "action": "GET",
                "method": "GET",
                "name": "List Reports",
                "header": "[object Object]",
                "body": "",
                "location": "219f6afb-aa6c-45a7-83be-f061a34f9ae1",
                "path_template": "/",
                "version": "41623868-165c-45d9-a5eb-73ccf02545b1"
            }
        },
        {
            "scope": "user",
            "url": "http://scc.latest.dexit.co/repos/anucedugh/behaviour/91281b2e-3b0a-40b0-888c-100300374bc8",
            "id": "91281b2e-3b0a-40b0-888c-100300374bc8",
            "kind": "smartcontent#behaviour",
            "property": {
                "isAssignedTo": "http://dexit.co/smartcontent/220816a5-49dc-490f-9598-6bd7cc4465cc",
                "args": "",
                "context": "cloud",
                "type": "service",
                "action": "GET",
                "method": "GET",
                "name": "Retrieve Report",
                "header": "[object Object]",
                "body": "",
                "location": "219f6afb-aa6c-45a7-83be-f061a34f9ae1",
                "path_template": "/:name",
                "version": "f1425c5c-957a-475d-914b-2965a2498414"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_create_schedule",
            "kind": "smartcontent#behaviour",
            "property": {
                "args": "",
                "context": "",
                "type": "service",
                "action": "POST",
                "method": "POST",
                "name": "Create Schedule",
                "header": {
                    "Content-Type": "application/json"
                },
                "body": "null",
                "location": "02a86726-532c-428b-9648-2390ee3124ec",
                "path_template": "/schedule"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_update_schedule",
            "kind": "smartcontent#behaviour",
            "property": {
                "args": "",
                "context": "",
                "type": "service",
                "action": "PUT",
                "method": "PUT",
                "name": "Update Schedule",
                "header": {
                    "Content-Type": "application/json"
                },
                "body": "null",
                "location": "02a86726-532c-428b-9648-2390ee3124ec",
                "path_template": "/schedule/:id"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_delete_schedule",
            "kind": "smartcontent#behaviour",
            "property": {
                "args": "",
                "context": "",
                "type": "service",
                "action": "DELETE",
                "method": "DELETE",
                "name": "Delete Schedule",
                "header": {
                    "accept": "application/json"
                },
                "body": "null",
                "location": "02a86726-532c-428b-9648-2390ee3124ec",
                "path_template": "/schedule/:id"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_retrieve_schedule",
            "kind": "smartcontent#behaviour",
            "property": {
                "args": "",
                "context": "",
                "type": "service",
                "action": "GET",
                "method": "GET",
                "name": "Retrieve Schedule",
                "header": {
                    "accept": "application/json"
                },
                "body": "null",
                "location": "02a86726-532c-428b-9648-2390ee3124ec",
                "path_template": "/schedule/:id"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_create_monitor",
            "kind": "smartcontent#behaviour",
            "property": {
                "args": [
                    "config"
                ],
                "context": "Device",
                "type": "function",
                "name": "createMonitor",
                "action": "createMonitor",
                "location": "dexit.scp.device.monitor"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_retrieve_feedback",
            "kind": "smartcontent#behaviour",
            "property": {
                "args": [
                    ":channel=user",
                    ":post_id={persistence(:scheduleId,:channel).data.data.id}"
                ],
                "context": "",
                "type": "service",
                "action": "POST",
                "method": "POST",
                "name": "Retrieve Feedback",
                "header": {
                    "Content-Type": "application/json"
                },
                "body": "{ \"postId\":\":post_id\", \"channel\":{\"id\":\":channel\"} }",
                "location": "retrieve_feedback",
                "path_template": "/"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_retrieve_feedback_aggregated",
            "kind": "smartcontent#behaviour",
            "property": {
                "args": "",
                "context": "",
                "type": "service",
                "action": "POST",
                "method": "POST",
                "name": "Retrieve Feedback",
                "header": {
                    "Content-Type": "application/json"
                },
                "body": "null",
                "location": "retrieve_feedback_aggregated",
                "path_template": "/"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_text_feedback",
            "kind": "smartcontent#behaviour",
            "property": {
                "name": "textFeedback",
                "identity": "",
                "type": "service",
                "action": "",
                "args": [
                    "question"
                ],
                "location": "38f81149-9f41-4587-8ea2-82af69de9bba",
                "context": "Device"
            }
        },
        {
            "scope": "system",
            "id": "system_behaviour_multiple_choice_feedback",
            "kind": "smartcontent#behaviour",
            "property": {
                "name": "multipleChoiceFeedback",
                "identity": "",
                "args": [
                    "questions"
                ],
                "type": "service",
                "action": "",
                "location": "38f81149-9f41-4587-8ea2-82af69de9bba",
                "context": "Device"
            }
        }
    ],
    "aevent": [],
    "layout": [],
    "decision": [],
    "intelligence": [
        {
            "assignable": [
                "smartcontentcontainer",
                "smartcontentobject",
                "concept"
            ],
            "url": "http://scc.latest.dexit.co/repos/anucedugh/intelligence/concept/f79ff72e-34a3-486d-bb4f-992a2135b5a7",
            "id": "f79ff72e-34a3-486d-bb4f-992a2135b5a7",
            "kind": "intelligence#concept",
            "property": {
                "isAssignedTo": "http://dexit.co/smartcontent/220816a5-49dc-490f-9598-6bd7cc4465cc",
                "name": "student",
                "location": "datastore:test_db_ah",
                "version": "36b735d8-b8f3-40bb-9c5f-8489fce357cb"
            },
            "concept": [],
            "information": [
                {
                    "url": "http://scc.latest.dexit.co/repos/anucedugh/intelligence/information/93410a1e-1086-4486-9b47-45d3311b1957",
                    "id": "93410a1e-1086-4486-9b47-45d3311b1957",
                    "kind": "intelligence#information",
                    "property": {
                        "isAssignedTo": "http://dexit.co/smartcontent/intelligence/f79ff72e-34a3-486d-bb4f-992a2135b5a7",
                        "name": "school_id",
                        "validation": "",
                        "type": "xsd:string",
                        "report_option_idx": "0",
                        "value": "2",
                        "isKey": "false",
                        "version": "afc883f3-99ad-4102-a416-bd2b3156e668"
                    }
                },
                {
                    "url": "http://scc.latest.dexit.co/repos/anucedugh/intelligence/information/74b63efe-aba6-4476-a6e6-6e2113e548cb",
                    "id": "74b63efe-aba6-4476-a6e6-6e2113e548cb",
                    "kind": "intelligence#information",
                    "property": {
                        "isAssignedTo": "http://dexit.co/smartcontent/intelligence/f79ff72e-34a3-486d-bb4f-992a2135b5a7",
                        "name": "department_id",
                        "validation": "",
                        "type": "xsd:string",
                        "report_option_idx": "1",
                        "value": "2",
                        "isKey": "true",
                        "version": "e847a2c6-b8ed-4c08-ab65-ab10e0e5884c"
                    }
                }
            ]
        },
        {
            "url": "http://scc.latest.dexit.co/repos/{repoName}/intelligence/concept/persistence",
            "id": "persistence",
            "kind": "intelligence#concept",
            "property": {
                "location": "persistence",
                "name": "persistence",
                "type": "system"
            }
        },
        {
            "url": "http://scc.latest.dexit.co/repos/{repoName}/intelligence/concept/touchpoint",
            "id": "touchpoint",
            "kind": "intelligence#concept",
            "property": {
                "location": "touchpoint",
                "name": "touchpoint",
                "type": "system"
            }
        },
        {
            "url": "http://scc.latest.dexit.co/repos/{repoName}/intelligence/concept/touchpoint",
            "id": "location",
            "kind": "intelligence#concept",
            "property": {
                "location": "location",
                "name": "location",
                "type": "system"
            }
        }
    ],
    "text": [],
    "textinput": [],
    "link": [],
    "audio": [],
    "image": [],
    "animation": [],
    "video": []
}

