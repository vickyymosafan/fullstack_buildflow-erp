/**
 * Full Regression Test Suite for Phase 23
 * Tests 26 Next.js frontend routes and 10+ NestJS backend endpoints
 */

const FRONTEND_BASE = 'http://localhost:3000';
const BACKEND_BASE = 'http://localhost:4000/api/v1';

const FRONTEND_ROUTES = [
  '/overview',
  '/executive-bi',
  '/orchestration',
  '/crm',
  '/approvals',
  '/projects',
  '/budget',
  '/site',
  '/quality',
  '/hse',
  '/sustainability',
  '/subcontractors',
  '/equipment',
  '/change-orders',
  '/official-reports',
  '/joint-operations',
  '/handover',
  '/closeout',
  '/documents',
  '/procurement',
  '/vendor-portal', // Phase 23
  '/inventory',
  '/finance',
  '/hr',
  '/analytics',
  '/settings',
];

async function runRegression() {
  console.log('====================================================');
  console.log('   BUILDFLOW ERP - PHASE 23 FULL REGRESSION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  // 1. Frontend Route Checks
  console.log('--- 1. Testing 26 Frontend Dashboard Routes ---');
  for (const route of FRONTEND_ROUTES) {
    const url = `${FRONTEND_BASE}${route}`;
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        console.log(`[PASS] Frontend Route: ${route} (HTTP 200)`);
        passed++;
        results.push({ test: `Route ${route}`, status: 'PASS', code: res.status });
      } else {
        console.error(`[FAIL] Frontend Route: ${route} (HTTP ${res.status})`);
        failed++;
        results.push({ test: `Route ${route}`, status: 'FAIL', code: res.status });
      }
    } catch (err) {
      console.error(`[FAIL] Frontend Route: ${route} - ${err.message}`);
      failed++;
      results.push({ test: `Route ${route}`, status: 'FAIL', error: err.message });
    }
  }

  // 2. Backend Vendor Portal Endpoint Checks
  console.log('\n--- 2. Testing Vendor Portal Backend Endpoints ---');

  const backendChecks = [
    {
      name: 'GET /vendor-portal/summary',
      fn: async () => {
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/summary`);
        const data = await res.json();
        if (res.status === 200 && data.totalVendors >= 9 && data.tiers) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'GET /vendor-portal/vendors',
      fn: async () => {
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/vendors`);
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data.length >= 9) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'GET /vendor-portal/vendors/VND-001',
      fn: async () => {
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/vendors/VND-001`);
        const data = await res.json();
        if (res.status === 200 && data.vendor && data.vendor.companyName) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'POST /vendor-portal/vendors (Pendaftaran)',
      fn: async () => {
        const payload = {
          companyName: 'PT Wika Beton Precast Jaya',
          category: 'MATERIAL_SUPPLIER',
          nib: '9120008889991',
          sbuGrade: 'B2',
          npwp: '01.999.888.7-012.000',
          isPkp: true,
          bankName: 'Bank Mandiri',
          bankAccountNumber: '123-99-887766-5',
          bankAccountName: 'PT Wika Beton Precast Jaya',
          contactPerson: 'Agus Setiawan',
          email: 'agus@wikabeton.co.id',
          phone: '+628119988771',
          address: 'Kawasan Industri Majalengka',
          city: 'Majalengka',
          province: 'Jawa Barat',
        };
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/vendors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 201 && data.vendor && data.vendor.vendorCode) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'PATCH /vendor-portal/vendors/VND-007/verify-legal',
      fn: async () => {
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/vendors/VND-007/verify-legal`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isApproved: true }),
        });
        const data = await res.json();
        if (res.status === 200 && data.vendor && data.vendor.legalStatus === 'VERIFIED') return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'PATCH /vendor-portal/vendors/VND-006/sanction (Sanksi)',
      fn: async () => {
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/vendors/VND-006/sanction`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'BLACKLIST', reason: 'Audit temuan scaffolding pipa tipis sub-standard' }),
        });
        const data = await res.json();
        if (res.status === 200 && data.vendor && data.vendor.tier === 'BLACKLISTED') return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'GET /vendor-portal/evaluations',
      fn: async () => {
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/evaluations`);
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data.length >= 5) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'POST /vendor-portal/evaluations (VPE Scoring)',
      fn: async () => {
        const payload = {
          vendorId: 'VND-001',
          projectId: 'PRJ-IKN-001',
          projectName: 'Pembangunan Istana Negara IKN Tahap II',
          evaluationPeriod: '2026-Q1',
          qualityScore: 94,
          deliveryScore: 90,
          hseScore: 92,
          commercialScore: 88,
          ncrCount: 0,
          evaluatorName: 'Bambang Kusumo, S.T.',
          remarks: 'Uji slump dan kuat tekan beton K-400 konsisten tinggi.',
        };
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/evaluations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 201 && data.evaluation && data.evaluation.weightedScore) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'GET /vendor-portal/rfq',
      fn: async () => {
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/rfq`);
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data.length >= 3) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'POST /vendor-portal/rfq (Buat Paket e-RFQ)',
      fn: async () => {
        const payload = {
          title: 'Pengadaan Sheet Pile Baja Patimban',
          projectId: 'PRJ-PTB-002',
          projectName: 'Pelabuhan Patimban Tahap 2',
          category: 'Struktur Baja',
          estimatedBudget: 3500000000,
          submissionDeadline: '2026-04-30T17:00:00Z',
          deliveryLocation: 'Jetty Patimban',
          targetDeliveryDate: '2026-05-15',
          requiredVendorTier: 'SILVER_ABOVE',
          items: [{ itemName: 'Sheet Pile Type IV', spec: 'JIS A 5528', quantity: 180, uom: 'TON' }],
        };
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/rfq`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 201 && data.rfq && data.rfq.rfqNumber) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
    {
      name: 'POST /vendor-portal/rfq/RFQ-001/bids (Sealed Bidding)',
      fn: async () => {
        const payload = {
          rfqId: 'RFQ-001',
          vendorId: 'VND-002',
          vendorName: 'PT Krakatau Steel (Persero) Tbk',
          quotedAmount: 8050000000,
          deliveryLeadTimeDays: 10,
          warrantyMonths: 12,
          paymentTerms: 'SKBDN 90 hari',
          tkdnPercentage: 80.0,
          technicalNotes: 'Franko Stockyard IKN',
        };
        const res = await fetch(`${BACKEND_BASE}/vendor-portal/rfq/RFQ-001/bids`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 201 && data.bid && data.bid.isSealed) return true;
        throw new Error(`Unexpected response: ${res.status}`);
      },
    },
  ];

  for (const check of backendChecks) {
    try {
      await check.fn();
      console.log(`[PASS] Backend API: ${check.name}`);
      passed++;
      results.push({ test: check.name, status: 'PASS' });
    } catch (err) {
      console.error(`[FAIL] Backend API: ${check.name} - ${err.message}`);
      failed++;
      results.push({ test: check.name, status: 'FAIL', error: err.message });
    }
  }

  console.log('\n====================================================');
  console.log(`   REGRESSION RESULT: ${passed} PASSED / ${failed} FAILED (TOTAL ${passed + failed})`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegression();

