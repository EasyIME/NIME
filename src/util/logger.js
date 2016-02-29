'use strict';

module.exports = {
  info(message) {
    if (process.env.NODE_ENV === 'development') {
      console.log(message);
    }
  }
};
