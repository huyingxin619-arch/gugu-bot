# 典型场景调用链示例（examples.md）

以下示例使用 `call.sh` 脚本调用，也可替换为标准 curl。

> ⚠️ **重要**：以下所有示例中的 ID（5001、6001、7001 等）仅为演示用，实际调用时必须通过查询接口获取真实 ID，禁止直接复制使用。

> 提示：先 `cd ~/.openclaw/skills/pms-okr-cli-prd`，然后 `chmod +x scripts/call.sh`（如未加执行权限）。

## 标准调用模式（每个 agent 必读）

所有调用遵循「调用 → 提取 → 传递」模式：

```bash
# 1. 调用接口获取响应
RESP=$(./scripts/call.sh GET /api/v1/okr/plan-details 2>/dev/null)

# 2. 从 stdout JSON 中提取需要的字段
PLAN_DETAIL_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['current']['planDetailId'])")

# 3. 用提取的 ID 调下一步
RESP2=$(./scripts/call.sh GET "/api/v1/okr/my?planDetailId=$PLAN_DETAIL_ID" 2>/dev/null)

# 4. 提取 objectiveId / keyResultId
OBJ_ID=$(echo "$RESP2" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['objectives'][0]; print(d['id'])")
KR_ID=$(echo "$RESP2" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['objectives'][0]['keyResults'][0]; print(d['id'])")

# 5. 错误检查
CODE=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['code'])")
if [ "$CODE" != "20000" ]; then
  MSG=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['message'])")
  echo "操作失败: $MSG" >&2; exit 1
fi
```

---

## 示例1：登录获取 Token

```bash
cd ~/.openclaw/skills/pms-okr-cli-prd

# 使用call.sh（自动登录并缓存token到/tmp/pms-token-prd）
./scripts/call.sh GET /api/v1/auth/me

# 或直接curl获取token
BASE_URL=https://comark.stfile.com
TOKEN=$(curl -sS -X POST "$BASE_URL/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"employeeCode":"YOUR_EMP_CODE","password":"your_password"}' | \
  python3 -c "import sys,json;print(json.load(sys.stdin)['data']['token'])")
echo "Token: $TOKEN"
```

期望响应：
```json
{
  "code": 20000,
  "data": { "employeeCode": "zhaobinquan", "employeeName": "赵斌全", ... }
}
```

---

## 示例2：获取我的当前月份 OKR

```bash
# Step 1: 获取当前计划明细（拿到planDetailId）
./scripts/call.sh GET /api/v1/okr/plan-details

# 假设返回 current.planDetailId = 5001
PLAN_DETAIL_ID=5001

# Step 2: 获取我的OKR
./scripts/call.sh GET "/api/v1/okr/my?planDetailId=$PLAN_DETAIL_ID"
```

curl 等价写法：
```bash
curl -sS -X GET "$BASE_URL/api/v1/okr/plan-details" \
  -H "Authorization: Bearer $TOKEN"

PLAN_DETAIL_ID=$(curl -sS -X GET "$BASE_URL/api/v1/okr/plan-details" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json;d=json.load(sys.stdin);print(d['data']['current']['planDetailId'])")

curl -sS -X GET "$BASE_URL/api/v1/okr/my?planDetailId=$PLAN_DETAIL_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 示例2b：查看他人 OKR

**场景**：用户说"帮我看看张三的 OKR"，需要完整链路：搜索员工 → 获取周期信息 → 查他人 planDetailId → 查他人 OKR。

```bash
# Step 1: 搜索张三的工号
./scripts/call.sh GET '/api/v1/okr/employees/search?keyword=张三'
# 假设返回 employeeId = "zhangsan"

# Step 2: 获取当前周期信息（需要 periodId、year、month）
./scripts/call.sh GET /api/v1/okr/plan-details
# 假设返回 current.periodId=10, year=2025, month=7

# Step 3: 查询张三的 planDetailId
./scripts/call.sh GET '/api/v1/okr/employees/zhangsan/plan-detail?year=2025&month=7&periodId=10'
# 假设返回 planDetailId=5002

# Step 4: 获取张三的可见 OKR（已按可见性过滤，看不到的 O/KR 不会返回）
./scripts/call.sh GET '/api/v1/okr/employees/zhangsan?planDetailId=5002'
```

**注意事项**：
- 张三的 planDetailId 和你自己的不同，必须通过 Step 3 获取，不能用你自己的 planDetailId
- 返回的 OKR 已经过可见性过滤，如果张三设置了 REPORT_LINE_AND_SPECIFIED 且你不在范围内，对应 O/KR 不会返回
- 如果返回的 objectives 为空数组，说明你对张三的所有 OKR 都不可见

---

## 示例3：新增一个 O 带 2 个 KR

```bash
# 假设PLAN_DETAIL_ID=5001
PLAN_DETAIL_ID=5001

./scripts/call.sh POST "/api/v1/okr/$PLAN_DETAIL_ID/objectives" '{
  "description": "Q3提升后端系统整体性能和可用性",
  "visibilityType": "ALL",
  "remark": "季度核心目标",
  "ftOkr": "N",
  "keyResults": [
    {
      "description": "接口P99响应时间降低到200ms以内",
      "krType": "EXECUTION",
      "weight": 50,"currentValue": "500ms"
    },
    {
      "description": "系统可用性达到99.99%",
      "krType": "EXECUTION",
      "weight": 50,"currentValue": "99.9%"
    }
  ]
}'
```

期望响应（提取关键data字段）：
```json
{
  "code": 20000,
  "data": {
    "id": 6001,
    "description": "Q3提升后端系统整体性能和可用性",
    "keyResults": [
      { "id": 7001, "description": "接口P99响应时间降低到200ms以内", "sortOrder": 0 },
      { "id": 7002, "description": "系统可用性达到99.99%", "sortOrder": 0 }
    ]
  }
}
```

> **注意**：两个KR的weight合计必须=100，否则返回40901。

---

## 示例4：编辑 O 描述

```bash
# 修改O 6001的描述和备注
./scripts/call.sh PUT /api/v1/okr/objectives/6001 '{
  "description": "Q3提升后端系统整体性能、可用性与稳定性",
  "remark": "更新：增加稳定性维度"
}'
```

期望响应：
```json
{
  "code": 20000,
  "data": {
    "id": 6001,
    "description": "Q3提升后端系统整体性能、可用性与稳定性",
    "remark": "更新：增加稳定性维度"
  }
}
```

---

## 示例5：更新 KR 进度

```bash
# 将KR 7001的进度更新为60%，状态为NORMAL，当前值280ms
./scripts/call.sh PUT /api/v1/okr/key-results/7001/progress '{
  "progress": 60,
  "progressStatus": "NORMAL",
  "currentValue": "280ms"
}'
```

期望响应：
```json
{
  "code": 20000,
  "data": {
    "id": 7001,
    "objectiveId": 6001,
    "description": "接口P99响应时间降低到200ms以内",
    "weight": 50.00
  }
}
```

再验证进度已更新：
```bash
./scripts/call.sh GET "/api/v1/okr/my?planDetailId=5001" | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']
for o in d['objectives']:
    for kr in o['keyResults']:
        print(f\"KR {kr['id']}: progress={kr['progress']}%, status={kr['progressStatus']}, currentValue={kr['currentValue']}\")
"
```

---

## 示例6：发起对齐

```bash
# 前置条件：知道目标员工工号和其planDetailId
# Step 1: 搜索目标员工
./scripts/call.sh GET '/api/v1/okr/employees/search?keyword=张三'
# 假设返回 employeeId = "zhangsan"

# Step 2: 获取当前周期信息（需要periodId、year、month）
./scripts/call.sh GET /api/v1/okr/plan-details
# 假设 periodId=10, year=2025, month=7

# Step 3: 查询张三的planDetailId
./scripts/call.sh GET '/api/v1/okr/employees/zhangsan/plan-detail?year=2025&month=7&periodId=10'
# 假设返回 planDetailId=5002

# Step 4: 获取张三的可见OKR树（选择要对齐的目标O/KR）
./scripts/call.sh GET '/api/v1/okr/employees/zhangsan/visible-okrs?planDetailId=5002'
# 假设张三的O id=6101

# Step 5: 发起对齐（我的O 6001对齐到张三的O 6101）
./scripts/call.sh POST /api/v1/okr/alignments '{
  "sourceObjectiveId": 6001,
  "targetEmployeeId": "zhangsan",
  "targetObjectiveId": 6101
}'
```

期望响应：
```json
{
  "code": 20000,
  "data": {
    "id": 8001,
    "status": "PENDING",
    "sourceEmployeeId": "zhaobinquan",
    "targetEmployeeId": "zhangsan",
    "sourceObjectiveId": 6001,
    "targetObjectiveId": 6101
  }
}
```

> 张三接受对齐需要用张三的Token调用：
> ```bash
> ./scripts/call.sh PUT /api/v1/okr/alignments/8001/accept '{"targetObjectiveId":6101}'
> ```

---

## 示例7：对 O 发表评论

```bash
# 在planDetailId=5001下发表顶级评论，并@张三
./scripts/call.sh POST '/api/v1/okr/5001/comments' '{
  "content": "@张三 这个O的进展不错，继续保持",
  "mentionedEmployeeIds": ["zhangsan"]
}'

# 回复评论（假设评论ID=9001）
./scripts/call.sh POST '/api/v1/okr/5001/comments' '{
  "content": "谢谢，月底前完成",
  "parentCommentId": 9001
}'

# 查看评论列表
./scripts/call.sh GET '/api/v1/okr/5001/comments?page=1&pageSize=20'

# 查看评论总数
./scripts/call.sh GET '/api/v1/okr/5001/comments/count'
```

期望响应（发表评论）：
```json
{
  "code": 20000,
  "data": {
    "id": 9001,
    "content": "@张三 这个O的进展不错，继续保持",
    "createdBy": "zhaobinquan",
    "createdByName": "赵斌全",
    "replies": []
  }
}
```

---

## 示例8：拆解 KR 给下属

```bash
# KR ID=7001

# Step 1: 获取可拆解的下属列表
./scripts/call.sh GET '/api/v1/okr/key-results/7001/subordinates'
# 假设返回:
# wangwu(王五, DIRECT, alreadyDecomposed=false)
# zhaoliu(赵六, DIRECT, alreadyDecomposed=false)

# Step 2: 查看当前拆解列表
./scripts/call.sh GET '/api/v1/okr/key-results/7001/decompose'

# Step 3: 保存拆解：给王五30%、给赵六20%
./scripts/call.sh PUT '/api/v1/okr/key-results/7001/decompose' '{
  "items": [
    {"action": "ADD", "employeeId": "wangwu", "ratio": 30},
    {"action": "ADD", "employeeId": "zhaoliu", "ratio": 20}
  ]
}'
# 注意：比例合计不能超过100%

# Step 4: 验证拆解结果
./scripts/call.sh GET '/api/v1/okr/key-results/7001/decompose'
```

期望响应：
```json
{
  "code": 20000,
  "data": [
    {"id": 10001, "keyResultId": 7001, "employeeId": "wangwu", "employeeName": "王五", "ratio": 30.00},
    {"id": 10002, "keyResultId": 7001, "employeeId": "zhaoliu", "employeeName": "赵六", "ratio": 20.00}
  ]
}
```

后续修改：把王五的比例改为40%，删除赵六的拆解：
```bash
./scripts/call.sh PUT '/api/v1/okr/key-results/7001/decompose' '{
  "items": [
    {"action": "UPDATE", "id": 10001, "ratio": 40},
    {"action": "DELETE", "id": 10002}
  ]
}'
```

单条删除（点"移除"按钮场景，无需走批量保存）：
```bash
# 删除单条拆解记录 10002
./scripts/call.sh DELETE '/api/v1/okr/decompose/10002'
```

---

## 示例9：查看 O 的进展和更新日志

```bash
# O ID=6001

# 新增一条进展
./scripts/call.sh POST /api/v1/okr/objectives/6001/progress-logs '{
  "content": "本周完成核心接口设计，P99响应时间已降至220ms"
}'

# 获取合并的进展+更新日志列表
./scripts/call.sh GET '/api/v1/okr/objectives/6001/logs?page=1&pageSize=20'
```

返回的 records 里，UPDATE 类型记录已包含 targetTypeName/actionName/summary/createdByName 等中文冗余字段，可直接渲染成自然语言，例如：
- `张三 新建了关键结果(KR):接口P99响应时间降低到200ms以内`
- `张三 将权重由“30”修改为“50”`
- `张三 新建了目标(O):Q3提升后端系统性能`

---

## 使用 call.sh 切换服务地址

```bash
# 临时切换到本机开发环境
export PMS_BASE_URL=http://localhost:8080
./scripts/call.sh GET /api/v1/okr/plan-details

# 切回生产环境（取消环境变量即使用默认）
unset PMS_BASE_URL
```

---

## 示例10：聚合编辑 O（新增/删除/修改 KR 一次性提交）

⚠️ KR 的新增、删除、权重调整**必须**通过此接口，不支持单独增删改。

```bash
# 前置：已有 O（ID=6001），其下有 2 个 KR（ID=7001、7002）
# 目标：修改 KR1 权重为 40、删除 KR2、新增 KR3（权重 60）

./scripts/call.sh PUT /api/v1/okr/objectives/6001 '{
  "description": "Q3提升后端系统整体性能",
  "visibilityType": "ALL",
  "ftOkr": "N",
  "sortOrder": 1,
  "keyResults": [
    {
      "id": 7001,
      "description": "接口P99响应时间降低到200ms以内",
      "krType": "EXECUTION",
      "weight": 40,"currentValue": "280ms",
      "sortOrder": 1
    },
    {
      "description": "系统可用性达到99.99%",
      "krType": "EXECUTION",
      "weight": 60,"sortOrder": 2
    }
  ]
}'
```

**关键规则**：
- `keyResults` 数组是该 O 下 KR 的**最终全集**，未出现的 KR 会被删除
- 有 `id` 的 KR = 编辑现有；无 `id` 的 = 新增
- 删除 KR 前，后端会校验是否存在活跃对齐（PENDING/ACCEPTED），有则整单回滚返回 40904
- 所有 KR 权重合计必须 = 100，否则返回 40901
- `selfScore` 可选传入，传入时覆盖该 KR 自评分并自动重算 O 加权自评分

期望响应：
```json
{
  "code": 20000,
  "data": {
    "id": 6001,
    "description": "Q3提升后端系统整体性能",
    "keyResults": [
      {"id": 7001, "weight": 40.00, ...},
      {"id": 7003, "weight": 60.00, ...}
    ]
  }
}
```
