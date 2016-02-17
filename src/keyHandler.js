'use strict';

let KEYMAP = require('./keyMap');

class KeyHandler {

  constructor(msg) {
    if (msg) {
      this.setConfig(msg);
    }
  }

  setConfig(msg) {
    this.charCode    = msg['charCode'];
    this.keyCode     = msg['keyCode'];
    this.repeatCount = msg['repeatCount'];
    this.scanCode    = msg['scanCode'];
    this.isExtended  = msg['isExtended'];
    this.keyStates   = msg['keyStates'];
  }

  isKeyDown(code) {
    return this.keyStates ? (this.keyStates[code] & 0x80) !== 0 : false;
  }

  isKeyToggled(code) {
    return this.keyStates ? (this.keyStates[code] & 1) !== 0 : false;
  }

  isChar() {
    return this.charCode ? (this.charCode !== 0) : false;
  }
}

module.exports = {
  createKeyHandler(msg) {
    return new KeyHandler(msg);
  }
};
