<template>
  <div class="assessment-select">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">月度考核选取</h2>
      <p class="page-desc">从绩效库中选择本月的考核项，并调整权重（权重总和必须为100%）</p>
    </div>

    <!-- 月份选择 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="考核月份">
          <el-date-picker
            v-model="filterForm.month"
            type="month"
            placeholder="选择月份"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            @change="handleMonthChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadLibraryItems">
            <el-icon><Refresh /></el-icon>
            刷新绩效库
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 绩效库选择区 -->
    <el-row :gutter="20" class="mt-20">
      <!-- 左侧：绩效库列表 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>绩效库列表</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索考核项"
                prefix-icon="Search"
                clearable
                style="width: 200px"
              />
            </div>
          </template>

          <el-table
            :data="filteredLibraryItems"
            style="width: 100%"
            max-height="500"
            @row-click="handleSelectItem"
          >
            <el-table-column prop="name" label="考核项名称" min-width="150" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click.stop="handleSelectItem(row)">
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：已选考核项 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>已选考核项 ({{ selectedItems.length }})</span>
              <el-tag :type="weightValid ? 'success' : 'danger'">
                权重总计: {{ totalWeight }}%
              </el-tag>
            </div>
          </template>

          <el-table :data="selectedItems" style="width: 100%" max-height="500">
            <el-table-column prop="name" label="考核项名称" min-width="150" />
            <el-table-column label="权重%" width="120">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.weight"
                  :min="0"
                  :max="100"
                  :step="5"
                  size="small"
                  @change="validateWeight"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="handleRemoveItem($index)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 权重验证提示 -->
          <div v-if="!weightValid" class="weight-warning">
            <el-alert
              :title="`权重总和为 ${totalWeight}%，必须等于 100%`"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button @click="handleReset">重置</el-button>
            <el-button
              type="primary"
              :disabled="!weightValid || selectedItems.length === 0"
              @click="handleSubmit"
            >
              确认提交
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 月度考核选取页面
 * 从绩效库选取本月考核项，调整权重（权重总和必须=100%）
 * 显示已选考核项列表，支持添加/移除
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { libraryApi } from '@/api/library'
import { assessmentApi } from '@/api/assessment'
import type { LibraryItem } from '@/types'

// ========== 状态定义 ==========
const route = useRoute()

const filterForm = reactive({
  month: '',
})

const searchKeyword = ref('')
const selectedItems = ref<(LibraryItem & { weight: number })[]>([])
const isLoading = ref(false)

// ========== 绩效库列表 ==========
const libraryItems = ref<LibraryItem[]>([])

// ========== 计算属性 ==========

/**
 * 过滤后的绩效库列表
 */
const filteredLibraryItems = computed(() => {
  if (!searchKeyword.value) return libraryItems.value
  return libraryItems.value.filter(item =>
    item.name.includes(searchKeyword.value) ||
    item.category.includes(searchKeyword.value)
  )
})

/**
 * 权重总计
 */
const totalWeight = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + (item.weight || 0), 0)
})

/**
 * 权重是否合法（总和=100%）
 */
const weightValid = computed(() => {
  return totalWeight.value === 100
})

// ========== 方法 ==========

/**
 * 月份变更处理
 */
const handleMonthChange = () => {
  // 根据月份加载已保存的考核项配置
  loadSelectedItems()
}

/**
 * 加载绩效库数据
 */
const loadLibraryItems = async () => {
  isLoading.value = true
  try {
    const res = await libraryApi.getList({ page: 1, pageSize: 100 })
    libraryItems.value = res.data?.list || res.data || []
    ElMessage.success('绩效库数据已刷新')
  } catch (error) {
    console.error('加载绩效库失败:', error)
    ElMessage.error('加载绩效库失败')
  } finally {
    isLoading.value = false
  }
}

/**
 * 加载已选的考核项
 */
const loadSelectedItems = async () => {
  if (!filterForm.month) return
  try {
    const res = await assessmentApi.getSelections(filterForm.month)
    if (res?.data?.items) {
      selectedItems.value = res.data.items.map((item: any) => ({
        ...item,
        weight: item.weight || 10,
      }))
    }
  } catch (error) {
    console.error('加载已选考核项失败:', error)
  }
}

/**
 * 选择考核项
 */
const handleSelectItem = (row: LibraryItem) => {
  // 检查是否已选择
  const exists = selectedItems.value.some(item => item.id === row.id)
  if (exists) {
    ElMessage.warning('该考核项已选择')
    return
  }

  // 计算默认权重
  const remainingWeight = 100 - totalWeight.value
  const defaultWeight = Math.min(remainingWeight, 10)

  selectedItems.value.push({
    ...row,
    weight: defaultWeight,
  })

  ElMessage.success(`已添加考核项: ${row.name}`)
}

/**
 * 移除考核项
 */
const handleRemoveItem = ($index: number) => {
  const removed = selectedItems.value.splice($index, 1)
  if (removed.length > 0) {
    ElMessage.info(`已移除考核项: ${removed[0].name}`)
  }
}

/**
 * 验证权重
 */
const validateWeight = () => {
  if (totalWeight.value > 100) {
    ElMessage.warning('权重总和不能超过100%')
  }
}

/**
 * 重置
 */
const handleReset = () => {
  selectedItems.value = []
  ElMessage.info('已重置')
}

/**
 * 提交
 */
const handleSubmit = async () => {
  if (!weightValid.value) {
    ElMessage.error('权重总和必须为100%')
    return
  }

  if (!filterForm.month) {
    ElMessage.error('请选择考核月份')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认提交 ${filterForm.month} 的考核项配置？`,
      '提交确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    await assessmentApi.saveSelections(filterForm.month, selectedItems.value)
    ElMessage.success('考核项配置已提交')
  } catch (error) {
    if ((error as any)?.message !== 'cancel') {
      console.error('提交失败:', error)
      ElMessage.error('提交失败')
    }
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  // 默认选择当前月份
  const now = new Date()
  filterForm.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // 加载绩效库数据
  await loadLibraryItems()
})
</script>

<style scoped>
/* ========== 页面布局 ========== */
.assessment-select {
  padding: var(--spacing-xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.page-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

/* ========== 卡片样式 ========== */
.filter-card {
  margin-bottom: var(--spacing-base);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ========== 表格样式 ========== */
.mt-20 {
  margin-top: 20px;
}

/* ========== 权重提示 ========== */
.weight-warning {
  margin-top: var(--spacing-base);
}

/* ========== 操作按钮 ========== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
}
</style>
