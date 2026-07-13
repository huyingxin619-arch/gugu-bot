# Admonitor 计算链路

> 这是产品基础知识，不是项目，不需要追踪进展。

---

## 数据层级

| 数据类型 | 说明 |
|----------|------|
| **Gross** | 实时计算产出，不过滤任何 IVT |
| **Net** | 基础计算产出，只过滤 GIVT |
| **Total Net** | IVT计算后 DR 重跑产出，过滤 GIVT + SIVT |

---

## 计算链路

### 实时计算
→ 产出 **Gross** 数据

### 基础计算（三阶段）

| 阶段 | 名称 | 说明 |
|------|------|------|
| 1 | **ETL** | 日志清洗规整，不碰业务逻辑 |
| 2 | **DM（Daily Merge）** | 日合并 |
| 3 | **DR（Daily Report）** | 按布点信息过滤，产出 **Net**（只过滤 GIVT）|

### IVT 计算完成后
→ DR **重跑一遍**，产出 **Total Net**（过滤 GIVT + SIVT）

---

## 关键原则

- **布点过滤发生在 DR 阶段**，ETL 只做清洗，不处理业务逻辑
- GIVT = General Invalid Traffic（通用无效流量）
- SIVT = Sophisticated Invalid Traffic（复杂无效流量）
