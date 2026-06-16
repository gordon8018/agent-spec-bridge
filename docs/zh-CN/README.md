# agent-spec-bridge

`agent-spec-bridge` 是一组可同时用于 Codex 和 Claude Code 的 Agent
Skills 与轻量工具，用来把 OpenSpec 和 Superpowers 串成一个规格驱动开发闭环；需要阶段化管理时，也可以接入 GSD Core。

当前状态：`0.1.0-alpha.0`。这是早期版本，已经包含可用的技能骨架、CLI 机械检查和基础测试，但还需要继续补充跨 Codex / Claude 的压力场景评估。

## 它解决什么问题

OpenSpec 能写清楚需求，Superpowers 能约束 TDD 和验证，GSD Core 能管理阶段状态。GSD Core 是可选的；不用 GSD 时，本项目仍然支持 OpenSpec + Superpowers 的完整闭环。

`agent-spec-bridge` 负责中间这层桥接：

- 让 Agent 改代码前必须读取 OpenSpec 变更
- 把 OpenSpec 的需求任务转换成测试优先的执行任务
- 使用 GSD 时，把 GSD 阶段计划和 OpenSpec 范围绑定起来
- 每个实现任务后做规格合规检查
- 归档、提交、PR、发布前运行归档闸门

核心原则：

```text
OpenSpec 管产品意图。
Superpowers 管工程纪律。
GSD Core 管项目执行状态，但只有在项目启用 GSD 时才参与。
agent-spec-bridge 管三者交接契约。
```

## 技能包

```text
skills/
  gsd-spec-workflow/      项目级路由和事实源契约
  openspec-to-tdd-plan/   OpenSpec 任务转 TDD 执行计划
  spec-compliance-check/  对照 OpenSpec 检查实现是否合规
  spec-archive-gate/      归档、提交、PR、发布前闸门
```

这些 Skill 只使用通用的 `SKILL.md` 字段：`name` 和 `description`。Codex / Claude 的宿主差异放在 `adapters/` 目录。

## 快速开始

1. 在你的 Agent 宿主中安装 OpenSpec 和 Superpowers。只有需要阶段化执行时才安装 GSD Core。
2. 把本仓库的 `skills/*` 复制到 Codex 或 Claude Code 的 skills 目录。
3. 把对应项目指令片段加入项目：

   ```text
   Codex:       adapters/codex/AGENTS.md.snippet
   Claude Code: adapters/claude/CLAUDE.md.snippet
   ```

4. 在业务项目里创建或选择一个 OpenSpec change。
5. 让 Agent 先生成测试优先执行计划，确认后再写生产代码。

示例提示词：

```text
使用 agent-spec-bridge 处理 openspec/changes/add-payment-callback-idempotency。
先读取 proposal.md、design.md、tasks.md 和 specs/**/spec.md。
把 OpenSpec 任务转换成测试优先执行计划，不要先写生产代码，生成计划后停下来等我确认。
```

完整流程见：[使用说明](usage.md)。

完整 demo 教程见：[tutorial-add-todo-list.md](tutorial-add-todo-list.md)。

## 典型流程

OpenSpec + Superpowers：

```text
OpenSpec change
  -> openspec-to-tdd-plan
  -> Superpowers TDD 执行
  -> 每个任务后 spec-compliance-check
  -> spec-archive-gate
  -> OpenSpec archive / PR / ship
```

OpenSpec + Superpowers + GSD：

```text
OpenSpec change
  -> gsd-spec-workflow
  -> openspec-to-tdd-plan
  -> Superpowers TDD 执行
  -> 每个任务后 spec-compliance-check
  -> GSD verification
  -> spec-archive-gate
  -> OpenSpec archive / PR / ship
```

## CLI

CLI 只负责确定性检查，不替代模型判断。

```bash
npm test
npm run validate
node cli/bridge.mjs check-shape <change-id-or-path>
node cli/bridge.mjs collect-context <change-id-or-path>
node cli/bridge.mjs archive-readiness <change-id-or-path>
```

## 许可证

MIT。
