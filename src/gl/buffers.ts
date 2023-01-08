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

  constructor(
    public type: number,
    gl: WebGL2RenderingContext,
    width: number | null = null,
    height: number | null = null
  ) {
    this.width = width;
    this.height = height;

    this.resize(gl);
  }

  resize(gl: WebGL2RenderingContext) {
    this.texture && gl.deleteTexture(this.texture);

    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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

export class GBuffer {
  position: RenderTarget;
  normal: RenderTarget;
  depth: RenderTarget;
  color: RenderTarget;
  accum: RenderTarget;
  shadowDepth: RenderTarget;

  renderFrameBuffer: WebGLFramebuffer;
  lightingFrameBuffer: WebGLFramebuffer;
  shadowFrameBuffer: WebGLFramebuffer;

  constructor(gl: WebGL2RenderingContext) {
    this.position = new RenderTarget(gl.RGBA32F, gl);
    this.normal = new RenderTarget(gl.RGBA32F, gl);
    this.color = new RenderTarget(gl.RGBA32F, gl);
    this.depth = new RenderTarget(gl.DEPTH24_STENCIL8, gl);
    this.accum = new RenderTarget(gl.RGBA32F, gl);
    this.shadowDepth = new RenderTarget(gl.DEPTH24_STENCIL8, gl);

    this.renderFrameBuffer = gl.createFramebuffer()!;
    this.lightingFrameBuffer = gl.createFramebuffer()!;
    this.shadowFrameBuffer = gl.createFramebuffer()!;

    this.resize(gl);
  }

  resize(gl: WebGL2RenderingContext) {
    this.position.resize(gl);
    this.normal.resize(gl);
    this.depth.resize(gl);
    this.color.resize(gl);
    this.shadowDepth.resize(gl);

    // render frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFrameBuffer);

    // position
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.position.texture,
      0
    );

    // normal
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT1,
      gl.TEXTURE_2D,
      this.normal.texture,
      0
    );

    // color
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT2,
      gl.TEXTURE_2D,
      this.color.texture,
      0
    );

    // accum
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT3,
      gl.TEXTURE_2D,
      this.accum.texture,
      0
    );

    // depth
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.depth.texture,
      0
    );

    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1,
      gl.COLOR_ATTACHMENT2,
      gl.COLOR_ATTACHMENT3,
    ]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // lighting frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightingFrameBuffer);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.accum.texture,
      0
    );
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // shadow frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFrameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.shadowDepth.texture,
      0
    );
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
