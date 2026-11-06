/**
 * BUILDFLOW ERP - Full Regression Test Suite for Phase 21
 * Tests all 24 Frontend Dashboard Routes + Backend Executive Board BI API Endpoints
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
  console.log('=== BUILDFLOW ERP PHASE 21 FULL REGRESSION TEST ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Frontend Routes
  console.log('--- 1. Testing All 24 Frontend Dashboard Routes (Port 3000) ---');
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

  // 2. Backend Executive Board BI API
  console.log('\n--- 2. Testing Backend Executive Board BI API (Port 4000) ---');
  let createdDirectiveId = null;

  try {
    // 2.1 GET /api/v1/executive-bi/summary
    const resSummary = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/executive-bi/summary',
      method: 'GET',
    });
    if (resSummary.statusCode === 200) {
      const body = JSON.parse(resSummary.body);
      if (body.enterpriseBacklog > 0 && body.forecastedGrossMargin > 0 && body.cashflowRunwayMonths > 0) {
        console.log(`[PASS] Backend API: GET /api/v1/executive-bi/summary (Backlog: Rp ${body.enterpriseBacklog.toLocaleString('id-ID')}, Margin: ${body.forecastedGrossMargin}%, Runway: ${body.cashflowRunwayMonths} bln)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/summary -> Invalid payload attributes`, body);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/summary -> Status ${resSummary.statusCode}`);
      failed++;
    }

    // 2.2 GET /api/v1/executive-bi/forecasts
    const resForecasts = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/executive-bi/forecasts',
      method: 'GET',
    });
    if (resForecasts.statusCode === 200) {
      const forecasts = JSON.parse(resForecasts.body);
      if (Array.isArray(forecasts) && forecasts.length >= 5 && forecasts[0].cpi !== undefined && forecasts[0].eac !== undefined) {
        console.log(`[PASS] Backend API: GET /api/v1/executive-bi/forecasts (${forecasts.length} Multi-Project EVM forecasts verified)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/forecasts -> Expected array >= 5 projects`, forecasts);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/forecasts -> Status ${resForecasts.statusCode}`);
      failed++;
    }

    // 2.3 GET /api/v1/executive-bi/cashflow-runway
    const resCashflow = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/executive-bi/cashflow-runway',
      method: 'GET',
    });
    if (resCashflow.statusCode === 200) {
      const cashflow = JSON.parse(resCashflow.body);
      if (Array.isArray(cashflow.monthlyProjections) && cashflow.monthlyProjections.length === 6 && cashflow.runwayMonths > 0) {
        console.log(`[PASS] Backend API: GET /api/v1/executive-bi/cashflow-runway (6 months forecast: ${cashflow.monthlyProjections.map(m => m.month).join(', ')}, Runway: ${cashflow.runwayMonths} bln)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/cashflow-runway -> Invalid structure`, cashflow);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/cashflow-runway -> Status ${resCashflow.statusCode}`);
      failed++;
    }

    // 2.4 POST /api/v1/executive-bi/simulate
    const simulatePayload = {
      scenarioName: "Simulasi Tekanan Inflasi & Deviasi Patimban",
      paymentDelayDays: 30,
      materialInflationPercent: 4.5,
      crashScheduleMonths: 1.0,
      description: "Simulasi skenario kenaikan harga baja/beton 4.5% dan percepatan jadwal tol"
    };
    const resSimulate = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/executive-bi/simulate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, simulatePayload);
    if (resSimulate.statusCode === 200 || resSimulate.statusCode === 201) {
      const sim = JSON.parse(resSimulate.body);
      if (sim.simulatedMetrics && sim.simulatedMetrics.simulatedMargin !== null && sim.simulatedMetrics.simulatedRunwayMonths !== null) {
        console.log(`[PASS] Backend API: POST /api/v1/executive-bi/simulate (Baseline: ${sim.simulatedMetrics.originalMargin}% -> Sim: ${sim.simulatedMetrics.simulatedMargin}%, Runway: ${sim.simulatedMetrics.simulatedRunwayMonths} bln, Status: ${sim.simulatedMetrics.riskStatus})`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: POST /api/v1/executive-bi/simulate -> Incomplete simulation response`, sim);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: POST /api/v1/executive-bi/simulate -> Status ${resSimulate.statusCode}: ${resSimulate.body}`);
      failed++;
    }

    // 2.5 GET /api/v1/executive-bi/directives
    const resDirectives = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/executive-bi/directives',
      method: 'GET',
    });
    if (resDirectives.statusCode === 200) {
      const directives = JSON.parse(resDirectives.body);
      if (Array.isArray(directives) && directives.length >= 1) {
        console.log(`[PASS] Backend API: GET /api/v1/executive-bi/directives (${directives.length} active strategic directives)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/directives -> Expected non-empty array`, directives);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: GET /api/v1/executive-bi/directives -> Status ${resDirectives.statusCode}`);
      failed++;
    }

    // 2.6 POST /api/v1/executive-bi/directives
    const newDirective = {
      projectId: "proj-003",
      issueCategory: "SCHEDULE_SLIP",
      directive: "Direktur Operasional I menginstruksikan percepatan crash-schedule 2 shift dan pengadaan tanah frontage tol Patimban.",
      assignedDirector: "Ir. Ahmad Zulkarnaen (Direktur Operasional I)",
      deadline: "2026-11-30T17:00:00.000Z",
      notes: "Eskalasi prioritas tinggi dengan Satgas BPN & Balai Besar Pelaksanaan Jalan Nasional."
    };
    const resCreateDirective = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/executive-bi/directives',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, newDirective);
    if (resCreateDirective.statusCode === 201 || resCreateDirective.statusCode === 200) {
      const created = JSON.parse(resCreateDirective.body);
      if (created.id && created.directive === newDirective.directive && (created.status === 'PENDING' || created.status === 'ISSUED')) {
        createdDirectiveId = created.id;
        console.log(`[PASS] Backend API: POST /api/v1/executive-bi/directives (Created: [${created.id}] ${created.projectName} - ${created.directive.substring(0, 40)}...)`);
        passed++;
      } else {
        console.error(`[FAIL] Backend API: POST /api/v1/executive-bi/directives -> Invalid creation payload`, created);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: POST /api/v1/executive-bi/directives -> Status ${resCreateDirective.statusCode}: ${resCreateDirective.body}`);
      failed++;
    }

    // 2.7 PATCH /api/v1/executive-bi/directives/:id/resolve
    if (createdDirectiveId) {
      const resResolve = await request({
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: `/api/v1/executive-bi/directives/${createdDirectiveId}/resolve`,
        method: 'PATCH',
      });
      if (resResolve.statusCode === 200) {
        const resolved = JSON.parse(resResolve.body);
        if (resolved.status === 'RESOLVED') {
          console.log(`[PASS] Backend API: PATCH /api/v1/executive-bi/directives/${createdDirectiveId}/resolve (Status: RESOLVED)`);
          passed++;
        } else {
          console.error(`[FAIL] Backend API: PATCH /api/v1/executive-bi/directives/:id/resolve -> Unexpected status`, resolved);
          failed++;
        }
      } else {
        console.error(`[FAIL] Backend API: PATCH /api/v1/executive-bi/directives/:id/resolve -> Status ${resResolve.statusCode}`);
        failed++;
      }
    } else {
      console.error(`[FAIL] Backend API: PATCH /api/v1/executive-bi/directives/:id/resolve -> Skipped because create failed`);
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
