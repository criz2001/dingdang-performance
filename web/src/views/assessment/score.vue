<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { assessmentApi } from '@/api/assessment'

const route = useRoute()
const assessmentId = Number(route.params.id)

const loading = ref(true)
const scoreItems = ref<any[]>([])

// 评分表单
const scoreForm = reactive<Record<number, { score: number; comment: string }>>({})

async function loadItems() {
  loading.value = true
  try {
    const res = await assessmentApi.getItems(assessmentId)
    scoreItems.value = res.data || []
    scoreItems.value.forEach((item: any) => {
      scoreForm[item.id] = { score: 0, comment: '' }
    })
  } catch { ElMessage.error('加载考核项失败') }
  finally { loading.value = false }
}

async function handleSubmit() {
  try {
    const data = scoreItems.value.map(item => ({
      assessmentItemId: item.id,
      scoreType: 'manager',
      score: scoreForm[item.id].score,
      comment: scoreForm[item.id].comment,
    }))
    await assessmentApi.submitScores(assessmentId, data)
    ElMessage.success('评分已提交')
  } catch { ElMessage.error('评分提交失败') }
}

onMounted(() => { loadItems() })
</script>

<template>
  <div class="score-page" v-loading="loading">
    <div class="page-header"><h2>评分</h2></div>
    <el-card shadow="never">
      <template #header><span>对各考核项进行评分（0-100分）</span></template>
      <el-table :data="scoreItems" stripe>
        <el-table-column prop="name" label="考核项名称" min-width="150" />
        <el-table-column prop="weight" label="权重%" width="80" />
        <el-table-column prop="selfScore" label="自评得分" width="100" />
        <el-table-column label="评分" width="160">
          <template #default="{ row }">
            <el-input-number v-model="scoreForm[row.id].score" :min="0" :max="100" :step="1" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="评语" min-width="200">
          <template #default="{ row }">
            <el-input v-model="scoreForm[row.id].comment" type="textarea" :rows="1" placeholder="填写评语" />
          </template>
        </el-table-column>
      </el-table>
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit">提交评分</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.score-page { padding: 20px; }
.page-header { margin-bottom: 16px; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>