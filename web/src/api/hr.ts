/**
 * HR管理 API
 * 考核下发、流程监控、用户管理等
 */

import { get, post, put, del } from '@/utils/axios'
import type { UserInfo, UserRole } from '@/types'

/**
 * 获取用户列表
 */
export function getUserList(params?: {
  role?: UserRole | string
  deptId?: number
  keyword?: string
  page?: number
  pageSize?: number
}): Promise<{ list: UserInfo[]; total: number } | UserInfo[]> {
  return get<{ list: UserInfo[]; total: number } | UserInfo[]>('/users', params)
}

/**
 * 获取单个用户详情
 */
export function getUserDetail(id: number): Promise<UserInfo> {
  return get<UserInfo>(`/users/${id}`)
}

/**
 * 新增用户
 */
export function createUser(data: Partial<UserInfo>): Promise<UserInfo> {
  return post<UserInfo>('/users', data)
}

/**
 * 更新用户信息
 */
export function updateUser(id: number, data: Partial<UserInfo>): Promise<UserInfo> {
  return put<UserInfo>(`/users/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: number): Promise<void> {
  return del<void>(`/users/${id}`)
}

/**
 * 修改用户角色
 */
export function changeUserRole(id: number, role: UserRole): Promise<void> {
  return put<void>(`/users/${id}/role`, { role })
}

/**
 * 重置用户密码
 */
export function resetUserPassword(id: number): Promise<{ password: string }> {
  return put<{ password: string }>(`/users/${id}/reset-pwd`)
}

/**
 * 获取部门列表（扁平列表）
 */
export function getDepartmentList(): Promise<any[]> {
  return get<any[]>('/dept/list')
}

/**
 * 获取所有部门（树形）
 */
export function getDepartments(): Promise<any[]> {
  return get<any[]>('/dept')
}

/**
 * 获取流程节点
 */
export function getFlowNodes(): Promise<any> {
  return get<any>('/flow/nodes')
}

/**
 * 获取流程监控数据（暂无对应后端路由，暂用 /api/flow/nodes）
 */
function getFlowMonitorData(params?: any): Promise<any> {
  return get<any>('/flow/nodes', params)
}

export const hrApi = {
  launchAssessment: (data: any) => post<any>('/assessments/launch', data),
  getFlowMonitor: (params: any) => get<any>('/flow/nodes', params),
  getUsers: getUserList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  resetUserPassword,
  getDepartmentList,
  getDepartments,
  getFlowNodes,
  getFlowMonitorData,
}
