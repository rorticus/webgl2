import Material from "./engine/gl/material";
import Model from "./engine/gl/model";
import { vec3, vec3Normalize } from "./engine/math/vec3";
import { loadMaterials, loadObj } from "./engine/gl/obj";
import objModel from "./models/scene.obj";
import { mtl as objMats } from "./models/scene.mtl";
import { Engine } from "./engine/engine";
import { Scene } from "./engine/scene";
import {
  ConstraintComponent,
  LightComponent,
  ModelComponent,
  PositionComponent,
  RigidBodyComponent,
} from "./engine/components";
import gbufferVert from "./engine/shaders/gbuffer.vert";
import gbufferFrag from "./engine/shaders/gbuffer.frag";
import { drawWebglTexture } from "./engine/gl/helpers";
import {
  createCircle,
  createPointShape,
  createRectangle,
} from "./engine/shapes";
import { createIcoSphere } from "./engine/gl/sphere";
import { vec4 } from "./engine/math/vec4";
import { RigidBody } from "./engine/physics/physics";
import Particle from "./engine/physics/particle";
import { obb } from "./engine/math/geometry3d";
import { quat, quatRotationAboutX } from "./engine/math/quat";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const engine = new Engine(canvas);
engine.debug.drawConstraints = true;

const modelMaterials = loadMaterials(objMats as unknown as string);
const modelGeometry = loadObj(objModel, modelMaterials);

const material = new Material(gbufferVert, gbufferFrag);

const scene = new Scene();
engine.setRootScene(scene);
scene.camera.position = vec3(0, 0, 15);
let yAngle = Math.PI / 6;
let xAngle = Math.PI / 8;
let radius = 5;

const model = new Model(modelGeometry, material);

const modelOrientation = vec3(0, 0, 0);

// scene.entities.add({
//   [ModelComponent]: model,
//   [PositionComponent]: {
//     position: vec3(0, 0, 0),
//     orientation: modelOrientation,
//     scale: 1,
//   }
// });

scene.entities.add({
  [LightComponent]: {
    type: "directional",
    color: vec3(1, 1, 1),
    intensity: 2,
    direction: vec3Normalize(vec3(), vec3(-1, 1, 1)),
    shadows: true,
  },
  [PositionComponent]: {
    position: vec3(2, 2, -4),
    orientation: vec3(),
    scale: 10,
  },
});

const g = createIcoSphere();
g.groups[0].uniforms = {
  diffuse: { type: "vec3", value: vec3(1, 1, 1) },
};

const dot = new Model(g, material);
const p = new Particle();

scene.entities.add({
  [ModelComponent]: dot,
  [PositionComponent]: {
    position: vec3(1, 1, 1),
    orientation: vec3(),
    scale: 0.1,
  },
  [RigidBodyComponent]: p,
});

const o = obb(
  vec3(0, 0.5, 1),
  vec3(2.5, 0.1, 1),
  // quatRotationAboutX(quat(0), Math.PI / 12)
);
scene.entities.add({
  [ConstraintComponent]: o,
});

// scene.entities.add(createPointShape(-0.25, 0.25, 5, vec3(1, 1, 1)));
// scene.entities.add(createRectangle(0.25, 0.25, 0.1, 0.1, vec3(1, 0, 0)));
// scene.entities.add(createCircle(-0.25, -0.25, 0.2, vec3(0, 1, 0)));

// scene.entities.addEntity({
//   [LightComponent]: {
//     type: "point",
//     color: vec3(1, 1, 1),
//     intensity: 1,
//   },
//   [PositionComponent]: {
//     position: vec3(2, 2, -4),
//     orientation: vec3(),
//     scale: 7,
//   },
// });

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
  e.preventDefault();
  e.stopPropagation();

  radius += e.deltaY * 0.01;
  calculateCameraPosition();
});

calculateCameraPosition();
engine.start();

const frame = () => {
  modelOrientation[1] += 0.001;
  requestAnimationFrame(frame);
};
// frame();

function debug() {
  const color = drawWebglTexture(
    engine.gl,
    engine.renderFrameBuffer.getRenderTarget("color").texture,
    engine.gl.drawingBufferWidth,
    engine.gl.drawingBufferHeight
  );
  const position = drawWebglTexture(
    engine.gl,
    engine.renderFrameBuffer.getRenderTarget("position").texture,
    engine.gl.drawingBufferWidth,
    engine.gl.drawingBufferHeight
  );
  const normals = drawWebglTexture(
    engine.gl,
    engine.renderFrameBuffer.getRenderTarget("normal").texture,
    engine.gl.drawingBufferWidth,
    engine.gl.drawingBufferHeight
  );

  // const dv = engine.lightRenderers["directional"] as DirectionalLightVariance;
  // const shadow = drawWebglTexture(
  //   engine.gl,
  //   dv.blurredShadowBuffer.getRenderTarget("depth").texture,
  //   dv.shadowBufferWidth,
  //   dv.shadowBufferHeight
  // );

  document.body.appendChild(color);
  document.body.appendChild(position);
  document.body.appendChild(normals);
  // document.body.appendChild(shadow);

  setTimeout(() => {
    document.body.removeChild(color);
    document.body.removeChild(position);
    document.body.removeChild(normals);
    // document.body.removeChild(shadow);

    debug();
  }, 1000);
}

// debug();

export {};
