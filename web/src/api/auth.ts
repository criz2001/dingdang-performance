/**
 * 认证模块 API
 * 登录、登出、获取用户信息
 */

import { get, post } from '@/utils/axios'
import type { LoginParams, LoginResult, UserInfo } from '@/types'

/**
 * 用户登录
 */
export function login(params: LoginParams): Promise<LoginResult> {
  return post<LoginResult>('/auth/login', params)
}

/**
 * 获取当前用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return get<UserInfo>('/auth/me')
}

/**
 * 修改密码
 */
export function changePassword(params: { oldPassword: string; newPassword: string }): Promise<void> {
  return post<void>('/auth/change-password', params)
}

export const authApi = {
  login,
  getUserInfo,
  changePassword,
}
