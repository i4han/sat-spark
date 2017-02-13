'use strict'

let c3 = require('c3')

class Chart3 {
    constructor (name, chart, obj) {
        this._name = name
        this._chart = chart
        this._config = { bindto: '#' + name, point: { r: 2 }}
        this._config = __.object(this._config, 'data.json',  chart)
        if (__.isObject(obj)) {
            obj[name] = this
            this.o = obj } }
    data(...a) {
        let names = {}, types = {}, keys = []
        a.forEach((v, i) => {
            keys[i] = v.key
            names[v.key] = v.name
            types[v.key] = v.type })
        this._keys = keys
        let serial = keys.reduce(((a, k) => a.concat(this._chart.map(v => v[k]))), [])
        this._config = __.object(this._config, 'line.connectNull', true)
        this._config = __.object(this._config, 'data.keys', {value: keys})
        this._config = __.object(this._config, 'data.names', names)
        this._config = __.object(this._config, 'data.types', types)
        this._config = __.object(this._config, 'axis.y.max', Math.max.apply({}, serial))
        this._config = __.object(this._config, 'axis.y.min', Math.min.apply({}, serial))
        return this }
    show() {
        this._c3 = c3.generate(this._config)
        return this }
    load(o) {
        this._c3.load({json: o, keys:{value: this._keys}, duration:0}) }
    flow(row) {
        console.log('flow:', row, this._keys)
        // if (['flexion', 'yoyo', 'modified', 'average', 'two'].indexOf(this._name) !== -1 ) return this
        this._c3.flow({json: [row], keys:{value: this._keys}, duration:0})
        console.log('flow ok')
    } }

const chart3 = (name, chart, obj) => new Chart3(name, chart, obj)

let last = 100, next = 100, chart = [], sma = 19, last_n = 7, G = {}, time = 0
let data1, data2, d1, d2

__.Module('robot').router({path:'t2', layout:'web'}
).template(() => [
        __.CLASS('row', __.ID('two' )),
        __.CLASS('row', __.ID('average')),
        __.CLASS('row', __.ID('modified' )),
        __.CLASS('row', __.ID('yoyo')),
        __.CLASS('row', __.ID('flexion'))
]).properties(o => ({
    draw: (m) => {
        if (!__.allCollectionsReady('bcTradesClean', 'okTradesClean')) return
        data1 = m.Db.bcTradesClean.find({}).map(v => v)
        data2 = m.Db.okTradesClean.find({}).map(v => v)
        d1 = data1.slice(0, last).map(v => v.price)
        d2 = data2.slice(0, last).map(v => Number(v.price))
        for(let i = 0; i < last; i++) {
            chart[i] = {}
            chart[i].price1    = d1[i]
            chart[i].price2    = d2[i]
            chart[i].disparity = d1[i] - d2[i]
            chart[i].sma       = __.average.apply([], __.lastN(chart.slice(0, i + 1).map(v => v.disparity), sma))
            chart[i].modified2 = d2[i] + chart[i].sma
            chart[i].yoyo      = d1[i] - chart[i].modified2
            chart[i].flexion   = null
            if (i < 2) continue
            let yoyo3 = __.lastN(chart.slice(0, i + 1).map(v => v.yoyo), 3)

            chart[i - 1].positive = undefined
            chart[i - 1].negative = undefined
            if (chart[i - 1].yoyo > 0) {
                let flexion = (yoyo3[0] <= yoyo3[1] && yoyo3[1] >= yoyo3[2]) ? yoyo3[1] : 0
                if ( (chart[i - 1].flexion = flexion) > 0 )
                    chart[i - 1].positive = __.average.apply([], __.lastN(
                        chart.slice(0, i - 1).map(v => v.positive), last_n, v => v > 0 ).concat(flexion) ) }
            else if (chart[i - 1].yoyo < 0 ) {
                let flexion = (yoyo3[0] >= yoyo3[1] && yoyo3[1] <= yoyo3[2]) ? yoyo3[1] : 0
                if ( (chart[i - 1].flexion = flexion) < 0 )
                    chart[i - 1].negative = __.average.apply([], __.lastN(
                        chart.slice(0, i - 1).map(v => v.negative), last_n, v => v < 0 ).concat(flexion) ) } }
        chart[last - 1].positive = undefined
        chart[last - 1].negative = undefined

        chart3('two',      chart, G)
        .data( {key: 'price1',    name: 'btcchina',  type: 'area' },
               {key: 'price2',    name: 'okcoin',    type: 'area' } )
        .show()
        chart3('average',  chart, G)
        .data( {key: 'disparity', name: 'disparity', type: 'area' },
               {key: 'sma',       name: 'SMA',       type: 'line' } )
        .show()
        chart3('modified', chart, G)
        .data( {key: 'price1',    name: 'btcchina',  type: 'area' },
               {key: 'modified2', name: 'adjust',    type: 'area' } )
        .show()
        chart3('yoyo',     chart, G)
        .data( {key: 'yoyo',      name: 'updown',    type: 'area' } )
        .show()
        chart3('flexion',  chart, G)
        .data( {key: 'flexion',   name: 'flexion',   type: 'bar'  },
               {key: 'positive',  name: 'positive',  type: 'line' },
               {key: 'negative',  name: 'negative',  type: 'line' } )
        .show()
    },
    nextLine: () => {
            let nline = {}
            let price1 = data1[next].price
            let price2 = Number(data2[next].price)
            nline.price1 = price1
            nline.price2 = price2
            nline.disparity = price1 - price2
            nline.sma = __.average.apply([],
                 __.lastN(chart.map(v => v.disparity), sma - 1).concat(nline.disparity) )
            nline.modified2 = price2 + nline.sma
            nline.yoyo      = price1 - nline.modified2
            nline.flexion   = undefined
            nline.positive  = undefined
            nline.negative  = undefined
            let yoyo3 = __.lastN(chart.map(v => v.yoyo), 2).concat(nline.yoyo)
            console.log('last:b', chart[last - 1])
            if (chart[last - 1].yoyo > 0) {
                let flexion = (yoyo3[0] <= yoyo3[1] && yoyo3[1] >= yoyo3[2]) ? yoyo3[1] : 0
                chart[last - 1].flexion = flexion
                if (flexion) chart[last - 1].positive = __.average.apply([],
                    __.lastN(chart.slice(0, last - 1).map(v => v.positive), last_n, w => w > 0).concat(flexion) ) }
            else if (chart[last - 1].yoyo < 0) {
                let flexion = (yoyo3[0] >= yoyo3[1] && yoyo3[1] <= yoyo3[2]) ? yoyo3[1] : 0
                chart[last - 1].flexion = flexion
                if (flexion) chart[last - 1].negative = __.average.apply([],
                    __.lastN(chart.slice(0, last - 1).map(v => v.negative), last_n, w => w < 0).concat(flexion) ) }
            console.log('last:', time++, chart[last - 1], 'nline', nline)
            G.flexion.load(chart)
            __.keys(G).map(k => G[k].flow(nline))
            chart.shift()
            chart.push(nline)
            // console.log(nline, next)
            next++
    }
})).onRendered(o => () => {
    __.whenCollectionsReady('bcTradesClean', 'okTradesClean', o.draw)
    $('body').mouseup(e => {
        e.stopImmediatePropagation()
        o.nextLine()
        return false })
}).build('robot')
