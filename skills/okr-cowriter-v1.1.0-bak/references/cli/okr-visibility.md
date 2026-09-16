# 可见范围与外部锚定（okr-visibility.md）

---

## 查看 O 可见范围

**方法+路径**：GET /api/v1/okr/objectives/{id}/visibility

**功能**：获取 Objective 当前的可见范围类型及指定可见员工名单，用于"编辑可见范围"时回显已选员工。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**Query 参数**：无

**请求体**：无

**成功响应 data 字段（VisibilityDetailVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | O ID |
| visibilityType | String | 可见范围类型：ALL/REPORT_LINE_AND_SPECIFIED |
| specifiedEmployeeCount | Integer | 指定可见员工数量 |
| specifiedEmployees | Array | 指定可见员工名单（仅REPORT_LINE_AND_SPECIFIED时非空） |
| specifiedEmployees[].employeeId | String | 员工工号 |
| specifiedEmployees[].employeeName | String | 员工姓名 |

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/objectives/6001/visibility' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 6001,
    "visibilityType": "REPORT_LINE_AND_SPECIFIED",
    "specifiedEmployeeCount": 2,
    "specifiedEmployees": [
      {"employeeId": "zhangsan", "employeeName": "张三"},
      {"employeeId": "lisi", "employeeName": "李四"}
    ]
  },
  "timestamp": "..."
}
```

---

## 更新 O 可见范围

**方法+路径**：PUT /api/v1/okr/objectives/{id}/visibility

**功能**：设置 O 的可见范围（全员可见 或 仅汇报线+指定人员可见）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| visibilityType | String | ✅ | ALL/REPORT_LINE_AND_SPECIFIED | 可见范围类型 |
| specifiedEmployeeIds | Array\<String\> | ❌ | 工号列表 | 指定可见员工工号列表（仅visibilityType=REPORT_LINE_AND_SPECIFIED时有效） |

> ⚠️ 注意：字段名是 `specifiedEmployeeIds`（聚合编辑 full-save 接口使用 `visibleEmployeeIds`，两个独立 DTO，字段名不同）。

**成功响应 data 字段（VisibilityResultVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | O ID |
| visibilityType | String | 更新后的可见范围类型 |
| specifiedEmployeeCount | Integer | 指定可见员工数量 |

**业务规则**：
- visibilityType 切换为非 ALL 时，后端校验该 O/KR 上已有对齐关系中的相关员工在新可见范围内仍可见，否则报错提示先取消对齐
- visibilityType=ALL 时，specifiedEmployeeIds 被忽略，且会清空已有指定员工记录
- visibilityType=REPORT_LINE_AND_SPECIFIED 时，specifiedEmployeeIds 为**额外可见员工**（汇报线上级天然可见，不需要加到此列表）；每次调用是**全量覆盖**语义（后端先删后插）
- planDetail 状态必须为 IN_PROGRESS
- 字段名为 `specifiedEmployeeIds`（与 full-save 接口的 `visibleEmployeeIds` 不同）

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |

**curl 示例**：
```bash
# 设置O为全员可见
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6001/visibility' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"visibilityType":"ALL"}'

# 设置O为仅汇报线+指定人员可见
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6001/visibility' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"visibilityType":"REPORT_LINE_AND_SPECIFIED","specifiedEmployeeIds":["zhangsan","lisi"]}'
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 6001,
    "visibilityType": "REPORT_LINE_AND_SPECIFIED",
    "specifiedEmployeeCount": 2
  },
  "timestamp": "..."
}
```

---

## 查看 KR 可见范围

**方法+路径**：GET /api/v1/okr/key-results/{id}/visibility

**功能**：获取 KR 当前的可见范围类型及指定可见员工名单。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**成功响应 data 字段**：同 [查看O可见范围](#查看-o-可见范围) 的 VisibilityDetailVO（id 为 KR ID）。

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 关键结果不存在 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/key-results/7001/visibility' \
  -H "Authorization: Bearer $TOKEN"
```

---

## 更新 KR 可见范围

**方法+路径**：PUT /api/v1/okr/key-results/{id}/visibility

**功能**：设置 KR 的可见范围。与 O 可见范围设置独立。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| visibilityType | String | ✅ | ALL/REPORT_LINE_AND_SPECIFIED | 可见范围类型 |
| specifiedEmployeeIds | Array\<String\> | ❌ | 工号列表 | 指定可见员工工号列表（仅visibilityType=REPORT_LINE_AND_SPECIFIED时有效） |

> ⚠️ 字段名注意：本接口（独立更新 KR 可见范围）使用 `specifiedEmployeeIds`；聚合编辑接口 `PUT /objectives/{id}/full` 中 KR 级字段名是 `visibleEmployeeIds`，两个不同 DTO，字段名不同勿混淆。

**成功响应 data 字段**：同 [更新O可见范围](#更新-o-可见范围) 的 VisibilityResultVO（id 为 KR ID）。

**业务规则**：
- 只有 KR 所属 O 的所有者可以设置
- 切换为非 ALL 时同样校验对齐关系中员工的可见性
- planDetail 状态必须为 IN_PROGRESS
- specifiedEmployeeIds 全量覆盖语义

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 关键结果不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |

**curl 示例**：
```bash
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/key-results/7001/visibility' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"visibilityType":"ALL"}'
```

---

## 保存外部锚定

**方法+路径**：PUT /api/v1/okr/key-results/{id}/external-anchor

**功能**：保存 KR 的外部锚定信息（1:1关系，不存在则新增，存在则更新/覆盖）。外部锚定用于记录 KR 设定时的对标参考。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| anchorMethod | String | ❌ | BENCHMARK_EXTERNAL/BENCHMARK_INTERNAL/BENCHMARK_ANALOGY | 锚定方式（对标类型） |
| benchmarkTarget | String | ❌ | - | 对标谁（目标对象名称） |
| benchmarkContent | String | ❌ | - | 对标内容 |
| expectedResult | String | ❌ | - | 预期结果 |
| dataSource | String | ❌ | - | 数据来源 |
| verificationMethod | String | ❌ | - | 验证方式（探索型KR用） |
| resourceLimit | String | ❌ | - | 资源上限（探索型KR用） |
| timeWindow | String | ❌ | - | 时间窗口（探索型KR用） |

> 所有字段均可选（整体替换语义：不传/传 null 都会覆盖为 null）。要清空锚定信息，传 `{}` 即可。

**成功响应 data 字段（ExternalAnchorResultVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 锚定记录ID |
| keyResultId | Long | 关联KR ID |
| anchorMethod | String | 锚定方式 |
| benchmarkTarget | String | 对标谁 |

**业务规则**：
- 只有 KR 所有者（本人）可以保存外部锚定
- 外部锚定与 KR 是 1:1 关系，重复调用 PUT 是覆盖更新
- planDetail 状态必须为 IN_PROGRESS

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 关键结果不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |

**curl 示例**：
```bash
# 保存外部锚定信息（执行型KR）
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/key-results/7001/external-anchor' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "anchorMethod": "BENCHMARK_EXTERNAL",
    "benchmarkTarget": "Google SRE标准",
    "benchmarkContent": "99.99%可用性",
    "expectedResult": "全年故障时间<52分钟",
    "dataSource": "Google SRE Book"
  }'

# 保存外部锚定信息（探索型KR，含额外字段）
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/key-results/7002/external-anchor' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "anchorMethod": "BENCHMARK_ANALOGY",
    "benchmarkTarget": "行业类似产品",
    "benchmarkContent": "MVP验证周期",
    "expectedResult": "2个月内验证可行性",
    "dataSource": "竞品分析报告",
    "verificationMethod": "用户调研+数据埋点",
    "resourceLimit": "2人月",
    "timeWindow": "2025-07~2025-08"
  }'
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 1001,
    "keyResultId": 7001,
    "anchorMethod": "BENCHMARK_EXTERNAL",
    "benchmarkTarget": "Google SRE标准"
  },
  "timestamp": "..."
}
```
