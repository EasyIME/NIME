'use strict';

let EventEmitter = require('events');
let pipe         = require('../lib/pipe');
let nimeSocket   = require('./nimeSocket');
let textService  = require('./textService');
let LOG          = require('./util/logger');


class NIMEServer extends EventEmitter {

  constructor() {
    super();
    this.connections = [];
    this.service = null;
  }

  addConnection(socket) {
    this.connections.push(socket);
  }

  deleteConnection(socket) {
    this.connections = this.connections.filter(s => s !== socket);
  }

  use(service) {
    this.service = service;
  }

  listen() {
    LOG.info('Wait connection');

    pipe.connect((err, ref) => {
      LOG.info('Connected');

      if (this.service === null) {
        this.service = textService.createTextService();
      }

      // Each connection create a socket to handle.
      let socket = nimeSocket.createSocket(ref, pipe, this, this.service);

      this.addConnection(socket);
      socket.service.setSocket(socket);

      // Pass TextService for user define key event
      this.emit('connection', socket.service, socket);

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
  },
  TextService: textService.TextService
};
