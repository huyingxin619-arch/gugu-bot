# TOOLS.md — 工具配置

## OpenClaw 配置

- **配置文件**: `~/.openclaw-gugu/openclaw.json`
- **默认模型**: `custom-llm-gateway-mlamp-cn/tencent/glm-5.2`
- **Gateway 端口**: 18790
- **Profile**: gugu

## mlamp 网关

- **baseUrl**: `https://llm-gateway.mlamp.cn/v1`
- **apiKey**: 在 `~/.openclaw-gugu/openclaw.json` 中
- **免费模型**: glm-5.2, deepseek-v4-pro, qwen3-8b 等（kimi-k2.6 已下线，已删除）
- **配额模型**: tencent/kimi-k2.6, tencent/glm-5.2, tencent/kimi-k3, txds/deepseek-v4-pro, qwen3.6-plus, claude-sonnet-4-6

## 备份

- **仓库**: `https://github.com/huyingxin619-arch/gugu-bot.git`
- **频率**: 每天凌晨 3:00
- **cron ID**: `9716d362-3dfd-4217-8379-2cd0b22c98f5`
- **model**: `custom-llm-gateway-mlamp-cn/tencent/glm-5.2`（必须与飞书 live session 当前 model 一致，否则 job 会报 `Live session model switch requested` 错误）
- **踩坑**: 2026-08-01，飞书 session 手动从 kimi-k2.6 切到 glm-5.2 后，备份 job payload 仍指定 kimi-k2.6 导致冲突失败。修复：job model 同步改为 glm-5.2
- **踩坑**: 2026-08-06，memory-distill job 仍用 `mlamp/kimi-k2.6`（旧模型ID），连续4天 503 失败（"无可用渠道"）。修复：model 改为 `tencent/glm-5.2`。原因：mlamp 网关模型ID格式变更，`mlamp/kimi-k2.6` 已不可用，需用 `tencent/kimi-k2.6` 或 `tencent/glm-5.2`

## 脚本路径

- **工作目录**: `~/.openclaw-gugu/workspace-gugu`
- **memory 目录**: `~/.openclaw-gugu/workspace-gugu/memory/`

## memory_search 排查

- **踩坑**: 2026-08-12，memory_search 突然不工作（搜任何词返回空或报错）
- **根因**: `memory index --force` 重建索引时创建临时 DB → 写入 meta → swap 替换主 DB，但 gateway 进程持有旧 DB 连接，swap 后读不到新 meta。重启 gateway 后 CLI 又可能因检测到文件变化再触发一次 index，把 meta 清掉
- **修复方法**: 不重启 gateway，直接跑 `openclaw memory index --force`，CLI 写完 meta 后不被覆盖，memory_search 即可恢复
- **验证**: 搜 "test" 返回6条结果，向量检索和全文检索都通

---

_新增工具配置写在这里，不写进 AGENTS.md 或 MEMORY.md。_
