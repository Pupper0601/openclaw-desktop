# AEGIS Desktop 构建指南

## 🚀 快速开始

### Windows 用户

```cmd
# 方式 1: 使用 Batch 脚本 (推荐)
cd scripts
build-all.bat

# 方式 2: 使用 npm 命令
npm run build:all

# 方式 3: 使用 Node.js 脚本 (跨平台)
node scripts/build.js
```

### macOS/Linux 用户

```bash
# 方式 1: 使用 Shell 脚本 (推荐)
cd scripts
chmod +x build-all.sh
./build-all.sh

# 方式 2: 使用 npm 命令
npm run build:all

# 方式 3: 使用 Node.js 脚本 (跨平台)
node scripts/build.js
```

---

## 📦 构建选项

### Windows 安装包

```bash
# Windows
build-all.bat --win

# 跨平台
node scripts/build.js --win
```

**输出**: `release/AEGIS-Desktop-Setup-5.6.0.exe`

### Windows 便携版

```bash
# Windows
build-all.bat --win --portable

# 跨平台
node scripts/build.js --win --portable
```

**输出**: `release/AEGIS-Desktop-5.6.0.exe` (无需安装,直接运行)

### macOS DMG

```bash
# macOS/Linux
./build-all.sh --mac

# 跨平台
node scripts/build.js --mac
```

**输出**: `release/AEGIS-Desktop-5.6.0.dmg`

### Linux AppImage

```bash
# macOS/Linux
./build-all.sh --linux

# 跨平台
node scripts/build.js --linux
```

**输出**: `release/AEGIS-Desktop-5.6.0.AppImage`

### 所有平台

```bash
# macOS/Linux
./build-all.sh --all

# 跨平台
node scripts/build.js --all
```

**注意**: 跨平台构建有限制:
- macOS 可以构建所有平台
- Windows 只能构建 Windows
- Linux 只能构建 Linux

---

## 🔧 高级选项

### 清理构建缓存

```bash
# Shell 脚本
./build-all.sh --clean

# Node.js 脚本
node scripts/build.js --clean

# npm 命令
npm run build:all:clean
```

清理内容:
- `dist/` - 渲染进程构建产物
- `dist-electron/` - Electron 主进程构建产物
- `node_modules/.vite/` - Vite 缓存

### 组合选项

```bash
# 清理缓存后构建 Windows 便携版
node scripts/build.js --clean --win --portable

# 清理缓存后构建所有平台
node scripts/build.js --clean --all
```

---

## 📋 脚本对比

| 脚本 | 平台 | 优点 | 缺点 |
|------|------|------|------|
| `build-all.bat` | Windows | 原生支持,速度快 | 只能在 Windows 使用 |
| `build-all.sh` | macOS/Linux | 原生支持,速度快 | 只能在 Unix 系统使用 |
| `build.js` | 所有平台 | 跨平台一致 | 需要安装 Node.js |

**推荐**: 在每个平台使用对应的原生脚本,获得最佳体验。

---

## 🛠️ 故障排除

### 问题 1: 构建失败,提示 "未找到 Node.js"

**解决方案**:
1. 安装 Node.js: https://nodejs.org/
2. 重启命令行窗口
3. 验证安装: `node -v`

---

### 问题 2: 构建失败,提示 "未找到 npm"

**解决方案**:
1. npm 通常随 Node.js 一起安装
2. 检查安装: `npm -v`
3. 如果仍失败,重新安装 Node.js

---

### 问题 3: 依赖安装失败

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules  # macOS/Linux
rmdir /s /q node_modules  # Windows

# 重新安装
npm install
```

---

### 问题 4: 构建卡住或非常慢

**解决方案**:
```bash
# 使用 --clean 选项清理缓存
node scripts/build.js --clean

# 或手动清理
rm -rf dist dist-electron node_modules/.vite
```

---

### 问题 5: Windows 安装包无法运行

**可能原因**:
1. 病毒扫描软件拦截
2. 缺少 VC++ 运行库
3. 签名问题

**解决方案**:
1. 临时关闭杀毒软件
2. 安装 [VC++ 运行库](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)
3. 右键 → 属性 → 解除锁定 (如适用)

---

### 问题 6: macOS 无法打开 DMG

**解决方案**:
```bash
# 检查 Gatekeeper 设置
xattr -cr release/AEGIS-Desktop-*.dmg

# 然后双击打开
```

---

### 问题 7: Linux AppImage 没有执行权限

**解决方案**:
```bash
chmod +x release/AEGIS-Desktop-*.AppImage

# 然后运行
./release/AEGIS-Desktop-*.AppImage
```

---

## 📊 构建产物说明

### Windows

| 文件类型 | 文件扩展名 | 说明 |
|----------|-----------|------|
| 安装包 | `.exe` | NSIS 安装程序,需要管理员权限 |
| 便携版 | `.exe` | 绿色版本,无需安装 |

### macOS

| 文件类型 | 文件扩展名 | 说明 |
|----------|-----------|------|
| 磁盘镜像 | `.dmg` | 拖拽到 Applications 文件夹 |

### Linux

| 文件类型 | 文件扩展名 | 说明 |
|----------|-----------|------|
| AppImage | `.AppImage` | 通用 Linux 包,无需安装 |

---

## 🎯 最佳实践

### 1. 开发前构建

```bash
# 先清理缓存
npm run build:all:clean

# 然后构建
npm run build:all
```

### 2. 版本发布前检查

```bash
# 1. 清理缓存
npm run build:all:clean

# 2. 构建所有平台 (在 macOS 上)
node scripts/build.js --all

# 3. 测试所有生成的安装包
#    - Windows: 在虚拟机中测试
#    - macOS: 在另一台 Mac 上测试
#    - Linux: 在不同发行版上测试
```

### 3. 自动化构建

创建 GitHub Actions workflow 自动构建:

```yaml
name: Build
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: node scripts/build.js
      - uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.os }}-build
          path: release/
```

---

## 🔐 代码签名

### Windows

修改 `package.json`:

```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password"
}
```

### macOS

修改 `package.json`:

```json
"mac": {
  "identity": "Developer ID Application: Your Name",
  "hardenedRuntime": true,
  "gatekeeperAssess": false
}
```

---

## 📝 版本号管理

修改 `package.json` 中的版本号:

```json
{
  "version": "5.6.1"
}
```

然后构建:

```bash
npm run build:all
```

生成的安装包会自动包含新版本号。

---

## 🎨 自定义构建

### 修改安装包图标

编辑 `package.json`:

```json
"win": {
  "icon": "assets/custom-icon.ico"
},
"mac": {
  "icon": "assets/custom-icon.icns"
}
```

### 修改安装程序语言

`package.json` 中已配置:

```json
"nsis": {
  "installerLanguages": [
    "en_US",
    "zh_CN"
  ]
}
```

---

## 📞 获取帮助

如果遇到问题:

1. 查看本文档的"故障排除"部分
2. 查看日志: `npm run build:all 2>&1 | tee build.log`
3. 提交 Issue: https://github.com/your-repo/issues

---

## 🎉 总结

**最简单的用法**:

| 平台 | 命令 |
|------|------|
| Windows | `scripts\build-all.bat` |
| macOS | `scripts/build-all.sh` |
| Linux | `scripts/build-all.sh` |
| 通用 | `node scripts/build.js` |

**记住**:
- ✅ 首次构建使用 `--clean` 清理缓存
- ✅ 使用 `--portable` 构建便携版
- ✅ 使用 `--all` 构建所有平台 (仅 macOS)
- ✅ 构建产物都在 `release/` 目录

祝你构建顺利! 🚀
