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
