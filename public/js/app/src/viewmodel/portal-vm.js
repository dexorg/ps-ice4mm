/**
 * Copyright Digital Engagement Xperiance 2014-2018
 * @description loads portal
 */
/* global _, dexit, ko, async */
/**
 *
 * Main ICE4M VM
 * @param {object} args
 * @param {object} args.user - user object
 * @param {string} args.currentRole -  current (or default) roles to use
 * @param {string} args.bucket - multimedia bucket url
 * @param {string} args.securedSchedule - **unused?
 * @param {string} args.enableBehaviour - (should be a boolean) used by EngagementVM but always seems to be set true regardless
 * @param {string} args.userRoles - comma seperated list of role names
 * @param {string} args.fbUserID - Facebook user identifier
 * @param {string} args.fbAppID - Facebook app identifier
 * @param {string} args.cannedReportsDB - Canned reports datastore
 * @param {string} args.cannedReportsTable = Canned reports table
 * @param {string} args.ice4mURL - ICE4M url to include in message when creating twitter notification
 * @param {string} args.channelAuth - Configuration flag for using old operation combining the FB group member
 * @param {Object.<string, TpChannelType>} args.tpChannelTypes - available channel types for creating touchpoints
 * @param {string} args.allowAddTouchpoint - checking, user group authoring and touchpoint creation (should be a boolean)
 * @param {object} args.ice4mBCs - BC labels for menu
 * @constructor
 */
dexit.app.ice.edu.portal = function(args, mainVM) {
    'use strict';
    var portalVM = this;
    var mainVM = mainVM;
    var noOp = function() {
    };

    //permission observables
    portalVM.KPIPermission = ko.observable(true);
    portalVM.createPermission = ko.observable(false);
    portalVM.deletePermission = ko.observable(false);
    portalVM.listPermission = ko.observable(false);
    portalVM.configurePermission = ko.observable(false);
    portalVM.manageBehPermission = ko.observable(false);
    portalVM.childLinkPermission = ko.observable(false);

    portalVM.allBCDefinitions = [];
    portalVM._getBCDefinition = function(bcType, callback){
        dexit.app.ice.integration.bcm.retrieveBCDefinitionByName(bcType, function(err, bcDef) {
            if (err) {
                console.log('error in BC definition retrieval:' + err);
                callback(new Error(err));
            } else {
                callback(null, bcDef);
            }
        });
    };
    portalVM._getBCPermission = function(bcType, role, callback){
        dexit.app.ice.integration.bcm.retrieveBCPermissionByRole(bcType, role, function(err, bcPermission) {
            if (err) {
                console.log('error in BC permission retrieval:' + err);
                callback(new Error(err));
            } else {
                callback(null, bcPermission);
            }
        });
    };

    /**
     * Load touchpoint definitions for given BC instance VM
     * @param {dexit.app.ice.edu.BCInstanceVM} bcVM
     * @private
     */
    portalVM._populateTouchpoints = function(bcVM){
        //bcVM.populateTouchpoints()
    };

    portalVM._populateBehaviours = function(bcVM, bcIns, behaviourDef, bcSetting) {

        bcVM.behavioursLoading = true;
        var params = {
            id: bcIns.id,
            type: bcSetting.bcType,
            filterArgs: {
                tag: behaviourDef[0].manage.tag ? behaviourDef[0].manage.tag : 'sc',
                local: behaviourDef[0].manage.local ? behaviourDef[0].manage.local : false
            }
        };
        dexit.app.ice.integration.bcp.listBCBehaviours(params, function(err, result){
            if(err){
                console.warn('failed to list BC behaviours:%s',bcIns.id);
                bcVM.behavioursLoading = false;
                //cb(null,{counter: counter, courseVM: bcVM});
                //skip
            }else {
                var behs = [];
                _.each(result, function(beh) {

                    if(beh.property.ds && beh.property.display){
                        //work around for BR display name
                        if(beh.property.eptName){
                            beh.property.display.icon_text = beh.property.display.icon_text +' '+ beh.property.eptName;
                        }

                        var toPush = _.clone(beh.property);
                        var val = (toPush.isAssignedTo ? toPush.isAssignedTo.split('/') : []);
                        var scId = (val && val.length > 0 ? val[val.length-1] : bcIns.id);
                        var toMerge = {
                            behId: beh.id,
                            scId: scId,
                            ds: beh.property.ds,
                            display: beh.property.display,
                            isBR: beh.property.eptName ? true: false,
                            behaviour:beh.property
                        };
                        toPush = _.extend(toPush,toMerge);

                        behs.push(toPush);

                    } else{
                        console.log('digital service not found for this behaviour ' + beh.id);
                    }
                });


                //TODO: make more explicit
                //add in system behaviours
                var scId = bcVM.businessConceptInstance.id;
                var clearBeh = {
                    'type': 'behaviour',
                    'subType': 'clear',
                    'iconType': 'fa fa-eraser',
                    'renderText': 'Clear Region',
                    'scId': scId,
                    'behId': 'system_behaviour_clear_region',
                    'isSystemBehaviour':true,
                    'ds': {
                        'id': 'system_behaviour_clear_region',
                        'serviceId': 'system_behaviour_clear_region',
                        'description': 'clear',
                        'setup': {},
                        'uiElements': {
                            'icon_type': 'fa fa-eraser',
                            'render_text': 'Clear',
                            'subtype': 'clear'
                        }
                    },
                    'title': 'system'
                }
                behs.push(clearBeh)


                bcVM.existingBehaviours(behs);


                bcVM.behavioursLoading = false;


                //cb(null,{counter: counter, courseVM: bcVM});
                // listOfBcInstances.push({counter: counter, courseVM: bcVM});
            }
        });
    };

    /**
     * retrieve available BCis
     * 1 - retrieve all BCis by current BC type
     * 2 - filter by entityRelationships to check userId or Role to decide if the BCi should be in the list
     * @param {object} bcSetting
     * @param {string} bcSetting.bcType
     * @param {object} bcSetting.definition
     * @param {object} bcSetting.definition.definitions
     * @param {object} bcSetting.definition.definitions.intelligence
     * @param {object} bcSetting.definition.definitions.behaviour
     * @param callback
     **/
    //TODO: move the list logic to bcp server side
    portalVM._listBCInstances = function(bcSetting, callback) {
        var listOfBcInstances = [];
        var permission_manageBeh = false;
        var permission_viewBeh = false;
        var permission_viewMetrics = false;;
        //ICEMM-339 prepare the manage/view permission for listing BCi
        //FIXME: expand/change
        if(bcSetting.permission && bcSetting.permission.permission &&  bcSetting.permission.permission.length > 0){

            if (bcSetting.permission.permission.indexOf('view')) {
                permission_viewMetrics = true;
                permission_viewBeh = true;
            }

            if (bcSetting.permission.permission.indexOf('manage')) {
                permission_manageBeh = true;
            }

            var intelligenceDef = bcSetting.definition.definitions.intelligence;
            var metricDef = _.find(intelligenceDef, {name: 'metric'});
            // if(metricDef && _.includes(metricDef.view.roles, bcSetting.role)){
            //     permission_viewMetrics = true;
            // }
            var behaviourDef = bcSetting.definition.definitions.behaviour;
            // if(behaviourDef && _.includes(behaviourDef[0].manage.roles, bcSetting.role)){
            //     permission_manageBeh = true;
            // }
            // if(behaviourDef && _.includes(behaviourDef[0].view.roles, bcSetting.role)){
            //     permission_viewBeh = true;
            // }
        }
        //end of ICEMM-339
        var params = {
            type: bcSetting.bcType,
            role: bcSetting.role
        };

        dexit.app.ice.integration.bcp.retrieveBCiFromEntityRelationshipByRole(params, function(err,res){
            if (err) {
                console.error('failed to load BC instances! ' + err);
                return callback(err);
            }
            res = res || [];
            // var counter = 1;
            // _.each(res, function (val) {
            //     val.counter = counter;
            //     counter++;
            // });

            var handleRetrieveBCInstance = function(bcIns, cb) {

                var bcVM = new dexit.app.ice.edu.BCInstanceVM(bcIns, mainVM);
                portalVM._populateTouchpoints(bcVM);
                //check bc definition if it has permission to manage behaviours
                if(permission_viewMetrics){
                    mainVM.setWidgetReport(bcVM);
                }
                if(permission_manageBeh||permission_viewBeh){
                    portalVM._populateBehaviours(bcVM, bcIns, behaviourDef, bcSetting)
                }

                //initialize permissions inside
                bcVM._preparePermissions();

                // else{
                //     cb(null,{counter: counter, courseVM: bcVM});
                // }
                cb(null,{courseVM:bcVM});
            };


            async.map(res, function(bcInstanceId, cb) {
                var params_retrieve = {
                    repo: mainVM.repo,//should decoupled
                    type: bcSetting.bcType,
                    id: bcInstanceId.bci_id
                };
                dexit.app.ice.integration.bcp.retrieveBCInstance(params_retrieve, function(err, bcIns) {
                    if (err) {
                        return cb(err);
                    }
                    handleRetrieveBCInstance(bcIns, cb);
                });
            }, function (err, result) {

                if (err) {
                    console.error('can not retrieve BC instances: %o',err);
                    return callback(err);
                }
                var toReturn = _.compact(result);
                portalVM.manageBehPermission(permission_manageBeh);
                callback(null,toReturn);

            });

        });
    };
    portalVM.bcSetting = null;
    portalVM.showProducerPortal = function(bcMapping, callback) {
        callback = callback || function () {};
        //avoid rendering page before bc loaded
        mainVM.bcloaded(false);
        mainVM.showBCInstancePage(false);
        mainVM.listOfBcInstances([]);
        var currBCType;
        var childBCType;
        if(_.isString(bcMapping.bctype[0])){
            currBCType = bcMapping.bctype[0];
        }else{
            //set level one bcType, save object value to childBC
            currBCType = _.keys(bcMapping.bctype[0])[0];
            childBCType = _.values(bcMapping.bctype[0]);
            mainVM.currSubBCType(childBCType[0].bctype[0]);
        }
        mainVM.currBCType(currBCType);

        var bcSetting = {
            role: mainVM.currentRole(),
            bcType: currBCType,
            childBC: childBCType,
            permission:[],
            definition:[]
        };
        async.auto({
            retrieveBCDefinition: function(cb){
                //get all bc definitions
                portalVM._getBCDefinition(bcSetting.bcType, function(err, res){
                    if(err){
                        cb(new Error('failed to get bc definition!'+err));
                    } else{
                        mainVM.currBCDef(res);
                        bcSetting.definition = res;
                        cb(null, res);
                    }
                });
            },
            retrievePermission: function(cb){
                portalVM._getBCPermission(bcSetting.bcType, bcSetting.role, function(err, res){
                    if(err){
                        cb(new Error('failed to get bc permission!'+err));
                    } else{
                        bcSetting.permission = res;
                        cb(null, res);
                    }
                });
            },prepareBCPermissions: ['retrieveBCDefinition', 'retrievePermission', function(cb, result){
                //set the create permission
                if(result.retrievePermission){
                    if (_.includes(result.retrievePermission.permission, 'configure')) {
                        portalVM.configurePermission(true);
                    }

                    if(_.includes(result.retrievePermission.permission, 'create') || _.includes(result.retrievePermission.permission, 'manage')){
                        portalVM.createPermission(true);
                        if(result.retrieveBCDefinition.definitions){
                            // var currBCDef = result.retrieveBCDefinition.definitions;
                            // _.each(currBCDef.behaviour, function(obj){
                            //     if(_.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.behDefinePermission(true);
                            //     }
                            // });
                            // _.each(currBCDef.businessRule, function(obj){
                            //     if(_.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.brDefinePermission(true);
                            //     }
                            // });

                            // _.each(currBCDef.intelligence, function(obj){
                            //     if(obj.name.indexOf('metric') > -1 && _.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.metricDefinePermission(true);
                                // }
                                // if(obj.name.indexOf('KPI') > -1 && _.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.kpiDefinePermission(true);
                                // }
                                // if(obj.name.indexOf('segmentReport') > -1 && _.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.segmentReportDefinePermission(true);
                                // }
                                // if(obj.name.indexOf('userProfile') > -1 && _.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.userProfileDefinePermission(true);
                                // }
                            // });
                            // _.each(currBCDef.multimedia, function(obj){
                            //     if(_.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.mmDefinePermission(true);
                                // }
                            // });
                            // _.each(currBCDef.touchpoint, function(obj){
                            //     if(_.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.tpDefinePermission(true);
                                // }
                            // });

                        }
                        if(result.retrieveBCDefinition.relationships){
                            _.each(result.retrieveBCDefinition.relationships.bcRelationships, function(obj){
                                // if(obj.type.indexOf('association') > -1 && _.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.associatedBCDefinePermission(true);
                                // }
                            });
                            _.each(result.retrieveBCDefinition.relationships.entityRelationships, function(obj){
                                // if(obj.type.indexOf('association') > -1 && _.includes(obj.define.roles, bcSetting.role)){
                                    mainVM.associatedEntityDefinePermission(true);
                                // }
                            });

                        }
                    }
                    if(_.includes(result.retrievePermission.permission, 'list') || _.includes(result.retrievePermission.permission, 'view')){
                        portalVM.listPermission(true);
                    } else{
                        portalVM.listPermission(false);
                        //this line is related to UI display
                        mainVM.showFlashInformation('no permission to list '+bcSetting.bcType);
                    }
                    if(_.includes(result.retrievePermission.permission, 'delete')|| _.includes(result.retrievePermission.permission, 'manage')) {
                        portalVM.deletePermission(true);
                    }
                    if(bcSetting.childBC && bcSetting.childBC.length > 0){
                        portalVM.childLinkPermission(true);
                    }
                    //TODO:should check if current BC is linked to engagement pattern, if so, active the EPA
                }
                cb(null, bcSetting);
            }],
            listBCInstances:['prepareBCPermissions', function(cb, result){
                //load first/default bc to portal, check the permission to show components
                if(portalVM.listPermission()){
                    mainVM.bcloaded(true);
                    mainVM.showFlashLoading('loading content, please wait...');
                    portalVM._listBCInstances(bcSetting, function(err, result){
                        if(err){
                            mainVM.showFlashInformation('Failed to load '+bcSetting.bcType);
                        } else if(result && result.length === 0){
                            mainVM.showFlashInformation('You have no '+bcSetting.bcType+'.');
                        } else{
                            //check detailed permission for components of BC
                            mainVM.listOfBcInstances(result);
                        }
                        cb(null, bcSetting);
                    });
                } else {
                    cb(null, bcSetting);
                }
            }]
        }, function(err, res){
            if(err){
                console.log('failed to load producer portal with error: '+err);
            }
            portalVM.bcSetting = res.prepareBC;
            //mainVM.loadDashboardReports();
            callback();
        });
    };

};
