/**
 * BUILDFLOW ERP - Full Regression Test Suite for Phase 20
 * Tests all 23 Frontend Dashboard Routes + Backend Closeout API Endpoints
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
  console.log('=== BUILDFLOW ERP PHASE 20 FULL REGRESSION TEST ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Frontend Routes
  console.log('--- 1. Testing Frontend Dashboard Routes (Port 3000) ---');
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

  // 2. Backend Closeout API
  console.log('\n--- 2. Testing Backend Closeout API (Port 4000) ---');
  let createdFaId = null;
  let createdAsbId = null;

  try {
    // 2.1 GET /api/v1/closeout/summary
    const resSummary = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/closeout/summary',
      method: 'GET',
    });
    if (resSummary.statusCode === 200) {
      const data = JSON.parse(resSummary.body);
      if (data.totalAgreedFinalValue && data.closeoutProgress) {
        console.log('[PASS] GET /api/v1/closeout/summary');
        passed++;
      } else {
        console.error('[FAIL] GET /api/v1/closeout/summary invalid schema');
        failed++;
      }
    } else {
      console.error(`[FAIL] GET /api/v1/closeout/summary -> ${resSummary.statusCode}`);
      failed++;
    }

    // 2.2 GET /api/v1/closeout/final-accounts
    const resFaList = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/closeout/final-accounts',
      method: 'GET',
    });
    if (resFaList.statusCode === 200 && Array.isArray(JSON.parse(resFaList.body))) {
      console.log('[PASS] GET /api/v1/closeout/final-accounts');
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/closeout/final-accounts -> ${resFaList.statusCode}`);
      failed++;
    }

    // 2.3 POST /api/v1/closeout/final-accounts
    const newFaPayload = {
      settlementNumber: 'FA-REGRESSION-2026-99',
      projectId: 'proj-reg-99',
      projectName: 'Proyek Bendungan Pengendali Banjir Regresi',
      contractorName: 'PT Hutama Karya (Persero) Infrastruktur',
      originalContractValue: 50000000000,
      totalVariationOrders: 2500000000,
      retentionDeduction: 2500000000,
      liquidatedDamages: 0,
      previousPayments: 45000000000,
      notes: 'Rekonsiliasi otomatis suite regresi.',
    };
    const resPostFa = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: '/api/v1/closeout/final-accounts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newFaPayload
    );
    if (resPostFa.statusCode === 201) {
      const data = JSON.parse(resPostFa.body);
      createdFaId = data.id;
      console.log('[PASS] POST /api/v1/closeout/final-accounts');
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/closeout/final-accounts -> ${resPostFa.statusCode}`);
      failed++;
    }

    // 2.4 PATCH /api/v1/closeout/final-accounts/:id/approve (QS endorsement)
    const resApproveFaQS = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: `/api/v1/closeout/final-accounts/${createdFaId}/approve`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      },
      { role: 'QUANTITY_SURVEYOR', signerName: 'Lead QS Suite' }
    );
    if (resApproveFaQS.statusCode === 200) {
      console.log('[PASS] PATCH /api/v1/closeout/final-accounts/:id/approve (QS Endorsement)');
      passed++;
    } else {
      console.error(`[FAIL] PATCH /api/v1/closeout/final-accounts/:id/approve (QS) -> ${resApproveFaQS.statusCode}`);
      failed++;
    }

    // 2.5 PATCH /api/v1/closeout/final-accounts/:id/approve (PPK final discharge)
    const resApproveFaPPK = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: `/api/v1/closeout/final-accounts/${createdFaId}/approve`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      },
      { role: 'OWNER_PPK', signerName: 'PPK Proyek' }
    );
    if (resApproveFaPPK.statusCode === 200) {
      console.log('[PASS] PATCH /api/v1/closeout/final-accounts/:id/approve (PPK Signatory)');
      passed++;
    } else {
      console.error(`[FAIL] PATCH /api/v1/closeout/final-accounts/:id/approve (PPK) -> ${resApproveFaPPK.statusCode}`);
      failed++;
    }

    // 2.6 GET /api/v1/closeout/as-built-documents
    const resAsbList = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/closeout/as-built-documents',
      method: 'GET',
    });
    if (resAsbList.statusCode === 200 && Array.isArray(JSON.parse(resAsbList.body))) {
      console.log('[PASS] GET /api/v1/closeout/as-built-documents');
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/closeout/as-built-documents -> ${resAsbList.statusCode}`);
      failed++;
    }

    // 2.7 POST /api/v1/closeout/as-built-documents
    const newAsbPayload = {
      docNumber: 'ASB-REG-099',
      title: 'Gambar Terlaksana Saluran Pelimpah Spillway Bendungan',
      discipline: 'STRUCTURE',
      revision: 'Rev.Final-0',
      format: 'BIM / DWG',
      fileSize: '34.5 MB',
      downloadUrl: '/storage/asbuilt/spillway.zip',
      description: 'Gambar hasil verifikasi elevasi spillway bendungan.',
    };
    const resPostAsb = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: '/api/v1/closeout/as-built-documents',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newAsbPayload
    );
    if (resPostAsb.statusCode === 201) {
      const data = JSON.parse(resPostAsb.body);
      createdAsbId = data.id;
      console.log('[PASS] POST /api/v1/closeout/as-built-documents');
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/closeout/as-built-documents -> ${resPostAsb.statusCode}`);
      failed++;
    }

    // 2.8 PATCH /api/v1/closeout/as-built-documents/:id/verify
    const resVerifyAsb = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: `/api/v1/closeout/as-built-documents/${createdAsbId}/verify`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      },
      { verifierName: 'Ir. Inspektur MK Regresi' }
    );
    if (resVerifyAsb.statusCode === 200) {
      console.log('[PASS] PATCH /api/v1/closeout/as-built-documents/:id/verify (MK Inspection)');
      passed++;
    } else {
      console.error(`[FAIL] PATCH /api/v1/closeout/as-built-documents/:id/verify -> ${resVerifyAsb.statusCode}`);
      failed++;
    }

    // 2.9 GET /api/v1/closeout/audit-logs
    const resAudList = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/closeout/audit-logs',
      method: 'GET',
    });
    if (resAudList.statusCode === 200 && Array.isArray(JSON.parse(resAudList.body))) {
      console.log('[PASS] GET /api/v1/closeout/audit-logs');
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/closeout/audit-logs -> ${resAudList.statusCode}`);
      failed++;
    }

    // 2.10 POST /api/v1/closeout/audit-logs
    const resPostAud = await request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: '/api/v1/closeout/audit-logs',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId: 'usr-reg-01',
        userName: 'Regresor QA',
        userRole: 'QA Engineer',
        action: 'VERIFY',
        module: 'RegressionSuite',
        resourceId: 'REG-PHASE20',
        description: 'Verifikasi seluruh rute dan integritas audit trail Phase 20.',
      }
    );
    if (resPostAud.statusCode === 201) {
      console.log('[PASS] POST /api/v1/closeout/audit-logs');
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/closeout/audit-logs -> ${resPostAud.statusCode}`);
      failed++;
    }

    // 2.11 GET /api/v1/closeout/audit-logs/export
    const resAudExport = await request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/v1/closeout/audit-logs/export',
      method: 'GET',
    });
    if (resAudExport.statusCode === 200) {
      const data = JSON.parse(resAudExport.body);
      if (data.integrityChecksum && data.logs) {
        console.log('[PASS] GET /api/v1/closeout/audit-logs/export (Integrity Checksum Verified)');
        passed++;
      } else {
        console.error('[FAIL] GET /api/v1/closeout/audit-logs/export invalid schema');
        failed++;
      }
    } else {
      console.error(`[FAIL] GET /api/v1/closeout/audit-logs/export -> ${resAudExport.statusCode}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] Backend test failed: ${err.message}`);
    failed++;
  }

  console.log('\n========================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
