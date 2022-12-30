import Material from "./gl/material";
import { createFragmentShader, createVertexShader } from "./gl/shaders";
import Model from "./gl/model";
import { vec3 } from "./gl/vec3";
import { loadMaterials, loadObj } from "./gl/obj";
import objModel from "./models/bricks.obj";
import { mtl as objMats } from "./models/bricks.mtl";
import { Engine } from "./engine/engine";
import { Scene } from "./engine/scene";
import { ModelComponent, PositionComponent } from "./engine/components";
import { drawWebglTexture } from "./gl/helpers";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const engine = new Engine(canvas);
const gl = engine.gl;

const modelMaterials = loadMaterials(objMats as unknown as string);
const modelGeometry = loadObj(objModel, modelMaterials);

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

const scene = new Scene();
engine.root = scene;
scene.camera.position = vec3(0, 0, 15);
let yAngle = 0;
let xAngle = 0;
let radius = 25;

const model = new Model(modelGeometry, material);

scene.entities.addEntity({
  [ModelComponent]: model,
  [PositionComponent]: {
    position: vec3(0, 0, 0),
    orientation: vec3(),
    scale: 1,
  },
});

let mouseX = 0,
  mouseY = 0;
let mouseDown = false;

function calculateCameraPosition() {
  const x = Math.sin(yAngle) * Math.cos(xAngle) * radius;
  const y = Math.sin(xAngle) * radius;
  const z = Math.cos(yAngle) * Math.cos(xAngle) * radius;

  scene.camera.position = vec3(x, y, z);
  scene.camera.dirty = true;
}

window.addEventListener("mousedown", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouseDown = true;
});

window.addEventListener("mouseup", () => {
  mouseDown = false;
});

window.addEventListener("mousemove", (e) => {
  let newMouseX = e.clientX;
  let newMouseY = e.clientY;

  if (mouseDown) {
    yAngle += (newMouseX - mouseX) * 0.01;
    xAngle += (newMouseY - mouseY) * 0.01;
    calculateCameraPosition();
  }

  mouseX = newMouseX;
  mouseY = newMouseY;
});

window.addEventListener("wheel", (e) => {
  radius += e.deltaY * 0.01;
  calculateCameraPosition();
});

engine.start();

// setTimeout(() => {
//   const color = drawWebglTexture(engine.gl, engine.gBuffer.color.texture);
//   const position = drawWebglTexture(engine.gl, engine.gBuffer.position.texture);
//   const normal = drawWebglTexture(engine.gl, engine.gBuffer.normal.texture);
//
//   document.body.appendChild(color);
//   document.body.appendChild(position);
//   document.body.appendChild(normal);
// }, 100);

export {};
