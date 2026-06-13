/**
 * 动态路由状态管理
 * 用于跟踪动态路由是否已加载，避免在路由守卫中出现状态混乱
 */

// 标记是否已加载动态路由
let _dynamicRoutesAdded = false

/**
 * 获取动态路由加载状态
 */
export function isDynamicRoutesAdded(): boolean {
  return _dynamicRoutesAdded
}

/**
 * 设置动态路由加载状态
 */
export function setDynamicRoutesAdded(value: boolean): void {
  _dynamicRoutesAdded = value
}

/**
 * 重置动态路由状态（用于登出后重新登录）
 */
export function resetDynamicRoutes(): void {
  _dynamicRoutesAdded = false
}
