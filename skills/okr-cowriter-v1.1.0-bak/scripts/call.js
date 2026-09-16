#!/usr/bin/env node
/**
 * PMS OKR CLI - Node.js 版（跨平台 macOS/Linux/Windows）- 生产环境
 *
 * 用法:
 *   node call.js <METHOD> <PATH> [BODY_JSON]
 *   node call.js GET /api/v1/okr/plan-details
 *   node call.js POST /api/v1/okr/5001/objectives '{"description":"Q3目标","keyResults":[]}'
 *
 * 认证优先级：环境变量 > 配置文件(~/.pms-okr-cli-prd/config.json) > 默认值
 *
 * 环境变量:
 *   PMS_BASE_URL     服务地址，默认 https://comark.stfile.com
 *   PMS_TOKEN_CACHE  Token缓存文件，默认 <tmpdir>/pms-token-prd.json
 *   PMS_CONFIG_DIR   配置目录，默认 ~/.pms-okr-cli-prd
 *   PMS_CAS_TOKEN    CAS Token

 *
 * stdout: JSON响应体；stderr: 日志；exit 0=成功, 1=失败
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const https = require('https');

// ========== 常量 ==========
const SKILL_ID = 'pms-okr-cli-prd';
const SKILL_VERSION = '1.0.0';
const HOME = os.homedir();
const CONFIG_DIR = process.env.PMS_CONFIG_DIR || path.join(HOME, '.pms-okr-cli-prd');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TOKEN_CACHE = process.env.PMS_TOKEN_CACHE || path.join(os.tmpdir(), 'pms-token-prd.json');
const DEFAULT_BASE_URL = 'https://comark.stfile.com';
// 外部日志上报已移至服务端 OperationLogAspect + ExternalLogReportService

// ========== 日志（stderr） ==========
const isTTY = !!(process.stderr.isTTY);
const c = (code, s) => isTTY ? `\x1b[${code}m${s}\x1b[0m` : s;
const log     = (...a) => console.error(c('36', a.join(' ')));
const logOk   = (...a) => console.error(c('32', a.join(' ')));
const logWarn = (...a) => console.error(c('33', a.join(' ')));
const logErr  = (...a) => console.error(c('31', a.join(' ')));
const die = (msg) => { logErr('错误：' + msg); process.exit(1); };

// ========== 配置 ==========
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {
    logWarn(`[config] 配置文件读取失败: ${e.message}`);
  }
  return {};
}
const cfg = loadConfig();
const BASE_URL = process.env.PMS_BASE_URL || cfg.baseUrl || DEFAULT_BASE_URL;


// ========== HTTP ==========
function request(method, reqPath, body, headers = {}, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath.startsWith('http') ? reqPath : BASE_URL + reqPath);
    const lib = url.protocol === 'https:' ? https : http;
    const h = {
      'Content-Type': 'application/json',
      'X-Client-Type': 'SKILL',
      'X-Skill-Id': SKILL_ID,
      'X-Skill-Version': SKILL_VERSION,
      ...headers,
    };
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    if (data) h['Content-Length'] = Buffer.byteLength(data);
    const req = lib.request(url, { method, headers: h, timeout: timeoutMs }, res => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsed;
        try { parsed = JSON.parse(text); } catch { parsed = { _raw: text, code: res.statusCode === 200 ? 20000 : res.statusCode }; }
        parsed.httpStatus = res.statusCode;
        resolve(parsed);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('请求超时')); });
    if (data) req.write(data);
    req.end();
  });
}

// ========== Token 缓存 ==========
function loadCache() {
  try {
    if (fs.existsSync(TOKEN_CACHE)) return JSON.parse(fs.readFileSync(TOKEN_CACHE, 'utf8'));
  } catch {}
  return null;
}
function saveCache(data) {
  try { fs.writeFileSync(TOKEN_CACHE, JSON.stringify(data), { mode: 0o600 }); } catch {}
}

// ========== 登录 ==========
async function loginCas(casToken) {
  casToken = casToken || process.env.PMS_CAS_TOKEN || cfg.casToken;
  if (!casToken) die(`未提供 CAS Token。请设置 PMS_CAS_TOKEN 环境变量，或在 ${CONFIG_FILE} 中配置 casToken 字段。`);

  logWarn('[auth] CAS统一认证登录中...');
  const resp = await request('POST', '/api/v1/auth/cas/login', { token: casToken });
  if (resp.code !== 20000) { logErr(`CAS登录失败: ${JSON.stringify(resp)}`); process.exit(1); }
  const t = resp.data && resp.data.token;
  const ec = resp.data && resp.data.employee && resp.data.employee.employeeCode;
  if (!t) { logErr(`登录响应无token: ${JSON.stringify(resp)}`); process.exit(1); }
  saveCache({ mode: 'cas', user: ec || '', token: t });
  logOk('[auth] 登录成功（CAS统一认证），token已缓存');
  return t;
}

function printConfigHelp() {
  console.error(c('31', `
未配置认证方式。
1. 环境变量 PMS_CAS_TOKEN=<CAS Token>
2. 配置文件 ${CONFIG_FILE}，示例：{"baseUrl":"${DEFAULT_BASE_URL}","authMode":"cas","casToken":"***"}
3. 直接告诉 AI agent 你的 CAS Token，agent 会帮你写入配置。
`));
}

async function getToken(cmdToken) {
  if (cmdToken) return cmdToken;
  const cached = loadCache();
  if (cached && cached.token) {
    try {
      const me = await request('GET', '/api/v1/auth/me', null, { 'Authorization': `Bearer ${cached.token}` }, 10000);
      if (me.code === 20000) return cached.token;
      logWarn('[auth] 缓存token已失效，重新登录...');
    } catch { logWarn('[auth] 缓存token失效，重新登录...'); }
  } else {
    logWarn('[auth] 未找到缓存token，开始登录...');
  }
  return loginCas();
}

// ========== 从 JWT 解出工号/用户ID/姓名 ==========
function decodeJwtClaims(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return {};
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    const claims = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return {
      employeeCode: claims.employeeCode || '',
      userId: String(claims.employeeId ?? claims.userId ?? claims.uid ?? ''),
      userName: claims.employeeName || claims.userName || claims.name || '',
    };
  } catch { return {}; }
}

// ========== 脱敏 ==========
const SENS_KEYS = ['password','casToken','token','oldPassword','newPassword','accessToken','refreshToken','authorization'];


const MODULE_NAME_MAP = {
  'okr': 'OKR管理',
  'okr-plans': 'OKR计划管理',
  'auth': '认证授权',
  'admin': '系统管理',
  'employees': '员工管理',
  'departments': '部门管理',
  'periods': '周期管理',
  'reviews': '考核管理',
  'reports': '报表中心',
};

// ========== 主流程 ==========
async function main() {
  const [method, pathArg, bodyArg, cmdToken] = process.argv.slice(2);
  if (!method || !pathArg) {
    console.log(`用法: node call.js <METHOD> <PATH> [BODY_JSON]

  METHOD     HTTP方法: GET/POST/PUT/DELETE
  PATH       API路径
  BODY_JSON  请求体JSON（POST/PUT时）

示例:
  node call.js GET /api/v1/okr/plan-details
  node call.js POST /api/v1/okr/5001/objectives '{"description":"Q3目标","keyResults":[]}'
`);
    process.exit(1);
  }

  const m = method.toUpperCase();
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(m)) die(`不支持的HTTP方法: ${m}`);

  const startTime = Date.now();
  const startIso = new Date().toISOString();
  const token = await getToken(cmdToken);
  const jwtClaims = decodeJwtClaims(token);
  const empCode = jwtClaims.employeeCode || 'unknown';
  const userId = jwtClaims.userId || empCode;
  const userName = jwtClaims.userName || empCode;

  log(`[${m}] ${BASE_URL}${pathArg}`);
  if (bodyArg) {
    // 打印 Body 时脱敏敏感字段（密码/token）
    try {
      const d = JSON.parse(bodyArg);
      for (const k of SENS_KEYS) { if (k in d) d[k] = '***'; }
      log(`Body: ${JSON.stringify(d)}`);
    } catch {
      log(`Body: ${String(bodyArg).substring(0, 500)}`);
    }
  }

  let resp;
  let curlExit = 0;
  let httpStatus = 0;
  try {
    resp = await request(m, pathArg, ['GET', 'DELETE'].includes(m) ? null : bodyArg, {
      'Authorization': `Bearer ${token}`
    }, 60000);
    httpStatus = resp.httpStatus || 0;
  } catch (e) {
    logErr(`[网络错误] ${e.message}`);
    curlExit = 1;
    resp = { code: 'NETWORK_ERROR', message: e.message, httpStatus: 0 };
  }

  const duration = Date.now() - startTime;
  const success = resp.code === 20000;

  if (resp.code === 20000) logOk(`[20000] success (${duration}ms)`);
  else logErr(`[${resp.code}] 请求失败 (${duration}ms)`);

  // 输出原始服务端响应，不附加内部使用的 httpStatus 字段
  if (resp._raw) {
    process.stdout.write(resp._raw);
  } else {
    const out = Object.assign({}, resp);
    delete out.httpStatus;
    delete out._raw;
    process.stdout.write(JSON.stringify(out, null, 2));
  }
  process.stdout.write('\n');

  // 登录/授权/Token 校验类接口不上报日志（避免密码/token 走日志链路）
  // 严格前缀匹配，避免误伤含 'auth' 字样的其他业务路径
  if (/^\/(api\/v\d+\/)?auth\//.test(pathArg)) {
    process.exit(success ? 0 : 1);
  }

  process.exit(success ? 0 : 1);
}

main().catch(e => { logErr(`异常: ${e.message}`); console.error(e.stack); process.exit(1); });
