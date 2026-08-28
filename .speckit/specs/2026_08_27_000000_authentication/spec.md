# Spec 2026_08_27_000000 — Authentication

**Status:** Done
**Created:** 2026-08-27
**Author:** AI

---

## Overview

The admin area is protected by JWT-based authentication. A single login page grants access
to the platform. Public form pages (`/{slug}`) are accessible without any login.
JWT tokens are signed server-side, stored in localStorage on the client, and attached to
every admin API request via `Authorization: Bearer <token>`.

---

## Goals

- Prevent unauthenticated access to all admin routes.
- Provide a clean login page with clear error feedback.
- Keep public form pages fully accessible without login.
- Never expose the JWT secret or hashed password to the client.

---

## User Stories

- As an **admin**, I want to log in with my email and password so I can manage the platform.
- As an **admin**, I want my session to persist across page refreshes so I don't re-login constantly.
- As an **admin**, I want to log out securely so my session ends immediately.
- As the **system**, I want to block unauthenticated users from admin routes and redirect them to `/login`.

---

## Acceptance Criteria

### AC #1 — Login

- [ ] Login page is available at `/login`.
- [ ] Form accepts `email` (validated as email format) and `password` (required).
- [ ] Valid credentials return a JWT token and user object.
- [ ] Token is stored in `localStorage` under key `auth-token`.
- [ ] Admin is redirected to `/dashboard` on success.
- [ ] Invalid credentials show an error message — never reveal which field is wrong.
- [ ] `password` hash is never returned to the client.

### AC #2 — Session Persistence

- [ ] JWT token is attached to every API request via `Authorization: Bearer <token>`.
- [ ] A `401` response from any API endpoint clears the token and redirects to `/login`.

### AC #3 — Logout

- [ ] Logout button is visible in the admin sidebar.
- [ ] Clicking logout calls `POST /api/auth/logout`, clears `localStorage`, and redirects to `/login`.

### AC #4 — Route Protection

- [ ] Next.js middleware blocks unauthenticated access to `/dashboard`, `/brokers`, `/forms`, `/distributions`, `/leads`.
- [ ] Blocked requests redirect to `/login?from=<original-path>`.
- [ ] `/{slug}` (public form) and `/login` are never blocked.

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | No | Validates credentials, returns JWT + user |
| `POST` | `/api/auth/logout` | No | Clears auth cookie |
| `GET` | `/api/auth/me` | Yes | Returns current user profile |

---

## Error Cases

| Scenario | Response |
|----------|----------|
| Wrong email or password | `401 { error: "Invalid credentials" }` |
| Missing token on protected route | `401 { error: "Unauthorized: no token provided" }` |
| Expired or tampered token | `401 { error: "Unauthorized: invalid token" }` |

---

## Out of Scope

- Multi-user admin accounts (only one seeded admin for this exam).
- Password reset flow.
- Two-factor authentication.
- OAuth / SSO.

---

## Dependencies

- None — this is the foundation spec.
