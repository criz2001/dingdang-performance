<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">绩效库管理</h1>
        <p class="page-subtitle">管理考核指标库，支持新增、编辑、删除考核项</p>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增考核项
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-bar card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" placeholder="全部分类" clearable>
            <el-option label="销售指标" value="sales" />
            <el-option label="服务指标" value="service" />
            <el-option label="管理指标" value="management" />
            <el-option label="财务指标" value="financial" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索考核项名称"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="card mt-xl">
      <el-table
        v-loading="isLoading"
        :data="libraryList"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="考核项名称" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getCategoryTagType(row.category)">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maxScore" label="满分" width="80" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper mt-xl">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <p>确定要删除考核项「{{ currentItem?.name }}」吗？</p>
      <p class="text-secondary text-sm mt-sm">删除后无法恢复，请谨慎操作。</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * 绩效库管理页面
 * 展示考核项列表，支持筛选、新增、编辑、删除
 */

import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useLibraryStore } from '@/stores/library'
import { formatDate, getCategoryText } from '@/utils/formatters'
import type { LibraryItem } from '@/types'

// ========== 路由和状态 ==========
const router = useRouter()
const libraryStore = useLibraryStore()

const isLoading = ref(false)
const filterForm = reactive({
  category: '',
  status: undefined as number | undefined,
  keyword: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
})

// ========== 计算属性 ==========
const libraryList = computed(() => libraryStore.libraryList)
const total = computed(() => libraryStore.total)

// ========== 删除对话框 ==========
const deleteDialogVisible = ref(false)
const currentItem = ref<LibraryItem | null>(null)

// ========== 方法 ==========

/**
 * 获取分类标签类型
 */
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, any> = {
    sales: 'danger',
    service: 'success',
    management: 'warning',
    financial: '',
    custom: 'info',
  }
  return typeMap[category] || 'info'
}

/**
 * 加载数据
 */
const loadData = async () => {
  isLoading.value = true
  try {
    await libraryStore.fetchLibraryList({
      ...filterForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

/**
 * 重置筛选
 */
const handleReset = () => {
  filterForm.category = ''
  filterForm.status = undefined
  filterForm.keyword = ''
  pagination.page = 1
  loadData()
}

/**
 * 新增
 */
const handleAdd = () => {
  router.push('/library/edit/0')
}

/**
 * 查看
 */
const handleView = (row: LibraryItem) => {
  router.push(`/library/edit/${row.id}?mode=view`)
}

/**
 * 编辑
 */
const handleEdit = (row: LibraryItem) => {
  router.push(`/library/edit/${row.id}`)
}

/**
 * 删除
 */
const handleDelete = (row: LibraryItem) => {
  currentItem.value = row
  deleteDialogVisible.value = true
}

/**
 * 确认删除
 */
const confirmDelete = async () => {
  if (!currentItem.value) return
  try {
    await libraryStore.removeItem(currentItem.value.id)
    ElMessage.success('删除成功')
    deleteDialogVisible.value = false
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

/**
 * 状态切换
 */
const handleStatusChange = async (row: LibraryItem) => {
  try {
    await libraryStore.updateItem(row.id, { status: row.status })
    ElMessage.success(`${row.status === 1 ? '启用' : '停用'}成功`)
  } catch (error) {
    ElMessage.error('操作失败')
    // 回滚状态
    row.status = row.status === 1 ? 0 : 1
  }
}

onMounted(() => {
  loadData()
})

import { computed } from 'vue'
</script>

<style scoped>
.filter-bar {
  padding: var(--spacing-lg) var(--spacing-xl);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

.text-secondary {
  color: var(--color-text-secondary);
}

.text-sm {
  font-size: var(--font-size-sm);
}

.mt-sm {
  margin-top: var(--spacing-sm);
}

.mt-xl {
  margin-top: var(--spacing-xl);
}
</style>
