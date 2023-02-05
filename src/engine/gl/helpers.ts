import { FrameBuffer } from "./framebuffer";
import Material from "./material";
import Model from "./model";
import { createQuad } from "./quad";
import { Uniforms } from "./unforms";

export function drawWebglTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  width: number,
  height: number
) {
  const frameBuffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  const dest = new Float32Array(4 * width * height);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, dest);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const flipped = new Float32Array(4 * width * height);
  for (let y = 0; y < height / 2; y++) {
    const idx = y * width * 4;
    const idx2 = (height - y - 1) * width * 4;

    flipped.set(dest.slice(idx, idx + width * 4), idx2);
    flipped.set(dest.slice(idx2, idx2 + width * 4), idx);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = "400px";
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(flipped.map((d) => d * 255));
  ctx.scale(1, -1);
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

const quad = createQuad();

export function applyFilter(
  gl: WebGL2RenderingContext,
  material: Material,
  source: WebGLTexture,
  dest: FrameBuffer | null,
  uniforms: Uniforms = {}
) {
  if (!dest) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  } else {
    dest.bind(gl);
  }

  const model = new Model(quad, material);
  model.prepare(gl, {
    tex0: { type: "texture0", value: source },
    ...uniforms,
  });
  model.draw(gl);
}
