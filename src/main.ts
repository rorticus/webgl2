import Material from "./gl/material";
import { createFragmentShader, createVertexShader } from "./gl/shaders";
import Model from "./gl/model";
import { vec3 } from "./gl/vec3";
import { loadObj } from "./gl/obj";
import objModel from "./models/monkey.obj";
import {
  mat4,
  mat4Identity,
  mat4Mul,
  mat4Perspective,
  mat4Scale,
  mat4Translation,
  mat4Transpose,
} from "./gl/mat4";
import {
  quat,
  quatMul,
  quatRotationAboutX,
  quatRotationAboutY,
  quatRotationAboutZ,
  quatToMat4,
} from "./gl/quat";
import { Camera } from "./gl/camera";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;

const modelGeometry = loadObj(objModel);

const material = new Material(
  gl,
  createVertexShader(
    gl,
    (document.getElementById("vertex-shader") as HTMLScriptElement).text.trim()
  ),
  createFragmentShader(
    gl,
    (
      document.getElementById("fragment-shader") as HTMLScriptElement
    ).text.trim()
  )
);

const model = new Model(modelGeometry, material);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0.25, 0, 1);

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

const q = quat();
const position = vec3(0, 0, 0);
let scale = 0.5;

const camera = new Camera();
// const projection = mat4Identity(mat4());
const projection = mat4Perspective(mat4(), 1.5, 800, 600, 0.1, 1000);

const xRot = quatRotationAboutX(quat(), 0.001);
const yRot = quatRotationAboutY(quat(), 0.0001);
const zRot = quatRotationAboutZ(quat(), 0.0002);

const render = () => {
  // draw it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const transform = mat4Identity(mat4());
  const translate = mat4Translation(mat4(), position);

  const r = quatToMat4(mat4(), q);

  const s = mat4Scale(mat4(), vec3(scale, scale, scale));

  mat4Mul(transform, transform, s);
  mat4Mul(transform, transform, r);
  mat4Mul(transform, transform, translate);

  model.prepare(gl, {
    object: { type: "mat4", value: transform },
    world: { type: "mat4", value: camera.inverseTransform },
    projection: { type: "mat4", value: projection },
    uNormalMatrix: {
      type: "mat4",
      value: mat4Transpose(mat4(), transform),
    },
  });
  model.draw(gl);

  quatMul(q, q, xRot);
  quatMul(q, q, yRot);
  quatMul(q, q, zRot);

  // ux stuff

  requestAnimationFrame(render);
};

render();

export {};
