/**
 * 绩效报告 API
 * 个人、部门、公司绩效报告查询
 */

import { get } from '@/utils/axios'
import type { PersonalReport, DepartmentReport, CompanyReport } from '@/types'

/**
 * 个人绩效报告
 */
export function getPersonalReport(params: {
  userId?: number
  year: number
  month: number
}): Promise<PersonalReport> {
  return get<PersonalReport>('/reports/user-report', params)
}

/**
 * 获取部门绩效报告
 */
export function getDepartmentReport(params: {
  deptId?: number
  year: number
  month: number
}): Promise<DepartmentReport> {
  return get<DepartmentReport>('/reports/dept-summary', params)
}

/**
 * 获取公司绩效报告
 */
export function getCompanyReport(params: {
  year: number
  month: number
}): Promise<CompanyReport> {
  return get<CompanyReport>('/reports/ranking', params)
}

/**
 * 获取个人历史报告列表
 */
export function getPersonalReportHistory(params?: {
  userId?: number
  year?: number
  month?: number
}): Promise<any> {
  return get<any>('/reports/user-report', params)
}

/**
 * 报告API对象
 */
export const reportApi = {
  getPersonalReport: (params?: any) => get<any>('/reports/user-report', params),
  getDepartmentReport: (params?: any) => get<any>('/reports/dept-summary', params),
  getCompanyReport: (params?: any) => get<any>('/reports/ranking', params),
  getPersonalReportHistory,
  getLevelDistribution: (params?: any) => get<any>('/reports/level-distribution', params),
  getMonthlyTrend: (params?: any) => get<any>('/reports/monthly-trend', params),
}
