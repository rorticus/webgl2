import { AttributeSource, IndexBuffer, PositionBuffer } from "./buffers";
import { setUniform, Uniforms } from "./unforms";

class Material {
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;

  attributes: Record<string, string> = {
    vPosition: PositionBuffer,
  };

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

    Object.keys(this.attributes).forEach((attributeName) => {
      this.attributeMap[attributeName] = gl.getAttribLocation(
        this.program,
        attributeName
      );
    });
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

    Object.keys(this.attributes).forEach((attributeName) => {
      const buffer = attributeSource[this.attributes[attributeName]];
      const attributePosition = this.attributeMap[attributeName];

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attributePosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attributePosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    });

    const indexBuffer = attributeSource[IndexBuffer];
    if (indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    }
  }
}

export default Material;
