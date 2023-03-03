import {
  Point3D,
  vec3,
  Vec3,
  vec3Add,
  vec3DistanceTo,
  vec3Dot,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
} from "./vec3";
import {
  AABB,
  Line3D,
  OOB,
  Plane3D,
  Ray3D,
  Sphere3D,
  Triangle3D,
} from "../types";
import { Point2D, vec2DistanceToSq } from "./vec2";
import { mat3, mat3Identity } from "./mat3";

export function line3d(a: Point3D, b: Point3D): Line3D {
  return {
    start: a,
    end: b,
  };
}

export function line3DLength(line: Line3D) {
  return vec3DistanceTo(line.start, line.end);
}

export function line3DLengthSq(line: Line3D) {
  return vec2DistanceToSq(line.start, line.end);
}

export function ray3D(origin: Point3D, direction: Vec3): Ray3D {
  return {
    origin,
    direction: vec3Normalize(direction, direction),
  };
}

export function ray3DFromPoints(a: Point3D, b: Point3D): Ray3D {
  const direction = vec3Normalize(vec3(), vec3Sub(vec3(), a, b));
  return ray3D(a, direction);
}

export function sphere3d(position: Point3D, radius: number): Sphere3D {
  return {
    position,
    radius,
  };
}

export function aabb(origin = vec3(), size = vec3(1, 1, 1)): AABB {
  return {
    origin,
    size,
  };
}

export function aabbMin(aab: AABB) {
  const p1 = vec3Add(vec3(), aab.origin, aab.size);
  const p2 = vec3Sub(vec3(), aab.origin, aab.size);

  return vec3(
    Math.min(p1[0], p2[0]),
    Math.min(p1[1], p2[1]),
    Math.min(p1[2], p2[2])
  );
}

export function aabbMax(aab: AABB) {
  const p1 = vec3Add(vec3(), aab.origin, aab.size);
  const p2 = vec3Sub(vec3(), aab.origin, aab.size);

  return vec3(
    Math.max(p1[0], p2[0]),
    Math.max(p1[1], p2[1]),
    Math.max(p1[2], p2[2])
  );
}

export function aabbFromMinMax(min: Point3D, max: Point3D) {
  return aabb(
    vec3Scale(vec3(), vec3Add(vec3(), min, max), 0.5),
    vec3Scale(vec3(), vec3Sub(vec3(), max, min), 0.5)
  );
}

export function oob(
  position = vec3(),
  size = vec3(1, 1, 1),
  orientation = mat3Identity(mat3())
): OOB {
  return {
    position,
    size,
    orientation,
  };
}

export function plane3d(normal = vec3(1, 0, 0), distance = 0): Plane3D {
  return {
    normal,
    distance,
  };
}

export function plane3dEquation(plane: Plane3D, point: Point3D) {
  return vec3Dot(plane.normal, point) - plane.distance;
}

export function triangle3d(a: Point3D, b: Point3D, c: Point3D): Triangle3D {
  return {
    a,
    b,
    c,
  };
}
