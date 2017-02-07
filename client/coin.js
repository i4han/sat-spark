'use strict'

let c3 = require('c3')

class Chart3 {
    constructor (name, obj) {
        this._name = name
        this._config = { bindto: '#' + name, point: { r: 2 }}
        if (__.isObject(obj)) {
            this.o = obj
            this.o.charts = this.o.charts || {}
            this.o.charts[name] = this
            this.o.chartTitles = this.o.chartTitles || {}
            this.o.chartTitles[name] = []
            this.o.title  = this.o.title  || {}
            this.o._title = this.o._title || {} } }
    data(...a) {
        this.d = a
        return this }
    titles(...o) {
        let columns = [], types = {}
        o.forEach((v, i, a) => {
            if (__.isString(v)) v = this.o._title[v]
            else if (this.o) {
                this.o.title[v.title] = this.d[i]
                this.o.chartTitles[this._name].push(v.title)
                this.o._title[v.title] = v }
            columns[i] = [v.label].concat(this.d[i])
            types = __.object(types, v.label, v.type) })
        this._config = __.object(this._config, 'data.columns', columns)
        this._config = __.object(this._config, 'data.types',   types  )
        let serial = [].concat.apply([], this.d)
        this._config = __.object(this._config, 'axis.y.max', Math.max.apply({}, serial))
        this._config = __.object(this._config, 'axis.y.min', Math.min.apply({}, serial))
        return this }
    show() {
        console.log(this._config)
        console.log(this.o)
        this._c3 = c3.generate(this._config)
        return this } }

const chart3 = (name, obj) => new Chart3(name, obj)

__.Module('trade').router({path:'trade', layout:'web'}
).template(() => [
        __.CLASS('row', __.ID('two' )),
        __.CLASS('row', __.ID('average')),
        __.CLASS('row', __.ID('adjust' )),
        __.CLASS('row', __.ID('analyse')),
        __.CLASS('row', __.ID('inflextion')),
        __.CLASS('row', __.ID('decision'  ))
]).properties(o => ({
    draw: (m) => {
        if (!__.allCollectionsReady('bcTradesClean', 'okTradesClean')) return
        let d1 = m.Db.bcTradesClean.find({}).map(v => v)
        let d2 = m.Db.okTradesClean.find({}).map(v => v)

        let G = {}
        chart3('two', G).data(
            d1.map(v => v.price),
            d2.map(v => v.price) ).titles(
            {title: 'btc',     label: 'btcchina',     type: 'area-spline'},
            {title: 'okc',     label: 'okcoin',       type: 'area-spline'} ).show()
        let diff
        chart3('average', G).data(
            (diff = __.coMap(G.title.btc, G.title.okc, (a, b) => a - b)),
            __.nReduce(diff, 19, __.average) ).titles(
            {title: 'average', label: 'average',      type: 'area-spline'},
            {title: 'line',    label: 'line',         type: 'spline'     } ).show()
        chart3('adjust', G).data(
            G.title.btc,
            __.coMap(G.title.okc, G.title.line,   (a, b) => Number(a) + Number(b)) ).titles(
            'btc',
            {title: 'adjust',  label: 'adjust',       type: 'area-spline'} ).show()
        chart3('analyse', G).data(
            __.coMap(G.title.btc, G.title.adjust, (a, b) => Number(a) - Number(b)) ).titles(
            {title: 'updown',  label: 'updown',       type: 'area-spline'} ).show()
        let n = 7, power = 1
        let inflex, positive, negative
        chart3('inflextion', G).data(
            (inflex = __.inflextion(G.title.updown)),
            (positive = __._linearArray(inflex, n, __.average, (v => v > 0), 0)),
            (negative = __._linearArray(inflex, n, __.average, (v => v < 0), 0)),
            positive.map(v => v * power).reduce(((a,v,i) => i > 0 && v === 0 ? a.concat(a[i - 1]) : a.concat(v)), []),
            negative.map(v => v * power).reduce(((a,v,i) => i > 0 && v === 0 ? a.concat(a[i - 1]) : a.concat(v)), []) ).titles(
            {title: 'inflex',  label:'inflextion',    type: 'bar' },
            {title: 'positive',label:'positive',      type: 'line'},
            {title: 'negative',label:'negative',      type: 'line'},
            {title: 'posLine', label:'posline',       type: 'line'},
            {title: 'negLine', label:'negline',       type: 'line'} ).show()
        chart3('decision', G).data(
            __.coMap(G.title.inflex, G.title.posLine, (a, b) => a > b ? a : 0),
            __.coMap(G.title.inflex, G.title.negLine, (a, b) => a < b ? a : 0) ).titles(
            {title: 'posDec',  label: 'pos-decision', type: 'bar'},
            {title: 'negDec',  label: 'neg-decision', type: 'bar'} ).show()
        console.log(G)
        __.keys(G.charts).forEach(v => console.log(v))
        let btc = {coin: 1, money: 6799} // 6835, 6799
        let okc = {coin: 1, money: 6835} // 6799, 6835 = 27268
        let begin = 27268
        let c_amount, m_amount
        const buy = (a, t) => {
            if (a.money !== 0) {
                c_amount = a.money / Number(t.price)
                a.coin   = a.coin + c_amount
                a.money  = 0 }
            else console.log('No money to buy coin!') }
        const sell = (a, t) => {
            if (a.coin !== 0) {
                m_amount = a.coin * Number(t.price)
                a.money  = a.money + m_amount
                a.coin   = 0 }
            else console.log('No coin to sell!') }
        const up = i => {
            sell(btc, d1[i])
            buy (okc, d2[i]) }
        const down = i => {
            buy (btc, d1[i])
            sell(okc, d2[i]) }
        let rate = 0.77
        for(let i = 1; i < d1.length - 1; i++)
            if (G.title.updown[i] > G.title.posLine[i - 1] * rate) up(i)
            else if (G.title.updown[i] < G.title.negLine[i - 1] * rate) down(i)
        sell(okc, d2[d2.length - 1])
        sell(okc, d2[d2.length - 1])
        let total = btc.money + okc.money
        rate = 27304
        console.log(total, total - begin)
        console.log('RATE', rate)
        console.log('RETURN', (total - begin) * 100/begin )
    }
})).onRendered(o => () => {
    __.whenCollectionsReady('bcTradesClean', 'okTradesClean', o.draw)
}).build('trade')
