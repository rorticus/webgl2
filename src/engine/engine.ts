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
import { GBuffer } from "../gl/buffers";
import Model from "../gl/model";
import Geometry from "../gl/geometry";
import Material from "../gl/material";
import accumVert from "../shaders/accum.vert";
import accumFrag from "../shaders/accum.frag";
import { getLightModel } from "./lighting";
import { Uniforms } from "../gl/unforms";
import {
  quat,
  quatMul,
  quatRotationAboutX,
  quatRotationAboutY,
  quatRotationAboutZ,
  quatToMat4,
} from "../gl/quat";

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

  gBuffer: GBuffer;
  private finalQuad: Model;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2")!;

    this.gl = gl;

    this.gBuffer = new GBuffer(gl);

    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error(
        "Required extension EXT_color_buffer_float is not available."
      );
    }

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

      // g buffer pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.renderFrameBuffer);

      gl.clear(
        gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT
      );

      gl.disable(gl.BLEND);

      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);

      // off screen rendering
      this.render();

      // // lighting pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.lightingFrameBuffer);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);

      // gl.enable(gl.STENCIL_TEST);
      // gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP);
      // gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP);

      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);

      gl.cullFace(gl.FRONT);

      this.render(true);

      gl.disable(gl.BLEND);
      gl.cullFace(gl.BACK);
      gl.enable(gl.CULL_FACE);
      gl.depthMask(true);
      // gl.disable(gl.STENCIL_TEST);
      gl.enable(gl.DEPTH_TEST);

      // shadow maps
      this.root?.entities.getEntities(LightComponent).forEach((entity) => {
        const light = this.root?.entities.getComponent(entity, LightComponent);
        if (light.shadows) {
          const position = this.root?.entities.getComponent(
            entity,
            PositionComponent
          );
          if (position) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.shadowFrameBuffer);
          }
        }
      });

      // final pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      this.finalQuad.prepare(gl, {
        positionTexture: {
          type: "texture0",
          value: this.gBuffer.accum.texture,
        },
      });
      this.finalQuad.draw(gl);

      requestAnimationFrame(render);
    };

    render();
  }

  resize(width: number, height: number) {
    this.root?.camera?.resize(width, height);
    this.gBuffer.resize(this.gl);
  }

  setRootScene(scene: Scene<any, any>) {
    this.root = scene;
    this.root.camera.resize(
      this.gl.drawingBufferWidth,
      this.gl.drawingBufferHeight
    );
  }

  render(lights = false) {
    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.root) {
      // render each entity in the scene
      const worldMatrix = this.root.camera.inverseTransform;
      const projectionMatrix = this.root.camera.projection;

      const models = this.root.entities.getEntities(
        lights ? LightComponent : ModelComponent
      );
      const localTransform = mat4();

      models.forEach((modelEntity) => {
        let model: Model | null = null;
        let extraUniforms: Uniforms = {};

        if (lights) {
          let result = getLightModel(
            this.root?.entities.getComponent(modelEntity, LightComponent)
          );

          if (result) {
            model = result.model;
            extraUniforms = result.uniforms;
          }
        } else {
          model = this.root?.entities.getComponent(modelEntity, ModelComponent);
        }

        mat4Identity(localTransform);

        const position = this.root?.entities.getComponent(
          modelEntity,
          PositionComponent
        );
        if (position) {
          positionToMat4(
            localTransform,
            position.position,
            position.orientation,
            position.scale
          );
        }

        const world = mat4Mul(mat4(), localTransform, worldMatrix);
        const invWorld = mat4Inv(mat4(), world);

        const uniforms: Uniforms = {
          world: { type: "mat4", value: world },
          invWorld: { type: "mat4", value: invWorld },
          projection: { type: "mat4", value: projectionMatrix },
          elapsed: { type: "float", value: this.elapsed },
          ...extraUniforms,
        };

        if (lights) {
          uniforms.positionTexture = {
            type: "texture0",
            value: this.gBuffer.position.texture,
          };
          uniforms.normalTexture = {
            type: "texture1",
            value: this.gBuffer.normal.texture,
          };
          uniforms.diffuseTexture = {
            type: "texture2",
            value: this.gBuffer.color.texture,
          };
        }

        model?.prepare(gl, uniforms);
        model?.draw(gl);
      });
    }
  }
}
