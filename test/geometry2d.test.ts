import { describe, it, expect } from "vitest";
import {
  pointInCircle,
  pointInOrientedRectangle,
  pointInRectangle,
  pointOnLine,
} from "../src/engine/math/geometry2d";
import { vec2 } from "../src/engine/math/vec2";
import { line2d } from "../src/engine/math/line2d";
import { circle2d } from "../src/engine/math/circle2d";
import { rectangle2d } from "../src/engine/math/rectangle2d";
import { orientedRectangle2d } from "../src/engine/math/oriententedRectangle2d";

describe("geometry2d", () => {
  describe("pointOnLine", () => {
    it("should return true if point is on line", () => {
      expect(pointOnLine(vec2(0, 0), line2d(vec2(0, 0), vec2(1, 1)))).toBe(
        true
      );
    });

    it("should return false if point is not on line", () => {
      expect(pointOnLine(vec2(4, 0), line2d(vec2(0, 0), vec2(1, 1)))).toBe(
        false
      );
    });
  });

  describe("pointInCircle", () => {
    it("should return true if point is in circle", () => {
      expect(pointInCircle(vec2(0, 0), circle2d(vec2(0, 0), 1))).toBe(true);
      expect(pointInCircle(vec2(0, 0.99), circle2d(vec2(0, 0), 1))).toBe(true);
    });

    it("should return false if point is not in circle", () => {
      expect(pointInCircle(vec2(4, 0), circle2d(vec2(0, 0), 1))).toBe(false);
    });
  });

  describe("pointInRectangle", () => {
    it("should return true if point is in rectangle", () => {
      expect(
        pointInRectangle(vec2(0, 0), rectangle2d(vec2(0, 0), vec2(1, 1)))
      ).toBe(true);
    });

    it("should return false if point is not in rectangle", () => {
      expect(
        pointInRectangle(vec2(4, 0), rectangle2d(vec2(0, 0), vec2(1, 1)))
      ).toBe(false);
    });
  });

  describe("pointInOrientedRectangle", () => {
    it("should return true if point is in rectangle", () => {
      expect(
        pointInOrientedRectangle(
          vec2(0, 0),
          orientedRectangle2d(vec2(0, 0), vec2(0.5, 0.5), 45)
        )
      ).toBe(true);

      expect(
        pointInOrientedRectangle(
          vec2(0.25, 0.25),
          orientedRectangle2d(vec2(0, 0), vec2(0.5, 0.5), 45)
        )
      ).toBe(true);
    });
  });
});
