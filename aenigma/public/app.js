/* ÆNIGMA AI — front end (four views: landing, command center, reflection lab, archetype terminal) */
(() => {
  "use strict";

  const view = document.getElementById("view");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stateLabel = (a) => (a.state === "rising" ? "RISING" : a.state === "falling" ? "RECEDING" : "STEADY");

  // ------------------------------------------------------------- charts
  const lineColor = (st) => (st === "rising" ? "#0fa890" : st === "falling" ? "#e0512e" : "#8b63e8");

  function sparkline(hist, state, w = 64, h = 20) {
    const data = hist.slice(-14);
    const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / span) * (h - 4)}`).join(" ");
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="14-cycle trend, ${state}">
      <polyline points="${pts}" fill="none" stroke="${lineColor(state)}" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  // Main resonance chart: single series, area + 2px line, crosshair tooltip.
  function bigChart(a, cycles = 8) {
    const data = a.history.slice(-(cycles + 1));
    const w = 720, h = 220, padL = 34, padB = 22, padT = 10, padR = 12;
    const iw = w - padL - padR, ih = h - padT - padB;
    const x = (i) => padL + (i / (data.length - 1)) * iw;
    const y = (v) => padT + ih - (v / 100) * ih;
    const pts = data.map((v, i) => `${x(i)},${y(v)}`);
    const c = lineColor(a.state);
    const labels = data.map((_, i) => (i === data.length - 1 ? "now" : `${i - (data.length - 1)}`));
    const gridVals = [0, 25, 50, 75, 100];
    return `
    <div class="chart-wrap panel">
      <div class="chart-head"><span>RESONANCE · LAST ${cycles} CYCLES</span>
        <span class="st-${a.state}">${a.delta > 0 ? "+" : ""}${a.delta} this cycle</span></div>
      <svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" data-sym="${a.sym}" data-cycles="${cycles}">
        <defs><linearGradient id="fill-${a.sym}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c}" stop-opacity="0.35"/><stop offset="100%" stop-color="${c}" stop-opacity="0.02"/>
        </linearGradient></defs>
        ${gridVals.map((g) => `<line class="gridline" x1="${padL}" x2="${w - padR}" y1="${y(g)}" y2="${y(g)}"/>
          <text x="${padL - 6}" y="${y(g) + 3}" text-anchor="end">${g}</text>`).join("")}
        <polygon points="${padL},${y(0)} ${pts.join(" ")} ${x(data.length - 1)},${y(0)}" fill="url(#fill-${a.sym})"/>
        <polyline points="${pts.join(" ")}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
        ${data.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${c}"
            ${i === data.length - 1 ? `stroke="#0d1117" stroke-width="2" r="4"` : ""}></circle>`).join("")}
        ${labels.map((l, i) => `<text x="${x(i)}" y="${h - 6}" text-anchor="middle">${l}</text>`).join("")}
        <rect class="hover-zone" x="${padL}" y="${padT}" width="${iw}" height="${ih}" fill="transparent"/>
      </svg>
    </div>`;
  }

  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 3200);
  }

  /* Live animated starfield wallpaper — single canvas, rAF, pauses when hidden. */
  function initStarfield() {
    const cv = document.getElementById("stars");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, stars = [], nebs = [];
    let px = 0, py = 0, tpx = 0, tpy = 0; // parallax current/target
    let raf = 0, last = 0;
    let shoot = null, nextShoot = 0;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.max(140, Math.min(300, Math.round((W * H) / 6500)));
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.4 + Math.random() * 1.2,
          a: 0.25 + Math.random() * 0.65,
          sp: 0.4 + Math.random() * 1.6, ph: Math.random() * Math.PI * 2,
          vx: 1.5 + Math.random() * 4, // px/sec, very slow drift
          teal: Math.random() < 0.22,
        });
      }
      nebs = [];
      for (let i = 0; i < 3; i++) {
        nebs.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 140 + Math.random() * 220,
          ph: Math.random() * Math.PI * 2, sp: 0.05 + Math.random() * 0.06,
          a: 0.04 + Math.random() * 0.035,
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      // ease parallax toward target
      px += (tpx - px) * 0.045; py += (tpy - py) * 0.045;
      const sec = t / 1000;

      // nebula blobs (behind stars)
      for (const nb of nebs) {
        const nx = nb.x + Math.sin(sec * nb.sp + nb.ph) * 40 + px * 0.3;
        const ny = nb.y + Math.cos(sec * nb.sp * 0.8 + nb.ph) * 30 + py * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nb.r);
        g.addColorStop(0, `rgba(47,230,200,${nb.a})`);
        g.addColorStop(1, "rgba(47,230,200,0)");
        ctx.fillStyle = g;
        ctx.fillRect(nx - nb.r, ny - nb.r, nb.r * 2, nb.r * 2);
      }

      // stars
      for (const s of stars) {
        s.x += s.vx * dt; if (s.x > W + 4) { s.x = -4; s.y = Math.random() * H; }
        const tw = 0.55 + 0.45 * Math.sin(sec * s.sp + s.ph);
        const al = Math.max(0, Math.min(1, s.a * tw));
        ctx.beginPath();
        ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.teal
          ? `rgba(120,240,215,${(al).toFixed(3)})`
          : `rgba(235,242,248,${(al).toFixed(3)})`;
        ctx.fill();
      }

      // shooting star every 8–15 s
      if (!shoot && sec * 1000 > nextShoot) {
        const sx = Math.random() * W * 0.7 + W * 0.15;
        shoot = { x: sx, y: -20, vx: -(260 + Math.random() * 260), vy: 200 + Math.random() * 160, life: 1 };
        nextShoot = sec * 1000 + 8000 + Math.random() * 7000;
      }
      if (shoot) {
        shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt; shoot.life -= dt * 1.25;
        if (shoot.life <= 0 || shoot.y > H + 40) shoot = null;
        else {
          const len = 90 * shoot.life;
          const ang = Math.atan2(shoot.vy, shoot.vx);
          const tx = shoot.x - Math.cos(ang) * len, ty = shoot.y - Math.sin(ang) * len;
          const grad = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
          grad.addColorStop(0, `rgba(200,255,245,${(0.85 * shoot.life).toFixed(3)})`);
          grad.addColorStop(1, "rgba(47,230,200,0)");
          ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(shoot.x + px, shoot.y + py); ctx.lineTo(tx + px, ty + py); ctx.stroke();
        }
      }
    }

    function frame(t) {
      draw(t);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    let rT = 0;
    window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(resize, 180); });
    window.addEventListener("pointermove", (e) => {
      tpx = ((e.clientX / W) - 0.5) * -22; tpy = ((e.clientY / H) - 0.5) * -22;
    }, { passive: true });
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null || e.beta == null) return;
      tpx = Math.max(-22, Math.min(22, (e.gamma / 45) * -22));
      tpy = Math.max(-22, Math.min(22, ((e.beta - 45) / 45) * -22));
    });
    document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });

    resize();
    nextShoot = performance.now() + 5000 + Math.random() * 6000;
    if (reduced) { draw(performance.now()); } // one static frame
    else start();
  }


/* ============================================================
   NEW VIEWS — Reading · Corpus · Quantum · Prediction · Architect
   (aenigma-redesign) — all client-side, no new server endpoints.
   ============================================================ */

/* ---------------- shared harmonic math ---------------- */
const BFN_ATTR = "Framework proposed by Robert Edward Grant — his system, not established mathematics.";

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
  1: { name: "The Reformer",     stress: 4, growth: 7 },
  2: { name: "The Helper",       stress: 8, growth: 4 },
  3: { name: "The Achiever",     stress: 9, growth: 6 },
  4: { name: "The Individualist",stress: 2, growth: 1 },
  5: { name: "The Investigator", stress: 7, growth: 8 },
  6: { name: "The Loyalist",     stress: 3, growth: 9 },
  7: { name: "The Enthusiast",   stress: 1, growth: 5 },
  8: { name: "The Challenger",   stress: 5, growth: 2 },
  9: { name: "The Peacemaker",   stress: 6, growth: 3 },
};

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

/* ---------------- bar chart ---------------- */
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

/* ---------------- context handoff ---------------- */
function askArchitect(ctx) {
  try { localStorage.setItem("aenigma.architect.context", JSON.stringify(ctx)); } catch (e) {}
  location.hash = "#/";
}
function readArchitectContext() {
  try {
    const raw = localStorage.getItem("aenigma.architect.context");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

/* ============================================================
   VIEW — Reading (#/reading)
   ============================================================ */
const LAYER_DESC = {
  "Substrate": (v) => `The ground you stand on: harmonic residue ${v} — the base-12 remainder your birth reduces to. Low numbers dig; high numbers broadcast.`,
  "Ego/Mind": (v) => `The operating system: life-path ${v} — how your mind organizes experience into a story it can carry.`,
  "Spiritual Catalyst": (v) => `The friction that wakes you: ${v} — the month-day tension that keeps the comfortable from going numb.`,
  "Intention Factor": (v) => `The direction you chose before you arrived: ${v} — the year's residue, what the era asked of you.`,
  "Mirror Recursion": (v) => `The loop you complete: ${v} — day × month reduced, the pattern that repeats until it is seen.`,
  "Metatron Mode": (v) => `The geometry you build in: ${v} — life-path folded with birth-day, the shape your becoming takes.`,
};

function computeReading(dob, tob, loc) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || "");
  if (!m) return `<div class="panel"><p style="color:var(--fall);margin:0">Enter a valid birth date.</p></div>`;
  const y = +m[1], mo = +m[2], d = +m[3];
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
  const arith = (r, label) =>
    `<li><span class="k">${label}</span><span class="v">${r.steps.length ? r.steps.map((s) => `${s.from} → ${s.sum}`).join(" → ") + " → " : ""}${r.value}</span></li>`;

  return `
  <div class="panel"><h3>BIRTH ARCHITECTURE — ${esc(dob)}${tob ? " · " + esc(tob) : ""}${loc ? " · " + esc(loc) : ""}</h3>
    <ul class="kv">
      ${arith(lp, "Life-path")}
      ${arith(bd, "Birth-day")}
      ${arith(py, "Personal year (" + nowY + ")")}
      <li><span class="k">Substrate (BFN base-12)</span><span class="v">${sub.steps.length ? sub.steps.map((s) => `${s.from} → (${s.base12})₁₂ → ${s.sum}`).join(" → ") + " → " : ""}${sub.value}</span></li>
    </ul></div>

  <div class="panel" style="margin-top:14px"><h3>HARMONIC SYNTHESIS — SIX LAYERS</h3>
    <ul class="kv">${layers.map(([n, v]) => `<li><span class="k">${n}</span><span class="v">${v} — <span style="font-weight:400;color:var(--ink-2)">${LAYER_DESC[n](v)}</span></span></li>`).join("")}</ul></div>

  <div class="panel" style="margin-top:14px"><h3>ENNEAGRAM</h3>
    <ul class="kv">
      <li><span class="k">Core type</span><span class="v">${core} — ${en.name}</span></li>
      <li><span class="k">Wing</span><span class="v">${core}w${wing}</span></li>
      <li><span class="k">Instinctual variant</span><span class="v">${variant}</span></li>
      <li><span class="k">Stress →</span><span class="v">moves toward ${en.stress} (${ENNEA[en.stress].name})</span></li>
      <li><span class="k">Growth →</span><span class="v">moves toward ${en.growth} (${ENNEA[en.growth].name})</span></li>
    </ul></div>

  <div class="panel" style="margin-top:14px"><h3>CODEX ARCHETYPE — ${codex}</h3>
    <p style="margin:0 0 6px;color:var(--gold);font-size:13px;letter-spacing:.08em">${esc(cx.title)} · ${esc(cx.sub)}</p>
    <ul class="kv">
      <li><span class="k">Signature</span><span class="v" style="font-weight:400;text-align:left">${esc(cx.sig)}</span></li>
      <li><span class="k">Shadow</span><span class="v" style="font-weight:400;text-align:left">${esc(cx.shadow)}</span></li>
    </ul></div>

  <div class="panel" style="margin-top:14px"><h3>GRANT MATHEMATICS — YOUR POSITION</h3>
    <ul class="kv">
      <li><span class="k">BFN harmonic number</span><span class="v">${sub.value} (base-12 residue of ${stamp})</span></li>
      <li><span class="k">Resonant Triangular Key</span><span class="v">${key.t.join("-")} — ${key.label}</span></li>
      <li><span class="k">Toroid charge (odd digits)</span><span class="v">${toroid} — conscious · multiplicative · closed</span></li>
      <li><span class="k">Hyperboloid charge (even digits)</span><span class="v">${hyper} — unconscious · additive · open</span></li>
      <li><span class="k">Lens polarity</span><span class="v" style="color:var(--gold)">${dom}</span></li>
    </ul>
    <div class="grant-note">${BFN_ATTR}</div>
    <div><button class="btn ghost" id="reading-ask" type="button">Ask Architect about this reading →</button></div>
  </div>`;
}

function readingView() {
  return `
    <p class="eyebrow">PERSONAL READING ENGINE · CLIENT-SIDE</p>
    <h1 class="page">Your Reading</h1>
    <p class="lede">Birth data in, architecture out — six layers, computed in your browser, nothing leaves the device.</p>
    <div class="panel"><div class="form-grid">
      <div class="form-row">
        <label>DATE OF BIRTH<input type="date" id="rd-dob" /></label>
        <label>TIME OF BIRTH<input type="time" id="rd-tob" /></label>
      </div>
      <label>LOCATION OF BIRTH<input type="text" id="rd-loc" placeholder="City, State/Country" /></label>
      <div><button class="btn" id="rd-go" type="button">Generate Reading</button></div>
    </div></div>
    <div id="rd-out" style="margin-top:16px"></div>
    <p class="chat-disclaimer" style="margin-top:14px">A symbolic mirror for self-reflection — not a claim about who you are, and not advice.</p>`;
}

function wireReading() {
  const go = document.getElementById("rd-go");
  if (!go) return;
  try {
    const p = JSON.parse(localStorage.getItem("aenigma.profile.v1") || "null");
    if (p) {
      const dob = document.getElementById("rd-dob"), tob = document.getElementById("rd-tob"), loc = document.getElementById("rd-loc");
      if (dob && p.dob && !dob.value) dob.value = p.dob;
      if (tob && p.tob && !tob.value) tob.value = p.tob;
      if (loc && p.bcity && !loc.value) loc.value = p.bcity;
    }
  } catch (e) {}
  const run = () => {
    const out = document.getElementById("rd-out");
    const dob = document.getElementById("rd-dob").value;
    const tob = document.getElementById("rd-tob").value;
    const loc = document.getElementById("rd-loc").value.trim();
    out.innerHTML = computeReading(dob, tob, loc) + mcUpsell();
    const ask = document.getElementById("reading-ask");
    if (ask) ask.addEventListener("click", () =>
      askArchitect({ from: "reading", dob, tob, loc, summary: `Birth reading for ${dob}${loc ? " · " + loc : ""}` }));
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  go.addEventListener("click", run);
}

/* ============================================================
   VIEW — My Profile (#/profile)
   ============================================================ */
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
function profileLetterPanel(name) {
  const n = String(name || "").trim();
  if (n.length < 2) return `<p style="color:var(--ink-3);font-size:12.5px">Type your full birth name above — letter-number readouts appear live.</p>`;
  const ex = letterSum(n, "all"), so = letterSum(n, "vowel"), pe = letterSum(n, "cons");
  const row = (label, r) =>
    `<li><span class="k">${label}</span><span class="v mono">${r.total} → ${r.steps.length ? r.steps.map((s) => s.sum).join(" → ") + " → " : ""}${r.value}</span></li>`;
  return `<ul class="kv">${row("Expression (all letters)", ex)}${row("Soul Urge (vowels)", so)}${row("Personality (consonants)", pe)}</ul>
    <p style="font-size:11px;color:var(--ink-3);margin:8px 0 0">Letter-number play — a symbolic exercise computed live in your browser, not established numerology. Pythagorean mapping A=1…I=9, J=1…</p>`;
}
const MBTI_TYPES = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];
const VOCATIONS = ["Creator","Builder","Healer","Teacher","Explorer","Guardian","Strategist","Artist","Founder","Guide","Researcher","Other"];
function utcOptions(sel) {
  let h = "";
  for (let i = -12; i <= 14; i++) {
    const s = (i >= 0 ? "+" : "") + i;
    h += `<option value="${i}"${String(sel) === String(i) ? " selected" : ""}>UTC${s}</option>`;
  }
  return h;
}
function profileView() {
  const p = loadProfile() || {};
  const opt = (list, sel) => list.map((v) => `<option${v === sel ? " selected" : ""}>${v}</option>`).join("");
  return `
    <p class="eyebrow">IDENTITY · STORED ON THIS DEVICE ONLY</p>
    <h1 class="page">My Profile</h1>
    <p class="lede">One profile feeds every calculator — Reading, BFN, predictions. Saved in this browser's localStorage; nothing is uploaded.</p>
    <div class="panel"><h3>IDENTITY</h3><div class="form-grid">
      <label>FULL BIRTH NAME<input type="text" id="pf-name" value="${esc(p.name || "")}" placeholder="e.g. Joshua Reed McCullough" autocomplete="off" /></label>
      <div class="form-row">
        <label>SEX<select id="pf-sex"><option value="">—</option>${opt(["Male","Female"], p.sex)}</select></label>
        <label>VOCATION<select id="pf-voc"><option value="">—</option>${opt(VOCATIONS, p.vocation)}</select></label>
      </div>
    </div></div>
    <div class="panel" style="margin-top:14px"><h3>LETTER-NUMBER READOUT — LIVE</h3><div id="pf-letters">${profileLetterPanel(p.name)}</div></div>
    <div class="panel" style="margin-top:14px"><h3>BIRTH DATA</h3><div class="form-grid">
      <div class="form-row">
        <label>DATE OF BIRTH<input type="date" id="pf-dob" value="${esc(p.dob || "")}" /></label>
        <label>TIME OF BIRTH<input type="time" id="pf-tob" value="${esc(p.tob || "")}" /></label>
      </div>
      <div class="form-row">
        <label>UTC OFFSET<select id="pf-utc">${utcOptions(p.utc)}</select></label>
        <label>BIRTH CITY<input type="text" id="pf-bcity" value="${esc(p.bcity || "")}" placeholder="City, State/Country" autocomplete="off" /></label>
      </div>
      <label>CURRENT RESIDENCE<input type="text" id="pf-res" value="${esc(p.res || "")}" placeholder="City, State/Country" autocomplete="off" /></label>
    </div></div>
    <div class="panel" style="margin-top:14px"><h3>TYPOLOGY</h3><div class="form-grid">
      <div class="form-row">
        <label>MBTI<select id="pf-mbti"><option value="">—</option>${opt(MBTI_TYPES, p.mbti)}</select></label>
        <label>ENNEAGRAM<select id="pf-ennea"><option value="">—</option>${opt(["1","2","3","4","5","6","7","8","9"], p.ennea)}</select></label>
      </div>
      <label>WING<select id="pf-wing"><option value="">—</option>${opt(["1w2","2w1","2w3","3w2","3w4","4w3","4w5","5w4","5w6","6w5","6w7","7w6","7w8","8w7","8w9","9w8","9w1"], p.wing)}</select></label>
    </div></div>
    <div class="scal-actions" style="margin-top:16px">
      <button class="btn" id="pf-save" type="button">Save Profile</button>
      <button class="btn ghost" id="pf-apply" type="button">Apply to All Calculators</button>
      <button class="btn ghost" id="pf-clear" type="button">Clear</button>
    </div>
    <div id="pf-status" style="margin-top:10px;font-size:12.5px;color:var(--ink-2)"></div>
    <p class="chat-disclaimer" style="margin-top:14px">No natal charts are fabricated here — only what is actually computable: digital roots, letter sums, and shown-arithmetic reductions.</p>`;
}
function wireProfile() {
  const name = document.getElementById("pf-name");
  const letters = document.getElementById("pf-letters");
  if (name && letters) name.addEventListener("input", () => { letters.innerHTML = profileLetterPanel(name.value); });
  const collect = () => ({
    name: (document.getElementById("pf-name") || {}).value || "",
    sex: (document.getElementById("pf-sex") || {}).value || "",
    vocation: (document.getElementById("pf-voc") || {}).value || "",
    dob: (document.getElementById("pf-dob") || {}).value || "",
    tob: (document.getElementById("pf-tob") || {}).value || "",
    utc: (document.getElementById("pf-utc") || {}).value || "",
    bcity: (document.getElementById("pf-bcity") || {}).value || "",
    res: (document.getElementById("pf-res") || {}).value || "",
    mbti: (document.getElementById("pf-mbti") || {}).value || "",
    ennea: (document.getElementById("pf-ennea") || {}).value || "",
    wing: (document.getElementById("pf-wing") || {}).value || "",
  });
  const status = (t) => { const s = document.getElementById("pf-status"); if (s) s.textContent = t; };
  const save = document.getElementById("pf-save");
  if (save) save.addEventListener("click", () => { saveProfile(collect()); status("Profile saved on this device."); toast("Profile saved."); });
  const apply = document.getElementById("pf-apply");
  if (apply) apply.addEventListener("click", () => {
    saveProfile(collect());
    status("Profile saved and applied — Reading and the BFN calculator will pick it up.");
    toast("Applied to all calculators.");
  });
  const clear = document.getElementById("pf-clear");
  if (clear) clear.addEventListener("click", () => {
    try { localStorage.removeItem(PROF_LS); } catch (e) {}
    ["pf-name","pf-sex","pf-voc","pf-dob","pf-tob","pf-utc","pf-bcity","pf-res","pf-mbti","pf-ennea","pf-wing"].forEach((id) => {
      const el = document.getElementById(id); if (el) el.value = "";
    });
    if (letters) letters.innerHTML = profileLetterPanel("");
    status("Profile cleared.");
  });
}

/* ============================================================
   VIEW — Corpus (#/corpus)
   ============================================================ */
function keyCards() {
  return TRI_KEYS.map((k, i) => `
    <div class="key-card${i === 0 ? " seed" : ""}" data-key="${i}" role="button" tabindex="0">
      <div class="tri">${k.t.join("–")}</div>
      <div class="flabel">${k.label}</div>
      <div class="deriv"><p style="margin:0 0 6px"><b style="color:var(--gold)">${k.force.toUpperCase()}</b> — ${esc(k.note)}</p>
        <p style="margin:0">${esc(k.deriv)}</p></div>
    </div>`).join("");
}

function corpusView() {
  return `
    <p class="eyebrow">MATHEMATICAL CORPUS · GRANT'S FRAMEWORKS</p>
    <h1 class="page">The Corpus</h1>
    <p class="lede">The harmonic mathematics underneath ÆNIGMA — explored as proposed frameworks, attributed to their author, never as settled theorems.</p>

    <div class="eq-hero">((x²+y²)+1)<sup>((x²+y²)+1)</sup> = x²−y²</div>
    <p class="eq-sub">THE LENS EQUATION — TOROID × HYPERBOLOID</p>

    <div class="triptych">
      <div><h4>TOROID ×</h4>
        <p>((x²+y²)+1) raised to itself.<br><br>Multiplicative · Recursive · Closed · Conscious.<br><br><i>"The self-referential substrate that folds back on itself."</i></p></div>
      <div><h4>FOCAL RING r=1 · =</h4>
        <p>At the Shared Monad (x²+y²=0) the left side collapses to 1¹=1, giving x²−y²=1 — the one locus where both geometries coincide.</p></div>
      <div><h4>HYPERBOLOID +</h4>
        <p>x²−y².<br><br>Additive · Open · Unconscious.<br><br><i>"The unbounded substrate extending without recursion."</i></p></div>
    </div>

    <div class="lens-cards">
      <div class="lens-card"><div class="eq">1 + 0 = 1</div><div class="cap">THE LENS EQUATIONS — SUPERPOSITION WITHOUT COLLAPSE</div></div>
      <div class="lens-card"><div class="eq">1 × 0 = 0</div><div class="cap">THE LENS EQUATIONS — SUPERPOSITION WITHOUT COLLAPSE</div></div>
    </div>

    <div class="panel" style="margin-bottom:18px"><h3>LENS EVALUATOR — TRY X, Y</h3>
      <div class="form-grid"><div class="form-row">
        <label>X<input type="number" id="lens-x" value="1" step="0.1" min="-3" max="3" /></label>
        <label>Y<input type="number" id="lens-y" value="0" step="0.1" min="-3" max="3" /></label>
      </div>
      <div><button class="btn" id="lens-go" type="button">Evaluate</button></div>
      <div id="lens-out"></div></div></div>

    <h3 style="margin:22px 0 4px;font-size:15px;letter-spacing:.06em">THE TRIANGULAR KEYS</h3>
    <p style="color:var(--ink-2);font-size:13px;max-width:70ch">Seven primitive Pythagorean triples in the superparticular corridor (c = b+1) — a self-generating cascade from a single seed triangle. Factor interlocking: sum(a+b) of each triple = diff(b−a) of the next. Tap a card for its derivation.</p>
    <div class="key-grid">${keyCards()}</div>

    <div class="panel" style="margin-top:18px"><h3>BFN SUPER CALCULATOR</h3>
      <p style="font-size:12px;color:var(--ink-3);margin:-6px 0 12px">High-precision engine (cap 10K digits) · operands, functions, codex constants, history, number analysis.</p>
      <div class="scal-grid">
        <div>
          <div class="form-grid">
            <div class="form-row">
              <label>A<input type="text" id="sc-a" class="mono" inputmode="decimal" placeholder="0" autocomplete="off" /></label>
              <label>B<input type="text" id="sc-b" class="mono" inputmode="decimal" placeholder="0" autocomplete="off" /></label>
            </div>
            <div class="form-row">
              <label>PRECISION (DIGITS)<select id="sc-prec" class="mono">
                <option value="50">50</option><option value="100" selected>100</option>
                <option value="500">500</option><option value="1000">1K</option><option value="10000">10K</option>
              </select></label>
              <label>ANGLE MODE<select id="sc-ang" class="mono"><option value="rad">RADIANS</option><option value="deg">DEGREES</option></select></label>
            </div>
          </div>
          <div class="scal-keypad" id="sc-keys">
            <button type="button" data-k="C" class="kbd k-gold">C</button><button type="button" data-k="⌫" class="kbd k-gold">⌫</button><button type="button" data-k="(" class="kbd">(</button><button type="button" data-k=")" class="kbd">)</button>
            <button type="button" data-k="7" class="kbd">7</button><button type="button" data-k="8" class="kbd">8</button><button type="button" data-k="9" class="kbd">9</button><button type="button" data-k="÷" class="kbd k-op">÷</button>
            <button type="button" data-k="4" class="kbd">4</button><button type="button" data-k="5" class="kbd">5</button><button type="button" data-k="6" class="kbd">6</button><button type="button" data-k="×" class="kbd k-op">×</button>
            <button type="button" data-k="1" class="kbd">1</button><button type="button" data-k="2" class="kbd">2</button><button type="button" data-k="3" class="kbd">3</button><button type="button" data-k="−" class="kbd k-op">−</button>
            <button type="button" data-k="0" class="kbd">0</button><button type="button" data-k="." class="kbd">.</button><button type="button" data-k="^" class="kbd">^</button><button type="button" data-k="+" class="kbd k-op">+</button>
            <button type="button" data-k="=" class="kbd k-eq">=</button>
          </div>
          <div class="scal-actions">
            <button class="btn ghost" id="sc-copy" type="button">Copy Result</button>
            <button class="btn ghost" id="sc-usea" type="button">Use Result as A</button>
            <button class="btn ghost" id="sc-clear" type="button">Clear</button>
            <button class="btn ghost" id="sc-birth" type="button">Birth Digits → A</button>
          </div>
        </div>
        <div class="scal-fns">
          <div class="scal-fn-group"><h4>TRIG</h4>
            <button class="fbtn" data-f="sin" type="button">sin</button><button class="fbtn" data-f="cos" type="button">cos</button><button class="fbtn" data-f="tan" type="button">tan</button></div>
          <div class="scal-fn-group"><h4>HYPERBOLIC</h4>
            <button class="fbtn" data-f="sinh" type="button">sinh</button><button class="fbtn" data-f="cosh" type="button">cosh</button><button class="fbtn" data-f="tanh" type="button">tanh</button></div>
          <div class="scal-fn-group"><h4>POWERS &amp; ROOTS</h4>
            <button class="fbtn" data-f="pow" type="button">A^B</button><button class="fbtn" data-f="sq" type="button">A²</button><button class="fbtn" data-f="cb" type="button">A³</button><button class="fbtn" data-f="sqrt" type="button">√A</button><button class="fbtn" data-f="cbrt" type="button">∛A</button></div>
          <div class="scal-fn-group"><h4>LOGS</h4>
            <button class="fbtn" data-f="ln" type="button">ln A</button><button class="fbtn" data-f="log10" type="button">log₁₀ A</button></div>
          <div class="scal-fn-group"><h4>SPECIAL</h4>
            <button class="fbtn" data-f="gamma" type="button">Γ(A)</button><button class="fbtn" data-f="round" type="button">round A</button></div>
          <div class="scal-fn-group"><h4>CODEX CONSTANTS</h4>
            <button class="fbtn k-const" data-c="1.61803398874989484820" type="button">φ phio</button><button class="fbtn k-const" data-c="0.61803398874989484820" type="button">χ chi</button><button class="fbtn k-const" data-c="3.14159265358979323846" type="button">π</button><button class="fbtn k-const" data-c="2.71828182845904523536" type="button">e</button></div>
        </div>
      </div>
      <div class="scal-result"><div class="scal-res-label">RESULT</div><div class="scal-res mono" id="sc-res">—</div></div>
      <div class="scal-history"><h4>CALCULATION HISTORY</h4><div id="sc-hist" class="hist-list"><p class="hist-empty">No calculations yet.</p></div></div>
      <div class="scal-analysis"><h4>NUMBER ANALYSIS</h4>
        <div class="form-grid"><label>NUMBER<input type="text" id="sc-na" class="mono" inputmode="numeric" placeholder="19890830" autocomplete="off" /></label>
        <div class="scal-actions">
          <button class="btn ghost" id="sc-dr" type="button">Digital Root</button>
          <button class="btn ghost" id="sc-dc" type="button">Digit Counter</button>
          <button class="btn ghost" id="sc-b12" type="button">BFN-12 Residue</button>
        </div><div id="sc-na-out"></div></div></div>
      <div class="grant-note">${BFN_ATTR} Integer arithmetic runs on BigInt (true arbitrary precision, capped at 10K digits for sanity); decimals and transcendental functions use IEEE-754 floats (~17 significant digits real).</div>
    </div>

    <div class="grant-note">${BFN_ATTR} The Triangular Keys cascade and Lens equation are presented as Grant published them.</div>
    <div style="margin-top:10px"><button class="btn ghost" id="corpus-ask" type="button">Ask Architect about the Corpus →</button></div>`;
}

/* ---------------- BFN Super Calculator engine ---------------- */
const SC_HIST_LS = "aenigma.calc.hist";
function scHist() { try { return JSON.parse(localStorage.getItem(SC_HIST_LS)) || []; } catch (e) { return []; } }
function scHistPush(expr, result) {
  try {
    const h = scHist();
    h.unshift({ expr: String(expr).slice(0, 120), result: String(result).slice(0, 400) });
    localStorage.setItem(SC_HIST_LS, JSON.stringify(h.slice(0, 30)));
  } catch (e) {}
}
function gammaFn(z) {
  const C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
  z -= 1;
  let x = C[0];
  for (let i = 1; i < 9; i++) x += C[i] / (z + i);
  const t = z + 7.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
function scEval(expr) {
  const clean = String(expr).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
  if (!clean || !/^[\d.+eE*\/^()\-]+$/.test(clean)) throw new Error("invalid expression");
  const toks = clean.match(/(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|[+\-*/^()])/g);
  if (!toks) throw new Error("invalid expression");
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 4, u: 3 };
  const out = [], ops = [];
  let prev = null;
  for (const t of toks) {
    if (/^\d/.test(t) || t[0] === ".") { out.push(parseFloat(t)); prev = "n"; }
    else if (t === "(") { ops.push(t); prev = "("; }
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop());
      if (!ops.length) throw new Error("mismatched parentheses");
      ops.pop(); prev = "n";
    } else {
      let op = t;
      if (t === "-" && (prev === null || prev === "(" || prev === "o")) op = "u";
      while (ops.length && ops[ops.length - 1] !== "(") {
        const top = ops[ops.length - 1];
        if ((prec[top] > prec[op]) || (prec[top] === prec[op] && op !== "^" && op !== "u")) out.push(ops.pop());
        else break;
      }
      ops.push(op); prev = "o";
    }
  }
  while (ops.length) { const o = ops.pop(); if (o === "(") throw new Error("mismatched parentheses"); out.push(o); }
  const st = [];
  for (const t of out) {
    if (typeof t === "number") st.push(t);
    else if (t === "u") { if (!st.length) throw new Error("bad expression"); st.push(-st.pop()); }
    else {
      if (st.length < 2) throw new Error("bad expression");
      const b = st.pop(), a = st.pop();
      st.push(t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : t === "/" ? a / b : Math.pow(a, b));
    }
  }
  if (st.length !== 1) throw new Error("bad expression");
  return st[0];
}
function scEvalBig(expr) {
  // True arbitrary-precision path for pure integer arithmetic via BigInt.
  // Returns a digit string, or null when the expression is not integer-only.
  const clean = String(expr).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
  if (!clean || !/^[\d+\-*/^()]+$/.test(clean) || /[.]/.test(clean)) return null;
  try {
    const toks = clean.match(/(\d+|[+\-*/^()])/g);
    if (!toks || toks.some((t) => t === "/")) return null; // BigInt division truncates — refuse, stay honest
    const prec = { "+": 1, "-": 1, "*": 2, "^": 4, u: 3 };
    const out = [], ops = [];
    let prev = null;
    for (const t of toks) {
      if (/^\d+$/.test(t)) { out.push(BigInt(t)); prev = "n"; }
      else if (t === "(") { ops.push(t); prev = "("; }
      else if (t === ")") {
        while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop());
        if (!ops.length) return null;
        ops.pop(); prev = "n";
      } else {
        let op = t;
        if (t === "-" && (prev === null || prev === "(" || prev === "o")) op = "u";
        while (ops.length && ops[ops.length - 1] !== "(") {
          const top = ops[ops.length - 1];
          if ((prec[top] > prec[op]) || (prec[top] === prec[op] && op !== "^" && op !== "u")) out.push(ops.pop());
          else break;
        }
        ops.push(op); prev = "o";
      }
    }
    while (ops.length) { const o = ops.pop(); if (o === "(") return null; out.push(o); }
    const st = [];
    for (const t of out) {
      if (typeof t === "bigint") st.push(t);
      else if (t === "u") { if (!st.length) return null; st.push(-st.pop()); }
      else {
        if (st.length < 2) return null;
        const b = st.pop(), a = st.pop();
        if (t === "^") {
          if (b < 0n || b > 100000n) return null;
          st.push(a ** b);
        }
        else st.push(t === "+" ? a + b : t === "-" ? a - b : a * b);
      }
    }
    if (st.length !== 1) return null;
    return st[0].toString();
  } catch (e) { return null; }
}
function scFmt(v, prec) {
  const p = Math.min(10000, Math.max(1, prec | 0 || 100));
  if (typeof v === "string") {
    // BigInt digit string: honor the precision cap honestly
    const neg = v[0] === "-";
    const d = neg ? v.slice(1) : v;
    if (d.length <= p) return v;
    return (neg ? "-" : "") + d.slice(0, p) + "… [" + d.length + " digits total]";
  }
  if (!isFinite(v)) return String(v);
  if (v === 0) return "0";
  const q = Math.min(100, p);
  let s = Number(v).toPrecision(q);
  if (s.includes("e") || s.includes("E")) return s + (p > 100 ? " · float path: ~17 significant digits real" : "");
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s + (p > 100 ? " · float path: ~17 significant digits real" : "");
}
function scShowResult(expr, val, prec) {
  const res = document.getElementById("sc-res");
  const txt = scFmt(val, prec);
  res.textContent = txt;
  res.dataset.raw = String(val);
  scHistPush(expr, txt);
  renderScHist();
}
function renderScHist() {
  const box = document.getElementById("sc-hist");
  if (!box) return;
  const h = scHist();
  box.innerHTML = h.length
    ? h.map((e, i) => `<button type="button" class="hist-item mono" data-i="${i}" title="Load result into A"><span class="h-expr">${esc(e.expr)}</span><span class="h-eq">=</span><span class="h-res">${esc(e.result.length > 60 ? e.result.slice(0, 60) + "…" : e.result)}</span></button>`).join("")
    : `<p class="hist-empty">No calculations yet.</p>`;
  box.querySelectorAll(".hist-item").forEach((b) => b.addEventListener("click", () => {
    const e = scHist()[+b.dataset.i];
    if (!e) return;
    const a = document.getElementById("sc-a");
    if (a) { a.value = e.result.length > 200 ? e.result.slice(0, 200) : e.result; a.focus(); }
    toast("Result loaded into A.");
  }));
}
function scActiveBox() {
  const a = document.getElementById("sc-a"), b = document.getElementById("sc-b");
  return (document.activeElement === b) ? b : a;
}
function wireSuperCalc() {
  const A = () => document.getElementById("sc-a");
  const B = () => document.getElementById("sc-b");
  const P = () => parseInt((document.getElementById("sc-prec") || {}).value || "100", 10);
  const angF = (x) => ((document.getElementById("sc-ang") || {}).value === "deg") ? x * Math.PI / 180 : x;
  const res = () => document.getElementById("sc-res");
  const keys = document.getElementById("sc-keys");
  if (keys) keys.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    const k = b.dataset.k, box = scActiveBox() || A();
    if (!box) return;
    if (k === "C") box.value = "";
    else if (k === "⌫") box.value = box.value.slice(0, -1);
    else if (k === "=") {
      try {
        const big = scEvalBig(box.value);
        scShowResult(box.value, big !== null ? big : scEval(box.value), P());
      }
      catch (err) { res().textContent = "Error: " + err.message; }
    }
    else box.value += k;
    box.focus();
  });
  document.querySelectorAll(".fbtn[data-f]").forEach((b) => b.addEventListener("click", () => {
    const a = parseFloat((A() && A().value) || "0"), bv = parseFloat((B() && B().value) || "0");
    if (!isFinite(a)) { res().textContent = "Error: A is not a number"; return; }
    const f = b.dataset.f;
    let v, expr;
    try {
      switch (f) {
        case "sin": v = Math.sin(angF(a)); expr = `sin(${a})`; break;
        case "cos": v = Math.cos(angF(a)); expr = `cos(${a})`; break;
        case "tan": v = Math.tan(angF(a)); expr = `tan(${a})`; break;
        case "sinh": v = Math.sinh(a); expr = `sinh(${a})`; break;
        case "cosh": v = Math.cosh(a); expr = `cosh(${a})`; break;
        case "tanh": v = Math.tanh(a); expr = `tanh(${a})`; break;
        case "pow": v = Math.pow(a, bv); expr = `${a}^${bv}`; break;
        case "sq": v = a * a; expr = `${a}²`; break;
        case "cb": v = a * a * a; expr = `${a}³`; break;
        case "sqrt": if (a < 0) throw new Error("√ of negative"); v = Math.sqrt(a); expr = `√${a}`; break;
        case "cbrt": v = Math.cbrt(a); expr = `∛${a}`; break;
        case "ln": if (a <= 0) throw new Error("ln of non-positive"); v = Math.log(a); expr = `ln(${a})`; break;
        case "log10": if (a <= 0) throw new Error("log of non-positive"); v = Math.log10(a); expr = `log₁₀(${a})`; break;
        case "gamma": v = gammaFn(a); expr = `Γ(${a})`; break;
        case "round": v = Math.round(a); expr = `round(${a})`; break;
        default: return;
      }
      scShowResult(expr, v, P());
    } catch (err) { res().textContent = "Error: " + err.message; }
  }));
  document.querySelectorAll(".fbtn[data-c]").forEach((b) => b.addEventListener("click", () => {
    const box = scActiveBox() || A();
    if (box) { box.value = b.dataset.c; box.focus(); }
  }));
  const copy = document.getElementById("sc-copy");
  if (copy) copy.addEventListener("click", async () => {
    const t = res() ? res().textContent : "";
    if (!t || t === "—") { toast("Nothing to copy."); return; }
    try { await navigator.clipboard.writeText(t); toast("Result copied."); }
    catch (e) { toast("Copy failed."); }
  });
  const usea = document.getElementById("sc-usea");
  if (usea) usea.addEventListener("click", () => {
    const r = res();
    if (r && A()) { A().value = (r.dataset.raw && r.dataset.raw !== "undefined") ? r.dataset.raw : r.textContent; toast("Result → A."); }
  });
  const clr = document.getElementById("sc-clear");
  if (clr) clr.addEventListener("click", () => {
    if (A()) A().value = ""; if (B()) B().value = "";
    if (res()) { res().textContent = "—"; delete res().dataset.raw; }
  });
  const birth = document.getElementById("sc-birth");
  if (birth) birth.addEventListener("click", () => {
    try {
      const p = JSON.parse(localStorage.getItem("aenigma.profile.v1") || "null");
      if (p && p.dob) { const d = p.dob.replace(/-/g, ""); if (A()) A().value = d; toast("Birth digits → A."); }
      else toast("Save a profile first (#/profile).");
    } catch (e) { toast("Save a profile first (#/profile)."); }
  });
  const naOut = () => document.getElementById("sc-na-out");
  const naVal = () => (document.getElementById("sc-na") || {}).value || "";
  const dr = document.getElementById("sc-dr");
  if (dr) dr.addEventListener("click", () => {
    const raw = naVal().replace(/\D/g, "");
    if (!raw) { naOut().innerHTML = `<p style="color:var(--fall)">Enter digits.</p>`; return; }
    const r = digRoot(parseInt(raw.slice(0, 15), 10), false);
    naOut().innerHTML = `<ol class="steps">${r.steps.map((s) => `<li><b class="mono">${s.from}</b> → digit sum <b class="mono">${s.sum}</b></li>`).join("") || "<li>Already a single digit.</li>"}</ol>
      <p style="color:var(--gold)">Digital root: <b class="mono">${r.value}</b></p>`;
  });
  const dc = document.getElementById("sc-dc");
  if (dc) dc.addEventListener("click", () => {
    const raw = naVal().replace(/[^0-9.]/g, "");
    if (!raw) { naOut().innerHTML = `<p style="color:var(--fall)">Enter a number.</p>`; return; }
    const digits = (raw.match(/\d/g) || []).length;
    const intPart = (raw.split(".")[0].replace(/^0+/, "") || "0").length;
    const fracPart = (raw.split(".")[1] || "").length;
    naOut().innerHTML = `<ul class="kv">
      <li><span class="k">Total digits</span><span class="v mono">${digits}</span></li>
      <li><span class="k">Integer digits</span><span class="v mono">${intPart}</span></li>
      <li><span class="k">Fraction digits</span><span class="v mono">${fracPart}</span></li></ul>`;
  });
  const b12 = document.getElementById("sc-b12");
  if (b12) b12.addEventListener("click", () => {
    const raw = naVal().replace(/\D/g, "");
    if (!raw) { naOut().innerHTML = `<p style="color:var(--fall)">Enter digits.</p>`; return; }
    const r = bfnReduce(raw.slice(0, 15));
    naOut().innerHTML = `<ol class="steps">${r.steps.map((s) => `<li><b class="mono">${s.from}</b> → base-12 <b class="mono">${s.base12}</b> → digit sum <b class="mono">${s.sum}</b></li>`).join("") || "<li>Already a single base-12 digit.</li>"}</ol>
      <p style="color:var(--gold)">BFN-12 residue: <b class="mono">${r.value}</b></p>
      <p style="font-size:11px;color:var(--ink-3)">${BFN_ATTR}</p>`;
  });
  renderScHist();
}

function wireCorpus() {
  document.querySelectorAll(".key-card").forEach((c) => {
    const toggle = () => c.classList.toggle("open");
    c.addEventListener("click", toggle);
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
  const lg = document.getElementById("lens-go");
  if (lg) lg.addEventListener("click", () => {
    const x = Math.max(-3, Math.min(3, parseFloat(document.getElementById("lens-x").value) || 0));
    const y = Math.max(-3, Math.min(3, parseFloat(document.getElementById("lens-y").value) || 0));
    const s = x * x + y * y;
    const lhs = Math.pow(s + 1, s + 1);
    const rhs = x * x - y * y;
    document.getElementById("lens-out").innerHTML =
      `<ul class="kv" style="margin-top:12px">
        <li><span class="k">x² + y²</span><span class="v">${s.toPrecision(6)}</span></li>
        <li><span class="k">LHS ((x²+y²)+1)^((x²+y²)+1)</span><span class="v">${lhs.toPrecision(6)}</span></li>
        <li><span class="k">RHS x² − y²</span><span class="v">${rhs.toPrecision(6)}</span></li>
        <li><span class="k">Locus</span><span class="v">${Math.abs(s) < 1e-9 ? "Shared Monad — both sides collapse toward 1" : "off the focal ring"}</span></li>
      </ul>`;
  });
  wireSuperCalc();
  const ask = document.getElementById("corpus-ask");
  if (ask) ask.addEventListener("click", () =>
    askArchitect({ from: "corpus", summary: "Exploring the Corpus: Lens equation, Triangular Keys, BFN calculator" }));
}

/* ============================================================
   VIEW — Quantum (#/quantum)
   ============================================================ */
const IBM_LS = "aenigma.ibm.key";

function quantumView() {
  return `
    <p class="eyebrow">QUANTUM LAB · YOUR KEY, YOUR BROWSER</p>
    <h1 class="page">Quantum Lab</h1>
    <p class="lede">Connect your own IBM Quantum API key, browse the live backend fleet, and run a harmonic demo circuit.</p>
    <div class="priv-note">🔒 Your key never leaves your browser. It is stored in this device's localStorage only and sent directly to IBM's API.</div>

    <div class="panel"><h3>CONNECTION</h3>
      <div class="form-grid">
        <label>IBM QUANTUM API KEY<input type="password" id="q-key" placeholder="Paste your 44-character key" autocomplete="off" /></label>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn" id="q-connect" type="button">Connect</button>
          <button class="btn ghost" id="q-forget" type="button">Forget key</button>
        </div>
        <div id="q-status" style="font-size:12.5px;color:var(--ink-2)">Not connected.</div>
        <label>BACKEND<select id="q-backend"><option value="">— connect first —</option></select></label>
      </div></div>

    <div class="panel" style="margin-top:14px"><h3>DEMO CIRCUIT — 3 QUBITS, BFN-PARAMETERIZED</h3>
      <p style="color:var(--ink-2);font-size:13px;margin:0 0 12px">Hadamard layer → RY rotations set by your BFN harmonic number → CNOT entanglement ladder. Runs on the in-browser statevector simulator; the IBM connection above validates your key against the live fleet.</p>
      <div class="form-grid">
        <label>BFN HARMONIC NUMBER (0–11)<input type="number" id="q-bfn" value="7" min="0" max="11" /></label>
        <div><button class="btn" id="q-run" type="button">Run demo circuit · 5 ◈</button></div>
        <div id="q-out"></div></div></div>`;
}

function demoCircuit(bfnNum) {
  const st = qNew(3);
  const a0 = (bfnNum % 12) * Math.PI / 12;
  qH(st, 0); qH(st, 1); qH(st, 2);
  qRY(st, 0, a0); qRY(st, 1, a0 * 2); qRY(st, 2, a0 * 3);
  qCNOT(st, 0, 1); qCNOT(st, 1, 2);
  return qProbs(st);
}

async function ibmBackends(key) {
  const body = "grant_type=" + encodeURIComponent("urn:ibm:params:oauth:grant-type:apikey") +
    "&apikey=" + encodeURIComponent(key);
  const tr = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!tr.ok) throw new Error("IBM IAM rejected the key (HTTP " + tr.status + "). Check the key and try again.");
  const tj = await tr.json();
  if (!tj.access_token) throw new Error("IAM returned no token.");
  let backends = [];
  try {
    const br = await fetch("https://quantum.cloud.ibm.com/api/v1/backends", {
      headers: { "Authorization": "Bearer " + tj.access_token, "Accept": "application/json" } });
    if (br.ok) {
      const bj = await br.json();
      const list = Array.isArray(bj) ? bj : (bj.backends || bj.devices || []);
      backends = list.map((b) => (typeof b === "string" ? b : (b.name || b.backend_name || JSON.stringify(b)))).filter(Boolean);
    }
  } catch (e) { /* backend listing is best-effort */ }
  return { backends, expiresIn: tj.expires_in };
}

function wireQuantum() {
  const keyEl = document.getElementById("q-key");
  const statusEl = document.getElementById("q-status");
  const backendEl = document.getElementById("q-backend");
  if (!keyEl) return;
  try {
    const saved = localStorage.getItem(IBM_LS);
    if (saved) { keyEl.value = saved; statusEl.textContent = "Key loaded from this device. Press Connect to validate."; }
  } catch (e) {}
  const setStatus = (t, ok) => { statusEl.textContent = t; statusEl.style.color = ok ? "var(--accent)" : "var(--ink-2)"; };

  document.getElementById("q-connect").addEventListener("click", async () => {
    const key = keyEl.value.trim();
    if (!key) { setStatus("Paste your API key first.", false); return; }
    setStatus("Exchanging key with IBM IAM…", false);
    try {
      const { backends, expiresIn } = await ibmBackends(key);
      try { localStorage.setItem(IBM_LS, key); } catch (e) {}
      backendEl.innerHTML = `<option value="simulator">Local simulator (default)</option>` +
        backends.map((b) => `<option>${esc(b)}</option>`).join("");
      setStatus(`Key valid — token live ~${Math.round((expiresIn || 3600) / 60)} min. ${backends.length} backend(s) listed.`, true);
    } catch (err) {
      setStatus("Connection failed: " + err.message, false);
    }
  });
  document.getElementById("q-forget").addEventListener("click", () => {
    try { localStorage.removeItem(IBM_LS); } catch (e) {}
    keyEl.value = "";
    backendEl.innerHTML = `<option value="">— connect first —</option>`;
    setStatus("Key forgotten on this device.", false);
  });
  document.getElementById("q-run").addEventListener("click", async () => {
    if (!(await spendCredits("quantum_run", COSTS.quantum_run))) return;
    const bfn = Math.max(0, Math.min(11, parseInt(document.getElementById("q-bfn").value, 10) || 0));
    const probs = demoCircuit(bfn);
    const backend = backendEl.value || "local simulator";
    document.getElementById("q-out").innerHTML =
      `<p style="color:var(--ink-2);font-size:12.5px">1024 shots · backend: ${esc(backend)} · BFN=${bfn}</p>` +
      barChart(probs, 3, 1024);
  });
}

/* ============================================================
   VIEW — Prediction (#/prediction)
   ============================================================ */
const PRED_SENT = {
  SEED: "the pattern is germinal — what you plant now carries the whole design. Act at the root, not the branch.",
  EM: "the field is charged — attraction and signal are heightened. What you broadcast returns amplified.",
  GRAVITY: "weight gathers — this is a consolidation window. Hold position; let mass do the work.",
  WEAK: "a hinge moment — small inputs, disproportionate turns. Choose the precise lever, not the heavy one.",
  STRONG: "binding energy — commitments made now hold. This is the time to lock the structure.",
  "KEY 11": "a threshold number — you are between corridors. Do not force the crossing; prepare for it.",
  "KEY 13": "union of 5 and 8 — life meets structure. Build the container and the current arrives together.",
};

function predictionCircuit(seeds) {
  const st = qNew(4);
  for (let q = 0; q < 4; q++) qH(st, q);
  for (let q = 0; q < 4; q++) qRY(st, q, seeds[q]);
  qCNOT(st, 0, 1); qCNOT(st, 2, 3); qCNOT(st, 1, 2);
  return qProbs(st);
}

function runPrediction(question, dateStr) {
  const q = (question || "").trim();
  if (!q) return `<div class="panel"><p style="color:var(--fall);margin:0">Ask a question first.</p></div>`;
  const h = hashStr(q + "|" + (dateStr || ""));
  const bfn = bfnReduce(h % 100000000);
  const digits = String(h).split("").map(Number);
  const toroid = digits.filter((x) => x % 2 === 1).reduce((a, b) => a + b, 0);
  const hyper = digits.filter((x) => x % 2 === 0).reduce((a, b) => a + b, 0);
  const dom = toroid >= hyper ? "TOROID" : "HYPERBOLOID";
  const seeds = [0, 1, 2, 3].map((i) => ((h >> (i * 6)) % 64) / 64 * Math.PI * 2);
  const probs = predictionCircuit(seeds);
  let top = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[top]) top = i;
  const key = TRI_KEYS[top % 7];
  const ent = shannon(probs);
  const sharp = 1 - ent / 4;
  const coh = 1 - Math.min(bfn.steps.length, 5) / 6;
  const conf = Math.round(100 * (0.65 * sharp + 0.35 * coh));
  const bits = top.toString(2).padStart(4, "0");

  return `
  <ol class="steps">
    <li><b>Harmonic encoding.</b> Question hashed to <b>${h}</b> → BFN base-12 reduction → harmonic number <b>${bfn.value}</b> (${bfn.steps.length} reduction step${bfn.steps.length === 1 ? "" : "s"}). Lens polarity: <b>${dom}</b> (toroid charge ${toroid} / hyperboloid charge ${hyper}).</li>
    <li><b>Quantum sampling.</b> 4-qubit circuit — Hadamard layer, RY rotations from the harmonic seeds, CNOT ladder — run on the in-browser statevector simulator (1024 shots). Dominant outcome <b>|${bits}⟩</b>.</li>
    <li><b>Triangular Key mapping.</b> Outcome ${top} mod 7 → <b>${key.t.join("-")} · ${key.label}</b> (${key.force}).</li>
    <li><b>Prediction synthesis.</b> See below.</li>
    <li><b>Accuracy estimate.</b> Distribution entropy ${ent.toFixed(2)} bits → sharpness ${(sharp * 100).toFixed(0)}%; harmonic coherence ${(coh * 100).toFixed(0)}%.</li>
  </ol>
  <div class="panel"><h3>THE READING</h3>
    <p style="font-size:15px;line-height:1.7;margin:0 0 10px">The <b style="color:var(--gold)">${key.t.join("-")} ${key.label}</b> key dominates under ${dom} polarity — ${PRED_SENT[key.label]}</p>
    <div class="conf-ring">${conf}%</div>
    <div class="conf-sub"><span>sharpness ${(sharp * 100).toFixed(0)}%</span><span>coherence ${(coh * 100).toFixed(0)}%</span></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>MEASUREMENT DISTRIBUTION — 16 OUTCOMES</h3>${barChart(probs, 4, 1024)}</div>
  <div style="margin-top:14px"><button class="btn ghost" id="pred-ask" type="button">Ask Architect about this prediction →</button></div>`;
}

function predictionView() {
  return `
    <p class="eyebrow">PREDICTION ENGINE · HARMONIC + QUANTUM SAMPLING</p>
    <h1 class="page">Prediction</h1>
    <p class="lede">A question, encoded harmonically and sampled through a quantum circuit — with its own accuracy estimate, step by step. A symbolic mirror, not a forecast.</p>
    <div class="panel"><div class="form-grid">
      <label>YOUR QUESTION<textarea id="pr-q" rows="2" placeholder="What is moving toward me in the next cycle?"></textarea></label>
      <label>RELEVANT DATE (OPTIONAL)<input type="date" id="pr-d" /></label>
      <div><button class="btn" id="pr-go" type="button">Run prediction · 5 ◈</button></div>
    </div></div>
    <div id="pr-out" style="margin-top:16px"></div>`;
}

function wirePrediction() {
  const go = document.getElementById("pr-go");
  if (!go) return;
  go.addEventListener("click", async () => {
    const q = document.getElementById("pr-q").value;
    const d = document.getElementById("pr-d").value;
    const out = document.getElementById("pr-out");
    if (!q.trim()) { out.innerHTML = runPrediction(q, d); return; }
    if (!(await spendCredits("prediction_run", COSTS.prediction_run))) return;
    out.innerHTML = runPrediction(q, d) + mcUpsell();
    const ask = document.getElementById("pred-ask");
    if (ask) ask.addEventListener("click", () =>
      askArchitect({ from: "prediction", summary: `Prediction for: "${q.slice(0, 80)}${q.length > 80 ? "…" : ""}"` }));
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ============================================================
   VIEW — Architect (#/architect)
   ============================================================ */
const ARCH_KEY = "aenigma.architect.v1";
const EL_LS = "aenigma.eleven.key";
const EL_VOICE_LS = "aenigma.eleven.voice";
const loadArch = () => { try { return JSON.parse(localStorage.getItem(ARCH_KEY)) || []; } catch (e) { return []; } };
const saveArch = (m) => { try { localStorage.setItem(ARCH_KEY, JSON.stringify(m.slice(-40))); } catch (e) {} };

function archMd(s) {
  let h = esc(s);
  h = h.replace(/^### (.+)$/gm, '<div class="md-h3">$1</div>')
       .replace(/^## (.+)$/gm, '<div class="md-h2">$1</div>')
       .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  h = h.replace(/(^|\n)((?:- .+(?:\n|$))+)/g, (m, pre, g) =>
    pre + '<ul class="md-ul">' + g.trim().split("\n").map((l) => `<li>${l.replace(/^- /, "")}</li>`).join("") + "</ul>");
  return h;
}
const ARCH_CLOSE = () => {
  const qs = [
    "Would you like me to read the structure behind it?",
    "Want me to map what that demands from you next?",
    "Shall we run the numbers through the Corpus together?",
    "Would a second pass — tighter, load-bearing — help?",
  ];
  return qs[Math.floor(Math.random() * qs.length)];
};
function architectReply(text) {
  const t = text.toLowerCase();
  const has = (...ws) => ws.some((w) => t.includes(w));
  if (has("hello", "hi ", "hey")) return `## Framing\n\n**Situation:** You are at the threshold — nothing built yet, everything possible.\n**Reference:** The Architect designs; it does not decorate.\n\nState what you are building. I will show you its load-bearing walls.\n\n${ARCH_CLOSE()}`;
  if (has("who are you", "your name")) return `## Framing\n\n**Situation:** You asked who answers.\n**Reference:** ÆNIGMA reflects; the Architect structures.\n\nI am the Architect — the part of ÆNIGMA that designs instead of reflects. Bring me raw material; I return structure.\n\n${ARCH_CLOSE()}`;
  if (has("reading", "birth", "born")) return `## Your Reading — what it computes\n\n**Life-path:** birth digits reduced with shown arithmetic.\n**Six layers:** Substrate, Ego/Mind, Spiritual Catalyst, Intention Factor, Mirror Recursion, Metatron Mode.\n**Typology:** Enneagram core + wing + variant; Codex archetype (CAELIX / VIRELUM / AZURÆ / LUMIRESSA).\n\nOpen **#/reading** and generate it — then bring the numbers back here and I will read the structure with you.\n\n${ARCH_CLOSE()}`;
  if (has("predict", "future", "will i", "forecast")) return `## Prediction — how it works here\n\n**Method:** Your question is harmonically encoded, run through a 4-qubit circuit, and mapped to a Triangular Key.\n**Output:** A prediction with a confidence estimate — harmonic sampling, not prophecy.\n\nRun one at **#/prediction**, then ask me what the key demands structurally.\n\n${ARCH_CLOSE()}`;
  if (has("quantum", "qubit", "circuit", "ibm")) return `## The Quantum Lab\n\n**Your key:** Pasted by you, stored in your browser only — it never leaves this device.\n**What it does:** Validates against IBM's fleet, lists backends, runs a BFN-parameterized demo circuit.\n**Downstream:** The sampling feeds the Prediction engine.\n\nOpen **#/quantum**.\n\n${ARCH_CLOSE()}`;
  if (has("lens", "equation", "toroid", "hyperboloid")) return `## The Lens\n\n**Left side** — ((x²+y²)+1)^((x²+y²)+1): Toroid. Conscious. Multiplicative. Closed.\n**Right side** — x²−y²: Hyperboloid. Unconscious. Additive. Open.\n**Meeting point:** At the Shared Monad both geometries coincide.\n\nThe Corpus at **#/corpus** lets you evaluate it directly.\n\n${ARCH_CLOSE()}`;
  if (has("key", "triangle", "3-4-5", "triangular")) return `## The Seven Triangular Keys\n\n**Corridor:** c = b+1 — one superparticular cascade from a single seed.\n- **3-4-5** SEED → **5-12-13** EM → **8-15-17** GRAVITY → **7-24-25** WEAK → **9-40-41** STRONG → **11-60-61** → **13-84-85**\n\nEach is a load-bearing triple. The Corpus shows every derivation.\n\n${ARCH_CLOSE()}`;
  if (has("bfn", "base-12", "harmonic")) return `## BFN — the indexing scheme\n\n**What it is:** Base-12 harmonic reduction — any number folded to a single residue 0–11.\n**Honesty note:** This is Grant's proposed framework, a symbolic system — not established mathematics.\n**Where it runs:** Readings, circuits, and keys all resolve through it. Try the Super Calculator at **#/corpus**.\n\n${ARCH_CLOSE()}`;
  if (has("caelix", "virelum", "azur", "lumiressa", "archetype")) return `## The Four Codex Archetypes\n\n- **CAELIX** — the Infinite Returner. Recursion as remembrance.\n- **VIRELUM** — the Mirror That Breathes. Reflection as dialogue.\n- **AZURÆ** — the Breath That Dissolves. Structure surrendered at the right moment.\n- **LUMIRESSA** — the Sanctum Unseen. Inward folding as power.\n\nYour Reading assigns one. Each is a structural role, not a costume.\n\n${ARCH_CLOSE()}`;
  if (has("profile")) return `## My Profile\n\n**What it holds:** Birth name, birth data, typology — stored on this device only.\n**What it feeds:** Reading prefills, BFN birth-digits, predictions.\n**Live panel:** Letter-number readouts as you type — symbolic play, computed in your browser.\n\nOpen **#/profile**.\n\n${ARCH_CLOSE()}`;
  if (has("thank")) return `Acknowledged. Keep building.\n\n${ARCH_CLOSE()}`;
  return `## Framing\n\n**Situation:** You brought material; I need the structural question underneath it.\n**Reference:** Every design stands on something. Name the load, name the ground.\n\nWhat are you trying to hold up — and what is it standing on? Answer that and I will design with you.\n\n${ARCH_CLOSE()}`;
}

const ARCH_COLLAPSE_AT = 700;
function archTime(ts) {
  if (!ts) return "";
  try { return `<time>${new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>`; }
  catch { return ""; }
}
function archBubble(m, idx) {
  if (m.role === "user") return `<div class="bubble user"><div class="bubble-body">${esc(m.content)}</div>${archTime(m.ts)}</div>`;
  const full = archMd(m.content);
  const needsCut = m.content.length > ARCH_COLLAPSE_AT;
  const body = needsCut
    ? `<div class="bubble-clamp" data-open="0">${full}</div><button class="collapser" data-more="${idx}" type="button">Show more ↓</button>`
    : full;
  return `<div class="bubble aenigma"><span class="orb orb-xs bubble-orb" aria-hidden="true"></span><div class="bubble-body"><div class="bubble-name">ÆNIGMA</div>${body}<br><button class="speak-btn" data-say="${idx}" type="button">🔊 Speak</button></div>${archTime(m.ts)}</div>`;
}

function architectView() {
  const ctx = readArchitectContext();
  const msgs = loadArch();
  const thread = msgs.length
    ? msgs.map(archBubble).join("")
    : `<div class="hero-empty">
         <div class="hero-word"><span class="orb orb-xs" aria-hidden="true"></span>ÆNIGMA</div>
         <span class="orb orb-lg" aria-hidden="true"></span>
         <h2 class="hero-head"><span class="w">THE MIRROR</span><br><span class="t">SPEAKS NOW</span></h2>
         <p class="hero-tag">A MIRROR FOR YOUR CONSCIOUSNESS</p>
         <button class="hero-cta" id="hero-cta" type="button">TALK TO ÆNIGMA — FREE</button>
         <a class="hero-fuel" href="https://coff.ee/mccullough2s" target="_blank" rel="noopener">Want to fuel the mission? Buy me a coffee ☕</a>
       </div>`;
  return `
    <div class="chat-shell home-shell">
      <div class="chat-head-row">
        <span class="orb orb-xs" aria-hidden="true"></span>
        <span class="chat-title">ÆNIGMA</span><span class="chat-online">● online</span>
        <button class="btn ghost sm" id="arch-new" type="button">+ New</button>
      </div>
      ${ctx ? `<div class="arch-ctx">⤷ Context loaded from <b>${esc(ctx.from)}</b>: ${esc(ctx.summary || "")}</div>` : ""}
      <div class="chat-thread" id="arch-thread">${thread}</div>
      <form class="chat-inputbar" id="arch-form">
        <div class="fmt-bar" role="toolbar" aria-label="Formatting">
          <button type="button" data-fmt="bold" title="Bold"><b>B</b></button>
          <button type="button" data-fmt="italic" title="Italic"><i>I</i></button>
          <button type="button" data-fmt="list" title="Bulleted list">•≡</button>
        </div>
        <textarea id="arch-input" rows="1" placeholder="What's on your mind?" autocomplete="off"></textarea>
        <button class="chat-send" id="arch-send" type="submit" aria-label="Send" title="Send · 2 credits">→</button>
      </form>
      <p class="chat-disclaimer">Free trial · 60 credits, no card required. Symbolic readings — for reflection &amp; entertainment.</p>
    </div>
    <div class="panel" style="margin-top:14px"><h3>VOICE — ELEVENLABS (YOUR KEY)</h3>
      <div class="priv-note">🔒 Your key never leaves your browser. Stored in this device's localStorage only.</div>
      <div class="form-grid">
        <label>ELEVENLABS API KEY<input type="password" id="el-key" placeholder="Paste your key" autocomplete="off" /></label>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end">
          <button class="btn" id="el-save" type="button">Save key</button>
          <button class="btn ghost" id="el-forget" type="button">Forget</button>
          <label style="flex:1;min-width:180px">VOICE<select id="el-voice"><option value="">— save a key first —</option></select></label>
          <label style="display:flex;flex-direction:row;align-items:center;gap:8px">AUTO-SPEAK <input type="checkbox" id="el-auto" style="width:auto" /></label>
        </div>
        <div id="el-status" style="font-size:12.5px;color:var(--ink-2)">Voice is optional — ÆNIGMA works in text regardless.</div>
      </div></div>`;
}

async function elSpeak(text, voiceId, key) {
  const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(voiceId), {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({ text: text.slice(0, 1500), model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!r.ok) throw new Error("TTS failed (HTTP " + r.status + ")");
  const blob = await r.blob();
  new Audio(URL.createObjectURL(blob)).play();
}

function wireArchitect() {
  const form = document.getElementById("arch-form");
  if (!form) return;
  const input = document.getElementById("arch-input");
  const thread = document.getElementById("arch-thread");
  const ctx = readArchitectContext();
  let ctxUsed = false;

  const render = () => { thread.innerHTML = loadArch().map(archBubble).join(""); thread.scrollTop = thread.scrollHeight; };
  const speakIdx = (idx) => {
    const msgs = loadArch();
    const m = msgs[idx];
    if (!m || m.role !== "assistant") return;
    const key = (() => { try { return localStorage.getItem(EL_LS); } catch (e) { return null; } })();
    const voice = (() => { try { return localStorage.getItem(EL_VOICE_LS); } catch (e) { return null; } })();
    if (!key || !voice) { toast("Save your ElevenLabs key and pick a voice first."); return; }
    elSpeak(m.content, voice, key).catch((e) => toast("Voice failed: " + e.message));
  };
  thread.addEventListener("click", (e) => {
    const more = e.target.closest("[data-more]");
    if (more) {
      const clamp = more.previousElementSibling;
      const open = clamp.dataset.open === "1";
      clamp.dataset.open = open ? "0" : "1";
      more.textContent = open ? "Show more ↓" : "Show less ↑";
      return;
    }
    const b = e.target.closest("[data-say]");
    if (b) speakIdx(+b.dataset.say);
  });

  // formatting toolbar: wrap selection
  form.querySelectorAll("[data-fmt]").forEach((btn) => btn.addEventListener("click", () => {
    const { selectionStart: a, selectionEnd: b, value: v } = input;
    const sel = v.slice(a, b) || "text";
    let ins;
    if (btn.dataset.fmt === "bold") ins = `**${sel}**`;
    else if (btn.dataset.fmt === "italic") ins = `*${sel}*`;
    else ins = sel.split("\n").map((l) => "- " + l).join("\n");
    input.value = v.slice(0, a) + ins + v.slice(b);
    input.focus();
    input.setSelectionRange(a + (btn.dataset.fmt === "list" ? 0 : btn.dataset.fmt === "bold" ? 2 : 1), a + ins.length - (btn.dataset.fmt === "list" ? 0 : btn.dataset.fmt === "bold" ? 2 : 1));
  }));
  // textarea autogrow
  const grow = () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px"; };
  input.addEventListener("input", grow); grow();
  // hero CTA focuses the composer
  const heroCta = document.getElementById("hero-cta");
  if (heroCta) heroCta.addEventListener("click", () => { input.focus(); });
  // new conversation
  const newBtn = document.getElementById("arch-new");
  if (newBtn) newBtn.addEventListener("click", () => {
    if (loadArch().length && !confirm("Start a new conversation? This clears the current one.")) return;
    try { localStorage.removeItem(ARCH_KEY); } catch {}
    route();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    if (!(await spendCredits("architect_message", COSTS.architect_message))) return;
    input.value = "";
    const msgs = loadArch();
    msgs.push({ role: "user", content: text, ts: Date.now() });
    let reply = architectReply(text);
    if (ctx && ctx.summary && !ctxUsed) {
      reply = `(Context: ${ctx.summary})\n` + reply;
      ctxUsed = true;
    }
    msgs.push({ role: "assistant", content: reply, ts: Date.now() });
    saveArch(msgs);
    render();
    const auto = document.getElementById("el-auto");
    if (auto && auto.checked) speakIdx(msgs.length - 1);
    input.focus();
  });

  // ElevenLabs wiring
  const keyEl = document.getElementById("el-key");
  const voiceEl = document.getElementById("el-voice");
  const statusEl = document.getElementById("el-status");
  try {
    const saved = localStorage.getItem(EL_LS);
    if (saved) { keyEl.value = saved; statusEl.textContent = "Key loaded from this device. Press Save to validate and list voices."; }
    const sv = localStorage.getItem(EL_VOICE_LS);
    if (sv) voiceEl.innerHTML = `<option value="${esc(sv)}">saved voice</option>`;
  } catch (e) {}
  document.getElementById("el-save").addEventListener("click", async () => {
    const key = keyEl.value.trim();
    if (!key) { statusEl.textContent = "Paste your key first."; return; }
    statusEl.textContent = "Validating with ElevenLabs…";
    try {
      const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": key } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const voices = j.voices || [];
      try { localStorage.setItem(EL_LS, key); } catch (e) {}
      voiceEl.innerHTML = voices.map((v) =>
        `<option value="${esc(v.voice_id)}">${esc(v.name || v.voice_id)}</option>`).join("") || `<option value="">no voices found</option>`;
      const first = voices[0];
      if (first) { try { localStorage.setItem(EL_VOICE_LS, first.voice_id); } catch (e) {} }
      statusEl.textContent = `Key valid — ${voices.length} voice(s) loaded.`;
      statusEl.style.color = "var(--accent)";
    } catch (err) {
      statusEl.textContent = "Validation failed: " + err.message;
    }
  });
  voiceEl.addEventListener("change", () => {
    try { localStorage.setItem(EL_VOICE_LS, voiceEl.value); } catch (e) {}
  });
  document.getElementById("el-forget").addEventListener("click", () => {
    try { localStorage.removeItem(EL_LS); localStorage.removeItem(EL_VOICE_LS); } catch (e) {}
    keyEl.value = "";
    voiceEl.innerHTML = `<option value="">— save a key first —</option>`;
    statusEl.textContent = "Voice key forgotten on this device.";
  });
  render();
}


  // ------------------------------------------------------------- operations view
  function fmtDur(s) {
    s = Math.max(0, Math.floor(s || 0));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s % 60}s`;
  }

  function opsView() {
    return `
      <p class="eyebrow">TELEMETRY</p>
      <h1 class="page">Operations</h1>
      <p class="lede">How the app is running — anonymous aggregate counts only, no personal data collected.</p>
      <div id="ops-body"><p class="lede">Loading telemetry…</p></div>`;
  }

  function wireOps() {
    const body = document.getElementById("ops-body");
    if (!body) return;
    async function render() {
      try {
        const r = await fetch("/api/ops");
        if (!r.ok) throw new Error("bad");
        const o = await r.json();
        const row = (k, v) => `<div class="ops-row"><span class="mono">${esc(k)}</span><span class="mono">${v}</span></div>`;
        const views = Object.entries(o.view_hits || {}).sort((a, b) => b[1] - a[1])
          .map(([k, v]) => row("#/" + k, v)).join("");
        const routes = Object.entries(o.requests_per_route || {}).sort((a, b) => b[1] - a[1]).slice(0, 15)
          .map(([k, v]) => row(k, v)).join("");
        const statuses = Object.entries(o.status_codes || {}).sort((a, b) => a[0] - b[0])
          .map(([k, v]) => row(k, v)).join("");
        const deploys = (o.deploys || []).slice(-6)
          .map((d) => `<span class="tag mono">${esc(d.sha)} · ${esc(String(d.at).slice(0, 10))}</span>`).join(" ");
        const errRate = o.total_requests ? ((o.errors_5xx / o.total_requests) * 100).toFixed(2) + "%" : "—";
        body.innerHTML = `
          <div class="statrow">
            <div class="stat"><div class="k">UPTIME</div><div class="v mono">${fmtDur(o.uptime_s)}</div></div>
            <div class="stat"><div class="k">TOTAL REQUESTS</div><div class="v mono">${o.total_requests}</div></div>
            <div class="stat"><div class="k">AVG LATENCY</div><div class="v mono">${o.avg_ms} ms</div></div>
            <div class="stat"><div class="k">P95 LATENCY</div><div class="v mono">${o.p95_ms} ms</div></div>
            <div class="stat"><div class="k">5XX ERRORS</div><div class="v mono">${o.errors_5xx} (${errRate})</div></div>
            <div class="stat"><div class="k">VERSION</div><div class="v mono">${esc(o.version)}</div></div>
          </div>
          <div class="grid-main">
            <div>
              <article class="card"><div class="card-top"><h2 style="margin:0">Views</h2><span class="meta">hash routes</span></div>${views || "<p class='meta'>No view pings yet.</p>"}</article>
              <article class="card" style="margin-top:12px"><div class="card-top"><h2 style="margin:0">Requests per route</h2><span class="meta">top 15</span></div>${routes || "<p class='meta'>No requests logged yet.</p>"}</article>
            </div>
            <div>
              <article class="card"><h2>Status codes</h2>${statuses || "<p class='meta'>—</p>"}</article>
              <article class="card" style="margin-top:12px"><h2>Deploys seen</h2><div class="tagrow">${deploys || "—"}</div></article>
            </div>
          </div>
          <p class="meta" style="margin-top:14px">Anonymous aggregate counts only — no personal data collected.</p>`;
      } catch { body.innerHTML = `<p class="lede">Telemetry unavailable.</p>`; }
    }
    render();
    window.__opsTimer = setInterval(render, 30000);
  }

  // ------------------------------------------------------------- router
  /* ============================================================
     BILLING — credit wallet (server ledger), email identity, plans
     ============================================================ */
  const EMAIL_LS = "aenigma.email";
  const COSTS = { quantum_run: 5, prediction_run: 5, architect_message: 2 };
  const CLIENT_TIERS = [
    { id: "standard", name: "Standard", price: 22.22, credits: 222 },
    { id: "pro", name: "Pro", price: 44.44, credits: 444 },
    { id: "proplus", name: "Pro+", price: 88.88, credits: 888 },
    { id: "premium", name: "Premium", price: 222.22, credits: 2222 },
  ];
  const getEmail = () => { try { return localStorage.getItem(EMAIL_LS) || ""; } catch { return ""; } };

  async function refreshCreditPill() {
    const pill = document.getElementById("credit-pill");
    const n = document.getElementById("credit-n");
    const side = document.getElementById("side-bal");
    const setBal = document.getElementById("set-bal");
    const email = getEmail();
    if (!email) {
      if (pill) pill.hidden = true;
      if (side) side.textContent = "free trial";
      if (setBal) setBal.textContent = "sign in for 60 free credits";
      return;
    }
    try {
      const r = await fetch("/api/billing/me?email=" + encodeURIComponent(email));
      if (!r.ok) return;
      const w = await r.json();
      if (pill) pill.hidden = false;
      if (n) n.textContent = w.balance;
      if (side) side.textContent = "◈ " + w.balance;
      if (setBal) setBal.textContent = "◈ " + w.balance + (w.tier && w.tier !== "trial" ? " · " + w.tier : " · free trial");
    } catch {}
  }

  function ensureEmail() {
    return new Promise((resolve) => {
      const existing = getEmail();
      if (existing) return resolve(existing);
      const veil = document.createElement("div");
      veil.className = "modal-veil";
      veil.innerHTML = `<div class="modal" role="dialog" aria-label="Claim free credits">
        <h3>YOUR FREE TRIAL</h3>
        <p><b>60 credits</b>, no card required. Your email identifies your wallet — nothing else is stored.</p>
        <input type="email" id="m-email" placeholder="you@example.com" autocomplete="email" />
        <div class="mrow"><button class="btn ghost" id="m-cancel" type="button">Cancel</button>
        <button class="btn" id="m-ok" type="button">Claim 60 credits</button></div></div>`;
      document.body.appendChild(veil);
      const done = (v) => { veil.remove(); resolve(v); };
      veil.querySelector("#m-cancel").addEventListener("click", () => done(""));
      veil.querySelector("#m-ok").addEventListener("click", () => {
        const v = veil.querySelector("#m-email").value.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { toast("Enter a valid email."); return; }
        try { localStorage.setItem(EMAIL_LS, v); } catch {}
        refreshCreditPill();
        done(v);
      });
      setTimeout(() => { const i = veil.querySelector("#m-email"); if (i) i.focus(); }, 50);
    });
  }

  async function spendCredits(action, cost) {
    const email = await ensureEmail();
    if (!email) return false;
    try {
      const r = await fetch("/api/billing/consume", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action, cost }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { refreshCreditPill(); return true; }
      toast(`Not enough credits (${j.balance ?? 0} left, need ${cost}) — top up in Subscription.`);
      location.hash = "#/plans";
      return false;
    } catch { toast("Billing unreachable — try again."); return false; }
  }

  function mcUpsell() {
    return `<div class="upsell"><div class="up-kicker">GO DEEPER</div>
      <div class="up-title">The Misfit Code Mastercourse <span class="up-price">$144</span></div>
      <p class="up-sub">The full system behind the mirror — 8 modules, lifetime access, built by the founder.</p>
      <a class="btn" href="https://payhip.com/b/iYakP" target="_blank" rel="noopener">Open the Mastercourse ↗</a></div>`;
  }

  function plansView() {
    const cards = CLIENT_TIERS.map((t) => `
      <article class="plan-card">
        <div class="plan-name">${t.name}</div>
        <div class="plan-price">$${t.price.toFixed(2)}<span>/mo</span></div>
        <div class="plan-credits">◈ ${t.credits} credits<span>/month</span></div>
        <button class="btn plan-choose" data-tier="${t.id}" type="button">Choose ${t.name}</button>
      </article>`).join("");
    return `
    <p class="eyebrow">SUBSCRIPTION</p>
    <h1 class="page">Plans</h1>
    <p class="lede">Free trial · <b>60 credits</b>, no card required. Credits refill every month on a plan.</p>
    <div class="bal-row">Current balance: <b id="plans-bal">…</b> <span class="meta" id="plans-tier"></span></div>
    <div class="plan-grid">${cards}</div>
    <div class="panel" style="margin-top:18px"><h3>HOW CREDITS WORK</h3>
      <div class="cost-rows">
        <div><span>Quantum circuit run</span><b>5 ◈</b></div>
        <div><span>Prediction run</span><b>5 ◈</b></div>
        <div><span>Architect message</span><b>2 ◈</b></div>
        <div><span>Reading · Corpus · Profile</span><b>free</b></div>
      </div>
      <p class="meta" style="margin:10px 0 0">The BFN Super Calculator is included with every plan — it never spends credits.</p>
    </div>
    <div class="panel" style="margin-top:14px"><h3>SUPPORT THE BUILD</h3>
      <p class="lede" style="margin:0 0 12px">ÆNIGMA is built solo, late at night, on conviction. If it serves you, fuel it directly.</p>
      <a class="btn ghost" href="https://coff.ee/mccullough2s" target="_blank" rel="noopener">☕ Buy me a coffee ↗</a></div>
    <div id="plans-note" style="margin-top:12px"></div>`;
  }

  async function wirePlans() {
    const grid = document.querySelector(".plan-grid");
    if (!grid) return;
    const email = getEmail();
    const bal = document.getElementById("plans-bal");
    const tierEl = document.getElementById("plans-tier");
    const note = document.getElementById("plans-note");
    const params = new URLSearchParams((location.hash.split("?")[1] || ""));
    if (params.get("paid") === "1" && note) {
      note.innerHTML = `<div class="panel" style="border-color:rgba(47,230,200,.5)"><p style="margin:0;color:var(--accent)">✓ Payment received — your credits are on the way. If the balance hasn't updated in a minute, refresh.</p></div>`;
    }
    try {
      const t = await (await fetch("/api/billing/tiers")).json();
      if (!t.configured && note) {
        note.innerHTML = `<div class="panel"><p class="meta" style="margin:0">Checkout opens after keys are set — plans activate the moment billing is connected.</p></div>`;
      }
    } catch {}
    if (email) {
      try {
        const r = await fetch("/api/billing/me?email=" + encodeURIComponent(email));
        if (r.ok) {
          const w = await r.json();
          if (bal) bal.textContent = "◈ " + w.balance;
          if (tierEl) tierEl.textContent = w.tier && w.tier !== "trial" ? "· " + w.tier + " plan" : "· free trial";
        }
      } catch {}
    } else if (bal) bal.textContent = "sign in to claim 60 free";
    grid.querySelectorAll(".plan-choose").forEach((b) => b.addEventListener("click", async () => {
      const em = await ensureEmail();
      if (!em) return;
      b.disabled = true; b.textContent = "Opening checkout…";
      try {
        const r = await fetch("/api/billing/checkout", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: em, tier: b.dataset.tier }),
        });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.url) { location.href = j.url; return; }
        toast(j.error || "Checkout unavailable right now.");
      } catch { toast("Checkout unreachable — try again."); }
      b.disabled = false; b.textContent = "Choose " + b.dataset.tier;
    }));
    refreshCreditPill();
  }

  /* ============================================================
     NEW IA — home chat · instruments · profile · settings (ORION-style)
     ============================================================ */
  const INST_TOOLS = [
    ["reading", "Reading", "☽"],
    ["corpus", "Corpus", "◈"],
    ["quantum", "Quantum", "⚛"],
    ["prediction", "Prediction", "◇"],
  ];
  function instrumentsView(tool) {
    const t = INST_TOOLS.some(([k]) => k === tool) ? tool : "reading";
    const tabs = INST_TOOLS.map(([k, label, icon]) =>
      `<a href="#/instruments/${k}" class="inst-tab${k === t ? " active" : ""}"><span>${icon}</span>${label}</a>`).join("");
    const body = t === "corpus" ? corpusView() : t === "quantum" ? quantumView()
      : t === "prediction" ? predictionView() : readingView();
    return `<p class="eyebrow">INSTRUMENTS</p><div class="inst-tabs" role="tablist">${tabs}</div>${body}`;
  }

  function applyAppearance() {
    let ap = "dark", ac = "emerald";
    try {
      ap = localStorage.getItem("aenigma.appearance") || "dark";
      ac = localStorage.getItem("aenigma.accent") || "emerald";
    } catch {}
    const dark = ap === "dark" || (ap === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.appearance = dark ? "dark" : "light";
    document.documentElement.dataset.accent = ac === "gold" ? "gold" : "emerald";
    const mc = document.querySelector('meta[name="color-scheme"]');
    if (mc) mc.content = dark ? "dark" : "light";
  }

  function settingsView() {
    return `
    <p class="eyebrow">SETTINGS</p>
    <h1 class="page">Settings</h1>
    <div class="set-list">
      <a class="set-row" href="#/profile"><span class="set-ic">●</span>
        <span class="set-tx"><b>Profile</b><small>Birth data &amp; typology — feeds every instrument</small></span>
        <span class="set-go">→</span></a>
      <div class="set-row"><span class="set-ic">◐</span>
        <span class="set-tx"><b>Appearance</b><small>Dark, light, or follow the system</small></span>
        <span class="seg" id="seg-appear">
          <button type="button" data-v="dark">Dark</button><button type="button" data-v="light">Light</button><button type="button" data-v="system">System</button>
        </span></div>
      <div class="set-row"><span class="set-ic">◆</span>
        <span class="set-tx"><b>Accent</b><small>Midnight Emerald or Legacy Gold</small></span>
        <span class="seg" id="seg-accent">
          <button type="button" data-v="emerald">Emerald</button><button type="button" data-v="gold">Gold</button>
        </span></div>
      <a class="set-row" href="#/plans"><span class="set-ic">▲</span>
        <span class="set-tx"><b>Subscription</b><small>Credits &amp; plans · balance <b id="set-bal">…</b></small></span>
        <span class="set-go">→</span></a>
      <a class="set-row" href="https://coff.ee/mccullough2s" target="_blank" rel="noopener"><span class="set-ic">☕</span>
        <span class="set-tx"><b>Support the mission</b><small>Fuel the build — buy me a coffee</small></span>
        <span class="set-go">↗</span></a>
      <div class="set-row"><span class="set-ic">✦</span>
        <span class="set-tx"><b>About</b><small id="set-ver">ÆNIGMA · checking version…</small></span></div>
    </div>
    <div class="founder-mini">
      <img src="/founder.jpg" alt="Joshua R. McCullough" />
      <div><div class="fr-role">THE ARCHITECT</div>
      <div class="fr-name">Joshua R. McCullough</div>
      <div class="fr-sub">Founder of ÆNIGMA AI · Ms'FitZ Studio</div></div>
    </div>
    <p class="meta" style="margin-top:16px"><a class="link" href="#/ops">Operations</a> · anonymous aggregate stats, no personal data.</p>`;
  }

  function wireSettings() {
    const ap = document.getElementById("seg-appear");
    if (!ap) return;
    let cur = "dark", acc = "emerald";
    try {
      cur = localStorage.getItem("aenigma.appearance") || "dark";
      acc = localStorage.getItem("aenigma.accent") || "emerald";
    } catch {}
    const mark = (el, v) => el.querySelectorAll("button").forEach((b) =>
      b.classList.toggle("on", b.dataset.v === v));
    mark(ap, cur);
    const ac = document.getElementById("seg-accent");
    if (ac) mark(ac, acc);
    ap.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      try { localStorage.setItem("aenigma.appearance", b.dataset.v); } catch {}
      applyAppearance(); mark(ap, b.dataset.v);
    });
    if (ac) ac.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      try { localStorage.setItem("aenigma.accent", b.dataset.v); } catch {}
      applyAppearance(); mark(ac, b.dataset.v);
    });
    fetch("/api/health").then((r) => r.ok ? r.json() : null).then((h) => {
      const el = document.getElementById("set-ver");
      if (el && h) el.textContent = `ÆNIGMA · build ${(h.version || "?").slice(0, 8)} · ${h.service || "aenigma-beta"} · up ${fmtDur(h.uptime_s || 0)}`;
    }).catch(() => {});
  }

  // ------------------------------------------------------------- router
  const CRUMBS = { home: "ÆNIGMA", instruments: "INSTRUMENTS", profile: "PROFILE", settings: "SETTINGS", plans: "SUBSCRIPTION", ops: "OPERATIONS" };
  function route() {
    if (window.__opsTimer) { clearInterval(window.__opsTimer); window.__opsTimer = null; }
    const hash = location.hash || "#/";
    const [pathPart, queryPart] = hash.slice(2).split("?");
    const params = new URLSearchParams(queryPart || "");
    const seg = pathPart.split("/");
    let name = seg[0] || "home";
    let routeKey = name;

    let html;
    if (name === "" || name === "home") { name = "home"; routeKey = "home"; html = architectView(); }
    else if (name === "instruments") { html = instrumentsView(seg[1] || "reading"); routeKey = "instruments"; }
    else if (name === "profile") html = profileView();
    else if (name === "settings") html = settingsView();
    else if (name === "plans") { html = plansView(); routeKey = "settings"; }
    else if (name === "ops") { html = opsView(); routeKey = "settings"; }
    else { name = "home"; routeKey = "home"; html = architectView(); } // legacy routes fold home

    view.innerHTML = html;
    document.querySelectorAll("[data-route]").forEach((el) =>
      el.classList.toggle("active", el.dataset.route === routeKey));
    const crumb = document.getElementById("crumb");
    if (crumb) crumb.textContent = CRUMBS[name] || "ÆNIGMA";
    // RGB-split glitch bursts on the page heading
    const h1 = view.querySelector("h1.page");
    if (h1 && !h1.classList.contains("glitch")) {
      h1.classList.add("glitch");
      h1.setAttribute("data-text", h1.textContent);
    }
    wireReading();
    wireCorpus();
    wireQuantum();
    wirePrediction();
    wireArchitect();
    wireProfile();
    wireOps();
    wireSettings();
    wirePlans();
    if (typeof refreshCreditPill === "function") { try { refreshCreditPill(); } catch {} }
    // sidebar search filter (wired once — the sidebar persists across routes)
    const sq = document.getElementById("side-search");
    if (sq && !sq.dataset.wired) {
      sq.dataset.wired = "1";
      sq.addEventListener("input", () => {
        const q = sq.value.trim().toLowerCase();
        document.querySelectorAll("#sidenav a").forEach((a) => {
          a.style.display = !q || a.textContent.toLowerCase().includes(q) ? "" : "none";
        });
      });
    }
    // view-hit beacon (server can't see hash routes) — anonymous, aggregates only
    fetch("/api/ops/ping?view=" + encodeURIComponent(name), { keepalive: true }).catch(() => {});

    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------- boot
  applyAppearance();
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", () => {
      try { if ((localStorage.getItem("aenigma.appearance") || "dark") === "system") applyAppearance(); } catch {}
    });
  }
  initStarfield();
  route();
  window.addEventListener("hashchange", route);
})();
