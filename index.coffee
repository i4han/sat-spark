
global.cube = require 'cubesat' if !Meteor?

s1 = cube.Cube()


s1.add cube.Module('chat'
).methods(->
   says: (id, text) -> db.Chats.insert id: id, text: text
).collections( Chats: {}
).close()


s1.add cube.Module('spark'
).collections(->
   Users:
      publish: -> @Matches = db.Users.find gender: 'F', public_ids: {$exists: true}, location: $near:
         $geometry: type: "Point", coordinates: [ -118.3096648, 34.0655627 ]
         $maxDistance: 20000
         $minDistance: 0
      callback: ->
         window.Matches = db.Users.find({}).fetch()
         Session.set 'index', 0
         Session.set 'photo-front', @photoUrl 0
         Session.set 'photo-back',  @photoUrl 1
      collections:
         "fs.files":
            publish:  -> @Files = db["fs.files"].find _id: $in: @Matches.fetch().reduce ((o, a) -> o.concat a.photo_ids), []
            callback: -> @Files = db['fs.files'].find({}).fetch()
            collections:
               "fs.chunks":
                  publish:  -> db["fs.chunks"].find files_id: $in: @Files.fetch().map (a) -> a._id
                  callback: -> @Chunks = db['fs.chunks'].find({}).fetch()
).fn(
   photoUrl: (i, j=0) -> Sat.setting.public.image_url + (@Matches or Matches)[i].public_ids[j] + '.jpg'
).close('spark')


s1.add cube.Module('camera'
).onServer(->
   fs     = Npm.require 'fs'
   Busboy = Spark.require 'busboy'
   cloud  = Spark.require 'cloudinary'
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
).close()


s1.add cube.Settings ->
   local_ip      = '192.168.1.73'
   deploy_domain = 'spark5.meteor.com'

   app:
      info:
         id: 'com.spark.game'
         name: -> @title
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
         "http://localhost/*"
         "http://meteor.local/*"
         "http://#{local_ip}/*"
         "http://connect.facebook.net/*"
         "http://*.facebook.com/*"
         "https://*.facebook.com/*"
         "ws://#{local_ip}/*"
         "http://#{deploy_domain}/*"
         "ws://#{deploy_domain}/*"
         "http://res.cloudinary.com/*"
         "mongodb://ds031922.mongolab.com/*"]
   deploy:
      name: deploy_domain.split('.')[0] #sparkgame spark[1-5]
      mobileServer: "http://#{deploy_domain}"

   cubesat:
      version: '0.5.0'

   title: "Spark Game"
   theme: "clean"
   lib:   "ui"
   env:
      production:
         MONGO_URL: process.env.MONGO_URL
   npm:
      busboy:     "0.2.9"
      cloudinary: "1.2.1"
   public:
      title: -> @title
      fbAppId: -> process.env.FACEBOOK_CLIENT_ID
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

module.exports = s1 if !Meteor?
