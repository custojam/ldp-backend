Create a new feature specification for: $ARGUMENTS

## Steps

1. Read `.speckit/memory/constitution.md` to align with project principles.
2. Generate a timestamp prefix using the current date and time in the format `YYYY_MM_DD_HHMMSS`
   (e.g., `2026_08_27_143022`). This avoids numbering conflicts when multiple developers create
   specs in parallel.
3. Slugify the feature name (e.g., "broker schedule" → `broker-schedule`).
4. Create the directory `.speckit/specs/YYYY_MM_DD_HHMMSS_feature-name/`
   (e.g., `.speckit/specs/2026_08_27_143022_broker-schedule/`).
5. Write `spec.md` inside it using the template below.
6. Do NOT write a plan or tasks yet — the spec is the requirements only.

## spec.md Template

```markdown
# Spec YYYY_MM_DD_HHMMSS — [Feature Name]

**Status:** Draft | Clarifying | Ready | Planned | In Progress | Done
**Created:** YYYY-MM-DD
**Author:** [name or AI]

## Overview
One paragraph describing what this feature does and why it exists.

## Goals
- What success looks like for this feature.

## User Stories
- As a [role], I want to [action] so that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] **Tests** — every service method and route introduced by this feature has a
  corresponding Jest spec in `specs/`. `npm test` passes with zero failures.

## Constraints
- Technical or business limits that affect implementation.

## Out of Scope
- Things explicitly excluded from this spec.

## Open Questions
- Questions that must be resolved before planning.

## Dependencies
- Other specs or external systems this depends on.
```

**Test rule (NON-NEGOTIABLE, per constitution §VII):** Every spec that
adds or changes a service method or route MUST include a test coverage
checkbox in Acceptance Criteria. Do not omit this even for "small" changes.

After writing the spec, list the Open Questions and ask the user to resolve them or run
`/speckit.clarify` to proceed.
