'use strict';

let EventEmitter = require('events');
let fs = require('fs');
let path = require('path');

let keyHandler = require('./keyHandler');
let LOG = require('./util/logger');

const CONFIG_PATH = path.join(process.cwd(), 'ime.json');

const NOREMAL_KEY_EVENT = [
  'filterKeyDown',
  'filterKeyUp',
  'onKeyDown',
  'onKeyUp'
];

const SPECIAL_KEY_EVENT = [
  'onPreservedKey',
  'onCommand',
  'onCompartmentChanged',
  'onKeyboardStatusChanged',
  'onCompositionTerminated'
]


class TextService extends EventEmitter {

  constructor(socket) {
    super()
    this.socket = socket;
    this.keyHandler = keyHandler.createKeyHandler();
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
      LOG.info('onLangProfileActivated');
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
      LOG.info('onLangProfileDeactivated');
      this.emit('end', msg);
    });
  }

  registerDeactivate() {
    this.on('onDeactivate', (msg) => {
      this.emit('end', msg, true);
    });
  }

  registerKeyEvent() {

    NOREMAL_KEY_EVENT.forEach((method) => {
      // Emit end event after all incoming event
      this.on(method, (msg, keyHandler) => {
        LOG.info(`TextService ${method}`);
        this.emit('end', msg);
      });
    });

    SPECIAL_KEY_EVENT.forEach((method) => {
      // Emit end event after all incoming event
      this.on(method, (msg) => {
        LOG.info(`TextService ${method}`);
        this.emit('end', msg);
      });
    });
  }

  registerEndEvent() {
    // Listen the end of event for setting response
    this.on('end', (msg, close) => {
      LOG.info('TextService end ' + close);

      if (close) {
        this.close();
        return;
      }

      if (!this.handle) {
        LOG.info(`Message: ${JSON.stringify(msg)}`);

        this.writeSuccess(msg['seqNum']);
      }
    });
  }

  handleRequest(msg) {
    this.handle = false;
    // LOG.info(msg);

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

          if (NOREMAL_KEY_EVENT.indexOf(method) >= 0) {
            this.keyHandler.setConfig(msg);
            this.emit(method, msg, this.keyHandler);

          } else if (SPECIAL_KEY_EVENT.indexOf(method) >= 0) {
            this.emit(method, msg);
          }
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
