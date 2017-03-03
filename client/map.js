'use strict'

let inc = require('incredibles')

__.Module('map')
.router({path: 'map', layout: 'blank'})
.head(o => ({
    title: o.Settings.title
  , meta: [
        {name:"viewport", content:"initial-scale=1.0"}
      , {charset:'utf-8'}  ]
  , script: {src: Meteor.settings.public.google_maps_api_url + "&callback=initMap" }  }))
.template( () => [
    __.ID('map')  ])
.script( () => {
    function initMap() {
        let map   = new google.maps.Map(document.getElementById('map'))
        let layer = new google.maps.KmlLayer({
            url: 'http://map.meteorapp.com/t12.kml'
          , preserveViewport: false
          , map: map  })
        layer.addListener('click', e => console.log(e.featureData.description) )
        map.setCenter({lat: -34, lng: 181})
        map.setZoom(11)
        console.log(layer)
    }})
.style({
    '#map': { height: '100%' }
  , 'html, body': {
        height: '100%'
      , margin: 0
      , padding: 0 } })
.build('map')
