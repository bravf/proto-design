import jsx from 'vue-jsx'
import event from '@/core/event'
let { div } = jsx
let _renderHandler = function () {
  let rect = this.objects[this.currRectId]
  if (!rect){
    return
  }
  let rectData = rect.data
  let isLock = rectData.isLock
  let isTempGroup = this._checkIsTempGroup(rect)
  let mouse = this.mouse
  let mousedown = (e) => {
    this._updateRectTempData(rect)
    e.stopPropagation()
    event.$emit('windowMouseDown', e)
  }
  let resizerJsx = {
    'class_proto-rect-resizer': true,
  }
  let b = 5
  let a = `calc(50% - ${b}px)`
  // 左上角调整器 a
  let aResizer = div({
    ...resizerJsx,
    style_left: -b + 'px',
    style_top: -b + 'px',
    on_mousedown (e) {
      mouse.resizerDir = 'a'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  // ab
  let abResizer = div({
    ...resizerJsx,
    style_left: a,
    style_top: -b + 'px',
    on_mousedown (e) {
      mouse.resizerDir = 'ab'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  // 右上角 b
  let bResizer = div({
    ...resizerJsx,
    style_right: -b + 'px',
    style_top: -b + 'px',
    on_mousedown (e) {
      mouse.resizerDir = 'b'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  // bc
  let bcResizer = div({
    ...resizerJsx,
    style_right: -b + 'px',
    style_top: a,
    on_mousedown (e) {
      mouse.resizerDir = 'bc'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  // 右下角 c
  let cResizer = div({
    ...resizerJsx,
    style_right: -b + 'px',
    style_bottom: -b + 'px',
    on_mousedown (e) {
      mouse.resizerDir = 'c'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  // cd
  let cdResizer = div({
    ...resizerJsx,
    style_left: a,
    style_bottom: -b + 'px',
    on_mousedown (e) {
      mouse.resizerDir = 'cd'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  // 左下角 d
  let dResizer = div({
    ...resizerJsx,
    style_left: -b + 'px',
    style_bottom: -b + 'px',
    on_mousedown (e) {
      mouse.resizerDir = 'd'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  // ad
  let adResizer = div({
    ...resizerJsx,
    style_left: -b + 'px',
    style_bottom: a,
    on_mousedown (e) {
      mouse.resizerDir = 'ad'
      mouse.eventType = 'resize'
      mousedown(e)
    },
  })
  let resizer = []
  let isLine = rect.type === 'rect-line'
  let isSameRatio = rect.data.isSameRatio
  if (isLine){
    resizer = [adResizer, bcResizer]
  }
  else {
    resizer = [aResizer, bResizer, cResizer, dResizer]
    if (!isSameRatio){
      resizer = [...resizer, abResizer, bcResizer, cdResizer, adResizer]
    }
  }
  // 旋转器
  let rotater = div({
    'class_proto-rect-rotater': true,
    style_left: a,
    style_top: '-15px',
    on_mousedown (e) {
      mouse.eventType = 'rotate'
      mousedown(e)
    },
  })
  // 拖动器
  let jsxProps = {
    ...this._getRectBaseJsxProps(rect, this.scale),
    'class_proto-rect-handler': true,
    'class_proto-rect-handler-lock': isLock,
  }
  if (!this.handler.show){
    jsxProps = {
      ...jsxProps,
      'style_display': 'none',
    }
  }
  let children = []
  if (!isTempGroup) {
    children = [rotater]
  }
  if (!rect.data.isAutoSize){
    children = [...children, ...resizer]
  }
  return div(jsxProps, ...children)
}
export {
  _renderHandler,
}