global.cube = require 'cubesat' if !Meteor?
window.ionic  = {}

ionTags = 'Body Content FooterBar HeaderBar Icon Item List Modal NavBackButton NavBar NavView Pane Popover Popup Radio SideMenu SideMenuContent SideMenus Slide SlideBox SubfooterBar SubheaderBar Tab Tabs View'.split ' '
ionTags.forEach (tag) -> ionic[tag] = (_, o) ->
   args = __.array arguments
   iTag = 'ion' + tag
   switch
      when (l = args.length) is 1 then  cube.include      _, iTag
      when __.isArray o then            cube.includeBlock _, iTag, -> o
      when __.isBlazeElement o then     cube.includeBlock _, iTag, -> args[1..]
      when l > 2 then                   cube.includeAttrBlock _, iTag, o, -> args[2..]
      else                              cube.includeAttr  _, iTag, o

ion = cube.Cube()
ion.add cube.Parts ->
   ionLabel:  (_) -> html.DIV.apply null, __.array arguments
   ionToggle: (_, attr) ->
      html.LABEL    _, class: 'toggle', style: 'position:absolute; top:12px; right: 16px;',
         html.INPUT _, __.assign type: 'checkbox', attr
         html.DIV   _, class: 'track', html.DIV _, class: 'handle'
   ionRange:  (_, attr, left, right) ->
      html.DIV _, class: 'range range-positive',
         left, html.INPUT(_, __.assign type: "range", attr), right
   ionSelect: (_, attr, selected, options) ->
      html.SELECT _, __.assign(style: 'position:absolute; top: 20px; right: 16px;', attr),
         HTML.Raw options.map((l) -> '<option' + (if l is selected then ' selected>' + l else '>' + l) + '</option>').join('')
   ionListContent: (_) ->
      ionic.Content _, ionic.List.apply null, __.array [_], __.array(arguments)[1..]
   ionDivider:     (_, divider)     -> html.DIV   _, class: 'item item-divider', divider
   ionItemLabelToggle: (_, label, attr)       -> ionic.Item _, @ionLabel(_, label), @ionToggle _, attr
   ionItemLabelRange:  (_, label, attr, l, r) -> ionic.Item _, @ionLabel(_, label), @ionRange  _, attr, l, r
   ionItemLabelSelect: (_, label, attr, s, o) -> ionic.Item _, @ionLabel(_, label), @ionSelect _, attr, s, o
   ionItemLabelList:   (_, label)             -> ionic.Item _, @ionLabel(_, label), __.array(arguments)[2..]
   ionSubfooterButton: (_, attr, label) -> ionic.SubfooterBar _, html.BUTTON _, $btnBlock: attr.id, label

   Each: (_, lookup, func)         -> Blaze.Each (-> cube.lookup _, lookup), func
   If:   (_, lookup, _then, _else) -> Blaze.If   (-> cube.lookup _, lookup), _then, _else
module.exports = ion if !Meteor?
