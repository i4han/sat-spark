

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

exports.Modules = ->
   width  = 375
   height = 667
   box    = width / 5
   top    = 22
   bottom = 44
   swipe  = 22
   pic_top    = top + box
   pic_height = height - (pic_top + bottom)
   
   layout: 
      template: -> include 'yield', 'tabBar'  
      head: -> [ 
         META  name:'viewport', content:'width=device-width initial-scale=1.0, user-scalable=no'
         TITLE Settings.title ]
   tab:
      template: ->
         A _tabItem: href: '{link}', $: @SPAN s0: {_icon: '{icon}'}, s1: _tabLabel: $: '{label}'

   tabBar:
      template: -> NAV _bar: 'tab', $: each menu: include 'tab'
      helpers:
         menu: -> [
            {label: 'chat',      icon: 'play',   link: '/chat'    }
            {label: 'camera',    icon: 'info',   link: '/camera'  }
            {label: 'spark',     icon: 'star',   link: '/spark'   }
            {label: 'profile',   icon: 'person', link: '/login'   }
            {label: 'settings',  icon: 'gear',   link: '/setting' } ]

   header: template: -> HEADER _bar: 'nav', $: H1 _title: $: '{title}' 

   login: ->
      fbLogin = -> 
         facebookConnectPlugin.login ["public_profile"], (->
            console.log 'fb connected'
         ), (->)

      router: path: 'login'         
      template: -> [ #add header: title: 'Login'
         include header: title: 'Login'
         NAV _bar: 'standard header-secondary', $: BUTTON _btn: 'block', $: 'ok'
         NAV _bar: 'standard footer-secondary', $: BUTTON _btn: 'block', id: 'facebook', $: 'login with facebook' ]
      helpers: ->
         token: ->
            facebookConnectPlugin.getAccessToken ((token) ->
               Session.set 'fbToken', token
            ), (->)         
      events:
         'touchend #facebook': -> console.log('touch') or fbLogin()

   chat:
      router: path: 'chat'
      template: -> [
         include header: title: 'Login'
         wrapper0: [
            container0: [
               each chats: line0: '{text}'
               @IMG image0: src: '{photo}' ]
            @INPUT input0: type: 'text' ]]
      style:
         container0: position: 'fixed', bottom: bottom * 2
         _line:      display: 'block'
         input0:     position: 'fixed', bottom: bottom, width: width, height: bottom
         image0:     width: 'inherit'
         photo0:     position: 'fixed', bottom: bottom + 5, right: 5, width: 100
      helpers: 
         chats: -> db.Chats.find {}
         photo: -> "spark1.jpg"
      events: ->
         'keypress [#input0]': (e) =>
            if e.keyCode == 13 and text = ($input = $(@Id '#input0')).val()
               $input.val ''
               Meteor.call 'says', 'isaac', text
      methods: says: (id, text) -> db.Chats.insert id: id, text: text
      collections: Chats: {}

   spark: ->
      @Matches = []
      icon_index = 0
      setImage = (id, i) -> Session.set 'img-photo-id', Matches[i].public_ids[0] # Settings.image_url 'data:image/gif;base64,'
      pass   = ($s) -> $s.animate top: '+=1000', 600, -> $s.remove()
      choose = ($s) -> $s.animate top: top, width: box, left: box * icon_index++, clip: 'rect(0px, 75px, 75px, 0px)', 500, -> $s.switchClass 'touched', 'icon', 300
      push   = (i) =>
         loaded = true
         $front = $('#photo-' + i)
         photo = Settings.image_url + Matches[i].public_ids[0]
         $front
            .switchClass 'photo-back', 'photo-front', 0, -> $('#photo-' + (i + 1)).css left: 0
            .after "<img id=photo-#{i + 1} class=\"photo-back photo\" src=#{photo}.jpg>"
            .draggable axis: 'y'
            .on 'touchstart', (e) -> $front.switchClass 'photo-front', 'touched', 100
            .on 'touchend',   (e) -> switch
               when e.target.y > pic_top + swipe then push(i + 1) and pass   $front
               when e.target.y < pic_top - swipe then push(i + 1) and choose $front
               else $front.switchClass 'touched', 'photo-front', 100, ->  $front.animate top: pic_top, 100

      router: path: '/spark'
      template: -> IMG _photo: 'back', id: 'photo-0', src: 'spark0.jpg'
      style:
         _photo:      position: 'fixed', width: width, top: pic_top, background: 'white', overflow: 'hidden'
         _icon:       zIndex:  20, width: box, top: top, clip: 'rect(0px, 75px, 75px, 0px)'
         _photoFront: zIndex:  10, top: pic_top  
         _photoBack:  zIndex: -10, left: width
         _touched:    zIndex:  30, width: width - 1, background: 'white', borderRadius: 2, padding: '8px 6px', boxShadow: '1px 1px 5px 1px'
      collections: -> collections.call @
      fn: UserReady: -> push(0)

   cameraPage: ->
      uploadPhoto = (uri) ->
         (ft = new FileTransfer()).upload uri, Settings.upload, ((r) -> console.log 'ok', r
         ), ((r) -> console.log 'err', r
         ), x.assign options = new FileUploadOptions(), o =
            fileKey:  'file'
            fileName: uri[uri.lastIndexOf('/') + 1..]
            mimeType: 'image/jpeg'
            chunkedMode: true
            params: id: 'isaac'
         #ft.onprogress (r) -> console.log r
      upload = (url) -> 
         resolveLocalFileSystemURL url, ((entry) ->
            entry.file ((data) -> console.log('data', data) or uploadPhoto l = data.localURL), (e) -> console.log e
         ), (e) -> console.log 'resolve err', e

      router: path: '/camera'
      template: -> [
         include header: title: 'Camera'
         IMG    id: 'camera-photo', style: 'width:100%;' ]         
      onRendered: -> 
         navigator.camera.getPicture ((uri) -> upload(uri)), (->), options =
            quality: 90
            cameraDirection: Camera.Direction.FRONT
            destinationType: Camera.DestinationType.FILE_URI
            encodingType:    Camera.EncodingType.JPEG           
            sourceType:      Camera.PictureSourceType.CAMERA #PHOTOLIBRARY #saveToPhotoAlbum: false #allowEdit: true <- doesn't work. 

      onServerStartup: ->
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
                     file.pipe cloud.uploader.upload_stream (r) -> 
                        console.log 'stream', r, req.body.id
                     filenames.push filename)
               busboy.on 'finish', -> 
                  console.log 'finish'
                  req.filenames = filenames
                  next()
               busboy.on 'field', (field, value) -> console.log('field') or req.body[field] = value
               req.pipe busboy
            else next()
         Router.route('/upload', where: 'server').post ->
            @response.writeHead 200, 'Content-Type': 'text/plain'
            @response.end "ok"
 
   chosenbox:
      template: -> _chosenContainer: id: "chosen-{id}", style:"left:{left}px;", $: IMG id: "chosen-box-{id}"
      style: _chosenContainer: position: 'fixed', zIndex: 200, top: top, border: 3, width: box, height: box, overflowY: 'hidden'

   chosen:
      jade: '#chosen': 'each chosen': '+chosenbox': ''
      helpers: chosen: [0..4].map (i) -> id: i, left: box * i

   settings:
      router: path: 'setting'
      template: -> [
         include header: title: 'Settings'
         H2 'Settings' ]


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
   npmReset: false
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
