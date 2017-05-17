'use strict'


in$.module('slate')
.router({ path: 'slate', layout: 'blank' })
.head(o => ({
    title: 'New Slate',
    meta: { name:"viewport", content:"width=device-width, initial-scale=1" }  }))
.body( v=>v
    .class('navbar navbar-inverse navbar-fixed-top', v=>v
        .class('container', v=>v
            .DIV({class:'collapse navbar-collapse', id:'ba-example-navbar-collapse-1'}, v=>v
                .UL({class: 'nav navbar-nav'}, v=>v
                    .LI( v=>v.A({href:'#'}, 'Home' ) )
                    .LI( v=>v.A({href:'#'}, 'Slate Status') )
                    .LI( v=>v.A({href:'#'}, 'Reports') )
                    .LI({class:'dropdown'}, v=>v
                        .A({ href:'#', class:'dropdown-toggle', 'data-toggle':'dropdown', role:'button', 'aria-haspopup':'true', 'aria-expanded':'false'}, 'View/Edit/Add', v=>v.SPAN({class:'caret'}))
                        .UL({class:'dropdown-menu'}, v=>v
                            .LI(v=>v.A({href:'#'}, 'Action'))
                            .LI(v=>v.A({href:'#'}, 'Another action'))
                            .LI({role:'seperator', class:'divider'})  )  )
                    .LI( v=>v.A({href:'#'}, 'Search') )
                    .LI( v=>v.A({href:'#'}, 'Sales Sheet') )
                    .LI( v=>v.A({href:'#'}, 'Candidate Proof Page') ) )))))
.build()
