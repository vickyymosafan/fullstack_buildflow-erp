const http = require('http');
const assert = require('assert');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {}
          resolve({ status: res.statusCode, text: data, json });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function run() {
  let passed = 0;
  let total = 0;

  async function check(name, fn) {
    total++;
    try {
      await fn();
      console.log(`PASS ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL ${name}:`, err.message);
      process.exitCode = 1;
    }
  }

  const API = 'http://localhost:4000/api/v1/photogrammetry';

  await check('GET overview', async () => {
    const res = await request(`${API}/overview`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.json.summary.totalMissions >= 3);
  });

  await check('GET missions', async () => {
    const res = await request(`${API}/missions`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 3);
  });

  const uniqueMissionCode = `MSN-TEST-${Date.now()}`;

  await check('POST missions/register', async () => {
    const res = await request(
      `${API}/missions/register`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        missionCode: uniqueMissionCode,
        projectId: 'PRJ-IKN-TOL-3A',
        projectName: 'Tol IKN Seksi 3A (Test Segment)',
        uavModel: 'DJI Matrice 350 RTK + Zenmuse L2 LiDAR',
        pilotName: 'Capt. Raka Pratama',
        altitudeAglMeters: 95,
        overlapPct: 80,
        gsdCmPerPx: 1.35,
        gcpCount: 12,
        notamPermitRef: 'AIRNAV-TEST-2026',
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.missionCode, uniqueMissionCode);
  });

  await check('POST missions/register duplicate -> 400', async () => {
    const res = await request(
      `${API}/missions/register`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        missionCode: uniqueMissionCode,
        projectId: 'PRJ-IKN-TOL-3A',
        projectName: 'Duplicate Test',
        uavModel: 'DJI M350',
        pilotName: 'Capt. Raka',
        altitudeAglMeters: 95,
        overlapPct: 80,
        gsdCmPerPx: 1.35,
        gcpCount: 12,
      }
    );
    assert.strictEqual(res.status, 400);
  });

  await check('POST missions/register altitude > 120m without NOTAM -> 400', async () => {
    const res = await request(
      `${API}/missions/register`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        missionCode: `MSN-HIGH-${Date.now()}`,
        projectId: 'PRJ-IKN-TOL-3A',
        projectName: 'High Altitude Test',
        uavModel: 'DJI M350',
        pilotName: 'Capt. Raka',
        altitudeAglMeters: 145,
        overlapPct: 80,
        gsdCmPerPx: 1.5,
        gcpCount: 10,
        notamPermitRef: '',
      }
    );
    assert.strictEqual(res.status, 400);
  });

  await check('POST missions/complete-processing', async () => {
    const res = await request(
      `${API}/missions/complete-processing`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        missionId: 'MSN-003',
        densePointsCount: 55200000,
        rmseAccuracyCm: 1.48,
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.mission.status, 'COMPLETED_ORTHO_LIDAR');
    assert.strictEqual(res.json.pointCloud.opnameReady, true);
  });

  await check('POST missions/complete-processing unknown -> 404', async () => {
    const res = await request(
      `${API}/missions/complete-processing`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        missionId: 'MSN-UNKNOWN-999',
        densePointsCount: 50000000,
        rmseAccuracyCm: 1.5,
      }
    );
    assert.strictEqual(res.status, 404);
  });

  await check('GET point-clouds', async () => {
    const res = await request(`${API}/point-clouds`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 4);
  });

  await check('GET earthwork-volumes', async () => {
    const res = await request(`${API}/earthwork-volumes`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 3);
  });

  await check('POST earthwork-volumes/calculate', async () => {
    const res = await request(
      `${API}/earthwork-volumes/calculate`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        corridorSegment: 'STA 14+000 - STA 15+000 (Cut & Fill Test)',
        projectId: 'PRJ-IKN-TOL-3A',
        missionId: 'MSN-001',
        boqTargetCutM3: 50000,
        measuredCutM3: 48000,
        boqTargetFillM3: 40000,
        measuredFillM3: 39000,
        compactionFactor: 1.12,
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.cutProgressPct, 96);
    assert.strictEqual(res.json.opnameVerificationStatus, 'CERTIFIED_FOR_MC');
  });

  await check('POST earthwork-volumes/calculate invalid BOQ <= 0 -> 400', async () => {
    const res = await request(
      `${API}/earthwork-volumes/calculate`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        corridorSegment: 'Invalid Segment',
        projectId: 'PRJ-IKN-TOL-3A',
        missionId: 'MSN-001',
        boqTargetCutM3: 0,
        measuredCutM3: 1000,
        boqTargetFillM3: 40000,
        measuredFillM3: 20000,
        compactionFactor: 1.1,
      }
    );
    assert.strictEqual(res.status, 400);
  });

  await check('GET ai-inspections', async () => {
    const res = await request(`${API}/ai-inspections`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 3);
  });

  await check('POST ai-inspections/analyze triggers CRITICAL_SNI_BREACH when crack > 0.3mm', async () => {
    const res = await request(
      `${API}/ai-inspections/analyze`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        structureElement: 'Pier P-18 Jembatan Pulau Balang',
        projectId: 'PRJ-IKN-TOL-3A',
        missionId: 'MSN-002',
        defectType: 'STRUCTURAL_CRACK',
        crackWidthMm: 0.45,
        defectExtentMeters: 1.9,
        aiConfidencePct: 97.4,
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.sniSeverityGrade, 'CRITICAL_SNI_BREACH');
    assert.strictEqual(res.json.status, 'OPEN_NCR_RAISED');
  });

  await check('POST ai-inspections/resolve-defect', async () => {
    const res = await request(
      `${API}/ai-inspections/resolve-defect`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        defectId: 'CV-DEF-001',
        inspectorName: 'Ir. Hendra Wijaya, MT',
        remediationNotes: 'Injeksi Epoxy Sikadur-52 ID selesai.',
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.status, 'REMEDIATED_VERIFIED');
  });

  await check('POST ai-inspections/resolve-defect unknown -> 404', async () => {
    const res = await request(
      `${API}/ai-inspections/resolve-defect`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        defectId: 'CV-DEF-UNKNOWN-999',
        inspectorName: 'Ir. Hendra Wijaya, MT',
        remediationNotes: 'Test',
      }
    );
    assert.strictEqual(res.status, 404);
  });

  const webRoutes = [
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
    '/iot-gateway',
    '/photogrammetry',
    '/change-orders',
    '/official-reports',
    '/joint-operations',
    '/handover',
    '/closeout',
    '/documents',
    '/bim',
    '/contracts',
    '/procurement',
    '/vendor-portal',
    '/inventory',
    '/finance',
    '/treasury',
    '/hr',
    '/analytics',
    '/disaster-recovery',
  ];

  for (const r of webRoutes) {
    await check(`WEB ${r}`, async () => {
      const res = await request(`http://localhost:3000${r}`);
      assert.strictEqual(res.status, 200);
    });
  }

  await check('WEB /photogrammetry content', async () => {
    const res = await request('http://localhost:3000/photogrammetry');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Drone UAV Photogrammetry'));
    assert.ok(res.text.includes('Misi Terbang RTK/PPK'));
  });

  console.log(`\n${passed}/${total} passed`);
}

run();
