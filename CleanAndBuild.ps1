# AEGIS Desktop 清理并重新构建脚本
# 此脚本会清理所有相关进程和文件，然后重新构建

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AEGIS Desktop 清理并重新构建脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 停止所有相关进程
Write-Host "[1/6] 停止所有相关进程..." -ForegroundColor Yellow
$processes = @("electron", "node", "npm", "AEGIS", "openclaw")
foreach ($proc in $processes) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Write-Host "✓ 进程已停止" -ForegroundColor Green
Write-Host ""

# 2. 等待文件系统释放
Write-Host "[2/6] 等待文件系统释放..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "✓ 等待完成" -ForegroundColor Green
Write-Host ""

# 3. 删除 release 目录
Write-Host "[3/6] 删除 release 目录..." -ForegroundColor Yellow
$releaseDir = "E:\Github\openclaw-desktop\release"
if (Test-Path $releaseDir) {
    try {
        Remove-Item -Path $releaseDir -Recurse -Force
        Write-Host "✓ Release 目录已删除" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠ 删除失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "尝试使用强制删除..." -ForegroundColor Yellow
        # 尝试使用 cmd 删除
        cmd /c "rmdir /S /Q $releaseDir 2>nul"
    }
}
else {
    Write-Host "✓ Release 目录不存在" -ForegroundColor Green
}
Write-Host ""

# 4. 删除 node_modules 中的 app-builder-bin 缓存
Write-Host "[4/6] 删除 app-builder-bin 缓存..." -ForegroundColor Yellow
$cacheDir = "E:\Github\openclaw-desktop\node_modules\app-builder-bin"
if (Test-Path $cacheDir) {
    try {
        Remove-Item -Path $cacheDir -Recurse -Force
        Write-Host "✓ 缓存已删除" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠ 删除失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "✓ 缓存目录不存在" -ForegroundColor Green
}
Write-Host ""

# 5. 重新安装 electron-builder
Write-Host "[5/6] 重新安装 electron-builder..." -ForegroundColor Yellow
Set-Location "E:\Github\openclaw-desktop"
try {
    npm uninstall electron-builder --silent
    npm install electron-builder --save-dev --silent
    Write-Host "✓ electron-builder 已重新安装" -ForegroundColor Green
}
catch {
    Write-Host "⚠ 重新安装失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. 开始构建
Write-Host "[6/6] 开始构建..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  开始构建 AEGIS Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    npm run build:all
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ 构建成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "构建产物位置: release\" -ForegroundColor Cyan
    Get-ChildItem -Path "E:\Github\openclaw-desktop\release" -Filter "*.exe" | ForEach-Object {
        Write-Host "  - $($_.Name) ($([math]::Round($_.Length / 1MB, 2)) MB)" -ForegroundColor White
    }
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ 构建失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
