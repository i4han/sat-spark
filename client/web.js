
let c3 = require('c3')

__.Module('web').head({
    title: Settings.title
}).template(function() {
    return blaze.Include(this, 'yield')
}).build()

__.Module('abc').properties({path:'abc', layout:'web'}
).template(() => html.P(this, __.ID('chart'))
).onRendered(() => {
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            columns: [
                ['data1', 300, 350, 300, 0, 0, 0],
                ['data2', 130, 100, 140, 200, 150, 50] ],
            types: {
                data1: 'area',
                data2: 'area-spline' } } })
}).build()
