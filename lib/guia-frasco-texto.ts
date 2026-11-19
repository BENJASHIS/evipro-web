// Texto educativo de la guía del frasco. Versión v02 (output/guia-frasco-sublingual-v02-2026-11-19/),
// en revisión de Carlos: se reemplaza por la versión aprobada antes de crear FRASCO_GUIDE_SECRET en Vercel.
// Las instrucciones de uso no van aquí: salen de core (lib/guia-frasco-core.json).
export const GUIA_TEXTO = {
  version: 'v02-2026-11-19',
  porcentajes: [
    'El THC (tetrahidrocannabinol) y el CBD (cannabidiol) son dos componentes de la planta de cannabis. Tu frasco dice cuánto tiene de cada uno.',
    'El THC es el que puede producir la sensación de estar bajo los efectos del cannabis.',
    'El CBD no produce esa sensación, pero también actúa en el cuerpo y puede causar efectos no deseados.',
    'El porcentaje dice cuánto hay en el aceite. Para pasarlo a miligramos por mililitro, multiplícalo por 10: CBD 10 % quiere decir 100 mg de CBD en cada mililitro.',
    'Ese número es la concentración: cuánto hay en el frasco. La dosis es cuánto tomas tú, y la indica tu receta.',
  ],
  porQue: [
    'No todas las enfermedades se tratan con la misma combinación: para algunas se usa solo CBD y para otras se suma THC.',
    'Tu médico elige la combinación según lo que se trata y según tu caso.',
    'Los especialistas recomiendan empezar con poco y subir de a pocos, según cómo respondes. Así se busca la cantidad que te ayude con menos molestias.',
    'Con dosis más altas, el riesgo de efectos no deseados probablemente aumenta.',
    'Por eso tu frasco puede tener un porcentaje bajo al comienzo. Si hace falta, tu médico lo cambia en un control.',
    'Un porcentaje más alto no demuestra que un producto sea mejor para tu caso.',
    'Sube la cantidad solo como lo indica tu receta, no por tu cuenta.',
    'Bajo la lengua, el efecto puede tardar de 30 minutos a 2 horas en empezar: no tomes más mientras esperas.',
  ],
  avisar: [
    'Si tienes efectos molestos, como sueño o cansancio, boca seca, náuseas, diarrea o menos apetito, avísale al médico que te lo indicó.',
    'Si notas la piel o los ojos amarillos, la orina oscura o dolor en la parte alta derecha del abdomen, avísale ese mismo día.',
    'Antes de empezar, cambiar o dejar otro medicamento o suplemento, cuéntaselo: el cannabis puede interactuar con otros medicamentos, sobre todo con anticoagulantes y con medicamentos para la epilepsia o para dormir.',
    'Si quedas embarazada, buscas un embarazo o estás dando de lactar, avísale: en el embarazo y la lactancia se recomienda evitar el CBD y el THC.',
    'Esta guía es general. Si cambia algo de tu salud, como una enfermedad nueva, cuéntaselo también.',
  ],
  // Carlos (19-nov): los efectos intensos se avisan primero al médico (farmacovigilancia); emergencia
  // si hay un signo de urgencia de las alarmas del seguimiento o se combinó con otros productos.
  urgente: [
    'Si los efectos son intensos, escríbele a tu médico para que te indique qué hacer y quede registrado.',
    'Ve a emergencia o llama al 106 (SAMU) si te falta el aire, tienes dolor de pecho o te desmayas, tienes una convulsión, se te hinchan la cara o los labios, o no te pueden despertar; también si lo combinaste con otros medicamentos, alcohol u otros productos no indicados. Después avísale a tu médico.',
    'Si un niño toma el aceite por accidente, llévalo a emergencia o llama al 106 con el frasco, y avísale a tu médico.',
  ],
}
