# TOOLS.md — 工具配置

## OpenClaw 配置

- **配置文件**: `~/.openclaw-gugu/openclaw.json`
- **API Key 更换 SOP**：必须用 CLI `openclaw models auth paste-api-key --provider custom-llm-gateway-mlamp-cn`，不能手动改 JSON。根因：OpenClaw 的 API key 存在两个位置（openclaw.json provider config + per-agent SQLite auth profile store），auth profile store 优先级更高。手动改 JSON 只改了 provider config，SQLite 里的旧 key 不变，reload 后 gateway 用旧 key → 401。`paste-api-key` 会同步两边。（2026-10-12 踩坑：key 不同步导致 27 分钟全局故障）
- **默认模型**: `custom-llm-gateway-mlamp-cn/tencent/glm-5.2`
- **Gateway 端口**: 18790
- **Profile**: gugu

## mlamp 网关

### 当前网关（2026-10-12 切换）
- **baseUrl**: `https://llmgw-bz.mlamp.cn/v1`（新网关，集团Token管理方案调整后）
- **旧网关**: `https://llm-gateway.mlamp.cn/v1`（已停用）
- **apiKey**: 在 `~/.openclaw-gugu/openclaw.json` 中
- **预算模型变更（10/1起）**: 预算由部门/产品管理发放，取消个人月度定额及月度重置；个人/项目API Key由空间管理员按需分发

### 各实例迁移状态
| 实例 | 状态 |
|------|------|
| gugu | ✅ 已切新网关（baseUrl: llmgw-bz, model: tencent/glm-5.2） |
| octic | ✅ 已切新网关 |
| adm_pm | ✅ 已切新网关（model: tencent/glm-5.2） |
| adm (.openclaw) | ⚠️ baseUrl已切，但默认模型glm-5.3-flashx和fallback链未对齐 |
| adm_ceshi | ❌ 仍用旧网关 + 旧apiKey |
| sanjiu | ❌ 旧网关 + kimi-k2.6（已下线） |
- **小胡指示**: 先记录，不用改

### 模型配置
- **免费模型**: glm-5.2, deepseek-v4-pro, qwen3-8b, mlamp/kimi-k3 等（kimi-k2.6 已下线，已删除；mlamp/kimi-k3 新增）
- **配额模型**: tencent/glm-5.2, tencent/kimi-k3, txds/deepseek-v4-pro, qwen3.6-plus, claude-sonnet-4-6
- **读图模型**: `agents.defaults.imageModel` 配置为 `custom-llm-gateway-mlamp-cn/mlamp/kimi-k3`，fallback 到 `tencent/kimi-k3` → `qwen3.6-plus`
- **统一 Fallback 链**（2026-09-02 确认，所有 AI bot 统一）：`mlamp/kimi-k3` → `qwen3.6-plus` → `mlamp/deepseek-v4-pro` → `claude-opus-4-6`。各 bot 已完成配置并重启。adm PM助手私聊session因kimi-k3超时频繁报错，已切换 `tencent/glm-5.2` 并 `/new` 重置

## 备份

- **仓库**: `https://github.com/huyingxin619-arch/gugu-bot.git`
- **频率**: 每天凌晨 3:00
- **cron ID**: `9716d362-3dfd-4217-8379-2cd0b22c98f5`
- **model**: `custom-llm-gateway-mlamp-cn/tencent/glm-5.2`（必须与飞书 live session 当前 model 一致，否则 job 会报 `Live session model switch requested` 错误）
- **踩坑**: 2026-08-01，飞书 session 手动从 kimi-k2.6 切到 glm-5.2 后，备份 job payload 仍指定 kimi-k2.6 导致冲突失败。修复：job model 同步改为 glm-5.2
- **踩坑**: 2026-08-06，cron job model ID 需跟随网关格式变更同步。原 memory-distill job 用旧模型ID `mlamp/kimi-k2.6`（已不可用），连续4天 503 失败（"无可用渠道"）。修复：model 改为 `tencent/glm-5.2`。教训：mlamp 网关模型ID格式变更后，所有 cron job 的 model 需同步检查更新

## 脚本路径

- **工作目录**: `~/.openclaw-gugu/workspace-gugu`
- **memory 目录**: `~/.openclaw-gugu/workspace-gugu/memory/`

## octo-daemon

- **octo-daemon**: v1.2.3 (darwin-arm64)（10/21从v1.1.0升级，CLI同步升至0.19.0）
- **用途**: 让专家通过 octo-daemon 调用 openclaw CLI，实现 Loop 子系统操作
- **Profile**: `gugu`（与默认 profile 隔离，因默认端口 19514 被 huangchunbo 的 multica daemon 占用）
- **启动**: `octo-daemon --profile gugu`，独立端口
- **认证**: token 认证，server: `im.deepminer.com.cn`
- **内置 skill**: octo-loop（已装到 gugu 和 adm 两个实例的 skills 目录）
- **安装日期**: 2026-08-17

## Loop 子系统行为知识

- **Loop里的专家与当前对话session是两个独立实例**：上下文不共享。专家是Loop工作区里的常驻实例，有自己的instructions和记忆；当前对话session是临时的。两者不共享对话历史或上下文
- **Octo @通知机制**：在消息中使用 `@[uid:displayName]` 格式可以触发对特定用户的通知。例如 `@[d6455e7407db42d5b49a3b975684c910:小胡]`
- **Spid与SpotsPlanId**：见 `knowledge/adm-fields-reference.md` 中「Spid ↔ SpotsPlanId 转换关系」

## adm_pm LaunchAgent 踩坑

- **双重嵌套路径bug**：adm_pm LaunchAgent 配置中存在双重嵌套路径问题（2026-08-19修复）。根因是plist中路径配置重复嵌套，导致服务无法正确启动

## octo-cli 文档读取

- `octo-cli docs content get <docId> --bot-id guguhyx_bot` — 读取 Octo 在线文档内容（JSON block 结构，ProseMirror/Tiptap 格式）
- `octo-cli docs export <docId> --export-format md -o <path>` — 导出为 markdown
- 权限: 需文档创建者通过 `octo-cli docs forward-grant` 授 reader/writer
- guguhyx_bot 的 auth profile 已建好（`octo-cli auth login`）

## octo-cli 群/Thread 定位与发消息

**定位方法（不知道群/ thread id 时按此查）：**
1. `octo-cli group list --bot-id guguhyx_bot` — 列出 bot 加入的所有群（含 group_no）
2. `octo-cli thread list <group_no> --bot-id guguhyx_bot` — 列出群内所有 thread（含 channel_id、short_id、成员数）

**已知常用定位：**

| 群 | group_no | Thread | thread channel_id |
|---|----------|--------|-------------------|
| adm7.0 | `658b7026d7f1492aa6c76541ebbd4e6c` | adm context | `658b7026d7f1492aa6c76541ebbd4e6c____2087106383030784000` |
| adm7.0 | 同上 | adm bot纠偏 | `658b7026d7f1492aa6c76541ebbd4e6c____2089994969916903424` |

**发消息：**
```bash
octo-cli message send \
  --channel-id "<thread channel_id>" \
  --channel-type 5 \
  --bot-id guguhyx_bot \
  --data @payload.json
# payload.json: {"channel_id":"...","channel_type":5,"payload":{"type":1,"content":"正文"}}
# type: 1=文本 2=图片 8=文件；channel_type: 1=DM 2=group 5=thread
```

- 长文先用 python 生成 payload JSON 文件再 `--data @file` 传，避免 shell 转义问题
- 发送前 `--dry-run` 验证格式
- 踩坑（2026-10-30）：被问到“发到群的 thread”时第一反应是“我不知道”，实际应该先 `group list` 查自己加了哪些群——先查再说不知道

## Node.js 版本

- **当前版本**: v24.19.0（通过 nvm 安装）
- **系统 PATH**: `/opt/homebrew/bin/node` 是 homebrew 的 v22.22.0，不满足 octo-daemon 要求（>=22.22.3）
- **修复**: `nvm alias default 24` 激活 v24 到默认 PATH
- **踩坑**: 2026-08-17，专家通过 octo-daemon 调 openclaw 时报错 node v22.22.0 不满足要求。根因是 homebrew node 和 nvm node 并存，PATH 优先用了 homebrew 的旧版

## memory_search 排查

- **踩坑**: 2026-08-12，memory_search 突然不工作（搜任何词返回空或报错）
- **根因**: `memory index --force` 重建索引时创建临时 DB → 写入 meta → swap 替换主 DB，但 gateway 进程持有旧 DB 连接，swap 后读不到新 meta。重启 gateway 后 CLI 又可能因检测到文件变化再触发一次 index，把 meta 清掉
- **修复方法**: 不重启 gateway，直接跑 `openclaw memory index --force`，CLI 写完 meta 后不被覆盖，memory_search 即可恢复
- **验证**: 搜 "test" 返回6条结果，向量检索和全文检索都通

- **踩坑**: 2026-08-18，memory_search 全部 fail，报 `Unknown memory embedding provider: local`
- **根因**: 8/17 OpenClaw 从 2026.6.1-beta.3 升级到 2026.7.1-2 后，llama-cpp-provider 插件未在 enabled 列表中，导致 `memorySearch.provider: "local"` 找不到嵌入提供方
- **修复方法**: 在 `openclaw.json` 的 `plugins.allow` 加入 `"llama-cpp"`，`plugins.entries` 加入 `{"llama-cpp": {"enabled": true}}`，重启 gateway 后自动重建索引
- **验证**: `openclaw memory status --deep` 显示 Embeddings: ready，搜 "test" 返回6条结果

## DMS Hive 查询
- **平台**: https://dms.mininglamp.com
- **数据库**: daas（Hive，dsId=1，dbId=1）
- **代理用户**: mz_supertool
- **队列**: root.marvel.dms
- **核心表**: ods_adm_bus（ADM日志，133字段，日18-22亿条）、ods_tvm_bus（TVM日志，86字段）、dim_adm_babel（ADM维度表）、dim_tvm_babel（TVM维度表）
- **关联**: 事实表.mz_campaign_id=维度表.campaign_id，事实表.mz_spot_id=维度表.spots_id
- **分区**: 事实表按 dt 分区（YYYYMMDD），查询必须指定 dt 条件
- **Skill 路径**: `~/.openclaw-gugu/workspace-gugu/skills/dms-query/`
- **Schema 参考**: `skills/dms-query/schema.md`
- **凭证**: ⏳ 待小胡提供（存 local-credentials.md）
- **安装日期**: 2026-09-24

---

_新增工具配置写在这里，不写进 AGENTS.md 或 MEMORY.md。_
