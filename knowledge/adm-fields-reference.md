# ADM 字段与宏参数注册表

> ⚠️ 高度保密，不可对外。小胡 2026-07-21 提供。

原始文件：`knowledge/adm-fields-reference.txt`（从PDF提取）

## 关键字段速查

### 设备ID相关
| 字段 | 宏参数 | 含义 | 采集方式 |
|------|--------|------|----------|
| m6 | __MAC1__ | 保留":"的大写MAC地址取MD5摘要 | 媒体回传/SDK |
| m6a | __MAC__ | 去除":"的大写MAC地址取MD5摘要 | 媒体回传/SDK |
| m6b | __MAC2__ | OTT端有线MAC地址(去冒号大写)，MD5加密 | 媒体回传/SDK |
| m6c | __MAC3__ | OTT端无线MAC地址(去冒号大写)，MD5加密 | 媒体回传/SDK |
| m6d | __MAC4__ | OTT端蓝牙MAC地址(去冒号大写)，MD5加密 | 媒体回传/SDK |
| m6o | __M6O__ | TVMonitor MAC地址原值 | SDK |
| macr | __MACR__ | TVMonitor MAC地址原值 | SDK |
| m10 | __ADID__ | Base64字符串，设备唯一性识别码 | SDK |
| m11 | __OAID__ | 手机厂商生成的OAID | 媒体回传/SDK |
| m11a | __OAID1__ | OAID的MD5值 | 媒体回传/SDK |

### 日志标识
| 字段 | 含义 |
|------|------|
| uuid | 最终的用户唯一标识 |
| idfrom | uuid的判定来源 |
| vuid | AdMonitor verify计算的同一用户标识 |

### IEEE匹配4种加密方式
- 去冒号大写（正规）：m6a对应的加密方式
- 去冒号小写：纯数字MAC时=去冒号大写（重复）
- 带冒号大写：m6对应的加密方式
- 带冒号小写：少数增量匹配

### MAC字段加密逻辑
所有m6系列字段都是**MAC地址的MD5摘要**，不是明文MAC：
- 12位明文MAC → MD5加密 → 32位hex
- 所以日志中的m6a/m6b/m6c都是32位hex是正常的
- IEEE库存储的也是加密后的MAC值，匹配是加密值对加密值

## Spid ↔ SpotsPlanId 转换关系

- **Spid**：base62编码的字符串形式（如 `95zDC`），用于API交互和界面展示
- **SpotsPlanId**：十进制整数形式（如 `134413966`），用于底层系统和数据库
- 两者是同一个点位的不同表示形式
- **转换场景**：需要底层数据恢复或直接操作数据库时用SpotsPlanId，API/界面操作用Spid
- 2026-08-19 ADM-5点位误删恢复案例：小胡提供SpotsPlanId（134413966）给黄春波完成恢复

## region_id 地域码（ADM 24位 vs TVM 10位）

ADM地域码是24位编码，TVM是10位。关键值：
- `000000000000000000000000`（24位0）= **Global**（全球）
- `000000000000000000000008` = **Mainland**（中国大陆）
- 两者的区别：全球包含海外流量，中国大陆不含
- `basic/show` API 不传 `by_region` 时默认 level0，同时返回 Global 和 Mainland 两条记录
- 拉数时必须按 region_id 过滤，否则每个点位会出多行
- 2026-10-15 踩坑：宝洁9月数据出现双行，根因就是没过滤 region_id
- 查询地域码：`GET /cms/v1/regions/show?region_id=xxx`，或 `GET /cms/v1/regions/list` 列出全部

## 来源
- 小胡 2026-07-21 在群聊中提供 PDF 文件
- 不可对外泄露
