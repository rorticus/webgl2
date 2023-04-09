import { RigidBody } from "./physics";
import {
  vec3,
  Vec3,
  vec3Add,
  vec3Clone,
  vec3Dot,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
} from "../math/vec3";
import { OBB } from "../types";
import {
  line3d,
  lineTestOBB,
  ray3D,
  raycastOBB,
  raycastResult,
} from "../math/geometry3d";
import { EntityWithComponents } from "../entities";
import { BaseSceneComponents } from "../scene";
import { PositionComponent } from "../components";

class Particle extends RigidBody {
  initialized = false;
  oldPosition: Vec3;
  position: Vec3;
  forces: Vec3;
  mass: number;
  bounce: number;
  gravity: Vec3;
  friction: number;

  constructor() {
    super();

    this.gravity = vec3(0, -9.82, 0);
    this.friction = 0.95;
    this.mass = 1;
    this.bounce = 0.7;
    this.position = vec3();
    this.oldPosition = vec3();
    this.forces = vec3();
  }

  applyForces(): void {
    vec3Clone(this.forces, this.gravity);
  }

  solveConstraints(constraints: OBB[]): void {
    for (let i = 0; i < constraints.length; i++) {
      const constraint = constraints[i];
      const traveled = line3d(this.oldPosition, this.position);

      if (lineTestOBB(traveled, constraint)) {
        const velocity = vec3Sub(vec3(), this.position, this.oldPosition);
        const direction = vec3Normalize(vec3(), velocity);
        const ray = ray3D(this.oldPosition, direction);
        const result = raycastResult();
        if (raycastOBB(ray, constraint, result)) {
          vec3Add(
            this.position,
            result.point,
            vec3Scale(vec3(), result.normal, 0.003)
          );
          const vn = vec3Scale(
            vec3(),
            result.normal,
            vec3Dot(result.normal, velocity)
          );
          const vt = vec3Sub(vec3(), velocity, vn);

          vec3Sub(
            this.oldPosition,
            this.position,
            vec3Sub(vec3(), vt, vec3Scale(vec3(), vn, this.bounce))
          );
        }
      }
    }
  }

  update(dt: number): void {
    if (!this.initialized) {
      vec3Clone(this.oldPosition, this.position);
      this.initialized = true;
    }

    const velocity = vec3Sub(vec3(), this.position, this.oldPosition);
    vec3Clone(this.oldPosition, this.position);

    vec3Add(
      this.position,
      this.position,
      vec3Add(
        vec3(),
        vec3Scale(vec3(), velocity, this.friction),
        vec3Scale(vec3(), this.forces, dt * dt)
      )
    );
  }

  sync(entity: EntityWithComponents<BaseSceneComponents, {}>): void {
    const position = entity.component(PositionComponent);
    if (position) {
      vec3Clone(position.position, this.position);
    }
  }

  prepare(entity: EntityWithComponents<BaseSceneComponents, {}>): void {
    const position = entity.component(PositionComponent);
    if (position) {
      vec3Clone(this.position, position.position);
    }
  }
}

export default Particle;
