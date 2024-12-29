export class AnimationManager {
    constructor() {
        this.animatables = [];
    }

    addAnimatables(artifacts) {
        // Convert artifacts to array of materials
        const artifactMaterials = artifacts.map(artifact => artifact.material);
        
        // Store all animatable materials
        this.animatables = [
            ...artifactMaterials,
            // Add star materials directly from the WallBuilder
            ...(artifacts.filter(a => a.starMaterials || []).flatMap(a => a.starMaterials)),
            // Add name materials if present
            ...(artifacts.filter(a => a.namesMaterial || []).flatMap(a => a.namesMaterial)),
            // Add text material if present
            artifacts.find(a => a.textMaterial)?.textMaterial
        ].filter(Boolean); // Remove any undefined values
    }

    update(time) {
        this.animatables.forEach(material => {
            if (material && material.uniforms) {
                material.uniforms.time.value = time;
            }
        });
    }
} 