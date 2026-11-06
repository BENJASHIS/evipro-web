export const BOTTLE_PATH = '/miembros/contenido/explora-cbd-thc'

// Lista cerrada: el enlace compartido nunca puede redirigir a otra web.
export function memberReturnPath(candidate: string | null) {
  return candidate === BOTTLE_PATH ? BOTTLE_PATH : '/miembros'
}
