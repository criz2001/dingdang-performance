<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">工作台</h1>
      <p class="page-subtitle">欢迎回来，{{ userStore.userInfo?.name }}！</p>
    </div>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="mb-xl">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.title">
        <div class="stat-card" :style="{ '--stat-color': stat.color }">
          <div class="stat-card__icon">
            <el-icon :size="28"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stat.value }}</div>
            <div class="stat-card__title">{{ stat.title }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 待办事项 -->
      <el-col :xs="24" :lg="16">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">待办事项</h3>
            <el-tag v-if="todoList.length" type="danger" size="small">
              {{ todoList.length }} 项待处理
            </el-tag>
          </div>

          <div v-if="todoListLoading" class="loading-wrapper">
            <el-skeleton :rows="3" animated />
          </div>

          <el-empty v-else-if="!todoList.length" description="暂无待办事项" />

          <div v-else class="todo-list">
            <div
              v-for="todo in todoList"
              :key="todo.id"
              class="todo-item"
              @click="handleTodoClick(todo)"
            >
              <div class="todo-item__icon" :class="`todo-item__icon--${todo.type}`">
                <el-icon><component :is="getTodoIcon(todo.type)" /></el-icon>
              </div>
              <div class="todo-item__content">
                <div class="todo-item__title">{{ todo.description }}</div>
                <div class="todo-item__meta">
                  <span>{{ todo.assessmentTitle }}</span>
                  <span class="todo-item__deadline">
                    截止: {{ formatDate(todo.deadline, 'MM-DD') }}
                  </span>
                </div>
              </div>
              <el-button type="primary" size="small" link>处理</el-button>
            </div>
          </div>
        </div>

        <!-- 最近考核 -->
        <div class="card mt-xl">
          <div class="card-header">
            <h3 class="card-title">最近考核</h3>
            <el-button type="primary" size="small" link @click="goToLibrary">
              查看全部
            </el-button>
          </div>

          <el-table :data="recentAssessments" stripe style="width: 100%">
            <el-table-column prop="title" label="考核名称" min-width="180" />
            <el-table-column prop="deptName" label="部门" width="120" />
            <el-table-column prop="currentNode" label="当前节点" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getNodeTagType(row.currentNode)">
                  {{ getNodeText(row.currentNode) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusTagType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="goToDetail(row.id)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- 快捷入口 & 流程进度 -->
      <el-col :xs="24" :lg="8">
        <!-- 快捷入口 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">快捷入口</h3>
          </div>

          <div class="quick-links">
            <div
              v-for="link in quickLinks"
              :key="link.path"
              class="quick-link"
              @click="router.push(link.path)"
            >
              <div class="quick-link__icon" :style="{ background: link.bgColor }">
                <el-icon :size="24" :color="link.color">
                  <component :is="link.icon" />
                </el-icon>
              </div>
              <div class="quick-link__label">{{ link.label }}</div>
            </div>
          </div>
        </div>

        <!-- 考核流程说明 -->
        <div class="card mt-xl">
          <div class="card-header">
            <h3 class="card-title">考核流程</h3>
          </div>

          <el-steps direction="vertical" :space="40" :active="currentNodeIndex">
            <el-step
              v-for="(node, index) in flowNodes"
              :key="node.key"
              :title="node.label"
              :description="node.desc"
              :status="index < currentNodeIndex ? 'success' : index === currentNodeIndex ? 'process' : 'wait'"
            />
          </el-steps>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 工作台首页
 * 展示待办事项、概览统计、快捷入口、最近考核
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Bell,
  TrendCharts,
  Document,
  Collection,
  Money,
  User,
  Setting,
  Clock,
  Check,
  EditPen,
  DataLine,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAssessmentStore } from '@/stores/assessment'
import { formatDate, getStatusText, getNodeText } from '@/utils/formatters'
import { UserRole } from '@/types'
import type { TodoItem } from '@/types'

// ========== 路由和状态 ==========
const router = useRouter()
const userStore = useUserStore()
const assessmentStore = useAssessmentStore()

const todoListLoading = ref(true)
const todoList = ref<TodoItem[]>([])
const recentAssessments = ref<any[]>([])

// ========== 统计数据 ==========
const stats = computed(() => [
  {
    title: '待办事项',
    value: todoList.value.length,
    icon: Clock,
    color: '#2563EB',
  },
  {
    title: '进行中考核',
    value: recentAssessments.value.filter((a) => a.status === 1).length,
    icon: Document,
    color: '#059669',
  },
  {
    title: '本月已完成',
    value: recentAssessments.value.filter((a) => a.status === 2).length,
    icon: Check,
    color: '#D97706',
  },
  {
    title: '考核库总数',
    value: 12,
    icon: Collection,
    color: '#7C3AED',
  },
])

// ========== 流程节点 ==========
const flowNodes = [
  { key: 'N1', label: '发起考核', desc: 'HR专员发起月度考核' },
  { key: 'N2', label: '部门选取', desc: '部门经理选取考核项' },
  { key: 'N3', label: '结果录入', desc: '录入指标实际值' },
  { key: 'N4', label: '员工自评', desc: '员工进行自我评价' },
  { key: 'N5', label: '经理评分', desc: '部门经理进行评分' },
  { key: 'N6', label: 'HR复核', desc: 'HR进行复核确认' },
  { key: 'N7', label: '经理确认', desc: '部门经理最终确认' },
  { key: 'N8', label: 'HR发布', desc: 'HR发布考核结果' },
  { key: 'N9', label: '考核完成', desc: '绩效评估结束' },
]

// ========== 快捷入口 ==========
const quickLinks = computed(() => {
  const role = userStore.userInfo?.role
  const links = []

  if ([UserRole.CHAIRMAN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE].includes(role as UserRole)) {
    links.push(
      { label: '绩效库', path: '/library', icon: Collection, bgColor: '#EFF6FF', color: '#2563EB' },
      { label: '月度选取', path: '/assessment/select/0', icon: EditPen, bgColor: '#F0FDF4', color: '#059669' }
    )
  }

  if ([UserRole.CHAIRMAN, UserRole.HR, UserRole.FINANCE].includes(role as UserRole)) {
    links.push(
      { label: '考核下发', path: '/hr/launch', icon: Document, bgColor: '#FEF3C7', color: '#D97706' },
      { label: '流程监控', path: '/hr/flow-monitor', icon: Clock, bgColor: '#FCE7F3', color: '#DB2777' }
    )
  }

  links.push(
    { label: '个人报告', path: '/report/personal', icon: TrendCharts, bgColor: '#E0E7FF', color: '#4F46E5' },
    { label: '财务数据', path: '/finance', icon: Money, bgColor: '#ECFDF5', color: '#059669' }
  )

  return links
})

// ========== 计算属性 ==========
const currentNodeIndex = computed(() => {
  // 默认显示第一个节点
  return 0
})

// ========== 方法 ==========

/**
 * 获取待办图标
 */
const getTodoIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    select: 'EditPen',
    score: 'EditPen',
    result: 'DataLine',
    self_eval: 'User',
    review: 'Check',
  }
  return iconMap[type] || 'Clock'
}

/**
 * 获取节点标签类型
 */
const getNodeTagType = (node: string) => {
  const typeMap: Record<string, any> = {
    N1: 'info',
    N2: '',
    N3: 'warning',
    N4: 'warning',
    N5: 'warning',
    N6: 'warning',
    N7: 'warning',
    N8: 'success',
    N9: 'success',
  }
  return typeMap[node] || 'info'
}

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: number) => {
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return typeMap[status] || 'info'
}

/**
 * 处理待办点击
 */
const handleTodoClick = (todo: TodoItem) => {
  const pathMap: Record<string, string> = {
    select: `/assessment/select/${todo.assessmentId}`,
    score: `/assessment/score/${todo.assessmentId}`,
    result: `/assessment/result-input/${todo.assessmentId}`,
    self_eval: `/assessment/score/${todo.assessmentId}`,
    review: `/assessment/detail/${todo.assessmentId}`,
  }
  router.push(pathMap[todo.type] || `/assessment/detail/${todo.assessmentId}`)
}

/**
 * 跳转到绩效库
 */
const goToLibrary = () => {
  router.push('/library')
}

/**
 * 跳转到考核详情
 */
const goToDetail = (id: number) => {
  router.push(`/assessment/detail/${id}`)
}

/**
 * 加载数据
 */
const loadData = async () => {
  todoListLoading.value = true
  try {
    // 获取待办事项
    await assessmentStore.fetchTodos()
    todoList.value = assessmentStore.todoList

    // 获取最近考核
    await assessmentStore.fetchAssessmentList({ pageSize: 5 })
    recentAssessments.value = assessmentStore.assessmentList
  } catch (error) {
    console.error('加载工作台数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    todoListLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ========== 卡片头部 ========== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

/* ========== 统计卡片 ========== */
.stat-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  margin-bottom: 20px;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--stat-color) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--stat-color);
}

.stat-card__value {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-card__title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* ========== 待办列表 ========== */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.todo-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.todo-item:hover {
  background: var(--color-bg-gray);
}

.todo-item__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-bg-white);
}

.todo-item__icon--select { background: var(--color-primary); }
.todo-item__icon--score { background: var(--color-success); }
.todo-item__icon--result { background: var(--color-warning); }
.todo-item__icon--self_eval { background: #7C3AED; }
.todo-item__icon--review { background: #DB2777; }

.todo-item__content {
  flex: 1;
}

.todo-item__title {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.todo-item__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.todo-item__deadline {
  color: var(--color-danger);
}

/* ========== 快捷入口 ========== */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-link:hover {
  background: var(--color-bg-gray);
}

.quick-link__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-link__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* ========== 加载状态 ========== */
.loading-wrapper {
  padding: var(--spacing-md);
}
</style>
