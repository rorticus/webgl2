import Material from "./gl/material";
import { createFragmentShader, createVertexShader } from "./gl/shaders";
import Geometry from "./gl/geometry";
import Model from "./gl/model";
import { OrbitCamera } from "./gl/orbitcamera";
import { vec3, vec3Add } from "./gl/vec3";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;

const vertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];

const indices = [0, 1, 2, 0, 2, 3];

const geometry = new Geometry();
geometry.vertices = new Float32Array(vertices);
geometry.indices = new Uint16Array(indices);

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
const model = new Model(geometry, material);

const camera = new OrbitCamera();

gl.clearColor(0, 0, 0, 1);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

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

  requestAnimationFrame(render);

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
};

render();

export {};
