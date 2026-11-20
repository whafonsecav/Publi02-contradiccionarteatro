/* Carrusel de los 3 KV (La llamada → La tusa → El audio).
   Avanza solo cada 8 s con un barrido; tiene sus propias flechas y puntos (con clic, sin cambiar de lámina).
   Según el paso de la lámina, ilumina zonas de la pieza (data-focos = {"paso": "zona zona"}) y
   sincroniza los textos que cambian por pieza ([data-kvi="0|1|2"] dentro de la misma lámina). */
(function () {
  "use strict";
  const W = 1086, H = 1448, CICLO = 5000;
  // Zonas de cada pieza, en píxeles de la imagen original (x, y, ancho, alto).
  const KVS = [
    {
      src: "assets/kv/kv-1-la-llamada.webp", nombre: "La llamada", alt: "KV 1, La llamada: Andrés al teléfono con Natalia, frente a Samantha Agudelo en función",
      r: { titular: [86, 76, 914, 222], arcoIzq: [92, 318, 448, 622], arcoDer: [544, 318, 452, 622], dialogo: [296, 512, 244, 378], temporada: [676, 840, 330, 96],
           puente: [96, 950, 880, 84], producto: [74, 1040, 938, 112], franja: [0, 1166, 1086, 128], cta: [496, 1296, 512, 108], logo: [890, 1296, 118, 108] },
      buzo: [235, 500, 150, 120],
      miradas: [[318, 418, 400, 560], [262, 856, 330, 768], [748, 452, 676, 560]],
    },
    {
      src: "assets/kv/kv-2-la-tusa.webp", nombre: "La tusa", alt: "KV 2, La tusa: Andrés en el bar con sus amigos, frente a Nicolás Revi en función",
      r: { titular: [86, 76, 914, 222], arcoIzq: [92, 318, 448, 640], arcoDer: [544, 318, 452, 640], dialogo: [226, 540, 310, 362], temporada: [680, 852, 330, 96],
           puente: [96, 962, 880, 84], producto: [74, 1040, 938, 112], franja: [0, 1166, 1086, 128], cta: [496, 1296, 512, 108], logo: [890, 1296, 118, 108] },
      buzo: [225, 595, 140, 120],
      miradas: [[262, 470, 370, 560], [170, 852, 250, 790], [466, 858, 430, 790], [744, 410, 700, 560]],
    },
    {
      src: "assets/kv/kv-3-el-audio.webp", nombre: "El audio", alt: "KV 3, El audio: Andrés grabando un audio a su jefe, frente a Mayra Alejandra Frade en función",
      r: { titular: [86, 76, 914, 222], arcoIzq: [92, 326, 448, 662], arcoDer: [544, 326, 452, 662], dialogo: [180, 552, 356, 396], temporada: [676, 860, 330, 96],
           puente: [76, 996, 900, 82], producto: [74, 1080, 938, 100], franja: [0, 1182, 1086, 128], cta: [496, 1314, 512, 104], logo: [890, 1314, 118, 104] },
      buzo: [250, 505, 150, 110],
      miradas: [[330, 420, 392, 470], [226, 856, 300, 792], [762, 446, 690, 560]],
    },
  ];
  const ZONAS = ["titular", "arcoIzq", "arcoDer", "dialogo", "temporada", "puente", "producto", "franja", "cta", "logo"];
  const ETIQ = { titular: "Titular", arcoIzq: "El intenso que fastidia", arcoDer: "Lo intenso que engancha", dialogo: "Diálogo", temporada: "Nueva temporada", puente: "Puente (cuerpo)", producto: "Producto", franja: "Eslogan", cta: "Llamado a la acción", logo: "Logo" };
  const TEXTO = ["titular", "dialogo", "puente", "producto", "franja", "cta"], IMAGEN = ["arcoIzq", "arcoDer"];
  let uid = 0;

  function focos(k) {
    const id = "m" + ++uid, z = k.r;
    const rect = (n, cls, extra) => { const [x, y, w, h] = z[n]; return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ${extra || ""}/>`; };
    const huecos = ZONAS.map((n) => rect(n, "h h-" + n, 'fill="#000"')).join("") + `<ellipse class="h h-buzo" cx="${k.buzo[0]}" cy="${k.buzo[1]}" rx="${k.buzo[2]}" ry="${k.buzo[3]}" fill="#000"/>`;
    const bordes = ZONAS.map((n) => rect(n, "b b-" + n)).join("");
    const etiquetas = ZONAS.map((n) => {
      const [x, y, w, h] = z[n], abajo = n === "logo" || y < 120, ty = abajo ? y + h + 34 : y - 12, tx = n === "logo" ? x + w - 4 : Math.min(Math.max(x + 6, 16), W - 330);
      return `<g class="e e-${n}"><text x="${tx}" y="${ty}"${n === "logo" ? ' text-anchor="end"' : ""}>${ETIQ[n].toUpperCase()}</text></g>`;
    }).join("");
    const [r1, r2] = [k.r.titular, k.r.cta];
    const zeta = `<g class="zeta"><path class="dib-z" pathLength="1" d="M140 ${r1[1] + 110} H950 L150 ${r2[1] + 54} H${r2[0] + r2[2] - 100}"/>` +
      [[200, r1[1] + 110], [545, 640], [545, k.r.puente[1] + 40], [545, k.r.producto[1] + 55], [545, k.r.franja[1] + 64], [r2[0] + r2[2] - 60, r2[1] + 54]]
        .map(([x, y], n) => `<g class="zn" style="--n:${n}"><circle cx="${x}" cy="${y}" r="34"/><text x="${x}" y="${y + 13}">${n + 1}</text></g>`).join("") + "</g>";
    const miradas = `<g class="miradas">` + k.miradas.map(([x1, y1, x2, y2], n) => {
      const a = Math.atan2(y2 - y1, x2 - x1), s = 22, p1 = [x2 - s * Math.cos(a - .5), y2 - s * Math.sin(a - .5)], p2 = [x2 - s * Math.cos(a + .5), y2 - s * Math.sin(a + .5)];
      return `<g class="mi" style="--n:${n}"><circle cx="${x1}" cy="${y1}" r="16"/><path class="dib-z" pathLength="1" d="M${x1} ${y1}L${x2} ${y2}"/><path d="M${p1[0]} ${p1[1]}L${x2} ${y2}L${p2[0]} ${p2[1]}"/></g>`;
    }).join("") + "</g>";
    const buzo = `<ellipse class="buzo" cx="${k.buzo[0]}" cy="${k.buzo[1]}" rx="${k.buzo[2]}" ry="${k.buzo[3]}"/>`;
    const pesos = `<g class="pesos">` + TEXTO.map((n) => rect(n, "pt")).join("") + IMAGEN.map((n) => rect(n, "pi")).join("") + "</g>";
    return `<svg class="focos" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${huecos}</mask></defs>
      <rect class="velo" width="${W}" height="${H}" mask="url(#${id})"/>${pesos}${bordes}${buzo}${zeta}${miradas}${etiquetas}</svg>`;
  }

  class Carrusel {
    constructor(el) {
      this.el = el; this.i = 0; this.t = 0; this.activo = false;
      this.lam = el.closest(".lam");
      this.mapa = el.dataset.focos ? JSON.parse(el.dataset.focos) : {};
      el.innerHTML = `<div class="cr-marco">${KVS.map((k, n) => `<figure class="cr-item${n ? "" : " actual"}"><img src="${k.src}" alt="${k.alt}" draggable="false" decoding="async">${focos(k)}</figure>`).join("")}<i class="cr-barrido"></i></div>
        <div class="cr-ctrl" data-sinclic><button type="button" class="cr-flecha cr-ant" aria-label="Pieza anterior"><svg class="ic"><use href="#i-izq"/></svg></button>
        <div class="cr-puntos">${KVS.map((k, n) => `<button type="button" aria-label="Pieza ${n + 1}: ${k.nombre}"><i></i></button>`).join("")}</div>
        <button type="button" class="cr-flecha cr-sig" aria-label="Pieza siguiente"><svg class="ic"><use href="#i-der"/></svg></button>
        <span class="cr-nombre"><b>1</b>La llamada</span></div>`;
      this.items = [...el.querySelectorAll(".cr-item")];
      this.puntos = [...el.querySelectorAll(".cr-puntos button")];
      this.barrido = el.querySelector(".cr-barrido");
      this.nombre = el.querySelector(".cr-nombre");
      el.querySelector(".cr-ant").addEventListener("click", (e) => { e.stopPropagation(); this.ir(this.i - 1, -1); });
      el.querySelector(".cr-sig").addEventListener("click", (e) => { e.stopPropagation(); this.ir(this.i + 1, 1); });
      this.puntos.forEach((b, n) => b.addEventListener("click", (e) => { e.stopPropagation(); this.ir(n, n >= this.i ? 1 : -1); }));
      this.sincronizar();
    }
    ir(n, dir) {
      n = (n + KVS.length) % KVS.length;
      if (n === this.i) { this.programar(); return; }
      const viejo = this.items[this.i], nuevo = this.items[n];
      this.items.forEach((it) => it.classList.remove("previa"));
      viejo.classList.remove("actual"); viejo.classList.add("previa");
      nuevo.classList.add("actual");
      this.i = n;
      if (!DECK.quieto && !DECK.reducido && nuevo.animate) {
        const desde = dir < 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
        nuevo.animate([{ clipPath: desde }, { clipPath: "inset(0 0 0 0)" }], { duration: 1150, easing: "cubic-bezier(.7,0,.2,1)" });
        nuevo.querySelector("img").animate([{ transform: "scale(1.07)" }, { transform: "scale(1)" }], { duration: 1600, easing: "cubic-bezier(.2,.7,.2,1)" });
        this.barrido.animate(dir < 0 ? [{ left: "0%", opacity: 1 }, { left: "100%", opacity: 1 }] : [{ left: "100%", opacity: 1 }, { left: "0%", opacity: 1 }],
          { duration: 1150, easing: "cubic-bezier(.7,0,.2,1)" });
      }
      clearTimeout(this._pv); this._pv = setTimeout(() => viejo.classList.remove("previa"), 1200);
      this.sincronizar();
      this.programar();
    }
    sincronizar() {
      this.puntos.forEach((b, n) => b.classList.toggle("actual", n === this.i));
      this.nombre.innerHTML = `<b>${this.i + 1}</b>${KVS[this.i].nombre}`;
      this.el.dataset.kv = this.i;
      if (this.lam) {
        this.lam.querySelectorAll("[data-kvi]").forEach((e) => e.classList.toggle("kv-on", +e.dataset.kvi === this.i));
        this.lam.dataset.kv = this.i;
      }
    }
    programar() {
      clearTimeout(this.t);
      this.puntos.forEach((b) => b.classList.remove("corre"));
      if (!this.activo) return;
      const b = this.puntos[this.i]; void b.offsetWidth; b.classList.add("corre");
      this.t = setTimeout(() => this.ir(this.i + 1, 1), CICLO);
    }
    reiniciar() { this.items.forEach((it, k) => { it.classList.toggle("actual", k === 0); it.classList.remove("previa"); }); this.i = 0; this.sincronizar(); }
    iniciar() { if (this.activo) return; this.activo = true; this.programar(); }
    parar() { this.activo = false; this.programar(); }
    foco(paso) {
      const z = this.mapa[paso] || "";
      this.el.dataset.foco = z;
      this.el.classList.toggle("con-foco", !!z && z.trim() !== "pesos");
    }
  }

  document.querySelectorAll("[data-carrusel]").forEach((el) => { el._cr = new Carrusel(el); });
  const de = (l) => [...l.querySelectorAll("[data-carrusel]")].map((el) => el._cr);
  DECK.en("entrar", (l) => de(l).forEach((c) => { c.parar(); c.reiniciar(); }));
  DECK.en("salir", (l) => de(l).forEach((c) => c.parar()));
  // quieto en la primera pieza mientras se explica; en el último paso de la lámina pasa solo cada 5 s
  DECK.en("pintar", (l, paso) => de(l).forEach((c) => { c.foco(paso); if (paso >= l._max) c.iniciar(); else c.parar(); }));
})();
