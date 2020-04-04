/*! ps-ice - v2.24.6 - 2019-04-25 13:31:05
* Copyright (c) 2019 Digital Engagement Xperience; Licensed  */
/*jslint browser: true */
/*jslint devel: true */
/*jslint nomen: true */
/*global dexit: true*/

if(!dexit) {
    var dexit = {};
}
if(!dexit.app) {
    dexit.app = {};
}
if(!dexit.app.ice) {
    dexit.app.ice = {};
}

if (!dexit.app.ice.integration) {
    dexit.app.ice.integration = {};
}
if (!dexit.app.ice.integration.rest) {
    dexit.app.ice.integration.rest = {};
}

dexit.app.ice.integration.rest.GeneralStrategy = function (resource, specificHeaders, dataType) {
    'use strict';
    var self = this;
    self.url = resource;
    self.specificHeaders = specificHeaders;
    self.dataType = 'json' || dataType;

    self.create = function (data, callback) {
        var request = $.ajax(
            {
                url: self.url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: self.dataType,
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (self.specificHeaders) {
            request.headers = self.specificHeaders;
        }

        request.done(function (result) {
            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }

        });
    };

    self.retrieve = function (callback) {
        var request = $.ajax(
            {
                url: self.url,
                type: 'GET',
                dataType: self.dataType,
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        request.done(function (result) {
            console.log('Retrieved: ' + JSON.stringify(result));

            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };

    self.update = function (data, callback) {
        var request = $.ajax(
            {
                url: self.url,
                type: 'PUT',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: self.dataType,
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        request.done(function (result) {
            console.log('Updated: ' + JSON.stringify(result));

            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };

    /**
     *
     * @param {object} data
     * @param {object} headers
     * @param callback
     */
    self.partialUpdate = function (data, headers, callback) {

        /* headers param is optional */
        if (_.isFunction(headers)) {
            callback = headers;
            headers = {};
        }


        var req = {
            url: self.url,
            type: 'PATCH',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: self.dataType,
            headers: {
                'Accept': 'application/json'
            }
        };
        _.extend(req.headers, headers);

        var request = $.ajax(req);
        request.done(function (result) {
            console.log('Partially updated: ' + JSON.stringify(result));

            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };

    self.destroy = function (callback) {
        var request = $.ajax(
            {
                url: self.url,
                type: 'DELETE',
                dataType: self.dataType,
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        request.done(function (result) {
            console.log('Destroyed: ' + JSON.stringify(result));

            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };

    /**
     * @param {object} [args]
     * @param {object} [args.query] - obj for query string
     * @param {object} [args.headers] - obj for headers
     * @param {string} [args.dataType] - jquery field dataType used for parsing response (ie. 'json', 'text')
     * @param {*} [args.data] - body
     * @param callback
     */
    self.destroyWithParams = function (args, callback) {

        var obj = {
            url: self.url,
            type: 'DELETE',
            headers: {}
        };
        if (args && args.dataType) {
            obj.dataType = args.dataType;
        }
        if (args && args.query && !_.isEmpty(args.query)) {
            obj.url = obj.url + '?' + $.param(args.query);
        }
        if (args && args.headers) {
            obj.headers = args.headers;
        }
        if (args && args.data) {
            args.body = args.data;
        }

        var request = $.ajax(obj);
        request.done(function (result) {
            console.log('Destroyed: ' + JSON.stringify(result));

            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };


    self.destroyWithData = function (data,callback) {
        var request = $.ajax(
            {
                url: self.url,
                type: 'DELETE',
                data: JSON.stringify(data),
                dataType: self.dataType,
                contentType: 'application/json; charset=utf-8',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        request.done(function (result) {
            console.log('Destroyed: ' + JSON.stringify(result));

            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };

    self.list = function (callback) {

        var request = $.ajax(
            {
                url: self.url,
                type: 'GET',
                dataType: self.dataType,
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        request.done(function (result) {
            console.log('Retrieved: ' + JSON.stringify(result));

            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login'); // if token is expired or not passed in correctly, redirect to login page
            } else {
                //Pass back the Error
                callback(error);
            }
        });

    };

    self.assign = function (callback) {
        var request = $.ajax(
            {
                url: self.url,
                type: 'POST',
                data: JSON.stringify({}),
                contentType: 'application/json; charset=utf-8',
                dataType: self.dataType,
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (specificHeaders) {
            request.headers = specificHeaders;
        }

        request.done(function (result) {
            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login');
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };

    self.unassign = function (callback) {
        var request = $.ajax(
            {
                url: self.url,
                type: 'DELETE',
                contentType: 'application/json; charset=utf-8',
                dataType: self.dataType,
                headers: {}
            }
        );

        if (specificHeaders) {
            request.headers = specificHeaders;
        }

        request.done(function (result) {
            callback(undefined, result);
        });
        request.always(function (result) {

        });
        request.fail(function (XHR, textStatus, errorThrown) {
            console.log('Error! ' + textStatus + ':' + errorThrown);
            //Create an Error Object
            var error = { responseText: XHR.responseText, status: XHR.status, statusText: XHR.statusText };
            if(error.status===401) {
                window.location.replace('/login');
            } else {
                //Pass back the Error
                callback(error);
            }
        });
    };

};

/*jslint browser: true */
/*jslint devel: true */
/*jslint nomen: true */
/*global $ */
/*global bc */

dexit.app.ice.integration.kb = {};
dexit.app.ice.integration.kb.datastore = {};
dexit.app.ice.integration.kb.schema = {};

/**
 * List the business concepts

 * @param callback  error: 500
 *                  data: business concept object list
 */
dexit.app.ice.integration.kb.datastore.list = function (callback) {
    'use strict';
    var app_resource = '/rtscloud/kb/mydatastore/',
        ScpRestStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(app_resource);

    ScpRestStrategy.list(callback);
};
/**
 * @callback SchemaObjectCallback
 * @param {Error} err - 404 error if it does not exist
 * @param {object} data - schema
 */

/**
 * Retrieve the schema for the specified datastore
 * @param datastore datastore to retrieve the schema for
 * @param {SchemaObjectCallback} callback - error:  404, data: schema object
 *
 */
dexit.app.ice.integration.kb.schema.retrieve = function (datastore, callback) {
    'use strict';
    var app_resource = '/rtscloud/kb/mydatastore/' + datastore + '/schema/',
        ScpRestStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(app_resource);

    ScpRestStrategy.retrieve(callback);
};

/**
 * Retrieve the schema by id
 * @param {string} schemaId - schema identifier
 * @param {SchemaObjectCallback} callback
 *
 */
dexit.app.ice.integration.kb.schema.retrieveById = function (schemaId, callback) {
    'use strict';
    var app_resource = '/rtscloud/kb/schema/' + schemaId,
        ScpRestStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(app_resource);

    ScpRestStrategy.retrieve(callback);
};


dexit.app.ice.integration.kb.datastore.listInstances = function (datastore, rows, table, callback) {
    'use strict';
    var app_resource = '/rtscloud/kb/mydatastore/' + datastore + '/query/'+rows+'/'+table,
        ScpRestStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(app_resource);

    ScpRestStrategy.retrieve(callback);
};

dexit.app.ice.integration.assets = {};

dexit.app.ice.integration.assets.importAll = function (importData, callback) {
    'use strict';
    var sc_resource = '/assets';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(importData, callback);
};

dexit.app.ice.integration.assets.importForAResource = function (importData, callback) {
    'use strict';
    var sc_resource = '/assets?id='+importData.resource.id;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(importData, callback);
};
dexit.app.ice.integration.contentManager = {};
dexit.app.ice.integration.contentManager.create = function (data, callback) {
    'use strict';
    var sc_resource = '/content',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.integration.contentManager.assignToContainer = function (repo, uuid, containerId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+uuid+'/container/'+containerId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.assign(callback);
};

dexit.app.ice.integration.contentManager.retrieveContainer = function (repo, containerId, args, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontentcontainer/'+containerId+'/?'+args,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.contentManager.partialUpdateContainer = function (repo, containerId, args, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontentcontainer/'+containerId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.partialUpdate(args, callback);
};

dexit.app.ice.integration.behaviour = {};
// dexit.app.ice.integration.behaviour.create = function (conceptId, data, callback) {
//     var ice_resource = '/concept/'+conceptId+'/behaviour/',
//         restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(ice_resource);
//     restStrategy.create(data, callback);
// };
dexit.app.ice.integration.behaviour.create = function (repo, data, scId, type, callback) {
    var sc_resource = repo+'/smartcontent/'+type+'/'+scId+'/behaviour/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.behaviour.remove = function (conceptId, behId, callback) {
    'use strict';
    var ice_resource = '/concept/'+conceptId+'/behaviour/'+behId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(ice_resource);
    restStrategy.destroy(callback);
};

dexit.app.ice.integration.behaviour.execute = function (conceptId, data, callback) {
    var ice_resource = '/concept/'+conceptId+'/behaviour?action=execute',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(ice_resource);

    restStrategy.create(data, callback);
};

dexit.app.ice.integration.behaviour.list = function (callback) {
    var ice_resource = '/available-behaviours/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(ice_resource);

    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.behaviour.setup = function (params, callback) {
    var ice_resource = '/available-behaviours/?action=setup&dsId='+params.dsId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(ice_resource);

    restStrategy.create(params.body, callback);
};

dexit.app.ice.integration.layoutmanagement = {};

dexit.app.ice.integration.layoutmanagement.retrieveLayout = function (layoutId, callback) {
    'use strict';
    var sc_resource = '/layout/'+layoutId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.layoutmanagement.findLayout = function (touchpointId, callback) {
    'use strict';
    var sc_resource = '/layout/?touchpoint=' + touchpointId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.layoutmanagement.updateLayout = function (layoutId, layout, callback) {
    'use strict';
    var sc_resource = '/layout/'+layoutId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(layout, callback);
};

dexit.app.ice.integration.layoutmanagement.createLayout = function (repo, data, scId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/layout/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.layoutmanagement.deleteLayout = function (repo, scId, layoutId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/layout/'+layoutId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.destroy(callback);
};

/*jslint browser: true */
/*jslint devel: true */
/*jslint nomen: true */
/*global $, jQuery, _, ko, Mustache */
/*global ice, scp, scd */

/*  =============================================
 Integration with Content REST API
 ============================================= */

/**
 * @deprecated use dexit.app.ice.integration.filemanagement rest routes instead
 */
dexit.app.ice.integration.multimediamanagement = {};
dexit.app.ice.integration.multimediamanagement = function (buckethost, catalog, callback) {

    "use strict";
    var url = '',
        app = 'contentmanagement',
        bucket = buckethost,
        delimiter = '/',
        prefix = catalog,
        resource = '/content/library/' + bucket + '/multimedia/?prefix=' + prefix + '&delimiter=' + delimiter,

        img = [],
        vid = [];

    console.log('Setting up content!');

    var request = $.ajax(
        {
            url : url + resource,
            type : 'GET',
            contentType: "application/json; charset=utf-8",
            headers : {
                'Accept' : 'application/json'
            }
        }
    );

    request.done(function (result) {
        callback(undefined, result);
    });
    request.always(function (result) {

    });
    request.fail(function (XHR, textStatus, errorThrown) {
        console.log("Error! " + textStatus + ':' + errorThrown);
        //Create an Error Object
        var error = { responseText : XHR.responseText, status : XHR.status, statusText : XHR.statusText };
        //Pass back the Error
        callback(error);
    });

};

dexit.app.ice.integration.filemanagement = {};

dexit.app.ice.integration.filemanagement.file = function(fileName, tags, uploadId, callback) {
    'use strict';
    var url = '/file?tags='+tags,
        element = $('#'+uploadId),
        thisProgress = element.siblings('.progress'),
        thisProgressError = element.siblings('.progressError');

    $(".progress").hide();
    $($(element)[0].form).ajaxSubmit({
        url: url,
        type: "POST",
        dataType: "text",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        headers: { "Content-Disposition": "attachment; filename=" + unescape(encodeURIComponent(fileName))},
        beforeSubmit: function () {
            thisProgress.show();
            thisProgressError.hide();
            thisProgress.find(".bar").width("0%");
            thisProgress.find(".percent").html("0%");
        },
        uploadProgress: function (event, position, total, percentComplete) {
            var percentVal = percentComplete + "%";
            thisProgress.find(".bar").width(percentVal);
            thisProgress.find(".percent").html(percentVal);
        },
        success: function (data) {
            thisProgress.hide();
            thisProgressError.hide();
            callback(null, fileName);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            thisProgress.hide();
            thisProgressError.html(jqXHR.responseText);
            callback(textStatus, null);
        }
    });
};


dexit.app.ice.integration.filemanagement.filev2 = function(fileName, tags, uploadId, path, callback) {
    'use strict';
    var url = '/file?tags='+tags,
        element = $('#'+uploadId),
        thisProgress = element.siblings('.progress'),
        thisProgressError = element.siblings('.progressError'),
        uploadPath = path || ''

    $(".progress").hide();
    $($(element)[0].form).ajaxSubmit({
        url: url,
        type: "POST",
        dataType: "text",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        headers: {"x-upload-folder":uploadPath ,"Content-Disposition": "attachment; filename=" + unescape(encodeURIComponent(fileName))},
        beforeSubmit: function () {
            thisProgress.show();
            thisProgressError.hide();
            thisProgress.find(".bar").width("0%");
            thisProgress.find(".percent").html("0%");
        },
        uploadProgress: function (event, position, total, percentComplete) {
            var percentVal = percentComplete + "%";
            thisProgress.find(".bar").width(percentVal);
            thisProgress.find(".percent").html(percentVal);
        },
        success: function (data) {
            thisProgress.hide();
            thisProgressError.hide();
            callback(null, fileName);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            thisProgress.hide();
            thisProgressError.html(jqXHR.responseText);
            callback(textStatus, null);
        }
    });
};



dexit.app.ice.integration.filemanagement.listByPath = function(basePath, callback) {
    'use strict';
    var fm_resource = '/file?list=true&folder='+encodeURIComponent(basePath)+'&currentFolderOnly=true',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.filemanagement.deleteFile = function(filePath, callback) {
    'use strict';
    var fm_resource = '/file?file='+filePath,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    restStrategy.destroy(callback);
};

dexit.app.ice.integration.filemanagement.findByTag = function(tag, callback) {
    'use strict';
    var fm_resource = '/file?tag='+tag,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.integration.filemanagement.findFileDetailsByTag = function(tag, callback) {
    'use strict';
    var fm_resource = '/file?tag='+tag+'&details=true',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.integration.filemanagement.findByFile = function(file, callback) {
    'use strict';
    var fm_resource = '/file?file='+file,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.filemanagement.addAppTagsByFileName = function(fileName, tags, callback) {
    'use strict';
    var fm_resource = '/file-tag?action=add&tagType=app',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    var data = {
        fileName:fileName,
        tags:tags
    };
    restStrategy.create(data,callback);
};

dexit.app.ice.integration.filemanagement.removeAppTagsByFileName = function(fileName, tags, callback) {
    'use strict';
    var fm_resource = '/file-tag?action=remove&tagType=app',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    var data = {
        fileName:fileName,
        tags:tags
    };
    restStrategy.create(data,callback);
};


dexit.app.ice.integration.filemanagement.addUserTagsByFileName = function(fileName, tags, callback) {
    'use strict';
    var fm_resource = '/file-tag?action=add&tagType=user',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    var data = {
        fileName:fileName,
        tags:tags
    };
    restStrategy.create(data,callback);
};

dexit.app.ice.integration.filemanagement.removeUserTagsByFileName = function(fileName, tags, callback) {
    'use strict';
    var fm_resource = '/file-tag?action=remove&tagType=user',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    var data = {
        fileName:fileName,
        tags:tags
    };
    restStrategy.create(data,callback);
};

dexit.app.ice.integration.filemanagement.listUserTags = function(callback) {
    'use strict';
    var fm_resource = '/file-tag?tagType=user',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    restStrategy.retrieve(callback);
};



dexit.app.ice.integration.filemanagement.listAppTags = function(callback) {
    'use strict';
    var fm_resource = '/file-tag?tagType=app',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    restStrategy.retrieve(callback);
};




dexit.app.ice.integration.filemanagement.addFolder = function(folderPath, callback) {
    'use strict';
    var fm_resource = '/folder',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fm_resource);
    var data = {
        name:folderPath
    };
    restStrategy.create(data,callback);
};

/* global dexit, _ */

dexit.app.ice.integration.tpm = {};

dexit.app.ice.integration.tpm.listTPs = function (args, callback) {
    'use strict';
    //for comparability
    if (_.isFunction(args)) {
        callback = args;
        args = {};
    }
    args =  args || {};
    var strArgs = $.param(args);
    var append = (strArgs ? '?' +strArgs:'');
    var tpm_resource = '/touchpoint/' + append,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(tpm_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.tpm.findPreconfiguredTPs  = function (args, callback) {
    'use strict';
    args =  args || {};
    var strArgs = $.param(args);
    var append = (strArgs ? '?' +strArgs:'');
    var tpm_resource = '/preconfigured-touchpoint/' + append,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(tpm_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.tpm.listChannels = function (callback) {
    'use strict';

    var tpm_resource = '/channel/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(tpm_resource);
    restStrategy.list(callback);
};
dexit.app.ice.integration.tpm.retrieveChannelInstanceFromTP = function (tpId, callback) {
    'use strict';
    var fb_group_resource = '/channel/?tpid='+tpId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fb_group_resource);
    restStrategy.retrieve(callback);
};



dexit.app.ice.integration.tpm.listChannelTypes = function (callback) {
    'use strict';

    var tpm_resource = '/channel-type/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(tpm_resource);
    restStrategy.list(callback);
};

/**
 * Requires v2 of API
 * @param id
 * @param callback
 */
dexit.app.ice.integration.tpm.retrieveChannelType = function (id, callback) {
    'use strict';
    var resource = '/channel-type/'+encodeURIComponent(id),
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};


dexit.app.ice.integration.tpm.createTouchpoint = function (touchpointReq, callback) {
    'use strict';
    var tpm_resource = '/touchpoint/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(tpm_resource);
    restStrategy.create(touchpointReq, callback);
};


dexit.app.ice.integration.tpm.deleleTouchpoint = function (tpId, callback) {
    'use strict';
    if (!tpId) {
        return callback(new Error('tpId is required'));
    }
    var tpm_resource = '/touchpoint/'+tpId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(tpm_resource);
    restStrategy.destroy(callback);
};


/**
 * @typedef {object} LayoutInfo
 * @param {string} layoutId - layout identifier (TODO remove layoutId there is no bound observable)
 * @param {string} id - layout identifier
 * @param {string} thumbnail - icon path to svg
 * @param {string} layoutMarkup - html markup for layout
 * @param {string[]} regions - region list
 */

/**
 * @callback LayoutFromTPCallback
 * @param {object} [error] - if any problem retrieving
 * @param {LayoutInfo[]} result
 */

/**
 * TODO: move to server-side and swith to use TP to store its layouts
 * Retrieve layouts configured for touchpoint
 * Note: can pass in either touchpointId or channelTypeId
 * @param {object} params
 * @param {object} params.touchpointId
 * @param {object} params.channelTypeId
 * @param {LayoutFromTPCallback} callback
 */
dexit.app.ice.integration.tpm.retrieveLayoutsForTP = function (params, callback) {
    'use strict';

    function findLayout(key, value, cb) {
        var sc_resource = '/layout/?'+key+'=' + value,
            restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
        restStrategy.retrieve(cb);
    }

    async.auto({
        tpId: function (cb) {
            if (params.touchpointId) {
                findLayout('touchpoint', params.touchpointId, cb);
            }else {
                cb();
            }
        },
        channelTypeId: function (cb) {
            if (params.channelTypeId) {
                findLayout('channel_type_id', params.channelTypeId, cb);
            }else {
                cb();
            }
        }
    }, function (err, results) {
        if (err) {
            return callback(err);
        }
        var tp = results.tpId || [];
        var ct = results.channelTypeId || [];
        //merge results
        var res = tp.concat(ct);
        //remove duplicates
        res = _.uniq(res);


        //retrieve layout info and return an array
        async.map(res, function (layoutId, done) {
            dexit.app.ice.integration.layoutmanagement.retrieveLayout(layoutId, function(err, layout) {
                if (err) {
                    return done(err);
                }
                var regions = layout.regions || [];
                if (_.isString(regions)) {
                    regions = layout.regions.split(',');
                }

                var toReturn = {
                    id: layoutId,
                    layoutId : layoutId,
                    thumbnail : layout.layoutIcon,
                    layoutMarkup : atob(layout.content),
                    regions: regions
                };
                if (layout.isTemplate) {
                    toReturn.isTemplate = layout.isTemplate;
                }
                if (layout.templateCss) {
                    toReturn.templateCss = layout.templateCss;
                }

                if (layout.css) {
                    toReturn.css = layout.css;
                }
                if (layout.js) {
                    toReturn.js = layout.js;
                }

                done(null,toReturn);
            });
        }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null,result);
        });
    });
};

dexit.app.ice.integration.profile = {};
dexit.app.ice.integration.profile.user = {};

dexit.app.ice.integration.profile.user.retrieve = function (callback) {
    'use strict';

    var user_profile_resource = '/user/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(user_profile_resource);
    restStrategy.list(callback);
};
dexit.app.ice.integration.profile.user.update = function (args, callback) {
    'use strict';

    var user_profile_resource = '/user/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(user_profile_resource);
    restStrategy.update(args, callback);
};
dexit.app.ice.integration.profile.user.network = {};
dexit.app.ice.integration.profile.user.network.list = function (callback) {
    'use strict';

    var user_profile_resource = '/user/network/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(user_profile_resource);
    restStrategy.list(callback);
};
dexit.app.ice.integration.profile.user.network.group = {};
dexit.app.ice.integration.profile.user.network.group.list = function (networkId, callback) {
    'use strict';

    var user_profile_resource = '/user/network/'+networkId+'/group/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(user_profile_resource);
    restStrategy.list(callback);
};
dexit.app.ice.integration.profile.user.network.group.update = function (networkId, groupId, group, callback) {
    'use strict';

    var user_profile_resource = '/user/network/'+networkId+'/group/'+groupId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(user_profile_resource);
    restStrategy.update(group, callback);
};

dexit.app.ice.integration.aevent = {};
dexit.app.ice.integration.aevent.container = {};
dexit.app.ice.integration.aevent.object = {};

dexit.app.ice.integration.aevent.container.list = function (callback) {
    'use strict';
    var fb_group_resource = '/aeventcontainer/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fb_group_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.aevent.container.create = function (data, callback) {
    'use strict';
    var sc_resource = '/aeventcontainer/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.aevent.container.deleteContainer = function (data, callback) {
    'use strict';
    var sc_resource = '/aeventcontainer/'+data,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.destroy(callback);
};


dexit.app.ice.integration.aevent.object.list = function (callback) {
    'use strict';
    var fb_group_resource = '/aeventobject/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(fb_group_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.aevent.object.create = function (data, callback) {
    'use strict';
    var sc_resource = '/aeventobject/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.aevent.object.deleteObject = function (data, callback) {
    'use strict';
    var sc_resource = '/aeventobject/'+data,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.destroy(callback);
};
dexit.app.ice.integration.aevent.object.update = function (id, data, callback) {
    'use strict';
    var sc_resource = '/aeventobject/'+id,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};
dexit.app.ice.integration.aevent.container.update = function (id, data, callback) {
    'use strict';
    var sc_resource = '/aeventcontainer/'+id,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};

dexit.app.ice.integration.roles_wf_manager = {};

dexit.app.ice.integration.roles_wf_manager.completeTask = function (taskId, task, callback) {
    'use strict';
    var sc_resource = '/task/'+taskId;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(task, callback);
};

/**
 * Retrieve active tasks for a given user and processId
 *
 * @param {string} processId - retrieve tasks for process ID, if processId is not defined, retrieve all for that user
 */
dexit.app.ice.integration.roles_wf_manager.retrieveTasks = function ( processId, callback) {
    'use strict';
    var sc_resource = '/task';


    if( processId )
    {
        sc_resource += "?processInstanceId=" + processId;
    }

    console.log( "roles_wf_manager_rest.js: retrieveTasks: url=" + sc_resource );
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.list(callback);
};


dexit.app.ice.integration.feedback = {};

dexit.app.ice.integration.feedback.retrieve = function (scId, tpId, callback) {
    'use strict';
    var sc_resource = '/feedback';

    if (scId && tpId) {
        sc_resource += '?scid=';
        sc_resource += scId;
        sc_resource += '&tpid=';
        sc_resource += tpId;
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
        restStrategy.retrieve(callback);
    } else {
        console.error("ERROR: no scid or tpid parameter was not set");
    }
};


dexit.app.ice.integration.engagementpattern = {};
dexit.app.ice.integration.engagementpattern.store = function(data, callback) {
    'use strict';
    var sc_resource = '/engagementpattern',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

/**
 *
 * Clone the existing specified pattern
 * @param {object} data
 * @param {string} data.repo - repository
 * @param {string} data.scId - Smart content identifier
 * @param {string} data.parentEPId - parent EP identifier
 * @param {string} data.parentEPRevision - parent EP revision
 * @param callback
 */
dexit.app.ice.integration.engagementpattern.clone = function(data, callback) {
    'use strict';
    var sc_resource = '/engagementpattern?operation=clone',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};


dexit.app.ice.integration.engagementpattern.retrieveSCPatterns = function(repo, scId, callback) {
    'use strict';
    var sc_resource = '/engagementpattern/?repo='+repo+'&scId='+scId+'&extended=true',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.integration.engagementpattern.retrieve = function(epId, revision, callback) {
    'use strict';
    var sc_resource = '/engagementpattern/'+epId+'?revision='+encodeURIComponent(revision)+'&extended=true',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};
dexit.app.ice.integration.engagementpattern.update = function(epId, revision, data, callback) {
    'use strict';
    var sc_resource = '/engagementpattern/'+epId+'?revision='+encodeURIComponent(revision),
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};
dexit.app.ice.integration.engagementpattern.deleteSCPatterns = function(repo, scId, callback) {
    'use strict';
    var sc_resource = '/engagementpattern/?repo=' + repo + '&scId=' + scId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.destroy(callback);
};
/**
 *
 * @param {string} epId - engagement pattern identifier
 * @param {object} data - request data
 * @param {object} data.scId - smart content identifer
 * @param {*} [data.fillInParams] - if specified then signal to service it must add additional parameters
 * @param callback -
 */
dexit.app.ice.integration.engagementpattern.builder = function (epId, revision, data, callback) {
    'use strict';
    var sc_resource = '/engagementpattern/'+epId+'/schedule?revision='+encodeURIComponent(revision),
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.integration.engagementpattern.structureEP = function (data, callback) {
    'use strict';
    var sc_resource = '/engagementpattern/structure',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.metrics = {};

dexit.app.ice.integration.metrics.retrieveTotalsByParentScId = function(scId, callback) {
    'use strict';
    if (!scId) {
        console.error('ERROR: no scid parameter was not set');
        return callback('ERROR: no scid parameter was not set');
    }

    var scResource = '/metrics/smartContentParent/' + scId + '/totals';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(scResource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.metrics.retrieveTotalsByScId = function(scId, callback) {
    'use strict';
    if (!scId) {
        console.error('ERROR: no scid parameter was not set');
        return callback('ERROR: no scid parameter was not set');
    }

    var scResource = '/metrics/smartContent/' + scId + '/totals';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(scResource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.metrics.retrieveTotalsByScIdByChannel = function(scId, args, callback) {
    'use strict';
    if (!scId) {
        console.error('ERROR: no scid parameter was not set');
        return callback('ERROR: no scid parameter was not set');
    }

    var scResource = '/metrics/smartContent/' + scId + '/totalsByChannel';
    var limit = 10;
    var page = 0;
    if (args && args.limit) {
        limit = args.limit;
    }
    if (args && args.page) {
        page = args.page;
    }
    scResource += '?page=' + page + '&limit=' + limit;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(scResource);
    restStrategy.retrieve(callback);
};


/**
 * Retrieves the specified metric data for BC instances
 * @param {object} params.eptId - engagement point id
 * @param callback
 */
dexit.app.ice.integration.metrics.retrieveMetricsByEptId = function(params, callback) {
    'use strict';

    if (!params.eptId) {
        return callback(new Error('must specify metric id for BC'));
    }
    var eptId = encodeURIComponent(params.eptId);
    var resource = '/metric/ept/'+eptId;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

/**
 * Retrieves all available metrics in current tenant
 * @param callback
 */
dexit.app.ice.integration.metrics.listMetrics = function(callback) {
    'use strict';
    var resource = '/metric/';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

/**
 * Retrieves metric definition by id
 * @param {string} id - metric id
 * @param callback
 */
dexit.app.ice.integration.metrics.retrieveMetricsById = function(id, callback) {
    'use strict';
    var resource = '/metric/'+id;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};
/**
 * Retrieves the specified metric and behaviour mapping data in current tenant
 * @param callback
 */
dexit.app.ice.integration.metrics.listBehEpts = function(callback) {
    'use strict';
    var resource = '/ept-source';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};


/**
 * @callback {EMCreateCallback}
 * @param {Error} [error]
 */

/**
 * Create EM
 * @param {object} data
 * @param {EMCreateCallback} callback
 */
dexit.app.ice.integration.metrics.createEM = function(data, callback) {
    'use strict';

    if (!data) {
        return callback(new Error('Missing required parameter: data'));
    }

    var resource = '/metric/';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.create(data, callback);
};


/**
 * @callback {EMDeleteCallback}
 * @param {Error} [error]
 */

/**
 * Removes an EM
 * @param {string} data
 * @param {EMDeleteCallback} callback
 */
dexit.app.ice.integration.metrics.removeEM = function(metricId, callback) {
    'use strict';

    if (!metricId) {
        return callback(new Error('Missing required parameter: metricId'));
    }

    var resource = '/metric/' + encodeURIComponent(metricId);
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.destroy(callback);
};

dexit.app.ice.integration.ept = {};


/**
 * @typedef {EptDef}
 * @property {string}
 */

/**
 * @callback {ListAvailableEngagementPointsCallback}
 * @param {Error} [error]
 * @param {Error} error
 */



/**
 * List available engagement point definitions
 * @param callback
 */
dexit.app.ice.integration.ept.listAvailableEngagementPoints = function (callback) {
    var resource = '/ept/';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.bcm = {};

dexit.app.ice.integration.bcm.listBCsForApp = function(application, callback) {
    'use strict';
    var resource = '/businessconcept/?application='+application;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.bcm.retrieveBCDefinitionByName = function(bcName, callback) {
    'use strict';
    var resource = 'bcm/definition/'+bcName;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};



dexit.app.ice.integration.bcm.retrieveBCDefinitionIntelligence = function(bcName, callback) {
    'use strict';
    var resource = 'bcm/definition/'+bcName + '/intelligence';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};



dexit.app.ice.integration.bcm.retrieveBCDefinitionBehaviours = function(bcName, params, callback) {
    'use strict';
    var queryParams = false;
    if (params && (params.application || params.detailed)) {
        queryParams = true;
    }
    var resource = 'bcm/definition/'+  encodeURIComponent(bcName) + '/behaviour' + (queryParams ? ('?'+ $.param(params)) : '');

    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};



dexit.app.ice.integration.bcm.retrieveBCPermissionByRole = function(bcName, role, callback) {
    'use strict';
    var resource = 'bcm/bc/'+bcName+'/permission/'+role;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.bcm.retrieveBCMappingByRole = function(role, callback) {
    'use strict';
    var resource = 'bcm/bcmapping/?role='+role;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.bcp = {};

/**
 * List BC instance
 * @param {object} params - Parameters to filter listing
 * @param {object} params.repo
 * @param {object} params.sctype
 * @param {object} params.bctype
 * @param callback
 */
dexit.app.ice.integration.bcp.listBCInstance = function(params, callback) {
    'use strict';
    var repo = params.repo || 'norepo';
    var sctype = params.sctype || 'nosctype';
    var bctype = params.bctype || 'nobctype';
    if(sctype === 'container'){
        dexit.app.ice.integration.scm.container.list(repo, bctype, callback);
    }else if(sctype === 'object'){
        var limit = params.limit || '6' ;
        var page = params.page || '100' ;
        dexit.app.ice.integration.scm.listSCsByType(repo, bctype, limit, page, callback);
    }
};

/**
 * Create BC instance
 * @param {object} params
 * @param {object} params.type - type of BC
 * @param {object} params.property - properties to populate
 * @param callback
 */
dexit.app.ice.integration.bcp.createBCInstance = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }

    var property = params.property || {};
    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/'+name;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.create(property,callback);

};

/**
 * Deletes a BC instance
 * @param {object} params.id - unique identifier
 * @param {object} params.type
 * @param callback
 */
dexit.app.ice.integration.bcp.deleteBCInstance = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    var id = params.id;
    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/'+name + '/' + id;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.destroy(callback);
};

/**
 * Retrieves the specified BC instances
 * @param {object} params.id - unique identifier
 * @param {object} params.type
 * @param {object} params.sctype
 * @param callback
 */
dexit.app.ice.integration.bcp.retrieveBCInstance = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    var id = params.id;
    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/'+name + '/' + id;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

/**
 * Retrieves the specified metric data for BC instances
 * @param {object} params.id - unique identifier
 * @param {object} params.type
 * @param {object} params.metricId
 * @param callback
 */
dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    if (!params.metricId) {
        return callback(new Error('must specify metric id for BC'));
    }
    var queryParams = null;
    if (params.queryParams && !_.isEmpty(params.queryParams)) {
        queryParams = params.queryParams;
    }

    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);
    var metricId = encodeURIComponent(params.metricId);
    var resource = '/bcp/businessconcept/'+name + '/' + id + '/metric/'+metricId+'/data' + (queryParams ? ('?'+ $.param(queryParams)) : '');
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};

/**
 * Update BC instance using list of changes (does not support updating mm)
 * @param {object} params
 * @param {string} params.version - type of BC
 * @param {string} params.id - id of BC
 * @param {object} params.type - type of BC
 * @param {object[]} changes - changes to be applied (see RFC 6902)
 * @param {string} changes[].op - operation (only 'replace', 'remove' and 'add' are supported)
 * @param {string} changes[].path - path (JSON pointer format) - path may include ['/property','behaviours','intelligence','br','bcRelationships','entityRelationships']
 * @param {*} changes[].value - value of path to set
 * @param {updateBCInstanceCallback} callback
 */
dexit.app.ice.integration.bcp.updateBCInstance = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params || !params.version) {
        return callback(new Error('must specify version for BC'));
    }
    if (!params || !params.id) {
        return callback(new Error('must specify version for BC'));
    }
    var changes = params.changes || [];
    var headers = {'If-Match':params.version};

    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/'+name + '/' + encodeURIComponent(params.id);
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.partialUpdate(changes, headers, callback);
};

dexit.app.ice.integration.bcp.invalidateCacheForBCInstance = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params || !params.id) {
        return callback(new Error('must specify version for BC'));
    }
    var body = {};

    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/' + name + '/' + encodeURIComponent(params.id) + '/cache';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.create(body, callback);
};

/**
 * @typedef {object} BCRelationship
 * @property {string} refId - reference for BCi identifier
 * @property {string} ref - reference for BC
 * @property {string} type - relationship type.  see VALID_BC_RELATIONSHIP_TYPES
 * @property {string} [label] - label that defaults to value from BC definition
 */

/**
 * Adds bc relationships to BCi
 * @param {object} params
 * @param {object} params.id - unique identifier
 * @param {object} params.type
 * @param {BCRelationship[]} params.bcRelationships
 * @param callback
 */
dexit.app.ice.integration.bcp.addBCRelationshipsToBCi = function (params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    if (!params.bcRelationships) {
        return callback(new Error('must specify bcRelationships'));
    }
    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/'+name + '/' + id + '/relationship/bc';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.create(params.bcRelationships, callback);
};

/**
 * Remove bc relationships from BCi
 * @param {object} params
 * @param {object} params.id - unique identifier
 * @param {object} params.type
 * @param {BCRelationship[]} params.bcRelationships
 * @param callback
 */
dexit.app.ice.integration.bcp.removeRelationshipsFromBCi = function (params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    if (!params.bcRelationships) {
        return callback(new Error('must specify bcRelationships'));
    }
    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/'+name + '/' + id + '/relationship/bc';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.destroyWithData(params.bcRelationships, callback);
};

/**
 * Create BC instance
 * @param {object} params
 * @param {string} params.type - BC type
 * @param {string} params.id - BCi id
 * @param {string} params.dateCreated - BCi created date
 * @param {object} params.entityRelationships - {BCi id, role, permission}
 * @param callback
 */
dexit.app.ice.integration.bcp.addBCiEntityRelationship = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    var body = {
        dateCreated: params.dateCreated,
        entityRelationships: params.entityRelationships
    };

    var name = encodeURIComponent(params.type);
    var id = encodeURIComponent(params.id);
    var resource = '/bcp/businessconcept/'+name+'/'+id+'/relationship/entity';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.create(body,callback);

};

/**
 * retrieve BC instance by role and bc type
 * @param {object} params
 * @param {string} params.type - BC type
 * @param {string} params.role - current role
 * @param callback
 */
dexit.app.ice.integration.bcp.retrieveBCiFromEntityRelationshipByRole = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params || !params.role) {
        return callback(new Error('must specify role'));
    }
    var name = encodeURIComponent(params.type);
    var role = encodeURIComponent(params.role);
    var resource = '/bcp/businessconcept/'+name+'/relationship/entity/'+role;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);

};

/**
 * retrieve BC instance by role and bc type
 * @param {object} params
 * @param {string} params.type - BC type
 * @param {string} params.id - BCi id
 * @param callback
 */
dexit.app.ice.integration.bcp.removeBCiFromEntityRelationshipById = function(params, callback) {
    'use strict';
    if (!params || !params.id) {
        return callback(new Error('must specify type for BCi id'));
    }
    if (!params || !params.type) {
        return callback(new Error('must specify type for BCi type'));
    }

    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);
    var resource = '/bcp/businessconcept/'+name+'/'+id+'/relationship/entity/';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.destroy(callback);

};

/**
 * List behaviours for BCi
 * @param {object} params
 * @param {object} params.id - BCi id
 * @param {object} params.type - BC type
 * @param {object} [params.filterArgs]
 * @param {object} [params.filterArgs.page]
 * @param {object} [params.filterArgs.limit]
 * @param {object} [params.filterArgs.tag] - optional "sc" or "bc"
 * @param callback
 */
dexit.app.ice.integration.bcp.listBCBehaviours = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);

    var args = params.filterArgs || {};
    var strArgs = $.param(args);
    var append = (strArgs ? '?' +strArgs:'');
    var resource = '/bcp/businessconcept/'+name+'/'+id+'/behaviour/'+append;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.list(callback);
};

/**
 * Create behaviour for BC
 * @param {object} params
 * @param {object} params.id - BCi id
 * @param {object} params.type - BC type
 * @param {object} params.behaviourReq - body of behaviour request
 * @param {object} [params.tag] - optional "sc" or "bc"
 * @param {object} [params.scope] - optional "public" or "private"
 * @param callback
 */
dexit.app.ice.integration.bcp.createBCBehaviour = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);

    var args = {};
    if (params.tag) {
        args.tag = params.tag;
    }
    if (params.scope) {
        args.scope = params.scope;
    }

    var strArgs = $.param(args);
    var append = (strArgs ? '?' +strArgs:'');
    var resource = '/bcp/businessconcept/'+name+'/'+id+'/behaviour/'+append;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.create(params.behaviourReq,callback);


};

/**
 * Remove behaviour from BC
 * @param {object} params
 * @param {object} params.id - BCi id
 * @param {object} params.type - BC type
 * @param {object} params.behaviourId - body of behaviour request
 * @param callback
 */
dexit.app.ice.integration.bcp.removeBCBehaviour = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    if (!params.behaviourId) {
        return callback(new Error('must specify behaviour id '));
    }
    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);
    var behaviourId = encodeURIComponent(params.behaviourId);

    var resource = '/bcp/businessconcept/'+name+'/'+id+'/behaviour/'+behaviourId;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.destroy(callback);
};


/**
 * Create behaviour for BC
 * @param {object} params
 * @param {object} params.id - BCi id
 * @param {object} params.type - BC type
 * @param {string} params.intelId
 * @param {string} params.intelType
 * @param {object} params.data - body of intelligence request
 * @param callback
 */
dexit.app.ice.integration.bcp.updateBCIntelligence = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    if (!params.intelId) {
        return callback(new Error('must specify intelId for intelligence'));
    }

    if (!params.data) {
        return callback(new Error('must specify data for intelligence'));
    }

    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);
    var intelId = encodeURIComponent(params.intelId);

    var args = {};
    if (params.intelType) {
        args.intel_type = params.intelType;
    }

    var strArgs = $.param(args);
    var append = (strArgs ? '?' +strArgs:'');
    var resource = '/bcp/businessconcept/'+name+'/'+id+'/intelligence/'+intelId+append;
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.update(params.data,callback);
};

/**
 * Retrieves the specified intel data for BC instances
 * @param {object} params.id - unique identifier
 * @param {object} params.type
 * @param {object} params.intelId
 * @param callback
 */
dexit.app.ice.integration.bcp.retrieveBCInstanceIntelData = function(params, callback) {
    'use strict';
    if (!params || !params.type) {
        return callback(new Error('must specify type for BC'));
    }
    if (!params.id) {
        return callback(new Error('must specify id for BC'));
    }
    var queryParams = null;
    if (params.queryParams && !_.isEmpty(params.queryParams)) {
        queryParams = params.queryParams;
    }

    var id = encodeURIComponent(params.id);
    var name = encodeURIComponent(params.type);
    var metricId = encodeURIComponent(params.intelId);
    var resource = '/bcp/businessconcept/'+name + '/' + id + '/intelligence/'+metricId+'/data' + (queryParams ? ('?'+ $.param(queryParams)) : '');
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
    restStrategy.retrieve(callback);
};


dexit.app.ice.integration.token = {};
dexit.app.ice.integration.token.checkToken = function (callback) {
    'use strict';
    var sc_resource = '/checkToken';
    var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};
if (!dexit.app.ice.integration) {
    dexit.app.ice.integration = {};
}
dexit.app.ice.integration.scm = {};


dexit.app.ice.integration.scm.listSCs = function (repo, limit, page, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+limit+'/'+page,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.scm.listSCsByType = function (repo, type, limit, page, callback) {
    'use strict';
    var sc_resource = repo + '/smartcontent/?type=' + type + '&limit=' + limit + '&page=' + page,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.scm.retrieveSC = function (repo, scId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.scm.createSC = function (repo, data, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.scm.updateSC = function (repo, scId, data, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};

dexit.app.ice.integration.scm.deleteSC = function (repo, scId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.destroy(callback);
};
dexit.app.ice.integration.scm.createImageMultimedia = function (repo, data, scId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/image/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.scm.updateImageMultimedia = function (repo, imageId, scId, data, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/image/'+imageId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};

dexit.app.ice.integration.scm.removeImageMultimedia = function (repo, uuid, scId, type, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/image/'+uuid,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.unassign(callback);
};

dexit.app.ice.integration.scm.createTextMultimedia = function (repo, data, scId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/text/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.integration.scm.assignTextMultimedia = function (repo, uuid, parentId, type, callback) {
    'use strict';
    var sc_resource = repo+'/text/'+uuid+'/assign/'+parentId+'/type/'+type,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.assign(callback);
};

dexit.app.ice.integration.scm.updateTextMultimedia = function (repo, data, scId, textId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/text/'+textId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};

dexit.app.ice.integration.scm.removeTextMultimedia = function (repo, uuid, scId, type, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/text/'+uuid,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.unassign(callback);
};

dexit.app.ice.integration.scm.createVideoMultimedia = function (repo, data, scId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/video/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.integration.scm.updateVideoMultimedia = function (repo, video, scId, data, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/video/'+video,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};

dexit.app.ice.integration.scm.removeVideoMultimedia = function (repo, uuid, scId, type, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/video/'+uuid,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.unassign(callback);
};


dexit.app.ice.integration.scm.intelligence = {};


dexit.app.ice.integration.scm.intelligence.concept = {};
dexit.app.ice.integration.scm.intelligence.information = {};
dexit.app.ice.integration.scm.intelligence.report = {};

dexit.app.ice.integration.scm.intelligence.concept.create = function (repo, data, scId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/intelligence/concept/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.integration.scm.intelligence.information.create = function (repo, data, scId, ciId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/intelligence/concept/'+ciId+'/information/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.integration.scm.intelligence.report.create = function (repo, data, scId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/intelligence/report/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};
dexit.app.ice.integration.scm.management= {};
dexit.app.ice.integration.scm.management.intelligence={};
dexit.app.ice.integration.scm.management.intelligence.retrieve = function (repo, scId, inteIld, filter, callback) {
    var sc_resource = repo+'/management/smartcontent/' + scId +'/intelligence/'+inteIld+'/?filter='+filter,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);

    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.scm.behaviour = {};
dexit.app.ice.integration.scm.behaviour.create = function (repo, data, scId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/behaviour/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.scm.behaviour.remove = function (repo, uuid, scId, type, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/behaviour/'+uuid,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.unassign(callback);
};

dexit.app.ice.integration.scm.behaviour.execute = function (repo, scId, behaviourId, data, callback) {
    var sc_resource = repo+'/management/smartcontent/'+scId+'/behaviour/'+behaviourId+'/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);

    restStrategy.create(data, callback);
};

dexit.app.ice.integration.scm.decision = {};
dexit.app.ice.integration.scm.decision.create = function (repo, data, scId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/decision/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};


dexit.app.ice.integration.scm.decision.remove = function (repo, uuid, scId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+scId+'/decision/'+uuid,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.unassign(callback);
};
dexit.app.ice.integration.scm.layout = {};
dexit.app.ice.integration.scm.layout.create = function (repo, data, scId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/layout/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.scm.schedule = {};
dexit.app.ice.integration.scm.schedule.list = function (repo, scId, callback) {
    var sc_resource = repo+'/smartcontent/'+scId+'/schedule',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.scm.container = {};
dexit.app.ice.integration.scm.container.list = function (repo, filteringType, callback) {

    var sc_resource = repo+'/smartcontentcontainer/?type='+filteringType,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.list(callback);
};

dexit.app.ice.integration.scm.container.retrieve = function (repo, containerId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontentcontainer/'+containerId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};

dexit.app.ice.integration.scm.container.create = function (repo, data, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontentcontainer/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.create(data, callback);
};

dexit.app.ice.integration.scm.container.update = function (repo, containerId, data, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontentcontainer/'+containerId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.update(data, callback);
};

dexit.app.ice.integration.scm.container.delete = function (repo, containerId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontentcontainer/'+containerId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.destroy(callback);
};

dexit.app.ice.integration.scm.assignToContainer = function (repo, uuid, containerId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+uuid+'/container/'+containerId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.assign(callback);
};


dexit.app.ice.integration.scm.unassignFromContainer = function (repo, uuid, containerId, callback) {
    'use strict';
    var sc_resource = repo+'/smartcontent/'+uuid+'/container/'+containerId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.unassign(callback);
};

/*jslint browser: true */
/*jslint devel: true */
/*jslint nomen: true */
/*global jQuery, _, ko */


ko.bindingHandlers.filesUpload = {
    init: function (element, valueAccessor) {
        $(element).after('<div class="progress"><div class="bar"></div><div class="percent">0%</div></div><div class="progressError"></div>');
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var options = ko.utils.unwrapObservable(valueAccessor()),
            property = ko.utils.unwrapObservable(options.property);
        if (property) {
            $(element).unbind();
            $(element).change(function () {
                if (element.files.length) {
                    var $this = $(this),
                        fileName = $this.val(),
                        bgSrc;

                    if (element.files[0].type.match('image.*')) {
                        bgSrc = window.URL.createObjectURL(element.files[0]);
                    } else if (element.files[0].type.match('video.*')) {
                        bgSrc = "images/videoIcon.png";
                    } else {
                        bgSrc = "images/gradable.png";
                    }

                    var style = $("<style>.no-content::before { content: ''; background-image: url(" + bgSrc +"); background-repeat: no-repeat; background-size: auto 70%; background-position: center center; }</style>");

                    if ($('html > head > style')) {
                        $('html > head > style').remove();
                    }

                    $('html > head').append(style);

                    $('#uploadFM').addClass('no-content');

                    $('.fileUploader + h4 span').text(element.files[0].name);

                    $('.fileUploader ~ button').removeAttr('disabled');

                    //Based on the parent viewmodle, in fileManager, the binding vm is $data, but other views such as ep, the binding is $parent, or $parents[0]
                    if(bindingContext.$parent && bindingContext.$parent[property] && bindingContext.$parent[property] (fileName)) {
                        bindingContext.$parent[property](fileName);
                        // For uploading media not through file manager, we need to call a callback function in the VM to do auto upload with file sharing
                        bindingContext.$parent.filesUploadCallback(element.id);
                    } else if (bindingContext.$parents[1] && bindingContext.$parents[1][property] && bindingContext.$parents[1][property](fileName)){
                        bindingContext.$parents[1][property](fileName);
                        bindingContext.$parents[1].filesUploadCallback(element.id);
                    } else {
                        //In ice4mm, when upload file from EPA page, get fileName from $data and call a callback function in the VM to upload the file.
                        bindingContext.$data[property](fileName);
                        bindingContext.$root.filesUploadCallback(element.id);
                    }
                }
            });
        }
    }
};

//TODO (AH) July 27, 2015: this function should be removed once file management is generically used by all applications.

ko.bindingHandlers.fileUploadNOFileManagement = {
    init: function (element, valueAccessor) {
        $(element).after('<div class="progress"><div class="bar"></div><div class="percent">0%</div></div><div class="progressError"></div>');
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var options = ko.utils.unwrapObservable(valueAccessor()),
            property = ko.utils.unwrapObservable(options.property),
            mmModalID = ko.utils.unwrapObservable(options.mmModalID),
            url = ko.utils.unwrapObservable(options.url);

        if (property && url) {
            $(element).change(function () {
                if (element.files.length) {
                    var $this = $(this),
                        fileName = $this.val();

                    // this uses jquery.form.js plugin
                    $(element.form).ajaxSubmit({
                        url: url,
                        type: "POST",
                        dataType: "text",
                        headers: { "Content-Disposition": "attachment; filename=" + fileName },
                        beforeSubmit: function () {
                            $(".progress").show();
                            $(".progressError").hide();
                            $(".bar").width("0%");
                            $(".percent").html("0%");
                        },
                        uploadProgress: function (event, position, total, percentComplete) {
                            var percentVal = percentComplete + "%";
                            $(".bar").width(percentVal);
                            $(".percent").html(percentVal);
                        },
                        success: function (data) {
                            $(".progress").hide();
                            $(".progressError").hide();
                            var filePath = fileName.split(/\\/g);
                            var theFileName = filePath[filePath.length-1];
                            //make sure the newly uploaded MM can ben shown in mmModal
                            bindingContext.$root.ice4m.getMMFromBucket();
                            bindingContext.$data[property](theFileName);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            $(".progress").hide();
                            $("div.progressError").html(jqXHR.responseText);
                        }
                    });
                }
            });
        }
    }
};

dexit.app.ice.integration.engagementpoint = {};
/**
 * @deprecated Should no longer be used for new integration.  Look at bcp and metrics
 * @param callback
 */
dexit.app.ice.integration.engagementpoint.retrieveAll = function(callback) {
    'use strict';
    var sc_resource = '/engagementpoint/',
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};
/**
 * @deprecated Should no longer be used for new integration. Look at bcp and metrics
 * @param eptId
 * @param callback
 */
dexit.app.ice.integration.engagementpoint.retrieveById = function(eptId, callback) {
    'use strict';
    var sc_resource = '/engagementpoint/?eptId='+eptId,
        restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(sc_resource);
    restStrategy.retrieve(callback);
};





