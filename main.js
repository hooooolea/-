

// #ifndef VUE3
// 导入Vue
import Vue from 'vue'

// 引入全局组件
import './components'

// 引入全局工具函数
import './utils'

// 引入全局样式
import './static/styles/index.scss'

// 导入App对象
import App from './App.vue'

// 创建Vue实例
Vue.config.productionTip = false

const app = new Vue({
    ...App,
    mpType: 'app'
})

// 挂载应用
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
    const app = createSSRApp(App)
    return {
        app
    }
}
// #endif
