// messages are uniquely identified blips
// dependencies:
// - conversation
// - localStorage
// - ui
var messages = new Collection();

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

  if(clean.remote_display_name !== 'unknown' ||
    typeof(conversations.db[c].display_name) === undefined) {
    conversations.db[c].display_name = clean.remote_display_name;
  }

  messages.save();
  messages.list();
};

messages.list = function () {
  var list = [];
  for (var i = 0; i < this.db.length; i++) {
    var str = i + '> ';
    for(var key in this.db[i]) {
      str = str + key + ': "' + this.db[i][key] + '", ';
    }
    list.push(str);
  }
  console.log(list);
  return list;
};

messages.save = function () {
  localStorage.setItem('messages', JSON.stringify(messages.db));
};

messages.load = function () {
  if(localStorage.getItem('messages')) {
    messages.db = JSON.parse(localStorage.getItem('messages'));
  }
};
