#!/usr/bin/env bash
# PMS OKR CLI - 通用调用脚本（生产环境版）
# 用法:
#   ./call.sh METHOD PATH [BODY_JSON] [TOKEN]

set -euo pipefail

CONFIG_DIR="${PMS_CONFIG_DIR:-$HOME/.pms-okr-cli-prd}"
CONFIG_FILE="$CONFIG_DIR/config.json"
BASE_URL="${PMS_BASE_URL:-}"
# 统一 token 缓存路径（与 call.js/call.ps1 对齐）：TMPDIR 或 /tmp 下的 JSON 文件 {mode,user,token}
if [ -n "${PMS_TOKEN_CACHE:-}" ]; then
    TOKEN_CACHE="$PMS_TOKEN_CACHE"
else
    TOKEN_CACHE="${TMPDIR:-/tmp}/pms-token-prd.json"
fi
TOKEN_CACHE_DIR="$(dirname "$TOKEN_CACHE")"
mkdir -p "$TOKEN_CACHE_DIR" 2>/dev/null || true
chmod 700 "$TOKEN_CACHE_DIR" 2>/dev/null || true

if [ -t 2 ]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
    CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; CYAN=''; BOLD=''; NC=''
fi
die() { echo -e "${RED}错误：$1${NC}" >&2; exit 1; }

jget() {
    python3 -c "
import sys, json
def dig(o, p):
    for k in p.split('.'):
        if o is None: return ''
        if isinstance(o, list): o = o[int(k)]
        else: o = o.get(k)
    return '' if o is None else (o if isinstance(o,str) else json.dumps(o,ensure_ascii=False))
try:
    s = sys.stdin.read()
    if not s.strip(): print(''); sys.exit(0)
    print(dig(json.loads(s), '$1'))
except Exception: print('')
"
}
jcode() { echo "$1" | jget code; }

http() {
    local m="$1" p="$2" body="${3:-}"
    if [ $# -ge 3 ]; then shift 3; else shift $#; fi
    local args=(-sS --connect-timeout 10 --max-time 30 -X "$m" "${BASE_URL}${p}" -H "Content-Type: application/json")
    while [ $# -gt 0 ]; do
        case "$1" in
            -H) args+=(-H "$2"); shift 2 ;;
            *)  args+=("$1"); shift ;;
        esac
    done
    [ -n "$body" ] && args+=(-d "$body")
    curl "${args[@]}"
}

config_get() {
    local key="$1"
    if [ ! -f "$CONFIG_FILE" ]; then echo ""; return; fi
    python3 -c "
import json, sys
try:
    with open('$CONFIG_FILE') as f:
        c = json.load(f)
    v = c.get('$key', '')
    print(v if v is not None else '')
except Exception:
    print('')
"
}

load_config() {
    if [ -z "$BASE_URL" ]; then
        local cfg_url; cfg_url=$(config_get baseUrl)
        BASE_URL="${cfg_url:-https://comark.stfile.com}"
    fi
}

usage() {
    cat <<EOF
用法: $0 METHOD PATH [BODY_JSON] [TOKEN]
  METHOD     HTTP方法: GET/POST/PUT/DELETE
  PATH       API路径
  BODY_JSON  请求体JSON（POST/PUT时）
  TOKEN      Bearer Token（可选）
EOF
    exit 1
}

[ $# -lt 2 ] && usage
METHOD=$(echo "$1" | tr '[:lower:]' '[:upper:]')
PATH_ARG="$2"
BODY_JSON="${3:-}"
TOKEN_ARG="${4:-}"
case "$METHOD" in GET|POST|PUT|DELETE) ;; *) die "不支持的HTTP方法: $METHOD" ;; esac
load_config

login_cas() {
    local cas_token="${1:-${PMS_CAS_TOKEN:-$(config_get casToken)}}"
    [ -z "$cas_token" ] && die "未提供CAS Token"
    echo -e "${YELLOW}[auth] CAS统一认证登录中...${NC}" >&2
    local login_json; login_json=$(CRED_TOK="$cas_token" python3 -c         'import os,json; print(json.dumps({"token":os.environ["CRED_TOK"]}))')
    local resp; resp=$(http POST "/api/v1/auth/cas/login" "$login_json")
    [ "$(jcode "$resp")" != "20000" ] && { echo -e "${RED}CAS登录失败: ${resp}${NC}" >&2; exit 1; }
    local t; t=$(echo "$resp" | jget data.token)
    local ec; ec=$(echo "$resp" | jget data.employee.employeeCode)
    [ -z "$t" ] && die "登录响应无token"
    CAS_EC="$ec" CAS_TOK="$t" CAS_PATH="$TOKEN_CACHE" python3 -c         'import os,json; json.dump({"mode":"cas","user":os.environ.get("CAS_EC",""),"token":os.environ["CAS_TOK"]}, open(os.environ["CAS_PATH"],"w"), ensure_ascii=False)' 2>/dev/null || {
        echo "cas" > "${TOKEN_CACHE}.mode"
        [ -n "$ec" ] && echo "$ec" > "${TOKEN_CACHE}.user"
        echo "$t" > "${TOKEN_CACHE}"
    }
    chmod 600 "$TOKEN_CACHE" 2>/dev/null || true
    chmod 600 "${TOKEN_CACHE}.mode" 2>/dev/null || true
    echo -e "${GREEN}[auth] CAS登录成功${NC}" >&2
    echo "$t"
}

relogin() {
    login_cas "${PMS_CAS_TOKEN:-$(config_get casToken)}"
}

get_token() {
    if [ -n "$TOKEN_ARG" ]; then echo "$TOKEN_ARG"; return; fi
    if [ -f "$TOKEN_CACHE" ] && [ -s "$TOKEN_CACHE" ]; then
        local cached; cached=$(cat "$TOKEN_CACHE")
        local code
        code=$(http GET "/api/v1/auth/me" "" -H "Authorization: Bearer ${cached}" | jget code)
        if [ "$code" = "20000" ]; then echo "$cached"; return; fi
        echo -e "${YELLOW}[auth] 缓存token已失效，重新登录...${NC}" >&2
    else
        echo -e "${YELLOW}[auth] 未找到缓存token，开始登录...${NC}" >&2
    fi
    relogin
}

TOKEN=$(get_token)

# ============ 执行业务请求 ============
START_MS=$(python3 -c "import time; print(int(time.time()*1000))")
START_ISO=$(date -u +"%Y-%m-%dT%H:%M:%S+00:00")

CURL_ARGS=(-sS --connect-timeout 10 --max-time 60 -w $'\n__HTTP_CODE__:%{http_code}' -X "$METHOD" "${BASE_URL}${PATH_ARG}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "X-Client-Type: SKILL" \
    -H "X-Skill-Id: pms-okr-cli-prd" \
    -H "X-Skill-Version: 1.0.0" \
    -H "Content-Type: application/json")
[ -n "$BODY_JSON" ] && CURL_ARGS+=(-d "$BODY_JSON")

echo -e "${CYAN}[${METHOD}] ${BASE_URL}${PATH_ARG}${NC}" >&2
# 打印 Body 时脱敏敏感字段（密码/token）
if [ -n "$BODY_JSON" ]; then
    SAFE_BODY=$(echo "$BODY_JSON" | python3 -c "
import sys,json
SENS=('password','casToken','token','oldPassword','newPassword','accessToken','refreshToken','authorization')
def mask(o):
    if isinstance(o,dict):
        return {k:('***' if k in SENS else mask(v)) for k,v in o.items()}
    if isinstance(o,list):
        return [mask(x) for x in o]
    return o
try:
    s=sys.stdin.read()
    d=json.loads(s)
    print(json.dumps(mask(d),ensure_ascii=False))
except Exception:
    print(s[:500])
" 2>/dev/null || echo "$BODY_JSON" | head -c 500)
    echo -e "${CYAN}Body: ${SAFE_BODY}${NC}" >&2
fi

CURL_RAW=$(curl "${CURL_ARGS[@]}")
CURL_EXIT=$?
HTTP_CODE=$(echo "$CURL_RAW" | tail -1 | sed -n 's/.*__HTTP_CODE__://p')
RESP=$(echo "$CURL_RAW" | sed '$d')
[ -z "$HTTP_CODE" ] && HTTP_CODE="000"
CODE=$(echo "$RESP" | jget code)
END_MS=$(python3 -c "import time; print(int(time.time()*1000))")
DURATION_MS=$((END_MS - START_MS))

# 从 JWT 解出工号/用户ID/姓名（base64 第二段）
EMP_CODE=""
USER_ID=""
USER_NAME=""
if [ -n "$TOKEN" ]; then
    JWT_DECODE=$(echo "$TOKEN" | cut -d'.' -f2 2>/dev/null | python3 -c "
import sys, base64, json
try:
    s=sys.stdin.read().strip()
    s += '=' * (-len(s)%4)
    claims=json.loads(base64.urlsafe_b64decode(s))
    ec=claims.get('employeeCode','') or ''
    uid=claims.get('employeeId','') or claims.get('userId','') or claims.get('uid','') or ''
    nm=claims.get('employeeName','') or claims.get('userName','') or claims.get('name','') or ''
    # 兼容数字id转字符串
    print(json.dumps({'employeeCode':ec,'userId':str(uid) if uid is not None else '','userName':nm}, ensure_ascii=False))
except Exception: print('{}')
" 2>/dev/null)
    EMP_CODE=$(echo "$JWT_DECODE" | python3 -c "import sys,json;print(json.load(sys.stdin).get('employeeCode',''))" 2>/dev/null)
    USER_ID=$(echo "$JWT_DECODE" | python3 -c "import sys,json;print(json.load(sys.stdin).get('userId',''))" 2>/dev/null)
    USER_NAME=$(echo "$JWT_DECODE" | python3 -c "import sys,json;print(json.load(sys.stdin).get('userName',''))" 2>/dev/null)
fi
[ -z "$USER_ID" ] && USER_ID="$EMP_CODE"
[ -z "$USER_NAME" ] && USER_NAME="$EMP_CODE"

if [ "$CODE" = "20000" ]; then
    echo -e "${GREEN}[20000] success (${DURATION_MS}ms)${NC}" >&2
else
    echo -e "${RED}[${CODE}] 请求失败 (${DURATION_MS}ms)${NC}" >&2
fi
echo "$RESP" | python3 -m json.tool 2>/dev/null || echo "$RESP"

# 登录/授权/Token 校验类接口不上报日志（避免密码/token 走日志链路，也避免 auth 类动作被重复记录）
# 匹配规则：路径前缀为 /api/vN/auth/ 或 /auth/（严格前缀匹配，避免误伤其他含 auth 的路径）
# 登录/授权/Token 校验类接口跳过（避免密码/token 走日志链路）
case "$PATH_ARG" in
    /api/v[0-9]/auth/*|/auth/*)
        [ "$CODE" != "20000" ] && exit 1
        exit 0
        ;;
esac

[ "$CODE" != "20000" ] && exit 1
exit 0
