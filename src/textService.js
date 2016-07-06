'use strict';

let EventEmitter = require('events');
let fs           = require('fs');
let path         = require('path');

let keyHandler = require('./keyHandler');
let LOG        = require('./util/logger');

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

  constructor() {
    super()
    this.socket     = null;
    this.keyHandler = keyHandler.createKeyHandler();
    this.state      = {};
    this.env        = {};
    this.setting    = {};
    this.handle     = false; // Check already write response or not
    this.open       = false;  // Check Service get started
  }

  setSocket(socket) {
    this.socket = socket;
  }

  init(msg) {
    let data = fs.readFileSync(CONFIG_PATH, 'utf8');
    this.setting = JSON.parse(data);

    // Store OS env
    this.env['id']              = msg['id'];
    this.env['isWindows8Above'] = msg['isWindows8Above'];
    this.env['isMetroApp']      = msg['isMetroApp'];
    this.env['isUiLess']        = msg['isUiLess'];
    this.env['isConsole']       = msg['isConsole'];

    if (this.env['id'].toLowerCase() === this.setting['guid'].toLowerCase()) {
      this.open = true;
      this.writeSuccess(msg['seqNum']);
    } else {
      this.open = false;
      this.writeFail(msg['seqNum']);
    }
  }

  onActivate(msg) {
    if (this.open) {
      // initialize process
      this.registerDeactivate();

      // key event
      this.registerKeyEvent();
      this.registerEndEvent();

      this.writeSuccess(msg['seqNum']);
    } else {
      this.writeFail(msg['seqNum']);
    }
  }

  registerDeactivate() {
    this.on('onDeactivate', (msg) => {
      this.emit('end', msg, {}, true);
    });
  }

  registerKeyEvent() {

    NOREMAL_KEY_EVENT.forEach((method) => {
      // Emit end event after all incoming event
      this.on(method, (msg, keyHandler) => {
        LOG.info(`TextService ${method}`);

        let response = this[method](msg, keyHandler);

        this.emit('end', msg, response);
      });
    });

    SPECIAL_KEY_EVENT.forEach((method) => {
      // Emit end event after all incoming event
      this.on(method, (msg) => {
        LOG.info(`TextService ${method}`);

        let response = this[method](msg, keyHandler);

        this.emit('end', msg, response);
      });
    });
  }

  registerEndEvent() {
    // Listen the end of event for setting response
    this.on('end', (msg, response, close) => {
      LOG.info('TextService end ' + close);
      LOG.info('TextService response ' + response);

      if (close) {
        this.close();
        return;
      }

      if (!this.handle) {
        LOG.info(`Message: ${JSON.stringify(msg)}`);

        this.writeSuccess(msg['seqNum'], response);
      }
    });
  }

  handleRequest(msg) {
    this.handle = false;

    let method = msg['method'];

    switch (method) {

      case 'init':
        this.init(msg);
        return;

      case 'onActivate':
        this.onActivate(msg);
        return;

      case 'onDeactivate':
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
    response['seqNum']  = seqNum;
    this.write(response);
  }

  writeFail(seqNum, response) {
    if (!response) {
      response = {};
    }
    response['success'] = false;
    response['seqNum']  = seqNum;
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

  // Normal Key Event
  filterKeyDown(msg, keyHandler) {
    LOG.info('filterKeyDown')
    return {};
  }

  filterKeyUp(msg, keyHandler) {
    LOG.info('filterKeyUp')
    return {};
  }

  onKeyDown(msg, keyHandler) {
    LOG.info('onKeyDown')
    return {};
  }

  onKeyUp(msg, keyHandler) {
    LOG.info('onKeyUp')
    return {};
  }

  // Special Key Event
  onPreservedKey(msg, keyHandler) {
    LOG.info('onPreservedKey')
    return {};
  }

  onCommand(msg, keyHandler) {
    LOG.info('onCommand')
    return {};
  }

  onCompartmentChanged(msg, keyHandler) {
    LOG.info('onCompartmentChanged')
    return {};
  }

  onKeyboardStatusChanged(msg, keyHandler) {
    LOG.info('onKeyboardStatusChanged')
    return {};
  }

  onCompositionTerminated(msg, keyHandler) {
    LOG.info('onCompositionTerminated')
    return {};
  }
}


module.exports = {
  createTextService() {
    return new TextService();
  },
  TextService
};
