---
name: dms-query
description: "Run a Hive SQL query on the internal DMS platform (dms.mininglamp.com). Handles login, SQL submission, status polling, and result retrieval. Use when asked to query DMS, run Hive SQL, or check data in the daas data warehouse (ods_adm_bus, ods_tvm_bus, dim_adm_babel, dim_tvm_babel, etc.)."
argument-hint: <hive-sql>
allowed-tools: Bash, Read
disable-model-invocation: true
---

# DMS Hive Query Skill

Execute a Hive SQL query against the internal DMS data platform.

## Workflow

### Step 0: Get credentials

Ask the user for their DMS credentials before proceeding:

> Please provide your DMS login credentials (username and password) to execute this query.

Store the username and password in variables. **CRITICAL: Never pass credentials as command-line arguments. Never echo or log the password. Always use environment variables.**

### Step 1: Execute the query

Run the helper script with credentials passed as **environment variables** (never as CLI arguments):

```bash
DMS_USER="<username>" DMS_PASS="<password>" bash ~/.openclaw-gugu/workspace-gugu/skills/dms-query/dms_query.sh "<sql>"
```

Environment variables are NOT visible in `ps aux` or the tool call display, unlike CLI arguments.

The script handles login, SQL submission, polling, and result retrieval. It outputs:
- **stderr**: Progress messages (login, submission, polling status, completion)
- **stdout**: JSON result with structure `{"success": true/false, "columns": [...], "rows": [...], ...}`

### Step 2: Display results

Parse the JSON output and format it for the user:

1. **Success**: Display a markdown table with column headers and data rows. Show query time and row count.
2. **Failure**: Display the error message and any log output. Common errors:
   - Login failed: Wrong credentials
   - SQL submission failed: Syntax error or permission issue
   - Query timeout: Query ran longer than 10 minutes
   - Query failed: Hive execution error (show the log)

### Step 3: Follow-up

After displaying results, ask the user if they need:
- Result export (CSV)
- Modified query
- Further analysis

## Important notes

- The DMS platform is at `https://dms.mininglamp.com`
- Database: `daas` (Hive, dsId=1, dbId=1)
- Default proxy user: `mz_supertool`
- Default queue: `root.marvel.dms`
- Queries can take 30s to several minutes for large scans
- Maximum poll time: 10 minutes (60 polls x 10s interval)
- Results are capped at 500 rows per page; for larger results, note this limitation to the user

## 实战踩坑经验（2026-11-19 大表 join 场景）

### 问题1：大表 join + GROUP BY 导致 Reducer 长尾严重倾斜
- **场景**：事实表（ods_adm_bus，日18-22亿条）join 维度表（dim_adm_babel）按 dt 分组统计
- **现象**：1024 reducer 卡在 99%，30+ 分钟不出结果，连续两个 queryHistId 都卡死
- **根因**：按 dt 分组时，某些 dt 的数据量远超其他，导致 reducer 分配极度不均

### 问题2：DMS 平台 Hive 参数不生效
- **现象**：submit 时传 `hive.exec.reducers.max=60` 等参数，queryStatus.settings 里只剩 `mapreduce.job.queuename`，其他参数全被平台吞掉
- **影响**：无法通过调参数优化查询性能
- **应对**：在 SQL 层面优化（如切片、避免复杂 join），不依赖平台参数

### 问题3：DMS 并发上限 6 条/账号
- **现象**：submit 返回"同时执行任务过多, 当前查询量：6条，最大执行量：6条"
- **影响**：老任务占坑不释放时，新任务无法提交
- **限制**：无 cancel 接口（`/hive-query/cancel-query` 和 `/stop` 都 404）
- **应对**：控制并发提交节奏，避免一次性提交过多任务

### 有效打法：维度表先取 ID → 事实表按时间切片直查
1. 先从维度表拉出目标 spots_id 列表（如 `SELECT spots_id FROM dim_adm_babel WHERE advertiser_name = 'KA-慎用' AND media_name LIKE '%哔哩哔哩%'`）
2. 将时间范围按 5 天切片，每个切片独立提交查询
3. 事实表查询用 `WHERE mz_spot_id IN (...) AND dt BETWEEN ... AND ...`，不做 join
4. 只做 `COUNT(*)` 或简单聚合，不做 `COUNT(DISTINCT ...)`
5. 6 切片并发提交，单片 112-268 秒完成

### 其他注意事项
- `is_homologous` 字段在 ods_adm_bus 中标记是否同源服务器流量（1=同源）
- 维度表 media_name 字段对同一媒体可能有多种写法（如"哔哩哔哩/B站/bilibili/Bili"），查询时需用 LIKE 匹配多种

## Table schema reference

**IMPORTANT**: Before writing any SQL, you MUST read the full table schema file to understand available fields, types, and join relationships:

```
~/.openclaw-gugu/workspace-gugu/skills/dms-query/schema.md
```

This file contains the complete column definitions for all 4 tables (133 + 86 + 61 + 61 fields), data types, partition keys, field descriptions, and table join relationships. If the user describes a query scenario without specifying exact SQL, read this file first to determine the correct field names and write the SQL yourself.
