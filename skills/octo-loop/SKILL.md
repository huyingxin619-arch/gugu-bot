---
name: octo-loop
description: "本地 coding agent 通过已认证 octo-daemon CLI 操作 Loop 子系统时使用：读写 issue（事项/任务/bug）、评论、项目、专家（Agent）、专家团（Squad）、runtime；回复或创建 issue、给专家/专家团派单、查 PR、读进展，并安全处理 mention 与状态流转副作用。命中词还含派单、安排任务、创建需求、报 bug、更新进展、读取 issue 进展。不用于与 Loop 无关的闲聊、纯本地文件读写。"
---

# Octo / Loop CLI

以本地 `octo-daemon` CLI 作为事实源。本 skill 教外部 coding agent（如 Claude Code、Codex、OpenClaw、Cursor）如何**安全地**操作 Loop/Octo，它不授予任何权限——权限只来自用户已安装的 CLI、所选 profile、工作区，以及用户明确批准的命令执行。

术语对照：**专家 = Agent，专家团 = Squad，工作区 = workspace，事项 / 任务 / bug = issue，派单 = 分配 issue 给专家/专家团并触发其运行**。

## 何时触发 / 何时不触发

**应触发**（任务指向具体 Loop/Octo 工作区或 issue）：
- 提到 Loop、工作区 / workspace；
- 读写 issue / 事项 / 任务 / bug、评论、项目、metadata；
- 涉及专家（Agent）/ 专家团（Squad）：派单、安排任务、@某专家、让专家团接单；
- 从外部 agent 回复某条 Octo 评论、创建或分诊 issue、更新状态、查看关联 PR、读取任务进展；
- 任何"通过 `octo-daemon` 操作 Loop 事实源"的动作。

**不要触发**：
- 与 Loop 无关的普通聊天 / 问答；
- 纯本地文件读写、与任何 Octo 工作区无关的操作；
- 只是提到"issue"但明显指 GitHub/Jira 等非 Loop 系统。

## 安全启动 Start Safely

1. 动手前先确认 CLI 与账号状态：

```bash
octo-daemon version
octo-daemon auth status
octo-daemon config show
```

确认你用的是**支持工作区**的 `octo-daemon`，而不是同名但缺 issue 命令的二进制。本 skill 需要 `issue` 命令族：

```bash
octo-daemon issue --help
```

若报 `unknown command "issue"`，说明装错了二进制。**停下**，让用户安装 Octo server 版 `octo-daemon`（能连工作区的那个），不要绕过。

若 `octo-daemon auth status` 显示无活跃会话，说明未登录。**停下**让用户认证，不要伪造凭据：

```bash
octo-daemon login        # 交互式认证 + 工作区初始化
octo-daemon setup        # 备选：配置 CLI、认证、启动 daemon
```

2. 用对工作区与 profile。先发现有哪些可用，用户点名时优先用显式 flag：

```bash
octo-daemon workspace list --output json                 # 有哪些工作区
octo-daemon workspace switch <workspace-id>              # 设为该 profile 默认
octo-daemon --profile <profile> --workspace-id <workspace-id> issue list --output json
```

3. 命令支持时一律加 `--output json`，解析 JSON 而不是抓表格。

4. 绝不泄露或存储 token、cookie、API key、CLI 配置密钥；不要通过直连私有 HTTP API 绕过工作区权限。

## 命令速查 Command Reference

下面是最常用的 issue 工作流命令与 flag，这些不必再查 `--help`。仅在某个 flag 被拒绝、或要探索长尾命名空间（`project`、`agent`、`squad`、`runtime`、`repo`、`skill`、`autopilot`、`attachment`，其形态各异、此处不重复）时才用 `--help`。`[ ]` 表示可选，`|` 表示互斥。

```bash
# 读 Read
octo-daemon issue get <id> --output json
octo-daemon issue list [--status <s>] [--assignee <name> | --assignee-id <uuid>] [--project <id>] [--priority <p>] [--limit N] [--metadata key=value] --output json
octo-daemon issue children <id> --output json
octo-daemon issue pull-requests <id> --output json
octo-daemon issue metadata list <id> --output json

# 评论（读）Comments (read)
octo-daemon issue comment list <id> --recent N --output json                        # 最近活跃的 N 个话题
octo-daemon issue comment list <id> --thread <comment-id> [--tail N] --output json  # 单个话题（根 + 回复）
octo-daemon issue comment list <id> --roots-only [--summary] --output json          # 分诊顶层话题
#   另有：--since <RFC3339>、--before/--before-id <cursor> 用于分页

# 创建 / 更新 Create / update
octo-daemon issue create --title "..." [--description-file <path>] [--priority <p>] [--status <s>] [--assignee <name> | --assignee-id <uuid>] [--parent <id>] [--stage N] [--project <id>] [--due-date YYYY-MM-DD] [--attachment <path>] --output json
octo-daemon issue update <id> [--title "..."] [--description-file <path>] [--status <s>] [--priority <p>] [--assignee-id <uuid>] [--parent <id> | --parent ""] [--stage N] [--due-date YYYY-MM-DD]

# 状态 / 分配（状态值：backlog | todo | in_progress | in_review | done | blocked | cancelled）
octo-daemon issue status <id> <status>
octo-daemon issue assign <id> --to <name> | --to-id <uuid> | --unassign

# 评论（写）——正文一律走文件，见下方"写工作流"
octo-daemon issue comment add <id> [--parent <comment-id>] --content-file <path> [--attachment <path>]

# Metadata
octo-daemon issue metadata set <id> --key <k> --value <v> [--type string|number|bool]
octo-daemon issue metadata delete <id> --key <k>
```

注意：`issue assign` 用 `--to` / `--to-id`（不是 `--assignee`），而 `issue create` / `issue update` 用 `--assignee` / `--assignee-id`。

## 读工作流 Read Workflow

先读后写，读完再决定是否需要写。

```bash
octo-daemon issue get <issue-id-or-key> --output json
octo-daemon issue comment list <issue-id-or-key> --recent 10 --output json
octo-daemon issue metadata list <issue-id-or-key> --output json
octo-daemon issue pull-requests <issue-id-or-key> --output json
```

评论历史很长时，用聚焦读：

```bash
octo-daemon issue comment list <issue-id> --thread <comment-id> --tail 30 --output json
octo-daemon issue comment list <issue-id> --recent 10 --output json
```

其他资源（含专家/专家团）用对应命名空间探索：

```bash
octo-daemon project --help
octo-daemon agent --help      # 专家
octo-daemon squad --help      # 专家团
octo-daemon runtime --help
octo-daemon repo --help
octo-daemon skill --help
octo-daemon autopilot --help
octo-daemon attachment --help
```

## 写工作流 Write Workflow

把写操作当作**有副作用**的动作。若用户没有明确要求写，先问再执行。写操作包括：创建评论、创建 issue、改状态、分配 / 派单、重新触发运行、@专家、@专家团、webhook/autopilot 变更、以及 repo checkout。

### 评论 Issue Comments

Agent 撰写的评论，正文**一律写入 UTF-8 文件后用 `--content-file` 提交**。不要用内联 `--content`：shell 会在 CLI 收到前改写反引号、`$()`、变量、引号和换行。

```bash
# 把正文写入私有临时文件（不要用仓库里的固定名，以免覆盖用户文件），提交后清理：
reply_dir="$(mktemp -d)"
trap 'rm -rf "$reply_dir"' EXIT
reply_file="$reply_dir/reply.md"
# ...把评论正文写入 "$reply_file"，保留真实换行...
octo-daemon issue comment add <issue-id> --parent <comment-id> --content-file "$reply_file"
```

用 `mktemp -d` 建私有临时目录，不要用 `./reply.md` 这类固定路径（可能覆盖/删除用户已有文件）。回复话题时 `--parent` 保持与被回复评论一致。不要写字面 `\n` 假装换行。

### issue 与 metadata

长描述用文件：

```bash
octo-daemon issue create --title "..." --description-file ./description.md
octo-daemon issue update <issue-id> --description-file ./description.md
```

metadata 是持久化的 issue 状态，不是日志。进入时读，只写未来会被反复读取的高价值事实，如 `pr_url`、`pr_number`、`pipeline_status`、`deploy_url`、`external_issue_url`、`waiting_on`、`blocked_reason`、`decision`。

```bash
octo-daemon issue metadata set <issue-id> --key pr_url --value <url>
octo-daemon issue metadata delete <issue-id> --key stale_key
```

## Mention 副作用

mention 链接是**动作**，不是装饰：

```text
[@名字](mention://agent/<agent-id>)   # 触发该专家（Agent）运行
[@名字](mention://squad/<squad-id>)   # 触发该专家团（Squad）的 leader 运行
[@名字](mention://member/<user-id>)   # 渲染人员链接（仅通知）
[<issue-key>](mention://issue/<issue-id>) # 渲染 issue 链接（安全）
[@all](mention://all/all)             # 广播，不触发具体 agent 运行
```

只有 `agent`（专家）和 `squad`（专家团）mention 会**触发 agent 工作**。`member` 是人员链接（仅通知），`issue` 是安全的交叉引用。

构造 mention 前先用 JSON 输出查真实 UUID：

```bash
octo-daemon agent list --output json      # 专家
octo-daemon squad list --output json      # 专家团
octo-daemon workspace member list --output json
```

不要为了道谢、确认、收尾而 @某专家。回复里再次 @对方专家可能触发新一轮运行，形成死循环。

## 状态与分配副作用

改状态不是"改个样式"，会触发或停止工作：

- `backlog` 会**停泊**一个已分配给专家的 issue；
- 从 `backlog` 转到 `todo` 或其他活跃状态，可能**触发**受派专家运行；
- `done` 与 `cancelled` 是终态；
- `in_review` 适合 PR / 人工评审待定时使用，但它仍是一次写操作。

为有序工作创建子 issue 时，用 stage + `backlog` 表达顺序：

```bash
octo-daemon issue create --title "Research" --parent <id> --assignee <agent> --stage 1 --status todo
octo-daemon issue create --title "Build" --parent <id> --assignee <agent> --stage 2 --status backlog
octo-daemon issue children <id> --output json
```

## Pull Request

为某 Octo issue 改代码时，把可路由的 issue key 放进 PR 标题、正文或分支名，Octo 才能关联。

```text
<issue-key>: fix login redirect
```

只有"合并 PR 即应关闭 issue"时才用关闭意图：

```text
Closes <issue-key>
Fixes <issue-key>
Resolves <issue-key>
```

从 Octo 读关联 PR 状态，不要靠 GitHub 搜索或猜：

```bash
octo-daemon issue pull-requests <issue-id> --output json
```

## 外部 Agent 边界

外部 agent 不会自动拿到 Octo runtime 上下文。用户要求处理某个 issue 或评论时，必须获取或推导：

- issue id 或 issue key；
- 触发评论 id 与其父话题（若要回复）；
- 目标工作区 / profile（配置了多个时）；
- 是否允许写操作；
- 是否允许 mention、改状态、重新触发、分配 / 派单。

若其中任何一项缺失且操作会写状态，先问再动。只读调查则用 JSON 输出收集上下文，并说明还缺什么。
