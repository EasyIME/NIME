'use strict';

let NIME = require('../index');

let server = NIME.createServer();

// Key Code
const VK_BACK   = 0x08;
const VK_RETURN = 0x0D;
const VK_LEFT   = 0x25;
const VK_UP     = 0x26;
const VK_RIGHT  = 0x27;
const VK_DOWN   = 0x28;
const VK_ESCAPE = 0x1B;

// Listening new connection
server.on('connection', (service) => {

  const candidateList = ['喵', '描', '秒', '妙'];

  let showCandidates = false;
  let compositionString = '';
  let compositionCursor = 0;

  // Listening key event, You can see ../src/textServer.js to see key event
  service.on('filterKeyDown', (msg, setting, state) => {

    console.log('Custom filter Key Down Message:', JSON.stringify(msg));

    let keyCode = msg['keyCode'];
    let seqNum = msg['seqNum'];

    // You can custom your response
    let response = {
      'return': true  // It means need to process this key event, it would trigger onKeyDown.
    };

    // Handle delete event, just pass to normal handle
    if (compositionString === '' && (keyCode === VK_RETURN || keyCode === VK_BACK)) {
      response['return'] = false;
    }

    // Reply to IME client
    service.writeSuccess(seqNum, response);
  });

  service.on('onKeyDown', (msg, setting, state) => {

    console.log('Custom on Key Down Message: ', JSON.stringify(msg));

    let keyCode = msg['keyCode'];
    let seqNum = msg['seqNum'];

    // You can custom your response
    let response = {
      'return': true
    };

    // Select the candidate
    if (showCandidates) {

      if (keyCode === VK_UP || keyCode === VK_ESCAPE) {
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

        case VK_DOWN:  // Show Candidate List
          showCandidates = true;
          response['showCandidates'] = showCandidates;
          response['candidateList'] = candidateList;
          break;

        case VK_RETURN:  // Comfirm String
          response['commitString'] = compositionString;
          response['compositionString'] = '';

          // Set compositionSting default;
          compositionString = '';
          compositionCursor = 0;
          break;

        case VK_BACK:  // Delete compositionString
          if (compositionString !== '') {
            let cursor = compositionCursor;
            compositionCursor -= 1;
            compositionString = compositionString.substring(0, compositionCursor) + compositionString.substring(cursor);
            response['compositionString'] = compositionString;
            response['compositionCursor'] = compositionCursor;
          }
          break;

        case VK_LEFT:  // Move cursor left
          if (compositionCursor > 0) {
            compositionCursor -= 1;
            response['compositionCursor'] = compositionCursor;
          }
          break;

        case VK_RIGHT:  // Move cursor right
          if (compositionCursor < compositionString.length) {
            compositionCursor += 1;
            response['compositionCursor'] = compositionCursor;
          }
          break;

        default:
          compositionString += '喵';
          compositionCursor += 1;

          response['compositionString'] = compositionString;
          response['compositionCursor'] = compositionCursor;
          break;
      }
    }

    // Reply to IME client
    service.writeSuccess(seqNum, response);

  });

  service.on('onCompositionTerminated', (msg, setting, state) => {

    let seqNum = msg['seqNum'];

    compositionString = '';
    compositionCursor = 0;

    // Reply to IME client
    service.writeSuccess(seqNum);
  });

  // You can also listen end event that would emit after key event finish
  service.on('end', (msg, setting, state) => {
    console.log('Event finish');
  });

});

// Start server listening
server.listen();
