
__.Module('web')
.router({ defaultLayout: true })
.head(o => ({
    title: o.Settings.title,
    meta: {name:"viewport", content:"width=device-width, initial-scale=1"}  }))
.template(function() {
    return __.CLASS('container-fluid', blaze.Include(this, 'yield'))  })
.onRendered(o => () => {
    style$('html').set('overflow', 'scroll')  })
.build('web')

__.Module('blank')
.template( function() { return blaze.Include(this, 'yield') } )
.build('blank')
