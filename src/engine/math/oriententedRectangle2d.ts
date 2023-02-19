import { Point2D, vec2, Vec2, vec2Dot, vec2Scale, vec2Sub } from "./vec2";
import { Interval2D } from "../types";
import { rectangle2d, rectangle2dMax, rectangle2dMin } from "./rectangle2d";
import { deg2rad } from "./angles";

export interface OrientedRectangle2D {
  position: Point2D;
  halfExtents: Vec2;
  rotation: number;
}

export function orientedRectangle2d(
  position: Point2D,
  halfExtents: Vec2,
  rotation: number = 0
): OrientedRectangle2D {
  return { position, halfExtents, rotation };
}

export function orientedRectangleInterval(
  rect: OrientedRectangle2D,
  axis: Vec2
): Interval2D {
  const r = rectangle2d(
    vec2Sub(vec2(), rect.position, rect.halfExtents),
    vec2Scale(vec2(), rect.halfExtents, 2)
  );

  const min = rectangle2dMin(r);
  const max = rectangle2dMax(r);

  const verts: Vec2[] = [
    vec2(min[0], min[1]),
    vec2(max[0], max[1]),
    vec2(min[0], max[1]),
    vec2(max[0], min[1]),
  ];

  const t = deg2rad(rect.rotation);

  const zRot = [Math.cos(t), Math.sin(t), -Math.sin(t), Math.cos(t)];

  for (let i = 0; i < verts.length; i++) {
    const vert = verts[i];
    const x = vert[0];
    const y = vert[1];
    vert[0] = x * zRot[0] + y * zRot[1];
    vert[1] = x * zRot[2] + y * zRot[3];
  }

  let mn = vec2Dot(verts[0], axis);
  let mx = mn;

  for (let i = 1; i < verts.length; i++) {
    const proj = vec2Dot(verts[i], axis);

    if (proj < mn) {
      mn = proj;
    }
    if (proj > mx) {
      mx = proj;
    }
  }

  return {
    min: mn,
    max: mx,
  };
}
