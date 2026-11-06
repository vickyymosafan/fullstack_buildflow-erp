const http = require('http');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({ statusCode: res.statusCode, data, json });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runRegression() {
  console.log('=== BUILDFLOW ERP PHASE 18 FULL REGRESSION TEST ===\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  async function test(name, fn) {
    try {
      const res = await fn();
      if (res) {
        console.log(`[PASS] ${name}`);
        passed++;
        results.push({ name, status: 'PASS', details: res });
      } else {
        console.error(`[FAIL] ${name}`);
        failed++;
        results.push({ name, status: 'FAIL' });
      }
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
      results.push({ name, status: 'FAIL', error: err.message });
    }
  }

  // --- SECTION 1: FRONTEND DASHBOARD ROUTES (21 ROUTES) ---
  console.log('--- 1. Testing Frontend Dashboard Routes (Port 3000) ---');
  const routes = [
    '/overview',
    '/projects',
    '/budget',
    '/procurement',
    '/inventory',
    '/site',
    '/subcontractors',
    '/equipment',
    '/quality',
    '/hse',
    '/change-orders',
    '/finance',
    '/approvals',
    '/documents',
    '/crm',
    '/hr',
    '/official-reports',
    '/analytics',
    '/orchestration',
    '/settings',
    '/joint-operations',
  ];

  for (const route of routes) {
    await test(`Frontend Route: ${route}`, async () => {
      const res = await request(`http://localhost:3000${route}`);
      return res.statusCode === 200;
    });
  }

  // --- SECTION 2: BACKEND JOINT OPERATIONS API (10 ENDPOINTS) ---
  console.log('\n--- 2. Testing Backend Joint Operations API (Port 4000) ---');

  await test('GET /api/v1/joint-operations/summary', async () => {
    const res = await request('http://localhost:4000/api/v1/joint-operations/summary');
    return res.statusCode === 200 && res.json && res.json.totalContractValue > 0;
  });

  await test('GET /api/v1/joint-operations/consortiums', async () => {
    const res = await request('http://localhost:4000/api/v1/joint-operations/consortiums');
    return res.statusCode === 200 && Array.isArray(res.json) && res.json.length >= 2;
  });

  let createdKsoCode = `KSO-TEST-${Date.now()}`;
  await test('POST /api/v1/joint-operations/consortiums', async () => {
    const payload = {
      ksoCode: createdKsoCode,
      consortiumName: 'KSO Adhi - Waskita Toll Road',
      projectTitle: 'Pembangunan Jalan Tol Trans-Sumatera Seksi 4',
      leadContractor: 'PT Adhi Megah Konstruksi (Persero) Tbk',
      leadSharePercent: 65,
      leadSignatory: 'Ir. Hendra Gunawan (PM)',
      partnerContractor: 'PT Waskita Karya Infrastruktur',
      partnerSharePercent: 35,
      partnerSignatory: 'Bambang Sudiro (Direktur)',
      jointBank: 'Bank BRI (Persero) Tbk',
      jointAccountNumber: '0206-01-001234-50-8',
      jointAccountName: 'KSO ADHI WASKITA TOLL',
      contractValue: 95000000000,
      jointCashBalance: 12000000000,
      taxQualification: 'BESAR',
      notes: 'Akta Notaris Tol 2026',
    };
    const res = await request('http://localhost:4000/api/v1/joint-operations/consortiums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    return res.statusCode === 201 && res.json && res.json.ksoCode === createdKsoCode;
  });

  await test('GET /api/v1/joint-operations/expenses', async () => {
    const res = await request('http://localhost:4000/api/v1/joint-operations/expenses');
    return res.statusCode === 200 && Array.isArray(res.json) && res.json.length > 0;
  });

  let createdExpenseId = null;
  await test('POST /api/v1/joint-operations/expenses', async () => {
    const payload = {
      ksoCode: 'KSO-IKN-PK3-2026',
      title: 'Uji Laboratorium Mutu Beton Bersama',
      category: 'SITE_FACILITY',
      amount: 85000000,
      vendorName: 'PT Sucofindo Prima Inspection',
      invoiceRef: 'INV-SUCO-2026-088',
      notes: 'Testing kuat tekan beton mutu K-500 KSO IKN',
    };
    const res = await request('http://localhost:4000/api/v1/joint-operations/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    if (res.statusCode === 201 && res.json) {
      createdExpenseId = res.json.id;
      return res.json.status === 'PENDING_APPROVAL';
    }
    return false;
  });

  await test('PATCH /api/v1/joint-operations/expenses/:id/approve (Lead Signatory)', async () => {
    if (!createdExpenseId) return false;
    const res = await request(`http://localhost:4000/api/v1/joint-operations/expenses/${createdExpenseId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { signatoryRole: 'LEAD' },
    });
    return res.statusCode === 200 && res.json && res.json.leadApproved === true;
  });

  await test('PATCH /api/v1/joint-operations/expenses/:id/approve (Partner Signatory Dual-Approval)', async () => {
    if (!createdExpenseId) return false;
    const res = await request(`http://localhost:4000/api/v1/joint-operations/expenses/${createdExpenseId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { signatoryRole: 'PARTNER' },
    });
    return res.statusCode === 200 && res.json && res.json.status === 'APPROVED_DUAL' && res.json.partnerApproved === true;
  });

  await test('GET /api/v1/joint-operations/distributions', async () => {
    const res = await request('http://localhost:4000/api/v1/joint-operations/distributions');
    return res.statusCode === 200 && Array.isArray(res.json) && res.json.length > 0;
  });

  await test('POST /api/v1/joint-operations/distributions', async () => {
    const payload = {
      ksoCode: 'KSO-IKN-PK3-2026',
      periodLabel: 'Triwulan II 2026 (Tahap Final)',
      grossRevenue: 30000000000,
      totalSharedCost: 4000000000,
      retentionReserve: 1500000000,
      notes: 'Pembagian dividen interim triwulan II',
    };
    const res = await request('http://localhost:4000/api/v1/joint-operations/distributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    return res.statusCode === 201 && res.json && res.json.netProfit === 24500000000;
  });

  await test('GET /api/v1/joint-operations/taxes', async () => {
    const res = await request('http://localhost:4000/api/v1/joint-operations/taxes');
    return res.statusCode === 200 && Array.isArray(res.json) && res.json.length > 0;
  });

  await test('POST /api/v1/joint-operations/taxes/calculate (PP 9/2022 Menengah & Besar)', async () => {
    const payload = {
      grossAmount: 10000000000,
      contractorQualification: 'MENENGAH_BESAR',
      includePph23: true,
      equipmentRentPortion: 1000000000,
      ppnRatePercent: 12,
    };
    const res = await request('http://localhost:4000/api/v1/joint-operations/taxes/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    return (
      res.statusCode === 201 &&
      res.json &&
      res.json.pphFinal.ratePercent === 2.65 &&
      res.json.pphFinal.amount === 265000000 &&
      res.json.ppn.ratePercent === 12 &&
      res.json.ppn.amount === 1200000000 &&
      res.json.pph23.amount === 20000000 &&
      res.json.netReceivableAmount === 10915000000
    );
  });

  console.log(`\n========================================`);
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRegression().catch((err) => {
  console.error('Fatal error during regression execution:', err);
  process.exit(1);
});
