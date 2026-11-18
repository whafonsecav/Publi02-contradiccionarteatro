/* Datos de las cuatro versiones del Key Visual: el maestro y una por pilar. */
window.PIEZAS = {
  maestro: {
    pilar: "amor", retrato: "retrato-maestro.webp", flor: "lirio-rojo.webp",
    tira: "De eso no se habla", boca: { x: 306, y: 520, rot: -4, tam: 34 },
    rotulo: "TEMPORADA 2027",
    lineas: [[{ t: "DE ESO" }], [{ t: "NO", tach: true }, { t: "SÍ", mano: true }], [{ t: "SE HABLA" }]],
  },
  amor: {
    pilar: "amor", retrato: "retrato-amor.webp", flor: "lirio-rojo-2.webp",
    tira: "La ropa sucia se lava en casa", boca: { x: 290, y: 404, rot: 3, tam: 25 },
    rotulo: "AMOR",
    lineas: [[{ t: "LA ROPA" }], [{ t: "SUCIA" }], [{ t: "SE LAVA EN" }], [{ t: "CASA", tach: true }, { t: "escena", mano: true }]],
  },
  cordura: {
    pilar: "cordura", retrato: "retrato-cordura.webp", flor: "lirio-azul.webp",
    tira: "Al mal tiempo, buena cara", boca: { x: 268, y: 530, rot: -3, tam: 27 },
    rotulo: "CORDURA",
    lineas: [[{ t: "AL MAL" }], [{ t: "TIEMPO," }], [{ t: "BUENA CARA", tach: true }], [{ t: "la cara que tengas", mano: true }]],
  },
  rebelion: {
    pilar: "rebelion", retrato: "retrato-rebelion.webp", flor: "lirio-amarillo.webp",
    tira: "Calladita te ves más bonita", boca: { x: 300, y: 520, rot: 4, tam: 25 },
    rotulo: "REBELIÓN",
    lineas: [[{ t: "CALLADITA" }], [{ t: "TE VES MÁS BONITA", tach: true }], [{ t: "no te ves", mano: true, color: "var(--tinta)", estilo: "background:linear-gradient(transparent 58%,var(--amarillo) 58%,var(--amarillo) 94%,transparent 94%);padding:0 .1em" }]],
  },
  laura: {
    pilar: "cordura", retrato: "retrato-extra.webp", flor: "lirio-azul.webp",
    tira: "Todo bien", boca: { x: 266, y: 532, rot: -5, tam: 40 },
  },
  cierre: { lineas: [[{ t: "ALGUIEN" }], [{ t: "TENÍA", color: "var(--rojo)" }, { t: "QUE" }], [{ t: "DECIRLO." }]] },
};