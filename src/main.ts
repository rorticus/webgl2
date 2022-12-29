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
    scene.camera.position[0] -= (newMouseX - mouseX) / 25;
    scene.camera.position[1] += (newMouseY - mouseY) / 25;
    scene.camera.dirty = true;
  }

  mouseX = newMouseX;
  mouseY = newMouseY;
});

window.addEventListener("wheel", (e) => {
  scene.camera.position[2] += e.deltaY / 25;
  scene.camera.dirty = true;
});

engine.start();

export {};
