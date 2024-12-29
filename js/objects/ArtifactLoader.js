import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ShaderManager } from '../shaders/ShaderManager.js';

export class ArtifactLoader {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.objLoader = new OBJLoader();
    }

    async loadArtifact(config) {
        const { modelPath, texturePath, position, rotation, scale } = config;
        
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                modelPath,
                (object) => {
                    const texture = this.textureLoader.load(texturePath);
                    const shaderMaterial = new THREE.ShaderMaterial({
                        uniforms: {
                            baseTexture: { value: texture },
                            time: { value: 0 }
                        },
                        ...ShaderManager.getArtifactShader()
                    });

                    object.scale.set(...scale);
                    object.position.set(...position);
                    if (rotation) {
                        object.rotation.set(...rotation);
                    }

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
                undefined,
                reject
            );
        });
    }
} 