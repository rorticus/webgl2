import Model from "./gl/model";
import { Point3D, Vec3 } from "./math/vec3";
import { Mat4 } from "./math/mat4";
import { Light } from "./lighting";
import { BoundingSphere } from "./gl/boundingSphere";
import { Camera } from "./gl/camera";
import { Circle2D } from "./math/circle2d";
import { Rectangle2D } from "./math/rectangle2d";
import { Mat3 } from "./math/mat3";

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

export interface Shape2D {
  circles: Circle2D[];
  rectangles: Rectangle2D[];
}

export type Shape = Point | Line | Rect | Circle;

export interface Line3D {
  start: Vec3;
  end: Vec3;
}

export interface Ray3D {
  origin: Vec3;
  direction: Vec3;
}

export interface Sphere3D {
  position: Point3D;
  radius: number;
}

export interface AABB {
  origin: Point3D;
  /** Half size */
  size: Vec3;
}

export interface OOB {
  position: Point3D;
  size: Vec3;
  orientation: Mat3;
}

export interface Plane3D {
  normal: Vec3;
  distance: number;
}

export interface Triangle3D {
  a: Point3D;
  b: Point3D;
  c: Point3D;
}