var Collection = function () {
  return {
    db: [],
    add: function (o) {
      if (typeof(o.uid) === 'undefined') {
        throw 'error: object has no uid';
      }
      if (this.get(o.uid) === false) {
        this.db.push(o);
      }
    },
    get: function (uid) {
      for (var i = 0; i < this.db.length; i++) {
        if (this.db[i].uid === uid) return this.db[i];
      }
      return false;
    },
    rem: function (uid) {
      this.db.splice(this.get(uid), 1);
    }
  };
};

/*

var calls = new Collection();
calls.add({
  uid: 'a4X2uo0ZxEtkrMGJ',
  from: 'myriam',
  to: 'tom'
});

console.log(calls);
console.log(calls.get('a4X2uo0ZxEtkrMGJ'));
calls.rem('a4X2uo0ZxEtkrMGJ');
console.log(calls.get('a4X2uo0ZxEtkrMGJ'));

*/
