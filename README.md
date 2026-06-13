# 叮当绩效 - 体验版

> 中小型企业智能绩效管理平台体验版，用于功能演示和体验。

## 快速启动

### Windows 一键启动
双击 `start.bat` 即可启动前后端服务。

### 手动启动

**后端服务：**
```bash
cd server
npm install
npm run start:dev
```

**前端页面：**
```bash
cd web
npm install
npm run dev
```

### 访问地址
- 前端页面：http://localhost:5173
- 后端API：http://localhost:3000/api/v1

### 体验账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 董事长 | admin | 123456 | 全公司数据可见 |
| HR专员 | hr001 | 123456 | 流程管理、考核下发 |
| 部门经理 | mgr001 | 123456 | 确认/评分/部门汇总 |
| 员工 | emp001 | 123456 | 绩效库/选取/自评 |
| 财务 | fin001 | 123456 | 销售额数据录入 |

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + Element Plus + ECharts | 管理后台Web应用 |
| 后端 | Node.js + NestJS + TypeORM | 企业级Node框架 |
| 数据库 | SQLite（体验版）/ MySQL（生产） | 配置切换 |
| 缓存 | Redis（生产环境可选） | 体验版暂不启用 |

## 项目结构

```
dingdang-performance/
├── server/          # 后端 NestJS 服务
├── web/             # 前端 Vue 3 应用
├── docker-compose.yml  # Docker 生产部署配置
├── nginx.conf       # Nginx 反向代理配置
├── .env.example     # 环境配置模板
└── start.bat        # Windows 一键启动脚本
```

## 体验版 → 生产部署

体验版默认使用 SQLite 本地数据库，便于快速体验。部署到服务器时：

1. 修改 `.env` 中 `DB_TYPE=mysql`
2. 配置 MySQL 连接信息
3. 配置企业微信 API 密钥
4. 运行 `docker-compose up -d`

数据库层已做好抽象，只需改配置即可从 SQLite 切换到 MySQL，无需修改业务代码。

## 功能模块

- ✅ 绩效库管理（每人独立绩效库，考核项增删改查）
- ✅ 月度绩效选取（从绩效库选取，权重调整）
- ✅ 考核方案下发（HR发起月度考核）
- ✅ 多方评分流程（部门经理评分 + 员工自评）
- ✅ 节点回退机制（N1-N9完整状态机，任意节点可回退）
- ✅ 财务数据接入（销售额数据录入/关联）
- ✅ 汇总统计报告（公司/部门/个人多维度）
- ✅ 角色权限控制（五方联动RBAC）

## 文档参考

- [需求概览](dingdang-performance-prd.md)
- [技术栈文档](tech-stack.md)