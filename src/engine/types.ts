import Model from "../gl/model";
import { Vec3 } from "../gl/vec3";
import { Mat4 } from "../gl/mat4";
import { Light } from "./lighting";
import { BoundingSphere } from "../gl/boundingSphere";
import { Camera } from "../gl/camera";

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
