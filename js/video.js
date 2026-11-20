/* Video «La llamada» (20 s, 9:16) en un celular + storyline (formato de la clase: VIDEO | AUDIO).
   Al llegar: a los 3 s arranca solo y en silencio; al final de cada una de las 7 escenas se detiene ≈4 s para leer su tarjeta.
   Después de la escena 7 vuelve a empezar CON sonido y de corrido, en bucle. Play/pausa a mano nunca activa el sonido:
   el sonido solo con su botón o la tecla V. → / ← saltan de escena. Mientras el video suena, la música de fondo se apaga. */
(function () {
  "use strict";
  const lam = document.getElementById("video"), vid = document.getElementById("vid");
  if (!lam || !vid) return;
  const ESPERA = 3000, LECTURA = 4000;
  const AST = '<span class="ast">*</span>';
  const ESC = [
    { t0: 0, t1: 2.5, tit: "8:12 p. m. · La cocina",
      tec: [["Plano", "medio"], ["Ángulo", "tres cuartos, a la altura del pecho"], ["Cámara", "fija, con acercamiento lento"], ["Lente", "35 mm"]],
      accion: "Natalia lava un plato con el celular entre la oreja y el hombro.",
      audio: [["Voz", "Andrés por teléfono (filtro de llamada): «Nata, ¿tienes un minutico?»"], ["Ambiente y efectos", "agua del grifo, platos"], ["Música", "—"]],
      texto: "—", graf: "Reloj digital rojo «8:12 PM» arriba a la izquierda; imagen casi en blanco y negro." },
    { t0: 2.5, t1: 5.0, tit: "9:40 p. m. · La sala de Andrés",
      tec: [["Plano", "medio corto"], ["Ángulo", "tres cuartos, en picado suave (lo hace ver pequeño)"], ["Cámara", "en mano"], ["Lente", "50 mm, fondo desenfocado"]],
      accion: "Andrés tirado en el sofá, celular en la oreja, mano levantada, ojos aguados.",
      audio: [["Voz", "Andrés, directo: «Es que yo sin ti no puedo, ¿sí me entiendes?»"], ["Ambiente y efectos", "lluvia en la ventana, nevera"], ["Música", "—"]],
      texto: "—", graf: "Reloj «9:40 PM»; lo único a color es su buzo mostaza." },
    { t0: 5.0, t1: 10.3, tit: "10:59 p. m. · La cama",
      tec: [["Plano", "de medio a medio corto"], ["Ángulo", "cenital, desde el techo"], ["Cámara", "se acerca despacio"], ["Lente", "35 mm"]],
      accion: "Natalia boca arriba; su celular en altavoz sobre la almohada: «Andrés · 2:47:15».",
      audio: [["Diálogo", `Andrés (altavoz): «¿Te acuerdas del mirador? Vuelve, yo cambio…» · Natalia: «¡M${AST}rica, ya! Que mañana madrugo.» · Andrés: «No, pero escúchame…»`], ["Ambiente y efectos", "tic-tac, un perro a lo lejos"]],
      texto: "—", graf: "Reloj «10:59 PM»; el contador 2:47:15 cuadra con las horas." },
    { t0: 10.3, t1: 12.6, tit: "El cierre: el arco",
      tec: [["Plano", "cenital que se aleja muy despacio"], ["Encuadre", "se encoge en un arco, arriba al centro"]],
      accion: "Natalia agarra la otra almohada y se la pone encima de la cara.",
      audio: [["Música", "entra en 10,3 s: piano y contrabajo, tipo vodevil"], ["Narrador, voz grave", "«¿Te aguantaste el monólogo de tu ex intenso?»"], ["Andrés", "ya no se oye"]],
      texto: "Palabra por palabra: «SI TE AGUANTASTE EL MONÓLOGO DE TU EX INTENSO,»", graf: "Arco sobre papel crema; recortes: lirio amarillo, papel rasgado con letra a mano, bloque azul." },
    { t0: 12.6, t1: 15.4, tit: "Te mereces uno",
      tec: [["Plano", "la misma toma cenital, dentro del arco"]],
      accion: "Dentro del arco, Natalia sigue bajo la almohada.",
      audio: [["Narrador", "«Entonces te mereces uno que sí valga la pena.»"], ["Música", "sigue"]],
      texto: "«TE MERECES UNO QUE SÍ VALGA LA PENA.»", graf: "Flecha roja dibujada a mano, hacia abajo." },
    { t0: 15.4, t1: 17.7, tit: "El producto",
      tec: [["Plano", "el puente se compacta hacia arriba"]],
      accion: "Dentro del arco, Natalia empieza a quitarse la almohada.",
      audio: [["Narrador", "«Relatos Intensos para Mentes Traviesas.»"], ["Música", "sigue"]],
      texto: "«CONTRADICCIÓN PRESENTA:» y «RELATOS INTENSOS PARA MENTES TRAVIESAS»", graf: "Dos líneas finas que se trazan desde los lados." },
    { t0: 17.7, t1: 20.0, tit: "Eslogan y llamado",
      tec: [["Plano", "la toma sigue dentro del arco"]],
      accion: "Natalia, ya sin la almohada, se acomoda rendida para dormir.",
      audio: [["Narrador", "«Monólogos para reír… mientras puedas.»"], ["Música y efecto", "cierra con un golpe"]],
      texto: "«MONÓLOGOS PARA REÍR… MIENTRAS PUEDAS.» · en 19,3 s: «SEPARA TU PUESTO EN TICKEAN» + logo", graf: "Franja negra que entra de izquierda a derecha; «mientras puedas» en amarillo." },
  ];
  const seg = (t) => t.toFixed(1).replace(".", ",");

  /* ---------- tira de fotogramas ---------- */
  const tira = document.getElementById("v-tira");
  tira.innerHTML = ESC.map((e, n) => `<button type="button" class="vl-esc" data-n="${n}" aria-label="Escena ${n + 1}">
      <img src="assets/video/escenas/escena-${n + 1}.jpg" alt=""><i></i><span><b>${n + 1}</b> · ${seg(e.t0)} s</span></button>`).join("");
  const botones = [...tira.querySelectorAll(".vl-esc")];
  botones.forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); irEscena(+b.dataset.n); }));

  /* ---------- tarjeta de cada escena: VIDEO | AUDIO + texto en pantalla y gráficos ---------- */
  const caja = document.getElementById("v-escenas");
  caja.innerHTML = ESC.map((e, n) => `<article class="ve" data-n="${n}">
      <header class="ve-cab"><b>${n + 1}</b><h3>${e.tit}</h3><span>${seg(e.t0)}–${seg(e.t1)} s</span></header>
      <div class="ve-cols">
        <section class="ve-col"><span class="et">Video</span><div class="ve-tec">${e.tec.map(([k, v]) => `<span><b>${k}:</b> ${v}</span>`).join("")}</div><p>${e.accion}</p></section>
        <section class="ve-col"><span class="et">Audio</span><ul>${e.audio.map(([k, v]) => `<li><b>${k}:</b> ${v}</li>`).join("")}</ul></section>
      </div>
      <div class="ve-tags"><div><span class="et">Texto en pantalla</span>${e.texto}</div><div><span class="et">Gráficos</span>${e.graf}</div></div></article>`).join("");
  const tarjetas = [...caja.querySelectorAll(".ve")];

  /* ---------- estado ---------- */
  let fase = "fuera", actual = -1, activo = false, raf = 0, bloqueo = 0, sonido = false, modo = "espera", leyendo = false, tArranque = 0, tLectura = 0, objetivo = 0;
  const btnSon = document.getElementById("v-sonido"), btnPlay = document.getElementById("v-play"), aviso = document.getElementById("v-aviso"), avisoTxt = aviso.querySelector("span"), avisoBarra = aviso.querySelector("i");
  function poner(n) {
    if (n === actual) return;
    actual = n;
    tarjetas.forEach((t, k) => { t.classList.toggle("actual", k === n); t.classList.toggle("antes", k < n); });
    botones.forEach((b, k) => { b.classList.toggle("actual", k === n); b.classList.toggle("vista", k < n); });
    pintarAviso();
  }
  function pintarAviso() {
    let t = "";
    if (fase === "espera") t = "Arranca en 3 s, con sonido";
    else if (fase === "intro") t = "El video completo, con sonido";
    else if (leyendo) t = actual === ESC.length - 1 ? "Fin del video · → para seguir" : `Fin de la escena ${actual + 1} · play o → para seguir`;
    else if (modo === "corrido") t = sonido ? "De corrido, con sonido" : "De corrido, sin sonido";
    else t = `Escena ${actual + 1} · ${sonido ? "con sonido" : "sin sonido"}`;
    avisoTxt.textContent = t;
  }
  const escenaEn = (t) => { for (let k = ESC.length - 1; k >= 0; k--) if (t >= ESC[k].t0 - 0.01) return k; return 0; };
  function barraLectura(on) {
    avisoBarra.style.transition = "none"; avisoBarra.style.setProperty("--lect", 0); void avisoBarra.offsetWidth;
    if (on) { avisoBarra.style.transition = `width ${LECTURA}ms linear`; avisoBarra.style.setProperty("--lect", 1); }
  }
  function limpiarLectura() { clearTimeout(tLectura); leyendo = false; barraLectura(false); }
  function reproducir() { const pr = vid.play(); if (pr && pr.catch) pr.catch(() => {}); }
  function pausaLectura(k) {   // al final de cada escena se queda quieto hasta play, clic o →
    if (leyendo) return;
    leyendo = true; vid.pause();
    if (k < ESC.length - 1 && (vid.currentTime || 0) > ESC[k].t1 - 0.02) { try { vid.currentTime = ESC[k].t1 - 0.05; } catch (e) { /* nada */ } }
    bloqueo = performance.now() + 400; poner(k); pintarAviso();
  }
  function ponerFase(f) { fase = f; lam.classList.toggle("v-espera", f === "espera"); lam.classList.toggle("v-intro", f === "espera" || f === "intro"); pintarAviso(); }
  function empezarIntro() {   // el video completo, centrado y con sonido
    clearTimeout(tArranque); ponerFase("intro"); modo = "intro"; sonido = true; vid.loop = false; limpiarLectura();
    try { vid.currentTime = 0; } catch (e) { /* nada */ }
    pintarSonido(); reproducir();
  }
  function aGuiado(demora) {   // el celular se va a la izquierda y aparece el storyline; arranca la escena 1
    clearTimeout(tArranque); vid.pause(); ponerFase("guiado"); modo = "guiado"; poner(0);
    tArranque = setTimeout(() => { if (activo && fase === "guiado") irEscena(0); }, demora);
  }
  function corrido() {   // después de la escena 7: desde el inicio, con sonido y en bucle
    modo = "corrido"; sonido = true; vid.loop = true; bloqueo = performance.now() + 600;
    try { vid.currentTime = 0; } catch (e) { /* sin metadatos */ }
    poner(0); pintarSonido(); reproducir();
  }
  function irEscena(n) {
    n = Math.max(0, Math.min(ESC.length - 1, n));
    limpiarLectura(); clearTimeout(tArranque);
    if (modo === "espera") modo = "guiado";
    objetivo = n; bloqueo = performance.now() + 600;
    try { vid.currentTime = ESC[n].t0 + 0.04; } catch (e) { /* sin metadatos */ }
    poner(n); reproducir(); pintarAviso();
  }
  function dibujar() {
    const t = Math.min(20, vid.currentTime || 0);
    if (performance.now() > bloqueo) poner(escenaEn(t));
    const e = ESC[actual];
    if (!e) return;
    const p = Math.max(0, Math.min(1, (t - e.t0) / (e.t1 - e.t0)));
    botones[actual].style.setProperty("--p", p);
    if (modo === "guiado" && !vid.paused && !leyendo && performance.now() > bloqueo && t >= ESC[objetivo].t1 - 0.06) pausaLectura(objetivo);
  }
  function bucle() { if (!activo) return; dibujar(); raf = requestAnimationFrame(bucle); }
  setInterval(() => { if (activo && !vid.paused) dibujar(); }, 40);
  function pintarSonido() {
    vid.muted = !sonido;
    btnSon.classList.toggle("on", sonido);
    btnSon.querySelector("use").setAttribute("href", sonido ? "#i-sonido" : "#i-mudo");
    DECK.musica.bajar(activo);
    pintarAviso();
  }
  function alternarSonido() { sonido = !sonido; pintarSonido(); }
  function alternarPlay() {   // nunca toca el sonido
    if (fase === "espera") { empezarIntro(); return; }
    if (leyendo) { if (objetivo < ESC.length - 1) { limpiarLectura(); objetivo++; bloqueo = performance.now() + 350; reproducir(); pintarAviso(); } return; }
    if (vid.paused) reproducir(); else vid.pause();
  }
  function pintarPlay() { btnPlay.querySelector("use").setAttribute("href", vid.paused ? "#i-play" : "#i-pausa"); DECK.musica.bajar(activo); }

  btnSon.addEventListener("click", (e) => { e.stopPropagation(); alternarSonido(); });
  btnPlay.addEventListener("click", (e) => { e.stopPropagation(); alternarPlay(); });
  document.getElementById("v-inicio").addEventListener("click", (e) => { e.stopPropagation(); vid.loop = false; modo = "guiado"; irEscena(0); });
  vid.addEventListener("click", (e) => { e.stopPropagation(); alternarPlay(); });
  vid.addEventListener("play", pintarPlay); vid.addEventListener("pause", pintarPlay);
  vid.addEventListener("timeupdate", () => { if (activo) dibujar(); });   // respaldo si rAF se detiene
  vid.addEventListener("ended", () => { if (!activo) return; if (fase === "intro") aGuiado(1300); else if (modo === "guiado") pausaLectura(ESC.length - 1); });
  addEventListener("keydown", (e) => { if (activo && (e.key === "v" || e.key === "V") && !e.ctrlKey && !e.metaKey && !e.altKey) alternarSonido(); });

  DECK.registrar("video", {
    entrar() {
      activo = true; sonido = true; vid.loop = false; actual = -1; objetivo = 0; modo = "espera";
      limpiarLectura(); clearTimeout(tArranque); vid.pause();
      try { vid.currentTime = 0; } catch (e) { /* sin metadatos */ }
      ponerFase("espera"); poner(0); pintarSonido(); pintarPlay();   // la música se apaga con fundido
      tArranque = setTimeout(() => { if (activo && fase === "espera") empezarIntro(); }, ESPERA);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
    },
    salir() {   // al salir: pausa y deja todo listo para empezar de cero
      activo = false; cancelAnimationFrame(raf); clearTimeout(tArranque); limpiarLectura(); vid.pause();
      try { vid.currentTime = 0; } catch (e) { /* nada */ }
      modo = "espera"; objetivo = 0; actual = -1; poner(0); ponerFase("fuera"); DECK.musica.bajar(false);
    },
    sig() {
      if (fase !== "guiado") { aGuiado(500); return true; }   // → durante el video completo salta al modo escena por escena
      if (actual < ESC.length - 1) { irEscena(leyendo ? actual + 1 : Math.max(actual + 1, objetivo)); return true; }
      return false;   // después de la escena 7, → pasa a Gracias
    },
    ant() { if (fase !== "guiado") return false; if (actual > 0) { irEscena(actual - 1); return true; } return false; },
  });
  poner(0);
})();
