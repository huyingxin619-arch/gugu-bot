---
name: add-model
description: "Add a new LLM model to the OpenClaw config, switch to it, and verify it works."
---

# Add Model

Use when the user wants to add a new model to the OpenClaw instance.

## Prerequisites

- The model must be served from an existing provider (same baseUrl + apiKey as existing models)
- User provides the model name (e.g. `tencent/kimi-k3`)

## Workflow

1. **Read current config** — `~/.openclaw-gugu/openclaw.json` (or the active profile's config)
2. **Add model to `models.providers.<provider-id>.models`** — append a new entry with:
   - `api`: `"openai-completions"`
   - `cost`: all zeros (free model) or actual cost
   - `id`: the model name provided by user
   - `input`: `["text", "image"]`
   - `name`: human-readable name
   - `reasoning`: `false` (unless known otherwise)
   - `contextWindow` / `maxTokens`: copy from sibling models of same family
3. **Add alias to `agents.defaults.models`** — map the full model ID to a short alias
4. **Validate JSON** — `python3 -c "import json; json.load(open('...'))"` to catch syntax errors
5. **重启前检查 active task** — 用 `session_status` 查看是否有 active task。如果有（比如当前对话本身就是一个 task），重启会导致 drain 死锁：gateway 等 task 完成，task 等 gateway 回来。解决方式：
   - **方案A（推荐）**：先告诉用户模型已加入配置，请用户在**另一个 session**（或下次对话）中执行切换，避免当前 session 持有 task 时重启
   - **方案B**：如果必须在当前 session 完成，使用 `openclaw --profile <profile> gateway stop` 然后手动 `openclaw --profile <profile> gateway start`，而不是 `restart`。stop 会强制 kill 进程，LaunchAgent 的 KeepAlive 会立即拉起新进程
   - **方案C**：修改配置后不立即重启，等当前对话自然结束后再重启
6. **重启 gateway** — 根据第5步选择的方式执行
7. **等待健康检查** — `curl -s http://127.0.0.1:<port>/health` 返回 `{"ok":true}`。如果超过 30 秒没恢复，检查 LaunchAgent 状态：`launchctl print gui/501/ai.openclaw.<profile>`
8. **切换 session 模型** — 使用 `session_status` tool 的 `model` 参数
9. **验证** — `session_status` 显示新模型；如果响应成功，模型可用

## Example

User says: "加模型 tencent/kimi-k3"

- Provider: `custom-llm-gateway-mlamp-cn` (existing)
- Model ID: `tencent/kimi-k3`
- Alias: `tencent-kimi-k3`
- Copy contextWindow/maxTokens from `tencent/kimi-k2.6` (same family)

## 踩坑记录

- **2026-07-28**：在持有 active task 的 session 中执行 `gateway restart`，导致 drain 死锁（gateway 等 task 完成，task 等 gateway 回来），LaunchAgent 未自动拉起。根因：restart 是优雅重启（等 drain），而当前 task 就是对话本身，永远不会"完成"。解决：adm 手动 bootstrap 恢复。教训：有 active task 时不要用 restart，改用 stop+start 或推迟重启。

- 如果 `session_status` 返回 "not allowed"，检查 `agents.defaults.models` 是否包含完整 model ID
- model ID 格式为 `<provider>/<model-id>`（如 `custom-llm-gateway-mlamp-cn/tencent/kimi-k3`）
- Gateway 重启后新模型才能被识别
