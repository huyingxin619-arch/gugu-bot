# 模块概述（overview.md）

## 模块关系图

```
┌─────────┐     1:N     ┌────────────┐     1:N     ┌──────────────┐
│  Plan   │────────────▶│ PlanDetail │────────────▶│  Objective   │
│ (OKR计划)│             │ (员工×周期) │             │    (O/目标)   │
└─────────┘             └────────────┘             └──────┬───────┘
                              │                           │ 1:N
                              │                           ▼
                              │                    ┌──────────────┐
                              │                    │  KeyResult   │
                              │                    │   (KR/关键结果)│
                              │                    └──┬───┬───┬───┘
                              │                       │   │   │
                              │            ┌──────────┘   │   └──────────┐
                              ▼            ▼              ▼              ▼
                         ┌────────┐  ┌───────────┐ ┌──────────┐  ┌────────────┐
                         │Comment │  │ Alignment │ │Decompose │  │ExternalAnchor│
                         │ (评论)  │  │  (对齐)    │ │ (拆解)    │  │ (外部锚定)   │
                         └────────┘  └───────────┘ └──────────┘  └────────────┘
                              │
                              ▼
                         ┌────────┐
                         │Progress│
                         │(进展/日志)│
                         └────────┘
                              │
                              ▼
                         ┌────────┐
                         │ Follow │
                         │ (关注)  │
                         └────────┘
```

## 核心概念

### Plan（OKR计划）
OKR管理的顶层容器，定义考核周期（如年度、半年、季度、月度）。一个 Plan 包含多个 PlanDetail。

### PlanDetail（计划明细）
某员工在某个 Plan 的特定年月下的 OKR 记录。它是所有 O/KR 的归属单元。
- 所有 O/KR 都挂在某个 PlanDetail 下
- PlanDetail 有状态：进行中、已完成、不可见
- 获取 OKR 时必须先拿到 `planDetailId`
- 一个员工在**同一周期 + 同一年月**最多有一条 PlanDetail（唯一约束：plan_id + year + month + employee_id）；不同周期可以共存。因此查询他人 planDetailId 时必须同时传 `periodId`、`year`、`month` 三个维度。

### Objective（O / 目标）
定性的、方向性的目标描述。每个 PlanDetail 下可以有多个 O（通常 3-5 个）。
- 一个 O 可以包含多个 KR
- O 有进度状态（自动计算+可手动覆盖）、可见范围、挑战度指数、FT-OKR 标记等属性

### KeyResult（KR / 关键结果）
衡量 O 达成的可量化关键结果。每个 O 下有多个 KR（通常 2-4 个）。
- KR 有权重（同一 O 下权重合计必须=100%）
- KR 分两种类型：执行型（EXECUTION）和探索型（EXPLORATION）
- KR 有进度值（0-100）、进度状态、自评分（0-10）、可见范围
- 探索型 KR 额外有终止信号、决策状态
- KR 可以有外部锚定信息（1:1）
- KR 可以被拆解给下属（Decompose）
- KR 可以发起对齐（Alignment），发起即生效

### Alignment（对齐关系）
员工之间的 OKR 对齐关系，表示"我的 O/KR 对齐到你的 O/KR"。
- 对齐是一条从发起方到接收方的关系记录
- 发起方选择自己的 O/KR 和对方的具体 O/KR，提交即生效（无需对方确认）
- 发起方和接收方都可以取消对齐；取消后可重新发起

### Comment（评论）
在 PlanDetail 维度上的评论/回复，支持 @ 提及员工和嵌套回复。
- 顶级评论和回复通过 `parentCommentId` 区分
- 评论可以 @ 多个员工（`mentionedEmployeeIds`）

### Decompose（KR 拆解指派）
上级将自己的 KR 拆解一部分比例指派给下属，表示该 KR 的部分责任由下属承担。
- 每条拆解记录包含下属工号和拆解比例
- 所有下属拆解比例合计不能超过 100%
- 同一个下属不能对同一 KR 重复拆解
- 只能拆解给汇报线上的下属

### Follow（关注）
用户可以关注其他员工的 OKR，方便快速查看。
- 不能关注自己
- 关注上限 20 人
- 不能重复关注同一人

### ProgressLog（进展记录）
用户在 O 级别主动填写的文本进展（如"本周完成接口设计"），用于周期内阶段性总结。
- 挂在 O 下（不挂 KR）
- 创建后不可修改、不可删除
- 内容最长 5000 字符
- 只有 O 的所有者能填写

### UpdateLog（更新日志）
系统在 O/KR/锚定/拆解发生增删改时**自动写入**的结构化变更记录，无需也不允许手动填写。
- 记录字段：targetType（O/KR/锚定/拆解）、action（CREATE/UPDATE/DELETE）、fieldName（变更字段中文名）、oldValue/newValue
- Y/N 值自动映射为"是/否"，长值截断 30 字符
- 与进展记录合并展示，按时间倒序

### ExternalAnchor（外部锚定）
KR 对应的外部参考标杆信息，用于设定 KR 时有对标依据。
- 与 KR 是 1:1 关系
- 包含锚定方式（外部/内部/类比）、对标对象、对标内容、预期结果、数据来源等
- 探索型 KR 额外有验证方式、资源上限、时间窗口

## 状态机

### 对齐状态流转

```
          发起对齐（直接生效）
        ──────────────────────┐
                               ▼
                         ┌──────────┐
                         │ ACCEPTED │
                         │ (已生效)  │
                         └────┬─────┘
                              │ 取消（双方均可）
                              ▼
                         ┌──────────┐
                         │CANCELLED │
                         │ (已取消)  │
                         └──────────┘
```

> 历史数据可能存在 PENDING/REJECTED/WITHDRAWN 状态（旧流程），新发起的对齐直接为 ACCEPTED，无需对方确认。

状态说明：
- **ACCEPTED**：发起即生效，对齐关系有效
- **CANCELLED**：发起方或接收方取消对齐
- **PENDING/REJECTED/WITHDRAWN**：历史状态，仅存在于旧数据，新流程不再产生
- **ACCEPTED**：接收方接受，对齐正式生效
- **CANCELLED**：对齐被发起方或接收方取消
- **REJECTED/WITHDRAWN**：历史数据保留，新流程不再产生
- **EXPIRED**：已过期（系统预留，当前版本未使用）

### 计划明细状态（planDetailStatus）

| 状态 | 含义 | 可写性 |
|------|------|--------|
| IN_PROGRESS | 进行中 | ✅ 可编辑所有OKR数据 |
| COMPLETED | 已完成 | ❌ 只读，写操作返回40907 |
| INVISIBLE | 不可见 | ❌ 对外不可见，访问返回40401 |

来源（source）字段：AUTO（系统自动添加）/ MANUAL（手动添加）。

### 进度状态（progressStatus）

| 状态 | 含义 | 色标建议 |
|------|------|----------|
| NORMAL | 正常 | 蓝色 |
| AT_RISK | 有风险 | 橙红色 |
| DELAYED | 已延期 | 红色 |
| COMPLETED | 已完成 | 绿色 |

- KR 创建时默认 NORMAL
- O 的进度状态可由 KR 自动计算，也支持手动覆盖（`PUT /objectives/{id}/progress-status`）
- KR 更新进度时可同时设置 progressStatus

### KR 类型（krType）

| 类型 | 含义 | 特有字段 |
|------|------|----------|
| EXPLORATION | 探索型 | terminationSignal（终止信号）、decisionStatus（决策状态） |

### 可见范围类型（visibilityType）

| 类型 | 含义 |
|------|------|
| ALL | 全员可见（默认） |
| REPORT_LINE_AND_SPECIFIED | 仅汇报线+指定人员可见 |

当 visibilityType=REPORT_LINE_AND_SPECIFIED 时，需额外指定 visibleEmployeeIds/specifiedEmployeeIds 列表。

### 探索型 KR 决策状态（decisionStatus）

| 值 | 含义 |
|----|------|
| CONTINUE | 继续 |
| PIVOT | 转向 |
| STOP | 停止 |
| ESCALATE | 升级 |

### 锚定方式（anchorMethod）

| 值 | 含义 |
|----|------|
| BENCHMARK_EXTERNAL | 外部对标 |
| BENCHMARK_INTERNAL | 内部对标 |
| BENCHMARK_ANALOGY | 类比对标 |

### 拆解操作类型（action，DecomposeItemDTO）

| 值 | 含义 | 必填字段 |
|----|------|----------|
| ADD | 新增拆解记录 | employeeId、ratio |
| UPDATE | 更新拆解比例 | id、ratio |
| DELETE | 软删除拆解记录 | id |

### 汇报线关系（relation，SubordinateVO）

| 值 | 含义 |
|----|------|
| DIRECT | 直接下级 |
| INDIRECT | 间接下级 |

### 对齐方向（direction，AlignmentVO in MyOkrVO）

| 值 | 含义 |
|----|------|
| SENT | 我发出的对齐 |
| RECEIVED | 我收到的对齐 |

### 对齐类型（type，AlignmentVO in MyOkrVO）

| 值 | 含义 |
|----|------|
| O_TO_O | O 对齐到 O |
| O_TO_KR | O 对齐到 KR |
| KR_TO_O | KR 对齐到 O |
| KR_TO_KR | KR 对齐到 KR |

## 枚举值总表

| 枚举类别 | 字段名 | 可选取值 |
|----------|--------|----------|
| 计划明细状态 | planDetailStatus / status | IN_PROGRESS, COMPLETED, INVISIBLE |
| 进度状态 | progressStatus | NORMAL, AT_RISK, DELAYED, COMPLETED |
| KR类型 | krType | EXECUTION, EXPLORATION |
| 可见范围 | visibilityType | ALL, REPORT_LINE_AND_SPECIFIED |
| 对齐状态 | status（对齐） | ACCEPTED, CANCELLED（新流程）；PENDING, REJECTED, WITHDRAWN, EXPIRED（历史数据兼容） |
| 探索型决策状态 | decisionStatus | CONTINUE, PIVOT, STOP, ESCALATE |
| 锚定方式 | anchorMethod | BENCHMARK_EXTERNAL, BENCHMARK_INTERNAL, BENCHMARK_ANALOGY |
| FT-OKR标记 | ftOkr | Y, N |
| 拆解操作 | action（拆解） | ADD, UPDATE, DELETE |
| 汇报线关系 | relation（下属） | DIRECT, INDIRECT |
| 对齐方向 | direction | SENT, RECEIVED |
| 计划明细来源 | source | AUTO, MANUAL |
| 员工状态 | status（员工） | ACTIVE, INACTIVE（搜索/上级链/下级链会过滤 INACTIVE） |

> 注：员工表 `status` 字段未发现 CHECK 约束，可能存在其他状态（如 RESIGNED），搜索/汇报线接口统一过滤 `status != 'INACTIVE'`。

## ID vs 工号

| 标识 | 类型 | 用途 | 示例 |
|------|------|------|------|
| employeeCode / employeeId（路径参数/请求体中） | **String** | 员工唯一标识（工号） | "zhaobinquan" |
| objectiveId | **Long** | O 的数据库主键 | 6001 |
| keyResultId | **Long** | KR 的数据库主键 | 7001 |
| planDetailId | **Long** | 计划明细主键 | 5001 |
| alignmentId | **Long** | 对齐记录主键 | 8001 |
| commentId | **Long** | 评论主键 | 9001 |
| decomposeId | **Long** | 拆解记录主键 | 10001 |

**注意**：Controller 路径参数中的 `{employeeId}` 实际是工号（String），不是数字 ID。其他业务实体 ID 均为 Long 数字类型。

## 调用顺序建议

### 查看/操作自己的 OKR

```
1. GET /api/v1/okr/plan-details          → 获取 current.planDetailId
2. GET /api/v1/okr/my?planDetailId=xxx   → 获取我的O和KR列表，拿到 objectiveId / keyResultId
3. 根据需要调用增删改查接口（增O、改KR、更新进度等）
```

### 查看他人的 OKR

```
1. GET /api/v1/okr/employees/search?keyword=xxx  → 搜索员工，拿到 employeeId（工号）
2. GET /api/v1/okr/plan-details                  → 获取当前周期的 periodId、year、month
3. GET /api/v1/okr/employees/{employeeId}/plan-detail?year=&month=&periodId=
   → 获取该员工的 planDetailId
4. GET /api/v1/okr/employees/{employeeId}?planDetailId=xxx → 获取该员工可见OKR
```

### 发起对齐流程

```
1. 自己已有的 OKR（通过 /my 获取）→ sourceObjectiveId / sourceKeyResultId
2. GET /api/v1/okr/employees/search?keyword=xxx → 搜索目标人 targetEmployeeId
3. GET /api/v1/okr/employees/{targetEmployeeId}/plan-detail?year=&month=&periodId=
   → 对方 planDetailId
4. GET /api/v1/okr/employees/{targetEmployeeId}/visible-okrs?planDetailId=xxx
   → 对方可见的 O/KR 树，获取 targetObjectiveId / targetKeyResultId
5. POST /api/v1/okr/alignments → 发起对齐
```

### KR 拆解流程

批量保存（弹窗一次性编辑）：
```
1. 自己已有的 KR（通过 /my 获取 keyResultId）
2. GET /api/v1/okr/key-results/{id}/subordinates → 获取可拆解下属列表
3. GET /api/v1/okr/key-results/{id}/decompose → 获取已有拆解记录
4. PUT /api/v1/okr/key-results/{id}/decompose → 批量保存（ADD/UPDATE/DELETE 混合提交）
```

单条删除（点"移除"按钮立即生效）：
```
1. DELETE /api/v1/okr/decompose/{decomposeId} → 软删除该条拆解，自动审计+通知
```
