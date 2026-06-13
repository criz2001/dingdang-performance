/**
 * 绩效库状态管理
 * 负责考核项的增删改查
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LibraryItem, LibraryCategory } from '@/types'
import {
  getLibraryList,
  getLibraryItem,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
} from '@/api/library'

export const useLibraryStore = defineStore('library', () => {
  // ========== 状态定义 ==========
  const libraryList = ref<LibraryItem[]>([])
  const currentItem = ref<LibraryItem | null>(null)
  const isLoading = ref(false)
  const total = ref(0)

  // ========== 获取考核项列表 ==========
  const fetchLibraryList = async (params?: {
    category?: LibraryCategory | string
    status?: number
    keyword?: string
    page?: number
    pageSize?: number
  }): Promise<void> => {
    isLoading.value = true
    try {
      const result = await getLibraryList(params)
      libraryList.value = result.list || result
      total.value = result.total || libraryList.value.length
    } catch (error) {
      console.error('获取考核项列表失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ========== 获取单个考核项 ==========
  const fetchLibraryItem = async (id: number): Promise<void> => {
    isLoading.value = true
    try {
      currentItem.value = await getLibraryItem(id)
    } catch (error) {
      console.error('获取考核项详情失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ========== 新增考核项 ==========
  const createItem = async (data: Partial<LibraryItem>): Promise<boolean> => {
    try {
      await createLibraryItem(data)
      await fetchLibraryList()
      return true
    } catch (error) {
      console.error('创建考核项失败:', error)
      return false
    }
  }

  // ========== 更新考核项 ==========
  const updateItem = async (id: number, data: Partial<LibraryItem>): Promise<boolean> => {
    try {
      await updateLibraryItem(id, data)
      await fetchLibraryList()
      return true
    } catch (error) {
      console.error('更新考核项失败:', error)
      return false
    }
  }

  // ========== 删除考核项 ==========
  const removeItem = async (id: number): Promise<boolean> => {
    try {
      await deleteLibraryItem(id)
      await fetchLibraryList()
      return true
    } catch (error) {
      console.error('删除考核项失败:', error)
      return false
    }
  }

  return {
    // 状态
    libraryList,
    currentItem,
    isLoading,
    total,
    // 方法
    fetchLibraryList,
    fetchLibraryItem,
    createItem,
    updateItem,
    removeItem,
  }
})
