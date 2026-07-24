# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## 每日凌晨 1:55 — 落盘兜底检查（备份前最后一道）
回顾当天是否有未落盘的实质内容。判断标准：这个内容以后会不会影响我的工作（项目追踪、决策框架、策略分析、文档管理）。如有遗漏立即补写。

## 每日凌晨 3:00 — 备份前扫描
执行前先读 `memory/workflow-rules.md` 中的「每日备份前扫描」规则，
扫描当日 `memory/YYYY-MM-DD.md`，提炼内容到对应文件后再执行 git backup。
