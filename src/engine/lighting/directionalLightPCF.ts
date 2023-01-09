import { LightRenderer } from "./lights";
import { GBuffer, RenderTarget } from "../../gl/buffers";
import { RenderParams, RenderParamsLight } from "../types";
import Model from "../../gl/model";
import { Uniforms } from "../../gl/unforms";
import { DirectionalLight } from "../lighting";
import {
  mat4,
  mat4Inv,
  mat4LookAt,
  mat4Mul,
  mat4Perspective,
} from "../../gl/mat4";
import { vec3, vec3Add, vec3DistanceTo, vec3Scale } from "../../gl/vec3";
import Material from "../../gl/material";
import shadowVertexShader from "./shaders/shadowdepth.vert";
import shadowFragmentShader from "./shaders/shadowdepth.frag";
import dirLightVert from "./shaders/dirlight-pcf.vert";
import dirLightFrag from "./shaders/dirlight-pcf.frag";
import { createIcoSphere } from "../../gl/sphere";

const shadowMaterial = new Material(shadowVertexShader, shadowFragmentShader);
const directionalLightMaterial = new Material(dirLightVert, dirLightFrag);

const icoSphere = createIcoSphere();

export class DirectionalLightPCF implements LightRenderer {
  shadowBufferWidth: number;
  shadowBufferHeight: number;
  shadowDepthBuffer: RenderTarget;
  shadowFrameBuffer: WebGLFramebuffer;

  constructor(gl: WebGL2RenderingContext) {
    this.shadowBufferWidth = 1024;
    this.shadowBufferHeight = 1024;

    this.shadowDepthBuffer = new RenderTarget(
      gl.DEPTH_COMPONENT32F,
      gl,
      this.shadowBufferWidth,
      this.shadowBufferHeight
    );
    this.shadowFrameBuffer = gl.createFramebuffer()!;

    // set up the shadow framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFrameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.shadowDepthBuffer.texture,
      0
    );
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  renderLight(
    gl: WebGL2RenderingContext,
    gBuffer: GBuffer,
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

    if (light.light.shadows) {
      extraUniforms = {
        ...extraUniforms,
        ...this.renderShadows(
          gl,
          light.light as DirectionalLight,
          renderParams
        ),
      };
    }

    const uniforms: Uniforms = {
      world: { type: "mat4", value: world },
      invWorld: { type: "mat4", value: renderParams.viewToWorldMatrix },
      projection: { type: "mat4", value: renderParams.camera.projection },
      cameraPosition: { type: "vec3", value: renderParams.camera.position },
      ...extraUniforms,
    };

    uniforms.positionTexture = {
      type: "texture0",
      value: gBuffer.position.texture,
    };
    uniforms.normalTexture = {
      type: "texture1",
      value: gBuffer.normal.texture,
    };
    uniforms.diffuseTexture = {
      type: "texture2",
      value: gBuffer.color.texture,
    };

    gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer.lightingFrameBuffer);
    model?.prepare(gl, uniforms);
    model?.draw(gl);
  }

  renderShadows(
    gl: WebGL2RenderingContext,
    light: DirectionalLight,
    params: RenderParams
  ): Uniforms {
    const boundingSphere = params.boundingSphere;
    const cameraPosition = vec3Add(
      vec3(),
      boundingSphere.center,
      vec3Scale(vec3(), light.direction, boundingSphere.radius * 2)
    );

    // Calculate the near plane distance
    let nearPlaneDistance =
      vec3DistanceTo(cameraPosition, boundingSphere.center) -
      boundingSphere.radius;

    // Calculate the far plane distance
    let farPlaneDistance =
      vec3DistanceTo(cameraPosition, boundingSphere.center) +
      boundingSphere.radius;

    // Calculate the field of view
    let fieldOfView =
      Math.PI *
      2 *
      Math.atan(boundingSphere.radius / (nearPlaneDistance + farPlaneDistance));

    // Create the projection matrix
    let projectionMatrix = mat4Perspective(
      mat4(),
      fieldOfView,
      this.shadowBufferWidth,
      this.shadowBufferHeight,
      nearPlaneDistance,
      farPlaneDistance
    );

    // Create the view matrix
    const worldToViewMatrix = mat4LookAt(
      mat4(),
      boundingSphere.center,
      cameraPosition,
      vec3(0, 1, 0)
    );

    mat4Inv(worldToViewMatrix, worldToViewMatrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFrameBuffer);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    const oldViewport: [number, number, number, number] = gl.getParameter(
      gl.VIEWPORT
    );
    gl.viewport(0, 0, this.shadowBufferWidth, this.shadowBufferHeight);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);

    // draw each model from this perspective
    params.models.forEach((model) => {
      const world = mat4Mul(
        mat4(),
        model.objectToWorldMatrix,
        worldToViewMatrix
      );

      const uniforms: Uniforms = {
        world: { type: "mat4", value: world },
        projection: { type: "mat4", value: projectionMatrix },
      };

      // prepare the material
      shadowMaterial.prepare(
        gl,
        model?.model.geometry.getAttributeSource(),
        uniforms
      );
      model?.model.geometry.draw(gl, uniforms);
    });

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    gl.viewport(...oldViewport);

    return {
      shadowed: {
        type: "bool",
        value: true,
      },
      shadowTexture: {
        type: "texture3",
        value: this.shadowDepthBuffer.texture,
      },
      lightViewMatrix: { type: "mat4", value: worldToViewMatrix },
      lightProjectionMatrix: {
        type: "mat4",
        value: projectionMatrix,
      },
    };
  }
}
