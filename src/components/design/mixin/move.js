export default {
  methods: {
    _move (
      rect, 
      mx = 0, 
      my = 0, 
      isCheck = true
    ) {
      rect = this._safeObject(rect)
      if (isCheck){
        [mx, my] = this._checkGuideOnMove(rect, mx, my)
      }
      let isShift = this.mouse.e.shiftKey
      if (isShift) {
        if (Math.abs(mx) > Math.abs(my)) {
          my = 0
        }
        else {
          mx = 0
        }
      }
      if (this._checkIsGroupLike(rect)){
        this._moveGroup(rect, mx, my)
      }
      else {
        this._moveRect(rect, mx, my)
      }
    },
    _moveTo (
      rect, 
      left = null, 
      top = null
    ) {
      let tempInfo = rect.tempData
      let mx = 0
      let my = 0
      if (left !== null){
        mx = left - tempInfo.left
      }
      if (top !== null){
        my = top - tempInfo.top
      }
      this._move(rect, mx, my, false)
    },
    _moveLeftTo (
      rect, 
      left
    ) {
      this._moveTo(rect, left)
    },
    _moveTopTo (
      rect, 
      top
    ) {
      this._moveTo(rect, null, top)
    },
    _moveRect (
      rect, 
      mx = 0, 
      my = 0
    ) {
      let tempInfo = rect.tempData
      this._updateRectData(rect, {
        left: tempInfo.left + mx,
        top: tempInfo.top + my
      }, false)
      if (rect.groupId){
        let group = this._getRectById(rect.groupId)
        this._updateGroupSize(group)
      }
    },
    _moveGroup (
      group, 
      mx = 0, 
      my = 0
    ) {
      let f = (rect) => {
        rect = this._safeObject(rect)
        let tempInfo = rect.tempData
        this._updateRectData(rect, {
          left: tempInfo.left + mx,
          top: tempInfo.top + my,
        }, false)
      }
      this._updateGroupState(group, f, false)
      f(group)
    },
  }
}