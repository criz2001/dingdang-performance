<template>
  <div class="report-personal">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">个人绩效报告</h2>
      <div class="header-actions">
        <el-select v-model="selectedYear" placeholder="选择年份" @change="loadData">
          <el-option label="2024" value="2024" />
          <el-option label="2023" value="2023" />
          <el-option label="2022" value="2022" />
        </el-select>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 个人信息卡片 -->
    <el-card class="profile-card" shadow="never">
      <div class="profile-info">
        <el-avatar :size="80" :icon="UserFilled" />
        <div class="profile-details">
          <h3>{{ userInfo.name }}</h3>
          <p>{{ userInfo.department }} | {{ userInfo.position }}</p>
          <p>入职时间: {{ userInfo.hireDate }}</p>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-value">{{ stats.averageScore }}</div>
            <div class="stat-label">平均得分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalAssessments }}</div>
            <div class="stat-label">考核次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.gradeDistribution.A }}</div>
            <div class="stat-label">A级次数</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 趋势图 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <span>绩效趋势 ({{ selectedYear }}年)</span>
      </template>
      <div ref="trendChartRef" style="width: 100%; height: 400px"></div>
    </el-card>

    <!-- 等级分布 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>等级分布</span>
          </template>
          <div ref="gradeChartRef" style="width: 100%; height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>各项指标平均得分</span>
          </template>
          <div ref="radarChartRef" style="width: 100%; height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评分明细表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>各月评分明细 ({{ tableData.length }})</span>
        </div>
      </template>

      <el-table :data="paginatedData" style="width: 100%" border stripe>
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="totalScore" label="总分" width="100" align="center" sortable>
          <template #default="{ row }">
            <strong :class="getScoreClass(row.totalScore)">{{ row.totalScore }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getGradeType(row.grade)" size="large">{{ row.grade }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="各项得分" min-width="300">
          <template #default="{ row }">
            <div class="score-breakdown">
              <el-tag
                v-for="item in row.items"
                :key="item.name"
                size="small"
                style="margin-right: 5px"
              >
                {{ item.name }}: {{ item.score }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ranking" label="排名" width="100" align="center" />
        <el-table-column prop="comment" label="综合评语" min-width="200" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="tableData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 个人绩效报告
 * ECharts折线图展示趋势
 * 表格展示各月评分明细
 * 等级统计
 */

import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, UserFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { UserStats, AssessmentRecord } from '@/types'

// ========== 状态定义 ==========
const selectedYear = ref('2024')
const currentPage = ref(1)
const pageSize = ref(10)

/**
 * 用户信息（模拟）
 */
const userInfo = reactive({
  name: '张三',
  department: '技术部',
  position: '高级工程师',
  hireDate: '2022-03-15',
})

/**
 * 统计数据
 */
const stats = reactive({
  averageScore: 85.6,
  totalAssessments: 12,
  gradeDistribution: {
    A: 3,
    B: 6,
    C: 2,
    D: 1,
    E: 0,
  },
})

// ========== ECharts 图表引用 ==========
const trendChartRef = ref<HTMLElement>()
const gradeChartRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let gradeChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

/**
 * 表格数据（模拟）
 */
const tableData = ref<AssessmentRecord[]>([
  { month: '2024-01', totalScore: 88, grade: 'B', items: [{ name: '业绩', score: 90 }, { name: '态度', score: 85 }], ranking: '5/20', comment: '表现良好' },
  { month: '2024-02', totalScore: 92, grade: 'A', items: [{ name: '业绩', score: 95 }, { name: '态度', score: 88 }], ranking: '3/20', comment: '优秀' },
  { month: '2024-03', totalScore: 85, grade: 'B', items: [{ name: '业绩', score: 82 }, { name: '态度', score: 90 }], ranking: '7/20', comment: '继续努力' },
  { month: '2024-04', totalScore: 90, grade: 'A', items: [{ name: '业绩', score: 92 }, { name: '态度', score: 87 }], ranking: '4/20', comment: '稳定发挥' },
  { month: '2024-05', totalScore: 87, grade: 'B', items: [{ name: '业绩', score: 85 }, { name: '态度', score: 92 }], ranking: '6/20', comment: '有进步' },
  { month: '2024-06', totalScore: 91, grade: 'A', items: [{ name: '业绩', score: 93 }, { name: '态度', score: 88 }], ranking: '2/20', comment: '本季度最佳' },
])

// ========== 计算属性 ==========
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tableData.value.slice(start, end)
})

// ========== 方法 ==========

/**
 * 加载数据
 */
const loadData = async () => {
  const year = parseInt(selectedYear.value)
  try {
    const res = await reportApi.getPersonalReport({ year, month: 0 })
    // 使用返回的数据更新表格
    if (res?.data?.records) {
      tableData.value = res.data.records
    }
    if (res?.data?.stats) {
      stats.averageScore = res.data.stats.averageScore || 0
      stats.totalAssessments = res.data.stats.totalAssessments || 0
      stats.gradeDistribution = res.data.stats.gradeDistribution || stats.gradeDistribution
    }
  } catch (error) {
    console.error('加载个人报告失败:', error)
    // 使用默认模拟数据
  }
  initCharts()
}

/**
 * 初始化图表
 */
const initCharts = () => {
  nextTick(() => {
    // 趋势图
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption({
        title: { text: '月度绩效趋势', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        },
        yAxis: { type: 'value', min: 0, max: 100 },
        series: [
          {
            name: '总分',
            type: 'line',
            data: [88, 92, 85, 90, 87, 91],
            smooth: true,
            itemStyle: { color: '#2563EB' },
            areaStyle: { color: 'rgba(37, 99, 235, 0.1)' },
          },
        ],
      })
    }

    // 等级分布饼图
    if (gradeChartRef.value) {
      gradeChart = echarts.init(gradeChartRef.value)
      gradeChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: stats.gradeDistribution.A, name: 'A级', itemStyle: { color: '#059669' } },
              { value: stats.gradeDistribution.B, name: 'B级', itemStyle: { color: '#2563EB' } },
              { value: stats.gradeDistribution.C, name: 'C级', itemStyle: { color: '#D97706' } },
              { value: stats.gradeDistribution.D, name: 'D级', itemStyle: { color: '#DC2626' } },
              { value: stats.gradeDistribution.E, name: 'E级', itemStyle: { color: '#6B7280' } },
            ],
          },
        ],
      })
    }

    // 雷达图
    if (radarChartRef.value) {
      radarChart = echarts.init(radarChartRef.value)
      radarChart.setOption({
        radar: {
          indicator: [
            { name: '业绩指标', max: 100 },
            { name: '服务质量', max: 100 },
            { name: '项目管理', max: 100 },
            { name: '技术研发', max: 100 },
            { name: '团队协作', max: 100 },
            { name: '学习发展', max: 100 },
          ],
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [90, 85, 88, 92, 87, 80],
                name: '平均得分',
                areaStyle: { color: 'rgba(37, 99, 235, 0.2)' },
                lineStyle: { color: '#2563EB' },
              },
            ],
          },
        ],
      })
    }
  })
}

/**
 * 导出报告
 */
const handleExport = async () => {
  const year = parseInt(selectedYear.value)
  try {
    ElMessage.success('正在导出个人绩效报告...')
    // 调用导出API
    const res = await reportApi.getPersonalReport({ year, month: 0 })
    if (res?.data) {
      // 创建下载
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `个人绩效报告_${year}.json`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('报告导出成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

/**
 * 获取评分样式类
 */
const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

/**
 * 获取等级标签类型
 */
const getGradeType = (grade: string) => {
  const typeMap: Record<string, string> = {
    'A': 'success',
    'B': '',
    'C': 'warning',
    'D': 'danger',
    'E': 'danger',
  }
  return typeMap[grade] || 'info'
}

/**
 * 分页大小变更
 */
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

/**
 * 当前页变更
 */
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

/**
 * 窗口大小变化时重绘图表
 */
const handleResize = () => {
  trendChart?.resize()
  gradeChart?.resize()
  radarChart?.resize()
}

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  gradeChart?.dispose()
  radarChart?.dispose()
})
</script>

<style scoped>
/* ========== 页面布局 ========== */
.report-personal {
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-base);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ========== 个人信息卡片 ========== */
.profile-card {
  margin-bottom: var(--spacing-xl);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.profile-details {
  flex: 1;
}

.profile-details h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-xl);
}

.profile-details p {
  margin: var(--spacing-xs) 0;
  color: var(--color-text-secondary);
}

.profile-stats {
  display: flex;
  gap: var(--spacing-2xl);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

/* ========== 图表卡片 ========== */
.chart-card {
  margin-bottom: var(--spacing-xl);
}

/* ========== 评分明细 ========== */
.table-card {
  margin-bottom: var(--spacing-xl);
}

.score-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* ========== 分页 ========== */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}

/* ========== 评分样式 ========== */
.score-excellent {
  color: #059669;
  font-weight: 700;
}

.score-good {
  color: #2563EB;
  font-weight: 600;
}

.score-pass {
  color: #D97706;
}

.score-fail {
  color: #DC2626;
  font-weight: 600;
}

.mt-20 {
  margin-top: 20px;
}
</style>
