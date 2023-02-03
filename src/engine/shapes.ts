import { Line, Point } from "./types";
import vert2d from "../shaders/2d.vert";
import frag2d from "../shaders/2d.frag";
import Material from "../gl/material";
import Geometry from "../gl/geometry";
import Model from "../gl/model";
import { mat4, mat4Translation } from "../gl/mat4";
import { vec3 } from "../gl/vec3";

const pointMaterial = new Material(vert2d, frag2d);
const pointGeometry = new Geometry(
  {
    position: { type: "vec3", data: new Float32Array([0, 0, 0]) },
  },
  [
    {
      indices: new Uint16Array([0]),
    },
  ]
);
pointGeometry.drawType = WebGL2RenderingContext.POINTS;
const pointModel = new Model(pointGeometry, pointMaterial);

const lineMaterial = new Material(vert2d, frag2d);
const lineGeometry = new Geometry(
  {
    position: { type: "vec3", data: new Float32Array([0, 0, 0, 1, 1, 1]) },
  },
  [
    {
      indices: new Uint16Array([0, 1]),
    },
  ]
);
lineGeometry.drawType = WebGL2RenderingContext.LINES;
const lineModel = new Model(lineGeometry, lineMaterial);

export function drawPoint(gl: WebGL2RenderingContext, p: Point) {
  const object = mat4Translation(mat4(), vec3(p.position[0], p.position[1], 0));
  pointModel.prepare(gl, {
    objectToWorldMatrix: { type: "mat4", value: object },
    color: { type: "vec3", value: p.color },
    radius: { type: "float", value: p.radius },
  });
  pointModel.draw(gl);
}

export function drawLine(gl: WebGL2RenderingContext, p: Line) {
  lineModel.prepare(gl, {
    color: { type: "vec3", value: p.color },
  });
  lineModel.draw(gl);
}
