import {
  Point2D,
  vec2,
  vec2Add,
  vec2Dot,
  vec2Mul,
  vec2Scale,
  vec2Sub,
} from "./vec2";
import { line2d, Line2D, line2dLengthSq } from "./line2d";
import {
  rectangle2d,
  Rectangle2D,
  rectangle2dMax,
  rectangle2dMin,
} from "./rectangle2d";
import { OrientedRectangle2D } from "./oriententedRectangle2d";
import { circle2d, Circle2D } from "./circle2d";

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

export function lineCircle(l: Line2D, c: Circle2D) {
  const ab = vec2Sub(vec2(), l.end, l.start);
  const t = vec2Dot(vec2Sub(vec2(), c.position, l.start), ab) / vec2Dot(ab, ab);

  if (t < 0 || t > 1.0) {
    return false;
  }

  const p = vec2Add(vec2(), l.start, vec2Scale(vec2(), ab, t));
  const circleToClosest = line2d(c.position, p);

  return line2dLengthSq(circleToClosest) < c.radius * c.radius;
}

export function lineRectangle(l: Line2D, r: Rectangle2D) {
  if (pointInRectangle(l.start, r) || pointInRectangle(l.end, r)) {
    return true;
  }

  const normal = vec2Sub(vec2(), l.end, l.start);
  normal[0] = normal[0] != 0 ? 1 / normal[0] : 0;
  normal[1] = normal[1] != 0 ? 1 / normal[1] : 0;

  const min = vec2Mul(
    vec2(),
    vec2Sub(vec2(), rectangle2dMin(r), l.start),
    normal
  );
  const max = vec2Mul(
    vec2(),
    vec2Sub(vec2(), rectangle2dMax(r), l.start),
    normal
  );

  const tmin = Math.max(Math.min(min[0], max[0]), Math.min(min[1], max[1]));
  const tmax = Math.min(Math.max(min[0], max[0]), Math.max(min[1], max[1]));

  if (tmax < 0 || tmin > tmax) {
    return false;
  }

  const t = tmin < 0 ? tmax : tmin;

  return t > 0 && t * t < line2dLengthSq(l);
}

export function lineOrientedRectangle(l: Line2D, r: OrientedRectangle2D) {
  const rotVector = vec2Sub(vec2(), l.start, r.position);
  const theta = -deg2rad(r.rotation);

  const rotatedX =
    rotVector[0] * Math.cos(theta) - rotVector[1] * Math.sin(theta);
  const rotatedY =
    rotVector[0] * Math.sin(theta) + rotVector[1] * Math.cos(theta);

  const localLine = line2d(
    vec2(rotatedX, rotatedY),
    vec2(rotatedX + l.end[0] - l.start[0], rotatedY + l.end[1] - l.start[1])
  );

  const localRectangle = rectangle2d(
    vec2(),
    vec2Scale(vec2(), r.halfExtents, 2)
  );

  return lineRectangle(localLine, localRectangle);
}

export function circleCircle(c1: Circle2D, c2: Circle2D) {
  const line = line2d(c1.position, c2.position);
  if (
    line2dLengthSq(line) <
    (c1.radius + c2.radius) * (c1.radius + c2.radius)
  ) {
    return true;
  }

  return false;
}

export function circleRectangle(c: Circle2D, r: Rectangle2D) {
  const min = rectangle2dMin(r);
  const max = rectangle2dMax(r);

  const closestPoint = vec2(c.position[0], c.position[1]);
  closestPoint[0] = Math.max(min[0], Math.min(max[0], closestPoint[0]));
  closestPoint[1] = Math.max(min[1], Math.min(max[1], closestPoint[1]));

  const line = line2d(c.position, closestPoint);

  return line2dLengthSq(line) < c.radius * c.radius;
}

export function circleOrientedRectangle(c: Circle2D, r: OrientedRectangle2D) {
  const rotVector = vec2Sub(vec2(), c.position, r.position);
  const theta = -deg2rad(r.rotation);

  const rotatedX =
    rotVector[0] * Math.cos(theta) - rotVector[1] * Math.sin(theta);
  const rotatedY =
    rotVector[0] * Math.sin(theta) + rotVector[1] * Math.cos(theta);

  const localCircle = circle2d(vec2(rotatedX, rotatedY), c.radius);
  const localRectangle = rectangle2d(
    vec2(),
    vec2Scale(vec2(), r.halfExtents, 2)
  );

  return circleRectangle(localCircle, localRectangle);
}

export function rectangleRectangle(r1: Rectangle2D, r2: Rectangle2D) {
  const min1 = rectangle2dMin(r1);
  const max1 = rectangle2dMax(r1);

  const min2 = rectangle2dMin(r2);
  const max2 = rectangle2dMax(r2);

  return (
    min1[0] < max2[0] &&
    max1[0] > min2[0] &&
    min1[1] < max2[1] &&
    max1[1] > min2[1]
  );
}
