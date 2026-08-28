# Lead Distribution Platform — Backend Constitution

## Purpose

The backend is the REST API for the Lead Distribution Platform, built with **Express.js**,
**TypeScript**, **Prisma ORM**, and **MySQL**. It handles lead capture, broker management,
distribution logic (deficit-based assignment), admin authentication, and exposes both
protected admin endpoints and unauthenticated public endpoints for visitor form submissions.

---

## Core Principles

### I. Separation of Concerns (NON-NEGOTIABLE)

Routes are thin HTTP adapters. Services own all business logic. Prisma is the only
data access layer.

- Routes MUST only: validate input, call a service, and return a response.
- All business logic — queries, calculations, state transitions — MUST live in `src/services/`.
- Routes MUST NOT contain Prisma calls directly. All database access goes through a service.
- Services MUST NOT import from routes or middleware.

**Rationale**: Thin routes make business logic independently testable and reusable.
Mixing query logic into routes makes the codebase impossible to test without an HTTP layer.

### II. Validation & Authorization First (NON-NEGOTIABLE)

Every admin route MUST be protected. Every mutating endpoint MUST validate its input
before any service call.

- All admin routes MUST use the `requireAuth` middleware as the first handler.
- Request validation MUST use `express-validator`. Always call `validationResult(req)` and
  return `400 { errors }` before calling any service method.
- The `requireAuth` middleware reads the JWT from `req.cookies.token` first, then the
  `Authorization: Bearer` header. On failure it returns `401` with the exact messages
  `"Unauthorized: no token provided"` or `"Unauthorized: invalid token"`.
- Public endpoints (`/api/public/*`) MUST NOT use `requireAuth`.

**Rationale**: Authorization and validation are security boundaries. A route that calls
a service before checking auth or validating input is a vulnerability, not an oversight.

### III. RESTful Conventions

All HTTP endpoints MUST follow RESTful conventions.

- `POST` success → `201`. All others → `200`.
- Resource not found → `404 { message }`.
- Conflict (already exists, duplicate) → `409 { message }`.
- Validation failure → `400 { errors }`.
- Auth failure → `401 { message }`.
- Unexpected error → `500 { message }`.
- Error catch pattern: check `error.message` with `.includes()` for known business errors
  (e.g., `'already exists'`, `'please create a form first'`) and map to `409`. All others → `500`.

### IV. Service Contract

Services have a defined contract that routes depend on.

- Services return data on success.
- Services throw `Error` with a descriptive message on failure.
- Services return `null` for not-found lookups (e.g., `getBrokerById` returns `null` if
  not found — the route is responsible for the `404` response).
- Services MUST NOT return HTTP status codes or response objects.

### V. Business Rules (NON-NEGOTIABLE)

These rules are invariants of the system and MUST NOT be bypassed.

- **One form only**: The system allows a maximum of one lead form. `formService.createForm()`
  throws if a form already exists.
- **One distribution only**: Same constraint. `distributionService.createDistribution()` throws
  `"Distribution already exists"` if one is present.
- **Deficit-based assignment**: `distributionLogicService` selects the eligible broker with the
  highest deficit (expected percentage of total leads minus actual leads received).
- **Daily cap**: Enforced per broker in their local timezone. A broker over their `dailyCap`
  for the current day (in their `timezone`) is ineligible.
- **Working hours**: A broker is ineligible if the current time in their timezone is outside
  `openingTime`–`closingTime`, or if today is not in their `workingDays` array.
- **Duplicate detection**: Email is normalized to lowercase on submission. If any lead with
  the same email has `status = 'sent'`, the new lead is saved as `status = 'duplicate'`.
- **IP capture**: Every lead submission MUST store the visitor's IP address from `req.ip`.
- **Manual assign**: Only `unsent` leads may be manually assigned. Attempting to assign any
  other status returns `400`.

### VI. Quality Gates (Definition of Done)

A feature is DONE only when ALL of the following are true:

- The feature meets all spec acceptance criteria.
- All admin routes are protected by `requireAuth`.
- All mutating routes validate input with `express-validator`.
- Error handling covers all documented failure modes (not found, conflict, validation).
- No `console.log` statements remain in production code.
- `npm test` passes with zero failures.
- Tests cover the happy path and all documented failure paths for every service method.
- `spec.md`, `plan.md`, and task files are committed alongside the feature.
- **Verify in code, never assume** — Before marking any acceptance criterion as done,
  the actual source file MUST be read and verified. Assumptions based on memory or prior
  context are not acceptable.

### VII. Test-Driven Development (NON-NEGOTIABLE)

All service logic MUST be covered by tests in `specs/`. Tests are written before or
alongside implementation — never after.

- Every service method MUST have tests for: the happy path, all failure paths, and all
  edge cases described in the spec.
- Tests MUST NOT be skipped or commented out to pass CI.
- `npm test` MUST pass with zero failures before any change is considered complete.

### VIII. Spec-Driven Development (NON-NEGOTIABLE)

No feature enters implementation without a reviewed `spec.md` and `plan.md`.

- Every feature follows the SpecKit lifecycle: specify → clarify → plan → tasks → implement.
- Specs are never deleted — Done specs serve as the architectural record of the project.
- Spec lifecycle: **Draft → Ready → Planned → In Progress → Done**.
- Before writing any production code for a new feature or bug fix, the relevant task file
  MUST exist in `tasks/` and MUST be listed in `tasks/index.md`.

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Security** | JWT authentication on all admin endpoints; httpOnly cookie preferred |
| **Performance** | API responses < 500ms under normal load |
| **Data integrity** | Lead status transitions are explicit and validated server-side |
| **Auditability** | Every lead stores IP address, form snapshot, broker, and timestamp |

---

## Technology Stack

| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `typescript` | Type safety throughout |
| `prisma` | ORM — sole data access layer |
| `mysql2` | MySQL database driver |
| `jsonwebtoken` | JWT signing and verification |
| `bcryptjs` | Password hashing |
| `express-validator` | Request validation |
| `cookie-parser` | Cookie parsing for JWT |
| `cors` | CORS configuration |
| `jest` + `ts-jest` | Test runner |

No new runtime dependencies MUST be introduced without updating this table.

---

## Architecture

```
HTTP Request
  └── Express Router (src/routes/)
        ├── requireAuth middleware (admin routes only)
        ├── express-validator (input validation)
        └── Service call (src/services/)
              └── Prisma Client (src/config/)
                    └── MySQL
```

- **`src/index.ts`** — app setup, middleware registration, route mounting.
- **`src/routes/`** — one file per resource: `auth`, `brokers`, `forms`, `distributions`, `leads`, `public`.
- **`src/services/`** — one file per domain: `authService`, `brokerService`, `formService`,
  `distributionService`, `distributionLogicService`, `leadService`.
- **`src/middleware/auth.ts`** — `requireAuth` exported function.
- **`prisma/schema.prisma`** — single source of truth for the data model.

---

## Development Workflow

```bash
npm run dev        # Start development server (ts-node)
npm run build      # Compile TypeScript to dist/
npm test           # Run all specs
npx prisma db push # Apply schema changes (dev)
npm run db:seed    # Seed default admin user
```

### SpecKit Feature Flow

```
New feature: /speckit.specify → /speckit.clarify → /speckit.plan
           → /speckit.tasks → /speckit.implement → commit

Bug fix: investigate → write failing test → fix → verify npm test passes → commit
```

---

## Out of Scope

- WebSockets / real-time features — not specced; polling only
- Multi-tenancy — single-tenant deployment
- GraphQL — REST only
- File uploads — not required
- Email sending — not required; routing is silent server-side

---

## Governance

This constitution supersedes all informal conventions and undocumented practices.
When this document conflicts with any other artifact, this document takes precedence.

**Amendment procedure**: Open a PR with the proposed change and a clear rationale.
Update the version below on merge.

---

**Version**: 1.0.0 | **Ratified**: 2026-08-27
