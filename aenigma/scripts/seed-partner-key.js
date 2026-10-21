#!/usr/bin/env node
// Seed / list / revoke ÆNIGMA Circles partner API keys.
//
//   node scripts/seed-partner-key.js "Partner Name"     → mint a key (printed ONCE)
//   node scripts/seed-partner-key.js --list             → list key records (no secrets)
//   node scripts/seed-partner-key.js --revoke <id>      → revoke a key
//
// Keys are stored HASHED (sha256) in aenigma/data/circles.json — the raw key
// exists only in this command's output. In production, prefer the
// AENIGMA_PARTNER_KEYS env var (same record shape, keyHash values) so keys
// survive deploys; see docs/circles-partner-api.md.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const FILE = path.join(__dirname, "..", "data", "circles.json");
function load() {
  try {
    const d = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (d && Array.isArray(d.circles)) return d;
  } catch {}
  return { circles: [], members: [], partnerKeys: [] };
}
function save(d) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(d));
}

const [cmd, arg] = process.argv.slice(2);
const data = load();
if (!Array.isArray(data.partnerKeys)) data.partnerKeys = [];

if (cmd === "--list") {
  for (const k of data.partnerKeys) {
    console.log(`${k.id}  ${k.partnerName}  scopes=[${(k.scopes || []).join(",")}]  created=${k.createdAt}  ${k.revokedAt ? "REVOKED " + k.revokedAt : "active"}`);
  }
  if (!data.partnerKeys.length) console.log("(no partner keys in the data file)");
} else if (cmd === "--revoke" && arg) {
  const k = data.partnerKeys.find((x) => x.id === arg);
  if (!k) { console.error("no such key id:", arg); process.exit(1); }
  k.revokedAt = new Date().toISOString();
  save(data);
  console.log("revoked:", k.id, k.partnerName);
} else if (cmd && !cmd.startsWith("--")) {
  const raw = "aen_pk_" + crypto.randomBytes(24).toString("hex");
  const rec = {
    id: "pk_" + crypto.randomBytes(6).toString("hex"),
    partnerName: cmd,
    keyHash: crypto.createHash("sha256").update(raw).digest("hex"),
    scopes: ["forecast:read", "status:read"],
    createdAt: new Date().toISOString(),
    revokedAt: null,
  };
  data.partnerKeys.push(rec);
  save(data);
  console.log("partner key created — copy it now, it is never shown again:");
  console.log("  id:   " + rec.id);
  console.log("  name: " + rec.partnerName);
  console.log("  key:  " + raw);
  console.log("  (only its sha256 hash was stored)");
} else {
  console.log("usage: seed-partner-key.js \"Partner Name\" | --list | --revoke <id>");
  process.exit(2);
}
