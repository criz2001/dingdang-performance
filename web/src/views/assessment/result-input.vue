<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { assessmentApi } from '@/api/assessment'

const route = useRoute()
const assessmentId = Number(route.params.id)

const loading = ref(true)
const items = ref<any[]>([])

async function loadItems() {
  loading.value = true
  try {
    const res = await assessmentApi.getItems(assessmentId)
    items.value = (res.data || []).map((item: any) => ({ ...item, resultValue: '', resultComment: '' }))
  } catch { ElMessage.error('加载考核项失败') }
  finally { loading.value = false }
}

async function handleSubmit() {
  try {
    const data = items.value.map(item => ({
      id: item.id,
      resultValue: item.resultValue,
      resultComment: item.resultComment,
    }))
    await assessmentApi.submitResults(assessmentId, data)
    ElMessage.success('结果值已提交')
  } catch { ElMessage.error('提交失败') }
}

onMounted(() => { loadItems() })
</script>

<template>
  <div class="result-input" v-loading="loading">
    <div class="page-header"><h2>结果值录入</h2></div>
    <el-card shadow="never">
      <template #header><span>录入各考核项的实际完成情况</span></template>
      <el-table :data="items" stripe>
        <el-table-column prop="name" label="考核项名称" min-width="150" />
        <el-table-column prop="weight" label="权重%" width="80" />
        <el-table-column label="结果值" width="200">
          <template #default="{ row }">
            <el-input v-model="row.resultValue" placeholder="录入结果值" />
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.resultComment" type="textarea" :rows="1" placeholder="补充说明" />
          </template>
        </el-table-column>
      </el-table>
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit">提交结果值</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.result-input { padding: 20px; }
.page-header { margin-bottom: 16px; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>