import { Group } from './vendor/three.module.js';

const PIVOT = 2.58;

export function createDropper(parts) {
  const dropper = new Group();
  dropper.add(parts.bulb, parts.cap, parts.pipette);
  for (const part of dropper.children) part.position.y = -PIVOT;
  dropper.position.y = PIVOT;
  return dropper;
}

export function updateDropper(dropper, opening) {
  const progress = Math.min(1, Math.max(0, opening));
  const ease = (value) => { const t = Math.min(1, Math.max(0, value)); return t * t * (3 - 2 * t); };
  const screw = ease(progress / .12);
  const lift = ease((progress - .12) / .66);
  const free = ease((progress - .78) / .22);
  dropper.position.set(.45 * free, PIVOT + .24 * screw + 2.11 * lift, 0);
  dropper.rotation.set(0, -Math.PI * 4 * screw, .22 * free);
}
