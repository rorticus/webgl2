#version 300 es
precision mediump float;

in vec3 position;
in vec2 radius;

uniform mat4 objectToWorldMatrix;

out vec2 center;

void main() {
    center = radius;
    gl_Position = objectToWorldMatrix * vec4(position, 1.0);
}