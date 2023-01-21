#version 300 es
precision mediump float;

uniform sampler2D tex0;

in vec2 vUv;

out vec4 color;

void main() {
    color = vec4(texture(tex0, vUv).xyz, 1.0);
}