/**
 * @copyright Digital Engagement Xperience Inc 2017
 * Created by shawn on 2017-07-11.
 */
/* global console, dexit */
if (!dexit.scm) {
    dexit.scm = {};
}
if (!dexit.scm.cd) {
    dexit.scm.cd = {};
}
if (!dexit.scm.cd.integration) {
    dexit.scm.cd.integration = {};
}


/**
 * Integration for Content Design's Storyboarding
 *
 */
dexit.scm.cd.integration.util = (function(){

    var componentType = 'ep-element';
    var regionComponentType = 'data-region';

    var _behaviourImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/behavior_template.png';
    var _intelligenceImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/intelligence_template.png';
    var _documentImageUrl = 'https://s3.amazonaws.com/resource.dexit.co/images/hubspot/mm_doc_template.png';


    function findMultimediaWithTagByMultimedia(tag, multimedia) {
        var scMultimedia = [].concat(multimedia.image).concat(multimedia.video).concat(multimedia.text).concat(multimedia.link).concat(multimedia.audio);

        for (var i = 0; i < scMultimedia.length; i++) {
            var mm = scMultimedia[i];
            if (mm && _.isArray(mm.property.tag) && mm.property.tag.indexOf(tag) !== -1) {
                return mm;
            } else if (mm && mm.property.tag && mm.property.tag === tag) {
                //check if tag is not an array
                return mm;
            }
        }
        return null;
    }


    function prepareLayout(layout, scMultimedia, callback) {

        //jquery ignores <html> and <body> tags, create another root element for the layout to
        //allow proper parsing
        // SC-330 'double video' bug
        //         There seems to be issue with chrome/firefox autoplaying video as soon as its loaded into the DOM
        //         whether its attached to DOM tree or not.  Work around found by not using Jquery.
        //         The work around also requires the element be created using a DOM other than
        //         'document'.  Whenever, document.createElement is used and the video tag is loaded
        //         into the element, it begins playing right away if it has autoplay set.
        //         However, when we first call 'createHTMLDocument' and use that to create the element
        //         it does not seem to trigger the video autoplay.
        //            (previously jQuery was used as follows: var $layout = $("<span />").append(layout);)
        //            - but as soon as jQuery instantianted an object with video autoplay, it queues it for playing
        //              causing double video.

        var multimedia = {
            text: [],
            image: [],
            video: [],
            audio: [],
            link: []
        };

        // create a temporary element to manipulate the HTML.  If instead we use 'document'
        // without creating a temporary dom, the video element is played twice.
        var dom = document.implementation.createHTMLDocument( 'tmp_doc' );
        var wrapper = dom.createElement('span');

        // load the layout HTML source into a temporary element
        wrapper.innerHTML = layout;

        //resolve img sources  - update the 'src' attribute on img elements
        var arr = wrapper.querySelectorAll( 'img[data-mm-tag]' );
        Array.prototype.slice.call(arr).forEach(function(curElement) {
            var tag = curElement.getAttribute('data-mm-tag');
            var mm = findMultimediaWithTagByMultimedia(tag, scMultimedia);
            if (mm) {
                var location = mm.property.location;

                curElement.setAttribute('src', location);
                multimedia.image.push(mm);
            }
        });

        //resolve text (Assuming that text will be in a <span data-type='text'> tag
        arr = wrapper.querySelectorAll( 'span[data-type=\'text\'][data-mm-tag]' );
        Array.prototype.slice.call(arr).forEach(function(curElement) {
            var tag = curElement.getAttribute('data-mm-tag');
            var mm = findMultimediaWithTagByMultimedia(tag, scMultimedia);
            if (mm) {
                var content = mm.property.content;

                curElement.textContent = content;
                multimedia.text.push(mm);
            }
        });

        //resolve video sources
        arr = wrapper.querySelectorAll( 'video > source[data-mm-tag]' );
        Array.prototype.slice.call(arr).forEach(function(curElement) {
            var tag = curElement.getAttribute('data-mm-tag');
            var mm = findMultimediaWithTagByMultimedia(tag, scMultimedia);
            if (mm) {
                var location = mm.property.location;

                curElement.setAttribute('src', location);
                curElement.setAttribute('webkit-playsinline', '' );
                multimedia.video.push(mm);
            }
            // strip elements from parent 'video' tag
            curElement.parentElement.removeAttribute( 'poster' );
        });


        //resolve link hrefs
        arr = wrapper.querySelectorAll( 'a[data-mm-tag]' );
        Array.prototype.slice.call(arr).forEach(function(curElement) {
            var tag = curElement.getAttribute('data-mm-tag');
            var mm = findMultimediaWithTagByMultimedia(tag, scMultimedia);
            if (mm) {
                var location = mm.property.location;

                curElement.setAttribute('href', location);
                multimedia.link.push(mm);
            }
        });


        //resolve audio sources
        arr = wrapper.querySelectorAll( 'audio > source[data-mm-tag]' );
        Array.prototype.slice.call(arr).forEach(function(curElement) {
            var tag = curElement.getAttribute('data-mm-tag');
            var mm = findMultimediaWithTagByMultimedia(tag, scMultimedia);
            if (mm) {
                var location = mm.property.location;

                curElement.setAttribute('src', location);
                multimedia.audio.push(mm);
            }
        });

        // return the updated HTML source as a string
        var htmlStr = wrapper.innerHTML;
        callback(null, {content: htmlStr, multimedia: multimedia});


    }


    /**
     *
     * @param {objecy} sc - SmartContent including all multimedia
     * @param layoutId
     * @param callback
     */
    function resolveMMFromLayout(sc, layoutId, callback) {
        dexit.app.ice.integration.layoutmanagement.retrieveLayout(layoutId, function (err, layout) {
            if (err){
                console.error('could not retrieve layout');
                return callback(err);
            }
            //decode layout content
            var htmlString = Base64.decode(layout.content);
            //calling sc-playback
            prepareLayout(htmlString, sc, function (err, dat) {
                //no err returned
                var mm = dat.multimedia;
                //now return
                callback(null,mm);

            });

        });
    }

    /**
     * Takes an ep element and generates html component for grapesjs to return
     * @param repo
     * @param element
     * @param element.id
     * @param sc
     * @param {string} shortId - used to prepend to any label
     * @param callback
     * @return {*}
     */
    function generateDesignViewElement(repo, element, sc, shortId, callback) {


        //resolve references and build content
        if (element.type === 'decision') {
            //skip
            return callback();
        }
        var elementType = (element && element.type ? element.type : '');

        var component = {
            type:'div'
        };


        //locate appropriate html template
        switch (elementType) {
            case 'multimedia':
                //will either be a video, image, text
                generateMMDesignBlock('multimedia', shortId, element, sc, callback);
                break;
            case 'intelligence':
                //if a report then show placeholder

                generateIntelligenceDesignBlock('intelligence', shortId, element, sc, callback);
                break;
            case 'behaviour':

                component.type = 'div'; //cannot style
                component.style = [];

                generateBehaviourDesignBlock('eService', shortId, repo, element, sc, callback);
                break;
            default:
                console.warn('no match for element type:' + elementType);
                callback();
                break;
        }






    }



    /**
     * Takes an ep element and generates html component for grapesjs to return
     * @param repo
     * @param element
     * @param element.id
     * @param sc
     * @param {string} shortId - used to prepend to any label
     * @param callback
     * @return {*}
     */
    function generateMjmlDesignViewElement(repo, element, sc, shortId, callback) {


        //resolve references and build content
        if (element.type === 'decision') {
            //skip
            return callback();
        }
        var elementType = (element && element.type ? element.type : '');


        //locate appropriate html template
        switch (elementType) {
            case 'multimedia':
                //will either be a video, image, text
                generateMMDesignBlockMjMl('multimedia', shortId, element, sc, callback);
                break;
            case 'intelligence':
                //if a report then show placeholder
                generateIntelligenceDesignBlock('intelligence', shortId, element, sc, callback);
                break;
            case 'behaviour':


                generateBehaviourDesignBlock('eService', shortId, repo, element, sc, callback);
                break;
            default:
                console.warn('no match for element type:' + elementType);
                callback();
                break;
        }






    }




    /**
     * EP element
     * @param repo
     * @param element
     * @param sc
     * @param {string} shortId - used to prepend to any label
     * @param callback
     * @return {*}
     */
    function generateBlock(repo, element, sc, shortId, callback) {


        //resolve references and build content
        if (element.type === 'decision') {
            //skip
            return callback();
        }
        var elementType = (element && element.type ? element.type : '');

        //var elementType = (element && element.patternComponents && element.patternComponents.type ? element.patternComponents.type : '');

        //locate appropriate html template
        switch (elementType) {
            case 'multimedia':
                generateMMBlock('multimedia', shortId, element, sc, callback);
                break;
            case 'intelligence':
                generateIntelligenceBlock('intellgence', shortId, element, sc, callback);
                break;
            case 'behaviour':
                generateBehaviourBlock('eService', shortId, repo, element, sc, callback);
                break;
            default:
                console.warn('no match for element type:' + elementType);
                callback();
                break;
        }

    }


    /**
     * @typedef {object} ParsedElementReference
     * @property {string} scId
     * @property {string} typeRef
     * @property {string} theTypeId
     */

    /**
     * Parse type id from element (reference to SC element)
     * ie. grab type id: ie. "sc:bc5d0037-2980-43ca-ba6a-9392d5590d67:layout:22d3aa61-4838-4fe6-93ab-3e8bbcf31ba7"
     * @param {object} element
     * @param {string} element.type_id - reference element
     * @return {ParsedElementReference}
     */
    function parseElementReference(element) {
        //
        var typeId = element.type_id;
        var items = typeId.split(':');
        var scId = items[1];
        var typeRef = items[2];
        var theTypeId = items[3];

        return {
            scId: scId,
            typeRef:typeRef,
            theTypeId: theTypeId,
            isPlaceholder: element.isPlaceholder || false,
            placeholderLabel: element.placeholderLabel || ''
        };
    }


    function generateMMDesignBlockMjml(category, shortId, element, sc, callback) {


        var elementRef = parseElementReference(element);

        var component = {
            attributes: {
                'element-id':element.id,
                'short-id':shortId
            },
            //set attributes for grapesjs
            removable: true,
            draggable: false,
            badgable: true,
            stylable: true,
            copyable: false,
            highlightable: true

        };
        var content = {

        };


        resolveMM(sc, elementRef, function (err, mm) {


            if (err) {
                console.error('could not find any mm');
                return callback(err);
            }
            var mmType = '';
            var location = '';
            var label = '';
            var dynamic = false;


            //TODO: handle case of more than one
            _.each(mm, function (value, key) {
                //each is an arry
                if (value && value.length > 0) {
                    mmType = key;
                    location = value[0].property.content || value[0].property.location;



                    if (location.indexOf('{{') > -1) {
                        dynamic = true;
                        var stripped = location.replace('{{','').replace('}}','');
                        label = shortId + ':' + stripped;
                        component.label = label;

                        if (mmType === 'video') {





                            component.type = 'video';
                            content.src = location;
                            component.title = location.pop('/');
                            component.src = location;
                            // elem = document.createElement("video");
                            //
                            // elem.src = location;

                        } else if (mmType === 'image') {
                            if (stripped === 'user.accountUsage') {
                                location = '/img/pie-chart.png';
                            } else {
                                location = '/img/face_icon.png';
                            }

                            component.type = 'image';
                            component.activeOnRender = 1;
                            content.src = location;
                            component.src = location;
                            component.title = label;

                        } else { //for 'text'
                            component.title = shortId+ ':'+ stripped;
                            component.type = 'text';
                            component.content = label;
                            content = label;
                            component.activeOnRender = 1;

                        }
                    } else {
                        label = shortId + ':' + location;
                        component.label = label;
                        if (mmType === 'video') {
                            component.type = 'video';
                            content.src = location;
                            component.src = location;
                            component.title = label;
                            //label = location.split('/').pop();
                        } else if (mmType === 'image') {
                            component.type = 'image';
                            component.activeOnRender = 1;
                            content.src = location;
                            component.src = location;
                            component.title = label;
                            component.attributes.src = location;

                        } else { //for 'text'
                            component.title = shortId;
                            component.type = 'text';
                            content = location;
                            component.activeOnRender = 1;
                            component.title = label;
                        }

                    }

                }

            });

            if (!mmType) {
                console.error('could not resolve mm type');
                return callback(new Error('could not resolve mm type'));
            }


            component.content = content;

            callback(null,component);

        });

    }




    function generateMMDesignBlock(category, shortId, element, sc, callback) {


        var elementRef = parseElementReference(element);

        var component = {
            attributes: {
                'element-id':element.id,
                'short-id':shortId
            },
            //set attributes for grapesjs
            removable: false,
            draggable: false,
            badgable: false,
            stylable: true,
            copyable: false,

        };
        var content = {

        };

        resolveMM(sc, elementRef, function (err, mm) {
            if (err) {
                console.error('could not find any mm');
                return callback(err);
            }
            var mmType = '';
            var location = '';
            var label = '';
            var dynamic = false;


            //TODO: handle case of more than one
            _.each(mm, function (value, key) {
                //each is an arry
                if (value && value.length > 0) {
                    mmType = key;
                    location = value[0].property.content || value[0].property.location;



                    if (location.indexOf('{{') > -1) {
                        dynamic = true;
                        var stripped = location.replace('{{','').replace('}}','');
                        label = shortId + ':' + stripped;
                        component.label = label;

                        if (mmType === 'video') {
                            component.type = 'video';
                            content.src = location;
                            component.title = location.pop('/');
                            component.src = location;
                            // elem = document.createElement("video");
                            //
                            // elem.src = location;

                        } else if (mmType === 'image') {
                            if (stripped === 'user.accountUsage') {
                                location = '/img/pie-chart.png';
                            } else {
                                location = '/img/face_icon.png';
                            }

                            component.type = 'image';
                            component.activeOnRender = 1;
                            content.src = location;
                            component.src = location;
                            component.title = label;

                        } else { //for 'text'
                            component.title = shortId+ ':'+ stripped;
                            component.type = 'text';
                            component.content = label;
                            content = label;
                            component.activeOnRender = 1;

                        }
                    } else {
                        label = shortId + ':' + location;
                        component.label = label;
                        if (mmType === 'video') {
                            component.type = 'video';
                            content.src = location;
                            component.src = location;
                            component.title = label;
                            //label = location.split('/').pop();
                        } else if (mmType === 'image') {
                            component.type = 'image';
                            component.activeOnRender = 1;
                            content.src = location;
                            component.src = location;
                            component.title = label;
                            component.attributes.src = location;

                        } else { //for 'text'
                            component.title = shortId;
                            component.type = 'text';
                            content = location;
                            component.activeOnRender = 1;
                            component.title = label;
                        }

                    }

                }

            });

            if (!mmType) {
                console.error('could not resolve mm type');
                return callback(new Error('could not resolve mm type'));
            }


            component.content = content;

            callback(null,component);

        });




    }

    function getMMFromSC(sc, type, id, callback) {
        var mmGroup = sc[type] || [];
        var mm= _.find(mmGroup, {id: id});
        if (!mm) {
            return callback(new Error('could not find multimedia'));
        }
        var multimedia = {
            text: [],
            image: [],
            video: [],
            audio: [],
            link: []
        };
        if (multimedia[type]) {
            multimedia[type].push(mm);
        }
        callback(null,multimedia);

    }


    function resolveMM(sc, elementRef, callback) {

        if (elementRef.typeRef === 'layout') {
            resolveMMFromLayout(sc, elementRef.theTypeId, callback);
        }else { //this is a direct multimedia
            //resolve directly;

            var ids = elementRef.theTypeId.split('#');

            var type = ids[1];
            var id = ids[0];
            getMMFromSC(sc, type, id, callback);

        }
    }


    function generateMMBlock(category, shortId, element, sc, callback) {

        var elementRef = parseElementReference(element);
        //resolve
        resolveMM(sc, elementRef, function (err, mm) {
        //resolveMMFromLayout(sc, elementRef.theTypeId, function (err, mm) {
            if (err) {
                console.error('could not find any mm');
                return callback(err);
            }
            var mmType = '';
            var data = {
                multiMediaList: ko.observableArray([])
            };
            var location = '';
            var placeholder = '';

            var isPlaceholder = elementRef.isPlaceholder;

            var label = '';
            var dynamic = false;
            _.each(mm, function (value, key) {
                //each is an arry
                if (value && value.length > 0) {
                    mmType = key;
                    location = value[0].property.content || value[0].property.location;

                    if (location.indexOf('{{') > -1) {
                        dynamic = true;
                        var stripped = location.replace('{{','').replace('}}','');
                        label = stripped;

                        if (mmType === 'video') {
                            location = '/img/face_icon.png';
                        } else if (mmType === 'image') {
                            if (stripped === 'user.accountUsage') {
                                location = '/img/pie-chart.png';
                            } else {
                                location = '/img/face_icon.png';
                            }
                        } else { //for 'text'
                            //label = stripped;
                            location = shortId+ ':'+ stripped; //for test:
                            //location = label;
                        }
                    } else {
                        if (mmType === 'video' || mmType === 'image') {

                            if (isPlaceholder) {
                                label = shortId + ':' + elementRef.placeholderLabel;
                            }else {

                                label = shortId + ':' + location.split('/').pop();
                            }
                        } else { //for 'text'
                            label = shortId + ':' + location;
                        }
                    }


                    if (label.indexOf(shortId + ':') === -1) {
                        //Add short Id in front of label
                        label = shortId+ ':'+ label;
                    }

                    //TODO: clean-up templates for consistency (placeholder, value, label)
                    data.multiMediaList.push({ type: key, label: ko.observable(label), value: ko.observable(location), placeholder: label});
                }

            });

            if (!mmType) {
                console.error('could not resolve mm type');
                return callback(new Error('could not resolve mm type'));
            }

            var templatePrefix= ( dynamic ? 'dynamic' : 'flex');
            var content = dexit.epm.epa.integration.renderTemplate(templatePrefix+'-'+mmType,data);
            content = stripContent(content);




            var block = {};
            switch (mmType) {
                case 'image':
                //TODO: would be nice to calculate size to show dynamically in terms of look and aspect
                    var labelBlockImage = '<svg version="1.1" class="" style="display:block" width="50" height="60" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="'+location+'" width="100"></image></svg><div class="gjs-block-label">'+label+'</div>';
                    block = {
                        label: labelBlockImage,
                        content: {
                            type: componentType,
                            html: content,
                            draggable:true,
                            removable: true,
                            copyable:false,
                            badgable : true,
                            highlightable : true
                        },
                        attributes: { //add reference to pattern element
                            'element-id':element.id,
                            'short-id':shortId
                        }
                    };
                    break;
                case 'video':
                //TODO: generate video tag
                    var labelBlockVideo = '<svg version="1.1" class="gjs-block-svg" xmlns="http://www.w3.org/2000/svg" width="50px" height="50px"><g id="video"><foreignObject><body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;"><video class="target" width="50px" height="50px"><source src="'+location+'" type="video/mp4"/></video></body></foreignObject></g></svg><div class="gjs-block-label">'+label+'</div>';
                    block = {
                        label: labelBlockVideo,
                        content: {
                            type: componentType,
                            html: content
                        },
                        attributes: { //add reference to pattern element
                            'element-id':element.id,
                            'short-id':shortId
                        }
                    };
                    break;
                default: //TODO: specialize for link or text
                    var iconClass = 'fa fa-file-image-o';
                    block = {
                        label: label,
                        content: {
                            type: componentType,
                            html: content
                        },
                        attributes: { //add reference to pattern element
                            'element-id':element.id,
                            'short-id':shortId,
                            'class': iconClass
                        }
                    };
                    break;
            }

            //workaround: add attributes for element-id to block.content so drag and drop works again (breaking change in grapesjs)

            block.content.attributes = {
                'element-id': element.id,  //add reference to pattern element
                'short-id': shortId
            };

            block.category = category;
            callback(null,block);

        });

    }

    function generateIntelligenceDesignBlock(category, shortId, element, sc, callback) {
        //TODO: more generic work around based on connector type ('flow')
        if (element.subType && element.subType === 'engagement-pattern') {
            var name = element.description || element.name;
            name = shortId + ':' + name;
            var subType = element.subType || element.subtype;
            var menuLabel = name ? name : subType;


            var component = {
                attributes: {
                    'element-id':element.id,
                    'short-id':shortId
                },
                //set attributes for grapesjs
                removable: false,
                draggable: false,
                badgable: false,
                stylable: true,
                copyable: false,
                label:name,
                content: '<div><span class="h3 heading">' + name + '</span></span></div>'
                // content:'<div> <span>Intelligence Block:'+name+'</span></div>'
            };
            //
            // var component = {
            //     attributes: {
            //         'element-id':element.id,
            //         'short-id':shortId
            //     },
            //     //set attributes for grapesjs
            //     // removable: false,
            //     draggable: false,
            //     // badgable: false,
            //     stylable: true,
            //     copyable: false,
            //     label:menuLabel,
            //     // content: {
            //     //     type: componentType,
            //     //     html:'<div><span class="h3 heading">' + name + '</span></span></div>',
            //     //     attributes: { //add attributes to workaround grapesjs breaking change
            //     //         'element-id': element.id,  //add reference to pattern element
            //     //         'short-id': shortId
            //     //     }
            //     // }
            //     // content: '<div><span class="h3 heading">' + name + '</span></span></div>'
            //     // content:'<div> <span>Intelligence Block:'+name+'</span></div>'
            // };



            // return callback(null, {
            //     category: category,
            //     label: menuLabel,
            //     content: {
            //         type: componentType,
            //         html: content,
            //         attributes: { //add attributes to workaround grapesjs breaking change
            //             'element-id': element.id,  //add reference to pattern element
            //             'short-id': shortId
            //         }
            //     },
            //     attributes: { //add reference to pattern element
            //         'element-id': element.id,
            //         'short-id':shortId,
            //         'class': iconClass
            //     }
            // });
            //

            callback(null, component);

        }else {

            if (element.id.indexOf('biz_rule_intelligence') === -1) {
                var iconClass = 'fa fa-pie-chart';
                var name = element.description || element.name;


                //Add short Id in front of label
                name = shortId + ':' + name;
                var subType = element.subType || element.subtype;
                var menuLabel = name ? name : subType;


                var component = {
                    attributes: {
                        'element-id': element.id,
                        'short-id': shortId
                    },
                    //set attributes for grapesjs
                    removable: false,
                    draggable: false,
                    badgable: false,
                    stylable: true,
                    copyable: false,
                    label: name,
                    content: '<div class=""><div class="card card-default"> <span class="card-img"><img src="' + _intelligenceImageUrl + '" class="img-responsive"> </span> <span class="card-body"> <span class="heading">Intelligence Block:' + name + '</span> <p> </p> </span> </div> </div>'
                    // content:'<div> <span>Intelligence Block:'+name+'</span></div>'


                };

                return callback(null, component);
            } else {


                //skip
                callback();
            }
        }

    }


    function generateIntelligenceBlock(category, shortId, element, sc, callback) {
        //TODO: more generic work around based on connector type ('flow')
        if (element.id.indexOf('biz_rule_intelligence') === -1) {
            var iconClass = 'fa fa-pie-chart';
            var name = element.description || element.name;


            //Add short Id in front of label
            name = shortId+ ':'+ name;

            if (element.args && element.args.type && element.args && element.args.type === 'campaign_dynamic' && element.args.tag) {
                name = name + '\n ('+ 'tag:'+element.args.tag + ')';
            }

            var content = dexit.epm.epa.integration.renderTemplate('flex-intelligence', {name:name});
            content = stripContent(content);

            var subType = element.subType || element.subtype;
            var menuLabel = name ? name : subType;

            return callback(null, {
                category: category,
                label: menuLabel,
                content: {
                    type: componentType,
                    html: content,
                    attributes: { //add attributes to workaround grapesjs breaking change
                        'element-id': element.id,  //add reference to pattern element
                        'short-id': shortId
                    }
                },
                attributes: { //add reference to pattern element
                    'element-id': element.id,
                    'short-id':shortId,
                    'class': iconClass
                }
            });
        }else {
            //skip
            callback();
        }

    }

    function stripContent(content) {
        //TODO: the newly added setup form div will break the draging stop event on story board
        //workaround is removing that setup form div
        if(content.indexOf('_setupForm') > -1){
            var tempContent='';
            _.each(content.split('</div>'), function(eachDiv, index){
                if(index !== 0 && eachDiv !== ''){
                    tempContent = tempContent+eachDiv+'</div>';
                }
            });
            content = tempContent;
        }


        if(content.indexOf('epa-element-toolbar') > -1){
            var obj = $(content);
            var parent = $('<div/>').append(obj);
            parent.find('.epa-element-toolbar').remove();
            content = parent.html();
        }


        return content;

    }

    function generateBehaviourDesignBlock(category, shortId, repo, element, sc, callback) {


        var label =   element.subType || element.type;
        //Add short Id in front of label
        label = shortId+ ':'+ label;



        var component = {
            attributes: {
                'element-id':element.id,
                'short-id':shortId
            },
            //set attributes for grapesjs
            removable: false,
            draggable: false,
            badgable: false,
            stylable: true,
            copyable: false,
            content:''

        };


        var renderType = element.renderType || element.subType;
        //default css class for behaviour
        var iconClass = 'fa fa-money';
        var name = element.subType;

        if (element.subType && element.subType === 'dynamic-behaviour'){
            component.content = '<div class="col-sm-4"><div class="card card-default"> <span class="card-img"><img src="'+_behaviourImageUrl+'" class="img-responsive"> </span> <span class="card-body"> <span class="h3 heading">eService:'+name+'</span> <p> </p> </span> </div> </div>';
            // try {
            //     component.content = '<div style="height:350px;width:100%"><span>'+label+'</span></div>'
            //
            // }catch (e) {
            //     component.content = '<div><span>behaviour style missing</span></div>';
            // }
            component.label = label;
            return callback(null,component);
        }


        async.auto({
            matchBeh: function(next){
                var elementRef = parseElementReference(element);
                if(elementRef.scId === sc.id){
                    var match =_.find(sc.behaviour, function (value) {
                        return (value.id && value.id === elementRef.theTypeId);
                    });
                    next(null, match);
                } else{
                    //get sc first
                    dexit.scm.dcm.integration.sc.retrieveSC(repo, elementRef.scId, function(err, res){
                        if(err){
                            next(err);
                        } else{
                            var match =_.find(res.behaviour, function (value) {
                                return (value.id && value.id === elementRef.theTypeId);
                            });
                            next(null, match);
                        }
                    });
                }
            }, prepareDisplay:['matchBeh', function(next, result){

                var match = result.matchBeh;
                if (match && match.property.display) {
                    try {
                        var display = JSON.parse(match.property.display);
                        iconClass = 'fa ' + display.icon;
                        if(element.description && element.description.indexOf('business rule') > -1){
                            label = label + ' Business Rule';
                            iconClass = 'fa fa-cogs';
                            if(element.subType === 'recharge'){
                                renderType = 'erecharge-br';
                            }
                        } else{
                            label = display.icon_text;
                        }
                    }catch (e) {}

                    //Add short Id in front of label
                    label = shortId+ ':'+ label;
                    component.label = label;

                }
                component.content = '<div class="col-sm-4"><div class="card card-default"> <span class="card-img"><img src="'+_behaviourImageUrl+'" class="img-responsive"> </span> <span class="card-body"> <span class="h3 heading">eService:'+name+'</span> <p> </p> </span> </div> </div>';
                // try {
                //     component.content = '<div style="height:350px;width:100%"><span>'+label+'</span></div>'
                //
                // }catch (e) {
                //     component.content = '<div><span>behaviour style missing</span></div>';
                // }
                next();
            }]}, function(err, result){
            return callback(null,component);
        });
    }



    function generateBehaviourBlock(category, shortId, repo, element, sc, callback) {

        var content = '';
        var label =   element.subType || element.type;

        //Add short Id in front of label
        label = shortId+ ':'+ label;

        var renderType = element.renderType || element.subType;
        //default css class for behaviour
        var iconClass = 'fa fa-money';

        if (element.subType && element.subType === 'dynamic-behaviour'){
            iconClass = 'fa fa-pie-chart';
            try {

                content = dexit.epm.epa.integration.renderTemplate(renderType,{behRef:{name:label}});
                content = stripContent(content);
            }catch (e) {
                content = '<div><span>behaviour style missing</span></div>';
            }
            return callback(null,{
                category: category,
                label: label,
                content: {
                    type: componentType,
                    html: content,
                    attributes: { //add attributes to workaround grapesjs breaking change
                        'element-id': element.id,  //add reference to pattern element
                        'short-id': shortId
                    },
                    style: {
                        width: 'max-content'
                    }
                },
                style: {
                    width: 'max-content'
                },
                attributes: { //add reference to pattern element
                    'element-id':element.id,
                    'short-id':shortId,
                    'class':iconClass
                }
            });
        }


        async.auto({
            matchBeh: function(next){
                var elementRef = parseElementReference(element);
                if(elementRef.scId === sc.id){
                    var match =_.find(sc.behaviour, function (value) {
                        return (value.id && value.id === elementRef.theTypeId);
                    });
                    next(null, match);
                } else{
                    //get sc first
                    dexit.scm.dcm.integration.sc.retrieveSC(repo, elementRef.scId, function(err, res){
                        if(err){
                            next(err);
                        } else{
                            var match =_.find(res.behaviour, function (value) {
                                return (value.id && value.id === elementRef.theTypeId);
                            });
                            next(null, match);
                        }
                    });
                }
            }, prepareDisplay:['matchBeh', function(next, result){

                var match = result.matchBeh;
                if (match && match.property.display) {
                    try {
                        var display = JSON.parse(match.property.display);
                        iconClass = 'fa ' + display.icon;
                        if(element.description && element.description.indexOf('business rule') > -1){
                            label = label + ' Business Rule';
                            iconClass = 'fa fa-cogs';
                            if(element.subType === 'recharge'){
                                renderType = 'erecharge-br';
                            }
                        } else{
                            label = display.icon_text;
                        }
                    }catch (e) {}

                    //Add short Id in front of label
                    label = shortId+ ':'+ label;

                }
                try {

                    content = dexit.epm.epa.integration.renderTemplate(renderType,{prefix:(shortId +':')});
                    content = stripContent(content);

                }catch (e) {
                    content = '<div><span>behaviour style missing</span></div>';
                }
                next();
            }]}, function(err, result){
            return callback(null,{
                category: category,
                label: label,
                content: {
                    type: componentType,
                    html: content,
                    attributes: { //add attributes to workaround grapesjs breaking change
                        'element-id': element.id,  //add reference to pattern element
                        'short-id': shortId
                    },
                    style: {
                        width: 'max-content'
                    }
                },
                style: {
                    width: 'max-content'
                },

                attributes: { //add reference to pattern element
                    'element-id':element.id,
                    'short-id':shortId,
                    'class':iconClass
                }
            });
        });
    }

    /**
     * Return EP elements part of flow connection
     * @param {object} ep - engagement pattern
     * @param {object[]} ep.connection
     * @param {object[]} ep.element
     */
    function findFlowElements(ep) {

        ////find all connections of type 'flow' and grab all element ids
        var ids = [];
        _.each(ep.connection, function (val) {
            if (val.type === 'flow') {
                if (val.from && val.from !== 'start' && val.from !== 'end') {
                    ids.push(val.from);
                }
                if (val.to && val.to !== 'start' && val.to !== 'end') {
                    ids.push(val.to);
                }
            }
        });
        //remove any duplicates
        var elementIds = _.uniq(ids);

        //filter out any elements that are not joined to flow connector
        var elements = _.filter(ep.element, function (element) {
            return (elementIds.indexOf(element.id) !== -1);
        });
        return elements;
    }


    /**
     *
     * @param {object} comps - Grapesjs editor.DomComponent
     */
    function addEPComponentType(comps, parent, selectable) {

        // Get the model and the view from the default Component type
        var defaultType = comps.getType('default');
        var defaultModel = defaultType.model;
        var defaultView = defaultType.view;

        var customEPType = {
            // Define the Model
            model: defaultModel.extend({
                // Extend default properties
                defaults: Object.assign({}, defaultModel.prototype.defaults, {
                    tagName: 'div',
                    //custom property for html to be passed in
                    html: '',
                    // Can be dropped only inside region `div` elements
                    draggable: ['[data-region]'], //'div, div *',
                    badgable: true,
                    // Cannot drop other elements inside it
                    droppable: false,
                    // Cannot be copied
                    copyable:false,
                    // can be removed
                    removable: true,
                    // Traits (Settings)
                    iconLink:'',
                    traits: [
                        {
                            'type':'select',
                            'label':'Presentation Mode',
                            'name': 'presentationRef',
                            'options': [
                                { value: 'default', name: 'Default (icon)'},
                                { value: 'embedded', name: 'Embedded'},
                                { value: 'executable', name: 'Executable'}

                            ]
                        },
                        {
                            'type':'text',
                            'label': 'Icon link',
                            'name':'model-iconLink',
                            'changeProp': 1
                        }

                    ], //good place to populate any settings in a sidebar (for future reference) like select color
                }),
                // for setting up property change listener
                // init: function() {
                //     debugger;
                //     this.listenTo(this, 'change:model-iconLink', this.doStuff);
                // },
                // doStuff: function () {
                //     debugger;
                //     // var iconLink = this.get('model-iconLink');
                //
                //
                //     var trait = this.get('traits').where({name: 'presentationRef'})[0];
                //     trait.set('options', [{ value:'default',name:'name1' }, ....])
                //     //if image is set, then update traits for icon
                //    // parent.updateEPElementDraft({elementId:this.get('element-id')});
                // }
            },
            // The second argument of .extend are static methods and we'll put inside our
            // isComponent() method. As you're putting a new Component type on top of the stack,
            // not declaring isComponent() might probably break stuff, especially if you extend
            // the default one.
            {
                isComponent: function(el) {
                    if(el.tagName && el.tagName === 'DIV' && el['element-id']){
                        return {type: componentType, 'element-id':el['element-id']};
                    }
                }
            }),
            //Define the View
            view: defaultView.extend({
                // The render() should return 'this'
                render: function () {
                    var html = this.model.get('html');
                    // Extend the original render method
                    defaultType.view.prototype.render.apply(this, arguments);
                    //this.$el.append($('<div style="">'+html+ '</div>'));

                    if (selectable) {
                        this.el.innerHTML = '<div style="pointer-events:all">'+html+'</div>';
                    }else {
                        this.el.innerHTML = '<div>' + html + '</div>';
                    }
                    return this;
                }
            })
        };


        comps.addType(componentType, customEPType);
    }



    /**
     *
     * @param {object} comps - Grapesjs editor.DomComponent
     */
    function addRegionTemplateComponentType(comps, parent, selectable) {

        // Get the model and the view from the default Component type
        var defaultType = comps.getType('default');
        var defaultModel = defaultType.model;
        var defaultView = defaultType.view;



        var customType = {
            // Define the Model
            model: defaultModel.extend({
                // Extend default properties
                defaults: Object.assign({}, defaultModel.prototype.defaults, {
                    tagName: 'div',
                    //custom property for html to be passed in
                    // Can be dropped only inside `div` elements
                    draggable: true,
                    badgable: true,
                    // Cannot drop other elements inside it
                    droppable: ['data-gjs-type="element-id'],
                    // Cannot be copied
                    selectable: true,
                    copyable:false,
                    // can be removed
                    removable: true,
                    attributes: {
                        'data-gjs-type': regionComponentType,
                        'data-region':''
                    },
                    // Traits (Settings)
                    traits: [
                        // {
                        //     'type':'select',
                        //     'label':'Presentation Mode',
                        //     'name': 'presentationRef',
                        //     'options': [
                        //         { value: 'default', name: 'Default (icon)'},
                        //         { value: 'embedded', name: 'Embedded'}
                        //     ]
                        // },
                        // {
                        //     'type':'text',
                        //     'label': 'Icon link',
                        //     'name':'model-iconLink',
                        //     'changeProp': 1
                        // }

                    ], //good place to populate any settings in a sidebar (for future reference) like select color
                }),
                // for setting up property change listener
                // init: function() {
                //     debugger;
                //     this.listenTo(this, 'change:model-iconLink', this.doStuff);
                // },
                // doStuff: function () {
                //     debugger;
                //     // var iconLink = this.get('model-iconLink');
                //
                //
                //     var trait = this.get('traits').where({name: 'presentationRef'})[0];
                //     trait.set('options', [{ value:'default',name:'name1' }, ....])
                //     //if image is set, then update traits for icon
                //    // parent.updateEPElementDraft({elementId:this.get('element-id')});
                // }
            },
            // The second argument of .extend are static methods and we'll put inside our
            // isComponent() method. As you're putting a new Component type on top of the stack,
            // not declaring isComponent() might probably break stuff, especially if you extend
            // the default one.
            {
                isComponent: function(el) {
                    debugger;
                    if(el.tagName && el.tagName !== 'IMG' && el.hasAttribute('data-region')){
                    //if(el.hasAttribute && el['data-region']){
                        console.log('is region component');
                        return {type: 'data-region'};
                            //,'data-region':el['data-region']};
                    }
                }
            }),
            //Define the View
            view: defaultView.extend({

                events: {
                    dblclick: 'onActive'
                },

                onActive: function(ev) {
                    debugger;
                    ev && ev.stopPropagation();
                    var em = this.opts.config.em;
                    var editor = em ? em.get('Editor') : '';

                    if (editor && this.model.get('editable')) {
                        editor.runCommand('open-ep-region-selection', {
                            target: this.model,
                            types: [componentType],
                            accept: '*',
                            onSelect: function() {
                                debugger;
                                editor.Modal.close();
                                //editor.AssetManager.setTarget(null);
                            }
                        });
                    }
                },

                // The render() should return 'this'
                render: function () {
                    debugger
                    var html = this.model.get('html');
                    // Extend the original render method
                    defaultType.view.prototype.render.apply(this, arguments);
                    //this.$el.append($('<div style="">'+html+ '</div>'));

                    //TODO: render first EP element inside of it
                    debugger;
                    this.el.innerHTML = '<div>' + html + '</div>';
                    // if (selectable) {
                    //     this.el.innerHTML = '<div style="pointer-events:all">'+html+'</div>';
                    // }else {
                    //     this.el.innerHTML = '<div>' + html + '</div>';
                    // }
                    return this;
                }
            })
        };

        var customTypeImg = {
            //Define the Model
            extend: 'image',
            extendFn: ['render'],
            isComponent: function(el) {
                debugger;
                console.log('is img region component');
                // if(el.tagName && el.tagName === 'DIV' && el['data-region']){
                if(el.tagName && (el.tagName === 'IMG' || el.tagName === 'img') && el.getAttribute && el.getAttribute('data-region')){
                    console.log('is region component');
                    return {type: 'data-region-img'};
                    //, 'data-region':el['data-region']};
                }
            },
            model: {
                    // Extend default properties
                defaults: {
                   // tagName: 'img',
                    name: 'img-region',
                    //custom property for html to be passed in
                    // Can be dropped only inside `div` elements
                    draggable: true,
                    badgable: true,
                    // Cannot drop other elements inside it
                    droppable: true,//['data-gjs-type="element-id'],
                    // Cannot be copied
                    selectable: true,
                    copyable:false,
                    // can be removed
                    //removable: true,
                    attributes: {
                        'data-gjs-type': 'data-region-img',
                        //'data-region':''
                    }
                }
            },
            //Define the View
            view: {

                events: {
                    dblclick: 'onActive'
                },

                onActive: function(ev) {
                    debugger;
                    ev && ev.stopPropagation();
                    var em = this.opts.config.em;
                    var editor = em ? em.get('Editor') : '';

                    if (editor && this.model.get('editable')) {
                        editor.runCommand('open-ep-region-selection', {
                            target: this.model,
                            types: [componentType],
                            accept: '*',
                            onSelect: function() {
                                debugger;
                                editor.Modal.close();
                                //editor.AssetManager.setTarget(null);
                            }
                        });
                    }
                },

                // The render() should return 'this'
                render: function () {
                    debugger;
                    // var html = this.model.get('html');
                    // Extend the original render method
                    //comps.getType('image').view.prototype.render.apply(this, arguments);
                    //sdefaultType.view.prototype.render.apply(this, arguments);
                    //this.$el.append($('<div style="">'+html+ '</div>'));

                    //TODO: render first EP element inside of it
                    debugger;
                    // this.el.innerHTML = '<div>' + html + '</div>';



                    // if (selectable) {
                    //     this.el.innerHTML = '<div style="pointer-events:all">'+html+'</div>';
                    // }else {
                    //     this.el.innerHTML = '<div>' + html + '</div>';
                    // }
                    return this;
                }
            }
        };

        comps.addType(regionComponentType+'-img', customTypeImg);
        comps.addType(regionComponentType, customType);
    }






    /**
     * @typedef {object} IdMatch
     * @property {string} originalId
     * @property {string} shortId
     */

    /**
     * Takes an array of epElements and generate a map (bi-directional) with a shortened id for each element id
     * @param {object[]} epPatternElements - array of EP elements
     * @returns {IdMatch[]}
     */
    function generateShortIdForEachElement(epPatternElements) {

        var arr = [];

        function incrementId(id) {
            return id + 1;
        }

        var shortId = 1;

        _.each(epPatternElements, function(val) {
            var id = val.id;
            arr.push({id: id, shortId:shortId});
            shortId  = incrementId(shortId);
        });
        return arr;


    }



    return {
        generateMjmlDesignViewElement: generateMjmlDesignViewElement,
        generateDesignViewElement: generateDesignViewElement,
        generateBlock: generateBlock,
        findFlowElements: findFlowElements,
        addEPComponentType: addEPComponentType,
        addRegionTemplateComponentType: addRegionTemplateComponentType,
        generateShortIdForEachElement: generateShortIdForEachElement,
        resolveMMFromLayout: resolveMMFromLayout,
        resolveMM: resolveMM,
        parseElementReference: parseElementReference
    };

})();
