import {
  getRotatePointByCenter,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRectInfo,
} from '@/core/base'

export default {
  methods: {
    _rotate (mousePoint) {
      let rect = this.objects[this.currRectId]
      let info = getRectInfo(rect.data)
      let tempInfo = rect.tempData
      let oldAngle = tempInfo.angle
      let nowAngle = info.angle
      let scale = this.scale
      let newAngle =  parseInt(getAngleByTwoPoints(mousePoint, {
        left: info.center.left * scale,
        top: info.center.top * scale
      }))
      let angleDiff = newAngle - oldAngle
      angleDiff = this._checkGuideOnRotate(oldAngle, nowAngle, newAngle, angleDiff)

      if (this._checkIsGroupLike(rect)){
        this._rotateGroup(rect, angleDiff)
      }
      else {
        this._rotateRect(rect, angleDiff)
      }
    },
    _rotateTo (
      rect, 
      angle
    ) {
      let tempInfo = rect.tempData
      let angleDiff = angle - tempInfo.angle

      if (this._checkIsGroupLike(rect)){
        this._rotateGroup(rect, angleDiff)
      }
      else {
        this._rotateRect(rect, angleDiff)
      }
    },
    _rotateRect (
      rect, 
      angleDiff
    ) {
      this._updateRectData(rect, {
        angle: getEffectiveAngle(rect.tempData.angle + angleDiff)
      }, false)
      
      // 同步 group
      if (rect.groupId){
        let group = this._getRectById(rect.groupId)
        this._updateGroupSize(group)
      }
    },
    _rotateGroup (
      group, 
      angleDiff
    ) {
      let groupTempInfo = group.tempData
      let groupCenter = groupTempInfo.center
      let f = (id) => {
        let rect = this._getRectById(id)
        let tempInfo = rect.tempData
        let center = getRotatePointByCenter(groupCenter, tempInfo.center, angleDiff)
        let left = center.left - tempInfo.width / 2
        let top = center.top - tempInfo.height / 2

        this._updateRectData(rect, {
          left,
          top,
          angle: getEffectiveAngle(tempInfo.angle + angleDiff),
        }, false)
      }
      this._updateGroupState(group, f, true)
    },
  }
}