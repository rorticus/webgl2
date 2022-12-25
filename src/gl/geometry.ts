import { AttributeSource, IBO, IndexBuffer, VBO } from "./buffers";

class Geometry {
  indices: Uint16Array = new Uint16Array();
  vertexBufferData: Record<string, Float32Array> = {};

  private vertexBuffers: Record<string, VBO> = {};
  private indexBuffer: IBO | null = null;

  constructor(
    vertexBufferData: Record<string, Float32Array>,
    indices: Uint16Array
  ) {
    this.vertexBufferData = vertexBufferData;
    this.indices = indices;
  }

  getBuffer(buffer: string, gl: WebGL2RenderingContext) {
    if (!this.vertexBuffers[buffer]) {
      this.vertexBuffers[buffer] = new VBO(this.vertexBufferData[buffer]);
    }

    return this.vertexBuffers[buffer].getBuffer(gl);
  }

  getIndexBuffer(gl: WebGL2RenderingContext) {
    if (!this.indexBuffer) {
      this.indexBuffer = new IBO(this.indices);
    }

    return this.indexBuffer.getBuffer(gl);
  }

  getAttributeSource(gl: WebGL2RenderingContext): AttributeSource {
    return {
      [IndexBuffer]: this.getIndexBuffer(gl),
      ...Object.keys(this.vertexBufferData).reduce((res, bufferName) => {
        return {
          ...res,
          [bufferName]: this.getBuffer(bufferName, gl),
        };
      }, {}),
    };
  }

  draw(gl: WebGL2RenderingContext) {
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}

export default Geometry;
