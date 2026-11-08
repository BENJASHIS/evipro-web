import { createLearning, createTapTracker } from "./learning-en.js";
import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { createDropper, updateDropper } from "./dropper.js";
import { buildCap, threadGeometry } from "./cap.js";
import { composition, fromRatio, formatNumber } from "./composition-en.js";
import { PANEL_CENTERS, labelCamera, shortestTurn, fitDiagram } from "./label-panels.js";

// El servidor entrega un HTML y una lista de recursos limitados para el acceso gratuito.
const CBD_ONLY = document.documentElement.dataset.cbdOnly === "true";
const KINDS = CBD_ONLY ? ["cbd"] : ["cbd", "thc"];
const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const descriptions = {
  bottle: ["04 / THE BOTTLE", "Amber glass.", "The 10 mL bottle is the starting point. Drag it to see its shape from any angle.", "Illustrative geometry based on photographs. It is not a manufacturing drawing."],
  bulb: ["01 / DROPPER DETAIL", "The top of the dropper.", "Zoom in on the bulb to see its shape and rubber texture. Bulb, cap and pipette stay attached when opening the bottle.", "The close-up shows part of the assembly without taking it apart."],
  cap: ["02 / DROPPER DETAIL", "Texture and closure.", "Explore the ridges on the cap. When opened, the whole dropper rises, revealing the bottle neck.", "The thread and its dimensions are illustrative; they are not manufacturing specifications."],
  pipette: ["03 / DROPPER DETAIL", "Glass, up close.", "The pipette stays attached to the cap and bulb. The glass and illustrative liquid become visible when the whole dropper is removed.", "No numbers or graduations. No volume per drop is assumed."],
  cbd: ["05 / CANNABIDIOL", "CBD, up close.", "Explore a reference 3D conformation of cannabidiol: C₂₁H₃₀O₂. Rotate the model and show hydrogens to see all its atoms.", "Source: PubChem, CID 644019. Computed conformation; illustrative colours and sizes. It is not a measurement of this preparation."],
  thc: ["06 / Δ9-THC", "Δ9-THC, up close.", "Explore a reference 3D conformation of Δ9-tetrahydrocannabinol: C₂₁H₃₀O₂. Rotate the model and show hydrogens to see its atoms.", "Source: PubChem, CID 16078. Identity and stereochemistry verified. It does not represent effects or a measurement of the preparation."],
};

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $("scene"), antialias: true, alpha: true });
} catch (error) {
  $("loading").hidden = true;
  $("error").hidden = false;
  document.querySelectorAll("button,input").forEach((element) => { element.disabled = true; });
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setClearColor(0xf4f0e8, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .95;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
const environment = pmrem.fromScene(room, 0.04);
scene.environment = environment.texture;
scene.environmentIntensity = .8;
room.dispose();
pmrem.dispose();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
camera.position.set(0, 2.3, 7.2);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.9, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.enablePan = false;
controls.minDistance = 3.4;
controls.maxDistance = 14;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = Math.PI * 0.74;
const hemisphere = new THREE.HemisphereLight(0xfff7e6, 0x787865, 1.5);
scene.add(hemisphere);
const key = new THREE.DirectionalLight(0xffedcf, 3);
key.position.set(-3, 6, 5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -4;
key.shadow.bias = -0.001;
key.shadow.normalBias = 0.025;
scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 3);
rim.position.set(3, 4, -3);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xffffff, 1.5);
fill.position.set(4, 2, 5);
scene.add(fill);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x57412d, opacity: 0.14 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.04;
floor.receiveShadow = true;
scene.add(floor);

const product = new THREE.Group();
const molecule = new THREE.Group();
molecule.position.y = 1.9;
molecule.visible = false;
scene.add(product, molecule);
const pieces = {};
for (const name of ["bottle", "bulb", "cap", "pipette"]) {
  pieces[name] = new THREE.Group();
  pieces[name].userData.part = name;
  product.add(pieces[name]);
}
const dropper = createDropper(pieces);
product.add(dropper);
const amber = new THREE.MeshPhysicalMaterial({ color: 0x50240b, roughness: .07, metalness: 0, transmission: .75, thickness: .12, attenuationColor: 0x773306, attenuationDistance: .3, ior: 1.48, clearcoat: 1, clearcoatRoughness: .06 });
const black = new THREE.MeshStandardMaterial({ color: 0x080908, roughness: .32, metalness: 0 });
const grain = new Uint8Array(128 * 128);
let grainSeed = 17;
for (let i = 0; i < grain.length; i++) {
  grainSeed = (Math.imul(grainSeed, 1664525) + 1013904223) >>> 0;
  grain[i] = 100 + (grainSeed % 85);
}
const rubberBump = new THREE.DataTexture(grain, 128, 128, THREE.RedFormat);
rubberBump.wrapS = rubberBump.wrapT = THREE.RepeatWrapping;
rubberBump.repeat.set(6, 6); rubberBump.needsUpdate = true;
const rubber = new THREE.MeshStandardMaterial({ color: 0x080908, roughness: .68, bumpMap: rubberBump, bumpScale: .0015 });
// Thin nested glass walls use alpha to avoid screen-space refraction artifacts.
const glass = new THREE.MeshPhysicalMaterial({ color: 0xaab9ba, roughness: .025, transparent: true, opacity: .16, depthWrite: false, ior: 1.46, specularIntensity: 1.25, clearcoat: 1, clearcoatRoughness: .035 });
function mesh(geometry, material, parent, y = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.y = y;
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
function lathe(points, material, parent) {
  return mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 96), material, parent);
}
lathe([[0, 0], [.5, 0], [.59, .025], [.64, .09], [.655, .17], [.655, 1.65], [.64, 1.77], [.59, 1.87], [.47, 1.98], [.38, 2.06], [.37, 2.18], [.37, 2.36], [.34, 2.4], [.3, 2.4], [.3, 2.15], [.34, 2.04], [.45, 1.94], [.56, 1.82], [.59, 1.65], [.59, .17], [.5, .12], [0, .12]], amber, pieces.bottle);
// shortcut: thread pitch is illustrative; use measured CAD for manufacturing fidelity.
mesh(threadGeometry(.378, 2.13, .25, 2.1, .018), amber, pieces.bottle);
mesh(new THREE.CylinderGeometry(.577, .577, 1.28, 72), new THREE.MeshPhysicalMaterial({ color: 0xc18b28, roughness: .18, transmission: .32, thickness: .8, transparent: true, opacity: .6 }), pieces.bottle, .8);

function labelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096; canvas.height = 1400;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  const load = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The label illustrations could not be loaded. Reload the viewer."));
    image.src = url;
  });
  Promise.all(KINDS.map(kind => load(`./assets/${kind}-reference.svg?v=20261108-wikipedia-v11`))).then(([cbdImage, thcImage]) => {
    let current = composition(10, 0);
    function paint(c) {
      ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0, 0, 4096, 1400);
      const text = (value, x, y, size, bold = false) => {
        ctx.fillStyle = "#172e28"; ctx.textAlign = "center";
        ctx.font = `${bold ? "bold " : ""}${size}px DejaVu Sans`;
        const width = ctx.measureText(value).width;
        if (width > 1100) ctx.font = `${bold ? "bold " : ""}${size*1100/width}px DejaVu Sans`;
        ctx.fillText(value, x, y);
      };
      const front = PANEL_CENTERS.composition;
      text("COMPOSITION", front, 210, 95);
      text(`CBD ${formatNumber(c.cbd)} %`, front, 540, 215, true);
      if (!CBD_ONLY) text(`THC ${formatNumber(c.thc)} %`, front, 800, 215, true);
      if (!CBD_ONLY) text(`THC:CBD  ${c.ratio}`, front, 980, 75);
      text(`CBD ${formatNumber(c.cbdMgMl)} mg/mL`, front, 1100, 90);
      if (!CBD_ONLY) text(`THC ${formatNumber(c.thcMgMl)} mg/mL`, front, 1210, 90);
      text("10 mL", front, 1360, 100);
      for (const [kind,image,name] of [["cbd",cbdImage,"CANNABIDIOL"],["thc",thcImage,"Δ9-TETRAHYDROCANNABINOL"]]) {
        if (!KINDS.includes(kind)) continue;
        const x = PANEL_CENTERS[kind];
        text(kind === "cbd" ? "CBD" : "Δ9-THC", x, 155, 110, true);
        text(name, x, 280, 68);
        const size = fitDiagram(image.naturalWidth, image.naturalHeight);
        ctx.drawImage(image, x-size.width/2, 290+(676-size.height)/2, size.width, size.height);
        text("REFERENCE STRUCTURE", x, 1000, 52);
        text(`${formatNumber(c[kind])} %`, x, 1160, 180, true);
        text(`${formatNumber(c[`${kind}MgMl`])} mg/mL`, x, 1300, 95);
      }
      texture.needsUpdate = true;
    }
    function apply(c, editing = null) {
      current = c; paint(c);
      for (const kind of ["cbd", "thc"]) {
        if (editing !== $(`${kind}-percent`)) $(`${kind}-percent`).value = String(c[kind]);
        $(`${kind}-range`).value = String(c[kind]);
      }
      $("ratio-result").value = c.ratio;
      const parts = c.total ? c.ratio.split(":") : ["0", "0"];
      $("ratio-thc").value = parts[0]; $("ratio-cbd").value = parts[1];
      $("composition-total").value = `Combined concentration: ${formatNumber(c.total)} %`;
      $("composition-mgml").value = `In each mL of oil: CBD ${formatNumber(c.cbdMgMl)} mg · THC ${formatNumber(c.thcMgMl)} mg`;
      $("composition-error").hidden = true;
      document.querySelectorAll("#composition-controls [aria-invalid]").forEach(input => input.removeAttribute("aria-invalid"));
      $("composition-status").textContent = c.total ? "Label updated · illustrative composition." : "Both values are zero; the ratio is undefined.";
    }
    if (CBD_ONLY) {
      paint(current);
      $("composition-status").textContent = "Fixed 10% CBD example · educational use, no doses.";
      return;
    }
    const attempt = (calculate, inputs, editing = null) => {
      try { apply(calculate(), editing); } catch (error) {
        $("composition-error").textContent = `Not applied: ${error.message}`;
        $("composition-error").hidden = false;
        inputs.forEach(input => input.setAttribute("aria-invalid", "true"));
      }
    };
    for (const kind of ["cbd", "thc"]) for (const control of ["percent", "range"]) {
      const input = $(`${kind}-${control}`);
      input.addEventListener("input", () => attempt(() => composition(kind === "cbd" ? input.valueAsNumber : current.cbd, kind === "thc" ? input.valueAsNumber : current.thc), [input], input));
    }
    $("apply-ratio").addEventListener("click", () => attempt(() => fromRatio(current.total, $("ratio-thc").valueAsNumber, $("ratio-cbd").valueAsNumber), [$("ratio-thc"), $("ratio-cbd")]));
    const presets = { thc: [1,9], balanced: [5,5], cbd: [9,1] };
    document.querySelectorAll("[data-preset]").forEach(button => button.addEventListener("click", () => apply(composition(...presets[button.dataset.preset]))));
    $("restore-v04").addEventListener("click", () => apply(composition(10,0)));
    apply(current); $("composition-controls").disabled = false;
  }).catch(error => { $("composition-status").textContent = error.message; $("error").textContent = error.message; $("error").hidden = false; });
  return texture;
}
mesh(new THREE.CylinderGeometry(.663, .663, 1.38, 144, 1, true, Math.PI), new THREE.MeshBasicMaterial({ map: labelTexture(), side: THREE.DoubleSide, toneMapped: false }), pieces.bottle, .88);
pieces.cap.add(buildCap(black));
lathe([[0, 2.75], [0.25, 2.75], [0.255, 2.78], [0.24, 2.84], [0.23, 2.94], [0.225, 3.4], [0.218, 3.52], [0.19, 3.63], [0.14, 3.7], [0.07, 3.74], [0, 3.75]], rubber, pieces.bulb);
lathe([[0.05, 0.48], [0.065, 0.486], [0.075, 0.5], [0.078, 0.52], [0.074, 0.54], [0.06, 0.552], [0.048, 0.558], [0.046, 0.575], [0.05, 0.59], [0.068, 0.61], [0.092, 0.64], [0.105, 0.66], [0.105, 0.69], [0.105, 2.64], [0.105, 2.67], [0.093, 2.67], [0.093, 2.64], [0.093, 0.69], [0.093, 0.67], [0.08, 0.65], [0.055, 0.62], [0.036, 0.6], [0.032, 0.58], [0.032, 0.56], [0.04, 0.54], [0.044, 0.52], [0.041, 0.5], [0.036, 0.48], [0.05, 0.48]], glass, pieces.pipette);
lathe([[0, 0.49], [0.03, 0.49], [0.038, 0.52], [0.035, 0.54], [0.028, 0.56], [0.028, 0.58], [0.031, 0.6], [0.05, 0.62], [0.075, 0.65], [0.09, 0.69], [0.09, 0.72], [0.09, 1.4], [0.09, 1.43], [0.075, 1.415], [0.04, 1.405], [0, 1.405]], new THREE.MeshPhysicalMaterial({ color: 0xdca93c, roughness: .12, metalness: 0, ior: 1.46, clearcoat: 1, clearcoatRoughness: .06, transparent: true, opacity: .72, depthWrite: false }), pieces.pipette);
const glassEdge = glass.clone();
glassEdge.color.setHex(0x5b6b6f); glassEdge.opacity = .38;
for (const [radius,y] of [[.043,.48],[.099,2.67]]) {
  const rim = mesh(new THREE.TorusGeometry(radius,.006,10,64),glassEdge,pieces.pipette,y);
  rim.rotation.x = Math.PI/2;
}
pieces.pipette.traverse((object) => { object.castShadow = false; object.receiveShadow = false; });

const moleculeReady = new Set();
const moleculeModels = { cbd: new THREE.Group(), thc: new THREE.Group() };
molecule.add(moleculeModels.cbd, moleculeModels.thc);
const moleculeObjects = [];
async function loadMolecule(kind) {
  const response = await fetch(`./assets/${kind}.json`);
  if (!response.ok) throw new Error("The reference structure could not be loaded.");
  const data = await response.json();
  const center = new THREE.Vector3();
  data.atoms.forEach((atom) => center.add(new THREE.Vector3(...atom.position)));
  center.divideScalar(data.atoms.length);
  const positions = new Map(data.atoms.map((atom) => [atom.id, new THREE.Vector3(...atom.position).sub(center).multiplyScalar(.32)]));
  const elements = new Map(data.atoms.map((atom) => [atom.id, atom.element]));
  const materials = {
    6: new THREE.MeshStandardMaterial({ color: 0x344d40, roughness: .36 }),
    8: new THREE.MeshStandardMaterial({ color: 0xc95b4c, roughness: .3 }),
    1: new THREE.MeshStandardMaterial({ color: 0xf6f3e9, roughness: .55 }),
  };
  for (const atom of data.atoms) {
    const object = mesh(new THREE.SphereGeometry(atom.element === 1 ? .078 : .145, 24, 16), materials[atom.element], moleculeModels[kind]);
    object.position.copy(positions.get(atom.id));
    object.userData.element = atom.element;
    object.userData.hydrogen = atom.element === 1;
    moleculeObjects.push(object);
  }
  const bondMaterial = new THREE.MeshStandardMaterial({ color: 0x909b87, roughness: .5 });
  const axis = new THREE.Vector3(0, 1, 0);
  for (const bond of data.bonds) {
    const a = positions.get(bond.from), b = positions.get(bond.to);
    const direction = b.clone().sub(a);
    let perpendicular = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 0, 1));
    if (perpendicular.lengthSq() < 1e-8) perpendicular = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(1, 0, 0));
    perpendicular.normalize();
    for (let i = 0; i < bond.order; i++) {
      const object = mesh(new THREE.CylinderGeometry(.029, .029, direction.length(), 10), bondMaterial, moleculeModels[kind]);
      object.position.copy(a).add(b).multiplyScalar(.5).addScaledVector(perpendicular, (i - (bond.order - 1) / 2) * .079);
      object.quaternion.setFromUnitVectors(axis, direction.clone().normalize());
      object.userData.hydrogen = elements.get(bond.from) === 1 || elements.get(bond.to) === 1;
      moleculeObjects.push(object);
    }
  }
  setHydrogens();
  moleculeReady.add(kind);
}
const moleculePromises = Object.fromEntries(KINDS.map(kind => [kind, loadMolecule(kind).catch(error => console.error(error))]));
function setHydrogens() {
  moleculeObjects.forEach((object) => { object.visible = !object.userData.hydrogen || $("hydrogens").checked; });
}
$("hydrogens").addEventListener("change", () => { setHydrogens(); learning?.hydrogens($("hydrogens").checked); });

let explosion = 0, explosionTarget = 0, selected = "bottle", view = "bottle";
let selectionVersion = 0;
let learning = null;
let transition = null, demoStart = null, demoPhase = -1;
const framePositions = {
  bottle: [new THREE.Vector3(0, 2.3, 7.2), new THREE.Vector3(0, 1.9, 0)],
  exploded: [new THREE.Vector3(0, 6.4, 11.8), new THREE.Vector3(0, 3.05, 0)],
  bulb: [new THREE.Vector3(1.3, 5.6, 4.4), new THREE.Vector3(.22, 5.35, 0)],
  cap: [new THREE.Vector3(1.8, 5.2, 4.7), new THREE.Vector3(.35, 4.88, 0)],
  "cap-inside": [new THREE.Vector3(1.2, 1.8, 2.5), new THREE.Vector3(.35, 4.9, 0)],
  pipette: [new THREE.Vector3(1.9, 4.8, 5.6), new THREE.Vector3(.5, 4.4, 0)],
  cbd: [new THREE.Vector3(0, 2.7, 7.5), new THREE.Vector3(0, 1.9, 0)],
  thc: [new THREE.Vector3(0, 2.7, 7.5), new THREE.Vector3(0, 1.9, 0)],
};
for (const face of Object.keys(PANEL_CENTERS)) {
  framePositions[`label-${face}`] = [new THREE.Vector3(...labelCamera(face)), new THREE.Vector3(0,1.9,0)];
}
function frame(name) {
  if (view === "bottle") {
    const face = { "label-composition":"Composition", "label-cbd":"CBD", "label-thc":"THC" }[name];
    $("scene-mode").textContent = face ? `01 / LABEL · ${face.toUpperCase()}` : "01 / BOTTLE";
    $("scene").setAttribute("aria-label", face ? `Bottle: face ${face}` : (CBD_ONLY ? "3D educational CBD bottle" : "3D CBD and THC composition bottle"));
  }
  const [basePosition, target] = framePositions[name];
  const position = basePosition.clone();
  if (name === "cbd" || name === "thc") position.z = Math.max(7.5, 7 / camera.aspect);
  if (reducedMotion.matches) {
    camera.position.copy(position); controls.target.copy(target); controls.update();
  } else {
    transition = { start: performance.now(), position: camera.position.clone(), target: controls.target.clone(), endPosition: position, endTarget: target };
    if (name.startsWith("label-")) {
      const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      const to = new THREE.Spherical().setFromVector3(position.clone().sub(target));
      transition.orbit = { from, to, turn: shortestTurn(from.theta,to.theta) };
    }
  }
}
function setExplosion(value) {
  explosionTarget = THREE.MathUtils.clamp(value, 0, 1);
  if (reducedMotion.matches) explosion = explosionTarget;
  $("explode").value = String(Math.round(explosionTarget * 100));
  $("explode-value").value = `${Math.round(explosionTarget * 100)} %`;
}
function stopDemo() {
  demoStart = null; controls.autoRotate = false;
  $("demo").innerHTML = "<span aria-hidden=\"true\">▷</span> Start tour";
  $("demo").setAttribute("aria-pressed", "false");
}
function setView(next) {
  view = next;
  product.visible = view === "bottle"; molecule.visible = view === "molecule";
  floor.visible = view === "bottle";
  $("explosion-controls").hidden = view === "molecule";
  $("molecule-controls").hidden = view !== "molecule";
  $("molecule-source").hidden = view !== "molecule";
  for (const [kind, model] of Object.entries(moleculeModels)) model.visible = kind === selected;
  $("scene-mode").textContent = view === "molecule" ? `02 / MOLECULE OF ${selected === "thc" ? "Δ9-THC" : "CBD"}` : "01 / BOTTLE";
  $("molecule-source").href = `https://pubchem.ncbi.nlm.nih.gov/compound/${selected === "thc" ? 16078 : 644019}`;
  $("scene").setAttribute("aria-label", view === "molecule" ? `Reference 3D structure of ${selected === "thc" ? "Δ9-THC" : "CBD"}` : (CBD_ONLY ? "3D educational CBD bottle" : "3D CBD and THC composition bottle"));
}
async function selectPart(part, manual = true) {
  if (manual) learning?.close(false);
  if (CBD_ONLY && part === "thc") return false;
  const version = ++selectionVersion;
  const molecular = part === "cbd" || part === "thc";
  if (manual) stopDemo();
  if (molecular) {
    await moleculePromises[part];
    if (version !== selectionVersion) return false;
    if (!moleculeReady.has(part)) {
      $("detail-note").textContent = "The structure could not be loaded. You can keep exploring the bottle and try again after reloading.";
      return false;
    }
  }
  selected = part;
  setView(molecular ? "molecule" : "bottle");
  document.querySelectorAll("[data-part]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.part === part)));
  ["detail-kicker", "detail-title", "detail-text", "detail-note"].forEach((id, i) => { $(id).textContent = descriptions[part][i]; });
  $("cap-interior").hidden = part !== "cap";
  if (part !== "bottle" && !molecular) setExplosion(1);
  frame(part === "bottle" && explosionTarget > .1 ? "exploded" : part);
  if (manual && matchMedia("(max-width: 650px)").matches) $("stage").scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
  return true;
}
document.querySelectorAll("[data-part]").forEach((button) => button.addEventListener("click", () => selectPart(button.dataset.part)));
$("explode").addEventListener("input", (event) => {
  stopDemo();
  const next = Number(event.target.value) / 100;
  if ((next > .05 && explosionTarget <= .05) || selected !== "bottle") {
    selectPart("bottle", false); frame("exploded");
  }
  setExplosion(next);
  if (next === 0) frame("bottle");
});
function assemble() {
  learning?.close(false);
  stopDemo(); setExplosion(0); selectPart("bottle", false); frame("bottle");
}
$("assemble").addEventListener("click", assemble);
document.querySelectorAll("[data-label-face]").forEach(button => button.addEventListener("click", () => {
  selectPart("bottle"); setExplosion(0); frame(`label-${button.dataset.labelFace}`);
}));
$("compare-structures").addEventListener("click", () => { stopDemo(); $("structures-dialog").showModal(); });
$("close-structures").addEventListener("click", () => $("structures-dialog").close());

$("cap-interior").addEventListener("click", () => { stopDemo(); frame("cap-inside"); });
$("reset").addEventListener("click", () => { stopDemo(); frame(view === "molecule" ? selected : explosionTarget > .1 ? "exploded" : "bottle"); });
function rotate(amount) {
  stopDemo(); transition = null;
  const offset = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), amount);
  camera.position.copy(controls.target).add(offset); controls.update();
}
$("rotate-left").addEventListener("click", () => rotate(-Math.PI / 8));
$("rotate-right").addEventListener("click", () => rotate(Math.PI / 8));
function zoom(factor) {
  stopDemo(); transition = null;
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(offset); controls.update();
}
$("zoom-in").addEventListener("click", () => zoom(.85));
$("zoom-out").addEventListener("click", () => zoom(1.18));
controls.addEventListener("start", () => { stopDemo(); transition = null; });
$("demo").setAttribute("aria-pressed", "false");
$("demo").addEventListener("click", () => {
  learning?.close(false);
  if (demoStart !== null) { stopDemo(); return; }
  setExplosion(0); selectPart("bottle", false); frame("bottle");
  demoStart = performance.now(); demoPhase = 0;
  controls.autoRotate = !reducedMotion.matches; controls.autoRotateSpeed = .7;
  $("demo").innerHTML = "<span aria-hidden=\"true\">Ⅱ</span> Pause tour";
  $("demo").setAttribute("aria-pressed", "true");
});

const raycaster = new THREE.Raycaster();
learning = createLearning(document, {
  cancelPending() { ++selectionVersion; stopDemo(); },
  highlightElement(selector) {
    document.querySelectorAll(".learning-highlight").forEach(node => node.classList.remove("learning-highlight"));
    if (selector) document.querySelector(selector)?.classList.add("learning-highlight");
  },
  showHydrogens(visible) { $("hydrogens").checked = visible; setHydrogens(); },
  async showGuideStep(step) {
    if (step === 2) return selectPart("cbd", false);
    const ok = await selectPart("bottle", false);
    if (ok) { setExplosion(0); frame("bottle"); }
    return ok;
  },
  async showGameStep(step) {
    const ok = await selectPart("cbd", false);
    if (!ok) return false;
    if (step === 1) {
      transition = null;
      rotate(Math.PI / 2);
    }
    if (step === 2) { $("hydrogens").checked = false; setHydrogens(); }
    return true;
  },
});
const taps = createTapTracker();
renderer.domElement.addEventListener("pointerdown", event => taps.down(event));
renderer.domElement.addEventListener("pointermove", event => taps.move(event));
renderer.domElement.addEventListener("pointercancel", event => taps.cancel(event));
renderer.domElement.addEventListener("lostpointercapture", event => taps.cancel(event));
renderer.domElement.addEventListener("pointerup", (event) => {
  if (!taps.up(event)) return;
  const bounds = renderer.domElement.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera);
  if (view === "molecule") {
    const atoms = moleculeModels[selected].children.filter(object => object.visible && object.userData.element);
    const hit = raycaster.intersectObjects(atoms, false)[0];
    if (hit && selected === "cbd") learning.atom(hit.object.userData.element);
    return;
  }
  const hit = raycaster.intersectObject(product, true)[0];
  if (hit) {
    let node = hit.object;
    while (node && !node.userData.part) node = node.parent;
    if (node) selectPart(node.userData.part);
  }
});

function resize() {
  const bounds = $("stage").getBoundingClientRect();
  camera.aspect = bounds.width / bounds.height;
  camera.updateProjectionMatrix(); renderer.setSize(bounds.width, bounds.height, false);
  if (view === "molecule") frame(selected);
}
new ResizeObserver(resize).observe($("stage"));
resize();
let lastTime = performance.now();
function render(now) {
  const delta = Math.min((now - lastTime) / 1000, .05); lastTime = now;
  if (transition) {
    const t = Math.min((now - transition.start) / 1000, 1), ease = t * t * (3 - 2 * t);
    controls.target.lerpVectors(transition.target, transition.endTarget, ease);
    if (transition.orbit) {
      const { from,to,turn } = transition.orbit;
      camera.position.setFromSphericalCoords(THREE.MathUtils.lerp(from.radius,to.radius,ease),THREE.MathUtils.lerp(from.phi,to.phi,ease),from.theta+turn*ease).add(controls.target);
    } else camera.position.lerpVectors(transition.position, transition.endPosition, ease);
    if (t === 1) transition = null;
  }
  explosion += (explosionTarget - explosion) * (1 - Math.exp(-delta * 6));
  updateDropper(dropper, explosion);
  if (demoStart !== null) {
    const elapsed = (now - demoStart) / 1000;
    if (elapsed > 3 && demoPhase === 0) { setExplosion(1); frame("exploded"); demoPhase = 1; }
    if (elapsed > 9 && demoPhase === 1) { selectPart("cbd", false); demoPhase = 2; }
    if (elapsed > 16 && demoPhase === 2) { setExplosion(0); selectPart("bottle", false); frame("bottle"); demoPhase = 3; }
    if (elapsed > 20) stopDemo();
  }
  controls.update(delta); renderer.render(scene, camera);
}
renderer.setAnimationLoop(render);
$("loading").hidden = true;
renderer.domElement.addEventListener("webglcontextlost", (event) => {
  event.preventDefault(); stopDemo(); renderer.setAnimationLoop(null);
  $("error").textContent = "The 3D session was interrupted. Reload the page to explore again.";
  $("error").hidden = false;
});

// El contenedor privado ajusta su altura sin recibir datos de composición ni de pacientes.
if (window.parent !== window) {
  const reportHeight = () => window.parent.postMessage({ type: "evipro-visor-height", height: Math.ceil(document.body.getBoundingClientRect().height) }, location.origin);
  new ResizeObserver(reportHeight).observe(document.body);
  reportHeight();
}
