'use strict';

let pipe         = require('../lib/pipe');
let nimeSocket   = require('./nimeSocket');
let textService  = require('./textService');
let debug        = require('debug')('nime:server');


function createServer(services = [{guid: '123', textService}]) {

  let connections = [];
  let id = 0;

  function addConnection(socket) {
    connections.push(socket);
  }

  function deleteConnection(socket) {
    connections = connections.filter(s => s !== socket);
  }

  function listen() {
    debug('Wait connection');

    pipe.connect((err, ref) => {
      debug('Connected');

      // Each connection create a socket to handle.
      let socket = nimeSocket.createSocket(ref, pipe, this, services, id);

      id += 1;
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
