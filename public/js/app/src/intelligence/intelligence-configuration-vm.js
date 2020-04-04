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
dexit.app.ice.IntelligenceConfigurationVM = function (args) {

    var noOp = function () {};
    var self = this;
    self.appId = 'ice4m';

    self.screenValue = ko.observable('list');


    self.mlEngine = 'watson';
    self.watsonEndpoint = ko.observable('');
    self.apiKey = ko.observable('');
    self.watsonInstanceId = ko.observable('');
    self.description = ko.observable('');
    self.name = ko.observable('')

    self.intelligenceList = ko.observableArray();


    self._getConfig = function() {
        var resource = '/dyn-intelligence-config';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.list(function (err, data) {
            if (err) {
                console.error('could not load');
                self.externalUrl('');
            } else {
                if (data) {
                    self.externalUrl(data.watsonStudioUrl);
                }else {
                    self.externalUrl('');
                }
            }
        });
    };


    self.externalUrl =  ko.observable('');

    self._getConfig();


    /**
     * Show List View
     */
    self.goToList = function () {
        self.screenValue('list');
        self.loadList();
    };



    /**
     * Show Configure View
     */
    self.goToConfigure = function (item) {
        self.loadConfigure(item.name);
        self.screenValue('configure');
    };



    self.loadConfigure = function(name,callback) {
        callback = callback || noOp;
        //var name = 'dynamic';

        var resource = '/dyn-intelligence/'+encodeURIComponent(name)+'/configuration';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.list(function (err, data) {
            if (err) {
                console.error('could not load');
                callback(err);
            }else {


                self.watsonEndpoint(data.configuration.endpoint);
                self.apiKey(data.configuration.apiKey);
                self.watsonInstanceId(data.configuration.instanceId);
                self.description(data.description);
                self.name(data.name);


                callback();
            }

        });
    };


    self.loadList = function (callback) {
        callback = callback || noOp;

        var resource = '/dyn-intelligence/ ';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.list(function (err, data) {
            if (err) {
                console.error('could not load');
                callback(err);
            }else {
                self.intelligenceList(data);
                callback();
            }

        });
    };

    self.save = function (data, callback) {
        callback = callback || noOp;

        var toSend = {
            description: self.description(),
            configuration: {
                endpoint: self.watsonEndpoint(),
                apiKey: self.watsonInstanceId(),
                instanceId: self.watsonInstanceId()
            }
        };


        var resource = '/dyn-intelligence/dynamic/configuration ';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.update(toSend, function (err, data) {
            if (err) {
                console.error('could not load');
                self.goToList();
                callback(err);
            }else {
                self.watsonEndpoint('');
                self.apiKey('');
                self.watsonInstanceId('');
                self.description('');
                self.goToList();
                callback();
            }




        });
    };




};
