// streams are attached to rtcSessions,
// created by rtcSessions
// stores JsSIP MediaStreams
// request.uid (string) yaddahyaddah(32)
var streams = new Collection();

// stream have uid (str) yaddahyaddah
// rtcSession_uri (str) URI
// originator (string) local, remote


// get stream tracks with
// getAudioTracks()[0] and getVideoTracks()[0]

streams.getByRtcSession = function (rtcsession_uid) {
  var results = [];
  for (var i = 0; i < this.db.length; i++) {
    if (this.db[i].rtcsession_uid === rtcsession_uid) {
      results.push(this.db[i]);
    }
  }
  return results;
};
