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
  console.log('=== BUILDFLOW ERP: PHASE 15 FULL REGRESSION SUITE ===\n');
  let passed = 0;
  let total = 0;

  // 1. Frontend Dashboard Routes (Target: 17 routes)
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

  // 2. Testing Backend Equipment API Endpoints
  console.log('\n--- 2. Testing Backend Equipment API Endpoints ---');

  // Check 1: Summary
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/equipment/summary');
    if (
      res.status === 200 &&
      res.body &&
      typeof res.body.totalEquipment === 'number' &&
      typeof res.body.totalHourMeter === 'number' &&
      typeof res.body.siloCompliancePercent === 'number'
    ) {
      console.log(
        `[PASS] GET /api/v1/equipment/summary -> ${res.body.totalEquipment} unit, HM: ${res.body.totalHourMeter}, K3 SILO: ${res.body.siloCompliancePercent}%`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/equipment/summary ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/equipment/summary -> ${err.message}`);
  }

  // Check 2: Fleet list
  total++;
  let firstEquipment = null;
  try {
    const res = await request('http://localhost:4000/api/v1/equipment/fleet');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 4) {
      firstEquipment = res.body[0];
      console.log(
        `[PASS] GET /api/v1/equipment/fleet -> Ditemukan ${res.body.length} unit armada master`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/equipment/fleet ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/equipment/fleet -> ${err.message}`);
  }

  // Check 3: Equipment detail by ID
  total++;
  try {
    if (firstEquipment) {
      const res = await request(
        `http://localhost:4000/api/v1/equipment/fleet/${firstEquipment.id}`
      );
      if (res.status === 200 && res.body && res.body.equipmentCode === firstEquipment.equipmentCode) {
        console.log(
          `[PASS] GET /api/v1/equipment/fleet/:id -> Detail unit ${res.body.equipmentCode} (${res.body.name}) terverifikasi`
        );
        passed++;
      } else {
        console.error(`[FAIL] GET /api/v1/equipment/fleet/:id ->`, res);
      }
    } else {
      console.error(`[FAIL] GET /api/v1/equipment/fleet/:id -> Unit tidak tersedia`);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/equipment/fleet/:id -> ${err.message}`);
  }

  // Check 4: POST /api/v1/equipment/fleet (Create unit)
  total++;
  let createdUnitId = null;
  try {
    const newUnit = {
      equipmentCode: 'EQ-DT-99',
      name: 'Dump Truck Isuzu Giga FVR 34 P',
      category: 'TRANSPORT',
      brandModel: 'Isuzu Giga FVR 34 P 285 PS',
      serialNumber: 'SN-ISZ-99881',
      year: 2024,
      ownership: 'INTERNAL',
      operatorName: 'Dedi Kurniawan',
      sioNumber: 'SIO-09.9912-DEPNAKER/2025',
      siloNumber: 'SILO-DT-88912-DISNAKER/2026',
      siloExpiryDate: '2027-05-20',
      initialHourMeter: 350.0,
      location: 'Area Hauling Jalur Timur',
    };

    const res = await request(
      'http://localhost:4000/api/v1/equipment/fleet',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newUnit
    );

    if (res.status === 201 && res.body && res.body.success) {
      createdUnitId = res.body.equipmentId;
      console.log(
        `[PASS] POST /api/v1/equipment/fleet -> Berhasil mendaftarkan unit ${res.body.equipmentCode}`
      );
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/equipment/fleet ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] POST /api/v1/equipment/fleet -> ${err.message}`);
  }

  // Check 5: PATCH /api/v1/equipment/fleet/:id/status
  total++;
  try {
    const targetId = createdUnitId || (firstEquipment ? firstEquipment.id : null);
    if (targetId) {
      const res = await request(
        `http://localhost:4000/api/v1/equipment/fleet/${targetId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          status: 'MAINTENANCE',
          notes: 'Unit dijadwalkan masuk workshop untuk rotasi ban dan servis oli transmisi',
          currentLocation: 'Workshop Utama Lapangan',
        }
      );

      if (res.status === 200 && res.body && res.body.updatedStatus === 'MAINTENANCE') {
        console.log(
          `[PASS] PATCH /api/v1/equipment/fleet/:id/status -> Status diperbarui menjadi MAINTENANCE`
        );
        passed++;
      } else {
        console.error(`[FAIL] PATCH /api/v1/equipment/fleet/:id/status ->`, res);
      }
    } else {
      console.error(`[FAIL] PATCH status -> Target unit id tidak valid`);
    }
  } catch (err) {
    console.error(`[FAIL] PATCH status -> ${err.message}`);
  }

  // Check 6: GET /api/v1/equipment/logs (Daily logs)
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/equipment/logs');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 4) {
      console.log(
        `[PASS] GET /api/v1/equipment/logs -> Ditemukan ${res.body.length} catatan log harian HM & BBM`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/equipment/logs ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/equipment/logs -> ${err.message}`);
  }

  // Check 7: POST /api/v1/equipment/logs (Create log)
  total++;
  try {
    const newLog = {
      equipmentId: firstEquipment?.id || 'fleet-id-01',
      equipmentCode: firstEquipment?.equipmentCode || 'EQ-TC-01',
      date: '2026-03-02',
      shift: 'Pagi',
      startHourMeter: 2486.0,
      endHourMeter: 2494.0,
      operatingHours: 8.0,
      idleHours: 0.5,
      fuelAddedLiters: 105.0,
      operatorName: 'Hariyanto, S.T.',
      workDescription: 'Pengangkatan material struktur balok lantai 9',
      location: 'Tower Utama Zona A',
    };

    const res = await request(
      'http://localhost:4000/api/v1/equipment/logs',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newLog
    );

    if (res.status === 201 && res.body && res.body.success) {
      console.log(
        `[PASS] POST /api/v1/equipment/logs -> Log ${res.body.logNumber} (${res.body.operatingHours} jam, efisiensi: ${res.body.fuelEfficiency} L/jam) berhasil dicatat`
      );
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/equipment/logs ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] POST /api/v1/equipment/logs -> ${err.message}`);
  }

  // Check 8: GET /api/v1/equipment/maintenance
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/equipment/maintenance');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 3) {
      console.log(
        `[PASS] GET /api/v1/equipment/maintenance -> Ditemukan ${res.body.length} catatan servis & pemeliharaan`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/equipment/maintenance ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/equipment/maintenance -> ${err.message}`);
  }

  // Check 9: POST /api/v1/equipment/maintenance
  total++;
  try {
    const newMnt = {
      equipmentId: firstEquipment?.id || 'fleet-id-01',
      equipmentCode: firstEquipment?.equipmentCode || 'EQ-TC-01',
      serviceType: 'PREVENTIVE_500_HM',
      scheduledDate: '2026-04-10',
      scheduledHourMeter: 2750.0,
      technicianVendor: 'Tim Servis Resmi Liebherr',
      cost: 9500000,
      sparePartsReplaced: ['Filter Oli', 'Oli Transmisi 20L', 'Filter Udara'],
      notes: 'Pengecekan rutin sistem hoist dan pengereman darurat',
    };

    const res = await request(
      'http://localhost:4000/api/v1/equipment/maintenance',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newMnt
    );

    if (res.status === 201 && res.body && res.body.success) {
      console.log(
        `[PASS] POST /api/v1/equipment/maintenance -> Tiket servis ${res.body.maintenanceNumber} berhasil dibuat`
      );
      passed++;
    } else {
      console.error(`[FAIL] POST /api/v1/equipment/maintenance ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] POST /api/v1/equipment/maintenance -> ${err.message}`);
  }

  // Check 10: GET /api/v1/equipment/compliance
  total++;
  try {
    const res = await request('http://localhost:4000/api/v1/equipment/compliance');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length >= 4) {
      const validCount = res.body.filter((c) => c.siloStatus === 'VALID').length;
      console.log(
        `[PASS] GET /api/v1/equipment/compliance -> ${res.body.length} unit terverifikasi K3 SILO (${validCount} SILO aktif)`
      );
      passed++;
    } else {
      console.error(`[FAIL] GET /api/v1/equipment/compliance ->`, res);
    }
  } catch (err) {
    console.error(`[FAIL] GET /api/v1/equipment/compliance -> ${err.message}`);
  }

  console.log('\n======================================================');
  console.log(`TOTAL CHECKS : ${total}`);
  console.log(`PASSED       : ${passed}`);
  console.log(`FAILED       : ${total - passed}`);
  console.log(
    `PASS RATE    : ${((passed / total) * 100).toFixed(1)}%`
  );
  console.log('======================================================\n');

  if (passed === total) {
    console.log('🎉 ALL PHASE 15 REGRESSION TESTS PASSED PERFECTLY (100%)!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME REGRESSION CHECKS FAILED. INVESTIGATION REQUIRED.');
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal regression runner error:', err);
  process.exit(1);
});

