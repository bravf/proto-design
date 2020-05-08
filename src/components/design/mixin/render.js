import jsx from 'vue-jsx'
import {
  _renderSetting
} from './render/setting'
import {
  _renderHandler
} from './render/handler'
import {
  _renderGuideShow
} from './render/guide-show'
import {
  _renderTools
} from './render/tools'
import {
  _renderRectNav
} from './render/rect-nav'
import {
  _renderRects,
  _renderRect,
  _renderRectInner,
} from './render/rect'
import {
  _renderRule,
} from './render/rule'
import {
  _renderRectList,
} from './render/rect-list'
import {
  _renderPageList,
} from './render/page-list'
import {
  _renderCircle
} from './render/circle'
import vars from '@/core/design-vars'
import { isRightMouse } from '@/core/base'
import event from '@/core/event'
let { div } = jsx
export default {
  data () {
    return {
      topRule: null,
      leftRule: null,
    }
  },
  methods: {
    _renderSetting,
    _renderHandler,
    _renderGuideShow,
    _renderTools,
    _renderRects,
    _renderRect,
    _renderRectInner,
    _renderRectNav,
    _renderRule,
    _renderRectList,
    _renderPageList,
    _renderCircle,
    _renderLoading () {
      return div('loading')
    },
    _renderMain (h) {
      jsx.h = h
      let me = this
      let isCircle = this.mouse.ing && (this.mouse.eventType === 'circle')
      return div({
        class_proto: true,
      },
        div({
          'class_proto-top': true,
          'style_height': vars.a + 'px',
          on_mousedown (e) {
            e.stopPropagation()
          }
        },
          this._renderTools()
        ),
        div({
          'class_proto-left': true,
          'style_top': vars.a + 'px',
          'style_width': vars.b + 'px',
          'style_height': `calc(100% - ${vars.a}px)`,
        },
          div('.proto-height-half', this._renderPageList()),
          div('.proto-height-half', this._renderRectNav()),
        ),
        div({
          'class_proto-middle': true,
          'style_top': vars.a + vars.c + 'px',
          'style_left': vars.b + vars.c + 'px',
          'style_right': vars.d + 'px',
          'style_height': `calc(100% - ${vars.a}px - ${vars.c}px)`,
          ref: 'middle',
          on_mousedown (e) {
            e.stopPropagation()
            me._blurRect()
            if (isRightMouse(e)) {
              me._showContextmenu(e, 'canvas')
            }
            else {
              me.mouse.eventType = 'circle'
              event.$emit('windowMouseDown', e)
            }
          }
        },
          this._renderRects(),
          this._renderGuideShow(),
          this._renderHandler(),
          isCircle ? this._renderCircle() : null,
        ),
        div({
          'class_proto-right': true,
          'style_top': vars.a + 'px',
          'style_width': vars.d + 'px',
          'style_height': `calc(100% - ${vars.a}px)`,
        },
          div('.proto-height-half', this._renderSetting(h)),
          div('.proto-height-half',this._renderRectList()),
        ),
      )
    },
  },
  mounted () {
    this._renderRule()
  },
}