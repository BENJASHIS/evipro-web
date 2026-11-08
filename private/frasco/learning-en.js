// El progreso vive solo en memoria; no se guardan respuestas.
export function createLearning(doc, actions) {
  const $ = id => doc.getElementById(id);
  const panel = $("learning-panel");
  let mode = null, step = 0, ready = false, solved = false, version = 0, opener;
  const guides = [
    ["Rotate the bottle", "Drag over the model or use the Rotate left and Rotate right buttons."],
    ["Explore the dropper", "Move the Open the bottle slider: bulb, cap and pipette move together. You can open and close it."],
    ["Discover CBD", "Rotate the molecule in 3D, open the reference using the 2D structures button and enable Show hydrogens."],
  ];
  const challenges = [
    ["Find oxygen", "Tap an atom in the model or choose its symbol. The legend can help too."],
    ["Another orientation", "We only rotated the camera. Is it still the same CBD molecule?"],
    ["Discover the hydrogens", "Enable Show hydrogens in the viewer controls."],
  ];
  function feedback(text) { $("learning-feedback").textContent = text; }
  function complete(text) {
    if (!ready || solved) return;
    solved = true; feedback(text); $("learning-next").disabled = false;
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
    const [title, text] = (mode === "guide" ? guides : challenges)[step];
    panel.hidden = false;
    panel.innerHTML = `<div class="learning-heading"><h2 id="learning-title" tabindex="-1">${mode === "guide" ? "How to explore" : "Molecular detective"} · ${step + 1}/3</h2><button id="learning-close" type="button">Close</button></div><h3>${title}</h3><p>${text}</p><div id="learning-answers"></div><p id="learning-feedback" role="status">Preparing the view…</p><button id="learning-next" type="button" disabled>${step === 2 ? "Keep exploring" : "Next"}</button>`;
    $("learning-close").onclick = () => close();
    $("learning-next").onclick = async () => {
      if (!ready || (mode === "game" && !solved)) return;
      ready = false;
      if (step < 2) { ++step; await show(); }
      else if (mode === "guide") close();
      else {
        actions.highlightElement(null);
        panel.innerHTML = "<h2 id=\"learning-title\" tabindex=\"-1\">You completed all three challenges</h2><p>You identified oxygen, a new orientation and the hydrogens in CBD. Shape cannot be used to infer doses, treatments or clinical effects.</p><button id=\"learning-restart\" type=\"button\">Try again</button> <button id=\"learning-close\" type=\"button\">Keep exploring</button>";
        $("learning-restart").onclick = () => { step = 0; show(); };
        $("learning-close").onclick = () => close();
        $("learning-title").focus();
      }
    };
    if (focus) $("learning-title").focus();
    let ok = false;
    try { ok = await (mode === "guide" ? actions.showGuideStep(step) : actions.showGameStep(step)); } catch { /* El panel muestra el fallo sin avanzar. */ }
    if (current !== version || !mode) return;
    if (!ok) { feedback("We could not load this view. Close the panel and try again after reloading."); return; }
    ready = true; feedback("Explore at your own pace.");
    if (mode === "guide") {
      actions.highlightElement([".view-tools", "#explosion-controls", "#molecule-controls"][step]);
      $("learning-next").disabled = false;
    } else if (step === 0) {
      $("learning-answers").innerHTML = "<button type=\"button\" id=\"answer-carbon\">C · Carbon</button> <button type=\"button\" id=\"answer-oxygen\">O · Oxygen</button> <button type=\"button\" id=\"answer-hydrogen\">H · Hydrogen</button> <button type=\"button\" id=\"learning-hint\">Hint</button>";
      $("answer-carbon").onclick = () => atom(6);
      $("answer-oxygen").onclick = () => atom(8);
      $("answer-hydrogen").onclick = () => atom(1);
      $("learning-hint").onclick = () => feedback("Look for the reddish oxygen spheres, symbol O. You can choose O with the keyboard.");
    } else if (step === 1) {
      $("learning-answers").innerHTML = "<button type=\"button\" id=\"answer-same\">Yes, it is still CBD</button> <button type=\"button\" id=\"answer-different\">It is a different molecule</button>";
      $("answer-same").onclick = () => complete("Yes! Rotating the camera does not change atoms, bonds or stereochemistry.");
      $("answer-different").onclick = () => feedback("Try again: only the viewpoint changed.");
    } else { actions.highlightElement("#molecule-controls"); }
  }
  function atom(element) {
    if (mode !== "game" || step !== 0 || !ready || solved) return;
    if (element === 8) complete("You found oxygen! O is its symbol.");
    else feedback("Try again. Look for oxygen in the legend or ask for a hint.");
  }
  function hydrogens(visible) {
    if (mode === "game" && step === 2 && visible) complete("Done! Visibility changed, not the composition of the molecule.");
  }
  function start(next, button) {
    close(false); mode = next; step = 0; opener = button;
    actions.showHydrogens(false); show();
  }
  $("start-guide").onclick = event => start("guide", event.currentTarget);
  $("start-game").onclick = event => start("game", event.currentTarget);
  doc.body.addEventListener("keydown", event => {
    if (mode && event.key === "Escape" && !doc.querySelector("dialog[open]")) { event.stopPropagation(); close(); }
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
