import { describe, it, expect } from "vitest";
import {
  vec3,
  vec3Add,
  vec3Cross,
  vec3Divide,
  vec3Dot,
  vec3Magnitude,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
} from "../src/gl/vec3";

describe("vec3", () => {
  it("adds vectors", () => {
    const a = vec3(1, 2, 3);
    const b = vec3(4, 5, 6);
    const expected = vec3(5, 7, 9);
    const actual = vec3Add(vec3(), a, b);
    expect(actual).toEqual(expected);
  });

  it("subtracts vectors", () => {
    const a = vec3(1, 2, 3);
    const b = vec3(4, 5, 6);
    const expected = vec3(-3, -3, -3);
    const actual = vec3Sub(vec3(), a, b);
    expect(actual).toEqual(expected);
  });

  it("scales vectors", () => {
    const a = vec3(1, 2, 3);
    const expected = vec3(2, 4, 6);
    const actual = vec3Scale(vec3(), a, 2);
    expect(actual).toEqual(expected);
  });

  it("divides vectors", () => {
    const a = vec3(2, 4, 6);
    const expected = vec3(1, 2, 3);
    const actual = vec3Scale(vec3(), a, 0.5);
    expect(actual).toEqual(expected);
  });

  it("calculates dot product", () => {
    const a = vec3(1, 2, 3);
    const b = vec3(4, 5, 6);
    const expected = 32;
    const actual = vec3Dot(a, b);
    expect(actual).toEqual(expected);
  });

  it("calculates cross product", () => {
    const a = vec3(1, 2, 3);
    const b = vec3(2, 3, 4);
    const expected = vec3(-1, 2, -1);
    const actual = vec3Cross(vec3(), a, b);
    expect(actual).toEqual(expected);
  });

  it("calculates magnitude", () => {
    const a = vec3(1, 2, 3);
    const expected = Math.sqrt(14);
    const actual = vec3Magnitude(a);
    expect(actual).toEqual(expected);
  });

  it("normalizes vectors", () => {
    const a = vec3(1, 2, 3);
    const expected = vec3(
      1 / Math.sqrt(14),
      2 / Math.sqrt(14),
      3 / Math.sqrt(14)
    );
    const actual = vec3Normalize(vec3(), a);
    expect(actual).toEqual(expected);
  });

  it("calculates division", () => {
    const a = vec3(2, 4, 6);
    const expected = vec3(1, 2, 3);
    const actual = vec3Divide(vec3(), a, 2);
    expect(actual).toEqual(expected);
  });
});
