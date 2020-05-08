import jsx from 'vue-jsx'
import {
  selectText,
  percentPx,
  isRightMouse,
} from "@/core/base"
import event from '@/core/event'
let { div, span } = jsx
let _renderRect = function (rect) {
  let me = this
  let rectData = rect.data
  let isCurrRect = rect.id === this.currRectId
  let isHoverRect = rect.id === this.hoverRectId
  isHoverRect = isHoverRect || (rect.id in this.selectedRects)
  let isLock = rectData.isLock && !rectData.isOpen
  let rectType = rect.type
  let mouse = this.mouse
  let mousedown = (e) => {
    this._focusRect(rect, e)
    e.stopPropagation()
  }
  // 容器
  let jsxProps = {
    ...this._getRectBaseJsxProps(rect),
    'class_proto-rect': true,
    'class_proto-rect-hover': isHoverRect && !isCurrRect,
    'class_proto-rect-focus': isCurrRect,
    'class_proto-rect-lock': isLock,
    [`class_proto-${rectType}`]: true,
    'attrs_id': rect.id,
    'attrs_index': rect.index,
    key: rect.id,
    on_mousedown (e) {
      if (me._checkIsTempGroup(rect)){
        return
      }
      mouse.eventType = 'move'
      if (rect.data.isEdit) {
        mouse.eventType = ''
      }
      mousedown(e)
      // 右键判断
      if (isRightMouse(e)){
        me._showContextmenu(e, 'rect')
      }
      else {
        event.$emit('windowMouseDown', e)
      }
    },
    on_mousemove () {
      me._hoverRect(rect)
    },
    on_mouseout () {
      me._hoverOffRect()
    },
  }
  let children = []
  if (!this._checkIsGroupLike(rect)){
    jsxProps['on_dblclick'] = (e) => {
      me._focusRect(rect, e)
      mouse.ing = false
    }
    children = [this._renderRectInner(rect)]
  }
  if (isHoverRect && isLock){
    children = [
      ...children,
      jsx.create('v-icon', {
        'class_proto-rect-lock-icon': true,
        props_name: 'lock',
      })
    ]
  }
  return div(jsxProps,  ...children)
}
// 普通矩形
let _renderRectInner = function (rect) {
  let me = this
  let isEdit = rect.data.isEdit
  let data = rect.data
  let isLine = rect.type === 'rect-line'
  let jsxProps = {
    'class_proto-rect-inner': true,
  }
  let children = []
  if (isLine) {
    jsxProps = {
      ...jsxProps,
      'style_border-top-width': data.borderWidth + 'px',
      'style_border-top-style': data.borderStyle,
      'style_border-top-color': data.borderColor,
    }
  }
  else {
    jsxProps = {
      ...jsxProps,
      'style_border-width': data.borderWidth + 'px',
      'style_border-style': data.borderStyle,
      'style_border-color': data.borderColor,
      'style_background-color': data.backgroundColor,
      'style_border-radius': percentPx(data.borderRadius),
      'style_align-items': data.textAlignY,
      'style_justify-content': data.textAlignX,
      'style_overflow': 'hidden',
    }
    let textJsxProps = {
      'class_proto-rect-inner-text': true,
      'attrs_contenteditable': false,
      'style_color': data.color,
      'style_font-size': data.fontSize + 'px',
      'style_font-family': data.fontFamily,
    }
    if (isEdit) {
      textJsxProps = {
        ...textJsxProps,
        style_cursor: 'text',
        ref: 'defaultText',
        attrs_contenteditable: true,
        style_transform: `rotate(-${data.angle}deg)`,
        on_blur () {
          me._hotkeyOn()
          rect.data.isEdit = false
          me._historyPush()
        },
        on_focus () {
          me._hotkeyOff()
          me.$refs.defaultText.innerHTML = data.text
          selectText(me.$refs.defaultText)
          me._updateRectTempData(rect)
        },
        on_input (e) {
          let text = e.target.innerHTML
          if (data.isAutoSize){
            me._resizeText(rect, text)
          }
          rect.data.text = text
        }
      }
      setTimeout(() => {
        if (this.$refs.defaultText){
          this.$refs.defaultText.focus()
        }
      })
    }
    else {
      textJsxProps = {
        ...textJsxProps,
        'domProps_innerHTML': data.text,
      }
    }
    children = [span(textJsxProps)]
  }
  
  return div(jsxProps, ...children)
}
let _renderRects = function () {
  if (!this.currPage) {
    return null
  }
  let rects = []
  this._getRectsByPageDeep().forEach(rect => {
    if (!this._checkIsRectLike(rect)){
      return
    }
    rects.push(
      this._renderRect(rect)
    )
  })
  return div({
    'class_proto-canvas': true,
  },
    div({
      'class_proto-zoom': true,
      'style_transform': `scale(${this.scale})`,
    },
      ...rects,
    )
  )
}
export {
  _renderRects,
  _renderRect,
  _renderRectInner,
}