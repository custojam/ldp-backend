# Task 003 — Auth Routes

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** 001

## What to Build

Create the `/api/auth` Express router with login and logout endpoints.

## Files to Touch

- `backend/src/routes/auth.ts` — CREATE
- `backend/src/index.ts` — UPDATE (mount router)

## Implementation Notes

1. `POST /api/auth/login`:
   - Validate `email` (isEmail) and `password` (notEmpty) with `express-validator`.
   - Call `authService.loginUser(email, password)`.
   - Set `Set-Cookie: auth-token=<jwt>; HttpOnly; SameSite=Lax; Path=/`.
   - Return `200 { token, user }`.
2. `POST /api/auth/logout`:
   - Clear the `auth-token` cookie.
   - Return `200 { message: "Logged out successfully" }`.
3. `GET /api/auth/me` (protected by `requireAuth`):
   - Call `authService.getUserById(req.user.id)`.
   - Return `200` with user object `{ id, email, name, createdAt }`.
4. Mount in `index.ts`: `app.use('/api/auth', authRouter)`.

## Acceptance Criteria

- [ ] `POST /api/auth/login` with valid credentials sets cookie and returns token.
- [ ] `POST /api/auth/login` with bad credentials returns `401`.
- [ ] `POST /api/auth/logout` clears the cookie.

## Tests to Write

Covered by `backend/specs/auth.spec.ts` via service-level tests.
