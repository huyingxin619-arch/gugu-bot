# 进展记录与更新日志（progress-logs.md）

本文档覆盖 OkrProgressLogController 的两个接口：
- **进展记录（PROGRESS）**：用户主动填写的文本进展（如"本周完成接口设计"）
- **更新日志（UPDATE）**：系统自动记录的 O/KR 字段变更历史（如"权重 30→50"、"状态 正常→有风险"）

两种日志在列表接口中合并返回，按时间倒序统一展示，通过 `logType` 字段区分。

---

## 核心概念

### 进展记录 vs 更新日志

| 维度 | 进展记录（PROGRESS） | 更新日志（UPDATE） |
|------|---------------------|-------------------|
| 触发方 | 用户主动填写 | 系统自动写入（增删改 O/KR/锚定/拆解时） |
| 内容 | 文本描述（最长5000字符） | 字段变更结构化记录（旧值→新值） |
| 创建后能否修改 | ❌ 不可修改/删除（仅软删除） | ❌ 不可修改/删除 |
| 展示特点 | 展示完整进展文本 | 展示为"{动作中文}{对象中文}{摘要}"（如"新建了关键结果(KR):xxx"、"将权重由“30”修改为“50”"），Y/N→是/否，枚举值自动翻译中文，长值截断30字符 |
| 挂载级别 | O（Objective）级别 | O 级别（KR变更也聚合到所属O下） |
| 返回操作人姓名 | ✅ createdByName 冗余返回 | ✅ createdByName 冗余返回（批量回填，消除 N+1） |

### 更新日志字段说明（UPDATE 类型）

**targetType（目标类型）枚举**：
| 值 | 含义 |
|----|------|
| OBJECTIVE | O（目标） |
| KEY_RESULT | KR（关键结果） |
| EXTERNAL_ANCHORING | 外部锚定 |
| DECOMPOSITION | KR 拆解 |

**action（动作）枚举**：
| 值 | 含义 |
|----|------|
| CREATE | 新建 |
| UPDATE | 修改 |
| DELETE | 删除 |

---

## 新增进展记录

**方法+路径**：POST /api/v1/okr/objectives/{id}/progress-logs

**功能**：为指定 O 新增一条进展记录（文本内容）。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID（objectiveId） |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 默认值 | 枚举/约束 | 说明 |
|------|------|:----:|--------|-----------|------|
| content | String | ✅ | - | 非空，最大5000字符 | 进展内容文本 |

**成功响应 data 字段（ProgressLogVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 新记录ID |
| objectiveId | Long | 所属O ID |
| content | String | 进展内容 |
| createdBy | String | 创建人工号 |
| createdByName | String | 创建人姓名（冗余） |
| createdAt | String(DateTime) | 创建时间 |

**业务规则**：
- O 必须存在（否则返回40401）
- 计划明细状态必须是 IN_PROGRESS（否则返回40907）
- 只有 O 的所有者（本人）才能新增进展记录（否则返回40803）
- 进展记录创建后不可修改、不可删除

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | O不存在/计划明细不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |
| 40001 | content为空或超过5000字符 |

**curl 示例**：
```bash
curl -sS -X POST 'http://localhost:8080/api/v1/okr/objectives/6001/progress-logs' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"本周完成了核心接口设计，下周开始进入开发阶段。接口响应时间已优化到200ms以内。"}' \
  | python3 -m json.tool
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 2001,
    "objectiveId": 6001,
    "content": "本周完成了核心接口设计，下周开始进入开发阶段。接口响应时间已优化到200ms以内。",
    "createdBy": "zhaobinquan",
    "createdByName": "赵宾全",
    "createdAt": "2026-07-07T14:30:00"
  },
  "timestamp": "2026-07-07 14:30:00"
}
```

---

## 获取记录列表（进展+更新合并）

**方法+路径**：GET /api/v1/okr/objectives/{id}/logs

**功能**：获取指定 O 下所有进展记录和更新日志的合并列表，按 `createdAt` 时间倒序排列，支持按类型筛选和分页。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID（objectiveId） |

**Query 参数**：
| 参数 | 类型 | 必填 | 默认值 | 枚举/约束 | 说明 |
|------|------|:----:|--------|-----------|------|
| type | String | ❌ | ALL | ALL/PROGRESS/UPDATE | 筛选类型 |
| page | Integer | ❌ | 1 | ≥1 | 页码（从1开始） |
| pageSize | Integer | ❌ | 20 | 1~100 | 每页条数 |

**请求体**：无

**成功响应 data 字段（LogListResponseVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| records | Array\<LogRecordVO\> | 当前页记录列表（PROGRESS/UPDATE混合，按时间倒序） |
| progressCount | Long | 该O下进展记录总数（不受type筛选和分页影响） |
| updateCount | Long | 该O下更新记录总数（不受type筛选和分页影响） |
| total | Long | 当前筛选下的记录总数（用于分页） |
| pageNum | Integer | 当前页码 |
| pageSize | Integer | 每页条数 |
| totalPages | Integer | 总页数 |

**LogRecordVO 字段（统一记录结构）**：
| 字段 | 类型 | 适用 logType | 说明 |
|------|------|:-----------:|------|
| logType | String | 全部 | 日志类型：PROGRESS（进展记录）/ UPDATE（更新日志） |
| id | Long | 全部 | 记录ID |
| content | String | PROGRESS | 进展内容文本 |
| targetType | String | UPDATE | 目标类型枚举：OBJECTIVE/KEY_RESULT/EXTERNAL_ANCHORING/DECOMPOSITION |
| targetTypeName | String | UPDATE | 目标类型中文名：目标(O)/关键结果(KR)/外部锚定/KR拆解（前端可直接展示） |
| targetDescription | String | UPDATE | 变更对象描述（如"线上P0故障数降为0"的KR描述） |
| action | String | UPDATE | 动作枚举：CREATE/UPDATE/DELETE |
| actionName | String | UPDATE | 动作中文名：新建/修改/删除（前端可直接展示） |
| fieldName | String | UPDATE | 变更字段中文名（如"权重"、"进度状态"、"KR描述"）；CREATE/DELETE 时为 null |
| oldValue | String | UPDATE | 旧值（已格式化：Y/N→是/否，KR类型/可见范围/决策状态/进度状态枚举自动翻译中文，长文本截断30字符） |
| newValue | String | UPDATE | 新值（同上格式化规则） |
| summary | String | UPDATE | 自动拼装的操作摘要（如"新建了关键结果(KR):上线Q3新功能"、"将权重由“30”修改为“50”"），前端可直接一行展示 |
| createdBy | String | 全部 | 操作人工号 |
| createdByName | String | 全部 | 操作人姓名（冗余，批量查询回填，前端无需二次查员工表） |
| createdAt | String(DateTime) | 全部 | 创建时间 |

**枚举值自动翻译规则（UPDATE 类型 oldValue/newValue）**：

| 枚举值 | 中文翻译 | 适用字段 |
|--------|----------|----------|
| Y / N | 是 / 否 | ftOkr 等布尔类字段 |
| EXECUTION / EXPLORATION | 执行型 / 探索型 | krType |
| ALL / REPORT_LINE_AND_SPECIFIED / SELF_ONLY / SPECIFIED | 全员可见 / 汇报线与指定员工 / 仅自己可见 / 指定员工 | visibilityType |
| CONTINUE / PIVOT / STOP / ESCALATE | 继续 / 调整 / 停止 / 升级 | decisionStatus |
| NORMAL / AT_RISK / DELAYED / COMPLETED | 正常 / 有风险 / 延期 / 已完成 | progressStatus |

未匹配到的枚举值原样返回。长文本（>30字符）自动截断为"前30字..."。

**业务规则**：
- 返回合并列表后内存按 `createdAt` 倒序排序再分页
- `progressCount`/`updateCount` 始终返回该 O 下两类记录的**全量总数**，不受 `type` 参数和分页影响（前端用于Tab角标数字）
- 更新日志由后端在 CUD 操作时自动写入，调用方无需手动写
- 更新日志的 `summary` 字段供前端直接展示成一句自然语言，如"张三 新建了关键结果(KR):上线Q3新功能"、"张三 将权重由“30%”修改为“50%”"

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | O不存在 |
| 40101 | 未登录/Token过期 |

**curl 示例**：
```bash
# 获取全部记录（默认分页 page=1, pageSize=20）
curl -sS -X GET 'http://localhost:8080/api/v1/okr/objectives/6001/logs' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 只看进展记录，第1页，每页10条
curl -sS -X GET 'http://localhost:8080/api/v1/okr/objectives/6001/logs?type=PROGRESS&page=1&pageSize=10' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 只看更新日志
curl -sS -X GET 'http://localhost:8080/api/v1/okr/objectives/6001/logs?type=UPDATE' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**响应示例（混合类型）**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "records": [
      {
        "logType": "PROGRESS",
        "id": 2001,
        "content": "本周完成了核心接口设计，下周开始进入开发阶段。",
        "createdBy": "zhaobinquan",
        "createdByName": "赵宾全",
        "createdAt": "2026-07-07T14:30:00"
      },
      {
        "logType": "UPDATE",
        "id": 3001,
        "targetType": "KEY_RESULT",
        "targetTypeName": "关键结果(KR)",
        "targetDescription": "接口平均响应时间降低到200ms以内",
        "action": "UPDATE",
        "actionName": "修改",
        "fieldName": "权重",
        "oldValue": "30",
        "newValue": "50",
        "summary": "将权重由“30”修改为“50”",
        "createdBy": "zhaobinquan",
        "createdByName": "赵宾全",
        "createdAt": "2026-07-07T10:15:00"
      },
      {
        "logType": "UPDATE",
        "id": 3000,
        "targetType": "OBJECTIVE",
        "targetTypeName": "目标(O)",
        "targetDescription": "Q3提升后端系统性能",
        "action": "CREATE",
        "actionName": "新建",
        "fieldName": null,
        "oldValue": null,
        "newValue": null,
        "summary": "新建了目标(O):Q3提升后端系统性能",
        "createdBy": "zhaobinquan",
        "createdByName": "赵宾全",
        "createdAt": "2026-07-06T18:00:00"
      },
      {
        "logType": "PROGRESS",
        "id": 2000,
        "content": "完成技术方案评审。",
        "createdBy": "zhaobinquan",
        "createdByName": "赵宾全",
        "createdAt": "2026-07-05T09:00:00"
      }
    ],
    "progressCount": 5,
    "updateCount": 12,
    "total": 17,
    "pageNum": 1,
    "pageSize": 20,
    "totalPages": 1
  },
  "timestamp": "2026-07-07 14:35:00"
}
```

---

## 典型调用顺序

### 查看某 O 的操作历史

```
1. GET /api/v1/okr/my?planDetailId=xxx              → 获取 objectives[].id = objectiveId
2. GET /api/v1/okr/objectives/{id}/logs             → 获取进展+更新记录列表
   - 默认 type=ALL，混合展示；Tab切换时传 type=PROGRESS 或 type=UPDATE
   - records[].logType 区分类型，分别渲染
   - progressCount/updateCount 用于Tab角标
```

### 新增一条进展记录

```
1. GET /api/v1/okr/my?planDetailId=xxx              → 获取 objectives[].id
2. POST /api/v1/okr/objectives/{id}/progress-logs   → 提交进展文本
3. 重新 GET /api/v1/okr/objectives/{id}/logs        → 刷新列表
```

## 注意事项

- **分页参数名是 `page`，不是 `pageNum`**（与评论列表一致，与对齐列表的 pageNum 不同，注意区分）
- 进展记录没有"编辑"和"删除"接口（业务上一旦记录不可修改）
- 更新日志是后端自动写入的，调用方**不要也不能**手动写 UPDATE 日志
- 查看他人OKR时，对可见的O也能看到其进展/更新记录（受可见性控制）
- 前端渲染建议：PROGRESS 类型展示 content 文本+createdByName+时间；UPDATE 类型直接展示 summary（或按 actionName+targetTypeName+targetDescription+fieldName 自定义拼装），用 createdByName+时间作署名
- 枚举字段无需前端维护映射表，后端已翻译为中文返回
