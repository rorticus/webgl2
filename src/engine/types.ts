import Model from "./gl/model";
import { Vec3 } from "./math/vec3";
import { Mat4 } from "./math/mat4";
import { Light } from "./lighting";
import { BoundingSphere } from "./gl/boundingSphere";
import { Camera } from "./gl/camera";

export interface RenderParamsObj {
  position: Vec3;
  orientation: Vec3;
  scale: number;
  objectToWorldMatrix: Mat4;
}

export interface RenderParamsModel extends RenderParamsObj {
  model: Model;
}

export interface RenderParamsLight extends RenderParamsObj {
  light: Light;
}

export interface RenderParams {
  models: RenderParamsModel[];

  lights: RenderParamsLight[];

  boundingSphere: BoundingSphere;

  camera: Camera;

  worldToViewMatrix: Mat4;
  viewToWorldMatrix: Mat4;
}

export interface Point {
  type: "point";
}

export interface Line {
  type: "line";
}

export interface Rect {
  type: "rect";
  halfWidth: number;
  halfHeight: number;
}

export interface Circle {
  type: "circle";
  radius: number;
}

export interface Interval2D {
  min: number;
  max: number;
}

export type Shape = Point | Line | Rect | Circle;
