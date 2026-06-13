/**
 * 路由配置
 * 创建路由实例并配置路由守卫
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'
import { getToken } from '@/utils/storage'
import { useUserStore } from '@/stores/user'
import { staticRoutes, filterRoutesByRole } from './routes'
import {
  isDynamicRoutesAdded,
  setDynamicRoutesAdded,
  resetDynamicRoutes,
} from '@/utils/routeState'

/**
 * 创建路由实例
 */
export const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

// 导出重置函数供其他模块使用
export { resetDynamicRoutes }

/**
 * 初始化路由守卫
 */
export function setupRouterGuard(): void {

  // ========== 前置守卫 ==========
  router.beforeEach(async (to, _from, next) => {
    console.log('[DEBUG] beforeEach: 路由导航', { from: _from.path, to: to.path })

    const title = to.meta?.title as string || '叮当绩效'
    document.title = `${title} - 叮当绩效`

    // 白名单路由（无需登录即可访问）
    const whiteList = ['/login', '/404']
    const isWhiteList = whiteList.includes(to.path)

    // 检查登录状态
    const hasToken = getToken()

    console.log('[DEBUG] beforeEach: 检查token', { hasToken, isWhiteList })

    if (hasToken) {
      // 已登录
      if (to.path === '/login') {
        // 已登录且访问登录页，跳转到首页
        console.log('[DEBUG] beforeEach: 已登录访问登录页，跳转到dashboard')
        next({ path: '/dashboard', replace: true })
        return
      }

      const userStore = useUserStore()

      console.log('[DEBUG] beforeEach: 检查userInfo', { userInfo: userStore.userInfo, dynamicRoutesAdded: isDynamicRoutesAdded() })

      // 如果动态路由尚未加载，先加载
      if (!isDynamicRoutesAdded()) {
        try {
          // 检查 userStore 中是否已有用户信息（登录成功后会有）
          if (!userStore.userInfo) {
            console.log('[DEBUG] beforeEach: userInfo不存在，调用fetchUserInfo')
            await userStore.fetchUserInfo()
          } else {
            console.log('[DEBUG] beforeEach: userInfo已存在，使用store中的数据')
          }

          console.log('[DEBUG] beforeEach: fetchUserInfo后', { userInfo: userStore.userInfo })

          // 根据用户角色动态添加路由
          if (userStore.userInfo) {
            const dynamicRoutes = filterRoutesByRole(userStore.userInfo.role)
            console.log('[DEBUG] beforeEach: 添加动态路由', { role: userStore.userInfo.role, routesCount: dynamicRoutes.length })
            
            // 直接添加所有动态路由
            for (const route of dynamicRoutes) {
              router.addRoute(route)
            }
            
            setDynamicRoutesAdded(true)
            console.log('[DEBUG] beforeEach: 当前路由列表', router.getRoutes().map(r => r.path))

            // 重试导航，确保新添加的路由被识别
            console.log('[DEBUG] beforeEach: 动态路由已添加，重试导航', { to: to.path })
            next({ ...to, replace: true })
            return
          } else {
            // 获取用户信息失败，清理状态并跳转到登录页
            console.log('[DEBUG] beforeEach: userInfo为空，跳转到登录页')
            userStore.logout()
            next(`/login?redirect=${to.path}`)
            return
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          console.log('[DEBUG] beforeEach: fetchUserInfo出错', { error })
          userStore.logout()
          next(`/login?redirect=${to.path}`)
          return
        }
      }

      console.log('[DEBUG] beforeEach: 直接放行', { to: to.path })
      next()
    } else {
      // 未登录
      if (isWhiteList) {
        console.log('[DEBUG] beforeEach: 白名单路由，放行', { to: to.path })
        next()
      } else {
        console.log('[DEBUG] beforeEach: 无token，跳转到登录页', { to: to.path })
        next(`/login?redirect=${to.path}`)
      }
    }
  })

  // ========== 后置守卫 ==========
  router.afterEach(() => {
    // 可以在这里做滚动条回到顶部等操作
  })
}

export default router
export { staticRoutes, asyncRoutes } from './routes'
export { filterRoutesByRole } from './routes'