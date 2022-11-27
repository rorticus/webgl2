export const PositionBuffer = "position";
export const IndexBuffer = "indices";
export const NormalBuffer = "normal";

export interface AttributeSource {
  [key: string]: WebGLBuffer;
}

export class VBO {
  data: Float32Array;
  dirty: boolean;
  buff: WebGLBuffer | null;

  constructor(data: Float32Array) {
    this.data = data;
    this.dirty = true;
    this.buff = null;
  }

  getBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    if (this.dirty) {
      if (!this.buff) {
        this.buff = gl.createBuffer()!;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buff);
      gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      this.dirty = false;
    }

    return this.buff!;
  }
}

export class IBO {
  data: Uint16Array;
  dirty: boolean;
  buff: WebGLBuffer | null;

  constructor(data: Uint16Array) {
    this.data = data;
    this.dirty = true;
    this.buff = null;
  }

  getBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    if (this.dirty) {
      if (!this.buff) {
        this.buff = gl.createBuffer()!;
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

      this.dirty = false;
    }

    return this.buff!;
  }
}
