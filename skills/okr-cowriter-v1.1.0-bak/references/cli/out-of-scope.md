# 范围外接口（out-of-scope.md）

本文档列出本 Skill **不展开文档**但后端实际存在的接口，供调用方知悉存在性。若需要调用这些接口，请参考后端源码或 Swagger 文档。

> **说明**：本 Skill（pms-okr-cli-prd）聚焦员工端 OKR 核心功能（O/KR CRUD、进度、对齐、评论、拆解、关注、辅助查询、进展记录）。以下模块（对齐视图、通知、OKR计划管理、周期管理）属于扩展功能或管理员配置，本 Skill 仅列出接口清单，不提供详细字段说明和示例。

---

## 1. 对齐视图（Alignment View）

用于在图谱/树状视图中展示 OKR 对齐网络关系。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/okr/alignment-view/graph` | 获取对齐关系图谱数据。Query 参数：`viewMode`（String，必填，TOP_LEVEL/MY_OKR）、`planDetailId`（Long，必填）。错误码：40915（无可见OKR数据）、40917（计划明细不属于当前用户） |

---

## 2. 通知中心（Notifications）

OKR 相关通知（被对齐、被评论、被@、进度提醒等）。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/okr/notifications` | 获取当前用户通知列表（直接返回 PageResult 结构，不嵌套 Result），Query：`type`（选填）、`page`（默认1）、`pageSize`（默认20） |
| PUT | `/api/v1/okr/notifications/{id}/read` | 标记指定通知为已读 |
| PUT | `/api/v1/okr/notifications/read-all` | 全部标记已读 |
| GET | `/api/v1/okr/notifications/unread-count` | 获取未读通知数量（返回 `{"count": N}`） |

---

## 3. OKR 计划管理（/api/v1/okr-plans/**，管理员配置接口）

OKR 计划（考核周期配置、月份明细、自动添加规则、提醒设置）属于**管理员后台配置接口**，普通员工端一般不需要调用。共约14个接口：

### 3.1 OKR 计划本体（OkrPlanController）

路径前缀：`/api/v1/okr-plans`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/okr-plans` | 计划列表（分页） |
| POST | `/api/v1/okr-plans` | 新建计划 |
| GET | `/api/v1/okr-plans/{id}` | 计划详情 |
| PUT | `/api/v1/okr-plans/{id}` | 更新计划 |
| PUT | `/api/v1/okr-plans/{id}/disable` | 停用计划 |
| DELETE | `/api/v1/okr-plans/{id}` | 删除计划 |
| GET | `/api/v1/okr-plans/{id}/years` | 获取计划覆盖的年份列表 |
| GET | `/api/v1/okr-plans/{id}/months` | 获取计划覆盖的月份列表 |

### 3.2 计划明细（OkrPlanDetailController）

路径前缀：`/api/v1/okr-plans/{planId}/details`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/okr-plans/{planId}/details` | 计划下月份明细列表 |
| POST | `/api/v1/okr-plans/{planId}/details` | 新增月份明细 |
| DELETE | `/api/v1/okr-plans/{planId}/details/{id}` | 删除月份明细 |

### 3.3 自动添加设置（OkrPlanAutoAddController）

路径前缀：`/api/v1/okr-plans/{planId}/auto-add-settings`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/okr-plans/{planId}/auto-add-settings` | 获取自动添加规则（按部门自动创建员工明细） |
| POST | `/api/v1/okr-plans/{planId}/auto-add-settings` | 保存/更新自动添加规则 |
| DELETE | `/api/v1/okr-plans/{planId}/auto-add-settings` | 删除自动添加规则 |

### 3.4 提醒设置（OkrPlanReminderController）

路径前缀：`/api/v1/okr-plans/{planId}/reminders`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/okr-plans/{planId}/reminders` | 获取提醒设置列表 |
| POST | `/api/v1/okr-plans/{planId}/reminders` | 新增提醒设置 |
| DELETE | `/api/v1/okr-plans/{planId}/reminders/{id}` | 删除提醒设置 |

---

## 4. 周期管理（Periods）

考核周期基础数据管理，一般由管理员维护。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/periods` | 周期列表 |
| POST | `/api/v1/periods` | 新建周期 |
| PUT | `/api/v1/periods/{id}/disable` | 停用周期 |

---

## 5. 其他可能相关的模块

- **进展记录与更新日志**：已在本 Skill 中完整覆盖（[progress-logs.md](progress-logs.md)），含进展填写和日志合并查询
- **关注模块**：已在本 Skill 中完整覆盖（[follow.md](follow.md)）
- **评论模块**：已在本 Skill 中完整覆盖（[comment.md](comment.md)），含 `mentionedEmployeeIds` @提及字段
- **员工搜索**（通用，非OKR专用）：`GET /api/v1/employees/search` 是全员工搜索接口，OKR 模块内使用 `GET /api/v1/okr/employees/search`（本 Skill helper.md 已覆盖）
