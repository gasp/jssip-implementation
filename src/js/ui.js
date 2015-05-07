'use strict';

var ui = {
  init: function () {
    var that = this;
    that.state('offline');
    $('section.state-offline button[name=connect]').on('click', function () {
      ui.connect();
    });
    this.refresh();
  },
  refresh: function () {
    $('[data-toggle="tooltip"]').tooltip()
  },
  connect: function() {
    phone.start();
    that.state('online');
  },
  text: function() {
    var text = 'Hello Bob!';
    phone.sendMessage('sip:103@52.17.80.211', text, {
      eventHandlers: {
        succeed: function() {
          console.log('message success');
        },
        failed: function() {
          console.log('message failed');
        }
      }
    });
  },
  state: function (status) {
    $('section.state').hide();
    console.log('section.state-' + status)
    $('section.state-' + status).show();
  },
  new: function () {

  },
  conversations: function () {
    var that = this;
    var $c = $('.ui-conversations').empty();
    var template = $("#template-ui-contact").html();
    for (var i = 0; i < conversations.db.length; i++) {
      var c = conversations.db[i];
      var name = 'unknown';
      for (var j = messages.db.length - 1; j >= 0; j--) {
        console.log(messages.db[j].remote_uri, c.uri);
        if (messages.db[j].remote_uri === c.uri) {
          name = messages.db[j].remote_display_name;
          break;
        }
      };
      var content = {
        slug: utils.slugify(c.uri),
        uri: c.uri,
        n: c.n,
        name: name
      };
      console.log(content)
      console.log(template)
      var $li = $(_.template(template)(content)).on('click', function () {
        that.show(c.uri);
      });
      $c.append($li);
    }
    this.refresh();
  },
  // show a specific conversation
  show: function (uri) {
    console.log(conversations.find(uri));
    // hide all
    $('.ui-main > div').hide();

    var content = {};
    for (var i = 0; i < messages.db.length; i++) {
      if (messages.db[i].remote_uri === uri) {
        content = messages.db[i];
        break;
      }
    }
    content.slug = utils.slugify(content.remote_uri);

    if($('#' + content.slug, '.ui-main').length) {
      $('.ui-main > div#' + content.slug).show();
      return;
    }


    var template = $("#template-ui-panel").html();
    var compiled = _.template(template)(content);
    $(".ui-main").prepend(compiled);

    // messages display
    for (var i = 0; i < messages.db.length; i++) {
      if(messages.db[i].remote_uri === uri) {
        var m = messages.db[i];
        var $m = $('<li class="' + m.direction + '">' + m.content + '</li>');
      }
    }

  }
};
