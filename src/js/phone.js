var phone = {};
var configuration = {
  // oldie
  // 'ws_servers': 'ws://52.17.80.211:8080/ws',
  // 'uri': 'sip:102@52.17.80.211',
  // 'password': 'videodesk102!gaspard'

  'ws_servers': 'ws://sip.bvcs.fr:80/ws',
  'uri': 'sip:102@sip.bvcs.fr',
  'password': 'videodesk102gaspard'
};

phone = new JsSIP.UA(configuration);

phone.on('connected', function(e){
  debug(configuration.uri);
  debug('connected');
  ui.state('online');
});

phone.on('newRTCSession', function(e){
  debug('newRTCSession');
  console.log(e);
  if (e.originator === 'local') {
    return false;
  }
  ui.sound('ring');
  rtcSessions.add(e);
  ui.conversations();
});

phone.on('disconnected', function(e){
  debug('disconnected');
  ui.state('offline');
});

phone.on('newMessage', function(e){
  if (e.originator === 'remote') {
    ui.sound('message');
  }
  var uri = e.message.remote_identity.uri.toString();
  debug('newMessage', e);
  messages.add(e.message);
  ui.dialog(uri);
  ui.conversations();
});

phone.on('registered', function(e){
  debug('registered');
});
phone.on('unregistered', function(e){
  debug('unregistered');
});
phone.on('registrationFailed', function(e){
  debug('registrationFailed');
  ui.state('offline');
});
