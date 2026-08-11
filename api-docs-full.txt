=== 完整API文档 ===
首页接口 API
Monitor API

首页

接口 API

AdMonitor API
TV Monitor API
秒针多维查询 API 使用指南
目录
1. 快速开始
2. 认证鉴权
3. 接口总览
4. 创建任务
5. 查询任务状态
6. 下载报表
7. 查询任务详情
8. 常见错误码
9. 数据字典查询（如何获取活动/地域/点位ID）
10. 编码对照表
11. 限流说明
12. 使用建议
秒针多维查询 API 使用指南

本文档面向业务用户，介绍如何通过 API 创建、查询、下载 AdMonitor / TvMonitor 多维数据报表。

目录
快速开始
认证鉴权
接口总览
创建任务
TvMonitor 创建任务
AdMonitor 固定模版创建任务
AdMonitor 自定义模版创建任务
查询任务状态
下载报表
查询任务详情
常见错误码
数据字典查询
编码对照表
限流说明
使用建议
1. 快速开始

Base URL（生产环境）：https://intra-api.miaozhen.com

所有接口路径以 /api/v1 开头，需在请求头携带 JWT Token：

# 1. 获取 access_token（见第2节）
# 2. 创建任务（以 TvMonitor 为例）
curl -X POST 'https://intra-api.miaozhen.com/api/v1/tvmonitor/query/task/create' \
  -H 'Authorization: Bearer <your_access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "taskName": "7月TV曝光监测",
    "dataRange": {
      "campaign": [{ "campaignId": 10001, "startDate": "2026-07-01", "endDate": "2026-07-28" }]
    },
    "total": ["42", "44"],
    "dimension": ["1"],
    "filtrationType": ["net"],
    "regions": "0000000000",
    "sheetBy": "0"
  }'

# 返回 {"code":0,"message":"OK","data":{"taskId":12345}}

# 3. 轮询状态
curl 'https://intra-api.miaozhen.com/api/v1/tvmonitor/query/task/status?ids=12345' \
  -H 'Authorization: Bearer <your_access_token>'

# 4. 下载（status=2 时可下载）
curl 'https://intra-api.miaozhen.com/api/v1/tvmonitor/query/task/download?id=12345' \
  -H 'Authorization: Bearer <your_access_token>' \
  -OJ
Copy to clipboard
Error
Copied
2. 认证鉴权

所有接口需在请求头携带 JWT Token：

Authorization: Bearer <access_token>
Copy to clipboard
Error
Copied
获取 access_token

通过秒针 Passport 服务兑换用户令牌：

curl -X POST 'https://api.cn.miaozhen.com/passport/token' \
  -F 'grant_type=password' \
  -F 'client_id=<your_client_id>' \
  -F 'client_secret=<your_client_secret>' \
  -F 'username=<your_username>' \
  -F 'password=<your_password>'
Copy to clipboard
Error
Copied

请求参数：

参数	类型	必填	说明
grant_type	string	是	固定值 password
client_id	string	是	API账号用户名
client_secret	string	是	API账号密码
username	string	是	用户名
password	string	是	密码

返回结果中 data.access_token 即为所需令牌，有效期 1 小时。令牌过期后可用 refresh_token 刷新（grant_type=refresh_token，参数传 refresh_token=<your_refresh_token>）。

注意事项：

建议缓存令牌，在有效期内复用，避免频繁兑换
令牌过期前 5 分钟主动刷新
令牌无效/过期时接口返回 401
3. 接口总览
接口	方法	说明
/tvmonitor/query/task/create	POST	TvMonitor 创建多维查询任务
/admonitor/query/task/create	POST	AdMonitor 创建固定模版查询任务
/admonitor/query/task/custom/create	POST	AdMonitor 创建自定义模版任务（多维钻取）
/tvmonitor/query/task/status	GET	TvMonitor 批量查询任务状态
/admonitor/query/task/status	GET	AdMonitor 批量查询任务状态
/tvmonitor/query/task/download	GET	TvMonitor 下载任务报表
/admonitor/query/task/download	GET	AdMonitor 下载任务报表
/tvmonitor/query/task/detail	GET	TvMonitor 查询任务详情
/admonitor/query/task/detail	GET	AdMonitor 查询任务详情

统一响应格式（除下载接口外）：

{
  "code": 0,
  "message": "OK",
  "data": { ... }
}
Copy to clipboard
Error
Copied

code=0 表示成功，非 0 表示失败（见第8节错误码）。下载接口成功时直接返回 xlsx 二进制流。

4. 创建任务
4.1 TvMonitor 创建任务

POST /api/v1/tvmonitor/query/task/create

请求体参数：

参数	类型	必填	说明
taskName	string	是	任务名称，最长130字符，不含 % 和 &
dataRange	object	是	数据范围，含 campaign/website/spots 三个数组
total	string[]	否	总览场景指标ID列表，上限50个
accumulate	string[]	否	累计场景指标ID列表，上限50个
byday	string[]	否	按天场景指标ID列表，上限50个
dimension	string[]	是	维度ID列表，至少1个，上限20个，取值 {1,2,3,4,5}（无6/7）
filtrationType	string[]	是	过滤方式，取值 {"net","totalnet"}（net=净投放, totalnet=总净投放）
regions	string	是	逗号分隔的10位区域ID，"0000000000"表示全国，上限1000个
sheetBy	string	是	Sheet拆分："0"按活动、"1"按区域、"2"单Sheet
regionOrient	boolean	否	是否按地域定向，默认false，true时regions可省略

N+/ReachN 参数（选了指标56/57时需传）：

N+（指标56）：曝光频次 ≥ N 次的UV（即"N次及以上"，简称N+ Reach），用 base/cap 指定频次区间的下限和上限
ReachN（指标57）：曝光频次 = N 次的UV（即"恰好N次"），用 base/cap 指定频次区间

每个选中的场景（总览/累计/按天）需独立传一对 base/cap：

你在哪个场景选了56/57	N+(56) 的 base/cap 字段	ReachN(57) 的 base/cap 字段
total（总览）	NPlus / NPlus1	reachN / reachN1
accumulate（累计）	NPlus2 / NPlus3	reachN2 / reachN3
byday（按天）	NPlus4 / NPlus5	reachN4 / reachN5
值域：TVM 的 N+ ∈ [1,20]，ReachN ∈ [1,19]，且 cap ≥ base
不传时默认 base=1, cap=上限最大值（即1+全部）

dataRange 对象结构：

字段	类型	必填	说明
campaign	array	是（必须非空）	活动列表
website	array	否	网站（媒体）列表，与spots互斥
spots	array	否	广告位列表，与website互斥

Campaign 元素：

字段	类型	必填	说明
campaignId	int	是	活动ID
target	int[]	否	目标受众ID列表，不传=全部人群
startDate	string	是	开始日期 yyyy-MM-dd，不晚于昨天
endDate	string	是	结束日期 yyyy-MM-dd，不晚于昨天且≥startDate

Website 元素：

字段	类型	必填	说明
caid	int	是	活动ID（同dataRange.campaign[].campaignId）
pubid	int	是	网站（媒体）ID
startDate	string	是	开始日期
endDate	string	是	结束日期

Spot 元素：

字段	类型	必填	说明
caid	int	是	活动ID（同dataRange.campaign[].campaignId）
spid	int	是	广告位ID
startDate	string	是	开始日期
endDate	string	是	结束日期

重要规则：

campaign 数组必须至少包含1个活动
website 和 spots 不能同时传非空数组
所有日期不能晚于昨天（监测数据 T+1 可用）
日期必须落在活动有效期内
campaign+website+spots 条目总数上限600

请求示例：

{
  "taskName": "7月TV曝光监测",
  "dataRange": {
    "campaign": [
      { "campaignId": 10001, "startDate": "2026-07-01", "endDate": "2026-07-28" }
    ]
  },
  "total": ["42", "44"],
  "dimension": ["1", "2"],
  "filtrationType": ["net"],
  "regions": "0000000000",
  "sheetBy": "0"
}
Copy to clipboard
Error
Copied

响应示例：

{ "code": 0, "message": "OK", "data": { "taskId": 12345 } }
Copy to clipboard
Error
Copied
4.2 AdMonitor 固定模版创建任务

POST /api/v1/admonitor/query/task/create

请求体参数：

参数	类型	必填	说明
taskName	string	是	任务名称，最长130字符，不含%和&
dataRange	object	是	数据范围（结构同TvMonitor，见4.1）
source	string	是	数据来源，分号分隔，如 "pc;mb"（pc=PC端, mb=移动端, pm=PMP/OTV, d=移动端明细）
total	string[]	条件必填	总览指标ID列表
accumulate	string[]	条件必填	累计指标ID列表
byday	string[]	条件必填	按天指标ID列表（三者至少一个非空）
dimension	string[]	是	维度ID列表，至少1个，取值 {1,2,3,4,5,6,7}（注意：AdMonitor有6）
filtrationType	string[]	否	过滤方式，取值 {"0","1"}（0=净投放, 1=总净投放，需权限）
regions	string	条件必填	逗号分隔的24位区域ID，"000000000000000000000000"表示全国；regionOrient=false时必填
sheetBy	string	否	Sheet拆分："0"按活动（默认）、"1"按区域
regionOrient	boolean	否	按地域定向，默认false

N+/ReachN 参数（选了指标56/57/96-99时需传）：

N+（指标56）：曝光频次 ≥ N 次的UV（"N次及以上"）
ReachN（指标57）：曝光频次 = N 次的UV（"恰好N次"）

每个场景各传一对 base（频次下限）和 cap（频次上限）。ADM比TVM多可见/不可见两组：

场景	N+字段(base/cap)	ReachN字段(base/cap)	说明
total（总览）	NPlus / NPlus1	reachN / reachN1	全部曝光
accumulate（累计）	NPlus2 / NPlus3	reachN2 / reachN3	累计曝光
byday（按天）	NPlus4 / NPlus5	reachN4 / reachN5	按天曝光
可见总览	vNPlus / vNPlus1	vReachN / vReachN1	需可见度权限
可见累计	vNPlus2 / vNPlus3	vReachN2 / vReachN3	需可见度权限
可见按天	vNPlus4 / vNPlus5	vReachN4 / vReachN5	需可见度权限
不可见总览	nvNPlus / nvNPlus1	nvReachN / nvReachN1	需可见度权限
不可见累计	nvNPlus2 / nvNPlus3	nvReachN2 / nvReachN3	需可见度权限
不可见按天	nvNPlus4 / nvNPlus5	nvReachN4 / nvReachN5	需可见度权限
ADM N+（56）值域 [1,80]，ReachN（57）值域 [1,79]；可见/不可见N+ [1,20]，ReachN [1,19]
cap ≥ base，不传默认base=1, cap=最大值

重要规则：

AdMonitor 地域码是 24位（不是TVM的10位）
filtrationType 是 **{"0","1"}**（不是TVM的{"net","totalnet"}）
dimension 允许 6（Minisite），TVM不允许
source 是分号分隔字符串（如 "pc;mb"），不是数组
关键词类指标13必须配合 dataRange.spots 使用
移动端指标9-12/14不能与spots同时使用
日期跨度不超过3个月
total字段硬上限50个指标

请求示例：

{
  "taskName": "7月AdMonitor曝光监测",
  "source": "pc;mb",
  "dataRange": {
    "campaign": [
      { "campaignId": 2505879, "startDate": "2026-07-01", "endDate": "2026-07-28" }
    ]
  },
  "total": ["43", "44", "45"],
  "dimension": ["1", "2"],
  "filtrationType": ["0"],
  "regions": "000000000000000000000000",
  "sheetBy": "0"
}
Copy to clipboard
Error
Copied
4.3 AdMonitor 自定义模版创建任务（多维钻取）

POST /api/v1/admonitor/query/task/custom/create

自定义模版支持灵活配置多个Sheet、多个表格、不同场景/平台/维度的组合，适用于多维钻取场景。

限流提示：自定义模版创建限流为 10次/分钟，请注意控制请求频率。

请求体结构：

{
  "taskName": "自定义任务名称",
  "dataRange": {
    "campaign": [
      { "campaignId": 2505879, "startDate": "2026-07-01", "endDate": "2026-07-28" }
    ]
  },
  "customData": {
    "type": "campaign",
    "sheets": [
      {
        "name": "Sheet1",
        "tables": [
          {
            "campaignSet": ["Campaign ID"],
            "regionSet": ["000000000000000000000000"],
            "dimensionSet": ["1"],
            "indexSet": {
              "type": "Total_pc,mb",
              "filtrationType": "0",
              "index": ["43", "44", "45"]
            },
            "x_axis": ["CampaignSet", "TimeSet"],
            "y_axis": ["RegionSet", "DimensionSet", "IndexSet"]
          }
        ]
      }
    ]
  }
}
Copy to clipboard
Error
Copied

参数说明：

参数	类型	必填	说明
taskName	string	是	任务名称，最长255字符
dataRange	object	是	数据范围，结构与固定模版一致，但需与customData.type匹配
customData	object	是	自定义配置

customData.type 与 dataRange 的对应关系：

type	dataRange 必填字段
"campaign"（活动维度）	campaign[] 非空，spots[]和website[]为空
"spot"（广告位维度）	spots[]和campaign[]均非空，website[]为空
"website"（媒体维度）	website[]和campaign[]均非空，spots[]为空

Sheet 元素：

字段	类型	必填	说明
name	string	是	Sheet名称（Excel Tab名）
titles	string[]	否	列标题，默认[""]
tables	array	是	表格配置数组，至少1个

Table 元素：

字段	类型	必填	说明
campaignSet	string[]	是	活动维度字段列表（非空）。type=campaign时：["CampaignName","Campaign ID"]；type=spot时：["SPID","placement","Channel","website","CampaignName","Campaign ID"]；type=website时：["website","CampaignName","Campaign ID"]
regionSet	string[]	是	24位区域ID列表
regionOrient	boolean	否	默认false
dimensionSet	string[]	是	人群维度，取值 {"1","2","3","4"}（1=所有网民, 2=稳定人群, 3=目标人群, 4=相交样本）
indexSet	object	是	指标配置
x_axis	string[]	是	X轴字段，取值：CampaignSet/TimeSet/DimensionSet/RegionSet/IndexSet
y_axis	string[]	是	Y轴字段，取值同上

IndexSet 对象：

字段	类型	必填	说明
type	string	是	场景+平台，格式"Total_pc,mb"，场景∈{Total,Accumulated,ByDay}，平台∈{pc,mb,pm,d}，多个平台逗号分隔
filtrationType	string	是	过滤方式："0"=净投放，"1"=总净投放（注意：这里是字符串，不是数组！）
index	string[]	是	指标ID列表。支持数字ID（"43"）、N+打包格式（"56_1_20"表示指标56 base=1 cap=20）、特殊字符串（"demography"、"sivttotal_imp"等）
customIndex	string[]	否	自定义指标，默认[]

重要规则：

indexSet.filtrationType 是 字符串 "0"/"1"，不是数组！这是自定义模版与固定模版的关键区别
indexSet.type 的场景与平台之间用 单下划线 分隔，多个平台用逗号分隔（如 "Total_pc,mb"）
N+ 打包格式：{指标ID}_{base}_{cap}，如 "56_1_20"；TVM不支持此格式，需用顶层NPlus字段
dimensionSet 只支持 1-4（人群维度），Universe/Minisite/Demography 通过 index 传字符串token实现
建议控制组合规模，超大规模任务（如18 tables×70指标×4维×全国）可能导致后端计算失败
自定义模版创建限流约10次/分钟，建议请求间隔≥8秒+指数退避
5. 查询任务状态

创建任务后，通过 status 接口轮询任务进度。

GET /api/v1/tvmonitor/query/task/status?ids=<task_ids> GET /api/v1/admonitor/query/task/status?ids=<task_ids>

参数：

参数	类型	必填	说明
ids	string	是	逗号分隔的任务ID。TVM上限50个，ADM上限500个

任务状态码：

status	含义	downloadable
0	队列中/等待执行	false
1	计算中	false
2	计算完成	true
3	计算失败（查看errorMsg）	false

TvMonitor 响应示例：

{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "taskId": 12345,
      "found": true,
      "status": 2,
      "statusDesc": "计算完成/已完成",
      "progressRate": 100,
      "finishedTime": "2026-07-28 14:30:00",
      "downloadable": true,
      "errorMsg": null
    }
  ]
}
Copy to clipboard
Error
Copied

AdMonitor 响应示例：

{
  "code": 0,
  "message": "OK",
  "data": {
    "tasks": [
      {
        "taskId": 12345,
        "found": true,
        "downloadable": true,
        "taskName": "7月曝光监测",
        "status": 2,
        "statusText": "COMPLETE",
        "progressRate": 100,
        "errorMsg": null
      }
    ]
  }
}
Copy to clipboard
Error
Copied

注意：TVM 返回的是数组，ADM 返回的是 {tasks: [...]} 对象，结构略有不同。

轮询建议：

创建后每 2-3 秒轮询一次
downloadable=true 时可以下载
status=3 时查看 errorMsg 并停止轮询
无权限/不存在的任务返回 found=false
6. 下载报表

任务计算完成后（status=2），可下载 xlsx 报表。

GET /api/v1/tvmonitor/query/task/download?id=<task_id> GET /api/v1/admonitor/query/task/download?id=<task_id>

参数：

参数	类型	必填	说明
id	int	是	任务ID

成功响应： 直接返回 xlsx 文件流（Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet），文件名格式为 {taskName}_{yyyy_MM_dd_HH_mm_ss}.xlsx。

curl 下载：

curl 'https://intra-api.miaozhen.com/api/v1/tvmonitor/query/task/download?id=12345' \
  -H 'Authorization: Bearer <your_access_token>' \
  -OJ
Copy to clipboard
Error
Copied

注意事项：

必须等 status=2（downloadable=true）才能下载，否则返回40901
下载限流：单任务5次/分钟，用户全量30次/分钟
无权限下载他人任务返回40301
7. 查询任务详情

查询任务的完整配置和状态信息。

GET /api/v1/tvmonitor/query/task/detail?id=<task_id> GET /api/v1/admonitor/query/task/detail?id=<task_id>

参数：

参数	类型	必填	说明
id	int	是	任务ID

返回任务的完整参数（taskName、dataRange、指标、维度、地域等）及状态信息。

8. 常见错误码
code	含义	处理建议
0	成功	—
40001	参数错误	检查必填项、格式、取值范围，message会说明具体问题
40101	未登录/token无效	检查access_token是否正确或过期
40301	无权限	检查账号是否有对应功能权限或数据权限
40302	指标/维度/平台/过滤方式权限不足	data.items[]会列出所有被拒项和缺失的权限
40304/40313	数据范围无效（ADM/TVM）	data.items[]列出不存在的活动/点位/媒体或越期条目
40305/40312	任务数据量过大（ADM/TVM）	按data.suggestion拆分数据范围或减少指标组合
40401	报表文件未找到	联系技术支持
40402	任务不存在	检查taskId是否正确
40901	任务未完成	继续轮询等待
40902/40904	任务名冲突	更换任务名称
42901	触发限流	按Retry-After头等待后重试
50302/50304	任务入队失败	可重试创建
50303	权限服务暂时不可用	稍后重试
9. 数据字典查询（如何获取活动/地域/点位ID）

建任务所需的活动ID、点位ID、地域码、目标人群等均通过秒针开放平台（Open API）查询。完整接口文档（含请求参数、返回字段、示例）见：

AdMonitor Open API：https://docs.cn.miaozhen.com/
TvMonitor Open API：https://docs.cn.miaozhen.com/TV-api.html

以下仅列出建任务常用接口的关键信息：

地域编码

AdMonitor（24位）：

curl -G 'https://api.cn.miaozhen.com/cms/v1/regions/list' \
  --data-urlencode 'access_token=<access_token>'
Copy to clipboard
Error
Copied

返回地域树，region_id 为24位编码，region_name 为名称。

"000000000000000000000000" = 全国/全球
"000000000000000000000008" = 中国大陆

TvMonitor（10位）：

curl -G 'https://api-tvmonitor.cn.miaozhen.com/monitortv/v1/config/message/list' \
  --data-urlencode 'access_token=<access_token>' \
  --data-urlencode 'type=region'
Copy to clipboard
Error
Copied

返回 {"error_code":0,"result":[{"id":"0000000000","name":"全球"},...]}。

"0000000000" = 全球/全国
活动/点位/媒体/目标人群ID

AdMonitor（域名：https://api.cn.miaozhen.com，响应为JSON数组）：

要查询的	接口	关键参数	响应字段
活动列表	GET /cms/v1/campaigns/list	无（按权限返回，默认500条需翻页）	campaign_id, campaign_name, start_date, end_date, advertiser_name, brand_name
活动下的广告位	GET /cms/v1/campaigns/list_spots	campaign_id	spot_id（整数）, placement_name, publisher_name
活动下的媒体	GET /cms/v1/campaigns/list_publishers	campaign_id	publisher_id, publisher_name
活动下的目标人群	GET /cms/v1/campaigns/list_targets	campaign_id	target_id（=stid，整数）, target_name

TvMonitor（域名：https://api-tvmonitor.cn.miaozhen.com，响应为{error_code,result}）：

要查询的	接口	关键参数	响应字段
活动列表	GET /monitortv/v1/campaigns/list	无	result[].campaign_id, campaign_name, start_time, end_time
活动下的广告位和媒体	GET /monitortv/v1/spot/list	campaign_id	result[].spot_id(=spid), pub_id(=pubid), publisher, ad_type
活动下的目标人群	GET /monitortv/v1/campaign/target/info	campaign_id	result[].target_id(=stid), target_name

翻页规则：AdMonitor 的 campaigns/list 默认返回500条，需通过 limit 参数翻页（如 limit=0,500 → limit=500,500 → limit=1000,500），直到返回数量<500表示拿完。

注意： spid（广告位ID）、pubid（媒体ID）、stid（目标人群ID）均为整数类型，不是字符串。

10. 编码对照表

以下内容直接引用自接口技术规范，保持原文表述。

10.1 TvMonitor 编码

场景指标 ID（total / accumulate / byday 取值）：

ID	含义	ID	含义	ID	含义
41	Days	42	Imp（曝光，默认勾选）	43	Click
44	UV（默认勾选）	45	Clicker	46	CTR
47	Est.Imp	48	Est.Click	49	Imp/Est.Imp
50	Click/Est.Click	51	IGRP（需权限）	52	Avg.Imp
53	Avg.Click	55	Reach%（需权限）	56	N+Reach（需权限，打包）
57	ReachN（需权限，打包）	58	Hours	60~`70`	PV / 转化系列
888	SignImp	889	Size	891	Resolution
999	CMK	666	effective imp	667	其它信息
890	SIVT（需权限）	898/899	SIVT 标准版/高阶版	900~`903`	SIVT P&G 系列

权限：51 需 iGRP 权限；55/56/57 需 Reach 权限；890/898903 为 SIVT 指标，各需对应 SIVT 权限（缺失分别返回 40311 / 40310）。合法指标白名单：`814、4158、6070、82、888/889/891/999/666/667、890/898/899/900/901/902/903`；不在白名单内返回 400。

指标 / 维度 → 权限码对照（TvMonitor）：服务端逐项校验（fail-batch，一次性返回所有缺权限项），绕过前端直接 POST 权限外指标/维度会被拒。

非 SIVT 指标 / 维度（缺失返回 40311，data.deniedItems[] 逐项列出）：

码值	位置	含义	所需权限码
51	指标	IGRP	tv_query_iGRP
55	指标	Reach%	tv_query_reach
56	指标	N+Reach	tv_query_reach
57	指标	ReachN	tv_query_reach
2	维度	到人数据（稳定人群）	tv_query_personData
3	维度	目标人群	tv_query_personData

维度 1、4、5 无权限限制；维度 2、3 需 tv_query_personData 权限；其余权限限制见 SIVT 指标章节。

SIVT 指标（缺失返回 40310，data.deniedIndicators[] 逐项列出）：

指标码	含义	所需权限码
890	SIVT（OTT SIVT）	tv_query_sivt
898	SIVT 标准版	tv_query_sivt_standard
899	SIVT 高阶版	tv_query_sivt_advanved（⚠️ 权限码拼写为 advanved，代码与权限系统一致，非笔误可改）
900	SIVT P&G 定制版	tv_query_sivt_pg
901	SIVT P&G 定制版2	tv_query_sivt_pg2
902	SIVT P&G 最终版	tv_query_sivt_pg
903	SIVT P&G2 最终版	tv_query_sivt_pg2

SIVT 判定 / 队列 / 地域冲突：SIVT_OPTIONS = {890,898,899,900,901,902,903}（7 个）。含任一 SIVT 指标的任务进入 SIVT 队列；且当 regionOrient=false 且所选区域非全国、活动 sivt_region=0（不支持区域拆分）时返回 40903（data.conflictCampaignIds[]）。另：899 要求 sheetBy=0，SIVT 指标不可与 totalnet 过滤组合，违反均返回 40001。

维度 ID（dimension 取值；即 UI 上的「数据维度」字段）：

ID	含义（页面标签）	备注
1	设备数据（All Audience）	默认勾选
2	到人数据（稳定人群 / Stable Audience）	需人群数据权限 tv_query_personData
3	目标人群（Select Audience）	需人群数据权限 tv_query_personData
4	Universe	
5	目标设备（Select Device）	

TvMonitor 合法维度只有 {1,2,3,4,5}，无6（Minisite）、无7（Demography）。⚠️ TVM 维度码值与 ADM 不同：TVM 中 4=Universe、5=目标设备，而 ADM 中 5=Universe、4=相交样本量，不要混用。UI 上的「数据维度」是一组平铺的 checkbox，对应 dimension 数组。当 total 含时段类指标 8~`14时，服务端自动把对应维度追加进dimension`（无需手动传）。

过滤方式 filtrationType**：取值 ∈ {"net","totalnet"}（net = 净投放、totalnet = 总净投放）。必填**，缺失或空数组返回 400。⚠️ 与 AdMonitor 的 "0"/"1" 编码不同。

地域 regions**：逗号分隔的 **10 位数字 区域 ID，"0000000000" = 全国；regionOrient=true 时可省略。区域 ID 为秒针内部地域编码，非国标码。

**Sheet拆分 sheetBy**："0" 按活动、"1" 按区域、"2" 单Sheet。

10.2 AdMonitor 编码

场景指标 ID（total / accumulate / byday 取值）：

ID	含义	ID	含义
41~`51`	Cost / Days / Imp / Click / UV / Clicker / CTR / Est.Imp / Est.Click / Imp Ratio / Click Ratio	52	IGRP（需 iGRP 权限）
53~`55`	Avg.Imp / Avg.Click / Reach%（55 需 Reach 权限）	56 / 57	N+ / ReachN（需 Reach 权限，打包）
60~`70`	pv / bydayUv / avgPage / avgTime / jumpRate / jumpTime / c-click / c-clicker / time / visit / accUv	81~`84`	Read Count / Real Time / Reach%-UG(需人口覆盖权限) / deviceId 回传率
90~`95`	可视度系列 Viewable / Non-viewable / Unmeasured / Measured Imp / Uv（需可视度权限）	96~`99`	可视/不可视 N+/ReachN（需可视度权限，打包）
313~`316`	AdType / CMK / isOnline / 监测指标及其它	8~`14`	移动端类：app(8) / OS(9) / 联网(10) / 终端(11) / Hours(12) / Keywords(13) / 品牌(14)

⚠️ 与 TvMonitor 含义不同：例如 ADM 42 = Days、43 = Imp，而 TVM 42 = Imp、43 = Click（ADM 因多一个 41 = Cost 而整体后移一位）。

指标 / 维度 / 平台 / 过滤方式 → 权限码对照（AdMonitor）：服务端逐项校验（fail-batch，一次性返回所有缺权限项），缺权限返回 40302（data.items[]）。下表列出对外的裸权限码。

码值	类别	含义	所需权限码（裸）
52	指标	IGRP	query_iGRP
55 / 56 / 57	指标	Reach% / N+ / ReachN	query_reach
83	指标	Reach%-UG（Pop Coverage）	query_showPopCoverage
9099、481485	指标	可视度系列（Viewable / V-N+ / V-ReachN 等）	query_viewability
平台 d	source	移动端明细数据源	query_mobileDetail
1（filtrationType）	过滤	Total Net（总净投放）	temp_totalnet
4	维度	相交样本量 / 交叉分析	query_showCross
7	维度	Demography（人口统计）	query_showDemography

维度 1/2/3/5/6、平台 pc/mb/pm、filtrationType=0、指标 8~14（移动端类）等无权限门槛（合法即可提交）。绕过前端直接 POST 权限外指标 / 平台 / 维度均被 fail-batch 拒。

维度 ID（dimension 取值；固定模版允许 1~7）：

ID	含义	ID	含义
1	所有网民（默认）	2	稳定人群
3	目标人群	4	相交样本量 / 交叉分析（需交叉分析权限）
5	Universe	6	Minisite
7	Demography（需人口统计权限）		

UI 上的「数据维度」即 dimension 数组；「交叉分析维度」为其中取值 4。当 total 含移动端指标 814 时，服务端自动把对应维度追加进 dimension（无需手动传）。多维钻取（自定义模版）的 dimensionSet 仅支持 14。

平台 source：分号分隔字符串，取值 pc（PC端）、mb（移动端）、pm（PMP/OTV）；选移动端明细需 d（需 query_mobileDetail 权限）。示例："pc;mb"、"pc;mb;pm"。

**过滤方式 filtrationType**：取值 ∈ {"0","1"}（0 = 净投放、1 = 总净投放，1 需总净投放权限）；可选，空数组不生效。⚠️ 与 TvMonitor 的 "net"/"totalnet" 编码不同。

地域 regions**：逗号分隔的 **24 位 区域 ID，"000000000000000000000000" = 全国/全球；regionOrient=true 时可省略。区域 ID 为秒针内部地域编码，非国标码，且格式与 TvMonitor（10 位）不同。

**Sheet拆分 sheetBy**："0" 按活动（默认）、"1" 按区域。

11. 限流说明

所有限流违反均返回 HTTP 429 + 业务码 42901，并一律携带 Retry-After 响应头告知客户端可重试时间：下载类为分级值（用户级 60s，全局 1s），其余限流（创建 / 自定义创建 / 状态查询）统一为 1s。

接口	用户级限制	全局限制
TVM 创建任务	2 次/秒	20 次/秒
ADM 创建固定模版任务	2 次/秒	20 次/秒
ADM 创建自定义模版任务	10 次/分钟	20 次/秒
TVM 下载报表	单任务 5 次/分钟 + 用户全量 30 次/分钟	50 次/秒
ADM 下载报表	单任务 5 次/分钟 + 用户全量 30 次/分钟	50 次/秒
TVM 批量查询状态	10 次/秒	200 次/秒
TVM 查询任务详情	10 次/秒	200 次/秒
ADM 批量查询状态	10 次/秒	200 次/秒
ADM 查询任务详情	10 次/秒	200 次/秒
权限查询（两个接口）	无	无

上述为默认值，限流参数可由运维按需调整。

12. 使用建议
先拿ID再建任务：先通过开放平台查询到准确的活动/点位/地域ID，不要手动构造
遵守限流：所有限流规则见第11章；触发42901时读取 Retry-After 响应头等待后重试
日期规则：所有查询日期不能晚于昨天（T+1），AdMonitor日期跨度不超过3个月
批量查询状态：尽量把多个taskId合并到一次status请求中（TVM≤50个/次，ADM≤500个/次）
数据量控制：如果收到40305/40312（数据量过大），减少指标数量、缩短日期范围或拆分活动
编码勿混用：ADM和TVM的filtrationType编码、地域码位数、指标ID含义都不同，不要跨产品线套用
令牌缓存：access_token有效期1小时，建议缓存复用，避免频繁兑换
自定义模版注意：indexSet.filtrationType是字符串"0"/"1"不是数组；N+指标用打包格式"56_1_20"而非顶层字段；控制组合规模避免后端计算失败
