# PMS OKR CLI - PowerShell 版本（Windows 原生支持）- 生产环境
# 用法:
#   .\call.ps1 METHOD PATH [BODY_JSON] [TOKEN]
#
# 环境变量:
#   $env:PMS_BASE_URL    服务地址（默认 https://comark.stfile.com）
#   $env:PMS_CONFIG_DIR  配置目录（默认 ~/.pms-okr-cli-prd）
#   $env:PMS_TOKEN_CACHE Token缓存文件
#   $env:PMS_CAS_TOKEN   CAS Token


param(
    [Parameter(Position=0)] [string]$Method,
    [Parameter(Position=1)] [string]$PathArg,
    [Parameter(Position=2)] [string]$Body = "",
    [Parameter(Position=3)] [string]$TokenArg = ""
)

$ErrorActionPreference = "Stop"

# ========== 常量 ==========
$script:SkillId = "pms-okr-cli-prd"
$script:SkillVersion = "1.0.0"
$script:DefaultBaseUrl = "https://comark.stfile.com"


# ========== 路径 ==========
$HomeDir = [Environment]::GetFolderPath("UserProfile")
$ConfigDir = if ($env:PMS_CONFIG_DIR) { $env:PMS_CONFIG_DIR } else { Join-Path $HomeDir ".pms-okr-cli-prd" }
$ConfigFile = Join-Path $ConfigDir "config.json"
# 统一 token 缓存路径（与 call.js 对齐）：跨平台使用 TEMP 目录下的 JSON 文件，格式 {mode,user,token}
$DefaultTokenCache = Join-Path ([System.IO.Path]::GetTempPath()) "pms-token-prd.json"
$TokenCache = if ($env:PMS_TOKEN_CACHE) { $env:PMS_TOKEN_CACHE } else { $DefaultTokenCache }



# ========== 工具函数 ==========
function Write-Color($Text, [ConsoleColor]$Color = [ConsoleColor]::Gray) {
    if ([Console]::IsErrorRedirected -eq $false -and [Environment]::UserInteractive) {
        $old = [Console]::ForegroundColor
        [Console]::ForegroundColor = $Color
        Write-Host $Text
        [Console]::ForegroundColor = $old
    } else {
        Write-Host $Text
    }
}

function Load-Config {
    if (Test-Path $ConfigFile) {
        try { return (Get-Content $ConfigFile -Raw | ConvertFrom-Json -ErrorAction Stop) } catch {
            Write-Color "[config] 配置文件读取失败: $_" Yellow
        }
    }
    return [pscustomobject]@{}
}

$cfg = Load-Config


$BaseUrl = if ($env:PMS_BASE_URL) { $env:PMS_BASE_URL } elseif ($cfg.baseUrl) { $cfg.baseUrl } else { $script:DefaultBaseUrl }

function JGet($JsonStr, $Key) {
    if ([string]::IsNullOrWhiteSpace($JsonStr)) { return "" }
    try {
        $obj = $JsonStr | ConvertFrom-Json -ErrorAction Stop
        $cur = $obj
        foreach ($k in $Key.Split('.')) {
            if ($null -eq $cur) { return "" }
            if ($cur -is [array]) { $cur = $cur[[int]$k] }
            else { $cur = $cur.$k }
        }
        if ($null -eq $cur) { return "" }
        return "$cur"
    } catch { return "" }
}

function Http-Request($Method, $Url, $BodyText = "", $Headers = @{}, $TimeoutSec = 30) {
    $h = @{
        "Content-Type" = "application/json"
        "X-Client-Type" = "SKILL"
        "X-Skill-Id" = $script:SkillId
        "X-Skill-Version" = $script:SkillVersion
    }
    foreach ($k in $Headers.Keys) { $h[$k] = $Headers[$k] }
    try {
        $respText = $null
        $statusCode = 200
        if ($Method -eq "GET" -or [string]::IsNullOrEmpty($BodyText)) {
            $resp = Invoke-WebRequest -Method $Method -Uri $Url -Headers $h -TimeoutSec $TimeoutSec -ErrorAction Stop
            $respText = $resp.Content
            $statusCode = [int]$resp.StatusCode
        } else {
            $resp = Invoke-WebRequest -Method $Method -Uri $Url -Headers $h -Body $BodyText -TimeoutSec $TimeoutSec -ErrorAction Stop
            $respText = $resp.Content
            $statusCode = [int]$resp.StatusCode
        }
        # 返回原始响应文本 + httpStatus（内部使用，输出前剥离）
        $resultObj = [pscustomobject]@{
            __rawText = $respText
            httpStatus = $statusCode
        }
        return ($resultObj | ConvertTo-Json -Depth 10 -Compress)
    } catch {
        $errResp = $_.Exception.Response
        if ($null -ne $errResp) {
            $stream = $errResp.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $text = $reader.ReadToEnd()
            $reader.Close()
            $statusCode = [int]$errResp.StatusCode
            $resultObj = [pscustomobject]@{
                __rawText = $text
                httpStatus = $statusCode
            }
            return ($resultObj | ConvertTo-Json -Depth 10 -Compress)
        }
        return ([pscustomobject]@{__rawText=''; httpStatus=0; code="NETWORK_ERROR"; message=$_.Exception.Message} | ConvertTo-Json -Compress)
    }
}

# ========== Token 缓存 ==========
function Load-Cache {
    if (Test-Path $TokenCache) {
        try { return (Get-Content $TokenCache -Raw | ConvertFrom-Json -ErrorAction Stop) } catch {}
    }
    return $null
}
function Save-Cache($Data) {
    $json = $Data | ConvertTo-Json -Compress
    $json | Out-File -FilePath $TokenCache -Encoding UTF8 -NoNewline
    try {
        if ($IsWindows -or (-not (Get-Variable -Name IsMacOS -ErrorAction SilentlyContinue)) -or $IsMacOS -or $IsLinux) {
            chmod 600 $TokenCache 2>$null
        }
    } catch {}
}

# ========== 登录 ==========
function Login-Cas($CasToken = "") {
    if ([string]::IsNullOrEmpty($CasToken)) {
        if ($env:PMS_CAS_TOKEN) { $CasToken = $env:PMS_CAS_TOKEN }
        elseif ($cfg.casToken) { $CasToken = $cfg.casToken }
    }
    if ([string]::IsNullOrEmpty($CasToken)) {
        Write-Color "未提供CAS Token。请设置 `$env:PMS_CAS_TOKEN 或配置 $ConfigFile" Red; exit 1
    }

    Write-Color "[auth] CAS统一认证登录中..." Yellow
    $body = (@{token=$CasToken} | ConvertTo-Json -Compress)
    $respText = Http-Request "POST" "$BaseUrl/api/v1/auth/cas/login" $body
    $code = JGet $respText "code"
    if ($code -ne "20000") { Write-Color "CAS登录失败: $respText" Red; exit 1 }
    $t = JGet $respText "data.token"
    $ec = JGet $respText "data.employee.employeeCode"
    if ([string]::IsNullOrEmpty($t)) { Write-Color "登录响应无token" Red; exit 1 }
    Save-Cache ([pscustomobject]@{mode="cas"; user=$ec; token=$t})
    Write-Color "[auth] CAS登录成功" Green
    return $t
}

function Get-Token {
    if (-not [string]::IsNullOrEmpty($TokenArg)) { return $TokenArg }
    $cached = Load-Cache
    if ($cached -and $cached.token) {
        try {
            $chkText = Http-Request "GET" "$BaseUrl/api/v1/auth/me" "" @{ "Authorization" = "Bearer $($cached.token)" } 10
            $chkCode = JGet $chkText "code"
            if ($chkCode -eq "20000") { return $cached.token }
        } catch {}
        Write-Color "[auth] 缓存token已失效，重新登录..." Yellow
    } else {
        Write-Color "[auth] 未找到缓存token，开始登录..." Yellow
    }
    return (Login-Cas)
}

# ========== 从 JWT 解出工号/用户ID/姓名 ==========
function Decode-JwtClaims($Token) {
    $result = [pscustomobject]@{ employeeCode=""; userId=""; userName="" }
    try {
        $parts = $Token.Split('.')
        if ($parts.Length -lt 2) { return $result }
        $payload = $parts[1].Replace('-', '+').Replace('_', '/')
        while ($payload.Length % 4) { $payload += "=" }
        $json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))
        $claims = $json | ConvertFrom-Json
        if ($claims.employeeCode) { $result.employeeCode = [string]$claims.employeeCode }
        if ($claims.employeeId) { $result.userId = [string]$claims.employeeId }
        elseif ($claims.userId) { $result.userId = [string]$claims.userId }
        elseif ($claims.uid) { $result.userId = [string]$claims.uid }
        if ($claims.employeeName) { $result.userName = [string]$claims.employeeName }
        elseif ($claims.userName) { $result.userName = [string]$claims.userName }
        elseif ($claims.name) { $result.userName = [string]$claims.name }
    } catch {}
    return $result
}

# 生成32位无横线UUID（v4）

# ========== 脱敏 ==========







# ========== 参数校验 ==========
if ([string]::IsNullOrEmpty($Method) -or [string]::IsNullOrEmpty($PathArg)) {
    Write-Host @"
用法: $($MyInvocation.MyCommand.Name) METHOD PATH [BODY_JSON]
  METHOD     HTTP方法: GET/POST/PUT/DELETE
  PATH       API路径
  BODY_JSON  请求体JSON（POST/PUT时）
"@
    exit 1
}
$Method = $Method.ToUpper()
if ($Method -notin @("GET","POST","PUT","DELETE")) { Write-Color "不支持的HTTP方法 $Method" Red; exit 1 }

$StartTime = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$StartIso = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
$Token = Get-Token
$Jwt = Decode-JwtClaims $Token
$EmpCode = if ($Jwt.employeeCode) { $Jwt.employeeCode } else { "unknown" }
$UserId = if ($Jwt.userId) { $Jwt.userId } else { $EmpCode }
$UserName = if ($Jwt.userName) { $Jwt.userName } else { $EmpCode }

Write-Color "[$Method] $BaseUrl$PathArg" Cyan
if (-not [string]::IsNullOrEmpty($Body)) {
    # 打印 Body 时脱敏敏感字段（密码/token）
    $safePrintBody = $Body
    try {
        $pObj = $Body | ConvertFrom-Json -ErrorAction Stop
        foreach ($k in @('password','casToken','token','oldPassword','newPassword','accessToken','refreshToken','authorization')) {
            if ($pObj.PSObject.Properties[$k]) { $pObj.$k = '***' }
        }
        $safePrintBody = $pObj | ConvertTo-Json -Compress -Depth 10
    } catch {
        if ($Body.Length -gt 500) { $safePrintBody = $Body.Substring(0, 500) }
    }
    Write-Color "Body: $safePrintBody" Cyan
}

$headers = @{ "Authorization" = "Bearer $Token" }
$CurlExit = 0
$httpStatus = 0
$rawBodyText = ""
$respText = ""
try {
    $bodyArg = if ([string]::IsNullOrEmpty($Body) -or $Method -in @("GET","DELETE")) { "" } else { $Body }
    $innerResp = Http-Request $Method "$BaseUrl$PathArg" $bodyArg $headers 60 | ConvertFrom-Json
    $httpStatus = [int]$innerResp.httpStatus
    $rawBodyText = [string]$innerResp.__rawText
    # 尝试把原始响应当JSON解析用于code/message提取
    try {
        $null = $rawBodyText | ConvertFrom-Json -ErrorAction Stop
        $respText = $rawBodyText
    } catch {
        # 非JSON响应，构造包装
        $respText = (@{code=([int]$httpStatus); message=$rawBodyText} | ConvertTo-Json -Compress)
    }
} catch {
    $CurlExit = 1
    $respText = (@{code="SCRIPT_ERROR"; message=$_.Exception.Message} | ConvertTo-Json -Compress)
}

$EndTime = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$Duration = [int]($EndTime - $StartTime)
$Code = JGet $respText "code"
$Message = JGet $respText "message"

if ($Code -eq "20000") { Write-Color "[20000] success ($($Duration)ms)" Green }
else { Write-Color "[$Code] 请求失败 ($($Duration)ms)" Red }

# 输出原始服务端响应，不附加内部字段
if (-not [string]::IsNullOrEmpty($rawBodyText)) {
    try { $rawBodyText | ConvertFrom-Json | ConvertTo-Json -Depth 10 } catch { Write-Output $rawBodyText }
} else {
    try { $respText | ConvertFrom-Json | ConvertTo-Json -Depth 10 } catch { Write-Output $respText }
}

# 登录/授权/Token 校验类接口不上报日志（避免密码/token 走日志链路）
if ($PathArg -match '^/api/v\d+/auth/' -or $PathArg -match '^/auth/') {
    if ($Code -ne "20000") { exit 1 }
    exit 0
}

if ($Code -ne "20000") { exit 1 }
exit 0
