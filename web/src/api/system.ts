/**
 * 系统管理模块 API
 * 用户管理相关的 API 接口
 */

import { get, post, put, del } from '@/utils/axios'
import type { User, UserQuery, UserCreateParams, UserUpdateParams } from '@/types'

/**
 * 获取用户列表
 */
export function getUsers(params: UserQuery): Promise<User[]> {
  return get<User[]>('/users', params)
}

/**
 * 获取用户详情
 */
export function getUserById(id: string): Promise<User> {
  return get<User>(`/users/${id}`)
}

/**
 * 创建用户
 */
export function createUser(params: UserCreateParams): Promise<User> {
  return post<User>('/users', params)
}

/**
 * 更新用户
 */
export function updateUser(id: string, params: UserUpdateParams): Promise<User> {
  return put<User>(`/users/${id}`, params)
}

/**
 * 删除用户
 */
export function deleteUser(id: string): Promise<void> {
  return del(`/users/${id}`)
}

/**
 * 分配角色
 */
export function assignRole(id: string, role: string): Promise<void> {
  return put(`/users/${id}/role`, { role })
}

/**
 * 启用/禁用用户（通过更新 status 字段）
 */
export function updateUserStatus(id: string, status: number): Promise<void> {
  return put(`/users/${id}`, { status })
}

// 批量启用/禁用用户可以通
