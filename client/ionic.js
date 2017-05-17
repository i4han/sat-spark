'use strict'

'undefined' !== typeof window && (window.ionic = window.ionic || {})

const ionTags = `Body Content FooterBar HeaderBar Icon Item List Modal NavBackButton NavBar NavView Pane Popover Popup Radio SideMenu SideMenuContent SideMenus Slide SlideBox SubfooterBar SubheaderBar Tab Tabs View`.split(' ')
ionTags.forEach(tag =>
  ionic[tag] = (_, o, ...args) => {
    let iTag = 'ion' + tag
    return __.isUndefined(o)  ? cube.include     (_, iTag) :
      __.isArray(o)           ? cube.includeBlock(_, iTag, () => o) :
      __.isBlazeElement(o)    ? cube.includeBlock(_, iTag, () => [o].concat(args)) :
      __.isUndefined(args[0]) ? cube.includeAttr (_, iTag, o) : cube.includeAttrBlock(_, iTag, o, () => args) })

__.Parts(() => ({
    ionLabel:  (...args) => html.DIV.apply(null, args),
    ionToggle: (_, attr) =>
      html.LABEL  (_, { class: 'toggle', style: 'position:absolute; top:12px; right: 16px;' },
        html.INPUT(_, __.assign({ type: 'checkbox' }, attr)),
        html.DIV  (_, { class: 'track' }, html.DIV(_, { class: 'handle' }))),
    ionRange:     (_, attr, left, right) =>
      html.DIV    (_, { class: 'range range-positive' }, left,
        html.INPUT(_, __.assign({ type: "range" }, attr)), right),
    ionSelect:    (_, attr, selected, options)    => html.SELECT(_,
      __.assign({ style: 'position:absolute; top: 20px; right: 16px;' }, attr),
      HTML.Raw(options.map( l => '<option' + (l === selected ? ' selected>' + l : '>' + l) + '</option>').join(''))),
    ionListContent:     (_, ...args) => ionic.Content(_, ionic.List.apply(null, __.array([_], args))),
    ionDivider:         (_, divider) => html.DIV(_, { class: 'item item-divider' }, divider),
    ionItemLabelToggle: (_, label, attr)       => ionic.Item(_, __._Parts.ionLabel(_, label), __._Parts.ionToggle(_, attr)),      // Sat.part -> this? arrow function 쓰면 this 못씀.
    ionItemLabelRange:  (_, label, attr, l, r) => ionic.Item(_, __._Parts.ionLabel(_, label), __._Parts.ionRange(_, attr, l, r)), // 에러 때문에 this -> Sat.part로 고쳤음.
    ionItemLabelSelect: (_, label, attr, s, o) => ionic.Item(_, __._Parts.ionLabel(_, label), __._Parts.ionSelect(_, attr, s, o)),
    ionItemLabelList:   (_, label, ...args)    => ionic.Item(_, __._Parts.ionLabel(_, label), args),
    ionSubfooterButton: (_, attr, label) => ionic.SubfooterBar(_, html.BUTTON(_, { $btnBlock: attr.id }, label)),
    Each: (_, lookup, func)         => Blaze.Each(( () => cube.lookup(_, lookup)), func),
    If:   (_, lookup, _then, _else) => Blaze.If  (( () => cube.lookup(_, lookup)), _then, _else) }))
