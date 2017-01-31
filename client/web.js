
let c3 = require('c3')

let draw = () => new Promise((resolve, reject) => {
})

//var data1 = ['data1'].concat(__._db.bcTrades.find({}).map(i => i.price))

__.Module('web').router({
    defaultLayout: true
}).head({
    title: Settings.title,
    meta: {name:"viewport", content:"width=device-width, initial-scale=1"}
}).template(function() {
    return __.CLASS('container-fluid',
        blaze.Include(this, 'yield'))
}).build('web')

__.Module('graph').router({path:'graph', layout:'web'}  // router
//).template(function() { return [__.ID('graph'), html.H1({}, blaze.Each(this, 'ok', __.LOOK(this, 'lookup')))] }
).template(function() { return [__.ID('graph'), html.H1({}, blaze.Each(this, 'ok', () => __.LOOK(this, 'lookup')))] }
).helpers({ //lookup: () => 'ok',
ok: () => [{lookup: 'a'}, {lookup: 'b'}, {lookup: 'ok'}]
}).onRendered(() => {
    let chart = c3.generate({
        bindto: '#graph',
        data: {
            columns: [
                ['data1', 170, 120, 100, 110, 170, 30],
                ['data2', 130, 100, 140, 200, 150, 50] ],
            types: {
                data1: 'area-spline',
                data2: 'area-spline' } } })
}).build('graph')
