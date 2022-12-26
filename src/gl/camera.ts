import { vec3 } from "./vec3";
import { mat4, mat4Inv, mat4LookAt } from "./mat4";

export class Camera {
  position = vec3(0, 2, 5);
  target = vec3(0, 0, 0);
  up = vec3(0, 1, 0);

  private _cameraTransform = mat4();
  private _inverseCameraTransform = mat4();

  dirty = true;

  get camearaTransform() {
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

  private calculateTransforms() {
    mat4LookAt(this._cameraTransform, this.position, this.target, this.up);

    this._inverseCameraTransform = mat4Inv(
      this._inverseCameraTransform,
      this._cameraTransform
    );
  }
}
