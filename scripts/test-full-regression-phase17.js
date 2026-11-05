const http = require('http');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (postData) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(reqOptions, (res) => {
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
  console.log('=== BUILDFLOW ERP: PHASE 17 FULL REGRESSION SUITE ===');
  console.log('Official Construction Reporting Engine & Kurva S EVM Export (PUPR / LPSE)\n');
  let passed = 0;
  let total = 0;

  // 1. Frontend Dashboard Routes (Target: 19 routes)
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
    '/official-reports',
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

  // 2. Testing Backend Official Reports & Kurva S EVM API Endpoints
  console.log('\n--- 2. Testing Backend Official Reports & Kurva S EVM API Endpoints ---');

  // Check 1: Summary & EVM Metrics
  total++;
  let summaryProjectId = null;
  try {
    const res = await request('http://localhost:4000/api/v1/official-reports/summary');
    if (res.status === 200 && res.body && res.body.evm) {
      console.log(`[PASS] GET /api/v1/official-reports/summary -> Physical: ${res.body.physicalProgressPercent}%, SPI: ${res.body.evm.spi}, CPI: ${res.body.evm.cpi}`);
      summaryProjectId = res.body.projectId;
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/official-reports/summary -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/official-reports/summary -> Error: ${err.message}`);
  }

  // Check 2: 24-week Kurva S points
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/official-reports/kurva-s');
    const points = Array.isArray(res.body) ? res.body : (res.body && res.body.dataPoints ? res.body.dataPoints : []);
    if (res.status === 200 && points.length === 24) {
      console.log(`[PASS] GET /api/v1/official-reports/kurva-s -> Returned ${points.length} weekly EVM data points (Current: Week ${res.body?.currentWeek || 18})`);
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/official-reports/kurva-s -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/official-reports/kurva-s -> Error: ${err.message}`);
  }

  // Check 3: Official Reports list
  total++;
  let sampleReportId = null;
  try {
    const res = await request('http://localhost:4000/api/v1/official-reports');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
      sampleReportId = res.body[0].id;
      console.log(`[PASS] GET /api/v1/official-reports -> Found ${res.body.length} reports, sample: ${res.body[0].reportNumber}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/official-reports -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/official-reports -> Error: ${err.message}`);
  }

  // Check 4: Filtered Reports query
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/official-reports?type=WEEKLY');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`[PASS] GET /api/v1/official-reports?type=WEEKLY -> Returned ${res.body.length} weekly reports`);
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/official-reports?type=WEEKLY -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/official-reports?type=WEEKLY -> Error: ${err.message}`);
  }

  // Check 5: BAP & BAST list
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/official-reports/bast-bap');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
      console.log(`[PASS] GET /api/v1/official-reports/bast-bap -> Found ${res.body.length} BAP/BAST documents`);
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/official-reports/bast-bap -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/official-reports/bast-bap -> Error: ${err.message}`);
  }

  // Check 6: Print Preview A4 document sheet payload
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/official-reports/print-preview');
    if (res.status === 200 && res.body && res.body.documentTitle) {
      console.log(`[PASS] GET /api/v1/official-reports/print-preview -> Title: "${res.body.documentTitle}", Format: ${res.body.format}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/official-reports/print-preview -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/official-reports/print-preview -> Error: ${err.message}`);
  }

  // Check 7: POST /api/v1/official-reports (Create new Periodic Report)
  total++;
  let newReportId = null;
  try {
    const payload = {
      projectId: summaryProjectId,
      reportType: 'WEEKLY',
      periodNumber: 19,
      startDate: '2026-03-02',
      endDate: '2026-03-08',
      title: 'Laporan Kemajuan Pekerjaan Fisik Minggu Ke-19',
      workSummary: 'Pemasangan ducting AC central dan testing MEP lantai 10.',
      plannedProgressPercent: 68.0,
      cumulativeProgressPercent: 71.2,
      manpowerCount: 130,
      weatherConditions: 'Cerah Berawan',
      contractorNotes: 'Progres ahead 3.2% dari jadwal baseline.'
    };
    const res = await request('http://localhost:4000/api/v1/official-reports', { method: 'POST' }, payload);
    if (res.status === 201 && res.body && res.body.id) {
      newReportId = res.body.id;
      console.log(`[PASS] POST /api/v1/official-reports -> Created Report ${res.body.reportNumber} (ID: ${newReportId})`);
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/official-reports -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] POST /api/v1/official-reports -> Error: ${err.message}`);
  }

  // Check 8: PATCH /api/v1/official-reports/:id/status (Approve / Sign-off Report)
  total++;
  try {
    const targetId = newReportId || sampleReportId;
    const payload = {
      status: 'APPROVED_OWNER',
      reviewerNotes: 'Disahkan oleh Pejabat Pembuat Komitmen (PPK) setelah opname fisik bersama konsultan pengawas MK.',
      approvedProgressPercent: 71.2,
      verifiedBy: 'Dr. Ir. Bambang Sutrisno (PPK PUPR)'
    };
    const res = await request(`http://localhost:4000/api/v1/official-reports/${targetId}/status`, { method: 'PATCH' }, payload);
    if (res.status === 200 && res.body && res.body.status === 'APPROVED_OWNER') {
      console.log(`[PASS] PATCH /api/v1/official-reports/${targetId}/status -> Status updated to APPROVED_OWNER by ${res.body.verifiedBy}`);
      passed++;
    } else {
      console.error(`[FAIL] PATCH /api/v1/official-reports/${targetId}/status -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] PATCH /api/v1/official-reports/:id/status -> Error: ${err.message}`);
  }

  // Check 9: GET /api/v1/official-reports/:id (Retrieve specific Report)
  total++;
  try {
    const targetId = newReportId || sampleReportId;
    const res = await request(`http://localhost:4000/api/v1/official-reports/${targetId}`);
    if (res.status === 200 && res.body && res.body.id === targetId) {
      console.log(`[PASS] GET /api/v1/official-reports/${targetId} -> Retrieved: ${res.body.reportNumber}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/official-reports/${targetId} -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/official-reports/:id -> Error: ${err.message}`);
  }

  // Check 10: POST /api/v1/official-reports/bast-bap (Issue new BAP / BAST)
  total++;
  try {
    const payload = {
      projectId: summaryProjectId,
      docType: 'BAP_TERMIN',
      termNumber: 4,
      title: 'Berita Acara Pembayaran (BAP) Termin Ke-4 Prestasi 70%',
      inspectionDate: '2026-03-05',
      physicalProgressPercent: 70.0,
      grossAmount: 4275000000,
      retentionPercent: 5.0,
      retentionAmount: 213750000,
      netAmount: 4061250000,
      contractorRepresentative: 'Ir. Agus Wijaya, M.T. (PM)',
      mkRepresentative: 'Ir. Hendra Prasetyo (Team Leader MK)',
      ownerRepresentative: 'Dr. Ir. Bambang Sutrisno (PPK)',
      notes: 'Opname bersama 70% fisik tuntas dan disahkan.'
    };
    const res = await request('http://localhost:4000/api/v1/official-reports/bast-bap', { method: 'POST' }, payload);
    if (res.status === 201 && res.body && res.body.id) {
      console.log(`[PASS] POST /api/v1/official-reports/bast-bap -> Created Document ${res.body.docNumber} (Net: Rp ${res.body.netAmount.toLocaleString('id-ID')})`);
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/official-reports/bast-bap -> Status ${res.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] POST /api/v1/official-reports/bast-bap -> Error: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`REGRESSION TEST RESULT: ${passed} / ${total} CHECKS PASSED`);
  console.log(`PASS RATE: ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`========================================`);

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
