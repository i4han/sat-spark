'use strict'

const c3 = require('c3')
const i$ = require('incredibles')

class Chart3 {
    constructor (name, chart, obj) {
        this._name = name
        this._chart = chart
        this._config = i$({ bindto: '#' + name, point: { r: 2 }}).add('data.json',  chart)
        if ( i$(obj).is('object') ) {
            obj[name] = this
            this.o = obj } }
    data (...a) {
        let names = {}, types = {}, keys = [], colors = {}
        a.forEach((v, i) => {
            keys[i]       = v.key
            names[v.key]  = v.name
            types[v.key]  = v.type
            if (v.color) colors[v.key] = v.color  })
        this._keys = keys
        let serial = keys.reduce(((a, k) => a.concat(this._chart.map(v => v[k]))), []).filter(v => __.isNumber(v) )
        this._config.add( 'line.connectNull', true )
        this._config.add( 'data.keys',  {value: keys} )
        this._config.add( 'data.names',  names  )
        this._config.add( 'data.colors', colors )
        this._config.add( 'data.types',  types  )
        this._config.add( 'axis.y.max', Math.max.apply({}, serial) )
        this._config.add( 'axis.y.min', Math.min.apply({}, serial) )
        return this }
    show () {
        this._c3 = c3.generate(this._config)
        return this }
    load (o) {
        this._c3.load( {json: o, keys:{value: this._keys}, duration:0}  ) }
    flow (row) {
        this._c3.flow( {json: [row], keys:{value: this._keys}, duration:0} )  } }

const chart3 = (name, chart, obj) => new Chart3(name, chart, obj)

let last = 300, next = 300, sma = 19, last_n = 7, G = i$({}), time = 0
let data = [], wdata = []
let price1, price2, bid1, bid2, ask1, ask2, pos, neg
price1 = price2 = bid1 = bid2 = ask1 = ask2 = pos = neg = null

__.Module('robot2').router({path:'t3', layout:'web'}
).template(() => [
        __.CLASS('row', __.ID('btc' )),
        __.CLASS('row', __.ID('okc' )),
        __.CLASS('row', __.ID('compare' )),
        __.CLASS('row', __.ID('average')),
        __.CLASS('row', __.ID('modified' )),
        __.CLASS('row', __.ID('yoyo')),
        __.CLASS('row', __.ID('flexion'))
]).properties(o => ({
    draw: (m) => {
        wdata = m.Db.Depth.find({}).map(v => v)
        wdata = i$(wdata).slice(21)
        data  = wdata.slice(0, last)
        for(let i = 0; i < last; i++) {
            price1 = data[i].price1 || price1
            price2 = data[i].price2 || price2
            bid1   = data[i].bid1   || bid1
            bid2   = data[i].bid2   || bid2
            ask1   = data[i].ask1   || ask1
            ask2   = data[i].ask2   || ask2
            data[i].disparity = (price1 && price2) ? price2 - price1 : null
            data[i].sma       = i$(data).slice(0, i + 1).map(v => v.disparity).slice(-sma).average()
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

        chart3( 'btc',  data, G )
        .data( { key: 'ask1',      name: 'btc ask',   type: 'area', color: 'rgba(0, 0, 255, 50)' },
               { key: 'bid1',      name: 'btc bid',   type: 'area', color: 'rgba(0, 0, 255, 70)' },
               { key: 'price1',    name: 'btc',       type: 'line' } ).show()
       chart3( 'okc',   data, G )
        .data( { key: 'ask2',      name: 'okc ask',   type: 'area', color: 'rgba(255, 0, 0, 20)' },
               { key: 'bid2',      name: 'okc bid',   type: 'area', color: 'rgba(255, 0, 0, 40)' },
               { key: 'price2',    name: 'okc',       type: 'line' } ).show()
        chart3( 'compare',   data, G )
        .data( { key: 'ask1',      name: 'btc ask',   type: 'area', color: 'rgba(0, 0, 255, 50)' },
               { key: 'bid1',      name: 'btc bid',   type: 'area', color: 'rgba(0, 0, 255, 70)' },
            //    {key: 'price1',    name: 'btc',       type: 'line' },
               { key: 'ask2',      name: 'ok ask',    type: 'area', color: 'rgba(255, 0, 0, 20)' },
               { key: 'bid2',      name: 'ok bid',    type: 'area', color: 'rgba(255, 0, 0, 40)' }
            //    {key: 'price2',    name: 'ok',        type: 'line' }
            ).show()
        chart3( 'average',   data, G )
        .data( { key: 'disparity', name: 'disparity', type: 'area' },
               { key: 'sma',       name: 'SMA',       type: 'line' } ).show()
        chart3( 'modified',  data, G )
        .data( { key: 'price2',    name: 'okc',       type: 'area' },
               { key: 'modified1', name: 'btc adj',   type: 'area' } )
        .show()
        chart3( 'yoyo',      data, G )
        .data( { key: 'yoyo',      name: 'updown',    type: 'area' },
               { key: 'posOpper',  name: 'pos',       type: 'area' },
               { key: 'negOpper',  name: 'neg',       type: 'area' } ).show()
        chart3( 'flexion',   data, G )
        .data( { key: 'flexion',   name: 'flexion',   type: 'bar'  },
               { key: 'positive',  name: 'positive',  type: 'line' },
               { key: 'negative',  name: 'negative',  type: 'line' } )
        .show()
    },
    nextLine: () => {
            let nline = {}
            price1 = wdata[next].price1 || price1
            price2 = wdata[next].price2 || price2
            bid1   = wdata[next].bid1   // || bid1
            bid2   = wdata[next].bid2   // || bid2
            ask1   = wdata[next].ask1   // || ask1
            ask2   = wdata[next].ask2   // || ask2
            nline.price1 = price1
            nline.price2 = price2
            nline.bid1   = bid1
            nline.ask1   = ask1
            nline.bid2   = bid2
            nline.ask2   = ask2
            nline.disparity = (price1 && price2) ? price2 - price1 : null
            nline.sma       = data.map(v => v.disparity).slice(-sma + 1).concat(nline.disparity).average()
            nline.modified1 = price1 ? price1 + nline.sma : null
            nline.yoyo      = price2 && nline.modified1 ? price2 - nline.modified1 : null
            nline.flexion   = null
            nline.positive  = null
            nline.negative  = null
            let yoyo3 = data.map(v => v.yoyo).slice(-2).concat(nline.yoyo)
            if (data[last - 1].yoyo > 0) {
                nline.posOpper = ( pos = bid2 - ask1 - nline.sma )
                let flexion = (yoyo3[0] <= yoyo3[1] && yoyo3[1] >= yoyo3[2]) ? yoyo3[1] : 0
                data[last - 1].flexion = flexion
                if (flexion)
                    data[last - 1].positive = data.map(v => v.positive).filter(v => v > 0).slice(-last_n).concat(flexion).average()  }
            else if (data[last - 1].yoyo < 0) {
                nline.negOpper = ( neg = ask2 - bid1 - nline.sma )
                let flexion = (yoyo3[0] >= yoyo3[1] && yoyo3[1] <= yoyo3[2]) ? yoyo3[1] : 0
                data[last - 1].flexion = flexion
                if (flexion)
                    data[last - 1].negative = data.map(v => v.negative).filter(v => v < 0).slice(-last_n).concat(flexion).average()  }
            G.flexion.load(data)
            G.keys().map(k => G[k].flow(nline))
            data.shift()
            data.push(nline)
            // console.log(nline, next)
            next++
    }
})).onRendered(o => () => {
    __.whenCollectionsReady('Depth', o.draw)
    $('body').mouseup(e => {
        e.stopImmediatePropagation()
        o.nextLine()
        return false })
}).build('robot2')
