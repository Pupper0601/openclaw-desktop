# 工作流快速参考

## 工作流清单

### ✅ 01-检查上游更新.yml
- **触发方式**：每12小时自动 + 手动
- **功能**：检查上游是否有新提交
- **输出**：检测到更新时触发02号工作流

### ✅ 02-合并上游更新.yml
- **触发方式**：01号工作流触发 + 手动
- **功能**：
  - 自动合并上游更新
  - 检测到 `src/locales/en.json` 变更时，自动翻译并更新 `src/locales/zh.json`
  - 使用百度翻译API（Key: 0D5P_d73tjvrb1hv2c1drokfg）
  - 冲突时创建PR并创建GitHub Issue通知
- **输出**：合并成功后触发03号工作流

### ✅ 03-构建发布.yml
- **触发方式**：02号工作流触发 + 手动
- **功能**：
  - 构建Windows和macOS应用
  - 构建失败时创建GitHub Issue通知
  - 自动创建GitHub Release
  - 上传安装包（.exe 和 .dmg）

## 必需配置

### 1. GitHub Personal Access Token
在仓库 Secrets 中添加：
```
Name: PAT
Value: <你的GitHub Token>
```

### 2. 百度翻译API（可选）
如需更换API Key，在仓库 Secrets 中添加：
```
Name: BAIDU_API_KEY
Value: <你的百度翻译API Key>
```

## 使用流程

### 完全自动模式（推荐）
1. 无需任何操作，系统每12小时自动检查
2. 检测到更新 → 自动合并 → 自动翻译 → 自动构建 → 自动发布
3. 有冲突或错误时会自动创建Issue通知你

### 手动模式
1. **手动检查**：Actions → 01-检查上游更新 → Run workflow
2. **手动合并**：Actions → 02-合并上游更新 → Run workflow
3. **手动构建**：Actions → 03-构建发布 → Run workflow

## 通知方式

### GitHub Issue通知（自动创建）
- **合并冲突**：创建Issue，标题"上游合并冲突 - 日期"
- **构建失败**：创建Issue，标题"构建失败 - 日期"

### 查看通知
1. 关注仓库（Watch → All Activity）
2. 查看Issues页面
3. 查看Actions页面

## 翻译功能说明

### 自动翻译
- 合并上游更新时自动触发
- 检测 `en.json` 中新增的键
- 使用百度翻译API翻译成中文
- 更新 `zh.json` 文件并提交

### 翻译示例
```javascript
// en.json
{
  "newFeature": "New feature added"
}

// 自动翻译后 zh.json
{
  "newFeature": "新增功能"  // 百度翻译结果
}
```

### 翻译限制
- 免费版百度翻译有QPS和字数限制
- 专业术语可能需要手动调整
- 超大JSON文件可能翻译较慢

## 故障排查

### 工作流没运行
- 检查是否配置了 `PAT`
- 检查Actions是否有权限
- 查看仓库Actions设置是否启用

### 翻译没生效
- 检查 `src/locales/en.json` 是否有变更
- 查看工作流日志中的翻译步骤
- 检查百度翻译API是否正常工作

### 构建失败
- 查看工作流详细日志
- 本地测试构建流程
- 检查依赖是否安装成功

### 没收到通知
- 确认已Watch仓库
- 检查GitHub通知设置
- 查看仓库Issues页面

## 文件结构

```
.github/workflows/
├── 01-检查上游更新.yml      # 定时检查上游
├── 02-合并上游更新.yml      # 合并+翻译
├── 03-构建发布.yml          # 构建+发布
├── 配置说明.md              # 详细配置文档
└── README.md                # 本文件
```

## 快速开始

1. **配置PAT**（必需）
   ```bash
   # 前往 GitHub Settings → Developer settings → Personal access tokens
   # 生成Token并添加到仓库Secrets: PAT
   ```

2. **测试工作流**
   ```bash
   # 手动触发01号工作流测试
   Actions → 01-检查上游更新 → Run workflow
   ```

3. **查看结果**
   ```bash
   # 查看Actions页面
   # 查看是否创建了Release
   # 查看是否有Issue通知
   ```

## 版本号规则

自动构建使用格式：`1.0.${run_number}`

例如：
- 第1次构建：`v1.0.1`
- 第2次构建：`v1.0.2`
- 第42次构建：`v1.0.42`

手动构建可在表单中指定版本号。

## 构建产物

成功构建后会生成：
- **Windows**：`.exe` 安装程序
- **macOS**：`.dmg` 安装程序

构建产物会：
1. 上传到GitHub Release
2. 保存为Artifacts（7天）
3. 可通过Actions页面下载
