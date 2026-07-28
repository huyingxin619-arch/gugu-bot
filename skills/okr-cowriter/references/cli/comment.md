# 评论（comment.md）

---

## 获取评论列表

**方法+路径**：GET /api/v1/okr/{planDetailId}/comments

**功能**：获取指定计划明细下的评论列表（含回复），分页返回。评论直接返回 PageResult 结构（不是 Result 包裹）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| planDetailId | Long | ✅ | 计划明细ID |

**Query 参数**：
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:----:|--------|------|
| page | Integer | ❌ | 1 | 页码（Query参数名是`page`，不是pageNum） |
| pageSize | Integer | ❌ | 20 | 每页条数 |

**请求体**：无

**成功响应**：分页结构 PageResult\<CommentVO\>

> 注意：评论列表接口直接返回 PageResult（code/message/data/timestamp 结构），不是嵌套在 Result 中的。data.records 中每条记录的页码字段名在响应体中为 `pageNum`，但请求参数名是 `page`。
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "records": [CommentVO, ...],
    "total": N,
    "pageNum": 1,
    "pageSize": 20,
    "totalPages": M
  },
  "timestamp": "..."
}
```

**records 字段（CommentVO - 顶级评论）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 评论ID |
| planDetailId | Long | 计划明细ID |
| parentCommentId | Long | 父评论ID（顶级评论为null） |
| content | String | 评论内容 |
| createdBy | String | 评论人工号 |
| createdByName | String | 评论人姓名 |
| createdAt | String(DateTime) | 创建时间 |
| replies | Array\<CommentReplyVO\> | 回复列表 |

**CommentReplyVO 字段（回复）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 回复ID |
| parentCommentId | Long | 父评论ID |
| content | String | 回复内容 |
| createdBy | String | 回复人工号 |
| createdByName | String | 回复人姓名 |
| createdAt | String(DateTime) | 创建时间 |

**业务规则**：
- 评论列表顶级评论按创建时间**正序**（从旧到新）；回复也是按创建时间正序
- 每条顶级评论内嵌其回复列表
- planDetailId 对应的计划明细必须存在（只校验存在，不要求 IN_PROGRESS，已结束的周期评论仍可查看）

**错误码**：
| code | 触发场景 |
|------|----------|
| 40801 | 计划明细不存在 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/5001/comments?page=1&pageSize=20' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 9001,
        "planDetailId": 5001,
        "parentCommentId": null,
        "content": "本季度OKR进展如何？",
        "createdBy": "zhangsan",
        "createdByName": "张三",
        "createdAt": "2025-07-06 10:00:00",
        "replies": [
          {
            "id": 9002,
            "parentCommentId": 9001,
            "content": "进展顺利，预计月底完成",
            "createdBy": "zhaobinquan",
            "createdByName": "赵斌全",
            "createdAt": "2025-07-06 10:30:00"
          }
        ]
      }
    ],
    "total": 1,
    "pageNum": 1,
    "pageSize": 20,
    "totalPages": 1
  },
  "timestamp": "..."
}
```

---

## 发表评论

**方法+路径**：POST /api/v1/okr/{planDetailId}/comments

**功能**：发表顶级评论或回复他人评论。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| planDetailId | Long | ✅ | 计划明细ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|:----:|------|------|
| content | String | ✅ | 不为空，最大2000字符 | 评论内容 |
| parentCommentId | Long | ❌ | null | 父评论ID（null=顶级评论，有值=回复） |
| mentionedEmployeeIds | Array\<String\> | ❌ | 工号列表 | 被@的员工工号列表（前端解析提交） |
| referencedOkrs | Array\<Object\> | ❌ | | 引用的 OKR 列表 |
| referencedOkrs[].okrType | String | ❌ | OBJECTIVE / KEY_RESULT | 引用类型 |
| referencedOkrs[].okrId | Long | ❌ | | 被引用的 O 或 KR 的 ID |

**成功响应 data 字段（CommentVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 新评论ID |
| planDetailId | Long | 计划明细ID |
| parentCommentId | Long | 父评论ID（顶级评论为null） |
| content | String | 评论内容 |
| createdBy | String | 评论人工号 |
| createdByName | String | 评论人姓名 |
| createdAt | String(DateTime) | 创建时间 |
| replies | Array | 顶级评论时为空列表 |
| referencedOkrs | Array\<ReferencedOkr\> | 引用的 OKR 列表（可选） |
| referencedOkrs[].okrType | String | OBJECTIVE / KEY_RESULT |
| referencedOkrs[].okrId | Long | 被引用的 O 或 KR 的 ID |
| referencedOkrs[].description | String | OKR 描述（后端回填） |
| referencedOkrs[].parentObjectiveDescription | String | KR 引用时所属 O 的描述（后端回填） |
| referencedOkrs[].parentObjectiveId | Long | KR 引用时所属 O 的 ID（后端回填） |

**业务规则**：
- content 不能为空，最长2000字符
- parentCommentId 有值时，该父评论必须存在且属于同一 planDetail
- planDetailId 对应的计划明细必须存在

**错误码**：
| code | 触发场景 |
|------|----------|
| 40801 | 计划明细不存在 |
| 40804 | 父评论不存在（parentCommentId指定了但找不到） |
| 40001 | 参数错误（content为空或超长） |

**curl 示例**：
```bash
# 发表顶级评论，并@张三
curl -sS -X POST 'http://localhost:8080/api/v1/okr/5001/comments' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "@张三 请关注一下这个KR的进度",
    "mentionedEmployeeIds": ["zhangsan"]
  }'

# 回复评论
curl -sS -X POST 'http://localhost:8080/api/v1/okr/5001/comments' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "收到，已经在处理了",
    "parentCommentId": 9001
  }'
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 9003,
    "planDetailId": 5001,
    "parentCommentId": null,
    "content": "@张三 请关注一下这个KR的进度",
    "createdBy": "zhaobinquan",
    "createdByName": "赵斌全",
    "createdAt": "2025-07-06 18:00:00",
    "replies": []
  },
  "timestamp": "..."
}
```

---

## 获取评论总数

**方法+路径**：GET /api/v1/okr/{planDetailId}/comments/count

**功能**：获取指定计划明细下的评论总数（包含顶级评论和回复）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| planDetailId | Long | ✅ | 计划明细ID |

**请求体**：无

**成功响应 data 字段（CommentCountVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| count | Long | 评论总数（顶级评论+回复） |

**错误码**：
| code | 触发场景 |
|------|----------|
| 40801 | 计划明细不存在 |

**curl 示例**：
```bash
curl -sS -X GET 'http://localhost:8080/api/v1/okr/5001/comments/count' \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {"count": 15},
  "timestamp": "..."
}
```
