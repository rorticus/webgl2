import { AttributeSource } from "./buffers";
import { setUniform, Uniforms } from "./unforms";

class Material {
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;

  attributeMap: { [key: string]: number } = {};
  uniformMap: { [key: string]: WebGLUniformLocation } = {};

  constructor(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    const p = gl.createProgram()!;
    this.program = p;

    gl.attachShader(p, this.vertexShader);
    gl.attachShader(p, this.fragmentShader);

    gl.linkProgram(p);

    const numUniforms = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const uniform = gl.getActiveUniform(p, i)!;
      this.uniformMap[uniform.name] = gl.getUniformLocation(p, uniform.name)!;
    }

    const numAttributes = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; i++) {
      const attribute = gl.getActiveAttrib(p, i)!;
      this.attributeMap[attribute.name] = gl.getAttribLocation(
        p,
        attribute.name
      );
    }
  }

  prepare(
    gl: WebGL2RenderingContext,
    attributeSource: AttributeSource,
    renderUniforms: Uniforms
  ) {
    gl.useProgram(this.program);

    Object.keys(renderUniforms).forEach((uniformName) => {
      if (this.uniformMap[uniformName]) {
        setUniform(
          gl,
          this.uniformMap[uniformName],
          renderUniforms[uniformName]
        );
      }
    });

    Object.keys(this.attributeMap).forEach((attributeName) => {
      const vbo = attributeSource[attributeName];
      vbo?.bindToAttribute(gl, this.attributeMap[attributeName]);
    });
  }
}

export default Material;
