import * as THREE from 'three';

export class EnvironmentBuilder {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    async createEnvironment() {
        this.createDesertGround();
        this.createPyramids();
    }

    createDesertGround() {
        const desertTexture = this.textureLoader.load('image.png');
        desertTexture.wrapS = THREE.RepeatWrapping;
        desertTexture.wrapT = THREE.RepeatWrapping;
        desertTexture.repeat.set(20, 20);
        
        const desertGeometry = new THREE.PlaneGeometry(2000, 2000);
        const desertMaterial = new THREE.MeshStandardMaterial({
            map: desertTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const desert = new THREE.Mesh(desertGeometry, desertMaterial);
        desert.rotation.x = -Math.PI / 2;
        desert.position.y = -0.5;
        desert.receiveShadow = true;
        this.scene.add(desert);
    }

    createPyramids() {
        const pyramidTexture = this.textureLoader.load('characters/pyramid/pyramidtexture.jpeg');
        pyramidTexture.wrapS = THREE.RepeatWrapping;
        pyramidTexture.wrapT = THREE.RepeatWrapping;

        const pyramidMaterial = new THREE.MeshStandardMaterial({
            map: pyramidTexture,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });

        const pyramidGeometry = new THREE.ConeGeometry(90, 90, 4);

        const pyramidPositions = [
            [100, 40, -100],
            [-100, 40, -100],
            [0, 40, -200]
        ];

        pyramidPositions.forEach(position => {
            const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
            pyramid.position.set(...position);
            pyramid.castShadow = true;
            pyramid.receiveShadow = true;
            this.scene.add(pyramid);
        });
    }

 
} 