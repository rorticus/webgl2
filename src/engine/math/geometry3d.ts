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
  vec3Negative,
  vec3Normalize,
  vec3Project,
  vec3Scale,
  vec3Sub,
  vec3Zero,
} from "./vec3";
import {
  AABB,
  CollisionManifold,
  Line3D,
  OBB,
  Plane3D,
  Ray3D,
  RaycastResult,
  Sphere3D,
  Triangle3D,
} from "../types";
import { vec2DistanceToSq } from "./vec2";
import { quat, quatInvert, vec3TransformQuat } from "./quat";

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
  orientation = quat()
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
  const localPoint = vec3Sub(vec3(), point, obb.position);
  const localPointRotated = vec3TransformQuat(
    vec3(),
    localPoint,
    quatInvert(quat(), obb.orientation)
  );

  return (
    Math.abs(localPointRotated[0]) <= obb.size[0] &&
    Math.abs(localPointRotated[1]) <= obb.size[1] &&
    Math.abs(localPointRotated[2]) <= obb.size[2]
  );
}

export function closestPointOBB(point: Point3D, obb: OBB) {
  const localPoint = vec3Sub(vec3(), point, obb.position);
  const localPointRotated = vec3TransformQuat(
    vec3(),
    localPoint,
    quatInvert(quat(), obb.orientation)
  );

  const closestPoint = vec3(
    Math.max(-obb.size[0], Math.min(obb.size[0], localPointRotated[0])),
    Math.max(-obb.size[1], Math.min(obb.size[1], localPointRotated[1])),
    Math.max(-obb.size[2], Math.min(obb.size[2], localPointRotated[2]))
  );

  return vec3Add(
    vec3(),
    vec3TransformQuat(vec3(), closestPoint, obb.orientation),
    obb.position
  );
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
  const closest = closestPointOBB(sphere.position, obb);
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

export function getOBBCornerPoints(obb: OBB) {
  const cornerPoints: Vec3[] = [];

  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      for (let k = -1; k <= 1; k += 2) {
        cornerPoints.push(
          vec3Add(
            vec3(),
            obb.position,
            vec3(
              i * obb.position[0] + i * obb.size[0],
              j * obb.position[1] + j * obb.size[1],
              k * obb.position[2] + k * obb.size[2]
            )
          )
        );
      }
    }
  }

  return cornerPoints.map((point) => {
    return vec3TransformQuat(vec3(), point, obb.orientation);
  });
}

export function getIntervalOBB(obb: OBB, axis: Vec3) {
  const cornerPoints = getOBBCornerPoints(obb);

  const projections = cornerPoints.map((point) => {
    return vec3Dot(point, axis);
  });

  return {
    min: Math.min(...projections),
    max: Math.max(...projections),
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
    vec3TransformQuat(vec3(), vec3(1, 0, 0), obb.orientation),
    vec3TransformQuat(vec3(), vec3(0, 1, 0), obb.orientation),
    vec3TransformQuat(vec3(), vec3(0, 0, 1), obb.orientation),
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
    vec3TransformQuat(vec3(), vec3(1, 0, 0), obb1.orientation),
    vec3TransformQuat(vec3(), vec3(0, 1, 0), obb1.orientation),
    vec3TransformQuat(vec3(), vec3(0, 0, 1), obb1.orientation),
    vec3TransformQuat(vec3(), vec3(1, 0, 0), obb2.orientation),
    vec3TransformQuat(vec3(), vec3(0, 1, 0), obb2.orientation),
    vec3TransformQuat(vec3(), vec3(0, 0, 1), obb2.orientation),
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

export function pointPlaneDistance(point: Vec3, plane: Plane3D) {
  const [x, y, z] = plane.normal;
  const d = plane.distance;

  return x * point[0] + y * point[1] + z * point[2] + d;
}

export function obbPlane(obb: OBB, plane: Plane3D) {
  const cornerPoints = getOBBCornerPoints(obb);

  let positive = false;
  let negative = false;

  for (const point of cornerPoints) {
    const distance = pointPlaneDistance(point, plane);
    if (distance > 0) {
      positive = true;
    } else if (distance < 0) {
      positive = false;
    }

    if (positive && negative) {
      return true;
    }
  }

  return false;
}

export function planePlane(a: Plane3D, b: Plane3D) {
  const dot = vec3Cross(vec3(), a.normal, b.normal);

  return cmp(vec3Dot(dot, dot), 0);
}

export function raycastResult(): RaycastResult {
  return {
    point: vec3(),
    normal: vec3(0, 0, 1),
    hit: false,
    t: -1,
  };
}

export function resetRaycastResult(result: RaycastResult) {
  result.point = vec3();
  result.normal = vec3(0, 0, 0);
  result.hit = false;
  result.t = -1;
}

export function raycastSphere(
  ray: Ray3D,
  sphere: Sphere3D,
  result: RaycastResult
): boolean {
  resetRaycastResult(result);

  const e = vec3Sub(vec3(), sphere.position, ray.origin);
  const rSq = sphere.radius * sphere.radius;
  const eSq = vec3MagnitudeSq(e);

  const a = vec3Dot(e, ray.direction);
  const bSq = eSq - a * a;
  const f = Math.sqrt(rSq - bSq);
  let t = a - f;

  if (rSq - (eSq - a * a) < 0) {
    return false;
  } else if (eSq < rSq) {
    t = a + f;
  }

  result.t = t;
  result.hit = true;
  vec3Add(result.point, ray.origin, vec3Scale(vec3(), ray.direction, t));
  result.normal = vec3Normalize(
    vec3(),
    vec3Sub(vec3(), result.point, sphere.position)
  );

  return true;
}

export function raycastAABB(
  ray: Ray3D,
  aabb: AABB,
  result: RaycastResult
): boolean {
  resetRaycastResult(result);

  let tMin = -Infinity;
  let tMax = Infinity;

  for (let i = 0; i < 3; i++) {
    if (Math.abs(ray.direction[i]) < 1e-8) {
      if (ray.origin[i] < -aabb.size[i] || ray.origin[i] > aabb.size[i]) {
        return false;
      }
    } else {
      const invD = 1 / ray.direction[i];
      let t0 = (-aabb.size[i] - ray.origin[i]) * invD;
      let t1 = (aabb.size[i] - ray.origin[i]) * invD;

      if (t0 > t1) {
        const temp = t0;
        t0 = t1;
        t1 = temp;
      }

      tMin = Math.max(tMin, t0);
      tMax = Math.min(tMax, t1);

      if (tMin > tMax) {
        return false;
      }
    }
  }

  vec3Add(result.point, ray.origin, vec3Scale(vec3(), ray.direction, tMin));
  result.t = tMin;
  result.hit = true;

  const epsilon = 1e-8;
  const max = aabbMax(aabb);
  const min = aabbMin(aabb);

  if (Math.abs(result.point[0] - min[0]) < epsilon) {
    result.normal[0] = -1;
  } else if (Math.abs(result.point[0] - max[0]) < epsilon) {
    result.normal[0] = -1;
  } else if (Math.abs(result.point[1] - min[1]) < epsilon) {
    result.normal[1] = -1;
  } else if (Math.abs(result.point[1] - max[1]) < epsilon) {
    result.normal[1] = 1;
  } else if (Math.abs(result.point[2] - min[2]) < epsilon) {
    result.normal[2] = -1;
  } else if (Math.abs(result.point[2] - max[2]) < epsilon) {
    result.normal[2] = 1;
  }

  return true;
}

export function raycastOBB(
  ray: Ray3D,
  obb: OBB,
  result: RaycastResult
): boolean {
  resetRaycastResult(result);

  const inverseOrientation = quatInvert(quat(), obb.orientation);

  const localOrigin = vec3(
    ray.origin[0] - obb.position[0],
    ray.origin[1] - obb.position[1],
    ray.origin[2] - obb.position[2]
  );
  vec3TransformQuat(localOrigin, localOrigin, inverseOrientation);
  const localDirection = vec3TransformQuat(
    vec3(),
    ray.direction,
    inverseOrientation
  );

  const hit = raycastAABB(
    ray3D(localOrigin, localDirection),
    aabb(vec3(), obb.size),
    result
  );

  if (hit) {
    // transform the hit point and normal back into world space
    vec3TransformQuat(result.point, result.point, obb.orientation);
    vec3Add(result.point, result.point, obb.position);

    vec3TransformQuat(result.normal, result.normal, obb.orientation);
  }

  return hit;
}

export function raycastPlane(
  ray: Ray3D,
  plane: Plane3D,
  result: RaycastResult
): boolean {
  resetRaycastResult(result);

  const nd = vec3Dot(ray.direction, plane.normal);
  const pn = vec3Dot(ray.origin, plane.normal);

  if (nd >= 0) {
    return false;
  }

  const t = (plane.distance - pn) / nd;

  if (t >= 0) {
    result.t = t;
    result.hit = true;
    vec3Add(result.point, ray.origin, vec3Scale(vec3(), ray.direction, t));
    result.normal = plane.normal;
  }

  return false;
}

export function lineTestSphere(line: Line3D, sphere: Sphere3D) {
  const closest = closestPointLine(sphere.position, line);
  const distSq = vec3MagnitudeSq(vec3Sub(vec3(), sphere.position, closest));

  return distSq < sphere.radius * sphere.radius;
}

export function lineTestAABB(line: Line3D, aabb: AABB) {
  const ray = ray3D(line.start, vec3Sub(vec3(), line.end, line.start));
  const result = raycastResult();

  if (!raycastAABB(ray, aabb, result)) {
    return false;
  }

  return result.t > 0 && result.t * result.t < line3DLengthSq(line);
}

export function lineTestOBB(line: Line3D, obb: OBB) {
  const ray = ray3D(line.start, vec3Sub(vec3(), line.end, line.start));
  const result = raycastResult();
  if (!raycastOBB(ray, obb, result)) {
    return false;
  }

  return result.t >= 0 && result.t * result.t < line3DLengthSq(line);
}

export function lineTestPlane(line: Line3D, plane: Plane3D) {
  const ab = vec3Sub(vec3(), line.end, line.start);
  const nA = vec3Dot(plane.normal, line.start);
  const nAB = vec3Dot(plane.normal, ab);

  const t = (plane.distance - nA) / nAB;

  return t >= 0 && t <= 1;
}

export function pointInTriangle(point: Point3D, triangle: Triangle3D) {
  const a = vec3Sub(vec3(), point, triangle.a);
  const b = vec3Sub(vec3(), point, triangle.b);
  const c = vec3Sub(vec3(), point, triangle.c);

  const normPBC = vec3Cross(vec3(), b, c);
  const normPCA = vec3Cross(vec3(), c, a);
  const normPAB = vec3Cross(vec3(), a, b);

  if (vec3Dot(normPBC, normPCA) < 0) {
    return false;
  } else if (vec3Dot(normPBC, normPAB) < 0) {
    return false;
  }

  return true;
}

export function planeFromTriangle(triangle: Triangle3D) {
  const normal = vec3Cross(
    vec3(),
    vec3Sub(vec3(), triangle.b, triangle.a),
    vec3Sub(vec3(), triangle.c, triangle.a)
  );
  const distance = vec3Dot(normal, triangle.a);

  return plane3d(normal, distance);
}

export function triangleClosestPoint(triangle: Triangle3D, point: Point3D) {
  const plane = planeFromTriangle(triangle);
  const closest = closestPointPlane(point, plane);

  if (pointInTriangle(closest, triangle)) {
    return closest;
  }

  const c1 = closestPointLine(point, line3d(triangle.a, triangle.b));
  const c2 = closestPointLine(point, line3d(triangle.b, triangle.c));
  const c3 = closestPointLine(point, line3d(triangle.c, triangle.a));

  const magSq1 = vec3MagnitudeSq(vec3Sub(vec3(), point, c1));
  const magSq2 = vec3MagnitudeSq(vec3Sub(vec3(), point, c2));
  const magSq3 = vec3MagnitudeSq(vec3Sub(vec3(), point, c3));

  if (magSq1 < magSq2 && magSq1 < magSq3) {
    return c1;
  } else if (magSq2 < magSq1 && magSq2 < magSq3) {
    return c2;
  }

  return c3;
}

export function triangleSphere(triangle: Triangle3D, sphere: Sphere3D) {
  const closest = triangleClosestPoint(triangle, sphere.position);
  const distSq = vec3MagnitudeSq(vec3Sub(vec3(), closest, sphere.position));

  return distSq < sphere.radius * sphere.radius;
}

export function getIntervalTriangle(
  triangle: Triangle3D,
  axis: Vec3
): Interval3D {
  let min = vec3Dot(axis, triangle.a);
  let max = min;

  const b = vec3Dot(axis, triangle.b);
  const c = vec3Dot(axis, triangle.c);

  if (b < min) {
    min = b;
  } else if (b > max) {
    max = b;
  }

  if (c < min) {
    min = c;
  } else if (c > max) {
    max = c;
  }

  return {
    min,
    max,
  };
}

export function overlapOnAxisAABBTriangle(
  aabb: AABB,
  triangle: Triangle3D,
  axis: Vec3
) {
  const a = getIntervalAABB(aabb, axis);
  const b = getIntervalTriangle(triangle, axis);

  return a.min <= b.max && b.min <= a.max;
}

export function triangleAABB(triangle: Triangle3D, aabb: AABB) {
  const f0 = vec3Sub(vec3(), triangle.b, triangle.a);
  const f1 = vec3Sub(vec3(), triangle.c, triangle.a);
  const f2 = vec3Sub(vec3(), triangle.c, triangle.b);

  const u0 = vec3(1, 0, 0);
  const u1 = vec3(0, 1, 0);
  const u2 = vec3(0, 0, 1);

  const axes = [
    u0,
    u1,
    u2,
    vec3Cross(vec3(), f0, f1),
    vec3Cross(vec3(), u0, f0),
    vec3Cross(vec3(), u0, f1),
    vec3Cross(vec3(), u0, f2),
    vec3Cross(vec3(), u1, f0),
    vec3Cross(vec3(), u1, f1),
    vec3Cross(vec3(), u1, f2),
    vec3Cross(vec3(), u2, f0),
    vec3Cross(vec3(), u2, f1),
    vec3Cross(vec3(), u2, f2),
  ];

  for (let i = 0; i < axes.length; i++) {
    if (!overlapOnAxisAABBTriangle(aabb, triangle, axes[i])) {
      return false;
    }
  }

  return true;
}

export function overlapOnAxisTriangleOBB(
  triangle: Triangle3D,
  obb: OBB,
  axis: Vec3
) {
  const a = getIntervalOBB(obb, axis);
  const b = getIntervalTriangle(triangle, axis);

  return a.min <= b.max && b.min <= a.max;
}

export function getOBBFaceNormals(obb: OBB) {
  return [
    vec3Normalize(
      vec3(),
      vec3TransformQuat(vec3(), vec3(1, 0, 0), obb.orientation)
    ),
    vec3Normalize(
      vec3(),
      vec3TransformQuat(vec3(), vec3(0, 1, 0), obb.orientation)
    ),
    vec3Normalize(
      vec3(),
      vec3TransformQuat(vec3(), vec3(0, 0, 1), obb.orientation)
    ),
  ];
}

export function triangleOBB(triangle: Triangle3D, obb: OBB) {
  const triangleEdges = [
    vec3Sub(vec3(), triangle.b, triangle.a),
    vec3Sub(vec3(), triangle.c, triangle.b),
    vec3Sub(vec3(), triangle.a, triangle.c),
  ];

  const obbNormals = getOBBFaceNormals(obb);
  const triangleNormal = vec3Cross(vec3(), triangleEdges[0], triangleEdges[1]);

  const axes = [
    ...obbNormals,
    triangleNormal,
    ...triangleEdges.flatMap((edge) =>
      obbNormals.map((normal) => vec3Cross(vec3(), edge, normal))
    ),
  ];

  for (let i = 0; i < axes.length; i++) {
    if (!overlapOnAxisTriangleOBB(triangle, obb, axes[i])) {
      return false;
    }
  }

  return true;
}

export function trianglePlane(triangle: Triangle3D, plane: Plane3D) {
  const side1 = plane3dEquation(plane, triangle.a);
  const side2 = plane3dEquation(plane, triangle.b);
  const side3 = plane3dEquation(plane, triangle.c);

  if (cmp(side1, 0) && cmp(side2, 0) && cmp(side3, 0)) {
    return true;
  }

  if (side1 > 0 && side2 > 0 && side3 > 0) {
    return false;
  }

  if (side1 < 0 && side2 < 0 && side3 < 0) {
    return false;
  }

  return true;
}

export function overlapOnAxisTriangleTriangle(
  t1: Triangle3D,
  t2: Triangle3D,
  axis: Vec3
) {
  const a = getIntervalTriangle(t1, axis);
  const b = getIntervalTriangle(t2, axis);

  return a.min <= b.max && b.min <= a.max;
}

export function triangleTriangle(t1: Triangle3D, t2: Triangle3D) {
  const t1_f0 = vec3Sub(vec3(), t1.b, t1.a);
  const t1_f1 = vec3Sub(vec3(), t1.c, t1.b);
  const t1_f2 = vec3Sub(vec3(), t1.a, t1.c);
  const t2_f0 = vec3Sub(vec3(), t2.b, t2.a);
  const t2_f1 = vec3Sub(vec3(), t2.c, t2.b);
  const t2_f2 = vec3Sub(vec3(), t2.a, t2.c);

  const axes = [
    vec3Cross(vec3(), t1_f0, t1_f1),
    vec3Cross(vec3(), t2_f0, t2_f1),

    vec3Cross(vec3(), t2_f0, t1_f0),
    vec3Cross(vec3(), t2_f0, t1_f1),
    vec3Cross(vec3(), t2_f0, t1_f2),

    vec3Cross(vec3(), t2_f1, t1_f0),
    vec3Cross(vec3(), t2_f1, t1_f1),
    vec3Cross(vec3(), t2_f1, t1_f2),

    vec3Cross(vec3(), t2_f2, t1_f0),
    vec3Cross(vec3(), t2_f2, t1_f1),
    vec3Cross(vec3(), t2_f2, t1_f2),
  ];

  for (let i = 0; i < axes.length; i++) {
    if (!overlapOnAxisTriangleTriangle(t1, t2, axes[i])) {
      return false;
    }
  }

  return true;
}

export function barycentric(point: Point3D, triangle: Triangle3D) {
  const ap = vec3Sub(vec3(), point, triangle.a);
  const bp = vec3Sub(vec3(), point, triangle.b);
  const cp = vec3Sub(vec3(), point, triangle.c);

  const ab = vec3Sub(vec3(), triangle.b, triangle.a);
  const ac = vec3Sub(vec3(), triangle.c, triangle.a);
  const bc = vec3Sub(vec3(), triangle.c, triangle.b);
  const cb = vec3Sub(vec3(), triangle.b, triangle.c);
  const ca = vec3Sub(vec3(), triangle.a, triangle.c);

  let v = vec3Sub(vec3(), ab, vec3Project(vec3(), ab, cb));
  const a = 1 - vec3Dot(v, ap) / vec3Dot(v, ab);

  vec3Project(v, bc, ac);
  const b = 1 - vec3Dot(v, bp) / vec3Dot(v, bc);

  vec3Project(v, ca, ab);
  const c = 1 - vec3Dot(v, cp) / vec3Dot(v, ca);

  return vec3(a, b, c);
}

export function raycastTriangle(
  ray: Ray3D,
  triangle: Triangle3D,
  result: RaycastResult
): boolean {
  resetRaycastResult(result);

  const plane = planeFromTriangle(triangle);
  const planeResult = raycastResult();

  if (!raycastPlane(ray, plane, planeResult)) {
    return false;
  }

  const point = vec3Add(
    vec3(),
    ray.origin,
    vec3Scale(vec3(), ray.direction, planeResult.t)
  );
  const bary = barycentric(point, triangle);

  if (
    bary[0] >= 0 &&
    bary[0] <= 1 &&
    bary[1] >= 0 &&
    bary[1] <= 1 &&
    bary[2] >= 0 &&
    bary[2] <= 1
  ) {
    result.hit = true;
    result.t = planeResult.t;
    result.point = point;
    result.normal = plane.normal;
  }

  return false;
}

export function lineTestTriangle(line: Line3D, triangle: Triangle3D) {
  const ray = ray3D(line.start, vec3Sub(vec3(), line.end, line.start));
  const result = raycastResult();

  if (!raycastTriangle(ray, triangle, result)) {
    return false;
  }

  return result.t >= 0 && result.t * result.t < line3DLengthSq(line);
}

export function resetCollisionManifold(manifold: CollisionManifold) {
  manifold.colliding = false;
  vec3Zero(manifold.normal);
  manifold.depth = 0;
  manifold.contacts = [];
}

export function createCollisionManifold(): CollisionManifold {
  return {
    colliding: false,
    normal: vec3(),
    depth: 0,
    contacts: [],
  };
}

export function findCollisionFeaturesSphereSphere(
  a: Sphere3D,
  b: Sphere3D
): CollisionManifold {
  const result = createCollisionManifold();

  const r = a.radius + b.radius;
  const d = vec3Sub(vec3(), a.position, b.position);

  if (vec3MagnitudeSq(d) - r * r > 0 || vec3MagnitudeSq(d) === 0) {
    return result;
  }

  vec3Normalize(d, d);

  result.colliding = true;
  result.normal = d;
  result.depth = Math.abs(vec3Magnitude(d) - r) * 0.5;
  const dpt = a.radius - result.depth;
  const contact = vec3Add(vec3(), a.position, vec3Scale(vec3(), d, dpt));
  result.contacts.push(contact);

  return result;
}

export function findCollisionFeaturesSphereOBB(
  a: OBB,
  b: Sphere3D
): CollisionManifold {
  const result = createCollisionManifold();

  const closestPoint = closestPointOBB(b.position, a);

  const d = vec3MagnitudeSq(vec3Sub(vec3(), b.position, closestPoint));

  if (d > b.radius * b.radius) {
    return result;
  }

  if (cmp(d, 0)) {
    const mSq = vec3MagnitudeSq(vec3Sub(vec3(), closestPoint, a.position));

    if (cmp(mSq, 0)) {
      return result;
    }

    vec3Sub(result.normal, b.position, closestPoint);
    vec3Normalize(result.normal, result.normal);
  }

  const outsidePoint = vec3Add(
    vec3(),
    b.position,
    vec3Scale(vec3(), result.normal, b.radius)
  );
  const distance = vec3Magnitude(vec3Sub(vec3(), closestPoint, outsidePoint));

  result.colliding = true;
  result.contacts.push(
    vec3Add(
      vec3(),
      closestPoint,
      vec3Scale(vec3(), vec3Sub(vec3(), outsidePoint, closestPoint), 0.5)
    )
  );

  result.depth = distance * 0.5;

  return result;
}

export function getOBBEdges(obb: OBB): Line3D[] {
  const result: Line3D[] = [];

  const points = getOBBCornerPoints(obb);

  const index = [
    [6, 1],
    [6, 3],
    [6, 4],
    [2, 7],
    [2, 5],
    [2, 0],
    [0, 1],
    [0, 3],
    [0, 7],
    [7, 4],
    [4, 5],
    [5, 3],
  ];

  for (let i = 0; i < index.length; i++) {
    result.push(line3d(points[index[i][0]], points[index[i][1]]));
  }

  return result;
}

export function getOBBPlanes(obb: OBB): Plane3D[] {
  const corners = getOBBCornerPoints(obb);
  const normals = getOBBFaceNormals(obb);

  return [
    plane3d(normals[0], vec3Dot(normals[0], corners[0])),
    plane3d(
      vec3Negative(vec3(), normals[0]),
      vec3Dot(vec3Negative(vec3(), normals[0]), corners[4])
    ),
    plane3d(normals[1], vec3Dot(normals[1], corners[0])),
    plane3d(
      vec3Negative(vec3(), normals[1]),
      vec3Dot(vec3Negative(vec3(), normals[1]), corners[2])
    ),
    plane3d(normals[2], vec3Dot(normals[2], corners[0])),
    plane3d(
      vec3Negative(vec3(), normals[2]),
      vec3Dot(vec3Negative(vec3(), normals[2]), corners[1])
    ),
  ];
}

export function clipToPlane(plane: Plane3D, line: Line3D): Point3D | null {
  const ab = vec3Sub(vec3(), line.end, line.start);
  const nAB = vec3Dot(plane.normal, ab);

  if (cmp(nAB, 0)) {
    return null;
  }

  const nA = vec3Dot(plane.normal, line.start);
  const t = (plane.distance - nA) / nAB;

  if (t >= 0 && t <= 1) {
    return vec3Add(vec3(), line.start, vec3Scale(vec3(), ab, t));
  }

  return null;
}

export function clipEdgesToOBB(edges: Line3D[], obb: OBB): Point3D[] {}

export function obbOBBPenetrationDepth(o1: OBB, o2: OBB, axis: Vec3): number {}

export function findOBBOBBCollisionFeatures(
  A: OBB,
  B: OBB
): CollisionManifold {}
