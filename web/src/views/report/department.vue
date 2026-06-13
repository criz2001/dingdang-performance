<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { reportApi } from '@/api/report'

const loading = ref(true)
const deptData = ref<any[]>([])
let barChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

async function loadReport() {
  loading.value = true
  try {
    const res = await reportApi.getDepartmentReport({ year: new Date().getFullYear(), month: 0 })
    if (res?.data) {
      deptData.value = res.data.employees || []
    } else if (Array.isArray(res)) {
      deptData.value = res
    }
    renderCharts()
  } catch (error) {
    console.error('加载报告失败:', error)
    ElMessage.error('加载报告失败')
  } finally {
    loading.value = false
  }
}

function renderCharts() {
  // 柱状图：员工得分对比
  const barDom = document.getElementById('bar-chart')
  if (barDom) {
    barChart = echarts.init(barDom)
    const names = deptData.value.map(e => e.name)
    const scores = deptData.value.map(e => e.finalScore || 0)
    barChart.setOption({
      title: { text: '员工绩效得分对比', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names },
      yAxis: { type: 'value', min: 0, max: 100 },
      series: [{ type: 'bar', data: scores, itemStyle: { color: '#2563EB' } }],
    })
  }

  // 饼图：等级分布
  const pieDom = document.getElementById('pie-chart')
  if (pieDom) {
    pieChart = echarts.init(pieDom)
    const levelDist = [
      { value: 1, name: 'S级' }, { value: 3, name: 'A级' }, { value: 2, name: 'B级' }, { value: 1, name: 'C级' },
    ]
    pieChart.setOption({
      title: { text: '等级分布', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: '60%', data: levelDist, label: { formatter: '{b}: {c}人' } }],
      color: ['#059669', '#2563EB', '#D97706', '#6B7280', '#DC2626'],
    })
  }
}

onMounted(() => { loadReport() })
</script>

<template>
  <div class="dept-report" v-loading="loading">
    <div class="page-header"><h2>部门绩效汇总</h2></div>
    <el-row :gutter="16">
      <el-col :span="14">
        <el-card shadow="never"><div id="bar-chart" style="height: 350px"></div></el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never"><div id="pie-chart" style="height: 350px"></div></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="mt-16">
      <template #header><span>员工绩效明细</span></template>
      <el-table :data="deptData" stripe>
        <el-table-column prop="name" label="员工姓名" min-width="120" />
        <el-table-column prop="finalScore" label="最终得分" width="100" />
        <el-table-column prop="level" label="等级" width="80" />
        <el-table-column prop="selfScore" label="自评得分" width="100" />
        <el-table-column prop="managerScore" label="经理评分" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.dept-report { padding: 20px; }
.page-header { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }
</style>