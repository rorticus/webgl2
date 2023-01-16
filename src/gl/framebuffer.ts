import { RenderTarget } from "./buffers";

export interface FrameBufferColorAttachment {
  format?: number;
  target?: FrameBuffer;
  name?: string;
}
export interface FrameBufferOptions {
  color?: Record<string, FrameBufferColorAttachment>;
  depth?: boolean | FrameBuffer;
}

export class FrameBuffer {
  private colorAttachments: Record<string, RenderTarget> = {};
  private depthBuffer: RenderTarget | null = null;
  private frameBuffer: WebGLFramebuffer;
  private width: number;
  private height: number;

  constructor(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    options: FrameBufferOptions
  ) {
    this.width = width;
    this.height = height;

    Object.keys(options.color || {}).forEach((key) => {
      if (options.color?.[key].target) {
        this.colorAttachments[key] = options.color?.[
          key
        ]?.target?.getRenderTarget(options.color?.[key].name!)!;
      } else {
        this.colorAttachments[key] = new RenderTarget(
          options.color?.[key].format || 0,
          gl,
          width,
          height
        );
      }
    });

    if (options.depth === true) {
      this.depthBuffer = new RenderTarget(
        gl.DEPTH24_STENCIL8,
        gl,
        width,
        height
      );
    } else if (options.depth) {
      this.depthBuffer = options.depth.depthBuffer;
    }

    this.frameBuffer = gl.createFramebuffer()!;

    this.attach(gl);
  }

  getDepthBuffer() {
    return this.depthBuffer?.texture;
  }

  getRenderTarget(name: string) {
    return this.colorAttachments[name];
  }

  attach(gl: WebGL2RenderingContext) {
    let colorAttachments: number[] = [];

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    Object.keys(this.colorAttachments).forEach((key, index) => {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0 + index,
        gl.TEXTURE_2D,
        this.colorAttachments[key].texture,
        0
      );
      colorAttachments.push(gl.COLOR_ATTACHMENT0 + index);
    });
    if (this.depthBuffer) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.TEXTURE_2D,
        this.depthBuffer.texture,
        0
      );
    }

    gl.drawBuffers(colorAttachments.length ? colorAttachments : [gl.NONE]);

    if (!this.depthBuffer) {
      gl.readBuffer(gl.NONE);
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.trace("framebuffer is not complete");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  bind(gl: WebGL2RenderingContext) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.viewport(0, 0, this.width, this.height);
  }

  resize(gl: WebGL2RenderingContext) {
    Object.keys(this.colorAttachments).forEach((key) => {
      this.colorAttachments[key].resize(gl);
    });

    if (this.depthBuffer) {
      this.depthBuffer.resize(gl);
    }

    this.attach(gl);
  }
}
