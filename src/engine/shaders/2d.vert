#version 300 es
precision mediump float;

in vec3 position;

uniform mat4 objectToWorldMatrix;
uniform float radius;

void main() {
    gl_Position = objectToWorldMatrix * vec4(position, 1.0);
    gl_PointSize = radius;
}