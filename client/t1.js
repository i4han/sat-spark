
let c3 = require('c3')
// let in$ = require('incredibles')

__.Module('graph').router({path:'t1', layout:'web'}
).template(() => [
        __.CLASS('row', __.ID('graph1' )),
        __.CLASS('row', __.ID('average')),
        __.CLASS('row', __.ID('adjust' )),
        __.CLASS('row', __.ID('analyse')),
        __.CLASS('row', __.ID('inflextion')),
        __.CLASS('row', __.ID('decision'  ))
]).style({
    // '.row':     {flexDirection: 'column'},
    // '#graph1':  {height: 320, width:'100%', backgroundColor: '#eee'},
    // '#average': {height: 320, width:'100%', backgroundColor: '#eee'},
    // '#adjust':  {height: 320, width:'100%', backgroundColor: '#eee'},
    // '#analyse': {height: 320, width:'100%', backgroundColor: '#eee'},
    // '#end': {position: 'fixed', bottom: '1200px'}
}).properties(o => ({
    draw: (m) => {
        if (!__.allCollectionsReady('bcTradesClean', 'okTradesClean')) return
        let d1 = m.Db.bcTradesClean.find({}).map(v => v)
        let d2 = m.Db.okTradesClean.find({}).map(v => v)
        let data1 = in$(d1.map(v => v.price))
        let data2 = in$(d2.map(v => v.price))
        console.log(d1[0], d1[d1.length -1], d1.length)
        let data3 = in$([1,2,3]) // args?
        let data4 = in$([4,3,5])
        c3.generate({ bindto: '#graph1',
            axis:  { y: { max: 6850, min: 6780 } },
            point: { r: 2},
            data:  {
                columns: [['btcchina'].concat(data1),
                          ['okcoin']  .concat(data2)],
                types: { btcchina: 'area-spline', okcoin: 'area-spline' } } })
        let diff = __.coMap(data1, data2, (a, b) => a - b)
        let aver = __.nReduce(diff, 19, __.average)
        c3.generate({
            bindto: '#average',
            axis: { y: { max: Math.max.apply({}, diff), min: Math.min.apply({}, diff) } },
            point: {r: 2},
            data: {
                columns: [['average'].concat(diff),
                          ['line']   .concat(aver)],
                types: { average: 'area-spline', line: 'spline' } } })
        let adjust = __.coMap(data2, aver, (a, b) => Number(a) + Number(b))//.map(a => Number(a))
        c3.generate({
            bindto: '#adjust',
            axis:  { y: { max: 6850, min: 6780 } },
            point: {r: 2},
            data: {
                columns: [['btcchina'].concat(data1),
                          ['okcoina'] .concat(adjust)],
                types: { btcchina: 'area-spline', okcoina: 'area-spline' } } })
        let updown = __.coMap(data1, adjust, (a, b) => Number(a) - Number(b))
        c3.generate({
            bindto: '#analyse',
            axis: { y: { max: Math.max.apply({}, updown), min: Math.min.apply({}, updown) } },
            point: {r: 2},
            data: {
                columns: [['average'].concat(updown)],
                types: { average: 'area-spline'} } })

        let fillGap = (a, novalue) => {
            for(let i = 0; i < a.length; i++)
                if (novalue === a[i] && i > 0)
                    a[i] = a[i - 1] }
        let inflex = __.inflextion(updown)
        let xx = inflex, n = 7, power = 1
        let positive = __._linearArray(xx, n, __.average, (v => v > 0), 0)
        let negative = __._linearArray(xx, n, __.average, (v => v < 0), 0)
        let posline  = positive.map(v => v * power)
        let negline  = negative.map(v => v * power)
        fillGap(posline, 0)
        fillGap(negline, 0)
        //  inArray, inObject inVar
        c3.generate({
            bindto: '#inflextion',
            axis: { y: { max: Math.max.apply({}, inflex), min: Math.min.apply({}, inflex) } },
            point: {r: 2},
            data: {
                columns: [['inflextion'].concat(inflex  ),
                          ['positive'  ].concat(positive),
                          ['negative'  ].concat(negative),
                          ['posline'   ].concat(posline ),
                          ['negline'   ].concat(negline ) ],
                types: { inflextion: 'bar', positive: 'line', negative: 'line', posline: 'line', negline: 'line' } } })
        let posDecision = __.coMap(inflex, posline, (a, b) => a > b ? a : 0)
        let negDecision = __.coMap(inflex, negline, (a, b) => a < b ? a : 0)
        c3.generate({
            bindto: '#decision',
            axis: { y: { max: Math.max.apply({}, inflex), min: Math.min.apply({}, inflex) } },
            point: {r: 2},
            grid: {y: {lines: {value: 0}}},
            data: {
                columns: [['posDecision'].concat(posDecision),
                          ['negDecision'].concat(negDecision)],
                types: { posDecision: 'bar', negDecision: 'bar' } } })

        btc = {coin: 1, money: 6799} // 6835, 6799
        okc = {coin: 1, money: 6835} // 6799, 6835 = 27268
        let begin = 27268
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
            if (updown[i] > posline[i - 1] * rate) up(i)
            else if (updown[i] < negline[i - 1] * rate) down(i)
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
}).build('graph')
