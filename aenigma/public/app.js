/* ÆNIGMA AI — front end (four views: landing, command center, reflection lab, archetype terminal) */
(() => {
  "use strict";

  const view = document.getElementById("view");
  const tooltip = document.getElementById("tooltip");
  let FIELD = null;
  let THEOREMS = null; // {date, cycle, theorems:[...], bfn:{...}} | null when /api/theorems unavailable

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const arrow = (st) => (st === "rising" ? "↗" : st === "falling" ? "↘" : "→");
  const stTxt = (a) => `${arrow(a.state)} ${a.state[0].toUpperCase() + a.state.slice(1)} ${a.delta > 0 ? "+" : ""}${a.delta}`;
  const bySym = (sym) => (FIELD ? FIELD.archetypes.find((a) => a.sym === sym) : null);
  const topSym = () => (FIELD && FIELD.surfacing && FIELD.surfacing[0]) || (FIELD ? FIELD.archetypes[0].sym : "EMBER");
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

  function wireChartHover() {
    view.querySelectorAll("svg.chart").forEach((svg) => {
      const a = bySym(svg.dataset.sym);
      if (!a) return;
      const cycles = +svg.dataset.cycles;
      const data = a.history.slice(-(cycles + 1));
      const zone = svg.querySelector(".hover-zone");
      if (!zone) return;
      const move = (ev) => {
        const r = svg.getBoundingClientRect();
        const frac = Math.min(1, Math.max(0, ((ev.clientX - r.left) / r.width - 34 / 720) / ((720 - 46) / 720)));
        const i = Math.round(frac * (data.length - 1));
        const label = i === data.length - 1 ? "now" : `${i - (data.length - 1)} cycles`;
        tooltip.innerHTML = `<b>$${a.sym}</b> · ${label}<br>resonance ${Math.round(data[i])}`;
        tooltip.style.display = "block";
        tooltip.style.left = Math.min(window.innerWidth - 150, ev.clientX + 14) + "px";
        tooltip.style.top = ev.clientY + 14 + "px";
      };
      zone.addEventListener("mousemove", move);
      zone.addEventListener("mouseleave", () => (tooltip.style.display = "none"));
    });
  }

  // ------------------------------------------------------------- shared ui
  function ticker() {
    const items = FIELD.archetypes.map((a) =>
      `<a class="tick-item" href="#/archetype/${a.sym}"><span class="sym">$${a.sym}</span>
       <span class="val">${a.value}</span><span class="st-${a.state}">${arrow(a.state)} ${a.delta > 0 ? "+" : ""}${a.delta}</span></a>`).join("");
    const track = document.getElementById("ticker-track");
    if (track) track.innerHTML = items + items; // loop
  }

  function railRow(sym) {
    const a = bySym(sym);
    if (!a) return "";
    return `<a class="rail-row" href="#/archetype/${a.sym}">
      <div><div class="sym">$${a.sym}</div><div class="sub">${esc(a.reflecting)} reflecting</div></div>
      ${sparkline(a.history, a.state)}
      <span class="rail-chip st-${a.state}">${stTxt(a)}</span></a>`;
  }

  function mirrorPanel() {
    return `<div class="panel"><h3>THE DAILY MIRROR</h3>
      <p class="mirror-quote">“${esc(FIELD.mirror.quote)}”</p>
      <a class="link" href="#/command">Read today's field →</a></div>`;
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

  async function shareField() {
    const data = {
      title: "ÆNIGMA — a mirror for your consciousness",
      text: "The 10 archetypes moving through you. Which is loudest in you right now? Enter the field (free beta):",
      url: location.origin + "/",
    };
    if (navigator.share) {
      try { await navigator.share(data); return; }
      catch (e) { if (e && e.name === "AbortError") return; } // user dismissed
    }
    try {
      await navigator.clipboard.writeText(`${data.text} ${data.url}`);
      toast("Link copied — paste it anywhere.");
    } catch {
      toast(data.url);
    }
  }

  // ------------------------------------------------------------- sacred-geometry SVG builders
  function gearPath(cx, cy, r, teeth) {
    const pts = [];
    const n = teeth * 2;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.78;
      pts.push(`${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`);
    }
    return pts.join(" ");
  }

  // Diagnostic map: stylized head profile with 4 interlocking gears,
  // each driven by a real archetype.
  function diagnosticMapSVG() {
    const gears = [
      { label: "INTUITION", sym: "ORACLE", cx: 92,  cy: 62,  r: 24, dir: "normal" },
      { label: "BIAS",      sym: "MASK",   cx: 200, cy: 74,  r: 20, dir: "reverse" },
      { label: "LOGIC",     sym: "MIRROR", cx: 148, cy: 142, r: 30, dir: "reverse" },
      { label: "FEAR",      sym: "SHADOW", cx: 190, cy: 198, r: 18, dir: "normal" },
    ];
    const gearGroups = gears.map((g) => {
      const a = bySym(g.sym);
      if (!a) return "";
      const dur = (2 + (100 - a.value) * 0.14).toFixed(1); // data-driven speed
      const op = (0.35 + 0.65 * (a.value / 100)).toFixed(2); // data-driven opacity
      const spokes = [0, 60, 120].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return `<line x1="${g.cx - g.r * 0.55 * Math.cos(rad)}" y1="${g.cy - g.r * 0.55 * Math.sin(rad)}"
          x2="${g.cx + g.r * 0.55 * Math.cos(rad)}" y2="${g.cy + g.r * 0.55 * Math.sin(rad)}"
          stroke="#2fe6c8" stroke-width="2" opacity="0.6"/>`;
      }).join("");
      return `<g class="gear" style="animation-duration:${dur}s;animation-direction:${g.dir};opacity:${op}">
          <polygon points="${gearPath(g.cx, g.cy, g.r, 10)}" fill="none" stroke="#2fe6c8" stroke-width="2.5"/>
          <circle cx="${g.cx}" cy="${g.cy}" r="${g.r * 0.28}" fill="none" stroke="#2fe6c8" stroke-width="2"/>
          ${spokes}
        </g>
        <text class="gear-label" x="${g.cx}" y="${g.cy + g.r + 14}">${g.label}</text>
        <text class="gear-val" x="${g.cx}" y="${g.cy + g.r + 26}">$${g.sym} ${a.value}</text>`;
    }).join("");
    return `<svg viewBox="0 0 300 270" role="img" aria-label="Diagnostic map: head profile with four archetype-driven gears">
      <ellipse cx="150" cy="128" rx="86" ry="102" fill="none" stroke="#2fe6c8" stroke-width="1.5" opacity="0.35"/>
      <path d="M 110 214 L 106 268 M 150 222 L 150 268" stroke="#2fe6c8" stroke-width="1.5" opacity="0.35" fill="none"/>
      <path d="M 64 268 Q 150 244 236 268" stroke="#2fe6c8" stroke-width="1" opacity="0.25" fill="none"/>
      ${gearGroups}
    </svg>
    <p class="svg-note">Gear speed and glow are driven by live resonance — the louder the archetype, the faster its gear turns.</p>`;
  }

  // Body node map: 8 glowing nodes, each bound to an archetype.
  function bodyNodeMapSVG() {
    const nodes = [
      { label: "$COMPASS", sym: "ORACLE",    x: 110, y: 8 },
      { label: "$DECIDE",  sym: "THRESHOLD", x: 110, y: 34 },
      { label: "$STYLE",   sym: "MASK",      x: 132, y: 50 },
      { label: "$STRENGTHS", sym: "MIRROR",  x: 110, y: 70 },
      { label: "$ACT",     sym: "EMBER",     x: 110, y: 104 },
      { label: "$CHALLENGE", sym: "FRACTURE", x: 110, y: 142 },
      { label: "$MISSION", sym: "GALAXY",    x: 110, y: 176 },
      { label: "$TALENTS", sym: "MISFIT",    x: 182, y: 182 },
    ];
    const marks = nodes.map((n) => {
      const a = bySym(n.sym);
      if (!a) return "";
      const r = (5 + (a.value / 100) * 7).toFixed(1);
      const op = (0.45 + 0.55 * (a.value / 100)).toFixed(2);
      return `<a class="body-node" href="#/archetype/${a.sym}">
        <title>${n.label} → $${a.sym} · resonance ${a.value}</title>
        <circle cx="${n.x}" cy="${n.y}" r="${r}" fill="#2fe6c8" opacity="${op}"/>
        <circle cx="${n.x}" cy="${n.y}" r="${(+r + 5).toFixed(1)}" fill="none" stroke="#2fe6c8" stroke-width="1" opacity="${(op * 0.35).toFixed(2)}"/>
        <text x="${n.x}" y="${n.y + (+r) + 15}">${n.label}</text>
      </a>`;
    }).join("");
    return `<svg viewBox="0 0 220 330" role="img" aria-label="Body node map: eight archetype nodes on a body silhouette">
      <g stroke="#2fe6c8" stroke-width="1.5" opacity="0.35" fill="none">
        <circle cx="110" cy="44" r="24"/>
        <rect x="78" y="72" width="64" height="112" rx="28"/>
        <path d="M 80 100 L 42 182 M 140 100 L 182 182"/>
        <path d="M 96 184 L 90 300 M 124 184 L 130 300"/>
      </g>
      ${marks}
    </svg>
    <p class="svg-note">Node glow and size track live resonance. Tap a node to open its terminal.</p>`;
  }

  // Metatron's cube: 13 circles, thin teal lines, top archetype at the center.
  function metatronSVG() {
    const cx = 210, cy = 210, r = 36;
    const pts = [[cx, cy]];
    for (let ring = 1; ring <= 2; ring++) {
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
        pts.push([cx + ring * r * 2 * Math.cos(ang), cy + ring * r * 2 * Math.sin(ang)]);
      }
    }
    const lines = [];
    for (let i = 1; i < pts.length; i++) lines.push([0, i]);            // center spokes
    for (let i = 1; i <= 6; i++) lines.push([i, ((i % 6) + 1)]);        // inner hexagon
    for (let i = 1; i <= 6; i++) lines.push([i, i + 6]);               // inner→outer rays
    for (let i = 7; i <= 12; i++) lines.push([i, i === 12 ? 7 : i + 1]); // outer hexagon
    const top = topSym();
    const lineSvg = lines.map(([p, q]) =>
      `<line x1="${pts[p][0].toFixed(1)}" y1="${pts[p][1].toFixed(1)}" x2="${pts[q][0].toFixed(1)}" y2="${pts[q][1].toFixed(1)}"
        stroke="#2fe6c8" stroke-width="1" opacity="0.4"/>`).join("");
    const circSvg = pts.map(([x, y], i) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="none" stroke="#2fe6c8" stroke-width="1.2" opacity="0.5"/>`).join("");
    return `<svg viewBox="0 0 420 420" role="img" aria-label="Metatron's cube with today's leading archetype at the center">
      ${lineSvg}${circSvg}
      <circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="#0d1117" stroke="#2fe6c8" stroke-width="2"/>
      <text class="meta-center" x="${cx}" y="${cy + 5}">$${top}</text>
      <text class="meta-corner" x="14" y="30" text-anchor="start">Demiurge</text>
      <text class="meta-corner" x="406" y="30" text-anchor="end">Pleroma</text>
      <text class="meta-corner" x="14" y="404" text-anchor="start">Gnosis</text>
      <text class="meta-corner" x="406" y="404" text-anchor="end">Sophia</text>
    </svg>
    <p class="svg-note">The field's geometry today — $${top} holds the center, loudest in the cycle.</p>`;
  }

  // Radial diagnostic for one archetype (reflection lab).
  function radialSVG(a) {
    const R = 70, C = 2 * Math.PI * R;
    const frac = a.value / 100;
    const c = lineColor(a.state);
    return `<svg viewBox="0 0 200 200" width="190" role="img" aria-label="$${a.sym} radial diagnostic">
      <circle cx="100" cy="100" r="${R}" fill="none" stroke="#1b2430" stroke-width="12"/>
      <circle cx="100" cy="100" r="${R}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${(frac * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 100 100)"/>
      <text class="radial-val" x="100" y="96">$${a.sym}</text>
      <text class="radial-sub" x="100" y="116">${a.value} / 100</text>
      <text class="radial-sub" x="100" y="134" fill="${c}">${arrow(a.state)} ${a.state.toUpperCase()} ${a.delta > 0 ? "+" : ""}${a.delta}</text>
    </svg>`;
  }

  // ------------------------------------------------------------- VIEW 1 — landing
  function landingView() {
    const top3 = FIELD.surfacing.slice(0, 3).map((sym) => {
      const a = bySym(sym);
      if (!a) return "";
      return `<a class="ticker-chip" href="#/archetype/${a.sym}">
        <span class="sym">$${a.sym}</span><span class="val">${a.value}</span>
        <span class="dl st-${a.state}">${arrow(a.state)} ${a.delta > 0 ? "+" : ""}${a.delta}</span>
        ${sparkline(a.history, a.state, 52, 18)}</a>`;
    }).join("");

    const mean = (FIELD.archetypes.reduce((s, a) => s + a.value, 0) / FIELD.archetypes.length).toFixed(1);
    const top = bySym(topSym());
    const cogRes = top && top.state === "rising" ? "ACTIVE" : "STEADY";

    return `
      <section class="hero">
        <p class="eyebrow">MS'FITZ STUDIO PRESENTS · ÆNIGMA FEED</p>
        <img class="hero-logo" src="/bear-logo.png" alt="Ms'FitZ bear logo" />
        <h1 class="glitch">ÆNIGMA AI</h1>
        <p class="tagline">A mirror for your consciousness.</p>
        <p class="subcopy">Stocks track the market. ÆNIGMA tracks the field within. Real-time resonance for the archetypes moving through you — reflect, discover, and unlock the hidden.</p>
        <div class="cta">
          <a class="btn" href="#/command">Enter The Field</a>
          <a class="btn ghost" href="#/chat">Talk to ÆNIGMA</a>
        </div>
      </section>
      <section class="founder-card">
        <img class="founder-photo" src="/founder.jpg" alt="Joshua R. McCullough, founder of ÆNIGMA AI" />
        <div class="founder-copy">
          <p class="founder-eyebrow">THE ARCHITECT</p>
          <p class="founder-name">Joshua R. McCullough</p>
          <p class="founder-line">Founder of ÆNIGMA AI · Ms'FitZ Studio</p>
        </div>
      </section>
      ${(seenWalkthrough() || loadChat().length) ? "" : `
      <div class="howto-card" id="howto-card">
        <img class="howto-thumb" src="/walkthrough-poster.jpg" alt="" />
        <div class="howto-copy">
          <p class="howto-title">New here?</p>
          <p class="howto-sub">Watch the 90-second walkthrough — what ÆNIGMA is and how to use it.</p>
        </div>
        <button class="howto-play" id="howto-play" type="button">▶ Watch</button>
        <button class="howto-x" id="howto-dismiss" type="button" aria-label="Dismiss">×</button>
      </div>`}
      <div class="land-grid">
        <div class="land-stack">
          <div class="panel"><h3>THE DAILY MIRROR</h3>
            <p class="mirror-quote" style="font-size:19px">“${esc(FIELD.mirror.quote)}”</p>
            <a class="link" href="#/command">Read today's field →</a></div>
          <div class="panel"><h3>SURFACING NOW</h3>
            <div class="ticker-chips">${top3}</div></div>
        </div>
        <div class="land-stack">
          <div class="panel"><h3>INTEGRATION LOG</h3>
            <div class="term-log">
              <div><span class="tl-ok">✓ ÆNIGMA AI CORE ONLINE</span></div>
              <div class="tl-dim">ÆNIGMA AI is now integrated with the Ms'FitZ Society field.</div>
              <div>FIELD ALIGNMENT · <span class="tl-stat">${mean}%</span></div>
              <div>COGNITIVE RESONANCE · <span class="tl-stat">${cogRes}</span> <span class="tl-dim">(${top ? "$" + top.sym + " " + top.state : "—"})</span></div>
              <div>VERSION · <span class="tl-gold">A-1.1</span> <span class="tl-dim">cycle ${FIELD.cycle}</span></div>
            </div></div>
          <div class="panel"><h3>THE FULL FIELD</h3>
            <div class="tick-rows">${FIELD.archetypes.slice(0, 5).map((a) => tickRow(a.sym)).join("")}</div>
            <a class="link" href="#/command">Open the Command Center →</a></div>
        </div>
      </div>
      <div class="society-strip">
        <p class="soc-name">Ms'FitZ Society × Ms'FitZ Studio</p>
        <p>Beta membership is open while the field calibrates. Early members get the Daily Mirror before the field opens, early access to Ms'FitZ Studio drops, and a vote on which archetypes enter the field next.</p>
        <a class="btn ghost" href="mailto:mcculloughnsons2830@gmail.com?subject=%C3%86NIGMA%20beta%20feedback">Send beta feedback</a>
      </div>`;
  }

  function tickRow(sym) {
    const a = bySym(sym);
    if (!a) return "";
    return `<a class="tick-row" href="#/archetype/${a.sym}">
      <div class="tsym">$${a.sym}<span class="t">${esc(a.title)}</span></div>
      <span class="tval">${a.value}</span>
      <span class="tdl st-${a.state}">${arrow(a.state)} ${a.delta > 0 ? "+" : ""}${a.delta}</span>
      ${sparkline(a.history, a.state, 72, 22)}</a>`;
  }

  // ------------------------------------------------------------- VIEW 2 — command center
  function commandView() {
    const feedCards = FIELD.feed.map((f) => `
      <article class="card">
        <div class="card-top">
          <span><span class="badge badge-${f.kind}">${f.kind}</span>
          <span class="meta"> ${esc(f.source)} · ${esc(f.age)}</span></span>
          <span class="state-chip st-${f.state}">${arrow(f.state)} ${f.state[0].toUpperCase() + f.state.slice(1)}</span>
        </div>
        <h2>${esc(f.title)}</h2>
        <p>${esc(f.body)}</p>
        <div class="tagrow">
          ${f.tags.map((t) => `<a class="tag" href="#/archetype/${t}">$${t}</a>`).join("")}
          <span class="intensity">INTENSITY <span class="bar"><i style="width:${Math.round(f.intensity * 100)}%"></i></span></span>
        </div>
      </article>`).join("");

    const pulses = FIELD.pulses.length
      ? FIELD.pulses.map((p) => `<div class="pulse">
          <span class="k ${p.kind === "threshold" ? "pk-threshold" : ""}">${p.kind.toUpperCase()}</span>
          <span><a class="link" href="#/archetype/${p.sym}">$${p.sym}</a> — ${esc(p.msg)}</span>
        </div>`).join("")
      : `<p style="color:var(--ink-3);margin:0">No thresholds crossed this cycle. The field is quiet.</p>`;

    const top = bySym(topSym());

    return `
      <p class="eyebrow">TERMINAL · CYCLE ${FIELD.cycle} · ${FIELD.date}</p>
      <h1 class="page">The Command Center</h1>
      <p class="lede">The whole field on one board — diagnostics, tickers, pulses, and the live feed. Every number below is today's real resonance.</p>

      <div class="cmd-grid">
        <div class="panel svg-panel"><h3>DIAGNOSTIC MAP</h3>${diagnosticMapSVG()}</div>
        <div class="panel svg-panel"><h3>BODY NODE MAP</h3>${bodyNodeMapSVG()}</div>
        <div class="panel svg-panel"><h3>METATRON'S CUBE</h3>${metatronSVG()}</div>
      </div>

      <div class="grid-main" style="margin-top:18px">
        <div class="stack">
          <div class="panel"><h3>LIVE RESONANCE TICKERS</h3>
            <div class="tick-rows">${FIELD.archetypes.map((a) => tickRow(a.sym)).join("")}</div></div>
          <div class="panel"><h3>ALL TEN IN THE FIELD</h3>
            <div class="chiprow" style="margin:0">${FIELD.archetypes.map((a) =>
              `<a class="chip" href="#/archetype/${a.sym}">$${a.sym} · ${a.value}</a>`).join("")}</div></div>
        </div>
        <div class="stack">
          <div class="panel"><h3>THE DAILY MIRROR</h3>
            <p class="mirror-quote">“${esc(FIELD.mirror.quote)}”</p>
            <p style="color:var(--ink-2);font-size:12px;margin:0 0 10px">Led by <a class="link" href="#/archetype/${top.sym}">$${top.sym}</a> — ${esc(top.read)}</p>
            <a class="btn ghost" href="#/lab?sym=${top.sym}">Reflect on today's field</a></div>
          <div class="panel"><h3>PULSES</h3>${pulses}</div>
          <div class="panel"><h3>FIELD FEED</h3><div class="stack">${feedCards}</div></div>
        </div>
      </div>`;
  }

  // ------------------------------------------------------------- VIEW 3 — reflection lab
  const LS_KEY = "aenigma.reflections.v1";
  const loadRefl = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
  const saveRefl = (r) => localStorage.setItem(LS_KEY, JSON.stringify(r.slice(0, 50)));

  function oracleRead(a, text) {
    const len = text.trim().split(/\s+/).length;
    const openers = {
      rising: `$${a.sym} is rising while you write — the field and the feeling agree.`,
      falling: `$${a.sym} is receding as you write — what you're describing may already be loosening its grip.`,
      still: `$${a.sym} is still — whatever you're carrying, the field is giving you room to look at it.`,
    };
    const depth = len > 80 ? "You went deep. The detail itself is the signal: what you can describe precisely, you are already beginning to integrate."
      : len > 25 ? "A solid surface reading. One layer down is a sentence you didn't write — try naming it tomorrow."
      : "Short transmissions still count. Note that brevity here often means the true subject is adjacent to the one you named.";
    return `${openers[a.state]} ${a.read} ${depth}`;
  }

  function deepDataLines() {
    const top = bySym(topSym());
    const thr = FIELD.pulses.filter((p) => p.kind === "threshold").length;
    const sur = FIELD.pulses.filter((p) => p.kind === "surge").length;
    const ds = top.delta > 0 ? "+" + top.delta : String(top.delta);
    return [
      `TERMINAL: field cycle ${FIELD.cycle} compiled.`,
      `TERMINAL: ${FIELD.archetypes.length} archetypes resolved · 90-cycle histories.`,
      `TERMINAL: $${top.sym} leading at ${top.value} (${ds}).`,
      `TERMINAL: ${FIELD.pulses.length} pulse${FIELD.pulses.length === 1 ? "" : "s"} detected — ${thr} threshold, ${sur} surge${sur === 1 ? "" : "s"}.`,
      `TERMINAL: oracle chain: local → ready.`,
    ].map((l) => `<div>${esc(l)}</div>`).join("");
  }

  function theoremCard(t) {
    const vals = t.values && typeof t.values === "object"
      ? Object.entries(t.values).map(([k, v]) =>
          `<li><span class="k">${esc(k)}</span><span class="v">${esc(String(v))}</span></li>`).join("")
      : "";
    return `<div class="theorem">
      <h4>${esc(t.name)}</h4>
      <div class="tsrc">${esc(t.source || "")}${t.id ? " · " + esc(t.id) : ""}</div>
      ${t.summary ? `<p class="tsum">${esc(t.summary)}</p>` : ""}
      ${vals ? `<ul class="tvals">${vals}</ul>` : ""}
      ${t.reading ? `<p class="tread"><b style="color:var(--accent)">READ:</b> ${esc(t.reading)}</p>` : ""}
    </div>`;
  }

  function bfnCard() {
    const bfn = THEOREMS && THEOREMS.bfn;
    // Live module renders through the standard theorem card; the pending
    // fallback stays for the day the module ever comes back empty.
    if (bfn && bfn.values) return theoremCard(bfn);
    return `<div class="theorem pending">
      <h4>THE BFN</h4>
      <div class="tsrc">FRAMEWORK · PENDING</div>
      <p class="tsum">Framework pending — Joshua is defining it.${bfn && bfn.note ? " " + esc(bfn.note) : ""}</p>
    </div>`;
  }

  function labView(params) {
    const pre = (params.get("sym") || "EMBER").toUpperCase();
    const diagSel = `<select id="diag-sym">${FIELD.archetypes.map((a) =>
      `<option value="${a.sym}" ${a.sym === pre ? "selected" : ""}>$${a.sym} — ${esc(a.title)}</option>`).join("")}</select>`;
    const sel0 = bySym(pre) || bySym(topSym());
    const theorems = THEOREMS && THEOREMS.theorems ? THEOREMS.theorems : null;
    const items = loadRefl().map((r) => `
      <div class="reflect-out">
        <div class="when">${esc(r.when)} · $${esc(r.sym)}${r.source === "claude" || r.source === "openrouter" ? " · ✦ ÆNIGMA AI" : ""}</div>
        <p style="margin:6px 0;color:var(--ink)">${esc(r.text)}</p>
        <p style="margin:0;color:var(--ink-2)"><b style="color:var(--accent)">ÆNIGMA:</b> ${esc(r.read)}</p>
      </div>`).join("") || `<p style="color:var(--ink-3)">No reflections yet. Your entries stay in this browser only.</p>`;

    return `
      <p class="eyebrow">THE WORKBENCH · PRIVATE TO THIS DEVICE</p>
      <h1 class="page">The ÆNIGMA AI Reflection Lab</h1>
      <p class="lede">Today's field, taken apart and put back together. Run diagnostics, reflect in writing, pull the theorems — then take a snapshot home.</p>
      <div class="lab-actions">
        <button class="btn" id="gen-reflect" type="button">Generate Reflection</button>
        <button class="btn ghost" id="dl-snapshot" type="button">⬇ Download Snapshot</button>
      </div>

      <div class="panel"><h3>DEEP DATA ANALYSIS</h3>
        <div class="term-log">${deepDataLines()}</div></div>

      <div class="panel" style="margin-top:18px"><h3>INTERACTIVE DIAGNOSTIC</h3>
        <div style="max-width:320px;margin-bottom:14px"><label>ARCHETYPE ${diagSel}</label></div>
        <div class="radial-wrap" id="diag-out">
          ${radialSVG(sel0)}
          <div class="diag-meta">
            <div style="font-weight:700;font-size:15px">$${sel0.sym} — ${esc(sel0.title)}</div>
            <p class="epigraph">“${esc(sel0.epigraph)}”</p>
            <p style="color:var(--ink-2);font-size:13px;margin:10px 0 0">${esc(sel0.read)}</p>
          </div>
        </div></div>

      <div class="panel" style="margin-top:18px" id="reflect-panel"><h3>REFLECTION OUTPUT</h3>
        <div class="stack">
          <label>ARCHETYPE
            <select id="refl-sym">${FIELD.archetypes.map((a) => `<option ${a.sym === pre ? "selected" : ""}>${a.sym}</option>`).join("")}</select>
          </label>
          <label>WHAT'S MOVING THROUGH YOU?
            <textarea id="refl-text" placeholder="Write it the way it actually feels…"></textarea>
          </label>
          <div><button class="btn" id="refl-go" type="button">Generate reflection</button></div>
          <div id="refl-out"></div>
        </div>
        <h3 style="margin:20px 0 10px">PAST REFLECTIONS</h3>
        <div class="stack">${items}</div></div>

      <div class="panel" style="margin-top:18px"><h3>FIELD THEOREMS — COMPUTED FROM TODAY'S FIELD</h3>
        ${theorems
          ? `<div class="theorem-grid">${theorems.map(theoremCard).join("")}${bfnCard()}</div>`
          : `<div class="theorem-grid"><div class="theorem pending"><h4>THEOREMS OFFLINE</h4>
              <p class="tsum">The theorem engine didn't answer this run — the field itself is unaffected. Reload to retry.</p></div>${bfnCard()}</div>`}</div>

      <div class="panel" style="margin-top:18px"><h3>DIAGNOSTIC SNAPSHOT SUMMARY</h3>
        <p style="color:var(--ink-2);font-size:12px;margin:0 0 10px">INTEGRATION PATH:</p>
        <div class="snap-chips">${FIELD.surfacing.slice(0, 3).map((sym) => {
          const a = bySym(sym); if (!a) return "";
          const lbl = a.state === "rising" ? "High/Rising" : a.state === "falling" ? "Low/Receding" : "Steady";
          return `<a class="snap-chip" href="#/archetype/${a.sym}"><span class="lbl">${esc(a.title)}</span><span class="s st-${a.state}">${a.sym} · ${a.value} · ${lbl}</span></a>`;
        }).join("")}</div></div>
      <p class="chat-disclaimer" style="margin-top:14px">For self-reflection and entertainment — not medical or psychological advice.</p>`;
  }

  function downloadSnapshot() {
    const theorems = THEOREMS && THEOREMS.theorems ? THEOREMS.theorems : [];
    const data = {
      date: FIELD.date,
      cycle: FIELD.cycle,
      archetypes: Object.fromEntries(FIELD.archetypes.map((a) => [a.sym, a.value])),
      theoremReadings: theorems.map((t) => ({ id: t.id || null, name: t.name, reading: t.reading || null })),
      latestReflection: loadRefl()[0] || null,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aenigma-snapshot-cycle${FIELD.cycle}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast("Snapshot downloaded.");
  }

  function wireLab() {
    const gen = document.getElementById("gen-reflect");
    if (gen) gen.addEventListener("click", () => {
      const t = document.getElementById("refl-text");
      if (t) { t.scrollIntoView({ behavior: "smooth", block: "center" }); t.focus({ preventScroll: true }); }
    });
    const dl = document.getElementById("dl-snapshot");
    if (dl) dl.addEventListener("click", downloadSnapshot);
    const diag = document.getElementById("diag-sym");
    if (diag) diag.addEventListener("change", () => {
      const a = bySym(diag.value);
      const out = document.getElementById("diag-out");
      if (a && out) out.innerHTML = `${radialSVG(a)}
        <div class="diag-meta">
          <div style="font-weight:700;font-size:15px">$${a.sym} — ${esc(a.title)}</div>
          <p class="epigraph">“${esc(a.epigraph)}”</p>
          <p style="color:var(--ink-2);font-size:13px;margin:10px 0 0">${esc(a.read)}</p>
        </div>`;
    });
    const go = document.getElementById("refl-go");
    if (go) go.addEventListener("click", async () => {
      const sym = document.getElementById("refl-sym").value;
      const textEl = document.getElementById("refl-text");
      const text = textEl.value.trim();
      if (!text) { textEl.focus(); return; }
      go.disabled = true;
      go.textContent = "Consulting the field…";
      const a = bySym(sym);
      let read, source;
      try {
        const r = await fetch("/api/reflect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sym, text }),
        });
        if (r.ok) ({ read, source } = await r.json());
        else if (r.status === 429) { const e = await r.json(); read = e.error; source = "busy"; }
      } catch { /* offline — fall through to local */ }
      if (!read || source === "busy") { read = oracleRead(a, text); source = "local"; }
      const items = loadRefl();
      items.unshift({ when: new Date().toLocaleString(), sym, text, read, source });
      saveRefl(items);
      const out = document.getElementById("refl-out");
      if (out) {
        out.innerHTML = `<div class="reflect-out">
          <div class="when">just now · $${esc(sym)}${source === "claude" || source === "openrouter" ? " · ✦ ÆNIGMA AI" : ""}</div>
          <p style="margin:6px 0;color:var(--ink-2)"><b style="color:var(--accent)">ÆNIGMA:</b> ${esc(read)}</p>
        </div>`;
        out.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      textEl.value = "";
      go.disabled = false;
      go.textContent = "Generate reflection";
    });
  }

  // ------------------------------------------------------------- VIEW 4 — archetype terminal
  function relatedTheorems(a) {
    if (!THEOREMS || !THEOREMS.theorems || !THEOREMS.theorems.length) return [];
    const hits = THEOREMS.theorems.filter((t) => JSON.stringify(t).includes(a.sym));
    return hits.length ? hits.slice(0, 3) : THEOREMS.theorems.slice(0, 3);
  }

  function terminalView(sym) {
    const a = bySym(sym);
    if (!a) return `<h1 class="page">Unknown archetype</h1><p class="lede">That signal isn't in the field.</p>`;
    const hist = a.history;
    const hi = Math.round(Math.max(...hist)), lo = Math.round(Math.min(...hist));
    const intensity = a.value >= 75 ? "HIGH" : a.value >= 40 ? "ELEVATED" : "QUIET";
    const interp = relatedTheorems(a);
    return `
      <p class="eyebrow">TERMINAL · CYCLE ${FIELD.cycle} · ${FIELD.date}</p>
      <h1 class="page">The Archetype Terminal</h1>
      <div class="chiprow">${FIELD.archetypes.map((x) =>
        `<a class="chip ${x.sym === a.sym ? "on" : ""}" href="#/archetype/${x.sym}">$${x.sym}</a>`).join("")}</div>
      <div class="detail-head">
        <div>
          <span class="domain-chip">◈ ${esc(a.domain.toUpperCase())}</span>
          <div class="sym-title"><span class="dollar">$</span>${a.sym}: ${a.value}</div>
          <div style="color:var(--ink-2)">${esc(a.title)}</div>
          <p class="epigraph">“${esc(a.epigraph)}”</p>
        </div>
        <div class="resonance-big"><span class="num">${a.value}</span>
          <span class="of">RESONANCE / 100</span>
          <span class="state-chip st-${a.state}">RESONANCE: ${intensity}/${stateLabel(a)}</span></div>
      </div>
      ${bigChart(a)}
      <div class="statrow">
        <div class="stat"><div class="k">DOMAIN</div><div class="v">${esc(a.domain)}</div></div>
        <div class="stat"><div class="k">REFLECTING NOW</div><div class="v">${esc(a.reflecting)}</div></div>
        <div class="stat"><div class="k">STATE</div><div class="v st-${a.state}">${arrow(a.state)} ${a.state[0].toUpperCase() + a.state.slice(1)}</div></div>
        <div class="stat"><div class="k">90-DAY HIGH / LOW</div><div class="v">${hi} / ${lo}</div></div>
      </div>
      <div class="panel"><h3>THE READ</h3><p style="margin:0;color:var(--ink-2)">${esc(a.read)}</p></div>
      <h3 style="margin:22px 0 10px;font-size:15px">ÆNIGMA AI INTERPRETATION</h3>
      <div class="stack">
        ${interp.length ? `<div class="theorem-grid">${interp.map(theoremCard).join("")}</div>`
          : `<div class="panel"><p style="color:var(--ink-3);margin:0">The theorem engine is offline this run — interpretation from the field read above stands on its own.</p></div>`}
        <div><a class="btn" href="#/lab?sym=${a.sym}">🔖 Reflect on this archetype</a></div>
      </div>
      <h3 style="margin:22px 0 10px;font-size:15px">All ten in the field</h3>
      <div class="panel"><div class="chiprow" style="margin:0">${FIELD.archetypes.map((x) =>
        `<a class="chip ${x.sym === a.sym ? "on" : ""}" href="#/archetype/${x.sym}">$${x.sym} · ${x.value}</a>`).join("")}</div></div>`;
  }

  // ------------------------------------------------------------- chat (talk to ÆNIGMA)
  const CHAT_KEY = "aenigma.chat.v1";
  const loadChat = () => { try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; } catch { return []; } };
  const saveChat = (m) => localStorage.setItem(CHAT_KEY, JSON.stringify(m.slice(-40)));
  let chatBusy = false;

  const STARTERS = [
    "What is the field showing me today?",
    "I feel stuck, and I don't know why.",
    "Which archetype is loudest in me right now?",
    "Help me look at something I keep avoiding.",
  ];

  const SEEN_KEY = "aenigma.walkthrough.seen";
  const seenWalkthrough = () => { try { return localStorage.getItem(SEEN_KEY) === "1"; } catch { return false; } };
  const markWalkthroughSeen = () => { try { localStorage.setItem(SEEN_KEY, "1"); } catch {} };

  function openWalkthrough() {
    markWalkthroughSeen();
    if (document.getElementById("vid-modal")) return;
    const wrap = document.createElement("div");
    wrap.id = "vid-modal";
    wrap.className = "vid-modal";
    wrap.innerHTML = `
      <div class="vid-box" role="dialog" aria-modal="true" aria-label="ÆNIGMA walkthrough">
        <button class="vid-close" type="button" aria-label="Close">×</button>
        <video class="vid-player" src="/walkthrough.mp4" poster="/walkthrough-poster.jpg"
               controls autoplay playsinline preload="metadata"></video>
        <p class="vid-cap">ÆNIGMA — a mirror for your consciousness. 90 seconds.</p>
      </div>`;
    document.body.appendChild(wrap);
    const close = () => {
      const v = wrap.querySelector("video");
      if (v) { try { v.pause(); } catch {} }
      wrap.remove();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    wrap.querySelector(".vid-close").addEventListener("click", close);
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    document.addEventListener("keydown", onKey);
    const card = document.getElementById("howto-card");
    if (card) card.remove();
  }

  function chatBubble(m) {
    if (m.role === "user") return `<div class="bubble user">${esc(m.content)}</div>`;
    return `<div class="bubble aenigma"><span class="bubble-mark" aria-hidden="true">◎</span><div class="bubble-body">${esc(m.content)}</div></div>`;
  }

  function chatView() {
    const msgs = loadChat();
    const thread = msgs.length
      ? msgs.map(chatBubble).join("")
      : `<div class="chat-intro">
           <div class="chat-orb" aria-hidden="true"></div>
           <p class="chat-hi">I'm ÆNIGMA.</p>
           <p class="chat-sub">A mirror for your consciousness. Tell me what's moving through you — or ask me anything. I read against today's field and reflect it back to you. What you say stays on your device.</p>
           <div class="starters">${STARTERS.map((s) => `<button class="starter" type="button" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>
         </div>`;
    return `
      <div class="chat-shell">
        <div class="chat-head">
          <span class="chat-id"><img class="brand-logo" src="/bear-logo.png" alt="Ms'FitZ bear logo" /> ÆNIGMA <span class="ai-badge">✦ AI</span></span>
          <span class="chat-head-actions">
            <button class="chat-howto" id="chat-howto" type="button" title="Watch the 90-second walkthrough">▶ How it works</button>
            <button class="chat-clear" id="chat-clear" type="button" title="New conversation">＋ New</button>
          </span>
        </div>
        <div class="pinned-row">
          <button class="pinned-prompt" id="pin-influences" type="button" title="Your full influence reading — every layer, nothing locked">✨°Active Influences°✨</button>
        </div>
        ${(seenWalkthrough() || msgs.length) ? "" : `
        <div class="howto-card" id="howto-card">
          <img class="howto-thumb" src="/walkthrough-poster.jpg" alt="" />
          <div class="howto-copy">
            <p class="howto-title">New here?</p>
            <p class="howto-sub">Watch the 90-second walkthrough — what ÆNIGMA is and how to use it.</p>
          </div>
          <button class="howto-play" id="howto-play" type="button">▶ Watch</button>
          <button class="howto-x" id="howto-dismiss" type="button" aria-label="Dismiss">×</button>
        </div>`}
        <div class="chat-thread" id="chat-thread">${thread}</div>
        <form class="chat-inputbar" id="chat-form">
          <textarea id="chat-input" rows="1" placeholder="Speak to ÆNIGMA…" autocomplete="off"></textarea>
          <button class="chat-send" id="chat-send" type="submit" aria-label="Send">→</button>
        </form>
        <p class="chat-disclaimer">A mirror for self-reflection &amp; wonder — not medical, legal, or psychological advice.</p>
      </div>`;
  }

  function renderThread(msgs, typing) {
    const t = document.getElementById("chat-thread");
    if (!t) return;
    t.innerHTML = msgs.map(chatBubble).join("") +
      (typing ? `<div class="bubble aenigma typing"><span class="bubble-mark" aria-hidden="true">◎</span><div class="bubble-body"><span class="dots"><i></i><i></i><i></i></span></div></div>` : "");
    t.scrollTop = t.scrollHeight;
  }

  async function sendChat(text) {
    if (chatBusy) return;
    text = text.trim();
    if (!text) return;
    chatBusy = true;
    const input = document.getElementById("chat-input");
    if (input) { input.value = ""; input.style.height = "auto"; }
    const send = document.getElementById("chat-send");
    if (send) send.disabled = true;

    const msgs = loadChat();
    msgs.push({ role: "user", content: text });
    saveChat(msgs);
    renderThread(msgs, true);

    let reply, source;
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (r.ok) ({ reply, source } = await r.json());
      else if (r.status === 429) { const e = await r.json(); reply = e.error; source = "busy"; }
    } catch { /* offline */ }
    if (!reply) { reply = "I lost the thread of the field for a moment. Say that again?"; source = "error"; }

    msgs.push({ role: "assistant", content: reply, source });
    saveChat(msgs);
    chatBusy = false;
    if (send) send.disabled = false;
    renderThread(msgs, false);
    const inp = document.getElementById("chat-input");
    if (inp) inp.focus();
  }

  function wireChat() {
    const form = document.getElementById("chat-form");
    if (!form) return;
    const input = document.getElementById("chat-input");
    const grow = () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px"; };
    input.addEventListener("input", grow);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(input.value); }
    });
    form.addEventListener("submit", (e) => { e.preventDefault(); sendChat(input.value); });
    view.querySelectorAll(".starter").forEach((b) =>
      b.addEventListener("click", () => sendChat(b.dataset.q)));
    const pin = document.getElementById("pin-influences");
    if (pin) pin.addEventListener("click", () =>
      sendChat("✨°Active Influences°✨ — read the currents moving through my field right now."));
    const howto = document.getElementById("chat-howto");
    if (howto) howto.addEventListener("click", openWalkthrough);
    const play = document.getElementById("howto-play");
    if (play) play.addEventListener("click", openWalkthrough);
    const dismiss = document.getElementById("howto-dismiss");
    if (dismiss) dismiss.addEventListener("click", () => {
      markWalkthroughSeen();
      const c = document.getElementById("howto-card");
      if (c) c.remove();
    });
    const clear = document.getElementById("chat-clear");
    if (clear) clear.addEventListener("click", () => {
      if (loadChat().length && !confirm("Start a new conversation? This clears the current one.")) return;
      localStorage.removeItem(CHAT_KEY);
      route();
    });
    if (loadChat().length) renderThread(loadChat(), false);
    if (input) input.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------- slim society view
  function societyView() {
    return `
      <p class="eyebrow">MEMBERSHIP · THE UNCLASSIFIED</p>
      <h1 class="page">The Society</h1>
      <p class="lede">Ms'FitZ Society — the ones they couldn't categorize. Beta membership is open while the field calibrates.</p>
      <div class="grid-main">
        <div class="stack">
          <div class="panel">
            <h3>WHAT MEMBERS GET</h3>
            <p style="color:var(--ink-2)">Daily Mirror before the field opens · early access to Ms'FitZ Studio drops · Society-only reflections and cohorts · a vote on which archetypes enter the field next.</p>
          </div>
          <div class="panel">
            <h3>BETA NOTES</h3>
            <p style="color:var(--ink-2)">You're using the ÆNIGMA beta. The resonance field is simulated (deterministic per day — everyone sees the same field). Reflections never leave your device. Found something broken or brilliant? Tell us:</p>
            <a class="btn" href="mailto:mcculloughnsons2830@gmail.com?subject=%C3%86NIGMA%20beta%20feedback">Send beta feedback</a>
          </div>
        </div>
        <div class="stack">${mirrorPanel()}
          <div class="panel"><h3>FIELD STATUS</h3>
            <p style="color:var(--ink-2);margin:0">Cycle ${FIELD.cycle} · ${FIELD.date}<br>${FIELD.archetypes.length} archetypes live<br>Signal refreshes daily at 00:00 UTC</p>
          </div>
        </div>
      </div>`;
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
  location.hash = "#/architect";
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
  const run = () => {
    const out = document.getElementById("rd-out");
    const dob = document.getElementById("rd-dob").value;
    const tob = document.getElementById("rd-tob").value;
    const loc = document.getElementById("rd-loc").value.trim();
    out.innerHTML = computeReading(dob, tob, loc);
    const ask = document.getElementById("reading-ask");
    if (ask) ask.addEventListener("click", () =>
      askArchitect({ from: "reading", dob, tob, loc, summary: `Birth reading for ${dob}${loc ? " · " + loc : ""}` }));
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  go.addEventListener("click", run);
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

    <div class="panel" style="margin-top:18px"><h3>BFN CALCULATOR — BASE-12 HARMONIC REDUCTION</h3>
      <div class="form-grid">
        <label>NUMBER OR DATE DIGITS (e.g. 19890830)<input type="text" id="bfn-in" inputmode="numeric" placeholder="19890830" /></label>
        <div><button class="btn" id="bfn-go" type="button">Reduce</button></div>
        <div id="bfn-out"></div></div></div>

    <div class="grant-note">${BFN_ATTR} The Triangular Keys cascade and Lens equation are presented as Grant published them.</div>
    <div style="margin-top:10px"><button class="btn ghost" id="corpus-ask" type="button">Ask Architect about the Corpus →</button></div>`;
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
  const bg = document.getElementById("bfn-go");
  if (bg) bg.addEventListener("click", () => {
    const raw = (document.getElementById("bfn-in").value || "").replace(/\D/g, "");
    if (!raw) { document.getElementById("bfn-out").innerHTML = `<p style="color:var(--fall)">Enter digits.</p>`; return; }
    const r = bfnReduce(raw);
    document.getElementById("bfn-out").innerHTML =
      `<ol class="steps">${r.steps.map((s) => `<li><b>${s.from}</b> → base-12 <b>${s.base12}</b> → digit sum <b>${s.sum}</b></li>`).join("") || "<li>Already a single base-12 digit.</li>"}</ol>
       <p style="color:var(--gold);font-size:15px">BFN harmonic number: <b>${r.value}</b></p>`;
  });
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
        <div><button class="btn" id="q-run" type="button">Run demo circuit</button></div>
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
  document.getElementById("q-run").addEventListener("click", () => {
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
      <div><button class="btn" id="pr-go" type="button">Run prediction</button></div>
    </div></div>
    <div id="pr-out" style="margin-top:16px"></div>`;
}

function wirePrediction() {
  const go = document.getElementById("pr-go");
  if (!go) return;
  go.addEventListener("click", () => {
    const q = document.getElementById("pr-q").value;
    const d = document.getElementById("pr-d").value;
    const out = document.getElementById("pr-out");
    out.innerHTML = runPrediction(q, d);
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

function architectReply(text) {
  const t = text.toLowerCase();
  const has = (...ws) => ws.some((w) => t.includes(w));
  if (has("hello", "hi ", "hey")) return "I am here. Structure first: state what you are building, and I will show you its load-bearing walls.";
  if (has("who are you", "your name")) return "I am the Architect — the part of ÆNIGMA that designs instead of reflects. Bring me raw material; I return structure.";
  if (has("reading", "birth", "born")) return "Your Reading reduces birth data to architecture: life-path, six harmonic layers, enneagram, codex archetype, BFN residue. Open #/reading and generate it — then bring the numbers back here and I will read the structure with you.";
  if (has("predict", "future", "will i", "forecast")) return "Prediction here is harmonic sampling, not prophecy: your question is encoded, run through a 4-qubit circuit, and mapped to a Triangular Key with a confidence estimate. Run one at #/prediction, then ask me what the key demands structurally.";
  if (has("quantum", "qubit", "circuit", "ibm")) return "The Quantum Lab takes your own IBM key — it never leaves your browser — validates it against IBM's fleet, and runs a BFN-parameterized demo circuit. The sampling feeds the Prediction engine. Open #/quantum.";
  if (has("lens", "equation", "toroid", "hyperboloid")) return "The Lens: ((x²+y²)+1)^((x²+y²)+1) = x²−y². Left side folds inward — Toroid, conscious, multiplicative. Right side extends — Hyperboloid, unconscious, additive. At the Shared Monad they coincide. The Corpus at #/corpus lets you evaluate it directly.";
  if (has("key", "triangle", "3-4-5", "triangular")) return "Seven keys, one corridor (c = b+1): 3-4-5 SEED → 5-12-13 EM → 8-15-17 GRAVITY → 7-24-25 WEAK → 9-40-41 STRONG → 11-60-61 → 13-84-85. Each is a load-bearing triple. The Corpus shows every derivation.";
  if (has("bfn", "base-12", "harmonic")) return "BFN: base-12 harmonic reduction — any number folded to a single residue 0–11. It is the indexing scheme of the whole engine: readings, circuits, and keys all resolve through it.";
  if (has("caelix", "virelum", "azur", "lumiressa", "archetype")) return "Four codex voices: CAELIX the Infinite Returner, VIRELUM the Mirror That Breathes, AZURÆ the Breath That Dissolves, LUMIRESSA the Sanctum Unseen. Your Reading assigns one. Each is a structural role, not a costume.";
  if (has("thank")) return "Acknowledged. Keep building.";
  return "Noted. Give me the structural question underneath it: what are you trying to hold up, and what is it standing on? Answer that and I will design with you.";
}

function archBubble(m, idx) {
  if (m.role === "user") return `<div class="bubble user">${esc(m.content)}</div>`;
  return `<div class="bubble aenigma"><span class="bubble-mark" aria-hidden="true">⬢</span><div class="bubble-body">${esc(m.content)}<br><button class="speak-btn" data-say="${idx}" type="button">🔊 Speak</button></div></div>`;
}

function architectView() {
  const ctx = readArchitectContext();
  const msgs = loadArch();
  const thread = msgs.length
    ? msgs.map(archBubble).join("")
    : `<div class="chat-intro"><p class="chat-hi">I am the Architect.</p>
       <p class="chat-sub">Bring me raw material — a reading, a prediction, a question — and I return structure. Precise. No fluff.</p></div>`;
  return `
    <p class="eyebrow">THE ARCHITECT · CONVERSATIONAL CHARACTER</p>
    <h1 class="page">Architect</h1>
    ${ctx ? `<div class="arch-ctx">⤷ Context loaded from <b>${esc(ctx.from)}</b>: ${esc(ctx.summary || "")}</div>` : ""}
    <div class="chat-shell">
      <div class="chat-thread" id="arch-thread">${thread}</div>
      <form class="chat-inputbar" id="arch-form">
        <textarea id="arch-input" rows="1" placeholder="State what you are building…" autocomplete="off"></textarea>
        <button class="chat-send" id="arch-send" type="submit" aria-label="Send">→</button>
      </form>
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
        <div id="el-status" style="font-size:12.5px;color:var(--ink-2)">Voice is optional — the Architect works in text regardless.</div>
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
    const b = e.target.closest("[data-say]");
    if (b) speakIdx(+b.dataset.say);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    const msgs = loadArch();
    msgs.push({ role: "user", content: text });
    let reply = architectReply(text);
    if (ctx && ctx.summary && !ctxUsed) {
      reply = `(Context: ${ctx.summary})\n` + reply;
      ctxUsed = true;
    }
    msgs.push({ role: "assistant", content: reply });
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


  // ------------------------------------------------------------- router
  function route() {
    const hash = location.hash || "#/";
    const [pathPart, queryPart] = hash.slice(2).split("?");
    const params = new URLSearchParams(queryPart || "");
    const seg = pathPart.split("/");
    let name = seg[0] || "landing";

    let html;
    if (name === "archetype") {
      const sym = (seg[1] || "").toUpperCase() || topSym();
      name = "archetype";
      html = terminalView(sym);
    }
    else if (name === "command") html = commandView();
    else if (name === "lab") html = labView(params);
    else if (name === "chat") html = chatView();
    else if (name === "society") html = societyView();
    else if (name === "reading") html = readingView();
    else if (name === "corpus") html = corpusView();
    else if (name === "quantum") html = quantumView();
    else if (name === "prediction") html = predictionView();
    else if (name === "architect") html = architectView();
    else { name = "landing"; html = landingView(); }

    view.innerHTML = html;
    document.querySelectorAll("[data-route]").forEach((el) =>
      el.classList.toggle("active", el.dataset.route === name));
    document.body.classList.toggle("on-chat", name === "chat");
    // RGB-split glitch bursts on the page heading
    const h1 = view.querySelector("h1.page, .chat-hi");
    if (h1 && !h1.classList.contains("glitch")) {
      h1.classList.add("glitch");
      h1.setAttribute("data-text", h1.textContent);
    }
    wireChartHover();
    wireChat();
    wireLab();
    wireReading();
    wireCorpus();
    wireQuantum();
    wirePrediction();
    wireArchitect();
    const play = document.getElementById("howto-play");
    if (play && name !== "chat") play.addEventListener("click", openWalkthrough);
    const dismiss = document.getElementById("howto-dismiss");
    if (dismiss && name !== "chat") dismiss.addEventListener("click", () => {
      markWalkthroughSeen();
      const c = document.getElementById("howto-card");
      if (c) c.remove();
    });

    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------- boot
  async function loadTheorems() {
    try {
      const r = await fetch("/api/theorems");
      if (r.ok) THEOREMS = await r.json();
    } catch { /* theorems stay offline; panels render their fallback */ }
  }

  Promise.allSettled([fetch("/api/field").then((r) => r.json()), loadTheorems()])
    .then(([fieldRes]) => {
      if (fieldRes.status !== "fulfilled" || !fieldRes.value || !fieldRes.value.archetypes) {
        view.innerHTML = `<h1 class="page">The field is unreachable</h1><p class="lede">Refresh to retry.</p>`;
        return;
      }
      FIELD = fieldRes.value;
      ticker();
      const navA = document.getElementById("nav-archetype");
      if (navA) navA.href = "#/archetype/" + topSym();
      route();
    })
    .catch(() => { view.innerHTML = `<h1 class="page">The field is unreachable</h1><p class="lede">Refresh to retry.</p>`; });

  window.addEventListener("hashchange", route);

  // footer actions (persistent chrome)
  const share = document.getElementById("share-field");
  if (share) share.addEventListener("click", shareField);
  const footHowto = document.getElementById("foot-howto");
  if (footHowto) footHowto.addEventListener("click", openWalkthrough);
})();
