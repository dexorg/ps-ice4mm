/**
 * Copyright Digital Engagement Xperience 2017
 */
/* global dexit */

dexit.test.jointjs = {};

dexit.test.jointjs.withImageAndText = {
    'cells': [{
        'type': 'epa.FlowConnector',
        'source': {
            'id': 'df529854-9768-4f49-86a2-460ebdfa1e79',
            'selector': 'g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)',
            'port': 'start'
        },
        'target': {
            'id': '2d45df1c-cf92-413b-984e-57f9e7d62277',
            'port': '462c876a-3d84-426b-aeb3-b3f5dcebe704',
            'selector': 'g:nth-child(1) > g:nth-child(3) > circle:nth-child(1)'
        },
        'z': -1,
        'id': '63a64d6e-1399-498d-a548-908c1bc01bcd',
        'attrs': {}
    }, {
        'type': 'epa.FlowConnector',
        'source': {
            'id': '2d45df1c-cf92-413b-984e-57f9e7d62277',
            'selector': 'g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)',
            'port': 'd7718e9a-83e0-4dd8-a77b-b1eafa2acaf7'
        },
        'target': {
            'id': 'bd1beb63-46a2-42e3-a5ec-968805ec01c1',
            'port': 'end',
            'selector': 'g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)'
        },
        'z': -1,
        'id': '534a8b93-3907-4ca4-b629-27b139a71280',
        'attrs': {}
    }, {
        'type': 'epa.FlowConnector',
        'source': {
            'id': 'df529854-9768-4f49-86a2-460ebdfa1e79',
            'selector': 'g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)',
            'port': 'start'
        },
        'target': {
            'id': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
            'port': '1b67ea6e-f168-4d5d-89c1-a1ecc164de8c',
            'selector': 'g:nth-child(1) > g:nth-child(3) > circle:nth-child(1)'
        },
        'z': -1,
        'id': '8c42985d-c808-4f2b-b84e-e9b357cb36e1',
        'attrs': {}
    }, {
        'type': 'epa.FlowConnector',
        'source': {
            'id': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
            'selector': 'g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)',
            'port': '32e2817b-f08a-4e9c-b3fb-e9c27367153a'
        },
        'target': {
            'id': 'bd1beb63-46a2-42e3-a5ec-968805ec01c1',
            'port': 'end',
            'selector': 'g:nth-child(1) > g:nth-child(4) > circle:nth-child(1)'
        },
        'z': -1,
        'id': 'ae826ccf-c6b6-405b-a931-086fdef82476',
        'attrs': {}
    }, {
        'size': {'width': 8, 'height': 8},
        'type': 'epa.StartElement',
        'outPorts': ['start'],
        'groups': {'start': {'attrs': {'.port-body': {'fill': '#CCC'}}}},
        'inPorts': [],
        'ports': {
            'groups': {
                'in': {
                    'position': {'name': 'left'},
                    'attrs': {
                        '.port-label': {'fill': '#000'},
                        '.port-body': {'fill': '#fff', 'stroke': '#000', 'r': 10, 'magnet': true}
                    },
                    'label': {'position': {'name': 'left', 'args': {'y': 10}}}
                },
                'out': {
                    'position': {'name': 'right'},
                    'attrs': {
                        '.port-label': {'fill': '#000'},
                        '.port-body': {'fill': '#fff', 'stroke': '#000', 'r': 10, 'magnet': true}
                    },
                    'label': {'position': {'name': 'right', 'args': {'y': 10}}}
                }
            }, 'items': [{'id': 'start', 'group': 'out', 'attrs': {'.port-label': {'text': 'start'}}}]
        },
        'position': {'x': 20, 'y': 245},
        'angle': 0,
        'id': 'df529854-9768-4f49-86a2-460ebdfa1e79',
        'z': 1,
        'attrs': {}
    }, {
        'type': 'epa.EndElement',
        'size': {'width': 8, 'height': 8},
        'inPorts': ['end'],
        'groups': {'end': {'attrs': {'.port-body': {'fill': '#CCC', 'magnet': 'passive'}}, 'position': 'left'}},
        'outPorts': [],
        'ports': {
            'groups': {
                'in': {
                    'position': {'name': 'left'},
                    'attrs': {
                        '.port-label': {'fill': '#000'},
                        '.port-body': {'fill': '#fff', 'stroke': '#000', 'r': 10, 'magnet': true}
                    },
                    'label': {'position': {'name': 'left', 'args': {'y': 10}}}
                },
                'out': {
                    'position': {'name': 'right'},
                    'attrs': {
                        '.port-label': {'fill': '#000'},
                        '.port-body': {'fill': '#fff', 'stroke': '#000', 'r': 10, 'magnet': true}
                    },
                    'label': {'position': {'name': 'right', 'args': {'y': 10}}}
                }
            }, 'items': [{'id': 'end', 'group': 'in', 'attrs': {'.port-label': {'text': 'end'}}}]
        },
        'position': {'x': 1166, 'y': 245},
        'angle': 0,
        'id': 'bd1beb63-46a2-42e3-a5ec-968805ec01c1',
        'z': 2,
        'attrs': {}
    }, {
        'type': 'epa.HTMLElement',
        'groups': {
            'in': {'attrs': {'.port-body': {'fill': '#16A085', 'magnet': 'passive', 'r': 5}}},
            'out': {'attrs': {'.port-body': {'fill': '#E74C3C', 'r': 5}}}
        },
        'position': {'x': 453, 'y': 201},
        'size': {'width': 100, 'height': 64},
        'angle': 0,
        'componentIndex': 0,
        'elementType': 'multimedia',
        'renderType': 'flex-image',
        'imageCounter': 1,
        'videoCounter': 0,
        'textCounter': 0,
        'linksCounter': 0,
        'patternComponents': {
            'id': 1,
            'type': 'multimedia',
            'layout': '<img src=\'https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg\' alt=\'element mm\' data-mm-tag=\'ep-1-mm-image-0\'>',
            'inEvent': {'events': []}
        },
        'template': '\n    <div class="ep-item image html-element">\n        <img data-bind="attr: { src: $data.multiMediaList()[0].value() }" alt="selected image" src="https://s3.amazonaws.com/tenant.dexitco.dexit.co/Promotion2.jpg">\n        <div class="img-desc" data-bind="text:$data.multiMediaList()[0].value().split(\'/\').pop()">Promotion2.jpg</div>\n    </div>\n',
        'ports': {
            'groups': {
                'in': {
                    'position': {'name': 'left'},
                    'attrs': {'.port-body': {'magnet': 'passive', 'r': 6}}
                }, 'out': {'position': {'name': 'right'}, 'attrs': {'.port-body': {'r': 6, 'magnet': true}}}
            },
            'items': [{
                'label': {'position': {'name': 'left', 'args': {}}},
                'group': 'in',
                'args': {},
                'attrs': {'text': {'text': 'in'}, 'circle': {'magnet': 'passive', 'r': 6}},
                'id': '462c876a-3d84-426b-aeb3-b3f5dcebe704'
            }, {
                'magnet': true,
                'label': {'position': {'name': 'right', 'args': {}}},
                'group': 'out',
                'args': {},
                'attrs': {'text': {'text': 'out'}, 'circle': {'magnet': true, 'r': 6}},
                'id': 'd7718e9a-83e0-4dd8-a77b-b1eafa2acaf7'
            }]
        },
        'id': '2d45df1c-cf92-413b-984e-57f9e7d62277',
        'z': 3,
        'attrs': {}
    }, {
        'type': 'epa.HTMLElement',
        'groups': {
            'in': {'attrs': {'.port-body': {'fill': '#16A085', 'magnet': 'passive', 'r': 5}}},
            'out': {'attrs': {'.port-body': {'fill': '#E74C3C', 'r': 5}}}
        },
        'position': {'x': 435, 'y': 78},
        'size': {'width': 100, 'height': 64},
        'angle': 0,
        'componentIndex': 0,
        'elementType': 'multimedia',
        'renderType': 'flex-text',
        'imageCounter': 0,
        'videoCounter': 0,
        'textCounter': 1,
        'linksCounter': 0,
        'patternComponents': {
            'id': 1,
            'type': 'multimedia',
            'layout': '<textarea data-type=\'text\' data-mm-tag=\'ep-1-mm-text-0\'>aaaa</textarea>',
            'inEvent': {'events': []}
        },
        'template': '\n    <div style="position: absolute; top: 10px; left: 340px" class="ep-item multimedia draggable-item html-element">\n        <div class="ep-edit"><i class="fa fa-pencil" data-bind="click: dpa_VM.editEntry"></i></div>\n        <i class="fa fa-font" aria-hidden="true"></i>\n        <div data-bind="text:  $data.multiMediaList()[0].value().substring(0, 15) + \'...\'">aaaa...</div>\n        <div class="connect top"></div>\n        <div class="connect right"></div>\n        <div class="connect left"></div>\n        <div class="connect bottom"></div>\n    </div>\n\n',
        'ports': {
            'groups': {
                'in': {
                    'position': {'name': 'left'},
                    'attrs': {'.port-body': {'magnet': 'passive', 'r': 6}}
                }, 'out': {'position': {'name': 'right'}, 'attrs': {'.port-body': {'r': 6, 'magnet': true}}}
            },
            'items': [{
                'label': {'position': {'name': 'left', 'args': {}}},
                'group': 'in',
                'args': {},
                'attrs': {'text': {'text': 'in'}, 'circle': {'magnet': 'passive', 'r': 6}},
                'id': '1b67ea6e-f168-4d5d-89c1-a1ecc164de8c'
            }, {
                'magnet': true,
                'label': {'position': {'name': 'right', 'args': {}}},
                'group': 'out',
                'args': {},
                'attrs': {'text': {'text': 'out'}, 'circle': {'magnet': true, 'r': 6}},
                'id': '32e2817b-f08a-4e9c-b3fb-e9c27367153a'
            }]
        },
        'id': '9735d020-1db2-43d5-ad54-aa86b0e4c2e3',
        'z': 4,
        'attrs': {}
    }]
};
