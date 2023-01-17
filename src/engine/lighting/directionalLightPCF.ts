import { RenderParams } from "../types";
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
import { FrameBuffer } from "../../gl/framebuffer";
import { DirectionalLightNoShadows } from "./directionalLightNoShadows";

const shadowMaterial = new Material(shadowVertexShader, shadowFragmentShader);

export class DirectionalLightPCF extends DirectionalLightNoShadows {
  shadowBufferWidth: number;
  shadowBufferHeight: number;
  shadowFrameBuffer: FrameBuffer;

  constructor(gl: WebGL2RenderingContext) {
    super();

    this.shadowBufferWidth = 2048;
    this.shadowBufferHeight = 2048;

    this.shadowFrameBuffer = new FrameBuffer(
      gl,
      this.shadowBufferWidth,
      this.shadowBufferHeight,
      {
        depth: true,
      }
    );
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

    this.shadowFrameBuffer.bind(gl);

    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.cullFace(gl.FRONT);

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

    gl.cullFace(gl.FRONT);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    return {
      shadowed: {
        type: "bool",
        value: true,
      },
      shadowTexture: {
        type: "texture3",
        value: this.shadowFrameBuffer.getDepthBuffer()!,
      },
      lightViewMatrix: { type: "mat4", value: worldToViewMatrix },
      lightProjectionMatrix: {
        type: "mat4",
        value: projectionMatrix,
      },
    };
  }
}
