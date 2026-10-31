# BUILDFlow ERP — Security & Governance Policy (SECURITY.md)

## 1. Overview and Threat Model
BUILDFlow ERP is a multi-branch, multi-project construction enterprise platform. It processes sensitive financial journals, contract values, payroll records, and material procurement.

### Threat Model & Attack Vectors
1. **Broken Object Level Authorization (BOLA / IDOR)**: Accessing projects, budgets, or vendor bids from other organizations or branches without permission.
2. **Privilege Escalation**: Unauthorized role modifications or self-approval of Purchase Orders / Invoices.
3. **Data Tampering in Financial / Inventory Ledgers**: Direct manipulation of historical balances, journal entries, or stock ledger records.
4. **Malicious File Uploads**: Uploading executable payloads masquerading as CAD drawings, BOQ spreadsheets, or site progress photos.
5. **CSRF & Session Hijacking**: Stealing enterprise authentication tokens to execute unauthorized approvals.

---

## 2. Authorization & Scoping Model

### Core Principles
* **Least Privilege**: Users only receive minimal permissions required for their job role.
* **Triple-Tier Scoping**:
  1. `organization_id` (Tenant isolation — mandatory on every query)
  2. `branch_id` (Physical office / branch scoping)
  3. `project_id` (Operational project scoping)
* **Segregation of Duties (SoD)**:
  * The creator of a Purchase Request (PR) or Purchase Order (PO) **cannot** approve their own request if the threshold exceeds configured limits.
  * Finance staff posting journal entries cannot approve vendor payment release without secondary dual-authorization.

### Baseline Role Matrix
| Role | Project Scope | Finance | Procurement | Inventory | HR | Documents |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Director / Executive** | Full Read/Approve | Full Read/Approve | Full Read/Approve | Full Read | Read (Aggr) | Full Read |
| **Project Manager** | Full (Assigned) | Project Scope Read | Read / Create PR | Assigned Project | Project Team | Full (Assigned) |
| **Finance Manager** | Project Read | Full (Read/Write) | Read / Invoice Match | Read Ledger | Limited | Finance Docs |
| **Procurement Manager** | Project Read | Limited (AP Read) | Full (PR, RFQ, PO) | Read Stock | None | Vendor Docs |
| **Warehouse Staff** | Project Scope Read | None | Read PO / GR | Full (Receipt/Issue) | None | Delivery Docs |
| **HR Manager** | Read | Limited | None | None | Full | HR & Contracts |
| **Site Supervisor** | Assigned Project | None | PR Create only | Issue Request | Timesheet / Logs| Site Reports |
| **Architect / Engineer** | Assigned Project | None | None | None | None | Drawing / Submittal |

---

## 3. High-Risk Business Actions (Strict Audit & Guard Requirements)
The following actions require explicit server-side checks, immutable audit logging, and optional dual-factor or multi-step approval:
1. `purchase_order.approve`: PO approval beyond threshold limit.
2. `payment.process`: Release of vendor payment or disbursements.
3. `budget.baseline_revision`: Modifying locked RAB/BOQ baseline values.
4. `journal_entry.post` & `journal_entry.reverse`: General ledger posting (immutable; reverse transaction required for corrections).
5. `inventory.stock_adjustment`: Stock write-offs and quantity adjustments.
6. `vendor.bank_account_update`: Modifying payee bank accounts.
7. `auth.role_permission_change`: Elevating user permissions or cross-project scope.
8. `export.bulk_data`: Mass exporting client contracts, payroll, or financial statements.

---

## 4. Technical Security Controls

### Authentication & Sessions
* **Password Hashing**: Argon2id with memory cost 64MB, 3 iterations, 4 parallelism.
* **Session Storage**: Secure, `HttpOnly`, `SameSite=Lax`, strict HTTPS cookie token rotation.
* **MFA**: Enforced for System Administrators, Finance Executives, and Directors.

### API & Input Protection
* **Validation**: Request payloads strictly validated using Zod / class-validator with strip-unknown properties.
* **SQL Injection Prevention**: Parameterized queries via ORM with zero raw concatenation.
* **Rate Limiting**: Tiered rate limits (auth endpoints: 5 req/min, operational API: 120 req/min).
* **CORS**: Restricted strictly to authorized enterprise domains.

### File Storage Security
* **Storage Provider**: S3-compatible private storage (MinIO for dev, Cloudflare R2 / AWS S3 for prod).
* **Direct Access**: No public bucket access. All downloads mediated via short-lived signed URLs (TTL $\le$ 15 minutes).
* **Upload Validation**: File extension & MIME-type magic byte check, size limits (images $\le$ 10MB, documents $\le$ 50MB, CAD/BIM $\le$ 200MB).

### Audit Trail Specification
Every critical state change must record:
```json
{
  "actor_id": "usr_uuid",
  "organization_id": "org_uuid",
  "action": "purchase_order.approve",
  "resource_type": "purchase_order",
  "resource_id": "po_uuid",
  "previous_state": "submitted",
  "new_state": "approved",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "correlation_id": "corr_uuid",
  "timestamp": "2026-10-31T01:35:00Z"
}
```
Audit logs are append-only and immutable.

