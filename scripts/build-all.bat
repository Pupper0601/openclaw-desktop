@echo off
REM ═══════════════════════════════════════════════════════════════
REM AEGIS Desktop - Windows Build Script
REM ═══════════════════════════════════════════════════════════════
REM 支持: Windows, macOS (仅限在 macOS 上), Linux (仅限在 Linux 上)
REM ═══════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

REM 进入项目根目录
cd /d "%PROJECT_ROOT%"

REM 解析参数
set BUILD_ALL=0
set BUILD_WIN=1
set BUILD_MAC=0
set BUILD_LINUX=0
set CLEAN=0
set PORTABLE=0

:parse_args
if "%~1"=="" goto end_parse_args
if /i "%~1"=="--all" (
    set BUILD_ALL=1
    shift
    goto parse_args
)
if /i "%~1"=="--win" (
    set BUILD_WIN=1
    shift
    goto parse_args
)
if /i "%~1"=="--mac" (
    set BUILD_MAC=1
    shift
    goto parse_args
)
if /i "%~1"=="--linux" (
    set BUILD_LINUX=1
    shift
    goto parse_args
)
if /i "%~1"=="--clean" (
    set CLEAN=1
    shift
    goto parse_args
)
if /i "%~1"=="--portable" (
    set PORTABLE=1
    shift
    goto parse_args
)
if /i "%~1"=="-h" goto show_help
if /i "%~1"=="--help" goto show_help
echo 未知选项: %~1
echo 使用 -h 或 --help 查看帮助
exit /b 1

:end_parse_args

REM 显示标题
echo.
echo ════════════════════════════════════════════════════════════════
echo   AEGIS Desktop Build Script
echo ════════════════════════════════════════════════════════════════
echo.

echo [信息] 检测到平台: Windows

REM 清理构建缓存
if %CLEAN%==1 (
    echo [信息] 清理构建缓存...
    if exist dist rmdir /s /q dist
    if exist dist-electron rmdir /s /q dist-electron
    if exist node_modules\.vite rmdir /s /q node_modules\.vite
    echo [成功] 清理完成
    echo.
)

REM 检查 Node.js
echo [信息] 检查 Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js,请先安装
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [成功] Node.js 版本: %NODE_VERSION%

REM 检查 npm
echo [信息] 检查 npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 npm,请先安装
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [成功] npm 版本: %NPM_VERSION%
echo.

REM 安装依赖
echo [信息] 检查依赖...
if not exist node_modules (
    echo [信息] 安装依赖...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        exit /b 1
    )
    echo [成功] 依赖安装完成
    echo.
) else (
    echo [成功] 依赖已存在,跳过安装 (使用 --clean 强制重新安装)
    echo.
)

REM 记录开始时间
set START_TIME=%TIME%

REM 构建函数
:build_project
    echo [信息] 构建 Electron 主进程...
    call npm run build:electron
    if errorlevel 1 (
        echo [错误] Electron 主进程构建失败
        exit /b 1
    )
    echo [成功] Electron 主进程构建完成

    echo [信息] 构建渲染进程...
    call npm run build:renderer
    if errorlevel 1 (
        echo [错误] 渲染进程构建失败
        exit /b 1
    )
    echo [成功] 渲染进程构建完成
goto :eof

:build_windows
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo   构建 Windows 版本
    echo ════════════════════════════════════════════════════════════════
    echo.

    call :build_project

    if %PORTABLE%==1 (
        echo [信息] 构建 Windows 便携版...
        call npx electron-builder --win portable --x64
        if errorlevel 1 (
            echo [错误] Windows 便携版构建失败
            exit /b 1
        )
        echo [成功] Windows 便携版构建完成
    ) else (
        echo [信息] 构建 Windows 安装包...
        call npx electron-builder --win --x64
        if errorlevel 1 (
            echo [错误] Windows 安装包构建失败
            exit /b 1
        )
        echo [成功] Windows 安装包构建完成
    )

    echo [成功] 构建产物位于: release/
goto :eof

REM 执行构建
if %BUILD_ALL%==1 (
    echo [警告] 构建所有平台可能需要较长时间...
    echo [警告] 在 Windows 上只能构建 Windows 版本
    call :build_windows
) else (
    if %BUILD_WIN%==1 (
        call :build_windows
    )

    if %BUILD_MAC%==1 (
        echo [错误] 在 Windows 上无法构建 macOS 版本
        echo [提示] 请在 macOS 上运行此脚本
    )

    if %BUILD_LINUX%==1 (
        echo [错误] 在 Windows 上无法构建 Linux 版本
        echo [提示] 请在 Linux 上运行此脚本
    )
)

REM 计算耗时
set END_TIME=%TIME%

REM 显示构建结果
echo.
echo ════════════════════════════════════════════════════════════════
echo   构建完成!
echo ════════════════════════════════════════════════════════════════
echo.

REM 列出生成的文件
if exist release\*.exe (
    echo [信息] 生成的安装包:
    dir /b release\*.exe
    echo.
)

echo [成功] 所有构建任务已完成!
echo.
echo [提示]:
echo   - Windows 安装包位于: release\
echo   - 可以使用 --help 查看所有选项
echo   - 下次构建可以使用 --clean 清理缓存
echo.
pause
exit /b 0

:show_help
echo.
echo 用法: %~n0 [选项]
echo.
echo 选项:
echo   --all        构建所有平台 (Windows + macOS + Linux)
echo   --win        只构建 Windows
echo   --mac        只构建 macOS
echo   --linux      只构建 Linux
echo   --portable   构建 Windows 便携版
echo   --clean      清理构建缓存
echo   -h, --help   显示此帮助信息
echo.
echo 示例:
echo   %~n0 --all           # 构建所有平台
echo   %~n0 --win --portable # 构建 Windows 便携版
echo   %~n0 --clean --all    # 清理后构建所有平台
echo.
exit /b 0
