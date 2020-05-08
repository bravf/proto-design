import {
  getUuid,
  getGroupSize,
  getRectInfo,
  middleLeft,
  middleTop,
  tNumber,
  checkRectOverlap2,
} from '@/core/base'
import * as rectConfig from '@/core/rect-config'
export default {
  data () {
    return {
      currProjectId: '',
      currPageId: '',
      currRectId: '',
      hoverRectId: '',
      tempGroupId: '',
      selectedRects: {},
      objects: {},
      handler: {
        // 用来闪烁
        show: true,
        timer: null,
      },
      rectConfig: {
        ...rectConfig,
      },
      clipboard: {
        count: 0,
        data: [],
      },
      renderHook: 1,
    }
  },
  computed: {
    scale: {
      get () {
        this.renderHook
        if (!this.currProject) {
          return 1
        }
        return parseFloat(this.currProject.data.scale)
      },
      set (value) {
        this.currProject.data.scale = value
      }
    },
    currProject: {
      get () {
        return this.objects[this.currProjectId]
      }
    },
    currPage: {
      get () {
        return this.objects[this.currPageId]
      }
    },
    currRect: {
      get () {
        return this.objects[this.currRectId]
      }
    },
    tempGroup: {
      get () {
        this.renderHook
        return this.objects[this.tempGroupId]
      }
    }
  },
  methods: {
    _safeObject (rect) {
      if (typeof rect === 'string') {
        rect = this.objects[rect]
      }
      return rect
    },
    _createProjectBase () {
      return {
        id: getUuid(),
        name: '项目',
        type: 'project',
        count: 1,
        pages: {
          headId: '',
          tailId: '',
        },
        data: {
          scale: 1,
        },
      }
    },
    _createProject () {
      let project = this._createProjectBase()
      this.objects[project.id] = project
      return project
    },
    _createPageBase (parentId) {
      return {
        id: getUuid(),
        name: '页面',
        type: 'page',
        count: 1,
        parentId,
        projectId: parentId,
        prevId: '',
        nextId: '',
        pages: {
          headId: '',
          tailId: '',
        },
        // 记录 rects
        rects: {
          headId: '',
          tailId: '',
        },
        data: {
          isNameEdit: false,
          isExpand: true,
        },
      }
    },
    _createPage (parentId = this.currProjectId) {
      let page = this._createPageBase(parentId)
      page = {
        ...page,
        name: '页面' + this.currProject.count,
        projectId: this.currProjectId,
      }
      this.currProject.count = this.currProject.count + 1
      this.objects[page.id] = page
      this._linkedListAppend(this.objects[parentId], page, 'pages')
      return page
    },
    _removePage () {
      let currPage = this.currPage
      let f = (page) => {
        this._deleteObject(page.id)
      }
      this._linkedListRemove(this.objects[currPage.parentId], currPage, 'pages')
      this._linkedListWalk(currPage, 'pages', f)
      f(currPage)
      
      let currPageId = this.objects[this.currProjectId].pages.headId
      this._updateCurrPage(this.objects[currPageId])
    },
    _createRect (type = 'rect') {
      let data = this.rectConfig[type]
      if (!data) {
        return
      }
      type = 'rect-' + type
      return this._createRectByConfig({type, data})
    },
    _createRectByConfig (config) {
      let data = config.data
      // 类型是数组，说明要创建一个 group 组件
      // 并且数组第一个是 group 信息
      if (Array.isArray(data)){
        let group = this._createRectBase(data[0].type, data[0].data)
        let rects = data.slice(1).map(o => this._createRectBase(o.type, o.data))
        this._bindGroup(group, rects)
        return group
      }
      else {
        return this._createRectBase(config.type, data)
      }
    },
    _createRectBase (
      type = 'rect', 
      data
    ) {
      data = {...data}
      let isTempGroup = type === 'rect-tempGroup'
      let index = 0
      if (!isTempGroup) {
        index = ++ this.currPage.count
      }
      let rect = {
        id: getUuid(),
        parentId: this.currPage.id,
        pageId: this.currPage.id,
        groupId: '',
        tempGroupId: '',
        data,
        // 临时数据，用来中间态计算
        tempData: null,
        // 类型
        type,
        name: data.name + index,
        prevId: '',
        nextId: '',
        tempIndex: index,
      }
      if (this._checkIsGroup(rect)){
        rect = {
          ...rect,
          rects: {
            headId: '',
            tailId: '',
          },
        }
      }
      this.objects[rect.id] = rect
      if (!isTempGroup){
        this._linkedListAppend(this.currPage, rect)
      }
      // 要返回 this.objects 里的东西，因为这里才处理了 proxy，直接返回 rect 没被代理
      return this.objects[rect.id]
    },
    _cloneRectDeep (rect) {
      rect = this._safeObject(rect)
      let f = (rect2) => {
        return {
          type: rect2.type,
          data: {...rect2.data},
        }
      }
      if (this._checkIsGroup(rect)){
        let rects = [f(rect)]
        this._getRectsByGroup(rect).forEach(rect2 => {
          rects.push(f(rect2))
        })
        return {
          type: 'rect-group',
          data: rects,
        }
      }
      else {
        return f(rect)
      }
    },
    _getObjectsByParentId (
      groupId, 
      prop = 'groupId'
    ) {
      let objects = []
      for (let key in this.objects){
        let object = this.objects[key]
        if (object && (object[prop] === groupId) ){
          objects.push(object)
        }
      }
      return objects
    },
    // 获得当前 page 下的所有 rects
    _getRectsByPageDeep (pageId = this.currPage.id) {
      let rects = this._linkedListGetObjects(this.objects[pageId])
      if (this.tempGroup){
        rects.push(this.tempGroup)
      }
      return rects
    },
    _getRectsByGroup (group) {
      group = this._safeObject(group)
      let rects = []
      if (this._checkIsTempGroup(group)){
        rects = this._getObjectsByParentId(group.id, 'tempGroupId')
      }
      else if (this._checkIsGroup(group)){
        rects = this._getObjectsByParentId(group.id)
      }
      else {
        rects = [group]
      }
      return rects
    },
    _getGroupByRect (rect) {
      rect = this._safeObject(rect)
      return this.objects[rect.groupId]
    },
    _getTempGroupByRect (rect) {
      rect = this._safeObject(rect)
      if (rect.tempGroupId){
        return this.objects[rect.tempGroupId]
      }
      let group = this._getGroupByRect(rect)
      if (group && group.tempGroupId){
        return this.objects[group.tempGroupId]
      }
      return null
    },
    // 绑定父子关系
    _bindGroup (
      group, 
      rects
    ) {
      group = this._safeObject(group)
      // 先求出 rects 中索引最大的，把 group 插入到后面
      let sortRects = new Set()
      // 记录一下 groups
      let groups = new Set()
      rects.forEach(rect => {
        rect = this._safeObject(rect)
        if (this._checkIsTempGroup(rect)){
          return
        }
        if (this._checkIsGroup(rect)){
          sortRects.add(rect)
          return
        }
        if (rect.groupId){
          let _group = this.objects[rect.groupId]
          groups.add(_group)
          sortRects.add(_group)
          return
        }
        sortRects.add(rect)
      })
      let topRect = Array.from(sortRects).sort(
        (a, b) => b.tempIndex - a.tempIndex
      )[0]
      let currPage = this.currPage
      this._linkedListRemove(currPage, group)
      this._linkedListInsertAfter(currPage, topRect, group)

      // 处理 rects 和 group 的关系
      rects.sort(
        (a, b) => a.tempIndex - b.tempIndex
      ).forEach(rect => {
        rect = this._safeObject(rect)
        if (this._checkIsTempGroup(rect)){
          return
        }
        if (this._checkIsGroup(rect)){
          this._removeRectById(rect.id)
          return
        }
        if (rect.groupId){
          if (this._getGroupByRect(rect)){
            this._linkedListRemove(this.objects[rect.groupId], rect)
          }
        }
        else  {
          this._linkedListRemove(currPage, rect)
        }
        this._linkedListAppend(group, rect)
        rect.tempGroupId = ''
        rect.groupId = group.id
        rect.parentId = group.id
      })
      // 处理一下 groups 的情况
      Array.from(groups).forEach(group => {
        if (!(group.id in this.objects)){
          return
        }
        let children = this._getRectsByGroup(group)
        if (children.length <= 1){
          this._unbindGroup(group)
        }
        else {
          group.isOpen = false
          this._updateGroupSize(group)
        }
      })
      this._updateGroupSize(group)
    },
    _unbindGroup (group) {
      group = this._safeObject(group)
      this._getRectsByGroup(group).forEach(rect => {
        rect.groupId = ''
        rect.parentId = this.currPageId
        this._linkedListRemove(group, rect)
        this._linkedListInsertBefore(this.currPage, group, rect)
      })
      this._removeRectById(group.id)
    },
    _bindTempGroup (rects) {
      if (!this.tempGroup){
        this.tempGroupId = this._createRect('tempGroup').id
      }
      let group = this.tempGroup
      rects.forEach(rect => {
        rect = this._safeObject(rect)
        rect.tempGroupId = group.id
      })
      this._updateRectTempData(group)
      this._updateGroupSize(group)
      return group
    },
    _unbindTempGroup () {
      if (!this.tempGroupId){
        return
      }
      this._getRectsByGroup(this.tempGroupId).forEach(rect => {
        rect.tempGroupId = ''
        let group = this._getGroupByRect(rect)
        if (group) {
          group.isOpen = false
        }
      })
      this._deleteObject(this.tempGroupId)
      this.tempGroupId = ''
    },
    _unbindTempGroupSome (rects) {
      if (!this.tempGroupId){
        return
      }
      rects.forEach(rect => {
        rect.tempGroupId = ''
      })
      let children = this._getRectsByGroup(this.currRectId)
      if (children.length <= 1) {
        this._unbindTempGroup()
      }
      // 否则重置 group  size
      else {
        this._updateGroupSize(this.currRectId)
      }
    },
    // 通过 id 从 rects 中找到 object
    _getRectById (id) {
      return this.objects[id]
    },
    _getTempGroup () {
      return this.objects[this.tempGroupId]
    },
    _deleteObject (id) {
      this.objects[id] = null
    },
    _removeRectById (id) {
      let rect = this.objects[id]
      if (!rect) {
        return
      }
      let group = this._getGroupByRect(id)
      if (!this._checkIsTempGroup(rect)){
        if (rect.groupId){
          if (group){
            this._linkedListRemove(group, this.objects[id])
          }
        }
        else {
          this._linkedListRemove(this.currPage, this.objects[id])
        }
      }
      this._deleteObject(rect.id)
      if (group){
        let children = this._getRectsByGroup(group)
        if (children.length === 1){
          this._unbindGroup(group)
        }
        else {
          this._updateGroupSize(group)
        }
      }
    },
    // 更新 group size
    _updateGroupSize (group) {
      group = this._safeObject(group)
      var size = this._getGroupSize(group)
      this._updateRectData(group, size, false)
      return size
    },
    _getGroupSize (group) {
      group = this._safeObject(group)
      let rects = this._getRectsByGroup(group)
      return getGroupSize(rects, group.data.angle)
    },
    _checkIsPage (object) {
      return object.type === 'page'
    },
    _checkIsRectLike (rect) {
      return rect.type.indexOf('rect-') === 0
    },
    _checkIsGroupLike (rect) {
      return rect.type === 'rect-group' || rect.type === 'rect-tempGroup'
    },
    _checkIsTempGroup (rect) {
      rect = this._safeObject(rect)
      return rect && (rect.type === 'rect-tempGroup')
    },
    _checkIsGroup (rect) {
      return rect.type === 'rect-group'
    },
    _updateAllRectsTempData () {
      this._getRectsByPageDeep().forEach(rect => {
        rect.tempData = getRectInfo(rect.data)
      })
    },
    _updateRectTempData (rect) {
      rect = this._safeObject(rect)
      this._getRectsByRectDeep(rect).forEach(rect2 => {
        rect2.tempData = getRectInfo(rect2.data)
      })
    },
    _getRectsByRectDeep (rect) {
      if (!this._checkIsGroupLike(rect)){
        return [rect]
      }
      if (this._checkIsGroup(rect)){
        return [rect, ...this._getRectsByGroup(rect)]
      }
      if (this._checkIsTempGroup(rect)){
        let rects = [rect]
        this._getRectsByGroup(rect).forEach(rect2 => {
          rects = [...rects, rect2]
          if (this._checkIsGroup(rect2)){
            rects = [...rects,...this._getRectsByGroup(rect2)]
          }
        })
        return rects
      }
    },
    _updateRectData (
      rect, 
      data, 
      isSyncParent = true
    ) {
      // 如果是 line，那么更新 height 时候同步更新 borderWidth
      // 并且最小值为 1
      let isLine = rect.type === 'rect-line'
      if (isLine && ('height' in data)){
        let height = Math.max(data.height, 1)
        data['borderWidth'] = data['height'] = height
      }
      for (let k in data){
        let v = data[k]
        if (typeof v === 'number'){
          v = tNumber(v)
        }
        rect.data[k] = v
      }

      if (isSyncParent){
        let group = this._getGroupByRect(rect)
        if (group){
          this._updateGroupSize(group)
        }
        let tempGroup = this._getTempGroupByRect(rect)
        if (tempGroup){
          this._updateGroupSize(tempGroup)
        }
      }
    },
    _updateGroupState (
      group, 
      f, 
      isRotate = false
    ) {
      let groupIds = new Set()
      this._getRectsByRectDeep(group).forEach(rect => {
        let id = rect.id
        if (this._checkIsGroup(rect)){
          groupIds.add(id)
        }
        else {
          // 如果有 group，也加入
          if (rect.groupId){
            groupIds.add(rect.groupId)
          }
          f(id)
        }
      })
      ;[...groupIds].forEach(groupId => {
        // 如果是旋转，那么还是要执行以下
        if (isRotate) {
          f(groupId)
        }
        // 不是旋转就得同步
        else {
          this._updateGroupSize(this._getRectById(groupId))
        }
      })
    },
    _addSelectedRect (rect) {
      if (this._checkIsTempGroup(rect)) {
        return
      }
      this.selectedRects[rect.id] = 1
    },
    _removeSelectedRect (rect) {
      delete this.selectedRects[rect.id]
      this._unbindTempGroupSome([rect])
    },
    _clearSelectedRects () {
      this.selectedRects = {}
      this._unbindTempGroup()
    },
    _updateCurrRectBySelected () {
      this.tempGroupId = ''
      this.currRectId = ''
      let unLockRects = this._getUnLockRectsBySelected()
      let count = unLockRects.length
      if (count <= 1) {
        this._unbindTempGroup()
        this._updateCurrRect(this.objects[unLockRects[0]])
      }
      else {
        let tempGroup = this._bindTempGroup(unLockRects)
        this._updateCurrRect(tempGroup)
      }
      this._updateAllRectsTempData()
      this._updateGuide()
      this.mouse.e = {}
      // bugfix: 重置当前页面，以为 currPageId 没有被 watch
      this.currPageId = this.currProject.currPageId
    },
    _getLockRectsBySelected () {
      return Object.keys(this.selectedRects).filter(rectId => {
        let rect = this.objects[rectId]
        return rect && 
          this.objects[rectId].data.isLock
      })
    },
    _getUnLockRectsBySelected () {
      return Object.keys(this.selectedRects).filter(rectId => {
        let rect = this.objects[rectId]
        return rect && 
          !this.objects[rectId].data.isLock
      })
    },
    _getSelectedRects () {
      return Object.keys(this.selectedRects)
    },
    _focusRect (
      rect, 
      e = {shiftKey: true}, 
      isRest = true
    ) {
      rect = this._safeObject(rect)
      let isDblclick = e.type === 'dblclick'
      let isShiftkey = e.shiftKey
      let group = this._getGroupByRect(rect)
      let tempGroup = this._getTempGroupByRect(rect)
      let currRect = this.objects[this.currRectId]
      let mouse = this.mouse
      mouse.e = e
      // 此方法处理 dblclick，shift，group，tempGroup 交杂的情况
      let f = () => {
        if ((rect === currRect) && !isShiftkey){
          if (isDblclick){
            rect.data.isEdit = true
          }
          return
        }
        if (isShiftkey && isDblclick){
          return
        }
        if (isDblclick){
          this._blurRect()
          let isGroupOpen = group.data.isOpen
          if (group && !isGroupOpen){
            group.data.isOpen = true
          }
          if (!group || (group && isGroupOpen)){
            rect.data.isEdit = true
          }
          this._addSelectedRect(rect)
          return
        }
        if (!isShiftkey){
          if (!group && !tempGroup){
            this._blurRect()
            this._addSelectedRect(rect)
            if (this._checkIsGroup(rect)){
              rect.data.isOpen = false
            }
            return
          }
          if (tempGroup){
            this._addSelectedRect(tempGroup)
            return
          }
          if (group){
            let groupIsOpen = group.data.isOpen
            this._blurRect()
            if (!groupIsOpen){
              this._addSelectedRect(group)
            }
            else {
              this._addSelectedRect(rect)
              group.data.isOpen = true
            }
          }
          return
        }
        if (isShiftkey){
          if (this._checkIsGroup(rect) && rect.data.isOpen){
            return
          }
          if (group && !group.data.isOpen){
            rect = group
          }
          if (rect.id in this.selectedRects){
            this._removeSelectedRect(rect)
          }
          else  {
            this._addSelectedRect(rect)
          }
        }
      }
      f()
      if (isRest) {
        this._updateCurrRectBySelected()
      }
    },
    _blurRect (closeGroup = true) {
      this.selectedRects = {}
      this._hoverOffRect()
      let rect = this.objects[this.currRectId]
      if (!rect) {
        return
      }
      this.currRectId = ''
      if (this._checkIsTempGroup(rect)){
        this._unbindTempGroup(rect)
      }
      else {
        rect.data.isEdit = false
      }
      if (closeGroup){
        // 如果 rect 父亲，则关闭父亲
        let group = this._getGroupByRect(rect)
        if (group){
          group.data.isOpen = false
        }
      }
    },
    _hoverRect (rect) {
      rect = this._safeObject(rect)
      if (this.mouse.ing){
        return
      }
      let target = rect
      let group = this._getGroupByRect(rect)
      if (group && !group.data.isOpen){
        target = group
      }
      if (this._checkIsGroup(rect) && rect.data.isOpen){
        target = null
      }
      this.hoverRectId = target ? target.id : ''
    },
    _hoverOffRect () {
      this.hoverRectId = ''
    },
    _getMousePoint (e) {
      let $middle = document.querySelector('.proto-middle')
      return {
        left: e.clientX + $middle.scrollLeft - middleLeft,
        top: e.clientY + $middle.scrollTop - middleTop,
      }
    },
    _getRectBaseJsxProps (
      rect, 
      scale = 1
    ) {
      rect = this._safeObject(rect)
      let data = rect.data
      let opacity = data.opacity / 100
      if (rect.groupId) {
        let parentOpacity = this.objects[rect.groupId].data.opacity / 100
        opacity *= parentOpacity
      }
      opacity = tNumber(opacity, 2)
      return {
        style_left: tNumber(data.left * scale, 0) + 'px',
        style_top: tNumber(data.top * scale, 0) + 'px',
        style_width: tNumber(data.width * scale, 0) + 'px',
        style_height: tNumber(data.height * scale, 0) + 'px',
        'style_z-index': data.zIndex,
        style_transform: `rotate(${data.angle}deg)`,
        style_opacity: opacity,
      }
    },
    _updateCurrPage (page) {
      page = this._safeObject(page)
      this.currPageId = page.id
      this.currProject.currPageId = page.id
      this._updateCurrRect()
    },
    _updateCurrRect (rect) {
      rect = this._safeObject(rect)
      this.currRectId = rect ? rect.id : ''
      if (rect && rect.groupId) {
        this._safeObject(rect.groupId).data.isOpen = true
      }
    },
    _updateHoverRect (rect) {
      rect = this._safeObject(rect)
      this.hoverRectId = rect ? rect.id : ''
    },
    _flashHandler () {
      this.handler.show = false
      clearTimeout(this.handler.timer)
      this.handler.timer = setTimeout(() => {
        this.handler.show = true
      }, 1000)
    },
    _getCircleSize () {
      let mouse = this.mouse
      let left = Math.min(mouse.startLeft, mouse.currLeft) 
      let top = Math.min(mouse.startTop, mouse.currTop) 
      let width = Math.abs(mouse.currLeft - mouse.startLeft)
      let height = Math.abs(mouse.currTop - mouse.startTop)
      return {
        left,
        top, 
        width,
        height,
        right: left + width,
        bottom: top + height,
        angle: 0,
      }
    },
    _walkCurrPageRects (
      f, 
      isDeep = false
    ) {
      this._linkedListWalk(this.currPage, 'rects', f, isDeep)
    },
    _focusRectWhenCircle () {
      if (!this.currPage) {
        return
      }
      let circle = this._getCircleSize()
      circle = getRectInfo({
        ...circle,
        angle: 0,
      })
      this._walkCurrPageRects((rect => {
        if (checkRectOverlap2(getRectInfo(rect.data, this.scale), circle)) {
          this._focusRect(rect, {shiftKey: true}, false)
        }
      }))
      this._updateCurrRectBySelected()
    },
    _showContextmenu (
      e, 
      type
    ) {
      let height = 0
      let actionTypes = []
      let actions = []
      if (type === 'rect-item') {
        height = 310
        actionTypes = [
          'rect-重命名',
          'rect-剪切',
          'rect-复制',
          'rect-删除',
          null,
          'rect-锁定',
          'rect-解锁',
          // 'rect-隐藏',
          null,
          'rect-置顶',
          'rect-置底',
        ]
      }
      else if (type === 'rect') {
        height = 340
        actionTypes = [
          'rect-剪切',
          'rect-复制',
          'rect-粘贴',
          'rect-删除',
          null,
          'rect-锁定',
          'rect-解锁',
          // 'rect-隐藏',
          null,
          'rect-组合',
          'rect-打散',
          null,
          'rect-置顶',
          'rect-置底',
        ]
      }
      else if (type === 'page') {
        height = 200
        actionTypes = [
          'page-重命名',
          'page-新建子页面',
          'page-删除',
        ]
      }
      else if (type === 'canvas') {
        height = 40
        actionTypes = [
          'rect-粘贴',
        ]
      }
      actions = actionTypes.map(actionType => {
        if (!actionType) {
          return actionType
        }
        return {
          ...this._actionGet(actionType),
          context: this,
        }
      })
      this.$contextmenu(e, height, actions)
    },
    _updateCurrRectOpacity (opacity) {
      if (this._checkIsTempGroup(this.currRect)) {
        this._getRectsByGroup(this.currRect).forEach(rect => {
          rect.data.opacity = opacity
        })
      }
      this.currRect.data.opacity = opacity
    },
  }
}