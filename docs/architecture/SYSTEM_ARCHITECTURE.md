# BUILDFlow ERP — System Architecture (SYSTEM_ARCHITECTURE.md)

## 1. Architectural Philosophy: Modular Monolith
BUILDFlow ERP adopts a **Modular Monolith** architecture. All 12 domain modules reside within a unified codebase and deployment container, but each module strictly maintains its own isolated bounded context, application use cases, domain entities, and data access layer.

```
                           +------------------------------------------+
                           |           Client Experience              |
                           |   Next.js (Web Admin + PWA Site Ops)     |
                           +--------------------+---------------------+
                                                |
                                                | HTTP / REST + OpenAPI
                                                v
                           +------------------------------------------+
                           |          NestJS Application Entry        |
                           |    Authentication | Scoping | Validation  |
                           +--------------------+---------------------+
                                                |
          +-------------+-------------+---------+----+-------------+-------------+
          |             |             |              |             |             |
          v             v             v              v             v             v
     [ Core Org ]   [ Project ]   [ Budget ]    [ Procure ]   [ Inventory ]  [ Finance ]
     [  & Auth  ]   [   WBS   ]   [ RAB/BOQ ]   [  PR/PO  ]   [ Warehouse ]  [ GL & AP ]
          |             |             |              |             |             |
          +-------------+-------------+---------+----+-------------+-------------+
                                                |
                                                v
                           +--------------------+---------------------+
                           |            Shared Infrastructure         |
                           |  - PostgreSQL (System of Record, ACID)   |
                           |  - Redis + BullMQ (Transactional Outbox) |
                           |  - Private S3 Storage (MinIO / R2)       |
                           +------------------------------------------+
```

### Key Architectural Tenets
1. **Vertical Slices**: Code is partitioned primarily by business domain (`projects`, `budget`, `procurement`, `inventory`, `finance`), not by horizontal technical layers.
2. **Strict In-Process Decoupling**: Modul A dilarang mengimpor internal repository atau model database Modul B secara langsung. Komunikasi antar modul hanya boleh melalui:
   - Exported Application Services (Contract interfaces).
   - In-memory Domain Events.
   - Transactional Outbox Worker untuk asynchronous side-effects.
3. **Database Single-Writer**: Hanya modul pemilik yang boleh melakukan mutasi (INSERT/UPDATE/DELETE) pada tabel miliknya. Modul lain membaca data melalui view terproteksi atau API internal.

---

## 2. Directory Layout per Domain Slice

Setiap domain module dalam `apps/api/src/modules/<domain>` mengikuti arsitektur Clean/Hexagonal terstruktur:

```
apps/api/src/modules/projects/
├── domain/
│   ├── entities/              # Rich domain models (Project, Task, Milestone)
│   ├── value-objects/         # Immutables (ProjectCode, Money, DateRange)
│   ├── events/                # Domain events (ProjectCreatedEvent, MilestoneReachedEvent)
│   └── repositories/          # Interface kontrak persistence (IProjectRepository)
├── application/
│   ├── commands/              # State-changing use cases (CreateProjectHandler)
│   ├── queries/               # Read-only use cases (GetProjectDetailHandler)
│   └── dto/                   # Request/Response data transfer objects
├── infrastructure/
│   ├── persistence/           # Prisma/Drizzle schema models & migrations
│   └── repositories/          # Implementasi database (PrismaProjectRepository)
└── presentation/
    ├── controllers/           # NestJS REST controllers
    └── guards/                # Project resource scoping guards
```

---

## 3. Transactional Outbox Pattern & Reliable Messaging

Untuk mencegah inkonsistensi *dual-write* (misal: posting transaksi keuangan berhasil tapi pesan queue notifikasi/email gagal), BUILDFlow menerapkan **Transactional Outbox Pattern**:

```
[ HTTP Request: Post Journal ]
               |
               v
    +----------------------+
    |  DB Transaction Beg  |
    |  1. Insert Journal   |
    |  2. Insert Lines     |
    |  3. Insert Outbox    |
    |  DB Transaction End  |
    +----------+-----------+
               |
               | (Written atomically in PostgreSQL)
               v
    [ domain_outbox table ]
               |
               v (Polled / Notified via CDC or 500ms ticker)
    [ Outbox Worker (NestJS + BullMQ) ]
               |
               +------------------> [ Redis / BullMQ Job Queue ]
                                                 |
                                                 v
                                   [ Downstream Event Handlers ]
                                   - Send Vendor Notification
                                   - Recalculate Project Profitability
                                   - Update BI Cache / Read Models
```

### Domain Outbox Schema
* `id`: UUID (Primary Key)
* `event_name`: string (e.g. `BudgetApproved`, `GoodsReceiptPosted`)
* `aggregate_type`: string (e.g. `budget`, `inventory`)
* `aggregate_id`: string
* `payload`: JSONB
* `status`: enum (`PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED`)
* `retry_count`: int
* `created_at`, `published_at`, `error_message`

---

## 4. Cross-Module Communication Contract
* **Synchronous (Direct In-Memory)**: Modul Procurement memanggil `BudgetService.verifyAvailableBudget(projectId, amount)` sebelum merilis PO. Pemanggilan ini terjadi dalam memori via Dependency Injection interface.
* **Asynchronous (Domain Events via Outbox)**: Ketika Goods Receipt diposting, `GoodsReceiptPosted` dipublikasikan ke Outbox. Modul Inventory menerima event ini untuk menambah stok gudang, dan modul Finance menerima event ini untuk mencatat akrual utang belum ditagih (Unbilled AP).

