import { vec3, Vec3 } from "./vec3";

export type Quat = Float32Array;

export function quat(w = 1, x = 0, y = 0, z = 0) {
  return new Float32Array([w, x, y, z]);
}

export function quatRotationAboutX(dest: Quat, theta: number) {
  const theta2 = theta / 2;

  dest[0] = Math.cos(theta2);
  dest[1] = Math.sin(theta2);
  dest[2] = 0;
  dest[3] = 0;

  return dest;
}

export function quatRotationAboutY(dest: Quat, theta: number) {
  const theta2 = theta / 2;

  dest[0] = Math.cos(theta2);
  dest[1] = 0;
  dest[2] = Math.sin(theta2);
  dest[3] = 0;

  return dest;
}

export function quatRotationAboutZ(dest: Quat, theta: number) {
  const theta2 = theta / 2;

  dest[0] = Math.cos(theta2);
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = Math.sin(theta2);

  return dest;
}

export function quatRotationAboutAxis(dest: Quat, axis: Vec3, theta: number) {
  const theta2 = theta / 2;
  const sinTheta2 = Math.sin(theta2);
  const cosTheta2 = Math.cos(theta2);

  dest[0] = cosTheta2;
  dest[1] = sinTheta2 * axis[0];
  dest[2] = sinTheta2 * axis[1];
  dest[3] = sinTheta2 * axis[2];

  return dest;
}

export function quatMul(dest: Quat, a: Quat, b: Quat) {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;

  dest[0] = aw * bw - ax * bx - ay * by - az * bz;
  dest[1] = aw * bx + ax * bw + az * by - ay * bz;
  dest[2] = aw * by + ay * bw + ax * bz - az * bx;
  dest[3] = aw * bz + az * bw + ay * bx - ax * by;

  return dest;
}

export function quatNormalize(dest: Quat, a: Quat) {
  const mag = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);

  if (mag > 0) {
    dest[0] = a[0] / mag;
    dest[1] = a[1] / mag;
    dest[2] = a[2] / mag;
    dest[3] = a[3] / mag;
  } else {
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
  }

  return dest;
}

export function quatRotationAngle(q: Quat) {
  const thetaOver2 = Math.acos(q[0]);

  return thetaOver2 * 2;
}

export function quatRotationAxis(q: Quat) {
  const sinThetaOver2Sq = 1 - q[0] * q[0];

  if (sinThetaOver2Sq <= 0) {
    return vec3(1, 0, 0);
  }

  const oneOverSinThetaOver2 = 1 / Math.sqrt(sinThetaOver2Sq);

  return vec3(
    q[1] * oneOverSinThetaOver2,
    q[2] * oneOverSinThetaOver2,
    q[3] * oneOverSinThetaOver2
  );
}

export function quatDotProduct(a: Quat, b: Quat) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export function quatSlerp(dest: Quat, a: Quat, b: Quat, t: number) {
  if (t <= 0) {
    return a;
  }
  if (t >= 1) {
    return b;
  }

  const cosOmega = quatDotProduct(a, b);

  let aw = a[0];
  let ax = a[1];
  let ay = a[2];
  let az = a[3];

  if (cosOmega < 0) {
    aw = -aw;
    ax = -ax;
    ay = -ay;
    az = -az;
  }

  let k0, k1;

  if (cosOmega > 0.9999) {
    k0 = 1 - t;
    k1 = t;
  } else {
    const sinOmega = Math.sqrt(1 - cosOmega * cosOmega);
    const omega = Math.atan2(sinOmega, cosOmega);
    const oneOverSinOmega = 1 / sinOmega;

    k0 = Math.sin((1 - t) * omega) * oneOverSinOmega;
    k1 = Math.sin(t * omega) * oneOverSinOmega;
  }

  const w = k0 * aw + k1 * b[0];
  const x = k0 * ax + k1 * b[1];
  const y = k0 * ay + k1 * b[2];
  const z = k0 * az + k1 * b[3];

  dest[0] = w;
  dest[1] = x;
  dest[2] = y;
  dest[3] = z;

  return dest;
}

export function quatConjugate(dest: Quat, a: Quat) {
  dest[0] = a[0];
  dest[1] = -a[1];
  dest[2] = -a[2];
  dest[3] = -a[3];

  return dest;
}

export function quatToMat4(dest: Float32Array, a: Quat) {
  const [w, x, y, z] = a;
  const [x2, y2, z2] = [x * x, y * y, z * z];
  const [xy, xz, yz] = [x * y, x * z, y * z];
  const [wx, wy, wz] = [w * x, w * y, w * z];

  dest[0] = 1 - 2 * (y2 + z2);
  dest[1] = 2 * (xy + wz);
  dest[2] = 2 * (xz - wy);
  dest[3] = 0;

  dest[4] = 2 * (xy - wz);
  dest[5] = 1 - 2 * (x2 + z2);
  dest[6] = 2 * (yz + wx);
  dest[7] = 0;

  dest[8] = 2 * (xz + wy);
  dest[9] = 2 * (yz - wx);
  dest[10] = 1 - 2 * (x2 + y2);
  dest[11] = 0;

  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;

  return dest;
}

export function quatFromEuler(dest: Quat, euler: Float32Array) {
  const [pitch, bank, heading] = euler;

  const halfPitch = pitch * 0.5;
  const halfBank = bank * 0.5;
  const halfHeading = heading * 0.5;

  const sinPitch = Math.sin(halfPitch);
  const cosPitch = Math.cos(halfPitch);
  const sinBank = Math.sin(halfBank);

  const cosBank = Math.cos(halfBank);
  const sinHeading = Math.sin(halfHeading);
  const cosHeading = Math.cos(halfHeading);

  dest[0] = cosHeading * cosPitch * cosBank + sinHeading * sinPitch * sinBank;
  dest[1] = cosHeading * sinPitch * cosBank + sinHeading * cosPitch * sinBank;
  dest[2] = sinHeading * cosPitch * cosBank - cosHeading * sinPitch * sinBank;
  dest[3] = cosHeading * cosPitch * sinBank - sinHeading * sinPitch * cosBank;

  return dest;
}

export function quatInvert(dest: Quat, quat: Quat) {
  dest[0] = quat[0];
  dest[1] = -quat[1];
  dest[2] = -quat[2];
  dest[3] = -quat[3];

  return dest;
}

export function vec3TransformQuat(dest: Vec3, a: Vec3, q: Quat) {
  const r = {
    x: q[0] * a[0] + q[2] * a[2] - q[3] * a[1],
    y: q[0] * a[1] + q[3] * a[0] - q[1] * a[2],
    z: q[0] * a[2] + q[1] * a[1] - q[2] * a[0],
    w: -q[1] * a[0] - q[2] * a[1] - q[3] * a[2],
  };

  dest[0] = r.w * -q[1] + r.x * q[0] - r.y * q[3] + r.z * q[2];
  dest[1] = r.w * -q[2] + r.y * q[0] - r.z * q[1] + r.x * q[3];
  dest[2] = r.w * -q[3] + r.z * q[0] - r.x * q[2] + r.y * q[1];

  return dest;
}
