import { Vec3 } from "../gl/vec3";

export interface AnyLight {
  shadows?: boolean;
}

export interface PointLight extends AnyLight {
  type: "point";
  color: Vec3;
  intensity: number;
}

export interface DirectionalLight extends AnyLight {
  type: "directional" | "directionalNoShadows" | "directionalPCF";
  color: Vec3;
  intensity: number;
  direction: Vec3;
}

export type Light = PointLight | DirectionalLight;
