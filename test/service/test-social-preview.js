/**
 * Copyright Digital Engagement Xperience 2019
 * @description file to test social preview
 */
//test helper methods
var chai = require('chai');
var should = require('chai').should();
// var ToTest = require('../../libs/social-preview/social-preview');
var sinon = require('sinon');
chai.use(require('sinon-chai'));


describe('Social Preview renderer', function () {
    var sandbox;
    var mocks = {

    };

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });


});
