'use strict'

typeof Meteor === "undefined" && (global.cube = require('cubesat'))

let c1     = cube.Cube()
let width  = 375
let height = 667
let box    = width / 5
let top    = 22
let bottom = 44
let swipe  = 22
let pic_top    = top + box
let pic_height = height - (pic_top + bottom)

console.log('client ************')

c1.add(cube.Module('layout').template(function() {
  cube.Head(this,
    html.META(this, { name: 'viewport', content: 'width=device-width initial-scale=1.0, user-scalable=no'}),
    html.TITLE(this, Settings.title))
  return ionic.Body(this,
    ionic.NavBar(this, { class: 'bar-royal' }),
    ionic.NavView(this, blaze.Include(this, 'yield')),
    blaze.Include(this, 'tabs'))
}).onStartup(() => {
//  FB.init({ appId: Sat.setting.public.fbAppId, xfbml: false, version: 'v2.3', status: true })
  FB.init({ appId: Settings.fbAppId, xfbml: false, version: 'v2.3', status: true })
  style$('.bar-subfooter').set({ bottom: 48, height: 62 }) }
).close())

c1.add(cube.Module('tabs').template(function() {
  return ionic.Tabs(this, {
    _tabs: '*-icon-top'
  }, blaze.Each(this, 'tabs', (function(_this) {
    return function() {
      return ionic.Tab(_this, { title: '{label}', path: '{name}', iconOff: '{icon}', iconOn: '{icon}'
      });
    };
  })(this)));
}).helpers(function() {
  return {
    tabs: function() {
      return 'chat camera spark settings profile'.split(' ').map(function(a) {
        return Sat.module[a].property;
      });
    }
  };
}).close());


c1.add(cube.Module('profile').properties(function() {
  return {
    icon: 'person',
    path: 'profile'
  };
}).template(function() {
  var v, _, _ref;
  return cube.Template((_ref = cube.View(this), v = _ref[0], _ = _ref[1], _ref), v.title('Profiles'), v.ionListContent('', v.Each('items', (function(_this) {
    return function() {
      return ionic.Item(_this, {
        buttonRight: true
      }, html.H2(_this, 'title {title} content &#123; &#125; {content} works!'), html.P(_this, cube.lookupInView(_this, 'content')), html.BUTTON(_this, {
        _button: '* *-positive'
      }, ionic.Icon(_this, {
        icon: 'ios-telephone'
      })));
    };
  })(this))), v.ionSubfooterButton({
    id: 'facebook'
  }, 'login with facebook'));
}).helpers(function() {
  return {
    items: function() {
      return [
        {
          title: 'hello6',
          content: 'world6'
        }, {
          title: 'hello1',
          content: 'world1'
        }, {
          title: 'hello2',
          content: 'world2'
        }, {
          title: 'hello3',
          content: 'world3'
        }
      ];
    },
    token: function() {
      return facebookConnectPlugin.getAccessToken((function(token) {
        return Session.set('fbToken', token);
      }), (function() {}));
    }
  };
}).events(function() {
  return {
    'touchend #facebook': function() {
      return facebookConnectPlugin.login(['publish_actions'], (function() {
        facebookConnectPlugin.getAccessToken((function(token) {
          return Session.set('fbToken', token);
        }), function(e) {
          return console.log('Token fail', e);
        });
        facebookConnectPlugin.api('me', ['public_profile'], (function(data) {
          return Session.set('fbProfile', data);
        }), function(e) {
          return console.log('API fail', e);
        });
        return facebookConnectPlugin.getLoginStatus((function(data) {
          return console.log(data);
        }), function(e) {
          return console.log('Login Status fail', e);
        });
      }), function(e) {
        console.log('Login fail', e);
        facebookConnectPlugin.api('me', ['public_profile'], (function(data) {
          console.log('fb Profile get', data);
          return Session.set('fbProfile', data);
        }), function(e) {
          return console.log('API fail', e);
        });
        return facebookConnectPlugin.getLoginStatus((function(data) {
          return console.log(data);
        }), function(e) {
          return console.log('Login Status fail', e);
        });
      });
    }
  };
}).close('profile'));

c1.add(cube.Module('settings').properties(function() {
  return {
    icon: 'gear-a',
    path: 'settings'
  };
}).template(function() {
  var v, _, _ref;
  return cube.Template((_ref = cube.View(this), v = _ref[0], _ = _ref[1], _ref), v.title(_.property.label), v.ionListContent('', v.ionDivider('General'), v.ionItemLabelToggle('Online', {
    id: 'online'
  }), v.ionDivider('Search'), v.ionItemLabelRange('Distance', {
    name: 'distance',
    min: '0',
    max: '200',
    value: '33'
  }, '0', '80 km'), v.ionItemLabelList('Age', v.ionRange({
    name: 'age',
    local: 'agefrom',
    min: '18',
    max: '80',
    value: '25'
  }, '18', '80'), v.ionRange({
    name: 'age',
    local: 'ageto',
    min: '18',
    max: '80',
    value: '25'
  }, '18', '80')), v.ionItemLabelSelect('Language', {
    id: 'language'
  }, 'Korean', ['English', 'Spanish', 'Chinese', 'Korean', 'Japanese']), v.ionItemLabelSelect('Search for', {
    id: 'preference'
  }, 'woman', ['woman', 'man', 'both']), v.ionDivider('Notification'), v.ionItemLabelToggle('New matches', {
    id: 'new-matches'
  }), v.ionItemLabelToggle('Messages', {
    id: 'message'
  })), v.ionSubfooterButton({
    id: 'logout'
  }, 'logout'));
}).styles(function() {
  return {
    'local_agefrom::-webkit-slider-thumb::after': {
      backgroundColor: '#387ef5',
      left: 28,
      width: 1000,
      top: 13,
      padding: 0,
      height: 2
    },
    'local_agefrom::-webkit-slider-thumb::before': {
      height: 0
    },
    'local_ageto::-webkit-slider-thumb::before': {
      height: 2.001
    }
  };
}).helpers(function() {
  return {
    go: function() {
      return Session.get('go');
    },
    login: function() {
      return Session.get('loginStatus');
    }
  };
}).events(function() {
  return {
    'touchend #logout': function() {
      return facebookConnectPlugin.logout((function() {
        return Router.go('profile');
      }), function(e) {
        return console.log('logout error', e);
      });
    },
    'change #hello': (function(_this) {
      return function(evnt) {
        return console.log($('#hello').prop('checked'));
      };
    })(this)
  };
}).onCreated(function() {
  var _;
  _ = __.module(this);
  _.style$ageFrom = style$(_.local('#agefrom') + '::-webkit-slider-thumb::after');
  return _.style$ageTo = style$(_.local('#ageto') + '::-webkit-slider-thumb::before');
}).onRendered(function() {
  var _;
  _ = __.module(this);
  this.$('#online').prop('checked', true);
  this.$to = this.$to || _.$('#ageto');
  this.$from = this.$from || _.$('#agefrom');
  _.unit = (_.$('#agefrom').width() - 28) / (80 - 18);
  this.$from.on('input', (function(_this) {
    return function(evt) {
      var to, val;
      if ((val = evt.target.value) > (to = _this.$to.val())) {
        return _this.$to.val(val);
      } else {
        return _.rangeSync(val, to);
      }
    };
  })(this));
  return this.$to.on('input', (function(_this) {
    return function(evt) {
      var from, val;
      if ((val = evt.target.value) < (from = _this.$from.val())) {
        return _this.$from.val(val);
      } else {
        return _.rangeSync(from, val);
      }
    };
  })(this));
}).fn({
  rangeSync: function(from, to) {
    this.style$ageFrom.set({
      width: (to - from - 1) * this.unit
    });
    return this.style$ageTo.set({
      width: width = (to - from - 1) * this.unit,
      left: -width
    });
  }
}).close('settings'));

console.log('v ok') // remove

c1.add(cube.Module('facebook').template(function() {
  return '';
}).close());

c1.add(cube.Module('abc').template(function() {
  return html.P(this, 'ABC');
}).close());

c1.add(cube.Module('def').template(function() {
  return html.P(this, 'DEF');
}).close());

c1.add(cube.Module('chat').properties(function() {
  return {
    icon: 'chatbubbles',
    path: 'chat',
    hash: '0fc7da9b30f3e2c7'
  };
}).template(function() {
  return [
    part.title(this, 'Chat'), html.DIV(this, {
      "class": 'content'
    }, html.DIV(this, {
      "class": 'content-padded',
      local: 'chat'
    }, blaze.Each(this, 'chats', (function(_this) {
      return function() {
        return html.DIV(_this, {
          id: '{id}',
          _chat: '* *-{side}'
        }, '{text}');
      };
    })(this)))), ionic.SubfooterBar(this, html.INPUT(this, {
      local: 'input0',
      type: 'text'
    }))
  ];
}).styles(function() {
  return {
    _chat:      { display:    'block' },
    _chatMe:    { color:      'black' },
    _chatYou:   { marginLeft: 20      },
    _chatRead:  { color:      'black' },
    local_chat: { $fixedBottom: bottom * 2 + 10 },
    local_input0: {
      $box: ['100%', 33],
      $mp: 0,
      border: 0
    }
  };
}).helpers(function() {
  return {
    chats: function() {
      return db.Chats.find({});
    },
    side: function() {
      return 'me';
    }
  };
}).events(function() {
  return {
    'keypress {local #input0}': (function(_this) {
      return function(e) {
        var Jinput, text;
        if (e.keyCode === 13 && (text = (Jinput = $(_this.local('#input0'))).val())) {
          Jinput.val('');
          return Meteor.call('says', 'isaac', text);
        }
      };
    })(this)
  };
}).close('chat'));

c1.add(cube.Module('chosen').template(function() {
  return html.DIV(this, {
    "class": 'chosen'
  }, blaze.Each(this, 'chosen', (function(_this) {
    return function() {
      return html.DIV(_this, {
        _chosen: '*-container',
        id: "chosen-{id}"
      }, html.IMG(_this, {
        id: "chosen-box-{id}",
        width: box,
        src: Session.get('chosen-box-' + cube.lookup(_this, 'id'))
      }), console.log(cube.lookup(_this, 'id')));
    };
  })(this)));
}).styles(function() {
  return {
    _chosen: {
      display: 'flex',
      flexDirection: 'row',
      $box: ['100%', box]
    },
    _chosenContainer: {
      flexGrow: 1,
      float: 'left',
      $box: [box, box],
      zIndex: 200,
      border: 3,
      overflowY: 'hidden'
    }
  };
}).helpers(function() {
  return {
    chosen: [0, 1, 2, 3, 4].map(function(i) {
      return {
        id: i
      };
    })
  };
}).close());

(function() {
  var choose, icon_index, index, next, pass, push, setImage, touchEnd, touchStart;
  icon_index = 0;
  index = 0;
  next = function() {
    return console.log('next');
  };
  setImage = function(id, i) {
    return Session.set('img-photo-id', Matches[i].public_ids[0]);
  };
  pass = function(J) {
    return J.animate({
      top: '+=1000'
    }, 600, function() {
      J.remove();
      return next();
    });
  };
  touchStart = function(e) {
    return $(e.target).switchClass('photo-front', 'photo-touched', 100);
  };
  touchEnd = function(e) {
    switch (false) {
      case !(e.target.y > pic_top + swipe):
        return push() && pass($(e.target));
      case !(e.target.y < pic_top - swipe):
        return push() && choose($(e.target));
      default:
        return $(e.target).switchClass('photo-touched', 'photo-front', 100, function() {
          return $(e.target).animate({
            top: box
          }, 100);
        });
    }
  };
  choose = function(J) {
    var iconTop;
    iconTop = $('.chosen').offset().top;
    console.log('choose', icon_index, box, box * icon_index);
    return J.animate({
      top: 0,
      width: box,
      left: box * icon_index,
      clip: 'rect(0px, 75px, 75px, 0px)'
    }, 500, function() {
      J.switchClass('photo-touched', 'photo-icon', 300);
      Session.set('chosen-box-' + icon_index++, J.attr('src'));
      J.remove();
      return next();
    });
  };
  push = (function(_this) {
    return function() {
      var Jfront;
      Jfront = $('#photo-' + ++index);
      return Jfront.switchClass('photo-back', 'photo-front', 0, function() {
        return $('#photo-' + (index + 1)).css({
          left: 0
        });
      }).after(HTML.toHTML(html.IMG(_this, {
        id: 'photo-' + (index + 1),
        _photo: '* *-back',
        src: _this.photoUrl(index + 1)
      }))).draggable({
        axis: 'y'
      }).on('touchstart', touchStart).on('touchend', touchEnd);
    };
  })(this);

  return c1.add(cube.Module('spark').properties(function() {
    return {
      path: '/',
      icon: 'flash'
    };
  }).template(function() {
    console.log('PART', part);
    return [
      part.title(this, 'Spark'), ionic.Content(this, blaze.Include(this, 'chosen'), html.IMG(this, {
        _photo: '* *-front',
        id: 'photo-' + Session.get('index'),
        src: Session.get('photo-front')
      }), html.IMG(this, {
        _photo: '* *-back',
        id: 'photo-' + (Session.get('index') + 1),
        src: Session.get('photo-back')
      }))
    ];
  }).onRendered(function() {
    return $('#photo-' + (index = Session.get('index'))).draggable({
      axis: 'y'
    }).on('touchstart', touchStart).on('touchend', touchEnd);
  }).onDestroyed(function() {
    Session.set('index', index);
    Session.set('photo-front', $('.photo-front').attr('src'));
    return Session.set('photo-back', $('.photo-back').attr('src'));
  }).styles(function() {
    return {
      _photo: {
        width: width,
        background: 'white',
        overflow: 'hidden'
      },
      _photoIcon: {
        zIndex: 20,
        width: box,
        top: top,
        clip: 'rect(0px, 75px, 75px, 0px)'
      },
      _photoFront: {
        zIndex: 10,
        position: 'absolute'
      },
      _photoBack: {
        zIndex: -10,
        position: 'absolute'
      },
      _photoTouched: {
        zIndex: 1000,
        position: 'absolute',
        width: width - 1,
        $photoCard: ''
      }
    };
  }).close('spark'));
})();

(function() {
  var upload, uploadPhoto;
  uploadPhoto = function(uri) {
    var ft, o, options;
    return (ft = new FileTransfer()).upload(uri, Settings.upload, (function(r) {
      return console.log('ok', r);
    }), (function(r) {
      return console.log('err', r);
    }), __.assign(options = new FileUploadOptions(), o = {
      fileKey: 'file',
      fileName: uri.slice(uri.lastIndexOf('/') + 1),
      mimeType: 'image/jpeg',
      chunkedMode: true,
      params: {
        id: 'isaac'
      }
    }));
  };
  upload = function(url) {
    return resolveLocalFileSystemURL(url, (function(entry) {
      return entry.file((function(data) {
        var l;
        return console.log('data', data) || uploadPhoto(l = data.localURL);
      }), function(e) {
        return console.log(e);
      });
    }), function(e) {
      return console.log('resolve err', e);
    });
  };
  return c1.add(cube.Module('camera').properties(function() {
    return {
      icon: 'camera',
      path: 'camera'
    };
  }).template(function() {
    return [
      part.title(this, 'Camera'), html.IMG(this, {
        id: 'camera-photo',
        style: 'width:100%;'
      })
    ];
  }).onRendered(function() {
    var options;
    return navigator.camera.getPicture((function(uri) {
      return upload(uri);
    }), (function() {}), options = {
      quality: 90,
      cameraDirection: Camera.Direction.FRONT,
      destinationType: Camera.DestinationType.FILE_URI,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: Camera.PictureSourceType.CAMERA
    });
  }).close('camera'));
})();

c1.add(cube.Parts(function() {
  return {
    title: function(_, v) {
      return blaze.Include(_, 'contentFor', {
        headerTitle: ''
      }, html.H1(_, {
        "class": 'title'
      }, v));
    },
    $btnBlock: function(v) {
      return {
        _button: '* *-block',
        id: v
      };
    },
    $mp: function(v) {
      return {
        margin: v,
        padding: v
      };
    },
    $tabItem: function(v) {
      return {
        "class": 'tab-item',
        href: v,
        dataIgnore: 'push'
      };
    },
    $box: function(a) {
      return {
        width: a[0],
        height: a[1]
      };
    },
    $subfooter: function(v) {
      return {
        _bar: '* *-standard *-footer-secondary',
        _: v
      };
    },
    $fixedTop: function(v) {
      return {
        position: 'fixed',
        top: v
      };
    },
    $fixedBottom: function(v) {
      return {
        position: 'fixed',
        bottom: v
      };
    },
    $photoCard: function(v) {
      return {
        background: 'white',
        borderRadius: 2,
        padding: v || '8px 6px',
        boxShadow: '1px 1px 5px 1px'
      };
    }
  };
}));

// typeof Meteor === "undefined" && (module.exports = c1)
