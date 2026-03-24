# 提交并推送到 GitHub

请按照以下步骤操作，以触发 GitHub Actions 自动构建安装包：

## 步骤 1: 检查当前更改
```bash
cd E:\Github\openclaw-desktop
git status
```

## 步骤 2: 添加所有更改
```bash
git add .
```

## 步骤 3: 提交更改
```bash
git commit -m "feat: 准备使用 GitHub Actions 构建安装包

- 添加了构建脚本和文档
- 更新了 README
- 配置了 GitHub Actions 工作流"
```

## 步骤 4: 推送到 GitHub
```bash
git push origin master
```

## 步骤 5: 查看构建状态
推送成功后，访问以下链接查看 GitHub Actions 构建状态：
https://github.com/rshodoskar-star/openclaw-desktop/actions

---

**注意：**
- 如果遇到 "nothing to commit" 错误，说明没有需要提交的更改
- 如果遇到 "Your branch is up to date"，说明代码已经是最新的
- 构建成功后，安装包会出现在 GitHub 的 Releases 页面中
