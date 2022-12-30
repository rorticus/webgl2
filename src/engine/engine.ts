import { Scene } from "./scene";
import {
  mat4,
  Mat4,
  mat4Identity,
  mat4Mul,
  mat4Perspective,
  mat4Scale,
  mat4Translation,
  mat4Transpose,
} from "../gl/mat4";
import { ModelComponent, PositionComponent } from "./components";
import { vec3 } from "../gl/vec3";
import { GBuffer } from "../gl/buffers";
import Model from "../gl/model";
import Geometry from "../gl/geometry";
import Material from "../gl/material";
import { createFragmentShader, createVertexShader } from "../gl/shaders";

export class Engine {
  root?: Scene<any, any>;
  canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  projection: Mat4;
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
      new Material(
        gl,
        createVertexShader(
          gl,
          `#version 300 es
precision mediump float;

in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {
  gl_Position = vec4(position, 1.0);
  vUv = uv;
}      
      `
        ),
        createFragmentShader(
          gl,
          `#version 300 es
precision mediump float;

uniform sampler2D positionTexture;

in vec2 vUv;

out vec4 color;

void main() {
  color = vec4(texture(positionTexture, vUv).xyz, 1.0);
}
        `
        )
      )
    );

    this.projection = mat4();
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

      // lighting pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.lightingFrameBuffer);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);

      gl.enable(gl.STENCIL_TEST);
      gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP);
      gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP);

      gl.depthMask(false);

      gl.cullFace(gl.FRONT);

      this.render();

      gl.disable(gl.BLEND);
      gl.cullFace(gl.BACK);
      gl.enable(gl.CULL_FACE);
      gl.depthMask(true);
      gl.disable(gl.STENCIL_TEST);
      gl.enable(gl.DEPTH_TEST);

      // final pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      this.finalQuad.prepare(gl, {
        positionTexture: {
          type: "texture0",
          value: this.gBuffer.color.texture,
        },
      });
      this.finalQuad.draw(gl);

      requestAnimationFrame(render);
    };

    render();
  }

  resize(width: number, height: number) {
    mat4Perspective(
      this.projection,
      (Math.PI * 90) / 180,
      width,
      height,
      0.1,
      500
    );

    this.gBuffer.resize(this.gl);
  }

  render() {
    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.root) {
      // render each entity in the scene
      const worldMatrix = this.root.camera.inverseTransform;
      const projectionMatrix = this.projection;

      const models = this.root.entities.getEntities(ModelComponent);
      const transform = mat4();

      models.forEach((modelEntity) => {
        const model = this.root?.entities.getComponent(
          modelEntity,
          ModelComponent
        );

        mat4Identity(transform);

        const position = this.root?.entities.getComponent(
          modelEntity,
          PositionComponent
        );
        if (position) {
          const translate = mat4Translation(mat4(), position.position);
          const s = mat4Scale(
            mat4(),
            vec3(position.scale, position.scale, position.scale)
          );

          mat4Mul(transform, transform, s);
          // mat4Mul(transform, transform, r);
          mat4Mul(transform, transform, translate);
        }

        model.prepare(gl, {
          object: { type: "mat4", value: transform },
          world: { type: "mat4", value: worldMatrix },
          projection: { type: "mat4", value: projectionMatrix },
          uNormalMatrix: {
            type: "mat4",
            value: mat4Transpose(mat4(), transform),
          },
          elapsed: { type: "float", value: this.elapsed },
        });
        model.draw(gl);
      });
    }
  }
}
