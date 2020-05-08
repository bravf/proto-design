import jsx from 'vue-jsx'
import event from '@/core/event'
import {
  isRightMouse,
} from '@/core/base'
let { div, input } = jsx
let _renderRectListItem = function (rect) {
  let me = this
  let isHover = (rect.id === this.hoverRectId) || 
    (rect.id === this.currRectId) ||
    (rect.id in this.selectedRects)
  let paddingLeft = 16
  let isNameEdit = rect.data.isNameEdit
  let jsxProps = {
    'class_proto-tree-item': true,
  }
  let innerJsxProps = {
    'class_proto-tree-item-inner': true,
    'class_proto-tree-item-hover': isHover,
  }
  if (rect.groupId){
    innerJsxProps = {
      ...innerJsxProps,
      'style_padding-left': paddingLeft + 'px',
    }
  }
  let children = []
  if (isNameEdit){
    children = [
      input('.form-input input-sm', {
        domProps_value: rect.name,
        ref: 'rectItemInput',
        key: 'rectItemInput',
        on_focus () {
          me.$refs.rectItemInput.select()
        },
        on_blur () {
          rect.data.isNameEdit = false
          me._historyPush()
        },
        on_change () {
          me.$refs.rectItemInput.blur()
        },
        on_input (e) {
          let value = e.target.value
          rect.name = value
        },
        on_mousedown (e) {
          e.stopPropagation()
        }
      })
    ]
    setTimeout (() => {
      if (me.$refs.rectItemInput){
        me.$refs.rectItemInput.focus()
      }
    })
  }
  else {
    jsxProps = {
      ...jsxProps,
      'attrs_index': rect.index,
      'on_mouseover' () {
        me._updateHoverRect(rect)
      },
      'on_mouseout' () {
        me._updateHoverRect()
      },
      'on_mousedown' (e) {
        let group = me._getGroupByRect(rect)
        if (group){
          group.data.isOpen = true
        }
        me._focusRect(rect, {shiftKey: false})
        e.stopPropagation()
        event.$emit('windowMouseDown', e)
        // 右键判断
        if (isRightMouse(e)){
          me._showContextmenu(e, 'rect-item')
        }
      },
    }
    children = [
      div(innerJsxProps, rect.name)
    ]
  }

  return div(jsxProps, ...children)
}
let _renderRectList = function () {
  if (!this.currPage) {
    return null
  }
  let vdoms = []
  let temp = []
  this._getRectsByPageDeep().reverse().forEach(rect => {
    if (this._checkIsTempGroup(rect)){
      return
    }
    let vdom = _renderRectListItem.call(this, rect)
    if (rect.groupId === ''){
      vdoms = [...vdoms, vdom, ...temp]
      temp = []
    }
    else {
      temp.push(vdom)
    }
  })
  vdoms = [...vdoms, ...temp]
  return div({
    'class_proto-rect-list': true,
    'class_proto-tree': true,
    'class_card': true
  },
    div({
      'class_card-header': true
    },
      div({
        'class_card-title': true,
        'class_h6': true,
      }, '元素')
    ),
    div({
      'class_card-body': true,
    },
      ...vdoms,
    )
  )
}
export {
  _renderRectList,
}