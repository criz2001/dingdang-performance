<template>
  <div class="system-users">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="用户名/姓名/邮箱"
            prefix-icon="Search"
            clearable
            style="width: 200px"
            @input="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filterForm.role" placeholder="全部角色" clearable @change="handleSearch">
            <el-option label="董事长" value="chairman" />
            <el-option label="HR专员" value="hr" />
            <el-option label="部门经理" value="manager" />
            <el-option label="员工" value="employee" />
            <el-option label="财务" value="finance" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable @change="handleSearch">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表 ({{ filteredData.length }})</span>
          <div class="header-actions">
            <el-button size="small" @click="handleBatchEnable" :disabled="selectedRows.length === 0">
              批量启用
            </el-button>
            <el-button size="small" type="danger" @click="handleBatchDisable" :disabled="selectedRows.length === 0">
              批量禁用
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="paginatedData"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="150" />
        <el-table-column label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="warning" link size="small" @click="handleRoleAssign(row)">
              <el-icon><Setting /></el-icon>
              角色分配
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              type="danger"
              link
              size="small"
              @click="handleDisable(row)"
            >
              <el-icon><CircleClose /></el-icon>
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              link
              size="small"
              @click="handleEnable(row)"
            >
              <el-icon><CircleCheck /></el-icon>
              启用
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="600px"
      @close="resetUserForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="userForm.department" placeholder="请选择部门" style="width: 100%">
            <el-option label="技术部" value="技术部" />
            <el-option label="销售部" value="销售部" />
            <el-option label="市场部" value="市场部" />
            <el-option label="财务部" value="财务部" />
            <el-option label="人力资源部" value="人力资源部" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="userForm.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">确认</el-button>
      </template>
    </el-dialog>

    <!-- 角色分配对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="角色分配"
      width="500px"
    >
      <div v-if="currentUser">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
          <el-descriptions-item label="当前角色">{{ getRoleText(currentUser.role) }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px">
          <h4>选择新角色</h4>
          <el-select v-model="newRole" placeholder="请选择角色" style="width: 100%">
            <el-option label="董事长" value="chairman" />
            <el-option label="HR专员" value="hr" />
            <el-option label="部门经理" value="manager" />
            <el-option label="员工" value="employee" />
            <el-option label="财务" value="finance" />
          </el-select>
        </div>
      </div>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * 用户管理页
 * 用户列表表格，支持添加/编辑/角色分配（下拉选择5种角色）
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Refresh, Edit, Setting, CircleClose, CircleCheck, Delete } from '@element-plus/icons-vue'
import { hrApi } from '@/api/hr'
import type { User, UserRole } from '@/types'

// ========== 状态定义 ==========
const filterForm = reactive({
  keyword: '',
  role: '',
  status: '',
})

const currentPage = ref(1)
const pageSize = ref(10)
const userDialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const roleDialogVisible = ref(false)
const userFormRef = ref<FormInstance>()
const isLoading = ref(false)

const currentUser = ref<User | null>(null)
const newRole = ref<string>('')

/**
 * 用户表单
 */
const userForm = reactive({
  id: '',
  username: '',
  name: '',
  email: '',
  department: '',
  position: '',
  password: '',
  status: 'active',
})

/**
 * 表单验证规则
 */
const userRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

const selectedRows = ref<User[]>([])

/**
 * 表格数据
 */
const tableData = ref<User[]>([])

// ========== 计算属性 ==========

/**
 * 过滤后的数据
 */
const filteredData = computed(() => {
  let data = tableData.value

  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase()
    data = data.filter(item =>
      item.username.toLowerCase().includes(keyword) ||
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    )
  }

  if (filterForm.role) {
    data = data.filter(item => item.role === filterForm.role)
  }

  if (filterForm.status) {
    data = data.filter(item => item.status === filterForm.status)
  }

  return data
})

/**
 * 分页数据
 */
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// ========== 方法 ==========

/**
 * 加载数据
 */
const loadData = async () => {
  isLoading.value = true
  try {
    const res = await hrApi.getUsers({
      role: filterForm.role as UserRole,
      keyword: filterForm.keyword,
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    if (Array.isArray(res)) {
      tableData.value = res
    } else {
      tableData.value = res.list || []
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
  } finally {
    isLoading.value = false
  }
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  currentPage.value = 1
}

/**
 * 重置筛选
 */
const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.role = ''
  filterForm.status = ''
  currentPage.value = 1
}

/**
 * 添加用户
 */
const handleAdd = () => {
  dialogType.value = 'add'
  userDialogVisible.value = true
}

/**
 * 编辑用户
 */
const handleEdit = (row: User) => {
  dialogType.value = 'edit'
  Object.assign(userForm, { ...row, password: '' })
  userDialogVisible.value = true
}

/**
 * 保存用户
 */
const handleSaveUser = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
  } catch {
    return
  }

  try {
    if (dialogType.value === 'add') {
      await hrApi.createUser(userForm)
      ElMessage.success('用户已添加')
    } else {
      await hrApi.updateUser(Number(userForm.id), userForm)
      ElMessage.success('用户已更新')
    }
    userDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error('保存用户失败')
  }
}

/**
 * 角色分配
 */
const handleRoleAssign = (row: User) => {
  currentUser.value = { ...row }
  newRole.value = row.role
  roleDialogVisible.value = true
}

/**
 * 保存角色
 */
const handleSaveRole = async () => {
  if (!newRole.value) {
    ElMessage.warning('请选择角色')
    return
  }

  try {
    await hrApi.changeUserRole(Number(currentUser.value?.id), newRole.value as UserRole)
    ElMessage.success('角色已分配')
    roleDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('分配角色失败:', error)
    ElMessage.error('分配角色失败')
  }
}

/**
 * 启用用户
 */
const handleEnable = async (row: User) => {
  try {
    await ElMessageBox.confirm('确认启用该用户？', '启用确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info',
    })

    await hrApi.updateUser(Number(row.id), { status: 'active' })
    row.status = 'active'
    ElMessage.success('用户已启用')
  } catch {
    // 用户取消
  }
}

/**
 * 禁用用户
 */
const handleDisable = async (row: User) => {
  try {
    await ElMessageBox.confirm('确认禁用该用户？禁用后该用户将无法登录。', '禁用确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await hrApi.updateUser(Number(row.id), { status: 'disabled' })
    row.status = 'disabled'
    ElMessage.success('用户已禁用')
  } catch {
    // 用户取消
  }
}

/**
 * 删除用户
 */
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户？删除后不可恢复。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await hrApi.deleteUser(Number(row.id))
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('用户已删除')
  } catch {
    // 用户取消
  }
}

/**
 * 批量启用
 */
const handleBatchEnable = async () => {
  try {
    await ElMessageBox.confirm(`确认启用 ${selectedRows.value.length} 个用户？`, '批量启用', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info',
    })

    for (const row of selectedRows.value) {
      await hrApi.updateUser(Number(row.id), { status: 'active' })
      row.status = 'active'
    }
    ElMessage.success(`已启用 ${selectedRows.value.length} 个用户`)
  } catch {
    // 用户取消
  }
}

/**
 * 批量禁用
 */
const handleBatchDisable = async () => {
  try {
    await ElMessageBox.confirm(`确认禁用 ${selectedRows.value.length} 个用户？`, '批量禁用', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })

    for (const row of selectedRows.value) {
      await hrApi.updateUser(Number(row.id), { status: 'disabled' })
      row.status = 'disabled'
    }
    ElMessage.success(`已禁用 ${selectedRows.value.length} 个用户`)
  } catch {
    // 用户取消
  }
}

/**
 * 选择变更处理
 */
const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection
}

/**
 * 获取角色文本
 */
const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    'chairman': '董事长',
    'hr': 'HR专员',
    'manager': '部门经理',
    'employee': '员工',
    'finance': '财务',
  }
  return textMap[role] || '未知'
}

/**
 * 获取角色标签类型
 */
const getRoleType = (role: string) => {
  const typeMap: Record<string, string> = {
    'chairman': 'danger',
    'hr': 'warning',
    'manager': '',
    'employee': 'info',
    'finance': 'success',
  }
  return typeMap[role] || 'info'
}

/**
 * 重置用户表单
 */
const resetUserForm = () => {
  userForm.id = ''
  userForm.username = ''
  userForm.name = ''
  userForm.email = ''
  userForm.department = ''
  userForm.position = ''
  userForm.password = ''
  userForm.status = 'active'
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

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ========== 页面布局 ========== */
.system-users {
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

/* ========== 筛选卡片 ========== */
.filter-card {
  margin-bottom: var(--spacing-xl);
}

/* ========== 表格卡片 ========== */
.table-card {
  margin-bottom: var(--spacing-xl);
}

/* ========== 分页 ========== */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}
</style>
