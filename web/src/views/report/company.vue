<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { reportApi } from '@/api/report'

const loading = ref(true)
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const deptList = ref<any[]>([])

async function loadReport() {
  loading.value = true
  try {
    const res = await reportApi.getCompanyReport({ year: new Date().getFullYear(), month: 0 })
    if (res?.data) {
      deptList.value = res.data.departments || []
    } else if (Array.isArray(res)) {
      deptList.value = res
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
  // 等级分布饼图
  const pieDom = document.getElementById('level-pie')
  if (pieDom) {
    pieChart = echarts.init(pieDom)
    const levelDist = [
      { value: 2, name: 'S级' }, { value: 8, name: 'A级' }, { value: 5, name: 'B级' }, { value: 2, name: 'C级' }, { value: 1, name: 'D级' },
    ]
    pieChart.setOption({
      title: { text: '全公司等级分布', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: ['40%', '70%'], data: levelDist }],
      color: ['#059669', '#2563EB', '#D97706', '#6B7280', '#DC2626'],
    })
  }

  // 部门对比柱状图
  const barDom = document.getElementById('dept-bar')
  if (barDom) {
    barChart = echarts.init(barDom)
    const names = deptList.value.map(d => d.name)
    const avgScores = deptList.value.map(d => d.avgScore || 0)
    barChart.setOption({
      title: { text: '各部门平均绩效得分', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names },
      yAxis: { type: 'value', min: 0, max: 100 },
      series: [{ type: 'bar', data: avgScores, itemStyle: { color: '#2563EB' } }],
    })
  }
}

onMounted(() => { loadReport() })
</script>

<template>
  <div class="company-report" v-loading="loading">
    <div class="page-header"><h2>公司绩效汇总</h2></div>
    <el-row :gutter="16">
      <el-col :span="10">
        <el-card shadow="never"><div id="level-pie" style="height: 350px"></div></el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never"><div id="dept-bar" style="height: 350px"></div></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="mt-16">
      <template #header><span>部门绩效汇总</span></template>
      <el-table :data="deptList" stripe>
        <el-table-column prop="name" label="部门" min-width="150" />
        <el-table-column prop="avgScore" label="平均得分" width="100" />
        <el-table-column prop="sCount" label="S级人数" width="80" />
        <el-table-column prop="aCount" label="A级人数" width="80" />
        <el-table-column prop="bCount" label="B级人数" width="80" />
        <el-table-column prop="cCount" label="C级人数" width="80" />
        <el-table-column prop="dCount" label="D级人数" width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.company-report { padding: 20px; }
.page-header { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }
</style>