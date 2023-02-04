import vert2d from "../shaders/2d.vert";
import frag2d from "../shaders/2d.frag";
import vert2dCircle from "../shaders/2dcircle.vert";
import frag2dCircle from "../shaders/2dcircle.frag";

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
const circleMaterial = new Material(vert2dCircle, frag2dCircle);

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

export function createRectangle(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  color: Vec3
) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const geometry = new Geometry(
    {
      position: {
        type: "vec3",
        data: new Float32Array([
          // top left
          -halfWidth,
          halfHeight,
          0,
          // top right
          halfWidth,
          halfHeight,
          0,
          // bottom right
          halfWidth,
          -halfHeight,
          0,
          // bottom left
          -halfWidth,
          -halfHeight,
          0,
        ]),
      },
    },
    [
      {
        indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
        uniforms: {
          color: { type: "vec3", value: color },
          isCircle: { type: "bool", value: false },
        },
      },
    ]
  );

  return {
    [Model2DComponent]: new Model(geometry, pointMaterial),
    [PositionComponent]: {
      position: vec3(centerX, centerY, 0),
      orientation: vec3(),
      scale: 1,
    },
    [ShapeComponent]: { type: "rect", halfWidth, halfHeight } as const,
  };
}

export function createCircle(
  centerX: number,
  centerY: number,
  radius: number,
  color: Vec3
) {
  const geometry = new Geometry(
    {
      position: {
        type: "vec3",
        data: new Float32Array([
          // top left
          -radius,
          radius,
          0,
          // top right
          radius,
          radius,
          0,
          // bottom right
          radius,
          -radius,
          0,
          // bottom left
          -radius,
          -radius,
          0,
        ]),
      },
      radius: {
        type: "vec2",
        data: new Float32Array([
          // top left
          -1, 1,
          // top right
          1, 1,
          // bottom right
          1, -1,
          // bottom left
          -1, -1,
        ]),
      },
    },
    [
      {
        indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
        uniforms: {
          color: { type: "vec3", value: color },
        },
      },
    ]
  );

  return {
    [Model2DComponent]: new Model(geometry, circleMaterial),
    [PositionComponent]: {
      position: vec3(centerX, centerY, 0),
      orientation: vec3(),
      scale: 1,
    },
    [ShapeComponent]: { type: "circle", radius } as const,
  };
}
