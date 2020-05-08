let _linkedListAppend = function (
  parent, 
  object, 
  childrenProp = 'rects'
) {
  let children = parent[childrenProp]
  if (!children.headId){
    parent[childrenProp]['headId'] = object.id
    return
  }
  if (!children.tailId){
    parent[childrenProp]['tailId'] = object.id
    let head = this.objects[children.headId]
    let tail = this.objects[children.tailId]
    head.nextId = tail.id
    tail.prevId = head.id
    return
  }
  let oldTail = this.objects[children.tailId]
  parent[childrenProp]['tailId'] = object.id
  oldTail.nextId = object.id
  object.prevId = oldTail.id
}
let _linkedListInsertBefore = function (
  parent, 
  target, 
  insertObject, 
  childrenProp = 'rects'
) {
  let prevId = target.prevId
  let prevObject = this.objects[prevId]
  let children = parent[childrenProp]

  if (prevId){
    insertObject.prevId = prevId
    prevObject.nextId = insertObject.id
  }
  else {
    parent[childrenProp].headId = insertObject.id
    if (!children.tailId){
      parent[childrenProp].tailId = target.id
    }
  }
  insertObject.nextId = target.id
  target.prevId = insertObject.id
}
let _linkedListInsertAfter = function (
  parent, 
  target, 
  insertObject, 
  childrenProp = 'rects'
) {
  let nextId = target.nextId
  let nextObject = this.objects[nextId]

  if (nextId){
    insertObject.nextId = nextId
    nextObject.prevId = insertObject.id
  }
  else {
    parent[childrenProp].tailId = insertObject.id
  }
  insertObject.prevId = target.id
  target.nextId = insertObject.id
}
let _linkedListRemove = function (
  parent, 
  object, 
  childrenProp = 'rects'
) {
  let children = parent[childrenProp]
  let prevId = object.prevId
  let nextId = object.nextId
  object.nextId = ''
  object.prevId = ''
  if (prevId){
    let prevObject = this.objects[prevId]
    prevObject.nextId = nextId
  }
  else {
    parent[childrenProp].headId = nextId
  }

  if (nextId){
    let nextObject = this.objects[nextId]
    nextObject.prevId = prevId
  }
  else {
    parent[childrenProp].tailId = prevId
  }

  if (children.tailId === children.headId){
    parent[childrenProp].tailId = ''
    // this._commandObjectPropUpdate(parent, `${childrenProp}.tailId`, '')
  }
}
let _linkedListMoveUp = function (
  parent, 
  target, 
  childrenProp = 'rects'
) {
  let nextId = target.nextId
  // 如果已经是最顶了
  if (!nextId){
    return
  }
  let nextObject = this.objects[nextId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertAfter(parent, nextObject, target, childrenProp)
}
let _linkedListMoveDown = function (
  parent, 
  target, 
  childrenProp = 'rects'
) {
  let prevId = target.prevId
  // 如果已经是最顶了
  if (!prevId){
    return
  }
  let prevObject = this.objects[prevId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertBefore(parent, prevObject, target, childrenProp)
}
let _linkedListMoveTop = function (
  parent, 
  target, 
  childrenProp = 'rects'
) {
  let children = parent[childrenProp]
  let tailId = children.tailId
  if (!tailId || (tailId === target.id)){
    return
  }
  let tailObject = this.objects[tailId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertAfter(parent, tailObject, target, childrenProp)
}
let _linkedListMoveBottom = function (
  parent, 
  target, 
  childrenProp = 'rects'
) {
  let children = parent[childrenProp]
  let headId = children.headId
  if (headId === target.id){
    return
  }
  let headObject = this.objects[headId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertBefore(parent, headObject, target, childrenProp)
}
let _linkedListWalk = function (
  parent, 
  childrenProp = 'rects', 
  f, 
  isDeep = true
) {
  let _f = (_parent, z = 0) => {
    let start = this.objects[_parent[childrenProp].headId]
    while (start){
      f(start, z)
      let isNotExpand = start.data.isExpand === false
      if (isDeep && !isNotExpand && start[childrenProp] && start[childrenProp]['headId']){
        _f(start, z + 1)
      }
      start = this.objects[start.nextId]
    }
  }
  _f(parent)
}
let _linkedListGetObjects = function (
  parent, 
  childrenProp = 'rects'
) {
  let objects = []
  let index = 0
  this._linkedListWalk(parent, childrenProp, (object) => {
    object.tempIndex = index ++
    objects.push(object)
  })
  return objects
}
// 针对有 parentId 属性的 object
let _linkedListCheckIsParent = function (
  parent, 
  object
) {
  let parentId = parent.id
  let _parentId = object.parentId
  while (_parentId){
    if (_parentId === parentId) {
      return true
    }
    _parentId = this.objects[_parentId].parentId
  }
  return false
}
export default {
  methods: {
    _linkedListInsertBefore,
    _linkedListInsertAfter,
    _linkedListRemove,
    _linkedListAppend,
    _linkedListGetObjects,
    _linkedListMoveUp,
    _linkedListMoveDown,
    _linkedListMoveTop,
    _linkedListMoveBottom,
    _linkedListWalk,
    _linkedListCheckIsParent,
  }
}