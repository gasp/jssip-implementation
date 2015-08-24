// utils


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
  else {
    console.log(message, e);
  }
  var $l = document.getElementById('debug');
  $l.innerHTML = $l.innerHTML + message +  ' \n';
};
