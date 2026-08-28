# Lead Distribution Platform — Backend

Express.js REST API built with **TypeScript**, **Prisma ORM**, **MySQL**, and **JWT** authentication.

---

## Tech Stack

- **Node.js** + **Express.js** — HTTP server
- **TypeScript** — type-safe throughout
- **Prisma** — ORM with MySQL
- **JWT** — stateless auth via cookies
- **Jest** — BDD-style specs

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full Prisma connection string (see below) |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `FRONTEND_URL` | Frontend origin for CORS |

```
DATABASE_URL=mysql://MYSQL_USER:MYSQL_PASSWORD@SERVER_IP:MYSQL_PORT/MYSQL_DATABASE
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run database migrations

```bash
npx prisma db push
```

### 4. Seed the admin user

```bash
npm run db:seed
```

Default credentials:
- **Email:** `admin@leadplatform.com`
- **Password:** `Admin@123`

> Change these immediately after first login in production.

---

## Running

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Production with PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

PM2 commands:

```bash
pm2 restart ldp-backend
pm2 logs ldp-backend
pm2 status
```

---

## Running Tests

```bash
npm test
```

| Spec File | Feature |
|---|---|
| `auth.spec.ts` | Authentication & JWT |
| `broker.spec.ts` | Broker management |
| `form.spec.ts` | Lead form creation |
| `distribution.spec.ts` | Distribution management |
| `distributionLogic.spec.ts` | Deficit formula & broker selection |
| `lead.spec.ts` | Lead submission & assignment |

---

## API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Current user |

### Brokers

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/brokers` | List all brokers |
| `POST` | `/api/brokers` | Create broker |
| `GET` | `/api/brokers/:id` | Broker detail with leads |
| `PUT` | `/api/brokers/:id` | Update broker |
| `DELETE` | `/api/brokers/:id` | Delete broker |

### Forms

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/forms` | Get current form |
| `POST` | `/api/forms` | Create form (one only) |

### Distributions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/distributions` | Get current distribution |
| `GET` | `/api/distributions/:id` | Distribution detail |
| `POST` | `/api/distributions` | Create distribution (one only) |
| `POST` | `/api/distributions/:id/brokers` | Add broker |
| `PUT` | `/api/distributions/:id/brokers/:brokerId` | Update broker settings |
| `DELETE` | `/api/distributions/:id/brokers/:brokerId` | Remove broker |

### Leads

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/leads` | List leads (optional `?status=` filter) |
| `GET` | `/api/leads/stats` | Lead status counts |
| `GET` | `/api/leads/:id` | Lead detail |
| `POST` | `/api/leads/:id/assign` | Manually assign unsent lead |

### Public (no auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/public/forms/:slug` | Get form by slug |
| `POST` | `/api/public/forms/:slug/submit` | Submit a lead |

---

## Key Features

- **One lead form** — system prevents creating more than one
- **One distribution** — linked automatically to the form
- **Broker scheduling** — timezone-aware open hours and working days
- **Daily cap** — enforced per broker in their local timezone
- **Deficit-based assignment** — highest-deficit broker receives the next lead
- **Duplicate prevention** — email normalization and deduplication
- **IP capture** — visitor IP stored on every lead submission
- **Manual assign** — admin can reassign `unsent` leads to any broker
- **Protected admin routes** — JWT authentication required

---

## Spec Documentation

Feature specs and task breakdowns are in `.speckit/specs/`. Each spec covers the backend service and route implementation for that feature.
