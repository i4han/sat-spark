
// console.log('server')
__.Module('graph').collections(function() { return {              // mongo
    bcTrades: {
      publish: (() => __._db.bcTrades.find({})),
      callback: function(m) { console.log('bcTrades connected', __._db.bcTrades.find().count()) } } }
}).build()
