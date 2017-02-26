

__.Module('chat').methods(() => ({
    says: (id, text) => __._db.Chats.insert({ id: id, text: text }) }))
.mongo({Chats: {}})
.build()

__.Module('camera').onServer(o => function() {
    const fs     = Npm.require('fs')
    const Busboy = Spark.require('busboy')
    const cloud  = Spark.require('cloudinary')
    const _      = o.Settings.cloudinary // o.Settings won't work.
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
            this.response.end("ok") }) })
.build()

__.Module('main').mongo(() => ({
    Ticker:     {publish: () => __._db.Ticker.find()},
    Trade:      {publish: () => __._db.Trade.find()},
    GroupOrder: {publish: () => __._db.GroupOrder.find()} }))


__.isMeteorServer(() => __.meteorStartup(() => {}) )
