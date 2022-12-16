import Material from "./gl/material";
import { createFragmentShader, createVertexShader } from "./gl/shaders";
import Model from "./gl/model";
import { OrbitCamera } from "./gl/orbitcamera";
import { vec3, vec3Add } from "./gl/vec3";
import { loadObj } from "./gl/obj";
import objModel from "./models/monkey.obj";
import {
  mat4,
  mat4Identity,
  mat4Mul,
  mat4RotationX,
  mat4RotationY,
  mat4RotationZ,
  mat4Scale,
  mat4Translation,
} from "./gl/mat4";

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

const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

const position = vec3(0, 0, 0);
const rotation = vec3();
let scale = 0.5;

const render = () => {
  // draw it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // const modelView = camera.modelViewMatrix;

  const transform = mat4Identity(mat4());
  const translate = mat4Translation(mat4(), position);
  const rotX = mat4RotationX(mat4(), rotation[0]);
  const rotY = mat4RotationY(mat4(), rotation[1]);
  const rotZ = mat4RotationZ(mat4(), rotation[2]);
  const s = mat4Scale(mat4(), vec3(scale, scale, scale));

  mat4Mul(transform, transform, s);
  mat4Mul(transform, transform, rotX);
  mat4Mul(transform, transform, rotY);
  mat4Mul(transform, transform, rotZ);
  mat4Mul(transform, transform, translate);

  model.prepare(gl, {
    uModelViewMatrix: { type: "mat4", value: transform },
    // uProjectionMatrix: { type: "mat4", value: camera.projectionMatrix },
    // uNormalMatrix: {
    //   type: "mat4",
    //   value: mat4Transpose(mat4(), camera.transformationMatrix),
    // },
  });
  model.draw(gl);

  // ux stuff

  if (keys["ArrowLeft"]) {
    vec3Add(position, position, vec3(-0.01, 0, 0));
  }
  if (keys["ArrowRight"]) {
    vec3Add(position, position, vec3(0.01, 0, 0));
  }

  if (keys["ArrowUp"]) {
    vec3Add(position, position, vec3(0, 0.01, 0));
  }

  if (keys["ArrowDown"]) {
    vec3Add(position, position, vec3(0, -0.01, 0));
  }

  if (keys["a"]) {
    vec3Add(rotation, rotation, vec3(0, 0, 0.01));
  }

  if (keys["d"]) {
    vec3Add(rotation, rotation, vec3(0, 0, -0.01));
  }

  if (keys["w"]) {
    vec3Add(rotation, rotation, vec3(0, 0.01, 0));
  }

  if (keys["s"]) {
    vec3Add(rotation, rotation, vec3(0, -0.01, 0));
  }

  if (keys["q"]) {
    vec3Add(rotation, rotation, vec3(0.01, 0, 0));
  }

  if (keys["e"]) {
    vec3Add(rotation, rotation, vec3(-0.01, 0, 0));
  }

  if (keys["+"]) {
    scale += 0.01;
  }

  if (keys["-"]) {
    scale -= 0.01;
  }

  requestAnimationFrame(render);
};

render();

export {};
