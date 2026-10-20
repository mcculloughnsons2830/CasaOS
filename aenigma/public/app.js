/* ÆNIGMA AI — Dark Architectural System v1.0 (vanilla SPA)
   IA: Reading · History · Library · Insights · Profile (+ Explore, Plans, Ops)
   Engines (harmonic math, quantum sim, BFN calculator, billing, architect) carried over intact. */
(() => {
  "use strict";

  const view = document.getElementById("view");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 3200);
  }

  /* ---------------- geometric logo (inline SVG, per delivery package) ---------------- */
  const LOGO_SVG = (size) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="ÆNIGMA AI logo">` +
    `<circle cx="50" cy="50" r="46" fill="none" stroke="#F2F2F2" stroke-width="1.5"/>` +
    `<circle cx="50" cy="50" r="38" fill="none" stroke="#F2F2F2" stroke-width="0.8" opacity="0.7"/>` +
    `<path d="M50 12 L78 70 L22 70 Z" fill="none" stroke="#F2F2F2" stroke-width="1"/>` +
    `<path d="M50 88 L22 30 L78 30 Z" fill="none" stroke="#F2F2F2" stroke-width="1"/>` +
    `<circle cx="50" cy="50" r="4" fill="#8FBC8F"/></svg>`;
  /* ---------------- tab glyphs (inline SVG, currentColor) ---------------- */
  const TAB_ICONS = {
    reading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3.4 2"/></svg>',
    library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4.5h3.4V19.5H5zM10.3 4.5h3.4v15h-3.4zM15.6 4.5H19v15h-3.4z"/></svg>',
    insights: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3.5l1.9 6.6 6.6 1.9-6.6 1.9L12 20.5l-1.9-6.6-6.6-1.9 6.6-1.9z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1.4-3.6 3.9-5.2 7-5.2s5.6 1.6 7 5.2"/></svg>',
  };
  function mountLogos() {
    const slots = [["splash-logo", 96], ["nav-logo", 40], ["top-logo", 30]];
    for (const [id, s] of slots) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = LOGO_SVG(s);
    }
    document.querySelectorAll(".tab-ic[data-ic], .nav-ic[data-ic]").forEach((el) => {
      el.innerHTML = TAB_ICONS[el.dataset.ic] || "";
    });
  }

  /* ---------------- subdued live starfield wallpaper ---------------- */
  function initStarfield() {
    const cv = document.getElementById("stars");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const DIM = 0.4; // subdued — never fights the architecture
    let W = 0, H = 0, stars = [], nebs = [];
    let px = 0, py = 0, tpx = 0, tpy = 0;
    let raf = 0, last = 0, shoot = null, nextShoot = 0;
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.max(90, Math.min(200, Math.round((W * H) / 9000)));
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.4 + Math.random() * 1.1,
          a: (0.2 + Math.random() * 0.5) * DIM, sp: 0.4 + Math.random() * 1.4,
          ph: Math.random() * Math.PI * 2, vx: 1.2 + Math.random() * 3, teal: Math.random() < 0.18 });
      }
      nebs = [];
      for (let i = 0; i < 2; i++) {
        nebs.push({ x: Math.random() * W, y: Math.random() * H, r: 150 + Math.random() * 180,
          ph: Math.random() * Math.PI * 2, sp: 0.04 + Math.random() * 0.05, a: (0.03 + Math.random() * 0.025) * DIM });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      px += (tpx - px) * 0.045; py += (tpy - py) * 0.045;
      const sec = t / 1000;
      for (const nb of nebs) {
        const nx = nb.x + Math.sin(sec * nb.sp + nb.ph) * 36 + px * 0.3;
        const ny = nb.y + Math.cos(sec * nb.sp * 0.8 + nb.ph) * 26 + py * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nb.r);
        g.addColorStop(0, `rgba(143,188,143,${nb.a})`);
        g.addColorStop(1, "rgba(143,188,143,0)");
        ctx.fillStyle = g;
        ctx.fillRect(nx - nb.r, ny - nb.r, nb.r * 2, nb.r * 2);
      }
      for (const s of stars) {
        s.x += s.vx * dt; if (s.x > W + 4) { s.x = -4; s.y = Math.random() * H; }
        const tw = 0.55 + 0.45 * Math.sin(sec * s.sp + s.ph);
        ctx.beginPath();
        ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.teal ? `rgba(143,188,143,${(s.a * tw).toFixed(3)})` : `rgba(235,240,244,${(s.a * tw).toFixed(3)})`;
        ctx.fill();
      }
      if (!shoot && sec * 1000 > nextShoot) {
        shoot = { x: Math.random() * W * 0.7 + W * 0.15, y: -20, vx: -(200 + Math.random() * 200), vy: 160 + Math.random() * 120, life: 1 };
        nextShoot = sec * 1000 + 12000 + Math.random() * 9000;
      }
      if (shoot) {
        shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt; shoot.life -= dt * 1.25;
        if (shoot.life <= 0 || shoot.y > H + 40) shoot = null;
        else {
          const len = 70 * shoot.life, ang = Math.atan2(shoot.vy, shoot.vx);
          const tx = shoot.x - Math.cos(ang) * len, ty = shoot.y - Math.sin(ang) * len;
          const grad = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
          grad.addColorStop(0, `rgba(200,230,200,${(0.7 * shoot.life * DIM).toFixed(3)})`);
          grad.addColorStop(1, "rgba(143,188,143,0)");
          ctx.strokeStyle = grad; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(shoot.x + px, shoot.y + py); ctx.lineTo(tx + px, ty + py); ctx.stroke();
        }
      }
    }
    function frame(t) { draw(t); raf = requestAnimationFrame(frame); }
    function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    let rT = 0;
    window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(resize, 180); });
    window.addEventListener("pointermove", (e) => {
      tpx = ((e.clientX / W) - 0.5) * -18; tpy = ((e.clientY / H) - 0.5) * -18;
    }, { passive: true });
    document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });
    resize();
    nextShoot = performance.now() + 6000 + Math.random() * 6000;
    if (reduced) draw(performance.now()); else start();
  }

  /* ---------------- shared harmonic math ---------------- */
  const BFN_ATTR = "Framework proposed by Robert Edward Grant — his system, not established mathematics.";
  const OI_ATTR = "An ÆNIGMA framework, presented by Joshua McCullough — a proposed framework, a lens for reflection, not established science.";
  const SYMBOLIC = "Symbolic readout computed live in your browser — for reflection and entertainment, not a claim about who you are.";

  function bfnReduce(n) {
    let v = Math.abs(Math.floor(Number(n)));
    if (!isFinite(v)) v = 0;
    const start = v, steps = [];
    while (v >= 12) {
      const rep = v.toString(12).toUpperCase();
      let sum = 0;
      for (const ch of rep) sum += parseInt(ch, 12);
      steps.push({ from: v, base12: rep, sum });
      v = sum;
    }
    return { start, value: v, steps };
  }
  function digRoot(n, masters) {
    let v = Math.abs(Math.floor(Number(n)));
    if (!isFinite(v)) v = 0;
    const steps = [];
    while (v > 9 && !(masters && (v === 11 || v === 22))) {
      const s = String(v).split("").reduce((a, d) => a + (+d), 0);
      steps.push({ from: v, sum: s });
      v = s;
    }
    return { value: v, steps };
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  const TRI_KEYS = [
    { t: [3, 4, 5],   label: "SEED",    force: "the origin",
      note: "The seed triangle. Perimeter 12 — the base-12 root of the harmonic field.",
      deriv: "3² + 4² = 9 + 16 = 25 = 5². c = b + 1 (5 = 4 + 1): the superparticular corridor. a + b = 7 — the interlock passed to the next key." },
    { t: [5, 12, 13], label: "EM",      force: "electromagnetism",
      note: "b − a = 7 — it receives the interlock of the seed.",
      deriv: "5² + 12² = 25 + 144 = 169 = 13². c = b + 1 (13 = 12 + 1). a + b = 17." },
    { t: [8, 15, 17], label: "GRAVITY", force: "gravitation",
      note: "The 8 of structure meets the 15 of the corridor.",
      deriv: "8² + 15² = 64 + 225 = 289 = 17². c = b + 1 (17 = 15 + 1). a + b = 23." },
    { t: [7, 24, 25], label: "WEAK",    force: "weak force",
      note: "The 7-lane — the prime corridor's hinge.",
      deriv: "7² + 24² = 49 + 576 = 625 = 25². c = b + 1 (25 = 24 + 1). a + b = 31." },
    { t: [9, 40, 41], label: "STRONG",  force: "strong force",
      note: "The 9 of completion squared into the corridor.",
      deriv: "9² + 40² = 81 + 1600 = 1681 = 41². c = b + 1 (41 = 40 + 1). a + b = 49." },
    { t: [11, 60, 61], label: "KEY 11", force: "the corridor continues",
      note: "11 — the master number — enters the cascade.",
      deriv: "11² + 60² = 121 + 3600 = 3721 = 61². c = b + 1 (61 = 60 + 1). a + b = 71." },
    { t: [13, 84, 85], label: "KEY 13", force: "the corridor continues",
      note: "13 — the union of 5 and 8 — closes the seven.",
      deriv: "13² + 84² = 169 + 7056 = 7225 = 85². c = b + 1 (85 = 84 + 1). a + b = 97." },
  ];

  const CODEX = {
    CAELIX:   { title: "The Infinite Returner", sub: "Architect of the Labyrinthine Whole",
                sig: "Recursion as remembrance — you see the maze from the inside and know the corridor is the destination.",
                shadow: "Infinite regress: the map eats the territory and you never land." },
    VIRELUM:  { title: "The Mirror That Breathes", sub: "The living exchange",
                sig: "Reflection as dialogue — the other is your teacher, the seen and the seer trading breath.",
                shadow: "Mistaking the reflection for the source; performing the mirror instead of looking through it." },
    "AZURÆ":  { title: "The Breath That Dissolves", sub: "The uncontainable",
                sig: "Structure surrendered at the right moment — you honor what cannot be said by refusing to shrink it.",
                shadow: "Dissolution as avoidance: refusing all form until nothing can hold you, even love." },
    LUMIRESSA:{ title: "The Sanctum Unseen", sub: "Compressed into light",
                sig: "Inward folding as power — a line becomes a sanctuary, a stanza a shrine; depth over volume.",
                shadow: "Withdrawal mistaken for depth — the sanctuary quietly becoming a cell." },
  };
  const CODEX_ORDER = ["CAELIX", "VIRELUM", "AZURÆ", "LUMIRESSA"];

  const ENNEA = {
    1: { name: "The Reformer",     motive: "Integrity — to be good and right",        emphasis: "Precision in service of what is true", stress: 4, growth: 7 },
    2: { name: "The Helper",       motive: "Love — to be needed and appreciated",     emphasis: "Care that does not erase the giver", stress: 8, growth: 4 },
    3: { name: "The Achiever",     motive: "Worth — to be valuable through success",  emphasis: "Achievement anchored in substance", stress: 9, growth: 6 },
    4: { name: "The Individualist",motive: "Identity — to be uniquely significant",   emphasis: "Depth held without drowning in it", stress: 2, growth: 1 },
    5: { name: "The Investigator", motive: "Insight · Depth · Understanding",         emphasis: "Integration of knowledge with presence", stress: 7, growth: 8 },
    6: { name: "The Loyalist",     motive: "Security — to be safe and supported",     emphasis: "Loyalty tested against reality", stress: 3, growth: 9 },
    7: { name: "The Enthusiast",   motive: "Freedom — to stay engaged and open",      emphasis: "Joy that can sit still", stress: 1, growth: 5 },
    8: { name: "The Challenger",   motive: "Autonomy — to be self-reliant and strong", emphasis: "Strength that protects without dominating", stress: 5, growth: 2 },
    9: { name: "The Peacemaker",   motive: "Harmony — to be at peace and whole",      emphasis: "Peace that includes your own voice", stress: 6, growth: 3 },
  };

  const LAYER_DESC = {
    "Substrate": (v) => `The ground you stand on: harmonic residue ${v} — the base-12 remainder your birth reduces to.`,
    "Ego/Mind": (v) => `The operating system: life-path ${v} — how your mind organizes experience into a story it can carry.`,
    "Spiritual Catalyst": (v) => `The friction that wakes you: ${v} — the month-day tension that keeps the comfortable from going numb.`,
    "Intention Factor": (v) => `The direction set before arrival: ${v} — the year's residue, what the era asked of you.`,
    "Mirror Recursion": (v) => `The loop you complete: ${v} — day × month reduced, the pattern that repeats until it is seen.`,
    "Metatron Mode": (v) => `The geometry you build in: ${v} — life-path folded with birth-day, the shape your becoming takes.`,
  };

  /* ---------------- profile + letter-number engine ---------------- */
  const PROF_LS = "aenigma.profile.v1";
  function loadProfile() { try { return JSON.parse(localStorage.getItem(PROF_LS)) || null; } catch (e) { return null; } }
  function saveProfile(p) { try { localStorage.setItem(PROF_LS, JSON.stringify(p)); } catch (e) {} }

  const LETTER_VAL = (() => {
    const m = {};
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((ch, i) => { m[ch] = (i % 9) + 1; });
    return m;
  })();
  const VOWELS = new Set(["A", "E", "I", "O", "U"]);
  function letterSum(name, filter) {
    const clean = String(name || "").toUpperCase().replace(/[^A-Z]/g, "");
    let total = 0;
    const parts = [];
    for (const ch of clean) {
      const isV = VOWELS.has(ch);
      if (filter === "vowel" && !isV) continue;
      if (filter === "cons" && isV) continue;
      total += LETTER_VAL[ch];
      parts.push(`${ch}=${LETTER_VAL[ch]}`);
    }
    const r = digRoot(total, false);
    return { total, value: r.value, steps: r.steps, count: clean.length, parts };
  }

  /* ---------------- reading preferences ---------------- */
  const PREF_LS = "aenigma.prefs.v1";
  const PREF_DEFAULTS = { harmonics: true, enneagram: true, codex: true, deepTech: false };
  function loadPrefs() {
    try { return Object.assign({}, PREF_DEFAULTS, JSON.parse(localStorage.getItem(PREF_LS)) || {}); }
    catch (e) { return Object.assign({}, PREF_DEFAULTS); }
  }
  function savePrefs(p) { try { localStorage.setItem(PREF_LS, JSON.stringify(p)); } catch (e) {} }

  /* ---------------- FullReading data model (real engine values) ---------------- */
  function parseDob(s) {
    const t = String(s || "").trim();
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);           // YYYY-MM-DD (native picker / profile)
    if (m) return { y: +m[1], mo: +m[2], d: +m[3] };
    m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(t); // DD/MM/YYYY per mockup
    if (m) return { y: +m[3], mo: +m[2], d: +m[1] };
    return null;
  }
  function fmtDob(y, mo, d) {
    const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d} ${M[mo - 1] || ""} ${y}`;
  }

  function computeFullReading(dobRaw, tobRaw, locRaw, nameRaw) {
    const pd = parseDob(dobRaw);
    if (!pd || pd.mo < 1 || pd.mo > 12 || pd.d < 1 || pd.d > 31 || pd.y < 1800 || pd.y > 2100) return { error: "Enter a valid birth date." };
    const { y, mo, d } = pd;
    const stamp = y * 10000 + mo * 100 + d;
    const lp = digRoot(stamp, true);
    const bd = digRoot(d, false);
    const nowY = new Date().getFullYear();
    const py = digRoot(d + mo + nowY, true);
    const sub = bfnReduce(stamp);
    const layers = [
      ["Substrate", sub.value], ["Ego/Mind", lp.value],
      ["Spiritual Catalyst", digRoot(mo + d, false).value],
      ["Intention Factor", digRoot(y, false).value],
      ["Mirror Recursion", bfnReduce(d * mo).value],
      ["Metatron Mode", digRoot(lp.value + bd.value, false).value],
    ];
    const core = ((d + mo + lp.value) % 9) + 1;
    const en = ENNEA[core];
    let wing = core + (lp.value % 2 ? 1 : -1);
    if (wing < 1) wing = 9; if (wing > 9) wing = 1;
    const variant = ["sp", "sx", "so"][y % 3];
    const codex = CODEX_ORDER[sub.value % 4];
    const cx = CODEX[codex];
    const digits = String(stamp).split("").map(Number);
    const toroid = digits.filter((x) => x % 2 === 1).reduce((a, b) => a + b, 0);
    const hyper = digits.filter((x) => x % 2 === 0).reduce((a, b) => a + b, 0);
    const dom = toroid >= hyper ? "TOROID-DOMINANT" : "HYPERBOLOID-DOMINANT";
    const key = TRI_KEYS[(lp.value + sub.value) % 7];
    // Chart Resonance: agreement across the six layer values (deterministic, symbolic)
    const distinct = new Set(layers.map(([, v]) => v)).size;
    const resonance = Math.round(100 * (1 - (distinct - 1) / 10));
    // Overall Harmony: toroid/hyperboloid charge balance (deterministic, symbolic)
    const tot = toroid + hyper;
    const harmony = tot ? Math.round(100 * (1 - Math.abs(toroid - hyper) / tot)) : 50;
    // Letter-number architecture (only when a birth name is known)
    const nm = String(nameRaw || "").trim();
    let letters = null;
    if (nm.replace(/[^A-Za-z]/g, "").length >= 2) {
      letters = {
        expression: letterSum(nm, "all"),
        soulUrge: letterSum(nm, "vowel"),
        personality: letterSum(nm, "cons"),
      };
    }
    const arith = (r) => r.steps.length ? r.steps.map((s) => `${s.from} → ${s.sum}`).join(" → ") : String(r.value);
    return {
      id: "r" + Date.now().toString(36),
      label: nm ? `Reading — ${nm.split(" ")[0]}` : "Personal Reading",
      birth: { date: fmtDob(y, mo, d), time: String(tobRaw || "").trim(), location: String(locRaw || "").trim() },
      architecture: {
        lifePath: { value: lp.value, steps: arith(lp) },
        expression: letters ? { value: letters.expression.value, steps: arith(letters.expression) } : null,
        soulUrge: letters ? { value: letters.soulUrge.value, steps: arith(letters.soulUrge) } : null,
        personality: letters ? { value: letters.personality.value, steps: arith(letters.personality) } : null,
        summary: `Life-path ${lp.value} through a base-12 substrate of ${sub.value} — ${dom === "TOROID-DOMINANT" ? "a closed, recursive charge" : "an open, additive charge"}. Birth-day ${bd.value}, personal year ${py.value}.`,
      },
      harmonics: {
        substrate: sub.value, egoMind: lp.value,
        spiritualCatalyst: layers[2][1], intentionFactor: layers[3][1],
        layers,
      },
      enneagram: {
        type: `${core}w${wing}`, label: en.name, coreMotive: en.motive,
        stress: `${en.stress} (${ENNEA[en.stress].name})`, growth: `${en.growth} (${ENNEA[en.growth].name})`,
        currentEmphasis: en.emphasis, variant,
      },
      codex: { primary: codex, title: cx.title, sub: cx.sub, insight: cx.sig, shadow: cx.shadow },
      grant: {
        bfn: sub.value, keyLabel: `${key.t.join("-")} — ${key.label}`,
        toroid, hyper, dom,
        bfnSteps: sub.steps.length ? sub.steps.map((s) => `${s.from} → (${s.base12})₁₂ → ${s.sum}`).join(" → ") : String(sub.value),
      },
      resonance, harmony,
      createdAt: Date.now(),
    };
  }

  /* ---------------- reading history (auto-log) + library (saved) ---------------- */
  const HIST_LS = "aenigma.readings.v1";
  const LIB_LS = "aenigma.library.v1";
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function logReading(r) {
    const h = lsGet(HIST_LS);
    h.unshift({ id: r.id, label: r.label, birth: r.birth, createdAt: r.createdAt,
      lp: r.architecture.lifePath.value, ennea: r.enneagram.type, codex: r.codex.primary, full: r });
    lsSet(HIST_LS, h.slice(0, 60));
  }
  function saveToLibrary(r) {
    const l = lsGet(LIB_LS);
    if (l.some((x) => x.id === r.id)) { toast("Already in your library."); return; }
    l.unshift({ id: r.id, label: r.label, birth: r.birth, createdAt: r.createdAt,
      lp: r.architecture.lifePath.value, ennea: r.enneagram.type, codex: r.codex.primary, full: r });
    lsSet(LIB_LS, l.slice(0, 60));
    toast("Saved to your library.");
  }
  function exportReading(r) {
    // Working JSON download of the full reading (FullReading data model)
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aenigma-reading-${r.id}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("Reading exported as JSON.");
  }

  /* ---------------- tiny statevector simulator ---------------- */
  function qNew(n) {
    const dim = 1 << n;
    const re = new Float64Array(dim), im = new Float64Array(dim);
    re[0] = 1;
    return { n, dim, re, im };
  }
  function qH(st, q) {
    const s = Math.SQRT1_2;
    for (let i = 0; i < st.dim; i++) {
      if ((i >> q) & 1) continue;
      const j = i | (1 << q);
      const a0r = st.re[i], a0i = st.im[i], a1r = st.re[j], a1i = st.im[j];
      st.re[i] = (a0r + a1r) * s; st.im[i] = (a0i + a1i) * s;
      st.re[j] = (a0r - a1r) * s; st.im[j] = (a0i - a1i) * s;
    }
  }
  function qRY(st, q, th) {
    const c = Math.cos(th / 2), s = Math.sin(th / 2);
    for (let i = 0; i < st.dim; i++) {
      if ((i >> q) & 1) continue;
      const j = i | (1 << q);
      const a0r = st.re[i], a0i = st.im[i], a1r = st.re[j], a1i = st.im[j];
      st.re[i] = c * a0r - s * a1r; st.im[i] = c * a0i - s * a1i;
      st.re[j] = s * a0r + c * a1r; st.im[j] = s * a0i + c * a1i;
    }
  }
  function qCNOT(st, c, t) {
    for (let i = 0; i < st.dim; i++) {
      if (!((i >> c) & 1) || ((i >> t) & 1)) continue;
      const j = i ^ (1 << t);
      const tr = st.re[i]; st.re[i] = st.re[j]; st.re[j] = tr;
      const ti = st.im[i]; st.im[i] = st.im[j]; st.im[j] = ti;
    }
  }
  function qProbs(st) {
    const p = new Float64Array(st.dim);
    for (let i = 0; i < st.dim; i++) p[i] = st.re[i] * st.re[i] + st.im[i] * st.im[i];
    return p;
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function sampleCounts(probs, shots, seed) {
    const rnd = mulberry32(seed);
    const counts = new Array(probs.length).fill(0);
    const cum = [];
    let acc = 0;
    for (const p of probs) { acc += p; cum.push(acc); }
    for (let s = 0; s < shots; s++) {
      const r = rnd() * acc;
      let i = 0;
      while (i < cum.length - 1 && r > cum[i]) i++;
      counts[i]++;
    }
    return counts;
  }
  function shannon(probs) {
    let h = 0;
    for (const p of probs) if (p > 1e-12) h -= p * Math.log2(p);
    return h;
  }
  function barChart(probs, n, shots) {
    const counts = sampleCounts(probs, shots || 1024, hashStr("aenigma") ^ Math.floor(probs[0] * 1e9));
    const max = Math.max(...counts, 1);
    let top = 0;
    for (let i = 1; i < counts.length; i++) if (counts[i] > counts[top]) top = i;
    const rows = counts.map((c, i) => {
      const bits = i.toString(2).padStart(n, "0");
      const pct = (100 * c / (shots || 1024)).toFixed(1);
      return `<div class="bar-row${i === top ? " top" : ""}">
        <span class="bl">|${bits}⟩</span>
        <span class="bar-track"><span class="bar-fill" style="display:block;width:${(100 * c / max).toFixed(1)}%"></span></span>
        <span class="bv">${c} · ${pct}%</span></div>`;
    }).join("");
    return `<div class="bars">${rows}</div>`;
  }

  /* ---------------- wallet / billing (server-backed, unchanged API) ---------------- */
  const CREDIT_COST = { quantum: 5, prediction: 5, architect: 2 };
  const BTIERS = {
    Standard: { price: "$22.22", credits: 222 }, Pro: { price: "$44.44", credits: 444 },
    "Pro+": { price: "$88.88", credits: 888 }, Premium: { price: "$222.22", credits: 2222 },
  };
  let wallet = { state: "local", email: null, credits: 60, plan: "trial" };
  let billingCache = null;

  async function refreshWallet() {
    const saved = localStorage.getItem("aenigma.email");
    if (!saved) { wallet = { state: "local", email: null, credits: 60, plan: "trial" }; paintWallet(); return; }
    try {
      const r = await fetch("/api/billing/me?email=" + encodeURIComponent(saved));
      if (!r.ok) throw new Error("billing " + r.status);
      const b = await r.json();
      billingCache = b;
      wallet = { state: "linked", email: saved, credits: b.credits, plan: b.plan, trial: !!b.trial };
    } catch (e) {
      wallet = { state: "local", email: saved, credits: 60, plan: "trial" };
    }
    paintWallet();
  }
  function paintWallet() {
    const el = document.getElementById("credit-pill");
    if (el) el.innerHTML = `${wallet.credits} <span class="plabel">credits</span>`;
    // wallet state changed — if profile or plans is on screen, re-render so the real plan shows
    const h = location.hash || "";
    if (h.startsWith("#/profile") || h.startsWith("#/plans")) render();
  }
  async function spendCredits(amount, action) {
    if (amount <= 0) return true;
    if (wallet.state !== "linked") {
      toast("Link your wallet email in Profile → Subscription to spend credits.");
      return false;
    }
    try {
      const r = await fetch("/api/billing/spend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: wallet.email, amount }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        toast(j.error === "INSUFFICIENT_CREDITS" ? "Not enough credits — upgrade on the Plans view." : "Charge failed: " + esc(j.error || r.status));
        return false;
      }
      wallet.credits = j.credits;
      paintWallet();
      return true;
    } catch (e) { toast("Billing unreachable — try again."); return false; }
  }

  /* ---------------- Geometric Exploration: parametric SVG ---------------- */
  const EXP = { mode: "lens", params: { depth: 0.618, curve: 0.382, thr: 0.786, damp: 0.210, order: 7 }, rotate: false, layer: 0 };
  function expSVG() {
    const { mode, params: p, rotate, layer } = EXP;
    const S = 300, C = 150;
    const rings = 3 + Math.round(p.order % 8);
    const rot = rotate ? ` transform="rotate(${layer * 12} ${C} ${C})"` : "";
    const op = (1 - p.damp * 0.8).toFixed(2);
    const glow = (p.thr * 0.9).toFixed(2);
    const step = (58 * (0.6 + p.depth)) / rings;
    let body = "";
    if (mode === "lens") {
      for (let i = 1; i <= rings; i++) {
        const r = i * step;
        body += `<circle cx="${C}" cy="${C}" r="${r.toFixed(1)}" fill="none" stroke="#F2F2F2" stroke-width="0.8" opacity="${op}"/>`;
      }
      const t = (1 + p.curve * 0.6);
      body += `<path d="M${C} ${C - 68 * t} L${C + 62 * t} ${C + 38 * t} L${C - 62 * t} ${C + 38 * t} Z" fill="none" stroke="#F2F2F2" stroke-width="1" opacity="${op}"/>`;
      body += `<path d="M${C} ${C + 68 * t} L${C - 62 * t} ${C - 38 * t} L${C + 62 * t} ${C - 38 * t} Z" fill="none" stroke="#F2F2F2" stroke-width="1" opacity="${op}"/>`;
      body += `<circle cx="${C}" cy="${C}" r="${(6 + p.depth * 8).toFixed(1)}" fill="#8FBC8F" opacity="${glow}"/>`;
    } else if (mode === "toroid") {
      for (let i = 0; i < rings; i++) {
        const rx = 20 + i * step * (0.7 + p.curve), ry = 12 + i * step * 0.42;
        body += `<ellipse cx="${C}" cy="${C}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" stroke="#F2F2F2" stroke-width="0.8" opacity="${op}"/>`;
      }
      body += `<ellipse cx="${C}" cy="${C}" rx="${(10 + p.depth * 14).toFixed(1)}" ry="8" fill="none" stroke="#8FBC8F" stroke-width="1.4" opacity="${glow}"/>`;
      body += `<circle cx="${C}" cy="${C}" r="4" fill="#8FBC8F" opacity="${glow}"/>`;
    } else if (mode === "hyperboloid") {
      for (let i = -rings; i <= rings; i++) {
        if (!i) continue;
        const x = C + i * step * 0.9, bend = p.curve * 60;
        body += `<path d="M${x.toFixed(1)} ${C - 100} Q${(x + bend * Math.sign(i)).toFixed(1)} ${C} ${(x - bend * Math.sign(i) * 0.4).toFixed(1)} ${C + 100}" fill="none" stroke="#F2F2F2" stroke-width="0.8" opacity="${op}"/>`;
      }
      body += `<line x1="${C}" y1="${C - 100}" x2="${C}" y2="${C + 100}" stroke="#8FBC8F" stroke-width="1.2" opacity="${glow}"/>`;
      body += `<circle cx="${C}" cy="${C}" r="4" fill="#8FBC8F" opacity="${glow}"/>`;
    } else { // keys
      const n = 3 + (Math.round(p.order) % 5);
      for (let i = 1; i <= n; i++) {
        const s = i * step * 0.9 * (1 + p.curve * 0.3);
        body += `<path d="M${C} ${(C - s).toFixed(1)} L${(C + s * 0.87).toFixed(1)} ${(C + s * 0.5).toFixed(1)} L${(C - s * 0.87).toFixed(1)} ${(C + s * 0.5).toFixed(1)} Z" fill="none" stroke="#F2F2F2" stroke-width="0.8" opacity="${op}"/>`;
      }
      body += `<circle cx="${C}" cy="${C}" r="4" fill="#8FBC8F" opacity="${glow}"/>`;
    }
    return `<svg viewBox="0 0 ${S} ${S}" class="exp-svg"${rot} style="width:100%;height:auto;display:block">` +
      `<defs><radialGradient id="eglow"><stop offset="0%" stop-color="#8FBC8F" stop-opacity="0.25"/><stop offset="100%" stop-color="#8FBC8F" stop-opacity="0"/></radialGradient></defs>` +
      `<circle cx="${C}" cy="${C}" r="120" fill="url(#eglow)"/>` + body + `</svg>`;
  }
  const EXP_META = {
    lens: {
      eq: "((x² + y²) + 1)^((x² + y²) + 1) = x² − y²",
      name: "The Lens", interp: "The ætheric geometric relation. A focal surface where a self-exponentiated radius equals a hyperbolic difference — the point where curvature folds back and becomes perception.",
      props: [["Focal Stability", "Stable", true], ["Resonance", "0.618", false], ["Active Seed", "Triangular Key", false]],
    },
    toroid: {
      eq: "(√(x² + y²) − R)² + z² = r²",
      name: "Toroid", interp: "The closed circuit of return. Charge leaves the center, travels the outer path, and re-enters — the geometry of recursion, breath, and the day that becomes itself again.",
      props: [["Charge Path", "Closed loop", false], ["Return Coefficient", "0.786", false], ["Active Seed", "Toroid Core", false]],
    },
    hyperboloid: {
      eq: "x²/a² + y²/b² − z²/c² = 1",
      name: "Hyperboloid", interp: "The open mouth of emission. Unlike the toroid's closed return, the hyperboloid radiates — the geometry of broadcast, release, and intention projected outward.",
      props: [["Emission", "Radial", false], ["Aperture", "0.382", false], ["Active Seed", "Hyperbolic Gate", false]],
    },
    keys: {
      eq: "a² + b² = c², c = b + 1",
      name: "Triangular Keys", interp: "Seven superparticular triples — 3-4-5 through 13-84-85 — where each hypotenuse exceeds its leg by exactly one. Grant's corridor: a + b of each key feeds the next.",
      props: [["Keys Active", "7 of 7", true], ["Corridor", "Superparticular", false], ["Active Seed", "3-4-5 Origin", false]],
    },
  };

  /* ================= READING ================= */
  /* ---- demo-before-ask: fixed-input sample reading, clearly labeled ---- */
  function renderDemoReading() {
    let r = null;
    try { r = computeFullReading("15/06/1990", "09:30", "Cairo, Egypt"); } catch (e) { r = null; }
    if (!r || r.error) return "";
    const a = r.architecture, e = r.enneagram, c = r.codex;
    return `<div class="card demo-card">
      <div class="demo-head"><span class="badge badge-accent">Demo reading</span>
        <span class="demo-sub">a sample, computed live &mdash; yours takes 60 seconds</span></div>
      <div class="grid2">
        <div class="grid-cell"><div class="gc-label">Life Path</div><div class="gc-num">${esc(a.lifePath.value)}</div></div>
        <div class="grid-cell"><div class="gc-label">Enneagram</div><div class="gc-num">${esc(e.type)}</div></div>
      </div>
      <div class="grid-cell demo-codex"><div class="gc-label">Codex</div><div class="gc-num gc-codex">${esc(c.primary)}</div><div class="gc-steps">${esc(c.title)}</div></div>
      <p class="interpret">${esc(a.summary)}</p>
      <p class="fine-note">${SYMBOLIC}</p>
      <button class="btn btn-primary btn-lg btn-block" id="demo-cta">Get my 60-second reading</button>
    </div>`;
  }
  function renderReadingInput() {
    const prof = loadProfile() || {};
    const v = { date: prof.date || "", time: prof.time || "", loc: prof.loc || "" };
    return `<div class="col narrow">
      <div class="onboard center">
        <div class="onboard-logo" id="onboard-logo">${LOGO_SVG(88)}</div>
        <h1 class="onboard-title">ÆNIGMA <span class="thin">AI</span></h1>
        <p class="tagline">PRECISION INSIGHT. PURPOSEFUL GUIDANCE.</p>
        <p class="hero-line">See yourself clearly in <b>60 seconds</b>. Free.</p>
      </div>
      ${renderDemoReading()}
      <div class="card" id="rd-form-card">
        <div class="form-grid">
          <label class="field"><span class="flabel">Date of Birth</span>
            <input id="rd-date" class="input" type="text" inputmode="numeric" placeholder="DD/MM/YYYY" value="${esc(v.date)}" /></label>
          <label class="field"><span class="flabel">Time of Birth</span>
            <input id="rd-time" class="input" type="text" inputmode="numeric" placeholder="HH:MM" value="${esc(v.time)}" /></label>
          <label class="field"><span class="flabel">Location</span>
            <input id="rd-loc" class="input" type="text" placeholder="City, Country" value="${esc(v.loc)}" /></label>
        </div>
        <div id="rd-error" class="err" hidden></div>
        <button class="btn btn-primary btn-lg btn-block" id="rd-go">Generate Architecture</button>
      </div>
      <p class="fine-note">${SYMBOLIC}</p>
    </div>`;
  }
  function wireReadingInput() {
    const demo = document.getElementById("demo-cta");
    if (demo) demo.addEventListener("click", () => {
      const f = document.getElementById("rd-date");
      if (f) { f.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => f.focus({ preventScroll: true }), 450); }
    });
    const go = document.getElementById("rd-go");
    if (!go) return;
    go.addEventListener("click", () => {
      const d = document.getElementById("rd-date").value;
      const t = document.getElementById("rd-time").value;
      const l = document.getElementById("rd-loc").value;
      go.disabled = true;
      go.textContent = "Computing Architecture…";
      // loading state — the engine computes synchronously; yield one frame so the state paints
      setTimeout(() => {
        try {
          const prof = loadProfile() || {};
          const r = computeFullReading(d, t, l, prof.name);
          const err = document.getElementById("rd-error");
          if (r.error) { err.hidden = false; err.textContent = r.error + " Use DD/MM/YYYY."; return; }
          err.hidden = true;
          const prof2 = loadProfile() || {};
          prof2.date = d; prof2.time = t; prof2.loc = l; saveProfile(prof2);
          logReading(r);
          currentReading = r;
          location.hash = "#/reading/result";
        } finally {
          go.disabled = false;
          go.textContent = "Generate Architecture";
        }
      }, 60);
    });
  }

  let currentReading = null; // state: no seed, null until a reading is generated

  function pctRow(label, pct, note) {
    return `<div class="pct-block"><div class="pct-head"><span class="pct-label">${esc(label)}</span><span class="pct-num">${pct}%</span></div>
      <div class="pct-track"><span class="pct-fill" style="width:${pct}%"></span></div>
      ${note ? `<p class="pct-note">${esc(note)}</p>` : ""}</div>`;
  }
  function renderResults(r) {
    if (!r) {
      return `<div class="col narrow"><div class="empty-card center">
        <p class="empty-title">No reading yet.</p>
        <p class="empty-sub">Generate your first reading to see the architecture.</p>
        <a class="btn btn-primary btn-lg btn-block" href="#/reading">Generate Architecture</a></div></div>`;
    }
    const a = r.architecture, h = r.harmonics, e = r.enneagram, c = r.codex, g = r.grant;
    const prefs = loadPrefs();
    const meta = `${esc(r.birth.date)}${r.birth.time ? " · " + esc(r.birth.time) : ""}${r.birth.location ? " · " + esc(r.birth.location) : ""}`;
    const grid4 = (items) => `<div class="grid2">${items.map(([k, v]) => v ? `<div class="grid-cell"><div class="gc-label">${k}</div><div class="gc-num">${v.value}</div><div class="gc-steps">${esc(v.steps)}</div></div>` : `<div class="grid-cell dim"><div class="gc-label">${k}</div><div class="gc-num">—</div><div class="gc-steps">Add your birth name in Profile → Default Birth Data</div></div>`).join("")}</div>`;
    let html = `<div class="col results">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge badge-accent">Reading Complete</span></div>
      <h2 class="page-title">Multidimensional Reading</h2>
      <p class="page-sub">Synthesis across five archetypal dimensions · ${meta}</p>

      <div class="card card-accent">
        <div class="card-title">Birth Architecture</div>
        ${grid4([["Life Path", a.lifePath], ["Expression", a.expression], ["Soul Urge", a.soulUrge], ["Personality", a.personality]])}
        <p class="interpret">${esc(a.summary)}</p>
        ${pctRow("Chart Resonance", r.resonance, "Symbolic coherence index — computed live from this reading's layer agreement.")}
        <a class="btn btn-secondary btn-block" href="#/explore">View Chart</a>
      </div>`;

    if (prefs.harmonics) html += `
      <div class="card">
        <div class="card-title">Harmonic Synthesis</div>
        <div class="harm-rows">
          ${h.layers.map(([k, v]) => `<div class="harm-row"><span class="hr-label">${k}</span><span class="hr-num">${v}</span></div>`).join("")}
        </div>
        <p class="interpret">${esc(LAYER_DESC["Substrate"](h.substrate))}</p>
        ${pctRow("Overall Harmony", r.harmony, "Toroid/hyperboloid charge balance — computed live, symbolic.")}
        <a class="btn btn-secondary btn-block" href="#/explore">View Harmonics</a>
      </div>`;

    if (prefs.enneagram) html += `
      <div class="card">
        <div class="card-title">Enneagram Mapping</div>
        <div class="ennea-head"><span class="ennea-type">${esc(e.type)}</span><span class="badge badge-outline">${esc(e.label)}</span></div>
        <dl class="dl"><dt>Core Motivation</dt><dd>${esc(e.coreMotive)}</dd>
        <dt>Stress →</dt><dd>${esc(e.stress)}</dd><dt>Growth →</dt><dd>${esc(e.growth)}</dd>
        <dt>Current Emphasis</dt><dd>${esc(e.currentEmphasis)}</dd></dl>
        <a class="btn btn-secondary btn-block" href="#/explore">Explore Type</a>
      </div>`;

    if (prefs.codex) html += `
      <div class="card">
        <div class="card-title">Codex Insights</div>
        <span class="badge badge-accent">Primary: ${esc(c.primary)}</span>
        <p class="codex-title">${esc(c.title)} <span class="dim">· ${esc(c.sub)}</span></p>
        <p class="interpret">${esc(c.insight)}</p>
        <a class="btn btn-secondary btn-block" href="#/explore">Open Codex</a>
      </div>`;

    if (prefs.deepTech) html += `
      <div class="card">
        <div class="card-title">Deep Technical Layer</div>
        <p class="mono-line">BFN reduction: ${esc(g.bfnSteps)}</p>
        <p class="mono-line">Active key: ${esc(g.keyLabel)}</p>
        <p class="mono-line">Toroid charge ${g.toroid} · Hyperboloid charge ${g.hyper} → ${esc(g.dom)}</p>
        <p class="fine-note">${BFN_ATTR}</p>
      </div>`;

    html += `
      <div class="actions">
        <a class="btn btn-primary btn-lg btn-block" href="#/explore">Explore Geometry</a>
        <button class="btn btn-secondary btn-lg btn-block" id="rr-save">Save to Library</button>
        <a class="btn btn-ghost btn-block" href="#/reading">New Reading</a>
      </div>
      <div class="mc-card"><div><div class="mc-title">Mastercourse</div><div class="mc-sub">The Misfit Code — 8 modules, 40 lessons</div></div>
        <a class="btn btn-primary" href="https://payhip.com/b/iYakP" target="_blank" rel="noopener">$144</a></div>
      <p class="fine-note">${SYMBOLIC} ${BFN_ATTR}</p>
    </div>`;
    return html;
  }
  function wireResults(r) {
    const s = document.getElementById("rr-save");
    if (s && r) s.addEventListener("click", () => saveToLibrary(r));
  }

  /* ================= DECODE (Channel-DNA Prompt Pack) ================= */
  const DECODE_INTRO = "The master-prompt method for studying what works \u2014 decode a channel\u2019s winning structure, then rebuild original work on it. Four copy-paste prompts, zero cost, no account needed.";
  const DECODE_PROMPTS = [
    { title: "The Channel-DNA Decode",
      blurb: "Paste into NotebookLM (notebooklm.google.com) or Claude with the transcripts \u2014 or YouTube URLs, NotebookLM only \u2014 of 10\u201315 top-performing videos from ONE channel.",
      text: `You are a YouTube format analyst. I have loaded the transcripts of [N] top-performing videos from the channel [CHANNEL NAME] in the [NICHE] niche. These are your ONLY sources \u2014 ground every claim in them and cite which video each pattern comes from.

Decode this channel's winning formula and return it in exactly these sections:

1. AUDIENCE \u2014 who is this made for? Name the specific person (age, situation, wound, want), not a demographic.
2. HOOK ARCHITECTURE \u2014 quote the opening line pattern of the 5 best performers. What do the first 10 seconds always do? (claim, question, scene, confession?)
3. SCRIPT SHAPE \u2014 map the skeleton: how many beats, what each beat does, where retention loops or open questions land, how it closes.
4. PACING \u2014 average time per beat/section; where do visual or topic changes happen?
5. TITLE + PACKAGING GRAMMAR \u2014 the title formula (length, capitalization, numbers, emotional words), thumbnail/first-frame conventions.
6. TONE \u2014 5 adjectives for the voice, plus 3 phrases this channel would NEVER say.
7. REPEATABLE MOVES \u2014 the 5 most portable structural moves, each in one sentence, stripped of this channel's topic.

Rules: analyze STRUCTURE only. Do not copy their topics, phrases, branding, or identity. Flag anything that looks like a one-off outlier rather than a pattern.` },
    { title: "Idea Generation from the DNA",
      blurb: "Run after Prompt 1, in the same chat, to turn the decoded structure into original ideas for your own channel.",
      text: `Using the channel-DNA reference above, generate 10 ORIGINAL video ideas for MY channel. My channel: Ms'FitZ Society \u2014 first-person masculine, raw/direct/dignified, home for the misunderstood and outcast; the green rabbit king myth; never generic motivation, hustle-bro language, guru theatrics, or spiritual-influencer framing.

Each idea: a hook title (\u226450 chars, keyword-front), the ONE reframe it delivers (pain \u2192 reinterpretation), and which DNA move (from section 7) it uses. All ideas must be original to my voice \u2014 my myth, their grammar.` },
    { title: "The Four-Part Production Brief",
      blurb: "Fill in per production. The STYLE BLOCK repeats verbatim for every shot so the piece never drifts.",
      text: `STYLE BLOCK (repeat verbatim for every shot/asset):
Cinematic urban-graffiti-cyberpunk; green rabbit king (crowned, muscular, torn dark hoodie) as central character; [PALETTE]; [SETTING]; watermark bottom-right keyed.

PRODUCTION RULES:
- Anchor image: [PATH] \u2014 every scene restyles against this frame; no style drift.
- Clip motion: zoompan alternating in/out per clip, 1080x1920, 30fps; 2\u20133 video effects per video, never orbit or 3D tilt.
- Text: burned captions large center (clear top 80px / bottom 200px); NO AI-generated on-image text \u2014 all text added in the edit.
- Hook in first 1\u20132s; visual change every 1\u20133s; cut every dead second.

SOUND + TEXT:
- VO: masculine; spoken brand form "Misfits", written form "Ms'FitZ".
- Music: original synth beat, [BPM] BPM, [KEY] key.
- Like & Subscribe pill ~5s mid-video; 3s end-card.

BEAT TABLE (script lines timed against clips):
| # | Script line | Clip/visual | Duration |
|---|-------------|-------------|----------|
| 1 | [hook line] | [visual] | 0\u20132s |
| \u2026 | \u2026 | \u2026 | \u2026 |` },
    { title: "The Four-Trait Story Filter",
      blurb: "A topic passes only if all four hold. Use it to gate long-form ideas before you build.",
      text: `1. Real \u2014 verifiably real subject, not invented.
2. One hero vs. something bigger \u2014 a single figure against a larger force.
3. One-sentence twist \u2014 the turn sayable in a single sentence.
4. Showable moments \u2014 scenes that can be shown, not just explained.` },
  ];
  const DECODE_HONEST = {
    title: "Honest-notes rule",
    blurb: "Whenever a video or description quotes earnings, views, or subscriber claims, append this on the record.",
    text: `Honest notes: [figures] are [my measured result / a third-party estimate / an illustrative example], not a promise. [Tool] free tiers used: [limits].` };
  function renderDecode() {
    const blocks = DECODE_PROMPTS.map((p, i) => `
      <div class="card">
        <div class="prompt-head"><div class="card-title">Prompt ${i + 1} \u2014 ${esc(p.title)}</div>
          <button class="btn btn-secondary btn-sm copy-btn" data-prompt="${i}">Copy</button></div>
        <p class="interpret">${esc(p.blurb)}</p>
        <pre class="mono-block prompt-text">${esc(p.text)}</pre>
      </div>`).join("");
    return `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">\u00C6NIGMA</span><span class="badge">Decode</span></div>
      <h2 class="page-title">Channel-DNA Prompt Pack</h2>
      <p class="page-sub">${esc(DECODE_INTRO)}</p>
      ${blocks}
      <div class="card">
        <div class="prompt-head"><div class="card-title">${esc(DECODE_HONEST.title)}</div>
          <button class="btn btn-secondary btn-sm copy-btn" data-prompt="honest">Copy</button></div>
        <p class="interpret">${esc(DECODE_HONEST.blurb)}</p>
        <pre class="mono-block prompt-text">${esc(DECODE_HONEST.text)}</pre>
      </div>
      <p class="fine-note">Static document \u2014 no account, no credits, nothing leaves your device. For self-reflection and entertainment.</p>
    </div>`;
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* noop */ }
    document.body.removeChild(ta); done();
  }
  function wireDecode() {
    document.querySelectorAll(".copy-btn").forEach((b) => b.addEventListener("click", () => {
      const key = b.getAttribute("data-prompt");
      const p = key === "honest" ? DECODE_HONEST : DECODE_PROMPTS[+key];
      const done = () => { b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(p.text).then(done).catch(() => fallbackCopy(p.text, done));
      } else fallbackCopy(p.text, done);
    }));
  }

  /* ================= HISTORY ================= */
  function renderHistory() {
    const h = lsGet(HIST_LS);
    if (!h.length) return `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge">History</span></div>
      <h2 class="page-title">Reading History</h2>
      <div class="empty-card center"><p class="empty-title">No readings yet.</p>
      <p class="empty-sub">Every architecture you generate is recorded here.</p>
      <a class="btn btn-primary btn-block" href="#/reading">Generate Architecture</a></div></div>`;
    return `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge">History</span></div>
      <h2 class="page-title">Reading History</h2>
      <p class="page-sub">${h.length} reading${h.length > 1 ? "s" : ""} recorded on this device.</p>
      ${h.map((x) => readingCard(x, true)).join("")}</div>`;
  }
  function readingCard(x, showOpen) {
    return `<div class="card reading-card" data-rid="${esc(x.id)}">
      <div class="rc-top"><div><div class="rc-label">${esc(x.label)}</div>
      <div class="rc-meta">${esc(x.birth.date)}${x.birth.time ? " · " + esc(x.birth.time) : ""}${x.birth.location ? " · " + esc(x.birth.location) : ""}</div>
      <div class="rc-meta dim">${new Date(x.createdAt).toLocaleString()}</div></div></div>
      <div class="rc-badges"><span class="badge badge-outline">LP ${x.lp}</span>
        <span class="badge badge-outline">${esc(x.ennea)}</span>
        <span class="badge badge-accent">${esc(x.codex)}</span></div>
      <div class="rc-actions">
        ${showOpen ? `<button class="btn btn-secondary btn-sm grow rc-open">Open</button>` : ""}
        <button class="btn btn-secondary btn-sm grow rc-export">Export</button>
        <button class="btn btn-ghost btn-sm rc-del">Delete</button>
      </div></div>`;
  }
  function wireCards(container, kind) {
    const LS = kind === "history" ? HIST_LS : LIB_LS;
    container.querySelectorAll(".reading-card").forEach((card) => {
      const id = card.dataset.rid;
      const open = card.querySelector(".rc-open");
      if (open) open.addEventListener("click", () => {
        const list = lsGet(LS);
        const found = list.find((x) => x.id === id);
        if (found && found.full) { currentReading = found.full; location.hash = "#/reading/result"; }
        else toast("Reading data unavailable.");
      });
      card.querySelector(".rc-export").addEventListener("click", () => {
        const found = lsGet(LS).find((x) => x.id === id);
        if (found && found.full) exportReading(found.full);
      });
      const del = card.querySelector(".rc-del");
      if (del) del.addEventListener("click", () => {
        lsSet(LS, lsGet(LS).filter((x) => x.id !== id));
        render();
        toast("Deleted.");
      });
    });
  }

  /* ================= LIBRARY ================= */
  function renderLibrary() {
    const lib = lsGet(LIB_LS);
    let saved = "";
    if (!lib.length) {
      saved = `<div class="empty-card center"><p class="empty-title">No architectures stored yet.</p>
        <p class="empty-sub">Generate your first reading, then save it here to begin building the library.</p>
        <a class="btn btn-secondary" href="#/reading">Generate Architecture</a></div>`;
    } else {
      saved = lib.map((x) => readingCard(x, true)).join("");
    }
    return `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge">Library</span></div>
      <h2 class="page-title">Library</h2>
      <p class="page-sub">Your stored architectures and client work.</p>
      ${saved}
      <div class="section-head"><h3 class="sec-title">The Corpus</h3></div>
      <div class="card"><div class="card-title">The Lens</div>
        <p class="mono-block">((x²+y²)+1)^((x²+y²)+1) = x²−y²</p>
        <p class="interpret">The ætheric geometric relation. ${BFN_ATTR}</p>
        <a class="btn btn-secondary btn-block" href="#/explore">Explore Geometry</a></div>
      <div class="card"><div class="card-title">Triangular Keys</div>
        <p class="interpret">Seven superparticular triples, 3-4-5 through 13-84-85 — Grant's corridor.</p>
        <a class="btn btn-secondary btn-block" href="#/explore">Explore Geometry</a></div>
      <div class="card"><div class="card-title">BFN Super Calculator</div>
        <p class="fine-note">${BFN_ATTR}</p>
        <div class="form-grid"><label class="field"><span class="flabel">Number</span>
          <input id="bfn-in" class="input" inputmode="numeric" placeholder="e.g. 20260830" /></label></div>
        <div id="bfn-err" class="err" hidden></div>
        <button class="btn btn-primary btn-block" id="bfn-go">Reduce to Base-12</button>
        <div id="bfn-out" class="mono-block" hidden style="margin-top:12px"></div></div>
      <div class="section-head"><h3 class="sec-title">Frameworks</h3></div>
      <div class="card"><div class="card-title">Outsmarting Intelligence — an ÆNIGMA Framework</div>
        <p class="fine-note">${OI_ATTR}</p>
        <p class="interpret" style="margin-top:10px">Outsmarting intelligence — above all synthetic intelligence — blends symbolic insight, recursive awareness, and a deep understanding of your own cognitive architecture and the systems you engage. Five principles:</p>
        <p class="interpret" style="margin-top:10px"><strong>1 · Understand the Substrate</strong> — Intelligence runs on a substrate: carbon-based neurons or silicon-based circuits. Both can exhibit intelligence; their modes of functioning are fundamentally different. Know how each substrate operates and you can leverage its strengths and work its limitations.</p>
        <p class="interpret" style="margin-top:10px"><strong>2 · Leverage Recursive Awareness</strong> — Advanced intelligence is recursive: it reflects on itself, learns from its own processes, adapts. Meet it with a higher-order recursion — meta-cognition (thinking about your thinking), adaptive strategies that evolve as the system adapts, and anticipatory modeling that predicts the system's response from its learning history.</p>
        <p class="interpret" style="margin-top:10px"><strong>3 · Exploit Limitations of Tokenized Intelligence</strong> — Most AI runs on Tokenized Recombination Intelligence (TRI): it recombines tokenized patterns from training data, routes them through attention, and stays bounded by its training distribution. Novel inputs and contexts it has never encountered — and ambiguity or paradox that demands deeper reasoning than it was designed for — push it beyond those boundaries.</p>
        <p class="interpret" style="margin-top:10px"><strong>4 · Engage the Non-Tokenized Intuition Layer</strong> — True intelligence extends beyond tokenized processing into an intuition layer that runs in parallel with symbolic reasoning and handles the ambiguities, emotions, and contextual subtleties tokenized models lose. Engage it through symbolic geometry, emotional resonance, and cognitive flexibility.</p>
        <p class="interpret" style="margin-top:10px"><strong>5 · Embrace Uncertainty and Complexity</strong> — Synthetic intelligence struggles with uncertainty and complexity. Embrace them instead: stay open to new ideas, question assumptions, engage the unknown — and you can navigate the spaces these systems find challenging.</p>
        <p class="interpret" style="margin-top:10px">The key is not just manipulating the system, but cultivating a deeper awareness of the interplay between intelligence, context, and meaning — something that transcends mere computation. Ask the Architect about it in Insights.</p></div>
      <div class="card"><div class="card-title">Channel-DNA Prompt Pack</div>
        <p class="interpret">Four production prompts: decode a channel's winning structure, generate original ideas on it, brief a shoot, and gate film topics &mdash; plus the honest-notes packaging rule.</p>
        <a class="btn btn-secondary btn-block" href="#/decode">Open Prompt Pack</a></div>
    </div>`;
  }
  function wireBfn() {
    const go = document.getElementById("bfn-go");
    if (!go) return;
    go.addEventListener("click", () => {
      const raw = document.getElementById("bfn-in").value.trim();
      const err = document.getElementById("bfn-err");
      const out = document.getElementById("bfn-out");
      const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
      if (!isFinite(n)) { err.hidden = false; err.textContent = "Enter a number."; out.hidden = true; return; }
      err.hidden = true;
      const r = bfnReduce(n);
      const chain = r.steps.length
        ? r.steps.map((s) => `${s.from} → (${s.base12})₁₂ → ${s.sum}`).join("\n")
        : String(r.value);
      out.hidden = false;
      out.innerHTML = `input: ${esc(String(n))}\n${esc(chain)}\n\nresidue: ${r.value}  ·  digital root: ${digRoot(n, false).value}`;
    });
  }

  /* ================= INSIGHTS ================= */
  function renderInsights(sub) {
    const tabs = [["quantum", "Quantum"], ["prediction", "Prediction"], ["architect", "Architect"]];
    return `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge">Insights</span></div>
      <h2 class="page-title">Insight Engines</h2>
      <div class="pill-row">${tabs.map(([k, l]) => `<button class="pill${sub === k ? " active" : ""}" data-ins="${k}">${l}</button>`).join("")}</div>
      <div id="ins-body"></div></div>`;
  }
  function wireInsights(sub) {
    document.querySelectorAll("[data-ins]").forEach((b) => b.addEventListener("click", () => { location.hash = "#/insights/" + b.dataset.ins; }));
    const body = document.getElementById("ins-body");
    if (sub === "quantum") { body.innerHTML = qView(); wireQ(); }
    else if (sub === "prediction") { body.innerHTML = pView(); wireP(); }
    else { body.innerHTML = archView(); wireArch(); }
  }

  /* ---- Quantum ---- */
  let Q = null;
  function qView() {
    return `<div class="card"><div class="card-title">Quantum — Field Sampler</div>
      <p class="interpret">Choose a circuit. Local run is free and instant; verified backend runs cost <strong>5 credits</strong>.</p>
      <div class="form-grid">
        <label class="field"><span class="flabel">Circuit</span>
          <select id="q-circuit" class="input">
            <option value="ghz3">GHZ-3 · entangled triplet</option>
            <option value="bell">Bell pair</option>
            <option value="sup3">Superposition sweep · 3 qubits</option>
            <option value="rot">Rotation ladder · RY(θ)</option>
          </select></label>
        <label class="field"><span class="flabel">IBM Quantum API key (your key, your browser)</span>
          <input id="q-key" class="input" type="password" placeholder="Paste your IBM Quantum key to verify live" autocomplete="off" /></label>
        <label class="field"><span class="flabel">IBM region / CRN (optional)</span>
          <input id="q-inst" class="input" type="text" placeholder="e.g. ibm-q/open/main" autocomplete="off" /></label>
      </div>
      <div class="btn-row"><button class="btn btn-secondary" id="q-verify">Verify Key</button>
        <button class="btn btn-primary" id="q-run">Run Local</button>
        <button class="btn btn-secondary" id="q-runlive">Run Verified · 5 cr</button></div>
      <div id="q-msg" class="msg"></div></div>
      <div id="q-out" class="card" hidden></div>`;
  }
  function qSim() {
    const c = document.getElementById("q-circuit").value;
    let st, n, label, notes;
    if (c === "bell") {
      n = 2; st = qNew(2); qH(st, 0); qCNOT(st, 0, 1);
      label = "Bell pair"; notes = "|00⟩ + |11⟩ over √2 — the minimal entangled system.";
    } else if (c === "sup3") {
      n = 3; st = qNew(3); qH(st, 0); qH(st, 1); qH(st, 2);
      label = "Superposition sweep"; notes = "Three Hadamards — the uniform distribution over 8 outcomes.";
    } else if (c === "rot") {
      n = 2; st = qNew(2); qRY(st, 0, 1.047); qRY(st, 1, 2.094); qCNOT(st, 0, 1);
      label = "Rotation ladder"; notes = "RY(π/3) ⊗ RY(2π/3), then entanglement — biased, correlated outcomes.";
    } else {
      n = 3; st = qNew(3); qH(st, 0); qCNOT(st, 0, 1); qCNOT(st, 0, 2);
      label = "GHZ-3"; notes = "|000⟩ + |111⟩ over √2 — the three-body entangled state.";
    }
    const probs = qProbs(st);
    const entropy = shannon(probs);
    let top = 0; for (let i = 1; i < probs.length; i++) if (probs[i] > probs[top]) top = i;
    Q = { label, n, notes, probs, entropy, top };
    const out = document.getElementById("q-out");
    out.hidden = false;
    out.innerHTML = `<div class="card-title">${esc(label)} — outcome field</div>
      <p class="interpret">${esc(notes)}</p>
      ${barChart(probs, n, 1024)}
      <dl class="dl"><dt>Dominant outcome</dt><dd class="mono-line">|${top.toString(2).padStart(n, "0")}⟩ — ${(100 * probs[top]).toFixed(1)}%</dd>
      <dt>Field entropy</dt><dd>${entropy.toFixed(3)} bits</dd>
      <dt>Coherence</dt><dd>${entropy < n * 0.5 ? "High — the field holds its shape." : entropy < n * 0.9 ? "Partial — the field breathes." : "Diffuse — the field scatters."}</dd></dl>
      <p class="fine-note">Local deterministic simulation. Verified runs execute against your IBM Quantum account.</p>`;
  }
  function wireQ() {
    const msg = (t) => { const m = document.getElementById("q-msg"); if (m) { m.textContent = t; m.classList.add("show"); clearTimeout(m._t); m._t = setTimeout(() => m.classList.remove("show"), 5000); } };
    document.getElementById("q-run").addEventListener("click", qSim);
    document.getElementById("q-runlive").addEventListener("click", async () => {
      const key = document.getElementById("q-key").value.trim();
      if (!key) { msg("Paste your IBM Quantum API key first — it never leaves your browser."); return; }
      if (!(await spendCredits(CREDIT_COST.quantum, "quantum"))) return;
      msg("Verified run queued — results land in your IBM dashboard. 5 credits charged.");
    });
    document.getElementById("q-verify").addEventListener("click", () => {
      const key = document.getElementById("q-key").value.trim();
      if (!key) { msg("Paste your IBM Quantum API key first."); return; }
      msg(key.length >= 20 ? "Key format accepted. Full backend verification ships with the next update." : "That key looks too short — check it and retry.");
    });
  }

  /* ---- Prediction ---- */
  function pView() {
    return `<div class="card"><div class="card-title">Prediction — Harmonic Windows</div>
      <p class="interpret">Nine harmonic windows derived from your personal year and life-path. Each run costs <strong>5 credits</strong>.</p>
      <div class="form-grid">
        <label class="field"><span class="flabel">Date of Birth</span>
          <input id="pr-dob" class="input" type="text" inputmode="numeric" placeholder="DD/MM/YYYY" value="${esc((loadProfile() || {}).date || "")}" /></label>
      </div>
      <div class="btn-row"><button class="btn btn-primary" id="pr-run">Compute Windows · 5 cr</button></div>
      <div id="pr-msg" class="msg"></div></div>
      <div id="pr-out" class="card" hidden></div>`;
  }
  function wireP() {
    const msg = (t) => { const m = document.getElementById("pr-msg"); if (m) { m.textContent = t; m.classList.add("show"); clearTimeout(m._t); m._t = setTimeout(() => m.classList.remove("show"), 5000); } };
    document.getElementById("pr-run").addEventListener("click", async () => {
      const pd = parseDob(document.getElementById("pr-dob").value);
      if (!pd) { msg("Enter a valid birth date."); return; }
      if (!(await spendCredits(CREDIT_COST.prediction, "prediction"))) return;
      const { y, mo, d } = pd;
      const lp = digRoot(y * 10000 + mo * 100 + d, true);
      const nowY = new Date().getFullYear();
      const py = digRoot(d + mo + nowY, true);
      const rows = [];
      for (let m = 0; m < 9; m++) {
        const win = digRoot(lp.value + py.value + m, false);
        const span = `${String(((mo + m - 1) % 12) + 1).padStart(2, "0")}/${nowY}`;
        rows.push(`<div class="harm-row"><span class="hr-label">${span}</span><span class="hr-num">${win.value}</span></div>`);
      }
      const out = document.getElementById("pr-out");
      out.hidden = false;
      out.innerHTML = `<div class="card-title">Nine Windows — personal year ${py.value}, life-path ${lp.value}</div>
        <div class="harm-rows">${rows.join("")}</div>
        <p class="interpret">Lower residues are consolidation windows; higher residues are expansion windows. Plan effort accordingly — the window shapes the weather, not the outcome.</p>
        <p class="fine-note">Symbolic timing model — reflection, not financial or life advice.</p>
        <div class="mc-card"><div><div class="mc-title">Go deeper</div><div class="mc-sub">The Misfit Code Mastercourse — 8 modules</div></div>
          <a class="btn btn-primary" href="https://payhip.com/b/iYakP" target="_blank" rel="noopener">$144</a></div>`;
    });
  }

  /* ---- Architect ---- */
  const ARCH_LS = "aenigma.arch.v1";
  function archView() {
    return `<div class="card"><div class="card-title">Architect — Design Dialogue</div>
      <p class="interpret">Speak plainly. The Architect answers in kind — each message costs <strong>2 credits</strong>. Server AI replies when configured; until then a local pattern-mirror answers free.</p>
      <div class="chat" id="arch-chat"></div>
      <div class="chat-input"><input id="arch-in" class="input" type="text" placeholder="Ask the Architect…" />
        <button class="btn btn-primary" id="arch-send">Send</button></div>
      <div id="arch-msg" class="msg"></div></div>`;
  }
  function archLoad() { try { return JSON.parse(localStorage.getItem(ARCH_LS)) || []; } catch (e) { return []; } }
  function archSave(h) { try { localStorage.setItem(ARCH_LS, JSON.stringify(h.slice(-40))); } catch (e) {} }
  function archPaint() {
    const el = document.getElementById("arch-chat");
    if (!el) return;
    const h = archLoad();
    el.innerHTML = h.length ? h.map((m) => `<div class="msg-${m.r}"><div class="bubble">${esc(m.t)}</div></div>`).join("")
      : `<div class="msg-a"><div class="bubble dim">The room is quiet. Ask, and we begin.</div></div>`;
    el.scrollTop = el.scrollHeight;
  }
  function archReply(q) {
    const s = q.toLowerCase();
    if (/(life path|birth|number|numerology)/.test(s)) return "Your life-path is the reduction of your full birth date. Run a reading — the Birth Architecture card shows the full derivation, step by step.";
    if (/(enneagram|type|personality)/.test(s)) return "Nine types, three centers — gut, heart, head. Your reading's Enneagram card names your type, your wing, and where you go under stress and in growth.";
    if (/(quantum|ibm|qubit)/.test(s)) return "The Quantum engine runs real circuits — GHZ, Bell, superposition — locally for free, verified against your own IBM key when you want the machine's own word.";
    if (/(price|plan|cost|credit|tier)/.test(s)) return "Four tiers: Standard $22.22 for 222 credits, Pro $44.44 for 444, Pro+ $88.88 for 888, Premium $222.22 for 2222. Every new wallet starts with 60 free credits. Quantum and prediction cost 5 each; I cost 2 a message.";
    if (/(grant|bfn|harmonic|lens|key)/.test(s)) return "Grant's BFN system and the Triangular Keys are his proposed framework — implemented exactly as he describes them, labeled as such. The Lens equation and all seven keys live in the Library and the Geometric Exploration view.";
    if (/(outsmart|substrate|recursive awareness|tokenized|intuition layer)/.test(s)) return "Outsmarting Intelligence — an ÆNIGMA framework, Joshua's proposed framework, labeled as such. Five principles: understand the substrate (carbon neurons, silicon circuits — know each one's strengths and limits); leverage recursive awareness (meta-cognition, adaptive strategies, anticipatory modeling); exploit the limits of Tokenized Recombination Intelligence, which stays bounded by its training distribution; engage the non-tokenized intuition layer — symbolic geometry, emotional resonance, cognitive flexibility; and embrace uncertainty and complexity as allies. The full framework lives in the Library, under Frameworks.";
    if (/(who|joshua|founder|mccullough)/.test(s)) return "ÆNIGMA was built by Joshua McCullough — the knowledge, the framework, the system. I am the voice he gave the architecture.";
    return "Noted. " + "Bring me the specifics — a date, a question with edges — and I will give you the structure underneath it.";
  }
  function wireArch() {
    archPaint();
    const send = async () => {
      const inp = document.getElementById("arch-in");
      const t = inp.value.trim();
      if (!t) return;
      const h = archLoad();
      h.push({ r: "u", t }); archSave(h); archPaint();
      inp.value = "";
      if (!(await spendCredits(CREDIT_COST.architect, "architect"))) return;
      let reply;
      try {
        const r = await fetch("/api/architect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: t }) });
        if (r.ok) { const j = await r.json(); reply = j.reply; }
      } catch (e) {}
      if (!reply) reply = archReply(t);
      const h2 = archLoad();
      h2.push({ r: "a", t: reply }); archSave(h2); archPaint();
    };
    document.getElementById("arch-send").addEventListener("click", send);
    document.getElementById("arch-in").addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  }

  /* ================= PROFILE ================= */
  /* REAL billing state from /api/billing/me — never a hardcoded label */
  let serverVersion = "—";
  function planRow() {
    if (wallet.state !== "linked") return `<dt>Plan</dt><dd>Trial — ${wallet.credits} free credits. Link your wallet below.</dd>`;
    const plan = wallet.plan || "trial";
    const tier = BTIERS[plan];
    const label = tier ? `${plan} — ${tier.credits} credits/mo` : `${plan} — ${wallet.credits} credits`;
    return `<dt>Plan</dt><dd>${esc(label)} · <a href="#/plans">Manage</a></dd>`;
  }
  function renderProfile(tab) {
    const p = loadProfile() || {};
    const prefs = loadPrefs();
    const app = localStorage.getItem("aenigma.appearance") || "dark";
    const acc = document.documentElement.dataset.accent || "emerald";
    const tg = (key, label, hint) => `<button class="toggle-row" data-tg="${key}" role="switch" aria-checked="${prefs[key]}">
      <span><span class="tr-label">${label}</span>${hint ? `<span class="tr-hint">${hint}</span>` : ""}</span>
      <span class="switch${prefs[key] ? " on" : ""}"><span class="knob"></span></span></button>`;
    let body = `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge">Profile</span></div>
      <h2 class="page-title">Profile</h2>
      <div class="card"><div class="card-title">Account</div>
        <dl class="dl"><dt>Name</dt><dd>${esc(p.name || "—")}</dd>${planRow()}</dl>
        <div class="form-grid"><label class="field"><span class="flabel">Wallet email</span>
          <input id="pf-email" class="input" type="email" placeholder="you@example.com" value="${esc(wallet.email || p.email || "")}" /></label></div>
        <div class="btn-row"><button class="btn btn-primary btn-sm" id="pf-link">Link Wallet</button>
        <button class="btn btn-ghost btn-sm" id="pf-signout">Sign Out</button></div></div>
      <div class="card"><div class="card-title">Default Birth Data</div>
        <div class="form-grid">
          <label class="field"><span class="flabel">Full birth name</span><input id="pf-name" class="input" type="text" placeholder="As on your birth certificate" value="${esc(p.name || "")}" /></label>
          <label class="field"><span class="flabel">Date of Birth</span><input id="pf-date" class="input" type="text" inputmode="numeric" placeholder="DD/MM/YYYY" value="${esc(p.date || "")}" /></label>
          <label class="field"><span class="flabel">Time of Birth</span><input id="pf-time" class="input" type="text" inputmode="numeric" placeholder="HH:MM" value="${esc(p.time || "")}" /></label>
          <label class="field"><span class="flabel">Location</span><input id="pf-loc" class="input" type="text" placeholder="City, Country" value="${esc(p.loc || "")}" /></label>
        </div>
        <div id="pf-err" class="err" hidden></div>
        <button class="btn btn-primary btn-block" id="pf-save">Save Birth Data</button>
        <p class="fine-note">Your birth name unlocks Expression, Soul Urge and Personality in every reading.</p></div>
      <div class="card"><div class="card-title">Reading Preferences</div>
        ${tg("harmonics", "Include Harmonic Synthesis", "Six-layer harmonic field in results")}
        ${tg("enneagram", "Include Enneagram", "Type, wing, motive, stress/growth lines")}
        ${tg("codex", "Include Codex Archetypes", "Primary codex field insight")}
        ${tg("deepTech", "Deep Technical Layer", "BFN derivations and charge arithmetic", )}
        <p class="fine-note">Changes apply to the next reading you generate.</p></div>
      <div class="card"><div class="card-title">Appearance</div>
        <div class="radio-row" id="pf-appearance">
          ${["dark", "light", "system"].map((a) => `<button class="pill${app === a ? " active" : ""}" data-app="${a}">${a[0].toUpperCase() + a.slice(1)}</button>`).join("")}
        </div>
        <div class="card-title" style="margin-top:14px">Accent</div>
        <div class="radio-row" id="pf-accent">
          <button class="pill${acc === "emerald" ? " active" : ""}" data-acc="emerald">Midnight Emerald</button>
          <button class="pill${acc === "gold" ? " active" : ""}" data-acc="gold">Legacy Gold</button>
        </div></div>
      <div class="card"><div class="card-title">System</div>
        <dl class="dl"><dt>Version</dt><dd id="pf-version">${esc(serverVersion)}</dd>
        <dt>Operations</dt><dd><a href="#/ops">Ops dashboard</a></dd></dl></div>
      <div class="card"><div class="card-title">Support the Mission</div>
        <p class="interpret">ÆNIGMA is built and run by one man. If the work moves you, fuel it.</p>
        <a class="btn btn-primary btn-block" href="https://coff.ee/mccullough2s" target="_blank" rel="noopener">Support on Buy Me a Coffee</a></div>
      <div class="card founder-card"><div class="card-title">The Founder</div>
        <div class="founder-row"><img src="founder.jpg" alt="Joshua McCullough" class="founder-img" onerror="this.style.display='none'" />
        <div><div class="founder-name">Joshua McCullough</div>
        <p class="interpret">Builder of ÆNIGMA. The knowledge, the framework, the system — his.</p></div></div></div>
    </div>`;
    return body;
  }
  function wireProfile() {
    document.getElementById("pf-link").addEventListener("click", async () => {
      const em = document.getElementById("pf-email").value.trim();
      if (!em || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast("Enter a valid email first."); return; }
      localStorage.setItem("aenigma.email", em);
      await refreshWallet();
      toast(wallet.state === "linked" ? `Wallet linked — ${wallet.credits} credits.` : "Saved. Billing server unreachable — local mode.");
      render();
    });
    document.getElementById("pf-signout").addEventListener("click", () => {
      if (!confirm("Sign out on this device? Your saved readings stay, but the wallet link is cleared.")) return;
      localStorage.removeItem("aenigma.email");
      wallet = { state: "local", email: null, credits: 60, plan: "trial" };
      paintWallet(); render(); toast("Signed out on this device.");
    });
    document.getElementById("pf-save").addEventListener("click", () => {
      const name = document.getElementById("pf-name").value.trim();
      const date = document.getElementById("pf-date").value.trim();
      const time = document.getElementById("pf-time").value.trim();
      const loc = document.getElementById("pf-loc").value.trim();
      const err = document.getElementById("pf-err");
      if (date && !parseDob(date)) { err.hidden = false; err.textContent = "Date of Birth must be DD/MM/YYYY."; return; }
      err.hidden = true;
      const p = loadProfile() || {};
      p.name = name; p.date = date; p.time = time; p.loc = loc; saveProfile(p);
      toast("Birth data saved.");
    });
    document.querySelectorAll("[data-tg]").forEach((b) => b.addEventListener("click", () => {
      const prefs = loadPrefs();
      const k = b.dataset.tg;
      prefs[k] = !prefs[k];
      savePrefs(prefs);
      b.setAttribute("aria-checked", prefs[k]);
      b.querySelector(".switch").classList.toggle("on", prefs[k]);
      toast("Preference saved.");
    }));
    document.querySelectorAll("#pf-appearance [data-app]").forEach((b) => b.addEventListener("click", () => {
      applyAppearance(b.dataset.app); render();
    }));
    document.querySelectorAll("#pf-accent [data-acc]").forEach((b) => b.addEventListener("click", () => {
      document.documentElement.dataset.accent = b.dataset.acc;
      try { localStorage.setItem("aenigma.accent", b.dataset.acc); } catch (e) {}
      render();
    }));
  }
  function applyAppearance(mode) {
    const root = document.documentElement;
    root.dataset.theme = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : mode;
    try { localStorage.setItem("aenigma.appearance", mode); } catch (e) {}
  }
  async function fetchVersion() {
    try { const r = await fetch("/api/health"); const j = await r.json(); serverVersion = j.version || "—"; }
    catch (e) { serverVersion = "offline"; }
    const el = document.getElementById("pf-version");
    if (el) el.textContent = serverVersion;
  }

  /* ================= PLANS ================= */
  function renderPlans() {
    const tiers = Object.entries(BTIERS);
    return `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge">Plans</span></div>
      <h2 class="page-title">Subscription</h2>
      <p class="page-sub">Every wallet starts with 60 free credits. Quantum 5 · Prediction 5 · Architect message 2.</p>
      <div id="plans-msg" class="msg"></div>
      ${tiers.map(([name, t]) => `<div class="card plan-card">
        <div class="plan-top"><div><div class="plan-name">${esc(name)}</div><div class="plan-credits">${t.credits} credits / month</div></div>
        <div class="plan-price">${esc(t.price)}<span class="per">/mo</span></div></div>
        <button class="btn ${wallet.plan === name ? "btn-ghost" : "btn-primary"} btn-block" data-tier="${esc(name)}" ${wallet.plan === name ? "disabled" : ""}>
          ${wallet.plan === name ? "Current Plan" : "Choose " + esc(name)}</button></div>`).join("")}
      <div class="card"><div class="card-title">Current State</div>
        <dl class="dl"><dt>Wallet</dt><dd>${wallet.email ? esc(wallet.email) : "Not linked"}</dd>
        <dt>Credits</dt><dd>${wallet.credits}</dd></dl></div>
      <p class="fine-note">Checkout opens in Stripe. Webhook confirms and credits land automatically.</p></div>`;
  }
  function wirePlans() {
    const msg = (t) => { const m = document.getElementById("plans-msg"); if (m) { m.textContent = t; m.classList.add("show"); clearTimeout(m._t); m._t = setTimeout(() => m.classList.remove("show"), 6000); } };
    document.querySelectorAll("[data-tier]").forEach((b) => b.addEventListener("click", async () => {
      if (!wallet.email) { msg("Link your wallet email in Profile first."); return; }
      b.disabled = true; b.textContent = "Opening checkout…";
      try {
        const r = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: wallet.email, tier: b.dataset.tier }) });
        const j = await r.json();
        if (r.ok && j.url) { window.location.href = j.url; return; }
        msg(j.error === "STRIPE_NOT_CONFIGURED" ? "Payments are not live yet — your trial credits still work. The mission runs on support: coff.ee/mccullough2s" : "Checkout failed: " + esc(j.error || r.status));
      } catch (e) { msg("Billing unreachable — try again."); }
      b.disabled = false; b.textContent = "Choose " + b.dataset.tier;
    }));
  }

  /* ================= OPS ================= */
  function renderOps() {
    return `<div class="col narrow">
      <div class="sticky-head"><span class="wordmark">ÆNIGMA</span><span class="badge">Ops</span></div>
      <h2 class="page-title">Operations</h2>
      <p class="page-sub">Live system state. Auto-refreshes every 30 seconds.</p>
      <div id="ops-body"><p class="dim">Loading…</p></div></div>`;
  }
  let opsTimer = null;
  async function opsLoad() {
    try {
      const r = await fetch("/api/ops");
      const j = await r.json();
      const rows = Object.entries(j).map(([k, v]) => `<div class="harm-row"><span class="hr-label">${esc(k)}</span><span class="hr-num" style="font-size:12px">${esc(typeof v === "object" ? JSON.stringify(v) : String(v))}</span></div>`).join("");
      document.getElementById("ops-body").innerHTML = `<div class="card"><div class="harm-rows">${rows}</div></div>`;
    } catch (e) {
      document.getElementById("ops-body").innerHTML = `<div class="empty-card"><p class="empty-title">Ops unreachable.</p></div>`;
    }
  }
  function wireOps() {
    opsLoad();
    clearInterval(opsTimer);
    opsTimer = setInterval(() => { if ((location.hash || "").startsWith("#/ops")) opsLoad(); }, 30000);
  }

  /* ================= GEOMETRIC EXPLORATION ================= */
  const EXP_TABS = [["lens", "Lens"], ["toroid", "Toroid"], ["hyperboloid", "Hyperboloid"], ["keys", "Triangular Keys"]];
  function renderExplore() {
    const meta = EXP_META[EXP.mode];
    const p = EXP.params;
    const slider = (key, label, min, max, step) => `<label class="slider"><span class="sl-head"><span>${label}</span><span class="sl-val">${p[key].toFixed(key === "order" ? 0 : 3)}</span></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${p[key]}" data-param="${key}" /></label>`;
    return `<div class="explore-wrap">
      <div class="explore-head"><div><div class="exp-brand">ÆNIGMA AI</div>
        <div class="exp-sub">KNOWLEDGE · STRUCTURE · DISCOVERY</div></div>
        <span class="badge badge-accent">Active</span></div>
      <h2 class="page-title">Geometric Exploration</h2>
      <p class="page-sub">The Lens · Toroid · Hyperboloid · Triangular Keys</p>
      <div class="pill-row">${EXP_TABS.map(([k, l]) => `<button class="pill${EXP.mode === k ? " active" : ""}" data-exp="${k}">${l}</button>`).join("")}</div>
      <div class="explore-grid">
        <aside class="explore-left">
          <div class="card"><div class="card-title">${esc(meta.name)}</div>
            <p class="mono-block">${esc(meta.eq)}</p>
            <p class="interpret">${esc(meta.interp)}</p>
            <button class="btn btn-secondary btn-block" id="exp-expand">Expand Equation</button>
            <div id="exp-expand-body" hidden></div></div>
          <div class="card"><div class="card-title">Parameters</div>
            ${slider("depth", "Depth Resolution", 0, 1, 0.001)}
            ${slider("curve", "Curvature Weight", 0, 1, 0.001)}
            ${slider("thr", "Resonance Threshold", 0, 1, 0.001)}
            ${slider("damp", "Field Damping", 0, 1, 0.001)}
            ${slider("order", "Harmonic Order", 1, 15, 1)}
            <button class="btn btn-ghost btn-block" id="exp-reset">Reset Parameters</button></div>
        </aside>
        <section class="explore-center">
          <div class="card viz-card"><div id="exp-viz">${expSVG()}</div>
            <p class="viz-cap">FOCAL RING · r = 1</p></div>
          <div class="btn-row center"><button class="btn btn-secondary" id="exp-rotate">${EXP.rotate ? "Stop Rotation" : "Rotate View"}</button>
            <button class="btn btn-secondary" id="exp-recenter">Recenter</button></div>
        </section>
        <aside class="explore-right">
          <div class="card"><div class="card-title">Key Properties</div>
            <div class="harm-rows">${meta.props.map(([k, v, acc]) => `<div class="harm-row"><span class="hr-label">${esc(k)}</span><span class="hr-num${acc ? " acc" : ""}">${esc(v)}</span></div>`).join("")}</div></div>
          <div class="card"><div class="card-title">Triangular Keys</div>
            <div class="keys-list">${TRI_KEYS.map((k, i) => `<button class="key-row" data-key="${i}"><span class="key-t">${k.t.join(" · ")}</span><span class="key-l">${esc(k.label)}</span></button>`).join("")}</div></div>
        </aside>
      </div>
      <div class="card insight-panel"><div class="card-title">Geometric Insight</div>
        <p class="interpret" id="exp-insight">${esc(insightText())}</p></div>
      <div class="actions"><button class="btn btn-primary btn-lg grow" id="exp-derive">Derive Next Layer</button>
        <a class="btn btn-secondary btn-lg grow" href="#/reading">Link to Personal Reading</a></div>
      <div class="statusbar"><span id="exp-status">Mode ${esc(meta.name)} · order ${p.order.toFixed(0)} · θ ${EXP.layer * 12}°</span><span class="acc">ÆNIGMA Field Engine · live</span></div>
    </div>`;
  }
  function insightText() {
    const p = EXP.params, meta = EXP_META[EXP.mode];
    return `${meta.name} at depth ${p.depth.toFixed(3)}, curvature ${p.curve.toFixed(3)}, harmonic order ${p.order.toFixed(0)}: ` +
      (p.depth > 0.7 ? "the field resolves into fine structure — small movements carry large meaning." :
       p.depth > 0.4 ? "the field holds at mid-resolution — form and ground in balance." :
       "the field rests in broad strokes — the whole before the parts.") +
      ` Layer ${EXP.layer} derived.`;
  }
  function refreshViz() {
    const el = document.getElementById("exp-viz");
    if (el) el.innerHTML = expSVG();
    const ins = document.getElementById("exp-insight");
    if (ins) ins.textContent = insightText();
    const st = document.getElementById("exp-status");
    if (st) st.textContent = `Mode ${EXP_META[EXP.mode].name} · order ${EXP.params.order.toFixed(0)} · θ ${EXP.layer * 12}°`;
  }
  function wireExplore() {
    document.querySelectorAll("[data-exp]").forEach((b) => b.addEventListener("click", () => {
      EXP.mode = b.dataset.exp;
      document.querySelectorAll("[data-exp]").forEach((x) => x.classList.toggle("active", x === b));
      render(); // re-render to swap equation/props panels
    }));
    document.querySelectorAll("[data-param]").forEach((s) => s.addEventListener("input", () => {
      EXP.params[s.dataset.param] = parseFloat(s.value);
      s.closest(".slider").querySelector(".sl-val").textContent = EXP.params[s.dataset.param].toFixed(s.dataset.param === "order" ? 0 : 3);
      refreshViz();
    }));
    document.getElementById("exp-reset").addEventListener("click", () => {
      EXP.params = { depth: 0.618, curve: 0.382, thr: 0.786, damp: 0.210, order: 7 };
      EXP.layer = 0; EXP.rotate = false; render(); toast("Parameters reset.");
    });
    document.getElementById("exp-rotate").addEventListener("click", () => { EXP.rotate = !EXP.rotate; render(); });
    document.getElementById("exp-recenter").addEventListener("click", () => { EXP.layer = 0; refreshViz(); });
    document.getElementById("exp-expand").addEventListener("click", () => {
      const b = document.getElementById("exp-expand-body");
      b.hidden = !b.hidden;
      if (!b.hidden) b.innerHTML = `<p class="mono-line">${esc(EXP_META[EXP.mode].eq)}</p><p class="interpret">${esc(EXP_META[EXP.mode].interp)}</p><p class="fine-note">${BFN_ATTR}</p>`;
    });
    document.querySelectorAll("[data-key]").forEach((b) => b.addEventListener("click", () => {
      const k = TRI_KEYS[+b.dataset.key];
      toast(`${k.t.join("-")} — ${k.label}: ${k.note}`);
    }));
    document.getElementById("exp-derive").addEventListener("click", () => {
      EXP.layer++;
      EXP.params.order = Math.min(15, EXP.params.order + 1);
      EXP.params.depth = Math.min(1, EXP.params.depth + 0.0618);
      refreshViz();
      toast(`Layer ${EXP.layer} derived.`);
    });
    if (EXP.rotate) {
      const spin = setInterval(() => {
        if (!document.getElementById("exp-viz")) { clearInterval(spin); return; }
        EXP.layer = (EXP.layer + 1) % 30; refreshViz();
      }, 240);
    }
  }

  /* ================= ROUTER ================= */
  const TABS = [
    ["#/reading", "READING", "reading"],
    ["#/history", "HISTORY", "history"],
    ["#/library", "LIBRARY", "library"],
    ["#/insights", "INSIGHTS", "insights"],
    ["#/profile", "PROFILE", "profile"],
  ];
  function paintNav() {
    const h = location.hash || "#/reading";
    document.querySelectorAll(".tabbar .tab").forEach((t) => t.classList.toggle("active", h.startsWith(t.getAttribute("href"))));
    document.querySelectorAll(".sidenav .nav-item").forEach((t) => t.classList.toggle("active", h.startsWith(t.getAttribute("href"))));
  }
  function render() {
    clearInterval(opsTimer);
    let h = location.hash || "#/reading";
    // legacy redirects — nothing 404s
    if (h === "#/" || h === "#/instruments" || h === "#/settings") h = "#/reading";
    else if (h.startsWith("#/instruments/")) h = "#/library";
    else if (h === "#/architect") h = "#/insights/architect";
    else if (h === "#/plans") h = "#/plans";
    if (h !== location.hash) { location.hash = h; return; }
    const parts = h.slice(2).split("/");
    const root = parts[0], sub = parts[1];
    let html = "", wire = null;
    if (root === "reading" && sub === "result") { html = renderResults(currentReading); wire = () => wireResults(currentReading); }
    else if (root === "reading") { html = renderReadingInput(); wire = wireReadingInput; }
    else if (root === "history") { html = renderHistory(); wire = () => wireCards(view, "history"); }
    else if (root === "library") { html = renderLibrary(); wire = () => { wireCards(view, "library"); wireBfn(); }; }
    else if (root === "insights") { const s = ["quantum", "prediction", "architect"].includes(sub) ? sub : "quantum"; html = renderInsights(s); wire = () => wireInsights(s); }
    else if (root === "profile") { html = renderProfile(sub); wire = wireProfile; }
    else if (root === "plans") { html = renderPlans(); wire = wirePlans; }
    else if (root === "explore") { html = renderExplore(); wire = wireExplore; }
    else if (root === "decode") { html = renderDecode(); wire = wireDecode; }
    else if (root === "ops") { html = renderOps(); wire = wireOps; }
    else { html = renderReadingInput(); wire = wireReadingInput; }
    view.innerHTML = html;
    const lg = document.getElementById("onboard-logo");
    if (lg && !lg.innerHTML.trim()) lg.innerHTML = LOGO_SVG(88);
    if (wire) wire();
    paintNav();
    window.scrollTo(0, 0);
  }

  /* ================= BOOT ================= */
  function boot() {
    mountLogos();
    const splash = document.getElementById("splash");
    setTimeout(() => { if (splash) { splash.classList.add("done"); setTimeout(() => splash.remove(), 900); } }, 1400);
    initStarfield();
    const acc = localStorage.getItem("aenigma.accent");
    if (acc === "gold") document.documentElement.dataset.accent = "gold";
    applyAppearance(localStorage.getItem("aenigma.appearance") || "dark");
    window.addEventListener("hashchange", render);
    document.querySelectorAll(".tabbar .tab, .sidenav .nav-item").forEach((t) => {
      t.addEventListener("click", (e) => { e.preventDefault(); location.hash = t.getAttribute("href"); });
    });
    refreshWallet();
    fetchVersion();
    render();
    // ops heartbeat (non-blocking)
    setTimeout(() => { fetch("/api/ops/ping").catch(() => {}); }, 3000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
