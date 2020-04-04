/**
 * Copyright Digital Engagement Xperience 2017
 */


/* global chai, sinon, dexit */
(function () {
    'use strict';

    var should = chai.should();
    var expect = chai.expect;

    describe('em-vm', function () {

        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();

        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('goToCreate', function () {
            it('should update state from list to create', function () {
                var vm = new dexit.app.ice.EngagementMetricVM();
                vm.mode().should.equal('list');
                vm.goToCreate();
                vm.mode().should.equal('create');
            });
        });

        // test cases for saveEM
        // created by KB NOV 1

        //FIXME: fix tests
        describe.skip('saveEM', function () {


            // it('showArrayFormulaArea returning NULL', function (done) {
            //     var vm = new dexit.app.ice.EngagementMetricVM();
            //     var vm1 = dexit.app.ice.integration.metrics;
            //     vm.showArrayFormulaArea= function(){return null;};
            //     var stub1=sandbox.stub(vm1,'createEM');
            //     vm.saveEM();
            //     stub1.should.not.called;
            //     done();
            // });

            // it('showArrayFormulaArea returning {}', function (done) {
            //     var vm = new dexit.app.ice.EngagementMetricVM();
            //     var vm1 = dexit.app.ice.integration.metrics;
            //     vm.showArrayFormulaArea= function(){return {};};
            //     var stub1=sandbox.stub(vm1,'createEM');
            //     vm.saveEM();
            //     stub1.should.called;
            //     done();
            // });

            // it('createEM returning error', function (done) {
            //     var vm = new dexit.app.ice.EngagementMetricVM();
            //     var vm1 = dexit.app.ice.integration.metrics;
            //     vm.selectedEpt= function(){return {};};
            //     var stub1=sandbox.stub(vm1,'createEM').yields('error',null);
            //     var stub2=sandbox.stub(vm,'goToList');
            //     vm.saveEM();
            //     stub1.should.called;
            //     stub2.should.called;
            //     done();
            // });
            //
            // it('createEM NOT returning error with null results', function (done) {
            //     var vm = new dexit.app.ice.EngagementMetricVM();
            //     var vm1 = dexit.app.ice.integration.metrics;
            //     vm.showArrayFormulaArea= function(){return {};};
            //     var stub1=sandbox.stub(vm1,'createEM').yields(null,null);
            //     var stub2=sandbox.stub(vm,'goToList');
            //     vm.saveEM();
            //     stub1.should.called;
            //     stub2.should.called;
            //     done();
            // });
            //
            // it('createEM NOT returning error with NOT null results', function (done) {
            //     var vm = new dexit.app.ice.EngagementMetricVM();
            //     var vm1 = dexit.app.ice.integration.metrics;
            //     vm.showArrayFormulaArea= function(){return {};};
            //     var results={test:'test'};
            //     var stub1=sandbox.stub(vm1,'createEM').yields(null,results);
            //     var stub2=sandbox.stub(vm,'goToList');
            //     vm.saveEM();
            //     stub1.should.called;
            //     stub2.should.called;
            //     done();
            // });
            //
            it('check the params', function (done) {

                var vm = new dexit.app.ice.EngagementMetricVM();


                vm.selectedMetricFormula({'name':'sum'});
                vm.metricFormulaParameters([{id:'1'}]);
                vm.metricFormula('sum(1)');
                vm.metricDescription('desc');
                vm.metricName('name');
                vm.metricValueType('integer');

                var vm1 = dexit.app.ice.integration.metrics;
                var params={
                    'metricName': 'name',
                    'metricType': 'integer',
                    'metricDesc': 'desc',
                    'metricDefinition': 'sum',
                    'metricDefinitionDetail': {
                        'retrieval': 'precomputed',
                        'options': {
                            'formula': 'sum(1)'
                        }

                    },
                    engagementPoint:['1']
                };
                vm.showArrayFormulaArea= function(){return 'string';};
                var stub1=sandbox.stub(vm1,'createEM');
                vm.saveEM();
                stub1.should.called;
                stub1.should.have.been.calledWith(params);
                done();
            });



        });

        describe('listEM', function () {

            it('listMetrics has undefined callback', function (done) {
                var vm1 = new dexit.app.ice.EngagementMetricVM();
                var vm2 = dexit.app.ice.integration.metrics;
                var stub1=sandbox.stub(vm2,'listMetrics');
                var stub2=sandbox.stub(vm1,'availableMetrics');
                vm1.listEM();
                stub1.should.called;
                stub2.should.not.called;
                done();
            });

            it('listMetrics has error callback', function (done) {
                var vm1 = new dexit.app.ice.EngagementMetricVM();
                var vm2 = dexit.app.ice.integration.metrics;
                var stub1=sandbox.stub(vm2,'listMetrics').yields({},null);
                var stub2=sandbox.stub(vm1,'availableMetrics');
                vm1.listEM();
                stub1.should.called;
                stub2.should.not.called;
                done();
            });
            it('listMetrics without  error callback', function (done) {
                var vm1 = new dexit.app.ice.EngagementMetricVM();
                var vm2 = dexit.app.ice.integration.metrics;
                var stub1=sandbox.stub(vm2,'listMetrics').yields(null,null);
                var stub2=sandbox.stub(vm1,'availableMetrics');
                vm1.listEM();
                stub1.should.called;
                stub2.should.called;
                done();
            });

            it('listMetrics check for results', function (done) {
                var vm1 = new dexit.app.ice.EngagementMetricVM();
                var vm2 = dexit.app.ice.integration.metrics;
                var results={test:'test'};
                var stub1=sandbox.stub(vm2,'listMetrics').yields(null,results);
                var stub2=sandbox.stub(vm1,'availableMetrics');
                vm1.listEM();
                stub1.should.called;
                stub2.should.called;
                stub2.args[0][0].should.be.eql(results);
                done();
            });

            it('listMetrics check for results=null', function (done) {
                var vm1 = new dexit.app.ice.EngagementMetricVM();
                var vm2 = dexit.app.ice.integration.metrics;
                var results=null;
                var stub1=sandbox.stub(vm2,'listMetrics').yields(null,results);
                var stub2=sandbox.stub(vm1,'availableMetrics');
                vm1.listEM();
                stub1.should.called;
                stub2.should.called;
                expect(stub2.args[0][0]).is.not.exist;
                done();
            });

        });

        describe('after dragging an ept into the formula parameters box',function () {

            it('should not pass validation if only 1', function () {

                var vm = new dexit.app.ice.EngagementMetricVM();
                vm.metricFormulaParameters([{id:'1'}]);
                vm.selectedMetricFormula({name:'sum'});

                sandbox.spy(vm,'metricFormula');
                vm.afterAddedEpt();
                vm.metricFormula.should.not.have.been.called;


            });

            it('should calculate formula if more than 1 param but not set output type if formula does not specify it', function () {

                var vm = new dexit.app.ice.EngagementMetricVM();
                vm.metricFormulaParameters([{id:'1'},{id:'2'}]);
                vm.selectedMetricFormula({name:'sum'});

                sandbox.spy(vm,'metricFormula');
                sandbox.spy(vm,'metricValueType');
                vm.afterAddedEpt();
                vm.metricFormula.should.have.been.called;
                vm.metricFormula.should.have.been.calledWith('sum([ept1,ept2])');
                vm.metricValueType.should.not.have.been.called;


            });

            it('should calculate formula if more than 1 param and set output type', function () {

                var vm = new dexit.app.ice.EngagementMetricVM();
                vm.metricFormulaParameters([{id:'1'},{id:'2'}]);
                vm.selectedMetricFormula({name:'sum', outputValueType:'integer'});

                sandbox.spy(vm,'metricFormula');
                sandbox.spy(vm,'metricValueType');
                vm.afterAddedEpt();
                vm.metricFormula.should.have.been.called;
                vm.metricFormula.should.have.been.calledWith('sum([ept1,ept2])');
                vm.metricValueType.should.have.been.called;
                vm.metricValueType.should.have.been.calledWith('integer');


            });

        });

    });
})();
