import color from '@/core/color'
import vars from '@/core/design-vars'
let configContext = (context) => {
  context.strokeStyle = color.gray
  context.font = '20px SourceHanSansSC'
}
let n = 10000
let n2 = vars.c * 2
let getMiddleData = function () {
  let $middle = this.$refs.middle
  let style = window.getComputedStyle($middle)
  return {
    dom: $middle,
    scrollTop: $middle.scrollTop,
    scrollLeft: $middle.scrollLeft,
    width: parseInt(style.width),
    height: parseInt(style.height),
  }
}
let _renderTopRule = function () {
  let rule = this.topRule
  let middleData = getMiddleData.call(this)
  if (!rule) {
    this.topRule = rule = document.createElement('canvas')
    rule.className = 'proto-rule'
    rule.style.top = vars.a + 'px'
    rule.style.left = vars.b + vars.c + 'px'
    middleData.dom.appendChild(rule)
  }
  rule.width = middleData.width * 2
  rule.height = n2
  rule.style.width = middleData.width + 'px'
  rule.style.height = n2 / 2 + 'px'
  let scale = this.scale
  let context = rule.getContext('2d')
  context.clearRect(0, 0, n, n2)
  configContext(context)
  context.beginPath()
  let scrollLeft = middleData.scrollLeft
  for (let i = 0; i < n; i += 10){
    let isText = i % 100 === 0
    let left = (i - scrollLeft) * 2
    let text = i / scale
    let start = (isText ? 0 : 10) * 2
    context.moveTo(left, start)
    context.lineTo(left, n2)
    if (isText){
      context.fillText(text, left + 2, 8 * 2)
    }
  }
  context.moveTo(0, n2)
  context.lineTo(rule.width, n2)
  context.stroke()
}
let _renderLeftRule = function () {
  let middleData = getMiddleData.call(this)
  let rule = this.leftRule
  if (!rule) {
    this.leftRule = rule = document.createElement('canvas')
    rule.className = 'proto-rule'
    rule.style.top = vars.a + vars.c + 'px'
    rule.style.left = vars.b + 'px'
    this.$refs.middle.appendChild(rule)
  }
  rule.width = n2
  rule.height = middleData.height * 2
  rule.style.width = n2 / 2 + 'px'
  let scale = this.scale  
  rule.style.height = middleData.height + 'px'
  let context = rule.getContext('2d')
  context.clearRect(0, 0, n2, n)
  configContext(context)
  context.beginPath()
  let scrollTop = middleData.scrollTop
  for (let i = 0; i < n; i += 10){
    let isText = i % 100 === 0
    let top = (i - scrollTop) * 2
    let text = ((i / scale) + ' ').slice(0, 4)
    let start = (isText ? 0 : 10) * 2
    context.moveTo(start, top)
    context.lineTo(n2, top)
    if (isText){
      context.save()
      context.textAlign = "center"
      context.textBaseline = "middle"
      context.translate(10, top - 18)
      context.rotate((-90 * Math.PI) / 180)
      context.fillText(text, 6, 0);
      context.restore()
    }
  }
  context.moveTo(n2, 0)
  context.lineTo(n2, rule.height)
  context.stroke()
  context.stroke()
}
let _renderRule = function () {
  _renderTopRule.call(this)
  _renderLeftRule.call(this)
}
export {
  _renderRule,
}
