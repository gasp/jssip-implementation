var ui = {
  init: function () {
    this.state('offline');
    $('section.state-offline button[name=connect]').on('click', function () {
      ui.connect();
    });
    this.refresh();
  },
  refresh: function () {
    $('[data-toggle="tooltip"]').tooltip();
  },
  connect: function() {
    phone.start();
  },
  state: function (status) {
    $('section.state').hide();
    console.log('section.state-' + status);
    $('section.state-' + status).show();
  },
  // update the conversation view
  conversations: function () {
    var that = this;
    var $c = $('.ui-conversations').empty();
    var template = $('#template-ui-contact').html();
    var show = function () {
      that.show(c.uri);
      // clear "n" and refresh
    };
    for (var i = 0; i < conversations.db.length; i++) {
      var c = conversations.db[i];
      // if there is a display_name different than 'unknown'
      // use it
      var name = 'unknown';
      for (var j = messages.db.length - 1; j >= 0; j--) {
        if (messages.db[j].remote_uri === c.uri &&
          messages.db[j].remote_display_name !== name) {
          name = messages.db[j].remote_display_name;
          break;
        }
      }
      var content = {
        slug: utils.slugify(c.uri),
        uri: c.uri,
        n: c.n,
        name: name
      };
      var $li = $(_.template(template)(content)).on('click', show);
      $c.append($li);
    }
    this.refresh();
  },
  // create a conversation
  create: function (uri) {
    var content = {};
    for (var i = 0; i < messages.db.length; i++) {
      if (messages.db[i].remote_uri === uri) {
        content = messages.db[i];
        break;
      }
    }
    content.slug = utils.slugify(content.remote_uri);

    var template_panel = $('#template-ui-panel').html();
    var compiled_panel = _.template(template_panel)(content);
    $('.ui-main').prepend(compiled_panel);

    // dialog message post
    var $form = $('.ui-main > div#' + content.slug + ' form');
    $form.on('submit', function (ev) {
      var dest = $(this).data('dest');
      var text = $('input', $form).val();

      phone.sendMessage(dest, text, {
        eventHandlers: {
          succeeded: function() {
            $('input', $form).val('').parent().removeClass('has-error');
            console.log('message success');
            ui.dialog(content.remote_uri);
          },
          failed: function() {
            $('input', $form).parent().removeClass('has-error');
            console.log('message failed');
          }
        }
      });
      ev.preventDefault();
      return false;
    });

    // dialog display
    ui.dialog(content.remote_uri);
  },
  // show a specific conversation
  show: function (uri) {
    var slug = utils.slugify(uri);
    // hide all
    $('.ui-main > div').hide();

    if($('#' + slug, '.ui-main').length) {
      $('.ui-main > div#' + slug).show();
      ui.dialog(uri);
    }
    else {
      this.create(uri);
    }
  },
  // refresh dialog in the currently opened pane
  dialog: function (uri) {
    var slug = utils.slugify(uri);
    var $dialog = $('.ui-main > div#' + slug + ' .ui-dialog');

    $dialog.empty();
    var template_message = $('#template-ui-message').html();
    for (var i = 0; i < messages.db.length; i++) {
      if(messages.db[i].remote_uri === uri) {
        var author = messages.db[i].local_display_name;
        if(messages.db[i].direction === 'incoming') {
          author = messages.db[i].remote_display_name;
        }
        var message = {
          direction: messages.db[i].direction,
          author: author,
          content: messages.db[i].content
        };
        var compiled_message = _.template(template_message)(message);
        $dialog.append(compiled_message);
      }
    }
  },
  // call elements
  call: function (uri, request_uid, rtc_uid) {
    var slug = utils.slugify(uri);
    if(!$('#' + slug, '.ui-main').length) {
      this.create(uri);
      $('#' + slug, '.ui-main').hide();
    }

    var $dialog = $('.ui-main > div#' + slug + ' .ui-rtc-container');
    var template_rtc = $('#template-ui-rtc').html();
    var identifyers = {uri: uri, request_uid: request_uid, rtc_uid: rtc_uid};
    $dialog.append(_.template(template_rtc)(identifyers));

    // handle
    $('.ui-rtc .btn', $dialog).on('click', function () {
      var uri = $(this).data('uri');
      switch ($(this).attr('name')) {
        case 'call-accept':
          var request_uid = $(this).data('request');
          var rtc_uid = $(this).data('rtc');
          // show screens
          $('.screens','#call_' + rtc_uid).show();

          console.log(this, uri, request_uid, rtc_uid);
          rtcSessions.start(request_uid, rtc_uid);
          break;
        default:
      }
    });
  },
  // get video feeds
  feeds: function (rtc_uid) {
    var $dialog = $('.ui-main div#call_' + rtc_uid);
    console.log(rtc_uid, $dialog, $('.screens .local', $dialog));
    // return HTML DOM Objects
    return {
      local: $('.screens .local', $dialog)[0],
      remote: $('.screens .remote', $dialog)[0]
    };
  },
  // call status
  callstatus: function (rtc_uid, status) {
    if(typeof(status) === 'undefined' || status === null) {
      throw 'Status cannot be null or undefined';
    }

    var $dialog = $('.ui-main > div#call_' + rtc_uid);
    $dialog.addClass('status_' + status);
    if(!/^failed|terminated$/i.test(status)) {
      $dialog.show();
    }
    if(status === 'accepted') {
      // hang up button
      $('[name=call-terminate]', $dialog).show();
    }
    debug('rtc status ' + rtc_uid + ': ' + status, this);
  },
  toolbars: function (rtc_uid) {
    // stop getting sound from remote
    function mute() {
      // whatever.getAudioTracks()[0].enabled = false;
    }
    // restart getting sound from remote
    function unmute() {
      // whatever.getAudioTracks()[0].enabled = true;
    }
    // stop getting video from remote
    function hide() {
      // whatever.getVideoTracks()[0].enabled = false;
    }
    // restart getting sound from remote
    function unhide() {
      // whatever.getVideoTracks()[0].enabled = true;
    }
    // stop sending sound to remote
    function deafen() {
      tempLocalStream[0].getAudioTracks()[0].enabled = false;
    }
    // restart sending sound to remote
    function undeafen() {
      tempLocalStream[0].getAudioTracks()[0].enabled = true;
    }
    // stop sending video to remote
    function blind() {
      tempLocalStream[0].getVideoTracks()[0].enabled = false;
    }
    // restart sending video to remote
    function unblind() {
      tempLocalStream[0].getVideoTracks()[0].enabled = true;
    }

    var $dialog = $('.ui-main div#call_' + rtc_uid);
    var $toolbars = $('.toolbar', $dialog);
    var $remote = $('.toolbar').hasClass('toolbar-remote');
    var $local = $('.toolbar').hasClass('toolbar-local');
    // hide all unused buttons


    $('.btn', $toolbars).on('click', function (ev) {
      console.log('clicked');
      console.log(this);
      console.log($toolbars);
      console.log($dialog);
      ev.preventDefault();
    });

    // remote actions
    $('.btn-mute', $toolbars).on('click', function (ev) {
      mute();
      $(this).addClass('btn-alt');
      $('.btn-unmute', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });
    $('.btn-unmute', $toolbars).on('click', function (ev) {
      unmute();
      $(this).addClass('btn-alt');
      $('.btn-mute', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });
    $('.btn-hide', $toolbars).on('click', function (ev) {
      hide();
      $(this).addClass('btn-alt');
      $('.btn-unhide', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });
    $('.btn-unhide', $toolbars).on('click', function (ev) {
      unhide();
      $(this).addClass('btn-alt');
      $('.btn-hide', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });
    // local actions
    $('.btn-deafen', $toolbars).on('click', function (ev) {
      deafen();
      $(this).addClass('btn-alt');
      $('.btn-undeafen', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });
    $('.btn-undeafen', $toolbars).on('click', function (ev) {
      undeafen();
      $(this).addClass('btn-alt');
      $('.btn-deafen', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });
    $('.btn-blind', $toolbars).on('click', function (ev) {
      blind();
      $(this).addClass('btn-alt');
      $('.btn-unblind', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });
    $('.btn-unblind', $toolbars).on('click', function (ev) {
      unblind();
      $(this).addClass('btn-alt');
      $('.btn-blind', $toolbars).removeClass('btn-alt');
      ev.preventDefault();
    });

  },
  sound: function (source) {
    var $soundPlayer = $('#sound-player');
    $soundPlayer.prop('src', 'sounds/' + source + '.ogg');
    $soundPlayer[0].play();
  }
};
