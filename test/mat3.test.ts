import { describe, it, expect } from "vitest";
import {
  mat3,
  mat3Cofactor,
  mat3Det,
  mat3Minor,
  mat3Sub,
} from "../src/engine/math/mat3";
import { mat2 } from "../src/engine/math/mat2";

describe("mat3", () => {
  it("creates a submatrix", () => {
    const a = mat3(1, 2, 3, 4, 5, 6, 7, 8, 9);
    const expected = mat2(1, 3, 7, 9);
    const actual = mat3Sub(mat2(), a, 1, 1);
    expect(actual).toEqual(expected);
  });

  it("calculates a minor", () => {
    const a = mat3(3, 5, 0, 2, -1, -7, 6, -1, 5);
    const expected = 25;
    const actual = mat3Minor(a, 1, 0);
    expect(actual).toEqual(expected);
  });

  it("calculates a cofactor", () => {
    const a = mat3(3, 5, 0, 2, -1, -7, 6, -1, 5);

    expect(mat3Cofactor(a, 0, 0)).toEqual(-12);
    expect(mat3Cofactor(a, 1, 0)).toEqual(-25);
  });

  it("calculates the determinant", () => {
    const a = mat3(1, 2, 6, -5, 8, -4, 2, 6, 4);
    expect(mat3Cofactor(a, 0, 0)).toEqual(56);
    expect(mat3Cofactor(a, 0, 1)).toEqual(12);
    expect(mat3Cofactor(a, 0, 2)).toEqual(-46);
    expect(mat3Det(a)).toEqual(-196);
  });
});
