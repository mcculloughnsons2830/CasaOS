// ÆNIGMA Circles — relationship forecasts (additive module).
//
// A user ("owner") keeps a small circle of loved ones. For each member the
// app computes a daily "emotional weather" forecast from that member's
// ÆNIGMA profile + personal cycles (Personal Year/Month/Day) — deterministic,
// no LLM call, likelihood language, symbolic lens. NEVER a diagnosis.
//
// Consent model (enforced server-side, here):
//  - parent & child: a parent may create a MANAGED profile for their child
//    (parent-managed consent, flagged in the UI). The child can later CLAIM
//    the profile through its claim link, which moves it to ACCEPTED under
//    their own control.
//  - partner / family: the owner can only invite. The member's birth data is
//    entered BY THE MEMBER on the invite page, together with their Accept —
//    that is the consent step. Owner-entered birth data for adults is refused.
//  - revoke (owner-side or member-side, via their link) flips the member to
//    REVOKED and every forecast path — UI and partner API — refuses at once.
//
// Partner API: platforms (e.g. a future Life360 integration) receive FORECAST
// OUTPUTS ONLY under a hashed partner key. Birth data and profile internals
// never leave through that surface. See docs/circles-partner-api.md.
//
// Storage follows the app's existing pattern (see Credits in server.js):
// one JSON file in aenigma/data/, loaded at boot, saved on mutation.
// Identity follows the app's existing pattern too: the wallet email,
// keyed by sha256 — raw emails are never stored here.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "data");
const CIRCLES_FILE = path.join(DATA_DIR, "circles.json");

const FRAMING = "A symbolic read through the ÆNIGMA lens. Grant's BFN framework is a proposed framework, and personal cycles are a language for reflection — likelihood, not certainty; a lens, not a diagnosis. A person is not their pattern.";
const FORECASTABLE = new Set(["managed", "accepted"]);
const CIRCLE_TYPES = new Set(["parent_child", "partner", "family"]);
const ROLES = new Set(["child", "parent", "partner", "family"]);

// ---------------------------------------------------------------------------
// Numerology — the same arithmetic the app already uses.
// Personal cycles mirror server.js personalContext exactly; Life Path /
// Expression / Enneagram / Codex mirror the SPA's reading engine (app.js
// computeFullReading) so a member's snapshot agrees with their own reading.
// ---------------------------------------------------------------------------
function reduceNum(n, keepMasters = true) {
  n = Math.abs(parseInt(n, 10)) || 0;
  while (n > 9 && !(keepMasters && (n === 11 || n === 22 || n === 33))) {
    n = String(n).split("").reduce((s, d) => s + Number(d), 0);
  }
  return n;
}
function digRoot(n, masters) {
  let v = Math.abs(Math.floor(Number(n))) || 0;
  while (v > 9 && !(masters && (v === 11 || v === 22))) {
    v = String(v).split("").reduce((s, d) => s + Number(d), 0);
  }
  return v;
}
function digitsSum(str) { return String(str).replace(/\D/g, "").split("").reduce((s, d) => s + Number(d), 0); }
function bfnReduce12(n) {
  let v = Math.abs(Math.floor(Number(n))) || 0;
  while (v >= 12) {
    v = v.toString(12).toUpperCase().split("").reduce((s, ch) => s + parseInt(ch, 12), 0);
  }
  return v;
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const NUM_MEANING = {
  1: "initiation, will, the self starting", 2: "union, balance, patience",
  3: "expression, creativity, voice", 4: "structure, foundation, discipline",
  5: "change, freedom, movement", 6: "care, responsibility, the heart",
  7: "inquiry, solitude, the inner search", 8: "power, mastery of the material",
  9: "completion, release, the wider good", 11: "the intuitive channel (master number)",
  22: "the master builder — vision made real", 33: "the master teacher — love in service",
};
const ZODIAC = [
  [1, 19, "Capricorn", "Earth"], [2, 18, "Aquarius", "Air"], [3, 20, "Pisces", "Water"],
  [4, 19, "Aries", "Fire"], [5, 20, "Taurus", "Earth"], [6, 20, "Gemini", "Air"],
  [7, 22, "Cancer", "Water"], [8, 22, "Leo", "Fire"], [9, 22, "Virgo", "Earth"],
  [10, 22, "Libra", "Air"], [11, 21, "Scorpio", "Water"], [12, 21, "Sagittarius", "Fire"],
  [12, 31, "Capricorn", "Earth"],
];
function sunSignOf(m, d) {
  for (const [mm, dd, name, element] of ZODIAC) {
    if (m < mm || (m === mm && d <= dd)) return { name, element };
  }
  return { name: "Capricorn", element: "Earth" };
}

const LETTER_VAL = (() => {
  const map = {};
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((ch, i) => { map[ch] = (i % 9) + 1; });
  return map;
})();
function expressionOf(name) {
  const clean = String(name || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (clean.length < 2) return null;
  let total = 0;
  for (const ch of clean) total += LETTER_VAL[ch];
  return digRoot(total, false);
}

const ENNEA_CORE = {
  1: ["The Reformer", "Integrity — to be good and right"],
  2: ["The Helper", "Love — to be needed and appreciated"],
  3: ["The Achiever", "Worth — to be valuable through success"],
  4: ["The Individualist", "Identity — to be uniquely significant"],
  5: ["The Investigator", "Insight, depth, understanding"],
  6: ["The Loyalist", "Security — to be safe and supported"],
  7: ["The Enthusiast", "Freedom — to stay engaged and open"],
  8: ["The Challenger", "Autonomy — to be self-reliant and strong"],
  9: ["The Peacemaker", "Harmony — to be at peace and whole"],
};
const CODEX_ORDER = ["CAELIX", "VIRELUM", "AZURÆ", "LUMIRESSA"];

// The computed ÆNIGMA values for one person's birth data (stored snapshot).
function computeSnapshot(birth, displayName) {
  const { y, m, d } = birth;
  const stamp = y * 10000 + m * 100 + d;
  const lifePath = digRoot(stamp, true);
  const substrate = bfnReduce12(stamp);
  const core = ((d + m + lifePath) % 9) + 1;
  let wing = core + (lifePath % 2 ? 1 : -1);
  if (wing < 1) wing = 9; if (wing > 9) wing = 1;
  const sun = sunSignOf(m, d);
  return {
    lifePath,
    lifePathMeaning: NUM_MEANING[lifePath] || "",
    birthDay: reduceNum(d),
    expression: expressionOf(displayName),
    enneagram: { type: `${core}w${wing}`, core, label: ENNEA_CORE[core][0], motive: ENNEA_CORE[core][1] },
    codex: CODEX_ORDER[substrate % 4],
    sunSign: sun.name,
    sunElement: sun.element,
  };
}

// Personal Year/Month/Day for a target date — server.js personalContext math.
function personalCycles(birth, date) {
  const py = reduceNum(reduceNum(birth.m, false) + reduceNum(birth.d, false) + reduceNum(digitsSum(date.getUTCFullYear()), false));
  const pm = reduceNum(reduceNum(py, false) + reduceNum(date.getUTCMonth() + 1, false));
  const pd = reduceNum(reduceNum(pm, false) + reduceNum(date.getUTCDate(), false));
  return { personalYear: py, personalMonth: pm, personalDay: pd };
}

function parseBirthDate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || "").trim());
  if (!m) return null;
  const b = { y: +m[1], m: +m[2], d: +m[3] };
  if (b.y < 1900 || b.y > 2100 || b.m < 1 || b.m > 12 || b.d < 1 || b.d > 31) return null;
  const dt = new Date(Date.UTC(b.y, b.m - 1, b.d));
  if (dt.getUTCFullYear() !== b.y || dt.getUTCMonth() !== b.m - 1 || dt.getUTCDate() !== b.d) return null;
  return b;
}
// Owner birth date arrives from the SPA profile as DD/MM/YYYY text (or ISO).
function parseFlexibleDate(str) {
  const iso = parseBirthDate(str);
  if (iso) return iso;
  const m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(String(str || "").trim());
  if (!m) return null;
  return parseBirthDate(`${m[3]}-${String(m[2]).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`);
}
function isoDate(d) {
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

// ---------------------------------------------------------------------------
// Forecast lexicon — keyed by Personal Day, phrased in likelihood language.
// {name} is replaced with the member's first name at render. Two variants per
// field; the pick is deterministic per member + date, so a day reads the same
// all day, on every surface (app, partner API).
// ---------------------------------------------------------------------------
const PD_LEXICON = {
  1: { headlines: ["Fresh spark, forward lean", "A starting day"],
    outlooks: ["{name} is likely running on initiation today — self-starting, a little impatient with anything that slows the first move.", "{name} tends to wake up wanting motion today; new beginnings land better than maintenance."],
    landsWell: ["A clear invitation to start something — hand them the first step, not the whole staircase.", "Direct asks and honest momentum."],
    goGently: ["Don't crowd the launch with committee energy; too many voices early will read as drag.", "Avoid relitigating yesterday — today faces forward."] },
  2: { headlines: ["Soft weather, close tides", "A listening day"],
    outlooks: ["{name} is likely tuned to the emotional frequency of the room today — receptive, patient, quietly reading everyone.", "{name} tends toward union and balance today; small slights register larger than usual, and so does small kindness."],
    landsWell: ["One-on-one time and unhurried conversation.", "Naming appreciation out loud — it will be received at full strength."],
    goGently: ["Don't force a fast decision; pressure today reads as coldness.", "Avoid sarcasm — it lands deeper than intended."] },
  3: { headlines: ["Voice up, color on", "An expressive day"],
    outlooks: ["{name} is likely expressive today — talkative, funny, ideas arriving faster than they can be filed.", "{name} tends to process the world out loud today; the story they tell you IS the thinking."],
    landsWell: ["Room to talk it through, create, perform a little.", "Laughter and low-stakes plans."],
    goGently: ["Don't mistake the lightness for not caring — the depth is under the sparkle.", "Avoid heavy lectures; a story will carry what a rule won't."] },
  4: { headlines: ["Heads down, building", "A foundation day"],
    outlooks: ["{name} is likely in builder mode today — practical, order-seeking, low appetite for surprises.", "{name} tends to want structure today; a plan calms what a pep talk can't."],
    landsWell: ["Logistics, lists, fixing the thing that's been broken.", "Predictability — say what will happen, then let it happen."],
    goGently: ["Don't spring changes of plan without warning; today whiplash feels like disrespect.", "Avoid big emotional asks — today is for mortar, not murals."] },
  5: { headlines: ["Restless wind rising", "A change day"],
    outlooks: ["{name} is likely restless today — hungry for movement, novelty, air; routine will itch.", "{name} tends to test the fence today; the energy is freedom-seeking, not defiant for its own sake."],
    landsWell: ["A change of scene, a spontaneous detour, something new to try.", "Choices instead of ultimatums."],
    goGently: ["Don't tighten the rules today — pressure invites escape, not compliance.", "Avoid long sedentary stretches; the body needs to move first."] },
  6: { headlines: ["Heart on duty", "A care day"],
    outlooks: ["{name} is likely carrying the caretaker frequency today — attentive to who needs what, sometimes before their own needs.", "{name} tends to feel responsible for the room's wellbeing today; gratitude registers deeply."],
    landsWell: ["Being thanked specifically, not generally.", "Home-base comforts — a shared meal, a familiar ritual."],
    goGently: ["Don't take the care for granted or critique how it's given.", "Avoid offloading your own heavy load onto them today — they're already carrying."] },
  7: { headlines: ["Deep water, quiet surface", "An inward day"],
    outlooks: ["{name} is likely turned inward today — reflective, observant, needing more quiet than company.", "{name} tends to process below the surface today; silence is work, not withdrawal."],
    landsWell: ["Space without interrogation — be nearby, not probing.", "One real question, asked once, then let it breathe."],
    goGently: ["Don't read quiet as a problem to fix or a mood to punish.", "Avoid rapid-fire questions; today answers come slowly or not at all."] },
  8: { headlines: ["Strong current, clear channel", "A power day"],
    outlooks: ["{name} is likely running strong today — direct, capable, wanting to handle things and be trusted to.", "{name} tends to meet the material world head-on today: results, respect, and competence matter."],
    landsWell: ["Real responsibility and honest stakes — trust them with something that counts.", "Straight talk; respect is the love language today."],
    goGently: ["Don't micromanage or talk down; it will cost more than the task is worth.", "Avoid public correction — take it private or let it wait."] },
  9: { headlines: ["Tender under the surface", "A completion day"],
    outlooks: ["{name} is likely reflective and a little tender today — finishing, releasing, feeling things at full width.", "{name} tends toward the wider good today; old stories may surface wanting a gentler ending."],
    landsWell: ["Unhurried presence and being genuinely heard.", "Letting something end cleanly — a goodbye done well."],
    goGently: ["Don't open with demands; today starts soft or not at all.", "Avoid dredging old conflicts — release is the direction, not re-litigation."] },
  11: { headlines: ["Antenna up, signal strong", "An intuitive day"],
    outlooks: ["{name} is likely running the intuitive channel today — sensing what's unsaid, inspired in flashes, a little electrically sensitive.", "{name} tends to know things before they can say why today; hunches deserve a hearing."],
    landsWell: ["Ask what they're sensing — then actually listen to the answer.", "Creative sparks and meaningful conversation."],
    goGently: ["Don't flood the channel with noise, news, or other people's crises.", "Avoid dismissing a hunch as 'just a feeling' — today the feeling is data."] },
  22: { headlines: ["Master builder weather", "A make-it-real day"],
    outlooks: ["{name} is likely able to carry a big vision into concrete form today — the rare day where the dream and the workbench agree.", "{name} tends to think in structures today; an ambitious plan will feel like relief, not burden."],
    landsWell: ["The long-term conversation — building something that lasts.", "Concrete steps attached to the big idea."],
    goGently: ["Don't shrink the vision to something 'realistic' today; scale the steps, not the dream.", "Avoid frittering the day on trivia — this weather is rare."] },
  33: { headlines: ["Love in service", "A teacher-heart day"],
    outlooks: ["{name} is likely in giving mode today — love expressed as service, guidance offered without being asked.", "{name} tends to lift the people around them today; their steadiness is a resource others will lean on."],
    landsWell: ["Let them help — receiving gracefully is the gift back.", "Meaningful work in service of someone they love."],
    goGently: ["Don't let them give past empty; watch for the quiet overextension.", "Avoid cynicism today — it lands as a small betrayal."] },
};
const MONTH_TONE = {
  1: "Inside a personal month of new beginnings, that reads as a fresh chapter asking for a first step.",
  2: "Inside a personal month of patience and partnership, that plays out close to the heart.",
  3: "Inside a personal month of expression, that comes with extra voice and color.",
  4: "Inside a personal month of building, that favors the practical over the dramatic.",
  5: "Inside a personal month of change, that carries extra wind — expect the unexpected to feel normal.",
  6: "Inside a personal month of care and responsibility, that runs through home and the people in it.",
  7: "Inside a personal month of reflection, that thinks before it speaks.",
  8: "Inside a personal month of mastery, that measures itself by what gets handled.",
  9: "Inside a personal month of completion, that is quietly finishing an old story.",
  11: "Inside a personal month of heightened intuition, that trusts the signal under the noise.",
  22: "Inside a personal month of building the vision, that thinks in years, not days.",
  33: "Inside a personal month of service, that gives first and counts later.",
};

function firstName(displayName) {
  return String(displayName || "They").trim().split(/\s+/)[0] || "They";
}
function pickVariant(arr, seed) { return arr[hashStr(seed) % arr.length]; }

function forecastFor(member, dateStr) {
  const parts = parseBirthDate(dateStr);
  if (!parts || !member.birth) return null;
  const date = new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
  const cyc = personalCycles(member.birth, date);
  const lex = PD_LEXICON[cyc.personalDay] || PD_LEXICON[digRoot(cyc.personalDay, false)] || PD_LEXICON[1];
  const nm = firstName(member.displayName);
  const fill = (s) => s.replace(/\{name\}/g, nm);
  const seedBase = member.ref + ":" + dateStr;
  const outlook = fill(pickVariant(lex.outlooks, seedBase + ":outlook")) + " " + (MONTH_TONE[cyc.personalMonth] || "");
  return {
    date: dateStr,
    personalDay: cyc.personalDay,
    personalMonth: cyc.personalMonth,
    personalYear: cyc.personalYear,
    headline: pickVariant(lex.headlines, seedBase + ":headline"),
    outlook: outlook.trim(),
    landsWell: fill(pickVariant(lex.landsWell, seedBase + ":lands")),
    goGently: fill(pickVariant(lex.goGently, seedBase + ":gently")),
    framing: FRAMING,
  };
}

// ---------------------------------------------------------------------------
// Store — same load/save shape as the Credits store in server.js.
// ---------------------------------------------------------------------------
const Store = {
  data: { circles: [], members: [], partnerKeys: [] },
  load() {
    try {
      const d = JSON.parse(fs.readFileSync(CIRCLES_FILE, "utf8"));
      if (d && Array.isArray(d.circles) && Array.isArray(d.members)) this.data = d;
    } catch {}
    if (!Array.isArray(this.data.partnerKeys)) this.data.partnerKeys = [];
  },
  save() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(CIRCLES_FILE, JSON.stringify(this.data));
    } catch (e) { console.log("circles: persist failed:", e.message); }
  },
};
Store.load();

// Partner keys may also be seeded by env (AENIGMA_PARTNER_KEYS = JSON array
// of {name, keyHash, scopes}) — the production path, since the data file on
// a fresh deploy starts empty. File-store keys (seed script) merge in too.
function allPartnerKeys() {
  let envKeys = [];
  try {
    const raw = JSON.parse(process.env.AENIGMA_PARTNER_KEYS || "[]");
    if (Array.isArray(raw)) envKeys = raw.filter((k) => k && k.name && k.keyHash).map((k) => ({
      id: "env:" + k.name, partnerName: k.name, keyHash: k.keyHash,
      scopes: Array.isArray(k.scopes) ? k.scopes : ["forecast:read", "status:read"], revokedAt: k.revokedAt || null,
    }));
  } catch {}
  return [...envKeys, ...Store.data.partnerKeys];
}

const newId = (prefix) => prefix + crypto.randomBytes(9).toString("hex");
const keyHashOf = (key) => crypto.createHash("sha256").update(String(key)).digest("hex");

// Fixed-window limiter (per key/id), same spirit as server.js reflectHits.
const hitWindows = new Map();
function tooMany(id, limit, windowMs) {
  const now = Date.now();
  const rec = hitWindows.get(id) || { count: 0, start: now };
  if (now - rec.start > windowMs) { rec.count = 0; rec.start = now; }
  rec.count += 1;
  hitWindows.set(id, rec);
  if (hitWindows.size > 5000) hitWindows.clear();
  return rec.count > limit;
}

// ---------------------------------------------------------------------------
// Ask ÆNIGMA — local fallback (deterministic, used when the oracle chain is
// resting, exactly like localRead/localChat in server.js).
// ---------------------------------------------------------------------------
function localAsk(member, fc, circumstance) {
  const nm = firstName(member.displayName);
  const snap = member.profileSnapshot || {};
  const en = snap.enneagram ? ` As ${snap.enneagram.type} (${snap.enneagram.label}), ${nm}'s core motive runs toward ${String(snap.enneagram.motive).toLowerCase()}.` : "";
  return `${nm} would likely meet "${circumstance}" through today's weather first: ${fc ? fc.outlook : "a steady, ordinary current."}${en} What tends to land well: ${fc ? fc.landsWell.charAt(0).toLowerCase() + fc.landsWell.slice(1) : "a clear, unhurried ask."} And the gentle edge to respect: ${fc ? fc.goGently.charAt(0).toLowerCase() + fc.goGently.slice(1) : "give it room."} Read this as likelihood, not certainty — ${nm} is a person, not a pattern, and the living answer is the one they give you.`;
}

function memberSummary(member) {
  const s = member.profileSnapshot || {};
  const en = s.enneagram ? `Enneagram ${s.enneagram.type} — ${s.enneagram.label} (core motive: ${s.enneagram.motive})` : "";
  return [
    `${member.displayName} — ${member.role} in a ${member.circleType.replace("_", " & ")} circle.`,
    s.lifePath ? `Life Path ${s.lifePath} (${s.lifePathMeaning}); Birth Day ${s.birthDay}; Sun in ${s.sunSign} (${s.sunElement}); Codex ${s.codex}; ${en}.` : "",
  ].filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
function registerCircles(app, deps) {
  const { runChain, retrieveCorpus, Credits, AENIGMA_AGENT } = deps;
  const ownerKeyOf = (email) => Credits.key(email);

  const findOwnedMember = (email, id) => {
    const ok = ownerKeyOf(email);
    return Store.data.members.find((m) => m.id === id && m.ownerKey === ok) || null;
  };
  const publicMember = (m, dateStr) => {
    const forecastable = FORECASTABLE.has(m.consentStatus);
    return {
      id: m.id, ref: m.ref, circleId: m.circleId, circleType: m.circleType, role: m.role,
      displayName: m.displayName, consentStatus: m.consentStatus, forecastable,
      snapshot: forecastable ? m.profileSnapshot : null,
      forecast: forecastable ? forecastFor(m, dateStr) : null,
      // The owner shares this link while an invite is pending, or hands the
      // claim link to a managed child; the member keeps it to revoke later.
      invitePath: m.inviteToken && (m.consentStatus === "invited" || m.consentStatus === "managed")
        ? "/#/circles/invite/" + m.inviteToken
        : null,
      createdAt: m.createdAt,
    };
  };

  // ---- owner's circle, with today's forecasts ------------------------------
  app.get("/api/circles", (req, res) => {
    const email = String(req.query.email || "");
    if (!Credits.validEmail(email)) return res.status(400).json({ error: "valid email required" });
    const ok = ownerKeyOf(email);
    const dateStr = parseBirthDate(String(req.query.date || "")) ? String(req.query.date) : isoDate(new Date());
    const members = Store.data.members.filter((m) => m.ownerKey === ok).map((m) => publicMember(m, dateStr));
    res.json({ date: dateStr, framing: FRAMING, members });
  });

  // ---- add a member (managed child, or an invite) ---------------------------
  app.post("/api/circles/members", (req, res) => {
    const { email, type, role, displayName, birthDate, birthTime, birthPlace } = req.body || {};
    if (!Credits.validEmail(email)) return res.status(400).json({ error: "valid email required" });
    if (!CIRCLE_TYPES.has(String(type || ""))) return res.status(400).json({ error: "unknown circle type" });
    const rl = ROLES.has(String(role || "")) ? String(role) : (type === "parent_child" ? "child" : type);
    const name = String(displayName || "").trim().slice(0, 60);
    if (!name) return res.status(400).json({ error: "displayName required" });
    const ok = ownerKeyOf(email);

    let circle = Store.data.circles.find((c) => c.ownerKey === ok && c.type === type);
    if (!circle) {
      circle = { id: newId("c_"), ownerKey: ok, type, createdAt: new Date().toISOString() };
      Store.data.circles.push(circle);
    }
    const member = {
      id: newId("m_"), ref: newId("mref_"), circleId: circle.id, circleType: type, role: rl,
      displayName: name, birth: null, birthTime: "", birthPlace: "",
      profileSnapshot: null, consentStatus: "invited",
      inviteToken: crypto.randomBytes(18).toString("hex"),
      ownerKey: ok, createdAt: new Date().toISOString(),
    };

    if (birthDate) {
      // Owner-entered birth data is the parent-managed path ONLY (a child in
      // a parent & child circle). Adults enter their own data on the invite
      // page — that entry IS their consent.
      if (!(type === "parent_child" && rl === "child")) {
        return res.status(400).json({ error: "Partners and family add their own birth date through the invite link — that step is their consent. Send them the invite instead." });
      }
      const b = parseBirthDate(birthDate);
      if (!b) return res.status(400).json({ error: "birthDate must be a valid YYYY-MM-DD date" });
      member.birth = b;
      member.birthTime = String(birthTime || "").trim().slice(0, 10);
      member.birthPlace = String(birthPlace || "").trim().slice(0, 80);
      member.profileSnapshot = computeSnapshot(b, name);
      member.consentStatus = "managed";
    }
    Store.data.members.push(member);
    Store.save();
    res.json({ member: publicMember(member, isoDate(new Date())) });
  });

  // ---- revoke (owner-side; effective immediately, everywhere) ---------------
  app.post("/api/circles/members/:id/revoke", (req, res) => {
    const { email } = req.body || {};
    if (!Credits.validEmail(email)) return res.status(400).json({ error: "valid email required" });
    const m = findOwnedMember(email, req.params.id);
    if (!m) return res.status(404).json({ error: "member not found" });
    m.consentStatus = "revoked";
    Store.save();
    res.json({ member: publicMember(m, isoDate(new Date())) });
  });

  // ---- Ask ÆNIGMA about a member --------------------------------------------
  app.post("/api/circles/members/:id/ask", async (req, res) => {
    const { email, circumstance, ownerBirthDate } = req.body || {};
    if (!Credits.validEmail(email)) return res.status(400).json({ error: "valid email required" });
    const m = findOwnedMember(email, req.params.id);
    if (!m) return res.status(404).json({ error: "member not found" });
    if (!FORECASTABLE.has(m.consentStatus)) {
      return res.status(403).json({ error: "This member is not sharing forecasts right now — consent is not active." });
    }
    const q = String(circumstance || "").trim().slice(0, 500);
    if (!q) return res.status(400).json({ error: "circumstance required" });
    if (tooMany("ask:" + req.ip, 20, 5 * 60 * 1000)) {
      return res.status(429).json({ error: "The field needs a moment — ask again shortly." });
    }
    // Metered as an architect message (2 credits), same wallet as the app.
    const spend = Credits.consume(email, "circles_ask", 2);
    if (!spend.ok) return res.status(402).json({ ok: false, error: "insufficient credits", balance: spend.balance, needed: 2 });

    const today = isoDate(new Date());
    const fc = forecastFor(m, today);
    let synastry = "";
    const ob = parseFlexibleDate(ownerBirthDate || "");
    if (ob && m.profileSnapshot) {
      const ownerSnap = computeSnapshot(ob, "Owner");
      const pair = reduceNum(reduceNum(ownerSnap.lifePath, false) + reduceNum(m.profileSnapshot.lifePath, false));
      synastry = `SYNASTRY (owner ↔ member): owner's Life Path ${ownerSnap.lifePath}, Sun in ${ownerSnap.sunSign} (${ownerSnap.sunElement}); member's Sun in ${m.profileSnapshot.sunSign} (${m.profileSnapshot.sunElement}). Pair resonance number ${pair} — ${NUM_MEANING[pair] || ""}. Elements: ${ownerSnap.sunElement} meets ${m.profileSnapshot.sunElement}.`;
    }
    const passages = retrieveCorpus(q, 2);
    const registry = passages.length ? `RELEVANT PASSAGES FROM THE REGISTRY:\n${passages.join("\n— — —\n")}` : "";
    const system = [
      AENIGMA_AGENT,
      `CIRCLES — REACTION READING. The user keeps a circle of loved ones in ÆNIGMA and asks how one member would LIKELY react to a circumstance. Answer about the MEMBER (third person), warmly and concretely, 120–220 words, conversational prose (no headers, no lists). Ground every claim in the member's profile, today's cycles, and today's forecast given below. Use likelihood language throughout ("likely", "tends to") — this is a symbolic lens, NEVER a prediction, a diagnosis, or a claim about their mental health. End with one gentle, practical suggestion for how the user might approach them today. If the circumstance suggests the member may be in crisis or at risk of harm, drop the symbolic framing and respond plainly and caringly, encouraging real-world support (in the US, call or text 988).`,
      `MEMBER PROFILE (computed, exact): ${memberSummary(m)}`,
      fc ? `TODAY'S FORECAST FOR ${firstName(m.displayName).toUpperCase()} (${today}, Personal Year ${fc.personalYear}, Month ${fc.personalMonth}, Day ${fc.personalDay} — ${NUM_MEANING[fc.personalDay] || ""}): headline "${fc.headline}". ${fc.outlook} Lands well: ${fc.landsWell} Go gently: ${fc.goGently}` : "",
      synastry,
      registry,
    ].filter(Boolean).join("\n\n");
    const messages = [{ role: "user", content: `How would ${firstName(m.displayName)} likely react to this: ${q}` }];
    const result = await runChain(system, messages, "circles-ask", { minWords: 40, maxWords: 340 });
    if (result) return res.json({ reply: result.text, source: result.source, balance: spend.balance });
    return res.json({ reply: localAsk(m, fc, q), source: "local", balance: spend.balance });
  });

  // ---- invite: what the recipient sees (no owner data, no birth data) ------
  const inviterLabel = (m) => m.circleType === "parent_child" ? "your parent" : m.circleType === "partner" ? "your partner" : "a family member";
  const findByToken = (token) => Store.data.members.find((m) => m.inviteToken && m.inviteToken === String(token || "")) || null;

  app.get("/api/circles/invite/:token", (req, res) => {
    const m = findByToken(req.params.token);
    if (!m) return res.status(404).json({ error: "invite not found" });
    res.json({
      circleType: m.circleType, role: m.role, displayName: m.displayName,
      consentStatus: m.consentStatus, inviterLabel: inviterLabel(m),
      shared: "Only your daily forecast text — never your birth data — is shared with the person who invited you.",
      framing: FRAMING,
    });
  });

  // ---- invite accept (member enters their OWN birth data = consent) -------
  app.post("/api/circles/invite/:token/accept", (req, res) => {
    const m = findByToken(req.params.token);
    if (!m) return res.status(404).json({ error: "invite not found" });
    if (m.consentStatus === "revoked") return res.status(403).json({ error: "This invitation was withdrawn." });
    if (m.consentStatus === "accepted") return res.status(409).json({ error: "Already accepted — you are sharing your forecast." });
    const { birthDate, birthTime, birthPlace, displayName } = req.body || {};
    const b = parseBirthDate(birthDate);
    if (!b) return res.status(400).json({ error: "birthDate must be a valid YYYY-MM-DD date" });
    m.birth = b;
    m.birthTime = String(birthTime || "").trim().slice(0, 10);
    m.birthPlace = String(birthPlace || "").trim().slice(0, 80);
    if (displayName && String(displayName).trim()) m.displayName = String(displayName).trim().slice(0, 60);
    m.profileSnapshot = computeSnapshot(b, m.displayName);
    m.consentStatus = "accepted"; // invited → accepted; managed → claimed & accepted
    Store.save();
    res.json({ ok: true, consentStatus: m.consentStatus, displayName: m.displayName });
  });

  // ---- invite revoke (member-side, from their own link) ---------------------
  app.post("/api/circles/invite/:token/revoke", (req, res) => {
    const m = findByToken(req.params.token);
    if (!m) return res.status(404).json({ error: "invite not found" });
    m.consentStatus = "revoked";
    Store.save();
    res.json({ ok: true, consentStatus: m.consentStatus });
  });

  // ---- partner API ------------------------------------------------------------
  function partnerAuth(req, res, next) {
    const hdr = String(req.headers.authorization || "");
    const key = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : String(req.headers["x-api-key"] || "").trim();
    if (!key) return res.status(401).json({ error: "partner api key required" });
    const h = keyHashOf(key);
    const rec = allPartnerKeys().find((k) => k.keyHash === h && !k.revokedAt);
    if (!rec) return res.status(401).json({ error: "invalid partner api key" });
    if (tooMany("partner:" + rec.id, 120, 5 * 60 * 1000)) {
      return res.status(429).json({ error: "rate limit — 120 requests per 5 minutes per key" });
    }
    req.partner = rec;
    next();
  }
  const needScope = (scope) => (req, res, next) => {
    if (!req.partner.scopes.includes(scope)) return res.status(403).json({ error: "missing scope: " + scope });
    next();
  };

  app.get("/api/partner/v1/forecast", partnerAuth, needScope("forecast:read"), (req, res) => {
    const ref = String(req.query.memberRef || "");
    const m = Store.data.members.find((x) => x.ref === ref) || null;
    if (!m) return res.status(404).json({ error: "member not found" });
    if (!FORECASTABLE.has(m.consentStatus)) {
      return res.status(403).json({ error: "consent_not_active", consentStatus: m.consentStatus });
    }
    const dateStr = String(req.query.date || isoDate(new Date()));
    if (!parseBirthDate(dateStr)) return res.status(400).json({ error: "date must be YYYY-MM-DD" });
    const fc = forecastFor(m, dateStr);
    // Forecast outputs ONLY — never birth data, never profile internals.
    res.json({
      memberRef: m.ref, date: fc.date,
      headline: fc.headline, outlook: fc.outlook,
      landsWell: fc.landsWell, goGently: fc.goGently,
      framing: fc.framing,
    });
  });

  app.get("/api/partner/v1/members/:memberRef/status", partnerAuth, needScope("status:read"), (req, res) => {
    const m = Store.data.members.find((x) => x.ref === req.params.memberRef) || null;
    if (!m) return res.status(404).json({ error: "member not found" });
    res.json({ memberRef: m.ref, consentStatus: m.consentStatus });
  });

  console.log("circles: module registered (" + Store.data.members.length + " members, " + allPartnerKeys().length + " partner keys)");
}

module.exports = { registerCircles, forecastFor, computeSnapshot, personalCycles, _store: Store };
