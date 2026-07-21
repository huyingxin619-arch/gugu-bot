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

## 来源
- 小胡 2026-07-21 在群聊中提供 PDF 文件
- 不可对外泄露
