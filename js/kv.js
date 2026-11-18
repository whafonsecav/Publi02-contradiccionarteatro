/* Constructor del Key Visual «Contra el dicho» y de sus piezas (logo, títulos ajustados, tachón). */
(function (g) {
  const IMG = (g.KV_BASE || "") + "assets/img/";
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  /* Logo de Contradicción Arteatro redibujado en vectores (cuadro con las dos flechas encontradas). */
  function logo(tam) {
    return `<span class="logo-ca" style="font-size:${tam}px">
      <svg viewBox="0 0 100 100" aria-label="Contradicción Arteatro"><g fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="square">
      <rect x="3" y="3" width="94" height="94"/><path d="M17 44H84M84 44L67 31"/><path d="M97 56H17M17 56L34 69"/></g></svg>
      <span class="n">CONTRA<br>DICCIÓN</span><span class="a">ARTEATRO</span></span>`;
  }

  /* Filtro de borde rugoso para la brocha (una sola vez por documento). */
  function filtros() {
    if (document.getElementById("kv-filtros")) return;
    document.body.appendChild(h(`<svg id="kv-filtros" width="0" height="0" style="position:absolute"><defs>
      <filter id="rugoso" x="-10%" y="-40%" width="120%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".035 .5" numOctaves="2" seed="7" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="9"/></filter></defs></svg>`));
  }
  const brocha = () => `<svg class="brocha" viewBox="0 0 100 100" preserveAspectRatio="none" filter="url(#rugoso)">
      <path class="b1" pathLength="100" vector-effect="non-scaling-stroke" d="M1 60 C 22 44, 44 66, 66 47 S 92 52, 99 40"/>
      <path class="b2" pathLength="100" vector-effect="non-scaling-stroke" d="M4 44 C 30 58, 60 38, 97 58" style="stroke-width:.07em;opacity:.85"/></svg>`;

  /* Una línea de título: segmentos {t, color, tach, mano}. */
  function linea(segs, attrs) {
    return `<div class="linea" ${attrs || ""}>` + segs.map((s) => {
      if (s.mano) return `<span class="mano seg-mano" style="color:${s.color || "var(--color)"};${s.estilo || ""}">${s.t}</span>`;
      const tit = `<span class="titulo" style="${s.color ? "color:" + s.color : ""}">${s.t}</span>`;
      return `<span class="tw${s.tach ? " tachado" : ""}">${tit}${s.tach ? brocha() : ""}</span>`;
    }).join("") + `</div>`;
  }

  /* Ajusta cada línea para que llene el ancho de su columna (como los títulos de sus afiches)
     y compacta los títulos sueltos, que por el estrechado dejan aire a los lados. */
  function ajustar(raiz, K) {
    K = K || .58;
    raiz.querySelectorAll(".pilares .titulo, .titulo.centro").forEach((t) => { t.style.marginInline = "0"; t.style.marginInline = -(t.offsetWidth * (1 - K) / 2) + "px"; });
    raiz.querySelectorAll(".titulo.b").forEach((t) => { t.style.marginRight = "0"; t.style.marginRight = -(t.offsetWidth * (1 - K)) + "px"; });
    raiz.querySelectorAll(".linea").forEach((ln) => {
      const ancho = ln.parentElement.clientWidth * (+ln.dataset.ancho || 1);
      if (!ancho) return;
      const medir = () => {
        let total = 0;
        ln.querySelectorAll(":scope > .tw").forEach((tw) => { const w = tw.firstElementChild.offsetWidth * K; tw.style.width = w + "px"; total += w; });
        ln.querySelectorAll(":scope > .seg-mano").forEach((m) => { total += m.offsetWidth; });
        const gap = parseFloat(getComputedStyle(ln).columnGap) || 0;
        return total + gap * (ln.children.length - 1);
      };
      ln.style.fontSize = "100px";
      const t = medir();
      const max = +ln.dataset.max || 400;
      ln.style.fontSize = Math.min(max, 100 * ancho / t) + "px";
      medir();
    });
  }

  const pilares = (cls) => `<div class="pilares ${cls || ""}"><span class="titulo">AM<span class="c-rojo">O</span>R</span><i></i>
    <span class="titulo">C<span style="color:var(--azul-claro)">O</span>RDURA</span><i></i><span class="titulo">REBELI<span class="c-amarillo">Ó</span>N</span></div>`;

  /* El collage: arco, barras, manuscritos, retrato en blanco y negro, lirio y la tira sobre la boca. */
  function collageHTML(c) {
    const b = Object.assign({ x: 300, y: 520, rot: -4, tam: 30 }, c.boca);
    const f = Object.assign({ x: -20, y: 40, w: 300, rot: -18 }, c.florPos);
    return `<div class="collage">
        <div class="barra k-b1" style="left:96px;top:0;width:54px;height:330px"></div>
        <div class="barra k-b2" style="left:20px;top:210px;width:76px;height:500px"></div>
        <div class="manus k-manus1" style="left:56px;top:8px;width:230px;height:300px;background-image:url(${IMG}papel-carta.webp);clip-path:polygon(0 4%,96% 0,100% 88%,62% 100%,8% 93%)"></div>
        <div class="arco k-arco"></div>
        <div class="barra k-b3" style="left:520px;top:560px;width:46px;height:340px"></div>
        <div class="manus k-manus2" style="left:408px;top:610px;width:200px;height:250px;background-image:url(${IMG}papel-carta.webp);background-position:right bottom;clip-path:polygon(4% 0,100% 6%,94% 100%,0 92%)"></div>
        <svg class="orbitas k-orbitas" viewBox="0 0 640 900"><ellipse pathLength="100" cx="170" cy="250" rx="190" ry="78" transform="rotate(-24 170 250)"/><ellipse pathLength="100" cx="430" cy="640" rx="230" ry="70" transform="rotate(28 430 640)" style="stroke:var(--tinta);stroke-width:1.6"/><path pathLength="100" d="M400 60 L610 4" style="fill:none;stroke:var(--color);stroke-width:2.5"/></svg>
        <img class="retrato k-retrato" src="${IMG}${c.retrato}" alt="" style="${c.retratoEstilo || ""}">
        <img class="flor k-flor" src="${IMG}${c.flor}" alt="" style="left:${f.x}px;top:${f.y}px;width:${f.w}px;--rot:${f.rot}deg">
      </div>
      ${c.tira ? `<div class="tira k-tira" style="left:${b.x}px;top:${b.y}px;font-size:${b.tam}px;--rot:${b.rot}deg">${c.tira}</div>` : ""}`;
  }
  function collage(c) { filtros(); return h(`<div class="kv solo ${c.pilar}">${collageHTML(c)}</div>`); }

  /* KV 4:5. c = {pilar, retrato, flor, tira, lineas, boca:{x,y,rot,tam}, rotulo, florPos} */
  function kv(c) {
    filtros();
    return h(`<div class="kv papel ${c.pilar}">
      <div class="cab"><div class="l1">CONTRADICCIÓN PRESENTA:</div><div class="l2">RELATOS INTENSOS PARA MENTES TRAVIESAS</div></div>
      <div class="zona-collage">${collageHTML(c)}</div>
      <div class="der">
        <div class="rotulo k-rotulo">${c.rotulo || "MONÓLOGOS"}</div>
        <div class="bloque-titulo">${c.lineas.map((l) => linea(l)).join("")}</div>
        <div class="dato-autor k-dato">${c.dato || "10 monólogos<br>5 distintos cada noche"}</div>
        <div class="fecha k-fecha">${c.fecha || "FEB 2027 <span style='font-weight:400'>|</span> <b>8:00 P. M.</b>"}</div>
        <div class="lugar k-fecha">TEATRO COFAL</div><div class="dir k-fecha">Cra. 24 #39B-07 · Bogotá</div>
      </div>
      <div class="pie k-pie">${pilares()}<div class="cierre">${logo(92)}<div class="eslogan">Alguien <u>tenía</u> que decirlo.</div></div></div>
    </div>`);
  }

  g.KV = { kv, collage, logo, linea, ajustar, pilares, brocha, filtros, h };
})(window);
