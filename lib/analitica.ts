// La URL de la guía del frasco lleva el token, y el token lleva la composición recetada:
// es un dato de salud y no va a ninguna analítica (revisión final, 20-nov).
export const rutaSinToken = (url: string) =>
  url.replace(/^((?:https?:\/\/[^/]+)?)\/g\/[^/?#]+(?:[?#].*)?$/, '$1/g/[token]')
