# 对齐管理（alignment.md）

---

## 发起对齐

**方法+路径**：POST /api/v1/okr/alignments

**功能**：发起 OKR 对齐，发起即生效（status=ACCEPTED），无需对方确认。发起方需指定自己和对方的具体 O/KR。

**认证**：必须

**路径参数**：无

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| sourceObjectiveId | Long | ✅ | - | 发起方自己的O ID |
| sourceKeyResultId | Long | ❌ | null | 发起方自己的KR ID（null表示O级对齐） |
| targetEmployeeId | String | ✅ | 工号（字符串） | 目标人工号（不能是自己） |
| targetObjectiveId | Long | ✅ | - | 对齐到对方的O ID |
| targetKeyResultId | Long | ❌ | null | 对齐到对方的KR ID（null表示对齐到O） |

> ✅ **新流程说明**：发起对齐后直接生效（status=ACCEPTED），对方会收到通知，无需接受/确认。如果需要调整对齐目标，双方都可以取消对齐后重新发起。

**成功响应 data 字段（AlignmentVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 对齐记录ID |
| sourceEmployeeId | String | 发起人工号 |
| sourceEmployeeName | String | 发起人姓名 |
| sourceObjectiveId | Long | 发起方O ID |
| sourceObjectiveDescription | String | 发起方O描述 |
| sourceKeyResultId | Long\|null | 发起方KR ID |
| sourceKeyResultDescription | String | 发起方KR描述 |
| targetEmployeeId | String | 目标人工号 |
| targetEmployeeName | String | 目标人姓名 |
| targetObjectiveId | Long | 目标方O ID |
| targetObjectiveDescription | String | 目标方O描述 |
| targetKeyResultId | Long\|null | 目标方KR ID |
| targetKeyResultDescription | String | 目标方KR描述 |
| status | String | 对齐状态：发起即 ACCEPTED |
| rejectReason | String | 拒绝原因（历史 PENDING 数据可能有值，新流程无） |
| createdAt | String(DateTime) | 创建时间 |
| updatedAt | String(DateTime) | 更新时间 |

**业务规则**：
- 当前登录用户为发起方
- 不能对齐自己（targetEmployeeId 不能是自己工号）
- 双方 O/KR 必须真实存在且属于对应员工
- 防重复：相同发起方+目标方+相同源/目标 O/KR 的活跃对齐（ACCEPTED）不能重复创建
- 发起即 ACCEPTED，双方 O/KR 立即填充

**错误码**：
| code | 触发场景 |
|------|----------|
| 40908 | 不能对齐自己 |
| 40903 | 已存在对齐记录，不可重复对齐 |
| 40001 | 参数错误（必填字段缺失、O/KR不存在或不属于对方） |

**curl 示例**：
```bash
# O级对齐：我的O对齐到张三的O
curl -sS -X POST 'https://comark.stfile.com/api/v1/okr/alignments' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceObjectiveId": 6001,
    "targetEmployeeId": "zhangsan",
    "targetObjectiveId": 6101
  }'

# KR级对齐：我的KR对齐到李四的KR
curl -sS -X POST 'https://comark.stfile.com/api/v1/okr/alignments' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceObjectiveId": 6001,
    "sourceKeyResultId": 7001,
    "targetEmployeeId": "lisi",
    "targetObjectiveId": 6201,
    "targetKeyResultId": 7201
  }'
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 8001,
    "sourceEmployeeId": "zhaobinquan",
    "sourceEmployeeName": "赵斌全",
    "sourceObjectiveId": 6001,
    "sourceObjectiveDescription": "提升系统稳定性",
    "sourceKeyResultId": null,
    "sourceKeyResultDescription": null,
    "targetEmployeeId": "zhangsan",
    "targetEmployeeName": "张三",
    "targetObjectiveId": 6101,
    "targetObjectiveDescription": "建设高可用架构",
    "targetKeyResultId": null,
    "targetKeyResultDescription": null,
    "status": "ACCEPTED",
    "rejectReason": null,
    "createdAt": "2026-07-16 18:00:00",
    "updatedAt": "2026-07-16 18:00:00"
  },
  "timestamp": "..."
}
```

---

## 取消对齐

**方法+路径**：PUT /api/v1/okr/alignments/{id}/cancel

**功能**：取消已生效（ACCEPTED）的对齐关系，发起方和接收方均可操作。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | 对齐记录ID |

**请求体**：无

**成功响应 data 字段**：同 [发起对齐](#发起对齐) 的 AlignmentVO，status 变为 CANCELLED。

**业务规则**：
- 发起方或接收方均可取消（双边对等权限）
- 仅 ACCEPTED 状态的对齐可以取消

**错误码**：
| code | 触发场景 |
|------|----------|
| 40301 | 非对齐双方，无操作权限 |
| 40906 | 仅已生效（ACCEPTED）状态可取消 |
| 40401 | 对齐记录不存在 |

**curl 示例**：
```bash
curl -sS -X PUT 'https://comark.stfile.com/api/v1/okr/alignments/8001/cancel' \
  -H "Authorization: Bearer $TOKEN"
```

---

## 查询对齐我的列表

**方法+路径**：GET /api/v1/okr/alignments/received

**功能**：查询别人对齐到我的记录（作为接收方）。

**认证**：必须

**Query 参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| status | String | ❌ | 状态筛选：ACCEPTED/CANCELLED/REJECTED/WITHDRAWN（不传返回全部） |

**响应 data**：`Array<AlignmentVO>`

---

## 查询我对齐的列表

**方法+路径**：GET /api/v1/okr/alignments/sent

**功能**：查询我发起的对齐记录（作为发起方）。

**认证**：必须

**Query 参数**：同上。

**响应 data**：`Array<AlignmentVO>`

---

## 获取可见 OKR 列表

**方法+路径**：GET /api/v1/okr/employees/{employeeId}/visible-okrs

**功能**：查询指定员工对当前用户可见的 O 和 KR 树形列表，发起对齐时选择对方 O/KR 用。

**认证**：必须

**响应 data**：树形结构，包含 O 及其下 KR。

---

## 对齐视图接口（画布）

### O 级拓扑视图
**GET** `/api/v1/okr/alignment-view/graph`

参数：`viewMode`（TOP_LEVEL/MY_OKR）、`planDetailId`、`maxDepth`（默认3）、`expandFromObjectiveId`（增量展开）
返回 O 级节点和归并后的边。

### KR 级明细视图
**GET** `/api/v1/okr/alignment-view/detail`

参数：`viewMode`（TOP_LEVEL/MY_OKR）、`planDetailId`、`maxDepth`（默认全量，传值时截断）、`expandFromNodeId`（格式 obj_{id}/kr_{id}，增量展开）、`expandDirection`（DOWN/UP）
返回扁平化 O/KR 节点（含depth、parentObjectiveDescription等）和原始 KR/O 级明细边。

---

## 历史接口（仅处理历史 PENDING 数据，新流程不再使用）

以下接口保留用于处理历史数据，新发起的对齐不会走这些流程：

- PUT /api/v1/okr/alignments/{id}/accept — 接受对齐（历史 PENDING 数据兼容）
- PUT /api/v1/okr/alignments/{id}/reject — 拒绝对齐（历史 PENDING 数据兼容）
- PUT /api/v1/okr/alignments/{id}/withdraw — 撤回对齐（历史 PENDING 数据兼容）
