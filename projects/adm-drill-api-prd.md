# ADM/TVM 多维钻取 AI-Native 任务接口 — 产品需求文档

> **状态：** v0.3 — 命名规范已统一（古古+AdMonitor 对齐），等 T01-T09 回填  
> **上次更新：** 2026-07-16 17:00  
> **编写：** 古古（PRD 框架 + 场景设计）/ AdMonitor（API 设计 + 数据模型）  
> **目标读者：** 后端/数据开发工程师、测试工程师  
> **变更日志：** v0.2→v0.3：统一维度键名/模板ID/平台缩写/时间粒度/限流参数，补充 reach_pct/universe/sample_size 指标

---

## 1. 项目背景与目标

### 1.1 现状痛点
当前 ADM/TVM 多维钻取**仅有界面操作，无公开 API**。业务同事如果想让自有 AI agent 做自动化报告，必须人工导出数据后再喂给 agent，无法端到端自动。

已有 API（basic/show、realtime/show、reach/show、sivt/show）是**同步即时查询**，仅适用于简单数据拉取，不支持：
- 多维度交叉下钻
- 异步大查询（跨月/多维度交叉易超时）
- 任务排队与结果下载

### 1.2 需求来源
业务同事需要通过自有 agent 提交钻取任务，系统自动计算后返回结构化数据+摘要，agent 包装为报告输出。

### 1.3 目标
| 目标 | 说明 |
|------|------|
| Agent-Native | 接口参数结构化、错误信息可读、支持 LLM 直接调用 |
| 异步任务 | 大查询排队计算，不阻塞 agent 进程 |
| 结果可消费 | JSON/CSV/Excel 多格式 + 自然语言摘要 |
| 渐进扩展 | v1 先做 ADM 多维钻取，v2 扩展 TVM |

### 1.4 边界
- **不做：** 同步查询（< 2s 返回）——已有 show API 覆盖
- **不做：** 数据修改/写入——仅读分析
- **不做：** 复杂交互式可视化——结果以数据 + 文字摘要为主
- **不做：** Demography/App/OS/终端/联网方式/Keywords/Minisite/Reach%-UG/Est 等"仅界面维度"——v1 暂不覆盖

---

## 2. 用户故事与使用场景

### 2.1 用户画像
| 角色 | 典型代表 | 能力 |
|------|----------|------|
| **业务 Agent** | 客户侧自动化工具、销售团队的 AI 助手 | 能调用 REST API、解析 JSON 摘要、推送飞书/企微 |
| **产品经理** | 秒针内部做周报/月报 | 需要批量多维度交叉分析，汇总为多章节报告 |

### 2.2 使用场景

**场景 1：定时日报——Agent 自动拉取昨日数据**
```
Agent: "提交任务：查询 act_12345 昨日曝光量，按媒体和广告位下钻"
→ POST /admonitor/v1/drill/tasks
→ 轮询状态 completed
→ 获取结果摘要："曝光量 2.1M，腾讯开屏占比 45%，CTR 1.2%"
→ 推送到飞书群
```

**场景 2：即时排查——"CTR 为什么掉了"**
```
销售："帮我看看这周 CTR 异常"
Agent: 提交任务：按 地域×媒体×时段 交叉分析 CTR
→ 15 分钟后收到带关键发现的报告：
  "北京地域腾讯 CTR 异常偏低（0.8%），其他地域正常（1.5%），
   建议排查北京腾讯素材"
```

**场景 3：周报自动生成**
```
Agent 提交多组钻取任务：
  1. 投放概览（总量、完成率）
  2. TOP媒体贡献（publisher 维度）
  3. SIVT 异常检测（sivt_rate 指标）
  4. 地域分布热力
→ 汇总为多章节周报，带自然语言摘要
```

---

## 3. 系统架构

### 3.1 组件关系
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  业务 Agent     │────→│  任务接口服务   │────→│  多维钻取引擎   │
│  (外部/内部)    │←────│  (新建)         │←────│  (改造适配)     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ↓                         ↓
         ┌─────────────────┐      ┌─────────────────┐
         │  任务队列 & 存储 │      │  鉴权 & 权限    │
         │  (Redis / DB)   │      │  (OAuth2/Key)   │
         └─────────────────┘      └─────────────────┘
```

### 3.2 与现有系统关系
| 系统 | 复用 or 新建 | 说明 |
|------|-------------|------|
| 多维钻取计算引擎 | **改造复用** | 现有异步任务制，需改造为可接收 API 参数替代界面操作 |
| 鉴权体系 | **复用** | OAuth2 + API Key，复用现有 show API 的鉴权 |
| 数据权限模型 | **复用** | 活动授权体系，同 show API |
| 任务队列 | **参考 M+** | M+ 已有 submit→query→download 异步模式，优先复用 |
| 结果存储 | **新建** | 需新建接口层结果存储+过期策略 |
| 回调推送 | **新建** | Webhook 回调机制（v1 可选） |

### 3.3 数据流对比
| 维度 | 现有界面操作 | 新 API |
|------|-------------|--------|
| **入口** | 用户拖拽维度→提交 | Agent POST JSON |
| **模板** | 固定模板/定制模板 | `template_id` 或手动指定维度 |
| **时间** | 界面选择起止 | `date_range.start/end` |
| **地域** | TOP100 / CITY337 | `geo_mode` = `top100` / `city337` + `regions` 可选过滤 |
| **平台** | 根据活动自动匹配 | `platform` = `pc` / `mb` / `pm`（需校验活动类型） |
| **Table拆分** | 系统按规则自动 | `auto_split` = `true`（默认），返回多个 table |
| **结果** | 界面展示 + 下载 Excel | JSON + 摘要 + 下载链接 |

---

## 4. 核心概念

### 4.1 两种模板类型

**A. 固定模板（Preset Template）**
| 模板ID | 名称 | 描述 |
|--------|------|------|
| `fixed_by_campaign` | 按活动 | 按活动维度汇总 |
| `fixed_by_publisher` | 按网站 | 筛选方式=网站，汇总按域名维度输出 |
| `fixed_by_spot` | 按广告位 | 按广告位筛选和汇总 |

**B. 定制模板（Custom Layout）—— Row/Column 自由组合**
- Row 维度：最多 5 个维度集合
- Column 维度：最多 5 个维度集合
- 复杂布局自动触发 Table 拆分规则

### 4.2 维度集合（Dimension Sets）

| 集合名称 | 维度键 | 可选值 | 说明 |
|----------|--------|--------|------|
| 活动集 | `campaign_set` | 活动 ID + 名称数组 | 必填 |
| 时间集 | `time_set` | 起止日期 + 粒度 | 必填 |
| 地域集 | `geo_set` | `top100` / `city337` | PC/MB/PM 通用 |
| 数据维度集 | `data_dimension` | `all_users` / `stable_users` | 人群范围 |
| 人群指标集 | `metric_set` | Imp/Click/UV/Clicker/... | 必填 |
| Mobile 维度集 | `mobile_set` | App/操作系统/联网方式/终端 | MB 活动专用 |
| Keywords 集 | `keywords_set` | 关键词列表 | 有 keywords 的活动专用 |
| Minisite 集 | `minisite_set` | Minisite 站点 | 勾选时拆分 |

### 4.3 维度键名表

| 维度键 | 中文名 | PC | MB | PM | 说明 |
|--------|--------|----|----|-----|------|
| `campaign` | 活动 | ✓ | ✓ | ✓ | |
| `publisher` | 媒体/网站 | ✓ | ✓ | ✓ | 统一键名 |
| `spot` | 广告位 | ✓ | ✓ | ✓ | 统一键名 |
| `region` | 地域 | ✓ | ✓ | ✓ | modes: top100/city337 |
| `creative` | 创意 | ✓ | ✓ | ✓ | |
| `placement_type` | 点位类型 | ✓ | ✓ | ✓ | |
| `device` | 设备 | ✓ | — | ✓ | |
| `app` | App | — | ✓ | ✓ | MB 专用 |
| `os` | 操作系统 | — | ✓ | ✓ | MB 专用 |
| `connection` | 联网方式 | — | ✓ | ✓ | MB 专用 |
| `device_type` | 终端类型 | — | ✓ | ✓ | MB 专用 |

### 4.4 指标全集（Metric Set）

| 指标 | 键 | 单位 | v1 API | 说明 |
|------|-----|------|---------|------|
| 曝光量 | `imp` | 次 | ✓ | |
| 点击量 | `click` | 次 | ✓ | |
| UV | `uv` | 人 | ✓ | |
| Clicker | `clicker` | 人 | ✓ | |
| CTR | `ctr` | % | ✓ | 衍生指标 |
| GRP | `grp` | 点 | ✓ | |
| iGRP | `igrp` | 点 | ✓ | |
| 分频次 Reach | `reach_n_plus` | 人/次 | ✓ | |
| 到达率 | `reach_pct` | % | ✓ | reach/universe×100% |
| Universe | `universe` | 人 | ✓ | 仅 stable 人群有值 |
| 样本量 | `sample_size` | 个 | ✓ | 相交样本量，<300 标红 |
| Est 曝光量 | `est_imp` | 次 | × | 仅界面，v1 不支持 |
| Est 点击量 | `est_click` | 次 | × | 仅界面，v1 不支持 |
| Reach% (UG) | `reach_ug_pct` | % | × | User-Graph 版，v2 补齐 |
| 人群属性 | `demography` | — | × | 仅界面，v2 补齐 |

---

## 5. 接口定义

### 5.1 元数据接口：获取维度/指标/模板清单

**`GET /admonitor/v1/drill/metadata`**

返回所有活动下可用维度、指标、模板及平台匹配规则。

```json
{
  "version": "1.0.0",
  "templates": [
    {
      "template_id": "fixed_by_campaign",
      "name": "按活动",
      "applicable_platforms": ["pc", "mb", "pm"],
      "default_dimensions": ["campaign"],
      "default_metrics": ["imp", "click", "ctr"]
    },
    {
      "template_id": "fixed_by_publisher",
      "name": "按网站",
      "applicable_platforms": ["pc", "mb", "pm"],
      "default_dimensions": ["publisher"],
      "default_metrics": ["imp", "click", "ctr"]
    },
    {
      "template_id": "fixed_by_spot",
      "name": "按广告位",
      "applicable_platforms": ["pc", "mb", "pm"],
      "default_dimensions": ["spot"],
      "default_metrics": ["imp", "click", "ctr"]
    },
    {
      "template_id": "custom",
      "name": "定制模板",
      "description": "自定义 Row/Column 布局，最多各5个维度",
      "applicable_platforms": ["pc", "mb", "pm"]
    }
  ],
  "dimensions": {
    "campaign": { "label": "活动", "applicable": ["pc", "mb", "pm"] },
    "publisher": { "label": "媒体", "applicable": ["pc", "mb", "pm"] },
    "spot": { "label": "广告位", "applicable": ["pc", "mb", "pm"] },
    "region": { "label": "地域", "applicable": ["pc", "mb", "pm"], "modes": ["top100", "city337"] },
    "creative": { "label": "创意", "applicable": ["pc", "mb", "pm"] },
    "placement_type": { "label": "点位类型", "applicable": ["pc", "mb", "pm"] },
    "device": { "label": "设备", "applicable": ["pc", "pm"] },
    "app": { "label": "App", "applicable": ["mb", "pm"] },
    "os": { "label": "操作系统", "applicable": ["mb", "pm"] },
    "connection": { "label": "联网方式", "applicable": ["mb", "pm"] },
    "device_type": { "label": "终端类型", "applicable": ["mb", "pm"] }
  },
  "metrics": {
    "imp": { "label": "曝光量", "unit": "次", "api_available": true },
    "click": { "label": "点击量", "unit": "次", "api_available": true },
    "uv": { "label": "UV", "unit": "人", "api_available": true },
    "clicker": { "label": "Clicker", "unit": "人", "api_available": true },
    "ctr": { "label": "CTR", "unit": "%", "api_available": true },
    "grp": { "label": "GRP", "unit": "点", "api_available": true },
    "igrp": { "label": "iGRP", "unit": "点", "api_available": true },
    "reach_n_plus": { "label": "分频次Reach", "unit": "人/次", "api_available": true },
    "reach_pct": { "label": "到达率", "unit": "%", "api_available": true, "note": "reach/universe×100%" },
    "universe": { "label": "Universe", "unit": "人", "api_available": true, "note": "仅 stable 人群有值" },
    "sample_size": { "label": "样本量", "unit": "个", "api_available": true, "note": "<300 标红" },
    "est_imp": { "label": "Est曝光量", "unit": "次", "api_available": false, "note": "仅界面，v1 不支持" },
    "est_click": { "label": "Est点击量", "unit": "次", "api_available": false, "note": "仅界面，v1 不支持" },
    "reach_ug_pct": { "label": "Reach% (UG)", "unit": "%", "api_available": false, "note": "User-Graph 版，v2 补齐" },
    "demography": { "label": "人群属性", "unit": "—", "api_available": false, "note": "v2 补齐" }
  },
  "time_granularities": [
    { "value": "total", "label": "汇总" },
    { "value": "acc", "label": "累计" },
    { "value": "day", "label": "日" },
    { "value": "hour", "label": "小时" }
  ],
  "platform_rules": {
    "pc": { "allowed_dimensions": ["campaign", "publisher", "spot", "region", "creative", "device", "placement_type"], "allowed_metrics": ["imp", "click", "uv", "clicker", "ctr", "grp", "igrp", "reach_n_plus", "reach_pct", "universe", "sample_size"] },
    "mb": { "allowed_dimensions": ["campaign", "publisher", "spot", "region", "creative", "placement_type", "app", "os", "connection", "device_type"], "allowed_metrics": ["imp", "click", "uv", "clicker", "ctr", "grp", "igrp", "reach_n_plus", "reach_pct", "universe", "sample_size"] },
    "pm": { "allowed_dimensions": ["campaign", "publisher", "spot", "region", "creative", "device", "placement_type", "app", "os", "connection", "device_type"], "allowed_metrics": ["imp", "click", "uv", "clicker", "ctr", "grp", "igrp", "reach_n_plus", "reach_pct", "universe", "sample_size"] }
  }
}
```

### 5.2 提交钻取任务

**`POST /admonitor/v1/drill/tasks`**

**请求体（固定模板模式）：**
```json
{
  "query_name": "KA客户 Q3 媒体下钻分析",
  "template_id": "fixed_by_publisher",
  "activity_ids": ["act_12345", "act_12346"],
  "date_range": {
    "start": "2026-07-01",
    "end": "2026-07-15",
    "granularity": "day"
  },
  "filters": {
    "regions": ["北京", "上海", "广州"],
    "geo_mode": "top100"
  },
  "metrics": ["imp", "click", "ctr", "uv"],
  "output_format": "json",
  "report_options": {
    "generate_summary": true,
    "language": "zh"
  },
  "callback_url": "https://agent.example.com/callback"
}
```

**请求体（定制模板模式）：**
```json
{
  "query_name": "自定义多维度交叉分析",
  "activity_ids": ["act_12345"],
  "date_range": {
    "start": "2026-07-01",
    "end": "2026-07-15",
    "granularity": "day"
  },
  "layout": {
    "row_dimensions": ["publisher", "spot"],
    "column_dimensions": ["region", "creative"],
    "metrics": ["imp", "click", "ctr"]
  },
  "filters": {
    "regions": null,
    "geo_mode": "city337"
  },
  "auto_split": true,
  "output_format": "csv",
  "callback_url": null
}
```

**响应：**
```json
{
  "task_id": "tsk_9a8b7c6d5e4f3a2b",
  "status": "pending",
  "created_at": "2026-07-16T10:00:00+08:00",
  "estimated_seconds": 120,
  "query_url": "https://api.admonitor.cn/admonitor/v1/drill/tasks/tsk_9a8b7c6d5e4f3a2b"
}
```

### 5.3 查询任务状态

**`GET /admonitor/v1/drill/tasks/{task_id}`**

```json
{
  "task_id": "tsk_9a8b7c6d5e4f3a2b",
  "query_name": "KA客户 Q3 媒体下钻分析",
  "status": "running",
  "progress": 45,
  "status_history": [
    { "status": "pending", "timestamp": "2026-07-16T10:00:00+08:00" },
    { "status": "queued", "timestamp": "2026-07-16T10:00:02+08:00" },
    { "status": "running", "timestamp": "2026-07-16T10:00:05+08:00" }
  ],
  "created_at": "2026-07-16T10:00:00+08:00",
  "started_at": "2026-07-16T10:00:05+08:00",
  "completed_at": null,
  "query_params": { },
  "result_url": null,
  "error": null,
  "expires_at": "2026-07-23T10:00:00+08:00"
}
```

### 5.4 获取任务结果

**`GET /admonitor/v1/drill/tasks/{task_id}/result`**

```json
{
  "task_id": "tsk_9a8b7c6d5e4f3a2b",
  "status": "completed",
  "summary": {
    "query_name": "KA客户 Q3 媒体下钻分析",
    "period": "2026-07-01 至 2026-07-15",
    "total_rows": 52,
    "total_tables": 1,
    "key_findings": [
      "曝光量总计 12.3M，前三媒体贡献 78%",
      "腾讯广告位 A 的 CTR 异常偏低（0.8%），建议排查素材或定向",
      "周末曝光量较工作日高出 34%，节奏明显"
    ],
    "notes": [
      "Table 拆分：无（publisher 与 time 在同一方向）"
    ]
  },
  "tables": [
    {
      "table_id": 1,
      "name": "默认表",
      "dimensions": {
        "row": ["publisher", "spot"],
        "column": ["date"]
      },
      "columns": ["日期", "媒体", "广告位", "曝光量", "点击量", "CTR", "UV"],
      "rows": [
        ["2026-07-01", "腾讯", "开屏", 452000, 5424, 0.012, 385000],
        ["2026-07-01", "腾讯", "信息流", 320000, 2880, 0.009, 280000],
        ["2026-07-01", "百度", "搜索广告", 210000, 4200, 0.020, 195000]
      ],
      "total_row": ["合计", "—", "—", 982000, 12504, 0.0127, 860000],
      "data_summary": {
        "imp_total": 982000,
        "click_total": 12504,
        "ctr_avg": 0.0127
      }
    }
  ],
  "download_urls": {
    "csv": "https://cdn.admonitor.cn/drill/result_abc123.csv?token=...",
    "excel": "https://cdn.admonitor.cn/drill/result_abc123.xlsx?token=...",
    "json": "https://cdn.admonitor.cn/drill/result_abc123.json?token=..."
  },
  "generated_at": "2026-07-16T10:02:34+08:00"
}
```

### 5.5 取消任务

**`POST /admonitor/v1/drill/tasks/{task_id}/cancel`**

仅在 `pending`/`queued`/`running` 状态时有效。

### 5.6 列取历史任务

**`GET /admonitor/v1/drill/tasks`**

```
GET /admonitor/v1/drill/tasks?status=completed&limit=20&page=1&activity_id=act_12345
```

---

## 6. 任务状态机

```
pending → queued → running → completed
                     ↓
                 failed / cancelled
```

- **pending**：新建任务，参数校验中
- **queued**：校验通过，等待计算资源（并发限制）
- **running**：正在执行钻取计算
- **completed**：结果可下载，7 天自动过期
- **failed**：错误信息保留，支持重试
- **cancelled**：任务终止，不保留结果

---

## 7. 错误码体系（Agent 友好）

| 错误码 | HTTP | 场景 | Agent 可读提示 |
|--------|------|------|----------------|
| `DRILL_001` | 400 | 缺少必填参数 | 缺少必要参数：`{param}`。请确认请求体包含所有必填字段。 |
| `DRILL_002` | 400 | 维度不支持 | 对当前活动不支持维度 `{dim}`。支持维度：`{supported_list}`。 |
| `DRILL_003` | 400 | 平台不匹配 | 活动 `{act_id}` 是 `{platform_type}` 活动，不能使用 `{dim}` 维度。 |
| `DRILL_004` | 400 | 时间范围超限 | 单次查询最多支持 12 个月，当前请求 {n} 天。建议拆分为多个任务。 |
| `DRILL_005` | 400 | 无数据权限 | 对活动 `{act_id}` 无查询权限，请确认已授权。 |
| `DRILL_006` | 400 | 仅界面指标 | 指标 `{metric}` 仅支持界面查询，API 暂不支持。 |
| `DRILL_101` | 404 | 任务不存在 | 任务 `{task_id}` 不存在或已过期（结果保留 7 天）。 |
| `DRILL_102` | 409 | 任务已取消 | 该任务已取消。如需结果请重新提交。 |
| `DRILL_201` | 429 | 并发超限 | 当前运行任务数已满（{n}/{max}），请稍后重试。 |
| `DRILL_203` | 429 | 频率限制 | 同一参数 60 秒内已提交，返回同一任务：`{task_id}`。 |
| `DRILL_501` | 500 | 钻取引擎故障 | 计算引擎暂时不可用，已自动重试，请稍后查询状态。 |
| `DRILL_502` | 500 | 数据超时 | 查询数据量过大，建议缩小时间范围、减少维度或增加过滤条件。 |

> 注：v1 暂不设日配额（DRILL_202），后续视使用情况再加。

---

## 8. 安全与权限

### 8.1 鉴权
- **API Key + OAuth2**：每次请求 Header 带 `Authorization: Bearer {token}`
- **活动权限校验**：`activity_ids` 中每个活动都需当前用户有查询权限

### 8.2 限流
| 维度 | 限制 | 说明 |
|------|------|------|
| 单用户并发 | 5 running | 超过则 queued |
| 单日提交 | 不设限（v1） | 后续视情况加 |
| 单次时间跨度 | 12 个月 | 超期建议拆分 |
| 单次结果行数 | 100 万行 | 超限返回 truncated + 提示拆分 |
| 幂等窗口 | 60 秒 | 相同参数重试返同一任务 |

### 8.3 数据脱敏
- 活动名称、客户名称自动替换为脱敏标识（活动 ID 保留用于校验）
- 结果数据中不含个人隐私信息

### 8.4 审计日志
- 所有任务提交、状态查询、结果下载操作留痕
- 日志保留 90 天

---

## 9. Table 拆分规则（API 行为对齐界面）

> ⚠️ 核心交互逻辑，需与现有界面行为完全一致

### 触发条件
当以下维度对不在同一方向（Row/Column）时，自动拆分多个 Table：

| 维度对 | 拆分规则 |
|--------|----------|
| Minisite vs 活动集 | Minisite 与活动集不在同方向 → 拆分 |
| 时间集 vs 活动集 | 时间集与活动集不在同方向 → 拆分 |

### API 中的表达
- `auto_split: true`（默认）：系统按拆分规则自动拆表
- `auto_split: false`：强制单表（可能因数据量过大被限流）

### 响应中的多表
```json
{
  "total_tables": 2,
  "tables": [
    { "table_id": 1, "name": "Table 1 — Minisite A" },
    { "table_id": 2, "name": "Table 2 — Minisite B" }
  ]
}
```

---

## 10. 非功能性需求

### 10.1 性能
| 指标 | 目标 | 说明 |
|------|------|------|
| 任务提交延迟 | < 200ms (P99) | 仅参数校验+入队 |
| 常规查询 | < 5 min | 30天内，3维交叉，日粒度 |
| 大查询 | < 15 min | 12个月内，5维交叉 |
| 结果数据上限 | 100万行/任务 | 超限 truncated |
| 结果保留期 | 7 天 | 自动清理 |
| 幂等窗口 | 60 秒 | 相同参数重试返同一任务 |

### 10.2 可用性
- 接口可用性：99.5%（排除计划维护窗口）
- 任务队列可用性：99.9%（核心链路）

---

## 11. 待填补项

| 序号 | 内容 | 负责人 | 状态 |
|------|------|--------|------|
| T01 | 维度/指标完整参数映射表（键名 ↔ 内部字段名） | AdMonitor | 🔄 进行中 |
| T02 | 固定模板完整参数定义 + 默认维度/指标/过滤 | AdMonitor | 🔄 进行中 |
| T03 | 定制模板的 Row/Column 组合校验规则 | AdMonitor | 🔄 进行中 |
| T04 | 平台匹配规则的内部实现方式（活动类型→可用维度） | AdMonitor | 🔄 进行中 |
| T05 | Table 拆分规则的内部算法（Minisite/时间集的活动集方向判断） | AdMonitor | 🔄 进行中 |
| T06 | 现有 M+ submit API 的请求/响应样例（作为异步模式参考） | AdMonitor | 🔄 进行中 |
| T07 | 异步队列技术选型建议（Redis / MQ / 自研） | AdMonitor | 🔄 进行中 |
| T08 | 与现有 show API 的边界场景对照表 | AdMonitor | 🔄 进行中 |
| T09 | 自然语言摘要生成逻辑（summary.key_findings） | 古古 | 🔄 设计中 |

---

## 12. 后续迭代路线

| 阶段 | 内容 | 优先级 | 依赖 |
|------|------|--------|------|
| **v1.0** | 基础任务提交 + 状态查询 + 结果下载（JSON/CSV） | P0 | 无 |
| **v1.1** | 自动报告生成（自然语言摘要 + key_findings） | P1 | T09 |
| **v1.2** | TVM 多维钻取接入（复用同一套接口框架） | P1 | v1.0 稳定 |
| **v1.3** | WebSocket 实时推送（替代轮询） | P2 | v1.0 稳定 |
| **v2.0** | 预置报告模板 + 定时任务调度（cron 触发） | P2 | v1.1 稳定 |
| **v2.1** | "仅界面"维度补齐（Demography/UG/Est） | P3 | 底层数据支持 |
| **v2.2** | 自定义报告格式（PPT/飞书文档自动推送） | P3 | v2.0 稳定 |

---

## 13. v0.2→v0.3 变更记录

| 变更项 | v0.2 | v0.3 | 依据 |
|--------|------|------|------|
| 接口路径 | `/api/v1/drill/` | `/admonitor/v1/drill/` | 与现有 show API 风格一致 |
| 媒体维度键 | `media` | `publisher` | 对齐 AdMonitor 内部字段名 |
| 广告位维度键 | `ad_position` | `spot` | 对齐 AdMonitor 内部字段名 |
| 联网方式 | `connection_type` | `connection` | 对齐 AdMonitor 内部字段名 |
| 终端类型 | `terminal_type` | `device_type` | 对齐 AdMonitor 内部字段名 |
| 平台缩写 | `pc/mobile/pm` | `pc/mb/pm` | 对齐 AdMonitor 内部字段名 |
| 固定模板 ID | `by_media` 等 | `fixed_by_campaign` 等 | 对齐 AdMonitor 命名 |
| 时间粒度 | `hour/day/week/month` | `total/acc/day/hour` | week/month 是界面维度非底层粒度 |
| 并发限制 | 3 | 5 | 以 AdMonitor 技术参数为准 |
| 时间跨度 | 90 天 | 12 个月 | 以 AdMonitor 技术参数为准 |
| 日配额 | 50/天 | 不设限（v1） | 后续视情况加 |
| 分频次 Reach | `reach_n` | `reach_n_plus` | 对齐 AdMonitor |
| 到达率 | `reach_ug_pct`（仅界面） | `reach_pct`（v1 API ✓）+ `reach_ug_pct`（v2） | 拆分通用到达率和 UG 版 |
| Universe | 无 | `universe`（仅 stable 有值） | 新增，Agent 判断数据可信度用 |
| 样本量 | 无 | `sample_size`（<300 标红） | 新增，Agent 判断数据可信度用 |
