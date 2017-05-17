'use strict'

let in$ = require('incredibles')

in$.module('map')
.router({ path: 'map', layout: 'blank' })
.head(o => ({
    title: o.Settings.title
  , meta: [
        { name:"viewport", content:"initial-scale=1.0" }
      , { charset:'utf-8' }  ]
  //, script: { src: o.Public.google_maps_api_url + "&libraries=places&callback=init.Map" } 
}))
.body( v=>v
    .include('map-input')
    .id('map',  v=>v.id('toggle', '<'))
    .id('view', v=>v.include('view') ) )
.style({
    '#map':  { height: '100%', width: '50%', float: 'left' }
  , '#view': {
        height:  '100%', width: '50%'
      , display: 'flex', flexDirection: 'column', alignItems: 'center'
      , float: 'right', background: 'rgb(244, 244, 244)' }
  , '#toggle': {
        position: 'absolute', top: 10, right: 30, zIndex: 10 }
  , 'html, body': { height: '100%' , margin: 0 , padding: 0 } })
/*.script( () => {
    let init = {}
    init.Map = () => {
        let map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 53.5, lng: 246.86}
          , zoom: 13
          , mapTypeId: 'satellite'
          , mapTypeControlOptions: {position: 3}  })
        let control = map.controls[8]
        in$.htmlElement(document.createElement('div'))
        .tap(control.push.bind(control))
        .appendChild(
            in$.htmlElement(document.createElement('div'))
            .add({
                style: {
                    background: '#fff'
                  , border: '2px solid #fff', borderRadius: '2px'
                  , boxShadow: '0 2px 6px rgba(0,0,0,.3)'
                  , cursor: 'pointer'
                  , margin: '8px', textAlign: 'center'  }
              , title: 'Click to expend map'  })
            .appendChild(
                in$.htmlElement(document.createElement('div'))
                .add({ id: 'sizeButton'
                  , style: { lineHeight: '6px', padding: '8px' }
                  , innerHTML: '>'  })
                .addEventListener( 'click', e => {
                    e.stopImmediatePropagation()
                    if (e.toElement.innerText === '>') {
                        document.getElementById('sizeButton').innerHTML = '<'
                        document.getElementById('map').style.width = '100%'
                        google.maps.event.trigger(map, 'resize')
                    } else {
                        document.getElementById('sizeButton').innerHTML = '>'
                        document.getElementById('map').style.width = '50%'
                        google.maps.event.trigger(map, 'resize')  }
                    return false  } ).value).value )

        autoComplete(map)
        let layer = new google.maps.KmlLayer({
            url: 'http://map.meteorapp.com/t12.kml'
          , preserveViewport: false
          , map: map  })
        layer.addListener('click', e => console.log(e.featureData.description) )
        Meteor.setTimeout( () => {
            map.setCenter({lat: 53.497, lng: 246.86})
            map.setZoom(13)  }, 2000)
            $('.gm-style').append('<div id="toggle">&lg;</div>')  }  }) */
.build('map')

in$.module('map-input')
/*
.script( () => {
    function autoComplete (map) {
        let input = document.getElementById('pac-input')
        let searchBox = new google.maps.places.SearchBox(input)
        // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)
        // let box = new google.maps.places.SearchBox(document.getElementById('pac-input'))
        map.addListener( 'bounds_changed', () => searchBox.setBounds(map.getBounds()) )
        var markers = []
        searchBox.addListener('places_changed', () => {
          let places = searchBox.getPlaces()
          if (places.length == 0) return
          markers.forEach( marker => marker.setMap(null) )
          markers = []
          let bounds = new google.maps.LatLngBounds()
          places.forEach(function(place) {
              if (!place.geometry) {
                  console.log("Returned place contains no geometry");
                  return  }
              var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25) }
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location }))

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport)
            } else {
              bounds.extend(place.geometry.location) }  })
          map.fitBounds(bounds)  })  } })
          */
.body( v=>v
    .class( 'form-group float-label-control'
      , v=>v.LABEL('Search title')
      , v=>v.INPUT({id:'pac-input', class:'controls', type:'text', placeholder:'search'}, '')  )
     )
.style({
    '.form-group': {
        position: 'absolute', top: 10, left: 8, zIndex: 100
      , borderRadius: 2
      , background: 'white', width: 300, padding: 5}
  , '#pac-input': { width: 290 }
  })
.build('map-input')

in$.module('view').router({path:'view', layout:'blank'})
.body( v=>v
    .DIV({class:'viewitem'}, v.name, v.view.name, v=>v.P('hello') )
    .class('viewitem', 'it')
    .class('viewitem', 'works!') )
.style({ '.viewitem': { width: '93%', height: 100, margin: 15, background: 'white' }})
.build('view')
