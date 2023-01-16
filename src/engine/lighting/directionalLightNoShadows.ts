import { LightRenderer } from "./lights";
import { RenderParams, RenderParamsLight } from "../types";
import Model from "../../gl/model";
import { Uniforms } from "../../gl/unforms";
import { DirectionalLight } from "../lighting";
import { mat4, mat4Mul } from "../../gl/mat4";
import Material from "../../gl/material";
import dirLightVert from "./shaders/dirlight-pcf.vert";
import dirLightFrag from "./shaders/dirlight-pcf.frag";
import { createIcoSphere } from "../../gl/sphere";
import { FrameBuffer } from "../../gl/framebuffer";

const directionalLightMaterial = new Material(dirLightVert, dirLightFrag);

const icoSphere = createIcoSphere();

export class DirectionalLightNoShadows implements LightRenderer {
  renderLight(
    gl: WebGL2RenderingContext,
    gBuffer: {
      renderFrameBuffer: FrameBuffer;
      lightingFrameBuffer: FrameBuffer;
    },
    light: RenderParamsLight,
    renderParams: RenderParams
  ): void {
    const model = new Model(icoSphere, directionalLightMaterial);
    model.geometry = icoSphere;

    let extraUniforms: Uniforms = {
      lightDirection: {
        type: "vec3",
        value: (light.light as DirectionalLight).direction,
      },
      lightColor: { type: "vec3", value: light.light.color },
      lightIntensity: { type: "float", value: light.light.intensity },
    };

    const world = mat4Mul(
      mat4(),
      light.objectToWorldMatrix,
      renderParams.worldToViewMatrix
    );

    const uniforms: Uniforms = {
      world: { type: "mat4", value: world },
      invWorld: { type: "mat4", value: renderParams.viewToWorldMatrix },
      projection: { type: "mat4", value: renderParams.camera.projection },
      cameraPosition: { type: "vec3", value: renderParams.camera.position },
      ...extraUniforms,
    };

    uniforms.positionTexture = {
      type: "texture0",
      value: gBuffer.renderFrameBuffer.getRenderTarget("position").texture,
    };
    uniforms.normalTexture = {
      type: "texture1",
      value: gBuffer.renderFrameBuffer.getRenderTarget("normal").texture,
    };
    uniforms.diffuseTexture = {
      type: "texture2",
      value: gBuffer.renderFrameBuffer.getRenderTarget("color").texture,
    };

    gBuffer.lightingFrameBuffer.bind(gl);

    model?.prepare(gl, uniforms);
    model?.draw(gl);
  }
}
