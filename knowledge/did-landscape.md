# DID Landscape — 设备ID生态全景

> ⚠️ 保密：KA客户年度review材料，不对外透露
> 来源：小胡 2026-07-27 发送《Y2025 Digital Tracking Device ID Landscape_202606.pptx》
> 数据周期：2025年1-12月

---

## 本质

每年给KA客户做一次设备ID生态全景review，回答核心问题：
- 我们能识别多少用户？
- 用什么ID识别的？
- ID生态的趋势怎么变化？

---

## 一、移动端ID体系

### 安卓端
| ID | 状态 | 关键节点 |
|------|------|----------|
| IMEI | 基本退出（2025 Q4 <1%） | Android10起无法获取，仅系统签名应用可申请 |
| OAID | 当前主流（36-40%） | 信通院主导，匿名设备标识符，原值传输 |
| Android ID | 逐渐退出 | Android8起跨App不唯一，失去设备标识能力 |
| MAC | 逐渐退出 | Android10起随机MAC，失去唯一标识能力 |

### iOS端
| ID | 状态 | 关键节点 |
|------|------|----------|
| IDFA | 严重受限（仅31%可获取） | iOS14.5起需用户逐App授权，iOS14.5+覆盖率已达80%+ |
| CAID | 关键替代，回传率上升 | 中广协主导，P&G回传率82-90%，优于大盘 |
| OpenUDID | 即将下线 | iOS7起失效，UV计算不再使用，停止采集 |
| UDID/MAC | 早已不可用 | — |

### 媒体自定义ID
| ID | 来源 | 说明 |
|------|------|------|
| BDID | 字节跳动 | 字节系媒体品牌广告流量，P&G占比>30% |
| RED ID | 小红书 | 2022年4月上线，回传率接近100%，与设备ID 1:1占比74%+ |
| Ali ID | 阿里 | 阿里人群定向产品投放时上报 |
| Open ID | 微信 | 加密后的微信号，每个微信应用唯一 |
| JDID | 京东 | 2025年1月起纳入计算 |

### UUID取值优先级
IDFA > OAID > IMEI > CAID > AndroidID > OPENUDID > Windows Phone DUID > MAC

---

## 二、Mobile端关键数据

### P&G vs 大盘
- P&G DID获取率高达98%，高于大盘
- IMEI 2025 Q4 <1%，基本退出
- OAID稳定36-40%
- BDID因字节系投放增大，P&G占比>30%
- iOS14.5+覆盖率80%+，IDFA获取率仅31%（iOS流量中）
- CAID回传率稳步上升，P&G 82-90%，优于大盘

### 重点媒体特征
- DOUYIN/HONGGUO/FANQIE（字节系）：BDID为主
- WECHAT/TENCENT VIDEO/BAIDU：IDFA较突出
- BAIDU：Android ID占比>6%（因信息流用MMA SDK不具备OAID获取能力）
- LRB：DEVICE ID LOST高达48%（仅对少数广告主开放DID回参）
- LETV：Android ID占比53%

### RED ID
- 回传率接近100%（除3月Ecom活动不支持、8月火焰话题未加白）
- 与设备ID对应关系稳定：1:1占比74%+

---

## 三、OTT端关键发现

### 核心问题：MAC回传格式各异导致跨媒体打通困难

不同媒体回传MAC类型不同：
- 回传有线MAC：HUNANTV、LEBO(创维/海尔)、MORE TV、KONKA、LETV、WASU
- 回传无线MAC：Tencent、LEBO(TCL/飞利浦/海信/红米)、XIAOMI
- 与实际联网方式一致：YOUKU、HISENSE(2025年)
- 优先有线取不到取无线：MIGU、HuanTV、MIGU IPTV、FUTURE TV IPTV
- 同时回传有线+无线：IQIYI、HISENSE(2026.3起)

加密方式：
- 标准：大写去冒号后MD5（大多数媒体）
- 非标准：创维用去冒号小写后MD5 → 与其他媒体无法打通

### Overlap影响
- APK间重合率普遍低（大部分<10%）
- 不是真的独占高，而是MAC格式不一致导致无法匹配
- TENCENT与YOUKU重合率较高（YOUKU基于TENCENT 30%+），因MAC格式部分一致

### IPv6迁移
- 非同源服务器2024年4月已全部上线IPv6收数
- IPv6占比从9.3%→17.5%，但IPv4仍>80%
- IPv6地址充足后，单IP下MAC数量减少
- 同源媒体IPv6支持：TENCENT(2021.1)、IQIYI(2025.6)、KONKA/BILIBILI(2023.12)，其他暂不支持

### IP切换
- 80%+的MAC会在15天内发生IP切换
- MIGU IPTV的<1小时切换比例15.45%，显著高于其他媒体

---

## 四、DID规范调整

### OpenUDID下线
- UV计算不再使用OpenUDID
- 停止采集并应用OpenUDID
- MMA例会早在2020年底已提出去掉AndroidID及OpenUDID的倡议

### CAID传输格式升级
- 早期格式：`ver_CAID值`，如 `20210301_a56bce...`
- 广协最新版本：JSON格式（url_encode传输），含当前版本和上一版本CAID值
- 秒针两种格式均兼容
- CAID每3-6个月更新生成算法，需同时传更新前后版本

### CAID应用进展
- 2021年3月2日：AdMonitor监测代码全面支持__CAID__宏采集
- 2025年2月：CAID纳入UV计算
- 持续推进：NT项目中探索IDFA缺失下的测量验证方案

---

## 待确认
- [x] 鸿蒙OS细分 — 已确认需补充，对齐后发现是缺口
- [x] OTT SDK推进 — 希望不大，厂商/媒体不愿意做；作为topic列出，实际靠媒体对接时要求应传尽传、传到对应宏参数
- [x] 新增媒体ID — 今年没有新增计划，JDID量不大

## 小胡反馈（2026-07-27）
- 鸿蒙确实是补充项，对齐后发现要加
- Slide 22是漏斗转化比例，要结合色块和标签一起看
- OTT MAC标准化的SDK推进希望不大，厂商/媒体都不愿意做；实际靠媒体对接时越来越规范，要求应传尽传、传到对应宏参数
- 这份review只for P&G
- 今年没有新增其他媒体ID的计划
- IPv6与IVT是重要topic，但目前分析不够严谨
- Elsa发现OTT端只有IPV6的DID关联IP唯一性数据、缺少IPV4对比，且爱奇艺/咪咕/未来电视三个媒体IPV4切换更频繁，可能与优先取有线MAC地址有关。需进一步思考原因

## 内部修改清单（小胡 17:29 发送）
1. P4-增加鸿蒙操作系统，对应OAID
2. P5-加上鸿蒙：安卓4以下非纯血，安卓5以上纯血鸿蒙，安卓表格添加非纯血鸿蒙，新增纯血鸿蒙行
3. P6-删除标题中的OPENUDID
4. P9-鸿蒙25年开始区分操作系统，增加安卓/iOS/鸿蒙操作系统曝光分布
5. P10-标题DID改ID
6. P13-删除IMEI回传率图标
7. P30-Highlight太高、太低、相对比较高的Overlap占比
8. P31-将同媒体间100%的标灰
9. P38-需查甜甜的PPT或行业资料确认IPv6切换频率是否高于IPv4；若已证明更频繁，需增加分月分媒体IPv6&IPv4占比统计
10. 新增一页：SDK媒体是否开启OAID授权以及OAID回参占比统计
