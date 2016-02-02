"use strict";

let ffi = require('ffi');
let ref = require('ref');

let charPtr = ref.refType('char');
let longPtr = ref.refType('long');

const BUFFER_LEN = 512;

let libPipe = ffi.Library(`${__dirname}/libpipe.dll`, {
  // HANDLE connect_pipe(const char* app_name)
  'connect_pipe': ['pointer', ['string']],
  // int read_pipe(HANDLE pipe, char* buf, unsigned long len, unsigned long* error)
  'read_pipe': ['int', ['pointer', charPtr, 'long', longPtr]],
  // int write_pipe(HANDLE pipe, const char* data, unsigned long len, unsigned long* error)
  'write_pipe': ['int', ['pointer', 'string', 'long', longPtr]],
  // void close_pipe(HANDLE pipe)
  'close_pipe': ['void', ['pointer']]
});

module.exports = {
  connect(callback) {
    libPipe.connect_pipe.async('PIME', callback);
  },
  read(pipe, callback) {
    let error = ref.alloc(ref.types.long);
    let buf = new Buffer(BUFFER_LEN);

    libPipe.read_pipe.async(pipe, buf, 512, error, (err, len) => {
      if (err) {
        throw err;
      }

      let data = buf.toString('utf8', 0, len);
      let real_err = ref.deref(error);

      callback(real_err, data);
    });
  },
  write() {

  },
  close(pipe, callback) {
    libPipe.close_pipe.async(pipe, callback);
  },
};
