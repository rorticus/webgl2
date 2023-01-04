import { ResourcePool } from "./resources";
import { Camera } from "../gl/camera";
import { EntityPool } from "./entities";
import {
  LightComponent,
  ModelComponent,
  PositionComponent,
} from "./components";
import Model from "../gl/model";
import { Vec3 } from "../gl/vec3";
import { Light } from "./lighting";

interface BaseSceneComponents {
  [ModelComponent]: Model;
  [PositionComponent]: {
    position: Vec3;
    orientation: Vec3;
    scale: number;
  };

  [LightComponent]: Light;
}

interface BaseSceneResources {}

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
