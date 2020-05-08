import {
  getRectInfo,
  tNumber,
} from '@/core/base'
export default {
  data () {
    return {
      // 辅助线
      guide: {
        line: {
          top: new Set(),
          left: new Set(),
        },
        show: {
          top: new Set(),
          left: new Set(),
        }
      },
    }
  },
  methods: {
    // 更新辅助线
    _updateGuide () {
      let currRectId = this.currRectId
      let currRect = this.currRect
      this._clearGuideLine()
      this._getRectsByPageDeep().forEach(rect => {
        let rectId = rect.id
        let groupId = rect.groupId
        let tempGroupId = rect.tempGroupId
        // 排除本身
        if (rectId === currRectId){
          return
        }
        // 排除的子元素
        if ( (groupId === currRectId) || (tempGroupId === currRectId)){
          return
        }
        // 排除父元素
        if (this._checkIsGroup(rect) && this._getRectsByGroup(rect).includes(currRect)){
          return
        }
        // 如果父元素在 tempGroup 也排除
        if (groupId){
          if (this._getRectById(groupId).tempGroupId === currRectId){
            return
          }
        }
        let tempInfo = rect.tempData
        this.guide.line.left
          .add(tempInfo.rotateLeftTop.left)
          .add(tempInfo.rotateRightTop.left)
          .add(tempInfo.rotateRightBottom.left)
          .add(tempInfo.rotateLeftBottom.left)
          .add(tempInfo.center.left)
        
        this.guide.line.top
          .add(tempInfo.rotateLeftTop.top)
          .add(tempInfo.rotateRightTop.top)
          .add(tempInfo.rotateRightBottom.top)
          .add(tempInfo.rotateLeftBottom.top)
          .add(tempInfo.center.top)
      })
    },
    _checkRectPointGuide (
      rect, 
      pointInfo, 
      mx, 
      my
    ) {
      let min = 5
      let guideLeft = this.guide.line.left
      let guideTop = this.guide.line.top
      let guideShowLeft = this.guide.show.left
      let guideShowTop = this.guide.show.top
      let tempInfo = rect.tempData
      let nowInfo = getRectInfo(rect.data)
      let nowPoint = nowInfo[pointInfo.name]
      let oldPoint = tempInfo[pointInfo.name]
      let isStop = false
      let newPoint = {
        left: tNumber(oldPoint.left + mx),
        top: tNumber(oldPoint.top + my),
      }

      // 不直接用 has 对比，因为可能有 1px 的精度损失
      let checkInGuide = (guide, num) => {
        for (let g of guide) {
          if (Math.abs(g - num) < 1){
            return {
              isIn: true,
              value: g - num
            }
          }
        }
        return {
          isIn: false,
          value: 0,
        } 
      }
      if (pointInfo.left){
        let isInGuide = checkInGuide(guideLeft, nowPoint.left)
        if (isInGuide.isIn){
          if (Math.abs(newPoint.left - nowPoint.left) <= min){
            mx = nowPoint.left - oldPoint.left + isInGuide.value
            isStop = true
          }
          guideShowLeft.add(nowPoint.left + isInGuide.value)
        }
      }
      if (pointInfo.top){
        let isInGuide = checkInGuide(guideTop, nowPoint.top)
        if (isInGuide.isIn){
          if (Math.abs(newPoint.top - nowPoint.top) <= min){
            my = nowPoint.top - oldPoint.top + isInGuide.value
            isStop = true
          }
          guideShowTop.add(nowPoint.top + isInGuide.value)
        }
      }
      return [
        mx,
        my,
        isStop,
      ]
    },
    _checkGuideOnMove (
      rect, 
      mx, 
      my
    ) {
      // 检查辅助线
      this._clearGuideShow()
      ;['rotateLeftTop', 'rotateRightTop', 'rotateRightBottom', 'rotateLeftBottom', 'center'].forEach(name => {
        let pointInfo = {
          name,
          top: true,
          left: true,
        }
        ;[mx, my] = this._checkRectPointGuide(rect, pointInfo, mx, my)
      })
      return [mx, my]
    },
    _checkGuideOnResize (
      rect, 
      dir, 
      mx, 
      my
    ) {
      this._clearGuideShow()
      let angle = rect.data.angle
      // 只处理角度为 0 
      if (angle === 0){
        let pointInfo = {
          'a': {
            name: 'rotateLeftTop',
            left: true,
            top: true,
          },
          'b': {
            name: 'rotateRightTop',
            left: true,
            top: true,
          },
          'c': {
            name: 'rotateRightBottom',
            left: true,
            top: true,
          },
          'd': {
            name: 'rotateLeftBottom',
            left: true,
            top: true,
          },
          'ab': {
            name: 'rotateLeftTop',
            left: false,
            top: true,
          },
          'bc': {
            name: 'rotateRightTop',
            left: true,
            top: false, 
          },
          'cd': {
            name: 'rotateRightBottom',
            left: false,
            top: true,
          },
          'ad': {
            name: 'rotateLeftBottom',
            left: true,
            top: false, 
          },
        }[dir]
        ;[mx, my] = this._checkRectPointGuide(rect, pointInfo, mx, my)
      }
      return [mx, my]
    },
    _checkGuideOnRotate (
      oldAngle, 
      nowAngle, 
      newAngle, 
      angleDiff
    ) {
      let min = 5
      if (nowAngle % 90 === 0){
        if (Math.abs(newAngle - nowAngle) <= min){
          angleDiff = nowAngle - oldAngle
        }
        // 如果 nowAngle 0，则需要再用 360 计算一下
        if (nowAngle === 0){
          if (Math.abs(newAngle - 360) <= min){
            angleDiff = nowAngle - oldAngle
          }
        }
      }
      return angleDiff
    },
    _clearGuideLine () {
      this.guide.line.left = new Set()
      this.guide.line.top = new Set()
    },
    _clearGuideShow () {
      this.guide.show.left = new Set()
      this.guide.show.top = new Set()
    },
  }
}