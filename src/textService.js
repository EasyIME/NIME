'use strict';

let EventEmitter = require('events');
let fs = require('fs');
let path = require('path');

let CONFIG_PATH = path.join(process.cwd(), 'ime.json');


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

  registerLangProfileActivated() {
    this.once('onLangProfileActivated', (msg, setting, state) => {
      console.log('onLangProfileActivated');
      if (setting['guid'] === msg['guid']) {
        this.open = true;
      }
      this.emit('end', msg, setting, state);
    });
  }

  registerLangProfileDeactivated() {
    this.once('onLangProfileDeactivated', (msg, setting, state) => {
      console.log('onLangProfileDeactivated');
      if (setting['guid'] === msg['guid']) {
        this.open = false;
      }
      this.emit('end', msg, setting, state);
    });
  }

  registerDeactivate() {
    this.once('onDeactivate', (msg, setting, state) => {
      this.emit('end', msg, setting, state, true);
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

      case 'onDeactivate':
        this.registerDeactivate();
        break;

      case 'onLangProfileActivated':
        this.registerLangProfileActivated();
        break;

      case 'onLangProfileDeactivated':
        this.registerLangProfileDeactivated();
        break;

      case 'onActivate':
      default:
        // If guid is not match, then just return fail and ignore key event.
        if (!this.open) {
          this.writeFail(msg['seqNum']);
          return;
        }
        this.registerKeyEvent(method);
    }

    this.registerEndEvent();

    this.emit(method, msg, this.setting, this.state);
  }

  registerKeyEvent(method) {
    // Emit end event after all incoming event
    this.once(method, (msg, setting, state) => {
      console.log(`TextService ${method}`);
      this.emit('end', msg, setting, state);
    });
  }

  registerEndEvent() {
    // Listen the end of event for setting response
    this.once('end', (msg, setting, state, close) => {
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

  writeSuccess(seqNum, response) {
    if (!response) {
      response = {};
    }
    response['response'] = true;
    response['seqNum'] = seqNum;
    this.write(response);
  }

  writeFail(seqNum, response) {
    if (!response) {
      response = {};
    }
    response['response'] = false;
    response['seqNum'] = seqNum;
    this.write(response);
  }

  write(response) {
    if (!this.handle) {
      this.handle = true;
      this.socket.write(response);
    }
    this.removeAllListeners();
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
