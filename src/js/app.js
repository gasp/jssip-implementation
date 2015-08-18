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
      maxHeight: 180,
      maxWidth: 320
    }
  }
};

// messages are uniquely identified blips
var messages = {};

messages.db = [];
messages.add = function (m) {
  var uri = m.remote_identity.uri.toString();
  var uid = '';
  // filter
  if(typeof uri === 'string' && uri.length) {
    uid = utils.slugify(uri);
  }
  else {
    uid = utils.yaddahyaddah(10);
  }
  var clean = {
    uid: uid,
    content: m.content,
    direction: m.direction, // 'incoming'
    local_display_name: m.local_identity.display_name || 'me',
    local_uri: m.local_identity.uri.toString(),
    remote_display_name: m.remote_identity.display_name || 'unknown',
    remote_uri: uri,
    // ugly: m
  };
  messages.db.push(clean);

  var c = conversations.find(clean.remote_uri);
  if(c === false) c = conversations.add(uri) -1;
  conversations.db[c].n++;

  if(clean.remote_display_name !== 'unknown'
    || typeof(conversations.db[c].display_name) === undefined) {
    conversations.db[c].display_name = clean.remote_display_name;
  }

  ui.conversations();
  messages.save();
  // ui.panels
  messages.list();
};

messages.list = function () {
  for (var i = 0; i < this.db.length; i++) {
    var str = i + '> ';
    for(var key in this.db[i]) {
      str = str + key + ': "' + this.db[i][key] + '", '
    }
  }
};

messages.save = function () {
  localStorage.setItem('messages', JSON.stringify(messages.db));
};

messages.load = function () {
  if(localStorage.getItem('messages')) {
    messages.db = JSON.parse(localStorage.getItem('messages'));
  }
};

// conversations are threads
var conversations = {};
conversations.db = [];

conversations.rebuild = function () {
  for (var i = 0; i < messages.db.length; i++) {
    var cid = conversations.find(messages.db[i].remote_uri);
    if(cid === false) {
      conversations.add(messages.db[i].remote_uri);
    }
    else {
      conversations.db[cid].n ++;
    }
  }
};

conversations.add = function (uri) {
  return this.db.push({uri: uri, n: 0});
};

conversations.find = function (uri) {
  for (var i = 0; i < this.db.length; i++) {
    if (this.db[i].uri === uri) return i;
  }
  return false;
};

var requests = {};
requests.db = [];
// get requests by requests.db[i].uid
// @param: (string) yaddahyaddah
// @return: (JsSIP IncomingRequest)
requests.get = function (uid) {
  for (var i = 0; i < this.db.length; i++) {
    if (this.db[i].uid === uid) return this.db[i];
  }
  return false;
};

var rtc = {};
rtc.db = [];
// get RTCSession by rtc.db[i].uid
// @param: (string) yaddahyaddah
// @return: (JsSIP RTCSession)
rtc.get = function (uid) {
  for (var i = 0; i < this.db.length; i++) {
    if (this.db[i].uid === uid) return this.db[i];
  }
  return false;
};

rtc.add = function (e) {
  var request = e.request;
  var call = e.session;
  var uri = call.remote_identity.uri.toString();
  console.log(request, call, uri)

  // create a conversation
  call.content = call.content || 'calling...';
  messages.add(call);
  // upgrade dialogs
  ui.dialog(uri);

  // create an uinqid for request and store it
  request.uid = utils.yaddahyaddah(32);
  requests.db.push(request);

  // create an uinqid for rtc session and store it
  call.uid = utils.yaddahyaddah(32);
  rtc.db.push(call);

  // fixme add session options
  ui.call(uri, request.uid, call.uid);
};

rtc.start = function (request_uid, rtc_uid) {
  var request = requests.get(request_uid);
  var call = rtc.get(rtc_uid);
  var feeds = ui.feeds(rtc_uid);

  console.log('direction', call.direction);
  console.log('isInProgress', call.isInProgress());
  console.log('isEstablished', call.isEstablished());
  console.log('isEnded', call.isEnded());
  console.log('isReadyToReOffer', call.isReadyToReOffer());
  console.log('answer exists', typeof call.answer);
  console.log('call', call);
  console.log('feeds', feeds);

  if (call.direction === 'incoming') {
    status = "incoming";
    if (request.getHeader('X-Can-Renegotiate') === 'false') {
      call.data.remoteCanRenegotiateRTC = false;
    }
    else {
      call.data.remoteCanRenegotiateRTC = true;
    }
  } else {
    ui.callstatus(rtc_uid, 'trying');
  }

  call.answer({
    // config is a global variable
    pcConfig: config.ice,
    // TMP:
    mediaConstraints: config.constraints,
    extraHeaders: [
      'X-Can-Renegotiate: ' + JsSIP.rtcninja.canRenegotiate.toString()
    ],
    rtcOfferConstraints: {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    },
  });

  // Started
  call.on('accepted',function(e){

    //Attach the streams to the views if it exists.
    if (call.connection.getLocalStreams().length > 0) {
      var localStream = call.connection.getLocalStreams()[0];
      console.log('local streams', call.connection.getLocalStreams());
      console.log('connection', call.connection);

      var selfView = JsSIP.rtcninja.attachMediaStream(document.getElementById('localVideo'), localStream);
      // this would display each feed in separate conversation for multiple conversations
      var selfView = JsSIP.rtcninja.attachMediaStream(feeds.local, localStream);
      selfView.volume = 0;

      // TMP
      console.log('window.localStream created');
      window.localStream = localStream;
    }

    if (e.originator === 'remote') {
      if (e.response.getHeader('X-Can-Renegotiate') === 'false') {
        call.data.remoteCanRenegotiateRTC = false;
      }
      else {
        call.data.remoteCanRenegotiateRTC = true;
      }
    }

    ui.callstatus(rtc_uid, 'accepted');
  });

  call.on('addstream', function(e) {
    console.log('addstream', e.stream);
    console.log(e.stream.getVideoTracks());
    console.log(e.stream.getAudioTracks());

    var video = document.getElementById('remoteVideo');
    window.remoteStream = e.stream;
    video.src = window.URL.createObjectURL(e.stream);


/*
    if(e.stream.getVideoTracks() > 0) {
      console.log('video', e);
      JsSIP.rtcninja.attachMediaStream(document.getElementById('remoteVideo'), e.stream);
    }
    else if(e.stream.getAudioTracks() > 0) {
      console.log('audio', e);
      JsSIP.rtcninja.attachMediaStream(document.getElementById('remoteAudio'), e.stream);
    }
*/
  });

};

  call.on('addstream', function(e) {
    console.log('Tryit: addstream()');
    remoteStream = e.stream;
    remoteView = JsSIP.rtcninja.attachMediaStream(remoteView, remoteStream);
  });

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
  var $l = document.getElementById('debug');
  $l.innerHTML = $l.innerHTML + message +  ' \n';
  console.log(message, e);
};

// fire !
ui.init();
phone.start();
messages.load();
if(messages.db && messages.db.length > 0) {
  conversations.rebuild();
  ui.conversations();
  setTimeout(function () {
    messages.list();
  }, 500);
}
