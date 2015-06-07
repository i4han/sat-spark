

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
      jade: ['+chosen', '+yield', '+nav']
      head: ["meta(name='viewport' content='width=device-width initial-scale=1.0, user-scalable=no')"]

   login:
      router: path: 'login'
      jade: 'button#facebook-login(class="btn btn-default")': 'login with facebook'
      onServerStartup: ->
         ServiceConfiguration.configurations.remove service: 'facebook'
         ServiceConfiguration.configurations.insert
            service: 'facebook'
            appId:  Settings.facebook.oauth.client_id
            secret: Settings.facebook.oauth.secret          
      events:
         'click #facebook-login': -> Meteor.loginWithFacebook()
         'click #logout': -> Meteor.logout()
   chat:
      router: path: 'chat'
      jade: 
         wrapper0:
            container0: 
               'each chats': line0: '{{text}}'
               photo0: 'img[#image0](src="{{photo}}")': ' '
            'input#[input0](type="text")': ''
      template: -> 
         wrapper0:
            container0:
               $add: img: {}
               $each: chats: _line: $v: 'text'
               IMG:  image0: src: $v: 'photo'
            INPUT:   input0: type: 'text'
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

   home: ->
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
            .switchClass 'back', 'front', 0, -> $('#photo-' + (i + 1)).css left: 0
            .after "<img id=photo-#{i + 1} class=\"back photo\" src=#{photo}.jpg>"
            .draggable axis: 'y'
            .on 'touchstart', (e) -> $front.switchClass 'front', 'touched', 100
            .on 'touchend',   (e) -> switch
               when e.target.y > pic_top + swipe then push(i + 1) and pass   $front
               when e.target.y < pic_top - swipe then push(i + 1) and choose $front
               else $front.switchClass 'touched', 'front', 100, ->  $front.animate top: pic_top, 100

      router: path: '/'
      jade: ['img(id="photo-0" class="back photo" src="spark0.jpg")']
      template: img: photo0: class: 'back photo', src: 'spark0.jpg'
      style:
         _photo: position: 'fixed', width: width, top: pic_top, background: 'white', overflow: 'hidden'
         _icon:    zIndex:  20, width: box, top: top, clip: 'rect(0px, 75px, 75px, 0px)'
         _front:   zIndex:  10, top: pic_top  
         _back:    zIndex: -10, left: width
         _touched: zIndex:  30, width: width - 1, background: 'white', borderRadius: 2, padding: '8px 6px', boxShadow: '1px 1px 5px 1px'
      collections: -> collections.call @
      fn: UserReady: -> push(0)

   cameraPage: ->
      uploadPhoto = (uri) ->
         (new FileTransfer()).upload uri, Settings.upload, ((r) -> console.log 'ok', r
         ), ((r) -> console.log 'err', r
         ), x.extend options = new FileUploadOptions(), o =
            fileKey:  'file'
            fileName: uri[uri.lastIndexOf('/') + 1..]
            mimeType: 'image/jpeg'
            chunkedMode: true

      upload = (url) -> resolveLocalFileSystemURL url, (entry) ->
         entry.file ((data) -> uploadPhoto l = data.localURL), (e) -> console.log e

      router: path: '/camera'
      jade:
         "header(class='bar bar-nav')": "h1(class='title')": 'Title'
         "img(id='camera-photo' style='width:100%;')": ''
      template: ->
         header: class: 'bar bar-nav', $: h1: class: 'title', $: 'Title'
         img: id: 'camera-photo', style: 'width:100%;'
      onRendered: -> 
         navigator.camera.getPicture ((uri) -> upload(uri)), (->), options =
            quality: 50
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType:    Camera.EncodingType.JPEG,
            sourceType:      Camera.PictureSourceType.PHOTOLIBRARY
      onServerStartup: ->
         Busboy = Npm.require 'busboy'
         fs     = Npm.require 'fs'
         Router.onBeforeAction (req, res, next) ->
            filenames = []
            if req.method is 'POST' # req.path? == '/upload'
               busboy = new Busboy headers: req.headers
               busboy.on 'file', (field, file, filename) ->
                  file.pipe fs.createWriteStream f = Settings.tmp_dir + filename
                  filenames.push f
               busboy.on 'field', (field, value) -> req.body[field] = value
               busboy.on 'finish', -> 
                  req.filenames = filenames
                  next()
               req.pipe busboy
            else next()
         Router.route('/upload', where: 'server').post ->
               @response.writeHead 200, 'Content-Type': 'text/plain'
               @response.end "ok"
 
   chosenbox:
      jade: '.chosen-container(id="chosen-{{id}}" style="left:{{left}}px;")': ['img(id="chosen-box-{{id}}")']
      style: _chosenContainer: position: 'fixed', zIndex: 200, top: top, border: 3, width: box, height: box, overflowY: 'hidden'

   chosen:
      jade: $chosen: 'each chosen': '+chosenbox': ''
      helpers: chosen: [0..4].map (i) -> id: i, left: box * i

   settings:
      router: path: 'setting'
      jade: h2: 'Settings'

   menu_list:
      jade: li: 'a.main-menu(id="menu-toggle-{{id}}" href="{{path}}"):': 'i.fa(class="fa-{{icon}} fa-lg")'
      helpers: path: -> ['/chat', '/camera', '/', '/setting'][@id]
      style: 
         '#main-menu ul li': display: 'inline-block', width: bottom * 1.5
         '.main-menu': display: 'inline-block', zIndex: 20, width: bottom * 1.5, color: 'white', padding: 6, textAlign: 'center'
         '.main-menu:hover': backgroundColor: 'rgba(255, 128, 128, 1)'
         '.main-menu:focus': backgroundColor: 'white'

   nav:
      jade: '#main-menu': ul: 'each menu': '+menu_list': ''
      helpers: menu: -> [{id:0, icon: 'comment'}, {id:1, icon: 'camera'},  {id:2, icon: 'bolt'}, {id:3, icon: 'gear'}]         
      style: 
         '#main-menu': position: 'fixed', zIndex: 20, left:0, bottom: 0, width: '100%', height: bottom, background: 'rgba(255, 0, 0, 1)'
         '#main-menu ul': listStyleType: 'none', margin: 0, marginLeft: 40


exports.Settings = ->
   local_ip = '192.168.1.78'
   app_dir  = '/Users/isaac/workspace/spark/'

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
         "ws://#{local_ip}/*"
         "http://#{local_ip}/*"
         'http://res.cloudinary.com/*'
         'mongodb://ds031922.mongolab.com/*']
   title: -> @app.info.name
   theme: "clean"
   lib:   "ui"
   tmp_dir: "#{app_dir}tmp/"
   public: 
      collections: {}
      image_url: "http://res.cloudinary.com/sparks/image/upload/"
      upload: "http://#{local_ip}:3000/upload"
   cloudinary:
      cloud_name: "sparks"
      api_key: process.env.CLOUDINARY_API_KEY
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
