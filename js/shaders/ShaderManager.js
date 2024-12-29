export class ShaderManager {
    static getArtifactShader() {
        return {
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D baseTexture;
                uniform float time;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vec4 texColor = texture2D(baseTexture, vUv);
                    float shimmer = sin(vPosition.y * 10.0 + time) * 0.5 + 0.5;
                    shimmer *= pow(abs(dot(vNormal, vec3(0.0, 1.0, 0.0))), 2.0);
                    vec3 agingColor = vec3(0.8, 0.7, 0.5);
                    vec3 finalColor = mix(texColor.rgb, agingColor, 0.2);
                    finalColor += vec3(shimmer * 0.1);
                    gl_FragColor = vec4(finalColor, texColor.a);
                }
            `
        };
    }

    // Add other shader getters...
} 