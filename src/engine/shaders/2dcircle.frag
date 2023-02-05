#version 300 es
precision mediump float;

uniform vec3 color;

in vec2 center;

out vec4 fragColor;

void main() {
    if(length(center - vec2(0.5, 0.5)) > 0.5) {
        discard;
    }

    fragColor = vec4(color, 1.0);
}
