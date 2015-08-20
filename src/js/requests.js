// TODO what are requests

var requests = new Collection();

// get requests by requests.db[i].uid
// @param: (string) yaddahyaddah
// @return: (JsSIP IncomingRequest)
requests.get = function (uid) {
  for (var i = 0; i < this.db.length; i++) {
    if (this.db[i].uid === uid) return this.db[i];
  }
  return false;
};
