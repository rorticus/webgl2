import { RIGID_BODY_BOX, RIGID_BODY_SPHERE, RigidBody } from "./physics";
import {
  vec3,
  Vec3,
  vec3Add,
  vec3Clone,
  vec3Dot,
  vec3MagnitudeSq,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
} from "../math/vec3";
import { CollisionManifold, OBB, Sphere3D } from "../types";
import { EntityWithComponents } from "../entities";
import { BaseSceneComponents } from "../scene";
import { PositionComponent } from "../components";
import {
  createCollisionManifold,
  findCollisionFeaturesSphereOBB,
  findCollisionFeaturesSphereSphere,
  findOBBOBBCollisionFeatures,
} from "../math/geometry3d";

const GRAVITY = vec3(0, -9.82, 0);

function cmp(x: number, y: number) {
  return (
    Math.abs(x - y) <
    Number.EPSILON * Math.max(1, Math.max(Math.abs(x), Math.abs(y)))
  );
}

export class RigidBodyVolume extends RigidBody {
  readonly type: number;

  position: Vec3;
  velocity: Vec3;
  forces: Vec3;
  mass: number;
  cor: number; // coefficient of restitution
  friction: number;

  obb: OBB | undefined;
  sphere: Sphere3D | undefined;

  constructor(
    bodyType: typeof RIGID_BODY_BOX | typeof RIGID_BODY_SPHERE = RIGID_BODY_BOX
  ) {
    super();

    this.type = bodyType;
    this.position = vec3();
    this.velocity = vec3();
    this.forces = vec3();
    this.mass = 1;
    this.cor = 0.5;
    this.friction = 0.6;
  }

  applyForces(): void {
    vec3Add(this.forces, this.forces, vec3Scale(vec3(), GRAVITY, this.mass));
  }

  addLinearImpulse(impulse: Vec3): void {
    vec3Add(this.velocity, this.velocity, impulse);
  }

  invMass() {
    if (this.mass === 0) {
      return 0;
    }

    return 1 / this.mass;
  }

  syncCollisionVolumes() {
    if (this.sphere) {
      this.sphere.position = this.position;
    }

    if (this.obb) {
      this.obb.position = this.position;
    }
  }

  prepare(entity: EntityWithComponents<BaseSceneComponents, {}>): void {
    const position = entity.component(PositionComponent);
    if (position) {
      vec3Clone(this.position, position.position);
    }
  }

  sync(entity: EntityWithComponents<BaseSceneComponents, {}>): void {
    const position = entity.component(PositionComponent);
    if (position) {
      vec3Clone(position.position, this.position);
    }
  }

  update(dt: number): void {
    const damping = 0.98;
    const acceleration = vec3Scale(vec3(), this.forces, this.invMass());

    vec3Add(this.velocity, this.velocity, vec3Scale(vec3(), acceleration, dt));
    vec3Scale(this.velocity, this.velocity, damping);

    vec3Add(this.position, this.position, vec3Scale(vec3(), this.velocity, dt));

    this.syncCollisionVolumes();
  }

  findCollisionFeatures(
    a: RigidBodyVolume,
    b: RigidBodyVolume
  ): CollisionManifold {
    if (a.sphere && b.sphere) {
      return findCollisionFeaturesSphereSphere(a.sphere, b.sphere);
    } else if (a.obb && b.obb) {
      return findOBBOBBCollisionFeatures(a.obb, b.obb);
    } else if (a.sphere && b.obb) {
      return findCollisionFeaturesSphereOBB(b.obb, a.sphere);
    } else if (a.obb && b.sphere) {
      return findCollisionFeaturesSphereOBB(a.obb, b.sphere);
    }

    console.error("invalid rigid body volumes", a.type, b.type);
    return createCollisionManifold();
  }

  applyImpulse(
    a: RigidBodyVolume,
    b: RigidBodyVolume,
    manifest: CollisionManifold,
    c: number
  ): void {
    const invMass1 = a.invMass();
    const invMass2 = b.invMass();
    const invMassSum = invMass1 + invMass2;

    if (invMassSum === 0) {
      return;
    }

    const relativeVelocity = vec3Sub(vec3(), b.velocity, a.velocity);
    const velocityAlongNormal = vec3Dot(
      relativeVelocity,
      vec3Normalize(vec3(), manifest.normal)
    );

    // moving away from each other
    if (velocityAlongNormal > 0) {
      return;
    }

    const e = Math.min(a.cor, b.cor);
    const numerator = -(1 + e) * velocityAlongNormal;
    let j = numerator / invMassSum;

    if (manifest.contacts.length > 0 && j !== 0) {
      j /= manifest.contacts.length;
    }

    const impulse = vec3Scale(
      vec3(),
      vec3Normalize(vec3(), manifest.normal),
      j
    );

    vec3Add(a.velocity, a.velocity, vec3Scale(vec3(), impulse, invMass1));
    vec3Sub(b.velocity, b.velocity, vec3Scale(vec3(), impulse, invMass2));

    // friction
    const tangent = vec3Sub(
      vec3(),
      relativeVelocity,
      vec3Scale(vec3(), manifest.normal, velocityAlongNormal)
    );
    vec3Normalize(tangent, tangent);

    if (cmp(vec3MagnitudeSq(tangent), 0)) {
      return;
    }

    const numerator2 = -vec3Dot(relativeVelocity, tangent);
    let j2 = numerator2 / invMassSum;

    if (manifest.contacts.length > 0 && j2 !== 0) {
      j2 /= manifest.contacts.length;
    }

    if (cmp(j2, 0)) {
      return;
    }

    const friction = Math.sqrt(a.friction * b.friction);
    if (j2 > j * friction) {
      j2 = j * friction;
    } else if (j2 < -j * friction) {
      j2 = -j * friction;
    }

    const frictionImpulse = vec3Scale(vec3(), tangent, j2);
    vec3Add(
      a.velocity,
      a.velocity,
      vec3Scale(vec3(), frictionImpulse, invMass1)
    );
    vec3Sub(
      b.velocity,
      b.velocity,
      vec3Scale(vec3(), frictionImpulse, invMass2)
    );
  }

  solveConstraints(constraints: OBB[]): void {}
}
