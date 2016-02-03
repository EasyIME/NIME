"use strict";

let NIME = require('./src/server');

let server = NIME.createServer();

server.on('connection', (service, socket) => {

  service.on('end', (msg, state) => {
    console.log(`Message: ${JSON.stringify(msg)}`);
    console.log(`State: ${JSON.stringify(state)}`);

    let response = {
      'success': true,
      'seqNum': msg['seqNum']
    };

    service.write(response);
  });

  service.on('init', (msg, state) => {
    state['test'] = 1;
  });

  socket.on('data', (data) => {
    console.log(data);
  });

  socket.on('drain', (len) => {
    console.log(`Write ${len} data`);
  })

  console.log(`Connect: ${server.connections.length}`);

});

server.listen();
