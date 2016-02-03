"use strict";

let EventEmitter = require('events');
let pipe = require('../lib/pipe');
let textService = require('./textService');

const SUCCESS = 0;
const ERROR_MORE_DATA = 234;
const ERROR_IO_PENDING = 997;


class NIMESocket extends EventEmitter {
  constructor(ref, server) {
    super();
    this.ref = ref;
    this.data = "";
    this.msg = {};
    this.server = server;
    this.service = textService.createTextService(this);
  }

  read() {
    console.log('Wait data');
    pipe.read(this.ref, (err, data) => {

      switch (err) {

        case SUCCESS:
          this.data += data;
          this.msg = JSON.parse(this.data);
          this.data = "";

          this.emit('data', this.msg);
          this.service.handleRequest(this.msg);
          this.read();
          break;

        case ERROR_MORE_DATA:
          this.data += data;
          this.read();
          break;

        case ERROR_IO_PENDING:
          this.read();
          break;

        default:
          console.log('Socket broken');
          this.close();
      }
    });
  }

  write(response) {
    console.log(`Write Data: ${response}`);
    pipe.write(this.ref, response, (err, len) => {
      this.emit('drain', len);
    });
  }

  close() {
    pipe.close(this.ref, (err) => {
      this.emit('end', err);

      this.server.deleteConnection(this);
    });
  }
}


module.exports = {
  createSocket(ref, server) {
    return new NIMESocket(ref, server);
  }
};
