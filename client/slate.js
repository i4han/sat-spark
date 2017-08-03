'use strict'

let api = require('incredibles')
let color = api.color(require('color'), '#0000ff', 80)
let get = v => {
    api.from(v.offices).forEach((w,i) => {
        let pieces = api.from(w.pieces || [])
        let price =  api.from(w.price  || [])
        pieces.forEach( x=>
            x.mailings.push({code: 'Total', count: api.from(x.mailings).sum(y=>y.count).value })  )
        w.slates = pieces.intersection(price, (x, y) => x.slate === y.slate)
            .forEach(z=> z.sum = api.from(z.mailings).lastValue.count * Number(z.price)).value
    })
    Session.set('data', v)
}

Meteor.setTimeout(( () => get(restful) ), 2000)

api.module( 'blank', v=>v.include('yield') )

api.define( 'navbar', (v, f)=>v
    .class( 'navbar navbar-primary navbar-fixed-top', v=>v.class( 'container', v=>v
        .DIV( {class:'collapse navbar-collapse', id:'ba-example-navbar-collapse-1'}, v=>v
            .UL( {class: 'nav navbar-nav'}, f )  )  )  )  )
api.define( 'menu', (v, menu, link)=>v .LI( v=>v.A( {href:link}, menu ) ) )
api.define( 'attrMenu', (v, attr, menu )=>v .LI( v=>v.A( attr, menu ) ) )
api.define( 'dropdown', (v, name, subMenu)=>v
    .LI( {class:'dropdown'}, v=>v       //  role:'button', 'aria-expanded':'false'
        .A( {href:'#', class:'dropdown-toggle', 'data-toggle':'dropdown', 'aria-haspopup':'true'}, name, v=>v
            .SPAN( {class:'caret'} )  )
        .UL( {class:'dropdown-menu'}, subMenu )  )  )
api.define( 'divider', v=>v. LI( {role:'seperator', class:'divider'} ) )
api.define( 'icon', (v, name, size)=>v
    .SPAN( {class: 'glyphicon glyphicon-' + name, style:'font-size:'+ addPx([size || 10])}, '' )  )
api.define( 'linefeed', (v, a) => v.DIV({style:'height:' + addPx([a]) }, '') )
api.define( 'line',  (v, ...a) => v.class( 'flex-space',  v=> a.reduce(((b, w) => b.class('word', w)), v) )  )
api.define( 'hr',    (v, w) => v
    .class( 'flex-space',  v=>v.class('hr').class('hr-text', w).class('hr') )  )

let countyList = (i, c) => v=>v.each('county'+c, v=>v.attrMenu({class:'county-code column-' + i +'!', id:'{id}'}, '{id} - {county}'))

api.define( 'countyTab', (v, menu, id, link)=>v.LI( {id:'county-tab'}, v=>v.A( {id:id, href:link}, menu) ) )
api.define( 'countyDropdown', (v,i)=>v
    .LI( {class:'dropdown'}, v=>v
        .A( {href:'#', class:'dropdown-toggle', 'data-toggle':'dropdown', id:'dropdown-caret'}, '', v=>v.SPAN({class:'caret'}) )
        .UL( {class:'dropdown-menu multi-column columns-3'}, v=>v
            .class( 'row', v=>v
                .for( [0, 1, 2], (v, index)=>v
                    .DIV( {class:'col-sm-4'}, v=>v .UL({class:'multi-column-dropdown'}, countyList(i, index)) )  )  )  )  )  )

let counties = ['19 - Los Angeles', '30 - Orange', '40 - San Luis Obispo', '37 - San Diego', '10 - Fresno']
api.define( 'countyBar', v=>v
    .NAV( {class: 'tabbar', role:'navigation'}, v=>v
        .DIV( {class: 'collapse navbar-collapse', id:'ba-example-navbar-collapse-1'}, v=>v
            .UL( {class: 'nav navbar-nav'}, v=>v
                .for([0, 1, 2, 3, 4], (v,i)=>v
                    .countyDropdown(i)
                    .countyTab(counties[i], 'county-tab-' + i, '#')  )  )  )  )  )

api.define( 'modal', (v, title, id, body, submit, cancel)=>v
    .DIV( {class:'modal fade', id: id, role: "dialog", 'aria-labelledby': id}, v=>v
        .class( 'modal-dialog', v=>v.class( 'modal-content', v=>v .FORM({method: 'post', id:'form'+id}, v=>v
            .class( 'modal-header', v=>v
                .BUTTON( {type:'button', class:'close', dataDismiss:'modal'}, v=>v.icon('remove', 18) )
                .H4( {class:'modal-title'}, title )  )
            .class( 'modal-body', body )
            .class( 'modal-footer', ( 'function' === typeof submit ? submit : ( v=>v
                .BUTTON( {type:'button', class:'btn-0', dataDismiss:'modal'}, (cancel || 'Cancel') )
                .BUTTON( {type:'button', class:'btn-2', dataDismiss:'modal'}, submit )  )))  )))  )  )

api.define( 'underline', (v, label)=>v
    .class( 'input-group', v=>v
        .raw( '<INPUT type="text" required>' )
        .SPAN( {class: 'highlight'} )
        .SPAN( {class: 'bar'} )
        .LABEL( {class: 'input-label'}, label )
) )
let bdw = (...v) => ({borderWidth: addPx(v)})
let tagSurfix = ['Top', 'Right', 'Bottom', 'Left']
api.mixin( 'bdis', (t, r, b, l, v)=> // border Individual sides
    api.from(bdw(t, r, b, l)).add( [t,r,b,l].reduce((a,w,i)=> w ? Object.assign(a, {['border' + tagSurfix[i]]:v}) : a), {} ).value )
api.mixin( 'bd', (w, c)=>({border: addPx([w]) + ' solid ' + (isNaN(c) ? c : color(c))}) )
let button = (cls, t) => api.css({
    [cls]:           {colorSet:[0, t], border: 2, size:[120, 40], marginLeft: 14}
  , [cls+':hover']:  {colorSet:[t, 0], bd:[2, t]}
  , [cls+':active']: {colorSet:[t, 0], bd:[2, t], outline: 'none', boxShadow: 'inset 0 5px 5px rgba(0,0,0, .2)' }
  , [cls+':focus']:  {colorSet:[t, 0], bd:[2, t]}
})
button('.btn-0', color(5))
button('.btn-1', color(1))
button('.btn-2', color(2).darken(0.4))

api.css({
    '.input-group > input':  { background: color(0).fade(1), fontSize:15, padding: 2, display: 'block', width:300, bdis:[0,0,1,0, '1px solid ' + color(0).darken(0.4).string()] }
  , '.bar':   { position:'relative', display:'block', width:300 }
  , '.dialog-title': { fontSize: 16, fontWeight: 400, marginBottom: 30 }
  , '.bar:before, .bar:after': { bg:[1] }
  , '.input-label': { color: color(0).darken(0.6), fontSize:15, fontWeight: 400, left:2, top:5, position: 'absolute' }
  , 'input:focus ~ .input-label, input:valid ~ .input-label': { top:-20, fontSize: 13, color: color(0).darken(0.4) }
})

api.define( 'addCandidate', v=>v
    .class( 'dialog-title' )
    .class( 'flex', v=>v
        .class( 'col-md-6', v=>v
            .linefeed( 20 )
            .underline( 'Candidate Name')
            .underline( "Candidate's Phone" )
            .underline( "Candidate's Email" )
            .underline( 'Note'  )  )
        .class( 'col-md-6', v=>v
            .linefeed( 20 )
            .underline( 'Consultant Name')
            .underline( "Consultant's Phone" )
            .underline( "Consultant's Email" )  )  )  )

api.mixin( 'colorSet', (text, bg)=>({color: (isNaN(text) ? text : color(text)), background: (isNaN(bg) ? bg : color(bg))}) )
api.mixin( 'luminate', (text, bg, lt)=>({color:color(text), background: lt < 0 ? color(bg).darken(-lt) : color(bg).lighten(lt)}) )
api.css({
    '.navbar-primary':   { luminate:[0, 1, -0.6], border: 0, zIndex: 2000 }
  , '.navbar-primary a': { color: color(0) }
  , '.navbar-primary .nav > li > a:hover': { luminate:[4, 1, 0.6] } //
  , '.navbar-primary .nav > li > a:focus': { luminate:[4, 1, 0.8] } // color(1, v=>v.lightne(0.8) 'lite8')
  , '.navbar-primary .nav > li > .active': { luminate:[4, 1, 0.8] } // color.li8
  , '.tabbar':               { luminate:[0, 1, 0.4],  zIndex: 1000 }
  , '#county-tab > a:hover': { luminate:[4, 1, 0.8] }
  , '#county-tab > a:focus': { colorSet:[4, 0] }
  , '#county-tab > .active': { colorSet:[4, 0] }
  , '#dropdown-caret:hover': { luminate:[1, 1, 0.6] }
  , '#dropdown-caret:focus': { luminate:[1, 1, 0.6] }
  , '#dropdown-caret': { luminate:[0, 1, 0.4], pad:[15, 12] }
  , 'button:active': {outline: 'none'}
  , '.dropdown-menu > li > a:hover, .dropdown-menu > li > a:focus': { luminate:[4, 1, 0.9] }
  , '.multi-column-dropdown li a:hover': { luminate:[4, 1, 0.9] }  })

api.module('slate')
.head( v=> ({ meta: { name:"viewport", content:"width=device-width, initial-scale=1" }  }) )
.body( v=>v
    .navbar( v=>v
        .menu( 'Home', '#' )
        .menu( 'Slate Status', '#' )
        .menu( 'Reports', '#')
        .dropdown( 'View/Edit', v=>v
            .menu( 'Action 1', '#' )
            .menu( 'Action 2', '#' )
            .divider()
            .menu( 'Action 3', '#' ) )
        .menu( 'Search', '/search' )
        .menu( 'Sales Sheet', '/sheet' )
        .menu( 'Candidate Proof Page', '#' )
        .attrMenu( {id:'sign-in-or-out-button'}, 'Sign In' ) )
    .countyBar()
    .include( 'yield' )
    .modal( 'Add Candiate', 'add-candidate', v=>v.addCandidate(), 'Send' )  )
.helpers( county )
.onStartup( () => {
    $('#form-add-candidate').on('hide.bs.modal', e=>{
        e.preventDefault()
        console.log(e)
    })
    api.getNode("head").appendChild(                // if (script.readyState)   //IE
        api.createNode('script').add({              //     script.onreadystatechange = () => {
            type: "text/javascript"                 //         if ( script.readyState === "loaded" || script.readyState === "complete" ) {
          , src:"https://apis.google.com/js/api.js" //             script.onreadystatechange = null
          , onload: () => handleClientLoad() })  )  //             handleClientLoad()  }  }
                                                    // else script.onload = () => handleClientLoad()
    let isAuthorized, currentApiRequest

    window.updateSigninStatus = (isSignedIn) => {
      if (isSignedIn) {
        isAuthorized = true
        if (currentApiRequest)
          sendAuthorizedApiRequest(currentApiRequest);
      } else
        isAuthorized = false
    }
    window.handleClientLoad = () => {
        window.GoogleAuth = {}
        gapi.load('client:auth2', ()=>
            gapi.client.init({
                apiKey: 'bqXjdyC9gFO0bzVPB0WM7O6V'
              , clientId: '540530020623-r2nhc8i2g59fff4di1cvqku3hiscagr8.apps.googleusercontent.com'
              , scope: 'email'
              //   'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            })
            .then( () => {
                GoogleAuth = gapi.auth2.getAuthInstance()
                GoogleAuth.isSignedIn.listen(updateSigninStatus)
                let user = GoogleAuth.currentUser.get()
                isAuthorized = user.hasGrantedScopes('email')
                if (isAuthorized) {
                    $('#sign-in-or-out-button').html('Sign out')
                    console.log('Signed in')
                } else {
                    $('#sign-in-or-out-button').html('Sign In')
                }
                $('#sign-in-or-out-button').click( () => GoogleAuth.isSignedIn.get() ? GoogleAuth.signOut() : GoogleAuth.signIn() )
                $('#revoke-access-button') .click( () => GoogleAuth.disconnect() )  })  )  }  })
.onRendered(o=>()=>{
    $('.navbar-primary li > a').click( (e, v) => {
        $('.navbar-primary li > a').removeClass()
        $(e.target).addClass('active')  })
    $('#county-tab > a').click( (e, v) => {
        $('#county-tab > a').removeClass()
        $(e.target).addClass('active')  })
    $('.county-code').click( (e,v) => {
        e.preventDefault()
        let i = e.target.className.match(/column-([0-5])!/)[1]
        let text = e.target.innerText
        // document.getElementById('county-tab-' + i).setAttribute('href', i)
        document.getElementById('county-tab-' + i).innerHTML = text })
    $('#sign-in-or-out-button').click( (e,v)=> {
        window.GoogleAuth.signIn()  })
})
.build('slate')

api.module( 'search', {path:'search', layout: 'slate'},  v=>v
    .for([-3, -2, -1, 0, 1, 2, 3, 4], (v,c)=>v.class('flex', v=>v
        .for('darken lighten desaturate fade'.split(' '), (v, method)=>v.class('flex', v=>v
            .for([0, 0.2, 0.4, 0.6, 0.8, 1], (v,n)=>v.DIV({style:'height:50px; width:50px; background:' + color(c)[method](n)}) )  )  )  )  )  )

api.define( 'title', (v, ...a)=> v.class( 'title', ...a ) )
api.define( 'price', (v, ...a)=> v
    .render(a[1]) ? v.class( 'price',  v=> a.reduce(((b, w) => b.class('word', w)), v) ) : v )
api.define( 'consultant', (v, ...a)=> v
    .render(a[1]) ? v.class( 'consultant', v=> a.reduce(((b, w) => b.class('word', w)), v) ) : v )
api.define( 'sales', (v, ...a)=> v
    .class( 'sales-item', v=> a.reduce(((b, w)=> b.class('word', w)), v) ) : v )
api.define( 'card',  (v, cardClass, title, body)=> v
    .class( 'card-container', v=>v
        .class( 'card-top', '_' )
        .class( 'card-title', v=>v .class( cardClass, title )  )
        .class( 'card-contents', body )  ))

let fontWeight = 500
let card = api({
    padding: 5
  , margin:  10
  , background: 'white'
  , borderRadius: 5
  , shadow:[3]
  , transition: '0.3s' }).cut()

let bodyMargin = 40
let padMargin = 5
let windowWidth = 1090
color.pad = color(0).darken(0.15)

api.module( 'slates', v=>v
    .each( 'slates', v=>v
        .card( 'slate-name', '{slate}', v=>v
            .each( 'mailings', v=>v
                .line( '{code}', v=>v
                    .lookup( '{count}', v=>Number(v).toLocaleString() )  )  )
            .linefeed(10)
            .price( 'Per Unit', '${price}' )
            .price( 'Price', v=>v.B(v=>v
                .lookup( '{sum}', v=>'$' + Number(v).toLocaleString() )  )  )
            .hr( 'sold')
            .each( 'sales', v=>v
                .with( 'candidate', v=>v.sales('{name}') )  )  )  )  )

let addPx = (a, n) => undefined === n ? a.map(v=>isNaN(v) ? v : v+'px').join(' ') : a.map(v=>v * n +'px').join(' ')

api.mixin( 'bg', v=>({background: isNaN(v) ? v : color(v) }) )
api.mixin( 'lightenBg', (c,v)=>({background: color(c).lighten(v)}) )
api.mixin( 'flexSpace', ()=> ({display: 'flex', justifyContent: 'space-between'}) )
api.mixin( 'fontSet', (size, weight)=>({fontSize: size, fontWeight: weight}) )
api.mixin( 'shadow', v=> ({ boxShadow: 0 === v ? 'none' : '0 4px 8px 0 rgba(0,0,0,0.'+ v +')' }) )
api.mixin( 'cardBottom', (v, w)=>({margin: addPx([0,v,v]), borderRadius: addPx([0,0,1,1], undefined === w ? v : w)}) )
api.mixin( 'cardTop',    (v, w)=>({margin: addPx([v,v,0]), borderRadius: addPx([1,1,0,0], undefined === w ? v : w)}) )
api.mixin( 'pad', (...v)=>({padding: addPx(v)}) )
api.mixin( 'mar', (...v)=>({margin:  addPx(v)}) )
api.css({
    '.title':      { fontSet:[20, fontWeight] }
  , '.title-code': { fontSet:[18, fontWeight - 100], pad:[2,0,0,8] }
  , '.word':       { pad:[0,5,0,5] }
  , '.flex-space': { flexSpace:[], flex: '1 100%' }
  , '.flex':       { display: 'flex' }
  , '.hr':         { borderBottom:'1px solid ' + color(2), size: ['100%', 16] }
  , '.hr-text':    { margin: 5}
  , '.sales-item': { flexSpace:[], colorSet:[0, color(2).lighten(0.4)], fontWeight: fontWeight, pad:[3] }
  , '.card-container': { flexBasis: 180, padding: 0, margin: 10 }
  , '.card-top':       { bg:[0], cardTop:[5], textIndent: -10000, height: 14, shadow: [2] }
  , '.card-title':     { bg:[0], mar:[0,5,0,0], shadow:[3] }
  , '.card-contents':  [card, {card: [240], padding:14, cardBottom:[5]}]
  , '.price':      { flexSpace:[], lightenBg:[1, 0.9] }
  , '.consultant': { flexSpace:[], lightenBg:[2, 0.9] }
})

api.mixin( 'card', width=>({ width: width, flexBasis: 180, cardTop:[0] }) )
api.mixin( 'title', pl=>({paddingLeft: pl, fontWeight: 500}))
api.mixin( 'size', (w, h)=> ({width: w, height: h}))
api.css({
    '.modal-dialog':    { top:100, width:700, right: -180, zIndex: 10000 }
  , '#s-button':        { colorSet:[0, 2], size:[40, 40], margin: 6, pad:[1,0,0,2], outline: 'none', lineHeight: 30, textAlign: 'center', border: 'none', borderRadius: '100%', position: 'relative', top: -17, zIndex: 10, boxShadow:  '0 4px 8px 0 rgba(0,0,0,0.2)'}
  , '#s-button:hover':  { colorSet:[2, 0], bd:[1, 2] }
  , '#s-button:active': { colorSet:[2, 0], bd:[1, 2], top: -14, right: -1, shadow:[0] }
  , '.content':         { pad:[0,15,0,15], bg: [0] }
  , '.office-title':   [{ flexSpace:[], background: color.pad, pad:[8,8,0], height: 40 }, {borderRadius: '5px 5px 0 0'}]
  , '.office-pad':     [{ cardBottom:[0, 5],  display: 'flex', flexFlow: 'row wrap', background: color.pad }, {marginBottom: 20}]
  , '.office-pad > *':  { padding: padMargin, display: 'flex' }
  , '.slates':          { flexBasis: 'auto', flexWrap: 'wrap', background: color.pad }
  , '.candidates':      { flexBasis: 'auto', flexShrink: '4'}
  , '.slate-name':      { card:[236], title:[16], pad:[5], colorSet:[0, 1]}
  , '.candidates-name': { card:[236], title:[16], pad:[5], colorSet:[0, color(2).darken(0.1)] }
  , '.sales':           { flexBasis:600 }
})

api.module('salesSheet')
.router({path: 'sheet', layout: 'slate'})
.body( v=>v
    .class( 'content', v=>v.with( 'data', v=>v.each( 'offices', v=>v
        .class( 'office-title', v=>v
            .class( 'flex-space', v=>v
                .class( 'flex', v=>v
                    .title( '{name}' )
                    .class( 'title-code', '{geo-code}' )  )
                .BUTTON( {id:'s-button', dataToggle:'modal', dataId:'{name} {geo-code}', dataTarget:'#add-candidate'}, v=>v
                    .icon('plus', 15) )  )  )
        .class( 'office-pad', v=>v
            .class( 'slates', v=>v .include( 'slates', '{offices}' )  )
            .class( 'candidates', v=>v
                .each( 'candidates', v=>v
                    .card( 'candidates-name', '{name} {id}', v=>v
                        .class( 'word', "{occupation}")
                        .line( 'Phone', '{phone}' )
                        .class( 'word', '{email}' )
                        .class( 'word', "{note}" )
                        .linefeed( 10 )
                        .with( 'consultant', v=>v
                            .consultant( 'Consultant', "{name}")
                            .consultant( 'Phone',  "{phone}")
                            .consultant( 'Email',  "{email}")  )  )  )  )  )  )  )  )  )
.helpers(v=>({ data: () => Session.get('data') }))
.onRendered( o => () =>
    $(document).on("click", "#s-button", function (e, v) { $(".dialog-title").html( $(this).data('id') ) })  )
.build()
