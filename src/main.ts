import Material from "./gl/material";
import { createFragmentShader, createVertexShader } from "./gl/shaders";
import Model from "./gl/model";
import { OrbitCamera } from "./gl/orbitcamera";
import { vec3, vec3Add } from "./gl/vec3";
import { loadObj } from "./gl/obj";
import objModel from "./models/cube.obj";

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

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0.25, 0, 1);

const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

const render = () => {
  // draw it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const modelView = camera.modelViewMatrix;

  model.prepare(gl, {
    uModelViewMatrix: { type: "mat4", value: modelView },
  });
  model.draw(gl);

  // ux stuff

  if (keys["ArrowLeft"]) {
    vec3Add(camera.position, camera.position, vec3(-0.01, 0, 0));
  }
  if (keys["ArrowRight"]) {
    vec3Add(camera.position, camera.position, vec3(0.01, 0, 0));
  }

  if (keys["ArrowUp"]) {
    vec3Add(camera.position, camera.position, vec3(0, 0.01, 0));
  }

  if (keys["ArrowDown"]) {
    vec3Add(camera.position, camera.position, vec3(0, -0.01, 0));
  }

  if (keys["+"]) {
    vec3Add(camera.position, camera.position, vec3(0, 0, -0.01));
  }

  if (keys["-"]) {
    vec3Add(camera.position, camera.position, vec3(0, 0, 0.01));
  }

  if (keys["a"]) {
    vec3Add(camera.rotation, camera.rotation, vec3(0, 0, Math.PI / 180));
  }

  if (keys["d"]) {
    vec3Add(camera.rotation, camera.rotation, vec3(0, 0, -Math.PI / 180));
  }

  requestAnimationFrame(render);
};

render();

export {};
