# Task 001 — JWT Auth Service

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** none

## What to Build

Create `authService.ts` with `loginUser(email, password)` and `getUserById(id)` functions.
`loginUser` finds the user by email, compares the password with bcrypt, signs a JWT, and returns
the token + safe user object (no password field). `getUserById` is used by the `/me` route.

## Files to Touch

- `backend/src/services/authService.ts` — CREATE

## Implementation Notes

1. Import `prisma` from `../config/database`, `bcryptjs`, and `jsonwebtoken`.
2. `loginUser(email, password)`:
   - `prisma.user.findUnique({ where: { email } })` — if null, throw `"Invalid credentials"`.
   - `bcrypt.compare(password, user.password)` — if false, throw `"Invalid credentials"`.
   - `jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn })` — cast `expiresIn` as
     `jwt.SignOptions['expiresIn']` to satisfy TypeScript strict mode.
   - Return `{ token, user: { id, email, name } }`.
3. Use a generic error message for both unknown email and wrong password to prevent user enumeration.
4. `getUserById(id)` — `prisma.user.findUnique({ where: { id }, select: { id, email, name, createdAt } })` — returns user without password.

## Acceptance Criteria

- [ ] Valid credentials return `{ token, user }` with no `password` field on user.
- [ ] Unknown email throws `"Invalid credentials"`.
- [ ] Wrong password throws `"Invalid credentials"`.

## Tests to Write

`backend/specs/auth.spec.ts`

- Valid credentials return token and user (no password field).
- Unknown email throws "Invalid credentials".
- Wrong password throws "Invalid credentials".
