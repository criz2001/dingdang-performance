/**
 * 路由配置
 * 定义所有页面路由和权限控制
 */

import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/types'

/**
 * 静态路由（无需权限）
 */
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' },
  },
]

/**
 * 动态路由（根据角色显示）
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      // ========== 工作台 ==========
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '工作台',
          roles: [
            UserRole.CHAIRMAN,
            UserRole.FINANCE,
            UserRole.HR,
            UserRole.MANAGER,
            UserRole.EMPLOYEE,
          ],
        },
      },

      // ========== 绩效库管理 ==========
      {
        path: 'library',
        name: 'Library',
        component: () => import('@/views/library/index.vue'),
        meta: {
          title: '绩效库管理',
          roles: [UserRole.CHAIRMAN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
        },
      },
      {
        path: 'library/edit/:id?',
        name: 'LibraryEdit',
        component: () => import('@/views/library/edit.vue'),
        meta: {
          title: '编辑考核项',
          roles: [UserRole.CHAIRMAN, UserRole.HR, UserRole.MANAGER],
        },
      },

      // ========== 考核管理 ==========
      {
        path: 'assessment/select/:id',
        name: 'AssessmentSelect',
        component: () => import('@/views/assessment/select.vue'),
        meta: {
          title: '月度选取',
          roles: [UserRole.CHAIRMAN, UserRole.HR, UserRole.MANAGER],
        },
      },
      {
        path: 'assessment/detail/:id',
        name: 'AssessmentDetail',
        component: () => import('@/views/assessment/detail.vue'),
        meta: {
          title: '考核详情',
          roles: [
            UserRole.CHAIRMAN,
            UserRole.FINANCE,
            UserRole.HR,
            UserRole.MANAGER,
            UserRole.EMPLOYEE,
          ],
        },
      },
      {
        path: 'assessment/result-input/:id',
        name: 'ResultInput',
        component: () => import('@/views/assessment/result-input.vue'),
        meta: {
          title: '结果值录入',
          roles: [UserRole.CHAIRMAN, UserRole.MANAGER],
        },
      },
      {
        path: 'assessment/score/:id',
        name: 'AssessmentScore',
        component: () => import('@/views/assessment/score.vue'),
        meta: {
          title: '评分',
          roles: [UserRole.CHAIRMAN, UserRole.MANAGER, UserRole.EMPLOYEE],
        },
      },
      {
        path: 'assessment/rollback/:id',
        name: 'AssessmentRollback',
        component: () => import('@/views/assessment/rollback.vue'),
        meta: {
          title: '流程回退',
          roles: [UserRole.CHAIRMAN, UserRole.HR],
        },
      },

      // ========== 报告 ==========
      {
        path: 'report/personal',
        name: 'PersonalReport',
        component: () => import('@/views/report/personal.vue'),
        meta: {
          title: '个人报告',
          roles: [UserRole.CHAIRMAN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
        },
      },
      {
        path: 'report/department',
        name: 'DepartmentReport',
        component: () => import('@/views/report/department.vue'),
        meta: {
          title: '部门汇总',
          roles: [UserRole.CHAIRMAN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER],
        },
      },
      {
        path: 'report/company',
        name: 'CompanyReport',
        component: () => import('@/views/report/company.vue'),
        meta: {
          title: '公司汇总',
          roles: [UserRole.CHAIRMAN, UserRole.HR],
        },
      },

      // ========== 财务数据 ==========
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/views/finance/index.vue'),
        meta: {
          title: '财务数据',
          roles: [UserRole.CHAIRMAN, UserRole.FINANCE],
        },
      },

      // ========== HR管理 ==========
      {
        path: 'hr/launch',
        name: 'HrLaunch',
        component: () => import('@/views/hr/launch.vue'),
        meta: {
          title: '考核下发',
          roles: [UserRole.CHAIRMAN, UserRole.HR],
        },
      },
      {
        path: 'hr/flow-monitor',
        name: 'FlowMonitor',
        component: () => import('@/views/hr/flow-monitor.vue'),
        meta: {
          title: '流程监控',
          roles: [UserRole.CHAIRMAN, UserRole.HR],
        },
      },

      // ========== 系统管理 ==========
      {
        path: 'system/users',
        name: 'UserManagement',
        component: () => import('@/views/system/users.vue'),
        meta: {
          title: '用户管理',
          roles: [UserRole.CHAIRMAN, UserRole.HR],
        },
      },
    ],
  },

  // ========== 捕获所有未匹配路由 ==========
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

/**
 * 获取有权限访问的路由
 * @param userRole 用户角色
 */
export function filterRoutesByRole(userRole: string): RouteRecordRaw[] {
  const filterRoute = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
    return routes
      .filter((route) => {
        // 无角色限制的路由直接通过
        if (!route.meta?.roles || route.meta.roles.length === 0) {
          return true
        }
        // 检查用户角色是否有权限
        return route.meta.roles.includes(userRole as UserRole)
      })
      .map((route) => {
        // 递归处理子路由
        if (route.children) {
          return {
            ...route,
            children: filterRoute(route.children),
          }
        }
        return route
      })
  }

  return filterRoute(asyncRoutes)
}
