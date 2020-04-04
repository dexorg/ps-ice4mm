/**
 * Created by ali on 13/12/15.
 */
/* global dexit */

dexit.testEP = {
    'id': '7a1ebb39-cb7e-4933-9977-159402f868e5',
    'name': 'ep-klondike-template',
    'start': 'start',
    'end': 'end',
    'element': [
        {
            'id': '1',
            'type': 'multimedia',
            'type_id':'',
            'args': {},
            'label': 'start multimedia'
        },
        {
            'id': '2',
            'type': 'behaviour',
            'type_id':'',
            'args': {},
            'label': 'sample behaviour'
        },
        {
            'id': '3',
            'type': 'intelligence',
            'type_id':'',
            'args': {},
            'label': 'external service intelligence'
        },
        {
            'id': '4',
            'type': 'decision',
            'type_id':[],
            'args': {},
            'label': 'sample decision'
        },
        {
            'id': '5',
            'type': 'multimedia',
            'type_id':'',
            'args': {},
            'label': 'sample multimedia'
        },
        {
            'id': '6',
            'type': 'multimedia',
            'type_id':'',
            'args': {},
            'label': 'sample multimedia'
        }
    ],
    'connection': [
        {
            'name': 'start',
            'from': '',
            'to': '1',
            'type':'flow',
            'properties': {
                'wait':''
            }
        },
        {
            'name': 'first',
            'from': '1',
            'to': '2',
            'type':'flow',
            'properties': {
                'wait':''
            }
        },
        {
            'name': 'second',
            'from': '2',
            'to': '3',
            'type':'flow',
            'properties': {
                'wait':''
            }
        },
        {
            'name': 'third',
            'from': '3',
            'to': '4',
            'type':'flow',
            'properties': {
                'wait':''
            }
        },
        {
            'name': 'forth',
            'from': '4',
            'to': '5',
            'type':'flow',
            'properties': {
                'wait':''
            }
        },
        {
            'name': 'fifth',
            'from': '4',
            'to': '6',
            'type':'flow',
            'properties': {
                'wait':''
            }
        },
        {
            'name': 'sixth',
            'from': '5',
            'to': 'end',
            'type':'flow',
            'properties': {
                'wait':''
            }
        },
        {
            'name': 'seventh',
            'from': '6',
            'to': 'end',
            'type':'flow',
            'properties': {
                'wait':''
            }
        }
    ]
};


dexit.testEPWithFlow = {
    'id': '111112',
    'isActive':true,
    'isStarted':false,
    'pattern': {
        'id':'7a1ebb39-cb7e-4933-9977-159402f868e5',
        'name': 'ep-intel1',
        'start': 'now',
        'end': '2015-12-14T15:06:18.787Z',
        'touchpoints': ['246dd59d-ff8e-4368-b2c9-3241d5d985fd'],
        'element': [
            {
                'id': '1',
                'type': 'multimedia',
                'type_id': 'sc:85fd8c80-9d2c-4f70-aef2-0c25419db5c0:layout:85fd8c80-9d2c-4f70-aef2-0c25419db5c0',
                'args': {},
                'label': 'start multimedia'
            },
            {
                'id': '2',
                'type': 'behaviour',
                'type_id': 'sc:85fd8c80-9d2c-4f70-aef2-0c25419db5c0:behaviour:1dfd8c80-9d2c-4f70-aef2-0c25419db5aa',
                'args': {},
                'label': 'sample behaviour'
            },
            {
                'id': '2-intel',
                'args': {},
                'type': 'intelligence',
                'type_id': 'sc:85fd8c80-9d2c-4f70-aef2-0c25419db5c0:intelligence:as1fd82e1-ad2d-4f70-aef2-0c25139db5aa',
                'label': 'external service intelligence'
            }
        ],
        'connection': [
            {
                'name': 'a',
                'from': 'first',
                'to': '1',
                'type': 'flow'
            },
            {
                'name': 'a',
                'from': 'first',
                'to': '2',
                'type': 'flow',
                'properties': {
                    'wait': '5min'
                }
            },
            {
                'name': 'b',
                'from': '2-intel',
                'to': '2',
                'type': 'link',
                'properties': {
                    'wait': '5min'
                }
            },
            {
                'name': 'c',
                'from': '2',
                'to': 'end',
                'type': 'flow',
                'properties': {
                }
            }
        ]
    }
};
