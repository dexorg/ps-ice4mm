/**
 * Copyright Digital Engagement Xperience 2018
 * @description VM for managing performance reports
*/

/* global dexit, ko, async, CognosApi */

/**
 *
 * @param {dexit.app.ice.edu.BCInstanceVM} args.parentVM
 * @param {dexit.app.ice.ccEDCreateVM} [args.ccEDCreateVM]
 * @constructor
 */
dexit.app.ice.EPPerformanceVM2 = function(args) {
    var self = this;

    var noOp = function () {
    };
    self.session = {};
    var parentVM = args.parentVM;
    self.ccEDCreateVM = args.ccEDCreateVM;

    self.initialized = false;


    self.kpiReportVMs = ko.observableArray();
    self.kpiReports = ko.observableArray();

    self.selectedDashboardIntelligence = ko.observableArray();

    //holds the selections in the settings dialog before save is hit
    self.tempSelectedDashboardIntelligence = ko.observableArray();

    self.availableDashboardIntelligence = ko.observableArray();
    self.groupedDashboardIntelligence = ko.pureComputed(function () {

        var intel = self.availableDashboardIntelligence();
        if (intel.length < 1) {
            return [];
        }
        //group available into array of array
        var groupedIntel = _
            .chain(intel)
            .map(function (val) {
                val.classification = val.classification.toLowerCase();
                return val;
            })
            .groupBy('classification')
            .map(function (value, key) {
                return {
                    name: key,
                    items: value
                };
            })
            .value();
        return groupedIntel;
    });


    self.enableSaveDashboardIntelligence = ko.observable(true);

    self.enableLoadKPIReport = ko.observable(false);

    self.performanceSettingModalVisible = ko.observable(false);

    self.showPerformanceSettings = function () {

        self.tempSelectedDashboardIntelligence(self.selectedDashboardIntelligence());
        self.performanceSettingModalVisible(true);
    };


    self.title = ko.pureComputed(function () {
        return 'Showing ' + self.selectedDashboardIntelligence().length + '/' + self.availableDashboardIntelligence().length + ' Reports';
    });


    self.performanceReportModalVisible = ko.observable(false);
    self.selectedPerformanceReportModalVM = ko.observable();

    self.selectedPerformanceReportModalTitle = ko.observable('');

    self.showPerformanceReportModal = function (index) {
        // var val = self.kpiReports()[index];
        //
        // var args = {
        //     elementId: 'large-kpi-chart',
        //     report: {
        //         definition: val.definition,
        //         type: (val.definition && val.definition.type || 'kpiReport'),
        //         title: val.name
        //     }
        // };
        // if (val.definition.presentation) {
        //     args.report.chartType = val.definition.presentation.chartType;
        //     args.report.options = val.definition.presentation.chartOptions;
        // }
        //
        // if (val.definition.bizObjectiveMetrics && val.definition.bizObjectiveMetrics.length > 0) {
        //     args.report.bizObjectiveMetrics = [];
        //     _.each(val.definition.bizObjectiveMetrics, function (metricId) {
        //         //find metric and show matching name and number
        //         _.each(self.bizObjectives(), function (val) {
        //             if (val.selectedMetric === metricId) {
        //
        //                 var bcData = self.bcData;
        //                 var intel = _.find(bcData.intelligence, function (val) {
        //                     return (val.property && val.property.location == metricId);
        //                 });
        //
        //
        //                 //find metric name
        //
        //                 var toShow = (intel && intel.property && intel.property.definition && intel.property.definition.metricName ? intel.property.definition.metricName : metricId);
        //
        //                 args.report.bizObjectiveMetrics.push({name: toShow, target: val.selectedThreshold});
        //             }
        //         })
        //     });
        //
        //     self.currentBizObjectives(args.report.bizObjectiveMetrics);
        //
        // }
        //
        //
        // var overrideParams = null;
        // //ICEMM-947 workaround, assumption: height is at end of string
        // if (val.definition.location) {
        //     overrideParams = {height: 400}
        // }
        //
        //
        // self.performanceReportModalVisible(true);
        // $('#large-kpi-chart').empty();
        //
        // //TODO: calculate based on screen size, how to preserve aspect ratio
        // args.report.options.width = 600;
        // args.report.options.height = 450;
        //
        //
        // self.selectedPerformanceReportModalTitle(val.name);
        // var vm = new dexit.app.ice.KpiReportVM(args);
        // self.selectedPerformanceReportModalVM(vm);
        // setTimeout(function () {
        //
        //     vm.loadReport(null, overrideParams);
        // }, 100);

    };


    self.onError = function (err, p1, p2) {
        console.log('error');
        debugger;
    };


    self.ajax = function (options) {
        return new Promise(function (resolve, reject) {
            $.ajax(options).done(resolve).fail(reject);
        });
    };


    self.cleanup = function () {
        if (self.api) {
            self.api.off(CognosApi.EVENTS.REQUEST_ERROR, self.onError);
            return self.api.close();
        }
    };




    self.initCognos = function (callback) {
        var cb = callback || noOp;
        if (self.initialized) {
            return cb();
        }

        debugger;
        self.ajax({url: '/api/dde/session', dataType: 'json', type: 'GET'}).then(function (data) {
            debugger;
            self.session.code = data.sessionCode;
            self.session.id = data.sessionId;
            self.session.keys = data.keys;

            self.api = new CognosApi({
                cognosRootURL: 'https://dde-us-south.analytics.ibm.com/daas/',
                sessionCode: self.session.code,
                initTimeout: 10000,
                node: document.getElementById(
                    'ddeDashboard')
            });


            return self.api.initialize();

        }).then(function () {
            self.api.on(CognosApi.EVENTS.REQUEST_ERROR, self.onError);
            self.initialized = true;
            cb();

        }).catch(function (err) {
            debugger;
            cb();
        });

        // await this.getDashboardSampleSpec();
        // this.dashboardAPI = await
        // this.api.dashboard.openDashboard({
        //     dashboardSpec: this.sample_db_spec
        // });

        //this.dashboardAPI = await this.api.dashboard.createNew();
    };

    self.createDashboard = function(callback) {

        var cb = callback || noOp;
        self.dashboardAPI = null;
        $('#ddeDashboard').height(500);
        self.api.dashboard.createNew().then(
            function(dashboardAPI) {
                debugger;
                console.log('Dashboard created successfully.');
                self.dashboardAPI = dashboardAPI;
                //set height
                $('#ddeDashboard').height(500);

                //configure dashboard

                cb();

            }
        ).catch(
            function(err) {
                debugger;
                console.log('some error on creating new dashboard');
                if (!self.dashboardAPI) {
                    cb(err);
                }
            }
        );
    };



    self.load = function () {


        async.auto({
            init: function (cb) {
                if (!self.initialized) {
                    self.initCognos(cb);
                } else {
                    cb();
                }
            },
            show: ['init', function (results, cb) {
                var bcId, bcType, currentRole;
                if (parentVM) {
                    bcId = parentVM.businessConceptInstance.id;
                    bcType = parentVM.mainVM.currBCType();
                    currentRole = parentVM.mainVM.currentRole();
                } else {
                    bcId = self.bcId;
                    bcType = self.bcType;
                    currentRole = self.role;
                }
                debugger;
                self.loadAvailableEngReports(bcType, function () {
                    //load after available
                    self.loadPerformanceReports(bcId, bcType, currentRole);
                });


            }]
        }, function (err, results) {

        });
    };

    self.init = function(args){
        self.bcId = args.bcId;
        self.bcType = args.bcType;
        self.role = args.role;
    };

    function parseBizObjectives(bcData) {
        var bo = bcData.property.biz_objectives;
        if (bo) {
            //parse
            if (!_.isArray(bo)) {
                bo = [bo];
            }
            bo = _.map(bo, function(val) {
                if (_.isString(val)) {
                    try {
                        val = JSON.parse(val);
                        return val;
                    }catch(e){
                    }
                }
            });

            self.bizObjectives(bo);

            //prepare bixObjectives
            //self.selectedBizObjectives
        }
    }

    self.bizObjectives = ko.observableArray([]);
    self.currentBizObjectives = ko.observableArray([]);


    self.loadAvailableEngReports = function (bciType, callback) {
        callback = callback || noOp;
        var bcType = bciType;
        dexit.app.ice.integration.bcm.retrieveBCDefinitionIntelligence(bcType, function (err, availableEngIntelligence) {
            if (err) {
                console.log('error in BC definition retrieval:%o', err);
                callback(new Error(err));
            } else {
                var intel = availableEngIntelligence || [];

                self.availableDashboardIntelligence(intel);
                callback(null, intel);
            }
        });

    };

    self.loadPerformanceReports = function (bcId, bcType, role) {
        debugger;
        //for cognos the whole area is the dashboard

        var chartArea = $('.performance-report-chart');



        // chartArea.empty();
        // self.kpiReportVMs([]);
        self.kpiReportVMs([]);
        self.selectedDashboardIntelligence([]);

        var queryParams = {};


        async.auto({
            loadBC: function (cb) {
                //load intelligence
                var params = {
                    id: bcId,
                    type: bcType,
                    queryParams: {},

                };
                // if (self.selectedCourse() && !self.showDashboard()) {
                //     return cb(null, self.selectedCourse().courseVM.businessConceptInstance.intelligence);
                // }

                dexit.app.ice.integration.bcp.retrieveBCInstance(params, function (err, data) {
                    if (err) {
                        console.error('err=' + JSON.stringify(err));
                        cb(err);
                    } else {
                        self.bcData = data;
                        parseBizObjectives(data);
                        //FIXME: workaround remove duplicate intelligence ICEMM-707
                        var dat = _.uniqBy(data.intelligence, 'id');
                        cb(null, dat);
                    }
                });
            },
            loadData: ['loadBC', function (cb, result) {
                var found = _.filter(result.loadBC, function (val) {
                    return (val.property && val.property.present_eng_report && val.property.role && val.property.role === role);
                });



                var intel = _.map(found, function (val) {
                    if (_.isString(val.property.definition)) {
                        val.property.definition = JSON.parse(val.property.definition);
                    }
                    return val;
                });

                if (intel.length < 1) {
                    return cb();
                }

                //set selected
                var selectedIds = _.map(intel, 'property.name');
                self.selectedDashboardIntelligence(selectedIds);




                // if (self.selectedCourse() && !self.showDashboard()) {
                //     bcId = self.selectedCourse().courseVM.businessConceptInstance.id;
                // } else  {
                //     bcId = self.currBCRoleMapping().id;
                // }


                //is there a dashboard available?  if not then create one with the sources
                var dbSpec = (found && found.length > 0 && found[0].property._db_spec ? found[0].property._db_spec : '');
                if (dbSpec) {
                    debugger;
                    self.api.dashboard.openDashboard({
                        dashboardSpec: dbSpec, //todo
                    }).then(function(dashboardAPI) {
                        console.log('Dashboard opened successfully.');
                        self.dashboardApi = dashboardAPI;
                        cb();
                    });
                    //create it
                }else {

                    //build datasources and add
                    self.createDashboard(function (err) {
                        if (err) {
                            alert('could not create dashboard...please check your configuration');
                            return cb(err);
                        }

                        debugger;



                        var sources = [];


                        //add kpiReports as datasources
                        _.each(intel, function (val, done) {
                            if (val.property.definition && val.property.definition.type && val.property.definition.type === 'external') {
                                console.warn('this type of report is not support for the current dashboard');
                            }else {
                                var def = val.property.definition;

                                var columns = _.map(def.column, function (field) {
                                    var dataType = 'NVARCHAR(36)'; //default

                                    if (field.type === 'number') {
                                        dataType = 'DOUBLE';
                                    }

                                    return {
                                        'datatype': dataType, //(INTEGER|NVARCHAR(n)|...)
                                        'nullable': true,
                                        'name': field.name,
                                        'description': field.name,
                                        'label': field.name || field.label,
                                        'usage': 'automatic', // (attribute|fact|identifier|automatic)
                                        'regularAggregate': 'none' //specific aggregation (total|average|maximum|...)
                                    };
                                });

                                var tableSpec = {
                                    'name': 't_'+val.property.name,
                                    'column': columns
                                };

                                var params = {
                                    id: bcId,
                                    type: bcType,
                                    intelId: val.id,
                                    queryParams: {},

                                };
                                var dsUrl = '/bcp/businessconcept/' + encodeURIComponent(params.type) + '/' + encodeURIComponent(params.id) + '/intelligence/' + encodeURIComponent(params.intelId) + '/data';

                                // var params = {id: val.definition.refId, type: val.definition.refType, metricId: columnElement};
                                // var dsUrl = '/bcp/businessconcept/'+name + '/' + params.id + '/metric/'+metricId+'/data' + (queryParams ? ('?'+ $.param(queryParams)) : '');
                                var dsMod = {
                                    'table': tableSpec,
                                    'label': val.property.name,
                                    'identifier': val.property.name+'-'+val.property.id,
                                    'xsd': 'https://ibm.com/daas/module/1.0/module.xsd',
                                    'source': {
                                        'id': 'source-'+val.property.id,
                                        'srcUrl': {
                                            'sourceUrl': dsUrl, // "/data/customers_orders1_opt.csv", //to resolve data
                                            'mimeType': 'text/csv',
                                            'property': [
                                                {
                                                    'name': 'headers',
                                                    'value': [
                                                        {
                                                            'name': 'x-return-type',
                                                            'value': 'text/csv'
                                                        }//,
                                                        // {
                                                        //     'name': 'x-header-2',
                                                        //     'value': 'someotherheadervalue'
                                                        // }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                };
                                debugger;


                                var ds = {
                                    module: dsMod,
                                    id: val.id, //unique id, used to reference it when calling updateModuleDefinitions
                                    name: val.property.name
                                };

                                sources.push(ds);

                            }
                        });
                        //add datasources
                        self.dashboardAPI.addSources(sources);

                        cb();

                    });



                }



                // async.each(intel, function (val, done) {
                //     var params = {
                //         id: bcId,
                //         type: bcType,
                //         intelId: val.id,
                //         queryParams: {},
                //
                //     };
                //     if (val.property.definition && val.property.definition.type && val.property.definition.type === 'external') {
                //         var report = _.extend({}, val.property);
                //
                //
                //         report.definition.location = report.definition.location.replace('{{bcInstanceId}}', bcId);
                //         //ICEMM-950: workaround, set width to 200 for when location is specified
                //         report.definition.location = report.definition.location + '&height=225';
                //
                //         self.kpiReports.push(report);
                //         done();
                //
                //     } else {
                //
                //         dexit.app.ice.integration.bcp.retrieveBCInstanceIntelData(params, function (err, data) {
                //             if (err) {
                //                 console.error('err=%o', err);
                //                 done(err);
                //             } else {
                //                 var report = _.extend({}, val.property);
                //                 report.definition.data = data;
                //
                //                 self.kpiReports.push(report);
                //                 done();
                //             }
                //
                //         });
                //
                //     }
                // }, cb);
            }],
        }, function (err, result) {
            // var chartArea =$('#charts-here');
            // chartArea.empty();


            debugger;
            // var bcData = result.loadBC;
            //
            // var found = _.filter(result.loadBC, function (val) {
            //     return (val.property && val.property.present_eng_report && val.property.role && val.property.role === role);
            // });
            //
            //
            // var dbSpec = (found && found.length > 0 && found[0].property._db_spec ? found[0].property._db_spec : '');
            // if (!dbSpec) {
            //     //create it
            // }

            //check if dashboard reference is part of it


            self.kpiReportVMs([]);

            self.enableLoadKPIReport(true);
            // if (self.kpiReports().length > 0) {
            //     debugger;
            //
            //     self.createDashboard(function (err) {
            //         debugger;
            //
            //
            //         //add kpiReports as datasources
            //         _.each(self.kpiReports(), function (val, index) {
            //
            //
            //             var columns = _.map(val.definition.column, function (field, index) {
            //                 var dataType = 'NVARCHAR(36)'; //default
            //
            //                 if (field.type === 'number') {
            //                     dataType = 'DOUBLE';
            //                 }
            //
            //                 return {
            //                     'datatype': dataType, //(INTEGER|NVARCHAR(n)|...)
            //                     'nullable': true,
            //                     'name': field.name,
            //                     'description': field.name,
            //                     'label': field.name || field.label,
            //                     'usage': 'automatic', // (attribute|fact|identifier|automatic)
            //                     'regularAggregate': 'none' //specific aggregation (total|average|maximum|...)
            //                 };
            //             });
            //
            //             var tableSpec = {
            //                 'name':val.name,
            //                 'columns':columns
            //             };
            //
            //             // var params = {id: val.definition.refId, type: val.definition.refType, metricId: columnElement};
            //             // var dsUrl = '/bcp/businessconcept/'+name + '/' + params.id + '/metric/'+metricId+'/data' + (queryParams ? ('?'+ $.param(queryParams)) : '');
            //             var dsMod = {
            //                 'table': tableSpec,
            //                 'xsd': 'https://ibm.com/daas/module/1.0/module.xsd',
            //                 'source': {
            //                     'id': 'StringID',
            //                     'srcUrl': {
            //                         'sourceUrl': dsUrl, // "/data/customers_orders1_opt.csv", //to resolve data
            //                         'mimeType': 'text/csv',
            //                         'property': [
            //                             {
            //                                 'name': 'headers',
            //                                 'value': [
            //                                     {
            //                                         'name': 'x-header-1',
            //                                         'value': 'someheadervalue'
            //                                     },
            //                                     {
            //                                         'name': 'x-header-2',
            //                                         'value': 'someotherheadervalue'
            //                                     }
            //                                 ]
            //                             }
            //                         ]
            //                     }
            //                 }
            //             };
            //
            //
            //             var ds = {
            //                 module: dsMod,
            //                 id: val.id, //unique id, used to reference it when calling updateModuleDefinitions
            //                 name:val.name
            //             };
            //             self.dashboardAPI.addSource(ds);
            //
            //
            //
            //         });
            //
            //
            //         //add datasources
            //
            //     });
            //
            //
            //
            //     // _.each(self.kpiReports(), function (val, index) {
            //     //     //chartArea.append('<div class="chart-wrapper col-sm-5"><div id="camp-kpi-chart-div' + index + '"></div></div>');
            //     //     var args = {
            //     //         elementId: 'camp-kpi-chart-div' + index,
            //     //         report: {
            //     //             definition: val.definition,
            //     //             type: (val.definition && val.definition.type || 'kpiReport'),
            //     //             title: val.name,
            //     //             classification: val.classification
            //     //         }
            //     //     };
            //     //     if (val.definition.presentation) {
            //     //         args.report.chartType = val.definition.presentation.chartType;
            //     //         args.report.options = val.definition.presentation.chartOptions;
            //     //     }
            //     //     debugger;
            //     //     var vm = new dexit.app.ice.KpiReportVM(args);
            //     //     //for KPI report metrics, the id should be referred from top-level instance we set in bc_role_mapping
            //     //     self.kpiReportVMs.push(vm);
            //     //     vm.loadReport();
            //     // });
            //
            // } else {
            //     self.enableLoadKPIReport(true);
            // }

        });
    };


    self.saveSettings = function () {
        if (!self.enableSaveDashboardIntelligence()) {
            //ignore any input if set to false
            return;
        }

        var bcId, bcType, currentRole;
        if (parentVM) {
            bcId = parentVM.businessConceptInstance.id;
            bcType = parentVM.mainVM.currBCType();
            currentRole = parentVM.mainVM.currentRole();
        } else {
            bcId = self.bcId;
            bcType = self.bcType;
            currentRole = self.role;
        }
        self.saveDashboardIntelligence(currentRole, bcId, bcType);

    };

    /**
     * Updates intelligence to be presented on dashboard
     * @param {string} role - role to associated with intelligence to present
     */
    self.saveDashboardIntelligence = function (role, bcId, bcType) {
        //todo:
        debugger;
    };

    self.saveDashboardSpec = function() {
        self.dashboardAPI.getSpec().then(function (spec) {

        });
    };


    self.addNew = function() {
        var bcId,bcType;
        if (parentVM) {
            bcId = parentVM.businessConceptInstance.id;
            bcType = parentVM.mainVM.currBCType();
        } else {
            bcId = self.bcId;
            bcType = self.bcType;
        }
        self.ccEDCreateVM.setFilters({
            bc:bcType,
            id:bcId
        });
        var saveCallback = function(){
            self.loadAvailableEngReports(bcType);
        };


        self.ccEDCreateVM.show(saveCallback);
    };


    self._load4PaneDashboard = function (dataSources) {

        var s = {
            "name": "Standard Dashboard",
            "layout": {
            "id": "page0",
                "items": [{
                "id": "page1",
                "css": "templateBox aspectRatio_default",
                "items": [{
                    "id": "page2",
                    "style": {
                        "top": "0%",
                        "left": "0%",
                        "right": "50%",
                        "bottom": "50%"
                    },
                    "type": "templateDropZone",
                    "templateName": "dz1",
                    "relatedLayouts": "|model00000168d867a3f5_00000000|"
                }, {
                    "id": "page3",
                    "css": "noBorderLeft",
                    "style": {
                        "top": "0%",
                        "left": "50%",
                        "right": "0%",
                        "bottom": "50%"
                    },
                    "type": "templateDropZone",
                    "templateName": "dz2",
                    "relatedLayouts": "|model00000168d86835b0_00000002|"
                }, {
                    "id": "page4",
                    "css": "noBorderTop",
                    "style": {
                        "top": "50%",
                        "left": "0%",
                        "right": "50%",
                        "bottom": "0%"
                    },
                    "type": "templateDropZone",
                    "templateName": "dz3",
                    "relatedLayouts": "|model00000168d8680ccc_00000002|"
                }, {
                    "id": "page5",
                    "css": "noBorderLeft noBorderTop",
                    "style": {
                        "top": "50%",
                        "left": "50%",
                        "right": "0%",
                        "bottom": "0%"
                    },
                    "type": "templateDropZone",
                    "templateName": "dz4"
                }, {
                    "id": "model00000168d86835b0_00000002",
                    "style": {
                        "top": "0.24752475247524752%",
                        "left": "50%",
                        "height": "49.504950495049506%",
                        "width": "49.86413043478261%"
                    },
                    "type": "widget",
                    "relatedLayouts": "page3"
                }, {
                    "id": "model00000168d8680ccc_00000002",
                    "style": {
                        "top": "50%",
                        "left": "0.1358695652173913%",
                        "height": "49.75247524752475%",
                        "width": "49.72826086956522%"
                    },
                    "type": "widget",
                    "relatedLayouts": "page4"
                }, {
                    "id": "model00000168d867a3f5_00000000",
                    "style": {
                        "top": "0.24752475247524752%",
                        "left": "0.1358695652173913%",
                        "height": "49.504950495049506%",
                        "width": "49.72826086956522%"
                    },
                    "type": "widget",
                    "relatedLayouts": "page2"
                }],
                "type": "scalingAbsolute"
            }],
                "type": "container",
                "templateName": "Template9"
        },
            "theme": "defaultTheme",
            "version": 1009,
            "eventGroups": [{
            "id": "page1:1",
            "widgetIds": ["model00000168d867a3f5_00000000", "model00000168d8680ccc_00000002", "model00000168d86835b0_00000002"]
        }],
            "properties": {
            "defaultLocale": "Default"
        },
            "pageContext": [],
            "dataSources": {
            "version": "1.0",
                "sources": [{
                "id": "model00000168d865927b_00000001",
                "assetId": "assetId00000168d865927a_00000000",
                "clientId": "0bfb59ad-9942-45d8-af45-0f49de0f8746",
                "module": {
                    "table": {
                        "name": "t_Revenue",
                        "column": [{
                            "datatype": "NVARCHAR(36)",
                            "nullable": true,
                            "name": "val",
                            "description": "val",
                            "label": "val",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }, {
                            "datatype": "DOUBLE",
                            "nullable": true,
                            "name": "total",
                            "description": "total",
                            "label": "total",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }, {
                            "datatype": "DOUBLE",
                            "nullable": true,
                            "name": "eVoucher",
                            "description": "eVoucher",
                            "label": "eVoucher",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }, {
                            "datatype": "DOUBLE",
                            "nullable": true,
                            "name": "eOrder",
                            "description": "eOrder",
                            "label": "eOrder",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }, {
                            "datatype": "DOUBLE",
                            "nullable": true,
                            "name": "eRecharge",
                            "description": "eRecharge",
                            "label": "eRecharge",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }]
                    },
                    "label": "Revenue",
                    "identifier": "Revenue-282",
                    "xsd": "https://ibm.com/daas/module/1.0/module.xsd",
                    "source": {
                        "id": "source-282",
                        "srcUrl": {
                            "sourceUrl": "/bcp/businessconcept/ProgramGroup/d7b05541-f64d-46a0-a428-9da37d0fc9c6/intelligence/0bfb59ad-9942-45d8-af45-0f49de0f8746/data",
                            "mimeType": "text/csv",
                            "property": [{
                                "name": "headers",
                                "value": [{
                                    "name": "x-return-type",
                                    "value": "text/csv"
                                }]
                            }]
                        }
                    }
                },
                "name": "Revenue",
                "shaping": {
                    "embeddedModuleUpToDate": true
                }
            }, {
                "id": "model00000168d865927f_00000002",
                "assetId": "assetId00000168d865927f_00000000",
                "clientId": "ba833b20-a068-4958-a1fc-5f38547e1982",
                "module": {
                    "table": {
                        "name": "t_Visits",
                        "column": [{
                            "datatype": "NVARCHAR(36)",
                            "nullable": true,
                            "name": "name",
                            "description": "name",
                            "label": "name",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }, {
                            "datatype": "DOUBLE",
                            "nullable": true,
                            "name": "volume",
                            "description": "volume",
                            "label": "volume",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }]
                    },
                    "label": "Visits",
                    "identifier": "Visits-382",
                    "xsd": "https://ibm.com/daas/module/1.0/module.xsd",
                    "source": {
                        "id": "source-382",
                        "srcUrl": {
                            "sourceUrl": "/bcp/businessconcept/ProgramGroup/d7b05541-f64d-46a0-a428-9da37d0fc9c6/intelligence/ba833b20-a068-4958-a1fc-5f38547e1982/data",
                            "mimeType": "text/csv",
                            "property": [{
                                "name": "headers",
                                "value": [{
                                    "name": "x-return-type",
                                    "value": "text/csv"
                                }]
                            }]
                        }
                    }
                },
                "name": "Visits",
                "shaping": {
                    "embeddedModuleUpToDate": true
                }
            }, {
                "id": "model00000168d8659281_00000002",
                "assetId": "assetId00000168d8659281_00000000",
                "clientId": "3f5a1898-9b4b-417c-892e-89d4ac8d8e98",
                "module": {
                    "table": {
                        "name": "t_Monthly Traffic",
                        "column": [{
                            "datatype": "NVARCHAR(36)",
                            "nullable": true,
                            "name": "name",
                            "description": "name",
                            "label": "name",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }, {
                            "datatype": "DOUBLE",
                            "nullable": true,
                            "name": "value",
                            "description": "value",
                            "label": "value",
                            "usage": "automatic",
                            "regularAggregate": "none"
                        }]
                    },
                    "label": "Monthly Traffic",
                    "identifier": "Monthly Traffic-392",
                    "xsd": "https://ibm.com/daas/module/1.0/module.xsd",
                    "source": {
                        "id": "source-392",
                        "srcUrl": {
                            "sourceUrl": "/bcp/businessconcept/ProgramGroup/d7b05541-f64d-46a0-a428-9da37d0fc9c6/intelligence/3f5a1898-9b4b-417c-892e-89d4ac8d8e98/data",
                            "mimeType": "text/csv",
                            "property": [{
                                "name": "headers",
                                "value": [{
                                    "name": "x-return-type",
                                    "value": "text/csv"
                                }]
                            }]
                        }
                    }
                },
                "name": "Monthly Traffic",
                "shaping": {
                    "embeddedModuleUpToDate": true
                }
            }]
        },
            "drillThrough": [],
            "widgets": {
            "model00000168d867a3f5_00000000": {
                "id": "model00000168d867a3f5_00000000",
                    "data": {
                    "dataViews": [{
                        "modelRef": "model00000168d865927b_00000001",
                        "dataItems": [],
                        "id": "model00000168d867a3f4_00000000"
                    }]
                },
                "slotmapping": {},
                "type": "live",
                    "name": {
                    "translationTable": {}
                },
                "visId": "JQGrid"
            },
            "model00000168d8680ccc_00000002": {
                "id": "model00000168d8680ccc_00000002",
                    "data": {
                    "dataViews": [{
                        "modelRef": "model00000168d865927f_00000002",
                        "dataItems": [],
                        "id": "model00000168d8680ccc_00000000"
                    }]
                },
                "slotmapping": {},
                "type": "live",
                    "name": {
                    "translationTable": {}
                },
                "visId": "JQGrid"
            },
            "model00000168d86835b0_00000002": {
                "id": "model00000168d86835b0_00000002",
                    "data": {
                    "dataViews": [{
                        "modelRef": "model00000168d8659281_00000002",
                        "dataItems": [],
                        "id": "model00000168d86835b0_00000000"
                    }]
                },
                "slotmapping": {},
                "type": "live",
                    "name": {
                    "translationTable": {}
                },
                "visId": "JQGrid"
            }
        }
        }


    }


};
