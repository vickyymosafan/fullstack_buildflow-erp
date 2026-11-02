const frontendRoutes = [
  '/overview',
  '/crm',
  '/approvals',
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
  '/settings',
  '/orchestration'
];

const backendEndpoints = [
  'http://localhost:4000/api/v1/settings/overview',
  'http://localhost:4000/api/v1/settings/organization',
  'http://localhost:4000/api/v1/settings/users',
  'http://localhost:4000/api/v1/settings/roles',
  'http://localhost:4000/api/v1/settings/audit-logs',
  'http://localhost:4000/api/v1/orchestration/overview'
];

async function checkUrl(url) {
  const start = Date.now();
  try {
    const res = await fetch(url);
    const duration = Date.now() - start;
    return { url, status: res.status, ok: res.ok, duration };
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message, duration: Date.now() - start };
  }
}

async function run() {
  console.log("=== BUILDFLOW ERP FULL REGRESSION SUITE (PHASE 11) ===");
  console.log("Verifying 15 Frontend Routes and 6 Backend Endpoints...\n");

  const results = {
    timestamp: new Date().toISOString(),
    frontend: [],
    backend: [],
    summary: { total: 0, passed: 0, failed: 0 }
  };

  for (const route of frontendRoutes) {
    const res = await checkUrl(`http://localhost:3000${route}`);
    results.frontend.push(res);
    results.summary.total++;
    if (res.ok) {
      results.summary.passed++;
      console.log(`[PASS] [WEB] 200 OK (${res.duration}ms) - http://localhost:3000${route}`);
    } else {
      results.summary.failed++;
      console.error(`[FAIL] [WEB] ${res.status} - http://localhost:3000${route} (${res.error || ''})`);
    }
  }

  for (const ep of backendEndpoints) {
    const res = await checkUrl(ep);
    results.backend.push(res);
    results.summary.total++;
    if (res.ok) {
      results.summary.passed++;
      console.log(`[PASS] [API] 200 OK (${res.duration}ms) - ${ep}`);
    } else {
      results.summary.failed++;
      console.error(`[FAIL] [API] ${res.status} - ${ep} (${res.error || ''})`);
    }
  }

  console.log("\n=== REGRESSION RESULT ===");
  console.log(`Total: ${results.summary.total}, Passed: ${results.summary.passed}, Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

  if (results.summary.failed > 0) {
    process.exit(1);
  }
}

run();
