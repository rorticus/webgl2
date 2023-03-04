import {
  Point3D,
  vec3,
  Vec3,
  vec3Add,
  vec3DistanceTo,
  vec3DistanceToSq,
  vec3Divide,
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
import { vec2DistanceToSq } from "./vec2";
import { mat3, mat3Identity } from "./mat3";

function cmp(x: number, y: number) {
  return (
    Math.abs(x - y) <
    Number.EPSILON * Math.max(1, Math.max(Math.abs(x), Math.abs(y)))
  );
}

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

export function pointInSphere(point: Point3D, sphere: Sphere3D) {
  return (
    vec3DistanceToSq(point, sphere.position) <= sphere.radius * sphere.radius
  );
}

export function sphereClosestPoint(point: Point3D, sphere: Sphere3D) {
  const direction = vec3Sub(vec3(), point, sphere.position);
  const distance = vec3DistanceTo(point, sphere.position);
  const scale = sphere.radius / distance;

  return vec3Add(vec3(), sphere.position, vec3Scale(vec3(), direction, scale));
}

export function pointInAABB(point: Point3D, aabb: AABB) {
  const min = aabbMin(aabb);
  const max = aabbMax(aabb);

  if (
    point[0] < min[0] ||
    point[0] > max[0] ||
    point[1] < min[1] ||
    point[1] > max[1] ||
    point[2] < min[2] ||
    point[2] > max[2]
  ) {
    return false;
  }

  return true;
}

export function closestPointAABB(point: Point3D, aabb: AABB) {
  const min = aabbMin(aabb);
  const max = aabbMax(aabb);

  return vec3(
    Math.max(min[0], Math.min(max[0], point[0])),
    Math.max(min[1], Math.min(max[1], point[1])),
    Math.max(min[2], Math.min(max[2], point[2]))
  );
}

export function pointInOBB(point: Point3D, obb: OOB) {
  const dir = vec3Sub(vec3(), point, obb.position);

  for (let i = 0; i < 3; i++) {
    const axis = vec3(
      obb.orientation[i],
      obb.orientation[i + 1],
      obb.orientation[i + 2]
    );
    const distance = vec3Dot(dir, axis);

    if (distance > obb.size[i] || distance < -obb.size[i]) {
      return false;
    }
  }

  return true;
}

export function closetPointOBB(point: Point3D, obb: OOB) {
  const result = vec3(...obb.position);
  const dir = vec3Sub(vec3(), point, obb.position);

  for (let i = 0; i < 3; i++) {
    const axis = vec3(
      obb.orientation[i],
      obb.orientation[i + 1],
      obb.orientation[i + 2]
    );
    let distance = vec3Dot(dir, axis);

    if (distance > obb.size[i]) {
      distance = obb.size[i];
    }
    if (distance < -obb.size[i]) {
      distance = -obb.size[i];
    }

    vec3Add(result, result, vec3Scale(vec3(), axis, distance));
  }

  return result;
}

export function pointOnPlane(point: Point3D, plane: Plane3D) {
  return cmp(vec3Dot(plane.normal, point), plane.distance);
}

export function closestPointPlane(point: Point3D, plane: Plane3D) {
  const distance = plane3dEquation(plane, point);
  return vec3Sub(vec3(), point, vec3Scale(vec3(), plane.normal, distance));
}

export function closestPointLine(point: Point3D, line: Line3D) {
  const lVec = vec3Sub(vec3(), line.end, line.start);
  let t =
    vec3Dot(vec3Sub(vec3(), point, line.start), lVec) / vec3Dot(lVec, lVec);

  if (t < 0) {
    t = 0;
  }
  if (t > 1) {
    t = 1;
  }

  return vec3Add(vec3(), line.start, vec3Scale(vec3(), lVec, t));
}

export function pointOnLine(point: Point3D, line: Line3D) {
  const closest = closestPointLine(point, line);
  const distanceSq = vec3DistanceToSq(point, closest);

  return cmp(distanceSq, 0);
}

export function pointOnRay(point: Point3D, ray: Ray3D) {
  if (
    point[0] == ray.origin[0] &&
    point[1] == ray.origin[1] &&
    point[2] == ray.origin[2]
  ) {
    return true;
  }

  const norm = vec3Normalize(vec3(), vec3Sub(vec3(), point, ray.origin));
  const diff = vec3Dot(norm, ray.direction);

  return cmp(diff, 1);
}

export function closestPointRay(point: Point3D, ray: Ray3D) {
  let t = vec3Dot(vec3Sub(vec3(), point, ray.origin), ray.direction);

  t = Math.max(t, 0);

  return vec3Add(vec3(), ray.origin, vec3Scale(vec3(), ray.direction, t));
}
