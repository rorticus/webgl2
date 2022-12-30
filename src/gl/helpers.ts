export function drawWebglTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture
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
  const dest = new Float32Array(
    4 * gl.drawingBufferWidth * gl.drawingBufferHeight
  );
  gl.readPixels(
    0,
    0,
    gl.drawingBufferWidth,
    gl.drawingBufferHeight,
    gl.RGBA,
    gl.FLOAT,
    dest
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const canvas = document.createElement("canvas");
  canvas.width = gl.drawingBufferWidth;
  canvas.height = gl.drawingBufferHeight;
  canvas.style.width = "400px";
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(
    gl.drawingBufferWidth,
    gl.drawingBufferHeight
  );
  imageData.data.set(dest.map((d) => d * 255));
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}
