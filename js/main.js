import { Scene } from './core/Scene.js';
import { ArtifactLoader } from './objects/ArtifactLoader.js';
import { EnvironmentBuilder } from './environment/EnvironmentBuilder.js';
import { WallBuilder } from './environment/WallBuilder.js';
import { AnimationManager } from './animation/AnimationManager.js';
import { PedestalManager } from './objects/PedestalManager.js';

class ArtGallery {
    constructor() {
        this.scene = new Scene();
        this.artifactLoader = new ArtifactLoader(this.scene);
        this.environmentBuilder = new EnvironmentBuilder(this.scene);
        this.wallBuilder = new WallBuilder(this.scene);
        this.pedestalManager = new PedestalManager(this.scene);
        this.animationManager = new AnimationManager();

        this.init();
    }

    async init() {
        // Build environment
        await this.environmentBuilder.createEnvironment();
        const wallMaterials = await this.wallBuilder.createWalls();

        // Create pedestals and get pyramid material
        const pyramidMaterial = this.pedestalManager.createPedestalsAndObjects();

        // Load artifacts
        const artifacts = await this.loadArtifacts();
        
        // Setup animations with all animated materials
        this.animationManager.addAnimatables([
            ...artifacts,
            { material: pyramidMaterial },
            wallMaterials
        ]);
        
        // Start animation loop
        this.animate();
    }

    async loadArtifacts() {
        const artifactConfigs = [
            {
                modelPath: 'characters/dagger/dagger.obj',
                texturePath: 'characters/dagger/dagger_texture.jpg',
                position: [-10, 3, -10.5],
                rotation: [0, Math.PI / 8, Math.PI / 3],
                scale: [0.0075, 0.0075, 0.0075]
            },
            {
                modelPath: 'characters/sphinx/sphinx.obj',
                texturePath: 'characters/sphinx/sphinx.jpg',
                position: [0, 2.2, -10],
                rotation: [-Math.PI / 2, 0, 0],
                scale: [0.0015, 0.0011, 0.0015]
            },
            {
                modelPath: 'characters/vase/vase.obj',
                texturePath: 'characters/vase/vase_texture.jpg',
                position: [-10, 2.18, 0],
                rotation: [-Math.PI / 2, 0, 0],
                scale: [2.2, 2.2, 2.2]
            },
            {
                modelPath: 'characters/nefertiti/nefertiti.obj',
                texturePath: 'characters/nefertiti/texture.png',
                position: [10, 2, -4],
                rotation: [0, Math.PI / 2, 0],
                scale: [8, 8, 8]
            }
        ];

        return Promise.all(
            artifactConfigs.map(config => this.artifactLoader.loadArtifact(config))
        );
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.animationManager.update(performance.now() * 0.001);
        this.scene.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArtGallery();
}); 