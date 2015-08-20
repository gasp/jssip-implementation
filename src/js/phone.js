'use strict';

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
  debug(configuration.uri)
  debug('connected');
  ui.state('online');
});

phone.on('newRTCSession', function(e){
  debug('newRTCSession');
  console.log(e);
  rtcSessions.add(e);
});

phone.on('disconnected', function(e){
  debug('disconnected');
  ui.state('offline');
});

phone.on('newMessage', function(e){
  debug('newMessage', e);
  messages.add(e.message);
});

phone.on('registered', function(e){
  debug('registered');
});
phone.on('unregistered', function(e){
  debug('unregistered');
});
phone.on('registrationFailed', function(e){
  debug('registrationFailed');
});
