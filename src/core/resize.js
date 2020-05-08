import { 
  getRadian,
  getRotatePointByCenter,
  getAngleByTwoPoints,
  getPointsCenter,
  getScalePoint,
  getWH,
} from './base'

let minLen = 10
let getWidthScale = (
  newWidth, 
  width
) => {
  return newWidth / width
}
// 获取辅助数据
let getResizeData = (rect) => {
  let data = rect.data
  let tempInfo = rect.tempData
  let angle = tempInfo.angle
  let radian = getRadian(angle)
  let tempWidth = tempInfo.width
  let tempHeight = tempInfo.height

  return {
    data,
    tempInfo,
    angle,
    radian,
    tempWidth,
    tempHeight,
  }
}

// 等比 resize
// mx 鼠标 x 方向移动的值
// my 鼠标 y 方向移动的值 
let resizeAR = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect)
  let widthDiff =  - Math.cos(radian) * mx - Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth) 
  
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRlt = getScalePoint(rrb, rlt, scale)
  // 新的中心点
  let newCenter = getPointsCenter(newRlt, rrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)
  let wh = getWH(newLt, newCenter)

  // 返回放大倍数和不动点
  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width: wh.width,
      height: wh.height,
    },
    scale,
    fixedPoint: rrb,
  }
}
let resizeBR = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect)
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)

  let rrt = tempInfo.rotateRightTop
  let rlb = tempInfo.rotateLeftBottom
  let newRrt = getScalePoint(rlb, rrt, scale)
  // 新的中心点
  let newCenter = getPointsCenter(rlb, newRrt)
  // 求新的right, top
  let newRt = getRotatePointByCenter(newCenter, newRrt, angle, false)
  let wh = getWH(newRt, newCenter)
  let newLt = {
    left: newRt.left - wh.width,
    top: newRt.top
  }

  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width: wh.width,
      height: wh.height,
    },
    scale,
    fixedPoint: rlb,
  }
}
let resizeCR = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect)
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)

  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRrb = getScalePoint(rlt, rrb, scale)
  // 新的中心点
  let newCenter = getPointsCenter(rlt, newRrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, rlt, angle, false)
  let wh = getWH(newLt, newCenter)

  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width: wh.width,
      height: wh.height,
    },
    scale,
    fixedPoint: rlt,
  }
}
let resizeDR = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect)
  let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)

  let rrt = tempInfo.rotateRightTop
  let rlb = tempInfo.rotateLeftBottom
  let newRlb = getScalePoint(rrt, rlb, scale)
  // 新的中心点
  let newCenter = getPointsCenter(rrt, newRlb)
  // 求新的right, top
  let newRt = getRotatePointByCenter(newCenter, rrt, angle, false)
  let wh = getWH(newRt, newCenter)
  let newLt = {
    left: newRt.left - wh.width,
    top: newRt.top
  }
  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width: wh.width,
      height: wh.height,
    },
    scale,
    fixedPoint: rrt,
  }
}
let resizeA = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect)
  let rrb = tempInfo.rotateRightBottom
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = - Math.cos(radian) * mx - Math.sin(radian) * my
  let heightDiff = Math.sin(radian) * mx - Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  // 根据 width, height, angle，rrb 算 rlt 的位置
  let newRlt = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRlt = {
      left: rrb.left - width,
      top: rrb.top - height,
    }
  }
  else if (angle === 90){
    newRlt = {
      left: rrb.left + height,
      top: rrb.top - width,
    }
  }
  else if (angle === 180) {
    newRlt = {
      left: rrb.left + width,
      top: rrb.top + height,
    }
  }
  else if (angle === 270){
    newRlt = {
      left: rrb.left - height,
      top: rrb.top + width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRlt = {
      left: rrb.left - Math.cos(radian) * (width - Math.tan(radian) * height),
      top: rrb.top - (height / Math.cos(radian) + Math.sin(radian) * (width - Math.tan(radian) * height)),
    }
  }
  let newCenter = getPointsCenter(newRlt, rrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)
  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width: width,
      height: height,
    },
    fixedPoint: rrb,
  }
}
let resizeAB = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempHeight,
    radian,
  } = getResizeData(rect)
  // 求变化的高度
  let heightDiff = Math.sin(radian) * mx - Math.cos(radian) * my
  let newHeight = Math.max(tempHeight + heightDiff, minLen)
  heightDiff = newHeight - tempHeight

  // 求新的 rlt 坐标
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRlt = {
    left: rlt.left + Math.sin(radian) * heightDiff,
    top: rlt.top - Math.cos(radian) * heightDiff,
  }
  // 新的中心点
  let newCenter = getPointsCenter(newRlt, rrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)

  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      height: newHeight,
    },
    fixedPoint: rrb,
    scaleH: newHeight / tempHeight,
  }
}
let resizeB = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect)
  let rlb = tempInfo.rotateLeftBottom
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let heightDiff = Math.sin(radian) * mx - Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  // 根据 width, height, angle，rrb 算 rrt 的位置
  let newRrt = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRrt = {
      left: rlb.left + width,
      top: rlb.top - height,
    }
  }
  else if (angle === 90){
    newRrt = {
      left: rlb.left + height,
      top: rlb.top + width,
    }
  }
  else if (angle === 180) {
    newRrt = {
      left: rlb.left - width,
      top: rlb.top + height,
    }
  }
  else if (angle === 270){
    newRrt = {
      left: rlb.left - height,
      top: rlb.top - width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRrt = {
      left: rlb.left + width / Math.cos(radian) + Math.sin(radian) * (height - Math.tan(radian) * width),
      top: rlb.top - Math.cos(radian) * (height - Math.tan(radian) * width)
    }
  }
  let newCenter = getPointsCenter(newRrt, rlb)
  // 求新的 rt
  let newRt = getRotatePointByCenter(newCenter, newRrt, angle, false)

  return {
    size: {
      left: newRt.left - width,
      top: newRt.top,
      width,
      height,
    },
    fixedPoint: rlb,
  }
}
let resizeBC = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempWidth,
    radian,
  } = getResizeData(rect)
  // 求变化的宽度
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let newWidth = Math.max(tempWidth + widthDiff, minLen)
  return resizeNewWidth(rect, newWidth)
}
let resizeC = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect)
  let rlt = tempInfo.rotateLeftTop
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let heightDiff = -Math.sin(radian) * mx + Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  let newRrb = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRrb = {
      left: rlt.left + width,
      top: rlt.top + height,
    }
  }
  else if (angle === 90){
    newRrb = {
      left: rlt.left - height,
      top: rlt.top + width,
    }
  }
  else if (angle === 180) {
    newRrb = {
      left: rlt.left - width,
      top: rlt.top - height,
    }
  }
  else if (angle === 270){
    newRrb = {
      left: rlt.left + height,
      top: rlt.top - width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRrb = {
      left: rlt.left  + Math.cos(radian) * (width - Math.tan(radian) * height),
      top: rlt.top + height / Math.cos(radian) + Math.sin(radian) * (width - Math.tan(radian) * height),
    }
  }
  let newCenter = getPointsCenter(newRrb, rlt)
  let newLt = getRotatePointByCenter(newCenter, rlt, angle, false)

  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width,
      height,
    },
    fixedPoint: rlt,
  }
}
// 直接设定宽度
let resizeNewWidth = (
  rect, 
  newWidth
) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect)
  // 求变化的宽度
  let widthDiff = newWidth - tempWidth
  let newHeight = tempHeight

  // 求新的 rrb 坐标
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRrb = {
    left: rrb.left + Math.cos(radian) * widthDiff,
    top: rrb.top + Math.sin(radian) * widthDiff
  }
  // 是否等比变化
  let isSameRatio = data.isSameRatio
  if (isSameRatio){
    let heightDiff = (tempHeight / tempWidth) * widthDiff
    newHeight += heightDiff
    newRrb = {
      left: newRrb.left - Math.sin(radian) * heightDiff,
      top: newRrb.top + Math.cos(radian) * heightDiff
    }
  }
  // 新的中心点
  let newCenter = getPointsCenter(rlt, newRrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, rlt, angle, false)
  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width: newWidth,
      height: newHeight, 
    },
    fixedPoint: rlt,
    scaleW: newWidth / tempWidth,
  }
}
let resizeNewHeight = (
  rect, 
  newHeight
) => {
  let {
    tempInfo,
    angle,
    tempHeight,
    radian,
  } = getResizeData(rect)
  let heightDiff = newHeight - tempHeight
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRrb = {
    left: rrb.left - Math.sin(radian) * heightDiff,
    top: rrb.top + Math.cos(radian) * heightDiff,
  }
  // 新的中心点
  let newCenter = getPointsCenter(rlt, newRrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, rlt, angle, false)

  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      height: newHeight,
    },
    fixedPoint: rlt,
    scaleW: newHeight / tempHeight,
  }
}
let resizeCD = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempHeight,
    radian,
  } = getResizeData(rect)
  // 求变化的高度
  let heightDiff = -Math.sin(radian) * mx + Math.cos(radian) * my
  let newHeight = Math.max(tempHeight + heightDiff, minLen)
  return resizeNewHeight(rect, newHeight)
}
let resizeD = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect)
  let rrt = tempInfo.rotateRightTop
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
  let heightDiff = -Math.sin(radian) * mx + Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  let newRlb = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRlb = {
      left: rrt.left - width,
      top: rrt.top + height,
    }
  }
  else if (angle === 90){
    newRlb = {
      left: rrt.left - height,
      top: rrt.top - width,
    }
  }
  else if (angle === 180) {
    newRlb = {
      left: rrt.left + width,
      top: rrt.top - height,
    }
  }
  else if (angle === 270){
    newRlb = {
      left: rrt.left + height,
      top: rrt.top + width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRlb = {
      left: rrt.left - (width / Math.cos(radian) + Math.sin(radian) * (height - Math.tan(radian) * width)),
      top: rrt.top + Math.cos(radian) * (height - Math.tan(radian) * width)
    }
  }
  let newCenter = getPointsCenter(newRlb, rrt)
  // 求新的 rt
  let newRt = getRotatePointByCenter(newCenter, rrt, angle, false)

  return {
    size: {
      left: newRt.left - width,
      top: newRt.top,
      height,
      width,
    },
    fixedPoint: rrt,
  }
}
let resizeAD = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect)
  // 求变化的宽度
  let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
  let newWidth = Math.max(tempWidth + widthDiff, minLen)
  widthDiff = newWidth - tempWidth

  // 求新的 rrb 坐标
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRlt = {
    left: rlt.left - Math.cos(radian) * widthDiff,
    top: rlt.top - Math.sin(radian) * widthDiff,
  }
  // 新的中心点
  let newCenter = getPointsCenter(rrb, newRlt)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)

  return {
    size: {
      left: newLt.left,
      top: newLt.top,
      width: newWidth,
    },
    fixedPoint: rrb,
    scaleW: newWidth / tempWidth,
  }
}
// 针对 line 的拖动
let resizeADL = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let tempInfo = rect.tempData
  let height = tempInfo.height
  let width = tempInfo.width
  let rbc = tempInfo.rbc
  let rad = tempInfo.rad
  let newRad = {
    left: rad.left + mx,
    top: rad.top + my,
  }
  let newCenter = getPointsCenter(newRad, rbc)
  let newAngle = parseInt(getAngleByTwoPoints(newRad, newCenter) + 90) % 360
  let ad = getRotatePointByCenter(newCenter, newRad, newAngle, false)
  let bc = getRotatePointByCenter(newCenter, rbc, newAngle, false)
  let newWidth = bc.left - ad.left
  let a = {
    left: ad.left,
    top: ad.top - height / 2,
  }
  return {
    size: {
      ...a,
      width: newWidth,
    },
    angle: newAngle,
    fixedPoint: rbc,
    scaleW: newWidth / width,
  }
}
let resizeBCL = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let tempInfo = rect.tempData
  let height = tempInfo.height
  let width = tempInfo.width
  let rbc = tempInfo.rbc
  let rad = tempInfo.rad
  let newRbc = {
    left: rbc.left + mx,
    top: rbc.top + my,
  }
  let newCenter = getPointsCenter(rad, newRbc)
  let newAngle = parseInt(getAngleByTwoPoints(rad, newCenter) + 90) % 360
  let ad = getRotatePointByCenter(newCenter, rad, newAngle, false)
  let bc = getRotatePointByCenter(newCenter, newRbc, newAngle, false)
  let newWidth = bc.left - ad.left
  let a = {
    left: ad.left,
    top: ad.top - height / 2,
  }
  return {
    size: {
      ...a,
      width: newWidth,
    },
    angle: newAngle,
    fixedPoint: rad,
    scaleW: newWidth / width,
  }
}
// line 角度锁定
let resizeADRL = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    radian,
    tempWidth,
    tempHeight,
  } = getResizeData(rect)
  let rbc = tempInfo.rbc
  let rad = tempInfo.rad
  let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)
  let newRad = getScalePoint(rbc, rad, scale)
  let newCenter = getPointsCenter(rbc, newRad)
  let ad = getRotatePointByCenter(newCenter, newRad, angle, false)
  let a = {
    left: ad.left,
    top: ad.top - tempHeight / 2,
  }
  return {
    size: {
      ...a,
      width: newWidth,
    },
    angle,
    fixedPoint: rad,
    scale,
  }
}
// line 角度锁定
let resizeBCRL = (
  rect, 
  mx = 0, 
  my = 0
) => {
  let {
    tempInfo,
    angle,
    radian,
    tempWidth,
    tempHeight,
  } = getResizeData(rect)
  let rbc = tempInfo.rbc
  let rad = tempInfo.rad
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)
  let newRbc = getScalePoint(rad, rbc, scale)
  let newCenter = getPointsCenter(rad, newRbc)
  let ad = getRotatePointByCenter(newCenter, rad, angle, false)
  let a = {
    left: ad.left,
    top: ad.top - tempHeight / 2,
  }
  return {
    size: {
      ...a,
      width: newWidth,
    },
    angle,
    fixedPoint: rad,
    scale,
  }
}
export {
  resizeAR,
  resizeBR,
  resizeCR,
  resizeDR,
  resizeA,
  resizeAB,
  resizeB,
  resizeBC,
  resizeC,
  resizeCD,
  resizeD,
  resizeAD,
  resizeADL,
  resizeBCL,
  resizeADRL,
  resizeBCRL,
  resizeNewWidth,
  resizeNewHeight,
}