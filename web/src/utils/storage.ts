/**
 * Storage 工具函数
 * 封装 localStorage 操作，统一处理 JSON 序列化
 */

const TOKEN_KEY = 'dingdang_token'
const USER_INFO_KEY = 'dingdang_user_info'

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export function getUserInfo<T = any>(): T | null {
  const data = localStorage.getItem(USER_INFO_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

/**
 * 设置用户信息
 */
export function setUserInfo<T = any>(info: T): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

/**
 * 移除用户信息
 */
export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 清除所有登录信息
 */
export function clearAuth(): void {
  removeToken()
  removeUserInfo()
}
