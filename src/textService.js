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
    this.on('onLangProfileActivated', (msg) => {
      console.log('onLangProfileActivated');
      if (this.setting['guid'] === msg['guid']) {
        this.open = true;
      } else {
        this.open = false;
      }
      this.emit('end', msg);
    });
  }

  registerLangProfileDeactivated() {
    this.on('onLangProfileDeactivated', (msg) => {
      console.log('onLangProfileDeactivated');
      this.emit('end', msg);
    });
  }

  registerDeactivate() {
    this.on('onDeactivate', (msg) => {
      this.emit('end', msg, true);
    });
  }

  registerKeyEvent(method) {
    KeyEvent.forEach((method) => {
      // Emit end event after all incoming event
      this.on(method, (msg) => {
        console.log(`TextService ${method}`);
        this.emit('end', msg);
      });
    });
  }

  registerEndEvent() {
    // Listen the end of event for setting response
    this.on('end', (msg, close) => {
      console.log('TextService end ' + close);

      if (close) {
        this.close();
        return;
      }

      if (!this.handle) {
        console.log(`Message: ${JSON.stringify(msg)}`);

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
        this.emit(method, msg);
        break;

      default:
        // If guid is not match, then just return fail and ignore key event.
        if (!this.open) {
          this.writeFail(msg['seqNum']);
        } else {
          this.emit(method, msg);
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
