#version 300 es
precision highp float;

uniform sampler2D positionTexture; // position
uniform sampler2D normalTexture; // normal
uniform sampler2D diffuseTexture; // diffuse
uniform sampler2D shadowTexture; // shadows

uniform vec3 cameraPosition;
uniform vec3 lightColor;
uniform vec3 lightDirection;
uniform float lightIntensity;
uniform mat4 lightViewMatrix;
uniform mat4 lightProjectionMatrix;
uniform mat4 invWorld;
uniform mat4 world;
uniform bool shadowed;

out vec4 fragColor;

float linstep(float low, float high, float v) {
    return clamp((v - low) / (high - low), 0.0, 1.0);
}

float sampleVarianceShadowMap(vec2 coords, float depth) {
    vec2 moments = texture(shadowTexture, coords).xy;

    float p = step(depth, moments.x);
    float variance = max(moments.y - moments.x * moments.x, 0.00002);
    float d = depth - moments.x;
    float q = linstep(0.6, 1.0, variance / (variance + d * d));

    return min(max(p, q), 1.0);
}

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec3 position = texelFetch(positionTexture, fragCoord, 0).xyz;
    vec3 normal = normalize(texelFetch(normalTexture, fragCoord, 0).xyz);
    vec4 diffuse = vec4(texelFetch(diffuseTexture, fragCoord, 0).xyz, 1.0);

    float shadowFactor = 1.0;

    if (shadowed) {
        vec4 lightPosition = lightProjectionMatrix * lightViewMatrix * invWorld * vec4(position, 1.0);
        lightPosition /= lightPosition.w;

        vec2 textureCoordinates = lightPosition.xy * vec2(0.5, 0.5) + vec2(0.5, 0.5);
        shadowFactor = max(0.5, sampleVarianceShadowMap(textureCoordinates, lightPosition.z * 0.5 + 0.5));
    }

    float diffuseFactor = max(0.0, dot(lightDirection, normal));
    vec4 diffuseLightColor = vec4(lightColor * lightIntensity * diffuseFactor, 1.0f);
    fragColor = diffuse * diffuseLightColor * shadowFactor;
}