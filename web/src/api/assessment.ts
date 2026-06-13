/**
 * 考核管理 API
 * 考核实例的发起、流程操作、评分等
 */

import { get, post, put } from '@/utils/axios'
import type {
  Assessment,
  AssessmentDetail,
  AssessmentSelectParams,
  AssessmentItem,
  TodoItem,
  PageResult,
} from '@/types'

/**
 * 获取考核列表
 */
export function getAssessments(params?: {
  status?: number
  year?: number
  month?: number
  page?: number
  pageSize?: number
}): Promise<{ list: Assessment[]; total: number } | Assessment[]> {
  return get<{ list: Assessment[]; total: number } | Assessment[]>('/assessments', params)
}

/**
 * 获取考核详情
 */
export function getAssessmentDetail(id: number): Promise<AssessmentDetail> {
  return get<AssessmentDetail>(`/assessments/${id}`)
}

/**
 * 发起月度考核（HR操作）
 */
export function launchAssessment(data: {
  year: number
  month: number
  deptIds: number[]
  deadline: string
}): Promise<Assessment> {
  return post<Assessment>('/assessments/launch', data)
}

/**
 * 选取考核项（部门经理操作）
 */
export function selectAssessmentItems(params: AssessmentSelectParams): Promise<void> {
  return post<void>('/assessments/select-items', params)
}

/**
 * 录入结果值（部门经理操作）
 */
export function inputResultValues(
  assessmentId: number,
  items: { itemId: number; actual: number }[]
): Promise<void> {
  return post<void>(`/assessments/${assessmentId}/input-results`, { items })
}

/**
 * 提交自评（员工操作）
 */
export function submitSelfScore(
  assessmentId: number,
  items: { itemId: number; score: number }[]
): Promise<void> {
  return post<void>(`/assessments/${assessmentId}/self-score`, { items })
}

/**
 * 提交经理评分
 */
export function submitManagerScore(
  assessmentId: number,
  items: { itemId: number; score: number }[]
): Promise<void> {
  return post<void>(`/assessments/${assessmentId}/manager-score`, { items })
}

/**
 * HR复核
 */
export function hrReview(assessmentId: number, approved: boolean, comment?: string): Promise<void> {
  return post<void>(`/assessments/${assessmentId}/hr-review`, { approved, comment })
}

/**
 * HR发布
 */
export function publishAssessment(assessmentId: number): Promise<void> {
  return post<void>(`/assessments/${assessmentId}/publish`)
}

/**
 * 回退流程
 */
export function rollbackAssessment(
  assessmentId: number,
  toNode: string,
  reason: string
): Promise<void> {
  return post<void>(`/assessments/${assessmentId}/rollback`, { toNode, reason })
}

/**
 * 获取待办事项
 */
export function getTodos(): Promise<TodoItem[]> {
  return get<TodoItem[]>('/assessments/todos')
}

/**
 * 获取流程日志
 */
export function getFlowLogs(assessmentId: number): Promise<any[]> {
  return get<any[]>(`/assessments/${assessmentId}/flow-logs`)
}

export const assessmentApi = {
  getAssessments,
  getAssessmentDetail,
  launchAssessment,
  selectAssessmentItems,
  inputResultValues,
  submitSelfScore,
  submitManagerScore,
  hrReview,
  publishAssessment,
  rollbackAssessment,
  getTodos,
  getFlowLogs,

  // 视图文件使用的别名方法
  getDetail: getAssessmentDetail,
  getItems: (assessmentId: number) => get<any[]>(`/assessments/${assessmentId}/items`),
  submitResults: (assessmentId: number, data: any[]) => post<void>(`/assessments/${assessmentId}/input-results`, { items: data }),
  submitScores: (assessmentId: number, data: any[]) => post<void>(`/assessments/${assessmentId}/manager-score`, { items: data }),
  rollback: (assessmentId: number, data: { targetNode: string; reason: string }) => post<void>(`/assessments/${assessmentId}/rollback`, { toNode: data.targetNode, reason: data.reason }),

  // 月度选取页面使用的方法
  getSelections: (month: string) => get<any>(`/assessments/selections/${month}`),
  saveSelections: (month: string, items: any[]) => post<void>('/assessments/selections', { month, items }),
}
