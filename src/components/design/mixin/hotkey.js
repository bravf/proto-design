// 参考
// https://github.com/jaywcjlove/hotkeys/blob/master/src/var.js
let isff = 
  typeof navigator !== 'undefined' ? 
  navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : 
  false
// Special Keys
let keyMap = {
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  '⇪': 20,
  ',': 188,
  '.': 190,
  '/': 191,
  '`': 192,
  '-': isff ? 173 : 189,
  '=': isff ? 61 : 187,
  ';': isff ? 59 : 186,
  '\'': 222,
  '[': 219,
  ']': 221,
  '\\': 220,
}
// Modifier Keys
let modifier = {
  // shiftKey
  '⇧': 16,
  shift: 16,
  // altKey
  '⌥': 18,
  alt: 18,
  option: 18,
  // ctrlKey
  '⌃': 17,
  ctrl: 17,
  control: 17,
  // metaKey
  '⌘': 91,
  cmd: 91,
  command: 91,
}
let code = (x) => {
  if (typeof x === 'number') {
    return x
  }
  x = x.trim()
  return keyMap[x.toLowerCase()] ||
    modifier[x.toLowerCase()] ||
    x.toUpperCase().charCodeAt(0)
}
export default {
  data () {
    return {
      hotkey: {
        data: {},
        disabled: false,
      }
    }
  },
  methods: {
    _hotkey (
      hotkey, 
      keydown = () => {}, 
      keyup = () => {},
    ) {
      this.hotkey.data[this._hotkeyCode(hotkey.split('+'))] = {
        hotkey,
        keydown,
        keyup,
      }
    },
    _hotkeyOff () {
      this.hotkey.disabled = true
    },
    _hotkeyOn () {
      this.hotkey.disabled = false
    },
    _hotkeyCode (keys) {
      return keys.map(key => code(key)).sort().join('+')
    },
    _hotkeyEvent (e) {
      if (e.target.tagName.toLowerCase() === 'input') {
        return
      }
      if (this.hotkey.disabled) {
        return
      }
      let modifierInfo = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        command: e.metaKey,
      }
      let modifiers = []
      for (let mk in modifierInfo) {
        if (modifierInfo[mk]) {
          modifiers.push(mk)
        }
      }
      let eventType = e.type
      let hotkeyCode = this._hotkeyCode([e.keyCode, ...modifiers])
      if (hotkeyCode in this.hotkey.data) {
        let hotkeyObject = this.hotkey.data[hotkeyCode]
        hotkeyObject[eventType](e)
      }
    },
  },
  mounted () {
    this.windowEventAdd('keydown', (e) => {
      this._hotkeyEvent(e)
    })
  }
}