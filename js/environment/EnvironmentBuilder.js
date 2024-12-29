import * as THREE from 'three';

/**
 * Responsible for creating the environment surrounding the museum
 * Handles desert ground and background pyramid creation
 */
export class EnvironmentBuilder {
    /**
     * Creates a new EnvironmentBuilder instance
     * @param {THREE.Scene} scene - The Three.js scene to add environment elements to
     */
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    /**
     * Creates the complete environment setup
     * @async
     */
    async createEnvironment() {
        this.createDesertGround();
        this.createPyramids();
    }

    /**
     * Creates the desert ground plane with appropriate texture
     */
    createDesertGround() {
        // Load and configure desert texture
        const desertTexture = this.textureLoader.load('image.png');
        desertTexture.wrapS = THREE.RepeatWrapping;
        desertTexture.wrapT = THREE.RepeatWrapping;
        desertTexture.repeat.set(20, 20);
        
        // Create ground plane with desert material
        const desertGeometry = new THREE.PlaneGeometry(2000, 2000);
        const desertMaterial = new THREE.MeshStandardMaterial({
            map: desertTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Position and configure ground plane
        const desert = new THREE.Mesh(desertGeometry, desertMaterial);
        desert.rotation.x = -Math.PI / 2;
        desert.position.y = -0.5;
        desert.receiveShadow = true;
        this.scene.add(desert);
    }

    /**
     * Creates background pyramids in the distance
     */
    createPyramids() {
        // Load and configure pyramid texture
        const pyramidTexture = this.textureLoader.load('characters/pyramid/pyramidtexture.jpeg');
        pyramidTexture.wrapS = THREE.RepeatWrapping;
        pyramidTexture.wrapT = THREE.RepeatWrapping;

        // Create pyramid material
        const pyramidMaterial = new THREE.MeshStandardMaterial({
            map: pyramidTexture,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });

        // Create pyramid geometry
        const pyramidGeometry = new THREE.ConeGeometry(90, 90, 4);

        // Define pyramid positions in the scene
        const pyramidPositions = [
            [100, 40, -100],  // Right pyramid
            [-100, 40, -100], // Left pyramid
            [0, 40, -200]     // Center pyramid
        ];

        // Create and position each pyramid
        pyramidPositions.forEach(position => {
            const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
            pyramid.position.set(...position);
            pyramid.castShadow = true;
            pyramid.receiveShadow = true;
            this.scene.add(pyramid);
        });
    }
} 