# KR 拆解（decompose.md）

KR 拆解功能允许将 KR 按比例拆解指派给其他人承担。

---

## 获取拆解列表

**方法+路径**：GET /api/v1/okr/key-results/{id}/decompose

**功能**：获取指定 KR 的已保存拆解记录列表（展示该 KR 拆解给了哪些人、各占多少比例）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体**：无

**成功响应 data 字段**（Array\<DecomposeVO\>）：
| 字段 | 类型 | 说明 |
|------|------|------|
| [].id | Long | 拆解记录ID |
| [].keyResultId | Long | 关联KR ID |
| [].employeeId | String | 被拆解人工号 |
| [].employeeName | String | 被拆解人姓名 |
| [].ratio | BigDecimal | 拆解比例（百分比，0-100） |

**业务规则**：
- KR 必须存在；任何已登录用户只要能看到该 KR 即可查看拆解列表（不做所有者校验）
- 拆解列表按创建时间正序返回

**错误码**：
| code | 触发场景 |
|------|----------|
| 40806 | 关键结果不存在 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/key-results/7001/decompose' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": [
    {"id": 10001, "keyResultId": 7001, "employeeId": "wangwu", "employeeName": "王五", "ratio": 30.00},
    {"id": 10002, "keyResultId": 7001, "employeeId": "zhaoliu", "employeeName": "赵六", "ratio": 20.00}
  ],
  "timestamp": "..."
}
```

---

## 保存拆解（批量 ADD/UPDATE/DELETE）

**方法+路径**：PUT /api/v1/okr/key-results/{id}/decompose

**功能**：批量保存拆解操作。前端一次性提交一批操作项，每项指定操作类型（ADD新增/UPDATE修改比例/DELETE删除），后端按顺序处理。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| items | Array | ✅ | 拆解操作项列表（不能为空） |
| items[].action | String | ✅ | 操作类型：ADD（新增）/UPDATE（更新比例）/DELETE（删除） |
| items[].id | Long | 条件必填 | 拆解记录ID（UPDATE/DELETE时必填） |
| items[].employeeId | String | 条件必填 | 被拆解人工号（ADD时必填） |
| items[].ratio | BigDecimal | 条件必填 | 拆解比例（0-100，ADD/UPDATE时必填） |

**成功响应 data**：null

**业务规则**：
- 只有 KR 所有者（本人）可以操作拆解
- KR 必须存在
- planDetail 状态必须为 IN_PROGRESS
- ADD 时：
  - 必须指定 employeeId 和 ratio
  - 拆解对象不能是自己
  - 同一人不能对同一 KR 重复拆解
- UPDATE 时：
  - 必须指定 id 和 ratio
  - 拆解记录必须存在
- DELETE 时：
  - 必须指定 id
  - 拆解记录必须存在
- 所有操作完成后，拆解比例合计不能超过 100%

**错误码**：
| code | 触发场景 |
|------|----------|
| 40806 | 关键结果不存在 |
| 40803 | 非本人操作 |
| 40807 | 拆解记录不存在 |
| 40907 | 计划明细状态不允许编辑 |
| 40912 | 拆解比例合计不能超过100% |
| 40913 | 同一人不可重复拆解 |
| 40914 | 不能拆解给自己 |
| 40001 | 参数错误（action非法、必填字段缺失等） |

**curl 示例**：
```bash
# 综合操作：新增给王五30%、修改赵六为25%、删除孙七的拆解
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/key-results/7001/decompose' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"action": "ADD", "employeeId": "wangwu", "ratio": 30},
      {"action": "UPDATE", "id": 10002, "ratio": 25},
      {"action": "DELETE", "id": 10003}
    ]
  }'
```

**响应示例**：
```json
{"code":20000,"message":"success","data":null,"timestamp":"..."}
```

---

## 删除单条拆解

**方法+路径**：DELETE /api/v1/okr/decompose/{decomposeId}

**功能**：按拆解记录 id 软删除一条 KR 拆解。适用于前端单条点击"移除"按钮场景（无需走批量保存接口）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| decomposeId | Long | ✅ | 拆解记录 ID |

**请求体**：无

**成功响应 data**：null

**业务规则**：
- 仅该 KR 所属 O 的 Owner（即 O.createdBy）可操作
- 拆解记录必须存在且未被软删除；不存在/不属于当前 KR 返回 40807
- 对应 planDetail 状态必须为 IN_PROGRESS
- 执行软删除（@TableLogic）
- 写入 okr_update_log 审计（targetType=DECOMPOSITION，action=DELETE）
- 向被移除人员发送 DECOMPOSE_REMOVED 通知，文案为"{拆解人姓名}取消了您的KR拆解,KR描述为{KR描述}"
- 自动写入 sys_operation_log 系统操作审计

**错误码**：
| code | 触发场景 |
|------|----------|
| 40301 | 无权限（非 Owner） |
| 40806 | 关键结果不存在（记录关联的 KR 已不存在） |
| 40807 | 拆解记录不存在/已删除/不属于当前 KR |
| 40907 | 计划明细状态不允许编辑 |
| 40101 | 未登录/Token过期 |

**curl 示例**：
```bash
curl -sS -X DELETE 'http://localhost:8080/api/v1/okr/decompose/10003' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例**：
```json
{"code":20000,"message":"success","data":null,"timestamp":"..."}
```

---

## 获取可拆解人员

**方法+路径**：GET /api/v1/okr/key-results/{id}/subordinates

**功能**：获取可以拆解该 KR 的人员列表（所有活跃员工），并标记哪些已经被拆解过。用于拆解弹窗的人员选择下拉。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体**：无

**成功响应 data 字段**（Array\<SubordinateVO\>）：
| 字段 | 类型 | 说明 |
|------|------|------|
| [].employeeId | String | 被拆解人工号 |
| [].employeeName | String | 被拆解人姓名 |
| [].relation | String | 汇报线关系：DIRECT（直接下级）/INDIRECT（间接下级） |
| [].alreadyDecomposed | Boolean | 是否已对该KR拆解（已拆解的不允许重复添加） |

**业务规则**：
- 只有 KR 所有者调用才有意义（后端返回当前登录用户的全员列表及关系，若不是KR所有者，后续保存拆解会报 40803 非本人操作）
- KR 必须存在
- 返回所有活跃员工，非下属标记为 OTHER

**错误码**：
| code | 触发场景 |
|------|----------|
| 40806 | 关键结果不存在 |
| 40802 | 目标(O)不存在 |
| 40803 | 非本人操作 |
| 40801 | 计划明细不存在 |
| 40101 | 未登录/Token过期 |

> ⚠️ 注意：`GET /key-results/{id}/subordinates` 接口需要额外校验所属 O 和 planDetail 存在，权限不足或 KR 不存在返回 40806/40802/40803/40801 中的一个，与文档之前写的错误码基本一致，但请注意 40802/40801 也是可能的返回码。

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/key-results/7001/subordinates' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": [
    {"employeeId": "wangwu", "employeeName": "王五", "relation": "DIRECT", "alreadyDecomposed": false},
    {"employeeId": "zhaoliu", "employeeName": "赵六", "relation": "DIRECT", "alreadyDecomposed": true},
    {"employeeId": "sunqi", "employeeName": "孙七", "relation": "INDIRECT", "alreadyDecomposed": false}
  ],
  "timestamp": "..."
}
```
