import jsx from 'vue-jsx'
import {
  isRightMouse,
} from '@/core/base'
import event from '@/core/event'
let { div, input, span } = jsx
let vIcon = jsx.bind('v-icon')
let _renderPageListItem = function (
  page, 
  z
) {
  let me = this
  let pageData = page.data
  let currPage = this.currPage
  let currPageIsParent = this._linkedListCheckIsParent(currPage, page)
  let isHover = currPage === page
  let paddingLeft = 16
  let paddingLeftAll = paddingLeft * z
  let isNameEdit = pageData.isNameEdit
  let isDrag = this.mouse.ing && 
    (this.mouse.eventType === 'movePage') && 
    !isHover && 
    !currPageIsParent
  let jsxProps = {
    'class_proto-tree-item': true,
    'class_proto-tree-item-drag': isDrag,
  }
  let innerJsxProps = {
    'class_proto-tree-item-inner': true,
    'class_proto-tree-item-hover': isHover,
    'style_padding-left': paddingLeftAll + 'px',
  }
  let children = []
  if (isNameEdit){
    children = [
      div(innerJsxProps,
        input('.form-input input-sm', {
          domProps_value: page.name,
          ref: 'pageInput',
          key: 'pageInput',
          on_focus () {
            me.$refs.pageInput.select()
          },
          on_blur () {
            page.data.isNameEdit = false
            me._historyPush()
          },
          on_change () {
            me.$refs.pageInput.blur()
          },
          on_input (e) {
            let value = e.target.value
            page.name = value
          },
          on_mousedown (e) {
            e.stopPropagation()
          }
        })
      ),
    ]
    setTimeout (() => {
      if (me.$refs.pageInput){
        me.$refs.pageInput.focus()
      }
    })
  }
  else {
    jsxProps = {
      ...jsxProps,
      'on_mousedown' (e) {
        e.stopPropagation()
        me._updateCurrPage(page)
        if (isRightMouse(e)) {
          me._showContextmenu(e, 'page')
        }
        else {
          me.mouse.ing = true
          me.mouse.eventType = 'movePage'
          event.$emit('windowMouseDown', e)
        }
      },
    }
    innerJsxProps = {
      ...innerJsxProps,
      'class_proto-tree-item-emit-hover': !this.mouse.ing,
    }
    if (isDrag) {
      let f = () => {
        me._linkedListRemove(me.objects[currPage.parentId], currPage, 'pages')
      }
      let jsxProps = {
        'style_left': paddingLeftAll + 'px',
        'style_width': `calc(100% - ${paddingLeftAll}px)`,
      }
      children = [
        div('.proto-tree-item-drag-handler proto-tree-item-drag-handler-bottom', {
          ...jsxProps,
          'on_mouseup' () {
            f()
            currPage.parentId = page.parentId
            me._linkedListInsertAfter(me.objects[page.parentId], page, currPage, 'pages')
          }
        }),
      ]
      if (!page.prevId){
        children = [
          ...children,
          div('.proto-tree-item-drag-handler proto-tree-item-drag-handler-top', {
            ...jsxProps,
            'on_mouseup' () {
              f()
              currPage.parentId = page.parentId
              me._linkedListInsertBefore(me.objects[page.parentId],page, currPage, 'pages')
            }
          }),
        ]
      }
      innerJsxProps = {
        ...innerJsxProps,
        'on_mouseup' () {
          f()
          currPage.parentId = page.parentId
          me._linkedListAppend(page, currPage, 'pages')
          page.data.isExpand = true
        }
      }
    }
    children = [
      ...children,
      div(innerJsxProps, 
        page.pages.headId ? vIcon({
          props_name: pageData.isExpand ? 'caret-down' : 'caret-up',
          on_mousedown () {
            // e.stopPropagation()
            page.data.isExpand = !pageData.isExpand
            me._historyPush()
          }
        }) : null,
        // vIcon('.fa-file', {props_name: 'file'}),
        span(page.name),
      )
    ]
  }
  return div(jsxProps, ...children)
}
let _renderPageList = function () {
  if (!this.currPage) {
    return null
  }
  let me = this
  let children = []
  let isDrag = this.mouse.ing && 
    (this.mouse.eventType === 'movePage')
  let timer
  this._linkedListWalk(this.objects[this.currProjectId], 'pages', (page, z) => {
    children.push(_renderPageListItem.call(this, page, z))
  })
  if (isDrag) { 
    children = [
      ...children,
      div('.proto-tree-scroll-handler proto-tree-scroll-handler-top', {
        on_mouseover () {
          timer = setInterval(() => {
            me.$refs.pageList.scrollTop --
          })
        },
        on_mouseout () {
          clearInterval(timer)
        },
      }),
      div('.proto-tree-scroll-handler proto-tree-scroll-handler-bottom', {
        on_mouseover () {
          timer = setInterval(() => {
            me.$refs.pageList.scrollTop ++
          })
        },
        on_mouseout () {
          clearInterval(timer)
        },
      }),
    ]
  }
  return div('.proto-page-list proto-tree card',
    div('.card-header',
      div('.card-title h6', '页面')
    ),
    div('.card-body proto-tree-body', {
      ref: 'pageList'
    },
      ...children,
    )
  )
}
export {
  _renderPageList,
}