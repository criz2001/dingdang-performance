<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { financeApi } from '@/api/finance'

const loading = ref(true)
const financeData = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const filterMonth = ref('')

// 新增财务数据弹窗
const dialogVisible = ref(false)
const addForm = reactive({ month: '', metricName: '', metricValue: 0, description: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await financeApi.getList({ page: pagination.page, pageSize: pagination.pageSize, month: filterMonth.value })
    financeData.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('加载财务数据失败') }
  finally { loading.value = false }
}

function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

function openAddDialog() {
  dialogVisible.value = true
  addForm.month = ''
  addForm.metricName = ''
  addForm.metricValue = 0
  addForm.description = ''
}

async function handleAdd() {
  try {
    await financeApi.create(addForm)
    ElMessage.success('财务数据已添加')
    dialogVisible.value = false
    loadData()
  } catch { ElMessage.error('添加失败') }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确认删除该财务数据？', '删除确认', { type: 'warning' })
    await financeApi.delete(id)
    ElMessage.success('已删除')
    loadData()
  } catch { /* 取消 */ }
}

onMounted(() => { loadData() })
</script>

<template>
  <div class="finance-page" v-loading="loading">
    <div class="page-header">
      <h2>财务数据管理</h2>
    </div>

    <el-card shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>销售额数据</span>
          <div>
            <el-date-picker v-model="filterMonth" type="month" placeholder="筛选月份" value-format="YYYY-MM" clearable @change="loadData" style="width:150px;margin-right:8px" />
            <el-button type="primary" @click="openAddDialog">新增数据</el-button>
          </div>
        </div>
      </template>

      <el-table :data="financeData" stripe>
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="metricName" label="指标名称" min-width="150" />
        <el-table-column prop="metricValue" label="指标值" width="120" />
        <el-table-column prop="description" label="说明" min-width="200" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增财务数据" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="月份"><el-input v-model="addForm.month" placeholder="如 2024-06" /></el-form-item>
        <el-form-item label="指标名称"><el-input v-model="addForm.metricName" placeholder="如 月度收入(万元)" /></el-form-item>
        <el-form-item label="指标值"><el-input-number v-model="addForm.metricValue" :precision="2" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="addForm.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.finance-page { padding: 20px; }
.page-header { margin-bottom: 16px; }
</style>