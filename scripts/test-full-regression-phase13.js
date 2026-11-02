const http = require('http');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 8000,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runRegression() {
  console.log('=== BUILDFLOW ERP: PHASE 13 FULL REGRESSION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Frontend Core Routes
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
  ];

  console.log('--- 1. Testing Frontend Dashboard Routes (Target: HTTP 200) ---');
  for (const r of frontendRoutes) {
    try {
      const res = await fetchUrl(`http://localhost:3000${r}`);
      if (res.status === 200) {
        console.log(`[PASS] Frontend ${r} -> Status ${res.status}`);
        passed++;
      } else {
        console.error(`[FAIL] Frontend ${r} -> Status ${res.status}`);
        failed++;
      }
    } catch (e) {
      console.error(`[FAIL] Frontend ${r} -> Error: ${e.message}`);
      failed++;
    }
  }

  // 2. Backend HSE Endpoints
  console.log('\n--- 2. Testing Backend HSE & K3 API Endpoints ---');
  const apiBase = 'http://localhost:4000/api/v1/hse';

  // 2a. Summary
  try {
    const sumRes = await fetchUrl(`${apiBase}/summary`);
    const sumData = JSON.parse(sumRes.data);
    if (sumRes.status === 200 && sumData.safeManHours > 0 && typeof sumData.ltifr === 'number') {
      console.log(`[PASS] GET /hse/summary -> SafeHours: ${sumData.safeManHours}, ZeroAccidentDays: ${sumData.zeroAccidentDays}, LTIFR: ${sumData.ltifr}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /hse/summary -> Invalid response: ${sumRes.data}`);
      failed++;
    }
  } catch (e) {
    console.error(`[FAIL] GET /hse/summary -> ${e.message}`);
    failed++;
  }

  // 2b. PTW List & Creation & Update
  let createdPtwId = null;
  try {
    const ptwListRes = await fetchUrl(`${apiBase}/ptw`);
    const ptwList = JSON.parse(ptwListRes.data);
    if (ptwListRes.status === 200 && Array.isArray(ptwList)) {
      console.log(`[PASS] GET /hse/ptw -> Total permits: ${ptwList.length}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /hse/ptw -> Status ${ptwListRes.status}`);
      failed++;
    }

    // POST PTW
    const newPtwBody = JSON.stringify({
      title: 'Regression Test: Hot Work Pengelasan Pipa Chiller Basement',
      permitType: 'HOT_WORK',
      riskLevel: 'HIGH',
      location: 'Basement 2 Ruang Pompa Chiller',
      contractorName: 'PT Sinar Baja Mekanikal',
      supervisorName: 'Ir. Sigit Wicaksono',
      workerCount: 3,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 8 * 3600000).toISOString(),
      specialPrecautionsRequired: true,
      safetyPrecautions: 'APAR Powder 6kg standby, Fire Blanket, Barricade radius 5m.',
    });

    const createPtwRes = await fetchUrl(`${apiBase}/ptw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: newPtwBody,
    });
    const createPtwData = JSON.parse(createPtwRes.data);
    if (createPtwRes.status === 201 && createPtwData.ptw) {
      createdPtwId = createPtwData.ptw.id;
      console.log(`[PASS] POST /hse/ptw -> Created permit ID: ${createdPtwId}`);
      passed++;
    } else {
      console.error(`[FAIL] POST /hse/ptw -> Status ${createPtwRes.status}`);
      failed++;
    }

    // PATCH PTW status
    if (createdPtwId) {
      const patchPtwRes = await fetchUrl(`${apiBase}/ptw/${createdPtwId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          reviewerName: 'Ir. Danang Wicaksono, CSP (HSE Manager)',
          notes: 'Disetujui untuk uji regresi otomatis Phase 13',
        }),
      });
      const patchPtwData = JSON.parse(patchPtwRes.data);
      if (patchPtwRes.status === 200 && patchPtwData.ptw.status === 'APPROVED') {
        console.log(`[PASS] PATCH /hse/ptw/:id/status -> Status updated to APPROVED`);
        passed++;
      } else {
        console.error(`[FAIL] PATCH /hse/ptw/:id/status -> ${patchPtwRes.data}`);
        failed++;
      }
    }
  } catch (e) {
    console.error(`[FAIL] PTW API workflow -> ${e.message}`);
    failed++;
  }

  // 2c. Incidents & Near-Miss
  try {
    const incListRes = await fetchUrl(`${apiBase}/incidents`);
    const incList = JSON.parse(incListRes.data);
    if (incListRes.status === 200 && Array.isArray(incList)) {
      console.log(`[PASS] GET /hse/incidents -> Total incidents: ${incList.length}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /hse/incidents -> Status ${incListRes.status}`);
      failed++;
    }

    // POST Incident
    const createIncRes = await fetchUrl(`${apiBase}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Regression Test: Peringatan Near-Miss Kabel Genset Terinjak',
        incidentType: 'NEAR_MISS',
        severity: 'LOW',
        location: 'Zona Barat Lantai 1',
        reporterName: 'Budi Santoso',
        affectedPerson: 'Tim Scaffolding',
        description: 'Pekerja hampir tersandung kabel genset fleksibel di jalur pedestrian.',
        rootCause: 'Kabel tidak dimasukkan ke dalam cable bridge pelindung.',
        correctiveAction: 'Pemasangan cable protector ramp karet warna kuning-hitam reflektif.',
        daysLost: 0,
      }),
    });
    if (createIncRes.status === 201) {
      console.log(`[PASS] POST /hse/incidents -> Created Near-Miss report successfully`);
      passed++;
    } else {
      console.error(`[FAIL] POST /hse/incidents -> Status ${createIncRes.status}`);
      failed++;
    }
  } catch (e) {
    console.error(`[FAIL] Incidents API workflow -> ${e.message}`);
    failed++;
  }

  // 2d. TBM Session
  try {
    const tbmListRes = await fetchUrl(`${apiBase}/tbm`);
    const tbmList = JSON.parse(tbmListRes.data);
    if (tbmListRes.status === 200 && Array.isArray(tbmList)) {
      console.log(`[PASS] GET /hse/tbm -> Total TBM sessions: ${tbmList.length}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /hse/tbm -> Status ${tbmListRes.status}`);
      failed++;
    }

    // POST TBM
    const createTbmRes = await fetchUrl(`${apiBase}/tbm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Regression Test: Briefing K3 Penggunaan Kacamata Safety saat Gerinda',
        zoneLocation: 'Fabrikasi Baja Lantai Dasar',
        leadBy: 'Rahmat Hidayat (Mandor Struktur)',
        attendeeCount: 28,
        targetGroup: 'Tukang Las & Fitters',
        weatherCondition: 'Cerah',
        keySafetyNotes: 'Wajib gunakan safety goggles UV-cut dan sarung tangan tahan api.',
      }),
    });
    if (createTbmRes.status === 201) {
      console.log(`[PASS] POST /hse/tbm -> Recorded daily TBM briefing session`);
      passed++;
    } else {
      console.error(`[FAIL] POST /hse/tbm -> Status ${createTbmRes.status}`);
      failed++;
    }
  } catch (e) {
    console.error(`[FAIL] TBM API workflow -> ${e.message}`);
    failed++;
  }

  // 2e. Inspections & APD Audit
  try {
    const inspListRes = await fetchUrl(`${apiBase}/inspections`);
    const inspList = JSON.parse(inspListRes.data);
    if (inspListRes.status === 200 && Array.isArray(inspList)) {
      console.log(`[PASS] GET /hse/inspections -> Total audits: ${inspList.length}`);
      passed++;
    } else {
      console.error(`[FAIL] GET /hse/inspections -> Status ${inspListRes.status}`);
      failed++;
    }

    // POST Inspection
    const createInspRes = await fetchUrl(`${apiBase}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Regression Test: Audit Rutin APD Wajib Tower B Shift Pagi',
        inspectionType: 'APD_COMPLIANCE',
        severity: 'LOW',
        location: 'Tower B Lantai 8',
        inspectorName: 'Tri Handoko (HSE Inspector)',
        score: 96,
        helmetCompliant: true,
        vestCompliant: true,
        bootsCompliant: true,
        harnessCompliant: true,
        observations: 'Semua tukang dan mandor patuh menggunakan APD standar.',
        actionPlan: 'Pertahankan kedisiplinan APD harian.',
      }),
    });
    if (createInspRes.status === 201) {
      console.log(`[PASS] POST /hse/inspections -> Recorded APD compliance audit`);
      passed++;
    } else {
      console.error(`[FAIL] POST /hse/inspections -> Status ${createInspRes.status}`);
      failed++;
    }
  } catch (e) {
    console.error(`[FAIL] Inspections API workflow -> ${e.message}`);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegression();

