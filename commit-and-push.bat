@echo off
echo ========================================
echo 提交代码并推送到 GitHub
echo ========================================
echo.

cd /d E:\Github\openclaw-desktop

echo [1/3] 添加所有文件到 Git...
git add .
if errorlevel 1 (
    echo 错误: Git add 失败
    pause
    exit /b 1
)

echo.
echo [2/3] 提交更改...
git commit -m "feat: 使用 GitHub Actions 构建安装包"
if errorlevel 1 (
    echo 注意: 没有新的更改需要提交
    echo 继续推送...
)

echo.
echo [3/3] 推送到 GitHub...
git push origin master
if errorlevel 1 (
    echo 错误: 推送失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 成功! 
echo ========================================
echo.
echo 代码已推送到 GitHub，GitHub Actions 将自动构建安装包。
echo 请前往以下地址查看构建进度:
echo https://github.com/AegisStar/openclaw-desktop/actions
echo.
pause
