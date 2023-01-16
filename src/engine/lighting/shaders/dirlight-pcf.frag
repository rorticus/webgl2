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

        // Sample the depth value from the shadow map
        const float delta = 0.005;
        const float bias = 0.005;

        float shadowDepthMid = texture(shadowTexture, textureCoordinates).r;
        float shadowDepthTop = texture(shadowTexture, textureCoordinates - vec2(0, delta)).r;
        float shadowDepthBottom = texture(shadowTexture, textureCoordinates + vec2(0, delta)).r;
        float shadowDepthLeft = texture(shadowTexture, textureCoordinates - vec2(delta, 0)).r;
        float shadowDepthRight = texture(shadowTexture, textureCoordinates + vec2(delta, 0)).r;

        float shadowDepth = (shadowDepthMid + shadowDepthTop + shadowDepthBottom + shadowDepthLeft + shadowDepthRight) / 5.0;

        // Calculate the shadow factor
        shadowFactor = shadowDepth < ((lightPosition.z + bias) * 0.5 + 0.5) ? 0.5 : 1.0;
    }

    float diffuseFactor = max(0.0, dot(normal, -lightDirection));
    vec4 diffuseLightColor = vec4(lightColor * lightIntensity * diffuseFactor, 1.0f);
    fragColor = diffuse * diffuseLightColor * shadowFactor;
}