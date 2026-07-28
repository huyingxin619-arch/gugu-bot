# O 和 KR 增删改查（okr-crud.md）

本文档覆盖 OkrCoreController 中的基础 CRUD 接口，不含进度/可见性/外部锚定/挑战度/FT-OKR（那些在单独文档中）。

---

## 获取我的 OKR

**方法+路径**：GET /api/v1/okr/my

**功能**：获取当前登录员工在指定计划明细下的完整 OKR 数据（O 列表含 KR、对齐、拆解、外部锚定等）。这是最常用的入口接口，调用其他操作前通常先调此接口拿到 ID。

**认证**：必须

**路径参数**：无

**Query 参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| planDetailId | Long | ✅ | 计划明细ID，通过 `/api/v1/okr/plan-details` 获取 |

**请求体**：无

**成功响应 data 字段（MyOkrVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| planDetailId | Long | 计划明细ID |
| employeeId | String | 当前员工工号 |
| employeeName | String | 当前员工姓名 |
| planDetailStatus | String | 计划明细状态：IN_PROGRESS/COMPLETED/INVISIBLE |
| objectives | Array | O列表 |
| objectives[].id | Long | O ID |
| objectives[].description | String | O 描述 |
| objectives[].sortOrder | Integer | 排序值 |
| objectives[].progress | BigDecimal | O 进度（0-100，由KR加权计算） |
| objectives[].progressStatus | String | 进度状态：NORMAL/AT_RISK/DELAYED/COMPLETED |
| objectives[].selfScore | BigDecimal | O 自评分 |
| objectives[].visibilityType | String | 可见范围：ALL/REPORT_LINE_AND_SPECIFIED |
| objectives[].specifiedEmployeeCount | Integer | 指定可见员工数量 |
| objectives[].challengeIndex | Integer | 挑战度指数（1-10，直属上级评分） |
| objectives[].ftOkr | String | FT-OKR标记：Y/N |
| objectives[].remark | String | 备注 |
| objectives[].createdAt | String(DateTime) | 创建时间 |
| objectives[].updatedAt | String(DateTime) | 更新时间 |
| objectives[].alignments | Array | 对齐信息列表 |
| objectives[].keyResults | Array | KR列表 |
| objectives[].keyResults[].id | Long | KR ID |
| objectives[].keyResults[].description | String | KR 描述 |
| objectives[].keyResults[].sortOrder | Integer | 排序值 |
| objectives[].keyResults[].krType | String | KR类型：EXECUTION/EXPLORATION |
| objectives[].keyResults[].weight | BigDecimal | 权重（百分比） |
| objectives[].keyResults[].currentValue | String | 当前值 |
| objectives[].keyResults[].progress | BigDecimal | 进度（0-100） |
| objectives[].keyResults[].progressStatus | String | 进度状态 |
| objectives[].keyResults[].selfScore | Integer | 自评分（0-10，整数） |
| objectives[].keyResults[].visibilityType | String | 可见范围 |
| objectives[].keyResults[].specifiedEmployeeCount | Integer | 指定可见员工数量 |
| objectives[].keyResults[].terminationSignal | String | 终止信号（探索型） |
| objectives[].keyResults[].decisionStatus | String | 决策状态（探索型）：CONTINUE/PIVOT/STOP/ESCALATE |
| objectives[].keyResults[].externalAnchor | Object\|null | 外部锚定信息 |
| objectives[].keyResults[].externalAnchor.id | Long | 锚定ID |
| objectives[].keyResults[].externalAnchor.anchorMethod | String | 锚定方式 |
| objectives[].keyResults[].externalAnchor.benchmarkTarget | String | 对标谁 |
| objectives[].keyResults[].externalAnchor.benchmarkContent | String | 对标内容 |
| objectives[].keyResults[].externalAnchor.expectedResult | String | 预期结果 |
| objectives[].keyResults[].externalAnchor.dataSource | String | 数据来源 |
| objectives[].keyResults[].externalAnchor.verificationMethod | String | 验证方式 |
| objectives[].keyResults[].externalAnchor.resourceLimit | String | 资源上限 |
| objectives[].keyResults[].externalAnchor.timeWindow | String | 时间窗口 |
| objectives[].keyResults[].decompositions | Array | 拆解信息列表 |
| objectives[].keyResults[].decompositions[].id | Long | 拆解记录ID |
| objectives[].keyResults[].decompositions[].employeeId | String | 被拆解员工工号 |
| objectives[].keyResults[].decompositions[].employeeName | String | 被拆解员工姓名 |
| objectives[].keyResults[].decompositions[].ratio | BigDecimal | 拆解比例 |
| objectives[].keyResults[].alignments | Array | 对齐信息列表（结构同O的alignments） |

**对齐信息字段（MyOkrVO.AlignmentVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 对齐记录ID |
| direction | String | 方向：SENT（我发出的）/RECEIVED（我收到的） |
| type | String | 对齐类型：O_TO_O/O_TO_KR/KR_TO_O/KR_TO_KR |
| sourceEmployeeId | String | 来源员工工号 |
| sourceEmployeeName | String | 来源员工姓名 |
| sourceObjectiveId | Long | 来源O ID |
| sourceObjectiveDescription | String | 来源O描述 |
| sourceKeyResultId | Long\|null | 来源KR ID（KR对齐时有值） |
| sourceKeyResultDescription | String | 来源KR描述 |
| targetEmployeeId | String | 目标员工工号 |
| targetEmployeeName | String | 目标员工姓名 |
| targetObjectiveId | Long | 目标O ID |
| targetObjectiveDescription | String | 目标O描述 |
| targetKeyResultId | Long\|null | 目标KR ID |
| targetKeyResultDescription | String | 目标KR描述 |
| proposedTargetObjectiveId | Long | 提议的目标O ID（发起时指定） |
| proposedTargetObjectiveDescription | String | 提议的目标O描述 |
| proposedTargetKeyResultId | Long\|null | 提议的目标KR ID |
| proposedTargetKeyResultDescription | String | 提议的目标KR描述 |
| status | String | 对齐状态：PENDING/ACCEPTED/REJECTED/WITHDRAWN/CANCELLED |

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 计划明细不存在或不可见 |
| 40101 | 未登录/Token过期 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/my?planDetailId=5001' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "planDetailId": 5001,
    "employeeId": "zhaobinquan",
    "employeeName": "赵斌全",
    "planDetailStatus": "IN_PROGRESS",
    "objectives": [
      {
        "id": 6001,
        "description": "提升系统稳定性",
        "sortOrder": 0,
        "progress": 30.00,
        "progressStatus": "NORMAL",
        "selfScore": null,
        "visibilityType": "ALL",
        "specifiedEmployeeCount": 0,
        "challengeIndex": null,
        "ftOkr": "N",
        "remark": null,
        "createdAt": "2025-07-01 10:00:00",
        "updatedAt": "2025-07-06 12:00:00",
        "alignments": [],
        "keyResults": [
          {
            "id": 7001,
            "description": "线上P0故障数降为0",
            "sortOrder": 0,
            "krType": "EXECUTION",
            "weight": 50.00,"currentValue": "2",
            "progress": 30.00,
            "progressStatus": "AT_RISK",
            "selfScore": null,
            "visibilityType": "ALL",
            "specifiedEmployeeCount": 0,
            "terminationSignal": null,
            "decisionStatus": null,
            "externalAnchor": null,
            "decompositions": [],
            "alignments": []
          }
        ]
      }
    ]
  },
  "timestamp": "2025-07-06 18:00:00"
}
```

---

## 获取他人 OKR

**方法+路径**：GET /api/v1/okr/employees/{employeeId}

**功能**：获取指定员工在指定计划明细下的可见 OKR 数据。已根据可见性过滤（REPORT_LINE_AND_SPECIFIED 的 O/KR 对不在范围内的员工不可见）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| employeeId | String | ✅ | 目标员工工号（不是数字ID） |

**Query 参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| planDetailId | Long | ✅ | 计划明细ID，通过 `/employees/{employeeId}/plan-detail` 获取 |

**请求体**：无

**成功响应 data 字段**：同 [获取我的OKR](#获取我的-okr) 的 MyOkrVO 结构。

**业务规则**：
- 不可见的 O/KR 会被过滤掉（不会返回）
- planDetailStatus=INVISIBLE 的记录返回错误
- 目标员工不存在时返回404

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 计划明细不存在/不可见，或目标员工不存在 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/employees/zhangsan?planDetailId=5002' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 新增 O（含 KR）

**方法+路径**：POST /api/v1/okr/{planDetailId}/objectives

**功能**：在指定计划明细下新增一个 Objective，可同时提交该 O 下的 KR 列表（整体提交）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| planDetailId | Long | ✅ | 计划明细ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 默认值 | 枚举/约束 | 说明 |
|------|------|:----:|--------|-----------|------|
| description | String | ✅ | - | 最大2000字符 | O 描述 |
| visibilityType | String | ❌ | ALL | ALL/REPORT_LINE_AND_SPECIFIED | 可见范围 |
| remark | String | ❌ | null | - | 备注 |
| ftOkr | String | ❌ | N | Y/N | FT-OKR标记 |
| sortOrder | Integer | ❌ | 0 | - | 排序值 |
| keyResults | Array | ✅ | - | - | KR列表（至少1条，后续新增/删除 KR 必须通过 PUT /objectives/{id}/full 聚合接口提交，不支持单独新增/删除） |
| keyResults[].description | String | ✅ | - | 最大2000字符 | KR描述 |
| keyResults[].krType | String | ✅ | - | EXECUTION/EXPLORATION | KR类型 |
| keyResults[].weight | BigDecimal | ✅ | - | 0-100，保留2位小数 | 权重（%） |
| keyResults[].currentValue | String | ❌ | null | - | 当前值 |
| keyResults[].progress | BigDecimal | ❌ | 0 | 0-100 | 进度 |
| keyResults[].progressStatus | String | ❌ | NORMAL | NORMAL/AT_RISK/DELAYED/COMPLETED | 进度状态 |
| keyResults[].visibilityType | String | ❌ | ALL | ALL/REPORT_LINE_AND_SPECIFIED | KR可见范围 |
| keyResults[].terminationSignal | String | ❌ | null | - | 终止信号（探索型） |
| keyResults[].decisionStatus | String | ❌ | null | CONTINUE/PIVOT/STOP/ESCALATE | 决策状态（探索型） |
| keyResults[].sortOrder | Integer | ❌ | 0 | - | 排序值 |
| keyResults[].externalAnchor | Object | ❌ | null | - | 外部锚定（可选，见下方字段；不支持在创建接口设置指定可见员工） |

> ⚠️ **创建接口注意事项**：`POST /objectives` 不支持在创建时设置指定可见员工列表（没有 `visibleEmployeeIds` 字段）。如果 O/KR 需要 `REPORT_LINE_AND_SPECIFIED` 可见性，请先创建（默认 ALL），再调用单独的 `PUT /objectives/{id}/visibility` 或 `PUT /key-results/{id}/visibility` 接口设置。聚合编辑接口 `PUT /objectives/{id}/full` 才支持在保存时同步写入 `visibleEmployeeIds`。
| keyResults[].externalAnchor.anchorMethod | String | ❌ | null | BENCHMARK_EXTERNAL/BENCHMARK_INTERNAL/BENCHMARK_ANALOGY | 锚定方式 |
| keyResults[].externalAnchor.benchmarkTarget | String | ❌ | null | - | 对标谁 |
| keyResults[].externalAnchor.benchmarkContent | String | ❌ | null | - | 对标内容 |
| keyResults[].externalAnchor.expectedResult | String | ❌ | null | - | 预期结果 |
| keyResults[].externalAnchor.dataSource | String | ❌ | null | - | 数据来源 |
| keyResults[].externalAnchor.verificationMethod | String | ❌ | null | - | 验证方式（探索型） |
| keyResults[].externalAnchor.resourceLimit | String | ❌ | null | - | 资源上限（探索型） |
| keyResults[].externalAnchor.timeWindow | String | ❌ | null | - | 时间窗口（探索型） |

**成功响应 data 字段（ObjectiveResultVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 新创建的O ID |
| description | String | O描述 |
| sortOrder | Integer | 排序值 |
| progress | BigDecimal | 进度 |
| progressStatus | String | 进度状态 |
| selfScore | BigDecimal | 自评分 |
| visibilityType | String | 可见范围 |
| ftOkr | String | FT-OKR标记 |
| remark | String | 备注 |
| createdAt | String(DateTime) | 创建时间 |
| updatedAt | String(DateTime) | 更新时间 |
| keyResults | Array | KR简略列表 |
| keyResults[].id | Long | KR ID |
| keyResults[].description | String | KR描述 |
| keyResults[].sortOrder | Integer | 排序值 |

**业务规则**：
- 只能在自己的 planDetailId 下新增 O（非本人返回 40803）
- planDetail 状态必须是 IN_PROGRESS（否则返回 40907）
- 如果提交了 keyResults，同一 O 下所有 KR 的 weight 合计必须 = 100%（否则返回 40901）
- ftOkr=Y 时，同一 planDetail 下不能已有其他 ftOkr=Y 的 O（返回 40905）

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 计划明细不存在或不可见 |
| 40803 | 非本人操作 |
| 40901 | KR权重合计必须为100% |
| 40905 | 已存在FT-OKR=Y的记录 |
| 40907 | 计划明细状态不允许编辑 |
| 40001 | 请求参数错误（描述为空等） |

**curl 示例**：
```bash
# 新增一个O，含2个KR
curl -sS -X POST 'http://localhost:8080/api/v1/okr/5001/objectives' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Q3提升后端系统性能",
    "visibilityType": "ALL",
    "remark": "本季度重点目标",
    "keyResults": [
      {
        "description": "接口平均响应时间降低到200ms以内",
        "krType": "EXECUTION",
        "weight": 50,"currentValue": "500ms"
      },
      {
        "description": "系统可用性达到99.99%",
        "krType": "EXECUTION",
        "weight": 50,"currentValue": "99.9%"
      }
    ]
  }' | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 6002,
    "description": "Q3提升后端系统性能",
    "sortOrder": 1,
    "progress": 0,
    "progressStatus": "NORMAL",
    "selfScore": null,
    "visibilityType": "ALL",
    "ftOkr": "N",
    "remark": "本季度重点目标",
    "createdAt": "2025-07-06 18:00:00",
    "updatedAt": "2025-07-06 18:00:00",
    "keyResults": [
      {"id": 7002, "description": "接口平均响应时间降低到200ms以内", "sortOrder": 0},
      {"id": 7003, "description": "系统可用性达到99.99%", "sortOrder": 0}
    ]
  },
  "timestamp": "..."
}
```

---

## 编辑 O

**方法+路径**：PUT /api/v1/okr/objectives/{id}

**功能**：编辑 Objective 的基本信息（描述、备注）。仅修改传入的字段，不传的字段保持不变。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 默认值 | 枚举/约束 | 说明 |
|------|------|:----:|--------|-----------|------|
| description | String | ❌ | 不修改 | 最大2000字符 | O 描述 |
| remark | String | ❌ | 不修改 | - | 备注（可传null清空） |

**成功响应 data 字段**：同 [新增O](#新增-o含-kr) 的 ObjectiveResultVO。

**业务规则**：
- 只有 O 的所有者（本人）可以编辑
- planDetail 状态必须是 IN_PROGRESS

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |

**curl 示例**：
```bash
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6002' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Q3提升后端系统性能与稳定性","remark":"更新备注"}'
```

---

## 聚合编辑 O（全量保存）

**方法+路径**：PUT /api/v1/okr/objectives/{id}/full

**功能**：一次性保存 O + 全部 KR + 可见性 + 外部锚定。后端按 KR.id 做 diff：
- KR 带 id 且库中存在 → UPDATE（保留 id，对齐/拆解/进度不受影响）
- KR 无 id（新条目）→ INSERT
- 库中有、请求中缺失 → DELETE（删除前执行对齐限制校验）

适用于编辑页面整体保存的场景。**不维护进度/自评分**（避免冲掉已填进度）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 默认值 | 枚举/约束 | 说明 |
|------|------|:----:|--------|-----------|------|
| description | String | ✅ | - | 最大2000字符 | O 描述 |
| visibilityType | String | ❌ | ALL | ALL/REPORT_LINE_AND_SPECIFIED | O 可见范围 |
| visibleEmployeeIds | Array\<String\> | ❌ | null | 工号列表 | O级指定可见员工（仅REPORT_LINE_AND_SPECIFIED时生效） |
| remark | String | ❌ | null | - | 备注 |
| ftOkr | String | ❌ | N | Y/N | FT-OKR标记 |
| sortOrder | Integer | ❌ | 0 | - | 排序值 |
| keyResults | Array | ✅ | - | - | KR列表（该O下KR的最终全集，未出现的视为删除） |
| keyResults[].id | Long | ❌ | null | - | KR主键（编辑已有KR时必传，新增不传） |
| keyResults[].description | String | ✅ | - | 最大2000字符 | KR描述 |
| keyResults[].krType | String | ✅ | - | EXECUTION/EXPLORATION | KR类型 |
| keyResults[].weight | BigDecimal | ✅ | - | 0-100 | 权重（%） |
| keyResults[].currentValue | String | ❌ | null | - | 当前值 |
| keyResults[].visibilityType | String | ❌ | ALL | ALL/REPORT_LINE_AND_SPECIFIED | KR可见范围 |
| keyResults[].visibleEmployeeIds | Array\<String\> | ❌ | null | 工号列表 | KR级指定可见员工 |
| keyResults[].terminationSignal | String | ❌ | null | - | 终止信号（探索型） |
| keyResults[].decisionStatus | String | ❌ | null | CONTINUE/PIVOT/STOP/ESCALATE | 决策状态 |
| keyResults[].sortOrder | Integer | ❌ | 0 | - | 排序值 |
| keyResults[].externalAnchor | Object | ❌ | null | - | 外部锚定（结构同新增O） |

**成功响应 data 字段**：同 [新增O](#新增-o含-kr) 的 ObjectiveResultVO。

**业务规则**：
- keyResults 不能为空
- 同一 O 下所有 KR 的 weight 合计必须 = 100%
- 删除 KR 时如存在对齐数据，返回 40904
- 只有 O 所有者可以操作
- planDetail 必须是 IN_PROGRESS 状态
- ftOkr=Y 时有唯一性校验

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在/计划明细不存在 |
| 40803 | 非本人操作 |
| 40901 | KR权重合计必须为100% |
| 40904 | 存在对齐数据，请先取消对齐后再删除 |
| 40905 | 已存在FT-OKR=Y的记录 |
| 40907 | 计划明细状态不允许编辑 |

**curl 示例**：
```bash
# 全量保存O（包含编辑一个KR、新增一个KR、删除不在列表中的旧KR）
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6002/full' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Q3提升后端系统性能与稳定性",
    "visibilityType": "ALL",
    "keyResults": [
      {
        "id": 7002,
        "description": "接口平均响应时间降低到150ms以内",
        "krType": "EXECUTION",
        "weight": 60,"currentValue": "500ms"
      },
      {
        "description": "数据库慢查询数降为0",
        "krType": "EXECUTION",
        "weight": 40,"currentValue": "5"
      }
    ]
  }'
```

---

## 删除 O

**方法+路径**：DELETE /api/v1/okr/objectives/{id}

**功能**：删除 Objective 及其下所有 KR、外部锚定、拆解、可见性记录。

> ⚠️ **O 的删除与 KR 增删一样必须从“聚合视角”操作**：删除 O 本身是独立接口（删除整棵聚合根），**但删除单个 KR 必须通过 [`PUT /objectives/{id}/full`](#聚合编辑-o全量保存) 从 keyResults 数组中移除该 KR，不允许调用 DELETE /key-results/{id}**（该接口已禁用，返回 40910）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**Query 参数**：无

**请求体**：无

**成功响应 data**：null

**业务规则**：
- 只有 O 所有者可以删除
- 如果 O 或其下任何 KR 存在已接受的对齐（ACCEPTED），拒绝删除
- 删除 O 会级联删除其下所有 KR、外部锚定、拆解、可见性记录

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在 |
| 40803 | 非本人操作 |
| 40904 | 存在对齐数据（O或KR），请先联系被对齐人取消对齐后再删除 |

**curl 示例**：
```bash
curl -sS -X DELETE 'http://localhost:8080/api/v1/okr/objectives/6002' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{"code":20000,"message":"success","data":null,"timestamp":"..."}
```

---

## 编辑 KR（非权重字段）

**方法+路径**：PUT /api/v1/okr/key-results/{id}

**功能**：编辑 KR 的非权重字段信息（描述、类型、当前值、终止信号、决策状态）。仅修改传入字段。

> **⚠️ KR 增删/权重调整的强约束（强制）**：
> - **禁止单独新增 KR**：无 `POST /objectives/{oid}/key-results` 接口；必须通过 [`PUT /objectives/{id}/full`](#聚合编辑-o全量保存) 将新 KR 不带 id 加入 keyResults 数组
> - **禁止单独删除 KR**：`DELETE /key-results/{id}` 已禁用（直接调用返回 40910）；必须通过 `PUT /objectives/{id}/full` 从 keyResults 数组中移除该 KR
> - **禁止通过本接口修改 weight**：传入 weight 字段返回 40910；权重调整必须通过 `PUT /objectives/{id}/full` 一次性整体提交该 O 下所有 KR 最终全集
>
> **唯一入口**：KR 的新增/删除/权重调整**统一通过 [`PUT /objectives/{id}/full`](#聚合编辑-o全量保存)** 一次性整体提交（后端按 KR.id diff INSERT/UPDATE/DELETE，统一校验 Σweight=100%）。
>
> 本接口（PUT /key-results/{id}）**仅用于编辑非权重字段**（描述/类型/当前值/终止信号/决策状态）。可见范围修改请使用 `PUT /key-results/{id}/visibility`，外部锚定修改请使用 `PUT /key-results/{id}/external-anchor`。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 默认值 | 枚举/约束 | 说明 |
|------|------|:----:|--------|-----------|------|
| description | String | ❌ | 不修改 | 最大2000字符 | KR描述 |
| krType | String | ❌ | 不修改 | EXECUTION/EXPLORATION | KR类型 |
| currentValue | String | ❌ | 不修改 | - | 当前值 |
| visibilityType | String | ❌ | 不修改 | ALL/REPORT_LINE_AND_SPECIFIED | 可见范围 |
| terminationSignal | String | ❌ | 不修改 | - | 终止信号（探索型） |
| decisionStatus | String | ❌ | 不修改 | CONTINUE/PIVOT/STOP/ESCALATE | 决策状态 |

**成功响应 data 字段（KeyResultResultVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | KR ID |
| objectiveId | Long | 所属O ID |
| description | String | KR描述 |
| weight | BigDecimal | 权重 |
| sortOrder | Integer | 排序值 |
| createdAt | String(DateTime) | 创建时间 |
| updatedAt | String(DateTime) | 更新时间 |

**业务规则**：
- 只有 KR 所属 O 的所有者可以编辑
- 权重调整必须通过 `PUT /objectives/{id}/full` 聚合接口
- 可见范围请用专门接口 `PUT /key-results/{id}/visibility`
- 外部锚定请用专门接口 `PUT /key-results/{id}/external-anchor`
- planDetail 状态必须为 IN_PROGRESS

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 关键结果不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |

**curl 示例**：
```bash
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/key-results/7001' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentValue":"350ms"}'
```

