@echo off
setlocal enabledelayedexpansion

cd /d E:\Github\openclaw-desktop

echo ========================================
echo AEGIS Desktop 简化构建脚本
echo ========================================
echo.

REM 检查是否已经有 win-unpacked
if exist release\win-unpacked (
    echo [检测] win-unpacked 已存在，跳过解压步骤
    echo.

    REM 直接使用已存在的文件夹创建安装包
    echo [构建] 从 win-unpacked 创建安装包...
    npx electron-builder --win --x64 --prepackaged release\win-unpacked

    if errorlevel 1 (
        echo 错误: 安装包构建失败
        pause
        exit /b 1
    )

    echo.
    echo ========================================
    echo 构建成功!
    echo ========================================
    echo 产物位置: release\
    dir /b release\*.exe 2>nul
    echo.
    pause
    exit /b 0
)

REM 如果没有 win-unpacked，先构建完整版本
echo [1/4] 构建 Electron 主进程...
call npm run build:electron
if errorlevel 1 goto :error

echo [2/4] 构建渲染进程...
call npm run build:renderer
if errorlevel 1 goto :error

echo [3/4] 等待文件系统释放...
timeout /t 3 /nobreak >nul

echo [4/4] 构建完整版本...
call npm run package
if errorlevel 1 goto :error

echo.
echo ========================================
echo 构建成功!
echo ========================================
pause
exit /b 0

:error
echo.
echo ========================================
echo 构建失败!
echo ========================================
pause
exit /b 1
