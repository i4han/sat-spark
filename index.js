
module.exports = __.Cube().add(

  __.Module('chat').methods(() => ({
      says: (id, text) =>
        __._db.Chats.insert({
          id: id,
          text: text }) })
  ).mongo({Chats: {}
  }).build(),

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
  ).build(),

  __.Settings(o => {
    const local_ip = '192.168.1.65'
    const deploy_domain = 'spark5.meteor.com'
    return {
      app: {
        info: {
          id: 'com.spark.game',
          name: () => o.title,
          description: 'Spark game long name.',
          website: 'http://sparkgame.com' },
        icons: {
          iphone:    'resources/icons/icon-60x60.png',
          iphone_2x: 'resources/icons/icon-60x60@2x.png' },
        setPreference: {
          BackgroundColor: '0xff0000ff',
          HideKeyboardFormAccessoryBar: true },
        configurePlugin: {
          'com.phonegap.plugins.facebookconnect': {
            APP_NAME: 'spark-game-test',
            APP_ID:  process.env.FACEBOOK_CLIENT_ID,
            API_KEY: process.env.FACEBOOK_SECRET } },
        accessRule: ["http://localhost/*", "http://meteor.local/*", "http://" + local_ip + "/*", "http://connect.facebook.net/*", "http://*.facebook.com/*", "https://*.facebook.com/*", "ws://" + local_ip + "/*", "http://" + deploy_domain + "/*", "ws://" + deploy_domain + "/*", "http://res.cloudinary.com/*", "mongodb://ds031922.mongolab.com/*"] },
      deploy: {
        name: deploy_domain.split('.')[0],
        mobileServer: "http://" + deploy_domain },
      cubesat: { version: '0.5.0' },
      title: "Spark Game",
      theme: "clean",
      lib:   "ui",
      env: {
        production: {
          MONGO_URL: process.env.MONGO_URL } }, // not working 2017-1-29
      npm: {
        busboy: "0.2.9",
        cloudinary: "1.2.1" },
      public: {
        title: () => o.title,
        //fbAppId: () => process.env.FACEBOOK_CLIENT_ID,
        //collections: {},
        image_url: "http://res.cloudinary.com/sparks/image/upload/",
        upload: "http://" + local_ip + ":3000/upload" },
      cloudinary: {
        cloud_name: "sparks",
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET },
      facebook: {
        oauth: {
          version: 'v2.3',
          url: "https://www.facebook.com/dialog/oauth",
          options: {
            query: {
              client_id: process.env.FACEBOOK_CLIENT_ID,
              redirect_uri: 'http://localhost:3000/home' } },
          secret:    process.env.FACEBOOK_SECRET,
          client_id: process.env.FACEBOOK_CLIENT_ID } } } } ),

  __.Module('main').mongo(() => ({
    Ticker:     {publish: () => __._db.Ticker.find()},
    Trade:      {publish: () => __._db.Trade.find()},
    GroupOrder: {publish: () => __._db.GroupOrder.find()} }))
)

__.isMeteorServer(() => __.meteorStartup(() => {}) )
