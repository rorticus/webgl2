import Material from "./gl/material";
import { createFragmentShader, createVertexShader } from "./gl/shaders";
import Model from "./gl/model";
import { vec3 } from "./gl/vec3";
import { loadObj } from "./gl/obj";
import objModel from "./models/monkey.obj";
import { Engine } from "./engine/engine";
import { Scene } from "./engine/scene";
import { ModelComponent, PositionComponent } from "./engine/components";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const engine = new Engine(canvas);
const gl = engine.gl;

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

const scene = new Scene();
engine.root = scene;

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
