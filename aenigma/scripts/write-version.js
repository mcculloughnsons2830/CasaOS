// Writes aenigma/public/version.json before boot so /api/health and the
// ops dashboard always report the deployed commit. Prefers Railway's
// RAILWAY_GIT_COMMIT_SHA, falls back to git, then "dev".
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function sha() {
  const env = (process.env.RAILWAY_GIT_COMMIT_SHA || "").trim();
  if (env) return env.slice(0, 12);
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: path.join(__dirname, "..", ".."),
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 3000,
    }).toString().trim() || "dev";
  } catch { return "dev"; }
}

const out = { sha: sha(), built_at: new Date().toISOString() };
fs.writeFileSync(path.join(__dirname, "..", "public", "version.json"), JSON.stringify(out) + "\n");
console.log("version.json:", out.sha);
