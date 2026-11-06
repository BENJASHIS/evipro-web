import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../',import.meta.url));
const source = path.resolve(root,'../prototypes/cannavital-3d');
const target = path.join(root,'private/frasco');
const files = {
  'index.html':'text/html; charset=utf-8', 'style.css':'text/css; charset=utf-8',
  ...Object.fromEntries(['app.js','cap.js','dropper.js','composition.js','label-panels.js','vendor/three.module.js','vendor/three.core.js','vendor/OrbitControls.js','vendor/RoomEnvironment.js'].map(f=>[f,'text/javascript; charset=utf-8'])),
  ...Object.fromEntries(['assets/cbd.json','assets/thc.json'].map(f=>[f,'application/json; charset=utf-8'])),
  ...Object.fromEntries(['assets/cbd-reference.svg','assets/thc-reference.svg'].map(f=>[f,'image/svg+xml'])),
  'vendor/THREE-LICENSE.txt':'text/plain; charset=utf-8',
};
const manifest = { version:'v09', importMapHash:'', files:{} };
for (const [file,type] of Object.entries(files)) {
  let bytes = await readFile(path.join(source,file));
  if (file === 'index.html') {
    const html = bytes.toString().replace('href="./"','href="./index.html"');
    manifest.importMapHash = createHash('sha256').update(html.match(/<script type="importmap">([^<]*)<\/script>/)[1]).digest('base64');
    bytes = Buffer.from(html);
  }
  await mkdir(path.dirname(path.join(target,file)),{recursive:true});
  await writeFile(path.join(target,file),bytes);
  manifest.files[file] = { type,sha256:createHash('sha256').update(bytes).digest('hex') };
}
// Variante gratuita: sin formulario de mezclas ni referencias/controles de THC.
let cbdHtml = (await readFile(path.join(target,'index.html'),'utf8'))
  .replace('<html lang="es">','<html lang="es" data-cbd-only="true">')
  .replace(/<fieldset id="composition-controls"[\s\S]*?<\/fieldset>/,'<p>Ejemplo fijo: CBD al 10 % equivale a 100 mg en cada mL de aceite. No recomienda dosis.</p>')
  .replace(/<button[^>]*data-(?:part|label-face)="thc"[^>]*>[\s\S]*?<\/button>/g,'')
  .replace(/<figure><figcaption>Δ9-THC[\s\S]*?<\/figure>/,'')
  .replace('Explora la<br><em>composición.</em>','Explora el<br><em>CBD.</em>')
  .replace('Porcentajes y ratio vinculados. Elige un ejemplo o ajusta los valores.','Acceso educativo gratuito: observa el frasco y la molécula de CBD en plano o en 3D.')
  .replace('Comparar estructuras en plano','Ver CBD en plano')
  .replace('Dos estructuras de referencia; su tamaño no representa la proporción del preparado.','Estructura de referencia de CBD; su tamaño no representa la concentración del preparado.')
  .replace('Demostración configurable;','Ejemplo ilustrativo;')
  .replaceAll('CBD y THC','CBD').replaceAll('CBD + THC','CBD')
  .replace('class="structures-comparison"','class="structures-comparison" style="grid-template-columns:1fr"');
cbdHtml = cbdHtml.replace(/[ \t]+$/gm,'');
if (!cbdHtml.includes('data-cbd-only="true"') || /assets\/thc|data-part="thc"|id="composition-controls"/.test(cbdHtml)) throw new Error('Variante gratuita incompleta.');
await writeFile(path.join(target,'cbd.html'),cbdHtml);
manifest.files['cbd.html'] = {type:'text/html; charset=utf-8',sha256:createHash('sha256').update(cbdHtml).digest('hex')};
await writeFile(path.join(target,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Visor privado sincronizado: ${Object.keys(manifest.files).length} archivos, sin CDN ni datos clínicos.`);
