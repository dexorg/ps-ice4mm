/**
 * Copyright Digital Engagement Xperience 2017
 */



/* global chai, sinon, dexit */
(function () {
    'use strict';

    var should = chai.should();
    var expect = chai.expect;

    describe('paged-items-vm and PageItemVM', function () {

        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();

        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('loadItems', function () {
            it('should load with defaults', function () {
                var vm = new dexit.epm.epa.PagedItemVM();
                var params = {
                    items: ['a','b','c','d','e','f']
                };
                vm.loadItems(params);
                var items = vm.items();
                items.should.be.an('array').with.lengthOf(6);
                var pages = vm.pages();
                pages.should.be.an('array').with.lengthOf(1);
                pages[0].should.have.property('page',0);
                pages[0].should.have.property('currentPage');
                pages[0].should.have.property('chunks');
                pages[0].chunks().should.deep.equal([['a','b'],['c','d'],['e','f']]);
                pages[0].getPageClass().should.equal('active');

            });



            it('should load with pageSize 2 and chunk size 1', function () {
                var vm = new dexit.epm.epa.PagedItemVM();
                var params = {
                    items: ['a','b','c','d','e','f','g'],
                    pageSize:2,
                    chunkSize:1
                };
                vm.loadItems(params); //current page defaults to 0
                var items = vm.items();
                items.should.be.an('array').with.lengthOf(7);
                var pages = vm.pages();
                pages.should.be.an('array').with.lengthOf(4);
                
                pages[0].should.have.property('page',0);
                pages[0].should.have.property('currentPage');
                pages[0].should.have.property('chunks');
                pages[0].chunks().should.deep.equal([['a'],['b']]);
                pages[1].chunks().should.deep.equal([['c'],['d']]);
                pages[2].chunks().should.deep.equal([['e'],['f']]);
                pages[3].chunks().should.deep.equal([['g']]);


                pages[0].getPageClass().should.equal('active');
                pages[1].getPageClass().should.equal('');
                pages[2].getPageClass().should.equal('');
                pages[3].getPageClass().should.equal('');



            });

        });

    });
})();
