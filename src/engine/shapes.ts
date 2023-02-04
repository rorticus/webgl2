import vert2d from "../shaders/2d.vert";
import frag2d from "../shaders/2d.frag";
import Material from "../gl/material";
import Geometry from "../gl/geometry";
import Model from "../gl/model";
import { vec3, Vec3 } from "../gl/vec3";
import {
  Model2DComponent,
  PositionComponent,
  ShapeComponent,
} from "./components";

const pointMaterial = new Material(vert2d, frag2d);

export function createPointShape(
  x: number,
  y: number,
  radius: number,
  color: Vec3
) {
  const pointGeometry = new Geometry(
    {
      position: { type: "vec3", data: new Float32Array([0, 0, 0]) },
    },
    [
      {
        indices: new Uint16Array([0]),
        uniforms: {
          radius: { type: "float", value: radius },
          color: { type: "vec3", value: color },
        },
      },
    ]
  );
  pointGeometry.drawType = WebGL2RenderingContext.POINTS;

  return {
    [Model2DComponent]: new Model(pointGeometry, pointMaterial),
    [PositionComponent]: {
      position: vec3(x, y, 0),
      orientation: vec3(),
      scale: 1,
    },
    [ShapeComponent]: { type: "point" } as const,
  };
}
