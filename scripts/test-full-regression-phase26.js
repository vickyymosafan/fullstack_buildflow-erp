/**
 * Full Regression Test Suite for Phase 26:
 * AI Legal Contract Clause Analyzer & Construction Dispute Predictor
 * Tests all 29 Next.js frontend routes and all 12 NestJS backend endpoints
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
  '/vendor-portal',
  '/inventory',
  '/finance',
  '/treasury',
  '/bim',
  '/contracts', // Phase 26
  '/hr',
  '/analytics',
  '/settings',
];

async function runRegression() {
  console.log('====================================================');
  console.log('   BUILDFLOW ERP - PHASE 26 FULL REGRESSION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  // 1. Frontend Route Checks (29 Routes)
  console.log('--- 1. Testing 29 Frontend Dashboard Routes ---');
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
      console.error(`[ERROR] Frontend Route: ${route} (${err.message})`);
      failed++;
      results.push({ test: `Route ${route}`, status: 'ERROR', error: err.message });
    }
  }

  // 2. Backend Contracts Endpoints Checks (12 Endpoints)
  console.log('\n--- 2. Testing 12 Backend Contracts Endpoints ---');

  // Test 1: GET /contracts/summary
  try {
    const res = await fetch(`${BACKEND_BASE}/contracts/summary`);
    const data = await res.json();
    if (res.status === 200 && data.totalContracts >= 5) {
      console.log(`[PASS] GET /contracts/summary - ${data.totalContracts} Kontrak, ${data.totalClausesAnalyzed} Klausul, Total: Rp ${(data.totalContractValue / 1000000000).toFixed(1)} M`);
      passed++;
      results.push({ test: 'GET /contracts/summary', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /contracts/summary status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /contracts/summary', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /contracts/summary: ${err.message}`);
    failed++;
  }

  // Test 2: GET /contracts
  try {
    const res = await fetch(`${BACKEND_BASE}/contracts`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 5) {
      console.log(`[PASS] GET /contracts - ${data.length} Kontrak Konstruksi Terdaftar`);
      passed++;
      results.push({ test: 'GET /contracts', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /contracts status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /contracts', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /contracts: ${err.message}`);
    failed++;
  }

  // Test 3: GET /contracts/:id
  try {
    const res = await fetch(`${BACKEND_BASE}/contracts/CTR-001`);
    const data = await res.json();
    if (res.status === 200 && data.contract && data.contract.id === 'CTR-001') {
      console.log(`[PASS] GET /contracts/:id - Detail Kontrak ${data.contract.contractNumber} (${data.clauses?.length} klausul terkait)`);
      passed++;
      results.push({ test: 'GET /contracts/:id', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /contracts/:id status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /contracts/:id', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /contracts/:id: ${err.message}`);
    failed++;
  }

  // Test 4: POST /contracts
  try {
    const payload = {
      contractNumber: 'CTR-REGRESS-2026-99',
      title: 'Pembangunan Jembatan Selat Madura Sisi Timur',
      clientName: 'Balai Besar Pelaksanaan Jalan Nasional Jawa Timur',
      contractType: 'FIDIC_RED',
      contractValue: 550000000000,
      startDate: '2026-05-01',
      endDate: '2028-04-30',
      disputeResolutionForum: 'BANI_ARBITRATION',
      liquidatedDamagesRatePerDay: 0.001,
      liquidatedDamagesCapPercent: 5
    };
    const res = await fetch(`${BACKEND_BASE}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && data.contract?.id) {
      console.log(`[PASS] POST /contracts - Registered Contract ID: ${data.contract.id}`);
      passed++;
      results.push({ test: 'POST /contracts', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /contracts status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /contracts', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /contracts: ${err.message}`);
    failed++;
  }

  // Test 5: GET /contracts/clauses/list
  try {
    const res = await fetch(`${BACKEND_BASE}/contracts/clauses/list`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 6) {
      console.log(`[PASS] GET /contracts/clauses/list - ${data.length} Klausul Kontrak Teranalisis`);
      passed++;
      results.push({ test: 'GET /contracts/clauses/list', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /contracts/clauses/list status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /contracts/clauses/list', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /contracts/clauses/list: ${err.message}`);
    failed++;
  }

  // Test 6: POST /contracts/clauses/analyze
  try {
    const payload = {
      contractId: 'CTR-001',
      clauseNumber: 'Klausul 14.2',
      clauseTitle: 'Ketentuan Uang Muka & Pemotongan',
      clauseText: 'Pemilik Proyek memotong pengembalian uang muka sebesar 20% dari setiap termin.',
      clauseCategory: 'PAYMENT_TERMS'
    };
    const res = await fetch(`${BACKEND_BASE}/contracts/clauses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && data.clause?.id) {
      console.log(`[PASS] POST /contracts/clauses/analyze - Analyzed Clause ID: ${data.clause.id} (Risk: ${data.clause.riskLevel})`);
      passed++;
      results.push({ test: 'POST /contracts/clauses/analyze', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /contracts/clauses/analyze status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /contracts/clauses/analyze', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /contracts/clauses/analyze: ${err.message}`);
    failed++;
  }

  // Test 7: PATCH /contracts/clauses/:id/risk
  try {
    const payload = { riskLevel: 'HIGH', notes: 'Disesuaikan berdasarkan rekomendasi legal counsel internal' };
    const res = await fetch(`${BACKEND_BASE}/contracts/clauses/CLS-001/risk`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 200 && data.clause?.riskLevel === 'HIGH') {
      console.log(`[PASS] PATCH /contracts/clauses/:id/risk - Clause CLS-001 risk updated to HIGH`);
      passed++;
      results.push({ test: 'PATCH /contracts/clauses/:id/risk', status: 'PASS' });
    } else {
      console.error(`[FAIL] PATCH /contracts/clauses/:id/risk status: ${res.status}`);
      failed++;
      results.push({ test: 'PATCH /contracts/clauses/:id/risk', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] PATCH /contracts/clauses/:id/risk: ${err.message}`);
    failed++;
  }

  // Test 8: POST /contracts/calculator/simulate-ld
  try {
    const payload = {
      contractId: 'CTR-001',
      delayDays: 40,
      dailyRate: 0.001,
      capPercent: 5,
      eligibleEotDays: 15
    };
    const res = await fetch(`${BACKEND_BASE}/contracts/calculator/simulate-ld`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && data.grossPenaltyWithoutEot !== undefined) {
      console.log(`[PASS] POST /contracts/calculator/simulate-ld - Bruto: Rp ${(data.grossPenaltyWithoutEot / 1000000000).toFixed(2)} M, Netto EOT: Rp ${(data.netPenaltyWithEotDefense / 1000000000).toFixed(2)} M`);
      passed++;
      results.push({ test: 'POST /contracts/calculator/simulate-ld', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /contracts/calculator/simulate-ld status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /contracts/calculator/simulate-ld', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /contracts/calculator/simulate-ld: ${err.message}`);
    failed++;
  }

  // Test 9: GET /contracts/disputes/predictions
  try {
    const res = await fetch(`${BACKEND_BASE}/contracts/disputes/predictions`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 3) {
      console.log(`[PASS] GET /contracts/disputes/predictions - ${data.length} Prediksi Risiko Sengketa`);
      passed++;
      results.push({ test: 'GET /contracts/disputes/predictions', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /contracts/disputes/predictions status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /contracts/disputes/predictions', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /contracts/disputes/predictions: ${err.message}`);
    failed++;
  }

  // Test 10: POST /contracts/disputes/predict
  try {
    const payload = {
      contractId: 'CTR-002',
      schedulePerformanceIndex: 0.82,
      unpaidInvoicesAgingDays: 70,
      unapprovedChangeOrdersCount: 4,
      siteAccessDelayDays: 20
    };
    const res = await fetch(`${BACKEND_BASE}/contracts/disputes/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && data.prediction?.id) {
      console.log(`[PASS] POST /contracts/disputes/predict - Dispute Prob: ${data.prediction.disputeProbabilityPercent}% (${data.prediction.riskClassification})`);
      passed++;
      results.push({ test: 'POST /contracts/disputes/predict', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /contracts/disputes/predict status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /contracts/disputes/predict', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /contracts/disputes/predict: ${err.message}`);
    failed++;
  }

  // Test 11: GET /contracts/amendments/list
  try {
    const res = await fetch(`${BACKEND_BASE}/contracts/amendments/list`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 1) {
      console.log(`[PASS] GET /contracts/amendments/list - ${data.length} Addendum Terdaftar`);
      passed++;
      results.push({ test: 'GET /contracts/amendments/list', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /contracts/amendments/list status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /contracts/amendments/list', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /contracts/amendments/list: ${err.message}`);
    failed++;
  }

  // Test 12: POST /contracts/amendments
  try {
    const payload = {
      contractId: 'CTR-001',
      amendmentNumber: 'ADD-02',
      title: 'Addendum II: Penambahan Volume D-Wall Zona Selatan',
      amendmentType: 'COST_ADJUSTMENT',
      costDelta: 8500000000,
      eotDays: 15,
      effectiveDate: '2026-03-10',
      signedByClient: 'Budi Santoso, ST (PPK)',
      signedByContractor: 'Ir. Hendra Wijaya (Project Director)',
      description: 'Penambahan kedalaman D-Wall elevasi -22m akibat lapisan batuan keras.'
    };
    const res = await fetch(`${BACKEND_BASE}/contracts/amendments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && data.amendment?.id) {
      console.log(`[PASS] POST /contracts/amendments - Created Amendment ID: ${data.amendment.id} (New Value: Rp ${(data.amendment.newValue / 1000000000).toFixed(2)} M)`);
      passed++;
      results.push({ test: 'POST /contracts/amendments', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /contracts/amendments status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /contracts/amendments', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /contracts/amendments: ${err.message}`);
    failed++;
  }

  // Summary
  console.log('\n====================================================');
  console.log(`TOTAL PASS: ${passed} / 41`);
  console.log(`TOTAL FAIL: ${failed} / 41`);
  console.log(`PASS RATE:  ${((passed / 41) * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRegression();

