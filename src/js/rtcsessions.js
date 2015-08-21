// dependencies:
// - requests
// - messages
// - ui

var rtcSessions = new Collection();

// get RTCSession by rtcSessions.db[i].uid
// @param: (string) yaddahyaddah
// @return: (JsSIP RTCSession)
// rtcSessions.get = function () {}

rtcSessions.add = function (e) {
  var request = e.request;
  var call = e.session;
  var uri = call.remote_identity.uri.toString();
  console.log(request, call, uri)

  // create a conversation
  call.content = call.content || 'calling...';
  messages.add(call);
  // upgrade dialogs
  ui.dialog(uri);

  var uniq = utils.yaddahyaddah(32);
  // create an uinqid for request and store it
  request.uid = uniq;
  requests.db.push(request);

  // create an uinqid for rtc session and store it
  call.uid = uniq;
  this.db.push(call);

  // fixme add session options
  ui.call(uri, request.uid, call.uid);
};

rtcSessions.start = function (request_uid, rtc_uid) {
  var request = requests.get(request_uid);
  var call = rtcSessions.get(rtc_uid);
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

      // var selfView = JsSIP.rtcninja.attachMediaStream(document.getElementById('localVideo'), localStream);
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
    console.log('video', e.stream.getVideoTracks());
    console.log('audio', e.stream.getAudioTracks());

    var video = document.getElementById('remoteVideo');
    window.remoteStream = e.stream;
    video.src = window.URL.createObjectURL(e.stream);
    //remoteView = JsSIP.rtcninja.attachMediaStream(remoteView, remoteStream);

  });

};
