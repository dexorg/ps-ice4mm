/**
 * Copyright Digital Engagement Xperience Inc 2017
 */

/**
 *
 * @param {object} args
 * @param {string} [args.elementId= kpi-chart-div/dashboard-chart-div] - DOM element on page for chart
 * @param {object} args.bc - BC
 * @param {object} args.report - Report
 * @param {string} args.report.name - name
 * @param {string} args.report.classification - ('ED', 'CC')
 * @param {string} args.report.type - BC report type (ie. kpi, dashboard, widgetReport)
 * @param {string} [args.report.chartType=ColumnChart] - display chart type
 * @param {object} args.report.definition - current report instance definition
 * @param {object[]} args.report.definition.column - fields for report columns with type&name  (ie. {"type":"string", "name":"eService"})
 * @param {object[]} args.report.definition.data - string data/metricId of each column [["SeService Revenue", 62]]
 * @param {string} args.report.definition.refId - BC instance id for retrieving metrics data
 * @constructor
 */
dexit.app.ice.KpiReportVM = function (args) {

  	var rVM = this;
  	var noOp = function () {};

  	rVM.chartType = args.report.chartType || 'ColumnChart';
    rVM.report = args.report; //mainly contains current report definition
  	rVM.elementId = args.elementId || 'kpi-chart-div';
    // pass reference to the chart to the rest of the VM
    rVM.DOMchart;

    // if (rVM.report && rVM.report.bizObjectiveMetrics) {
    //     rVM.bizObjectiveMetrics = ko.observableArray(rVM.report.bizObjectiveMetrics);
    // }

    var title = args.report.title || rVM.report.definition.name;
    rVM.title = ko.observable(title);
    rVM.chartOptions = args.report.options || {
        height: 225,
        vAxis: {
            minValue: 0
        },
        animation: {
            duration: 1000,
            easing: 'out'
        },
        colors: ['blue', 'orange', 'green', 'red'],
        hAxis: {}
    };

    rVM.classification = ko.observable('');
    if (args.report.classification) {
        rVM.classification(args.report.classification);
    }

    rVM.classificationStyle = ko.pureComputed(function () {
        var classification = rVM.classification();

        if (classification && classification.toLowerCase() === 'ed') {
            return 'success-color';
        } else if (classification && classification.toLowerCase() === 'cc') {
            return  'warning-color';
        }else {
            return '';
        }
    });

    rVM.loadReport = function(containerRef, overrideParams){

        var container = (containerRef ? containerRef : document.getElementById(rVM.elementId) );


        switch(rVM.report.type) {
            case 'external':
                debugger;
                drawExternalChart(container,overrideParams);
                break;
            case 'kpiReport':
                google.charts.load('current', {'packages': ['corechart','bar']});
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


    var drawExternalChart =  function (domReference,overrideParams) {


        var iframe = document.createElement('iframe');
        //iframe.setAttribute("seamless","true");
        iframe.height = rVM.chartOptions.height || '200';
        iframe.width = rVM.chartOptions.width || '400';
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';

        var seperator = (rVM.report.definition.location.indexOf('?') === -1 ? '?': '&');

        //TODO: make into configuration for chart itself
        debugger;
        if (overrideParams) {

            if (overrideParams.width) {
                iframe.width = overrideParams.width;

            }
            if (overrideParams.height){
                iframe.height = overrideParams.height;
            }
            if (overrideParams.scrolling) {
                iframe.scrolling = 'yes';
            }



            iframe.src = rVM.report.definition.location +  seperator+ 'view=true';

            // var ind = rVM.report.definition.location.indexOf('&height=');
            // //ICEMM-950: workaround, set height to 400 by default if not specified in string
            // if (ind === -1) {
            //     iframe.src = rVM.report.definition.location + '&view=true';
            // }else {
            //     var str = rVM.report.definition.location.substring(0,ind);
            //
            //     iframe.src = str + '&height=400';
            // }

        }else {
            iframe.style = 'transform: scale(0.8);transform-origin: 0 80%;';
            iframe.src = rVM.report.definition.location  +  seperator + 'view=true&hideTop=true';
        }





        //     iframe
        // <iframe
        //     width="600"
        //     height="400"
        //     seamless
        //     frameBorder="0"
        //     scrolling="no"
        //     src="http://superset-test4.herokuapp.com/superset/explore/?form_data=%7B%22datasource%22%3A%224__table%22%2C%22viz_type%22%3A%22line%22%2C%22slice_id%22%3A4%2C%22granularity_sqla%22%3A%22transaction_time%22%2C%22time_grain_sqla%22%3A%22P1D%22%2C%22since%22%3A%221+months+ago%22%2C%22until%22%3A%22now%22%2C%22metrics%22%3A%5B%7B%22expressionType%22%3A%22SIMPLE%22%2C%22optionName%22%3A%22metric_odjx6a2j9s_hgagllkc53%22%2C%22aggregate%22%3A%22SUM%22%2C%22fromFormData%22%3Atrue%2C%22hasCustomLabel%22%3Afalse%2C%22column%22%3A%7B%22optionName%22%3A%22_col_transaction_charge%22%2C%22filterable%22%3Atrue%2C%22description%22%3Anull%2C%22groupby%22%3Atrue%2C%22type%22%3A%22NEWDECIMAL%22%2C%22expression%22%3A%22%22%2C%22is_dttm%22%3Afalse%2C%22column_name%22%3A%22transaction_charge%22%2C%22verbose_name%22%3Anull%7D%2C%22sqlExpression%22%3Anull%2C%22label%22%3A%22SUM%28transaction_charge%29%22%7D%5D%2C%22adhoc_filters%22%3Anull%2C%22groupby%22%3A%5B%22reference_id%22%5D%2C%22limit%22%3A%220%22%2C%22timeseries_limit_metric%22%3Anull%2C%22order_desc%22%3Atrue%2C%22contribution%22%3Afalse%2C%22color_scheme%22%3A%22bnbColors%22%2C%22show_brush%22%3A%22auto%22%2C%22show_legend%22%3Atrue%2C%22rich_tooltip%22%3Atrue%2C%22show_markers%22%3Afalse%2C%22line_interpolation%22%3A%22linear%22%2C%22x_axis_label%22%3A%22%22%2C%22bottom_margin%22%3A%22auto%22%2C%22x_ticks_layout%22%3A%22auto%22%2C%22x_axis_format%22%3A%22smart_date%22%2C%22x_axis_showminmax%22%3Afalse%2C%22y_axis_label%22%3A%22%22%2C%22left_margin%22%3A%22auto%22%2C%22y_axis_showminmax%22%3Afalse%2C%22y_log_scale%22%3Afalse%2C%22y_axis_format%22%3A%22.3s%22%2C%22y_axis_bounds%22%3A%5Bnull%2Cnull%5D%2C%22rolling_type%22%3A%22None%22%2C%22time_compare%22%3A%5B%5D%2C%22num_period_compare%22%3A%22%22%2C%22period_ratio_type%22%3A%22growth%22%2C%22resample_how%22%3Anull%2C%22resample_rule%22%3Anull%2C%22resample_fillmethod%22%3Anull%2C%22annotation_layers%22%3A%5B%5D%2C%22filters%22%3A%5B%5D%2C%22url_params%22%3A%7B%7D%7D&standalone=true&height=400"

        domReference.appendChild(iframe);
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
                            //TODO should consider KPI report is a BCi with specific metricsID attached
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

        var columnIndex = {

        };
        _.each(rVM.report.definition.column, function (field, index) {
            rVM.chartData.addColumn(field.type, field.name);
            columnIndex[field.name] = index;
        });
        var tempData = [];


        _.each(rVM.report.definition.data, function(row, index){
            var rowData = new Array(rVM.report.definition.column.length);

            _.each(row, function (value,key) {
                var ind = columnIndex[key];

                //if number convert value
                var col = _.find(rVM.report.definition.column, function (val) {
                    return val.name === key;
                });
                if (col.type === 'number') {
                    try {
                        value = parseFloat(value);
                    }catch (e) {}
                }
                rowData[ind] = value;
            });
            tempData.push(rowData);
        });

        rVM.chartData.addRows(tempData);
        rVM.renderChart(null, { chartType: rVM.chartType }, null, null, domRef);



        // _.each(rVM.report.definition.data, function(, index){
        //     var tempColumnData = columnData;
        //
        //     var tempColumnData = new Array(2);
        //
        //     //convert obj keys to array
        //     if (_.isObject) {
        //         tempColumnData[index]
        //     }
        //
        //     if(_.isArray(columnData)){
        //         var allColumnData = _.after(columnData.length, function(){
        //             tempData.push(tempColumnData);
        //             allData();
        //         });
        //         _.each(columnData, function(columnElement, index){
        //             // if(_.isString(columnElement)) {
        //                 tempColumnData[index] = columnElement;
        //             // }
        //                 allColumnData();
        //             // }else if(_.isNumber(columnElement)){
        //             //     //TODO should consider KPI report is a BCi with specific metricsID attached
        //             //     var params = {id: rVM.report.definition.refId, type: rVM.report.definition.refType, metricId: columnElement};
        //             //     dexit.app.ice.integration.bcp.retrieveBCInstanceMetricData(params, function (err, data) {
        //             //         if (err) {
        //             //             //set default value 0
        //             //             tempColumnData[index] = 0;
        //             //         } else {
        //             //             if (data && data.length > 0 && data[0].metric_value) {
        //             //                 tempColumnData[index] = parseFloat(data[0].metric_value);
        //             //             }
        //             //         }
        //             //         allColumnData();
        //             //     });
        //             // }
        //         });
        //     }else{
        //         console.log("KPI report definition has invalid data format!");
        //         allData();
        //     }
        // });
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
            chartData = JSON.parse(element.dataset.chartdata);
            element.classList.add('active-chart-icon');
        } else {
            chartData = defaultData;
            try {
                $('.change-chart').get(0).classList.add('active-chart-icon');
            } catch (e) {
                console.warn(e);
            }
        }

        if (chartData.pieHole) {
            rVM.chartOptions.pieHole = parseFloat(chartData.pieHole);
        }


        rVM.chart.setOptions(rVM.chartOptions);
        rVM.chart.setChartType(chartData.chartType);
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

};
