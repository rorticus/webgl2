import { vec3, Vec3 } from "./vec3";

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

    const radius = Math.max(
      Math.max(max[0] - center[0], max[1] - center[1]),
      max[2] - center[2]
    );

    return new BoundingSphere(center, radius);
  }
}
