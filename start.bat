@echo off
chcp 65001 >nul
echo ========================================
echo   叮当绩效 - 体验版一键启动脚本
echo ========================================
echo.

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 20 LTS
    pause
    exit /b 1
)

:: 检查后端是否已安装依赖
if not exist "server\node_modules" (
    echo [步骤1] 安装后端依赖...
    cd server
    call npm install
    cd ..
)

:: 检查前端是否已安装依赖
if not exist "web\node_modules" (
    echo [步骤2] 安装前端依赖...
    cd web
    call npm install
    cd ..
)

:: 启动后端服务
echo [步骤3] 启动后端服务 (端口 3000)...
cd server
start "叮当绩效-后端" cmd /k "chcp 65001 >nul && npm run start:dev"
cd ..

:: 等待后端启动
echo [等待] 后端服务启动中...
timeout /t 5 /nobreak >nul

:: 启动前端开发服务器
echo [步骤4] 启动前端开发服务 (端口 5173)...
cd web
start "叮当绩效-前端" cmd /k "chcp 65001 >nul && npm run dev"
cd ..

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo   后端服务: http://localhost:3000
echo   前端页面: http://localhost:5173
echo   API文档:  http://localhost:3000/api/docs
echo.
echo   体验账号：
echo     董事长:   admin / 123456
echo     HR专员:   hr001 / 123456  
echo     部门经理: mgr001 / 123456
echo     员工:     emp001 / 123456
echo     财务:     fin001 / 123456
echo.
pause