import { OBB } from "../types";
import { EntityWithComponents } from "../entities";
import { BaseSceneComponents } from "../scene";

export const RIGID_BODY_BASE = 0;
export const RIGID_BODY_PARTICLE = 0;
export const RIGID_BODY_BOX = 1;
export const RIGID_BODY_SPHERE = 2;

export abstract class RigidBody {
  abstract readonly type: number;

  hasVolume() {
    return this.type === RIGID_BODY_BOX || this.type === RIGID_BODY_SPHERE;
  }

  abstract update(dt: number): void;
  abstract applyForces(): void;
  abstract solveConstraints(constraints: OBB[]): void;
  abstract prepare(entity: EntityWithComponents<BaseSceneComponents, {}>): void;
  abstract sync(entity: EntityWithComponents<BaseSceneComponents, {}>): void;
}
