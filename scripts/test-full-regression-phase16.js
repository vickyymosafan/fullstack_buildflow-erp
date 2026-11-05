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
  console.log('=== BUILDFLOW ERP: PHASE 16 FULL REGRESSION SUITE ===');
  console.log('Contract Change Orders (CCO), Variation Orders & Klaim Konstruksi\n');
  let passed = 0;
  let total = 0;

  // 1. Frontend Dashboard Routes (Target: 18 routes)
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
    '/equipment',
    '/change-orders',
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

  // 2. Testing Backend Change Orders & Claims API Endpoints
  console.log('\n--- 2. Testing Backend Change Orders & Claims API Endpoints ---');

  // Check 1: Summary KPI
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/change-orders/summary');
    if (
      res.status === 200 &&
      res.body &&
      typeof res.body.netCostImpact === 'number' &&
      typeof res.body.totalCcoCount === 'number' &&
      typeof res.body.totalTimeImpactDays === 'number' &&
      typeof res.body.revisedContractValue === 'number'
    ) {
      console.log(
        `[PASS] GET /api/v1/change-orders/summary -> Total CCO: ${res.body.totalCcoCount}, Net Biaya: Rp ${res.body.netCostImpact.toLocaleString()}, EoT: +${res.body.totalTimeImpactDays} hari, Nilai Kontrak Akhir: Rp ${res.body.revisedContractValue.toLocaleString()}`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/change-orders/summary ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/change-orders/summary -> ${err.message}`);
  }

  // Check 2: CCO List
  total++;
  let firstOrder = null;
  try {
    const res = await request('http://localhost:4000/api/v1/change-orders');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 4) {
      firstOrder = res.body[0];
      console.log(
        `[PASS] GET /api/v1/change-orders -> Ditemukan ${res.body.length} tiket CCO terdaftar`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/change-orders ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/change-orders -> ${err.message}`);
  }

  // Check 3: CCO Detail by ID
  total++;
  try {
    if (firstOrder) {
      const res = await request(`http://localhost:4000/api/v1/change-orders/${firstOrder.id}`);
      if (res.status === 200 && res.body && res.body.id === firstOrder.id) {
        console.log(
          `[PASS] GET /api/v1/change-orders/:id -> Detail tiket ${res.body.ccoNumber || res.body.id} ("${res.body.title}") terverifikasi (${(res.body.items || []).length} item WBS)`
        );
        passed++;
      } else {
        console.error(`[FAIL] GET /api/v1/change-orders/:id ->`, res);
      }
    } else {
      console.error(`[FAIL] GET /api/v1/change-orders/:id -> Tiket CCO pertama tidak ditemukan`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/change-orders/:id -> ${err.message}`);
  }

  // Check 4: POST /api/v1/change-orders (Create CCO)
  total++;
  let createdCcoId = null;
  try {
    const newCco = {
      projectCode: 'PRJ-NSI-2026',
      title: 'Pekerjaan Tambah Canopy Drop-Off Lobi Utama',
      description: 'Penambahan kanopi kantilever baja dan tempered glass pada area drop-off',
      changeType: 'SCOPE_ADDITION',
      requestedBy: 'OWNER_REP',
      originatorName: 'Dr. Ir. Bambang Sutrisno (Owner)',
      costImpact: 275000000,
      timeImpactDays: 14,
      location: 'Area Drop-Off Lobi Utama Lantai 1',
      items: [
        {
          description: 'Rangka Baja WF 200 Kantilever Drop-Off',
          qty: 1200,
          unit: 'kg',
          unitPrice: 85000,
          totalPrice: 102000000,
          type: 'ADDITION',
        },
        {
          description: 'Kaca Tempered Laminated 12mm Frosted',
          qty: 140,
          unit: 'm2',
          unitPrice: 1235714,
          totalPrice: 173000000,
          type: 'ADDITION',
        },
      ],
    };

    const res = await request(
      'http://localhost:4000/api/v1/change-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newCco
    );

    const ccoId = res.body && (res.body.id || res.body.changeOrderId);
    if (res.status === 201 && ccoId) {
      createdCcoId = ccoId;
      console.log(
        `[PASS] POST /api/v1/change-orders -> Sukses membuat CCO #${res.body.ccoNumber} (ID: ${ccoId})`
      );
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/change-orders ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] POST /api/v1/change-orders -> ${err.message}`);
  }

  // Check 5: PATCH /api/v1/change-orders/:id/status (Review / Approve CCO)
  total++;
  try {
    if (createdCcoId) {
      const updateData = {
        status: 'REVIEW_MK',
        reviewerNotes: 'Spesifikasi baja WF dan kaca tempered telah sesuai standar struktural SNI.',
        approvedCostImpact: 275000000,
        approvedTimeImpactDays: 14,
        reviewedBy: 'Ir. Hendra Prasetyo (Konsultan MK)',
      };

      const res = await request(
        `http://localhost:4000/api/v1/change-orders/${createdCcoId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        updateData
      );

      if (res.status === 200 && res.body && (res.body.status === 'REVIEW_MK' || res.body.success)) {
        console.log(
          `[PASS] PATCH /api/v1/change-orders/:id/status -> Status CCO diperbarui ke REVIEW_MK`
        );
        passed++;
      } else {
        console.error(`[FAIL] PATCH /api/v1/change-orders/:id/status ->`, res);
      }
    } else {
      console.error(`[FAIL] PATCH /api/v1/change-orders/:id/status -> ID CCO tidak valid`);
    }
  } catch (err) {
    console.error(`[FAIL] PATCH /api/v1/change-orders/:id/status -> ${err.message}`);
  }

  // Check 6: Claims List
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/change-orders/claims');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 3) {
      console.log(
        `[PASS] GET /api/v1/change-orders/claims -> Ditemukan ${res.body.length} berkas klaim konstruksi`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/change-orders/claims ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/change-orders/claims -> ${err.message}`);
  }

  // Check 7: POST /api/v1/change-orders/claims (Create Claim)
  total++;
  try {
    const newClaim = {
      projectCode: 'PRJ-NSI-2026',
      claimNumber: 'CLM-2026-REG-01',
      title: 'Klaim Perpanjangan Waktu Dampak Hujan Ekstrem BMKG',
      claimCategory: 'RAIN_DELAY',
      requestedCost: 0,
      requestedDays: 5,
      submittedDate: '2026-03-10',
      evidenceDescription: 'Laporan Stasiun Meteorologi BMKG mencatat curah hujan > 180mm/hari selama 5 hari',
    };

    const res = await request(
      'http://localhost:4000/api/v1/change-orders/claims',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newClaim
    );

    const clmId = res.body && (res.body.id || res.body.claimId);
    if (res.status === 201 && clmId) {
      console.log(
        `[PASS] POST /api/v1/change-orders/claims -> Sukses mengajukan klaim #${res.body.claimNumber} (+${res.body.requestedDays} hari EoT)`
      );
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/change-orders/claims ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] POST /api/v1/change-orders/claims -> ${err.message}`);
  }

  // Check 8: Filtering CCO by status
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/change-orders?status=APPROVED_OWNER');
    if (res.status === 200 && Array.isArray(res.body) && res.body.every((c) => c.status === 'APPROVED_OWNER')) {
      console.log(
        `[PASS] GET /api/v1/change-orders?status=APPROVED_OWNER -> Terfilter ${res.body.length} tiket disetujui`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/change-orders?status=APPROVED_OWNER ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/change-orders?status=APPROVED_OWNER -> ${err.message}`);
  }

  // Check 9: Search CCO by keyword
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/change-orders?search=Pondasi');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(
        `[PASS] GET /api/v1/change-orders?search=Pondasi -> Menemukan ${res.body.length} tiket cocok`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/change-orders?search=Pondasi ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/change-orders?search=Pondasi -> ${err.message}`);
  }

  // Check 10: Filtering CCO by changeType
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/change-orders?changeType=SCOPE_ADDITION');
    if (res.status === 200 && Array.isArray(res.body) && res.body.every((c) => c.changeType === 'SCOPE_ADDITION')) {
      console.log(
        `[PASS] GET /api/v1/change-orders?changeType=SCOPE_ADDITION -> Terfilter ${res.body.length} tiket penambahan lingkup`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/change-orders?changeType=SCOPE_ADDITION ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/change-orders?changeType=SCOPE_ADDITION -> ${err.message}`);
  }

  // Final Summary
  console.log('\n======================================================');
  console.log(`TOTAL CHECKS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${total - passed}`);
  const passRate = ((passed / total) * 100).toFixed(1);
  console.log(`PASS RATE: ${passRate}%`);
  console.log('======================================================\n');

  if (passed === total) {
    console.log('✅ ALL PHASE 16 REGRESSION CHECKS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME REGRESSION CHECKS FAILED!');
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal error during regression test:', err);
  process.exit(1);
});
