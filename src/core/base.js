import {
  v4 as uuidv4,
} from  'uuid'
import {
  memoize,
} from 'lodash'
import vars from '@/core/design-vars'
let empty = () => {}
let sum = (sum, n) => sum + n
let bodyFont = window.getComputedStyle(document.body).font
let getTextSize = (
  text, 
  font = bodyFont
) => {
  let span = getTextWidth.span
  if (!span) {
    span = getTextWidth.span = document.createElement('div')
    span.style.display = 'inline-block'
    let div = document.createElement('div')
    div.style.display = 'block'
    div.style.position = 'absolute'
    div.style.top = '-10000px'
    div.style.left = '200px'
    div.style.width = '100000px'
    div.appendChild(span)
    document.body.appendChild(div)
  }
  span.style.font = font
  span.innerHTML = text
  let style = window.getComputedStyle(span)
  return {
    width: Math.ceil(parseFloat(style.width)),
    height: Math.ceil(parseFloat(style.height)),
  }
}
let getTextWidth = (
  text, 
  font = bodyFont
) => {
  return getTextSize(text, font).width
}
let checkRectOverlap = (
  r1, 
  r2
) => {
  // 两个矩形是否重叠
  // 求两个矩形外包围的长宽
  let width = Math.abs(Math.max(r1.right, r2.right) - Math.min(r1.left, r2.left))
  let height = Math.abs(Math.max(r1.bottom, r2.bottom) - Math.min(r1.top, r2.top))

  // 两个矩形长宽的和
  let rectMaxWidth = r1.width + r2.width
  let rectMaxHeight = r1.height + r2.height

  // 如果相交，必须满足外包围的长短必须同时小于两个矩形长宽的和
  return (width < rectMaxWidth) && (height < rectMaxHeight)
}
// 求矩形在 x 轴的映射
let getMappingRectX = (
  rect, 
  angle
) =>{
  let values = []
  let {ra, rb, rc, rd} = rect
  ;[ra, rb, rc, rd].forEach(point =>{
      let xp = getMappingPoint(point, angle).xp
      values.push(xp)
  })
  let start = Math.min.apply(null, values)
  let end = Math.max.apply(null, values)
  return {
      start,
      end,
      length: end- start,
  }
}
let checkRectOverlap2 = (
  rect1, 
  rect2
) => {
  let isOverlap = true
  let angles = [
    rect1.angle, 
    rect1.angle + 90,
    rect2.angle,
    rect2.angle + 90
  ]
  // 分离轴定理
  // https://www.cnblogs.com/demodashi/p/8476761.html
  angles.some(angle => {
    let rect1Mapping = getMappingRectX(rect1, angle)
    let rect2Mapping = getMappingRectX(rect2, angle)
    if (Math.max(rect1Mapping.end, rect2Mapping.end) - Math.min(rect1Mapping.start, rect2Mapping.start) > (rect1Mapping.length +rect2Mapping.length) ) {
      isOverlap = false
      return true
    }
  })
  return isOverlap
}
let tNumber = (
  n, 
  x = 2
) => {
  let y = Math.pow(10, x)
  return Math.round(n * y) / y
}
let getRadian = (angle) => {
  return angle * (Math.PI / 180)
}
// getRadian 的反向操作
let getAngle = (radian) => {
  return radian / Math.PI * 180
}
// 参考：https://blog.csdn.net/sinat_33425327/article/details/78333946
// center: 旋转中心点
// point: 一个点
// angle: 角度
// type：顺时针 or 逆时针，true or false
let getRotatePointByCenter = (
  center, 
  point, 
  angle, 
  type = true
) => {
  angle = parseInt(angle)
  
  // 弧度
  if (!type){
    angle = 360 - angle
  }
  let radian = getRadian(angle)

  let px_0 = point.left - center.left
  let py_0 = center.top - point.top

  let px_1 = Math.cos(radian) * px_0 + Math.sin(radian) * py_0
  let py_1 = Math.cos(radian) * py_0 - Math.sin(radian) * px_0

  return {
    left: tNumber(px_1 + center.left),
    top: tNumber(center.top - py_1),
  }
}
// 已知a,b两点，以及穿过a的线al的角度为angle
// 那么假设一条穿过b的线bl与al垂直相交，交点为c，求c的坐标
let getCByABAndAngle = (
  a, 
  b, 
  angle
) => {
  if (angle % 180 === 0){
    return {
      left: a.left,
      top: b.top,
    }
  }
  let radian = getRadian(angle)
  let radian2 = getRadian(90 - angle)
  let apx = a.left + Math.tan(radian) * a.top
  let bpx = b.left - Math.tan(radian2) * b.top
  let cx = bpx + Math.cos(radian) * Math.cos(radian) * (apx - bpx)
  let cy = Math.sin(radian) * Math.cos(radian) * (apx - bpx)
  return {
    left: tNumber(cx),
    top: tNumber(cy),
  }
}
// 一个点 point 和一个角度 angle
// 求以角度 angle 通过此点的线 L 在 x 轴的映射值
// 以及垂直于 L 并通过此点的线在 y 轴的映射值
let getMappingPoint = (
  point, 
  angle
) => {
  let radian = getRadian(angle)
  return {
    xp: point.left + Math.tan(radian) * point.top,
    yp: point.top - Math.tan(radian) * point.left,
  }
}
// 已知若干个点和一个角度 angle
// 求通过每个点的角度为 angle 的线 L 在 x 轴是最小映射值的点 a，以及最大值 a2
// 以及通过每个点的与 L 垂直相交的线在 y 轴是最小映射值的点 b，以及最大值 b2
let getABByPointsAndAngle = (
  points, 
  angle
) => {
  let a, b, a2, b2
  let x = Number.MAX_VALUE
  let y = x
  let x2 = -x
  let y2 = -y

  points.forEach(p => {
    let {xp, yp} = getMappingPoint(p, angle)

    if (xp < x){
      x = xp
      a = p
    }

    if (xp >= x2){
      x2 = xp
      a2 = p
    }

    if (yp < y){
      y = yp
      b = p
    }

    if (yp >= y2){
      y2 = yp
      b2 = p
    }
  })

  return {a, b, a2, b2}
}
// 已知两个点，求经过此两点的线的 rotate 角度
// 方向是先经过 a 点，后经过 b 点
let getAngleByTwoPoints = (
  a, 
  b
) => {
  let diffa = Math.abs(tNumber(a.left) - tNumber(b.left))
  let diffb = Math.abs(tNumber(b.top) - tNumber(a.top))

  let angle = getAngle(
    Math.atan(diffa / diffb)
  )

  let aleft = a.left
  let atop = a.top
  let bleft = b.left
  let btop = b.top

  if ( (aleft > bleft) && (atop <= btop) ){
    // 
  }
  else if ( (aleft >= bleft) && (atop > btop) ){
    angle = 180 - angle
  }
  else if ( (aleft < bleft) && (atop >= btop) ){
    angle += 180
  }
  else {
    angle = 360 - angle
  }

  return angle % 360
}
let getEffectiveAngle = (angle) => {
  return angle % 360
}
let getUuid = () => {
  return uuidv4()
}
let selectText = (element) => {
  let selection = window.getSelection()
  let range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}
let getRectInfo = (
  rectData, 
  scale = 1
) => {
  let { left, top, width, height, angle } = rectData
  left *= scale
  top *= scale
  width *= scale
  height *= scale
  let right = left + width
  let bottom = top + height
  let center = {
    left: tNumber(left + width / 2),
    top: tNumber(top + height / 2),
  }
  let leftTop = {
    left,
    top,
  }
  let a = leftTop
  let leftBottom = {
    left,
    top: bottom,
  }
  let d = leftBottom
  let rightTop = {
    left: right,
    top,
  }
  let b = rightTop
  let rightBottom = {
    left: right,
    top: bottom,
  }
  let c = rightBottom
  let ad = {
    left,
    top: center.top,
  }
  let bc = {
    left: left + width,
    top: center.top,
  }

  let rotateLeftTop = getRotatePointByCenter(center, leftTop, angle)
  let ra = rotateLeftTop

  let rotateLeftBottom = getRotatePointByCenter(center, leftBottom, angle)
  let rd = rotateLeftBottom

  let rotateRightTop = getRotatePointByCenter(center, rightTop, angle)
  let rb = rotateRightTop

  let rotateRightBottom = getRotatePointByCenter(center, rightBottom, angle)
  let rc = rotateRightBottom

  let rad = getRotatePointByCenter(center, ad, angle)
  let rbc = getRotatePointByCenter(center, bc, angle)

  let rotateLefts = [
    ra.left,
    rb.left,
    rc.left,
    rd.left,
  ]
  let rotateTops = [
    ra.top,
    rb.top,
    rc.top,
    rd.top,
  ]
  let minRotateLeft = Math.min.apply(null, rotateLefts)
  let maxRotateLeft = Math.max.apply(null, rotateLefts)
  let minRotateTop = Math.min.apply(null, rotateTops)
  let maxRotateTop = Math.max.apply(null, rotateTops)

  return {
    ...rectData,
    center,
    leftTop,
    leftBottom,
    rightTop,
    rightBottom,
    rotateRightTop,
    rotateLeftTop,
    rotateLeftBottom,
    rotateRightBottom,
    a,
    b,
    c,
    d,
    ra,
    rb,
    rc,
    rd,
    rad,
    rbc,
    right,
    bottom,
    left,
    top,
    width,
    height,
    minRotateLeft,
    maxRotateLeft,
    minRotateTop,
    maxRotateTop,
  }
}
let getGroupSize = (
  rects, 
  angle
) => {
  // 得到所有矩形的点的旋转后的坐标
  let points = []
  rects.forEach(rect => {
    let info = getRectInfo(rect.data)
    points = [
      ...points,
      info.rotateLeftTop,
      info.rotateRightTop,
      info.rotateLeftBottom,
      info.rotateRightBottom,
    ]
  })
  // 根据上面的点得到4个点
  let ab = getABByPointsAndAngle(points, angle)
  // 得到 group 左上角的点
  let rlt = getCByABAndAngle(
    ab.a,
    ab.b,
    angle
  )
  // 得到 group 右下角的点
  let rrb = getCByABAndAngle(
    ab.a2,
    ab.b2,
    angle,
  )
  // 计算中心点
  let center = {
    left: rlt.left + (rrb.left - rlt.left) / 2,
    top: rrb.top - (rrb.top - rlt.top) / 2,
  }
  // 根据角度判断 rlt,rrb 谁是 lt 的真实坐标
  // 得到 lt, lt是罗辑坐标点
  let lt = getRotatePointByCenter(
    center, 
    (angle > 90 && angle <= 270)
      ? rrb
      : rlt,
    angle,
    false,
  )
  let width = Math.abs(center.left - lt.left) * 2
  let height = Math.abs(center.top - lt.top) * 2

  return {
    left: tNumber(lt.left),
    top: tNumber(lt.top),
    width: tNumber(width),
    height: tNumber(height),
  }
}
// 已知a, b两点，a固定，b到 a 的距离放大 m 倍
// 求等比放大后 b 点的位置
let getScalePoint = (
  a, 
  b, 
  m
) => {
  return {
    left: (b.left - a.left) * m + a.left,
    top: (b.top - a.top) * m + a.top,
  }
}
let getPointsCenter = (
  a, 
  b
) => {
  return {
    left: tNumber(a.left + (b.left - a.left) / 2),
    top: tNumber(a.top + (b.top - a.top) / 2),
  }
}
let getWH = (
  a, 
  c
) => {
  return {
    width: Math.abs(c.left - a.left) * 2,
    height: Math.abs(c.top - a.top) * 2,
  }
}
// 150, 54 是主舞台的偏移距离
let middleLeft = vars.b + vars.c
let middleTop = vars.a + vars.c
let getMousePoint = (e) => {
  let $middle = document.querySelector('.proto-middle') || document.documentElement
  return {
    left: e.clientX + $middle.scrollLeft - middleLeft,
    top: e.clientY + $middle.scrollTop - middleTop,
  }
}
// 如果有 % 直接返回，否则加上 px
let percentPx = (str) => {
  str = str + ''
  if (!str.includes('%')){
    str += 'px'
  }
  return str
}
// 检查是否右键
let isRightMouse = (e) => {
  return e.which === 3
}
// 缓存函数
let memoizeResolver = (...args) => {
  return JSON.stringify(args)
}
;['min', 'max', 'cos', 'sin', 'tan', 'atan', 'abs', 'ceil', 'pow', 'round'].forEach(name => {
  Math[name] = memoize(Math[name], memoizeResolver)
}) 
getTextSize = memoize(getTextSize, memoizeResolver)
getMappingRectX = memoize(getMappingRectX, memoizeResolver) 
checkRectOverlap2 = memoize(checkRectOverlap2, memoizeResolver)
tNumber = memoize(tNumber, memoizeResolver)
getRadian = memoize(getRadian, memoizeResolver)
getAngle = memoize(getAngle, memoizeResolver)
getRotatePointByCenter = memoize(getRotatePointByCenter, memoizeResolver)
getCByABAndAngle = memoize(getCByABAndAngle, memoizeResolver)
getMappingPoint = memoize(getMappingPoint, memoizeResolver)
getABByPointsAndAngle = memoize(getABByPointsAndAngle, memoizeResolver)
getAngleByTwoPoints = memoize(getAngleByTwoPoints, memoizeResolver)
getEffectiveAngle = memoize(getEffectiveAngle, memoizeResolver)
getRectInfo = memoize(getRectInfo, memoizeResolver)
getGroupSize = memoize(getGroupSize, memoizeResolver)
getScalePoint = memoize(getScalePoint, memoizeResolver)
getPointsCenter = memoize(getPointsCenter, memoizeResolver)
getWH = memoize(getWH, memoizeResolver)
percentPx = memoize(percentPx, memoizeResolver)

export {
  getRectInfo,
  getGroupSize,
  getScalePoint,
  getPointsCenter,
  getWH,
  getMousePoint,
  percentPx,
  sum,
  empty,
  getTextWidth,
  getTextSize,
  checkRectOverlap,
  getRotatePointByCenter,
  getCByABAndAngle,
  getABByPointsAndAngle,
  getAngle,
  tNumber,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRadian,
  getUuid,
  selectText,
  isRightMouse,
  checkRectOverlap2,
  middleLeft,
  middleTop,
}