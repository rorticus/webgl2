import { RenderParams, RenderParamsLight } from "../types";
import { FrameBuffer } from "../gl/framebuffer";

export interface LightGBuffer {
  renderFrameBuffer: FrameBuffer;
  lightingFrameBuffer: FrameBuffer;
}

export interface LightRenderer {
  renderLight(
    gl: WebGL2RenderingContext,
    gBuffer: LightGBuffer,
    light: RenderParamsLight,
    renderParams: RenderParams
  ): void;
}
