# 关注（follow.md）

---

## 关注员工

**方法+路径**：POST /api/v1/okr/follows

**功能**：关注指定员工，方便快速查看其OKR。

**认证**：必须

**路径参数**：无

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| targetEmployeeId | String | ✅ | 被关注者工号 |

**成功响应 data**：null

**业务规则**：
- 不能关注自己（targetEmployeeId 不能是当前用户工号）
- 不能重复关注同一员工
- 关注人数上限 20 人
- 目标员工必须存在（在职）

**错误码**：
| code | 触发场景 |
|------|----------|
| 40101 | 目标员工不存在（EMPLOYEE_NOT_FOUND） |
| 40909 | 不能关注自己 |
| 40911 | 已关注该员工 |
| 40910 | 关注人数已达上限(20人) |
| 40001 | 参数错误（targetEmployeeId为空） |

**curl 示例**：
```bash
curl -sS -X POST 'http://localhost:8080/api/v1/okr/follows' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetEmployeeId":"zhangsan"}'
```

**响应示例**：
```json
{"code":20000,"message":"success","data":null,"timestamp":"..."}
```

---

## 取消关注

**方法+路径**：DELETE /api/v1/okr/follows/{employeeId}

**功能**：取消对指定员工的关注。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| employeeId | String | ✅ | 被关注者工号 |

**请求体**：无

**成功响应 data**：null

**业务规则**：
- 取消不存在的关注关系不报错（幂等）

**错误码**：
通用错误码，无特殊业务错误。

**curl 示例**：
```bash
curl -sS -X DELETE 'http://localhost:8080/api/v1/okr/follows/zhangsan' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{"code":20000,"message":"success","data":null,"timestamp":"..."}
```

---

## 获取关注列表

**方法+路径**：GET /api/v1/okr/follows

**功能**：获取当前用户关注的所有员工列表。

**认证**：必须

**路径参数**：无

**Query 参数**：无

**请求体**：无

**成功响应 data 字段**（Array\<FollowVO\>）：
| 字段 | 类型 | 说明 |
|------|------|------|
| [].employeeId | String | 被关注者工号 |
| [].employeeName | String | 被关注者姓名 |
| [].departmentName | String | 被关注者部门名称 |
| [].createdAt | String(DateTime) | 关注时间 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/follows' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": [
    {
      "employeeId": "zhangsan",
      "employeeName": "张三",
      "departmentName": "技术部",
      "createdAt": "2025-07-01 10:00:00"
    },
    {
      "employeeId": "lisi",
      "employeeName": "李四",
      "departmentName": "产品部",
      "createdAt": "2025-07-03 14:00:00"
    }
  ],
  "timestamp": "..."
}
```
