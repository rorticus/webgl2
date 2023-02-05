import { Point2D, Vec2 } from "./vec2";

export interface OrientedRectangle2D {
  position: Point2D;
  halfExtents: Vec2;
  rotation: number;
}

export function orientedRectangle2d(
  position: Point2D,
  halfExtents: Vec2,
  rotation: number = 0
): OrientedRectangle2D {
  return { position, halfExtents, rotation };
}
