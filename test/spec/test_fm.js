/**
 * Copyright Digital Engagement Xperience 2015-2016
 * @description tests for fileManagerVM
 */

/*global _, ko */

(function () {
    'use strict';

    //window.alert = function(){};
    var should = chai.should();
    //var assert = chai.assert;
    var expect = chai.expect;


    var ice4mBCs = '[{"name": "Merchandising", "bctype":["MerchandisingCampaign"]}]';

    describe("filemanagement", function() {
        var theArgs, sandbox;
        beforeEach( function() {
            sandbox = sinon.sandbox.create();
            theArgs ={
                fileName:ko.observable(),
                engagementBuilderVM: {
                    fileName: ko.observable()
                },
                showBCInstancePage: ko.observable(),
                selectedCourse: ko.observable()
            };
        });
        afterEach(function () {
            sandbox.restore();
        });

        function getBCiVM() {
            var bciVM = new dexit.test.Course();
            bciVM.businessConceptInstance = bciVM.container;
            return bciVM;
        }

        describe('delete file', function () {
            it('should successfully delete MM files', function(done) {
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                var testFiles = {key: "testing.pdf", url: "http://test.com"};
                //var testCourse = {code: "SE7873", name: "Test Management", files: []};
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "deleteFile").yields();
                fmVM.deleteMM(testFiles);
                stub1.should.have.been.calledOnce;
                stub1.should.have.been.calledWith(testFiles.key);
                done();
            });

            it('should log an error if file management fails', function(done) {
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                var testFiles = {key: "testing.pdf", url: "http://test.com"};
                //var testCourse = {code: "SE7873", name: "Test Management", files: []};
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "deleteFile").yields(new Error('uh oh'));
                var spy = sandbox.spy(console,'log');
                fmVM.deleteMM(testFiles);
                stub1.should.have.been.calledOnce;
                stub1.should.have.been.calledWith(testFiles.key);
                spy.should.have.been.calledWith("File could not be deleted");
                done();
            });

        });




        describe('upload file', function () {
            it('should be successful to upload a file in BCInstancePage view', function(done) {
                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);

                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theArgs.selectedCourse().courseVM, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile('test-input');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.true;
                done();
            });

            it('should be failed to upload a file in BCInstancePage view', function(done) {
                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);

                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theArgs.selectedCourse().courseVM, "reloadMultimediaForBC");
                stub1.callsArgWith(3, true, null);
                fmVM.uploadFile('test-input');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.false;
                done();
            });

            it('should be successful to upload a file in engagement builder view', function(done) {
                theArgs.fileName();
                theArgs.engagementBuilderVM.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);

                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theCourse, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile('test-input');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.true;
                done();
            });

            it('should be not try to upload a file if showBCInstancePage is false', function(done) {
                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(false);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);

                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                fmVM.uploadFile('test-input');
                expect(stub1.called).to.be.false;
                done();
            });

        });

        // done by KB oct 11
        // unit test for uploadfile function

        describe('upload file unit test', function () {
            //Functional tests
            it('valid uploadTagId', function(done) {
                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theArgs.selectedCourse().courseVM, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile('test-input');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.true;
                done();
            });
            it('invalid uploadTagId =null', function(done) {
                theArgs.fileName('testFile');
                theArgs.engagementBuilderVM.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theCourse, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile(null);
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.true;
                done();
            });
            it("invalid uploadTagId =''", function(done) {
                theArgs.fileName('testFile');
                theArgs.engagementBuilderVM.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);

                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theCourse, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile('');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.true;
                done();
            });
            // Structural tests
            it('filemanagement function return error', function(done) {
                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theArgs.selectedCourse().courseVM, "reloadMultimediaForBC");
                stub1.callsArgWith(3, true, null);
                fmVM.uploadFile('test-input');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.false;
                done();
            });
            it("invalid fileName =null", function(done) {
                theArgs.fileName(null);
                theArgs.engagementBuilderVM.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theCourse, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile('test-input');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.true;
                done();
            });
            it('showBCInstancePage is false', function(done) {
                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(false);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                fmVM.uploadFile('test-input');
                expect(stub1.called).to.be.false;
                done();
            });
            it('allowedFile= true', function(done) {
                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                fmVM.allowedFile(true);
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theArgs.selectedCourse().courseVM, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile('test-input');
                fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                expect(spy1.called).to.be.true;
                done();
            });
            it('allowedFile= false', function(done) {
                $('body').append(" <div class=\'flex-media-container flex-links-container hidden\'>"+
                    "<h6 class=\"drag-header hidden flex-links-header\">"+
                    "Add a Document"+
                "</h6>"+
                "<ul class=\"pull-right list-inline flex-select-media select-media-type hidden\">"+
                    "<li title=\"Upload document\" class=\"add-more-media links-add-button\">"+
                    "<form class=\"flex-form\">"+
                    "<input id='test-input' name=\'upload\' type=\"file\" class=\"hidden\" data-bind=\"attr:{\'id\': \'ep_1_link\', \'accept\': $root.bcAuthVM.fileTypeRestrictions().validDocumentTypes }, filesUpload: {property: \'fileName\'}\">"+
                    "<label for=\'ep_1_link\'>"+
                    "<i class=\"fa fa-cloud-upload documents-upload flex-upload\"></i>"+
                    "</label>"+
                    "</form>"+
                    "</li>"+
                    "</ul>"+
                    "</div>");

                theArgs.fileName('testFile');
                theArgs.showBCInstancePage(true);
                var theCourse = getBCiVM();
                theArgs.selectedCourse({courseVM: theCourse});
                var fmVM = new dexit.app.ice.edu.FileManagerVM(theArgs);
                fmVM.uploadedMediaFileTypes="test.txt";
                fmVM.allowedFile(false);
                var uploadTargetElement  = $('#' + 'test-input');
                var stub1 = sandbox.stub(dexit.app.ice.integration.filemanagement, "file");
                var spy1 = sandbox.spy(theArgs.selectedCourse().courseVM, "reloadMultimediaForBC");
                stub1.callsArgWith(3, null, true);
                fmVM.uploadFile('test-input');
                //fmVM.fileTags().should.include('bci:'+theArgs.selectedCourse().courseVM.businessConceptInstance.id);
                //expect(spy1.called).to.be.true;
                done();
            });



        });


    });

})();
