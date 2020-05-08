import SpColor from './color'
import SpContextmenu from './contextmenu'
let components = [
  SpColor,
  SpContextmenu,
]
let install = (Vue) => {
  components.forEach(com => {
    Vue.component(com.name, com)
  })
}
export default {
  install,
}
