/**
 * Copyright Digital Engagement Xperience Inc 2017
 */

/**
 *
 * @param {object} args
 * @param {object} args.reportTool - 3rd party reporting tool
 * @param {object} args.reportDef - Report definition
 * @param {object[]} args.reportDef.data - metrics reference of report label
 * @param {object[]} args.reportDef.presentaion - presentaion of report label eg. chart type, title..
 * @constructor
 */
dexit.app.ice.reportEngine = function (args, callback) {
    var noOp = function () {};
    callback = callback || noOp();
    var reportEngine = this;

    var reportTool;
    if(args && args.reportTool) {
        reportTool = args.reportTool;
    }
    if(reportTool === 'eCharts'){
        reportEngine.data = args.reportDef.data;
        reportEngine.presentation = args.reportDef.presentation;
        reportEngine.renderFunc;
        async.auto({
            prepareData: function(done){
                var reportData = [];
                var allData = _.after(reportEngine.data.length, function(){
                    done(null, reportData);
                });
                _.each(reportEngine.data, function(metricData, index){
                    var currMetric = {label: metricData.label, data: 0};
                    var params = {id: metricData.metric.bcId, type: metricData.metric.bcType, metricId: metricData.metric.metricId};
                    dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(params, function (err, data) {
                        if (err) {
                            //set default value 0
                        } else {
                            if (data && data.length > 0 && data[0].metric_value) {
                                currMetric.data = parseFloat(data[0].metric_value);
                            }
                        }
                        reportData.push(currMetric);
                        allData();
                    });
                });
            },
            preparePresentation:['prepareData', function(done, result){
                //prepare the tags, which is used to create div element in region
                //{args:{tag: 'div-id', options:{}}, func:{init: 'init', load: 'setOption'}}
                var reportPresentations = [];
                var allPresentation = _.after(reportEngine.presentation.length, function(){
                    done(null, reportPresentations);
                });
                _.each(reportEngine.presentation, function(presentation, index){
                    var rederStructure = {args:{tag: presentation.label.join('-'), options:{}}, showFunc:{init: 'init', load: 'setOption'}};
                    var reportData = [];
                    //create div for rendering the report
                    var currDom = document.createElement('div');
                    //user all label names in one presentation as div id
                    currDom.setAttribute('id', presentation.label.join('-'));
                    //currDom.style.width = "100px";
                    //currDom.style.height = "100px";
                    //initial chart instance
                    var currChart = echarts.init(currDom, null, {width: 200, height: 200});
                    _.each(presentation.label, function(labelName, index){

                        var dataValue = _.find(result.prepareData, {label: labelName});
                        reportData[index] = {value: dataValue.data, name: dataValue.label} ;
                    });
                    var option = {
                        title: {
                            text: presentation.title
                        },
                        tooltip: {},
                        legend: {
                            data: presentation.name? presentation.name : null
                        },
                        xAxis: {
                            data: presentation.label
                        },
                        yAxis: {},
                        series: [{
                            type: presentation.type,
                            data: reportData,
                        }]
                    };
                    if(presentation.type === 'pie'){
                        option = {
                            title: {
                                text: presentation.title
                            },
                            tooltip: {},
                            legend: {
                                data: presentation.name? presentation.name : null
                            },
                            label: {
                                normal: {
                                    show: false
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                            series: [{
                                type: presentation.type,
                                data: reportData,
                                radius : [50, 70],
                            }]
                        };
                    }
                    reportPresentations.push({dom: currDom, showFunc: currChart, option: option});
                    allPresentation();
                });

            }]
        }, function(err, result){
            reportEngine.renderInfo = result.preparePresentation;
            callback(null, result.preparePresentation);
        });

    }
    else if(reportTool && reportTool === 'googleChart'){
        //TODO: need update if we need to support googlechart with new report definition
        var rVM = this;
        rVM.chartType = args.report.chartType || 'ColumnChart';
        rVM.report = args.report; //mainly contains current report definition
        // rVM.elementId = args.elementId || 'kpi-chart-div';
        // pass reference to the chart to the rest of the VM
        rVM.DOMchart;


        rVM.chartOptions = args.report.options || {
            height: 225,
            vAxis: {
                minValue: 0,
                maxValue: 100
            },
            animation: {
                duration: 1000,
                easing: 'out'
            },
            colors: ['blue', 'orange', 'green', 'red'],
            hAxis: {title: rVM.report.definition.name}
        };

        rVM.loadReport = function(containerRef){

            var container = (containerRef ? containerRef : document.getElementById(rVM.elementId) );


            switch(rVM.report.type) {
                case 'kpiReport':
                    google.charts.load('current', {'packages': ['corechart']});
                    google.charts.setOnLoadCallback(function() {
                        drawKPIChart(container);
                    });
                    break;
                case 'dashboardReport':
                    google.charts.load('current', {packages: ['bar']});
                    google.charts.setOnLoadCallback(function(){
                        drawDashboardChart(container);
                    });
                    break;
                case 'segmentReport':
                    google.charts.load('current', {packages: ['gauge']});
                    google.charts.setOnLoadCallback(function(){
                        drawSegmentReport(container);
                    });
                    break;
            }
        };

        /**
         * use google.visualization.DataTable to generate ICE4M KPI report
         *
         */
        var drawSegmentReport = function (domReference) {
            if(rVM.report.definition.data){
                var dataArray = [];
                dataArray.push(rVM.report.definition.column);
                var allData = _.after(rVM.report.definition.data.length, function(){
                    var data = google.visualization.arrayToDataTable(dataArray);
                    if (domReference) {
                        rVM.chart = new google.visualization.Gauge(domReference);
                        var options = {
                            width: 400, height: 120,
                            redFrom: 90, redTo: 100,
                            yellowFrom:75, yellowTo: 90,
                            minorTicks: 5
                        };
                        rVM.chart.draw(data, options);
                    } else {
                        console.warn('reference not found! Cannot render chart.');
                    }
                });
                _.each(rVM.report.definition.data, function(columnData, index){
                    var tempColumnData = columnData;

                    if(_.isArray(columnData)){
                        var allColumnData = _.after(columnData.length, function(){
                            dataArray.push(tempColumnData);
                            allData();
                        });
                        _.each(columnData, function(columnElement, index){
                            if(_.isString(columnElement)){
                                tempColumnData[index] = columnElement;
                                allColumnData();
                            }else if(_.isNumber(columnElement)){
                                var params = {id: rVM.report.definition.refId, type: rVM.report.definition.refType, metricId: columnElement};
                                dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(params, function (err, data) {
                                    if (err) {
                                        //set default value 0
                                        tempColumnData[index] = 88;
                                    } else {
                                        if (data && data.length > 0 && data[0].metric_value) {
                                            tempColumnData[index] = parseFloat(data[0].metric_value);
                                        }
                                    }
                                    allColumnData();
                                });
                            }
                        });
                    }else{
                        console.log('KPI report definition has invalid data format!');
                        allData();
                    }
                });
            }

            rVM.chartData = google.visualization.arrayToDataTable([
                ['Label', 'Value'],
                ['Minutes', 80],
                ['Data', 55],
                ['Balance', 68]
            ]);

            var options = {
                width: 120, height: 400,
                redFrom: 90, redTo: 100,
                yellowFrom:75, yellowTo: 90,
                minorTicks: 5
            };

            rVM.chart = new google.visualization.Gauge(domReference);

            rVM.chart.draw(rVM.chartData, options);

            setInterval(function() {
                rVM.chartData.setValue(0, 1, 40 + Math.round(60 * Math.random()));
                rVM.chart.draw(rVM.chartData, options);
            }, 13000);
            setInterval(function() {
                rVM.chartData.setValue(1, 1, 40 + Math.round(60 * Math.random()));
                rVM.chart.draw(rVM.chartData, options);
            }, 5000);
            setInterval(function() {
                rVM.chartData.setValue(2, 1, 60 + Math.round(20 * Math.random()));
                rVM.chart.draw(rVM.chartData, options);
            }, 26000);
        };
        /**
         * use google.visualization.DataTable to generate ICE4M KPI report
         *
         */
        var drawKPIChart = function (domRef) {
            rVM.chart = new google.visualization.ChartWrapper({containerId: rVM.elementId});
            rVM.chartData = new google.visualization.DataTable();
            _.each(rVM.report.definition.column, function (field) {
                rVM.chartData.addColumn(field.type, field.name);
            });
            var tempData = [];
            var allData = _.after(rVM.report.definition.data.length, function(){
                rVM.chartData.addRows(tempData);
                rVM.renderChart(null, { chartType: rVM.chartType }, null, null, domRef);
            });
            _.each(rVM.report.definition.data, function(columnData, index){
                var tempColumnData = columnData;

                if(_.isArray(columnData)){
                    var allColumnData = _.after(columnData.length, function(){
                        tempData.push(tempColumnData);
                        allData();
                    });
                    _.each(columnData, function(columnElement, index){
                        if(_.isString(columnElement)){
                            tempColumnData[index] = columnElement;
                            allColumnData();
                        }else if(_.isNumber(columnElement)){
                            //TODO should consider KPI report is a BCi with specific metricsID attached
                            var params = {id: rVM.report.definition.refId, type: rVM.report.definition.refType, metricId: columnElement};
                            dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(params, function (err, data) {
                                if (err) {
                                    //set default value 0
                                    tempColumnData[index] = 0;
                                } else {
                                    if (data && data.length > 0 && data[0].metric_value) {
                                        tempColumnData[index] = parseFloat(data[0].metric_value);
                                    }
                                }
                                allColumnData();
                            });
                        }
                    });
                }else{
                    console.log('KPI report definition has invalid data format!');
                    allData();
                }
            });
        };
        /**
         * use google.visualization.arrayToDataTable to generate ICE4M KPI report
         *
         */
        var drawDashboardChart = function(domRef) {
            var dataArray = [];
            dataArray.push(rVM.report.definition.column);
            var allData = _.after(rVM.report.definition.data.length, function(){
                var data = google.visualization.arrayToDataTable(dataArray);

                if (domRef) {
                    var chart = new google.visualization.BarChart(domRef);
                    var options = {
                        title: rVM.report.definition.name,
                        legend: {position: 'center'},
                        hAxis: {title: 'Achieved VS Goal'},
                        vAxis: {title: 'Smart eServices'},
                        colors: ['blue', 'green'],
                        bars: 'horizontal' // Required for Material Bar Charts.
                    };
                    chart.draw(data, options);
                } else {
                    console.warn(rVM.elementId + 'not found! Cannot render chart.');
                }
            });
            _.each(rVM.report.definition.data, function(columnData, index){
                var tempColumnData = columnData;

                if(_.isArray(columnData)){
                    var allColumnData = _.after(columnData.length, function(){
                        dataArray.push(tempColumnData);
                        allData();
                    });
                    _.each(columnData, function(columnElement, index){
                        if(_.isString(columnElement)){
                            tempColumnData[index] = columnElement;
                            allColumnData();
                        }else if(_.isNumber(columnElement)){
                            //TODO should consider KPI report is a BCi with specific metricsID attached
                            var params = {id: rVM.report.definition.refId, type: rVM.report.definition.refType, metricId: columnElement};
                            dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(params, function (err, data) {
                                if (err) {
                                    //set default value 0
                                    tempColumnData[index] = 0;
                                } else {
                                    if (data && data.length > 0 && data[0].metric_value) {
                                        tempColumnData[index] = parseFloat(data[0].metric_value);
                                    }
                                }
                                allColumnData();
                            });
                        }
                    });
                }else{
                    console.log('KPI report definition has invalid data format!');
                    allData();
                }
            });
        };

        rVM.renderChart = function(event, defaultData, optionsAddOns, element, domRef) {

            $('.change-chart').removeClass('active-chart-icon');

            if (event) {
                rVM.chartData = JSON.parse(element.dataset.chartdata);
                element.classList.add('active-chart-icon');
            } else {
                rVM.chartData = defaultData;
                try {
                    $('.change-chart').get(0).classList.add('active-chart-icon');
                } catch (e) {
                    console.warn(e);
                }
            }

            if (rVM.chartData.pieHole) {
                rVM.chartOptions.pieHole = parseFloat(rVM.chartData.pieHole);
            }


            rVM.chart.setOptions(rVM.chartOptions);
            rVM.chart.setChartType(rVM.chartData.chartType);
            rVM.chart.setDataTable(rVM.chartData);
            if (domRef) {
                rVM.chart.draw(domRef);
            }else {
                if (document.querySelector('#' + rVM.elementId)) {
                    rVM.chart.draw();
                } else {
                    console.warn(rVM.elementId + 'not found! Cannot draw chart.');
                }
            }
        };

        rVM.showChart = function() {
            var theChart = $(event.currentTarget).parent().siblings('.chart-wrapper'),
                quickstatsChart = $('.quickstats-chart-wrapper');

            if (theChart.hasClass('show-chart')) {
                theChart.removeClass('show-chart');
                $(event.currentTarget).parents('.metric-assets-wrapper').siblings('.metrics-buttons').addClass('hidden');
                if(quickstatsChart.hasClass('show-chart')){
                    quickstatsChart.removeClass('show-chart');
                }
            } else {
                theChart.addClass('show-chart');
                quickstatsChart.addClass('show-chart');
                $(event.currentTarget).parents('.metric-assets-wrapper').siblings('.metrics-buttons').removeClass('hidden');
            }
        };
    }


};
