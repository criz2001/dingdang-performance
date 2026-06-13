<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo 区域 -->
      <div class="login-card__header">
        <div class="logo">
          <el-icon :size="40" color="#2563EB"><Bell /></el-icon>
        </div>
        <h1 class="title">叮当绩效</h1>
        <p class="subtitle">让绩效管理更简单</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="isLoading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ isLoading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <div class="login-tip">
        <el-divider>
          <span class="tip-text">体验账号</span>
        </el-divider>
        <div class="demo-accounts">
          <el-tag
            v-for="account in demoAccounts"
            :key="account.username"
            class="account-tag"
            @click="fillAccount(account)"
          >
            {{ account.label }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="login-footer">
      <span>© 2024 叮当绩效 All Rights Reserved</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页面
 * 支持用户名密码登录，提供体验账号快速登录
 */

import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { User, Lock, Bell } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// ========== 路由和状态 ==========
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const isLoading = computed(() => userStore.isLoading)

// ========== 表单数据 ==========
const formData = reactive({
  username: '',
  password: '',
})

// ========== 表单验证规则 ==========
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

// ========== 体验账号列表 ==========
const demoAccounts = [
  { label: '董事长', username: 'chairman', password: '123456' },
  { label: 'HR专员', username: 'hr_wang', password: '123456' },
  { label: '部门经理', username: 'rd_zhao', password: '123456' },
  { label: '员工', username: 'emp_chen', password: '123456' },
  { label: '财务', username: 'finance_li', password: '123456' },
]

// ========== 方法 ==========

/**
 * 填充体验账号
 */
const fillAccount = (account: { username: string; password: string }) => {
  formData.username = account.username
  formData.password = account.password
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  //#region debug-point login-handle
  console.log('[DEBUG] handleLogin: 开始登录', { username: formData.username })
  //#endregion

  const success = await userStore.login(formData)

  //#region debug-point login-result
  console.log('[DEBUG] handleLogin: 登录结果', { success, token: userStore.token, userInfo: userStore.userInfo })
  //#endregion

  if (success) {
    // 跳转到目标页面或首页
    const redirect = (route.query.redirect as string) || '/dashboard'
    //#region debug-point login-redirect
    console.log('[DEBUG] handleLogin: 准备跳转', { redirect })
    //#endregion
    
    // 使用 setTimeout 确保 Pinia 状态已更新
    setTimeout(async () => {
      try {
        await router.push(redirect)
        //#region debug-point login-redirect-success
        console.log('[DEBUG] handleLogin: 跳转成功')
        //#endregion
      } catch (error) {
        console.error('[DEBUG] handleLogin: router.push失败，使用window.location跳转', error)
        //#region debug-point login-redirect-error
        console.log('[DEBUG] handleLogin: 跳转失败，尝试window.location', { error })
        //#endregion
        // 使用 window.location 作为备用方案
        window.location.href = redirect
      }
    }, 50)
  }
}
</script>

<style scoped>
/* ========== 页面布局 ========== */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* ========== 背景装饰 ========== */
.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -200px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
}

.shape-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* ========== 登录卡片 ========== */
.login-card {
  width: 420px;
  padding: var(--spacing-3xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 10;
}

.login-card__header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.logo {
  width: 72px;
  height: 72px;
  background: var(--color-primary-bg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-base);
}

.title {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

/* ========== 登录表单 ========== */
.login-form {
  margin-bottom: var(--spacing-xl);
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-lg);
}

/* ========== 提示信息 ========== */
.login-tip {
  margin-top: var(--spacing-lg);
}

.tip-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.demo-accounts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-top: var(--spacing-base);
}

.account-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.account-tag:hover {
  transform: scale(1.05);
}

/* ========== 底部版权 ========== */
.login-footer {
  position: absolute;
  bottom: var(--spacing-xl);
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--font-size-xs);
}
</style>
