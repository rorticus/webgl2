import { BaseScene } from "../scene";
import { ConstraintComponent, RigidBodyComponent } from "../components";
import { CollisionManifold } from "../types";
import { RigidBodyVolume } from "./rigidBodyVolume";
import { vec3, vec3Add, vec3Scale, vec3Sub } from "../math/vec3";

let timeSinceLast = 1000;
const fps = 1 / 50;
const linearProjectionPrecent = 0.45;
const penetrationSlack = 0.01;
const impulseIteration = 5;

let advance = true;

window.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    advance = true;
  }
});

export function PhysicsSolverSystem(scene: BaseScene, dt: number) {
  timeSinceLast += dt;

  if (timeSinceLast >= fps) {
    if (advance) {
      const constraints = scene.entities
        .withComponents(ConstraintComponent)
        .map((e) => e.component(ConstraintComponent));

      const bodies = scene.entities
        .withComponents(RigidBodyComponent)
        .map((e) => ({
          entity: e,
          body: e.component(RigidBodyComponent),
        }));

      const collisions: {
        a: RigidBodyVolume;
        b: RigidBodyVolume;
        m: CollisionManifold;
      }[] = [];

      bodies.forEach(({ body, entity }) => {
        body.prepare(entity as any);
      });

      bodies.forEach(({ body }) => {
        body.applyForces();
      });

      for (let i = 0; i < bodies.length; i++) {
        const body1 = bodies[i].body;

        for (let j = i + 1; j < bodies.length; j++) {
          const body2 = bodies[j].body;

          if (body1.hasVolume() && body2.hasVolume()) {
            const m1 = body1 as RigidBodyVolume;
            const m2 = body2 as RigidBodyVolume;

            m1.findCollisionFeatures(m1, m2, collisions);
          }
        }
      }

      for (let i = 0; i < collisions.length; i++) {
        collisions[i].a.applyImpulse(
          collisions[i].a,
          collisions[i].b,
          collisions[i].m
        );
      }

      bodies.forEach(({ body }) => {
        body.update(fps);
      });

      for (let i = 0; i < collisions.length; i++) {
        const totalMass = collisions[i].a.invMass() + collisions[i].b.invMass();

        if (totalMass === 0) {
          continue;
        }

        const depth = Math.max(0, collisions[i].m.depth - penetrationSlack);
        const scalar = depth / totalMass;
        const correction = vec3Scale(
          vec3(),
          collisions[i].m.normal,
          scalar * linearProjectionPrecent
        );
        collisions[i].a.position = vec3Sub(
          vec3(),
          collisions[i].a.position,
          vec3Scale(vec3(), correction, collisions[i].a.invMass())
        );
        collisions[i].b.position = vec3Add(
          vec3(),
          collisions[i].b.position,
          vec3Scale(vec3(), correction, collisions[i].b.invMass())
        );

        collisions[i].a.syncCollisionVolumes();
        collisions[i].b.syncCollisionVolumes();
      }

      bodies.forEach(({ body }) => {
        body.solveConstraints(constraints);
      });

      bodies.forEach(({ body, entity }) => {
        body.sync(entity as any);
      });
    }

    advance = true;
    timeSinceLast -= fps;
  }
}
