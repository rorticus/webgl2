import { vec3, Vec3 } from "./vec3";
import {
  mat4,
  Mat4,
  mat4Identity,
  mat4Inv,
  mat4Mul,
  mat4Perspective,
  mat4RotationX,
  mat4RotationY,
  mat4RotationZ,
  mat4Translation,
} from "./mat4";

export class OrbitCamera {
  position: Vec3;
  rotation: Vec3;

  projectionMatrix: Mat4;

  get transformationMatrix(): Mat4 {
    const m = mat4Identity(mat4());

    mat4Mul(m, m, mat4RotationX(mat4(), this.rotation[0]));
    mat4Mul(m, m, mat4RotationY(mat4(), this.rotation[1]));
    mat4Mul(m, m, mat4RotationZ(mat4(), this.rotation[2]));
    mat4Mul(m, m, mat4Translation(mat4(), this.position));

    return m;
  }

  get modelViewMatrix(): Mat4 {
    const m = this.transformationMatrix;
    return mat4Inv(m, m);
  }

  constructor() {
    this.position = vec3();
    this.rotation = vec3();

    this.projectionMatrix = mat4Perspective(mat4(), Math.PI / 4, 1, 0.1, 100);
  }
}
