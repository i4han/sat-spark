
exports.Settings = ->
   title: "Spark game"
   theme: "clean"
   lib:   "ui"
   public: 
      collections: {}
      image_url: "http://res.cloudinary.com/sparks/image/upload/"
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

collections = ->
   Users:
      publish: -> @Matches = db.Users.find gender: 'F', public_ids: {$exists: true}, location: $near: 
         $geometry: type: "Point", coordinates: [ -118.3096648, 34.0655627 ] 
         $maxDistance: 20000
         $minDistance: 0
      callback: -> 
         console.log 'callback', @
         window.Matches = db.Users.find({}).fetch()
         Session.set 'MatchLoaded', true
         Modules.home.fn.forward 1
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
               photo0: 'img#[image0](src="{{photo}}")': ' '
            'input#[input0](type="text")': ''
      helpers: 
         chats: -> db.Chats.find {}
         photo: -> "spark1.jpg"
      template: -> 
         wrapper0: [
            container0: [
               add 'img'
               each chats: _line: v 'text'
               photo0: IMG image0: src: v 'photo' ]
            INPUT input0: type: 'text' ]
      absurd:
         container0: position: 'fixed', bottom: bottom * 2
         _line:      display: 'block'
         input0:     position: 'fixed', bottom: bottom, width: width, height: bottom
         image0:     width: 'inherit'
         photo0:     position: 'fixed', bottom: bottom + 5, right: 5, width: 100
      events: ->
         'keypress #[input0]': (e) =>
            if e.keyCode == 13 and text = $(@id 'input0').val()
               $(@id 'input0').val ''
               Meteor.call 'says', 'isaac', text
      methods: says: (id, text) -> db.Chats.insert id: id, text: text
      collections: Chats: {}

   front_img:
      jade: "img(id='front-pic' src='{{src}}')"
      helpers: src: -> 
         if Session.get('front-pic-id') then Settings.image_url + Session.get('front-pic-id') + '.jpg' else 'spark1.jpg'

   back_img:
      jade: "img(id='back-pic'  src='{{src}}')"
      helpers: src: -> 
         if Session.get('back-pic-id' ) then Settings.image_url + Session.get('back-pic-id' ) + '.jpg' else 'spark2.jpg'

   home: ->
      setImage = (id, i) -> 
         Session.set 'img-id', id
         Session.set 'img-photo-id', Matches[i].public_ids[0]
      router: path: '/'
      jade: 
         front0: '+front_img': ''
         back0:  '+back_img': ''
      absurd: 
         front0: position: 'fixed', width: width, top: pic_top, height: pic_height, zIndex: 1000, background: 'white',  overflowY: 'hidden'
         back0:  position: 'fixed', width: width, top: pic_top, height: pic_height, zIndex: -100
         '#front-pic': width: 'inherit'
         '#back-pic':  width: 'inherit'
      onStartup: ->
         Session.set 'index', 1
         Session.set 'chosen-index', 0
      onRendered: -> 
         @fn.init()
         @Front.draggable(axis:'y').on 'touchend', ($e) =>
            if $e.target.y > pic_top + swipe
               @Front.animate top: '+=2500', 500, => @fn.forward Session.get('index') + 1
            else if $e.target.y < pic_top - swipe
               index = Session.get('index')
               chosen_index = Session.get('chosen-index')
               Session.set 'chosen-index', chosen_index + 1
               @Front.animate top: top, left: box * chosen_index, width: box, height: box, 500, =>
                  $('#chosen-box-' + chosen_index.toString()).removeAttr('src').attr 'src', @fn.getImage index
                  @fn.forward index + 1
            else
               @Front.animate top: pic_top, backgroundColor: 'white', 200
         @Front.on 'touchstart', ($e) => @Front.animate backgroundColor: 'transparent', 200
      collections: -> collections.call @
      fn: ->
         init: =>
            @Front or @Front = $ @id 'front0'
            @Back  or @Back  = $ @id 'back0'  
         getImage: (i) => 
            Settings.image_url + Matches[i].public_ids[0] + '.jpg?' + (new Date()).getTime()           
         forward: (i) =>
            @fn.init()
            @Front.hide()
            $('#front-pic').removeAttr('src').attr 'src', @fn.getImage i            
            $('#back-pic') .removeAttr('src').attr 'src', @fn.getImage i + 1
            x.timeout 100, => 
               @Front.css(top: pic_top, height: pic_height, left: 0, width: width, background: 'white').show()
               Session.set 'index', i
         urlPhoto: (i) => Settings.image_url + Matches[i].public_ids[0] + '.jpg'
         getPhoto: (s, url) =>
            console.log 'url', url
            HTTP.get url, (e, data) -> 
               console.log data
               Session.set s, data

   chosenbox:
      jade: '.chosen-container(id="chosen-{{id}}" style="left:{{left}}px;")': ['img(id="chosen-box-{{id}}")']
      absurd: _chosenContainer: position: 'fixed', zIndex: 200, top: top, border: 3, width: box, height: box, overflowY: 'hidden'

   chosen:
      jade: $chosen: 'each chosen': '+chosenbox': ''
      helpers: chosen: [0..4].map (i) -> id: i, left: box * i

   settings:
      router: path: 'setting'
      jade: h2: 'Settings'

   menu_list:
      jade: li: 'a.main-menu(id="menu-toggle-{{id}}" href="{{path}}"):': 'i.fa(class="fa-{{icon}}")'
      helpers: path: -> ['/chat', '/', '/setting'][@id]
      absurd: 
         '#main-menu ul li': display: 'inline-block', width: bottom * 1.5
         '.main-menu': display: 'inline-block', width: bottom * 1.5, color: 'white', padding: 12, textAlign: 'center'
         '.main-menu:hover': backgroundColor: 'rgba(255, 128, 128, 1)'
         '.main-menu:focus': backgroundColor: 'white'

   nav:
      jade: '#main-menu': ul: 'each menu': '+menu_list': ''
      helpers: menu: -> [{id:0, icon: 'comment'}, {id:1, icon: 'bolt'}, {id:2, icon: 'gear'}]         
      absurd: 
         '#main-menu': position: 'fixed', left:0, bottom: 0, width: '100%', height: bottom, background: 'rgba(255, 0, 0, 1)'
         '#main-menu ul': listStyleType: 'none', margin: 0, marginLeft: 40

#
