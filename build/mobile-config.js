App.info({
   id: "com.spark.game",
   name: "Spark game",
   description: "Spark game long name.",
   website: "http://sparkgame.com"
});

App.icons({
   iphone: "resources/icons/icon-60x60.png",
   iphone_2x: "resources/icons/icon-60x60@2x.png"
});

App.setPreference("BackgroundColor", "0xff0000ff");
App.setPreference("HideKeyboardFormAccessoryBar", "true");

App.configurePlugin("com.phonegap.plugins.facebookconnect", {
   APP_ID: "839822572732286",
   API_KEY: "d48753b6d59e2e908fe313d0aa8011b8"
});

App.accessRule("http://res.cloudinary.com/*");
App.accessRule("http://meteor.local/*");
App.accessRule("http://192.168.1.78/*");
App.accessRule("mongodb://ds031922.mongolab.com/*");

