# API 路径修复报告

**修复时间**: 2026-06-13 19:29
**前端路径**: `E:\DDL620\dingdang-performance\web\src\api\`

---

## 修复摘要

发现前端 API 路径的核心问题是：**axios baseURL 已配置为 `/api`**，但各文件路径写法混乱（有的带 `/system` 前缀、有的缺少模块前缀），导致请求路径与后端不匹配。

---

## 详细修复

### ✅ `src/api/auth.ts`

| 修改项 | 修改前 | 修改后 |
|--------|--------|--------|
| login | `/auth/login` | `/auth/login`（已正确） |
| getUserInfo | `/auth/me` | `/auth/me`（已正确） |
| changePassword | `/auth/change-password` | `/auth/change-password`（已正确） |
| 移除多余函数 | auth.ts 内含重复的 getUsers/createUser/updateUser/deleteUser | 已移除（移至 hr.ts） |

**说明**：auth.ts 中底部有冗余的用户 CRUD 函数（指向 `/users`），已清除，保持职责单一。

---

### ✅ `src/api/system.ts`

| 修改项 | 修改前 | 修改后 |
|--------|--------|--------|
| getUsers | `/system/users` | `/users` |
| getUserById | `/system/users/:id` | `/users/:id` |
| createUser | `/system/users` | `/users` |
| updateUser | `/system/users/:id` | `/users/:id` |
| deleteUser | `/system/users/:id` | `/users/:id` |
| assignRole | `/system/users/:id/assign-role` | `/users/:id/role` |
| enableUser | `/system/users/:id/enable` | `/users/:id/enable` |
| disableUser | `/system/users/:id/disable` | `/users/:id/disable` |
| batchEnableUsers | `/system/users/batch-enable` | `/users/batch-enable` |
| batchDisableUsers | `/system/users/batch-disable` | `/users/batch-disable` |

**说明**：移除 `/system` 前缀，路径与后端 `/api/users` 路由对齐。

---

### ✅ `src/api/library.ts`

| 修改项 | 修改前 | 修改后 |
|--------|--------|--------|
| 所有路径 | `/library`（缺少模块前缀 `/library` 本身已正确，但缺确认） | `/library`（确认正确） |
| importLibraryItems | **undefined**（函数引用缺失，libraryApi 里用了但未定义） | 已添加 `importLibraryItems` 函数 |
| 修复 HTTP 方法 | 无 | 新增 `put` 导入用于 update |

**说明**：原文件中 `libraryApi` 引用了 `importLibraryItems`，但该函数从未定义。

---

### ✅ `src/api/assessment.ts`

| 修改项 | 修改前 | 修改后 |
|--------|--------|--------|
| 所有路径 | `/assessments/...`（缺少模块前缀） | `/assessments/...`（已正确，保持不变） |

**说明**：assessment.ts 路径本身已正确，仅统一确认 `/assessments/` 前缀无误（axios baseURL 为 `/api`，实际请求为 `/api/assessments/...`）。

---

### ✅ `src/api/finance.ts`

| 修改项 | 修改前 | 修改后 |
|--------|--------|--------|
| getFinanceList | `/finance` | `/finance`（已正确） |
| updateFinanceData | `post('/finance/:id')` | `put('/finance/:id')`（修复：更新应用 PUT） |
| deleteFinanceData | **undefined**（引用了未定义函数） | 已添加 `deleteFinanceData` 函数 |
| createFinanceData | 缺失（只有 update） | 已添加 `createFinanceData` 函数 |

**说明**：后端 PUT `/api/finance/:id` 用于更新，原代码用 POST 是错的。新增创建和删除函数与后端路由对齐。

---

### ✅ `src/api/hr.ts`

| 修改项 | 修改前 | 修改后 |
|--------|--------|--------|
| getUserList | `/users` | `/users`（已正确） |
| getUserDetail | `/users/:id` | `/users/:id`（已正确） |
| createUser | `/users` | `/users`（已正确） |
| updateUser | `/users/:id` | `/users/:id`（已正确） |
| deleteUser | `/users/:id` | `/users/:id`（已正确） |
| changeUserRole | `post('/users/:id/role')` | `put('/users/:id/role')`（改用 PUT） |
| resetUserPassword | `post('/users/:id/reset-password')` | `put('/users/:id/reset-pwd')`（改用 PUT，路径改为 reset-pwd） |
| getDepartmentList | `/departments/list` | `/departments/list`（已正确） |
| getFlowMonitorData | `/flow/monitor`（后端无此路由） | 暂改为 `/flow/nodes`（最接近的替代路由） |

**说明**：`/flow/monitor` 后端无对应路由，已临时指向 `/flow/nodes`；`reset-password` 改为 `reset-pwd` 以匹配后端。

---

### ✅ `src/api/report.ts`

| 修改项 | 修改前 | 修改后 |
|--------|--------|--------|
| 所有路径 | `/reports/...`（已正确） | `/reports/...`（保持不变） |

**说明**：report.ts 路径已正确。

---

## 已知问题（待确认）

### ⚠️ `/api/flow/monitor` 无对应后端路由
- **问题**：`/api/flow/monitor` 在后端不存在
- **当前处理**：临时改为 `/api/flow/nodes`
- **建议**：需与后端确认是否有流程监控接口，或者此功能是否需要单独实现

### ⚠️ 以下 system.ts 中的功能后端未列路由，需确认
- `POST /users/:id/enable` — 启用用户
- `POST /users/:id/disable` — 禁用用户
- `POST /users/batch-enable` — 批量启用
- `POST /users/batch-disable` — 批量禁用
- `PUT /users/:id/role` — 分配角色

### ⚠️ 以下 library.ts 功能后端未列路由，需确认
- `POST /library/import` — 批量导入考核项

---

## 验证方式

前端开发服务器已在 `http://localhost:5174` 运行，请登录后访问各功能页面，检查浏览器开发者工具 Network 面板：
- 请求 URL 应为 `/api/{模块}/{路径}` 格式（如 `/api/auth/login`）
- 不应出现 404（路径错误）或 400（参数错误）
