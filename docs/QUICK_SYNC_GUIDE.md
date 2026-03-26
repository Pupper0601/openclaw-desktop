# 🔄 快速同步指南

## 常用命令速查

### 📅 每周同步一次

```bash
# 切换到脚本目录
cd e:/Github/openclaw-desktop/scripts

# 运行一键同步脚本(Windows 用户用 Git Bash)
bash sync-upstream.sh
```

### 🔧 手动同步步骤

```bash
cd e:/Github/openclaw-desktop

# 1. 拉取上游
git fetch upstream

# 2. 合并
git merge upstream/master

# 3. 解决冲突(如果有)
# 编辑冲突文件后:
git add <解决冲突的文件>
git commit

# 4. 检查翻译
node scripts/check-translation-sync.js

# 5. 测试应用
npm run dev

# 6. 推送
git push origin master
```

### 🔍 查看上游更新内容

```bash
# 查看上游的新提交
git log $(git merge-base master upstream/master)..upstream/master --oneline

# 查看详细改动
git diff upstream/master..master
```

## ⚠️ 常见冲突快速解决

### 文件: src/i18n.ts
```typescript
// ❌ 删除: import ar from './locales/ar.json';
// ✅ 保留: import zh from './locales/zh.json';
```

### 文件: src/locales/*.json
- 保留上游新增的英语键
- 同步翻译到中文文件

### 文件: package.json
```json
// ✅ 保持: "zh_CN"
// ❌ 删除: "ar_SA"
```

## 📞 遇到问题?

1. **冲突太多**: 运行 `git merge --abort` 并重新开始
2. **翻译缺失**: 运行 `node scripts/check-translation-sync.js` 查看详情
3. **代码错误**: 检查 TypeScript 错误 `npx tsc --noEmit`

## 📚 详细文档

完整指南请查看: [SYNC_UPSTREAM_GUIDE.md](./SYNC_UPSTREAM_GUIDE.md)
