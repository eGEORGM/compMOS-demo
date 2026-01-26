import Vue from 'vue'
import Vuex from 'vuex'
import bill from './modules/bill'
import order from './modules/order'
import invoice from './modules/invoice'
import config from './modules/config'
import user from './modules/user'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    bill,
    order,
    invoice,
    config,
    user
  },
  strict: debug, // 严格模式：在非生产环境下启用，检测非法状态变更
  plugins: debug ? [] : [] // 开发环境可添加logger等插件
})

