# mlamp 网关 API Key 更换 SOP

## 前置确认

1. 确认要换的实例（gugu / adm / adm_ceshi 等），只动自己管辖的实例
2. 确认新 key 已就绪
3. **不要手动改 JSON 文件里的 apiKey**，OpenClaw 有 auth profile 机制，手动改不认

## 步骤

### 1. 注册新 Key

```bash
# 确保用 nvm 的 node 24，不能用 homebrew 的旧版
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"; nvm use 24

# 注册新 key（会写入 auth-profiles 并同步 config）
openclaw models auth paste-api-key --provider custom-llm-gateway-mlamp-cn
# 然后粘贴新 key，回车
```

输出示例：
```
Updated config: ~/.openclaw-gugu/openclaw.json
  Backup: ~/.openclaw-gugu/openclaw.json.bak
Auth profile: custom-llm-gateway-mlamp-cn:manual (custom-llm-gateway-mlamp-cn/api_key)
```

### 2. 验证注册结果

```bash
openclaw models auth list
```

确认新 profile 出现在列表中。如果有 cooldown（旧 key 失败留下的），需要重启 gateway 清除。

### 3. 重启 Gateway

```bash
openclaw gateway restart --profile gugu
```

### 4. 验证生效

- gateway 重启后，发一条消息确认 LLM 正常响应
- 如果能正常回复，说明新 key 已生效

## 注意事项

- **不要改 main agent 的配置**，main 不在 gugu 管辖范围内
- openclaw.json 里的 apiKey 字段可能是旧值（fallback），实际认证走 auth-profiles 机制，不用纠结
- 如果 `openclaw` 命令报 node 版本不够，先 `nvm use 24`
- 各实例独立操作，gugu 的 HOME 是 `~/.openclaw-gugu`

## 实例 Key 分布（2026-08-25 盘点）

| 实例 | 端口 | HOME 目录 |
|------|------|-----------|
| gugu | 18790 | `~/.openclaw-gugu` |
| adm | 18789 | `~/.openclaw` |
| adm_ceshi | 18792 | `~/.openclaw-adm_ceshi` |
| adm_pm | 18791 | `~/.openclaw-adm_pm` |
| hyx_octic | 18793 | `~/.openclaw-hyx_octic` |
| sanjiu | 未运行 | `~/.openclaw-sanjiu` |
| meet/prd/test | — | 空目录，无配置 |
