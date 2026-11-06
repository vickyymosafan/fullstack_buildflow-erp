/**
 * Full Regression Test Suite for Phase 24:
 * Enterprise Multi-Company Treasury, Banking Host-to-Host (H2H) & Cash Pooling
 * Tests all 27 Next.js frontend routes and all 12 NestJS backend endpoints
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
  '/treasury', // Phase 24
  '/hr',
  '/analytics',
  '/settings',
];

async function runRegression() {
  console.log('====================================================');
  console.log('   BUILDFLOW ERP - PHASE 24 FULL REGRESSION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  // 1. Frontend Route Checks (27 Routes)
  console.log('--- 1. Testing 27 Frontend Dashboard Routes ---');
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

  // 2. Backend Treasury Endpoints Checks (12 Endpoints)
  console.log('\n--- 2. Testing 12 Backend Treasury Endpoints ---');

  // Test 1: GET /treasury/summary
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/summary`);
    const data = await res.json();
    if (res.status === 200 && data.totalLiquidity > 0) {
      console.log(`[PASS] GET /treasury/summary - Total Likuiditas: Rp ${(data.totalLiquidity / 1000000000).toFixed(2)} M`);
      passed++;
      results.push({ test: 'GET /treasury/summary', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /treasury/summary status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /treasury/summary', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /treasury/summary: ${err.message}`);
    failed++;
  }

  // Test 2: GET /treasury/accounts
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/accounts`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 6) {
      console.log(`[PASS] GET /treasury/accounts - ${data.length} Rekening Bank H2H`);
      passed++;
      results.push({ test: 'GET /treasury/accounts', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /treasury/accounts status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] GET /treasury/accounts: ${err.message}`);
    failed++;
  }

  // Test 3: POST /treasury/accounts
  let createdAccNumber = `137-00-TEST-${Date.now().toString().slice(-4)}`;
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankName: 'Bank Mandiri',
        accountNumber: createdAccNumber,
        accountHolder: 'BuildFlow Regression Test Pool',
        accountType: 'PROJECT_OPERATIONAL',
        currency: 'IDR',
        currentBalance: 5000000000,
        minimumBalanceTarget: 2000000000,
        branchOffice: 'KC Thamrin',
      }),
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
      console.log(`[PASS] POST /treasury/accounts - ${data.message}`);
      passed++;
      results.push({ test: 'POST /treasury/accounts', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /treasury/accounts status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] POST /treasury/accounts: ${err.message}`);
    failed++;
  }

  // Test 4: GET /treasury/disbursements
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/disbursements`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log(`[PASS] GET /treasury/disbursements - ${data.length} Batches`);
      passed++;
      results.push({ test: 'GET /treasury/disbursements', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /treasury/disbursements status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] GET /treasury/disbursements: ${err.message}`);
    failed++;
  }

  // Test 5: POST /treasury/disbursements (Maker)
  let createdBatchId = '';
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/disbursements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchTitle: 'Payroll Mandor Pembesian Pier Head Stasiun Glodok',
        bankPartner: 'Bank Mandiri',
        sourceAccountNumber: '137-00-1928374-1',
        category: 'MANDOR_PAYROLL',
        projectId: 'PRJ-MRT-001',
        projectName: 'MRT Fase 2A CP201 Monas-Harmoni',
        makerName: 'Ahmad Zulkarnaen, S.Ak',
        items: [
          {
            beneficiaryCode: 'MND-091',
            beneficiaryName: 'Mandor Sutrisno',
            beneficiaryBank: 'Bank Mandiri',
            beneficiaryAccount: '137-00-7766551',
            amount: 750000000,
            description: 'Opname Pekerjaan Pier Head Week 9',
          },
        ],
      }),
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
      createdBatchId = data.disbursement.id;
      console.log(`[PASS] POST /treasury/disbursements - ${data.message}`);
      passed++;
      results.push({ test: 'POST /treasury/disbursements', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /treasury/disbursements status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] POST /treasury/disbursements: ${err.message}`);
    failed++;
  }

  // Test 6: PATCH /treasury/disbursements/:id/authorize (Checker & Signer)
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/disbursements/${createdBatchId || 'DISB-001'}/authorize`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'CHECKER',
        authorizerName: 'Dewi Rahmawati, S.E. (Head of Corporate Treasury)',
        isApproved: true,
      }),
    });
    const data = await res.json();
    if (res.status === 200) {
      console.log(`[PASS] PATCH /treasury/disbursements/:id/authorize - ${data.message}`);
      passed++;
      results.push({ test: 'PATCH /treasury/disbursements/:id/authorize', status: 'PASS' });
    } else {
      console.error(`[FAIL] PATCH /treasury/disbursements/:id/authorize status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] PATCH /treasury/disbursements/:id/authorize: ${err.message}`);
    failed++;
  }

  // Test 7: GET /treasury/virtual-accounts
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/virtual-accounts`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log(`[PASS] GET /treasury/virtual-accounts - ${data.length} VA Active`);
      passed++;
      results.push({ test: 'GET /treasury/virtual-accounts', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /treasury/virtual-accounts status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] GET /treasury/virtual-accounts: ${err.message}`);
    failed++;
  }

  // Test 8: POST /treasury/virtual-accounts
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/virtual-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankPartner: 'Bank Mandiri',
        customerName: 'PT MRT Jakarta (Perseroda)',
        projectId: 'PRJ-MRT-001',
        projectName: 'MRT Fase 2A CP201 Monas-Harmoni',
        billAmount: 6500000000,
        purpose: 'MONTHLY_CERTIFICATE',
        invoiceReference: 'INV-MC20-MRT2026-03',
        expiredAt: '2026-04-15T23:59:59Z',
      }),
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
      console.log(`[PASS] POST /treasury/virtual-accounts - ${data.message}`);
      passed++;
      results.push({ test: 'POST /treasury/virtual-accounts', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /treasury/virtual-accounts status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] POST /treasury/virtual-accounts: ${err.message}`);
    failed++;
  }

  // Test 9: GET /treasury/reconciliations
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/reconciliations`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log(`[PASS] GET /treasury/reconciliations - ${data.length} Statements`);
      passed++;
      results.push({ test: 'GET /treasury/reconciliations', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /treasury/reconciliations status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] GET /treasury/reconciliations: ${err.message}`);
    failed++;
  }

  // Test 10: POST /treasury/reconciliations/upload-mt940
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/reconciliations/upload-mt940`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankName: 'Bank Mandiri',
        accountNumber: '137-00-1928374-1',
        statementText: ':20:MT940-TEST\n:25:137-00-1928374-1\n:60F:C260305IDR42500000000,00',
      }),
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
      console.log(`[PASS] POST /treasury/reconciliations/upload-mt940 - ${data.message}`);
      passed++;
      results.push({ test: 'POST /treasury/reconciliations/upload-mt940', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /treasury/reconciliations/upload-mt940 status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] POST /treasury/reconciliations/upload-mt940: ${err.message}`);
    failed++;
  }

  // Test 11: GET /treasury/cash-pooling
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/cash-pooling`);
    const data = await res.json();
    if (res.status === 200 && data.accounts && data.sweeps) {
      console.log(`[PASS] GET /treasury/cash-pooling - ${data.accounts.length} Accounts, ${data.sweeps.length} Sweeps`);
      passed++;
      results.push({ test: 'GET /treasury/cash-pooling', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /treasury/cash-pooling status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] GET /treasury/cash-pooling: ${err.message}`);
    failed++;
  }

  // Test 12: POST /treasury/cash-pooling/sweep
  try {
    const res = await fetch(`${BACKEND_BASE}/treasury/cash-pooling/sweep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poolGroupId: 'POOL-GRP-HOLDING-IDR',
        sourceAccountNumber: '123-00-5544332-1',
        targetAccountNumber: '123-00-9876543-2',
        amount: 500000000,
        sweepType: 'SWEEPING_TO_MASTER',
        authorizedBy: 'Dewi Rahmawati, S.E. (Head of Corporate Treasury)',
        remarks: 'Regression test sweeping cash to holding',
      }),
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
      console.log(`[PASS] POST /treasury/cash-pooling/sweep - ${data.message}`);
      passed++;
      results.push({ test: 'POST /treasury/cash-pooling/sweep', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /treasury/cash-pooling/sweep status: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] POST /treasury/cash-pooling/sweep: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`REGRESSION SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRegression();
