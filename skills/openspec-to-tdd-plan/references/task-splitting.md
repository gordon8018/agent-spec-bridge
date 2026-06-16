# Task Splitting

Convert OpenSpec tasks into TDD tasks by mapping:

- requirement -> test name
- scenario -> assertions
- design "must" -> code review gate
- design "must not" -> forbidden implementation pattern
- non-goal -> diff review boundary

Example:

```text
OpenSpec task:
- [ ] Add payment callback idempotency

TDD tasks:
1. Reject duplicate callback side effects for same channel and pay trade number
2. Return success for already processed duplicate callback
3. Preserve one OrderPaidEvent under concurrent duplicate callbacks
```

Do not group schema, service behavior, event behavior, and archive checks into
one execution task.

