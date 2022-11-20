import { mat3, Mat3, mat3Det } from "./mat3";

export type Mat4 = Float32Array;

export function mat4(
  a = 0,
  b = 0,
  c = 0,
  d = 0,
  e = 0,
  f = 0,
  g = 0,
  h = 0,
  i = 0,
  j = 0,
  k = 0,
  l = 0,
  m = 0,
  n = 0,
  o = 0,
  p = 0
) {
  return new Float32Array([a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p]);
}

export function mat4Identity(dest: Mat4) {
  dest[0] = 1;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;

  dest[4] = 0;
  dest[5] = 1;
  dest[6] = 0;
  dest[7] = 0;

  dest[8] = 0;
  dest[9] = 0;
  dest[10] = 1;
  dest[11] = 0;

  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;

  return dest;
}

export function mat4Mul(dest: Mat4, a: Mat4, b: Mat4) {
  // function pos(row: number, col: number) {
  //   return row * 4 + col;
  // }
  //
  // for (let row = 0; row < 4; row++) {
  //   for (let col = 0; col < 4; col++) {
  //     dest[pos(row, col)] =
  //       a[pos(row, 0)] * b[pos(0, col)] +
  //       a[pos(row, 1)] * b[pos(1, col)] +
  //       a[pos(row, 2)] * b[pos(2, col)] +
  //       a[pos(row, 3)] * b[pos(3, col)];
  //
  //     console.log(
  //       `dest[${pos(row, col)}] = a[${pos(row, 0)}] * b[${pos(
  //         0,
  //         col
  //       )}] + a[${pos(row, 1)}] * b[${pos(1, col)}] + a[${pos(
  //         row,
  //         2
  //       )}] * b[${pos(2, col)}] + a[${pos(row, 3)}] * b[${pos(3, col)}]`
  //     );
  //   }

  dest[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  dest[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  dest[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  dest[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];
  dest[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  dest[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  dest[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  dest[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];
  dest[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  dest[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  dest[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  dest[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];
  dest[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  dest[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  dest[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  dest[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return dest;
}

export function mat4Transpose(dest: Mat4, a: Mat4) {
  dest[0] = a[0];
  dest[1] = a[4];
  dest[2] = a[8];
  dest[3] = a[12];
  dest[4] = a[1];
  dest[5] = a[5];
  dest[6] = a[9];
  dest[7] = a[13];
  dest[8] = a[2];
  dest[9] = a[6];
  dest[10] = a[10];
  dest[11] = a[14];
  dest[12] = a[3];
  dest[13] = a[7];
  dest[14] = a[11];
  dest[15] = a[15];

  return dest;
}

export function mat4Sub(dest: Mat3, src: Mat4, row: number, col: number) {
  let pos = 0;
  for (let r = 0; r < 4; r++) {
    if (r === row) {
      continue;
    }

    for (let c = 0; c < 4; c++) {
      if (c === col) {
        continue;
      }

      dest[pos++] = src[r * 4 + c];
    }
  }

  return dest;
}

export function mat4Det(a: Mat4) {
  return (
    a[0] * mat3Det(mat4Sub(mat3(), a, 0, 0)) -
    a[1] * mat3Det(mat4Sub(mat3(), a, 0, 1)) +
    a[2] * mat3Det(mat4Sub(mat3(), a, 0, 2)) -
    a[3] * mat3Det(mat4Sub(mat3(), a, 0, 3))
  );
}

export function mat4Inv(dest: Mat4, a: Mat4) {
  const det = mat4Det(a);

  if (det === 0) {
    return dest;
  }

  const invDet = 1 / det;

  dest[0] = mat3Det(mat4Sub(mat3(), a, 0, 0)) * invDet;
  dest[1] = -mat3Det(mat4Sub(mat3(), a, 1, 0)) * invDet;
  dest[2] = mat3Det(mat4Sub(mat3(), a, 2, 0)) * invDet;
  dest[3] = -mat3Det(mat4Sub(mat3(), a, 3, 0)) * invDet;
  dest[4] = -mat3Det(mat4Sub(mat3(), a, 0, 1)) * invDet;
  dest[5] = mat3Det(mat4Sub(mat3(), a, 1, 1)) * invDet;
  dest[6] = -mat3Det(mat4Sub(mat3(), a, 2, 1)) * invDet;
  dest[7] = mat3Det(mat4Sub(mat3(), a, 3, 1)) * invDet;
  dest[8] = mat3Det(mat4Sub(mat3(), a, 0, 2)) * invDet;
  dest[9] = -mat3Det(mat4Sub(mat3(), a, 1, 2)) * invDet;
  dest[10] = mat3Det(mat4Sub(mat3(), a, 2, 2)) * invDet;
  dest[11] = -mat3Det(mat4Sub(mat3(), a, 3, 2)) * invDet;
  dest[12] = -mat3Det(mat4Sub(mat3(), a, 0, 3)) * invDet;
  dest[13] = mat3Det(mat4Sub(mat3(), a, 1, 3)) * invDet;
  dest[14] = -mat3Det(mat4Sub(mat3(), a, 2, 3)) * invDet;
  dest[15] = mat3Det(mat4Sub(mat3(), a, 3, 3)) * invDet;

  return dest;
}
