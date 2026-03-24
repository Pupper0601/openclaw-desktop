# 清理构建并重试的脚本
Write-Host "正在终止所有 Node.js 和 Electron 进程..."
Get-Process | Where-Object {$_.ProcessName -match 'node|electron'} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "等待 3 秒..."
Start-Sleep -Seconds 3

Write-Host "删除 release 目录..."
$releaseDir = "E:\Github\openclaw-desktop\release"
if (Test-Path $releaseDir) {
    Remove-Item $releaseDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "开始构建..."
Set-Location "E:\Github\openclaw-desktop"
npm run build:all

Write-Host "完成！"
