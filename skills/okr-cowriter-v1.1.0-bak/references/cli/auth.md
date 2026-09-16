# 认证方式(auth.md)

PMS OKR 模块所有业务接口均需要认证,采用 JWT Bearer Token 机制。

## 认证凭据获取顺序(脚本内置优先级)

调用 `scripts/call.sh`(或同目录下 `call.js`/`call.ps1`/`call.bat`,按平台选择)时,脚本按以下优先级获取认证凭据:

1. **命令行参数** `TOKEN`(第4个参数):直接使用,跳过登录
2. **环境变量**:`PMS_CAS_TOKEN`
3. **配置文件** `~/.pms-okr-cli-prd/config.json`(持久化保存)
4. **Token缓存** `<系统临时目录>/pms-token-prd.json`(格式 `{mode,user,token}`,24h 内有效,过期自动用配置文件/环境变量的 CAS Token 重新登录;四个脚本共享同一份缓存)
   - macOS/Linux:`$TMPDIR/pms-token-prd.json`(通常是 `/var/folders/.../T/pms-token-prd.json` 或 `/tmp/pms-token-prd.json`)
   - Windows:`%TEMP%\pms-token-prd.json`

> ⚠️ **脚本不弹任何图形对话框、不弹终端菜单**。没有配置且缓存失效时,直接打印错误提示并退出,由调用方(AI agent 或用户)主动完成配置。

---

## 1. 首次配置(推荐由 Agent 引导完成)

### Agent 配置流程(推荐)

AI agent 在第一次调用脚本前,应检查以下逻辑:

1. **先尝试调用一次脚本**:按平台选择脚本(macOS/Linux → `./scripts/call.sh`,Node.js 跨平台 → `node scripts/call.js`,Windows → `scripts\call.bat`/`.\scripts\call.ps1`)
   例如:`./scripts/call.sh GET /api/v1/okr/plan-details`
   - 若成功(exit 0)→ 说明配置已存在或token缓存有效,直接用
   - 若失败(exit 1,stderr 包含"未配置认证方式")→ 进入配置引导
2. **向用户询问**：
   - “请提供 cli-setup.md 安装说明中给出的身份认证 key”
   - 服务地址默认生产环境 `https://comark.stfile.com`，无需询问
3. **Agent 写入配置文件** `~/.pms-okr-cli-prd/config.json`（权限建议 600），将身份认证 key 填入 `casToken` 字段
4. **重新调用脚本**,后续调用自动复用配置

### 配置文件格式

路径:`~/.pms-okr-cli-prd/config.json`(Windows: `%USERPROFILE%\.pms-okr-cli-prd\config.json`)

**CAS 模式**（身份认证 key）：
```json
{
  "baseUrl": "https://comark.stfile.com",
  "authMode": "cas",
  "casToken": "cli-setup.md 中提供的身份认证 key"
}
```

> casToken 字段填写 cli-setup.md 安装说明中给出的身份认证 key，脚本会用它自动完成 CAS 登录换取 JWT。

**⚠️ 生产环境注意事项**:
- 本 Skill 指向**生产环境**,所有写操作直接影响真实业务数据
- 没有默认测试账号,必须向用户索要真实凭据
- 执行写操作前务必向用户确认

**安全建议**:
- 文件权限:`chmod 600 ~/.pms-okr-cli-prd/config.json`
- `casToken` 可选填：不填则每次需要通过环境变量 `PMS_CAS_TOKEN` 传入身份认证 key（适合不想在磁盘持久化 key 的场景）
- 不存 key 时，JWT 过期自动重登会失败（需要重新提供身份认证 key），建议 key 存储在配置文件中（权限600足够安全）

### 手动配置(不用Agent)

```bash
mkdir -p ~/.pms-okr-cli-prd
cat > ~/.pms-okr-cli-prd/config.json <<'EOF'
{
  "baseUrl": "https://comark.stfile.com",
  "authMode": "cas",
  "casToken": "YOUR_CAS_TOKEN"
}
EOF
chmod 600 ~/.pms-okr-cli-prd/config.json
```

### 临时使用(不保存)

```bash
export PMS_BASE_URL=https://comark.stfile.com
export PMS_CAS_TOKEN='cli-setup.md 中提供的身份认证 key'
./scripts/call.sh GET /api/v1/okr/plan-details
```

---

## 2. CAS统一认证登录(脚本内部调用)

**POST** `/api/v1/auth/cas/login`

后端自动完成 CAS 对接:查集成配置表 → 调 DC 换 AccessToken → 调 ML_CAS 换用户信息 → 解析工号 → 签发 PMS JWT。

### 请求体(JSON)

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| token | String | ✅ | cli-setup.md 中提供的身份认证 key（CAS Token） |

### 成功响应 data 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| token | String | JWT Token,后续请求放入 Authorization Header |
| expireTime | String | Token过期时间(签发后24小时) |
| employee | Object | 员工基本信息(EmployeeVO) |

### 错误码

| code | 触发场景 |
|------|----------|
| 40113 | CAS Token 无效或已过期 |
| 40114 | CAS账号未绑定系统员工 |
| 40102 | 员工已离职 |
| 40111 | 账号已锁定 |
| 40112 | 账号已禁用 |
| 50101 | CAS未配置或AccessToken获取失败 |
| 50102 | 获取用户信息失败 |
| 40001 | 请求参数错误(token为空) |

---

## 3. Token 使用方式

所有业务接口 HTTP Header 携带:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 4. 验证 Token 有效性

**GET** `/api/v1/auth/me`

必须携带 Bearer Token。返回 `code=20000` 表示Token有效。脚本每次启动会调用此接口探活缓存token。

响应 data 包含:id、employeeCode、employeeName、status、deptId、deptName、managerId、managerName、hrbpId、hrbpName、positionName、email、phone、entryDate、deptLevels。

---

## 5. 退出登录

脚本不封装登出接口(Token 24h 后自动失效,切换账号直接删除缓存即可):

```bash
# macOS/Linux(路径一般是 $TMPDIR 下,兼容老缓存)
rm -f "${TMPDIR:-/tmp}/pms-token-prd.json"
rm -f /tmp/pms-token-prd /tmp/pms-token-prd.mode /tmp/pms-token-prd.user

# Windows PowerShell
Remove-Item "$env:TEMP\pms-token-prd.json" -ErrorAction SilentlyContinue
```

如需切换账号,同时修改或删除 `~/.pms-okr-cli-prd/config.json` 后再次调用即可。

后端 `POST /api/v1/auth/logout` 接口存在(可手动 curl 调用使 Redis 中的token立即失效),但脚本不主动调用。

---

## 6. Token 过期处理

Token 过期/无效时接口返回:
```json
{"code":40101,"message":"未登录/Token 过期","data":null}
```

脚本在每次调用前会:
1. 读 `<系统临时目录>/pms-token-prd.json` 缓存(JSON 格式 `{mode,user,token}`,兼容老的纯文本格式)
2. 调 `/api/v1/auth/me` 探活
3. 失效自动用配置文件/环境变量中的 CAS Token 重新登录
4. 如果凭据也没有,打印错误提示退出,由 Agent/用户完成配置

**用户不需要手动处理过期**,只要配置文件存在且 CAS Token 正确,脚本全程自动续期。

---

## 7. 环境变量清单

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `PMS_BASE_URL` | PMS 服务地址 | 配置文件 baseUrl,或 `https://comark.stfile.com` |
| `PMS_CAS_TOKEN` | CAS Token | 配置文件 casToken |
| `PMS_CONFIG_DIR` | 配置目录 | `~/.pms-okr-cli-prd` |
| `PMS_TOKEN_CACHE` | Token缓存文件路径(JSON格式 `{mode,user,token}`) | macOS/Linux `${TMPDIR:-/tmp}/pms-token-prd.json`,Windows `%TEMP%\pms-token-prd.json`;四个脚本共享同一份缓存 |


## 8. 环境地址

| 环境 | 地址 | 账号 |
|------|------|------|
| 生产环境 | `https://comark.stfile.com` | 使用员工本人真实 CAS Token |
| 本机开发 | `http://localhost:8080` | 由本地数据库决定 |
