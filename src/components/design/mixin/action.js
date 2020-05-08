export default {
  data () {
    let me = this
    return {
      actionMap: {
        'rect-重命名': {
          checkF: '_actionCanCurrRect',
          doF: () => {
            this.currRect.data.isNameEdit = true
            this.renderHook ++
          }
        },
        'rect-全选': {
          doF: '_actionRectSelectAll',
          hotkey: 'command + a, ctrl + a',
        },
        'rect-剪切': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectCut',
          hotkey: 'command + x, ctrl + x',
        },
        'rect-复制': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectCopy',
          hotkey: 'command + c, ctrl + c'
        },
        'rect-粘贴': {
          checkF: '_actionCanRectPaste',
          doF: '_actionRectPaste',
          hotkey: 'command + v, ctrl + v'
        },
        'rect-删除': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectDelete',
          hotkey: 'backspace'
        },
        'rect-锁定': {
          checkF: '_actionCanRectLock',
          doF: '_actionRectLock',
          hotkey: 'command + l, ctrl + l'
        },
        'rect-解锁': {
          checkF: '_actionCanRectUnLock',
          doF: '_actionRectUnLock',
          hotkey: 'command + shift + l, ctrl + shift + l'
        },
        'rect-组合': {
          checkF: '_actionCanGroup',
          doF: '_actionGroup',
          hotkey: 'command + g, ctrl + g'
        },
        'rect-打散': {
          checkF: '_actionCanUnGroup',
          doF: '_actionUnGroup',
          hotkey: 'command + shift + g, ctrl + shift + g'
        },
        'rect-上移': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectMoveUp',
          hotkey: 'command + alt + up, ctrl + alt + up',
        },
        'rect-下移': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectMoveDown',
          hotkey: 'command + alt + down, ctrl + alt + down',
        },
        'rect-置顶': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectMoveTop',
          hotkey: 'command + shift + up, ctrl + shift + up',
        },
        'rect-置底': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectMoveBottom',
          hotkey: 'command + shift + down, ctrl + shfit + down',
        },
        'rect-keyupMove': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectKeyupMove',
          hotkey: 'up',
        },
        'rect-keydownMove': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectKeydownMove',
          hotkey: 'down',
        },
        'rect-keyleftMove': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectKeyleftMove',
          hotkey: 'left',
        },
        'rect-keyrightMove': {
          checkF: '_actionCanCurrRect',
          doF: '_actionRectKeyrightMove',
          hotkey: 'right',
        },
        // page
        'page-重命名': {
          checkF: '',
          doF: () => {
            me.currPage.data.isNameEdit = true
            this.renderHook ++
          },
        },
        'page-新建子页面': {
          checkF: '',
          doF: () => {
            me._actionPageCreate(me.currPage.id)
          },
        },
        'page-删除': {
          checkF: '_actionCanPageDelete',
          doF: '_actionPageDelete',
        },
        // sys
        'sys-撤销': {
          checkF: () => {
            return !me.mouse.ing && 
              me._historyCanBack()
          },
          doF: '_historyBack',
          hotkey: 'command + z, ctrl + z',
        },
        'sys-重做': {
          checkF: () => {
            return !me.mouse.ing && 
              me._historyCanGo()
          },
          doF: '_historyGo',
          hotkey: 'command + shift + z, ctrl + shift + z',
        },
      }
    }
  },
  methods: {
    _actionGetInfo () {
      let rect = this.objects[this.currRectId]
      let isTempGroup = rect && this._checkIsTempGroup(rect)
      let isGroup = rect && this._checkIsGroup(rect)
      return {
        rect,
        isTempGroup,
        isGroup,
      }
    },
    // page
    _actionPageCreate (parentId = this.currProjectId) {
      let page = this._createPage(parentId)
      page.data.isNameEdit = true
      this._updateCurrPage(page)
      this._historyPush()
    },
    _actionCanPageDelete () {
      let cannot = (this.currPage.parentId === this.currProject.id) &&
        !this.currProject.pages.tailId
      return !cannot
    },
    _actionPageDelete () {
      this._removePage()
      this._historyPush()
    },
    // rect
    _actionRectKeyupMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, 0, -1, false)
      this._historyPush()
    },
    _actionRectKeydownMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, 0, 1, false)
      this._historyPush()
    },
    _actionRectKeyleftMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, -1, 0, false)
      this._historyPush()
    },
    _actionRectKeyrightMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, 1, 0, false)
      this._historyPush()
    },
    _actionRectSelectAll () {
      this._blurRect()
      this._walkCurrPageRects((rect) => {
        this._focusRect(rect, {shiftKey: true}, false)
      })
      this._updateCurrRectBySelected()
    },
    _actionCanGroup () {
      return this._actionGetInfo().isTempGroup
    },
    _actionGroup () {
      let currRect = this.objects[this.currRectId]
      let newGroup = this._createRect('group')
      let rects = this._getRectsByRectDeep(currRect)
      this._bindGroup(newGroup, rects)
      // 处理 selected
      rects.forEach(rect => {
        this._removeSelectedRect(rect)
      })
      this._addSelectedRect(newGroup)
      this._updateCurrRectBySelected()
      this._historyPush()
    },
    _actionCanUnGroup () {
      return this._actionGetInfo().isGroup
    },
    _actionUnGroup () {
      let currRect = this.objects[this.currRectId]
      let rects = this._getRectsByRectDeep(currRect)
      this._unbindGroup(currRect)
      // 处理 selected
      rects.forEach(rect => {
        this._addSelectedRect(rect)
      })
      this._removeSelectedRect(currRect)
      this._updateCurrRectBySelected()
      this._historyPush()
    },
    _actionRectDelete () {
      let currRect = this.objects[this.currRectId]
      this._getRectsByRectDeep(currRect).forEach(rect => {
        this._removeRectById(rect.id)
      })
      this._updateCurrRect()
      this._historyPush()
    },
    _actionRectCopy () {
      this.clipboard.count = 0
      this.clipboard.data = this._getUnLockRectsBySelected().map(rect => this._cloneRectDeep(rect))
    },
    _actionRectCut () {
      this._actionRectCopy()
      this._actionRectDelete()
    },
    _actionCanRectPaste () {
      return this.clipboard.data.length > 0
    },
    _actionRectPaste () {
      let pasteCount = ++ this.clipboard.count
      let moveDis = pasteCount * 20
      this._clearSelectedRects()
      // todo，粘贴的位置还得考虑
      this.clipboard.data.map(config => {
        let rect = this._createRectByConfig(config)
        this._addSelectedRect(rect)
        return rect
      })
      this._updateCurrRectBySelected()
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, moveDis, moveDis)
      this._clearGuideShow()
      this._historyPush()
    },
    _actionCanCurrRect () {
      return this.currRectId
    },
    _actionRectMoveUp () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.parentId]
        this._linkedListMoveUp(parent, rect)
      })
      this._historyPush()
    },
    _actionRectMoveDown () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.parentId]
        this._linkedListMoveDown(parent, rect)
      })
      this._historyPush()
    },
    _actionRectMoveTop () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.parentId]
        this._linkedListMoveTop(parent, rect)
      })
      this._historyPush()
    },
    _actionRectMoveBottom () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.parentId]
        this._linkedListMoveBottom(parent, rect)
      })
      this._historyPush()
    },
    _actionCanRectLock () {
      return this._getUnLockRectsBySelected().length
    },
    _actionCanRectUnLock () {
      return this._getLockRectsBySelected().length
    },
    _actionRectLock () {
      for (let rect in this.selectedRects) {
        rect = this._safeObject(rect)
        rect.data.isLock = true
      }
      this._updateCurrRectBySelected()
      this._historyPush()
    },
    _actionRectUnLock () { 
      for (let rect in this.selectedRects) {
        rect = this._safeObject(rect)
        rect.data.isLock = false
      }
      this._updateCurrRectBySelected()
      this._historyPush()
    },
    _actionCanRectAlign () {
      return this._actionGetInfo().isTempGroup
    },
    // 左对齐
    _actionRectAlignLeft () {
      this._updateRectTempData(this.currRect)
      let tempGroupLeft = this.currRect.tempData.left
      this._getRectsByGroup(this.currRect).forEach(rect => {
        let moveLeft = tempGroupLeft - rect.tempData.minRotateLeft
        this._move(rect, moveLeft, 0, false)
      })
      this._updateGroupSize(this.currRect)
    },
    // 左右对齐
    _actionRectAlignLeftRight () {
      this._updateRectTempData(this.currRect)
      let tempGroupCenterLeft = this.currRect.tempData.center.left
      this._getRectsByGroup(this.currRect).forEach(rect => {
        let moveLeft = tempGroupCenterLeft - rect.tempData.center.left
        this._move(rect, moveLeft, 0, false)
      })
      this._updateGroupSize(this.currRect)
    },
    // 右对齐
    _actionRectAlignRight () {
      this._updateRectTempData(this.currRect)
      let tempGroupRight = this.currRect.tempData.right
      this._getRectsByGroup(this.currRect).forEach(rect => {
        let moveLeft = tempGroupRight - rect.tempData.maxRotateLeft
        this._move(rect, moveLeft, 0, false)
      })
      this._updateGroupSize(this.currRect)
    },
    // 上对齐
    _actionRectAlignTop () {
      this._updateRectTempData(this.currRect)
      let tempGroupTop = this.currRect.tempData.top
      this._getRectsByGroup(this.currRect).forEach(rect => {
        let moveTop = tempGroupTop - rect.tempData.minRotateTop
        this._move(rect, 0, moveTop, false)
      })
      this._updateGroupSize(this.currRect)
    },
    // 上下对齐
    _actionRectAlignTopBottom () {
      this._updateRectTempData(this.currRect)
      let tempGroupCenterTop = this.currRect.tempData.center.top
      this._getRectsByGroup(this.currRect).forEach(rect => {
        let moveTop = tempGroupCenterTop - rect.tempData.center.top
        this._move(rect, 0, moveTop, false)
      })
      this._updateGroupSize(this.currRect)
    },
    // 下对齐
    _actionRectAlignBottom () {
      this._updateRectTempData(this.currRect)
      let tempGroupBottom = this.currRect.tempData.bottom
      this._getRectsByGroup(this.currRect).forEach(rect => {
        let moveTop = tempGroupBottom - rect.tempData.maxRotateTop
        this._move(rect, 0, moveTop, false)
      })
      this._updateGroupSize(this.currRect)
    },
    // 等间距排序
    _actionCanRectEqualSpace () {
      let isTempGroup = this._actionGetInfo().isTempGroup
      if (!isTempGroup) {
        return false
      }
      let rects = this._getRectsByGroup(this.currRect)
      return rects.length > 2
    },
    _actionRectEqualSpaceX () {
      this._updateRectTempData(this.currRect)
      let tempGroupWidth = this.currRect.data.width
      let rects = this._getRectsByGroup(this.currRect)
      let rectsWidth = 0
      rects.forEach(rect => {
        rectsWidth += (rect.tempData.maxRotateLeft - rect.tempData.minRotateLeft)
      })
      // 求出每份留白的长度，等间距也就是每份留白相等
      let perSpace = (tempGroupWidth - rectsWidth) / (rects.length - 1)
      let sortRects = rects
        .sort((a, b) => a.tempData.minRotateLeft - b.tempData.minRotateLeft )
      // 第一个是不动的
      sortRects.slice(0).forEach( (rect, i) => {
        if (i === 0) {
          return
        }
        let moveLeft = sortRects[i - 1].tempData.maxRotateLeft +
          perSpace - 
          rect.tempData.minRotateLeft
        this._move(rect, moveLeft, 0, false)
        this._updateRectTempData(rect)
      })
      this._updateGroupSize(this.currRect)
    },
    _actionRectEqualSpaceY () {
      this._updateRectTempData(this.currRect)
      let tempGroupHeight = this.currRect.data.height
      let rects = this._getRectsByGroup(this.currRect)
      let rectsHeight = 0
      rects.forEach(rect => {
        rectsHeight += (rect.tempData.maxRotateTop - rect.tempData.minRotateTop)
      })
      // 求出每份留白的长度，等间距也就是每份留白相等
      let perSpace = (tempGroupHeight - rectsHeight) / (rects.length - 1)
      let sortRects = rects
        .sort((a, b) => a.tempData.minRotateTop - b.tempData.minRotateTop )
      // 第一个是不动的
      sortRects.slice(0).forEach( (rect, i) => {
        if (i === 0) {
          return
        }
        let moveTop = sortRects[i - 1].tempData.maxRotateTop +
          perSpace - 
          rect.tempData.minRotateTop
        this._move(rect, 0, moveTop, false)
        this._updateRectTempData(rect)
      })
      this._updateGroupSize(this.currRect)
    },
    _actionGet (type) {
      let action = this.actionMap[type]
      let checkF = action.checkF || (() => true)
      if (typeof checkF === 'string') {
        checkF = this[checkF]
      }
      let doF = action.doF || (() => {})
      if (typeof doF === 'string') {
        doF = this[doF]
      }
      let text = type.split('-')[1] || 'unknow'
      return {
        ...action,
        doF,
        checkF,
        text,
      }
    },
    _actionSetHotKey () {
      for (let type in this.actionMap) {
        let {checkF, doF, hotkey} = this._actionGet(type)
        if (hotkey) {
          hotkey.split(',').forEach(key => {
            this._hotkey(key, (e) => {
              if (checkF.call(this)) {
                e.preventDefault()
                doF.call(this)
              }
            })
          })
        }
      }
    }
  },
  mounted () {
    this._actionSetHotKey()
  }
}