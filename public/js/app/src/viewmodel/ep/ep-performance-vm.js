/**
 * Copyright Digital Engagement Xperience 2018
 * @description VM for managing performance reports
*/

/* global dexit, ko, async */

/**
 *
 * @param {dexit.app.ice.edu.BCInstanceVM} args.parentVM
 * @param {dexit.app.ice.ccEDCreateVM} [args.ccEDCreateVM]
 * @constructor
 */
dexit.app.ice.EPPerformanceVM = function (args) {
    var self = this;
    var noOp = function() {};
    var parentVM = args.parentVM;
    self.ccEDCreateVM = args.ccEDCreateVM;



   // self.showAddNew = ko.observable(false);
    self.showAddNew = ko.observable(true);

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
            .map(function(val) {
                val.classification = val.classification.toLowerCase();
                return val;
            })
            .groupBy('classification')
            .map(function(value, key) {
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

    self.showPerformanceSettings = function() {

        self.tempSelectedDashboardIntelligence(self.selectedDashboardIntelligence());
        self.performanceSettingModalVisible(true);
    };


    self.title = ko.pureComputed(function(){
        return 'Showing ' + self.selectedDashboardIntelligence().length +'/' + self.availableDashboardIntelligence().length +' Reports';
    });


    self.performanceReportModalVisible = ko.observable(false);
    self.selectedPerformanceReportModalVM = ko.observable();

    self.selectedPerformanceReportModalTitle = ko.observable('');

    self.showPerformanceReportModal = function(index) {
        var val =  self.kpiReports()[index];

        var args = {
            elementId: 'large-kpi-chart',
            report: {
                definition: val.definition,
                type: (val.definition && val.definition.type || 'kpiReport'),
                title:val.name
            }
        };
        if (val.definition.presentation) {
            args.report.chartType = val.definition.presentation.chartType;
            args.report.options = val.definition.presentation.chartOptions;
        }

        if (val.definition.bizObjectiveMetrics && val.definition.bizObjectiveMetrics.length > 0) {
            args.report.bizObjectiveMetrics = [];
            _.each(val.definition.bizObjectiveMetrics, function (metricId) {
                //find metric and show matching name and number
                _.each(self.bizObjectives(), function (val) {
                    if (val.selectedMetric === metricId){

                        var bcData = self.bcData;
                        var intel = _.find(bcData.intelligence, function (val) {
                            return (val.property && val.property.location == metricId);
                        });


                        //find metric name

                        var toShow = (intel && intel.property && intel.property.definition && intel.property.definition.metricName ? intel.property.definition.metricName : metricId);

                        args.report.bizObjectiveMetrics.push({name:toShow, target: val.selectedThreshold});
                    }
                });
            });

            self.currentBizObjectives(args.report.bizObjectiveMetrics);

        }


        var overrideParams = null;
        //ICEMM-947 workaround, assumption: height is at end of string
        if (val.definition.location){

            var height = window.innerHeight - Math.floor((window.innerWidth)*0.1);
            overrideParams = {width: '100%', height:height};
        }


        self.performanceReportModalVisible(true);
        $('#large-kpi-chart').empty();

        //TODO: calculate based on screen size, how to preserve aspect ratio

        args.report.options.width = 800;
        args.report.options.height = 450;


        self.selectedPerformanceReportModalTitle(val.name);
        var vm = new dexit.app.ice.KpiReportVM(args);
        self.selectedPerformanceReportModalVM(vm);
        setTimeout(function () {

            vm.loadReport(null,overrideParams);
        }, 100);

    };

    self.init = function(args){
        self.bcId = args.bcId;
        self.bcType = args.bcType;
        self.role = args.role;
    };




    /**
     * For showing cards only in campaign page..bad way to distinguish for now
     */
    self.performanceCards = ko.pureComputed(function(){
        if (parentVM) {
            return ko.utils.arrayFilter(parentVM.tempCards(), function (card) {
                return (card.currentActivity() && card.currentActivity() === 'published');
            });
        }else {
            return [];
        }
    });

    self.loadAvailableEngReports = function (bciId, callback) {
        callback = callback || noOp;


        var resource = 'bc-available-intelligence?' +'bci_id='+ encodeURIComponent(bciId) ;
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.retrieve(function (err, availableEngIntelligence) {
            if (err) {
                console.log('error in BC definition retrieval:%o',err);
                callback(new Error(err));
            } else {
                var intel = availableEngIntelligence || [];

                self.availableDashboardIntelligence(intel);
                callback(null, intel);
            }
        });
    };

    self.removeSelectedEngReports = function(data){


        var toRemoveNames = self.tempSelectedDashboardIntelligence();

        var selected = ko.utils.arrayFilter(self.availableDashboardIntelligence(), function (item) {
            return (toRemoveNames.indexOf(item.name) !== -1);
        });

        var ids = _.map(selected, 'id');
        var resource = 'bc-available-intelligence/?' +'bci_id='+ encodeURIComponent(self.bcId) ;
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.destroyWithData(ids, function (err) {
            if (err) {
                console.log('error in removal :%o',err);
                return;
            } else {
                self.loadAvailableEngReports(self.bcId);
            }
        });
    };

    self.addNew = function() {
        var bcId,bcType,bcName = '';
        if (parentVM) {
            bcId = parentVM.businessConceptInstance.id;
            bcType = parentVM.mainVM.currBCType();
            bcName = parentVM.businessConceptInstance.property.name;
        } else {
            bcId = self.bcId;
            bcType = self.bcType;
            //bcName = '';
        }

        self.ccEDCreateVM.setFilters({
            bc:bcType,
            id:bcId,
            bcName:bcName
        });
        var saveCallback = function(){
            self.loadAvailableEngReports(bcId);
        };

        self.ccEDCreateVM.init(parentVM);

        self.ccEDCreateVM.show(saveCallback);
    };


    self.bcData = null;

    self.load = function() {
        var bcId,bcType, currentRole;
        if (parentVM) {
            bcId = parentVM.businessConceptInstance.id;
            bcType = parentVM.mainVM.currBCType();
            currentRole = parentVM.mainVM.currentRole();
        } else {
            bcId = self.bcId;
            bcType = self.bcType;
            currentRole = self.role;
        }


        self.loadAvailableEngReports(bcId,function() {
            //load after available
            self.loadPerformanceReports(bcId, bcType, currentRole);
        });

    };

    self.bizObjectives = ko.observableArray([]);
    self.currentBizObjectives = ko.observableArray([]);


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

    self.loadPerformanceReports = function (bcId, bcType, role) {
        var chartArea =$('.performance-report-chart');
        chartArea.empty();
        self.kpiReportVMs([]);
        self.kpiReports([]);
        self.selectedDashboardIntelligence([]);

        var queryParams = {};


        async.auto({
            loadBC: function(cb) {
                //load intelligence
                var params =  {
                    id: bcId,
                    type: bcType,
                    queryParams:{ },

                };
                // if (self.selectedCourse() && !self.showDashboard()) {
                //     return cb(null, self.selectedCourse().courseVM.businessConceptInstance.intelligence);
                // }

                dexit.app.ice.integration.bcp.retrieveBCInstance(params, function(err, data) {
                    if (err) {
                        console.error('err=' + JSON.stringify(err));
                        cb(err);
                    } else {
                        self.bcData = data;
                        parseBizObjectives(data);
                        //FIXME: workaround remove duplicate intelligence ICEMM-707
                        var dat = _.uniqBy(data.intelligence, 'id');
                        cb(null,dat);
                    }
                });
            },
            loadData: ['loadBC', function(cb, result) {
                var found = _.filter(result.loadBC, function(val) {
                    return (val.property && val.property.present_eng_report && val.property.role && val.property.role === role);
                });
                var intel = _.map(found, function(val) {
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


                async.each(intel, function (val, done) {
                    var params =  {
                        id: bcId,
                        type: bcType,
                        intelId: val.id,
                        queryParams:{ },

                    };
                    if (val.property.definition && val.property.definition.type && val.property.definition.type === 'external') {
                        var report = _.extend({}, val.property);


                        report.definition.location = report.definition.location.replace('{{bcInstanceId}}',bcId);
                        //ICEMM-950: workaround, set width to 200 for when location is specified

                        // if (report.definition.location.indexOf('?') === -1) {
                        //     report.definition.location = report.definition.location + '?view=true';
                        // }else {
                        //     report.definition.location = report.definition.location + '&view=true';
                        // }
                        //


                        self.kpiReports.push(report);
                        done();

                    }else {

                        dexit.app.ice.integration.bcp.retrieveBCInstanceIntelData(params, function (err, data) {
                            if (err) {
                                console.error('err=%o', err);
                                done(err);
                            } else {
                                var report = _.extend({}, val.property);
                                report.definition.data = data;

                                self.kpiReports.push(report);
                                done();
                            }

                        });

                    }
                }, cb);
            }]
        }, function(err, result) {
            // var chartArea =$('#charts-here');
            // chartArea.empty();

            self.kpiReportVMs([]);

            self.enableLoadKPIReport(true);
            if (self.kpiReports().length > 0) {

                _.each(self.kpiReports(), function (val, index) {
                    //chartArea.append('<div class="chart-wrapper col-sm-5"><div id="camp-kpi-chart-div' + index + '"></div></div>');
                    var args = {
                        elementId: 'camp-kpi-chart-div' + index,
                        report: {
                            definition: val.definition,
                            type: (val.definition && val.definition.type || 'kpiReport'),
                            title:val.name,
                            classification:val.classification
                        }
                    };
                    if (val.definition.presentation) {
                        args.report.chartType = val.definition.presentation.chartType;
                        args.report.options = val.definition.presentation.chartOptions;
                    }

                    var vm = new dexit.app.ice.KpiReportVM(args);
                    //for KPI report metrics, the id should be referred from top-level instance we set in bc_role_mapping
                    self.kpiReportVMs.push(vm);
                    vm.loadReport();
                });

            } else {
                self.enableLoadKPIReport(true);
            }

        });


    };


    self.saveSettings = function() {
        if (!self.enableSaveDashboardIntelligence()) {
            //ignore any input if set to false
            return;
        }

        var bcId,bcType, currentRole;
        if (parentVM) {
            bcId = parentVM.businessConceptInstance.id;
            bcType = parentVM.mainVM.currBCType();
            currentRole = parentVM.mainVM.currentRole();
        } else {
            bcId = self.bcId;
            bcType = self.bcType;
            currentRole = self.role;
        }
        self.saveDashboardIntelligence(currentRole,bcId,bcType);

    };

    /**
     * Updates intelligence to be presented on dashboard
     * @param {string} role - role to associated with intelligence to present
     */
    self.saveDashboardIntelligence = function (role, bcId, bcType) {


        function calculateChangesArr(original, updated, path, comparator) {
            var chs = [];
            var removed = _.differenceWith(original,updated, comparator);
            var added = _.differenceWith(updated, original,comparator);
            if (removed && removed.length > 0) {
                chs.push({op:'remove', path:path, value:removed});

            }
            if (added && added.length > 0) {
                chs.push({op:'add', path:path, value:added});
            }
            return chs;

        }
        self.enableSaveDashboardIntelligence(false);



        var selectedIds = self.tempSelectedDashboardIntelligence();
        var selected = ko.utils.arrayFilter(self.availableDashboardIntelligence(), function (item) {
            return (selectedIds.indexOf(item.name) !== -1);
        });

        selected = _.map(selected, function(data) {
            data.role = role;
            data.present_eng_report = true;
            return data;
        });


        var changes = [];

        async.auto({
            loadBC: function(cb) {
                //load intelligence
                var params =  {
                    id: bcId,
                    type: bcType,
                    queryParams:{ },

                };

                dexit.app.ice.integration.bcp.retrieveBCInstance(params, function(err, data) {
                    if (err) {
                        console.error('err=' + JSON.stringify(err));
                        cb(err);
                    } else {
                        cb(null,data);
                    }
                });
            },
            save: ['loadBC', function(cb, result) {


                //calculate changes
                var orig = _
                    .chain(result.loadBC.intelligence)
                    .uniqBy('id')
                    .filter(function(val) {
                        return (val.property && val.property.present_eng_report && val.property.role === role);
                    })
                    .map(function(val) {
                        var a = val.property;
                        a.id = val.id;
                        return a;
                    })
                    .value();

                var intelComparator = function (val,val2) {
                    return (val && val2 && val.definition && val.definition && val.name && val2.name && val.name === val2.name);
                };

                changes = calculateChangesArr(orig,selected, '/intelligence/',intelComparator);
                if (changes.length < 1) {
                    //short circuit
                    return cb();
                }

                var params = {
                    type: bcType,
                    id: bcId,
                    version: result.loadBC.property.version,
                    changes: changes
                };
                dexit.app.ice.integration.bcp.updateBCInstance(params, cb);

            }]
        }, function (err) {
            if (err) {
                console.log('could not update intelligence');
            } else {
                //if no error saving then update
                self.selectedDashboardIntelligence(self.tempSelectedDashboardIntelligence());
            }
            // setTimeout(function() {
            //     $('.popover').popover('hide');
            // }, 10);
            self.performanceSettingModalVisible(false);
            self.enableSaveDashboardIntelligence(true);

            self.loadPerformanceReports(bcId, bcType, role);

        });


    };

};
