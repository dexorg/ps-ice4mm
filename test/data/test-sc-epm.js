/**
 * Copyright Digital Engagement Xperience 2017
 */
/* global dexit */


dexit.test.scForEPM = {
    'assignable': ['smartcontentcontainer', 'smartcontent'],
    'id': '2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
    'kind': 'smartcontent#object',
    'property': {
        'name': 'aa',
        'type': 'EngagementPlan',
        'epObject': '{"cells":[{"type":"epa.FlowConnector","source":{"id":"df529854-9768-4f49-86a2-460ebdfa1e79","selector":"g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)","port":"start"},"target":{"id":"2d45df1c-cf92-413b-984e-57f9e7d62277","port":"462c876a-3d84-426b-aeb3-b3f5dcebe704","selector":"g:nth-child(1) > g:nth-child(3) > circle:nth-child(1)"},"z":-1,"id":"63a64d6e-1399-498d-a548-908c1bc01bcd","attrs":{}},{"type":"epa.FlowConnector","source":{"id":"2d45df1c-cf92-413b-984e-57f9e7d62277","selector":"g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)","port":"d7718e9a-83e0-4dd8-a77b-b1eafa2acaf7"},"target":{"id":"bd1beb63-46a2-42e3-a5ec-968805ec01c1","port":"end","selector":"g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)"},"z":-1,"id":"534a8b93-3907-4ca4-b629-27b139a71280","attrs":{}},{"type":"epa.FlowConnector","source":{"id":"df529854-9768-4f49-86a2-460ebdfa1e79","selector":"g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)","port":"start"},"target":{"id":"9735d020-1db2-43d5-ad54-aa86b0e4c2e3","port":"1b67ea6e-f168-4d5d-89c1-a1ecc164de8c","selector":"g:nth-child(1) > g:nth-child(3) > circle:nth-child(1)"},"z":-1,"id":"8c42985d-c808-4f2b-b84e-e9b357cb36e1","attrs":{}},{"type":"epa.FlowConnector","source":{"id":"9735d020-1db2-43d5-ad54-aa86b0e4c2e3","selector":"g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)","port":"32e2817b-f08a-4e9c-b3fb-e9c27367153a"},"target":{"id":"bd1beb63-46a2-42e3-a5ec-968805ec01c1","port":"end","selector":"g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)"},"z":-1,"id":"ae826ccf-c6b6-405b-a931-086fdef82476","attrs":{}},{"size":{"width":8,"height":8},"type":"epa.StartElement","outPorts":["start"],"groups":{"start":{"attrs":{".port-body":{"fill":"#CCC"}}}},"inPorts":[],"ports":{"groups":{"in":{"position":{"name":"left"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}},"label":{"position":{"name":"left","args":{"y":10}}}},"out":{"position":{"name":"right"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}},"label":{"position":{"name":"right","args":{"y":10}}}}},"items":[{"id":"start","group":"out","attrs":{".port-label":{"text":"start"}}}]},"position":{"x":20,"y":245},"angle":0,"id":"df529854-9768-4f49-86a2-460ebdfa1e79","z":1,"attrs":{}},{"type":"epa.EndElement","size":{"width":8,"height":8},"inPorts":["end"],"groups":{"end":{"attrs":{".port-body":{"fill":"#CCC","magnet":"passive"}},"position":"left"}},"outPorts":[],"ports":{"groups":{"in":{"position":{"name":"left"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}},"label":{"position":{"name":"left","args":{"y":10}}}},"out":{"position":{"name":"right"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}},"label":{"position":{"name":"right","args":{"y":10}}}}},"items":[{"id":"end","group":"in","attrs":{".port-label":{"text":"end"}}}]},"position":{"x":1166,"y":245},"angle":0,"id":"bd1beb63-46a2-42e3-a5ec-968805ec01c1","z":2,"attrs":{}},{"type":"epa.HTMLElement","groups":{"in":{"attrs":{".port-body":{"fill":"#16A085","magnet":"passive","r":5}}},"out":{"attrs":{".port-body":{"fill":"#E74C3C","r":5}}}},"position":{"x":453,"y":201},"size":{"width":100,"height":64},"angle":0,"validComponent":false,"componentIndex":0,"elementType":"multimedia","renderType":"flex-image","imageCounter":1,"videoCounter":0,"textCounter":0,"linksCounter":0,"patternComponents":{"id":1,"type":"multimedia","layout":"<img src=\'https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg\' alt=\'element mm\' data-mm-tag=\'ep-1-mm-image-0\'>","inEvent":{"events":[]}},"multiMediaList":[{"type":"image","value":"https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg"}],"template":"\n    <div class=\'ep-item image html-element\'>\n        <img data-bind=\'attr: { src: $data.multiMediaList()[0].value() }\' alt=\'selected image\' src=\'https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg\'>\n        <div class=\'img-desc\' data-bind=\'text:$data.multiMediaList()[0].value().split(\'/\').pop()\'>Promotion2.jpg</div>\n    </div>\n","ports":{"groups":{"in":{"position":{"name":"left"},"attrs":{".port-body":{"magnet":"passive","r":6}}},"out":{"position":{"name":"right"},"attrs":{".port-body":{"r":6,"magnet":true}}}},"items":[{"label":{"position":{"name":"left","args":{}}},"group":"in","args":{},"attrs":{"text":{"text":"in"},"circle":{"magnet":"passive","r":6}},"id":"462c876a-3d84-426b-aeb3-b3f5dcebe704"},{"magnet":true,"label":{"position":{"name":"right","args":{}}},"group":"out","args":{},"attrs":{"text":{"text":"out"},"circle":{"magnet":true,"r":6}},"id":"d7718e9a-83e0-4dd8-a77b-b1eafa2acaf7"}]},"id":"2d45df1c-cf92-413b-984e-57f9e7d62277","z":3,"attrs":{}},{"type":"epa.HTMLElement","groups":{"in":{"attrs":{".port-body":{"fill":"#16A085","magnet":"passive","r":5}}},"out":{"attrs":{".port-body":{"fill":"#E74C3C","r":5}}}},"position":{"x":435,"y":78},"size":{"width":100,"height":64},"angle":0,"validComponent":false,"componentIndex":0,"elementType":"multimedia","renderType":"flex-text","imageCounter":0,"videoCounter":0,"textCounter":1,"linksCounter":0,"patternComponents":{"id":1,"type":"multimedia","layout":"<textarea data-type=\'text\' data-mm-tag=\'ep-1-mm-text-0\'>aaaa</textarea>","inEvent":{"events":[]}},"multiMediaList":[{"type":"text","value":"aaaa"}],"template":"\n    <div style=\'position: absolute; top: 10px; left: 340px\' class=\'ep-item multimedia draggable-item html-element\'>\n        <div class=\'ep-edit\'><i class=\'fa fa-pencil\' data-bind=\'click: dpa_VM.editEntry\'></i></div>\n        <i class=\'fa fa-font\' aria-hidden=\'true\'></i>\n        <div data-bind=\'text:  $data.multiMediaList()[0].value().substring(0, 15) + \'...\'\'>aaaa...</div>\n        <div class=\'connect top\'></div>\n        <div class=\'connect right\'></div>\n        <div class=\'connect left\'></div>\n        <div class=\'connect bottom\'></div>\n    </div>\n\n","ports":{"groups":{"in":{"position":{"name":"left"},"attrs":{".port-body":{"magnet":"passive","r":6}}},"out":{"position":{"name":"right"},"attrs":{".port-body":{"r":6,"magnet":true}}}},"items":[{"label":{"position":{"name":"left","args":{}}},"group":"in","args":{},"attrs":{"text":{"text":"in"},"circle":{"magnet":"passive","r":6}},"id":"1b67ea6e-f168-4d5d-89c1-a1ecc164de8c"},{"magnet":true,"label":{"position":{"name":"right","args":{}}},"group":"out","args":{},"attrs":{"text":{"text":"out"},"circle":{"magnet":true,"r":6}},"id":"32e2817b-f08a-4e9c-b3fb-e9c27367153a"}]},"id":"9735d020-1db2-43d5-ad54-aa86b0e4c2e3","z":4,"attrs":{}}]}',
        'decObject': 'null',
        'referredIntelligence': '[]',
        'date': '2017-12-01T17:07:10.197Z',
        'date_modified': '2017-12-01T17:07:10.197Z',
        'version': '0a6c77e4-29d8-4611-a6df-ee722641b539',
        'touchpoints': ['46261b44-cce1-42c9-b806-9c3db01dfc27-2']
    },
    'behaviour': [{
        'scope': 'system',
        'id': 'system_behaviour_create_schedule',
        'kind': 'smartcontent#behaviour',
        'property': {
            'args': '',
            'context': '',
            'type': 'service',
            'action': 'POST',
            'method': 'POST',
            'name': 'Create Schedule',
            'header': {
                'Content-Type': 'application/json'
            },
            'body': 'null',
            'location': '02a86726-532c-428b-9648-2390ee3124ec',
            'path_template': '/schedule'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_update_schedule',
        'kind': 'smartcontent#behaviour',
        'property': {
            'args': '',
            'context': '',
            'type': 'service',
            'action': 'PUT',
            'method': 'PUT',
            'name': 'Update Schedule',
            'header': {
                'Content-Type': 'application/json'
            },
            'body': 'null',
            'location': '02a86726-532c-428b-9648-2390ee3124ec',
            'path_template': '/schedule/:id'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_delete_schedule',
        'kind': 'smartcontent#behaviour',
        'property': {
            'args': '',
            'context': '',
            'type': 'service',
            'action': 'DELETE',
            'method': 'DELETE',
            'name': 'Delete Schedule',
            'header': {
                'accept': 'application/json'
            },
            'body': 'null',
            'location': '02a86726-532c-428b-9648-2390ee3124ec',
            'path_template': '/schedule/:id'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_retrieve_schedule',
        'kind': 'smartcontent#behaviour',
        'property': {
            'args': '',
            'context': '',
            'type': 'service',
            'action': 'GET',
            'method': 'GET',
            'name': 'Retrieve Schedule',
            'header': {
                'accept': 'application/json'
            },
            'body': 'null',
            'location': '02a86726-532c-428b-9648-2390ee3124ec',
            'path_template': '/schedule/:id'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_create_monitor',
        'kind': 'smartcontent#behaviour',
        'property': {
            'args': ['config'],
            'context': 'Device',
            'type': 'function',
            'name': 'createMonitor',
            'action': 'createMonitor',
            'location': 'dexit.scp.device.monitor'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_retrieve_feedback',
        'kind': 'smartcontent#behaviour',
        'property': {
            'args': [':channel=user', ':post_id={persistence(:scheduleId,:channel).data.data.id}'],
            'context': '',
            'type': 'service',
            'action': 'POST',
            'method': 'POST',
            'name': 'Retrieve Feedback',
            'header': {
                'Content-Type': 'application/json'
            },
            'body': '{ "postId":":post_id", "channel":{"id":":channel"} }',
            'location': 'retrieve_feedback',
            'path_template': '/'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_retrieve_feedback_aggregated',
        'kind': 'smartcontent#behaviour',
        'property': {
            'args': '',
            'context': '',
            'type': 'service',
            'action': 'POST',
            'method': 'POST',
            'name': 'Retrieve Feedback',
            'header': {
                'Content-Type': 'application/json'
            },
            'body': 'null',
            'location': 'retrieve_feedback_aggregated',
            'path_template': '/'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_text_feedback',
        'kind': 'smartcontent#behaviour',
        'property': {
            'name': 'textFeedback',
            'identity': '',
            'type': 'service',
            'action': '',
            'args': ['question'],
            'location': '38f81149-9f41-4587-8ea2-82af69de9bba',
            'context': 'Device'
        }
    }, {
        'scope': 'system',
        'id': 'system_behaviour_multiple_choice_feedback',
        'kind': 'smartcontent#behaviour',
        'property': {
            'name': 'multipleChoiceFeedback',
            'identity': '',
            'args': ['questions'],
            'type': 'service',
            'action': '',
            'location': '38f81149-9f41-4587-8ea2-82af69de9bba',
            'context': 'Device'
        }
    }],
    'aevent': [],
    'layout': [],
    'decision': [],
    'intelligence': [{
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/f81ef825-79b0-46a2-bc9a-2ce021856c2a',
        'id': 'f81ef825-79b0-46a2-bc9a-2ce021856c2a',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '252',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.199Z',
            'date_modified': '2017-12-01T17:07:11.199Z',
            'version': 'b1a86c95-fc0a-42f7-aeb6-71607a5fc24e',
            'definition': {
                'metricId': '252',
                'metricName': 'total_recharge_count_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for erecharge',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select count(*) as metric_value from erecharge_transaction WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': []
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/13073e21-4ffb-4ce6-9d49-56de317b5102',
        'id': '13073e21-4ffb-4ce6-9d49-56de317b5102',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '152',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.193Z',
            'date_modified': '2017-12-01T17:07:11.193Z',
            'version': '777d0141-a918-46e2-91d6-820db32634ee',
            'definition': {
                'metricId': '152',
                'metricName': 'average_commission_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for eorder',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select (FLOOR(AVG(commission_rate))) as metric_value  from order_wholesale WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': []
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/32f6d9a6-d06e-4765-90eb-9f3367c23408',
        'id': '32f6d9a6-d06e-4765-90eb-9f3367c23408',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '162',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.188Z',
            'date_modified': '2017-12-01T17:07:11.188Z',
            'version': '5ccbecc5-7b27-4c65-b088-736ddb25df3f',
            'definition': {
                'metricId': '162',
                'metricName': 'total_orders_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for eorder',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select count(transaction_charge) as metric_value from order_wholesale WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': ['4']
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/99009824-9346-4c67-bc72-a80dc34d398b',
        'id': '99009824-9346-4c67-bc72-a80dc34d398b',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '272',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.173Z',
            'date_modified': '2017-12-01T17:07:11.173Z',
            'version': 'b62eae77-761f-4e0c-8516-37cf93e3f2c1',
            'definition': {
                'metricId': '272',
                'metricName': 'total_recharge_users_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for erecharge',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select COUNT(DISTINCT subscriber) as metric_value from erecharge_transaction WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': []
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/fd3e3b3b-960c-41b5-a84f-deef5a37c2a5',
        'id': 'fd3e3b3b-960c-41b5-a84f-deef5a37c2a5',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '262',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.186Z',
            'date_modified': '2017-12-01T17:07:11.186Z',
            'version': 'c956a710-e0b0-42f9-b861-f415f9833c4f',
            'definition': {
                'metricId': '262',
                'metricName': 'total_recharge_amount_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for erecharge',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select SUM(transaction_charge) as metric_value from erecharge_transaction WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': []
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/0eb247b2-a156-434f-84ae-9ec167309eb1',
        'id': '0eb247b2-a156-434f-84ae-9ec167309eb1',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '172',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.176Z',
            'date_modified': '2017-12-01T17:07:11.176Z',
            'version': 'd8cdca12-3203-42c6-81b9-a6b6aab4d451',
            'definition': {
                'metricId': '172',
                'metricName': 'total_dollars_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for eorder',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select SUM(transaction_charge) as metric_value from order_wholesale WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': []
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/bb088367-8d2f-47da-bebb-e8e9d61a6874',
        'id': 'bb088367-8d2f-47da-bebb-e8e9d61a6874',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '232',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.196Z',
            'date_modified': '2017-12-01T17:07:11.196Z',
            'version': 'ea33bb3d-5ee5-41e4-a897-6b4c0f2d12a3',
            'definition': {
                'metricId': '232',
                'metricName': 'total_dealers_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for evoucher',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select DISTINCT(count(dealer)) as metric_value from erecharge_retailer WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': ['2']
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/d213ac87-5435-48b2-a1dd-4fbaad5feb4b',
        'id': 'd213ac87-5435-48b2-a1dd-4fbaad5feb4b',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '222',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.168Z',
            'date_modified': '2017-12-01T17:07:11.168Z',
            'version': '7a770802-338c-4f43-bfdf-7a05c863f07e',
            'definition': {
                'metricId': '222',
                'metricName': 'total_dollars_retail_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for evoucher',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select SUM(transaction_charge) as metric_value from erecharge_retailer WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': ['2']
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/dexitco/intelligence/engagementmetric/ccacccc1-e4aa-4f8c-84c6-2c7d4122cb40',
        'id': 'ccacccc1-e4aa-4f8c-84c6-2c7d4122cb40',
        'kind': 'intelligence#engagementmetric',
        'property': {
            'isAssignedTo': 'http://dexit.co/smartcontent/2e0c8e39-a7e4-40dd-9999-30b48d00dcc9',
            'location': '212',
            'isEngagementMetric': 'true',
            'date': '2017-12-01T17:07:11.205Z',
            'date_modified': '2017-12-01T17:07:11.205Z',
            'version': '566a43a1-c995-4b41-ac61-5d42a87d21c5',
            'definition': {
                'metricId': '212',
                'metricName': 'total_orders_processed_per_pattern',
                'metricType': 'number',
                'metricDesc': 'number - for evoucher',
                'metricDefinition': 'count',
                'metricDefinitionDetail': {
                    'retrieval': 'query',
                    'options': {
                        'datastore': 'simulator_erecharge',
                        'query': 'Select count(*) as metric_value from erecharge_retailer WHERE reference_id=?',
                        'queryParams': ['{{bcInstanceId}}']
                    }
                },
                'modifiedTime': '2017-01-14 18:03:08.0',
                'createdTime': null,
                'eptIds': ['2']
            }
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/{repoName}/intelligence/concept/persistence',
        'id': 'persistence',
        'kind': 'intelligence#concept',
        'property': {
            'location': 'persistence',
            'name': 'persistence',
            'type': 'system'
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/{repoName}/intelligence/concept/touchpoint',
        'id': 'touchpoint',
        'kind': 'intelligence#concept',
        'property': {
            'location': 'touchpoint',
            'name': 'touchpoint',
            'type': 'system'
        }
    }, {
        'url': 'http://scc.latest.dexit.co/repos/{repoName}/intelligence/concept/location',
        'id': 'location',
        'kind': 'intelligence#concept',
        'property': {
            'location': 'location',
            'name': 'location',
            'type': 'system'
        }
    }],
    'text': [],
    'textinput': [],
    'link': [],
    'audio': [],
    'image': [],
    'animation': [],
    'video': [],
    'bcRelationships': [],
    'entityRelationships': []
};
