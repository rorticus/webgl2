import {
  Point2D,
  Vec2,
  vec2,
  vec2Add,
  vec2DistanceToSq,
  vec2Dot,
  vec2Mul,
  vec2Normalize,
  vec2Scale,
  vec2Sub,
} from "./vec2";
import { line2d, Line2D, line2dLengthSq } from "./line2d";
import {
  rectangle2d,
  Rectangle2D,
  rectangle2dMax,
  rectangle2dMin,
  rectangleFromMinMax,
  rectangleInterval,
} from "./rectangle2d";
import {
  orientedRectangle2d,
  OrientedRectangle2D,
  orientedRectangleInterval,
} from "./oriententedRectangle2d";
import { circle2d, Circle2D } from "./circle2d";
import { deg2rad } from "./angles";
import { Shape2D } from "../types";

function cmp(x: number, y: number) {
  return (
    Math.abs(x - y) <
    Number.EPSILON * Math.max(1, Math.max(Math.abs(x), Math.abs(y)))
  );
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

export function overlapOnAxisRectRect(
  rect1: Rectangle2D,
  rect2: Rectangle2D,
  axis: Vec2
) {
  const a = rectangleInterval(rect1, axis);
  const b = rectangleInterval(rect2, axis);

  return b.min <= a.max && a.min <= b.max;
}

export function rectangleRectangleSAT(r1: Rectangle2D, r2: Rectangle2D) {
  const axes = [vec2(1, 0), vec2(0, 1)];

  for (let i = 0; i < axes.length; i++) {
    if (!overlapOnAxisRectRect(r1, r2, axes[i])) {
      return false;
    }
  }

  return true;
}

export function overlapOnAxisRectOrientedRect(
  rect: Rectangle2D,
  orientedRect: OrientedRectangle2D,
  axis: Vec2
) {
  const a = rectangleInterval(rect, axis);
  const b = orientedRectangleInterval(orientedRect, axis);

  return b.min <= a.max && a.min <= b.max;
}

export function rectangleOrientedRectangle(
  r1: Rectangle2D,
  r2: OrientedRectangle2D
) {
  const axes = [vec2(1, 0), vec2(0, 1)];

  const t = deg2rad(r2.rotation);
  const cos = Math.cos(t);
  const sin = Math.sin(t);

  const axis = vec2(r2.halfExtents[0], 0);
  vec2Normalize(axis, axis);
  axes.push(vec2(axis[0] * cos - axis[1] * sin, axis[0] * sin + axis[1] * cos));

  axis[0] = 0;
  axis[1] = r2.halfExtents[1];
  vec2Normalize(axis, axis);
  axes.push(vec2(axis[0] * cos - axis[1] * sin, axis[0] * sin + axis[1] * cos));

  for (let i = 0; i < axes.length; i++) {
    if (!overlapOnAxisRectOrientedRect(r1, r2, axes[i])) {
      return false;
    }
  }

  return true;
}

export function orientedRectangleOrientedRectangle(
  r1: OrientedRectangle2D,
  r2: OrientedRectangle2D
) {
  const local1 = rectangle2d(vec2(), vec2Scale(vec2(), r1.halfExtents, 2));
  const r = vec2Sub(vec2(), r2.position, r1.position);
  const local2 = orientedRectangle2d(r2.position, r2.halfExtents, r2.rotation);
  local2.rotation = r2.rotation - r1.rotation;

  const t = -deg2rad(r1.rotation);
  const cos = Math.cos(t);
  const sin = Math.sin(t);

  vec2Add(
    local2.position,
    vec2(r[0] * cos - r[1] * sin, r[0] * sin + r[1] * cos),
    r1.halfExtents
  );

  return rectangleOrientedRectangle(local1, local2);
}

export function containingCircle(points: Point2D[]): Circle2D {
  const center = vec2();
  for (let i = 0; i < points.length; i++) {
    vec2Add(center, center, points[i]);
  }
  vec2Scale(center, center, 1 / points.length);

  let radius = 0;
  for (let i = 0; i < points.length; i++) {
    const d = vec2DistanceToSq(points[i], center);
    if (d > radius) {
      radius = d;
    }
  }

  return circle2d(center, Math.sqrt(radius));
}

export function containingRectangle(points: Point2D[]): Rectangle2D {
  const min = vec2(points[0][0], points[0][1]);
  const max = vec2(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    if (points[i][0] < min[0]) {
      min[0] = points[i][0];
    }
    if (points[i][1] < min[1]) {
      min[1] = points[i][1];
    }
    if (points[i][0] > max[0]) {
      max[0] = points[i][0];
    }
    if (points[i][1] > max[1]) {
      max[1] = points[i][1];
    }
  }

  return rectangleFromMinMax(min, max);
}

export function pointInShape(shape: Shape2D, point: Point2D) {
  if (shape.circles.some((c) => pointInCircle(point, c))) {
    return true;
  }

  if (shape.rectangles.some((r) => pointInRectangle(point, r))) {
    return true;
  }

  return false;
}

export function shapeLine(shape: Shape2D, line: Line2D) {
  if (shape.circles.some((c) => lineCircle(line, c))) {
    return true;
  }

  if (shape.rectangles.some((r) => lineRectangle(line, r))) {
    return true;
  }

  return false;
}

export function shapeCircle(shape: Shape2D, circle: Circle2D) {
  if (shape.circles.some((c) => circleCircle(circle, c))) {
    return true;
  }

  if (shape.rectangles.some((r) => circleRectangle(circle, r))) {
    return true;
  }

  return false;
}

export function shapeRectangle(shape: Shape2D, rectangle: Rectangle2D) {
  if (shape.circles.some((c) => circleRectangle(c, rectangle))) {
    return true;
  }

  if (shape.rectangles.some((r) => rectangleRectangle(rectangle, r))) {
    return true;
  }

  return false;
}

export function shapeOrientedRectangle(
  shape: Shape2D,
  rectangle: OrientedRectangle2D
) {
  if (shape.circles.some((c) => circleOrientedRectangle(c, rectangle))) {
    return true;
  }

  if (shape.rectangles.some((r) => rectangleOrientedRectangle(r, rectangle))) {
    return true;
  }

  return false;
}

export function shapeShape(s1: Shape2D, s2: Shape2D) {
  if (s1.circles.some((c) => shapeCircle(s2, c))) {
    return true;
  }

  if (s1.rectangles.some((r) => shapeRectangle(s2, r))) {
    return true;
  }

  return false;
}