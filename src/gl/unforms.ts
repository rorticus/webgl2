import { Vec4 } from "./vec4";
import { Vec3 } from "./vec3";

export interface BoolUniform {
  type: "bool";
  value: boolean;
}

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

export interface Vec3Uniform {
  type: "vec3";
  value: Vec3;
}

export interface Mat4Uniform {
  type: "mat4";
  value: Vec4;
}

export interface TextureUniform {
  type: "texture0" | "texture1" | "texture2" | "texture3";
  value: WebGLTexture;
}

export type Uniform =
  | IntUniform
  | FloatUniform
  | Vec4Uniform
  | Vec3Uniform
  | Mat4Uniform
  | TextureUniform
  | BoolUniform;
export type Uniforms = Record<string, Uniform>;

export function setUniform(
  gl: WebGL2RenderingContext,
  uniform: WebGLUniformLocation,
  value: Uniform
) {
  switch (value.type) {
    case "bool":
      gl.uniform1i(uniform, value.value ? 1 : 0);
      break;
    case "int":
      gl.uniform1i(uniform, value.value);
      break;
    case "float":
      gl.uniform1f(uniform, value.value);
      break;
    case "vec4":
      gl.uniform4fv(uniform, value.value);
      break;
    case "vec3":
      gl.uniform3fv(uniform, value.value);
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
    case "texture3":
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, value.value);
      gl.uniform1i(uniform, 3);
      break;
  }
}
