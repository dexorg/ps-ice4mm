/**
 * Copyright Digital Engagement Xperience 2018
 * @description Viewmodel for CC/ED intelligence authoring
 */
/* global dexit, ko, async */

/**
 *
 * @param args
 * @constructor
 */
dexit.app.ice.CCEDCreateVM = function (args) {
    var self = this;


    var parentBCVM = (args && args.parentBCVM ? args.parentBCVM : null );

    var noOp = function(){};

    self.headerLabel = ko.observable('Configure your CC/ED Intelligence');
    self.modalSize = ko.observable('modal-lg');
    self.intelligenceTypes = ko.observableArray(['ED','CC']);
    self.selectedIntelligenceType = ko.observable();
    self.modalVisible = ko.observable(false);


    self.availableCubes = ko.observableArray();
    self.selectedCube = ko.observable();
    self.name = ko.observable();



    self.availableChannelTypes = ko.observableArray();
    self.selectedChannelTypes = ko.observableArray();
    self.availableTouchpoints = ko.observableArray();
    self.selectedTouchpoints = ko.observableArray();
    self.availableEPs = ko.observableArray();
    self.selectedEPs = ko.observableArray();

    self.availableUserSegments = ko.observableArray();
    self.selectedUserSegments = ko.observableArray();
    self.availableTimeGranularity  = ko.observableArray(['one day', 'year', 'quarter','month']);
    self.selectedTimeGranularity = ko.observable();


    self.selectedStartDate = ko.observable();
    self.selectedEndDate = ko.observable();


    self.externalUrl2 = ko.observable('https://superset-testb.herokuapp.com/chart/add');
    self.externalUrl = ko.observable('');

    self.baseUrl = 'https://superset-testb.herokuapp.com';

    self.buildCalculatedExternalUrl = function () {
        var dataSource = '1__druid';
        var vizType = 'table';

        //get all selections
        var groupBy = [].join(',');

        var params = {
            datasource:dataSource,
            viz_type:vizType,
            url_params: {},
            granularity: self.selectedTimeGranularity(),
            druid_time_origin:null,
            time_range:'Last week',
            groupby: [],//'['+groupBy+']',
            metrics: null,
            percent_metrics: [],
            timeseries_limit_metric:null,
            row_limit: 1000,
            include_time:false,
            order_desc: true,
            all_columns: [],
            order_by_cols:[],
            adhoc_filters:[],
            'table_timestamp_format':'%Y-%m-%d %H:%M:%S',
            'page_length':0,
            'include_search':false,
            'table_filter':false,
            'align_pn':false,
            'color_pn':true
        };



        return self.baseUrl +
            '/superset/explore/?form_data=' + encodeURIComponent(JSON.stringify(params));
        //'{"datasource":"'+dataSource+
        // '","viz_type":"'+vizType+
        // '","url_params":{},"granularity":"'+self.selectedTimeGranularity()+
        // '","druid_time_origin":null,"time_range":"Last week",'+
        // '"groupby":['+groupBy+'],'+
        // 'metrics":null,"percent_metrics":[],"timeseries_limit_metric":null,"row_limit":10000,"include_time":false,"order_desc":true,"all_columns":[],"order_by_cols":[],"adhoc_filters":[],"table_timestamp_format":"%Y-%m-%d %H:%M:%S","page_length":0,"include_search":false,"table_filter":false,"align_pn":false,"color_pn":true}';
    };

    self.loadTPInfo = function(parentBCVM) {
        if (parentBCVM) {
            var tps = _.map(parentBCVM.tpm(), function (item) {
                return {
                    id: item.tpId,
                    name: item.name
                };
            });

            var ct = _.map(parentBCVM.tpm(), function (item) {
                return {
                    id: item.channelTypeId,
                    name: item.channelType
                };
            });
            self.availableTouchpoints(tps);
            self.availableChannelTypes(_.uniqBy(ct, 'id'));
        }
    };


    self.loadBCInfo = function(parentBCVM) {

    };

    self.loadCampaigns = function(parentBCVM) {
        if (parentBCVM) {
            var campaigns = _.map(parentBCVM.tempCards(), function(item) {
                if (item.ePatterns() && item.ePatterns().length > 0) {
                    return {
                        id: item.ePatterns()[0].id,
                        name: item.name()
                    };
                }
            });
            self.availableEPs(_.compact(campaigns));
        }
    };

    self.loadUserSegments = function(parentBCVM) {
        //TODO
        self.availableUserSegments(['A','B','C']);
    };

    self.showSelectDimensions = ko.observable(false);
    // self.enableSelectMetrics = ko.computed(function(){
    //     //load metrics
    //     if (self.selectedIntelligenceType()) {
    //         self.retrieveMetrics();
    //         return true;
    //     }else {
    //         return false;
    //     }
    //
    //     return self.selectedIntelligenceType();
    // });

    self.init = function(parentBCVM) {
        self.retrieveMetrics();
        // self.loadBCInfo(parentBCVM);
        // self.loadCampaigns(parentBCVM);
        // self.loadTPInfo(parentBCVM);
        // self.loadUserSegments(parentBCVM);
        // self.loadCampaigns(parentBCVM);
        //
        self.selectedIntelligenceType('ED');
        self.selectedMetric('');
        self.iframeLink('');
    };



    self.saveQueryAndGoNext  = function() {
        //save the query in superset
        setTimeout(function () {

            var url = self.buildCalculatedExternalUrl();
            self.externalUrl(url);
            self._saveToSuperset(function(err) {
                self.showPresentationSelection(true);
            });


        },500);
    };

    self._saveToSuperset = function(callback) {
        var cb = callback || noOp;


        cb();

    };
    self.iframeLink = ko.observable('');

    self.showIFrameLink = ko.observable(false);

    self.selectedChartLink = ko.observable();

    self.getReportLink = function() {
        //trim the iframe link
        var pastedRaw = self.selectedChartLink();
        var rawHtml = $.parseHTML('<div>'+pastedRaw+'</div>');
        var reportLink = $('iframe',rawHtml).attr('src');
        return reportLink;
    };


    self.retrieveCubeLink = function() {

        var metricId = self.selectedMetric();
        //find metric name

        var metric = _.find(self.availableMetrics(), function (metric) {
            return (metric && metric.metricId && metric.metricId === metricId);
        });

        var cubeName = (metric && metric.metricDefinitionDetail && metric.metricDefinitionDetail.cubeName ? metric.metricDefinitionDetail.cubeName : metric.metricName);

        var filters = self.dimensionFilters();
        var vw = self._buildViewDef(cubeName, filters);

        var resource = 'https://intelligence-turnilo.dexit.co/mkurl';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.create(vw, function (err, result) {
            if (err || (!result || !result.hash) ){
                alert('could not generate link');
            }else {
                var link = 'https://intelligence-turnilo.dexit.co/'+result.hash;
                if (filters && filters.bcId && filters.bcName) {
                    link = link + '?hideDimension=bc_id';
                }
                self.iframeLink(link);
                //  self.iframeLink('http://localhost:9090/'+result);
                self.showIFrameLink(true);
            }
        });
    };




    self._buildViewDef = function(name, filters) {


        var view = {
            'dataCubeName': name,
            'viewDefinitionVersion': '4',
            'viewDefinition': {
                'visualization': 'totals',
                'timezone': 'Etc/UTC',
                'filters': [
                    {
                        'type': 'time',
                        'ref': '__time',
                        'timePeriods': [
                            {
                                'duration': 'P30D',
                                'step': -1,
                                'type': 'latest'
                            }
                        ]
                    }
                ],
                'splits': [],
                'series': [
                    {
                        'reference': 'count',
                        'format': {
                            'type': 'default',
                            'value': ''
                        },
                        'type': 'measure'
                    }
                ],
                'pinnedDimensions': [],
                'pinnedSort': 'count',
                'legend': null,
                'highlight': null
            }
        };


        if (filters && filters.bcId && filters.bcName) {
            view.viewDefinition.filters.push({
                'type': 'string',
                'ref': 'bc_id',
                'action': 'in',
                'values': [
                    filters.bcName
                ],
                'not': false
            });
        }
        return view;
    };




    self.showPresentationSelection = ko.observable(false);
    self.showChartPreview = ko.observable(false);



    self.chartTypes = ko.observableArray(['BarChart','PieChart']);
    self.selectedChartType = ko.observable();
    self.chartMarkup = ko.observable();

    self.dimensions =ko.observableArray();


    self.dimensionsX = ko.observableArray();
    self.dimensionsY = ko.observableArray();


    self.dimensionXFilters = ko.observableArray();
    self.dimensionYFilters = ko.observableArray();

    self.selectedDimension = ko.observable();
    self.selectedDimensionX = ko.observable();
    self.selectedDimensionXFilter = ko.observable();
    self.selectedDimensionY = ko.observable();
    self.selectedDimensionYFilter = ko.observable();


    self.selectedChartTitle = ko.observable('title');

    self.dimensionFilters = ko.observable({});


    self.showAllMetrics = false;


    /**
     * Save the performance intelligence
     * @param params
     */
    self.saveIntelligenceKPI = function(params) {

        //var type = self.selectedIntelligenceType();
        var metricId = self.selectedMetric();

        var presentation = {
            type: 'external-turnilo',
            chartType: self.selectedChartType(),
            chartOptions: {}
            //chartOptions: self.chartMarkup()
        };


        // var columns = [];
        //for dimensions add columns
        //for metric add
        // var selectedMetric = _.find(self.availableMetrics(), {metricId: metricId});

        // columns.push({type:'string',name:'date'});
        // columns.push({type:resolveMetricType(selectedMetric.metricType),name:'metric_value'});
        //


        var definition = {
            presentation: presentation,
            query:'',
            queryParams:[],
            type:'external',
            intelType: 'concept',
            datastore: 'superset',
            location: self.urlToSave || self.iframeLink(),
            bizObjectiveMetrics: [metricId]
        };

        var epoch = Date.now();

        var bcType = self.dimensionFilters().bc;
        var bcId = self.dimensionFilters().bcId;

        var reqData =  {
            name:self.selectedChartTitle(),
            bcType: bcType,
            intelType:'legacy',
            location:'superset',
            createdTime:epoch,
            definition: definition,
            classification: 'ed',
            bciId: bcId
        };


        //var resource = '/bcm/definition/'+encodeURIComponent(bcType)+'/intelligence';
        var resource = '/bc-available-intelligence';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.create(reqData, function (err, result) {
            if (self.saveCallback) {
                self.saveCallback();
            }
            self.hide();
        });

    };

    self.saveIntelligence = function(params) {


        function resolveMetricType(type) {
            return type;
        }

        var type = self.selectedIntelligenceType();
        var metricId = self.selectedMetric();

        var presentation = {
            chartType: self.selectedChartType(),
            chartOptions: self.chartMarkup()
        };


        var columns = [];
        //for dimensions add columns
        //for metric add
        var selectedMetric = _.find(self.availableMetrics(), {metricId: metricId});

        columns.push({type:'string',name:'date'});
        columns.push({type:resolveMetricType(selectedMetric.metricType),name:'metric_value'});


        var definition = {
            presentation: presentation,
            intelType: 'concept',
            datastore: 'egae',
            column: columns
        };

        var epoch = Date.now();

        var bcType = self.dimensionFilters().bc;

        var reqData =  {
            name:self.selectedChartTitle(),
            bcType: bcType,
            intelType:'dynamic',
            location:'egae',
            createdTime:epoch,
            definition: definition,
            classification: type.toLowerCase()
        };


        var resource = '/bcm/definition/'+encodeURIComponent(bcType)+'/intelligence';
        var restStrategy = new dexit.app.ice.integration.rest.GeneralStrategy(resource);
        restStrategy.create(reqData, function (err, result) {
            if (self.saveCallback) {
                self.saveCallback();
            }
            self.hide();
        });

    };

    self.bc = null;


    self.availableMetrics = ko.observableArray();
    self.selectedMetric =ko.observable();

    self.populateBasedOnType = function(){

    };

    self.setFilters = function(params) {
        var bcName = params.bc;
        var bcId = params.id;

        var filter = {};
        if (bcName) {
            filter.bc = bcName;
        }
        if (bcId) {
            filter.bcId = bcId;
        }
        if (params && params.bcName) {
            filter.bcName = params.bcName;
        }

        self.dimensionFilters(filter);

        self._getEpts();


        if (self.dimensionFilters().bcId && self.dimensionFilters().bc) {

            if (self.bc && self.bc.id === self.dimensionFilters().bcId) {
                return; //short circuit since already loaded
            }


            //find all metrics for BC
            var paramsBC = {
                id: self.dimensionFilters().bcId,
                type: self.dimensionFilters().bc,
                queryParams: {},

            };

            dexit.app.ice.integration.bcp.retrieveBCInstance(paramsBC, function (err, data) {
                if (err) {
                    console.error('err=' + JSON.stringify(err));
                    return;
                } else {
                    self.bc = data;
                }
            });

        }

    };

    self.urlToSave = '';

    self.saveCallback = noOp;

    self.receiveLink = function(event) {
        //TODO: check comes from turnilo
        if (event && event.data) {
            try {
                var data = JSON.parse(event.data);
                if (data && data.url){
                    self.urlToSave = (data.url);
                }
            }catch (e) {

            }
        }


    };
    self.show  = function(saveCallback) {
        self.clear();
        self.modalVisible(true);
        if (saveCallback) {
            self.saveCallback = saveCallback;
        }else {
            self.saveCallback = noOp;
        }

        self.showIFrameLink(false);
        self.iframeLink('');
        window.addEventListener('message', self.receiveLink, false);

    };

    self.selectedDimensionValue = ko.observableArray();
    self.allBehEpt = ko.observableArray();



    self.clear = function() {
        self.allBehEpt([]);
        self.selectedIntelligenceType('');
        self.selectedDimension('');
        self.selectedDimensionX('');
        self.selectedDimensionY('');
        self.selectedDimensionXFilter('');
        self.selectedDimensionYFilter('');
        self.showSelectDimensions(false);
        self.showChartPreview(false);
        self.selectedChartTitle('');
        self.chartOptions('');
        self.canSave(false);
        self.showMarkup(false);
        self.enableChartMarkupOptions(false);
    };

    self.hide = function(){
        self.modalVisible(false);
        self.clear();

    };


    self.nonSelectedText = ko.pureComputed(function () {
        return 'No optional filters for' + self.selectedDimension() + '...';
    });

    self.showMarkup = ko.observable(false);

    self.toggleMarkup = function(){
        var toggled = (self.showMarkup() ? false: true);
        self.showMarkup(toggled);
    };

    self.showMarkupIcon = ko.pureComputed(function () {
        return (self.showMarkup() ? 'fa fa-minus' : 'fa fa-plus');
    });


    self.getMetricsByBehAndChan = function(selectedBehs, selectedTouchpoints) {

        selectedTouchpoints = selectedTouchpoints || [];
        selectedBehs = selectedBehs || [];
        //self.availableMetricsByBehaviours([]);


        if (self.allBehEpt.length < 1) {
            return; //skip if no available Epts configured with behaviours
        }


        //find behaviours and available epts for them (one to zero or more )
        var behAndEpt = _.map(selectedBehs, function (selectedBeh) {
            var id = selectedBeh.ds.id;
            var matchedEpts = _.filter(self.allBehEpt, function (behEpt) {
                return behEpt.behaviourId === id;
            });

            return {
                behaviour: _.clone(selectedBeh),
                matchedEptIds: matchedEpts
            };
        });

        var allMetricIds = [];
        async.auto({

            findMetricIdsForEpt: function (cb) {
                //for each behavior and is epts, find metrics
                async.map(behAndEpt, function (val, next) {
                    var behaviour = val.behaviour;
                    var matchedEptIds = val.matchedEptIds;
                    var matched = [];
                    async.each(matchedEptIds, function (matchedEpt, done) {
                        dexit.app.ice.integration.metrics.retrieveMetricsByEptId({eptId: matchedEpt.engagementPointId}, function (err, result) {
                            if (err) {
                                console.warn('skipping matching ept to metric likely due to a configuration error');
                                return done();
                            }
                            var metricIds = _.map(result, function (val) {
                                return val.metricId;
                            });
                            allMetricIds = allMetricIds.concat(metricIds);
                            matched = matched.concat(metricIds);
                            done();

                        });
                    }, function () { //ignoring error
                        //work around duplicates coming back from service
                        var ids = _.uniq(matched);
                        next(null, {
                            behaviour: behaviour,
                            matchedEptIds: matchedEptIds,
                            matchedMetricIds: ids
                        });
                    });

                }, function (err, result) {
                    if (err) {
                        console.log('error retrieving Epts for behaviour'); //skip
                    }
                    result = result || [];
                    cb(null, result);
                });
            },
            metrics: ['findMetricIdsForEpt', function (cb) {

                //remove duplicates from allMetricIds;
                var ids = _.uniq(allMetricIds);

                async.map(ids, function (metricId, done) {
                    dexit.app.ice.integration.metrics.retrieveMetricsById(metricId, function (err, returnedMetric) {
                        if (err) {
                            //skip
                            console.error('metric:' + metricId + ' can not be retrieved');
                            done();
                        }
                        done(null, returnedMetric);
                    });
                }, function (err, res) {
                    //skipped error above so ignore handling
                    cb(null, res);
                });
            }],
            buildBehMetricObj: ['findMetricIdsForEpt', 'metrics', function (cb, result) {
                var metricsObj = result.metrics;
                var data = result.findMetricIdsForEpt;

                var res = _.map(data, function (item) {
                    var metrics = _.map(item.matchedMetricIds, function (metricId) {
                        return _.find(metricsObj, function (metric) {
                            return (metric.metricId === metricId);
                        });
                    });
                    return {
                        behaviourId: item.behaviour.ds.id,
                        behaviourName: item.behaviour.display.icon_text,
                        metrics: ko.observableArray(metrics)
                    };
                    //var behAndMetrics = new  BehavioursAndMetrics(item.behaviours);
                    //return behAndMetrics;
                });
                cb(null, res);
            }]
        }, function (err, result) {
            if (result && result.buildBehMetricObj) {
                self.availableMetricsByBehaviours(result.buildBehMetricObj);

            }

            //otherwise map from object to array
            /**
             * @example {'behaviour':{'ds': {'id':'a'} },'metrics':[]}  to [{behaviour:{'ds': {'id':'a'} }, 'metrics':[]}]
             */

        });
    };


    self._getEpts = function() {
        dexit.app.ice.integration.ept.listAvailableEngagementPoints(function (err, res) {
            if (err) {
                return;
            }
            res = res || [];
            self.allBehEpt(res);

        });
    };

    self.availableDimensionData = ko.observableArray([]);


    self.selectMetricCaption = ko.observable(' ');


    self.computedDimensionData = ko.computed(function () {
        var dimension = self.selectedDimension();

        if (!dimension) {
            return [];
        }

        //now find data for dimension

        if (dimension === 'time') {
            var timeData = [
                {name: 'days', value:'days'},
                {name: 'months', value:'months'},
            ];

            self.availableDimensionData(timeData);
        }

        //for TP
        if (dimension.indexOf('touchpoint')!== -1) {
            var tps = self.bc.property.touchpoints || [];
            if (_.isString(tps)) {
                tps = [tps];
            }
            var tpIds = _.map(tps, function(tpElement) {
                return tpElement.split(':')[1] ? tpElement.split(':')[1] : tpElement;
            });

            self._retrieveTouchpoints(tpIds, function(err, tpInfo) {
                if (err) {
                    self.availableDimensionData([]);
                }else {
                    self.availableDimensionData(tpInfo);
                }


            });

        }

        //for ept
        if (dimension.indexOf('ept' ) !== -1 ) {
            //return all behaviours

            var behs = _.filter(self.bc.behaviour, function (beh) {
                return (beh.property && beh.scope === 'user' && beh.property.tag === 'sc' && beh.property.name && (!beh.property.isBR || beh.property.isBR == false));
            });

            var resB =  _.map(behs, function(val) {
                return {'name':val.property.name, 'value':val.id};
            });

            self.availableDimensionData(resB);

            //return[{'name':'dummy', 'value':'dummy'}]
        }

        //for ep
        if (dimension === 'engagement pattern') {
            //return[{'name':'dummy', 'value':'dummy'}]
            self.availableDimensionData([]);
        }

        if (dimension === 'user'){
            self.availableDimensionData([{'name':'user', 'value':'user'}]);
        }



    });

    self._retrieveTouchpoints = function(tpIds, callback) {

        async.map(tpIds, function(tpId, cb) {

            dexit.app.ice.edu.integration.tp.retrieveChannelInstanceFromTPCached(tpId, null, function (err, channelData) {
                if (err) {
                    cb(err);
                }
                channelData = channelData || [];
                cb(null,{value:tpId, name:channelData.name, data:channelData});
            });
        }, function(err, res) {
            if (err) {
                return callback([]);
            }
            callback(null,res);

        });
    };

    self.retrieveMetrics = function() {


        self.selectMetricCaption('loading metrics');

        //var intelType = self.selectedIntelligenceType();
        if (self.showAllMetrics && self.showAllMetrics === true) {
            dexit.app.ice.integration.metrics.listMetrics(function (err, result) {
                if (err) {
                    //TODO: handle error
                    console.error('could not list metrics');
                    self.selectMetricCaption('could not list metrics');
                }else {
                    self.availableMetrics(result);
                    self.selectMetricCaption('Select a metric...');
                }
            });
        }else {

            if (self.bc) {
                var intel = 'engagementmetric';
                //filter
                var metricIntel = _.filter(self.bc.intelligence, function (val) {
                    return (val.kind.indexOf(intel) !== -1);
                });

                async.map(metricIntel, function (val, cb) {
                    dexit.app.ice.integration.metrics.retrieveMetricsById(val.property.metricId, cb);
                }, function (err, res) {
                    if (err) {
                        //TODO: handle error
                        console.error(('could not list metrics'));
                        self.selectMetricCaption('could not list metrics');
                    } else {
                        self.availableMetrics(metricIntel);
                        self.selectMetricCaption('Select a metric...');
                    }
                });

            }
        }
    };


    self.retrieveStructure = function() {
        var intelType = self.selectedIntelligenceType();

        if (intelType && intelType === 'ED') {

            self.showSelectDimensions(true);

            var dimensions = ['touchpoint','engagement pattern','explicit ept (behaviour)', 'time'];
            self.dimensions(dimensions);

        }else if (intelType && intelType === 'CC') {
            self.showSelectDimensions(true);
            var ccDimensions = ['user', 'audience'];
            self.dimensions(ccDimensions);
        }

    };

    self._returnDataForFilterX = function() {

        if (self.selectedDimensionX() && self.selectedDimensionX() === 'metric') {


            self._findMetric(self.selectedDimensionXFilter);
        }

        if (self.selectedDimensionX() && self.selectedDimensionX() === 'time') {
            self.selectedDimensionXFilter(['day','month','year']);
        }

    };

    self._returnDataForFilterY = function() {

        if (self.selectedDimensionX() && self.selectedDimensionX() === 'metric') {

            self._findMetric(self.selectedDimensionYFilter);
        }

        if (self.selectedDimensionX() && self.selectedDimensionX() === 'time') {
            self.selectedDimensionXFilter(['day','month','year']);
        }

    };

    self._findMetric = function(target) {
        //retrieve BC (if BC)
        // if (self.dimensionFilters().bcId && self.dimensionFilters().bc) {
        //     //find all metrics for BC
        //     var params =  {
        //         id: self.dimensionFilters().bcId,
        //         type: self.dimensionFilters().bc,
        //         queryParams:{ },
        //
        //     };
        //
        //     dexit.app.ice.integration.bcp.retrieveBCInstance(params, function(err, data) {
        //         if (err) {
        //             console.error('err=' + JSON.stringify(err));
        //             return;
        //         } else {
        if (self.bc) {
            //continue
            var intelType = 'engagementmetric';

            //filter
            var metricIntel = _.filter(self.bc.intelligence, function (val) {
                return (it.kind.indexOf(intelType) !== -1);
            });

            target(metricIntel);

            //now load all possible

        }



    };


    self.renderChart = function(chartType, options) {
        var chart;
        function drawChart(domRef, chartType) {
            var data = google.visualization.arrayToDataTable(self.populateDummyData());
            if (chartType === 'BarChart') {
                chart = new google.visualization.BarChart(domRef);
            }else {
                chart = new google.visualization.PieChart(domRef);

            }
            chart.draw(data, options);
        }

        google.charts.load('current', {'packages': ['corechart','bar']});
        var container = document.getElementById('cced_chart_preview');
        google.charts.setOnLoadCallback(function() {
            drawChart(container, chartType);
        });
    };

    self.enableChartMarkupOptions = ko.observable(false);
    self.chartOptions = ko.observable();
    self.canSave = ko.observable(false);

    self.updateChartType = function () {
        if (!self.chartOptions()) {
            self.chartOptions('{"height":225,"vAxis":{"minValue":0,"maxValue":100},"animation":{"duration":1000,"easing":"out"},"colors":["blue","orange","green","red"],"hAxis":{"title":"{{chartTitle}}"}}');
        }


        var chartOptions = self.chartOptions();


        self.chartMarkup(chartOptions);

        try {
            //replace title
            var replaced = chartOptions.replace('{{chartTitle}}',self.selectedChartTitle());
            self.renderChart(self.selectedChartType(), JSON.parse(replaced));
            self.enableChartMarkupOptions(true);
        }catch (e) {
            alert('bad input');
        }

    };


    self.enableSetChartType = ko.pureComputed(function() {
        return (self.selectedChartTitle() && self.selectedChartTitle().length > 0 ? true : false);
    });


    self.populateDummyData = function () {
        return [
            ['Item', 'Item2'],
            ['Work',     11],
            ['Home',      2],
            ['App',  2],
            ['TV', 2]
        ];
    };


};
