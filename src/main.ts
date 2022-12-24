import Material from "./gl/material";
import { createFragmentShader, createVertexShader } from "./gl/shaders";
import Model from "./gl/model";
import { OrbitCamera } from "./gl/orbitcamera";
import { vec3 } from "./gl/vec3";
import { loadObj } from "./gl/obj";
import objModel from "./models/monkey.obj";
import {
  mat4,
  mat4Identity,
  mat4Inv,
  mat4LookAt,
  mat4Mul,
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

const camera = new OrbitCamera();
camera.position = vec3(2, 2, 2);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0.25, 0, 1);
// gl.disable(gl.CULL_FACE);
gl.enable(gl.CULL_FACE);

const q = quat();
const position = vec3(0, 0, 0);
let scale = 0.5;

const cameraPosition = vec3(0, 2, 5);
const cameraTarget = vec3(0, 0, 0);
const cameraUp = vec3(0, 1, 0);
const cameraTransform = mat4LookAt(
  mat4(),
  cameraPosition,
  cameraTarget,
  cameraUp
);
const inverseCameraTransform = mat4Inv(mat4(), cameraTransform);

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
    uModelViewMatrix: { type: "mat4", value: transform },
    uProjectionMatrix: { type: "mat4", value: inverseCameraTransform },
    uNormalMatrix: {
      type: "mat4",
      value: mat4Transpose(mat4(), inverseCameraTransform),
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
