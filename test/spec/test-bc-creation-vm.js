/**
* Copyright Digital Engagement Xperience 2017
*/

/*global chai, sinon, ko, dexit */

(function () {
    'use strict';

    var should = chai.should();
    var expect = chai.expect;

    describe('bc-creation-vm', function () {

        function getMockMainVM() {
            var mockMainVM ={
                fileTypeRestrictions: ko.observable(),
                currentRole: ko.observable('sales'),
                getAssociatedProductIns: function(params, cb){

                },
                listOfBcInstances: ko.observableArray([]),
                repo: 'test',
                currBCType: ko.observable('merchandisingCampaign'),
                loadMMForBC: function () {

                },
                touchpointTypes: ko.observableArray([]),
                selectedTPType: ko.observable('bcc'),
                selectedTP: ko.observable({tpId:'a'}),
                hideCreate: function () {
                },
                bcName: ko.observable('name'),
                selectedBCIns: ko.observable(),
                channelAuth: ko.observable(),
                setWidgetReport: function () {

                }
            };
            return mockMainVM;
        }

        var sampleAssociatedBCDefinitions = {reports: {
            'intelligenceReport': [{'role':'subscriber',
                'definition': {
                    'data': [
                        {'label':'Balance', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1170}},
                        {'label':'Minutes', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}},
                        {'label':'data', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}}],
                    'presentation':[
                        {'label':['Balance'], 'type': 'bar', 'title': 'current Usage'},
                        {'label':['Minutes'], 'type': 'pie', 'title': 'current Usage'},
                        {'label':['data'], 'type': 'pie', 'title': 'current Usage'}]
                }
            },
            {'role':'retailer',
                'definition': {
                    'data': [
                        {'label':'Balance', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1170}},
                        {'label':'Minutes', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}},
                        {'label':'data', 'metric':{'bcId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','bcType':'MerchandisingCampaign', 'metricId': 1660}}],
                    'presentation':[
                        {'label':['Balance'], 'type': 'bar', 'title': 'current Usage'},
                        {'label':['Minutes'], 'type': 'pie', 'title': 'current Usage'},
                        {'label':['data'], 'type': 'pie', 'title': 'current Usage'}]
                }
            }],
            'segmentReport':[{'role':'subscriber','name':'1-subscriber-report', 'definition':[{'metricId':282, 'icon':'fa fa-bolt'},{'metricId':292, 'icon':'fa fa-hourglass-half'},{'metricId':302, 'icon':'fa fa-usd'}]},
                {'role':'retailer','name':'1-retailer-report', 'definition':[{'metricId':312, 'icon':'fa fa-shopping-cart'},{'metricId':322, 'icon':'fa fa-hourglass-half'},{'metricId':332, 'icon':'fa fa-usd'}]},
                {'role':'wholesaler','name':'1-wholesaler-report', 'definition':[{'metricId':342, 'icon':'fa fa-shopping-cart'},{'metricId':352, 'icon':'fa fa-usd'},{'metricId':362, 'icon':'fa fa-percent'}]},
                {'role':'subscriber','name':'2-subscriber-report', 'definition':[{'metricId':282, 'icon':'fa fa-bolt'},{'metricId':292, 'icon':'fa fa-hourglass-half'},{'metricId':302, 'icon':'fa fa-usd'}]},
                {'role':'retailer','name':'2-retailer-report', 'definition':[{'metricId':312, 'icon':'fa fa-shopping-cart'},{'metricId':322, 'icon':'fa fa-hourglass-half'},{'metricId':332, 'icon':'fa fa-usd'}]},
                {'role':'wholesaler','name':'2-wholesaler-report', 'definition':[{'metricId':342, 'icon':'fa fa-shopping-cart'},{'metricId':352, 'icon':'fa fa-usd'},{'metricId':362, 'icon':'fa fa-percent'}]}],
            'widgetReport':[
                {'role':'salesManager','bcType':'MerchandisingCampaign','name':'widgetReport for EREC','seSInstanceId':'EREC','level':'dashboard',
                    'definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-tags'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'}]},
                {'role':'salesManager','bcType':'MerchandisingCampaign','name':'widgetReport for EVOU','seSInstanceId':'EVOU','level':'dashboard',
                    'definition':[{'metricId':182, 'name':'total_orders_processed', 'icon':'fa fa-shopping-cart'},{'metricId':192, 'name':'total_dollars_retail', 'icon':'fa fa-usd'},{'metricId':202, 'name':'total_dealers', 'icon':'fa fa-user-plus'}]},
                {'role':'salesManager','bcType':'MerchandisingCampaign','name':'widgetReport for EORD','seSInstanceId':'EORD','level':'dashboard',
                    'definition':[{'metricId':142, 'name':'total_orders', 'icon':'fa fa-shopping-cart'},{'metricId':242, 'name':'total_dollars', 'icon':'fa fa-usd'},{'metricId':132, 'name':'average_commission', 'icon':'fa fa-percent'}]},
                {'role':'salesManager','bcType':'EngagementPlan','name':'widgetReport for EREC','seSInstanceId':'EREC','level':'EPA',
                    'definition':[{'metricId':272, 'name':'total_recharge_users_per_pattern', 'icon':'fa fa-user-plus'},{'metricId':252, 'name':'total_recharge_count_per_pattern', 'icon':'fa fa-tags'},{'metricId':262, 'name':'total_recharge_amount_per_pattern', 'icon':'fa fa-usd'}]},
                {'role':'salesManager','bcType':'EngagementPlan','name':'widgetReport for EVOU','seSInstanceId':'EVOU','level':'EPA',
                    'definition':[{'metricId':212, 'name':'total_orders_processed_per_pattern', 'icon':'fa fa-shopping-cart'},{'metricId':222, 'name':'total_dollars_retail_per_pattern', 'icon':'fa fa-usd'},{'metricId':232, 'name':'total_dealers_per_pattern', 'icon':'fa fa-user-plus'}]},
                {'role':'salesManager','bcType':'EngagementPlan','name':'widgetReport for EORD','seSInstanceId':'EORD','level':'EPA',
                    'definition':[{'metricId':162, 'name':'total_orders_per_pattern', 'icon':'fa fa-shopping-cart'},{'metricId':172, 'name':'total_dollars_per_pattern', 'icon':'fa fa-usd'},{'metricId':152, 'name':'average_commission_per_pattern', 'icon':'fa fa-percent'}]},
                {'role':'productManager','bcType':'Product','name':'widgetReport for EREC','seSInstanceId':'EREC','level':'dashboard',
                    'definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-bolt'}]},
                {'role':'productManager','bcType':'Product','name':'widgetReport for EVOU','seSInstanceId':'EVOU','level':'dashboard',
                    'definition':[{'metricId':182, 'name':'total_orders_processed', 'icon':'fa fa-shopping-cart'},{'metricId':192, 'name':'total_dollars_retail', 'icon':'fa fa-usd'},{'metricId':202, 'name':'total_dealers', 'icon':'fa fa-user-plus'}]},
                {'role':'productManager','bcType':'Product','name':'widgetReport for EORD','seSInstanceId':'EORD','level':'dashboard',
                    'definition':[{'metricId':142, 'name':'total_orders', 'icon':'fa fa-shopping-cart'},{'metricId':242, 'name':'total_dollars', 'icon':'fa fa-usd'},{'metricId':132, 'name':'average_commission', 'icon':'fa fa-percent'}]},
                {'role':'subscriber','bcType':'MerchandisingCampaign','seSInstanceId':'EREC','level':'dashboard',
                    'definition':[{'metricId':282, 'name':'total_recharges_for_user', 'icon':'fa fa-bolt'},{'metricId':292, 'name':'total_minutes_for_user', 'icon':'fa fa-hourglass-half'},{'metricId':302, 'name':'total_dollars_for_user', 'icon':'fa fa-usd'}]},
                {'role':'retailer','bcType':'MerchandisingCampaign','seSInstanceId':'EVOU','level':'dashboard',
                    'definition':[{'metricId':312, 'name':'total_recharge_for_retailer', 'icon':'fa fa-shopping-cart'},{'metricId':322, 'name':'total_minutes_for_retailer', 'icon':'fa fa-hourglass-half'},{'metricId':332, 'name':'total_dollars_for_retailer', 'icon':'fa fa-usd'}]},
                {'role':'wholesaler','bcType':'MerchandisingCampaign','seSInstanceId':'EORD','level':'dashboard',
                    'definition':[{'metricId':342, 'name':'total_purchases_for_wholesaler', 'icon':'fa fa-shopping-cart'},{'metricId':352, 'name':'total_dollers_spent_for_wholesaler', 'icon':'fa fa-usd'},{'metricId':362, 'name':'average_commission_for_wholesaler', 'icon':'fa fa-percent'}]},
                {'role':'marketingManager','bcType':'MarketingCampaign','name':'Report for ECAM','seSInstanceId':'ECAM','level':'dashboard',
                    'definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'marketingManager','bcType':'MarketingCampaign','name':'Report for MSOC','seSInstanceId':'MSOC','level':'dashboard',
                    'definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'marketingManager','bcType':'Promotion','name':'Promotion Report for ECAM','seSInstanceId':'ECAM','level':'EPA',
                    'definition':[{'metricId':22, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':32, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':52, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'marketingDirector','seSInstanceId':'ECAM','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'marketingDirector','seSInstanceId':'MSOC','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'marketingDirector','seSInstanceId':'MSUB','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'marketingDirector','seSInstanceId':'MWS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'marketingDirector','seSInstanceId':'MRS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'executive','seSInstanceId':'EREC','level':'dashboard','definition':[{'metricId':82, 'name':'total_users', 'icon':'fa fa-user-plus'},{'metricId':62, 'name':'total_rechargecount', 'icon':'fa fa-tags'},{'metricId':72, 'name':'total_rechargeamount', 'icon':'fa fa-usd'}]},
                {'role':'executive','seSInstanceId':'EVOU','level':'dashboard','definition':[{'metricId':182, 'name':'total_orders_processed', 'icon':'fa fa-shopping-cart'},{'metricId':192, 'name':'total_dollars_retail', 'icon':'fa fa-usd'},{'metricId':202, 'name':'total_dealers', 'icon':'fa fa-user-plus'}]},
                {'role':'executive','seSInstanceId':'EORD','level':'dashboard','definition':[{'metricId':142, 'name':'total_orders', 'icon':'fa fa-shopping-cart'},{'metricId':242, 'name':'total_dollars', 'icon':'fa fa-usd'},{'metricId':132, 'name':'average_commission', 'icon':'fa fa-percent'}]},
                {'role':'executive','seSInstanceId':'ECAM','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'executive','seSInstanceId':'MSOC','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'executive','seSInstanceId':'MWS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'executive','seSInstanceId':'MRS','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]},
                {'role':'executive','seSInstanceId':'MSUB','level':'dashboard','definition':[{'metricId':112, 'name':'shares', 'icon':'fa fa-share-alt'},{'metricId':102, 'name':'likes', 'icon':'fa fa-thumbs-up'},{'metricId':122, 'name':'comments', 'icon':'fa fa-comments'}]}
            ],
            'kpiReport':[
                {'role': 'salesManager', 'bcType': 'Merchandising', 'name':'Sales Manager eService KPI Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eOrder Revenue'},{'type':'number', 'name':'eVoucher Revenue'},{'type':'number', 'name':'eRecharge Revenue'}],
                        'data':[['2016-Q1', 62, 182, 82],['2016-Q2', 62, 182, 82],['2016-Q3', 62, 182, 82],['2016-Q4', 62, 182, 82]]}},
                {'role': 'salesManager', 'bcType': 'Merchandising', 'name':'Sales Manager eService KPI Report 2',
                    'definition':{
                        'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eOrder Revenue'},{'type':'number', 'name':'eVoucher Revenue'},{'type':'number', 'name':'eRecharge Revenue'}],
                        'data':[['2016-Q1', 62, 182, 82],['2016-Q2', 62, 182, 82],['2016-Q3', 62, 182, 82],['2016-Q4', 62, 182, 82]]}},
                {'role': 'productManager', 'bcType': 'Product', 'name':'Revenue Summary - SeService Recharge',
                    'definition':{
                        'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'Regular'},{'type':'number', 'name':'Special'}],
                        'data':[['Smart eOrder', 62, 82], ['Smart eVoucher', 62, 82], ['Smart eRecharge', 62, 82]]}},
                {'role': 'subscriber', 'bcType': 'Merchandising', 'name':'My eRecharge Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'remained'},{'type':'number', 'name':'total_redeemed'}],
                        'data':[['current balance', 62, 182]]}},
                {'role': 'wholesaler', 'bcType': 'Merchandising', 'name':'My eOrder Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eOrder'}],
                        'data':[['Smart eOrder: Purchases', 62],['Smart eOrder: Sales', 182],['Smart eOrder: Commissions', 82]]}},
                {'role': 'retailer', 'bcType': 'Merchandising', 'name':'My eVoucher Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'name'},{'type':'number', 'name':'eVoucher'}],
                        'data':[['Smart eVoucher: Regular', 182],['Smart eVoucher: Special',82]]}},
                {'role': 'executive',  'bcType': 'Merchandising', 'name':'SeService Penetration Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'eService'},{'type':'number', 'name':'Revenue'}],
                        'data':[['SeService Revenue', 62],['Traditional Revenue', 182],['Others', 82]]}},
                {'role': 'executive', 'bcType': 'Marketing', 'name':'Engagement KPI Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'Total'},{'type':'number', 'name':'Engagement Metrics'}],
                        'data':[['Retention', 82],['Development', 62],['Acquisition', 182]]}},
                {'role': 'marketingDirector', 'bcType': 'Marketing', 'name':'Engagement KPI Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'Total'},{'type':'number', 'name':'Engagement Metrics'}],
                        'data':[['Conversation', 282],['Applause', 202],['Amplification', 322],['Consumption',342]]}},
                {'role': 'marketingManager', 'bcType': 'Marketing', 'name':'Engagement KPI Report',
                    'definition':{
                        'column': [{'type':'string', 'name':'Total'},{'type':'number', 'name':'Engagement Metrics'}],
                        'data':[['Conversation', 62],['Applause', 82],['Amplification', 182],['Consumption',202]]}}
            ],
            'dashboardReport':[
                {'role': 'executive', 'bcType': 'Merchandising', 'name':'SeService Achievement REPORT',
                    'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                        'column':['', 'Goal', 'Actual'],
                        'data':[['Total eOrder', 62, 82],['Total eVoucher', 182, 202],['Total eRecharge', 322, 342]]}},
                {'role': 'salesManager', 'bcType':'Merchandising', 'name':'SeService Achievement REPORT',
                    'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                        'column':['', 'Planned', 'Achieved'],
                        'data':[['social channel', 1170, 460],['traditional channel', 1660, 1120]]}},
                {'role': 'productManager', 'bcType':'Merchandising', 'name':'SeService Achievement REPORT',
                    'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                        'column':['', 'Planned', 'Achieved'],
                        'data':[['social channel', 1170, 460],['traditional channel', 1660, 1120]]}},
                {'role': 'executive', 'bcType':'Marketing',
                    'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                        'column':['', 'Sales', 'Profit'],
                        'data':[['Standard', 1170, 460],['online Promotion', 1660, 1120]]}},
                {'role': 'marketingManager', 'bcType':'Marketing',
                    'definition':{'refId': '15ddc64c-bbd7-4be9-8670-3379191d88d7','refType':'MerchandisingCampaign',
                        'column':['', 'Planned', 'Achieved'],
                        'data':[['Standard', 1170, 460],['online Promotion', 1660, 1120]]}}
            ]
        }};

        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('constructor', function() {

            it('should load with all args', function() {
                var args = {
                    mainVM: getMockMainVM(),
                    currBCDef: {
                        name: 'one',
                        singular: 'one',
                        plural: 'ones',
                        bctype:'one'
                    },
                    parentBCName: 'Offers',
                    associatedBCDefinitions: sampleAssociatedBCDefinitions,
                    permissions: {
                        behDefinePermission: ko.observable(true),
                        metricDefinePermission: ko.observable(true),
                        kpiDefinePermission: ko.observable(true),
                        segmentReportDefinePermission: ko.observable(true),
                        userProfileDefinePermission: ko.observable(true),
                        associatedBCDefinePermission: ko.observable(true),
                        associatedEntityDefinePermission: ko.observable(true),
                        tpDefinePermission: ko.observable(true),
                        mmDefinePermission: ko.observable(true)

                    }
                };
                var vm = new dexit.app.ice.BCCreationVM(args);
                should.exist(vm);

            });

            it('should load with default for parentBCName when not supplied', function() {
                var args = {
                    mainVM: getMockMainVM(),
                    currBCDef: {
                        name: 'one',
                        singular: 'one',
                        plural: 'ones',
                        bctype:'one'
                    },
                    associatedBCDefinitions: sampleAssociatedBCDefinitions,

                    permissions: {
                        behDefinePermission: ko.observable(true),
                        metricDefinePermission: ko.observable(true),
                        kpiDefinePermission: ko.observable(true),
                        segmentReportDefinePermission: ko.observable(true),
                        userProfileDefinePermission: ko.observable(true),
                        associatedBCDefinePermission: ko.observable(true),
                        associatedEntityDefinePermission: ko.observable(true),
                        tpDefinePermission: ko.observable(true),
                        mmDefinePermission: ko.observable(true)

                    }
                };
                var vm = new dexit.app.ice.BCCreationVM(args);
                should.exist(vm);
                var name = vm.parentBCiName();
                should.exist(name);
                name.should.equal('Merchandising');

            });

            it('should throw error with missing required parameter: currBCDef', function() {
                var args = {
                    mainVM: getMockMainVM(),
                    associatedBCDefinitions: sampleAssociatedBCDefinitions,
                    permissions: {
                        behDefinePermission: ko.observable(true),
                        metricDefinePermission: ko.observable(true),
                        kpiDefinePermission: ko.observable(true),
                        segmentReportDefinePermission: ko.observable(true),
                        userProfileDefinePermission: ko.observable(true),
                        associatedBCDefinePermission: ko.observable(true),
                        associatedEntityDefinePermission: ko.observable(true),
                        tpDefinePermission: ko.observable(true),
                        mmDefinePermission: ko.observable(true)
                    }
                };
                (function(){
                    new dexit.app.ice.BCCreationVM(args);
                }).should.throw(Error);

            });

            it('should throw error with missing required parameter: mainVM', function() {
                var args = {
                    currBCDef: {
                        name: 'one',
                        singular: 'one',
                        plural: 'ones',
                        bctype:'one'
                    },
                    associatedBCDefinitions: sampleAssociatedBCDefinitions,
                    permissions: {
                        behDefinePermission: ko.observable(true),
                        metricDefinePermission: ko.observable(true),
                        kpiDefinePermission: ko.observable(true),
                        segmentReportDefinePermission: ko.observable(true),
                        userProfileDefinePermission: ko.observable(true),
                        associatedBCDefinePermission: ko.observable(true),
                        associatedEntityDefinePermission: ko.observable(true),
                        tpDefinePermission: ko.observable(true),
                        mmDefinePermission: ko.observable(true)
                    }
                };
                (function(){
                    new dexit.app.ice.BCCreationVM(args);
                }).should.throw(Error);

            });
            it('should throw error with missing required parameter:args', function() {
                (function(){
                    new dexit.app.ice.BCCreationVM();
                }).should.throw(Error);

            });


            it('should throw error with missing required parameter:associatedBCDefinitions', function() {
                var args = {
                    mainVM: getMockMainVM(),
                    currBCDef: {
                        name: 'one',
                        singular: 'one',
                        plural: 'ones',
                        bctype:'one'
                    },
                    permissions: {
                        behDefinePermission: ko.observable(true),
                        metricDefinePermission: ko.observable(true),
                        kpiDefinePermission: ko.observable(true),
                        segmentReportDefinePermission: ko.observable(true),
                        userProfileDefinePermission: ko.observable(true),
                        associatedBCDefinePermission: ko.observable(true),
                        associatedEntityDefinePermission: ko.observable(true),
                        tpDefinePermission: ko.observable(true),
                        mmDefinePermission: ko.observable(true)

                    }
                };
                (function(){
                    new dexit.app.ice.BCCreationVM(args);
                }).should.throw(Error);

            });

        });

        describe('should populate creation form based on configuration', function(){
            it('should populate all fields', function(){
                var mockMainVM = getMockMainVM();
                var args = {
                    mainVM: mockMainVM,
                    currBCDef: {
                        name: 'one',
                        singular: 'one',
                        plural: 'ones',
                        bctype: 'one'
                    },
                    associatedBCDefinitions: sampleAssociatedBCDefinitions,
                    permissions: {
                        behDefinePermission: ko.observable(true),
                        metricDefinePermission: ko.observable(true),
                        kpiDefinePermission: ko.observable(true),
                        segmentReportDefinePermission: ko.observable(true),
                        userProfileDefinePermission: ko.observable(true),
                        associatedBCDefinePermission: ko.observable(true),
                        associatedEntityDefinePermission: ko.observable(true),
                        tpDefinePermission: ko.observable(true),
                        mmDefinePermission: ko.observable(true)

                    }
                };
                var vm = new dexit.app.ice.BCCreationVM(args);

                sandbox.stub(vm,'clear');
                sandbox.stub(vm,'populateBehaviours');
                sandbox.stub(vm,'_getAssociatedBCs');
                sandbox.stub(vm,'_loadExistingTPs');

                sandbox.stub(dexit.app.ice.integration.metrics,'listBehEpts').yields(null,['1','2']);
                sandbox.stub(vm, '_retrieveAvailableBI');
                sandbox.stub(mockMainVM,'loadMMForBC');
                vm.showCreate();
                vm.clear.should.have.been.calledOnce;
                vm.populateBehaviours.should.have.been.calledOnce;
                vm._getAssociatedBCs.should.have.been.calledOnce;
                vm._retrieveAvailableBI.should.have.been.calledOnce;
                vm._getAssociatedBCs.should.have.been.calledWith(args.currBCDef,mockMainVM.currentRole());
                dexit.app.ice.integration.metrics.listBehEpts.should.have.been.calledOnce;
                //mockMainVM.loadMMForBC.should.have.been.calledOnce;
            });
        });


        describe('Add BCi', function() {

            var bcDef = {
                'singular': 'Product',
                'plural': 'Products',
                'sctype': 'container',
                'bctype': 'Product',
                'metrics': [62,72,82,132,142,182,192,202,242,252,262,272,282,292,302,312,322,332,342,352,362],
                'associatedRoles': ['salesManager', 'marketingManager'],
                'bcAttributes':[
                    {'role':'salesManager', 'properties':[{'name':'Business Objective', 'value':'Increase 20% revenue in this quater.'},{'name':'Business Strategy', 'value':'Use two recharge services'},{'name':'Comments', 'value':''}]},
                    {'role':'executive', 'properties':[{'name':'Business Objective', 'value':'Increase 20% revenue in this quater.'},{'name':'Business Strategy', 'value':'Use two recharge services'},{'name':'Comments', 'value':''}]}
                ],
                'relationships':{
                    'bcRelationships': [
                        {'type': 'association', 'ref': 'MerchandisingCampaign'},
                        {'type': 'association', 'ref': 'reports'},
                        {'type': 'association', 'ref': 'kpiReport'}
                    ]
                },
                'definition':{
                    '$schema': 'http://json-schema.org/draft-04/schema#',
                    'type': 'object',
                    'properties': {
                        'name': {
                            'type': 'string'
                        },
                        'description': {
                            'type': 'string'
                        },
                        'class': {
                            'type': 'string',
                            'default': 'Product'
                        }
                    },
                    'required': [
                        'name',
                        'class'
                    ]
                }
            };



            var defArgs, mainVM;


            beforeEach( function() {
                mainVM = getMockMainVM();
                defArgs = {
                    associatedBCDefinitions: sampleAssociatedBCDefinitions,
                    mainVM: mainVM,
                    currBCDef: bcDef,
                    permissions: {
                        behDefinePermission: ko.observable(true),
                        metricDefinePermission: ko.observable(true),
                        kpiDefinePermission: ko.observable(true),
                        segmentReportDefinePermission: ko.observable(true),
                        userProfileDefinePermission: ko.observable(true),
                        associatedBCDefinePermission: ko.observable(true),
                        associatedEntityDefinePermission: ko.observable(true),
                        tpDefinePermission: ko.observable(true),
                        mmDefinePermission: ko.observable(true)
                    }
                };
            });
            it('Functional Test-Should add BC Instances with other associated BCi, report intelligence and entity relationships', function(done) {


                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');

                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber', 'wholesaler'];
                vm.selectedAssociatedBCs([{type:'m1',id:'id','name':'name'}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, null, {});// true, false

                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.calledOnce).to.be.true;
                expect(stub5.called).to.be.false;
                done();
            });
            it('Functional Test- Not add BC Instances due to error creating BCi', function(done) {

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.selectedMetrics = [1,2];

                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber', 'wholesaler'];
                vm.selectedAssociatedBCs([{type:'m1',id:'id','name':'test'}]);

                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance').yields(new Error('error'));
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, null, {});// true, false
                var data = {name: 'selectedProduct', type: 'Product', id:'selectedProduct_id'};

                vm.addBCInstance(data);
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.false;
                expect(stub4.calledOnce).to.be.false;
                expect(stub5.called).to.be.false;
                done();
            });
            it('Structural Test- Not add BC Instance due to error adding entity relationships', function(done) {

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.selectedMetrics = [1,2];
                vm.selectedUserProfile = {};
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber', 'wholesaler'];
                vm.selectedAssociatedBCs([{type:'m1',id:'id','name':'name'}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi').yields(new Error('booo'));
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, null, {});// true, false
                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.calledOnce).to.be.true;
                expect(stub5.called).to.be.false;
                done();
            });
            //TODO: redo intel and reports
            it.skip('successfully add with SegmentReports', function(done) {
                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);

                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber'];
                vm.selectedAssociatedBCs([{type:'m1',id:'id','name':'test'}]);
                vm.selectedSegmentReport= {name: 'segment report'};

                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, null, {});// true, false

                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.calledOnce).to.be.true;
                expect(stub5.calledOnce).to.be.true;
                done();
            });

            it.skip('error adding segmentReports', function(done) {
                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);

                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber'];
                vm.selectedAssociatedBCs([{type:'m1',id:'id','name':'test'}]);
                vm.selectedSegmentReport= {name: 'segment report'};

                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create').yields('err');

                sandbox.spy(console,'warn');

                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.calledOnce).to.be.true;
                expect(stub5.calledOnce).to.be.true;
                console.warn.should.have.been.calledWith('failed to create report intelligence');
                done();
            });
            it('Structural Test- Not add BC Instances with other associated BCi, report intelligence and entity relationships', function(done) {
                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);

                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.selectedMetrics = [1,2];
                vm.selectedUserProfile = {};
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber', 'wholesaler'];
                vm.selectedAssociatedBCs([{type:'m1',id:'selectedProduct_id','name':'selectedProduct'}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, true, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, null, {});// true, false
                var data = {name: 'selectedProduct', type: 'Product', id:'selectedProduct_id'};
                vm.addBCInstance(data);
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.false;
                expect(stub4.calledOnce).to.be.false;
                expect(stub5.called).to.be.false;
                done();
            });
            it('Structural Test- Error retrieving BCInstance', function(done) {
                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);

                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.selectedMetrics = [1,2];
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber', 'wholesaler'];
                vm.selectedAssociatedBCs([{type:'m1',id:'id','name':'test'}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, new Error('err'));
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, null, {});// true, false

                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.calledOnce).to.be.true;
                expect(stub5.called).to.be.false;
                done();
            });

            it('createTouchpoints', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                mainVM.currBCDef = ko.observable(bcDef);

                vm.currBCType = 'merchandisingCampaign';
                vm.currBCDef = ko.observable(bcDef);
                vm.bcName('test BCi');
                vm.selectedWidgetReport = {};
                vm.selectedSubWidgetReport = {};
                vm.selectedRoles = ['subscriber', 'wholesaler'];
                vm.selectedAssociatedBCs([{type:'m1',id:'id','name':'test'}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCRelationshipsToBCi');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub( dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, null, {});// true, false
                vm.tpsFromBCDef([{type:'ucc', tpInfo:'subscriber'},{type:'facebook', tpInfo:'https://www.facebook.com/groups/203146426721234/'}]);
                mainVM.tpList = [{tpName: 'subscriber', tpId: 'test tp'}];
                mainVM.touchpointTypes({'facebook': {'channelTypeId': '123'}});
                sandbox.stub(dexit.app.ice.edu.integration.fbgroup,'createGroup').yields(null,{'result':'tpId'});
                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.calledOnce).to.be.true;
                expect(stub5.called).to.be.false;
                done();
            });


            it('Valid selectedMetrics', function(done) {


                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');

                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});

                //stub out call to here
                //TODO: revise sandbox.stub(vm,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });
            it('NULL selectedMetrics', function(done) {

                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=null;
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});

                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });
            it('NULL selectedBehaviours', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');

                vm.selectedBehaviours(null);
                vm.selectedMetrics=['TEST1','TEST2'];
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});


                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.false;

                done();
            });
            it('Valid bcName and no selected associated BC', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');
                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});
                var stub5=sandbox.stub(dexit.app.ice.integration.bcp,'addBCRelationshipsToBCi');
                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                expect(stub5.called).to.be.false;
                done();
            });
            it('With NULL or empty bcName, should not try to create', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('');

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});
                var stub5=sandbox.stub(dexit.app.ice.integration.bcp,'addBCRelationshipsToBCi');
                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.false;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.false;
                expect(stub4.called).to.be.false;
                expect(stub5.called).to.be.false;
                done();
            });
            it('bcName is duplicated', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test1');

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);


                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});

                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.flase;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.false;
                expect(stub4.called).to.be.false;
                done();
            });
            it('bcName is not duplicated', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test2');
                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);
                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});

                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });
            it('addBCInstance with error creating BCBehaviour', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test2');

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, new Error('error'));

                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');

                //no error handling so only see warning
                sandbox.spy(console,'warn');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                console.warn.should.have.been.calledWith('failed to add behaviour!');
                done();
            });
            it('valid selectedBRs', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test2');

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {},id:'1234'}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                vm.selectedBRs([{behRef: '1234', display:{icon_text: 'icon'}}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {id: 'test beh id'});
                //var stub5=sandbox.stub(dexit.app.ice.edu.bcAuthoring,'BCAuthoringVM');
                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');

                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;

                done();
            });
            it('valid selectedBRs-create BR returns error', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test2');

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);


                vm.selectedBehaviours([]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                vm.selectedBRs([{behRef: '1234', display:{icon_text: 'icon'}}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, true, null);
                //var stub5=sandbox.stub(dexit.app.ice.edu.bcAuthoring,'BCAuthoringVM');
                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');

                sandbox.spy(console,'warn');

                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                console.warn.should.have.been.calledWith('failed to add br!');
                done();
            });
            it('NULL selectedBRs', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test2');

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);


                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {},id:'1234'}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                vm.selectedBRs(null);

                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});

                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });
            it('Valid selectedRoles', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');


                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];

                mainVM.selectedRoles=['subscriber','retailer'];
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});
                var stub5 = sandbox.stub(dexit.app.ice.integration.scm.intelligence.report, 'create');
                stub5.callsArgWith(3, true, null);

                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');

                //self.selectedSegmentReport && self.selectedRoles && self.selectedRoles.length
                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });
            it('Valid selectedSegmentReport', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                mainVM.selectedSegmentReport=['1','2'];
                mainVM.selectedRoles=['1','2'];
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});

                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');

                //self.selectedSegmentReport && self.selectedRoles && self.selectedRoles.length
                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.true;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });
            it('Valid selectedProduct', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedSegmentReport=['1','2'];
                vm.selectedRoles=['1','2'];
                vm.selectedAssociatedBCs([{type:'m1',id:'selectedProduct_id','name':'selectedProduct'}]);
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});
                var stub5=sandbox.stub(dexit.app.ice.integration.bcp,'addBCRelationshipsToBCi');
                //stub out call to heres
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');

                //self.selectedSegmentReport && self.selectedRoles && self.selectedRoles.length
                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });

            //redo roles
            it.skip('Valid listOfRoles', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test BCi');

                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {}}},{ds:{name:'test2', uiElements: {}}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedSegmentReport=['1','2'];
                vm.selectedRoles=['1','2'];
                vm.selectedProduct=['1','2'];
                vm.selectedSubWidgetReport=['1','2'];
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                stub4.callsArgWith(1, null, {});
                var stub5=sandbox.stub(dexit.app.ice.integration.bcp,'addBCRelationshipsToBCi');
                var stub6=sandbox.stub(vm,'_getAssociatedRolesByBCDef');
                stub6.onCall(0).returns([{role:'1'},{role:'2'}]);
                stub6.onCall(1).returns([{role:'1'},{role:'2'}]);
                stub6.onCall(2).returns([{role:'1'},{role:'2'}]);
                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });
            it('valid selectedUserProfile', function(done) {
                var vm = new dexit.app.ice.BCCreationVM(defArgs);
                sandbox.stub(vm,'hideCreate');
                vm.currBCType = 'merchandisingCampaign';
                vm.bcName('test2');

                mainVM.listOfBcInstances=ko.observableArray([{courseVM:{businessConceptInstance:{property:{name:'test1'}}}}]);


                vm.selectedBehaviours([{ds:{name:'test1', uiElements: {},id:'1234'}}]);
                vm.selectedMetrics=['TEST1','TEST2'];
                vm.selectedWidgetReport={};
                vm.selectedBRs([{behRef: '1234'},{behRef: '12345'}]);
                vm.selectedUserProfile={};
                var stub1 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCInstance');
                stub1.callsArgWith(1, null, [{id: 'test_BCid'}]);
                var stub2 = sandbox.stub(dexit.app.ice.integration.bcp, 'retrieveBCInstance');
                stub2.callsArgWith(1, null, {property: {date: 'testdate'}});
                var stub3 = sandbox.stub(dexit.app.ice.integration.bcp, 'addBCiEntityRelationship');
                stub3.callsArgWith(1, null, {});
                var stub4 = sandbox.stub(dexit.app.ice.integration.bcp, 'createBCBehaviour');
                //stub4.callsArgWith(1, null, {});
                //var stub5=sandbox.stub(dexit.app.ice.edu.bcAuthoring,'BCAuthoringVM');
                //stub out call to here
                //TODO: revise sandbox.stub(mainVM,'setAssociatedBehaviours');


                vm.addBCInstance();
                expect(stub1.calledOnce).to.be.true;
                expect(stub2.calledOnce).to.be.false;
                expect(stub3.calledOnce).to.be.true;
                expect(stub4.called).to.be.true;
                done();
            });

        });


    });


})();
