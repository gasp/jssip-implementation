'use strict';

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

var utils = {
  slugify: function (text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  },
  yaddahyaddah: function (len, charSet) {
    len = len || 16;
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  }
};


var debug = function(message, e) {
  if(typeof(e)==='undefined') {
    e = null;
  }
  else {
    console.log(message, e);
  }
  var $l = document.getElementById('debug');
  $l.innerHTML = $l.innerHTML + message +  ' \n';
};

// fire !
ui.init();
phone.start();
messages.load();
if(messages.db && messages.db.length > 0) {
  conversations.rebuild(messages);
  ui.conversations();
}
