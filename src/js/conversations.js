// conversations are threads
// dependencies:
// - messages
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
