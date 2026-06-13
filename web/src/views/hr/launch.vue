<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { hrApi } from '@/api/hr'
import { libraryApi } from '@/api/library'

const loading = ref(true)
const libraryItems = ref<any[]>([])
const isSubmitting = ref(false)

// 部门列表
const departments = ref<{ id: number; name: string }[]>([])

// 下发表单
const launchForm = reactive({
  month: '',
  deptId: null as number | null,
  selectedItems: [] as number[],
  title: '',
})

async function loadLibrary() {
  loading.value = true
  try {
    const res = await libraryApi.getList({ page: 1, pageSize: 100 })
    libraryItems.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载绩效库失败:', error)
    ElMessage.error('加载绩效库失败')
  } finally {
    loading.value = false
  }
}

async function loadDepartments() {
  try {
    const res = await hrApi.getDepartmentList()
    departments.value = res?.map((d: any) => ({ id: d.id, name: d.name })) || []
  } catch (error) {
    console.error('加载部门失败:', error)
    departments.value = []
  }
}

async function handleLaunch() {
  if (!launchForm.month) { ElMessage.error('请选择月份'); return }
  if (!launchForm.deptId) { ElMessage.error('请选择部门'); return }
  if (launchForm.selectedItems.length === 0) { ElMessage.error('请选择考核项'); return }

  isSubmitting.value = true
  try {
    await hrApi.launchAssessment({
      year: parseInt(launchForm.month.split('-')[0]),
      month: parseInt(launchForm.month.split('-')[1]),
      deptIds: [launchForm.deptId],
      libraryItemIds: launchForm.selectedItems,
      deadline: '',
    })
    ElMessage.success('考核已下发')
    launchForm.selectedItems = []
    launchForm.month = ''
    launchForm.deptId = null
    launchForm.title = ''
  } catch (error) {
    console.error('下发失败:', error)
    ElMessage.error('下发失败')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => { loadLibrary(); loadDepartments() })
</script>

<template>
  <div class="hr-launch" v-loading="loading">
    <div class="page-header"><h2>考核下发</h2></div>

    <el-card shadow="never">
      <template #header><span>HR发起月度考核</span></template>
      <el-form :model="launchForm" label-width="100px">
        <el-form-item label="考核月份">
          <el-date-picker v-model="launchForm.month" type="month" placeholder="选择月份" value-format="YYYY-MM" />
        </el-form-item>
        <el-form-item label="考核部门">
          <el-select v-model="launchForm.deptId" placeholder="选择部门" style="width: 300px">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考核标题">
          <el-input v-model="launchForm.title" placeholder="如：2024年6月研发部绩效考评" />
        </el-form-item>
        <el-form-item label="考核项">
          <el-checkbox-group v-model="launchForm.selectedItems">
            <el-checkbox v-for="item in libraryItems" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLaunch">下发考核</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.hr-launch { padding: 20px; }
.page-header { margin-bottom: 16px; }
</style>