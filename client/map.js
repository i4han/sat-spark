'use strict'

const inc = require('incredibles')

__.Module('map').router( {path: 'map', layout: 'web'} )
.template(() => [
    __.CLASS('map') ])
.properties( o => ({ }))
.build('map')
