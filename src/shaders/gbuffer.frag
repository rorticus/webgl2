#version 300 es
precision mediump float;

uniform vec3 diffuse;
uniform vec3 emissive;
in vec4 vPos;
in vec4 vNormal;

layout (location = 0) out vec4 fragPosition;
layout (location = 1) out vec4 fragNormal;
layout (location = 2) out vec4 fragDiffuse;
layout (location = 3) out vec4 fragAccumulation;

void main() {
    fragPosition = vec4(vPos.xyz, 1.0);
    fragNormal = vec4(vNormal.xyz, 1.0);
    fragDiffuse = vec4(diffuse, 1.0);
    fragAccumulation = vec4(emissive, 1.0);
}