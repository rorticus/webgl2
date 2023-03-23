import { ArrayToKeys } from "./types";

export type Entity = number;
export type Component = symbol | string;

type ComponentProps<T = {}> = {
  [key in keyof T]: T[key];
};

export type PartialComponents<T> = { [key in keyof T]?: T[key] };

type AnyProps<U> = { [key in keyof U]?: any };

/*

OptionalExcept<T, U>

 */

type EntityWithComponents<T extends ComponentProps<T>, C extends AnyProps<T>> = {
  entity: Entity;
  component<K extends keyof T>(c: K): K extends keyof C ? T[K] : T[K] | undefined;
};

export class EntityPool<T extends ComponentProps = {}> {
  entityToComponentMap: {
    [key: Entity | string]: Set<keyof T>;
  } = {};
  componentToEntityMap: {
    [key in keyof T]?: {
      [key: Entity]: T[key];
    };
  } = {};

  private id = 1;

  private makeEntityWithComponents<U extends AnyProps<T>>(
    entity: Entity
  ): EntityWithComponents<T, U> {
    return {
      entity,
      component: (c: keyof T) => this.componentToEntityMap[c]?.[entity] as any,
    };
  }

  private addComponents(entity: Entity, components: PartialComponents<T>) {
    const keys = [
      ...Object.keys(components),
      ...Object.getOwnPropertySymbols(components),
    ] as (keyof T)[];

    keys.forEach((component) => {
      if (!this.componentToEntityMap[component]) {
        this.componentToEntityMap[component] = {};
      }
      const v = components[component];
      const s = this.componentToEntityMap[component];

      if (v && s) {
        s[entity] = v;
      }
    });
    keys.forEach((component) =>
      this.entityToComponentMap[entity].add(component)
    );
  }

  add(components: PartialComponents<T>) {
    const entity = this.id++;

    this.entityToComponentMap[entity] = new Set();
    this.addComponents(entity, components);

    return this.makeEntityWithComponents<typeof components>(entity);
  }

  withComponents<U extends [...(keyof T)[]]>(...components: [...U]): EntityWithComponents<T, ArrayToKeys<T, U>>[] {
    return Object.keys(this.entityToComponentMap)
      .filter((entity) =>
        components.every((component) =>
          this.entityToComponentMap[entity].has(component)
        )
      )
      .map((e) => this.makeEntityWithComponents(parseInt(e, 10)));
  }
}
