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
  console.log('=== BUILDFLOW ERP PHASE 19 FULL REGRESSION TEST ===\n');

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

  // --- SECTION 1: FRONTEND DASHBOARD ROUTES (22 ROUTES) ---
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
    '/handover',
  ];

  for (const route of routes) {
    await test(`Frontend Route: ${route}`, async () => {
      const res = await request(`http://localhost:3000${route}`);
      return res.statusCode === 200;
    });
  }

  // --- SECTION 2: BACKEND HANDOVER & DEFECT LIABILITY API (11 ENDPOINTS) ---
  console.log('\n--- 2. Testing Backend Handover API (Port 4000) ---');

  await test('GET /api/v1/handover/summary', async () => {
    const res = await request('http://localhost:4000/api/v1/handover/summary');
    return res.statusCode === 200 && res.json && res.json.totalHandoverCertificates >= 3;
  });

  await test('GET /api/v1/handover/certificates', async () => {
    const res = await request('http://localhost:4000/api/v1/handover/certificates');
    return res.statusCode === 200 && Array.isArray(res.json) && res.json.length >= 3;
  });

  let createdBastId = null;
  const certNumber = `BAST-PHO-TEST-${Date.now()}`;
  await test('POST /api/v1/handover/certificates', async () => {
    const payload = {
      projectCode: 'PRJ-2026-IKN-PK3',
      certificateType: 'PHO_BAST_1',
      certificateNumber: certNumber,
      title: 'Serah Terima Pertama (PHO) Pekerjaan Jalan Akses Sumbu Barat IKN',
      handoverDate: '2026-05-01',
      workProgressPercent: 100,
      warrantyPeriodMonths: 6,
      committeeChair: 'Ir. Danang Wicaksono, M.Eng.',
      contractorRepresentative: 'Ir. Agus Wijaya, M.T.',
      ownerSignatory: 'Dr. Hendra Gunawan, S.T., M.T.',
      notes: 'Testing integrasi penerbitan BAST PHO Phase 19',
    };
    const res = await request('http://localhost:4000/api/v1/handover/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    if (res.statusCode === 201 && res.json) {
      createdBastId = res.json.id;
      return res.json.certificateNumber === certNumber && res.json.status === 'DRAFT';
    }
    return false;
  });

  await test('PATCH /api/v1/handover/certificates/:id/sign', async () => {
    if (!createdBastId) return false;
    const res = await request(`http://localhost:4000/api/v1/handover/certificates/${createdBastId}/sign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { signatoryRole: 'OWNER_PPK', notes: 'Pengesahan tanda tangan BAST oleh PPK' },
    });
    return res.statusCode === 200 && res.json && res.json.status === 'SIGNED';
  });

  await test('GET /api/v1/handover/punch-lists', async () => {
    const res = await request('http://localhost:4000/api/v1/handover/punch-lists');
    return res.statusCode === 200 && Array.isArray(res.json) && res.json.length >= 5;
  });

  let createdPunchId = null;
  await test('POST /api/v1/handover/punch-lists', async () => {
    const payload = {
      certificateId: 'bast-01',
      title: 'Pembersihan saluran drainase samping jalan dari sisa agregat',
      category: 'CIVIL_INFRA',
      severity: 'LOW',
      location: 'Sta 0+450 Jalur Lambat',
      assignedSubcon: 'PT Saluran Bersih Lestari',
      deadline: '2026-05-10',
      repairMethod: 'Pembersihan manual dan flushing air bertekanan tinggi',
    };
    const res = await request('http://localhost:4000/api/v1/handover/punch-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    if (res.statusCode === 201 && res.json) {
      createdPunchId = res.json.id;
      return res.json.status === 'OPEN';
    }
    return false;
  });

  await test('PATCH /api/v1/handover/punch-lists/:id/rectify (Contractor)', async () => {
    if (!createdPunchId) return false;
    const res = await request(`http://localhost:4000/api/v1/handover/punch-lists/${createdPunchId}/rectify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { afterPhotoUrl: '/proofs/punch-drain-clean-after.jpg', notes: 'Saluran telah bersih 100%' },
    });
    return res.statusCode === 200 && res.json && res.json.status === 'RECTIFIED';
  });

  await test('PATCH /api/v1/handover/punch-lists/:id/close (MK Inspection)', async () => {
    if (!createdPunchId) return false;
    const res = await request(`http://localhost:4000/api/v1/handover/punch-lists/${createdPunchId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { verifiedBy: 'Ir. Danang Wicaksono (PPHP PUPR)' },
    });
    return res.statusCode === 200 && res.json && res.json.status === 'VERIFIED_CLOSED';
  });

  await test('GET /api/v1/handover/retention-releases', async () => {
    const res = await request('http://localhost:4000/api/v1/handover/retention-releases');
    return res.statusCode === 200 && Array.isArray(res.json) && res.json.length >= 2;
  });

  let createdRetId = null;
  await test('POST /api/v1/handover/retention-releases', async () => {
    const payload = {
      certificateId: 'bast-01',
      releaseType: 'CASH_RETENTION',
      retentionAmount: 3500000000,
      bankName: 'Bank Mandiri (Persero) Tbk',
      bankGuaranteeNumber: 'BG-MANDIRI-TEST-009',
      guaranteeValidityDate: '2026-12-31',
      notes: 'Pencairan retensi termin bertahap',
    };
    const res = await request('http://localhost:4000/api/v1/handover/retention-releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    if (res.statusCode === 201 && res.json) {
      createdRetId = res.json.id;
      return res.json.releaseStatus === 'PENDING_VERIFICATION' && res.json.financeApproval === true;
    }
    return false;
  });

  await test('PATCH /api/v1/handover/retention-releases/:id/approve (Owner PPK Dual-Signatory)', async () => {
    if (!createdRetId) return false;
    const res = await request(`http://localhost:4000/api/v1/handover/retention-releases/${createdRetId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { approverRole: 'OWNER_PPK', notes: 'Persetujuan pelepasan dana retensi oleh PPK PUPR' },
    });
    return res.statusCode === 200 && res.json && res.json.releaseStatus === 'RELEASED';
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
