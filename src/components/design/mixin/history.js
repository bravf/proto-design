import Undo from '@/core/undo'
let undo = new Undo
export default {
  methods: {
    _historyPush() {
      undo.push()
    },
    _historyBack () {
      undo.back()
    },
    _historyGo () {
      undo.go()
    },
    _historyCanGo () {
      return undo.canGo()
    },
    _historyCanBack () {
      return undo.canBack()
    },
    _historyWatch () {
      this.objects = undo.watch(this.objects)
        .changeRule(context => {
          // 不关心 data.isOpen, tempIndex, tempData, tempGroupId
          if (['isOpen', 'tempIndex', 'tempData', 'tempGroupId'].includes(context.prop)) {
            return false
          }
          // 不关心 tempGroup
          if (this._checkIsTempGroup(context.oldValue)) {
            return false
          }
          if (this._checkIsTempGroup(context.value)) {
            return false
          }
          if (this._checkIsTempGroup(context.props[0])) {
            return false
          }
        })
        .on('history', (objects) => {
          console.log('history change', objects)
          this._dbSave(objects)
          this._updateCurrRectBySelected()
          this.renderHook ++
        })
        .on('valueSet', (data) => {
          if (data.value !== data.oldValue) {
            this.renderHook ++
          }
        })
        .on('push', () => console.log('undo push'))
        .on('go', () => console.log('undo go'))
        .on('back', () => console.log('undo back'))
        .data
    },
  },
}