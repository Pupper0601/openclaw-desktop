#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// AEGIS Desktop - Cross-Platform Build Script (Node.js)
// ═══════════════════════════════════════════════════════════════
// 支持: Windows, macOS, Linux
// ═══════════════════════════════════════════════════════════════

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function printHeader(text) {
  console.log(`\n${colors.blue}${'═'.repeat(63)}${colors.reset}`);
  console.log(`${colors.blue}${'  '}${text}${colors.reset}`);
  console.log(`${colors.blue}${'═'.repeat(63)}${colors.reset}\n`);
}

function printSuccess(text) {
  console.log(`${colors.green}✅ ${text}${colors.reset}`);
}

function printError(text) {
  console.error(`${colors.red}❌ ${text}${colors.reset}`);
}

function printWarning(text) {
  console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`);
}

function printStep(text) {
  console.log(`${colors.blue}▶ ${text}${colors.reset}`);
}

// 获取项目根目录
const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

// 解析命令行参数
const args = process.argv.slice(2);
let buildAll = false;
let buildWin = false;
let buildMac = false;
let buildLinuxFlag = false;
let clean = false;
let portable = false;

printHeader('AEGIS Desktop Build Script');

// 检测操作系统
const platform = process.platform;
let platformName;

switch (platform) {
  case 'darwin':
    platformName = 'macOS';
    buildMac = true;
    break;
  case 'linux':
    platformName = 'Linux';
    buildLinuxFlag = true;
    break;
  case 'win32':
    platformName = 'Windows';
    buildWin = true;
    break;
  default:
    printError(`不支持的操作系统: ${platform}`);
    process.exit(1);
}

printStep(`检测到平台: ${platformName}`);

// 解析参数
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '--all':
      buildAll = true;
      break;
    case '--win':
      buildWin = true;
      break;
    case '--mac':
      buildMac = true;
      break;
    case '--linux':
      buildLinuxFlag = true;
      break;
    case '--clean':
      clean = true;
      break;
    case '--portable':
      portable = true;
      break;
    case '-h':
    case '--help':
      console.log('用法: node build.js [选项]');
      console.log('');
      console.log('选项:');
      console.log('  --all        构建所有平台 (Windows + macOS + Linux)');
      console.log('  --win        只构建 Windows');
      console.log('  --mac        只构建 macOS');
      console.log('  --linux      只构建 Linux');
      console.log('  --portable   构建 Windows 便携版');
      console.log('  --clean      清理构建缓存');
      console.log('  -h, --help   显示此帮助信息');
      console.log('');
      console.log('示例:');
      console.log('  node build.js --all           # 构建所有平台');
      console.log('  node build.js --win --portable # 构建 Windows 便携版');
      console.log('  node build.js --clean --all    # 清理后构建所有平台');
      process.exit(0);
    default:
      printError(`未知选项: ${arg}`);
      console.log('使用 -h 或 --help 查看帮助');
      process.exit(1);
  }
}

// 如果没有指定任何平台,构建当前平台
if (!buildAll && !buildWin && !buildMac && !buildLinuxFlag) {
  printStep('未指定平台,将构建当前平台 (' + platformName + ')');
}

// 执行命令
function exec(command, options = {}) {
  try {
    const result = execSync(command, { stdio: 'pipe', encoding: 'utf8', ...options });
    if (result) {
      console.log(result);
    }
  } catch (error) {
    printError(`命令执行失败: ${command}`);
    if (error.stdout) {
      console.log('stdout:', error.stdout);
    }
    if (error.stderr) {
      console.error('stderr:', error.stderr);
    }
    throw error;
  }
}

// 清理构建缓存
if (clean) {
  printStep('清理构建缓存...');
  const dirsToClean = ['dist', 'dist-electron', 'node_modules/.vite'];
  dirsToClean.forEach(dir => {
    const dirPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  });
  printSuccess('清理完成');
}

// 检查 Node.js
printStep('检查 Node.js...');
try {
  const nodeVersion = execSync('node -v', { encoding: 'utf-8' }).trim();
  printSuccess(`Node.js 版本: ${nodeVersion}`);
} catch (error) {
  printError('未找到 Node.js,请先安装');
  process.exit(1);
}

// 检查 npm
printStep('检查 npm...');
try {
  const npmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim();
  printSuccess(`npm 版本: ${npmVersion}`);
} catch (error) {
  printError('未找到 npm,请先安装');
  process.exit(1);
}

// 安装依赖
printStep('安装依赖...');
const nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  try {
    exec('npm install', { cwd: PROJECT_ROOT });
    printSuccess('依赖安装完成');
  } catch (error) {
    printError('依赖安装失败');
    process.exit(1);
  }
} else {
  printSuccess('依赖已存在,跳过安装 (使用 --clean 强制重新安装)');
}

// 切换到项目根目录
process.chdir(PROJECT_ROOT);

// 构建步骤
function buildProject() {
  printStep('构建 Electron 主进程...');
  exec('npm run build:electron');
  printSuccess('Electron 主进程构建完成');

  printStep('构建渲染进程...');
  exec('npm run build:renderer');
  printSuccess('渲染进程构建完成');
}

function buildWindows() {
  printHeader('构建 Windows 版本');

  // 清理旧的构建输出
  printStep('清理旧的构建输出...');
  const releaseDir = path.join(PROJECT_ROOT, 'release');
  if (fs.existsSync(releaseDir)) {
    try {
      fs.rmSync(releaseDir, { recursive: true, force: true });
      printSuccess('旧的构建输出已清理');
    } catch (error) {
      printWarning(`清理失败: ${error.message}`);
      printWarning('将尝试继续构建...');
    }
  }

  buildProject();

  if (portable) {
    printStep('构建 Windows 便携版...');
    exec('npx electron-builder --win portable --x64');
    printSuccess('Windows 便携版构建完成');
  } else {
    printStep('构建 Windows 安装包...');
    exec('npx electron-builder --win --x64');
    printSuccess('Windows 安装包构建完成');
  }

  printSuccess('构建产物位于: release/');
}

function buildMacOS() {
  printHeader('构建 macOS 版本');

  buildProject();

  printStep('构建 macOS DMG...');
  exec('npx electron-builder --mac --x64 --arm64');
  printSuccess('macOS DMG 构建完成');

  printSuccess('构建产物位于: release/');
}

function buildLinux() {
  printHeader('构建 Linux 版本');

  buildProject();

  printStep('构建 Linux AppImage...');
  exec('npx electron-builder --linux --x64');
  printSuccess('Linux AppImage 构建完成');

  printSuccess('构建产物位于: release/');
}

// 记录开始时间
const startTime = Date.now();

// 执行构建
try {
  if (buildAll) {
    printWarning('构建所有平台可能需要较长时间...');

    if (platform === 'darwin') {
      // 在 macOS 上可以构建所有平台
      buildWindows();
      buildMacOS();
      buildLinux();
    } else if (platform === 'linux') {
      // Linux 无法构建 macOS 和 Windows 可执行文件
      printWarning('Linux 只能构建 Linux 版本');
      buildLinux();
    } else if (platform === 'win32') {
      // Windows 无法构建 macOS 可执行文件
      printWarning('Windows 只能构建 Windows 版本');
      buildWindows();
    }
  } else {
    if (buildWin) {
      buildWindows();
    }

    if (buildMac) {
      if (platform === 'darwin') {
        buildMacOS();
      } else {
        printError(`在 ${platformName} 上无法构建 macOS 版本`);
        printError('请在 macOS 上运行此脚本');
      }
    }

    if (buildLinuxFlag) {
      if (platform === 'linux') {
        buildLinux();
      } else {
        printError(`在 ${platformName} 上无法构建 Linux 版本`);
        printError('请在 Linux 上运行此脚本');
      }
    }
  }

  // 计算耗时
  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // 显示构建结果
  printHeader('构建完成!');

  console.log(`${colors.green}总耗时: ${minutes}分 ${seconds}秒${colors.reset}`);
  console.log('');

  // 列出生成的文件
  const releasePath = path.join(PROJECT_ROOT, 'release');
  if (fs.existsSync(releasePath)) {
    printStep('生成的安装包:');
    const files = fs.readdirSync(releasePath).filter(file =>
      file.endsWith('.exe') || file.endsWith('.dmg') || file.endsWith('.AppImage')
    );
    files.forEach(file => {
      const filePath = path.join(releasePath, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`  ${file} (${sizeMB} MB)`);
    });
    console.log('');
  }

  printSuccess('所有构建任务已完成!');
  console.log('');
  console.log(`${colors.yellow}提示:${colors.reset}`);
  console.log('  - Windows 安装包位于: release/');
  console.log('  - 可以使用 --help 查看所有选项');
  console.log('  - 下次构建可以使用 --clean 清理缓存');
  console.log('');
} catch (error) {
  printError('构建失败!');
  console.error(error);
  process.exit(1);
}
