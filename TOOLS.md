# TOOLS.md — 工具配置

## OpenClaw 配置

- **配置文件**: `~/.openclaw-gugu/openclaw.json`
- **默认模型**: `custom-llm-gateway-mlamp-cn/tencent/glm-5.2`
- **Gateway 端口**: 18790
- **Profile**: gugu

## mlamp 网关

- **baseUrl**: `https://llm-gateway.mlamp.cn/v1`
- **apiKey**: 在 `~/.openclaw-gugu/openclaw.json` 中
- **免费模型**: kimi-k2.6, glm-5.2, deepseek-v4-pro, qwen3-8b 等
- **配额模型**: tencent/kimi-k2.6, tencent/glm-5.2, txds/deepseek-v4-pro, qwen3.6-plus, claude-sonnet-4-6

## 备份

- **仓库**: `https://github.com/huyingxin619-arch/gugu-bot.git`
- **频率**: 每天凌晨 3:00
- **cron ID**: `9716d362-3dfd-4217-8379-2cd0b22c98f5`
- **model**: `custom-llm-gateway-mlamp-cn/tencent/glm-5.2`（必须与飞书 live session 当前 model 一致，否则 job 会报 `Live session model switch requested` 错误）
- **踩坑**: 2026-08-01，飞书 session 手动从 kimi-k2.6 切到 glm-5.2 后，备份 job payload 仍指定 kimi-k2.6 导致冲突失败。修复：job model 同步改为 glm-5.2

## 脚本路径

- **工作目录**: `~/.openclaw-gugu/workspace-gugu`
- **memory 目录**: `~/.openclaw-gugu/workspace-gugu/memory/`

---

_新增工具配置写在这里，不写进 AGENTS.md 或 MEMORY.md。_
