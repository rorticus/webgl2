import { BaseScene } from "./scene";
import {
  mat4,
  Mat4,
  mat4Identity,
  mat4Inv,
  mat4Mul,
  mat4Scale,
  mat4Translation,
} from "./math/mat4";
import {
  ConstraintComponent,
  LightComponent,
  Model2DComponent,
  ModelComponent,
  PositionComponent,
  RigidBodyComponent,
} from "./components";
import { Vec3, vec3 } from "./math/vec3";
import Material from "./gl/material";
import accumVert from "./shaders/accum.vert";
import accumFrag from "./shaders/accum.frag";
import { Uniforms } from "./gl/unforms";
import {
  quat,
  quatMul,
  quatRotationAboutX,
  quatRotationAboutY,
  quatRotationAboutZ,
  quatToMat4,
} from "./math/quat";
import { BoundingSphere } from "./gl/boundingSphere";
import { RenderParams } from "./types";
import { LightRenderer } from "./lighting/lights";
import { PointLightRenderer } from "./lighting/pointLight";
import { FrameBuffer } from "./gl/framebuffer";
import { DirectionalLightVariance } from "./lighting/directionalLightVariance";
import { applyFilter } from "./gl/helpers";
import { DirectionalLightNoShadows } from "./lighting/directionalLightNoShadows";
import { DirectionalLightPCF } from "./lighting/directionalLightPCF";
import { PhysicsSolverSystem } from "./physics/physicssolver.system";
import { drawOBB, drawSphere } from "./gl/constraintDisplay";
import { RIGID_BODY_BOX, RIGID_BODY_SPHERE } from "./physics/physics";
import { RigidBodyVolume } from "./physics/rigidBodyVolume";
import { sphere3d } from "./math/geometry3d";

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

export class Engine<T extends BaseScene> {
  root?: T;
  canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  lastTime: number = 0;
  elapsed = 0;
  lightRenderers: Record<string, LightRenderer> = {};
  systems: T["systems"] = [];

  debug = {
    drawConstraints: false,
    drawRigidVolumes: false,
  };

  // gbuffer
  renderFrameBuffer: FrameBuffer;
  lightingFrameBuffer: FrameBuffer;

  private finalMaterial: Material;
  private debugPoints: {
    [key: string]: {
      point: () => Vec3;
      color: Vec3 | undefined;
    }
  } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2")!;

    this.gl = gl;

    this.systems = [PhysicsSolverSystem];

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
      directionalNoShadows: new DirectionalLightNoShadows(),
      directionalPCF: new DirectionalLightPCF(gl),
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

    this.finalMaterial = new Material(accumVert, accumFrag);

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

      // run engine systems
      this.systems.forEach((system) => system(this.root!, dt));

      // run scene systems
      this.root?.systems.forEach((system) => system(this.root!, dt));

      const gl = this.gl;

      const modelsInFrustum = this.root?.entities.withComponents(
        ModelComponent,
        PositionComponent
      )!;
      const lights = this.root?.entities.withComponents(LightComponent)!;

      const renderParamModels = modelsInFrustum.map((entity) => {
        const m = entity.component(ModelComponent);
        const p = entity.component(PositionComponent);

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
        const l = entity.component(LightComponent);
        const p = entity.component(PositionComponent);

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
              m.model.geometry.boundingSphere!.movedAndScaled(
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
      applyFilter(
        gl,
        this.finalMaterial,
        this.renderFrameBuffer.getRenderTarget("accum").texture,
        null
      );

      // render 2d shapes
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);

      if (this.debug.drawConstraints) {
        this.root?.entities
          .withComponents(ConstraintComponent)
          .forEach((entity) => {
            drawOBB(
              gl,
              renderParams.worldToViewMatrix,
              renderParams.camera.projection,
              entity.component(ConstraintComponent)
            );
          });
      }

      if (this.debug.drawRigidVolumes) {
        this.root?.entities
          .withComponents(RigidBodyComponent)
          .forEach((entity) => {
            const r = entity.component(RigidBodyComponent) as RigidBodyVolume;

            if (r.type === RIGID_BODY_BOX) {
              drawOBB(
                gl,
                renderParams.worldToViewMatrix,
                renderParams.camera.projection,
                r.obb!
              );
            } else if (r.type === RIGID_BODY_SPHERE) {
              drawSphere(
                gl,
                renderParams.worldToViewMatrix,
                renderParams.camera.projection,
                r.sphere!
              );
            }
          });
      }

      this.renderDebugPoints(renderParams);

      this.root?.entities
        .withComponents(Model2DComponent)
        ?.forEach((entity) => {
          const p = entity.component(PositionComponent);

          const position = p?.position ?? vec3(0, 0, 0);
          const orientation = p?.orientation ?? vec3(0, 0, 0);
          const scale = p?.scale ?? 1;
          const worldMatrix = positionToMat4(
            mat4(),
            position,
            orientation,
            scale
          );

          const model = entity.component(Model2DComponent);

          model.prepare(gl, {
            objectToWorldMatrix: { type: "mat4", value: worldMatrix },
          });
          model.draw(gl);
        });

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);

      requestAnimationFrame(render);
    };

    render();
  }

  resize(width: number, height: number) {
    this.root?.camera?.resize(width, height);
    this.renderFrameBuffer.resize(this.gl);
    this.lightingFrameBuffer.resize(this.gl);
  }

  setRootScene(scene: T) {
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
          localWorld: { type: "mat4", value: model.objectToWorldMatrix },
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

  renderDebugPoints(renderParams: RenderParams) {
    Object.keys(this.debugPoints).forEach((key) => {
      const point = this.debugPoints[key];
      if (point) {
        drawSphere(
          this.gl,
          renderParams.worldToViewMatrix,
          renderParams.camera.projection,
          sphere3d(point.point(), 0.02),
          point.color || vec3(1, 0, 0)
        );
      }
    });
  }

  drawPoint(key: string, point: (() => Vec3) | null, color?: Vec3) {
    if (point === null) {
      delete this.debugPoints[key];
    } else {
      this.debugPoints[key] = {
        point,
        color
      };
    }
  }
}
