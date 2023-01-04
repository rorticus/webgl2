import Material from "./gl/material";
import Model from "./gl/model";
import { vec3 } from "./gl/vec3";
import { loadMaterials, loadObj } from "./gl/obj";
import objModel from "./models/scene.obj";
import { mtl as objMats } from "./models/scene.mtl";
import { Engine } from "./engine/engine";
import { Scene } from "./engine/scene";
import {
  LightComponent,
  ModelComponent,
  PositionComponent,
} from "./engine/components";
import gbufferVert from "./shaders/gbuffer.vert";
import gbufferFrag from "./shaders/gbuffer.frag";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const engine = new Engine(canvas);

const modelMaterials = loadMaterials(objMats as unknown as string);
const modelGeometry = loadObj(objModel, modelMaterials);

const material = new Material(gbufferVert, gbufferFrag);

const scene = new Scene();
engine.root = scene;
scene.camera.position = vec3(0, 0, 15);
let yAngle = Math.PI / 4;
let xAngle = Math.PI / 4;
let radius = 5;

const model = new Model(modelGeometry, material);

const modelOrientation = vec3(0, 0, 0);

scene.entities.addEntity({
  [ModelComponent]: model,
  [PositionComponent]: {
    position: vec3(0, 0, 0),
    orientation: modelOrientation,
    scale: 1,
  },
});

scene.entities.addEntity({
  [LightComponent]: {
    type: "directional",
    color: vec3(1, 1, 1),
    intensity: 1,
    direction: vec3(1, 1, 1),
  },
  [PositionComponent]: {
    position: vec3(2, 2, -4),
    orientation: vec3(),
    scale: 10,
  },
});

scene.entities.addEntity({
  [LightComponent]: {
    type: "point",
    color: vec3(1, 1, 1),
    intensity: 1,
  },
  [PositionComponent]: {
    position: vec3(2, 2, -4),
    orientation: vec3(),
    scale: 7,
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

calculateCameraPosition();
engine.start();

const frame = () => {
  modelOrientation[1] += 0.01;
  requestAnimationFrame(frame);
};
// frame();

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
