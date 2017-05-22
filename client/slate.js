'use strict'

let in$ = require('incredibles')

Meteor.setTimeout((() => Session.set('data', {
    "county": "Los Angeles",
    "code": "19",
    "offices": [
        {
            "name": "County Ballot Measoer",
            "geo-code": "19-01-01-",
            "candidates": [
                {
                    "id": 1,
                    "name": "Yes on H",
                    "phone": "626-535-9616",
                    "email": "parke@sgacamp.com"
                }

            ],
            "pieces": [
                {
                    "slate": "Cal Voter",
                    "mailings": [
                        {
                            "code": "CVG-R-POLL",
                            "count": 31290
                        },
                        {
                            "code": "CVG-R-AV",
                            "count": 37499
                        }
                    ]
                },
                {
                    "slate": "Watchdogs",
                    "mailings": [
                        {
                            "code": "BWD-AV",
                            "count": 95273
                        }
                    ]
                },
                {
                    "slate": "Literacy",
                    "mailings": [
                        {
                            "code": "L-DI-POLL",
                            "count": 143214
                        },
                        {
                            "code": "L-DI-AV",
                            "count": 135357
                        }
                    ]
                }
            ],
            "price": [
                {
                    "slate": "Cal Voter",
                    "price": "0.09",
                    "per-unit": true
                },
                {
                    "slate": "Watchdogs",
                    "price": "0.09",
                    "per-unit": true
                },
                {
                    "slate": "Literacy",
                    "price": "0.09",
                    "per-unit": true
                }
            ],
            "sales": [
                {
                    "slate": "Cal Voter",
                    "id": 1,
                    "candiate": {
                        "id": 1,
                        "name": "Yes on H"
                    }

                },
                {
                    "slate": "Watchdogs",
                    "id": 1,
                    "candiate": {
                        "id": 1,
                        "name": "Yes on H"
                    }

                },
                {
                    "slate": "Literacy",
                    "id": 1,
                    "candiate": {
                        "id": 1,
                        "name": "Yes on H"
                    }

                }
            ]
        },
        {
            "name": "Beverly Hills City Council",
            "geo-code": "19-08-BP-",
            "candidates": [
                {
                    "id": 3,
                    "name": "Frances Bilak",
                    "occupation": "City Commissioner / Attorney",
                    "phone": "310-951-3781",
                    "email": "fbilak@me.com",
                    "note": "em 1/4 im 1/17",
                    "consultant": {
                        "name": "Stacia Kopeikin",
                        "phone": "310-246-1009"
                    }
                },
                {
                    "id": 95,
                    "name": "Eliot Finkel",
                    "occupation": "Treasure of Beverly Hills",
                    "phone": "310-271-8988",
                    "email": "eliot@eliot4bhcouncil.org",
                    "note": "1/4 na 1/6 em Mark",
                    "consultant": {
                        "name": "Mark Egerman",
                        "phone": "310-248-6299",
                        "email": "mark@egermanlaw.com"
                    }
                }
            ]
        }
    ]
})), 2000)


in$.module('blank', v=>v.include('yield'))

in$.module('slate')
.head(o => ({ meta: { name:"viewport", content:"width=device-width, initial-scale=1" } }))
.body( v=>v
    .class('navbar navbar-inverse navbar-fixed-top', v=>v
        .class('container', v=>v
            .DIV({class:'collapse navbar-collapse', id:'ba-example-navbar-collapse-1'}, v=>v
                .UL({class: 'nav navbar-nav'}, v=>v
                    .LI( v=>v .A({href:'#'}, 'Home' ) )
                    .LI( v=>v .A({href:'#'}, 'Slate Status') )
                    .LI( v=>v .A({href:'#'}, 'Reports') )
                    .LI( {class:'dropdown'}, v=>v
                        .A({ href:'#', class:'dropdown-toggle', 'data-toggle':'dropdown', role:'button', 'aria-haspopup':'true', 'aria-expanded':'false'}, 'View/Edit/Add', v=>v.SPAN({class:'caret'}))
                        .UL({class:'dropdown-menu'}, v=>v
                            .LI( v=>v .A({href:'#'}, 'Action'))
                            .LI( v=>v .A({href:'#'}, 'Another action'))
                            .LI( {role:'seperator', class:'divider'} )  )  )
                    .LI( v=>v .A({href:'/search'}, 'Search') )
                    .LI( v=>v .A({href:'/sheet'}, 'Sales Sheet') )
                    .LI( v=>v .A({href:'#'}, 'Candidate Proof Page') ) ))))
    .include('yield') )
.build('slate')

in$.module( 'search', {path:'search', layout: 'slate' },  v=>v .DIV('search'))

in$.module( 'pieces', v=>v
    .each('pieces', v=>v
        .class( 'piece', v=>v
            .P( '{slate}')
            .each('mailings', v=>v .class('mailing', '{code} {count}'))  )  )  )
.style({ '.piece': {padding: 5, margin: 5, background: 'white'} })



in$.module( 'price', v=>v
    .each('price', v=>v
        .class('price-item', '{slate} {price} {per-unit}')  )  )
.style({ '.price-item': {padding: 5, margin: 5, background: 'white'} })



in$.module( 'sales', v=>v
    .each('sales', v=>v
        .class('sales-item', v=>v
            .P('{slate} {id}')
            .with('candiate', v=>v
                .P('{name} {id}')  )  )  )  )
.style({ '.sales-item': {padding: 5, margin: 5, background: 'white'} })

in$.module('salesSheet')
.router({path: 'sheet', layout: 'slate'})
.body( v=>v
    .class( 'content', v=>v
        .with('data', v=>v
            .class( 'title', '{code} {county}')
            .each( 'offices', v=>v
                .class( 'wrapper', v=>v
                    .class( 'office', '{name}  {geo-code}')
                    .class( 'pieces', v=>v .include('pieces', '{offices}' ))
                    .class( 'price',  v=>v .include('price',  '{offices}' ))
                    .class( 'sales',  v=>v .include('sales',  '{offices}' ))
                    .class( 'candidates', v=>v .each( 'candidates', v=>v
                        .class( 'candidates-item', v=>v
                            .P('{id}')
                            .P('{name}')
                            .P('{phone}')
                            .P('{email}')  )  )  )  )  )  )  )  )
.helpers(v=>({ data: () => Session.get('data') }))
.style({
    '.content': {},
    '.title': { fontSize: 24 },
    '.wrapper': { display : 'flex', flexFlow: 'row wrap', marginBottom: 10 },
    '.wrapper > *': { padding: 5, display: 'flex', flex: '1' },
    '.pieces': { flex: '1', background: '#ddd' },
    '.price':  { flex: '1', background: '#ddd' },
    '.sales':  { flex: '1', background: '#ddd' },
    '.office':     { flex: '1 100%', background: '#ddd' },
    '.candidates': { flex: '1 100%', background: '#ddd' },
    '.candidates-item': { flexBasis: 180, padding: 5, margin: 5, background: 'white' }
  })
.build()
