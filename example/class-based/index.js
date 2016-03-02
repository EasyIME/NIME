'use strict';

let NIME        = require('../../index');
let TextService = require('../../index').TextService;
let KEYCODE     = require('../../lib/keyCodes');

let server = NIME.createServer();

class MeowTextService extends TextService {

  constructor() {
    super();
    this.candidateList = ['喵', '描', '秒', '妙'];
    this.showCandidates = false;
    this.compositionString = '';
    this.compositionCursor = 0;
  }

  // Handle filterKeyDown key event, You can see ../src/textServer.js to see key event type
  filterKeyDown(msg, keyHandler) {

    console.log('Custom filter Key Down Message:', JSON.stringify(msg));

    let keyCode = keyHandler.keyCode;
    let seqNum = msg['seqNum'];

    // You can custom your response
    let response = {
      'return': true  // It means need to process this key event, it would trigger onKeyDown.
    };

    // Handle delete event, just pass to normal handle
    if (this.compositionString === '' && (
        keyCode === KEYCODE.VK_RETURN || keyCode === KEYCODE.VK_BACK ||
        keyCode === KEYCODE.VK_LEFT || keyCode === KEYCODE.VK_UP ||
        keyCode === KEYCODE.VK_DOWN || keyCode === KEYCODE.VK_RIGHT)) {
      response['return'] = false;
    }
    return response;
  }

  onKeyDown(msg, keyHandler) {

    console.log('Custom on Key Down Message: ', JSON.stringify(msg));

    let keyCode = keyHandler.keyCode;
    let seqNum = msg['seqNum'];

    // You can custom your response
    let response = {
      'return': true
    };

    // Select the candidate
    if (this.showCandidates) {

      if (keyCode === KEYCODE.VK_UP || keyCode === KEYCODE.VK_ESCAPE) {
        response['showCandidates'] = false;
        this.showCandidates = false;

      } else if (keyCode >= '1'.charCodeAt(0) && keyCode <= '4'.charCodeAt(0)) {
        let selectCandidate = this.candidateList[keyCode - '1'.charCodeAt(0)];
        let cursor = this.compositionCursor - 1;

        if (cursor < 0) {
          cursor = 0;
        }

        this.compositionString = this.compositionString.substring(0, cursor) + selectCandidate + this.compositionString.substring(cursor + 1);

        response['compositionString'] = this.compositionString;
        response['showCandidates'] = false;
        this.showCandidates = false;
      }

    } else {
      switch (keyCode) {

        case KEYCODE.VK_DOWN:  // Show Candidate List
          this.showCandidates = true;
          response['showCandidates'] = this.showCandidates;
          response['candidateList'] = this.candidateList;
          break;

        case KEYCODE.VK_RETURN:  // Comfirm String
          response['commitString'] = this.compositionString;
          response['compositionString'] = '';

          // Set compositionSting default;
          this.compositionString = '';
          this.compositionCursor = 0;
          break;

        case KEYCODE.VK_BACK:  // Delete compositionString
          if (this.compositionString !== '') {
            let cursor = this.compositionCursor;
            this.compositionCursor -= 1;
            this.compositionString = this.compositionString.substring(0, this.compositionCursor) + this.compositionString.substring(cursor);
            response['compositionString'] = this.compositionString;
            response['compositionCursor'] = this.compositionCursor;
          }
          break;

        case KEYCODE.VK_LEFT:  // Move cursor left
          if (this.compositionCursor > 0) {
            this.compositionCursor -= 1;
            response['compositionCursor'] = this.compositionCursor;
          }
          break;

        case KEYCODE.VK_RIGHT:  // Move cursor right
          if (this.compositionCursor < this.compositionString.length) {
            this.compositionCursor += 1;
            response['compositionCursor'] = this.compositionCursor;
          }
          break;

        default:
          this.compositionString = this.compositionString.substring(0, this.compositionCursor) + '喵' + this.compositionString.substring(this.compositionCursor);
          this.compositionCursor += 1;

          response['compositionString'] = this.compositionString;
          response['compositionCursor'] = this.compositionCursor;
          break;
      }
    }
    return response;
  }

  onCompositionTerminated() {
    // Clear composition data
    this.compositionString = '';
    this.compositionCursor = 0;
  }
}

server.use(new MeowTextService());

// Listening new connection
server.on('connection', (service) => {

  // You can also listen end event that would emit after key event finish
  service.on('end', (msg, response) => {
    console.log('Event finish ' + JSON.stringify(response));
  });

});

// Start server listening
server.listen();
