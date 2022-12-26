export type Resources<T> = {
  [key in keyof T]?: T[key];
};

export class ResourcePool<T> {
  resources: Resources<T> = {};

  add(key: keyof T, resource: T[keyof T]) {
    this.resources[key] = resource;
  }

  remove(key: keyof T) {
    delete this.resources[key];
  }

  clear() {
    this.resources = {};
  }
}
