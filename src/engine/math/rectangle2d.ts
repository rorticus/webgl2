import { Point2D, vec2, Vec2, vec2Add, vec2Dot, vec2Sub } from "./vec2";
import { Interval2D } from "../types";

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

export function rectangleInterval(rect: Rectangle2D, axis: Vec2): Interval2D {
  const min = rectangle2dMin(rect);
  const max = rectangle2dMax(rect);

  const verts: Vec2[] = [
    vec2(min[0], min[1]),
    vec2(min[0], max[1]),
    vec2(max[0], min[1]),
    vec2(max[0], max[1]),
  ];

  let mn = vec2Dot(verts[0], axis);
  let mx = mn;

  for (let i = 1; i < verts.length; i++) {
    const proj = vec2Dot(verts[i], axis);

    if (proj < mn) {
      mn = proj;
    }
    if (proj > mx) {
      mx = proj;
    }
  }

  return {
    min: mn,
    max: mx,
  };
}
