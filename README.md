NIME
=============
Implement input methods easily for Windows with nodejs. It is another [PIME](https://github.com/EasyIME/PIME) server side.

## Require

#### PIME

Install PIME first. There are two ways to install.

1. Install via [installer](https://github.com/EasyIME/PIME/releases)
2. Build the PIME source code and register `PIMETextService.dll`. Please see [this](https://github.com/EasyIME/PIME#install) for more detail

Please install PIME >= 0.03 version


#### Node

- Node v4.x 32 bit (Must be 32 bit.)
- Install [node-gyp](https://github.com/nodejs/node-gyp) dependecise for c binding through [node-ffi](https://github.com/node-ffi/node-ffi). Please see [node-gyp document](https://github.com/nodejs/node-gyp#installation) to setup your environment.


## Development

- npm i
- npm start

It would start example server to help develop core library.

## Usage

```
npm install nime
```

> This is WIP project. You can see example in `./example`.

`ime.json` is to configure IME.

The usage will look like following. If you have any suggestion, welcome feedback.
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


## Reference

- [PIME](https://github.com/EasyIME/PIME)
- [Virtual-Key Codes](https://msdn.microsoft.com/zh-tw/library/windows/desktop/dd375731%28v=vs.85%29.aspx)


## License

The MIT License (MIT)

Copyright (c) 2016 Lee  < jessy1092@gmail.com >

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
