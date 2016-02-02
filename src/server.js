"use strict";

let pipe = require('../lib/pipe');

console.log('Wait Connect');

let ref_pipe = pipe.connect();

console.log('Wait Read');

pipe.read(ref_pipe, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});

pipe.close(ref_pipe);

console.log('Closed');
