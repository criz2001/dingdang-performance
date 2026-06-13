/**
 * 财务数据 API
 * 销售额等财务数据的查询和导入
 */

import { get, post, put, del } from '@/utils/axios'
import type { FinanceData } from '@/types'

/**
 * 获取财务数据列表
 */
export function getFinanceList(params?: {
  year?: number
  month?: number
  deptId?: number
  page?: number
  pageSize?: number
}): Promise<{ list: FinanceData[]; total: number } | FinanceData[]> {
  return get<{ list: FinanceData[]; total: number } | FinanceData[]>('/finance', params)
}

/**
 * 新增财务数据
 */
export function createFinanceData(data: Partial<FinanceData>): Promise<FinanceData> {
  return post<FinanceData>('/finance', data)
}

/**
 * 更新财务数据
 */
export function updateFinanceData(
  id: number,
  data: Partial<FinanceData>
): Promise<FinanceData> {
  return put<FinanceData>(`/finance/${id}`, data)
}

/**
 * 删除财务数据
 */
export function deleteFinanceData(id: number): Promise<void> {
  return del<void>(`/finance/${id}`)
}

/**
 * 批量导入财务数据
 */
export function importFinanceData(file: File): Promise<{ success: number; fail: number; errors?: string[] }> {
  const formData = new FormData()
  formData.append('file', file)
  return post<{ success: number; fail: number; errors?: string[] }>('/finance/import', formData)
}

export const financeApi = {
  getList: getFinanceList,
  create: createFinanceData,
  update: updateFinanceData,
  delete: deleteFinanceData,
  import: importFinanceData,
}
