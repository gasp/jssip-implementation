'use strict';


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
    console.log(str);
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

var debug = function(message, e) {
  if(typeof(e)==='undefined') {
    e = null;
  }
  var $l = document.getElementById('debug');
  $l.innerHTML = $l.innerHTML + message +  ' \n';
  console.log(message, e);
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
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
  }
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
