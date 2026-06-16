# 教程：用 OpenSpec + Superpowers 实现 `add-todo-list`

本文用一个完整 demo 功能演示如何使用 `agent-spec-bridge`。默认流程使用 OpenSpec + Superpowers，不使用 GSD。最后有一个可选小节说明接入 GSD 时流程如何变化。

Demo 功能：

```text
新增一个内存 Todo List。
用户可以新增 todo、查看 todo 列表、标记 todo 完成。
不做登录、权限、持久化、网络接口、标签、搜索、排序。
```

## 0. 安装 Skills

把这些 skill 安装到当前 Agent 宿主：

```text
skills/openspec-to-tdd-plan
skills/spec-compliance-check
skills/spec-archive-gate
skills/gsd-spec-workflow
```

加入对应宿主的项目指令片段：

```text
Codex:       adapters/codex/AGENTS.md.snippet
Claude Code: adapters/claude/CLAUDE.md.snippet
```

本教程默认不会使用 `gsd-spec-workflow`。保留它只是为了让同一项目后续可以切换到 GSD 模式。

## 1. 创建 OpenSpec 变更

让 OpenSpec 创建变更：

```text
/opsx:propose add-todo-list
```

项目里应该出现：

```text
openspec/changes/add-todo-list/
  proposal.md
  design.md
  tasks.md
  specs/
    todo-list/
      spec.md
```

检查或让 Agent 修改这些文件，直到内容足够具体。

`proposal.md` 推荐形态：

```markdown
# Proposal: add-todo-list

## Background

项目需要一个最小本地 todo list，用于验证 OpenSpec 和 Superpowers 的桥接流程。

## Change

- 新增 Todo 模型
- 支持通过 title 新增 todo
- 支持查看 todo 列表
- 支持标记 todo 完成
- 列表中能看到 completed 状态

## Non-goals

- 不做登录
- 不做权限
- 不接数据库或持久化
- 不做网络 API
- 不做标签、搜索、排序
```

`design.md` 推荐形态：

```markdown
# Design

- 必须使用内存存储。
- Todo 必须包含 id、title、completed。
- 新增 todo 时 completed 必须默认为 false。
- 标记完成时只能修改 completed。
- 禁止引入数据库、用户、权限或网络层。
```

`spec.md` 推荐验收场景：

```markdown
### Requirement: Todo list basics

系统必须支持新增、查看、完成 todo。

#### Scenario: Add todo then list it

- Given the todo list is empty
- When the user adds "write docs"
- Then the list contains "write docs"
- And completed is false

#### Scenario: Mark todo complete

- Given the list contains an incomplete "write docs" todo
- When the user marks it complete
- Then completed is true
```

`tasks.md` 推荐清单：

```markdown
- [ ] Add Todo model
- [ ] Add TodoList service
- [ ] Support adding todos
- [ ] Support listing todos
- [ ] Support marking todos complete
- [ ] Run compliance and archive checks
```

## 2. 把 OpenSpec 转成 Superpowers 计划

不要直接开始实现。让 Agent 使用 `openspec-to-tdd-plan`：

```text
使用 agent-spec-bridge 处理 openspec/changes/add-todo-list。
使用 OpenSpec + Superpowers 模式。不要使用 GSD。
读取 proposal.md、design.md、tasks.md 和 specs/**/spec.md。
使用 openspec-to-tdd-plan 创建 docs/superpowers/plans/add-todo-list.md。
不要写生产代码，生成计划后停下来。
```

计划文件应该生成在：

```text
docs/superpowers/plans/add-todo-list.md
```

一个合格计划类似：

```markdown
# Plan: add-todo-list

Mode: OpenSpec + Superpowers

OpenSpec source:
- openspec/changes/add-todo-list/proposal.md
- openspec/changes/add-todo-list/design.md
- openspec/changes/add-todo-list/tasks.md
- openspec/changes/add-todo-list/specs/todo-list/spec.md

Rules:
- 每个代码任务使用 Superpowers TDD。
- 每个任务后运行 spec-compliance-check。
- /opsx:archive add-todo-list 前运行 spec-archive-gate。
- 本项目不使用 GSD。

## Task 1: Add Todo model

- [ ] 先写失败测试，验证 Todo 包含 id、title、completed
- [ ] 运行目标测试，确认按预期失败
- [ ] 实现最小 Todo 模型
- [ ] 再运行目标测试，确认通过
- [ ] 运行 spec-compliance-check

## Task 2: Add todo and list it

- [ ] 先写失败测试：新增 "write docs" 后列表能看到它
- [ ] 确认 completed 默认为 false
- [ ] 实现最小 TodoList add/list 行为
- [ ] 运行目标测试，确认通过
- [ ] 运行 spec-compliance-check

## Task 3: Mark todo complete

- [ ] 先写失败测试：标记 todo 完成
- [ ] 实现最小 complete 行为
- [ ] 确认 title 不变且 completed 为 true
- [ ] 运行 spec-compliance-check
```

执行前先审查计划。计划里不应该出现数据库、登录、网络、标签、搜索、排序等不做事项。

## 3. 使用 Superpowers TDD 执行

确认计划后，对 Agent 说：

```text
使用 Superpowers TDD 执行 docs/superpowers/plans/add-todo-list.md。
只执行 Task 1。
先写失败测试，运行并确认按预期失败，然后写最小实现。
任务通过后运行 spec-compliance-check。
```

后续每个任务重复同样模式：

```text
继续 add-todo-list。
只执行 docs/superpowers/plans/add-todo-list.md 里的下一个未完成任务。
使用 Superpowers TDD。
继续前先运行 spec-compliance-check。
```

任务循环是：

```text
写失败测试
运行目标测试，确认按预期变红
写最小生产代码
运行目标测试，确认变绿
只在测试保持绿色时重构
运行 spec-compliance-check
标记任务完成
```

## 4. 运行 `spec-compliance-check`

每个任务完成后，Agent 应该用 `spec-compliance-check` 对照当前 OpenSpec 变更和 diff。

提示词：

```text
对 openspec/changes/add-todo-list 运行 spec-compliance-check。
检查当前 diff 是否符合 proposal.md、design.md、tasks.md 和 specs。
报告通过/失败、缺失测试、不做事项违规、设计约束违规。
```

期望检查点：

- 新增 todo 有测试覆盖
- 查看列表有测试覆盖
- 标记完成有测试覆盖
- 新 todo 的 `completed` 默认为 false
- 标记完成不会修改 title
- 没有数据库、登录、权限、网络、标签、搜索、排序能力

如果合规检查失败，先修复缺陷，再继续下一个任务。

## 5. 运行 CLI 机械检查

CLI 负责确定性检查：

```bash
node cli/bridge.mjs check-shape add-todo-list
node cli/bridge.mjs collect-context add-todo-list
node cli/bridge.mjs archive-readiness add-todo-list
```

只要 `tasks.md` 还有未完成项，`archive-readiness` 就应该失败。它不能替代模型对实现质量的判断。

## 6. 运行 `spec-archive-gate`

归档、提交、发布或创建 ready PR 前：

```text
对 openspec/changes/add-todo-list 运行 spec-archive-gate。
当前项目使用 OpenSpec + Superpowers 模式，不使用 GSD。
因为没有使用 GSD，跳过 GSD verification。
如果测试、OpenSpec 校验或规格合规检查不完整，阻止归档。
```

闸门应该报告：

- OpenSpec 结构有效
- 所有任务完成或明确延期
- 验收场景有测试或手工验证证据
- 不做事项没有被违反
- 设计约束已满足
- 已运行 Superpowers verification-before-completion
- 被跳过的检查都有原因

闸门通过后，归档变更：

```text
/opsx:archive add-todo-list
```

## 7. 可选：接入 GSD Core

只有项目需要阶段状态、交接或分阶段验证时才使用 GSD。

GSD 模式下，从 `gsd-spec-workflow` 开始：

```text
使用 agent-spec-bridge 和 GSD 处理 openspec/changes/add-todo-list。
使用 gsd-spec-workflow 把这个 OpenSpec change 挂到当前 GSD phase。
然后使用 openspec-to-tdd-plan 把 tasks 转成测试优先 phase plan。
不要写生产代码，生成计划后停下来。
```

后续执行基本相同，但有三点变化：

- 计划属于当前 GSD phase，而不只是 `docs/superpowers/plans/add-todo-list.md`
- `spec-archive-gate` 前必须完成 GSD verification
- `spec-archive-gate` 必须报告 GSD verification 证据

## 总结

完整无 GSD 流程是：

```text
/opsx:propose add-todo-list
  -> openspec-to-tdd-plan
  -> docs/superpowers/plans/add-todo-list.md
  -> Superpowers TDD 任务循环
  -> 每个任务后 spec-compliance-check
  -> spec-archive-gate
  -> /opsx:archive add-todo-list
```

