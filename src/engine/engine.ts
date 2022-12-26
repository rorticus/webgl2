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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2")!;

    this.gl = gl;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0.25, 0, 1);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    this.projection = mat4();
    this.resize(canvas.width, canvas.height);
  }

  start() {
    this.lastTime = Date.now();
    this.elapsed = 0;

    const render = () => {
      const now = Date.now();
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      this.elapsed += dt;

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
      1000
    );
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
