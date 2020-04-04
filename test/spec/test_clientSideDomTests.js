/**
* Copyright Digital Engagement Xperiance
* Date: 6/01/16
* @author Trevor VR
* @description
*/

/*global _, ko */

(function(){
    'use strict';
    var should = chai.should();
    var expect = chai.expect;

    describe("create/edit lecture", function () {
        var theCourse, theArgs, mainVM;
        beforeEach( function() {
            theCourse = new dexit.test.Course();
            theArgs= {
                user: JSON.stringify({id:'123', tenant: 'dexit.co',name:'test@dexit.co',attributes: {firstName:'test',lastName:'user'}}),
                bucket:'newOne', currentRole: 'test', userRoles: 'professor', epTemplate: JSON.stringify(dexit.testEP)};
            mainVM = new dexit.app.ice.edu.Main(theArgs);
        });
        it.skip('no content title', function () {
            $('.content-title').val(null);
            mainVM.createOrEditLecture('create', {});
            $('.content-title').hasClass('warning-class').should.be.eql(true);
        });

    });
})();
