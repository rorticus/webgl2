import { ResourcePool } from "./resources";
import { Camera } from "../gl/camera";
import { EntityPool } from "./entities";
import { ModelComponent, PositionComponent } from "./components";
import Model from "../gl/model";
import { Vec3 } from "../gl/vec3";

interface BaseSceneComponents {
  [ModelComponent]: Model;
  [PositionComponent]: {
    position: Vec3;
    orientation: Vec3;
    scale: number;
  };
}

interface BaseSceneResources {}

export class Scene<
  R extends BaseSceneResources,
  C extends BaseSceneComponents
> {
  resources: ResourcePool<R>;
  entities: EntityPool<C>;
  systems: any;

  camera: Camera;

  constructor() {
    this.resources = new ResourcePool<R>();
    this.entities = new EntityPool<C>();
    this.systems = {};

    this.camera = new Camera();
  }

  onEnter() {}
  onExit() {}
}
