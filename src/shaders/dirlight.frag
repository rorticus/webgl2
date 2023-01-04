#version 300 es
precision highp float;

uniform sampler2D positionTexture; // position
uniform sampler2D normalTexture; // normal
uniform sampler2D diffuseTexture; // diffuse

uniform vec3 lightColor;
uniform vec3 lightDirection;
uniform float lightIntensity;

out vec4 fragColor;

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec3 position = texelFetch(positionTexture, fragCoord, 0).xyz;
    vec3 normal = normalize(texelFetch(normalTexture, fragCoord, 0).xyz);
    vec4 diffuse = vec4(texelFetch(diffuseTexture, fragCoord, 0).xyz, 1.0);
    float diffuseFactor = max(0.0, dot(normal, -lightDirection));
    vec4 diffuseLightColor = vec4(lightColor * lightIntensity * diffuseFactor, 1.0f);
    fragColor = diffuse * diffuseLightColor;
}