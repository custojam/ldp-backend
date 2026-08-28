# Task 001 — Form Service

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** none

## What to Build

Create `formService.ts` with form lookup, creation, and existence checks. Enforces the one-form
constraint.

## Files to Touch

- `backend/src/services/formService.ts` — CREATE

## Implementation Notes

1. `getForm()` — `prisma.form.findFirst()` — returns form or null.
2. `getFormBySlug(slug)` — `prisma.form.findUnique({ where: { slug } })` — returns form or null.
3. `formExists()` — `const form = await prisma.form.findFirst(); return !!form`.
4. `createForm(name, slug)`:
   - Call `getForm()` → if found, throw `Error("A form already exists. Only one form is allowed.")` (caught → 409 in route).
   - Check `prisma.form.findUnique({ where: { slug } })` → if found, throw `Error("This slug is already taken.")` (caught → 400).
   - `prisma.form.create({ data: { name, slug } })`.
   - Returns the created Prisma `Form` record (no `publicUrl` computed).

## Acceptance Criteria

- [ ] `getForm()` returns null when no form exists.
- [ ] `createForm()` creates and returns the Prisma Form record (id, name, slug, createdAt, updatedAt).
- [ ] `createForm()` throws when form already exists.
- [ ] `createForm()` throws "This slug is already taken." on duplicate slug.
- [ ] `formExists()` returns true/false correctly.

## Tests to Write

`backend/specs/form.spec.ts`

- `getForm()` returns null when none exists.
- `createForm()` persists name and slug, returns form record.
- `createForm()` throws if form already exists.
- `createForm()` throws "This slug is already taken." on duplicate slug.
- `formExists()` returns true/false.
