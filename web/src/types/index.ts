/**
 * 全局类型定义文件
 * 定义项目中使用的所有 TypeScript 接口和类型
 */

/** API 统一响应格式 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/** 分页请求参数 */
export interface PageParams {
  page: number
  pageSize: number
  keyword?: string
  [key: string]: any
}

/** 分页响应数据 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 用户角色枚举 */
export enum UserRole {
  CHAIRMAN = 'chairman',   // 董事长
  FINANCE = 'finance',     // 财务部负责人
  HR = 'hr',               // HR专员
  MANAGER = 'manager',     // 部门经理
  EMPLOYEE = 'employee',   // 普通员工
}

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  name: string
  role: UserRole
  deptId?: number
  deptName?: string
  phone?: string
  email?: string
  avatar?: string
  status: number
}

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应数据 */
export interface LoginResult {
  token: string
  user: UserInfo
}

/** 考核项状态 */
export enum LibraryStatus {
  ACTIVE = 1,    // 启用
  INACTIVE = 0,  // 停用
}

/** 考核项分类 */
export enum LibraryCategory {
  SALES = 'sales',           // 销售指标
  SERVICE = 'service',       // 服务指标
  MANAGEMENT = 'management', // 管理指标
  FINANCIAL = 'financial',   // 财务指标
  CUSTOM = 'custom',         // 自定义
}

/** 绩效库考核项 */
export interface LibraryItem {
  id: number
  name: string
  description: string
  category: LibraryCategory | string
  maxScore: number
  unit: string
  status: LibraryStatus
  createdAt: string
  updatedAt: string
}

/** 考核流程节点 */
export enum AssessmentNode {
  N1_LAUNCH = 'N1',    // HR发起考核
  N2_DEPT_SELECT = 'N2', // 部门选取考核项
  N3_RESULT_INPUT = 'N3', // 结果值录入
  N4_SELF_EVAL = 'N4',   // 员工自评
  N5_MANAGER_SCORE = 'N5', // 部门经理评分
  N6_HR_REVIEW = 'N6',    // HR复核
  N7_MANAGER_APPROVE = 'N7', // 部门经理确认
  N8_HR_PUBLISH = 'N8',    // HR发布
  N9_COMPLETE = 'N9',    // 考核完成
}

/** 考核状态 */
export enum AssessmentStatus {
  PENDING = 0,        // 待开始
  IN_PROGRESS = 1,   // 进行中
  COMPLETED = 2,     // 已完成
  CANCELLED = 3,     // 已取消
}

/** 月度考核实例 */
export interface Assessment {
  id: number
  title: string
  year: number
  month: number
  deptId: number
  deptName: string
  status: AssessmentStatus
  currentNode: AssessmentNode
  launchBy: number
  launchAt: string
  deadline: string
  createdAt: string
  updatedAt: string
}

/** 考核项选取项 */
export interface AssessmentItem {
  id: number
  assessmentId: number
  libraryId: number
  libraryName: string
  weight: number   // 权重百分比（0-100）
  target: number   // 目标值
  actual?: number  // 实际值
  selfScore?: number   // 自评分数
  managerScore?: number // 经理评分
  finalScore?: number  // 最终得分
}

/** 考核详情（包含选取项列表） */
export interface AssessmentDetail extends Assessment {
  items: AssessmentItem[]
}

/** 考核选取请求 */
export interface AssessmentSelectParams {
  assessmentId: number
  items: {
    libraryId: number
    weight: number
    target: number
  }[]
}

/** 财务数据 */
export interface FinanceData {
  id: number
  year: number
  month: number
  deptId: number
  deptName: string
  salesAmount: number    // 销售额
  profitAmount: number   // 利润额
  costAmount: number     // 成本
  note?: string
  createdAt: string
  updatedAt: string
}

/** 流程日志 */
export interface FlowLog {
  id: number
  assessmentId: number
  fromNode: AssessmentNode
  toNode: AssessmentNode
  operatorId: number
  operatorName: string
  reason?: string
  createdAt: string
}

/** 绩效报告 - 个人 */
export interface PersonalReport {
  userId: number
  userName: string
  deptName: string
  year: number
  month: number
  totalScore: number
  grade: string
  rank?: number
  trend: {
    month: string
    score: number
  }[]
  details: {
    itemName: string
    weight: number
    score: number
  }[]
}

/** 绩效报告 - 部门 */
export interface DepartmentReport {
  deptId: number
  deptName: string
  year: number
  month: number
  avgScore: number
  employeeCount: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
  }
  members: {
    userId: number
    userName: string
    totalScore: number
    grade: string
  }[]
}

/** 绩效报告 - 公司 */
export interface CompanyReport {
  year: number
  month: number
  totalEmployees: number
  avgScore: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
    E: number
  }
  deptComparison: {
    deptName: string
    avgScore: number
    employeeCount: number
  }[]
}

/** 菜单项定义 */
export interface MenuItem {
  path: string
  name: string
  icon?: string
  children?: MenuItem[]
  meta?: {
    title: string
    roles?: UserRole[]
    hidden?: boolean
  }
}

/** 待办事项 */
export interface TodoItem {
  id: number
  type: 'select' | 'score' | 'result' | 'self_eval' | 'review'
  assessmentId: number
  assessmentTitle: string
  deadline: string
  description: string
}

/** 路由元信息 */
export interface RouteMeta {
  title: string
  roles?: UserRole[]
  requiresAuth?: boolean
}
