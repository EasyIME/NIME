"use strict";

let nimeServer = require('./src/nimeServer');

let server = nimeServer.createServer();

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

  service.on('onKeyDown', (msg, setting, state) => {
    console.log('KeyKeyKeyKeyKeyKeyKeyKeyKeyKey');
    state['test'] = 1;
  });

  socket.on('data', (data) => {
    // console.log(data);
  });

  socket.on('drain', (len) => {
    console.log(`Write ${len} data`);
  })

  console.log(`Connect: ${server.connections.length}`);

});

server.listen();
