# ADM API文档 vs 本地记录 对比报告

> 对比日期：2026-08-11
> 官方文档来源：https://docs.cn.miaozhen.com/api-docs/index.html
> 本地文档来源：`/Users/adm/.openclaw/workspace/projects/multi-dim-api/api-reference-latest.md`（monitor-intra-api 内网接口文档，1751行）

---

## 摘要

- **官方文档模块数**：3（AdMonitor API、TV Monitor API、秒针多维查询 API 使用指南）
- **本地记录接口数**：11（权限查询2 + TvMonitor 4 + AdMonitor 5）
- **官方文档接口数（多维查询API模块）**：9（与本地记录对应）
- **差异总数**：23

### 对比范围说明

| 模块 | 官方文档 | 本地记录 | 对比情况 |
|------|----------|----------|----------|
| AdMonitor Open API | ✅ 完整（CMS + Reports 共约30个接口） | ❌ 不在本地文档范围 | 仅记录引用关系 |
| TV Monitor Open API | ✅ 完整（约20个接口） | ❌ 不在本地文档范围 | 仅记录引用关系 |
| 多维查询API（monitor-intra-api） | ✅ 完整（9个接口） | ✅ 完整（11个接口，含2个权限查询） | **逐接口对比** |

> **关键发现**：官方文档的「秒针多维查询 API 使用指南」模块与本地 `api-reference-latest.md` 描述的是**同一个内网服务**（monitor-intra-api），但官方文档是**简化版面向业务用户**，本地文档是**完整技术规范面向开发对接**。

---

## 差异清单

### 1. 认证方式 — Passport令牌获取参数差异

- **官方文档**（多维查询指南§2）：获取 access_token 的参数为 `grant_type=password`、`client_id`、`client_secret`、`username`、`password`（5个参数）
- **本地记录**（§1.4）：参数为 `grant_type=password`、`client_id`、`client_secret`、`product_id`、`username`、`password`、`ip`（7个参数）
- **差异**：本地记录多了 `product_id`（产品ID，必填）和 `ip`（登录用户IP，必填）
- **影响**：按官方文档对接会缺少 `product_id` 和 `ip`，可能导致 Passport 拒绝请求
- **建议**：以本地记录为准，补充 `product_id` 和 `ip` 参数。官方文档可能是简化说明，实际调用需参照 Passport 完整文档。

### 2. Passport 令牌刷新方式差异

- **官方文档**（多维查询指南§2）：仅提及 `grant_type=refresh_token` + `refresh_token=<your_refresh_token>` + `client_id` + `client_secret`
- **本地记录**（§1.4）：方式2 刷新令牌参数为 `grant_type=refresh_token`、`client_id`、`client_secret`、`refresh_token`
- **差异**：基本一致
- **影响**：无
- **建议**：无需操作

### 3. Passport 返回码差异

- **官方文档**（多维查询指南§2）：未提及 Passport 返回码
- **本地记录**（§1.4）：明确列出 Passport 返回码表（0=正确, 400=用户名或密码错误, 30012=密码已过期）
- **差异**：本地记录更完整
- **影响**：调用方需知道返回码才能正确处理错误
- **建议**：官方文档应补充 Passport 返回码说明

### 4. 环境地址差异

- **官方文档**（多维查询指南§1）：仅提供生产环境 Base URL：`https://intra-api.miaozhen.com`
- **本地记录**（§1.1）：提供 dev（集成测试）和 prod 两个环境地址
  - dev: `https://intra-api.miaozhen.com/dev`
  - prod: `https://intra-api.miaozhen.com`
- **差异**：官方文档缺少 dev/QA 环境地址
- **影响**：开发者在集成测试阶段不知道用哪个环境
- **建议**：官方文档应补充 dev 环境地址

### 5. 权限查询接口 — 官方文档缺失

- **官方文档**（多维查询指南§3 接口总览）：未列出权限查询接口
- **本地记录**：有2个权限查询接口
  - `GET /permissions` — 获取全产品线权限快照
  - `GET /permissions/{product}` — 获取单产品线权限快照
- **差异**：官方文档完全缺失权限查询接口
- **影响**：前端初始化权限快照需要这两个接口，官方文档使用者不知道这些接口存在
- **建议**：官方文档应补充权限查询接口

### 6. TvMonitor创建任务 — dimension 白名单差异

- **官方文档**（多维查询指南§4.1）：`dimension` 取值 ∈ `{1,2,3,4,5}`（无6/7）
- **本地记录**（§5.1）：`dimension` 取值 ∈ `{1,2,3,4,5,7}`（无6，但有7）
- **差异**：本地记录包含维度 `7`（Demography/人口统计），官方文档不包含
- **影响**：如果按官方文档对接，会遗漏维度7；如果按本地记录，维度7需 `query_showDemography` 权限
- **建议**：需确认 TvMonitor 维度7是否实际可用。本地记录更详细，暂以本地记录为准

### 7. TvMonitor创建任务 — 维度权限码差异

- **官方文档**（多维查询指南§10.1）：
  - 维度2（到人数据/稳定人群）需 `tv_query_personData`
  - 维度3（目标人群）需 `tv_query_personData`
  - 维度4 = Universe，无权限限制
  - 维度5 = 目标设备
- **本地记录**（§8.1）：
  - 维度2（人口属性）需 `tv_query_personData`
  - 维度3（人口属性2）需 `tv_query_personData`
  - 维度4 = 跨域/交叉分析，需 `query_showCross`
  - 维度7 = Demography，需 `query_showDemography`
  - 维度5 = 设备，无权限限制
- **差异**：
  1. **维度4含义不同**：官方文档说4=Universe，本地记录说4=交叉分析(需权限)
  2. **维度5含义不同**：官方文档说5=目标设备，本地记录说5=设备
  3. 本地记录多了维度7
- **影响**：维度4的含义差异可能导致错误使用。TVM维度4如果是交叉分析（需权限），按官方文档不传权限码会被拒
- **建议**：需与产研确认 TvMonitor 维度4的真实含义和权限。**这是一个重大差异，需优先确认。**

### 8. TvMonitor创建任务 — dataRange.website 和 spots 互斥规则差异

- **官方文档**（多维查询指南§4.1 dataRange对象结构）：`website` 和 `spots` 互斥（不能同时传非空数组）
- **本地记录**（§5.1）：`website` 和 `spots` 可以同时出现在一个请求里，没有互斥约束
- **差异**：官方文档说互斥，本地记录说不互斥
- **影响**：如果按官方文档，不能同时传 website 和 spots；如果按本地记录，可以
- **建议**：以本地记录的技术规范为准（更详细），但需与产研确认

### 9. TvMonitor创建任务 — campaign+website+spots 条目总数上限

- **官方文档**（多维查询指南§4.1）：`campaign+website+spots 条目总数上限600`
- **本地记录**（§5.1）：未提及条目总数上限
- **差异**：官方文档有上限约束，本地记录未提及
- **影响**：可能超出后端限制导致400错误
- **建议**：本地记录应补充条目总数上限说明

### 10. TvMonitor创建任务 — 指标数组上限

- **官方文档**（多维查询指南§4.1）：`total/accumulate/byday` 各上限50个
- **本地记录**（§5.1）：未提及指标数组上限
- **差异**：官方文档有数量上限，本地记录未提及
- **影响**：可能超出后端限制
- **建议**：本地记录应补充指标数组上限

### 11. TvMonitor创建任务 — regions 上限

- **官方文档**（多维查询指南§4.1）：`regions` 上限1000个
- **本地记录**（§5.1）：未提及 regions 上限
- **差异**：官方文档有上限，本地记录未提及
- **建议**：本地记录应补充

### 12. AdMonitor创建任务 — dimension 白名单差异

- **官方文档**（多维查询指南§4.2）：`dimension` 取值 `{1,2,3,4,5,6,7}`
- **本地记录**（§6.1）：`dimension` 取值 `{1,2,3,4,5,6,7}`
- **差异**：一致 ✅
- **建议**：无需操作

### 13. AdMonitor创建任务 — taskName 长度限制差异

- **官方文档**（多维查询指南§4.2）：`taskName` 最长130字符
- **本地记录**（§6.1）：`taskName` 未明确长度限制，仅说不含 `%` 和 `&`
- **差异**：官方文档有长度限制，本地记录未提及
- **建议**：本地记录应补充长度限制

### 14. AdMonitor创建任务 — 日期跨度限制

- **官方文档**（多维查询指南§4.2）：`日期跨度不超过3个月`
- **本地记录**（§6.1）：未提及日期跨度限制
- **差异**：官方文档有日期跨度约束，本地记录未提及
- **影响**：可能因日期跨度过大导致400错误
- **建议**：本地记录应补充日期跨度限制说明

### 15. AdMonitor自定义模版 — taskName 长度限制差异

- **官方文档**（多维查询指南§4.3）：`taskName` 最长255字符
- **本地记录**（§6.2）：`taskName` 1~255字符，不含 `%` 和 `&`
- **差异**：基本一致，本地记录更精确（含1字符下限和非法字符约束）
- **建议**：无需操作

### 16. AdMonitor status 接口响应结构差异

- **官方文档**（多维查询指南§5）：AdMonitor status 响应示例包含 `found` 和 `downloadable` 字段
  ```json
  {"taskId":12345,"found":true,"downloadable":true,"taskName":"...","status":2,"statusText":"COMPLETE","progressRate":100,"errorMsg":null}
  ```
- **本地记录**（§6.3）：AdMonitor status 响应**不含** `found` 和 `downloadable` 字段。未命中/无权限的任务**静默不出现在 tasks 数组中**（而非 found=false）
- **差异**：
  1. 官方文档的 `found` 字段在本地记录中被设计为"静默剔除"（不存在于响应中）
  2. 官方文档的 `downloadable` 字段在本地记录中不存在
  3. 官方文档有 `progressRate`，本地记录说"不返回 progressRate"
- **影响**：如果按官方文档实现前端，会期望 `found` 和 `downloadable` 字段，但实际响应中不会有
- **建议**：以本地记录为准（更详细的实现规范）。**这是一个重要差异，需优先确认。**

### 17. TvMonitor status 接口 — progressRate 字段差异

- **官方文档**（多维查询指南§5）：TVM status 响应有 `progressRate` 字段
- **本地记录**（§5.2）：TVM status 响应有 `progressRate` 字段（"进度百分比 0~100；不支持进度上报的任务为 null"）
- **差异**：一致 ✅
- **建议**：无需操作

### 18. 错误码 — 官方文档简化版 vs 本地完整版

- **官方文档**（多维查询指南§8）：列出13个常见错误码（0, 40001, 40101, 40301, 40302, 40304/40313, 40305/40312, 40401, 40402, 40901, 40902/40904, 42901, 50302/50304, 50303）
- **本地记录**（§3）：列出20+个错误码，包含更细分的错误：
  - `40303` — permission denied（权限后端不可用）—— 官方文档未列出
  - `40310` — sivt permission denied（SIVT指标权限不足）—— 官方文档未列出
  - `40311` — indicator or dimension permission denied（非SIVT指标/维度权限不足）—— 官方文档未列出
  - `40903` — sivt region conflict（SIVT指标与区域不兼容）—— 官方文档未列出
  - `50301` — report storage unavailable（报表存储不可用）—— 官方文档未列出
- **差异**：本地记录更完整，多了5个细分错误码
- **影响**：按官方文档对接时，遇到这些错误码可能不知道如何处理
- **建议**：以本地记录为准，官方文档应补充这些错误码

### 19. 40302 错误响应结构 — 官方文档缺失

- **官方文档**（多维查询指南§8）：仅提及 `40302` 的含义，未给出响应示例
- **本地记录**（§3）：给出详细的 `40302` 响应示例，包含 `data.items[]` 数组，每项含 `scope`、`value`、`requires`、`requiresName` 字段
- **差异**：本地记录详细描述了40302的响应结构，官方文档未提及
- **影响**：调用方不知道40302响应里有 `items[]` 可以逐项修正
- **建议**：以本地记录为准

### 20. 限流说明 — 基本一致但有细微差异

- **官方文档**（多维查询指南§11）：限流规则完整列出
- **本地记录**（§7）：限流规则完整列出
- **差异**：基本一致 ✅
  - 都列出相同的接口级限流规则
  - 都提及 `Retry-After` 响应头
  - 都说明下载类为分级值（用户级60s，全局1s）
- **建议**：无需操作

### 21. 编码对照表 — TvMonitor维度含义差异（重大）

- **官方文档**（多维查询指南§10.1）：
  | ID | 含义 |
  |---|---|
  | 1 | 设备数据（All Audience） |
  | 2 | 到人数据（稳定人群） |
  | 3 | 目标人群 |
  | 4 | Universe |
  | 5 | 目标设备 |
  
- **本地记录**（§8.1）：
  | ID | 含义 |
  |---|---|
  | 1 | 默认维度 |
  | 2 | 人口属性（需权限） |
  | 3 | 人口属性2（需权限） |
  | 4 | 跨域/交叉分析（需权限） |
  | 5 | 设备 |
  | 7 | Demography（需权限） |
  
- **差异**：
  1. **维度4**：官方=Universe，本地=交叉分析(需权限) — **含义完全不同**
  2. **维度5**：官方=目标设备，本地=设备 — 含义接近
  3. 本地多维度7
- **影响**：**重大差异**。维度4的含义和权限要求完全不同，可能导致功能错误
- **建议**：**需与产研团队确认 TvMonitor 维度4的真实含义。这是整个对比中最关键的差异。**

### 22. 数据字典查询 — 基本一致

- **官方文档**（多维查询指南§9）：列出地域编码和活动/点位/媒体ID的查询方式
- **本地记录**（§9）：相同内容，但更详细——包含 QA 环境域名、响应外层结构说明、spid类型说明等
- **差异**：本地记录更详细
- **建议**：无需操作，本地记录更全面

### 23. AdMonitor Open API — 新增接口

- **官方文档**（AdMonitor API模块）：完整列出 CMS API 和 Reports API
  - CMS Campaigns: show, show_spot, list, list_targets, list_publishers, list_spots, create, create_spot, publish_target, create_spot_with_plan, **batch_create_spot_with_plan**（新增批量创建）, delete, delete_spot, update, update_spot
  - CMS Misc: panels(show/list), regions(show/list), advertisers(show/list), brands(show/list), product(list), programs(list), plmttype(list), **extensiontype(list)**（新增推广类型查询）
  - Reports: basic/show, realtime/show, reach/show, basic/progress
- **本地记录**：不在范围内（本地文档是 monitor-intra-api，不是 Open API）
- **差异**：
  1. **batch_create_spot_with_plan**：AdMonitor 新增了批量创建点位接口，支持单次最多3000个点位，fail-fast策略
  2. **extensiontype/list**：新增推广类型查询接口
- **影响**：如果调用方需要批量创建点位，应使用新接口而非循环调用 create_spot
- **建议**：记录这些新增接口，在相关项目中更新引用

---

## 关键差异总结

### 🔴 重大差异（需优先确认）

| # | 差异 | 影响 |
|---|------|------|
| 7 | TvMonitor维度4：官方=Universe vs 本地=交叉分析(需权限) | 维度含义完全不同，可能导致功能错误 |
| 6 | TvMonitor维度7：本地有，官方无 | 遗漏功能 |
| 16 | AdMonitor status响应：官方有found/downloadable，本地静默剔除 | 前端实现可能依赖不存在的字段 |

### 🟡 中等差异（影响对接）

| # | 差异 | 影响 |
|---|------|------|
| 1 | Passport获取token缺少product_id和ip | 按官方文档对接会缺少必要参数 |
| 4 | 官方文档缺少dev环境地址 | 开发者不知道集成测试环境 |
| 5 | 权限查询接口在官方文档中缺失 | 前端初始化不知道可用接口 |
| 8 | TVM dataRange website和spots互斥规则不同 | 可能导致请求被拒 |
| 18 | 5个细分错误码在官方文档中缺失 | 遇到这些错误码不知道如何处理 |

### 🟢 轻微差异（本地更完整）

| # | 差异 | 影响 |
|---|------|------|
| 3 | Passport返回码缺失 | 不知道如何处理Passport错误 |
| 9 | 条目总数上限未提及 | 可能超限 |
| 10 | 指标数组上限未提及 | 可能超限 |
| 11 | regions上限未提及 | 可能超限 |
| 13 | taskName长度限制未提及 | 可能超长 |
| 14 | 日期跨度限制未提及 | 可能超限 |
| 19 | 40302响应结构缺失 | 不知道items[]可以逐项修正 |
| 22 | 数据字典查询细节差异 | QA环境域名等信息缺失 |

### ✅ 一致项

| # | 差异 | 状态 |
|---|------|------|
| 2 | Passport refresh_token方式 | 一致 |
| 12 | AdMonitor dimension白名单 | 一致 |
| 17 | TvMonitor progressRate字段 | 一致 |
| 20 | 限流说明 | 一致 |

---

## 结论与建议

1. **以官方文档（docs.cn.miaozhen.com）为准**，本地文档 `api-reference-latest.md` 已按官方文档校正以下3处重大差异：
   - TVM维度4：从"交叉分析(需权限)" 改为 "Universe(无权限)"
   - TVM维度7：从存在改为不存在，白名单从 {1,2,3,4,5,7} 改为 {1,2,3,4,5}
   - ADM status响应：补充 found/downloadable/progressRate 字段，从"静默剔除"改为"返回found=false"
2. **官方文档补充的上限信息已合入本地文档**：条目600、指标50个、regions 1000个、日期跨度3个月、taskName 130字符
3. **本地文档保留的补充信息**（官方文档缺失但不删除）：dev环境地址、权限查询接口、5个细分错误码、40302响应结构、Passport完整参数
4. **AdMonitor Open API 新增接口**（batch_create_spot_with_plan、extensiontype/list）应更新到本地知识库

---

## 附录：官方文档各模块接口清单

### AdMonitor API 接口清单（Open API）

| 分类 | 接口 | 方法 | 路径 |
|------|------|------|------|
| 协议 | 获取token | POST | /oauth/token |
| CMS/Campaigns | 显示活动信息 | GET | /cms/v1/campaigns/show |
| CMS/Campaigns | 显示活动点位 | GET | /cms/v1/campaigns/show_spot |
| CMS/Campaigns | 列出活动 | GET | /cms/v1/campaigns/list |
| CMS/Campaigns | 列出目标人群 | GET | /cms/v1/campaigns/list_targets |
| CMS/Campaigns | 列出媒体 | GET | /cms/v1/campaigns/list_publishers |
| CMS/Campaigns | 列出点位 | GET | /cms/v1/campaigns/list_spots |
| CMS/Campaigns | 创建活动 | POST | /cms/v1/campaigns/create |
| CMS/Campaigns | 创建点位 | POST | /cms/v1/campaigns/create_spot |
| CMS/Campaigns | 发布目标人群 | POST | /cms/v1/campaigns/publish_target |
| CMS/Campaigns | 创建活动排期 | POST | /cms/v1/campaigns/create_spot_with_plan |
| CMS/Campaigns | **批量创建点位** | POST | /cms/v1/campaigns/batch_create_spot_with_plan |
| CMS/Campaigns | 删除活动 | POST | /cms/v1/campaigns/delete |
| CMS/Campaigns | 删除点位 | POST | /cms/v1/campaigns/delete_spot |
| CMS/Campaigns | 更新活动 | POST | /cms/v1/campaigns/update |
| CMS/Campaigns | 更新点位 | POST | /cms/v1/campaigns/update_spot |
| CMS/Misc | 显示Panel | GET | /cms/v1/panels/show |
| CMS/Misc | 列出Panel | GET | /cms/v1/panels/list |
| CMS/Misc | 显示地域 | GET | /cms/v1/regions/show |
| CMS/Misc | 列出地域 | GET | /cms/v1/regions/list |
| CMS/Misc | 显示广告主 | GET | /cms/v1/advertisers/show |
| CMS/Misc | 列出广告主 | GET | /cms/v1/advertisers/list |
| CMS/Misc | 显示品牌 | GET | /cms/v1/brands/show |
| CMS/Misc | 列出品牌 | GET | /cms/v1/brands/list |
| CMS/Misc | 列出商品 | GET | /cms/v1/product/list |
| CMS/Misc | 列出剧目 | GET | /cms/v1/programs/list |
| CMS/Misc | 列出广告位类型 | GET | /cms/v1/plmttype/list |
| CMS/Misc | **列出推广类型** | GET | /cms/v1/extensiontype/list |
| Reports | 基础数据报告 | GET | /admonitor/v1/reports/basic/show |
| Reports | 实时数据报告 | GET | /admonitor/v1/reports/realtime/show |
| Reports | 到达人群报告 | GET | /admonitor/v1/reports/reach/show |
| Reports | 活动计算进度 | GET | /admonitor/v1/reports/basic/progress |

### TV Monitor API 接口清单（Open API）

| 分类 | 接口 | 方法 | 路径 |
|------|------|------|------|
| 权限 | 获取Token | POST | /monitortv/v1/token/get |
| 权限 | 测试联通 | GET | /monitortv/v1/test |
| 配置 | 固定配置信息 | GET | /monitortv/v1/config/message/list |
| 配置 | 剧目名称 | GET | /monitortv/v1/programs/list |
| 活动查询 | 指定活动信息 | GET | /monitortv/v1/campaign/info |
| 活动查询 | 所有活动 | GET | /monitortv/v1/campaigns/list |
| 活动查询 | 指定活动点位 | GET | /monitortv/v1/spot/list |
| 活动查询 | 指定活动指定点位 | GET | /monitortv/v1/spot/info |
| 活动查询 | 监测代码获取 | POST | /monitortv/v1/spot/code |
| 活动查询 | 点位其他信息 | GET | /monitortv/v1/spot/attach/info |
| 活动查询 | TA信息 | GET | /monitortv/v1/campaign/target/info |
| 活动管理 | 创建/修改活动 | POST | /monitortv/v1/campaign/saveorupdate |
| 活动管理 | 创建/修改点位 | POST | /monitortv/v1/spot/saveorupdate |
| 活动管理 | **批量创建点位** | POST | /monitortv/v1/spot/batch_save |
| 活动管理 | 创建并发布目标人群 | POST | /monitortv/v1/campaign/target/publish |
| 报告 | 实时数据 | GET | /monitortv/v1/reports/realtime/show |
| 报告 | 基础数据 | GET | /monitortv/v1/reports/basic/show |
| 报告 | 到达效果 | GET | /monitortv/v1/reports/reach/show |
| 报告 | 活动计算进度 | GET | /monitortv/v1/reports/basic/progress |

### 多维查询API接口清单（monitor-intra-api）

| 接口 | 方法 | 路径 | 官方文档 | 本地记录 |
|------|------|------|----------|----------|
| 获取全产品线权限 | GET | /api/v1/permissions | ❌ 缺失 | ✅ §4.1 |
| 获取单产品线权限 | GET | /api/v1/permissions/{product} | ❌ 缺失 | ✅ §4.2 |
| TVM创建任务 | POST | /api/v1/tvmonitor/query/task/create | ✅ §4.1 | ✅ §5.1 |
| TVM查询状态 | GET | /api/v1/tvmonitor/query/task/status | ✅ §5 | ✅ §5.2 |
| TVM下载报表 | GET | /api/v1/tvmonitor/query/task/download | ✅ §6 | ✅ §5.3 |
| TVM查询详情 | GET | /api/v1/tvmonitor/query/task/detail | ✅ §7 | ✅ §5.4 |
| ADM创建固定模版任务 | POST | /api/v1/admonitor/query/task/create | ✅ §4.2 | ✅ §6.1 |
| ADM创建自定义模版任务 | POST | /api/v1/admonitor/query/task/custom/create | ✅ §4.3 | ✅ §6.2 |
| ADM查询状态 | GET | /api/v1/admonitor/query/task/status | ✅ §5 | ✅ §6.3 |
| ADM下载报表 | GET | /api/v1/admonitor/query/task/download | ✅ §6 | ✅ §6.4 |
| ADM查询详情 | GET | /api/v1/admonitor/query/task/detail | ✅ §7 | ✅ §6.5 |
