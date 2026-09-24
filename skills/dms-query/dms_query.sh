#!/usr/bin/env bash
# DMS Hive 查询脚本
# 用法: DMS_USER=xxx DMS_PASS=xxx dms_query.sh <sql>
# 凭证通过环境变量传递，避免命令行明文暴露
# 输出: JSON 格式的查询结果到 stdout，状态信息到 stderr

set -euo pipefail

DMS_HOST="https://dms.mininglamp.com"
DS_ID=1
DB_ID=1
OP_ID="8888888888"
CUSTOMER="admonitor"
PROXY_USER="mz_supertool"
POLL_INTERVAL=10
MAX_POLLS=60

# 从环境变量读取凭证
if [ -z "${DMS_USER:-}" ] || [ -z "${DMS_PASS:-}" ]; then
  >&2 echo "[错误] 请通过环境变量设置凭证: DMS_USER=用户名 DMS_PASS=密码"
  echo '{"success":false,"error":"缺少 DMS_USER 或 DMS_PASS 环境变量"}'
  exit 1
fi

USERNAME="$DMS_USER"
PASSWORD="$DMS_PASS"
SQL="$1"

# ============================================================
# Step 1: 登录
# ============================================================
>&2 echo "[1/4] 登录 DMS..."

LOGIN_HEADERS=$(mktemp)
LOGIN_PAYLOAD=$(mktemp)
# 用 python 安全构建 JSON，避免密码中的特殊字符问题
python3 -c "
import json, os
payload = json.dumps({'username': os.environ['DMS_USER'], 'password': os.environ['DMS_PASS']})
with open('$LOGIN_PAYLOAD', 'w') as f:
    f.write(payload)
"
LOGIN_RESP=$(curl -s -D "$LOGIN_HEADERS" -X POST "${DMS_HOST}/auth/login" \
  -H "Content-Type: application/json" \
  -d @"$LOGIN_PAYLOAD")
rm -f "$LOGIN_PAYLOAD"

LOGIN_CODE=$(echo "$LOGIN_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('code',''))" 2>/dev/null || echo "")

if [ "$LOGIN_CODE" != "200" ]; then
  LOGIN_MSG=$(echo "$LOGIN_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('msg','未知错误'))" 2>/dev/null || echo "登录响应异常")
  >&2 echo "[错误] 登录失败: $LOGIN_MSG"
  rm -f "$LOGIN_HEADERS"
  echo "{\"success\":false,\"error\":\"登录失败: $LOGIN_MSG\"}"
  exit 1
fi

TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['token'])")
SESSION=$(grep -i 'Set-Cookie: SESSION=' "$LOGIN_HEADERS" | sed 's/.*SESSION=//;s/;.*//' | tr -d '\r')
rm -f "$LOGIN_HEADERS"

>&2 echo "[1/4] 登录成功"

# ============================================================
# Step 2: 提交 SQL
# ============================================================
>&2 echo "[2/4] 提交 SQL..."

# 用 python 构建 JSON，通过临时文件传递 SQL 避免引号转义问题
SQL_FILE=$(mktemp)
echo "$SQL" > "$SQL_FILE"

SUBMIT_RESP=$(python3 -c "
import json, subprocess, sys

with open('${SQL_FILE}', 'r') as f:
    sql = f.read().strip()

payload = {
    'sql': sql,
    'dsId': ${DS_ID},
    'dbId': ${DB_ID},
    'opId': '${OP_ID}',
    'customer': '${CUSTOMER}',
    'enableFunctionsAutoLoad': False,
    'proxyUser': '${PROXY_USER}',
    'hive.exec.reducers.max': '1024',
    'mapred.max.split.size': '256000000',
    'mapreduce.job.queuename': 'root.marvel.dms',
    'hive.exec.parallel': 'true',
    'mapred.min.split.size': '64000000'
}
result = subprocess.run([
    'curl', '-s', '-X', 'POST',
    '${DMS_HOST}/hive-query/send-query',
    '-H', 'X-Auth-Token: ${TOKEN}',
    '-H', 'Cookie: SESSION=${SESSION}',
    '-H', 'Content-Type: application/json',
    '-d', json.dumps(payload)
], capture_output=True, text=True)
print(result.stdout)
")
rm -f "$SQL_FILE"

SUBMIT_CODE=$(echo "$SUBMIT_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('code',''))" 2>/dev/null || echo "")

if [ "$SUBMIT_CODE" != "200" ]; then
  SUBMIT_MSG=$(echo "$SUBMIT_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('msg','未知错误'))" 2>/dev/null || echo "提交响应异常")
  >&2 echo "[错误] SQL 提交失败: $SUBMIT_MSG"
  echo "{\"success\":false,\"error\":\"SQL提交失败: $SUBMIT_MSG\"}"
  exit 1
fi

QUERY_ID=$(echo "$SUBMIT_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['data'])")
>&2 echo "[2/4] SQL 已提交, queryHistId=$QUERY_ID"

# ============================================================
# Step 3: 轮询状态
# ============================================================
>&2 echo "[3/4] 等待查询完成..."

for i in $(seq 1 $MAX_POLLS); do
  sleep $POLL_INTERVAL

  STATUS_RESP=$(curl -s "${DMS_HOST}/hive-query/get-query-status?queryHistId=${QUERY_ID}" \
    -H "X-Auth-Token: ${TOKEN}" \
    -H "Cookie: SESSION=${SESSION}")

  STATUS=$(echo "$STATUS_RESP" | python3 -c "
import json, sys
data = json.load(sys.stdin)
item = data['data']['${QUERY_ID}']
print(item['status'])
" 2>/dev/null || echo "0")

  case "$STATUS" in
    1030)
      QUERY_TIME=$(echo "$STATUS_RESP" | python3 -c "
import json, sys
data = json.load(sys.stdin)
item = data['data']['${QUERY_ID}']
print(item.get('queryTime', 0))
" 2>/dev/null || echo "0")
      >&2 echo "[3/4] 查询完成! 耗时 ${QUERY_TIME}ms"
      break
      ;;
    1031)
      ELAPSED=$((i * POLL_INTERVAL))
      >&2 echo "  ... 运行中 (已等待 ${ELAPSED}s)"
      ;;
    1032)
      >&2 echo "[错误] 查询被取消"
      echo "{\"success\":false,\"error\":\"查询被取消\"}"
      exit 1
      ;;
    1033)
      LOG=$(echo "$STATUS_RESP" | python3 -c "
import json, sys
data = json.load(sys.stdin)
item = data['data']['${QUERY_ID}']
print(item.get('log', '') or '无日志')
" 2>/dev/null || echo "无日志")
      >&2 echo "[错误] 查询失败: $LOG"
      echo "{\"success\":false,\"error\":\"查询失败\",\"log\":\"$LOG\"}"
      exit 1
      ;;
    *)
      >&2 echo "  ... 状态: $STATUS (已等待 $((i * POLL_INTERVAL))s)"
      ;;
  esac

  if [ "$i" -eq "$MAX_POLLS" ]; then
    >&2 echo "[错误] 查询超时（${MAX_POLLS}轮 × ${POLL_INTERVAL}s）"
    echo "{\"success\":false,\"error\":\"查询超时\",\"queryHistId\":\"${QUERY_ID}\"}"
    exit 1
  fi
done

# ============================================================
# Step 4: 获取结果
# ============================================================
>&2 echo "[4/4] 获取结果..."

RESULT_RESP=$(curl -s "${DMS_HOST}/hive-query/get-query-result?queryHistId=${QUERY_ID}&pageNo=1&pageRows=500" \
  -H "X-Auth-Token: ${TOKEN}" \
  -H "Cookie: SESSION=${SESSION}")

RESULT_CODE=$(echo "$RESULT_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('code',''))" 2>/dev/null || echo "")

if [ "$RESULT_CODE" != "200" ]; then
  >&2 echo "[错误] 获取结果失败"
  echo "{\"success\":false,\"error\":\"获取结果失败\",\"queryHistId\":\"${QUERY_ID}\"}"
  exit 1
fi

# 输出结果 JSON
echo "$RESULT_RESP" | python3 -c "
import json, sys
resp = json.load(sys.stdin)
data = resp['data']
output = {
    'success': True,
    'queryHistId': '${QUERY_ID}',
    'queryTime': '${QUERY_TIME}ms',
    'totalRows': data.get('size', 0),
    'columns': [c['col_name'] for c in data['data']['result_cols']],
    'rows': data['data']['result_data']
}
print(json.dumps(output, ensure_ascii=False, indent=2))
"

>&2 echo "[完成] 共 $(echo "$RESULT_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['data'].get('size',0))" 2>/dev/null) 行结果"
