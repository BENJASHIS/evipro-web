/**
 * Los aliados que aparecen en /aliados.
 *
 * Aquí, y no dentro de la página, porque la tarjeta estaba copiada a mano por
 * cada aliado: con dos se aguantaba, con seis es el mismo error que dejó dos
 * cabeceras sin logo (ver Marca.tsx). Agregar uno es agregar una entrada.
 *
 * Regla: **no se escribe nada de un tercero que no haya confirmado él.** Por
 * eso `descripcion` y `rol` son opcionales — una tarjeta con logo, nombre y
 * enlace es honesta; una con una frase inventada sobre su trabajo, no.
 */

export interface EnlaceAliado {
  etiqueta: string
  url: string
}

export interface Aliado {
  slug: string
  nombre: string
  logo: string
  /** "Farmacia aliada", "Asociación"… Se omite si no está confirmado qué es. */
  rol?: string
  /** Qué encuentra ahí el paciente. Se omite hasta que el aliado lo confirme. */
  descripcion?: string
  enlaces: EnlaceAliado[]
}

export const ALIADOS: Aliado[] = [
  {
    slug: 'cannavital',
    nombre: 'Cannavital · Farmacia magistral',
    logo: '/images/aliados/cannavital.png',
    rol: 'Farmacia aliada',
    descripcion:
      'Farmacia magistral aliada para preparar las fórmulas indicadas por tu médico.',
    enlaces: [
      { etiqueta: 'Ver farmacia magistral', url: 'https://cannavital.pe/farmacia-magistral/' },
      { etiqueta: 'Instagram', url: 'https://www.instagram.com/cannavital.farmacia/' },
    ],
  },
  {
    slug: 'fisioimperium',
    nombre: 'FisioImperium · Centro médico integral',
    logo: '/images/aliados/fisioimperium.png',
    rol: 'Centro aliado',
    descripcion:
      'Centro aliado de fisioterapia y rehabilitación para complementar tu tratamiento.',
    enlaces: [
      { etiqueta: 'Ver en Facebook', url: 'https://www.facebook.com/fisioimperium' },
      {
        etiqueta: 'Cómo llegar',
        url: 'https://www.google.com/maps/place/FisioImperium/@-13.5252192,-71.9712776,17z/data=!3m1!4b1!4m6!3m5!1s0x916dd5e3b6d1316f:0xee13937c3020a575!8m2!3d-13.5252192!4d-71.9687027!16s%2Fg%2F11qh0zx6gd',
      },
    ],
  },
  {
    slug: 'ascamed',
    nombre: 'ASCAMED · Asociación de Cannabis Medicinal del Cusco',
    logo: '/images/aliados/ascamed.png',
    rol: 'Asociación',
    // Sin descripción hasta que ASCAMED confirme cómo quiere describirse.
    enlaces: [
      { etiqueta: 'Instagram', url: 'https://www.instagram.com/ascamed_peru/' },
      // Linktree sin los parámetros de seguimiento con que llegó el enlace:
      // no hay por qué reenviar a nadie los identificadores de una campaña.
      { etiqueta: 'Todos sus enlaces', url: 'https://linktr.ee/ascamedperu' },
    ],
  },
  {
    slug: 'cannabis-libre-club',
    nombre: 'Cannabis Libre Club',
    logo: '/images/aliados/cannabislibreclub.png',
    rol: 'Plataforma de orientación',
    // El énfasis va en el PROCEDIMIENTO, no en el producto (corrección de
    // Carlos): "conseguir" apunta a la compra y la web sostiene que no vende
    // producto; lo que ellos hacen es acompañar el trámite. No se enumeran los
    // pasos (receta, RENPUC…) porque eso no está confirmado con ellos.
    descripcion:
      'Te orientan en el procedimiento para tener tu producto legalmente, paso a paso.',
    enlaces: [
      // La web primero: es suya, no exige cuenta a nadie y no se cae si cambian
      // de red social.
      { etiqueta: 'Ver su web', url: 'https://www.cannabislibre.club/pe/' },
      { etiqueta: 'Instagram', url: 'https://www.instagram.com/cannabislibreclub/' },
    ],
  },
  {
    slug: 'mayac',
    // "MAYAC" a secas, no "MAYAC · Cusco": son de Arequipa y Cusco es su
    // sucursal, así que atarlos a una ciudad en el nombre los describe mal.
    nombre: 'MAYAC',
    logo: '/images/aliados/mayac.png',
    rol: 'Fundación',
    descripcion: 'Fundación multidisciplinaria.',
    enlaces: [
      {
        // Se rotula la ciudad porque no es su única sede, y va la de Cusco
        // porque es la que le sirve al paciente que entra desde aquí.
        etiqueta: 'Cómo llegar · Cusco',
        url: 'https://www.google.com/maps/place/Aceite+de+Cannabis+Medicinal+-+Cusco+-+Mayac/@-13.5279142,-71.9450962,17z/data=!3m1!4b1!4m6!3m5!1s0x916e7ffe3f02fd93:0x951df7d2836316d0!8m2!3d-13.5279142!4d-71.9425213!16s%2Fg%2F11vdzpqd5f',
      },
      { etiqueta: 'Instagram', url: 'https://www.instagram.com/mayac.consultorio/' },
    ],
  },
  {
    slug: 'dosis-de-ciencia',
    nombre: 'Dosis de Ciencia',
    logo: '/images/aliados/dosisdeciencia.png',
    rol: 'Divulgación e investigación',
    // Divulgan ciencia en general, no solo cannabis (aclaración de Carlos).
    // Se nombra el cannabis como ejemplo, no como su tema único.
    descripcion:
      'Divulgan e investigan ciencia, el cannabis entre otros temas: evidencia, no mitos.',
    enlaces: [
      { etiqueta: 'Instagram', url: 'https://www.instagram.com/dosis_de_ciencia/' },
    ],
  },
  {
    slug: 'centro-cultural-pukllasunchis',
    nombre: 'Centro Cultural Pukllasunchis',
    logo: '/images/aliados/centroculturalpukllasunchis.png',
    rol: 'Centro cultural',
    // Es la SEDE donde ocurren las charlas y talleres, no un servicio clínico:
    // por eso la tarjeta habla del lugar y el enlace es "cómo llegar".
    descripcion:
      'El lugar donde damos las charlas y los talleres. También acoge otras actividades culturales.',
    enlaces: [
      {
        etiqueta: 'Cómo llegar',
        // Formato oficial de enlace de Maps (api=1), no el de una búsqueda: el
        // que llegó era una URL de resultados con la sesión de Carlos dentro
        // (sca_esv, fbs, ved, ictx). 🙋 Si consigues el enlace del LUGAR, mejor:
        // apunta a la ficha exacta y no a lo que devuelva el buscador ese día.
        url: 'https://www.google.com/maps/search/?api=1&query=Centro+Cultural+Pukllasunchis+Cusco',
      },
    ],
  },
]
