/**
 * Copyright Digital Engagement Xperience 2017
 * Created by shawn on 2017-04-10.
 */

/*global _, ko */

(function () {
    'use strict';


    var should = chai.should();

    var mockKoLib = {
        components:{
            isRegistered: function (name) {},
            register: function (name, component) {
            }
        }
    };

    describe('BCCPlayerVM', function () {
        it('should initialize with all parameters supplied', function () {
            var params = {
                previewMode:false,
                showPlayer:ko.observable(true),
                showControls:true,
                bccActive: ko.observable(true)
            };
            var vm = new dexit.app.ice.edu.components.BCCPlayerVM(params);
            should.exist(vm);
            vm.previewMode().should.equal(false);
            vm.showPlayer().should.equal(true);
            vm.showControls.should.equal(true);
            vm.bccActive().should.equal(true);

        });
    });

    describe('MerchChannelWidgetVM', function () {
        it('should initialize with all parameters supplied', function () {
            var params = {
                epId:'aaa',
                tp: {
                    url:'woo'
                },
                name:'foo',
                colour:'86F92B',
                icon:'icon'
            };
            var vm = new dexit.app.ice.edu.components.MerchChannelWidgetVM(params);
            should.exist(vm);
            vm.colour().should.equal('#86F92B');
            vm.name().should.equal('foo');
            vm.icon().should.equal('icon');
            //30% darker calculation done by tinycolour
            vm.border().should.equal('2px solid #3e8704');
            vm.enabled().should.be.true;

        });

        it('should initialize with image in parameters supplied', function () {
            var params = {
                epId:'aaa',
                tp: {
                    url:'woo'
                },
                name:'foo',
                colour:'86F92B',
                image:'image.svg'
            };
            var vm = new dexit.app.ice.edu.components.MerchChannelWidgetVM(params);
            should.exist(vm);
            vm.colour().should.equal('#86F92B');
            vm.name().should.equal('foo');
            vm.image().should.equal('images/image.svg');
            //30% darker calculation done by tinycolour
            vm.border().should.equal('2px solid #3e8704');
            vm.enabled().should.be.true;

        });

        it('should disable click if parameters epId and tp are both not specified', function () {
            var params = {
                epId:'aaa',
                name:'foo',
                colour:'86F92B',
                icon:'icon'
            };
            var vm = new dexit.app.ice.edu.components.MerchChannelWidgetVM(params);
            should.exist(vm);
            vm.colour().should.equal('#86F92B');
            vm.name().should.equal('foo');
            vm.icon().should.equal('icon');
            //30% darker calculation done by tinycolour
            vm.border().should.equal('2px solid #3e8704');
            vm.enabled().should.be.false;
        });
        it('should initialize with defaults parameters for colour, icon, and name', function () {
            var params = {
                epId:'aaa',
                tp: {
                    url:'woo'
                }
            };
            var vm = new dexit.app.ice.edu.components.MerchChannelWidgetVM(params);
            should.exist(vm);
            vm.colour().should.equal('#85bb65');
            vm.name().should.equal('Product');
            vm.icon().should.equal('fa fa-usd');
            //30% darker calculation done by tinycolour
            vm.border().should.equal('2px solid #3d5e29');
            vm.enabled().should.be.true;
        })
    });

    describe('register ko components', function () {
        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });
        afterEach(function () {
            sandbox.restore();
        });


        it('should successfully register merch-channel-widget and bcc-player if they are not already registered', function () {

            sandbox.stub(mockKoLib.components,'isRegistered').returns(false);
            sandbox.stub(mockKoLib.components,'register').returns(true);

            dexit.app.ice.edu.components.register(mockKoLib);

            mockKoLib.components.isRegistered.should.have.been.calledThrice;
            mockKoLib.components.register.should.have.been.calledThrice;

            mockKoLib.components.isRegistered.getCall(0).should.have.been.calledWith('merch-channel-widget');
            mockKoLib.components.isRegistered.getCall(1).should.have.been.calledWith('bcc-player');
            mockKoLib.components.isRegistered.getCall(2).should.have.been.calledWith('color-picker');

            mockKoLib.components.register.getCall(0).should.have.been.calledWith('merch-channel-widget',
                sinon.match({viewModel: sinon.match.func, template: sinon.match({element: 'merch-channel-widget-template'})}));
            mockKoLib.components.register.getCall(1).should.have.been.calledWith('bcc-player',
                sinon.match({viewModel: sinon.match.func, template: sinon.match({element: 'bcc-player-template'})}));


        });


        it('should not try to register merch-channel-widget and bcc-player if they are already registered', function () {

            sandbox.stub(mockKoLib.components,'isRegistered').returns(true);
            sandbox.spy(mockKoLib.components,'register');

            dexit.app.ice.edu.components.register(mockKoLib);

            mockKoLib.components.isRegistered.should.have.been.calledThrice;
            mockKoLib.components.register.should.not.have.been.called;

            mockKoLib.components.isRegistered.getCall(0).should.have.been.calledWith('merch-channel-widget');
            mockKoLib.components.isRegistered.getCall(1).should.have.been.calledWith('bcc-player');



        });

    });



})();
