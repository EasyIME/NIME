"use strict";

let EventEmitter = require('events');

class TextService extends EventEmitter {
  constructor(socket, guid) {
    super()
    this.socket = socket;
    this.guid = guid;
    this.state = {};
    this.handle = false; // Check already write response or not
  }

  handleRequest(msg) {
    this.handle = false;

    // console.log(msg);

    let method = msg['method'];

    // Emit end event after all incoming event
    this.once(method, (newMsg, oldState) => {
      console.log(`TextService ${method}`);
      this.emit('end', newMsg, oldState);
    });

    // Listen the end of event for setting response
    this.once('end', (newMsg, oldState) => {
      console.log('TextService end');
      if (!this.handle) {
        console.log(`Message: ${JSON.stringify(newMsg)}`);
        console.log(`State: ${JSON.stringify(oldState)}`);

        // Dummy response
        let response = {
          'success': true,
          'seqNum': newMsg['seqNum']
        };

        this.write(response);
      }
    })

    this.emit(method, msg, this.state);
  }

  write(response) {
    if (!this.handle) {
      this.handle = true;
      this.socket.write(response);
    }
  }
}

module.exports = {
  createTextService(socket) {
    return new TextService(socket);
  }
};
