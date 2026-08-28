Generate a technical plan for the current spec.

Tech stack override (if provided): $ARGUMENTS

## Steps

1. Read `.speckit/memory/constitution.md`.
2. Identify the target spec:
   - If $ARGUMENTS contains a spec path, use it.
   - Otherwise use the most recently modified spec with Status: Ready.
3. Confirm the spec status is `Ready` (not `Draft`). If still Draft, stop and ask the user to
   run `/speckit.clarify` first.
4. Write `.speckit/specs/YYYY_MM_DD_HHMMSS_feature-name/plan.md` using the template below.
5. If the feature involves data persistence, also write `data-model.md`.
6. Update the spec's **Status** to `Planned`.

## plan.md Template

```markdown
# Plan YYYY_MM_DD_HHMMSS — [Feature Name]

**Spec:** [link to spec.md]
**Status:** Draft | Ready | In Progress | Done
**Created:** YYYY-MM-DD

## Technical Approach
Describe the approach and why it was chosen over alternatives.

## Tech Stack
List the specific technologies, versions, and libraries used.

## Architecture Diagram (optional)
ASCII diagram of how components interact.

## File Changes
List every file that will be created, modified, or deleted —
**including test files**. A row for the source file without a row for
its test file is incomplete.

| Action | File | Reason |
|--------|------|--------|
| CREATE | src/services/brokerService.ts | New service |
| CREATE | src/routes/brokers.ts | New router |
| CREATE | specs/broker.spec.ts | Jest coverage for broker service |

## API / Route Contracts
Define new or changed routes, request shapes, and response shapes.

## Database Changes
List Prisma schema changes needed (new models, fields, relations).

## Error Handling
How failures are surfaced (status codes, error messages).

## Security Considerations
Auth middleware, input validation, authorization checks.

## Testing Plan

### Jest (`specs/`)
List every spec file that will be created or modified, with a one-line
description of what each new test covers (constitution §VII).

| Test file | Action | What it covers |
|---|---|---|
| `specs/broker.spec.ts` | CREATE | getAllBrokers, createBroker happy path and failure paths |

## Risks & Mitigations
Known unknowns and how to handle them.
```

**Test rule (NON-NEGOTIABLE):** A plan that adds or modifies a service
method or route without a corresponding row in the File Changes table
AND a Testing Plan entry is incomplete. Stop and add them before continuing.

## data-model.md Template

```markdown
# Data Model — [Feature Name]

## Prisma Models

### [ModelName]
| Field | Type | Notes |
|-------|------|-------|
| id | Int @id @default(autoincrement()) | Primary key |

## Relationships
Describe Prisma relations between models.

## Indexes
List unique constraints and indexes.
```

After writing the plan, print a summary of file changes and prompt the user to run `/speckit.tasks`.
