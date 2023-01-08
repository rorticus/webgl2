import { GBuffer } from "../../gl/buffers";
import { RenderParams, RenderParamsLight } from "../types";

export interface LightRenderer {
  renderLight(
    gl: WebGL2RenderingContext,
    gBuffer: GBuffer,
    light: RenderParamsLight,
    renderParams: RenderParams
  ): void;
}
