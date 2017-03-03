
__.isMeteorClient( null, 
    () => __.Settings( JSON.parse(process.env.GLOBAL_SETTINGS) ) )
__.Settings( o => {
    const local_ip = '192.168.1.65'
    const deploy_domain = 'spark5.meteor.com'
    return {
        app: {
            info: {
                id: 'com.spark.game'
              , name: v => v.title
              , description: 'Spark game long name.'
              , website: 'http://sparkgame.com' }
          , icons: {
                iphone:    'resources/icons/icon-60x60.png'
              , iphone_2x: 'resources/icons/icon-60x60@2x.png' }
          , setPreference: {
                BackgroundColor: '0xff0000ff'
              , HideKeyboardFormAccessoryBar: true }
          , configurePlugin: {
                'com.phonegap.plugins.facebookconnect': {
                    APP_NAME: 'spark-game-test'
                  , APP_ID:  process.env.FACEBOOK_CLIENT_ID
                  , API_KEY: process.env.FACEBOOK_SECRET } }
              , accessRule: [
                  "http://localhost/*"
                , "http://meteor.local/*"
                , "http://" + local_ip + "/*"
                , "http://connect.facebook.net/*"
                , "http://*.facebook.com/*"
                , "https://*.facebook.com/*"
                , "ws://" + local_ip + "/*"
                , "http://" + deploy_domain + "/*"
                , "ws://" + deploy_domain + "/*"
                , "http://res.cloudinary.com/*"
                , "mongodb://ds031922.mongolab.com/*"] }
      , deploy: {
            name: deploy_domain.split('.')[0]
          , mobileServer: "http://" + deploy_domain }
      , cubesat: { version: '0.5.0' }
      , title: "Spark Game"
      , google_map_api_url: process.env.GOOGLE_MAP_API_URL
      , theme: "clean"
      , lib:   "ui"
      , env: {
            production: {
                MONGO_URL: process.env.MONGO_URL } }, // not working 2017-1-29
        npm: {
            busboy: "0.2.9",
            cloudinary: "1.2.1" },
        public: {
            title: v => v.title,
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
                client_id: process.env.FACEBOOK_CLIENT_ID  }  }  }  }  )
