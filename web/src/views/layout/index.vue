<template>
  <div class="layout-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo 区域 -->
      <div class="sidebar__logo">
        <div class="logo-icon">
          <el-icon :size="28" color="#2563EB"><Bell /></el-icon>
        </div>
        <span v-if="!isCollapsed" class="logo-text">叮当绩效</span>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        class="sidebar__menu"
        @select="handleMenuSelect"
      >
        <template v-for="item in filteredMenuList" :key="item.path">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="item.children?.length" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子菜单 -->
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>

      <!-- 折叠按钮 -->
      <div class="sidebar__toggle" @click="toggleSidebar">
        <el-icon :size="18">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <div class="main-wrapper" :class="{ collapsed: isCollapsed }">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="header__left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute?.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header__right">
          <!-- 快捷入口 -->
          <el-dropdown trigger="click" @command="handleQuickAction">
            <span class="header__user">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="header__username">{{ userStore.userInfo?.name || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="changePwd">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 主布局组件
 * 包含侧边栏导航和顶部栏
 */

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Fold,
  Expand,
  UserFilled,
  User,
  Lock,
  SwitchButton,
  ArrowDown,
  HomeFilled,
  Collection,
  Clipboard,
  DataLine,
  Money,
  Setting,
  TrendCharts,
  Document,
  List,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types'

// ========== 路由和状态 ==========
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapsed = ref(false)

// ========== 菜单配置 ==========
interface MenuItem {
  path: string
  title: string
  icon: string
  roles?: UserRole[]
  children?: MenuItem[]
}

const menuList: MenuItem[] = [
  {
    path: '/dashboard',
    title: '工作台',
    icon: 'HomeFilled',
    roles: [UserRole.CHAIRMAN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  },
  {
    path: '/library',
    title: '绩效库管理',
    icon: 'Collection',
    roles: [UserRole.CHAIRMAN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  },
  {
    path: '/assessment',
    title: '考核管理',
    icon: 'Clipboard',
    roles: [UserRole.CHAIRMAN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
      { path: '/assessment/select/0', title: '月度选取' },
      { path: '/assessment/detail/0', title: '考核详情' },
      { path: '/assessment/score/0', title: '评分' },
    ],
  },
  {
    path: '/report',
    title: '绩效报告',
    icon: 'TrendCharts',
    roles: [UserRole.CHAIRMAN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
      { path: '/report/personal', title: '个人报告' },
      { path: '/report/department', title: '部门汇总' },
      { path: '/report/company', title: '公司汇总' },
    ],
  },
  {
    path: '/finance',
    title: '财务数据',
    icon: 'Money',
    roles: [UserRole.CHAIRMAN, UserRole.FINANCE],
  },
  {
    path: '/hr',
    title: 'HR管理',
    icon: 'Document',
    roles: [UserRole.CHAIRMAN, UserRole.HR],
    children: [
      { path: '/hr/launch', title: '考核下发' },
      { path: '/hr/flow-monitor', title: '流程监控' },
    ],
  },
  {
    path: '/system',
    title: '系统管理',
    icon: 'Setting',
    roles: [UserRole.CHAIRMAN, UserRole.HR],
    children: [
      { path: '/system/users', title: '用户管理' },
    ],
  },
]

// ========== 计算属性 ==========

/**
 * 根据用户角色过滤菜单
 */
const filteredMenuList = computed(() => {
  const userRole = userStore.userInfo?.role
  if (!userRole) return []

  return menuList.filter((menu) => {
    if (!menu.roles || menu.roles.length === 0) return true
    return menu.roles.includes(userRole as UserRole)
  })
})

/**
 * 当前激活的菜单项
 */
const activeMenu = computed(() => {
  const path = route.path
  // 匹配当前路由或父路由
  const matchMenu = (menus: MenuItem[]): string | null => {
    for (const menu of menus) {
      if (path.startsWith(menu.path) && menu.path !== '/') {
        return menu.path
      }
      if (menu.children) {
        const childMatch = matchMenu(menu.children)
        if (childMatch) return childMatch
      }
    }
    return null
  }
  return matchMenu(filteredMenuList.value) || path
})

/**
 * 当前路由对象
 */
const currentRoute = computed(() => route)

// ========== 方法 ==========

/**
 * 切换侧边栏折叠状态
 */
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

/**
 * 菜单选择处理
 */
const handleMenuSelect = (index: string) => {
  if (index && index !== '/assessment') {
    router.push(index)
  }
}

/**
 * 快捷操作处理
 */
const handleQuickAction = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中')
      break
    case 'changePwd':
      ElMessage.info('修改密码功能开发中')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        userStore.logout()
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped>
/* ========== 布局容器 ========== */
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ========== 侧边栏 ========== */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-bg-white);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

/* Logo 区域 */
.sidebar__logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-base);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
}

/* 菜单 */
.sidebar__menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 折叠按钮 */
.sidebar__toggle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.sidebar__toggle:hover {
  background: var(--color-bg-gray);
  color: var(--color-primary);
}

/* ========== 主内容区 ========== */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

.main-wrapper.collapsed {
  margin-left: 0;
}

/* ========== 顶部栏 ========== */
.header {
  height: var(--header-height);
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  flex-shrink: 0;
}

.header__left {
  display: flex;
  align-items: center;
}

.header__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.header__user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.header__user:hover {
  background: var(--color-bg-gray);
}

.header__username {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

/* ========== 内容区 ========== */
.content {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg);
}

/* ========== 过渡动画 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
