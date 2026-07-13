# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## 每日凌晨 3:00 — 备份前扫描
执行前先读 `memory/workflow-rules.md` 中的「每日备份前扫描」规则，
扫描当日 `memory/YYYY-MM-DD.md`，提炼内容到对应文件后再执行 git backup。
