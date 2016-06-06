// general app

var config = {};

// get free ice
// https://github.com/gasp/freeice
config.ice = {
  "iceServers": [
    {"urls": ["stun:stun.l.google.com:19302"]}
  ],
  "gatheringTimeout": 2000
};

// add an "ideal" resolution
config.constraints = {
  audio: true,
  video: {
    mandatory: {
      maxHeight: 240,
      maxWidth: 320
    }
  }
};

// fire !
ui.init();
phone.init();
messages.load();
if(messages.db && messages.db.length > 0) {
  conversations.rebuild(messages);
  ui.conversations();
}
