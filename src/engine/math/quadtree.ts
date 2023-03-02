import {
  Rectangle2D,
  rectangle2dMax,
  rectangle2dMin,
  rectangleFromMinMax,
} from "./rectangle2d";
import { rectangleRectangle } from "./geometry2d";
import { vec2, vec2Add, vec2Scale } from "./vec2";

interface QuadTreeData<T> {
  object: T;
  bounds: Rectangle2D;
  flag: boolean;
}

const MAX_DEPTH = 5;
const MAX_OBJECTS_PER_NODE = 15;

export class QuadTree<T = any> {
  children: QuadTree<T>[];
  data: QuadTreeData<T>[];
  currentDepth: number;
  nodeBounds: Rectangle2D;

  constructor(bounds: Rectangle2D, depth = 0) {
    this.children = [];
    this.data = [];
    this.currentDepth = depth;
    this.nodeBounds = bounds;
  }

  isLeaf() {
    return this.children === null || this.children.length === 0;
  }

  numObjects() {
    this.reset();

    let objectCount = this.data.length;
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].flag = true;
    }

    const process: QuadTree<T>[] = [];
    process.push(this);

    while (process.length > 0) {
      const processNode = process.pop()!;

      if (!processNode.isLeaf()) {
        process.push(...processNode.children);
      } else {
        for (let i = 0; i < processNode.data.length; i++) {
          if (!processNode.data[i].flag) {
            processNode.data[i].flag = true;
            objectCount++;
          }
        }
      }
    }

    return objectCount;
  }

  insert(data: QuadTreeData<T>) {
    if (!rectangleRectangle(data.bounds, this.nodeBounds)) {
      return;
    }

    if (this.isLeaf() && this.data.length + 1 > MAX_OBJECTS_PER_NODE) {
      this.split();
    }

    if (this.isLeaf()) {
      this.data.push(data);
    } else {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].insert(data);
      }
    }
  }

  remove(data: QuadTreeData<T>) {
    if (this.isLeaf()) {
      let removeIndex = -1;
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].object === data.object) {
          removeIndex = i;
          break;
        }
      }

      if (removeIndex !== -1) {
        this.data.splice(removeIndex, 1);
      }
    } else {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].remove(data);
      }
    }

    this.shake();
  }

  update(data: QuadTreeData<T>) {
    this.remove(data);
    this.insert(data);
  }

  shake() {
    if (!this.isLeaf()) {
      let numObjects = this.numObjects();

      if (numObjects === 0) {
        this.children = [];
      } else if (numObjects < MAX_OBJECTS_PER_NODE) {
        const process: QuadTree<T>[] = [];
        process.push(this);

        while (process.length > 0) {
          const processNode = process.pop()!;

          if (!processNode.isLeaf()) {
            process.push(...processNode.children);
          } else {
            for (let i = 0; i < processNode.data.length; i++) {
              this.insert(processNode.data[i]);
            }
          }
        }

        this.children = [];
      }
    }
  }

  split() {
    if (this.currentDepth + 1 > MAX_DEPTH) {
      return;
    }

    let min = rectangle2dMin(this.nodeBounds);
    let max = rectangle2dMax(this.nodeBounds);
    let center = vec2Add(vec2(), min, max);
    vec2Scale(center, center, 0.5);

    const childAreas = [
      rectangleFromMinMax(vec2(min[0], min[1]), vec2(center[0], center[1])),
      rectangleFromMinMax(vec2(center[0], min[1]), vec2(max[0], center[1])),
      rectangleFromMinMax(vec2(min[0], center[1]), vec2(center[0], max[1])),
      rectangleFromMinMax(vec2(center[0], center[1]), vec2(max[0], max[1])),
    ];

    for (let i = 0; i < childAreas.length; i++) {
      this.children.push(new QuadTree<T>(childAreas[i], this.currentDepth + 1));
    }

    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.children.length; j++) {
        this.children[j].insert(this.data[i]);
      }
    }
    this.data = [];
  }

  reset() {
    if (this.isLeaf()) {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].flag = false;
      }
    } else {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].reset();
      }
    }
  }

  query(bounds: Rectangle2D) {
    if (!rectangleRectangle(bounds, this.nodeBounds)) {
      return [];
    }

    let results: T[] = [];

    if (this.isLeaf()) {
      for (let i = 0; i < this.data.length; i++) {
        if (rectangleRectangle(bounds, this.data[i].bounds)) {
          results.push(this.data[i].object);
        }
      }
    } else {
      for (let i = 0; i < this.children.length; i++) {
        results.push(...this.children[i].query(bounds));
      }
    }

    return results;
  }
}
