'use strict';

let NIME = require('../index');

let server = NIME.createServer();

// Listening new connection
server.on('connection', (service) => {

  // Listening key event, You can see ../src/textServer.js to see key event
  service.on('filterKeyDown', (msg, setting, state) => {

    console.log('Custom Listener Message: ', msg);

    // You can custom your response
    let response = {
      'success': true,
      'seqNum': msg['seqNum']
    };

    // Reply to IME client
    service.write(response);
  });

  // You can also listen end event that would emit after key event finish
  service.on('end', (msg, setting, state) => {
    console.log('Event finish');
  });

});

// Start server listening
server.listen();
