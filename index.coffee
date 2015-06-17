

collections = ->
   Users:
      publish: -> @Matches = db.Users.find gender: 'F', public_ids: {$exists: true}, location: $near: 
         $geometry: type: "Point", coordinates: [ -118.3096648, 34.0655627 ] 
         $maxDistance: 20000
         $minDistance: 0
      callback: -> 
         window.Matches = db.Users.find({}).fetch()
         @UserReady()
      collections:
         "fs.files":
            publish:  -> @Files = db["fs.files"].find _id: $in: @Matches.fetch().reduce ((o, a) -> o.concat a.photo_ids), []
            callback: -> @Files = db['fs.files'].find({}).fetch()                            
            collections:
               "fs.chunks":
                  publish:  -> db["fs.chunks"].find files_id: $in: @Files.fetch().map (a) -> a._id
                  callback: -> @Chunks = db['fs.chunks'].find({}).fetch()

exports.Parts = ->
   $header:      (t) -> HEADER _bar: '* *-nav', _: H1 _title: _: t
   $_header:     (t) -> DIV _bar: '* *-header *-light', H1 class: 'title', t
   $btnBlock:    (v) -> _btn: '* *-block', id: v
   $v:           (v) -> '|': v
   $mp:          (v) -> margin: v, padding: v
   $box:         (a) -> width: a[0], height: a[1]
   $fixedTop:    (v) -> position: 'fixed', top: v
   $fixedBottom: (v) -> position: 'fixed', bottom: v
   $photoCard:   (v) -> background: 'white', borderRadius: 2, padding: v or '8px 6px', boxShadow: '1px 1px 5px 1px'

exports.Modules = ->
   width  = 375
   height = 667
   box    = width / 5
   top    = 22
   bottom = 44
   swipe  = 22
   pic_top    = top + box
   pic_height = height - (pic_top + bottom)

   layout: ->
      template: -> include 'yield', 'tabBar'
      head: -> [
         META  name:'viewport', content:'width=device-width initial-scale=1.0, user-scalable=no'
         TITLE Settings.title ]

   tab: ->       
      template: -> A _tabItem: href: '{path}', dataIgnore: 'push', SPAN(@) s0: {_icon: '* *-{icon}'}, s1: _tabLabel: _: '{label}'
      helpers: x.reduce ['path', 'icon', 'label'], {}, (o, v) -> x.object o, v, -> Modules[@][v]
   _tab: ->       
      template: -> A _tabItem: href: '{path}', [I(_icon: '* ion-{icon}'), $v: '{label}']
      helpers: x.reduce ['path', 'icon', 'label'], {}, (o, v) -> x.object o, v, -> Modules[@][v]

   tabBar:
      template: -> NAV _bar: '* *-tab', each menu: include 'tab'
      helpers: menu: -> 'chat camera spark settings login'.split(' ')
   _tabBar:
      template: -> DIV _tabs: '* *-icon-top', each menu: include 'tab'
      helpers: menu: -> 'chat camera spark settings login'.split(' ')

   login: ->
      fbLogin = -> facebookConnectPlugin.login ["public_profile"], (-> console.log 'fb connected'), (->)

      icon: 'person'
      path: '/login'         
      template: -> [ 
         $header: 'Login'
         NAV(@) b0: _bar: '* *-standard *-footer-secondary', BUTTON $btnBlock: 'facebook', 'login with facebook' ]
      style: b0: bottom: 70
      helpers: -> token: -> facebookConnectPlugin.getAccessToken ((token) -> Session.set 'fbToken', token), (->)
      events: 'touchend #facebook': -> console.log('touch') or fbLogin()

   chat:
      icon: 'compose'
      path: '/chat'
      template: -> [
         $header: 'Chat'
         _content: _contentPadded: each chats: DIV id: '{id}', _chat: '* *-{side}', '{text}'
         NAV _bar: '* *-standard *-footer-secondary', INPUT(@) input0: type: 'text' ]
      style:
         _contentPadded: $fixedBottom: bottom * 2
         _chat:     display: 'block'
         _chatMe:   color: 'black'
         _chatYou:  marginLeft: 20
         _chatRead: color: 'grey' 
         input0:    $fixedBottom: bottom, $box: ['100%', bottom], $mp:0, border: 0
      helpers: chats: -> db.Chats.find {}
      events: ->
         'keypress [#input0]': (e) =>
            if e.keyCode == 13 and text = (Jinput = $(@Id '#input0')).val()
               Jinput.val ''
               Meteor.call 'says', 'isaac', text
      methods: says: (id, text) -> db.Chats.insert id: id, text: text
      collections: Chats: {}

   spark: ->
      @Matches = []
      icon_index = 0
      setImage = (id, i) -> Session.set 'img-photo-id', Matches[i].public_ids[0]
      pass   = (J) -> J.animate top: '+=1000', 600, -> J.remove()
      choose = (J) -> J.animate top: top, width: box, left: box * icon_index++, clip: 'rect(0px, 75px, 75px, 0px)', 500, -> J.switchClass 'photo-touched', 'icon', 300
      push   = (i) =>
         loaded = true
         Jfront = $('#photo-' + i)
         photo = Settings.image_url + Matches[i].public_ids[0]
         Jfront
            .switchClass 'photo-back', 'photo-front', 0, -> $('#photo-' + (i + 1)).css left: 0
            .after "<img id=photo-#{i + 1} class=\"photo-back photo\" src=#{photo}.jpg>"
            .draggable axis: 'y'
            .on 'touchstart', (e) -> Jfront.switchClass 'photo-front', 'photo-touched', 100
            .on 'touchend',   (e) -> switch
               when e.target.y > pic_top + swipe then push(i + 1) and pass   Jfront
               when e.target.y < pic_top - swipe then push(i + 1) and choose Jfront
               else Jfront.switchClass 'photo-touched', 'photo-front', 100, ->  Jfront.animate top: pic_top, 100

      icon: 'star'
      path: '/'
      template: -> [
         $header: 'Spark'
         _content: IMG _photo: '* *-back', id: 'photo-0', src: 'spark0.jpg']
      style:
         _photo:        $fixedTop: pic_top, width: width, background: 'white', overflow: 'hidden'
         _icon:         zIndex:  20, width: box, top: top, clip: 'rect(0px, 75px, 75px, 0px)'
         _photoFront:   zIndex:  10, top: pic_top  
         _photoBack:    zIndex: -10, left: width
         _photoTouched: zIndex:  30, width: width - 1, $photoCard: ''
      collections: -> collections.call @
      fn: UserReady: -> push(0)

   camera: ->
      uploadPhoto = (uri) ->
         (ft = new FileTransfer()).upload uri, Settings.upload, ((r) -> console.log 'ok', r
         ), ((r) -> console.log 'err', r
         ), x.assign options = new FileUploadOptions(), o =
            fileKey:  'file'
            fileName: uri[uri.lastIndexOf('/') + 1..]
            mimeType: 'image/jpeg'
            chunkedMode: true
            params: id: 'isaac'             #ft.onprogress (r) -> console.log r
      upload = (url) -> 
         resolveLocalFileSystemURL url, ((entry) ->
            entry.file ((data) -> console.log('data', data) or uploadPhoto l = data.localURL), (e) -> console.log e
         ), (e) -> console.log 'resolve err', e

      icon: 'info'
      path: '/camera'
      template: -> [
         $header: 'Camera'
         IMG    id: 'camera-photo', style: 'width:100%;' ]         
      onRendered: -> 
         navigator.camera.getPicture ((uri) -> upload(uri)), (->), options =
            quality: 90
            cameraDirection: Camera.Direction.FRONT
            destinationType: Camera.DestinationType.FILE_URI
            encodingType:    Camera.EncodingType.JPEG           
            sourceType:      Camera.PictureSourceType.CAMERA #PHOTOLIBRARY #saveToPhotoAlbum: false #allowEdit: true <- doesn't work. 

      onServer: ->
         fs     = Npm.require 'fs'
         Busboy = x.require 'busboy'
         cloud  = x.require 'cloudinary'
         _ = Settings.cloudinary
         cloud.config cloud_name: _.cloud_name, api_key: _.api_key, api_secret: _.api_secret
         Router.onBeforeAction (req, res, next) ->
            filenames = []
            if req.url is '/upload' and req.method is 'POST'
               busboy = new Busboy headers: req.headers
               busboy.on('file', (field, file, filename) ->
                     console.log 'param', req
                     file.pipe cloud.uploader.upload_stream (r) -> console.log 'stream', r, req.body.id
                     filenames.push filename)
               busboy.on 'finish', -> 
                  req.filenames = filenames
                  next()
               busboy.on 'field', (field, value) -> req.body[field] = value
               req.pipe busboy
            else next()
         Router.route('/upload', where: 'server').post ->
            @response.writeHead 200, 'Content-Type': 'text/plain'
            @response.end "ok"
 
   chosenbox:
      template: -> _chosenContainer: id: "chosen-{id}", style:"left:{left}px;", _: IMG id: "chosen-box-{id}"
      style: _chosenContainer: $fixedTop: top, $box: [box, box], zIndex: 200,  border: 3, overflowY: 'hidden'

   chosen:
      template: -> '#chosen': each chosen: include 'chosenbox'
      helpers: chosen: [0..4].map (i) -> id: i, left: box * i

   settings: icon: 'gear', path: '/setting', template: -> [ $header: 'Settings', H2 'Settings' ]


exports.Settings = ->
   local_ip = '192.168.1.78'
   deploy_domain = 'spark5.meteor.com'

   app:
      info:
         id: 'com.spark.game'
         name: 'Spark game'
         description: 'Spark game long name.'
         website: 'http://sparkgame.com'
      icons:
         iphone:    'resources/icons/icon-60x60.png'
         iphone_2x: 'resources/icons/icon-60x60@2x.png'
      setPreference:
         BackgroundColor: '0xff0000ff'
         HideKeyboardFormAccessoryBar: true
      configurePlugin:
         'com.phonegap.plugins.facebookconnect':
            APP_NAME: 'spark-game-test'
            APP_ID:  process.env.FACEBOOK_CLIENT_ID
            API_KEY: process.env.FACEBOOK_SECRET
      accessRule: [
         'http://localhost/*'
         'http://meteor.local/*'
         "http://#{local_ip}/*"
         "ws://#{local_ip}/*"
         "http://#{deploy_domain}/*"
         "ws://#{deploy_domain}/*"
         'http://res.cloudinary.com/*'
         'mongodb://ds031922.mongolab.com/*']
   deploy:
      name: 'spark5' #sparkgame spark[1-5]
      mobileServer: 'http://spark5.meteor.com'

   title: -> @app.info.name
   theme: "clean"
   lib:   "ui"
   env:
      production:
         MONGO_URL: process.env.MONGO_URL
   npm:
      busboy:     "0.2.9"
      cloudinary: "1.2.1"
   public: 
      collections: {}
      image_url: "http://res.cloudinary.com/sparks/image/upload/"
      upload: "http://#{local_ip}:3000/upload"
   cloudinary:
      cloud_name: "sparks"
      api_key:    process.env.CLOUDINARY_API_KEY
      api_secret: process.env.CLOUDINARY_API_SECRET
   facebook:
      oauth:
         version: 'v2.3'
         url: "https://www.facebook.com/dialog/oauth"
         options:
            query:
               client_id: process.env.FACEBOOK_CLIENT_ID 
               redirect_uri: 'http://localhost:3000/home'
         secret:    process.env.FACEBOOK_SECRET 
         client_id: process.env.FACEBOOK_CLIENT_ID 

#
