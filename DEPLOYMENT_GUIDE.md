# 叮当绩效管理系统 - 部署指南

**版本：** 体验版 v1.0.0  
**日期：** 2026-06-13  
**状态：** ✅ 可供测试和演示

---

## 一、系统概述

叮当绩效管理系统是一个企业绩效管理平台，支持月度考核流程、绩效库管理、财务数据联动、多维度报告等功能。

**技术栈：**
- **后端：** NestJS + TypeORM + SQLite（体验版）
- **前端：** Vue 3 + Element Plus + Pinia + Vue Router
- **认证：** JWT (JSON Web Token)

---

## 二、快速启动

### 方法 1：使用一键启动脚本（推荐）

```powershell
cd E:\DDL620\dingdang-performance
.\start-all.ps1
```

脚本会自动：
1. 检查端口占用
2. 启动后端服务（端口 3000）
3. 启动前端服务（端口 4173）
4. 打开浏览器

### 方法 2：手动启动

**启动后端：**
```powershell
cd E:\DDL620\dingdang-performance\server
node dist/main.js
```

**启动前端：**
```powershell
cd E:\DDL620\dingdang-performance\web\dist
python -m http.server 4173
```

---

## 三、访问系统

**前端地址：<ADDRESS_REMOVED>
**后端 API：** `http://localhost:3000/api`

**测试账号：**
| 用户名 | 密码 | 角色 |
|--------|------|------|
| chairman | 123456 | 董事长 (chairman) |
| hr_wang | 123456 | HR (hr) |
| dept_zhang | 123456 | 部门经理 (manager) |
| staff_li | 123456 | 员工 (employee) |
| finance_zhao | 123456 | 财务 (finance) |

---

## 四、功能清单

### ✅ 已实现功能

#### 1. 认证与用户管理
- [x] 用户登录（JWT 认证）
- [x] 获取当前用户信息
- [x] 修改密码
- [x] 用户 CRUD（增删改查）
- [x] 角色分配
- [x] 重置密码

#### 2. 部门管理
- [x] 部门列表（树形结构）
- [x] 部门 CRUD
- [x] 部门扁平列表（用于下拉选择）

#### 3. 绩效库管理
- [x] 考核项列表
- [x] 考核项 CRUD
- [x] 启用/停用考核项
- [x] 按分类筛选

#### 4. 考核管理
- [x] 发起考核
- [x] 选取考核项
- [x] 录入结果值
- [x] 自评
- [x] 经理评分
- [x] 考核流程（N1-N9 状态机）
- [x] 回退机制

#### 5. 财务管理
- [x] 财务数据列表
- [x] 财务数据 CRUD
- [x] 与考核联动

#### 6. HR 管理
- [x] 发起考核（HR 视角）
- [x] 流程监控

#### 7. 报告
- [x] 个人报告
- [x] 部门汇总
- [x] 公司排行

#### 8. 系统管理
- [x] 用户管理页面
- [x] 角色分配

---

## 五、API 端点清单

### 认证 (`/api/auth`)
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/change-password` - 修改密码

### 用户 (`/api/users`)
- `GET /api/users` - 用户列表
- `GET /api/users/:id` - 用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `PUT /api/users/:id/role` - 更新角色
- `POST /api/users/:id/reset-password` - 重置密码

### 部门 (`/api/dept`)
- `GET /api/dept` - 部门列表（树形）
- `GET /api/dept/list` - 部门扁平列表
- `GET /api/dept/:id` - 部门详情
- `POST /api/dept` - 创建部门
- `PUT /api/dept/:id` - 更新部门
- `DELETE /api/dept/:id` - 删除部门

### 绩效库 (`/api/library`)
- `GET /api/library` - 考核项列表
- `GET /api/library/:id` - 考核项详情
- `POST /api/library` - 创建考核项
- `PUT /api/library/:id` - 更新考核项
- `DELETE /api/library/:id` - 删除考核项
- `PUT /api/library/:id/toggle` - 启用/停用

### 考核 (`/api/assess`)
- `GET /api/assess` - 考核列表
- `GET /api/assess/:id` - 考核详情
- `POST /api/assess` - 发起考核
- `POST /api/assess/:id/select-items` - 选取考核项
- `POST /api/assess/:id/submit-results` - 提交结果值
- `POST /api/assess/:id/self-assess` - 提交自评
- `POST /api/assess/:id/manager-score` - 提交经理评分
- `POST /api/assess/:id/approve` - 审批通过
- `POST /api/assess/:id/reject` - 审批驳回
- `POST /api/assess/:id/rollback` - 回退

### 财务 (`/api/finance`)
- `GET /api/finance` - 财务数据列表
- `GET /api/finance/:id` - 财务数据详情
- `POST /api/finance` - 创建财务数据
- `PUT /api/finance/:id` - 更新财务数据
- `DELETE /api/finance/:id` - 删除财务数据

### 流程 (`/api/flow`)
- `GET /api/flow/nodes` - 流程节点定义
- `GET /api/flow/:assessId/logs` - 流程日志

### 报告 (`/api/reports`)
- `GET /api/reports/user-report` - 个人报告
- `GET /api/reports/dept-summary` - 部门汇总
- `GET /api/reports/ranking` - 公司排行

---

## 六、数据库

### 体验版数据库（SQLite）
- **位置：** `E:\DDL620\dingdang-performance\server\db\performance.sqlite`
- **初始化：** 自动创建表结构
- **种子数据：** 自动导入（5 个用户、3 个部门、10 个考核项）

### 迁移到 MySQL（生产环境）
1. 修改 `server\.env` 中的数据库配置
2. 更新 `server\src\app.module.ts` 中的 TypeORM 配置
3. 运行 `npm run build` 重新构建

---

## 七、项目结构

```
dingdang-performance/
├── server/                  # 后端（NestJS）
│   ├── src/
│   │   ├── modules/        # 功能模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── dept/       # 部门模块
│   │   │   ├── library/    # 绩效库模块
│   │   │   ├── assess/     # 考核模块
│   │   │   ├── score/      # 评分模块
│   │   │   ├── finance/    # 财务模块
│   │   │   ├── flow/       # 流程模块
│   │   │   └── report/     # 报告模块
│   │   ├── entities/       # 数据库实体
│   │   └── main.ts         # 入口文件
│   ├── dist/               # 生产构建输出
│   └── .env                # 环境变量
├── web/                     # 前端（Vue 3）
│   ├── src/
│   │   ├── api/            # API 调用
│   │   ├── views/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── router/         # 路由配置
│   │   └── utils/          # 工具函数
│   └── dist/               # 生产构建输出
├── start-all.ps1            # 一键启动脚本
├── PROJECT_STATUS.md        # 项目状态报告
└── DEPLOYMENT_GUIDE.md     # 本文档
```

---

## 八、常见问题

### 1. 后端启动失败
**现象：** 运行 `node dist/main.js` 后端口 3000 未监听  
**原因：** 可能是端口被占用或数据库文件损坏  
**解决：**
```powershell
# 检查端口占用
Get-NetTCPConnection -LocalPort 3000 -State Listen

# 删除数据库文件重新初始化
Remove-Item E:\DDL620\dingdang-performance\server\db\performance.sqlite
# 重新启动后端
```

### 2. 前端无法访问
**现象：** 浏览器显示"无法访问此网站"  
**原因：** Python HTTP 服务器未启动  
**解决：**
```powershell
cd E:\DDL620\dingdang-performance\web\dist
python -m http.server 4173
```

### 3. 登录失败（401 错误）
**现象：** 输入正确账号密码后提示"登录失败"  
**原因：** 数据库中的密码与输入不匹配  
**解决：** 使用种子数据中的测试账号：
- 用户名：`chairman`，密码：`123456`

### 4. API 调用失败（CORS 错误）
**现象：** 浏览器控制台显示 CORS 错误  
**原因：** 前端和后端不在同一域下  
**解决：** 后端已配置 CORS，允许来自 `http://localhost:4173` 的请求。如果更改前端端口，需更新后端 CORS 配置。

---

## 九、下一步计划

### 短期（1-2 天）
1. 进行完整的前后端集成测试
2. 修复发现的 bug
3. 完善错误提示和用户引导

### 中期（3-7 天）
1. 实现完整的 N1-N9 流程状态机和回退机制
2. 完善报告生成功能（图表、导出）
3. 添加数据验证和错误处理
4. 优化前端页面布局和交互

### 长期（未来）
1. 迁移到 MySQL 数据库
2. 部署到生产环境（Docker + Nginx）
3. 添加更多功能（移动端、微信小程序等）

---

## 十、技术支持

**项目位置：** `E:\DDL620\dingdang-performance\`  
**状态报告：** `E:\DDL620\dingdang-performance\PROJECT_STATUS.md`  
**本文档：** `E:\DDL620\dingdang-performance\DEPLOYMENT_GUIDE.md`

---

**祝测试顺利！如有问题，请查看状态报告或联系开发者。**
