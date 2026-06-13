<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { assessmentApi } from '@/api/assessment'

const route = useRoute()
const assessmentId = Number(route.params.id)

const loading = ref(true)
const detail = ref<any>({})

// 回退配置
const rollbackForm = ref({
  targetNode: '',
  reason: '',
})

// 当前节点允许回退的目标节点
const rollbackOptions = computed(() => {
  const current = detail.value.status || 'N1'
  const currentNum = parseInt(current.replace('N', ''))
  const options: { label: string; value: string }[] = []
  for (let i = 1; i < currentNum; i++) {
    options.push({ label: `N${i}`, value: `N${i}` })
  }
  return options
})

async function loadDetail() {
  loading.value = true
  try {
    const res = await assessmentApi.getDetail(assessmentId)
    detail.value = res.data
  } catch { ElMessage.error('加载详情失败') }
  finally { loading.value = false }
}

async function handleRollback() {
  if (!rollbackForm.value.targetNode) {
    ElMessage.error('请选择回退目标节点')
    return
  }
  if (!rollbackForm.value.reason) {
    ElMessage.error('请填写回退原因')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认将考核流程从 ${detail.value.status} 回退到 ${rollbackForm.value.targetNode}？`,
      '回退确认',
      { confirmButtonText: '确认回退', cancelButtonText: '取消', type: 'warning' }
    )
    await assessmentApi.rollback(assessmentId, rollbackForm.value)
    ElMessage.success('流程已回退')
    loadDetail()
  } catch { /* 取消 */ }
}

onMounted(() => { loadDetail() })
</script>

<template>
  <div class="rollback-page" v-loading="loading">
    <div class="page-header"><h2>流程回退</h2></div>

    <el-card shadow="never">
      <template #header><span>当前考核状态</span></template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="考核标题">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="考核月份">{{ detail.month }}</el-descriptions-item>
        <el-descriptions-item label="当前节点">
          <el-tag type="warning">{{ detail.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="mt-16">
      <template #header><span>回退操作</span></template>
      <el-form :model="rollbackForm" label-width="100px">
        <el-form-item label="回退目标节点">
          <el-select v-model="rollbackForm.targetNode" placeholder="选择回退节点" style="width: 300px">
            <el-option v-for="opt in rollbackOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="回退原因">
          <el-input v-model="rollbackForm.reason" type="textarea" :rows="4" placeholder="请详细说明回退原因" />
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="handleRollback">确认回退</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.rollback-page { padding: 20px; }
.page-header { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }
</style>