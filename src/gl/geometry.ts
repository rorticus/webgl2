import { AttributeSource, IBO, VBO, VBOData } from "./buffers";
import { setUniform, Uniform } from "./unforms";
import { BoundingSphere } from "./boundingSphere";

interface MaterialGroup {
  indices: Uint16Array;
  indexBuffer?: IBO | null;
  uniforms?: { [key: string]: Uniform };
}

class Geometry {
  vertexBufferData: Record<string, VBOData> = {};

  private vertexBuffers: Record<string, VBO> = {};

  groups: MaterialGroup[] = [];

  boundingSphere?: BoundingSphere;

  constructor(
    vertexBufferData: Record<string, VBOData>,
    groups: MaterialGroup[],
    boundingSphere: BoundingSphere | undefined = undefined
  ) {
    this.vertexBufferData = vertexBufferData;
    this.groups = groups;
    this.boundingSphere = boundingSphere;
  }

  getBuffer(buffer: string) {
    if (!this.vertexBuffers[buffer]) {
      this.vertexBuffers[buffer] = new VBO(this.vertexBufferData[buffer]);
    }

    return this.vertexBuffers[buffer];
  }

  getIndexBuffer(group: number) {
    const g = this.groups[group];

    if (!g.indexBuffer) {
      g.indexBuffer = new IBO(g.indices);
    }

    return g.indexBuffer;
  }

  getAttributeSource(): AttributeSource {
    return {
      ...Object.keys(this.vertexBufferData).reduce((res, bufferName) => {
        return {
          ...res,
          [bufferName]: this.getBuffer(bufferName),
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
      const indexBuffer = this.getIndexBuffer(i);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.getBuffer(gl));

      const allUniforms = g.uniforms || {};
      Object.keys(allUniforms).forEach((uniformName) => {
        setUniform(gl, uniformMap[uniformName], allUniforms[uniformName]);
      });

      gl.drawElements(gl.TRIANGLES, g.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }
}

export default Geometry;
