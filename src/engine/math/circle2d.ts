import { Point2D } from "./vec2";

export interface Circle2D {
  position: Point2D;
  radius: number;
}

export function circle2d(position: Point2D, radius: number = 1): Circle2D {
  return { position, radius };
}
