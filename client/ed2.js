'use strict'

const c3  = require('c3')
const in$ = require('incredibles')
let columns = [
   ['2016'].concat([ 53219, 54752, 46396, 48327, 61116, 75001, 75823, 69248, 60639, 57610, 61114, 62090, 52805, 42055, 28945, 23143, 16646, 15308].reverse())
 , ['2011'].concat([ 50560, 42320, 42555, 48950, 67850, 75695, 65365, 57450, 55955, 60100, 60290, 51205, 39250, 26640, 21515, 18365, 14825, 13315].reverse())
 , ['2006'].concat([ 40740, 39360, 43435, 49405, 66115, 61880, 53040, 51460, 57385, 58855, 52010, 41285, 28710, 23525, 20915, 17885, 13060, 10620].reverse())
 , ['2001'].concat([ 38620, 40800, 43840, 46170, 57020, 55000, 51980, 54200, 54800, 50610, 41460, 28665, 25135, 23010, 20255, 15200, 11020,  8315].reverse())
 , ['1996'].concat([ 36536, 41833, 45476, 46380, 47300, 48834, 50784, 52520, 46561, 38143, 26372, 23124, 21169, 18911, 13984, 10138,  7650,  6000].reverse())
]


let c3map = new Map()
class Chart3 {
    constructor (name, data) {
        c3map.set(name, this)
        this.data   = data
        this.config = in$.from({bindto: '#' + name, point: {r: 2}}).setAt('data.columns',  data)  }
    style (...a) {
        let names = {}, types = {}, keys = [], colors = {}
        a.forEach((v, i) => {
            keys[i]      = v.key
            names[v.key] = v.name
            types[v.key] = v.type
            if (v.color) colors[v.key] = v.color  })
        this.keys = keys
        let serial = keys.reduce(((a, k) => a.concat(this.data.map(v => v[k]))), []).filter(v => __.isNumber(v) )
        this.config.setAt( 'line.connectNull', true )
        .setAt( 'data.keys',  {value: keys} ).setAt( 'data.names',  names  )
        .setAt( 'data.colors', colors )      .setAt( 'data.types',  types  )
        .setAt( 'axis.y.max', 110000 )
        .setAt( 'axis.y.min', 0 )
        .setAt( 'axis.rotated', true )      // .setAt( 'axis.y.inverted', true )
        .setAt( 'axis.x.tick.centered', true )
        .setAt( 'axis.x.padding.left', 0 )
        .setAt( 'axis.y.padding.bottom', 0 )
        .setAt( 'size.height', 900 )
        .setAt( 'axis.x.type', 'category' )
        .setAt( 'axis.x.categories', ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85 over'].reverse())
        return this }
    show () {
        this.c3 = c3.generate(this.config.value)  }
    load (o) {
        this.c3.load( { json: o, keys:{value: this.keys}, duration:0 } )  }
    flow (row) {
        this.c3.flow( { json: [row], keys:{value: this.keys}, duration:0 } )  }  }


in$.module('edmonton').router( {path:'ed2', layout:'web'} )
.body( v=>v
    .BR()
    .H1('History of Population Pyramid of Edmonton')
    .id('pyramid') )
.properties(  o => ({
    draw: m => {
        console.log('ok')
        new Chart3( 'pyramid',     columns)
        .style(
            { key: '1996', name: '1996',   type: 'area-spline', color: 'rgba(0,   0, 255, 50)' }
          , { key: '2001', name: '2001',   type: 'area-spline', color: 'rgba(0,  30, 190, 50)' }
          , { key: '2006', name: '2006',   type: 'area-spline', color: 'rgba(0,  60, 130, 50)' }
          , { key: '2011', name: '2011',   type: 'area-spline', color: 'rgba(0,  90,  70, 50)' }
          , { key: '2016', name: '2016',   type: 'area-spline', color: 'rgba(0, 120,   0, 50)' }
        )
        .show()
    }  }))
.onRendered(o => () => {
    o.draw()
    $('body').mouseup(e => {
        e.stopImmediatePropagation()
        o.nextLine()
        return false })  })
.build()
