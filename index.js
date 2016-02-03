"use strict";

let NIME = require('./src/server');

let server = NIME.createServer();

server.on('connection', (socket) => {

  socket.on('data', (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log(data);
  });

  socket.on('drain', (len) => {
    console.log(`Write ${len} data`);
  })

  console.log(`Connect: ${server.connections.length}`);

});

server.listen();
