# 叮当绩效管理系统 - 一键启动脚本
# 启动后端和前端服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  叮当绩效管理系统 - 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查端口是否被占用
Write-Host "1. 检查端口..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$port4173 = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "   ⚠️ 端口 3000 已被占用 (PID: $($port3000.OwningProcess))" -ForegroundColor Yellow
    Write-Host "   请先关闭占用端口的进程，或手动启动后端" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ 端口 3000 可用" -ForegroundColor Green
}

if ($port4173) {
    Write-Host "   ⚠️ 端口 4173 已被占用 (PID: $($port4173.OwningProcess))" -ForegroundColor Yellow
    Write-Host "   请先关闭占用端口的进程，或手动启动前端" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ 端口 4173 可用" -ForegroundColor Green
}

Write-Host ""

# 2. 启动后端
if (-not $port3000) {
    Write-Host "2. 启动后端服务..." -ForegroundColor Yellow
    $backendPath = "E:\DDL620\dingdang-performance\server"
    
    if (-not (Test-Path "$backendPath\dist\main.js")) {
        Write-Host "   ⚠️ 后端未构建，正在构建..." -ForegroundColor Yellow
        Set-Location $backendPath
        npm run build
    }
    
    Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory $backendPath -WindowStyle Normal
    Write-Host "   ✅ 后端启动中..." -ForegroundColor Green
    Start-Sleep 5
} else {
    Write-Host "2. 后端已在运行，跳过启动" -ForegroundColor Gray
}

Write-Host ""

# 3. 启动前端 (Python HTTP Server)
if (-not $port4173) {
    Write-Host "3. 启动前端服务..." -ForegroundColor Yellow
    $frontendPath = "E:\DDL620\dingdang-performance\web\dist"
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "   ⚠️ 前端未构建，正在构建..." -ForegroundColor Yellow
        Set-Location "E:\DDL620\dingdang-performance\web"
        npm run build
    }
    
    # 使用 Python 启动 HTTP 服务器
    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($python) {
        Start-Process -FilePath "python" -ArgumentList "-m","http.server","4173" -WorkingDirectory $frontendPath -WindowStyle Normal
        Write-Host "   ✅ 前端启动中 (Python HTTP Server)..." -ForegroundColor Green
    } else {
        Write-Host "   ❌ 未找到 Python，请手动启动前端" -ForegroundColor Red
        Write-Host "   可以运行: cd $frontendPath; python -m http.server 4173" -ForegroundColor Yellow
    }
    Start-Sleep 3
} else {
    Write-Host "3. 前端已在运行，跳过启动" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址：" -ForegroundColor White
Write-Host "  前端: http://localhost:4173/" -ForegroundColor Cyan
Write-Host "  后端 API: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试账号：" -ForegroundColor White
Write-Host "  用户名: chairman" -ForegroundColor Cyan
Write-Host "  密码:   123456" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键打开浏览器..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 打开浏览器
Start-Process "http://localhost:4173/"

Write-Host "浏览器已打开。如果页面无法访问，请检查：" -ForegroundColor Yellow
Write-Host "  1. 后端是否成功启动 (检查后端窗口)" -ForegroundColor Gray
Write-Host "  2. 前端是否成功启动 (检查前端窗口)" -ForegroundColor Gray
Write-Host "  3. 端口 3000 和 4173 是否被占用" -ForegroundColor Gray
Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
