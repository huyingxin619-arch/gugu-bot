# 进度更新、自评分、挑战度、FT-OKR（okr-progress.md）

---

## 更新 KR 进度

**方法+路径**：PUT /api/v1/okr/key-results/{id}/progress

**功能**：更新 KR 的进度值和进度状态。员工在日常工作中填报 KR 进展。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 默认值 | 枚举/约束 | 说明 |
|------|------|:----:|--------|-----------|------|
| progress | BigDecimal | ✅ | - | 0-100，保留2位小数 | 进度值（百分比） |
| progressStatus | String | ❌ | NORMAL | NORMAL/AT_RISK/DELAYED/COMPLETED | 进度状态 |
| currentValue | String | ❌ | null | - | 当前值（可选，与进度一起提交） |

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
- 只有 KR 所有者（本人）可以更新进度
- progress 必须在 0-100 之间
- planDetail 状态必须为 IN_PROGRESS

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 关键结果不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |
| 40001 | 参数错误（progress超出0-100范围） |

**curl 示例**：
```bash
# 更新KR进度为50%，状态为有风险
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/key-results/7001/progress' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"progress":50,"progressStatus":"AT_RISK","currentValue":"350ms"}'
```

**响应示例**：
```json
{
  "code": 20000,
  "message": "success",
  "data": {
    "id": 7001,
    "objectiveId": 6001,
    "description": "线上P0故障数降为0",
    "weight": 50.00,
    "sortOrder": 0,
    "createdAt": "2025-07-01 10:00:00",
    "updatedAt": "2025-07-06 18:30:00"
  },
  "timestamp": "..."
}
```

---

## 更新 KR 自评分

**方法+路径**：PUT /api/v1/okr/key-results/{id}/self-score

**功能**：员工对自己的 KR 进行周期末自评打分。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | KR ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| selfScore | Integer | ✅ | 0-10，整数 | 自评分 |

**成功响应 data 字段**：同 [更新KR进度](#更新-kr-进度) 的 KeyResultResultVO。

**业务规则**：
- 只有 KR 所有者（本人）可以自评
- selfScore 必须是 0-10 的整数
- planDetail 状态必须为 IN_PROGRESS

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 关键结果不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |
| 40001 | 参数错误（selfScore超出0-10范围） |

**curl 示例**：
```bash
# 自评打7分
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/key-results/7001/self-score' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"selfScore":7}'
```

---

## 更新 O 进度状态

**方法+路径**：PUT /api/v1/okr/objectives/{id}/progress-status

**功能**：手动覆盖 O 的进度状态。O 的进度状态通常由 KR 自动计算汇总，但支持手动设置覆盖。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| progressStatus | String | ✅ | NORMAL/AT_RISK/DELAYED/COMPLETED | 进度状态 |

**成功响应 data 字段（ObjectiveResultVO）**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | O ID |
| description | String | O描述 |
| sortOrder | Integer | 排序值 |
| progress | BigDecimal | 进度 |
| progressStatus | String | 进度状态（已更新为新值） |
| selfScore | BigDecimal | 自评分 |
| visibilityType | String | 可见范围 |
| ftOkr | String | FT-OKR标记 |
| remark | String | 备注 |
| createdAt | String(DateTime) | 创建时间 |
| updatedAt | String(DateTime) | 更新时间 |
| keyResults | Array | KR简略列表 |

**业务规则**：
- 只有 O 所有者（本人）可以手动更新进度状态
- planDetail 状态必须为 IN_PROGRESS

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在 |
| 40803 | 非本人操作 |
| 40907 | 计划明细状态不允许编辑 |

**curl 示例**：
```bash
# 将O标记为已完成
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6001/progress-status' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"progressStatus":"COMPLETED"}'
```

---

## 更新挑战度指数

**方法+路径**：PUT /api/v1/okr/objectives/{id}/challenge-index

**功能**：直属上级为下属的 O 评分挑战度指数，评估该目标的挑战性。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| challengeIndex | Integer | ✅ | 1-10，整数 | 挑战度指数 |

**成功响应 data 字段**：同 [更新O进度状态](#更新-o-进度状态) 的 ObjectiveResultVO。

**业务规则**：
- **只有直属上级**（O 所有者的直接汇报上级）可以评分
- challengeIndex 必须是 1-10 的整数

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在 |
| 40301 | 非直属上级，无操作权限 |

**curl 示例**：
```bash
# 直属上级给下属的O评挑战度8分
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6001/challenge-index' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"challengeIndex":8}'
```

---

## 更新 FT-OKR 标记

**方法+路径**：PUT /api/v1/okr/objectives/{id}/ft-okr

**功能**：设置或取消 O 的 FT-OKR（Focus Team OKR）标记。FT-OKR 表示该目标是团队重点关注目标，同一 planDetail 下只能有一个 FT-OKR。

**认证**：必须

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| id | Long | ✅ | O ID |

**请求体（JSON）**：
| 字段 | 类型 | 必填 | 枚举/约束 | 说明 |
|------|------|:----:|-----------|------|
| ftOkr | String | ✅ | Y/N | FT-OKR标记 |

**成功响应 data 字段**：同 [更新O进度状态](#更新-o-进度状态) 的 ObjectiveResultVO。

**业务规则**：
- 只有 O 所有者（本人）可以设置 FT-OKR
- 设置 ftOkr=Y 时，同一 planDetail 下不能已有其他 ftOkr=Y 的 O（唯一性校验）
- 设置 ftOkr=N 即取消当前 O 的 FT-OKR 标记（不限制）
- 传入非 Y/N 的值会被数据库 CHECK 约束拒绝（返回 50002 数据库错误）

**错误码**：
| code | 触发场景 |
|------|----------|
| 40401 | 目标不存在 |
| 40803 | 非本人操作 |
| 40905 | 已存在FT-OKR=Y的记录，请先取消后新增 |

**curl 示例**：
```bash
# 将O标记为FT-OKR
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6001/ft-okr' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ftOkr":"Y"}'

# 取消FT-OKR标记
curl -sS -X PUT 'http://localhost:8080/api/v1/okr/objectives/6001/ft-okr' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ftOkr":"N"}'
```
