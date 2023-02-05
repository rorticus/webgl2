import { Point2D } from "./vec2";

export type Line2D = {
  start: Point2D;
  end: Point2D;
};

export function line2d(start: Point2D, end: Point2D): Line2D {
  return { start, end };
}

export function line2dLength(line: Line2D): number {
  return Math.sqrt(line2dLengthSq(line));
}

export function line2dLengthSq(line: Line2D): number {
  const dx = line.end[0] - line.start[0];
  const dy = line.end[1] - line.start[1];
  return dx * dx + dy * dy;
}
