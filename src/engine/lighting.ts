import { Vec3 } from "../gl/vec3";
import Model from "../gl/model";
import { createIcoSphere } from "../gl/sphere";
import Material from "../gl/material";
import pointLightVert from "../shaders/pointlight.vert";
import pointLightFrag from "../shaders/pointlight.frag";

export interface PointLight {
  type: "point";
  color: Vec3;
  intensity: number;
}

export type Light = PointLight;

const icoSphere = createIcoSphere();

const pointLightMaterial = new Material(pointLightVert, pointLightFrag);

export function getLightModel(light: PointLight) {
  if (light.type === "point") {
    const s = new Model(icoSphere, pointLightMaterial);
    s.geometry = icoSphere;

    return s;
  }

  return null;
}
