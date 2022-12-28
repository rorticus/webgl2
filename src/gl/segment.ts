import { vec3, vec3Dot } from "./vec3";

export const DONT_INTERSECT = 0;
export const COLLINEAR = 1;
export const DO_INTERSECT = 2;

export type Segment = Float32Array;

export function segment(x = 0, y = 0, vx = 0, vy = 0): Segment {
  return new Float32Array([x, y, vx, vy]);
}

export function sameSign(a: number, b: number): boolean {
  return a * b >= 0;
}

export function segmentLength(seg: Segment) {
  return Math.sqrt(seg[2] * seg[2] + seg[3] * seg[3]);
}

export function segmentNormal(dest: Segment, a: Segment) {
  const x1 = a[1];
  const y1 = a[0] + a[2];
  const y2 = a[0];
  const x2 = a[1] + a[3];

  dest[0] = x1;
  dest[1] = y1;
  dest[2] = x2 - x1;
  dest[3] = y2 - y1;

  return dest;
}

export function segmentCenter(a: Segment) {
  const x = (a[0] + a[0] + a[2]) / 2;
  const y = (a[1] + a[1] + a[3]) / 2;

  return [x, y];
}

export function segmentUnit(dest: Segment, a: Segment) {
  const len = segmentLength(a);

  dest[0] = 0;
  dest[1] = 0;
  dest[2] = a[2] / len;
  dest[3] = a[3] / len;

  return dest;
}

export function segmentMultiply(dest: Segment, a: Segment, b: number) {
  dest[0] = 0;
  dest[1] = 0;
  dest[2] = a[2] * b;
  dest[3] = a[3] * b;

  return dest;
}

export function segmentProject(from: Segment, onto: Segment) {
  const vec = vec3(from[2], from[3], 0);
  const o = vec3(onto[2], onto[3], 0);
  const d = vec3Dot(vec, o);

  if (0 < d) {
    const dp = vec3Dot(vec, o);
    const multiplier = dp / d;
    const rx = o[0] * multiplier;
    const ry = o[1] * multiplier;

    return [rx, ry];
  }

  return [0, 0];
}

export function segmentIntersect(a: Segment, b: Segment) {
  const x1 = a[0];
  const y1 = a[1];
  const x2 = a[0] + a[2];
  const y2 = a[1] + a[3];
  const x3 = b[0];
  const y3 = b[1];
  const x4 = b[0] + b[2];
  const y4 = b[1] + b[3];

  const a1 = y2 - y1;
  const b1 = x1 - x2;
  const c1 = x2 * y1 - x1 * y2;

  const r3 = a1 * x3 + b1 * y3 + c1;
  const r4 = a1 * x4 + b1 * y4 + c1;

  if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
    return DONT_INTERSECT;
  }

  const a2 = y4 - y3;
  const b2 = x3 - x4;
  const c2 = x4 * y3 - x3 * y4;
  const r1 = a2 * x1 + b2 * y1 + c2;
  const r2 = a2 * x2 + b2 * y2 + c2;

  if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
    return DONT_INTERSECT;
  }

  const denom = a1 * b2 - a2 * b1;

  if (denom === 0) {
    return COLLINEAR;
  }

  const offset = denom < 0 ? -denom / 2 : denom / 2;

  const numX = b1 * c2 - b2 * c1;
  const numY = a2 * c1 - a1 * c2;

  const x = numX < 0 ? (numX - offset) / denom : (numX + offset) / denom;
  const y = numY < 0 ? (numY - offset) / denom : (numY + offset) / denom;

  return [DO_INTERSECT, x, y];
}

export function vec2Ang(x: number, y: number) {
  const radians = Math.atan2(y, x);
  return radians * (180 / Math.PI);
}

export function vecFromAngle(degrees: number) {
  const radians = degrees * (Math.PI / 180);
  const x = Math.cos(radians);
  const y = Math.sin(radians);

  const s = segment(0, 0, x, y);
  segmentNormal(s, s);
  segmentUnit(s, s);

  return [s[2], s[3]];
}
