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

## Table schema reference

**IMPORTANT**: Before writing any SQL, you MUST read the full table schema file to understand available fields, types, and join relationships:

```
~/.openclaw-gugu/workspace-gugu/skills/dms-query/schema.md
```

This file contains the complete column definitions for all 4 tables (133 + 86 + 61 + 61 fields), data types, partition keys, field descriptions, and table join relationships. If the user describes a query scenario without specifying exact SQL, read this file first to determine the correct field names and write the SQL yourself.
