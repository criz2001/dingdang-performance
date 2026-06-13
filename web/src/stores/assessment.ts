/**
 * 考核状态管理
 * 负责考核列表、详情、流程操作
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  Assessment,
  AssessmentDetail,
  AssessmentSelectParams,
  AssessmentItem,
  TodoItem,
} from '@/types'
import {
  getAssessments,
  getAssessmentDetail,
  selectAssessmentItems,
  submitSelfScore,
  submitManagerScore,
  rollbackAssessment,
  launchAssessment,
  getTodos,
} from '@/api/assessment'

export const useAssessmentStore = defineStore('assessment', () => {
  // ========== 状态定义 ==========
  const assessmentList = ref<Assessment[]>([])
  const currentAssessment = ref<AssessmentDetail | null>(null)
  const todoList = ref<TodoItem[]>([])
  const isLoading = ref(false)

  // ========== 考核列表 ==========
  const fetchAssessmentList = async (params?: {
    status?: number
    year?: number
    month?: number
    page?: number
    pageSize?: number
  }): Promise<void> => {
    isLoading.value = true
    try {
      const result = await getAssessments(params)
      assessmentList.value = result.list || result
    } catch (error) {
      console.error('获取考核列表失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ========== 考核详情 ==========
  const fetchAssessmentDetail = async (id: number): Promise<void> => {
    isLoading.value = true
    try {
      const detail = await getAssessmentDetail(id)
      currentAssessment.value = detail
    } catch (error) {
      console.error('获取考核详情失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ========== 选取考核项 ==========
  const selectItems = async (params: AssessmentSelectParams): Promise<boolean> => {
    try {
      await selectAssessmentItems(params)
      // 刷新详情
      if (currentAssessment.value) {
        await fetchAssessmentDetail(currentAssessment.value.id)
      }
      return true
    } catch (error) {
      console.error('选取考核项失败:', error)
      return false
    }
  }

  // ========== 员工自评 ==========
  const doSelfScore = async (
    assessmentId: number,
    items: { itemId: number; score: number }[]
  ): Promise<boolean> => {
    try {
      await submitSelfScore(assessmentId, items)
      if (currentAssessment.value) {
        await fetchAssessmentDetail(currentAssessment.value.id)
      }
      return true
    } catch (error) {
      console.error('提交自评失败:', error)
      return false
    }
  }

  // ========== 经理评分 ==========
  const doManagerScore = async (
    assessmentId: number,
    items: { itemId: number; score: number }[]
  ): Promise<boolean> => {
    try {
      await submitManagerScore(assessmentId, items)
      if (currentAssessment.value) {
        await fetchAssessmentDetail(currentAssessment.value.id)
      }
      return true
    } catch (error) {
      console.error('提交评分失败:', error)
      return false
    }
  }

  // ========== 回退操作 ==========
  const doRollback = async (
    assessmentId: number,
    toNode: string,
    reason: string
  ): Promise<boolean> => {
    try {
      await rollbackAssessment(assessmentId, toNode, reason)
      if (currentAssessment.value) {
        await fetchAssessmentDetail(currentAssessment.value.id)
      }
      return true
    } catch (error) {
      console.error('回退失败:', error)
      return false
    }
  }

  // ========== 发起考核 ==========
  const doLaunchAssessment = async (params: {
    year: number
    month: number
    deptIds: number[]
    deadline: string
  }): Promise<boolean> => {
    try {
      await launchAssessment(params)
      await fetchAssessmentList()
      return true
    } catch (error) {
      console.error('发起考核失败:', error)
      return false
    }
  }

  // ========== 待办事项 ==========
  const fetchTodos = async (): Promise<void> => {
    try {
      todoList.value = await getTodos()
    } catch (error) {
      console.error('获取待办事项失败:', error)
    }
  }

  return {
    // 状态
    assessmentList,
    currentAssessment,
    todoList,
    isLoading,
    // 方法
    fetchAssessmentList,
    fetchAssessmentDetail,
    selectItems,
    doSelfScore,
    doManagerScore,
    doRollback,
    doLaunchAssessment,
    fetchTodos,
  }
})
