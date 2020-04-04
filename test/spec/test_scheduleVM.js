/**
 * Copyright Digital Engagement Xperience
 * Date: 13/01/15
 * @author Xinyu Yun
 * @description to cover the scheduleVM's functions
 */

/*global _, ko */

(function () {

    var should = chai.should();
    var expect = chai.expect;
    describe('Test scheduleVM Functions', function() {
        var theVM;
        var sandbox;

        beforeEach(function() {
            //initial sandbox and Args
            sandbox = sinon.sandbox.create();
            var theArgs= {repo: 'dev', userId: '122', bucket:'newOne', currentRole: 'test', userRoles: 'professor', epTemplate: JSON.stringify(dexit.testEP)};
            theVM = new dexit.app.ice.edu.ScheduleVM(theArgs);
        });
        afterEach(function () {
            sandbox.restore();
        });
        it('test initial datetime',function(){
            //initial startdatetime() and now() would be moment(); enddatetime() and never() would be after 50 years
            theVM.init();
            theVM.scheduleSDT().should.eql(theVM.now());
            theVM.scheduleEDT().should.eql('');

        });
        it('change start time',function(){
            theVM.init();
            //Before calling the changeSDT() the scheduleSDT should equal the initial startdatetime(),now()
            theVM.scheduleSDT().should.eql(theVM.startdatetime().format());
            theVM.scheduleSDT().should.eql(theVM.now());
            //Now set startdatetime to be a new datetime
            theVM.startdatetime(moment().add(2,'days'));
            //after executing the changeSDT(), the sceduleSDT() should equal the new datetime
            theVM.changeSDT();
            theVM.scheduleSDT().should.eql(theVM.startdatetime());

        });
        it('change end time',function(){
            theVM.init();
            //Before calling the changeEDT() the scheduleEDT should ''
            theVM.scheduleEDT().should.eql('');
            //Now set enddatetime to be a new datetime
            theVM.enddatetime(moment().add(30,'days'));
            //after executing the changeEDT(), the scedulEDT() should equal the new enddatetime
            theVM.changeEDT();
            theVM.scheduleEDT().should.eql(theVM.enddatetime());

        });
    });
})();
