/**
 * @copyright Digital Engagement Xperience 2019
 *
 */
/* global dexit, _ */

/**
 *
 * @param {object} [args]
 * @constructor
 */
dexit.app.ice.RoleManagementVM = function (args) {
    var self = this;
    var noOp = function () {};

    // var permissionList = [
    //     'Offer: manage',
    //     'Offer: view',
    //     'Program: view ',
    //     'Program: manage ',
    //     'Campaign: manage',
    //     'Campaign: view',
    //     'Campaign: epa_update',
    //     'Campaign: epa_approval',
    //     'Campaign: cd_update',
    //     'Campaign: cd_approval',
    //     'Campaign: scheduling',
    //     'Touchpoint: view',
    //     'Touchpoint: manage',
    //     'TP: epa_update',
    //     'TP: epa_approval',
    //     'TP: cd_update',
    //     'TP: cd_approval',
    //     'TP: scheduling',
    //     'metric: manage',
    //     'rm: manage'
    // ];


    //self.permissions = ko.observableArray(permissionList);
    self.permissions = ko.observableArray([]);

    self.availableRoles = ko.observableArray([]);

    self.permissionRole = ko.observableArray([]);

    var appId = 'ice4m';

    self.loadBCPermissions = function(callback) {
        callback = callback || noOp;



        var resource = '/bcm/system-behaviour?application='+encodeURIComponent(appId);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.list(function (err, data) {
            if (err) {
                console.error('could not save');
                callback(err);
            }else {
                self.permissions(data);
                callback();
            }

        });
    };


    self.init = function () {


        self.loadAvailableRoles(function (err, roles) {
            self.availableRoles(roles);

            //self.loadPermissionRole(roles, permissionList);
        });

        self.loadBCPermissions(function () {
            //TODO: show error
        });



        self.populateUsers();



    };

    self.goToList = function() {
        self.roleScreenValue('role');

    };

    self.goToRolePermissionList = function() {
        self.showPermissionTable(false);
        self.roleScreenValue('permission');


    };

    self.roleScreenValue = ko.observable('role');
    self.addRoleVisible = ko.observable(false);
    self.addRoleNameValue = ko.observable('');

    self.showAddRole = function() {
        self.addRoleNameValue('');
        self.addRoleVisible(true);
    };

    self.saveRole = function() {

        //save rold
        var val = self.addRoleNameValue();

        if (!val) {
            return;
        }

        var resource = '/application/'+ appId + '/role';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.create({role:val},function (err) {
            if (err) {
                console.error('could not save');
            }else {
                self.init();
            }

        });


        //hide
        self.addRoleVisible(false);

    };


    self.configureRoleUserVisible = ko.observable(false);


    self.originalRoleUser = [];

    self.showRoleUser = function(obj){

        self.selectedRole(obj);
        self.configureRoleUserVisible(true);

        self.getUsersForRole(obj, function (err, val) {

            var selectedUsers = val || [];
            self.selectedRoleUsers(selectedUsers);
            self.originalRoleUser = _.clone(selectedUsers);

        });



    };

    self._addUserToRole = function(user, role, cb) {
        var resource = '/application/'+ appId + '/role/'+ encodeURIComponent(role) +'/user';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.create({user:user},function (err) {
            cb(err);
        });
    };

    self._removeUserFromRole = function(user, role, cb) {
        var resource = '/application/'+ appId + '/role/'+ encodeURIComponent(role) +'/user/' + encodeURIComponent(user);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.destroy(function (err) {
            cb(err);
        });
    };


    self.saveRoleUser = function(arg1, arg2){
        //calculate different
        var role =  self.selectedRole();
        var selected = self.selectedRoleUsers();


        //removed
        var removed = _.difference(self.originalRoleUser, selected);
        //added
        var added = _.difference(selected, self.originalRoleUser);



        async.auto({
            added: function (cb) {
                async.each(added, function (user, done) {
                    self._addUserToRole(user,role,done);
                }, cb);
            },
            removed: function (cb) {
                async.each(removed, function (user, done) {
                    self._removeUserFromRole(user,role,done);
                }, cb);
            }
        }, function (err, results) {
            self.selectedRole(null);
            self.configureRoleUserVisible(false);
        });









    };


    self.selectedRole = ko.observable();

    self.availableUsers = ko.observableArray([]);

    self.selectedRoleUsers = ko.observableArray([]);


    self.populateUsers = function() {
        //get all available users


        var resource = '/app/user';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.list(function (err, data) {
            if (err) {
                console.error('could not load users');
            }else {
                self.availableUsers(data);
            }

        });

    };


    self.getUsersForRole = function(role, callback) {
        if (!role) {
            console.warn('no role selected...exiting');
            return callback();
        }
        var resource = '/application/'+ appId + '/role/'+encodeURIComponent(role) + '/user';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.list(function (err, data) {
            if (err) {
                console.error('could not save');
                callback(err);
            }else {
                callback(null, data);
            }

        });
    };



    self.deleteRole = function(roleName){

        if (!roleName) {
            console.warn('no role name specified');
            return;
        }

        var resource = '/application/'+ appId + '/role/' + encodeURIComponent(roleName);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.destroy(function (err) {
            if (err) {
                console.error('problem removing role %s: %o',roleName, err);
            }
            $('.popover').popover('hide');
            self.availableRoles.remove(roleName);
        });
        // restStrategy.create({role:val},function (err) {
        //     if (err) {
        //         console.error('could not save');
        //     }else {
        //         self.init();
        //     }
        //
        // });
    };
    self.selectedRoles = ko.observableArray([]);
    self.showPermissionTable = ko.observable(false);

    self.disableRolePermissionSave = ko.observable(false);

    self.loadPermissionRoleTable = function() {
        var roles = self.selectedRoles();
        self.showPermissionTable(true);


        self.loadPermissionRole(roles, self.permissions());

    };




    self.getPermissionsForRole = function(roleName, bc) {
        var resource = '/application/'+ appId + '/role/' + encodeURIComponent(roleName);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.destroy(function (err) {
            if (err) {
                console.error('problem removing role %s: %o',roleName, err);
            }
            $('.popover').popover('hide');
            self.availableRoles.remove(roleName);
        });
    };


    self.originalPermissionRole = [];

    self.loadCurrentRoleBCPermissions = function(callback) {
        var resource = '/bcm/role-bc-system-behaviour?application='+encodeURIComponent(appId);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.list(function (err, data) {
            if (err) {
                console.error('problem retrieve current role-bc-permissions %o', err);
                return callback(err);
            }

            callback(null, data);

        });
    };


    self.loadPermissionRole = function(roles, permissionList) {

        self.loadCurrentRoleBCPermissions(function (err, data) {
            if (err) {
                //TODO: failed to load
            }
            var currentBCRolePermissions = data || [];

            var perRole = _.map(permissionList, function (permission) {
                var roleSelection = [];

                var permissionName = permission.name;
                var bcLabel = permission.bcLabel;
                var bcType = permission.bcType;
                _.each(roles, function (role) {

                    var existing = _.find(currentBCRolePermissions, function (item) {
                        return (item.bcType === bcType && permissionName === item.name && role === item.role );
                    });
                    var selected = (existing ? true : false);
                    roleSelection.push({roleName: ko.observable(role), selected: ko.observable(selected)});
                });
                return {bcType: bcType, bcLabel: bcLabel, name: permissionName,  roleSelection: roleSelection };
            });
            self.permissionRole(perRole);
            self.originalPermissionRole = ko.toJS(self.permissionRole());
        });
    };

    self.saveRolePermission = function(data, data) {


        function flatten(arr) {


            var flat = [];

            //var rolePerm = {};

            _.each(arr, function (item) {
                var bc = item.bcType;
                var permission = item.name;
                var selected = _.filter(item.roleSelection, function (roleSelect) {
                    return (ko.utils.unwrapObservable(roleSelect.selected));
                });

                var roles = _.map(selected, function(selected) {
                    return ko.utils.unwrapObservable(selected.roleName);
                });

                _.each(roles, function (role) {
                    //
                    // if (!rolePerm[role]) {
                    //     rolePerm[role] = [];
                    // }
                    // rolePerm[role].push({bcType: bc, permission: permission});


                    flat.push({role:role,bcType: bc, permission: permission});

                });

            });
            //return rolePerm;
            return flat;
        }

        var modified = flatten(self.permissionRole());
        var original = flatten(self.originalPermissionRole);




        //calculate changes
        var removed = _.differenceWith(original, modified, function (val, val2) {
            return (val && val2 && val.role === val2.role && val.bcType === val2.bcType && val.permission === val2.permission);
        });
        var added = _.differenceWith(modified, original, function (val, val2) {
            return (val && val2 && val.role === val2.role && val.bcType === val2.bcType && val.permission === val2.permission);
        });


        var changes = [];
        if (removed.length > 0) {
            changes.push({op:'remove', value: removed});
        }
        if (added.length > 0) {
            changes.push({op:'add', value: added});
        }

        var resource = '/bcm/role-bc-system-behaviour/change?application='+encodeURIComponent(appId);
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);


        //TODO: disable button
        self.disableRolePermissionSave(true);

        restStrategy.create(changes,function (err, res) {
            if (err) {
                console.error('could update load any role bc sb', err);
            }else {

            }

            //enable button and reload
            self.loadPermissionRoleTable();

            self.disableRolePermissionSave(false);


        });





        //calculate removed




        //for each role run set



        //now calculate difference

        // //bcLabel, bcType, name, roleSelection - selected (role)
        // _.each(self.permissionRole(), function (item) {
        //
        //     var bc = item.bcType;
        //     var roles = item.roleSelection;
        //
        //     //selected
        //     var selectedRoles = _.filter(item.roleSelection, function (roleSelect) {
        //
        //     });
        //
        //
        //     //unselected
        //     var unselectedRoles = _.filter(item.roleSelection, function (roleSelect) {
        //
        //     });
        //
        //
        //
        //
        //
        //
        // });

    };

    self.loadAvailableRoles = function (callback) {

        var resource = '/application/'+ appId + '/role';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, res) {
            if (err) {
                console.error('could not load any roles');
                callback(null,[]);
            }else {
                var data = _.map(res, 'name');
                callback(null, data);
            }
        });
    };






};
