# Data Model — Broker Management

---

## Tables

### `brokers`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | int | no | auto | Primary key |
| name | varchar(255) | no | — | Display name |
| isActive | boolean | no | true | Global active flag |
| dailyCap | int | no | 100 | Min: 1 |
| timezone | varchar(255) | no | `"UTC"` | IANA timezone name |
| openingTime | varchar(5) | no | `"09:00"` | Format: `HH:MM` |
| closingTime | varchar(5) | no | `"18:00"` | Format: `HH:MM` |
| workingDays | json | no | Mon–Fri | Array of day name strings |
| createdAt | datetime | no | now() | Auto-set |
| updatedAt | datetime | no | now() | Auto-updated |

**Indexes:**

| Column | Type | Purpose |
|--------|------|---------|
| id | PRIMARY | — |

---

## Prisma Model

```prisma
model Broker {
  id           Int      @id @default(autoincrement())
  name         String
  isActive     Boolean  @default(true)  @map("is_active")
  dailyCap     Int      @default(100)   @map("daily_cap")
  timezone     String   @default("UTC")
  openingTime  String   @default("09:00") @map("opening_time")
  closingTime  String   @default("18:00") @map("closing_time")
  workingDays  Json     @default("[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\"]") @map("working_days")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt      @map("updated_at")

  distributionBrokers DistributionBroker[]
  leads               Lead[]

  @@map("brokers")
}
```

---

## Notes

- `workingDays` is stored as MySQL JSON type and parsed to `string[]` on read.
- Default working days: `["Monday","Tuesday","Wednesday","Thursday","Friday"]`.
