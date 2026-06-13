# 叮当绩效管理系统 - Render.com 部署指南

> 目标：获取一个公网 URL，随时随地访问绩效管理系统

---

## 🚀 部署步骤

### 第一步：连接 GitHub 仓库

1. 打开 **https://dashboard.render.com/connect**
2. 点击 **"Connect GitHub"**
3. 授权 GitHub 访问
4. 选择仓库 **`criz2001/dingdang-performance`**
5. 点击 **"Connect"**

---

### 第二步：创建 PostgreSQL 数据库

1. 在 Render Dashboard 点击 **"New +"** → **"PostgreSQL"**
2. 配置：
   - **Name**：`dingdang-performance-db`
   - **Region**：Singapore（延迟最低）
   - **Plan**：Free
3. 点击 **"Create Database"**
4. 等待创建完成，复制 **Internal Database URL**（备用，环境变量会自动注入）

---

### 第三步：创建后端 Web Service

1. 点击 **"New +"** → **"Web Service"**
2. 选择仓库 **`criz2001/dingdang-performance`**
3. 配置：
   - **Name**：`dingdang-performance-api`
   - **Region**：Singapore
   - **Branch**：`master`
   - **Root Directory**：留空
   - **Environment**：Node
   - **Plan**：Free
4. 设置构build命令和启动命令：
   - **Build Command**：`cd server && npm install && npm run build`
   - **Start Command**：`cd server && npm run start:prod`
5. 添加环境变量（**Environment Variables**）：
   - `NODE_ENV` = `production`
   - `APP_PREFIX` = `/api`
   - `JWT_SECRET` = `your-secret-key-change-in-production`（自定义密钥）
   - `JWT_EXPIRES_IN` = `12h`
   - `DATABASE_URL` = （从第二步的数据库自动获取，选中关联的 PostgreSQL）
6. 点击 **"Create Web Service"**

---

### 第四步：创建前端静态站点

1. 点击 **"New +"** → **"Static Site"**
2. 选择仓库 **`criz2001/dingdang-performance`**
3. 配置：
   - **Name**：`dingdang-performance-web`
   - **Region**：Singapore
   - **Branch**：`master`
   - **Root Directory**：留空
   - **Build Command**：`cd web && npm install && npm run build`
   - **Publish Directory**：`web/dist`
4. 添加环境变量：
   - `VITE_API_BASE_URL` = `https://dingdang-performance-api.onrender.com/api`
     （⚠️ 等后端创建完成后，把 `dingdang-performance-api.onrender.com` 替换成实际的 URL）
5. 设置重写规则（**Redirects/Rewrites**）：
   - Source: `/*`
   - Destination: `/index.html`
   - Status: `200`
6. 点击 **"Create Static Site"**

---

### 第五步：更新前端 API 地址（关键步骤）

后端创建完成后，Render 会分配一个 URL，例如：
`https://dingdang-performance-api.onrender.com`

1. 进入前端 Static Site 的 **"Environment"** 页面
2. 修改 `VITE_API_BASE_URL`：
   ```
   https://dingdang-performance-api.onrender.com/api
   ```
3. 点击 **"Save Changes"** → 自动重新构建部署

---

## 🔑 体验账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 董事长 | chairman | 123456 |
| HR 负责人 | hr_wang | 123456 |
| 研发负责人 | rd_zhao | 123456 |
| 普通员工 | emp_chen | 123456 |
| 财务负责人 | finance_li | 123456 |

---

## ⚠️ 注意事项

1. **Free 套餐限制**：服务闲置 15 分钟会自动休眠，首次访问需等待 30 秒左右"唤醒"
2. **数据库**：SQLite 不适合生产环境，已配置 PostgreSQL，迁移数据需要运行 seed 脚本
3. **CORS**：如果前端访问后端跨域报错，确认后端 `CORS_ORIGIN` 环境变量包含前端域名
4. **重新部署**：每次 GitHub 推送代码，Render 会自动重新部署

---

## 🔄 更新代码后的部署

只需推送到 GitHub，Render 会自动检测并重新部署：

```bash
git add .
git commit -m "your commit message"
git push origin master
```

---

## 🆘 故障排查

| 问题 | 解决方案 |
|------|----------|
| 后端 500 错误 | 检查 DATABASE_URL 是否正确，数据库是否就绪 |
| 前端 API 请求失败 | 确认 VITE_API_BASE_URL 已更新为实际后端 URL |
| CORS 报错 | 在后端环境变量添加前端 URL 到 CORS_ORIGIN |
| 构建失败 | 查看 Render 构建日志，确认 node 版本和依赖 |

---

**完成后，您将获得两个 Render URL：**
- 🌐 前端：`https://dingdang-performance-web.onrender.com`
- 🔧 后端 API：`https://dingdang-performance-api.onrender.com/api`

分享前端 URL 给同事，即可随时随地访问！