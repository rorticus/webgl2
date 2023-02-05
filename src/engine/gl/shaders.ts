export function createVertexShader(
  gl: WebGL2RenderingContext,
  source: string
): WebGLShader {
  const shader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      `Error creating vertex shader - ${gl.getShaderInfoLog(shader)}`
    );
  }

  return shader;
}

export function createFragmentShader(
  gl: WebGL2RenderingContext,
  source: string
): WebGLShader {
  const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      `Error creating fragment shader - ${gl.getShaderInfoLog(shader)}`
    );
  }

  return shader;
}
