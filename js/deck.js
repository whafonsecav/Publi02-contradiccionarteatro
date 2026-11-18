/* Motor de la presentación: escala el escenario, navega por láminas y pasos, y dispara las animaciones.
   → / espacio / clic: siguiente · ←: anterior · F: pantalla completa · M: índice · Inicio / Fin. */
(function () {
  const E = document.getElementById("escena");
  const telon = document.getElementById("telon");
  const lams = [...document.querySelectorAll(".lam")];
  const q = new URLSearchParams(location.search);
  const dos = (n) => String(n).padStart(2, "0");
  const maxPaso = (l) => Math.max(0, ...[...l.querySelectorAll("[data-p]")].map((e) => +e.dataset.p));
  let i = 0, paso = 0, ocupado = false;
  if (q.has("quieto")) document.body.classList.add("quieto");   // sin transiciones, para capturas

  /* ---- piezas que se arman con el sistema gráfico ---- */
  document.querySelectorAll("[data-kv]").forEach((d) => {
    const el = KV.collage(PIEZAS[d.dataset.kv]);
    el.style.transform = `scale(${+d.dataset.s || 1})`; el.style.transformOrigin = "top left";
    d.appendChild(el);
  });
  document.querySelectorAll("[data-lineas]").forEach((d) => { d.innerHTML = PIEZAS[d.dataset.lineas].lineas.map((l) => KV.linea(l)).join(""); });
  document.querySelectorAll("[data-pilares]").forEach((d) => { d.innerHTML = KV.pilares(); });
  document.querySelectorAll("[data-logo]").forEach((d) => { d.innerHTML = KV.logo(+d.dataset.logo); });
  KV.filtros();

  /* ---- escala (y giro si el celular está vertical) ---- */
  function escalar() {
    const w = innerWidth, h = innerHeight, vertical = h > w * 1.15 && w < 900;
    const s = Math.min((vertical ? h : w) / 1920, (vertical ? w : h) / 1080);
    E.style.transform = (vertical ? "rotate(90deg) " : "") + `scale(${s})`;
    document.body.classList.toggle("vertical", vertical);
  }
  addEventListener("resize", escalar); escalar();

  /* ---- barra, progreso e índice ---- */
  const prog = document.getElementById("progreso"), lista = document.getElementById("indice-lista"), indice = document.getElementById("indice");
  lams.forEach((l, k) => {
    const b = document.createElement("i"); b.title = l.dataset.titulo; b.onclick = (e) => { e.stopPropagation(); ir(k); }; prog.appendChild(b);
    const li = document.createElement("li"); li.textContent = l.dataset.titulo; li.onclick = () => { indice.hidden = true; ir(k); }; lista.appendChild(li);
  });
  function pintar() {
    const l = lams[i];
    l.dataset.paso = paso;
    l.querySelectorAll("[data-p]").forEach((e) => e.classList.toggle("on", +e.dataset.p <= paso));
    [...prog.children].forEach((b, k) => { b.classList.toggle("vista", k < i); b.classList.toggle("actual", k === i); });
    [...lista.children].forEach((li, k) => li.classList.toggle("actual", k === i));
    document.getElementById("contador").textContent = `${dos(i + 1)} / ${dos(lams.length)}`;
    document.body.classList.toggle("oscuro", l.classList.contains("oscura"));
    history.replaceState(null, "", location.pathname + location.search + "#" + (i + 1));
  }

  /* ---- números que cuentan ---- */
  function contar(l) {
    l.querySelectorAll("[data-cuenta]").forEach((n) => {
      const fin = +n.dataset.cuenta, t0 = performance.now(), dur = 1300;
      if (document.body.classList.contains("quieto")) { n.textContent = fin.toLocaleString("es-CO"); return; }
      (function paso(t) {
        const p = Math.min(1, (t - t0) / dur), v = Math.round(fin * (1 - Math.pow(1 - p, 3)));
        n.textContent = v.toLocaleString("es-CO");
        if (p < 1) requestAnimationFrame(paso);
      })(t0);
    });
  }

  function mostrar(n, alFinal) {
    lams.forEach((l, k) => {
      l.classList.toggle("activa", k === n);
      if (k !== n) { l.classList.remove("viva"); l.querySelectorAll("video").forEach((v) => v.pause()); }
    });
    i = n; paso = alFinal ? maxPaso(lams[n]) : 0;
    pintar();
    requestAnimationFrame(() => requestAnimationFrame(() => { lams[n].classList.add("viva"); contar(lams[n]); }));
  }
  function ir(n, alFinal) {
    if (ocupado || n < 0 || n >= lams.length || n === i) return;
    if (document.body.classList.contains("quieto")) return mostrar(n, alFinal);
    ocupado = true; telon.className = "sube";
    setTimeout(() => {
      mostrar(n, alFinal); telon.className = "sale";
      setTimeout(() => { telon.className = ""; ocupado = false; }, 640);
    }, 600);
  }
  const sig = () => { if (paso < maxPaso(lams[i])) { paso++; pintar(); } else ir(i + 1); };
  const ant = () => { if (paso > 0) { paso--; pintar(); } else ir(i - 1, true); };

  /* ---- controles ---- */
  document.getElementById("btn-next").onclick = (e) => { e.stopPropagation(); sig(); };
  document.getElementById("btn-prev").onclick = (e) => { e.stopPropagation(); ant(); };
  document.getElementById("btn-indice").onclick = (e) => { e.stopPropagation(); indice.hidden = !indice.hidden; };
  document.getElementById("btn-full").onclick = (e) => { e.stopPropagation(); pantalla(); };
  indice.onclick = (e) => { if (e.target === indice) indice.hidden = true; };
  function pantalla() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); }
  addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === "Escape") { indice.hidden = true; return; }
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); sig(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); ant(); }
    else if (k === "Home") ir(0); else if (k === "End") ir(lams.length - 1);
    else if (k === "f" || k === "F") pantalla();
    else if (k === "m" || k === "M") indice.hidden = !indice.hidden;
  });
  document.getElementById("marco").addEventListener("click", (e) => { if (!e.target.closest("button, video, a, .tel.grande")) sig(); });
  let tx = 0, ty = 0;
  addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    const v = document.body.classList.contains("vertical"), d = v ? dy : dx, o = v ? dx : dy;
    if (Math.abs(d) > 50 && Math.abs(d) > Math.abs(o) * 1.4) { d < 0 ? sig() : ant(); e.preventDefault(); }
  });

  /* ---- video de la campaña ---- */
  const video = document.getElementById("video-campana"), play = document.getElementById("btn-play");
  if (video) {
    play.onclick = (e) => { e.stopPropagation(); video.play(); };
    video.onclick = (e) => { e.stopPropagation(); video.paused ? video.play() : video.pause(); };
    video.onplay = () => play.classList.add("oculto");
    video.onpause = video.onended = () => play.classList.remove("oculto");
  }

  /* ---- arranque ---- */
  const inicio = Math.min(lams.length, Math.max(1, parseInt(location.hash.slice(1)) || 1)) - 1;
  const listo = () => { KV.ajustar(E); mostrar(inicio, q.has("fin")); if (q.has("paso")) { paso = Math.min(+q.get("paso"), maxPaso(lams[i])); pintar(); } };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(listo);
  const pista = document.getElementById("pista");
  setTimeout(() => pista.classList.add("ver"), 3800); setTimeout(() => pista.classList.remove("ver"), 10000);
  window.DECK = { ir, sig, ant, total: lams.length };
})();
