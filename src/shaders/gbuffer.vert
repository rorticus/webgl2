#version 300 es
precision mediump float;

in vec3 position;
in vec3 normal;

uniform mat4 projection;
uniform mat4 world;
uniform mat4 uNormalMatrix;
uniform mat4 uNormalWorldMatrix;

out vec4 vPos;
out vec4 vNormal;

void main() {
    gl_Position = projection * world * vec4(position, 1.0);
    vPos = world * vec4(position, 1.0);
    vNormal = world * vec4(normal, 1.0);
}