export type Vec2 = Float32Array;

export function vec2(x = 0, y = 0) {
  return new Float32Array([x, y]);
}

export function vec2Add(dest: Vec2, a: Vec2, b: Vec2) {
  dest[0] = a[0] + b[0];
  dest[1] = a[1] + b[1];
  return dest;
}

export function vec2Sub(dest: Vec2, a: Vec2, b: Vec2) {
  dest[0] = a[0] - b[0];
  dest[1] = a[1] - b[1];
  return dest;
}

export function vec2Scale(dest: Vec2, a: Vec2, b: number) {
  dest[0] = a[0] * b;
  dest[1] = a[1] * b;
  return dest;
}

export function vec2Divide(dest: Vec2, a: Vec2, b: number) {
  dest[0] = a[0] / b;
  dest[1] = a[1] / b;
  return dest;
}

export function vec2DistanceTo(a: Vec2, b: Vec2) {
  const x = a[0] - b[0];
  const y = a[1] - b[1];

  return Math.sqrt(x * x + y * y);
}

export function vec2Dot(a: Vec2, b: Vec2) {
  return a[0] * b[0] + a[1] * b[1];
}

export function vec2Normalize(dest: Vec2, a: Vec2) {
  const length = Math.sqrt(vec2Dot(a, a));

  dest[0] = a[0] / length;
  dest[1] = a[1] / length;

  return dest;
}

export function vec2Magnitude(a: Vec2) {
  return Math.sqrt(vec2Dot(a, a));
}

export function vec2MagnitudeSq(a: Vec2) {
  return vec2Dot(a, a);
}

export function vec2Cross(dest: Vec2, a: Vec2, b: Vec2) {
  dest[0] = a[1] * b[2] - a[2] * b[1];
  dest[1] = a[2] * b[0] - a[0] * b[2];

  return dest;
}
