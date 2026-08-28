# Plan 2026_08_27_000000 — Authentication

**Spec:** [spec.md](./spec.md)
**Status:** Done
**Created:** 2026-08-27

---

## Technical Approach

JWT is generated on the backend, returned in the login response body, and stored on the
client in `localStorage`. The token is also set as an httpOnly cookie for middleware checks.
Next.js middleware reads the cookie to protect admin routes server-side. Client-side axios
reads from `localStorage` to attach the `Authorization` header.

This dual-storage approach was chosen because:
1. **httpOnly cookie** — readable by Next.js middleware (server-side) without JS access.
2. **localStorage** — readable by axios interceptors (client-side) for API calls.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Business logic in services | ✅ | `authService.ts` owns login/token logic |
| Server-side validation | ✅ | `express-validator` on `POST /api/auth/login` |
| No secrets on frontend | ✅ | `JWT_SECRET` never leaves backend |
| Passwords hashed | ✅ | `bcryptjs` with 12 salt rounds |
| TypeScript strict mode | ✅ | `"strict": true` in tsconfig |
| Tests pass | ✅ | `backend/specs/auth.spec.ts`, `frontend/specs/auth.spec.ts` |

---

## Architecture

```
Browser
  │
  ├─ POST /api/auth/login { email, password }
  │
  ▼
authRoutes → loginUser(email, password)
  │
  ├─ prisma.user.findUnique({ where: { email } })
  ├─ bcrypt.compare(password, user.password)
  ├─ jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn })
  │
  ▼
Response: { token, user: { id, email, name } }
  + Set-Cookie: auth-token=<jwt>; HttpOnly; SameSite=Lax
  │
  ▼
Frontend: localStorage.setItem('auth-token', token)
Frontend: redirect → /dashboard

──── Subsequent requests ────────────────────────────────

axios interceptor → Authorization: Bearer <token from localStorage>
Next.js middleware → reads cookie auth-token → allows/blocks route
```

---

## File Map

| Action | File | Reason |
|--------|------|--------|
| CREATE | `backend/src/services/authService.ts` | Login logic, JWT signing |
| CREATE | `backend/src/middleware/auth.ts` | JWT verification middleware |
| CREATE | `backend/src/routes/auth.ts` | `/api/auth/*` endpoints |
| CREATE | `frontend/src/app/login/page.tsx` | Login UI |
| CREATE | `frontend/src/lib/auth.ts` | Token get/set/clear helpers |
| CREATE | `frontend/src/middleware.ts` | Next.js route protection |
| CREATE | `frontend/src/lib/api.ts` | axios instance with auth interceptor |

---

## Security Considerations

1. **Generic error message** — "Invalid credentials" regardless of whether email or password is wrong. Prevents user enumeration.
2. **httpOnly cookie** — inaccessible to JavaScript; protects against XSS token theft.
3. **CORS** — only `FRONTEND_URL` origin is allowed with credentials.
4. **JWT expiry** — configurable via `JWT_EXPIRES_IN` env var (default `7d`).

---

## Testing Plan

| # | Test | File |
|---|------|------|
| 1 | Valid credentials return token and user (no password field) | `backend/specs/auth.spec.ts` |
| 2 | Unknown email throws "Invalid credentials" | `backend/specs/auth.spec.ts` |
| 3 | Wrong password throws "Invalid credentials" | `backend/specs/auth.spec.ts` |
| 4 | `getToken()` returns null when empty | `frontend/specs/auth.spec.ts` |
| 5 | `setToken()` + `getToken()` round-trip | `frontend/specs/auth.spec.ts` |
| 6 | `clearToken()` removes token | `frontend/specs/auth.spec.ts` |
| 7 | Admin paths identified as protected | `frontend/specs/auth.spec.ts` |
| 8 | `/login` and `/{slug}` are not protected | `frontend/specs/auth.spec.ts` |
