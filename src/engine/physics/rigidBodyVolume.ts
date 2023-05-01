import { RIGID_BODY_BOX, RIGID_BODY_SPHERE, RigidBody } from "./physics";
import {
  vec3,
  Vec3,
  vec3Add,
  vec3Clone,
  vec3Cross,
  vec3Dot,
  vec3MagnitudeSq,
  vec3Normalize,
  vec3Scale,
  vec3Sub
} from "../math/vec3";
import { CollisionManifold, OBB, Sphere3D } from "../types";
import { EntityWithComponents } from "../entities";
import { BaseSceneComponents } from "../scene";
import { PositionComponent } from "../components";
import {
  createCollisionManifold,
  findCollisionFeaturesSphereOBB,
  findCollisionFeaturesSphereSphere,
  findOBBOBBCollisionFeatures
} from "../math/geometry3d";
import { mat4, Mat4, mat4Inv, mat4MulVec3 } from "../math/mat4";
import { quatFromEuler, quatToEuler } from "../math/quat";

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

  orientation: Vec3;
  angularVelocity: Vec3;
  torques: Vec3;

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
    this.orientation = vec3();
    this.angularVelocity = vec3();
    this.torques = vec3();
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
      quatFromEuler(this.obb.orientation, this.orientation);
    }
  }

  prepare(entity: EntityWithComponents<BaseSceneComponents, {}>): void {
    const position = entity.component(PositionComponent);
    if (position) {
      vec3Clone(this.position, position.position);
      quatToEuler(this.orientation, position.orientation);

      this.syncCollisionVolumes();
    }
  }

  sync(entity: EntityWithComponents<BaseSceneComponents, {}>): void {
    const position = entity.component(PositionComponent);
    if (position) {
      vec3Clone(position.position, this.position);
      quatFromEuler(position.orientation, this.orientation);
    }
  }

  update(dt: number): void {
    const damping = 0.98;
    const acceleration = vec3Scale(vec3(), this.forces, this.invMass());

    vec3Add(this.velocity, this.velocity, vec3Scale(vec3(), acceleration, dt));
    vec3Scale(this.velocity, this.velocity, damping);

    if (this.type === RIGID_BODY_BOX) {
      const angAccel = mat4MulVec3(vec3(), this.invTensor(), this.torques);
      vec3Add(
        this.angularVelocity,
        this.angularVelocity,
        vec3Scale(vec3(), angAccel, dt)
      );
      vec3Scale(this.angularVelocity, this.angularVelocity, damping);
    }

    vec3Add(this.position, this.position, vec3Scale(vec3(), this.velocity, dt));

    if (this.type === RIGID_BODY_BOX) {
      vec3Add(
        this.orientation,
        this.orientation,
        vec3Scale(vec3(), this.angularVelocity, dt)
      );
    }

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

    const r1 = vec3Sub(vec3(), manifest.contacts[c], a.position);
    const r2 = vec3Sub(vec3(), manifest.contacts[c], b.position);
    const i1 = a.invTensor();
    const i2 = b.invTensor();

    // relative velocity
    const relativeVelocity = vec3Sub(
      vec3(),
      vec3Add(vec3(), b.velocity, vec3Cross(vec3(), b.angularVelocity, r2)),
      vec3Add(vec3(), a.velocity, vec3Cross(vec3(), a.angularVelocity, r1))
    );
    const relativeNormal = vec3Normalize(vec3(), manifest.normal);

    const velocityAlongNormal = vec3Dot(relativeVelocity, relativeNormal);

    // moving away from each other
    if (velocityAlongNormal > 0) {
      return;
    }

    const e = Math.min(a.cor, b.cor);
    let numerator = -(1 + e) * velocityAlongNormal;

    let d1 = invMassSum;
    let d2 = vec3Cross(
      vec3(),
      mat4MulVec3(vec3(), i1, vec3Cross(vec3(), r1, relativeNormal)),
      r1
    );
    let d3 = vec3Cross(
      vec3(),
      mat4MulVec3(vec3(), i2, vec3Cross(vec3(), r2, relativeNormal)),
      r2
    );

    let denominator =
      d1 + vec3Dot(relativeNormal, vec3Add(vec3(), d2, d3));

    let j = denominator === 0 ? 0 : numerator / denominator;

    if (manifest.contacts.length > 0 && j !== 0) {
      j /= manifest.contacts.length;
    }

    const impulse = vec3Scale(vec3(), relativeNormal, j);

    vec3Sub(a.velocity, a.velocity, vec3Scale(vec3(), impulse, invMass1));
    vec3Add(b.velocity, b.velocity, vec3Scale(vec3(), impulse, invMass2));
    vec3Sub(
      a.angularVelocity,
      a.angularVelocity,
      mat4MulVec3(vec3(), i1, vec3Cross(vec3(), r1, impulse))
    );
    vec3Add(
      b.angularVelocity,
      b.angularVelocity,
      mat4MulVec3(vec3(), i2, vec3Cross(vec3(), r2, impulse))
    );

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

    numerator = -vec3Dot(relativeVelocity, tangent);
    d1 = invMassSum;
    d2 = vec3Cross(
      vec3(),
      mat4MulVec3(vec3(), i1, vec3Cross(vec3(), r1, tangent)),
      r1
    );
    d3 = vec3Cross(
      vec3(),
      mat4MulVec3(vec3(), i2, vec3Cross(vec3(), r2, tangent)),
      r2
    );

    denominator = d1 + vec3Dot(tangent, vec3Add(vec3(), d2, d3));

    if (denominator === 0) {
      return;
    }

    let j2 = numerator / denominator;

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
    vec3Sub(
      a.velocity,
      a.velocity,
      vec3Scale(vec3(), frictionImpulse, invMass1)
    );
    vec3Add(
      b.velocity,
      b.velocity,
      vec3Scale(vec3(), frictionImpulse, invMass2)
    );
    vec3Sub(
      a.angularVelocity,
      a.angularVelocity,
      mat4MulVec3(vec3(), i1, vec3Cross(vec3(), r1, frictionImpulse))
    );
    vec3Add(
      b.angularVelocity,
      b.angularVelocity,
      mat4MulVec3(vec3(), i2, vec3Cross(vec3(), r2, frictionImpulse))
    );
  }

  solveConstraints(_constraints: OBB[]): void {}

  invTensor(): Mat4 {
    let ix = 0;
    let iy = 0;
    let iz = 0;
    let iw = 0;

    if (this.mass !== 0 && this.type === RIGID_BODY_SPHERE) {
      const r2 = this.sphere!.radius * this.sphere!.radius;
      const fraction = 2 / 5;

      ix = r2 * this.mass * fraction;
      iy = r2 * this.mass * fraction;
      iz = r2 * this.mass * fraction;
      iw = 1;
    } else if (this.mass != 0 && this.type == RIGID_BODY_BOX) {
      const size = vec3Scale(vec3(), this.obb!.size, 2);
      const fraction = 1 / 12;
      const x2 = size[0] * size[0];
      const y2 = size[1] * size[1];
      const z2 = size[2] * size[2];

      ix = (y2 + z2) * this.mass * fraction;
      iy = (x2 + z2) * this.mass * fraction;
      iz = (x2 + y2) * this.mass * fraction;
      iw = 1;
    }

    return mat4Inv(
      mat4(),
      mat4(ix, 0, 0, 0, 0, iy, 0, 0, 0, 0, iz, 0, 0, 0, 0, iw)
    );
  }

  addRotationalImpulse(point: Vec3, impulse: Vec3): void {
    const centerOfMass = this.position;
    const torque = vec3Cross(
      vec3(),
      vec3Sub(vec3(), point, centerOfMass),
      impulse
    );
    const angularAcceleration = mat4MulVec3(vec3(), this.invTensor(), torque);
    vec3Add(this.angularVelocity, this.angularVelocity, angularAcceleration);
  }
}
