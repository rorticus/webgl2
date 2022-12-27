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

const model = new Model(modelGeometry, material);

const scene = new Scene();
engine.root = scene;
scene.camera.position = vec3(0, 30, 25);

scene.entities.addEntity({
  [ModelComponent]: model,
  [PositionComponent]: {
    position: vec3(0, 0, 0),
    orientation: vec3(),
    scale: 0.5,
  },
});

engine.start();

export {};
