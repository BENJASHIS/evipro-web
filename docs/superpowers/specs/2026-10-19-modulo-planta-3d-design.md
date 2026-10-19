# Módulo educativo 1 «¿Qué hay en la planta?» — diseño

Fecha: 2026-10-19. Dominio: `education`, respaldado por `evidence`. Decisiones de Carlos Jara (médico responsable) en la conversación del 2026-10-19; revisión externa de Codex incorporada y verificada contra las fuentes. Idea de origen: ROADMAP 💡 «Guía educativa interactiva del sistema endocannabinoide, con modelos 3D».

## 1. Intención

En consulta, los pacientes no saben qué componentes tiene la planta ni en qué se diferencian el THC y el CBD, y preguntan qué son los terpenos y los flavonoides. Carlos lo explica de palabra con ejemplos (el mango y el mirceno, el limón y el limoneno). Este módulo convierte esa explicación en una pieza interactiva con moléculas 3D reales que el paciente puede girar, para que **entienda** lo que toma.

Es el **primero de una serie de módulos cortos** con el mismo formato. Le seguirán «Tu sistema endocannabinoide», neuropatía diabética y bomba muscular de la pantorrilla, que se diseñarán aparte. También funciona como **invitación a subir de la Membresía Básica a la Membresía EVIPro**.

**Cómo se usará:** Carlos lo muestra en consulta desde su pantalla (es administrador) y el paciente vuelve a verlo en casa desde su celular.

## 2. Objetivos, no objetivos y antiobjetivos

**Objetivos**
- Que un paciente sin formación entienda, en 2 a 3 minutos por parte: qué hay en la planta, por qué el THC puede «volar» y el CBD no, qué hace el calor y qué pasa cuando el producto envejece.
- Que cada afirmación sea verdadera, tenga una fuente comprobada y diga qué tipo de evidencia es.
- Que la Básica pruebe una parte real y vea con claridad qué gana al subir de membresía.

**No objetivos**
- No da dosis, no recomienda productos ni marcas, no cambia la receta ni genera recomendaciones clínicas.
- No toca el motor clínico Python ni los datos de pacientes. Mostrar los terpenos de la fórmula de cada paciente queda para después: ya toca datos clínicos.
- No incluye los otros módulos de la serie ni un contador de usos.

**Antiobjetivos** (lo que sería un fracaso aunque funcione)
- Que el simulador de calor se lea como **receta casera** para descarboxilar o preparar comestibles.
- Que un hallazgo preliminar o de laboratorio se presente como hecho («el limoneno quita la ansiedad», «el CBN da sueño», «el mirceno relaja»).
- Que la información de seguridad quede detrás del pago.
- Que el morado de una flor o el aroma se lean como indicador de potencia o beneficio.
- Que un celular barato no lo pueda abrir.

## 3. Acceso

| Quién | Qué ve |
|---|---|
| Membresía EVIPro activa (`membership_plans.type = 'evipro'`) | Todo |
| Administrador (`isAdmin`, con o sin membresía) | Todo, con el aviso «Modo admin» que ya usan las herramientas |
| Otra membresía activa (Básica, Turista Inicio o Turista Plus) | Parte abierta completa + parte EVIPro como **vista previa bloqueada** con invitación a `/planes#membresias` |
| Sesión sin membresía activa | El patrón existente de Herramientas: «Esta zona se activa con una membresía vigente» + «Ver membresías →» |
| Sin sesión | `redirect('/login')`, como el resto del área de miembros |

- **Planes a la venta:** Básica, EVIPro y Turista. Carlos confirmó el 2026-10-19 que **no queda ninguna suscripción activa de planes retirados** (Cannabis, Integral, Express, Esencial); solo hay pruebas de administrador. No se les da trato especial: cualquier plan que no sea `evipro` cae en el nivel parcial. El comentario de `PLAN_NAMES` en `app/miembros/page.tsx`, que dice que quedan suscripciones vivas, está desactualizado; su limpieza va aparte y queda fuera de este módulo.
- El nivel se decide **en el servidor** con `getMemberAccess` (`lib/member-access.ts`), que ya devuelve `planType`, `isAdmin` y `hasActiveMembership`. Conviene una función pura `nivelModulo(access): 'completo' | 'parcial' | 'sin_acceso'`, probada aparte.
- Para el nivel parcial, el servidor **no renderiza** el contenido EVIPro: textos, simulador y comparaciones no llegan al HTML. La vista previa bloqueada lleva solo título, una descripción corta y la invitación.
- **Decisión de Claude:** las moléculas (archivos SDF públicos de PubChem) y los textos genéricos pueden quedar como recursos estáticos accesibles. No son datos sensibles; el control protege la experiencia completa, no un secreto. No hace falta migración, tabla ni ruta de API nueva: el módulo no lee ni escribe datos.

## 4. Contenido

Los textos los redacta el implementador con estas reglas y **Carlos los revisa antes de publicar**, como se hizo con Regen. Las cifras y fuentes de esta sección ya están verificadas (ver §8).

### 4.1 Recuadro de seguridad (visible en todos los niveles con acceso, arriba)
- El THC puede marear o «volar»: no manejar ni operar máquinas después de tomarlo.
- Lo que muestra el módulo ocurre en un laboratorio. Calentar o preparar el producto en casa da dosis impredecibles.
- Este módulo no indica dosis; la dosis la decide el médico.
- **Pendiente de verificar antes de incluirlo:** «El CBD no anula al THC: tomados juntos por boca, en estudios el CBD aumentó los efectos del THC». La revisión de 2026 (PMID 42708292) lo resume; falta localizar y leer el ensayo primario. Si se confirma, va en este recuadro, no detrás del pago.

### 4.2 Parte abierta — «Lo que hueles y lo que ves»
- **Qué hay en la planta:** cientos de compuestos; los grupos que se explican aquí son terpenos, flavonoides y cannabinoides (el último, en la parte EVIPro).
- **Terpenos en 3D**, cada uno con su referencia cotidiana: limoneno (limón), linalool (lavanda), mirceno (mango), β-cariofileno (pimienta negra). Regla general: «contribuyen al aroma; sus posibles efectos siguen en investigación». Lo que sí puede decirse, con su límite:
  - Limoneno: «En un estudio pequeño con 20 adultos, el d-limoneno vaporizado junto con THC redujo algunas medidas de ansiedad provocada por el THC». No permite concluir que oler limón, comer cítricos o elegir una variedad aromática produzca ese efecto.
  - Linalool: la evidencia en ansiedad es del **aceite de lavanda** completo (inhalado u oral), no del linalool aislado en una fórmula de cannabis.
  - β-cariofileno: actúa sobre el receptor CB2 en estudios de laboratorio; en humanos hay pocos ensayos pequeños, insuficientes para afirmar un efecto.
  - Mirceno: «contribuye al aroma; sus posibles efectos siguen en investigación». El «da sueño» viene de animales.
  - Sin etiquetas automáticas del tipo «relaja», «calma el dolor» o «da energía».
- **Flavonoides:** «algunos flavonoides dan color». Ejemplo en 3D: una antocianina **concreta y con nombre**. Propuesta: kuromanina (cianidina-3-glucósido, CID 441667), presentada como antocianina común en frutas moradas. Afirmar que está en el cannabis solo si se verifica. El morado no indica potencia ni beneficio. Opcional: cannflavina A (CID 10071695), flavonoide propio del cannabis.

### 4.3 Parte EVIPro — «Los cannabinoides»
1. **El árbol familiar** (introducción breve, puede ser estática o por pasos):
   - Rama principal: **CBGA** («la madre») → **THCA / CBDA / CBCA** → al perder CO₂ con el calor → **THC / CBD / CBC**. El CBGA, al perder CO₂, da **CBG**.
   - Rama aparte, no como hermano directo: **CBGVA** → **THCVA** → **THCV**.
   - El **CBN** aparece después, como producto de degradación del THC (§4.3.4), no como hijo de la planta.
2. **Simulador de calor y tiempo (pieza central)**, basado en Wang 2016 y presentado como **ese experimento, no como receta universal**:
   - **Selector de temperatura** con las cinco temperaturas medidas: 80, 95, 110, 130 y 145 °C. **Deslizador de tiempo** de 0 a 60 min.
   - Muestra el **THCA que queda** con cinética de primer orden, `[THCA]t = [THCA]0 · e^(−k·t)`, y la molécula en 3D que cambia de THCA a THC al pasar el 50 %, con el grupo carboxilo resaltado y una etiqueta «sale CO₂».
   - Constantes **medidas** (Tabla 2), en s⁻¹: 80 °C = 0,18×10⁻³; 95 °C = 0,66×10⁻³; 110 °C = 1,83×10⁻³ (Ea = 88 kJ/mol).
   - A 130 y 145 °C el estudio no publica constante. Se **estima** por Arrhenius desde 110 °C con Ea = 88 kJ/mol (≈ 7,2×10⁻³ y ≈ 18,5×10⁻³ s⁻¹), con la etiqueta visible **«estimado»**. Estas estimaciones coinciden con lo medido: THCA cerca de cero a los **30, 9 y 6 min** a 110, 130 y 145 °C. Bajo 100 °C no se completó en 60 min.
   - **Distinguir lo medido de lo estimado**: los puntos medidos se marcan como tales; la curva continua se rotula como modelo. **Decisión de Claude:** «medido» significa solo lo que el artículo da en texto o tablas, es decir, las constantes a 80, 95 y 110 °C (Tabla 2) y los tiempos en que el THCA llega cerca de cero a 110, 130 y 145 °C (30, 9 y 6 min, en el texto de resultados). **No se digitalizan puntos de las figuras.** A 80 y 95 °C no hay un tiempo de «casi cero» medido; se muestra la curva con su constante medida y la nota «no se completó en 60 min».
   - **No equivale a 100 % de THC:** a 110 °C se perdió un **7,9 %** del total (Tabla 1). Mostrarlo como «a 110 °C, cerca de 92 % se recuperó como THC». No calcular THC a otras temperaturas: el estudio no lo da.
   - **Condiciones del experimento siempre visibles:** extractos de cannabis, horno al vacío (sin oxígeno ni luz), medición por cromatografía.
   - Nota de comparación permitida: el THCA se convierte más rápido que el CBDA y el CBGA (alrededor del doble a 110 °C).
   - Los textos no usan verbos de instrucción («calienta a…»); describen lo que pasó en el estudio.
3. **THC y CBD lado a lado en 3D:** «misma fórmula molecular (C₂₁H₃₀O₂), distinta estructura». Se resalta el anillo con oxígeno que el THC tiene cerrado y el CBD abierto, **con etiqueta de texto además del color**.
4. **Degradación y envejecimiento:** con luz, calor, oxígeno y tiempo, el THC se degrada y una parte se convierte en CBN. **Sin reloj universal ni conversión completa garantizada**: depende de cómo se guarde (Zamengo 2019, estudio de cuatro años). Consejo práctico derivado: guardar el producto bien cerrado, en un lugar oscuro y fresco.
5. **Cannabinoides menores (CBG, CBN, CBC, THCV):** qué son y de dónde vienen. La evidencia se califica **por efecto o indicación**, no con una sola nota por molécula. Ejemplo de formato: «CBN y sueño: pocos estudios en personas, resultados no concluyentes». El contenido de esta tabla es una tarea de investigación del implementador: identificadores verificados en PubMed y revisión de Carlos.

### 4.4 Cierre (en ambos niveles; con las preguntas de cada parte)
- **Mini repaso:** tres preguntas de opción múltiple con respuesta inmediata y explicación, por ejemplo «¿Cuál te puede volar: THC o CBD?». No se guarda nada. La Básica responde solo preguntas de su parte.
- **Fuentes:** lista con enlaces PubMed o DOI de todo lo que se afirma en el nivel visible.
- **Sello de revisión:** «Revisado por Dr. Carlos Jara · versión AAAA.MM.DD» (formato de versión de evidencia de AGENTS.md).

## 5. Trazabilidad de cada afirmación

- Cada afirmación del módulo vive en un único registro de contenido (por ejemplo `lib/educacion/planta.ts`) con: texto en español, tipo, fuente, fecha de revisión y responsable científico (Carlos Jara).
- **Cuatro tipos** (decisión de Claude, sigue la distinción de AGENTS.md entre evidencia, recomendación médica y orientación general):
  - **química**, **estudio en personas**, **estudio de laboratorio o animales**: exigen fuente (PMID o DOI).
  - **orientación**: advertencias y consejos prácticos («no manejar», «prepararlo en casa da dosis impredecibles», «guárdalo cerrado, oscuro y fresco»). Exige responsable y motivo breve; la fuente es opcional y se cita cuando existe (por ejemplo Zamengo 2019 para el almacenamiento).
- La interfaz muestra el tipo como una etiqueta pequeña junto a la afirmación. Las orientaciones se ven como consejo, no como dato de un estudio.
- Una prueba falla si una afirmación de los tres primeros tipos no tiene fuente, o si una orientación no tiene responsable.
- Las cifras del simulador salen de constantes con su fuente (Wang 2016, Tabla 1 y Tabla 2) y la marca medido/estimado.

## 6. Experiencia, accesibilidad y rendimiento

- **Dónde vive (decisión de Claude):** ruta `/miembros/contenido/que-hay-en-la-planta`, con una tarjeta destacada al inicio de `/miembros/contenido`. Reutiliza el menú actual sin agregar entradas. Mismo estilo visual que Herramientas y Contenido (clases y componentes existentes).
- **Visor 3D:** moléculas reales de PubChem, en barras y esferas, sin hidrógenos salvo en la parte resaltada. Giran con el dedo o el mouse, con giro automático suave. La parte que cambia va en naranja **y con etiqueta de texto**. Referencia de comportamiento: boceto A de la sesión (`.superpowers/brainstorm/…/animacion-cambios.html`, no versionado).
- **Rendimiento:** el visor 3D se carga **solo cuando la sección entra en pantalla**, con importación dinámica. La página sin 3D debe ser ligera.
- **Respaldo:** si no hay WebGL o falla la carga, se muestra una imagen 2D de la molécula y su descripción en texto. Toda la información esencial existe en texto: el 3D ilustra, no es la única vía.
- **Accesibilidad:** controles de temperatura, tiempo, pasos y repaso operables con teclado y etiquetados. Con `prefers-reduced-motion`, sin giro automático ni animaciones. Contraste según `tests/contraste.test.ts`. El color nunca es el único portador de significado.
- **Modo consulta:** botón de pantalla completa en el visor y el simulador, para mostrarlo desde la computadora de Carlos.
- **Celulares:** pensado primero para 360–400 px de ancho.

## 7. Idiomas

- Todo texto visible pasa por `<T>` (`app/components/Language`) con su traducción en `lib/locales/en.json`. `tests/i18n-catalogue.test.ts` debe seguir aprobando.
- **Paridad:** mismas cifras, fuentes, advertencias, etiquetas de evidencia y fecha de revisión en español y en inglés. Los nombres de moléculas y los identificadores no se traducen.

## 8. Fuentes verificadas (2026-10-19)

| Uso | Fuente | Verificación |
|---|---|---|
| Limoneno + THC | Spindle TR et al. Drug Alcohol Depend 2024;257:111267. PMID 38498958 · PMC11031290 | Resumen |
| Lavanda y ansiedad | Donelli D et al. Phytomedicine 2019. PMID 31655395 | Resumen |
| Interacciones THC–otros fitoquímicos; CBD oral aumenta efectos de THC | Revisión crítica. Curr Neuropharmacol 2026. PMID 42708292 | Resumen; falta el ensayo primario |
| β-cariofileno, ensayos pequeños | PMID 35809704, PMID 31650795 | Solo título |
| Descarboxilación (cifras del simulador) | Wang M et al. Cannabis Cannabinoid Res 2016. PMID 28861498 · PMC5549281 | **Texto completo, Tablas 1 y 2** |
| Degradación en almacenamiento | Zamengo L et al. Forensic Sci Int 2019. doi:10.1016/j.forsciint.2019.02.058 | Título y metadatos |
| Rutas biosintéticas (CBGA, CBGVA) | Kim et al. Plants 2022;11:3088. doi:10.3390/plants11223088 | Título; confirmar que cubre la rama CBGVA o usar una revisión de biosíntesis |

**Moléculas (PubChem, estructura 3D disponible, título y fórmula comprobados):**

| Molécula | CID | Fórmula |
|---|---|---|
| THC | 16078 | C21H30O2 |
| CBD | 644019 | C21H30O2 |
| THCA | 98523 | C22H30O4 |
| CBDA | 160570 | C22H30O4 |
| CBGA | 6449999 | C22H32O4 |
| CBCA | 3084339 | C22H30O4 |
| CBG | 5315659 | C21H32O2 |
| CBC | 30219 (racémico) | C21H30O2 |
| CBN | 2543 | C21H26O2 |
| CBGVA | 59444383 | C20H28O4 |
| THCVA | 59444416 | C20H26O4 |
| THCV | 93147 | C19H26O2 |
| d-limoneno | 440917 | C10H16 |
| linalool | 6549 | C10H18O |
| mirceno | 31253 | C10H16 |
| β-cariofileno | 5281515 | C15H24 |
| kuromanina (cianidina-3-glucósido) | 441667 | C21H21O11+ |
| cannflavina A | 10071695 | C26H28O6 |

Al descargarse, cada archivo se vuelve a comprobar por título y fórmula. El CID que se tenía para el CBCA (3081999) resultó ser otra molécula, así que no se confía en identificadores de memoria. Los SDF son datos de PubChem (dominio público) y se guardan como recursos estáticos, con su CID anotado.

## 9. Restricciones técnicas

- Plataforma `evipro-platform`: Next.js 16.3 (App Router), React 19. Consultar `node_modules/next/dist/docs/` antes de escribir código, como exige `evipro-platform/AGENTS.md`.
- Librería 3D (decisión de Claude): `3dmol` **2.5.5** fijada, licencia BSD-3-Clause, unos 150 KB comprimida, cargada solo con importación dinámica en el cliente. Está hecha para moléculas: lee SDF, selecciona átomos y permite girar con el dedo. Si el implementador encuentra un motivo fuerte para otra opción, lo justifica en el plan.
- Sin cambios en Supabase, sin migraciones, sin rutas de API y sin secretos.
- Pruebas con vitest: función de nivel de acceso; matemática del simulador (constantes, estimación de Arrhenius, coincidencia con los tiempos medidos 30/9/6 min, pérdida 7,9 %); registro de afirmaciones con fuente y tipo; render por nivel (el contenido EVIPro **ausente** en el HTML de la Básica; recuadro de seguridad presente en todos); catálogo i18n. Además `npm run lint` y `npm run build`.
- Publicación: push a `main` solo con autorización de Carlos (Vercel despliega solo), y después de su revisión de textos.

## 10. Lo que queda al implementador

- Diseño visual fino, microtextos y orden exacto dentro de cada parte, respetando §4.
- Redacción de los textos (borrador para revisión de Carlos), las tres preguntas del repaso y la tabla de evidencia de los menores, con fuentes verificadas en PubMed.
- Cómo se ve la vista previa bloqueada, dentro del estilo existente.
- Generación de las imágenes 2D de respaldo.
- Si el árbol familiar es estático o por pasos.

## 11. Pendiente de verificar antes de publicar

1. Ensayo primario de «CBD oral aumenta los efectos del THC» (§4.1). Si no se confirma, la frase no se publica.
2. Fuente del β-cariofileno como agonista CB2 (estudio de laboratorio original).
3. Que la referencia de biosíntesis cubra la rama CBGVA → THCVA → THCV.
4. Si la kuromanina u otra antocianina concreta se ha descrito en cannabis; si no, presentarla solo como ejemplo de antocianina.
5. Revisión médica de todos los textos por Carlos y fecha de versión.
