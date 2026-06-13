/**
 * 用户状态管理
 * 负责登录、登出、用户信息管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UserInfo, LoginParams, LoginResult } from '@/types'
import { UserRole } from '@/types'
import { getToken, setToken, clearAuth, setUserInfo, getUserInfo } from '@/utils/storage'
import { login as loginApi, getUserInfo as getUserInfoApi } from '@/api/auth'
import { resetDynamicRoutes } from '@/utils/routeState'

export const useUserStore = defineStore('user', () => {
  // ========== 状态定义 ==========
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(getUserInfo())
  const isLoading = ref(false)

  // ========== 计算属性 ==========
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const isChairman = computed(() => userInfo.value?.role === UserRole.CHAIRMAN)
  const isFinance = computed(() => userInfo.value?.role === UserRole.FINANCE)
  const isHR = computed(() => userInfo.value?.role === UserRole.HR)
  const isManager = computed(() => userInfo.value?.role === UserRole.MANAGER)
  const isEmployee = computed(() => userInfo.value?.role === UserRole.EMPLOYEE)

  /**
   * 是否有指定角色
   */
  const hasRole = (roles: UserRole[]): boolean => {
    if (!userInfo.value) return false
    return roles.includes(userInfo.value.role as UserRole)
  }

  /**
   * 登录
   */
  const login = async (params: LoginParams): Promise<boolean> => {
    isLoading.value = true
    try {
      //#region debug-point login-api-call
      console.log('[DEBUG] login: 调用登录API', { params })
      //#endregion
      const result = await loginApi(params)
      //#region debug-point login-api-result
      console.log('[DEBUG] login: API返回结果', { result })
      //#endregion
      token.value = result.token
      userInfo.value = result.user
      setToken(result.token)
      setUserInfo(result.user)
      //#region debug-point login-state-set
      console.log('[DEBUG] login: 状态已设置', { token: token.value, userInfo: userInfo.value })
      //#endregion
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      console.error('登录失败:', error)
      //#region debug-point login-error
      console.log('[DEBUG] login: 登录失败', { error })
      //#endregion
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async (): Promise<void> => {
    if (!token.value) return
    try {
      const info = await getUserInfoApi()
      userInfo.value = info
      setUserInfo(info)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  /**
   * 登出
   */
  const logout = (): void => {
    token.value = null
    userInfo.value = null
    clearAuth()
    // 重置动态路由状态，确保下次登录可以重新加载
    resetDynamicRoutes()
    ElMessage.success('已退出登录')
  }

  return {
    // 状态
    token,
    userInfo,
    isLoading,
    // 计算属性
    isLoggedIn,
    isChairman,
    isFinance,
    isHR,
    isManager,
    isEmployee,
    // 方法
    hasRole,
    login,
    fetchUserInfo,
    logout,
  }
})
