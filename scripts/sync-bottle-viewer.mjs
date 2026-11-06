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
const manifest = { version:'v08', importMapHash:'', files:{} };
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
await writeFile(path.join(target,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Visor privado sincronizado: ${Object.keys(files).length} archivos, sin CDN ni datos clínicos.`);
