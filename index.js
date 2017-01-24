
if (typeof Meteor === "undefined" || Meteor === null) {global.cube = require('cubesat')}

var s1 = cube.Cube()

s1.add(cube.Module('chat').methods(() => ({
    says: (id, text) =>
      db.Chats.insert({
        id: id,
        text: text }) })
).collections({Chats: {}}
).close())

s1.add(cube.Module('spark').collections(() => ({
    Users: {
      publish: () => this.Matches = db.Users.find({
          gender: 'F',
          public_ids: {$exists: true},
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [-118.3096648, 34.0655627] },
              $maxDistance: 20000,
              $minDistance: 0 }} }),
      callback: () => {
          window.Matches = db.Users.find({}).fetch()
          Session.set('index', 0)
          Session.set('photo-front', this.photoUrl(0))
          Session.set('photo-back', this.photoUrl(1)) },
      collections: {
        "fs.files": {
          publish: () => this.Files = db["fs.files"].find({
              _id: { $in: this.Matches.fetch().reduce(((o, a) => o.concat(a.photo_ids) ), []) } }),
          callback: () => this.Files = db['fs.files'].find({}).fetch(),
          collections: {
            "fs.chunks": {
              publish: () => db["fs.chunks"].find({files_id: {$in: this.Files.fetch().map(a => a._id)}}),
              callback: () => this.Chunks = db['fs.chunks'].find({}).fetch() } } } } } })
).fn({
  photoUrl: (i, j) => { // es6 feature j=0 is not yet supported
    if (j == null) {j = 0}
    return Settings.image_url + (this.Matches || Matches)[i].public_ids[j] + '.jpg' } }
).close('spark'))

s1.add(cube.Module('camera').onServer(function() {
  var Busboy, _, cloud, fs;
  fs = Npm.require('fs');
  Busboy = Spark.require('busboy');
  cloud = Spark.require('cloudinary');
  _ = Settings.cloudinary;
  cloud.config({
    cloud_name: _.cloud_name,
    api_key: _.api_key,
    api_secret: _.api_secret
  });
  Router.onBeforeAction(function(req, res, next) {
    var busboy, filenames;
    filenames = [];
    if (req.url === '/upload' && req.method === 'POST') {
      busboy = new Busboy({
        headers: req.headers
      });
      busboy.on('file', function(field, file, filename) {
        console.log('param', req);
        file.pipe(cloud.uploader.upload_stream(function(r) {
          return console.log('stream', r, req.body.id);
        }));
        return filenames.push(filename);
      });
      busboy.on('finish', function() {
        req.filenames = filenames;
        return next();
      });
      busboy.on('field', function(field, value) {
        return req.body[field] = value;
      });
      return req.pipe(busboy);
    } else {
      return next();
    }
  });
  return Router.route('/upload', {
    where: 'server'
  }).post(function() {
    this.response.writeHead(200, {'Content-Type': 'text/plain'})
    this.response.end("ok")
  }) }
).close())

s1.add(cube.Settings(() => {
  var deploy_domain, local_ip
  local_ip = '192.168.1.65'
  deploy_domain = 'spark5.meteor.com'
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
        client_id: process.env.FACEBOOK_CLIENT_ID } } }
}))

if (typeof Meteor === "undefined" || Meteor === null) {module.exports = s1}
