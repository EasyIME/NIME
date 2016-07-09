'use strict';

let pipe         = require('../lib/pipe');
let nimeSocket   = require('./nimeSocket');
let textService  = require('./textService');
let LOG          = require('./util/logger');


function createServer(services = [{guid: '123', textService}]) {

  let connections = [];

  function addConnection(socket) {
    connections.push(socket);
  }

  function deleteConnection(socket) {
    connections = connections.filter(s => s !== socket);
  }

  function listen() {
    LOG.info('Wait connection');

    pipe.connect((err, ref) => {
      LOG.info('Connected');

      // Each connection create a socket to handle.
      let socket = nimeSocket.createSocket(ref, pipe, this, services);

      this.addConnection(socket);

      // Start read data
      socket.read();

      // Keep listen
      this.listen();
    });
  }

  return {addConnection, deleteConnection, listen};
}


module.exports = {
  createServer
};
