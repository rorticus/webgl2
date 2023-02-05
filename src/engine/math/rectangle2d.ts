import { Point2D, vec2, Vec2, vec2Add, vec2Sub } from "./vec2";

export interface Rectangle2D {
  origin: Point2D;
  size: Vec2;
}

export function rectangle2d(origin: Point2D, size: Vec2): Rectangle2D {
  return {
    origin,
    size,
  };
}

export function rectangle2dMin(rect: Rectangle2D): Vec2 {
  const p1 = rect.origin;
  const p2 = vec2Add(vec2(), rect.origin, rect.size);

  return vec2(Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]));
}

export function rectangle2dMax(rect: Rectangle2D): Vec2 {
  const p1 = rect.origin;
  const p2 = vec2Add(vec2(), rect.origin, rect.size);

  return vec2(Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1]));
}

export function rectangleFromMinMax(min: Vec2, max: Vec2): Rectangle2D {
  return rectangle2d(min, vec2Sub(vec2(), max, min));
}
