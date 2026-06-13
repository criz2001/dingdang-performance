/**
 * 格式化工具函数
 * 包含日期、数字、文本等常用格式化方法
 */

import dayjs from 'dayjs'

/**
 * 日期格式化
 * @param date 日期字符串/Date/时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD'
 */
export function formatDate(
  date: string | Date | number | null | undefined,
  format: string = 'YYYY-MM-DD'
): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 日期时间格式化
 * @param date 日期字符串/Date/时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm'
 */
export function formatDateTime(
  date: string | Date | number | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm'
): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 相对时间格式化
 * @param date 日期字符串/Date/时间戳
 */
export function formatRelativeTime(
  date: string | Date | number | null | undefined
): string {
  if (!date) return '-'
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')
  const diffHours = now.diff(target, 'hour')
  const diffDays = now.diff(target, 'day')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return target.format('MM-DD')
}

/**
 * 数字格式化（添加千分位）
 * @param num 数字
 * @param decimals 小数位数，默认0
 */
export function formatNumber(
  num: number | string | null | undefined,
  decimals: number = 0
): string {
  if (num === null || num === undefined || isNaN(Number(num))) return '-'
  const n = Number(num)
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 货币格式化
 * @param amount 金额
 * @param unit 单位，默认 '元'
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  unit: string = '元'
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '-'
  return `${formatNumber(amount)}${unit}`
}

/**
 * 百分比格式化
 * @param value 数值（0-100）
 * @param decimals 小数位数
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '-'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * 权重格式化
 * @param weight 权重值（0-100）
 */
export function formatWeight(weight: number | null | undefined): string {
  return formatPercent(weight, 0)
}

/**
 * 分数格式化
 * @param score 分数
 * @param maxScore 满分
 */
export function formatScore(
  score: number | null | undefined,
  maxScore: number = 100
): string {
  if (score === null || score === undefined) return '-'
  return `${score} / ${maxScore}`
}

/**
 * 状态文本映射
 */
export const statusMap: Record<string | number, string> = {
  0: '停用',
  1: '启用',
  0: '待开始',
  1: '进行中',
  2: '已完成',
  3: '已取消',
}

/**
 * 获取状态文本
 * @param status 状态值
 */
export function getStatusText(status: string | number): string {
  return statusMap[status] || String(status)
}

/**
 * 分类文本映射
 */
export const categoryMap: Record<string, string> = {
  sales: '销售指标',
  service: '服务指标',
  management: '管理指标',
  financial: '财务指标',
  custom: '自定义',
}

/**
 * 获取分类文本
 * @param category 分类值
 */
export function getCategoryText(category: string): string {
  return categoryMap[category] || category
}

/**
 * 角色文本映射
 */
export const roleMap: Record<string, string> = {
  chairman: '董事长',
  finance: '财务部负责人',
  hr: 'HR专员',
  manager: '部门经理',
  employee: '普通员工',
}

/**
 * 获取角色文本
 * @param role 角色值
 */
export function getRoleText(role: string): string {
  return roleMap[role] || role
}

/**
 * 流程节点文本映射
 */
export const nodeMap: Record<string, string> = {
  N1: '发起考核',
  N2: '部门选取',
  N3: '结果录入',
  N4: '员工自评',
  N5: '经理评分',
  N6: 'HR复核',
  N7: '经理确认',
  N8: 'HR发布',
  N9: '考核完成',
}

/**
 * 获取流程节点文本
 * @param node 节点值
 */
export function getNodeText(node: string): string {
  return nodeMap[node] || node
}

/**
 * 绩效等级文本
 */
export const gradeMap: Record<string, string> = {
  S: 'S级 (卓越)',
  A: 'A级 (优秀)',
  B: 'B级 (良好)',
  C: 'C级 (合格)',
  D: 'D级 (待改进)',
  E: 'E级 (不合格)',
}

/**
 * 获取等级文本
 * @param grade 等级值
 */
export function getGradeText(grade: string): string {
  return gradeMap[grade] || grade
}

/**
 * 根据分数计算等级
 * @param score 分数
 */
export function getGradeByScore(score: number): string {
  if (score >= 95) return 'S'
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'E'
}

/**
 * 文本截断
 * @param text 文本
 * @param maxLength 最大长度
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
