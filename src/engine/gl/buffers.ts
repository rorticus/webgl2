export const PositionBuffer = "position";
export const IndexBuffer = "indices";
export const NormalBuffer = "normal";

export interface AttributeSource {
  [key: string]: VBO;
}

interface Vec3VertexData {
  type: "vec3";
  data: Float32Array;
}

interface Vec2VertexData {
  type: "vec2";
  data: Float32Array;
}

export type VBOData = Vec3VertexData | Vec2VertexData;

export class VBO {
  data: VBOData;
  dirty: boolean;
  buff: WebGLBuffer | null;

  constructor(data: VBOData) {
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
      gl.bufferData(gl.ARRAY_BUFFER, this.data.data, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      this.dirty = false;
    }

    return this.buff!;
  }

  bindToAttribute(gl: WebGL2RenderingContext, attributePosition: number) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.getBuffer(gl));

    switch (this.data.type) {
      case "vec3":
        gl.vertexAttribPointer(attributePosition, 3, gl.FLOAT, false, 0, 0);
        break;
      case "vec2":
        gl.vertexAttribPointer(attributePosition, 2, gl.FLOAT, false, 0, 0);
        break;
    }

    gl.enableVertexAttribArray(attributePosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
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

export class RenderTarget {
  texture!: WebGLTexture;
  width: number | null;
  height: number | null;
  filter: number;

  constructor(
    public type: number,
    gl: WebGL2RenderingContext,
    width: number | null = null,
    height: number | null = null,
    filter: number = gl.NEAREST
  ) {
    this.width = width;
    this.height = height;
    this.filter = filter;

    this.resize(gl);
  }

  resize(gl: WebGL2RenderingContext) {
    this.texture && gl.deleteTexture(this.texture);

    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texStorage2D(
      gl.TEXTURE_2D,
      1,
      this.type,
      this.width || gl.drawingBufferWidth,
      this.height || gl.drawingBufferHeight
    );

    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
