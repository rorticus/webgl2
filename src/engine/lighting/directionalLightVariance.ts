import { RenderParams } from "../types";
import { Uniforms } from "../gl/unforms";
import { DirectionalLight } from "../lighting";
import { mat4, mat4Inv, mat4LookAt, mat4Mul, mat4Ortho } from "../math/mat4";
import { vec3, vec3Add, vec3DistanceTo, vec3Scale } from "../math/vec3";
import Material from "../gl/material";
import shadowVertexShader from "./shaders/shadowdepth.vert";
import shadowFragmentShader from "./shaders/shadow-variance-depth.frag";
import { FrameBuffer } from "../gl/framebuffer";
import { DirectionalLightNoShadows } from "./directionalLightNoShadows";
import dirLightVert from "./shaders/dirlight-pcf.vert";
import dirLightFrag from "./shaders/dirlight-variance.frag";
import blurVert from "./shaders/blur.vert";
import blurFrag from "./shaders/blur.frag";
import { applyFilter } from "../gl/helpers";

const shadowMaterial = new Material(shadowVertexShader, shadowFragmentShader);
const dirLightMaterial = new Material(dirLightVert, dirLightFrag);
const blurMaterial = new Material(blurVert, blurFrag);

export class DirectionalLightVariance extends DirectionalLightNoShadows {
  shadowBufferWidth: number;
  shadowBufferHeight: number;
  shadowFrameBuffer: FrameBuffer;
  blurredShadowBuffer: FrameBuffer;

  constructor(gl: WebGL2RenderingContext) {
    super();
    this.dirLightMaterial = dirLightMaterial;

    this.shadowBufferWidth = 1024;
    this.shadowBufferHeight = 1024;

    this.shadowFrameBuffer = new FrameBuffer(
      gl,
      this.shadowBufferWidth,
      this.shadowBufferHeight,
      {
        color: {
          depth: { format: gl.RGBA32F, filter: gl.LINEAR },
        },
        depth: true,
      }
    );
    this.blurredShadowBuffer = new FrameBuffer(
      gl,
      this.shadowBufferWidth,
      this.shadowBufferHeight,
      {
        color: {
          depth: { format: gl.RGBA32F, filter: gl.LINEAR },
        },
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
    // let fieldOfView =
    //   Math.PI *
    //   2 *
    //   Math.atan(boundingSphere.radius / (nearPlaneDistance + farPlaneDistance));

    // Create the projection matrix
    // let projectionMatrix = mat4Perspective(
    //   mat4(),
    //   fieldOfView,
    //   this.shadowBufferWidth,
    //   this.shadowBufferHeight,
    //   nearPlaneDistance,
    //   farPlaneDistance
    // );

    const projectionMatrix = mat4Ortho(
      mat4(),
      -boundingSphere.radius,
      boundingSphere.radius,
      -boundingSphere.radius,
      boundingSphere.radius,
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

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.cullFace(gl.BACK);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

    const blurAmount = 4;
    applyFilter(
      gl,
      blurMaterial,
      this.shadowFrameBuffer.getRenderTarget("depth").texture,
      this.blurredShadowBuffer,
      {
        blurScale: {
          type: "vec2",
          value: [(1.0 / this.shadowBufferWidth) * blurAmount, 0],
        },
      }
    );

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    applyFilter(
      gl,
      blurMaterial,
      this.blurredShadowBuffer.getRenderTarget("depth").texture,
      this.shadowFrameBuffer,
      {
        blurScale: {
          type: "vec2",
          value: [0, (1.0 / this.shadowBufferHeight) * blurAmount],
        },
      }
    );

    gl.cullFace(gl.FRONT);

    return {
      shadowed: {
        type: "bool",
        value: true,
      },
      shadowTexture: {
        type: "texture3",
        value: this.shadowFrameBuffer.getRenderTarget("depth").texture,
      },
      lightViewMatrix: { type: "mat4", value: worldToViewMatrix },
      lightProjectionMatrix: {
        type: "mat4",
        value: projectionMatrix,
      },
    };
  }
}
