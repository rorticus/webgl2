#version 300 es
precision mediump float;

uniform sampler2D tex0;
uniform vec2 blurScale;

in vec2 vUv;

out vec4 fragColor;

void main() {
    vec4 color = vec4(0.0);

    color += texture(tex0, vUv + vec2(-3.0) * blurScale) * (1.0 / 64.0);
    color += texture(tex0, vUv + vec2(-2.0) * blurScale) * (6.0 / 64.0);
    color += texture(tex0, vUv + vec2(-1.0) * blurScale) * (15.0 / 64.0);
    color += texture(tex0, vUv + vec2(0.0) * blurScale) * (20.0 / 64.0);
    color += texture(tex0, vUv + vec2(1.0) * blurScale) * (15.0 / 64.0);
    color += texture(tex0, vUv + vec2(2.0) * blurScale) * (6.0 / 64.0);
    color += texture(tex0, vUv + vec2(3.0) * blurScale) * (1.0 / 64.0);

    fragColor = color;
}