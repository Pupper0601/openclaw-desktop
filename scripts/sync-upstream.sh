#!/bin/bash

# ==============================================================================
# 与原作者仓库同步的自动化脚本
# ==============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  与原作者仓库同步${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查是否在正确的目录
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 错误: 请在 git 仓库根目录运行此脚本${NC}"
    exit 1
fi

# 检查 upstream 是否配置
if ! git remote | grep -q "upstream"; then
    echo -e "${YELLOW}⚠️  未检测到 upstream 远程仓库${NC}"
    echo ""
    read -p "是否添加原作者仓库为 upstream? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote add upstream https://github.com/AegisStar/aegis-desktop.git
        echo -e "${GREEN}✅ 已添加 upstream 远程仓库${NC}"
    else
        echo -e "${RED}❌ 取消操作${NC}"
        exit 1
    fi
fi

# 当前分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}📌 当前分支: ${CURRENT_BRANCH}${NC}"

# 如果不是 master 分支,询问是否切换
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  建议在 master 分支进行同步${NC}"
    read -p "是否切换到 master 分支? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout master
        echo -e "${GREEN}✅ 已切换到 master 分支${NC}"
    else
        echo -e "${RED}❌ 请先切换到 master 分支再运行此脚本${NC}"
        exit 1
    fi
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ 检测到未提交的更改${NC}"
    git status --short
    echo ""
    read -p "是否暂存这些更改? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash
        echo -e "${GREEN}✅ 已暂存更改${NC}"
    else
        echo -e "${RED}❌ 请先提交或暂存更改${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: 拉取上游更新
echo -e "${BLUE}📥 Step 1/5: 拉取上游更新...${NC}"
git fetch upstream
echo -e "${GREEN}✅ 已拉取上游更新${NC}"
echo ""

# Step 2: 检查是否有新提交
LOCAL=$(git rev-parse master)
REMOTE=$(git rev-parse upstream/master)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✅ 已经是最新的,无需同步${NC}"
    exit 0
fi

# 显示差异
echo -e "${BLUE}📊 检测到新的更新:${NC}"
echo "   上游提交数: $(git rev-list --count $LOCAL..$REMOTE)"
echo ""

# Step 3: 合并上游更新
echo -e "${BLUE}🔀 Step 2/5: 合并上游更新...${NC}"
if git merge upstream/master; then
    echo -e "${GREEN}✅ 合并成功${NC}"
else
    echo -e "${RED}❌ 合并冲突!需要手动解决${NC}"
    echo ""
    echo "请运行以下命令查看冲突:"
    echo "  git status"
    echo "  git diff"
    echo ""
    echo "解决冲突后运行:"
    echo "  git add <resolved-files>"
    echo "  git commit"
    exit 1
fi
echo ""

# Step 4: 检查翻译完整性
echo -e "${BLUE}🔍 Step 3/5: 检查翻译完整性...${NC}"
if node scripts/check-translation-sync.js; then
    echo -e "${GREEN}✅ 翻译检查通过${NC}"
else
    echo -e "${YELLOW}⚠️  翻译检查发现问题${NC}"
    echo "请先补充缺失的中文翻译后再继续"
    exit 1
fi
echo ""

# Step 5: 构建检查(可选)
echo -e "${BLUE}🏗️  Step 4/5: 检查代码...${NC}"
if command -v npm &> /dev/null; then
    echo "   运行 TypeScript 检查..."
    if npm run type-check 2>/dev/null || npx tsc --noEmit 2>/dev/null; then
        echo -e "${GREEN}✅ TypeScript 检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  TypeScript 检查发现问题${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  未找到 npm,跳过代码检查${NC}"
fi
echo ""

# Step 6: 创建备份标签
SYNC_DATE=$(date +%Y-%m-%d)
TAG_NAME="sync-$SYNC_DATE"

echo -e "${BLUE}🏷️  Step 5/5: 创建同步标签...${NC}"
if git tag $TAG_NAME 2>/dev/null; then
    echo -e "${GREEN}✅ 已创建标签: $TAG_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  标签已存在: $TAG_NAME${NC}"
fi
echo ""

# 完成
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 同步完成!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 下一步操作:"
echo "   1. 运行应用测试新功能:"
echo "      npm run dev"
echo ""
echo "   2. 确认无误后推送到你的仓库:"
echo "      git push origin master"
echo "      git push origin $TAG_NAME"
echo ""
echo "   3. 查看上游更新日志:"
echo "      git log $(git merge-base master upstream/master)..upstream/master --oneline"
echo ""

# 如果之前有 stash,询问是否恢复
if git stash list | grep -q "stash"; then
    read -p "是否恢复之前暂存的更改? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash pop
        echo -e "${GREEN}✅ 已恢复暂存的更改${NC}"
    fi
fi

echo -e "${GREEN}🎉 所有操作完成!${NC}"
