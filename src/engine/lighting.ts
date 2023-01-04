import { Vec3 } from "../gl/vec3";
import Model from "../gl/model";
import { createIcoSphere } from "../gl/sphere";
import Material from "../gl/material";
import pointLightVert from "../shaders/pointlight.vert";
import pointLightFrag from "../shaders/pointlight.frag";
import dirLightVert from "../shaders/dirlight.vert";
import dirLightFrag from "../shaders/dirlight.frag";
import { Uniforms } from "../gl/unforms";

export interface PointLight {
  type: "point";
  color: Vec3;
  intensity: number;
}

export interface DirectionalLight {
  type: "directional";
  color: Vec3;
  intensity: number;
  direction: Vec3;
}

export type Light = PointLight | DirectionalLight;

const icoSphere = createIcoSphere();

const pointLightMaterial = new Material(pointLightVert, pointLightFrag);
const directionalLightMaterial = new Material(dirLightVert, dirLightFrag);

export function getLightModel(light: Light): {
  model: Model;
  uniforms: Uniforms;
} | null {
  if (light.type === "point") {
    const s = new Model(icoSphere, pointLightMaterial);
    s.geometry = icoSphere;

    return {
      model: s,
      uniforms: {
        lightColor: { type: "vec3", value: light.color },
        lightIntensity: { type: "float", value: light.intensity },
      },
    };
  } else if (light.type === "directional") {
    const s = new Model(icoSphere, directionalLightMaterial);
    s.geometry = icoSphere;

    return {
      model: s,
      uniforms: {
        lightDirection: { type: "vec3", value: light.direction },
        lightColor: { type: "vec3", value: light.color },
        lightIntensity: { type: "float", value: light.intensity },
      },
    };
  }

  return null;
}
