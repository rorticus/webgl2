import { OBB } from "../types";
import { EntityWithComponents } from "../entities";
import { BaseSceneComponents } from "../scene";

export abstract class RigidBody {
  abstract update(dt: number): void;
  abstract applyForces(): void;
  abstract solveConstraints(constraints: OBB[]): void;
  abstract prepare(entity: EntityWithComponents<BaseSceneComponents, {}>): void;
  abstract sync(entity: EntityWithComponents<BaseSceneComponents, {}>): void;
}
