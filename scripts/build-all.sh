#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AEGIS Desktop - Cross-Platform Build Script
# ═══════════════════════════════════════════════════════════════
# 支持: Windows, macOS, Linux
# ═══════════════════════════════════════════════════════════════

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 进入项目根目录
cd "$PROJECT_ROOT"

# 解析命令行参数
BUILD_WIN=false
BUILD_MAC=false
BUILD_LINUX=false
BUILD_ALL=false
CLEAN=false
PORTABLE=false

print_header "AEGIS Desktop Build Script"

# 检测操作系统
OS="$(uname -s)"
case "$OS" in
    Darwin*)
        PLATFORM="macOS"
        BUILD_MAC=true
        ;;
    Linux*)
        PLATFORM="Linux"
        BUILD_LINUX=true
        ;;
    MINGW*|MSYS*|CYGWIN*)
        PLATFORM="Windows"
        BUILD_WIN=true
        ;;
    *)
        print_error "不支持的操作系统: $OS"
        exit 1
        ;;
esac

print_step "检测到平台: $PLATFORM"

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            BUILD_ALL=true
            shift
            ;;
        --win)
            BUILD_WIN=true
            shift
            ;;
        --mac)
            BUILD_MAC=true
            shift
            ;;
        --linux)
            BUILD_LINUX=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --portable)
            PORTABLE=true
            shift
            ;;
        -h|--help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --all        构建所有平台 (Windows + macOS + Linux)"
            echo "  --win        只构建 Windows"
            echo "  --mac        只构建 macOS"
            echo "  --linux      只构建 Linux"
            echo "  --portable   构建 Windows 便携版"
            echo "  --clean      清理构建缓存"
            echo "  -h, --help   显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 --all           # 构建所有平台"
            echo "  $0 --win --portable # 构建 Windows 便携版"
            echo "  $0 --clean --all    # 清理后构建所有平台"
            exit 0
            ;;
        *)
            print_error "未知选项: $1"
            echo "使用 -h 或 --help 查看帮助"
            exit 1
            ;;
    esac
done

# 如果没有指定任何平台,构建当前平台
if [ "$BUILD_ALL" = false ] && [ "$BUILD_WIN" = false ] && [ "$BUILD_MAC" = false ] && [ "$BUILD_LINUX" = false ]; then
    print_step "未指定平台,将构建当前平台 ($PLATFORM)"
fi

# 清理构建缓存
if [ "$CLEAN" = true ]; then
    print_step "清理构建缓存..."
    rm -rf dist
    rm -rf dist-electron
    rm -rf node_modules/.vite
    print_success "清理完成"
fi

# 检查 Node.js
print_step "检查 Node.js..."
if ! command -v node &> /dev/null; then
    print_error "未找到 Node.js,请先安装"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js 版本: $NODE_VERSION"

# 检查 npm
print_step "检查 npm..."
if ! command -v npm &> /dev/null; then
    print_error "未找到 npm,请先安装"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm 版本: $NPM_VERSION"

# 安装依赖
print_step "安装依赖..."
if [ ! -d "node_modules" ]; then
    npm install
    print_success "依赖安装完成"
else
    print_success "依赖已存在,跳过安装 (使用 --clean 强制重新安装)"
fi

# 构建步骤
build_project() {
    print_step "构建 Electron 主进程..."
    npm run build:electron
    print_success "Electron 主进程构建完成"

    print_step "构建渲染进程..."
    npm run build:renderer
    print_success "渲染进程构建完成"
}

build_windows() {
    print_header "构建 Windows 版本"

    build_project

    if [ "$PORTABLE" = true ]; then
        print_step "构建 Windows 便携版..."
        npx electron-builder --win portable --x64
        print_success "Windows 便携版构建完成"
    else
        print_step "构建 Windows 安装包..."
        npx electron-builder --win --x64
        print_success "Windows 安装包构建完成"
    fi

    print_success "构建产物位于: release/"
}

build_macos() {
    print_header "构建 macOS 版本"

    build_project

    print_step "构建 macOS DMG..."
    npx electron-builder --mac --x64 --arm64
    print_success "macOS DMG 构建完成"

    print_success "构建产物位于: release/"
}

build_linux() {
    print_header "构建 Linux 版本"

    build_project

    print_step "构建 Linux AppImage..."
    npx electron-builder --linux --x64
    print_success "Linux AppImage 构建完成"

    print_success "构建产物位于: release/"
}

# 执行构建
START_TIME=$(date +%s)

if [ "$BUILD_ALL" = true ]; then
    print_warning "构建所有平台可能需要较长时间..."

    # 在 macOS 上构建所有平台需要额外的准备
    if [ "$PLATFORM" = "macOS" ]; then
        build_windows
        build_macos
        build_linux
    elif [ "$PLATFORM" = "Linux" ]; then
        # Linux 无法构建 macOS 和 Windows 可执行文件
        print_warning "Linux 只能构建 Linux 版本"
        build_linux
    else
        # Windows 无法构建 macOS 可执行文件
        print_warning "Windows 只能构建 Windows 版本"
        build_windows
    fi
else
    if [ "$BUILD_WIN" = true ]; then
        build_windows
    fi

    if [ "$BUILD_MAC" = true ]; then
        build_macos
    fi

    if [ "$BUILD_LINUX" = true ]; then
        build_linux
    fi
fi

# 计算耗时
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# 显示构建结果
print_header "构建完成!"

echo -e "${GREEN}总耗时: ${MINUTES}分 ${SECONDS}秒${NC}"
echo ""

# 列出生成的文件
if [ -d "release" ]; then
    print_step "生成的安装包:"
    ls -lh release/*.exe release/*.dmg release/*.AppImage 2>/dev/null | while read -r line; do
        echo "  $line"
    done
    echo ""
fi

print_success "所有构建任务已完成!"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "  - Windows 安装包位于: release/"
echo "  - 可以使用 --help 查看所有选项"
echo "  - 下次构建可以使用 --clean 清理缓存"
