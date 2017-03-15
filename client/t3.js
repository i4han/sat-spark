'use strict'

const c3  = require('c3')
const in$ = require('incredibles')

let c3map = new Map()
class Chart3 {
    constructor (name, data) {
        c3map.set(name, this)
        this.data   = data
        this.config = in$.from({bindto: '#' + name, point: {r: 2}}).setAt('data.json',  data)  }
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
        .setAt( 'axis.y.max', Math.max.apply({}, serial) )
        .setAt( 'axis.y.min', Math.min.apply({}, serial) )
        return this }
    show () {
        this.c3 = c3.generate(this.config.value)  }
    load (o) {
        this.c3.load( { json: o, keys:{value: this.keys}, duration:0 } )  }
    flow (row) {
        this.c3.flow( { json: [row], keys:{value: this.keys}, duration:0 } )  }  }

let last = 300, next = 300, sma = 19, last_n = 7, time = 0
let data = [], wdata = []
let price1, price2, bid1, bid2, ask1, ask2, pos, neg
price1 = price2 = bid1 = bid2 = ask1 = ask2 = pos = neg = null

in$.module('robot2').router( {path:'t3', layout:'web'} )
.body( v=>'btc okc compare average modified yoyo flexion'.split(' ').map(w=>v.id(w)) )
.properties(  o => ({
    draw: m => {
        console.log(50, m, m.collection)
        wdata = m.Db.Depth.find({}).map(v => v)
        console.log(wdata.slice(21).into$)
        wdata = wdata.slice(21).into$
        data  = wdata.slice(0, last)
        for(let i = 0; i < last; i++) {
            price1 = data[i].price1 || price1
            price2 = data[i].price2 || price2
            bid1   = data[i].bid1   || bid1
            bid2   = data[i].bid2   || bid2
            ask1   = data[i].ask1   || ask1
            ask2   = data[i].ask2   || ask2
            data[i].disparity = (price1 && price2) ? price2 - price1 : null
            data[i].sma       = data.slice(Math.max(0, i + 1 - sma), i + 1).average(v => v.disparity)
            data[i].modified1 = price1 ? price1 + data[i].sma : null
            data[i].yoyo      = price2 && data[i].modified1 ? price2 - data[i].modified1 : null
            data[i].flexion   = null
            if (i < 2) continue
            let yoyo3 = data.slice(0, i + 1).map(v => v.yoyo).slice(-3)
            data[i - 1].positive = null
            data[i - 1].negative = null
            if ( data[i - 1].yoyo > 0 ) {
                data[i].posOpper = (pos = bid2 - ask1 - data[i].sma) //> 0 ? pos : 0
                let flexion = (yoyo3[0] <= yoyo3[1] && yoyo3[1] >= yoyo3[2]) ? yoyo3[1] : 0
                if ( (data[i - 1].flexion = flexion) > 0 )
                    data[i - 1].positive = data.slice(0, i - 1).map(v => v.positive).filter(v => v > 0)
                        .slice(-last_n).concat(flexion).average()  }
            else if ( data[i - 1].yoyo < 0 ) {
                data[i].negOpper = (neg = ask2 - bid1 - data[i].sma) //> 0 ? -neg : 0
                let flexion = (yoyo3[0] >= yoyo3[1] && yoyo3[1] <= yoyo3[2]) ? yoyo3[1] : 0
                if ( (data[i - 1].flexion = flexion) < 0 )
                    data[i - 1].negative = data.slice(0, i - 1).map(v => v.negative).filter(v => v < 0)
                        .slice(-last_n).concat(flexion).average()  }  }
        data[last - 1].positive = null
        data[last - 1].negative = null

        new Chart3( 'btc',     data)
        .style( { key: 'ask1',      name: 'btc ask',   type: 'area', color: 'rgba(0, 0, 255, 50)' },
                { key: 'bid1',      name: 'btc bid',   type: 'area', color: 'rgba(0, 0, 255, 70)' },
                { key: 'price1',    name: 'btc',       type: 'line' } )
        .show()
        new Chart3( 'okc',     data)
        .style( { key: 'ask2',      name: 'okc ask',   type: 'area', color: 'rgba(255, 0, 0, 20)' },
                { key: 'bid2',      name: 'okc bid',   type: 'area', color: 'rgba(255, 0, 0, 40)' },
                { key: 'price2',    name: 'okc',       type: 'line' } )
        .show()
        new Chart3( 'compare', data)
        .style( { key: 'ask1',      name: 'btc ask',   type: 'area', color: 'rgba(0, 0, 255, 50)' },
                { key: 'bid1',      name: 'btc bid',   type: 'area', color: 'rgba(0, 0, 255, 70)' },
                { key: 'ask2',      name: 'ok ask',    type: 'area', color: 'rgba(255, 0, 0, 20)' },
                { key: 'bid2',      name: 'ok bid',    type: 'area', color: 'rgba(255, 0, 0, 40)' } )
        .show()
        new Chart3( 'average',   data)
        .style( { key: 'disparity', name: 'disparity', type: 'area' },
                { key: 'sma',       name: 'SMA',       type: 'line' } )
        .show()
        new Chart3( 'modified',  data)
        .style( { key: 'price2',    name: 'okc',       type: 'area' },
                { key: 'modified1', name: 'btc adj',   type: 'area' } )
        .show()
        new Chart3( 'yoyo',      data)
        .style( { key: 'yoyo',      name: 'updown',    type: 'area' },
                { key: 'posOpper',  name: 'pos',       type: 'area' },
                { key: 'negOpper',  name: 'neg',       type: 'area' } )
        .show()
        new Chart3( 'flexion',   data)
        .style( { key: 'flexion',   name: 'flexion',   type: 'bar'  },
                { key: 'positive',  name: 'positive',  type: 'line' },
                { key: 'negative',  name: 'negative',  type: 'line' } )
        .show()
    },
    nextLine: () => {
            let newline = {}
            newline.price1    = price1 = wdata[next].price1 || price1
            newline.price2    = price2 = wdata[next].price2 || price2
            newline.bid1      = bid1   = wdata[next].bid1
            newline.ask1      = ask1   = wdata[next].bid2
            newline.bid2      = bid2   = wdata[next].ask1
            newline.ask2      = ask2   = wdata[next].ask2
            newline.disparity = (price1 && price2) ? price2 - price1 : null
            newline.sma       = data.map(v => v.disparity).slice(-sma + 1).concat(newline.disparity).average()
            newline.modified1 = price1 ? price1 + newline.sma : null
            newline.yoyo      = price2 && newline.modified1 ? price2 - newline.modified1 : null
            newline.flexion   = null
            newline.positive  = null
            newline.negative  = null
            let yoyo3 = data.map(v => v.yoyo).slice(-2).concat(newline.yoyo)
            if (data[last - 1].yoyo > 0) {
                newline.posOpper = ( pos = bid2 - ask1 - newline.sma )
                let flexion = (yoyo3[0] <= yoyo3[1] && yoyo3[1] >= yoyo3[2]) ? yoyo3[1] : 0
                data[last - 1].flexion = flexion
                if (flexion)
                    data[last - 1].positive = data.filter( v => v.positive > 0 )
                    .slice(-last_n).concat(flexion).average(v => v.positive)  }
            else if (data[last - 1].yoyo < 0) {
                newline.negOpper = ( neg = ask2 - bid1 - newline.sma )
                let flexion = (yoyo3[0] >= yoyo3[1] && yoyo3[1] <= yoyo3[2]) ? yoyo3[1] : 0
                data[last - 1].flexion = flexion
                if (flexion)
                    data[last - 1].negative = data.filter( v => v.negative > 0 )
                    .slice(-last_n).concat(flexion).average( v => v.positive )  }
            c3map.get('flexion').load(data)
            c3map.forEach((v,k) => c3map.get(k).flow(newline))
            data.shift$().push(newline)
            next++  }  }))
.onRendered(o => () => {
    __.whenCollectionsReady('Depth', o.draw)
    $('body').mouseup(e => {
        e.stopImmediatePropagation()
        o.nextLine()
        return false })  })
.build()
