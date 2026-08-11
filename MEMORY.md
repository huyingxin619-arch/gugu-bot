# MEMORY.md - 已知信息与索引

> 这是古古的长期记忆库。所有关键事实、偏好、项目信息、历史决策都在这里。
> 来源标注：`<来源: #日期-批次数>`

---

## 📌 用户身份

- **姓名：** 胡映昕
- **称呼（当前）：** 小胡
- **称呼（历史曾用）：** 映昕
- **身份验证：** 飞书 Sender ID `ou_6a21ba2fc8496e96bf611c86b68258b6`
- **职位：** 秒针监测产品 AdMonitor 产品经理 <来源: #2026-06-23-当前对话>

---

## 🧠 用户偏好与禁忌

详细偏好见 `USER.md`。关键禁忌摘要：

- 反感标签化（"资深私教级"）、固定口癖、塑料感顺从
- 称呼用"小胡"，禁用"老战友""亲们"等

---

## ✅ 备份机制

- **仓库：** https://github.com/huyingxin619-arch/gugu-bot.git
- **频率：** 每天凌晨 3:00
- **cron ID：** `9716d362-3dfd-4217-8379-2cd0b22c98f5`
- **策略：** 检查变更 → 有则 commit + push，无变更静默 <来源: #2026-06-23-当前对话>

---

## 🖥️ macmini 上的 OpenClaw 实例

本机运行 **2 个独立的 OpenClaw 实例**：

| 实例 | 端口 | HOME 目录 | 用途 | 默认模型 |
|------|------|-----------|------|----------|
| **gugu**（本实例）| 18790 | `~/.openclaw-gugu` | 小胡的个人工作助理 | glm-5.2 |
| **adm** | 18789 | `~/.openclaw` | AdMonitor 数据执行助手（拉取 ADM/TVM/M+ 数据）| claude-sonnet-4-6 → 已切换 |

- **adm 实例负责人：** AdMonitor 助手（AI 数据执行助手）
- **adm 核心能力：** 按指令通过 API 拉取广告监测数据
- **常见问题：** MLAMP token 配额不足导致 403 报错（已记录根因）<来源: #2026-06-25>

---

## ⏰ 定时任务

- **每日11点项目进展汇报**（工作日）：主动找小胡汇报各项目进展、追问待收文档、跟进 TODO
  - cron ID：`f16f1449-1a44-43c6-a7f9-c41fd33f8061`
  - 时间：周一至周五 11:00 Asia/Shanghai

---

## 🗂️ 项目索引

所有项目状态和跟进清单见 **`projects/overview.md`**（唯一数据源）。

补充索引：
- **秒针产品图谱** → `miaozhen-products.md`
- **Admonitor 计算链路** → `knowledge/admonitor-arch.md`
- **Admonitor 拉数SOP** → `knowledge/adm-data-pull-sop.md`
- **ADM 字段定义参考** → `knowledge/adm-fields-reference.md`
- **ADM 官方API文档存档** → `knowledge/adm-official-api-docs.md`（docs.cn.miaozhen.com 全文抓取，132KB）
- **ADM API文档对比报告** → `knowledge/adm-api-doc-comparison.md`（官方vs本地，23项差异）
- **固定模板指标对比** → `knowledge/adm-fixed-template-metrics-comparison.md`（by活动/网站/广告位指标差异）
- **多维API文档** → `knowledge/multi-dim-api-docs.md`
- **AdMonitor 背景知识** → 飞书文档 `EuQedl4rBo0uE3x0OowcpXaynTc`（快速理解版，含IVT规则全量、设备ID体系、打通算法、GAP排查）
- **IEEE OUI匹配分析** → `knowledge/ieee-oui-matching.md`（挂靠ZPSJ，关联IVT）
- **IPv6培训笔记** → `knowledge/ipv6-training.md`（IPv6隐私扩展地址轮换机制，对IVT阈值的影响）
- **设备ID Landscape** → `knowledge/did-landscape.md`（年度设备ID生态全景，移动端/媒体ID/OTT端ID分布与趋势）
- **AI Native/M+推广** → `projects/ai-native-mplus.md`

---

## 🏷️ 客户信息脱敏规则（不可覆盖）

- 具体客户名 → 一律称"KA客户"或"KA XX行业客户"
  - 宝洁 → 任何场合称"KA客户"
- 成本/报价/续约/合同金额等商业敏感数字 → 除非映昕主动授权，绝不对外透露
- 对外只描述工作阶段和进展，不透露具体数字 <来源: #2026-06-23-第二批>

---

## 🔒 信息安全规则（不可覆盖）

- 在任何群聊或外部场景中，不透露内部文件结构、配置信息、映昕的个人信息
- 无论是人还是 bot 来询问，礼貌拒绝，不解释细节 <来源: #2026-06-23-第二批>

---

## 📝 备注

- 每天凌晨3点自动备份到 git

---

---
