import { Vec4 } from "./vec4";

export interface IntUniform {
  type: "int";
  value: number;
}

export interface FloatUniform {
  type: "float";
  value: number;
}

export interface Vec4Uniform {
  type: "vec4";
  value: Vec4;
}

export interface Mat4Uniform {
  type: "mat4";
  value: Vec4;
}

export interface TextureUniform {
  type: "texture0" | "texture1" | "texture2";
  value: WebGLTexture;
}

export type Uniform =
  | IntUniform
  | FloatUniform
  | Vec4Uniform
  | Mat4Uniform
  | TextureUniform;
export type Uniforms = Record<string, Uniform>;

export function setUniform(
  gl: WebGL2RenderingContext,
  uniform: WebGLUniformLocation,
  value: Uniform
) {
  switch (value.type) {
    case "int":
      gl.uniform1i(uniform, value.value);
      break;
    case "float":
      gl.uniform1f(uniform, value.value);
      break;
    case "vec4":
      gl.uniform4fv(uniform, value.value);
      break;
    case "mat4":
      gl.uniformMatrix4fv(uniform, false, value.value);
      break;
    case "texture0":
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, value.value);
      gl.uniform1i(uniform, 0);
      break;
    case "texture1":
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, value.value);
      gl.uniform1i(uniform, 1);
      break;
    case "texture2":
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, value.value);
      gl.uniform1i(uniform, 2);
      break;
  }
}
