<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑考核项' : '新增考核项' }}</h1>
      <p class="page-subtitle">
        {{ isEdit ? `正在编辑考核项：${formData.name}` : '创建新的考核项' }}
      </p>
    </div>

    <!-- 表单 -->
    <div class="card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="library-form"
      >
        <el-form-item label="考核项名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入考核项名称"
            maxlength="50"
            show-word-limit
            :disabled="isView"
          />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类" :disabled="isView">
            <el-option label="销售指标" value="sales" />
            <el-option label="服务指标" value="service" />
            <el-option label="管理指标" value="management" />
            <el-option label="财务指标" value="financial" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="满分值" prop="maxScore">
          <el-input-number
            v-model="formData.maxScore"
            :min="1"
            :max="1000"
            :disabled="isView"
          />
          <span class="form-tip">分数范围 1-1000</span>
        </el-form-item>

        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="如：万元、%、次" :disabled="isView" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入考核项描述"
            maxlength="500"
            show-word-limit
            :disabled="isView"
          />
        </el-form-item>

        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            :disabled="isView"
          />
          <span class="form-tip">{{ formData.status === 1 ? '启用' : '停用' }}</span>
        </el-form-item>

        <el-form-item v-if="isEdit">
          <template #label>
            <span class="text-secondary">创建时间</span>
          </template>
          <span>{{ formatDateTime(currentItem?.createdAt) }}</span>
        </el-form-item>

        <el-form-item v-if="isEdit">
          <template #label>
            <span class="text-secondary">更新时间</span>
          </template>
          <span>{{ formatDateTime(currentItem?.updatedAt) }}</span>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item v-if="!isView">
          <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '确认创建' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>

        <el-form-item v-else>
          <el-button @click="handleBack">返回列表</el-button>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 考核项编辑页面
 * 支持新增、编辑、查看三种模式
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useLibraryStore } from '@/stores/library'
import { formatDateTime } from '@/utils/formatters'
import type { LibraryItem } from '@/types'

// ========== 路由和状态 ==========
const router = useRouter()
const route = useRoute()
const libraryStore = useLibraryStore()

const formRef = ref<FormInstance>()
const isSubmitting = ref(false)

// ========== 路由参数 ==========
const itemId = computed(() => Number(route.params.id) || 0)
const isEdit = computed(() => itemId.value > 0)
const isView = computed(() => route.query.mode === 'view')
const currentItem = computed(() => libraryStore.currentItem)

// ========== 表单数据 ==========
const formData = reactive<Partial<LibraryItem>>({
  name: '',
  category: '',
  maxScore: 100,
  unit: '',
  description: '',
  status: 1,
})

// ========== 表单验证规则 ==========
const rules: FormRules = {
  name: [
    { required: true, message: '请输入考核项名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
  maxScore: [
    { required: true, message: '请输入满分值', trigger: 'blur' },
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' },
  ],
}

// ========== 方法 ==========

/**
 * 加载考核项详情
 */
const loadDetail = async () => {
  if (!isEdit.value) return
  await libraryStore.fetchLibraryItem(itemId.value)
  if (currentItem.value) {
    Object.assign(formData, currentItem.value)
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  isSubmitting.value = true
  try {
    let success = false
    if (isEdit.value) {
      success = await libraryStore.updateItem(itemId.value, formData)
    } else {
      success = await libraryStore.createItem(formData)
    }

    if (success) {
      ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
      handleBack()
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 返回列表
 */
const handleBack = () => {
  router.push('/library')
}

/**
 * 进入编辑模式
 */
const handleEdit = () => {
  router.push(`/library/edit/${itemId.value}`)
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.library-form {
  max-width: 600px;
}

.form-tip {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.text-secondary {
  color: var(--color-text-secondary);
}
</style>
