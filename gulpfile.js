
if ( 'undefined' === typeof Meteor ) {
    let bypassRequire = require
    let path = bypassRequire('path')
    bypassRequire( path.join(process.env.NODE_MODULES, 'node_modules/.bin/sat') )  }
