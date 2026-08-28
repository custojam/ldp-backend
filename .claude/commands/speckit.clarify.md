Clarify the open questions in the current or most recent spec.

## Steps

1. Identify the spec to clarify:
   - If $ARGUMENTS contains a spec number or path, use that.
   - Otherwise find the most recently modified `spec.md` in `.speckit/specs/`.
2. Read the spec and extract all items under **Open Questions**.
3. For each open question:
   a. Attempt to resolve it from `CLAUDE.md`, the constitution, or the existing codebase.
   b. If it can be resolved, propose the answer and update the spec.
   c. If it cannot be resolved without user input, ask the user directly.
4. Once all questions are resolved:
   - Update the spec's **Status** from `Draft` to `Ready`.
   - Clear or strike through resolved questions.
   - Add a **Decisions** section recording what was decided and why.
5. Confirm that the spec is ready for planning.

## Output Format

For each question, show:
```
Q: [question text]
A: [resolved answer] — Source: [CLAUDE.md / codebase / user input]
```

After all questions are resolved, print a summary and prompt the user to run `/speckit.plan`.
