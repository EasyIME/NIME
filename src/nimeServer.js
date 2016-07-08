'use strict';

let EventEmitter = require('events');
let pipe         = require('../lib/pipe');
let nimeSocket   = require('./nimeSocket');
let textService  = require('./textService');
let LOG          = require('./util/logger');


class NIMEServer extends EventEmitter {

  constructor(services) {
    super();
    this.connections = [];
    this.services    = services;
  }

  addConnection(socket) {
    this.connections.push(socket);
  }

  deleteConnection(socket) {
    this.connections = this.connections.filter(s => s !== socket);
  }

  listen() {
    LOG.info('Wait connection');

    pipe.connect((err, ref) => {
      LOG.info('Connected');

      let services = [
        {guid: '123', textService}
      ];

      if (typeof this.services !== 'undefined') {
        services = this.services;
      }

      // Each connection create a socket to handle.
      let socket = nimeSocket.createSocket(ref, pipe, this, services);

      this.addConnection(socket);

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
  createServer(services) {
    return new NIMEServer(services);
  }
};
