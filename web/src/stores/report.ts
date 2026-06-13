/**
 * 报告状态管理
 * 负责个人、部门、公司绩效报告
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  PersonalReport,
  DepartmentReport,
  CompanyReport,
} from '@/types'
import {
  getPersonalReport,
  getDepartmentReport,
  getCompanyReport,
} from '@/api/report'

export const useReportStore = defineStore('report', () => {
  // ========== 状态定义 ==========
  const personalReport = ref<PersonalReport | null>(null)
  const departmentReport = ref<DepartmentReport | null>(null)
  const companyReport = ref<CompanyReport | null>(null)
  const isLoading = ref(false)

  // ========== 个人报告 ==========
  const fetchPersonalReport = async (params: {
    userId?: number
    year: number
    month: number
  }): Promise<void> => {
    isLoading.value = true
    try {
      personalReport.value = await getPersonalReport(params)
    } catch (error) {
      console.error('获取个人报告失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ========== 部门报告 ==========
  const fetchDepartmentReport = async (params: {
    deptId?: number
    year: number
    month: number
  }): Promise<void> => {
    isLoading.value = true
    try {
      departmentReport.value = await getDepartmentReport(params)
    } catch (error) {
      console.error('获取部门报告失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ========== 公司报告 ==========
  const fetchCompanyReport = async (params: {
    year: number
    month: number
  }): Promise<void> => {
    isLoading.value = true
    try {
      companyReport.value = await getCompanyReport(params)
    } catch (error) {
      console.error('获取公司报告失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    personalReport,
    departmentReport,
    companyReport,
    isLoading,
    // 方法
    fetchPersonalReport,
    fetchDepartmentReport,
    fetchCompanyReport,
  }
})
