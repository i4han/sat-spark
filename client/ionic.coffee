global.cube = require 'cubesat' if !Meteor?

ion = cube.Cube()
ion.add cube.Parts ->
   ionLabel:  (_, label) -> html.DIV _, class: 'input-label', label
   ionToggle: (_, id) ->
      html.LABEL _, class: 'toggle', style: 'position:absolute; top:12px; right: 16px;',
         html.INPUT _, type: 'checkbox', id: id
         html.DIV _, class: 'track', html.DIV _, class: 'handle'
   ionRange: (_, o, left, right) ->
      html.DIV _, class: 'range range-positive',
         left, html.INPUT(_, __.assign type: "range", o), right
   ionSelect: (_, selected, options) ->
      html.SELECT _, style: 'position:absolute; top: 20px; right: 16px;',
         HTML.Raw options.map((l) -> '<option' + (if l is selected then ' selected>' + l else '>' + l) + '</option>').join('')
   ionListContent: (_) ->
      args = [].slice.call arguments
      ionic.Content _, ionic.List _, args[1..]
   ionDivider:    (_, divider)     -> html.DIV _, class: 'item item-divider', divider
   ionItemToggle: (_, label, id)   -> ionic.Item _, @ionLabel(_, label), @ionToggle _, id
   ionItemRange:  (_, label, o)    -> ionic.Item _, @ionLabel(_, label), @ionRange  _, o
   ionItemSelect: (_, label, s, o) -> ionic.Item _, @ionLabel(_, label), @ionSelect _, s, o
   ionItemList:   (_, label) ->
      args = [].slice.call arguments
      ionic.Item _, @ionLabel(_, label), args[2..]
   ionSubfooterButton: (_, label, id) ->
      ionic.SubfooterBar _, html.BUTTON _, $btnBlock: id, label


module.exports = ion if !Meteor?
