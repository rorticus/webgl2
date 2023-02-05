export type Mat2 = Float32Array;

export function mat2(a = 1, b = 0, c = 0, d = 1) {
  return new Float32Array([a, b, c, d]);
}

export function mat2Mul(dest: Mat2, a: Mat2, b: Mat2) {
  dest[0] = a[0] * b[0] + a[2] * b[1];
  dest[1] = a[1] * b[0] + a[3] * b[1];
  dest[2] = a[0] * b[2] + a[2] * b[3];
  dest[3] = a[1] * b[2] + a[3] * b[3];
  return dest;
}

export function mat2Det(a: Mat2) {
  return a[0] * a[3] - a[1] * a[2];
}
