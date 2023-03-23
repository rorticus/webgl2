import { ResourcePool } from "./resources";
import { Camera } from "./gl/camera";
import { EntityPool } from "./entities";
import {
  LightComponent,
  Model2DComponent,
  ModelComponent,
  PositionComponent, RigidBodyComponent,
  ShapeComponent
} from "./components";
import Model from "./gl/model";
import { Vec3 } from "./math/vec3";
import { Light } from "./lighting";
import { Shape } from "./types";
import { RigidBody } from "./physics/physics";

export interface BaseSceneComponents {
  [ModelComponent]: Model;
  [PositionComponent]: {
    position: Vec3;
    orientation: Vec3;
    scale: number;
  };

  [LightComponent]: Light;
  [Model2DComponent]: Model;
  [ShapeComponent]: Shape;

  [RigidBodyComponent]: RigidBody;
}

export interface BaseSceneResources {}

export type BaseScene = Scene<BaseSceneResources, BaseSceneComponents>;

export type System<
  R extends BaseSceneResources,
  C extends BaseSceneComponents
> = (scene: Scene<R, C>, dt: number) => void;

export class Scene<
  R extends BaseSceneResources,
  C extends BaseSceneComponents
> {
  resources: ResourcePool<R>;
  entities: EntityPool<C>;
  systems: System<R, C>[] = [];

  camera: Camera;

  constructor() {
    this.resources = new ResourcePool<R>();
    this.entities = new EntityPool<C>();
    this.systems = [];

    this.camera = new Camera();
  }

  onEnter() {}
  onExit() {}
}
