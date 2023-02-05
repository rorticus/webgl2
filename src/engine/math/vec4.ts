export type Vec4 = Float32Array;

export function vec4(x = 0, y = 0, z = 0, w = 0) {
  return new Float32Array([x, y, z, w]);
}

export function vec4Add(dest: Vec4, a: Vec4, b: Vec4) {
  dest[0] = a[0] + b[0];
  dest[1] = a[1] + b[1];
  dest[2] = a[2] + b[2];
  dest[3] = a[3] + b[3];

  return dest;
}

export function vec4Sub(dest: Vec4, a: Vec4, b: Vec4) {
  dest[0] = a[0] - b[0];
  dest[1] = a[1] - b[1];
  dest[2] = a[2] - b[2];
  dest[3] = a[3] - b[3];

  return dest;
}

export function vec4Scale(dest: Vec4, a: Vec4, b: number) {
    dest[0] = a[0] * b;
    dest[1] = a[1] * b;
    dest[2] = a[2] * b;
    dest[3] = a[3] * b;

    return dest;
}

export function vec4Divide(dest: Vec4, a: Vec4, b: number) {
    dest[0] = a[0] / b;
    dest[1] = a[1] / b;
    dest[2] = a[2] / b;
    dest[3] = a[3] / b;

    return dest;
}

export function vec4Dot(a: Vec4, b: Vec4) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export function vec4Normalize(dest: Vec4, a: Vec4) {
    const length = Math.sqrt(vec4Dot(a, a));
    dest[0] = a[0] / length;
    dest[1] = a[1] / length;
    dest[2] = a[2] / length;
    dest[3] = a[3] / length;

    return dest;
}

export function vec4Magnitude(a: Vec4) {
    return Math.sqrt(vec4Dot(a, a));
}
