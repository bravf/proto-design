import jsx from 'vue-jsx'
let { div } = jsx
let _renderCircle = function () {
  let {left, top, width, height} = this._getCircleSize()
  return div('.proto-circle', {
    style_left: left + 'px',
    style_top: top + 'px',
    style_width: width + 'px',
    style_height: height + 'px',
  })
}
export {
  _renderCircle,
}