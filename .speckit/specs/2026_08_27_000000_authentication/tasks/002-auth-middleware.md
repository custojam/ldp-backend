# Task 002 — Auth Middleware

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** 001

## What to Build

Create `requireAuth` Express middleware that verifies the JWT on every protected route.

## Files to Touch

- `backend/src/middleware/auth.ts` — CREATE

## Implementation Notes

1. Read token from `req.cookies['auth-token']` first, fall back to
   `req.headers.authorization?.split(' ')[1]`.
2. If no token: respond `401 { error: "Unauthorized: no token provided" }`.
3. `jwt.verify(token, JWT_SECRET)` — if it throws, respond `401 { error: "Unauthorized: invalid token" }`.
4. Attach decoded payload to `(req as AuthenticatedRequest).user`.
5. Call `next()`.

## Acceptance Criteria

- [ ] Missing token → `401`.
- [ ] Invalid/expired token → `401`.
- [ ] Valid token → `next()` called with `req.user` populated.

## Tests to Write

Covered implicitly by route-level tests in other specs.
