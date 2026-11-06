import { CatmullRomCurve3, CylinderGeometry, Group, LatheGeometry, Mesh, TorusGeometry, TubeGeometry, Vector2, Vector3 } from './vendor/three.module.js';

export function threadGeometry(radius, bottom, height, turns, thickness) {
  const points = Array.from({ length: 257 }, (_, index) => {
    const t = index / 256, angle = t * turns * Math.PI * 2;
    return new Vector3(Math.cos(angle) * radius, bottom + t * height, Math.sin(angle) * radius);
  });
  return new TubeGeometry(new CatmullRomCurve3(points), 256, thickness, 8, false);
}

export function buildCap(material) {
  const cap = new Group();
  const profile = [[0.475, 2.17], [0.492, 2.18], [0.492, 2.24], [0.478, 2.26], [0.478, 2.72], [0.46, 2.78], [0.25, 2.78], [0.25, 2.7], [0.412, 2.7], [0.412, 2.22], [0.43, 2.17], [0.475, 2.17]];
  const shell = new Mesh(new LatheGeometry(profile.map(([radius, height]) => new Vector2(radius, height)), 128), material);
  shell.castShadow = true; shell.receiveShadow = true;
  cap.add(shell);
  const lip = new Mesh(new TorusGeometry(.458, .024, 12, 128), material);
  lip.rotation.x = Math.PI / 2; lip.position.y = 2.205; cap.add(lip);
  const threadMaterial = material.clone();
  threadMaterial.color.setHex(0x363a36);
  cap.add(new Mesh(threadGeometry(.411, 2.20, .24, 2, .018), threadMaterial));
  for (let index = 0; index < 56; index++) {
    const rib = new Mesh(new CylinderGeometry(.009, .009, .41, 8), material);
    const angle = index * Math.PI * 2 / 56;
    rib.position.set(Math.sin(angle) * .478, 2.49, Math.cos(angle) * .478);
    cap.add(rib);
  }
  return cap;
}
