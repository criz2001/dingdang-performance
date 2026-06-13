<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { hrApi } from '@/api/hr'

const loading = ref(true)
const flowList = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const filterNode = ref('')
const filterMonth = ref('')

// 流程节点映射
const nodeNames: Record<string, string> = {
  N1: '选取', N2: '确认', N3: '下发', N4: '自评', N5: '经理评分', N6: '结果确认', N7: '汇总审核', N8: '董事长审批', N9: '归档',
}

async function loadList() {
  loading.value = true
  try {
    const res = await hrApi.getFlowMonitor({ page: pagination.page, pageSize: pagination.pageSize, node: filterNode.value, month: filterMonth.value })
    flowList.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('加载流程数据失败') }
  finally { loading.value = false }
}

function getNodeProgress(status: string): number {
  const num = parseInt(status.replace('N', ''))
  return Math.round((num / 9) * 100)
}

const nodeOptions = Object.entries(nodeNames).map(([k, v]) => ({ label: `${k}-${v}`, value: k }))

onMounted(() => { loadList() })
</script>

<template>
  <div class="flow-monitor" v-loading="loading">
    <div class="page-header"><h2>流程监控</h2></div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="流程节点">
          <el-select v-model="filterNode" placeholder="筛选节点" clearable @change="loadList" style="width:200px">
            <el-option v-for="opt in nodeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker v-model="filterMonth" type="month" placeholder="筛选月份" value-format="YYYY-MM" clearable @change="loadList" style="width:150px" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-16">
      <template #header><span>考核流程列表</span></template>
      <el-table :data="flowList" stripe>
        <el-table-column prop="title" label="考核标题" min-width="180" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column label="当前节点" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'N9' ? 'success' : 'warning'">{{ row.status }} - {{ nodeNames[row.status] || '' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <el-progress :percentage="getNodeProgress(row.status)" :color="row.status === 'N9' ? '#059669' : '#2563EB'" />
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="部门" width="120" />
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadList"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<style scoped>
.flow-monitor { padding: 20px; }
.page-header { margin-bottom: 16px; }
.filter-card { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }
</style>