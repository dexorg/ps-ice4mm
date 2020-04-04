/**
 * Copyright Digital Engagement Xperience 2017
 */

/*global chai, sinon, ko, dexit */

(function () {
    'use strict';

    var should = chai.should();

    describe('bc-creation-step-vm', function () {

        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('constructor', function() {
            it('should initialize with subTitle and stepNumber specified', function(){

                var args = {
                    currentStepNumber: ko.observable(5),
                    stepNumber: 4,
                    subTitle :'sub',
                    showListView: true,
                    template: 'dummy1',
                    completed:true,
                    allowSkip:true

                };


                var stepVM = new dexit.app.ice.BCCreationStepVM(args);
                should.exist(stepVM);

                stepVM.stepNumber().should.equal(4);
                stepVM.subTitle().should.equal('4.1 sub');
                stepVM.currentStepNumber().should.equal(5);
                stepVM.completed().should.equal(true);
                stepVM.allowSkip().should.equal(true);


            });

        });
    });

})();
