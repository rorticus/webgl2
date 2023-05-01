import Geometry from "./geometry";
import Model from "./model";
import constraintVertex from "../shaders/constraint.vert";
import constraintFragment from "../shaders/constraint.frag";
import Material from "./material";
import { OBB, Sphere3D } from "../types";
import {
  mat4,
  Mat4,
  mat4Identity,
  mat4Mul,
  mat4Scale,
  mat4Translation,
} from "../math/mat4";
import { Vec3, vec3, vec3Scale } from "../math/vec3";
import { quatToMat4 } from "../math/quat";
import { createIcoSphere } from "./sphere";

const constraintMaterial = new Material(constraintVertex, constraintFragment);

const geo = new Geometry(
  {
    position: {
      type: "vec3",
      data: new Float32Array([
        // Front face
        -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

        // Back face
        -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,

        // Top face
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,

        // Bottom face
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,

        // Right face
        0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,

        // Left face
        -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
      ]),
    },
  },
  [
    {
      indices: new Uint16Array([
        0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 8, 9, 9, 10, 10, 11, 11,
        8, 12, 13, 13, 14, 14, 15, 15, 12, 16, 17, 17, 18, 18, 19, 19, 16, 20,
        21, 21, 22, 22, 23, 23, 20,
      ]),
      uniforms: {
        color: { type: "vec3", value: vec3(1, 1, 0) },
      },
    },
  ]
);

geo.drawType = WebGL2RenderingContext.LINES;

const obbConstraintModel = new Model(geo, constraintMaterial);

const sphereGeo = createIcoSphere();
sphereGeo.drawType = WebGL2RenderingContext.LINES;
const sphereModel = new Model(sphereGeo, constraintMaterial);

export function drawOBB(
  gl: WebGL2RenderingContext,
  worldToViewMatrix: Mat4,
  projectionMatrix: Mat4,
  obb: OBB
) {
  const worldMatrix = mat4();
  mat4Identity(worldMatrix);

  const translate = mat4Translation(mat4(), obb.position);
  const s = mat4Scale(mat4(), vec3Scale(vec3(), obb.size, 2));
  const r = quatToMat4(mat4(), obb.orientation);

  mat4Mul(worldMatrix, worldMatrix, s);
  mat4Mul(worldMatrix, worldMatrix, r);
  mat4Mul(worldMatrix, worldMatrix, translate);

  mat4Mul(worldMatrix, worldMatrix, worldToViewMatrix);

  obbConstraintModel.prepare(gl, {
    world: { type: "mat4", value: worldMatrix },
    projection: { type: "mat4", value: projectionMatrix },
  });

  obbConstraintModel.draw(gl);
}

export function drawSphere(
  gl: WebGL2RenderingContext,
  worldToViewMatrix: Mat4,
  projectionMatrix: Mat4,
  sphere: Sphere3D,
  color?: Vec3
) {
  const worldMatrix = mat4();
  mat4Identity(worldMatrix);

  const translate = mat4Translation(mat4(), sphere.position);
  const s = mat4Scale(
    mat4(),
    vec3(sphere.radius, sphere.radius, sphere.radius)
  );

  mat4Mul(worldMatrix, worldMatrix, s);
  mat4Mul(worldMatrix, worldMatrix, translate);

  mat4Mul(worldMatrix, worldMatrix, worldToViewMatrix);

  sphereModel.prepare(gl, {
    world: { type: "mat4", value: worldMatrix },
    projection: { type: "mat4", value: projectionMatrix },
    color: { type: "vec3", value: color || vec3(1, 1, 0) },
  });

  sphereModel.draw(gl);
}
