# IEEE OUI匹配率分析

> 挂靠项目：智屏视界(ZPSJ)视频像素验证
> 关联领域：IVT/异常流量排查
> 创建：2026-07-21

## 背景

KA客户（宝洁）的OTT投放中，需要对设备MAC进行IEEE OUI匹配以验证设备真实性。
技术侧（吴坤城）用4种加密方式跑了IEEE匹配，结果有部分MAC匹配不上。

## 4种加密方式

| 方式 | 说明 | 性质 |
|------|------|------|
| 去冒号大写 | 原始MAC去冒号大写后取MD5 | 正规加密，主匹配 |
| 去冒号小写 | 原始MAC去冒号小写后取MD5 | 纯数字MAC时=方式1(重复) |
| 带冒号大写 | 原始MAC带冒号大写后取MD5 | 纯数字MAC时与方式1重复 |
| 带冒号小写 | 原始MAC带冒号小写后取MD5 | 少数增量匹配 |

## 数据概况

### 小米0627（caid=4142538）
- 31nGx：total=57360，去重后匹配率100%（含81个带冒号小写增量）
- 31lHe：total=3575，匹配率99.94%
- 纯数字MAC 247个（千分之4.3），导致方式2/3重复

### 海信0709（4个活动，8个spid）
- SAFEGUARD(a/c/e/g组)：总UV 198751，匹配率99.99%，未匹配19个
- BRAUN(b/d/f/h组)：总UV 198645，匹配率98.89%，未匹配2202个
- 两组TVM投放量级几乎相同，但触达设备几乎零交集
- b/d/f/h组未匹配率是a/c/e/g组的100倍

## 关键分析结论

1. **未匹配UUID与匹配上的在所有字段结构上完全一致**
   - uuid=m6a=m6b（三者相同）
   - 全部32位MD5，全部m=12，全部SmartTV，全海信
   - 设备Build型号无特异性

2. **MD5不可逆**，无法从加密值反推原始MAC的OUI前缀

3. **MAC不在IEEE库 ≠ 异常流量**
   - 可能原因：IEEE库版本旧、本地管理MAC、未注册OUI、虚拟MAC等
   - AdMonitor的IVT规则里没有"MAC不在IEEE库"这条
   - 1.11%未匹配率不算高，无刷量特征

4. **b/d/f/h组未匹配率更高的原因**
   - 不是字段结构问题
   - 两组触达设备群体几乎完全不同（仅16个交集/19737总UUID）
   - 可能是BRAUN受众包触达了更多MAC不在IEEE库的设备

## 踩坑

1. 误判m6b为非MAC（32位=MD5加密后正常长度，不是"不是MAC"）
2. 误判m字段=SDK类型（m是媒体ID不是SDK类型）
3. no_match.txt混入了其他活动数据（VIDAA_TV 169个UUID是副产品）
4. 混淆Build型号和Android版本——两个是不同维度，不能互相替代。Build型号是固件版本号，Android版本是操作系统版本。被小胡纠正

## 字段知识

详见 `knowledge/adm-fields-reference.md`（⚠️高度保密不对外）

关键：
- m6a = 去冒号大写MAC的MD5
- m6b = OTT有线MAC的MD5
- m6c = OTT无线MAC的MD5
- uuid = 最终用户唯一标识
- idfrom = uuid判定来源

## 待办

- [x] 追秒针内部技术侧OUI查询结果（cron已设7/23 11:00）
  - 这是秒针内部的事，不是海信侧
  - 匹配上的MAC对应OUI都是哪些厂商
  - 未匹配MAC的原始OUI前缀
  - 判断是IEEE库版本问题还是异常

## 7/23 技术侧OUI查询结果分析

### 数据文件
- 技术侧提供了filtered数据（匹配上的MAC + IEEE OUI信息）
- 小米：xiaomi_20260627_filtered.csv（57360行）
- 海信：hisense_20260709_filtered_part_00~05.csv（6个文件，共395175行）
- 文件存于 /tmp/ieee-data/
- 未匹配MAC的原始OUI前缀无法获取（MAC是MD5回传，不可逆）

### 小米OUI分布
- Sichuan AI-Link Technology Co.：77.09%（代工厂）
- FN-LINK TECHNOLOGY Ltd.：22.76%（代工厂）
- Beijing Xiaomi Electronics Co.：0.14%
- matchType：upper 99.96%，lower/maohaoLower 0.04%（199条非upper）
- 小米自己的OUI占比极低，基本都是代工厂的网卡芯片

### 海信OUI分布
- HISENSE VISUAL TECHNOLOGY CO.：52.97%
- Hisense Electric Co.：21.66%
- Qingdao Hisense Electronics Co.：14.66%
- Qingdao Hisense Communications Co.：10.71%
- matchType：100% upper，全部匹配上
- 海信系OUI占100%，设备都是海信自产

### 未匹配 vs 匹配上 对比分析

#### UUID交集
- 未匹配SmartTV 595个UUID，与匹配上104644个UUID零交集
- 再次确认BRAUN组和SAFEGUARD组触达设备群体完全不同

#### 设备型号（Build型号）
- 未匹配Top5：MRA58K(34.7%)、OPR6(22.7%)、KTU84P(20.3%)、OPR5(12.2%)、NRD90M(5.7%)
- 匹配上Top5：PPR2.180905(48.8%)、MRA58K(9.7%)、KTU84P(7.9%)、KOT49H(6.6%)、PPR1.180610(5.1%)
- 每个Build型号都有匹配上和未匹配的，不存在“全部未匹配”的型号
- UUID级别未匹配率：OPR5 3.5%、OPR6 3.0%、MRA58K 2.0%、KTU84P 1.5%
- 结论：设备型号不是未匹配的根因

#### Android版本
- 未匹配：Android 8.0(34.8%)、6.0(34.7%)、4.4.4(20.3%)、7.0(5.7%)、8.1(3.1%)、9(0.2%)
- 匹配上：Android 9(53.9%)、6.0(9.7%)、4.4.4(7.9%)、4.4.2(6.6%)、8.0(5.9%)
- Android版本也不是决定因素，每个版本都有匹配上和未匹配的

### 结论

1. 匹配上的设备OUI全部是对应品牌（海信=海信系，小米=代工厂），验证了设备真实性
2. 未匹配的MAC无法反推原始OUI前缀（MD5不可逆），无法判断未匹配MAC属于哪些厂商
3. 设备型号和Android版本都不是未匹配的根因，未匹配分散在多个型号中
4. MAC不在IEEE库 ≠ 异常流量，IVT规则里没有这条，未匹配设备无刷量特征
5. 最可能的原因：个别网卡芯片未注册OUI或IEEE库版本未覆盖，但无法进一步验证

### 踩坑补充

4. 混淆Build型号和Android版本——两个是不同维度，不能互相替代。Build型号是固件版本号，Android版本是操作系统版本。已被小胡纠正，更新AGENTS.md触发式自检第6条

## 相关文件

- 日志分析详情：`memory/2026-07-21.md`
- 字段注册表：`knowledge/adm-fields-reference.md`
- 项目主文件：`projects/zpsj-video-verification.md`
