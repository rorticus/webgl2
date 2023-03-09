import {
  Point3D,
  vec3,
  Vec3,
  vec3Add,
  vec3Cross,
  vec3DistanceTo,
  vec3DistanceToSq,
  vec3Dot,
  vec3Magnitude,
  vec3MagnitudeSq,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
} from "./vec3";
import {
  AABB,
  Line3D,
  OBB,
  Plane3D,
  Ray3D,
  Sphere3D,
  Triangle3D,
} from "../types";
import { vec2DistanceToSq } from "./vec2";
import { mat3, mat3Identity } from "./mat3";

export interface Interval3D {
  min: number;
  max: number;
}

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

export function obb(
  position = vec3(),
  size = vec3(1, 1, 1),
  orientation = mat3Identity(mat3())
): OBB {
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

export function pointInOBB(point: Point3D, obb: OBB) {
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

export function closetPointOBB(point: Point3D, obb: OBB) {
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

export function sphereSphere(sphere1: Sphere3D, sphere2: Sphere3D) {
  const distance = vec3DistanceToSq(sphere1.position, sphere2.position);
  return distance <= Math.pow(sphere1.radius + sphere2.radius, 2);
}

export function sphereAABB(sphere: Sphere3D, aabb: AABB) {
  const closest = closestPointAABB(sphere.position, aabb);
  const distance = vec3DistanceToSq(sphere.position, closest);

  return distance <= sphere.radius * sphere.radius;
}

export function sphereOBB(sphere: Sphere3D, obb: OBB) {
  const closest = closetPointOBB(sphere.position, obb);
  const distance = vec3DistanceToSq(sphere.position, closest);

  return distance <= sphere.radius * sphere.radius;
}

export function spherePlane(sphere: Sphere3D, plane: Plane3D) {
  const closest = closestPointPlane(sphere.position, plane);
  const distance = vec3DistanceToSq(sphere.position, closest);

  return distance <= sphere.radius * sphere.radius;
}

export function aabbAABB(aabb1: AABB, aabb2: AABB) {
  const aMin = aabbMin(aabb1);
  const aMax = aabbMax(aabb1);
  const bMin = aabbMin(aabb2);
  const bMax = aabbMax(aabb2);

  return (
    aMin[0] <= bMax[0] &&
    aMax[0] >= bMin[0] &&
    aMin[1] <= bMax[1] &&
    aMax[1] >= bMin[1] &&
    aMin[2] <= bMax[2] &&
    aMax[2] >= bMin[2]
  );
}

export function getIntervalAABB(aabb: AABB, axis: Vec3): Interval3D {
  const i = aabbMin(aabb);
  const a = aabbMax(aabb);

  const vertex = [
    vec3(i[0], a[1], a[2]),
    vec3(i[0], a[1], i[2]),
    vec3(i[0], i[1], a[2]),
    vec3(i[0], i[1], i[2]),
    vec3(a[0], a[1], a[2]),
    vec3(a[0], a[1], i[2]),
    vec3(a[0], i[1], a[2]),
    vec3(a[0], i[1], i[2]),
  ];

  let min = vec3Dot(axis, vertex[0]);
  let max = min;

  for (let i = 1; i < 8; i++) {
    const projection = vec3Dot(axis, vertex[i]);

    if (projection < min) {
      min = projection;
    } else if (projection > max) {
      max = projection;
    }
  }

  return {
    min,
    max,
  };
}

export function getIntervalOBB(obb: OBB, axis: Vec3) {
  const c = obb.position;
  const e = obb.size;
  const A = [
    vec3(obb.orientation[0], obb.orientation[1], obb.orientation[2]),
    vec3(obb.orientation[3], obb.orientation[4], obb.orientation[5]),
    vec3(obb.orientation[6], obb.orientation[7], obb.orientation[8]),
  ];

  const vertex = [
    vec3(c[0] + e[0] * A[0][0] + e[1] * A[1][0] + e[2] * A[2][0]),
    vec3(c[0] + e[0] * A[0][0] + e[1] * A[1][0] - e[2] * A[2][0]),
    vec3(c[0] + e[0] * A[0][0] - e[1] * A[1][0] + e[2] * A[2][0]),
    vec3(c[0] + e[0] * A[0][0] - e[1] * A[1][0] - e[2] * A[2][0]),
    vec3(c[0] - e[0] * A[0][0] + e[1] * A[1][0] + e[2] * A[2][0]),
    vec3(c[0] - e[0] * A[0][0] + e[1] * A[1][0] - e[2] * A[2][0]),
    vec3(c[0] - e[0] * A[0][0] - e[1] * A[1][0] + e[2] * A[2][0]),
    vec3(c[0] - e[0] * A[0][0] - e[1] * A[1][0] - e[2] * A[2][0]),
  ];

  let min = vec3Dot(axis, vertex[0]);
  let max = min;

  for (let i = 1; i < 8; i++) {
    const projection = vec3Dot(axis, vertex[i]);

    if (projection < min) {
      min = projection;
    } else if (projection > max) {
      max = projection;
    }
  }

  return {
    min,
    max,
  };
}

export function overlapOnAxisAABBOBB(aabb: AABB, obb: OBB, axis: Vec3) {
  let a = getIntervalAABB(aabb, axis);
  let b = getIntervalOBB(obb, axis);

  return a.min <= b.max && b.min <= a.max;
}

export function aabbOOB(aabb: AABB, obb: OBB) {
  const test = [
    vec3(1, 0, 0),
    vec3(0, 1, 0),
    vec3(0, 0, 1),
    vec3(obb.orientation[0], obb.orientation[1], obb.orientation[2]),
    vec3(obb.orientation[3], obb.orientation[4], obb.orientation[5]),
    vec3(obb.orientation[6], obb.orientation[7], obb.orientation[8]),
  ];

  for (let i = 0; i < 3; i++) {
    test.push(vec3Cross(vec3(), test[i], test[0]));
    test.push(vec3Cross(vec3(), test[i], test[1]));
    test.push(vec3Cross(vec3(), test[i], test[2]));
  }

  for (let i = 0; i < test.length; i++) {
    if (!overlapOnAxisAABBOBB(aabb, obb, test[i])) {
      return false;
    }
  }

  return true;
}

export function aabbPlane(aabb: AABB, plane: Plane3D) {
  const len =
    aabb.size[0] * Math.abs(plane.normal[0]) +
    aabb.size[1] * Math.abs(plane.normal[1]) +
    aabb.size[2] * Math.abs(plane.normal[2]);

  const dot = vec3Dot(plane.normal, aabb.origin);
  const dist = dot - plane.distance;

  return Math.abs(dist) <= len;
}

export function overlapOnAxisOBBOBB(a: OBB, b: OBB, axis: Vec3) {
  let aInterval = getIntervalOBB(a, axis);
  let bInterval = getIntervalOBB(b, axis);

  return aInterval.min <= bInterval.max && bInterval.min <= aInterval.max;
}

export function obbOBB(obb1: OBB, obb2: OBB) {
  const test = [
    vec3(obb1.orientation[0], obb1.orientation[1], obb1.orientation[2]),
    vec3(obb1.orientation[3], obb1.orientation[4], obb1.orientation[5]),
    vec3(obb1.orientation[6], obb1.orientation[7], obb1.orientation[8]),
    vec3(obb2.orientation[0], obb2.orientation[1], obb2.orientation[2]),
    vec3(obb2.orientation[3], obb2.orientation[4], obb2.orientation[5]),
    vec3(obb2.orientation[6], obb2.orientation[7], obb2.orientation[8]),
  ];

  for (let i = 0; i < 3; i++) {
    test.push(vec3Cross(vec3(), test[i], test[0]));
    test.push(vec3Cross(vec3(), test[i], test[1]));
    test.push(vec3Cross(vec3(), test[i], test[2]));
  }

  for (let i = 0; i < test.length; i++) {
    if (!overlapOnAxisOBBOBB(obb1, obb2, test[i])) {
      return false;
    }
  }

  return true;
}

export function obbPlane(obb: OBB, plane: Plane3D) {
  const rot = [
    vec3(obb.orientation[0], obb.orientation[1], obb.orientation[2]),
    vec3(obb.orientation[3], obb.orientation[4], obb.orientation[5]),
    vec3(obb.orientation[6], obb.orientation[7], obb.orientation[8]),
  ];

  const len =
    Math.abs(vec3Dot(rot[0], plane.normal)) * obb.size[0] +
    Math.abs(vec3Dot(rot[1], plane.normal)) * obb.size[1] +
    Math.abs(vec3Dot(rot[2], plane.normal)) * obb.size[2];

  const dot = vec3Dot(plane.normal, obb.position);
  const dist = dot - plane.distance;

  return Math.abs(dist) <= len;
}

export function planePlane(a: Plane3D, b: Plane3D) {
  const dot = vec3Cross(vec3(), a.normal, b.normal);

  return cmp(vec3Dot(dot, dot), 0);
}

export function raycastSphere(ray: Ray3D, sphere: Sphere3D) {
  const e = vec3Sub(vec3(), sphere.position, ray.origin);
  const rSq = sphere.radius * sphere.radius;
  const eSq = vec3MagnitudeSq(e);

  const a = vec3Dot(e, ray.direction);
  const bSq = eSq - a * a;
  const f = Math.sqrt(rSq - bSq);

  if (rSq - (eSq - a * a) < 0) {
    return -1;
  } else if (eSq < rSq) {
    return a + f;
  }

  return a - f;
}

export function raycastAABB(ray: Ray3D, aabb: AABB) {
  const min = aabbMin(aabb);
  const max = aabbMax(aabb);

  const t1 = (min[0] - ray.origin[0]) / ray.direction[0];
  const t2 = (max[0] - ray.origin[0]) / ray.direction[0];
  const t3 = (min[1] - ray.origin[1]) / ray.direction[1];
  const t4 = (max[1] - ray.origin[1]) / ray.direction[1];
  const t5 = (min[2] - ray.origin[2]) / ray.direction[2];
  const t6 = (max[2] - ray.origin[2]) / ray.direction[2];

  const tmin = Math.max(
    Math.max(Math.min(t1, t2), Math.min(t3, t4)),
    Math.min(t5, t6)
  );
  const tmax = Math.min(
    Math.min(Math.min(t1, t2, Math.min(t3, t4)), Math.min(t5, t6))
  );

  if (tmax < 0) {
    return -1;
  }

  if (tmin > tmax) {
    return -1;
  }

  if (tmin < 0) {
    return tmax;
  }

  return tmin;
}

export function raycastOBB(ray: Ray3D, obb: OBB) {
  const x = vec3(obb.orientation[0], obb.orientation[1], obb.orientation[2]);
  const y = vec3(obb.orientation[3], obb.orientation[4], obb.orientation[5]);
  const z = vec3(obb.orientation[6], obb.orientation[7], obb.orientation[8]);

  const p = vec3Sub(vec3(), obb.position, ray.origin);
  const f = vec3(
    vec3Dot(x, ray.direction),
    vec3Dot(y, ray.direction),
    vec3Dot(z, ray.direction)
  );

  const e = vec3(vec3Dot(x, p), vec3Dot(y, p), vec3Dot(z, p));

  const t = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 3; i++) {
    if (cmp(f[i], 0)) {
      if (-e[i] - obb.size[i] > 0 || -e[i] + obb.size[i] < 0) {
        return -1;
      }
      f[i] = 0.00001;
    }

    t[i * 2] = (e[i] + obb.size[i]) / f[i];
    t[i * 2 + 1] = (e[i] - obb.size[i]) / f[i];
  }

  const tmin = Math.max(
    Math.max(Math.min(t[0], t[1]), Math.min(t[2], t[3]), Math.min(t[4], t[5]))
  );
  const tmax = Math.min(
    Math.min(Math.max(t[0], t[1], Math.max(t[2], t[3])), Math.max(t[4], t[5]))
  );

  if (tmax < 0) {
    return -1;
  }

  if (tmin > tmax) {
    return -1;
  }

  if (tmin < 0) {
    return tmax;
  }

  return tmin;
}

export function raycastPlane(ray: Ray3D, plane: Plane3D) {
  const nd = vec3Dot(ray.direction, plane.normal);
  const pn = vec3Dot(ray.origin, plane.normal);

  if (nd >= 0) {
    return -1;
  }

  const t = (plane.distance - pn) / nd;

  if (t >= 0) {
    return t;
  }

  return -1;
}

export function lineTestSphere(line: Line3D, sphere: Sphere3D) {
  const closest = closestPointLine(sphere.position, line);
  const distSq = vec3MagnitudeSq(vec3Sub(vec3(), sphere.position, closest));

  return distSq < sphere.radius * sphere.radius;
}

export function lineTestAABB(line: Line3D, aabb: AABB) {
  const ray = ray3D(line.start, vec3Sub(vec3(), line.end, line.start));
  const t = raycastAABB(ray, aabb);

  return t >= 0 && t * t < line3DLengthSq(line);
}

export function lineTestOBB(line: Line3D, obb: OBB) {
  const ray = ray3D(line.start, vec3Sub(vec3(), line.end, line.start));
  const t = raycastOBB(ray, obb);

  return t >= 0 && t * t < line3DLengthSq(line);
}

export function lineTestPlane(line: Line3D, plane: Plane3D) {
  const ab = vec3Sub(vec3(), line.end, line.start);
  const nA = vec3Dot(plane.normal, line.start);
  const nAB = vec3Dot(plane.normal, ab);

  const t = (plane.distance - nA) / nAB;

  return t >= 0 && t <= 1;
}
