Implement a specific task from the task list.

Task to implement: $ARGUMENTS (e.g., "001" or "001-docker-setup" or path to task file)

## Steps

1. Resolve the task file:
   - If $ARGUMENTS is a number like "001", find `tasks/001-*.md` in the most recent spec.
   - If $ARGUMENTS is a full path, use it directly.
   - If no argument, find the first task with Status: Pending.
2. Read the task file fully.
3. Check dependencies — confirm all listed dependent tasks are Done.
4. Read all files listed under **Files to Touch** to understand current state before editing.
5. Implement the task:
   - Follow the implementation notes.
   - Write code that satisfies every acceptance criterion.
   - Write or update tests as specified.
   - Do not change files outside the listed scope without noting it.
6. After implementation:
   - Run any relevant tests and fix failures.
   - Update the task file Status to `Done`.
   - Update `tasks/index.md` to reflect Done status.
   - Print a summary of what was changed.
7. Ask the user: "Task NNN is complete. Run `/speckit.implement NNN+1` to continue?"

## Guardrails

- Read before writing — always read a file before modifying it.
- If a file doesn't exist yet, confirm it's listed as CREATE in the plan before creating it.
- Do not skip acceptance criteria — implement all of them.
- If blocked, update Status to `Blocked`, note the blocker in the task file, and report it.
- Prefer editing existing patterns over introducing new abstractions.
