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

export class Engine {
  root?: Scene<any, any>;
  canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  projection: Mat4;
  lastTime: number = 0;
  elapsed = 0;

  private pickerTexture: WebGLTexture;
  private depthRenderBuffer: WebGLRenderbuffer;
  private frameBuffer: WebGLFramebuffer;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2")!;

    this.gl = gl;

    this.pickerTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.pickerTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.depthRenderBuffer = gl.createRenderbuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    this.frameBuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.pickerTexture,
      0
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.depthRenderBuffer
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0.25, 0, 1);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

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

      // off screen rendering
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
      this.render();

      // on screen rendering
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.render();

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

    const gl = this.gl;

    gl.deleteTexture(this.pickerTexture);
    this.pickerTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.pickerTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.deleteRenderbuffer(this.depthRenderBuffer);
    this.depthRenderBuffer = gl.createRenderbuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      width,
      height
    );
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.pickerTexture,
      0
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.depthRenderBuffer
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
