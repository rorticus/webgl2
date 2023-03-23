import { BaseScene } from "../scene";
import { RigidBodyComponent } from "../components";

export function PhysicsSolverSystem(scene: BaseScene, dt: number) {
  scene.entities
    .withComponents(RigidBodyComponent)
    .forEach((entity) => {
      const body = entity.component(RigidBodyComponent);
      body.update(dt);
    });
}
