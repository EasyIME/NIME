'use strict';

let EventEmitter = require('events');
let fs = require('fs');
let path = require('path');

let CONFIG_PATH = path.join(process.cwd(), 'ime.json');

let KeyEvent = [
  'filterKeyDown',
  'filterKeyUp',
  'onKeyDown',
  'onKeyUp',
  'onPreservedKey',
  'onCommand',
  'onCompartmentChanged',
  'onKeyboardStatusChanged',
  'onCompositionTerminated'
];


class TextService extends EventEmitter {

  constructor(socket) {
    super()
    this.socket = socket;
    this.state = {};
    this.env = {};
    this.setting = {};
    this.handle = false; // Check already write response or not
    this.open = true;  // Check Service get started
  }

  init(msg) {
    let data = fs.readFileSync(CONFIG_PATH, 'utf8');
    this.setting = JSON.parse(data);

    // Store OS env
    this.env['isWindows8Above'] = msg['isWindows8Above'];
    this.env['isMetroApp'] = msg['isMetroApp'];
    this.env['isUiLess'] = msg['isUiLess'];
    this.env['isConsole'] = msg['isConsole'];
  }

  onActivate() {
    // initialize process
    this.registerLangProfileActivated();
    this.registerLangProfileDeactivated();
    this.registerDeactivate();

    // key event
    this.registerKeyEvent();
    this.registerEndEvent();
  }

  registerLangProfileActivated() {
    this.on('onLangProfileActivated', (msg, setting, state) => {
      console.log('onLangProfileActivated');
      if (setting['guid'] === msg['guid']) {
        this.open = true;
      } else {
        this.open = false;
      }
      this.emit('end', msg, setting, state);
    });
  }

  registerLangProfileDeactivated() {
    this.on('onLangProfileDeactivated', (msg, setting, state) => {
      console.log('onLangProfileDeactivated');
      this.emit('end', msg, setting, state);
    });
  }

  registerDeactivate() {
    this.on('onDeactivate', (msg, setting, state) => {
      this.emit('end', msg, setting, state, true);
    });
  }

  registerKeyEvent(method) {
    KeyEvent.forEach((method) => {
      // Emit end event after all incoming event
      this.on(method, (msg, setting, state) => {
        console.log(`TextService ${method}`);
        this.emit('end', msg, setting, state);
      });
    });
  }

  registerEndEvent() {
    // Listen the end of event for setting response
    this.on('end', (msg, setting, state, close) => {
      console.log('TextService end ' + close);

      if (close) {
        this.close();
        return;
      }

      if (!this.handle) {
        console.log(`Message: ${JSON.stringify(msg)}`);
        console.log(`State: ${JSON.stringify(state)}`);

        this.writeSuccess(msg['seqNum']);
      }
    });
  }

  handleRequest(msg) {
    this.handle = false;
    // console.log(msg);

    let method = msg['method'];

    switch (method) {

      case 'init':
        this.init(msg);
        this.writeSuccess(msg['seqNum']);
        return;

      case 'onActivate':
        this.onActivate();
        this.writeSuccess(msg['seqNum']);
        return;

      case 'onDeactivate':
      case 'onLangProfileActivated':
      case 'onLangProfileDeactivated':
        this.emit(method, msg, this.setting, this.state);
        break;

      default:
        // If guid is not match, then just return fail and ignore key event.
        if (!this.open) {
          this.writeFail(msg['seqNum']);
        } else {
          this.emit(method, msg, this.setting, this.state);
        }
    }
  }

  writeSuccess(seqNum, response) {
    if (!response) {
      response = {};
    }
    response['success'] = true;
    response['seqNum'] = seqNum;
    this.write(response);
  }

  writeFail(seqNum, response) {
    if (!response) {
      response = {};
    }
    response['success'] = false;
    response['seqNum'] = seqNum;
    this.write(response);
  }

  write(response) {
    if (!this.handle) {
      this.handle = true;
      this.socket.write(response);
    }
  }

  close() {
    this.removeAllListeners();
    this.socket.close();
  }
}


module.exports = {
  createTextService(socket) {
    return new TextService(socket);
  }
};
