# 与原作者保持同步的工作流程

## 📌 前置准备

### 1. 添加原作者仓库作为 upstream
```bash
cd e:/Github/openclaw-desktop
git remote add upstream https://github.com/AegisStar/aegis-desktop.git
git fetch upstream
```

### 2. 创建中文特性分支(可选,推荐)
```bash
# 创建一个专门的中文开发分支
git checkout -b chinese-i18n
```

## 🔄 日常同步流程

### 方案 A: 定期合并上游更新(推荐)

#### 每周/每次上游更新时执行:

```bash
# 1. 切换到主分支
git checkout master

# 2. 确保本地 master 是最新的
git pull origin master

# 3. 拉取上游最新更新
git fetch upstream

# 4. 合并上游的 master 分支
git merge upstream/master

# 5. 解决冲突(见下文)
# ... 解决冲突后 ...

# 6. 提交合并
git commit -m "chore: sync with upstream master - 保留中文修改"

# 7. 推送到你的仓库
git push origin master
```

### 方案 B: 使用 Rebase(更干净的历史)

```bash
# 1. 切换到主分支
git checkout master

# 2. 拉取上游更新
git fetch upstream

# 3. Rebase 你的修改到上游最新代码之上
git rebase upstream/master

# 4. 如果有冲突,逐个解决
# git add <解决冲突的文件>
# git rebase --continue

# 5. 强制推送(rebase 改变了历史)
git push origin master --force-with-lease
```

## ⚠️ 解决冲突指南

### 冲突类型 1: i18n 配置文件

**文件**: `src/i18n.ts`

#### 冲突示例:
```typescript
<<<<<<< HEAD (你的修改)
import en from './locales/en.json';
import zh from './locales/zh.json';
=======
import ar from './locales/ar.json';
import en from './locales/en.json';
>>>>>>> upstream/master (原作者)
```

#### 解决方式:
```typescript
// 选择你的修改,删除阿拉伯语
import en from './locales/en.json';
import zh from './locales/zh.json';
```

### 冲突类型 2: 语言文件

**文件**: `src/locales/en.json`

#### 如果作者添加了新的翻译键:
```json
<<<<<<< HEAD
{
  "app": {
    "name": "AEGIS"
    // ... 你的现有内容
  }
}
=======
{
  "app": {
    "name": "AEGIS",
    "newFeature": "New Feature from Author"  // 新增的内容
  }
}
>>>>>>> upstream/master
```

#### 解决方式:
```json
{
  "app": {
    "name": "AEGIS",
    "newFeature": "New Feature from Author"  // 保留新增内容
    // ... 其他内容
  }
}
```

#### 然后同步到中文文件 `src/locales/zh.json`:
```json
{
  "app": {
    "name": "AEGIS",
    "newFeature": "新功能"  // 添加中文翻译
    // ... 其他内容
  }
}
```

### 冲突类型 3: package.json

**文件**: `package.json`

#### 冲突示例:
```json
<<<<<<< HEAD
  "installerLanguages": [
    "en_US",
    "zh_CN"
  ]
=======
  "installerLanguages": [
    "en_US",
    "ar_SA"
  ]
>>>>>>> upstream/master
```

#### 解决方式:
```json
  "installerLanguages": [
    "en_US",
    "zh_CN"  // 保持中文
  ]
```

### 冲突类型 4: TypeScript 类型

**文件**: `src/types/global.d.ts`, `src/stores/settingsStore.ts`

#### 冲突示例:
```typescript
<<<<<<< HEAD
interface SettingsState {
  language: 'zh' | 'en';
=======
interface SettingsState {
  language: 'ar' | 'en';
>>>>>>> upstream/master
```

#### 解决方式:
```typescript
interface SettingsState {
  language: 'zh' | 'en';  // 保持中文
```

### 冲突类型 5: 语言检测逻辑

**文件**: `src/components/CommandPalette.tsx`, `src/pages/SettingsPage.tsx`

#### 冲突示例:
```typescript
<<<<<<< HEAD
if (language === 'zh') {
=======
if (language === 'ar') {
>>>>>>> upstream/master
```

#### 解决方式:
```typescript
if (language === 'zh') {  // 保持中文逻辑
```

## 🛠️ 实用脚本

### 自动检测新增的翻译键

创建脚本 `scripts/check-translation-sync.js`:

```javascript
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../src/locales/en.json');
const zhPath = path.join(__dirname, '../src/locales/zh.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const zh = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

function findMissingKeys(obj1, obj2, prefix = '') {
  const missing = [];
  for (const key in obj1) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (!(key in obj2)) {
      missing.push(fullPath);
    } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      missing.push(...findMissingKeys(obj1[key], obj2[key], fullPath));
    }
  }
  return missing;
}

const missingKeys = findMissingKeys(en, zh);

if (missingKeys.length > 0) {
  console.log('⚠️  缺失的中文翻译键:');
  missingKeys.forEach(key => console.log(`  - ${key}`));
  process.exit(1);
} else {
  console.log('✅ 所有翻译键已同步');
  process.exit(0);
}
```

使用方法:
```bash
node scripts/check-translation-sync.js
```

### 同步脚本

创建 `scripts/sync-upstream.sh`:

```bash
#!/bin/bash

echo "🔄 开始同步上游更新..."

# 1. 拉取上游更新
echo "📥 拉取上游更新..."
git fetch upstream

# 2. 合并
echo "🔀 合并上游更新..."
git merge upstream/master

# 3. 检查翻译
echo "🔍 检查翻译完整性..."
node scripts/check-translation-sync.js

if [ $? -eq 0 ]; then
  echo "✅ 同步完成!"
  echo "📝 请手动测试新功能"
else
  echo "❌ 发现缺失翻译,请先补充完整"
fi
```

## 📋 同步检查清单

在每次同步后,请检查以下内容:

### ✅ 功能测试
- [ ] 应用能正常启动
- [ ] 中文界面显示正常
- [ ] 英语界面显示正常
- [ ] 语言切换功能正常
- [ ] 设置页面语言选择正常

### ✅ 翻译完整性
- [ ] 运行翻译检查脚本无错误
- [ ] 检查新增功能是否都有中文翻译
- [ ] 测试新增功能的中文显示

### ✅ 代码检查
- [ ] 无 TypeScript 类型错误
- [ ] 无 Lint 警告
- [ ] 所有 `ar` 相关代码已移除
- [ ] 中文语言代码 `zh` 正确

## 🎯 最佳实践

### 1. 保持提交历史清晰
```bash
# 合并提交时使用有意义的提交信息
git commit -m "chore: sync upstream [日期] - 保留中文修改"

# 如果需要多个提交
git commit -m "fix: resolve i18n conflicts"
git commit -m "i18n: add missing translations for new features"
```

### 2. 使用 Git Tags 标记重要版本
```bash
# 同步完成后打标签
git tag sync-2025-03-23
git push origin sync-2025-03-23
```

### 3. 定期备份中文翻译
```bash
# 每次同步前备份
cp src/locales/zh.json src/locales/zh.json.backup
```

### 4. 监控上游更新
- Star 原作者仓库: https://github.com/AegisStar/aegis-desktop
- Watch 仓库的 Releases 和 Pull Requests
- 设置 GitHub 通知

## 🚨 常见问题

### Q1: 作者更新了很多内容,冲突太多怎么办?
**A**: 
```bash
# 创建临时分支
git checkout -b sync-temp

# 尝试合并
git merge upstream/master

# 如果冲突太多,放弃合并
git merge --abort

# 使用 Cherry-pick 逐个挑选需要的提交
git cherry-pick <commit-hash>
```

### Q2: 作者添加了新语言怎么办?
**A**: 
- 评估是否需要添加该语言
- 如果需要,按照当前的中文模式添加
- 更新 `src/i18n.ts` 中的语言检测逻辑

### Q3: 中文翻译文件变得很混乱怎么办?
**A**: 
```bash
# 使用工具格式化 JSON
npm install -g prettier
prettier --write src/locales/zh.json

# 或使用在线工具: https://jsonlint.com/
```

### Q4: 如何避免频繁的合并冲突?
**A**: 
- 保持与上游的同步频率(建议每周一次)
- 不要长时间停留在旧版本
- 使用 Rebase 保持线性历史

## 📞 获取帮助

如果遇到问题:
1. 查看 Git 历史了解之前的冲突解决方式
2. 参考本文档的冲突解决指南
3. 使用 `git help <command>` 查看具体命令帮助

## 🎓 学习资源

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git 书籍](https://git-scm.com/book/zh/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**最后更新**: 2025-03-23
**维护者**: Your Name
