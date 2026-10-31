# BUILDFlow ERP — API Design & Contract Standards (API_CONTRACT.md)

## 1. Global API Standards
* **Base URL**: `/api/v1`
* **Protocol**: HTTPS / JSON REST
* **Contract Specification**: OpenAPI 3.1 / Swagger (auto-generated from NestJS decorators)
* **Authentication**: Bearer JWT token in Authorization header or secure HttpOnly cookie.
* **Idempotency**: All mutation endpoints on financial, procurement, and inventory transactions require `Idempotency-Key: <UUID>` header.

---

## 2. Standard Envelope & Error Format

### Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_c398fd11-09...",
    "timestamp": "2026-10-31T01:40:00Z",
    "pagination": {
      "page": 1,
      "limit": 25,
      "totalItems": 150,
      "totalPages": 6
    }
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "BUDGET_EXCEEDED",
    "message": "Purchase order total amount (Rp 150.000.000) exceeds remaining available budget for cost code MAT-CONC-01 (Rp 85.000.000).",
    "details": [
      {
        "field": "items[0].totalAmount",
        "issue": "Exceeds remaining available budget ceiling"
      }
    ],
    "correlationId": "corr_87f9024a-...",
    "timestamp": "2026-10-31T01:40:00Z"
  }
}
```

---

## 3. Explicit Command Endpoints (RPC-over-REST Pattern)
Perubahan status dokumen penting menggunakan semantik kata kerja eksplisit:
* `POST /api/v1/purchase-orders/:id/submit` (Draft $\rightarrow$ Pending Approval)
* `POST /api/v1/purchase-orders/:id/approve` (Pending Approval $\rightarrow$ Approved)
* `POST /api/v1/goods-receipts/:id/post` (Draft $\rightarrow$ Posted to Inventory)
* `POST /api/v1/journal-entries/:id/post` (Draft $\rightarrow$ Posted to General Ledger)
* `POST /api/v1/journal-entries/:id/reverse` (Creates matching reversing entry)

---

## 4. Query Parameters Standard
* **Pagination**: `?page=1&limit=25` (maksimal limit: 100)
* **Sorting**: `?sortBy=transactionDate&sortOrder=desc`
* **Filtering**: `?filter[status]=ACTIVE&filter[projectId]=PRJ-001`
* **Search**: `?search=semen+portland`

