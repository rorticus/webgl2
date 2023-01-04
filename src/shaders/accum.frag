#version 300 es
precision mediump float;

uniform sampler2D positionTexture;

in vec2 vUv;

out vec4 color;

void main() {
    color = vec4(texture(positionTexture, vUv).xyz, 1.0);
}