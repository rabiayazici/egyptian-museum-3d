import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ShaderManager } from '../shaders/ShaderManager.js';

/**
 * Handles loading and setup of 3D artifacts for the museum
 * Manages model loading, texture application, and shader setup
 */
export class ArtifactLoader {
    /**
     * Creates a new ArtifactLoader instance
     * @param {THREE.Scene} scene - The Three.js scene to add artifacts to
     */
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.objLoader = new OBJLoader();
    }

    /**
     * Loads a 3D artifact with its texture and configures its position
     * @param {Object} config - Configuration object containing model details
     * @param {string} config.modelPath - Path to the OBJ model file
     * @param {string} config.texturePath - Path to the texture file
     * @param {Array<number>} config.position - [x, y, z] position coordinates
     * @param {Array<number>} config.rotation - [x, y, z] rotation angles
     * @param {Array<number>} config.scale - [x, y, z] scale factors
     * @returns {Promise<Object>} Object containing the loaded model and its material
     */
    async loadArtifact(config) {
        const { modelPath, texturePath, position, rotation, scale } = config;
        
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                modelPath,
                (object) => {
                    // Load and apply texture with custom shader
                    const texture = this.textureLoader.load(texturePath);
                    const shaderMaterial = new THREE.ShaderMaterial({
                        uniforms: {
                            baseTexture: { value: texture },
                            time: { value: 0 }
                        },
                        ...ShaderManager.getArtifactShader()
                    });

                    // Apply transformations
                    object.scale.set(...scale);
                    object.position.set(...position);
                    if (rotation) {
                        object.rotation.set(...rotation);
                    }

                    // Configure mesh properties
                    object.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.material = shaderMaterial;
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this.scene.add(object);
                    resolve({ object, material: shaderMaterial });
                },
                undefined, // Progress callback not used
                reject
            );
        });
    }
} 