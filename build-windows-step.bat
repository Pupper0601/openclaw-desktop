@echo off
echo ========================================
echo AEGIS Desktop Windows Build Script
echo ========================================
echo.

cd /d E:\Github\openclaw-desktop

echo [1/5] 清理旧文件...
if exist release\win-unpacked rmdir /S /Q release\win-unpacked
if exist build-output.txt del build-output.txt
if exist build-error.txt del build-error.txt
echo.

echo [2/5] 构建 Electron 主进程...
call npm run build:electron
if errorlevel 1 (
    echo 错误: Electron 主进程构建失败
    pause
    exit /b 1
)
echo.

echo [3/5] 构建渲染进程...
call npm run build:renderer
if errorlevel 1 (
    echo 错误: 渲染进程构建失败
    pause
    exit /b 1
)
echo.

echo [4/5] 等待文件系统释放...
timeout /t 5 /nobreak >nul
echo.

echo [5/5] 构建 Windows 安装包...
call npm run package
if errorlevel 1 (
    echo 错误: 安装包构建失败
    echo.
    echo 请检查 release 目录中是否已有部分构建产物
    pause
    exit /b 1
)

echo.
echo ========================================
echo 构建成功!
echo ========================================
echo 产物位置: release\
echo.
pause
