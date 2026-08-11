

## ==================== AdMonitor API ====================

Monitor API

首页

接口 API

AdMonitor API
API协议
秒针AdMonitor API
CMS / Campaigns API
CMS / Misc API
AdMonitor / Reports API
TV Monitor API
秒针多维查询 API 使用指南
AdMonitor API

本文档由旧文档站 https://docs.cn.miaozhen.com/ 迁移整理而来，涵盖 AdMonitor 产品的接口协议、鉴权方式及全部接口定义。

API协议
API请求

通过向API接口发送HTTP请求来访问Miaozhen API。除非另有说明，URL是以Miaozhen API域名**https://api.cn.miaozhen.com开头的HTTPS**协议。

用于检索数据的API需要使用URL的查询字符串中的参数进行GET请求。创建、更新或删除数据的API需要HTTP中包含参数的POST请求。这些参数应该是application / x-www-form-urlencoded，字符集UTF-8。

获取token

要访问非公开数据，须使用Miaozhen OAuth2 Service授予的参数[access_token] 。

请求地址

POST /oauth/token

参数
名称	必选	示例	描述
grant_type	true	password	grant_type必须为password
username	true	john	用户名
password	true	8888	密码
client_id	true	admapi	API账号用户名
client_secret	true	7Fjfp0ZBr1KtDRbn	API账号密码
响应实例
{
 "token_type": "bearer",
 "access_token": "2.DS9SMCcVMIJUYBoGMDAxNTc1IgxhZG1QbVRlc3RBcGkyAgIB.MCwCFB1MCZFS1bOnjRks-h-JZAiQ1Le7AhQ7ejI6-q4k2vIghzQ2oXDgWJys5w",
 "refresh_token": "93ec7138-c388-4131-9166-c7f2f8f092d6",
 "expires_in": 3600,
 "scope": "monitor op",
 "product_id_list": [
     2,
     1
 ],
 "uid": 0000,
 "uname": "john",
 "user_number": "1650172955"
}
Copy to clipboard
Error
Copied

注意：access_token在短时间内过期（默认情况下为1小时）。

如果您不知道client_id/client_secret或用户名/密码，请咨询秒针客户经理团队。

常用参数
名称	格式	示例	描述
access_token	TOKEN	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
callback	FUNC	myfunc	将JSON响应包装在JSONP的回调方法FUNC中。例如，附加callback=myfunc到请求, 将导致响应正文中出现：**myfunc(...)**。回调只能包含字母数字字符和下划线;任何无效字符都将被去除。
suppress_response_codes	1	1	如果此参数存在，所有响应将返回200 OK的状态代码---甚至是error。此参数的存在是为了适应运行在拦截所有非200响应的浏览器中的Flash和JavaScript应用程序。
limit	M，N	0,2	从偏移量M中返回最多N个项目。初始项目的偏移量为0（不是1）。
order_asc	NAME	campaign_id	按照项目的属性NAME的值排序按升序返回项目。
order_desc	NAME	campaign_id	按照项目的属性NAME的值排序按降序返回项目；与order_asc不能在同一个请求中。
请求示例
GET /admonitor/v1/campaigns/show?campaign_id=123&access_token=1.2YotnFZFEjr1zCsi HTTP/1.1
Host: api.cn.miaozhen.com
Copy to clipboard
Error
Copied
API响应

成功的HTTP响应为HTTP 200（OK）状态代码，其中显示JSON对象的纯文本正文，字符集UTF-8。

响应示例
 HTTP/1.1 200 OK
 Content-Type: application/json;charset=UTF-8
 {
"campaign_id": "123",
"campaign_type": "admonitor",
"campaign_name": "test campaign 1",
"start_date": "2012-12-20",
"end_date": "2013-01-05",
"description": "This is a test campaign.",
"agency_name": "Test Agency",
"advertiser_name": "Test Advertiser",
"brand_name": "Test Brand",
"creator_name": "jetlee",
"linked_panels": ["china-123","test-2012l225"],
"linked_minisites": ["1","2"],
"linked_iplib": "IPlib-Region-0000-top100-20120428105600"
}
Copy to clipboard
Error
Copied
错误响应

在客户端错误或服务器端错误的情况下，响应将分别是HTTP 400（错误请求）或500（内部服务器错误）状态代码（如果使用suppress_response_codes，得到的是200）。响应正文将是一个JSON的错误对象，包括参数error来简要介绍错误，在API中可能出现error_description和error_code。

请求示例
HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "token_required",
"error_description": "An access token is required to request this resource.",
"error_code": 123
}
Copy to clipboard
Error
Copied
秒针AdMonitor API
CMS APIs

CMS是管理秒针的元数据（如广告活动，panel和地域）的产品。可通过活动ID从CMS API查询广告活动名称和广告活动点位列表等。

广告活动
状态	请求地址	描述
ON	GET /cms/v1/campaigns/show	显示广告活动信息。
ON	GET /cms/v1/campaigns/show_spot	显示广告活动点位信息。
ON	GET /cms/v1/campaigns/list	列出可以在某些搜索条件下访问的所有广告活动。
ON	GET /cms/v1/campaigns/list_targets	列出一个广告活动的所有目标人群。
ON	GET /cms/v1/campaigns/list_publishers	列出一个广告活动的所有媒体。
ON	GET /cms/v1/campaigns/list_spots	列出一个活动的所有点位（含监测代码）。
ON	POST /cms/v1/campaigns/create	创建新的广告活动。
ON	POST /cms/v1/campaigns/create_spot	在广告活动中创建新的点位。
ON	POST /cms/v1/campaigns/publish_target	在广告活动中创建并发布新的目标人群。
ON	POST /cms/v1/campaigns/create_spot_with_plan	创建活动排期。
ON	POST /cms/v1/campaigns/delete	删除广告活动。
ON	POST /cms/v1/campaigns/delete_spot	删除广告活动中的某个点位。
ON	POST /cms/v1/campaigns/update	更新广告活动信息。
ON	POST /cms/v1/campaigns/update_spot	更新点位信息。
地域
状态	请求地址	描述
ON	GET /cms/v1/regions/show	显示地域信息。
ON	GET /cms/v1/regions/list	列出某些搜索条件下的所有地域。
Panels
状态	请求地址	描述
ON	GET /cms/v1/panels/show	显示panel信息。
ON	GET /cms/v1/panels/list	列出某些搜索条件下访问的所有panel。
广告主
状态	请求地址	描述
ON	GET /cms/v1/advertisers/show	显示广告主的信息。
ON	GET /cms/v1/advertisers/list	列出某些搜索条件下的所有广告主。
品牌
状态	请求地址	描述
ON	GET /cms/v1/brands/show	显示品牌的信息。
ON	GET /cms/v1/brands/list	列出某广告主ID下的所有品牌信息。
代理商
状态	请求地址	描述
ON	GET /cms/v1/agencies/show	显示代理商信息。
ON	GET /cms/v1/agencies/list	列出某些搜索条件下的所有代理商。
商品信息
状态	请求地址	描述
ON	GET /cms/v1/product/list	列出某些搜索条件下的所有商品。
剧目信息
状态	请求地址	描述
ON	GET /cms/v1/programs/list	列出某些搜索条件下的所有剧目信息。
广告位类型
状态	请求地址	描述
ON	GET /cms/v1/plmttype/list	列出某些搜索条件下的所有广告位类型。
AdMonitor APIs

AdMonitor是广告监测产品。例如，可以通过活动ID在AdMonitor API查询广告数据报告。

报告
状态	请求地址	描述
ON	GET /admonitor/v1/reports/basic/show	显示广告活动基础数据。
ON	GET /admonitor/v1/reports/realtime/show	显示广告活动实时数据。
ON	GET /admonitor/v1/report/reach/show	显示到达人群报告。
ON	GET /admonitor/v1/report/basic/progress	活动计算进度查询。
CMS / Campaigns API
广告活动——显示相关信息
显示广告活动信息
请求地址

GET /cms/v1/campaigns/show

参数
名称	必选	示例	描述
campaign_id	true	123	广告活动ID
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
pmo_info	false	1	0：（默认）不返回pmo相关的信息； 1：返回pmo相关的信息（返回参数"panel_type","linked_tvcaids"）
dm_info	false	1	0：默认，不反回dm需要的相关信息; 1：返回dm需要的相关信息(返回参数“order_id”,"scheduling_code","extensiontype","play_detect","ear“,"total_net“,"freq_capping","frequency_limit")
响应示例
{
"campaign_id": "123",
"campaign_type": "admonitor",
"campaign_name": "test campaign 1",
"start_date": "2012-12-20",
"end_date": "2013-01-05",
"description": "This is a test campaign.",
"agency_name": "Test Agency",
"advertiser_name": "Test Advertiser",
"brand_name": "Test Brand",
"creator_name": "jetlee",
"slot_type": "display",
"panel_type":0,
"calculation_type": "2.1",
"linked_panels": ["china-123","test"],
"linked_siteids": "123;456",
"linked_iplib": "IPlib-Region-0000-top100-20120428105600",
"linked_tvcaids":[123,345],
"order_id":"C240807020"，
" scheduling_code ":"C240807020P0004"，
"extensiontype":"品牌形象活动-品牌形象"，
"play_detect":"true"，
"ear":"无"，
" total_net ":"是"，
"freq_capping":"50"
}
Copy to clipboard
Error
Copied
显示广告活动点位信息
请求地址

GET /cms/v1/campaigns/show_spot

参数
名称	必选	示例	描述
campaign_id	true	123	广告活动ID
spot_id_str	true	abc0	字符串表示的点位
keyword	false	on	是否显示关键词，on为显示
show_filtration_status	false	1	是否显示点位的高危来源过滤开启状态，1为显示
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
show_extInfo	false	1	显示广告点位信息字段：预算录入
dm_info	false	1	显示广告素材类型、剧目名称、CMK等其他点位信息
响应示例
{
    "publisher_id": 4,
    "placement_type": "display",
    "site_type": "test",
    "general_buyingtype": "test",
    "program_purchasing_type": "",
    "program": "test",
    "campaign_group": "test",
    "keyword": [
    {
    "keyword_id": 4018469,
    "keyword_name": "test"
    "landing page": https://www.baidu.com/
    },
    {
    "keyword_id": 4018470,
    "keyword_name": "abctestword"
    "landing page": https://www.baidu.com/
    },
    ...
    ],
    "brand": "",
    "media_subtype": "meida",
    "adposition_type": "其它",
    "spot_id": "40",
    "kpi": "test",
    "GUID": "10",
    "buying_platform": "test",
    "report_metrics": "impression+click",
    "copy_name": "Copy_7",
    "spot_type": "test",
    "market": "NATIONAL",
    "spot_plan": "test22",
    "site_name": "test",
    "shop_id": "111",
    "vending_model": "程序化购买-程序化购买其他类型",
    "linked_siteid": 345,
    "paid_or_bonus": "test",
    "freq_capping": "S0+",
    "spot_id_str": "e",
    "campaign": "",
    "buying_basis": "",
    "buying_model": "Spot Buy",
    "description": "test",
    "md5FormatType": "",
    "ext_info_md5_format_type": "",
    "customize": "test",
    "tracking_timing": "bb",
    "channel_name": "NATIONAL",
    "other_impr_tracking_tag": "",
    "product": "test",
    "publisher_name": "DOUYIN LE",
    "landing_page": "https://www.xxxxx.com/",
    "CAGUID": "10",
    "buying_model_subtype": "Base",
    "area_size": null,
    "placement_name": "Openning Screen VIDEO",
    "budgetInput": "10000",
    "spot_plan_record_id": "test9",
    "category": "test",
    "referrer_url": "https://www.xxxxx.com/"
}
Copy to clipboard
Error
Copied
列出广告活动

获取指定活动条件下的活动基本信息列表

请求地址

GET /cms/v1/campaigns/list

参数
名称	必选	格式	示例	描述
campaign_id	false	ID1,ID2...	12,13,14	广告活动ID，用于搜索，支持批量输入（英文半角逗号分隔）
campaign_type	false	TP1，TP2，...	admonitor	系统默认，无需输入
campaign_name	false	PATTERN	food	活动名称，用于搜索
advertiser_name	false	PATTERN	Yum	广告主，用于搜索
agency_name	false	PATTERN		代理名称，用于搜索
brand_name	false	PATTERN	KFC	品牌名称，用于搜索
creator_name	false	PATTERN	lee	创建者，用于搜索
status	false	INT（1..3）	1	搜索：广告活动状态为 1：未启动;2正在进行中；3：已结束。
calculation_type	false		1.0	必须是以下之一：1.0(默认）2.0，2.1
pmo_info	false	INT	1	0：（默认）不返回pmo相关的信息； 1：返回pmo相关的信息（返回参数"panel_type","linked_tvcaids"）
dm_info	false	INT	1	0：默认，不反回dm需要的相关信息; 1：返回dm需要的相关信息(返回参数“order_id”,"scheduling_code","extensiontype","play_detect","ear“,"total_net“,"freq_capping","frequency_limit")
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500;M为起始行数，N为结果条数。
order_asc	false	NAME	campaign_id	升序排序依据字段,order_asc取值: campaign_id, campaign_name, advertiser_name, agency_name, brand_name, creator_name, status
order_desc	false	NAME	campaign_id	降序排序依据字段,order_desc取值：同 order_asc

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
"campaign_id": "123",
"campaign_type": "admonitor",
"campaign_name": "test campaign 1",
"start_date": "2012-12-20",
"end_date": "2013-01-05",
"description": "This is a test campaign.",
"agency_name": "Test Agency",
"advertiser_name": "Test Advertiser",
"brand_name": "Test Brand",
"creator_name": "jetlee",
"slot_type": "display",
"panel_type":0,
"calculation_type": "2.1",
"linked_panels": ["china-123","test"],
"linked_siteids": "123;456",
"linked_iplib": "IPlib-Region-0000-top100-20120428105600",
"linked_tvcaids":[123,345],
"order_id":"C240807020"，
" scheduling_code ":"C240807020P0004"，
"extensiontype":"品牌形象活动-品牌形象"，
"play_detect":"true"，
"ear":"无"，
" total_net ":"是"，
"freq_capping":"50"
},
...
]
Copy to clipboard
Error
Copied
列出活动的目标人群
请求地址
GET /cms/v1/campaigns/list_targets
Copy to clipboard
Error
Copied
参数
名称	必选	格式	示例	描述
campaign_id	true	ID	12	广告活动ID
panel_id	false	ID1，ID2，...	china-123，test	活动所关联的人群样本库ID，用于搜索，支持批量输入（英文半角逗号分隔）。
target_id	false	ID1，ID2，...	2,3	目标人群ID，用于搜索，支持批量输入（英文半角逗号分隔）。
show_tag	false	ID	0	是否返回该目标人群的tag_id组成。0：默认，不返回；1：返回。
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500.M为起始行数，N为结果条数
order_asc	false	NAME	panel_id	升序排序依据字段,取值: panel_id, target_id.
order_desc	false	NAME	panel_id	降序排序依据字段,取值：同order_asc.

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
"target_id": "2",
"target_name": "F20-29",
"panel_id": "china-123",
"tag_id":"001,002&003"
},
{
"target_id": "3",
"target_name": "M20-29",
"panel_id": "china-123",
"tag_id":"001,002&004"
},
...
]
Copy to clipboard
Error
Copied
列出活动的所有媒体
请求地址
GET /cms/v1/campaigns/list_publishers
Copy to clipboard
Error
Copied
参数
名称	必选	格式	示例	描述
campaign_id	true	ID	12	广告活动ID
publisher_id	false	ID1，ID2，...	2,3,4	媒体ID，用于搜索，支持批量输入（英文半角逗号分隔）
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500.M为起始行数，N为结果条数
order_asc	false	NAME	publisher_id	升序排序依据字段。取值: publisher_id.
order_desc	false	NAME	publisher_id	降序排序依据字段。取值：同 order_asc.

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
  "publisher_id": "2",
  "publisher_name": "Google"
},
{
"publisher_id": "3",
  "publisher_name": "Twitter"
},
...
]
Copy to clipboard
Error
Copied
列出活动的所有点位

获取指定活动的广告位（spot）信息列表（含监测代码）

请求地址
GET /cms/v1/campaigns/list_spots
Copy to clipboard
Error
Copied
参数
名称	必选	格式	示例	描述
campaign_id	true	ID	12	广告活动ID
publisher_id	false	ID1，ID2，...	2,3,4	媒体ID，用于搜索，支持批量输入（英文半角逗号分隔）
spot_id	false	ID1，ID2，...	40,41,42	定位ID，用于搜索，支持批量输入（英文半角逗号分隔）。
show_plan	false	INT（0..1）	1	是否显示排期计划，0（默认）：不显示；1：显示
show_filtration_status	false	INT（0..1）	1	是否显示点位的高危来源过滤开启状态，0（默认）：不显示；1：显示
from_date	false	YYYY-MM-DD	2013-01-01	所展示排期开始的日期，格式：YYYY-MM-DD。默认为排期起始时间
to_date	false	YYYY-MM-DD	2013-01-07	所展示排期结束的日期，格式：YYYY-MM-DD。默认为排期结束时间
code_type	false	NAME	HTTP	选择监测代码的附加选项，以英文逗号分隔:mma（MMA标准的设备ID宏参数）, https（https监测代码）, na（微博专用用户唯一标识宏参数）, snr（新浪门户专用用户唯一标识宏参数）, ls（经纬度宏参数）, viewable（可见曝光监测宏参数）, tr（额外自定义信息）,nw（微博回传曝光ID）,contr(剧目监测代码，包括：nd、nd、ng、nn、nvn字段), closedurl（导出封闭式落地页）, utm（选择则此次导出点击监测代码的落地页后拼接umt参数）, utm_auto（ro=sm,落地页跳转时自动拼接utm参数，此项与utm二选一即可）, ks（快手活动信息字段，包括：ka、kb、kc、kd、ke、kf、kg字段），hmi（优酷家庭标识）yahoo（yahoo必要参数），groupm（群邑cookiemapping参数），txreferer（腾讯referer信息），xt（星图必要参数），jd（京东id)，douyin（P&G DOU+活动专用 创意ID），creativeid（P&G程序化活动专用 创意ID），？（添加“?”）
landingpage	false	NAME	utm	取值：utm；输出带utm参数的点击落地页（点位信息-目标链接地址需要有值）
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500。格式：M为起始行数，N为结果条数
order_asc	false	NAME	publisher_id	升序排序依据字段。取值: spot_id, publisher_id.
order_desc	false	NAME	spot_id	降序排序依据字段。取值：同order_asc.
show_extInfo	false	INT（0..1）	1	显示广告点位信息字段：预算录入
dm_info	false	INT	1	显示广告素材类型、剧目名称、CMK等其他点位信息

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
"spot_id": "40",
"spot_id_str": "e",
"publisher_id": "3",
"budgetInput": "10000",
"channel_name": "news",
"placement_name": "top banner",
"report_metrics":"impression+click"
"GUID": "RTX123456",
"CAGUID": "XDF234",
"adposition_type": "其它",
"vending_model": "程序化购买-程序化购买其他类型",
"market": "",
"customize": "66666",
"description":"PC/A版素材",
"keyword": [
{
"deletedTime": "",
"isDeleted": "",
"keyword": "牛奶",
"keywordId": 22050057,
"landingPage": "https://www.baidu.com",
"spid": 0,
"tracking_tags": [
{
    "impression_url": "http://g.cn.miaozhen.com/x/k=215&p=123&dx=__IPDX__&rt=2&ns=__IP__&ni=__IESID__&v=__LOC__&xa=__ADPLATFORM__&tr=__REQUESTID__&o="
},
{
    "click_url": "http://e.cn.miaozhen.com/r/k=215&p=123&af=22050057&dx=__IPDX__&rt=2&ns=__IP__&ni=__IESID__&v=__LOC__&xa=__ADPLATFORM__&tr=__REQUESTID__&vo=34449fe&vr=2&o=https%3A%2F%2Fwww.baidu.com"
}
]
}
],
"landing_page": "http://www.facebook.com",
"tracking_tags":
[
"impression_url": "http://g.cn.miaozhen.com/x.gif?k=123&p=456&o=",
"click_url": "http://e.cn.miaozhen.com/r.gif?k=123&p=456&o=http://www.facebook.com"
],
"spot_plan":
[
{
"date": "2013-01-01",
"est_impression": 2000,
"est_click": 10,
},
...
]
},
...
]
Copy to clipboard
Error
Copied
广告活动 - 创建广告相关信息
创建广告活动
请求地址

POST /cms/v1/campaigns/create

参数
名称	必选	示例	描述
campaign_type	false	admonitor	系统默认，无需输入
platform	false	pm	设定panel平台维度。必须是pc（默认）或pm
campaign_name	true	test	广告活动名称，不能为空，不得与已有活动名称重复
calculation_type	false	1.0	必须是以下之一：1.0(默认）3.0，3.1
start_date	true	2012-12-20	YYYY-MM-DD，不得早于当天
end_date	true	2013-01-05	YYYY-MM-DD，不得早于start_date
orderid	false	C240807020	服务单ID
schedulingCode	false	C240807020P0004	排期编码
frequency_limit	false	20	活动最大到达，默认10。范围：1-80
advertiser_id	false	1	广告主ID。可使用List Advertisers列出所有可用的广告主ID
brand_id	false	1	品牌ID。可使用查询List Brands 广告主ID下的所有品牌ID。如传品牌ID则广告主ID必填，且保证品牌ID与广告主ID的关联关系准确
agency_id	false	2	代理商ID。可使用List Agencies列出所有可用的代理机构ID
panel_id	false	china-123	活动所关联的人群样本库ID。可使用List Panels列出所有可用的人群样本库ID强烈建议使用默认值(默认为最新的panel_id)
ear	false	EAR阿里妈妈	是否为ear类型活动。枚举值：无（默认），EAR阿里妈妈。该字段一旦创建不可修改
wares	false	china -123	商品信息，格式：广告主|品牌名称|商品名称
linked_siteids	false	china -123	关联的秒针分析站点ID，多个用";"隔开
ad_campaign_type	false	china -123	广告活动类型，必须是以下之一：imedia，ivideo，ivideo+imedia，other,cross
slot_type	false	dispaly	排期类型，必须是以下之一：display(默认)，search，display+search
freq_capping	false	china -123	活动频次，范围1-50
description	false	CampaignDesc	描述信息
panel_type	false	pmo	Panel类型，枚举值：pm（默认），pmo。活动创建完成后不可修改
linked_tvcaids	false	[123,456]	关联的TVMonitor活动ID
extensiontype	false	一级-二级	推广类型，可使用List extensiontype查询
play_detect	false	1	内容监测，默认0，如需监测填写1
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例

如果创建活动成功，将返回新创建的campaign_id。

{
"campaign_id": "123"
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "invalid_campaign_name",
"error_description": "The 'campaign_name' should not be empty."
}
Copy to clipboard
Error
Copied
创建广告活动点位
请求地址

POST /cms/v1/campaigns/create_spot

参数
名称	必选	示例	描述
campaign_id	true	123	广告活动ID
publisher_name	true	Yahoo	媒体名称
channel_name	true	News	频道
placement_name	true	123	广告位名称
placement_type	false	display	广告素材类型，必须是以下之一：display（默认）video，text，others，QR-Code，search
program_purchasing_type	false	通投	通投/按频道采买/按剧目采买
program	false	aaaaa	剧目名称，可使用List Program列出所有可用的剧目名称，可填写多个，以“,”分割。
keyword	false	牛奶^https://www.baidu.com>母乳^https://www.baidu.com	关键词，keyword字段为数组形式，包含keyword_name和landingpage，如landingpage不填，形式为牛奶^>母乳^。不同数组以>分隔。
freq_capping	false	S0+	广告位频次控制，区分大小写格式：由频控类型（S、M）、频控目标（n+、n-）和频控周期（D、W、M）组成，频控类型和频控目标必填；若无频控需求，请输入S0+
tracking_timing	false	0	Video广告位置，用于发送监测请求的预期时间，Video类型广告位的默认值：1s，非video类型广告位无默认值。
linked_siteid	false	345	关联的秒针分析站点ID，如果需要秒针分析的归因，请务必填写
market	false	北京市	地域定向
vending_model	false	程序化购买-PDB	广告投放方式，一级投放方式与二级投放方式间用"-"分隔
adposition_type	false	常规Banner	广告位类型，可使用List plmttpe列出所有可用的广告位类型。
referrer_url	false	http://www.ads.com	广告所在页面网址
landing_page	false	http://www.wtf.com	目标链接地址，点击广告跳转的落地页
dangerous_source_filtration	false	1	必须是1或0，表示是否过滤可疑高危来源的流量，keywords点位默认值为0，其余点位默认值为1。 若无特殊监测需求（如S2S），请输入1。
report_metrics	false	impression	必须是以下之一：impression，click，impression+click
caguid	false	SP-CH1900861	客户活动ID
guid	false	13027990	客户点位ID
customize	false	公关_母品牌	自定义列
description	false	PC/A版素材	描述信息
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
other_impr_tracking_tag	false	http://www.xxxxx.com	其他公司曝光代码，必须以http://或https://开头
shop_id	false	123456	ShopID
category	false		客户自定义字段
brand	false		客户自定义字段
product	false		客户自定义字段
copy_name	false		客户自定义字段
buying_model	false		客户自定义字段
buying_model_subtype	false		客户自定义字段
media_subtype	false		客户自定义字段
general_buyingtype	false		客户自定义字段
spot_type	false		客户自定义字段
spot_plan	false		客户自定义字段
spot_plan_record_id	false		客户自定义字段
buying_platform	false		客户自定义字段
campaign_group	false		客户自定义字段
campaign	false		客户自定义字段
kpi	false		客户自定义字段
site_type	false		客户自定义字段
site_name	false		客户自定义字段
buying_basis	false		客户自定义字段
paid_or_bonus	false		客户自定义字段
ext_info_md5_format_type	false		客户自定义字段
budgetInput	false	100000	预算录入
响应示例

如果创建点位成功，将返回新创建 spot_id 。

如同时创建了关键词 ，将返回关键词的keyword_id、keyword_name、landing_page。

{
 "campaign_id": "123",
 "spot_id": "40",
 "spot_id_str": "e",
 "publisher_id": "1"
 "keyword": [
     {
         "keyword_id": 22050057,
         "landing_page": "https://www.baidu.com",
         "keyword_name": "牛奶"
     },
     {
         "keyword_id": 22050058,
         "landing_page": "https://www.baidu.com",
         "keyword_name": "母乳"
     }
 ]
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
 "error": "invalid_placement_name",
 "error_description": "The 'placement_name' should not be empty."
}
Copy to clipboard
Error
Copied
批量创建广告活动点位

批量创建广告活动点位，支持单次请求最多创建3000个点位（JSON 数组形式）。点位按数组顺序写入数据库，以保证排期顺序；单次请求中campaign_id只能有一个，即所有点位须属于同一活动；接口按 fail-fast 策略处理，任一点位失败则整批回滚，不落库。

请求地址

POST /cms/v1/campaigns/batch_create_spot_with_plan

参数
名称	必选	示例	描述
campaign_id	true	123	广告活动 ID，整个请求只能包含一个活动 ID
publisher_name	true	Yahoo	媒体名称
channel_name	true	News	关键词点位填写 Bidding word（B 必需大写）
placement_name	true	123	广告位名称
placement_type	false	display	广告素材类型，枚举：display（默认）、video、text、others、QR-Code、search
program_purchasing_type	false	通投	通投/按频道采买/按剧目采买
program	false	aaaaa	剧目名称，可填写多个，用逗号分隔（详见 List Program接口）
keyword	false	牛奶^https://...>母乳^https://...	关键词数组形式，包含 keyword_name 和 landingpage，不同数组用 > 分隔
tracking_timing	false	0	Video 广告位监测请求发送时间，Video 类型默认 1s，非 video 无默认值
linked_siteid	false	345	关联的秒针分析站点 ID（用于归因）
market	false	北京市	地域定向
vending_model	false	程序化购买-PDB	广告投放方式，一级与二级间用 - 分隔
adposition_type	false	常规Banner	广告位类型（详见List plmttpe接口）
referrer_url	false	http://www.ads.com	广告所在页网址
landing_page	false	http://www.wtf.com	点击跳转的落地页
dangerous_source_filtration	false	1	是否过滤可疑高危流量，1 或 0。keywords 默认 0，其余默认 1，若无特殊需求请输入 1
report_metrics	false	impression	监测指标，枚举：impression、click、impression+click
caguid	false	SP-CH1900861	客户活动 ID
guid	false	13027990	客户点位 ID
customize	false	公关_母品牌	自定义列
description	false	PC/A版素材	描述信息
slot_begin	false	2013-11-11	广告位排期开始时间，格式 YYYY-MM-DD，与 add_slot 不能同时存在
slot_duration	false	30	排期持续时间（天），与 add_slot 不能同时存在
est_impression	false	100	预估总曝光，与 add_slot 不能同时存在
est_click	false	10000	预估总点击，与 add_slot 不能同时存在
add_slot	false	2020-06-30,2020-07-03	增加排期日期，逗号分隔，格式 YYYY-MM-DD
est_impression_day	false	1,000,010,000	预估日曝光，逗号分隔
est_click_day	false	100,100	预估日点击，逗号分隔
access_token	true	1.2YotnFZFEjr1zCsi	访问令牌（获取方式见获取token）
other_impr_tracking_tag	false	http://www.xxxxx.com	其他公司曝光代码（需以 http:// 或 https:// 开头）
shop_id	false	123456	ShopID
category	false	-	客户自定义字段
brand	false	-	客户自定义字段
product	false	-	客户自定义字段
copy_name	false	-	客户自定义字段
buying_model	false	-	客户自定义字段
buying_model_subtype	false	-	客户自定义字段
media_subtype	false	-	客户自定义字段
general_buyingtype	false	-	客户自定义字段
spot_type	false	-	客户自定义字段
spot_plan	false	-	客户自定义字段
spot_plan_record_id	false	-	客户自定义字段
buying_platform	false	-	客户自定义字段
campaign_group	false	-	客户自定义字段
campaign	false	-	客户自定义字段
kpi	false	-	客户自定义字段
site_type	false	-	客户自定义字段
site_name	false	-	客户自定义字段
buying_basis	false	-	客户自定义字段
paid_or_bonus	false	-	客户自定义字段
ext_info_md5_format_type	false	-	客户自定义字段
budgetInput	false	10000	预算录入
freq_capping	false	S0+	频次控制，格式：[S/M][n+/n-][D/W/M]，无需求时填 S0+

注：slot_begin、slot_duration、est_impression、est_click 与 add_slot 互斥，不可同时使用。

请求示例
{
  "campaign_id": "123456",
  "spots": [
    {
      "publisher_name": "youku",
      "channel_name": "channel-a",
      "placement_name": "首页banner-1",
      "placement_type": "display",
      "adposition_type": "",
      "access_token": "1.2YotnFZFEjr1zCsi",
      "slot_begin": "2026-08-01",
      "slot_duration": 30,
      "est_impression": 100000,
      "est_click": 5000
    }
  ]
}
Copy to clipboard
Error
Copied
响应示例

批量接口为 fail-fast + 整批回滚：任一条失败，整批都不落库，results 中不会出现失败项。

{
  "campaign_id": "123456",
  "total": 3,
  "results": [
    {
      "index": 0,
      "spot_id": "12345",
      "spot_id_str": "aB3xY",
      "publisher_id": "1",
      "campaign_id": "123456",
      "keyword": [
        { "keyword_id": "101", "keyword_name": "xxx", "landing_page": "https://…" }
      ]
    },
    {
      "index": 1,
      "spot_id": "12346",
      "spot_id_str": "aB3xZ",
      "publisher_id": "1",
      "campaign_id": "123456"
    }
  ]
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

{
  "error": "invalid_request",
  "error_description": "item[2] vending_model error"
}
Copy to clipboard
Error
Copied

每条失败只有 error、error_description 两个字段。item 级错误在 error_description 中以 item[N]（N 为 0 起下标）标明出错位置；批级错误无该前缀。

错误码总表

error 错误码	HTTP 状态	含义
invalid_request	400	请求参数非法 / 校验失败 / 超出上限 / 请求体解析失败
access_denied	400	access_token 无效或活动无查看权限
campaign_busy	400	同一活动并发创建排队超 60 秒
server_error	500	落库 DB 异常或其他未预期异常

注意事项

顺序保证：数据库将严格按照 JSON 数组中的点位顺序写入，请业务侧按排期顺序构造数组。
并发控制：虽然接口支持并发请求，但建议对同一 campaign_id 的并发操作进行业务层排队，避免数据竞争。
事务性：整个请求将作为一个事务处理，任一点位失败则全部回滚。
超时设置：单次请求包含最多 3000 个点位，建议客户端设置合理超时时间（如 60 秒）。
必填校验：所有标注 true 的字段必须提供，否则请求失败。
枚举值大小写：请严格按照文档中的枚举值填写（如 display、video，注意 QR-Code 的连字符）。
创建和发布目标人群
请求地址

POST /cms/v1/campaigns/publish_target

参数
名称	必选	示例	描述
campaign_id	true	12	广告活动ID
target_name	true	F24〜29Y	目标人群名称，不能为空。建议在一个广告活动中使用唯一的名称。
tag_id	true	34,56	目标人群的标签。可使用List Panels列出所有可用的标签ID。
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例

如果成功，将返回新发布的target_id。

 {
 "target_id": "6",
"target_name": "F20-24Y",
 "panel_id": "china-123"
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "is wrong.",
 "error_description": "The 'target_name' has been existed in this campaign."
}
Copy to clipboard
Error
Copied
创建活动排期
请求地址

POST /cms/v1/campaigns/create_spot_with_plan

参数
名称	必选	示例	描述
campaign_id	true	123	广告活动ID
publisher_name	true	Yahoo	媒体名称
channel_name	true	News	关键词点位填写Bidding word（“B”必需大写）
placement_name	true	123	广告位名称
placement_type	false	display	广告素材类型，必须是以下之一：display（默认）video，text，others，QR-Code，search
program_purchasing_type	false	通投	通投/按频道采买/按剧目采买
program	false	aaaaa	剧目名称，可使用List Program列出所有可用的剧目名称，可填写多个，以“,”分割。
keyword	false	牛奶^https://www.baidu.com>母乳^https://www.baidu.com	关键词，keyword字段为数组形式，包含keyword_name和landingpage，如landingpage不填，形式为牛奶^>母乳^。不同数组以>分隔。
tracking_timing	false	0	Video广告位置，用于发送监测请求的预期时间，Video类型广告位的默认值：1s，非video类型广告位无默认值。
linked_siteid	false	345	关联的秒针分析站点ID，如果需要秒针分析的归因，请务必填写
market	false	北京市	地域定向
vending_model	false	程序化购买-PDB	广告投放方式，一级投放方式与二级投放方式间用"-"分隔
adposition_type	false	常规Banner	广告位类型，可使用List plmttpe列出所有可用的广告位类型。
referrer_url	false	http://www.ads.com	广告所在页网址
landing_page	false	http://www.wtf.com	目标链接地址，点击广告所跳转的落地页
dangerous_source_filtration	false	1	必须是1或0，表示是否过滤可疑高危来源的流量，keywords点位默认值为0，其余点位默认值为1。 若无特殊监测需求（如S2S），请输入1。
report_metrics	false	impression	必须是以下之一：impression，click，impression+click
caguid	false	SP-CH1900861	客户活动ID
guid	false	13027990	客户点位ID
customize	false	公关_母品牌	自定义列
description	false	PC/A版素材	描述信息
slot_begin	false	2013-11-11	广告位排期开始时间,格式：YYYY-MM-DD
slot_duration	false	30	广告排期持续时间（以天为单位）。
est_impression	false	100	预估总曝光
est_click	false	10000	预估总点击
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
other_impr_tracking_tag	false	http://www.xxxxx.com	其他公司曝光代码，必须以http://或https://开头
shop_id	false	123456	ShopID
category	false		客户自定义字段
brand	false		客户自定义字段
product	false		客户自定义字段
copy_name	false		客户自定义字段
buying_model	false		客户自定义字段
buying_model_subtype	false		客户自定义字段
media_subtype	false		客户自定义字段
general_buyingtype	false		客户自定义字段
spot_type	false		客户自定义字段
spot_plan	false		客户自定义字段
spot_plan_record_id	false		客户自定义字段
buying_platform	false		客户自定义字段
campaign_group	false		客户自定义字段
campaign	false		客户自定义字段
kpi	false		客户自定义字段
site_type	false		客户自定义字段
site_name	false		客户自定义字段
buying_basis	false		客户自定义字段
paid_or_bonus	false		客户自定义字段
ext_info_md5_format_type	false		客户自定义字段
budgetInput	false	10000	预算录入
响应示例

如果成功，将返回新创建的spot_id。

如同时创建了关键词 ，将返回关键词的keyword_id、keyword_name、landing_page。

{
"campaign_id": "123",
"spot_id": "40",
"spot_id_str": "e",
"publisher_id": "1"
"keyword": [
   {
       "keyword_id": 22050057,
       "landing_page": "https://www.baidu.com",
       "keyword_name": "牛奶"
   },
   {
       "keyword_id": 22050058,
       "landing_page": "https://www.baidu.com",
       "keyword_name": "母乳"
   }
]
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "invalid_placement_name",
"error_description": "The 'placement_name' should not be empty."
}
Copy to clipboard
Error
Copied
广告活动 - 删除数据
删除广告活动
请求地址

POST /cms/v1/campaigns/delete

参数
名称	必选	示例	描述
campaign_id	true	123	广告活动ID
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例

如果成功，campaign_id将被删除。

 {
"campaign_id": "123"
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "invalid_campaign_id",
"error_description": "The 'campaign_id' cannot be found."
}
Copy to clipboard
Error
Copied
删除广告活动点位
请求地址

POST /cms/v1/campaigns/delete_spot

参数
名称	必选	示例	描述
campaign_id	true	123	广告活动ID
spot_id	true	40	点位ID
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例

如果成功，spot_id将被删除。

 {
"campaign_id": "123",
"spot_id": "40",
"spot_id_str": "e"
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "invalid_spot_id",
"error_description": "The 'spot_id' cannot be found."
}
Copy to clipboard
Error
Copied
广告活动 - 更新广告相关信息
更新广告活动
请求地址

POST /cms/v1/campaigns/update

参数
名称	必选	示例	描述
campaign_id	true	1	广告活动ID
campaign_type	false	admonitor	系统默认，无需输入
campaign_name	false	test	广告活动名称，不能为空。若与已有活动名称重复，将会自动添加编号
start_date	false	2012-12-20	YYYY-MM-DD，不得早于当天。需同end_date一起输入
end_date	false	2013-01-05	YYYY-MM-DD，不得早于start_date。需同start_date一起输入
advertiser_id	false	1	广告主ID。可使用List Advertisers列出所有可用的广告主ID。
agency_id	false	1	代理商ID。可使用List_Agencies列出所有可用的代理机构ID。
brand_id	false	1	品牌ID。可使用查询List Brands 广告主ID下的所有品牌ID。如传品牌ID则广告主ID必填，且保证品牌ID与广告主ID的关联关系准确
wares	false	china -123	商品信息，格式：广告主|品牌名称|商品名称。
linked_siteids	false	china -123	关联的秒针分析站点ID，多个用";"隔开
slot_type	false	search	排期类型，必须是以下之一：dispaly(默认)，search，display+search
description	false	CampaignDesc	描述信息
linked_tvcaids	false	[123,456]	关联的TVMonitor活动ID
extensiontype	false	品牌形象活动-品牌形象	推广类型
play_detect	false	1	内容监测，默认0，如需监测填写1
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例

如果成功，将返回更新的campaign_id。

 {
"campaign_id": "123"
}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "invalid_campaign_id",
"error_description": "The 'campaign_id' cannot be found."
}
Copy to clipboard
Error
Copied
更新广告活动点位
请求地址
POST /cms/v1/campaigns/update_spot
Copy to clipboard
Error
Copied
参数
名称	必选	示例	描述
campaign_id	true	123	广告活动ID
spot_id	true	3	点位ID
publisher_name	false	3	媒体名称
placement_name	false	header	广告位名称
channel_name	false	news	频道
placement_type	false	display	广告素材类型，必须是以下之一：display（默认）video，text，others，QR-Code，search
program_purchasing_type	false	通投	通投/按频道采买/按剧目采买
program	false	aaaaa	剧目名称，可使用List Program列出所有可用的节目名称。
add_keyword	false	牛奶^https://www.baidu.com>母乳^https://www.baidu.com	新增关键词。keyword字段为数组形式，包含keyword_name和landingpage，如landingpage不填，形式为牛奶^>母乳^。不同数组以>分隔。
update_keyword	false	18372628^牛奶^https://www.baidu.com>18372628^母乳^https://www.baidu.com	变更关键词。keyword字段为数组形式，包含keyword_name和landingpage，如landingpage不填，形式为牛奶^>母乳^。不同数组以>分隔。
landing_page	false	http://www.wtf.com	目标链接地址，点击广告所跳转的落地页
dangerous_source_filtration	false	1	必须是1或0，表示是否过滤可疑高危来源的流量，keywords点位默认值为0，其余点位默认值为1。 若无特殊监测需求（如S2S），请输入1。
market	false	北京市	地域定向
vending_model	false	程序化购买-PDB	广告投放方式，一级投放方式与二级投放方式间用"-"分隔
adposition_type	false	常规Banner	广告位类型，可使用List plmttpe列出所有可用的广告位类型。
report_metrics	false	impression	必须是以下之一：impression，click，impression+click
caguid	false	SP-CH1900861	客户活动ID
guid	false	13027990	客户点位ID
customize	false	公关_母品牌	自定义列
description	false	PC/A版素材	描述信息
access_token	true	1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
add_slot	false	2020-06-30,2020-07-03	增加广告位排期，格式：YYYY-MM-DD，不同日期通过","进行分割
delete_slot	false	2020-06-30,2020-07-03	删除广告位排期，格式：YYYY-MM-DD，不同日期通过","进行分割，对应日期预估曝光、预估点击同时删除
update_slot	false	2020-06-30,2020-07-03	更新广告位排期预估值，格式：YYYY-MM-DD，不同日期通过","进行分割。配合est_impression参数、est_click参数使用，修改对应日期的预估值。同一请求中不可同时存在add_slot参数和update_slot参数
est_impression	false	10000,10000	预估曝光，通过","进行分割
est_click	false	100,100	预估点击，通过","进行分割
other_impr_tracking_tag	false	http://www.xxxxx.com	其他公司曝光代码，必须以http://或https://开头
shop_id	false	123456	ShopID
category	false		客户自定义字段
brand	false		客户自定义字段
product	false		客户自定义字段
copy_name	false		客户自定义字段
buying_model	false		客户自定义字段
buying_model_subtype	false		客户自定义字段
media_subtype	false		客户自定义字段
general_buyingtype	false		客户自定义字段
spot_type	false		客户自定义字段
spot_plan	false		客户自定义字段
spot_plan_record_id	false		客户自定义字段
buying_platform	false		客户自定义字段
campaign_group	false		客户自定义字段
campaign	false		客户自定义字段
kpi	false		客户自定义字段
site_type	false		客户自定义字段
site_name	false		客户自定义字段
buying_basis	false		客户自定义字段
paid_or_bonus	false		客户自定义字段
ext_info_md5_format_type	false		客户自定义字段
响应示例

如果成功，将返回更新的spot_id。

如更新关键词，将返回更新关键词的keyword_id、keyword_name、landing_page。

{
"campaign_id": "123",
"spot_id": "40",
"spot_id_str": "e"
"add_keyword":[
     {
       "keyword_id": 4018469,
       "keyword_name": "牛奶"
       "landing_page": https://www.baidu.com/
     }
   ]
"update_keyword":[
     {
       "keyword_id": 4018470,
       "keyword_name": "母乳"
       "landing_page": https://www.baidu.com/
     }
   ]

}
Copy to clipboard
Error
Copied

如果失败，将返回error。有关细节请参阅错误响应格式

HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error": "invalid_spot_id",
"error_description": "The 'spot_id' cannot be found."
}
Copy to clipboard
Error
Copied
CMS / Misc API

活动管理系统（CMS）是一款用于管理秒针系统元数据的产品，如活动、Panel和地域。例如，提供广告活动ID，可通过CMS API查询广告活动名称和广告活动点位列表。

Panels
显示panel
请求地址

GET /cms/v1/panels/show

参数
名称	必选	格式	示例	描述
panel_id	true	ID	“china-123”	活动所关联的人群样本库ID
lang	false	LANG	cn	显示LANG语言的type_name和tag_name。en（默认）：英文，cn：中文。
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例
{
"panel_id": "china-123",
"type_list": 
[
  {
      "type_id": "gender",
      "type_name": "性别"
  },
  {
      "type_id": "age",
      "type_name": "年龄"
  },
  ...
],
"tag_list":
[
  {
      "type_id": "gender",
      "tag_id": "male",
      "tag_name": "男"
  },
  {
      "type_id": "gender",
      "tag_id": "female",
      "tag_name": "女"
  },
  {
      "type_id": "age",
      "tag_id": "20-24Y",
      "tag_name": "20-24岁"
  }
  ...
]
}
Copy to clipboard
Error
Copied
列出panel

列出所有panel。

请求地址

GET /cms/v1/panels/list

参数
名称	必选	格式	示例	描述
panel_id	false	ID1，ID2，...	china-123,test	活动所关联的人群样本库ID，用于搜索，支持批量输入（英文半角逗号分隔）。
platform	false	PTDIM	pc	设定panel平台维度。PTDIM可以是pc（默认）或pm、pmo。
lang	false	LANG	cn	显示LANG语言的type_name和tag_name。en（默认）：英文，cn：中文。
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500,M为起始行数，N为结果条数
order_asc	false	NAME	panel_id	只能为：panel_id。
order_desc	false	NAME	panel_id	参考 order_asc。
响应示例
[
{
  "panel_id": "china-123",
  "platform": "pc",
  "type_list": 
  [
      {
          "type_id": "gender",
          "type_name": "性别"
      },
      {
          "type_id": "age",
          "type_name": "年龄"
      },
      ...
  ],
  "tag_list":
  [
      {
          "type_id": "gender",
          "tag_id": "male",
          "tag_name": "男"
      },
      {
          "type_id": "gender",
          "tag_id": "female",
          "tag_name": "女"
      },
      {
          "type_id": "age",
          "tag_id": "20-24Y",
          "tag_name": "20-24岁"
      },
      ...
  ]
},
...
]
Copy to clipboard
Error
Copied
地域
显示地域
请求地址

GET /cms/v1/regions/show

参数
名称	必选	格式	示例	描述
region_id	true	ID	00001234	地域ID
lang	false	LANG	cn	显示LANG语言的region_name 。en（默认）：英文，cn：中文。
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例
{
"region_id": "00001234",
"region_name": "SevenKingdom",
"parent_id": "00001200",
"level": 1
}
Copy to clipboard
Error
Copied
名称	类型	描述
region_id	string	地域ID
region_name	string	地域名称
parent_id	string	该地域的父地域ID
level	int	地域等级，顶级是0（全球和国家）
列出地域
请求地址

GET /cms/v1/regions/list

参数
名称	必选	格式	示例	描述
region_id	false	ID1，ID2，...	2,3,4	地域ID，用于搜索，支持批量输入（英文半角逗号分隔）。
parent_id	false	ID1，ID2，...	2,3,4	该地域的父地域ID，用于搜索，支持批量输入（英文半角逗号分隔）。
level	false	LV1，LV2，...	0,1	地域等级，用于搜索，支持批量输入（英文半角逗号分隔）。
region_name	false	PATTERN	beij	地域名称，用于搜索，支持批量输入
lang	false	LANG	cn	显示LANG语言的region_name。en（默认）：英文，cn：中文。
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500，M为起始行数，N为结果条数
order_asc	false	NAME	region_id	只可能是其中之一：region_id，parent_id，level。
order_desc	false	NAME	parent_id	参考order_desc。

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
  "region_id": "00001234",
  "region_name": "SevenKingdom",
  "parent_id": "00001200",
  "level": 1
},
...
]
Copy to clipboard
Error
Copied
广告主
显示广告主
请求地址

GET /cms/v1/advertisers/show

参数
名称	必选	格式	示例	描述
advertiser_id	true	ID	1	广告主ID
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例
{
"advertiser_id": "1",
"advertiser_name": "NASA"
}
Copy to clipboard
Error
Copied
列出广告主
请求地址

GET /cms/v1/advertisers/list

参数
名称	必选	格式	示例	描述
advertiser_id	false	ID1，ID2，...	2,3,4	广告主ID，用于搜索，支持批量输入（英文半角逗号分隔）。
advertiser_name	false	PATTERN	beij	广告主名称，用于搜索，
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500,M为起始行数，N为结果条数
order_asc	false	NAME	advertiser_id	只可能是以下其中之一：advertiser_id，advertiser_name。
order_desc	false	NAME	advertiser_id	参考order_desc。

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
  "advertiser_id": "1",
  "advertiser_name": "NASA"
},
...
]
Copy to clipboard
Error
Copied
品牌
显示品牌
请求地址

GET /cms/v1/brands/show

参数
名称	必选	格式	示例	描述
brand_id	true	ID	1	品牌ID
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例
{
"brand_id": "1",
"brand_name": "xxxx"
}
Copy to clipboard
Error
Copied
列出品牌
请求地址

GET /cms/v1/brands/list

参数
名称	必选	格式	示例	描述
advertiser_id	true	ID	2	广告主ID（需使用父级广告主ID），用于限定查询广告主ID
brand_id	false	ID	1	品牌ID，用于搜索
brand_name	false	name	aaaa	品牌名称，用于搜索
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
"brand_id": "1",
"brand_name": "xxxx"
},
...
]
Copy to clipboard
Error
Copied
商品
列出商品信息
请求地址

GET /cms/v1/product/list

参数
名称	必选	格式	示例	描述
product_name	false	PATTERN	aaaa	商品名称,用于搜素
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500，M为页数，N为结果条数。2,100 表示每页100条，查第二页。
响应示例
{
"name": "xxxx"
}
Copy to clipboard
Error
Copied
代理商
显示代理商
请求地址

GET /cms/v1/agencies/show

参数
名称	必选	格式	示例	描述
agency_id	true	ID	1	代理商ID
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
响应示例
{
"agency_id": "1",
"agency_name": "AgencyX"
}
Copy to clipboard
Error
Copied
列出代理商
请求地址

GET /cms/v1/agencies/list

参数
名称	必选	格式	示例	描述
agency_id	false	ID1，ID2，...	2,3,4	代理商ID，用于搜索，支持批量输入（英文半角逗号分隔）
agency_name	false	PATTERN	beij	代理商名称，用于搜索，
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500,M为起始行数，N为结果条数
order_asc	false	NAME	agency_id	只可能是其中之一：agency_id，agency_name。
order_desc	false	NAME	agency_id	参考order_desc。

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
[
{
    "agency_id": "1",
    "agency_name": "AgencyX"
},
...
]
Copy to clipboard
Error
Copied
剧目
列出剧目名称
请求地址

GET /cms/v1/programs/list

参数
名称	必选	格式	示例	描述
program_name	false	PATTERN	aaaa	剧目名称,用于搜素
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500，M为页数，N为结果条数。2,100 表示每页100条，查第二页。
响应示例
{
"name": "xxxx"
}
Copy to clipboard
Error
Copied
广告位类型
列出广告位类型
请求地址

GET /cms/v1/plmttype/list

参数
名称	必选	格式	示例	描述
plmt_type_name	false	PATTERN	富媒体Banner	广告位类型名称,用于搜素
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500，M为页数，N为结果条数。2,100 表示每页100条，查第二页。
响应示例
{
"name": "xxxx"
}
Copy to clipboard
Error
Copied
推广类型
列出推广类型
请求地址

GET /cms/v1/extensiontype/list

参数
名称	必选	格式	示例	描述
extensiontype_name	false	PATTERN	品牌形象活动-品牌形象	推广类型名称,用于搜素
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数。格式：M,N，默认为0,500，M为页数，N为结果条数。2,100 表示每页100条，查第二页。
响应示例
{
"name": "品牌形象活动-品牌形象"
}
Copy to clipboard
Error
Copied
AdMonitor / Reports API

AdMonitor 是广告监测产品，通过活动 ID 查询广告数据报告。

基础数据报告
请求地址

GET /admonitor/v1/reports/basic/show

参数
名称	必选	格式	示例	描述
date	true	YYYY-MM-DD	2012-12-25	截止日期
campaign_id	true	ID	2	广告活动ID
by_position	false	PDIM	publisher	设定报告活动维度。PDIM可以是campaign（默认，分活动）,publisher（分媒体）或spot（分广告位）或keyword（分关键词）。
by_audience	false	ADIM	stable	设定报告受众人群维度。ADIM可以是overall（默认，所有网民）,stable（稳定人群）或target（目标人群）。
by_region	false	RDIM	level 1	设定报告地域维度。RDIM可以是level0（默认，全球和中国大陆），level1（省级）或level2（地级市级）。
platform	false	PTDIM	pc	设定报告平台维度。PTDIM可以是pc（默认），pm，mb（移动）。
publisher_id	false	ID1，ID2，...	1,2,3	媒体ID，支持批量输入（英文半角逗号分隔）。仅当by_position=publisher或by_position=spot或by_position=keyword时，才有效。
spot_id	false	ID1，ID2，...	22,23	点位ID，支持批量输入（英文半角逗号分隔）。仅当by_position=spot或by_position=keyword时，才有效。
keyword_id	false	ID1，ID2，...	4018469, 4018470,…	关键词ID，支持批量输入（英文半角逗号分隔）。仅当by_position=keyword时，才有效。
target_id	false	ID1，ID2，...	22,23	目标人群ID，支持批量输入（英文半角逗号分隔）。仅当by_audience=target时，才有效。
region_id	false	ID1，ID2，...	22,23	地域ID，支持批量输入（英文半角逗号分隔）。
metrics	false	MSCO	all	设定返回指标的范围。MSCO可能是acc（默认，累计维度），day（单天维度），avg_day（平均单天维度），acc_hrs（分小时累计维度） 或者 all。
sdk	false	sdk	all	设定sdk的类型。只有在platform = mb，metrics = all或metrics = acc和by_position = campaign或by_position = publisher时，才有效。SDK可以是all（默认）mm（MMA SDK）或mz（秒针SDK）。
filtration_type	false		net	设定过滤类型。枚举值：net或totalnet；默认为net
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数，仅当by_position=publisher或by_position=spot或by_position=keyword时有效。格式：M,N，默认为0,500，M为起始序号（默认序号第一位为0），N为结果中的spot个数。
order_asc	false	NAME	spot_id	可以是任何属性名称或指标名称。
order_desc	false	NAME	imp_day	可以是任何属性名称或指标名称。
with_null	false	INT	0	输入1时会返回查询结果为null的指标维度，默认不输出结果为null的item。

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

当by_audience=overall时才可查询关键词数据，如输入条件不满足则keyword数据为空。

响应示例
{
"campaign_id": 1,
"date": "2012-10-20",
"version": "V1.0",
"platform": "pc",
"total_spot_num": 123
"items":
[
{
 "attributes":
 {
     "audience": "target",
     "target_id": "1",
     "publisher_id": "1",
     "spot_id": "40",
     "spot_id_str": "e",
     "region_id": "00001234",
     "universe": 12345
},
"metrics":
{
     "imp_acc": 0,
     "clk_acc": 0,
     "uim_acc": 0,
     "ucl_acc": 0,
     "imp_day": 0,
     "clk_day": 0,
     "uim_day": 0,
     "ucl_day": 0,
    "imp_avg_day": 0,
     "clk_avg_day": 0,
     "uim_avg_day": 0,
     "ucl_avg_day": 0,
     "imp_acc_h00": 0,
     "clk_acc_h00": 0
      ...
}
},
...
]
}
Copy to clipboard
Error
Copied
名称	类型	描述
audience	string	报告受众人群维度，overall（所有网民）或stable（稳定人群）或target（目标人群）。
target_id	string	目标人群ID，当by_audience=target时，可用。
publisher_id	string	媒体ID，当by_position=publisher或by_position=spot或by_position=keyword时，可用
spot_id	string	点位ID，当by_position=spot或by_position=keyword时，可用
keyword_id	string	关键词ID，当by_position=keyword时，可用
region_id	string	地域ID。
imp_acc	int	累计的曝光。当metrics=acc或metrics=all时，可用。
clk_acc	int	累计的点击。当metrics=acc或metrics=all时，可用。
uim_acc	int	累计的独立访问者（UV）。当metrics=acc或metrics=all时，可用。
ucl_acc	int	累计的点击人数（clicker）。当metrics=acc或metrics=all时，可用。
imp_day	int	当天的曝光。当metrics=day或metrics=all时，可用。但当by_audience=target时无效。
clk_day	int	当天点击。当metrics=day或metrics=all时，可用。但当by_audience=target时无效。
uim_day	int	当天的UV。当metrics=day或metrics=all时，可用。但当by_audience=target时无效。
ucl_day	int	当天的clicker。当metrics=day或metrics=all时，可用。但当by_audience=target时无效。
imp_avg_day	int	每日平均曝光量。当metrics=avg_day或metrics=all时，可用。
clk_avg_day	int	平均每日点击量。当metrics=avg_day或metrics=all时，可用。
uim_avg_day	int	平均每日UV。当metrics=avg_day或metrics=all时，可用。
ucl_avg_day	int	平均每日clicker。当metrics=avg_day或metrics=all时，可用。
imp_acc_h00	int	00:00 - 00:59累计的曝光。当metrics=acc_hrs或metrics=all时，可用。
imp_acc_h23	int	23:00 - 23:59累计的曝光。当metrics=acc_hrs或metrics=all时，可用。
clk_acc_h00	int	00:00 - 00:59累计的点击。当metrics=acc_hrs或metrics=all时，可用。
clk_acc_h23	int	23:00 - 23:59累计的点击。当metrics=acc_hrs或metrics=all时，可用。
total_spot_num	int	本次请求涉及的spot个数总量，使用limit分页时应参考该指标，对于输入的limit值，M小于该指标且M+N不超过该指标即可。
实时数据报告
请求地址

GET /admonitor/v1/reports/realtime/show

参数
名称	必选	格式	示例	描述
date	true	YYYY-MM-DD	2012-12-25	日期
campaign_id	true	ID	2	广告活动ID
by_position	false	PDIM	publisher	设定报告活动维度。PDIM可以是campaign（默认，分活动）,publisher（分媒体）或spot（分广告位）。
platform	false	PTDIM	pc	设定报告平台维度。PTDIM可为pc（默认）或pm，mb（移动）。
publisher_id	false	ID1，ID2，...	1,2,3	媒体ID，支持批量输入（英文半角逗号分隔）。仅当by_position=publisher或by_position=spot，才有效。
spot_id	false	ID1，ID2，...	22,23	点位ID，支持批量输入（英文半角逗号分隔）。仅当by_position=spot，才有效
metrics	false	MSCO	All	设定返回指标的范围。MSCO可以是day（默认，单天维度），hrs（分小时维度）或all（全部）。
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数，仅当by_position=publisher或by_position=spot或by_position=keyword时有效。格式：M,N，默认为0,500，M为起始序号（默认序号第一位为0），N为结果中的spot个数。
order_asc	false	NAME	spot_id	可以是任何属性名称或指标名称。
order_desc	false	NAME	imp_day	可以是任何属性名称或指标名称。

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）；目前的实时报告仅提供全球的所有网民的数据。

响应示例
{
"campaign_id": 1,
"date": "2012-10-20",
"platform": "pc",
"total_spot_num": 123,
"items":
[
{
 "attributes":
 {
     "audience": "overall",
     "region_id": "000000000000",
     "publisher_id": "2",
     "spot_id": "40",
     "spot_id_str": "e"
 },
 "metrics":
 {
     "imp_day": 123000,
     "clk_day": 754,
     "imp_h00": 21,
     "clk_h00": 1,
     ...
     "imp_h23": 56,
     "clk_h23": 1
 }
},
...
]
}
Copy to clipboard
Error
Copied
名称	类型	描述
audience	string	报告受众人群维度，只有overall（所有网民） 。
region_id	string	地域ID。
publisher_id	string	媒体ID，当是by_position=publisher或by_position=spot，可用。
spot_id	string	点位ID，当是by_position=spot，可用。
spot_id_str	string	spot_id的62进制字符串表示形式。
imp_day	int	当天的曝光。当是metrics=day或metrics=all，可用
clk_day	int	当天的点击。当是metrics=day或metrics=all，可用。
imp_h00	int	当天00:00 - 00:59的曝光。当是metrics=hrs或metrics=all，可用。
imp_h23	int	当天23:00 - 23:59的曝光。当是metrics=hrs或metrics=all，可用。
clk_h00	int	当天00:00 - 00:59的点击。当是metrics=hrs或metrics=all，可用。
clk_h23	int	当天23:00 - 23:59的点击。当是metrics=hrs或metrics=all，可用。
total_spot_num	int	本次请求涉及的spot个数总量，使用limit分页时应参考该指标，对于输入的limit值，M小于该指标且M+N不超过该指标即可。
到达人群报告
请求地址

GET /admonitor/v1/reports/reach/show

参数
名称	必选	格式	示例	描述
date	true	YYYY-MM-DD	2012-12-25	截止日期
campaign_id	true	ID	2	广告活动ID
by_position	false	PDIM	publisher	设定报告活动维度。PDIM可以是campaign（默认，分活动）,publisher（分媒体）或spot（分广告位）。
by_audience	false	ADIM	stable	设定报告受众人群维度。ADIM可以是overall（默认，所有网民）,stable（稳定人群）或target（目标人群）。
by_region	false	RDIM	level 1	设定报告地域维度。RDIM可以是level0（默认，全球和中国大陆），level1（省级）或level2（地级市级）。
platform	false	PTDIM	PC	设定报告平台类型维度。PTDIM可能是pc（默认）或pm，mb（移动）。
publisher_id	false	ID1，ID2，...	1,2,3	媒体ID，支持批量输入（英文半角逗号分隔）。只有在by_position=publisher或by_position=spot
spot_id	false	ID1，ID2，...	22,23	点位ID，支持批量输入（英文半角逗号分隔）。仅当by_position=spot时，才有效。
target_id	false	ID1，ID2，...	22,23	目标人群ID，支持批量输入（英文半角逗号分隔）。仅当by_audience=target时，才有效。
region_id	false	ID1，ID2，...	22,23	地域ID，支持批量输入（英文半角逗号分隔）。
metrics	false	MSCO	all	设定返回指标的范围。MSCO可以是all（默认），acc（累计维度）或spl（相交样本量）。
filtration_type	false		net	设定过滤类型。枚举值：net或totalnet；默认为net。
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
limit	false	M，N	0,2	用于限制返回结果条数，仅当by_position=publisher或by_position=spot或by_position=keyword时有效。格式：M,N，默认为0,500，M为起始序号（默认序号第一位为0），N为结果中的spot个数。
order_asc	false	NAME	spot_id	可以是任何属性名称或指标名称。
order_desc	false	NAME	imp_acc	可以是任何属性名称或指标名称。
with_null	false	INT	0	输入1时会返回查询结果为null的指标维度，默认不输出结果为null的item。

注意：如果指定了多个搜索条件参数，则仅返回满足所有条件的项（AND逻辑）。

响应示例
{
"campaign_id": 1,
"date": "2012-10-20",
"version": "V1.0",
"platform": "pc",
"total_spot_num": 123,
"items":
[
{
 "attributes":
 {
     "target_id": "1",
     "publisher_id": "1",
     "region_id": "12345678",
     "universe": 360000
}
"metrics":
{
     "imp_acc": 0,
     "grp_acc": 0,
     "rch_acc_p01": 0,
     ...
     "rch_acc_p10": 0,
     "rch_spl_p01": 0,
     ...
     "rch_spl_p10": 0
}
},
...
]
}
Copy to clipboard
Error
Copied
名称	类型	描述
imp_acc	int	累计的曝光。 当是metrics=acc或metrics=all时，可用。
grp_acc	int	累计的GRP。 当是metrics=acc或metrics=all时，可用。
rch_acc_p01	int	累积1+到达。 当是metrics=acc或metrics=all时，可用。
rch_acc_p10	int	累积10+到达。 当是metrics=acc或metrics=all时，可用。
rch_spl_p01	int	1+到达相交样本量。 当是metrics=spl或metrics=all时，可用。
rch_spl_p10	int	10+到达相交样本量 。当是metrics=spl或metrics=all时，可用。
total_spot_num	int	本次请求涉及的spot个数总量，使用limit分页时应参考该指标，对于输入的limit值，M小于该指标且M+N不超过该指标即可。
活动计算进度
请求地址

GET /admonitor/v1/reports/basic/progress

参数
名称	必选	格式	示例	描述
campaign_id	true	ID	2	广告活动ID
access_token	true		1.2YotnFZFEjr1zCsi	用于验证登录的访问令牌串
filtration_type	false		net	过滤类型，枚举值：net（默认），totalnet
响应示例
{
"date": "2023-01-04",
"campaign_id": 2
}
Copy to clipboard
Error
Copied
名称	类型	描述
date	string	已完成计算的最新日期


## ==================== TV Monitor API ====================

Monitor API

首页

接口 API

AdMonitor API
TV Monitor API
API协议
接口详情
API权限
配置信息
广告活动查询
广告活动管理
广告数据报告
附录
秒针多维查询 API 使用指南
TV Monitor API

本文档由旧文档站 https://docs.cn.miaozhen.com/TV-api.html 迁移整理而来，涵盖 TVMonitor 产品的接口协议、鉴权方式及全部接口定义。

API协议
API请求

通过向API接口发送HTTP请求来访问Miaozhen API。除非另有说明，URL是以Miaozhen API域名**https://api-tvmonitor.cn.miaozhen.com开头的HTTP**协议。

用于检索数据的API需要使用URL的查询字符串中的参数进行GET请求。创建、更新或删除数据的API需要HTTP中包含参数的POST请求。字符集为UTF-8。

API响应
成功响应

成功的HTTP响应为HTTP 200（OK）状态代码，其中显示JSON对象的纯文本正文，字符集UTF-8。

响应示例
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{
"error_code": 0,
"error_message": "success"
}
Copy to clipboard
Error
Copied
错误响应

在客户端错误或服务器端错误的情况下，响应将分别是HTTP 400（错误请求）或500（内部服务器错误）状态代码（如果使用suppress_response_codes，得到的是200）。响应正文将是一个JSON的错误对象，包括参数error来简要介绍错误，在API中可能出现error_message和error_code。

错误码分类

0 : 正常

1xxxx : 权限错误

2xxxx : 输入错误

3xxxx : 内部错误

响应示例
HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
{
"error_code": 2001,
"error_message": "access_token 是无效的"
}
Copy to clipboard
Error
Copied
接口详情

基本信息：指与活动/点位状况无关的信息

token
状态	请求地址	请求方式	描述
ON	/monitortv/v1/token/get	POST	获取token
联通状态测试
状态	请求地址	请求方式	描述
ON	/monitortv/v1/test	GET	用于验证api测试联通接口
获取固定配置信息
状态	请求地址	请求方式	描述
ON	/monitortv/v1/config/message/list	GET	获取媒体信息/地域信息
获取剧目名称信息
状态	请求地址	请求方式	描述
ON	/monitortv/v1/programs/list	GET	获取剧目名称信息
广告活动
状态	请求地址	请求方式	描述
ON	/monitortv/v1/campaign/info	GET	获取指定活动
ON	/monitortv/v1/campaigns/list	GET	获取用户账户下所有活动
ON	/monitortv/v1/spot/list	GET	获取指定活动的点位信息
ON	/monitortv/v1/spot/info	GET	获取指定活动的指定点位
ON	/monitortv/v1/spot/code	POST	监测代码获取
ON	/monitortv/v1/campaign/saveorupdate	POST	创建/修改广告活动
ON	/monitortv/v1/spot/saveorupdate	POST	创建/修改点位信息
ON	/monitortv/v1/spot/attach/info	GET	获取指定点位的其他信息
ON	/monitortv/v1/campaign/target/info	GET	获取指定活动的TA信息
ON	/monitortv/v1/campaign/target/publish	POST	在指定活动中创建并发布目标人群
指标数据
状态	请求地址	请求方式	描述
ON	/monitortv/v1/reports/realtime/show	GET	实时数据获取
ON	/monitortv/v1/reports/basic/show	GET	基础数据获取
ON	/monitortv/v1/reports/reach/show	GET	到达效果获取
ON	/monitortv/v1/reports/basic/progress	GET	活动计算进度查询
API权限
获取Token
请求地址

/monitortv/v1/token/get

参数
名称	类型	是否必填	描述
username	String	true	用户名
password	String	true	密码
响应示例
{
"error_code": 0,
"error_message": "success",
 "result": 
 {
 "access_token": "2.DZZ4PTMVpFc2WBoMbGl1eGlhbmdkb25nIgptei1tb25pdG9abcdefgFcNuxOLc8avUc06tv5j5OjaYmxDAhREM4PcCyzZX2wW-nLi53DeUrgang"
 }                              
}
Copy to clipboard
Error
Copied
测试联通状态
请求地址

monitortv/v1/test

响应示例
{
"error_code": 0,
"error_message": "connect success ",
"result": null                          
}
Copy to clipboard
Error
Copied
配置信息
获取固定配置信息
请求地址

/monitortv/v1/config/message/list

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
type	String	true	获取配置的种类；publisher（default）、region、extension（推广类型）、panel
响应示例
{
"error_code": 0,
    "error_message": "success",
    "result": 
    [{
        "name": "XX超级电视",
        "id": 1
    },
    …………
    {
        "name": "XXOTT",
        "id": 100}
    ]                               
}
Copy to clipboard
Error
Copied
获取剧目名称信息
请求地址

/monitortv/v1/programs/list

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
program_name	String	false	剧目名称,用于搜素
limit	String	false	用于限制返回结果条数。格式：M,N，默认为0,500，M为页数，N为结果条数。2,100 表示每页100条，查第二页。
响应示例
{
"name": "xxxx"
}
Copy to clipboard
Error
Copied
广告活动查询
获取指定活动信息

/monitortv/v1/campaign/info

参数
名称	类型	是否必填	描述
access_token	String	true	获取的token
campaign_id	int	true	活动id
dm_info	int	false	0：默认，不反回dm需要的相关参数; 1：返回dm需要的相关参数("ear","panel")
响应示例
{
"error_code": 0,
"error_message": "success",
"result": {
"campaign_id": 4002908,
        "campaign_name": "这是一个测试活动",
    "description": "",
    "created_time": "2019-10-12 11:14:02",
        "advertiser": "N/A",
        "brand": "N/A",
        "agency": "N/A",
    "start_time": "2019-10-14",
    "end_time": "2020-01-01",
    "status": going
}                           
}
Copy to clipboard
Error
Copied
获取用户账户下的所有活动

/monitortv/v1/campaigns/list

参数
名称	类型	是否必填	描述
access_token	String	true	获取的token
dm_info	int	1	0：默认，不反回dm需要的相关参数; 1：返回dm需要的相关参数("ear","panel")
pageSize	int	false	单页大小，最大50，默认15
pageNo	int	false	第几页，默认第一页
searchKey	String	false	caid,caName,creator,advertiser 默认空
searchValue	String	false	默认空
响应示例
{
"error_code": 0,
"error_message": "success",
"result": {
   "campaigns": [
    {
       "campaign_id": 4002908,
       "campaign_name": "这是一个测试活动",
        "description": "",
        "created_time": "2019-10-12 11:14:02",
            "advertiser": "N/A",
            "brand": "N/A"
        "start_time": "2019-10-14",
        "end_time": "2020-01-01",
       "status": "going"
    },
    {
       "campaign_id": 4002807,
       "campaign_name": "第二个测试活动",
       "description": null,
       "created_time": "2019-09-20 17:31:10",
            "advertiser": "N/A",
            "brand": "N/A",
        "agency": "N/A",
       "start_time": "2019-09-20",
       "end_time": "2019-12-31",
       "status": "going"
    }
 ],
 "totalRecordNo": 2,
 "totalPageNo": 1
}

}
Copy to clipboard
Error
Copied
获取指定活动的点位信息

/monitortv/v1/spot/list

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	true	活动id
dm_info	int	false	1，显示点位的CMK、剧目等信息
响应示例
{
    "error_code": 0,
    "error_message": "success",
    "result": [
        {
            "spid_str": "e",
            "caid": 4000000,
            "created_time": "2025-09-16 17:39:18.0",
            "placement": "PreRoll 15s",
            "channel_name": "ANYANG",
            "pub_id": 5,
            "publisher": "test",
            "description": "test",
            "ad_type": "开机视频",
            "frequency": "0",
            "customize": "test",
            "category": "test",
            "brand": "test",
            "product": "test",
            "copyname": "test",
            "buyingregular": "",
            "buyingsub": "",
            "mediasub": "",
            "generalbuying": "",
            "spottype": "",
            "spotplan": "test3",
            "spot_plan_record_id": "test9",
            "caguid": "",
            "guid": "",
            "play_detect": 0,
            "celebrity_stids": null,
            "playinfo_stids": null,
            "spots_display_type": null,
            "mm_channe_id": null,
            "play_info": null,
            "region_id": "ANYANG",
            "tag_place": "开始",
            "multi_tag": "1",
            "program": "test",
            "buying_platform": "",
            "campaign_group": "",
            "campaign": "",
            "kpi": "",
            "site_type": "",
            "site_name": "",
            "buying_basis": "",
            "paid_or_bonus": "",
            "placement_type": "video",
            "program_purchasing_type": "按剧目采买",
            "purchasing_type": "程序化购买"
        }
Copy to clipboard
Error
Copied
获取指定活动指定点位

/monitortv/v1/spot/info

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
spid_str	String	True	Spid字符串
dm_info	int	false	1，显示点位的CMK、剧目等信息
响应示例
{
    "error_code": 0,
    "error_message": "success",
    "result": {
        "spid_str": "e",
        "caid": 4000000,
        "created_time": "2025-09-16 17:39:18.0",
        "placement": "PreRoll 15s",
        "channel_name": "ANYANG",
        "pub_id": 5,
        "publisher": "test",
        "description": "",
        "ad_type": "开机视频",
        "frequency": "0",
        "customize": "",
        "category": "",
        "brand": "",
        "product": "",
        "copyname": "test",
        "buyingregular": "",
        "buyingsub": "",
        "mediasub": "",
        "generalbuying": "",
        "spottype": "",
        "spotplan": "test24",
        "spot_plan_record_id": "test25",
        "caguid": "",
        "guid": "",
        "play_detect": 0,
        "celebrity_stids": null,
        "playinfo_stids": null,
        "spots_display_type": null,
        "mm_channe_id": null,
        "play_info": null,
        "region_id": "ANYANG",
        "tag_place": "开始",
        "multi_tag": "1",
        "program": "test",
        "buying_platform": "",
        "campaign_group": "",
        "campaign": "",
        "kpi": "",
        "site_type": "",
        "site_name": "",
        "buying_basis": "",
        "paid_or_bonus": "",
        "placement_type": "video",
        "program_purchasing_type": "按剧目采买",
        "purchasing_type": "程序化购买"
    }
}
Copy to clipboard
Error
Copied
监测代码获取

/monitortv/v1/spot/code

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	true	活动id
spid_str	String	True	Spid 字符串
响应示例
{
"error_code": 0,
    "error_message": "success",
    "result": {
        "clk":              "http://e.dtv.cn.miaozhen.com/r/k=4002908&p=2hghK&ns=__IP__&nx=__LAB1__&sn=__SN__&ni=__IESID__&m1=__ANDROIDID1__&m1a=__ANDROIDID__&m4=__AAID__&m6=__MAC1__&m6a=__MAC__&nd=__DRA__&nn=__APP__&ng=__CTREF__&nc=__VID__&nt=__TIME__&rfm=__RFM__&tdt=__TDT__&tdr=__TDR__&pro=n&vv=1&tvrm=__TRANSID__&tr=__REQUESTID__&m6o=__M6O__&try=1&macr=__MACR__&dx=__IPDX__&fix=__FIX__&nz=__LAB__&m=45&m6b=__MAC2__&m6c=__MAC3__&m6d=__MAC4__&nvn=__VNAME__&tr2=__REQUESTID2__&tr3=__REQUESTID3__&o=",
        "clk_https": "https://e.dtv.cn.miaozhen.com/r/k=4002908&p=2hghK&ns=__IP__&nx=__LAB1__&sn=__SN__&ni=__IESID__&m1=__ANDROIDID1__&m1a=__ANDROIDID__&m4=__AAID__&m6=__MAC1__&m6a=__MAC__&nd=__DRA__&nn=__APP__&ng=__CTREF__&nc=__VID__&nt=__TIME__&rfm=__RFM__&tdt=__TDT__&tdr=__TDR__&pro=s&vv=1&tvrm=__TRANSID__&tr=__REQUESTID__&m6o=__M6O__&try=1&macr=__MACR__&dx=__IPDX__&fix=__FIX__&nz=__LAB__&m=45&m6b=__MAC2__&m6c=__MAC3__&m6d=__MAC4__&nvn=__VNAME__&tr2=__REQUESTID2__&tr3=__REQUESTID3__&o=",
        "imp": "http://g.dtv.cn.miaozhen.com/x/k=4002908&p=2hghK&ns=__IP__&nx=__LAB1__&sn=__SN__&ni=__IESID__&m1=__ANDROIDID1__&m1a=__ANDROIDID__&m4=__AAID__&m6=__MAC1__&m6a=__MAC__&rt=2&nd=__DRA__&nn=__APP__&ng=__CTREF__&nc=__VID__&nt=__TIME__&rfm=__RFM__&tdt=__TDT__&tdr=__TDR__&pro=n&vv=1&tvrm=__TRANSID__&tr=__REQUESTID__&m6o=__M6O__&try=1&macr=__MACR__&dx=__IPDX__&fix=__FIX__&nz=__LAB__&m=45&m6b=__MAC2__&m6c=__MAC3__&m6d=__MAC4__&nvn=__VNAME__&tr2=__REQUESTID2__&tr3=__REQUESTID3__&o=",
        "imp_https": "https://g.dtv.cn.miaozhen.com/x/k=4002908&p=2hghK&ns=__IP__&nx=__LAB1__&sn=__SN__&ni=__IESID__&m1=__ANDROIDID1__&m1a=__ANDROIDID__&m4=__AAID__&m6=__MAC1__&m6a=__MAC__&rt=2&nd=__DRA__&nn=__APP__&ng=__CTREF__&nc=__VID__&nt=__TIME__&rfm=__RFM__&tdt=__TDT__&tdr=__TDR__&pro=s&vv=1&tvrm=__TRANSID__&tr=__REQUESTID__&m6o=__M6O__&try=1&macr=__MACR__&dx=__IPDX__&fix=__FIX__&nz=__LAB__&m=45&m6b=__MAC2__&m6c=__MAC3__&m6d=__MAC4__&nvn=__VNAME__&tr2=__REQUESTID2__&tr3=__REQUESTID3__&o="}                    
}
Copy to clipboard
Error
Copied
获取指定点位的其他信息（预估曝光、自定义描述）

/monitortv/v1/spot/attach/info

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
spid_str	String	True	Spid 字符串
type	int	false	0：排期（default） 1：预估曝光 2：预估点击
响应示例
{
    "error_code": 0,
"error_message": "success",
"result": 
{
"spid_str": "2yhxg",
    "campaign_id": 4000832,
    "channel_type": "",
    "frequency": "3",
    "area": "上海市",
    "play_detect": 0,
    "list_area": "",
    "sale_model": "",
    "ad_size": "",
    "file_type": "",
    "caguid": "",
    "guid": "",
    "customize": "",
    "media": "奇X果TV",
    "channel": "视频",
    items：
    [{
    "date": "2020-04-29",
    "timeStr": "49"
},
…………
    ]，
    "adPositionType": "视频贴片",
    "adType": "video",
    "advertisingStar": null,
    "vendingModel": "程序化购买",
    "playPurchaseMethod": null,
    "playInfo": null
}
}
Copy to clipboard
Error
Copied
获取指定活动的TA信息

/monitortv/v1/campaign/target/info

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
响应示例
{
    "error_code": 0,
"error_message": "success",
"result": {
  "campaign_id": 4000000,  
        "target"：
            [{
            target_id: "49872",
            target_name: "F20-24",
            target_display: "女,20-24",
            update_time: "2019-11-18"
            }，
            {
            target_id: "47872",
            target_name: "F20-49 1+1",
            target_display: "女,20-24,25-29,30-34,35-39,40-44,45-49,2400-4399人民币,4400人民币及以上",
            update_time: "2019-11-18"
            }，
            …………]
}
}
Copy to clipboard
Error
Copied
广告活动管理
创建或修改广告活动

/monitortv/v1/campaign/saveorupdate

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_name	String	True	活动名称
start_date	String	True	开始时间需大于今天（yyyy-MM-dd）
end_date	String	True	结束时间需大于等于开始时间（yyyy-MM-dd）
orderid	String	false	C240807020，不支持修改
schedulingCode	String	false	C240807020P0004，不支持修改
extensiontype	String	false	推广类型，格式：一级-二级
description	String	false	活动描述
advertiser	int/String	false	广告主ID,若无广告主ID，可填入广告主名称作为备注信息
brand	int	false	品牌ID
agency	int	false	代理商机构ID
campaign_id	int	false	活动id,不填时表示创建活动，填入活动ID表示修改活动
total_net	int/String	false	total_net Id 或total_net名称，默认为空
ear	string	false	EAR活动，枚举值:无（默认）、阿里妈妈，创建后不可修改
panel_id	string	false	Panel，创建后不可修改
wares	string	false	商品信息，格式：广告主|品牌名称|商品名称
响应示例
{
    "error_code": 0,
"error_message": "success",
"result": {
   "campaign_id": "1234567"
}           
}
Copy to clipboard
Error
Copied
创建或修改点位信息

/monitortv/v1/spot/saveorupdate

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
mediaId	int	True	媒体id
spidName	String	True	广告位名称
adType	int	True	广告位类型，类型ID见附录
channel	String	false	channel名称
spid_str	String	false	Spid, 不填时创建，填时修改
region_id	int	false	定向地域ID。可使用获取固定配置信息接口列出所有地域ID。
purchasing_type	String	false	常规购买/程序化购买
program_purchasing_type	String	false	通投/按频道采买/按剧目采买
program	String	false	可使用List_Programs接口列出所有剧目，可填写多个，用”,“分割。
tag_place	String	false	标记监测代码发送时间点。可不填，默认为“前面”
multi_tag	int	false	当一个广告发送多条秒针代码时，为标记不同代码，每条代码单独使用一个序列。默认为序列1
slot_begin	date	false	广告排期开始日期，格式：YYYY-MM-DD
slot_duration	int	false	广告排期持续时间（以天为单位）
est_impression	int	false	预估总曝光
est_click	int	false	预估总点击
frequency	int	false	频次，0-30
placement_type	string	false	广告类型，枚举值：display,（默认）video，search,texr,others,QR-code
play_detect	int	false	监测点属性，默认0，如需要剧目监测填写1
add_slot	array	false	增加广告位排期，格式：YYYY-MM-DD，不同日期通过","进行分割，如2020-04-30,2020-05-05，系统中对应日期标识“1”。
delete_slot	array	false	删除广告位排期，格式：YYYY-MM-DD，不同日期通过","进行分割，如2020-04-30,2020-05-05，系统中对应日期删除“1”标识，对应est_impression_day和est_click_day预估值也同时删除。
update_slot	array	false	更新广告位排期预估值，格式：YYYY-MM-DD，不同日期通过","进行分割。配合est_impression_day参数、est_click_day参数使用，修改对应日期的预估值。同一请求中不可同时存在add_slot参数和update_slot参数
est_impression_day	array	false	值为整数数字，通过","进行分割，如1000,2000,3000
est_click_day	array	false	值为整数数字，通过","进行分割，如1000,2000,3000
caguid	int/string	false	客户活动ID
guid	int/string	false	客户点位ID
spid_description	string	false	描述
customize	int/string	false	自定义列
category	string	false	客户自定义字段
brand	string	false	客户自定义字段
product	string	false	客户自定义字段
copy_name	string	false	客户自定义字段
buying_model	string	false	客户自定义字段
buying_model_subtype	string	false	客户自定义字段
media_subtype	string	false	客户自定义字段
general_buyingtype	string	false	客户自定义字段
spot_type	string	false	客户自定义字段
spot_plan	string	false	客户自定义字段
spot_plan_record_id	string	false	客户自定义字段
buying_platform	string	false	客户自定义字段
campaign_group	string	false	客户自定义字段
campaign	string	false	客户自定义字段
kpi	string	false	客户自定义字段
site_type	string	false	客户自定义字段
site_name	string	false	客户自定义字段
buying_basis	string	false	客户自定义字段
paid_or_bonus	string	false	客户自定义字段
响应示例
{
    "error_code": 0,
   "error_message": "success",
   "result": {
    "spid_str": "40J3K"             
}
Copy to clipboard
Error
Copied
批量创建点位信息

批量创建点位信息，支持单次请求最多创建3000个点位（JSON 数组形式）。点位按数组顺序写入数据库，以保证排期顺序；单次请求中campaign_id只能有一个，即所有点位须属于同一活动。接口按"全部成功或全部回滚"的事务策略处理：前置校验失败或阶段内任一点位失败，整批均不落库。

/monitortv/v1/spot/batch_save

参数
名称	类型	是否必填	描述
access_token	string	True	访问令牌（获取方式见获取Token）
campaign_id	int	True	活动 ID
mediaId	int	True	媒体 ID
spidName	string	True	广告位名称
adType	int	True	广告位类型，类型ID见附录
channel	string	false	channel 名称
region_id	int	false	定向地域 ID（见固定配置信息接口）
purchasing_type	string	false	常规购买/程序化购买
program_purchasing_type	string	false	通投/按频道采买/按剧目采买
program	string	false	剧目名称，多个用逗号分隔（见List_Programs 接口）
tag_place	string	false	监测代码发送时间点，默认 "前面"
multi_tag	int	false	多条秒针代码时的序列号，默认为 1
slot_begin	date	false	排期开始日期，格式 YYYY-MM-DD
slot_duration	int	false	排期持续时间（天）
est_impression	int	false	预估总曝光
est_click	int	false	预估总点击
frequency	int	false	频次（0-30）
placement_type	string	false	广告类型，枚举：display（默认）、video、search、text、others、QR-code
play_detect	int	false	监测点属性，默认 0，剧目监测填 1
add_slot	array	false	增加排期日期，逗号分隔，如 2020-04-30,2020-05-05
est_impression_day	array	false	预估日曝光，逗号分隔数字
est_click_day	array	false	预估日点击，逗号分隔数字
caguid	int/string	false	客户活动 ID
guid	int/string	false	客户点位 ID
spid_description	string	false	描述
customize	int/string	false	自定义列
category	string	false	客户自定义字段
brand	string	false	客户自定义字段
product	string	false	客户自定义字段
copy_name	string	false	客户自定义字段
buying_model	string	false	客户自定义字段
buying_model_subtype	string	false	客户自定义字段
media_subtype	string	false	客户自定义字段
general_buyingtype	string	false	客户自定义字段
spot_type	string	false	客户自定义字段
spot_plan	string	false	客户自定义字段
spot_plan_record_id	string	false	客户自定义字段
buying_platform	string	false	客户自定义字段
campaign_group	string	false	客户自定义字段
campaign	string	false	客户自定义字段
kpi	string	false	客户自定义字段
site_type	string	false	客户自定义字段
site_name	string	false	客户自定义字段
buying_basis	string	false	客户自定义字段
paid_or_bonus	string	false	客户自定义字段
请求示例
 {
  "campaign_id": "123456",
  "spots": [
    {
      "spidName": "点位A",
      "mediaId": 1234,
      "adType": 1,
      "channel": "CCTV-1",
      "customize": "xxx",
      "region_id": "110000",
      "purchasing_type": "...",
      "program_purchasing_type": "...",
      "program": "...",
      "tag_place": "...",
      "multi_tag": "...",
      "slot_begin": "2026-08-01",
      "slot_duration": 7,
      "est_impression": 10000,
      "est_click": 500,
      "add_slot": "2026-08-10,2026-08-11",
      "est_impression_day": "1000,2000",
      "est_click_day": "50,100",
      "frequency": 3,
      "placement_type": "display",
      "play_detect": 0,
      "caguid": "xxx",
      "guid": "yyy",
      "spid_description": "描述"
    }
  ]
}
Copy to clipboard
Error
Copied
响应示例
POST /monitortv/v1/spot/batch_save
HTTP/1.1 200 OK
Copy to clipboard
Error
Copied
{
  "error_code": 0,
  "error_message": "success",
  "result": [
    { "spid_str": "abc123" },
    { "spid_str": "abc124" }
  ]
}
Copy to clipboard
Error
Copied
result 数组长度等于 spots 入参长度。
顺序严格等于 spots 数组入参顺序：result[i].spid_str 对应 spots[i] 生成的点位。

失败响应结构与单条 saveorupdate 完全一致：只有 error_code + error_message，**不返回 result**。

前置校验失败（Controller 层拒绝）

{ "error_code": 2001, "error_message": "campaign is invalid" }
{ "error_code": 2003, "error_message": "batch size invalid" }
{ "error_code": 2003, "error_message": "The number of spots exceeds the limit" }
{ "error_code": 2003, "error_message": "spid_str is not allowed in batch_save" }
Copy to clipboard
Error
Copied

阶段 1 / 阶段 2 内失败（整批回滚）

事务策略：全部成功或全部回滚。任一元素失败时整批回滚，error_message 附失败下标（spots[N]: 表示 spots 数组第 N 个元素触发失败）：

{ "error_code": 2003, "error_message": "spots[2]: placement_type is invalid" }
Copy to clipboard
Error
Copied
{ "error_code": 3, "error_message": "spots[7]: purchasing_type:xxx invalid" }
Copy to clipboard
Error
Copied

错误码总表

error_code	场景
2001	campaign 不存在或无权限
2002	campaign_id 为空 / access_token 无效（interceptor 已拦截空值，此处仅 token 映射 miss 会命中）
2003	spid_str 出现 / 批量大小非法 / 数量超限 / spidName 缺失 / adType 缺失 / mediaId 缺失 / frequency 越界 / placement_type 非法 / region_id 非法 / add_slot 日期非法 / est 参数非数字 / est 参数数量与 add_slot 不一致 / JSON 字段类型不匹配（如 adType 传字符串而非整数）
2004	campaign_id 非数字
2005	mediaId 无对应 publisher
2006	customize 长度超过 150
2007	slot_begin 和 slot_duration 未成对
2008	有 est 参数但缺 slot 参数
2009	slot 时间段超出 campaign 起止
2010	同 campaign 并发写入冲突（GET_LOCK 60 秒未拿到锁 / 并发异常兜底），数据无变更，客户端应指数退避重试
3	内部错误 / babel 未命中（purchasing_type / program_purchasing_type / program 无对应元数据）/ 批量写入失败（error_message 附带失败下标）

注意事项

顺序保证：数据库将严格按照 JSON 数组中的点位顺序写入，请业务侧按排期顺序构造数组。
并发控制：虽然接口支持并发请求，但建议对同一 campaign_id 的并发操作进行业务层排队，避免数据竞争。
事务性：整个请求将作为一个事务处理，任一点位失败则全部回滚。
超时设置：单次请求包含最多 3000 个点位，建议客户端设置合理超时时间（如 60 秒）。
必填校验：所有标注 True 的字段必须提供，否则请求失败。
枚举值大小写：请严格按照文档中的枚举值填写（如 display、video，注意 QR-code 的大小写）。
创建并发布目标人群

/monitortv/v1/campaign/target/publish

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
target_name	String	True	自定义的TA名称
target_display	String	True	TA属性的组合，不同类型的属性使用'&'分隔，同类型的属性使用英标逗号','分隔，且按枚举列表中的类型排序。枚举值如下。
类型	枚举值
性别	男,女
年龄	＜14,14-17,18-19,20-24,25-29,30-34,35-39,40-44,45-49,50-54,55-59,60+
教育程度	小学或初中,高中或中专,大专,本科及以上
个人月收入	1000人民币以下（个人）,1001-3000人民币（个人）,3001-5000人民币（个人）,5001-10000人民币（个人）,10000人民币以上（个人）
家庭月收入	1000人民币以下（家庭）,1001-3000人民币（家庭）,3001-5000人民币（家庭）,5001-10000人民币（家庭）,10000人民币以上（家庭）
家庭人均收入	1200人民币以下,1200-2399人民币,2400-4399人民币,4400人民币及以上
响应示例
{
    "error_code": 0,
   "error_message": "success",
   "result": {
      "target_display": "女&18-19,20-24",
      "update_time": "2025-01-14",
      "target_id": 425504,
      "campaign_id": 4123217            
    }
}
Copy to clipboard
Error
Copied
广告数据报告
实时数据报告

/monitortv/v1/reports/realtime/show

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
date	String	True	日期，yyyy-MM-dd
by_position	String	false	统计维度，campaign(default), publisher or spot
publisher_id	String	false	媒体ID，仅当by_position=publisher or spot时生效
spot_id	String	false	点位ID，仅当by_position=spot时生效
metrics	String	false	day(default),hrs or all
limit	String	false	default 0,300
{
    "error_code": 0,
    "error_message": "success",
    result: 
    {
        campaignId: "4004377",
        date: "2019-06-15",
        items: 
        [{
        metrics: 
        {
            clk_h00: 0,
            clk_h01: 0,
            clk_h02: 0,
            clk_h03: 0,
            clk_h04: 0,
            clk_h05: 0,
            clk_h06: 0,
            clk_h07: 0,
            clk_h08: 0,
            clk_h09: 0,
            clk_h10: 0,
            clk_h11: 0,
            clk_h12: 0,
            clk_h13: 0,
            clk_h14: 0,
            clk_h15: 0,
            clk_h16: 0,
            clk_h17: 0,
            clk_h18: 0,
            clk_h19: 0,
            clk_h20: 0,
            clk_h21: 0,
            clk_h22: 0,
            clk_h23: 0,
            imp_h00: 10049,
            imp_h01: 10054,
            imp_h02: 10042,
            imp_h03: 10055,
            imp_h04: 10055,
            imp_h05: 10053,
            imp_h06: 10048,
            imp_h07: 10043,
            imp_h08: 10055,
            imp_h09: 10044,
            imp_h10: 10047,
            imp_h11: 10047,
            imp_h12: 10053,
            imp_h13: 10044,
            imp_h14: 10055,
            imp_h15: 10060,
            imp_h16: 10034,
            imp_h17: 10061,
            imp_h18: 10054,
            imp_h19: 10037,
            imp_h20: 10052,
            imp_h21: 10047,
            imp_h22: 10050,
            imp_h23: 10035
        },
        attributes: 
        {
            region_id: "0000000000"
        }
        }]
}
}
Copy to clipboard
Error
Copied
基础数据报告

/monitortv/v1/reports/basic/show

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
date	String	True	日期，yyyy-MM-dd
by_position	String	false	统计维度，campaign(default), publisher or spot
by_audience	String	false	目标人群，overall(default),people or target or targetdevice
by_region	String	false	地域层级，level0(default)：全球&中国大陆，level1：省级，or level2：地级市
publisher_id	String	false	媒体ID，仅当by_position=publisher or spot时生效
spot_id	String	false	点位ID，仅当by_position=spot时生效
target_id	String	false	TA ID，仅当by_audience=target/targetdevice时生效
region_id	String	false	地域ID，ID1,ID2,ID3
metrics	String	false	acc(default)or all or day
with_null	String	false	是否过滤空值item，1(default)：不过滤，or 0：过滤
limit	String	false	default 0,300
filtration_type	String	false	net（default） or totalNet
响应示例
{
    "error_code": 0,
    "error_message": "success",
    "result": {
   campaignId: "4004377",
        items: 
        [{
            metrics: 
            {
            clk_acc: 0,
            imp_acc: 13622173,
            ucl_acc: 0,
            uim_acc: 75
            },
            attributes: 
            {
            audience: "all",
            region_id: "0000000000",
            universe: "-"
            }
        },
        {
            metrics: 
            {
            clk_acc: 0,
            imp_acc: 13622169,
            ucl_acc: 0,
            uim_acc: 74
            },
            attributes: 
            {
            audience: "target",
            target_name: "P14-39",
            region_id: "0000000000",
            universe: "-",
            target_def: "000000010000000000000010,000000010000000000000011&000000010000000000000235,000000010000000000000111,000000010000000000000014,000000010000000000000015,000000010000000000000016,000000010000000000000017&&&&&",
            target_id: "22970"
            }
        }
        }],
    date: "2019-06-15",
    version: 0
}
}
Copy to clipboard
Error
Copied
到达效果报告

/monitortv/v1/reports/reach/show

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
date	String	True	日期，yyyy-MM-dd
by_position	String	false	统计维度，campaign(default), publisher or spot
by_audience	String	false	目标人群，overall(default),people or target or targetdevice
by_region	String	false	地域层级，level0(default)：全球&中国大陆，level1：省级，or level2：地级市
publisher_id	String	false	媒体ID，仅当by_position=publisher or spot时生效
spot_id	String	false	点位ID，仅当by_position=spot时生效
target_id	String	false	TA ID，仅当by_audience=target/targetdevice时生效
region_id	String	false	地域ID，ID1,ID2,ID3
metrics	String	false	acc(default)or all
limit	String	false	default 0,300
filtration_type	String	false	net（default） or totalNet
响应示例
{
    "error_code": 0,
    "error_message": "success",
    result: 
    {
        campaignId: "4004377",
        items: 
        [{
            metrics: 
       {
            imp_acc: 36948752,
            rch_acc_p01: 254,
            rch_acc_p02: 244,
            rch_acc_p03: 239,
            rch_acc_p04: 231,
            rch_acc_p05: 227,
            rch_acc_p06: 227,
            rch_acc_p07: 227,
            rch_acc_p08: 227,
            rch_acc_p09: 227,
            rch_acc_p10: 225,
            rch_acc_p11: 223,
            rch_acc_p12: 223,
            rch_acc_p13: 223,
            rch_acc_p14: 223,
            rch_acc_p15: 221,
            rch_acc_p16: 221,
            rch_acc_p17: 221,
            rch_acc_p18: 221,
            rch_acc_p19: 220,
            rch_acc_p20: 220
            },
            attributes: 
            {
            audience: "people",
            region_id: "0000000000",
            universe: "-"
            }
        },
        {
            metrics: 
            {
            grp_acc: 10,
            imp_acc: 36948748,
            rch_acc_p01: 253,
            rch_acc_p02: 243,
            rch_acc_p03: 238,
            rch_acc_p04: 230,
            rch_acc_p05: 227,
            rch_acc_p06: 227,
            rch_acc_p07: 227,
            rch_acc_p08: 227,
            rch_acc_p09: 227,
            rch_acc_p10: 225,
            rch_acc_p11: 223,
            rch_acc_p12: 223,
            rch_acc_p13: 223,
            rch_acc_p14: 223,
            rch_acc_p15: 221,
            rch_acc_p16: 221,
            rch_acc_p17: 221,
            rch_acc_p18: 221,
            rch_acc_p19: 220,
            rch_acc_p20: 220
            },
            attributes: 
            {
            audience: "people",
            region_id: "1156000000",
            universe: 367087681
            }
        }],
    date: "2019-06-15",
    version: 0
}
}
Copy to clipboard
Error
Copied
活动计算进度

/monitortv/v1/reports/basic/progress

参数
名称	类型	是否必填	描述
access_token	String	True	获取的token
campaign_id	int	True	活动id
filtration_type	String	False	过滤类型，net（default） or totalnet
响应示例
{
"error_code": 0,
"error_message": "success",
"result":{
"date": "2022-11-25",
"campaign_id": 4
}
}
Copy to clipboard
Error
Copied
名称	类型	描述
date	string	已完成计算的最新日期
附录
附录一 广告位类型ID枚举值列表
ID	广告位 类型
1	开机视频
2	开机图片
3	视频贴片 15S
4	视频贴片 30S+
5	角标
6	视频暂停
7	屏保
8	创可贴
9	二维码
10	开屏广告
11	冠名标版
12	信息流
14	Banner
15	其它
16	手机投屏
17	退出
18	关机
19	标版广告
20	品牌头条
21	剧情提要
22	剧中植入


## ==================== Multi Dim API ====================

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