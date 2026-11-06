/* Phase 27 regression: 12 DR endpoints + dashboard routes */
const API = "http://localhost:4000/api/v1";
const WEB = "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
};
const j = (r) => r.json();
const post = (p, b) => fetch(API + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });

(async () => {
  const s = await fetch(API + "/disaster-recovery/status").then(j);
  ok("GET status", s.clusterHealth === "HEALTHY" && s.rpoStatus.slaTargetSeconds === 300 && s.rtoStatus.slaTargetSeconds === 900);

  const parts = await fetch(API + "/disaster-recovery/partitions").then(j);
  ok("GET partitions", Array.isArray(parts) && parts.length >= 5);

  const uniqueSchema = `tenant_test_${Date.now()}`;
  const cp = await post("/disaster-recovery/partitions/create", { tenantId: "tenant_test", tenantName: "Test", fiscalYear: 2027, schemaName: uniqueSchema, partitionKey: "fiscal_year", tables: [] });
  const cpj = await cp.json();
  ok("POST partitions/create", cpj.partition && cpj.partition.schemaName === uniqueSchema);

  const dup = await post("/disaster-recovery/partitions/create", { tenantId: "tenant_test", tenantName: "Test", fiscalYear: 2027, schemaName: uniqueSchema, partitionKey: "fiscal_year", tables: [] });
  ok("POST partitions/create duplicate -> 400", dup.status === 400);

  const ar = await post("/disaster-recovery/partitions/archive", { partitionId: "part-adhimix-2026", targetStorage: "cold_minio_s3", reason: "test", authorizedBy: "QA" }).then(j);
  ok("POST partitions/archive", ar.partition && ar.partition.status === "archived_cold");

  const ar404 = await post("/disaster-recovery/partitions/archive", { partitionId: "nope", targetStorage: "cold_minio_s3", reason: "t", authorizedBy: "QA" });
  ok("POST partitions/archive unknown -> 404", ar404.status === 404);

  const rep = await fetch(API + "/disaster-recovery/replicas").then(j);
  ok("GET replicas", rep.primary && rep.replicas.length === 3);

  const fo = await post("/disaster-recovery/failover/simulate", { targetReplicaId: "pg-replica-jkt-01", drillType: "scheduled_switchover" }).then(j);
  ok("POST failover/simulate RTO<900 & RPO<300", fo.drillResult && fo.rtoAchievedSeconds < 900 && fo.rpoAchievedSeconds < 300);

  const fo404 = await post("/disaster-recovery/failover/simulate", { targetReplicaId: "x", drillType: "scheduled_switchover" });
  ok("POST failover unknown -> 404", fo404.status === 404);

  const cm = await fetch(API + "/disaster-recovery/cache/metrics").then(j);
  ok("GET cache/metrics", cm.hitRatioPercent > 90 && cm.activeDistributedLocks.length === 3);

  const pc = await post("/disaster-recovery/cache/purge", { scope: "tag", targetTag: "contracts:clauses", reason: "test" }).then(j);
  ok("POST cache/purge", pc.purgedKeysCount > 0);

  const sn = await fetch(API + "/disaster-recovery/pitr/snapshots").then(j);
  ok("GET pitr/snapshots", sn.snapshots.length === 3 && sn.walStreamingStatus.continuousArchiving === true);

  const pr = await post("/disaster-recovery/pitr/simulate-restore", { targetTimestamp: "2026-11-06T14:32:00.000Z", sourceSnapshotId: "snap-20261106-0000", sandboxInstanceName: "sandbox-qa", verifyChecksums: true }).then(j);
  ok("POST pitr/simulate-restore", pr.restorationDetails && /PASS/.test(pr.restorationDetails.checksumVerification));

  const dh = await fetch(API + "/disaster-recovery/drills/history").then(j);
  ok("GET drills/history", Array.isArray(dh) && dh.length >= 4);

  const uncert = dh.find((d) => !d.certified);
  const ce = await post("/disaster-recovery/drills/certify", { drillId: uncert.id, auditorName: "BSI", complianceStandard: "ISO 22301:2019" }).then(j);
  ok("POST drills/certify", ce.certifiedDrill && ce.certifiedDrill.certified === true);

  const ce404 = await post("/disaster-recovery/drills/certify", { drillId: "nope", auditorName: "BSI", complianceStandard: "X" });
  ok("POST drills/certify unknown -> 404", ce404.status === 404);

  const routes = ["overview","executive-bi","orchestration","crm","approvals","projects","budget","site","quality","hse","sustainability","subcontractors","equipment","change-orders","official-reports","joint-operations","handover","closeout","documents","bim","contracts","procurement","vendor-portal","inventory","finance","treasury","hr","analytics","disaster-recovery"];
  for (const r of routes) {
    const res = await fetch(`${WEB}/${r}`);
    ok(`WEB /${r}`, res.status === 200, res.status);
  }
  const html = await fetch(`${WEB}/disaster-recovery`).then((r) => r.text());
  ok("WEB /disaster-recovery content", html.includes("Disaster Recovery"));

  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();

