<style lang="scss">
@import "@/core/vars.scss";
.contextmenu { 
  position: absolute;
  top: 0;
  left: 0;
}
.contextmenu-item-disalbed {
  color: $gray;
  a {
    cursor: default!important;
    &:hover {
      color: $gray!important;
      background: $white!important;
    }
  }
}
</style>
<script>
import Vue from 'vue'
import jsx from 'vue-jsx'
import event from '@/core/event'
let { div, li, a } = jsx
let SpContextmenu = {
  name: 'SpContextMenu',
  props: {

  },
  data () {
    return {
      isOpen: false,
      actions: [],
      e: {},
      height: 0,
    }
  },
  methods: {
    open (
      e, 
      height, 
      actions
    ) {
      this.isOpen = true
      this.e = e
      this.height = height
      this.actions = actions
    },
    close () {
      this.isOpen = false
    },
    _renderDivider () {
      return li('.divider')
    },
    _renderItem (action) {
      if (!action) {
        return this._renderDivider()
      }
      let { checkF, doF, text, context } = action
      let jsxProps = {}
      if (checkF.call(context)) {
        jsxProps = {
          on_click () {
            doF.call(context)
          }
        }
      }
      else {
        jsxProps = {
          'class_contextmenu-item-disalbed': true,
        }
      }
      return li('.menu-item',
        jsxProps,
        a({
          attrs_href: 'javascript:;'
        }, text)
      )
    },
    _renderMain () {
      let me = this
      // 窗体宽高
      let windowWidth = window.innerWidth
      let windowHeight = window.innerHeight
      // contextmenu 的宽高
      let width = 180
      let height = this.height
      // 计算位置
      let e = this.e
      let mouseLeft = e.clientX
      let mouseTop = e.clientY
      mouseLeft = Math.min(
        mouseLeft, 
        windowWidth - width - 10
      )
      mouseTop = Math.min(
        mouseTop, 
        windowHeight - height - 10
      )
      let children = this.actions.map(
        action => this._renderItem(action)
      )
      let jsxProps = {
        style_left: mouseLeft + 'px',
        style_top: mouseTop + 'px',
        key: 'contextmenu',
        on_mousedown (e) {
          e.stopPropagation()
        },
        on_click () {
          me.close()
        },
      }
      if (!this.isOpen) {
        jsxProps = {
          ...jsxProps,
          style_display: 'none',
        }
      }
      return div('.contextmenu menu',
        jsxProps,
        ...children,
      )
    },
  },
  created () {
    event.$on('windowMouseDown', () => {
      this.close()
    })
  },
  render (h) {
    jsx.h = h
    return this._renderMain()
  }
}
let globalCase
Vue.prototype.$contextmenu = (...args) => {
  if (!globalCase) {
    let VueObject = Vue.extend(SpContextmenu)
    globalCase = new VueObject
    globalCase.$mount(document.createElement('div'))
    document.body.appendChild(globalCase.$el)
  }
  globalCase.open(...args)
}
export default SpContextmenu
</script>