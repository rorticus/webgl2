import { Scene } from "./scene";
import {
  mat4,
  Mat4,
  mat4Identity,
  mat4Inv,
  mat4Mul,
  mat4Scale,
  mat4Translation,
} from "../gl/mat4";
import {
  LightComponent,
  ModelComponent,
  PositionComponent,
} from "./components";
import { Vec3, vec3 } from "../gl/vec3";
import Model from "../gl/model";
import Geometry from "../gl/geometry";
import Material from "../gl/material";
import accumVert from "../shaders/accum.vert";
import accumFrag from "../shaders/accum.frag";
import { Uniforms } from "../gl/unforms";
import {
  quat,
  quatMul,
  quatRotationAboutX,
  quatRotationAboutY,
  quatRotationAboutZ,
  quatToMat4,
} from "../gl/quat";
import { BoundingSphere } from "../gl/boundingSphere";
import { RenderParams } from "./types";
import { LightRenderer } from "./lighting/lights";
import { PointLightRenderer } from "./lighting/pointLight";
import { DirectionalLightPCF } from "./lighting/directionalLightPCF";
import { FrameBuffer } from "../gl/framebuffer";
import { DirectionalLightVariance } from "./lighting/directionalLightVariance";

function positionToMat4(
  dest: Mat4,
  position: Vec3,
  orientation: Vec3,
  scale: number
): Mat4 {
  mat4Identity(dest);

  const translate = mat4Translation(mat4(), position);
  const s = mat4Scale(mat4(), vec3(scale, scale, scale));

  const q = quat();
  quatMul(q, q, quatRotationAboutX(quat(), orientation[0]));
  quatMul(q, q, quatRotationAboutY(quat(), orientation[1]));
  quatMul(q, q, quatRotationAboutZ(quat(), orientation[2]));
  const r = quatToMat4(mat4(), q);

  mat4Mul(dest, dest, s);
  mat4Mul(dest, dest, r);
  mat4Mul(dest, dest, translate);

  return dest;
}

export class Engine {
  root?: Scene<any, any>;
  canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  lastTime: number = 0;
  elapsed = 0;
  lightRenderers: Record<string, LightRenderer> = {};

  // gbuffer
  renderFrameBuffer: FrameBuffer;
  lightingFrameBuffer: FrameBuffer;

  private finalQuad: Model;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2")!;

    this.gl = gl;

    this.renderFrameBuffer = new FrameBuffer(
      gl,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      {
        color: {
          position: { format: gl.RGBA32F },
          normal: { format: gl.RGBA32F },
          color: { format: gl.RGBA32F },
          accum: { format: gl.RGBA32F },
        },
        depth: true,
      }
    );

    this.lightingFrameBuffer = new FrameBuffer(
      gl,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      {
        color: {
          accum: { target: this.renderFrameBuffer, name: "accum" },
        },
        depth: this.renderFrameBuffer,
      }
    );

    this.lightRenderers = {
      point: new PointLightRenderer(),
      directional: new DirectionalLightVariance(gl),
    };

    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error(
        "Required extension EXT_color_buffer_float is not available."
      );
    }

    gl.getExtension("OES_texture_float_linear");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.clearStencil(0);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    this.finalQuad = new Model(
      new Geometry(
        {
          position: {
            type: "vec3",
            data: new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]),
          },
          uv: {
            type: "vec2",
            data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
          },
        },
        [
          {
            indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
          },
        ]
      ),
      new Material(accumVert, accumFrag)
    );

    this.resize(canvas.clientWidth, canvas.clientHeight);
  }

  start() {
    this.lastTime = Date.now();
    this.elapsed = 0;

    const render = () => {
      const now = Date.now();
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      this.elapsed += dt;

      this.root?.systems.forEach((system) => system(this.root!, dt));

      const gl = this.gl;

      const modelsInFrustum = this.root?.entities.getEntities(ModelComponent)!;
      const lights = this.root?.entities.getEntities(LightComponent)!;

      const renderParamModels = modelsInFrustum.map((entity) => {
        const m = this.root?.entities.getComponent(entity, ModelComponent)!;
        const p = this.root?.entities.getComponent(entity, PositionComponent)!;

        const position = p?.position ?? vec3(0, 0, 0);
        const orientation = p?.orientation ?? vec3(0, 0, 0);
        const scale = p?.scale ?? 1;
        const worldMatrix = positionToMat4(
          mat4(),
          position,
          orientation,
          scale
        );
        return {
          model: m,
          position,
          orientation,
          scale,
          objectToWorldMatrix: worldMatrix,
        };
      });

      const renderParamsLights = lights.map((entity) => {
        const l = this.root?.entities.getComponent(entity, LightComponent)!;
        const p = this.root?.entities.getComponent(entity, PositionComponent)!;

        const position = p?.position ?? vec3(0, 0, 0);
        const orientation = p?.orientation ?? vec3(0, 0, 0);
        const scale = p?.scale ?? 1;
        const worldMatrix = positionToMat4(
          mat4(),
          position,
          orientation,
          scale
        );

        return {
          light: l,
          position,
          orientation,
          scale,
          objectToWorldMatrix: worldMatrix,
        };
      });

      const renderParams: RenderParams = {
        models: renderParamModels,
        lights: renderParamsLights,
        boundingSphere: BoundingSphere.merge(
          renderParamModels
            .filter((m) => !!m.model?.geometry?.boundingSphere)
            .map((m) =>
              m.model.geometry.boundingSphere.movedAndScaled(
                m.position,
                m.scale
              )
            )
        ),
        camera: this.root?.camera!,
        worldToViewMatrix: this.root?.camera.inverseTransform!,
        viewToWorldMatrix: this.root?.camera.cameraTransform!,
      };

      // g buffer pass
      this.renderModels(renderParams);

      // lighting pass
      this.renderLights(renderParams);

      // final pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      this.finalQuad.prepare(gl, {
        positionTexture: {
          type: "texture0",
          // value: (this.lightRenderers["directional"] as any).shadowDepthBuffer
          //   .texture,
          value: this.renderFrameBuffer.getRenderTarget("accum").texture,
        },
      });
      this.finalQuad.draw(gl);

      requestAnimationFrame(render);
    };

    render();
  }

  resize(width: number, height: number) {
    this.root?.camera?.resize(width, height);
    this.renderFrameBuffer.resize(this.gl);
    this.lightingFrameBuffer.resize(this.gl);
  }

  setRootScene(scene: Scene<any, any>) {
    this.root = scene;
    this.root.camera.resize(
      this.gl.drawingBufferWidth,
      this.gl.drawingBufferHeight
    );
  }

  renderModels(params: RenderParams) {
    const gl = this.gl;

    this.renderFrameBuffer.bind(gl);

    gl.disable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.root) {
      // render each entity in the scene
      const worldMatrix = this.root.camera.inverseTransform;
      const projectionMatrix = this.root.camera.projection;

      params.models.forEach((model) => {
        const world = mat4Mul(mat4(), model.objectToWorldMatrix, worldMatrix);
        const invWorld = mat4Inv(mat4(), world);

        const uniforms: Uniforms = {
          world: { type: "mat4", value: world },
          invWorld: { type: "mat4", value: invWorld },
          projection: { type: "mat4", value: projectionMatrix },
          elapsed: { type: "float", value: this.elapsed },
        };

        model?.model.prepare(gl, uniforms);
        model?.model.draw(gl);
      });
    }
  }

  renderLights(params: RenderParams) {
    const gl = this.gl;

    if (this.root) {
      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);
      gl.cullFace(gl.FRONT);

      // render each entity in the scene
      params.lights.forEach((l) => {
        if (l.light.type in this.lightRenderers) {
          this.lightRenderers[l.light.type].renderLight(
            gl,
            {
              renderFrameBuffer: this.renderFrameBuffer,
              lightingFrameBuffer: this.lightingFrameBuffer,
            },
            l,
            params
          );
        }
      });

      gl.disable(gl.BLEND);
      gl.cullFace(gl.BACK);
      gl.enable(gl.CULL_FACE);
      gl.depthMask(true);
      gl.enable(gl.DEPTH_TEST);
    }
  }
}
