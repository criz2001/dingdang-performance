# Debug Session: login-redirect-failed

## Status
[OPEN] - Instrumentation added, waiting for user to reproduce

## Problem Description
- **Symptom**: 登录成功后页面不跳转，显示"登录成功"提示但停留在登录页
- **Expected**: 登录成功后应跳转到 `/dashboard` 或 redirect 参数指定的页面
- **Environment**: Vue 3 + Pinia + Vue Router, Vite dev server

## Hypotheses
1. **H1**: 登录成功后 `userStore.userInfo` 未正确设置，导致路由守卫中判断失败
2. **H2**: 路由守卫中 `dynamicRoutesAdded` 状态管理有问题，导致无限循环或阻塞
3. **H3**: `router.push()` 执行后路由守卫拦截并重定向到登录页
4. **H4**: 动态路由添加失败，导致 `/dashboard` 路由不存在
5. **H5**: Pinia store 状态在路由守卫中读取时机问题

## Instrumentation Points
- [login/index.vue] handleLogin 函数 - 登录成功后的状态和跳转逻辑 ✅
- [router/index.ts] beforeEach 守卫 - token、userInfo、dynamicRoutesAdded 状态 ✅
- [stores/user.ts] login 函数 - token 和 userInfo 设置 ✅

## Evidence Log
Waiting for user to reproduce and provide console logs...

## Analysis
Pending...

## Fix
Pending...

## Verification
Pending...

## User Instructions
请按以下步骤操作：
1. 打开浏览器开发者工具（F12）
2. 切换到 Console（控制台）标签
3. 清空控制台日志
4. 点击登录（使用任意体验账号）
5. 将控制台中所有 `[DEBUG]` 开头的日志复制给我