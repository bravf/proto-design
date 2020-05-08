import { 
  cloneDeep,
  forEachRight,
  forEach,
  isPlainObject,
 } from 'lodash'
 import EventEmitter from 'events'
class Undo {
  constructor (object = {}) {
    this._ee = new EventEmitter()
    this._changeRules = []
    this._init(object)
  }
  _init (object) {
    this.data = this._proxyDeep(object)
    this._changes = []
    this._historys = []
    this._cursor = -1
    this._historyFlag = false
  }
  watch (object) {
    this._init(object)
    return this
  }
  on (msg, f) {
    this._ee.on(msg, f)
    return this
  }
  emit (msg, data) {
    this._ee.emit(msg, data)
    return this
  }
  getHistorys () {
    return cloneDeep(this._historys)
  }
  getChanges () {
    return cloneDeep(this._changes)
  }
  getCursor () {
    return this._cursor
  }
  changeRule (f) {
    this._changeRules.push(f)
    return this
  }
  // 检测是否需要加入到 change 里
  _checkAddChange (context) {
    if (this._historyFlag) {
      return false
    }
    if (context.value === context.oldValue) {
      return false
    }
    let ret = true
    this._changeRules.every(f => {
      if (f(context) === false) {
        ret = false
        return false
      }
    })
    return ret
  }
  _proxy (object, props) {
    let me = this
    return new Proxy(object, {
      get (object, prop) {
        return object[prop]
      },
      set (object, prop, value) {
        let newProps = [...props, prop]
        let oldValue = object[prop]
        let data = {
          object,
          prop,
          value,
          oldValue,
          props: newProps,
        }
        if (me._checkAddChange(data)) {
          me._addchange(newProps.join('.'), oldValue, value)
        }
        object[prop] = isPlainObject(value) ? 
          me._proxyDeep(value, newProps) : 
          value
        me.emit('valueSet', data)
        return true
      }
    })
  }
  _proxyDeep (object, props = []) {
    if (!isPlainObject(object)) {
      return
    }
    for (let key in object) {
      if (isPlainObject(object[key])) {
        object[key] = this._proxyDeep(object[key], [...props, key])
      }
    }
    return this._proxy(object, props)
  }
  _addchange (longProp, oldValue, newValue) {
    oldValue = cloneDeep(oldValue)
    newValue = cloneDeep(newValue)
    let longPropIdx = this._changes.findIndex(
      o => o.longProp === longProp
    )
    let isLongPropIn = longPropIdx !== -1
    if (isLongPropIn) {
      let change = this._changes[longPropIdx]
      change.newValue = newValue
      // 删除原来的位置
      this._changes.splice(longPropIdx, 1)
      if (newValue !== change.oldValue) {
        this._changes.push(
          change
        )
      }
    }
    else {
      this._changes.push({
        longProp,
        oldValue,
        newValue,
      })
    }
  }
  push () {
    if (!this._changes.length) {
      return
    }
    if (this.canGo()) {
      this._historys = this._historys.slice(0, this._cursor + 1)
    }
    let history = this._changes
    this._historys.push(history)
    this._changes = []
    this._cursor ++
    let changeObjects = this.getChangeObjects(history)
    this.emit('history', changeObjects)
    this.emit('push', changeObjects)
    return this
  }
  back () {
    if (!this.canBack()) {
      return
    }
    let history = this._historys[this._cursor --]
    forEachRight(history, change => {
      let { longProp, oldValue } = change
      this._setLongPropValue(longProp, oldValue)
    })
    let changeObjects = this.getChangeObjects(history, 'left')
    this.emit('history', changeObjects)
    this.emit('back', changeObjects)
    return this
  }
  go () {
    if (!this.canGo()) {
      return
    }
    let history = this._historys[++ this._cursor]
    forEach(history, change => {
      let { longProp, newValue } = change
      this._setLongPropValue(longProp, newValue)
    })
    let changeObjects = this.getChangeObjects(history)
    this.emit('history', changeObjects)
    this.emit('go', changeObjects)
    return this
  }
  canGo () {
    return this._cursor < this._historys.length - 1
  }
  canBack () {
    return this._cursor > -1
  }
  _setLongPropValue (longProp, value) {
    value = cloneDeep(value)
    this._historyFlag = true
    let props = longProp.split('.')
    let lastProp = props.slice(-1)[0]
    let object = this.data
    props.slice(0, -1).forEach(prop => {
      object = object[prop]
    })
    object[lastProp] = value
    this._historyFlag = false
  }
  // right 向前，left 向后
  getChangeObjects (history, dir = 'right') {
    history = cloneDeep(history)
    let objects = {}
    let isRight = dir === 'right'
    let f = isRight ? forEach : forEachRight
    f(history, change => {
      let { longProp, oldValue, newValue } = change
      let object = objects
      let props = longProp.split('.')
      let lastProp = props.slice(-1)[0]
      props.slice(0, -1).forEach(prop => {
        if (!(prop in object)) {
          object[prop] = {}
        }
        object = object[prop]
      })
      object[lastProp] = isRight ? newValue : oldValue
    })
    return objects
  }
  toString () {
    return JSON.stringify(this.data)
  }
}
export default Undo