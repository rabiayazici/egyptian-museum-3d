import * as THREE from 'three';
import { ShaderManager } from '../shaders/ShaderManager.js';

export class PedestalManager {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    createPedestalsAndObjects() {
        // Create pedestals
        const pedestalPositions = [
            [-10, 1, -10],  // For dagger
            [0, 1, -10],    // For sphinx
            [10, -1, -10],  // For pyramid
            [-10, 1, 0],    // For vase
            [10, 1, 0],     // For Nefertiti
        ];

        this.createPedestals(pedestalPositions);
        this.createPedestalPyramid([10, -1, -10]); // Add pyramid on the third pedestal
    }

    createPedestals(positions) {
        const pedestalGeometry = new THREE.CylinderGeometry(1, 1.2, 2, 32);
        const pedestalTexture = this.textureLoader.load('pedestal/image.png');
        
        pedestalTexture.wrapS = THREE.RepeatWrapping;
        pedestalTexture.wrapT = THREE.RepeatWrapping;
        pedestalTexture.repeat.set(3, 3);

        const pedestalMaterial = new THREE.MeshStandardMaterial({ 
            map: pedestalTexture,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        positions.forEach(position => {
            const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
            pedestal.position.set(...position);
            pedestal.castShadow = true;
            pedestal.receiveShadow = true;
            this.scene.add(pedestal);
        });
    }

    createPedestalPyramid(position) {
        const pyramidTexture = this.textureLoader.load('characters/pyramid/pyramidtexture.jpeg');
        pyramidTexture.wrapS = THREE.RepeatWrapping;
        pyramidTexture.wrapT = THREE.RepeatWrapping;

        // Create shader material for the pyramid
        const pyramidMaterial = new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: pyramidTexture },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying float vHeight;
                varying vec3 vPosition;

                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vHeight = position.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D baseTexture;
                uniform float time;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vHeight;

                void main() {
                    vec2 uv = vUv;
                    float wave = sin(vPosition.y * 0.05 + time * 0.5) * 0.01;
                    uv.x += wave;
                    uv.y += wave;

                    vec4 texColor = texture2D(baseTexture, uv);
                    float highlight = pow(max(dot(vNormal, normalize(vec3(1.0, 0.5, 0.0))), 0.0), 4.0);
                    vec3 goldColor = vec3(1.0, 0.8, 0.4);
                    float heightFactor = smoothstep(0.0, 1.0, vHeight / 50.0);
                    vec3 gradientColor = mix(texColor.rgb * 0.8, texColor.rgb * 1.2, heightFactor);
                    vec3 finalColor = mix(gradientColor, goldColor, highlight * 0.3);
                    finalColor += vec3(highlight * 0.1);
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        const pyramidGeometry = new THREE.ConeGeometry(8, 12, 4);
        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        
        // Position the pyramid on top of the pedestal
        pyramid.position.set(
            position[0],
            position[1] + 3, // Adjust height above pedestal
            position[2]
        );

        pyramid.castShadow = true;
        pyramid.receiveShadow = true;
        this.scene.add(pyramid);

        // Return the material so it can be animated
        return pyramidMaterial;
    }
} 