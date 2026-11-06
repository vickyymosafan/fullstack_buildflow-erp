/* Phase 28 regression: 16 IoT Gateway API checks + 30 dashboard routes + content check = 47 tests */
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
  const ov = await fetch(API + "/iot-gateway/overview").then(j);
  ok("GET overview", ov.status === "OPERATIONAL" && ov.gatewaysSummary.totalGateways >= 3);

  const devs = await fetch(API + "/iot-gateway/devices").then(j);
  ok("GET devices", Array.isArray(devs) && devs.length >= 3);

  const uniqueGw = `gw-test-${Date.now()}`;
  const rg = await post("/iot-gateway/devices/register", { gatewayId: uniqueGw, name: "Edge Test", deviceType: "LORAWAN_CONCENTRATOR", siteLocation: "Site A", protocol: "MQTT_TLS_1_3" }).then(j);
  ok("POST devices/register", rg.device && rg.device.gatewayId === uniqueGw);

  const rgDup = await post("/iot-gateway/devices/register", { gatewayId: uniqueGw, name: "Edge Test", deviceType: "LORAWAN_CONCENTRATOR", siteLocation: "Site A", protocol: "MQTT_TLS_1_3" });
  ok("POST devices/register duplicate -> 400", rgDup.status === 400);

  const wts = await fetch(API + "/iot-gateway/weighbridge/tickets").then(j);
  ok("GET weighbridge/tickets", Array.isArray(wts) && wts.length >= 3);

  const rw = await post("/iot-gateway/weighbridge/record", { gatewayId: "gw-weigh-01", licensePlate: "B 9999 XX", deliveryOrderNo: "DO-01", materialName: "Semen", grossWeightKg: 42000, tareWeightKg: 14000, doExpectedNetKg: 28000 }).then(j);
  ok("POST weighbridge/record", rw.ticket && rw.ticket.netWeightKg === 28000 && rw.ticket.status === "MATCHED");

  const rw400 = await post("/iot-gateway/weighbridge/record", { gatewayId: "gw-weigh-01", licensePlate: "B 9999 XX", deliveryOrderNo: "DO-01", materialName: "Semen", grossWeightKg: 10000, tareWeightKg: 14000, doExpectedNetKg: 28000 });
  ok("POST weighbridge/record gross<=tare -> 400", rw400.status === 400);

  const fl = await fetch(API + "/iot-gateway/telematics/fleet").then(j);
  ok("GET telematics/fleet", Array.isArray(fl) && fl.length >= 3);

  const it = await post("/iot-gateway/telematics/telemetry", { equipmentId: "EQ-EXC-001", unitName: "Komatsu PC200", engineRpm: 0, fuelBurnRateLph: 0, fuelLevelPercent: 45, hourMeter: 4130, suddenFuelDropLiters: 25 }).then(j);
  ok("POST telematics/telemetry triggers theft alert", it.fuelTheftAlertTriggered === true && it.alert);

  const fa = await fetch(API + "/iot-gateway/telematics/fuel-alerts").then(j);
  ok("GET telematics/fuel-alerts", Array.isArray(fa) && fa.length >= 2);

  const openAlert = fa.find((a) => a.status === "OPEN") || fa[0];
  const ack = await post("/iot-gateway/telematics/fuel-alerts/acknowledge", { alertId: openAlert.id, acknowledgedBy: "QA Lead", resolutionNotes: "Checked" }).then(j);
  ok("POST telematics/fuel-alerts/acknowledge", ack.alert && ack.alert.status === "ACKNOWLEDGED");

  const ack404 = await post("/iot-gateway/telematics/fuel-alerts/acknowledge", { alertId: "nope", acknowledgedBy: "QA", resolutionNotes: "x" });
  ok("POST telematics/fuel-alerts/acknowledge unknown -> 404", ack404.status === 404);

  const bl = await fetch(API + "/iot-gateway/biometrics/logs").then(j);
  ok("GET biometrics/logs", Array.isArray(bl) && bl.length >= 2);

  const sb = await post("/iot-gateway/biometrics/sync-batch", { gatewayId: "gw-bio-01", gateName: "Gate A", recordsCount: 50, helmetCompliantCount: 50 }).then(j);
  ok("POST biometrics/sync-batch", sb.batch && sb.batch.recordsCount === 50);

  const pg = await post("/iot-gateway/devices/ping", { gatewayId: "gw-weigh-01" }).then(j);
  ok("POST devices/ping", pg.rttMs === 18 && pg.gateway.status === "ONLINE");

  const pg404 = await post("/iot-gateway/devices/ping", { gatewayId: "unknown-gw" });
  ok("POST devices/ping unknown -> 404", pg404.status === 404);

  const routes = ["overview","executive-bi","orchestration","crm","approvals","projects","budget","site","quality","hse","sustainability","subcontractors","equipment","iot-gateway","change-orders","official-reports","joint-operations","handover","closeout","documents","bim","contracts","procurement","vendor-portal","inventory","finance","treasury","hr","analytics","disaster-recovery"];
  for (const r of routes) {
    const res = await fetch(`${WEB}/${r}`);
    ok(`WEB /${r}`, res.status === 200, res.status);
  }
  const html = await fetch(`${WEB}/iot-gateway`).then((r) => r.text());
  ok("WEB /iot-gateway content", html.includes("Hardware IoT Site Gateway"));

  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();

