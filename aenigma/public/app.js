/* ÆNIGMA beta — front end */
(() => {
  "use strict";

  const view = document.getElementById("view");
  const tooltip = document.getElementById("tooltip");
  let FIELD = null;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const arrow = (st) => (st === "rising" ? "↗" : st === "falling" ? "↘" : "→");
  const stTxt = (a) => `${arrow(a.state)} ${a.state[0].toUpperCase() + a.state.slice(1)} ${a.delta > 0 ? "+" : ""}${a.delta}`;
  const bySym = (sym) => FIELD.archetypes.find((a) => a.sym === sym);

  // ------------------------------------------------------------- charts
  const CHART = { rise: "#0fa890", fall: "#e0512e", still: "#8b63e8" };
  const lineColor = (st) => CHART[st === "rising" ? "rise" : st === "falling" ? "fall" : "still"];

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
        <span class="delta st-${a.state}">${a.delta > 0 ? "+" : ""}${a.delta} this cycle</span></div>
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
      `<a class="tick-item" href="#/a/${a.sym}"><span class="sym">$${a.sym}</span>
       <span class="val">${a.value}</span><span class="st-${a.state}">${arrow(a.state)} ${a.delta > 0 ? "+" : ""}${a.delta}</span></a>`).join("");
    document.getElementById("ticker-track").innerHTML = items + items; // loop
  }

  function railRow(sym) {
    const a = bySym(sym);
    return `<a class="rail-row" href="#/a/${a.sym}">
      <div><div class="sym">$${a.sym}</div><div class="sub">${a.reflecting} reflecting</div></div>
      ${sparkline(a.history, a.state)}
      <span class="rail-chip st-${a.state}">${stTxt(a)}</span></a>`;
  }

  function mirrorPanel() {
    return `<div class="panel"><h3>THE DAILY MIRROR</h3>
      <p class="mirror-quote">“${esc(FIELD.mirror.quote)}”</p>
      <a class="link" href="#/mirror">Read today's field ↗</a></div>`;
  }

  // ------------------------------------------------------------- views
  function signalView() {
    const cards = FIELD.feed.map((f) => `
      <article class="card">
        <div class="card-top">
          <span><span class="badge badge-${f.kind}">${f.kind}</span>
          <span class="meta"> ${esc(f.source)} · ${f.age}</span></span>
          <span class="state-chip st-${f.state}">${arrow(f.state)} ${f.state[0].toUpperCase() + f.state.slice(1)}</span>
        </div>
        <h2>${esc(f.title)}</h2>
        <p>${esc(f.body)}</p>
        <div class="tagrow">
          ${f.tags.map((t) => `<a class="tag" href="#/a/${t}">$${t}</a>`).join("")}
          <span class="intensity">INTENSITY <span class="bar"><i style="width:${Math.round(f.intensity * 100)}%"></i></span></span>
        </div>
      </article>`).join("");

    return `
      <p class="eyebrow">LIVE FIELD · RESONANCE IS MOVING</p>
      <h1 class="page">The Signal</h1>
      <p class="lede">Breaking transmissions from the inner world — drops, insights, and dispatches, read against what the archetypes are doing right now.</p>
      <div class="grid-main">
        <div class="stack">${cards}</div>
        <div class="stack">
          ${mirrorPanel()}
          <div class="panel"><h3>SURFACING · rising fastest</h3>${FIELD.surfacing.map(railRow).join("")}</div>
          <div class="panel"><h3>RECEDING · falling fastest</h3>${FIELD.receding.map(railRow).join("")}</div>
        </div>
      </div>`;
  }

  function detailView(sym) {
    const a = bySym(sym);
    if (!a) return `<h1 class="page">Unknown archetype</h1><p class="lede">That signal isn't in the field.</p>`;
    const others = FIELD.archetypes.filter((x) => x.sym !== a.sym).slice(0, 4);
    return `
      <p><a class="link" href="#/signal">← The Signal</a></p>
      <div class="detail-head">
        <div>
          <span class="domain-chip">◈ ${a.domain.toUpperCase()}</span>
          <div class="sym-title"><span class="dollar">$</span>${a.sym}</div>
          <div>${esc(a.title)}</div>
          <p class="epigraph">“${esc(a.epigraph)}”</p>
        </div>
        <div class="resonance-big"><span class="num">${a.value}</span>
          <span class="of">RESONANCE / 100</span>
          <span class="state-chip st-${a.state}">${stTxt(a)}</span></div>
      </div>
      ${bigChart(a)}
      <div class="statrow">
        <div class="stat"><div class="k">REFLECTING NOW</div><div class="v">${a.reflecting}</div></div>
        <div class="stat"><div class="k">DOMAIN</div><div class="v">${esc(a.domain)}</div></div>
        <div class="stat"><div class="k">STATE</div><div class="v st-${a.state}">${arrow(a.state)} ${a.state[0].toUpperCase() + a.state.slice(1)}</div></div>
        <div class="stat"><a class="btn ghost" href="#/reflect?sym=${a.sym}">🔖 Reflect on this</a></div>
      </div>
      <div class="panel"><h3>THE READ</h3><p style="margin:0;color:var(--ink-2)">${esc(a.read)}</p></div>
      <h3 style="margin:22px 0 10px;font-size:15px">Signals touching $${a.sym}</h3>
      <div class="panel">${others.map((o) => railRow(o.sym)).join("")}</div>`;
  }

  function mirrorView() {
    const top = bySym(FIELD.surfacing[0]);
    return `
      <p class="eyebrow">CYCLE ${FIELD.cycle} · ${FIELD.date}</p>
      <h1 class="page">The Daily Mirror</h1>
      <p class="lede">One read per cycle. Sit with it longer than is comfortable.</p>
      <div class="panel" style="padding:28px">
        <p class="mirror-quote" style="font-size:22px">“${esc(FIELD.mirror.quote)}”</p>
        <p style="color:var(--ink-2)">Today the field is led by <a class="link" href="#/a/${top.sym}">$${top.sym}</a> — ${esc(top.title)}, ${top.value}/100 and ${top.state}. ${esc(top.read)}</p>
        <a class="btn" href="#/reflect?sym=${top.sym}">Reflect on today's field</a>
      </div>
      <h3 style="margin:22px 0 10px;font-size:15px">The full field, this cycle</h3>
      <div class="panel">${FIELD.archetypes.map((a) => railRow(a.sym)).join("")}</div>`;
  }

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

  function reflectView(params) {
    const pre = params.get("sym") || "EMBER";
    const items = loadRefl().map((r) => `
      <div class="reflection-out">
        <div class="when">${esc(r.when)} · $${esc(r.sym)}${r.source === "claude" || r.source === "openrouter" ? " · ✦ ÆNIGMA AI" : ""}</div>
        <p style="margin:6px 0;color:var(--ink)">${esc(r.text)}</p>
        <p style="margin:0;color:var(--ink-2)"><b style="color:var(--accent)">ÆNIGMA:</b> ${esc(r.read)}</p>
      </div>`).join("") || `<p style="color:var(--ink-3)">No reflections yet. Your entries stay in this browser only.</p>`;
    return `
      <p class="eyebrow">YOUR WORK · PRIVATE TO THIS DEVICE</p>
      <h1 class="page">Reflections</h1>
      <p class="lede">Write against the field. ÆNIGMA answers with a read — beta reads are generated locally from today's resonance.</p>
      <div class="panel stack">
        <label>Archetype
          <select id="refl-sym">${FIELD.archetypes.map((a) => `<option ${a.sym === pre ? "selected" : ""}>${a.sym}</option>`).join("")}</select>
        </label>
        <label>What's moving through you?
          <textarea id="refl-text" placeholder="Write it the way it actually feels…"></textarea>
        </label>
        <div><button class="btn" id="refl-go">Generate reflection</button></div>
      </div>
      <h3 style="margin:22px 0 10px;font-size:15px">Past reflections</h3>
      <div class="stack">${items}</div>`;
  }

  function codexView() {
    const rows = FIELD.archetypes.map((a, i) => `
      <a class="codex-row" href="#/a/${a.sym}">
        <span class="codex-sym"><span class="cx-num">${String(i + 1).padStart(2, "0")}</span><span class="cx-d">$</span>${a.sym}
          <span class="cx-val st-${a.state}">${a.value}</span></span>
        <span class="codex-epi">“${esc(a.epigraph)}”</span>
      </a>`).join("");
    return `
      <p class="eyebrow">THE CODEX · THE 10 ARCHETYPES</p>
      <h1 class="page">The Codex</h1>
      <p class="lede">Every archetype moving through the field, and what each is telling you — with its resonance right now. Which is loudest in you?</p>
      <div class="codex-card" id="codex-card">
        <div class="codex-head">
          <span class="cx-brand"><span class="brand-eye" aria-hidden="true"></span> ÆNIGMA</span>
          <span class="cx-active"><span class="dot" aria-hidden="true"></span> FIELD ACTIVE</span>
        </div>
        <div class="codex-list">${rows}</div>
        <div class="codex-foot">A mirror for your consciousness · the ones they couldn't categorize, those are ours.</div>
      </div>
      <div class="share-row">
        <button class="btn" id="share-field">↗ Share the field</button>
        <a class="btn ghost" href="/archetypes-card.png" download="aenigma-archetypes.png">⬇ Download card</a>
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

  // ------------------------------------------------------------- ÆNIGMA chat
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
          <span class="chat-id"><span class="brand-eye" aria-hidden="true"></span> ÆNIGMA <span class="ai-badge">✦ AI</span></span>
          <button class="chat-clear" id="chat-clear" type="button" title="New conversation">＋ New</button>
        </div>
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
    const clear = document.getElementById("chat-clear");
    if (clear) clear.addEventListener("click", () => {
      if (loadChat().length && !confirm("Start a new conversation? This clears the current one.")) return;
      localStorage.removeItem(CHAT_KEY);
      route();
    });
    // only re-render when there's history — an empty conversation keeps the
    // server-rendered intro (orb + starters) with its wired buttons intact
    if (loadChat().length) renderThread(loadChat(), false);
    if (input) input.focus({ preventScroll: true });
  }

  function pulsesView() {
    return `
      <p class="eyebrow">ALERTS · THRESHOLDS &amp; SURGES</p>
      <h1 class="page">Pulses</h1>
      <p class="lede">What crossed a line this cycle. Thresholds at 75 and 25; surges are single-cycle moves ≥ 5.</p>
      <div class="panel">
        ${FIELD.pulses.map((p) => `<div class="pulse"><span class="k">${p.kind.toUpperCase()}</span>
          <span><a class="link" href="#/a/${p.sym}">$${p.sym}</a> — ${esc(p.msg)}</span></div>`).join("")}
      </div>`;
  }

  function societyView() {
    return `
      <p class="eyebrow">MEMBERSHIP · THE UNCLASSIFIED</p>
      <h1 class="page">The Society</h1>
      <p class="lede">Ms'FitZ Society — the ones they couldn't categorize. Beta membership is open while the field calibrates.</p>
      <div class="grid-main">
        <div class="stack">
          <div class="panel">
            <h3>WHAT MEMBERS GET</h3>
            <p style="color:var(--ink-2)">Daily Mirror before the field opens · early access to MsFiZ Studio drops · Society-only reflections and cohorts · a vote on which archetypes enter the field next.</p>
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

  // ------------------------------------------------------------- router
  function route() {
    const hash = location.hash || "#/chat";
    const [pathPart, queryPart] = hash.slice(2).split("?");
    const params = new URLSearchParams(queryPart || "");
    const seg = pathPart.split("/");
    let name = seg[0] || "chat";

    let html;
    if (name === "a" && seg[1]) html = detailView(seg[1].toUpperCase());
    else if (name === "signal") html = signalView();
    else if (name === "mirror") html = mirrorView();
    else if (name === "reflect") html = reflectView(params);
    else if (name === "codex") html = codexView();
    else if (name === "pulses") html = pulsesView();
    else if (name === "society") html = societyView();
    else { name = "chat"; html = chatView(); }

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

    const go = document.getElementById("refl-go");
    if (go) go.addEventListener("click", async () => {
      const sym = document.getElementById("refl-sym").value;
      const text = document.getElementById("refl-text").value.trim();
      if (!text) return;
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
      route();
    });
    const share = document.getElementById("share-field");
    if (share) share.addEventListener("click", shareField);

    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------- boot
  fetch("/api/field")
    .then((r) => r.json())
    .then((f) => { FIELD = f; ticker(); route(); })
    .catch(() => { view.innerHTML = `<h1 class="page">The field is unreachable</h1><p class="lede">Refresh to retry.</p>`; });

  window.addEventListener("hashchange", route);
})();
