// El progreso vive solo en memoria; no se guardan respuestas.
export function createLearning(doc, actions) {
  const $ = id => doc.getElementById(id);
  const panel = $('learning-panel');
  let mode = null, step = 0, ready = false, solved = false, version = 0, opener;
  const guides = [
    ['Gira el frasco', 'Arrastra sobre el modelo o usa los botones Girar a la izquierda y Girar a la derecha.'],
    ['Explora el gotero', 'Mueve la barra Abrir el frasco: bulbo, tapa y pipeta se desplazan juntos. Puedes abrirlo y cerrarlo.'],
    ['Descubre el CBD', 'Gira la molécula en 3D, abre la referencia con el botón de estructuras en plano y activa Mostrar hidrógenos.'],
  ];
  const challenges = [
    ['Encuentra oxígeno', 'Toca un átomo del modelo o elige su símbolo. La leyenda también te ayuda.'],
    ['Otra orientación', 'Solo hemos girado la cámara. ¿Sigue siendo la misma molécula de CBD?'],
    ['Descubre los hidrógenos', 'Activa Mostrar hidrógenos en el control del visor.'],
  ];
  function feedback(text) { $('learning-feedback').textContent = text; }
  function complete(text) {
    if (!ready || solved) return;
    solved = true; feedback(text); $('learning-next').disabled = false;
  }
  function close(returnFocus = true) {
    ++version; mode = null; ready = false;
    actions.cancelPending(); actions.highlightElement(null);
    panel.hidden = true;
    if (returnFocus) opener?.focus();
  }
  async function show(focus = true) {
    const current = ++version;
    ready = false; solved = false; actions.cancelPending(); actions.highlightElement(null);
    const [title, text] = (mode === 'guide' ? guides : challenges)[step];
    panel.hidden = false;
    panel.innerHTML = `<div class="learning-heading"><h2 id="learning-title" tabindex="-1">${mode === 'guide' ? 'Cómo explorar' : 'Detective molecular'} · ${step + 1}/3</h2><button id="learning-close" type="button">Cerrar</button></div><h3>${title}</h3><p>${text}</p><div id="learning-answers"></div><p id="learning-feedback" role="status">Preparando la vista…</p><button id="learning-next" type="button" disabled>${step === 2 ? 'Seguir explorando' : 'Siguiente'}</button>`;
    $('learning-close').onclick = () => close();
    $('learning-next').onclick = async () => {
      if (!ready || (mode === 'game' && !solved)) return;
      ready = false;
      if (step < 2) { ++step; await show(); }
      else if (mode === 'guide') close();
      else {
        actions.highlightElement(null);
        panel.innerHTML = '<h2 id="learning-title" tabindex="-1">Completaste los tres retos</h2><p>Reconociste oxígeno, una nueva orientación y los hidrógenos del CBD. La forma no permite deducir dosis, tratamientos ni efectos clínicos.</p><button id="learning-restart" type="button">Repetir</button> <button id="learning-close" type="button">Seguir explorando</button>';
        $('learning-restart').onclick = () => { step = 0; show(); };
        $('learning-close').onclick = () => close();
        $('learning-title').focus();
      }
    };
    if (focus) $('learning-title').focus();
    let ok = false;
    try { ok = await (mode === 'guide' ? actions.showGuideStep(step) : actions.showGameStep(step)); } catch { /* El panel muestra el fallo sin avanzar. */ }
    if (current !== version || !mode) return;
    if (!ok) { feedback('No pudimos cargar esta vista. Cierra el panel y vuelve a intentarlo al recargar.'); return; }
    ready = true; feedback('Explora a tu ritmo.');
    if (mode === 'guide') {
      actions.highlightElement(['.view-tools', '#explosion-controls', '#molecule-controls'][step]);
      $('learning-next').disabled = false;
    } else if (step === 0) {
      $('learning-answers').innerHTML = '<button type="button" id="answer-carbon">C · Carbono</button> <button type="button" id="answer-oxygen">O · Oxígeno</button> <button type="button" id="answer-hydrogen">H · Hidrógeno</button> <button type="button" id="learning-hint">Pista</button>';
      $('answer-carbon').onclick = () => atom(6);
      $('answer-oxygen').onclick = () => atom(8);
      $('answer-hydrogen').onclick = () => atom(1);
      $('learning-hint').onclick = () => feedback('Busca las esferas rojizas de oxígeno, símbolo O. Puedes elegir O con el teclado.');
    } else if (step === 1) {
      $('learning-answers').innerHTML = '<button type="button" id="answer-same">Sí, sigue siendo CBD</button> <button type="button" id="answer-different">Es otra molécula</button>';
      $('answer-same').onclick = () => complete('¡Sí! Girar la cámara no cambia los átomos, enlaces ni la estereoquímica.');
      $('answer-different').onclick = () => feedback('Prueba otra vez: solo cambió el punto de vista.');
    } else { actions.highlightElement('#molecule-controls'); }
  }
  function atom(element) {
    if (mode !== 'game' || step !== 0 || !ready || solved) return;
    if (element === 8) complete('¡Encontraste oxígeno! O es su símbolo.');
    else feedback('Prueba otra vez. Busca oxígeno en la leyenda o pide una pista.');
  }
  function hydrogens(visible) {
    if (mode === 'game' && step === 2 && visible) complete('¡Listo! Cambió la visibilidad, no la composición de la molécula.');
  }
  function start(next, button) {
    close(false); mode = next; step = 0; opener = button;
    actions.showHydrogens(false); show();
  }
  $('start-guide').onclick = event => start('guide', event.currentTarget);
  $('start-game').onclick = event => start('game', event.currentTarget);
  doc.body.addEventListener('keydown', event => {
    if (mode && event.key === 'Escape' && !doc.querySelector('dialog[open]')) { event.stopPropagation(); close(); }
  });
  return { atom, hydrogens, close };
}

// Mide el desplazamiento máximo, incluso si el dedo vuelve al origen.
export function createTapTracker() {
  const pointers = new Set();
  let start = null;
  function move(event) {
    if (start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) start = null;
  }
  return {
    down(event) {
      pointers.add(event.pointerId);
      if (pointers.size === 1 && event.button === 0) start = { id: event.pointerId, x: event.clientX, y: event.clientY };
      else start = null;
    },
    move,
    cancel(event) { pointers.delete(event.pointerId); start = null; },
    up(event) {
      move(event);
      const tap = start?.id === event.pointerId && pointers.size === 1;
      pointers.delete(event.pointerId); start = null;
      return Boolean(tap);
    },
  };
}
