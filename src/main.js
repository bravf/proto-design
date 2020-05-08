import Vue from 'vue'
import VueRouter from 'vue-router'
import Spectre from '@/components/spectre/index'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Design from '@/components/design/index'
Vue.use(Spectre)
Vue.use(VueRouter)
Vue.component('v-icon', Icon)
Vue.config.productionTip = false
const routes = [
  {
    path: '/', 
    component: Design,
    name: 'design',
  },
]
const router = new VueRouter({
  routes,
})
new Vue({
  router
}).$mount('#app')