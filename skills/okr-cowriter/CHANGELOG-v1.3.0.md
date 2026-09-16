# okr-cowriter v1.3.0 CHANGELOG

## 质检体系对齐 critic（REVIEW 段重写）
1. REVIEW 段首增加独立质检员视角切换指令（执行前读 agents/critic.md，假设未参与写作）
2. 硬性清单补 4 条：单个 KR ≥10%、外部锚定三选一、Owner 是一个人、KR 描述即目标（不填 targetValue）
3. 探索型 KR（EKR）硬性门槛补齐（假设/验证方式/成功信号/kill signal/资源上限/学习截止日期）
4. 新增 O-KR 一致性三测试（必要性/充分性/因果链），FAIL 级
5. 质量建议升级为质量追问三问（挑战性 0.6-0.7 / 假设脆弱性+Plan B / 覆盖度），输出对齐 critic 质检报告模板

## 安全闸门
6. 核心铁律新增第 8 条：任何 POST/PUT/DELETE 前必须先 read 对应 references/cli/<接口>.md，禁止凭记忆构造 body

## 状态机瘦身（O-DRAFTING / O-VALIDATION / WRITING）
7. O-DRAFTING：4 条追问场景压成流程骨架，话术指向 conversation-guide.md
8. O-VALIDATION：三问改为指向 quality-rules.md「O的检验三问」，删重复硬标准行
9. WRITING：五层堆叠压成紧凑流程，硬性标准统一指向 quality-rules.md 兜底

## reference 重组（方法论 5 → 3）
10. writing-guide.md 并入 quality-rules.md（质检+正反示例+常见错误，唯一标准源）
11. examples.md 并入 conversation-guide.md（话术+完整对话示例）
12. okr-basics.md 保留独立（知识问答入口）
13. SKILL.md 参考文件清单同步更新，删除死链

## 瘦身与去重（425 → 359 行）
14. 接口速查表 26 行 → 10 行高频最小集合
15. SUBMITTED 段删除重复「提交接口汇总」，保留 KR 写操作强约束（full 接口唯一入口）
16. Alignment 段删除重复接口步骤，保留 alignmentSuggestionContext 强制处理规则
17. 删除「标准调用模式」bash 示例链，指向 references/cli/examples.md
18. 高危写接口补最小 body 骨架（objectives/{id}/full 的 JSON 示例 + alignments 必填字段）

## 结构清理
19. 删除死文档 agents/cowriter.md（cowriter 过程由 SKILL.md 状态机主体完整承载）；agents/ 仅保留 critic.md
20. 版本号 → 1.3.0 全量同步：SKILL.md frontmatter / 标题 / X-Skill-Version 说明 / scripts/call.sh / scripts/call.js
