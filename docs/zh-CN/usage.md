# 使用说明

本文说明如何在 Codex 或 Claude Code 中使用 `agent-spec-bridge`。

## 前置条件

- Node.js `20.19.0` 或更高版本
- 目标项目已经初始化 OpenSpec
- 当前 Agent 宿主已经启用 Superpowers
- 需要阶段化执行时，项目中可使用 GSD Core
- Codex 或 Claude Code 支持自定义 Skills

## 安装 Skills

复制以下目录：

```text
skills/gsd-spec-workflow
skills/openspec-to-tdd-plan
skills/spec-compliance-check
skills/spec-archive-gate
```

推荐目标路径：

```text
Codex 用户级 skills:       ~/.codex/skills/ 或 ~/.agents/skills/
Codex 项目级 skills:       .codex/skills/
Claude Code 用户级 skills: ~/.claude/skills/
Claude 项目级 skills:      .claude/skills/
```

然后把对应片段加入项目级指令：

```text
Codex:       adapters/codex/AGENTS.md.snippet
Claude Code: adapters/claude/CLAUDE.md.snippet
```

## 推荐工作流

### 1. 创建 OpenSpec 变更

在目标项目中：

```text
/opsx:propose add-payment-callback-idempotency
```

检查生成文件：

```text
openspec/changes/add-payment-callback-idempotency/
  proposal.md
  design.md
  tasks.md
  specs/**/spec.md
```

一个适合桥接执行的 OpenSpec change 应该包含：

- 清楚的变更范围
- 不做事项
- 可验收场景
- `design.md` 中的“必须”和“禁止”约束

### 2. 先生成计划，不要直接实现

推荐提示词：

```text
使用 agent-spec-bridge 处理 openspec/changes/add-payment-callback-idempotency。
读取 proposal.md、design.md、tasks.md 和 specs/**/spec.md。
把 OpenSpec tasks 转换成 GSD/Superpowers 测试优先执行计划。
不要写生产代码，生成计划后停下来给我确认。
```

Agent 应该加载：

- `gsd-spec-workflow`
- `openspec-to-tdd-plan`

计划中至少要说明：

- OpenSpec change id
- GSD phase 或临时计划路径
- 验收场景
- 不做事项
- 设计约束
- 第一个失败测试是什么
- 目标验证命令是什么

### 3. 一次只执行一个任务

确认计划后：

```text
按已确认计划继续。一次只执行一个任务，使用 Superpowers TDD。
每个任务完成后运行 spec-compliance-check，通过后再继续下一个任务。
```

期望循环：

```text
写失败测试
运行目标测试并确认按预期失败
写最小生产代码
运行目标测试并确认通过
只在测试保持绿色时重构
运行 spec-compliance-check
更新任务状态
```

### 4. 归档前运行闸门

归档、提交、发布或创建 ready PR 前：

```text
对 add-payment-callback-idempotency 运行 spec-archive-gate。
如果测试、OpenSpec 校验、GSD verification 或规格合规检查不完整，阻止归档。
```

## CLI 检查

CLI 做机械检查，不判断代码是否真正满足业务规格。

```bash
node cli/bridge.mjs check-shape add-payment-callback-idempotency
node cli/bridge.mjs collect-context add-payment-callback-idempotency
node cli/bridge.mjs archive-readiness add-payment-callback-idempotency
```

如果不在项目根目录，可以传直接路径：

```bash
node cli/bridge.mjs collect-context ./openspec/changes/add-payment-callback-idempotency
```

## 推荐提示词

只生成计划：

```text
使用 agent-spec-bridge 为 openspec/changes/add-todo-list 生成计划。
读取所有 OpenSpec 文件，创建测试优先执行计划，不要改代码。
```

继续执行：

```text
继续 add-todo-list 的当前 GSD 阶段。
只执行下一个任务，使用 Superpowers TDD，完成后运行 spec-compliance-check。
```

归档检查：

```text
对 add-todo-list 运行 spec-archive-gate。
如果任何闸门失败，报告阻塞项，不要归档。
```

## 常见失败模式

| 失败表现 | 处理方式 |
| --- | --- |
| Agent 没读 OpenSpec 就开始改代码 | 停止，重新从 `gsd-spec-workflow` 开始 |
| Agent 把 `tasks.md` 当成实现计划 | 用 `openspec-to-tdd-plan` 拆成 TDD 任务 |
| Agent 忽略“不做事项” | 运行 `spec-compliance-check`，按缺陷处理 |
| 测试失败仍然归档 | 运行 `spec-archive-gate` 并阻止归档 |
| 存在多个活动 change | 让用户先选择一个 change id |

## 当前边界

- 安装器还没有最终定型。
- eval 场景已经列出，但还没有完全自动化跑通 Codex 和 Claude。
- CLI 只覆盖机械检查。
- Skills 仍是 alpha，团队级使用前应在真实项目中压测。

