"use strict";

let pipe = require('../lib/pipe');
let EventEmitter = require('events');

const SUCCESS = 0;
const ERROR_MORE_DATA = 234;
const ERROR_IO_PENDING = 997;


class NIMESocket extends EventEmitter {
  constructor(ref, server) {
    super();
    this.ref = ref;
    // this.server = server;
    this.data = "";
    this.msg = {};
    this.server = server;
  }

  read() {
    console.log('Wait data');
    pipe.read(this.ref, (err, data) => {

      switch (err) {

        case SUCCESS:
          this.data += data;
          this.msg = JSON.parse(this.data);
          this.emit('data', err, this.msg);
          // this.read();

          // For testing  prevent block;
          this.close();
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

  write() {

  }

  close() {
    pipe.close(this.ref, (err) => {
      this.emit('close', err);

      this.server.deleteConnection(this);
    })
  }
}


class NIMEServer extends EventEmitter {
  constructor() {
    super();
    this.connections = [];
  }

  addConnection(socket) {
    this.connections.push(socket);
  }

  deleteConnection(socket) {
    this.connections = this.connections.filter(s => s !== socket);
  }

  listen() {
    console.log('Wait connection');

    pipe.connect((err, ref) => {
      console.log('Connected');

      // Each connection create a socket to handle.
      let socket = new NIMESocket(ref, this);

      this.addConnection(socket);

      this.emit('connection', socket);

      // Start read data
      socket.read();

      // Keep listen
      this.listen();
    });
  }
}


module.exports = {
  createServer() {
    return new NIMEServer();
  }
};
