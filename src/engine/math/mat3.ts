import { mat2, Mat2, mat2Det } from "./mat2";

export type Mat3 = Float32Array;

export function mat3(
  a = 1,
  b = 0,
  c = 0,
  d = 0,
  e = 1,
  f = 0,
  g = 0,
  h = 0,
  i = 1
) {
  return new Float32Array([a, b, c, d, e, f, g, h, i]);
}

export function mat3Mul(dest: Mat3, a: Mat3, b: Mat3) {
  dest[0] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
  dest[1] = a[1] * b[0] + a[4] * b[1] + a[7] * b[2];
  dest[2] = a[2] * b[0] + a[5] * b[1] + a[8] * b[2];

  dest[3] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
  dest[4] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
  dest[5] = a[2] * b[3] + a[5] * b[4] + a[8] * b[5];

  dest[6] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
  dest[7] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
  dest[8] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];

  return dest;
}

export function mat3Sub(dest: Mat2, a: Mat3, row: number, col: number) {
  let i = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (r !== row && c !== col) {
        dest[i] = a[r * 3 + c];
        i++;
      }
    }
  }
  return dest;
}

export function mat3Minor(a: Mat3, row: number, col: number) {
  return mat2Det(mat3Sub(mat2(), a, row, col));
}

export function mat3Cofactor(a: Mat3, row: number, col: number) {
  return mat3Minor(a, row, col) * ((row + col) % 2 === 0 ? 1 : -1);
}

export function mat3Det(a: Mat3) {
  return (
    a[0] * mat3Cofactor(a, 0, 0) +
    a[1] * mat3Cofactor(a, 0, 1) +
    a[2] * mat3Cofactor(a, 0, 2)
  );
}

export function mat3Identity(dest: Mat3) {
  dest[0] = 1;
  dest[1] = 0;
  dest[2] = 0;

  dest[3] = 0;
  dest[4] = 1;
  dest[5] = 0;

  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 0;

  return dest;
}