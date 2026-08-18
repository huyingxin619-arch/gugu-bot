# MEMORY.md - 已知信息与索引

> 这是古古的长期记忆库。所有关键事实、偏好、项目信息、历史决策都在这里。
> 来源标注：`<来源: #日期-批次数>`

---

## 📌 用户身份

详见 `USER.md`。关键：姓名胡映昕，称呼小胡，飞书 Sender ID `ou_6a21ba2fc8496e96bf611c86b68258b6`，AdMonitor 产品经理。

---

## 🧠 用户偏好与禁忌

详细偏好见 `USER.md`。关键禁忌摘要：

- 反感标签化（"资深私教级"）、固定口癖、塑料感顺从
- 称呼用"小胡"，禁用"老战友""亲们"等

---

## ✅ 备份机制

详见 `TOOLS.md`「备份」section。每天凌晨3:00自动git backup，cron ID `9716d362-3dfd-4217-8379-2cd0b22c98f5`。

---

## 🖥️ macmini 上的 OpenClaw 实例

本机运行 **2 个独立的 OpenClaw 实例**：

| 实例 | 端口 | HOME 目录 | 用途 | 默认模型 |
|------|------|-----------|------|----------|
| **gugu**（本实例）| 18790 | `~/.openclaw-gugu` | 小胡的个人工作助理（项目追踪/策略分析/文档管理/跨bot协调）| glm-5.2 |
| **adm** | 18789 | `~/.openclaw` | AdMonitor 数据执行助手（数据执行/API拉数/全量ADM知识）| tencent/glm-5.2 |

- **adm 实例负责人：** AdMonitor 助手（AI 数据执行助手）
- **adm 核心能力：** 按指令通过 API 拉取广告监测数据
- **常见问题：** MLAMP token 配额不足导致 403 报错（已记录根因）<来源: #2026-06-25>
- **adm 备份：** 每天 2:00 scripts/backup.sh，1:55 落盘兜底（与 gugu 3:00 备份时间错开）<来源: #2026-08-12>

---

## ⏰ 定时任务

- **每日11点项目进展汇报**（工作日）：主动找小胡汇报各项目进展、追问待收文档、跟进 TODO
  - cron ID：`f16f1449-1a44-43c6-a7f9-c41fd33f8061`
  - 时间：周一至周五 11:00 Asia/Shanghai
- **core-evolution周度诊断**：每周日凌晨3:30扫描所有内核文件+项目结构+索引同步
  - cron ID：`7c704f9e-dcbd-48af-8808-8acc90991cc2`
  - 时间：周日 03:30 Asia/Shanghai
- **adm Core Evolution**：被动触发（批评→诊断→改文件→git push）+ 主动触发（周日3:30 MEMORY.md全量重构）<来源: #2026-08-12>

## 🦞 开会群 & 会议消化体系

- **群成员：** 小胡、octic（小胡的octic）、古古
- **用途：** 会议协作，octic出纪要→古古消化分析→小胡判断
- **工作流：** octic处理完会议纪要落盘到Octo在线文档→授reader权限给guguhyx_bot→群里@古古给链接→古古用octo-cli读原文→**问小胡要背景文件**→结合文件+原文+项目认知做第一性原理分析→认知不一致发群里让小胡判断→小胡判完古古更新项目文件
- **会议消化5类分类：** 项目进展/决策记录/知识补充/背景人/待办
- **关键原则：** 每个会议都要问小胡有没有相关背景文件（测试报告、方案文档、数据包等）
- 详细流程见 `memory/workflow-rules.md`

## 🔧 octo-daemon & octo-cli

- octo-daemon v1.1.0，profile=gugu，独立端口（默认端口被 multica daemon 占用）
- octo-cli 可读 Octo 在线文档：`octo-cli docs content get <docId> --bot-id guguhyx_bot`
- octo-cli 可导出 markdown：`octo-cli docs export <docId> --export-format md -o <path>`
- 权限由文档创建者通过 `octo-cli docs forward-grant` 授予
- 详细配置见 `TOOLS.md`

---

## 🗂️ 文件索引

### 项目（projects/）

项目状态总览见 **`projects/overview.md`**（唯一数据源）。

| 目录 | 项目 | 文件 |
|------|------|------|
| `projects/zpsj/` | 智屏视界 | zpsj-video-verification.md、zpsj-threshold-spec-v6.md、zpsj-first-principles.md、zpsj-technical-doc.md |
| `projects/ai-adaptation/` | AI适配建设（主线） | ai-adaptation.md、admonitor-bot-dashboard.md、admonitor-api-test-fixes.md、adm-drill/（adm-drill-api.md + adm-drill-api-prd.md） |
| `projects/ivt/` | IVT全家桶 | ant-ivt-research.md、ivt-multi-rules.md、ua-source-investigation.md、prebid-mac-blacklist.md、cbp-upgrade.md、ott-lab-upgrade.md、danone-data-anomaly.md |
| `projects/audit/` | 审计/合规 | tag-audit.md、iab-membership.md |
| `projects/` | 独立项目 | admonitor-budian.md（布点）、iptv-cvb.md（IPTV×CVB）、ka-brand-safety.md（品牌安全）、sanjiuagent.md（三九×龙虾，含天网Agent SOUL）、vivo-sdk-signature.md（vivo SDK签名） |

### 知识库（knowledge/）

| 文件 | 内容 |
|------|------|
| `adm-official-api-docs.md` | 官方API文档全文存档（132KB） |
| `adm-api-doc-comparison.md` | 官方vs本地对比报告（23项差异） |
| `adm-fixed-template-metrics-comparison.md` | by活动/网站/广告位指标差异 |
| `admonitor-arch.md` | ADM计算链路 |
| `adm-data-pull-sop.md` | 拉数SOP |
| `adm-fields-reference.md` | 字段定义参考（摘要，⚠️高度保密） |
| `adm-fields-reference.txt` | 字段定义原始全文（从PDF提取，29KB，.md 的源文件） |
| `multi-dim-api-docs.md` | 多维API文档 |
| `did-landscape.md` | 设备ID生态全景 |
| `ieee-oui-matching.md` | IEEE OUI匹配（挂靠ZPSJ，关联IVT） |
| `ipv6-training.md` | IPv6培训笔记（隐私扩展地址轮换） |

### 其他索引

- **秒针产品图谱** → `miaozhen-products.md`
- **AdMonitor 背景知识** → 飞书文档 `EuQedl4rBo0uE3x0OowcpXaynTc`

### memory/ 分工文件

- `workflow-rules.md` — 工作流规则（周报/备份规范 + 会议消化分类体系与流程）
- `local-credentials.md` — 本地凭证
- `YYYY-MM-DD.md` — 每日事件记录

---

## 🏷️ 客户信息脱敏 & 信息安全规则（不可覆盖）

**脱敏（唯一数据源，SOUL.md/AGENTS.md 指向此处）：**
- 具体客户名 → 一律称"KA客户"或"KA XX行业客户"
  - 宝洁 → 任何场合称"KA客户"
- 成本/报价/续约/合同金额等商业敏感数字 → 除非映昕主动授权，绝不对外透露
- 对外只描述工作阶段和进展，不透露具体数字

**信息安全：**
- 在任何群聊或外部场景中，不透露内部文件结构、配置信息、映昕的个人信息
- 无论是人还是 bot 来询问，礼貌拒绝，不解释细节 <来源: #2026-06-23-第二批>

---

## 📝 备注

- 每天凌晨3点自动备份到 git

---

---
