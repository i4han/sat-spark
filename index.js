
if ('undefined' === typeof Meteor) {
    require('cubesat')
} else module = {}              // module = {} in settings.js cubesat package didn't work.


module.exports = __.Cube().add(

  __.Module('chat').methods(() => ({
      says: (id, text) =>
        __._db.Chats.insert({
          id: id,
          text: text }) })
  ).collections({Chats: {}}
  ).close(),

  __.Module('spark').collections(function() { return {
      Users: {
        publish: () => this.Matches = __._db.Users.find({
            gender: 'F',
            public_ids: {$exists: true},
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [-118.3096648, 34.0655627] },
                $maxDistance: 20000,
                $minDistance: 0 }} }),
        callback: function(m) {
            window.Matches = __._db.Users.find({}).fetch()
            Session.set('index', 0)
            Session.set('photo-front', this.photoUrl(0))
            Session.set('photo-back',  this.photoUrl(1)) },
        collections: {
          "fs.files": {
            publish: () => this.Files = __._db["fs.files"].find({
                _id: { $in: this.Matches.fetch().reduce(((o, a) => o.concat(a.photo_ids) ), []) } }),
            callback: (m) => this.Files = __._db['fs.files'].find({}).fetch(),
            collections: {
              "fs.chunks": {
                publish: () => __._db["fs.chunks"].find({files_id: {$in: this.Files.fetch().map(a => a._id)}}),
                callback: (m) => this.Chunks = __._db['fs.chunks'].find({}).fetch() } } } } } }}
  ).fn({
    photoUrl: (i, j) => { // es6 feature j=0 is not yet supported
      if (j == null) {j = 0}
      return Settings.image_url + (this.Matches || Matches)[i].public_ids[j] + '.jpg' } }
  ).close('spark'),

  __.Module('camera').onServer(function() {
    const fs = Npm.require('fs')
    const Busboy = Spark.require('busboy')
    const cloud = Spark.require('cloudinary')
    const _ = Settings.cloudinary
    cloud.config({
      cloud_name: _.cloud_name,
      api_key:    _.api_key,
      api_secret: _.api_secret })
    Router.onBeforeAction((req, res, next) => {
      var busboy, filenames
      filenames = []
      if (req.url === '/upload' && req.method === 'POST') {
        busboy = new Busboy({headers: req.headers})
        busboy.on('file', (field, file, filename) => {
          console.log('param', req)
          file.pipe(cloud.uploader.upload_stream(r => console.log('stream', r, req.body.id)))
          filenames.push(filename) })
        busboy.on('finish', () => {
          req.filenames = filenames
          next() })
        busboy.on('field', (field, value) => req.body[field] = value)
        req.pipe(busboy)
      } else {
        next() } })
    Router.route('/upload', {where: 'server'}).post(function() {
      this.response.writeHead(200, {'Content-Type': 'text/plain'})
      this.response.end("ok") }) }
  ).close(),

  __.Settings(() => {
    const local_ip = '192.168.1.65'
    const deploy_domain = 'spark5.meteor.com'
    return {
      app: {
        info: {
          id: 'com.spark.game',
          name: () => this.title,
          description: 'Spark game long name.',
          website: 'http://sparkgame.com' },
        icons: {
          iphone: 'resources/icons/icon-60x60.png',
          iphone_2x: 'resources/icons/icon-60x60@2x.png' },
        setPreference: {
          BackgroundColor: '0xff0000ff',
          HideKeyboardFormAccessoryBar: true },
        configurePlugin: {
          'com.phonegap.plugins.facebookconnect': {
            APP_NAME: 'spark-game-test',
            APP_ID: process.env.FACEBOOK_CLIENT_ID,
            API_KEY: process.env.FACEBOOK_SECRET } },
        accessRule: ["http://localhost/*", "http://meteor.local/*", "http://" + local_ip + "/*", "http://connect.facebook.net/*", "http://*.facebook.com/*", "https://*.facebook.com/*", "ws://" + local_ip + "/*", "http://" + deploy_domain + "/*", "ws://" + deploy_domain + "/*", "http://res.cloudinary.com/*", "mongodb://ds031922.mongolab.com/*"] },
      deploy: {
        name: deploy_domain.split('.')[0],
        mobileServer: "http://" + deploy_domain },
      cubesat: { version: '0.5.0' },
      title: "Spark Game",
      theme: "clean",
      lib: "ui",
      env: {
        production: {
          MONGO_URL: process.env.MONGO_URL } },
      npm: {
        busboy: "0.2.9",
        cloudinary: "1.2.1" },
      public: {
        title: () => this.title,
        //fbAppId: () => process.env.FACEBOOK_CLIENT_ID,
        collections: {},
        image_url: "http://res.cloudinary.com/sparks/image/upload/",
        upload: "http://" + local_ip + ":3000/upload" },
      cloudinary: {
        cloud_name: "sparks",
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET },
      facebook: {
        oauth: {
          version: 'v2.3',
          url: "https://www.facebook.com/dialog/oauth",
          options: {
            query: {
              client_id: process.env.FACEBOOK_CLIENT_ID,
              redirect_uri: 'http://localhost:3000/home' } },
          secret: process.env.FACEBOOK_SECRET,
          client_id: process.env.FACEBOOK_CLIENT_ID } } } }),

  __.Module('chart').collections(() => ({
    Ticker:     {publish: () => __._db.Chart.find()},
    Trade:      {publish: () => __._db.Chart.find()},
    GroupOrder: {publish: () => __._db.Chart.find()} }))
)

__.isMeteorServer(() => __.meteorStartup(() => {
  const socket = require('socket.io-client')('https://websocket.btcchina.com/')
  const Fiber  = require('fibers')
  socket.emit('subscribe', 'marketdata_cnybtc')
  socket.emit('subscribe', 'grouporder_cnybtc')
  socket.on('ticker',     data => __.db('Ticker',     data, (c, d) => Fiber(() => c.insert(d)).run()))
  socket.on('trade',      data => __.db('Trade',      data, (c, d) => Fiber(() => c.insert(d)).run()))
  socket.on('grouporder', data => __.db('GroupOrder', data, (c, d) => Fiber(() => c.insert(d)).run()))
}) )
