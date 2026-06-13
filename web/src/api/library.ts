/**
 * 绩效库 API
 * 考核项的增删改查
 */

import { get, post, put, del } from '@/utils/axios'
import type { LibraryItem, LibraryCategory, PageResult } from '@/types'

/**
 * 获取考核项列表
 */
export function getLibraryList(params?: {
  category?: LibraryCategory | string
  status?: number
  keyword?: string
  page?: number
  pageSize?: number
}): Promise<{ list: LibraryItem[]; total: number } | LibraryItem[]> {
  return get<{ list: LibraryItem[]; total: number } | LibraryItem[]>('/library', params)
}

/**
 * 获取单个考核项详情
 */
export function getLibraryItem(id: number): Promise<LibraryItem> {
  return get<LibraryItem>(`/library/${id}`)
}

/**
 * 新增考核项
 */
export function createLibraryItem(data: Partial<LibraryItem>): Promise<LibraryItem> {
  return post<LibraryItem>('/library', data)
}

/**
 * 更新考核项
 */
export function updateLibraryItem(
  id: number,
  data: Partial<LibraryItem>
): Promise<LibraryItem> {
  return put<LibraryItem>(`/library/${id}`, data)
}

/**
 * 删除考核项
 */
export function deleteLibraryItem(id: number): Promise<void> {
  return del<void>(`/library/${id}`)
}

/**
 * 批量导入考核项
 */
export function importLibraryItems(file: File): Promise<{ success: number; fail: number; errors?: string[] }> {
  const formData = new FormData()
  formData.append('file', file)
  return post<{ success: number; fail: number; errors?: string[] }>('/library/import', formData)
}

export const libraryApi = {
  getList: getLibraryList,
  getItem: getLibraryItem,
  create: createLibraryItem,
  update: updateLibraryItem,
  delete: deleteLibraryItem,
  import: importLibraryItems,
}
