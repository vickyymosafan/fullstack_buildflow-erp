/**
 * Full Regression Test Suite for Phase 25:
 * BIM 4D/5D WebGL Viewer & Digital Twin Construction Integration
 * Tests all 28 Next.js frontend routes and all 12 NestJS backend endpoints
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
  '/bim', // Phase 25
  '/hr',
  '/analytics',
  '/settings',
];

async function runRegression() {
  console.log('====================================================');
  console.log('   BUILDFLOW ERP - PHASE 25 FULL REGRESSION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  // 1. Frontend Route Checks (28 Routes)
  console.log('--- 1. Testing 28 Frontend Dashboard Routes ---');
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

  // 2. Backend BIM Endpoints Checks (12 Endpoints)
  console.log('\n--- 2. Testing 12 Backend BIM Endpoints ---');

  // Test 1: GET /bim/summary
  try {
    const res = await fetch(`${BACKEND_BASE}/bim/summary`);
    const data = await res.json();
    if (res.status === 200 && data.totalModels >= 5) {
      console.log(`[PASS] GET /bim/summary - ${data.totalModels} BIM Models, ${data.totalElements} Elements, ${data.activeClashes} Active Clashes`);
      passed++;
      results.push({ test: 'GET /bim/summary', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /bim/summary status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /bim/summary', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /bim/summary: ${err.message}`);
    failed++;
  }

  // Test 2: GET /bim/models
  try {
    const res = await fetch(`${BACKEND_BASE}/bim/models`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 5) {
      console.log(`[PASS] GET /bim/models - ${data.length} Federated BIM Models`);
      passed++;
      results.push({ test: 'GET /bim/models', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /bim/models status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /bim/models', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /bim/models: ${err.message}`);
    failed++;
  }

  // Test 3: POST /bim/models
  try {
    const payload = {
      projectId: 'PRJ-MRT-2026',
      projectName: 'MRT Jakarta Fase 2A CP202 (Harmoni - Mangga Besar)',
      modelName: 'Model Arsitektur Facade Canopy Regression Test',
      discipline: 'ARCHITECTURE',
      fileFormat: 'IFC4',
      lodLevel: 'LOD 400',
      fileSize: '42.5 MB',
      authorName: 'Automated Regression Suite'
    };
    const res = await fetch(`${BACKEND_BASE}/bim/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.model?.id || data.id)) {
      const modelId = data.model?.id || data.id;
      console.log(`[PASS] POST /bim/models - Uploaded model ID: ${modelId}`);
      passed++;
      results.push({ test: 'POST /bim/models', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /bim/models status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /bim/models', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /bim/models: ${err.message}`);
    failed++;
  }

  // Test 4: GET /bim/models/:id/elements
  try {
    const res = await fetch(`${BACKEND_BASE}/bim/models/MOD-001/elements`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 1) {
      console.log(`[PASS] GET /bim/models/:id/elements - ${data.length} Elements retrieved for MOD-001`);
      passed++;
      results.push({ test: 'GET /bim/models/:id/elements', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /bim/models/:id/elements status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /bim/models/:id/elements', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /bim/models/:id/elements: ${err.message}`);
    failed++;
  }

  // Test 5: GET /bim/4d-schedule
  try {
    const res = await fetch(`${BACKEND_BASE}/bim/4d-schedule`);
    const data = await res.json();
    if (res.status === 200 && data.elements && Array.isArray(data.elements) && data.elements.length >= 5) {
      console.log(`[PASS] GET /bim/4d-schedule - ${data.elements.length} 4D Schedule tasks over ${data.timelineWeeks} weeks`);
      passed++;
      results.push({ test: 'GET /bim/4d-schedule', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /bim/4d-schedule status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /bim/4d-schedule', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /bim/4d-schedule: ${err.message}`);
    failed++;
  }

  // Test 6: PATCH /bim/4d-schedule/link
  try {
    const payload = {
      elementId: 'ELE-DW-001',
      wbsCode: 'WBS-1.1.1-REV',
      activityName: 'Pekerjaan D-Wall Baris 1 Revisi',
      plannedStartDate: '2026-02-01',
      plannedEndDate: '2026-02-25',
      status: 'COMPLETED'
    };
    const res = await fetch(`${BACKEND_BASE}/bim/4d-schedule/link`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 200 && data.element?.wbsCode === 'WBS-1.1.1-REV') {
      console.log(`[PASS] PATCH /bim/4d-schedule/link - Linked element ${payload.elementId} to ${payload.wbsCode}`);
      passed++;
      results.push({ test: 'PATCH /bim/4d-schedule/link', status: 'PASS' });
    } else {
      console.error(`[FAIL] PATCH /bim/4d-schedule/link status: ${res.status}`);
      failed++;
      results.push({ test: 'PATCH /bim/4d-schedule/link', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] PATCH /bim/4d-schedule/link: ${err.message}`);
    failed++;
  }

  // Test 7: GET /bim/5d-cost
  try {
    const res = await fetch(`${BACKEND_BASE}/bim/5d-cost`);
    const data = await res.json();
    if (res.status === 200 && data.elements && Array.isArray(data.elements) && data.totalBudget > 0) {
      console.log(`[PASS] GET /bim/5d-cost - ${data.elements.length} 5D Cost elements, Budget: Rp ${(data.totalBudget / 1000000000).toFixed(2)} M`);
      passed++;
      results.push({ test: 'GET /bim/5d-cost', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /bim/5d-cost status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /bim/5d-cost', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /bim/5d-cost: ${err.message}`);
    failed++;
  }

  // Test 8: PATCH /bim/5d-cost/map
  try {
    const payload = {
      elementId: 'ELE-DW-001',
      boqItemCode: 'BOQ-STR-001-REV',
      designQuantity: 4800,
      unitRate: 2300000,
      uom: 'm3',
      actualQuantity: 4800,
      actualUnitRate: 2200000
    };
    const res = await fetch(`${BACKEND_BASE}/bim/5d-cost/map`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 200 && data.element?.budgetCost) {
      console.log(`[PASS] PATCH /bim/5d-cost/map - Total Budget: Rp ${(data.element.budgetCost / 1000000000).toFixed(2)} M`);
      passed++;
      results.push({ test: 'PATCH /bim/5d-cost/map', status: 'PASS' });
    } else {
      console.error(`[FAIL] PATCH /bim/5d-cost/map status: ${res.status}`);
      failed++;
      results.push({ test: 'PATCH /bim/5d-cost/map', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] PATCH /bim/5d-cost/map: ${err.message}`);
    failed++;
  }

  // Test 9: GET /bim/bcf/topics
  try {
    const res = await fetch(`${BACKEND_BASE}/bim/bcf/topics`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length >= 3) {
      console.log(`[PASS] GET /bim/bcf/topics - ${data.length} BCF Topics`);
      passed++;
      results.push({ test: 'GET /bim/bcf/topics', status: 'PASS' });
    } else {
      console.error(`[FAIL] GET /bim/bcf/topics status: ${res.status}`);
      failed++;
      results.push({ test: 'GET /bim/bcf/topics', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] GET /bim/bcf/topics: ${err.message}`);
    failed++;
  }

  // Test 10: POST /bim/bcf/topics
  try {
    const payload = {
      projectId: 'PRJ-MRT-2026',
      title: 'Benturan Pipa Sprinkler dengan Kolom K1-14',
      topicType: 'CLASH',
      priority: 'HIGH',
      assignedTo: 'MEP Coordinator',
      createdByName: 'BIM Coordinator Field Lead',
      description: 'Pipa pemadam kebakaran menembus selimut beton kolom utama',
      viewpointCameraX: 18.4,
      viewpointCameraY: 42.1,
      viewpointCameraZ: 7.2
    };
    const res = await fetch(`${BACKEND_BASE}/bim/bcf/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.topic?.id || data.id)) {
      const topicId = data.topic?.id || data.id;
      console.log(`[PASS] POST /bim/bcf/topics - Created Topic ID: ${topicId}`);
      passed++;
      results.push({ test: 'POST /bim/bcf/topics', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /bim/bcf/topics status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /bim/bcf/topics', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /bim/bcf/topics: ${err.message}`);
    failed++;
  }

  // Test 11: PATCH /bim/bcf/topics/:id/status
  try {
    const payload = { status: 'RESOLVED', resolutionNotes: 'Rerouted piping via core sleeve shaft' };
    const res = await fetch(`${BACKEND_BASE}/bim/bcf/topics/BCF-001/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 200 && data.topic?.status === 'RESOLVED') {
      console.log(`[PASS] PATCH /bim/bcf/topics/:id/status - Topic status updated to RESOLVED`);
      passed++;
      results.push({ test: 'PATCH /bim/bcf/topics/:id/status', status: 'PASS' });
    } else {
      console.error(`[FAIL] PATCH /bim/bcf/topics/:id/status status: ${res.status}`);
      failed++;
      results.push({ test: 'PATCH /bim/bcf/topics/:id/status', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] PATCH /bim/bcf/topics/:id/status: ${err.message}`);
    failed++;
  }

  // Test 12: POST /bim/clash/run
  try {
    const payload = {
      projectId: 'PRJ-MRT-2026',
      clashType: 'HARD_CLASH',
      toleranceMm: 15
    };
    const res = await fetch(`${BACKEND_BASE}/bim/clash/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.clash?.id || data.id)) {
      const clashId = data.clash?.id || data.id;
      console.log(`[PASS] POST /bim/clash/run - Detected clash ID: ${clashId} with tolerance ${payload.toleranceMm}mm`);
      passed++;
      results.push({ test: 'POST /bim/clash/run', status: 'PASS' });
    } else {
      console.error(`[FAIL] POST /bim/clash/run status: ${res.status}`);
      failed++;
      results.push({ test: 'POST /bim/clash/run', status: 'FAIL' });
    }
  } catch (err) {
    console.error(`[ERROR] POST /bim/clash/run: ${err.message}`);
    failed++;
  }

  // Summary
  console.log('\n====================================================');
  console.log(`TOTAL PASS: ${passed} / 40`);
  console.log(`TOTAL FAIL: ${failed} / 40`);
  console.log(`PASS RATE:  ${((passed / 40) * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRegression();
