'use strict';

let LOG = require('./util/logger');

const SUCCESS          = 0;
const ERROR_MORE_DATA  = 234;
const ERROR_IO_PENDING = 997;

const NEXT_READ    = 0;
const CLOSE_SOCKET = 1;


function createSocket(ref, pipe, server, service) {

  let readData = '';
  let message      = {};

  function _handleMessage(msg) {

    // For client, check server exist or not.
    if (msg === 'ping') {
      write('pong');
      return NEXT_READ;
    }

    // For client, quit the server.
    if (msg === 'quit') {
      return CLOSE_SOCKET;
    }

    // Handle the normal message
    service.handleRequest(msg);
    return NEXT_READ;
  };

  function _handleData(err, data) {

    if (err === SUCCESS) {
      readData += data;

      LOG.info('Get Data: ' + readData);
      try {
        message = JSON.parse(readData);
      } catch (e) {
        message = readData;
      }

      readData = "";

      return _handleMessage(message);
    }

    if (err === ERROR_MORE_DATA) {
      readData += data;
      return NEXT_READ;
    }

    if (err === ERROR_IO_PENDING) {
      return NEXT_READ;
    }

    LOG.info('Socket broken');
    return CLOSE_SOCKET;
  }

  function read() {

    pipe.read(ref, (err, data) => {

      let result = _handleData(err, data);

      if (result === NEXT_READ) {
        read();
      } else {
        close();
      }
    });
  }

  function write(response) {

    let data = '';

    try {
      data = JSON.stringify(response);
    } catch (e) {
      data = response;
    }

    pipe.write(ref, response, (err, len) => {

      if (err) {
        LOG.info('Write Failed');
      }

      LOG.info(`Write Len: ${len} Data: ${data}`)
    });
  }

  function close() {
    pipe.close(ref, (err) => {
      server.deleteConnection(this);
    });
  }

  return {read, write, close, service};
}

module.exports = {
  createSocket
};
