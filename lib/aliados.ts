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
    nombre: 'ASCAMED Perú',
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
    // Sin rol ni descripción hasta que se confirme qué son y qué ofrecen.
    enlaces: [
      { etiqueta: 'Instagram', url: 'https://www.instagram.com/cannabislibreclub/' },
    ],
  },
  {
    slug: 'dosis-de-ciencia',
    nombre: 'Dosis de Ciencia',
    logo: '/images/aliados/dosisdeciencia.png',
    // Sin rol ni descripción: falta que Carlos confirme qué son y qué ofrecen.
    enlaces: [
      { etiqueta: 'Instagram', url: 'https://www.instagram.com/dosis_de_ciencia/' },
    ],
  },
]
