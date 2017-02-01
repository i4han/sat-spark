
let c3 = require('c3')

let draw = () => new Promise((resolve, reject) => {
})

//var data1 = ['data1'].concat(__._db.bcTrades.find({}).map(i => i.price))

__.Module('web').router({
    defaultLayout: true
}).head(o => ({
    title: o.Settings.title,
    meta: {name:"viewport", content:"width=device-width, initial-scale=1"}
})).template(function() {
    return __.CLASS('container-fluid',
        blaze.Include(this, 'yield'))
}).build('web')

__.Module('graph').router({path:'graph', layout:'web'}
).template(function() {
    return [__.ID('graph'), html.H1({}, blaze.Each(this, 'ok', () => __.LOOK(this, 'lookup')))]
}).helpers({ //lookup: () => 'ok',
    ok: () => [{lookup: 'a'}, {lookup: 'b'}, {lookup: 'ok'}]
}).properties(o => ({
    draw: (m) => {
        if (!__.allCollectionsReady('bcTrades', 'okTrades')) return
        let data1 = m.Db.bcTrades.find({}).map(obj => obj.price).slice(-20)
        // let data2 = m.Db.okTrades.find({}).map(obj => obj)
        c3.generate({
            bindto: '#graph',
            data: {
                columns: [['data1'].concat(data1),
                    ['data2', 6500,6600, 6140, 6200, 6150, 6500] ],
                types: {
                    data1: 'area-spline',
                    data2: 'area-spline' } } }) }
})).onRendered(o => () => {
    __.whenCollectionsReady('bcTrades', 'okTrades', o.draw)
}).build('graph')
