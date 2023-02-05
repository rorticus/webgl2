import { vec3, Vec3, vec3Add, vec3Magnitude, vec3Sub } from "../math/vec3";

export class BoundingSphere {
  center: Vec3;
  radius: number;

  constructor(center: Vec3, radius: number) {
    this.center = center;
    this.radius = radius;
  }

  static calculateForVertices(vertices: Iterable<number>): BoundingSphere {
    const min = vec3(Infinity, Infinity, Infinity);
    const max = vec3(-Infinity, -Infinity, -Infinity);

    let i = 0;
    for (const v of vertices) {
      if (v < min[i]) {
        min[i] = v;
      }
      if (v > max[i]) {
        max[i] = v;
      }

      i = (i + 1) % 3;
    }

    const center = vec3(
      (max[0] + min[0]) / 2,
      (max[1] + min[1]) / 2,
      (max[2] + min[2]) / 2
    );

    const radius = Math.sqrt(
      Math.pow(max[0] - center[0], 2) +
        Math.pow(max[1] - center[1], 2) +
        Math.pow(max[2] - center[2], 2)
    );

    return new BoundingSphere(center, radius);
  }

  /** Merge a bunch of bounding spheres into a single bounding sphere. that encapsulates them all*/
  static merge(spheres: BoundingSphere[]) {
    const min = vec3(Infinity, Infinity, Infinity);
    const max = vec3(-Infinity, -Infinity, -Infinity);

    for (const sphere of spheres) {
      const center = sphere.center;
      const radius = sphere.radius;

      const minSphere = vec3(
        center[0] - radius,
        center[1] - radius,
        center[2] - radius
      );
      const maxSphere = vec3(
        center[0] + radius,
        center[1] + radius,
        center[2] + radius
      );

      for (let i = 0; i < 3; i++) {
        if (minSphere[i] < min[i]) {
          min[i] = minSphere[i];
        }
        if (maxSphere[i] > max[i]) {
          max[i] = maxSphere[i];
        }
      }
    }

    const center = vec3(
      (max[0] + min[0]) / 2,
      (max[1] + min[1]) / 2,
      (max[2] + min[2]) / 2
    );

    const radius = Math.max(
      Math.max(max[0] - center[0], max[1] - center[1]),
      max[2] - center[2]
    );

    return new BoundingSphere(center, radius);
  }

  distanceToCenter(point: Vec3) {
    return vec3Magnitude(vec3Sub(vec3(), this.center, point));
  }

  distanceToSurface(point: Vec3) {
    return vec3Magnitude(vec3Sub(vec3(), this.center, point)) - this.radius;
  }

  movedAndScaled(position: Vec3, scale: number) {
    return new BoundingSphere(
      vec3Add(vec3(), this.center, position),
      this.radius * scale
    );
  }
}
