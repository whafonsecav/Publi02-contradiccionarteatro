/* Motor de la presentación · «Relatos de intensos vs. Relatos Intensos»
   Escenario fijo de 1920 × 1080 que se escala a cualquier pantalla. Cada lámina tiene pasos internos:
   los elementos con data-p="n" entran en el paso n (y salen después de data-hasta, si lo tienen).
   Teclas: → / espacio / clic = siguiente paso · ← = anterior · 1–6 = tapas · 0 / Inicio = portada · Fin = cierre
           I = índice · M = música · V = sonido del video · F = pantalla completa · Esc = cerrar índice.
   Parámetros de prueba: #n (lámina), ?paso=n, ?quieto (sin animaciones), ?fin (llegar al último paso). */
(function () {
  "use strict";
  const E = document.getElementById("escena");
  const lams = [...E.querySelectorAll(".lam")];
  const telon = document.getElementById("telon");
  const q = new URLSearchParams(location.search);
  const quieto = q.has("quieto");
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (quieto) document.body.classList.add("quieto");
  if (reducido) document.body.classList.add("reducido");
  const ctrl = {}, oyentes = { entrar: [], salir: [], pintar: [] };
  let i = -1, paso = 0, ocupado = false;

  const SECC = { 0: "Portada", 1: "Buyer persona", 2: "Insight", 3: "Idea o concepto", 4: "Plataforma copy", 5: "Key Visual", 6: "Video", fin: "Gracias" };
  const subs = (t) => lams.filter((l) => l.dataset.tapa === t && +l.dataset.sub > 0).length;
  const maxPaso = (l) => Math.max(+l.dataset.pasos || 0, 0, ...[...l.querySelectorAll("[data-p]")].map((e) => +e.dataset.p));
  lams.forEach((l) => { l._max = maxPaso(l); });

  /* ---------- rótulo de sección en cada lámina de contenido ---------- */
  lams.forEach((l) => {
    const r = l.querySelector(".enc .rot"); if (!r) return;
    const t = l.dataset.tapa, s = +l.dataset.sub;
    r.innerHTML = `<b>${t}</b><span>${SECC[t]}</span>${l.dataset.rot ? `<i>${l.dataset.rot}</i>` : s ? `<i>${t}.${s}</i>` : ""}`;
  });

  /* ---------- tipografía cinética: parte el texto de .kin en palabras con máscara ---------- */
  function partir(el) {
    let n = 0;
    const envolver = (txt) => txt.split(/(\s+)/).map((p) => (/^\s+$/.test(p) || !p ? p : `<span class="w"><span style="--i:${n++}">${p}</span></span>`)).join("");
    [...el.childNodes].forEach((nd) => {
      if (nd.nodeType === 3) { const t = document.createElement("template"); t.innerHTML = envolver(nd.textContent); nd.replaceWith(t.content); }
      else if (nd.nodeType === 1 && !nd.classList.contains("w")) {
        if (nd.matches("br")) return;
        if (nd.matches("b, em, mark, i, strong, span") && !nd.matches(".vs, .ast")) { nd.innerHTML = envolver(nd.textContent); }
        else { const w = document.createElement("span"); w.className = "w"; const s2 = document.createElement("span"); s2.style.setProperty("--i", n++); nd.replaceWith(w); s2.appendChild(nd); w.appendChild(s2); }
      }
    });
  }
  E.querySelectorAll(".kin").forEach(partir);
  /* pictogramas de 100 personas: los primeros n en rojo */
  E.querySelectorAll("[data-pictos]").forEach((d) => { const m = +d.dataset.pictos; d.innerHTML = Array.from({ length: 100 }, (_, k) => `<i class="${k < m ? "m" : ""}" style="--i:${k}"></i>`).join(""); });

  /* ---------- escala (y giro si el celular está vertical) ---------- */
  function escalar() {
    const w = innerWidth || document.documentElement.clientWidth, h = innerHeight || document.documentElement.clientHeight;
    if (!w || !h) { setTimeout(escalar, 250); return; }
    const vertical = h > w * 1.15 && w < 900;
    const s = Math.min((vertical ? h : w) / 1920, (vertical ? w : h) / 1080);
    E.style.transform = (vertical ? "rotate(90deg) " : "") + `scale(${s})`;
    document.body.classList.toggle("vertical", vertical);
  }
  addEventListener("resize", escalar); addEventListener("orientationchange", escalar);
  if (window.ResizeObserver) new ResizeObserver(escalar).observe(document.documentElement);
  escalar();

  /* ---------- recortes de las piezas (fondo «cover» sobre una región de la imagen) ---------- */
  const FUENTES = {
    kv1: ["assets/kv/kv-1-la-llamada.webp", 1086, 1448], kv2: ["assets/kv/kv-2-la-tusa.webp", 1086, 1448],
    kv3: ["assets/kv/kv-3-el-audio.webp", 1086, 1448], andres: ["assets/kv/andres-hoja.webp", 1536, 1024],
  };
  function recortar() {
    E.querySelectorAll("[data-recorte]").forEach((el) => {
      const [k, r] = el.dataset.recorte.split(":"), f = FUENTES[k]; if (!f) return;
      const [x, y, w, h] = r.split(",").map(Number), ew = el.offsetWidth, eh = el.offsetHeight;
      if (!ew || !eh) return;
      const s = Math.max(ew / w, eh / h), ox = x * s - (ew - w * s) / 2, oy = y * s - (eh - h * s) / 2;
      el.style.backgroundImage = `url("${f[0]}")`;
      el.style.backgroundSize = `${f[1] * s}px ${f[2] * s}px`;
      el.style.backgroundPosition = `${-ox}px ${-oy}px`;
    });
  }

  /* ---------- reloj digital de 7 segmentos ---------- */
  const sh = (x0, x1, y, t) => { const h = t / 2; return `${x0},${y} ${x0 + h},${y - h} ${x1 - h},${y - h} ${x1},${y} ${x1 - h},${y + h} ${x0 + h},${y + h}`; };
  const sv = (x, y0, y1, t) => { const h = t / 2; return `${x},${y0} ${x + h},${y0 + h} ${x + h},${y1 - h} ${x},${y1} ${x - h},${y1 - h} ${x - h},${y0 + h}`; };
  const T = 2.5;
  const SEG = { a: sh(2.3, 9.7, 1.6, T), b: sv(10.4, 2.3, 10.6, T), c: sv(10.4, 11.4, 19.7, T), d: sh(2.3, 9.7, 20.4, T), e: sv(1.6, 11.4, 19.7, T), f: sv(1.6, 2.3, 10.6, T), g: sh(2.3, 9.7, 11, T) };
  const DIG = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
  function reloj(txt, suf) {
    let x = 0, g = "";
    for (const ch of txt) {
      if (ch === ":") { g += `<rect class="on" x="${x + .8}" y="6" width="2.4" height="2.4"/><rect class="on" x="${x - .2}" y="13.6" width="2.4" height="2.4"/>`; x += 4.4; continue; }
      const on = DIG[ch] || "";
      g += `<g transform="translate(${x} 0) skewX(-6)">` + Object.keys(SEG).map((s) => `<polygon class="${on.includes(s) ? "on" : "off"}" points="${SEG[s]}"/>`).join("") + "</g>";
      x += 13.2;
    }
    return `<span class="reloj" role="img" aria-label="${txt}${suf ? " " + suf : ""}"><svg viewBox="-3 -.5 ${x + 2} 23">${g}</svg>${suf ? `<small>${suf}</small>` : ""}</span>`;
  }
  function relojes(raiz) { (raiz || E).querySelectorAll("[data-reloj]").forEach((el) => { const [t, s] = el.dataset.reloj.split("|"); el.innerHTML = reloj(t, s); el.removeAttribute("data-reloj"); }); }

  /* ---------- números que cuentan cuando aparecen ---------- */
  const fmt = (v, dec) => v.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  function contar(l) {
    const viva = l.classList.contains("viva");
    l.querySelectorAll("[data-cuenta]").forEach((n) => {
      const host = n.closest("[data-p]"), dec = +n.dataset.dec || 0, fin = +n.dataset.cuenta;
      const ver = viva && (!host || host.classList.contains("on"));
      if (!ver) { n._hecho = false; clearTimeout(n._raf); if (!quieto) n.textContent = fmt(0, dec); return; }
      if (n._hecho) return;
      n._hecho = true;
      if (quieto || reducido) { n.textContent = fmt(fin, dec); return; }
      const t0 = performance.now() + 250, dur = 1500;
      const tick = () => {   // temporizador en vez de rAF: siempre llega al valor final
        const p = Math.min(1, Math.max(0, (performance.now() - t0) / dur)), v = fin * (1 - Math.pow(1 - p, 3));
        n.textContent = fmt(dec ? v : Math.round(v), dec);
        if (p < 1) n._raf = setTimeout(tick, 16);
      };
      tick();
    });
  }

  /* ---------- cromo: sección, progreso por tapas y botones ---------- */
  const prog = document.getElementById("c-prog");
  const grupos = [];
  lams.forEach((l, k) => { const t = l.dataset.tapa; let g = grupos[grupos.length - 1]; if (!g || g.t !== t) grupos.push((g = { t, ks: [] })); g.ks.push(k); });
  grupos.forEach((g) => {
    const d = document.createElement("div"); d.className = "pg" + (g.t === "0" || g.t === "fin" ? " solo" : ""); d.title = SECC[g.t];
    if (!d.classList.contains("solo")) { const s = document.createElement("span"); s.textContent = g.t; d.appendChild(s); }
    g.ks.forEach((k) => { const b = document.createElement("i"); b.title = lams[k].dataset.titulo; b.onclick = (e) => { e.stopPropagation(); ir(k); }; d.appendChild(b); });
    prog.appendChild(d);
  });
  const ticks = [...prog.querySelectorAll("i")];
  function cromo() {
    const l = lams[i], t = l.dataset.tapa, s = +l.dataset.sub;
    ticks.forEach((b, k) => { b.classList.toggle("vista", k < i); b.classList.toggle("actual", k === i); });
    ticks[i].style.setProperty("--f", l._max ? paso / l._max : 1);
    [...prog.children].forEach((d, k) => d.classList.toggle("actual", grupos[k].ks.includes(i)));
    document.getElementById("c-num").textContent = t === "0" || t === "fin" ? "" : t;
    document.getElementById("c-nom").textContent = SECC[t];
    document.getElementById("c-sub").textContent = s ? `${s} / ${subs(t)}` : "";
    E.dataset.tono = l.dataset.tono || "claro";
  }

  /* ---------- pintar el paso actual ---------- */
  function pintar() {
    const l = lams[i];
    l.dataset.paso = paso;
    l.querySelectorAll("[data-p]").forEach((e) => {
      const p = +e.dataset.p, h = e.dataset.hasta != null ? +e.dataset.hasta : Infinity;
      e.classList.toggle("on", paso >= p && paso <= h);
      e.classList.toggle("ahora", paso === p);
      e.classList.toggle("pasado", paso > p && paso <= h);
      e.classList.toggle("fuera", paso > h);
    });
    l.querySelectorAll("[data-paso-cuenta]").forEach((e) => { e.textContent = Math.min(paso, +e.dataset.pasoCuenta); });
    contar(l);
    oyentes.pintar.forEach((f) => f(l, paso));
    const c = ctrl[l.id]; if (c && c.pintar) c.pintar(l, paso);
    cromo();
    try { history.replaceState(null, "", location.pathname + location.search + "#" + (i + 1)); } catch (e) { /* file:// en algunos navegadores */ }
  }

  function mostrar(n, alFinal) {
    const prev = lams[i], l = lams[n];
    if (prev && prev !== l) {
      prev.classList.remove("activa", "viva");
      prev.classList.add("saliendo");
      clearTimeout(prev._t); prev._t = setTimeout(() => prev.classList.remove("saliendo"), 650);
      oyentes.salir.forEach((f) => f(prev)); const c = ctrl[prev.id]; if (c && c.salir) c.salir(prev);
    }
    i = n; paso = alFinal ? l._max : 0;
    clearTimeout(l._t); l.classList.remove("saliendo"); l.classList.add("activa");
    pintar();
    oyentes.entrar.forEach((f) => f(l, alFinal)); const c = ctrl[l.id]; if (c && c.entrar) c.entrar(l, alFinal);
    const vivir = () => { if (lams[i] === l && !l.classList.contains("viva")) { void l.offsetWidth; l.classList.add("viva"); contar(l); } };
    requestAnimationFrame(() => requestAnimationFrame(vivir)); setTimeout(vivir, 90);
    ocultarPista();
  }
  const conTelon = (l) => l.classList.contains("tapa") || l.id === "portada" || l.id === "gracias";
  function ir(n, alFinal) {
    n = Math.max(0, Math.min(lams.length - 1, n));
    if (ocupado || n === i) return;
    cerrarIndice();
    if (quieto || reducido || !conTelon(lams[n])) return mostrar(n, alFinal);
    ocupado = true; telon.className = "sube";
    setTimeout(() => {
      mostrar(n, alFinal); telon.className = "sale";
      setTimeout(() => { telon.className = ""; ocupado = false; }, 720);
    }, 560);
  }
  function sig() {
    if (ocupado || i < 0) return;
    const l = lams[i], c = ctrl[l.id];
    if (c && c.sig && c.sig(l)) return;
    if (paso < l._max) { paso++; pintar(); } else ir(i + 1);
  }
  function ant() {
    if (ocupado || i < 0) return;
    const l = lams[i], c = ctrl[l.id];
    if (c && c.ant && c.ant(l)) return;
    if (paso > 0) { paso--; pintar(); } else ir(i - 1, true);
  }

  /* ---------- música de fondo: bucle sutil que arranca con la primera interacción ---------- */
  const MUSICA = (function () {
    const a = document.getElementById("musica"), btn = document.getElementById("b-musica"), VOL = 0.1;
    let pref = true, arrancada = false, bajada = false, sonando = false, raf = 0;
    try { pref = localStorage.getItem("ri-musica") !== "0"; } catch (e) { /* sin almacenamiento */ }
    function pintarBtn() {
      btn.classList.toggle("off", !pref);
      btn.classList.toggle("sonando", sonando && !bajada && pref);
      btn.title = pref ? "Silenciar la música (M)" : "Activar la música (M)";
    }
    function fundir(meta, alFin) {   // con temporizador (no rAF) para que termine aunque la pestaña esté en segundo plano
      clearTimeout(raf);
      const v0 = a.volume, t0 = performance.now(), dur = 900;
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / dur);
        try { a.volume = Math.max(0, Math.min(1, v0 + (meta - v0) * p)); } catch (e) { /* iOS */ }
        if (p < 1) raf = setTimeout(tick, 30); else if (alFin) alFin();
      };
      tick();
    }
    function aplicar() {
      if (pref && !bajada && arrancada) {
        const pr = a.play(); sonando = true;
        if (pr && pr.catch) pr.catch(() => { sonando = false; pintarBtn(); });
        fundir(VOL);
      } else if (!a.paused) {
        fundir(0, () => { if (!(pref && !bajada)) { a.pause(); sonando = false; pintarBtn(); } });
      }
      pintarBtn();
    }
    function primerGesto() { if (arrancada) return; arrancada = true; a.volume = 0; aplicar(); }
    function alternar() { pref = !pref; arrancada = true; try { localStorage.setItem("ri-musica", pref ? "1" : "0"); } catch (e) { /* nada */ } aplicar(); }
    function bajar(b) { if (bajada === b) return; bajada = b; aplicar(); }
    btn.addEventListener("click", (e) => { e.stopPropagation(); alternar(); });
    pintarBtn();
    return { alternar, bajar, primerGesto, get activa() { return pref; } };
  })();
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, (e) => {
    if (e.target && e.target.closest && e.target.closest("#b-musica")) return;
    if (ev === "keydown" && (e.key === "m" || e.key === "M")) return;
    MUSICA.primerGesto();
  }, { capture: true, passive: true }));

  /* ---------- índice de tapas ---------- */
  const indice = document.getElementById("indice"), indGrid = document.getElementById("ind-grid");
  grupos.forEach((g) => {
    const col = document.createElement("div"); col.className = "ind-col" + (g.t === "0" || g.t === "fin" ? " solo" : "");
    const cab = document.createElement("button"); cab.type = "button"; cab.className = "ind-tapa";
    cab.innerHTML = (g.t === "0" || g.t === "fin" ? "" : `<b>${g.t}</b>`) + `<span>${SECC[g.t]}</span>`;
    cab.onclick = (e) => { e.stopPropagation(); ir(g.ks[0]); };
    col.appendChild(cab);
    const ol = document.createElement("ol");
    g.ks.filter((k) => +lams[k].dataset.sub > 0).forEach((k) => {
      const li = document.createElement("li"); li.textContent = lams[k].dataset.titulo; li.dataset.k = k;
      li.onclick = (e) => { e.stopPropagation(); ir(k); }; ol.appendChild(li);
    });
    col.appendChild(ol); indGrid.appendChild(col);
  });
  function abrirIndice() { indice.hidden = false; indGrid.querySelectorAll("li").forEach((li) => li.classList.toggle("actual", +li.dataset.k === i)); }
  function cerrarIndice() { indice.hidden = true; }
  const alternarIndice = () => (indice.hidden ? abrirIndice() : cerrarIndice());
  indice.addEventListener("click", (e) => { e.stopPropagation(); if (e.target === indice) cerrarIndice(); });
  document.getElementById("b-cerrar").onclick = (e) => { e.stopPropagation(); cerrarIndice(); };

  /* ---------- controles ---------- */
  const boton = (id, f) => { document.getElementById(id).onclick = (e) => { e.stopPropagation(); f(); }; };
  boton("b-sig", sig); boton("b-ant", ant); boton("b-indice", alternarIndice); boton("b-full", pantalla);
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("button"); if (b) b.blur(); });
  function pantalla() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }
  addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === "Escape") { cerrarIndice(); return; }
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); if (!indice.hidden) cerrarIndice(); sig(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); if (!indice.hidden) cerrarIndice(); ant(); }
    else if (k === "Home" || k === "0") ir(0);
    else if (k === "End") ir(lams.length - 1);
    else if (/^[1-6]$/.test(k)) ir(lams.findIndex((l) => l.dataset.tapa === k));
    else if (k === "f" || k === "F") pantalla();
    else if (k === "i" || k === "I") alternarIndice();
    else if (k === "m" || k === "M") MUSICA.alternar();
  });
  E.addEventListener("click", (e) => {
    if (e.target.closest("button, a, video, #indice, #cromo, .cr-ctrl, .v-linea, .v-escenas, [data-sinclic]")) return;
    sig();
  });
  let tx = 0, ty = 0;
  addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    const v = document.body.classList.contains("vertical"), d = v ? dy : dx, o = v ? dx : dy;
    if (Math.abs(d) > 50 && Math.abs(d) > Math.abs(o) * 1.4) { d < 0 ? sig() : ant(); if (e.cancelable) e.preventDefault(); }
  });

  /* ---------- pista inicial ---------- */
  const pista = document.getElementById("pista");
  let pistaT = 0;
  function ocultarPista() { if (i > 0 || paso > 0) pista.classList.remove("ver"); }

  /* ---------- API para los componentes ---------- */
  window.DECK = {
    ir, sig, ant, reloj, relojes, recortar, quieto, reducido, lams,
    get i() { return i; }, get paso() { return paso; }, get actual() { return lams[i]; },
    registrar(id, c) { ctrl[id] = c; },
    en(ev, f) { oyentes[ev].push(f); },
    musica: MUSICA,
    iniciar() {
      relojes();
      const listo = () => {
        recortar();
        const inicio = Math.min(lams.length, Math.max(1, parseInt(location.hash.slice(1), 10) || 1)) - 1;
        mostrar(inicio, q.has("fin"));
        if (q.has("paso")) { paso = Math.min(+q.get("paso"), lams[i]._max); pintar(); }
        if (!quieto) { pistaT = setTimeout(() => { if (i === 0 && paso === 0) pista.classList.add("ver"); }, 2600); setTimeout(() => pista.classList.remove("ver"), 11000); }
      };
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(listo, listo);
    },
  };
})();
