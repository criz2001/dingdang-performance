<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { assessmentApi } from '@/api/assessment'

const route = useRoute()
const assessmentId = Number(route.params.id)

// 考核详情数据
const detail = ref<any>({})
const items = ref<any[]>([])
const loading = ref(true)

// 流程节点定义
const flowNodes = [
  { title: 'N1-选取', description: '从绩效库选取考核项' },
  { title: 'N2-确认', description: '部门经理确认考核方案' },
  { title: 'N3-下发', description: 'HR下发考核' },
  { title: 'N4-自评', description: '员工填写自评' },
  { title: 'N5-经理评分', description: '部门经理评分' },
  { title: 'N6-结果确认', description: '员工确认评分结果' },
  { title: 'N7-汇总审核', description: 'HR汇总审核' },
  { title: 'N8-董事长审批', description: '董事长审批' },
  { title: 'N9-归档', description: '考核归档完成' },
]

// 获取当前节点索引
const activeStep = ref(0)

async function loadDetail() {
  loading.value = true
  try {
    const res = await assessmentApi.getDetail(assessmentId)
    detail.value = res.data
    items.value = res.data?.items || []
    // 根据status计算当前步骤
    const statusNode = detail.value.status || 'N1'
    activeStep.value = parseInt(statusNode.replace('N', '')) - 1
  } catch (e: any) {
    ElMessage.error('加载考核详情失败')
  } finally {
    loading.value = false
  }
}

// 等级标签颜色
const levelColors: Record<string, string> = {
  S: '#059669', A: '#2563EB', B: '#D97706', C: '#6B7280', D: '#DC2626',
}

onMounted(() => { loadDetail() })
</script>

<template>
  <div class="assessment-detail" v-loading="loading">
    <div class="page-header">
      <h2>考核详情</h2>
    </div>

    <!-- 流程进度 -->
    <el-card shadow="never" class="mb-16">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step v-for="node in flowNodes" :key="node.title" :title="node.title" :description="node.description" />
      </el-steps>
    </el-card>

    <!-- 基本信息 -->
    <el-card shadow="never" class="mb-16">
      <template #header><span>考核基本信息</span></template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="考核标题">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="考核月份">{{ detail.month }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="activeStep >= 8 ? 'success' : 'warning'">{{ detail.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 考核明细 -->
    <el-card shadow="never">
      <template #header><span>考核明细项</span></template>
      <el-table :data="items" stripe>
        <el-table-column prop="name" label="考核项名称" min-width="150" />
        <el-table-column prop="weight" label="权重%" width="80" />
        <el-table-column prop="selfScore" label="自评得分" width="100" />
        <el-table-column prop="managerScore" label="经理评分" width="100" />
        <el-table-column prop="finalScore" label="最终得分" width="100" />
        <el-table-column label="等级" width="80">
          <template #default="{ row }">
            <el-tag :color="levelColors[row.level] || '#6B7280'" style="color:#fff;border:none">{{ row.level || '-' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.assessment-detail { padding: 20px; }
.page-header { margin-bottom: 16px; }
.mb-16 { margin-bottom: 16px; }
</style>