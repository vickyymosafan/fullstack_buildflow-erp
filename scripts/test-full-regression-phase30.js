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

  const API = 'http://localhost:4000/api/v1/precast-prestress';

  await check('GET overview', async () => {
    const res = await request(`${API}/overview`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.json.summary.totalSegments >= 3);
  });

  await check('GET segments', async () => {
    const res = await request(`${API}/segments`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 3);
  });

  const uniqueRfid = `RFID-TEST-${Date.now()}`;

  await check('POST segments/register', async () => {
    const res = await request(
      `${API}/segments/register`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        rfidTagCode: uniqueRfid,
        elementType: 'PCI-Girder L=40.8m Test Unit',
        castingYardLine: 'Plant Kariangau Line A',
        projectId: 'PRJ-IKN-TOL-3A',
        designFcMpa: 50,
        steamCuringTempC: 62.5,
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.rfidTagCode, uniqueRfid);
  });

  await check('POST segments/register duplicate RFID -> 400', async () => {
    const res = await request(
      `${API}/segments/register`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        rfidTagCode: uniqueRfid,
        elementType: 'Duplicate Unit',
        castingYardLine: 'Plant Kariangau Line A',
        projectId: 'PRJ-IKN-TOL-3A',
        designFcMpa: 50,
        steamCuringTempC: 60,
      }
    );
    assert.strictEqual(res.status, 400);
  });

  await check('POST segments/register steam curing temp > 75C DEF limit -> 400', async () => {
    const res = await request(
      `${API}/segments/register`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        rfidTagCode: `RFID-HOT-${Date.now()}`,
        elementType: 'Overheated Unit',
        castingYardLine: 'Plant Kariangau Line A',
        projectId: 'PRJ-IKN-TOL-3A',
        designFcMpa: 50,
        steamCuringTempC: 82.0,
      }
    );
    assert.strictEqual(res.status, 400);
  });

  await check('POST segments/advance-stage', async () => {
    const res = await request(
      `${API}/segments/advance-stage`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        segmentId: 'SEG-003',
        targetStage: 'STRESSED_YARD_READY',
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.stage, 'STRESSED_YARD_READY');
  });

  await check('GET cube-tests', async () => {
    const res = await request(`${API}/cube-tests`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 3);
  });

  await check('POST cube-tests/record', async () => {
    const res = await request(
      `${API}/cube-tests/record`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        specimenCode: `LAB-TEST-${Date.now()}`,
        segmentId: 'SEG-001',
        batchDocketNo: 'BATCH-TEST-01',
        curingAgeDays: 28,
        targetFcMpa: 50,
        crushingLoadKn: 960,
        measuredFcMpa: 54.3,
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.sniComplianceStatus, 'PASSED_SNI_1974');
  });

  await check('GET stressing-records', async () => {
    const res = await request(`${API}/stressing-records`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 3);
  });

  await check('POST stressing-records/record within ±7% SNI tolerance', async () => {
    const res = await request(
      `${API}/stressing-records/record`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        segmentId: 'SEG-002',
        tendonCode: 'TENDON-CABLE-T2 (19 Strands Grade 270)',
        jackingForceKn: 3700,
        gaugePressureBar: 428,
        theoreticalElongationMm: 270.0,
        measuredElongationMm: 274.5,
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.toleranceStatus, 'WITHIN_SNI_7PCT_TOLERANCE');
  });

  await check('POST stressing-records/record > ±7% triggers ELONGATION_ANOMALY_HOLD', async () => {
    const res = await request(
      `${API}/stressing-records/record`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        segmentId: 'SEG-003',
        tendonCode: 'TENDON-CABLE-T5 (Anomaly Test)',
        jackingForceKn: 3700,
        gaugePressureBar: 428,
        theoreticalElongationMm: 270.0,
        measuredElongationMm: 298.0,
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.toleranceStatus, 'ELONGATION_ANOMALY_HOLD');
  });

  await check('GET erection-logs', async () => {
    const res = await request(`${API}/erection-logs`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json) && res.json.length >= 2);
  });

  await check('POST erection-logs/certify', async () => {
    const res = await request(
      `${API}/erection-logs/certify`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        erectionId: 'ERC-002',
        inspectorName: 'Ir. Hendra Wijaya, MT',
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.status, 'CERTIFIED_ON_BEARING');
  });

  await check('POST erection-logs/certify unknown -> 404', async () => {
    const res = await request(
      `${API}/erection-logs/certify`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      {
        erectionId: 'ERC-UNKNOWN-999',
        inspectorName: 'Ir. Hendra Wijaya, MT',
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
    '/precast-prestress',
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

  await check('WEB /precast-prestress content', async () => {
    const res = await request('http://localhost:3000/precast-prestress');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Precast Concrete Yard'));
    assert.ok(res.text.includes('Segmen Precast RFID'));
  });

  console.log(`\n${passed}/${total} passed`);
}

run();
