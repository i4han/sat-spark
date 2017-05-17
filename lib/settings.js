
__.isMeteorClient( null, () => __.Settings( JSON.parse(process.env.GLOBAL_SETTINGS) ) )
__.Settings( o => {
    const local_ip = '192.168.1.65'
    const deploy_domain = 'spark5.meteor.com'
    return {
        deploy: {
            name: deploy_domain.split('.')[0]
          , mobileServer: "http://" + deploy_domain }
      , cubesat: { version: '0.5.0' }
      , title: "New Slate"
      , theme: "clean"
      , lib:   "ui"
      , env: {
            production: {
                MONGO_URL: process.env.MONGO_URL } }, // not working 2017-1-29
        public: {
            title: v => v.title }
    }  })
