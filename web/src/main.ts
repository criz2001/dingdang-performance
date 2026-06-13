/**
 * 应用入口文件
 * 初始化 Vue 应用、Pinia、Router、Element Plus
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router, { setupRouterGuard } from './router'
import './styles/index.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()
app.use(pinia)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
})

// 注册路由
app.use(router)

// 初始化路由守卫
setupRouterGuard()

// 挂载应用
app.mount('#app')
