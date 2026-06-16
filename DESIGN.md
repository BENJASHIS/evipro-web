# Sistema de diseño — EVIPro web

Fuente de verdad: `app/globals.css` (`@theme`). Referencia viva: `/styleguide`.

## Tokens de color
| Token | Uso |
|---|---|
| `brand` / `brand-hover` / `brand-mid` / `brand-deep` | Verde de marca y estados |
| `ink` | Fondo base (oscuro) |
| `surface` / `surface-2` | Paneles verdosos |
| `muted` | Texto secundario |
| `faint` | Texto muy tenue / pies |
| `subtle` / `strong` | Bordes y divisores |

Uso: `bg-brand`, `text-muted`, `border-subtle`, `hover:bg-brand-hover`.

## Tipografía
- `font-sans` → Geist (cuerpo, por defecto en `body`)
- `font-serif` → Lora (títulos, usar con `italic`)
- `font-mono` → Geist Mono (etiquetas, botones)

Cambiar una fuente = una línea en `layout.tsx` + el token en `globals.css`.

## Componentes (`app/components/ui/`)
- `Button` — `variant="primary"|"outline"`, opcional `href` (renderiza Link).
- `Card` — panel con borde sutil.
- `Section` — contenedor centrado (`max-w-5xl`), `bordered` para borde superior.
- `Badge` — eyebrow mono en mayúsculas, verde.

## Regla
No hardcodear hex (`bg-[#7bc96f]`). Usar siempre tokens. Si falta un token, añadirlo a `@theme` antes de usarlo.
