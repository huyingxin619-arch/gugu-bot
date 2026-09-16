@echo off
REM PMS OKR CLI - Windows 入口批处理
REM 用法: call.bat METHOD PATH [BODY_JSON] [TOKEN]
REM 认证方式见同目录 call.sh / call.ps1 或 SKILL.md
REM 配置文件: %USERPROFILE%\.pms-okr-cli-prd\config.json

setlocal enabledelayedexpansion

REM 如果有 Git Bash，优先走 bash 版
where bash >nul 2>nul
if %ERRORLEVEL%==0 (
    bash "%~dp0call.sh" %*
    exit /b %ERRORLEVEL%
)

REM 否则走 PowerShell 版
where powershell >nul 2>nul
if %ERRORLEVEL%==0 (
    powershell -ExecutionPolicy Bypass -File "%~dp0call.ps1" %*
    exit /b %ERRORLEVEL%
)

echo [错误] 未找到 bash(Git Bash) 或 PowerShell，无法运行CLI。
echo 请安装 Git Bash（https://git-scm.com/download/win）或将 PowerShell 加入PATH。
exit /b 1
