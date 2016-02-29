'use strict';

let textService = require('../src/textService');
let sinon       = require('sinon');

describe('Text Service', function () {

  describe('#registerKeyEvent', () => {

    let service;
    let writeStub;
    let onSpy;

    before(function () {
      service = textService.createTextService();
      onSpy   = sinon.spy(service, 'on');
    })

    it('should register key event', () => {

      service.registerKeyEvent();

      assert.equal('filterKeyDown'          , onSpy.getCall(0).args[0]);
      assert.equal('filterKeyUp'            , onSpy.getCall(1).args[0]);
      assert.equal('onKeyDown'              , onSpy.getCall(2).args[0]);
      assert.equal('onKeyUp'                , onSpy.getCall(3).args[0]);
      assert.equal('onPreservedKey'         , onSpy.getCall(4).args[0]);
      assert.equal('onCommand'              , onSpy.getCall(5).args[0]);
      assert.equal('onCompartmentChanged'   , onSpy.getCall(6).args[0]);
      assert.equal('onKeyboardStatusChanged', onSpy.getCall(7).args[0]);
      assert.equal('onCompositionTerminated', onSpy.getCall(8).args[0]);

    });
  });

});
