
let c3 = require('c3')

__.Module('web').router({
    defaultLayout: true
}).head(o => ({
    title: o.Settings.title,
    meta: {name:"viewport", content:"width=device-width, initial-scale=1"}
})).template(function() {
    return __.CLASS('container-fluid',
        blaze.Include(this, 'yield'))
}).onRendered(o => () => {
    style$('html').set('overflow', 'scroll')
}).build('web')

let xArray = require('xarray')
let xA = a => new xArray(a)

__.Module('graph').router({path:'graph', layout:'web'}
).template(() => [
        __.CLASS('row', __.ID('graph1' )),
        __.CLASS('row', __.ID('average')),
        __.CLASS('row', __.ID('adjust' )),
        __.CLASS('row', __.ID('analyse')),
        __.CLASS('row', __.ID('inflextion'))
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
        let data1 = m.Db.bcTradesClean.find({}).map(v => v.price)
        let data2 = m.Db.okTradesClean.find({}).map(v => v.price)
        let data3 = xA.apply({}, [1,2,3])
        let data4 = xA.apply({}, [4,3,5])
        c3.generate({ bindto: '#graph1',
            axis:  { y: { max: 6850, min: 6780 } },
            point: {r: 2},
            data:  {
                columns: [['btcchina'].concat(data1),
                          ['okcoin']  .concat(data2)],
                types: { btcchina: 'area-spline', okcoin: 'area-spline' } } })
        let diff = __.productArray(data1, data2, (a, b) => a - b)
        let aver = __.linearArray(diff, 20, __.average)
        c3.generate({
            bindto: '#average',
            axis: { y: { max: Math.max.apply({}, diff), min: Math.min.apply({}, diff) } },
            point: {r: 2},
            data: {
                columns: [['average'].concat(diff),
                          ['line']   .concat(aver)],
                types: { average: 'area-spline', line: 'spline' } } })
        let adjust = __.productArray(data2, aver, (a, b) => Number(a) + Number(b))//.map(a => Number(a))
        c3.generate({
            bindto: '#adjust',
            axis:  { y: { max: 6850, min: 6780 } },
            point: {r: 2},
            data: {
                columns: [['btcchina'].concat(data1),
                          ['okcoina'] .concat(adjust)],
                types: { btcchina: 'area-spline', okcoina: 'area-spline' } } })
        let updown = __.productArray(data1, adjust, (a, b) => Number(a) - Number(b))
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
                    a[i] = a[i - 1]
        }
        let inflex = __.inflextion(updown)
        let xx = inflex, n = 7, power = 1.2
        let positive = __._linearArray(xx, n, __.average, (v => v > 0), 0)
        let negative = __._linearArray(xx, n, __.average, (v => v < 0), 0)
        let posline = positive.map(v => v * power)
        let negline = negative.map(v => v * power)
        //  inArray, inObject inVar
        c3.generate({
            bindto: '#inflextion',
            axis: { y: { max: Math.max.apply({}, inflex), min: Math.min.apply({}, inflex) } },
            point: {r: 2},
            data: {
                columns: [['inflextion'].concat(inflex),
                          ['positive']  .concat(positive),
                          ['negative']  .concat(negative),
                          ['posline']   .concat(posline),
                          ['negline']   .concat(negline) ],
                types: { inflextion: 'bar', positive: 'line', negative: 'line', posline: 'line', negline: 'line' } } })

    }
})).onRendered(o => () => {
    __.whenCollectionsReady('bcTradesClean', 'okTradesClean', o.draw)
}).build('graph')
