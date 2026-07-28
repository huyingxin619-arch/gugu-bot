# 辅助接口（helper.md）

辅助接口提供计划明细查询、员工搜索、汇报线查询等支撑功能，是其他操作的前置依赖。

---

## 查询当前用户的计划明细

**方法+路径**：GET /api/v1/okr/plan-details

**功能**：查询当前登录用户可用的计划明细列表，包含当前周期信息和按年分组的历史/未来周期列表。这是操作OKR的第一步——拿到 `planDetailId` 后才能查询/编辑 OKR。

**认证**：必须

**路径参数**：无

**Query 参数**：无

**请求体**：无

**成功响应 data 字段（PlanDetailResponseVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| current | Object | 当前选中的周期信息 |
| current.year | Integer | 年份 |
| current.month | Integer | 月份 |
| current.planDetailId | Long | 当前计划明细ID（**核心字段，调用其他接口必需**） |
| current.periodId | Long | 周期ID |
| current.periodDesc | String | 周期描述（如"2025年Q3"） |
| current.label | String | 显示标签（如"2025年7月"） |
| current.status | String | 计划明细状态：IN_PROGRESS/COMPLETED（INVISIBLE 被过滤不返回） |

> 注意：`current` 对象没有 `planId` 字段；`planId` 字段仅在 EmployeePlanDetailVO（`GET /employees/{employeeId}/plan-detail`）中出现。
| periods | Array | 按年分组的周期列表 |
| periods[].year | Integer | 年份 |
| periods[].periodDesc | String | 周期描述 |
| periods[].label | String | 显示标签 |
| periods[].months | Array | 该周期下的月份列表 |
| periods[].months[].month | Integer | 月份 |
| periods[].months[].planDetailId | Long | 该月计划明细ID |
| periods[].months[].periodId | Long | 周期ID |
| periods[].months[].status | String | 状态 |

**业务规则**：
- 如果当前用户没有任何计划明细，current 可能为 null
- periods 返回所有可用周期的列表（按年倒序）

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/plan-details' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "current": {
      "year": 2025,
      "month": 7,
      "planDetailId": 5001,
      "periodId": 10,
      "periodDesc": "2025年Q3",
      "label": "2025年7月",
      "status": "IN_PROGRESS"
    },
    "periods": [
      {
        "year": 2025,
        "periodDesc": "2025年Q3",
        "label": "2025年Q3",
        "months": [
          {"month": 7, "planDetailId": 5001, "periodId": 10, "status": "IN_PROGRESS"},
          {"month": 8, "planDetailId": null, "periodId": 10, "status": null},
          {"month": 9, "planDetailId": null, "periodId": 10, "status": null}
        ]
      }
    ]
  },
  "timestamp": "..."
}
```

---

## 查询指定员工的计划明细ID

**方法+路径**：GET /api/v1/okr/employees/{employeeId}/plan-detail

**功能**：按员工工号+年月+周期ID查询对应的 planDetailId。前端查看他人OKR时，先用此接口获取 planDetailId，再调 `/employees/{employeeId}` 获取OKR详情。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| employeeId | String | ✅ | 员工工号 |

**Query 参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| year | Integer | ✅ | 年份（如2025） |
| month | Integer | ✅ | 月份（1-12） |
| periodId | Long | ✅ | 周期ID（从自己的 plan-details 响应中获取当前周期的 periodId） |

**请求体**：无

**成功响应 data 字段（EmployeePlanDetailVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| planDetailId | Long | 计划明细ID（该员工该月无计划明细时为null） |
| employeeId | String | 员工工号 |
| employeeName | String | 员工姓名 |
| year | Integer | 年份 |
| month | Integer | 月份 |
| periodId | Long | 周期ID |
| planId | Long | 计划ID |
| periodDesc | String | 周期描述（如"2025年Q3"） |
| status | String | 计划明细状态：IN_PROGRESS/COMPLETED/INVISIBLE（无明细时为null） |

**业务规则**：
- 同一员工+同一周期+同一年月最多1条 planDetail
- periodId 是必填的（不同周期可以共存，需要 periodId 精确定位）

**错误码**：
| code | 触发场景 |
|------|----------|
| 40001 | 参数错误（员工工号/年/月/周期ID缺失） |
| 40401 | 员工不存在或已离职，或周期不存在 |

**curl 示例**：
```bash
# 查询张三在2025年7月、周期10下的planDetailId
curl -sS -X GET 'http://localhost:8080/api/v1/okr/employees/zhangsan/plan-detail?year=2025&month=7&periodId=10' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "planDetailId": 5002,
    "employeeId": "zhangsan",
    "employeeName": "张三",
    "year": 2025,
    "month": 7,
    "periodId": 10,
    "planId": 1,
    "periodDesc": "2025年Q3",
    "status": "IN_PROGRESS"
  },
  "timestamp": "..."
}
```

---

## 员工搜索

**方法+路径**：GET /api/v1/okr/employees/search

**功能**：按工号或姓名关键字模糊搜索员工，返回匹配的员工列表。用于对齐目标选择、@提及、指定可见人员等场景。

**认证**：必须

**Query 参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| keyword | String | ✅ | 搜索关键字（匹配工号或姓名） |

**请求体**：无

**成功响应 data 字段**（Array\<EmployeeSearchVO\>）：
| 字段 | 类型 | 说明 |
|------|------|------|
| [].employeeId | String | 员工工号 |
| [].employeeName | String | 员工姓名 |
| [].departmentName | String | 部门名称 |

**业务规则**：
- keyword 传 null 或空串时，直接返回空数组（不报错）
- 模糊匹配工号或姓名
- 只返回非 INACTIVE 状态的员工，最多返回 20 条

**错误码**：
无业务错误码，空关键字返回空数组。

**curl 示例**：
```bash
# 搜索名字含"张"的员工
curl -sS -X GET 'http://localhost:8080/api/v1/okr/employees/search?keyword=张' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": [
    {"employeeId": "zhangsan", "employeeName": "张三", "departmentName": "技术部"},
    {"employeeId": "zhangwei", "employeeName": "张伟", "departmentName": "产品部"}
  ],
  "timestamp": "..."
}
```

---

## 获取上级链

**方法+路径**：GET /api/v1/okr/employees/{employeeId}/superiors

**功能**：获取指定员工汇报线上的所有上级（从直属上级一直到顶级），并标记哪个是直属上级。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| employeeId | String | ✅ | 员工工号 |

**请求体**：无

**成功响应 data 字段**（Array\<SuperiorVO\>）：
| 字段 | 类型 | 说明 |
|------|------|------|
| [].employeeId | String | 上级工号 |
| [].employeeName | String | 上级姓名 |
| [].departmentName | String | 部门名称 |
| [].isDirectManager | Boolean | 是否直属上级 |

**错误码**：
| code | 触发场景 |
|------|----------|
| 40101 | 员工不存在（EMPLOYEE_NOT_FOUND） |

**额外说明**：
- `employeeId` 支持传入关键字 `me`（不区分大小写），会自动解析为当前登录用户工号。

**curl 示例**：
```bash
# 获取当前登录用户的上级链
curl -sS -X GET 'http://localhost:8080/api/v1/okr/employees/me/superiors' \
  -H "Authorization: Bearer $TOKEN"

# 获取指定员工的上级链
curl -sS -X GET 'http://localhost:8080/api/v1/okr/employees/zhaobinquan/superiors' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": [
    {"employeeId": "lisi", "employeeName": "李四", "departmentName": "技术部", "isDirectManager": true},
    {"employeeId": "wangboss", "employeeName": "王总", "departmentName": "技术中心", "isDirectManager": false}
  ],
  "timestamp": "..."
}
```

---

## 获取直接下级

**方法+路径**：GET /api/v1/okr/employees/{employeeId}/direct-reports

**功能**：获取指定员工的直接下级列表。用于管理者查看下属OKR、拆解KR时的参考。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| employeeId | String | ✅ | 员工工号 |

**请求体**：无

**成功响应 data 字段**（Array\<DirectReportVO\>）：
| 字段 | 类型 | 说明 |
|------|------|------|
| [].employeeId | String | 下级工号 |
| [].employeeName | String | 下级姓名 |
| [].departmentName | String | 部门名称 |

**错误码**：
| code | 触发场景 |
|------|----------|
| 40101 | 员工不存在（EMPLOYEE_NOT_FOUND） |

**额外说明**：
- `employeeId` 支持传入关键字 `me`（不区分大小写），会自动解析为当前登录用户工号。

**curl 示例**：
```bash
# 获取当前登录用户的直接下级
curl -sS -X GET 'http://localhost:8080/api/v1/okr/employees/me/direct-reports' \
  -H "Authorization: Bearer $TOKEN"

# 获取张三的直接下级
curl -sS -X GET 'http://localhost:8080/api/v1/okr/employees/zhangsan/direct-reports' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": [
    {"employeeId": "wangwu", "employeeName": "王五", "departmentName": "技术部-后端组"},
    {"employeeId": "zhaoliu", "employeeName": "赵六", "departmentName": "技术部-后端组"}
  ],
  "timestamp": "..."
}
```
