const http = require('http');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runRegressionSuite() {
  console.log('=== BUILDFLOW ERP: PHASE 14 FULL REGRESSION SUITE ===\n');
  let passed = 0;
  let total = 0;

  // 1. Frontend Dashboard Routes (Target: 16 routes)
  console.log('--- 1. Testing Frontend Dashboard Routes (Target: HTTP 200) ---');
  const frontendRoutes = [
    '/overview',
    '/projects',
    '/budget',
    '/site',
    '/quality',
    '/documents',
    '/procurement',
    '/inventory',
    '/finance',
    '/hr',
    '/analytics',
    '/crm',
    '/approvals',
    '/orchestration',
    '/hse',
    '/subcontractors',
  ];

  for (const route of frontendRoutes) {
    total++;
    try {
      const res = await request(`http://localhost:3000${route}`);
      if (res.status === 200) {
        console.log(`[PASS] Frontend ${route} -> Status 200`);
        passed++;
      } else {
        console.error(`[FAIL] Frontend ${route} -> Status ${res.status}`);
      }
    } catch (err) {
      console.error(`[FAIL] Frontend ${route} -> Error: ${err.message}`);
    }
  }

  // 2. Testing Backend Subcontractors API Endpoints
  console.log('\n--- 2. Testing Backend Subcontractors API Endpoints ---');

  // Check 1: Summary
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/subcontractors/summary');
    if (res.status === 200 && res.body && res.body.totalSpkCount >= 3) {
      console.log(`[PASS] GET /subcontractors/summary -> TotalSPK: ${res.body.totalSpkCount}, RetentionHeld: Rp ${res.body.totalRetentionHeld.toLocaleString('id-ID')}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /subcontractors/summary -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /subcontractors/summary -> Error: ${err.message}`);
  }

  // Check 2: List SPK
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/subcontractors/spk');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 3) {
      console.log(`[PASS] GET /subcontractors/spk -> Total SPKs: ${res.body.length}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /subcontractors/spk -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /subcontractors/spk -> Error: ${err.message}`);
  }

  // Check 3: Create SPK
  total++;
  let createdSpkNumber = `SPK-REGRESS-${Date.now().toString().slice(-4)}`;
  try {
    const payload = {
      spkNumber: createdSpkNumber,
      subconName: 'PT Wika Rekayasa Konstruksi',
      scopeOfWork: 'Fabrikasi dan Ereksi Rangka Atap Baja Ringan',
      category: 'STRUKTUR',
      contractValue: 890000000,
      downPaymentPercent: 10,
      retentionPercent: 5,
      startDate: '2026-04-01',
      endDate: '2026-09-30',
      picName: 'Gunawan Prasetyo',
      picPhone: '0812-4455-6677',
    };
    const res = await request('http://localhost:4000/api/v1/subcontractors/spk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, payload);

    if (res.status === 201 && res.body && res.body.id) {
      console.log(`[PASS] POST /subcontractors/spk -> Created SPK: ${res.body.spkNumber}`);
      passed++;
    } else {
      console.error(`[FAIL] POST /subcontractors/spk -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] POST /subcontractors/spk -> Error: ${err.message}`);
  }

  // Check 4: List Opname
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/subcontractors/opname');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 3) {
      console.log(`[PASS] GET /subcontractors/opname -> Total Opnames: ${res.body.length}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /subcontractors/opname -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /subcontractors/opname -> Error: ${err.message}`);
  }

  // Check 5: Create Opname
  total++;
  try {
    const payload = {
      spkId: createdSpkNumber,
      opnameNumber: `OPN-REGRESS-${Date.now().toString().slice(-4)}`,
      period: 'Maret 2026 (Minggu ke-4)',
      previousProgress: 0,
      currentProgress: 35.5,
      verifiedBy: 'Ir. Hendra Prasetyo (Konsultan MK)',
      notes: 'Opname perakitan kuda-kuda baja ringan bentang 18 meter',
    };
    const res = await request('http://localhost:4000/api/v1/subcontractors/opname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, payload);

    if (res.status === 201 && res.body && res.body.id) {
      console.log(`[PASS] POST /subcontractors/opname -> Recorded Opname: ${res.body.opnameNumber} (${res.body.progress}%)`);
      passed++;
    } else {
      console.error(`[FAIL] POST /subcontractors/opname -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] POST /subcontractors/opname -> Error: ${err.message}`);
  }

  // Check 6: List MC
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/subcontractors/mc');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 3) {
      console.log(`[PASS] GET /subcontractors/mc -> Total MCs: ${res.body.length}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /subcontractors/mc -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /subcontractors/mc -> Error: ${err.message}`);
  }

  // Check 7: Create MC
  total++;
  let createdMcId = null;
  try {
    const gross = 200000000;
    const dp = 20000000;
    const ret = 10000000;
    const tax = (gross - dp) * 0.0265;
    const net = gross - dp - ret - tax;

    const payload = {
      spkId: createdSpkNumber,
      mcNumber: `MC-REGRESS-${Date.now().toString().slice(-4)}`,
      period: 'Maret 2026',
      grossAmount: gross,
      dpDeduction: dp,
      retentionDeduction: ret,
      pphFinalPercent: 2.65,
      taxPphAmount: tax,
      netPayable: net,
      notes: 'Tagihan Monthly Certificate progres opname ke-1',
    };
    const res = await request('http://localhost:4000/api/v1/subcontractors/mc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, payload);

    if (res.status === 201 && res.body && res.body.id) {
      createdMcId = res.body.id;
      console.log(`[PASS] POST /subcontractors/mc -> Created MC: ${res.body.mcNumber} (Net: Rp ${res.body.netPayable.toLocaleString('id-ID')})`);
      passed++;
    } else {
      console.error(`[FAIL] POST /subcontractors/mc -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] POST /subcontractors/mc -> Error: ${err.message}`);
  }

  // Check 8: Update MC Status to APPROVED
  total++;
  try {
    if (createdMcId) {
      const res = await request(`http://localhost:4000/api/v1/subcontractors/mc/${createdMcId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      }, { status: 'APPROVED', approvedBy: 'Ir. Danang Wicaksono (Project Manager)' });

      if (res.status === 200 && res.body && res.body.status === 'APPROVED') {
        console.log(`[PASS] PATCH /subcontractors/mc/:id/status -> Status updated to APPROVED`);
        passed++;
      } else {
        console.error(`[FAIL] PATCH /subcontractors/mc/:id/status -> Status ${res.status}`);
      }
    } else {
      console.error('[FAIL] PATCH /subcontractors/mc/:id/status -> No createdMcId');
    }
  } catch (err) {
    console.error(`[FAIL] PATCH /subcontractors/mc/:id/status -> Error: ${err.message}`);
  }

  // Check 9: Update MC Status to PAID
  total++;
  try {
    if (createdMcId) {
      const res = await request(`http://localhost:4000/api/v1/subcontractors/mc/${createdMcId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      }, { status: 'PAID', approvedBy: 'Finance Project Treasury' });

      if (res.status === 200 && res.body && res.body.status === 'PAID') {
        console.log(`[PASS] PATCH /subcontractors/mc/:id/status -> Status updated to PAID (Disbursed)`);
        passed++;
      } else {
        console.error(`[FAIL] PATCH /subcontractors/mc/:id/status -> Status ${res.status}`);
      }
    } else {
      console.error('[FAIL] PATCH /subcontractors/mc/:id/status -> No createdMcId');
    }
  } catch (err) {
    console.error(`[FAIL] PATCH /subcontractors/mc/:id/status -> Error: ${err.message}`);
  }

  // Check 10: Vendor / Mitra Directory
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/subcontractors/vendors');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 4) {
      console.log(`[PASS] GET /subcontractors/vendors -> Verified ${res.body.length} accredited construction partners`);
      passed++;
    } else {
      console.error(`[FAIL] GET /subcontractors/vendors -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /subcontractors/vendors -> Error: ${err.message}`);
  }

  console.log('\n======================================================');
  console.log(`TOTAL CHECKS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('======================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal regression suite error:', err);
  process.exit(1);
});
