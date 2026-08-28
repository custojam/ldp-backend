# Backend — Claude Code Constitution

Express.js REST API for the Lead Distribution Platform.

---

## Tech Stack

- **Node.js + Express.js** — HTTP server
- **TypeScript** — strict mode throughout
- **Prisma** — ORM with MySQL
- **JWT** — auth via httpOnly cookie (also accepts `Authorization: Bearer` header)
- **express-validator** — request validation
- **Jest** — BDD-style specs in `specs/`

---

## Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma        # Database schema
├── specs/                   # Jest test files
│   ├── auth.spec.ts
│   ├── broker.spec.ts
│   ├── distribution.spec.ts
│   ├── distributionLogic.spec.ts
│   ├── form.spec.ts
│   └── lead.spec.ts
├── src/
│   ├── index.ts             # Express app entry point, route mounting
│   ├── config/              # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts          # requireAuth middleware
│   │   └── errorHandler.ts
│   ├── routes/              # Express routers
│   │   ├── auth.ts
│   │   ├── brokers.ts
│   │   ├── distributions.ts
│   │   ├── forms.ts
│   │   ├── leads.ts
│   │   └── public.ts
│   ├── services/            # Business logic layer
│   │   ├── authService.ts
│   │   ├── brokerService.ts
│   │   ├── distributionLogicService.ts
│   │   ├── distributionService.ts
│   │   ├── formService.ts
│   │   └── leadService.ts
│   └── types/               # Shared TypeScript types
└── .speckit/                # Feature specs and task breakdowns
```

---

## Architecture Conventions

### Services
- All business logic lives in `src/services/`.
- Services throw `Error` with descriptive messages on failure.
- Services never return `null` for not-found — routes handle 404 checks.

### Routes
- All admin routes use `requireAuth` middleware.
- Validation via `express-validator` — always call `validationResult(req)` and return `400` on errors.
- Error catch pattern:
  - `message.includes('already exists')` or similar → `409`
  - Not found (service returns null) → `404`
  - Everything else → `500`
- `POST` success → `201`. All others → `200`.

### Auth Middleware (`requireAuth`)
- Reads JWT from `req.cookies.token` first, then `Authorization: Bearer` header.
- On failure: `401 { message: "Unauthorized: no token provided" }` or `"Unauthorized: invalid token"`.
- Sets `req.user = { id, email }` on success.

---

## Key Business Rules

- **One form only** — `formService.createForm()` throws if a form already exists.
- **One distribution only** — same pattern; throws `"Distribution already exists"`.
- **Deficit-based assignment** — `distributionLogicService` selects the broker with the highest deficit (expected - actual leads received).
- **Daily cap** — enforced per broker in their local timezone using the broker's `timezone` field.
- **Working hours** — broker skipped if current time (in broker's timezone) is outside `openingTime`–`closingTime` or not a working day.
- **Duplicate detection** — email normalized to lowercase; if a `sent` lead exists with same email → new lead marked `duplicate`.
- **IP capture** — `req.ip` stored on every lead submission.

---

## Database

```bash
npx prisma db push       # Apply schema changes (dev)
npx prisma migrate deploy  # Apply migrations (prod)
npm run db:seed          # Create default admin user
```

Default admin: `admin@leadplatform.com` / `Admin@123`

---

## Running Tests

```bash
npm test
```

Tests in `specs/` use Jest with a real (test) database. Each spec file covers one feature domain.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma MySQL connection string |
| `JWT_SECRET` | Min 32 chars |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `FRONTEND_URL` | Allowed CORS origin |
