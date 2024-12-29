/**
 * Manages shader programs used throughout the application
 * Provides centralized access to shader code for various effects
 */
export class ShaderManager {
    /**
     * Returns shader configuration for artifacts with aging and shimmer effects
     * @returns {Object} Shader configuration with vertex and fragment shaders
     */
    static getArtifactShader() {
        return {
            vertexShader: `
                // Pass UV coordinates, normals, and positions to fragment shader
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
                // Input uniforms and varyings
                uniform sampler2D baseTexture;  // Base texture of the artifact
                uniform float time;            // Time for animation
                varying vec2 vUv;              // UV coordinates
                varying vec3 vNormal;          // Surface normal
                varying vec3 vPosition;         // Vertex position

                void main() {
                    // Sample base texture
                    vec4 texColor = texture2D(baseTexture, vUv);
                    
                    // Create animated shimmer effect based on height
                    float shimmer = sin(vPosition.y * 10.0 + time) * 0.5 + 0.5;
                    
                    // Modify shimmer based on surface normal orientation
                    shimmer *= pow(abs(dot(vNormal, vec3(0.0, 1.0, 0.0))), 2.0);
                    
                    // Define aging color tint
                    vec3 agingColor = vec3(0.8, 0.7, 0.5);
                    
                    // Mix base color with aging effect
                    vec3 finalColor = mix(texColor.rgb, agingColor, 0.2);
                    
                    // Add shimmer highlight
                    finalColor += vec3(shimmer * 0.1);
                    
                    // Output final color with original alpha
                    gl_FragColor = vec4(finalColor, texColor.a);
                }
            `
        };
    }

    // Add other shader getters...
} 