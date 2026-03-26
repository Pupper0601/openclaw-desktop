<div align="center">
  <img src="https://raw.githubusercontent.com/openclaw/openclaw/main/ui/public/apple-touch-icon.png" width="96" alt="OpenClaw" />
  <h1>AEGIS Desktop</h1>
  <p><strong>将你的 OpenClaw Gateway 升级为完整的任务控制中心的桌面客户端。</strong></p>
</div>

---

![Electron](https://img.shields.io/badge/Electron-34-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![OpenClaw](https://img.shields.io/badge/OpenClaw-2026.3.12+-blueviolet)
![License](https://img.shields.io/badge/License-MIT-green)
![中文支持](https://img.shields.io/badge/中文支持-🇨🇳-red)

---

## 💝 致谢

本项目是 [AEGIS Desktop](https://github.com/AegisStar/aegis-desktop) 的一个中文改编版本。

**特别感谢原作者 [Rashed (AegisStar)](https://github.com/AegisStar)** 创建了这个优秀的项目!

原项目是一个功能强大、设计精美的 OpenClaw Gateway 桌面客户端,本文档的所有功能特性都归功于原作者的杰出工作。

**本版本所做的改动:**
- ✨ 移除阿拉伯语支持
- ✨ 添加完整中文支持 (简体中文)
- ✨ 优化中文界面显示
- ✨ 更新安装程序语言选项

**原项目地址:** https://github.com/AegisStar/aegis-desktop

如果您喜欢这个项目,请给原作者的仓库点个 ⭐ Star!

---

## 🤔 为什么选择 AEGIS Desktop?

OpenClaw 强大无比 —— 但通过终端或基本的网页聊天来管理它,还有很多提升空间。AEGIS Desktop 为它提供了一个完美的家:

- 💬 **聊天** —— 流式响应、Artifacts、图片、语音、聊天内搜索、多标签会话
- 🎤 **语音聊天** —— 由 Gemini Live 驱动的实时语音对话,配合智能 Gateway 中继
- 🔘 **智能快速回复** —— 当 AI 需要你做决定时提供可点击按钮
- 📅 **日历** —— 完整日历,通过 Cron 驱动的提醒发送到 Telegram、Discord 或 WhatsApp
- 📊 **分析** —— 清晰查看你的花费去向,按模型和 Agent 细分
- 🤖 **Agent Hub** —— 从单个面板管理所有 Agent
- ⏰ **Cron 监控器** —— 可视化调度和控制任务
- ⚙️ **配置管理器** —— 使用智能合并编辑 OpenClaw 配置(保留外部编辑)
- 🧩 **插件** —— 模块化系统,内置 8 个插件,内联渲染,持久化状态
- 🔧 **技能 & 终端** —— 浏览市场并在不离开应用的情况下运行 Shell 命令
- 🌍 **双语支持** —— 完整的中文和英语支持

如果你运行 OpenClaw,AEGIS Desktop 就是它值得拥有的 UI。

---

## 📸 截图

<table align="center">
  <tr>
    <td align="center" width="33%">
      <a href="#聊天">
        <img src="screenshots/chat.gif" width="100%" alt="聊天" />
      </a>
      <p align="center"><a href="#聊天">💬 聊天</a></p>
    </td>
    <td align="center" width="33%">
      <a href="#快速回复">
        <img src="screenshots/quick-replies.gif" width="100%" alt="智能快速回复" />
      </a>
      <p align="center"><a href="#快速回复">🔘 智能快速回复</a></p>
    </td>
    <td align="center" width="33%">
      <a href="#技能市场">
        <img src="screenshots/Skills.gif" width="100%" alt="技能市场" />
      </a>
      <p align="center"><a href="#技能市场">🔧 技能市场</a></p>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <a href="#集成终端">
        <img src="screenshots/Terminal.gif" width="100%" alt="集成终端" />
      </a>
      <p align="center"><a href="#集成终端">💻 集成终端</a></p>
    </td>
    <td align="center" width="33%">
      <a href="#语音聊天">
        <img src="screenshots/voice%20chat.gif" width="100%" alt="语音聊天" />
      </a>
      <p align="center"><a href="#语音聊天">🎤 语音聊天</a></p>
    </td>
    <td align="center" width="33%">
      <a href="#插件系统">
        <img src="screenshots/Plugins.gif" width="100%" alt="插件系统" />
      </a>
      <p align="center"><a href="#插件系统">🧩 插件系统</a></p>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <a href="#暗色模式">
        <img src="screenshots/pages-dark.gif" width="100%" alt="暗色模式" />
      </a>
      <p align="center"><a href="#暗色模式">🌑 暗色模式</a></p>
    </td>
    <td align="center" width="33%">
      <a href="#亮色模式">
        <img src="screenshots/pages-light.gif" width="100%" alt="亮色模式" />
      </a>
      <p align="center"><a href="#亮色模式">🌕 亮色模式</a></p>
    </td>
  </tr>
</table>

---

<details>
<summary><strong>📸 点击查看完整截图说明</strong></summary>

<a id="聊天"></a>
### 💬 聊天
![聊天](screenshots/chat.gif)

<a id="快速回复"></a>
### 🔘 智能快速回复按钮
![快速回复](screenshots/quick-replies.gif)

<a id="技能市场"></a>
### 🔧 技能市场
![技能](screenshots/Skills.gif)

<a id="集成终端"></a>
### 💻 集成终端
![终端](screenshots/Terminal.gif)

<a id="语音聊天"></a>
### 🎤 语音聊天
![语音聊天](screenshots/voice%20chat.gif)

<a id="插件系统"></a>
### 🧩 插件系统
![插件](screenshots/Plugins.gif)

<a id="暗色模式"></a>
### 🌑 暗色模式
![暗色模式](screenshots/pages-dark.gif)

<a id="亮色模式"></a>
### 🌕 亮色模式
![亮色模式](screenshots/pages-light.gif)

</details>

---

## ✨ 功能特性

### 💬 聊天与通信
- 流式 Markdown,支持语法高亮和主题感知的代码块
- 使用 `Ctrl+Tab` 切换的多标签会话
- 智能快速回复按钮 —— AI 呈现可点击的 `[[button:标签]]` 芯片
- 聊天内搜索 (`Ctrl+F`) 支持结果导航
- 图片粘贴/拖拽/上传、文件附件、视频播放、语音消息
- Artifacts 预览 —— 在沙盒窗口中交互式显示 HTML、React、SVG 和 Mermaid
- Virtuoso 虚拟化列表,支持长对话的平滑滚动
- 消息队列,重连时自动发送

### 📅 日历
- 月、周和日视图,包含逐小时时间轴
- 添加、编辑和删除事件,支持颜色编码分类(工作、个人、健康、社交、其他)
- 重复事件 —— 每天、每周和每月
- Cron 驱动的提醒 —— 每个事件创建一个 OpenClaw Cron 任务,自动发送通知
- 可自定义提醒时间 —— 事件前 5、10、15、30 或 60 分钟
- 投递渠道选择 —— 在 Telegram、Discord 或 WhatsApp 接收提醒
- 一次性提醒 —— 触发后自动删除
- 离线优先 —— 事件存储在 localStorage,连接时同步到 Gateway
- 完整双语支持(中文/英语)

### 🎤 语音聊天
- 由 **Gemini Live API** 驱动的实时语音对话,作为语音中继
- **`ask_aegis` 函数调用** —— Gemini 处理语音转文本和文本转语音,Gateway 处理智能
- **AudioWorklet** 麦克风采集(PCM16 @ 16kHz),支持无缝音频播放(PCM @ 24kHz)
- **Silero VAD**(语音活动检测) —— 过滤背景噪声,只发送真实语音
- **Aura 可视化器** —— 四个状态的动态球:空闲、聆听、思考、说话
- 专用设置面板 —— Gemini API 密钥、响应模型、语音选择、Live 模型
- 隔离的语音会话 —— 独立于文本聊天历史
- 会话计时器,显示模型信息

### 🧩 插件
- 模块化插件系统,内置 **8 个插件**:Pixel Agents、会话管理器、日志查看器、Multi-Agent、文件管理器、代码解释器、MCP 工具、分析
- **响应式网格布局** —— 桌面 3 列、平板 2 列、手机 1 列
- **内联渲染** —— 插件在页面内打开,无需路由导航
- **持久化状态** —— 通过 localStorage 记住最后打开的插件
- 玻璃卡片设计,悬停动画和发光效果

### 📊 监控与分析
- **仪表板** —— 一目了然的成本、Token、会话和活跃 Agent
- **完整分析** —— 日期范围、模型/Agent/Token 细分、每日表格、CSV 导出
- **Agent Hub** —— 创建/编辑/删除 Agent,监控子 Agent 和工作线程
- **Cron 监控器** —— 调度、运行、暂停任务,每个任务的活动日志和模板

### ⚙️ 配置
- **配置管理器** —— OpenClaw 配置的可视化编辑器(Providers、Agents、Channels、Advanced)
- **智能合并** —— 保存时重新读取磁盘,只合并你的更改,保留 CLI/外部编辑
- **密钥管理器** —— 密钥审计、Providers 视图和运行时重新加载

### 🔧 工具
- **技能市场** —— 浏览和搜索 ClawHub 中 3,286+ 个技能
- **集成终端** —— 通过 xterm.js 支持 PowerShell/Bash,多标签支持
- **工坊** —— AI 可通过文本命令管理的看板
- **内存浏览器** —— Agent 内存的可视化搜索和 CRUD

### 🎨 界面
- 暗色和亮色主题,完整的 CSS 变量系统(`--aegis-*`)
- 6 种强调色(青色、蓝色、紫色、玫瑰色、琥珀色、翡翠色)
- 中文和英语,使用逻辑 CSS 属性
- 命令面板(`Ctrl+K`)、键盘快捷键、全局热键(`Alt+Space`)
- 标题栏中的模型和推理级别选择器
- 惰性加载页面,代码分割,快速启动
- 玻璃拟态设计,Framer Motion 动画
- Ed25519 设备身份,挑战-响应认证

---

## 📦 安装

从 [Releases](../../releases) 下载:

| 文件 | 类型 |
|------|------|
| `AEGIS-Desktop-Setup-X.X.X.exe` | Windows 安装程序 |
| `AEGIS-Desktop-X.X.X.exe` | 便携版(无需安装) |

### 系统要求

- Windows 10/11
- [OpenClaw](https://github.com/openclaw/openclaw) Gateway 本地或远程运行

首次启动时,你需要与 Gateway 配对 —— 一次性设置,使用 Ed25519 设备身份验证。

---

## 🔌 工作原理

AEGIS Desktop 是一个前端客户端 —— 它不运行 AI 也不存储数据。所有内容都存储在你的 OpenClaw Gateway 中。

```
OpenClaw Gateway (本地或远程)       Gemini Live API
        │                                      │
        │  WebSocket                           │  WebSocket
        ▼                                      ▼
  AEGIS Desktop ──────────────────────────────────
  ├── 聊天        ← 消息 + 流式响应
  ├── 语音聊天  ← 通过 Gemini 中继的实时语音
  ├── 仪表板   ← 会话、成本、Agent 状态
  ├── 日历    ← 事件 + Cron 提醒
  ├── 分析   ← 成本汇总 + Token 历史
  ├── Agent Hub   ← 注册的 Agent + 工作线程
  ├── Cron        ← 定时任务
  ├── 插件     ← 模块化扩展系统
  ├── 配置      ← 可视化配置编辑器
  ├── 技能      ← ClawHub 市场
  └── 终端    ├── 通过 node-pty 的 Shell
```

---

## 🛠️ 开发

### 开发环境

```bash
npm install
npm run dev              # Electron + Vite (热重载)
npm run dev:web          # 仅浏览器(无 Electron)
```

### 构建

本项目提供了三种打包脚本,支持 Windows、macOS 和 Linux:

**Windows 用户:**
```cmd
# 使用 Batch 脚本(推荐)
scripts\build-all.bat

# 使用 npm 命令
npm run build:all

# 构建便携版
scripts\build-all.bat --portable
```

**macOS/Linux 用户:**
```bash
# 使用 Shell 脚本(推荐)
chmod +x scripts/build-all.sh
./scripts/build-all.sh

# 使用 npm 命令
npm run build:all

# 构建所有平台(仅 macOS)
./scripts/build-all.sh --all
```

**跨平台通用方式:**
```bash
node scripts/build.js

# 可用选项
node scripts/build.js --win           # 只构建 Windows
node scripts/build.js --mac           # 只构建 macOS
node scripts/build.js --linux         # 只构建 Linux
node scripts/build.js --all           # 构建所有平台
node scripts/build.js --clean         # 清理构建缓存
node scripts/build.js --portable      # 构建便携版
node scripts/build.js --help          # 查看帮助
```

### 构建产物

所有构建产物位于 `release/` 目录:

- **Windows**: `.exe` (安装包) 或便携版
- **macOS**: `.dmg` (磁盘镜像)
- **Linux**: `.AppImage`

详细文档请查看: [BUILD_GUIDE.md](BUILD_GUIDE.md)

---

## 🔧 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron 34 |
| UI | React 18 + TypeScript 5.7 |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS + CSS 变量 |
| 动画 | Framer Motion |
| 状态 | Zustand |
| 图表 | Recharts |
| 终端 | xterm.js + node-pty |
| 图标 | Lucide React |
| 国际化 | react-i18next |

---

<details>
<summary><strong>⌨️ 键盘快捷键</strong></summary>

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+K` | 命令面板 |
| `Ctrl+1` – `Ctrl+8` | 导航页面 |
| `Ctrl+,` | 设置 |
| `Ctrl+Tab` | 切换聊天标签 |
| `Ctrl+W` | 关闭标签 |
| `Ctrl+N` | 新建聊天 |
| `Ctrl+F` | 在聊天中搜索 |
| `Ctrl+R` | 刷新 |
| `Alt+Space` | 显示/隐藏窗口(全局) |

</details>

---

## 🌍 国际化

本项目支持以下语言:

- 🇨🇳 **简体中文** (Chinese Simplified)
- 🇺🇸 **英语** (English)

### 切换语言

- 在设置页面选择语言
- 使用命令面板(`Ctrl+K`)搜索"切换语言"
- 应用会自动保存你的语言偏好

### 翻译文件

翻译文件位于 `src/locales/` 目录:
- `zh.json` - 简体中文翻译
- `en.json` - 英语翻译

如果你想贡献翻译改进,请提交 PR。

---

## 🔄 与上游同步

本项目基于 [AEGIS Desktop](https://github.com/AegisStar/aegis-desktop) 的主分支,并定期同步上游更新。

### 自动同步

我们配置了 GitHub Actions 自动检测上游更新:
- 每 6 小时自动检查一次
- 如果有更新,自动创建 PR
- 你可以审查并合并

详细信息请查看: [ACTIONS_GUIDE.md](ACTIONS_GUIDE.md)

### 手动同步

如果你想手动同步上游更新:

```bash
# 拉取上游更新
git fetch upstream

# 查看差异
git log HEAD..upstream/master

# 合并更新
git merge upstream/master

# 如果有冲突,保留中文修改
# 运行翻译检查
node scripts/check-translation-sync.js
```

详细信息请查看: [SYNC_UPSTREAM_GUIDE.md](SYNC_UPSTREAM_GUIDE.md)

---

## 📚 文档

- [更新日志](CHANGELOG.md) —— 版本历史和发布说明
- [贡献指南](CONTRIBUTING.md) —— 如何贡献
- [安全策略](SECURITY.md) —— 漏洞报告
- [行为准则](CODE_OF_CONDUCT.md) —— 社区准则
- [构建指南](docs/BUILD_GUIDE.md) —— 详细的构建说明
- [GitHub Actions 指南](docs/ACTIONS_GUIDE.md) —— 自动化同步说明
- [上游同步指南](docs/SYNC_UPSTREAM_GUIDE.md) —— 与原作者保持同步
- [国际化迁移说明](docs/I18N_MIGRATION.md) —— 国际化改造记录

---

## 🤝 贡献

我们欢迎各种形式的贡献!

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 贡献指南

请务必阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细规范。

---

## 🚀 安装指南

### 下载

从 [Releases](https://github.com/Pupper0601/openclaw-desktop/releases) 下载最新版本的安装包：
- **Windows**: `AEGIS-Desktop-Setup-x.x.x.exe`
- **macOS**: `AEGIS-Desktop-x.x.x.dmg`

### 安装后注意事项

由于应用尚未进行代码签名，Windows Defender SmartScreen 可能会显示警告。这是正常现象，可以安全地忽略：

**解决方法：**
1. 点击警告窗口中的"更多信息"
2. 点击"仍要运行"
3. 应用将正常启动

**为什么会有这个警告？**
- 应用尚未进行数字签名（需要购买商业证书）
- GitHub Actions 自动构建的版本默认未签名
- 代码完全开源，你可以检查源代码

### 信任应用

如果你希望以后不再看到此警告，可以：
1. 右键点击安装文件
2. 选择"属性"
3. 勾选"解除锁定"
4. 点击"确定"

---

## 🐛 报告问题

如果你发现 Bug 或有功能建议:

1. 查看 [Issues](../../issues) 确认问题是否已报告
2. 如果是新问题,创建一个新的 Issue
3. 提供详细的问题描述、复现步骤和环境信息

---

## 📦 安装说明

### Windows 用户注意事项

由于 AEGIS Desktop 暂未购买代码签名证书，首次运行时可能会遇到 **Microsoft Defender SmartScreen** 警告。这是正常的，因为 Windows 不信任未签名的应用。

**解决方法：**

1. 点击警告窗口中的 **"更多信息"** 或 **"More info"**
2. 点击 **"仍要运行"** 或 **"Run anyway"**
3. 应用即可正常启动

**安全性说明：**
- 代码完全开源，你可以自行审查源代码
- 安装包由 GitHub Actions 自动构建，流程透明可查
- 如有疑虑，建议从官方 Releases 页面下载

---

## 📄 许可证

[MIT](LICENSE)

---

<div align="center">

## ⭐ 如果这个项目对你有帮助,请给它一个 Star!

再次感谢原作者 [AegisStar](https://github.com/AegisStar) 创建了这个精彩的项目!

**原项目地址:** https://github.com/AegisStar/aegis-desktop

---

Made with ❤️ by the OpenClaw Community

</div>
