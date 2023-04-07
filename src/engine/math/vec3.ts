export type Vec3 = Float32Array;
export type Point3D = Vec3;

export function vec3(x = 0, y = 0, z = 0) {
  return new Float32Array([x, y, z]);
}

export function vec3Clone(dest: Vec3, source: Vec3) {
  dest[0] = source[0];
  dest[1] = source[1];
  dest[2] = source[2];
}

export function vec3Clear(dest: Vec3) {
  dest[0] = 0;
  dest[1] = 0;
  dest[2] = 0;
}

export function vec3Add(dest: Vec3, a: Vec3, b: Vec3) {
  dest[0] = a[0] + b[0];
  dest[1] = a[1] + b[1];
  dest[2] = a[2] + b[2];
  return dest;
}

export function vec3Sub(dest: Vec3, a: Vec3, b: Vec3) {
  dest[0] = a[0] - b[0];
  dest[1] = a[1] - b[1];
  dest[2] = a[2] - b[2];
  return dest;
}

export function vec3Scale(dest: Vec3, a: Vec3, b: number) {
  dest[0] = a[0] * b;
  dest[1] = a[1] * b;
  dest[2] = a[2] * b;
  return dest;
}

export function vec3Divide(dest: Vec3, a: Vec3, b: number) {
  dest[0] = a[0] / b;
  dest[1] = a[1] / b;
  dest[2] = a[2] / b;
  return dest;
}

export function vec3DistanceTo(a: Vec3, b: Vec3) {
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  const z = a[2] - b[2];
  return Math.sqrt(x * x + y * y + z * z);
}

export function vec3DistanceToSq(a: Vec3, b: Vec3) {
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  const z = a[2] - b[2];
  return x * x + y * y + z * z;
}

export function vec3Dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vec3Normalize(dest: Vec3, a: Vec3) {
  const length = Math.sqrt(vec3Dot(a, a));
  if (length === 0) {
    dest[0] = 0;
    dest[1] = 0;
    dest[2] = 0;
  } else {
    dest[0] = a[0] / length;
    dest[1] = a[1] / length;
    dest[2] = a[2] / length;
  }

  return dest;
}

export function vec3Magnitude(a: Vec3) {
  return Math.sqrt(vec3Dot(a, a));
}

export function vec3MagnitudeSq(a: Vec3) {
  return vec3Dot(a, a);
}

export function vec3Cross(dest: Vec3, a: Vec3, b: Vec3) {
  dest[0] = a[1] * b[2] - a[2] * b[1];
  dest[1] = a[2] * b[0] - a[0] * b[2];
  dest[2] = a[0] * b[1] - a[1] * b[0];

  return dest;
}

export function vec3Project(dest: Vec3, a: Vec3, b: Vec3) {
  const dot = vec3Dot(a, b);
  const magnitudeSq = vec3MagnitudeSq(b);

  return vec3Scale(dest, b, dot / magnitudeSq);
}
