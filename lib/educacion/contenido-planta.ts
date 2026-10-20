// Registro único de afirmaciones del módulo «¿Qué hay en la planta?» (spec §4 y §5).
// Cada fuente se comprobó el 2026-10-19 en PubMed (resumen y, cuando se indica en el informe, texto completo en PMC) o en PubChem.
import type { NivelModulo } from '@/lib/educacion/acceso-modulo'
import type { MoleculaId } from '@/lib/educacion/moleculas'
import { FUENTE_WANG } from '@/lib/educacion/descarboxilacion'

export type TipoAfirmacion = 'quimica' | 'personas' | 'laboratorio' | 'orientacion'
export type Fuente = { cita: string; pmid?: string; doi?: string; url?: string }
// ponytail: revisión común, fecha propia solo al actualizar una afirmación
export type Afirmacion = { id: string; tipo: TipoAfirmacion; es: string; en: string; fuente?: Fuente; motivo?: string; revisado?: string }
export type SeccionId = 'seguridad' | 'terpenos' | 'flavonoides' | 'arbol' | 'calor' | 'isomeros' | 'degradacion' | 'menores'
type Parte = 'todos' | 'abierta' | 'evipro'
export type Seccion = { id: SeccionId; parte: Parte; titulo: { es: string; en: string }; afirmaciones: Afirmacion[]; moleculas: MoleculaId[] }
export type Pregunta = { id: string; parte: Parte; enunciado: { es: string; en: string }; opciones: { es: string; en: string }[]; correcta: number; explicacion: { es: string; en: string } }

export const REVISION: { responsable: 'Dr. Carlos Jara'; version: string | null } = { responsable: 'Dr. Carlos Jara', version: null }

const ZAMARRIPA_2023 = { cita: 'Zamarripa CA et al. JAMA Netw Open 2023', pmid: '36780161' }
const ELSOHLY_2017 = { cita: 'ElSohly MA et al. Prog Chem Org Nat Prod 2017', pmid: '28120229' }
const OSWALD_2023 = { cita: 'Oswald IWH et al. ACS Omega 2023', pmid: '37901519' }
const ELDER_2026 = { cita: 'Elder HJ et al. Curr Neuropharmacol 2026', pmid: '42708292' }
const KACANIOVA_2024 = { cita: 'Kačániová M et al. Plants 2024', pmid: '38498554' }
const SPINDLE_2024 = { cita: 'Spindle TR et al. Drug Alcohol Depend 2024', pmid: '38498958' }
const AGUERD_2025 = { cita: 'Aguerd O et al. AMB Express 2025', pmid: '41191233' }
const DONELLI_2019 = { cita: 'Donelli D et al. Phytomedicine 2019', pmid: '31655395' }
const LI_2017 = { cita: 'Li L et al. PLoS One 2017', pmid: '29211747' }
const SURENDRAN_2021 = { cita: 'Surendran S et al. Front Nutr 2021', pmid: '34350208' }
const DO_VALE_2002 = { cita: 'do Vale TG et al. Phytomedicine 2002', pmid: '12587690' }
const DOSOKY_2019 = { cita: 'Dosoky NS et al. Molecules 2019', pmid: '31766491' }
const GERTSCH_2008 = { cita: 'Gertsch J et al. Proc Natl Acad Sci U S A 2008', pmid: '18574142' }
const ALIZADEH_2022 = { cita: 'Alizadeh S et al. Appetite 2022', pmid: '35809704' }
const OLIVAS_2016 = { cita: 'Olivas-Aguirre FJ et al. Molecules 2016', pmid: '27657039' }
const BASSOLINO_2023 = { cita: 'Bassolino L et al. Antioxidants 2023', pmid: '37507932' }
const KIM_2025 = { cita: 'Kim SR et al. J Cannabis Res 2025', pmid: '40731014' }
const KIM_2022 = { cita: 'Kim AL et al. Plants 2022', pmid: '36432817' }
const PUBCHEM_THC = { cita: 'PubChem CID 16078 (THC)', url: 'https://pubchem.ncbi.nlm.nih.gov/compound/16078' }
const PUBCHEM_CBD = { cita: 'PubChem CID 644019 (CBD)', url: 'https://pubchem.ncbi.nlm.nih.gov/compound/644019' }
const BABALONIS_2017 = { cita: 'Babalonis S et al. Drug Alcohol Depend 2017', pmid: '28088032' }
const ZAMENGO_2019 = { cita: 'Zamengo L et al. Forensic Sci Int 2019', pmid: '30901710' }
const CUTTLER_2024 = { cita: 'Cuttler C et al. Sci Rep 2024', pmid: '39003387' }
const LAVENDER_2026 = { cita: 'Lavender IG et al. J Sleep Res 2026', pmid: '41698831' }
const ELBOUZIDI_2026 = { cita: 'Elbouzidi A et al. J Cannabis Res 2026', pmid: '42464425' }
const SALESKA_2024 = { cita: 'Saleska JL et al. J Am Nutr Assoc 2024', pmid: '37162192' }
const HAGHDOOST_2025 = { cita: 'Haghdoost M et al. Cannabis Cannabinoid Res 2025', pmid: '38995871' }

export const SECCIONES: Seccion[] = [
  {
    id: 'seguridad', parte: 'todos', moleculas: [],
    titulo: { es: 'Antes de empezar', en: 'Before you start' },
    afirmaciones: [
      { id: 'seguridad.thc-manejo', tipo: 'orientacion',
        es: 'El THC puede marearte o «volarte». No manejes ni uses máquinas después de tomarlo.',
        en: 'THC can make you dizzy or “high”. Do not drive or operate machinery after taking it.',
        motivo: 'El THC es intoxicante; manejar o usar máquinas bajo su efecto expone a accidentes.' },
      { id: 'seguridad.casa', tipo: 'orientacion',
        es: 'Lo que muestra este módulo pasó en un laboratorio. Calentar o preparar el producto en casa da dosis impredecibles.',
        en: 'What this module shows happened in a laboratory. Heating or preparing the product at home gives unpredictable doses.',
        motivo: 'Evita que el simulador se lea como receta casera: sin control de temperatura ni medición no se sabe cuánto THC queda.' },
      { id: 'seguridad.dosis', tipo: 'orientacion',
        es: 'Este módulo no indica dosis. La dosis la decide tu médico.',
        en: 'This module does not give doses. Your doctor decides the dose.',
        motivo: 'El módulo es educativo; la dosis es una decisión clínica individual.' },
      { id: 'seguridad.cbd-no-anula', tipo: 'personas', fuente: ZAMARRIPA_2023,
        es: 'El CBD no anula al THC. En un ensayo con 18 adultos, tomados juntos por boca, un producto con mucho más CBD que THC dio efectos más fuertes que el mismo THC solo: más ansiedad, más somnolencia y más problemas de memoria y concentración.',
        en: 'CBD does not cancel out THC. In a trial with 18 adults, taken together by mouth, a product with much more CBD than THC caused stronger effects than the same THC alone: more anxiety, more sleepiness and more memory and concentration problems.' },
    ],
  },
  {
    id: 'terpenos', parte: 'abierta', moleculas: ['limoneno', 'linalool', 'mirceno', 'cariofileno'],
    titulo: { es: 'Lo que hueles: los terpenos', en: 'What you smell: terpenes' },
    afirmaciones: [
      { id: 'terpenos.planta', tipo: 'quimica', fuente: ELSOHLY_2017,
        es: 'La planta de cannabis tiene cientos de compuestos: se han identificado más de 560. Este módulo explica tres grupos: los terpenos y los flavonoides en esta parte, y los cannabinoides en la parte EVIPro.',
        en: 'The cannabis plant contains hundreds of compounds: more than 560 have been identified. This module explains three groups: terpenes and flavonoids in this part, and cannabinoids in the EVIPro part.' },
      { id: 'terpenos.aroma', tipo: 'quimica', fuente: OSWALD_2023,
        es: 'Los terpenos contribuyen al aroma del cannabis, junto con otros compuestos. Los más abundantes suelen ser el mirceno, el limoneno y el β-cariofileno.',
        en: 'Terpenes contribute to the aroma of cannabis, along with other compounds. The most abundant are usually myrcene, limonene and β-caryophyllene.' },
      { id: 'terpenos.investigacion', tipo: 'personas', fuente: ELDER_2026,
        es: 'Sus posibles efectos siguen en investigación. Muchos terpenos aún no se han estudiado en personas, y muchos hallazgos en animales no se han confirmado en humanos.',
        en: 'Their possible effects are still being researched. Many terpenes have not yet been studied in people, and many findings in animals have not been confirmed in humans.' },
      { id: 'terpenos.limoneno-limon', tipo: 'quimica', fuente: KACANIOVA_2024,
        es: 'Limoneno: es el componente principal del aceite esencial de limón.',
        en: 'Limonene: it is the main component of lemon essential oil.' },
      { id: 'terpenos.limoneno-estudio', tipo: 'personas', fuente: SPINDLE_2024,
        es: 'En un estudio pequeño con 20 adultos, el d-limoneno vaporizado junto con THC redujo algunas medidas de ansiedad provocada por el THC; el efecto claro se vio solo con la cantidad más alta de limoneno probada. No permite concluir que oler limón, comer cítricos o elegir una variedad aromática produzca ese efecto.',
        en: 'In a small study with 20 adults, d-limonene vaporized together with THC reduced some measures of THC-induced anxiety; the clear effect was seen only with the highest amount of limonene tested. This does not mean that smelling lemon, eating citrus or choosing an aromatic variety produces that effect.' },
      { id: 'terpenos.linalool-lavanda', tipo: 'quimica', fuente: AGUERD_2025,
        es: 'Linalool: es uno de los componentes principales del aceite esencial de lavanda.',
        en: 'Linalool: it is one of the main components of lavender essential oil.' },
      { id: 'terpenos.linalool-ansiedad', tipo: 'personas', fuente: DONELLI_2019,
        es: 'Los estudios sobre ansiedad usan aceite de lavanda completo, inhalado o por boca: algunos resultados son favorables, pero muchos estudios son de baja calidad. No estudian el linalool solo ni dentro de un producto de cannabis.',
        en: 'Studies on anxiety use whole lavender oil, inhaled or by mouth: some results are favorable, but many studies are of low quality. They do not study linalool alone or inside a cannabis product.' },
      { id: 'terpenos.mirceno-mango', tipo: 'quimica', fuente: LI_2017,
        es: 'Mirceno: es uno de los terpenos del aroma del mango. En una de las variedades estudiadas fue más de la mitad de los compuestos del aroma.',
        en: 'Myrcene: it is one of the terpenes in mango aroma. In one of the varieties studied it made up more than half of the aroma compounds.' },
      { id: 'terpenos.mirceno', tipo: 'laboratorio', fuente: SURENDRAN_2021,
        es: 'El mirceno contribuye al aroma; sus posibles efectos siguen en investigación. Se han visto posibles beneficios en animales, pero faltan estudios en personas.',
        en: 'Myrcene contributes to aroma; its possible effects are still being researched. Possible benefits have been seen in animals, but studies in people are lacking.' },
      { id: 'terpenos.mirceno-sueno', tipo: 'laboratorio', fuente: DO_VALE_2002,
        es: 'La idea de que el mirceno «da sueño» viene de estudios en ratones.',
        en: 'The idea that myrcene “makes you sleepy” comes from studies in mice.' },
      { id: 'terpenos.cariofileno-pimienta', tipo: 'quimica', fuente: DOSOKY_2019,
        es: 'β-cariofileno: es uno de los componentes principales del aceite esencial de pimienta negra.',
        en: 'β-caryophyllene: it is one of the main components of black pepper essential oil.' },
      { id: 'terpenos.cariofileno-cb2', tipo: 'laboratorio', fuente: GERTSCH_2008,
        es: 'En estudios de laboratorio, el β-cariofileno actúa sobre el receptor CB2, uno de los receptores de los cannabinoides.',
        en: 'In laboratory studies, β-caryophyllene acts on the CB2 receptor, one of the cannabinoid receptors.' },
      { id: 'terpenos.cariofileno-personas', tipo: 'personas', fuente: ALIZADEH_2022,
        es: 'En personas hay pocos ensayos y son pequeños, como uno con 52 mujeres. No bastan para afirmar un efecto.',
        en: 'In people there are few trials and they are small, such as one with 52 women. They are not enough to claim an effect.' },
    ],
  },
  {
    id: 'flavonoides', parte: 'abierta', moleculas: ['kuromanina'],
    titulo: { es: 'Lo que ves: los flavonoides', en: 'What you see: flavonoids' },
    afirmaciones: [
      { id: 'flavonoides.color', tipo: 'quimica', fuente: OLIVAS_2016,
        es: 'Algunos flavonoides dan color. Las antocianinas son flavonoides que dan tonos rojos, morados y azules a muchas frutas.',
        en: 'Some flavonoids give color. Anthocyanins are flavonoids that give red, purple and blue tones to many fruits.' },
      { id: 'flavonoides.kuromanina', tipo: 'quimica', fuente: OLIVAS_2016,
        es: 'La molécula que ves es la kuromanina (cianidina-3-glucósido), una de las antocianinas más extendidas en esas frutas.',
        en: 'The molecule you see is kuromanin (cyanidin-3-glucoside), one of the most widespread anthocyanins in those fruits.' },
      { id: 'flavonoides.cannabis', tipo: 'quimica', fuente: BASSOLINO_2023,
        es: 'El cannabis también puede tener antocianinas. Un estudio encontró kuromanina, aunque la más abundante fue otra parecida: la keracianina (cianidina-3-rutinósido).',
        en: 'Cannabis can also contain anthocyanins. One study found kuromanin, although the most abundant was a similar one: keracyanin (cyanidin-3-rutinoside).' },
      { id: 'flavonoides.morado', tipo: 'orientacion', fuente: KIM_2025,
        es: 'El color morado de una flor no indica potencia ni beneficio.',
        en: 'The purple color of a flower does not indicate potency or benefit.',
        motivo: 'Evita usar el color como señal de calidad. En un estudio, el morado dependió de la temperatura de cultivo; los autores sugieren que se regula por una vía distinta a la del CBD.' },
    ],
  },
  {
    id: 'arbol', parte: 'evipro', moleculas: ['cbga', 'thca', 'cbda', 'cbca', 'cbgva', 'thcva'],
    titulo: { es: 'El árbol familiar de los cannabinoides', en: 'The cannabinoid family tree' },
    afirmaciones: [
      { id: 'arbol.madre', tipo: 'quimica', fuente: KIM_2022,
        es: 'El CBGA es «la madre»: a partir de él, la planta fabrica THCA, CBDA y CBCA.',
        en: 'CBGA is “the mother”: from it, the plant makes THCA, CBDA and CBCA.' },
      { id: 'arbol.co2', tipo: 'quimica', fuente: KIM_2022,
        es: 'Con el calor, estos ácidos pierden CO₂ y se convierten en THC, CBD y CBC. El CBGA, al perder CO₂, da CBG.',
        en: 'With heat, these acids lose CO₂ and become THC, CBD and CBC. CBGA, when it loses CO₂, gives CBG.' },
      { id: 'arbol.varinas', tipo: 'quimica', fuente: KIM_2022,
        es: 'Hay una rama aparte, que parte de otro precursor: el CBGVA da THCVA, y este, al perder CO₂, da THCV.',
        en: 'There is a separate branch that starts from another precursor: CBGVA gives THCVA, which gives THCV when it loses CO₂.' },
      { id: 'arbol.cbn', tipo: 'quimica', fuente: KIM_2022,
        es: 'El CBN no sale de este árbol: aparece después, cuando el THC se oxida y se degrada.',
        en: 'CBN does not come from this tree: it appears later, when THC oxidizes and breaks down.' },
    ],
  },
  {
    id: 'calor', parte: 'evipro', moleculas: ['thca', 'thc'],
    titulo: { es: 'Qué hace el calor', en: 'What heat does' },
    afirmaciones: [
      { id: 'calor.experimento', tipo: 'laboratorio', fuente: FUENTE_WANG,
        es: 'En un estudio de laboratorio, extractos de cannabis se sometieron a cinco temperaturas, de 80 a 145 °C, hasta por 60 minutos, en un horno al vacío (sin oxígeno ni luz). Los compuestos se midieron por cromatografía.',
        en: 'In a laboratory study, cannabis extracts were held at five temperatures, from 80 to 145 °C, for up to 60 minutes, in a vacuum oven (no oxygen or light). The compounds were measured by chromatography.' },
      { id: 'calor.tiempos', tipo: 'laboratorio', fuente: FUENTE_WANG,
        es: 'El THCA perdió CO₂ y se convirtió en THC. A 110 °C casi no quedaba THCA a los 30 minutos; a 130 °C, a los 9, y a 145 °C, a los 6. Por debajo de 100 °C, la conversión no se completó en 60 minutos.',
        en: 'THCA lost CO₂ and became THC. At 110 °C almost no THCA was left after 30 minutes; at 130 °C, after 9, and at 145 °C, after 6. Below 100 °C, the conversion was not complete within 60 minutes.' },
      { id: 'calor.recuperado', tipo: 'laboratorio', fuente: FUENTE_WANG,
        es: 'No todo se vuelve THC: a 110 °C, cerca de 92 % se recuperó como THC.',
        en: 'Not all of it becomes THC: at 110 °C, about 92% was recovered as THC.' },
      { id: 'calor.comparacion', tipo: 'laboratorio', fuente: FUENTE_WANG,
        es: 'El THCA se convirtió alrededor del doble de rápido que el CBDA y el CBGA.',
        en: 'THCA converted about twice as fast as CBDA and CBGA.' },
      { id: 'calor.no-receta', tipo: 'orientacion',
        es: 'Estas cifras describen ese experimento, no una receta.',
        en: 'These figures describe that experiment, not a recipe.',
        motivo: 'El simulador no debe leerse como guía para descarboxilar en casa (antiobjetivo del módulo).' },
    ],
  },
  {
    id: 'isomeros', parte: 'evipro', moleculas: ['thc', 'cbd'],
    titulo: { es: 'THC y CBD, lado a lado', en: 'THC and CBD, side by side' },
    afirmaciones: [
      { id: 'isomeros.thc', tipo: 'quimica', fuente: PUBCHEM_THC,
        es: 'THC: fórmula C₂₁H₃₀O₂, con un anillo que contiene oxígeno y está cerrado.',
        en: 'THC: formula C₂₁H₃₀O₂, with a ring that contains oxygen and is closed.' },
      { id: 'isomeros.cbd', tipo: 'quimica', fuente: PUBCHEM_CBD,
        es: 'CBD: misma fórmula molecular (C₂₁H₃₀O₂), distinta estructura. En el CBD, ese anillo está abierto.',
        en: 'CBD: same molecular formula (C₂₁H₃₀O₂), different structure. In CBD, that ring is open.' },
      { id: 'isomeros.efectos', tipo: 'personas', fuente: BABALONIS_2017,
        es: 'El THC es intoxicante: puede marearte o «volarte». El CBD no es intoxicante: no te «vuela». En un estudio con 31 personas que usaban cannabis a menudo, el CBD por boca se comportó como el placebo, a diferencia del cannabis con THC.',
        en: 'THC is intoxicating: it can make you dizzy or “high”. CBD is not intoxicating: it does not get you “high”. In a study with 31 people who used cannabis often, CBD by mouth behaved like the placebo, unlike cannabis with THC.' },
    ],
  },
  {
    id: 'degradacion', parte: 'evipro', moleculas: ['thc', 'cbn'],
    titulo: { es: 'Cuando el producto envejece', en: 'When the product ages' },
    afirmaciones: [
      { id: 'degradacion.cbn', tipo: 'quimica', fuente: FUENTE_WANG,
        es: 'Con el oxígeno y la luz, el THC se oxida y una parte se convierte en CBN.',
        en: 'With oxygen and light, THC oxidizes and part of it turns into CBN.' },
      { id: 'degradacion.cuatro-anios', tipo: 'laboratorio', fuente: ZAMENGO_2019,
        es: 'El tiempo y el calor también cuentan. En un estudio de cuatro años, el THC guardado a temperatura ambiente bajó de forma importante, con luz o sin ella, y se formó CBN.',
        en: 'Time and heat also matter. In a four-year study, THC stored at room temperature dropped considerably, with or without light, and CBN formed.' },
      { id: 'degradacion.sin-reloj', tipo: 'laboratorio', fuente: ZAMENGO_2019,
        es: 'No hay un reloj fijo: la temperatura cambia la velocidad, y la luz cambia la velocidad y cuánto THC termina como CBN.',
        en: 'There is no fixed clock: temperature changes the speed, and light changes both the speed and how much THC ends up as CBN.' },
      { id: 'degradacion.guardar', tipo: 'orientacion', fuente: ZAMENGO_2019,
        es: 'Guarda el producto bien cerrado, en un lugar oscuro y fresco.',
        en: 'Store the product tightly closed, in a dark, cool place.',
        motivo: 'Consejo práctico: la luz y la temperatura aceleran la degradación del THC, y el CBN se forma cuando el THC se oxida.' },
    ],
  },
  {
    id: 'menores', parte: 'evipro', moleculas: ['cbg', 'cbn', 'cbc', 'thcv'],
    titulo: { es: 'Cannabinoides menores', en: 'Minor cannabinoids' },
    afirmaciones: [
      { id: 'menores.cbg-ansiedad', tipo: 'personas', fuente: CUTTLER_2024,
        es: 'CBG y ansiedad: en un ensayo pequeño con 34 adultos sanos, la ansiedad y el estrés bajaron más con CBG que con placebo. Es preliminar y falta confirmarlo.',
        en: 'CBG and anxiety: in a small trial with 34 healthy adults, anxiety and stress dropped more with CBG than with placebo. It is preliminary and needs confirmation.' },
      { id: 'menores.cbn-sueno', tipo: 'personas', fuente: LAVENDER_2026,
        es: 'CBN y sueño: pocos estudios en personas, resultados no concluyentes. En un ensayo de una noche con 20 adultos con insomnio, el CBN no cambió la medida principal del sueño; con la cantidad más alta mejoraron algunas medidas secundarias.',
        en: 'CBN and sleep: few studies in people, inconclusive results. In a one-night trial with 20 adults with insomnia, CBN did not change the main sleep measure; with the highest amount, some secondary measures improved.' },
      { id: 'menores.cbc', tipo: 'laboratorio', fuente: ELBOUZIDI_2026,
        es: 'CBC: sus posibles efectos, por ejemplo sobre la inflamación o el dolor, se han estudiado sobre todo en laboratorio y en animales.',
        en: 'CBC: its possible effects, for example on inflammation or pain, have been studied mainly in the laboratory and in animals.' },
      { id: 'menores.cbc-personas', tipo: 'personas', fuente: SALESKA_2024,
        es: 'En personas casi no hay estudios, y los que hay no permiten saber si el CBC tiene esos efectos. En un ensayo sobre sueño, sumar CBN y CBC al CBD no dio más beneficio que el CBD solo.',
        en: 'In people there are almost no studies, and those that exist do not show whether CBC has those effects. In a sleep trial, adding CBN and CBC to CBD gave no more benefit than CBD alone.' },
      { id: 'menores.thcv-thc', tipo: 'personas', fuente: ELDER_2026,
        es: 'THCV y THC: estudios recientes en personas sugieren que el THCV puede reducir algunos efectos del THC. La evidencia todavía es muy limitada.',
        en: 'THCV and THC: recent studies in people suggest that THCV may reduce some effects of THC. The evidence is still very limited.' },
      { id: 'menores.thcv-apetito', tipo: 'laboratorio', fuente: HAGHDOOST_2025,
        es: 'THCV, apetito y azúcar en sangre: hay resultados en estudios de laboratorio y animales, pero pocos estudios en personas.',
        en: 'THCV, appetite and blood sugar: there are results in laboratory and animal studies, but few studies in people.' },
    ],
  },
]

export const PREGUNTAS: Pregunta[] = [
  {
    id: 'repaso.volar', parte: 'todos',
    enunciado: { es: '¿Cuál te puede «volar»: el THC o el CBD?', en: 'Which one can get you “high”: THC or CBD?' },
    opciones: [{ es: 'El THC', en: 'THC' }, { es: 'El CBD', en: 'CBD' }, { es: 'Los dos por igual', en: 'Both equally' }],
    correcta: 0,
    explicacion: {
      es: 'El THC es intoxicante y puede marearte o «volarte». El CBD no es intoxicante, pero tampoco anula al THC.',
      en: 'THC is intoxicating and can make you dizzy or “high”. CBD is not intoxicating, but it does not cancel out THC either.',
    },
  },
  {
    id: 'repaso.terpenos', parte: 'abierta',
    enunciado: { es: '¿Qué aportan los terpenos?', en: 'What do terpenes contribute?' },
    opciones: [
      { es: 'Contribuyen al aroma; sus posibles efectos siguen en investigación', en: 'They contribute to aroma; their possible effects are still being researched' },
      { es: 'Hacen que el producto sea más potente', en: 'They make the product stronger' },
      { es: 'Tienen efectos comprobados, como relajar o dar energía', en: 'They have proven effects, like relaxing you or giving you energy' },
    ],
    correcta: 0,
    explicacion: {
      es: 'Los terpenos dan parte del aroma. Algunos tienen estudios pequeños o en animales, pero eso no basta para decir que relajan, dan energía o hacen más potente el producto.',
      en: 'Terpenes provide part of the aroma. Some have small or animal studies, but that is not enough to say they relax you, give you energy or make the product stronger.',
    },
  },
  {
    id: 'repaso.calor', parte: 'evipro',
    enunciado: { es: '¿Qué hace el calor con el THCA?', en: 'What does heat do to THCA?' },
    opciones: [
      { es: 'Le quita CO₂ y lo convierte en THC', en: 'It removes CO₂ and turns it into THC' },
      { es: 'Lo convierte en CBD', en: 'It turns it into CBD' },
      { es: 'No le hace nada', en: 'Nothing' },
    ],
    correcta: 0,
    explicacion: {
      es: 'Con el calor, el THCA pierde CO₂ y se convierte en THC. En el estudio de laboratorio, a 110 °C cerca de 92 % se recuperó como THC: no todo.',
      en: 'With heat, THCA loses CO₂ and becomes THC. In the laboratory study, at 110 °C about 92% was recovered as THC: not all of it.',
    },
  },
]

const PARTES: Record<NivelModulo, Parte[]> = { completo: ['todos', 'abierta', 'evipro'], parcial: ['todos', 'abierta'], sin_acceso: [] }

export const seccionesPara = (nivel: NivelModulo): Seccion[] => SECCIONES.filter(s => PARTES[nivel].includes(s.parte))
export const preguntasPara = (nivel: NivelModulo): Pregunta[] => PREGUNTAS.filter(p => PARTES[nivel].includes(p.parte))

export function fuentesDe(secciones: Seccion[]): Fuente[] {
  const unicas = new Map<string, Fuente>()
  for (const { fuente } of secciones.flatMap(s => s.afirmaciones)) {
    const clave = fuente && (fuente.pmid ?? fuente.doi ?? fuente.url)
    if (fuente && clave && !unicas.has(clave)) unicas.set(clave, fuente)
  }
  return [...unicas.values()]
}
