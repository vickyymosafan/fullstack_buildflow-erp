/**
 * BUILDFLOW ERP - Full Regression Test Suite for Phase 22
 * Tests all 25 Frontend Dashboard Routes + Backend Sustainability & ESG API Endpoints
 */

const http = require('http');

const FRONTEND_HOST = 'localhost';
const FRONTEND_PORT = 3000;
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 4000;

const FRONTEND_ROUTES = [
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
  '/closeout',
  '/executive-bi',
  '/sustainability',
];

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runRegressionSuite() {
  console.log('=== BUILDFLOW ERP PHASE 22 FULL REGRESSION TEST ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Frontend Routes
  console.log('--- 1. Testing All 25 Frontend Dashboard Routes (Port 3000) ---');
  for (const route of FRONTEND_ROUTES) {
    try {
      const res = await request({
        hostname: FRONTEND_HOST,
        port: FRONTEND_PORT,
        path: route,
        method: 'GET',
      });

      if (res.statusCode === 200) {
        console.log(`[PASS] Frontend Route: ${route}`);
        passed++;
      } else {
        console.error(`[FAIL] Frontend Route: ${route} -> Status ${res.statusCode}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] Frontend Route: ${route} -> Error: ${err.message}`);
      failed++;
    }
  }

  // 2. Backend Sustainability & ESG API
  console.log('\n--- 2. Testing Backend Sustainability & ESG API (Port 4000) ---');
  let createdInitiativeId = null;

  try {
    // 2.1 GET /api/v1/sustainability/summary
    const resSummary = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/sustainability/summary',
      method: 'GET',
    });
    if (resSummary.statusCode === 200) {
      const body = JSON.parse(resSummary.body);
      if (
        body.totalCarbonFootprintTons > 0 &&
        body.wasteMetrics.wasteDiversionRatePct > 0 &&
        body.bghMetrics.averageBghScore > 0
      ) {
        console.log(
          `[PASS] Backend API: GET /api/v1/sustainability/summary (Carbon: ${body.totalCarbonFootprintTons} Ton CO2e, Diversion: ${body.wasteMetrics.wasteDiversionRatePct}%, BGH Score: ${body.bghMetrics.averageBghScore} - ${body.bghMetrics.portfolioTier})`,
        );
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/sustainability/summary -> Invalid payload attributes`, body);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/sustainability/summary -> Status ${resSummary.statusCode}`);
      failed++;
    }

    // 2.2 GET /api/v1/sustainability/emissions
    const resEmissions = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/sustainability/emissions',
      method: 'GET',
    });
    if (resEmissions.statusCode === 200) {
      const list = JSON.parse(resEmissions.body);
      if (Array.isArray(list) && list.length >= 5 && list[0].calculatedEmissionTonsCO2e !== undefined) {
        console.log(`[PASS] Backend API: GET /api/v1/sustainability/emissions (${list.length} emission logs verified)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/sustainability/emissions -> Expected array >= 5 entries`, list);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/sustainability/emissions -> Status ${resEmissions.statusCode}`);
      failed++;
    }

    // 2.3 POST /api/v1/sustainability/emissions
    const newEmission = {
      projectId: 'proj-002',
      scope: 'SCOPE_1_DIRECT',
      sourceCategory: 'HEAVY_EQUIPMENT_FUEL',
      activityQuantity: 2500,
      activityUnit: 'LITER',
      recordedDate: '2026-11-06T12:00:00.000Z',
      notes: 'Pengisian solar genset cadangan batching plant IKN',
    };
    const resCreateEmission = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: '/api/v1/sustainability/emissions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newEmission,
    );
    if (resCreateEmission.statusCode === 201 || resCreateEmission.statusCode === 200) {
      const created = JSON.parse(resCreateEmission.body);
      if (created.id && created.calculatedEmissionTonsCO2e === 6.7) {
        console.log(
          `[PASS] Backend API: POST /api/v1/sustainability/emissions (Created: [${created.id}] ${created.calculatedEmissionTonsCO2e} Ton CO2e)`,
        );
        passed++;
      } else {
        console.error(`[FAIL] Backend API: POST /api/v1/sustainability/emissions -> Expected calculated 6.7 Ton CO2e`, created);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: POST /api/v1/sustainability/emissions -> Status ${resCreateEmission.statusCode}: ${resCreateEmission.body}`);
      failed++;
    }

    // 2.4 GET /api/v1/sustainability/waste
    const resWaste = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/sustainability/waste',
      method: 'GET',
    });
    if (resWaste.statusCode === 200) {
      const wasteList = JSON.parse(resWaste.body);
      if (Array.isArray(wasteList) && wasteList.length >= 5 && wasteList[0].quantityTons !== undefined) {
        console.log(`[PASS] Backend API: GET /api/v1/sustainability/waste (${wasteList.length} CDW waste records verified)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/sustainability/waste -> Expected array >= 5 entries`, wasteList);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/sustainability/waste -> Status ${resWaste.statusCode}`);
      failed++;
    }

    // 2.5 POST /api/v1/sustainability/waste
    const newWaste = {
      projectId: 'proj-001',
      wasteType: 'SCRAP_METAL',
      quantityTons: 15.5,
      handlingMethod: 'RECYCLED_ONSITE',
      recordedDate: '2026-11-06T12:00:00.000Z',
      notes: 'Besi bekisting dipotong ulang untuk pengaku rangka',
    };
    const resCreateWaste = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: '/api/v1/sustainability/waste',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newWaste,
    );
    if (resCreateWaste.statusCode === 201 || resCreateWaste.statusCode === 200) {
      const createdWaste = JSON.parse(resCreateWaste.body);
      if (createdWaste.id && createdWaste.isDivertedFromLandfill === true && createdWaste.quantityTons === 15.5) {
        console.log(
          `[PASS] Backend API: POST /api/v1/sustainability/waste (Created: [${createdWaste.id}] ${createdWaste.quantityTons} Ton Diverted)`,
        );
        passed++;
      } else {
        console.error(`[FAIL] Backend API: POST /api/v1/sustainability/waste -> Invalid waste creation payload`, createdWaste);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: POST /api/v1/sustainability/waste -> Status ${resCreateWaste.statusCode}: ${resCreateWaste.body}`);
      failed++;
    }

    // 2.6 GET /api/v1/sustainability/bgh-ratings
    const resBgh = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/sustainability/bgh-ratings',
      method: 'GET',
    });
    if (resBgh.statusCode === 200) {
      const bghList = JSON.parse(resBgh.body);
      if (Array.isArray(bghList) && bghList.length >= 4 && bghList[0].totalScore !== undefined) {
        console.log(`[PASS] Backend API: GET /api/v1/sustainability/bgh-ratings (${bghList.length} BGH audited projects verified)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/sustainability/bgh-ratings -> Expected array >= 4 projects`, bghList);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/sustainability/bgh-ratings -> Status ${resBgh.statusCode}`);
      failed++;
    }

    // 2.7 GET /api/v1/sustainability/initiatives
    const resInit = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/sustainability/initiatives',
      method: 'GET',
    });
    if (resInit.statusCode === 200) {
      const initList = JSON.parse(resInit.body);
      if (Array.isArray(initList) && initList.length >= 3) {
        console.log(`[PASS] Backend API: GET /api/v1/sustainability/initiatives (${initList.length} active initiatives)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/sustainability/initiatives -> Expected array >= 3 initiatives`, initList);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/sustainability/initiatives -> Status ${resInit.statusCode}`);
      failed++;
    }

    // 2.8 POST /api/v1/sustainability/initiatives
    const newInitiative = {
      projectId: 'proj-003',
      initiativeName: 'Pemasangan Solar Cell Lampu PJU Trase Tol Patimban',
      category: 'RENEWABLE_ENERGY',
      targetReductionTonsCO2e: 45.0,
      estimatedInvestment: 350000000,
      targetCompletionDate: '2027-02-28',
      responsibleLead: 'Ir. Budi Santoso (Site Electrical Lead)',
      description: 'Penerangan jalan umum tenaga surya mandiri bebas emisi grid',
    };
    const resCreateInit = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: '/api/v1/sustainability/initiatives',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newInitiative,
    );
    if (resCreateInit.statusCode === 201 || resCreateInit.statusCode === 200) {
      const createdInit = JSON.parse(resCreateInit.body);
      if (createdInit.id && createdInit.initiativeName === newInitiative.initiativeName && createdInit.status === 'PROPOSED') {
        createdInitiativeId = createdInit.id;
        console.log(`[PASS] Backend API: POST /api/v1/sustainability/initiatives (Created: [${createdInit.id}] ${createdInit.initiativeName})`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: POST /api/v1/sustainability/initiatives -> Invalid initiative creation`, createdInit);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: POST /api/v1/sustainability/initiatives -> Status ${resCreateInit.statusCode}: ${resCreateInit.body}`);
      failed++;
    }

    // 2.9 PATCH /api/v1/sustainability/initiatives/:id/approve
    if (createdInitiativeId) {
      const resApprove = await request({
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: `/api/v1/sustainability/initiatives/${createdInitiativeId}/approve`,
        method: 'PATCH',
      });
      if (resApprove.statusCode === 200) {
        const approved = JSON.parse(resApprove.body);
        if (approved.status === 'APPROVED') {
          console.log(`[PASS] Backend API: PATCH /api/v1/sustainability/initiatives/${createdInitiativeId}/approve (Status: APPROVED)`);
          passed++;
        } else {
          console.error(`[FAIL] Backend API: PATCH /api/v1/sustainability/initiatives/:id/approve -> Unexpected status`, approved);
          failed++;
        }
      } else {
        console.error(`[FAIL] Backend API: PATCH /api/v1/sustainability/initiatives/:id/approve -> Status ${resApprove.statusCode}`);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: PATCH /api/v1/sustainability/initiatives/:id/approve -> Skipped because creation failed`);
      failed++;
    }
  } catch (err) {
    console.error(`[FAIL] Backend API Execution Error: ${err.message}`);
    failed++;
  }

  // Summary
  console.log('\n==================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRegressionSuite();
