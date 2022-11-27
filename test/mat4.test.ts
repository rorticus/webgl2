import { describe, it, expect } from "vitest";
import {
  mat4,
  mat4Det,
  mat4Inv,
  mat4Mul,
  mat4MulVec3,
  mat4RotationX,
  mat4RotationY,
  mat4RotationZ,
  mat4Scale,
  mat4Sub,
  mat4Translation,
  mat4Transpose,
} from "../src/gl/mat4";
import { mat3 } from "../src/gl/mat3";
import { vec3 } from "../src/gl/vec3";

describe("mat4", () => {
  it("should initialize a matrix", () => {
    const actual = mat4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    const expected = new Float32Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);

    expect(actual).toEqual(expected);
  });

  it("should be able to multiply two matrices", () => {
    const a = mat4(1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2);
    const b = mat4(-2, 1, 2, 3, 3, 2, 1, -1, 4, 3, 6, 5, 1, 2, 7, 8);

    const expected = mat4(
      20,
      22,
      50,
      48,
      44,
      54,
      114,
      108,
      40,
      58,
      110,
      102,
      16,
      26,
      46,
      42
    );

    const actual = mat4Mul(mat4(), a, b);
    expect(actual).toEqual(expected);
  });

  it("should transpose a matrix", () => {
    const a = mat4(1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2);
    const expected = mat4(1, 5, 9, 5, 2, 6, 8, 4, 3, 7, 7, 3, 4, 8, 6, 2);
    const actual = mat4Transpose(mat4(), a);
    expect(actual).toEqual(expected);
  });

  it("should create a submatrix", () => {
    const a = mat4(1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2);
    const expected = mat3(1, 3, 4, 9, 7, 6, 5, 3, 2);
    const actual = mat4Sub(mat3(), a, 1, 1);
    expect(actual).toEqual(expected);
  });

  it("should calculate the determinant", () => {
    const a = mat4(-2, -8, 3, 5, -3, 1, 7, 3, 1, 2, -9, 6, -6, 7, 7, -9);
    const expected = -4071;
    const actual = mat4Det(a);
    expect(actual).toEqual(expected);
  });

  it("should calculate the inverse", () => {
    const a = mat4(-5, 2, 6, -8, 1, -5, 1, 8, 7, 7, -6, -7, 1, -3, 7, 4);
    const b = mat4Inv(mat4(), a);

    const expected = [
      0.21805, 0.45113, 0.2406, -0.04511, -0.80827, -1.45677, -0.44361, 0.52068,
      -0.07895, -0.22368, -0.05263, 0.19737, -0.52256, -0.81391, -0.30075,
      0.30369,
    ];
    for (let i = 0; i < b.length; i++) {
      expect(b[i]).toBeCloseTo(expected[i]);
    }
  });

  it("should construct a translation matrix", () => {
    const m = mat4Translation(mat4(), vec3(5, -3, 2));
    const p = vec3(-3, 4, 5);

    expect(mat4MulVec3(vec3(), m, p)).toEqual(vec3(2, 1, 7));
  });

  it("should construct a scaling matrix", () => {
    const m = mat4Scale(mat4(), vec3(2, 3, 4));
    const p = vec3(-4, 6, 8);

    expect(mat4MulVec3(vec3(), m, p)).toEqual(vec3(-8, 18, 32));
  });

  it("should construct an x rotation matrix", () => {
    const m = mat4RotationX(mat4(), Math.PI / 2);
    const p = vec3(0, 1, 0);
    const actual = mat4MulVec3(vec3(), m, p);
    const expected = vec3(0, 0, 1);

    for (let i = 0; i < actual.length; i++) {
      expect(actual[i]).toBeCloseTo(expected[i]);
    }
  });

  it("should construct a y rotation matrix", () => {
    const m = mat4RotationY(mat4(), Math.PI / 2);
    const p = vec3(0, 0, 1);
    const actual = mat4MulVec3(vec3(), m, p);
    const expected = vec3(1, 0, 0);

    for (let i = 0; i < actual.length; i++) {
      expect(actual[i]).toBeCloseTo(expected[i]);
    }
  });

  it("should construct a z rotation matrix", () => {
    const m = mat4RotationZ(mat4(), Math.PI / 2);
    const p = vec3(0, 1, 0);
    const actual = mat4MulVec3(vec3(), m, p);
    const expected = vec3(-1, 0, 0);

    for (let i = 0; i < actual.length; i++) {
      expect(actual[i]).toBeCloseTo(expected[i]);
    }
  });
});
