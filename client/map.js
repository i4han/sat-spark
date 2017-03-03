'use strict'

let inc = require('incredibles')

__.Module('map')
.router({ path: 'map', layout: 'blank' })
.head(o => ({
    title: o.Settings.title
  , meta: [
        { name:"viewport", content:"initial-scale=1.0" }
      , { charset:'utf-8' }  ]
  , script: { src: o.Public.google_maps_api_url + "&callback=initMap" }  }))
.template( function() { return [
    blaze.Include(this, 'map_input')
  , __.ID('map')
  , __.ID('view', blaze.Include(this, 'view'))  ]})
.script( () => {
    function initMap() {
        let map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 53.5, lng: 246.86}
          , zoom: 13
          , mapTypeId: 'satellite'
        })
        autoComplete(map)
        let layer = new google.maps.KmlLayer({
            url: 'http://map.meteorapp.com/t12.kml'
          , preserveViewport: false
          , map: map  })
        layer.addListener('click', e => console.log(e.featureData.description) )
        Meteor.setTimeout( () => {
            console.log(map)
            map.setCenter({lat: 53.497, lng: 246.86})
            map.setZoom(13)  }, 2000)
        console.log(layer)  }  })
.style({
    '#map':  { height: '100%', width: '50%', float: 'left' }
  , '#view': {
        height:  '100%', width: '50%'
      , display: 'flex', flexDirection: 'column', alignItems: 'center'
      , float: 'right', background: 'rgb(244, 244, 244)' }
  , 'html, body': { height: '100%' , margin: 0 , padding: 0 } })
.build('map')

__.Module('map_input')
.template( () => [
    __.CLASS( 'form-group float-label-control'
      , html.LABEL({}, 'Username')
      , html.INPUT({}, {id:'pac-input', class:'controls', type:'text', placeholder:'search'}, '')  ) ] )
/*         <label for="">Username</label>
         <input type="email" class="form-control" placeholder="Username">
     </div> */
.script( () => {
    function autoComplete (map) {
        // let box = new google.maps.places.SearchBox(document.getElementById('pac-input'))
        console.log(map)  } })
.style({
    //'#pac-input':
})
.build('map_input')

__.Module('view')
.template( () => [
    __.CLASS('item')
  , __.CLASS('item')
  , __.CLASS('item')
])
.style({
    '.item': { width: '93%', height: 100, margin: 15 }
})
.build('view')
