喵喵輸入法
=============
This is reimplement of [PIME's 喵喵輸入法](https://github.com/EasyIME/PIME/tree/master/server/input_methods/meow) by using NIME.

The `chi.ico`, `icon.ico` and `ime.json` are copied from [PIME's 喵喵輸入法](https://github.com/EasyIME/PIME/tree/master/server/input_methods/meow). These are under LGPL 2.0 License.

NIME is under MIT License.


## Requirement

- [nodejs 4.x 32bit](https://nodejs.org/en/)
- Install [node-gyp](https://github.com/nodejs/node-gyp) dependecise for c binding through [node-ffi](https://github.com/node-ffi/node-ffi). Please see [node-gyp document](https://github.com/nodejs/node-gyp#installation) to setup your environment.


## Run

- `node index.js`


## Implement

It is the event-based implement. It uses the `EventEmitter` to listening key event.

```js
'use strict';

let NIME = require('nime');

let server = NIME.createServer();

// Listening new connection
server.on('connection', (service) => {

  // Listening key event, You can see ../src/textServer.js to see key event
  service.on('filterKeyDown', (msg, keyHandler) => {

    console.log('Custom Listener Message: ', msg);
    console.log('Key Code: ', keyHandler.keyCode);

    // You can custom your response
    let response = {
      'success': true,
      'seqNum': msg['seqNum']
    };

    // Reply to IME client
    service.write(response);
  });

  // You can also listen end event that would emit after key event finish
  service.on('end', (msg) => {
    console.log('Event finish');
  });

});

// Start server listening
server.listen();
```
