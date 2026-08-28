Break the current plan into atomic, implementable task files.

Target spec/plan (optional): $ARGUMENTS

## Steps

1. Read the plan (`plan.md`) for the target feature.
2. Create a `tasks/` subdirectory inside the spec folder if it does not exist.
3. Break the plan into atomic tasks — each task should:
   - Be completable in a single Claude Code session.
   - Have clear, testable acceptance criteria.
   - Touch the fewest files possible (ideally ≤5).
   - Not depend on tasks that haven't been numbered yet.
4. Write one file per task: `tasks/NNN-task-name.md`.
5. Create `tasks/index.md` listing all tasks with status.

## Task File Template (`NNN-task-name.md`)

```markdown
# Task NNN — [Task Name]

**Plan:** [link to plan.md]
**Status:** Pending | In Progress | Done | Blocked
**Depends on:** [task numbers or "none"]

## What to Build
Short description of exactly what this task produces.

## Files to Touch
List **both** source files **and** their spec files.
- `src/services/brokerService.ts` — what changes
- `src/routes/brokers.ts` — what changes
- `specs/broker.spec.ts` — what test cases are added/updated

## Implementation Notes
Step-by-step hints for the implementer. Per constitution §VII (TDD),
the first step MUST be: *write the failing test, confirm it fails,
then write the source change*.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] `npm test` passes with zero failures.

## Tests to Write
- `specs/broker.spec.ts` — `it('should return all brokers')`, `it('should throw if broker not found')`
```

## tasks/index.md Template

```markdown
# Tasks Index — [Feature Name]

| # | Task | Status | Depends On |
|---|------|--------|------------|
| 001 | [task name] | Pending | — |
```

**Test rule (NON-NEGOTIABLE, per constitution §VII):**
- Every task that adds or changes a service method or route MUST list
  its `specs/*.spec.ts` counterpart in `Files to Touch` AND list
  specific `it(...)` cases under `Tests to Write`.
- Test work is part of the task — it is **not** a separate follow-up.

After writing all task files, print the full task list and prompt the user to run
`/speckit.implement 001` to start the first task.
