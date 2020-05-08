import {
  getScalePoint,
  getPointsCenter,
  getWH,
  getRotatePointByCenter,
  getRadian,
  getTextSize,
} from '@/core/base'
import {
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
} from '@/core/resize'
export default {
  methods: {
    _resize (
      mx, 
      my
    ) {
      let rect = this.objects[this.currRectId]
      let dir = this.mouse.resizerDir
      let isLine = rect.type === 'rect-line'
      ;[mx, my] = this._checkGuideOnResize(rect, dir, mx, my)
      if (this._checkIsGroupLike(rect)){
        this._resizeGroup(rect, dir, mx, my)
      }
      else if (isLine){
        this._resizeLine(rect, dir, mx, my)
      }
      else {
        this._resizeRect(rect, dir, mx, my)
      }
    },
    _resizeText (
      rect, 
      text
    ) {
      let data = rect.data
      text = text || data.text
      let font = `${data.fontSize}px ${data.fontFamily}`
      let size = getTextSize(text, font)
      let newWidth = size.width
      this._resizeWidthTo(rect, newWidth)
      let newHeight = size.height
      this._resizeHeightTo(rect, newHeight)
    },
    _resizeLine (
      rect, 
      dir, 
      mx, 
      my
    ) {
      let resizeF = {
        ad: resizeADL,
        bc: resizeBCL,
      }[dir]
      if (rect.data.isAngleLock) {
        resizeF = {
          ad: resizeADRL,
          bc: resizeBCRL,
        }[dir]
      }
      let resizeRes = resizeF(rect, mx, my)
      rect.data.angle = resizeRes.angle
      // this._commandRectDataPropUpdate(rect, 'angle', resizeRes.angle)
      this._updateRectData(rect, resizeRes.size)
    },
    // 同时缩放
    _scaleGroupRectR (
      rect, 
      fixedPoint, 
      scale
    ) {
      let rectData = rect.data
      let rectInfo = rect.tempData
      let rlt = rectInfo.rotateLeftTop
      let rrb = rectInfo.rotateRightBottom

      let newRlt = getScalePoint(fixedPoint, rlt, scale)
      let newRrb = getScalePoint(fixedPoint, rrb, scale)
      let newCenter = getPointsCenter(newRlt, newRrb)
      let lt = getRotatePointByCenter(newCenter, newRlt, rectData.angle, false)
      let wh = getWH(lt, newCenter)
      this._updateRectData(rect, {
        left: lt.left,
        top: lt.top,
        width: wh.width,
        height: wh.height,
      }, false)
    },
    _scaleGroupRectWOrH (
      group, 
      rect, 
      scale, 
      dir
    ) {
      let groupData = group.data
      let groupTempInfo = group.tempData
      let groupAngle = groupData.angle
      let data = rect.data
      let tempInfo = rect.tempData
      let angle = data.angle
      let radian = getRadian(groupAngle)
      let fixed
      let type = 'left'

      if (dir === 'bc'){
        fixed = groupTempInfo.left 
      }
      else if (dir === 'ad'){
        fixed = groupTempInfo.left + groupTempInfo.width
      }
      else if (dir === 'cd'){
        fixed = groupTempInfo.top
        type = 'top'
      }
      else {
        fixed = groupTempInfo.top + groupTempInfo.height
        type = 'top'
      }

      let angleDiff = Math.abs(angle - groupAngle)
      let is180 = angleDiff === 180
      let is90 = angleDiff === 90
      let is270 = angleDiff === 270

      let rlt = tempInfo.rotateLeftTop
      let rrt = tempInfo.rotateRightTop
      let rrb = tempInfo.rotateRightBottom
      let rlb = tempInfo.rotateLeftBottom

      // 根据 rect 和 group 的角度差，重新选择左上角和右下角的点
      if (is90){
        [rlt, rrb] = [rlb, rrt]
      }
      else if (is180){
        [rlt, rrb] = [rrb, rlt]
      }
      else if (is270){
        [rlt, rrb] = [rrt, rlb]
      }

      let lt = getRotatePointByCenter(
        groupTempInfo.center,
        rlt,
        groupAngle,
        false,
      )
      let dis = lt[type] - fixed
      let disDiff = dis * (scale - 1)
      let newRlt = {
        left: rlt.left,
        top: rlt.top,
      }
      if (type === 'left'){
        newRlt.left += Math.cos(radian) * disDiff
        newRlt.top += Math.sin(radian) * disDiff
      }
      else {
        newRlt.left -= Math.sin(radian) * disDiff
        newRlt.top += Math.cos(radian) * disDiff
      }
      
      let rb = getRotatePointByCenter(
        groupTempInfo.center,
        rrb,
        groupAngle,
        false,
      )
      // rect cd 距离 group ad 的距离
      let dis2 = rb[type] - fixed
      let dis2Diff = dis2 * (scale - 1)
      let newRrb = {
        left: rrb.left,
        top: rrb.top,
      }
      if (type === 'left'){
        newRrb.left += Math.cos(radian) * dis2Diff
        newRrb.top += Math.sin(radian) * dis2Diff
      }
      else {
        newRrb.left -= Math.sin(radian) * dis2Diff
        newRrb.top += Math.cos(radian) * dis2Diff
      }

      let newCenter = getPointsCenter(newRlt, newRrb)
      let newLt = getRotatePointByCenter(
        newCenter, 
        newRlt, 
        angle, 
        false
      )
      let wh = getWH(newLt, newCenter)
      let size = {
        left: newLt.left,
        top: newLt.top,
        width: wh.width,
        height: wh.height,
      }
      // 根据角度差进行弥补
      if (is180){
        size.left = data.left - size.width
        size.top = data.top - size.height
      }
      else if (is90){
        size.top = data.top - size.height
      }
      else if (is270){
        size.left = data.left - size.width
      }
      this._updateRectData(rect, size, false)
    },
    // 同时缩放
    _scaleGroupR (
      group, 
      fixedPoint, 
      scale
    ) {
      let f = (id) => {
        let rect = this._getRectById(id)
        this._scaleGroupRectR(rect, fixedPoint, scale)
      }
      this._updateGroupState(group, f)
    },
    _resizeGroupWithRes (
      group, 
      resizeRes, 
      dir
    ) {
      let { fixedPoint } = resizeRes
      let scale = resizeRes.scaleW || resizeRes.scaleH
      let groupData = group.data
      let groupAngle = groupData.angle
      let f = (id) => {
        let rect = this._getRectById(id)
        let data = rect.data
        let angle = data.angle

        // 如果角度差不是 90 的倍数，则同比缩放 rect
        // 或者是 isSameRatio
        let isSameRatio = groupData.isSameRatio || data.isSameRatio
        let is90 = (angle - groupAngle) % 90 !== 0
        if ( isSameRatio || is90 ){
          this._scaleGroupRectR(rect, fixedPoint, scale)
        }
        else {
          this._scaleGroupRectWOrH(group, rect, scale, dir)
        }
      }
      this._updateGroupState(group, f)
      return this._getGroupSize(group)
    },
    // a ---- b
    // d ---- c 
    _resizeGroup (
      group, 
      dir = 'c', 
      mx = 0, 
      my = 0
    ) {
      let resizeF = {
        a: resizeAR,
        b: resizeBR,
        c: resizeCR,
        d: resizeDR,
        ab: resizeAB,
        bc: resizeBC,
        cd: resizeCD,
        ad: resizeAD,
      }[dir]
      let resizeRes = resizeF(group, mx, my)
      let groupSize = {}
      if (['a', 'b', 'c', 'd'].includes(dir)){
        let {scale, fixedPoint} = resizeRes
        this._scaleGroupR(group, fixedPoint, scale)
        groupSize = resizeRes.size
      }
      else {
        groupSize = this._resizeGroupWithRes(group, resizeRes, dir)
      }
      this._updateRectData(group, groupSize)
    },
    // a ---- b
    // d ---- c 
    _resizeRect (
      rect, 
      dir = 'bc', 
      mx, 
      my
    ) {
      let resizeF = {
        a: resizeA,
        b: resizeB,
        c: resizeC,
        d: resizeD,
        ab: resizeAB,
        bc: resizeBC,
        cd: resizeCD,
        ad: resizeAD,
      }[dir]
      let shiftKey = this.mouse.e.shiftKey
      let isSameRatio = rect.data.isSameRatio
      if (shiftKey || isSameRatio) {
        resizeF = {
          a: resizeAR,
          b: resizeBR,
          c: resizeCR,
          d: resizeDR,
        }[dir]
      }
      let resizeRes = resizeF(rect, mx, my)
      this._updateRectData(rect, resizeRes.size)
    },
    // 不能同时设置 width 和 height，需要分开调用
    _resizeTo (
      rect, 
      width = null, 
      height = null
    ) {
      let isGroupLike = this._checkIsGroupLike(rect)
      let resizeRes
      let dir

      if (width !== null){
        resizeRes = resizeNewWidth(rect, width)
        dir = 'bc'
      }
      if (height !== null){
        resizeRes = resizeNewHeight(rect, height)
        dir = 'cd'
      }
      if (isGroupLike){
        let groupSize = this._resizeGroupWithRes(rect, resizeRes, dir)
        this._updateRectData(rect, groupSize)
      }
      else {
        this._updateRectData(rect, resizeRes.size)
      }
    },
    _resizeWidthTo (
      rect, 
      width
    ) {
      this._resizeTo(rect, width)
    },
    _resizeHeightTo (
      rect, 
      height,
    ) {
      this._resizeTo(rect, null, height)
    },
  }
}