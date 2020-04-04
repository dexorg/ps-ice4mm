(function () {
    'use strict';
    var expect = chai.expect;
    describe('Find Flow Elements', function() {
        var sandbox;
         beforeEach(function () {
         sandbox = sinon.sandbox.create();
         });

        afterEach(function () {
           sandbox.restore();
        });
        it('1-  Functional Test - Find Flow Elements is Successful', function() {
           var y= {
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
                            'name': 'start',
                            'from': 'start',
                            'to': '1',
                            'type': 'flow'
                        },
                        {
                            'name': 'a',
                            'from': '1',
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
               };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.element.length).to.be.equal(3);

        });
        it('2-  Functional Test - Find Flow Elements is not Successful', function() {

             var y= {
                'id':'7a1ebb39-cb7e-4933-9977-159402f868e5',
                'name': 'ep-intel1',
                'start': 'now',
                'end': '2015-12-14T15:06:18.787Z',
                'touchpoints': ['246dd59d-ff8e-4368-b2c9-3241d5d985fd'],
                'element': [],
                'connection': [
                    {
                        'name': 'start',
                        'from': '',
                        'to': '1',
                        'type': ''
                    }]

            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.element.length).to.be.equal(0);

        });
        it('3-  Structural Test - Find Flow Elements with duplicate element', function() {

            var y= {
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
                        'id': '1',
                        'type': 'multimedia',
                        'type_id': 'sc:85fd8c80-9d2c-4f70-aef2-0c25419db5c0:layout:85fd8c80-9d2c-4f70-aef2-0c25419db5c0',
                        'args': {},
                        'label': 'start multimedia'
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
                        'to': 'first',
                        'type': 'flow'
                    },
                    {
                        'name': 'b',
                        'from': 'first',
                        'to': 'first',
                        'type': 'flow',
                        'properties': {
                            'wait': '5min'
                        }
                    },
                    {
                        'name': 'c',
                        'from': 'start',
                        'to': '1',
                        'type': 'flow',
                        'properties': {
                            'wait': '5min'
                        }
                    },

                ]
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection.length).to.be.equal(3);

        });
        it('4-  Structural Test - Find Flow Elements when from   equal null', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': '',
                        'to': '1',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].from).to.be.equal('');

        });
        it('5-  Structural Test - Find Flow Elements when from !equal start', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'first',
                        'to': '1',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].from).to.be.equal('first');

        });
        it('6-  Structural Test - Find Flow Elements when from equal start', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'first',
                        'to': '1',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].from).to.be.equal('first');

        });
        it('7-  Structural Test - Find Flow Elements when from equal end', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'end',
                        'to': '1',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].from).to.be.equal('end');

        });
        it('8-  Structural Test - Find Flow Elements when from !equal end', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'second',
                        'to': '1',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].from).to.be.equal('second');

        });
        it('9-  Structural Test - Find Flow Elements when to true', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'second',
                        'to': '1',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].to).to.be.equal('1');

        });
        it('10- Structural Test - Find Flow Elements when to false', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'second',
                        'to': null,
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].to).to.be.equal(null);

        });
        it('11- Structural Test - Find Flow Elements when to equal start', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'second',
                        'to': 'start',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].to).to.be.equal('start');

        });
        it('12- Structural Test - Find Flow Elements when to !equal start', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'second',
                        'to': 'first',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].to).to.be.equal('first');

        });
        it('13- Structural Test - Find Flow Elements when to equal end', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'second',
                        'to': 'end',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].to).to.be.equal('end');

        });
        it('14- Structural Test - Find Flow Elements when to !equal end', function() {
            var y= {
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
                    }

                ],
                'connection': [
                    {
                        'name': 'start',
                        'from': 'second',
                        'to': 'aaaa',
                        'type': 'flow'
                    },
                    {
                        'name': 'a',
                        'from': '1',
                        'to': '2',
                        'type': 'flow',
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
            };
            dexit.scm.cd.integration.util.findFlowElements(y);
            expect(y.connection[0].to).to.be.equal('aaaa');

        });
    });
})();



