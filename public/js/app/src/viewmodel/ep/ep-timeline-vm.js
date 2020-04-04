/**
 * Copyright Digital Engagement Xperience 2018
 * @description VM for managing timelines
 */

/* global dexit, ko, moment, google */


/**
 *
 * @param {object} args
 * @param {dexit.app.ice.edu.BCInstanceVM} args.parentVM
 * @constructor
 */
dexit.app.ice.EPTimelineVM = function (args) {

    var self = this;
    var parentVM = args.parentVM;

    self.selectedSubcampaignIds = ko.observableArray();


    self.tempSelectedSubcampaignIds = ko.observableArray();


    self.init = function() {

        self.selectedSubcampaignIds(_.map(self.filteredCards(), 'id'));

        google.charts.load('current', {'packages':['gantt']});
        google.charts.setOnLoadCallback(self._drawChart);
        //default to showing all subcampaigns
        //self.selectedSubcampaigns(self.filteredCards());


    };


    self.timelineSettingModalVisible = ko.observable(false);

    self.showTimelineSettings = function() {
        self.tempSelectedSubcampaignIds(self.selectedSubcampaignIds());

        self.timelineSettingModalVisible(true);
    };


    self.saveSettings = function() {
        var mapped = _
            .chain(self.tempSelectedSubcampaignIds())
            .map(function(id) {
                return (_.find(self.filteredCards(), {'id': id}));
            })
            .compact()
            .map('id')
            .value();
        self.selectedSubcampaignIds(mapped);
        self.timelineSettingModalVisible(false);
        self._drawChart();
    };


    self.title = ko.pureComputed(function(){
        return 'Showing ' + self.selectedSubcampaignIds().length +'/' + self.filteredCards().length +' scheduled campaigns';
    });

    self.filteredCards = ko.pureComputed(function(){

        return ko.utils.arrayFilter(parentVM.tempCards(), function(card) {
            return (card.scheduleSet() && !card.expired());
            //return (card.currentActivity() && card.currentActivity() === 'published' && !card.expired());
        });
    });

    self._calculatePercentComplete = function(startDate, endDate, currentDate, isPublished) {

        // var totalDuration = moment.duration(startDate.diff(endDate));
        if (!isPublished) {
            return 0;
        }
        //
        // var currentDuration = moment.duration(endDate.diff(currentDate));

        //gives a percentage as decimal ie. 0.12345
        var percentageComplete = (currentDate - startDate) / (endDate - startDate);
        //round decimal to clean even number ie. 0.123 to 0.12 - to 12.00
        var percentageRounded = (Math.round(percentageComplete * 100) / 100) * 100;

        return percentageRounded;

    };

    self._calculateEndDate = function(endDate){
        if (endDate) {
            return endDate;
        } else {
            //endDate will be empty if "never" was used -set to 2065 as end Date
            var tempEndDate = moment().add(10, 'years');
            return tempEndDate;
        }
    };

    self._loadData = function() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Task ID');
        data.addColumn('string', 'Task Name');
        data.addColumn('string', 'Resource');
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration');
        data.addColumn('number', 'Percent Complete');
        data.addColumn('string', 'Dependencies');


        var epCards = ko.utils.arrayFilter(self.filteredCards(), function(item) {
            return (self.selectedSubcampaignIds().indexOf(item.id) !== -1);
        });
        //populate data

        var currentDate = new moment();

        var taskId = 1;
        _.each(epCards, function(epCard) {

            var duration = null;//moment.duration(startDate.diff(endDate));

            var startDate = epCard.scheduleVM.scheduleSDT();
            if (_.isString(startDate)){
                startDate = moment(startDate, moment.ISO_8601);
            }
            var endDate =  self._calculateEndDate(epCard.scheduleVM.scheduleEDT());
            if (_.isString(endDate)){
                endDate = moment(endDate, moment.ISO_8601);
            }


            var dependencies = null; //??
            var isPublished = (epCard.currentActivity() === 'published');

            var resource = ( isPublished ? 'published' : 'pending'); //??

            var rowData = [
                ('0' +taskId),
                epCard.name(),
                resource,
                startDate.toDate(),
                endDate.toDate(),
                duration,
                self._calculatePercentComplete(startDate,endDate,currentDate, isPublished),
                dependencies
            ];
            data.addRow(rowData);
            taskId++;
        });

        return data;
    };


    self._drawChart = function() {

        function generatePalete(obj, number) {
            var arr = [];
            for (var i=0;i<number;i++){
                arr.push(obj);
            }
            return arr;
        }


        if (self.selectedSubcampaignIds().length < 1) {
            //nothing to display
            return;
        }
        var div = document.getElementById('timeline_chart_div');

        div.innerHTML = '';


        var data = self._loadData();
        // //will be reordered using start dates
        // data.addRows([
        //
        //     //performing well first
        //     ['01', 'Living better this time', 'Performing Well',
        //         new Date(2018, 1, 14), new Date(2018, 3, 29), null, 100, null],
        //     ['05', 'Another example', 'Performing Well',
        //         new Date(2018, 3, 30), new Date(2018, 7, 8), null, 20, null],
        //     ['03', 'Living healthier', 'Performing Well',
        //         new Date(2018, 2, 14), new Date(2018, 3, 11), null, 100, null],
        //
        //     //Some metrics need attention
        //     ['04', 'Living the life', 'Some metrics need attention',
        //         new Date(2018, 3, 30), new Date(2018, 5, 9), null, 50, null],
        //
        //     //Poor Performance
        //     ['02', 'Another published subcampaign', 'Poor Performance',
        //         new Date(2018, 2, 03), new Date(2018, 5, 14), null, 75, null],
        //
        //     //No data collected - future campaigns
        //     ['06', 'Another example in the future', 'No data collected',
        //         new Date(2018, 4, 25), new Date(2018, 6, 18), null, 0, null],
        //     ['07', 'Another future subcampaign', 'No data collected',
        //         new Date(2018, 5, 15), new Date(2018, 7, 18), null, 0, null]
        // ]);


        var height = self.selectedSubcampaignIds().length * 65;


        // var basePalette = {
        //     //performing well - green
        //     "color": "#4bff00", //lighter - for second part of bar and label
        //     "dark": "#2c7a39", //darker - for start of bar
        //     "light": "#48654a" //for when you click on other items
        // };

        //var palette = generatePalete(basePalette,self.selectedSubcampaignIds().length);

        var options = {
            //height will need to be adjusted based on data (needs to be at least 65px X number of campaigns)
            height: height + 80,
            gantt: {
                trackHeight: 65,
                criticalPathEnabled: false,
                barCornerRadius: 13,
                barHeight: 26,
                innerGridDarkTrack: {
                    fill: '#ffffff'
                },
                labelStyle: {
                    fontName: "Oxygen",
                    color: '#3a3a3a'
                },

                //need to be in the same order as the data for the correct colors
                // palette: palette
            }
        };

        var chart = new google.visualization.Gantt(div);
        chart.draw(data, options);
    };




};
