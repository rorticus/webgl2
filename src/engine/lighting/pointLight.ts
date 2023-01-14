import { LightGBuffer, LightRenderer } from "./lights";
import { RenderParams, RenderParamsLight } from "../types";
import { mat4, mat4Mul } from "../../gl/mat4";
import { Uniforms } from "../../gl/unforms";
import Model from "../../gl/model";
import Material from "../../gl/material";
import pointLightVert from "./shaders/pointlight.vert";
import pointLightFrag from "./shaders/pointlight.frag";
import { createIcoSphere } from "../../gl/sphere";

const pointLightMaterial = new Material(pointLightVert, pointLightFrag);
const icoSphere = createIcoSphere();

export class PointLightRenderer implements LightRenderer {
  renderLight(
    gl: WebGL2RenderingContext,
    gBuffer: LightGBuffer,
    light: RenderParamsLight,
    renderParams: RenderParams
  ): void {
    const model = new Model(icoSphere, pointLightMaterial);
    model.geometry = icoSphere;
    let extraUniforms: Uniforms = {
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

    model?.prepare(gl, uniforms);
    model?.draw(gl);
  }
}
