#version 300 es
precision highp float;

uniform sampler2D positionTexture;
uniform sampler2D normalTexture;
uniform sampler2D diffuseTexture;
uniform mat4 invWorld;

uniform vec3 lightColor;
uniform float lightIntensity;
out vec4 fragColor;

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec4 positionTexel = texelFetch(positionTexture, fragCoord, 0);
    vec4 normalTexel = texelFetch(normalTexture, fragCoord, 0);
    vec4 position = vec4(positionTexel.xyz, 1.0);
    vec3 normal = normalize(normalTexel.xyz);
    vec4 diffuse = vec4(texelFetch(diffuseTexture, fragCoord, 0).xyz, 1.0);

    // Determine normals, position, direction in light space.
    // The light is at (0, 0, 0) in light space, so the direction is the same as the surface's
    // position in light space.
    vec3 lightDirection = (invWorld * position).xyz;
    float lightDistanceSq = dot(lightDirection, lightDirection);
    vec3 lightDirectionNormalized = normalize(lightDirection);

    // Calculate attenuation.
    float attenuation = max(0.0, 1.0 - lightDistanceSq);
    attenuation *= attenuation;

    // Diffuse
    float diffuseFactor = max(0.0, dot(normal.xyz, -lightDirectionNormalized));
    vec3 diffuseLightColor = lightColor * lightIntensity * diffuseFactor * attenuation;

    // Total
    fragColor = diffuse * vec4(diffuseLightColor, 1.0);
    //fragColor = vec4(normalLightSpace, 1.0);
}