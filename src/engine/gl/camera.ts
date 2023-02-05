import { vec3 } from "../math/vec3";
import {
  Mat4,
  mat4,
  mat4Identity,
  mat4Inv,
  mat4LookAt,
  mat4Perspective,
} from "../math/mat4";

export class Camera {
  position = vec3(0, 0, -5);
  target = vec3(0, 0, 0);
  up = vec3(0, 1, 0);

  _cameraTransform = mat4();
  _inverseCameraTransform = mat4();

  projection: Mat4;

  constructor() {
    this.projection = mat4Identity(mat4());
  }

  dirty = true;

  get cameraTransform() {
    if (this.dirty) {
      this.calculateTransforms();
      this.dirty = false;
    }
    return this._cameraTransform;
  }

  get inverseTransform() {
    if (this.dirty) {
      this.calculateTransforms();
      this.dirty = false;
    }
    return this._inverseCameraTransform;
  }

  calculateTransforms() {
    mat4Identity(this._cameraTransform);

    mat4LookAt(this._cameraTransform, this.target, this.position, this.up);

    this._inverseCameraTransform = mat4Inv(
      this._inverseCameraTransform,
      this._cameraTransform
    );
  }

  resize(width: number, height: number) {
    mat4Perspective(
      this.projection,
      (Math.PI * 90) / 180,
      width,
      height,
      0.1,
      500
    );
  }
}
