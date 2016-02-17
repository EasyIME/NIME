'use strict';

let NIME = require('../index');
let KEYCODE = require('../lib/keyCodes');

let server = NIME.createServer();

// Listening new connection
server.on('connection', (service) => {

  const candidateList = ['喵', '描', '秒', '妙'];

  let showCandidates = false;
  let compositionString = '';
  let compositionCursor = 0;

  // Listening key event, You can see ../src/textServer.js to see key event
  service.on('filterKeyDown', (msg, keyHandler) => {

    console.log('Custom filter Key Down Message:', JSON.stringify(msg));

    let keyCode = keyHandler.keyCode;
    let seqNum = msg['seqNum'];

    // You can custom your response
    let response = {
      'return': true  // It means need to process this key event, it would trigger onKeyDown.
    };

    // Handle delete event, just pass to normal handle
    if (compositionString === '' && (
        keyCode === KEYCODE.VK_RETURN || keyCode === KEYCODE.VK_BACK ||
        keyCode === KEYCODE.VK_LEFT || keyCode === KEYCODE.VK_UP ||
        keyCode === KEYCODE.VK_DOWN || keyCode === KEYCODE.VK_RIGHT)) {
      response['return'] = false;
    }

    // Reply to IME client
    service.writeSuccess(seqNum, response);
  });

  service.on('onKeyDown', (msg, keyHandler) => {

    console.log('Custom on Key Down Message: ', JSON.stringify(msg));

    let keyCode = keyHandler.keyCode;
    let seqNum = msg['seqNum'];

    // You can custom your response
    let response = {
      'return': true
    };

    // Select the candidate
    if (showCandidates) {

      if (keyCode === KEYCODE.VK_UP || keyCode === KEYCODE.VK_ESCAPE) {
        response['showCandidates'] = false;
        showCandidates = false;

      } else if (keyCode >= '1'.charCodeAt(0) && keyCode <= '4'.charCodeAt(0)) {
        let selectCandidate = candidateList[keyCode - '1'.charCodeAt(0)];
        let cursor = compositionCursor - 1;

        if (cursor < 0) {
          cursor = 0;
        }

        compositionString = compositionString.substring(0, cursor) + selectCandidate + compositionString.substring(cursor + 1);

        response['compositionString'] = compositionString;
        response['showCandidates'] = false;
        showCandidates = false;
      }

    } else {
      switch (keyCode) {

        case KEYCODE.VK_DOWN:  // Show Candidate List
          showCandidates = true;
          response['showCandidates'] = showCandidates;
          response['candidateList'] = candidateList;
          break;

        case KEYCODE.VK_RETURN:  // Comfirm String
          response['commitString'] = compositionString;
          response['compositionString'] = '';

          // Set compositionSting default;
          compositionString = '';
          compositionCursor = 0;
          break;

        case KEYCODE.VK_BACK:  // Delete compositionString
          if (compositionString !== '') {
            let cursor = compositionCursor;
            compositionCursor -= 1;
            compositionString = compositionString.substring(0, compositionCursor) + compositionString.substring(cursor);
            response['compositionString'] = compositionString;
            response['compositionCursor'] = compositionCursor;
          }
          break;

        case KEYCODE.VK_LEFT:  // Move cursor left
          if (compositionCursor > 0) {
            compositionCursor -= 1;
            response['compositionCursor'] = compositionCursor;
          }
          break;

        case KEYCODE.VK_RIGHT:  // Move cursor right
          if (compositionCursor < compositionString.length) {
            compositionCursor += 1;
            response['compositionCursor'] = compositionCursor;
          }
          break;

        default:
          compositionString = compositionString.substring(0, compositionCursor) + '喵' + compositionString.substring(compositionCursor);
          compositionCursor += 1;

          response['compositionString'] = compositionString;
          response['compositionCursor'] = compositionCursor;
          break;
      }
    }

    // Reply to IME client
    service.writeSuccess(seqNum, response);

  });

  service.on('onCompositionTerminated', (msg) => {

    let seqNum = msg['seqNum'];

    compositionString = '';
    compositionCursor = 0;

    // Reply to IME client
    service.writeSuccess(seqNum);
  });

  // You can also listen end event that would emit after key event finish
  service.on('end', (msg) => {
    console.log('Event finish');
  });

});

// Start server listening
server.listen();
