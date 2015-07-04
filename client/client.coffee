
global.cube = require 'cubesat' if !Meteor?

c1 = cube.Cube()

width  = 375
height = 667
box    = width / 5
top    = 22
bottom = 44
swipe  = 22
pic_top    = top + box
pic_height = height - (pic_top + bottom)


c1.add cube.Module('layout'
).template(->
   cube.Head @,
      html.META @,
         name:    'viewport'
         content: 'width=device-width initial-scale=1.0, user-scalable=no'
   html.TITLE @, Sat.setting.public.title
   ionic.Body @,
      ionic.NavBar  @, class: 'bar-royal'
      ionic.NavView @, blaze.Include @, 'yield'
      blaze.Include @, 'tabs'
).onStartup(->
   console.log 'FB', FB
   FB.init appId: Sat.setting.public.fbAppId, xfbml: false, version: 'v2.3', status: true
   style$('.bar-subfooter').set bottom:48, height: 62
   #style$('.range input::-webkit-slider-thumb::after')
   #   .set backgroundColor: '#387ef5', left: 28, width: 1000, top: 13, padding: 0, height: 2

).close()


c1.add cube.Module('tabs'
).template(->
   ionic.Tabs @, _tabs: '*-icon-top',
      blaze.Each   @, 'tabs', =>
         ionic.Tab @, title: '{label}', path: '{name}', iconOff: '{icon}', iconOn: '{icon}'
).helpers(->
   tabs: -> 'chat camera spark settings profile'.split(' ').map (a) -> Sat.module[a].property
).close()


c1.add cube.Module('profile'
).properties(->
   icon: 'person'
   path: 'profile'
).template(-> [
   part.title    @, 'Profiles'
   ionic.Content @,
      ionic.List @, class: 'profile',
         blaze.Each    @, 'items', =>
            ionic.Item @, buttonRight: true,
               html.H2 @, 'title {title} content &#123; &#125; {content} works!'
               html.P  @, cube.viewLookup @, 'content'
               html.BUTTON   @, _button: '* *-positive',
                  ionic.Icon @, icon: 'ios-telephone'
   ionic.SubfooterBar @,
      html.BUTTON     @, $btnBlock: 'facebook', 'login with facebook'
   ]
).helpers(->
   items: -> [
      {title:'hello', content:'world6'}
      {title:'hello1', content:'world1'}
      {title:'hello2', content:'world2'}
      {title:'hello3', content:'world3'}
   ]
   token: -> facebookConnectPlugin.getAccessToken ((token) -> Session.set 'fbToken', token), (->)
).events(-> 'touchend #facebook': -> # api(graphPath, permissions, s, f) getLoginStatus logEvent name, params, valueToSum logPurchase logout showDialog options
   facebookConnectPlugin.login ['publish_actions'], (->
      facebookConnectPlugin.getAccessToken ((token) ->
         Session.set 'fbToken', token
      ), (e) -> console.log 'Token fail', e
      facebookConnectPlugin.api 'me', ['public_profile'], ((data) ->
         Session.set 'fbProfile', data
      ), (e) -> console.log 'API fail', e
      facebookConnectPlugin.getLoginStatus ((data) ->
         console.log data
      ), (e) -> console.log 'Login Status fail', e
   ), (e) ->
      console.log 'Login fail', e
      facebookConnectPlugin.api 'me', ['public_profile'], ((data) ->
         console.log 'fb Profile get', data
         Session.set 'fbProfile', data
      ), (e) -> console.log 'API fail', e
      facebookConnectPlugin.getLoginStatus ((data) ->
         console.log data
      ), (e) -> console.log 'Login Status fail', e
).close('profile')


c1.add cube.Module('settings'
).properties(->
   icon: 'gear-a'
   path: 'settings'
).template(-> [
   part.title @, 'Settings'
   ionic.Content @, ionic.List @,
      ionic.Divider    @, 'General'
      ionic.ItemToggle @, 'Online', 'hello'
      ionic.Divider    @, 'Search'
      ionic.ItemRange  @, 'Distance', name: 'distance', min: '0',  max: '200', value: '33', '0', '50 mi'
      ionic.ItemList  @, 'Age',
         ionic.Range  @, name: 'age', local: 'agefrom', min: '18', max: '80',  value: '25', '18', '80'
         ionic.Range  @, name: 'age', local: 'ageto', min: '18', max: '80',  value: '25', '18', '80'
      ionic.ItemSelect @, 'Language', 'Korean', ['English', 'Spanish', 'Chinese', 'Korean', 'Japanese']
      ionic.ItemSelect @, 'Search for', 'woman', ['woman', 'man', 'both']
      ionic.Divider    @, 'Notification'
      ionic.ItemToggle @, 'New matches', 'new-matches'
      ionic.ItemToggle @, 'Messages',    'message'
   ionic.SubfooterBar  @,
      html.BUTTON @, $btnBlock: 'logout', 'logout'
   ]
).styles(->
   'local_agefrom::-webkit-slider-thumb::after': backgroundColor: '#387ef5', left: 28, width: 1000, top: 13, padding: 0, height: 3
   'local_agefrom::-webkit-slider-thumb::before': height: 0
   'local_ageto::-webkit-slider-thumb::before':   height: 2.0
).helpers(->
   go: -> Session.get 'go'
   login: -> Session.get 'loginStatus'
).events(->
   'touchend #logout': -> facebookConnectPlugin.logout (->
         Router.go 'profile'
      ), (e) -> console.log 'logout error', e
   'change #hello': (evnt) -> console.log evnt
).onCreated(->
   _ = __.module @
   _.style$ageFrom = style$(_.local('#agefrom') + '::-webkit-slider-thumb::after')
   _.style$ageTo   = style$(_.local('#ageto')   + '::-webkit-slider-thumb::before')
).onRendered(->
   _ = __.module @
   _.unit = (_.$('#agefrom').width() - 28) / (80 - 18)
   _.$('#agefrom').on 'input', (evt) =>
      if (val = evt.target.value) > (toVal = ($ageTo = _.$ '#ageto').val()) then $ageTo.val(val)
      else _.rangeSync val, toVal
   _.$('#ageto'  ).on 'input', (evt) =>
      if (val = evt.target.value) < (fromVal = ($ageFrom = _.$ '#agefrom').val()) then $ageFrom.val(val)
      else _.rangeSync fromVal, val

   FB.getLoginStatus (res) -> if res.status is 'connected' then console.log 'logged in' else FB.login()
   #facebookConnectPlugin.getLoginStatus ((o)->
   #   Session.set 'loginStatus', o
   #   console.log 'loginStatus', o
   #), (f) -> console.log 'loginStatus Error', f
).fn(
   rangeSync: (from, to) ->
      @style$ageFrom.set width: (to - from - 1) * @unit
      @style$ageTo  .set width: width = (to - from - 1) * @unit, left: -width
).close('settings')


c1.add cube.Module('facebook'
).template(-> '').close()


c1.add cube.Module('abc').template(-> html.P @, 'ABC').close()
c1.add cube.Module('def').template(-> html.P @, 'DEF').close()

c1.add cube.Module('chat'
).properties(->
   icon: 'chatbubbles'
   path: 'chat'
   hash: '0fc7da9b30f3e2c7'
).template(-> [
   part.title  @, 'Chat'
   html.DIV    @, class: 'content',
      html.DIV @, class: 'content-padded', local: 'chat',
         blaze.Each   @, 'chats', =>
            html.DIV  @, id: '{id}', _chat: '* *-{side}', '{text}'
   ionic.SubfooterBar @, html.INPUT @, local: 'input0', type: 'text'
   ]
).styles(->
   _chat:     display: 'block'
   _chatMe:   color: 'black'
   _chatYou:  marginLeft: 20
   _chatRead: color: 'black'
   local_chat:    $fixedBottom: bottom * 2 + 10
   local_input0:  $box: ['100%', 33], $mp:0, border: 0
).helpers(->
   chats: -> db.Chats.find {}
   side:  -> 'me'
).events(->
   'keypress {local #input0}': (e) =>
      if e.keyCode == 13 and text = (Jinput = $(@local '#input0')).val()
         Jinput.val ''
         Meteor.call 'says', 'isaac', text
).close('chat')


c1.add cube.Module('chosen'
).template(->
   html.DIV @, class: 'chosen',
      blaze.Each @, 'chosen', =>
         html.DIV @, _chosen: '*-container', id: "chosen-{id}",
            html.IMG @, id: "chosen-box-{id}", width: box, src: Session.get('chosen-box-' + cube.lookup @, 'id')
            console.log cube.lookup @, 'id'
).styles(->
   _chosen: display: 'flex', flexDirection: 'row', $box: ['100%', box]
   _chosenContainer: flexGrow: 1, float: 'left', $box: [box, box], zIndex: 200,  border: 3, overflowY: 'hidden'
).helpers(-> chosen: [0..4].map (i) -> id: i
).close()

do ->
   icon_index = 0
   index = 0
   next     = -> console.log 'next'
   setImage = (id, i) -> Session.set 'img-photo-id', Matches[i].public_ids[0]
   pass     = (J) -> J.animate top: '+=1000', 600, -> J.remove() ; next()
   touchStart = (e) -> $(e.target).switchClass 'photo-front', 'photo-touched', 100
   touchEnd   = (e) -> switch
      when e.target.y > pic_top + swipe then push() and pass   $(e.target)
      when e.target.y < pic_top - swipe then push() and choose $(e.target)
      else $(e.target).switchClass 'photo-touched', 'photo-front', 100, ->  $(e.target).animate top: box, 100

   choose = (J) ->
      iconTop = $('.chosen').offset().top
      console.log 'choose', icon_index, box, box * icon_index
      J.animate top: 0, width: box, left:box * icon_index, clip: 'rect(0px, 75px, 75px, 0px)', 500, ->
         J.switchClass 'photo-touched', 'photo-icon', 300
         Session.set 'chosen-box-' + icon_index++, J.attr 'src'
         J.remove()
         next()

   push = =>
      Jfront = $ '#photo-' + ++index
      Jfront
         .switchClass('photo-back', 'photo-front', 0, -> $('#photo-' + (index + 1)).css left: 0)
         .after(HTML.toHTML html.IMG @, id:'photo-' + (index + 1), _photo: '* *-back', src: @photoUrl index + 1)
         .draggable(axis: 'y')
         .on('touchstart', touchStart)
         .on('touchend',   touchEnd)

   c1.add cube.Module('spark',
   ).properties(->
      path: '/'
      icon: 'flash'
   ).template(-> [
      part.title  @, 'Spark'
      ionic.Content @,
         blaze.Include @, 'chosen'
         html.IMG @, _photo: '* *-front', id: 'photo-' +  Session.get('index'),       src: Session.get 'photo-front'
         html.IMG @, _photo: '* *-back',  id: 'photo-' + (Session.get('index') + 1),  src: Session.get 'photo-back'
      ]
   ).onRendered(->
         $('#photo-' + index = Session.get 'index').draggable(axis: 'y')
            .on('touchstart', touchStart)
            .on('touchend',   touchEnd)
   ).onDestroyed(->
         Session.set 'index', index
         Session.set 'photo-front', $('.photo-front').attr 'src'
         Session.set 'photo-back',  $('.photo-back' ).attr 'src'
   ).styles(->
         _photo:        width: width, background: 'white', overflow: 'hidden'
         _photoIcon:    zIndex:  20, width: box, top: top, clip: 'rect(0px, 75px, 75px, 0px)'
         _photoFront:   zIndex:  10, position: 'absolute'
         _photoBack:    zIndex: -10, position: 'absolute'
         _photoTouched: zIndex:  1000, position: 'absolute', width: width - 1, $photoCard: ''
   ).close('spark')

do ->
   uploadPhoto = (uri) ->
      (ft = new FileTransfer()).upload uri, Settings.upload, ((r) -> console.log 'ok', r
      ), ((r) -> console.log 'err', r
      ), __.assign options = new FileUploadOptions(), o =
         fileKey:  'file'
         fileName: uri[uri.lastIndexOf('/') + 1..]
         mimeType: 'image/jpeg'
         chunkedMode: true
         params: id: 'isaac'             #ft.onprogress (r) -> console.log r
   upload = (url) ->
      resolveLocalFileSystemURL url, ((entry) ->
         entry.file ((data) -> console.log('data', data) or uploadPhoto l = data.localURL), (e) -> console.log e
      ), (e) -> console.log 'resolve err', e

   c1.add cube.Module('camera'
   ).properties(->
      icon: 'camera'
      path: 'camera'
   ).template(-> [
         part.title @, 'Camera'
         html.IMG   @, id: 'camera-photo', style: 'width:100%;'
      ]
   ).onRendered(->
      navigator.camera.getPicture ((uri) -> upload(uri)), (->), options =
         quality: 90
         cameraDirection: Camera.Direction.FRONT
         destinationType: Camera.DestinationType.FILE_URI
         encodingType:    Camera.EncodingType.JPEG
         sourceType:      Camera.PictureSourceType.CAMERA
         #PHOTOLIBRARY #saveToPhotoAlbum: false #allowEdit: true <- doesn't work.
   ).close('camera')



c1.add cube.Parts ->
   title:        (_, v) -> blaze.Include _, 'contentFor', headerTitle: '', html.H1 _, class: 'title', v
   $btnBlock:    (v) -> _button: '* *-block', id: v
   $mp:          (v) -> margin: v, padding: v
   $tabItem:     (v) -> class: 'tab-item', href: v, dataIgnore: 'push'
   $box:         (a) -> width: a[0], height: a[1]
   $subfooter:   (v) -> _bar: '* *-standard *-footer-secondary', _: v
   $fixedTop:    (v) -> position: 'fixed', top: v
   $fixedBottom: (v) -> position: 'fixed', bottom: v
   $photoCard:   (v) -> background: 'white', borderRadius: 2, padding: v or '8px 6px', boxShadow: '1px 1px 5px 1px'


module.exports = c1 if !Meteor?

###


         html.P     @, id: 'hw',  'hello world!'
         blaze.If   @, 'go',
            => html.P @, 'ok go'
            => html.P @, 'oops. no go'
         cube.Switch  @,
            Session.get('a') is 1, => html.P @, 'alpha'
            Session.get('a') is 2, => html.P @, 'beta', '{login}'
            Session.get('a') is 3, => blaze.Include @, Session.get('b') or 'abc'
            Session.get('a') is 4, => html.P @, 'delta'
            => html.P @, 'somthing else'

style$('.range input::-webkit-slider-thumb::after')
   .set backgroundColor: '#387ef5', left: 28, width: 1000, top: 13, padding: 0, height: 2
style$('.range input::-webkit-slider-thumb::after').set('left', '28px')
style$('.range input::-webkit-slider-thumb::after').set('width', '1000px')
style$('.range input::-webkit-slider-thumb::after').set('top', '13px')
style$('.range input::-webkit-slider-thumb::after').set('padding', '0')
style$('.range input::-webkit-slider-thumb::after').set('height', '2px')


###
