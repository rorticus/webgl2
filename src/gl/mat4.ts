import { mat3, Mat3, mat3Det } from "./mat3";
import { vec3, Vec3, vec3Cross, vec3Dot, vec3Normalize, vec3Sub } from "./vec3";

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

export function mat4Clone(source: Mat4) {
  return new Float32Array(source);
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

export function mat4Translation(dest: Mat4, position: Vec3) {
  mat4Identity(dest);

  dest[12] = position[0];
  dest[13] = position[1];
  dest[14] = position[2];

  return dest;
}

export function mat4Scale(dest: Mat4, scale: Vec3) {
  mat4Identity(dest);

  dest[0] = scale[0];
  dest[5] = scale[1];
  dest[10] = scale[2];

  return dest;
}

export function mat4RotationX(dest: Mat4, radians: number) {
  mat4Identity(dest);

  const sr = Math.sin(radians);
  const cr = Math.cos(radians);

  dest[5] = cr;
  dest[6] = -sr;
  dest[9] = sr;
  dest[10] = cr;

  mat4Transpose(dest, dest);

  return dest;
}

export function mat4RotationY(dest: Mat4, radians: number) {
  mat4Identity(dest);

  const sr = Math.sin(radians);
  const cr = Math.cos(radians);

  dest[0] = cr;
  dest[2] = sr;
  dest[8] = -sr;
  dest[10] = cr;

  mat4Transpose(dest, dest);

  return dest;
}

export function mat4RotationZ(dest: Mat4, radians: number) {
  mat4Identity(dest);

  const sr = Math.sin(radians);
  const cr = Math.cos(radians);

  dest[0] = cr;
  dest[1] = -sr;
  dest[4] = sr;
  dest[5] = cr;

  mat4Transpose(dest, dest);

  return dest;
}

export function mat4Perspective(
  dest: Mat4,
  fieldOfViewInRadians: number,
  width: number,
  height: number,
  near: number,
  far: number
) {
  const a = height / width;
  const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
  const nf = 1 / (near - far);

  dest[0] = a * f;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;

  dest[4] = 0;
  dest[5] = f;
  dest[6] = 0;
  dest[7] = 0;

  dest[8] = 0;
  dest[9] = 0;
  dest[10] = far + near * nf;
  dest[11] = 0 - -1;

  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 2 * far * near * nf;
  dest[15] = 0;

  return dest;
}

export function mat4Print(m: Mat4) {
  console.log(`${m[0]} ${m[1]} ${m[2]} ${m[3]}`);
  console.log(`${m[4]} ${m[5]} ${m[6]} ${m[7]}`);
  console.log(`${m[8]} ${m[9]} ${m[10]} ${m[11]}`);
  console.log(`${m[12]} ${m[13]} ${m[14]} ${m[15]}`);
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

  let a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5],
    a6 = a[6],
    a7 = a[7],
    a8 = a[8],
    a9 = a[9],
    a10 = a[10],
    a11 = a[11],
    a12 = a[12],
    a13 = a[13],
    a14 = a[14],
    a15 = a[15];

  let b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7],
    b8 = b[8],
    b9 = b[9],
    b10 = b[10],
    b11 = b[11],
    b12 = b[12],
    b13 = b[13],
    b14 = b[14],
    b15 = b[15];

  dest[0] = a0 * b0 + a1 * b4 + a2 * b8 + a3 * b12;
  dest[1] = a0 * b1 + a1 * b5 + a2 * b9 + a3 * b13;
  dest[2] = a0 * b2 + a1 * b6 + a2 * b10 + a3 * b14;
  dest[3] = a0 * b3 + a1 * b7 + a2 * b11 + a3 * b15;
  dest[4] = a4 * b0 + a5 * b4 + a6 * b8 + a7 * b12;
  dest[5] = a4 * b1 + a5 * b5 + a6 * b9 + a7 * b13;
  dest[6] = a4 * b2 + a5 * b6 + a6 * b10 + a7 * b14;
  dest[7] = a4 * b3 + a5 * b7 + a6 * b11 + a7 * b15;
  dest[8] = a8 * b0 + a9 * b4 + a10 * b8 + a11 * b12;
  dest[9] = a8 * b1 + a9 * b5 + a10 * b9 + a11 * b13;
  dest[10] = a8 * b2 + a9 * b6 + a10 * b10 + a11 * b14;
  dest[11] = a8 * b3 + a9 * b7 + a10 * b11 + a11 * b15;
  dest[12] = a12 * b0 + a13 * b4 + a14 * b8 + a15 * b12;
  dest[13] = a12 * b1 + a13 * b5 + a14 * b9 + a15 * b13;
  dest[14] = a12 * b2 + a13 * b6 + a14 * b10 + a15 * b14;
  dest[15] = a12 * b3 + a13 * b7 + a14 * b11 + a15 * b15;

  return dest;
}

export function mat4Transpose(dest: Mat4, a: Mat4) {
  const temp = mat4Clone(a);

  dest[0] = temp[0];
  dest[1] = temp[4];
  dest[2] = temp[8];
  dest[3] = temp[12];
  dest[4] = temp[1];
  dest[5] = temp[5];
  dest[6] = temp[9];
  dest[7] = temp[13];
  dest[8] = temp[2];
  dest[9] = temp[6];
  dest[10] = temp[10];
  dest[11] = temp[14];
  dest[12] = temp[3];
  dest[13] = temp[7];
  dest[14] = temp[11];
  dest[15] = temp[15];

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

  const temp = mat4Clone(a);
  const invDet = 1 / det;

  dest[0] = mat3Det(mat4Sub(mat3(), temp, 0, 0)) * invDet;
  dest[1] = -mat3Det(mat4Sub(mat3(), temp, 1, 0)) * invDet;
  dest[2] = mat3Det(mat4Sub(mat3(), temp, 2, 0)) * invDet;
  dest[3] = -mat3Det(mat4Sub(mat3(), temp, 3, 0)) * invDet;
  dest[4] = -mat3Det(mat4Sub(mat3(), temp, 0, 1)) * invDet;
  dest[5] = mat3Det(mat4Sub(mat3(), temp, 1, 1)) * invDet;
  dest[6] = -mat3Det(mat4Sub(mat3(), temp, 2, 1)) * invDet;
  dest[7] = mat3Det(mat4Sub(mat3(), temp, 3, 1)) * invDet;
  dest[8] = mat3Det(mat4Sub(mat3(), temp, 0, 2)) * invDet;
  dest[9] = -mat3Det(mat4Sub(mat3(), temp, 1, 2)) * invDet;
  dest[10] = mat3Det(mat4Sub(mat3(), temp, 2, 2)) * invDet;
  dest[11] = -mat3Det(mat4Sub(mat3(), temp, 3, 2)) * invDet;
  dest[12] = -mat3Det(mat4Sub(mat3(), temp, 0, 3)) * invDet;
  dest[13] = mat3Det(mat4Sub(mat3(), temp, 1, 3)) * invDet;
  dest[14] = -mat3Det(mat4Sub(mat3(), temp, 2, 3)) * invDet;
  dest[15] = mat3Det(mat4Sub(mat3(), temp, 3, 3)) * invDet;

  return dest;
}

export function mat4MulVec3(dest: Vec3, a: Mat4, b: Vec3) {
  const x = b[0];
  const y = b[1];
  const z = b[2];

  dest[0] = a[0] * x + a[4] * y + a[8] * z + a[12];
  dest[1] = a[1] * x + a[5] * y + a[9] * z + a[13];
  dest[2] = a[2] * x + a[6] * y + a[10] * z + a[14];

  return dest;
}

export function mat4LookAt(dest: Mat4, target: Vec3, position: Vec3, up: Vec3) {
  // https://learn.microsoft.com/en-us/previous-versions/windows/desktop/bb281710(v=vs.85)?redirectedfrom=MSDN
  const zAxis = vec3Normalize(vec3(), vec3Sub(vec3(), target, position));
  const xAxis = vec3Normalize(vec3(), vec3Cross(vec3(), up, zAxis));
  const yAxis = vec3Normalize(vec3(), vec3Cross(vec3(), zAxis, xAxis));

  dest[0] = xAxis[0];
  dest[1] = yAxis[0];
  dest[2] = zAxis[0];
  dest[3] = 0;

  dest[4] = xAxis[1];
  dest[5] = yAxis[1];
  dest[6] = zAxis[1];
  dest[7] = 0;

  dest[8] = xAxis[2];
  dest[9] = yAxis[2];
  dest[10] = zAxis[2];
  dest[11] = 0;

  dest[12] = -vec3Dot(xAxis, position);
  dest[13] = -vec3Dot(yAxis, position);
  dest[14] = -vec3Dot(zAxis, position);
  dest[15] = 1;

  return dest;
}
