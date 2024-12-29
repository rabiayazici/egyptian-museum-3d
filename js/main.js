import { Scene } from './core/Scene.js';
import { ArtifactLoader } from './objects/ArtifactLoader.js';
import { EnvironmentBuilder } from './environment/EnvironmentBuilder.js';
import { WallBuilder } from './environment/WallBuilder.js';
import { AnimationManager } from './animation/AnimationManager.js';
import { PedestalManager } from './objects/PedestalManager.js';

/**
 * Main ArtGallery class that orchestrates the entire 3D museum experience
 * Manages scene setup, artifact loading, environment building, and animations
 */
class ArtGallery {
    /**
     * Initializes all necessary components of the art gallery
     */
    constructor() {
        this.scene = new Scene();
        this.artifactLoader = new ArtifactLoader(this.scene);
        this.environmentBuilder = new EnvironmentBuilder(this.scene);
        this.wallBuilder = new WallBuilder(this.scene);
        this.pedestalManager = new PedestalManager(this.scene);
        this.animationManager = new AnimationManager();

        this.init();
    }

    /**
     * Initializes the gallery environment, loads artifacts, and starts animations
     * @async
     */
    async init() {
        // Create the basic environment structure
        await this.environmentBuilder.createEnvironment();
        const wallMaterials = await this.wallBuilder.createWalls();

        // Setup pedestals and get the special pyramid material
        const pyramidMaterial = this.pedestalManager.createPedestalsAndObjects();

        // Load all 3D artifacts
        const artifacts = await this.loadArtifacts();
        
        // Configure animations for all animated materials
        this.animationManager.addAnimatables([
            ...artifacts,
            { material: pyramidMaterial },
            wallMaterials
        ]);
        
        // Start the render loop
        this.animate();
    }

    /**
     * Loads all artifacts with their specific configurations
     * @returns {Promise<Array>} Array of loaded artifacts with their materials
     */
    async loadArtifacts() {
        // Configuration for each artifact including position, rotation, and scale
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

        // Load all artifacts in parallel
        return Promise.all(
            artifactConfigs.map(config => this.artifactLoader.loadArtifact(config))
        );
    }

    /**
     * Main animation loop that updates all animated elements and renders the scene
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        this.animationManager.update(performance.now() * 0.001);
        this.scene.render();
    }
}

// Initialize the gallery when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArtGallery();
}); 