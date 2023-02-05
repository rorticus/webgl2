import { Point2D, vec2, vec2Add, vec2Scale, vec2Sub } from "./vec2";
import { line2d, Line2D, line2dLengthSq } from "./line2d";
import {
  rectangle2d,
  Rectangle2D,
  rectangle2dMax,
  rectangle2dMin,
} from "./rectangle2d";
import { OrientedRectangle2D } from "./oriententedRectangle2d";
import { Circle2D } from "./circle2d";

function cmp(x: number, y: number) {
  return (
    Math.abs(x - y) <
    Number.EPSILON * Math.max(1, Math.max(Math.abs(x), Math.abs(y)))
  );
}

function deg2rad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function pointOnLine(point: Point2D, line: Line2D): boolean {
  const dy = line.end[1] - line.start[1];
  const dx = line.end[0] - line.start[0];
  const m = dy / dx;
  const b = line.start[1] - m * line.start[0];

  return cmp(point[1], m * point[0] + b);
}

export function pointInCircle(point: Point2D, circle: Circle2D): boolean {
  const line = line2d(point, circle.position);
  if (line2dLengthSq(line) < circle.radius * circle.radius) {
    return true;
  }

  return false;
}

export function pointInRectangle(
  point: Point2D,
  rectangle: Rectangle2D
): boolean {
  const min = rectangle2dMin(rectangle);
  const max = rectangle2dMax(rectangle);

  return (
    point[0] >= min[0] &&
    point[0] <= max[0] &&
    point[1] >= min[1] &&
    point[1] <= max[1]
  );
}

export function pointInOrientedRectangle(
  point: Point2D,
  rectangle: OrientedRectangle2D
): boolean {
  const rotVector = vec2Sub(vec2(), point, rectangle.position);
  const theta = -deg2rad(rectangle.rotation);

  const rotatedX =
    rotVector[0] * Math.cos(theta) - rotVector[1] * Math.sin(theta);
  const rotatedY =
    rotVector[0] * Math.sin(theta) + rotVector[1] * Math.cos(theta);

  const localRectangle = rectangle2d(
    vec2(),
    vec2Scale(vec2(), rectangle.halfExtents, 2)
  );
  const localPoint = vec2Add(
    vec2(),
    vec2(rotatedX, rotatedY),
    rectangle.halfExtents
  );

  return pointInRectangle(localPoint, localRectangle);
}
