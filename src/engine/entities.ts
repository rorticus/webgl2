export type Entity = symbol;
export type Component = symbol | string;

export type PartialComponents<T> = { [key in keyof T]?: T[key] };

export class EntityPool<T = {}> {
  entityToComponentMap: {
    [key: Entity]: Set<keyof T>;
  } = {};
  componentToEntityMap: {
    [key in keyof T]?: {
      [key: Entity]: T[key];
    };
  } = {};

  addEntity(components: PartialComponents<T>) {
    const entity = Symbol();

    this.entityToComponentMap[entity] = new Set();
    this.addComponents(entity, components);

    return entity;
  }

  addComponents(entity: Entity, components: PartialComponents<T>) {
    const keys = Object.getOwnPropertySymbols(components) as (keyof T)[];

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

  getEntities(component: keyof T): Entity[] {
    return Object.getOwnPropertySymbols(
      this.componentToEntityMap[component] || {}
    );
  }

  getComponent(
    entity: Entity,
    component: keyof T
  ): T[typeof component] | undefined {
    return this.componentToEntityMap[component]?.[entity];
  }
}
