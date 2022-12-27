import { AttributeSource, IBO, VBO } from "./buffers";
import { setUniform, Uniform } from "./unforms";

interface MaterialGroup {
  indices: Uint16Array;
  indexBuffer?: IBO | null;
  uniforms?: { [key: string]: Uniform };
}

class Geometry {
  vertexBufferData: Record<string, Float32Array> = {};

  private vertexBuffers: Record<string, VBO> = {};

  groups: MaterialGroup[] = [];

  constructor(
    vertexBufferData: Record<string, Float32Array>,
    groups: MaterialGroup[]
  ) {
    this.vertexBufferData = vertexBufferData;
    this.groups = groups;
  }

  getBuffer(buffer: string, gl: WebGL2RenderingContext) {
    if (!this.vertexBuffers[buffer]) {
      this.vertexBuffers[buffer] = new VBO(this.vertexBufferData[buffer]);
    }

    return this.vertexBuffers[buffer].getBuffer(gl);
  }

  getIndexBuffer(gl: WebGL2RenderingContext, group: number) {
    const g = this.groups[group];

    if (!g.indexBuffer) {
      g.indexBuffer = new IBO(g.indices);
    }

    return g.indexBuffer.getBuffer(gl);
  }

  getAttributeSource(gl: WebGL2RenderingContext): AttributeSource {
    return {
      ...Object.keys(this.vertexBufferData).reduce((res, bufferName) => {
        return {
          ...res,
          [bufferName]: this.getBuffer(bufferName, gl),
        };
      }, {}),
    };
  }

  draw(
    gl: WebGL2RenderingContext,
    uniformMap: { [key: string]: WebGLUniformLocation }
  ) {
    for (let i = 0; i < this.groups.length; i++) {
      const g = this.groups[i];
      const indexBuffer = this.getIndexBuffer(gl, i);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      const allUniforms = g.uniforms || {};
      Object.keys(allUniforms).forEach((uniformName) => {
        setUniform(gl, uniformMap[uniformName], allUniforms[uniformName]);
      });

      gl.drawElements(gl.TRIANGLES, g.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }
}

export default Geometry;
