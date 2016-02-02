"use strict";

let pipe = require('../lib/pipe');

console.log('Wait Connect');

pipe.connect((err, ref_pipe) => {
  if (err) {
    throw err;
  }

  console.log('Wait Read');

  pipe.read(ref_pipe, (err, data) => {
    if (err) {
      console.log(err);
    }

    console.log(data);

    pipe.close(ref_pipe, (err) => {
      if (err) {
        throw err;
      }
      console.log('Closed');
    });
  });
});
