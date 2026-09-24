# DMS 数据表结构参考

> 此文件由 API 自动生成，供 /dms-query skill 使用。
> Agent 在编写 SQL 前应先阅读此文件了解可用字段。

## ods_adm_bus

- **别名**: AdMonitor广告监测数据（PC/MOB互联网广告）
- **数据库**: daas
- **表类型**: EXTERNAL_TABLE
- **分区**: 是（按天分区）
- **描述**: 来自OMI-AdMonitor互联网广告监测数据，PC/MOB平台广告监测数据，包含：广告浏览行为、终端设备信息、用户标识信息、位置及时间信息等信息。

| # | 字段名 | 类型 | 分区键 | 说明 |
|---|--------|------|--------|------|
| 1 | `creativeid_cgid` | string |  | 创意id渠道cgid |
| 2 | `creativeid_gcid` | string |  | 创意id渠道gcid |
| 3 | `creativeid_kc` | string |  | 创意id渠道kc |
| 4 | `signature_verification_value` | string |  | 签名校验值 |
| 5 | `youku_screen_match_flag` | string |  | 优酷大小屏匹配标识 |
| 6 | `red_clk_id` | string |  | 小红书视频流点击id |
| 7 | `rta_dsp_tag_str` | string |  | RTA替换的DID |
| 8 | `wechat_openid` | string |  | 广点通渠道每个用户针对小程序应用产生的一个安全的OpenID |
| 9 | `hunantv_bucket` | int |  | 芒果分渠道标识 |
| 10 | `oaid_acquisition_status` | string |  | 标记oaid的获取状态 ms=0 ：默认值 ms=2：oaid为空或者null,或者长度小于1 ms=3：获取时出现了异常情况 |
| 11 | `system_level_informations` | string |  | 数据为json格式，json key及含义如下 获取参数 参数名 设备名称 e1 hw.model e2 运营商信息 e3 硬盘空间 e4 系统重启时间 ... |
| 12 | `encode_ip` | string |  | 监测事件发生时，对当前设备的外网ip加密后生成的值 |
| 13 | `bd_region` | string |  | 使用字节回传的nsip计算地域 |
| 14 | `signature_verification` | int |  | 0:签名校验不通过 1:签名校验通过 2:缺少签名校验的必要字段，或是签名校验涉及字段的字段值不合法 3:签名校验的值都存在且合法，但后端生成对比签名值失... |
| 15 | `site_set_name` | string |  | 腾讯广告版位 |
| 16 | `appid` | string |  | 应用ID |
| 17 | `agent_id` | string |  | 代理商ID |
| 18 | `click_id` | string |  | 点击ID |
| 19 | `is_homologous` | tinyint |  | 1或0，1表示从B站同源服务器收到的请求；0就是不走的同源 |
| 20 | `header_ip` | string |  | header中解析的客户端ip |
| 21 | `idfa_permissions ` | tinyint |  | 表示IDFA权限情况，at可能的取值包括： 0，未知；1，受限；2，拒绝；3，已授权；-1，默认值，不传值的时候会赋值-1 |
| 22 | `sha256_imei` | string |  | IMEI原值进行sha256加密后的结果，用于sdk签名校验逻辑 |
| 23 | `sha256_idfa` | string |  | IDFA原值进行sha256加密后的结果，用于sdk签名校验逻辑 |
| 24 | `sha256_androidid` | string |  | AndroidID原值进行sha256加密后的结果，用于sdk签名校验逻辑 |
| 25 | `red_id` | string |  | 小红书回传小红书ID |
| 26 | `md5_caid` | string |  | 加密信通院&广协合作的CAID |
| 27 | `md5_oaid` | string |  | 加密设备厂商生成的广告ID |
| 28 | `ad_advertising_scene` | string |  | 广告投放场景 |
| 29 | `ad_account_id` | string |  | 广告账户ID |
| 30 | `ad_plan_id` | string |  | 广告计划ID |
| 31 | `ad_creative_id` | string |  | 广告创意ID |
| 32 | `ad_plan_name` | string |  | 广告计划名称 |
| 33 | `app_name_2nd` | string |  | APP名称 |
| 34 | `call_back` | string |  | 回调信息 |
| 35 | `ad_group_id` | string |  | 广告组ID |
| 36 | `youku_drama_id` | string |  | 优酷剧目信息字符串 |
| 37 | `track_scene_id` | string |  | 场景内容ID |
| 38 | `session_id` | string |  | SDK/JS的SessionID |
| 39 | `track_os_type` | tinyint |  | 采集的操作系统信息 |
| 40 | `raw_idfv` | string |  | 明文idfv |
| 41 | `caid` | string |  | 信通院&广协合作的CAID |
| 42 | `verify_uid` | string |  | verify计算用的唯一用户标识 |
| 43 | `os_version_final` | string |  | adm数据最终操作系统版本 |
| 44 | `ip_property_type` | tinyint |  | IP字段对应的IP性质类型 |
| 45 | `baidu_custom_id` | string |  | 百度回传用户唯一标识ID |
| 46 | `pc_media_paltform` | string |  | PC媒体平台类型 |
| 47 | `ka_ta_id` | string |  | KA客户人群包ID |
| 48 | `raw_imei` | string |  | IMEI 原始值 |
| 49 | `fingerprint_part` | string |  | 指纹信息：IP 前3段和 UA 加密生成 |
| 50 | `sdk_type` | string |  | sdk类型 |
| 51 | `drama_id` | string |  | 剧目 ID |
| 52 | `tencent_spa_data` | string |  | 腾讯SPA DAR合作的腾讯回传额外数据 |
| 53 | `referer_url` | string |  | 请求来源 URL |
| 54 | `toutiao_lbs` | string |  | 头条回传地理位置信息 |
| 55 | `raw_mac` | string |  | MAC 原始值 |
| 56 | `ip` | string |  | 按照一定规则生成的IP，目前还没有生成 |
| 57 | `region_district` | int |  | 地域信息，10位的地域code（关联区县 IP库） |
| 58 | `advertiser_custom_id` | string |  | 额外自定义信息字段，用于客户回传唯一标识 |
| 59 | `tencent_spa_area` | string |  | 腾讯SPA DAR合作的地域码 |
| 60 | `cas_id` | string |  | 基于加密的审计方案 |
| 61 | `network_type` | tinyint |  | 移动设备联网类型，1:wifi，2:mobile |
| 62 | `media_ip` | string |  | 媒体回传的 IP |
| 63 | `tencent_drama_token` | string |  | 腾讯SPA DAR合作的token |
| 64 | `raw_ip` | string |  | 为日志空格后的IP，表示服务器收到的IP |
| 65 | `uuid` | string |  | 该条日志的用户 ID，生成规则见AdMonitor业务ETL规则 |
| 66 | `region_small` | int |  | 秒针地域 ID（top337或扩展） |
| 67 | `drama_play_client` | string |  | 剧目播放的客户端信息 |
| 68 | `region_id` | int |  | 秒针地域 ID（top100） |
| 69 | `weibo_action_id` | string |  | 微博回传的曝光ID/点击ID，固定格式是14位随机数字串 |
| 70 | `package_name` | string |  | 移动端 APP 包名 |
| 71 | `ip_type` | string |  | IP取值类型，和ip_from一一对应，另取别名 |
| 72 | `event_id` | bigint |  | Minisite 监测事件 ID |
| 73 | `uuid_from` | string |  | 用户 ID 来源 |
| 74 | `mobile_platform` | tinyint |  | 标识移动端日志类型 SDK/非SDK |
| 75 | `app_name` | string |  | 移动端 APP 名称 |
| 76 | `ies_id` | string |  | IES服务，回传媒体的IES订单ID |
| 77 | `ipdx_flag` | string |  | 是否开启 IPDX 服务，dx=1 时开启 |
| 78 | `md5_mac_no_colon` | string |  | 不带冒号的mac地址MD5值，转大写 |
| 79 | `media_request_id` | string |  | 为媒体提供的对数字段（优土、腾讯），品友回传竞价ID，乐视回传唯一ID |
| 80 | `advertiser_request_id` | string |  | 广告主在serving中的随机值 |
| 81 | `media_uid` | string |  | 新浪微博—S2S—随机数，Yahoo—IDFA或AAID（需��勾选MMA），腾讯SPA DAR合作的用户ID |
| 82 | `wp_duid` | string |  | Windows Phone DUID |
| 83 | `raw_idfa` | string |  | IDFA 原始值，转大写 |
| 84 | `tencent_web_refer` | string |  | 腾讯回传的pc web端来源页面URL（referer）信息 |
| 85 | `open_udid` | string |  | iOS6 以下的设备 ID，40位16进制数字 |
| 86 | `bdid` | string |  | 字节系媒体回传的用于替代设备ID的ID |
| 87 | `drama_video_id` | string |  | 剧目剧集 ID |
| 88 | `mz_lbs` | string |  | 秒针地理位置信息 |
| 89 | `md5_imei` | string |  | IMEI MD5值，转大写 |
| 90 | `wifi_ssid` | string |  | WiFi SSID |
| 91 | `media_sid` | string |  | 新浪门户—随机数，宝洁位序分析 |
| 92 | `uuid_type` | string |  | 用户 ID 的类型 |
| 93 | `mzid` | string |  | 秒针cookie |
| 94 | `viewable_type` | tinyint |  | 可见曝光类型 |
| 95 | `log_index` | string |  | 日志索引：文件名+偏移量 |
| 96 | `trigger_timestamp` | bigint |  | UNIX时间戳，监测触发时间戳(客户端本地时间) |
| 97 | `device_oaid` | string |  | 设备厂商生成的广告ID，可被限制追踪 |
| 98 | `tencent_spa_flag` | string |  | 腾讯ADX，xa=SPA时，以ns的IP计算地域 |
| 99 | `log_id` | string |  | 日志ID |
| 100 | `sina_random` | string |  | 新浪门户回传的随机数 |
| 101 | `mz_keyword_id` | int |  | AdMonitor 广告监测关键词 ID |
| 102 | `drama_video_url` | string |  | 剧目剧集 URL |
| 103 | `transparency_level` | int |  | ETL阶段增加的opa字段取值为6-10的整数，数值越大，表示透明度等级越高 |
| 104 | `timestamp` | bigint |  | UNIX时间戳，日志收集时间戳 |
| 105 | `md5_idfa` | string |  | IDFA MD5值，转大写 |
| 106 | `mz_minisite_id` | int |  | Minisite 监测站点 ID |
| 107 | `fingerprint_full` | string |  | 指纹信息：IP 和 UA 加密生成 |
| 108 | `platform` | tinyint |  | 平台类型 |
| 109 | `tencent_client` | int |  | 腾讯回传的pc端分端信息 |
| 110 | `ip_from` | string |  | IP取值来源 |
| 111 | `wifi_bssid` | string |  | WiFi BSSID |
| 112 | `sdk_version` | string |  | sdk版本 |
| 113 | `raw_androidid` | string |  | Android ID 原始值 |
| 114 | `is_stable` | boolean |  | mzid 的状态（是否稳定） |
| 115 | `raw_user_agent` | string |  | 原始浏览器UA信息 |
| 116 | `os_type` | string |  | 操作系统类型 |
| 117 | `yahoo_uid` | string |  | Yahoo—IDFA或AAID（需要勾选MMA） |
| 118 | `dt` | string | Y | 日期 |
| 119 | `os_version` | string |  | 操作系统版本 |
| 120 | `landpage_url` | string |  | 落地页URL |
| 121 | `ali_aiid` | string |  | 阿里回传的加密的设备 ID |
| 122 | `md5_androidid` | string |  | Android ID 的 MD5 值，转大写 |
| 123 | `mma_lbs` | string |  | MMA地理位置信息 |
| 124 | `md5_mac` | string |  | 带冒号MAC 的 MD5 值，转大写 |
| 125 | `log_type` | string |  | 日志类型 |
| 126 | `device_model` | string |  | 移动设备机型 |
| 127 | `mz_campaign_id` | int |  | AdMonitor广告监测活动 ID |
| 128 | `track_schema` | tinyint |  | 标识监测代码是http还是https |
| 129 | `mz_spot_id` | bigint |  | AdMonitor 广告监测点位 ID，十进制 |
| 130 | `device_adid` | string |  | SDK通过种植文件（mzid）生成的设备ID |
| 131 | `tencent_ip` | string |  | 腾讯回传加密后的IP |
| 132 | `mobile_env_type` | tinyint |  | 默认值为0，若 met=1 表示公共 WiFi，改变 uuid 取值优先级 |
| 133 | `user_agent` | string |  | 浏览器 UA 信息 |

---

## ods_tvm_bus

- **别名**: TVMonitor广告监测数据（数字电视广告）
- **数据库**: daas
- **表类型**: EXTERNAL_TABLE
- **分区**: 是（按天分区）
- **描述**: 来自OMI-TVMonitor互联网广告监测数据，数字电视平台广告监测数据，包含：广告浏览行为、终端设备信息、用户标识信息、位置及时间信息等信息

| # | 字段名 | 类型 | 分区键 | 说明 |
|---|--------|------|--------|------|
| 1 | `creativeid_cgid` | string |  | 创意id渠道cgid |
| 2 | `creativeid_gcid` | string |  | 创意id渠道gcid |
| 3 | `creativeid_kc` | string |  | 创意id渠道kc |
| 4 | `signature_verification_value` | string |  | 签名校验值 |
| 5 | `reg_raw_ip` | string |  | 和region_id一样，只不过是用rawip解析出region |
| 6 | `youku_screen_match_flag` | string |  | 优酷大小屏匹配标识 |
| 7 | `header_ip` | string |  | header中解析的客户端ip |
| 8 | `is_homologous` | tinyint |  | 1或0，1表示从B站同源服务器收到的请求；0就是不走的同源 |
| 9 | `ipdx_flag` | string |  | 是否开启IPDX服务 |
| 10 | `iptv_device_id` | string |  | 监测代码-iptv类活动的device id |
| 11 | `youku_drama_name` | string |  | Context Monitor为优酷定制的剧目名称 |
| 12 | `rigid_package_type` | string |  | 地域计算使用固化包标识 |
| 13 | `media_id` | string |  | 媒体ID |
| 14 | `track_scene_id` | string |  | 场景内容ID |
| 15 | `pg_track_id` | string |  | 宝洁中点监测字段 |
| 16 | `media_salt_version` | string |  | 媒体用于加密的salt版本号 |
| 17 | `advertiser_request_id` | string |  | 广告主在serving中的随机值 |
| 18 | `iptv_media_id` | string |  | IPTV媒体资源ID |
| 19 | `raw_user_agent` | string |  | 原始ua |
| 20 | `media_region_id` | string |  | TVMonitor 媒体直接回传的地域id |
| 21 | `advertiser_custom_id` | string |  | ADM额外自定义信息字段 |
| 22 | `ies_id` | string |  | IES服务订单ID |
| 23 | `media_signature_id` | string |  | 媒体回传的流量签名字符串 |
| 24 | `iptv_media_drama` | string |  | IPTV媒体节目信息 |
| 25 | `media_request_id` | string |  | 为媒体提供的对数字段 |
| 26 | `app_name_2nd` | string |  | APP名称 |
| 27 | `sdk_config_version` | string |  | SDK配置文件版本号 |
| 28 | `rigid_package_region_id` | string |  | mac固化包反馈的地域码 |
| 29 | `tencent_ip` | string |  | 腾讯回传加密后的IP |
| 30 | `s2s_timestamp` | string |  | S2S日志实际发生的时间 |
| 31 | `ip_type_tv` | tinyint |  | IP字段对应的IP类型 |
| 32 | `sdk_version` | string |  | sdk版本 |
| 33 | `backhaul_type` | string |  | 数据回传方式 |
| 34 | `region_district` | string |  | 区县地域编码 |
| 35 | `open_udid` | string |  | open_udid原始值 |
| 36 | `md5_bluetooth_mac` | string |  | 蓝牙mac地址 |
| 37 | `md5_wifi_mac` | string |  | 无线mac地址 |
| 38 | `md5_wired_mac` | string |  | 有线mac地址 |
| 39 | `media_uid` | string |  | 广告监测媒体对数字段 |
| 40 | `ali_aiid` | string |  | 阿里加密设备ID |
| 41 | `dt` | string | Y | 日期 |
| 42 | `network_type` | tinyint |  | 联网类型 |
| 43 | `log_type` | string |  | 日志类型 |
| 44 | `md5_mac_no_colon` | string |  | mac无冒号的MD5值 |
| 45 | `timestamp` | bigint |  | UNIX时间戳 |
| 46 | `is_stable` | boolean |  | 是否稳定 |
| 47 | `event_id` | int |  | Minisite监测事件id |
| 48 | `uuid` | string |  | 该条日志的用户ID |
| 49 | `app_name` | string |  | app名称 |
| 50 | `uuid_type` | string |  | 用户ID类型 |
| 51 | `drama_video_url` | string |  | 剧目剧集url |
| 52 | `mz_minisite_id` | int |  | Minisite监测站点id |
| 53 | `md5_imei` | string |  | imei MD5值 |
| 54 | `raw_imei` | string |  | imei原始值 |
| 55 | `os_type` | tinyint |  | 移动os类型 |
| 56 | `raw_ip` | string |  | raw_ip |
| 57 | `mz_campaign_id` | int |  | 活动id |
| 58 | `fingerprint_full` | string |  | 指纹信息，由IP和UA生成 |
| 59 | `lbs` | string |  | 地理位置 |
| 60 | `raw_androidid` | string |  | androidid原始值 |
| 61 | `drama_id` | string |  | 剧目信息 |
| 62 | `region_id` | int |  | 地域信息（8：中国大陆） |
| 63 | `raw_mac` | string |  | mac原始值 |
| 64 | `md5_androidid` | string |  | androidid MD5值 |
| 65 | `equipment_seq_code` | string |  | 设备序列码 |
| 66 | `md5_mac` | string |  | mac MD5值 |
| 67 | `os_version` | string |  | 移动os版本 |
| 68 | `device_model` | string |  | 移动机型 |
| 69 | `package_name` | string |  | app包名 |
| 70 | `md5_idfa` | string |  | idfa MD5值 |
| 71 | `mz_spot_id` | bigint |  | 点位id |
| 72 | `media_ip` | string |  | 媒体回传ip |
| 73 | `android_advertising_id` | string |  | 安卓广告ID |
| 74 | `wifi_ssid` | string |  | wifi名称 |
| 75 | `ip_from` | string |  | ip的取值来源 |
| 76 | `log_id` | string |  | log唯一标识 |
| 77 | `drama_play_client` | string |  | 剧目播放的客户端信息 |
| 78 | `mzid` | string |  | 秒针cookie |
| 79 | `log_index` | string |  | 日志的 ID：文件名+偏移量 |
| 80 | `referer_url` | string |  | referer url |
| 81 | `mz_keyword_id` | int |  | 广告监测关键词id |
| 82 | `user_agent` | string |  | ua信息 |
| 83 | `raw_idfa` | string |  | idfa原始值 |
| 84 | `uuid_from` | string |  | uuid取值来源 |
| 85 | `drama_video_id` | string |  | 剧目剧集id |
| 86 | `ip` | string |  | ip地址 |

---

## dim_adm_babel

- **别名**: Babel-AdMonitor维度表（活动/点位标准化维度）
- **数据库**: daas
- **表类型**: EXTERNAL_TABLE
- **分区**: 否（按天分区）
- **描述**: Babel对AdMonitor产品的Campaign/spid标准数据维度如商品、品牌、行业、媒体、广告位类型等维度规范化后的数据。

| # | 字段名 | 类型 | 分区键 | 说明 |
|---|--------|------|--------|------|
| 1 | `creator` | string |  | 活动创建人 |
| 2 | `frequency` | string |  | 点位频次 |
| 3 | `purchase_type_l2_name` | string |  | 广告二级采买方式name |
| 4 | `purchase_type_l2_stid` | string |  | 广告二级采买方式stid |
| 5 | `industry_l1_name` | string |  | 行业大类 |
| 6 | `spots_str` | string |  | 点位62进制的字符串ID |
| 7 | `brand_attributes_stids` | array<string> |  | 品牌附加属性stid列表 |
| 8 | `goods_name` | string |  | 商品 |
| 9 | `media_stid` | string |  | 媒体 |
| 10 | `play_purchase_type_stid` | string |  | 内容采买类型 |
| 11 | `brand_stid` | string |  | 品牌 |
| 12 | `matching_status` | string |  | 匹配状态 |
| 13 | `goods_stid` | string |  | 商品 |
| 14 | `play_classification_l2_stid` | string |  | 剧目小类 |
| 15 | `landing_page_type_l2_name` | string |  | 落地页小类 |
| 16 | `industry_l3_name` | string |  | 行业小类 |
| 17 | `brand_name` | string |  | 品牌 |
| 18 | `campaign_id` | string |  | 广告活动ID |
| 19 | `agency_stid` | string |  | 代理 |
| 20 | `media_l2_stid` | string |  | 媒体小类 |
| 21 | `celebrity_name` | string |  | 明星 |
| 22 | `campaign_type_l1_stid` | string |  | 广告活动类型大类 |
| 23 | `advertiser_stid` | string |  | 广告主 |
| 24 | `play_classification_l2_name` | string |  | 剧目小类 |
| 25 | `spots_name` | string |  | 点位名称 |
| 26 | `play_classification_l1_stid` | string |  | 剧目大类 |
| 27 | `celebrity_stid` | string |  | 明星 |
| 28 | `play_stid` | string |  | 剧目 |
| 29 | `campaign_type_l2_name` | string |  | 广告活动类型小类 |
| 30 | `industry_l3_stid` | string |  | 行业小类 |
| 31 | `spot_type_stid` | string |  | 广告位类型 |
| 32 | `industry_l2_name` | string |  | 行业中类 |
| 33 | `spots_id` | string |  | 点位ID |
| 34 | `agency_name` | string |  | 代理 |
| 35 | `campaign_name` | string |  | 广告活动 |
| 36 | `channel_name` | string |  | 频道 |
| 37 | `end_time` | string |  | 活动结束时间 |
| 38 | `media_name` | string |  | 媒体 |
| 39 | `goods_attributes_stids` | array<string> |  | 商品附加属性stid列表 |
| 40 | `industry_l1_stid` | string |  | 行业大类 |
| 41 | `display_type_id` | string |  | 广告素材类型ID |
| 42 | `landing_page_type_l2_stid` | string |  | 落地页小类 |
| 43 | `play_name` | string |  | 剧目 |
| 44 | `landing_page_type_l1_stid` | string |  | 落地页大类 |
| 45 | `purchase_type_stid` | string |  | 广告投放方式 |
| 46 | `channel_stid` | string |  | 频道 |
| 47 | `landing_page_type_l1_name` | string |  | 落地页大类 |
| 48 | `play_classification_l1_name` | string |  | 剧目大类 |
| 49 | `media_l2_name` | string |  | 媒体小类 |
| 50 | `display_type_name` | string |  | 广告素材类型 |
| 51 | `media_l1_stid` | string |  | 媒体大类 |
| 52 | `industry_l2_stid` | string |  | 行业中类 |
| 53 | `display_type_stid` | string |  | 广告素材类型 |
| 54 | `play_purchase_type_name` | string |  | 内容采买类型 |
| 55 | `spot_type_name` | string |  | 广告位类型 |
| 56 | `media_l1_name` | string |  | 媒体大类 |
| 57 | `purchase_type_name` | string |  | 广告投放方式 |
| 58 | `advertiser_name` | string |  | 广告主 |
| 59 | `campaign_type_l1_name` | string |  | 广告活动类型大类 |
| 60 | `start_time` | string |  | 活动开始日期 |
| 61 | `campaign_type_l2_stid` | string |  | 广告活动类型小类 |

---

## dim_tvm_babel

- **别名**: Babel-TVMonitor维度表（活动/点位标准化维度）
- **数据库**: daas
- **表类型**: EXTERNAL_TABLE
- **分区**: 否（按天分区）
- **描述**: Babel对TVMonitor产品的Campaign/spid标准数据维度如商品、品牌、行业、媒体、广告位类型等维度规范化后的数据。

| # | 字段名 | 类型 | 分区键 | 说明 |
|---|--------|------|--------|------|
| 1 | `creator` | string |  | 活动创建人 |
| 2 | `frequency` | string |  | 点位频次 |
| 3 | `purchase_type_l2_name` | string |  | 广告二级采买方式name |
| 4 | `purchase_type_l2_stid` | string |  | 广告二级采买方式stid |
| 5 | `display_type_stid` | string |  | 广告素材类型 |
| 6 | `matching_status` | string |  | 匹配状态 |
| 7 | `media_l2_name` | string |  | 媒体小类 |
| 8 | `play_classification_l1_stid` | string |  | 剧目大类 |
| 9 | `play_classification_l2_name` | string |  | 剧目小类 |
| 10 | `advertiser_name` | string |  | 广告主 |
| 11 | `media_l2_stid` | string |  | 媒体小类 |
| 12 | `industry_l2_stid` | string |  | 行业中类 |
| 13 | `spots_name` | string |  | 点位名称 |
| 14 | `goods_name` | string |  | 商品 |
| 15 | `celebrity_name` | string |  | 明星 |
| 16 | `channel_stid` | string |  | 频道 |
| 17 | `campaign_id` | string |  | 广告活动ID |
| 18 | `spots_str` | string |  | 点位62进制的字符串ID |
| 19 | `spots_id` | string |  | 点位ID |
| 20 | `industry_l3_stid` | string |  | 行业小类 |
| 21 | `play_stid` | string |  | 剧目 |
| 22 | `landing_page_type_l1_stid` | string |  | 落地页大类 |
| 23 | `landing_page_type_l2_name` | string |  | 落地页小类 |
| 24 | `goods_attributes_stids` | array<string> |  | 商品附加属性stid列表 |
| 25 | `purchase_type_stid` | string |  | 广告投放方式 |
| 26 | `agency_name` | string |  | 代理 |
| 27 | `brand_attributes_stids` | array<string> |  | 品牌附加属性stid列表 |
| 28 | `spot_type_stid` | string |  | 广告位类型 |
| 29 | `industry_l1_name` | string |  | 行业大类 |
| 30 | `goods_stid` | string |  | 商品 |
| 31 | `advertiser_stid` | string |  | 广告主 |
| 32 | `campaign_type_l2_name` | string |  | 广告活动类型小类 |
| 33 | `campaign_type_l1_name` | string |  | 广告活动类型大类 |
| 34 | `celebrity_stid` | string |  | 明星 |
| 35 | `landing_page_type_l1_name` | string |  | 落地页大类 |
| 36 | `display_type_id` | string |  | 广告素材类型ID |
| 37 | `play_classification_l2_stid` | string |  | 剧目小类 |
| 38 | `channel_name` | string |  | 频道 |
| 39 | `display_type_name` | string |  | 广告素材类型 |
| 40 | `campaign_type_l1_stid` | string |  | 广告活动类型大类 |
| 41 | `media_l1_stid` | string |  | 媒体大类 |
| 42 | `industry_l1_stid` | string |  | 行业大类 |
| 43 | `media_name` | string |  | 媒体 |
| 44 | `play_purchase_type_stid` | string |  | 内容采买类型 |
| 45 | `industry_l2_name` | string |  | 行业中类 |
| 46 | `end_time` | string |  | 活动结束时间 |
| 47 | `purchase_type_name` | string |  | 广告投放方式 |
| 48 | `industry_l3_name` | string |  | 行业小类 |
| 49 | `media_stid` | string |  | 媒体 |
| 50 | `brand_stid` | string |  | 品牌 |
| 51 | `campaign_name` | string |  | 广告活动 |
| 52 | `media_l1_name` | string |  | 媒体大类 |
| 53 | `spot_type_name` | string |  | 广告位类型 |
| 54 | `landing_page_type_l2_stid` | string |  | 落地页小类 |
| 55 | `campaign_type_l2_stid` | string |  | 广告活动类型小类 |
| 56 | `agency_stid` | string |  | 代理 |
| 57 | `start_time` | string |  | 活动开始日期 |
| 58 | `play_name` | string |  | 剧目 |
| 59 | `brand_name` | string |  | 品牌 |
| 60 | `play_classification_l1_name` | string |  | 剧目大类 |
| 61 | `play_purchase_type_name` | string |  | 内容采买类型 |

---

## 表关联关系

### 事实表 + 维度表（星型模型）

- `ods_adm_bus.mz_campaign_id = dim_adm_babel.campaign_id`（活动维度）
- `ods_adm_bus.mz_spot_id = dim_adm_babel.spots_id`（点位维度）
- `ods_tvm_bus.mz_campaign_id = dim_tvm_babel.campaign_id`（活动维度）
- `ods_tvm_bus.mz_spot_id = dim_tvm_babel.spots_id`（点位维度）

### 两条产品线

- **AdMonitor**: PC/移动端互联网广告监测 → `ods_adm_bus` + `dim_adm_babel`
- **TVMonitor**: 数字电视(OTT/IPTV)广告监测 → `ods_tvm_bus` + `dim_tvm_babel`

### 常用查询提示

- 事实表按 `dt` 分区（格式 YYYYMMDD），查询时**必须指定 dt 条件**否则全表扫描耗时极长
- 每天约 **18-22 亿条**记录（ods_adm_bus）
- OAID 相关字段仅在 ods_adm_bus 中：`md5_oaid`（加密）、`device_oaid`（明文）、`oaid_acquisition_status`
- 设备标识字段：`md5_imei`、`md5_idfa`、`md5_androidid`、`raw_imei`、`raw_idfa`、`raw_androidid`
