import { BaseScene } from "../scene";
import { ConstraintComponent, RigidBodyComponent } from "../components";

export function PhysicsSolverSystem(scene: BaseScene, dt: number) {
  const constraints = scene.entities
    .withComponents(ConstraintComponent)
    .map((e) => e.component(ConstraintComponent));

  const bodies = scene.entities.withComponents(RigidBodyComponent).map((e) => ({
    entity: e,
    body: e.component(RigidBodyComponent),
  }));

  bodies.forEach(({ body, entity }) => {
    body.prepare(entity as any);
  });

  bodies.forEach(({ body }) => {
    body.applyForces();
  });

  bodies.forEach(({ body }) => {
    body.update(dt);
  });

  bodies.forEach(({ body }) => {
    body.solveConstraints(constraints);
  });

  bodies.forEach(({ body, entity }) => {
    body.sync(entity as any);
  });
}
